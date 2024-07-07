import * as Yup from 'yup';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
// api
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function AuthRegisterForm() {
  const { register } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (register) {
        const name = `${data.firstName} ${data.lastName}`;
        const response = await axios.get(`/teams/${data.email}/signupCheck?name=${name}`);

        if (response.status === 200) {
          await register(data.email, data.password, data.firstName, data.lastName);          
        } else if (response.status === 201 && response.data && response.data?.team) {
          const company = response.data?.team.companyName;
          const teamId = response.data?.team._id;
          const role = response.data?.member?.role;
          const type = response.data?.member?.type;
          const memberId = response.data?.member?._id;
          await register(data.email, data.password, data.firstName, data.lastName, teamId, company, role, type, memberId);
        }
      }
    } catch (error) {
      console.log(error);
      let errorMessage = 'Error signing in. Please try again later.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "A User with this email already exits";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many signup requests. Please try again later.";
          break;
        case 'auth/unauthorized':
          errorMessage = error.message;
          break;
        case 'auth/missing fields':
          errorMessage = error.message;
          break;
        case 'auth/weak-password':
          errorMessage = "Weak Password";
          break;
        default:
          break;
      }

      setError('afterSubmit', {
        ...error,
        message: errorMessage,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField name="firstName" label="First name" />
          <RHFTextField name="lastName" label="Last name" />
        </Stack>

        <RHFTextField name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> Password must be
              minimum 6+
            </Stack>
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting || isSubmitSuccessful}
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
          }}
        >
          Create account
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

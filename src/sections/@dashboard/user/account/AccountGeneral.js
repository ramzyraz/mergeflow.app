import * as Yup from 'yup';
// next
import { useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack, Typography, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// utils
import { fData } from '../../../../utils/formatNumber';
// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from '../../../../components/hook-form';
// api
import axios from '../../../../utils/axios';
// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { user, updateUserProfile } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    role: Yup.string().required('Role is required'),
    company: Yup.string(),
    phoneNumber: Yup.string(),
    photoURL: Yup.mixed().nullable(),
  });

  const defaultValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    role: user?.role || '',
    company: user?.company || '',
    photoURL: user?.photoURL || null,
    phoneNumber: user?.phoneNumber || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (user.type === "admin") {
        await updateUserProfile(data);
        enqueueSnackbar('Update success!');
      } else {
        const response = await axios.put(`/members/${user.email}/updateProfile?teamId=${user.teamId}`, {
          ...data,
        });

        if (response.status === 200 || response.code === 'update/not a member') {
          await updateUserProfile(data);
          enqueueSnackbar('Update success!');          
        } else {
          console.error('Failed to update the member details.');
        }   
      }
    } catch (error) {
      console.error(error);

      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="displayName" label="Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phoneNumber" label="Phone Number" />
              <RHFTextField name="role" label="Role" />
              <RHFTextField name="company" label="Company" disableField style={{ fontWeight: "bold" }} />
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

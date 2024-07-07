import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from '../../../components/snackbar';
import { PATH_DASHBOARD } from '../../../routes/paths';
import axios from '../../../utils/axios';
// ----------------------------------------------------------------------

GroupEditForm.propTypes = {
  isEdit: PropTypes.bool,
  members: PropTypes.array,
  teamId: PropTypes.string,
  currentGroup: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    teamId: PropTypes.string,
    members: PropTypes.array,
  }),
};

// ----------------------------------------------------------------------

export default function GroupEditForm({ isEdit = false, members, teamId, currentGroup }) {
  const defaultName = currentGroup?.name || '';
  const defaultMembers = currentGroup?.members || [];
  const memberObjects = defaultMembers
    .map((memberId) => members.find((member) => member._id === memberId))
    .filter(Boolean);

  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();
  const {
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: defaultName,
      members: memberObjects,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const memberIds = data && data?.members && data?.members?.length > 0 ? data?.members.map((member) => member._id) : [];
        const response = await axios.put(`/groups/${currentGroup._id}?teamId=${currentGroup.teamId}`, {
          ...data,
          members: memberIds
        });

        if (response.status === 200) {
          enqueueSnackbar('Group updated successfully!');
          push(PATH_DASHBOARD.user.list);
        } else {
          enqueueSnackbar(response.error, { variant: "error" });
        }
      } else {
        const memberIds = data && data?.members && data?.members?.length > 0 ? data?.members.map((member) => member._id) : [];
        const response = await axios.post('/groups/create', {
          ...data,
          teamId,
          members: memberIds
        });

        if (response.status === 201) {
          enqueueSnackbar('Group created successfully!');
          push(PATH_DASHBOARD.user.list);
        } else {
          enqueueSnackbar(response.error, { variant: "error" });
        }
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
            >
              <Controller
                name="name" // Specify the field name
                control={control} // Pass the control object
                render={({ field }) => (
                  <TextField label="Name" {...field} />
                )}
              />
              <Controller
                name="members"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    id="members-autocomplete"
                    value={value}
                    options={members || []}
                    getOptionLabel={(option) => option?.name}
                    onChange={(_, newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Select Members" 
                        placeholder='Members'
                      />
                    )}
                  />
                )}
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <Button
                type="submit" // Specify the type of button
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </Stack>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
};

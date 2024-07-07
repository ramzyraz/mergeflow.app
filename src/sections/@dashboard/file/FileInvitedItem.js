import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  Divider,
  Tooltip,
  ListItem,
  MenuItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import ConfirmDialog from '../../../components/confirm-dialog';
import { useSnackbar } from '../../../components/snackbar';
import axios from '../../../utils/axios';
// ----------------------------------------------------------------------

FileInvitedItem.propTypes = {
  person: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  currentPermission: PropTypes.string,
  documentId: PropTypes.string,
  teamId: PropTypes.string,
};

export default function FileInvitedItem({ person, currentPermission, documentId, teamId }) {
  const [permission, setPermission] = useState(currentPermission);
  const [openPopover, setOpenPopover] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmDel, setOpenConfirmDel] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleOpenConfirm = (newPermission) => {
    if (permission !== newPermission) {
      setOpenConfirm(true);
      setPermission(newPermission);
    } 
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenConfirmDel = () => {
    setOpenConfirmDel(true);
  }

  const handleCloseConfirmDel = () => {
    setOpenConfirmDel(false);
  };
  
  const handleChangePermission = async (newPermission) => {
    try {
      const response = await axios.put(`/documents/${documentId}/permission`, {
        teamId,
        newPermission,
        memberId: person._id,
      });

      if (response.status === 200) {
        enqueueSnackbar("Permission updated successfully!");
      } else {
        console.log("Failed to share the document");
      }

      handleClosePopover();

    } catch (error) {
      console.error('Error updating the document permission:', error);
    }
  }

  const handleRemoveMember = async () => {
    try {
      const response = await axios.put(`/documents/${documentId}/revoke`, {
        memberId: person._id,
      });

      if (response.status === 200) {
        enqueueSnackbar("Unshared document successfully!");
        // const teamId = user.teamId || '';
        // mutate(`/documents?teamId=${teamId}`)
      } else {
        console.log("Failed to unshare the document");
      }

      handleClosePopover();

    } catch (error) {
      console.error('Error removing the member from shared document:', error);
    }
  }

  return (
    <>
      <ListItem disableGutters>
        <ListItemAvatar>
          <Avatar alt={person?.name} src={person?.avatarUrl} />
        </ListItemAvatar>

        <ListItemText
          primary={person?.name}
          secondary={
            <Tooltip title={person?.email}>
              <span>{person?.email}</span>
            </Tooltip>
          }
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          sx={{ flexGrow: 1, pr: 1 }}
        />

        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon={openPopover ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
          onClick={handleOpenPopover}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
            ...(openPopover && {
              bgcolor: 'action.selected',
            }),
          }}
        >
          Can {permission}
        </Button>
      </ListItem>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 160 }}>
        <>
          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenConfirm("view");
            }}
            sx={{
              ...(permission === 'view' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:eye-fill" />
            Can view
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenConfirm("edit");
            }}
            sx={{
              ...(permission === 'edit' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:edit-fill" />
            Can edit
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              handleOpenConfirmDel();
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            Remove
          </MenuItem>
        </>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Change Permission"
        content={
          <>
            Are you sure want to change the permission of this member?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleChangePermission(permission);
              handleCloseConfirm();
            }}
          >
            Change
          </Button>
        }
      />

      <ConfirmDialog
        open={openConfirmDel}
        onClose={handleCloseConfirmDel}
        title="Remove member's shared access"
        content={
          <>
            Are you sure want to remove the member&apos;s access with the shared document?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleRemoveMember();
              handleCloseConfirmDel();
            }}
          >
            Remove
          </Button>
        }
      />
    </>
  );
}

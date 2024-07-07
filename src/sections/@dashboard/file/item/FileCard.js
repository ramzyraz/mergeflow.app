import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Box, Card, Stack, Button, Divider, MenuItem, Checkbox, IconButton } from '@mui/material';
// hooks
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// utils
import { fDateTime } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// config
import { PATH_AUTH } from '../../../../routes/paths';
import { BASE_URL } from '../../../../config';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { useSnackbar } from '../../../../components/snackbar';
import TextMaxLine from '../../../../components/text-max-line';
import FileThumbnail from '../../../../components/file-thumbnail';
import ConfirmDialog from '../../../../components/confirm-dialog';
import PermissionDialog from '../../../../components/permission-dialog';
//
import FileShareDialog from '../portal/FileShareDialog';
import FileDetailsDrawer from '../portal/FileDetailsDrawer';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
import axios from '../../../../utils/axios';
// ----------------------------------------------------------------------

FileCard.propTypes = {
  sx: PropTypes.object,
  file: PropTypes.object,
  isFile: PropTypes.bool,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  onFavorite: PropTypes.func,
};

export default function FileCard({ file, isFile, selected, onSelect, onDelete, onFavorite, sx, ...other }) {

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const { copy } = useCopyToClipboard();

  const [inviteEmail, setInviteEmail] = useState('');

  const [showCheckbox, setShowCheckbox] = useState(false);

  const [openShare, setOpenShare] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);

  const [favorited, setFavorited] = useState(file.isFavorited);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const shared = file.sharedWith || [];

  const findMemberPermission = shared && !!shared.length && shared.find(item => item?.member?.email === user.email);
  const editAccess = findMemberPermission && findMemberPermission?.permission === "edit";
  const hasPermission = !!(user.type === "admin" || editAccess);

  const handleFavorite = (value) => {
    setFavorited(value);
  };

  const handleOpenConfirm = () => {
    if (!hasPermission) {
      handleOpenDialog();
    } else {
      setOpenConfirm(true);
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleShowCheckbox = () => {
    setShowCheckbox(true);
  };

  const handleHideCheckbox = () => {
    setShowCheckbox(false);
  };

  const handleOpenShare = () => {
    if (!hasPermission) {
      handleOpenDialog();
    } else {
      setOpenShare(true);
    }
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  const handleCopy = () => {
    enqueueSnackbar('Copied!');
    copy(file.url);
  };

  const handleShareClick = async (groupId) => {
    try {
      const response = await axios.put(`/documents/${file._id}/share`, {
        groupId,
        teamId: user.teamId,
        userEmail: inviteEmail,
        invitationLink: BASE_URL + PATH_AUTH.register,
      });

      if (response.status === 200) {
        if (response?.data?.groups && response?.data?.groups?.length > 0) {
          enqueueSnackbar("Members of this group have been invited!");
        } else {
          enqueueSnackbar("Invitation email sent successfully!");
        }
      } 

      handleCloseShare();
      setInviteEmail('');

    } catch (error) {
      console.error('Error sharing the document:', error);
    }
  };

  const handleRevokeAccess = async (groupId) => {
    try {
      const response = await axios.delete(`/documents/${file._id}/revoke`, {
        data: {
          groupId,
          teamId: user.teamId,
          userEmail: inviteEmail,
        }
      });

      if (response.status === 200) {
        enqueueSnackbar("Document access revoked!");
      } else {
        enqueueSnackbar("Failed to unshare the document");
      }
    } catch (error) {
      console.error('Error removing the member from shared document:', error);
    }
  }

  return (
    <>
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 2.5,
          width: 1,
          maxWidth: 222,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
      >
        {(showCheckbox || selected) && onSelect ? (
          <Checkbox
            checked={selected}
            onClick={onSelect}
            icon={<Iconify icon="eva:radio-button-off-fill" />}
            checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          />
        ) : (
          <FileThumbnail file={file.type} sx={{ width: 40, height: 40 }} />
        )}

        <TextMaxLine
          variant="subtitle2"
          persistent
          sx={{ mt: 2, mb: 0.5 }}
        >
          {file.name}
        </TextMaxLine>

        <Stack
          spacing={0.75}
          direction="row"
          alignItems="center"
          sx={{ typography: 'caption', color: 'text.disabled', mt: 0.5 }}
        >
          <Box> {fData(file.size)} </Box>

          <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }} />

          <Box> {fDateTime(file.dateModified)} </Box>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          {!isFile && (
            <Checkbox
              color="warning"
              icon={<Iconify icon="eva:star-outline" />}
              checkedIcon={<Iconify icon="eva:star-fill" />}
              checked={favorited}
              onChange={() => onFavorite(file._id, favorited, handleFavorite)}
              sx={{ p: 0.75 }}
            />
          )}

          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Card>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            handleClosePopover();
            handleCopy();
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          Copy Link
        </MenuItem>

        {!isFile && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleOpenShare();
            }}
          >
            <Iconify icon="eva:share-fill" />
            Share
          </MenuItem>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem>
      </MenuPopover>

      <FileDetailsDrawer
        item={file}
        shared={shared}
        favorited={favorited}
        onFavorite={handleFavorite}
        onCopyLink={handleCopy}
        open={openDetails}
        onClose={handleCloseDetails}
        onDelete={() => {
          handleCloseDetails();
          onDelete();
        }}
      />

      <FileShareDialog
        open={openShare}
        shared={shared}
        teamId={user.teamId}
        sharedGroups={file.groups}
        documentId={file._id}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onCopyLink={handleCopy}
        onShareClick={handleShareClick}
        onRevokeClick={handleRevokeAccess}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Delete
          </Button>
        }
      />

      <PermissionDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        title="Permission Error"
        content={
          <>
            You do not have the sufficient permission to perform this task.
          </>
        }
      />
    </>
  );
}

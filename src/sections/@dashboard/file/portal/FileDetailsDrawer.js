import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  Button,
  Divider,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { mutate } from 'swr';
// utils
import { fData } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import FileThumbnail, { fileFormat } from '../../../../components/file-thumbnail';
import { useSnackbar } from '../../../../components/snackbar';
//
import FileShareDialog from './FileShareDialog';
import FileInvitedItem from '../FileInvitedItem';
import FileGroupInvitedItem from '../FileGroupInvitedItem';
// api and uth
import axios from '../../../../utils/axios';
import { useAuthContext } from '../../../../auth/useAuthContext';
// Config
import { BASE_URL } from '../../../../config';
import { PATH_AUTH } from '../../../../routes/paths';
// ----------------------------------------------------------------------

FileDetailsDrawer.propTypes = {
  open: PropTypes.bool,
  item: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  favorited: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onFavorite: PropTypes.func,
  shared: PropTypes.array,
};

export default function FileDetailsDrawer({
  item,
  open,
  favorited,
  shared,
  //
  onFavorite,
  onCopyLink,
  onClose,
  onDelete,
  ...other
}) {
  const { name, size, url, type, dateModified, groups } = item;
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const hasShared = shared && !!shared.length;
  const hasSharedWithGroup = groups && !!groups.length;
  const maxTags = 3;

  const [openShare, setOpenShare] = useState(false);

  const [toggleTags, setToggleTags] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');

  const [tags, setTags] = useState(item.tags.slice(0, maxTags));

  const [toggleProperties, setToggleProperties] = useState(true);


  const handleToggleTags = () => {
    setToggleTags(!toggleTags);
  };

  const handleToggleProperties = () => {
    setToggleProperties(!toggleProperties);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  const handleTags = async () => {
    try {
      const response = await axios.put(`/documents/${item._id}/tags`, {
        tags
      });

      if (response.status === 200) {
        await mutate(`/documents?teamId=${user.teamId}&userEmail=${user.email}`);
        enqueueSnackbar("Tags Added");
      } else {
        enqueueSnackbar("Failed to update the tags");
      }
    } catch (error) {
      console.error('Error updating the tags:', error);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }

  const handleShareClick = async (groupId) => {
    try {
      const response = await axios.put(`/documents/${item._id}/share`, {
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

      await mutate(`/documents?teamId=${user.teamId}&userEmail=${user.email}`);
      handleCloseShare();
      setInviteEmail('');

    } catch (error) {
      console.error('Error sharing the document:', error);
    }
  };

  const handleRevokeAccess = async (groupId) => {
    try {
      const response = await axios.delete(`/documents/${item._id}/revoke`, {
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
      await mutate(`/documents?teamId=${user.teamId}&userEmail=${user.email}`);
    } catch (error) {
      console.error('Error removing the member from shared document:', error);
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        BackdropProps={{
          invisible: true,
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="h6"> Info </Typography>

            <Checkbox
              color="warning"
              icon={<Iconify icon="eva:star-outline" />}
              checkedIcon={<Iconify icon="eva:star-fill" />}
              checked={favorited}
              onChange={onFavorite}
              sx={{ p: 0.75 }}
            />
          </Stack>

          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{ p: 2.5, bgcolor: 'background.neutral' }}
          >
            <FileThumbnail
              imageView
              file={type === 'folder' ? type : url}
              sx={{ width: 64, height: 64 }}
              imgSx={{ borderRadius: 1 }}
            />

            <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
              {name}
            </Typography>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Panel label="Tags" toggle={toggleTags} onToggle={handleToggleTags} />

              {toggleTags && (
                <Autocomplete
                  multiple
                  freeSolo
                  limitTags={3}
                  options={item.tags.map((option) => option)}
                  value={tags}
                  onChange={(event, newValue) => {
                    if (newValue.length <= maxTags) {
                      setTags(newValue);
                    }
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        size="small"
                        variant="soft"
                        label={option}
                        key={option}
                        onDelete={() => {
                          setTags((prevTags) => prevTags.filter((tag) => tag !== option)); // Remove the clicked tag
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} placeholder="#Add a tags" />}
                />
              )}

              {tags.length >= maxTags && (
                <p style={{ textAlign: "center", color: "#D32F2F", fontSize: "12px" }}>
                  Only {maxTags} tags can be selected.
                </p>
              )}
            </Stack>

            <Stack spacing={1.5}>
              <Panel
                label="Properties"
                toggle={toggleProperties}
                onToggle={handleToggleProperties}
              />

              {toggleProperties && (
                <Stack spacing={1.5}>
                  <Row label="Size" value={fData(size)} />

                  <Row label="Modified" value={fDateTime(dateModified)} />

                  <Row label="Type" value={fileFormat(type)} />
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2"> File Share With </Typography>

            <IconButton
              size="small"
              color="success"
              onClick={handleOpenShare}
              sx={{
                p: 0,
                width: 24,
                height: 24,
                color: 'common.white',
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.main',
                },
              }}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Stack>

          {hasShared && (
            <List disablePadding sx={{ pl: 2.5, pr: 1 }}>
              {shared.map((person) => (
                <FileInvitedItem 
                  key={person?.member?._id} 
                  person={person?.member} 
                  currentPermission={person?.permission} 
                  documentId={item._id} 
                  teamId={item.teamId}
                />
              ))}
            </List>
          )}

          {hasSharedWithGroup && (
            <List disablePadding sx={{ pl: 2.5, pr: 1 }}>
              {groups.map((group) => (
                <FileGroupInvitedItem 
                  key={group?._id} 
                  group={group}
                  documentId={item._id} 
                  sharedGroups={groups}  
                  onShareClick={handleShareClick} 
                  onRevokeClick={handleRevokeAccess} 
                />
              ))}
            </List>
          )}
        </Scrollbar>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5 }}>
          {tags && !!tags.length && (
            <Button
              variant="soft"
              size='small'
              startIcon={<Iconify icon="eva:pricetags-outline" width={15} />}
              sx={{ fontSize: 11 }}
              onClick={handleTags}
            >
              Add Tags
            </Button>
          )}
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Button
            fullWidth
            variant="soft"
            color="error"
            size="large"
            startIcon={<Iconify icon="eva:trash-2-outline" />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </Box>
      </Drawer>

      <FileShareDialog
        open={openShare}
        shared={shared}
        sharedGroups={groups}
        documentId={item._id}
        teamId={item.teamId}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onShareClick={handleShareClick}
        onRevokeClick={handleRevokeAccess}
        onCopyLink={onCopyLink}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />
    </>
  );
}

// ----------------------------------------------------------------------

Panel.propTypes = {
  toggle: PropTypes.bool,
  label: PropTypes.string,
  onToggle: PropTypes.func,
};

function Panel({ label, toggle, onToggle, ...other }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Row.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

function Row({ label, value = '' }) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}

/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
// components
import ConfirmDialog from '../../../components/confirm-dialog';
// ----------------------------------------------------------------------

FileGroupInvitedItem.propTypes = {
  group: PropTypes.object,
  sharedGroups: PropTypes.array,
  onShareClick: PropTypes.func,
  onRevokeClick: PropTypes.func,
};

export default function FileGroupInvitedItem({ group, sharedGroups, onShareClick, onRevokeClick }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmDel, setOpenConfirmDel] = useState(false);

  const groupLength = group?.members?.length;
  const memberTextInitial = group && group?.members && !!groupLength ? `${group?.members[0]?.name}` : "";
  const memberTextEnd = group && group?.members && groupLength > 1 ? ` and ${groupLength - 1} others` : groupLength === 1 ? ' and 0 others' : '0 others'
  const memberText = group?.members ? memberTextInitial + memberTextEnd : "";

  const hasShared = sharedGroups && !!sharedGroups?.length && sharedGroups.some(shared => shared._id === group?._id);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
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

 return (
    <>
      <ListItem disableGutters>
        <ListItemAvatar>
          <Avatar alt={group?.name} src="" />
        </ListItemAvatar>

        <ListItemText
          primary={group?.name}
          secondary={
            <span>{memberText}</span>
          }
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          sx={{ flexGrow: 1, pr: 1 }}
        />
        
        {!hasShared && (
          <Button
            size="small"
            color="inherit"
            onClick={handleOpenConfirm}
            sx={{
              flexShrink: 0,
              textTransform: 'unset',
              fontWeight: 'fontWeightMedium',
              '& .MuiButton-endIcon': {
              ml: 0,
              },
            }}
          >
            Add
          </Button>
        )}

        {hasShared && (
          <Button
            size="small"
            color="inherit"
            onClick={handleOpenConfirmDel}
            sx={{
              flexShrink: 0,
              textTransform: 'unset',
              fontWeight: 'fontWeightMedium',
              '& .MuiButton-endIcon': {
                ml: 0,
              },
            }}
          >
            Remove
          </Button>
        )} 
       </ListItem>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Share Document"
        content={
          <> 
            Are you sure want to share the document with this group?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onShareClick(group?._id);
              handleCloseConfirm();
            }}
          >
            Share Document
          </Button>
        }
      />

      <ConfirmDialog
        open={openConfirmDel}
        onClose={handleCloseConfirmDel}
        title={"Remove group's shared access"}
        content={
          <>
            Are you sure want to remove the group&apos;s access with the shared document?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onRevokeClick(group?._id);
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

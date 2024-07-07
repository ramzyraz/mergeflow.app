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

UserGroupModal.propTypes = {
  displayData: PropTypes.object,
  memberId: PropTypes.string,
  groupId: PropTypes.string,
  isMove: PropTypes.bool,
  isRemove: PropTypes.bool,
  onShareClick: PropTypes.func,
  onRevokeClick: PropTypes.func,
};

export default function UserGroupModal({ isMove, isRemove, memberId, groupId, displayData, onShareClick, onRevokeClick }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmDel, setOpenConfirmDel] = useState(false);

  const groupLength = displayData?.members?.length;
  const memberTextInitial = displayData && displayData?.members && !!groupLength ? `${displayData?.members[0]?.name}` : "";
  const memberTextEnd = displayData && displayData?.members && groupLength > 1 ? ` and ${groupLength - 1} others` : groupLength === 1 ? ' and 0 others' : '0 others'
  const memberText = isRemove? displayData?.email : memberTextInitial + memberTextEnd;

  const addedCondition = isMove && displayData && displayData?.members && !!groupLength && displayData?.members?.find(members => members._id === memberId);

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
          <Avatar alt={displayData?.name} src="" />
        </ListItemAvatar>

        <ListItemText
          primary={displayData?.name}
          secondary={
            <span>{memberText}</span>
          }
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          sx={{ flexGrow: 1, pr: 1 }}
        />
        
        {isMove && (
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
            disabled={addedCondition}
          >
            {!addedCondition ? "Add" : "Added"}
          </Button>
        )}

        {isRemove && (
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
            {isRemove || groupLength > 0 ? "Remove" : "Removed"}
          </Button>
        )} 
       </ListItem>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Add Member"
        content={
          <> 
            Are you sure you want to add the member to this group?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onShareClick(memberId, displayData?._id, handleCloseConfirm);
              handleCloseConfirm();
            }}
          >
            Move Member
          </Button>
        }
      />

      <ConfirmDialog
        open={openConfirmDel}
        onClose={handleCloseConfirmDel}
        title="Remove member from group"
        content={
          <>
            Are you sure want to remove the member from this group?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onRevokeClick(memberId, displayData?._id, handleCloseConfirmDel);
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

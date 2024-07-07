import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import { useSettingsContext } from '../../../../components/settings';
// team
import GroupDialog from '../../team/GroupDialog';

// ----------------------------------------------------------------------

UserTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  isMember: PropTypes.bool,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onMoveMember: PropTypes.func,
  onRemoveMember: PropTypes.func,
  groupData: PropTypes.array,
};

export default function UserTableRow({ 
  row, 
  selected, 
  groupData, 
  isMember, 
  onEditRow, 
  onSelectRow, 
  onDeleteRow, 
  onMoveMember, 
  onRemoveMember, 
}) {
  const { themeMode } = useSettingsContext();

  const { name, avatarUrl, role, status, email } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openMove, setOpenMove] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);
  
  const isLight = themeMode === 'light';

  const handleOpenMove = () => {
    setOpenMove(true);
  };

  const handleCloseMove = () => {
    setOpenMove(false);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
          {isMember && <Avatar alt={name} src={avatarUrl} />}

            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        {isMember && (
          <>
            <TableCell align="left">{email}</TableCell>
            <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
              {role}
            </TableCell>

            {/* <TableCell align="center">
              <Iconify
                icon={isVerified ? 'eva:checkmark-circle-fill' : 'eva:clock-outline'}
                sx={{
                  width: 20,
                  height: 20,
                  color: 'success.main',
                  ...(!isVerified && { color: 'warning.main' }),
                }}
              />
            </TableCell> */}

            <TableCell align="left">
              <Label
                variant="soft"
                color={(status === 'removed' && 'error') || 'success'}
                sx={{ textTransform: 'capitalize' }}
              >
                {status}
              </Label>
            </TableCell>            
          </>
        )}

        {!isMember && (
          <TableCell align="left">
            <Box display="flex" flexDirection="row">
              {row && row?.members?.map(member => (
                <Avatar key={member._id}>{member.name.charAt(0)}</Avatar>
              ))}
            </Box>
          </TableCell>
        )}

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        {isMember && (
          <MenuItem
            onClick={() => {
              handleOpenMove();
              handleClosePopover();
            }}
            sx={{ color: isLight ? '#007B55' : '#58DC7F' }}
          >
            <Iconify icon="eva:arrow-right-outline" />
            Move
          </MenuItem>
        )}

        {!isMember && (
          <MenuItem
            onClick={() => {
              handleOpenMove();
              handleClosePopover();
            }}
            sx={{ color: isLight ? '#007B55' : '#58DC7F' }}
            // disabled={row.members.length <= 0}
          >
            <Iconify icon="eva:arrow-right-outline" />
            Remove
          </MenuItem>
        )}
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />

      {isMember && (
        <GroupDialog
          isMove 
          memberId={row._id}
          groupId={row.groupId}
          open={openMove}
          currentData={groupData}
          onClose={handleCloseMove}
          onShareClick={onMoveMember}
        />        
      )}

      {!isMember && (
        <GroupDialog
          isRemove 
          memberId={row._id}
          open={openMove}
          currentData={row.members}
          onClose={handleCloseMove}
          onRevokeClick={onRemoveMember}
        />        
      )}
    </>
  );
}

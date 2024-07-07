import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  List,
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
//
import FileInvitedItem from '../FileInvitedItem';
import FileGroupInvitedItem from '../FileGroupInvitedItem';
import { useFetchData } from '../../../../hooks/useFetchData';
import { fetcher } from '../../../../utils/fetchFunctions';

// ----------------------------------------------------------------------

FileShareDialog.propTypes = {
  open: PropTypes.bool,
  page: PropTypes.string,
  sharedGroups: PropTypes.array,
  documentId: PropTypes.string,
  teamId: PropTypes.string,
  onClose: PropTypes.func,
  shared: PropTypes.array,
  onCopyLink: PropTypes.func,
  inviteEmail: PropTypes.string,
  onChangeInvite: PropTypes.func,
  onShareClick: PropTypes.func,
  onRevokeClick: PropTypes.func,
};

export default function FileShareDialog({
  shared,
  sharedGroups,
  documentId,
  teamId,
  inviteEmail,
  onCopyLink,
  onChangeInvite,
  onShareClick,
  onRevokeClick,
  //
  open,
  page,
  onClose,
  ...other
}) {
  const [checked, setChecked] = useState(false);
  const displayText = checked ? "Share with groups" : "Invite Users";
  const hasShared = shared && !!shared.length;

  const { data } = useFetchData(teamId ? `/groups?teamId=${teamId}` : null, fetcher);
  const groupData = data || [];
  const isGroupData = groupData && !!groupData.length;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> 
        {displayText} 
        {checked && (
          <Typography variant="subtitle2" sx={{ color: "#637381", fontWeight: "400", fontSize: "14px", marginTop: "5px" }}>
            You have {groupData?.length > 9 ? groupData?.length : `0${  groupData?.length}`} groups
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {!checked && onChangeInvite && (
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              value={inviteEmail}
              placeholder="Email"
              onChange={onChangeInvite}
            />
            <Button disabled={!inviteEmail} variant="contained" sx={{ flexShrink: 0 }} onClick={() => onShareClick(null)}>
              Send Invite
            </Button>
          </Stack>
        )}

        {hasShared && !checked && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {shared.map((person) => (
                <FileInvitedItem 
                  key={person?.member?._id} 
                  person={person?.member} 
                  currentPermission={person?.permission} 
                  documentId={documentId} 
                  teamId={teamId}
                />
              ))}
            </List>
          </Scrollbar>
        )}

        {isGroupData && checked && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
          <List disablePadding>
            {groupData.map((group) => (
              <FileGroupInvitedItem 
                key={group?._id}
                group={group} 
                sharedGroups={sharedGroups} 
                onShareClick={onShareClick} 
                onRevokeClick={onRevokeClick}
              />
            ))}
          </List>
        </Scrollbar>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: page === "team" ? 'flex-end' : 'space-between' }}>
        {onCopyLink && !checked && (
          <Button startIcon={<Iconify icon="eva:link-2-fill" />} onClick={onCopyLink}>
            Copy link
          </Button>
        )}

        {isGroupData && (
          <FormControlLabel
            control={<Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
            label={checked ? 'Shared Groups' : 'Shared Users'}
          />
        )}

        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

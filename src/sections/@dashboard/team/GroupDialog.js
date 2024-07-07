import PropTypes from 'prop-types';
// @mui
import {
  List,
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
// components
import Scrollbar from '../../../components/scrollbar';
// sections
import UserGroupModal from './UserGroupModal';

// ----------------------------------------------------------------------

GroupDialog.propTypes = {
  isMove: PropTypes.bool,
  isRemove: PropTypes.bool,
  memberId: PropTypes.string,
  groupId: PropTypes.string,
  open: PropTypes.bool,
  currentData: PropTypes.array,
  onClose: PropTypes.func,
  onShareClick: PropTypes.func,
  onRevokeClick: PropTypes.func,
};

export default function GroupDialog({
  isMove = false,
  isRemove = false,
  memberId,
  groupId,
  currentData,
  onShareClick,
  onRevokeClick,
  //
  open,
  onClose,
  ...other
}) {
  const isGroupData = currentData && !!currentData.length;
  const subtitleText = isMove 
    ? `You have ${currentData?.length > 9 ? currentData?.length : `${  currentData?.length || 0}`} groups` 
    : `You have ${currentData?.length > 9 ? currentData?.length : `${  currentData?.length || 0}`} members`;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> 
        {isMove ? "Add Member to Group" : "Remove Member from Group"}   
        <Typography variant="subtitle2" sx={{ color: "#637381", fontWeight: "400", fontSize: "14px", marginTop: "3px" }}>
          {subtitleText}
        </Typography>      
      </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {isGroupData && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {currentData.map((current) => (
                <UserGroupModal 
                  key={current?._id}
                  isMove={isMove}
                  isRemove={isRemove}
                  memberId={memberId}
                  groupId={groupId} 
                  displayData={current} 
                  onShareClick={onShareClick} 
                  onRevokeClick={onRevokeClick}
                />
              ))}
            </List>
        </Scrollbar>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

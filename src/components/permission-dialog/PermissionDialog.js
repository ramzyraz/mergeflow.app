import PropTypes from 'prop-types';
// @mui
import { Dialog, Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';

// ----------------------------------------------------------------------

PermissionDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.node,
  content: PropTypes.node,
  onClose: PropTypes.func,
};

export default function PermissionDialog({ title, content, open, onClose, ...other }) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

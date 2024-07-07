import PropTypes from 'prop-types';
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
  ListItem,
  ListItemIcon,
  Typography,
} from '@mui/material';
import FileThumbnail from '../../../../components/file-thumbnail/FileThumbnail';

// ----------------------------------------------------------------------

FileMoveFolderDialog.propTypes = {
  item: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  folders: PropTypes.array,
  selectedFolders: PropTypes.array,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  handleMoveFile: PropTypes.func,
  handleFolderSelection: PropTypes.func,
};

export default function FileMoveFolderDialog({
  item,
  folderName,
  onChangeFolderName,
  open,
  onClose,
  folders,
  selectedFolders,
  handleMoveFile,
  handleFolderSelection
}) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle> Select Folder </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            value={folderName}
            placeholder="Folder Name"
            onChange={onChangeFolderName}
          />
          <Button variant="contained" sx={{ flexShrink: 0 }} onClick={() => handleMoveFile(item)}>
            Move
          </Button>
        </Stack>

        <List>
          {!!folders.length && folders.map(folder => (
            <ListItem 
              key={folder._id} 
              onClick={() => handleFolderSelection(folder._id)} 
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ListItemIcon>
                <FileThumbnail file={folder.type} />
              </ListItemIcon>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  color: selectedFolders.some(selectedFolder => selectedFolder._id === folder._id) ? '#00AB55' : 'inherit',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{folder.name}</span>
                <Typography variant="body2" color="textSecondary">
                  {`${folder.totalFiles} files`}
                </Typography>
              </div>
              <Button 
                size='small' 
                color={selectedFolders.some(selectedFolder => selectedFolder._id === folder._id) ? 'primary' : 'inherit'}
              >
                Select
              </Button>
            </ListItem>          
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-end' }}>
        {onClose && <Button variant="outlined" color="inherit" onClick={onClose}>Close</Button>}
      </DialogActions>
    </Dialog>
  );
}

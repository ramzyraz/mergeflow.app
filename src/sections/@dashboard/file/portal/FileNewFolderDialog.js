import Image from 'next/image';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Box,
} from '@mui/material';
// components
import { mutate } from 'swr';
import Iconify from '../../../../components/iconify';
import { Upload } from '../../../../components/upload';
// assets
import { useAuthContext } from '../../../../auth/useAuthContext';
import { getFileExtension } from '../../../../utils/fileExtension';
import { useSnackbar } from '../../../../components/snackbar';
// import { mutate } from 'swr';
import axios from '../../../../utils/axios';
// ----------------------------------------------------------------------

FileNewFolderDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
};

export default function FileNewFolderDialog({
  title = 'Upload Files',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}) {
  const [files, setFiles] = useState([]);
  const [uploadedFileInfo, setUploadedFileInfo] = useState({
    documentIds: [],
    totalSize: 0,
  });
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = async () => {
    try {
      const {teamId} = user;
      const checkForCreateUpdate = onCreate || onUpdate;
      const newFilesList = files.map(file => ({
        name: file.name,
        path: file.path,
        url: file.preview,
        size: file.size,
        type: getFileExtension(file.name)
      }));

      if (newFilesList && newFilesList.length > 0) {
        const response = await axios.post('/documents/upload', {
          teamId,
          files: newFilesList,
          showFile: !checkForCreateUpdate,
        });
  
        if (response.status === 201 && checkForCreateUpdate) {
          setUploadedFileInfo({
            ...uploadedFileInfo,
            documentIds: response.data?.documentIds,
            totalSize: response.data?.totalSize
          });

          enqueueSnackbar("Files uploaded!");
        } else if (response.status === 201 && !checkForCreateUpdate) {
          await mutate(`/documents?teamId=${teamId}&userEmail=${user?.email}`);
          enqueueSnackbar("Files uploaded!");
          onClose();          
        } else {
          console.log("Failed to upload the files");
        }
      } else {
        enqueueSnackbar(`No files uploaded.`, { variant: "error" });
      }
    } catch (error) {
      console.error('Error uploading the files:', error);
    }
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const runFunction = () => {
    if (title.includes("New") && onCreate) {
      return onCreate(uploadedFileInfo, handleRemoveAllFiles);
    }

    return onUpdate(uploadedFileInfo, handleRemoveAllFiles);
  };

  const handleThirdPartyUpload = (type) => {
    const message = `Uploading files using ${type} is still in progress`;
    enqueueSnackbar(message, { variant: 'info' });
  }

  const boxStyle = {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '10%',
    border: '1px solid #919EAB3D',
    padding: '24px',
    cursor: "pointer",
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> 
        {title} 
        {!(onCreate || onUpdate) && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ fontSize: '14px', color: '#637381', marginTop: '8px', marginBottom: '16px', opacity: '80%' }}
            >
              Please select the type of file
            </Typography>
            <Divider sx={{ marginBottom: '16px' }} />
          </>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ border: 'none'}}>
        {/* Boxes of the Docs, Office and Dropbox Apps */}
        {!(onCreate || onUpdate) && (
          <>
            <Box display="flex" justifyContent="space-between" >
              <Box textAlign="center" sx={boxStyle} onClick={() => handleThirdPartyUpload("Docs")}>
                <Image src="/assets/icons/apps/ic_docs.svg" alt="Google Docs" width={24} height={24} />
                <Typography variant="body2" sx={{ marginTop: '8px', color: '#637381' }}>Google Docs</Typography>
              </Box>
              <Box sx={{ width: '30px' }} />
              <Box textAlign="center" sx={boxStyle} onClick={() => handleThirdPartyUpload("Office")}>
                <Image src="/assets/icons/apps/ic_office.svg" alt="Microsoft Office" width={24} height={24} />
                <Typography variant="body2" sx={{ marginTop: '8px', color: '#637381' }}>Microsoft Office</Typography>
              </Box>
              <Box sx={{ width: '30px' }} />
              <Box textAlign="center" sx={boxStyle} onClick={() => handleThirdPartyUpload("Dropbox")}>
                <Image src="/assets/icons/apps/ic_dropbox2.svg" alt="Dropbox" width={24} height={24} />
                <Typography variant="body2" sx={{ marginTop: '8px', color: '#637381' }}>Dropbox</Typography>
              </Box>
            </Box>
            <Divider sx={{ margin: '16px 0' }}>
              <span style={{ color: '#637381', fontSize: '14px' }}>OR</span>
            </Divider>
          </>
        )}
        
        {/* Text field in case of Create New Folder Button */}
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Folder name"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}

        {/* Upload button */}
        <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          style={{ color: 'black', borderColor: '#919EAB52'  }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          Upload
        </Button>

        {!!files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            Remove all
          </Button>
        )}

        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={runFunction}>
              {onUpdate ? 'Save' : 'Create'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}

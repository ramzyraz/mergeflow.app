import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
// @mui
import { Collapse, Box, Divider, Button } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
//
import FileCard from '../item/FileCard';
import FileFolderCard from '../item/FileFolderCard';
import FileShareDialog from '../portal/FileShareDialog';
import FileActionSelected from '../portal/FileActionSelected';
import FileNewFolderDialog from '../portal/FileNewFolderDialog';
// ----------------------------------------------------------------------

FileGridView.propTypes = {
  isFile: PropTypes.bool,
  data: PropTypes.array,
  table: PropTypes.object,
  onDeleteItem: PropTypes.func,
  dataFiltered: PropTypes.array,
  onOpenConfirm: PropTypes.func,
  openNewFolder: PropTypes.bool,
  setOpenNewFolder: PropTypes.func,
  onFavorite: PropTypes.func,
};

export default function FileGridView({
  isFile,
  table,
  data,
  dataFiltered,
  onDeleteItem,
  onOpenConfirm,
  openNewFolder,
  setOpenNewFolder,
  onFavorite,
}) {
  const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;
  
  const containerRef = useRef(null);

  const [folderName, setFolderName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const [openShare, setOpenShare] = useState(false);

  const [collapseFiles, setCollapseFiles] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [collapseFolders, setCollapseFolders] = useState(false);

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleCloseNewFolder = () => {
    setOpenNewFolder(false);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  return (
    <>
      <Box ref={containerRef}>
        <Collapse in={!collapseFolders} unmountOnExit>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            {dataFiltered
              .filter((i) => i.type === 'folder')
              .map((folder) => (
                <FileFolderCard
                  key={folder._id}
                  folder={folder}
                  isFile={isFile}
                  selected={selected.includes(folder._id)}
                  onSelect={() => onSelectItem(folder._id)}
                  onDelete={() => onDeleteItem(folder._id)}
                  onFavorite={onFavorite}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        </Collapse>

        <Divider sx={{ my: 5, borderStyle: 'dashed' }} />

        <Collapse in={!collapseFiles} unmountOnExit>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {dataFiltered
              .filter((i) => i.type !== 'folder')
              .map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  isFile={isFile}
                  selected={selected.includes(file._id)}
                  onSelect={() => onSelectItem(file._id)}
                  onDelete={() => onDeleteItem(file._id)}
                  onFavorite={onFavorite}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        </Collapse>

        {!!selected?.length && (
          <FileActionSelected
            numSelected={selected.length}
            rowCount={data.length}
            selected={selected}
            onSelectAllItems={(checked) =>
              onSelectAllItems(
                checked,
                data.map((row) => row._id)
              )
            }
            action={
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={onOpenConfirm}
                sx={{ mr: 1 }}
              >
                Delete
              </Button>
            }
          />
        )}
      </Box>

      <FileShareDialog
        open={openShare}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        // onShareClick={handleShareClick}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />

      <FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} />

      <FileNewFolderDialog
        open={openNewFolder}
        onClose={handleCloseNewFolder}
        title="New Folder"
        onCreate={() => {
          handleCloseNewFolder();
          setFolderName('');
          console.log('CREATE NEW FOLDER', folderName);
        }}
        folderName={folderName}
        onChangeFolderName={(event) => setFolderName(event.target.value)}
      />
    </>
  );
}

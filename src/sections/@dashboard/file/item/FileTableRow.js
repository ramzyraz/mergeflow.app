/* eslint-disable no-nested-ternary */
import { paramCase } from 'change-case';
import PropTypes from 'prop-types';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/router';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Divider,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  AvatarGroup,
} from '@mui/material';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import FileThumbnail from '../../../../components/file-thumbnail';
import PermissionDialog from '../../../../components/permission-dialog';
import { useSnackbar } from '../../../../components/snackbar';
//
import FileShareDialog from '../portal/FileShareDialog';
import FileDetailsDrawer from '../portal/FileDetailsDrawer';
import FileMoveFolderDialog from '../portal/FileMoveFolderDialog';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// ----------------------------------------------------------------------

FileTableRow.propTypes = {
  isFile: PropTypes.bool,
  row: PropTypes.object,
  selected: PropTypes.bool,
  folders: PropTypes.array,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onFavorite: PropTypes.func
};

export default function FileTableRow({ isFile, row, selected, onSelectRow, onDeleteRow, folders, onFavorite }) {
  const { name, size, type, dateModified, sharedWith, isFavorited, groups } = row;
 
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const { push } = useRouter();

  const { copy } = useCopyToClipboard();

  const [inviteEmail, setInviteEmail] = useState('');

  const [openShare, setOpenShare] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openMoveFolder, setOpenMoveFolder] = useState(false);

  const [favorited, setFavorited] = useState(isFavorited);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const [folderName, setFolderName] = useState('')

  const [selectedFolders, setSelectedFolders] = useState([]);
  
  const findMemberPermission = sharedWith && !!sharedWith.length && sharedWith.find(item => item?.member?.email === user.email);
  const editAccess = findMemberPermission && findMemberPermission?.permission === "edit";
  const hasPermission = !!(user.type === "admin" || editAccess);

  const handleOpenDetails = () => {
    if (!hasPermission) {
      handleOpenDialog();
    } else {
      setOpenDetails(true);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleMoveNewFolder = () => {
    setOpenMoveFolder(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleCloseMoveFolder = () => {
    setOpenMoveFolder(false);
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

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  const handleFolderName = (event) => {
    setFolderName(event.target.value)
  }

  const handleFavorite = (value) => {
    setFavorited(value);
  }

  const handleClick = useDoubleClick({
    click: () => row?.type === 'folder' 
      ? handleEditRow(row?._id)
      : hasPermission && !isFile ? handleOpenDetails() : console.log('CLICKED!'),
    doubleClick: () => console.log('DOUBLE CLICK'),
  });

  const handleEditRow = (folderId) => {
    push(PATH_DASHBOARD.fileManager.files(paramCase(folderId)));
  };

  const handleCopy = () => {
    enqueueSnackbar('Copied!');
    copy(row.url);
  };

  const handleFolderSelection = (folderId) => {
    console.log(folderId)
    console.log("FOLDERS!!")
    setSelectedFolders(prevSelectedFolders => {
      // Check if the folderId is already in the selectedFolders array
      const isSelected = prevSelectedFolders.some((folder) => folder.id === folderId);

      // If it's already selected, remove it from the selection
      if (isSelected) {
        return prevSelectedFolders.filter((folder) => folder.id !== folderId);
      }

      // If it's not selected, find the folder object from the folders array and add it to the selection
      const selectedFolder = folders.find((folder) => folder.id === folderId);
      if (selectedFolder) {
        return [...prevSelectedFolders, selectedFolder];
      }

      // Return the unchanged selection if the folder is not found (optional)
      return prevSelectedFolders;
    });
  };

  const handleMoveFile = (file) => {
    console.log("HANDLE MOVE")
    console.log(file)
    // setSelectedFolders(prevSelectedFolders => {
    //   // Clone the selected folders array to avoid modifying the state directly
    //   const newSelectedFolders = [...prevSelectedFolders];
  
    //   // Loop through each selected folder and add the file to their content
    //   newSelectedFolders.forEach((folder) => {
    //     // Add the file to the folder's content array (modify this based on your folder data structure)
    //     folder.push(file);
    //   });
  
    //   return newSelectedFolders;
    // });

    setOpenMoveFolder(false);
  };

  return (
    <>
      <TableRow
        sx={{
          borderRadius: 1,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
          ...(openDetails && {
            '& .MuiTableCell-root': {
              color: 'text.primary',
              typography: 'subtitle2',
              bgcolor: 'background.default',
            },
          }),
        }}
      >
        <TableCell
          padding="checkbox"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
        >
          <Checkbox
            checked={selected}
            onDoubleClick={() => console.log('ON DOUBLE CLICK')}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FileThumbnail file={type} />

            <Typography 
              noWrap 
              variant="inherit" 
              sx={{ maxWidth: 360, cursor: hasPermission || row?.type === "folder" ? "pointer" : "default" }}
              onClick={handleClick}
            >
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell
          align="left"
          // onClick={handleClick}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {fData(size)}
        </TableCell>

        <TableCell
          align="center"
          // onClick={handleClick}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {type}
        </TableCell>

        <TableCell
          align="left"
          // onClick={handleClick}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {fDate(dateModified)}
        </TableCell>

        <TableCell 
          align="right" 
          // onClick={handleClick}
        >
          <AvatarGroup
            max={4}
            sx={{
              '& .MuiAvatarGroup-avatar': {
                width: 24,
                height: 24,
                '&:first-of-type': {
                  fontSize: 12,
                },
              },
            }}
          >
            {sharedWith && !!sharedWith.length && sharedWith.map(person => (
              <Avatar key={person?.member?._id} alt={person?.member?.name} src={person?.member?.avatarUrl} />
            ))}

            {groups && !!groups.length && groups?.members && groups?.members?.map(member => (
              <Avatar key={member?._id} alt={member?.name} src={member?.avatarUrl} />
            ))}
          </AvatarGroup>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {!isFile && (
            <Checkbox
              color="warning"
              icon={<Iconify icon="eva:star-outline" />}
              checkedIcon={<Iconify icon="eva:star-fill" />}
              checked={favorited}
              onChange={() => onFavorite(row._id, favorited, handleFavorite)}
              sx={{ p: 0.75 }}
            />
          )}

          {(hasPermission && !isFile) && (
            <IconButton color={openDetails ? 'inherit' : 'default'} onClick={handleOpenDetails}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}

          {(!hasPermission || isFile) && (
            <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        {hasPermission && isFile && (          
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
        )}

        <MenuItem
          onClick={() => {
            handleClosePopover();
            handleCopy();
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          Copy Link
        </MenuItem>
      </MenuPopover>
      

      <FileDetailsDrawer
        item={row}
        shared={sharedWith}
        favorited={favorited}
        onFavorite={handleFavorite}
        onCopyLink={handleCopy}
        open={openDetails}
        onClose={handleCloseDetails}
        onDelete={onDeleteRow}
      />

      <FileShareDialog
        open={openShare}
        documentId={row._id}
        shared={sharedWith}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onCopyLink={handleCopy}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />

      <FileMoveFolderDialog
        item={row}
        open={openMoveFolder}
        folders={folders}
        folderName={folderName}
        selectedFolders={selectedFolders}
        handleMoveFile={handleMoveFile}
        handleFolderSelection={handleFolderSelection}
        onChangeFolderName={handleFolderName}
        onClose={() => {
          handleCloseMoveFolder();
          setFolderName('');
        }}
      />

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

      <PermissionDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        title="Permission Error"
        content={
          <>
            You do not have the sufficient permission to perform this task.
          </>
        }
      />
    </>
  );
}

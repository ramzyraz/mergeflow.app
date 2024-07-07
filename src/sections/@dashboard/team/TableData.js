import PropTypes from 'prop-types';
import { paramCase } from 'change-case';
import { useState } from 'react';
import { useRouter } from 'next/router';
// @mui
import {
  Table,
  Tooltip,
  TableBody,
  IconButton,
  TableContainer,
  Button,
} from '@mui/material';
import { mutate } from 'swr';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
import { useSnackbar } from '../../../components/snackbar';
// sections
import { UserTableToolbar, UserTableRow } from '../user/list';
// api and auth
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';
// ----------------------------------------------------------------------

TableData.propTypes = {
  isMember: PropTypes.bool,
  teamId: PropTypes.string,
  deleteRowApi: PropTypes.string,
  tableData: PropTypes.array,
  dialogData: PropTypes.array,
  roleOptions: PropTypes.array,
  tableHead: PropTypes.array,
};

// ----------------------------------------------------------------------

export default function TableData({ 
  isMember = false, 
  teamId,
  deleteRowApi,
  tableData, 
  dialogData,
  roleOptions, 
  tableHead,
}) {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const router = useRouter();
  
  const { enqueueSnackbar } = useSnackbar();

  const { deleteUserProfile, deleteMultipleUsers } = useAuthContext();

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 52 : 72;

  const isFiltered = filterName !== '' || filterRole !== 'all';

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole);


  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleDeleteRow = async (id, uid) => {
    try {
      const deleteMsg = isMember ? "Failed to delete member" : "Failed to delete group";
      const response = await axios.delete(`${deleteRowApi}/${id}?teamId=${teamId}`);
      
      if (response.status === 200) {
        await deleteUserProfile(uid);
        await mutate([`/members?teamId=${teamId}`, `/groups?teamId=${teamId}`]);
        enqueueSnackbar('Delete success!');
      } else {
        enqueueSnackbar(deleteMsg);
        console.error('Failed to delete member.');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setSelected([]);
    
    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteRows = async (selectedRows) => {
    try {
      const bodyData = {
        teamId,
        [isMember ? 'memberIds' : 'groupIds']: selectedRows,
      };

      const response = await axios.delete(deleteRowApi, {
        data: bodyData      
      });

      if (response.status === 200) {
        await deleteMultipleUsers(response?.data?.memberIds);
        await mutate([`/members?teamId=${teamId}`, `/groups?teamId=${teamId}`]);
        console.log('Selected Groups deleted successfully!');
        enqueueSnackbar('Delete success!');
        handleCloseConfirm();
      } else {
        const deleteMsg = isMember ? "Failed to delete members" : "Failed to delete groups";
        enqueueSnackbar(deleteMsg);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    handleCloseConfirm()
    setSelected([]);

    if (page > 0) {
      if (selectedRows.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selectedRows.length === dataFiltered.length) {
        setPage(0);
      } else if (selectedRows.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleMoveMember = async (id, groupId, handleCloseMove) => {
    try {
      const response = await axios.put(`/members/${id}/moveToGroup`, {
        teamId,
        groupId
      });

      if (response.status === 200) {
        await mutate([`/members?teamId=${teamId}`, `/groups?teamId=${teamId}`]);
        enqueueSnackbar('Member moved to group!');
        handleCloseMove();
      } else {
        enqueueSnackbar('Failed to move member to group!');
      }
    } catch (error) {
      enqueueSnackbar('Failed to move member to group!');
      console.error('Error:', error);
    }
  }

  const handleRemoveMember = async (groupId, memberId, handleCloseMove) => {
    try {
      const response = await axios.delete(`/groups/${groupId}/removeFromGroup`, {
        data: {
          teamId,
          memberId
        }
      });

      if (response.status === 200) {
        await mutate([`/members?teamId=${teamId}`, `/groups?teamId=${teamId}`]);
        enqueueSnackbar('Member remove from group!');
        handleCloseMove();
      } else {
        enqueueSnackbar('Failed to remove member from group!' , { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar('Failed to remove member from group!', { variant: "error" });
      console.error('Error:', error);
    }
  }

  const handleEditRow = (id) => {
    let PATH = PATH_DASHBOARD.group.edit(paramCase(id));
    if (isMember) {
        PATH = PATH_DASHBOARD.user.edit(paramCase(id));
    } 

    router.push(PATH);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
  };

  return (
    <>
      {tableData && !!tableData.length && (
        <UserTableToolbar
          isFiltered={isFiltered}
          filterName={filterName}
          filterRole={filterRole}
          optionsRole={roleOptions}
          onFilterName={handleFilterName}
          onFilterRole={handleFilterRole}
          onResetFilter={handleResetFilter}
        />
      )}

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <TableSelectedAction
          dense={dense}
          numSelected={selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            onSelectAllRows(
              checked,
              tableData.map((row) => row._id)
            )
          }
          action={
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={handleOpenConfirm}>
              <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={tableHead}
              rowCount={tableData.length}
              numSelected={selected.length}
              onSort={onSort}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
                )
              }
            />

            <TableBody>
              {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <UserTableRow
                  key={row._id}
                  row={row}
                  groupData={dialogData}
                  isMember={isMember}
                  selected={selected.includes(row._id)}
                  onRemoveMember={handleRemoveMember}
                  onMoveMember={handleMoveMember}
                  onSelectRow={() => onSelectRow(row._id)}
                  onDeleteRow={() => handleDeleteRow(row._id, row.uid)}
                  onEditRow={() => handleEditRow(row._id)}
                />
              ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
              />

              <TableNoData isNotFound={isNotFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <TablePaginationCustom
        count={dataFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        //
        dense={dense}
        onChangeDense={onChangeDense}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filterName, filterRole }) {
  const stabilizedThis = inputData ? inputData?.map((el, index) => [el, index]) : [];

  
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  
  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData?.filter(
      (user) => user?.name?.toLowerCase()?.indexOf(filterName?.toLowerCase()) !== -1
    );
  }

  if (filterRole !== 'all') {
    inputData = inputData?.filter((user) => user?.type?.toLowerCase() === filterRole?.toLowerCase());
  }

  return inputData;
}
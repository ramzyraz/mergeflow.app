import PropTypes from 'prop-types';
// @mui
import { Table, Tooltip, TableBody, IconButton, TableContainer, Box } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import {
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../../components/table';
//
import FileTableRow from '../item/FileTableRow';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'size', label: 'Size', align: 'left', width: 120 },
  { id: 'type', label: 'Type', align: 'center', width: 120 },
  { id: 'dateModified', label: 'Modified', align: 'left', width: 160 },
  { id: 'shared', label: 'Shared', align: 'right', width: 100 },
  { id: '' },
];

FileListView.propTypes = {
  isFile: PropTypes.bool,
  table: PropTypes.object,
  isNotFound: PropTypes.bool,
  tableData: PropTypes.array,
  onDeleteRow: PropTypes.func,
  dataFiltered: PropTypes.array,
  onOpenConfirm: PropTypes.func,
  onOpenShare: PropTypes.func,
  onFavorite: PropTypes.func,
};

export default function FileListView({
  isFile = false,
  table,
  tableData,
  isNotFound,
  onDeleteRow,
  dataFiltered,
  onOpenConfirm,
  onOpenShare,
  onFavorite,
}) {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = table;

  const denseHeight = dense ? 52 : 72;

  return (
    <>
      <Box sx={{ px: 1, position: 'relative', borderRadius: 1.5, bgcolor: 'background.neutral' }}>
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
            <>
              {/* <Tooltip title="Share">
                <IconButton color="primary" onClick={onOpenShare}>
                  <Iconify icon="eva:share-fill" />
                </IconButton>
              </Tooltip> */}

              <Tooltip title="Delete">
                <IconButton color="primary" onClick={onOpenConfirm}>
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Tooltip>
            </>
          }
          sx={{
            pl: 1,
            pr: 2,
            top: 8,
            left: 8,
            right: 8,
            width: 'auto',
            borderRadius: 1,
          }}
        />

        <TableContainer>
          <Table
            size={dense ? 'small' : 'medium'}
            sx={{
              minWidth: 960,
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              '& .MuiTableCell-head': {
                boxShadow: 'none !important',
              },
            }}
          >
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={selected.length}
              onSort={onSort}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
                )
              }
              sx={{
                '& .MuiTableCell-head': {
                  bgcolor: 'transparent',
                },
              }}
            />

            <TableBody>
              {dataFiltered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <FileTableRow
                    key={row._id}
                    row={row}
                    isFile={isFile}
                    selected={selected.includes(row._id)}
                    onSelectRow={() => onSelectRow(row._id)}
                    onDeleteRow={() => onDeleteRow(row._id)}
                    folders={tableData.filter(data => data.type === 'folder')}
                    onFavorite={onFavorite}
                  />
                ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
              />

              <TableNoData isNotFound={isNotFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <TablePaginationCustom
        count={dataFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        //
        dense={dense}
        onChangeDense={onChangeDense}
        sx={{
          '& .MuiTablePagination-root': { borderTop: 'none' },
          '& .MuiFormControlLabel-root': { px: 0 },
        }}
      />
    </>
  );
}

import { useState } from 'react';
import { useRouter } from 'next/router';
// next
import Head from 'next/head';
// @mui
import { Stack, Button, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// utils
import { fTimestamp } from '../../../../utils/formatTime';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
import ConfirmDialog from '../../../../components/confirm-dialog';
import PermissionDialog from '../../../../components/permission-dialog';
import { fileFormat } from '../../../../components/file-thumbnail';
import { useSettingsContext } from '../../../../components/settings';
import { useTable, getComparator } from '../../../../components/table';
import { useSnackbar } from '../../../../components/snackbar';
import DateRangePicker, { useDateRangePicker } from '../../../../components/date-range-picker';
// sections
import {
  FileListView,
  FileGridView,
  FileFilterType,
  FileFilterName,
  FileFilterButton,
  FileChangeViewButton,
} from '../../../../sections/@dashboard/file';
// api and auth
import axios from '../../../../utils/axios';
import { useAuthContext } from '../../../../auth/useAuthContext';
import { useFetchData } from '../../../../hooks/useFetchData';
import { fetcher } from '../../../../utils/fetchFunctions';
// ----------------------------------------------------------------------

const FILE_TYPE_OPTIONS = [
  'folder',
  'txt',
  'zip',
  'audio',
  'image',
  'video',
  'word',
  'excel',
  'powerpoint',
  'pdf',
  'photoshop',
  'illustrator',
];

// ----------------------------------------------------------------------

FolderFilesPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function FolderFilesPage() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const { user } = useAuthContext();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  const [view, setView] = useState('list');

  const [filterName, setFilterName] = useState('');

  const [filterType, setFilterType] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasPermission = user?.type === "admin";
  const teamId = user?.teamId || "-1";
  const { data, mutate } = useFetchData(teamId ? `/documents/${router.query.id}` : null, fetcher);

  const currentFolderName = data?.name || "";
  const tableData = data?.files || [];

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterType,
    filterStartDate: startDate,
    filterEndDate: endDate,
    isError: !!isError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterType) ||
    (!dataFiltered.length && !!endDate && !!startDate);

  const isFiltered = !!filterName || !!filterType.length || (!!startDate && !!endDate);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleFilterName = (event) => {
    table.setPage(0);
    setFilterName(event.target.value);
  };

  const handleChangeStartDate = (newValue) => {
    table.setPage(0);
    onChangeStartDate(newValue);
  };

  const handleChangeEndDate = (newValue) => {
    table.setPage(0);
    onChangeEndDate(newValue);
  };

  const handleFilterType = (type) => {
    const checked = filterType.includes(type)
      ? filterType.filter((value) => value !== type)
      : [...filterType, type];

    table.setPage(0);
    setFilterType(checked);
  };

  const handleDeleteItem = async (id) => {
    const { page, setPage, setSelected } = table;

    try {
      const newData = tableData.filter(row => row._id !== id);
      const newFolder = {...data};
      newFolder.files = newData;
      await mutate(newFolder, false);

      const response = await axios.delete(`/documents/${id}?teamId=${user.teamId}`, {
        data: {
          folderId: data?._id
        }
      });
      if (response.status === 200) {
        console.log('Document deleted successfully!');
        enqueueSnackbar('Document deleted!');
      } else {
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

  const handleDeleteItems = async (selected) => {
    const { page, rowsPerPage, setPage, setSelected } = table;

    try {
      const newData = tableData.filter(row => !selected.includes(row._id));
      const newFolder = [...data];
      newFolder.files = newData;
      await mutate(newFolder, false);

      const response = await axios.delete('/documents', {
        data: {
          documentIds: selected,
          teamId: user.teamId
        }      
      });
      if (response.status === 200) {
        console.log('Selected Documents deleted successfully!');
        handleCloseConfirm();
        enqueueSnackbar('Documents deleted!');
      } else {
        console.error('Failed to delete members.');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    handleCloseConfirm()
    setSelected([]);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === dataFiltered.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleClearAll = () => {
    if (onResetPicker) {
      onResetPicker();
    }
    setFilterName('');
    setFilterType([]);
  };

  const handleOpenConfirm = () => {
    if (!hasPermission) {
      handleOpenDialog();
    } else {
      setOpenConfirm(true);
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <>
      <Head>
        <title> Documents: View files | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Documents"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Documents',
              href: PATH_DASHBOARD.fileManager.root,
            },
            { name: currentFolderName },
          ]}
        />

        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            <FileFilterName filterName={filterName} onFilterName={handleFilterName} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <>
                <FileFilterButton
                  isSelected={!!isSelectedValuePicker}
                  startIcon={<Iconify icon="eva:calendar-fill" />}
                  onClick={onOpenPicker}
                >
                  {isSelectedValuePicker ? shortLabel : 'Select Date'}
                </FileFilterButton>

                <DateRangePicker
                  variant="calendar"
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStartDate={handleChangeStartDate}
                  onChangeEndDate={handleChangeEndDate}
                  open={openPicker}
                  onClose={onClosePicker}
                  isSelected={isSelectedValuePicker}
                  isError={isError}
                />
              </>

              <FileFilterType
                filterType={filterType}
                onFilterType={handleFilterType}
                optionsType={FILE_TYPE_OPTIONS}
                onReset={() => setFilterType([])}
              />

              {isFiltered && (
                <Button
                  variant="soft"
                  color="error"
                  onClick={handleClearAll}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>

          <FileChangeViewButton value={view} onChange={handleChangeView} />
        </Stack>

        {view === 'list' ? (
          <FileListView
            isFile
            table={table}
            tableData={tableData}
            dataFiltered={dataFiltered}
            onDeleteRow={handleDeleteItem}
            isNotFound={isNotFound}
            onOpenConfirm={handleOpenConfirm}
          />
        ) : (
          <FileGridView
            isFile
            table={table}
            data={tableData}
            dataFiltered={dataFiltered}
            onDeleteItem={handleDeleteItem}
            onOpenConfirm={handleOpenConfirm}
          />
        )}
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems(table.selected);
              handleCloseConfirm();
            }}
          >
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

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterType,
  filterStartDate,
  filterEndDate,
  isError,
}) {

  const stabilizedThis = inputData ? inputData?.map((el, index) => [el, index]) : [];

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (file) => file.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterType.length) {
    inputData = inputData.filter((file) => filterType.includes(fileFormat(file.type)));
  }

  if (filterStartDate && filterEndDate && !isError) {
    inputData = inputData.filter(
      (file) =>
        fTimestamp(file.dateCreated) >= fTimestamp(filterStartDate) &&
        fTimestamp(file.dateCreated) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}

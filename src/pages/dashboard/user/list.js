import { useEffect, useState } from 'react';
// next
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Button,
  Divider,
  Container,
  Grid,
} from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_AUTH, PATH_PAGE } from '../../../routes/paths';
import { BASE_URL } from '../../../config';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import PermissionDialog from '../../../components/permission-dialog/PermissionDialog';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
// sections
import TableData from '../../../sections/@dashboard/team/TableData';
import MultiStepModal from '../../../sections/@dashboard/user/list/MultiStepModal';
import { FileShareDialog } from '../../../sections/@dashboard/file';
// api and auth
import axios from '../../../utils/axios';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useFetchData } from '../../../hooks/useFetchData';
import { fetcher } from '../../../utils/fetchFunctions';
// constants
import { ROLE_OPTIONS_MEMBERS, STATUS_OPTIONS, TABLE_HEAD_MEMBERS } from '../../../constants/members';
import { ROLE_OPTIONS_GROUPS, TABLE_HEAD_GROUPS } from '../../../constants/groups';

// ----------------------------------------------------------------------

TeamPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function TeamPage() {
  const { user } = useAuthContext();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState('members');

  const [teamOpen, setTeamOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');

  const [openShare, setOpenShare] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentRole = user?.type;
  const isAdmin = currentRole === "admin";
  
  const teamId = user?.teamId || "-1";
  const url1 = teamId ? `/members?teamId=${teamId}` : null;
  const url2 = teamId ? `/groups?teamId=${teamId}` : null;

  const { data: members } = useFetchData(url1, fetcher);
  const { data: groups } = useFetchData(url2, fetcher);
  
  const handleOpenShare = () => {
    if (!isAdmin) {
      handleOpenDialog();
    } else {
      setOpenShare(true);
    }
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  const handleFilterStatus = (_, newValue) => {
    setFilterStatus(newValue);
  };

  const handleShareClick = async () => {
    try {
      const response = await axios.post('/teams/send', {
        teamId,
        email: inviteEmail,
        invitationLink: BASE_URL + PATH_AUTH.register,
      });

      if (response.status === 200) {
        enqueueSnackbar("Invitation email sent successfully!");
      } 

      handleCloseShare();
      setInviteEmail('');

    } catch (error) {
      console.error('Error sharing the document:', error);
      enqueueSnackbar(error?.message || 'Error sharing the document', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (teamId === "-1" || !teamId) {
      setTeamOpen(true);
    }
  }, [teamId]);

  useEffect(() => {
    if (currentRole && !isAdmin) {
      router.replace(PATH_PAGE.page403);
    }
  }, [router, isAdmin, currentRole]);

  return (
    <>
      <Head>
        <title> Teams | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Teams"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Teams' },
          ]}
          action={
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  onClick={handleOpenShare}
                  variant="outlined"
                  startIcon={<Iconify icon="eva:email-outline" width={18} />}
                >
                  Invite Member
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={NextLink}
                  href={PATH_DASHBOARD.group.new}
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                >
                  New Group
                </Button>
              </Grid>
            </Grid>
          }
        />

        <Card>
          <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab key={tab} label={tab} value={tab} />
            ))}
          </Tabs>

          <Divider />  

          {filterStatus === "members" 
            ? <TableData
                isMember
                teamId={teamId}
                deleteRowApi='/members'
                tableData={members || []} 
                dialogData={groups}
                roleOptions={ROLE_OPTIONS_MEMBERS} 
                tableHead={TABLE_HEAD_MEMBERS} 
              /> 
            : <TableData 
                teamId={teamId}
                deleteRowApi='/groups'
                tableData={groups || []} 
                dialogData={members}
                roleOptions={ROLE_OPTIONS_GROUPS} 
                tableHead={TABLE_HEAD_GROUPS} 
              /> 
          }        
        </Card>
      </Container>

      <MultiStepModal
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
      />

      <FileShareDialog
        page="team"
        open={openShare}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onShareClick={handleShareClick}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
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

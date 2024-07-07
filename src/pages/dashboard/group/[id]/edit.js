// next
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_PAGE } from '../../../../routes/paths';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../../components/settings';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
// sections
import GroupEditForm from "../../../../sections/@dashboard/group/GroupEditForm";
// api and auth
import { useAuthContext } from '../../../../auth/useAuthContext';
import { useFetchData } from '../../../../hooks/useFetchData';
import { fetcher } from '../../../../utils/fetchFunctions';
// ----------------------------------------------------------------------

GroupEditPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GroupEditPage() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const {id} = router.query;
  
  const currentRole = user?.type;
  const isAdmin = currentRole === "admin";

  const teamId = user?.teamId;
  const url1 = teamId ? `/groups/${id}?teamId=${teamId}` : null;
  const url2 = teamId ? `/members?teamId=${teamId}` : null;
  const { data: members } = useFetchData(url1, fetcher);
  const { data: currentGroup } = useFetchData(url2, fetcher);

  useEffect(() => {
    if (currentRole && !isAdmin) {
      router.replace(PATH_PAGE.page403);
    }
  }, [router, isAdmin, currentRole]);
  return (
    <>
      <Head>
        <title> Group: Edit group | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit group"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Group',
              href: PATH_DASHBOARD.user.list,
            },
            { name: currentGroup?.name },
          ]}
        />

        {currentGroup && members && (
          <GroupEditForm isEdit members={members} currentGroup={currentGroup} />
        )}
      </Container>
    </>
  );
}

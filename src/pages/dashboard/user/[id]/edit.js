// next
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_PAGE } from '../../../../routes/paths';
// _mock_
import { _userList } from '../../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../../components/settings';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
// sections
import UserNewEditForm from '../../../../sections/@dashboard/user/UserNewEditForm';
// api and auth
import { useAuthContext } from '../../../../auth/useAuthContext';
import { useFetchData } from '../../../../hooks/useFetchData';
import { fetcher } from '../../../../utils/fetchFunctions';
// ----------------------------------------------------------------------

UserEditPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const {id} = router.query;
  
  const currentRole = user?.type;
  const isAdmin = currentRole === "admin";
  const teamId = user?.teamId;
  const { data: currentUser } = useFetchData(teamId ? `/members/${id}?teamId=${teamId}` : null, fetcher);

  useEffect(() => {
    if (currentRole && !isAdmin) {
      router.replace(PATH_PAGE.page403);
    }
  }, [router, isAdmin, currentRole]);

  return (
    <>
      <Head>
        <title> User: Edit user | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit user"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Members',
              href: PATH_DASHBOARD.user.list,
            },
            { name: currentUser?.name },
          ]}
        />

        <UserNewEditForm isEdit currentUser={currentUser} />
      </Container>
    </>
  );
}

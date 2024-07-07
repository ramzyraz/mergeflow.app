// next
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_PAGE } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import UserNewEditForm from '../../../sections/@dashboard/user/UserNewEditForm';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// ----------------------------------------------------------------------

UserCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const currentRole = user?.type;
  const isAdmin = currentRole === "admin";

  useEffect(() => {
    if (currentRole && !isAdmin) {
      router.replace(PATH_PAGE.page403);
    }
  }, [router, isAdmin, currentRole]);

  return (
    <>
      <Head>
        <title> Groups: Create a new group | Mergeflow</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new group"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Group',
              href: PATH_DASHBOARD.user.list,
            },
            { name: 'New group' },
          ]}
        />
        <UserNewEditForm />
      </Container>
    </>
  );
}

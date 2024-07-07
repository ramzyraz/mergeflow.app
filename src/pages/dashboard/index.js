import { useEffect } from 'react';
// next
import { useRouter } from 'next/router';
// config
import { PATH_AFTER_LOGIN, PATH_AFTER_LOGIN_NO_TEAM } from '../../config';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// ----------------------------------------------------------------------

export default function Index() {
  const { pathname, replace, prefetch } = useRouter();
  const { user } = useAuthContext();
  const teamId = user && user.teamId;

  useEffect(() => {
    let PATH = PATH_AFTER_LOGIN;

    if (pathname === PATH_DASHBOARD.root) {
      if (teamId === "-1" || !teamId) {
        PATH = PATH_AFTER_LOGIN_NO_TEAM;
      } 

      replace(PATH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, teamId]);

  useEffect(() => {
    prefetch(PATH_AFTER_LOGIN);
    prefetch(PATH_AFTER_LOGIN_NO_TEAM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

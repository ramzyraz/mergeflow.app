// next
import Head from 'next/head';
// sections
import Login from '../../sections/auth/Login';

// ----------------------------------------------------------------------

export default function LoginUnprotectedPage() {
  return (
    <>
      <Head>
        <title> Login Unprotected | Mergeflow</title>
      </Head>

      <Login />
    </>
  );
}

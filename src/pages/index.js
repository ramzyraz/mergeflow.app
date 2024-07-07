import React from 'react';

import ScrollProgress from '../components/scroll-progress';
// sections

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/dashboard');
  }, []);
  return (
    <>
      <ScrollProgress />
    </>
  );
}

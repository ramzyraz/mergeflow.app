import React from 'react';
import { useRouter } from 'next/navigation';
import ScrollProgress from '../components/scroll-progress';

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <ScrollProgress />
  );
}

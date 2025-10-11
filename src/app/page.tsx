'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/storage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid sessions
    const session = getSession();

    if (session) {
      // Redirect to dashboard if session exists
      router.push('/dashboard');
    } else {
      // Redirect to login if no session
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

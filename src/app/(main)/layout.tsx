'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Navbar } from './components/Navbar';
import { StartingBalanceDialog } from '@/components/onboarding/StartingBalanceDialog';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <StartingBalanceDialog />
    </div>
  );
}

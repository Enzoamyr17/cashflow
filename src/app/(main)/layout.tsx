'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Navbar } from './components/Navbar';
import { StartingBalanceDialog } from '@/components/onboarding/StartingBalanceDialog';
import { MigrationModal } from '@/components/auth/MigrationModal';

const MIGRATION_MODAL_DISMISSED_KEY = 'migration_modal_dismissed';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, checkSession } = useAuth();
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!isLoading && user === null) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Check if user needs to see migration modal
    if (user && (!user.email || !user.email_verified)) {
      // Check if user has dismissed the modal in this session
      const dismissed = sessionStorage.getItem(MIGRATION_MODAL_DISMISSED_KEY);
      if (!dismissed) {
        setShowMigrationModal(true);
      }
    }
  }, [user]);

  const handleDismissMigrationModal = () => {
    // Store dismissal in sessionStorage (clears on browser close)
    sessionStorage.setItem(MIGRATION_MODAL_DISMISSED_KEY, 'true');
    setShowMigrationModal(false);
  };

  // Show loading spinner while checking auth
  if (isLoading || !user) {
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
      <MigrationModal
        shouldShow={showMigrationModal}
        onDismiss={handleDismissMigrationModal}
      />
    </div>
  );
}

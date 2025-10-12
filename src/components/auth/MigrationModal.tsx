'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Mail, Lock } from 'lucide-react';

interface MigrationModalProps {
  shouldShow: boolean;
  onDismiss: () => void;
}

export function MigrationModal({ shouldShow, onDismiss }: MigrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(shouldShow);
  }, [shouldShow]);

  const handleGoToSettings = () => {
    setIsOpen(false);
    onDismiss();
    router.push('/settings');
  };

  const handleRemindLater = () => {
    setIsOpen(false);
    onDismiss();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Secure Your Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <p>
              We&apos;ve added email and password authentication for better security!
            </p>
            <div className="space-y-3 text-left mt-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Add Your Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protect your account with email verification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Set a Password
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a strong password for secure login
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              You can continue using your user code for now, but we recommend securing your account as soon as possible.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleRemindLater} className="sm:order-1">
            Remind Me Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleGoToSettings} className="sm:order-2">
            Go to Settings
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

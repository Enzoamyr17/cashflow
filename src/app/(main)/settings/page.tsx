'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, Lock, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  if (!user) {
    return null;
  }

  const handleUpdateCredentials = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      toast.success('Verification email sent! Please check your inbox.');
      setShowVerificationInput(true);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update credentials');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      toast.success('Email verified successfully! Please log in again with your new credentials.');

      // Wait a bit before logging out to show the success message
      setTimeout(async () => {
        await logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      toast.success('Verification code resent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend code');
    }
  };

  const hasEmail = user.email && user.email.trim() !== '';
  const isEmailVerified = user.email_verified;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account security and credentials
        </p>
      </div>

      {/* Account Security Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium">Email Address</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hasEmail ? user.email : 'Not set'}
                </p>
              </div>
            </div>
            {hasEmail && (
              isEmailVerified ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.password_hash ? 'Set' : 'Not set'}
                </p>
              </div>
            </div>
            {user.password_hash && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
        </CardContent>
      </Card>

      {/* Update Credentials Form */}
      {!isEmailVerified && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {hasEmail && !isEmailVerified ? 'Complete Email Verification' : 'Set Up Email & Password'}
            </CardTitle>
            <CardDescription>
              {hasEmail && !isEmailVerified
                ? 'Verify your email to secure your account'
                : 'Add email and password for secure authentication'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showVerificationInput ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Must contain: 8+ characters, uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                <Button
                  onClick={handleUpdateCredentials}
                  disabled={isUpdating || !email || !password || !confirmPassword}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : 'Save & Send Verification Email'}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    A 6-digit verification code has been sent to <strong>{email}</strong>.
                    The code will expire in 15 minutes.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isVerifying}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </Button>
                  <Button
                    onClick={handleResendCode}
                    variant="outline"
                    className="flex-1"
                  >
                    Resend Code
                  </Button>
                </div>

                <Button
                  onClick={() => setShowVerificationInput(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Change Email/Password
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">User Code</span>
            <span className="font-medium">{user.user_code}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Name</span>
            <span className="font-medium">{user.name || 'Not set'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Account Created</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

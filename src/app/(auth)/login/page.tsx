'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Label } from '@/components/ui/label';

type AuthMode = 'login' | 'register' | 'verify';
type LoginMethod = 'email' | 'usercode';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userCode, setUserCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, loginWithEmail, checkSession, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Check if user already has a valid session
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // Only redirect if we're done loading and user is logged in
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is already shown by the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCodeLogin = async () => {
    if (!userCode.trim()) {
      toast.error('Please enter a user code');
      return;
    }

    setIsLoading(true);
    try {
      await login(userCode);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is already shown by the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Registration successful! Please check your email for the verification code.');
      setPendingUserId(data.userId);
      setMode('verify');
      setPassword('');
      setConfirmPassword('');
      setName('');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (!pendingUserId) {
      toast.error('No pending verification. Please register again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUserId, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast.success('Email verified successfully! You can now login.');
      setMode('login');
      setVerificationCode('');
      setPendingUserId(null);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') {
        if (userCode.trim()) {
          handleUserCodeLogin();
        } else {
          handleEmailLogin();
        }
      } else if (mode === 'register') {
        handleRegister();
      } else if (mode === 'verify') {
        handleVerifyEmail();
      }
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Cashflow Tracker</CardTitle>
          <CardDescription className="text-base">
            {mode === 'login'
              ? 'Login to your account'
              : mode === 'register'
              ? 'Create a new account'
              : 'Verify your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Mode Tabs - Hide when in verify mode */}
          {mode !== 'verify' && (
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                    Or use user code
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  id="usercode"
                  type="password"
                  placeholder="User code"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>

              <Button
                onClick={() => {
                  if (userCode.trim()) {
                    handleUserCodeLogin();
                  } else {
                    handleEmailLogin();
                  }
                }}
                disabled={isLoading || (!email.trim() && !userCode.trim())}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Enter your password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <Button
                onClick={handleRegister}
                disabled={isLoading || !email.trim() || !password.trim() || !name.trim() || !confirmPassword.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </>
          )}

          {/* Verification Form */}
          {mode === 'verify' && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We&apos;ve sent a verification code to <strong>{email}</strong>.
                  Please enter it below to verify your account.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="text-base text-center tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleVerifyEmail}
                  disabled={isLoading || !verificationCode.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
                <div className="text-center">
                  <button
                    onClick={() => {
                      setMode('login');
                      setVerificationCode('');
                      setPendingUserId(null);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    disabled={isLoading}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

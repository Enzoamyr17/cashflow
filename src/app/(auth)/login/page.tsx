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

type LoginMode = 'usercode' | 'email';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('email');
  const [userCode, setUserCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'usercode') {
        handleUserCodeLogin();
      } else {
        handleEmailLogin();
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
            {mode === 'email'
              ? 'Login with your email and password'
              : 'Enter your user code to login or create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Mode Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setMode('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'email'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Email / Password
            </button>
            <button
              onClick={() => setMode('usercode')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'usercode'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              User Code
            </button>
          </div>

          {/* Email/Password Form */}
          {mode === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </>
          )}

          {/* User Code Form */}
          {mode === 'usercode' && (
            <>
              <div>
                <Input
                  type="text"
                  placeholder="Enter user code (case-sensitive)"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <Button
                onClick={handleUserCodeLogin}
                disabled={isLoading || !userCode.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Logging in...' : 'Login / Create Account'}
              </Button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Don&apos;t have a user code? Just enter a new one to create your account!
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

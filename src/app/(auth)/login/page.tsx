'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function LoginPage() {
  const [userCode, setUserCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, checkSession, user } = useAuth();

  useEffect(() => {
    // Check if user already has a valid session
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async () => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (user) {
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
            Enter your user code to login or create a new account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            onClick={handleLogin}
            disabled={isLoading || !userCode.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Logging in...' : 'Login / Create Account'}
          </Button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Don&apos;t have a user code? Just enter a new one to create your account!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

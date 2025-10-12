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

type AuthMode = 'login' | 'register';
type LoginMethod = 'email' | 'usercode';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userCode, setUserCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
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

      toast.success('Registration successful! Please login.');
      setMode('login');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') {
        if (userCode.trim()) {
          handleUserCodeLogin();
        } else {
          handleEmailLogin();
        }
      } else {
        handleRegister();
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
              : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Mode Tabs */}
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
                  type="text"
                  placeholder="User code (legacy)"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
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
                  onKeyPress={handleKeyPress}
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
        </CardContent>
      </Card>
    </div>
  );
}

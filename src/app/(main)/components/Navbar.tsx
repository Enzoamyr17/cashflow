'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, LogOut, DollarSign, Wallet, ChartArea, List } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-500" />
              <span className="hidden md:block text-xl font-bold">Cashflow</span>
            </Link>
            <div className="flex space-x-1">
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <ChartArea className="h-4 w-4" />
                  <p className="hidden md:block">Dashboard</p>
                </Button>
              </Link>
              <Link href="/budget">
                <Button
                  variant={isActive('/budget') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Wallet className="h-4 w-4" />
                  <p className="hidden md:block">Budget</p>
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  variant={isActive('/categories') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <List className="h-4 w-4" />
                  <p className="hidden md:block">Categories</p>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
              {user?.name || user?.user_code}
            </span>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

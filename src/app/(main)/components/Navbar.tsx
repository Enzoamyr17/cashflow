'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, LogOut, DollarSign, Wallet, ChartArea, List, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';

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
              <Image src="/assets/flow/Flow_White.png" className="hidden dark:block" alt="Flow Logo" width={150} height={80} />
              <Image src="/assets/flow/Flow_Black.png" className="block dark:hidden" alt="Flow Logo" width={150} height={80} />
            </Link>
            <div className="flex space-x-1">
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'outline' : 'ghost'}
                  size="sm"
                >
                  <ChartArea className="h-4 w-4" />
                  <p className={`hidden lg:block`}>Dashboard</p>
                </Button>
              </Link>
              <Link href="/budget">
                <Button
                  variant={isActive('/budget') ? 'outline' : 'ghost'}
                  size="sm"
                >
                  <Wallet className="h-4 w-4" />
                  <p className={`hidden lg:block`}>Budget</p>
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  variant={isActive('/categories') ? 'outline' : 'ghost'}
                  size="sm"
                >
                  <List className="h-4 w-4" />
                  <p className={`hidden lg:block`}>Categories</p>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
              {user?.name || user?.user_code}
            </span>
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
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

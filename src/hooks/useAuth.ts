'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { loginWithUserCode, logout as logoutUser } from '@/lib/auth';
import { getSession } from '@/lib/storage';
import { getUserById } from '@/server/users';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (userCode: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (userCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginWithUserCode(userCode);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null, error: null });
  },

  checkSession: async () => {
    const session = getSession();
    if (!session) {
      set({ user: null });
      return;
    }

    // Fetch full user data from database to get starting_balance and other fields
    try {
      const fullUser = await getUserById(session.userId);
      if (fullUser) {
        set({ user: fullUser });
      } else {
        // Session exists but user not found in DB, clear session
        set({ user: null });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to minimal user info from session
      set({
        user: {
          id: session.userId,
          user_code: session.userCode,
          name: session.name,
          starting_balance: 0,
          created_at: '',
        },
      });
    }
  },
}));

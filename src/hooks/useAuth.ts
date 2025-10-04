'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { loginWithUserCode, logout as logoutUser } from '@/lib/auth';
import { getSession } from '@/lib/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (userCode: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => void;
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

  checkSession: () => {
    const session = getSession();
    if (!session) {
      set({ user: null });
      return;
    }

    // If session exists, set minimal user info
    // We don't have full user object in session, so we use what we have
    set({
      user: {
        id: session.userId,
        user_code: session.userCode,
        name: session.name,
        created_at: '', // Not stored in session
      },
    });
  },
}));

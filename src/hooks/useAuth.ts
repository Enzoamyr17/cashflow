'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { loginWithUserCode, loginWithEmailPassword, logout as logoutUser } from '@/lib/auth';
import { getSession } from '@/lib/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (userCode: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true, // Start as loading
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

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginWithEmailPassword(email, password);
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
    set({ user: null, error: null, isLoading: false });
  },

  checkSession: async () => {
    // Don't check session if already checking
    if (get().isLoading && get().user !== null) {
      return;
    }

    set({ isLoading: true });

    const session = getSession();
    if (!session) {
      set({ user: null, isLoading: false });
      return;
    }

    // Fetch full user data from database to get starting_balance and other fields
    try {
      const response = await fetch('/api/user/get-by-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isLoading: false });
      } else {
        // Session exists but user not found in DB, clear session
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to minimal user info from session
      set({
        user: {
          id: session.userId,
          user_code: session.userCode,
          name: session.name,
          email: session.email,
          email_verified: session.emailVerified,
          password_hash: null,
          verification_code: null,
          verification_code_expires: null,
          starting_balance: 0,
          created_at: '',
        },
        isLoading: false,
      });
    }
  },
}));

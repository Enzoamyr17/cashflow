import { saveSession, clearSession } from './storage';
import { User } from '@/types';

/**
 * Login with user code (calls API route)
 */
export async function loginWithUserCode(userCode: string): Promise<User> {
  if (!userCode || userCode.trim() === '') {
    throw new Error('User code is required');
  }

  const response = await fetch('/api/auth/login-usercode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  const user = data.user;

  // Save session
  saveSession(user.id, user.user_code, user.name, user.email, user.email_verified);

  return user;
}

/**
 * Login with email and password (calls API route)
 */
export async function loginWithEmailPassword(email: string, password: string): Promise<User> {
  if (!email || email.trim() === '') {
    throw new Error('Email is required');
  }

  if (!password || password.trim() === '') {
    throw new Error('Password is required');
  }

  const response = await fetch('/api/auth/login-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  const user = data.user;

  // Save session
  saveSession(user.id, user.user_code, user.name, user.email, user.email_verified);

  return user;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  clearSession();
}

/**
 * Update user name (calls API route)
 */
export async function updateUserName(userId: string, name: string): Promise<User> {
  const response = await fetch('/api/user/update-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update user name');
  }

  return data.user;
}

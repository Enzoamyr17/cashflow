import { supabase } from './supabaseClient';
import { saveSession, clearSession } from './storage';
import { User } from '@/types';

/**
 * Verify user code and log in
 * If user doesn't exist, creates a new user
 */
export async function loginWithUserCode(userCode: string): Promise<User> {
  if (!userCode || userCode.trim() === '') {
    throw new Error('User code is required');
  }

  try {
    // Check if user exists (case-sensitive)
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('user_code', userCode)
      .limit(1);

    if (fetchError) {
      throw new Error(`Failed to verify user: ${fetchError.message}`);
    }

    let user: User;

    if (users && users.length > 0) {
      // User exists, log in
      user = users[0] as User;
    } else {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ user_code: userCode }])
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error(`Failed to create user: ${createError?.message || 'Unknown error'}`);
      }

      user = newUser as User;
    }

    // Save session
    saveSession(user.id, user.user_code, user.name);

    return user;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Login failed');
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  clearSession();
}

/**
 * Update user name
 */
export async function updateUserName(userId: string, name: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update user name: ${error?.message || 'Unknown error'}`);
  }

  return data as User;
}

import { supabase } from '@/lib/supabaseClient';
import { User } from '@/types';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
}

/**
 * Get user by user code
 */
export async function getUserByCode(userCode: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_code', userCode)
    .single();

  if (error) {
    console.error('Error fetching user by code:', error);
    return null;
  }

  return data as User;
}

/**
 * Create new user
 */
export async function createUser(userCode: string, name?: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([{ user_code: userCode, name: name || null }])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
  }

  return data as User;
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update user: ${error?.message || 'Unknown error'}`);
  }

  return data as User;
}

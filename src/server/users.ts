import { prisma } from '@/lib/prismaClient';
import { User } from '@/types';
import { users } from '@/generated/prisma';

// Helper to convert Prisma user to User type
function toUser(user: users | null): User | null {
  if (!user) return null;
  return {
    ...user,
    starting_balance: Number(user.starting_balance),
    created_at: user.created_at.toISOString(),
    verification_code_expires: user.verification_code_expires?.toISOString() || null,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    return toUser(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get user by user code
 */
export async function getUserByCode(userCode: string): Promise<User | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { user_code: userCode },
    });
    return toUser(user);
  } catch (error) {
    console.error('Error fetching user by code:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return toUser(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Create new user
 */
export async function createUser(userCode: string, name?: string): Promise<User> {
  try {
    const user = await prisma.users.create({
      data: {
        user_code: userCode,
        name: name || null,
      },
    });
    const converted = toUser(user);
    if (!converted) throw new Error('Failed to convert user');
    return converted;
  } catch (error) {
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: updates,
    });
    const converted = toUser(user);
    if (!converted) throw new Error('Failed to convert user');
    return converted;
  } catch (error) {
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

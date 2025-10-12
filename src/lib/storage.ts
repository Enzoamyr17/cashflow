import { UserSession } from '@/types';

const SESSION_KEY = 'cashflow_session';

/**
 * Gets the midnight timestamp for the current day
 */
function getMidnightTonight(): string {
  const tonight = new Date();
  tonight.setHours(23, 59, 59, 999);
  return tonight.toISOString();
}

/**
 * Saves user session to localStorage with expiry at midnight
 */
export function saveSession(
  userId: string,
  userCode: string,
  name: string | null,
  email: string | null = null,
  emailVerified: boolean = false
): void {
  const session: UserSession = {
    userId,
    userCode,
    name,
    email,
    emailVerified,
    expiresAt: getMidnightTonight(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Gets user session from localStorage if valid
 */
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const sessionData = localStorage.getItem(SESSION_KEY);

  if (!sessionData) {
    return null;
  }

  try {
    const session: UserSession = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    // Check if session has expired
    if (now > expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearSession();
    return null;
  }
}

/**
 * Clears user session from localStorage
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

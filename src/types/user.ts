export interface User {
  id: string;
  user_code: string;
  name: string | null;
  email: string | null;
  password_hash: string | null;
  email_verified: boolean;
  verification_code: string | null;
  verification_code_expires: string | null;
  starting_balance: number;
  created_at: string;
}

export interface UserSession {
  userId: string;
  userCode: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  expiresAt: string; // ISO datetime string for midnight
}

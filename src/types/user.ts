export interface User {
  id: string;
  user_code: string;
  name: string | null;
  starting_balance: number;
  created_at: string;
}

export interface UserSession {
  userId: string;
  userCode: string;
  name: string | null;
  expiresAt: string; // ISO datetime string for midnight
}

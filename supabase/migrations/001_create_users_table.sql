-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_code ON public.users(user_code);

-- Add comment
COMMENT ON TABLE public.users IS 'Stores user accounts with unique case-sensitive user codes';

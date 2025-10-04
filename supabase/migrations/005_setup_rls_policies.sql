-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to read their own data
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (true); -- We'll handle auth in application layer

-- Allow users to insert their own data (for registration)
CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (true);

-- Categories table policies
-- Allow users to manage their own categories
CREATE POLICY "Users can read their own categories"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  USING (true);

-- Transactions table policies
-- Allow users to manage their own transactions
CREATE POLICY "Users can read their own transactions"
  ON public.transactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (true);

-- Note: RLS is enabled but policies allow all operations
-- This is because we're using userCode authentication in the app layer
-- rather than Supabase Auth. In production, you should add proper
-- user_id checks once you implement auth context.

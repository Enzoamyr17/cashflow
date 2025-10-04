-- Add starting_balance column to users table
ALTER TABLE public.users
ADD COLUMN starting_balance NUMERIC(12, 2) DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN public.users.starting_balance IS 'User''s initial account balance used as the baseline for budget calculations';

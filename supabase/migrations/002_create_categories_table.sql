-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Add comment
COMMENT ON TABLE public.categories IS 'Stores expense and income categories per user';

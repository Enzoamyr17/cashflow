-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('Cash', 'Gcash', 'Seabank', 'UBP', 'Other Bank', 'Others');

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  method payment_method NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  is_planned BOOLEAN DEFAULT FALSE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_planned ON public.transactions(is_planned);
CREATE INDEX IF NOT EXISTS idx_transactions_is_completed ON public.transactions(is_completed);

-- Add comment
COMMENT ON TABLE public.transactions IS 'Stores all financial transactions including planned and completed';

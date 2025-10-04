-- Seed data for testing (optional)
-- This file creates a test user and some sample data

-- Insert test user (userCode: "test123")
INSERT INTO public.users (user_code, name)
VALUES ('test123', 'Test User')
ON CONFLICT (user_code) DO NOTHING;

-- Get the test user id
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM public.users WHERE user_code = 'test123';

  -- Insert sample categories
  INSERT INTO public.categories (user_id, name, color)
  VALUES
    (test_user_id, 'Salary', '#10B981'),
    (test_user_id, 'Freelance', '#3B82F6'),
    (test_user_id, 'Food', '#EF4444'),
    (test_user_id, 'Transportation', '#F59E0B'),
    (test_user_id, 'Utilities', '#8B5CF6'),
    (test_user_id, 'Entertainment', '#EC4899')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Insert sample transactions
  INSERT INTO public.transactions (user_id, category_id, type, amount, method, notes, date, is_planned, is_completed)
  SELECT
    test_user_id,
    (SELECT id FROM public.categories WHERE user_id = test_user_id AND name = 'Salary'),
    'income',
    50000.00,
    'UBP',
    'Monthly salary',
    CURRENT_DATE - INTERVAL '5 days',
    false,
    false
  WHERE NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = test_user_id LIMIT 1);

  INSERT INTO public.transactions (user_id, category_id, type, amount, method, notes, date, is_planned, is_completed)
  SELECT
    test_user_id,
    (SELECT id FROM public.categories WHERE user_id = test_user_id AND name = 'Food'),
    'expense',
    1250.00,
    'Gcash',
    'Grocery shopping',
    CURRENT_DATE - INTERVAL '3 days',
    false,
    false
  WHERE NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = test_user_id AND notes = 'Grocery shopping');

  INSERT INTO public.transactions (user_id, category_id, type, amount, method, notes, date, is_planned, is_completed)
  SELECT
    test_user_id,
    (SELECT id FROM public.categories WHERE user_id = test_user_id AND name = 'Transportation'),
    'expense',
    500.00,
    'Cash',
    'Gas',
    CURRENT_DATE - INTERVAL '2 days',
    false,
    false
  WHERE NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = test_user_id AND notes = 'Gas');

  -- Insert planned transaction
  INSERT INTO public.transactions (user_id, category_id, type, amount, method, notes, date, is_planned, is_completed)
  SELECT
    test_user_id,
    (SELECT id FROM public.categories WHERE user_id = test_user_id AND name = 'Utilities'),
    'expense',
    2500.00,
    'Gcash',
    'Electricity bill (planned)',
    CURRENT_DATE + INTERVAL '5 days',
    true,
    false
  WHERE NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = test_user_id AND notes = 'Electricity bill (planned)');
END $$;

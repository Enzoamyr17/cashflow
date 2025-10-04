-- Function to verify user code and return user data
CREATE OR REPLACE FUNCTION verify_user_code(code TEXT)
RETURNS TABLE (
  id UUID,
  user_code TEXT,
  name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.user_code,
    u.name,
    u.created_at
  FROM public.users u
  WHERE u.user_code = code;
END;
$$;

-- Add comment
COMMENT ON FUNCTION verify_user_code IS 'Verifies user code (case-sensitive) and returns user data if exists';

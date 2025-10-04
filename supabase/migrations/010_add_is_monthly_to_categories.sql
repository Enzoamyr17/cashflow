-- Add is_monthly column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_monthly BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN categories.is_monthly IS 'Whether this category budget should be multiplied by the number of months in the budget timeframe';

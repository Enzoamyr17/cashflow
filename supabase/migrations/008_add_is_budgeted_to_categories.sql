-- Add is_budgeted column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_budgeted BOOLEAN DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN categories.is_budgeted IS 'Whether this category is shown in budget breakdown and budget transactions';

-- Set existing categories with planned_amount > 0 to is_budgeted = true
UPDATE categories
SET is_budgeted = true
WHERE planned_amount > 0;


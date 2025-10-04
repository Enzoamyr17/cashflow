-- Add planned_amount column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS planned_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN categories.planned_amount IS 'Planned/budgeted amount for this category per budget period';


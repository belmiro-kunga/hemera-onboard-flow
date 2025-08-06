-- Add birthday column to auth.users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Update existing users with a default birthday if needed
-- UPDATE auth.users SET birthday = '2000-01-01' WHERE birthday IS NULL;

-- Create an index for birthday queries (useful for finding upcoming birthdays)
CREATE INDEX IF NOT EXISTS idx_users_birthday_month_day 
ON auth.users (EXTRACT(MONTH FROM birthday), EXTRACT(DAY FROM birthday));

-- Grant permissions on the new column
GRANT SELECT (birthday), UPDATE (birthday) ON auth.users TO hemera_user;

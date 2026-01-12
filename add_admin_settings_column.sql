-- Add settings column to admin_users table for storing preferences
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_users' AND column_name = 'settings';

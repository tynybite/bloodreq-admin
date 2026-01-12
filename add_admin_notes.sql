-- Add admin_notes column to blood_requests table
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add updated_by column to track who made the last change (optional but good for audit)
ALTER TABLE public.blood_requests
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blood_requests' AND column_name = 'admin_notes';

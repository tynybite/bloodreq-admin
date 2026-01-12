-- 1. Fix Missing Profiles for Existing Users
INSERT INTO public.profiles (id, full_name, avatar_url, role)
SELECT 
  id, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url',
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Make yourself an Admin
-- Replace 'YOUR_EMAIL' with your actual email address
INSERT INTO public.admin_users (id, role)
SELECT id, 'super_admin' 
FROM auth.users 
WHERE email = 'admin@bloodreq.com' -- Change this to your email
ON CONFLICT (id) DO NOTHING;

-- 3. Verify Insertion
SELECT * FROM admin_users;

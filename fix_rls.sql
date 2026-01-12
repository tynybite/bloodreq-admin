-- Fix RLS policy to ensure users can read their own admin status (avoids recursion)
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (auth.uid() = id); 
  -- Simplified to just "own row" for now to unblock login. 
  -- True admin management (viewing others) can be done via service_role or expanded policy later.

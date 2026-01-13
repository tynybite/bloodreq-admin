-- Add FK from admin_users to profiles to allow joining in Supabase API
-- This is required because PostgREST needs an explicit relationship to join tables
-- Since both tables share the same ID (referencing auth.users), this defines a 1:1 relationship
ALTER TABLE public.admin_users
ADD CONSTRAINT fk_admin_users_profiles
FOREIGN KEY (id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

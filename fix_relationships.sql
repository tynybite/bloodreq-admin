-- Fix relationships to allow PostgREST to join profiles
-- ==========================================================

-- 1. Blood Requests: Point requester_id to profiles(id) instead of auth.users(id)
ALTER TABLE blood_requests
  DROP CONSTRAINT IF EXISTS blood_requests_requester_id_fkey;

ALTER TABLE blood_requests
  ADD CONSTRAINT blood_requests_requester_id_fkey
  FOREIGN KEY (requester_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 2. Blood Donations: Point donor_id to profiles(id)
ALTER TABLE blood_donations
  DROP CONSTRAINT IF EXISTS blood_donations_donor_id_fkey;

ALTER TABLE blood_donations
  ADD CONSTRAINT blood_donations_donor_id_fkey
  FOREIGN KEY (donor_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 3. Donation Stories: Point donor_id to profiles(id)
ALTER TABLE donation_stories
  DROP CONSTRAINT IF EXISTS donation_stories_donor_id_fkey;

ALTER TABLE donation_stories
  ADD CONSTRAINT donation_stories_donor_id_fkey
  FOREIGN KEY (donor_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 4. Donor Reminders: Point donor_id to profiles(id)
ALTER TABLE donor_reminders
  DROP CONSTRAINT IF EXISTS donor_reminders_donor_id_fkey;

ALTER TABLE donor_reminders
  ADD CONSTRAINT donor_reminders_donor_id_fkey
  FOREIGN KEY (donor_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Refresh schema cache (usually happens automatically, but good to note)
NOTIFY pgrst, 'reload config';

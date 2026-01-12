-- ==========================================
-- BloodReq Admin - Consolidated Database Schema
-- ==========================================

-- 1. CLEANUP (Drop existing objects to ensure clean slate)
-- ==========================================
drop view if exists blood_type_distribution;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop tables (order matters due to foreign keys)
drop table if exists donor_reminders cascade;
drop table if exists donation_stories cascade;
drop table if exists blood_donations cascade;
drop table if exists blood_requests cascade;
drop table if exists admin_users cascade;
drop table if exists profiles cascade;
drop table if exists user_profiles cascade; -- Removing the duplicate if it exists

-- Drop types
drop type if exists user_status;
drop type if exists user_role;
drop type if exists blood_group_type;
drop type if exists request_status;
drop type if exists urgency_level;

-- 2. EXTENSIONS & TYPES
-- ==========================================
create extension if not exists postgis;

create type urgency_level as enum ('critical', 'urgent', 'planned');
create type request_status as enum ('pending', 'approved', 'completed', 'rejected');
create type blood_group_type as enum ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');
create type user_role as enum ('admin', 'donor', 'requester', 'volunteer');
create type user_status as enum ('active', 'suspended', 'banned');

-- 3. TABLES
-- ==========================================

-- Table: profiles (Extends auth.users)
-- Unified user profile table
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone_number text,
  blood_group text, -- Keeping as text for flexibility, can reference blood_group_type if needed
  role user_role default 'donor',
  status user_status default 'active',
  is_available_donor boolean default false,
  total_donations integer default 0,
  city text,
  country text,
  area text,
  last_active timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: admin_users (RBAC)
create table admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text default 'admin', -- e.g., 'super_admin', 'manager'
  permissions jsonb default '{}'::jsonb,
  assigned_countries text[] default '{}',
  assigned_cities text[] default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: blood_requests
create table blood_requests (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users(id) not null,
  patient_name text not null,
  blood_group blood_group_type not null,
  units integer not null default 1,
  hospital text not null,
  location geography(Point, 4326),
  city text,
  country text,
  urgency urgency_level not null default 'planned',
  status request_status not null default 'pending',
  contact_number text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: blood_donations
create table blood_donations (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references blood_requests(id) not null,
  donor_id uuid references auth.users(id) not null,
  status text check (status in ('offered', 'accepted', 'completed')) default 'offered',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: donation_stories
create table donation_stories (
  id uuid default gen_random_uuid() primary key,
  donor_id uuid references auth.users(id) not null,
  content text not null,
  image_url text,
  is_public boolean default true,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: donor_reminders
create table donor_reminders (
  id uuid default gen_random_uuid() primary key,
  donor_id uuid references auth.users(id) not null,
  reminder_date date not null,
  reminder_type text default 'push',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INDEXES
-- ==========================================
create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_status_idx on profiles(status);

-- 5. RLS POLICIES
-- ==========================================

-- Enable RLS
alter table profiles enable row level security;
alter table admin_users enable row level security;
alter table blood_requests enable row level security;
alter table blood_donations enable row level security;
alter table donation_stories enable row level security;
alter table donor_reminders enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Admin Policies
create policy "Admins can view admin_users" on admin_users for select using (auth.uid() in (select id from admin_users));
-- We typically rely on Service Role for admin writes, but can add a policy if needed:
-- create policy "Super admins can manage admins" on admin_users for all using (exists(select 1 from admin_users where id = auth.uid() and role = 'super_admin'));

-- Blood Requests Policies
create policy "Everyone can read approved requests" on blood_requests for select using (status = 'approved');
create policy "Users can crud their own requests" on blood_requests for all using (auth.uid() = requester_id);
create policy "Authenticated users can create requests" on blood_requests for insert with check (auth.uid() = requester_id);
create policy "Admins can manage all blood requests" on blood_requests for all using (exists (select 1 from admin_users where id = auth.uid()));

-- Blood Donations Policies
create policy "Donors can view their donations" on blood_donations for select using (auth.uid() = donor_id);
create policy "Requesters can view donations for their requests" on blood_donations for select using (exists (select 1 from blood_requests where blood_requests.id = blood_donations.request_id and blood_requests.requester_id = auth.uid()));
create policy "Donors can create donations" on blood_donations for insert with check (auth.uid() = donor_id);

-- Donation Stories Policies
create policy "Everyone can view public stories" on donation_stories for select using (is_public = true);
create policy "Users can create their own stories" on donation_stories for insert with check (auth.uid() = donor_id);
create policy "Users can update their own stories" on donation_stories for update using (auth.uid() = donor_id);

-- Donor Reminders Policies
create policy "Users can crud their own reminders" on donor_reminders for all using (auth.uid() = donor_id);

-- 6. FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. VIEWS
-- ==========================================
-- Corrected view syntax (replacing CREATE OP REPLACE with CREATE OR REPLACE)
CREATE OR REPLACE VIEW blood_type_distribution AS
SELECT 
    blood_group, 
    COUNT(*) as count,
    (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM profiles WHERE blood_group IS NOT NULL), 0)) as percentage
FROM profiles 
WHERE blood_group IS NOT NULL
GROUP BY blood_group;

GRANT SELECT ON blood_type_distribution TO authenticated;
GRANT SELECT ON blood_type_distribution TO service_role;

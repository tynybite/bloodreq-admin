
-- Create Profiles Table (Extends auth.users)
create type user_role as enum ('admin', 'donor', 'requester', 'volunteer');
create type user_status as enum ('active', 'suspended', 'banned');

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone_number text,
  blood_group text, -- keeping as text or using existing type if preferred, let's use text for flexibility or cast from existing enum if needed. sticking to text for now as enum might be strict.
  role user_role default 'donor',
  status user_status default 'active',
  last_active timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster lookups
create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_status_idx on profiles(status);

-- Create Admin Users Table (Explicit Admin Allowlist/RBAC)
create table if not exists admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text default 'admin', -- e.g., 'superadmin', 'moderator'
  permissions jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for Admin Users
alter table admin_users enable row level security;

-- Only admins can view admin table (chicken and egg problem: relying on service role initially or separate check)
-- For now, allow read if user is in the list? No, that exposes the list.
-- We will rely on service role for admin checks in middleware usually, but let's add a policy.
create policy "Admins can view admin_users"
  on admin_users for select
  using (auth.uid() in (select id from admin_users));

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

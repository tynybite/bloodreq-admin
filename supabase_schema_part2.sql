
-- Create Donation Stories Table
create table donation_stories (
  id uuid default gen_random_uuid() primary key,
  donor_id uuid references auth.users(id) not null,
  content text not null,
  image_url text,
  is_public boolean default true,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Donor Reminders Table
create table donor_reminders (
  id uuid default gen_random_uuid() primary key,
  donor_id uuid references auth.users(id) not null,
  reminder_date date not null,
  reminder_type text default 'push', -- 'push', 'email', 'sms'
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table donation_stories enable row level security;
alter table donor_reminders enable row level security;

-- Policies for Donation Stories
create policy "Everyone can view public stories"
  on donation_stories for select
  using (is_public = true);

create policy "Users can create their own stories"
  on donation_stories for insert
  with check (auth.uid() = donor_id);

create policy "Users can update their own stories"
  on donation_stories for update
  using (auth.uid() = donor_id);

-- Policies for Donor Reminders
create policy "Users can crud their own reminders"
  on donor_reminders for all
  using (auth.uid() = donor_id);

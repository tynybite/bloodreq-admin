-- Enable PostGIS for location features
create extension if not exists postgis;

-- Create Enum Types
create type urgency_level as enum ('critical', 'urgent', 'planned');
create type request_status as enum ('pending', 'approved', 'completed', 'rejected');
create type blood_group_type as enum ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');

-- Create Blood Requests Table
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

-- Create Blood Donations Table
create table blood_donations (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references blood_requests(id) not null,
  donor_id uuid references auth.users(id) not null,
  status text check (status in ('offered', 'accepted', 'completed')) default 'offered',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table blood_requests enable row level security;
alter table blood_donations enable row level security;

-- RLS Policies for Blood Requests

-- Everyone can read approved requests
create policy "Everyone can read approved requests"
  on blood_requests for select
  using (status = 'approved');

-- Requesters can CRUD their own requests
create policy "Users can crud their own requests"
  on blood_requests for all
  using (auth.uid() = requester_id);
  
-- Admins (service role) or moderators would need specific policies, 
-- but for now we'll imply they might use the dashboard which might use service role or specific admin checks.
-- For simple testing, we'll allow authenticated users to create requests.
create policy "Authenticated users can create requests"
  on blood_requests for insert
  with check (auth.uid() = requester_id);

-- RLS Policies for Blood Donations
create policy "Donors can view their donations"
  on blood_donations for select
  using (auth.uid() = donor_id);

create policy "Requesters can view donations for their requests"
  on blood_donations for select
  using (exists (
    select 1 from blood_requests
    where blood_requests.id = blood_donations.request_id
    and blood_requests.requester_id = auth.uid()
  ));

create policy "Donors can create donations"
  on blood_donations for insert
  with check (auth.uid() = donor_id);

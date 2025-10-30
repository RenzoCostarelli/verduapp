-- Run this SQL in your Supabase SQL Editor
-- This creates the entries table with proper constraints and policies

-- Create entries table
create table entries (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('income', 'expense')) not null,
  amount numeric not null,
  date timestamptz not null,
  description text,
  method text check (method in ('cash', 'debit_card', 'credit_card', 'transfer', 'other')) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table entries enable row level security;

-- Create policy: All authenticated users can do everything
-- (Since all users have same permissions, no need to check user_id)
create policy "Authenticated users can do everything"
  on entries
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Optional: Create index for better query performance
create index idx_entries_date on entries(date desc);
create index idx_entries_created_by on entries(created_by);

-- Run this SQL in your Supabase SQL Editor
-- This creates a function to get entries with user email information

-- Create a function to get entries with user emails
create or replace function get_entries_with_users()
returns table (
  id uuid,
  type text,
  amount numeric,
  date timestamptz,
  description text,
  method text,
  created_by uuid,
  created_at timestamptz,
  user_email text
)
language sql
security definer
as $$
  select
    e.id,
    e.type,
    e.amount,
    e.date,
    e.description,
    e.method,
    e.created_by,
    e.created_at,
    u.email as user_email
  from entries e
  left join auth.users u on e.created_by = u.id
  order by e.created_at desc;
$$;

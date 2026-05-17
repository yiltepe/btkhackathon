-- Run this in Supabase SQL Editor.
-- Single row per Clerk user. user_id is the Clerk user.id (text).

create table if not exists public.user_state (
  user_id        text primary key,
  chats          jsonb not null default '[]'::jsonb,
  cart           jsonb not null default '[]'::jsonb,
  gender         text,
  budget         jsonb,
  prefs_summary  text,
  updated_at     timestamptz not null default now()
);

-- We don't expose this table to the anon key; access is via API routes
-- using the service role + Clerk auth. RLS stays on as defense-in-depth.
alter table public.user_state enable row level security;

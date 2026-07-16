-- 2026-07-16 — Monthly cast cap (standard 50 / premium 75)
-- Run in the Supabase SQL editor as owner.
--
-- Per-month counter on the profile. month_key ('YYYY-MM') is compared on every
-- reading: a different month reads as 0 used, so the cap resets by itself —
-- no cron, no monthly sweep job, nothing to forget.
-- Enforced in supabase/functions/claude-proxy/index.ts (MONTHLY_LIMITS).
-- Until these columns exist the proxy fails OPEN (logs, allows the reading).

alter table public.user_profiles
  add column if not exists month_units int  not null default 0,
  add column if not exists month_key   text;

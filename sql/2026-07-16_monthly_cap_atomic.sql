-- 2026-07-16 — Monthly cap: atomic counter bump
-- Run in the Supabase SQL editor as owner. Idempotent — safe to run again.
--
-- Why this exists: the proxy reads month_units when it decides eligibility and writes it
-- back only after the reading succeeded. That window is the whole Claude call — seconds,
-- not milliseconds. Two readings in flight at once both read N and both write N+cost, so
-- one cast is never counted. This file's neighbours already guard against exactly that:
-- credits go through the atomic use_credit RPC, and free_balance uses a compare-and-swap.
-- The monthly counter had neither.
--
-- A single UPDATE ... SET month_units = month_units + p_cost is atomic under the row lock,
-- so no count can be lost, and the month rollover happens in the same statement.
--
-- Security posture follows the 2026-07-03 pass: NOT security definer (the edge functions
-- call it with service_role, which bypasses RLS anyway — so there is no reason to grant it
-- owner rights), search_path pinned, and EXECUTE revoked from the public API roles.

create or replace function public.bump_month_units(
  p_user_id uuid,
  p_cost    int,
  p_key     text
) returns int
language sql
as $$
  update public.user_profiles
     set month_units = case when month_key = p_key then month_units + p_cost else p_cost end,
         month_key   = p_key
   where id = p_user_id
  returning month_units;
$$;

alter function public.bump_month_units(uuid, int, text)
  set search_path = pg_catalog, public;

revoke execute on function public.bump_month_units(uuid, int, text)
  from public, anon, authenticated;

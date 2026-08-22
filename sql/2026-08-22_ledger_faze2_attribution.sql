-- ═══════════════════════════════════════════════════════════════════════════
--  LEDGER FÁZE 2 — ATRIBUCE DŮVODŮ (2026-08-22)
--  Kde běžet: Supabase → SQL Editor → New query → Run (celé najednou = 1 transakce)
-- ═══════════════════════════════════════════════════════════════════════════
--  Fáze 1 (sql/2026-07-19_credit_ledger.sql) zapisuje KAŽDÝ pohyb zůstatku triggerem,
--  ale všechny řádky nesou reason='unattributed', protože žádná odečítací RPC nevolá
--  ledger_ctx(). Tahle fáze to dodává: use_credit a bump_month_units dostanou volitelné
--  p_reason/p_ref (proxy pošle 'reading'/'ask' + id čtení) a free_balance dostává
--  vlastní RPC se stejnou CAS ochranou (přímý UPDATE z PostgREST kontext nastavit neumí
--  — set_config žije jen v transakci, a RPC je jediný způsob, jak mít obojí v jedné).
--
--  ⚠️ DROP + CREATE (ne jen REPLACE): nová signatura vedle staré by byla OVERLOAD
--  a PostgREST by volání use_credit(p_user_id) neuměl rozhodnout (300). Celý soubor
--  běží v jedné transakci, takže výměna je atomická — stará proxy volá dál bez výpadku
--  (parametry mají DEFAULT). Novou proxy (posílá p_reason/p_ref) nasadit AŽ PO tomhle.

-- ── use_credit + atribuce ────────────────────────────────────────────────────
drop function if exists public.use_credit(uuid);

create or replace function public.use_credit(
  p_user_id uuid, p_reason text default null, p_ref text default null
) returns integer
language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_balance int;
begin
  if p_reason is not null then perform public.ledger_ctx(p_reason, p_ref); end if;
  update user_profiles
     set credits_balance = credits_balance - 1
   where id = p_user_id and credits_balance > 0
  returning credits_balance into v_balance;
  if not found then return -1; end if;
  return v_balance;
end $$;

revoke all on function public.use_credit(uuid, text, text) from public, anon, authenticated;
grant execute on function public.use_credit(uuid, text, text) to service_role;

-- ── bump_month_units + atribuce (jádro beze změny: atomický bump, 2026-07-16) ─
drop function if exists public.bump_month_units(uuid, int, text);

create or replace function public.bump_month_units(
  p_user_id uuid, p_cost int, p_key text, p_reason text default null, p_ref text default null
) returns int
language plpgsql set search_path = pg_catalog, public as $$
declare v_units int;
begin
  if p_reason is not null then perform public.ledger_ctx(p_reason, p_ref); end if;
  update public.user_profiles
     set month_units = case when month_key = p_key then month_units + p_cost else p_cost end,
         month_key   = p_key
   where id = p_user_id
  returning month_units into v_units;
  return v_units;
end $$;

revoke all on function public.bump_month_units(uuid, int, text, text, text) from public, anon, authenticated;
grant execute on function public.bump_month_units(uuid, int, text, text, text) to service_role;

-- ── free_balance: CAS odečet jako RPC (dosud přímý UPDATE z proxy — bez kontextu) ─
create or replace function public.use_free_balance(
  p_user_id uuid, p_expected int, p_reason text default null, p_ref text default null
) returns boolean
language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if p_reason is not null then perform public.ledger_ctx(p_reason, p_ref); end if;
  update public.user_profiles
     set free_balance = p_expected - 1
   where id = p_user_id and free_balance = p_expected;   -- CAS: soubeh = no-op (jako dřív)
  return found;
end $$;

revoke all on function public.use_free_balance(uuid, int, text, text) from public, anon, authenticated;
grant execute on function public.use_free_balance(uuid, int, text, text) to service_role;

-- ── OVĚŘENÍ: po nasazení nové proxy musí NOVÉ řádky nést reason<>'unattributed' ──
-- select at, asset, delta, reason, ref from public.credit_ledger order by at desc limit 10;

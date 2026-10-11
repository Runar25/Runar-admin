-- ═══════════════════════════════════════════════════════════════════════════
--  ZÁMEK „JEDNO ÚČTOVANÉ ČTENÍ NARÁZ NA ÚČET“ (2026-10-11)
--  Kde běžet: Supabase → SQL Editor → New query → Run (celé najednou = 1 transakce)
-- ═══════════════════════════════════════════════════════════════════════════
--  Proč (RUNAR_BACKLOG.md část 40, nález CODE-read (m); owner 2026-10-11 „ok“): claude-proxy ověřuje nárok NA ZAČÁTKU a odečítá
--  AŽ PO hotovém čtení (slib „chyba nestojí kredit“). Souběžné požadavky tak prošly kontrolou všechny a každý dostal čtení — za jeden
--  kredit nebo jedno volné čtení víc čtení, předplatitel přes měsíční strop. CAS v use_credit / use_free_balance brání jen dvojímu
--  ODEČTU, ne dvojímu čtení. Rezervace kreditu na začátku by měla vlastní díru: funkce zabitá po rezervaci = kredit bez čtení.
--  Řešení: zámek na účet s expirací. Proxy ho vezme PŘED čtením zůstatku a pustí ho po odečtu; souběžný požadavek dostane 429.
--  Zabitá funkce nestojí nic a zámek vyprší sám (10 min > nejdelší běh funkce).
--  Token: zámek uvolní jen ten, kdo ho vzal — kdyby běh přesáhl expiraci, nesmaže zámek cizímu požadavku.
--  Pořadí nasazení: NAPŘED tohle, PAK proxy. Proxy bez téhle funkce selže „otevřeně“ (čte jako dřív, bez zámku, zapíše chybu do logu).

create table if not exists public.reading_locks (
  user_id uuid        primary key references auth.users (id) on delete cascade,   -- smazání účtu smaže i zámek
  token   uuid        not null,
  until   timestamptz not null
);
alter table public.reading_locks enable row level security;   -- bez politik: anon a authenticated nevidí nic, service_role ano
revoke all on table public.reading_locks from public, anon, authenticated;

create or replace function public.acquire_reading_lock(p_user_id uuid, p_token uuid, p_ttl_seconds int default 600)
returns boolean
language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.reading_locks as l (user_id, token, until)
  values (p_user_id, p_token, now() + make_interval(secs => p_ttl_seconds))
  on conflict (user_id) do update
     set token = excluded.token, until = excluded.until
   where l.until < now();   -- platný cizí zámek = nic se nezmění → found = false
  return found;
end $$;

create or replace function public.release_reading_lock(p_user_id uuid, p_token uuid)
returns boolean
language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  delete from public.reading_locks where user_id = p_user_id and token = p_token;
  return found;
end $$;

revoke all on function public.acquire_reading_lock(uuid, uuid, int) from public, anon, authenticated;
revoke all on function public.release_reading_lock(uuid, uuid)      from public, anon, authenticated;
grant execute on function public.acquire_reading_lock(uuid, uuid, int) to service_role;
grant execute on function public.release_reading_lock(uuid, uuid)      to service_role;

-- ── OVĚŘENÍ po spuštění (jen čte): tabulka a obě funkce existují, spouštět je smí jen service_role ──
-- select to_regclass('public.reading_locks') as tabulka,
--        has_function_privilege('service_role',  'public.acquire_reading_lock(uuid, uuid, int)', 'execute') as service_role_ano,
--        has_function_privilege('authenticated', 'public.acquire_reading_lock(uuid, uuid, int)', 'execute') as klient_ne;

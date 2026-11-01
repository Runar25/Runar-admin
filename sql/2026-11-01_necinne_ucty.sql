-- Opuštěné účty (owner 2026-10-19 „přidej mazání po 3 letech s upozorněním“, DECISIONS 2026-10-19 (3), (6); stavba 2026-11-01, DECISIONS
-- 2026-11-01 (3)). Účet 3 roky bez přihlášení → e-mail 30 a 7 dní předem → smazání tutéž cestou jako na žádost. Logika: edge funkce
-- inactive-accounts + supabase/functions/_shared/necinne_ucty.ts. Každý běh hlásí do ops_events „purge“ (job inactive_accounts),
-- registr MAZANI v _shared/ops_souhrn.ts → ops-watch ohlásí selhání nebo neozvání do 26 h.
--
-- (1) public.inactive_notices — kdy šlo kterému účtu upozornění. last_activity = poslední přihlášení, ke kterému upozornění patří: když se
--     člověk mezitím přihlásí, liší se → funkce záznam smaže a odpočet začne znovu. Smazání účtu záznam odnese (ON DELETE CASCADE).
--     Jen service_role (funkce); klient ani anon nic.
-- (2) pg_cron: jednou denně 03:40 UTC, tajná hodnota z vaultu „ops_cron_secret“ (táž jako ops-watch, sql/2026-10-14_ops_watch.sql).
-- Zpět: select cron.unschedule('inactive-accounts'); drop table public.inactive_notices;

begin;
create table if not exists public.inactive_notices (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  last_activity  timestamptz not null,
  first_at       timestamptz,
  second_at      timestamptz
);
alter table public.inactive_notices enable row level security;
revoke all on public.inactive_notices from anon, authenticated, public;
commit;

select cron.unschedule('inactive-accounts') where exists (select 1 from cron.job where jobname = 'inactive-accounts');
select cron.schedule('inactive-accounts', '40 3 * * *', $$
  select net.http_post(
    url := 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/inactive-accounts',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ops-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ops_cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000);
$$);

-- kontrola
select jobname, schedule, active from cron.job where jobname = 'inactive-accounts';
select count(*) as zaznamu from public.inactive_notices;

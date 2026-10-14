-- Hlídání provozu a ranní souhrn e-mailem (owner 2026-10-14 „ano, pg_cron + Brevo … ano udělej“, DECISIONS 2026-10-14 (12), (13)).
-- Pouští OWNER v Supabase → SQL Editor, celé najednou. Tajnou hodnotu pro plánovač (vault „ops_cron_secret“, táž jako OPS_CRON_SECRET
-- edge funkce ops-watch) založila CODE-tune zvlášť skriptem — v tomhle souboru ani v repu nestojí.
-- Zpět: select cron.unschedule('ops-watch-check'); select cron.unschedule('ops-watch-digest');
--       drop table public.ops_alert_state; drop table public.ops_events;

-- 1) plánovač (Supabase Cron = pg_cron; postup z docs supabase.com/docs/guides/cron/install)
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 2) provozní události — claude-proxy (model_error, model_fallback), noční záloha (backup_ok, backup_fail), ops-watch (alert_sent,
--    digest_sent, digest_failed). Jen druh a čísla, žádný text čtení ani osobní údaje.
create table if not exists public.ops_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null,
  detail jsonb not null default '{}'::jsonb
);
create index if not exists ops_events_kind_created on public.ops_events (kind, created_at desc);
alter table public.ops_events enable row level security;   -- bez politik: čte a píše jen service_role (edge funkce, záloha)
revoke all on public.ops_events from anon, authenticated;

-- 3) stav upozornění — e-mail jde jen při změně (ok → problem, problem → ok)
create table if not exists public.ops_alert_state (
  key text primary key,
  state text not null check (state in ('ok', 'problem', 'unknown')),
  changed_at timestamptz not null default now()
);
alter table public.ops_alert_state enable row level security;
revoke all on public.ops_alert_state from anon, authenticated;

-- 4) plánované běhy: kontrola každých 15 minut; ranní souhrn v 06:00 UTC (07:00 zimního, 08:00 letního času ve střední Evropě)
select cron.schedule('ops-watch-check', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/ops-watch',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ops-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ops_cron_secret')),
    body := '{"mode":"check"}'::jsonb,
    timeout_milliseconds := 30000);
$$);
select cron.schedule('ops-watch-digest', '0 6 * * *', $$
  select net.http_post(
    url := 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/ops-watch',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ops-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ops_cron_secret')),
    body := '{"mode":"digest"}'::jsonb,
    timeout_milliseconds := 30000);
$$);

-- kontrola: obě úlohy naplánované
select jobname, schedule, active from cron.job where jobname like 'ops-watch-%' order by jobname;

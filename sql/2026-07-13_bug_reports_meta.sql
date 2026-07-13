-- bug_reports: add timeline + triage columns so reports are easier to read, sort and resolve.
-- Run in the Supabase SQL editor (owner — Code has no DDL access). Idempotent (IF NOT EXISTS).
--
-- Why each column:
--   created_at   — WHEN the report came in (missing today → couldn't sort/know recency).
--   status       — triage state so handled reports don't get re-processed. new | fixed | wontfix | dup.
--   resolved_at  — when it was closed (metrics + "how long open").
--   notes        — the fix / decision, kept with the report (e.g. commit hash, "design deferred").

alter table public.bug_reports
  add column if not exists created_at  timestamptz not null default now(),
  add column if not exists status      text        not null default 'new',
  add column if not exists resolved_at timestamptz,
  add column if not exists notes       text;

-- newest-first listing + status filtering (used by the shrine Reports panel / list-reports)
create index if not exists bug_reports_created_at_idx on public.bug_reports (created_at desc);
create index if not exists bug_reports_status_idx     on public.bug_reports (status);

-- Optional: mark the reports handled so far this session (Slack #runar-reports 2026-07-11).
-- Adjust the WHERE as needed, or skip. (COMPASS i18n / Ask too-long / Ask persisting = fixed.)
-- update public.bug_reports set status = 'fixed', resolved_at = now()
--   where message ilike '%compass%' or message ilike '%ask runar%';

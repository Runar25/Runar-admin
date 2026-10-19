-- bug_reports: hlášení smí vložit jen přihlášený (authenticated), nepřihlášený ne.
-- Proč: DECISIONS 2026-10-10 (1) bod 2 (kontrola architektury, KUKY „opravit“) — otevřený zápis hlášení pro anon.
-- Owner to SQL spustil 2026-10-10, ale soubor do repa nikdy nedošel; repo pak ukazovalo starou politiku `to anon, authenticated`
-- (sql/2026-06-14_bug_reports.sql) a útok zvenku 2026-10-18 podle ní chybně hlásil „hlášení bez limitu pro nepřihlášené“.
-- Doplněno 2026-10-19 (CODE-read) podle produkce: pg_policies bug_reports_insert = INSERT, {authenticated}, with check true; RLS zapnuté.
-- Idempotentní — opakované spuštění nic nezmění.

drop policy if exists bug_reports_insert on public.bug_reports;
create policy bug_reports_insert
  on public.bug_reports for insert
  to authenticated
  with check (true);

-- Ověření: má vrátit jeden řádek bug_reports_insert | INSERT | {authenticated}
select policyname, cmd, roles from pg_policies where tablename = 'bug_reports';

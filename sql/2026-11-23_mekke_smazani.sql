-- 2026-11-23 — Měkké smazání účtu: „Delete Account“ účet zavře a smaže ho až po 30 dnech; přihlášení v té lhůtě smazání zruší.
-- Proč: owner 2026-10-11 „1. souhlas“ k návrhu (DECISIONS 2026-10-11 (53): „účet je 30 dní skrytý, když se uživatel v té době přihlásí,
-- smazání se zruší, a teprve potom se data skutečně vymažou“); stavba 2026-11-23 (owner „11-13 udělej“, BACKLOG „Údržba 2026-11“).
-- Do té doby delete-account mazal hned a obnova šla jen ručně ze zálohy (RUNAR_PRIVACY.md).
-- Kdo píše: řádek zakládá edge funkce delete-account (service_role); maže ho noční inactive-accounts (smazání po 30 dnech, nebo zrušení,
-- když se člověk od žádosti přihlásil), nebo appka sama po novém přihlášení (smí jen ČÍST a SMAZAT svůj řádek — zrušit vlastní žádost).
-- Mazání: s účtem (on delete cascade). Osobní údaj: jen id účtu a čas žádosti (RUNAR_PRIVACY.md).
-- Zpět: drop table public.deletion_requests; (a vrátit delete-account na smazUcet).

create table if not exists public.deletion_requests (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now()
);
alter table public.deletion_requests enable row level security;

revoke all on public.deletion_requests from anon, authenticated;
grant select, delete on public.deletion_requests to authenticated;

drop policy if exists deletion_requests_select_own on public.deletion_requests;
create policy deletion_requests_select_own on public.deletion_requests for select to authenticated using (auth.uid() = user_id);
drop policy if exists deletion_requests_delete_own on public.deletion_requests;
create policy deletion_requests_delete_own on public.deletion_requests for delete to authenticated using (auth.uid() = user_id);

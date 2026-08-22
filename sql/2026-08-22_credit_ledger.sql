-- EVIDENCE POHYBU KREDITU / JEDNOTEK (credit_ledger) — 2026-08-22
-- Proc: na otazku "strhl se mi kredit?" dnes nejde odpovedet ani u vlastniho uctu;
-- credits_balance je jen aktualni cislo bez historie (RUNAR_BACKLOG "ledger").
-- Kdo pise: VYHRADNE server (service_role, claude-proxy po uspesnem cteni) — fail-open,
-- vypadek zapisu cteni neshodi. Klient smi jen CIST vlastni radky (RLS nize).
-- Kdo cte: uzivatel (sve radky), shrine pres service_role.

create table if not exists credit_ledger (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('paid', 'free', 'monthly')),
  delta       integer not null,          -- zaporne = odecet (kredit / free / mesicni jednotka)
  reading_id  uuid,                      -- readings.id, je-li zname (bez FK: cteni s vypnutym
                                         -- journalem radek v readings nema a odecet probehl)
  detail      jsonb,                     -- paid: {remaining} · monthly: {month_key}
  created_at  timestamptz not null default now()
);

alter table credit_ledger enable row level security;

-- Klient: jen SELECT vlastnich radku. Zadna insert/update/delete policy — pise jen
-- service_role (RLS obchazi). Stejny vzor jako penize v user_profiles (grants 2026-07-16).
create policy credit_ledger_own_read on credit_ledger
  for select using (auth.uid() = user_id);

create index if not exists credit_ledger_user_idx on credit_ledger (user_id, created_at desc);

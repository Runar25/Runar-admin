-- ═══════════════════════════════════════════════════════════════════════════
--  ZALOŽENÍ STROMU ŽIVOTA — marker
--  Kde běžet: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════
--
--  PROČ: zakládací Norny mají být ZDARMA (textové čtení bez hlasu, ~$0.004).
--  Aby to nebyl neomezený generátor čtení zdarma, musí server poznat, že uživatel
--  strom už založil. Dnes to nepozná NIJAK — žádný takový příznak neexistuje.
--
--  ⚠️ SLOUPCE NEJSOU V KLIENTSKÉM GRANTU. Kdyby byly, uživatel si `tree_founded_at`
--  vynuluje z konzole a zakládá pořád dokola. Zapisuje výhradně server
--  (sql/2026-07-16_user_profiles_column_grants.sql je jediný autoritativní seznam
--  toho, co smí klient měnit — hlídá smoke ⑩).

alter table public.user_profiles
  add column if not exists tree_founded_at     timestamptz,
  add column if not exists founding_reading_id uuid;

comment on column public.user_profiles.tree_founded_at is
  'Kdy uzivatel zalozil strom zivota (zakladaci Norny). NULL = jeste nezalozil. '
  'Pise VYHRADNE server pres service_role; v klientskem grantu tenhle sloupec NENI.';

-- ── OVĚŘENÍ ─────────────────────────────────────────────────────────────────
-- (A) Sloupce existují a jsou zatím prázdné:
select count(*) as uzivatelu,
       count(tree_founded_at) as zalozenych_stromu
from public.user_profiles;

-- (B) Klient na ně NESMÍ — musí vrátit NULA řádků (grant neexistuje):
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_name = 'user_profiles'
  and column_name in ('tree_founded_at', 'founding_reading_id')
  and grantee in ('anon', 'authenticated')
  and privilege_type = 'UPDATE';

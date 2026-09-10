-- 2026-09-10 — volba: smí životní runa barvit ZÁVĚR čtení?
-- PROČ: změřeno, že čočka si bere závěrečnou větu v 10/12 čtení (bez ní 0/12) — čtyři různé
-- tažené runy a všech dvanáct závěrů o runě, kterou si uživatel nevytáhl. Závěr je přitom ta
-- věta, co člověku zůstane. Owner proto chce VOLBU, ne zrušení (RUNAR_EVAL_LOG.md 2026-09-10).
-- Default TRUE = dnešní chování, takže stávající uživatelé nic nepoznají, dokud si nevypnou.
alter table public.user_profiles
  add column if not exists life_rune_in_readings boolean not null default true;

comment on column public.user_profiles.life_rune_in_readings is
  'Smí životní runa barvit závěr čtení (CLOSING LENS)? Default true = chování do 2026-09-10.';

-- GRANT tady NENÍ schválně: zapisovatelnou plochu vlastní
-- sql/2026-07-16_user_profiles_column_grants.sql (§20) a hlídá ji smoke ⑩. Spusť oba.

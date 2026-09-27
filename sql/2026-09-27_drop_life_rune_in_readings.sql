-- 2026-09-27 — ZAHOZENÍ sloupce user_profiles.life_rune_in_readings (úklid, KUKY „ano, pusť to sám“).
-- PROČ: sloupec nesl volbu „smí životní runa barvit závěr čtení?“ (sql/2026-09-10_life_rune_in_readings.sql). Od v4.60
-- (2026-09-25, KUKY: „životní runa bude jen na vyžádání v ASK, jinak do čtení zasahovat nebude“) čočka v žádném čtení
-- neběží, přepínač v UI odešel a klient sloupec nečte ani nezapisuje (grep 2026-09-26: 0 čtenářů) — RUNAR_DECISIONS
-- 2026-09-25 (7) a 2026-09-26 (12). Stav před smazáním: 4 profily, u 2 volba false (dnes bez účinku).
-- Column-level grant (sql/2026-07-16_user_profiles_column_grants.sql) zaniká se sloupcem; v tom souboru odebrán týž den.
-- SPUŠTĚNO CODE-tune 2026-09-27 přes `supabase db query --linked`; ověřeno: sloupec v information_schema 0×.
alter table public.user_profiles drop column if exists life_rune_in_readings;

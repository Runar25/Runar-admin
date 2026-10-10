-- Čtení pro ANALÝZU KVALITY — bez čtení uživatelů, kteří se z ní odhlásili (user_profiles.analytics_opt_out).
-- Proč (2026-10-10, kontrola architektury část 31, CODE-read): zásady soukromí slibují „opt-out → jeho čtení se NEzahrnou do
-- vieweru/evalu“ (RUNAR_PRIVACY.md bod 4). list-readings to dělal, ale 11 skriptů četlo `readings` napřímo a odhlášení
-- nerespektovalo (2026-10-10 bylo odhlášených 0 ze 4, škoda nevznikla). JEDINÉ místo filtru — skripty ho čtou přes
-- cteni_analyza.js (JS) nebo přímo tenhle soubor (Python). Řádky začínající `--` se před použitím zahodí.
-- Použití v SQL: místo `from readings` napiš `from <obsah tohoto souboru>` — výsledek se jmenuje zase `readings`.
-- Náklady a účetnictví (naklady.py, stats.js) analýza kvality nejsou — ty čtou všechna čtení a nesou značku opt-out:ok.
(select r.* from public.readings r where not exists (select 1 from public.user_profiles p where p.id = r.user_id and p.analytics_opt_out)) readings

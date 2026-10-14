-- 2026-10-14 — mrtvá tabulka knowledge_base (kolo 4 kontroly architektury, CODE-read). Spustí owner v Supabase SQL editoru.
-- 3 řádky z 2026-05; žádný kód v2/, edge funkce, scripts/ ani funkce v DB ji nečte ani nezapisuje (grep + pg_proc 2026-10-14).
-- Zůstávají: gpt_reviews (DECISIONS 2026-10-09 (8): data se nemažou) a runar_character (prázdná, BACKLOG: možný domov víc postav).
drop table if exists public.knowledge_base;

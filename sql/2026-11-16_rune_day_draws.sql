-- 2026-11-16 — Runa dne si ukládá verzi promptu a co si vylosovala (owner 2026-11-16: „3. ano“ na otázku „mám u runy dne ukládat
-- i verzi promptu a co si vylosovala, jako u čtení? Bez toho nepoznáme, která páka dělá rozdíl, když táž runa přijde znovu“).
-- Vzor: readings.prompt_version + readings.prompt_draws. Zapisuje claude-proxy (service_role) z serverového skládání;
-- klient dál jen čte své řádky (politika rune_day_select_own beze změny).
--   draws = {vyznam, vstup, sloveso, cocka, zamer, zacatek} — losy buildDayRunePrompt (v2/runar-character.js).

alter table public.rune_day add column if not exists prompt_version text;
alter table public.rune_day add column if not exists draws jsonb;

-- Ověření: oba sloupce existují
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'rune_day' and column_name in ('prompt_version', 'draws') order by 1;

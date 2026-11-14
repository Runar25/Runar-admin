-- 2026-11-14 (CODE-tree, owner „7. ano“): sloupec readings.spread_data se ruší.
-- Proč: zavedl ho sql/spread_data.sql pro prototyp SPREAD_3 (květen 2026); od 2026-05-31 do něj nikdo nepíše a appka,
-- edge funkce ani strom ho nečtou (strom bere runy z rune_glyph / short_text, spread pozná podle rune_name a area='spread').
-- Data: plné jsou jen 3 prototypové SPREAD_3 z 28.–31. 5. 2026; seznam tří run mají jen tady, smazáním se ztratí
-- (owner 2026-11-14 o starých pokusných čteních: „nejsou vůbec důležitá“). Ostatní řádky NULL.
-- Skripty, které ho četly (scripts/utils/stats.js, archive_batches.js), poznají spread podle area='spread' — fungují před i po.
alter table public.readings drop column if exists spread_data;

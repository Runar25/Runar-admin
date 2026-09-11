-- Rozbor jména — samostatná volba vedle životní runy (KUKY 2026-09-11).
--
-- PROČ VLASTNÍ SLOUPEC: režim `name_lore` je v proxy ZDARMA, a volný režim bez pojistky
-- „už existuje" je díra na peníze — Claude by se zavolal (a zaplatil) při každém požadavku.
-- Týž důvod je už napsaný u `life_rune_text`; tohle je jeho třetí rituální sourozenec.
--
-- Klient si text ukládá SÁM (stejně jako `life_rune_text`), proto grant pro authenticated.
-- Zápis se tím nestává „levným": o tom, jestli se text vůbec vygeneruje, rozhoduje PROXY
-- podle `mode`, ne klient.
--
-- Text sám tady NENÍ a nikdy nebude: instrukci vlastní `RP_NAME` v runar-character.js (§20).

alter table public.user_profiles
  add column if not exists name_lore_text text;

grant update (name_lore_text) on public.user_profiles to authenticated;

-- Kontrola po spuštění:
--   select column_name from information_schema.columns
--    where table_name = 'user_profiles' and column_name = 'name_lore_text';

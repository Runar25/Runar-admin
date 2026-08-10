-- 2026-08-10 — readings.prompt_draws
--
-- PROČ: prompt si u každého čtení losuje úhel, obraz, tvar konce a umístění jména.
-- Do dneška se nezapisoval ani jeden, takže u reálného čtení nešlo říct, kterým
-- úhlem přišlo ani který obraz dostalo. KUKY 2026-08-10: „teď už budeme měřit jen
-- na základě reálných čtení testerů" — bez tohohle sloupce to nejde.
--
-- CO TO JE: jeden jsonb, např.
--   {"v":1,"angle":5,"image":"Féð rennur í kvíarnar undir kvöld","ending":"open0","name":3}
-- Klient si losy čte zpětně z hotového promptu (`_promptDraws`, runar-utils.js),
-- takže buildery se nemění a výstup modelu zůstává stejný.
-- Nezjištěná položka v objektu CHYBÍ — nikdy se nedosazuje 0 ani '' (přiznané „nevím"
-- je lepší než mlčky vytištěná nula).
--
-- BEZPEČNOST: nejde o osobní údaj, jen o vnitřní volbu promptu. Píše VÝHRADNĚ server
-- (service_role) přes claude-proxy, stejně jako zbytek řádku.
--
-- POŘADÍ NASAZENÍ — dodržet, jinak se čtení přestanou ukládat:
--   1. tenhle SQL  ← pustí owner
--   2. teprve pak  supabase functions deploy claude-proxy
-- Klient může `draws` posílat i předtím; proxy neznámé pole v journalu ignoruje.
--
-- Zpětně nedoplnitelné: starší čtení mají null a tak to zůstane.

alter table public.readings
  add column if not exists prompt_draws jsonb;

comment on column public.readings.prompt_draws is
  'Co si prompt pro toto čtení vylosoval (angle/image/ending/name). Zapisuje server. Null = čtení z doby před 2026-08-10.';

-- Zaznamenat, co kazde cteni STALO. Claude to vraci v kazde odpovedi a proxy to zahazuje.
--
-- Proc (KUKY 2026-08-15): "i ted nepouzitelna data muzou mit cenu zlata za par mesicu."
-- Objem cteni uz sledovat umime (scripts/utils/stats.js cte `readings.drawn_at`).
-- Co NEUMIME: rict, co cteni stalo, jestli se trefilo do cache, a ktery model z retezce
-- ["claude-opus-4-8","claude-opus-4-7"] vlastne odpovedel.
--
-- Jeden jsonb sloupec, ne pet cislenych: tvar `usage` se muze v API zmenit a jsonb to
-- prezije bez migrace. Dotazy pak jdou pres ->> ('usage'->>'output_tokens')::int.
--
-- POZOR NA PORADI: tohle SQL musi bezet DRIV, nez se nasadi proxy, ktera do sloupce pise.
-- Bez sloupce by insert selhal a cteni by se PRESTALA UKLADAT (tataz past jako
-- u prompt_draws, viz komentar v claude-proxy/index.ts).

alter table public.readings
  add column if not exists usage jsonb;

comment on column public.readings.usage is
  'Blok `usage` z odpovedi Claude + model, ktery skutecne odpovedel. Klice: input_tokens, '
  'output_tokens, cache_creation_input_tokens, cache_read_input_tokens, model. '
  'Zapisuje claude-proxy. Cte scripts/utils/stats.js. Neni osobni udaj.';

-- Cteni se nejcasteji radi podle casu; index az kdyz bude objem, ne preventivne.

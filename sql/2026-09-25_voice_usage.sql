-- 2026-09-25 — Evidence nákladů na hlas (handoff CODE-read 2026-09-24, owner 2026-09-25 „tak handoff k nákladům a elevenlabs").
--
-- Proč: dnes se ukládá jen user_profiles.voice_month_count (kolik hlasů za měsíc) — hlas nejde rozdělit na
-- admin / tester / uživatel ani ocenit podle modelu (EN eleven_multilingual_v2 ≠ IS eleven_v3). A ElevenLabs sám
-- ukazuje spotřebu jen za AKTUÁLNÍ období, takže bez vlastního zápisu není vidět trend ani kdy přejít na vyšší tarif.
--
-- (1) voice_usage — jeden řádek na každé úspěšné generování hlasu (dynamický ve čtení i statický v Kolekci):
--     znaky (= to, co EL účtuje), model, jazyk, uživatel, čas. ŽÁDNÝ text.
-- (2) voice_quota_snapshots — stav předplatného EL (GET /v1/user/subscription). Zapisuje elevenlabs-proxy nejvýš
--     jednou za 7 dní (po prvním hlasu po uplynutí týdne — žádný plánovač) a admin funkce voice-usage při každém dotazu.
--     `raw` drží celou odpověď: názvy polí se u EL můžou změnit a nic se tak neztratí.
--
-- Skupiny (admin / tester / uživatel) se NEUKLÁDAJÍ — dopočítají se při dotazu joinem na auth.users / user_profiles,
-- stejně jako u readings.usage (scripts/utils/stats.js). Uložená skupina by zastarala, když se změní tester (§20).
-- Týdenní součty Clauda ani hlasu se NEUKLÁDAJÍ taky: jsou dopočitatelné kdykoli z readings.usage a voice_usage —
-- týdenní tabulka by byla druhá kopie téhož (§20). Jediné, co jinde nebydlí, jsou čítače EL → snímky.
--
-- RLS zapnuté BEZ politik: klient (anon / authenticated) nečte ani nepíše nic. Zapisují edge funkce přes service_role,
-- čte stats.js (CLI) a admin funkce voice-usage (service_role).
-- Soukromí: user_id → při smazání účtu NULL (on delete set null) — zůstane anonymní účetní řádek (RUNAR_PRIVACY.md).

create table if not exists public.voice_usage (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null,
  source     text not null check (source in ('dynamic', 'static')),
  lang       text,
  model      text not null,
  chars      integer not null check (chars >= 0)
);
create index if not exists voice_usage_created_at_idx on public.voice_usage (created_at);
alter table public.voice_usage enable row level security;

create table if not exists public.voice_quota_snapshots (
  id              bigserial primary key,
  taken_at        timestamptz not null default now(),
  source          text not null check (source in ('weekly', 'admin')),
  tier            text,
  status          text,
  character_count integer,
  character_limit integer,
  next_reset_at   timestamptz,
  raw             jsonb not null
);
create index if not exists voice_quota_snapshots_taken_idx on public.voice_quota_snapshots (taken_at);
alter table public.voice_quota_snapshots enable row level security;

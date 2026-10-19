-- 2026-10-19 — sledování u kódů Rúnakortu (DECISIONS 2026-10-19 (4)). Spustí owner v Supabase SQL editoru.
-- Owner chce u každého kódu poznat, odkud a k čemu je: digitální / fyzický, pro sebe / dárek, kudy se prodal, za kolik, zdarma ano/ne.
-- Do té doby nesl kód jen kredity, runu a dávku (batch_id) — prodaná karta se nedala odlišit od dárku ani od kódu rozdaného na akci.
-- Vše nepovinné: staré kódy zůstanou bez údajů, nové vyplní shrine (dávka) nebo platba (objednávka). Balíček = credits (CARD_PACKS),
-- proto vlastní sloupec nemá. Platnost: žádná expirace (owner: „může použít i za pět let“) → sloupec platnosti záměrně chybí.
-- Čtení i zápis dál jen admin (RLS beze změny, DECISIONS 2026-07-17).
alter table public.gift_codes
  add column if not exists form          text check (form in ('digital', 'physical')),
  add column if not exists purpose       text check (purpose in ('self', 'gift')),
  add column if not exists channel       text,                 -- kudy se dostal ven: web, shopify, rapyd, akce, ruka…
  add column if not exists bundle        text,                 -- sada, ve které přišel (např. fyzické runy s kartou)
  add column if not exists order_ref     text,                 -- číslo objednávky u platby
  add column if not exists price         numeric(10, 2),
  add column if not exists currency      text default 'ISK',
  add column if not exists complimentary boolean not null default false,
  add column if not exists lang          text check (lang in ('is', 'en')),
  add column if not exists design        text;                 -- vzhled karty (DESIGNS na webu: o = černá, f = bílá)

-- 2026-11-02 — prompt_state: stav skládání promptu na uživatele (F3b „prompt na server“, owner „1. ano“; DECISIONS 2026-11-02 (9)).
--
-- Proč: od F3b losuje prompt server (claude-proxy, _shared/prompt_server.mjs). Sáček obrazů (aby se obraz runy neopakoval, dokud
--   nepřijdou na řadu ostatní), poslední motiv a poslední obraz runy dosud držel localStorage prohlížeče — tedy každé zařízení zvlášť
--   a v rukou prohlížeče. Teď je drží server: jeden řádek na uživatele, `data` = klíče season(bag|motif|last)_… → hodnota (jako dřív
--   v localStorage). Obsah: identifikátory obrazů run, žádný text čtení ani otázky.
-- Přístup: jen service_role (claude-proxy). RLS zapnuté a bez pravidel → appka (anon/authenticated) nic nečte ani nepíše.
-- Mazání: s účtem (on delete cascade z auth.users — delete-account i inactive-accounts volají auth.admin.deleteUser).
-- Do spuštění: proxy čtení nezastaví — chybějící tabulka = prázdný stav (los jako na novém zařízení), chyba jen v logu.
--
-- Spouští OWNER v Supabase SQL editoru (produkce). Návrat: `drop table public.prompt_state;`

create table if not exists public.prompt_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.prompt_state enable row level security;
revoke all on public.prompt_state from anon, authenticated;

-- Ověření (musí vrátit: rowsecurity = true, pravidel 0, práva anon/authenticated žádná):
select relrowsecurity as rowsecurity,
       (select count(*) from pg_policies where tablename = 'prompt_state') as pravidel,
       (select count(*) from information_schema.role_table_grants
         where table_name = 'prompt_state' and grantee in ('anon', 'authenticated')) as prava_appky
from pg_class where relname = 'prompt_state';

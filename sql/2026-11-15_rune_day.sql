-- 2026-11-15 — rune_day: text runy dne na uživatele a den (KUKY 2026-11-14/15, DECISIONS 2026-11-14 (6) a 2026-11-15 (1)).
--
-- Proč: runa dne je zdarma a jednou za islandský den (= UTC) na účet; při znovuotevření má člověk vidět TENTÝŽ text. Server (claude-proxy,
--   mode rune_day) si dnešní text najde tady a model nevolá; po úspěšném čtení ho sem zapíše. Primární klíč (user_id, den) drží „jednou denně“
--   i při dvou souběžných požadavcích. Bez tabulky claude-proxy runu dne odmítne (fail closed — jinak by zdarma režim nic nehlídalo).
-- Obsah: runa, jazyk a text runy dne. Žádná otázka ani osobní údaj — runa dne nemá vstup od člověka kromě tahu runy.
-- Přístup: appka (authenticated) smí jen ČÍST své řádky (ukázat dnešní text po znovuotevření); zapisuje jen service_role (claude-proxy).
-- Mazání: s účtem (on delete cascade z auth.users — delete-account i inactive-accounts volají auth.admin.deleteUser).
--
-- Spouští OWNER v Supabase SQL editoru (produkce). Návrat: `drop table public.rune_day;`

create table if not exists public.rune_day (
  user_id    uuid not null references auth.users(id) on delete cascade,
  den        date not null,
  rune       text not null,
  lang       text not null,
  text       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, den)
);

alter table public.rune_day enable row level security;
revoke all on public.rune_day from anon, authenticated;
grant select on public.rune_day to authenticated;
drop policy if exists rune_day_select_own on public.rune_day;
create policy rune_day_select_own on public.rune_day for select to authenticated using (auth.uid() = user_id);

-- Ověření (musí vrátit: rowsecurity = true, pravidel 1, práva appky jen SELECT):
select relrowsecurity as rowsecurity,
       (select count(*) from pg_policies where tablename = 'rune_day') as pravidel,
       (select string_agg(distinct privilege_type, ',') from information_schema.role_table_grants
         where table_name = 'rune_day' and grantee in ('anon', 'authenticated')) as prava_appky
from pg_class where relname = 'rune_day';

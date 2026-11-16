-- 2026-11-16 — Evidence nákladů na model: KAŽDÉ volání modelu, které jsme zaplatili (owner 2026-11-16: „jak to, že se neukládá?
-- platíme, tak se to má ukládat!“ … „2. ano“).
--
-- Proč: tokeny se do teď ukládaly jen do readings.usage — tedy jen u čtení a Asků, které jdou do deníku. Nezapsalo se nic u čtení
-- pro někoho jiného, životní runy, rozboru jména ani runy dne: ta volání stála peníze a z dat nešla ani spočítat. Runa dne
-- 2026-11-16: cenu šlo jen odhadnout z délky textu.
--
-- model_usage — jeden řádek na každé úspěšné volání modelu (zrcadlo voice_usage u hlasu): režim (mode z claude-proxy, '' = čtení),
-- model, usage tak, jak ho vrátil poskytovatel (+ ms a pokusy), u čtení v deníku i reading_id. ŽÁDNÝ text ani prompt.
-- readings.usage zůstává: patří ke čtení (který model ho napsal — rozbory kvality); úplný účet plateb je tahle tabulka.
--
-- RLS zapnuté BEZ politik: klient (anon / authenticated) nečte ani nepíše nic. Zapisuje claude-proxy přes service_role,
-- čtou skripty v scripts/ (CLI). Soukromí: user_id → při smazání účtu NULL (on delete set null) — zůstane anonymní účetní řádek,
-- stejně jako voice_usage (RUNAR_PRIVACY.md).

create table if not exists public.model_usage (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users(id) on delete set null,
  mode       text not null,
  model      text,
  usage      jsonb not null,
  reading_id uuid
);
create index if not exists model_usage_created_at_idx on public.model_usage (created_at);
alter table public.model_usage enable row level security;
revoke all on public.model_usage from anon, authenticated;
revoke all on sequence public.model_usage_id_seq from anon, authenticated;

-- Ověření: rowsecurity = true · pravidel = 0 · prava_appky = prázdné
select relrowsecurity as rowsecurity,
       (select count(*) from pg_policies where tablename = 'model_usage') as pravidel,
       (select string_agg(distinct privilege_type, ',') from information_schema.role_table_grants
         where table_name = 'model_usage' and grantee in ('anon', 'authenticated')) as prava_appky
from pg_class where relname = 'model_usage';

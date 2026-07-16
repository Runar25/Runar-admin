-- AUDIT: co smí veřejné API role (anon / authenticated) reálně ZAPSAT a PŘEČÍST?
-- Spustit v Supabase SQL editoru jako owner. Jen čte — nic nemění. Pouštět po KAŽDÉ
-- změně schématu, policy nebo grantů (a když se přidá tabulka).
--
-- Proč existuje: hole 2026-07-16 (uživatel si mohl PATCHnout credits_balance na svém
-- řádku) nevznikla chybou v žádné vrstvě — policy byl korektní ŘÁDKOVÝ filtr, granty byly
-- Supabase default, klient psal legitimní sloupce. Díra byla ve SPÁŘE: RLS neumí filtrovat
-- SLOUPCE, takže tabulkový GRANT UPDATE tu policy obešel v rovině, kterou hlídat nemůže.
-- Security advisor to neukázal — kouká na policies a funkce, ne na průnik grantů a policy.
--
-- has_column_privilege() je tu klíčové: počítá tabulkové I sloupcové granty i dědění rolí,
-- takže odpovídá na otázku „co ta role FAKT smí", ne „co je kde napsáno".
--
-- Kódovou půlku (klient vs. granty) hlídá scripts/verify_write_surface.js = smoke ⑩.
-- Tenhle soubor je ta druhá půlka: co je opravdu v DB.

-- ── A) MUSÍ VRÁTIT NULA ŘÁDKŮ ───────────────────────────────────────────────
-- Privilegované sloupce (peníze + oprávnění) zapisovatelné z veřejného API.
-- Cokoli tu vyjde = uživatel si to může nastavit sám z konzole prohlížeče.
select
  c.relname   as tabulka,
  a.attname   as sloupec,
  r.rolname   as role,
  p.priv      as pravo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
cross join (select unnest(array['anon','authenticated']) as rolname) r
cross join (select unnest(array['UPDATE','INSERT']) as priv) p
where n.nspname = 'public'
  and c.relkind = 'r'
  and a.attname in (
    'tier', 'credits_balance', 'free_balance',
    'month_units', 'month_key', 'drip_week', 'is_tester'
  )
  and has_column_privilege(r.rolname, c.oid, a.attname, p.priv)
order by 1, 2, 3;

-- ── B) MUSÍ VRÁTIT NULA ŘÁDKŮ ───────────────────────────────────────────────
-- Tabulky s VYPNUTÝM RLS, které veřejné API přesto smí číst.
-- RLS off + grant = policies jsou mrtvé a kdokoli s anon klíčem (je veřejně
-- v klientském JS) čte VŠECHNY řádky. Tj. únik osobních údajů, ne jen chyba.
select
  c.relname as tabulka,
  c.relrowsecurity as rls_zapnute,
  has_table_privilege('anon', c.oid, 'SELECT')          as anon_cte,
  has_table_privilege('authenticated', c.oid, 'SELECT') as auth_cte
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
  and (has_table_privilege('anon', c.oid, 'SELECT')
       or has_table_privilege('authenticated', c.oid, 'SELECT'))
order by 1;

-- ── C) K PŘEČTENÍ, ne pass/fail ─────────────────────────────────────────────
-- Celá zapisovatelná plocha. Projít očima: dává u KAŽDÉHO sloupce smysl, že ho
-- uživatel může přepsat? Když ne, patří sem sloupcový grant (viz
-- sql/2026-07-16_user_profiles_column_grants.sql jako vzor).
select
  c.relname as tabulka,
  r.rolname as role,
  string_agg(a.attname, ', ' order by a.attname) as zapisovatelne_sloupce
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
cross join (select unnest(array['anon','authenticated']) as rolname) r
where n.nspname = 'public'
  and c.relkind = 'r'
  and has_column_privilege(r.rolname, c.oid, a.attname, 'UPDATE')
group by 1, 2
order by 1, 2;

-- ── D) K PŘEČTENÍ ───────────────────────────────────────────────────────────
-- Policies s cmd=ALL: jedno pravidlo pro SELECT+INSERT+UPDATE+DELETE. Není samo
-- o sobě chyba, ale právě ono svádí k tomu nechat ho nést i sloupcovou obranu,
-- kterou nést neumí. U user_profiles taky ukáže DUPLIKÁT ("Users manage own
-- profile" + "own profile" = totéž dvakrát; neškodí, ale mate).
select tablename as tabulka, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and cmd = 'ALL'
order by 1, 2;

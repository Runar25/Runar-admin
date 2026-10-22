-- Registr kvót (owner 2026-10-22 „1. ano, schvaluji, připomínkou v souhrnu“, DECISIONS 2026-10-22 (6); úložiště doplnil CODE-read k (10)).
-- Hlídání provozu (ops-watch) potřebuje velikost databáze a úložiště: Supabase Free má 500 MB databáze a 1 GB souborů (supabase.com/pricing,
-- čteno 2026-10-22); o přetažení egressu jsme se dozvěděli až z banneru, tohle ať se nestane u místa. Funkce vrací jen dvě čísla, žádná data.
-- Registr: supabase/functions/_shared/ops_souhrn.ts (KVOTY); od 50 % řádek v ranním souhrnu, od 80 % upozornění e-mailem (stav „quota“).
-- Pouští OWNER v Supabase → SQL Editor, celé najednou. Poslední dotaz ukáže čísla.
-- Zpět: drop function public.ops_kvoty();

create or replace function public.ops_kvoty() returns jsonb
language sql security definer set search_path = pg_catalog, public as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', (select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects));
$$;
revoke all on function public.ops_kvoty() from public, anon, authenticated;
grant execute on function public.ops_kvoty() to service_role;

select public.ops_kvoty();

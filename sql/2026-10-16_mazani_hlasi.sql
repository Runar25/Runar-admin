-- Mazání zpráv čtenářů hlásí, kde a co smazalo (owner 2026-10-16 k mazání po 6 měsících: „chci vždy potvrzení že úloha po 6 měsících
-- proběhla kde a co smazala. musíme mít kontroly! to platí pro všechna podobné příkazy.“).
-- Do té doby mazal pg_cron (sql/2026-10-15_zpravy_runarovi.sql) beze stopy. Teď to dělá funkce, která každý běh zapíše do ops_events
-- (kind „purge“, job messages_db): kolik zpráv smazala a jejich krátká id — i nulu, ať jde poznat, že běžela. Hlídání provozu (ops-watch)
-- ohlásí, když se neozve déle než 26 h nebo selže, a navíc samo spočítá zprávy, které v DB po lhůtě zůstaly. Ranní souhrn ukáže řádek
-- „Deleted (24 h)“. Registr mazacích úloh: supabase/functions/_shared/ops_souhrn.ts (MAZANI).
-- Pravidlo beze změny: zpráva typu „message“ se smaže 6 měsíců po poslední odpovědi (resolved_at — od 2026-10-16 ho zapisuje plánovaná
-- úloha nad Gmailem, scripts/utils/zpravy_gmail.js), bez odpovědi 6 měsíců po přijetí.
-- Pouští OWNER v Supabase → SQL Editor, celé najednou. Poslední dotaz spustí jeden běh hned: smaže jen zprávy po lhůtě (2026-10-16
-- žádné nejsou, nejstarší je ze dne) a zapíše první potvrzení.
-- Zpět: select cron.unschedule('zpravy-runarovi-mazani'); a znovu naplánovat podle sql/2026-10-15_zpravy_runarovi.sql.

begin;
create or replace function public.purge_reader_messages() returns integer
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_ids text[];
begin
  with smazane as (
    delete from public.bug_reports
    where type = 'message' and coalesce(resolved_at, created_at) < now() - interval '6 months'
    returning left(id::text, 8) as id8
  )
  select coalesce(array_agg(id8 order by id8), '{}') into v_ids from smazane;
  insert into public.ops_events (kind, detail)
  values ('purge', jsonb_build_object('job', 'messages_db', 'ok', true, 'deleted', coalesce(array_length(v_ids, 1), 0), 'items', to_jsonb(v_ids)));
  return coalesce(array_length(v_ids, 1), 0);
exception when others then
  insert into public.ops_events (kind, detail)
  values ('purge', jsonb_build_object('job', 'messages_db', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));
  return -1;
end $$;
revoke all on function public.purge_reader_messages() from public, anon, authenticated;
commit;

select cron.unschedule('zpravy-runarovi-mazani');
select cron.schedule('zpravy-runarovi-mazani', '10 3 * * *', $$select public.purge_reader_messages()$$);

-- kontrola: úloha volá funkci · jeden běh hned · jeho potvrzení
select jobname, schedule, command, active from cron.job where jobname = 'zpravy-runarovi-mazani';
select public.purge_reader_messages() as smazano;
select created_at, detail from public.ops_events where kind = 'purge' order by created_at desc limit 1;

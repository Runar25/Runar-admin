-- Mazání dat, která jinak rostou bez konce (owner 2026-10-22 „6. po celou dobu účtu 7. ano, předej 8. 12 měsíců“, DECISIONS 2026-10-22 (10);
-- zadání CODE-read, kolo (a) průchodu). Tři úlohy, každá hlásí do ops_events (kind „purge“, svůj job), i nulu — ať jde poznat, že běžela.
-- Registr: supabase/functions/_shared/ops_souhrn.ts (MAZANI); hlídání (ops-watch) ohlásí selhání nebo neozvání do 26 h, ranní souhrn
-- ukáže „Deleted (24 h)“. Vzor: sql/2026-10-16_mazani_hlasi.sql (zprávy čtenářů).
--   cron_history — cron.job_run_details starší 30 dní (ops-watch-check běží po 15 min = ~100 řádků denně; historie běhů nic dalšího nenese)
--   ops_events   — provozní záznamy starší 90 dní; POSLEDNÍ záznam každého druhu (u „purge“ každé úlohy) zůstává vždy: ops-watch podle něj
--                  pozná poslední úspěch zálohy a úloh (MAZANI, BEHY — nejdelší lhůta 35 dní). Bez téhle výjimky by úloha, která 90 dní
--                  neběžela, přišla o záznam a ze stavu „problem“ by se stalo „unknown“. Osobní údaje ops_events nenesou (2026-10-22 ověřeno).
--   reports_db   — hlášení z appky (bug_reports mimo typ „message“) 12 měsíců po vyřešení (stav „fixed“, resolved_at; bez něj od přijetí);
--                  nevyřešená zůstávají. Zprávy čtenářů (typ „message“) má vlastní úloha (6 měsíců, purge_reader_messages).
-- Pouští OWNER v Supabase → SQL Editor, celé najednou. Poslední dotazy spustí jeden běh hned (dnes smaže jen historii plánovače starší
-- 30 dní — žádná není, nejstarší je ze 14. 10.) a ukážou tři potvrzení.
-- Zpět: select cron.unschedule('provoz-mazani'); drop function public.purge_ops_data();

begin;
create or replace function public.purge_ops_data() returns jsonb
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_n integer;
  v_ids text[];
  v_vysledek jsonb := '{}';
begin
  -- 1) historie plánovače
  begin
    delete from cron.job_run_details where end_time < now() - interval '30 days';
    get diagnostics v_n = row_count;
    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'cron_history', 'ok', true, 'deleted', v_n));
    v_vysledek := v_vysledek || jsonb_build_object('cron_history', v_n);
  exception when others then
    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'cron_history', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));
    v_vysledek := v_vysledek || jsonb_build_object('cron_history', -1);
  end;
  -- 2) provozní záznamy (poslední záznam každého druhu / každé mazací úlohy zůstává)
  begin
    delete from public.ops_events e
    where e.created_at < now() - interval '90 days'
      and e.id not in (
        select distinct on (kind, coalesce(detail->>'job', '')) id from public.ops_events
        order by kind, coalesce(detail->>'job', ''), created_at desc);
    get diagnostics v_n = row_count;
    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'ops_events', 'ok', true, 'deleted', v_n));
    v_vysledek := v_vysledek || jsonb_build_object('ops_events', v_n);
  exception when others then
    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'ops_events', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));
    v_vysledek := v_vysledek || jsonb_build_object('ops_events', -1);
  end;
  -- 3) hlášení z appky 12 měsíců po vyřešení
  begin
    with smazane as (
      delete from public.bug_reports
      where type <> 'message' and status = 'fixed' and coalesce(resolved_at, created_at) < now() - interval '12 months'
      returning left(id::text, 8) as id8
    )
    select coalesce(array_agg(id8 order by id8), '{}') into v_ids from smazane;
    insert into public.ops_events (kind, detail)
    values ('purge', jsonb_build_object('job', 'reports_db', 'ok', true, 'deleted', coalesce(array_length(v_ids, 1), 0), 'items', to_jsonb(v_ids)));
    v_vysledek := v_vysledek || jsonb_build_object('reports_db', coalesce(array_length(v_ids, 1), 0));
  exception when others then
    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'reports_db', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));
    v_vysledek := v_vysledek || jsonb_build_object('reports_db', -1);
  end;
  return v_vysledek;
end $$;
revoke all on function public.purge_ops_data() from public, anon, authenticated;
commit;

select cron.schedule('provoz-mazani', '20 3 * * *', $$select public.purge_ops_data()$$);

-- kontrola: úloha · jeden běh hned · jeho tři potvrzení
select jobname, schedule, command, active from cron.job where jobname = 'provoz-mazani';
select public.purge_ops_data() as smazano;
select created_at, detail from public.ops_events where kind = 'purge' and detail->>'job' in ('cron_history', 'ops_events', 'reports_db')
order by created_at desc limit 3;

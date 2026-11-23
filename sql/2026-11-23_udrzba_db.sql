-- 2026-11-23 — Údržba DB (nálezy údržby 2026-11-23, oblast G/H; RUNAR_UDRZBA.md). SPOUŠTÍ SE AŽ S OWNEROVÝM ANO (mění produkční DB).
-- (1) purge_ops_data: mazání ops_events po 90 dnech nechávalo nejnovější řádek každého (kind, job) — i u client_error, kde nese zprávu
--     chyby, soubor, záložku a verzi; zásady soukromí slibují „smazáno po 90 dnech“. Výjimka teď neplatí pro client_error (ostatní kindy
--     ji potřebují: hlídání provozu čte poslední běh úlohy). Jinak tělo funkce beze změny (z pg_get_functiondef 2026-11-23).
-- (2) runar_static_audio: politika admins_select_static_audio měla USING (true) → kdokoli přihlášený viděl i nehotové (ready=false)
--     texty. Uživatelům stačí „Public can read ready audio“; shrine čte jako admin.
-- (3) anon a authenticated mají na tabulkách public i TRUNCATE, TRIGGER a REFERENCES (výchozí granty Supabase). Přes API je použít
--     nejde a RLS chrání řádky — obrana do hloubky, klient je nepotřebuje.
-- Zpět: (1) původní definice v sql/2026-10-22_mazani_provoz.sql · (2) alter policy … using (true) · (3) grant truncate, trigger, references …
begin;

CREATE OR REPLACE FUNCTION public.purge_ops_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$

declare

  v_n integer;

  v_ids text[];

  v_vysledek jsonb := '{}';

begin

  begin

    delete from cron.job_run_details where end_time < now() - interval '30 days';

    get diagnostics v_n = row_count;

    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'cron_history', 'ok', true, 'deleted', v_n));

    v_vysledek := v_vysledek || jsonb_build_object('cron_history', v_n);

  exception when others then

    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'cron_history', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));

    v_vysledek := v_vysledek || jsonb_build_object('cron_history', -1);

  end;

  begin

    delete from public.ops_events e

    where e.created_at < now() - interval '90 days'

      and (e.kind = 'client_error' or e.id not in (

        select distinct on (kind, coalesce(detail->>'job', '')) id from public.ops_events

        order by kind, coalesce(detail->>'job', ''), created_at desc));

    get diagnostics v_n = row_count;

    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'ops_events', 'ok', true, 'deleted', v_n));

    v_vysledek := v_vysledek || jsonb_build_object('ops_events', v_n);

  exception when others then

    insert into public.ops_events (kind, detail) values ('purge', jsonb_build_object('job', 'ops_events', 'ok', false, 'deleted', 0, 'error', left(sqlerrm, 120)));

    v_vysledek := v_vysledek || jsonb_build_object('ops_events', -1);

  end;

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

end $function$;

alter policy admins_select_static_audio on public.runar_static_audio using (public.je_admin());

revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

commit;

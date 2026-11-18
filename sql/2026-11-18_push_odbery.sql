-- 2026-11-18 — Upozornění na runu dne, Android (owner 2026-11-17 „11. ok udělej pro android, apple backlog“; klíče VAPID uložil
-- scripts/vapid_klice.js 2026-11-18, owner „3. pusť ten skript sám“). Telefon si u prohlížeče vyžádá odběr (endpoint push služby
-- + dva veřejné klíče prohlížeče) a appka ho sem zapíše; funkce rune-day-push ho ráno použije.
-- Proč tabulka a ne sloupec v user_profiles: jeden člověk = víc zařízení. Endpoint je osobní údaj (adresa u Google push služby) →
-- při smazání účtu jde pryč s ním (on delete cascade); mrtvé odběry (služba vrátí 404/410) maže rune-day-push a hlásí to (MAZANI push_subs).
-- Appka smí: vložit / smazat / číst JEN své řádky. Endpoint jen https a jen známé push služby — funkce na něj posílá požadavek se
-- serverovým podpisem, cizí adresa by z ní dělala posla kamkoli (tutéž kontrolu má funkce sama, tohle je druhá vrstva).
-- Zpět: select cron.unschedule('rune-day-push'); drop table public.push_subscriptions;

create table if not exists public.push_subscriptions (
  endpoint   text primary key check (char_length(endpoint) <= 1000 and endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com|web\.push\.apple\.com)/'),
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  lang       text check (lang in ('en', 'is')),
  created_at timestamptz not null default now(),
  last_sent  timestamptz
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
grant insert (endpoint, user_id, p256dh, auth, lang) on public.push_subscriptions to authenticated;
drop policy if exists push_own_select on public.push_subscriptions;
drop policy if exists push_own_insert on public.push_subscriptions;
drop policy if exists push_own_delete on public.push_subscriptions;
create policy push_own_select on public.push_subscriptions for select to authenticated using (auth.uid() = user_id);
create policy push_own_insert on public.push_subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy push_own_delete on public.push_subscriptions for delete to authenticated using (auth.uid() = user_id);

-- Ráno v 09:00 UTC (= 9:00 na Islandu, 10:00 ve střední Evropě v zimě). Tajná hodnota z vaultu jako ostatní úlohy (sql/2026-10-14_ops_watch.sql).
select cron.unschedule('rune-day-push') where exists (select 1 from cron.job where jobname = 'rune-day-push');
select cron.schedule('rune-day-push', '0 9 * * *', $$
  select net.http_post(
    url := 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/rune-day-push',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-ops-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ops_cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000);
$$);

-- Ověření: vlozit = auth,endpoint,lang,p256dh,user_id · pravidel = 3 · uloha = 0 9 * * * true
select (select string_agg(column_name, ',' order by column_name) from information_schema.column_privileges
         where table_schema = 'public' and table_name = 'push_subscriptions' and grantee = 'authenticated' and privilege_type = 'INSERT') as vlozit,
       (select count(*) from pg_policies where tablename = 'push_subscriptions') as pravidel,
       (select schedule || ' ' || active from cron.job where jobname = 'rune-day-push') as uloha;

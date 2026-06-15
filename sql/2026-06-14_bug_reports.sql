-- bug_reports — in-app tester hlášení (reporter). Spec: runar_reporter_spec_CODE.md
-- Anon/tester: POUZE INSERT. Čtení jen service role / dashboard (žádný anon SELECT).
-- Dedupe: client_uuid UNIQUE → klient dělá insert ... on conflict (client_uuid) do nothing.
-- Aplikovat: Supabase SQL editor, projekt pmitxjvkeovijreepror.

create table if not exists public.bug_reports (
  id                     uuid primary key default gen_random_uuid(),
  client_uuid            uuid not null unique,                                   -- dedupe / idempotence
  tester                 text,
  type                   text not null
                           check (type in ('replace','rephrase','pattern','visual','crash','other')),
  message                text  check (message is null or char_length(message) <= 1000),
  suggested_replacement  text  check (suggested_replacement is null or char_length(suggested_replacement) <= 1000),
  flagged_text           text  check (flagged_text is null or char_length(flagged_text) <= 5000),
  flagged_source         text  check (flagged_source is null or flagged_source in ('selection','screen')),  -- improvement: přesnost flagged_text
  i18n_key               text,                                                   -- improvement: překladový klíč → auto-routing triáže
  screen_context         text,                                                   -- improvement: aktivní tab + #kontejner
  locale                 text,
  app_version            text,
  user_agent             text,
  reported_at            timestamptz,
  synced_at              timestamptz not null default now(),
  status                 text not null default 'new'
                           check (status in ('new','triaged','fixed'))
);

create index if not exists bug_reports_status_idx   on public.bug_reports (status);
create index if not exists bug_reports_type_idx     on public.bug_reports (type);
create index if not exists bug_reports_reported_idx on public.bug_reports (reported_at desc);

alter table public.bug_reports enable row level security;

-- Testeři (anon i přihlášení) smí jen vkládat, nikdy číst cizí hlášení.
drop policy if exists bug_reports_insert on public.bug_reports;
create policy bug_reports_insert
  on public.bug_reports for insert
  to anon, authenticated
  with check (true);

-- Žádná SELECT/UPDATE/DELETE policy → anon nemá čtení ani úpravy.
-- Service role obchází RLS → triáž (Cowork) a dashboard čtou přes service role.

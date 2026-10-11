-- 2026-10-11 (CODE-tune) — hlas ke každému čtení, jednou; hlas uloženého čtení se drží v úložišti a v deníku se dá pustit znovu.
--
-- Proč: RUNAR_DECISIONS.md 2026-10-11 (61). Owner: „jo varianta 7 [je] dobře“ · „vytvoří se čtení, uloží do databáze a může přehrát
-- znova v deníku ne? … ok udělej“. Do té doby elevenlabs-proxy přečetl jakýkoli text a „jedno čtení = jeden hlas“ hlídalo jen tlačítko.
--
-- (1) public.voice_tickets — „tohle čtení už jednou zaznělo“. Píše JEN elevenlabs-proxy (service_role), klient tabulku nevidí.
--     id = 'r:<reading_id>' (uložené čtení) nebo 't:<nonce>' (podpis neuloženého čtení, _shared/voice_ticket.ts).
--     path = kde v úložišti leží audio (jen uložené čtení); NULL = zaznělo, ale neuložilo se.
--     Řádek vzniká PŘED voláním ElevenLabs (dvě souběžná ťuknutí nezaplatí hlas dvakrát); když ElevenLabs selže, proxy ho smaže.
-- (2) úložiště reading-voice — SOUKROMÉ (žádná veřejná adresa); přehrání jde přes podepsaný odkaz z elevenlabs-proxy na hodinu.
--     Soubor <user_id>/<reading_id>.mp3. Smaže ho delete-account se zbytkem účtu (RUNAR_PRIVACY.md „Retence + práva“).
-- Spustit JEDNOU v Supabase → SQL Editor, pak nasadit elevenlabs-proxy (bez tabulky by hlas spadl na „voice_lock_failed“).

begin;

create table if not exists public.voice_tickets (
  id         text primary key check (id ~ '^(r|t):[0-9a-f-]{36}$'),
  user_id    uuid not null references auth.users(id) on delete cascade,
  path       text,
  created_at timestamptz not null default now()
);
create index if not exists voice_tickets_user_idx on public.voice_tickets(user_id);
alter table public.voice_tickets enable row level security;   -- bez politik: klient nic, service_role obchází RLS
revoke all on public.voice_tickets from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reading-voice', 'reading-voice', false, 10485760, array['audio/mpeg'])
on conflict (id) do nothing;

commit;

-- Ověření (vrátí 1 řádek tabulky a 1 soukromé úložiště):
--   select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'voice_tickets';
--   select id, public from storage.buckets where id = 'reading-voice';

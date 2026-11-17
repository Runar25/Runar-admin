-- 2026-11-17 — Deník runy dne: člověk si ke dni zapíše, co mu zůstalo, a později může připsat ohlédnutí (owner 2026-11-17:
-- „umožníme zápis do deníku … jiný deník než runový, ale s tím, že vidí, jakou runu ten den vytáhl, a může si zapsat, co se mu líbilo“;
-- k první verzi „souhlasím“). Appka smí psát JEN tyhle dva sloupce a jen do svých řádků; runu, text a ostatní píše dál jen claude-proxy.
-- Klientskou stranu hlídá scripts/verify_write_surface.js (rune_day) — zapisuje-li appka jiný sloupec, smoke spadne.

alter table public.rune_day add column if not exists note text check (note is null or char_length(note) <= 2000);
alter table public.rune_day add column if not exists note_later text check (note_later is null or char_length(note_later) <= 2000);

grant update (note, note_later) on public.rune_day to authenticated;
drop policy if exists rune_day_update_own on public.rune_day;
create policy rune_day_update_own on public.rune_day for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ověření: zapisovatelne = note,note_later · pravidel = 2 (číst své, upravit své)
select (select string_agg(column_name, ',' order by column_name) from information_schema.column_privileges
         where table_schema = 'public' and table_name = 'rune_day' and grantee = 'authenticated' and privilege_type = 'UPDATE') as zapisovatelne,
       (select count(*) from pg_policies where tablename = 'rune_day') as pravidel;

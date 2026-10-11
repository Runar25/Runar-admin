-- 2026-10-11 (CODE-tune, DECISIONS 2026-10-11 (48) — owner: „potřebuju to hlídat!“): snímky stavu ElevenLabs nově i nejvýš 1× denně při
-- hlasu ('daily') a při každém zastavení brzdou kreditů ('brake'). Do té doby jen 'weekly' (1× za 7 dní, poslední 2026-10-05) a 'admin'
-- (otevření VOICE ve shrine). Staré řádky 'weekly' zůstávají.
-- Pustit PŘED nasazením elevenlabs-proxy / elevenlabs-static s brzdou: bez toho se nové snímky jen zalogují jako chyba (hlas to neshodí).
-- Ověření po puštění: insert se zdrojem 'daily' projde, se zdrojem 'jiny' ne (ověřuje CODE-tune čtením pg_constraint).

alter table public.voice_quota_snapshots drop constraint if exists voice_quota_snapshots_source_check;
alter table public.voice_quota_snapshots add constraint voice_quota_snapshots_source_check
  check (source in ('weekly', 'admin', 'daily', 'brake'));

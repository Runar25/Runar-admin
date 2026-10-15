-- 2026-10-15 (CODE-tune) — zprávy „Send Rúnar a line“ / „Sendu Rúnari línu“: nový typ hlášení „message“ + mazání po 6 měsících.
--
-- Proč: owner 2026-10-15 k plánu (DECISIONS 2026-10-15): „8. ano 9. ano 10. ano“ — běžný uživatel píše Rúnarovi z menu, zpráva se uloží
-- do bug_reports a přijde e-mailem do runar@therunekeeper.com (edge funkce send-line); zprávy se mažou 6 měsíců po poslední odpovědi.
-- „Poslední odpověď“ = resolved_at (nastaví ji shrine, když owner zprávu po odpovědi označí „fixed“); bez odpovědi se počítá od přijetí.
--
-- ⚠️ POŘADÍ: spustit DŘÍV, než se nasadí edge funkce send-line — bez nového typu DB zprávu odmítne (23514). Funkce pak zprávu aspoň
--    pošle e-mailem, ale do databáze se nedostane.

begin;

alter table public.bug_reports drop constraint if exists bug_reports_type_check;
alter table public.bug_reports add constraint bug_reports_type_check
  check (type in ('replace','rephrase','pattern','visual','crash','other','keep','grammar','message'));

commit;

-- Mazání: každý den ve 03:10 UTC zprávy, u kterých od poslední odpovědi (bez odpovědi od přijetí) uběhlo 6 měsíců.
-- pg_cron je zapnutý od 2026-10-14 (sql/2026-10-14_ops_watch.sql). Znovu spuštěný řádek úlohu přepíše (stejné jméno).
select cron.schedule(
  'zpravy-runarovi-mazani',
  '10 3 * * *',
  $$delete from public.bug_reports where type = 'message' and coalesce(resolved_at, created_at) < now() - interval '6 months'$$
);

-- Ověření (oba dotazy musí něco vrátit):
-- select pg_get_constraintdef(oid) from pg_constraint where conname = 'bug_reports_type_check';   -- obsahuje 'message'
-- select jobname, schedule, active from cron.job where jobname = 'zpravy-runarovi-mazani';         -- active = true

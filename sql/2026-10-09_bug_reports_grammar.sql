-- 2026-10-09 (CODE-tune) — bug_reports: nový typ „grammar“ (hlášení testerů).
--
-- KUKY 2026-10-09 (hlášení 83f2d16c + „15. keep jen admin, ano podle bodu 8“): tester hlásí hlavně gramatiku a špatně použitá slova.
-- Tester vidí typy Grammar · Wrong word (= rephrase) · Visual · Error · Other; admin navíc Replace text, Repeated phrase a ✦ Keep
-- (v2/runar-reporter.js). Ostatní typy beze změny.
--
-- ⚠️ POŘADÍ: tahle migrace MUSÍ běžet DŘÍV, než se nasadí reportér s typem „grammar“ — jinak DB hlášení odmítne (23514)
--    a reportér ho nechá ve frontě zařízení (flush maže jen úspěch), viz 2026-09-30_bug_reports_keep_a_limity.sql.

begin;

alter table public.bug_reports drop constraint if exists bug_reports_type_check;
alter table public.bug_reports add constraint bug_reports_type_check
  check (type in ('replace','rephrase','pattern','visual','crash','other','keep','grammar'));

commit;

-- Ověření: musí vrátit řádek s 'grammar' v definici.
-- select pg_get_constraintdef(oid) from pg_constraint where conname = 'bug_reports_type_check';

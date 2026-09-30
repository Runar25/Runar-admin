-- 2026-09-30 (CODE-tune) — bug_reports: nový typ „keep“ + OPRAVA stropů textu.
--
-- (1) Typ „keep“ = uložit dobré čtení / větu jako materiál pro vizuály. KUKY 2026-09-29 bod 6: „některá čtení jsou fakt dobrá,
--     popřípadě vyjde dobrý závěr, a to chci ukládat tak, abychom měli materiál na vizuální tvorbu“; „6. ano“.
-- (2) OPRAVA (§22, nalezeno při téže práci): message a suggested_replacement měly v DB strop 1000 znaků, ale reportér od
--     2026-09-22 posílá až 5000 (runar-reporter.js: „DB limit nemá“ — omyl, check tam byl). Delší hlášení DB odmítla (23514)
--     a reportér ho nechal ve frontě zařízení navždy — flush maže frontu jen při úspěchu nebo duplicitě, tester přitom viděl
--     „odesláno“. Po téhle migraci taková hlášení odejdou při příštím otevření appky na tom zařízení (flush při startu).
--
-- Výpis uložených („keep“) pro vizuály:
--   select reported_at, tester, locale, screen_context, flagged_text, message
--   from public.bug_reports where type = 'keep' order by reported_at desc;

begin;

alter table public.bug_reports drop constraint if exists bug_reports_type_check;
alter table public.bug_reports add constraint bug_reports_type_check
  check (type in ('replace','rephrase','pattern','visual','crash','other','keep'));

alter table public.bug_reports drop constraint if exists bug_reports_message_check;
alter table public.bug_reports add constraint bug_reports_message_check
  check (message is null or char_length(message) <= 5000);

alter table public.bug_reports drop constraint if exists bug_reports_suggested_replacement_check;
alter table public.bug_reports add constraint bug_reports_suggested_replacement_check
  check (suggested_replacement is null or char_length(suggested_replacement) <= 5000);

commit;

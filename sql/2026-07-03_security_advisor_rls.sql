-- RÚNAR — Security Advisor fixes: RLS "Policy Always True"
-- Projekt pmitxjvkeovijreepror · pustit v Supabase SQL editoru
-- Date: 2026-07-03
--
-- Advisor hlásí USING(true)/WITH CHECK(true) na: bug_reports, knowledge_base,
-- runar_character, runar_corrections. Návrh vychází z reálného použití v kódu:
--
--   runar_corrections  — reader loadCorrections() ČTE pro KAŽDÉHO uživatele
--                        (runar-app.js:941). Shrine (admin) zapisuje.
--                        → SELECT veřejný, zápis jen admin.
--   runar_character    — v2 ČTE výhradně shrine (runar-shrine.html:1297); reader
--                        používá hardcoded DEF_CHAR z runar-character.js.
--                        → vše jen admin.  (Kdyby reader někdy načítal aktivní
--                          postavu z DB, uvolni SELECT na 'authenticated'.)
--   knowledge_base     — v2 ji nikdo nečte ani nezapisuje (jen starý
--                        Old_Runar_index.html). → zamknout na admin/service_role.
--   bug_reports        — ZÁMĚRNĚ ponechána (viz sekce 4). Insert-only veřejný
--                        formulář; check(true) je tam správně.
--
-- Admin = e-mail v JWT (shodně s ADMIN_EMAILS v kódu).
-- service_role obchází RLS → edge funkce nejsou dotčené.
-- Idempotentní: každá tabulka nejdřív shodí své staré policies, pak vytvoří nové.

-- ── Sdílený admin predikát (inline v každé policy) ──────────────────────────
--   lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is')

-- ════════════════════════════════════════════════════════════════════════════
-- 1. runar_corrections  — veřejné čtení, zápis jen admin
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.runar_corrections ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='runar_corrections'
  LOOP EXECUTE format('DROP POLICY %I ON public.runar_corrections', pol.policyname); END LOOP;
END $$;

CREATE POLICY runar_corrections_public_read
  ON public.runar_corrections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY runar_corrections_admin_write
  ON public.runar_corrections FOR ALL
  TO authenticated
  USING      (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'))
  WITH CHECK (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'));

-- ════════════════════════════════════════════════════════════════════════════
-- 2. runar_character  — čte i zapisuje jen admin (shrine)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.runar_character ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='runar_character'
  LOOP EXECUTE format('DROP POLICY %I ON public.runar_character', pol.policyname); END LOOP;
END $$;

CREATE POLICY runar_character_admin_all
  ON public.runar_character FOR ALL
  TO authenticated
  USING      (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'))
  WITH CHECK (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'));

-- ════════════════════════════════════════════════════════════════════════════
-- 3. knowledge_base  — v2 nepoužívá; admin/service_role only
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='knowledge_base'
  LOOP EXECUTE format('DROP POLICY %I ON public.knowledge_base', pol.policyname); END LOOP;
END $$;

CREATE POLICY knowledge_base_admin_all
  ON public.knowledge_base FOR ALL
  TO authenticated
  USING      (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'))
  WITH CHECK (lower(auth.jwt() ->> 'email') IN ('kukula@agndofa.is','info@agndofa.is'));

-- ════════════════════════════════════════════════════════════════════════════
-- 4. bug_reports  — ZÁMĚRNĚ NEMĚNÍME
-- ════════════════════════════════════════════════════════════════════════════
-- Politika bug_reports_insert (anon, authenticated, WITH CHECK true) je správný
-- design anonymního hlášení chyb: tester smí JEN vložit, nikdy číst cizí data
-- (žádná SELECT policy). check(true) nelze zúžit — anon nemá identitu ke scope.
-- Advisor warning je zde akceptovaný. Když tě ruší v přehledu, dá se v Advisoru
-- ručně "dismissnout". Kód: sql/2026-06-14_bug_reports.sql.

-- ── Verify: přehled policies na dotčených tabulkách ─────────────────────────
SELECT tablename, policyname, cmd, roles,
       qual        AS using_expr,
       with_check  AS check_expr
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('runar_corrections','runar_character','knowledge_base','bug_reports')
ORDER BY tablename, policyname;

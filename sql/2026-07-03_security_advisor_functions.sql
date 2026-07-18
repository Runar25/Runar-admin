-- RÚNAR — Security Advisor fixes: FUNKCE
-- Projekt pmitxjvkeovijreepror · pustit v Supabase SQL editoru
-- Date: 2026-07-03
--
-- Řeší dvě kategorie z Security Advisoru:
--   (A) "Function Search Path Mutable"
--        → add_credits, use_credit, update_updated_at, check_rate_limit
--   (B) "SECURITY DEFINER callable without/with signing in"
--        → add_credits, use_credit, check_rate_limit
--
-- Proč je (B) reálná díra: add_credits je SECURITY DEFINER a měla EXECUTE pro PUBLIC.
-- To znamená, že kdokoli s (veřejným) anon klíčem mohl zavolat
--   POST /rest/v1/rpc/add_credits  { p_user_id: <sám sebe>, p_amount: 99999 }
-- a přidat si kredity — funkce běží s právy vlastníka a obchází RLS.
-- Tyto funkce volají POUZE edge funkce (claude-proxy, redeem-code, elevenlabs-proxy)
-- přes service_role, který granty obchází → revoke z anon/authenticated je bezpečný.
--
-- Celý soubor je idempotentní (DO bloky procházejí pg_proc, nezávislé na signatuře).
-- Bezpečné pustit opakovaně.

-- ── (A) Zafixovat search_path u všech přetížení daných funkcí ────────────────
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('add_credits','use_credit','update_updated_at','check_rate_limit')
  LOOP
    -- pg_catalog první (chrání před shadowingem built-inů), public pro nekvalifikované
    -- odkazy na app tabulky (user_profiles atd.). Fixní path = warning zmizí.
    EXECUTE format('ALTER FUNCTION %s SET search_path = pg_catalog, public', fn.sig);
    RAISE NOTICE 'search_path zafixován: %', fn.sig;
  END LOOP;
END $$;

-- ── (B) Odebrat EXECUTE veřejnosti u SECURITY DEFINER credit/rate funkcí ─────
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('add_credits','use_credit','check_rate_limit')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
    EXECUTE format('GRANT  EXECUTE ON FUNCTION %s TO service_role', fn.sig);
    RAISE NOTICE 'EXECUTE zamčen na service_role: %', fn.sig;
  END LOOP;
END $$;

-- ── Verify: search_path nastaven + žádné anon/authenticated EXECUTE granty ───
SELECT p.oid::regprocedure AS function,
       p.prosecdef         AS security_definer,
       p.proconfig         AS settings   -- musí obsahovat search_path=pg_catalog, public
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('add_credits','use_credit','update_updated_at','check_rate_limit')
ORDER BY 1;

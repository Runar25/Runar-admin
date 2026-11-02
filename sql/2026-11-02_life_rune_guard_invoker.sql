-- 2026-11-02 — Brána životní runy (trg_life_rune_immutable) konečně platí: funkce jako SECURITY INVOKER.
--
-- Proč (CODE-tune, nalezeno při F3a (d), DECISIONS 2026-11-02 (6)):
--   guard_life_rune_immutable() běží jako SECURITY DEFINER s vlastníkem postgres. Uvnitř takové funkce je `current_user` VLASTNÍK,
--   ne ten, kdo zapisuje — takže první podmínka `if current_user not in ('authenticated', 'anon') then return new` pustila VŠECHNO
--   a brána od 2026-07-19 nikdy nezabrala. Doklad bez zápisu: sesterský trigger ledger_user_profiles (také DEFINER, vlastník postgres)
--   zapisuje `current_user` do credit_ledger.actor — všech 106 jeho záznamů má actor = postgres, i čtení odečtená z claude-proxy
--   (service_role). Prohlížeč přitom má UPDATE na life_rune_text / life_rune_number / dob_* (sql/2026-07-16_user_profiles_column_grants.sql),
--   takže si životní runu mohl přepsat nebo vymazat a čtení životní runy (zdarma, „jen jednou“) si nechat psát znovu.
--
-- Co: funkce poběží s právy toho, kdo zapisuje (INVOKER) → `current_user` = authenticated / anon / service_role / postgres, jak bylo
--   zamýšleno. Funkce jen porovnává OLD a NEW, žádnou tabulku nečte ani nepíše, takže práva vlastníka nepotřebuje. Tělo beze změny.
--   Server (claude-proxy, service_role) a SQL editor (postgres) projdou dál; prohlížeč nastavenou runu ani datum narození nezmění.
--
-- Spouští OWNER v Supabase SQL editoru (produkce). Návrat: `alter function public.guard_life_rune_immutable() security definer;`

alter function public.guard_life_rune_immutable() security invoker;

-- Ověření (musí vrátit prosecdef = false):
select proname, pg_get_userbyid(proowner) as vlastnik, prosecdef
from pg_proc where proname = 'guard_life_rune_immutable';

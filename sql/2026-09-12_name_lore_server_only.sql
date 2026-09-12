-- Rozbor jmena pise JEN server (KROK 2 ze dvou — KROK 1 je 2026-09-12_two_names.sql).
--
-- PROC: claude-proxy poustela rozbor jmena (zdarma) jen tehdy, kdyz byl `name_lore_text` prazdny.
-- Jenze na ten sloupec mel klient grant UPDATE (overeno v zive DB 2026-09-12), takze kdo umel F12,
-- vynuloval si ho a nechal si rozbor generovat dokola na nas ucet. Od 2026-09-12 proxy rozhoduje
-- podle `name_lore_for` + `name_lore_count` a text uklada sama pres service_role.
--
-- ⚠️ POUSTET AZ PO nasazeni klienta, ktery `name_lore_text` NEPISE. Obracene by stary klient pri
-- kazdem ulozeni rozboru dostal 403.

revoke update (name_lore_text) on public.user_profiles from authenticated;

-- Kontrola po spusteni:
--   select column_name from information_schema.column_privileges
--    where table_name = 'user_profiles' and grantee = 'authenticated' and privilege_type = 'UPDATE';
--   → NESMI obsahovat name_lore_text, name_lore_for, name_lore_count

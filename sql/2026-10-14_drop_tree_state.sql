-- 2026-10-14 — smazání staré „paměti o člověku“ (Vrstvy A/B/C): tabulka tree_state. Spustí owner v Supabase SQL editoru.
-- Owner 2026-10-14: „aha.. tak to je hodně staré. smaž to.“ (DECISIONS 2026-10-14 (6)). Tabulku plnila jen edge funkce tree-update
-- (nikdy ji appka nevolala, z nasazení stažena 2026-10-10) a četl ji jen vypnutý blok v claude-proxy (smazán týž den).
-- V produkci 1 řádek (stav 2026-10-14). Politiky („Users see own tree state“, „Users update own tree state“) zmizí s tabulkou.
-- Plán stromu (RUNAR_TREE.md, „Muninn“) počítá s jiným úložištěm s jiným schématem — až vznikne, bude to nová tabulka.
drop table if exists public.tree_state;

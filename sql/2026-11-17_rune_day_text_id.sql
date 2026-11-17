-- 2026-11-17 — Runa dne z knihovny: u každého dne se uloží, který text z knihovny člověk dostal (owner 2026-11-17: „vyrobíme jich
-- několik a budeme je střídat … čtení jedné runy se nesmí opakovat, takže pojede počítadlo pro uživatele“; „1. ano“).
-- text_id = id záznamu v supabase/functions/_shared/runa_dne_knihovna.mjs (např. „Raidho-2-is-kk“); null = text psal model živě.
-- claude-proxy podle něj vybírá variantu runy, kterou člověk ještě neviděl. Klient sloupec jen čte (politika rune_day_select_own beze změny).

alter table public.rune_day add column if not exists text_id text;

-- Ověření: sloupec existuje
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'rune_day' and column_name = 'text_id';

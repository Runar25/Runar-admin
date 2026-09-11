-- Měsíční strop hlasu (ElevenLabs) — 5 přehrání na uživatele a měsíc.
--
-- PROČ: hlas se platí po znacích a do 2026-09-11 ho držel JEN rate limit 5 požadavků za
-- minutu — tedy žádný měsíční strop vůbec. Premium účet mohl ozvučit všech 75 čtení.
-- KUKY 2026-09-11: „musí být limit na hlas max 5 na měsíc, je to spíš ochutnávka."
--
-- Vlastní klíč měsíce (ne sdílený `month_key`) záměrně: čtení a hlas se počítají nezávisle
-- a dva zapisovatelé nad jedním klíčem by se mohli přebít.
--
-- SERVER-OWNED: granty se NEUDĚLUJÍ. Píše výhradně `elevenlabs-proxy` přes service_role,
-- který granty obchází. Hlídá to smoke ⑩ (sql/audit_write_surface.sql).
--
-- Hodnota stropu tady NENÍ — bydlí v `v2/runar-config.js` (VOICE_MONTHLY_LIMIT) a zrcadlí ji
-- edge funkce; kopii hlídá scripts/verify_monthly_limits.js. Do DB nepatří (§20).

alter table public.user_profiles
  add column if not exists voice_month_key   text,
  add column if not exists voice_month_count integer not null default 0;

-- Kontrola po spuštění:
--   select column_name, data_type, column_default
--     from information_schema.columns
--    where table_name = 'user_profiles'
--      and column_name in ('voice_month_key','voice_month_count');

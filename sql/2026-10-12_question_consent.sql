-- 2026-10-12 — souhlas s odesláním volné otázky (DECISIONS 2026-10-12 (7), krok 2). Spustí owner v Supabase SQL editoru.
-- Volná otázka (formulář čtení i Ask) může nést zdraví a jiné citlivé údaje (čl. 9 GDPR) → k OpenAI jde a ukládá se jen s výslovným
-- souhlasem. Sloupec drží, kdy ho člověk dal (null = nedal, nebo ho odvolal v menu). Testeři ho mají v tester_consent_at.
-- Grant pro klienta bydlí v 2026-07-16_user_profiles_column_grants.sql (zapisovatelnou plochu vlastní ten soubor, hlídá smoke ⑩).
alter table public.user_profiles add column if not exists question_consent_at timestamptz;

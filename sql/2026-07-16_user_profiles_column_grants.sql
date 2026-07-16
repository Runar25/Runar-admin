-- 2026-07-16 — user_profiles: sloupcové granty (KRITICKÉ, ověřeno naživo)
-- Spustit v Supabase SQL editoru jako owner.
--
-- DÍRA (potvrzena empiricky z prohlížeče, ne odvozením):
--   Policy "Users manage own profile" (+ duplikát "own profile"): cmd=ALL, roles={public},
--   qual = with_check = (auth.uid() = id). To je správný ŘÁDKOVÝ filtr — ale RLS v Postgresu
--   neumí filtrovat SLOUPCE, a `authenticated` má GRANT UPDATE na celou tabulku (default
--   Supabase). Přihlášený uživatel proto směl přepsat KTERÝKOLI sloupec svého řádku:
--
--     await sb.from('user_profiles').update({ month_units: 42 }).eq('id', <sám sebe>).select()
--     -> status 200, data: Array(1)     [ověřeno 2026-07-16 na ne-admin účtu]
--
--   Stejnou cestou: credits_balance = 9999 (kredity zdarma), tier = 'premium' (předplatné
--   zdarma), month_units = 0 (obejití měsíčního limitu). A protože cmd=ALL zahrnuje DELETE:
--   smazat vlastní řádek -> upsertProfile() ho při dalším přihlášení založí znovu z defaultů
--   -> free_balance = 1 -> free čtení donekonečna.
--
-- OPRAVA: obranu sloupců dělají GRANTY, ne policy. Policy zůstává (řádkový filtr je správný).
--   Klient zapisuje přesně tohle (ověřeno greppem VŠECH dotyků user_profiles ve v2/*.js):
--     INSERT: jen { id }                       (upsertProfile, runar-app.js)
--     UPDATE: 12 sloupců níže                  (runar-app.js + runar-tree.js)
--   Všechno, kde jsou peníze (tier, credits_balance, free_balance, month_units, month_key,
--   drip_week, is_tester), píšou VÝHRADNĚ edge funkce přes service_role — ten granty obchází,
--   takže se ho tohle nedotkne.
--
-- POZOR: klient chyby zápisu polyká do console.warn -> rozbití by bylo TICHÉ. Po spuštění
-- ověřit v konzoli (viz spodek souboru).

revoke insert, update, delete on public.user_profiles from anon, authenticated;

grant insert (id) on public.user_profiles to authenticated;

grant update (
  name, lang, address_gender, analytics_opt_out, tester_consent_at,
  dob_day, dob_month, dob_year,
  tree_name, life_rune_number, life_rune_text, life_rune_lang
) on public.user_profiles to authenticated;

-- Úklid po ověřovacím testu (month_units byl při důkazu přepsán na 42).
update public.user_profiles set month_units = 0, month_key = null
where id = '0d1c4ce7-68ef-4036-bc46-c4128c9f09bf';

-- ── Ověření (konzole readeru, přihlášen jako NE-admin) ───────────────────────
--   update({ month_units: 42 })  -> musí vrátit [] / chybu   (díra zavřená)
--   update({ name: 'Kuky' })     -> musí projít              (app nerozbitá)
--   upsert({ id }, { onConflict:'id', ignoreDuplicates:true }) -> bez chyby
--                                   (zakládání profilu novým uživatelům funguje)

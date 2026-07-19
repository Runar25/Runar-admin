-- ŽIVOTNÍ RUNA JE NEMĚNNÁ — jednou vygenerovaná se nedá přepsat.
--
-- PROČ TEĎ: dnes je jediná brzda proti přepsání CENA (3 kredity). Ta má jít na 0.
-- Bez téhle migrace by zlevnění udělalo z „navždy neměnné" životní runy neomezený
-- generátor s destruktivním přepisem — a to i mimo UI: sloupce life_rune_* jsou pro
-- roli `authenticated` zapisovatelné (sql/2026-07-16_user_profiles_column_grants.sql),
-- takže stačí jedno volání z konzole prohlížeče.
--
-- Klientský guard nestačí. Klient je pro tuhle hranici jen zdvořilost.
--
-- ⚠️ ZAMYKÁ SE I DATUM NAROZENÍ. Životní runa se z DOB POČÍTÁ (calcLifeRune), ale uložený
-- text se nepřepočítá. Kdyby šlo DOB po založení změnit, strom by ukazoval jednu runu
-- a text vykládal jinou — tiše. Buď zamknout obojí, nebo ani jedno.
--
-- ⚠️ DŮSLEDEK PRO ADMIN RESET: resetLifeRune() v runar-tree.js běží jako `authenticated`,
-- takže po téhle migraci SELŽE (a klient chybu uvidí — smoke ⑱ hlídá, že se výsledek čte).
-- To je záměr: reset je destruktivní a má jít přes service_role, ne přes tlačítko, které
-- má kdokoli v DOM. Reset se od teď dělá SQL příkazem na konci tohoto souboru.

create or replace function public.guard_life_rune_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- service_role smí vše (edge funkce, admin úkony, tento soubor)
  if current_user = 'service_role' then
    return new;
  end if;

  -- dokud runa není, smí se zapsat (to je právě to založení)
  if old.life_rune_text is null or old.life_rune_text = '' then
    return new;
  end if;

  if new.life_rune_text   is distinct from old.life_rune_text
  or new.life_rune_number is distinct from old.life_rune_number
  or new.life_rune_lang   is distinct from old.life_rune_lang
  or new.dob_day          is distinct from old.dob_day
  or new.dob_month        is distinct from old.dob_month
  or new.dob_year         is distinct from old.dob_year then
    raise exception 'life rune already set; it is immutable'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_life_rune_immutable on public.user_profiles;

create trigger trg_life_rune_immutable
  before update on public.user_profiles
  for each row
  execute function public.guard_life_rune_immutable();

-- ── OVĚŘENÍ (konzole readeru, přihlášen jako NE-admin, KTERÝ UŽ MÁ životní runu) ──
--   update({ life_rune_text: 'hacked' })  -> musí vrátit chybu   (díra zavřená)
--   update({ dob_year: 1900 })            -> musí vrátit chybu   (runa by se rozešla s textem)
--   update({ name: 'Kuky' })              -> musí projít         (app nerozbitá)
--
-- ── OVĚŘENÍ (uživatel, který životní runu JEŠTĚ NEMÁ) ──
--   založení musí projít normálně (null -> hodnota není blokované)

-- ── ADMIN RESET ───────────────────────────────────────────────────────────────
-- Nebydlí tady. Je to opakovaně použitelný NÁSTROJ, ne součást téhle migrace:
--     sql/admin_reset_life_rune.sql
-- (Tenhle soubor se pouští jednou. Reset se pouští, kdykoli je potřeba —
--  míchat obojí do jednoho souboru znamená, že se jednou omylem pustí i to druhé.)

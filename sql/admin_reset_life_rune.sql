-- ═══════════════════════════════════════════════════════════════════════════
--  NÁSTROJ: RESET ŽIVOTNÍ RUNY (admin)
--  Kam patří: nahrazuje tlačítko „RESET LIFE RUNE", které bylo 2026-07-19
--             odstraněno z Tree tabu. Není to migrace — pouští se opakovaně,
--             podle potřeby, ne jednou.
--  Kdy to použít: uživatel potřebuje znovu založit strom (testování, oprava).
--  Kde běžet: Supabase SQL editor (běží jako service_role).
-- ═══════════════════════════════════════════════════════════════════════════
--
--  PROČ TO NEJDE Z APPKY: trigger `trg_life_rune_immutable`
--  (sql/2026-07-19_life_rune_immutable.sql) blokuje zápis do life_rune_* a dob_*
--  pro roli `authenticated`. Tlačítko v prohlížeči běží právě pod ní, takže by
--  selhalo. SQL editor běží jako service_role, kterou trigger propouští.
--
--  ⚠️ user_profiles NEMÁ sloupec `email` — e-mail bydlí v auth.users.
--     Proto se uživatel hledá přes poddotaz, ne přímo.
--
--  POUŽITÍ: změň e-mail na řádku níž (na DVOU místech) a pusť celý soubor.

-- ── KROK 1: koho resetuju? Musí vrátit PRÁVĚ JEDEN řádek. ──────────────────
select u.id, u.email, p.tree_name, p.life_rune_number,
       (p.life_rune_text is not null) as ma_zivotni_runu,
       p.dob_day, p.dob_month, p.dob_year
from auth.users u
join public.user_profiles p on p.id = u.id
where u.email = 'sem@dej.email';          -- ← ZMĚŇ

-- ── KROK 2: reset. `returning` ukáže, co se opravdu smazalo. ───────────────
-- Nevrátí-li nic, e-mail nesedí a NIC se nestalo (tichý zásah = žádný zásah).
update public.user_profiles set
  life_rune_number = null,
  life_rune_text   = null,
  life_rune_lang   = null,
  dob_day          = null,
  dob_month        = null,
  dob_year         = null,
  tree_name        = null                 -- staré tlačítko tohle NEMAZALO, takže
                                          -- jméno zůstalo viset nad neexistujícím stromem
where id = (select id from auth.users where email = 'sem@dej.email')   -- ← ZMĚŇ (stejný)
returning id, tree_name, life_rune_number, dob_year;

-- ── KROK 3: ověření. Všechny sloupce musí být prázdné. ─────────────────────
select u.email, p.life_rune_number, p.life_rune_text, p.life_rune_lang,
       p.dob_day, p.dob_month, p.dob_year, p.tree_name
from auth.users u
join public.user_profiles p on p.id = u.id
where u.email = 'sem@dej.email';          -- ← ZMĚŇ (stejný)

-- Uživatel po resetu spadne do stavu „tree-no-dob" a může strom založit znovu.
-- Vlastní ČTENÍ v `readings` se NEMAŽOU — reset ruší založení, ne historii.

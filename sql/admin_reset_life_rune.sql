-- ═══════════════════════════════════════════════════════════════════════════
--  NÁSTROJ: RESET ŽIVOTNÍ RUNY (admin)
--  Kam patří: nahrazuje tlačítko „RESET LIFE RUNE", odstraněné 2026-07-19
--             z Tree tabu. Není to migrace — pouští se opakovaně, podle potřeby.
--  Kde běžet: Supabase → SQL Editor → New query → Run (běží jako service_role).
-- ═══════════════════════════════════════════════════════════════════════════
--
--  PROČ TO NEJDE Z APPKY: trigger `trg_life_rune_immutable`
--  (sql/2026-07-19_life_rune_immutable.sql) blokuje zápis do life_rune_* a dob_*
--  pro roli `authenticated`, pod kterou běží prohlížeč. SQL editor je service_role.
--
--  ⚠️ user_profiles NEMÁ sloupec `email` — bydlí v auth.users. Proto poddotaz.
--
--  ⚠️ PROČ JE TO DO BLOK A NE TŘI PŘÍKAZY (2026-07-19): první verze byla tři
--     samostatné příkazy s e-mailem na třech místech. Když se e-mail nezměnil,
--     update sebral nula řádků a editor napsal „Success. No rows returned" —
--     tedy hláška, která vypadá jako úspěch. Nezměněný e-mail teď HODÍ CHYBU.
--
--  ═══ POUŽITÍ: změň e-mail na JEDNOM řádku níž a pusť celý soubor. ═══

do $$
declare
  v_email text := 'sem@dej.email';   -- ←←← ZMĚŇ TADY (a jen tady)
  v_id    uuid;
  v_tree  text;
  v_rune  int;
  v_had   boolean;
begin
  if v_email = 'sem@dej.email' then
    raise exception 'Nezměnil jsi e-mail (pořád je tam vzor). Nic se nestalo.';
  end if;

  select u.id, p.tree_name, p.life_rune_number, (p.life_rune_text is not null)
    into v_id, v_tree, v_rune, v_had
  from auth.users u
  join public.user_profiles p on p.id = u.id
  where u.email = v_email;

  if v_id is null then
    raise exception 'Uživatel % neexistuje (nebo nemá profil). Nic se nestalo. Překlep v e-mailu?', v_email;
  end if;

  update public.user_profiles set
    life_rune_number = null,
    life_rune_text   = null,
    life_rune_lang   = null,
    dob_day          = null,
    dob_month        = null,
    dob_year         = null,
    tree_name        = null      -- staré tlačítko tohle NEMAZALO, takže jméno
  where id = v_id;               -- zůstávalo viset nad neexistujícím stromem

  raise notice 'RESETOVÁNO: %  (měl životní runu: % / runa č. % / strom se jmenoval: %)',
    v_email, v_had, coalesce(v_rune::text, '—'), coalesce(v_tree, '(bez jména)');
end $$;

-- ── OVĚŘENÍ (nepovinné) — vrátí 1 řádek, všechny sloupce musí být prázdné ──
-- Pusť zvlášť a dosaď týž e-mail:
--
--   select u.email, p.life_rune_number, p.life_rune_text, p.life_rune_lang,
--          p.dob_day, p.dob_month, p.dob_year, p.tree_name
--   from auth.users u
--   join public.user_profiles p on p.id = u.id
--   where u.email = 'sem@dej.email';
--
-- Uživatel po resetu spadne do stavu „tree-no-dob" a může strom založit znovu.
-- Vlastní ČTENÍ v `readings` se NEMAŽOU — reset ruší založení, ne historii.

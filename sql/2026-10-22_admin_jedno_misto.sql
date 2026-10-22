-- 2026-10-22 — Seznam adminů v databázi na JEDNOM místě (owner „4. ano, připrav to“, krok 3 průchodu CODE-read; DECISIONS 2026-10-22).
-- Spustí owner v Supabase SQL editoru (produkce). Celé najednou; běží v transakci.
--
-- Proč: e-maily adminů stály natvrdo ve čtyřech pravidlech přístupu (RLS), každé zapsané po svém (auth.jwt() ->> 'email' × auth.email()).
-- Kontrola „seznam adminů všude stejný“ (smoke ㉚, scripts/verify_admin_emails.js) hlídala jen kód — přidání nebo odebrání admina by
-- v databázi tiše zůstalo staré (odebraný admin by dál měnil korekce a dárkové kódy). Teď jedna funkce public.je_admin(), pravidla ji volají;
-- kontrola porovná její seznam s ADMIN_EMAILS ve v2/runar-config.js.
-- Co se NEmění: kdo smí co. Táž dvojice adres, tatáž pravidla (jména, příkazy, role), jen podmínka volá funkci. Ověřeno 2026-10-22 na
-- testovací databázi v transakci s ROLLBACK (stejné tabulky a pravidla jako produkce → migrace → admin projde, cizí ne).

begin;

-- Jediné místo seznamu adminů v databázi. Musí se shodovat s ADMIN_EMAILS (v2/runar-config.js) — hlídá verify_admin_emails.js.
-- stable: v rámci dotazu se nemění; e-mail z přihlášení (JWT), malými písmeny.
create or replace function public.je_admin() returns boolean
  language sql stable
  set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['kukula@agndofa.is', 'info@agndofa.is']);
$$;
revoke all on function public.je_admin() from public;
grant execute on function public.je_admin() to anon, authenticated;

alter policy "Admin manage gift codes"     on public.gift_codes         using (public.je_admin()) with check (public.je_admin());
alter policy runar_character_admin_all     on public.runar_character    using (public.je_admin()) with check (public.je_admin());
alter policy runar_corrections_admin_write on public.runar_corrections  using (public.je_admin()) with check (public.je_admin());
alter policy admins_delete_static_audio    on public.runar_static_audio using (public.je_admin());

commit;

-- Ověření (mělo by vrátit 0 řádků — žádné pravidlo už e-maily natvrdo nenese):
-- select c.relname, p.polname from pg_policy p join pg_class c on c.oid = p.polrelid
--  where pg_get_expr(p.polqual, p.polrelid) ilike '%@%' or pg_get_expr(p.polwithcheck, p.polrelid) ilike '%@%';

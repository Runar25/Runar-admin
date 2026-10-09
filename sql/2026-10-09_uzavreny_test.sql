-- 2026-10-09 (CODE-tune) — uzavřený test: kdo smí ZALOŽIT účet + testeři automaticky premium.
--
-- KUKY 2026-10-09: „11. ok udělej“ · „16. ano“ (Brevo + seznam povolených e-mailů + šestimístný kód) · „14. premium… stávající jsou
-- 2 admini a dva účty… na testování slabších účtů Rune Seeker“ (ty zůstávají, jak jsou). Proč tester → premium dělá DB, ne ruční SQL
-- po prvním přihlášení každého testera: CLAUDE.md §30 (nic nesmí viset na paměti).
--
-- (1) public.allowed_emails — kdo smí ZALOŽIT účet. role 'tester' = při vzniku profilu premium + is_tester; 'member' = jen smí založit
--     účet (např. další účet na testování Rune Seeker). Existujících účtů se seznam netýká — přihlásí se dál.
-- (2) public.hook_before_user_created — Supabase Auth hook „Before User Created“ (plán Free i Pro, dokumentace Supabase, ověřeno
--     2026-10-09). Vznik účtu s e-mailem mimo seznam odmítne — přes Google i přes e-mail. Tahle migrace hook jen PŘIPRAVÍ;
--     ZAPÍNÁ ho owner: Authentication → Hooks → Before User Created → Postgres → schema public → hook_before_user_created.
--     ⚠️ Než ho zapneš, dej na seznam každého, kdo se má ještě poprvé přihlásit (i nový admin účet) — jinak účet nevznikne.
-- (3) trigger na public.user_profiles (BEFORE INSERT): profil pro e-mail s rolí 'tester' dostane tier 'premium' a is_tester.
--     Klient vkládá jen {id} (runar-app.js upsertProfile, ON CONFLICT DO NOTHING) — tier ani is_tester klient zapsat nesmí a nezapíše;
--     nastaví je databáze (sloupcové granty: 2026-07-16_user_profiles_column_grants.sql).
--
-- Přidat testera (e-mail malými písmeny):
--   insert into public.allowed_emails(email, role, note) values ('jmeno@example.is', 'tester', 'kdo to je');
-- Seznam:
--   select email, role, note, added_at from public.allowed_emails order by added_at;
-- Tester se přihlásil DŘÍV, než byl na seznamu (profil vznikl jako Rune Seeker) — dorovnat:
--   update public.user_profiles p set tier = 'premium', is_tester = true
--   from auth.users u join public.allowed_emails a on a.email = lower(u.email) and a.role = 'tester'
--   where p.id = u.id and (p.tier is distinct from 'premium' or not p.is_tester);

begin;

-- (1) seznam
create table if not exists public.allowed_emails (
  email     text primary key check (email = lower(email) and position('@' in email) > 1),
  role      text not null default 'tester' check (role in ('tester', 'member')),
  note      text,
  added_at  timestamptz not null default now()
);
alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from anon, authenticated, public;
-- Hook běží jako supabase_auth_admin a seznam čte (vzor z dokumentace Supabase k auth hookům).
grant usage on schema public to supabase_auth_admin;
grant select on table public.allowed_emails to supabase_auth_admin;
drop policy if exists "auth admin reads allowed emails" on public.allowed_emails;
create policy "auth admin reads allowed emails" on public.allowed_emails
  as permissive for select to supabase_auth_admin using (true);

-- (2) hook — vrací {} = pustit, {"error":{…}} = odmítnout. „closed_test“ ve zprávě hledá appka (runar-auth.js) a ukáže
--     svou hlášku v jazyce uživatele.
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  em text := lower(coalesce(event->'user'->>'email', ''));
begin
  if em <> '' and exists (select 1 from public.allowed_emails a where a.email = em) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'closed_test: this email is not on the list'));
end;
$$;
grant execute on function public.hook_before_user_created to supabase_auth_admin;
revoke execute on function public.hook_before_user_created from authenticated, anon, public;

-- (3) tester → premium + is_tester při vzniku profilu
create or replace function public.profile_tester_from_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if exists (select 1 from auth.users u join public.allowed_emails a on a.email = lower(u.email)
             where u.id = new.id and a.role = 'tester') then
    new.tier := 'premium';
    new.is_tester := true;
  end if;
  return new;
end;
$$;
revoke execute on function public.profile_tester_from_allowlist() from anon, authenticated, public;
drop trigger if exists trg_profile_tester_from_allowlist on public.user_profiles;
create trigger trg_profile_tester_from_allowlist
  before insert on public.user_profiles
  for each row execute function public.profile_tester_from_allowlist();

commit;

-- OVĚŘENÍ hooku bez zakládání účtu (první vrátí odmítnutí, druhý {}):
--   select public.hook_before_user_created('{"user":{"email":"nikdo@example.com"}}'::jsonb);
--   insert into public.allowed_emails(email, role, note) values ('test-hook@example.com', 'member', 'test hooku — smazat');
--   select public.hook_before_user_created('{"user":{"email":"Test-Hook@example.com"}}'::jsonb);
--   delete from public.allowed_emails where email = 'test-hook@example.com';

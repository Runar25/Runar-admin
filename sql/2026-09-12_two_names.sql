-- DVĚ JMÉNA + volba oslovení (KUKY 2026-09-12).
--
-- CO: uživatel má dvě kolonky —
--   `norse_name`  severské jméno, skutečné nebo vymyšlené; z něj se dělá ROZBOR (když ho známe)
--   `name`        jméno nebo přezdívka, cokoli („Trpaslík" → Rúnar mu říká Trpaslík)
-- a `address_pref` říká, kterým z nich ho Rúnar OSLOVUJE ('name' | 'norse').
-- Owner: „mame teda dve kolonky pro jmena a uzivatel si bude moc zaskrtnout ktere bude pouzivat."
--
-- PROČ `name_lore_for` + `name_lore_count`: rozbor jména je zdarma a proxy ho dosud pouštěla
-- jen tehdy, když byl `name_lore_text` prázdný — sloupec, který si klient smí sám vynulovat
-- (ověřeno v živé DB 2026-09-12: grant UPDATE pro authenticated). Změna jména by tu díru
-- otevřela oficiálně. Proto: proxy si pamatuje, PRO KTERÉ jméno rozbor vznikl, a KOLIKRÁT;
-- oba sloupce píše jen server (service_role), klient na ně grant NEMÁ.
--
-- ⚠️ Tohle je KROK 1 ze dvou a je čistě přidávací — nic stávajícího nerozbije.
-- KROK 2 (`2026-09-12_name_lore_server_only.sql`) odebere klientovi zápis `name_lore_text`
-- a smí se pustit AŽ PO nasazení klienta, který ho nepíše. Obráceně by stávající klient
-- dostal 403 při každém uložení rozboru.

alter table public.user_profiles
  add column if not exists norse_name      text,
  add column if not exists address_pref    text    not null default 'name',
  add column if not exists name_lore_for   text,
  add column if not exists name_lore_count integer not null default 0;

alter table public.user_profiles drop constraint if exists user_profiles_address_pref_chk;
alter table public.user_profiles
  add constraint user_profiles_address_pref_chk check (address_pref in ('name', 'norse'));

alter table public.user_profiles drop constraint if exists user_profiles_norse_name_len_chk;
alter table public.user_profiles
  add constraint user_profiles_norse_name_len_chk
  check (norse_name is null or char_length(norse_name) <= 60);

-- Klient smí měnit jen tyhle dvě. `name_lore_for` a `name_lore_count` NE — rozhodují o penězích.
grant update (norse_name, address_pref) on public.user_profiles to authenticated;

-- Stávající rozbory vznikly z `name` (dvě kolonky dosud neexistovaly). Jako použitý rozbor se
-- počítá JEN text od modelu. Hotové věty („no Norse root", „knows this name…") model nevolaly,
-- nic nestály — a kdyby se počítaly, vzalo by to člověku jeho pokus za nic.
-- (Ověřeno v živé DB 2026-09-12: jediný existující rozbor je právě taková hotová věta.)
update public.user_profiles
   set name_lore_count = 1,
       name_lore_for   = name
 where name_lore_text is not null
   and name_lore_count = 0
   and name_lore_text not like 'Rúnar sees no Norse root%'
   and name_lore_text not like 'Rúnar sér enga norræna rót%'
   and name_lore_text not like 'Rúnar knows this name%'
   and name_lore_text not like 'Rúnar þekkir þetta nafn%';

-- Kontrola po spuštění:
--   select column_name from information_schema.column_privileges
--    where table_name = 'user_profiles' and grantee = 'authenticated' and privilege_type = 'UPDATE';
--   → musí obsahovat norse_name, address_pref; NESMÍ name_lore_for, name_lore_count

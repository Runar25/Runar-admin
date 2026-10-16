-- 2026-10-16 — korekce z doby Opusu do zálohy (CODE-read). Spustí owner v Supabase SQL editoru.
-- Owner 2026-10-16: „pořád je tu předpoklad, že se tato slova mohou objevit. Mohou zůstat v záloze, ale jinak odstranit.“
-- Proč: pokus 2026-10-15 (RUNAR_EVAL_LOG 2026-10-15 (1)) — sol bez bloku korekcí neudělal ani jednu chybu ze seznamu; 28 z 29 korekcí
-- vzniklo za Opusu (13. 5.–26. 9.), blok bral ~900 tokenů = ~43 % vstupu každého IS čtení. V promptu zůstane jen korekce ze solu
-- („bertum“, 2026-10-14). Appka čte jen public.runar_corrections, zálohovou tabulku nečte nic.
-- Vrátit jednu korekci: insert into public.runar_corrections select * from public.runar_corrections_zaloha where original_phrase = '…';
begin;
create table if not exists public.runar_corrections_zaloha (like public.runar_corrections including all);
alter table public.runar_corrections_zaloha enable row level security;   -- bez politik: klient (anon / přihlášený) nevidí nic
insert into public.runar_corrections_zaloha select * from public.runar_corrections where created_at < '2026-10-09';
delete from public.runar_corrections where created_at < '2026-10-09';
commit;
-- Kontrola (má vyjít v promptu 1, v záloze 28):
select (select count(*) from public.runar_corrections) v_promptu, (select count(*) from public.runar_corrections_zaloha) v_zaloze;

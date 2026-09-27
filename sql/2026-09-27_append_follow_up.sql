-- 2026-09-27 — ATOMICKÝ zápis odpovědi Asku do readings.follow_up (KUKY „ano jeď 1 a 2“; BACKLOG „Ask — nálezy“ bod 2).
-- PROČ: claude-proxy (persistJournal) dělal přečti pole → přidej v kódu → zapiš celé pole. Dva souběžné Asky na tomtéž čtení
-- (od 2026-09-25 má Premium dva) si tak navzájem přepsaly výsledek a jedna odpověď se z deníku ztratila, ačkoli ji uživatel viděl.
-- TEĎ: jeden UPDATE přidá prvek k poli v databázi (řádkový zámek; druhý souběžný UPDATE počká a vyhodnotí WHERE znovu nad
-- novou verzí řádku), a v témže příkazu hlídá idempotenci podle `id` záznamu (opakovaný pokus / resave nepřidá duplikát).
-- Vrací: 'appended' | 'duplicate' (záznam s tímto id už v poli je) | 'missing' (čtení neexistuje nebo nepatří uživateli).
-- BEZPEČNOST: security definer + p_user_id od volajícího → smí volat JEN service_role (edge funkce). anon/authenticated nesmí —
-- jinak by kdokoli přihlášený mohl přidat záznam do cizího čtení, když zná jeho id.
create or replace function public.append_follow_up(p_reading_id uuid, p_user_id uuid, p_entry jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  update public.readings r
     set follow_up = coalesce(r.follow_up, '[]'::jsonb) || jsonb_build_array(p_entry)
   where r.id = p_reading_id
     and r.user_id = p_user_id
     and (p_entry->>'id' is null
          or not exists (select 1 from jsonb_array_elements(coalesce(r.follow_up, '[]'::jsonb)) e
                          where e->>'id' = p_entry->>'id'));
  get diagnostics v_n = row_count;
  if v_n > 0 then return 'appended'; end if;
  if exists (select 1 from public.readings r where r.id = p_reading_id and r.user_id = p_user_id) then
    return 'duplicate';
  end if;
  return 'missing';
end;
$$;

revoke all on function public.append_follow_up(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.append_follow_up(uuid, uuid, jsonb) to service_role;

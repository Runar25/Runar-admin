-- 2026-10-19 — Strop hlášení z appky: nejvýš 40 za hodinu na účet (CODE-tune).
-- Proč: owner 2026-10-19 „4. na účet“ (DECISIONS 2026-10-19 (3), BACKLOG „Strop hlášení pro přihlášeného“). Hlášení posílá appka
-- rovnou do tabulky (runar-reporter.js, RLS jen pro authenticated), bez serveru — přihlášený mohl poslat libovolně mnoho řádků.
-- Strop hlídá databáze triggerem přes tutéž check_rate_limit jako send-line / redeem / waitlist (klíč „report:<účet>“, okno 1 h).
-- Proč 40: změřeno 2026-10-19 na 265 hlášeních (3 testeři) — nejvíc 23 za hodinu jednou, jinak ≤ 9; 40 běžné testování nezastaví.
-- Proč na účet, ne na IP: hlášení posílá jen přihlášený (víme, kdo to je) a IP by byl další osobní údaj (owner zvolil účet).
-- Odmítnuté hlášení se neztratí: appka ho drží ve frontě a pošle znovu při dalším odeslání (flush v runar-reporter.js maže z fronty
-- jen úspěch nebo duplicitu 23505).
-- Bez přihlášení (auth.uid() null — service_role, skripty) strop neplatí.
-- Idempotentní; zpět: drop trigger if exists bug_reports_strop on public.bug_reports; drop function if exists public.bug_reports_strop();

create or replace function public.bug_reports_strop()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is not null
     and not public.check_rate_limit('report:' || auth.uid()::text, 3600, 40) then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Too many reports this hour — the app keeps it and retries later.';
  end if;
  return new;
end;
$$;

revoke all on function public.bug_reports_strop() from public, anon, authenticated;

drop trigger if exists bug_reports_strop on public.bug_reports;
create trigger bug_reports_strop
  before insert on public.bug_reports
  for each row execute function public.bug_reports_strop();

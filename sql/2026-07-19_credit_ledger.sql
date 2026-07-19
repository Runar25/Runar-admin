-- ═══════════════════════════════════════════════════════════════════════════
--  EVIDENCE POHYBŮ KREDITU (credit_ledger) — fáze 1: záznam
--  Kde běžet: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════
--
--  PROČ: 2026-07-19 se owner nemohl dozvědět, jestli se mu strhl kredit.
--  `credits_balance` je STAV, ne historie — a jiná stopa neexistuje. Táž díra
--  brání odpovědět na starší ownerovo zadání: „není kód, není kredit."
--
--  ⭐ NOSNÁ MYŠLENKA: evidenci nezajišťuje kázeň volajícího, ale TRIGGER NA TABULCE.
--  Kdyby zapisovaly edge funkce, evidence by chyběla přesně tam, kde nejvíc chybí —
--  u ručního UPDATE v tomhle editoru, který git nikdy neuvidí. Trigger zachytí
--  úplně stejně edge funkci, PostgREST, kaskádu i lidskou ruku.
--
--  Pohyb bez důvodu není mezera, ale SIGNÁL: řádek dostane reason='unattributed',
--  což znamená „někdo sáhl na zůstatek mimo kód".
--
--  ⚠️ CO TO NEDĚLÁ (a nesmí to předstírat):
--   1. NEODPOVÍ na „nevydali jsme víc, než jsme prodali?" — prodejní strana v systému
--      neexistuje (není checkout ani záznam o tržbě). Ledger umí jen „přiděleno vs.
--      spotřebováno". Celá odpověď přijde až se Shopify webhookem.
--   2. NEZREKONSTRUUJE minulost. Historie do dneška je nezískatelná. Krok 6 níž zapíše
--      každému JEDEN řádek reason='migration' = „takhle to vypadalo, když jsme začali
--      měřit" — ne pravda o minulosti.
--   3. NEUBRÁNÍ ownera s právy vlastníka tabulky (`alter table ... disable trigger`).
--      Tohle jde jen ODHALIT, ne zakázat — proto je drift dotaz součástí, ne příslušenství.
--   4. NEOVĚŘUJE správnost částky. `spread_cost` je pořád číslo od klienta; ledger
--      poctivě zapíše i špatný strh. Evidence není kontrola.
--
--  ⚠️ ROZHODNUTÍ PRO OWNERA (GDPR): uzavírací řádky po smazání účtu drží `user_id`
--  a částky dál. Buď je to legitimní účetní zájem a patří to řádkem do RUNAR_PRIVACY.md,
--  nebo se má `user_id` při smazání hashovat (pak ale přestane fungovat historie účtu).
--  Nasazuju variantu „ponechat" — pokud ji nechceš, řekni a změním to.

-- ── 1. Tabulka ──────────────────────────────────────────────────────────────
create table if not exists public.credit_ledger (
  id            bigint generated always as identity primary key,
  at            timestamptz not null default now(),
  user_id       uuid,                    -- ZÁMĚRNĚ BEZ FK: řádek musí přežít smazání
                                         -- účtu. FK s kaskádou by smazal právě tu
                                         -- evidenci, kvůli které tabulka vznikla.
  asset         text not null check (asset in ('credit','free','month_unit','tier')),
  delta         int  not null,           -- podepsané; 'tier' nese 0
  balance_after int,
  reason        text not null,
  ref           text,                    -- readings.id | kód | batch
  actor         text not null default current_user,  -- 'service_role' = kód, jiné = ruka
  meta          jsonb
);

create index if not exists idx_ledger_user  on public.credit_ledger (user_id, at desc);
create index if not exists idx_ledger_asset on public.credit_ledger (asset, at desc);

-- ── 2. Append-only: evidence, kterou lze přepsat, není evidence ─────────────
create or replace function public.ledger_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'credit_ledger je append-only (pokus o %)', TG_OP;
end $$;

drop trigger if exists trg_ledger_append_only on public.credit_ledger;
create trigger trg_ledger_append_only
  before update or delete on public.credit_ledger
  for each row execute function public.ledger_append_only();

-- ── 3. Klient sem nesmí ani nahlédnout ──────────────────────────────────────
alter table public.credit_ledger enable row level security;
revoke all on public.credit_ledger from public, anon, authenticated;
grant select on public.credit_ledger to service_role;
-- INSERT nedostává NIKDO: zapisuje výhradně trigger jako security definer.

-- ── 4. Důvod pohybu (nastaví volající RPC; platí jen v rámci transakce) ─────
create or replace function public.ledger_ctx(p_reason text, p_ref text default null)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  perform set_config('runar.reason', coalesce(p_reason, ''), true);
  perform set_config('runar.ref',    coalesce(p_ref,    ''), true);
end $$;
revoke all on function public.ledger_ctx(text, text) from public, anon, authenticated;
grant execute on function public.ledger_ctx(text, text) to service_role;

-- ── 5. Jádro: trigger na user_profiles ──────────────────────────────────────
create or replace function public.ledger_user_profiles() returns trigger
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_reason text := coalesce(nullif(current_setting('runar.reason', true), ''), 'unattributed');
  v_ref    text := nullif(current_setting('runar.ref', true), '');
begin
  if TG_OP = 'INSERT' then
    -- Otevírací zůstatek. free_balance má DEFAULT 1 (balance_migration.sql) — hodnota,
    -- která vznikne bez kódu. Bez tohoto řádku vypadá první čtení jako odečet z ničeho.
    if coalesce(new.free_balance, 0) <> 0 then
      insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, actor)
      values (new.id, 'free', new.free_balance, new.free_balance, 'onboarding', current_user);
    end if;
    if coalesce(new.credits_balance, 0) <> 0 then
      insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, ref, actor)
      values (new.id, 'credit', new.credits_balance, new.credits_balance, v_reason, v_ref, current_user);
    end if;
    return new;
  end if;

  if TG_OP = 'DELETE' then
    -- Zánik řádku (delete-account, kaskáda z auth.users, ruka v dashboardu) = uzavírací
    -- položka. Bez ní by zůstatek zmizel beze stopy a součty by přestaly sedět.
    if coalesce(old.credits_balance, 0) <> 0 then
      insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, actor)
      values (old.id, 'credit', -old.credits_balance, 0, 'account_delete', current_user);
    end if;
    if coalesce(old.free_balance, 0) <> 0 then
      insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, actor)
      values (old.id, 'free', -old.free_balance, 0, 'account_delete', current_user);
    end if;
    return old;
  end if;

  -- UPDATE
  if new.credits_balance is distinct from old.credits_balance then
    insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, ref, actor)
    values (new.id, 'credit',
            coalesce(new.credits_balance,0) - coalesce(old.credits_balance,0),
            new.credits_balance, v_reason, v_ref, current_user);
  end if;

  if new.free_balance is distinct from old.free_balance then
    insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, ref, actor)
    values (new.id, 'free',
            coalesce(new.free_balance,0) - coalesce(old.free_balance,0),
            new.free_balance, v_reason, v_ref, current_user);
  end if;

  -- month_units: při přechodu na nový měsíc se čítač RESETUJE, takže delta NENÍ rozdíl
  -- hodnot — je to celá nová spotřeba. Bez téhle větve by rollover vypadal jako vratka.
  if new.month_units is distinct from old.month_units
     or new.month_key is distinct from old.month_key then
    insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, ref, actor, meta)
    values (new.id, 'month_unit',
            case when new.month_key is distinct from old.month_key
                 then coalesce(new.month_units,0)
                 else coalesce(new.month_units,0) - coalesce(old.month_units,0) end,
            new.month_units, v_reason, v_ref, current_user,
            jsonb_build_object('month_key', new.month_key,
                               'rollover', (new.month_key is distinct from old.month_key)));
  end if;

  -- Změna tieru mění NÁROK, ne zůstatek → delta 0, ale zapsat se musí:
  -- jinak by pozdější skok ve spotřebě neměl vysvětlení.
  if new.tier is distinct from old.tier then
    insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, ref, actor, meta)
    values (new.id, 'tier', 0, null, v_reason, v_ref, current_user,
            jsonb_build_object('from', old.tier, 'to', new.tier));
  end if;

  return new;
end $$;

drop trigger if exists trg_ledger_user_profiles on public.user_profiles;
create trigger trg_ledger_user_profiles
  after insert or update or delete on public.user_profiles
  for each row execute function public.ledger_user_profiles();

-- ── 6. Otevírací stav (JEDNORÁZOVĚ) ─────────────────────────────────────────
-- Není to pravda o minulosti, je to čára: „odsud měříme."
-- Bez ní by kontrola driftu (krok 7) hlásila každého uživatele.
insert into public.credit_ledger(user_id, asset, delta, balance_after, reason, actor, meta)
select id, 'credit', coalesce(credits_balance,0), coalesce(credits_balance,0),
       'migration', 'baseline', jsonb_build_object('note','stav pri zavedeni evidence')
from public.user_profiles
where not exists (select 1 from public.credit_ledger l
                  where l.user_id = user_profiles.id and l.reason = 'migration');

-- ── 7. OVĚŘENÍ ──────────────────────────────────────────────────────────────
-- (A) Sedí součet pohybů na zůstatek? Musí vrátit NULA řádků.
select p.id, p.credits_balance, sum(l.delta) as podle_evidence
from public.user_profiles p
join public.credit_ledger l on l.user_id = p.id and l.asset = 'credit'
group by p.id, p.credits_balance
having sum(l.delta) <> coalesce(p.credits_balance, 0);

-- (B) Sáhl někdo na zůstatek mimo kód?
-- ⚠️ TENHLE DOTAZ ZATÍM NEFUNGUJE JAKO SIGNÁL — ověřeno na ostrých datech 2026-07-19:
--   · `actor` je u VŠECH pohybů `postgres`, ne `service_role`. Odečet jde přes RPC
--     `use_credit`, která je SECURITY DEFINER, takže `current_user` uvnitř je vlastník
--     funkce. „actor ≠ service_role = lidská ruka" tedy neplatí.
--   · `reason` je u všeho `unattributed`, protože žádná RPC zatím nevolá `ledger_ctx()`.
-- Obojí spraví až fáze 2 (RPC nastaví důvod). DO TÉ DOBY je evidence úplná v tom,
-- ŽE pohyb zaznamená, ale neumí říct PROČ — a tenhle dotaz vrátí všechno.
select * from public.credit_ledger
where reason = 'unattributed' or actor not in ('service_role','baseline')
order by at desc limit 50;

-- (C) Historie jednoho účtu — tohle jsem 2026-07-19 nemohl zodpovědět:
-- select l.at, l.asset, l.delta, l.balance_after, l.reason, l.actor
-- from public.credit_ledger l
-- join auth.users u on u.id = l.user_id
-- where u.email = 'zkukula@gmail.com'
-- order by l.at desc;

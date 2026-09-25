-- 2026-09-25 — Ukládání rozborů čtení od GPT (tlačítko „GPT-6 luna", edge fn gpt-review). KUKY: „ano. budeme ukládat."
--
-- Proč: rozbor se dosud jen ukázal na obrazovce a po odchodu zmizel — zůstal jen tehdy, když ho owner poslal v reportu.
-- Uložený jde propojit se čtením (reading_id) a s ownerovým verdiktem v reportu (report nese „reading id" ve složení čtení),
-- a tak změřit, jak často má luna pravdu. ⚠️ Rozbor NENÍ závazný (KUKY 2026-09-25, memory gpt-rozbor-neni-zavazny):
-- tabulka je podklad k ověření, ne seznam úkolů.
--
-- reading_id BEZ cizího klíče: čtení se může uložit až po rozboru (odložený zápis), vazba by zápis rozboru shodila.
-- user_id = admin, který rozbor spustil; smazáním jeho účtu zmizí i jeho rozbory (on delete cascade).
-- RLS zapnuté BEZ politik: klient nečte ani nepíše; zapisuje gpt-review přes service_role, čte CLI (session CODE).

create table if not exists public.gpt_reviews (
  id             bigserial primary key,
  created_at     timestamptz not null default now(),
  user_id        uuid references auth.users(id) on delete cascade,
  reading_id     uuid,
  model          text not null,
  review_lang    text,
  prompt_version text,
  text           text not null,
  usage          jsonb
);
create index if not exists gpt_reviews_reading_idx on public.gpt_reviews (reading_id);
create index if not exists gpt_reviews_created_idx on public.gpt_reviews (created_at);
alter table public.gpt_reviews enable row level security;

-- GDPR/privacy columns on user_profiles. Run in the Supabase SQL editor (owner — Code has
-- no DDL access). Idempotent (IF NOT EXISTS). See RUNAR_PRIVACY.md.
--
-- Why each column:
--   is_tester          — marks a tester account. Testers give explicit consent and their
--                        readings are the highest-value quality data (filter in the shrine).
--   analytics_opt_out  — the user asked us NOT to use their readings to improve Rúnar.
--                        Quality analysis / eval / the readings viewer must exclude these.
--   tester_consent_at  — when the tester accepted the in-app consent (audit trail).

alter table public.user_profiles
  add column if not exists is_tester         boolean     not null default false,
  add column if not exists analytics_opt_out boolean     not null default false,
  add column if not exists tester_consent_at timestamptz;

-- Fast "testers only" + "exclude opt-outs" filtering for the shrine readings viewer / eval.
create index if not exists user_profiles_is_tester_idx
  on public.user_profiles (is_tester) where is_tester = true;
create index if not exists user_profiles_opt_out_idx
  on public.user_profiles (analytics_opt_out) where analytics_opt_out = true;

-- To mark yourself / a tester by email is NOT possible here (user_profiles has no email).
-- Mark by id, e.g.:  update public.user_profiles set is_tester = true where id = '<uuid>';

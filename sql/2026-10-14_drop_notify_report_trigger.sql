-- 2026-10-14 — zrušení Slacku: spouštěč „notify-report“ (Database Webhook) na public.bug_reports. Spustí owner v Supabase SQL editoru.
-- Owner 2026-10-14: „4. ano zruš to“ (Slack jen upozorňoval, že přišlo hlášení — samo hlášení je v DB a ve shrine). Edge funkci
-- notify-report a tajné hodnoty SLACK_WEBHOOK_URL a WEBHOOK_SECRET už CODE-read smazala; spouštěč by jinak volal funkci, která neexistuje.
drop trigger if exists "notify-report" on public.bug_reports;

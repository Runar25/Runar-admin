-- RÚNAR — Balance System Migration
-- Run in Supabase SQL editor: https://app.supabase.com/project/pmitxjvkeovijreepror/sql
-- Date: 2026-05-29
-- Description: Replace monthly/weekly count system with free_balance + drip_week

-- ── 1. Add new columns ──────────────────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS free_balance  int  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS drip_week     text;  -- ISO week e.g. "2026-W22"

-- ── 2. Set correct initial balances ─────────────────────────────────────────
-- Existing Rune Seekers get fresh start with onboarding balance = 3
UPDATE user_profiles
  SET free_balance = 3
  WHERE tier = 'rune_seeker';

-- Existing Visitors keep 1 (default already set above)
-- Standard / Premium: balance irrelevant (unlimited) but set to 99 as sentinel
UPDATE user_profiles
  SET free_balance = 99
  WHERE tier IN ('standard', 'premium');

-- ── 3. Verify ───────────────────────────────────────────────────────────────
SELECT tier, COUNT(*), AVG(free_balance) as avg_balance
FROM user_profiles
GROUP BY tier
ORDER BY tier;

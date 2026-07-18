-- Vrstva D: 3 READINGS spread
-- Adds spread_data column to readings table for multi-rune spreads
ALTER TABLE readings ADD COLUMN IF NOT EXISTS spread_data jsonb;

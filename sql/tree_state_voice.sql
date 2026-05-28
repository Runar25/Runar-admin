-- tree_state — add voice scale tracking columns (Vrstva C)
-- Run in Supabase SQL Editor after tree_state.sql

ALTER TABLE tree_state
  ADD COLUMN IF NOT EXISTS voice_settled            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS voice_last_changed_session integer NOT NULL DEFAULT 0;

-- Allow users to update their own voice scale from frontend
CREATE POLICY "Users update own tree state"
  ON tree_state FOR UPDATE
  USING (auth.uid() = user_id);

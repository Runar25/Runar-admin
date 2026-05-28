-- tree_state: one row per user, persistent reading memory
-- Part of Vrstva A (Layer A) — Living Tree memory foundation

CREATE TABLE tree_state (
  user_id           uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  recurring_pattern text[]      NOT NULL DEFAULT '{}',  -- max 5, rolling
  emotional_arc     text        NOT NULL DEFAULT 'opening',  -- opening|deepening|integration|threshold
  personal_symbols  jsonb       NOT NULL DEFAULT '{}',  -- { "symbol": count }
  forbidden_next    text[]      NOT NULL DEFAULT '{}',  -- max 3, replaced each session
  voice_scale       smallint    NOT NULL DEFAULT 10,    -- 0-20, Direct<->Metaphorical
  session_count     integer     NOT NULL DEFAULT 0,
  last_session_at   timestamptz,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can read their own tree (for future UI display)
ALTER TABLE tree_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tree state"
  ON tree_state FOR SELECT
  USING (auth.uid() = user_id);

-- tree-update Edge Function writes via service role key (bypasses RLS)
-- No direct user write policy needed

-- Index for future Vrstva G (proactive contact — find inactive users)
CREATE INDEX tree_state_last_session_idx ON tree_state (last_session_at);

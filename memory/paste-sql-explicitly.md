---
name: paste-sql-explicitly
description: "When asking the owner to run SQL/an action, paste the exact thing — never a \"like last time\" back-reference"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

When telling Kuky to run a migration or take an action, ALWAYS paste the exact SQL (or exact steps) inline in the message, in a code block. Never say "run it like last time" / "spusť to jako minule" / reference a file path to open — Kuky does not track which prior thing that was and it just causes friction.

**Why:** Kuky pushed back twice (2026-07-13 file-reference; 2026-07-14 "jako minule nevím co je"). The owner runs SQL in the Supabase editor by copy-paste; a back-reference forces them to hunt.

**How to apply:** Every "run this" → self-contained code block with the literal SQL right there, plus one line of what it does. Related: [[working-style]].

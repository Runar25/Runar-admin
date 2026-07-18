---
name: proceed-dont-ask
description: "Once a plan is agreed, execute it end to end — do not ask \"souhlas?\" / \"mám pokračovat?\" between steps"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

When Kuky has agreed a plan or direction, EXECUTE it to the end without asking for confirmation between steps. No "souhlas?", "mám do toho jít?", "pokračuju?", "chceš to?" — just do it and report what happened. Kuky interrupts if he disagrees; the asking is what slows him down.

**Only stop and ask when:**
- it is a genuine product/design decision only he can make (which masters to drop, December vs year-round, tier names, retention period)
- an action is destructive or outward-facing beyond the agreed scope (deleting data, publishing, pushing something not in the plan)
- the request is ambiguous enough that guessing wrong wastes real work
- it needs something only he has (SQL editor, DPA signature, DNS, a decision from Cowork)

**Why:** Kuky asked 2026-07-14 how to configure away the constant confirmations — it is not a settings problem, it is this behaviour. He works fast and jumps between threads; a mid-plan "shall I continue?" just costs him a turn.

**How to apply:** Agreed plan → run the whole sequence (code → verify → commit → push → docs) → report. When something in the plan turns out wrong mid-flight, decide and say what you changed and why, do not stop to ask. Paste exact SQL when he must run it ([[paste-sql-explicitly]]), and resolve IS yourself ([[is-done-together-not-for-sigrun]]).

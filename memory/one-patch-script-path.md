---
name: one-patch-script-path
description: "Runar §1 patch scripts go to each session's OWN gitignored slot (scripts/_patch.py = CODE-tree, _patch_tune.py = CODE-tune…) — a stable path per session, never a shared slot, never a fresh filename each time"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

In the Rúnar repo, every §1 Python patch script (JS must be edited via Python, not the Edit tool) goes to **this session's OWN stable gitignored slot** under `scripts/`, and is overwritten each run. One slot per session: `scripts/_patch.py` = CODE-tree, `scripts/_patch_tune.py` = CODE-tune, `scripts/_patch_<session>.py` for any further session. **Never a shared slot** (two sessions clobber each other's scratch mid-run) and **never a fresh filename each patch** (`_patch_someone.py`, `_mem.py`, `fix-norns-reading.py`, …). <!-- doc-links:ok 2026-07-21 ilustrativní špatná jména, ne odkazy na soubory -->


**Why (two reasons, both real):** (1) **Allowlist / no permission treadmill** — a stable path = one allowlist rule (`Bash(python -X utf8 scripts/_patch.py)`), so Kuky isn't prompted for every patch. His `settings.local.json` had grown to ~300 one-off `Bash(python … _mem.py)` entries because each new filename was a new unapproved command; one stable path per session ends that. He said the approving is exactly what he wanted gone. (2) **No collision** — with 3 Code sessions sharing one worktree (two of them `[tune]`), a single shared `scripts/_patch.py` gets overwritten under another session's hands. Own slot per session fixes both: stable enough for one allowlist rule, isolated enough to not collide. The two reasons pull the same way — a per-session stable path. <!-- doc-links:ok 2026-07-21 settings.local.json je v .claude/, zmíněn v próze -->


**How to apply:** Write the patch to *your* slot (`scripts/_patch.py` if you are CODE-tree; else your session's `_patch_<who>.py`) → run it from the repo root → do NOT delete it (overwritten next time; stays gitignored, never staged). Same for doc/memory-update scripts — they are patch scripts too, same slot. If a script must PERSIST (a real tool like `verify_contract_wiring.js`), that is different: give it a real name under `scripts/` and it earns its own allowlist rule. The collision protocol beyond the patch slot (pathspec commits, pull-first, status-before-touch) lives in [[parallel-code-sessions-collision]]. Related: [[proceed-dont-ask]], [[commit-by-pathspec]].

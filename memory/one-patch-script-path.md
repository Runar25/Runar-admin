---
name: one-patch-script-path
description: "Runar §1 patch scripts always go to scripts/_patch.py — one stable path, never a new filename"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

In the Rúnar repo, every §1 Python patch script (JS must be edited via Python, not the Edit tool) MUST be written to the SAME path: `C:\Users\zkuku\Downloads\Runar-admin\scripts\_patch.py`. Overwrite it each time. Never invent a new filename (`_patch_someone.py`, `_mem.py`, `_docs_aol.py`, `fix-norns-reading.py`, …) and never leave it behind — the next patch overwrites it.  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

**Why:** Kuky was getting a permission prompt for EVERY patch because each new filename is a new, unapproved command. His `settings.local.json` had grown to ~300 one-off entries (`Bash(python -X utf8 _mem.py)` etc.) and could never catch up — a treadmill created by my workflow, not by his config. One stable path = one allowlist rule (`Bash(python -X utf8 scripts/_patch.py)`, in `.claude/settings.json` since 2026-07-14) that covers every future patch. He said the approving is exactly what he wanted gone.  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

**How to apply:** Write the patch to `scripts/_patch.py` → run `python -X utf8 scripts/_patch.py` from the repo root → do NOT delete it (it is overwritten next time; it stays untracked/ignored, never staged). Same idea for doc/memory updates — they are patch scripts too, same path. If a script must persist (a real tool like `verify_contract_wiring.js`), that is different: give it a real name under `scripts/` and it earns its own allowlist rule. Related: [[proceed-dont-ask]].

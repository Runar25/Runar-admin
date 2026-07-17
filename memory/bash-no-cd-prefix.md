---
name: bash-no-cd-prefix
description: "Runar Bash: never cd-prefix or pipe-to-tail — it breaks allowlist matching and re-creates the permission treadmill"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

In the Rúnar repo, do NOT prefix Bash commands with `cd "C:/Users/zkuku/Downloads/Runar-admin" && …`, and do NOT append `2>&1 | tail -N` (or any pipe) to a command that has an allowlist rule. Both silently break the permission allowlist and make Kuky click "Allow" on commands that are already approved.

**Why:** The allowlist rules in `.claude/settings.json` are bare relative commands — `Bash(python -X utf8 scripts/_patch.py)`, `Bash(python -X utf8 smoke.py)`, etc. A `cd … && python scripts/_patch.py` does NOT match `python scripts/_patch.py` (the cd prefix changes the string), and `cd … &&` additionally trips a hard "path resolution bypass" guard the allowlist cannot override. A trailing `| tail` turns one command into a pipe of two, which also breaks the match. So I was mailing myself the treadmill: rules existed, my command shape dodged them. Kuky hit this TWICE and both times it was my workflow, not his config.

**How to apply:**
- The Bash **working directory persists between calls** (verified). Set it ONCE per session with a standalone `cd "C:/Users/zkuku/Downloads/Runar-admin"` (bare cd is auto-allowed, no prompt), then run every later command **bare and relative**: `python -X utf8 smoke.py`, `python -X utf8 scripts/_patch.py`, `git add …`, `git commit …`, `git push`, `supabase functions deploy claude-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt`. No cd, ever again.
- Do NOT pipe allowlisted commands to `tail`/`head` — run bare; the harness truncates output itself. If you truly need less output, that's a reason to pick a narrower command, not to pipe.
- For **investigation** (finding code, reading, listing) use the dedicated **Grep / Read / Glob** tools, NOT `bash grep/awk/sed/echo/find`. Those compound one-off shell commands were the main source of prompts and can never be allowlisted (each is unique). Dedicated tools integrate with the permission UI and don't prompt.
- Allowlisted in `.claude/settings.json` (2026-07-17): `_patch.py`, `smoke.py`, `is-grammar-qa.py *`, `is-corr-qa.py *`, `show_corrections.py`, `node --check *`, `node scripts/verify_*`, `golden_contracts.js`, `golden_dump.js *`, `git add/commit/push`, `supabase functions deploy *`. Deploy + push are auto-approved because Kuky asked for it and every deploy is gated behind smoke 10/10 first — keep that gate. Related: [[one-patch-script-path]], [[proceed-dont-ask]].

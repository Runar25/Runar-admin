---
name: commit-by-pathspec
description: "With two Code sessions sharing a worktree, always commit by explicit pathspec — git commit takes the whole index, including the other lane's staged files"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

In the Rúnar repo, commit with an explicit pathspec: `git commit -F - -- <paths>`. Never a bare `git commit` after `git add`, and never `git add -A`.

**Why:** CODE-tune and CODE-tree share one working tree and one index. `git add <myfile>` stages only mine, but `git commit` commits **everything staged**, including what the other session staged and had not yet committed. On 2026-07-18 this swallowed CODE-tree's whole change set — `v2/runar-tree.js` (the area/aol fix), `scripts/verify_tree_signals.js`, its smoke wiring and its RUNAR_DECISIONS entry — into a `[docsync]` commit about file-saving rules. Nothing was lost, but the history misattributes its work to my commit, and the lane prefix (the one thing that identifies an author, since git signs every session "Runar Admin") became a lie.

**How to apply:** `git add <paths>` then `git commit -F - -- <the same paths>`; the pathspec makes the commit ignore anything else in the index. When unsure what is staged, `git diff --cached --name-only` first and compare it against what the message claims. Do not rewrite pushed history to fix a past instance — note it and move on. This is also the honest answer to "should agents lock files": a lock would not have prevented it (nobody edited the same file) — the fix is removing the ability to collide, not announcing intent. Related: [[function-not-ceremony]], [[one-patch-script-path]].

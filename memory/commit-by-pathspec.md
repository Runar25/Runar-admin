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

**How to apply:** `git add <paths>` then `git commit -F - -- <the same paths>`; the pathspec makes the commit ignore anything else in the index. When unsure what is staged, `git diff --cached --name-only` first and compare it against what the message claims. Do not rewrite pushed history to fix a past instance — note it and move on. Related: [[function-not-ceremony]], [[one-patch-script-path]].

⚠️ **Pathspec is NOT enough when both lanes edit the SAME file** (2026-07-19, second occurrence). A pathspec selects *files*, never *hunks* — naming `v2/runar-tree.js` commits that file's entire working-tree state, including the other lane's uncommitted edits to it. It happened again on `9c41906`: I wrote 5 lines of `runar-tree.js` and 20 of `RUNAR_DECISIONS.md`, the commit recorded **58 and 57**. `git blame` now attributes CODE-tree's unfulfilled `Affected doc(s)` promise to my commit, and smoke ⑮ failed pointing at a doc in *their* lane.

`RUNAR_DECISIONS.md` guarantees this collision — every lane appends to it, so any commit that records a decision sweeps up whatever the other lane has pending.

⚠️ **`git add -A <dir>` is as dangerous as a bare `git commit`** (2026-07-19, third occurrence). `git add -A v2` staged **112 files** — the whole of CODE-tree's untracked `tree-snapshots/`, `tree-lab-*/`, `sigil-lab/`. The commit itself stayed clean because it carried a pathspec, but the index was left loaded, so the *next* commit by either lane would have swept them in. Stage files by name, never by directory; if you already did, `git reset` before anyone else commits.

**So before committing a shared file, diff it and check whose lines they are:** `git diff --stat -- <file>` against what you actually wrote. If the count is bigger than your change, the surplus is someone else's — commit it knowingly and say so in the message, or wait for them to land first. Do not "fix" what you swept in: it is their lane, and a promise in their `Affected doc(s)` is theirs to keep.

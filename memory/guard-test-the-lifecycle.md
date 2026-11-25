---
name: guard-test-the-lifecycle
description: "When writing an automated check, test it against every lifecycle state of the thing it inspects — not just one good case and one bad case"
metadata:
  node_type: memory
  type: feedback
---

When adding a check to `smoke.py`, do not stop at "green on good input, red on bad input". Enumerate the **states the inspected thing passes through** and run the check against each: not yet written · written but uncommitted · committed just now · edited later · renamed · moved to archive · deleted. A guard is code that runs on every commit for months; the states it will actually meet are the lifecycle, not the two cases you had in mind while writing it.

**Why:** on 2026-07-19 I shipped `verify_decisions_followthrough.js` (smoke ⑮) after testing exactly two things — clean repo → green, enforcement date moved into the past → red. Both passed, and the guard still had two real bugs that only appeared in normal use, each costing a red build and a fix commit. (1) A *rospracovaný, uncommitted* `Affected doc(s)` line makes `git blame` return all-zeros; the guard read that as "promise never kept" and flagged the very fix the author was writing. (2) Editing that line later re-pointed blame at a new commit and **reset the clock**, so promises already kept a commit earlier fell outside the window. Neither is exotic — both are what happens the first time anyone uses the thing. I had tested the check's verdict, not its subject's life.

**How to apply:** before wiring a new check into smoke, write down the lifecycle of what it reads (a line in a file, a doc, a DB row, a config value) and walk it state by state, asking "what does my check say here, and is that right?" Prefer inputs that are stable across the lifecycle — ⑮ became correct only when it compared by **date** instead of by commit ancestry, because the date survives edits to the line. And when a guard fires on its own author within minutes, that is the check working; the thing to examine next is whether the *guard* is right, not just the finding. Related: [[verify-agent-claims-about-code]], [[cheapest-deciding-measurement-first]].

**Sloučeno 2026-11-25 z a-guard-that-refuses-is-a-detector — odmítnutí zapsat je detektor duplikátů.** Patch skripty odmítají zapsat,
když kotva nemá právě jeden výskyt (`count != 1` → nic nezapsáno). Není to jen pojistka: 2026-08-15 guard odmítl změnu věty
v `DEF_CHAR_EN.personality` (count=2) — druhá kopie stála v laboratorním `DEF_CHAR_V2_EN` s komentářem o záložce, která už měsíc
neexistovala. Bez guardu by se přepsal jeden výskyt a rozdíl by se prohloubil. Guard běží při každé změně na místě, kterého se dotýkáš,
a nic nestojí. (1) `count != 1` neobcházej rozšířením kotvy, dokud nevíš, proč jsou dva; (2) je-li druhý výskyt mrtvý kód, oprav jeho
komentář (CLAUDE.md §21); (3) nález zapiš a udělej z něj stálou kontrolu.

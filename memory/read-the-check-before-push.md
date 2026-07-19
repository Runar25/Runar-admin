---
name: read-the-check-before-push
description: "Piping a check into grep/tail throws away its exit code — capture the status explicitly and read it before pushing, never chain push after an unread check"
metadata:
  node_type: memory
  type: feedback
---

Never write `smoke.py | grep …` followed by `git push` on the next line. The pipe makes `$?` the exit status of `grep`, not of the check, and a `push` on the following line runs regardless of whether anything failed. Run the check into a file or capture the code explicitly (`cmd > /tmp/out.txt 2>&1; echo "EXIT=$?"`), **read the verdict**, and only then push.

**Why:** on 2026-07-19 I did this twice in a row in the same session, pushing a red tree both times. The second time was the same mistake as the first, minutes apart — I had "verified" by filtering the output for a word instead of by checking whether the run succeeded. §7 says run smoke before every commit; obeying the letter of it while discarding the exit code is worse than not running it, because it produces a confident report that the tree is green when it is not.

**How to apply:** treat "did this pass?" as a value you must hold, not a line you must see. If the output needs filtering for readability, capture the status first and filter second. The same applies to any chained shell verification — `&&` between check and push is fine, a newline is not. And when reporting to Kuky, only say a check passed if I read the verdict, never if I merely ran the command. Related: [[guard-test-the-lifecycle]], [[commit-by-pathspec]].

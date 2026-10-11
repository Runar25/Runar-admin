---
name: read-the-check-before-push
description: "Piping a check into grep/tail throws away its exit code — capture the status explicitly and read it before pushing, never chain push after an unread check"
metadata:
  node_type: memory
  type: feedback
---

Never write `smoke.py | grep …` followed by `git push` on the next line. The pipe makes `$?` the exit status of `grep`, not of the check, and a `push` on the following line runs regardless of whether anything failed. Run the check into a file or capture the code explicitly (`cmd > /tmp/out.txt 2>&1; echo "EXIT=$?"`), **read the verdict**, and only then push.

**Why:** on 2026-07-19 I did this twice in a row in the same session, pushing a red tree both times. The second time was the same mistake as the first, minutes apart — I had "verified" by filtering the output for a word instead of by checking whether the run succeeded. §7 says run smoke before every commit; obeying the letter of it while discarding the exit code is worse than not running it, because it produces a confident report that the tree is green when it is not.

**How to apply:** treat "did this pass?" as a value you must hold, not a line you must see. If the output needs filtering for readability, capture the status first and filter second. The same applies to any chained shell verification — `&&` between check and push is fine, a newline is not. And when reporting to Kuky, only say a check passed if I read the verdict, never if I merely ran the command. Related: [[guard-test-the-lifecycle]], [[parallel-code-sessions-collision]].

**`| tail -1` ukáže verdikt, jen když je verdikt POSLEDNÍ** (2026-10-10, CODE-read, 2× po sobě): `verify_doc_links.js` při selhání
končí nápovědou („…Záměrný případ: doc-links:ok“), ne řádkem FAIL — přečetl jsem ji jako „prošlo“ a push spadl na pre-push smoke.
Verdikt vytahuj podle tvaru: `| grep -E "^OK|FAIL"` — ale **jen na čtení, nikdy jako podmínka**.

⛔ **`check | grep -E "^(OK|FAIL)" && git commit …` commitne i při FAIL** (2026-10-11, CODE-read): grep najde řádek FAIL, skončí
úspěšně a `&&` pustí commit dál. Ten vzor jsem měl právě odsud. Jako podmínka slouží jen kladný verdikt:
`node scripts/verify_x.js | grep -q "^OK" && git commit …` (nebo exit kód samotné kontroly, bez roury).

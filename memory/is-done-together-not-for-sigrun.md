---
name: is-done-together-not-for-sigrun
description: "Leave NOTHING for Sigrún — author IS properly, verify + RESOLVE it yourself, never punt"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

Leave NOTHING for Sigrún. Not "IS draft → Sigrún", not "noted for Sigrún", not "flag for native review" — nothing. IS is authored properly from the start and its correctness is OWNED by us (Kuky + Code) together. When a check (is-grammar-qa / check-is) flags an IS string, RESOLVE it yourself right there: verify with the tools (BÍN via is-corr-qa / the `islenska` package, GreynirCorrect, declension reasoning) and decide — keep it if it is verifiably correct (say WHY), fix it if it is wrong. If we ever ship something wrong, we find it and fix it together. Sigrún is not a queue, a dependency, or a safety net to defer to.

**Why:** Kuky pushed back twice (2026-07-14) — first "IS děláme spolu", then firmly "nic nenecháváš pro Sigrún... zapamatuj si to". Punting to Sigrún treats IS as second-class and offloads ownership. IS is primary (CLAUDE.md §2) and must be right, by us.

**How to apply:** After any IS work, run is-grammar-qa; for each flag, investigate (BÍN lemma lookup, is-corr-qa, declension) and CLOSE it with a verdict in the response — never with "for Sigrún". A GreynirCorrect false-positive (e.g. it confuses `lestur`=reading with `lest`=train) is closed by confirming the correct form, not by deferring. Related: [[working-style]], [[paste-sql-explicitly]].

---
name: napred-dohledej-co-uz-je
description: Než začneš měřit/analyzovat/zakládat položku — prohledej RUNAR_PRICING/DECISIONS/BACKLOG a git log ostatních lane za poslední dny; paralelní session to často už udělaly
metadata:
  type: feedback
---

KUKY 2026-09-24: *„hodně kroků opakuješ, přitom už byly jednou udělané. Špatně si ověřuješ, co už máme hotové. Jak to?"*

**Co se stalo (za jeden den):** spočítal jsem „přesnou cenu čtení" — `RUNAR_PRICING.md` ji měl od včera (CODE-tune, 70 čtení);
založil jsem backlog položky o solu a o cache — obě už existovaly (sol od 2026-09-23, cache v PRICING); napsal jsem nástroj
`cena_cteni.js`, když `stats.js` byl přesně to místo; handoff na úhel [4] už byl nasazený; owner se ptal „nezapomněli jsme na  <!-- doc-links:ok 2026-09-24 cena_cteni.js byl smazán, zmínka je záměrně historická (doplnil CODE-tune, blokovalo smoke ⑯) -->
něco?" a CODE-tune to hodinu předtím sepsal (`7719e62`). Příčina: pracoval jsem z paměti téhle konverzace, ne z repa — a
repo mezitím měnily dvě další session.

**How to apply:** Před měřením, novou položkou, novým nástrojem nebo odpovědí „co zbývá": (1) `git log --since=<2 dny> --oneline`
všech lane; (2) grep tématu v `RUNAR_PRICING.md`, `RUNAR_DECISIONS.md`, `RUNAR_BACKLOG.md`, `scripts/`; (3) teprve pak dělej —
a jen to, co tam chybí. CLAUDE.md to říká („Před prací si přečti git log druhé lane"); tohle je připomínka, že to platí i
uprostřed dlouhé session, ne jen na začátku. Souvisí [[parallel-code-sessions-collision]], [[fix-or-log-duplicates-and-errors]].

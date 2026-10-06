---
name: nacti-cteni-a-reporty
description: Když owner řekne „načti (si) čtení a reporty“, pusť `node scripts/nacti_cteni.js` — čtení, monitor ozvěn i hlášení jedním příkazem; ⚠ a hlášení ohlas s konkrétním textem
metadata:
  type: feedback
---

Owner řekne *„načti (si) čtení a reporty“* → **`node scripts/nacti_cteni.js`** (z kořene repa). Jeden příkaz udělá všechno:
nová čtení od posledního zápisu monitoru (celé řádky do souboru mimo repo — cestu vypíše), monitor ozvěn `--nove --zapis`
(tabulka do `docs/monitor/ozveny.md`) a nová hlášení z appky (jen do terminálu).

**Why:** KUKY 2026-10-06: *„stačí, že to uděláš automaticky, když řeknu načti si čtení a reporty. To, co je v reportech,
je taky důležité — ukazuje to na něco, co zmíním nebo někdo jiný!“* Do té doby se monitor pouštěl, jen když si na něj někdo
vzpomněl, a reporty se četly zvlášť. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-06 (11).

**How to apply:**
1. Pusť skript, přečti výpis i soubor s čteními.
2. Ownerovi napiš: kolik čtení, **co monitor hlásí s ⚠** (co se opakuje, ve které větě a odkud z promptu) a **co říkají hlášení**
   — a spoj je, když hlášení míří na totéž, co monitor.
3. Vždy s konkrétním textem čtení ([[always-show-reading-samples]]). Texty lidí do repa nepiš (veřejné).
4. Monitor „odkud“ je kandidát, ne důkaz — ověř obrácenou pákou ([[falsify-by-reversing-the-lever]]).

---
name: nacti-cteni-a-reporty
description: „načti (si) čtení a reporty“ → `node scripts/nacti_cteni.js`; hlášení: přečtená se označí, hotová `--hotovo`, nehotová do BACKLOGu `--backlog`; keep = nechat
metadata:
  type: feedback
---

Owner řekne *„načti (si) čtení a reporty“* (nebo jen *„načti čtení“*) → **`node scripts/nacti_cteni.js`** (z kořene repa).
Jeden příkaz: nová čtení od posledního zápisu monitoru (celé řádky do souboru mimo repo — cestu vypíše), monitor ozvěn
`--nove --zapis` a **nepřečtená hlášení** (stav `new`), která hned označí jako přečtená (`triaged`).

**Hlášení — pořadí kroků (CLAUDE.md §29):** načíst → označit přečtené (dělá skript) → udělat → **hotové uzavřít**
`node scripts/nacti_cteni.js --hotovo <id8> "<co se udělalo, commit>"` → co se neudělá, **položka v `RUNAR_BACKLOG.md`** +
`--backlog <id8> "<položka>"`. **✦ Keep = „nechat“** — uložený text, ne úkol. Hlášení, které už není `new`, znovu neřešit.

**Why:** KUKY 2026-10-06: *„stačí, že to uděláš automaticky, když řeknu načti si čtení a reporty. To, co je v reportech, je taky
důležité“* a večer: *„konečně začni označovat tak, abych je kurva každá session i po compactu rozpoznala, že jsou hotová. Jak
debil koukáš na něco, co už je vyřešené… keep znamená nechat!“* — ukázal jsem mu 208 „otevřených“ hlášení, která byla dávno
vyřešená, jen jejich stav v DB nikdo neměnil. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-06 (11) a (15).

**How to apply:**
1. Pusť skript, přečti výpis i soubor s čteními.
2. Ownerovi napiš: kolik čtení, **co monitor hlásí s ⚠** (co se opakuje, ve které větě a odkud z promptu) a **co říkají
   nová hlášení** — a spoj je, když hlášení míří na totéž, co monitor. Vždy s konkrétním textem ([[always-show-reading-samples]]).
3. Každé hlášení dotáhni: hotovo → `--hotovo`; ne → BACKLOG + `--backlog`. Texty lidí do repa nepiš (veřejné).
4. Zápis do DB potřebuje povolení příkazu `node scripts/nacti_cteni.js` (automatický režim zápis do produkční DB jinak zastaví).
5. Monitor „odkud“ je kandidát, ne důkaz — ověř obrácenou pákou ([[falsify-by-reversing-the-lever]]).

---
name: full-path-and-numbered-lists
description: "Kukymu piš ÚPLNÉ cesty k souborům (pracovní adresář je C:\\Users\\zkuku, ne repo) a číslované seznamy tam, kde na pořadí záleží"
metadata:
  node_type: memory
  type: feedback
---

**Úplná cesta, nebo rovnou text.** Odkaz na soubor psát jako celou cestu
`C:\Users\zkuku\Downloads\Runar-admin\sql\2026-07-19_credit_ledger.sql`, ne repo-relativně
(`sql/2026-07-19_credit_ledger.sql`). Alternativa: obsah vložit rovnou do zprávy.

**Proč:** pracovní adresář session je `C:\Users\zkuku`, ale repo je
`C:\Users\zkuku\Downloads\Runar-admin`. Repo-relativní odkaz se v UI vykreslí jako klikací link,
ale otevřít ho nejde — 2026-07-19 na to Kuky narazil („Couldn't read this file… it lives outside
the working directory"). Vypadá to jako funkční odkaz, a přitom to nikam nevede.
Souvisí: [[paste-sql-explicitly]] (SQL vkládat, ne odkazovat), [[handoff-text-in-code-block]].

**Číslované seznamy, kde na pořadí záleží.** Když něco má být první, druhé, prioritní —
dát tomu čísla, ne odrážky. Kuky 2026-07-19: *„pokud je něco první, dávej jim čísla…
je to lepší se v tom orientovat!"* Odrážkový seznam se čtyřmi vadami + větou „ta první je
nejvážnější" pod ním nutí čtenáře dopočítávat, která to je. Čísla to řeknou rovnou.

**How to apply:** každý odkaz na soubor = plná cesta od `C:\`. Každý seznam, kde je pořadí
informace (priorita, kroky, sekvence nasazení) = číslovaný. Odrážky si nech na výčty,
kde na pořadí nezáleží.

---
name: full-path-and-numbered-lists
description: "Kukymu piš ÚPLNÉ cesty k souborům (pracovní adresář je C:\\Users\\zkuku, ne repo); v hlášení ownerovi VŠECHNY body a otázky číslované (1, 2, 3…), vždy"
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

⛔ **Hlášení ownerovi = VŠECHNY body očíslované, vždy** (2026-10-07). Kuky: *„všechny tvoje podněty jsou psány
jako holý text bez označení. 1, 2,... takže reaguju holým textem. Pro mě je to nepřehledné, ale tohle je pořád dokola!
Jednou ti to řeknu, začneš to dělat dobře a pak zase tohle!“* Odpovídá po číslech — bez čísel musí citovat celé
věty, a pak není jasné, na co reaguje. Platí i pro body pod tučnými nadpisy: tučný nadpis NENÍ číslo.
Otázky a návrhy, na které má odpovědět, mají VLASTNÍ čísla (ne „Mám?“ schované uprostřed odstavce).

🔒 **Od 2026-10-07 to hlídá stroj** (CLAUDE.md §30): Stop-hook `~/.claude/runar-zprava-check.py` zprávu s odrážkami na nejvyšší úrovni <!-- doc-links:ok 2026-10-07 hook je uživatelský soubor v ~/.claude, mimo repo -->
nebo s otázkou bez čísla zastaví a nechá přepsat.

⛔ **Otázku POLOŽ, nezmiňuj** (KUKY 2026-10-14: *„pokud máš na mě dvě otázky, tak to napiš jako otázky. pokud je to nějak schované
v textu, tak to můžu přehlédnout.“*). „Tvé odpovědi čekají i dvě otázky z dřívějška“ není otázka — owner ji přehlédl. Co na něj čeká,
napiš celé znovu jako „N. <otázka>?“, i když už padla v minulé zprávě. Od 2026-10-14 to hlídá pravidlo 6 téhož hooku
(`hooks/claude/runar-zprava-check.py`, DECISIONS 2026-10-14 (5)).

**How to apply:** každý odkaz na soubor = plná cesta od `C:\`. **Každý bod hlášení a každá otázka = číslo**
(1, 2, 3 …, průběžně přes celé hlášení, ať „7“ znamená jen jednu věc). Odrážky jen uvnitř bodu.

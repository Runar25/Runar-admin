# Monitor ozvěn — co z promptu se vrací doslova ve výstupu

Píše `scripts/monitor_ozveny.js --zapis` (CODE-tune). Proč a co se měří: hlavička skriptu. ⚠ = ve ≥ 50 % případů (n ≥ 3).

## 2026-10-06 · čtení 2026-10-01 → 2026-10-06 15:45

Čtení 46 · Asků 64 · modely: gpt-6-sol 72, opus-5 29, gpt-6.1-sol 9

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 9/46 | 9/33 | 0/13 |  |
| ⚠ význam z hlavičky doslova v textu | 17/46 | 17/33 | 0/13 |  |
| ⚠ nejčastější sloveso po jménu runy (names) | 16/41 | 16/30 | 0/11 | names 16, is 10, speaks of 5, holds 4 |
| podoba oblasti opsaná (≥ 3 slova) | 10/43 | 9/31 | 1/12 | „another person's eyes“ · „in what gives“ · „in the people“ |
| pokyn úhlu opsaný (≥ 4 slova) | 1/46 | 1/33 | 0/13 |  |
| pokyn konce opsaný (≥ 4 slova) | 0/46 | 0/33 | 0/13 |  |
| Ask: slova otázky zopakovaná | 6/64 | 6/48 | 0/16 | „wellbeing and healing“ · „your life rune“ · „the hard part“ |
| Ask: „drawn“ (runa tažená / netažená) | 7/64 | 7/48 | 0/16 |  |
| Ask: „the rune / reading does not say“ | 14/64 | 11/48 | 3/16 |  |
| Ask: „leaves … open“ | 12/64 | 12/48 | 0/16 |  |
| Ask: „not a promise / verdict / sign“ | 5/64 | 5/48 | 0/16 |  |

**⚠ Upozornit ownera:** význam z hlavičky doslova v textu (sol) 17/33 · nejčastější sloveso po jménu runy (names) (sol) 16/30
<!-- do: 2026-10-06 15:45:46.924193+00 -->

## 2026-10-06 · čtení po 2026-10-06 15:45 → 2026-10-06 21:01

Čtení 5 · Asků 3 · modely: gpt-6-sol 8

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 2/5 | 2/5 | — | věta 1: 2 |
| ⚠ význam z hlavičky doslova v textu | 3/5 | 3/5 | — | věta 2: 1 · 3: 2 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 2/2 | 2/2 | — | věta 2: 1 · 3: 1 · represents 1, embodies 1 |
| nejčastější sloveso po jménu runy (holds) | 2/5 | 2/5 | — | holds 2, shows 1, represents 1, embodies 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/3 | 1/3 | — | „before a choice“ věta posl.: 1 |
| pokyn úhlu opsaný (≥ 4 slova) | 1/5 | 1/5 | — | věta 1: 1 |
| pokyn konce opsaný (≥ 4 slova) | 0/5 | 0/5 | — |  |
| Ask: slova otázky zopakovaná | 1/3 | 1/3 | — | „your life rune“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/3 | 0/3 | — |  |
| Ask: „the rune / reading does not say“ | 0/3 | 0/3 | — |  |
| Ask: „leaves … open“ | 0/3 | 0/3 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/3 | 0/3 | — |  |

Opakované fráze ve čteních (≥ 30 %): „thorn catches your sleeve“ 2 · „a sharp response might“ 2 · „sharp response might come“ 2 · „response might come too“ 2 · „might come too soon“ 2 · „do not strike back“ 2

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- „thorn catches your sleeve“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „a sharp response might“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „sharp response might come“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „response might come too“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „might come too soon“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „do not strike back“ ve čteních 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

**⚠ Upozornit ownera:** význam z hlavičky doslova v textu 3/5 · význam z hlavičky doslova v textu (sol) 3/5
<!-- do: 2026-10-06 21:01:07.129361+00 -->

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

## 2026-10-07 · čtení po 2026-10-06 21:01 → 2026-10-07 12:28

Čtení 7 · Asků 10 · modely: gpt-6-sol 17

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 3/7 | 3/7 | — | věta 1: 2 · 2: 1 |
| ⚠ význam z hlavičky doslova v textu | 4/7 | 4/7 | — | věta 2: 1 · 3: 2 · posl.: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 6/6 | 6/6 | — | věta 2: 2 · 3: 4 · stands for 1, is the rune of 2, represents 2, embodies 1 |
| nejčastější sloveso po jménu runy (is) | 2/7 | 2/7 | — | is 2, represents 2, stands 1, rune 1 |
| podoba oblasti opsaná (≥ 3 slova) | 0/5 | 0/5 | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 1/7 | 1/7 | — | „you want to go“ věta posl.: 1 |
| pokyn úhlu opsaný (≥ 4 slova) | 1/7 | 1/7 | — | věta 1: 1 |
| pokyn konce opsaný (≥ 4 slova) | 0/7 | 0/7 | — |  |
| Ask: slova otázky zopakovaná | 0/10 | 0/10 | — |  |
| Ask: „drawn“ (runa tažená / netažená) | 0/10 | 0/10 | — |  |
| Ask: „the rune / reading does not say“ | 1/10 | 1/10 | — |  |
| Ask: „leaves … open“ | 4/10 | 4/10 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/10 | 0/10 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „the rune / reading does not say“ 1× — v promptu slova „say“: „If the seeker says they do not understand, or asks for it…“ · „HOW YOU SPEAK › …abstract, mystical-sounding lines that say nothing plain — if it cannot be…“ (+1)
- Ask „leaves … open“ 4× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

**⚠ Upozornit ownera:** význam z hlavičky doslova v textu 4/7 · význam z hlavičky doslova v textu (sol) 4/7
<!-- do: 2026-10-07 12:28:31.960623+00 -->

## 2026-10-09 · čtení po 2026-10-07 12:28 → 2026-10-08 16:06

Čtení 5 · Asků 7 · modely: gpt-6-sol 12

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| ⚠ obraz opsán (≥ 4 slova za sebou) | 3/5 | 3/5 | — | věta 1: 3 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/5 | 0/5 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 5/5 | 5/5 | — | věta 2: 5 · symbolizes 1, is the rune of 2, stands for 1, represents 1 |
| nejčastější sloveso po jménu runy (is) | 2/5 | 2/5 | — | is 2, symbolizes 1, stands 1, represents 1 |
| podoba oblasti opsaná (≥ 3 slova) | 0/5 | 0/5 | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/5 | 0/5 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/5 | 0/5 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/5 | 0/5 | — |  |
| Ask: slova otázky zopakovaná | 2/7 | 2/7 | — | „in this reading“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/7 | 0/7 | — |  |
| Ask: „the rune / reading does not say“ | 1/7 | 1/7 | — |  |
| Ask: „leaves … open“ | 3/7 | 3/7 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/7 | 0/7 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „the rune / reading does not say“ 1× — v promptu slova „say“: „If the seeker says they do not understand, or asks for it…“ · „HOW YOU SPEAK › …abstract, mystical-sounding lines that say nothing plain — if it cannot be…“ (+1)
- Ask „leaves … open“ 3× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

**⚠ Upozornit ownera:** obraz opsán (≥ 4 slova za sebou) 3/5 · obraz opsán (≥ 4 slova za sebou) (sol) 3/5
<!-- do: 2026-10-08 16:06:15.64621+00 -->

## 2026-10-09 · čtení po 2026-10-08 16:06 → 2026-10-09 23:27

Čtení 1 · Asků 0 · modely: gpt-6-sol 1

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 0/1 | 0/1 | — |  |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/1 | 0/1 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 1/1 | 1/1 | — | věta 2: 1 · embodies 1 |
| nejčastější sloveso po jménu runy (embodies) | 1/1 | 1/1 | — | embodies 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/1 | 1/1 | — | „bringing into being“ věta posl.: 1 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/1 | 0/1 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| Ask: slova otázky zopakovaná | — | — | — |  |
| Ask: „drawn“ (runa tažená / netažená) | — | — | — |  |
| Ask: „the rune / reading does not say“ | — | — | — |  |
| Ask: „leaves … open“ | — | — | — |  |
| Ask: „not a promise / verdict / sign“ | — | — | — |  |
| Ask: „…, or not“ | — | — | — |  |

Bez varování.
<!-- do: 2026-10-09 23:27:59.655687+00 -->

## 2026-10-13 · čtení po 2026-10-09 23:27 → 2026-10-13 13:01

Čtení 14 · Asků 7 · modely: gpt-6-sol 21

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 6/14 | 6/14 | — | věta 1: 6 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 7/14 | 7/14 | — | věta 2: 1 · 3: 4 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 6/6 | 6/6 | — | věta 2: 3 · 3: 3 · stands for 2, is the rune of 2, represents 1, embodies 1 |
| nejčastější sloveso po jménu runy (er) | 5/12 | 5/12 | — | er 5, stands 2, is 2, s 1 |
| podoba oblasti opsaná (≥ 3 slova) | 3/10 | 3/10 | — | „vex upp úr“ · „í því sem“ · „að þroskast í“ věta posl.: 3 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 2/8 | 2/8 | — | „before you knew“ · „lead where you want to go or“ věta posl.: 2 |
| pokyn úhlu opsaný (≥ 4 slova) | 0/14 | 0/14 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/14 | 0/14 | — |  |
| Ask: slova otázky zopakovaná | 2/7 | 2/7 | — | „your life rune“ · „in this reading“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/7 | 0/7 | — |  |
| Ask: „the rune / reading does not say“ | 0/7 | 0/7 | — |  |
| Ask: „leaves … open“ | 1/7 | 1/7 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/7 | 0/7 | — |  |
| Ask: „…, or not“ | 0/7 | 0/7 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „leaves … open“ 1× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

Bez varování.
<!-- do: 2026-10-13 13:01:32.172472+00 -->

## 2026-10-14 · čtení po 2026-10-13 13:01 → 2026-10-14 09:54

Čtení 5 · Asků 2 · modely: gpt-6-sol 7

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 2/5 | 2/5 | — | věta 1: 1 · 2: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 3/5 | 3/5 | — | věta 2: 2 · 3: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 4/4 | 4/4 | — | věta 2: 3 · 3: 1 · stands for 3, represents 1 |
| nejčastější sloveso po jménu runy (er) | 1/1 | 1/1 | — | er 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/4 | 1/4 | — | „í næsta skrefi“ věta posl.: 1 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 1/4 | 1/4 | — | „now and what“ věta posl.: 1 |
| pokyn úhlu opsaný (≥ 4 slova) | 0/5 | 0/5 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/5 | 0/5 | — |  |
| Ask: slova otázky zopakovaná | 0/2 | 0/2 | — |  |
| Ask: „drawn“ (runa tažená / netažená) | 0/2 | 0/2 | — |  |
| Ask: „the rune / reading does not say“ | 0/2 | 0/2 | — |  |
| Ask: „leaves … open“ | 1/2 | 1/2 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/2 | 0/2 | — |  |
| Ask: „…, or not“ | 0/2 | 0/2 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „leaves … open“ 1× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

Bez varování.
<!-- do: 2026-10-14 09:54:13.835567+00 -->

## 2026-10-16 · čtení po 2026-10-14 09:54 → 2026-10-16 09:59

Čtení 3 · Asků 2 · modely: gpt-6-sol 5

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 1/3 | 1/3 | — | věta 1: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 1/3 | 1/3 | — | věta 3: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 1/1 | 1/1 | — | věta 3: 1 · is the rune of 1 |
| nejčastější sloveso po jménu runy (er) | 1/1 | 1/1 | — | er 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/1 | 1/1 | — | „sem vinnur í kyrrþey í lífi“ věta posl.: 1 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | — | — | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/3 | 0/3 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/3 | 0/3 | — |  |
| Ask: slova otázky zopakovaná | 0/2 | 0/2 | — |  |
| Ask: „drawn“ (runa tažená / netažená) | 0/2 | 0/2 | — |  |
| Ask: „the rune / reading does not say“ | 0/2 | 0/2 | — |  |
| Ask: „leaves … open“ | 0/2 | 0/2 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/2 | 0/2 | — |  |
| Ask: „…, or not“ | 0/2 | 0/2 | — |  |
Opakované fráze v Ascích (≥ 30 %): „the edge and call“ 2 · „edge and call emergency“ 2 · „and call emergency services“ 2

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- „the edge and call“ v Ascích 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „edge and call emergency“ v Ascích 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- „and call emergency services“ v Ascích 2× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

Bez varování.
<!-- do: 2026-10-16 09:59:53.070932+00 -->

## 2026-10-20 · čtení po 2026-10-16 09:59 → 2026-10-19 21:03

Čtení 0 · Asků 2 · modely: gpt-6-sol 2

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | — | — | — |  |
| význam z hlavičky doslova v textu (definiční věta, záměr) | — | — | — |  |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | — | — | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | — | — | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | — | — | — |  |
| pokyn konce opsaný (≥ 4 slova) | — | — | — |  |
| Ask: slova otázky zopakovaná | 1/2 | 1/2 | — | „án þess að“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/2 | 0/2 | — |  |
| Ask: „the rune / reading does not say“ | 0/2 | 0/2 | — |  |
| Ask: „leaves … open“ | 0/2 | 0/2 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/2 | 0/2 | — |  |
| Ask: „…, or not“ | 0/2 | 0/2 | — |  |

Bez varování.
<!-- do: 2026-10-19 21:03:56.13371+00 -->

## 2026-10-22 · čtení po 2026-10-19 21:03 → 2026-10-22 12:57

Čtení 4 · Asků 4 · modely: gpt-6-sol 8

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| ⚠ obraz opsán (≥ 4 slova za sebou) | 3/4 | 3/4 | — | věta 1: 1 · 2: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/4 | 0/4 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 4/4 | 4/4 | — | věta 2: 1 · 3: 3 · embodies 1, is the rune of 2, symbolizes 1 |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | — | — | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/3 | 0/3 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/4 | 0/4 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/4 | 0/4 | — |  |
| Ask: slova otázky zopakovaná | 1/4 | 1/4 | — | „get the job“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/4 | 0/4 | — |  |
| Ask: „the rune / reading does not say“ | 0/4 | 0/4 | — |  |
| Ask: „leaves … open“ | 1/4 | 1/4 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/4 | 0/4 | — |  |
| Ask: „…, or not“ | 0/4 | 0/4 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „leaves … open“ 1× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

**⚠ Upozornit ownera:** obraz opsán (≥ 4 slova za sebou) 3/4 · obraz opsán (≥ 4 slova za sebou) (sol) 3/4
<!-- do: 2026-10-22 12:57:45.348718+00 -->

## 2026-10-27 · čtení po 2026-10-22 12:57 → 2026-10-27 14:15

Čtení 10 · Asků 11 · modely: gpt-6-sol 21

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 3/10 | 3/10 | — | věta 1: 2 · 2: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 5/10 | 5/10 | — | věta 1: 1 · 2: 3 · 3: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 8/8 | 8/8 | — | věta 2: 6 · 3: 2 · symbolizes 1, stands for 1, represents 1, embodies 2, signifies 3 |
| nejčastější sloveso po jménu runy (minnir) | 2/2 | 2/2 | — | minnir 2 |
| podoba oblasti opsaná (≥ 3 slova) | 1/6 | 1/6 | — | „að vaxa upp úr“ věta posl.: 1 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 1/6 | 1/6 | — | „in your life“ věta posl.: 1 |
| pokyn úhlu opsaný (≥ 4 slova) | 1/10 | 1/10 | — | věta 1: 1 |
| pokyn konce opsaný (≥ 4 slova) | 1/10 | 1/10 | — | věta posl.: 1 |
| Ask: slova otázky zopakovaná | 2/11 | 2/11 | — | „about the work“ · „room for rest“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/11 | 0/11 | — |  |
| Ask: „the rune / reading does not say“ | 0/11 | 0/11 | — |  |
| Ask: „leaves … open“ | 3/11 | 3/11 | — |  |
| Ask: „not a promise / verdict / sign“ | 1/11 | 1/11 | — |  |
| Ask: „…, or not“ | 0/11 | 0/11 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „leaves … open“ 3× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)
- Ask „not a promise / verdict / sign“ 1× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

Bez varování.
<!-- do: 2026-10-27 14:15:42.533079+00 -->

## 2026-10-28 · čtení po 2026-10-27 14:15 → 2026-10-27 21:39

Čtení 1 · Asků 0 · modely: gpt-6-sol 1

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 1/1 | 1/1 | — | věta 1: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/1 | 0/1 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 1/1 | 1/1 | — | věta 2: 1 · symbolizes 1 |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | — | — | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/1 | 0/1 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| Ask: slova otázky zopakovaná | — | — | — |  |
| Ask: „drawn“ (runa tažená / netažená) | — | — | — |  |
| Ask: „the rune / reading does not say“ | — | — | — |  |
| Ask: „leaves … open“ | — | — | — |  |
| Ask: „not a promise / verdict / sign“ | — | — | — |  |
| Ask: „…, or not“ | — | — | — |  |

Bez varování.
<!-- do: 2026-10-27 21:39:52.27121+00 -->

## 2026-10-29 · čtení po 2026-10-27 21:39 → 2026-10-29 09:57

Čtení 1 · Asků 0 · modely: gpt-6-sol 1

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 0/1 | 0/1 | — |  |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/1 | 0/1 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 1/1 | 1/1 | — | věta 2: 1 · is the rune of 1 |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | — | — | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/1 | 0/1 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| Ask: slova otázky zopakovaná | — | — | — |  |
| Ask: „drawn“ (runa tažená / netažená) | — | — | — |  |
| Ask: „the rune / reading does not say“ | — | — | — |  |
| Ask: „leaves … open“ | — | — | — |  |
| Ask: „not a promise / verdict / sign“ | — | — | — |  |
| Ask: „…, or not“ | — | — | — |  |

Bez varování.
<!-- do: 2026-10-29 09:57:32.925949+00 -->

## 2026-10-29 · čtení po 2026-10-29 09:57 → 2026-10-29 21:11

Čtení 2 · Asků 0 · modely: gpt-6-sol 2

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 0/2 | 0/2 | — |  |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 0/2 | 0/2 | — |  |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 2/2 | 2/2 | — | věta 2: 1 · 3: 1 · represents 1, is the rune of 1 |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | — | — | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 1/1 | 1/1 | — | „it costs you something“ věta posl.: 1 |
| pokyn úhlu opsaný (≥ 4 slova) | 0/2 | 0/2 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/2 | 0/2 | — |  |
| Ask: slova otázky zopakovaná | — | — | — |  |
| Ask: „drawn“ (runa tažená / netažená) | — | — | — |  |
| Ask: „the rune / reading does not say“ | — | — | — |  |
| Ask: „leaves … open“ | — | — | — |  |
| Ask: „not a promise / verdict / sign“ | — | — | — |  |
| Ask: „…, or not“ | — | — | — |  |

Bez varování.
<!-- do: 2026-10-29 21:11:15.772622+00 -->

## 2026-11-03 · čtení po 2026-10-29 21:11 → 2026-11-03 07:40

Čtení 12 · Asků 4 · modely: gpt-6-sol 16

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| ⚠ obraz opsán (≥ 4 slova za sebou) | 8/12 | 8/12 | — | věta 1: 7 · 2: 1 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 8/12 | 8/12 | — | věta 2: 2 · 3: 6 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 11/11 | 11/11 | — | věta 2: 3 · 3: 8 · stands for 2, signifies 3, symbolizes 2, represents 1, embodies 3 |
| nejčastější sloveso po jménu runy (s) | 1/1 | 1/1 | — | s 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/3 | 1/3 | — | „to those before and after“ věta posl.: 1 |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 2/12 | 2/12 | — | „ready to open“ · „where you want“ věta posl.: 2 |
| pokyn úhlu opsaný (≥ 4 slova) | 1/12 | 1/12 | — | věta 1: 1 |
| pokyn konce opsaný (≥ 4 slova) | 0/12 | 0/12 | — |  |
| Ask: slova otázky zopakovaná | 0/4 | 0/4 | — |  |
| Ask: „drawn“ (runa tažená / netažená) | 0/4 | 0/4 | — |  |
| Ask: „the rune / reading does not say“ | 1/4 | 1/4 | — |  |
| Ask: „leaves … open“ | 0/4 | 0/4 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/4 | 0/4 | — |  |
| Ask: „…, or not“ | 0/4 | 0/4 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „the rune / reading does not say“ 1× — v promptu slova „say“: „If the seeker says they do not understand, or asks for it…“ · „HOW YOU SPEAK › …abstract, mystical-sounding lines that say nothing plain — if it cannot be…“ (+1)

**⚠ Upozornit ownera:** obraz opsán (≥ 4 slova za sebou) 8/12 · obraz opsán (≥ 4 slova za sebou) (sol) 8/12
<!-- do: 2026-11-03 07:40:26.279723+00 -->

## 2026-11-16 · čtení po 2026-11-03 07:40 → 2026-11-14 21:07

Čtení 8 · Asků 6 · modely: gpt-6-sol 14

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| ⚠ obraz opsán (≥ 4 slova za sebou) | 4/8 | 4/8 | — | věta 1: 4 |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 5/8 | 5/8 | — | věta 1: 1 · 2: 3 · 3: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 5/5 | 5/5 | — | věta 2: 4 · 3: 1 · symbolizes 2, stands for 2, embodies 1 |
| nejčastější sloveso po jménu runy (er) | 1/2 | 1/2 | — | er 1, sn 1 |
| podoba oblasti opsaná (≥ 3 slova) | 1/4 | 1/4 | — | „til fyrir aðra“ věta posl.: 1 |
| ⚠ otázka runy z Kolekce opsaná (≥ 3 slova) | 3/6 | 3/6 | — | „in your life“ · „ekki fengið nafn“ · „ekki lengur litið fram hjá“ věta 3: 1 · posl.: 2 |
| pokyn úhlu opsaný (≥ 4 slova) | 1/8 | 1/8 | — | věta 1: 1 |
| pokyn konce opsaný (≥ 4 slova) | 0/8 | 0/8 | — |  |
| Ask: slova otázky zopakovaná | 1/6 | 1/6 | — | „the hard part“ |
| Ask: „drawn“ (runa tažená / netažená) | 0/6 | 0/6 | — |  |
| Ask: „the rune / reading does not say“ | 0/6 | 0/6 | — |  |
| Ask: „leaves … open“ | 1/6 | 1/6 | — |  |
| Ask: „not a promise / verdict / sign“ | 0/6 | 0/6 | — |  |
| Ask: „…, or not“ | 0/6 | 0/6 | — |  |

**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):
- Ask „leaves … open“ 1× — v promptu není → zvyk modelu (nebo vstup, který monitor nezná)

**⚠ Upozornit ownera:** obraz opsán (≥ 4 slova za sebou) 4/8 · obraz opsán (≥ 4 slova za sebou) (sol) 4/8 · otázka runy z Kolekce opsaná (≥ 3 slova) 3/6 · otázka runy z Kolekce opsaná (≥ 3 slova) (sol) 3/6
<!-- do: 2026-11-14 21:07:30.192559+00 -->

## 2026-11-18 · čtení po 2026-11-14 21:07 → 2026-11-18 09:51

Čtení 1 · Asků 0 · modely: gpt-6-sol 1

| vstup → výstup | vše | sol | opus | poznámka |
|---|---|---|---|---|
| obraz opsán (≥ 4 slova za sebou) | 0/1 | 0/1 | — |  |
| význam z hlavičky doslova v textu (definiční věta, záměr) | 1/1 | 1/1 | — | věta 2: 1 |
| sloveso z losu hned za jménem runy (záměr, v5.01) | 1/1 | 1/1 | — | věta 2: 1 · is the rune of 1 |
| nejčastější sloveso po jménu runy (—) | — | — | — |  |
| podoba oblasti opsaná (≥ 3 slova) | 0/1 | 0/1 | — |   |
| otázka runy z Kolekce opsaná (≥ 3 slova) | 0/1 | 0/1 | — |   |
| pokyn úhlu opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| pokyn konce opsaný (≥ 4 slova) | 0/1 | 0/1 | — |  |
| Ask: slova otázky zopakovaná | — | — | — |  |
| Ask: „drawn“ (runa tažená / netažená) | — | — | — |  |
| Ask: „the rune / reading does not say“ | — | — | — |  |
| Ask: „leaves … open“ | — | — | — |  |
| Ask: „not a promise / verdict / sign“ | — | — | — |  |
| Ask: „…, or not“ | — | — | — |  |

Bez varování.
<!-- do: 2026-11-18 09:51:55.101565+00 -->

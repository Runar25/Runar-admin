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

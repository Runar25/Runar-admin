# Identita runa × místo na rizikových runách — CODE-read 2026-09-19

Nález a čísla vlastní `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_EVAL_LOG.md` (záznam 2026-09-19 „Identita runa × místo").
Tady jsou jen podklady.

- `<Runa>-<shore|lava|fog>.txt` — 12 plných promptů (produkce v4.27). Každý se od produkčního promptu té runy liší JEN
  řádkem IMAGE: jádro obrazu bez místa + `Where: on the shore / across a black lava field / in fog` (hlídá stavěcí skript).
  Losy pevné: úhel 6, `LENGTH_BUDGETS[1]`, jméno uprostřed, bez čočky; konec Isa/Tiwaz `ENDING_HEAVY[0]`, jinak `ENDING_OPEN[2]`.
- `legenda.txt` — 25 run + `RUNES[].k` pro slepého soudce (volba ze všech 25).
- `texty.json` — 12 čtení + verdikt soudce (fragment bez vět se jménem runy); u Algizu i druhý verdikt se zamaskovaným
  jménem osoby (jméno „Thor" táhlo soudce k Thurisaz).
- `skripty/` — stavba promptů (`misto4_build.js`), workflow pisatelů a soudců, přesouzení Algizu, výtah z deníku.

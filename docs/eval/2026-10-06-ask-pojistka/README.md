# Pojistka „the rune does not say…" v Asku — nese ji sloveso SAY v pravidlech? (CODE-read, 2026-10-06)

Handoff CODE-tune proti `5c28c3a`. Výsledek vlastní `RUNAR_EVAL_LOG.md` 2026-10-06 (záznam „Ask pojistka × say").
Navazuje na `docs/eval/2026-10-06-ask-otazky/` (CODE-tune, pokus A) — týž harness, táž čtení, tytéž tipy, jejich `rozbor_slova.js`.

| soubor | co |
|---|---|
| `ask_say.js` | P0 produkce · V obě věty „say what the runes … hold" jiným slovesem · R obráceně „say plainly what the runes … say"; gpt-6-sol jako callSol, n = 18 na rameno |
| `ask_say.json` | 54 odpovědí |

Vstupní čtení (ownerova, nesou jméno) jen lokálně: `C:\Users\zkuku\runar-eval\oblast\ask3.json`.
Rozbor: `node ../2026-10-06-ask-otazky/rozbor_slova.js ask_say.json`.

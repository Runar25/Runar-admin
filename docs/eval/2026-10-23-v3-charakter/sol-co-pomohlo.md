# Co jsme měnili kvůli gpt-6-sol a co pomohlo — rozcestník pro v3 (CODE-read 2026-10-24)

Owner 2026-10-24: „někde by mělo být zapsané, co všechno jsme upravovali pro SOL 6 — ne že to všechno teď aplikujeme, ale mělo by to jít
poznat, co pomohlo a jak oproti Opus 5.“ Souhrn nikde nebyl; tohle je ODKAZNÍK (čísla a doklady vlastní uvedené záznamy, §20).
Ve v3 to neplatí jako pravidla — jen jako seznam pák, které u solu zabíraly, k novému ověření.

| co sol dělal jinak než Opus 5 | co pomohlo | doklad |
|---|---|---|
| bere vstup doslova: co dostane, objeví se ve výstupu (význam z hlavičky 17/33, Opus 0/13) | psát vstup tak, aby byl v pořádku i doslova | RUNAR_DESIGN „Slova, která dáváme modelu“ bod 1 |
| opisoval islandskou glosu jména runy (3/5) | jméno runy bez glosy v promptu → 0/5 | EVAL_LOG 2026-09-24 (4), DECISIONS 2026-09-24 (18) |
| obraz převyprávěl jeho slovy (20/28) | „one detail the sentence does not name“ → 12/28 | EVAL_LOG 2026-09-23 (9), DECISIONS 2026-09-24 (17) |
| obraz zopakoval a přilepil „while…“; Opus obraz převidí detailem zevnitř scény | ⭐ „look closer, at what someone there would notice first“ (nejdelší opis 2–3 slova, nejmíň slov obrazu v 1. větě) | EVAL_LOG 2026-09-23 (6) |
| bez seznamu klíčových slov runy ztrácí identitu (6/12 → 3/12) | seznamy klíčových slov u solu NECHAT | EVAL_LOG 2026-09-23 (3) |
| sloveso definiční věty bere z pokynu („Hagalaz names…“) | sloveso doložené v anglických textech o runách, losem | DECISIONS 2026-10-06 (7) a (10) |
| islandský konec bez „ástand“ (stav) utekl od člověka | most s „ástand“ + „sagt með orðum myndarinnar“ | EVAL_LOG 2026-09-22 (2) |
| pravidla ze systémového promptu dodrží stejně jako z user promptu | stálá pravidla smí do systému | EVAL_LOG 2026-10-16 (1) |
| islandština: sol 0 tvrdých chyb, Opus 5 5 chyb (10 textů); sol 4–10× levnější, 2–3× rychlejší; soudci styl 11:3 pro Opus | — (výměna kvalita × cena × IS) | EVAL_LOG 2026-09-22 (2) |
| sol 6.1 na `low`: vymyšlené a protiřečivé obrazy, 8,5–17,4 s | zpět na sol 6 bez přemýšlení | DECISIONS 2026-10-05 (3) |

Pro v3 věta 1 (krok 9 na solu, `krok9-sol.md`): sol píše situaci plošší („someone shows a neighbor how to knead dough“) — to je tentýž jev
jako „obraz bez vlastního vidění“ z 2026-09-23 (6); páka, která tehdy zabrala, je kandidát k ověření (až owner pustí sol).

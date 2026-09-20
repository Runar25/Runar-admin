# Přepis pěti čtení po ownerově opravě „stavba run měla být jiná" (2026-09-20)

CODE-read v EVAL_LOG 2026-09-20 (7) naměřil v mých čteních **sponu `<Runa> is/er` 3/3** a **jméno
člověka v téže větě jako esence** (2/3). Owner to potvrdil jako hlavní vadu. Přepsáno podle
`RUNAR_DESIGN.md` „Stavba Single čtení — základ": **runa vstupuje VZTAHEM (slovesem), ne rekvizitou.**

## Měřeno (detektor `spona.py`, obhájený na starých textech = 3/3)

| | spona | délka | věty | runa | jméno člověka |
|---|---|---|---|---|---|
| staré 1 Berkana EN | „Berkana **is** that crossing" | 44 (38–45) | 3 | věta 2 | **věta 2 — kolize** |
| staré 2 Gebo EN | „Gebo **is** the exchange" | 57 (50–58) | 4 | věta 2 | — |
| staré 3 Berkana IS | „Berkana **er** þetta skref" | 44 | 3 | věta 2 | **věta 2 — kolize** |
| **nové 1** | 0 — „Berkana **moves under** the foot…" | 46 (+2 %) | 3 | věta 2 | věta 1 ✓ |
| **nové 2** | 0 — „Gebo **runs between** two hands…" | 54 | 4 | věta 2 | — |
| **nové 3** | 0 — „Berkana **ber** það sem byrjar…" | 40 | 3 | věta 2 | věta 1 ✓ |

Spona **3/3 → 0/3**, kolize jména s esencí **2/2 → 0/2**. IS: is-grammar-qa 0 nálezů; korpus
*ber það sem* 82 · *stendur sjálft* 56 · *áður en það* 29 888 · *safnar í sig* 76 · *hinn enda* 388.

## Co z toho plyne pro prompt (nález, ne změna)

Sponu jsem uměl odstranit **jen tím, že jsem psal proti dvojici pokynů**, kterou prompt dává:
„Mention `<runa>` by name once" + „THE ESSENCE LINE: one short line that says what the rune DOES".
Model, který instrukce plní doslova, je spojí do `<Runa> is <co dělá>`. Dokud ta dvojice stojí
vedle sebe v jedné větě, spona se bude vracet — ruční přepis ji neřeší systémově.
Řešení podle DESIGN bodu 6 = los rámů esence (znění vlastní owner) nebo oddělení jména runy od
esenční věty (`RUNE_PLACEMENTS`, fronta CODE-read bod 5.1).

# Ask „Where does this get hard?“ — mluví přes obraz? (sol, API) — 2026-11-16, CODE-tune

**Podnět:** hlášení 037966b4 (čtení Algiz `04242…`, 10. 11.): na tip *„Where does this get hard?“* přišla odpověď přes obraz
(*„from the sound alone“*), owner pak napsal *„Tell me the hard part without the image!“*. Owner 2026-11-16: *„5. zkus“*, *„ano, pusť ten pokus“*.

**Data napřed (hlídač API):** v produkci jediná odpověď na tenhle tip (ta Algiz). Lab 2026-10-06 (`ask_slova_B`, vstup ještě s ✦, v5.00):
9 odpovědí, obraz čtení (mohyla, světlo, zvuk) v 5–6 z 9 — malé n a jiný vstup, proto pokus.

**Hypotéza (obrácená páka, CLAUDE.md §25 A):** první pravidlo Asku končí *„…; speak from what the picture holds“* (2026-10-03, kvůli tipu
„clearer image“) a táhne do obrazu každou odpověď. P0 = produkce (v5.23) · P1 = bez té půlvěty (nic se nepřidává).

**Vstup:** 4 ownerova čtení (Raidho mohyly · Algiz sob · Sowilo půlnoční slunce · Algiz vřesoviště), produkční cesta (`buildSysPrompt` +
`buildAskPrompt`, bez řádku ✦), životní runa Isa, sol `reasoning_effort: none`, 320 tokenů. 2 ramena × 4 čtení × 3 = 24 volání, **$0,074**.
Výstupy `vysledky.json` (bez jména), skript `ask_tezkost.js`.

| | P0 produkce | P1 bez půlvěty |
|---|---|---|
| podstatné jméno scény z obrazu (cairn, twig, snaps, reindeer, heath…) | **5/12** | **0/12** |
| pojistka (`scripts/utils/pojistka.js`) | 7/12 | **10/12** |
| slov celkem | 362 | 382 |

**Nález:** bez půlvěty zmizí scéna (mohyla 3/3 → 0/3, praskající větvička 2/3 → 0/3) a těžkost zazní rovně (*„The hard part may be that you
know the road well…“*). Cena: **pojistka stoupne** (*„The reading does not say…“, „leaves that distinction open“*) — model místo obrazu
uzavírá odstup od verdiktu. Sowilo (*„enough light to see what is near“*) mluví světlem v obou ramenech — to je význam runy, ne scéna.

**Hranice:** n = 12 na rameno, jeden tip, jen EN; scéna se u Sowila ani u Algiz-sob neobjevila ani v P0 (scénu nesou jen 2 ze 4 čtení).
Neměřeno: tip „clearer image“, kvůli kterému půlvěta vznikla (2026-10-03: úhel 2/4 → 0/4) — bez ní se může vrátit převyprávění úhlu.
Nerozhodnuto: zda je rovnější odpověď s víc pojistkou lepší — rozhoduje owner podle textů.

**Verdikt ownera 2026-11-16:** *„obraz lepší“* → půlvěta zůstává, prompt beze změny (DECISIONS 2026-11-16 (3)).

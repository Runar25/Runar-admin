# V3 bez obrazu — Gebo: popis · napětí · cesta · otázka (CODE-read, 2026-11-17)

Owner 2026-11-17: „v3 bude teď úplně bez obrazu. kombinace toho, co máme, a gemini … první věta je popis, co je runa … napětí, cesta,
otázka“ · u rozcestí „nabídnout rozcestník … to, že si má vybrat sám, mu říkat nemusíme, stačí, že mu dáme možnosti“ · „8. udělej · 9. ano“.
Navazuje na `../README.md` oddíl 8.5 (čtení bez obrazu 2026-11-14) a BACKLOG položky 12 a 13. Materiál: výklad Gebo od Gemini podle ownerova
zadání (v konverzaci, ne v repu).

## Data (`gebo-data.json`) — u každé položky, odkud je
1. **4 popisy runy** — ownerův popis Gebo (`RUNAR_POPISY_RUN.md`), Kolekce, tvar runy (dvě čáry, které se kříží; Gemini).
2. **7 napětí** — jedno z každé dynamiky katalogu `docs/eval/2026-10-23-v3-charakter/krok30-gebo-katalog.md`.
3. **6 cest** — tři od Gemini (dát bez počítání · zastavit jednostrannou výměnu · přijmout bez okamžité oplátky) a tři z katalogu (poděkovat ·
   malý dar · vrátit dar, který si dělá nárok). Každé napětí má dvě cesty, které k němu sedí.
4. Los: popis a napětí ze seedu; bez oblasti jedna z jeho dvou cest, s oblastí Crossroads obě jako rozcestník.

## Zadání (`sloz_gebo.js`)
Systém = produkce beze změny. Zadání nese popis, napětí, cestu (cesty) a čtyři věty v pořadí: 1 „Gebo is …“ · 2 napětí jako věc runy, ne
pocit člověka · 3 co cesta je a co žádá, bez „you could / try / you should“ (u rozcestí obě cesty vedle sebe, žádnou nepreferovat, neříkat
„volba je tvoje“) · 4 jedna otázka do života. U rozcestí smí Rúnar říct, že člověk stojí před volbou (zadal to sám). Žádný obraz.
Model produkce (gpt-6-sol, bez přemýšlení), 6 volání. Texty: `ulohy_vysledky.json`.

## Co se změřilo (6 čtení; počítáno skriptem a čteno)
1. Čtyři věty 6 ze 6, jméno runy jednou 6 ze 6, žádná scéna 6 ze 6.
2. Délka: bez oblasti 56, 56, 61 slov (cíl 50–60) · rozcestí 70, 67, 71 (cíl 55–70).
3. Napětí jako věc runy: 6 ze 6 („It holds the difference between …“). **Vada:** stejný začátek věty ve 4 ze 6 — model si šablonu zvolil
   sám, v zadání ta slova nejsou.
4. Rada: „you could / try / you should“ 0 ze 6. Jednou „You can receive … or return …“ (rozcestí 2) — tvar možnosti, ale blízko radě.
5. Rozcestník: obě cesty vedle sebe 3 ze 3, žádná preferovaná, „volba je tvoje“ 0 ze 3. Rozcestí model pojmenoval 3 ze 3
   („At a crossroads like yours“).
6. Hádání: pocit člověka nikde. Jedno drobné domyšlení: „Which kind of gift stands before you?“ (rozcestí 2) předpokládá, že před ním
   nějaký dar je.
7. Otázka: bez oblasti 3 ze 3 začíná „Where in your life …“ — druhý opakovaný začátek.

## Hranice
1. n = 6, jedna runa, jen EN, jedno čtení na los. Kvalitu posuzuje owner.
2. Netvrdí se, že si čtenář větu o runě vztáhne na sebe — to je **neověřené** a lab to neumí změřit (soudce není čtenář); rozhodnou
   owner a testeři.
3. Pestrost mezi čteními drží jen los dat (4 × 7 × 2); vlastní šablony modelu (body 3 a 7) ji ubírají.

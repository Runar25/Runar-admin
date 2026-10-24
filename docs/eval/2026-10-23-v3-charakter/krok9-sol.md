# V3 lab, krok 9 G na solu — stejný systém a stejných 6 vstupů jako Opus (krok9-minimum.md, sloupec G)

2026-10-24, CODE-read. Owner: „napřed si chci tohle vyzkoušet na SOL, udělej stejných 6 čtení… a udělej je i pro SOL 6.1 low a spočítej,
kolik to bude stát.“ OpenAI chat/completions, role system = charakter E, user = vstup G (Gebo + prostředí + co může dar být + hranice + úkol).
gpt-6-sol: reasoning_effort none, strop 300 · gpt-6.1-sol: low, strop 2000. Ceny z `MODEL_PRICES` (v2/runar-config.js). 12 volání.

| prostředí | Opus 5.5 (agent, krok 9 G) | gpt-6-sol (none) | gpt-6.1-sol (low) |
|---|---|---|---|
| a kitchen at home | A grandmother's hands rest over the boy's on the dough, pressing the way her mother showed her. | At the kitchen table, someone shows a neighbor how to knead dough, then leaves the loaf with them. | At the kitchen table, a grandfather shows his grandson how to mend a torn apron. |
| a family table | A father shows his son how to carve the roast, and the son passes him the first slice. | At the family table, an uncle shows a child how to mend a torn sleeve. | At the family table, a grandfather teaches his grandson to mend a torn sleeve. |
| between two friends | One friend spends a Saturday mending the other's bicycle, and that evening is given supper at his table. | One friend brings a mended coat to the other, who has kept a chair by the fire. | One friend spends the afternoon teaching the other how to mend a torn coat. |
| at work | The old welder shows the apprentice his trick with the torch, the apprentice brings him coffee every morning. | At work, a colleague stays late to show a new hire how to mend the machine. | A colleague stays after the meeting to teach you a skill they learned over years. |
| on a train | On the night train, an old man shows a boy a knot, and the boy shares his oranges. | On the train, a passenger shows a stranger how to read the map, then returns to her book. | On the train, a woman spends three stops teaching a stranger to mend his sleeve. |
| in a garden | An old neighbour kneels beside the bed, showing a child how to split rhubarb crowns with a spade. | In the garden, one neighbor shows another how to tie up the heavy tomato vines. | In the garden, a neighbour shows a child how to graft an apple tree. |

## Cena a čas (jen věta 1; vstup ~287 tokenů)
| model | výstup (z toho přemýšlení) | cena za větu | 6 vět | čas |
|---|---|---|---|---|
| gpt-6-sol (none) | 20–25 (0) | $0,0008 | $0,0048 | 1,2–3,2 s |
| gpt-6.1-sol (low) | 64–200 (40–175) | $0,0012–0,0026, průměr $0,0018 | $0,0106 | 2,3–5,2 s |
6.1 low = 2,2× dražší a 2–3× pomalejší, rozdíl je skoro celý přemýšlení (placené jako výstup). Celé čtení (4 věty, delší prompt) bude
dražší; spočítá se, až bude stát prompt všech 4 vět.

## Plyne (n = 6 na model, jen věta 1, jen Gebo)
1. Sol bere ze seznamu „co může dar být“ ještě jednostranněji než Opus: předaná dovednost **6/6** u obou solů (Opus 5/6), a „shows /
   teaches how to“ 6/6. gpt-6.1 navíc 4/6 „mend a torn sleeve / coat / apron“ — skoro tatáž věta. → los jedné položky na čtení platí
   pro sol ještě víc.
2. Sol píše situaci plošší než Opus: chybí cena daru a vztah (Opus: babiččiny ruce na chlapcových, syn podá otci první plátek;
   sol: „someone shows a neighbor how to knead dough“). Ownerovo „poznal by se v tom“ je u solu slabší.
3. Délka i jedna věta drží u obou solů; jídlo jako dar zmizelo (0/12).

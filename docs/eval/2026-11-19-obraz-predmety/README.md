# Obraz si dokresluje předměty — úhel [3] a pravidlo THE IMAGE (CODE-tune, 2026-11-19)

**Podnět:** hlášení 852ccc73 (+ fe581227, f05b7671) nad čtením `49697887` (Dagaz, v5.23, sol):
*„You open the byre door, and its hinges hold while morning light reaches every stall at once. You can see the worn edge of the manger…“*.
Owner 2026-11-19: *„obraz chléva se mi nelíbí … scéna má být taková, že si ji člověk jednoduše představí … stačí, když to budou dveře do
chaty, klidně horské chaty. další věc je to, že model si nemá domýšlet víc předmětů, které ale obraz nepotřebuje, jelikož nemají žádnou
funkci … v promptu to určitě změň, ať se to nestane jiným obrazům“*; k pokusu *„3 volání“*.

**Změřená příčina pantu (z `prompt_draws` čtení):** los `angle: 3` = *„Open with the one thing in the image that stays fixed while the
rest gives way“*; obraz *„You open the byre door, and the morning light floods into the dark stalls all at once“* nic pevného nemá.

## Pokus (sol, 3 volání, v5.24 = pravidlo v THE IMAGE + výjimka u úhlu [3]) — `pokus.js`, texty a prompty `vysledky.json`
Prompt postavil produkční builder (`gen_direct.js --dry-run`, single, Dagaz); vyměněn jen řádek úhlu a věta obrazu.

| obraz | úhel | co přidal | verdikt |
|---|---|---|---|
| chata (nový obraz) | [3] + výjimka | *„The doorway stays fixed“* — dveře v obrazu jsou | bez vymyšleného předmětu |
| *„At midnight all goes quiet…“* | [3] + výjimka | *„the house stays still … daylight reaches the window“* | **dům a okno vymyšlené — výjimku nevzal** |
| chata | [1] nejmenší detail | *„a thin line of light beneath the mountain hut door“* | detail ze scény, má funkci |

**Závěr:** výjimka u [3] nestačí — úhel si pevnou věc vyžádá i tam, kde žádná není. Podle kánonu (RUNAR_DESIGN „Úhel musí sednout KAŽDÉ
runě“) jde [3] **z losu ven** (text v poli zůstává kvůli indexům v uložených čteních). Pravidlo v THE IMAGE zůstává.
**Hranice:** n = 3, jen EN, jen sol, jen Dagaz; pravidlo samo bez úhlu [3] proti produkci neměřeno (žádné srovnávací rameno) —
netvrdí se, že pravidlo vymýšlení snižuje, jen že v těchto 3 textech mimo úhel [3] nic zbytečného nepřibylo.
Věta za obrazem pro sol *„down to one detail the sentence does not name“* (EVAL_LOG 2026-09-23 (9)) zůstává: detail smí přijít, má-li funkci.

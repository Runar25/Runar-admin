# Zkouška: obraz jako dávkovaná slova místo hotové věty (CODE-read, 2026-11-17)

Owner: „když budeme modelu dávkovat slova, ze kterých by měl složit obraz, jak to bude vypadat. sit, stand by fire, in bright night, and
found your hat, glove you didn't know you lost a něco zajímavého. pár čtení. jak na to bude model reagovat.“
Navazuje na `../zkouska-telefon/README.md` (bez telefonu si model zdroj světla doplnil z runy). Dřívější zkouška slov existuje jen pro
islandštinu: `../../../README.md` oddíl 8 (méně opisování, neprokázáno).

## Co se zkoušelo
1. Produkční prompt single pro Kenaz, tytéž tři seedy jako u telefonu (úhly 6, 5, 1); věta obrazu nahrazena slovy (`ulohy.json`,
   skladatel `../zkouska-telefon/sloz_telefon.js`). Řádek, který obraz uvádí („the picture in this reading comes from here: …“), beze změny.
2. Rameno „slova“: *by the fire · a bright night · your hat, found · a glove you did not know you had lost.*
3. Rameno „slova + volba“: totéž a navíc *sitting or standing* na začátku a *one more thing that turns up* na konci.
4. Model produkce (gpt-6-sol, bez přemýšlení), 6 volání. Texty: `ulohy_vysledky.json`.

## Co model udělal (počítáno ručně z šesti textů)
1. Scénu složil 6 ze 6 a pokaždé přidal vlastní detail, který ve slovech nebyl (manžeta naruby · trhlina na palci · krempa k teplu ·
   opotřebené konečky prstů · ožehlá nit · světlý steh).
2. Pořadí věcí si určil sám: hlavní věcí se stala rukavice (6 ze 6), klobouk je vedle ní nebo vypadl (chybí 1 ze 6). U hotové věty
   s klíčem a náušnicí drželo pořadí ze zadání.
3. „Bright night“ převzal 3 ze 6; jinde ho vypustil.
4. Volbu „sitting or standing“ rozhodl 3 ze 3 stejně: sedí. Bez volby polohu člověka nezmínil ani jednou.
5. Volné místo „one more thing that turns up“ nevyplnil ani jednou (0 ze 3). V jednom čtení z něj udělal závěrečnou otázku
   („What else might come into view as you sit here?“).
6. Nejdelší doslova převzatý úsek: „a glove you did not know you had lost“ (8 slov) ve 2 ze 6; jinde přeformulováno („your missing glove“,
   „though you had not noticed it missing“).

## Co z toho plyne a co ne
1. Ze slov model scénu složí a poskládá si ji po svém; co je ve slovech řečeno celou frází, opisuje dál.
2. Otevřené pokyny uvnitř obrazu („ještě jedna věc“) nevymyslí — bez přemýšlení vyplní jen to, co má pojmenované. Volbu ze dvou udělá.
3. Netvrdí se: že jsou čtení ze slov lepší než z věty (posuzuje owner) · cokoli o jiných runách a o islandštině · n = 3 na rameno,
   bez druhé trojice na odhad šumu. Srovnání s hotovou větou je jen přes zkoušku s telefonem (jiný obraz), ne přes tutéž scénu větou.

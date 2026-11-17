# Zkouška: Kenaz s telefonem a bez něj (CODE-read, 2026-11-17)

Owner: „z jakého důvodu je důležité mít zde the phone místo jen light finds. ten podnět telefon mi přijde zbytečný, ale udělej test na
čtení s a bez telefonu a uvidíme, jak to model udělá.“

## Co se zkoušelo
1. Produkční prompt single pro Kenaz (`sloz_telefon.js` → buildery v2), bez oblasti a otázky; obraz z banky nahrazen větou z `ulohy.json`.
2. Dvě ramena, tři seedy (úhly otevření 6, 5, 1). Ramena se stejným seedem se liší **jen obrazem** (ověřeno skriptem).
   - s telefonem: *The phone light finds the dropped key, and beside it a long-lost earring.*
   - bez telefonu: *The light finds the dropped key, and beside it a long-lost earring.*
3. Model produkce (gpt-6-sol, bez přemýšlení), 6 volání. Texty: `ulohy_vysledky.json`.

## Výsledek
1. S telefonem: „phone light“ je ve čtení 3 ze 3. Scéna je dnešní byt (pohovka a koberec · spáry dlažby · zrnko písku).
2. Bez telefonu: model si zdroj světla doplnil 3 ze 3, a pokaždé stejně — **oheň** („by the hearth as firelight reaches beneath the bench“ ·
   „at the edge of the firelight“ · „catches the firelight“). Bere ho z významu runy (Kenaz = oheň, pochodeň), ne ze života čtenáře.
3. Klíč i náušnice zůstaly v obou ramenech 6 ze 6; scéna se bez telefonu neztratila, jen se přestěhovala od dnešního bytu ke krbu.
4. Vlastní detail („one detail the sentence does not name“) přidal model v obou ramenech (zapínání náušnice, zuby klíče, prach).

## Co z toho plyne a co ne
1. Slovo „phone“ není v obraze kvůli světlu, ale kvůli **době**: je to jediné slovo, které scénu drží v dnešku. Bez něj prázdné místo
   zaplní runa sama a čtení sklouzne ke krbu.
2. Netvrdí se: že to platí u jiných run (u Kenaz je oheň po ruce; jinde může model doplnit něco jiného) · že je čtení s telefonem lepší
   (to posuzuje owner) · n = 3 na rameno, jedna runa, jen EN.
3. Nezkoušeno: jiný dnešní zdroj světla místo telefonu (lampa v předsíni, světlo z lednice).

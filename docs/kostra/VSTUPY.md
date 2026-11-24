# Jak model pracuje se vstupy (GENEROVANÉ `node scripts/kostra_vstupy.js --zapis`, needitovat)

Čtení jedné runy ze solu, EN: **53**. Slovo = kmen plnovýznamového slova. „Převzal“ = aspoň jedno slovo vstupu ve větě; „doslova“ = úsek ≥ 3 slov. Shoda neříká příčinu (§25); vstupy podle dnešních builderů. Kostra: `docs/kostra/KOSTRA.md` (vstupy V1–V12).

## 1. Každý vstup: jak často ho model převezme a do které věty

| vstup | čtení s ním | převzal | věta 1 | věta 2 | věta 3 | věta 4+ | doslova ≥ 3 slova |
|---|---|---|---|---|---|---|---|
| obraz | 53 | 100 % | 100 % | 43 % | 36 % | 25 % | 66 % |
| slovo významu | 53 | 74 % | 8 % | 36 % | 30 % | 8 % | 0 % |
| úhel | 53 | 74 % | 49 % | 25 % | 19 % | 19 % | 15 % |
| podoba oblasti | 23 | 96 % | 17 % | 13 % | 35 % | 78 % | 17 % |
| tvar konce | 53 | 94 % | 38 % | 25 % | 43 % | 77 % | 19 % |
| otázka runy | 41 | 93 % | 17 % | 37 % | 32 % | 78 % | 22 % |
| klíčová slova runy | 53 | 81 % | 23 % | 43 % | 43 % | 21 % | 0 % |

## 2. Co si model v obraze (věta 1) přidal sám — podle úhlu otevření

Slova věty 1, která nestojí v žádném vstupu čtení. Opakuje-li se slovo u téhož úhlu, je to zvyk úhlu (u úhlu [3] tak vznikl pant).

- **úhel [0]** (6 čtení) — „Open with one quick glance at the whole image, then let everything fal…“ · průměr vlastních slov ve větě 1: 7.0 · opakují se: see 5, only 5, moment 3, while 2, faint 2, reaches 2
- **úhel [1]** (6 čtení) — „Open on the smallest detail in the image, the part someone would walk …“ · průměr vlastních slov ve větě 1: 7.5 · opakují se: beneath 3, beside 2, thin 2, rests 2, while 2
- **úhel [2]** (15 čtení) — „Open with the motion already underway in the image. If nothing moves, …“ · průměr vlastních slov ve větě 1: 6.5 · opakují se: against 3, runs 3, ground 3, branches 3, beneath 3, hand 2, wall 2, white 2, thread 2, down 2, wind 2, torn 2, past 2, stones 2, red 2
- **úhel [3]** (7 čtení) — „Open with the one thing in the image that stays fixed while the rest g…“ · průměr vlastních slov ve větě 1: 5.4 · opakují se: hand 2, fence 2, post 2, loose 2, against 2
- **úhel [4]** (10 čtení) — „Open with the part of the image that is out of sight — under it, behin…“ · průměr vlastních slov ve větě 1: 7.2 · opakují se: beneath 6, cannot 5, see 4, beyond 3, grass 2, frost 2, still 2
- **úhel [5]** (5 čtení) — „Open at the edge of the image, where one thing turns into another.…“ · průměr vlastních slov ve větě 1: 6.8 · opakují se: reaches 2, still 2
- **úhel [6]** (4 čtení) — „Open by setting the seeker inside the image, at the spot where it is h…“ · průměr vlastních slov ve větě 1: 6.5

## 3. Obrazy, ke kterým model přidává nejvíc vlastního (kandidáti na past obraz × úhel)

| obraz (z banky) | čtení | úhly | vlastní slova ve větě 1 |
|---|---|---|---|
| The bulb readies itself underground long before it shows | 1 | 1 | 12.0: thin, white, root, presses, through, dry, skin, where, scarcely, notice, beneath, soil |
| The old tree in the churchyard has outlived everyone who planted it | 1 | 6 | 11.0: beside, roots, lift, edge, gravestone, branches, reach, over, worn, thin, rain |
| Out on the heath a twig snaps, and the whole party goes quiet to listen | 1 | 4 | 10.0: beyond, bend, something, stays, when, falls, boots, still, wet, grass |
| The lid is still on the pot, but the smell says something is taking shape | 2 | 0 | 9.0: see, kitchen, moment, only, beaded, water, while, faint, rises, beneath, stove, place |
| The midnight sun never quite sets around Midsummer | 1 | 1 | 9.0: thin, strip, light, rests, beneath, door, though, barely, dipped |
| When the scree starts to slide the root takes the strain and the ground above it goes nowh | 2 | 4, 5 | 8.0: beneath, holds, fast, loose, stones, begin, shift, grit, pressed, bark, meets, firm |
| At the meeting you stand up for the one who is not in the room | 1 | 4 | 8.0: closed, door, person, being, discussed, cannot, hear, name |
| In the low sun a whole trail of footprints comes to light across the field, for a moment,  | 1 | 4 | 8.0: beneath, grass, old, lie, until, catches, shallow, hollow |
| One voice starts the song and the room finds it line by line | 1 | 2 | 8.0: others, join, last, note, carries, past, empty, chair |
| The card lies face down and no one has turned it over | 1 | 3 | 8.0: corner, pressed, against, table, loose, edge, lifts, but |
| The reindeer lifts its head, on guard | 1 | 5 | 8.0: clearing, grass, gives, way, trees, ear, toward, sound |
| After the storm, only the tree with deep roots is still standing | 3 | 2, 4 | 7.7: wind, can, see, among, fallen, branches, torn, earth, beneath, ground, though, cannot |
| On the windowsill the seedlings stretch toward the light | 2 | 4, 5 | 7.5: beneath, soil, fine, roots, spread, where, cannot, see, bend, stems, still, thin |
| Four families have sat at the same table in the farmhouse, and the table has stayed where  | 1 | 1 | 7.0: shallow, groove, marks, chairs, rubbed, floor, beside |
| You wake, and dawn has already changed the light in the room | 1 | 5 | 7.0: reaches, chairs, around, family, table, lose, shadows |
| The ptarmigan turns white for the snow and brown again for the heath, on a clock older tha | 1 | 1 | 7.0: dark, feather, remains, ankle, while, rest, coat |
| The horse finds the ford across the glacial river though you cannot see it | 1 | 2 | 7.0: testing, stones, beneath, cloudy, water, before, crossing |
| The rowan by the farmhouse bends flat in the gust and rights itself the moment it drops | 2 | 2 | 7.0: red, berries, trembling, against, wall, almost, ground, rises, falls, away, still, branches |
| The turf wall takes the wind so the doorway stays calm | 1 | 0 | 7.0: see, house, under, wide, sky, only, remains |
| On the narrow path the one who walks with you shortens their stride to yours without a wor | 1 | 2 | 7.0: person, beside, loose, stones, stop, shifting, underfoot |

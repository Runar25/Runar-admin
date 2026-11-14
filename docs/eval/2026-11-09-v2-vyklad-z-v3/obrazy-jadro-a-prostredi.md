# Obrazy: které jdou vylepšit výměnou prostředí (CODE-read, 2026-11-14)

Lab, ne kánon. Owner 2026-11-14: *„líbilo by se mi, kdyby obraz byl upravován podle toho, jak je potřeba, a tím se řešila jak sezóna,
tak variabilita … snow heath může být třeba across sand beach … tím měnit klíčová slova“*; pak *„je potřeba projít obrazy a určit ty,
které by se dali tímhle způsobem vylepšit“*, *„samozřejmě že to budeme losovat my“*, *„to můžeš dělat tady, žádné volání sol“*.
Vlastní: průchod bankou `RUNE_IMAGES` (`v2/runar-character.js`, 190 obrazů) a seznam kandidátů. Návrhy prostředí jsou anglicky, **neprošly
branou identity a islandsky nejsou napsané** — to je další krok po ownerově výběru.

## 1. Co už v produkci je
1. Mechanismus existuje od 2026-09-19: řádek označený `jadro` nese jen jádro („a sheep-track winding of its own accord“) a místo mu
   losuje kód ze seznamu `IMG_PLACES`. Mají ho **2 obrazy ze 190**, oba Raidho; seznam míst je jeden (6 míst pastevecké krajiny).
2. Poučení z provozu: společný seznam míst pro víc obrazů nesedí. Mohyly dostaly „okraj domácí louky“ a owner to 2026-10-06 odmítl
   (*„říct, že je to trail nebo in the mountains“*) → místo napevno. **Seznam prostředí proto musí patřit ke každému obrazu zvlášť.**
3. Opačné poučení: obraz bez místa si model dokreslí pokaždé stejně. Mince u Tiwazu bez místa → pokaždé tentýž dřevěný pult
   (owner v reportu 2026-09-23) → místo doplněno (kiosk). Místo v obraze tedy pestrost opravdu řídí.

## 2. Podle čeho jsem třídil
- **Jde vyměnit**, když runu nese děj (jdeš a najdeš rytmus; vedeš koně a provaz visí volně) a prostředí je jen kulisa.
- **Nejde**, když prostředí runou samo je: led a sníh u Isy, krupobití a bouře u Hagalazu, slunce u Sowilo, voda u Laguz, roční doba
  u Jery, světlo u Dagazu, oheň a lampa u Kenazu. A když se obraz odehrává uvnitř domu u stolu — tam není co měnit.

## 3. Kandidáti A — výměna prostředí otevře obraz i druhé půlce roku
Dnes je obraz jen zimní (cold) nebo jen letní (bright); s druhým prostředím by platil celý rok.
| # | runa | obraz dnes | co zůstává (nese runu) | co se mění | návrhy prostředí |
|---|---|---|---|---|---|
| 1 | Raidho | On the long walk across the snowy heath you find your rhythm and stop counting the steps. (zima) | dlouhá chůze, rytmus, přestaneš počítat kroky | across the snowy heath | along the black sand beach · over the lava field · up the valley track |
| 2 | Raidho | From the pass you look back, and your tracks in the snow make one line down the valley. (zima) | ohlédnutí, stopy tvoří jednu linii | tracks in the snow | your tracks in the wet sand … along the shore · your trail through the dew … down the slope |
| 3 | Ehwaz | You lead the horse across the snow, and the rope between you hangs slack. (zima) | vedeš koně, provaz visí volně | across the snow | across the river flats · over the lava · along the shore |
| 4 | Ehwaz | Two haul a sled over the drifts, and it glides only once they pull together. (zima) | dva táhnou, jde to až společně | sled over the drifts | a boat up the shingle (… it moves only once …) |
| 5 | Ehwaz | Two waltz at the midwinter feast, and no one can tell anymore which of them leads. (zima) | dva tančí, nejde poznat, kdo vede | at the midwinter feast | at the round-up dance · at the midsummer dance |
| 6 | Gebo | A stranger helps push your car out of the drift and only waves as he leaves. (zima) | cizí pomůže a jen zamává | out of the drift | out of the mud · out of the soft sand · out of the ditch |
| 7 | Wunjo | In the hot pot under the frost, everyone laughs at the same story. (zima) | všichni se smějí téže historce | under the frost | under the midnight sun · in the rain |
| 8 | Wunjo | The children run barefoot onto the field the moment the grass is dry. (léto) | děti vyběhnou ven, jakmile to jde | barefoot onto the field … grass is dry | out into the yard the moment the first snow has settled |
| 9 | Sowilo | The sunshine on the snow is so bright that you narrow your eyes. (zima) | světlo tak ostré, že mhouříš oči | on the snow | on the sea · on the wet road |
| 10 | Blank | New snow lies over the track and no one has stepped in it yet. (zima) | hladká plocha bez jediné stopy | new snow over the track | the tide has smoothed the sand, and no one has stepped on it yet |
| 11 | Blank | Black sand stretches out to the horizon, and nowhere are any landmarks to be seen. (léto) | plocha bez orientačních bodů | black sand | snow · fog over the heath |
| 12 | Uruz | You drive the iron bar into the frozen ground with all your might, and it gives way. (zima) | celá síla těla, tvrdá zem povolí | frozen ground | the hard-packed gravel · the stony ground |
| 13 | Algiz | From the knoll you see the squall coming up the fjord long before it reaches the hayfield. (léto) | vidíš to přicházet dlouho předem | the hayfield | the farm · the boats |

Kde to nejvíc pomůže (počty obrazů v bance, zima / léto): Isa 7 / 3, Ehwaz 6 / 4, Raidho 5 / 4, Gebo 7 / 5, Sowilo 4 / 6, Blank 5 / 7,
Berkana 5 / 8, Ingwaz 4 / 4. U Isy výměna nepomůže (led je runa) — tam chybí nové letní obrazy, ne jiné prostředí.

## 4. Kandidáti B — obraz platí celý rok, výměna místa dá pestrost
| # | runa | obraz dnes | co se mění | návrhy |
|---|---|---|---|---|
| 14 | Tiwaz | At the kiosk the change comes back wrong in your favour, and you return the difference. | at the kiosk | at the bakery · at the petrol station · at the market stall |
| 15 | Thurisaz | A thorn tears your sleeve one step short of the gully's edge. | the gully's edge | the cliff edge · the riverbank |
| 16 | Ansuz | Someone calls your name across the crowd and every other sound drops away. | across the crowd | across the harbour · across the square |
| 17 | Ansuz | Across the yard the pitch of the call alone tells whether it is bad news or only supper. | across the yard | across the field · up from the shore |
| 18 | Perth | In the low sun a whole trail of footprints comes to light across the field, for a moment, … | across the field | across the sand · across the snow |
| 19 | Algiz | Out on the heath a twig snaps, and the whole party goes quiet to listen. | out on the heath | in the birch wood · on the lava |
| 20 | Uruz | You lean into the boulder in the home field, and it shifts. | in the home field | on the track · by the boathouse |
| 21 | Raidho | The track bends round the lava and comes back to its line on the other side. | round the lava | round the bog · round the boulder field |

## 5. Kandidáti C — obraz místo nemá, šlo by ho přidat losem
Uruz „You lift the end no one else could get under“, Kenaz „The torch lights only a few steps of the way ahead“, Nauthiz „In a hurry,
you pack only what you cannot do without“, Perth „The die still lies in the cup“. Podle zkušenosti s mincí (oddíl 1.3) si sem model
dokresluje stále totéž. Nenavrhuji hned: napřed ověřit v datech čtení, jestli se u nich scéna opravdu opakuje.

## 6. Co nejde a proč (zbytek banky)
Isa (led, sníh, mráz), Hagalaz (kroupy, bouře), Sowilo kromě č. 9, Laguz (voda je ten, kdo koná), Jera (roční doba je obsah),
Dagaz (svítání), Kenaz (oheň, lampa), Berkana a Ingwaz (jaro, zárodek — vázané na dobu), Fehu, Othila, Mannaz a většina domácích
scén (místo je dům a je součástí děje).

## 7. Jak by to vypadalo v datech (návrh, k rozhodnutí)
1. Obraz nese větu s místem pro prostředí a vlastní seznam prostředí; každé prostředí má sezónu (zima / léto / celý rok).
2. Losuje kód (stejný sáček proti opakování jako dnes u obrazů), model dostane hotovou větu. Nic se po modelu nechce.
3. **Islandsky je každé prostředí jiná vazba** (předložka, pád) — každá kombinace je hotová islandská věta, ověřená nástroji (§2).
4. **Každá kombinace znovu branou identity** (`docs/eval/2026-09-26-obrazy/brana_build.py`): „přes písek“ může obraz přenést k jiné
   runě (kůň u vody táhne k Laguz, loď na oblázcích k Fehu). Při krácení drželo 12 z 15.
5. Věrohodnost každé kombinace (ownerova otázka „jak moc se to někomu stane“).
6. Zápis do `v2/` dělá CODE-tune; sem patří jen seznam a doklady.

## 8. Hranice
Třídění je čtení okem jednoho čtenáře, ne měření. U žádného návrhu není brána, islandské znění ani ownerův souhlas s obrazem.

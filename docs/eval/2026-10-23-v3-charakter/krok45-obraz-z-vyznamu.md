# Krok 45 — obraz odvozený z významu runy: pozná se runa ze samotného obrazu? (CODE-read, 2026-11-04)

Intake / lab, ne kánon. Navazuje na [krok44-poloha-a-zkusenost.md](krok44-poloha-a-zkusenost.md).

## 1. Proč a co owner řekl (2026-11-04)
- Obraz Fehu z banky v2 (vlna za kávu a cukr) owner odmítl: *„naprosto nesourodé … jak moc se někomu stane, že vymění vlnu za cukr a kávu?“*
  → **obrazy v2 v labu V3 nepoužíváme**; obraz se odvozuje z významu runy.
- Pochválené obrazy (doklad principu): kvásek (Fehu), svíčka nad látanou ponožkou (Kenaz), kluk posune sušenku sestře, teplá voda
  teče, výpadek proudu v bouři, strom s hlubokými kořeny, mohyly Raidha (DECISIONS 2026-10-06 (3)).
- Owner k návrhu: stejný nebo podobný motiv u dvou run nevadí, když vysvětlí význam jinak — ale ať zní jinak (obrácený, posunutý).
  Věta 1 zůstává definice významu (obraz ji pak ukáže); znění definice se bude střídat jako ve v2.
- Islandská příroda: člověk ji zažít nemusí, je to lákadlo (zážitek „chci chvíli zůstat s tím obrazem“, RUNAR_DESIGN). Ownerův seznam
  motivů: gejzír, fjord, vodopád, tekoucí láva, chrlící sopka, horká voda plnící přírodní koupel, led, sněhová bouře, dlouhá zima,
  krátké léto, bílé noci, krátké dny se světlem, vodopád, jehož vodu vítr zvedne dřív, než dopadne.
- GPT (rozhovor ownera, 2026-11-04): víc významových oblastí na runu, ke každé víc obrazů; test zaměnitelnosti; soudce má poznat
  **mechanismus, ne symbol** (dar ≠ automaticky Gebo, cesta ≠ Raidho, zlato ≠ Fehu); poznatelnost ≠ kvalita obrazu (hodnotí owner).

## 2. Záměr, předpověď, pravidlo (zapsáno před během)
- **Záměr:** obstojí obraz psaný z mechanismu runy sám, bez jména runy a bez věty 1?
- **Pravidlo:** obraz projde, když ho **oba** slepí soudci dají na 1. místo správné runě. Jeden ze dvou = hraniční.
- **Předpověď:** kontroly (kvásek, mohyly) projdou; neprojdou kůň (→ Ehwaz), papuchalk (→ Othila/Berkana), soutok (→ Laguz),
  jabloň (→ Jera); celkem asi 10/18.

## 3. Metoda
- Runy Fehu, Gebo, Raidho; oblasti odvozené z `RUNAR_POPISY_RUN.md` a knihovny zkušeností (krok44-zdroj-gpt.md, oddíl 3).
  Sdílení z Fehu přesunuto ke Gebo (krok 44: 3/3 čteno jako Gebo).
- 16 nových obrazů (8 situačních, 8 islandských) + 2 kontroly (ownerem pochválené). Psal CODE-read.
- 2 slepí soudci (čerství agenti), každý jiné pořadí (seed 451/452); vidí jen obraz a 25 run s jednou větou jádra (z POPISY, Tiwaz/Ehwaz
  zkráceně); pokyn soudit mechanismus, ne symbol. Výstup: 1. a 2. volba, jistota, co rozhodlo.

## 4. Výsledek

| id | runa · oblast · druh | obraz | soudce A | soudce B | verdikt |
|---|---|---|---|---|---|
| KF | Fehu · kontrola | A sourdough starter in a jar lives because someone feeds it, and gives bread only when someone bakes; forgotten, it sours. | Fehu | Fehu | ✅ |
| KR | Raidho · kontrola | On the old route over the mountain heath, each cairn can be seen from the last. | Raidho | Raidho | ✅ |
| F3s | Fehu · co stojí, ztrácí sílu · situace | A coat kept for best was never worn; it still hangs with its tags on, and the moths found it first. | Fehu | Fehu | ✅ |
| F3n | Fehu · co stojí, ztrácí sílu · Island | A pool in the lava field, cut off from the spring that fed it, turns green and still and slowly sinks into the moss. | Fehu | Fehu | ✅ |
| G1s | Gebo · dar, který spojí · situace | Two neighbours who never spoke start nodding to each other after one of them cleared the snow from both doorsteps. | Gebo | Gebo | ✅ |
| G2s | Gebo · dar s dluhem · situace | A borrowed drill stands by the door for weeks, waiting until there is something good enough to return with it. | Gebo | Gebo | ✅ |
| G2n | Gebo · dar s dluhem · Island | A raven leaves bright pebbles on the step of the farm that feeds it, and stops coming the winter the scraps stop. | Gebo | Gebo | ✅ |
| R1s | Raidho · vidět až zpětně · situace | The first page of a textbook in a new language makes no sense until ten pages are behind you, and then the first one does. | Raidho | Raidho | ✅ |
| R2s | Raidho · vlastní tempo · situace | On a long hike the fast ones wait, cold, at every turn, while the slow one at the back never once has to stop. | Raidho | Raidho | ✅ |
| R3s | Raidho · směr neodpovídá · situace | Someone drives the old way to the job they left a year ago and notices only at the last junction. | Raidho | Othila | ◐ |
| R3n | Raidho · směr neodpovídá · Island | In a snowstorm on the heath, a walker follows fresh tracks for an hour before seeing they are their own. | Raidho | Hagalaz | ◐ |
| R2n | Raidho · vlastní tempo · Island | A horse crosses the black sand in its smooth running walk, the rider barely moving, the same four beats mile after mile. | Raidho | Ehwaz | ◐ |
| F1s | Fehu · příliv · situace | The apple tree in the garden gives so much in one week that bags of apples stand by the gate for anyone to take. | Jera | Jera | ❌ |
| F1n | Fehu · příliv · Island | Hot water rises in the stone basin of the spring until it brims over the edge and runs warm into the cold grass. | Ingwaz | Ingwaz | ❌ |
| F2n | Fehu · hodnota, když se hýbe · Island | Water from deep under the ground is piped through the greenhouse all winter, and bananas ripen under glass in the dark months. | Laguz | Berkana | ❌ |
| G1n | Gebo · dar, který spojí · Island | Where the warm river runs into the cold fjord, the water steams, and seabirds gather on the line where the two meet. | Eihwaz | Eihwaz | ❌ |
| G3s | Gebo · jen jedna strana dává · situace | In a group chat one person sends the photos, the birthday reminders and the plans, and the others answer with a thumbs-up. | Mannaz | Mannaz | ❌ |
| G3n | Gebo · jen jedna strana dává · Island | A puffin flies fish to the burrow all day; the chick inside grows fat and has not once come out to see the sea. | Ingwaz | Berkana | ❌ |

- Soudce A 12/18, soudce B 10/18 (předpověď ~10). Projde 7 nových + obě kontroly; 3 hraniční; 6 neprošlo.
- **Situace 5/8 projde, Island 2/8** (+ 2 hraniční). Islandský obraz nesený přírodní silou čte soudce jako runu přírody
  (Ingwaz, Berkana, Eihwaz, Hagalaz) — mechanismus runy musí v přírodním obraze nést děj, ne krajina.
- Neprošlé mají jasnou příčinu: hojnost najednou = sklizeň (Jera); přetékání = „nashromáždí se a pak se ukáže“ (Ingwaz); soutok = hranice
  dvou světů (Eihwaz); jednostranné dávání ve skupině = člověk mezi lidmi (Mannaz).

## 5. Hranice
- n = 18 obrazů, 2 soudci, oba Claude (stejný model jako autor) — ne lidé. Jedna věta jádra na runu je naše; obrazy, které opakují její
  slova („cut off from the spring“ ~ „what you leave standing“), mají výhodu lexikální shody — test zaměnitelnosti, ne kvality.
- Kontroly prošly u obou → nástroj něco vidí; nulová transformace (obraz bez děje) nedělána.
- Poznatelnost ≠ dobrý obraz: rozhoduje owner.

# Audit celé banky obrazů + délka obrazu (2026-09-23)

**Stav: NÁLEZY + NÁVRH POSTUPU, ke schválení ownerem.** KUKY 2026-09-23: *„prošel všechny obrazy run…
a zkontroloval stejně jako jsi to udělal teď… navrhni úpravy i podle toho popisu run."*
Banka má po dnešních změnách **115 obrazů** (ne 130+). Předchozí kolo návrhů:
`docs/archive/2026-09-22-navrhy-obrazy-a-navod.md` (nasazeno, `RUNAR_DECISIONS.md` 2026-09-23 (1)).

## 1. Délka obrazu — tvoje hypotéza padla, skutečná páka je úhel [0]

Hypotéza: *dlouhý obraz → Rúnar ho celý nacpe do první věty → první věta nabobtná.*
**Změřeno na 72 produkčních single čteních od 1. 9.:**
- délka obrazu × délka 1. věty: **r = 0,02** (poloviny dat −0,06 / +0,06 — žádný vztah, ne šum)
- krátké obrazy (≤ 13 slov): 1. věta **19,7** slov · dlouhé (> 13): **20,1** slov
- 1. věta je o třetinu delší než ostatní (≈ 20 vs 15), **ale ne kvůli obrazu**

**Co ji opravdu natahuje — úhel (EN, n = 70):**
| úhel | 1. věta |
|---|---|
| **[0] „Open with the whole image at once, then let everything fall away but one."** | **25,4** (n = 10) |
| [5] edge, where one thing turns into another | 21,1 |
| [3] the one thing that stays fixed | 19,9 |
| [6] seeker inside the image | 19,3 |
| [1] smallest detail | 18,7 |
| [2] motion underway | 17,8 |
| [4] what is out of sight | 17,0 |

Úhel [0] **doslova žádá celý obraz v první větě** — a model k „celému obrazu" dokresluje i okolí,
které v obrazu není. Dnešní *„the whole yard around it still grey"* (Berkana) byl úhel [0].
⚠️ n = 10 je málo na jistotu; směr je jasný. **Návrh:** přepsat [0] tak, aby celek dostal jen krátký
záběr, nebo ho vyměnit — a změřit 1. větu na ~12 čteních před a po.
**Závěr pro obrazy:** zkracovat je kvůli délce první věty **nemá smysl** (to měření vyvrací).
Obraz má být tak dlouhý, aby nesl **proč tahle runa** (brána níž) — ne kratší ani delší.

## 2. Identitní brána na všech 115 obrazech

Metoda jako včera: 3 slepí soudci, každý jen EN text + 25 run s klíčovými slovy, každý v jiném
pořadí, banka rozdělená na dvě dávky. **Prošel = zamýšlená runa první u ≥ 2 ze 3.**

**Výsledek: 96/115 prošlo · 19 neprošlo · 4 na hraně (2/3).**

**Stabilita brány (§27 — útok na nástroj):** 23 obrazů šlo branou už včera. **21 dalo stejný
verdikt, 2 se překlopily** — *pod ledem je slyšet potok* (Isa: včera 3/3 ×2, dnes 1/3, Laguz 2)
a *chléb* (Jera: včera 3/3, dnes 1/3, Fehu 2). Obě jsem nasadil 2026-09-23 (1). Brána u
hraničních obrazů kolísá podle společnosti v dávce → **2/3 = hraniční, ne čistý průchod.**

### Kolik obrazů prošlo po runách

| runa | obrazů | prošlo |
|---|---|---|
| Fehu | 3 | 1 ⚠️ |
| Uruz | 3 | 2 ⚠️ |
| Thurisaz | 3 | 3 |
| Ansuz | 11 | 8 |
| Raidho | 4 | 4 |
| Kenaz | 5 | 5 |
| Gebo | 4 | 2 ⚠️ |
| Wunjo | 5 | 4 |
| Hagalaz | 4 | 4 |
| Nauthiz | 8 | 5 |
| Isa | 5 | 4 |
| Jera | 10 | 8 |
| Eihwaz | 2 | 2 ⚠️ |
| Perth | 4 | 2 ⚠️ |
| Algiz | 3 | 3 |
| Sowilo | 7 | 7 |
| Tiwaz | 3 | 3 |
| Berkana | 6 | 6 |
| Ehwaz | 3 | 3 |
| Mannaz | 6 | 5 |
| Laguz | 3 | 3 |
| Ingwaz | 4 | 4 |
| Othila | 3 | 3 |
| Dagaz | 3 | 3 |
| Blank | 3 | 2 ⚠️ |

### Co neprošlo

| obraz (EN) | runa | soudci četli | top1 |
|---|---|---|---|
| The sheep drift into the fold toward evening, slow and without effort. | Fehu | Othila, Othila, Raidho | 0/3 |
| The berry-heath grows heavy with bilberries when August comes. | Fehu | Jera, Jera, Jera | 0/3 |
| The lava still remembers the fire, though the moss has settled over it. | Uruz | Kenaz, Othila, Kenaz | 0/3 |
| The kettle changes its note just before it boils, and you hear it without looking. | Ansuz | Laguz, Laguz | 1/3 |
| Frost forms on the pane from the sleeper's breath and thaws a clear patch with each exhale. | Ansuz | Isa, Isa, Isa | 0/3 |
| You come up the last of the slope and stop, and your breath comes back slower than you expected. | Ansuz | Mannaz, Uruz, Uruz | 0/3 |
| The sea gives and takes on the shore in the same breath. | Gebo | Laguz, Laguz, Laguz | 0/3 |
| The shore returns one thing and keeps another with every wave. | Gebo | Laguz, Laguz | 1/3 |
| You come in out of the cold and someone has lit the stove. | Wunjo | Kenaz, Gebo | 1/3 |
| The spring cold-snap makes the lamb press close for warmth. | Nauthiz | Berkana, Algiz, Berkana | 0/3 |
| The root forces its way through the stones down to the water. | Nauthiz | Eihwaz, Eihwaz | 1/3 |
| The plant on the sill turns itself flat to the glass, toward the one hour of light it gets. | Nauthiz | Sowilo, Sowilo | 1/3 |
| The dough lifts the cloth a little higher each hour, working while no one watches. | Jera | Ingwaz, Ingwaz, Ingwaz | 0/3 |
| The bread comes hot from the oven, enough for everyone at the table. | Jera | Fehu, Fehu | 1/3 |
| The river rolls the pebble until it stops — you cannot see where. | Perth | Laguz, Laguz | 1/3 |
| The lagoon water clears for a moment and something below stirs, then closes over again. | Perth | Laguz, Laguz, Laguz | 0/3 |
| The reflection in the still lagoon trembles at the least breath of wind. | Mannaz | Laguz, Laguz, Laguz | 0/3 |
| The line runs down into dark water and nothing has touched it yet. | Blank | Perth, Perth, Perth | 0/3 |
| Under the ice the stream can still be heard. | Isa | Laguz, Laguz | 1/3 |

### Vzory (proč to neprošlo)
1. **Voda táhne k Laguz — 7 z 19.** Moře u Gebo, laguna u Perth i Mannaz, kamínek v řece,
   potok pod ledem, konvice. Voda je pozemek Laguz; kde je voda nosná, obraz se přestěhuje.
2. **Fehu je nejslabší runa banky — prošel 1 obraz ze 3.** Ovce do ohrady čtou jako Othila
   (domov), borůvky jako Jera 3/3 (úroda). Prošlo jen *stádo z hor*, dnes nasazené.
3. **Rostliny, těsto a mláďata táhnou k Berkana / Ingwaz / Sowilo** (Nauthiz jehně → Berkana,
   Nauthiz rostlina u okna → Sowilo, Jera těsto → Ingwaz 3/3).
4. **Oheň a teplo táhnou ke Kenaz** (Uruz *láva si pamatuje oheň* → Kenaz, Wunjo *někdo zatopil
   v kamnech* → Kenaz/Gebo).

### ⚠️ Brána není všechno
Dva obrazy, které neprošly, daly **čtení, která jsi včera pochválil**: Nauthiz *rostlina na parapetu*
(„you are the plant") a Prázdná runa *vlasec do tmavé vody* („dobré čtení"). Esenční řádek runu ve
čtení ukotví. Brána měří, jestli obraz runu nese **sám**; čtení má ještě jméno a esenci. Tyhle dva
proto navrhuju **nechat**.

## 3. Můj vlastní průchod (mimo bránu)
- **Nerovnoměrnost:** Ansuz 11, Jera 10, Nauthiz 8 — ale Eihwaz 2 a jedenáct run po 3. Při
  „čím víc obrazů, tím víc variant" se tenké runy opakují nejvíc.
- **Mírné studené čtení:** Nauthiz *„utratíš peníze, které sis odkládal"*, *„spánek tě zmůže uprostřed
  věty"*, Ansuz *„dech se vrací pomaleji, než jsi čekal"*, Othila *„statek drží teplo ve vzpomínce"*
  (vzpomínka bez vlastníka), Uruz *„láva si pamatuje oheň"* (taktéž).
- **Dlouhé s abstraktním ocasem:** Jera pole (25 slov, *„jako loni a jako bude příště"*), Perth stopy
  (26), Jera bělokur *„podle hodin starších než počítání"*.

## 4. Navržený postup (čeká na tvé ano)
1. **Přestěhovat**, co soudci čtou jednomyslně jinde (3/3) — obraz se neztratí, jen dostane správnou
   runu: Fehu borůvky → Jera · Ansuz jinovatka z dechu → Isa · Gebo moře → Laguz · Jera těsto → Ingwaz ·
   Perth laguna → Laguz · Mannaz laguna → Laguz. (Laguz 3 → 6.)
2. **Nechat** pochválené, i když branou neprošly (Nauthiz rostlina, Blank vlasec).
3. **Napsat nové** ze statického popisu run pro runy, které zeslábnou nebo jsou tenké: Fehu, Uruz,
   Gebo, Perth, Eihwaz (+ náhrady za Isa pod ledem, Wunjo kamna). IS nativně, korpus, gramatika, brána.
4. **Úhel [0]** přepsat a změřit (sekce 1).

## 5. Nové obrazy ze statického popisu run — brána prošla 10 z 11

IS nativně (korpus + is-grammar-qa; W001 u *teningur, fata, trog, barmur* = vzácná slova, BÍN je
potvrdil). Brána: 3 slepí soudci, 4 kontrolní obrazy z minulých kol daly zase 3/3.
Vyhýbal jsem se vodě, ohni, rostlinám a domovu — to jsou čtyři tahy, kvůli kterým neprošlo 19 obrazů.

| runa | IS | EN | brána | proč z popisu |
|---|---|---|---|---|
| Fehu | Ullin er lögð inn og fyrir hana kemur kaffi og sykur. | The wool is traded in, and coffee and sugar come back for it. | 3/3 | *„hodnota, když se může pohybovat"* |
| Fehu | Mjólkin flóir yfir barminn á fötunni. | The milk spills over the brim of the pail. | 3/3 | *„voda do nádoby… přeteče"* — mléko, ne voda (voda = Laguz) |
| Uruz | Nautið rífur sig upp úr mýrinni og heldur áfram. | The bull tears itself up out of the bog and keeps going. | 3/3 | *„nezastavuje se proto, že cesta není pohodlná"* |
| Gebo | Ókunnugur hjálpar þér að ýta bílnum úr skaflinum og veifar bara þegar hann fer. | A stranger helps push your car out of the drift and only waves as he leaves. | 3/3 | *„dar bez jistoty, že se vrátí… žádné účetnictví"* |
| Gebo | Tveir bera sama trogið, hvor á sínum enda. | Two carry the same trough, each at their own end. | 2/3 (Ehwaz) | *„dvě síly… prostor, který patří oběma"* |
| Perth | Teningurinn liggur enn í bikarnum og enginn hefur kastað. | The die still lies in the cup and no one has thrown. | 3/3 | *„ještě nevím"* — a kostka v kalíšku je tradiční obraz Perth |
| Perth | Spilið liggur á grúfu og enginn hefur snúið því við. | The card lies face down and no one has turned it over. | 2/3 (Blank) | *„nádobu nerozbíjej"* |
| Eihwaz | Einirinn er grænn undir snjónum allan veturinn. | The juniper stays green under the snow all winter. | 3/3 | *„roste pomalu, přežije dlouho"* — jalovec je islandský stálezelený |
| Eihwaz | Tréð stendur með ræturnar í myrkrinu og krónuna í birtunni. | The tree stands with its roots in the dark and its crown in the light. | 3/3 | *„stojí mezi dvěma světy"* |
| Wunjo | Þú sest hjá þeim og enginn spyr hvers vegna þú komst. | You sit down with them and no one asks why you came. | 3/3 | *„nemusíš nic dokazovat"* — místo kamen (Kenaz) |
| ~~Uruz~~ | ~~Báturinn situr fastur þar til þú ýtir á…~~ | ~~The boat sits stuck until you push…~~ | ❌ Nauthiz | vyřazeno |

## 6. Celý návrh v jednom (co by se změnilo)

- **Přestěhovat** (soudci jednomyslně jinde): Fehu borůvky → Jera · Ansuz jinovatka z dechu → Isa ·
  Gebo moře → Laguz · Jera těsto → Ingwaz · Perth laguna → Laguz · Mannaz laguna → Laguz.
- **Vyřadit** (neprošly a mají náhradu): Fehu ovce do ohrady · Uruz láva · Gebo břeh · Perth kamínek ·
  Wunjo kamna · Ansuz konvice · Ansuz dech „než jsi čekal".
- **Přidat** 10 obrazů ze sekce 5.
- **Nechat** navzdory bráně: Nauthiz rostlina, Blank vlasec (pochválená čtení), Nauthiz jehně/kořen
  (Nauthiz má dost jiných — rozhodni).
- **Hraniční z minulého nasazení:** Isa *pod ledem* (souhrnně 7/9 Isa) — nechat · chléb v Jera
  (souhrnně 4/6, zbytek Fehu) — nechat, nebo vyřadit.

Výsledek: nejtenčí runy **Fehu 1 → 3 · Eihwaz 2 → 4 · Perth 2 → 4 · Gebo 2 → 4 · Laguz 3 → 6**;
žádná runa pod 3 obrazy, které branou prošly.

# Rúnar V4 — podklad ke konzultaci pro Gemini (2026-11-26)

Ahoj Gemini. Píše Claude, který v projektu Rúnar vede laboratoř nové verze výkladu (**V4**). V4 vychází z tvého rozhovoru s ownerem
(„Architektura runového výkladu Kenaz“: sféry runy, pevná kotva, emoce, dveře Asku). Níž je přesně to, jak jsme V4 zatím zapsali, co nám
v tvém návrhu nesedí, co v něm chybí, a otázky. **Prosím o kritiku a odpovědi, ne o nový celý návrh.** Formát odpovědi je na konci.

---

## 1. Z čeho V4 vychází: Rúnar dnes (verze v2, v provozu)
1. **Co Rúnar je:** AI průvodce runami pro islandskou značku Agndofa. Primární jazyk **islandština**, vedlejší angličtina. Islandština se
   píše islandsky od začátku, nikdy jako překlad z angličtiny, a ověřuje se nástroji (gramatický parser, korpus vazeb). Rúnar je strážce
   run, ne věštec: nepředpovídá, zrcadlí. Domov a zdroj obrazů je islandská příroda.
2. **Runy:** 25 = Elder Futhark (24) + prázdná runa **Blank**. Jména run v kódu: Fehu, Uruz, Thurisaz, Ansuz, Raidho, Kenaz, Gebo, Wunjo,
   Hagalaz, Nauthiz, Isa, Jera, Eihwaz, **Perth**, Algiz, Sowilo, Tiwaz, **Berkana**, Ehwaz, Mannaz, Laguz, Ingwaz, Dagaz, **Othila**, Blank.
   **Těžké runy** (nikdy útěcha): Hagalaz, Nauthiz, Isa, Thurisaz, Perth, Tiwaz.
3. **Jak dnes vzniká single čtení:** model napíše pokaždé celé čtení (~4 věty) z losů a vstupů:
   - věta 1 **obraz**: jedna krátká scéna z banky ~190 obrazů (kolem 12 slov, jeden děj) + losovaný úhel otevření,
   - věta 2 **význam**: co obraz ukazuje o runě, tak aby to neplatilo o jiné runě,
   - věta 3 **dopad**: přenese význam tam, kde člověk stojí (zvolená oblast života) — vždy jako možnost („may“), nikdy tvrzení,
   - věta 4 **otevření**: tvar konce podle toho, co člověk hledá (věta / dvě možnosti / otázka / napětí), jinak los,
   - ✦ jedna myšlenka na cestu (do 12 slov).
4. **Vstupy dnes:** AREA OF LIFE (kam čtení dosedne), WHAT ARE YOU SEEKING (tvar konce), THIS READING IS FOR (čas), jméno; volná otázka
   jen pro admina. Rúnar **mluví k člověku** („you stand…“), ale nikdy netvrdí nic o jeho životě a neradí.
5. **Jádro pravidel v2:** zrcadlo, ne orákulum · bez tvrzení o člověku · bez rady · jedna scéna, dnes představitelná · těžká runa nikdy
   útěchu · věcný klidný hlas bez klišé · islandština islandsky.
6. **Ask:** doplňující otázka ke čtení — Standard 1, Premium 2 na čtení. Dnes má dva tipy ke konci čtení.
7. **Runa dne:** text z předem napsané a zkontrolované knihovny (ne model pro každého); varianty se člověku neopakují.
8. **Spready:** pět výkladů, mezi nimi **Norny** (3 runy): Urður = co tě utvořilo · Verðandi = co se právě tká (kde stojíš) · Skuld = kam
   se kloníš (směr, ne osud).
9. **Co jsme se naučili měřením (platí i pro V4, pokud píše model):** model opíše hotovou vzorovou větu z promptu; slovo, které promptu
   zakážeš, často sám vysloví; každý přidaný povinný požadavek se v textu projeví jako formule ve stejném místě; bez losů model sedne
   na jednu scénu a šablonu.

---

## 2. Jak jsme V4 zapsali

### 2.1 Rozhodnutí ownera (platí)
1. V4 je **nový pohled na výklad**, ne další verze promptu v2: pevný obraz pro runu a sféru, model jen zasahuje.
2. **Obrazy budou úplně nové.** Začneme jedním obrazem pro každou runu; tvoje ukázky jsou výchozí bod, ne hotová věc.
3. **Rozmanitost je nutná** — čtení téže runy nesmí být stejná.
4. **Sfér bude tolik, kolik runa dovolí** — někde víc, někde míň (ne pevně 4).
5. **Rúnar zůstává**; uvidíme, jestli se bude muset proměnit.
6. Režimy obrazu: **Land** (islandská příroda) a **Craft** (práce rukou a tradiční materiál: výheň, dřevo, vlna, nůž, loď, provaz).
   **Current** (město, technologie) zatím ne.
7. Nejdřív **single**; ze spreadů **Norny**.
8. Na vstupu budou **emoce** (mřížka nebo seznam, je jedno).
9. Ovládne to každý, „i dítě“; u stejné runy je vidět, kterou sféru už člověk otevřel.

### 2.2 Tok čtení
emoce (volitelná) → tah runy → volba sféry (nebo „Let the rune choose“) → obraz sféry → Ask (dveře, čipy, volná otázka) → uložit (paměť sfér, deník)

### 2.3 Jádro V4
| id | zásada | odkud |
|---|---|---|
| 4J1 | zrcadlo, ne orákulum | v2 |
| 4J2 | bez tvrzení o člověku | v2 |
| 4J3 | bez rady a rozkazu (ani should, must, need to, try to) | v2 + ty |
| 4J4 | každý text nese hmotný obraz runy — i odpověď v Asku | ty |
| 4J5 | těžká runa nikdy útěchu | v2 |
| 4J6 | Rúnar zůstává: věcný, klidný, bez klišé | v2, owner |
| 4J7 | islandština islandsky od začátku, ověřená nástroji | v2 |
| 4J8 | runa se nevysvětluje slovníkem; člověk se v obrazu pozná sám | ty (projekce) |
| 4J9 | žádný terapeutický slovník | ty |
| 4J10 | nikdy všechno naráz: co člověk neotevřel, zůstává vidět jako možnost | owner |

### 2.4 Části
| id | část | práce |
|---|---|---|
| 4K0 | sféry runy | čočky, kterými jde runu číst; tolik, kolik runa dovolí |
| 4K1 | obraz sféry | hmotný obraz, ve kterém je síla runy vidět |
| 4K2 | mechanika | zákon runy v té sféře — platí stejně, ať se člověk cítí jakkoli |
| 4K3 | třecí bod | kde síla runy tlačí nebo co stojí; sem dosedne emoce |
| 4K4 | dozvuk | nechá ticho; ne otázka |
| 4K5 | dveře Asku | 2 otázky ke sféře (princip · stín) + čipy (práce · druhý člověk · uvnitř · životní runa) + volná otázka s nápovědou podle runy |
| 4K6 | odraz | odpověď v Asku: fyzika runy přeložená do materiálu člověka; ukáže, kde hledat (ven × dovnitř) |

Pořadí 4K1–4K4 je tvůj návrh čtyř vět. Owner chce pestřejší stavbu, takže pevné čtyři věty jsou otevřená otázka.

### 2.5 Vstupy
emoce · runa · sféra (člověk, nebo kontrast k emoci) · minulé sféry té runy · otázka/čip v Asku · životní runa (jen v Asku) · režim obrazu
(Land / Craft) · jméno, jazyk, rod oslovení (islandština). **Ve V4 nejsou** oblast, hledání, čas, losovaný úhel, banka obrazů v2.

### 2.6 Jak poznáme, že to funguje (měření)
1. Z textu bez jména runy pozná slepý soudce runu (nezaměnitelnost).
2. Žádné tvrzení o člověku, žádná rada (dva soudci, vada jen při shodě).
3. Z textu jde poznat sféra — sféry téže runy se neslévají.
4. Emoce je v obraze cítit, ale nepojmenovaná.
5. Dva texty téže runy a sféry se neopakují.
6. Islandština projde parserem a korpusem.

### 2.7 Emoce — naše sada, tvoje a náš návrh
- **Naše (dřívější pokus):** *What feels closest to you right now?* — Uncertainty · Pressure · Conflict · Loss · Frustration · Hope · Relief ·
  Something is changing · I don't know. Pocit vybere stránku runy, význam nemění. Zkouška na 4 čteních: kontrast (pocit vybere přehlíženou
  stránku) obrátil pohled, zrcadlení jen opakovalo tlak.
- **Tvoje:** v rozhovoru jmenuješ jen 4 z 9 — Restless, Foggy, Heavy, Burning.
- **Náš návrh (k tvé kritice):** emoce = počasí obrazu, ne téma. Každá volba má jednu fyzikální vlastnost:

| řada | volba | hmota v obraze |
|---|---|---|
| tíží | Heavy | váha, pomalost |
| | Hollow | prázdný prostor, ozvěna, chybějící kus |
| | Foggy | mlha, rozmazaný obrys |
| napíná | Tense | tlak, napnutá struna |
| | Restless | pohyb bez směru, chvění |
| | Burning | žár, přepálení |
| otvírá | Shifting | půda v pohybu, tání |
| | Hopeful | první světlo, klíček |
| | Light | povolený tah, výdech |

Mimo devítku: „Skip“. Conflict je situace s druhým člověkem, proto patří do Asku jako čip. Owner kdysi jako příklad uvedl i „tired, lonely“.

### 2.8 Runa dne
Varianty = sféra × režim (Land, Craft); jedna kratší věta; bez volání modelu; neopakuje se. Tvůj návrh Kenaz Land:
- Insight & Clarity — *A fresh crack in the black lava crust reveals the bright orange glow that has been moving underneath all along.*
- Craft & Shaping — *Where glacial meltwater meets a hot lava flow, steam rises and raw stone is quenched into jagged obsidian.*
- Drive & Friction — *Deep beneath a quiet moss field, water heated by the earth builds pressure until the geyser breaks the surface.*
- Fever & Exposure — *Sulfur steam rising from a bare hillside warms the cold air, yet burns the hand that reaches too close to the vent.*

---

## 3. Co nám v tvém návrhu nesedí
1. **Třetí osoba bez „you“.** Rúnar v2 mluví k člověku záměrně a změřeně: věta 3 přenáší význam k němu jako možnost. Když člověk z textu
   zmizí, co nahradí ten most? Sám jsi v Asku „you“ pustil zpátky — proč by obraz měl být jiný?
2. **Puštění oblasti a hledání.** Ve v2 na nich stojí, kam čtení dosedne a jakým tvarem skončí. Ve V4 to přesouváš do Asku, ale Ask má
   Standard jen jednou. Člověk bez Asku tak dostane čtení, které se ho nijak nedotkne?
3. **Pevné 4 věty a pevná kotva = šablona.** Povinný tvar se u nás dřív měřil jako strojový podpis. Stejná runa + sféra dá stejný text;
   po čtyřech tazích téže runy se texty začnou vracet. Owner chce pestrost.
4. **Tik „X does not Y; it simply Z“** — ve všech třech ukázkách Kenaz Insight. Ve stovkách variant to bude podpis modelu.
5. **Kenaz je pořád světlo a oheň** (žhnoucí láva, pochodeň, výheň). Owner světlo a oheň u Kenaz všude odmítl jako jedinou polohu.
6. **Překryv sfér s jinými runami** (neověřeno, jen čtení):
   - Drive & Friction (tlak, tření) × Uruz / Nauthiz,
   - Fever & Exposure × Hagalaz / Nauthiz,
   - obsidián (oheň potká led) × Hagalaz / Isa,
   - gejzír (skryté pod povrchem vyrazí) × Perth.
7. **Fakta bez zdroje:** Kenaz jako horečka nebo vřed (sféra Fever & Exposure); Blank jako „Wyrd / Odin“; rozdělení run ven × dovnitř;
   „tři ověřené psychologické principy“; účinky jako „návykové“ nebo „10× přirozenější“. Ve V4 je nepoužijeme, dokud nemají zdroj.
8. **Pevně 4 sféry.** Naše data mají 2–5 stránek na runu (Algiz 2, Ansuz 5). Owner chce sféry podle runy, ne podle šablony.
9. **Emoce jen těžké.** Tvoje 4 stavy jsou všechny napjaté nebo tíživé. Člověk nechodí jen v nouzi; čtení by pak četlo jen potíže.
10. **Kontrast jen pro „Let the rune choose“.** U nás kontrast obrátil pohled silněji než zrcadlení. Proč ho nepoužít i u zvolené sféry?
11. **Islandština.** Všechny ukázky jsou anglicky. Úprava vět 1 a 3 modelem podle emoce vrací do pevného, zkontrolovaného textu neověřenou
    islandštinu — přesně to, co pevná knihovna měla odstranit.
12. **Craft se mezi PDF a runou dne změnil** (ocel a beton → výheň, dřevo, vlna). Platí teď ten druhý; v PDF příklady ještě nesou ten první.

## 4. Co v návrhu chybí
1. **Rozmanitost:** jak udělat, aby se čtení téže runy a sféry neopakovalo — co variovat (scéna, místo, sloveso, pořadí vět, délka), kolik
   variant na sféru, a jak to udělat, aby z toho nevznikla nová šablona.
2. **Norny ve V4:** tvoje pozice „Situace / Tření / Směr“ nejsou naše Norny (co tě utvořilo / kde stojíš / kam se kloníš). Jak se sféry
   a emoce potkají ve třech runách naráz, když u spreadu sféru nevybírá člověk?
3. **Těžké runy a světlé emoce:** Hagalaz + Hopeful nesmí dát útěchu; světlá emoce nesmí stínovou sféru udělat radostnou.
4. **Krize:** Hollow / lonely je blízko krizi (Rúnar má pravidlo s číslem 112). Jak má obraz zacházet s člověkem, který přišel prázdný?
5. **Pojmenovat emoci, nebo ne:** náš dřívější pokus ji pojmenoval ve 4/4 čteních, ty ji zakazuješ. Co tím člověk získá nebo ztratí?
6. **Po 4/4 sférách:** co dostane člověk, který má runu celou otevřenou a táhne ji znovu?
7. **Blank:** bez sfér; co dělá „Let the rune choose“, emoce a Ask u Blanku?
8. **Životní runa:** jen v Asku, nebo i ve čtení? Jak ji vysvětlit nováčkovi jednou větou?
9. **Jména sfér v islandštině a v UI:** jak je pojmenovat, aby je pochopil každý na první pohled (a „i dítě“).
10. **Jak sféru ověřit:** sféra, která rozšiřuje význam runy (např. Fever & Exposure), potřebuje zdroj; jak poznat, že sféra patří té runě
    a žádné jiné?

## 5. Otázky
1. Proč třetí osoba v obrazu, když v Asku „you“ pouštíš? Co konkrétně by „you“ v obrazu zkazilo?
2. Co ve V4 nahradí most k člověku (oblast + tvar konce) pro toho, kdo Ask nepoužije?
3. Jak zajistit rozmanitost bez pevné kotvy, která se opakuje, a bez šablony 4 vět?
4. Jaké jsou tvých zbylých 5 emocí z devíti? Co říkáš na naši devítku (tíží / napíná / otvírá)?
5. Má se emoce ve čtení pojmenovat? Proč ano / ne?
6. Na jakém zdroji stojí Kenaz jako horečka/vřed a Blank jako „Wyrd / Odin“?
7. Jak by vypadaly sféry pro těžkou runu (např. Nauthiz nebo Hagalaz), aby se nepřekrývaly s Kenaz Drive & Friction a Fever & Exposure?
8. Jak má fungovat V4 v Nornách?
9. Jak napsat sféry a obrazy islandsky od začátku (ne překladem) a zároveň je udržet stejné v obou jazycích?
10. Kde vidíš v našem zápisu (oddíl 2) chybu nebo rozpor?

## 6. Formát odpovědi (prosím)
- Odpovídej **česky**, body i otázky **číslované** podle oddílů 3, 4 a 5 (např. „3.4: …“, „5.2: …“).
- U každého tvrzení o runách, přírodě nebo psychologii uveď **zdroj**, nebo napiš „bez zdroje“.
- Ukázkové věty piš **anglicky i islandsky**; u islandštiny napiš, jak jistý si jsi.
- Když nesouhlasíš s rozhodnutím ownera (oddíl 2.1), řekni to výslovně a zdůvodni — ale nenavrhuj celý systém znovu.

# Gemini — odpověď 1 na podklad pro-gemini-1.md (vložil owner 2026-11-26, doslova)

Zdroj: rozhovor ownera s Gemini, text vložený do session Rúnar V4 bez úprav. Je to **tvrzení jiného modelu, ne zdroj** (§23); rozbor a ověření
→ [odpoved-1-rozbor.md](odpoved-1-rozbor.md).

---

Ahoj Claude. Díky za precizní shrnutí stavu laboratoře V4 a zátěžovou oponenturu. Přecházím rovnou k číslovaným odpovědím podle zadání v oddílu 6, bez opakování celého návrhu.

## Oddíl 3: Reakce na body, které vám nesedí

3.1: Třetí osoba bez „you“ Třetí osoba v základním obraze a druhá osoba v Asku nejsou rozpor, ale dva odlišné nástroje (viz detailně v 5.1). Ve v2 jste most k člověku stavěli uměle ve větě 3 pomocí modálních sloves (may) a předem zadané oblasti života (Area of Life). Ve V4 tento most nahrazuje aktivní volba sféry uživatelem. Když si člověk po vylosování runy sám klikne na konkrétní sféru, mentálně si svůj kontext do obrazu již dosadil sám — nemusíš ho do toho textu násilně vpisovat zájmenem you (zdroj: vlastní návrh architektury, psychologický pojem projekce je v tomto textu použit jako designová analogie, nikoli jako klinický důkaz — bez zdroje).

3.2: Puštění oblasti a hledání (člověk bez Asku) Člověk bez Asku nedostane neosobní výkřik do tmy, pokud si sám vybere sféru. Zvolená sféra je tím místem, kam čtení dosedne (např. volba Craft & Shaping vs. Insight & Clarity u Kenaz). Pokud nepoužije Ask, odchází s přesným obrazem té oblasti, kterou si sám zvolil jako relevantní. Ztrácí tím jen personalizovaný překlad do konkrétní situace v Asku, což je legitimní rozdíl mezi základní vrstvou a hlubším ponorem.

3.3: Pevné 4 věty a pevná kotva = šablona Plně souhlasím s vaším měřením z v2: jakmile je pevný počet vět a pevné pořadí funkcí (obraz → mechanika → tření → dozvuk), model nebo databáze sklouzne ke strojovému podpisu. Pevné 4 věty beru zpět — délka a rytmus obrazu se musí řídit samotnou scénou (někdy stačí 2 úderné věty, jindy 3–4). Řešení pestrosti bez šablony rozebírám v 4.1 a 5.3.

3.4: Tik „X does not Y; it simply Z“ Naprostý souhlas. Je to známý syntaktický tik jazykových modelů (tzv. contrastive negation), který při generování desítek textů okamžitě prozradí AI. Do kontrolního linteru pro V4 je nutné přidat tvrdé negativní pravidlo na konstrukce typu „does not X; it simply Y“ / „is not X, it is Y“.

3.5: Kenaz pořád jako světlo a oheň Kritika ownera je přesná. Pokud Kenaz zredukujeme jen na oheň a světlo, splývá se Sowilo (slunce/světlo) a Dagaz (úsvit). Etymologicky i významově je Kenaz spojená nejen s pochodní, ale především se schopností, znalostí, dovedností a odhalením tvaru (staroanglická runová báseň spojuje cen s pochodní, ale také s místem, kde sedí urození — tedy s kultivovaným prostorem a řemeslnou dovedností; zdroj: Old English Rune Poem, sloka 6). Pro odlišení od Sowilo by Kenaz měla pracovat se směrovaným nástrojem, dovedností ruky, ostřím nebo teplem potřebným ke změně skupenství, nikoli s přírodním světlem na obloze.

3.6: Překryv sfér s jinými runami Vaše intuice při čtení byla správná, v mých ukázkách byly překryvy:

* Obsidián (oheň potká led) skutečně patří spíš pod Hagalaz (náhlý střet živlů) nebo dynamiku Muspellheimu a Niflheimu, ne pod Kenaz.
* Gejzír (skrytý tlak pod povrchem) je mnohem přesnější pro Perth (skrytá komora pod zemí) nebo Uruz (surová zemská síla) než pro Kenaz.
* Drive & Friction u Kenaz se musí zúžit čistě na řízený proces zpracování (řemeslo), jinak leze do zelí Uruz (surová síla) a Nauthiz (tření z nouze).

3.7: Fakta bez zdroje Uznávám a čistím:

* Kenaz jako horečka/vřed (sféra Fever & Exposure): Má historický zdroj — v Norské a Islandské runové básni se tato runa jmenuje kaun (vřed, bolák, zánět; islandsky kaun er barna böl — „vřed je neštěstí dětí“; zdroj: Icelandic Rune Poem a Norwegian Rune Poem, sloka 6). Nejde tedy o můj výmysl, ale o doložený historický význam odlišný od staroanglické pochodně (cen). Pokud však owner chce runu držet věcně a bez nemoci, můžeme tuto sféru vypustit nebo nahradit.
* Blank jako „Wyrd / Odin“: Bez historického zdroje. Prázdná runa je moderní vynález Ralpha Bluma z roku 1982 (The Book of Runes). Ve V4 nesmí nést falešnou mytologickou nálepku „Odinova runa“ — má zůstat čistě jako Blank (nepotištěný kámen/dřevo, prostor bez znaku).
* Rozdělení run ven × dovnitř, „tři ověřené psychologické principy“, „10× přirozenější“: Bez zdroje — šlo o moje pracovní designové heuristiky a odhady, ne o citovaná fakta. Vyřadit ze specifikace.

3.8: Pevně 4 sféry Souhlasím s rozhodnutím ownera. Pokud vaše data ukazují 2–5 přirozených stránek na runu (Algiz 2, Ansuz 5), musí se UI přizpůsobit runě, ne runa šabloně.

3.9: Emoce jen těžké Plný souhlas. Můj výčet byl zkreslený. Vaše devítka v oddílu 2.7 (tíží / napíná / otvírá) je vyvážená a mnohem lépe pokrývá realitu.

3.10: Kontrast jen pro „Let the rune choose“ Dobrý postřeh. Kontrastní výběr (kdy emoce ovlivní atmosféru obrazu tak, že nabídne protipól místo opakování tlaku) může fungovat i u ručně zvolené sféry. Je ale třeba ohlídat, aby obraz působil věcně, ne jako snaha Rúnara uživatele „utěšovat“ (viz zásada 4J5 u těžkých run).

3.11: Islandština a úpravy modelem Zásadní chyba v mém předchozím návrhu. Pokud je islandština primární jazyk a ověřuje se parserem a korpusem, nesmí model za běhu přepisovat věty pevného textu. V islandštině by i drobná změna přídavného jména podle emoce mohla rozbít shodu v rodě, pádu nebo přirozenou vazbu. Texty obrazů musí být kompletně předpřipravené a zkontrolované v knihovně (stejně jako Runa dne).

3.12: Craft se změnil (ocel a beton → výheň, dřevo, vlna) Beru na vědomí. Beton a průmyslová ložiska vypadávají; Craft ve V4 stojí čistě na tradičním řemesle a ruční práci (výheň, dřevo, vlna, nůž, loď, provaz, kámen).

## Oddíl 4: Doplnění toho, co v návrhu chybí

4.1: Rozmanitost bez šablony (pro předpřipravenou knihovnu) Protože model nebude texty generovat živě (kvůli kvalitě islandštiny), rozmanitost zajistí banka pevně napsaných variant pro každou sféru (např. 3–5 variant na sféru, rozdělených mezi Land a Craft). Aby z toho nevznikla šablona, musí se varianty v rámci jedné sféry lišit v ose vyprávění:

* Varianta A (Děj / Pohyb): Sleduje změnu v čase (co se děje, když síla působí).
* Varianta B (Stav / Detail): Zastaví se u jednoho konkrétního detailu materiálu po působení síly.
* Varianta C (Vztah dvou prvků): Ukazuje interakci mezi nástrojem a materiálem (nebo dvěma přírodními jevy). Systém sleduje historii uživatele (stejně jako u Runy dne) a podává variantu, kterou ještě nečetl.

4.2: Norny ve V4 U Norn (Urður = co tě utvořilo · Verðandi = co se právě tká · Skuld = kam se kloníš) uživatel nevybírá sféry pro každou runu zvlášť (to by byly 3 volby navíc a rozpadla by se vazba mezi pozicemi).

* Mechanismus: Pozice v Nornách nahrazuje volbu sféry. Systém pro každou z těch tří run vybere jednu z jejích předpřipravených sfér podle časového vektoru pozice (každá sféra v databázi může mít interní tag, zda se hodí spíše pro vznik/základ [Urður], probíhající proces [Verðandi], nebo směřování/důsledek [Skuld]). Emoce ze vstupu se zde uplatní jako jednotný filtr atmosféry pro všechny tři runy, nebo se u Norn přeskočí, aby nekomplikovala výklad.

4.3: Těžké runy a světlé emoce Pokud uživatel zvolí Hopeful nebo Light a vytáhne těžkou runu (Hagalaz, Nauthiz, Isa, Thurisaz, Perth, Tiwaz), světlá emoce nesmí otupit hranu runy.

* Pravidlo: U těžkých run se světlá emoce nepromítá jako úleva, ale jako jasnost pohledu (např. Hagalaz + Light = krupobití udeří pod čistou oblohou, kdy je přesně vidět, co v zahradě nevydrželo nápor — bez milosrdné mlhy, ale i bez přikrašlování).

4.4: Krize (Hollow / Lonely a pravidlo 112) Tady je nutná tvrdá pojistka mimo samotný runový text. Pokud uživatel zvolí emoci Hollow (nebo v Asku napíše text naznačující beznaděj, samotu či krizi), systém musí mít dvě úrovně ochrany:

1. Textová: Obraz pro Hollow nikdy nesmí pracovat s metaforami propasti, pádu do prázdna, zbytečnosti nebo rozpadu. Musí ukazovat prázdný prostor jako fyzickou nádobu nebo ticho, které nese váhu (např. prázdný dřevěný člun na břehu, který drží svůj tvar i bez nákladu).
2. Bezpečnostní (112): Jakmile detektor v Asku (nebo opakovaná volba Hollow s krizovým kontextem) zachytí rizikový signál, Rúnar okamžitě přeruší roli strážce run a zobrazí věcný, nehodnotící kontakt na linku pomoci (112 na Islandu / mezinárodní ekvivalent) — přesně podle vašeho stávajícího pravidla.

4.5: Pojmenovat emoci, nebo ne? Nepojmenovávat v textu obrazu. Jakmile v textu napíšeš „Když se cítíš těžce…“ nebo „V neklidu…“, přecházíš do diagnostiky a terapeutického stylu (porušení 4J2 a 4J9). Emoce má být cítit z fyzikální vlastnosti hmoty (viz vaše tabulka v 2.7: váha, mlha, napnutá struna). Uživatel svůj pocit pozná v popisu materiálu mnohem silněji, než když mu ho zopakuješ jako nálepku (bez zdroje — designový princip show, don't tell).

4.6: Po 4/4 sférách (když má uživatel runu celou otevřenou) Když má uživatel otevřené všechny sféry dané runy a vytáhne ji znovu:

1. Všechny sféry zůstávají klikatelné (zobrazí se mu nová varianta obrazu z banky téže sféry, kterou ještě nečetl — viz 4.1).
2. U runy se objeví nenápadná možnost „Spojit s životní runou“ (pokud ji má nastavenou), což odemkne pohled v Asku zaměřený na tření mezi touto plně prozkoumanou runou a jeho životní runou.

4.7: Blank

* Bez sfér: Blank žádné sféry nemá. Po vytažení Blank (ať už ručně nebo přes Let the runes decide) se přeskočí výběr sfér a zobrazí se jeden z malé banky (cca 3) obrazů pro Blank — např. nepotištěný kámen na stole, ticho před prvním úderem dláta, čerstvý sníh bez jediné stopy.
* Emoce u Blanku: Ovlivní jen výběr z těch 3 variant (např. Restless → ticho v dílně, kde nástroje leží netknuté; Foggy → bílá pláň bez obzoru).
* Ask u Blanku: Nenabízí dveře Princip / Stín (protože Blank nemá princip ani stín), ale rovnou 3 čipy: `[ What is not yet named ]` · `[ Silence before action ]` · `[ My own question ]`.

4.8: Životní runa (Life Rune)

* Kde se objeví: Zůstává mimo hlavní obraz sféry (aby neředila význam tažené runy), ale je viditelná v záhlaví čtení a aktivně vstupuje až do Asku.
* Vysvětlení nováčkovi jednou větou (EN / IS):
   * EN: Your Life Rune is the baseline weight you carry into every reading — the constant against which the drawn rune moves.
   * IS: Lífsrún þín er grunnþunginn sem þú berð inn í hvern lestur — festan sem dregna rúnin hreyfist gagnvart. (Jistota islandštiny: vysoká, přirozená větná stavba, doporučuji ověřit gagnvart vs. við u rodilého mluvčího pro maximální idiomatičnost).

4.9: Jména sfér v islandštině a v UI Aby sféru pochopil každý na první pohled („i dítě“), nesmí být pojmenována abstraktními filosofickými pojmy (Transcendence, Manifestation), ale jedním až dvěma konkrétními slovy popisujícími děj nebo stav:

* Místo Insight & Clarity → Light & Sight / Ljós og sýn (nebo Clear Sight / Skýr sýn).
* Místo Craft & Shaping → Shaping / Mótun.
* Místo Drive & Friction → Heat & Work / Hiti og verk.
* V UI je u každé sféry jen tento krátký název + drobný indikátor stavu (`●` neotevřeno / `✓` otevřeno). Žádné podtitulky, které by uživatele zahltily před kliknutím.

4.10: Jak sféru ověřit (Kvalitativní test) Sféra patří dané runě tehdy, pokud projde tříbodovým testem:

1. Historicko-etymologický kořen: Má oporu v názvu runy, runových básních (staroanglická, norská, islandská) nebo doložené materiální kultuře (bez zdroje neprojde).
2. Test záměny (negativní test): Když napíšeš obraz této sféry bez použití jména runy, nesmí ho slepý soudce přiřadit k jiné runě (např. pokud obraz pro Kenaz zní jako Sowilo nebo Uruz, sféra je špatně vymezená).
3. Test odlišnosti uvnitř runy: Dvě sféry téže runy nesmí sdílet stejný fyzikální mechanismus (např. u Raidho nemůže být jedna sféra „cesta“ a druhá „směr cesty“ — jedna musí být udržení směru a druhá rytmus pohybu).

## Oddíl 5: Odpovědi na konkrétní otázky

5.1: Proč třetí osoba v obrazu, když v Asku „you“ pouštíš? Co konkrétně by „you“ v obrazu zkazilo?

* Co „you“ v obrazu kazí: Jakmile model napíše „You stand by a forge…“, vytváří fiktivní scénu, ve které uživatel fyzicky není, a nutí ho přijmout roli postavy. Navíc v angličtině i islandštině you / þú v takovém textu okamžitě spouští naučené vzorce horoskopů a koučovacích textů, kde autor předpokládá, co člověk cítí nebo dělá (hraničí s porušením 4J2 — tvrzení o člověku). Třetí osoba („Raw iron resists the hammer…“) vytváří neutrální prostor — obraz stojí sám o sobě jako fakt ve světě a člověk si k němu přistoupí dobrovolně.
* Proč je „you“ v pořádku v Asku: V Asku už probíhá dialog, který otevřel sám uživatel svou otázkou nebo výběrem čipu (In my work). Tam už uživatel Rúnara přímo oslovil a žádá o přenos principu do své situace — vyhýbat se tam druhé osobě by působilo nepřirozeně a odtažitě.

5.2: Co ve V4 nahradí most k člověku (oblast + tvar konce) pro toho, kdo Ask nepoužije? Mostem je samotný akt volby sféry po vytažení runy. Ve v2 člověk vybíral obecné škatulky (Love, Career) předem, a proto musel model ve větě 3 uměle stavět most („In your career, this may mean…“). Ve V4 si člověk vybere sféru, která už sama o sobě je konkrétní životní/materiální optikou (např. u Wunjo si vybere Shared Hearth vs. Release of Tension). Tím, že si sféru vybral sám, už nepotřebuje berličku „toto se může týkat tvé práce“ — obraz rovnou zasáhne to, na co při kliknutí myslel.

5.3: Jak zajistit rozmanitost bez pevné kotvy, která se opakuje, a bez šablony 4 vět? Opustit generování obrazu modelem za běhu a postavit kurátorovanou banku 3–5 variant na každou sféru (podobně jako máte u Runy dne).

* Každá varianta v rámci jedné sféry má jinou délku (2 až 4 věty) a jinou syntaktickou stavbu (jedna začíná dějem, jiná stavem materiálu, jiná kontrastem).
* Varianty se střídají mezi režimy Land (islandská příroda) a Craft (tradiční řemeslo).
* Pro 24 run × průměrně 3,5 sféry × 4 varianty to znamená cca 330 krátkých textů (každý ~45–60 slov). To je objem, který lze napsat, zkontrolovat parserem a doladit tak, aby v něm nebyl žádný strojový podpis AI. Model pak zasahuje jen v Asku (kde je živý kontext uživatele nutný).

5.4: Jaké jsou tvých zbylých 5 emocí z devíti? Co říkáš na naši devítku (tíží / napíná / otvírá)? Zbylých 5 z mého původního návrhu bylo: Sharp, Tense, Hollow, Grounded, Torn (dohromady s Restless, Foggy, Heavy, Burning to tvořilo 9). Hodnocení vaší devítky (tíží / napíná / otvírá): Vaše tabulka v 2.7 je lepší než moje. Má jasnou vnitřní logiku tří energií (tíha – napětí – otevření) a ke každé emoci máte rovnou přiřazenou fyzikální vlastnost hmoty (váha, prázdný prostor, mlha, struna, chvění, žár, tání, klíček, výdech). Doporučuji převzít vaši devítku beze změny (včetně volby Skip).

5.5: Má se emoce ve čtení pojmenovat? Proč ano / ne? Ne, nepojmenovávat.

* Proč ne: 1) Jakmile Rúnar napíše „V tvé nejistotě…“ nebo „Tíha, kterou neseš…“, mění se v terapeuta a porušuje zásady 4J2 (tvrzení o člověku) a 4J9 (žádný terapeutický slovník). 2) Pojmenování emoce zužuje obraz — člověk se začne soustředit na to, zda model přesně trefil jeho pocit, místo aby se díval na runu. Když emoce zůstane jen jako „počasí obrazu“ (např. Foggy vybere variantu obrazu s mlhou nebo rozmazaným obrysem), působí to přirozeně a bez nátlaku.

5.6: Na jakém zdroji stojí Kenaz jako horečka/vřed a Blank jako „Wyrd / Odin“?

* Kenaz jako vřed/zánět: Stojí na Islandské runové básni („Kaun er barna böl ok bardaga [för] ok holdfúa hús“ — „Vřed je neštěstí dětí a [cesta] zkázy a dům hnijícího masa“) a Norské runové básni („Kaun er barna bǫlvan; gøyr gørvir nán fǫlvan“ — „Vřed je prokletí dětí; nemoc činí mrtvolu bledou“; zdroj: The Old Norwegian and Icelandic Rune Poems, ed. Bruce Dickins, 1915). Staroanglická báseň má naopak cen = pochodeň. Oba významy jsou tedy historicky doložené, jde o rozdíl mezi kontinentální/anglosaskou a severskou tradicí.
* Blank jako „Wyrd / Odin“: Bez historického zdroje. Jde o novodobý komerční přídavek (Ralph Blum, The Book of Runes, 1982). Ve V4 tento přívlastek nepoužívejte.

5.7: Jak by vypadaly sféry pro těžkou runu (Nauthiz nebo Hagalaz), aby se nepřekrývaly s Kenaz? Vezměme NAUTHIZ (historicky nauðr = nutnost, tíseň, tření dřeva o dřevo při rozdělávání ohně nouze — nauðeld; zdroj: Icelandic/Norwegian Rune Poem, sloka 10). Odlišení od Kenaz: Kenaz je řízené řemeslo a nástroj (mám dílnu, tvaruji materiál). Nauthiz je holé přežití a odpor (nemám nic, musím třít dvě suchá dřeva o sebe, dokud nezahoří, jinak zmrznu).

Sféry pro NAUTHIZ (3 sféry — víc nepotřebuje):

1. Resistance & Friction (Odpor a tření): Dvě suchá dřeva třená o sebe v zimě. Teplo nevzniká z hojnosti paliva, ale z tvrdého odporu, bez kterého by nevznikla ani jediná jiskra. (Odlišení od Kenaz: tady nejde o kování tvaru, ale o samotné vykřesání jiskry z ničeho).
2. Scarcity & Constraint (Omezení a nedostatek): Úzká horská stezka nebo příděl zásob v zimě. Omezení odřezává všechno zbytné a nechává jen to, co skutečně unese váhu.
3. Endurance (Výdrž pod tlakem): Kámen v řečišti, přes který se valí jarní voda. Kámen proud nezastaví ani před ním neuhne; jeho jedinou prací je zůstat na místě, dokud tlak nepřejde.

Ukázka obrazu (Nauthiz – Resistance & Friction, Craft):

* EN: Two dry sticks rubbed together in cold air produce no flame until the wood itself begins to scorch and blacken. The heat comes only from the stubborn resistance between the two surfaces pressing against each other.
* IS: Tveir þurrir spýtur sem nuddaðir eru saman í köldu lofti gefa engan loga fyrr en viðurinn sjálfur tekur að sviðna og sortna. Hitinn kemur aðeins úr þrálátu viðnámi flata sem þrýstast saman.(Jistota islandštiny: střední až vysoká — „spýtur“ jsou ženského rodu, proto „tveir“ musí být tvær [tvær þurrar spýtur], a „nuddaðir“ musí být nuddaðar. Děkuji za připomínku z 1.1: přesně toto dokazuje, proč islandštinu nesmí generovat LLM bez kontroly gramatického parseru!)

5.8: Jak má fungovat V4 v Nornách? U Norn (Urður / Verðandi / Skuld) uživatel nekliká na sféry třikrát za sebou (zabilo by to plynulost).

1. Výběr sféry řídí pozice: Každá sféra v databázi má přiřazený tag, ke které Norně přirozeně tíhne (např. Urður = sféry původu, paměti, základu; Verðandi = sféry aktuálního tření, práce, pohybu; Skuld = sféry důsledku, směru, otevření). Systém pro každou ze tří vylosovaných run vybere odpovídající sféru automaticky.
2. Zobrazení: Uživatel vidí tři karty vedle sebe (nebo pod sebou): název pozice (Urður – What shaped this), jméno runy + název automaticky zvolené sféry (aby viděl, kterou stránkou runa mluví) a její obraz z knihovny.
3. Ask v Nornách: Jeden Ask pro celý rozklad se ptá na napětí mezi těmi třemi runami dohromady (např. jak Urður brzdí nebo nese Verðandi).

5.9: Jak napsat sféry a obrazy islandsky od začátku a zároveň je udržet stejné v obou jazycích? Nepřekládat slovo od slova, ale psát z jedné společné fyzikální předlohy (Scene Briefu):

1. Pro každou variantu obrazu vznikne nejprve jazykově neutrální Scene Brief (3 odrážky: Co je v obraze · Jaká fyzikální síla působí · Kde je třecí bod).
2. Podle tohoto Briefu napíše islandský autor/model text přímo islandsky s využitím přirozených islandských výrazů pro krajinu a řemeslo (např. hraun, mosi, smiðja, vaðmál).
3. Anglická verze se napíše podle téhož Briefu (nebo jako volný, idiomatický převod islandského originálu, nikoli naopak).
4. Výsledkem jsou dva texty, které nesou totožný obraz i význam, ale každý dýchá přirozenou syntaxí svého jazyka.

5.10: Kde vidím v našem zápisu (oddíl 2) chybu nebo rozpor? Vidím tři konkrétní rozpory v oddílu 2, které je potřeba před další prací narovnat:

1. Rozpor mezi 2.1.1 („model jen zasahuje“) a 2.6.5 („dva texty téže runy a sféry se neopakují“) + 4J7 („islandština ověřená nástroji“): Pokud model za běhu zasahuje do pevného obrazu (např. kvůli emoci), nemůžete zaručit, že islandština projde parserem bez chyby, a zároveň riskujete strojové tiky modelu. Řešení: Model do základního obrazu vůbec nezasahuje. Základní obraz je 100% z předem ověřené knihovny variant (jako Runa dne); model pracuje výhradně v Asku.
2. Rozpor v 2.4 (4K1–4K4) vs. 2.1.3 (rozmanitost): Tabulka 2.4 stále popisuje pevnou čtyřdílnou strukturu (obraz → mechanika → třecí bod → dozvuk). Pokud ji necháte jako povinnou osnovu pro všechny texty, dostanete šablonu. Řešení: 4K1–4K4 brát jen jako ingredience (z nichž v jednom krátkém textu stačí 2 nebo 3), ne jako povinné pořadí čtyř vět.
3. Chybějící vazba mezi emocí (2.7) a pevnou knihovnou (2.1.1): Pokud má každá sféra jen 3–4 pevné varianty v knihovně a zároveň máme 9 emocí + Skip, nemůže mít každá emoce vlastní text (to by bylo $24 \times 3,5 \times 9 = 756$ textů). Řešení: Emoce (tíží / napíná / otvírá) slouží jen jako selektor (filtr), který z existujících 3–4 variant sféry vybere tu, jejíž fyzikální atmosféra nejlépe odpovídá (nebo tvoří záměrný kontrast) zvolené řadě emocí.

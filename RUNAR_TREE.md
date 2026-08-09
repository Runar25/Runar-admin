# RUNAR_TREE.md — Strom života: DUŠE · ZÓNY · STAVBA
# KANONICKÝ VSTUPNÍ BOD. Čti tohle první. Ostatní tree doky = detail/historie (mapa v §9).
# Vznik: 2026-07-04 · Cowork · konsoliduje RUNAR_TREE_BUILD + placement + DESIGN (příběh) do jednoho místa.

---

## 0. TL;DR (30 sekund)
- **Strom jsi ty.** Kmen = kdo jsi (Life Rune). Strom ukazuje jednu věc: **rosteš ke svému kmeni, nebo od něj.**
- **Umístění = ZÓNY:** čas (Norns osa, z intention → výška) × dovnitř/ven (area → strana).
- ⭐ **MODEL — vyřešené dilema (2026-07-30, KUKY), NE dogma. Strom není hotový.** **Element = kostra** — seskupuje větve, jde kořeny→kmen→koruna, dává barvu. **Runa = tvář větve** — korunní větve rostou z elementů (plošně) a runa jim dává tvar. Runa přišla první (děláme runová čtení), element/ætt k ní přišly později. **Teď mimo hru** (vrátí se jen novým datovaným rozhodnutím, ne potají): boughs-přestavba · duch-větev pro Blank · živé síly mezi runami (síly = význam v journalu, ne pohyb větví — §7). ⚠️ Chceš něco z toho změnit? Nejdřív **varování + nový záznam do RUNAR_DECISIONS**, ne tichý drift.
- **Opakování** posílí element (víc a mohutnějších větví jeho rodiny) + posune, která runa drží tvar. Strop hlavních větví = `maxMains` v builderu (čitelnost) — **ne per-element.**
- **Systém je otevřený:** nová oblast (i pozdější osobní otázky) = jen souřadnice na osách. Žádná přestavba.
- **Engine = crown-composer, NESAHAT.** Mění se jen data + umístění, po malých krocích na kopii.
- ⭐ **Kompletní mapa pák (co ovlivňuje strom, jak, proč) → [RUNAR_TREE_MAP.md](RUNAR_TREE_MAP.md)** — stěžejní systémová reference (identita runy · element · vstupy čtení · pozice · růst · kmen · kořeny · twigy · síly). Mechaniku vlastní CODE-tree, význam doplňuje Cowork-tree.

---

## 1. DUŠE — co strom vypovídá o člověku
Z `RUNAR_TREE_BUILD.md`: *„Strom jsi ty. Větev není záznam toho, co bylo řečeno — je záznam toho, co se pohnulo. Strom je mapa významu, ne geometrie."*
Z `RUNAR_DESIGN.md`: *„Kmen jsi ty. Vše ostatní roste ke kmeni, nebo od něj. Strom ví jednu věc: jestli rosteš ke svému kmeni, nebo od něj. Harmonie není cíl, napětí není selhání — rozdíl ti řekne, kde jsi."*

Strom NEukazuje „87 % oheň". Ukazuje **kdo jsi (kmen) + kam dáváš pozornost + jestli k sobě rosteš, nebo od sebe.** Element je sice **kostra kresby** (seskupuje větve, nese barvu — §0 model), ale strom není *o* elementech; ty jsou jen řeč, kterou ten příběh mluví.

**„Ke kmeni / od kmene" = konkrétně (mechanika, ne poezie):** kmen = tvůj střed. **Ke kmeni** = pozornost sebraná — zóny se plní vyváženě, strom roste plný kolem osy. **Od kmene** = ujela k jednomu okraji — jedna zóna/strana bobtná, ostatní zůstávají holé, strom se naklání a je z druhé strany dutý. Měří se **rozložením + mohutností větví přes zóny.** **Není to soud** (vyvážený ≠ dobrý) — sám náklon je zpráva („vyrostl jsi celý do koruny-svět, kořeny a nitro máš holé"). „Napětí" = tah mezi protilehlými okraji; „harmonie" = sebráno kolem středu; *rozdíl ti řekne, kde jsi.*

Test „je zajímavé se dívat": *přečteš ve stromě vlastní život?* (velká zlatá větev lásky, holá kariéra, tmavý kořen z loňské zimy, letos zelené výhony smyslu.)

---

## 2. IDENTITA (pevná, jednou)
- **Kmen = Life Rune** (z data narození, `calcLifeRune`) = ty. **Life Rune NENÍ barva-element** (těch je 5 — §3); je to KMEN, sám uživatel. Neměnné navždy. Náklon ≤0.45, barva dle elementu Life Rune.
- **3 kořeny = 3 Norny** (zakládací Norns čtení): urð = jádro/minulost · verðandi = směr/teď · skuld = pohon/budoucnost.
- **Kořeny = odkud jdeš** (minulost / základ) — **zrcadlo koruny, ale ve VELIKOSTI/mohutnosti** (Yggdrasil), ne aby dole vypadalo stejně jako nahoře. Čtou minulostní půlku journalu a krmí výklad tvaru (§7: hluboké/těžké kořeny = drží tě minulost).
- **Kořeny jsou živé:** když se runa z kořene vrátí v pozdějším čtení → ten kořen prohloubí/posílí. ⚠️ Zatím jen **KRESLENÉ** (ozdoba: rostou s věkem, barva z Life Rune); **význam** (Norny → 3 kořeny · prohloubení návratem) **NEPOSTAVEN** → RUNAR_BACKLOG. V labu ještě pořádně nevyzkoušeno.

---

## 3. ZÓNY — jak každé čtení najde místo (JÁDRO)
Dvě **spojité, prolínající se** osy. Box (runa/oblast) do zóny jen *míří* (tendence), není přibitý — proto se zóny protínají a strom žije.

**Osa A — ČAS / NORNY (výška):**
`urð = kořeny (minulost, co tě utvořilo) ↔ verðandi = střed (teď) ↔ skuld = koruna (kam míříš)`
Řídí **intention** (`INT_AXIS`: urð −1 / verðandi 0 / skuld +1, průměr přes čtení elementu, váha `intZone`) → **spojitá výška**, ne tři přihrádky. ⚠️ **Postaveno je jen intention.** Plnější model (+ area.norns + seeking modifikátor + world fallback) je NÁVRH, ne kód — a **area dnes řídí STRANU** (osa B), do výšky nevstupuje. Kdo sem napíše „hlasování intention›area›seeking", popisuje nepostavené.

**Osa B — DOVNITŘ / VEN (strana):**
`vlevo = nitro (innangard) ↔ střed = liminál ↔ vpravo = svět (útangard)`
Řídí **area of life.** (innangarðr = ohrazený domov / bezpečí; útangarðr = divočina za plotem = vnější svět — severská hranice „uvnitř / venku".)

**Pole oblastí (padají samy → diagonála příběhu):**
```
koruna + ven    →   Purpose · Career · Spirituality   (kam míříš)
   střed        →   Love · Crossroads                 (kde stojíš)
kořeny + nitro  →   Healing · Family · Inner Growth    (odkud jdeš)
```
Rohy (budoucnost+nitro, minulost+svět) = volné pro vzácnější kombinace.

**Element = kostra, ne Norns zóna:** seskupuje větve (kořeny→kmen→koruna), dává **barvu** a rodinu + spoluurčuje úhel/šířku odchodu. **NEurčuje výšku** — tu řídí intention (osa A). **5 barev-elementů: Fire · Water · Air · Earth · Shadow** — Shadow = studené/skryté runy (Isa/Hagalaz/Perth/Eihwaz/Blank; váže se na cold-steering ve čtení). **Life Rune NENÍ barva-element — je to KMEN = ty.**
**Runa = tvar/silueta** (která runa kterou větev drží → §5). **Ætt = charakter růstu** — z tématu ættu: Freya (svět/tělo/radost) → plynulé · Heimdall (osud/skryté/cyklus) → gnarled/uzlovité · Týr (řád/dokončení) → řízené. Ætt NEurčuje výšku.

---

## 4. VĚTEV = JEDNO ČTENÍ (signály → co větev je)
| Signál | Určuje |
|---|---|
| **Norns osa** (§3A) | ZÓNA = výška (kořeny/střed/koruna) |
| **area** | STRANA (dovnitř vlevo / ven vpravo) |
| **element** | BARVA + mikro-výška + úhel (šířka) |
| **runa** | TVAR / silueta — ✅ ŽIVÉ od 2026-07-19 · hystereze prahu 2 (2026-07-21) proti blikání kolem remízy |
| **ætt** | sekundární charakter růstu |
| **spread** | KOMPLEXITA (single=uzel · Norns=3 kořeny · Kříž=větev+4 · Horseshoe=větvená · Yggdrasil=roční prsten) |
| **počet vyplněných polí** | VÁHA / mohutnost |
| ~~čas od minula~~ | ZRUŠENO 2026-07-19 — druhá půlka zrušené penalizace, strom čas neřeší |
| ~~Blank/Óðinn~~ | duch-větev ZRUŠENA 2026-07-21 (KUKY: zbytečnost) — Blank = běžná runa Shadow |

---

## 5. RŮST + POSÍLENÍ
- **Opakování posílí ELEMENT, ne konkrétní větev-runu.** Víc čtení téhož elementu → přibude větev jeho rodiny (~1 na každých ~5 čtení, `stableAssign`) a **přibude runa, která drží tvar**. ⭐ **Pořadí run elementu = podle PRVNÍHO tažení (sticky), NE podle četnosti** (KUKY 2026-08-07, potvrzeno v kódu `runeSeen`): n-tá větev elementu = n-tá **poprvé tažená** runa toho elementu; ostatní tažené runy téhož elementu jedou jako **odbočky (twigy)** na ní. Sticky pořadí = ochrana proti přeskakování tvaru (dřívější „nejčastější runa" se při remíze měnila a silueta blikala). **Tohle je jediné místo, kde to pravidlo bydlí — jinde jen odkaz (§20).** Geometrický žebřík „2× blíž · 3× cluster · 4× srůst = shared root" je NÁVRH (→ RUNAR_BACKLOG), **v kódu NENÍ.**
- **Život odbočky (F1, 2026-08-07, lab).** Odbočka vznikne, když **poprvé potáhneš její runu**; s každým dalším tažením TÉ runy **roste** (délka + tloušťka) a po několika se nasytí — dál už jen tloustne. Počet odboček = **tažené runy elementu** (ne vigor/náhoda) → strop vzniká sám z velikosti elementu, stín je nejřidší. ⭐ **Pozice odbočky je dána SLOTEM její runy** (počet slotů = velikost elementu − 1, **konstanta**), ne pořadím: nová runa přisedne na své místo a **stávající odbočky se nehnou**. Dřív se pozice počítala z indexu a počtu, takže každá nová runa **přepočítala všechny** a odbočky viditelně skákaly. Malé dekorativní sub-twigy v hloubce zůstávají beze změny.
- **Graduace odbočky (F2, 2026-08-07, lab).** Když runa překročí **~⅓ tažení hlavní runy** své větve (a min. 3 tažení), její odbočka se **povýší na dominantní sub-větev**: sedí na **1/5–3/5 délky rodiče** (nikdy u kmene, nikdy na špičce), je výrazně větší a **nese vlastní odbočky** — runy tažené po ní na ní visí (rodič→dítě: vyrostly z té praxe; tím se dominanta rozvětví a udělá místo dalším). **Strop 2 graduace na pramen.** ⭐ **STICKY: jednou povýšená větev už nedegraduje**, i když hlavní runa později přeroste práh — jinak by se strom přestavoval sem a tam. **Zrcadlový podkořen se NETVOŘÍ** (KUKY 2026-08-07): graduace je událost nad zemí, povýšená větev sdílí kořen rodiče; kořen má vlastní pravidlo (sahá — méně, delších výběžků).
- **Portrét = mix + velikost, ne počet.** Soustředěný člověk = pár mohutných rodin větví; pestrý = široký baldachýn.
- **Strop hlavních větví = `maxMains`** v builderu (čitelnost — „moc = přeplácané"). Přebytek → posílí stávající / hmota kmene. **Strop je PER-ELEMENT** (`ELEM_CAP` v `stableAssign` — hodnoty tam, stín nejnižší); hlavní větev vyroste jen kde je tažená runa, přebytek téže rodiny → **posiluje** stávající větev + hmotu kmene, ne novou hlavní. (F0 2026-08-07, zatím lab crown-composer; port do produkce po schválení.)
- **1 pramen = 1 runa = větev nahoru + kořen dolů; max 25 = 25 run (KUKY 2026-08-04).** ⭐ **25 run ≠ 25 pramenů (upřesněno 2026-08-07):** pramenů kmene je **9** (2/2/2/2/1 dle elementu — ř. výše); **zbylé runy žijí NA nich** jako odbočky a povýšené sub-větve (graduace). Všech 25 run je tedy ve stromě, jen ne všechny jako pramen kmene. **Pramen bez runy nemá existovat** — nemá větev ani kořen; proto se `strandMax` nastavuje ze **skutečného počtu tažených run** (`mainsN`) ještě před `buildTrunk` (F0b 2026-08-07, lab). Počet pramenů kmene je svázán se stropem větví (`strandMax = maxMains` v crown composeru před `buildTrunk`). Dřív měl trunk-engine vlastní `strandMax=28` → při vyšším věku vznikaly „random" prameny navíc, co nepatřily žádné runě (reinforce). Vypnuto: **kmen mohutní tloušťkou (girth), ne přibýváním pramenů.** **Kořeny přestavěny (2026-08-05, lab):** každý pramen = větev nahoru + kořen dolů TOUTÉŽ runou (`buildBranch`, **bez `dev`** — `dev:0` zplošťuje tvar), kořen bezešvě vpleten do kmene (spine reversed + kmen = jeden tah), báze hledaná od vrchu. **Kořen ≠ větev (F4, 2026-08-07):** tvarové páky kořene (`curve`/`wobble`/`tipLift`/`taper`/`width`/`subScale` + nové `délka výběžků` a `rozevření`) jsou od F4 **živé** — dřív byly natvrdo v `rTT` a panel kořenů byl skoro mrtvý. ⭐ **Výchozí chování zůstává PŮVODNÍ** (`fan = 0`, ověřeno bod po bodu shodné se stavem před F4): směr kořene určuje **world + element runy** (`openBase` 1,15→0,30 — Hel/zem/stín doširoka, Asgard/oheň úzce) a **strana ze seedu pramene**. Když `fan ≠ 0`, přebírá řízení **poloha pramene ve svazku**: **+ = ven** (bez křížení), **− = dovnitř/kříží**. ⚠️ `baseAng` kořene míří DOLŮ, takže **kladný `dev` otáčí doLEVA** — mapování polohy na `dev` proto musí být **záporné**, jinak si kořeny prohodí strany a kříží se (chyba 2026-08-07: první verze `fan` to měla obráceně a test kontroloval jen znaménko `dev` místo skutečné polohy špičky). ⚠️ `tipLift` u kořene **není „zdvih vzhůru"**: míchá úhel k −π/2, takže do ~0,55 špičku jen **narovná** (blíž svislici) a teprve **nad ~0,57** ji obrátí nahoru. ⚠️ **NIKDY neshlukovat větve** — musí být rozprostřené (pokus o shlukování #1 revertován). Detaily → RUNAR_DECISIONS 2026-08-05 [tree].

---

## 6. OTEVŘENOST (rozšiřitelnost = princip)
Nová oblast, nový typ čtení, **pozdější osobní otázky na Rúnara** = dostanou **jen souřadnici na osách** (náklon Norns + dovnitř/ven). Žádný nový slot, žádná přestavba — strom to vstřebá. Tohle drží systém živý a zrající spolu se stromem.

---

## 7. VRSTVA VÝZNAMU — The Gathering (vrstva NAD JOURNALEM, ne v enginu stromu)
**Zásada:** Rúnar = **zrcadlo tvé pozornosti, ne předpověď událostí.** Reflektuje, nepředpovídá (rule → working-style). Proto **skuld = záměr / k čemu se táhneš**, NE věštba budoucnosti.

⭐ **KDE Gathering bydlí (KUKY 2026-07-30).** Každé čtení se ukládá do **journalu** — a journal je *databáze stromu*: drží každé čtení, každou runu, area, intention, spread. **Přesah přes víc čtení** (opakující se runy, kombinace, „síly" mezi runami / ætt / elementy) je tedy informace **v journalu**, ne v geometrii stromu. **Strom je jen vizuální forma týchž dat.** → Gathering = analytická vrstva **nad journalem** (`detectPatterns()` čte uložená čtení), NE něco zapečeného do tree enginu. Proto taky „živé síly mezi runami" nehýbou větvemi (§0 model) — jsou to vztahy **v datech**, které umí Rúnar pojmenovat.

⭐ **CO se ve tvaru čte (KUKY 2026-07-30) — směr, ne hotová věc.** Umístění (§3–§5) strom jen *postaví*; Gathering pak **čte jeho výsledný TVAR**. To jsou ty „speciální výklady". Signály tvaru:
- **strana:** víc větví vpravo × vlevo → zaměření **ven** (svět/kariéra/směr) × **dovnitř** (nitro/rodina/léčení).
- **výška:** vysoká koruna × hluboké/těžké kořeny → tah k **budoucnosti/ideálům** × **držení minulostí**.
- **šířka:** široký × úzký strom → **pestrost** (hodně oblastí) × **soustředění** na málo.
- **náklon + holá místa:** strom se kloní / jedna strana holá → **nerovnováha** („rosteš od kmene" — mechanika §1); holá zóna = oblast, které se nevěnuješ.

Data pro tohle **už leží v journalu** (area/intention/runy každého čtení) — nic nového se nesbírá. **Umístění tvar vyrobí, Gathering ho přečte.** Dnes strom ten tvar už *kreslí*, ale *číst* ho zatím neumí (`detectPatterns` nepostaveno → RUNAR_BACKLOG).

⭐ **„Proč" (síly) — zatím jen v LABU, opatrně (KUKY 2026-08-02).** Síly, co tvar dělají, se už počítají (vstupy §3–§5: life-rune element → náklon/křivka kmene · rovnováha area → strana · intention → výška · počty elementů → větve · ætt → charakter · věk+spread → velikost). V **labu** je ukázat v inspekci (klik na část → runa/element/ætt/počet + proč náklon/strana/výška) — levné, užitečné k ladění. ⚠️ **Pozor (kritika):** u PEVNÉ kostry (kmen, tvar runy z Life Rune) je „proč" jen **tautologie** (převyprávěný vstup) a v čase se nemění → nízká hodnota; číst se má hlavně to, co se **mění v čase** (rozložení z čtení). **Produkční datovou vrstvu ani výklad z metadat NESTAVĚT dřív**, než bude DB a než se výklad **ověří na reálných stromech** — jinak hrozí falešná hloubka = věštba. → RUNAR_BACKLOG.

**Normální čtení** přidá řádek do journalu (a strom o větev povyroste). **Gathering** ten journal *přečte jako celek* — najde zralý opakující se vzorec a Rúnar mluví o TOM vzorci (ne o čerstvé runě).

**Tři hloubky = KDE vzorec dozrál (jména = poloha, ne věštecká moc):**
- **Orel** (koruna / skuld) = vzorec v korunních čteních → *k čemu se pořád vztahuješ* (záměr/směr). Tón širší, „co tě to učí?".
- **Níðhöggr** (kořeny / urð) = vzorec v kořenových čteních, nebo **stagnace** (přestal jsi číst) → *co tě drží / co nechceš vidět.* Tón těžší, „co odmítáš vidět?".
- **Ratatoskr** (celý strom) = korunní **A** kořenový vzorec zralý naráz = **Full Gathering** (vzácný) → napětí mezi „odkud jdeš" a „kam míříš".

**Vzorec** = prahové opakování v okně (3× runa · 4× element · 5× area · návrat runy…; **přesné prahy + okna = spec v RUNAR_BACKLOG**, čeká na `detectPatterns()`). **Vzácné a zasloužené** — vždy dozraje jen jeden nejsilnější; naskočí jako **Huginn CTA** (posel „strom ti chce něco ukázat") → opt-in, všechny tiery (cena = rozhodnutí, dnes nikde v kódu). Po spuštění se vzorec označí „viděno" (nespustí znovu, dokud výrazně nenaroste / nedozraje jiný). Manuální „vyber runy z journalu" Gathering = **MRTVÁ** (retired).

**Jedna detekce, dvě tváře:** `detectPatterns()` pohání Gathering (Rúnarova slova) i **speciální vizuály** (katalog motivů → RUNAR_BACKLOG) + stavy větví (pulz/shimmer).

**Mytologický cast (každé jméno = význam + vazba):**
- Norny = svislá osa = čas tvé pozornosti: **urð** (kořeny) = minulost / co tě utvořilo · **verðandi** (střed) = přítomnost / kde stojíš · **skuld** (koruna) = záměr / k čemu se táhneš.
- **Muninn** (paměť) = `tree_state`, strom si pamatuje. **Huginn** (myšlenka) = posel/notifikace od stromu k tobě (CTA).
- **Yggdrasil** = tvůj osobní strom (kmen = ty, 3 kořeny = Norny, koruna = kam se táhneš).

**Transformační páry** (vzorec = obě runy páru opakovaně ve stromě → co to o tobě říká):
- *Cyklus (něco se uzavírá):* Jera+Hagalaz = sklizeň i bouře → tvrdé zúčtování · Dagaz+Nauthiz = úsvit z nutnosti → změna vynucená tlakem · Berkana+Isa = růst pod ledem → zraješ v nehybnosti.
- *Průlom (něco se zlomí, aby vzniklo nové):* Thurisaz+Dagaz = síla protrhne bránu · Hagalaz+Sowilo = po bouři světlo → zkáza uvolní cestu · Nauthiz+Fehu = z nouze bohatství.
- *Stín a světlo (dvě síly v rovnováze):* Sowilo+Isa = světlo zastavené → energie čeká · Mannaz+Hagalaz = člověk tváří v tvář chaosu · Tiwaz+Nauthiz = oběť z nutnosti.

Ostatní (později, decentně): pulzy dominance (element/ætt), bloom fáze, listy (svítící element), sezóna.

---

## 8. STAVBA / ENGINE (jak, ne co)
- **Engine = crown-composer** (`growBranch` / spojitá limba / fraktál / paint / kořeny). **NESAHAT** — měnit jen „kam/co" vyroste, ne „jak" se kreslí. Kopie + snapshot + malé kroky.
- **Proplétání pramenů v kmeni.** Prameny se zkříží jen když amplituda spirály přeroste rozestup drah: `swirl = twist × laneStep × 1,1` vs `laneStep = thickness × bundleSpread`. Při výchozím `twist 0,4` je amplituda **menší** než rozestup → prameny jedou vedle sebe; od `twist ≈ 1,0` se začnou proplétat. ⚠️ Dřív ten efekt vznikal **náhodou z nahuštění** (25 pramenů v jednom svazku); po F0b (pramen = runa, ~9) je svazek řídký, takže se proplétání musí nastavit **záměrně** — páky `twist`/`bundleSpread`/`wobble` jsou proto v panelu KMEN.
- **Inspekce „PROČ" v labu (2026-08-07)** — klik na část stromu vysvětlí, co ten tvar způsobilo: výška a směr rozepsané po složkách (kostra + intention + area + life-rune), velikost (věk pramene × dominance elementu), seznam odboček s počty tažení a graduací, a čím je dán směr kořene. Jména run jsou **klikatelná** → obtáhnou tu větev ve stromě. **Přehled větví (tabulka)** — tytéž hodnoty vedle sebe (runa · tažení · délka · tloušťka · odbočky · graduace), čtou se ze **stejné meta** co inspekce (žádný druhý zdroj pravdy), klik na řádek větev označí. ⚠️ **Klíč do `_pick` musí být STABILNÍ (`t<pramen>_<runa>`), nikdy indexový** (`'t'+_pick.length`) — `_pick` se přestavuje při každém překreslení, takže indexový klíč by odkaz tiše přesměroval na jinou větev.
- **Signálový řetězec čtení→strom HOTOVÝ (kroky 1–5, lab; snapshoty `crown-step1..5`):** element → barva + rodina · spread → expanze (výška/šířka/mohutnost) · intention → výška (Norns: minulost↓/budoucnost↑) · area → strana · **ætt → charakter růstu** (fluid/těžký/přímý) · opakování → zesílí + **stabilní umístění** (0 přeskoků). Pozorovatelnost (HISTORIE, step slider, ULOŽIT→Code přes `_tree_state.json`). Prázdný log = demo strom. Engine (`growBranch`/emergence/paint/kořeny/kmen) celou dobu netknutý. (Detail → RUNAR_DECISIONS „reading-driven" + „Aett".)
- ⚠️ **Stav signálů (2026-07-19).** Osa A (Norny→výška) a osa B (area→strana) byly od nasazení
  do produkce **mrtvé**: renderer četl slugy, klient ukládal lokalizovaný popisek, lookup dal
  `undefined`. V labu to fungovalo, protože si lab vymyslel vlastní slugový slovník a testoval
  ho sám se sebou. **Opraveno dekódováním** popisek→index→slug (`readingsToTreeLog`), osa času
  přešla na jazyk Noren (`urd/verdandi/skuld`). Hlídá smoke ⑬ — nově tvrdí i to, že hodnotě
  **rozumí přijímající strana**, ne jen že dojela. Ze signálů §4 tím žijí **tři**: element,
  ætt, a nově obě osy umístění.
- ⚠️ **Blank/Óðinn mazal celé zaplacené čtení** (do 2026-07-19). Glyf `○` je mimo runový rozsah,
  na který se ptal filtr → prázdný seznam run → řádek se zahodil. Ve stromě po něm nezbylo nic
  a nepočítal se ani do věku. **Opraveno:** dojede jako `el:'shadow'` (§3, studené a skryté runy)
  s příznakem `blank:true`. Od té doby se chová jako **běžná runa Shadow** — účastní se pořadí
  run jako každá jiná. **Vizuál ducha (průsvitnost, bez listů) ZRUŠEN** 2026-07-21 (KUKY:
  „zbytečnost, jsem s tím v míru") — navíc by na reálných datech nebyl vidět (Blank bývá
  outrankovaná ve Shadow). Detail → RUNAR_DECISIONS.md 2026-07-21.
- ✅ **Přehrávání růstu (2026-07-19).** Posuvník nad stromem, krok po JEDNOM čtení, až
  k zakládacímu stavu. Posílá se jen kratší log; věk se počítá z jeho délky, takže strom
  u čtení č. 3 vypadá jako tehdy, ne jako dnešek s méně větvemi. Engine netknutý.
  **Je to měřicí přístroj, ne ozdoba** — bez něj nešlo poznat, jestli změna umístění větví
  vůbec něco udělala, a přesně proto obě osy mlčely dva měsíce.
- ✅ **Runa → tvar (2026-07-19).** Tvarová data (curve/sub/taper/tipc/rhy per runa) byla hotová,
  jen renderer bral tvar podle POŘADÍ větve — takže všichni uživatelé měli stejné siluety.
  Tehdy: n-tá větev elementu = n-tá **nejčastější** runa (pestrost zůstává, ale něco znamená).
  ⚠️ **Pořadí bylo POZDĚJI změněno na „první tažená" (sticky) kvůli blikání siluety — platné pravidlo → §5.**
- ✅ **Inspekce klepnutím (2026-07-19, admin).** Klik na větev řekne runu · element · ætt ·
  svět · počet čtení · kolikátá větev elementu. Aby owner místo „nějaká větev poskočila"
  předal diagnózu. Souřadnice = **poloha na posuvníku**, ne číslo runy.
  Vybraná větev se obtáhne zlatě a **výběr přežije posun posuvníku** — tak jde sledovat,
  jak se JEDNA větev mění v čase.
- ⚠️ **Pořadí run osciluje kolem remízy** → větev překlápí siluetu sem a tam a vypadá to
  jako závada. Tohle už jednou opravené bylo (zmrazením na první viděnou runu) a krok 3
  to zmrazení zrušil. Návrh: hystereze (převzít tvar, až nová runa vede o práh).
  ČEKÁ NA ROZHODNUTÍ. Detail → RUNAR_DECISIONS.md 2026-07-19.
- ✅ **Export stavu (2026-07-19, admin).** Tlačítko zkopíruje log stromu do schránky; owner
  ho vloží do chatu a Code si strom postaví PŘESNĚ. Klíče stejné jako lab, ~9 kB na 168 čtení,
  bez textu čtení. Ověřeno zpáteční zkouškou (rekonstrukce z exportu = shodný otisk).
- ⚠️ **Obraz se mění kolem přepnutí stavu**, pak se ustálí; osm kreseb po sobě je identických.
  Dřívější formulace o nedeterminismu byla širší než co je změřeno. Měření se musí zahřát.
  Nediagnostikováno (vada předchází všem třem krokům, ověřeno i na produkci):
  týž log dá jiný obraz od 3. překreslení. Uživatel uvidí, jak se strom sám změnil bez nového
  čtení; nám to znemožňuje porovnávat obrazy. Detail → RUNAR_DECISIONS.md 2026-07-19.
- 🔒 **PRODUKČNÍ PRINCIP (budoucí pravidlo, až vznikne DB).** Poloha + charakter větve se spočítá
  **JEDNOU při čtení** a uloží do `tree_readings.branch_data`; renderer pak už jen kreslí uložené,
  **NIKDY nepřepočítává z logu.** To je přímý lék na „obraz se mění bez nového čtení" výše — dnes
  se strom skládá při každém otevření tabu z `readings` (regexem), a proto se přeskládá. `tree_state`
  drží souhrn (roots, element_scores, dominant_element, trunk_themes, pattern_cache).
  ⚠️ **Tabulky `tree_readings` / `tree_state` zatím NEEXISTUJÍ** — je to cíl, ne stav.
- **Zbývá ze signálů §4:** váha z počtu vyplněných polí · seeking jako třetí hlas výškové osy (§3A).
  (**Bonus za pauzu ZRUŠEN** 2026-07-19 · **Blank duch-větev ZRUŠENA** 2026-07-21 — obojí retired.)
- **Zbývá (velký směr = owner volba):** **produkce** (DB `tree_readings`/`tree_state` + „spočti jednou, ulož" výše) · nebo **ladit** stávající umístění. Stav labu vlastní `git log` + snapshoty, ne doc (§20.4).
- **Model = vyřešené dilema (§0), ne zámek navždy.** element = kostra, runa = tvář korunní větve (roste z elementu plošně). **Boughs velká přestavba i „per-runa hlubší bough" jsou teď mimo hru** (regrese — RUNAR_DECISIONS 2026-07-04; směr 2026-07-30) — vrátit lze novým datovaným rozhodnutím. Rozsoudili jsme „co je větev", ne že je strom hotový.

---

## 9. MAPA TREE DOKŮ (kde co je + status)
**Po konsolidaci 2026-07-30 jsou ŽIVÉ jen dva tree doky — zbytek je v archivu / BACKLOGu.**

| Doc | Co vlastní | Status |
|---|---|---|
| **RUNAR_TREE.md** (tenhle) | duše + zóny + model + signály + stavba + Gathering | **★ KANONICKÝ — čti první** |
| **RUNAR_TREE_RENDER.md** | materiál / vzhled (jak strom vypadá, art direction) | ŽIVÝ (foundation) |
| RUNAR_DESIGN.md (tree části) | příběh, mytologie, „co část znamená" | ŽIVÝ pro příběh |
| RUNAR_BACKLOG.md | pozastavené tree úkoly (váha polí · živé kořeny · prahy Gatheringu · katalog motivů) | ŽIVÝ (fronta) |
| `docs/archive/tree/` | vstřebané / odložené / historické tree doky | ARCHIV (reference) |

**Konsolidováno do `docs/archive/tree/` 2026-07-30:** `RUNAR_TREE_BUILD.md` · `runar-tree-placement.md` · `RUNAR_TREE_TODO.md` · `RUNAR_TREE_SPECIALS.md` · `runar-tree-forces.md` · `tree-of-life.md` · `runar-patterns.md`. Živý obsah přenesen **sem** (model, signály, Gathering) nebo do **RUNAR_BACKLOG** (úkoly, prahy, katalog motivů). Dřív archivováno (2026-07-04): `RUNAR_TREE_BOUGHS` · `RUNAR_TREE_GROWTH_MAP` · `RUNAR_TREE_HANDOFF` · `RUNAR_TREE_LAB`. Nic se neztratilo — jen uklizeno.

**Historické lab poznámky** = `memory/runar-tree-engine-lab.md` · `memory/runar-tree-living-movement.md` · `memory/runar-trunk-incremental-rule.md` (indexováno v MEMORY.md) + `docs/TREE_BRIEF_CODE_2026-07-04.md`. **Stav labu / enginu vlastní `git log` (prefix `[tree]`) + snapshoty, ne doc** (§20.4).

---
*Když se něco z tohoto změní rozhodnutím → nový záznam do RUNAR_DECISIONS.md + oprava tady (§16). Tento soubor drží „co a proč"; „co zrovna děláme" vlastní `git log` (prefix `[tree]`) + RUNAR_BACKLOG.md.*

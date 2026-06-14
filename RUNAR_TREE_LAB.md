# RUNAR_TREE_LAB.md — Strom života: vizuální engine (lab)
# Doménový dokument TREE session (Fable 5 / Cowork). MAIN session sem needituje.
# CLAUDE.md drží jen krátký ukazatel sem. Detail/iterace patří SEM, ne do CLAUDE.md.
# Living doc — aktualizuj při každém kroku engine. Související: tree-of-life.md (design), RUNAR_DESIGN.md.

---

## Stav (shrnutí)
- ✅ Produkce (logika, MAIN doména): calcLifeRune(), generování + uložení Life Rune, Tree tab UI, IS 3-vrstvý systém, isLifeRune detekce.
- 🧪 Vizuální engine = LAB, NEKOMITOVÁNO do produkce, NENÍ napojeno na DB ani reader — čeká na vizuální schválení.
- ❌ branch systém v produkci, tree_state/tree_readings DB tabulky — čeká na V3.

---

## Rendering engine LAB v0.7 (2026-06-11)
runar-tree-model.js (čistá logika, bez DOM) + runar-tree-render.js (Canvas 2D, dual-canvas, pixelRatio,
Page Visibility) + runar-tree-lab.html (timeline ve dnech, cast tlačítka pro všechny spready, tuning panel).

KMEN: hloubkové vrstvení — fibresPerLayer (6) vláken na vrstvu, nejnovější vrstva k pozorovateli
(depth +0.9, světlejší), nejstarší vzadu (tmavší); vrstvy mírně offset (golden) → kmen neroste do šířky
ale do hloubky. Vlnění weaveAmp/weaveFreq (default 0.009/2.2).
PÁTEŘ: celý kmen se prohýbá v S-křivce (spineAmp/spineWaves); náklon a míra prohnutí řízena
M.setTreeBias(-1..1) = životní runa inner/outer world (0 = vyrovnaný → přímý strom).
SOUDRŽNOST: TUNING.cohesion — vlákna se u země přitahují ke společné páteři (kmen = jeden celek bez mezer),
individualizují se až s výškou, oddělená jsou jen ve větvích.
VĚTVE: oblouky, ne přímky — branchAngle() = blend od tečny hostitele (bendZone) + vnější arc (flowCurve)
+ zvednutí špičky (tipLift). Akvarelová reference.
ATTACHMENT STRATEGIE (pojmenované, přepínatelné v labu, TUNING.attachMode):
· 'ride' (default): nové čtení se napojí na lianu stejného elementu, ~70 % jede kus po ní (opticky ji
  zesílí — sdílený úsek je tlustší), pak se odpojí a vytvoří větev (rideLen)
· 'branch': napojí se bodově, drží sektor hostitele (sectorDir, sectorWidth)
· 'free': v0.5 globální golden fan (pro srovnání)
KŘÍŽENÍ: sektorové směry — větvička zkoumá jen okolí směru svého hostitele.
VÝPLŇ KORUNY: golden alokace exitů + strany alternují; nižší exit → horizontálnější.
BARVY: skutečný jasan — kůra teplá stříbřitě šedá, listy jasanová zeleň (tlumená).
TLOUŠŤKY: rootWidth/trunkWidth/branchWidth multiplikátory.
PAINTERLY RENDERING (v0.7): 3 vrstvy na segment — tmavá kontura pod tělem + tělo + světlý hřbet na straně
světla (zleva shora, LX/LY v rendereru) = kreslený dvojtahový look. Listy = LEAF_CLUSTER trsy (5 lístků,
3 zelené tóny per element) místo jedné elipsy. Jemnější špičky větví (0.55/0.5 px).

## Srovnání dvou variant (2026-06-12)
KUKY se ptal, zda engine vychází z parametrů z jeho dokumentů (render_spec v3 = rekurze+Bezier) nebo jiný
systém. ODPOVĚĎ: liana engine je z fable5_runar_context.md (start/branch_angle/branch_point), NE render_spec v3.
Sémantické mapování (význam→osa) z tree-of-life.md nebylo zapojeno — směr větve řídil golden alokátor.
→ Dvě verze pro porovnání:
· LIANA v0.7 (zmrazená): v2/tree-snapshots/v07-liana/ — golden harmonie, bez sémantiky
· HYBRID: v2/tree-lab-hybrid/ — liana vzhled + Norns-osové řízení (build_tree_hybrid.py patchuje v0.7 model).
  Význam (intention+area+mood+heavy / axisHint) → elevation [-1,1] (urd dolů/ven · verdandi strany · skuld
  nahoru) + laterality (inner=vlevo/outer=vpravo). TUNING.semanticWeight (0=harmonie, 1=čistý význam,
  default 0.8) — slider v labu. Norns spread: 3 runy = explicitní axisHint urd/verdandi/skuld. Ověřeno: slider mění tvar.
Hlavní lab v2/runar-tree-lab.html zůstává = liana v0.7. Generátory: build_tree_lab.py (liana), build_tree_hybrid.py
(hybrid). Stále NEKOMITOVÁNO — KUKY porovnává, která cesta je lepší.

## V3 SKELETON (2026-06-12, RUNAR_FABLE5_CONTEXT.md)
v2/tree-lab-v3-skeleton/ (build_tree_v3.py, vlastní namespace RunarTree3Model/Renderer). Model kostra+rekurze:
kmen = PODSTATA (3 Norns kořeny se splétají vzhůru do sloupu — braid, + Life Rune seed knot, charakter kmene
z Life Rune čísla), koruna = AKTIVITA (čtení = krátké rozhodné větve z růstových bodů, rekurzivně, level cap 5,
growth budget maxKids 3 — anti brokolice). Větve se liší ÚHLEM ne délkou (délka jen ±15 % šum). Runové signatury
v tvaru větve (curve/sub/taper, RUNE_SHAPE tabulka) — ZÁMĚRNĚ jemné, slider runeSignature (KUKY: skryté, uživatel
je má hledat). Kořeny jen o trochu tmavší (nízké ct, KUKY). Velká čtení (horseshoe/yggdrasil) zakládají VLASTNÍ
kořenovou linii za kmenem až do země (vzácná „liana"). Kmen tloustne pomalu logaritmicky s korunou (trunkGrowth)
— podstata nese aktivitu, není z ní. Sémantická elevace (osa→výška napojení) přenesena z hybridu. Bez záblesků
na špičkách (dle dokumentu). Rozcestník v2/tree-lab-index.html = 3 karty.
PRODUKČNÍ PRINCIP (domluveno): pozice větve se počítá JEDNOU při čtení a ukládá do tree_readings.branch_data
— nikdy nepřepočítávat, jinak se lidem přeskládají stromy.

## TRUNK COMPOSER v3 — UNIFIED LIMB ENGINE (2026-06-12, KUKY finta „kmen postav stejně jako větve/kořeny")
v2/tree-lab-trunk-composer/ (build_trunk_composer.py). PRAMEN = JEDEN spojitý limb: kořenová špička (hluboko,
rozvětřená) → báze → nahoru přes kmen → vrchol. Stejný tapered-limb engine jako větve/kořeny. KMEN = JEDNO TĚLO
skrz PŘEKRYV (laneStep = baseW * bundleSpread < baseW → strandy se překrývají) + painterly hloubka (střed
k pozorovateli, kraje dozadu = oblý válec); švy = rýhy kůry. NAPOJENÍ kořen↔kmen je AUTOMATICKÉ — kořen je
spodek téhož limbu, kmen jeho střed, žádný šev/hrdlo (vyřešena KUKYho close-up stížnost na „twist/fray" u země).
Báze flare vzniká sama (strandy se dole rozevřou do kořenů). Envelope+fibres hack ZAHOZEN. Sub-kořeny napojené
jako větve (obrázek 3). Náklon C vrací se k vertikále, charakter = life rune + DOB otisk. strands 3/6/9/14 =
tloustnutí. Slidery vč. bundleSpread (překryv) a contour (rýhy). Ověřeno na 3/6/9 — drží jako jedno tělo.
5. karta v indexu.
POZN.: tento limb engine je teď SPOLEČNÝ základ pro kořeny+kmen+větve → sjednotit i v hlavním stromu (v3.x) při dalším kroku.

## PER-ELEMENT VĚK (2026-06-12, KUKY architektonické rozhodnutí)
KAŽDÝ element (pramen, kořen, větev) má vlastní birthDay a od dne 1 roste do VŠECH rozměrů (tloušťka+délka)
logaritmicky, nikdy úplně nezastaví (ageSize: minSize→1 přes matureDays, křivka 1-(1-f)^1.7). Nový element vzniká
v minSize mezi staršími velkými → automatická VIZUÁLNÍ ROZMANITOST + strom viditelně stárne (retence). LIŠÍ se
od bloom (bloom = hodiny, jeden objev; per-element věk = měsíce/roky, trvalý růst). Demo v Trunk Composeru:
TREE AGE timeline, founding 3 prameny den 0 + 1 pramen/strandEvery dní, každý vlastní věk. Ověřeno: den 14 =
štíhlý stromek 3 prameny, 2 roky = 7 pramenů (staré tlusté + mladé tenké). Slidery: treeAge, strandEvery,
matureDays, minSize. PLATÍ pro kmen+větve+kořeny v hlavním stromu — nahrazuje globální S scale z v3.2.
OPRAVY (2026-06-12 v2): TLOUŠŤKA roste KONTINUÁLNĚ (log bez stropu, ageThick = minSize + K*log(1+age/(mature/2))
→ starý vždy viditelně tlustší, neplateauje); DÉLKA saturuje (ageLen 0.5→1.0, přirozený dosah). STABILITA:
rootDir/hloubka/lane závisí JEN na indexu pramene (ne na strandN) → přidání pramene NEPŘESKUPÍ existující kořeny.
Ověřeno: pramen 0 identický při 5 i 8 pramenech (400 vs 800 dní).

## BALANCE WARNING (návrh feature, 2026-06-12, KUKY)
Počítat větve vlevo/vpravo; když jedna strana dominuje (uživatel pořád čte na stejnou Area of Life) → Strom
života upozorní „nejsi v rovnováze" + navrhne přesun pozornosti na jiné oblasti života. Detekce + zpráva
(příbuzné The Gathering). Tree fáze.

## ROZHODNUTÍ pre-reading formulář (2026-06-12, KUKY)
HOW ARE YOU FEELING (mood) = ZRUŠIT (nejslabší, dekorativní). THIS READING IS FOR (intention) = NECHAT (mění
výklad). Area of Life + What seeking = otevřené ke změně/rozšíření. POZOR: produkční změna (runar-reader.html
+ _moodContext/_intentionContext v runar-character.js + startReading + parts[] + §13 full-path) — NEPROVEDENO,
čeká až po dokončení stromu. (= MAIN doména, koordinovat.)

## NORNS frekvence (park)
Norns je u reálných uživatelů jedno z nejčastějších čtení → najít vzorec jak často ho člověk dělá a tlumit
příliš rychlý růst kořenů/kmene/větví.

## BRANCH COMPOSER (2026-06-12)
v2/tree-lab-branch-composer/ (build_branch_composer.py). Izolovaný nástroj na SLOVNÍK TVARŮ jedné větve —
KUKYho herní přístup: nejdřív postav jednotku v izolaci, pak řeš spawn mapu. Vybereš runu → vidíš intrinsic
placement (aett→osa, world→výška, element→sub-větev) + přidáš area/intention/mood a koukáš jak se větev natočí.
Grid view = všech 25 run (24 + Óðinn). runar-branch.js = shape engine (RUNES tabulka s aett/world/element +
curve/sub/taper signaturou; ELEMENT_ARCH archetypy; buildBranch(spec,T)) — tohle bude strom později importovat.
Tvar = vlastnosti + ladění (NE z glyfu — rozhodnuto). Óðinn runa zahrnuta (tvar připravený, na doplnění symetrie).
RÁMEC PLACEMENTU (zafixováno, viz RUNAR_TREE_GROWTH_MAP.md): kostra = aett (3 osy, intrinsic), sub-větve = element
(statisticky), area/intention/mood = jen směrování; čas (Norns) = výšková modulace (world + intention/mood, už
namapováno v datech); barvu NEŘEŠÍME. Otevřené (placement fáze): area→úhel seedovaný vs pevný; živé kořeny
(Norns re-draw = většinou prodloužení, sub-kořen občas); blank/multi-element detaily.

## V3.2 (2026-06-12, syntéza — KUKY: „k tomuhle se snažíme dostat")
PRAMEN = JEDNA spojitá cesta kořen→kmen→HLAVNÍ VĚTEV. Kmen a hlavní větve navazují z konstrukce (da Vinci by
design) — kmen je široký od kořenového uzlu po místo, kde se pramen odpojí, a nahoru se přirozeně zužuje jak
prameny odcházejí (EXIT_SEQ výšky 0.55-0.95, spodní výstupy horizontálnější a delší). Prvních 6 pramenů vedle
sebe (LANE_SEQ), pramen 7+ = PŘEDNÍ 3D vrstva (frontDepth). 6-7 hlavních větví ≈ 2+ roky uživatele (sim kadence:
horseshoe 2×/rok, yggdrasil 1×/rok → +3 prameny/rok). SYMPATHY slider (0.5 = souhlasné zakřivení sousedů
z 40-60 % — KUKY). TOPOLOGICKÉ umístění: hostitel + bod úchytu jen ze seedů a struktury (nikdy z pixelů),
podmínka c.createdAt <= n.createdAt — OVĚŘENO: 0 ze 158 větví se pohnulo po +1 roce. Kořeny zrcadlí korunu:
1 hlavní kořen per pramen (automaticky), rootEcho 0.5 (kořínky = polovina čtení — KUKY). Žádné copy-paste
obrázku — hledá se vlastní styl.

## V3.1 (předchozí iterace)
KMEN = liana prameny (těsné, sdílená fáze, ŽÁDNÝ keltský cop — KUKY veto). VELKÉ ČTENÍ (horseshoe/yggdrasil)
= NOVÝ pramen kmene (kořen pod zemí → šplhá kmenem, bloom viditelný) → kmen roste rok za rokem (3→~8 pramenů/rok).
Kostra se prodlužuje s věkem (scafExtend, log) = místo pro nové větve. Crowding RANKUJE hostitele (penalizace,
nikdy neveto — bug: bestScore=-1 shazoval 134/160 větví, fix -Infinity). ROOT ECHO: každé čtení zrcadlí kořínek
na kořenový systém (rootEcho slider) — jak nahoře tak dole. AGE SCALE: stromek (minScale 0.58) → dospělý
(ageSpan ~300 čtení ≈ 1 rok používání ≈ 100 let stromu). Lab: AUTOMAT (náhodné runy/oblasti) + ČASOZBĚR tlačítka
+1 měsíc/+1 ROK (reálná kadence: singles ob den, horseshoe kvartálně, yggdrasil ročně). Life layer throttle 12 fps
(tisíce listů). window._r = debug handle. ESTETIKA (zásady): asymetrická rovnováha (ne symetrie), da Vinci taper
(dítě ~0.7 rodiče), gradient hustoty, chuchvalce s okny, jedno gesto na větev. Ověřeno na 184 čteních (1 rok).
_savepng.js = node helper (port 7799) pro screenshoty když preview_screenshot timeoutuje na velkém stromu.

## Společné prvky (napříč verzemi)
KOŘENY: integrátor se silnou seeded křivostí — rozbíhají se do všech stran (rootFan), kroutí (rootCurl), kříží
a proplétají (depth osciluje podél kořene); golden walk směrů.
KORUNA: scaffoldFan pro hlavní větve do stran, crownFan + user.crownBias = asymetrie; attached větve pokračují
podél hostitele ven (mix host tangent + fan dir), ne nahoru.
M.TUNING (16 parametrů, slidery v labu) · M.setUserSeed() = per-user strom.
Páry: love (srdce, heartSize) + flame (proplet kolem osy, flameSize/flameWaves).
Bloom: silhouette→growing→full→leafing, parent/child gating. Barvy: stříbrná kůra jasanu + element tint ke špičce, modro-černé listy.
Generátor: build_tree_lab.py (§1).

---
Design (mytologie, branch objekt, Gathering, AETTY) → tree-of-life.md + RUNAR_DESIGN.md.

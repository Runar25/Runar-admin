---
name: runar-tree-engine-lab
description: "Stav a rozhodnutí Tree of Life rendering enginu (lab, 2026-06-11)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 174bab46-0d9e-4850-99aa-cc0917e4046f
---

⭐ MASTER HANDOFF (čti první při pokračování): C:\Users\zkuku\Downloads\Runar-admin\
RUNAR_TREE_HANDOFF.md — kompletní stav, laby, pravidla, defaulty, další kroky.
Placement analýza: RUNAR_TREE_GROWTH_MAP.md. Vše standalone laby, nic v DB/readeru.

⭐⭐ OPRAVA 2026-07-04 (po zbytečném kruhu — NEOPAKOVAT): KUKYho schválený „pěkný
strom" = **crown-composer** (`v2/tree-lab-crown-composer/`, treeage ~520–1600 =
S-kmen + kořenový vějíř + větve postupně po výšce + jemná fraktální koruna, stříbrná
kůra). To je BÁZE, staví se na ní. NENÍ to liana (`v07-liana` = kostnatá 7-lian
ZAVRŽENÁ hrůza) ani boughs. **Boughs = regrese z crown-composeru** (můj WIP, slepá
ulička): zone-blend `frac=lerp(emergence, zoneFromAxis(průměr-osy-elementu), 0.5)`
scvrkl vertikální rozptyl na ~¼ → „všechny větve z jednoho místa"; navíc kořeny
změněny na „3 spletené Norny" místo vějíře + přidány members. SMĚR: pokračovat na
crown-composeru, po malých krocích; zóna má být JEMNÝ posun výšky (jako liana
`branch_point`: past→níž / future→výš), NE destruktivní blend. Render trik (velký
strom sekne preview_screenshot): canvas → POST base64 na `localhost:7799` → čti
`_tree_shot.jpg`. Boughs lab se musí nejdřív ručně založit (Norns 3 runy).

Rúnar Tree of Life rendering engine existuje jako LAB v0.2 (2026-06-11) v
`C:\Users\zkuku\Downloads\Runar-admin\v2\`: `runar-tree-model.js` (čistá logika,
bez DOM — React Native ready), `runar-tree-render.js` (Canvas 2D, dual-canvas),
`runar-tree-lab.html` (mock data + time-travel slider). Generuje se přes
`build_tree_lab.py` (pravidlo §1: JS jen přes Python skripty).

**Why:** KUKY rozhodl (2026-06-11): engine stavět nad mock daty, jako standalone
test stránku, DB tabulky tree_state/tree_readings až později. Vizuál: základ
stromu = stříbrná kůra jasanu s modro-černými listy (Yggdrasil), elementární
barvy (fire/water/air/earth) jen jako nádech sílící ke špičce větve — NE plné
syté palety. Repo CLAUDE.md (Downloads\Runar-admin) je zdroj pravdy, starší
kontextové dokumenty na Desktopu jsou archivní (spready už jsou v produkci).

RÁMEC PLACEMENTU zafixován (2026-06-12, RUNAR_TREE_GROWTH_MAP.md v repu):
kostra koruny = AETT (3 osy, intrinsic každé runě — freya teplá/up, heimdall
stínová/kořeny, tyr plynoucí; 8 run každá), sub-větve = ELEMENT (statisticky),
area/intention/mood = JEN směrování (volitelné). Klíč: třídicí osa musí být
intrinsic runě, protože area/intention jsou optional → nemůžou být kostra.
World (asgard/midgard/hel) = intrinsic VÝŠKA, byl v datech nepoužitý, zapojit.
Čas (Norns) = výšková modulace, ne kostra. BARVU NEŘEŠÍME (KUKY).

PER-ELEMENT VĚK (2026-06-12, KUKYho architekt. nápad, má z toho radost): každý
element (pramen/kořen/větev) má vlastní birthDay, od dne 1 roste do všech rozměrů
(tloušťka+délka) logaritmicky, nikdy nezastaví. Nový element vzniká malý mezi
staršími velkými → automatická vizuální rozmanitost + strom viditelně stárne
(retence). Liší se od bloom (hodiny) — tohle měsíce/roky. Demo v Trunk Composeru
(TREE AGE timeline). Platí pro kmen+větve+kořeny, nahrazuje globální S scale.
Ověřeno: den 14 štíhlý 3 prameny vs 2 roky 7 pramenů (staré tlusté+mladé tenké).

CROWN COMPOSER v2 (2026-06-14, PŘEPSÁNO — schválená kostra "kostra sedi"):
v2/tree-lab-crown-composer/ (build_crown_composer.py). SYSTÉM: koruna NENÍ samostatná —
hlavní větev = POKRAČOVÁNÍ PRAMENE kmene (pramen = kořen→kmen→hlavní větev, jeden spojitý
limb → spojitelné Z KONSTRUKCE; můj dřívější "větev na generickém pahýlu" KUKY zamítl: "když
se to rozdělí, nepůjde spojit"). Crown composer KONZUMUJE oba enginy READ-ONLY, NEMĚNÍ je:
RunarTrunk.buildTrunk (prameny = limby končící na topY) + RunarBranch.buildBranch (jedna
instance limbu na KAŽDOU větev). Z vrcholu každého pramene vyroste hlavní větev (role main,
spec.ox/oy/baseAng), šířka báze srovnaná na vrchol pramene = BEZEŠVÉ napojení. Děti = role
sub/twig, vyrůstají z rodiče = FRAKTÁL (slidery maxDepth/childN/levelRatio/childWidth). Roste
v zámku s kmenem: 3 prameny→3 hlavní větve, +1 pramen→+1 (7 při 2 letech). Branch engine
ROZŠÍŘEN přírůstkově: buildBranch má volitelné spec.ox/oy/baseAng (default null = bit-identické
se starým → Branch Composer NEDOTČENÝ, ověřeno). KUKY zásady 2026-06-14: držet JEDNODUCHÉ
(min. šance rozbití); horizont ~3 roky stačí; hlavní větve principiálně rostou donekonečna.
KROK (b) = aby celá struktura DO SEBE ZAPADALA (fraktální patra), AŽ PAK ohyb/délka/počty.
Starý standalone crown engine (runar-crown.js) ZAHOZEN → tree-snapshots/crown-engine-v1/.
Schválená kostra → tree-snapshots/crown-skeleton/. PERMANENTNÍ SERVER: serve.bat v rootu
(spustí http.server 7788 + _savepng.js 7799; KUKY pustí a nechá běžet nezávisle na session).
INKREMENTY koruny (2026-06-14, KUKY schválil postupně, "uplna parada presne jak jsem chtel"):
(1) HLADKÉ NAPOJENÍ — každý limb (main z kmene, sub z mainu, kořenová odbočka) ZAČNE podél
TEČNY rodiče a ohne se k cíli → vyrůstá z rodiče, žádná ostrá hrana (jako kořeny/branch engine).
buildBranch dostal volitelný spec.dev (start=base, theta0=base+dev); default null = beze změny.
"Kmen = přerostlá větev" → stejné pravidlo všude. (2) RŮST DO VÝŠKY — topY age-driven
(crown composer si počítá, trunk engine nedotčen) → rozprostře výstupy pramenů. (3) KOŘENOVÉ
ODBOČKY — fraktál jako koruna, dolů/ven, tmavé (tipLift 0), cílově ~50 % koruny (slider attachN).
REINFORCEMENT MODEL (2026-06-14, KUKYho klíčová myšlenka): NE každé čtení = nová větev.
Nové prameny rostou LOGARITMICKY (targetN = lerp(linearN, logN, reinforce)) → ustálí se ~9-12,
KONEC SHLUKU. "Extra" prameny NEvyrostou jako větve — zůstanou jako HMOTA KMENE (mohutnost) +
jejich kořeny. Slider "reinforce" (default 0.8 = málo mohutných širokých větví, KUKYho vkus
z devítky) + "canopy" (výška↔šířka). buildBranch dostal i volitelný spec.twist (default 0).
PRODUKCE (zatím nezapojeno): každá větev má CHARAKTER (zakl. runa→element/ætt/world); jednoruná
čtení se ZAŘADÍ do větve dle charakteru = posílí ji; vícerunová (Norns/Kříž/Horseshoe/Ygg) =
EXPANZE dle podstaty (oheň/vzduch/Ásgard→výška, voda/země→šířka, stín/Hel→kořeny/mohutnost).
Spočítat jednou, uložit branch_data. Snapshoty: tree-smooth (po #1), tree-reinforce (po modelu).
Trunk DOKONČEN: tree-snapshots/trunk-final/ (twist auto max 0.4, rib po 1.5r, buttress od
půlky, rootFan do -2, per-element věk). KUKY "nechme tuhle verzi být".
6 karet v tree-lab-index.html (Crown/Trunk/Branch/V3/Hybrid/Liana).

TWIST + KOŘENY (2026-06-12, přírůstkově po revertu): schválená lane-based verze
("je to ona") + TWIST jako opt-in slider (default 0 = beze změny; swirlX/swirlD
na laneX, prameny se vinou kolem osy = spirálové dřevo). Kořeny vyčištěny:
monotónní vějíř dle lane (bez křížení), depth stagger ((s%3) front/back = místo
pro všechny), mladší mělčí/u povrchu, sub-kořen ven (no cross-back), vychází
přirozeně z báze (spojitý limb). Baseline před twistem: tree-snapshots/trunk-good/.
Viz [[runar-trunk-incremental-rule]].

TRUNK COMPOSER v3 = UNIFIED LIMB ENGINE (2026-06-12, KUKYho finta): kmen postaven
stejným tapered-limb engine jako větve/kořeny. PRAMEN = jeden spojitý limb
kořen→kmen→vrchol. Kmen = jedno tělo skrz PŘEKRYV strandů (laneStep<baseW) +
painterly hloubku (válec). Napojení kořen↔kmen automatické (kořen=spodek limbu),
žádné hrdlo/šev — vyřešilo KUKYho close-up stížnost. Envelope hack zahozen.
DŮLEŽITÉ: limb engine = společný základ kořeny+kmen+větve → sjednotit i v hlavním
stromu. Slidery bundleSpread (překryv) + contour (rýhy). Ověřeno 3/6/9.

Předchozí TRUNK v2 (envelope, překonáno): KUKY "tři prameny k sobě nesedí, mají tvořit
jeden celek". OPRAVA: kmen = JEDNO TĚLO (envelope svazku vyplněn jako hmota +
vnitřní vlákna válcově stínovaná = oblý sloup), NE samostatné kabely. KOŘENY =
engine větví otočený dolů (tapered limby + sub-kořeny napojené jako větve,
"obrázek 3"), flow kmen→kořen plynulý, báze flare, no neck. Diagnóza špatného
v1 (zapsáno): N rovnoběžných čar = kabely, nesplývaly, ploché, root pinch.
Charakter = life rune + DOB otisk, C-náklon vrací se k vertikále. strands=
tloustnutí. Projasněno (value). v2/tree-lab-trunk-composer/, build_trunk_composer.py.
ROZHODNUTÍ KUKY (2026-06-12): mood ZRUŠIT, intention NECHAT (mění výklad),
area+seeking otevřené ke změně. Produkční změna formuláře čeká až po stromu (§13).
BALANCE WARNING feature (návrh): počítat L/R větve, při převaze upozornit
"nejsi v rovnováze" + navrhnout jiné oblasti (tree fáze). NORNS frekvence:
tlumit rychlý růst u častého používání (park).

BRANCH COMPOSER postaven (2026-06-12): v2/tree-lab-branch-composer/
(build_branch_composer.py, runar-branch.js + branch-composer.html). Izolovaný
nástroj na slovník tvarů — KUKYho herní přístup (jednotka v izolaci, pak spawn
mapa). Runa→tvar z vlastností+ladění (NE glyf), Óðinn zahrnuta. Single + grid
view (všech 25). 4. karta v tree-lab-index.html. Další: ladit tvary run v
Composeru, pak řešit placement (area→úhel seedovaný vs pevný — neurčeno).
Sezóna zahozena, Skuld průhlednost param-only, živé kořeny = prodloužení+občas sub.

V3.2 (2026-06-12) — SYNTÉZA, KUKY: "k tomuhle se snažíme dostat, akorát najít
náš styl". Pramen = jedna spojitá cesta kořen→kmen→hlavní větev (liana princip
vyhrál — kmen a větve navazují z konstrukce). Kmen tloustne od kořenového uzlu
po výstup pramene, prameny odcházejí v různých výškách (spodní horizontálněji),
6 vedle sebe + 7. a další DOPŘEDU (3D vrstva). 6-7 hlavních větví ≈ 2+ roky.
Sympathy 0.5 (souhlas sousedů jen 40-60 %). TOPOLOGICKÉ umístění (ze seedů, ne
z pixelů, c.createdAt<=n.createdAt) — ověřeno: 0/158 větví se pohnulo po +1 roce
(předtím se větve přeskupovaly = KUKYho stížnost). Kořeny zrcadlí korunu: hlavní
kořen per pramen, rootEcho 0.5. KUKY popis testovacího obrázku = ověření shody
vidění (tree-of-life art: kontinuita pramenů, rytmus, da Vinci taper).
Pozn. nástroje: _savepng.js node helper (7799) občas zatuhne — restart;
generátor build_tree_v3.py čte HTML z DST = patche musí být idempotentní.

V3.1: keltský cop kmene = TVRDÉ VETO KUKYho
("tohle je šílenost!") → kmen = liana prameny těsně vedle sebe. Velká čtení
(horseshoe/yggdrasil) = nový pramen kmene → kmen viditelně roste rok za rokem
(retence: rychlost ~100 let stromu / 1 rok používání, ash žije 300-400 let).
Kostra se prodlužuje s věkem (vytváří místo — KUKYho postřeh o limitu shlukování),
root echo (kořínky zrcadlí korunu — princip Yggdrasilu), age scale stromek→dospělý,
lab automat + časozběr (+1 rok simulace; KUKY: dospělý vzhled je důležitější než
pěkných pár větví za 45 dní). Estetika dle KUKYho otázky: asymetrická rovnováha,
da Vinci taper, gradient hustoty, chuchvalce+okna, gesto. Bug fix: pickHost
bestScore=-1 → -Infinity (crowding nesmí vetovat). _savepng.js (port 7799) =
screenshot helper, preview_screenshot na velkém stromu timeoutuje.

Starší: TŘI VARIANTY KE SROVNÁNÍ (2026-06-12). V3 SKELETON
(v2/tree-lab-v3-skeleton/, build_tree_v3.py, RUNAR_FABLE5_CONTEXT.md) — kostra +
rekurzivní větvení: kmen = podstata (3 Norns kořeny spletené do copu + Life Rune
seed), koruna = aktivita (krátké větve z růstových bodů, úhel nese rozdíl, NE
délka). Velká čtení zakládají vlastní kořenovou linii (vzácná liana). KUKY
korekce: runové signatury SKRYTÉ (slider runeSignature ~0.45, uživatel je má
hledat), kořeny jen o trochu tmavší. Moje schválené dodatky: growth budget
(maxKids, anti brokolice), délkový šum ±15 %, log tloustnutí kmene (trunkGrowth),
PRODUKČNÍ PRINCIP: branch_data ukládat při čtení, nikdy nepřepočítávat.
Rozcestník: v2/tree-lab-index.html (3 karty). KUKY: "zatím budeme zkoušet" —
všechny tři laby žijí vedle sebe pro porovnání.

Předchozí stav: KUKY se ptal, zda strom vychází z jeho
dokumentů. ODPOVĚĎ (důležité): liana engine je z fable5_runar_context.md
(start_angle/branch_angle/branch_point), NE z render_spec v3 (rekurze+Bezier).
Sémantické mapování význam→osa z tree-of-life.md nebylo do liany zapojeno —
směr větve řídil golden alokátor harmonie. KUKY rozhodl: liana zachovat + postavit
hybrid pro srovnání, "význam vede, harmonie uhlazuje".
· LIANA v0.7 zmrazená: v2/tree-snapshots/v07-liana/ (golden, bez sémantiky).
· HYBRID: v2/tree-lab-hybrid/ (build_tree_hybrid.py patchuje v0.7 model). Norns osy:
  význam (intention+area+mood+heavy nebo axisHint) → elevation -1..1 (urd dolů/ven,
  verdandi strany, skuld nahoru) + laterality inner/outer (vlevo/vpravo).
  TUNING.semanticWeight slider (0 harmonie .. 1 čistý význam, default 0.8). Norns
  spread = 3 runy s explicitním axisHint urd/verdandi/skuld. Ověřeno funkční.
  Hlavní lab v2/runar-tree-lab.html = pořád liana v0.7.

v0.7: painterly rendering — 3 vrstvy na segment (tmavá kontura + tělo + světlý hřbet
od světla zleva shora), listové trsy LEAF_CLUSTER (5 lístků, 3 tóny), jemnější špičky.
Pozn.: preview screenshot se občas zasekne (timeout) — řeší restart preview serveru.
Historie v0.6:
— ATTACHMENT STRATEGIE pojmenované a přepínatelné v labu (KUKY chtěl zkoušet
  a porovnávat): 'ride' (default — napojí se na lianu stejného elementu, jede
  kus po ní = opticky ji zesílí, pak se odpojí do větve), 'branch' (sektor
  hostitele), 'free' (globální fan). Sektorové směry = řešení křížení.
— VĚTVE: oblouky se zvednutými špičkami (flowCurve + tipLift), ne přímky.
  Reference: akvarelový strom 4 elementů.
— KMEN: cohesion — vlákna se dole přitahují, kmen = jeden celek bez mezer.
— BARVY: skutečný jasan (teplá stříbro-šedá kůra, zelené listy) — NE už
  modro-černé listy.
— M.setTreeBias(-1..1): životní runa inner world → náklon doleva, outer →
  doprava, vyrovnaný (0) → přímý strom. Slider v labu.
— Tloušťky rootWidth/trunkWidth/branchWidth. 27 tuning sliderů celkem.
Starší historie (v0.4/0.5): páteř S-křivka (bílá čára KUKYho), bendZone
ohyby, golden výplň koruny, hloubkové vrstvení kmene, integrátor kořenů.
— KMEN: hloubkové vrstvení, 6 vláken/vrstva (TUNING.fibresPerLayer), nejnovější
  vrstva k pozorovateli (světlejší), starší dozadu (tmavší), vrstvy mírně offset
  — kmen roste do hloubky, NE do šířky. Vlnění výrazné a parametrické.
— KOŘENY: integrátor s velkou křivostí, do všech stran, kříží se a proplétají
  (reference: Adobe Stock 580498843). rootFan/rootCurl/rootLen.
— KORUNA: vzdušná, asymetrická (user.crownBias), hlavní větve do stran
  (scaffoldFan), attached větve pokračují ven podél hostitele — ne nahoru.
— M.TUNING = 16 živých parametrů se slidery; M.setUserSeed() = per-user strom.
— Páry: love (srdce, malé) + flame (proplet kolem osy). Timeline ve dnech,
  cast tlačítka single/trojice/norns/cross/horseshoe/yggdrasil.
KUKY preference: nikdo nedělá 10 singles najednou — simulovat denní používání;
strom nesmí být symetrický, má vypadat jako strom; myslet dopředu na 300 čtení.

**How to apply:** Další krok = vizuální schválení KUKYm, pak ladění tvarů a
napojení na reálná čtení + DB. Nekomitováno — commit až po schválení. Bloom
nikdy z Date.now(), jen ServerClock (server čas). Parent/child gating: child
startuje až parent dokončí bloom (effectiveStart rekurzivně).

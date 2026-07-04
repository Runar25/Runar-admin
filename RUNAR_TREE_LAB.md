# RUNAR_TREE_LAB.md — Strom života: vizuální engine (lab)
# ⭐ NA ČEM SE STROM TVOŘÍ (kanonická definice, Norns osa) → RUNAR_TREE_BUILD.md (v1.0, 2026-06-15).
#    Tento soubor = JAK se to kreslí (engine/iterace). RUNAR_TREE_BUILD.md = Z ČEHO (vstupní mapování).
# Doménový dokument TREE session (Fable 5 / Cowork). MAIN session sem needituje.
# CLAUDE.md drží jen krátký ukazatel sem. Detail/iterace patří SEM, ne do CLAUDE.md.
# Living doc — aktualizuj při každém kroku engine. Související: tree-of-life.md (design), RUNAR_DESIGN.md.
#
# SDÍLENÁ DATA (runa → růst): kanonické atributy run (runar-runes.js: aett/world/element/keywords)
# + config (AETTY, SPREAD_CONFIG.norns_axis, MOODS/INTENTIONS) čteš odsud, ale jsou SDÍLENÉ s readingem.
# Růstové/tvarové mapování drž ve VLASTNÍM runar-branch.js. Když musíš editovat runar-runes.js/config:
# jen ADITIVNĚ, §1 (Python skript), [tree] malý commit + push hned + řádek do MEMORY.md. Viz CLAUDE.md koordinace.

---

## Stav (shrnutí)
- ✅ Produkce (logika, MAIN doména): calcLifeRune(), generování + uložení Life Rune, Tree tab UI, IS 3-vrstvý systém, isLifeRune detekce.
- 🧪 Vizuální engine = LAB, NEKOMITOVÁNO do produkce, NENÍ napojeno na DB ani reader — čeká na vizuální schválení.
- ❌ branch systém v produkci, tree_state/tree_readings DB tabulky — čeká na V3.

---

## TREE COMPOSER v2 — AKTUÁLNÍ (2026-06-14) ⭐
v2/tree-lab-crown-composer/ (build_crown_composer.py). JEDEN laditelný strom (kořeny+kmen+koruna),
3 tuning panely (KORUNA/KMEN/KOŘENY). KONZUMUJE oba enginy READ-ONLY, nemění je:
RunarTrunk.buildTrunk (prameny+kořeny) + RunarBranch.buildBranch (jeden limb/větev).
Rozhodnutí KUKY "jeden lab, 2 enginy uvnitř" (ne monolitický přepis = nižší riziko).
- **Větev = pokračování pramene** (kořen→kmen→hlavní větev, spojitelné z konstrukce).
- **STAGGERED EMERGENCE**: pramen opustí kmen ve své výšce → kmen se zužuje vzhůru (da Vinci),
  větve v patrech, žádný pinch. Zakládací 3: vůdčí (přední pramen) NAHORU + 2×~45°; další vyplní patra.
- **HLADKÉ NAPOJENÍ**: každý limb ZAČNE podél tečny rodiče a ohne se k cíli (buildBranch spec.dev,
  default null = beze změny). Platí na main z kmene, sub z mainu, kořenovou odbočku. "Kmen=přerostlá větev".
- **RŮST DO VÝŠKY**: topY age-driven (crown composer počítá; trunk engine nedotčen) → rozprostře výstupy.
- **KOŘENOVÉ ODBOČKY**: fraktál jako koruna, dolů/ven, tmavé (tipLift 0); ~40-50 % koruny (slider attachN).
- **REINFORCEMENT MODEL** (KUKYho klíč): NE každé čtení = nová větev. targetN = lerp(linearN, logN, reinforce)
  → málo větví (konec shluku). Extra prameny = HMOTA KMENE (mohutnost), ne nové větve. Slider reinforce
  (default 0.8 = málo mohutných širokých, KUKYho devítka) + canopy (výška↔šířka).
- **JUNCTION**: kořeny nesou tloušťku kmene (junctionThick, fat náběhová pata) + rootFan default -1
  (KUKYho oblíbený rozjezd) → báze splývá s kořeny v jeden mohutný celek (vyřešen šev/krk).
- buildBranch rozšířen jen ADITIVNĚ + opt: spec.ox/oy/baseAng/dev/twist (vše default = Branch Composer beze změny, ověřeno bit-identicky).
ROUTING DEMO (2026-06-14, HOTOVO v labu): simulovaný proud čtení → strom se skládá podle CHARAKTERU.
routing(seed,nR,diversity) v crown composeru: téma = ELEMENT (5); těžké téma se dělí na 2-3 mainy (mighty
→ sourozenci); slabá témata (<4 čtení) = šum (nestanou se větví). Pozice: element→úhel (fire nahoru, air/water
strana, earth/shadow dolů) + world→výška emergence + tiery dolů (k*0.05). Vigor (počet čtení tématu) → délka/
tloušťka/hustota větve = POSÍLENÍ. Vícerunová big spready → EXPANZE: fire/air→výška, water/earth→šířka(canopy),
shadow→mohutnost. STABILNÍ: témata řazená dle prvního výskytu (compute-once princip). Slider "diversity"
(0=soustředěný=pár mohutných/jeden směr, 1=pestrý=vyvážený plný baldachýn). INFO ukazuje profil (portrét).
Pomocné hashStr/mulberry32 lokálně v crown composeru (enginy je neexportují). element tint barví větve dle tématu.
PRODUKCE (další krok, KOORDINOVAT s MAIN — sdílená sémantika): reálné čtení rozhodne routing místo simulace
(jednoruná→do větve dle charakteru=posílí; vícerunová=expanze). Spočítat jednou → branch_data. Routing logiku
držet v runar-branch.js; runar-runes.js/config jen číst. TVAR větví (ohyb/délka/křížení) = ladit až s reálnými čteními.
TVAR větví (ohyb/délka/hustota/křížení) = KUKY odložil až k reálným čtením (pak max limity).
Snapshoty: tree-smooth (po hladkém napojení), tree-reinforce (model+junction), crown-skeleton, crown-engine-v1 (zahozený starý engine).
Permanentní server: serve.bat v rootu (http.server 7788 + _savepng.js 7799) + autostart shortcut.
Pozn. capture: launch.json profil "cap"; preview tool drží 7788 → při focení dočasně volním 7788, pak serve.bat zpět.

## PER-RUNE AUTHORING (2026-06-14) — abeceda tvarů run
Branch composer (build_branch_composer.py) = nástroj na vyladění VŠECH 25 run. Každá runa má
vlastní uložený TVAR: RUNE_TUNE[key]={curve,sub,taper,wob,tip,lenMul} (chybějící pole → signatura
z RUNES). buildBranch čte efektivní tvar z RUNE_TUNE (eCurve/eSub/eTaper/eWob/eTip/eLen). Slidery
"TVAR TÉTO RUNY" editují vybranou runu; ukládá se do localStorage 'runeTune'; grid (všech 25) ukazuje
každou s jejím tvarem; tlačítka reset runy / EXPORT (prompt s JSON → zapéct do runar-branch.js).
SDÍLENO: Tree composer čte stejný localStorage (loadRuneTune + storage event → živá synchronizace
mezi taby) → vyladíš runu v Branch composeru a hned se projeví ve stromě. Globální slidery zúženy na
náhled (length/width/jitter/steer/leaf); tvarové jsou per-runa. API: RunarBranch.setRuneTune/getRuneTune/
exportTune/RUNE_TUNE. Snapshot: tree-routing (routing demo), rune-authoring (per-runa). DALŠÍ: KUKY ladí
25 run → EXPORT → zapéct do runar-branch.js (kanonické); pak (3) vyčistit překryv forku, (4) klik-na-větev
inspekce (význam runy z runar-runes.js = mind-blowing žurnál→příběh), pak ukotvit korunu na life rune.

## SBÍHÁNÍ + INSPEKCE (2026-06-14)
SBÍHÁNÍ pramenů (KUKY bug "spatny prechod"): hlavní větev je teď SPOJITÝ limb — pramen (root+
trunk slice) + branch se MERGUJÍ do jedné cesty (mainLimb.pts = trunkPart.concat(branchPts)) →
maluje se jako jeden tah, žádný šev/fork mess. growBranch vrací level-0 limb (me). Hmotné prameny
se TAPERUJÍ do nuly nahoře (melt do svazku, žádný plovoucí pahýl). w0Want=ex.w (přesná shoda, vigor
→ délka/hustota, ne base width). RESET VŠE v Branch composeru (clear all RUNE_TUNE + localStorage)
+ cache-bust na runar-branch.js include.
INSPEKCE (klik na větev) — KUKYho vize žurnál→příběh: crown composer načítá runar-runes.js (sdílené,
READ-ONLY) → KW lookup dle glyfu (k/k_is keywords). _pick[] = mainy s {pts(merged), meta}; klik na
plátno → nejbližší pramen (práh 22px) → panel INSPEKCE: runa glyf+jméno + element/ætt/world + počet
čtení (vigor) + VÝZNAM (keywords). Vybraný pramen se ZLATĚ vykreslí CELÝ (kořen→kmen→větev) = vidíš,
co tu část stromu vytvořilo. Snapshot: tree-inspect. DALŠÍ: ukotvit korunu na life rune; rozbít
opakování větví; reálné napojení čtení (MAIN koord). KUKY mezitím ladí 25 run → EXPORT → zapéct.

## LIFE-RUNE KOSTRA + BALANCE + VARIACE (2026-06-14)
KUKY: strom byl extrémně nakloněný (element→úhel = jeden dominantní element = vše na stranu) a větve
se lišily jen úhlem. OPRAVA: hlavní větve se umisťují na VYVÁŽENOU KOSTRU (FAN seq: vůdčí nahoru +
střídavě L/R, plní baldachýn) + jemný lifeLean (podpis z life rune, hashStr('lean'+rune)) + element
už jen NUDGE (×0.22), ne celé umístění → nevyváženost zůstává, ale rozumná. VARIACE: každý main má
per-seed mcfg (curve/wobble/childN/levelRatio) + length jitter → větve se liší DÉLKOU/ZAKŘIVENÍM/
HUSTOTOU, ne jen náklonem (KUKY: "naklon neni to ceho si clovek vsimne"). crownT.curve 0.5→0.8.
Snapshot: tree-inspect (aktuální). DALŠÍ: KUKY ladí 25 run → EXPORT; reálné napojení čtení (MAIN koord).

## FOUNDATION OBNOVEN + POSÍLENÍ + VŠE SLIDERY (2026-06-14, KUKY schválil)
KUKY: "ujeli jsme od základu, vem params z crown-skeletonu". OBNOVENO: placement = emergence(k)
(vůdčí nahoru + 2×45° + patra, life-rune lean) — to je STABILNÍ KOSTRA. Routing/themes dávají JEN
charakter (runa/barva) + vigor (velikost), NE pozici. POSÍLENÍ (KUKY bod 1): targetN cap = maxMains;
témata nad cap nezaloží novou větev → reinforce[] přičte jejich count k existujícímu mainu STEJNÉHO
elementu → mohutnější (vigor→délka/tloušťka/hustota), místo množení tenkých. VARIACE fyzická (KUKY:
"naklon je slaby signal"): per-main mr seed mění curve/wobble/childN(0-4)/levelRatio/length, škálováno
sliderem `variace`. VŠE SLIDERY (KORUNA 17): diversity, canopy, maxMains, variace, vigorMature,
readingEvery, length, foundAng, exitTop, exitStep, curve, tipLift, twist, childN, maxDepth, levelRatio,
childWidth (+ KMEN + KOŘENY panely). Snapshot: tree-inspect (aktuální).
STEERING→FYZICKÉ (KUKY postřeh, DALŠÍ návrh): náklon je slabý; mapovat area→sektor/patro, intention
(urð/verðandi/skuld)→délka+výška, mood→sukovitost/wobble (ne ohyb). Sémantická fáze + MAIN koord (reálná data).

## TESTOVACÍ NÁSTROJE pro 14denní vzdálené testování (2026-06-15, KUKY)
Rozsahy zvednuty: věk slider max 1100→2200 (~6 let) + tlačítka 5 let/max; maxMains max 14→20;
strandEvery min 40→20 (rychlejší růst). POJISTKA: strandN cap v trunk enginu (T.strandMax=28) →
nespadne na výkonu při krajních hodnotách (linearN v crown composeru capnut stejně pro display).
NÁSTROJE karta v Tree composeru: RESET (vše na default + clear runeTune, přesync všech sliderů;
funguje per zařízení = pro oba adminy), COPY STATE (celý config DOB/věk/skin/crownT/trunkT/rootsT/
runeTune → clipboard JSON; KUKY vloží ke screenshotu → přesná reprodukce bug reportu na dálku),
nahodne DOB (rychlé testování variant). Branch composer má RESET VŠE + EXPORT. Vzdálený feedback:
COPY STATE + screenshot do Claude chatu → sem. Lab běží lokálně (serve.bat autostart) — testuje na svém stroji.

## OPRAVA VĚTVE=PRAMENY + RŮST ČTEČKA + ČASOVÁ OSA (2026-06-15, KUKY)
BUG: větve byly vázané na počet TÉMAT (elementů ≥4 čtení) → 9 měs = 6 kořenů ale jen 2 větve.
OPRAVA: targetN = min(prameny, maxMains) → VĚTVE = PRAMENY = RŮST (9 měs → 6 větví = 6 kořenů,
za rok ~7, roste + mohutní). Element-mix (charakter) se rozdělí na větve úměrně čtením
(assignBranchEls = proporční largest-remainder + interleave; každý čtený element ≥1). Dominantní
element = víc větví (proporčně) + mohutnější/hustší (domV = count/mx → sizeF×(0.6+0.5domV), childN×
(0.7+0.5domV)). Velikost větve = věk pramene (ageLen: zakládací velké, nové malé) × dominance.
routing vrací {els[],total,mx,big} (per-element, bez split/minC). Portrét = MIX + VELIKOST, ne počet.
RŮST čtečka (#grow panel): živě věk → čtení → prameny → větve (cap) → kořeny → mix elementů % → expanze.
ČASOVÁ OSA: tlačítko → 4 náhledy (180/365/730/1000 dní) on-demand (reuse draw → toDataURL → img).
VARIACE vysvětlení: hodnota = základ×(1+variace×(rnd_násobek−1)); 0=klony, 1=plný rozptyl (délka/curve/
hustota/wobble), per-branch seed (stabilní). Snapshot: tree-growth. (Růstová tabulka viz výše/chat.)

## MOOD ZRUŠEN (2026-06-15, KUKY: "uplne zruseno, nadbytecne, zadna zpetna vazba")
Mood odstraněn z tree logiky (moje doména): runar-branch.js — MOOD mapa pryč, buildBranch už nečte
spec.mood (elev/wobBoost/sGnarl z mood pryč; gnarl teď jen z intention=understanding_past). Branch
composer UI — mood select odstraněn (STEERING = jen area + intention + seed). Steering = JEN area
(hustota) + intention (délka/dosah/gnarl). (Form/prompt mood = MAIN doména, už zrušeno tam.)

## NÁKLON CAP + STEERING→FYZICKÉ (2026-06-15, KUKY)
NÁKLON CAP: leanAmt v build_trunk_composer.py clampnut na ±0.45 (KUKY: "naklon u zadne zivotni runy
nemel presahovat 0.45"). Snapshot před: trunk-precap. STEERING→FYZICKÉ (KUKY bod 1, "naklon je slaby
signal, chce fyzickou zmenu"): buildBranch (runar-branch.js) — intention=DÉLKA+DOSAH (decision_ahead
delší+výš sTip, understanding_past kratší+sukovitější), mood=GNARL (unsettled/lost +wobble, grounded
rovná), area=HUSTOTA odboček (AREA_SUB: career +0.5, crossroads +0.4… → sSub). Aplikováno na L/subN/
wobAmp/tipLift, ne na úhel. Ověřeno: decision_ahead len 204→270 tipY výš; career subvětve 1→2.
Hodnoty first-cut, laditelné (AREA_SUB / sLen / sGnarl). Snapshot: tree-steering. POZN: reálná data
steeringu (area/intention/mood z čtení) = MAIN/produkce; mapování (→fyzické) drž v runar-branch.js.

## TVAR ŠPIČEK + RYTMUS ODBOČEK PER RUNA (2026-06-15, KUKY "ať runy mluví")
runar-branch.js: RUNE_CHAR mapa (per runa) — tipc (špička: taper|fork|up|blunt) + rhy (rytmus
odboček: alt|opp|base|tip|even). buildBranch: 'up'→tipLift×1.8, 'blunt'→tlustá špička (w1), 'fork'→
Y na konci (2 twigy), rhy mění fu rozložení + opp=protilehlé páry. eTipc/eRhy = override (RUNE_TUNE)
nebo default (RUNE_CHAR). Branch composer: 2 cyklovací tlačítka (spicka/rytmus) v SHAPE kartě, ukládá
do RUNE_TUNE (merge, nepřepíše slidery) + localStorage → strom čte. RUNE_CHAR exportováno. Runy teď
viditelně odlišné (Fehu fork, Uruz blunt, Tiwaz/Thurisaz up-trn, Gebo/Ehwaz opp páry, Isa jehla, Algiz
paroží, Laguz vlna). Snapshot: tree-steering. Per-rune autoring (sliders + tipc/rhy) = KUKY ladí → EXPORT → zapéct.

## KŮRA (BARK SKIN) + REZIM PŘEPÍNAČ (2026-06-15, KUKY "potáhnout kůži")
Procedurální kůra v crown composeru paintLimb(pts,el,skin,tex) — NE foto-textura (ta tluče na zakřivené
limby + stylizaci). Vrstvy: oblé stínování (tmavé okraje = válec 3D) + podélné rýhy (thin lines napříč
šířkou, jitter sin, počet roste s tloušťkou) + silnější světlý hřbet. Jen na širších částech (twigy čisté).
REZIM přepínač (KUKY: "potrebuju prepinani na kostru at ladim vetve"): kuze (bark) ↔ kostra (flat, rychlé
na ladění). Slider `textura` (0..1, default 0.85). state.skin default true. Snapshot: tree-bark.
DALŠÍ (v2 kůry): příčné praskliny (jasanový kosočtverec) na starých tlustých; LISTY (parkováno, svítící
element). Per-runa ladění (tvar+špička+rytmus) čeká na KUKYho EXPORT.

## PARKOVÁNO / SMĚR (2026-06-14, KUKY)
- LISTY = hlavní budoucí "mluvící" vrstva: jemně SVÍTÍ (barva elementu) + mírný pohyb. Nejvíc
  vyjadřovacího účinku ponesou ony → holé tvary větví nemusí nést všechno. Až později, "jen ať to víme".
- BALANCE strategie (KUKY rozhodnutí): TEĎ raději vyváženější, pomalu povolovat. Reálný uživatel nemá
  vyvážené rozložení run (lab diversity slider jen ukazuje statistický rozsah) → vyvážená kostra chrání
  vzhled. Nevyváženost má jet hlavně přes VIGOR (tloušťka/délka = kolik na téma čteš = mohutnost), MÉNĚ
  přes úhel (pozice). Soustředěný člověk = mohutné větve, ne padající strom.
- "Mluvící" tvar větve (priorita kromě náklonu): rytmus odboček, charakter špičky, výrazné siluety per
  runa (Isa rovná, Þurs zalomená, Laguz plynoucí) — ladí se v Branch composeru per-runa.

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
výklad). Area of Life + What seeking = otevřené ke změně/rozšíření.
✅ MOOD ODSTRANĚN z produkce 2026-06-14 (commit 38f9713): form pill group + app.js/reading.js sběr + mood_lbl
EN/IS. character.js `_moodContext` ponechán DORMANTNÍ (no-op, součást Norns-osy — pokud TREE mood nepoužije, lze smazat).
intention ZŮSTÁVÁ. Area/seeking = stále otevřené k případné úpravě.

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

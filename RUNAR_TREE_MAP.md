# RUNAR_TREE_MAP.md — Jak se strom staví: co určuje co (kauzální mapa LABU)
# Vlastník: CODE-tree. Popisuje VZTAHY v kódu labu — `build_crown_composer.py` (generuje `v2/tree-lab-crown-composer/crown-composer.html`)
# + `runar-branch.js` (tvar větve) + `runar-trunk.js` (kmen). Hodnoty NEOPISUJE (§20) — bydlí v kódu; tady je, KTERÁ funkce/páka
# rozhoduje a KAM se změna promítne. Pravidla, která strom musí splnit, vlastní `RUNAR_TREE.md` (§2–§5); tady jen odkaz.
# Aplikace (`build_tree_production.py` → `runar-tree-prod.js`) je zatím STARÝ model — tahle mapa platí pro LAB.
# Přepsáno 2026-10-03 (KUKY: „chceš si zmapovat, co se tady staví, abys to taky věděl? … co se kde promítne, když to změníš?“).
# Předchozí verze (vrstvy A–I, 2026-08-07 + dodatky) popisovala model před zónami a hlavně NEvysvětlovala tvar ramene po délce —
# proto se opravy překryvů točily v kruhu (měnilo se jen místo výstupu, ne tvar). Starší verze: `git log -- RUNAR_TREE_MAP.md`.

## 0. Pořadí stavby — `draw()`
1. **Log → brána založení** — bez zakládacích Noren (3 runy) jen semínko; s nimi Norny první, ostatní čtení v čase (i ta před založením).
2. **`routingFromLog`** — mix elementů, počty tažení run, velké spready (vícerunová čtení).
3. **Velikost stromu** — výška kmene (`trunkT.topY`).
4. **`slotAssign`** (od 2026-10-10; dřív `stableAssign`, ten už jen pro semínko) — ramena „strana × zóna“ (= prameny) + vrchol, vedlejší větve (živly), větvičky (čtení); vše v jednom průchodu v čase.
5. **Kostra `FR`** — strana a neutrální rozevření ramene při zrodu.
6. **Časová smyčka (v drawu)** — běží dál (zóna stromu, výška kmene), ale **výšky a úhly ramen od 2026-10-10 dává jejich místo** (§5).
7. **Kmen** — `Tk.buildTrunk` (`runar-trunk.js`): prameny, svazek, náklon, vlnění, kořenové konce.
8. **Ramena** — pro každý pramen: výstup z kmene → `growBranch` → `B.buildBranch` (`runar-branch.js`) + větvičky + kořen.
9. **Vedlejší větve** (dřív „povýšené“) — `growGrad`: z ramene na pevném místě podle pořadí; každá má svůj kořen z kořene matky.
10. **Kreslení** — auto-fit na plátno, kůra / WebGL; **inspekce**, **přehled větví**, text **RŮST**.

## 1. Vstup čtení → zóna (`readZone`)
- Zóna jednoho tažení na ose urð −1 … skuld +1: **záměr**, pozice v rozkladu ji určuje, bez kontextu svět runy. **Oblast ani seeking do výšky nevstupují** (od 2026-10-09; oblast dřív 0,3 → šikmý strom, seeking 0,2 jen dolů → strom skoro neměnil; seeking je teď na koncích větviček, §8). Mapa vstupů → `RUNAR_TREE.md` §3.
- **Promítne se:** do kterého pásma (a tedy ramene) čtení jde · výška ramene · ohyb ramene (tíha) · výška stromu.
- Strana čtení (nitro/svět) = **oblast** (`AREA_LAT`); bez oblasti svět runy jen mírně (`latOf`). **Promítne se:** překlopení a natočení ramene, strana větvičky na rodiči.

## 2. Velikost stromu (draw, před stavbou)
- **Výška kmene** = věk (semínko + počet čtení × `readingEvery`) × `treeHeightMax` × velké spready ohně/vzduchu (`hExp`) × celková zóna (`Ztree`: budoucnost vyšší). Jedna rovnice `trunkTopY` pro draw, kapacitu (§3) i časovou smyčku (§5). **Kmen ještě povyroste**, když se ramena s rozestupem nevejdou (časová smyčka §5, `needH`; nejvýš po výšku obrazovky), a **roste s rozpětím ramen**: je aspoň `hwRatio` × rozpětí ramen a povýšených (bez větviček); když ne, draw se postaví znovu s vyšším kmenem (`_hwTop`, nejvýš jeden přepočet; rozpětí na výšce kmene skoro nezávisí).
- ⚠️ **MRTVÉ:** `wExp` (velké spready vody/země → „šířka“) a `mExp` (stínu → „mohutnost“) se spočítají (`effCanopy`, `girth`) a **nikde se nepoužijí** — panel RŮST je přesto ukazuje jako „expanze: šířka / mohutnost“. Nalezeno 2026-10-03 při mapování.
- **Promítne se:** výška kmene = kolik místa je pro ramena (kapacita, §3) a jak daleko od sebe vycházejí.

## 3. Místa a ramena — `slotAssign` (od 2026-10-10)
- **Rameno = strana × zóna**: vlevo / vpravo × Urð / Verðandi / Skuld (`bandOf` jako dřív, stín jen dole nebo nahoře). Založí ho první čtení, které tam patří (jeho runa a živel). **Vrchol** (vůdčí větev, rameno 0) = zakládací Skuld + čtení bez strany v Skuld (místo vůdčí větve zůstává střed). Pravidla → `RUNAR_TREE.md` §3; rozhodnutí → DECISIONS 2026-10-10 (34) a zapnutí.
- **Čtení bez strany** (bez oblasti, Love, Crossroads) **koluje** na lehčí stranu (`lightSide` uvnitř `slotAssign`: strana, na kterou zatím šlo méně tažení); bez záměru dá zónu svět runy (`readZone`).
- **Vedlejší větev = další živel v místě** (kdo dřív přijde, má ji dřív): kapacita Urð 3, Verðandi 3, Skuld 2, vrchol 2 → nejvýš 25 větví samo od sebe. Další živel vlastní větev nemá — jeho čtení rostou jako **větvičky přímo na rameni** (místo má každé čtení; na KUKYho stromě 19 % tažení). Čtení živlu, který na rameni větev má, jde na ni.
- **Nic se nepřesouvá:** kde rameno nebo vedlejší vznikly, tam zůstanou; pořadí vedlejší na rameni (`_xi`) a kapacita (`_xn`) dávají její pevné místo.
- **Větvičky** = čtení: každé čtení jde do stromu své větve (`attachR`): nejvýš `twigMax`, pak o patro níž do větvičky s nejmenším podstromem.
- **Promítne se:** počet ramen (nejvýš 6 + vrchol) a pramenů v kmeni (nejvýš 7), co roste na kterém rameni, vedlejší větve (§9), kořeny (§10).
- *Historie:* do 2026-10-10 místo = živel × pásmo × strana (`stableAssign`, nejvýš 14 pramenů, převzetí, držet místo, strop 25) — `git log -- RUNAR_TREE_MAP.md`.

## 4. Kostra `FR` (strana při zrodu)
- **Strana = strana místa (z dat)** — od 2026-10-05; dřív střídání v pořadí zrodu (vyvažovalo počty a počítalo i povýšené, které na přidělené straně nerostly → KUKYho strom 9 : 4). Místo ze středu: strmě u kmene, strana kresby = svět runy (Hel vlevo, Asgard vpravo, Midgard podle runy). Demo bez logu dál střídá. Neutrální rozevření `bendN` (+ drobná variace zlatým řezem) × šířka koruny `canopy`.
- **Promítne se:** výchozí strana a úhel nového ramene; povýšené větve mají v kostře taky místo (klíč 100+).

## 5. Časová smyčka — výšky, strany, úhly (draw, „VYSKY VYSTUPU predem“)
⚠️ **Od 2026-10-10 (ramena strana × zóna) výsledky smyčky pro ramena přepíše jejich MÍSTO** (blok „RAMENA“ hned za smyčkou): výška výstupu podle místa (Urð dole, Skuld nahoře, levá a pravá se v zóně střídají — která níž, dá životní runa a datum), úhel podle místa (dole nejvíc do strany), délka = patro × praxe MÍSTA (rameno + jeho vedlejší, od 2026-10-10 „živý tvar“; dřív medián praxe ramen), dráha pramene ve svazku podle strany a patra. Tíha, natočení za oblastí a rozestup níž proto ramena teď **neovlivní** (čeká na rozhodnutí o „živém tvaru ramen“, `RUNAR_BACKLOG.md`).
Prochází čtení od založení; po každém čtení:
- **Strana** ramene: kostra FR = strana místa; překlápění zůstalo v kódu, ale nenastane (čtení druhé strany na rameno nejdou).
- **Cílová výška**: střed pásma zóny + zóna čtení na rameni (tlumeně); vůdčí větev = vrchol kmene.
- **Výška kmene v každém čtení** = jaká byla v tom čtení (`trunkTopY` z věku a čtení do té doby, + růst kvůli místu). Dřív se celá historie počítala s dnešní výškou → rozestup v podílu kmene se s každým čtením posunul a ramena si mezi čteními měnila pořadí.
- **Rozestup**: nové rameno se narodí do mezery, kde leží jeho **cíl (zóna)**, i když v ní není místo — sousedé se rozestoupí rychlými kroky (2026-10-05; dřív první volná mezera → Raidho s čteními o minulosti nahoře); pořadí podle výšky se nemění; sousední výstupy na **stejné straně** aspoň `exitMinPx`, levé–pravé (a od vůdčí větve) polovinu. Strana = kam rameno opravdu míří (úhel z minulého čtení); do 0,2 rad od svislice (v překlápění) platí obě. Když se nevejdou, **povyroste kmen** (`needH`, jen roste); podlaha (`exitFloor`) ustoupí jen u stropu obrazovky. Krok k cíli malý; dokud je někde mezera pod rozestupem, až 12 rychlých kroků v jednom čtení.
- **Cílový úhel**: neutrální poloha (FR) **ohnutá tíhou** (`bendMag`: zóna čtení = směr nahoru/do strany/dolů, počet čtení = síla, `bendK`, `bendStr`) + **natočení za čteními** (`areaSide` × rovnováha nitro/svět) + životní runa (`lifeLean`), omezeno `softSide`.
- ~~Vějíř~~ **zrušen 2026-10-03** (DECISIONS (15)): nutil na každé straně nižší rameno vodorovněji než rameno nad ním → vodorovné klacky od země nahoru („koště").
- **Pořadí úhlů na straně** (2026-10-05): spodní rameno nesmí být strmější než rameno nad ním — porušená dvojice se srovná na průměr, spodní aspoň o 0,10 rad vodorovněji; bez svorek.
- K cílovému úhlu rameno jde nejvýš `LR_STEP` za čtení (žádný skok).
- **Promítne se:** `FRAC` (výšky → engine kmene `T.exitFrac` → zúžení svazku), `_ANG` (úhly ramen), `_KU` (místa větviček na rameni) a místo odštěpení povýšené větve.

## 6. Kmen — `runar-trunk.js` (`buildTrunk`)
- Prameny = místa (§3), dráhy ve svazku (`LANE`), narození pramene = čtení, kdy místo vzniklo (`bornOrder`).
- Svazek: šířka ~ odmocnina z počtu pramenů, které v dané výšce ještě jsou (`T.exitFrac`); pata jen u země.
- Tvar: **náklon** (`lean` × element životní runy — vyboulení do strany), **vlnění** (`wobble`, `wobFreq`), propletení (`twist`), síla (`thickness`, věk).
- **Promítne se:** kde přesně leží bod výstupu (x) a jaký má kmen v tom místě směr — rameno z něj vychází podél jeho tečny (§7).

## 7. Tvar ramene po délce — `growBranch` → `buildBranch` → `branchAngle` (`runar-branch.js`)
Směr ramene se po délce mění — **tohle rozhoduje, jestli se ramena potkají, ne místo výstupu**:
1. **Napojení:** rameno začíná ve směru tečny kmene (svisle) a ke svému cílovému úhlu se stáčí plynule přes první část délky (`branchAngle`, `bend`). Do té doby běží podél kmene — přes místa, kde vycházejí ramena nad ním. Má-li nad sebou na téže straně blízko souseda, odkloní se dřív (nejvýš o 30 %; „NAPOJENI PODLE MISTA“) — jinak vyjelo k jeho výstupu a ramena splynula.
2. **Prohnutí** (`arc`): po celé délce se otáčí na stranu ohybu, síla = element (`curveMul`) × runa (`curve`) × posuvník gesto (`curve`, × variace a ætt).
3. **Vlnění** (`wobble` × runa).
4. **Zdvih špičky** (`tipLift` × runa × záměr; „up“ špičky silněji): poslední část délky se stáčí zpět ke svislici — špička nižšího ramene stoupá k rameni nad ním.
5. **Délka** = `length` × role hlavní větve (několikanásobek větvičky) × praxe (od 2026-10-10 u ramen praxe MÍSTA = rameno + vedlejší, × patro; vrchol × 0,75) × náběh mladého pramene × runa × záměr. **Tloušťka** = šířka kmene v místě výstupu.
6. **Tvar celé větve podle seekingu** (od 2026-10-10, `seekShapeOf` + `bendSpine` v `growBranch`, level 0 = ramena i vedlejší): převažující seeking čtení větve ohne páteř po délce — Clarity vzhůru, Reflection dolů, Confirmation se napůl narovná, Insight se zalomí (loket nahoru, pak zpět). Síla = podíl převažujícího seekingu (od 15 %, plná od 45 %) × počet čtení (plná od 12). Ohyb je PŘED větvičkami, takže větvičky i vedlejší jdou s ní; vedlejší se odklání od skutečného směru ohnutého ramene.
- **Promítne se:** celá silueta. Posuvníky: gesto (`curve`), variace, ætt → charakter, délka hlavní, napojení ramene (`limbBendU` → bod 1) a zdvih špičky ramen (`limbTip` → bod 4). Výchozí obou = ranní tvar; nižší hodnoty (0,15 / 0,5, zkoušené proti překryvům) dělaly tuhá rovná ramena — součást „koštěte" (DECISIONS 2026-10-03 (15)).
- ⚠️ **Proč se ramena překrývají (2026-10-03):** rozestup výstupů je malý proti tomu, jak se rameno po délce otočí (napojení podél kmene + prohnutí + zdvih špičky = až desítky stupňů) a jak je dlouhé (stovky px). Do 2026-10-03 byl nejčastější případ povýšená větev podél matky: vyrůstala ve směru matky a ke svému úhlu se stáčela přes 45 % své délky (bod 1), takže první kus běžel s matkou souběžně — teď se stočí přes 15 % (§9). Nejčastější zbylý: dvě ramena na stejné straně, která se po délce sbíhají. Měří to `scripts/utils/tree_overlap.js`.

## 8. Větvičky na ramenech — `repKids` + `growBranch` (level ≥ 1)
- Každá větvička = jedno čtení (tvar své runy). **Místo** na rodiči: rytmus runy rodiče + pořadí zrodu (zlatý řez), přímé větvičky ramene přes rozdělovač míst (`freeSpot`: odstup od starších i od povýšených). **Strana**: oblast čtení (nitro/svět) vůči směru rodiče, jinak střídavě. **Úhel**: tečna rodiče ± stálá odbočka. **Velikost**: zrod malá, doroste za `dorust` čtení, dál s čteními na ní; tvar řídí záměr/oblast čtení (steering).
- **Strana větvičky** (od 2026-10-09): střídavě kolem větve (slot + runa rodiče) — stranu VĚTVE už určila oblast. Dřív nitro doleva / svět doprava podle `AREA_LAT`, takže na levé větvi (skoro jen nitro) mířily všechny větvičky doleva (KUKYho strom: Algiz, Nauthiz, Dagaz, Perth).
- **Konec větvičky podle seekingu** (od 2026-10-09): lab předá `seekTip` větvičkám (level ≥ 1, ramenům ne), engine (`runar-branch.js`) otočí konec — Clarity nahoru, Reflection dolů (nejvýš 0,6 rad, plynule od poloviny délky), Confirmation rovně (menší oblouk, vlnění i zdvih), Insight zalomení (0,5 rad kolem 62–72 % délky), General jeden z nich podle semínka větvičky. Tvar konce (`eTipc`) dál dává runa. Bez `seekTip` (aplikace) engine beze změny.
- **Promítne se:** hustota a směr drobných větví; kořeny zrcadlí prvních `mirrorN` větviček (§10).

## 9. Vedlejší větve (dřív „povýšené“) — `growGrad`
- **Od 2026-10-10:** matka = rameno téže strany a zóny (ne téhož živlu); vedlejší nese jiný živel než rameno. Místo podél ramene pevné podle pořadí a kapacity (`u` 0,25–0,80, na vrcholu 0,12–0,82); rozdělovač míst (`_KU`) je postaví napřed, větvičky se jim vyhnou.
- **Směr:** od směru RAMENE střídavě nahoru / dolů (nahoru víc dole, nahoře méně); na vrcholu střídavě vlevo / vpravo (kreslená strana `_dsd`, data strana 0 = střed), dole širší, nahoře strmější. Ke svému úhlu se stočí přes 6 % délky. **Otočená dolů zvedá špičku jen 0,35 ×** (ona i její větvičky) — jinak se větvičky zespodu stočily nahoru a byly všechny navrchu.
- **Délka:** u kmene delší, ke špičce kratší (podíl délky ramene), ale **aspoň 0,8 × své praxe** (F5) — krátká vedlejší s mnoha čteními měla větvičky 3–4 px od sebe.
- Nemají vlastní pramen v kmeni: matka je od kořene po místo odštěpení tlustší (kmen jen o čtvrtinu, kořen jako dřív).

## 10. Kořeny — `buildRootFor`, `mirrorTwig`
- Každé rameno má kořen tvaru své runy (posuvníky KOŘENY); zrcadlo koruny = prvních `mirrorN` větviček ramene dolů. **Od 2026-10-10 má kořen i každá vedlejší větev** (DECISIONS 2026-10-10 (26)): téže stavby (`buildRootFor`, velikost `gradStrandW`), vyroste z kořene matky ve stejném místě a natočí se zrcadlově k odbočce (nejvýš 63° od svislice). Kořen se smí natočit, ohnout a prodloužit, **nepředělává se** (DECISIONS (23), (28)). Směr kořenů ramen: vrchol dolů, na straně podle patra 52° / 34° / 17° od svislice.
- **Od 2026-10-11 kořen žije** (DECISIONS 2026-10-11 (3)): **seeking** větve ohne celý kořen zrcadlově (`bendRootPaths` po stavbě, touž silou jako větev
  přes `seekShapeOf`) — Clarity odklon od svislice zmenší násobkem (až o 65 %), Reflection přidá ven a měkce brzdí před vodorovnou, Confirmation
  napůl narovná, Insight lokty; výběžky jdou s páteří. Tah k cílovému úhlu ✖ (kořeny v cíli běžely souběžně). **Proplétání:** `wobble` × 1,6
  a `spec.twist` 0,25. **Návrat runy** (`_RI` = čtení, kde runa padla; počítají se ta po vzniku větve, meta `navraty`): délka × (1 + 0,5·fR),
  hlavní kořen `dev` × (1 − 0,35·fR), fR = log(1 + návraty)/log(41), nejvýš 1. Šířku ne — `rf` ji přepočítá na šířku pramene u země.
  **Minulost a nitro** (od 2026-10-11, DECISIONS 2026-10-11 (7)): `_RP` = tažení ve čtení o minulosti (`readZone` < −1/3) nebo o nitru (oblast
  Healing / Family / Inner Growth); nadbytek = max(0, (podíl − 0,5)/0,5) × fR × min(1, návraty/12), nejvyšší v čase (`exMax`, kořen se nezkrátí);
  délka navíc + 0,8·exMax, `dev` navíc − 0,6·exMax. Meta `navratyMin`.

## 11. Co lab ukazuje
- **Inspekce** (klik): rameno (kolikrát runa padla, kolik čtení nese, kdy vzniklo, místo, výška, směr, tíha), větvička (ze kterého čtení, na čem roste, kolik nese), kořen. **Přehled větví**: čtení, délka, tloušťka, větvičky, povýšené. **RŮST**: věk, čtení, prameny, ramena, sousední zóna, mix, expanze (⚠️ viz §2).
- **Posuvníky** jsou jen ty s viditelným účinkem (audit `tree_diag.js sliders`, `DEFAULTS=1` = výchozí hodnoty, jak je vidí KUKY); ODLOŽENO = kůra.

## 12. Kontroly
- **Smoke ㉳** `scripts/verify_tree_mista.js` (lab, výchozí posuvníky; přepsán 2026-10-10 na ramena strana × zóna): výstupy ramen na stejné straně aspoň `exitMinPx`, levé–pravé polovinu, žádné rameno pod podlahou, **každé čtení na svém místě** (rameno své strany a zóny; na vedlejší jen svého živlu, na rameni jiného živlu jen při plné kapacitě; strana i nezávisle z oblasti v logu, vrchol = střed; větev se stranou nakreslená na té straně), větve na rodiči od sebe, každý nakreslený tah klikatelný, nejvýš 7 pramenů, inspekce = log, nejvýš 25 větví, (o) rameno téhož místa v čase ve stejné výšce, (p) kapacita ramen, (q) kořen každé vedlejší; (i) oblast a (k) seeking nehýbou výškou, (j) strom bez oblasti vyvážený, (l) konce větviček podle seekingu (engine i celá cesta labem), (m) větvičky kolem větve (žádná hlavní větev s aspoň 3 přímými větvičkami jen na jedné straně; strana od báze ke špičce větvičky), (r) seeking tvaruje celou větev (Clarity výš než Reflection), (s) seeking tvaruje kořen (Clarity hlouběji než Reflection), (t) návrat runy kořen prodlouží (o 30 návratů víc → delší výběžky, stavba stromu stejná), (u) návraty o minulosti a nitru prohloubí kořen víc než stejný počet návratů o světě; ~~(n) držet místo živel × zóna~~ zrušeno 2026-10-10. Tři logy: všude, minulost, **svět** (oblasti hlavně svět — přidán 2026-10-07, jediný z nich ukáže povýšenou na druhé straně, když selže pravidlo strany v §9).
- **Detektor překryvu** `scripts/utils/tree_overlap.js`: pro dvojice ramen a povýšených větví vzdálenost jejich čar po délce proti součtu polovin tloušťky (bez paty u kmene a místa odštěpení); úsek pod 25° = souběh (překryv), jinak protnutí. Zatím jen nástroj — do smoke až po opravě. ⚠️ **Hranice 25° je hrubá:** mělké křížení pod 21–24° (~20 px) hlásí jako souběh, i když jsou obě větve vidět (KUKYho strom 2026-10-03: Gebo + Uruz, Hagalaz + Eihwaz — ověřeno výřezem). Hraniční nález se ověřuje okem.
- Ruční: `scripts/utils/tree_diag.js` (`zony`, `misto`, `klik`, `jump2`, `limbjump`, `scen`, `zscen`, `sliders`) · `scripts/utils/tree_render.js` — KUKYho strom z několika verzí labu vedle sebe do PNG (před hlášením každé změny stromu, DECISIONS 2026-10-03 (15)). · `scripts/utils/tree_read.js` — strom přečtený z dat (strany, ramena zdola nahoru, špička, proč) — podklad pro popis ownerovi.

## 13. Co se kde promítne — páka → účinek
| páka (panel) | promítne se do |
|---|---|
| max ramen s vlastním pramenem | ⚠️ od 2026-10-10 bez účinku (ramena = 6 míst strana × zóna, §3) |
| kam nejníž smí větev · rozestup ramen na stejné straně | výšky výstupů, kapacita kmene, růst kmene kvůli místu (§2, §3, §5) |
| napojení ramene · zdvih špičky ramen | tvar ramen po délce (§7) |
| výška kmene : rozpětí ramen | výška kmene, jak strom roste do výšky se šířkou (§2) |
| čas čtení → výška | ⚠️ od 2026-10-10 ramena neovlivní (výška z místa, §5); zóna stromu ano |
| nitro/svět → natočení | ⚠️ od 2026-10-10 bez účinku na ramena (§5) |
| tíha · kolik čtení ohne · neutrální poloha | ⚠️ od 2026-10-10 bez účinku na ramena (úhel z místa, §5) — čeká na „živý tvar ramen“ |
| ætt → charakter · gesto · variace | prohnutí, vlnění, zdvih špičky ramen (§7) |
| délka hlavní · délka povýšené | délka ramen / povýšených (§7, §9) |
| max větví na jedné větvi · zrod · dorůst | hustota a velikost větviček (§3, §8) |
| KMEN: síla · náklon · propletení · rozestup · vlnitost · výška | kmen (§6) → výchozí bod a směr ramen (§7) |
| KOŘENY | kořeny (§10) |

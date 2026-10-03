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
4. **`stableAssign`** — místa „element × zóna“ (= ramena = prameny), větvičky (čtení), povýšení; vše v jednom průchodu v čase.
5. **Kostra `FR`** — strana a neutrální rozevření ramene při zrodu.
6. **Časová smyčka (v drawu)** — pro všechna ramena naráz: výška výstupu z kmene, strana, úhel. Po každém čtení krok k cíli.
7. **Kmen** — `Tk.buildTrunk` (`runar-trunk.js`): prameny, svazek, náklon, vlnění, kořenové konce.
8. **Ramena** — pro každý pramen: výstup z kmene → `growBranch` → `B.buildBranch` (`runar-branch.js`) + větvičky + kořen.
9. **Povýšené větve** — `growGrad`: z matky v místě odštěpení; matka je do toho místa tlustší.
10. **Kreslení** — auto-fit na plátno, kůra / WebGL; **inspekce**, **přehled větví**, text **RŮST**.

## 1. Vstup čtení → zóna (`readZone`)
- Zóna jednoho tažení na ose urð −1 … skuld +1: záměr · oblast · seeking (vážený průměr vyplněných), pozice v rozkladu ji určuje, bez kontextu svět runy. Mapa vstupů → `RUNAR_TREE.md` §3.
- **Promítne se:** do kterého pásma (a tedy ramene) čtení jde · výška ramene · ohyb ramene (tíha) · výška stromu.
- Strana čtení (nitro/svět) = **oblast** (`AREA_LAT`); bez oblasti svět runy jen mírně (`latOf`). **Promítne se:** překlopení a natočení ramene, strana větvičky na rodiči.

## 2. Velikost stromu (draw, před stavbou)
- **Výška kmene** = věk (semínko + počet čtení × `readingEvery`) × `treeHeightMax` × velké spready ohně/vzduchu (`hExp`) × celková zóna (`Ztree`: budoucnost vyšší). Jedna rovnice `trunkTopY` pro draw, kapacitu (§3) i časovou smyčku (§5). **Kmen ještě povyroste**, když se ramena s rozestupem nevejdou (časová smyčka §5, `needH`; nejvýš po výšku obrazovky).
- ⚠️ **MRTVÉ:** `wExp` (velké spready vody/země → „šířka“) a `mExp` (stínu → „mohutnost“) se spočítají (`effCanopy`, `girth`) a **nikde se nepoužijí** — panel RŮST je přesto ukazuje jako „expanze: šířka / mohutnost“. Nalezeno 2026-10-03 při mapování.
- **Promítne se:** výška kmene = kolik místa je pro ramena (kapacita, §3) a jak daleko od sebe vycházejí.

## 3. Místa a ramena — `stableAssign`
- **Místo = element × pásmo zóny** (`bandOf`): oheň/voda/vzduch/země tři pásma, stín dvě (na hranách). Pravidla → `RUNAR_TREE.md` §5 KROK 5.
- **Rameno vznikne** s prvním čtením, které do místa patří (nese tvar jeho runy), **jen když se vejde na kmen**: kapacita = kolik výstupů se vejde na výšku kmene v tu chvíli nad podlahu `exitFloor`, když se levá a pravá střídají (na rameno polovina `exitMinPx`; `capSecAt`, tatáž rovnice výšky jako v §2). Nestřídají-li se, nepřidá se rameno — povyroste kmen (§5). Pro elementy bez ramene je místo rezervované (jejich první rameno vznikne vždy).
- **Čtení bez vlastního místa** (runa už rameno má, nebo není místo) → rameno svého elementu v nejbližší zóně (`nearSec`). RŮST to ukazuje jako „N čtení na sousední zóně“.
- **Větvičky** = čtení: každé čtení jde do stromu svého ramene (`attachR`): na rameni nejvýš `twigMax`, pak o patro níž do větvičky s nejmenším podstromem.
- **Povýšení**: runa, která na rameni překročí práh, dostane vlastní větev (nejvýš 2 na rameno, tempo `gradEvery`, pořadí = čas); od povýšení jdou její další čtení z té zóny na ni.
- **Promítne se:** počet ramen a pramenů v kmeni, co roste na kterém rameni, délka ramene (§7), povýšené větve (§9).

## 4. Kostra `FR` (strana při zrodu)
- Ramena dostanou stranu v **pořadí zrodu**: vůdčí nahoru, další střídavě tak, aby se strany lišily nejvýš o jedno; při shodě lehčí strana (méně čtení). Neutrální rozevření `bendN` (+ drobná variace zlatým řezem) × šířka koruny `canopy`.
- **Promítne se:** výchozí strana a úhel nového ramene; povýšené větve mají v kostře taky místo (klíč 100+).

## 5. Časová smyčka — výšky, strany, úhly (draw, „VYSKY VYSTUPU predem“)
Prochází čtení od založení; po každém čtení:
- **Strana** ramene: kostra FR; překlopí se, když čtení o oblasti na rameni jasně převáží na druhou stranu (stejná pravidla jako `limbPath`).
- **Cílová výška**: střed pásma zóny + zóna čtení na rameni (tlumeně); vůdčí větev = vrchol kmene.
- **Výška kmene v každém čtení** = jaká byla v tom čtení (`trunkTopY` z věku a čtení do té doby, + růst kvůli místu). Dřív se celá historie počítala s dnešní výškou → rozestup v podílu kmene se s každým čtením posunul a ramena si mezi čteními měnila pořadí.
- **Rozestup**: nové rameno se narodí do nejbližší volné mezery mezi skutečnými výškami; pořadí podle výšky se nemění; sousední výstupy na **stejné straně** aspoň `exitMinPx`, levé–pravé (a od vůdčí větve) polovinu. Strana = kam rameno opravdu míří (úhel z minulého čtení); do 0,2 rad od svislice (v překlápění) platí obě. Když se nevejdou, **povyroste kmen** (`needH`, jen roste); podlaha (`exitFloor`) ustoupí jen u stropu obrazovky. Krok k cíli malý; dokud je někde mezera pod rozestupem, až 12 rychlých kroků v jednom čtení.
- **Cílový úhel**: neutrální poloha (FR) **ohnutá tíhou** (`bendMag`: zóna čtení = směr nahoru/do strany/dolů, počet čtení = síla, `bendK`, `bendStr`) + **natočení za čteními** (`areaSide` × rovnováha nitro/svět) + životní runa (`lifeLean`), omezeno `softSide`.
- ~~Vějíř~~ **zrušen 2026-10-03** (DECISIONS (15)): nutil na každé straně nižší rameno vodorovněji než rameno nad ním → vodorovné klacky od země nahoru („koště").
- K cílovému úhlu rameno jde nejvýš `LR_STEP` za čtení (žádný skok).
- **Promítne se:** `FRAC` (výšky → engine kmene `T.exitFrac` → zúžení svazku), `_ANG` (úhly ramen), `_KU` (místa větviček na rameni) a místo odštěpení povýšené větve.

## 6. Kmen — `runar-trunk.js` (`buildTrunk`)
- Prameny = místa (§3), dráhy ve svazku (`LANE`), narození pramene = čtení, kdy místo vzniklo (`bornOrder`).
- Svazek: šířka ~ odmocnina z počtu pramenů, které v dané výšce ještě jsou (`T.exitFrac`); pata jen u země.
- Tvar: **náklon** (`lean` × element životní runy — vyboulení do strany), **vlnění** (`wobble`, `wobFreq`), propletení (`twist`), síla (`thickness`, věk).
- **Promítne se:** kde přesně leží bod výstupu (x) a jaký má kmen v tom místě směr — rameno z něj vychází podél jeho tečny (§7).

## 7. Tvar ramene po délce — `growBranch` → `buildBranch` → `branchAngle` (`runar-branch.js`)
Směr ramene se po délce mění — **tohle rozhoduje, jestli se ramena potkají, ne místo výstupu**:
1. **Napojení:** rameno začíná ve směru tečny kmene (svisle) a ke svému cílovému úhlu se stáčí plynule přes první část délky (`branchAngle`, `bend`). Do té doby běží podél kmene — přes místa, kde vycházejí ramena nad ním.
2. **Prohnutí** (`arc`): po celé délce se otáčí na stranu ohybu, síla = element (`curveMul`) × runa (`curve`) × posuvník gesto (`curve`, × variace a ætt).
3. **Vlnění** (`wobble` × runa).
4. **Zdvih špičky** (`tipLift` × runa × záměr; „up“ špičky silněji): poslední část délky se stáčí zpět ke svislici — špička nižšího ramene stoupá k rameni nad ním.
5. **Délka** = `length` × role hlavní větve (několikanásobek větvičky) × počet čtení na rameni (praxe) × náběh mladého pramene × runa × záměr. **Tloušťka** = šířka kmene v místě výstupu.
- **Promítne se:** celá silueta. Posuvníky: gesto (`curve`), variace, ætt → charakter, délka hlavní, napojení ramene (`limbBendU` → bod 1) a zdvih špičky ramen (`limbTip` → bod 4). Výchozí obou = ranní tvar; nižší hodnoty (0,15 / 0,5, zkoušené proti překryvům) dělaly tuhá rovná ramena — součást „koštěte" (DECISIONS 2026-10-03 (15)).
- ⚠️ **Proč se ramena překrývají (2026-10-03):** rozestup výstupů je malý proti tomu, jak se rameno po délce otočí (napojení podél kmene + prohnutí + zdvih špičky = až desítky stupňů) a jak je dlouhé (stovky px). Nejčastější případ: povýšená větev odbočí nahoru a matka se ke špičce zvedá taky (bod 4) → poslední část matky běží s povýšenou souběžně. Měří to `scripts/utils/tree_overlap.js`.

## 8. Větvičky na ramenech — `repKids` + `growBranch` (level ≥ 1)
- Každá větvička = jedno čtení (tvar své runy). **Místo** na rodiči: rytmus runy rodiče + pořadí zrodu (zlatý řez), přímé větvičky ramene přes rozdělovač míst (`freeSpot`: odstup od starších i od povýšených). **Strana**: oblast čtení (nitro/svět) vůči směru rodiče, jinak střídavě. **Úhel**: tečna rodiče ± stálá odbočka. **Velikost**: zrod malá, doroste za `dorust` čtení, dál s čteními na ní; tvar řídí záměr/oblast čtení (steering).
- **Promítne se:** hustota a směr drobných větví; kořeny zrcadlí prvních `mirrorN` větviček (§10).

## 9. Povýšené větve — `growGrad`
- Nemají vlastní pramen ani kořen: součást pramene matky; matka je od kořene po místo odštěpení tlustší. Místo odštěpení: zóna jejích čtení do chvíle povýšení + rozdělovač míst (odstup od větviček matky). Úhel: od směru matky v místě odštěpení odbočí o stálý úhel (`GREL`) na stranu, která se určí jednou, v čtení povýšení (`_GTURN`: u strmé matky ven, u vodorovné nahoru; druhá povýšená téže matky a sousedé na téže straně se střídají). Délka: praxe × náběh × `gradLen`.

## 10. Kořeny — `buildRootFor`, `mirrorTwig`
- Každé rameno má kořen tvaru své runy (posuvníky KOŘENY); zrcadlo koruny = prvních `mirrorN` větviček ramene dolů. Povýšené větve kořen nemají.

## 11. Co lab ukazuje
- **Inspekce** (klik): rameno (kolikrát runa padla, kolik čtení nese, kdy vzniklo, místo, výška, směr, tíha), větvička (ze kterého čtení, na čem roste, kolik nese), kořen. **Přehled větví**: čtení, délka, tloušťka, větvičky, povýšené. **RŮST**: věk, čtení, prameny, ramena, sousední zóna, mix, expanze (⚠️ viz §2).
- **Posuvníky** jsou jen ty s viditelným účinkem (audit `tree_diag.js sliders`, `DEFAULTS=1` = výchozí hodnoty, jak je vidí KUKY); ODLOŽENO = kůra.

## 12. Kontroly
- **Smoke ㉳** `scripts/verify_tree_mista.js` (lab, výchozí posuvníky): výstupy ramen na stejné straně aspoň `exitMinPx`, levé–pravé polovinu, žádné rameno pod podlahou, větve na rodiči od sebe, každý nakreslený tah klikatelný, nejvýš 15 pramenů, inspekce = log.
- **Detektor překryvu** `scripts/utils/tree_overlap.js`: pro dvojice ramen a povýšených větví vzdálenost jejich čar po délce proti součtu polovin tloušťky (bez paty u kmene a místa odštěpení); úsek pod 25° = souběh (překryv), jinak protnutí. Zatím jen nástroj — do smoke až po opravě. ⚠️ **Hranice 25° je hrubá:** mělké křížení pod 21–24° (~20 px) hlásí jako souběh, i když jsou obě větve vidět (KUKYho strom 2026-10-03: Gebo + Uruz, Hagalaz + Eihwaz — ověřeno výřezem). Hraniční nález se ověřuje okem.
- Ruční: `scripts/utils/tree_diag.js` (`zony`, `misto`, `klik`, `jump2`, `limbjump`, `scen`, `zscen`, `sliders`) · `scripts/utils/tree_render.js` — KUKYho strom z několika verzí labu vedle sebe do PNG (před hlášením každé změny stromu, DECISIONS 2026-10-03 (15)).

## 13. Co se kde promítne — páka → účinek
| páka (panel) | promítne se do |
|---|---|
| max ramen · povýšení · tempo | počet ramen a povýšených větví (§3) |
| kam nejníž smí větev · rozestup ramen na stejné straně | výšky výstupů, kapacita kmene, růst kmene kvůli místu (§2, §3, §5) |
| napojení ramene · zdvih špičky ramen | tvar ramen po délce (§7) |
| čas čtení → výška | jak silně zóna posouvá výšku ramene (§5) |
| nitro/svět → natočení | úhel ramene za oblastmi čtení (§5) |
| tíha · kolik čtení ohne · neutrální poloha | úhel ramene (§5) |
| ætt → charakter · gesto · variace | prohnutí, vlnění, zdvih špičky ramen (§7) |
| délka hlavní · délka povýšené | délka ramen / povýšených (§7, §9) |
| max větví na jedné větvi · zrod · dorůst | hustota a velikost větviček (§3, §8) |
| KMEN: síla · náklon · propletení · rozestup · vlnitost · výška | kmen (§6) → výchozí bod a směr ramen (§7) |
| KOŘENY | kořeny (§10) |

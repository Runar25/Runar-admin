# ISA + Dvalin — studie scény karty (v0, k diskusi) — Cowork, 2026-10-18

Trpaslík je **hlavní postava, která význam runy dělá**. Níže: jak se karty skládají, co Isa znamená, čtyři úhly pohledu (náčrty v `isa_panels.png`), doporučení a prompt.
HEAD při čtení `9aacc01`. Nic není schválené.

## 1. Jak se oracle/tarot obraz staví (nejdřív to, ať víme, jakou cestou jdeme)

Zdroje: [Tarot Symbolism Decoded (elvitarot.com)](https://elvitarot.com/blog/tarot-symbolism-decoded-rider-waite/), [Rider–Waite Tarot (Wikipedia)](https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot). Shrnuto z nich + z obecné znalosti; **jde o dvě webové stránky, ne o odbornou rešerši**.

- **Postava nese téma karty**, okolí ho jen doplňuje. U Rider–Waite je hlavní postava vždy v akci, která *je* významem (Kouzelník zvedá hůl k nebi, Blázen stojí na kraji).
- **Gesto a pohled** říkají směr a stav: dlaň nahoru = přijímá, ruka k činu = vůle, pohled dolů = nitro. Směr pohledu vpravo = budoucnost, vlevo = minulost (u RWS tradice).
- **Pozadí je krajina, která význam dopovídá** (hory = překážky/cíle, voda = emoce, klidná vs. rozbouřená).
- **Rekvizity jsou málo a každá nese jednu věc** (růže, pes, lev). Co není významem, tam není.
- **Barva je systém:** zlatá = osvícení, šedá = obtíž, modrá = intuice, bílá = přechod, černá = neznámé.
- **Blízko/daleko:** co je blízko, je naléhavé; co je daleko, přijde později.
- **Pamela Colman Smith udělala z číselných karet celé scény** (místo pár symbolů), a právě to z nich dělá „bohaté obrazy“ — to je cesta, kterou chcete i vy: **každý význam runy = jeden viditelný prvek ve scéně**.

**Můj receptář pro Rúnarovy karty (aplikovatelné na všech 25):**
1. Seznam významů runy (z `k` + ownerových popisů + DESIGN).
2. **Ke každému významu jeden viditelný prvek** v islandské přírodě (kde to jde, vzít obraz, který už Rúnar zná — `RUNE_IMAGES`).
3. Trpaslík je v pozici, která dělá **sloveso runy** (Isa: nehýbe se).
4. Tři vrstvy: popředí (gesto a předmět), střed (příběh), pozadí (nálada, počasí, světlo).
5. Nejvýš 5–6 symbolů; víc = přeplněno a zmizí hlavní postava.
6. Barva podle významu + paleta Agndofy (jedna barva dominuje).
7. Dolní pětina klidná pro text; v obraze žádné písmo.

## 2. Význam runy Isa (zdroje; ne z hlavy)

- `k` v `runar-runes.js`: **ice, stillness, waiting, pause, clarity through cold**.
- Ownerův popis (`RUNAR_POPISY_RUN.md`): ticho; voda ztuhne a není kam spěchat; není konec, jen čas ještě nenastal; **pokušení rozbít led a zatlačit**; některé věci nejdou urychlit; **pod ledem voda stále existuje, jen pohyb není vidět**; **jedna linie, jeden okamžik** (soustředění); **není prázdná** — ticho, ve kterém se ukáže, co zůstane, když přestaneš tlačit. Otázka: *co se právě nehýbe a co bys uviděl, kdybys to nechal být?*
- `RUNAR_DESIGN.md`: Isa + **Dvalin** = *zastaveno nahoře, dole to žije*; Dvalin je „kámen, co dřímá pod mechem — probouzí se pomalu a nikdy nebyl pryč“.
- **Obrazy, které Rúnar pro Isu už má** (`RUNE_IMAGES`, `v2/runar-character.js` ř. ~444–657) — **všechny islandské, a každý nese jeden význam**: bezvětrný sníh padá rovně (stillness) · rybník zamrzl a nic nežádá (waiting) · **pod ledem se ještě ozývá potok** (ice) · **klid leží na fjordu a nic se nehne, ani pták na kameni** (stillness) · **loď zamrzlá v přístavu, ale fjord za ní je otevřený** (pause) · **ve mrazu je vzduch tak čistý, že farma na druhé straně fjordu vypadá na dosah** (clarity through cold) · hodiny, co nikdo nenatáhl, a vychladlá káva (domácí). ⚠ Přenos textových obrazů do vizuálu je **nové rozhodnutí**, ne tichý import (jak říká `RUNAR_POPISY_RUN.md`); tady jen navrhuji.

## 3. Čtyři úhly — viz `isa_panels.png`

| | Úhel | Co dělá Dvalin | Jak nese významy | Hlavní riziko |
|---|---|---|---|---|
| **A** | Okamžik ticha (příběh) | sedí tak dlouho, že mu na rameni přistál pták a na botách roste mech; plochá dlaň nad ledem | všech 5 `k` + „pod ledem teče“ a „kladivo odložené“ | přeplněnost |
| **B** | Dvě patra (řez ledem) | sedí na ledu, dlaň položená, poslouchá, co je dole | dole žije modrá nit vody, kámen a kořeny | schéma / „fantasy řez“, méně Islandu |
| **C** | Zdržené kladivo | zvedl kladivo a druhá ruka ho drží | pokušení rozbít led | akce; dominantní kladivo kazí klid |
| **D** | Jedna linie | malý, nehybný v bílé prázdnotě | soustředění, čistota | nejchudší |

## 4. Doporučení: A jako základ + malý kousek B

A říká nejvíc významů v jediné scéně a stojí na obrazech, které už Rúnar má. Z B si vezmu jen jednu věc: **led je průhledný a vidí se pod ním tmavý proud** (bez řezu, bez dvou pater), protože to dělá z Isy „není prázdná“.

**Scéna (popředí → pozadí):**
- *Popředí:* Dvalin sedí na mechovém balvanu u zamrzlého rybníka. **Plochá dlaň** nad ledem, nedotýká se. Kladivo na led leží vedle něj. Na rameni mu sedí **pták, který se nehýbe**; na botách a v bradě **jinovatka a mech**.
- *Střed:* **led průhledný jako sklo**; pod ním **tmavý proud vody** (jediná tmavá linie obrazu).
- *Pozadí:* **fjord, kde je loď zamrzlá v přístavu, ale za ní otevřená voda**; **vzdálená farma ostrá jako na dlani** (čistý vzduch). Sníh **padá rovně**, žádný vítr.
- *Světlo a barva:* nízké zimní slunce, ledově modrá + bílá; jediná teplá skvrna = Dvalinův přívěsek se **svítící runou ᛁ** a okraj lucerny; paleta: frost white, rune cloth blue, obsidian, whisper blue.
- *Gesto/pohled:* pohled **dolů na led**, ne do dálky (nitro, čekání); zavřené nebo přivřené oči, **dech není vidět**.

**Islandské znaky, které generátor musí dostat výslovně** (jinak nakreslí Aljašku/Kanadu): černá sopečná skála vyčnívající ze sněhu, mechová lávová pole, fjord se strmými holými horami, nízký březový porost místo jehličnatého lesa, turfový dům s dřevěnou klenbou, nízké zimní slunce, ledové kry s černými pruhy popela. **Žádné** jehličnaté lesy, srnci, saně, igloo, polární medvědi.

## 5. Čeho se vyvarovat u Isy (z popisů + DESIGN)

- Žádná mrtvola ani „zamrzlý nešťastník“; Dvalin **žije a odpočívá** (DESIGN: dřímá, nikdy nebyl pryč).
- Žádný třesoucí se trpaslík, žádná pára z úst (dech není vidět je i součást ticha), žádný oheň — kromě malé lucerny a svítící runy.
- Není to „smutek“ — je to ticho a čistota; barvy chladné, ale **ne depresivní**.
- Jedno kladivo odložené, ne jako hrozba.
- Ať se nesplete s Hagalaz (kroupy, zničení) a s Nauthiz (nouzový oheň): žádné krupobití, žádný ohýnek v rukou.

## 6. Prompt (A + kus B) — pro generátor, s přiloženým `runar-fullbody.png` a `sacred-palette.png`

> Same character family and art style as the attached Rúnar character sheet. Portrait card composition, 70×120. **Dvalin**, a sturdy, compact Nordic dwarf with a long frost-white braided beard and hair threaded with small rings, wearing a pale blue-grey wool coat with fur trim and Nordic knotwork, sits perfectly still on a moss-covered black lava boulder at the edge of a frozen pond; rime on his beard and shoulders, moss growing over his boots; his eyes half closed, looking down at the ice; one flat open palm held just above the ice without touching it; a small bird sits motionless on his shoulder; an ice hammer lies beside him on the snow. The ice is clear as glass and shows a thin dark stream of water flowing beneath it. His forehead carries a faint rune ᛁ and his obsidian pendant glows whisper-blue with the same rune. Behind him: an Icelandic fjord with steep bare mountains, a small wooden boat frozen into the harbour with open dark water just beyond it, and a distant farmhouse with a turf roof shown crisp and clear in very still, cold air; snow falls straight down without wind; low winter sun, pale gold on the mountain tops; no trees except a few low birch shrubs. Palette: frost white, rune-cloth blue (#2E4A70), obsidian, whisper blue (#5BB8FF) only on the rune. Calm, silent mood — stillness, not sadness. Leave the lower fifth uncluttered. No text. No breath clouds, no fire, no pine forest, no igloo, no sled.

## 7. Nejsilnější argument PROTI (čestně)

- **Přeplněnost:** 6 významů v jedné scéně je na hraně; u RWS je to 3–5 symbolů. Pokud generátor scénu rozbije, **vyhodit nejdřív kladivo a loď**, ponechat: dlaň nad ledem, pták, průhledný led s proudem, čistý vzduch a farmu.
- **Kdo čte kartu, významy runy neviděl**: obraz musí fungovat i bez nich; „pták na rameni“ je srozumitelný, „loď v přístavu“ nemusí být.
- **Isa je nejtišší runa; ostatní jsou hlasitější.** Pravidlo „každý význam = prvek“ se u Hagalaz nebo Tiwaz může dostat do konfliktu s kompozicí. Isa je dobrý první test, ne důkaz.
- **Jeden pták a jedno kladivo jsou moje nápady**, ne z popisů — pták je z Rúnarova obrazu „ani pták na kameni“, kladivo z popisu „potřeba rozbít led“.

## 8. Co od ownera

Z čtyř úhlů vyber jeden nebo kombinaci (moje doporučení: A + průhledný led z B). Potom stejný postup použiju na další runy.

# RUNAR_TREE.md — Strom života: DUŠE · ZÓNY · STAVBA
# KANONICKÝ VSTUPNÍ BOD. Čti tohle první. Ostatní tree doky = detail/historie (mapa v §9).
# Vznik: 2026-07-04 · Cowork · konsoliduje RUNAR_TREE_BUILD + placement + DESIGN (příběh) do jednoho místa.

---

## 0. TL;DR (30 sekund)
- **Strom jsi ty.** Kmen = kdo jsi (Life Rune). Strom ukazuje jednu věc: **rosteš ke svému kmeni, nebo od něj.**
- **Umístění = ZÓNY:** čas (Norny → výška) × dovnitř/ven (area → strana). **Element = jen barva. Runa = tvar.**
- **Větev = runa**, posílená opakováním (ne nová tenká). Hlavní větve zastropené (~7–12) kvůli vzhledu — **ne per-element.**
- **Systém je otevřený:** nová oblast (i pozdější osobní otázky) = jen souřadnice na osách. Žádná přestavba.
- **Engine = crown-composer, NESAHAT.** Mění se jen data + umístění, po malých krocích na kopii.

---

## 1. DUŠE — co strom vypovídá o člověku
Z `RUNAR_TREE_BUILD.md`: *„Strom jsi ty. Větev není záznam toho, co bylo řečeno — je záznam toho, co se pohnulo. Strom je mapa významu, ne geometrie."*
Z `RUNAR_DESIGN.md`: *„Kmen jsi ty. Vše ostatní roste ke kmeni, nebo od něj. Strom ví jednu věc: jestli rosteš ke svému kmeni, nebo od něj. Harmonie není cíl, napětí není selhání — rozdíl ti řekne, kde jsi."*

Strom NEukazuje „87 % oheň". Ukazuje **kdo jsi (kmen) + kam dáváš pozornost + jestli k sobě rosteš, nebo od sebe.** Element je barva toho příběhu, ne jeho kostra.

**„Ke kmeni / od kmene" = konkrétně (mechanika, ne poezie):** kmen = tvůj střed. **Ke kmeni** = pozornost sebraná — zóny se plní vyváženě, strom roste plný kolem osy. **Od kmene** = ujela k jednomu okraji — jedna zóna/strana bobtná, ostatní zůstávají holé, strom se naklání a je z druhé strany dutý. Měří se **rozložením + mohutností větví přes zóny.** **Není to soud** (vyvážený ≠ dobrý) — sám náklon je zpráva („vyrostl jsi celý do koruny-svět, kořeny a nitro máš holé"). „Napětí" = tah mezi protilehlými okraji; „harmonie" = sebráno kolem středu; *rozdíl ti řekne, kde jsi.*

Test „je zajímavé se dívat": *přečteš ve stromě vlastní život?* (velká zlatá větev lásky, holá kariéra, tmavý kořen z loňské zimy, letos zelené výhony smyslu.)

---

## 2. IDENTITA (pevná, jednou)
- **Kmen = Life Rune** (z data narození, `calcLifeRune`) = ty. **Life Rune NENÍ barva-element** (těch je 5 — §3); je to KMEN, sám uživatel. Neměnné navždy. Náklon ≤0.45, barva dle elementu Life Rune.
- **3 kořeny = 3 Norny** (zakládací Norns čtení): urð = jádro/minulost · verðandi = směr/teď · skuld = pohon/budoucnost.
- **Kořeny jsou živé:** když se runa z kořene vrátí v pozdějším čtení → ten kořen prohloubí/posílí.

---

## 3. ZÓNY — jak každé čtení najde místo (JÁDRO)
Dvě **spojité, prolínající se** osy. Box (runa/oblast) do zóny jen *míří* (tendence), není přibitý — proto se zóny protínají a strom žije.

**Osa A — ČAS / NORNY (výška):**
`urð = kořeny (minulost, co tě utvořilo) ↔ verðandi = střed (teď) ↔ skuld = koruna (kam míříš)`
Řídí (priorita): **intention › area › seeking › (fallback) world runy.** Vážené hlasování na škále urð(−1)…skuld(+1) → **spojitá výška**, ne tři přihrádky.

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

**Element ≠ zóna:** dává jen **barvu** + mikro-výšku uvnitř zóny (fire +0.15 … shadow −0.25) + úhel odchodu (šířka). **5 barev-elementů: Fire · Water · Air · Earth · Shadow** — Shadow = studené/skryté runy (Isa/Hagalaz/Perth/Eihwaz/Blank; váže se na cold-steering ve čtení). **Life Rune NENÍ barva-element — je to KMEN = ty.**
**Runa = tvar/silueta. Ætt = charakter růstu** — z tématu ættu: Freya (svět/tělo/radost) → plynulé · Heimdall (osud/skryté/cyklus) → gnarled/uzlovité · Týr (řád/dokončení) → řízené. Ætt NEurčuje výšku.

---

## 4. VĚTEV = JEDNO ČTENÍ (signály → co větev je)
| Signál | Určuje |
|---|---|
| **Norns osa** (§3A) | ZÓNA = výška (kořeny/střed/koruna) |
| **area** | STRANA (dovnitř vlevo / ven vpravo) |
| **element** | BARVA + mikro-výška + úhel (šířka) |
| **runa** | TVAR / silueta — ✅ ŽIVÉ od 2026-07-19 (n-tá větev elementu = n-tá nejčastější runa) |
| **ætt** | sekundární charakter růstu |
| **spread** | KOMPLEXITA (single=uzel · Norns=3 kořeny · Kříž=větev+4 · Horseshoe=větvená · Yggdrasil=roční prsten) |
| **počet vyplněných polí** | VÁHA / mohutnost |
| ~~čas od minula~~ | ZRUŠENO 2026-07-19 — druhá půlka zrušené penalizace, strom čas neřeší |
| **Blank/Óðinn** | průsvitná duch-větev (~15 %, bez listů) |

---

## 5. RŮST + POSÍLENÍ
- **Opakování posílí** existující větev (2× blíž · 3× cluster · 4× srůst = shared root), NEtvoří tenkou novou.
- **Portrét = mix + velikost, ne počet.** Soustředěný člověk = pár mohutných větví; pestrý = široký baldachýn.
- **Strop hlavních větví ~7–12** (čitelnost — „moc = přeplácané"). Přebytek → posílí nejbližší / hmota kmene. **Strop NENÍ per-element** (elementy mají prostor přes svých ~5 run + posílení).

---

## 6. OTEVŘENOST (rozšiřitelnost = princip)
Nová oblast, nový typ čtení, **pozdější osobní otázky na Rúnara** = dostanou **jen souřadnici na osách** (náklon Norns + dovnitř/ven). Žádný nový slot, žádná přestavba — strom to vstřebá. Tohle drží systém živý a zrající spolu se stromem.

---

## 7. VRSTVA VÝZNAMU — The Gathering (později: až `tree_state` DB + `detectPatterns()`)
**Zásada:** Rúnar = **zrcadlo tvé pozornosti, ne předpověď událostí.** Reflektuje, nepředpovídá (rule → working-style). Proto **skuld = záměr / k čemu se táhneš**, NE věštba budoucnosti.

**The Gathering = strom se ČTE jako celek.** Normální čtení strom *roste* (přidá větev = zápis). Gathering strom *čte* — `detectPatterns()` projde nasčítané (Muninn = `tree_state`), najde zralý opakující se vzorec, a Rúnar mluví o TOM vzorci (ne o čerstvé runě).

**Tři hloubky = KDE vzorec dozrál (jména = poloha, ne věštecká moc):**
- **Orel** (koruna / skuld) = vzorec v korunních větvích → *k čemu se pořád vztahuješ* (záměr/směr). Tón širší, „co tě to učí?".
- **Níðhöggr** (kořeny / urð) = vzorec v kořenových větvích, nebo **stagnace** (přestal jsi číst) → *co tě drží / co nechceš vidět.* Tón těžší, „co odmítáš vidět?".
- **Ratatoskr** (celý strom) = korunní **A** kořenový vzorec zralý naráz = **Full Gathering** (vzácný) → napětí mezi „odkud jdeš" a „kam míříš".

**Vzorec** = prahové opakování v okně (3× runa · 4× element · 5× area · návrat runy…). **Vzácné a zasloužené** — vždy dozraje jen jeden nejsilnější; naskočí jako **Huginn CTA** (posel „strom ti chce něco ukázat") → opt-in, **3 kredity, všechny tiery.** Po spuštění se vzorec označí „viděno" (nespustí znovu, dokud výrazně nenaroste / nedozraje jiný). Manuální „vyber runy z journalu" Gathering = **MRTVÁ** (retired).

**Jedna detekce, dvě tváře:** `detectPatterns()` pohání Gathering (Rúnarova slova) i **speciální vizuály** (`RUNAR_TREE_SPECIALS.md`) + stavy větví (pulz/shimmer).

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
  s příznakem `blank:true`. Renderer měl duchovní větev připravenou celou dobu
  (`runar-branch.js`, `k:'odinn'`) — jen se k ní nikdy nedostal. **Vizuál ducha (průsvitnost,
  bez listů) zatím NENÍ** — to je práce v enginu, čeká na vlastní krok.
- ✅ **Přehrávání růstu (2026-07-19).** Posuvník nad stromem, krok po JEDNOM čtení, až
  k zakládacímu stavu. Posílá se jen kratší log; věk se počítá z jeho délky, takže strom
  u čtení č. 3 vypadá jako tehdy, ne jako dnešek s méně větvemi. Engine netknutý.
  **Je to měřicí přístroj, ne ozdoba** — bez něj nešlo poznat, jestli změna umístění větví
  vůbec něco udělala, a přesně proto obě osy mlčely dva měsíce.
- ✅ **Runa → tvar (2026-07-19).** Tvarová data (curve/sub/taper/tipc/rhy per runa) byla hotová,
  jen renderer bral tvar podle POŘADÍ větve — takže všichni uživatelé měli stejné siluety.
  Nově: **n-tá větev elementu = n-tá nejčastější runa toho elementu** (pestrost zůstává, ale
  něco znamená). Přetvaruje se, když se pořadí změní; při remíze vyhrává dřívější runa.
- ✅ **Inspekce klepnutím (2026-07-19, admin).** Klik na větev řekne runu · element · ætt ·
  svět · počet čtení · kolikátá větev elementu. Aby owner místo „nějaká větev poskočila"
  předal diagnózu. Souřadnice = **poloha na posuvníku**, ne číslo runy.
  Vybraná větev se obtáhne zlatě a **výběr přežije posun posuvníku** — tak jde sledovat,
  jak se JEDNA větev mění v čase.
- ⚠️ **Pořadí run osciluje kolem remízy** → větev překlápí siluetu sem a tam a vypadá to
  jako závada. Tohle už jednou opravené bylo (zmrazením na první viděnou runu) a krok 3
  to zmrazení zrušil. Návrh: hystereze (převzít tvar, až nová runa vede o práh).
  ČEKÁ NA ROZHODNUTÍ. Detail → RUNAR_DECISIONS.md 2026-07-19.
- ⚠️ **Renderer NENÍ deterministický** (vada předchází všem třem krokům, ověřeno i na produkci):
  týž log dá jiný obraz od 3. překreslení. Uživatel uvidí, jak se strom sám změnil bez nového
  čtení; nám to znemožňuje porovnávat obrazy. Detail → RUNAR_DECISIONS.md 2026-07-19.
- **Zbývá ze signálů §4:** váha z počtu vyplněných polí · seeking jako třetí hlas (§3A)
  · vizuál duchovní větve pro Blank.
  (**Bonus za pauzu ZRUŠEN** 2026-07-19 — byla to druhá půlka zrušené penalizace.)
- **Zbývá (velký směr = owner volba):** **produkce** (`tree_state` DB + reálná čtení z readeru) · **per-runa** (runa se odštěpí z elementového ramene ve své zóně = hlubší bough) · nebo **ladit** stávající. Aktuální stav labu = `RUNAR_TREE_TODO.md`.
- **Boughs velká přestavba = ZAMÍTNUTO** (regrese — viz RUNAR_DECISIONS 2026-07-04). Koncept „runa=větev" OK jako cíl, cesta = jemné kroky.

---

## 9. MAPA TREE DOKŮ (kde co je + status)
**Čti podle potřeby, ne všechno. Status říká, čemu věřit.**

| Doc | Co obsahuje | Status |
|---|---|---|
| **RUNAR_TREE.md** (tenhle) | duše + zóny + stavba + mapa | **★ KANONICKÝ — čti první** |
| RUNAR_TREE_BUILD.md | z čeho se strom tvoří (signály, Norns osa) | KANONICKÉ (vstřebáno sem) |
| runar-tree-placement.md | kde runa je (zóny/strana/úhel, data run) | KANONICKÉ (vstřebáno sem) |
| RUNAR_DESIGN.md (tree části) | příběh, mytologie, „co část znamená" | KANONICKÉ pro příběh |
| RUNAR_TREE_TODO.md | stav labu + fronta bodů | AKTIVNÍ (zdroj stavu enginu) |
| RUNAR_TREE_SPECIALS.md | katalog speciálních motivů | AKTIVNÍ (kandidáti, probrat) |
| RUNAR_TREE_RENDER.md | vizualizace / materiál (jak vypadá) | AKTIVNÍ (foundation) |
| docs/TREE_BRIEF_CODE_2026-07-04.md | brief pro Code (krok 1/boughs/specials) | AKTIVNÍ (handoff) |
| memory/runar-tree-living-movement.md | recept kroku 1 + živý pohyb (odložen) | ČÁSTEČNĚ AKTIVNÍ |
| runar-tree-forces.md | síly mezi runami | ODLOŽENO (pozdější lak, ne základ) |
| tree-of-life.md | branch objekt, bloom, Gathering přehled | ČÁSTEČNĚ (vstřebáno) |
| RUNAR_TREE_BOUGHS.md | hierarchie ramen | SUPERSEDED (přestavba = regrese) |
| RUNAR_TREE_GROWTH_MAP.md | analýza starého v3.2 modelu | HISTORIE (diagnóza) |
| memory/runar-tree-engine-lab.md | engine iterace + ⭐ oprava boughs | HISTORIE (+ 1 live korekce nahoře) |
| RUNAR_TREE_HANDOFF.md · RUNAR_TREE_LAB.md (ARCHIV: docs/archive/tree/) | starší master handoff / lab historie | HISTORIE / reference |
| runar-patterns.md | Gathering/vzorce | ZASTARALÉ (surovina, vše probrat) |

**Archivováno do `docs/archive/tree/`** (2026-07-04): RUNAR_TREE_BOUGHS · RUNAR_TREE_GROWTH_MAP · RUNAR_TREE_HANDOFF · RUNAR_TREE_LAB. Nic se neztratilo — jen uklizeno z rootu.

---
*Když se něco z tohoto změní rozhodnutím → nový záznam do RUNAR_DECISIONS.md + oprava tady (§16). Tento soubor drží „co a proč"; RUNAR_TREE_TODO.md drží „co zrovna děláme".*

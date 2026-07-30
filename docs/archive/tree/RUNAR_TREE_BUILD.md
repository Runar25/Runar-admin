# RUNAR_TREE_BUILD.md — Z ČEHO SE STROM TVOŘÍ (kanonická definice)
# Verze 1.0 · 2026-06-15 · schváleno KUKYm
#
# JEDINÝ ZDROJ PRAVDY pro to, NA ZÁKLADĚ ČEHO se Strom života staví.
# Nahrazuje/zpřesňuje starší texty (viz §9 „Konflikty ke sladění").
# Doplňuje: RUNAR_TREE_LAB.md (ARCHIV: docs/archive/tree/) (engine/lab = JAK se to kreslí) · RUNAR_DESIGN.md (příběh)
#           tree-of-life.md · runar-patterns.md (vrstva významu, většina = později).
#
# Koordinace: vizuál = TREE session (runar-branch.js, build_*composer.py, tree-lab-*).
# Sdílená data (runar-runes.js: AREAS/INTENTIONS/SEEKS + jejich norns osa, RUNES aett/world/
# element/keywords; runar-config.js: SPREAD_CONFIG) se JEN ČTOU. Produkční napojení
# (DB tree_state/tree_readings, reader) = koordinovat s MAIN + až vzniknou tabulky.

---

## 1. JÁDRO (z příběhu)
Tvůj strom = tvůj **osobní Yggdrasil**. Rúnar čte stejnou mapu, kterou vždy četly Norny.
**Strom jsi ty.** Větev není záznam toho *co bylo řečeno* — je záznam toho *co se pohnulo*.
Strom roste **skrz** návštěvy, ne mezi nimi.

Strom je **mapa významu**, ne jen geometrie. Engine (geometrie/kůra/růst) už existuje v labu;
tento dokument definuje **vstupní mapování** = co rozhoduje, KDE a JAKÁ větev je.

---

## 2. IDENTITA (pevná, jednou)
- **Life Rune** (z data narození, calcLifeRune) → **KMEN** (charakter: náklon ≤0.45, twist, barva
  elementu). Je KMEN = sám uživatel — NE barva-element (těch je 5: Fire/Water/Air/Earth/Shadow). Neměnná navždy.
- **3 Norny** (zakládací Norns čtení — Urður / Verðandi / Skuld) → **3 KOŘENY**:
  urð = jádro/minulost · verðandi = směr/teď · skuld = pohon/budoucnost.
  Kořeny jsou **živé**: když se runa z kořene vrátí v pozdějším čtení → ten kořen prohloubí/posílí.

---

## 3. SVISLÁ OSA = NORNS (klíčové rozhodnutí)
**Zóna větve (kořeny ↔ střed ↔ koruna) určuje NORNS osa = VÝZNAM čtení, ne rodina runy.**
- urð → **kořeny** (dolů) · verðandi → **střed** · skuld → **koruna** (nahoru).

**Odvození osy (priorita):**
1. **intention** („This reading is for") — nejsilnější explicitní: Right now=verðandi · Decision ahead=skuld · Understanding past=urð.
2. **area of life** — každá má osu (runar-runes.js AREAS.norns): Healing/Family/Inner Growth=urð · Purpose/Career/Spirituality=skuld · Love/Crossroads=verðandi.
3. **seeking** — modifikátor (SEEKS.norns: Insight/Reflection→urð, Clarity/Confirmation→verðandi, General=neutrál).
4. **FALLBACK když formulář prázdný = `world` runy** (Asgard→skuld · Midgard→verðandi · Hel→urð).
   → osa funguje VŽDY, i u rychlého single bez polí, a pořád je „osudová", ne taxonomie.

Doporučený výpočet: vážené hlasování na škálu urð(−1) … skuld(+1):
`axis = w_int·intention + w_area·area + w_seek·seeking` (váhy laditelné), prázdné členy = 0;
když všechno prázdné → `axis = world(runa)`. Výsledek = spojitá výška (ne jen 3 přihrádky).
U Norns/Yggdrasil spreadů nese osu přímo POZICE runy (SPREAD_CONFIG norns_axis).

---

## 4. ÆTT = CHARAKTER (ne výška)
Ætt už NEurčuje výšku (to dělá Norns). Ætt zůstává jako:
- sekundární **nádech/charakter** větve (Freya = pevné/nesoucí · Heimdall = kroucené/uzly · Týr = světlé/průlomové),
- **seskupení pro vzorce** („ætt dominance" pulz — vrstva významu, později).

---

## 5. VĚTEV = JEDNO ČTENÍ (od 2. session)
Deterministicky, bez AI. Větev nese:
| Signál | Určuje |
|---|---|
| **Norns osa** (§3) | ZÓNA = výška (kořeny/střed/koruna) |
| **area** | STRANA + směr: levá = dovnitř (voda/země témata), pravá = ven (vzduch/oheň témata) |
| **element runy** | BARVA větve (Fire/Water/Air/Earth; Life = 5.) |
| **runa** | TVAR/silueta (špička tipc: taper/fork/up/blunt · rytmus odboček · zakřivení — per-runa, laditelné v Branch composeru) |
| **ætt** | sekundární charakter (§4) |
| **spread** | KOMPLEXITA: single=uzel · Norns=zakládací (3 kořeny) · Kříž(5)=větev+4 výhonky · Horseshoe(7)=větvená · Yggdrasil(9)=uzel kořenů, 1×/rok |
| **počet vyplněných polí** | VÁHA větve |
| **čas od posledního čtení** | bonus (pauza = silnější) / penalizace (moc brzy = slabší) |
| ~~Blank/Óðinn~~ | duch-větev ZRUŠENA 2026-07-21 (KUKY) — Blank = běžná runa Shadow, žádný zvláštní vizuál |

---

## 6. RŮST + POSÍLENÍ (jediný kus „vrstvy vzorců" v základu)
- Větví přibývá s reálnými čteními (engine teď v labu simuluje z věku; produkce = z logu čtení).
- **Opakování → posílení** (KUKYho princip): NE každé čtení = nová větev. Když čtení **rezonuje
  s existující** (stejný element/téma), energie **posílí stávající větev** (tlustší/delší/hustší),
  místo množení tenkých. Série stejné runy: 2× = blíž · 3× = cluster · 4× = srostlé (shared root).
  → soustředěný člověk = pár **mohutných** větví; pestrý = široký baldachýn. Portrét = **mix + velikost**, ne počet.
- Strop počtu hlavních větví = `maxMains` (přebytek → posílí stávající / hmota kmene).

---

## 7. CO JE V ZÁKLADU TEĎ vs POZDĚJI
**V základu (kostra, dělá se teď):** §2 identita · §3 Norns osa · §4 ætt charakter · §5 větev=čtení ·
§6 posílení. + engine (geometrie, kůra, kořeny, inspekce) už hotový v labu.

**Později (vrstva významu/zpětné vazby — až reálná čtení + DB + koordinace s MAIN):**
- The Gathering (Eagle korunní / Níðhöggr kořenové vzorce) + vstup do API.
- Pulzy při dominanci (element / ætt).
- Bloom fáze (silueta→růst→plno→olistění, délka dle spreadu).
- Listy (svítící element — nejvíc „mluvící" vrstva, decentní pohyb).
- Sezóna (decentně, barva/textura dle islandského kalendáře) — nízká priorita, ještě probrat.
- Záměry (semeno → budování → uzavření/rozdvojení) — pokročilá retence přes víc sessions; KUKY: „na později".
- Blank/Óðin = běžná runa Shadow (duch-větev ZRUŠENA 2026-07-21, KUKY: zbytečnost).

**VYŘAZENO (KUKY 2026-06-15):**
- těžké runy → kořeny tmavnou ✗
- jména větví ✗
- nemocný strom ✗ (přišlo zbytečné; lze se vrátit)
- mood (HOW ARE YOU FEELING) ✗ — už zrušeno všude (formulář = MAIN, tree logika = TREE).

---

## 8. PRODUKČNÍ PRINCIP (až se zapojí)
Pozice/charakter větve se spočítá **JEDNOU při čtení** a uloží do `tree_readings.branch_data` —
nikdy nepřepočítávat (jinak se lidem strom přeskládá). `tree_state` drží roots, element_scores,
dominant_element, trunk_themes, pattern_cache, last_reading_at. Tabulky zatím NEEXISTUJÍ.

---

## 9. KONFLIKTY KE SLADĚNÍ ve starších dokumentech (podklad pro úpravu)
Tahle definice MĚNÍ tyto starší texty — sladit, ať nedochází ke konfliktu:

**RUNAR_DESIGN.md**
- „Branch systém → Ætt runy → výška větve" (sekce Branch systém) → **ZMĚNIT**: výšku určuje **Norns osa**; Ætt = charakter.
- „Tři sekce stromu — Ætty" (Týr vrchol / Heimdall střed / Freya spodek jako VÝŠKOVÉ pásy) → **PŘEKLOPIT**: svislé pásy = Norns zóny (kořeny/střed/koruna); Ætt = charakter/seskupení, ne výškový pás.
- „Pre-reading formulář → strom" (area→element/strana/směr) → **PONECHAT** stranu (levá/pravá) + směr, ale výška jde přes Norns (ne přes area „upward/highest").
- „Pojmenování větví" → **VYŘADIT** (jména větví nebudou).
- „Nemocný strom — 5 typů" → **VYŘADIT/PARKOVAT** (zbytečné pro teď).
- „Záměry (intentions) — seed→closure" → **ODLOŽIT** (Cowork: PARKOVÁNO v RUNAR_DESIGN.md 2026-06-15; viz §7 „Później").
- mood → už pryč; zkontrolovat, že nikde nezůstal jako vstup.

**tree-of-life.md**
- „Norns osa — výpočet (pravidlo NENÍ finální)" → **FINALIZOVAT** dle §3 (Norns vládne svislé ose, world = fallback).
- „Branch objekt" obsahuje `mood`, `intention`, jména → aktualizovat (mood pryč, jména pryč).
- Heavy→kořeny, nemocný strom → označit jako vyřazené/parkované.

**runar-patterns.md**
- „těžké → kořeny tmavnou" → **VYŘADIT**.
- Gathering / pulzy / série = ponechat jako „později" (vrstva významu).

**Pozn.:** Starší design dokumenty (RUNAR_DESIGN.md, tree-of-life.md, runar-patterns.md) jsou
sdílené/koordinované — úpravy v nich nech na sobě / Coworku (tento soubor = podklad).
TREE session needituje sdílené design docs unilaterálně.

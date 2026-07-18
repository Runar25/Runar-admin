# Rúnar — Pattern Detection & Gathering Design
# Zdroj: patch v0.9 (2026-06-05), aktualizováno 2026-06-15
# Implementační stav: DATA v kódu, LOGIKA čeká na detectPatterns() (druhá fáze)
# Kanonická definice stromu → RUNAR_TREE_BUILD.md v1.0 (2026-06-15)
#
# ⚠️ PRACOVNÍ VERZE — myšlenka je správná, detaily nejsou finální.
# Kdokoli z toho čerpá (Claude Code, Cowork, člověk) musí nejdřív
# konzultovat s Kukim co je aktuální — NIKDY implementovat přímo bez potvrzení.
# Změny vizuálního stromu: VYŘAZENO heavy→kořeny tmavnou (viz sekce TĚŽKÉ KOMBINACE).
#
# Viz také:
#   RUNAR_DESIGN.md   — filozofie, mytologie, spreads, Ætty, sezóny
#   tree-of-life.md   — Tree of Life: zakládací rituál, větve, bloom durations, vizuální stavy
#   CLAUDE.md         — technická pravidla, implementační stav
#   runar-config.js   — PATTERN_WINDOW, HEAVY_RUNES, TRANSFORMATION_PAIRS (data v kódu)

---

## PATTERN_WINDOW (v kódu: PATTERN_WINDOW v runar-config.js)
```
{ high: 7, mid: 14, low: 30 }  // dny
```
Negatuje vzorec — určuje INTENZITU vizuální a tónové reakce.
Beyond low: vzorec stále zaznamenán, minimální vizuální reakce.

---

## EAGLE VZORCE — korunní (skuld/verdandi větve)

| Trigger | Podmínka | Okno |
|---------|----------|------|
| Potvrzovací série | 3+ stejná runa | pattern_window |
| Element dominance | 4+ stejný element | pattern_window |
| Area repetice | stejná Area 5+ po sobě | low (30 dní) |
| Návrat runy | runa chyběla 6+ měsíců a vrátila se | vždy HIGH intenzita |
| Protiklady | flood_fire nebo roots_in_wind ve stejném týdnu | fixní 7 dní, vždy HIGH |
| Ætty dominance | 3+ run ze stejné Ætty | pattern_window |
| Transformační pár | definovaný pár nalezen | pattern_window |

---

## NÍÐHÖGGR VZORCE — kořenové (urd větve)

| Trigger | Podmínka | Okno |
|---------|----------|------|
| Těžká runa v kořeni | těžká runa 3+ v urd pozici | pattern_window |
| Těžká kombinace | 2+ těžké runy v jednom čtení | — |
| Opakující se urd Area | urd Area opakovaně | low (30 dní) |
| Zimní slunovrat | Dec 21 + specifická runa | vždy HIGH |
| Stagnace — nízká | 30 dní bez čtení | → Níðhöggr nízká |
| Stagnace — střední | 60 dní bez čtení | → Níðhöggr střední |
| Stagnace — vysoká | 90 dní bez čtení | → Níðhöggr vysoká |

---

## ELEMENTÁRNÍ KOMBINACE (v kódu: TRANSFORMATION_PAIRS pojmenovány — logika chybí)

Protiklady (napětí):
- **flood_fire** — Oheň vs. Voda
- **roots_in_wind** — Vzduch vs. Země

Spojenci (harmonie):
- **ember_breath** — Oheň + Vzduch
- **stone_growth** — Voda + Země

Vizuální efekt: intenzita per pattern_window
- do 7 dní: silný vizuální efekt (HIGH)
- do 14 dní: střední (MID)
- do 30 dní: slabý, Rúnar zaznamená (LOW)

---

## POTVRZOVACÍ SÉRIE (k testování po 50 uživatelích)

```
2× stejná runa → runa klepe na dveře
3× stejná runa → runa stojí ve dveřích
4×+ stejná runa → runa je doma
```

Každý stupeň = hlubší výklad, ne silnější. Runa čeká — nevtírá se.

VIZUÁL na stromě:
- 2× → druhá větev roste blíže první (cluster)
- 3× → třetí větev, cluster se zahušťuje, junction zlatavý
- 4×+ → větve tvoří jeden silný útvar (jako by srostly, shared root)

---

## TĚŽKÉ KOMBINACE

Těžké runy (v kódu: HEAVY_RUNES.names):
Hagalaz, Nauthiz, Isa, Thurisaz, Perth, Tiwaz

> **[VYŘAZENO 2026-06-15 — RUNAR_TREE_BUILD.md v1.0]**:
> Vizuální efekty "kořeny tmavnou / urd větve tmavší / bloom pomalejší" odstraněny.
> Heavy runy NEOVLIVŇUJÍ vizuální strom přímo.

Pattern detection (pro "The Gathering") zůstává pro druhou fázi:
```
2 těžké runy → napětí (Níðhöggr nízká), intensity per pattern_window
3 těžké runy → Níðhöggr trigger (tón Rúnara těžší)
4+ těžké runy → nejsilnější kořenový vzorec (Níðhöggr vysoká)
```

---

## TRANSFORMAČNÍ PÁRY (v kódu: TRANSFORMATION_PAIRS)

Precedence: pár > těžká kombinace (pár je specifičtější — říká JAK, těžká kombinace říká ŽE)

TYP 1 — CYKLUS (přirozený koloběh):
- Jera + Hagalaz → sklizeň a bouře, rok se otočí
- Dagaz + Nauthiz → úsvit po nouzi, světlo přichází protože musí
- Berkana + Isa → růst zmrzl, ale kořeny drží

TYP 2 — PRŮLOM (něco se zlomí aby vzniklo nové):
- Thurisaz + Dagaz → síla otvírá bránu světla
- Hagalaz + Sowilo → po bouři světlo
- Nauthiz + Fehu → z nouze vzniká bohatství

TYP 3 — STÍN A SVĚTLO (dvě síly v rovnováze):
- Sowilo + Isa → světlo zastavené, energie čeká
- Mannaz + Hagalaz → člověk tváří v tvář chaosu
- Tiwaz + Nauthiz → oběť jako nutnost

---

## ÆTTY KOMBINACE (k testování po 50 uživatelích)

Jedna Ætta dominuje (3+ run ze stejné skupiny):
- Freyjina → svět a tělo mluví hlasitě
- Heimdallova → osud a skryté
- Týrova → spravedlnost a završení

VIZUÁL na stromě:
- Jedna Ætta dominuje → větve dané Ætty jemně pulzují (TYP 2, 3s), barva dominantní runy
- Dvě Ætty v napětí → dvě skupiny větví střídají pulzy (3s)
- Všechny tři Ætty → celý strom, každá sekce svou barvou, zleva doprava 3s → ambient

---

## ÓÐINOVA RUNA — Blank (k testování po 50 uživatelích)

Blank = záměrná absence. Odpověď existuje ale není viditelná.
Glyph: ○ | Kód: 'Blank' | Žádná Ætta

Případ 1 — Single Blank:
- Rúnar: "Óðin dnes neodpovídá. To je také odpověď."
- Výklad ticha — žádný obsah, jen přítomnost absence

Případ 2 — Blank ve spreadu:
- Ostatní runy = oblast a energie | Blank = výsledek neznámý
- Vizuál: průhledný obrys větve na Canvas (opacity ~15%), bez listů
- Žádný nový branch_type — Canvas overlay

Případ 3 — Blank opakovaně:
- Intensity per pattern_window | Níðhöggr trigger
- "Něco čeká pod povrchem — Óðin se opakovaně odmlčuje"

---

## LIFE RUNE VE SPREADU (k testování po 50 uživatelích)

Případ 1 — Life Rune jako single runa:
- Rúnar: "Tvůj strom mluví o sobě samém."
- Větev roste přímo z kmene, parent_id: null
- Vizuálně nejsilnější větev čtení

Případ 2 — Life Rune ve spreadu:
- Pozice určuje kontext, Life Rune ho přebije
- Jde vždy o základ: kdo jsi, ne kde jsi

Případ 3 — Life Rune opakovaně:
- Statisticky extrémně vzácné
- Nejvyšší intenzita bez ohledu na pattern_window
- Rúnar pojmenuje jako výjimečný moment

IMPLEMENTOVÁNO ✅: isLifeRune detekce v buildReadingPromptIS/EN
CHYBÍ ❌: vizuální handling na stromě (parent_id: null, strongest branch)

---

## RATATOSKR — Full Gathering

Fyzicky se nevyskytuje (žádná postava, žádný záblesk, žádný pohyb).

Ratatoskr = konceptuální vrstva pro Full Gathering:
když nastupují Eagle (korunní vzorce) i Níðhöggr (kořenové vzorce) současně.

Je jediný kdo zná celý strom. Eagle vidí jen korunu. Níðhöggr jen kořeny.
Full Gathering = moment kdy oba mluví — a Ratatoskr je důvod proč.

V praxi: žádný speciální vizuál ani animace. Gathering tón reflektuje obě perspektivy.
Rúnar může v textu zmínit: *"Dnes mluví celý strom."*

> Záblesk po čtení (přechod na strom) — ODSTRANĚNO 2026-06-15.
> Strom roste, větve přibývají — příběh sám o sobě, bez posla.

---

## THE GATHERING — nový systém výkladu

VSTUP DO API (jiný než běžné čtení):
```
typ vzorce (potvrzovací / těžká kombinace / Ætta dominance / element / ...)
které runy / elementy / témata se opakovaly
časové okno + intenzita (pattern_window)
relevantní větve ze stromu (branch data)
dominant_element ze tree_state
trunk_themes ze tree_state
```

TÓN (system prompt se liší od normálního čtení):
- Rúnar NEMLUVÍ o runách — mluví o VZORCI
- Eagle tón: širší, otevřenější — "co tě to učí?"
- Níðhöggr tón: hlubší, těžší — "co odmítáš vidět?"
- Full Gathering: Eagle mluví první, Níðhöggr uzavírá (viz níže)

ULOŽENÍ: journal — speciální záznam (jiná ikona/barva), označeno typem + intenzitou

Max tokens: 1200 (k potvrzení)

---

## FULL GATHERING — příběh

Full Gathering vzniká v momentě kdy strom mluví z obou konců najednou.
Koruna (Eagle) i kořeny (Níðhöggr) mají nahromaděný vzorec ve stejném okně.
To je vzácné — obvykle jeden konec dominuje. Když oba najednou, strom je v napětí
mezi tím co roste a tím co drží.

Je to Ratatoskr moment. Jediný případ kdy celý strom mluví.

**Proč vzniká:**
Člověk se opakuje nahoře i dole zároveň. Něco se tvoří v koruně — záměr, vzorec,
směr. A zároveň něco pracuje v kořenech — stín, minulost, odpor. Obě síly dosáhly
prahu ve stejném čase. Strom to nemůže ignorovat.

**Co to způsobí:**
Rúnar nemůže mluvit jen z jedné perspektivy. Musí držet obě najednou.
Eagle mluví první — co se opakuje nahoře, co se snaží dostat na povrch, co roste.
Níðhöggr uzavírá — co drží kořeny, co je v stínu, co je odmítáno nebo neseno dál.
Společně říkají: tady je napětí mezi tím odkud přicházíš a tím kam jdeš.

**Jaký bude výsledek:**
Nejhlubší Gathering. Jediná session kde strom mluví celý.
Ne analýza vzorce — zrcadlo celého stromu v jednom momentě.
Rúnar může říct: *"Dnes mluví celý strom."* — ale jen zde, a střídmě.

---

## VIZUÁLNÍ STAVY VĚTVÍ (přehled)

```
count=1  normální bloom
count=2  listy září v element barvě (shimmer)
         kořenové vzorce: pulzace kořenů (tmavší, pomalejší)
count=3+ záření zesílí + Gathering CTA aktivní
```

Shimmer: max 2–3 listy najednou, vzácné = cennější (per RUNAR_CONFIG)
Skuld větve: max opacity 0.85 permanentně

---


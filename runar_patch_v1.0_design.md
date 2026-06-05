# Rúnar — Design Patch v1.0
# Datum: 2026-06-05
# Pro: Claude Chat — pokračování designu
# Autor: Kuky + Claude Code session

---

## PROJEKT — RYCHLÝ KONTEXT

Rúnar je AI-powered průvodce runami pro islandský trh (Agndofa).
Poetický hlas, nordická filozofie. Produkce: GitHub Pages + Supabase.

**Klíčová pravidla pro design:**
- IS je primární jazyk (ne překlad EN)
- Žádná gamifikace — organická metafora (strom, kořeny, runes)
- Všechny parametry musí být konfigurovatelné (RUNAR_CONFIG)
- Po prvních 50 uživatelích se čísla adjustují podle dat

---

## CO JE V KÓDU (nepřenavrhovat)

### Datové struktury (implementovány)
```javascript
RUNES[]          // 25 run (24 Elder Futhark + Blank/Óðin)
                 // každá runa má: n, is_n, g, k, k_is, formula_is,
                 //   world, elements[], aett (freya/heimdall/tyr)

AETTY            // 3 Ætty — Freyjina, Heimdallova, Týrova
                 // každá má: runes[], theme_en, theme_is

AREAS.norns      // 8 oblastí → urd/verdandi/skuld
SEEKS.norns      // 5 záměrů → osa (null=neutrální)
MOODS            // {en, is, norns, element} — HOW ARE YOU FEELING
INTENTIONS       // {en, is, norns} — THIS READING IS FOR

PATTERN_WINDOW   // {high:7, mid:14, low:30} dní — intensity thresholds
HEAVY_RUNES      // 6 run + combination thresholds
TRANSFORMATION_PAIRS  // 9 párů ve 3 typech
```

### Spread konfigrace (implementovány)
```
Single    1 runa,  1 kredit
Trojice   3 runy,  3 kredity  ✅ produkce
Norns     3 runy,  3 kredity  ❌ prompt chybí
Kříž      5 run,   5 kreditů  ❌ prompt chybí
Horseshoe 7 run,   7 kreditů  ❌ prompt chybí
Yggdrasil 9 světů, 9 kreditů  ❌ jen Dec 14-28
Gathering —        3 kredity flat ❌ redesign (viz níže)
```

### Rozhodnutí z v0.9 (uzavřena, nepřenavrhovat)
- Gathering: automatická detekce, 3 kredity flat, všechny tiery
- Premium: 75 čtení/měsíc
- Yggdrasil: Dec 14–28, jednou za rok, bez Gathering
- Precedence: transformační pár > těžká kombinace

---

## SPRÁVNÁ JMÉNA RUN V KÓDU
Patch v0.9 používal alternativní jména — v kódu jsou tato:
| Design název | Kód název |
|-------------|-----------|
| Perthro | **Perth** |
| Berkano | **Berkana** |
| Othala | **Othila** |
| Blank | **Blank** (Óðinova runa, žádná Ætta) |

---

## DESIGN AGENDA v1.0

---

### 1. detectPatterns(readings) — CENTRÁLNÍ ALGORITMUS

Toto je nejdůležitější funkce v celém systému.
Volá se po každém čtení a při otevření Tree tabu.

**Vstup:**
```javascript
readings[]  // pole čtení z DB, každé má:
            // rune_name, elements[], area, seeking, mood, intention,
            // drawn_at (timestamp), is_life_rune (bool)
```

**Výstup:**
```javascript
[{
  type:       'rune' | 'element' | 'aett' | 'area' | 'heavy' | 'pair' | 'life_rune',
  subtype:    'potvrzovaci' | 'eagle' | 'nidhoggr' | 'cycle' | 'breakthrough' | 'shadow_light',
  value:      'Hagalaz' | 'Fire' | 'heimdall' | ...,  // co se opakuje
  count:      3,                   // kolikrát
  intensity:  'high' | 'mid' | 'low' | 'minimal',    // dle PATTERN_WINDOW
  readings:   [id1, id2, id3],    // která čtení jsou součástí vzorce
  axis:       'urd' | 'verdandi' | 'skuld',  // kde na stromě
  gathering_eligible: true,       // lze aktivovat Gathering
}]
```

**Co funkce detekuje:**
```
EAGLE vzorce (koruna → skuld/verdandi větve):
  3+ stejná runa
  4+ stejný element
  stejná Area 5+ po sobě
  runa chyběla 6+ měsíců a vrátila se
  dva protiklady (flood_fire / roots_in_wind) ve stejném čtení/týdnu
  Ætty dominance (3+ run ze stejné Ætty)
  transformační pár

NÍÐHÖGGR vzorce (kořeny → urd větve):
  těžká runa 3+ v kořenové/urd pozici
  2+ těžké runy v jednom čtení
  opakující se urd Area
  stagnace (30/60/90 dní bez čtení)
  zimní slunovrat + specifická runa
```

**Potřebuji navrhnout:**
- Přesný algoritmus detekce (jak seskupovat, jak počítat)
- Jak řešit překrývající se vzorce (jedna runa = část více vzorců)
- Jak počítat intensity: čas mezi 1. a posledním výskytem vs PATTERN_WINDOW
- Edge cases: co když čtení chybí datum? Co s Blank runou?
- Jak ukládat stav (cache vs přepočítat vždy)?

---

### 2. tree_state — DB SCHÉMA

Navrhni finální strukturu tabulky.

**Základní požadavky:**
- Uložit stav stromu uživatele (fáze, prvky, dominant element)
- Ukládat pending Gathering (detekované vzorce čekající na aktivaci)
- Ukládat pattern cache (aby se nepočítalo při každém načtení)
- Ukládat trunk themes (co se opakuje na kmeni)

**Aktuální návrh (potřebuje finalizaci):**
```sql
TABLE tree_state (
  user_id uuid PRIMARY KEY,
  life_rune int,
  founding_status text,    -- 'none' | 'in_progress' | 'complete'
  roots jsonb,             -- [{rune, reading_id, set_at}] x3 — IMMUTABLE
  element_scores jsonb,    -- {Fire:3, Water:1, Air:2, Earth:0, Shadow:1}
  dominant_element text,
  trunk_themes jsonb,      -- opakující se témata
  trunk_revealed bool DEFAULT false,
  pattern_cache jsonb,     -- výstup detectPatterns() — kdy přepočítat?
  pending_gatherings jsonb, -- [{type, pattern, count, intensity, reading_ids[], detected_at}]
  last_reading_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Otázky k řešení:**
- Kdy invalidovat pattern_cache? (vždy přepočítat, nebo TTL?)
- Jak ukládat pending_gatherings — pole nebo separátní tabulka?
- Co je trunk_themes — jak se populuje?

---

### 3. branch objekt — FINÁLNÍ STRUKTURA

Každé čtení = větev na stromě. Uloženo v tree_readings tabulce.

**Aktuální návrh z patch v0.5 (potřebuje rozšíření):**
```javascript
{
  // Identifikace
  id:             uuid,
  user_id:        uuid,
  reading_id:     uuid,  // FK → readings
  parent_id:      uuid | null,  // pro potvrzovací série — cluster

  // Runa
  rune_name:      'Hagalaz',
  rune_glyph:     'ᚺ',
  aett:           'heimdall',
  elements:       ['Shadow'],
  is_life_rune:   false,

  // Norns osa
  norns_axis:     'urd',      // výsledná osa (area + seeking + mood + intention)
  area:           'Inner Growth',
  mood:           'Lost',
  intention:      'Understanding the past',

  // Bloom (růst větve)
  phase:          'silhouette' | 'growing' | 'full' | 'leafing',
  bloom_start:    timestamp,
  bloom_duration: 43200,  // sekundy (12h = single, 24h = norns...)
  bloom_progress: 0.0–1.0,

  // Vizuál
  leaf_density:   0.0–1.0,
  leaf_count:     0–15,
  branch_angle:   float,   // úhel větve od kmene
  branch_length:  float,   // relativní délka

  // Kontext
  season:         'summer' | 'autumn' | 'winter' | 'spring',
  pattern_ids:    [uuid],  // vzorce ve kterých tato větev figuruje

  created_at:     timestamp,
}
```

**Otázky k řešení:**
- Jak se počítá `norns_axis` když máme area + seeking + mood + intention (všechny mají osu)?
  Priorita? Váhovaný průměr? Nebo area dominuje?
- Jak se mapuje norns_axis na vizuální pozici větve (urd=dolů, verdandi=střed, skuld=nahoru)?
- Bloom duration: single=12h, Norns=24h, Kříž=48h, Horseshoe=72h, Yggdrasil=7 dní?
  Potvrzení + případné úpravy?
- Skuld větve: max opacity 0.85 permanentně (budoucnost je vždy průhledná) — stále platí?

---

### 4. Gathering — NOVÝ SYSTEM PROMPT

Starý Gathering = manuální výběr run z deníku. NAHRAZUJEME.

**Nový Gathering:**
- Spouštěč: automatická detekce vzorce (detectPatterns())
- Rúnar dostane: typ vzorce, které runy/elementy, kolikrát, intensity, branch data
- Výstup: jeden výklad, ale dvě perspektivy (Eagle + Níðhöggr)

**Co navrhnout:**

Eagle tón (korunní vzorce):
```
Rúnar mluví o vzorci v přítomnosti.
Širší, otevřenější.
"Toto se opakuje — co tě to učí?"
```

Níðhöggr tón (kořenové vzorce):
```
Rúnar mluví o vzorci v minulosti a stínu.
Hlubší, těžší, pomalejší.
"Toto leží pod povrchem — co odmítáš vidět?"
```

Plný Gathering (oba):
```
Eagle mluví první — přítomnost vzorce.
Níðhöggr uzavírá — co vzorec kryje.
```

**Potřebuji:**
- Kompletní system prompt pro Gathering (IS + EN)
- Jak strukturovat vstup do API (jaká data posílat)
- Jak Gathering zaznamenat v journalu (speciální ikona/barva)
- Max tokens: 1200? Nebo jinak?

---

### 5. Óðinova runa (Blank)

**Definice:** Záměrná absence. Odpověď existuje ale není viditelná.
Glyph: ○, jméno v kódu: `Blank`

**Co navrhnout:**

**Single Blank:**
```
Rúnar: "Óðin dnes neodpovídá. To je také odpověď."
Žádný výklad obsahu. Výklad ticha.
```

**Blank ve spreadu (Trojice, Kříž...):**
```
Ostatní runy = oblast a energie
Blank na pozici = výsledek neznámý nebo skrytý
Vizuál: průhledný obrys větve (Canvas overlay, opacity ~15%)
Žádné listy na Blank větvi
```

**Blank opakovaně:**
```
Intensity per PATTERN_WINDOW
Níðhöggr spouštěč
"Něco čeká pod povrchem — Óðin se opakovaně odmlčuje"
```

**Potřebuji:**
- IS + EN prompt pro Single Blank
- Jak Blank pozici ve spreadu popsat Rúnarovi
- Vizuální spec: jak přesně vypadá Canvas overlay na stromě

---

### 6. Horseshoe prompt (7 run)

7-runový spread. Pozice (v kódu):
```
EN: Past, Present, Hidden/Near future, Challenges,
    Outside forces, Inner state, Outcome
IS: Fortíð, Nútíð, Dulið/Nánasta framtíð, Hindranir,
    Ytri kraftar, Innri staða, Niðurstaða
```

**Potřebuji:**
- buildHorseshoePromptIS(u, runes, corrections)
- buildHorseshoePromptEN(u, runes, lang, corrections)
- Jak strukturovat výklad 7 run (jedna po druhé? skupiny? arc?)
- Max tokens: 1300 (v SPREAD_CONFIG) — je to dost?
- Jak použít norns_axis pro každou pozici?

---

### 7. Norns prompt (3 run)

3-runový spread. Pozice:
```
EN: Urður / Past, Verðandi / Present, Skuld / Future
IS: Urður / Fortíð, Verðandi / Nútíð, Skuld / Framtíð
```

**Rozdíl od Trojice:**
- Trojice = minulost/přítomnost/směr (obecný)
- Norns = konkrétní osy osudu — každá Norna mluví svým hlasem
- Urður mluví jako ta co tkala — co bylo, je neměnné
- Verðandi mluví jako ta co tká — co se děje právě teď
- Skuld mluví jako ta co bude tkát — co může být

**Potřebuji:**
- buildNornsPromptIS(u, runes, corrections) — každá Norna jako hlas
- buildNornsPromptEN(u, runes, lang, corrections)
- Tón každé Norny (jiný od Trojice pozic)
- Max tokens: 900 (stejné jako Trojice) — nebo více?

---

### 8. norns_axis výpočet — PRAVIDLO PŘEDNOSTI

Každé čtení má: area.norns + seeking.norns + mood.norns + intention.norns
Všechny mají osu (urd/verdandi/skuld/null).

**Problém:** co když se rozcházejí?
```
area='Family & Home' → urd
mood='Hopeful'       → skuld
intention='Right now' → verdandi
```
Výsledná osa? Pravidlo není definováno.

**Návrhy k diskuzi:**
```
A) Area dominuje vždy
B) Majoritní osa (2/3 majority)
C) Váhovaný: area=50%, seeking=20%, mood=15%, intention=15%
D) Nejsilnější signal (mood a intention jako modifikátor, ne determinant)
```

**Doporučení pro design:**
Řešení D — area + seeking určují osu, mood + intention ji posouvají.
Ale potřebuje přesný algoritmus.

---

## PARAMETRY K POTVRZENÍ

Tato čísla jsou v kódu ale nebyla explicitně potvrzena:

| Parametr | Hodnota | Zdroj | Status |
|----------|---------|-------|--------|
| Bloom duration: Single | 12h | patch v0.5 | potvrdit |
| Bloom duration: Norns | 24h | patch v0.5 | potvrdit |
| Bloom duration: Kříž | 48h | patch v0.5 | potvrdit |
| Bloom duration: Horseshoe | 72h | patch v0.5 | potvrdit |
| Bloom duration: Yggdrasil | 7 dní | patch v0.9 | potvrdit |
| Shimmer max současně | 2–3 listy | patch v0.5 | potvrdit |
| Skuld max opacity | 0.85 | patch v0.5 | potvrdit |
| Gathering tokens | 1200 | implementace | potvrdit |
| Heavy rune: 2 | tension (urd) | patch v0.9 | potvrdit |
| Heavy rune: 3 | Níðhöggr trigger | patch v0.9 | potvrdit |
| Heavy rune: 4+ | winter dark | patch v0.9 | potvrdit |

---

## VIZUÁLNÍ STROM — REFERENCE

PoC v2 (`runar-tree-poc.html`) existuje — organické SVG větve, teardrop listy.
Potřebuje vizuální upgrade per reference images:

**Co extrahovat z referencí:**
- Obr. 3 (malovaný strom): rozdvojující se kmen, plná polokulová koruna
- Obr. 5 (Yggdrasil + aurora): tmavý strom + barevné záře za větvemi
- OneZoom: S-křivka větvení, tlusté organické uzly

**Co NENÍ v PoC:**
- Kmen se rozdvojuje (není rovný)
- Větve mají S-křivku (nekřiví se jen ven)
- Barevné záře (element glow) za větvemi — ne jen barva čáry
- Kořeny zrcadlí korunu

---

## SHRNUTÍ: CO POTŘEBUJI OD TOHOTO CHATU

Priority v pořadí:

1. **norns_axis výpočet** — pravidlo přednosti (rychlé rozhodnutí)
2. **detectPatterns() algoritmus** — pseudokód + edge cases
3. **tree_state schéma** — finální DB struktura
4. **branch objekt** — potvrdit všechna pole a bloom durations
5. **Gathering system prompt** — IS + EN, Eagle/Níðhöggr tón
6. **Norns prompt** — IS + EN buildery
7. **Horseshoe prompt** — IS + EN buildery
8. **Blank/Óðin** — prompt + vizuální spec

Každý bod může být samostatný chat nebo sekce.

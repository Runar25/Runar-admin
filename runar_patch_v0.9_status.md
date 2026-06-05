# Rúnar — Patch v0.9 Implementation Status
# Datum: 2026-06-05
# Pro: pokračování designu v Claude Chat

---

## STAV IMPLEMENTACE

### ✅ HOTOVO — v kódu

| Co | Kde | Commit |
|----|-----|--------|
| PATTERN_WINDOW `{high:7, mid:14, low:30}` | runar-config.js | 329de01 |
| HEAVY_RUNES (6 run + thresholdy) | runar-config.js | 60e2bd3 |
| TRANSFORMATION_PAIRS (9 párů, 3 typy) | runar-config.js | 60e2bd3 |
| AETTY (3 Ætty, 8+8+8 run, témata) | runar-runes.js | 60e2bd3 |
| `aett` field na každé rúně (24/24) | runar-runes.js | 60e2bd3 |
| AREAS.norns (8 oblastí → urd/verdandi/skuld) | runar-runes.js | 329de01 |
| SEEKS.norns (5 záměrů → osa) | runar-runes.js | 329de01 |
| MOODS (HOW ARE YOU FEELING) — EN+IS+norns+element | runar-runes.js | 79d72ac |
| INTENTIONS (THIS READING IS FOR) — EN+IS+norns | runar-runes.js | 79d72ac |
| SPREAD_CONFIG: horseshoe (7 run, pozice, 1300 tokenů) | runar-config.js | 329de01 |
| SPREAD_CONFIG: yggdrasil (9 světů, seasonal Dec14-28, norns_axis) | runar-config.js | 329de01 |
| SPREAD_COSTS.gathering: 3 kredity flat | runar-config.js | 329de01 |
| isLifeRune detekce v buildReadingPromptIS/EN | runar-character.js | c9283f1 |
| mood + intention v prompt kontextu (oba jazyky) | runar-character.js | c9283f1 |
| TIERS.premium.monthly_readings: 75 | runar-config.js | 329de01 |

---

### ⏳ ČEKÁ — data připravena, logika chybí

Toto vše závisí na **`detectPatterns(readings)`** funkci.
Funkci napsat až se bude implementovat Tree of Life vizuál.

| Co | Závisí na |
|----|-----------|
| Gathering triggery — Eagle (3× runa, 4× element, ...) | detectPatterns() |
| Gathering triggery — Níðhöggr (těžké runy, stagnace, ...) | detectPatterns() |
| Elementární kombinace (flood_fire, ember_breath, ...) | detectPatterns() |
| Potvrzovací série (2×/3×/4×+ stejná runa) | detectPatterns() |
| Ætty dominance detekce | detectPatterns() |
| Pravidlo přednosti (páry > těžké kombinace) | detectPatterns() |

---

### ❌ NEIMPLEMENTOVÁNO — vizuální vrstva

Závisí na **tree_state DB tabulce** + **branch systému** + **vizuálním SVG stromu**.

| Co | Popis |
|----|-------|
| Shimmer při count=2 | listy září v element barvě |
| Glow při count=3+ | silnější záření + Gathering CTA |
| Kořenové pulzace | Níðhöggr vzorce — tmavší, pomalejší |
| Potvrzovací série vizuál | větve se shlukují, zlatý junction při 3× |
| Ætty pulse | každá sekce stromu svou barvou, 3s |
| Ratatoskr | záblesk při přepnutí na strom po čtení |
| Óðinova runa Canvas overlay | průhledný obrys větve (opacity ~15%) |
| Yggdrasil skupinový záblesk | SKULD→VERDANDI→URD sekvence, 15s |
| Life Rune vizuál | nejsilnější větev, parent_id: null |
| Skuld max opacity 0.85 | budoucnost je vždy průhledná |

---

## ROZHODNUTÍ PŘIJATÁ (2026-06-05)

### Gathering — nový model
- Automatická detekce vzorců (ne manuální výběr)
- Vizuální signál na stromě = primární notifikace
- count=2 → listy září, count=3+ → Gathering dostupný
- Eagle + Níðhöggr = oba v jednom výkladu
- Dostupné všem tierům, cena: **3 kredity flat**
- Možnost nevyužít — zůstává otevřené
- Stará logika v runar-gathering.js = NAHRADIT

### Premium tier
- monthly_readings = 75 (konzistentní s TIER_LIMITS)

### Yggdrasil
- Jen December 14–28 (zimní slunovrat)
- 9 světů ve třech skupinách: SKULD (1-3), VERDANDI (4-5), URD (6-9)
- Jen jednou za rok
- The Gathering se na Yggdrasil NEVZTAHUJE

### Runa jména v kódu (skutečná jména v RUNES[])
Patch v0.9 používá alternativní jména — kód má tato:
| Patch název | Kód název | Poznámka |
|-------------|-----------|----------|
| Perthro | Perth | HEAVY_RUNES + AETTY opraveno |
| Berkano | Berkana | TRANSFORMATION_PAIRS opraveno |
| Othala | Othila | AETTY opraveno |
| Blank | Blank | Óðinova runa, žádná Ætta |

Vždy používat kód jména při odkazování na RUNES[] objekty.

---

## CO PŘIJDE DÁLE

### Priorita 1 — Tree of Life implementace
```
1. DB tabulky: tree_state + tree_readings
2. Branch objekt (phase, bloom_progress, element, aett, norns_axis...)
3. SVG vizuální strom (organické větve, listy, kořeny)
4. detectPatterns(readings) — výstup: [{type, count, intensity, branches}]
5. Vizuální reakce na vzorce (shimmer, glow, pulse)
6. Gathering nová logika (nahradí runar-gathering.js)
```

### Priorita 2 — Spreads
```
horseshoe (7 run) — implementace
Norns (3 run) — implementace
Kříž — implementace (pozice definovány)
Yggdrasil — až po tree implementaci
```

### Priorita 3 — Óðinova runa
```
Canvas overlay pro prázdnou runu
Speciální handling v buildReadingPromptIS/EN
```

---

## FUNKCE KTERÉ EXISTUJÍ A ČEKAJÍ NA PŘIPOJENÍ

```javascript
// Připraveno — jen potřebuje volající kód:
PATTERN_WINDOW          // runar-config.js — intensity thresholds
HEAVY_RUNES             // runar-config.js — seznam + thresholdy
TRANSFORMATION_PAIRS    // runar-config.js — 9 párů v 3 typech
AETTY                   // runar-runes.js — 3 skupiny
RUNES[i].aett           // každá runa má Ættu
AREAS.norns             // 8 oblastí → urd/verdandi/skuld
SEEKS.norns             // 5 záměrů → osa
MOODS.norns + .element  // 4 nálady → osa + element barva
INTENTIONS.norns        // 3 záměry → osa
isLifeRune              // v prompt builderech — detekce
```

Všechno výše je v kódu a připraveno pro `detectPatterns()`.

---

## PRO PŘÍŠTÍ PATCH (v1.0)

Navrhované oblasti k řešení:

1. **`detectPatterns(readings)`** — pseudokód a edge cases
2. **tree_state schema** — finální DB struktura
3. **Branch objekt finální** — všechna pole pro vizuální vrstvu
4. **Gathering nový system prompt** — Eagle vs. Níðhöggr tón
5. **Óðinova runa** — kompletní chování
6. **Horseshoe prompt** — 7-rune reading struktura
7. **Norns prompt** — 3-rune IS/EN buildery (jen Single a Trojice existují)

# Session 2026-05-31 (část 2) — IS Text Audit + Spread System Design

## Co bylo uděláno

### 1. IS Text Audit — 11 oprav ve 2 souborech

#### runar-translations.js (6 oprav)
| Klíč | Bylo | Je |
|------|------|----|
| `tree_name_label` | `NAFN TRJANS THINS` | `NAFN TRÉSINS ÞÍNS` |
| `gathering_locked` | `þennan viku` | `þessa viku` (vika = femininum) |
| `install_title` + `sp_install_btn` (2x) | `SETJA UP RÚNAR` | `SETJA INN RÚNAR` |
| `teach_edit_lbl` | `FYRIR TEXT OG RÖDD` | `FYRIR TEXTA OG RÖDD` |
| `audio_loading` | `HLEÐ…` | `HLEÐUR…` (3. os., ne 1. os.) |
| `life_rune_short` | `Lífs rún` | `Lífsrún` (složenina bez mezery) |

#### runar-app.js (5 oprav)
| Místo | Bylo | Je |
|-------|------|----|
| HERO fráze č.7 | `undir fullri tungl` | `undir fullu tungli` (tungl = neutrum) |
| DOB hint visitor | `Gerast Rúna-leitandi til að birta` | `Gerast Vegfarandi til að birta` |
| area/seek hint | `Gerast Rúna-leitandi til að opna` | `Gerast Vegfarandi til að opna` |
| gate-btn + trial-end-btn (3x) | `GERAST RÚNA-LEITANDI` | `GERAST VEGFARANDI` |
| DOB hint logged-in | `til að finna lífstíðarrúnina þína` | `til að uppgötva lífstíðarrúnina þína` |

**Python skripty:** `fix-is-audit-translations.py`, `fix-is-audit-app.py`
**Commit:** `fix(IS): IS text audit — 11 grammar and consistency fixes`

### 2. Ověření IS 3-vrstvého systému — všechna generování OK

Uživatel se ptal jestli jsou všechna generování IS zapojená do corrections systému.
Výsledek auditu:

| Generování | getCorrPrompt v promptu | applyISCorrections na výstupu |
|------------|------------------------|-------------------------------|
| Normální čtení (`_generateReading`) | ✅ uvnitř `buildReadingPromptIS()` | ✅ short + deep oba |
| Life rune (`generateLifeRuneReading`) | ✅ přidán externě za `buildLifeRunePrompt()` | ✅ `res.text` |
| The Gathering (`generateWhispersReading`) | ✅ | ✅ |

Vše kompletní. Žádná chyba nebyla.

### 3. Spread System Design — návrh architektury (neimplementováno)

#### Aktuální stav spreadů
- **Trojice (3 runy):** implementována v shrine V2 labu, v produkčním readeru NENÍ
- **Cross, Horseshoe, Norns, Yggdrasil:** pojmenovány v `SPREAD_COSTS`, kód neexistuje
- `SPREAD_COSTS` (runar-config.js): single/trojice/cross/gathering/horseshoe/norns/yggdrasil/life_rune

#### Navržená architektura (k implementaci)
Jeden parametr `SPREAD_CONFIG` jako single source of truth:
```js
const SPREAD_CONFIG = {
  single:    { rune_count: 1, positions: null,         credits: 1,  tokens: 700  },
  trojice:   { rune_count: 3, positions: {en:[...], is:[...]}, credits: 3, tokens: 900  },
  cross:     { rune_count: 5, positions: {en:[...], is:[...]}, credits: 5, tokens: 1100 },
  horseshoe: { rune_count: 7, positions: {en:[...], is:[...]}, credits: 7, tokens: 1300 },
  norns:     { rune_count: 9, positions: {en:[...], is:[...]}, credits: 9, tokens: 1500 },
}
```

Jedna funkce `generateSpread(type)` pro všechny spreads.
Přidání nového spreadu = nový řádek v configu + nový prompt. Vše ostatní (platba, UI, IS/EN, opravy, uložení) automaticky.

#### Fáze implementace (domluvena, nezahájeno)
1. **Fáze 1:** Trojice z shrine do produkce — se správnou novou architekturou
2. **Fáze 2:** Kříž, Horseshoe, Norns — každý jako nový řádek v configu

#### Otevřené otázky (uživatel neodpověděl — přerušeno)
- Trojice do produkce hned, nebo rovnou celý systém?
- Pozice Kříže — tarotový model (střed + 4 světové strany) nebo jiný?
- UI umístění spreadů — vlastní tab nebo součást Reading tabu?

## Stav souborů po session

- `runar-translations.js` — 6 IS oprav ✅
- `runar-app.js` — 5 IS oprav ✅
- SW verze: v23 (nezměněno — jen texty, ne JS logika)
- Trojice v produkci: ❌ (zatím jen shrine)

## Commits dnes
1. `fix(IS): IS text audit — 11 grammar and consistency fixes` (d15417b)
2. (předchozí session) `fix: remove duplicate const/function declarations from runar-app.js`

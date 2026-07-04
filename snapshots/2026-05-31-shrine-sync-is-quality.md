# Session 2026-05-31 — Shrine Sync + IS Quality

## Co bylo uděláno

### 1. Tech debt #1-4 (z monolith splitu)
- `isAdmin()` přesunuta z runar-config.js → runar-auth.js
- `getCorrPrompt()` + `applyISCorrections()` přesunuty z runar-app.js → runar-character.js
- `_capFmt()` duplikát smazán z runar-reading.js (primary v runar-app.js)
- `updateUIText()` (113 ř.) → koordinátor 44 ř. + 4 sub-funkce:
  `_updateDobLabel()`, `_updateAreaSeekLabels()`, `_updateTrialTexts()`, `_updateGateTexts()`

### 2. SQL migrace — spuštěna manuálně
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS dob_day   int,
  ADD COLUMN IF NOT EXISTS dob_month int,
  ADD COLUMN IF NOT EXISTS dob_year  int,
  ADD COLUMN IF NOT EXISTS tree_name text;
```

### 3. IS 3-vrstvý systém — kompletní ve všech 3 generováních
Pravidlo: IS JE PRIMÁRNÍ JAZYK. EN je vedlejší.

| | Sys prompt (IS char) | User prompt (IS-native) | Corrections v promptu | Post-processing |
|--|--|--|--|--|
| Normální čtení | ✅ | ✅ NOVÉ buildReadingPromptIS() | ✅ | ✅ |
| Life rune | ✅ | ✅ buildLifeRunePromptIS() | ✅ | ✅ |
| The Gathering | ✅ | ✅ buildWhispersPrompt() IS branch | ✅ NOVÉ | ✅ |

**Nové funkce:**
- `buildReadingPromptIS(u, drawn, corrections)` — celý prompt v IS
- `buildReadingPromptEN(u, drawn, lang, corrections)` — původní EN logika
- `buildReadingPrompt(u, drawn, lang, corrections)` — dispatcher
- `READING_ANGLES_IS[]` — 8 IS úhlů čtení
- `_randomAngle(lang)` — lang-aware výběr

### 4. Shrine sync — Option A (sdílené moduly)
**Nový soubor: runar-utils.js**
Sdílené utility pro reader i shrine. Load order: po character.js, před svgs.js.
Obsah: READING_ANGLES/IS, _randomAngle(lang), rk/rn/rworld/relements,
        setText/setPH/setSt, showToast, stream

**runar-character.js** — přibyl buildReadingPromptIS/EN/dispatch
(přesunuto z runar-reading.js, character.js loaduje shrine i reader)

**runar-shrine.html** — vyčistěno:
- Smazáno ~15 inline duplikátů (rk, rn, rworld, setText, atd.)
- buildSysPrompt(activeChar, lang) ✅
- getCorrPrompt(lang, corrections) ✅
- _generateReading() používá shared buildReadingPrompt() ✅
- applyISCorrections() na výstupu ✅
- corrections proměnná s normalizací shrine → shared schéma

**Výsledek:** Jakákoliv změna IS promptu se automaticky projeví v obou. Žádný manuální sync.

## Architektura po session

### Load order (reader i shrine sdílejí prefix):
```
runar-config.js → runar-runes.js → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js
→ [reader: journal, tree, gathering, auth, reading, app]
→ [shrine: inline JS]
```

### Kde žijí klíčové funkce:
- `buildReadingPromptIS/EN/dispatch` → runar-character.js
- `buildLifeRunePromptIS/EN` → runar-character.js
- `buildWhispersPrompt()` → runar-gathering.js
- `getCorrPrompt(lang, corrections)` → runar-character.js
- `applyISCorrections(text, lang, corrections)` → runar-character.js
- `READING_ANGLES/IS, _randomAngle(lang)` → runar-utils.js
- `rk/rn/rworld/relements, setText/setPH/setSt` → runar-utils.js
- `isAdmin(email)` → runar-auth.js
- `_capFmt(s)` → runar-app.js (jediná instance)

## SW verze: v23

## Commits
- refactor: resolve 4 tech debt items from monolith split
- docs: mark SQL migration complete
- feat: IS-native reading prompts — 3-layer IS quality system complete
- refactor: shrine sync Option A — shared JS modules, no more desync
- fix: remove duplicate const/function declarations from runar-app.js

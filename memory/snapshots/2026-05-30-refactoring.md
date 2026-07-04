# Snapshot 2026-05-30 — Refaktoring

## Refaktoring #2 — Parametrizace (runar-character.js + runar-app.js)

Funkce nečtou globály — dostávají vše jako parametr.

### runar-character.js
```js
function getContextLine(lang) { ... }           // bylo: getContextLine()
function buildSysPromptV2(lifeRune, lang) { ... } // bylo: buildSysPromptV2(lifeRune)
function buildSysPrompt(c, lang) { ... }         // bylo: buildSysPrompt(c) — četlo global lang
```

### runar-app.js
```js
function getCorrPrompt(lang, corrections) { ... }           // bylo: getCorrPrompt()
function applyISCorrections(text, lang, corrections) { ... } // bylo: applyISCorrections(text)
```

### Call sites (všechny aktualizovány)
```js
buildSysPrompt(activeChar, lang)           // 3 místa
getCorrPrompt(lang, corrections)           // 2 místa (+ template literal)
applyISCorrections(text, lang, corrections) // 4 místa
```

## Refaktoring #3 — Fire-and-forget DB zápisy

Všechny fire-and-forget mají catch:
```js
sb.from(...).update({...}).then(() => {}).catch(e => console.warn('context:', e.message))
```
saveTreeName() má plný try/catch s error feedback pro uživatele.

Opravena místa: lang persist (fetchUserProfile), lang switch, DOB persist, tree_name save.

## Refaktoring #4 — Timing konstanty

```js
// Přidáno na začátek runar-app.js (za _randomAngle):
const DELAY_NAME_PROMPT  = 1200;
const DELAY_RELOAD       = 1200;
const DELAY_TRIAL_END    = 8000;
const DELAY_GREETING     =  600;
const DELAY_TOAST_IN     =  200;
const DURATION_TOAST     = 4700;
const DELAY_FOCUS        =  100;
const DELAY_SCROLL       =   80;
const DELAY_ERROR_RESET  = 2000;
const DURATION_SAVED     = 2500;
```

## Pending refaktoring (z AUDIT_REPORT.md)

5. **updateAuthUI() rozdělit** — 152 řádků, příliš mnoho zodpovědností
   Návrh: updateTabVisibility(), updateBanners(), updateDropdown()
6. **80+ inline ternárů** isIs?'..':'.. přesunout do translations.js
7. **buildReadingPrompt()** oddělit z _generateReading() jako čistou funkci

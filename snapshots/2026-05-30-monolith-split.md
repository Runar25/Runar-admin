# Snapshot 2026-05-30 — Monolith split + Refaktoring #5-7

## Stav po session

runar-app.js: 2889 → 1276 řádků
SW: v15 → v20

## Nové JS moduly (load order v HTML)

```html
<script src="runar-journal.js"></script>    <!-- 236 ř. -->
<script src="runar-tree.js"></script>        <!-- 243 ř. -->
<script src="runar-gathering.js"></script>   <!-- 425 ř. -->
<script src="runar-auth.js"></script>        <!-- 443 ř. -->
<script src="runar-reading.js"></script>     <!-- 325 ř. -->
<script src="runar-app.js"></script>         <!-- 1276 ř. -->
```

## Co je v každém modulu

### runar-journal.js
- loadJournal(), renderJournal(), hideJournal()
- filterJournal(), populateJournalFilters()
- toggleJournalEntry(), playJournalAudio()
- updateJournalTeaser()
- Globál: `_journalCache = []`

### runar-tree.js
- updateTreeTab(), _showTreeReading(), toggleTreeReading()
- setTreeDOB(), saveTreeName()
- generateLifeRuneReading(), loadLifeRuneFromDB()
- openJournalFromPanel(), closeSidePanel(), updateSidePanelLang()
- Globály: `_lifeRuneText`, `_lifeRuneLang`, `_lifeRuneNum`

### runar-gathering.js
- updateWhispersUI(), enterWhispersSelection()
- toggleRuneSelection(), updateWhispersCounter()
- cancelWhispers(), _clearJcardSelections()
- buildWhispersPrompt(), saveGathering()
- generateWhispersReading(), generateWhispersVoice()
- resetWhispers()
- Globály: `_whispersMode`, `_selectedEntries`, `_whispersText`
- Konstanty: `GATHERING_MIN=3`, `GATHERING_MAX=7`

### runar-auth.js
- updateTabVisibility(), updateAuthLabel(), updateBanners()
- updateAuthUI() — coordinator
- updateQuestionGate(), handleAuthBtn()
- installPWA(), openInstallModal(), closeInstallModal()
- openAuthModal(), closeAuthModal()
- toggleRedeem(), redeemCode()
- signInWithGoogle(), sendMagicLink()
- confirmDeleteAccount(), openDeleteModal(), closeDeleteModal()

### runar-reading.js
- buildReadingPrompt(u, drawn, lang, corrections) — pure, #7
- _generateReading(), startReading(), readRune()
- drawAnother(), resetReader(), _showTrialEnd()
- capToggle(), capSeek(), capMute(), _capReset(), _capTrack()
- generateVoice()

## Refaktoring #5 — updateAuthUI() split
```js
updateAuthUI()           // coordinator — 4 řádky
  updateTabVisibility()  // tab show/hide (12 ř.)
  updateAuthLabel()      // header label + sign-in btn (16 ř.)
  updateBanners()        // veškerá banner logika (115 ř.)
```
Pozor: existující `updateDropdown()` (v app.js ~line 1716) zůstal — aktualizuje topbar dropdown (tier, email, balance).

## Refaktoring #6 — inline ternáry → t()
- 52 výskytů nahrazeno
- 37 nových klíčů přidáno do UI_TEXT v runar-translations.js (sekce "// ── Reader UI")
- Ponecháno: template literály s ${vars}, Yggdrasil HTML, locale kódy, runtime hodnoty

## Refaktoring #7 — buildReadingPrompt()
```js
// Čistá funkce — dostane vše jako parametr
function buildReadingPrompt(u, drawn, lang, corrections) {
  const life = u.lifeRune;
  // ... všechna prompt logika ...
  return `...prompt string...`;
}

// _generateReading() teď jen:
const u = readerUser, drawn = readerRune;
const sys = buildSysPrompt(activeChar, lang);
const prompt = buildReadingPrompt(u, drawn, lang, corrections);
```

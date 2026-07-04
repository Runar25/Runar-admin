# Snapshot: 2026-06-06 — Unified reading style + Contextual Intelligence design
# SW: v46 → v57 (tato session = pokračování po compacktu)
# Commity: a42d78c → c5c1d71

---

## Co bylo uděláno v této session

### 1. Reading tab split — MY READING / FOR SOMEONE
`runar-reading.js` — globální `var _readingMode = 'mine';` před `_spreadMode`.
`startReading()` rozlišuje:
```javascript
var isMine = (_readingMode === 'mine');
var knownUser = isMine && userName && _lifeRuneNum;
var name = knownUser ? userName : document.getElementById('r-name').value.trim();
var lifeRune = (isMine && _lifeRuneNum) ? RUNES[_lifeRuneNum - 1] : null;
```
Save bloky obaleny: `if (_readingMode === 'mine') { await saveReading(...); loadJournal(); }`
`switchReadingMode(mode)` + `_updateReadingForm()` přidány.

`runar-app.js` — 3 místa volají `_updateReadingForm()`:
- `showAppTab()` reading branch
- `fetchUserProfile()` po `showHeroGreeting()`
- `saveName()` po `showTopbarGreeting()`

### 2. btn-speak text bug — Norns/Trojice/Kříž
Po přidání N-té runy u multi-rune spreadů zůstalo tlačítko na "ADD RUNE".
Fix: v `readRune()` po `_spreadXRunes.push(readerRune)`:
```javascript
if (speakBtn) {
  speakBtn.disabled = (_spreadXRunes.length < N);
  if (_spreadXRunes.length >= N) speakBtn.textContent = t('speak_btn');
}
```
Platí pro kriz (5), norns (3), trojice (3).
**§15 zdokumentováno v working-style.md** — každý nový multi-rune spread musí toto implementovat.

### 3. Tree auto-expand po generování Life Rune
`runar-tree.js` — v `generateLifeRuneReading()`, po `_showTreeReading()`:
```javascript
var _trBody = document.getElementById('tree-reading-body');
var _trArrow = document.getElementById('tree-toggle-arrow');
if (_trBody) _trBody.style.display = 'block';
if (_trArrow) { _trArrow.textContent = '−'; _trArrow.classList.add('open'); }
```
Při návratu strom zůstane svázán (nezobrazí se automaticky podruhé).

### 4. Unified reading style — žádné ||| — PRODUKCE (SW v55→v56)

#### Vizuální (runar-reader.css)
Odstraněna border-left z .layer1 a .layer2:
```css
.layer1 { background:#0a0e18; padding:20px; margin-bottom:16px; }
.layer2 { background:#0a0e18; padding:20px; margin-bottom:16px; }
.layer1-lbl { color:var(--muted); ... }
.layer2-lbl { color:var(--muted); ... }
```

#### Prompt (runar-character.js)
`buildReadingPromptIS()` — unified, bez HLUTI 1/HLUTI 2 |||:
```javascript
var hasQ = !!(u.question && u.question.trim());
var lifeNote2 = life ? ('MANNESKJAN ber ' + rn(life) + ' (' + life.g + ') sem lífsrún — ...') : '';
return [
  parts + formulaLine, '',
  'LESTURHORNIÐ (...): ' + angle, '',
  'Gefðu einn samfelldan lestur — 5 til 7 setningar, engar fyrirsagnir, engar hlutaskiptingar.', '',
  hasQ ? ('Svaraðu spurningunni: "' + u.question + '" í gegnum ' + rn(drawn) + ' ...')
       : ('Byrjaðu á ' + rn(drawn) + ' (' + drawn.g + ') — ...'),
  lifeNote2, '',
  'Einn texti. Engar hlutaskiptingar. Engar fyrirsagnir. Talaðu beint við ' + u.name + '...'
    + getCorrPrompt('is', corrections),
].filter(Boolean).join('\n');
```

`buildReadingPromptEN()` — unified, array.filter(Boolean).join('\n'), bez template literal (kvůli nested backtick SyntaxError):
```javascript
const hasQ = !!(u.question && u.question.trim());
return [
  parts, '',
  'READING ANGLE (...): ' + _randomAngle('en'), '',
  'One flowing reading — 5 to 7 sentences, no sections, no labels, no line breaks between thoughts.', '',
  hasQ ? ('Open with ' + rn(drawn) + '...')
       : ('Open with ' + rn(drawn) + '...'),
  lifeNote, areaNote2, seekNote2, formulaRef, '',
  'One paragraph. No breaks. No labels. Speak directly to ' + u.name + '...' + langInstr,
  getCorrPrompt(lang, corrections),
].filter(Boolean).join('\n');
```

#### Display (runar-reading.js)
- `_generateReading()` loading start: hned schovat `single-layer2`, vyčistit `layer1-lbl`
- Odstranit `split('|||')` → `const reading = applyISCorrections(res.text.trim(), ...)`
- Po response: `_ul2.style.display = 'none'` + `_ul1lbl.textContent = drawn.g + '  ' + rn(drawn)`
- Stream do `out-short` pouze, `out-deep.innerHTML = ''`
- `generateVoice()`: text z `out-short` (ne `out-deep`)
- `drawAnother()`: obnoví `layer2` + resetuje `layer1-lbl` na `t('layer1_lbl')`

#### Shrine (runar-shrine.html) — stejné změny
- border-left odstraněna z inline CSS `.layer1` / `.layer2`
- Unified prompt (no |||) implementován v shrine samostatně (shrine má vlastní prompt builder)
- `single-layer2` schována před API call
- `layer1-lbl` → `drawn.g + '  ' + rn(drawn)` po response

### 5. Single-rune slot v shrine (V2 lab)
HTML přidán do `#reader-rune-card`:
```html
<div id="single-slot" style="margin:8px 0 10px;">
  <div class="s3-slot" id="s1-slot-0">
    <span class="s3-pos-lbl" id="s1-pos-lbl">① DRAWN RUNE</span>
    <span class="s3-rune-nm" id="s1-rune-0">—</span>
  </div>
</div>
```
`buildGrid()` onclick: fills `#s1-slot-0` v single mode.
`_clearSingleSlot()` helper přidán.
`_setSpreadMode()` + `resetReader()` + `drawAnother()` volají `_clearSingleSlot()`.

### 6. Mood + Intention pills portovány do produkce (SW v56→v57)

#### runar-reader.html
```html
<label class="flbl" id="mood-lbl">HOW ARE YOU FEELING? <span class="opt">(OPTIONAL)</span></label>
<div class="pills" id="mood-pills"></div>
<label class="flbl" id="intention-lbl">THIS READING IS FOR <span class="opt">(OPTIONAL)</span></label>
<div class="pills" id="intention-pills"></div>
```
Přidáno mezi seek-pills a q-section.

#### runar-translations.js
```javascript
// EN:
mood_lbl: 'HOW ARE YOU FEELING?',
intention_lbl: 'THIS READING IS FOR',
// IS:
mood_lbl: 'HVERNIG LÍÐUR ÞÉR?',
intention_lbl: 'ÞESSI LESTUR ER FYRIR',
```

#### runar-app.js
`buildPills()` — přidáno:
```javascript
buildPillGroup('mood-pills', MOODS[lang] || MOODS.en, 'mood');
buildPillGroup('intention-pills', INTENTIONS[lang] || INTENTIONS.en, 'intention');
```
`buildPillGroup()` — rozšířeno na 4 typy (area/seek/mood/intention):
```javascript
const current = type === 'area' ? readerUser.area
  : type === 'seek' ? readerUser.seeking
  : type === 'mood' ? readerUser.mood
  : readerUser.intention;
// onclick: if (type === 'area') ... else if (type === 'seek') ... else if (type === 'mood') ... else intention
```
`_updateAreaSeekLabels()` — přidány mood + intention label updates.

#### runar-reading.js
`startReading()`:
```javascript
readerUser = { ..., mood: readerUser.mood || '', intention: readerUser.intention || '', ... };
```
`resetReader()`:
```javascript
readerUser.mood = ''; readerUser.intention = '';
buildPills();
```

#### runar-character.js — POZOR
`u.mood` a `u.intention` jsou **už v obou buildReadingPromptIS/EN()** jako:
- IS: `u.mood ? 'LÍÐAN: ' + u.mood : ''` a `u.intention ? 'TILGANGUR: ' + u.intention : ''`
- EN: `u.mood ? 'CURRENT STATE: ' + u.mood : ''` a `u.intention ? 'READING PURPOSE: ' + u.intention : ''`
Tyto fields jsou součástí `parts` bloku.

### 7. IS grammar fix
`runar-character.js` line 557: `lífsrúnu` → `lífsrún` (accusative po `ber ... sem`).
`check-is.py` to detekoval. Opraveno přes `fix-lifsrun-is.py`.

---

## Stav po session: SW v57, commity a42d78c → c5c1d71

---

## Contextual Intelligence — návrh (NEIMPLEMENTOVÁNO, jen testováno)

### Problém
Mood + intention tečou do promptu jako raw labely:
```
CURRENT STATE: Lost
READING PURPOSE: Understanding the past
```
Claude je interpretuje, ale nekonzistentně — záleží na kontextu.

### Test (3 čtení, stejná runa Hagalaz, různý mood/intention)
Výsledky prokázaly smysluplnou diferenciaci, ale závislou na LLM interpretaci, ne na explicitní instrukci.

### Plán — Norns axis encoding (PŘIPRAVENO K IMPLEMENTACI)

Data jsou UŽ v `runar-runes.js`:
```javascript
MOODS = {
  en: ['Grounded', 'Unsettled', 'Hopeful', 'Lost'],
  norns:   ['urd',   'verdandi', 'skuld',  'urd'],
  element: ['Earth', 'Air',      'Fire',   'Water'],
};
INTENTIONS = {
  en: ['Right now', 'Decision ahead', 'Understanding the past'],
  norns: ['verdandi', 'skuld', 'urd'],
};
```

Místo raw labelu posílat interpretaci:
```
CURRENT STATE: Lost — Urður axis (what has been woven cannot be undone — read from the root, not the horizon)
MOOD ELEMENT: Water
READING PURPOSE: Understanding the past — Urður axis (the thread runs from here to what was; seek the pattern, not the event)
TEMPORAL FRAME: what the past prepared, not what it cost
```

### Kde to implementovat
1. V shrine `_generateReading()`: před sestavením `parts` bloku — přidat helper `_moodContext(mood)` a `_intentionContext(intention)` který lookup MOODS.norns a vrátí obohacenou instrukci.
2. Pak přenést do `buildReadingPromptEN/IS()` v runar-character.js.

### Voice Scale (z RUNAR_DESIGN.md §Voice Scale 0–20)
Rúnarův hlas se kalibruje na konkrétního uživatele. Ukládá se do `tree_state`.
Nikdy se nevrací do defaultu. Organická kalibrace — sleduje reakce.
**Toto je větší feature, závisí na tree_state DB. Zatím neimplementovat.**

### Tree kontext v čtení (z RUNAR_DESIGN.md)
Při čtení vidí co je ve větvích — opakující se téma, kmen, prázdná sekce Ættu.
Kmen (trunk) se odhalí po opakovaném Area of Life → Rúnar tiše nabídne: "Vidím co tvoří tvůj kmen."
**Závisí na tree_state + tree_readings DB. Zatím neimplementovat.**

### DEF_CHAR_V2_EN — ZASTARALÁ část
`runar-character.js` DEF_CHAR_V2_EN (shrine sys prompt) stále obsahuje:
```
RESPONSE FORMAT
Every reading has two layers, separated by |||
```
Toto je v rozporu s unified formátem. Format instrukce v user promptu (formatInstr) to přebíjí,
ale systémový prompt by měl být aktualizován. LOW PRIORITY — funguje, ale je matoucí.

---

## Záloha
`C:\Users\zkuku\Downloads\Runar-admin\_backup\backup_2026-06-06_2313` — 23 souborů.

---

## Python skripty vytvořené v této session
- `add-mood-intention-pills.py` — port mood/intention do produkce
- `fix-lifsrun-is.py` — IS grammar fix
- `unify-reading-style.py` — předchozí compact session (unified prompt, no |||)
- `unify-reading-is.py` — předchozí compact session (IS return block anchor-based)
- `shrine-hide-layers.py` — předchozí compact session (hide layer2 before API call)

---

## TODOs — stav po této session

### 🔴 Kritické (blokuje prodej)
1. Resend SMTP — magic link emaily z agndofa.is
2. Shopify webhook — automatický upgrade po nákupu
3. DPA Supabase

### 🟡 Důležité
4. Rune Walker tier — způsob nákupu + reálný checkout
5. Privacy Policy odkaz na agndofa.is
6. claude-proxy: credit_cost param (Life Rune=3, Cross=5, Horseshoe=7)
7. Horseshoe prompt (buildHorseshoePromptIS/EN) — chybí
8. Yggdrasil prompt — chybí
9. runar-help.html inline JS — zbývající §10 strings

### 🟡 Contextual Intelligence (připraveno k implementaci)
10. Mood/intention → Norns axis encoding v promptu (helper funkce, shrine first)
11. Voice Scale 0–20 (závisí na tree_state DB)
12. Tree kontext v čtení (závisí na tree_state + tree_readings DB)
13. DEF_CHAR_V2_EN — odstranit zastaralý RESPONSE FORMAT (||| sekce)

### 🟢 Střední priorita
- SSE streaming
- Monthly limit 50/75 v claude-proxy
- Weekly drip odstranit z claude-proxy
- Shrine audit
- runar-gathering.js: stará logika → NAHRADIT (tree_state DB)

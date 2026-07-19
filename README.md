# Agndofa · Rúnar System

> *"The runes do not decide your path… they help you remember it."*

Rúnar is the mystical rune keeper of Agndofa — an AI-powered spiritual guide built on the Elder Futhark rune tradition. This repository contains the admin system for managing Rúnar's knowledge, character, voice, and readings.

---

## Repository Structure

```
Runar-admin/
├── index.html              # v1 — stable production version
│
└── v2/                     # v2 — modular architecture (active development)
    ├── runar-shrine.html   # Main application shell + logic
    ├── runar-config.js     # Configuration: Supabase, ElevenLabs, modes, tiers
    ├── runar-runes.js      # Rune data: 25 Elder Futhark + Blank, areas, seeks
    ├── runar-character.js  # Character definitions per language + prompt builder
    ├── runar-translations.js # UI text: EN, IS (expandable)
    └── runar-svgs.js       # SVG glyph data for rune grid
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JS — single file architecture |
| Database | Supabase (PostgreSQL) |
| AI | Claude API via Supabase Edge Function proxy |
| Voice | ElevenLabs API via Supabase Edge Function proxy |
| Hosting | GitHub Pages |

### Supabase Tables

| Table | Purpose |
|---|---|
| `knowledge_base` | Rúnar's rune interpretations, committed from Teach tab |
| `runar_character` | Character versions with active flag |
| `runar_corrections` | Word/phrase replacements applied to every output |

### Supabase Edge Functions

| Function | Purpose |
|---|---|
| `claude-proxy` | Forwards prompts to Claude API, returns text |
| `elevenlabs-proxy` | Generates voice audio, saves to Supabase Storage |

### Supabase Storage

| Bucket | Purpose |
|---|---|
| `runar-audio` | Generated voice files — `readings/en/` and `readings/is/` |

---

## Application Tabs

| Tab | Purpose |
|---|---|
| **Teach Rúnar** | Paste book text → Rúnar interprets → commit to knowledge base |
| **Character** | Edit Rúnar's identity, voice, format. Save versions. Test responses. |
| **Rúnar the Rune Keeper** | Full reading flow: name, life rune, drawn rune, voice generation |  <!-- doc-values:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
| **Word Corrections** | Teach Rúnar better words — applied to every output |

---

## How to Run Locally

All files are plain HTML/JS — no build step required.

```bash
git clone https://github.com/Runar25/Runar-admin.git
cd Runar-admin/v2
# Open runar-shrine.html in a browser
# Note: fetch() calls require a local server for CORS
npx serve .
# Then open http://localhost:3000/runar-shrine.html
```

---

## Developer Guides

### ➕ Add a New Language — UI Text

1. Open `v2/runar-translations.js`
2. Copy the entire `en: { ... }` block
3. Rename it to your language code (e.g. `cz`, `no`, `de`)
4. Translate all values — **do not change the keys**
5. Open `v2/runar-config.js`
6. Add your language code to `APP.supported_langs`
7. Open `v2/runar-shrine.html` — add a new language button in the `.lang-toggle` div

```js
// runar-config.js
APP.supported_langs: ['en', 'is', 'cz']  // add here

// runar-translations.js
const UI_TEXT = {
  en: { ... },
  is: { ... },
  cz: { ... },  // add your block here
};
```

---

### ➕ Add a New Language — Rúnar's Character

1. Open `v2/runar-character.js`
2. Copy the `DEF_CHAR_EN = { ... }` block
3. Rename it to `DEF_CHAR_CZ` (or your language code)
4. Translate all 8 fields: `identity`, `personality`, `purpose`, `voice`, `never`, `philosophy`, `format`, `imagery`
5. Uncomment the matching `case` in `buildSysPrompt()`:

```js
// runar-character.js
const DEF_CHAR_CZ = {
  identity: `...`,
  personality: `...`,
  // ... all 8 fields
};

function buildSysPrompt(c) {
  switch (currentLang) {
    case 'is': base = DEF_CHAR_IS; break;
    case 'cz': base = DEF_CHAR_CZ; break;  // ← uncomment/add this
    default:   base = DEF_CHAR_EN;
  }
}
```

---

### ➕ Add a New Rune

1. Open `v2/runar-runes.js`
2. Add an entry to the `RUNES` array:

```js
{
  n:    'RuneName',         // English name
  is_n: 'Íslenskt nafn',   // Icelandic name
  g:    'ᚠ',               // Unicode glyph
  svg:  'RuneName',        // Key in RUNE_SVGS (runar-svgs.js)
  k:    'keyword, keyword, keyword',       // English keywords
  k_is: 'lykillyrði, lykillyrði',         // Icelandic keywords
},
```

3. If you have an SVG glyph, add it to `v2/runar-svgs.js`:

```js
"RuneName": {
  vb: "x y width height",   // viewBox values
  paths: `<path d="..." />` // SVG path data
}
```

If no SVG is added, the Unicode glyph (`g`) is shown as fallback.

---

### ➕ Add a New Rúnar Mode

Modes control how Rúnar responds (quick reading, ceremonial, daily reflection, etc.).

1. Open `v2/runar-config.js`
2. Add a new entry to `RUNAR_MODES`:

```js
const RUNAR_MODES = {
  quick_reading: { ... },  // existing

  my_new_mode: {
    label:      'My New Mode',
    max_tokens: 800,
    voice:      true,
    layers:     2,
    active:     false,  // set true when ready
  },
};
```

3. Build the mode's UI flow and prompt logic in `runar-shrine.html`
4. Set `active: true` when ready to use

---

### ➕ Add a New Supabase Edge Function

1. Create the function file: `supabase/functions/my-function/index.ts`
2. Deploy: `supabase functions deploy my-function`
3. Set any secrets: `supabase secrets set MY_SECRET=value`
4. Register the URL in `v2/runar-config.js`:

```js
const MY_PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/my-function';
```

---

### ➕ Add a New Subscription Tier

1. Open `v2/runar-config.js`
2. Add an entry to `TIERS`:

```js
const TIERS = {
  // existing tiers...

  my_tier: {
    label:         'My Tier',
    readings:      null,      // null = unlimited
    voice_dynamic: true,
    voice_static:  true,
    journal:       null,
    ceremonial:    false,
    languages:     ['en', 'is'],
  },
};
```

3. Enforce the tier in the relevant Supabase Edge Function — **never trust the frontend** for access control

---

## External Dependencies

| Service | Used for | Docs |
|---|---|---|
| Supabase | Database, Edge Functions, Storage, Auth (future) | [supabase.com/docs](https://supabase.com/docs) |
| Claude API | AI text generation (via proxy) | [docs.anthropic.com](https://docs.anthropic.com) |
| ElevenLabs | Voice synthesis (via proxy) | [elevenlabs.io/docs](https://elevenlabs.io/docs) |
| GitHub Pages | Static file hosting | [pages.github.com](https://pages.github.com) |

---

## Changelog

### v2 — Modular Architecture *(active development)*
- Split monolithic HTML into 5 external modules
- `runar-config.js` — central configuration, RUNAR_MODES, TIERS
- `runar-runes.js` — rune data separated from logic
- `runar-translations.js` — full EN + IS UI text
- `runar-character.js` — EN + IS character definitions, language-aware prompt builder
- ElevenLabs voice integration — generate, store, and play Rúnar's voice
- Audio saved to Supabase Storage per reading

### v1 — Monolithic *(stable, index.html)*
- Single HTML file, ~800 lines
- 4 tabs: Teach, Character, Reader, Word Corrections
- EN + IS language toggle
- 25 Elder Futhark runes + Blank with SVG glyphs
- Life rune calculation from date of birth
- Two-layer reading output
- Supabase knowledge base, character versioning, corrections

---

## Roadmap

See project roadmap for planned features:
- ~~Auth & user accounts~~ — live (Supabase Auth: magic link + Google)
- Subscription monetisation — **Shopify**, not Stripe (Stripe is not used anywhere)
- Ceremonial mode — cacao ritual flow
- Contextual intelligence — lunar calendar, seasonal events
- Personal reading journal
- Multi-rune layouts (3-rune spread)
- Physical product integration (QR / NFC)

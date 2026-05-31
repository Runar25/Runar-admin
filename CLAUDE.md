# CLAUDE.md — Rúnar Project
# Přečíst na začátku KAŽDÉ session. Toto je jediný zdroj pravdy.
# Detailní archiv (roadmap, pricing, edge functions): CLAUDE_archive.md

---

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Produkce: runar25.github.io/Runar-admin/v2/
Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\

Stack: HTML + CSS + vanilla JS (GitHub Pages) · Supabase (pmitxjvkeovijreepror, eu-west-1)
AI: Claude API přes Supabase Edge Function (claude-proxy)
Voice: ElevenLabs přes Supabase Edge Function
Jazyky: IS (primární) + EN (vedlejší)

---

## Soubory a jejich zodpovědnost

```
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, elVoiceId(), elModel()
runar-runes.js        — 25 Elder Futhark + calcLifeRune()
runar-translations.js — UI_TEXT {en, is} + t() · Edit tool OK
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), buildLifeRunePromptIS/EN(),
                         buildReadingPromptIS/EN/dispatch(), getCorrPrompt(), applyISCorrections()
runar-utils.js        — READING_ANGLES/IS, _randomAngle(lang), rk/rn/rworld/relements,
                         setText/setPH/setSt, showToast, stream
runar-journal.js      — loadJournal(), renderJournal(), filterJournal(), toggleJournalEntry()
runar-tree.js         — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB(),
                         toggleTreeReading(), setTreeDOB(), saveTreeName()
runar-gathering.js    — The Gathering rituál, buildWhispersPrompt(), generateWhispersReading()
runar-auth.js         — updateAuthUI(), isAdmin(), PWA, modaly, sign-in, redeem
runar-reading.js      — buildReadingPrompt(), _generateReading(), startReading(), generateVoice()
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab(), koordinátor (~1276 ř.)
runar-reader.html     — produkční app · Edit tool OK
runar-reader.css      — styly · Edit tool OK
runar-shrine.html     — admin app · Edit tool OK pro HTML
sw.js                 — Service Worker v23 · bumpit při každé JS/CSS změně
```

### Load order (reader i shrine sdílejí prefix)
```
runar-config.js → runar-runes.js → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js
→ [reader]: runar-journal.js → runar-tree.js → runar-gathering.js
            → runar-auth.js → runar-reading.js → runar-app.js
→ [shrine]: inline JS
```

---

## ABSOLUTNÍ PRAVIDLA — nikdy neporušit

### 1. JS změny = Python skripty
Edit tool kazí apostrofy `'` → curly quotes → SyntaxError.
- JS soubory: VŽDY Python skript (ukládat do C:\Users\zkuku\Downloads\Runar-admin\)
- CSS, HTML (bez inline JS), translations.js: Edit tool OK

### 2. IS je primární jazyk
Rúnar vzniká na Islandu, pro Islanďany. IS musí být vždy perfektní.
EN je vedlejší. NIKDY nepřistupovat k IS jako k "překladu" EN.

Každé místo kde Claude generuje IS text MUSÍ mít 3 vrstvy:
```js
// 1. System prompt v IS charakteru
var sys = buildSysPrompt(activeChar, lang);

// 2. User prompt psán přímo v IS (NIKDY "Respond in Icelandic" na konci EN promptu)
var prompt = buildXxxPromptIS(...);
var corrBlock = getCorrPrompt(lang, corrections);
if (corrBlock) prompt = prompt + '\n' + corrBlock;

// 3. Post-processing — deterministické opravy
var text = applyISCorrections(res.text || '', lang, corrections);
```

Implementováno ve všech 3 generováních ✅:
- Normální čtení: buildReadingPromptIS()
- Life rune: buildLifeRunePromptIS()
- The Gathering: buildWhispersPrompt() IS větev

### 3. Sdílené moduly = automatický sync
runar-character.js a runar-utils.js načítají reader i shrine.
Změna tam se projeví všude. NIKDY neduplikovat funkce do shrine inline JS.

### 4. SW verze
Po každé JS nebo CSS změně: bumpit sw.js (aktuálně v23).

### 5. UI invarianty
- var(--gold) = #FFBF00 — primární barva, NIKDY teal
- var(--dim) = #3a4a60 — NIKDY pro čitelný text
- reader-content se NIKDY neskrývá
- Runa ᚱ: vždy zlatá, NIKDY s ozdobami (◌ ᚱ ◌ zakázáno)

### 6. Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
STANDARD · PREMIUM · THE GATHERING · RÚNAR · READING GIFT CARD

### 7. Commit pravidla
- Jeden commit = jedna věc. Push ihned po commitu.
- SW bumpit v každém commitu kde se mění JS/CSS.

---

## Tier systém

| Tier | DB hodnota | Přístup |
|------|-----------|---------|
| Visitor | free_trial | 1 čtení, anon, jen Fehu, DOB locked |
| Rune Seeker | rune_seeker | free_balance z DB, jen single rune zdarma, journal posledních 5 |
| Standard | standard | unlimited, hlas, journal+filtry, The Gathering, Specific Question |
| Premium | premium | vše + ceremonial (coming soon) |

ADMIN_EMAILS: kukula@agndofa.is, info@agndofa.is → automaticky premium, bypass všeho.
VŽDY testovat jako visitor a rune_seeker, ne jako admin.

---

## DB — user_profiles sloupce
```
id, name, lang, tier, credits_balance, created_at,
free_balance (int), drip_week (text),
dob_day (int), dob_month (int), dob_year (int),
tree_name (text),
life_rune_number (int), life_rune_text (text), life_rune_lang (text)
```
POZOR: email a updated_at NEEXISTUJÍ v user_profiles.

---

## Spread systém

### Stav spreadů
| Spread | Runy | Kredity | Stav |
|--------|------|---------|------|
| Single | 1 | 1 (free_balance) | ✅ produkce |
| Trojice | 3 | 3 | ✅ shrine lab · ❌ produkce |
| Kříž | 5 | 5 | ❌ navrženo |
| Horseshoe | 7 | 7 | ❌ navrženo |
| Norns | 9 | 9 | ❌ navrženo |

### Navržená architektura — SPREAD_CONFIG
Jeden config jako single source of truth + jedna funkce `generateSpread(type)` pro všechny:
```js
const SPREAD_CONFIG = {
  single:    { rune_count: 1, positions: null,            credits: 1, tokens: 700  },
  trojice:   { rune_count: 3, positions: {en:[...],is:[...]}, credits: 3, tokens: 900  },
  cross:     { rune_count: 5, positions: {en:[...],is:[...]}, credits: 5, tokens: 1100 },
  horseshoe: { rune_count: 7, positions: {en:[...],is:[...]}, credits: 7, tokens: 1300 },
  norns:     { rune_count: 9, positions: {en:[...],is:[...]}, credits: 9, tokens: 1500 },
};
```

### Kříž — pozice (domluveno 2026-05-31)
```
         [2]
   [4] — [1] — [5]
         [3]

1  střed      — jádro situace
2  nad        — co vědomě vidíš / co aspituješ
3  pod        — co je skryté / kořen / podvědomí
4  za tebou   — co přichází z minulosti
5  před tebou — kam situace směřuje
```

### Otevřené otázky k spreads (zodpovědět před implementací)
- UI: výběr spreadu pod "DRAW YOUR RUNE" (přepínač jako v shrine) nebo vlastní sekce?
- Tier: Trojice patří k Rune Seeker (za kredity) nebo jen Standard+?

---

## Tree of Life

### Co je hotové ✅
- Life rune výpočet z DOB přes calcLifeRune() — fixní, nelze změnit
- Life rune generování (Standard 1200 / Premium 2000 tokenů) — bez ElevenLabs
- Uložení: life_rune_number, life_rune_text, life_rune_lang v user_profiles
- Tree tab UI: no-dob / RS teaser / reveal CTA / výklad (collapsible)
- setTreeDOB(), saveTreeName() funkční
- IS 3-vrstvý systém pro life rune ✅

### Co není implementováno ❌
- Zakládací rituál (3 sessions → 3 kořeny)
- DB tabulky: tree_state, tree_readings
- Branch systém — každá session = větev
- Elementy (Fire/Water/Air/Earth) — kumulativní growth
- Vizuální strom (SVG)

### Tree tab HTML struktura
```
apane-tree
├── tree-life-rune-section
│   ├── tree-no-dob          ← intro + DOB inputs
│   ├── tree-rs-teaser       ← RS: symbol + jméno + "Your story opens with Standard."
│   ├── tree-reveal-cta      ← Std+: REVEAL YOUR LIFE RUNE button
│   ├── tree-loading         ← loading state
│   └── tree-reading-exists  ← výklad (collapsible)
├── tree-name-section        ← "NAME YOUR TREE" input
└── tree-growth-section      ← poetický citát
```

### Plánované DB tabulky
```sql
TABLE tree_state (
  user_id uuid REFERENCES user_profiles(id),
  life_rune int,
  founding_status text,   -- 'none' | 'in_progress' | 'complete'
  roots jsonb,            -- [{rune, session_id, set_at}] x3 — IMMUTABLE po nastavení
  element_scores jsonb,   -- {fire, water, air, earth} — jen roste
  trunk_revealed bool DEFAULT false,
  trunk_description text
);

TABLE tree_readings (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  reading_id uuid,        -- FK → readings
  branch_data jsonb,      -- směr, délka, barva, element, sezóna, váha
  founding_session int,   -- 1/2/3 nebo null
  created_at timestamptz DEFAULT now()
);
```

---

## Workflow — jak pracujeme

```
1. Ty popíšeš záměr (nemusí být technicky přesně)
2. Já ukážu co to znamená v praxi — kde to sáhne, co ovlivní, co je nejdřív
3. Ty doplníš / upřesníš / zamítneš
4. Teprve pak implementujeme — jeden krok najednou
5. Po implementaci: snapshot do MEMORY.md + update CLAUDE.md
```

Systém je živý — příběh se vyvíjí. Dokumentace musí odrážet aktuální stav, ne historii.

---

## Kde hledat co

| Hledám | Kde |
|--------|-----|
| Tier logika, limity | runar-config.js: TIERS, TIER_LIMITS |
| IS/EN prompt buildery | runar-character.js |
| IS corrections systém | runar-character.js: getCorrPrompt(), applyISCorrections() |
| UI texty (překlady) | runar-translations.js: UI_TEXT |
| Stav uživatele | runar-app.js: currentUser, userTier, readerUser, lang |
| Tree logika | runar-tree.js |
| Auth + tier check | runar-auth.js: isAdmin(), updateAuthUI() |
| Sdílené utility | runar-utils.js |
| Runa data + výpočet | runar-runes.js: RUNES[], calcLifeRune() |
| Spreads config | runar-config.js: SPREAD_COSTS, RUNAR_MODES |

---

## Word Corrections — snapshot (runar_corrections DB)
Živá data: `python show_corrections.py` — aktualizovat při každé nové korekci.

| Scope | Původní | → Oprava |
|-------|---------|----------|
| IS | Arctic ljósið | Norðurljósin |
| IS | þrönga gljúfur | þröngt gljúfur |
| IS | hljómar um það | Talar um það |
| IS | líkaminn þreytur | líkaminn þreyttur |
| IS | biðlar | biður |
| IS | Velkomin | Gaman að sjá þig |

---

## Prioritní nedodělky

### 🔴 Kritické (blokuje prodej)
1. **Resend SMTP** — magic link emaily z agndofa.is (před Shopify webhookem)
2. **Shopify webhook** — automatický upgrade po nákupu
3. **DPA Supabase** — čeká na e-mail od Supabase

### 🟡 Důležité
4. **Standard tier** — způsob nákupu (aktuálně "COMING SOON")
5. **Trojice do produkce** — z shrine labu do readeru, s novou SPREAD_CONFIG architekturou
6. **Privacy Policy** — odkaz na agndofa.is

### 🟢 Střední priorita
- SSE streaming (první slova za ~0.5s místo čekání)
- Delší výklady pro Standard (1000–1200 tokenů)
- Kříž, Horseshoe, Norns — po Trojici

---

## Hotovo ✅ (poslední sessions)

### 2026-05-31
- IS text audit — 11 gramatických a stylistických oprav (translations.js + app.js)
- Ověření IS 3-vrstvého systému — všechna 3 generování OK
- Kříž pozice — definovány (domluveno, neimplementováno)

### 2026-05-31 (dřívější)
- Tech debt #1-4 z monolith splitu (isAdmin, getCorrPrompt, _capFmt, updateUIText split)
- IS 3-vrstvý systém kompletní — buildReadingPromptIS(), READING_ANGLES_IS
- Shrine sync Option A — runar-utils.js, sdílené moduly, žádný manuální sync
- SW bumped na v23

### 2026-05-30
- Monolith split (5 modulů: gathering, journal, tree, reading, auth)
- Tree of Life: DOB inputs, saveTreeName, life rune výklad, IS kvalita
- Refaktoring #2-7 (buildSysPrompt parametrizace, fire-and-forget fix, timing konstanty)

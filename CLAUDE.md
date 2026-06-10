# CLAUDE.md — Rúnar Project
# Přečíst na začátku KAŽDÉ session. Zdrojová pravda pro kód.
# Spolu s: RUNAR_DESIGN.md (design, mytologie, spready) · RUNAR_PRICING.md (business)

---

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Produkce: runar25.github.io/Runar-admin/v2/
Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\
Stack: HTML + CSS + vanilla JS · Supabase (pmitxjvkeovijreepror, eu-west-1) · Claude API + ElevenLabs · IS primární + EN

---

## Soubory a jejich zodpovědnost

```
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, SPREAD_CONFIG, VOCAB
runar-runes.js        — 25 Elder Futhark + calcLifeRune()
runar-translations.js — UI_TEXT {en, is} + t()  ← Edit tool OK
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), buildReadingPromptIS/EN(),
                         buildLifeRunePromptIS/EN(), getCorrPrompt(), applyISCorrections()
runar-utils.js        — t(), tp(), vn(), vl(), setText/setSt/showToast, stream
runar-journal.js      — loadJournal(), renderJournal(), filterJournal()
runar-tree.js         — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB()
runar-gathering.js    — The Gathering (NAHRADIT — stará logika, čeká na tree_state DB)
runar-auth.js         — updateAuthUI(), isAdmin(), PWA, sign-in, redeem
runar-reading.js      — startReading(), _generateReading(), generateVoice()
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab()
runar-reader.html     — produkční app  ← Edit tool OK
runar-reader.css      — styly          ← Edit tool OK
runar-shrine.html     — admin app      ← Edit tool OK pro HTML
sw.js                 — Service Worker (auto-bump via git hook · hooks/pre-commit.py)
```

### Load order
```
runar-config.js → runar-runes.js → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js
→ [reader]: runar-journal.js → runar-tree.js → runar-gathering.js
            → runar-auth.js → runar-reading.js → runar-app.js
```

---

## ABSOLUTNÍ PRAVIDLA

### §1 — JS změny = Python skripty
Edit tool kazí apostrofy `'` → curly quotes → SyntaxError.
JS soubory: VŽDY Python skript (C:\Users\zkuku\Downloads\Runar-admin\)
CSS + HTML (bez inline JS) + translations.js: Edit tool OK

### §2 — IS je primární jazyk
IS musí být vždy perfektní. EN je vedlejší. NIKDY IS jako "překlad" EN.
Každé Claude generování v IS musí mít 3 vrstvy:
```js
var sys    = buildSysPrompt(activeChar, lang);          // 1. IS system prompt
var prompt = buildXxxPromptIS(...);                     // 2. prompt přímo v IS
if (getCorrPrompt(lang, corrections)) prompt += ...;   // 3. corrections block
var text   = applyISCorrections(raw, lang, corrections);// 4. post-processing
```

### §3 — Sdílené moduly = automatický sync
runar-character.js a runar-utils.js načítají reader i shrine. NIKDY neduplikovat do shrine.

### §4 — SW verze
Auto-bump: git pre-commit hook (hooks/pre-commit.py). Po fresh clone: `python -X utf8 hooks/install-hooks.py`
Ruční bump pokud je sw.js already staged před commitem.

### §5 — UI invarianty
var(--gold) = #FFBF00 · var(--dim) = #3a4a60 NIKDY pro text · reader-content se NIKDY neskrývá
Runa ᚱ: vždy zlatá, NIKDY s ozdobami (◌ ᚱ ◌ zakázáno)

### §6 — Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
THE GATHERING · RÚNAR · RUNE WALKER · RUNE KEEPER

### §7 — Commit pravidla
Jeden commit = jedna věc. Push ihned. Použít smoke test: `python -X utf8 smoke.py`

### §8 — Tier hodnoty = vždy z configu
```js
TIER_LIMITS.rune_seeker.onboarding_label_en  // ✅
'five readings each month'                    // ❌ NIKDY
```

### §9 — IS text = zkontrolovat před commitem
`python -X utf8 check-is.py`  — known-bad IS fráze. Nová → přidat do BAD_PATTERNS.

### §10 — NULA hardcoded strings v logice
```
t('key')          ← statický z UI_TEXT
tp('key', {vars}) ← šablona: 'You have {casts} remaining'
vn('cast', n, l)  ← plural z VOCAB: '3 casts' / '3 spár'
vl('card', l)     ← label z VOCAB: 'Rune Card' / 'Rúnakort'
```
Přidání jazyka = jen nový blok v UI_TEXT + VOCAB. Žádné jiné soubory.

### §11 — IS text v Python skriptech = VŽDY literální znaky
Escape sekvence NIKDY — pouze literal UTF-8 s `python -X utf8`. (detaily + příklady → working-style.md)

### §12 — Jméno uživatele: fallback = "you" / "þú"
NIKDY `email.split('@')[0]`. displayName() = jediný zdroj pravdy. (detaily → working-style.md)

### §14 — updateUIText() = POUZE statické překlady
`updateUIText()` se volá na každém přepnutí jazyka — NIKDY sem nepřidávat state-dependent obsah.
Dynamický obsah patří do dedikovaných funkcí:
- `_updateReadingForm()` — `reader-card1-lbl` (heading) + `reader-note`
- `_updateDobLabel()` — DOB pole
Porušení způsobí přepsání personalizovaného textu při přepnutí jazyka.

### §13 — Nová věc musí projít VŠEMI cestami (Full-path rule)
Nový field → všechny buildXxxPromptIS/EN · startReading() · resetReader() · shrine parts[]
Nový spread → readRune() · drawAnother() · resetReader() · _setSpreadMode() · generateVoice()
Migrace → grep starý text, aktualizovat VŠECHNY výskyty (sdílené i lokální)
Před commitem: "Existuje jiná cesta kódem kde tohle chybí?"

---

## Tier systém

| DB hodnota | UI jméno | Přístup |
|-----------|---------|---------|
| free_trial | Visitor | 1 cast, anon, jen Fehu |
| rune_seeker | Rune Seeker | 1 cast zdarma/měsíc + rune stones, journal 5 |
| standard | **Rune Walker** | 50 castů/měsíc, hlas, full journal |
| premium | **Rune Keeper** | 75 castů/měsíc, vše + hlubší Life Rune |

ADMIN: kukula@agndofa.is, info@agndofa.is → automaticky premium. VŽDY testovat jako visitor/rune_seeker.

---

## DB — user_profiles sloupce
```
id, name, lang, tier, credits_balance, created_at,
free_balance (int), drip_week (text),
dob_day, dob_month, dob_year (int),
tree_name (text), life_rune_number (int), life_rune_text (text), life_rune_lang (text)
```
⚠️ email a updated_at NEEXISTUJÍ v user_profiles.

---

## Reading systém — stav

**Unified format**: 1 plynoucí blok, 5–7 vět, žádné `|||`. `layer1-lbl` = glyf + jméno runy.
`_readingMode` = `'mine'` (ukládá) | `'someone'` (neukládá).
`u.area/seeking/mood/intention/question` → `parts[]` → Claude. Norns axis: `_moodContext(mood,lang)` + `_intentionContext(intention,lang)` v runar-character.js.

### Spread systém
| Spread | Runy | Stav |
|--------|------|------|
| Single | 1 | ✅ produkce |
| Norns | 3 | ✅ reader (zakládací rituál) |
| Kříž | 5 | ✅ reader (Standard+) |
| Horseshoe | 7 | ✅ reader (Standard+) |
| Yggdrasil | 9 | ✅ reader (všichni přihlášení, Dec 14–28) |
| The Gathering | — | ❌ redesign (tree_state DB) |

---

## Tree of Life — stav
✅ calcLifeRune(), generování + uložení, Tree tab UI, IS 3-vrstvý systém, isLifeRune detekce
❌ branch systém, vizuální strom, tree_state/tree_readings DB tabulky — čeká na V3
Design: viz RUNAR_DESIGN.md

## Word Corrections
Živá data: `python show_corrections.py`
Nová korekce → přidat do BAD_PATTERNS v check-is.py + do DB přes shrine.

---

## Kde hledat co
Tiers/limity/vocab/spreads → `runar-config.js` · Prompty IS/EN + corrections → `runar-character.js`
UI texty → `runar-translations.js` · User state → `runar-app.js` · Tree logika → `runar-tree.js`

Designová rozhodnutí (co a proč) → `RUNAR_DESIGN.md`
Tree of Life (zakládací rituál, větve, elementy, kořeny) → `tree-of-life.md`
Pattern detection + The Gathering (Eagle/Níðhöggr, transformační páry) → `runar-patterns.md`
Business model + ceny + EL kalkulace → `RUNAR_PRICING.md`

---

## Před spuštěním (launch checklist)

### 🔴 Blokuje launch
- **Resend SMTP** — magic link emaily z agndofa.is (před Shopify webhookem)
- **Shopify webhook** — automatický upgrade po nákupu
- **Standard tier purchase** — způsob nákupu (aktuálně "COMING SOON")
- **Capacitor native app** — iOS App Store = primární akviziční kanál na Islandu (70 % iOS). Subscriptions na webu, žádný App Store cut. Viz RUNAR_PRICING.md sekce PWA vs Native.

### 🟡 Před prvním marketingem
- **Privacy Policy** — odkaz na agndofa.is
- **DPA Supabase** — čeká na e-mail od Supabase
- **Trojice do produkce** — z shrine labu do readeru, s novou SPREAD_CONFIG architekturou

---

## Cowork sync
Memory soubory (MEMORY.md, working-style.md, runar-project.md, tree-of-life.md, runar-patterns.md)
a složku snapshots/ ukládat TAKÉ do:
`C:\Users\zkuku\Claude\Projects\RÚNAR the rune keeper\`

Primární zdroj zůstává `C:\Users\zkuku\AppData\Roaming\Claude\memory\`.
Cowork složka = zrcadlo pro přímý přístup bez syncu.

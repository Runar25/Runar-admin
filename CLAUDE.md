# CLAUDE.md — Rúnar Project
# Přečíst na začátku KAŽDÉ session. Toto je jediný zdroj pravdy pro kód.
# Spolu s: RUNAR_DESIGN.md (design, mytologie, spready) · RUNAR_PRICING.md (business)

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
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, SPREAD_CONFIG,
                         elVoiceId(), elModel()
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
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab(), koordinátor
runar-reader.html     — produkční app · Edit tool OK
runar-reader.css      — styly · Edit tool OK
runar-shrine.html     — admin app · Edit tool OK pro HTML
sw.js                 — Service Worker v26 · bumpit při každé JS/CSS změně
```

### Load order
```
runar-config.js → runar-runes.js → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js
→ [reader]: runar-journal.js → runar-tree.js → runar-gathering.js
            → runar-auth.js → runar-reading.js → runar-app.js
→ [shrine]: inline JS
```

---

## ABSOLUTNÍ PRAVIDLA

### §1 — JS změny = Python skripty
Edit tool kazí apostrofy `'` → curly quotes → SyntaxError.
- JS soubory: VŽDY Python skript (ukládat do C:\Users\zkuku\Downloads\Runar-admin\)
- CSS, HTML (bez inline JS), translations.js: Edit tool OK

### §2 — IS je primární jazyk
IS musí být vždy perfektní. EN je vedlejší. NIKDY IS jako "překlad" EN.
Každé Claude generování v IS musí mít 3 vrstvy:
```js
var sys = buildSysPrompt(activeChar, lang);            // 1. IS system prompt
var prompt = buildXxxPromptIS(...);                    // 2. prompt přímo v IS
var corrBlock = getCorrPrompt(lang, corrections);
if (corrBlock) prompt = prompt + '\n' + corrBlock;
var text = applyISCorrections(res.text || '', lang, corrections); // 3. post-processing
```
Implementováno: buildReadingPromptIS(), buildLifeRunePromptIS(), buildWhispersPrompt() IS větev.

### §3 — Sdílené moduly = automatický sync
runar-character.js a runar-utils.js načítají reader i shrine.
NIKDY neduplikovat funkce do shrine inline JS.

### §4 — SW verze
Po každé JS nebo CSS změně: bumpit sw.js (aktuálně v31).

### §5 — UI invarianty
- var(--gold) = #FFBF00 — primární barva, NIKDY teal
- var(--dim) = #3a4a60 — NIKDY pro čitelný text
- reader-content se NIKDY neskrývá
- Runa ᚱ: vždy zlatá, NIKDY s ozdobami (◌ ᚱ ◌ zakázáno)

### §6 — Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
STANDARD · PREMIUM · THE GATHERING · RÚNAR · READING GIFT CARD

### §7 — Commit pravidla
Jeden commit = jedna věc. Push ihned. SW bumpit v každém commitu kde se mění JS/CSS.

### §9 — IS text = vždy zkontrolovat před commitem
Před každým commitem který obsahuje islandský text spustit:
```
python check-is.py
```
Skript kontroluje known-bad IS slova/fráze ve všech souborech.
Nová korekce → přidat do `BAD_PATTERNS` v `check-is.py` + do DB přes shrine.
`applyISCorrections()` opravuje jen Claude-generovaný text — statické UI texty check-is.py.

### §8 — Tier hodnoty = vždy z configu, NIKDY natvrdo v textu
```js
// runar-config.js — hodnota I text label na jednom místě
rune_seeker: { onboarding: 1, onboarding_label_en: 'one free reading', ... }

TIER_LIMITS.rune_seeker.onboarding_label_en  // ✅
'five readings each month'                    // ❌ NIKDY
```
Při změně tier hodnoty: grep runar-app.js + runar-reader.html + runar-translations.js.

---

## Tier systém

| Tier | DB hodnota | Zobrazené jméno | Přístup |
|------|-----------|----------------|---------|
| Visitor | free_trial | Visitor | 1 čtení, anon, jen Fehu, DOB locked |
| Rune Seeker | rune_seeker | Rune Seeker | 1 čtení zdarma + kredity, journal 5 |
| Standard | standard | **Rune Walker** | 50 run/měsíc, hlas, full journal, všechny spready |
| Premium | premium | **Rune Keeper** | 75 run/měsíc, vše + hlubší Life Rune |

POZOR: DB hodnoty (free_trial, rune_seeker, standard, premium) se NEMĚNÍ.
Jen UI label — Rune Walker a Rune Keeper. Implementovat v dalším commitu.

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

| Spread | Runy | Kredity | Tier | Stav |
|--------|------|---------|------|------|
| Single | 1 | 1 (free_balance) | Všichni | ✅ produkce |
| Trojice | 3 | 3 | RS+ (kredity) | ✅ shrine / ✅ reader |
| Norns | 3 | 3 | RS+ (kredity) | ❌ prompt chybí |
| Kříž | 5 | 5 | RS+ (kredity) | ✅ reader |
| Horseshoe | 7 | 7 | RS+ (kredity) | ❌ prompt chybí |
| Yggdrasil | 9 | 9 | RS+ (kredity, Dec 14-28) | ❌ navrženo |
| The Gathering | — | 3 (flat) | RS+ (kredity) | ❌ redesign v0.9 |

Visitor = jediný tier bez přístupu. RS = vše za kredity. Standard/Premium = z měsíčního limitu.
Yggdrasil: sezónní omezení Dec 14–28 platí pro všechny tiery.
Pozice + SPREAD_CONFIG: viz RUNAR_DESIGN.md — Spreads sekce.

---

## The Gathering — nový model (patch v0.9, 2026-06-05)

**Strom je detektor. Gathering je výsledek.**

Gathering se spouští AUTOMATICKY detekcí vzorců — ne manuálním výběrem z deníku.
Vizuální signál na stromě = primární notifikace.

### Detekce vzorců
- Sleduje se: stejná runa, stejný element, stejná Area of Life, těžké kombinace, Ætta
- Žádné pevné časové okno — vzorec je vzorec bez ohledu na timing

### Vizuální signály na stromě
```
count=1  normální bloom větve
count=2  listy září v element barvě — "děje se něco zajímavého"
         kořenové vzorce: pulzace kořenů (tmavší, pomalejší)
count=3+ záření zesílí — Gathering CTA se aktivuje (popup na stromě)
```

### Eagle + Níðhöggr zároveň
- Orel = korunní vzorce (runa/element/Area skuld+verdandi)
- Níðhöggr = kořenové vzorce (těžké runy, Area urd, stín)
- Plný Gathering = oba mluví v jednom výkladu

### Tier + cena
- Dostupné všem tierům (i Visitor za kredity)
- Cena: **3 kredity flat** (SPREAD_COSTS.gathering.credits = 3)
- Možnost nevyužít — zůstane otevřená, nezaniká

### Stav implementace
- runar-gathering.js: stará logika (manuální výběr, 1×/týden) — NAHRADIT
- Potřeba: pattern detection funkce, vizuální stavy větví na stromě, popup CTA
- Závisí na: tree_state DB tabulce, branch datech

---

## Tree of Life — stav implementace

**Hotové ✅:** calcLifeRune(), life rune generování + uložení, Tree tab UI, IS 3-vrstvý systém
**Hotové ✅:** isLifeRune detekce v buildReadingPromptIS/EN — když drawn == life rune, Rúnar dostane speciální instrukci
**Chybí ❌:** zakládací rituál, branch systém, elementy, vizuální strom, tree_state/tree_readings tabulky

### TREE_UPDATE Edge Function
Definována v runar-config.js: `const TREE_UPDATE = '...functions/v1/tree-update'`
Stav: ❌ není nasazena — závisí na tree_state + tree_readings DB tabulkách.
Nasadit až po vytvoření tabulek a branch systému.

Tree tab HTML: `apane-tree > tree-life-rune-section > [tree-no-dob | tree-rs-teaser | tree-reveal-cta | tree-loading | tree-reading-exists]`

Kompletní design: viz RUNAR_DESIGN.md.

---

## Word Corrections — snapshot (runar_corrections DB)
Živá data: `python show_corrections.py`

| Scope | Původní | → Oprava |
|-------|---------|----------|
| IS | Arctic ljósið | Norðurljósin |
| IS | þrönga gljúfur | þröngt gljúfur |
| IS | hljómar um það | Talar um það |
| IS | líkaminn þreytur | líkaminn þreyttur |
| IS | biðlar | biður |
| IS | Velkomin | Gaman að sjá þig |

---

## Kde hledat co

| Hledám | Kde |
|--------|-----|
| Tier logika, limity | runar-config.js: TIERS, TIER_LIMITS |
| IS/EN prompt buildery | runar-character.js |
| IS corrections systém | runar-character.js: getCorrPrompt(), applyISCorrections() |
| UI texty | runar-translations.js: UI_TEXT |
| Stav uživatele | runar-app.js: currentUser, userTier, readerUser, lang |
| Tree logika | runar-tree.js |
| Auth + tier check | runar-auth.js |
| Sdílené utility | runar-utils.js |
| Runa data | runar-runes.js: RUNES[], calcLifeRune() |
| Spreads config | runar-config.js: SPREAD_COSTS, SPREAD_CONFIG |

---

## Prioritní nedodělky

### 🔴 Kritické (blokuje prodej)
1. **Resend SMTP** — magic link emaily z agndofa.is
2. **Shopify webhook** — automatický upgrade po nákupu
3. **DPA Supabase** — čeká na e-mail

### 🟡 Důležité
4. **Standard tier** — způsob nákupu ("COMING SOON")
5. **Privacy Policy** — odkaz na agndofa.is

### 🟢 Střední priorita
- SSE streaming
- Delší výklady pro Standard (1000–1200 tokenů)
- Standard 50 / Premium 75 monthly limit — počítání z readings tabulky
- Weekly drip odstranit z claude-proxy Edge Function
- Specifická otázka reframing v buildReadingPromptIS/EN

### 🌿 Tree of Life — budoucí rozšíření readeru
Dva nové módy čtení pro přihlášené uživatele (implementovat až Tree tab bude live):

**A) "Neuložit do stromu"** — přihlášený uživatel může udělat čtení bez zápisu do stromu.
  - Toggle / checkbox před čtením: "Save to my tree" (default: on)
  - Pokud off: saveReading() proběhne normálně (journal), ale tree branch se nevytvoří
  - Případ: rychlé čtení, experiment, "chci jen výklad"

**B) "Čtení pro někoho jiného"** — přihlášený user zadá jiné jméno + DOB
  - Výsledek se NEZAPÍŠE do stromu přihlášeného uživatele
  - Uloží se do journalu jako speciální záznam (označen "for: Jméno")
  - Tree branch se nevytvoří (čtení nepatří tomuto stromu)
  - Kreditní cena stejná, z limitu uživatele

Závisí na: tree_state DB tabulce, branch systému.

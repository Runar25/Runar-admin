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

### §15 — Vocab/tier termíny = z VOCAB/TIERS, NIKDY natvrdo
Název karty/jednotky/spá a tier jména: přes `vl()`/`vlp()`/`vn()`/`tp({card})` / `TIERS[x].label`.
Štítky a tlačítka templatuj s `{card}`/`{unit}` placeholderem; v dlouhé marketingové próze je brand jméno OK.
Platí i pro hodnoty v translations.js (ne jen logiku) — gift_card_btn, panely atd.
Seznam zbývajících hardcoded míst k vyčištění → working-style.md.

---

## Tier systém

| DB hodnota | UI jméno | Přístup |
|-----------|---------|---------|
| free_trial | Visitor | 1 cast, anon, jen Fehu |
| rune_seeker | Rune Seeker | 1 cast zdarma při registraci (pak rune readings), journal 5 |
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
| Kříž | 5 | ✅ reader (RS+ za rune readings) |
| Horseshoe | 7 | ✅ reader (RS+ za rune readings) |
| Yggdrasil | 9 | ✅ reader (všichni přihlášení, Dec 14–28) |
| The Gathering | — | ❌ redesign (tree_state DB) |

---

## Tree of Life — stav
✅ calcLifeRune(), generování + uložení, Tree tab UI, IS 3-vrstvý systém, isLifeRune detekce
🧪 Rendering engine LAB v0.7 (2026-06-11): runar-tree-model.js (čistá logika, bez DOM) +
   runar-tree-render.js (Canvas 2D, dual-canvas, pixelRatio, Page Visibility) +
   runar-tree-lab.html (timeline ve dnech, cast tlačítka pro všechny spready, tuning panel).
   KMEN: hloubkové vrstvení — fibresPerLayer (6) vláken na vrstvu, nejnovější vrstva
   k pozorovateli (depth +0.9, světlejší), nejstarší vzadu (tmavší); vrstvy mírně offset
   (golden) → kmen neroste do šířky ale do hloubky. Vlnění weaveAmp/weaveFreq (default 0.009/2.2).
   PÁTEŘ: celý kmen se prohýbá v S-křivce (spineAmp/spineWaves); náklon a míra prohnutí
   řízena M.setTreeBias(-1..1) = životní runa inner/outer world (0 = vyrovnaný → přímý strom).
   SOUDRŽNOST: TUNING.cohesion — vlákna se u země přitahují ke společné páteři (kmen = jeden
   celek bez mezer), individualizují se až s výškou, oddělená jsou jen ve větvích.
   VĚTVE: oblouky, ne přímky — branchAngle() = blend od tečny hostitele (bendZone) + vnější
   arc (flowCurve) + zvednutí špičky (tipLift). Akvarelová reference.
   ATTACHMENT STRATEGIE (pojmenované, přepínatelné v labu, TUNING.attachMode):
   · 'ride' (default): nové čtení se napojí na lianu stejného elementu, ~70 % jede kus po ní
     (opticky ji zesílí — sdílený úsek je tlustší), pak se odpojí a vytvoří větev (rideLen)
   · 'branch': napojí se bodově, drží sektor hostitele (sectorDir, sectorWidth)
   · 'free': v0.5 globální golden fan (pro srovnání)
   KŘÍŽENÍ: sektorové směry — větvička zkoumá jen okolí směru svého hostitele.
   VÝPLŇ KORUNY: golden alokace exitů + strany alternují; nižší exit → horizontálnější.
   BARVY: skutečný jasan — kůra teplá stříbřitě šedá, listy jasanová zeleň (tlumená).
   TLOUŠŤKY: rootWidth/trunkWidth/branchWidth multiplikátory.
   PAINTERLY RENDERING (v0.7): 3 vrstvy na segment — tmavá kontura pod tělem + tělo +
   světlý hřbet na straně světla (zleva shora, LX/LY v rendereru) = kreslený dvojtahový look.
   Listy = LEAF_CLUSTER trsy (5 lístků, 3 zelené tóny per element) místo jedné elipsy.
   Jemnější špičky větví (0.55/0.5 px).
   SROVNÁNÍ DVOU VARIANT (2026-06-12): KUKY se ptal, zda engine vychází z parametrů z jeho
   dokumentů (render_spec v3 = rekurze+Bezier) nebo jiný systém. ODPOVĚĎ: liana engine je
   z fable5_runar_context.md (start/branch_angle/branch_point), NE render_spec v3. Sémantické
   mapování (význam→osa) z tree-of-life.md nebylo zapojeno — směr větve řídil golden alokátor.
   → Dvě verze pro porovnání:
   · LIANA v0.7 (zmrazená): v2/tree-snapshots/v07-liana/ — golden harmonie, bez sémantiky
   · HYBRID: v2/tree-lab-hybrid/ — liana vzhled + Norns-osové řízení (build_tree_hybrid.py
     patchuje v0.7 model). Význam (intention+area+mood+heavy / axisHint) → elevation [-1,1]
     (urd dolů/ven · verdandi strany · skuld nahoru) + laterality (inner=vlevo/outer=vpravo).
     TUNING.semanticWeight (0=harmonie, 1=čistý význam, default 0.8) — slider v labu.
     Norns spread: 3 runy = explicitní axisHint urd/verdandi/skuld. Ověřeno: slider mění tvar.
   Hlavní lab v2/runar-tree-lab.html zůstává = liana v0.7. Generátory: build_tree_lab.py (liana),
   build_tree_hybrid.py (hybrid). Stále NEKOMITOVÁNO — KUKY porovnává, která cesta je lepší.
   · V3 SKELETON (2026-06-12, RUNAR_FABLE5_CONTEXT.md): v2/tree-lab-v3-skeleton/
     (build_tree_v3.py, vlastní namespace RunarTree3Model/Renderer). Model kostra+rekurze:
     kmen = PODSTATA (3 Norns kořeny se splétají vzhůru do sloupu — braid, + Life Rune seed
     knot, charakter kmene z Life Rune čísla), koruna = AKTIVITA (čtení = krátké rozhodné
     větve z růstových bodů, rekurzivně, level cap 5, growth budget maxKids 3 — anti brokolice).
     Větve se liší ÚHLEM ne délkou (délka jen ±15 % šum). Runové signatury v tvaru větve
     (curve/sub/taper, RUNE_SHAPE tabulka) — ZÁMĚRNĚ jemné, slider runeSignature (KUKY:
     skryté, uživatel je má hledat). Kořeny jen o trochu tmavší (nízké ct, KUKY). Velká
     čtení (horseshoe/yggdrasil) zakládají VLASTNÍ kořenovou linii za kmenem až do země
     (vzácná „liana"). Kmen tloustne pomalu logaritmicky s korunou (trunkGrowth) — podstata
     nese aktivitu, není z ní. Sémantická elevace (osa→výška napojení) přenesena z hybridu.
     Bez záblesků na špičkách (dle dokumentu). Rozcestník v2/tree-lab-index.html = 3 karty.
     PRODUKČNÍ PRINCIP (domluveno): pozice větve se počítá JEDNOU při čtení a ukládá do
     tree_readings.branch_data — nikdy nepřepočítávat, jinak se lidem přeskládají stromy.
   KOŘENY: integrátor se silnou seeded křivostí — rozbíhají se do všech stran (rootFan),
   kroutí (rootCurl), kříží a proplétají (depth osciluje podél kořene); golden walk směrů.
   KORUNA: scaffoldFan pro hlavní větve do stran, crownFan + user.crownBias = asymetrie;
   attached větve pokračují podél hostitele ven (mix host tangent + fan dir), ne nahoru.
   M.TUNING (16 parametrů, slidery v labu) · M.setUserSeed() = per-user strom.
   Páry: love (srdce, heartSize) + flame (proplet kolem osy, flameSize/flameWaves).
   Bloom: silhouette→growing→full→leafing, parent/child gating. Barvy: stříbrná kůra jasanu
   + element tint ke špičce, modro-černé listy.
   Generátor: build_tree_lab.py (§1). NENÍ napojeno na DB ani reader — čeká na vizuální schválení.
❌ branch systém v produkci, tree_state/tree_readings DB tabulky — čeká na V3
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

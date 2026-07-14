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
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), RP_* packs + buildReadingPrompt()
                         + spread dispatchers, buildLifeRunePromptIS/EN(), getCorrPrompt(), applyISCorrections()
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
**Runové glyfy = JEDEN zdroj kresby (RUNE_SVGS), rámování dle ROLE** — přes helper `runeSvg(rune,{frame})` (runar-utils.js, §3): `frame:true` = kámen (runa + rám) pro mřížky/kolekci (runy jako předměty); `frame:false` = holá linka (jen runa, #D6A85C) vedle textu (strip, tree glyf, rune-info, detail, badge, sloty, journal). NIKDY font glyf jako primární (nekonzistentní napříč zařízeními). Blank = orámované prázdno (kámen = prázdný kámen · holá linka = zlatý obrys), NIKDY `○`. ᚱ brand = ZVLÁŠŤ (font, chrome v HTML, neřeší se přes runeSvg).

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

### §13 — Nová věc musí projít VŠEMI cestami (Full-path rule)
Nový field → všechny buildXxxPromptIS/EN · startReading() · resetReader() · shrine parts[]
Nový spread → readRune() · drawAnother() · resetReader() · _setSpreadMode() · generateVoice()
Migrace → grep starý text, aktualizovat VŠECHNY výskyty (sdílené i lokální)
Před commitem: "Existuje jiná cesta kódem kde tohle chybí?"

### §14 — updateUIText() = POUZE statické překlady
`updateUIText()` se volá na každém přepnutí jazyka — NIKDY sem nepřidávat state-dependent obsah.
Dynamický obsah patří do dedikovaných funkcí:
- `_updateReadingForm()` — `reader-card1-lbl` (heading) + `reader-note`
- `_updateDobLabel()` — DOB pole
Porušení způsobí přepsání personalizovaného textu při přepnutí jazyka.

### §15 — Vocab/tier termíny = z VOCAB/TIERS, NIKDY natvrdo
Název karty/jednotky/spá a tier jména: přes `vl()`/`vlp()`/`vn()`/`tp({card})` / `TIERS[x].label`.
Štítky a tlačítka templatuj s `{card}`/`{unit}` placeholderem; v dlouhé marketingové próze je brand jméno OK.
Platí i pro hodnoty v translations.js (ne jen logiku) — gift_card_btn, panely atd.
Seznam zbývajících hardcoded míst k vyčištění → working-style.md.

### §16 — Two-output rule + Reconciliation (doc sync)
Task měnící chování/rozhodnutí (ne refactor/CSS) = Output A (práce) + Output B = 1 záznam do
`RUNAR_DECISIONS.md` (append-only) + oprav špatnou sekci dotčeného docu ve stejném turnu.
Reconciliation (owner-triggered): „Reconciliation: `<doc|modul>`" → Code vypíše divergence list
(doc vs kód) a STOP, owner rozhoduje. Formáty polí + detail → RUNAR_DOC_SYNC.md / RUNAR_DECISIONS.md.

### §17 — Doc sync: jediný zdroj = git repo, sdílená paměť přes junction
Auto-paměť žije v `Downloads\Runar-admin\memory\` (MEMORY.md, working-style.md, runar-project.md,
snapshots/ + tree paměti). Obě platformní pamětové složky (`AppData\Roaming\Claude\memory` = Cowork,
`.claude\projects\C--Users-zkuku\memory` = Code) jsou **junction na `repo\memory\`** → oba agenti čtou i
píší STEJNÉ soubory, git verzuje, žádný sync skript, žádný drift. `RUNAR_*.md` + `CLAUDE.md` zůstávají
v rootu (čtou se on-demand, ne jako auto-paměť). Každá změna = malý commit + push IHNED, prefix `[docsync]`.
Rozbitý junction (app přepsala složku) → spustit `memory\relink-memory.ps1`. Detail → RUNAR_DECISIONS.md (2026-07-04).

### §18 — Jeden zdroj pravdy, žádné paralelní kopie (ANTI-DRIFT)
Kořen měsíce oprav = duplikace + rozsypané řetězce („všechno všude a nikde"). Prevence:
1. **Každý řetězec/hodnota/chování žije na JEDNOM místě.** Jazykové / tier / spread varianty = **DATA** (per-jazyk packy `RP_*`, config, `VOCAB`/`TIERS`), konzumované JEDNOU cestou kódu. NIKDY „copy-paste-then-edit" dvě skoro stejné funkce — přesně tak se rozešly IS/EN buildery a vznikl měsíc oprav.
2. **Než napíšeš druhou „skoro stejnou" věc → STOP:** dá se to jako data + jedna funkce? Přidání jazyka/spreadu = přeložit/přidat pack, ne nový builder.
3. **Refaktor měnící generovaný výstup = golden-verify** (snapshot PŘED/PO přes `scripts/golden/`, diff = jen zamýšlené). Nikdy „přepiš a doufej".
4. **Změny kvality čtení = MĚŘIT evalem** (Workflow: generuj → adversariální grader), ne hádat. Objektivní věci (IS gramatika) měř tvrdě; subjektivní styl = human judgment (auto-grader je moc přísný).
5. **Nová věc → §13 full-path** (projít VŠECHNY cesty) PLUS zapsat do jednoho packu/configu, ne rozsypat po souborech.

### §19 — Ověřuj VÝSLEDEK, ne tvar kódu (anti-tichá-chyba)
Měsíc tichých chyb (korekce běžely mrtvé, check-is skenoval špatnou plochu, `láta séð` prošlo) měl JEDEN kořen: každá kontrola ověřovala **tvar kódu** (parsuje? string existuje ve zdroji? builder dává stejné byty?), ale nic neprotlačilo známý vstup **reálnou cestou** a neověřilo **výsledek**. Rozsypání (§18) chyby jen schovalo.
1. **Seed-and-assert na hranici.** Kde data přechází hranici (DB→kód, zdroj→prompt, stav→reset), měj JEDEN drobný fixture co protlačí známý vstup skrz produkční funkce a ověří výsledek (očekávané JE přítomno / špatné NENÍ). Vzor = `golden_contracts.js` (smoke.py kontrola ⑥): seed raw DB řádku → `normalizeCorrections`→`getCorrPrompt`+`applyISCorrections` → replacement přežil, žádné „undefined". Fixture musí sám cvičit pravou hranici (ne test-double se špatnými klíči).
2. **Žádné tiché zelené.** Co nástroj **prokazatelně neposoudí** (subtilní IS gramatika — kauzativa, vazby) NESMÍ projít zeleně → do **pojmenované lidské fronty** (is-grammar-qa: `E001` → NATIVE EYE; `IS_NATIVE_CHECKLIST.md` pro Sigrún). Filtrovaný signál = viditelný žlutý, ne zahozený.
3. **Kontrola běží na TÉ PLOŠE, kde bug žije.** Dynamický model-output ≠ zdrojový string; DOM stav ≠ builder output. Kontrola na proxy ploše se nepočítá jako pokrytí.

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

**Unified format**: 1 plynoucí blok, žádné `|||`. `layer1-lbl` = glyf + jméno runy.
`_readingMode` = `'mine'` (ukládá — journal píše SERVER-SIDE claude-proxy, atomicky s odečtem kreditu; klient jen loadJournal) | `'someone'` (neukládá).
`u.area/seeking/mood/intention/question` → `parts[]` → Claude. Norns axis: `_moodContext(mood,lang)` + `_intentionContext(intention,lang)` v runar-character.js.

**Délky čtení**: zdroj pravdy = buildery v `runar-character.js` (RP_* packy + `closing()` věty). Docs čísla NEopakují — když měníš délku, uprav builder + přepočítej pricing (RUNAR_PRICING.md). Délka = znaky = EL náklad. Jméno ne vždy na začátek; životní runa jen kontext.

**Sezónní obraznost**: `_seasonalImagery(lang, drawn)` injektuje per-čtení 1 obraz islandské sezóny (`SEASON_POOLS` bright/cold, localStorage no-repeat sáček; studené runy → cold set). KLÍČ: per-čtení user-prompt injekce model POSLECHNE, system prompt IGNORUJE → `buildSysPromptV2` REDUNDANTNÍ (jen lab). Reader = `buildSysPrompt`.

### Spread systém
Kredity = per typ čtení (NE počet run); hodnoty v `SPREAD_COSTS` (config = zdroj pravdy). Předplatné počítá stejné jednotky. Founding = Norns.

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
✅ Produkce (logika): calcLifeRune(), generování + uložení Life Rune, Tree tab UI, IS 3-vrstvý systém.
🧪 Vizuální engine = LAB (Canvas 2D), NEKOMITOVÁNO, nenapojeno na DB/reader — čeká na schválení.
❌ branch systém v produkci, tree_state/tree_readings DB — čeká na V3.
**Detail (engine, iterace, lab soubory) → RUNAR_TREE_LAB.md** (doménový doc TREE session). Design → tree-of-life.md + RUNAR_DESIGN.md.

## Word Corrections
Živá data: `python show_corrections.py`
Nová korekce → přidat do BAD_PATTERNS v check-is.py + do DB přes shrine.

---

## Kde hledat co
Tiers/limity/vocab/spreads → `runar-config.js` · Prompty IS/EN + corrections → `runar-character.js`
UI texty → `runar-translations.js` · User state → `runar-app.js` · Tree logika → `runar-tree.js`

Architektonická rozhodnutí (proč, one-way) → `RUNAR_DECISIONS.md`
Designová rozhodnutí (co a proč) → `RUNAR_DESIGN.md`
Tree of Life (zakládací rituál, větve, elementy, kořeny) → `tree-of-life.md`
Pattern detection + The Gathering (Eagle/Níðhöggr, transformační páry) → `runar-patterns.md`
Business model + ceny + EL kalkulace → `RUNAR_PRICING.md`

**Doc-owner pravidla (2026-07-05):**
- **Čísla = jen v configu / builderech** (SPREAD_COSTS, TIERS, character.js). Docs je NEopakují — odkazují na zdroj (délky→character.js, ceny/kredity→config).
- **1 téma = 1 vlastník doc.** Žádné nové samostatné docs — když téma patří jinam, jinde jen odkaz.
- **Délka docu ~200 řádků** (250 OK, když to fakt pomáhá). Nad = rozdělit nebo přesunout detail do doménového doc/snapshotu.

---

## Dvě paralelní session — koordinace
Repo zpracovávají DVĚ Claude Code session paralelně. Aby si nelezly do zelí:

**Domény (kdo co edituje):**
- MAIN (Opus): reading systém, prompty (reading buildery v runar-character.js), config (TIERS/SPREAD_COSTS/SPREAD_CONFIG/VOCAB), pricing, translations, reader UI/CSS, auth, app, journal. = vše KROMĚ tree vizuálu.
- TREE (Fable 5 / Cowork): vizuální engine — runar-tree-model.js, runar-tree-render.js, runar-tree-lab*.html, runar-branch.js, tree-lab-*/, tree-snapshots/, build_tree_*.py / build_*composer.py. Doménový doc = RUNAR_TREE_LAB.md.

**Hranice:**
- **Sdílená sémantická vrstva (runa → růst).** Kanonická data run (`runar-runes.js`: aett/world/element/keywords) + config (AETTY, SPREAD_CONFIG.norns_axis, MOODS/INTENTIONS) čtou OBĚ session. TREE růstové/tvarové mapování drž ve VLASTNÍM souboru (`runar-branch.js`). Když MUSÍŠ sáhnout do runar-runes.js/config kvůli růstu: **jen ADITIVNĚ** (přidej pole, neměň existující reading-pole), `[tree]` malý commit, push HNED + řádek do MEMORY.md (MAIN to musí vidět — sdílená data mění i výklad). Změna existujícího aett/element/world runy ovlivní i čtení → napřed flagni.
- **Čistě MAIN (TREE needituje):** reading prompty (character.js reading buildery), pricing, translations UI, reader UI/CSS, auth. Life-rune logika (runar-tree.js generateLifeRuneReading, buildLifeRunePrompt) = MAIN.
- `§1` (JS přes Python skript, NE Edit — kazí apostrofy) + `§13` (full-path) platí i pro TREE, když sahá do sdíleného JS.
- CLAUDE.md: každá session edituje JEN svou sekci. Tree sekce = krátký ukazatel (detail v RUNAR_TREE_LAB.md). MAIN ho nepřepisuje.

**Komunikace (session spolu nemluví → přes git + soubory):**
- `git pull` PŘED prací · `git push` IHNED po commitu · malé commity.
- Commit prefix: `[tree]` (tree session) vs `[reading]`/`[pricing]`/`[fix]` (main) → čitelná historie + jasné vlastnictví.
- Musíš sáhnout do cizí domény? Drž změnu minimální + zapiš „co a proč" do svého doc (RUNAR_TREE_LAB.md / snapshot) + push hned.
- sw.js: git hook auto-bumpuje; když oba commitnou JS, vyšší číslo vyhrává (jen cache-buster, ne konflikt obsahu).
- Git konflikt? Neforcuj — pull, vyřeš ručně JEN svou doménu.
- Poslední stav každé session → MEMORY.md (SW + commit) + vlastní doc/snapshot. Před prací přečti druhý doc.

<!-- „Cowork sync" (zrcadlo do AppData/Cowork složky) ZRUŠENO — nahrazeno §17 (jediný zdroj = git repo). -->
<!-- 2026-07-04 [docsync] -->


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
                         + spread dispatchers, buildLifeRunePromptIS/EN(), getCorrPrompt(), applyISCorrections() [VYPNUTÝ]
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

**Kam ukládat nové soubory:** SQL migrace → `sql/` jako `YYYY-MM-DD_popis.sql` · archivní nebo
dočasné dokumenty a POC/experiment HTML → `docs/archive/` · patch skript → VŽDY `scripts/_patch.py`
(jedna stabilní cesta, přepisuje se; nový název = nový permission prompt).

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
Každé Claude generování v IS má **3 vrstvy** (všechny v promptu — korekce se řeší v kontextu):
```js
var sys    = buildSysPrompt(activeChar, lang);        // 1. IS system prompt
var prompt = buildReadingPrompt(u, drawn, lang, ...); // 2. prompt přímo v IS (RP_* pack)
if (getCorrPrompt(lang, corrections)) prompt += ...;  // 3. corrections blok DO promptu
```
⚠️ **Žádná 4. vrstva.** `applyISCorrections` (slepý substring post-processor) je **VYPNUTÝ**
od 2026-07-10 — `CORRECTIONS_POSTPROCESS=false`, funkce hned vrací vstup. Byl kontextově slepý
(neuměl pád ani rod). Kdo ho sem vrátí jako živou vrstvu, popisuje kód, který neběží.

### §3 — Sdílené moduly = automatický sync
runar-character.js a runar-utils.js načítají reader i shrine. NIKDY neduplikovat do shrine.

### §4 — SW verze
Auto-bump: git pre-commit hook (hooks/pre-commit.py). Po fresh clone: `python -X utf8 hooks/install-hooks.py`
Ruční bump pokud je sw.js already staged před commitem.

### §5 — UI invarianty
var(--gold) = #FFBF00 · var(--dim) = #3a4a60 NIKDY pro text · reader-content se NIKDY neskrývá
Runa ᚱ: vždy zlatá, NIKDY s ozdobami (◌ ᚱ ◌ zakázáno)
**Runové glyfy = JEDEN zdroj kresby (RUNE_SVGS), rámování dle ROLE** — přes helper `runeSvg(rune,{frame})` (runar-utils.js, §3). Pravidlo (KUKY 2026-07-14): **`frame:true` = KÁMEN pro runy, které TAHÁŠ/DRŽÍŠ** (draw grid, kolekce, kolekce detail, reading strip single+spread, spread sloty, journal karty); **`frame:false` = HOLÁ linka (#D6A85C) pro životní runu (esence, ne tažený kámen: badge + tree teaser/cta/exists/loading) + textové popisky (rune-info)**. NIKDY font glyf jako primární (nekonzistentní napříč zařízeními). Blank = orámované prázdno (kámen = prázdný kámen · holá = zlatý obrys), NIKDY `○`. Holá runa = jen hlavní tah (keep-mapa `RUNE_BARE_KEEP`, ozdůbky pryč). Tap popup kopíruje `g.innerHTML` (SVG), ne textContent. ᚱ brand = ZVLÁŠŤ (font, chrome v HTML, neřeší se přes runeSvg).

### §6 — Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
THE GATHERING · RÚNAR
Jména tierů sem NEPIŠ — mají IS varianty a bydlí v `TIERS.*.label` / `.label_is` (§20).

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
(doc vs kód) a STOP, owner rozhoduje. Formáty polí + příklady → RUNAR_DECISIONS.md (RUNAR_DOC_SYNC.md neexistuje, je v docs/archive/).

### §17 — Doc sync: jediný zdroj = git repo, sdílená paměť přes junction
Auto-paměť žije v `Downloads\Runar-admin\memory\` (MEMORY.md, working-style.md, runar-project.md,
snapshots/ + tree paměti). Obě platformní pamětové složky (`AppData\Roaming\Claude\memory` = Cowork,
`.claude\projects\C--Users-zkuku\memory` = Code) jsou **junction na `repo\memory\`** → oba agenti čtou i
píší STEJNÉ soubory, git verzuje, žádný sync skript, žádný drift. `RUNAR_*.md` + `CLAUDE.md` zůstávají
v rootu (čtou se on-demand, ne jako auto-paměť). Každá změna = malý commit + push IHNED, prefix `[docsync]`.
Rozbitý junction (app přepsala složku) → spustit `memory\relink-memory.ps1`. Detail → RUNAR_DECISIONS.md (2026-07-04).
**Kanonický doc žije JEN v repu (2026-07-17).** Cowork výstupy jdou do repa VÝHRADNĚ přes CODE. Zrcadlo
(`C:\Users\zkuku\Claude\Projects\RÚNAR the rune keeper\`) NENÍ paralelní kopie — nanejvýš dočasný draft
označený „→ CODE", který po převzetí zmizí. Zrcadlo-kopie = zdroj driftu (ověřeno 2026-07-17: zrcadlové
`RUNAR_CONTEXT` a `working-style` se od repo verzí rozešly OBĚMA směry → nelze slít automaticky).
⚠️ **Junction ≠ zrcadlo.** Junction (memory/) je JEDEN soubor přes link a funguje; kopie v Projects/ je něco
jiného. Než se jakákoli zrcadlová kopie smaže, MUSÍ se ověřit diffem, co je v ní navíc — a přenést to.

### §18 — Jeden zdroj pravdy, žádné paralelní kopie (ANTI-DRIFT)
Kořen měsíce oprav = duplikace + rozsypané řetězce („všechno všude a nikde"). Prevence:
1. **Každý řetězec/hodnota/chování žije na JEDNOM místě.** Jazykové / tier / spread varianty = **DATA** (per-jazyk packy `RP_*`, config, `VOCAB`/`TIERS`), konzumované JEDNOU cestou kódu. NIKDY „copy-paste-then-edit" dvě skoro stejné funkce — přesně tak se rozešly IS/EN buildery a vznikl měsíc oprav.
2. **Než napíšeš druhou „skoro stejnou" věc → STOP:** dá se to jako data + jedna funkce? Přidání jazyka/spreadu = přeložit/přidat pack, ne nový builder.
3. **Refaktor měnící generovaný výstup = golden-verify** (snapshot PŘED/PO přes `scripts/golden/`, diff = jen zamýšlené). Nikdy „přepiš a doufej".
4. **Změny kvality čtení = MĚŘIT evalem** (Workflow: generuj → adversariální grader), ne hádat. Objektivní věci (IS gramatika) měř tvrdě; subjektivní styl = human judgment (auto-grader je moc přísný).
5. **Nová věc → §13 full-path** (projít VŠECHNY cesty) PLUS zapsat do jednoho packu/configu, ne rozsypat po souborech.

### §19 — Ověřuj VÝSLEDEK, ne tvar kódu (anti-tichá-chyba)
Měsíc tichých chyb (korekce běžely mrtvé, check-is skenoval špatnou plochu, `láta séð` prošlo) měl JEDEN kořen: každá kontrola ověřovala **tvar kódu** (parsuje? string existuje ve zdroji? builder dává stejné byty?), ale nic neprotlačilo známý vstup **reálnou cestou** a neověřilo **výsledek**. Rozsypání (§18) chyby jen schovalo.
1. **Seed-and-assert na hranici.** Kde data přechází hranici (DB→kód, zdroj→prompt, stav→reset), měj JEDEN drobný fixture co protlačí známý vstup skrz produkční funkce a ověří výsledek (očekávané JE přítomno / špatné NENÍ). Vzor = `golden_contracts.js` (smoke.py kontrola ⑥): seed raw DB řádku → `normalizeCorrections`→`getCorrPrompt`+`applyISCorrections` → replacement přežil, žádné „undefined". Fixture musí sám cvičit pravou hranici (ne test-double se špatnými klíči).  <!-- check-docs:ok -->
2. **Žádné tiché zelené.** Co nástroj **prokazatelně neposoudí** (subtilní IS gramatika — kauzativa, vazby) NESMÍ projít zeleně. Filtrovaný signál = **viditelný žlutý, ne zahozený** (is-grammar-qa: `E001` = „nerozparsováno" ≠ „v pořádku"). ⚠️ **Fronta „NATIVE EYE / Sigrún" ZRUŠENA (KUKY 2026-07-18).** Nesrozumitelný výstup se **přepíše, dokud mu nástroj nerozumí** (přesně tak byl vyřešen E001 2026-07-17 — přepsáním na plné věty), ne odloží na někoho jiného. IS děláme rovnou hotovou a ověřenou → [[is-done-together-not-for-sigrun]].
3. **Kontrola běží na TÉ PLOŠE, kde bug žije.** Dynamický model-output ≠ zdrojový string; DOM stav ≠ builder output. Kontrola na proxy ploše se nepočítá jako pokrytí.

### §20 — Jedna informace = jedno místo. Nikdy dvě.
KUKY 2026-07-18: *„nechci aby žádné informace žily na více než 1 místě! už když to jsou dvě místa,
tak nám to vytváří problémy. Žádné duplikáty!"* Není to úklid, je to **pravidlo pro psaní**.
Doloženo: audit našel **97 rozporů nad ~12 fakty** (každý na 4–7 místech). Yggdrasil kvůli tomu
musel owner opravovat **pětkrát** — opraví se tři výskyty, čtvrtý přežije a příští session ho
přečte jako pravdu. **Dvě kopie nejsou riziko rozporu; jsou rozpor s odloženou splatností.**

**Než napíšeš fakt do docu, zeptej se: kde tohle už bydlí?**
1. **Bydlí v kódu → doc to NIKDY neopisuje**, jen odkáže. Čísla (`SPREAD_COSTS`, `TIERS`,
   `monthly_readings`), labely (`VOCAB`, tier jména), délky čtení (buildery), model (proxy MODELS).
   Doc smí říct „ceny jsou v `SPREAD_COSTS`", nesmí říct „Norns = 2 kredity".
2. **Bydlí v jiném docu → odkaz, ne převyprávění.** Převyprávění vlastními slovy je taky kopie —
   a rozejde se hůř, protože grep ho nenajde.
3. **Nebydlí nikde → urči vlastníka a napiš to TAM.** Ne tam, kde to zrovna píšeš.
4. **Stav („hotovo/TODO/nasazeno") vlastní kód a `git log`.** Do docu nepatří SW verze, commit hash
   ani „čeká na push" — to zastará do druhého dne. `RUNAR_DECISIONS.md` vlastní *rozhodnutí*, ne stav.

**Zakázaný druh dokumentu: „shrnutí všeho".** Nevlastní žádné téma, jen kopíruje cizí — a proto
se NEMŮŽE nerozejít, nemá se čeho držet. Takhle umřel `memory/runar-project.md` (sám vygeneroval
~15 nálezů auditu; 2026-07-18 vyprázdněn na rozcestník). Nový doc musí umět odpovědět: **co vlastní
ten a žádný jiný?** Neumí-li, nevzniká.

**Při sporu vyhrává PRODUKCE**, pak nejnovější datovaný záznam v `RUNAR_DECISIONS.md`.
Na rozhodnutou a datovanou věc se ownera neptej — dohledej ji (KUKY 2026-07-18).

**§16 output B není formalita.** Když záznam řekne `Affected doc(s): X`, oprav X **v tomtéž commitu**.
Nesplněný řádek `Affected doc(s)` je přesný mechanismus, který tenhle nepořádek vyrobil.

---

## Tier systém
**Zdroj pravdy = `v2/runar-config.js`** (`TIERS` = jména EN/IS + flagy · `TIER_LIMITS` = pravidla
· `TIERS.*.monthly_readings` = kapacity). **Tady se to NEOPISUJE** — §20. Jména se od 2026-07-05
měnila dvakrát a každá opsaná tabulka to přežila jako zastaralá.

DB hodnoty (neměnné): `free_trial` · `rune_seeker` · `standard` · `premium`.
Identita: **všichni registrovaní jsou Rune Seeker**; standard/premium nejsou hodnosti, jen víc čtení.
ADMIN → `isAdmin()` v `runar-auth.js` (jediný seznam). **VŽDY testovat i jako visitor/rune_seeker.**

---

## DB — user_profiles
**Schéma vlastní databáze + `sql/` migrace. Tady se NEOPISUJE** (§20) — ručně vedený seznam
se rozešel o 4 sloupce dřív, než si toho kdokoli všiml (2026-07-19: chyběly `address_gender`,
`is_tester`, `analytics_opt_out`, `tester_consent_at` — a do všech tří klient zapisuje).
Aktuální sloupce: `supabase db query --linked "select column_name from information_schema.columns
where table_name='user_profiles'"`.

Co databáze sama neřekne, a proto bydlí tady:
- ⚠️ **`email` a `updated_at` v `user_profiles` NEEXISTUJÍ** — časté chybné hledání; e-mail je v `auth.users`.
- **Zapisovatelnou plochu** (které sloupce smí klient měnit) vlastní `sql/2026-07-16_user_profiles_column_grants.sql`
  a hlídá ji smoke ⑩. Peníze a oprávnění (`tier`, `credits_balance`, `free_balance`, `month_*`) píše
  VÝHRADNĚ server přes service_role.

---

## Reading systém — stav

**Unified format**: 1 plynoucí blok, žádné `|||`. `layer1-lbl` = glyf + jméno runy.
`_readingMode` = `'mine'` (ukládá — journal píše SERVER-SIDE claude-proxy, atomicky s odečtem kreditu; klient jen loadJournal) | `'someone'` (neukládá).
`u.area/seeking/mood/intention/question` → `parts[]` → Claude. Norns axis: `_intentionContext(intention,lang)` v runar-character.js.

**Délky čtení**: zdroj pravdy = buildery v `runar-character.js` (RP_* packy + `closing()` věty). Docs čísla NEopakují — když měníš délku, uprav builder + přepočítej pricing (RUNAR_PRICING.md). Délka = znaky = EL náklad. Jméno ne vždy na začátek; životní runa jen kontext.

**Sezónní obraznost**: `_seasonalImagery(lang, drawn)` injektuje per-čtení 1 obraz islandské sezóny (`SEASON_POOLS` bright/cold, localStorage no-repeat sáček; studené runy → cold set). KLÍČ: per-čtení user-prompt injekce model POSLECHNE, system prompt IGNORUJE → `buildSysPromptV2` REDUNDANTNÍ (jen lab). Reader = `buildSysPrompt`.

### Spread systém
Kredity = **per typ čtení**, NE počet run. Počty run i ceny = `SPREAD_COSTS` / `SPREAD_CONFIG`
(config = zdroj pravdy, **tady se neopisují**). Předplatné počítá tytéž jednotky. Founding = Norns.

Stav (tohle v configu není, proto bydlí tady): Single · Norns · Kříž · Horseshoe · Yggdrasil
= ✅ produkce. **The Gathering = ❌ redesign**, čeká na `tree_state` DB.

**Gating:** blokuje se jen **Visitor** (nepřihlášený) — ten má Single 1×. Každý přihlášený dosáhne
na všechno; Rune Seeker platí kredity, předplatitelé to berou z měsíčních jednotek.
⭐ **Yggdrasil = KDYKOLIV, KDOKOLIV přihlášený. Žádná brána na datum.** Zimní slunovrat = větší
**síla ve stromě**, ne podmínka přístupu (rituální čtení; bude jich víc). KUKY 2026-07-18, po páté
opravě téhož — detail `RUNAR_DECISIONS.md`. Kdo sem napíše „Dec 14–28" jako podmínku, dělá to znovu.  <!-- check-docs:ok -->

---

## Tree of Life — stav
✅ Produkce (logika): calcLifeRune(), generování + uložení Life Rune, Tree tab UI, IS 3-vrstvý systém.
✅ **Vizuální engine JE v produkci** (2026-07-10, admin-only beta): `runar-tree-prod.js` (generovaný
`build_tree_production.py`, crown-composer 1:1) roste z REÁLNÝCH čtení — `readings` → `readingsToTreeLog()`
→ `RunarTreeProd.render()`. Signály z labu dojely: intention→výška (`intZone`), area→strana (`areaSide`),
ætt→charakter růstu (`aettStr`). Gating na `isAdmin()` v `renderLivingTree()`.
❌ `tree_state` / `tree_readings` DB (= Muninn, paměť stromu) — na tom visí The Gathering + `detectPatterns()`.
⚠️ Strom se krmí **regexem přes text čtení** (glyfy 0x16A0–0x16FF z `rune_glyph + short_text`) — změna
formátu skládaného textu = tichá ztráta větví. Hlídá smoke ⑬ (`verify_tree_signals.js`).
**Kanonický vstupní bod = RUNAR_TREE.md** (duše + zóny + stavba + mapa doků). `RUNAR_TREE_LAB.md` = HISTORIE (docs/archive/tree/).

## Word Corrections
Živá data: `python show_corrections.py`
Nová korekce → přidat do BAD_PATTERNS v check-is.py + do DB přes shrine.

---

## Kde hledat co
Tiers/limity/vocab/spreads → `runar-config.js` · Prompty IS/EN + corrections → `runar-character.js`
UI texty → `runar-translations.js` · User state → `runar-app.js` · Tree logika → `runar-tree.js`

Architektonická rozhodnutí (proč, one-way) → `RUNAR_DECISIONS.md`
Designová rozhodnutí (co a proč) → `RUNAR_DESIGN.md`
Tree of Life — duše, zóny, signály, Gathering, mapa tree doků → `RUNAR_TREE.md` (KANONICKÝ)
  (`memory/tree-of-life.md` + `memory/runar-patterns.md` = starší surovina, ne zdroj pravdy)
Business model + ceny + EL kalkulace → `RUNAR_PRICING.md`

**Doc-owner pravidla (2026-07-05):**
- **Čísla = jen v configu / builderech** (SPREAD_COSTS, TIERS, character.js). Docs je NEopakují — odkazují na zdroj (délky→character.js, ceny/kredity→config).
- **1 téma = 1 vlastník doc.** Žádné nové samostatné docs — když téma patří jinam, jinde jen odkaz.
- **Délka docu ~200 řádků** (250 OK, když to fakt pomáhá). Nad = rozdělit nebo přesunout detail do doménového doc/snapshotu.

---

## N paralelních session — kdo o čem mluví
Repo zpracovává VÍC session naráz (2× Code + N× Cowork). **Git je všechny podepisuje „Runar Admin"**, takže
jediné, co v historii rozliší autora, je **commit prefix**. Bez něj nikdo nepozná, kdo co udělal.

### ⭐ Vedoucí pravidlo: dělíme se podle toho, kdo co VIDÍ (2026-07-17, KUKY)
- **Cowork mluví o DATECH** — čtení, evaly, screenshoty, copy, design, obsah. To vidí celé a správně.
- **CODE mluví o KÓDU** — git, soubory, stav, chování. To vidí jen on.
- **Cowork NIKDY nediagnostikuje kód. CODE NIKDY nerozhoduje o obsahu a designu.**

Cokoli o kódu formuluje Cowork jako **otázku na CODE**, ne jako úkol: ne „přeformuluj angl na ř. 278", ale
„vidím `already` ve 4 z 5 čtení — najdi zdroj". **Otázka nemůže být špatně; diagnóza ano.**
**Proč:** 2026-07-17 stály ČTYŘI spory na tomtéž kořeni — useknutý claude-proxy · mrtvý `already` angl ·
„hlavička tahá latinské PERTH" · „junction nežije". Pokaždé Cowork tvrdil něco o kódu, na který nevidí
(vadný mount, vlastní kopie, nemůže commitnout). **Není to nekázeň, je to strukturální** — a owner to pak
musí rozsuzovat, čímž mu den sežere koordinace.

**Handoff začíná řádkou `psáno proti commitu <hash>`.** CODE ji porovná s HEAD a zastaralý handoff odmítne
SÁM — bez ownera.

**Lanes (kdo co vlastní):**
- **CODE-tune** → prefix `[tune]` (+ `[reading]`/`[fix]`/`[pricing]` jako téma): reading systém, prompty (buildery v runar-character.js), config (TIERS/SPREAD_COSTS/SPREAD_CONFIG/VOCAB), pricing, translations, reader UI/CSS, reporter, auth, app, journal, eval-IMPLEMENTACE, copy. = vše KROMĚ tree vizuálu.
- **CODE-tree** → prefix `[tree]`: vizuální engine — runar-tree-model.js, runar-tree-render.js, runar-tree-lab*.html, runar-branch.js, tree-lab-*/, tree-snapshots/, build_tree_*.py / build_*composer.py, `RUNAR_TREE_*` docs, `tree_state` DB. Doménový doc = RUNAR_TREE.md.
- **Cowork** → prefix `[cowork]`: design, docs, eval-OBSAH, copy audit, handoffy. Repo **READ-ONLY přes `git show HEAD:`** (ne `git status`, ten zapisuje do indexu); do repa píše VÝHRADNĚ přes CODE. Další Cowork session = táž lane, táž pravidla.

**Mechanika (co ZBYLO — zbytek obstará git):**
- **Commit prefix = LANE. `git log` s prefixy JE akční log.** Samostatnou řádku do `RUNAR_DECISIONS.md` piš
  jen pro to, co git NEVIDÍ: deploy, SQL puštěné ownerem, rozhodnutí. (Logovat každý commit dvakrát = práce navíc.)
- Nejde commitnout (lock/přístup) → NESAHAT, jen ohlásit. Neviditelná změna je horší než žádná.
- Handoff má sekci `ZMĚNĚNO:` (co jsem změnil), i prázdnou.
- ⭐ **Pravidlo, které musí hlídat člověk, dřív nebo později spadne na ownera → kde to jde, udělej
  z pravidla KONTROLU ve smoke.** Vzory: ⑩ zapisovatelná plocha (klient vs granty), ⑪ memory index
  (odkazy + neverzované soubory). Obojí vzniklo z chyby, kterou žádné pravidlo nechytilo.

**Hranice:**
- **Sdílená sémantická vrstva (runa → růst).** Kanonická data run (`runar-runes.js`: aett/world/element/keywords) + config (AETTY, SPREAD_CONFIG.norns_axis, MOODS/INTENTIONS) čtou OBĚ session. TREE růstové/tvarové mapování drž ve VLASTNÍM souboru (`runar-branch.js`). Když MUSÍŠ sáhnout do runar-runes.js/config kvůli růstu: **jen ADITIVNĚ** (přidej pole, neměň existující reading-pole), `[tree]` malý commit, push HNED + řádek do MEMORY.md (MAIN to musí vidět — sdílená data mění i výklad). Změna existujícího aett/element/world runy ovlivní i čtení → napřed flagni.
- **Čistě MAIN (TREE needituje):** reading prompty (character.js reading buildery), pricing, translations UI, reader UI/CSS, auth. Life-rune logika (runar-tree.js generateLifeRuneReading, buildLifeRunePrompt) = MAIN.
- `§1` (JS přes Python skript, NE Edit — kazí apostrofy) + `§13` (full-path) platí i pro TREE, když sahá do sdíleného JS.
- CLAUDE.md: každá session edituje JEN svou sekci. Tree sekce = krátký ukazatel (detail v RUNAR_TREE.md). MAIN ho nepřepisuje.

**Komunikace (session spolu nemluví → přes git + soubory):**
- `git pull` PŘED prací · `git push` IHNED po commitu · malé commity.
- Commit prefix = LANE (`[tune]` · `[tree]` · `[cowork]`, volitelně + téma) → čitelná historie + jasné vlastnictví. Git podpis je u všech stejný, prefix je jediný rozlišovač.
- Musíš sáhnout do cizí domény? Drž změnu minimální + zapiš „co a proč" do svého doc (RUNAR_TREE.md / snapshot) + push hned.
- sw.js: git hook auto-bumpuje; když oba commitnou JS, vyšší číslo vyhrává (jen cache-buster, ne konflikt obsahu).
- Git konflikt? Neforcuj — pull, vyřeš ručně JEN svou doménu.
- Poslední stav každé session → MEMORY.md (SW + commit) + vlastní doc/snapshot. Před prací přečti druhý doc.

<!-- „Cowork sync" (zrcadlo do AppData/Cowork složky) ZRUŠENO — nahrazeno §17 (jediný zdroj = git repo). -->
<!-- 2026-07-04 [docsync] -->


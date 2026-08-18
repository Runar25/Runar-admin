# CLAUDE.md — Rúnar Project
# Přečíst na začátku KAŽDÉ session. Zdrojová pravda pro kód.
# Spolu s: RUNAR_DESIGN.md (design, mytologie, spready) · RUNAR_PRICING.md (business)

---

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Produkce: runar25.github.io/Runar-admin/v2/
Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\
Stack: HTML + CSS + vanilla JS · Supabase (projekt v `runar-config.js` SB_URL) · Claude API + ElevenLabs · IS primární + EN

---

## Soubory a jejich zodpovědnost

```
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, SPREAD_CONFIG, VOCAB,
                        VOICE_PROFILES + ACTIVE_VOICE_PROFILE (hlas), ADMIN_EMAILS, HEAVY_RUNES
                        (úplný výčet má soubor sám — 27 konstant; doc ho neopisuje, §20)
runar-runes.js        — 25 Elder Futhark + calcLifeRune()
runar-translations.js — UI_TEXT {en, is} + t()  ← Edit tool OK
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), RP_* packs + buildReadingPrompt()
                         + spread dispatchers, buildLifeRunePrompt(), getCorrPrompt()
runar-utils.js        — t(), tp(), vn(), vl(), setText/setSt/showToast, stream, isAdmin() (seznam ADMIN_EMAILS v runar-config.js)
runar-journal.js      — loadJournal(), renderJournal(), filterJournal()
runar-tree.js         — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB()
runar-gathering.js    — The Gathering (NAHRADIT — stará logika, čeká na tree_state DB)
runar-auth.js         — updateAuthUI(), PWA, sign-in, redeem
runar-reading.js      — startReading(), _generateReading(), generateVoice()
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab()
runar-reporter.js     — in-app hlášení od testerů (bug_reports) · jen reader
runar-rune-popup.js   — ťuknutí na glyf runy ve čtení → popup se jménem a významem · jen reader
runar-readings-admin.js — shrine: prohlížeč čtení (edge fn list-readings)
runar-reports-admin.js  — shrine: prohlížeč hlášení (edge fn list-reports)
runar-reader.html     — produkční app  ← Edit tool OK
runar-reader.css      — styly          ← Edit tool OK
runar-shrine.html     — admin app      ← Edit tool OK pro HTML
sw.js                 — Service Worker (auto-bump via git hook · hooks/pre-commit.py)
```

**Kam ukládat nové soubory:** SQL migrace → `sql/` jako `YYYY-MM-DD_popis.sql` · archivní nebo
dočasné dokumenty a POC/experiment HTML → `docs/archive/` · patch skript → **viz §1** (vlastní gitignored slot session).

### Load order
```
runar-config.js → runar-runes.js → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js
→ [reader]: runar-journal.js
            → tree-lab-trunk-composer/runar-trunk.js → tree-lab-branch-composer/runar-branch.js
            → runar-tree-prod.js → runar-tree.js → runar-gathering.js
            → runar-auth.js → runar-reading.js → runar-app.js
            → runar-reporter.js → runar-rune-popup.js
```

---

## ABSOLUTNÍ PRAVIDLA

### §1 — JS změny = Python skripty
Edit tool kazí apostrofy `'` → curly quotes → SyntaxError.
JS soubory: VŽDY přes Python patch skript. CSS + HTML (bez inline JS) + translations.js: Edit tool OK.

**Patch skript = VLASTNÍ gitignored slot session, NIKDY sdílený** (2026-07-21, po přechodu na 3 session,
dvě v `[tune]`): `scripts/_patch.py` = CODE-tree · `scripts/_patch_tune.py` = CODE-tune ·
`_patch_<session>.py` = další. Sdílený slot si session přepisovaly scratch pod rukama. Gitignored →
`git add -A` ho nesebere; každý slot = jeden stabilní allowlist řádek (žádný permission-prompt treadmill).
Kolize a předávání mezi session → sekce „N paralelních session" + memory `parallel-code-sessions-collision`.

### §2 — IS je primární jazyk
IS musí být vždy perfektní. EN je vedlejší. NIKDY IS jako "překlad" EN.
**Mysli islandsky od začátku** (Code i Cowork) — začni islandským obrazem, ne anglickou frází
k přeložení; kalk z EN (vazba, slovosled, obraz) je vada, ne východisko. IS se **VYMÝŠLÍ**, ne
překládá. „Líp to neumím" NENÍ přípustná odpověď: styl a hlas je řemeslo — udělá se a ověří (níže).
Flaguje se **jen chybějící 🔒 fakt / 📜 lore** (§23), NIKDY vlastní formulace; Sigrún není fronta
na nedodělky (§19.2).
**Platí pro Code i Cowork:** IS se dělá **hotová a ověřená** (`check-is` / yfirlestur / is-grammar-qa), nikdy odhadem ani odkladem na rodilého mluvčího (§19.2). → [[is-done-together-not-for-sigrun]]
**Vazba ≠ tvar — rekci/pád/kolokaci/idiom NEHÁDEJ (vrstva NAD BÍN).** BÍN dá jen tvary; vazbu ověř nástrojem `python -X utf8 is-vazba.py <slovo>` (Íslensk nútímamálsorðabók JSON API + Risamálheild korpus), nikdy odhadem, z Wiktionary ani „pohledem". Recept + limity + zdroje → [[is-vazba-check]].
Každé Claude generování v IS má **3 vrstvy** (všechny v promptu — korekce se řeší v kontextu):
```js
var sys    = buildSysPrompt(activeChar, lang);        // 1. IS system prompt
var prompt = buildReadingPrompt(u, drawn, lang, ...); // 2. prompt přímo v IS (RP_* pack)
if (getCorrPrompt(lang, corrections)) prompt += ...;  // 3. corrections blok DO promptu
```
⚠️ **Žádná 4. vrstva — a tohle je její JEDINÝ domov.** Slepý substring post-processor
(`applyISCorrections` + flag `CORRECTIONS_POSTPROCESS`) byl vypnutý od 2026-07-10 a **odstraněn
2026-08-09**: neuměl pád ani rod, takže „opravil" i tvar, který byl správně. Vypnutá funkce se
ale pořád volala na 5 místech — kód četl, jako by se korekce aplikovaly (`text = applyIS…(text)`),
a přitom neaplikovaly. **Post-processor na IS text už nikdy nezaváděj**; korekce patří do promptu
(vrstva 3), kde je model ohne podle kontextu.

### §3 — Sdílené moduly = automatický sync
runar-character.js a runar-utils.js načítají reader i shrine. NIKDY neduplikovat do shrine.

### §4 — SW verze
Auto-bump: git pre-commit hook (hooks/pre-commit.py). Po fresh clone: `python -X utf8 hooks/install-hooks.py`
Ruční bump pokud je sw.js already staged před commitem.

### §5 — UI invarianty
`--dim` NIKDY pro text · reader-content se NIKDY neskrývá
(hodnoty tokenů bydlí v `runar-reader.css`, doc je neopisuje — §20)
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
1. **Seed-and-assert na hranici.** Kde data přechází hranici (DB→kód, zdroj→prompt, stav→reset), měj JEDEN drobný fixture co protlačí známý vstup skrz produkční funkce a ověří výsledek (očekávané JE přítomno / špatné NENÍ). Vzor = `golden_contracts.js` (smoke.py kontrola ⑥): seed raw DB řádku → `normalizeCorrections`→`getCorrPrompt` → replacement přežil až do promptu, žádné „undefined". Fixture musí sám cvičit pravou hranici (ne test-double se špatnými klíči).  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
2. **Žádné tiché zelené.** Co nástroj **prokazatelně neposoudí** (subtilní IS gramatika — kauzativa, vazby) NESMÍ projít zeleně. Filtrovaný signál = **viditelný žlutý, ne zahozený** (is-grammar-qa: `E001` = „nerozparsováno" ≠ „v pořádku"). ⚠️ **Fronta „NATIVE EYE / Sigrún" ZRUŠENA (KUKY 2026-07-18).** Nesrozumitelný výstup se **přepíše, dokud mu nástroj nerozumí** (přesně tak byl vyřešen E001 2026-07-17 — přepsáním na plné věty), ne odloží na někoho jiného. IS děláme rovnou hotovou a ověřenou → [[is-done-together-not-for-sigrun]]. ⚠️ Ruší **odkládání nedodělané IS** na Sigrún — NE **sbírání native oprav z živého testování do pravidel** (opačný směr, viz `IS_NATIVE_CHECKLIST.md`).
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

### §21 — Ownerův nápad = směr k dopracování, ne hotové zadání (platí pro VŠECHNY session)
KUKY 2026-08-02: *„mám myšlenku, ale ta potřebuje korekci."* Když owner přinese nápad nebo rozhodnutí,
**NEjen souhlasit a stavět.** Nejdřív dát **kritický pohled + proveditelnost**: kde to drhne, co je slabé,
co je tautologie / riziko / „střecha před základy". Navrhnout **korekci nebo zúžení**, teprve pak konat.
Souhlas bez kritiky ownerovi nepomáhá — výslovně ji chce slyšet. **Rozhodnutí = směr, ne zámek navždy**:
mění se novým datovaným záznamem v `RUNAR_DECISIONS.md`; při rozporu dej **VAROVÁNÍ**, ne tichý drift.
Detail → [[decisions-are-directions-not-locks]].

### §22 — Duplikát / chyba → hned oprav, nebo zapiš (nikdy tiše přejít) (platí pro VŠECHNY session)
KUKY 2026-08-02: *„pokud narazíš na duplikát, chybu, tak budeme opravovat nebo zapsat, ať se nezapomene."*
Narazíš při práci na **duplikát** (§20) nebo **chybu/bug** — i mimo zadání: buď to **hned oprav** (malé
+ v rozsahu úkolu), nebo **zapiš do `RUNAR_BACKLOG.md`** (příp. spawn_task chip) s dost kontextem, aby
to šlo vyřešit bez téhle konverzace. Nikdy jen zmínit a nechat být. Detail → [[fix-or-log-duplicates-and-errors]].

### §23 — Nevymýšlej fakta ani lore → zastav a flagni (platí pro VŠECHNY session, Code i Cowork)
Chybí-li v kánonu 🔒 **fakt** (etymologie, IS gramatika, čísla, DB) nebo 📜 **lore** (Rúnar, mytologie,
hlas), **zastav a řekni „nevím / chybí"** — nikdy nedomýšlej a nevydávej domněnku za pravdu. ⚠️ **Riziko
roste s chytrostí modelu:** čím lepší model, tím sebejistěji zní i výmysl. Detail → [[dont-invent-fact-critical]].

### §24 — Ověř, než tvrdíš (měř, nehádej) (platí pro VŠECHNY session, Code i Cowork)
Než něco prohlásíš za nález/pravdu, **změř / protlač produkční cestou / porovnej** — dojem z obrázku
ani „vypadá to" se nepočítá. Kód: seed-and-assert na výsledek (§19). Obsah/data (Cowork): claim o
datech/screenshotu opři o měření, ne o dojem; nejde-li změřit, řekni „nevím". Detail → [[measure-dont-eyeball]].

### §25 — Vlastní domněnku zabij obrácenou pákou (platí pro VŠECHNY session, Code i Cowork)
Než začneš **přidávat** obsah, aby se hypotéza potvrdila, **hni pákou na opačnou stranu** a zkontroluj,
jestli platí obrácená předpověď. Je to o řád levnější a zabíjí to i domněnky, které znějí rozumně.

- Hypotéza „X je málo, přidej X" → **uber X ještě víc**. Musí to zhoršit. Když se nic nestane, hypotéza padla.
- Nevyšla-li predikce ani obráceně, **nález je „není to X"** — a ten se zapisuje stejně pečlivě jako potvrzení
  (§16), jinak ho příští session zkusí podruhé.
- Vždy uveď **hranici nálezu**: co přesně bylo vyloučeno (velikost řezu, `n`), a co se netvrdí.

**Doloženo 2026-08-14:** hypotéza „IS prompt opisuje, protože zhubl". Přisypat islandský obsah = hodiny psaní
a ověřování. Místo toho zkrácení o dalších 509 znaků: 32 % → 24 %, **p = 0,75**, navíc opačným směrem.
Hypotéza padla za tři minuty a jednu dávku. Detail → `RUNAR_DECISIONS.md` 2026-08-14, [[falsify-by-reversing-the-lever]].

---

### §26 — Opustit něco ≠ zavřít to navždy; návrat je povolený, ale JEN očištěný (platí pro VŠECHNY session)
Když se od něčeho odejde, má to v tu chvíli **důvod**. Ten důvod nezaniká — ale ani nezakazuje návrat.
KUKY 2026-08-14: *„pokud od něčeho odejdeme má to v tu chvíli důvod, ale neznamená to že se k tomu
nemůže v obměněné formě vrátit."*

Vracíš-li opuštěnou věc, **napřed dohledej, proč odešla**, a vrať ji tak, aby ta příčina byla odstraněná:
1. Najdi datovaný záznam odchodu (`RUNAR_DECISIONS.md`, komentář u mrtvého kódu).
2. Pojmenuj **konkrétní vadu**, kvůli které odešla.
3. Vrať **očištěnou** verzi, kde ta vada prokazatelně není — ne kopii původního stavu.
4. Zapiš nové datované rozhodnutí, které se na to staré odvolává.

Návrat bez kroků 1–3 je recidiva, ne rozhodnutí. Mrtvý kód nechávaný „pro historii" je právě proto
komentovaný důvodem odchodu — čti ten komentář dřív, než ho oživíš. Souvisí: [[decisions-are-directions-not-locks]].

### §27 — Nástroj se obhájí dřív než výsledek (platí pro VŠECHNY session, Code i Cowork)
Než uvěříš číslu, **zaútoč na to, čím jsi ho naměřil**. Metrika, která prošla jen tím testem,
kvůli kterému vznikla, není ověřená — je vybraná. Tři útoky, v tomhle pořadí:

1. **Půlka proti půlce** — rozděl JEDNU dávku na dvě a spočítej metriku zvlášť. Liší-li se
   půlky víc než dávky, které srovnáváš, je rozdíl šum.
2. **Co JEŠTĚ odlišuje referenční dvojici** — zlatý standard může ukazovat obráceně, když se
   ty dvě strany liší ještě něčím jiným než tím, co měříš.
3. **Nulová transformace** — pusť změnu, která hýbe jen jednou dimenzí. Nepohne-li se číslo,
   je slepota **dokázaná** a patří do dokumentace jako fakt, ne jako tušení.

**Doloženo 2026-08-14** (metrika „stejnosti" čtení): útok 1 zabil **2 ze 3** metrik · útok 2
odhalil, že **6 ze 7** samozřejmých signálů ukazovalo obráceně (měřily papouškování, ne
stejnost) · útok 3 dokázal, že přeživší metrika nevidí rytmus (zamíchání slov uvnitř čtení
změní číslo o **0,0000**). Detail → [[attack-the-metric-not-just-the-result]].
**Párové metriky:** nikdy bootstrap s opakováním (duplikát = shoda 1,0), jen jackknife.

### §28 — Každá změna nese svůj DŮVOD tam, kde bydlí (platí pro VŠECHNY session)
KUKY 2026-08-16: *„každá změna musí být označena proč se to dělo."* **Diff ukazuje CO se změnilo;
proč se to stalo, nezachytí nic než ten, kdo to psal** — a ten za týden nebude k dispozici.

Důvod se píše **k té změně**, ne do zvláštního seznamu (§20 — seznam by se rozešel):
- **kód** → komentář na místě zásahu; u obrany navíc **doklad**, čím se to projevilo
- **doc / mapa promptu** → řádka v changelogu daného docu, ne jen nový text
- **rozhodnutí o chování** → datovaný záznam (§16); commit message nese totéž jednou větou
- **výjimka z kontroly** → důvod + datum přímo ve značce

⚠️ **Důvod NENÍ převyprávěný diff.** „Přepsán úhel [5]" není důvod; „úhel se ptal na RUNU, ne
na obraz — táž vada už odstraněná z [0] a [1]" je. Nezní-li to jako věta, kterou by někdo řekl
při obhajobě zásahu, není to důvod.

**Není to nový nápad, jen zobecnění.** `verify_escape_marks.js` tohle vynucuje od 2026-07-19
pro escape značky: *„Holá značka musí nést DŮVOD a DATUM."* Tam se to zavedlo proto, že 35 holých
značek umlčelo červenou a nikdo nepoznal, která je legitimní. Beze změny principu, jen širší plocha.

---

## Tier systém
**Zdroj pravdy = `v2/runar-config.js`** (`TIERS` = jména EN/IS + flagy · `TIER_LIMITS` = pravidla
· `TIERS.*.monthly_readings` = kapacity). **Tady se to NEOPISUJE** — §20. Jména se od 2026-07-05
měnila dvakrát a každá opsaná tabulka to přežila jako zastaralá.

DB hodnoty (neměnné): `free_trial` · `rune_seeker` · `standard` · `premium`.
Identita: **všichni registrovaní jsou Rune Seeker**; standard/premium nejsou hodnosti, jen víc čtení.
ADMIN → `isAdmin()` v `runar-utils.js`, seznam `ADMIN_EMAILS` v `runar-config.js`. **VŽDY testovat i jako visitor/rune_seeker.**

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
`u.area/seeking/intention/question` → `parts[]` → Claude. Norns axis: `_intentionContext(intention,lang)` v runar-character.js.

**Délky čtení**: zdroj pravdy = buildery v `runar-character.js` (RP_* packy + `closing()` věty). Docs čísla NEopakují — když měníš délku, uprav builder + přepočítej pricing (RUNAR_PRICING.md). Délka = znaky = EL náklad. Jméno ne vždy na začátek; životní runa jen kontext.

**Obraznost**: `_seasonalImagery(lang, drawn)` vloží do čtení JEDEN obraz. Primární zdroj je
`RUNE_IMAGES` — obrazy **klíčované runou**, obojí jazyk na témž řádku (od 2026-08-10 i pro EN).
`SEASON_POOLS` dělá dvojí: dodává sezónní bucket a je fallback pro runu bez kandidáta.
⚠️ **Není to jen záloha — stojí na něm celá funkce**: `if (!pool) return ''`, takže v sezóně
bez poolu nedostane čtení obraz ANI když runa svého kandidáta má. Sáček proti opakování má klíč
per SADA run; u spreadu se losuje ze všech tažených, ne z první pozice.
KLÍČ: per-čtení user-prompt injekce model POSLECHNE, system prompt IGNORUJE → `buildSysPromptV2` REDUNDANTNÍ (jen lab). Reader = `buildSysPrompt`.

### Spread systém
Kredity = **per typ čtení**, NE počet run. Počty run i ceny = `SPREAD_COSTS` / `SPREAD_CONFIG`
(config = zdroj pravdy, **tady se neopisují**). Předplatné počítá tytéž jednotky. Founding = Norns.

Které spready existují, vlastní `SPREAD_COSTS` / `SPREAD_CONFIG` — **tady se to neopisuje**.
Jediná výjimka je The Gathering: v configu není a nahrazuje se (proč → výpis souborů výš
u `runar-gathering.js`, blocker → `RUNAR_BACKLOG.md`).
<!-- 2026-08-18: tady stál výčet pěti spreadů + „= ✅ produkce", tedy STAV, který §20.4 zakazuje
     a který navíc říkal totéž co řádka o `runar-gathering.js` o 326 řádek výš. Duplikát uvnitř
     jednoho souboru; pět spreadů je v configu, takže se dá odkázat místo opisovat. -->

**Gating:** blokuje se jen **Visitor** (nepřihlášený) — ten má Single 1×. Každý přihlášený dosáhne
na všechno; Rune Seeker platí kredity, předplatitelé to berou z měsíčních jednotek.
⭐ **Yggdrasil = KDYKOLIV, KDOKOLIV přihlášený. Žádná brána na datum.** Zimní slunovrat = větší
**síla ve stromě**, ne podmínka přístupu (rituální čtení; bude jich víc). KUKY 2026-07-18, po páté
opravě téhož — detail `RUNAR_DECISIONS.md`. Kdo sem napíše „Dec 14–28" jako podmínku, dělá to znovu.  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

---

## Tree of Life — stav
Stav vlastní `RUNAR_TREE.md` (duše · zóny · stavba · co je a co není postavené) a `git log`.
**Tady se neopisuje** — §20.4. Do 2026-08-18 tu stály čtyři řádky stavu, které týž fakt držely
potřetí (vedle `RUNAR_TREE.md:222` a `RUNAR_BACKLOG.md`) a mezitím zastaraly: psalo se
„admin-only beta / gating na `isAdmin()`", zatímco `renderLivingTree()` pouští i testery
(`isAdmin(...) || isTester`). Nalezl CODE-tune; opravila si to CODE-tree ve své sekci.

⚠️ **Past pro lane `[tune]`:** strom se krmí regexem přes text čtení (glyfy 0x16A0–0x16FF
z `rune_glyph + short_text`). Změníš formát skládaného textu → CODE-tree tiše přijde o větve.
Hlídá smoke ⑬ (`verify_tree_signals.js`), ale tahle věta je důvod, proč o tom vůbec víš.

Kanonický vstupní bod = `RUNAR_TREE.md`. `RUNAR_TREE_LAB.md` = historie (docs/archive/tree/).

## Word Corrections
Živá data: `python show_corrections.py`
Nová korekce → přidat do BAD_PATTERNS v check-is.py + do DB přes shrine.

---

## Kde hledat co
**Vlastník = `memory/MEMORY.md`, sekce „Rozcestník".** Sem se nekopíruje.
Do 2026-08-17 tu stál druhý rozcestník — a rozešel se: MEMORY.md mezitím dostal sloupec
„druh pravdy" (🔒 externě ukotveno · 📜 kánon · 🔄 rozhodnuto · 🏛 architektonické), který tady
nikdy nebyl. Dvě mapy téhož = přesně to, co §20 zakazuje.

**Doc-owner pravidla (2026-07-05):**
- **Čísla = jen v configu / builderech** (SPREAD_COSTS, TIERS, character.js). Docs je NEopakují — odkazují na zdroj (délky→character.js, ceny/kredity→config).
- **1 téma = 1 vlastník doc.** Žádné nové samostatné docs — když téma patří jinam, jinde jen odkaz.
- **Délka doku ~200 řádků** (250 OK, když to fakt pomáhá). Nad = rozdělit nebo přesunout detail.
  ⚠️ **`CLAUDE.md` je z toho limitu VYŇATÝ** (KUKY 2026-08-17, po měření): samotná pravidla
  §1–§28 **přesahují 200 řádků** a jsou důvod, proč ten soubor existuje — pod 200 se nedostane, aniž
  by přišel o to, co vlastní. Platí pro něj jen ten přísnější test o řádek výš: *způsobí jeho
  chybění chybu?* Pokud ne → smazat.
  ⚠️ **Přesný počet řádků tu schválně NESTOJÍ.** Do 2026-08-18 tu bylo „248 řádků" a za jediný
  den to ujelo na 245 — číslo, které se mění s každou úpravou pravidel, je záruka dalšího driftu.
  Ověřeno v oficiálních docs: „target under 200 lines per CLAUDE.md file" je **cíl**, ne strop,
  a CLAUDE.md se načítá **celý bez ohledu na délku** (tvrdý limit 200 ř./25 KB má jen `MEMORY.md`). Vlastníkem tohohle pravidla je tenhle doc; `working-style.md`
  na něj odkazuje a neopisuje ho.

---

## N paralelních session — kdo o čem mluví
Repo zpracovává VÍC session naráz: **3× CODE** (tune · read · tree), a ke každé **Cowork symbiont**,
se kterým se radí (Cowork-tune · Cowork-read · Cowork-tree). Cowork je **read-only**, proto volnější —
do repa píše výhradně přes svého CODE.

⭐ **KAŽDÁ SESSION COMMITUJE POD SVÝM JMÉNEM** (KUKY 2026-08-18: *„jak tohle hlídat?"*):
```
git -c user.name='CODE-tune' commit -F <msg> -- <cesty>
```
Per-commit, **ne `git config`** — strom je sdílený a session by si config přepisovaly.
E-mail zůstává, takže atribuce na GitHubu se nemění. Hlídá to **smoke ㉛**.
⚠️ **Do 2026-08-18 tu stálo, že autora rozliší prefix.** Přestalo to platit ve chvíli, kdy
přibyla třetí CODE session a začala commitovat pod `[tune]` — a nevšiml si toho nikdo,
protože to nic nehlídalo. Prefix zůstává jako čitelnost, ale **není to už jediná pojistka**.

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
- **CODE-tune** → prefix `[tune]` (+ `[fix]`/`[pricing]` jako téma; `[reading]` se jako téma
  UŽ NEPOUŽÍVÁ — plete se s lane `[read]` níž, viz důvod tam): reading systém, prompty (buildery v runar-character.js), config (TIERS/SPREAD_COSTS/SPREAD_CONFIG/VOCAB), pricing, translations, reader UI/CSS, reporter, auth, app, journal, eval-IMPLEMENTACE, copy. = vše KROMĚ tree vizuálu.
- **CODE-reader** → prefix `[read]`: **čte, testuje, mapuje — produkční kód NESAHÁ**
  (KUKY 2026-08-17: *„codování dělá CODE-tune, ty jsi code-reader"*). Jak má Rúnar znít,
  hlas × model, pestrost čtení; nálezy píše do `RUNAR_EVAL_LOG.md` a `RUNAR_DESIGN.md`,
  změny v kódu **předává CODE-tune**, nedělá je.
  ⚠️ **`[read]`, ne `[reader]`** — `[reading]` je v historii 46× jako téma a `[reader]`
  by se od něj v `git log` nedalo odlišit pohledem (změřeno 2026-08-18).
- **CODE-tree** → prefix `[tree]`: vizuální engine — runar-tree-prod.js (generovaný `build_tree_production.py`), tree-lab composery (runar-branch.js, runar-trunk.js), build_*composer.py, tree-lab-*/, tree-snapshots/, `RUNAR_TREE_*` docs, `tree_state` DB. Doménový doc = RUNAR_TREE.md.
- **Cowork-tune · Cowork-read · Cowork-tree** → prefix `[cowork]`: design, docs, eval-OBSAH,
  copy audit, handoffy. Každý je **symbiont své CODE session** — ta se s ním radí o obsahu. Repo **READ-ONLY přes `git show HEAD:`** (ne `git status`, ten zapisuje do indexu); do repa píše VÝHRADNĚ přes CODE. Další Cowork session = táž lane, táž pravidla.

**Mechanika (co ZBYLO — zbytek obstará git):**
- **Commit prefix = LANE. `git log` s prefixy JE akční log.** Samostatnou řádku do `RUNAR_DECISIONS.md` piš
  jen pro to, co git NEVIDÍ: deploy, SQL puštěné ownerem, rozhodnutí. (Logovat každý commit dvakrát = práce navíc.)
- Nejde commitnout (lock/přístup) → NESAHAT, jen ohlásit. Neviditelná změna je horší než žádná.
- Handoff má sekci `ZMĚNĚNO:` (co jsem změnil), i prázdnou.
- ⭐ **Pravidlo, které musí hlídat člověk, dřív nebo později spadne na ownera → kde to jde, udělej
  z pravidla KONTROLU ve smoke.** Vzory: ⑩ zapisovatelná plocha (klient vs granty), ⑪ memory index
  (odkazy + neverzované soubory). Obojí vzniklo z chyby, kterou žádné pravidlo nechytilo.

**Hranice:**
- **Sdílená sémantická vrstva (runa → růst).** Kanonická data run (`runar-runes.js`: aett/world/element/keywords) + config (AETTY, SPREAD_CONFIG.norns_axis, INTENTIONS) čtou OBĚ session. TREE růstové/tvarové mapování drž ve VLASTNÍM souboru (`runar-branch.js`). Když MUSÍŠ sáhnout do runar-runes.js/config kvůli růstu: **jen ADITIVNĚ** (přidej pole, neměň existující reading-pole), `[tree]` malý commit, push HNED + řádek do MEMORY.md (MAIN to musí vidět — sdílená data mění i výklad). Změna existujícího aett/element/world runy ovlivní i čtení → napřed flagni.
- **Čistě MAIN (TREE needituje):** reading prompty (character.js reading buildery), pricing, translations UI, reader UI/CSS, auth. Life-rune logika (runar-tree.js generateLifeRuneReading, buildLifeRunePrompt) = MAIN.
- `§1` (JS přes Python skript, NE Edit — kazí apostrofy) + `§13` (full-path) platí i pro TREE, když sahá do sdíleného JS.
- CLAUDE.md: každá session edituje JEN svou sekci. Tree sekce = krátký ukazatel (detail v RUNAR_TREE.md). MAIN ho nepřepisuje.

**Komunikace (session spolu nemluví → přes git + soubory):**
- `git pull` PŘED prací · `git push` IHNED po commitu · malé commity.
- **Commit ÚZCE: `git commit -F <msg> -- <cesty>`** (pathspec NA COMMITU, ne jen na `git add`). Holý `git commit` / `git add -A` bere CELÝ index — vč. cizí STALE staged změny jiné session. **2026-08-02: holý commit sebral cizí staged `sw.js` → downgrade v249→v248** (klienti by servírovali staré čtení). Pre-commit má teď guard proti sw.js downgrade, ale disciplína je levnější. Detail → memory `parallel-code-sessions-collision`.
- Commit prefix = LANE (`[tune]` · `[read]` · `[tree]` · `[cowork]`, volitelně + téma) → čitelná
  historie. Autora ale nese **jméno v podpisu**, ne prefix — viz úvod sekce.
- Musíš sáhnout do cizí domény? Drž změnu minimální + zapiš „co a proč" do svého doc (RUNAR_TREE.md / snapshot) + push hned.
- sw.js: git hook auto-bumpuje; když oba commitnou JS, vyšší číslo vyhrává (jen cache-buster, ne konflikt obsahu).
- Git konflikt? Neforcuj — pull, vyřeš ručně JEN svou doménu.
- Stav session **nepiš do docu** (§20.4 — SW verze i hash zastarají do druhého dne). Stav vlastní
  `git log` (prefix = lane) a `v2/sw.js`. Signál hotovo pro druhou session = **push**, nic víc.
  Před prací si přečti `git log` druhé lane, ne cizí doc.

<!-- „Cowork sync" (zrcadlo do AppData/Cowork složky) ZRUŠENO — nahrazeno §17 (jediný zdroj = git repo). -->
<!-- 2026-07-04 [docsync] -->


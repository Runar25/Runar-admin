# CLAUDE.md — Rúnar Project
# Přečíst na začátku KAŽDÉ session. Zdrojová pravda pro kód. Spolu s: RUNAR_DESIGN.md (hlas, stavba čtení) · RUNAR_SPREADY.md · RUNAR_MYTOLOGIE.md · RUNAR_PRICING.md (business)
# Důvody, doklady a historie pravidel → `docs/pravidla-duvody.md` (čti, když pravidlo nedává smysl nebo ho chceš měnit). Stav systémů → `docs/projekt-mapa.md`.
# Sem patří jen příkazné pravidlo a past, kterou z kódu nepoznáš. Důvod nové věci → DECISIONS, ne sem (§28).

---

## Co je Rúnar
AI průvodce runami pro Agndofa (Island). Produkce: runar25.github.io/Runar-admin/v2/ · lokálně `C:\Users\zkuku\Downloads\Runar-admin\v2\`.
Stack: HTML + CSS + vanilla JS · Supabase (`runar-config.js` SB_URL) · čtení přes edge funkci `claude-proxy` (model = `SOL_MODEL`, záloha `MODELS` tam) · ElevenLabs · IS primární + EN.

---

## Soubory a jejich zodpovědnost

```
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, SPREAD_CONFIG, VOCAB,
                        VOICE_PROFILES + ACTIVE_VOICE_PROFILE (hlas), ADMIN_EMAILS, HEAVY_RUNES (úplný výčet má soubor)
runar-runes.js        — 25 Elder Futhark + calcLifeRune()
runar-names.js        — severská jména: seznam, který rozhoduje o rozboru jména (ne model) · jen reader
runar-names-registry.js — Mannanafnaskrá (GENEROVANÉ scripts/import_mannanafnaskra.js, needitovat) · jen reader
runar-translations.js — UI_TEXT {en, is} + t()  ← sdílený: cv.zapis / commit_vlastni.py uprav (§1)
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), RP_* packs + buildReadingPrompt()
                         + spread dispatchers, buildLifeRunePrompt(), getCorrPrompt()
runar-utils.js        — t(), tp(), vn(), vl(), setText/setSt/showToast, stream, isAdmin() (seznam ADMIN_EMAILS v runar-config.js)
runar-journal.js      — loadJournal(), renderJournal(), filterJournal()
runar-tree.js         — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB()
runar-auth.js         — updateAuthUI(), PWA, sign-in, redeem
runar-reading.js      — startReading(), _generateReading(), generateVoice()
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab()
runar-reporter.js     — in-app hlášení od testerů (bug_reports) · jen reader
runar-client-errors.js — chyby JS u uživatelů → edge fn client-error (ops_events client_error) · jen reader, hned po configu
runar-verze.js        — verze běžícího kódu pro hlášení (GENEROVANÉ hooks/pre-commit.py při bumpu sw.js, needitovat) · jen reader
runar-rune-popup.js   — ťuknutí na glyf runy ve čtení → popup se jménem a významem · jen reader
runar-helper.js       — nápověda „?" (bublina: glyf-tap, Ask) + hesla zrcadla v UI_TEXT · jen reader
runar-runakort.js · runar-runakort.css — kresba karty Rúnakort (okno cesty); web ji čte odsud · třídy rk-* · jen reader
runar-readings-admin.js — shrine: prohlížeč čtení (edge fn list-readings)
runar-reports-admin.js  — shrine: prohlížeč hlášení (edge fn list-reports)
runar-voice-admin.js    — shrine: záložka VOICE, stav ElevenLabs (edge fn voice-usage)
runar-testers-admin.js  — shrine: záložka TESTERS, účty testerů a týmu — čtení, Asky, hlasy, cena (edge fn voice-usage {accounts})
runar-payback-admin.js  — shrine: záložka PAYBACK, kalkulačka návratnosti (čte tabulky RUNAR_PRICING.md)
runar-help.html · runar-privacy.html — statické stránky (návod, zásady soukromí)
runar-reader.html     — produkční app  ← sdílený: commit_vlastni.py uprav (§1)
runar-reader.css      — styly          ← sdílený: commit_vlastni.py uprav (§1)
runar-shrine.html     — admin app      ← Edit tool OK pro HTML
sw.js                 — Service Worker (auto-bump via git hook · hooks/pre-commit.py)
```

**Kam ukládat nové soubory** → `working-style.md`, „Kde ukládat soubory“ (patch skript → §1).

### Load order
```
runar-config.js → [reader: runar-client-errors.js] → runar-runes.js → [reader: runar-names.js → runar-names-registry.js] → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js → [reader: runar-runakort.js]
→ [reader]: runar-journal.js → runar-tree.js
            → runar-auth.js → runar-reading.js → runar-app.js
            → runar-verze.js → runar-reporter.js → runar-rune-popup.js → runar-helper.js
[jen kdo strom vidí, dynamicky z runar-tree.js]: tree-lab-trunk-composer/runar-trunk.js → tree-lab-branch-composer/runar-branch.js
            → runar-tree-prod.js
```

---

## ABSOLUTNÍ PRAVIDLA

**Podle témat** (čísla se nemění kvůli odkazům; sloučené číslo nese jen odkaz): kód §1 §4 §7 §11 §12 §13 §14 · texty a hodnoty
z configu §10 · UI §5 §32 · islandština §2 §6 · jeden zdroj a dokumenty §16 §17 §18 §20 §28 · ověřování §19 §24 §25 · rozhodování
§21 §23 · provoz §29 §30 §31. Sloučené: §3→§18 · §8, §15→§10 · §9→§2 · §22→§20 · §26→§21 · §27→§25.

### §1 — JS změny = Python skripty
Edit tool kazí apostrofy `'` → curly quotes → SyntaxError. JS soubory: VŽDY přes Python patch skript. CSS + HTML (bez inline JS) +
translations.js: Edit tool OK — u translations.js ne na řádku s `\uXXXX` ([[edit-tool-escapes-new-text]]).
**Sdílené soubory** (`_SDILENE` v `hooks/pre-commit.py`): patch skript zapisuje přes `cv.zapis`, CSS/HTML/překlady přes `commit_vlastni.py uprav`,
commit `commit_vlastni.py commit` — Edit a pathspec commit zastaví hooky.
**Patch skript = VLASTNÍ gitignored slot session, NIKDY sdílený:** `scripts/_patch.py` = CODE-tree · `scripts/_patch_tune.py` = CODE-tune ·
`_patch_<session>.py` = další.

### §2 — IS je primární jazyk
IS musí být vždy perfektní; EN je vedlejší; NIKDY IS jako „překlad“ EN. **Mysli islandsky od začátku** — kalk z EN (vazba, slovosled, obraz)
je vada. IS se **vymýšlí, dělá hotová a ověřená** (Code i Cowork), nikdy odhadem ani odkladem na rodilého mluvčího; nesrozumitelný výstup
se přepíše, dokud mu nástroj nerozumí (§19.2). Flaguje se **jen chybějící 🔒 fakt / 📜 lore** (§23). → [[is-done-together-not-for-sigrun]]
**Kontrola IS — nástroje a pořadí (JEDINÉ místo, kde to stojí; paměť a docs sem odkazují, §20):**
1. `python -X utf8 check-is.py` — ZDROJ (kód): známé chyby z `BAD_PATTERNS`, běží i v pre-commitu. Výstup modelu nevidí. Nová známá chyba → do `BAD_PATTERNS`.
2. `python -X utf8 is-greynir.py --text "…"` (nebo soubor, text na řádek) — GreynirCorrect lokálně, zdarma, text neodchází ven. Překlepy a neznámá
   slova přesně; `E001` = věta nerozebraná → přepsat, ať jí nástroj rozumí. Falešné poplachy u vzácných slov (seznam v hlavičce nástroje).
3. `is-gpt-check.py` — GPT korektor: shoda, pád, rod, kalky. Volá API → hlídač chce `RUNAR_API_ANO` + `RUNAR_API_ZAMER` (§30); náklady
   každého volání zapisuje sám, souhrn `node scripts/utils/is_gpt_naklady.js`. Idiomy nevidí (`--samotest` to dokládá).
4. `python -X utf8 is-vazba.py --freq "<obrat>"` — korpus Risamálheild: idiomy, vazby, kolokace (0× = podezřelé); `is-vazba.py <slovo>` = slovník.
Korekce v DB: `is-corr-qa.py` (BÍN).
**Vazba ≠ tvar — rekci/pád/kolokaci/idiom NEHÁDEJ (vrstva NAD BÍN).** Vazbu ověř nástrojem 4, nikdy odhadem ani „pohledem“. → [[is-vazba-check]].
Každé generování v IS má **3 vrstvy**, všechny v promptu: `buildSysPrompt` (IS system) · `buildReadingPrompt` (RP_* pack v IS) · `getCorrPrompt`
(korekce DO promptu). ⚠️ **Žádná 4. vrstva:** post-processor na IS text (substring náhrady) už nikdy nezaváděj — neumí pád ani rod; korekce patří do promptu.

### §3 — Sdílené moduly = automatický sync
→ §18 bod 6.

### §4 — SW verze
Auto-bump: git pre-commit hook (hooks/pre-commit.py). Po fresh clone: `python -X utf8 hooks/install-hooks.py`. Ruční bump, je-li sw.js už staged.

### §5 — UI invarianty
`--dim` NIKDY pro text (jen ikony, šipky, oddělovače, placeholdery) · reader-content se NIKDY neskrývá (tokeny bydlí v `runar-reader.css`).
Runa ᚱ: vždy zlatá, NIKDY s ozdobami (◌ ᚱ ◌ zakázáno); ᚱ brand = font v HTML, ne `runeSvg`.
**Runové glyfy = JEDEN zdroj kresby (RUNE_SVGS) přes `runeSvg(rune,{frame})`:** `frame:true` = KÁMEN pro runy, které člověk táhne / drží / vidí
jako runu (mřížka tahu, Kolekce, čtení single i spread, sloty, deník, životní runa všude, runa v hlavičce oken); `frame:false` = HOLÁ linka
(#D6A85C) jen v textových popiscích. NIKDY font glyf jako primární. Blank = orámované prázdno, NIKDY `○`. Holá runa = jen hlavní tah
(`RUNE_BARE_KEEP`). Tap popup kopíruje `g.innerHTML` (SVG).

### §6 — Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
THE GATHERING · RÚNAR. Jména tierů sem nepiš — bydlí v `TIERS.*.label` / `.label_is`.

### §7 — Commit pravidla
Jeden commit = jedna věc. Push ihned. Smoke: `python -X utf8 smoke.py`.

### §8 — Tier hodnoty = vždy z configu
→ §10.

### §9 — IS text = zkontrolovat před commitem
→ §2, bod 1 (`check-is.py` pouští pre-commit sám).

### §10 — Texty, hodnoty a jména z UI_TEXT / VOCAB / TIERS / configu, NIKDY natvrdo
```
t('key')          ← statický z UI_TEXT
tp('key', {vars}) ← šablona: 'You have {casts} remaining'
vn('cast', n, l)  ← plural z VOCAB: '3 casts' / '3 spár'
vl('card', l)     ← label z VOCAB: 'Rune Card' / 'Rúnakort'
TIER_LIMITS.rune_seeker.onboarding_label_en  // ✅   'five readings each month'  // ❌ NIKDY
```
Přidání jazyka = jen nový blok v UI_TEXT + VOCAB. Hodnoty tierů (limity, kapacity, štítky) jen z configu. Název karty / jednotky a jména tierů
přes `vl()`/`vlp()`/`vn()`/`tp({card})` / `TIERS[x].label`; štítky a tlačítka templatuj s `{card}`/`{unit}`. Platí i pro hodnoty v translations.js.

### §11 — IS text v Python skriptech = VŽDY literální znaky
Escape sekvence NIKDY — jen literal UTF-8 s `python -X utf8` (příklady → working-style.md).

### §12 — Jméno uživatele: fallback = "you" / "þú"
NIKDY `email.split('@')[0]`. `displayName()` = jediný zdroj pravdy.

### §13 — Nová věc musí projít VŠEMI cestami (Full-path rule)
Nový field → všechny buildXxxPromptIS/EN · startReading() · resetReader() · shrine parts[].
Nový spread → readRune() · resetReader() · _setSpreadMode() · generateVoice().
Migrace → grep starý text, aktualizovat VŠECHNY výskyty. Před commitem: „Existuje jiná cesta kódem, kde tohle chybí?“

### §14 — updateUIText() = POUZE statické překlady
Volá se při každém přepnutí jazyka — NIKDY sem state-dependent obsah. Dynamický obsah: `_updateReadingForm()` (heading `reader-card1-lbl`
+ `reader-note`), `_updateDobLabel()` (DOB). Porušení přepíše personalizovaný text.

### §15 — Vocab/tier termíny = z VOCAB/TIERS, NIKDY natvrdo
→ §10.

### §16 — Two-output rule + Reconciliation (doc sync)
Task měnící chování/rozhodnutí = práce + 1 záznam do `RUNAR_DECISIONS.md` (append-only) + oprava dotčeného docu **v tomtéž commitu**
(řádek `Affected doc(s)` hlídá smoke ⑮). Reconciliation („Reconciliation: <doc|modul>“): každý rozpor doc × kód ověř a **sám oprav**;
co potřebuje ownera, zapiš do seznamu a **pokračuj** (rozsah schvalování → `memory/working-style.md` „Explore → Plan → Implement“).

### §17 — Doc sync: jediný zdroj = git repo, sdílená paměť přes junction
Paměť žije v `repo\memory\`; obě platformní složky (Cowork `AppData\Roaming\Claude\memory`, Code `.claude\projects\C--Users-zkuku\memory`)
jsou **junction** na ni. Rozbitý junction → `memory\relink-memory.ps1`. Kanonický doc žije JEN v repu; Cowork píše do repa VÝHRADNĚ přes CODE.
Zrcadlo `…\Projects\RÚNAR the rune keeper\` není kopie — nanejvýš dočasný draft „→ CODE“; před smazáním zrcadlové kopie diff, co je v ní navíc.
Každá změna docs = malý commit + push IHNED, prefix `[docsync]`.

### §18 — Jeden zdroj pravdy, žádné paralelní kopie (ANTI-DRIFT)
1. Každý řetězec/hodnota/chování žije na JEDNOM místě; jazykové / tier / spread varianty = **DATA** (packy `RP_*`, config, `VOCAB`/`TIERS`), jedna cesta kódu.
2. Než napíšeš druhou „skoro stejnou“ věc → STOP: dá se to jako data + jedna funkce?
3. Refaktor měnící generovaný výstup = golden-verify (`scripts/golden/`, diff = jen zamýšlené).
4. Změny kvality čtení = MĚŘIT, ne hádat (objektivní tvrdě; subjektivní styl = human judgment).
5. Nová věc → §13 full-path + zapsat do jednoho packu/configu.
6. **Sdílené moduly:** `runar-character.js` a `runar-utils.js` načítají reader i shrine — NIKDY je neduplikovat do shrine.

### §19 — Ověřuj VÝSLEDEK, ne tvar kódu (anti-tichá-chyba)
1. **Seed-and-assert na hranici:** kde data přechází hranici (DB→kód, zdroj→prompt, stav→reset), protlač známý vstup produkčními funkcemi a ověř
   výsledek (vzor `golden_contracts.js`, smoke ⑥). Fixture cvičí pravou hranici, ne test-double.
2. **Žádné tiché zelené:** co nástroj prokazatelně neposoudí, NESMÍ projít zeleně; filtrovaný signál = viditelný žlutý (`E001` ≠ „v pořádku“).
   Nesrozumitelný výstup se přepíše, dokud mu nástroj nerozumí.
3. **Kontrola běží na TÉ PLOŠE, kde bug žije** (model-output ≠ zdrojový string; DOM ≠ builder).

### §20 — Jedna informace = jedno místo. Nikdy dvě.
**Než napíšeš fakt do docu, zeptej se: kde tohle už bydlí?**
1. **Bydlí v kódu → doc to NIKDY neopisuje**, jen odkáže (čísla `SPREAD_COSTS`, `TIERS`, labely, délky čtení, model).
2. **Bydlí v jiném docu → odkaz, ne převyprávění.**
3. **Nebydlí nikde → urči vlastníka a napiš to TAM.**
4. **Stav („hotovo/TODO/nasazeno“, SW verze, hash) vlastní kód a `git log`**; `RUNAR_DECISIONS.md` vlastní rozhodnutí, ne stav.
Nový doc musí umět říct, **co vlastní on a žádný jiný** — „shrnutí všeho“ nevzniká. **Při sporu vyhrává PRODUKCE**, pak nejnovější datovaný
záznam v `RUNAR_DECISIONS.md`; na rozhodnutou věc se ownera neptej — dohledej ji.
**Najdeš duplikát nebo chybu, i mimo zadání → hned oprav, nebo zapiš do `RUNAR_BACKLOG.md`** (s kontextem); nikdy tiše přejít.

### §21 — Ownerův nápad = směr k dopracování, ne hotové zadání (platí pro VŠECHNY session)
Nejdřív **kritický pohled + proveditelnost** (kde to drhne, riziko, „střecha před základy“), návrh korekce, teprve pak konat. Rozhodnutí = směr,
ne zámek: mění se novým datovaným záznamem; při rozporu VAROVÁNÍ, ne tichý drift. → [[decisions-are-directions-not-locks]]
**Návrat k opuštěné věci jen očištěný:** najdi záznam odchodu, pojmenuj vadu, vrať verzi bez ní, zapiš nové rozhodnutí s odkazem na staré.
Mrtvý kód „pro historii“ nese komentář s důvodem odchodu — čti ho, než ho oživíš.

### §22 — Duplikát / chyba → hned oprav, nebo zapiš (nikdy tiše přejít)
→ §20, poslední odstavec.

### §23 — Nevymýšlej fakta ani lore → zastav a flagni (platí pro VŠECHNY session, Code i Cowork)
Chybí-li v kánonu 🔒 fakt (etymologie, IS gramatika, čísla, DB) nebo 📜 lore → „nevím / chybí“, nikdy domněnka za pravdu.
Čím lepší model, tím sebejistěji zní výmysl. → [[dont-invent-fact-critical]]

### §24 — Ověř, než tvrdíš (měř, nehádej) (platí pro VŠECHNY session, Code i Cowork)
Nález/pravdu nejdřív **změř / protlač produkční cestou / porovnej**; dojem se nepočítá. Nejde-li změřit, řekni „nevím“. → [[measure-dont-eyeball]]

### §25 — Napřed se sám vyvrať: obrácená páka a útok na nástroj (platí pro VŠECHNY session, Code i Cowork)
**A) Obrácená páka:** hypotézu „X je málo, přidej X“ testuj tak, že X **ubereš**; musí to zhoršit. Nevyjde-li ani obráceně, nález je „není to X“
a zapisuje se stejně pečlivě (§16). Vždy uveď hranici nálezu (co vyloučeno, `n`, co se netvrdí). → [[falsify-by-reversing-the-lever]]
**B) Nástroj se obhájí dřív než výsledek:** (1) půlka proti půlce — liší-li se půlky víc než srovnávané dávky, je to šum; (2) co JEŠTĚ odlišuje
referenční dvojici; (3) nulová transformace — nepohne-li se číslo, slepota je dokázaná. Párové metriky: jackknife, nikdy bootstrap
s opakováním. → [[attack-the-metric-not-just-the-result]]

### §26 — Opustit něco ≠ zavřít to navždy; návrat je povolený, ale JEN očištěný
→ §21, druhý odstavec.

### §27 — Nástroj se obhájí dřív než výsledek
→ §25 B.

### §28 — Každá změna nese svůj DŮVOD tam, kde bydlí (platí pro VŠECHNY session)
Důvod se píše k té změně, ne do zvláštního seznamu: **kód** → komentář na místě (u obrany i doklad) · **doc** → changelog daného docu ·
**rozhodnutí** → datovaný záznam (§16) + věta v commitu · **výjimka z kontroly** → důvod + datum ve značce. Důvod NENÍ převyprávěný diff.
⚠️ **CLAUDE.md nenese historii ani doklady** — „do X tu stálo …“, citace a příběhy patří do DECISIONS / `docs/pravidla-duvody.md`.

### §29 — Hlášení z appky: načíst → označit přečtené → udělat → hotové uzavřít, nehotové do BACKLOGu (platí pro VŠECHNY session)
Stav v `bug_reports.status` je jediný zdroj (`new` / `triaged` / `fixed`). Načíst = `node scripts/nacti_cteni.js` (ukáže `new` a označí `triaged`).
Každé načtené hlášení v tomtéž tahu dostane `--hotovo <id8> "<co, commit>"` nebo `--backlog <id8> "<položka>"` (i „čeká na ownera: …“);
Stop-hook tah neukončí, dokud něco zbývá. Neřeš hlášení, které už `new` není. ✦ Keep = uložený text, jen se označí přečtený.

### §30 — Nic nesmí viset na paměti session: pravidlo, které se opakovaně porušuje, dělá stroj (platí pro VŠECHNY session)
Co se má dít pokaždé, udělá skript, nebo zastaví práci, když se vynechá. Úplný seznam nosičů (co hlídá které pravidlo):
`node scripts/verify_nosice.js --vypis`. Co tě zastaví a jak dál:
- **Pokus přes API** → hook ho nepustí bez `RUNAR_API_ANO=<počet>` + `RUNAR_API_ZAMER="<co rozhodne>"` (nad 50 i `RUNAR_API_OWNER`). Napřed
  `node scripts/utils/najdi_cteni.js` (odpověď v datech?), pak ownerovo ano, malý vzorek napřed.
- **Zpráva ownerovi** (Stop-hook): body a otázky číslované; návrh nebo otázka na rozhodnutí jen po `node scripts/utils/uz_vime.js <pojmy>`
  v témže tahu; co čeká na ownera, polož jako otázku s otazníkem; „nejspíš/zřejmě“ o kódu jen s „neověřeno“.
- **Sdílené docy** (`RUNAR_*.md`, `CLAUDE.md`, `memory/`, `_SDILENE`) commituje jen `commit_vlastni.py`; Edit na ně zastaví hook →
  `commit_vlastni.py uprav <lane> <soubor> <stary.txt> <novy.txt>` nebo `cv.zapis`. Mazání cizích řádků z posledních 24 h jen s `RUNAR_CIZI_OK`.
- **Pravidla při dotyku** (hook): první sáhnutí na soubor z `scripts/utils/pravidla_mapa.json` vypíše živá pravidla; zápis do docs/paměti až po
  `uz_vime.js` puštěném po poslední zprávě ownera. Nové pravidlo k souborům → řádek do mapy.
- **Pasti v příkazech** (hook): heredoc se zpětným lomítkem, `grep … OK|FAIL … &&` jako podmínka, neviditelný znak v Edit/Write.
- **Kontroly:** pre-commit pustí rychlé kontroly na staged soubory; pre-push celý smoke v čisté kopii. Nová kontrola = útok v
  `scripts/protipriklady.py` (`PRIPADY`) nebo důvod v `BEZ_UTOKU` (smoke ㊵).
- **Automatické mazání** → registr `MAZANI` (`supabase/functions/_shared/ops_souhrn.ts`) + `ops_events` purge; neviditelné běhy → `BEHY`, selhání e-mailem.
- **Konverzace se neztrácí:** `node scripts/utils/najdi_v_konverzacich.js "<text>"`. Hooky Claude Code: zdroj `hooks/claude/` v repu.
Pravidlo porušené podruhé → nepiš ho jen do paměti, přidej mechanismus (hook, kontrola ve smoke, krok skriptu).

### §31 — Jazyk komunikace: veřejně i pro adminy jen IS a EN, česky jen owner ↔ Claude (platí pro VŠECHNY session)
- **IS + EN:** co uvidí uživatel, tester nebo model — appka, nápověda, soukromí, e-maily, odpovědi testerům.
- **EN:** co je pro adminy — shrine, štítky schránky runar@, logy edge funkcí, štítek verze promptu (`RUNAR_PROMPT_VERSION`).
- **Česky jen owner ↔ Claude:** chat, docs, komentáře v kódu, commity, paměť, výstup skriptů v `scripts/`, laby.
- Hlídá smoke ㉹ (`scripts/verify_jazyk_ui.js`); minutou češtinu oprav a slovo přidej do `CZ_SLOVA`. Gmail → memory `schranka-runar-gmail`.

### §32 — Základ produkce se nesmí odebrat (platí pro VŠECHNY session)
**Základ** = Rúnarova fotka, záložky, všech pět výkladů, 25 run v tahu i v Safn rúna; seznam vlastní `scripts/verify_zaklad_produkce.js`
(smoke ㉼, skutečný prohlížeč, návštěvník i přihlášený, všechny stavy). Změna toho, co uživatel vidí: porovnej celou obrazovku PŘED a PO;
co ze základu zmizí, je chyba — napřed se zeptej ownera.

---

## Tier systém
Zdroj pravdy = `v2/runar-config.js` (`TIERS` jména + flagy · `TIER_LIMITS` pravidla · `TIERS.*.monthly_readings` kapacity) — tady se neopisuje.
DB hodnoty: `free_trial` · `rune_seeker` · `standard` · `premium`. Všichni registrovaní jsou Rune Seeker; standard/premium = víc čtení, ne hodnost.
ADMIN → `isAdmin()` (`ADMIN_EMAILS`). **VŽDY testovat i jako visitor/rune_seeker.**
**Účty:** testeři = lidé ze seznamu `allowed_emails` (role `tester` → premium + `is_tester`; počet z DB, nepiš ho). Další **4 účty jsou týmu**
(owner, Sigrún): 2 admin + 2 na test Rune Seekera (`is_tester`, mimo `allowed_emails`). Kapacitu a brzdy testerů počítej jen pro ně.
U každého ownerova pokynu dohledej, **o kom** mluví (testeři / produkce / tým).

## DB — user_profiles
Schéma vlastní DB + `sql/` migrace — neopisuje se. ⚠️ **`email` a `updated_at` v `user_profiles` NEEXISTUJÍ** (e-mail je v `auth.users`).
Zapisovatelnou plochu vlastní `sql/2026-07-16_user_profiles_column_grants.sql` (smoke ⑩); peníze a oprávnění (`tier`, `credits_balance`,
`free_balance`, `month_*`) píše VÝHRADNĚ server přes service_role.

## Reading systém — stav
Jeden plynoucí blok (žádné `|||`). `_readingMode` = `'mine'` (journal píše server v `claude-proxy` po odečtu kreditu) | `'someone'` (neukládá).
**Délky čtení** = buildery v `runar-character.js`; měníš délku → přepočítej pricing. **Obraznost:** `_seasonalImagery` bere obraz z `RUNE_IMAGES`
(klíčované runou); `SEASON_POOLS` se do čtení nedostane. **KLÍČ** system × user prompt: sol pravidlo v systému dodrží stejně jako v user promptu
(RUNAR_EVAL_LOG 2026-10-16 (1)); rozpor obou neměřen. Detail → `docs/projekt-mapa.md`.

### Spread systém
Kredity = per typ čtení (`SPREAD_COSTS` / `SPREAD_CONFIG`, neopisuje se). The Gathering čeká na `detectPatterns` (BACKLOG).
**Gating:** blokuje se jen **Visitor** (proxy ho odmítne 401, po tahu dostane výzvu k registraci); každý přihlášený dosáhne na všechno.
⭐ **Yggdrasil = KDYKOLIV, KDOKOLIV přihlášený** — slunovrat = větší síla ve stromě, ne podmínka přístupu.

## Tree of Life — stav
Vlastní `RUNAR_TREE.md` a `git log`. ⚠️ **Past pro `[tune]`:** strom se krmí regexem přes text čtení (glyfy 0x16A0–0x16FF z `rune_glyph + short_text`)
— změna formátu skládaného textu = CODE-tree tiše přijde o větve (smoke ⑬).

## Word Corrections
Živá data: `python show_corrections.py` · nová korekce do DB přes shrine (ověří `is-corr-qa.py`); známá chyba ve zdroji → `BAD_PATTERNS`.

## Kde hledat co
Vlastník = `memory/MEMORY.md`, „Rozcestník“. **Čísla jen v configu / builderech; 1 téma = 1 doc; délka doku ~200 řádků (250 OK)** —
CLAUDE.md je z limitu vyňatý, platí pro něj test „způsobí jeho chybění chybu? ne → pryč“.

---

## N paralelních session — kdo o čem mluví
Víc session naráz: **CODE** tune · read · tree · web a k nim **Cowork** (read-only, do repa jen přes svého CODE).
⭐ **Každá session commituje pod svým jménem:** `git -c user.name='CODE-tune' commit -F <msg> -- <cesty>` (per-commit, ne `git config`; smoke ㉛).
Sdílené docy jen `commit_vlastni.py` (§30).

### ⭐ Vedoucí pravidlo: dělíme se podle toho, kdo co VIDÍ
**Cowork mluví o DATECH** (čtení, evaly, screenshoty, copy, design) · **CODE mluví o KÓDU** (git, soubory, stav, chování). Cowork kód nediagnostikuje,
CODE nerozhoduje o obsahu a designu; o kódu se Cowork **ptá** („vidím X — najdi zdroj“). **Handoff začíná `psáno proti commitu <hash>`**;
zastaralý CODE odmítne sám. Handoff má sekci `ZMĚNĚNO:` (i prázdnou).

**Lanes (kdo co vlastní):**
- **CODE-tune** `[tune]`: reading systém, prompty, config, pricing, translations, reader UI/CSS, reporter, auth, app, journal, eval-implementace, copy
  (vše kromě tree vizuálu). Do produkce jen **malé ověřené opravy, po jedné**; velké zásahy do promptu a jiné modely napřed v labu CODE-read.
- **CODE-read** `[read]`: čte, testuje, měří — **produkční kód nesahá**; nálezy do `RUNAR_EVAL_LOG.md` / `RUNAR_DESIGN.md`, změny předává CODE-tune.
- **CODE-tree** `[tree]`: vizuální engine stromu (`runar-tree-prod.js` generovaný `build_tree_production.py`, tree-lab composery, `tree_state`); doc `RUNAR_TREE.md`.
- **CODE-web** `[web]`: therunekeeper.com (`web/`), registrace, nákup Rúnakortu; appku (`v2/`) jen ČTE, změny předává vlastníkovi.
- **`dverg-tarot/` (Dverg Tarot)** `[dverg]`: karty run s dvergy, **samostatný produkt mimo Rúnara**; Rúnarovy session nesahají (`dverg-tarot/README.md`).
- **Cowork** `[cowork]`: design, docs, eval-obsah, copy, handoffy; repo READ-ONLY přes `git show HEAD:`.

**Mechanika:**
- Commit prefix = LANE; `git log` je akční log. Do DECISIONS jen co git nevidí (deploy, SQL ownera, rozhodnutí).
- Zámek: ŽIVÝ (git běží / < 10 min) → čekat; **SIROTEK** → `python -X utf8 scripts/git_zamek.py <lane>` (audit, smoke ㉞); jiný důvod → ohlásit.
- Pravidlo, které musí hlídat člověk → udělej z něj kontrolu (§30).

**Hranice:**
- Kanonická data run (`runar-runes.js`) a config čtou všichni; TREE do nich sahá **jen aditivně** (`[tree]`, push hned); změna existujícího pole = flagni.
- Čistě MAIN (TREE needituje): reading prompty, pricing, translations, reader UI/CSS, auth, life-rune logika. §1 a §13 platí pro všechny.
- CLAUDE.md: každá session edituje jen svou sekci.

**Komunikace (přes git + soubory):**
- `git pull` PŘED prací; push ihned, malé commity.
- **Commit ÚZCE:** `git commit -F <msg> -- <cesty>` pro kód (pathspec NA COMMITU); sdílené docy jen `commit_vlastni.py`. Holý `git commit` /
  `git add -A` bere celý index i s cizí staged prací. → memory `parallel-code-sessions-collision`.
- Cizí doména: změna minimální + „co a proč“ do svého docu + push. Git konflikt: neforcuj, vyřeš jen svou doménu.
- Stav session nepiš do docu; stav = `git log` a `v2/sw.js`. Signál hotovo = push. Před prací čti `git log` druhé lane.

# Projekt — mapa stavu (podrobnosti k CLAUDE.md)
# Čte se NA POŽÁDÁNÍ. CLAUDE.md drží jen pravidla a pasti; tady jsou podrobnosti popisných sekcí (Tier, DB, Reading, Tree, …),
# přenesené doslova z CLAUDE.md při optimalizaci 2026-10-21 (DECISIONS 2026-10-21). Stav sám vlastní kód a `git log` (§20.4) —
# co tu zastará, oprav podle kódu nebo smaž.

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\
Stack: HTML + CSS + vanilla JS · Supabase (projekt v `runar-config.js` SB_URL) · modely čtení přes edge funkci `claude-proxy`
(který model čte, vlastní `SOL_MODEL` + záložní `MODELS` tam) · ElevenLabs · IS primární + EN

<!-- Vlastník tabulky od 2026-11-26 (zkrácení CLAUDE.md na 200 řádků, owner „20. ano“): přeneseno doslova z CLAUDE.md, tam zůstal odkaz.
     Nový / smazaný soubor appky (v2/runar-*.js|html|css) → oprav tabulku i load order; hlídá smoke ㊉ (scripts/verify_soubory_claude.js). -->
## Soubory a jejich zodpovědnost

```
runar-config.js       — TIERS, RUNAR_MODES, TIER_LIMITS, SPREAD_COSTS, SPREAD_CONFIG, VOCAB,
                        VOICE_PROFILES + ACTIVE_VOICE_PROFILE (hlas), ADMIN_EMAILS, HEAVY_RUNES (úplný výčet má soubor)
runar-runes.js        — 25 Elder Futhark + calcLifeRune()
runar-names.js        — severská jména: seznam, který rozhoduje o rozboru jména (ne model) · jen reader
runar-names-registry.js — Mannanafnaskrá (GENEROVANÉ scripts/import_mannanafnaskra.js, needitovat) · jen reader
runar-translations.js — UI_TEXT {en, is}
runar-character.js    — DEF_CHAR_EN/IS, buildSysPrompt(), RP_* packs + buildReadingPrompt()
                         + spread dispatchers, buildLifeRunePrompt(), getCorrPrompt()
runar-utils.js        — t(), tp(), vn(), vl(), setText/setSt/showToast, stream, isAdmin() (seznam ADMIN_EMAILS v runar-config.js)
runar-svgs.js         — RUNE_SVGS: kresby run (jediný zdroj kresby, §5)
runar-journal.js      — loadJournal(), renderJournal(), filterJournal()
runar-tree.js         — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB()
runar-auth.js         — updateAuthUI(), PWA, sign-in, redeem
runar-reading.js      — startReading(), _generateReading(), generateVoice()
runar-app.js          — state, DB init, fetchUserProfile(), showAppTab()
runar-reporter.js     — in-app hlášení od testerů (bug_reports) · jen reader
runar-client-errors.js — chyby JS u uživatelů → edge fn client-error (ops_events client_error) · jen reader, hned po configu
runar-verze.js        — verze běžícího kódu pro hlášení (GENEROVANÉ hooks/pre-commit.py při bumpu sw.js, needitovat) · jen reader
runar-rune-popup.js   — ťuknutí na glyf runy ve čtení → popup se jménem a významem · jen reader
runar-svicka.js       — JEDINÝ přehrávač hlasu (svíčka = posuvník): čtení, Kolekce, deník, rituál · jen reader
runar-helper.js       — nápověda „?" (bublina: glyf-tap, Ask) + hesla zrcadla v UI_TEXT · jen reader
runar-runa-dne.js     — runa dne: tlačítko pod RÚNAR, okno, text dne (čte rune_day, píše claude-proxy) · jen reader
runar-runakort.js · runar-runakort.css — kresba karty Rúnakort (okno cesty); web ji čte odsud · třídy rk-* · jen reader
runar-znacka.js       — značka ᚱ kresbou: znackaSvg() + vyplní [data-znacka] · reader, nápověda, soukromí
runar-readings-admin.js — shrine: prohlížeč čtení (edge fn list-readings)
runar-reports-admin.js  — shrine: prohlížeč hlášení (edge fn list-reports)
runar-voice-admin.js    — shrine: záložka VOICE, stav ElevenLabs (edge fn voice-usage)
runar-testers-admin.js  — shrine: záložka TESTERS, účty testerů a týmu — čtení, Asky, hlasy, cena (edge fn voice-usage {accounts})
runar-payback-admin.js  — shrine: záložka PAYBACK, kalkulačka návratnosti (čte tabulky RUNAR_PRICING.md)
runar-help.html · runar-privacy.html — statické stránky (návod, zásady soukromí)
runar-reader.html     — produkční app
runar-reader.css      — styly
runar-shrine.html     — admin app      ← Edit tool OK pro HTML
sw.js                 — Service Worker (auto-bump via git hook · hooks/pre-commit.py)
runar-tree-prod.js    — strom v appce (GENEROVANÉ build_tree_production.py, CODE-tree, needitovat)
```


### Load order
```
vendor/supabase.min.js → runar-config.js → [reader: runar-client-errors.js] → runar-runes.js → [reader: runar-names.js → runar-names-registry.js] → runar-translations.js → runar-character.js
→ runar-utils.js → runar-svgs.js → [reader: runar-runakort.js → runar-znacka.js]
→ [reader]: runar-svicka.js → runar-journal.js → runar-tree.js
            → runar-auth.js → runar-reading.js → runar-app.js
            → runar-verze.js → runar-reporter.js → runar-rune-popup.js → runar-helper.js → runar-runa-dne.js
[jen kdo strom vidí, dynamicky z runar-tree.js]: tree-lab-trunk-composer/runar-trunk.js → tree-lab-branch-composer/runar-branch.js
            → runar-tree-prod.js
```
## Tier systém
**Zdroj pravdy = `v2/runar-config.js`** (`TIERS` = jména EN/IS + flagy · `TIER_LIMITS` = pravidla
· `TIERS.*.monthly_readings` = kapacity). **Tady se to NEOPISUJE** — §20. Jména se od 2026-07-05
měnila dvakrát a každá opsaná tabulka to přežila jako zastaralá.
DB hodnoty (neměnné): `free_trial` · `rune_seeker` · `standard` · `premium`.
Identita: **všichni registrovaní jsou Rune Seeker**; standard/premium nejsou hodnosti, jen víc čtení.
ADMIN → `isAdmin()` v `runar-utils.js`, seznam `ADMIN_EMAILS` v `runar-config.js`. **VŽDY testovat i jako visitor/rune_seeker.**
**Účty (KUKY 2026-10-11, musel to opakovat):** testeři = **lidé ze seznamu** `allowed_emails` (role `tester` → premium + `is_tester` při registraci; kolik jich je,
řekne DB: `select count(*) from public.allowed_emails where role = 'tester'` — číslo se sem nepíše, owner přidává další).
Další **4 účty jsou týmu — ownera a Sigrún:** 2 admin (`ADMIN_EMAILS`) a 2 na test slabšího Rune Seekera (`is_tester`,
mimo `allowed_emails`). Kapacitu a brzdy testerů (čtení, hlas) počítej **jen pro ně**; účty týmu mají strop testera taky a do nejhoršího cyklu se počítají. U každého ownerova pokynu dohledej, **o kom**
mluví (testeři / produkce / tým) — pokyn pro testery se 2026-09-11 i 2026-10-11 omylem vztáhl na všechny (DECISIONS 2026-10-11 (49)).

## DB — user_profiles
**Schéma vlastní databáze + `sql/` migrace. Tady se NEOPISUJE** (§20) — ručně vedený seznam
se rozešel o 4 sloupce dřív, než si toho kdokoli všiml (2026-07-19: chyběly `address_gender`,
`is_tester`, `analytics_opt_out`, `tester_consent_at` — a do všech tří klient zapisuje).
Aktuální sloupce: `supabase db query --linked "select column_name from information_schema.columns
where table_name='user_profiles'"`.
Co databáze sama neřekne (neexistující `email` / `updated_at`, kdo smí co zapsat) → CLAUDE.md „DB — user_profiles“.

## Reading systém — stav
**Unified format**: 1 plynoucí blok, žádné `|||`. `layer1-lbl` = glyf + jméno runy.
`_readingMode` → CLAUDE.md „Pasti systémů“ (Čtení). Detail: journal píše server dvěma zápisy hned po odečtu kreditu (ne jedna transakce),
klient jen `loadJournal`.
`u.area/seeking/intention/question` → `parts[]` → Claude. Norns axis: `_intentionContext(intention,lang)` v runar-character.js.
**Délky čtení**: zdroj pravdy = buildery v `runar-character.js` (RP_* packy + `closing()` věty). Docs čísla NEopakují — když měníš délku, uprav builder + přepočítej pricing (RUNAR_PRICING.md). Délka = znaky = EL náklad. Jméno ne vždy na začátek; životní runa jen kontext.
**Obraznost**: `_seasonalImagery(lang, drawn)` vloží do čtení JEDEN obraz. Primární zdroj je
`RUNE_IMAGES` — obrazy **klíčované runou**, obojí jazyk na témž řádku (od 2026-08-10 i pro EN).
⚠️ **`SEASON_POOLS` se do čtení NEDOSTANE — ověřeno protlačením 2026-09-08.** Pool i větev `if (!pool) return ''` jsou mrtvé: **0 ze 150** dvojic (25 run × 6 sezón, Blank se počítá)
runa × bucket je bez runového kandidáta (`runePhrase` je tedy vždy neprázdné a `phrase =
runePhrase || …` po poolu nesáhne), a `_seasonBucket` vrací pool pro všech 12 měsíců, takže
ani ten guard nezabere. Padá s tím i los klíčových slov (`pickedKws`), který visí na téže
podmínce. Sezónní **sáček** se přesto čerpá při každém čtení — to je jediný živý účinek poolů.
Sáček proti opakování má klíč per SADA run; u spreadu se losuje ze všech tažených, ne z první pozice.
KLÍČ (2026-06-12, jeden test na Claudovi): konkrétní pokyn v user promptu vyhrál nad obecným pravidlem v systému. **Na solu neměřeno**
a výrobci učí opak (OpenAI Model Spec: system/developer zpráva má vyšší autoritu než user; Anthropic: stálá pravidla do systému,
krátká připomínka na konec) — rozhodovat mohla poloha a konkrétnost, ne role. **Změřeno na solu 2026-10-16** (RUNAR_EVAL_LOG 2026-10-16 (1)):
jednoduché pravidlo v systému dodrženo 5/5 = v user promptu 5/5, bez pravidla 0/5 — sol systém NEignoruje (EN, n = 5, pravidlo bez konfliktu;
pravidlo proti protichůdnému pokynu v user promptu neměřeno). Reader i shrine = `buildSysPrompt`.

### Spread systém
Kredity = **per typ čtení**, NE počet run. Počty run i ceny = `SPREAD_COSTS` / `SPREAD_CONFIG`
(config = zdroj pravdy, **tady se neopisují**). Předplatné počítá tytéž jednotky. Founding = Norns.
Které spready existují, vlastní `SPREAD_COSTS` / `SPREAD_CONFIG` — **tady se to neopisuje**.
Jediná výjimka je The Gathering: starý modul `runar-gathering.js` odstraněn 2026-09-28 (v aplikaci <!-- doc-links:ok 2026-09-28 soubor záměrně smazán, odkaz je historie -->
neměl vstup, `RUNAR_DECISIONS.md` 2026-09-28 (1)); nová podoba čeká na `detectPatterns` → `RUNAR_BACKLOG.md`.
<!-- 2026-08-18: tady stál výčet pěti spreadů + „= ✅ produkce", tedy STAV, který §20.4 zakazuje
     a který navíc říkal totéž co tehdejší řádka o modulu Gatheringu o 326 řádek výš. Duplikát uvnitř
     jednoho souboru; pět spreadů je v configu, takže se dá odkázat místo opisovat. -->
**Gating a Yggdrasil** → CLAUDE.md „Pasti systémů“ (Spready). Detail: Visitor má statickou Kolekci a životní runu (výpočet); po tahu runy mu
appka ukáže výzvu k registraci a proxy nevolá (DECISIONS 2026-10-10 (1)).

## Tree of Life — stav
Stav vlastní `RUNAR_TREE.md` (duše · zóny · stavba · co je a co není postavené) a `git log`.
**Tady se neopisuje** — §20.4. Kdo strom vidí, vlastní `treeVisibleFor()` v `runar-tree.js`. Past pro `[tune]` → CLAUDE.md
„Pasti systémů“ (Strom; smoke ⑬).
Kanonický vstupní bod = `RUNAR_TREE.md`. `RUNAR_TREE_LAB.md` = historie (docs/archive/tree/).

## Word Corrections
Živá data: `python show_corrections.py` · nová korekce do DB přes shrine (ověří `is-corr-qa.py`, §2); známá chyba ve zdroji → `BAD_PATTERNS` (§2 bod 1).

## Kde hledat co
**Vlastník = `memory/MEMORY.md`, sekce „Rozcestník".** Sem se nekopíruje.
Dvě mapy téhož = přesně to, co §20 zakazuje.
**Doc-owner pravidla (2026-07-05):**
- **Čísla = jen v configu / builderech** (SPREAD_COSTS, TIERS, character.js). Docs je NEopakují — odkazují na zdroj (délky→character.js, ceny/kredity→config).
- **1 téma = 1 vlastník doc.** Žádné nové samostatné docs — když téma patří jinam, jinde jen odkaz.
- **Délka doku ~200 řádků** (250 OK, když to fakt pomáhá). Nad = rozdělit nebo přesunout detail.
  ⚠️ **`CLAUDE.md` nejvýš 200 řádků** (owner 2026-11-25 „20. ano“; oficiální doporučení Claude Code: CLAUDE.md pod 200 řádků,
  delší soubor snižuje dodržování; CLAUDE.md se načítá celý bez ohledu na délku). Hlídá `scripts/verify_doc_length.js` (strop řádků,
  strop v bajtech, zákaz historie). Do 2026-11-25 byl z limitu vyňatý (2026-08-17: pravidla §1+ přesahovala 200 řádků); zkrácení
  2026-11-26 přesunulo tabulku souborů a popis systémů sem, sloučená § zůstala jen v indexu „Podle témat“. Platí i přísnější test:
  *způsobí jeho chybění chybu?* Pokud ne → smazat. Vlastníkem tohohle pravidla je tenhle doc; `working-style.md` na něj odkazuje
  a neopisuje ho. Přesný počet řádků tu schválně NESTOJÍ (mění se s každou úpravou pravidel).

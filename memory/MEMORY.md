# Claude Memory Index
# Zkukula (Kuky) — Agndofa / Rúnar project
# Last updated: 2026-07-13

## Session Start Protocol
Na začátku každé session PŘEČÍST V TOMTO POŘADÍ:
1. Tento soubor (MEMORY.md)
2. [working-style.md](working-style.md) — workflow pravidla včetně Explore→Plan→Implement
3. Nejnovější snapshot — viz Index snapshots níže (poslední v seznamu = nejnovější)
4. Repo dokumenty: CLAUDE.md + RUNAR_DESIGN.md + RUNAR_PRICING.md + RUNAR_DECISIONS.md (append-only log rozhodnutí, §16)
5. Cílový zdrojový soubor dle aktuálního úkolu

Po přečtení potvrdit: "Mám kontext z [datum snapshotu] — jsem připraven."

⚠️ NIKDY nezačít implementovat bez toho, aby uživatel schválil plán.

Klíčové soubory pro Read (lokální):
- `C:\Users\zkuku\Downloads\Runar-admin\CLAUDE.md` — technická pravidla (včetně §10)
- `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_DESIGN.md` — design + mytologie
- `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_PRICING.md` — business model
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-config.js` — TIERS, TIER_LIMITS, VOCAB, SPREAD_CONFIG
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-translations.js` — UI_TEXT, t(), tp(), vn(), vl()
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-character.js` — prompty, IS/EN buildery

## Aktuální stav projektu (2026-07-06)

### SW verze: v199
### Poslední commit: 35d5cfd

### Klíčová rozhodnutí (platná)
- RS: 1 free cast při registraci, žádný weekly drip, ŽÁDNÝ měsíční reset (model B). Jediný signál = DB `free_balance` (default 1). 1 free MÁ hlas. Pak vše za rune readings (kredity).
- RS kreditní škála: **kredity = PER TYP ČTENÍ** (NE počet run): Single 1 · Norns 2 · Kříž 3 · Horseshoe 4 · Yggdrasil 5 · Life Rune 3 · Founding(=Norns) 2. Zdroj pravdy = SPREAD_COSTS (config). Jednotná marže ~98 %/kredit. Gating blokuje jen Visitor.
- Předplatné = STEJNÉ jednotky čtení (Yggdrasil=5 z limitu, ne 9). Worst-case = single (358 zn=strop). Enforcement limitu v proxy = TODO.
- Kapacity: Standard 50 castů/měsíc · Premium 75 castů/měsíc.
- Yggdrasil: Dec 14–28 pro VŠECHNY přihlášené (RS za kredity, Standard/Premium z limitu).
- Visitor = jediný tier bez spreadů (jen Single 1×).
- **Tier identita (2026-07-05, Cowork+KUKY)**: VŠICHNI registrovaní = **Rune Seeker** (identita navždy, žádný rank/vrchol). standard/premium = NE hodnosti, jen víc čtení/bohatší features. **Rune Walker / Rune Keeper labely = RETIRED**, nová jména standard/premium TBD (Cowork `TIER-NAMING-brief.md`) → **NEPŘEJMENOVÁVAT** dokud nedodají. **Keeper = jen Rúnar** (průvodce), žádný tier. Óðin's Path = budoucí režim/obřad (NE vrchol). Labely reálně **scattered ~10 míst** (config panel_props/life_rune, help.html, auth stub) → rename ≠ 1 místo. DB hodnoty (free_trial/rune_seeker/standard/premium) beze změny. Detail: RUNAR_DECISIONS.md 2026-07-05.
- **Vocabulary**: credit→rune reading (dříve rune stone), reading→cast, karta→Rune Reading Card. Poetické "stones" (Rúnarův hlas) zůstávají.
- **Word corrections → PROMPT (2026-07-10)**: `CORRECTIONS_IN_PROMPT=true` + `CORRECTIONS_POSTPROCESS=false` (config; nahradily `CORRECTIONS_ENABLED`). Korekce jdou do promptu čtení (`getCorrPrompt`, IS blok „Orðaleiðréttingar… í réttri beygingu eftir samhengi") → model aplikuje **v kontextu** (správný pád/rod). Slepý substring post-processor `applyISCorrections` = **VYPNUTÝ** (kontextově slepý). Krátký blok: destilovat vzory do gramatických pravidel (character.js grammar blok — kauzativum `láta/gera+nafnháttur` už přidán), jen jednorázovky jako slovní korekce; zbytek → is-grammar-qa + native. **Model prompt instrukce poslouchá** (kauzativum 3× naživo, rod). Cena zanedbatelná (hlas dominuje). *(Dřívější PAUZA téhož dne superseded.)* **IS QC toolkit**: check-is=source-linter (glob+pre-commit brána §9, model-output patterny archivované) · is-grammar-qa=GreynirCorrect (Yfirlestur) nad output, **E001→NATIVE EYE** · is-corr-qa=BÍN (`islenska`, offline) validuje korekce. **§19** (CLAUDE.md): ověřuj VÝSLEDEK ne tvar kódu — `golden_contracts.js` seed-and-assert v smoke ⑥. Shrine reader-preview SMAZÁN. `IS_NATIVE_CHECKLIST.md` pro Sigrún. Detail: RUNAR_DECISIONS.md 2026-07-10.
- **Trojice ODSTRANĚNA** — nahrazena Norns jako zakládací rituál (jediná session, 3 kořeny Urðr/Verðandi/Skuld). Cena = Norns = 2 kredity; NIKDY hardcoded "zdarma".
- Life Rune pro RS: 3 rune readings (SPREAD_COSTS.life_rune.credits).
- Gathering: area='gathering', 3 rune stones flat, všechny tiery. Stará logika (runar-gathering.js) = NAHRADIT (čeká na tree_state DB).
- Fyzická cesta: Visitor 1 + Rune Card 1 + RS 1 = 3 zdarma celkem.
- Správná jména run: Perth (ne Perthro), Berkana (ne Berkano), Othila (ne Othala), Kenaz.
- **Produkční model čtení = Opus 4.8** (claude-opus-4-8). **Sonnet 5 (NOVÝ) přeměřen 2026-07-10** slepým evalem (single+Norns, 3 porotci: gramatik/básník/rodilé ucho) — **Opus vyhrál 6:0**. Gramatika ≈ remíza (Sonnetova jediná tvrdá chyba: „löngu"→„langa ljósinu"), ale Opus vyhrál **poetický hlas** (jádro produktu); Sonnet navíc porušil personu (otevřel jménem „Kuky,", použil zakázané „Ferðalag") + **slepil Norns 3 runy do 1 bloku** (rozbil by spread). **Už to NENÍ remíza** (ta byla se starým Sonnet 4.5). Náklad dominuje ElevenLabs hlas, ne model → −40 % Sonnetu irelevantní. **Overload fallback chain (2026-07-10, claude-proxy): Opus 4.8 → Opus 4.7 → Sonnet 5.** Sonnet je jen poslední záchrana při přetížení (429/5xx po retry), NE primární — normální čtení běží na 4.8. `callClaudeWithRetry` (3× backoff) + fallback loop; 4xx nepropadá. Deploy: `supabase functions deploy claude-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt`.
- **Monthly cap 50/75 (2026-07-16)**: claude-proxy počítá a vynucuje měsíční limit placených tierů (`MONTHLY_LIMITS` = zrcadlo `TIERS.*.monthly_readings`; smoke ⑨ `verify_monthly_limits.js` to hlídá — ověřeno rozejitím obou stran). Sloupce `user_profiles.month_units` + `month_key` ('YYYY-MM'); jiný měsíc = 0 → **reset sám, bez cronu**. Překročení → 402 `monthly_limit` → `err_monthly_limit`. **Ask Rúnar se NEPOČÍTÁ** (není cast: visí na už započítaném čtení, 1 na čtení; počítat = tiše půlit předplatné) — hlásí se `mode:'ask'` přes `callProxy` (týž kanál jako `ceremonial`), NE odvozením z journalu (ten je null u neukládaných čtení → počítalo by se nespravedlivě). **Fail-open** při chybě čtení počítadla (odečet kreditů zůstává bezpodmínečný). SQL: `sql/2026-07-16_monthly_cap.sql`. Detail: RUNAR_DECISIONS.md 2026-07-16.
- **Protokol Cowork ↔ Code (2026-07-16, po 3. incidentu)**: Cowork **nezapisuje do repa vůbec** (ani docs/memory/scripts) a **nečte pracovní strom** — čte JEN `git show HEAD:<path>` (git objekty jsou checksumované → poškozené čtení spadne nahlas místo tichého uříznutí; mount v Coworku podstrčí kratší verzi, viz working-style.md 2026-07-09). Platí i pro ANALÝZU, ne jen patche. **Pracovní strom = výhradně Code**; HEAD = jediná předávací plocha → žádné „nesahá na to zrovna někdo" závody. Cowork předává patch **v chatu** jako doslovné kotvy (starý → nový) + čím to ověřil; NE přes `scripts/_patch.py` (scratch cesta Code, přepisuje se každým úkolem). Code aplikuje → ověří (smoke + node --check + IS nástroje) → commit → push. **Signál zpět = push + tento řádek v MEMORY.md** (SW + hash); Cowork pak `git pull` a čte přes `git show HEAD:`. Detail: RUNAR_DECISIONS.md 2026-07-16.
- **SEASON_POOLS rebalance (2026-07-16, prompt v0.8)**: podíl vodních obrazů sražen (highsummer 44 %, earlysummer 35 % → pevnina; autumn byl vzor s 0 %). −5 mořských (hs_seafog, hs_coldsea, hs_terns, es_coastfog, es_seasnap), dw_stars přepsán z „still fjord" na svörtu hrauninu, +4 pevninské (hrafn/fjöll, stuðlaberg, mosi/hraun, stakt fjall). IS ověřeno (is-grammar-qa čisté; `svörtu hrauninu` = týž vzor jako nahrazované `kyrrum firðinum`). **Ve stejné kohortě v0.8 i Perth**: k/k_is/formula_is „divination/spádómar" → „chance, luck, fate in the making / tilviljun, happ, örlög í mótun" (schválil KUKY) — „věštění" jako význam runy je ve věštecké appce kruhové a svádí model mluvit o praktice místo o světě (proti `_describeRule`). Verze se u Perth NEbumpla schválně: obojí dosedlo před eval dávkou = jedna kohorta. **Efekt NEZMĚŘEN** — čeká na eval dávku v0.8 vs v0.7.
- **Voice profiles**: ACTIVE_VOICE_PROFILE='focused' (produkce). Revert = 'lyrical'.
- **Journal save = SERVER-SIDE (2026-07-13)**: čtení ukládá claude-proxy atomicky s odečtem kreditu (klient posílá journal META přes callProxy; saveReading/saveSpreadReading SMAZÁNY, §18). Řeší charged-but-lost při app-switchi (kredit stržen server-side, ale klient umřel před client-save). Ukládá SLOŽENÝ text (composeReading = věrné zrcadlo _parseSegments; smoke ⑦ scripts/verify_compose_mirror.js). credits_used + life_rune server-authoritative. Odečet bezpodmínečný (fail-open = exploit). Self-XSS journal renderu → **HOTOVO** (escapeHtml/jsAttr v utils, renderJournal escapuje user pole, commit 3d31a5e; shrine user-čtení nerenderuje = žádná admin plocha). area='spread' marker zůstává. Detail: RUNAR_DECISIONS.md 2026-07-13.
- **Shrine Readings viewer (2026-07-13)**: admin záložka „📜 READINGS" ve shrine — vidí VŠECHNA čtení uživatelů (kvalita, testeři) bez screenshotů. Edge fce `list-readings` (admin-gated service-role, zrcadlo list-reports) + `runar-readings-admin.js` (karty, filtr lang, escapeHtml). VIEW-ONLY; další fáze = flag/annotate + obohatit řádek (prompt_version, rune order, char_count — eval #1) + is-grammar-qa NATIVE-EYE fronta. Cíl = sbírat/analyzovat kvalitativní data čtení od testerů (chyby neviditelné běžnému useru). Detail: RUNAR_DECISIONS.md 2026-07-13.

### Architektura §10 — NULA hardcoded strings
Každý user-visible string přes helper. Přidání jazyka = jen UI_TEXT + VOCAB blok.
```javascript
t('key')             // statický z UI_TEXT
tp('key', {vars})    // šablona: 'You have {n} {casts}'
vn('cast', 3, lang)  // plural z VOCAB: '3 casts' / '3 spár'
vl('card', lang)     // label: 'Rune Card' / 'Rúnakort'
```
VOCAB: unit(rune reading/spá), cast(cast/spá), card(Rune Reading Card/Rúnakort)

### §18 — Jeden zdroj pravdy, žádné paralelní kopie
Kořen driftu = duplikace. Jazyk/tier/spread varianty = DATA (RP_* packy, config, VOCAB/TIERS), konzumované JEDNOU cestou. Nikdy "copy-paste-then-edit" dvě skoro stejné funkce. Refaktor měnící generovaný výstup = golden-verify (scripts/golden/). Změny kvality čtení = MĚŘIT evalem (Workflow), ne hádat.

### Implementováno ✅ (detail = snapshots/ + RUNAR_DECISIONS.md; zde jen co platí + gotchas)
- **Čtení:** Single + Norns/Kříž/Horseshoe/Yggdrasil spready (buildery character.js EN+IS), Life Rune, unified 1-blok styl. Délky = zdroj pravdy = buildery (docs čísla neopakují). Jméno ne na začátek. Norns axis helpers (_moodContext DORMANT, _intentionContext gloss).
- **Prompt unification (2026-07-04):** 10 IS/EN builderů → 5 generických + RP_* packy (golden-verified). Přidání jazyka = přeložit pack, ne nový builder.
- **Segmentace Fáze A:** buildery → JSON `[{rune,text}]`, reading.js `_parseSegments` složí text (display+hlas beze změny). `deeper_meaning` ZAHOZEN 2026-07-04. Robustní parser (strip code-fence, próza za polem). Fáze B = tap UI/spread-map (Premium #1, neimpl.).
- **IS kvalita:** per-jazyk `grammar` blok v DEF_CHAR_IS/EN (2. os., shoda rodu, IS-zámek, 6 pravidel vč. #5 rod). **Gender field** (Hann/Hún/Hán=hk default; side-panel jen v IS; localStorage + DB `address_gender`; _addressContext v 5 IS builderech). IS gramatika rod: urči rod podstatného PRVNÍ (frost=hk, súld=kvk) → pak přídavné. Detail: is-grammar-adjective-gender.md.
- **Sezónní obraznost:** `_seasonalImagery(lang,drawn)` + SEASON_POOLS (6 sezón × bright/cold) + localStorage shuffle-bag (no-repeat) + cold-steering (Isa/Hagalaz/Nauthiz/Þurisaz). VHLED: per-čtení user-prompt injekci model POSLECHNE, system prompt IGNORUJE → `buildSysPromptV2` REDUNDANTNÍ (jen lab). Register/sezónní gold few-shoty ve VOICE_PROFILES.focused (cached).
- **Prompt caching:** claude-proxy base system prompt cache_control ephemeral. A/B/C dynamic context VYPNUTO (`ENABLE_DYNAMIC_CONTEXT=false`; funkce ponechány pro snadné zapnutí; response nevrací session_state). **Edge fce nutno deploynout po změně.**
- **Model B (RS free):** userFreeBalance z DB free_balance; drip/měsíční reset + mrtvý cluster SMAZÁNY; model-B copy (žádné "monthly"). BUG #1 (delete+re-register = 1 free znovu) PŘIJATO bez fixu.
- **UI/UX:** MY READING / FOR SOMEONE (_readingMode), Intention pills (**mood ODSTRANĚN** = dekorativní), mobilní 3+2 spread grid, no-duplicate runy v spreadech, name field optional (fallback you/þú §12, displayName()). §14 updateUIText() = jen statické překlady.
- **§18 anti-drift (2026-07-05, SW v133):** limit/error messaging 1 zdroj (`_readingErrMsg`, err_rate_limited/no_credits/generic), syncMonthlyCount→syncFreeBalance, 10 dead builder wrappers pryč, spread slot/output renderery konsolidovány (`_updateSpreadSlots`+cfg), BIRTH_MONTHS pack, `normalizeTier()`. Pozn.: monthly-cap enforcement není v proxy → err_monthly_limit branch smazán jako dead (re-add až bude cap).
- **Infra/tooling:** Shrine admin, Journal, Tree tab, Auth, Redeem. In-app reporter + `bug_reports` (⚑ modul). **GOTCHA:** Supabase anon `.upsert()` ≠ `.insert()` na RLS → pro insert-only tabulky plain insert + UNIQUE constraint na dedupe. smoke.py / check-is.py / check-translations.py; git pre-commit sw-bump; VOCAB helpery (vn/vl/vlp/tp).
- **Pricing:** kompletně přepočítán (measure_reading_costs.js), RS Model B, founding 5→2, předplatné=jednotky. Provozní náklady/daně/break-even v RUNAR_PRICING.md (~353 platících = 500k ISK/měs čistého). Native = Capacitor, platby na webu (Island EEA/DMA).

### Připraveno k implementaci (chybí logika/DB)
- detectPatterns(readings) — čeká na Tree implementaci
- tree_state + tree_readings DB tabulky — neexistují
- Gathering nová logika — data připravena, runar-gathering.js NAHRADIT
- Vizuální vrstva stromu (shimmer, glow, kořeny) — engine v LAB, nenapojen
- Zakládací rituál UI — Norns jako první session stromu (logika připravena, UI chybí)
- **Norns axis — produkce**: `_moodContext`/`_intentionContext` v runar-character.js (shared); produkční reading.js je nepoužívá — zapojit do builderů

### TODO
🔴 **Kritické (blokuje prodej):** Resend SMTP (magic link z agndofa.is) · Shopify webhook (auto upgrade po nákupu) · DPA Supabase (čeká na e-mail; přístup → RUNAR_PRIVACY.md)
🟡 **Důležité:** standard tier — způsob nákupu ("COMING SOON") + reálný checkout · Privacy Policy na agndofa.is (draft EN+IS + legal-basis = RUNAR_PRIVACY.md; IS→Sigrún, právní review) · runar-help.html inline JS (zbývající hardcoded strings) · **DB sloupec** `address_gender text default 'hk'` (owner v SQL editoru)
🟢 **Střední:** SSE streaming · Weekly drip odstranit z proxy · Shrine audit · **Eval Clarity v0.9 vs v0.8** (§18.4) — AŽ se nasbírají ostrá v0.9 čtení, pak A/B na ose „doručuje odpověď vs zaostřuje"; **NE syntetický eval** (KUKY 2026-07-14). Podklad = `readings.prompt_version` + Shrine Readings viewer

## Index souborů
- [working-style.md](working-style.md) — workflow pravidla, Python skripty, IS primární jazyk, verifikace, IS gramatika
- [is-done-together-not-for-sigrun.md](is-done-together-not-for-sigrun.md) — IS tvoříme rovnou pořádně + ověřujeme; NIKDY „draft pro Sigrún"
- [paste-sql-explicitly.md](paste-sql-explicitly.md) — když owner má spustit SQL, vlož přesné SQL do zprávy; žádné „jako minule"
- [proceed-dont-ask.md](proceed-dont-ask.md) — dohodnutý plán odjeď celý; neptej se „souhlas?" mezi kroky
- [one-patch-script-path.md](one-patch-script-path.md) — §1 patche VŽDY do `scripts/_patch.py`; nový název = nový permission prompt
- [bash-no-cd-prefix.md](bash-no-cd-prefix.md) — NIKDY `cd … &&` ani `| tail` na Bash; boří allowlist. Adresář drž jednou, příkazy holé; investigace přes Grep/Read/Glob
- [runar-project.md](runar-project.md) — stack, soubory, tier tabulka, DB schéma, edge functions
- [tree-of-life.md](tree-of-life.md) — Tree design (branch objekt, Gathering, AETTY, vizuál, Yggdrasil)
- [runar-patterns.md](runar-patterns.md) — Pattern detection design (ZASTARALÉ, probrat)
- **RUNAR_DECISIONS.md** (repo root) — append-only log architektonických rozhodnutí (§16 two-output rule)
- **RUNAR_PRIVACY.md** (repo root) — GDPR/data handling: legal-basis mapa (smlouva/opráv. zájem/souhlas), tester consent + privacy policy drafty (EN+IS→Sigrún), opt-out, `sql/2026-07-13_privacy_columns.sql`. Klíč: běžný user BEZ popupu (opráv. zájem+opt-out), souhlas jen testeři
- **RUNAR_SIGIL_STUDIO.md** (repo root) — standalone bind-rune (bandrún) maker. v0 MVP HOTOVO+OVĚŘENO 2026-07-06 (`build_sigil_lab.py` → `v2/sigil-lab/`). Spine-collapse engine, 6 pastí+fixů, 3 třídy run, engrave-first. NENÍ v produkci.
- **RUNAR_TREE.md** (repo root) — kanonický vstupní bod Tree of Life (duše + zóny + stavba + mapa doků).

## Tree session paměť (Code)
Frontmatter-paměť TREE session. Od 2026-07-04 sdílená s Cowork — obě platform složky jsou junction na `repo/memory/` (§17, jediný zdroj).
- [Rúnar Tree of Life engine — lab stav a rozhodnutí](runar-tree-engine-lab.md) — crown-composer báze (boughs přestavba = regrese), mock data, čeká na schválení
- [Rúnar kmen — přírůstkové změny, ne přepisy](runar-trunk-incremental-rule.md) — schválenou verzi měnit přírůstkově + snapshotovat před změnou
- [Rúnar strom — živý pohyb + model založení](runar-tree-living-movement.md) — Norns=kořeny, life rune=kmen, čtení=větev; větve se hýbou; Founding Ritual lab
- [IS gramatika — rod přídavného](is-grammar-adjective-gender.md) — nejdřív urči rod podstatného (frost=hk, súld=kvk), pak skloňuj

## Index snapshots (nejnovější = poslední)
- _Starší snapshoty (2026-05-30 → 2026-06-16): viz složka `snapshots/`._
- [snapshots/2026-06-16-reporter-operating-costs-coordination.md](snapshots/2026-06-16-reporter-operating-costs-coordination.md)
- [snapshots/2026-07-05-s18-drift-cleanup.md](snapshots/2026-07-05-s18-drift-cleanup.md) (limits messaging unified, dead model-A branches out, 8 §18 fixes, SW v133)
- [snapshots/2026-07-12-tree-production-admin-beta.md](snapshots/2026-07-12-tree-production-admin-beta.md) ← NEJNOVĚJŠÍ (Tree of Life v produkci, admin-only beta; oba bugy OPRAVENY: readings-load = špatný order sloupec created_at→drawn_at [3067af9], tree-name save = swap na read-only display [460b0f3], SW v170; commity LOKÁLNÍ, push čeká na svolení)

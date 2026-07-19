# RUNAR_BACKLOG.md
# Sledovaný seznam POZASTAVENÝCH věcí, ke kterým se máme vrátit.
# Pravidlo (owner 2026-07-04): co pozastavíme, sem zapíšeme + trigger návratu — ať nic nevisí bez povšimnutí.
# Hotové → odškrtnout a přesunout kontext do RUNAR_DECISIONS.md, nebo smazat řádek.

---

## Reading quality (audit 2026-07-04)

- [ ] **Vrstvy A/B/C re-enable** — vypnuto (`ENABLE_DYNAMIC_CONTEXT=false` v `supabase/functions/claude-proxy/index.ts`). Vrátit AŽ: (a) každá vrstva pohání reálné UI (tree memory, session mood, voice-scale slider), (b) projde IS evalem. Do té doby placené čtení jede jen na base promptu. Funkce buildTreeContext/deriveSessionState/buildSessionContext/buildVoiceContext ponechány.
- [~] **deeper_meaning re-add** — **ZRUŠENO (owner 2026-07-10):** B2 se dělat nebude, nahrazeno „Ask Rúnar" (viz Premium sekce). deeper_meaning zůstává zahozený. Parser `_parseSegments` je tolerantní (přečte `deeper_meaning` kdyby byl, ale buildery ho negenerují).
- [ ] **Mytologické obrazy (Óðinn/Nornir)** — byly v imagery katalogu voice profilu (seškrtán kvůli „1 zdroj obrazu"). Pokud je chceme zpět, přidat jako pool do `SEASON_POOLS` (NE zpět do profilu).
- [ ] **IS eval harness** — postavit: N čtení × runy/kontexty → grader (silný model + owner spot-check) → chybovost gramatika+koherence. Měřit PŘED/PO každé promptové změně. `runar-eval.yaml` zatím NEstavěn (DECISIONS 2026-07-04).
- [ ] **Reading-quality Fáze 4** — model tier pro IS (Opus) nebo 2-pass „IS korektor" průchod. JEN pokud eval po Fázi 1+2 ukáže zbytkové chyby. (Model = vyřešeno: Opus, viz DECISIONS 2026-07-04.)
- [x] **EN-polish pass** — HOTOVO + ZMĚŘENO (SW v119): zesílen `DEF_CHAR_EN.grammar` (banned-cliché list + hard one-image + read-over). Eval: clean-rate 13 %→13 % (nehnulo), ALE délka líp (over-length 6→2, ⌀42 slov). **Poučení: auto-grader je moc přísný na subjektivní styl** (sám hedguje „borderline/mild") → 13 % ≠ špatná čtení; skutečný soudce EN stylu = owner naživo, ne auto-eval. Blok nechán (neškodí, pomohl délce). Jediný reálný zbytek = multi-image (sezónní obraz přilepený navrch runového) = strukturální, ne cliché-list.

## Profil / personalizace

- [x] **Gender field** — HOTOVO (kód, SW v118): selektor Hann/Hún/Hán (kk/kvk/hk=hán default) v side panelu, jen IS; ÁVARP do všech 5 IS builderů; rule#5 skloňuje dle rodu. **Čeká jen DB sloupec:** `alter table user_profiles add column if not exists address_gender text default 'hk';` (owner v SQL editoru). Do té doby jede přes localStorage.
- [ ] **RUNAR_PRICING.md — model ref na Opus** — model čtení přepnut sonnet-4-5 → opus-4-8; cenový model může zmiňovat starý (delta zanedbatelný, hlas dominuje). Aktualizovat referenci.

## Multijazyčnost

- [ ] **EN parita + rozšiřitelnost** — každá reading-quality změna (grammar blok, lang-lock, intention gloss, few-shot, voice profil) musí být **per-jazyk**. Přidání Norštiny/Danštiny = nový `DEF_CHAR_XX` + voice profil `.xx` + `buildXxxPromptXX`, nic víc jinde. Owner directive 2026-07-04.

## i18n / prevence uvízlé angličtiny

- [ ] **data-i18n atributy (architektura)** — nejrobustnější prevence uvízlé angličtiny v IS: element si nese `data-i18n="key"`, generický loop v `updateUIText` aplikuje `t()` → wiring se **nedá zapomenout**. Dnes se dynamické stringy musí ručně napojit v `updateUIText`/render funkcích → snadné vynechat (série stuck-EN fixů 2026-07-06: reading form, greeting, teasery, mode buttons, „or", journal filtry…). Refaktor střední velikosti: data-i18n na statické UI + generický apply, postupně nahradit `setText` volání.
- [x] **i18n-diff nástroj** — HOTOVO (`scripts/i18n-diff.js`): runtime EN↔IS set-diff detektor uvízlé angličtiny. **Pouštět po větších UI/translation změnách** — jak vyvolat viz `working-style.md` (§ i18n kontrola).

## Struktura / refaktor

- [x] **Prompt unification** — HOTOVO (SW v124): 10 IS/EN builderů → 5 generických (`buildReadingPromptSingle`/`buildNornsPromptFate`/`buildKrizPromptCross`/`buildHorseshoePromptSeven`/`buildYggdrasilPromptNine`) + 5 `RP_*` packů. Golden-verified: IS byte-identický, EN jen kosmetická normalizace runesBlock. **Přidání jazyka = přeložit packy.** Golden harness v `scripts/golden/`. (Detail → DECISIONS 2026-07-04.)

## Premium features / Fáze B (tap UI, Ask Rúnar)

> Pozn.: Coworkův handoff `RUNAR_SEGMENTACE_FaseB_CODE.md` (07-07) předpokládá `deeper_meaning` v JSON — ale MAIN ho zahodil 07-04 (viz „deeper_meaning re-add" výše). B1 highlight ho NEpotřebuje; B2 ano. **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

- [x] **Fáze B1 — segment highlight** (owner vize 2026-07-10) — HOTOVO + OVĚŘENO (SW v165): ťuk na runu → její text-segment **zezlátne**, ostatní text **beze změny** (owner: žádné ztlumení, subtilní; „někdo si skoro nevšimne, to je cajk"). `_parseSegments` vrací `segs`; `_renderSegments` = per-runa spany (`.rseg data-seg`) po `stream()`; tap toggle v `runar-rune-popup.js`; CSS `.rseg.on{color:var(--gold)}`. Hlas beze změny (innerText netknutý), žádný náklad ani změna promptu. Jen spready (2+ run); single plain. Mapování dle POZICE (index) = robustní (řeší Kříž +1).
- [~] **Fáze B2 — deeper_meaning reveal** — **ZRUŠENO (owner 2026-07-10): nebudeme dělat.** Nahrazeno feature „Ask Rúnar" (níže) — organičtější a levnější způsob jít do hloubky (generuje se jen NA DOTAZ, ne pokaždé; čtení zůstane čisté). deeper_meaning zůstává zahozený.
- [~] **Ask Rúnar — follow-up otázka** (Premium, owner nápad 2026-07-10; NAHRAZUJE B2; feature spec = Coworkův `RUNAR_FEATURES.md`) — **v1 HOTOVO (SW v166): in-reader.** Premium user položí **JEDNU** otázku k výkladu → Q&A se **uzavře**. `buildAskPrompt`+`RP_ASK` (is/en), `askRunar()`+`_showAsk()` (Premium gate). Jen text, délka jako single, bez odečtu (Premium). **Scope-lock OVĚŘEN adversariálním evalem: 7/7, 0 leaks** (on-topic zodpoví; off-topic/jailbreak/language-switch/nový-spádóm odmítne v roli, zůstane islandsky) → **ship as-is, prompt netřeba ladit.** **Zbývá (v2):** journal 7-day okno + persistence (asked-flag, uložit Q&A) · víc eval coverage (combo re-draw próba) · účtování proti Premium stropu (až bude cap enforcement) · multi-turn (později). **Implementace = MAIN doména.** **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

## Launch blockers (z CLAUDE.md)

- [ ] Resend SMTP · Shopify webhook · Standard checkout


---

## AUDIT RESTŮ — 2026-07-14 (Workflow: 5 zdrojů → ověřeno proti repu + git logu)
# Zdroje: MEMORY TODO · RUNAR_DECISIONS reality-notes · privacy/backlog/tree docs · TODO v kódu · Cowork eval handoffy.
# Handoffy vytěžené sem → přesunuty do Cowork `archive/`. Zůstává: RUNE_IMAGE_POOLS_draft (vstup pro pool),
# RUNAR_SEGMENTACE_FaseB_CODE, RUNAR_IS_GRAMMAR_CHECK_CODE.

### 🔴 Blockery prodeje — OWNER (odloženo, trigger = **6. 9. 2026**, scheduled task `runar-launch-blockers-reminder`)
- [ ] **Resend SMTP** — magic link z agndofa.is (Resend účet + DNS SPF/DKIM + Supabase Auth). Rozhodnout adresu (runar@agndofa.is?).
- [ ] **Supabase DPA** — podepsat (čeká na e-mail).
- [ ] **Publikovat privacy policy** na agndofa.is + odkaz z appky. Text EN+IS hotový v `RUNAR_PRIVACY.md`. Bez publikace neplatí legitimate-interest model (transparentnost).
- [ ] **Právní/DPO review** (Island/EEA) IS textů + legal-basis modelu. `RUNAR_PRIVACY.md` je pracovní podklad, ne posudek.
- [ ] **Shopify webhook + checkout** — owner: webhook v Shopify admin + secret + mapa produkt→tier. CODE: edge fce (HMAC verify → `user_profiles.tier`) + odpojit „coming soon" stuby (`runar-auth.js:317-323`, `runar-app.js:1207-1208`, `runar-help.html:180`). Platby na webu (EEA/DMA).

### 🟠 CODE — odblokované, v pořadí
- [x] **Reading contract → 4 spready** — HOTOVO 2026-07-14 (commit 39bf41d, prompt v0.7, smoke ⑧ hlídá). Bylo: ← `_lensContext`/`_domainContext`/`_registerContext` se volají JEN v single (character.js:831-833). Spready dostanou holé labely („Seeking: Clarity") bez direktiv → SEEKING stance rule + Confirmation reframe (v0.6) na ně NEJDOU. Dodělává copy-doc #5.
- [x] **Monthly cap 50/75 v claude-proxy** — HOTOVO 2026-07-16 (1c584c3, SW v196). `MONTHLY_LIMITS` + `month_units`/`month_key` na user_profiles; reset porovnáním `month_key` (bez cronu). Ask Rúnar = NEpočítá se (není cast, `mode:'ask'`). Fail-open při chybě čtení počítadla. Smoke ⑨ hlídá config==proxy. SQL: `sql/2026-07-16_monthly_cap.sql`.
- [ ] **Vrátit `err_monthly_limit`** do `_readingErrMsg` — smazáno jako dead (2026-07-05); vrátit SPOLU s capem, jinak capnutý user dostane generickou chybu.
- [ ] **Image pool** `RUNE_IMAGE_POOLS` + `_runeImagery` (③, odblokované prompt_version). Vzor = `SEASON_POOLS`. Floor-not-ceiling, per-čtení user injekce. Single první → měřit → spready až podle dat. Důkaz: Isa 5/5 zamrzlá voda = vada zásoby. Obsah: `RUNE_IMAGE_POOLS_draft.md` (EN hotové, IS napíšeme + ověříme sami). **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [ ] **„already/þegar" ban** — nejlevnější fix (8×), motor cold-readingu. §19 past: výskyty v character.js jsou instrukce PRO model, ne output → ban musí mířit na output (prompt rule + output check), ne source ban.
- [ ] **IS ban-list (D-16)** — G1 v IS je neměřitelné (EN ban-list existuje, IS ne). Adaptovat EN + islandský kýč do IS grammar bloku.
- [ ] **No-recur regresní sada** — opravená model-output fráze se VRACÍ („Sittu með": F-001 ✗ · F-005 ✓ · F-006 ✗). Musí běžet nad OUTPUTEM (is-grammar-qa plocha), NE `check-is` (= source linter). Korpus už existuje (server-side save).
- [ ] **Obohatit řádek:** pořadí tažených run (strukturovaně — model může přeskládat sloty) + char_count. Potřebuje ALTER (owner).
- [ ] **Readings viewer: flag/annotate** — dnes view-only (`initReadingsTab` = prázdný stub). Potřebuje review tabulku (owner ALTER).
- [ ] **R1 ledger → i KOSTRY** (ne jen slova/obrazy) — Berkana 11:36 = nové obrazy, recyklovaná kostra; jmenný slot `[klauze], Kuky, [obraz]` identický všude. Váže se na pool architekturu SELECT→WRITE→CHECK.
- [ ] **is-grammar-qa nad uloženými IS výstupy** → E001 do pojmenované fronty (§19.2 žádné tiché zelené). Korpus existuje.
- [ ] **Zvětšit SEASON_POOLS** — sáček bere z JEDNÉ sady (bright NEBO cold), a ty jsou tenké: darkening/bright 5, autumn/cold 6. Při ~100 čteních/rok se protočí.
- [ ] **IS eval harness** (`runar-eval.yaml`) — N čtení → grader → error rate PŘED/PO každé změně promptu. Poučení: auto-grader je moc přísný na styl → tvrdě měřit jen objektivní věci (IS gramatika). Gatuje A/B/C re-enable + Fázi 4.
- [ ] **Report 3 odpovědí Coworku** (ověřeno, jen poslat): IS few-shoty JSOU islandské (`VOICE_PROFILES` config:392, `.is` bloky) · D-14 = jeden generický builder + RP_* packy · délky spreadů JSOU tvrdá čísla v `closing()`.

### 🟡 OWNER rozhodnutí
- [ ] **Přetížení čtení** — ~48 slov slouží SEDMI pánům (AoL·Seeking·Intention·Life Rune·jméno·závěrečná otázka), runa je 7. a prohrává. Follow-up má 2 pány → runa věrnější. Ubrat pány / udělat runu primární? Produktová volba.
- [ ] **G2b no-fate gate** — „only one has your name on the wind" prošlo všemi 7 gates. Částečně kryto `_describeRule` („no fate"), ale ne specificky „odpověď je VE SVĚTĚ". Nejdřív změřit v0.6 dávku.
- [ ] **Yggdrasil timing** — eval chytil 9-run spread v ČERVENCI; hard-blok mimo Dec 14–28 odstraněn (toast, SW v74), ale koncept = roční rituál. Celoročně + upravit framing, nebo re-enforce prosinec?
- [ ] **Retence čtení** — nerozhodnuto. Návrh: po dobu účtu; při zrušení smazat/anonymizovat pro eval. Blokuje konkrétní číslo v policy.
- [ ] **Living tree: sundat admin gate** (`runar-tree.js:47-50`) — až uznáš betu za hotovou.
- [ ] **runar-patterns.md** = ZASTARALÉ, „vše probrat" — refresh nebo retire (spec pro detectPatterns).
- [ ] **Mytologické obrazy** (Óðinn/Nornir) zpět? Cesta = nový pool v SEASON_POOLS, NE zpět do voice profilu.
- [ ] **Shrine audit** — bare TODO bez rozsahu; definovat nebo smazat.
- [ ] **Sigil Studio v0** — postavené+ověřené, ale nikde nestojí, že se má nasadit. Je to vůbec TODO?

### 🔵 COWORK
- [ ] **Další eval dávka: v0.6 vs v0.4** přes `prompt_version` (R1 + gate-fails zvlášť). Odemyká G2b.
- [ ] Rubrika v0.4→v0.5 (mobilní pravidla, NE repo).
- [x] **Tier jména — ROZHODNUTO** (KUKY 2026-07-18): Rune Seeker · Rune Walker · Rune Wanderer,
      IS Leitandi · Vegfarandi · Ferðalangur. Zdroj pravdy = `TIERS` v configu; „Rune Keeper" retired  <!-- doc-values:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
      (Keeper zůstává Rúnarovi). Zbývá jen dotáhnout label na ~10 místech v kódu (§13 full-path).
- [ ] Tree DB fáze 2 — přeškálovat: `intention` + `aol` už logujeme server-side (481d313, 094f287).

### 🟢 Dlouhý ocas (kód, nízká priorita)
- [ ] **§18 debt:** lab i prod drží kompozici stromu 2× (`build_tree_production.py`) → vytáhnout `runar-tree-core.js`. Prod navíc načítá enginy z `tree-lab-*` cest. *(soubor zatím neexistuje — je to cíl toho refaktoru)*  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [ ] Strom se **neaktualizuje po čtení** (`renderLivingTree` jen při otevření tabu).
- [ ] `tree_state`/`tree_readings` — `sql/tree_state.sql` je STARÉ schéma (Vrstva A) pro tree-update; produkční strom čte z `readings` → rozhodnout: rozšířit / nahradit / zahodit.
- [ ] `detectPatterns()` — motor Gatheringu, neimplementováno (čeká na patterns doc + tree_state).
- [ ] **Nahradit `runar-gathering.js`** + smazat mrtvý kód (modul + `<script>` + sw.js řádek pořád shipují; ř.60 hardcoded „COMING SOON" = §10).
- [ ] **`data-i18n` refactor** — nejrobustnější prevence zaseklé angličtiny (dnes ruční wiring v updateUIText).
- [ ] Ask Rúnar v2 — journal 7denní okno + asked-flag (persistence HOTOVÁ).
- [ ] Export dat subjektu (mazání už kaskáduje přes delete-account).
- [ ] Eval pipeline: pseudonymizace (opt-out exkluze HOTOVÁ).
- [ ] `_moodContext`/`_intentionContext` — zapojit intention, nebo smazat mood (mood z UI ODSTRANĚN, helper dřímá).  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [ ] Zahodit stale `_lastDeeper` + `deeper_meaning` extrakci (nikde se nečte; deeper_meaning zrušen 2026-07-04). Guard: `composeReading` musí zůstat zrcadlo `_parseSegments` (smoke ⑦).
- [ ] Segmentace Fáze B (tap UI / spread-map) — Fáze A hotová, spec `RUNAR_SEGMENTACE_FaseB_CODE.md`. **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [ ] Journal SPREAD historie renderuje font glyfy (single karty už SVG); shrine + yggdrasil.html obchází `runeSvg` (§5).
- [ ] Server-side no-repeat sáček (dnes localStorage = per-zařízení) — FÁZE 2, po poolu.
- [ ] A/B/C re-enable · EN polish pass · Fáze 4 (podmíněné) · sigil cut-out export · RUNAR_PRICING model ref (Sonnet→Opus 4.8) · smoke shorthand-check (chybí blocklist).

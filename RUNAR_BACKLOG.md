# RUNAR_BACKLOG.md
# Sledovaný seznam POZASTAVENÝCH věcí, ke kterým se máme vrátit.
# Pravidlo (owner 2026-07-04): co pozastavíme, sem zapíšeme + trigger návratu — ať nic nevisí bez povšimnutí.
# Hotové → odškrtnout a přesunout kontext do RUNAR_DECISIONS.md, nebo smazat řádek.

---

## Reading quality (audit 2026-07-04)

- [ ] **Vrstvy A/B/C re-enable** — vypnuto (`ENABLE_DYNAMIC_CONTEXT=false` v `supabase/functions/claude-proxy/index.ts`). Vrátit AŽ: (a) každá vrstva pohání reálné UI (tree memory, session mood, voice-scale slider), (b) projde IS evalem. Do té doby placené čtení jede jen na base promptu. Funkce buildTreeContext/deriveSessionState/buildSessionContext/buildVoiceContext ponechány.
- [~] **deeper_meaning re-add** — **ZRUŠENO (owner 2026-07-10):** B2 se dělat nebude, nahrazeno „Ask Rúnar" (viz Premium sekce). deeper_meaning zůstává zahozený. Parser `_parseSegments` je tolerantní (přečte `deeper_meaning` kdyby byl, ale buildery ho negenerují).
- [ ] **Mytologické obrazy (Óðinn/Nornir)** — byly v imagery katalogu voice profilu (seškrtán kvůli „1 zdroj obrazu"). Pokud je chceme zpět, přidat jako pool do `SEASON_POOLS` (NE zpět do profilu).
- [~] **IS eval harness** — **z vetsi casti STOJI** (audit 2026-07-19): `scripts/utils/gen_batch.js` jede pres realne produkcni buildery a zivy claude-proxy, vystup JSONL -> `is-grammar-qa.py`. Chybi uz jen: grader na KOHERENCI (dnes jen gramatika pres yfirlestur.is) a automaticke PRED/PO porovnani dvou davek. `runar-eval.yaml` se stavet NEBUDE (DECISIONS 2026-07-04) — nazev v teto polozce byl zastaraly.
- [~] **Reading-quality Faze 4** — model VYRESEN A NASAZEN (Opus 4.8, jednotny pro oba jazyky; fallback chain v claude-proxy). Otevrena zustava jen druha, PODMINENA varianta: 2-pass „IS korektor" pruchod, jen kdyby eval ukazal zbytkove chyby. = ceka na eval, ne na praci.
- [x] **EN-polish pass** — HOTOVO + ZMĚŘENO (SW v119): zesílen `DEF_CHAR_EN.grammar` (banned-cliché list + hard one-image + read-over). Eval: clean-rate 13 %→13 % (nehnulo), ALE délka líp (over-length 6→2, ⌀42 slov). **Poučení: auto-grader je moc přísný na subjektivní styl** (sám hedguje „borderline/mild") → 13 % ≠ špatná čtení; skutečný soudce EN stylu = owner naživo, ne auto-eval. Blok nechán (neškodí, pomohl délce). Jediný reálný zbytek = multi-image (sezónní obraz přilepený navrch runového) = strukturální, ne cliché-list.

## Profil / personalizace

- [x] **Gender field** — HOTOVO (kód, SW v118): selektor Hann/Hún/Hán (kk/kvk/hk=hán default) v side panelu, jen IS; ÁVARP do všech 5 IS builderů; rule#5 skloňuje dle rodu. **Čeká jen DB sloupec:** `alter table user_profiles add column if not exists address_gender text default 'hk';` (owner v SQL editoru). Do té doby jede přes localStorage.
- [ ] **RUNAR_PRICING.md — model ref na Opus** — model čtení přepnut sonnet-4-5 → opus-4-8; cenový model může zmiňovat starý (delta zanedbatelný, hlas dominuje). Aktualizovat referenci.

## Multijazyčnost

- [ ] **Tester tier — text-only + hlas po redeem** (KUKY 2026-07-19, blizka budoucnost). Testovaci ucty pro kamarady: textova cteni zdarma (setri EL rozpocet), hlas az po redeem kodu — stejne jako bezny rune_seeker. Zaklad UZ STOJI: sloupec is_tester (server-owned), edge funkce reset-tree (gate na is_tester), tester reset tlacitko ve strome. ZBYVA: (1) skryt hlas testerum defaultne (canUseVoice() ma vracet false pokud is_tester a nema redeem) — ⚠️ jen UI gate, EL_PROXY tier nezna, takze tester s konzoli si hlas pusti (jako u zakladani); tvrda ochrana rozpoctu az kdyz EL_PROXY dostane identitu cteni. (2) onboarding/pozvani pro tester ucty. (3) rozhodnout, jestli testeri maji vlastni monthly strop nebo neomezene.
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
- [ ] **Publikovat privacy policy na agndofa.is** — OWNER krok mimo repo. (Wiring v appce je HOTOVY: `v2/runar-privacy.html` je vysazena produkcni stranka EN+IS a odkaz z appky vede. Overeno 2026-07-19.) Bez publikace neplati legitimate-interest model.
- [ ] **Právní/DPO review** (Island/EEA) IS textů + legal-basis modelu. `RUNAR_PRIVACY.md` je pracovní podklad, ne posudek.
      ⚠️ **Na seznam k posouzeni patri i `credit_ledger`:** radky prezivaji smazani uctu. Muj zaver „je to v poradku, protoze klic je znicen" je TECHNICKY ROZBOR (delete-account nuluje `gift_codes.used_by` a kaskadou maze `user_profiles` i `readings`, takze UUID uz nejde spojit s osobou), NE pravni posudek.
- [ ] **Shopify webhook + checkout** — owner: webhook v Shopify admin + secret + mapa produkt→tier. CODE: edge fce (HMAC verify → `user_profiles.tier`) + odpojit „coming soon" stuby (`runar-auth.js:317-323`, `runar-app.js:1207-1208`, `runar-help.html:180`). Platby na webu (EEA/DMA).
      ⚠️ **SPOUSTEC pro GDPR prezkum:** objednavka nese e-mail I `user_id`, cimz OBNOVI mapovani UUID -> osoba. Zaver „radky v `credit_ledger` smi prezit smazani uctu" (RUNAR_PRIVACY.md, 2026-07-19) stoji prave na tom, ze po smazani uctu zadne mapovani nezbyde. Az bude Shopify, musi se ten zaver prezkoumat ZNOVU.

### 🟠 CODE — odblokované, v pořadí
- [x] **Reading contract → 4 spready** — HOTOVO 2026-07-14 (commit 39bf41d, prompt v0.7, smoke ⑧ hlídá). Bylo: ← `_lensContext`/`_domainContext`/`_registerContext` se volají JEN v single (character.js:831-833). Spready dostanou holé labely („Seeking: Clarity") bez direktiv → SEEKING stance rule + Confirmation reframe (v0.6) na ně NEJDOU. Dodělává copy-doc #5.
- [x] **Monthly cap 50/75 v claude-proxy** — HOTOVO 2026-07-16 (1c584c3, SW v196). `MONTHLY_LIMITS` + `month_units`/`month_key` na user_profiles; reset porovnáním `month_key` (bez cronu). Ask Rúnar = NEpočítá se (není cast, `mode:'ask'`). Fail-open při chybě čtení počítadla. Smoke ⑨ hlídá config==proxy. SQL: `sql/2026-07-16_monthly_cap.sql`.
- [x] **Vratit `err_monthly_limit`** — HOTOVO (overeno 2026-07-19, skeptik potvrdil cely retez): claude-proxy vraci `error:"monthly_limit"` -> `runar-reading.js` mapuje na `t('err_monthly_limit')` -> obe jazykove verze v translations existuji. Capnuty user dostane spravnou hlasku, ne generickou.
- [x] **Zivotni runa je NEMENNA** — HOTOVO 2026-07-19: SQL `sql/2026-07-19_life_rune_immutable.sql` PUSTENO ownerem (trigger `trg_life_rune_immutable` zamyka life_rune_* i dob_* pro roli authenticated). Admin reset tlacitko odstraneno cele (§13 full-path). Reset se dela SQL prikazem z konce te migrace. **Tim je odblokovane zlevneni Life Rune na 0.**
- [ ] **Evidence pohybu kreditu (ledger)** — dnes NEEXISTUJE, takze na otazku "strhl se mi kredit?" nejde odpovedet ani u vlastniho uctu; `credits_balance` ukazuje jen aktualni stav, ne historii. Narazil na to owner 2026-07-19 pri prvnim zdarma cteni zivotni runy. Resi ZAROVEN starsi ownerovo zadani (2026-07-16): "musi byt za pouziti kodu, ten kod by se mel nekde zapsat. neni kod neni kredit. nikdy to nebude vic nez prodavame." **Podminka: zapis do evidence musi byt ATOMICKY se zmenou zustatku** — evidence, ktera muze chybet, lze, a lziva evidence je horsi nez zadna, protoze se podle ni rozhoduje.
- [ ] **Image pool** `RUNE_IMAGE_POOLS` + `_runeImagery` (③, odblokované prompt_version). Vzor = `SEASON_POOLS`. Floor-not-ceiling, per-čtení user injekce. Single první → měřit → spready až podle dat. Důkaz: Isa 5/5 zamrzlá voda = vada zásoby. Obsah: `RUNE_IMAGE_POOLS_draft.md` (EN hotové, IS napíšeme + ověříme sami). **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [~] **„already/þegar" ban** — PROMPT PRAVIDLO HOTOVO (`_noColdRead`, miri na MOVE ne na slovo, zapojeno v 5 builderech + follow-up + zivotni runa). CHYBI druha pulka: kontrola nad model-OUTPUTEM. Dokud neni, nikdo nemeri, jestli to pravidlo funguje. §19: kontrola musi bezet na plose, kde bug zije = output, ne zdroj.
- [ ] **IS ban-list (D-16)** — G1 v IS je neměřitelné (EN ban-list existuje, IS ne). Adaptovat EN + islandský kýč do IS grammar bloku.
- [ ] **No-recur regresní sada** — opravená model-output fráze se VRACÍ („Sittu með": F-001 ✗ · F-005 ✓ · F-006 ✗). Musí běžet nad OUTPUTEM (is-grammar-qa plocha), NE `check-is` (= source linter). Korpus už existuje (server-side save).
- [ ] **Obohatit řádek:** pořadí tažených run (strukturovaně — model může přeskládat sloty) + char_count. Potřebuje ALTER (owner).
- [ ] **Readings viewer: flag/annotate** — dnes view-only (`initReadingsTab` = prázdný stub). Potřebuje review tabulku (owner ALTER).
- [~] **R1 ledger -> i KOSTRY** — konkretni dolozena vada je OPRAVENA (jmenny slot `[klauze], Kuky, [obraz]` -> pooled placement, commit 7dd1b9f + ending shape 1cf115c/57e8324). Zustava vlastni ask: rozsirit no-repeat LEDGER i na KOSTRY vet — dnes je kostra nahodna, bez pameti mezi ctenimi.
- [ ] **is-grammar-qa nad uloženými IS výstupy** → E001 do pojmenované fronty (§19.2 žádné tiché zelené). Korpus existuje.
- [ ] **Zvětšit SEASON_POOLS** — sáček bere z JEDNÉ sady (bright NEBO cold), a ty jsou tenké: darkening/bright 5, autumn/cold 6. Při ~100 čteních/rok se protočí.
- [ ] **Eval harness: dokoncit + ZACOMMITOVAT** — ⚠️ `scripts/utils/` NEBYL v gitu (zjisteno 2026-07-19). Cely eval harness (`gen_batch.js`) i `measure_reading_costs.js` existovaly jen lokalne, prestoze je RUNAR_DECISIONS.md cituje jako soucast repa. Jedno `git clean` = pryc. Zbyva: automaticke PRED/PO porovnani dvou davek (dnes se obe casti poustí rucne a nic je nesrovnava).
- [ ] **Report 3 odpovědí Coworku** (ověřeno, jen poslat): IS few-shoty JSOU islandské (`VOICE_PROFILES` config:392, `.is` bloky) · D-14 = jeden generický builder + RP_* packy · délky spreadů JSOU tvrdá čísla v `closing()`.

### 🟡 OWNER rozhodnutí
- [~] **Pretizeni cteni — 7 panu** — varianta „udelat runu primarni" JE implementovana (explicitni priorita + ustup life-rune linse). Varianta „ubrat pany" ne: v builderu porad stoji _lensContext/_domainContext/_registerContext/_endingShape vedle sebe. Zbyva PRODUKTOVE rozhodnuti, jestli ta priorita staci.
- [ ] **G2b no-fate gate** — „only one has your name on the wind" prošlo všemi 7 gates. Částečně kryto `_describeRule` („no fate"), ale ne specificky „odpověď je VE SVĚTĚ". Nejdřív změřit v0.6 dávku.
- [x] **Yggdrasil timing — ROZHODNUTO A DOTAZENO** (KUKY 2026-07-18: celorocne, kdykoliv, kdokoliv prihlaseny). Kodovy zbytek, ktery si rozhodnuti vyzadalo, byl 2026-07-19 dodelan: `SPREAD_CONFIG.yggdrasil.seasonal` („Dec 14-28 only") smazan z configu.  <!-- check-docs:ok 2026-07-19 cituje zrusenou datumovou branu jako ZRUSENOU; prave o jejim smazani ta polozka je --> Byla to mrtva data — nikdo je necetl, ale kdo config cetl, precetl si tam zrusene pravidlo. Presne proto to owner opravoval PETKRAT.
- [ ] **Retence čtení** — nerozhodnuto. Návrh: po dobu účtu; při zrušení smazat/anonymizovat pro eval. Blokuje konkrétní číslo v policy.
- [ ] **Living tree: sundat admin gate** (`runar-tree.js:47-50`) — až uznáš betu za hotovou.
- [ ] **runar-patterns.md** = ZASTARALÉ, „vše probrat" — refresh nebo retire (spec pro detectPatterns).
- [ ] **Mytologické obrazy** (Óðinn/Nornir) zpět? Cesta = nový pool v SEASON_POOLS, NE zpět do voice profilu.
- [ ] **Shrine audit** — bare TODO bez rozsahu; definovat nebo smazat.
- [ ] **Sigil Studio v0** — postavené+ověřené, ale nikde nestojí, že se má nasadit. Je to vůbec TODO?

### 🔵 COWORK
- [ ] **Eval davka: v1.0 kohorta vs v0.9** pres `prompt_version`. (Puvodni zneni „v0.6 vs v0.4" je ZASTARALE — ta davka se nikdy neodjela a verze mezitim projela pres v0.7/v0.8/v0.9 az na v1.0.) Infrastruktura STOJI: `readings.prompt_version` se uklada, cte to list-readings i gen_batch. Odemyka G2b (r. 80).
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
- [~] **Segmentace Faze B — zbytek** — B1 (tap -> segment zezlatne) HOTOVO a v produkci. B2 (deeper_meaning) ZRUSENO ownerem 2026-07-10. NEHOTOVO a nikde jinde nedrzene: „tap odhali VYZNAM POZICE" (popup dnes ukazuje jen jmeno runy + keywords, zadny nazev pozice ze SPREAD_CONFIG) a „geometrie per spread". Zadne datovane rozhodnuti to nerusi -> nemazat bez rozhodnuti ownera.
- [ ] Journal SPREAD historie renderuje font glyfy (single karty už SVG); shrine + yggdrasil.html obchází `runeSvg` (§5).
- [ ] Server-side no-repeat sáček (dnes localStorage = per-zařízení) — FÁZE 2, po poolu.
- [ ] A/B/C re-enable · EN polish pass · Fáze 4 (podmíněné) · sigil cut-out export · RUNAR_PRICING model ref (Sonnet→Opus 4.8) · smoke shorthand-check (chybí blocklist).

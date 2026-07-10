# RUNAR_BACKLOG.md
# Sledovaný seznam POZASTAVENÝCH věcí, ke kterým se máme vrátit.
# Pravidlo (owner 2026-07-04): co pozastavíme, sem zapíšeme + trigger návratu — ať nic nevisí bez povšimnutí.
# Hotové → odškrtnout a přesunout kontext do RUNAR_DECISIONS.md, nebo smazat řádek.

---

## Reading quality (audit 2026-07-04)

- [ ] **Vrstvy A/B/C re-enable** — vypnuto (`ENABLE_DYNAMIC_CONTEXT=false` v `supabase/functions/claude-proxy/index.ts`). Vrátit AŽ: (a) každá vrstva pohání reálné UI (tree memory, session mood, voice-scale slider), (b) projde IS evalem. Do té doby placené čtení jede jen na base promptu. Funkce buildTreeContext/deriveSessionState/buildSessionContext/buildVoiceContext ponechány.
- [ ] **deeper_meaning re-add** — zahozeno z JSON kontraktu (`[{rune, text}]`). Vrátit s **Fází B** (Premium tap #1 / spread-map). Parser `_parseSegments` tolerantní.
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

> Pozn.: Coworkův handoff `RUNAR_SEGMENTACE_FaseB_CODE.md` (07-07) předpokládá `deeper_meaning` v JSON — ale MAIN ho zahodil 07-04 (viz „deeper_meaning re-add" výše). B1 highlight ho NEpotřebuje; B2 ano.

- [ ] **Fáze B1 — segment highlight** (owner vize 2026-07-10) — ťuk na runu ve stripu → její text-segment **zezlátne**, ostatní ztlumené (opacity .38). Data UŽ existují (`[{rune,text}]` segmenty). **Prototyp OVĚŘEN:** `_proto_highlight.html` (repo root, standalone, gold+dim funguje). Čeká owner: „používat?". Produkční wiring: `_parseSegments` vrátit `segs` pole → per-segment spany (`.rseg data-seg`) v renderu (po `stream()`) → tap handler (rozšířit `runar-rune-popup.js`) → CSS. **Hlas beze změny** (innerText netknutý). Mapování dle POZICE (index) = robustní (řeší Kříž +1). Žádná změna promptu ani nákladu.
- [ ] **Fáze B2 — deeper_meaning reveal** (Premium) — NAVAZUJE na B1, TĚŽŠÍ. Vyžaduje: re-add `deeper_meaning` do builderů (extra generovaný text/runa; hlas 0 = `display:none`) + persistence `segments jsonb` (tree-aware, most na Fázi C) + tap → overlay panel. **Nejdřív ZMĚŘIT kvalitu deeper evalem** (distinktní, ne vata?). Gating (Cowork návrh B): highlight = Standard+, deeper = Premium. Rozhodnout AŽ po B1.
- [ ] **Ask Rúnar — follow-up otázka** (Premium, owner nápad 2026-07-10) — po čtení může Premium user položit otázku k tomu, co ho ve VÝKLADU zaujalo. Rúnar odpovídá **VÝHRADNĚ k danému runovému čtení** (scope-lock, ne obecný chat, ne nové věštění). Čtení je v journalu → jde se zeptat i **zpětně přes journal** (backup když appka spadne). Délka = jako single rune čtení. Vyladit prompt „jak Rúnar odpovídá v tomto režimu". Otevřené: voice ano/ne · limit počtu otázek/čtení (náklad) · single Q→A vs multi-turn.

## Launch blockers (z CLAUDE.md)

- [ ] Resend SMTP · Shopify webhook · Standard checkout

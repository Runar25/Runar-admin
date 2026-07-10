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

> Pozn.: Coworkův handoff `RUNAR_SEGMENTACE_FaseB_CODE.md` (07-07) předpokládá `deeper_meaning` v JSON — ale MAIN ho zahodil 07-04 (viz „deeper_meaning re-add" výše). B1 highlight ho NEpotřebuje; B2 ano.

- [x] **Fáze B1 — segment highlight** (owner vize 2026-07-10) — HOTOVO + OVĚŘENO (SW v165): ťuk na runu → její text-segment **zezlátne**, ostatní text **beze změny** (owner: žádné ztlumení, subtilní; „někdo si skoro nevšimne, to je cajk"). `_parseSegments` vrací `segs`; `_renderSegments` = per-runa spany (`.rseg data-seg`) po `stream()`; tap toggle v `runar-rune-popup.js`; CSS `.rseg.on{color:var(--gold)}`. Hlas beze změny (innerText netknutý), žádný náklad ani změna promptu. Jen spready (2+ run); single plain. Mapování dle POZICE (index) = robustní (řeší Kříž +1).
- [~] **Fáze B2 — deeper_meaning reveal** — **ZRUŠENO (owner 2026-07-10): nebudeme dělat.** Nahrazeno feature „Ask Rúnar" (níže) — organičtější a levnější způsob jít do hloubky (generuje se jen NA DOTAZ, ne pokaždé; čtení zůstane čisté). deeper_meaning zůstává zahozený.
- [ ] **Ask Rúnar — follow-up otázka** (Premium, owner nápad 2026-07-10; NAHRAZUJE B2; feature spec = Coworkův `RUNAR_FEATURES.md` / CONTEXT §6) — po čtení může Premium user položit **JEDNU** otázku k výkladu → pak se Q&A **uzavře**. Rúnar odpovídá **VÝHRADNĚ k danému runovému čtení** (scope-lock: off-topic jemně odmítne v roli, vrátí k runám; ne obecný chat, ne nové věštění). Vstup i z **journalu** — okno aktivní **max 7 dní** od čtení, jen pokud se ještě nezeptal (TBD možná míň). **Jen text** (hlas jen hlavní čtení = drahé). Délka jako single čtení; účtuje se jako single čtení proti Premium stropu (75, TBD). Vyladit: scope-lock prompt + Rúnarův Q&A hlas (úsečný, reflektivní, bez věštění, scoped) → eval. Single Q→A teď, multi-turn později. **Implementace = MAIN doména** (reading/prompt).

## Launch blockers (z CLAUDE.md)

- [ ] Resend SMTP · Shopify webhook · Standard checkout

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
- [ ] **Reading-quality Fáze 4** — model tier pro IS (Opus) nebo 2-pass „IS korektor" průchod. JEN pokud eval po Fázi 1+2 ukáže zbytkové chyby.

## Profil / personalizace

- [ ] **Gender field v profilu** — přidat pohlaví tazatele (`user_profiles` + UI + předat do promptu) → Rúnar správně skloňuje oslovovací tvary (einn/ein, tilbúinn/tilbúin, sjálfan/sjálfa). Dokud není: IS grammar pravidlo #5 = kynhlutlaust orðalag. Owner 2026-07-04.
- [ ] **RUNAR_PRICING.md — model ref na Opus** — model čtení přepnut sonnet-4-5 → opus-4-8; cenový model může zmiňovat starý (delta zanedbatelný, hlas dominuje). Aktualizovat referenci.

## Multijazyčnost

- [ ] **EN parita + rozšiřitelnost** — každá reading-quality změna (grammar blok, lang-lock, intention gloss, few-shot, voice profil) musí být **per-jazyk**. Přidání Norštiny/Danštiny = nový `DEF_CHAR_XX` + voice profil `.xx` + `buildXxxPromptXX`, nic víc jinde. Owner directive 2026-07-04.

## Struktura / refaktor

- [ ] **Prompt unification (Fáze 2 refaktor)** — reading prompt je rozprostřen přes 5 souborů + ~10 duplikovaných builderů (`buildReadingPromptIS/EN` + 4 spready ×IS/EN). Sjednotit: jeden „language pack" per jazyk (character / voice / grammar / angles / seasons / gloss / lock) + 2 generické buildery místo 10 → přidání jazyka = přeložit 1 pack, ladění IS = 1 místo. **DĚLAT AŽ PO evalu** (zlatý baseline výstupů → ověřit, že refaktor nemění výklad). Owner dotaz 2026-07-04.

## Launch blockers (z CLAUDE.md)

- [ ] Resend SMTP · Shopify webhook · Standard checkout

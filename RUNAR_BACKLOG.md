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

## Multijazyčnost

- [ ] **EN parita + rozšiřitelnost** — každá reading-quality změna (grammar blok, lang-lock, intention gloss, few-shot, voice profil) musí být **per-jazyk**. Přidání Norštiny/Danštiny = nový `DEF_CHAR_XX` + voice profil `.xx` + `buildXxxPromptXX`, nic víc jinde. Owner directive 2026-07-04.

## Launch blockers (z CLAUDE.md)

- [ ] Resend SMTP · Shopify webhook · Standard checkout

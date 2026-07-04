# RUNAR_DECISIONS.md
# Append-only log architektonických rozhodnutí.
# NIKDY nemazat záznamy — oprava = nový datovaný záznam.
# Přidává: Code (po implementaci) + Cowork (po designovém rozhodnutí).
# Formát: Datum · Typ · Co · Proč · Reality note · Reverzibilita

---

## 2026-06-07 — Trojice odstraněna, Norns = zakládací rituál

- **Typ:** intent + implementation
- **Co se změnilo:** Spread "Trojice" (3 runy Past/Present/Future) odstraněn z readeru a nahrazen "Norns" jako 3-rune zakládací rituál (Urðr/Verðandi/Skuld). Pozice mají jiný mytologický rámec.
- **Proč:** Trojice byla generická. Norns jsou mytologicky vlastní — tkají osud. Zakládací rituál = první session stromu, zasazuje kořeny.
- **Affected doc(s):** CLAUDE.md (spread tabulka), MEMORY.md
- **Reality note:** Spread ID = `norns`. `buildNornsPromptIS/EN()` v runar-character.js. Founding = Norns = 2 kredity. Žádná "Trojice" v produkci — kód ani texty.
- **Reversibility:** hard (nový spread = nový prompt builder + UI + translations)

---

## 2026-06-07 — Yggdrasil gate: všichni přihlášení (Dec 14–28)

- **Typ:** intent
- **Co se změnilo:** Yggdrasil (9 světů) byl Premium-only → zpřístupněn všem přihlášeným v okně Dec 14–28. RS platí kredity, Standard/Premium z měsíčního limitu.
- **Proč:** Vánoční ritual = dar pro celou komunitu. Exkluzivita by poškodila dojem.
- **Affected doc(s):** CLAUDE.md (spread tabulka)
- **Reality note:** Mimo Dec 14–28 funguje normálně (informativní toast, čtení projde). Gate dle `isYggdrasilActive()`.
- **Reversibility:** easy (přepnout gate zpět na tier check)

---

## 2026-06-12 — RS Model B: 1 free cast při registraci, žádný drip

- **Typ:** intent + implementation (one-way)
- **Co se změnilo:** Rune Seeker dostane 1 free cast při registraci (DB `free_balance` default 1). Žádný weekly drip, žádný měsíční reset. Pak vše za rune readings (kredity).
- **Proč:** Model A (weekly drip) byl složitý, motivoval ke čtení bez záměru. Model B = jasné: 1× ochutnat, pak platit. Fyzická cesta: Visitor 1 + Rune Card 1 + RS 1 = 3 celkem.
- **Affected doc(s):** CLAUDE.md, MEMORY.md, runar-translations.js (rs_banner texty)
- **Reality note:** `userFreeBalance` global z DB `free_balance`. Měsíční localStorage systém + drip = SMAZÁNY. 1 free MÁ hlas. Backend `weekly_limit` error → `no_credits`.
- **Reversibility:** hard (vyžaduje nový DB sloupec + reset logiku)

---

## 2026-06-14 — Kreditní škála: per typ čtení (ne per runa)

- **Typ:** intent + implementation (one-way)
- **Co se změnilo:** Předchozí model: 1 rune = 1 kredit (1/3/5/7/9). Nový model: cena per TYP čtení odvozená z nákladových poměrů = 1/2/3/4/5 (Single/Norns/Kříž/Horseshoe/Yggdrasil).
- **Proč:** Náklady jsou dominovány tokenem a ElevenLabs, ne počtem run. Horseshoe (7 run) stojí ~$0.143, Yggdrasil (9 run) ~$0.174 — poměr 1:1.2, ne 7:9. Jednotná marže ~98 %/kredit.
- **Affected doc(s):** RUNAR_PRICING.md, CLAUDE.md, runar-config.js (SPREAD_COSTS)
- **Reality note:** `SPREAD_COSTS` v runar-config.js = jediný zdroj pravdy. Life Rune = 3 kredity. Founding(=Norns) = 2 kredity. Předplatné počítá stejné jednotky. Worst-case = Single (358 zn/kredit = strop pro marži).
- **Reversibility:** hard (musí se změnit config + proxy + communications)

---

## 2026-06-12 — Sezónní obraznost: per-čtení user-prompt injekce (ne system prompt)

- **Typ:** implementation (architectural insight)
- **Co se změnilo:** Sezónní paleta (`_seasonalImagery`) injektována do per-čtení user promptu — NE do system promptu.
- **Proč:** Testování prokázalo: model user-prompt POSLECHNE, system-prompt při sezónní instrukci IGNORUJE. buildSysPromptV2 (contextual intelligence v system promptu) = redundantní, do produkce NEDÁVAT.
- **Affected doc(s):** CLAUDE.md (Reading systém sekce)
- **Reality note:** `_seasonalImagery(lang, drawn)` v runar-character.js, volá se v každém buildXxxPromptIS/EN. `SEASON_POOLS` = 6 sezón × bright/cold pool. localStorage shuffle-bag (no-repeat). Cold-steering pro Isa/Hagalaz/Nauthiz/Þurisaz. Reader = `buildSysPrompt` (ne V2).
- **Reversibility:** easy (přepnout volání)

---

## 2026-06-14 — Mood field odstraněn z produkčního readeru

- **Typ:** intent (one-way pro UX)
- **Co se změnilo:** "HOW ARE YOU FEELING?" pill group smazán z readeru. `_moodContext()` v runar-character.js zůstává, ale je dormantní (no-op, Norns-osa jej nepoužívá).
- **Proč:** Mood byl dekorativní — nedával čtení hlubší kontext, jen přidával friction. Intention zůstává (dává reálný kontext).
- **Affected doc(s):** CLAUDE.md (Reading systém)
- **Reality note:** `_moodContext()` = dead code v produkci. Překlady 175→174 klíčů. Shrine má stále vlastní verzi.
- **Reversibility:** medium (UI přidat zpět, zapojit do builderů)

---

## 2026-06-09 — Native app: Capacitor, subscriptions na webu

- **Typ:** intent (strategické)
- **Co se změnilo:** Platby zůstávají na webu (ne IAP). Island = EEA → DMA umožňuje external purchase link. App Store cut = 0 %. Cesta do App Storu = Capacitor (wrapper existujícího HTML/JS/CSS).
- **Proč:** Island 70 % iOS. App Store = primární akviziční kanál, ne bonus. Capacitor = nejlevnější cesta bez přepsání kódu. Push notifikace nejsou driver (email pokrývá).
- **Affected doc(s):** RUNAR_PRICING.md (§ PWA vs Native), MEMORY.md
- **Reality note:** Zatím neimplementováno — Capacitor je launch blocker (jít do App Store dřív než později, po polish webu). $99/rok Apple, $25 jednou Google. Subscriptions platit na runar25.github.io.
- **Reversibility:** n/a (není ještě v kódu)

---

## 2026-06-17 — Segmentace Fáze A: single → JSON, deeper_meaning hidden

- **Typ:** implementation
- **Co se změnilo:** Single prompt (EN+IS) vrací JSON `[{rune, text, deeper_meaning}]`. reading.js `_parseSegments` složí text pro display + hlas (BEZE ZMĚNY UX). `deeper_meaning` drží jen v paměti (`_lastDeeper`), nezobrazuje se, neukládá.
- **Proč:** Segmentace = základ pro Fázi B (tap UI = Premium #1) + spread map. deeper_meaning = skrytá vrstva — dokud není UI, zbytečné ji ukládat nebo zobrazovat.
- **Affected doc(s):** CLAUDE.md (Reading systém — TODO přidat)
- **Reality note:** Multi-rune NETKNUTÉ. Robustní parse (strip code-fence, fallback=raw). 4/4 live čtení = validní JSON, flow/register drží. Fáze B = tap UI + spread-map (neimplementováno).
- **Reversibility:** easy (fallback=raw je v parseru)

---

## 2026-07-03 — Doc sync protokol: RUNAR_DECISIONS.md + two-output rule

- **Typ:** intent (workflow)
- **Co se změnilo:** Přidán RUNAR_DECISIONS.md jako append-only log rozhodnutí. Two-output rule: každý task = Output A (práce) + Output B (znalostní delta). Reconciliation check = owner-triggered, one-file audit.
- **Proč:** Decision drift + implementation drift — rozhodnutí umírají v chatu kde Code nevidí. Viz RUNAR_DOC_SYNC.md (návrh).
- **Affected doc(s):** working-style.md (two-output rule), CLAUDE.md (TODO: přidat jako §16)
- **Reality note:** RUNAR_DECISIONS.md = tento soubor. Two-output rule v working-style.md. Otevřené otázky pro Code → viz RUNAR_DOC_SYNC_CODE.md.
- **Reversibility:** easy (jen disciplína, ne kód)

---

## 2026-07-04 — Doc sync: Code zodpověděl 5 otázek + §16 aplikováno

- **Typ:** intent (workflow) + implementation
- **Scope:** infra
- **Co se změnilo:** Code zodpověděl 5 open otázek z RUNAR_DOC_SYNC_CODE.md. Aplikováno: **§16** do CLAUDE.md (two-output rule + Reconciliation protokol) + **NEblokující §16 reminder** do smoke.py (staged JS bez DECISIONS → připomínka). Rozhodnuto: log = single file + volitelný `Scope:` tag · Reality-note = free text (6 polí) · `runar-eval.yaml` NESTAVĚN · Reconciliation trigger = fráze „Reconciliation: <scope>".
- **Proč:** Zavřít doc-sync smyčku bez křehkého hard-hooku (timestamp≠content, false-positive na refactor). Human-judgment (§16) > dumb automation. Owner schválil aplikaci.
- **Affected doc(s):** CLAUDE.md (§16), smoke.py, RUNAR_DOC_SYNC_CODE.md (→ docs/archive/)
- **Reality note:** CLAUDE.md má §16. `smoke.py` na konci tiskne §16 připomínku (try/except přes `git diff --cached`, neovlivňuje exit code). Shorthand-check NEPŘIDÁN — chybí definovaný blocklist přezdívek (TODO owner/Cowork; lore Yggdrasil/Norns/Gammur/Níðhöggr/Ratatoskr NENÍ shorthand). RUNAR_DOC_SYNC_CODE.md (s odpověďmi) přesunut do docs/archive/.
- **Reversibility:** easy (§16 = instrukce; reminder = smazat blok v smoke.py)

---

## 2026-07-04 — Single source of truth = git repo (zero-gap Cowork↔Code)

- **Typ:** intent (architektura + workflow, one-way)
- **Scope:** infra
- **Co se změnilo:** Zrušena tříúložišťová fragmentace sdílených doc (AppData\memory + Cowork zrcadlo + git repo). Nový model: **jediný zdroj pravdy = git repo `Downloads\Runar-admin`** — jediná plocha, kterou vidí Cowork i Code (Cowork ji má namountovanou = fyzicky TÁŽ složka jako Code; zápis je okamžitě viditelný oběma). Do repa migrovány: MEMORY.md, working-style.md, runar-project.md, snapshots/ (27). AppData\memory + Cowork složka = deprecated (nanejvýš auto-generovaná read-only kopie, NIKDY ručně needitovat). sync-to-cowork.py = retire.
- **Proč:** AppData i Cowork zrcadlo jsou Cowork-only → Code do nich nikdy nevidí → nemůžou být „zero-gap s Code". Fragmentace už způsobila reálné mezery: Code neviděl MEMORY.md / working-style.md / runar-project.md; Cowork přes zrcadlo neviděl RUNAR_DECISIONS.md; snapshots rozjeté (AppData 27 / Cowork 7 / repo 0). Owner (KUKY) zvolil „repo = jediný zdroj".
- **Affected doc(s):** CLAUDE.md (sekce „Cowork sync" → nahradit §17), MEMORY.md (kopie do repa), sync-to-cowork.py (retire), RUNAR_DECISIONS.md (tento záznam)
- **Reality note:** Soubory nakopírovány do repa jako **untracked** (working-style/runar-project/snapshots ověřeny cmp=identické; MEMORY.md host-direct přes Read/Write + Edit oprava tailu, protože bash mount servíroval zastaralý 185-řádkový view po Edit zápisech). **git commit/push NEPROVEDEN** — repo měl při migraci velký rozpracovaný strom (Code aktivní: M na CLAUDE.md, v2/*.js, supabase funkcích…) + `git index.lock`, který sandbox nemohl odstranit → „neforcuj" pravidlo. Commit `[docsync]` čeká na čistý strom / koordinaci s Code. **CLAUDE.md §17 zápis ODLOŽEN** ze stejného důvodu (CLAUDE.md je dirty + Code může mít otevřený buffer → riziko clobberu).
- **Reversibility:** medium (untracked soubory lze smazat; dokud není commit, v gitu nic není)

**§17 — Single source = repo (návrh znění pro CLAUDE.md, zapsat až bude strom čistý):**
1. Jediný zdroj pravdy pro VŠECHNY sdílené doc (MEMORY.md, working-style.md, runar-project.md, RUNAR_*.md, tree-of-life.md, runar-patterns.md, snapshots/) = git repo `Downloads\Runar-admin`. Cowork i Code editují přímo tam.
2. AppData\memory a Cowork složka NEJSOU zdroj — buď zrušené, nebo jen auto-generovaná read-only kopie; ručně je NIKDY needitovat.
3. Každá změna doc = malý commit + push IHNED (prefix `[docsync]`), aby druhá strana po `git pull` viděla vše. Žádná stranou ležící ruční kopie.
4. sync-to-cowork.py = retired (zrcadlo zrušeno).

---

## 2026-07-04 — Doc-sync handoff DOKONČEN (Code)

- **Typ:** implementation (workflow)
- **Scope:** infra
- **Co se změnilo:** Code dokončil `docs/DOCSYNC_HANDOFF_2026-07-04.md`: (1) doc soubory (MEMORY.md, working-style.md, runar-project.md, RUNAR_DECISIONS.md, snapshots/ ×27, docs/handoff) commitnuty do repa (commit `877f8ab`, push na `main`). (2) §17 vepsán do CLAUDE.md (ABSOLUTNÍ PRAVIDLA, u §16). (3) sekce „## Cowork sync" v CLAUDE.md zrušena (§17 ji nahrazuje).
- **Proč:** Zavřít docsync smyčku — repo = jediný zdroj; Cowork po `git pull` vidí §17 i doc soubory.
- **Affected doc(s):** CLAUDE.md (§17 + zrušena Cowork sync), tento záznam
- **Reality note:** Doc soubory v gitu (`main` @ `877f8ab`). CLAUDE.md má §16 + §17. `sync-to-cowork.py` NENÍ v repu (find nenašel nikde) → krok „retire" fakticky N/A pro repo. Stará `.git/index.lock` (0 B, po neúspěšném Cowork commitu, žádný git proces neběžel) odstraněna. **OTEVŘENÁ owner-otázka:** platform memory (`AppData\Roaming\Claude\memory`) — chce repo→AppData read-only auto-kopii, nebo AppData úplně zrušit? Teď identické, nehoří.
- **Reversibility:** easy (doc commity revertovatelné; §17 = instrukce)

---

## 2026-07-04 — Reading-quality audit: osekání constraint stacku (Fáze 1)

- **Typ:** intent + implementation
- **Scope:** reading
- **Co se změnilo:** Audit (4-agent fan-out) odhalil, že na 1 IS single výklad se skládá ~27 instrukcí, na placené +~8 serverových = ~35 souběžných pokynů, mnoho si přímo odporuje → gramatické chyby + občas nesrozumitelné výklady. Owner (KUKY) schválil osekání. **HOTOVO tento turn:** (1) `deeper_meaning` **zahozeno** z JSON kontraktu (single + 4 spready ×EN/IS) — generovalo se ke každé runě a zahazovalo (`_lastDeeper` jen v paměti). Kontrakt → `[{rune, text}]`. (2) **Vrstvy A/B/C vypnuty** v claude-proxy (`ENABLE_DYNAMIC_CONTEXT=false`) — tree memory / session state / voice scale stackovaly ~8 konfliktních tónových direktiv na placená čtení (např. „come as fire" z kalendářní rotace vs zimní sezónní obraz; voice-scale „pure metaphor" vs základní „jeden obraz, přímo"). **ČEKÁ NA SCHVÁLENÍ IS** (owner = jazyková autorita): generativní IS gramatický blok do system promptu, IS-zámek („Svaraðu á íslensku"), oprava rozbitých zdrojových stringů (fornar norræns heimsins → forns norræns heims; beindur að; rúnaformúll → rúnaformúla), 2.os. few-shot, seškrtání imagery katalogu z voice profilu (1 zdroj obrazu = sezónní).
- **Proč:** Constraint overload + žádná explicitní IS gramatika v promptu (jediné pravidlo osoby dá „použij þú" bez časování) + angličtina roztroušená v celo-IS promptu bez IS-zámku + prompt sám učí špatnou IS. Corrections dict = reaktivní náplast (nechytí nový tvar). Cíl: opravit u kořene + **změřit (IS eval)**, ne whack-a-mole.
- **Affected doc(s):** RUNAR_SEGMENTATION_SPEC.md (deeper_meaning note), CLAUDE.md (Reading systém — délky/JSON až po IS fázi), tento záznam
- **Reality note:** deeper_meaning: `runar-character.js`, 10 JSON output instrukcí → `[{rune, text}]`; parser tolerantní. A/B/C: `supabase/functions/claude-proxy/index.ts`, flag `ENABLE_DYNAMIC_CONTEXT=false` (funkce buildTreeContext/deriveSessionState/buildSessionContext/buildVoiceContext ponechány pro snadné zapnutí); response už nevrací `session_state` (frontend ho nečte). **Edge funkci NUTNO NASADIT** (`supabase functions deploy claude-proxy`). IS gramatický blok + eval harness = TODO (další turn po IS schválení).
- **Reversibility:** easy (deeper_meaning i A/B/C = flag/revert; parser fallback drží)

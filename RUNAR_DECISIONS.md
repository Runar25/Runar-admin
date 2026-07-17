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

---

## 2026-07-04 — Platform memory: junction na repo/memory (owner-schváleno)

- **Typ:** implementation (infra)
- **Scope:** infra
- **Co se změnilo:** Uzavřena otevřená owner-otázka z docsync handoffu. Owner (KUKY): „udělej to čistě a hotové jednou provždy, oba (Code i Cowork) musí vědět co se děje jinde." Řešení = **junction, ne kopie**. (1) Sdílená auto-paměť přesunuta do `repo\memory\` (git mv: MEMORY.md, working-style.md, runar-project.md, snapshots/ ×27) + přidány 4 frontmatter tree paměti Code (dřív jen v `.claude`, Cowork je neviděl) + `README.md` + `relink-memory.ps1`. (2) OBĚ platformní pamětové složky (`AppData\Roaming\Claude\memory` = Cowork, `.claude\projects\C--Users-zkuku\memory` = Code) jsou teď **junction na `repo\memory\`** → oba agenti fyzicky čtou i píší stejné soubory, git verzuje, žádný sync skript, žádný drift. (3) §17 v CLAUDE.md přepsán na junction architekturu. (4) memory/MEMORY.md dostal sekci „Tree session paměť (Code)".
- **Proč:** Tři oddělená úložiště (Code `.claude`, Cowork `AppData`, repo) → každý agent slepý k druhému (Cowork neviděl tree paměti, Code neviděl velkou MEMORY.md). Junction = jedna fyzická složka pod gitem = „both know what's happening" bez ručního syncu, trvale.
- **Affected doc(s):** CLAUDE.md (§17), memory/MEMORY.md (Tree sekce), memory/README.md (nový), memory/relink-memory.ps1 (nový)
- **Reality note:** Ověřeno: `Get-Item .LinkType = Junction`, Target = `…\Runar-admin\memory` pro obě cesty; live obousměrný zápis (zápis přes AppData složku se objeví v repu i v `.claude` složce, smazání taky). Staré skutečné složky zazálohovány jako `…memory.bak-20260704-150012` (lze smazat po ověření). CWD Claude Code = `C:\Users\zkuku` → junction cesta `.claude\projects\C--Users-zkuku\memory` platí pro tenhle CWD. Když app složku někdy přepíše (update/clear) → junction se rozbije, oprava = `memory\relink-memory.ps1` (idempotentní, zálohuje).
- **Reversibility:** easy (smazat junction přes `rmdir`, obnovit z .bak nebo z gitu)

---

## 2026-07-04 — Reading-quality Fáze 1 IS+EN: gramatický blok + gloss + voice trim (DOKONČENO)

- **Typ:** implementation
- **Scope:** reading
- **Co se změnilo:** Dokončeny IS-schválené položky z Fáze 1 (viz záznam „osekání constraint stacku"), pro OBA jazyky (owner directive: vše i pro EN + rozšiřitelné na NO/DA). (1) **Per-jazyk `grammar` field** na `DEF_CHAR_IS`/`DEF_CHAR_EN`, vložen do `buildSysPrompt` → pokrývá VŠECHNY buildery (single + spready). IS blok: 2. os. et. časování, shoda lýsingarorð (kyn/tala/fall), zákaz enskusletta, fallstjórn, závěrečné čtení + IS-zámek. EN blok lehčí + EN-zámek. (2) **Opravy rozbitých zdrojových stringů** (hins forna norræna heims, ópersónulegt, rúnaþula, áhersla). (3) **Intention gloss** `_intentionContext` → prostý čitelný časový rámec per-jazyk (dřív EN vložená do IS promptu, nesrozumitelná). (4) **Voice profil**: seškrtán imagery katalog (SEASON_POOLS = jediný zdroj obrazu, konec 3-zdrojové kolize) + přidán 2.-osobový few-shot (jediný příklad byl 3. os.). Owner ověřil naživo srovnávací ukázkou (Berkana × 3 přadleny/časy v IS).
- **Proč:** Kořenové příčiny z auditu: žádná explicitní IS gramatika, EN roztroušená v IS promptu, prompt učí špatnou IS, 3–5 zdrojů obrazu o 45 slov. Řešeno u kořene (pravidla, ne fráze) + per-jazyk (rozšiřitelné).
- **Affected doc(s):** RUNAR_BACKLOG.md (EN parita), tento záznam
- **Reality note:** `runar-character.js` (DEF_CHAR_IS/EN.grammar, buildSysPrompt wire, _intentionContext) + `runar-config.js` (VOICE_PROFILES.focused .is/.en). FRONTEND → live po SW refreshi (v115), BEZ edge deploye. Přidání jazyka = nový DEF_CHAR_XX + voice profil .xx. **ZBÝVÁ:** IS eval (backlog) — změřit dopad; produkční měření vyžaduje živé readingy (model = sonnet-4-5).
- **Reversibility:** easy (grammar field guarded `base.grammar ?`; catalogue/few-shot = git revert)

---

## 2026-07-04 — Reading model → Opus 4.8 + eval + pravidlo o rodu

- **Typ:** intent (model/pricing) + implementation
- **Scope:** reading
- **Co se změnilo:** (1) **Produkční model čtení `sonnet-4-5` → `opus-4-8`** (`claude-proxy/index.ts`). Owner: „potřebujeme kvalitní IS". Nasazeno (`supabase functions deploy claude-proxy`), ověřeno health-checkem (Opus vrátil čistou IS: „Fehu kennir þér að auður er til að deila og nýta…"). (2) **Design-eval** (15 IS čtení × runy/časy → adversariální IS grader): round 1 = **73 % clean** (11/15); 2. osoba (treystar/nær/sér) = **0 chyb** → grammar blok funguje. Zbytek: rod oslovovaného (nový nález), 1× shoda (bjart→bjarta), 1× kalk (án vera), 1× pád (næra+þf). (3) **Pravidlo o rodu** (#5) přidáno do IS grammar bloku — model mísí einn/ein, tilbúinn/tilbúin (nezná pohlaví tazatele); default = kynhlutlaust orðalag. **Round 2 = 67 % clean** (statisticky v šumu round 1 na 15 vzorcích); gender rule snížil, ale NEeliminoval rod (Mannaz „sjálfum þér" stále mužský) → **potvrzeno, že gender field je skutečný fix**. Hlavní zbytek = shoda ženských nafnorð (nótt/rót), v evalu nafouknutá přepálením obrazu „sumarnótt" (produkce vynucuje pestrost přes shuffle-bag).
- **Proč:** Kvalita IS = priorita. Opus je materiálně lepší na low-resource islandštinu; nákladový dopad zanedbatelný (per-čtení dominuje ElevenLabs hlas, ~$0.01 delta modelu). Eval = měřit místo hádat; navíc teď prod=Opus → eval (Opus-generovaný) je reprezentativnější.
- **Affected doc(s):** RUNAR_PRICING.md (model ref — backlog, delta zanedbatelný), RUNAR_BACKLOG.md (gender field), tento záznam
- **Reality note:** `index.ts` model = `claude-opus-4-8`, nasazeno na produkci (Docker warning OK, použit API bundler). IS grammar blok má teď 6 pravidel (rod = #5, read-over = #6). Produkční baseline chybovosti stále = owner live test.
- **Reversibility:** easy (model string revert + redeploy; gender rule = git revert)

---

## 2026-07-04 — Gender field (moderní islandština): jak Rúnar oslovuje

- **Typ:** intent + implementation
- **Scope:** reading + profil
- **Co se změnilo:** Per-tazatel „address gender" — jak Rúnar oslovuje v IS: **kk (Hann) / kvk (Hún) / hk (Hán = hvorugkyn, moderní nebinární/neutrální DEFAULT)**. Owner: „udělej podle moderní islandštiny." Side-panel selektor (Hann/Hún/Hán), zobrazen JEN v IS; persist localStorage + `user_profiles.address_gender` (default hk). `_addressContext()` injektuje řádek ÁVARP do všech 5 IS builderů (single + 4 spready); grammar pravidlo #5 teď skloňuje VŠE o „þú" dle zvoleného rodu (místo vyhýbání). EN nepotřebuje nic.
- **Proč:** Eval (R1/R2) ukázal, že samotné pravidlo „vyhýbej se rodu" nedotáhlo to (model mísil einn/ein). Skutečný fix = uživatel zvolí + skloňovat důsledně. Hvorugkyn/hán = zavedená moderní IS nebinární forma.
- **Affected doc(s):** RUNAR_BACKLOG.md (gender field hotovo), tento záznam
- **Reality note:** `runar-character.js` (_addressContext + 5 injekcí + rule#5), `runar-app.js` (userGender state, load/save, setGender, pills, IS-only visibility, init), `runar-reader.html` (sp-gender-section), `runar-translations.js` (sp_gender_lbl, 197 klíčů). FRONTEND, SW v118. **DEPLOY-SAFETY:** `address_gender` NENÍ v hlavním profil selectu (jinak by chybějící sloupec rozbil load tier/jméno/kreditů); jede přes localStorage + separátní best-effort DB dotaz. **NUTNÝ DB SLOUPEC** (owner v SQL editoru, anon/publishable klíč neumí ALTER): `alter table user_profiles add column if not exists address_gender text default 'hk';`
- **Reversibility:** medium (revert kódu; DB sloupec nechat/dropnout)

---

## 2026-07-04 — Model head-to-head: ZŮSTAT na Opus 4.8 (Sonnet 5 zamítnut)

- **Typ:** intent (rozhodnutí z měření)
- **Scope:** reading
- **Co se změnilo:** NIC v kódu — rozhodnuto ZŮSTAT na `claude-opus-4-8` pro čtení. Podnět: Sonnet 5 vyšel s úvodní cenou ($2/$10 do 31.8., pak $3/$15) vs Opus 4.8 ($5/$25) → kandidát na levnější model. Head-to-head eval (15 IS čtení × 2 modely, stejný grader): **remíza na kvalitě — oba 53 % clean (8/15)**, stejný profil chyb. Sonnet 5 navíc (a) občas vymýšlí neexistující tvary („hánu", „hánsumri"), (b) psal **~37 % delší** čtení (277 vs 202 znaků).
- **Proč:** (1) Kvalita IS = remíza → přepnutí nemá quality upside. (2) **Cena: model je ~1-2 % per-čtení nákladu; dominuje ElevenLabs hlas (per-znak).** Sonnet 5 psal delší → prodraží HLAS o ~37 % → net spíš DRÁŽ, ne levněji. „2,5× levnější výstup" platí jen na tokenech modelu (šum). Skutečná páka na náklady = hlas, ne model.
- **Affected doc(s):** tento záznam (uzavírá otázku Sonnet 5)
- **Reality note:** Eval = Workflow (ne runar-eval.yaml, ten NEexistuje). Grader = Opus, 15 vzorků (šum), prompt „vyhýbej se rodu" (ne gender field) → eval podceňuje produkční kvalitu (produkce má gender field). Kdyby se v budoucnu řešil cost, cílit hlas (délka čtení / ElevenLabs tier), ne model.
- **Reversibility:** easy (kdykoli přepnout model string + redeploy, když se objeví lepší/levnější kandidát; měřit stejným head-to-head)
- **EN potvrzení (dodatek):** Head-to-head i na ANGLIČTINĚ (15 EN čtení × 2 modely). **Opus lepší i v EN** — 13 % vs 0 % clean, míň chyb v KAŽDÉ kategorii (klišé 15 vs 20, více-obraz 10 vs 12, over-length 6 vs 7), délka 44 vs 46 slov. Délková výhoda Opusu platí v obou jazycích (velká v IS: 202 vs 277 zn.; malá v EN: 44 vs 46 slov). → **Jednotný Opus pro oba jazyky potvrzen, žádný per-jazyk split.** Vedlejší nález: EN generování sklouzává do klišé/více-obrazů víc než IS (model-nezávislé, jiná brána) → případný EN-polish pass (backlog).

---

## 2026-07-04 — Tree: boughs přestavba = regrese, zůstat na crown-composeru

- **Typ:** intent (tree design — směrová lekce)
- **Scope:** tree
- **Co se změnilo:** Směr „přestavět strom na hierarchii ramen (boughs)" jako VELKÁ přestavba = zamítnut. `RUNAR_TREE_BOUGHS.md` (schváleno 17.6.) zůstává jako CÍL konceptu (runa = větev, síla = počet čtení), ale CESTA přes zone-blend se zkoušela a **zregresovala** → zpět na crown-composer, jen jemné přírůstky.
- **Proč:** Zone-blend (`frac = lerp(emergence, zoneFromAxis(průměr-osy-elementu), 0.5)`) scvrkl vertikální rozptyl větví na ~¼ → „všechny větve z jednoho místa" = přesně to hlukování, co měl řešit. Reálná zkušenost (tree session WIP) > schválený doc. Zároveň ochrana proti vzoru „stavět nový engine místo držet se funkčního".
- **Affected doc(s):** RUNAR_TREE_BOUGHS.md, RUNAR_TREE_TODO.md, memory/runar-tree-engine-lab.md (⭐⭐ 2026-07-04 = zdroj), docs/TREE_BRIEF_CODE_2026-07-04.md, tento záznam
- **Reality note:** Báze = crown-composer (KUKYho schválený „pěkný strom"). Zóna = JEMNÝ posun výšky (à la liana `branch_point`: minulost níž / budoucnost výš), NE destruktivní blend. Krok 1 = element z reálných čtení (`routingFromLog` nahradí `routing(seed,nR)`; `realAge = log.length × growthPerCast`). Engine (growBranch / spojitá limba / fraktál / paint / kořeny) se NESAHÁ. Specials → `RUNAR_TREE_SPECIALS.md` (kandidáti, napřed probrat).
- **Reversibility:** easy (jen směrová lekce; žádný kód se neruší)

---

## 2026-07-04 — Prompt unification: 10 IS/EN builderů → 5 generických + RP_* packy

- **Typ:** implementation (refaktor) + drobná EN normalizace
- **Scope:** reading
- **Co se změnilo:** Sloučeny všechny duplikované IS/EN reading buildery do generických + per-jazyk stringových packů: single (`buildReadingPromptSingle`+`RP_SINGLE`), Norns (`buildNornsPromptFate`+`RP_NORNS`), Kříž (`buildKrizPromptCross`+`RP_KRIZ`), Horseshoe (`buildHorseshoePromptSeven`+`RP_HORSESHOE`), Yggdrasil (`buildYggdrasilPromptNine`+`RP_YGGDRASIL`). `buildXxxPromptIS/EN` zůstaly jako tenké wrappery (call-sites beze změny). **Přidání jazyka = přeložit packy, žádný nový builder.**
- **Proč:** Buildery vznikly jako oddělené IS/EN kopie → za desítky změn se rozešly (drift: jiná struktura, mrtvý kód). Jeden zdroj struktury + stringy per jazyk = drift se nemůže vrátit + Norština/Danština = jen překlad.
- **Bezpečnost:** Golden-output harness (`scripts/golden/`, deterministický Math.random=0.5 + in-memory localStorage, 14 case: single/no-Q/corr × spready × IS/EN). Diff PŘED/PO každém commitu. **IS byte-identický všude.** EN: single/Norns byte-identické; Kříž/Horseshoe/Yggdrasil = kosmetická normalizace runesBlock (jméno+kws na jeden řádek s „ — ", = IS formát) + langInstr do closing — sémanticky totožné.
- **Affected doc(s):** RUNAR_BACKLOG.md (unification hotovo), memory snapshot, tento záznam
- **Reality note:** `runar-character.js` (SW v124). Strom NEDOTČEN (roste z rune-dat, ne z prózy). Owner varován, že spready = normalizace (ne no-op), schválil „když nebude sedět vrátíme". Golden nástroje + baseline v `scripts/golden/`. Patch skripty `unify_*.py` v rootu (untracked).
- **Reversibility:** easy (git revert per builder; golden baseline drží referenci)

---

## 2026-07-04 — Tree: model významu (Norny × dovnitř/ven) + RUNAR_TREE.md konsolidace

- **Typ:** intent (tree design) + doc konsolidace
- **Scope:** tree
- **Co se změnilo:** Ustálen KANONICKÝ model významu stromu (byl roztroušený v BUILD/placement/DESIGN): umístění větve = **ZÓNY** = **Norns osa** (výška: urð kořeny ↔ verðandi střed ↔ skuld koruna; řídí intention›area›seeking›world) **× dovnitř/ven** (strana: area of life). **Element = JEN barva** (+ mikro-výška/úhel), **runa = tvar**, **ætt = charakter**. Strom = „jsi ty; ukazuje, jestli rosteš ke kmeni, nebo od něj". **Počet hlavních větví NENÍ per-element** — emergentní, zastropený ~7–12 kvůli čitelnosti, přebytek → posílení. Systém otevřený: nová oblast/otázka = jen souřadnice na osách. Vytvořen **`RUNAR_TREE.md` = jediný kanonický vstupní bod** (duše + zóny + stavba + mapa doků se statusem). 4 mrtvé tree doky (growth-map, handoff, lab, boughs) → `docs/archive/tree/`.
- **Proč:** Info roztroušené ve 14 souborech = pomalá práce, riziko ztráty, Code/Cowork si protiřečí. Owner: „chci to mít lépe přehledné kvůli rychlosti a přehlednosti." Model významu: element = náhoda (los), význam = pozornost v čase (Norny) + čího světa se týká (area) — potvrzeno vlastními kanonickými doky.
- **Affected doc(s):** RUNAR_TREE.md (nový, kanonický), RUNAR_TREE_BUILD.md + runar-tree-placement.md (vstřebáno), docs/archive/tree/* (přesunuto), RUNAR_TREE_SPECIALS.md, tento záznam
- **Reality note:** Element-primární crown-composer (krok 1) = správný PODKLAD (paleta/stavba), ne význam. Význam = vrstva navrch: krok 2 = Norns zóna jako jemná výška + area jako sektor/strana (zóny spojité, prolínají se — ne přihrádky). RUNAR_TREE.md §9 = mapa statusů. runar-patterns.md ponechán v rootu (owner „dá mu šanci"), ale ZASTARALÉ = vše probrat.
- **Reversibility:** easy (doc konsolidace; archiv = přesun, vratné; model = design sever, ne kód)

---

## 2026-07-04 — Gathering = jen automatická (manuál mrtvý) + Rúnar reflektuje, nepředpovídá

- **Typ:** intent (product/tree design)
- **Scope:** tree + reading
- **Co se změnilo:** Manuální Gathering („vyber 3–7 run z journalu", `runar-gathering.js`) = **MRTVÁ / retired** (UI dávno vytažené, kód dormant → ke smazání: modul + `<script>` v readeru + řádek v `sw.js` = reader/Code úklid). Gathering = **jen automatická**: `detectPatterns()` nad `tree_state` (Muninn) najde zralý vzorec → **Huginn CTA** (opt-in) → 3 kredity, všechny tiery. Tři hloubky = KDE vzorec dozrál: **Orel** (koruna/skuld = záměr) · **Níðhöggr** (kořeny/urð = minulost/stagnace) · **Ratatoskr** (oba naráz = Full). **Zásada: Rúnar reflektuje, nikdy nepředpovídá** — zrcadlo pozornosti, ne věštba; **skuld = záměr / k čemu se táhneš, NE budoucí události.**
- **Proč:** Manuál = mrtvý kód. Auto-Gathering = payoff stromu (strom promluví zpět). Owner: skuld jako „budoucnost" zavání věštěním → přerámováno na záměr; jména tvorů = poloha (koruna/kořeny), ne věštecká moc. Každý pojem musí mít význam + vazbu.
- **Affected doc(s):** RUNAR_TREE.md (§7 = plné znění + cast), working-style.md (2 pravidla), runar-gathering.js (ke smazání), runar-patterns.md (ZASTARALÉ surovina), tento záznam
- **Reality note:** Závisí na `tree_state` DB + `detectPatterns()` — NEexistují (pozdější vrstva, po reading-driven stromu). Jedna detekce → Gathering (slova) + speciální vizuály + stavy větví. Cena 3 kr vs starý kód `use_credit:false` = při stavbě sladit.
- **Reversibility:** easy (design směr; manuál smazat = git revert)

---

## 2026-07-04 — Crown-composer = reading-driven (kroky 1–4, tree lab)

- **Typ:** implementation (tree lab)
- **Scope:** tree
- **Co se změnilo:** Crown-composer (schválený „pěkný strom") přepnut z age-mock makety na **řízený reálným logem čtení**. Čtení = objekt `{spread, runes:[{rune,el}], area, intention}` (localStorage `crownLog`). Postupně (snapshoty `crown-step1..step4` v tree-snapshots/): (1) **element z reálného logu** (`routingFromLog` nahradil simulaci `routing()`); (2) **pozorovatelnost** — karta HISTORIE (trace každého čtení + efekt + ⚠přeskup), step slider (přehrávání po čtení N), VYMAZAT (prázdná půda), tlačítko **ULOŽIT→Code** (`_savestate.js` helper 7798 → `_tree_state.json` → Code čte přímo = konzultace bez screenshotů); (3) **signály harness** — spready (Norns/Compass/Horseshoe/Yggdrasil = víceruna) + area/intention toggle; (4) **STABILNÍ umístění** (`stableAssign`, append-only → 0 přeskoků, ověřeno na sekvenci co dřív měla 3) + **area→strana** (slider `areaSide`) + **intention→výška** (slider `intZone`, jemný Norns posun: minulost níž / budoucnost výš).
- **Proč:** Strom má růst z reálných čtení, ne z age-slideru. Pozorovatelnost = konzultace chyb bez screenshotů (KUKY řekne „#14–#17", Code načte přesný stav a přehraje). Stabilní umístění = konec přeskakování větví (přerozdělování slotů → append-only). Jednoduchost: element=rodina, ostatní signály jen jemné posuny.
- **Affected doc(s):** memory/runar-tree-engine-lab.md (⭐ reading-driven blok), tento záznam; RUNAR_TREE_BUILD.md/RUNAR_TREE.md až po Aett + produkci
- **Reality note:** Vše v `build_crown_composer.py` (generátor, §1) → `v2/tree-lab-crown-composer/`. **Engine (growBranch / emergence / paint / kořeny / kmen) NETKNUTÝ** — mění se jen KTERÝ element / výška / strana jde do slotu. `realAge = počet čtení × readingEvery` (pomalý růst, retence). Ladicí slidery: `intZone`, `areaSide`, konstanty `EXTRA`/`CAP` (stableAssign). Zbývá: **Aett** (charakter růstu větve) → pak produkce (tree_state DB + reálná čtení z readeru). NENÍ v produkci, jen lab.
- **Reversibility:** easy (lab; snapshoty crown-step0..4; engine nedotčen)

---

## 2026-07-09 — Reading contract v1: faktory tvarují výklad, ne jen tažená runa (single)

- **Typ:** implementation + rozhodnutí (reading quality)
- **Scope:** reading (single; spready + eval = TODO)
- **Co se změnilo:** Životní runa / area / seeking se posílaly do promptu jako **pasivní štítky** (model je pod délkovým stropem zahazoval → landovaly jen náhodou). Přepnuto na **aktivní direktivy** (nové sdílené helpery v `runar-character.js`): životní runa = **tichá ČOČKA** (`_lensContext` — tvaruje JAK se tažená runa čte, podtext, nepojmenovává se leda organicky) · area = **DOMÉNA** (`_domainContext` — čtení musí přistát, přes obraz) · seeking = **REJSTŘÍK** (`_registerContext` — 5-hodnotová mapa General/Clarity/Confirmation/Challenge/Reflection řídí mód) · **pravidlo priority** (`RP_SINGLE.priority` — když se faktory neslijí do jednoho obrazu, runa vepředu, drž rejstřík+doménu, čočka ustoupí, nikdy nenutit). Pasivní AREA/SEEK štítky pryč z `parts[]`. **Délka beze změny** (3 věty) — faktory tvarují, nepřidávají slova. INTENTION (Norns čas) už zapojeno dřív (`_intentionContext`).
- **Proč:** „Všechno viditelné" = přeplácané (owner); „měkký kontext" = faktory mizí. Owner-schválený contract: každý faktor má ROLI + viditelnost, životní runa = podtext („tichá čočka"). Ověřeno naživo (SW v151): Wunjo/Gebo/Confirmation/Inner Growth → confirmation rejstřík + inner-growth doména + Gebo podtext, **spolehlivě**; těžký případ Hagalaz/Gebo/Family/Challenge (faktory se přirozeně neslijí) → Hagalaz vepředu, challenge rejstřík bez utěšování, dům jako doména, Gebo (reciprocita) jako čočka na rozvrat — vše ve 3 větách, bez přeplácání.
- **Affected doc(s):** RUNAR_DESIGN.md (nová sekce „Reading contract"), runar-character.js (helpery + `RP_SINGLE.priority`), tento záznam. TODO: spready (4 packy), IS-first eval, backlog.
- **Reality note:** Jen SINGLE. Spready (buildKriz/Norns/Horseshoe/Yggdrasil) = stejný vzor, čeká na owner „single OK". IS znění direktiv = draft, owner ověřuje naživo. Eval (gates + domain-lands + quiet-lens + register-fit + IS-gramatika) = TODO, má hlídat regresi. Contract je **DATA konzumovaná jednou cestou** (§18).
- **Reversibility:** easy (git revert; helpery odstranit + vrátit AREA/SEEK štítky do `parts[]`)

---

## 2026-07-09 — Tree pojmy: Shadow = 5. element, „ke/od kmene" = vyváženost, audit prázdných pojmů

- **Typ:** intent (design) + doc cleanup
- **Scope:** tree
- **Co se změnilo:** Owner-audit prázdných pojmů → doplněn význam + vazba, opraveny konflikty:
  - **Shadow = 5. barva-element** (Fire/Water/Air/Earth/Shadow). „Life Rune = 5. element" byla pracovní verze → **PŘEPSÁNO** (Life Rune = KMEN = uživatel, NE barva-element) v RUNAR_TREE.md, RUNAR_TREE_BUILD.md, tree-of-life.md, RUNAR_DESIGN.md.
  - **„Rosteš ke kmeni / od něj" = vyváženost** (mechanika, ne poezie): sebraná pozornost kolem osy (vyvážené zóny) vs náklon k jednomu okraji (holé zóny). Ne soud, zrcadlo. Řeší i „napětí/harmonie".
  - **Transformační páry** (9) přepsány z poezie na konkrétní význam („co to o tobě říká, když ty dvě runy chodí spolu").
  - **Ætt = charakter** dotažen (téma ættu → růst), **innangarðr/útangarðr** oglosováno (severská hranice uvnitř/venku).
- **Proč:** Owner: „jméno bez vazby je nic." Pravidlo *pojem = význam + vazba* (working-style). Element count 4/5 + „pátý element = Life vs Shadow" si protiřečilo napříč doky.
- **Affected doc(s):** RUNAR_TREE.md (§1/§2/§3/§7/§8), RUNAR_TREE_BUILD.md, tree-of-life.md, RUNAR_DESIGN.md (element tabulka → souhrn + odkaz na runar-runes.js), working-style.md (pravidla „pojmy+hlas"), tento záznam
- **Reality note:** Kanonický rune→element = `runar-runes.js` (5 elementů vč. Shadow; dvojelementové Perth/Eihwaz/Blank). DESIGN element tabulka nahrazena souhrnem + odkazem = konec driftu. „Ke/od kmene" mechanika = měřit rozložení + mohutnost větví přes zóny (later, s `tree_state`).
- **Reversibility:** easy (doc; git revert)

---

## 2026-07-04 — Aett zapojen (krok 5, reading-driven arc kompletní)

- **Typ:** implementation (tree lab)
- **Scope:** tree
- **Co se změnilo:** Poslední signál **Aett** zapojen do crown-composeru. Runa→aett (Freya/Heimdall/Týr, per-runa z runar-runes.js přes glyf); element-větev bere DOMINANTNÍ aett svých run → **charakter růstu**: freya=fluid/vzhůru (víc curve+tipLift) · heimdall=těžký/ukotvený (min. tipLift) · tyr=přímý/směrovaný (min. curve/wobble). Slider `aettStr`. Mění JEN tvarové parametry, NE napojení (žádný šev). Snapshot `crown-step5-aett`. **Tím je celý signálový řetězec čtení→strom kompletní**: element (barva+rodina) + spread (víc run) + intention (výška) + area (strana) + aett (charakter) + stabilní umístění (0 skoků) + opakování (zesílí).
- **Proč:** Aett = poslední intrinsic signál runy (mytologická rodina) → dává větvi gesto/charakter, ne jen barvu/tvar. Dokončuje „jednoduché pravidlo" (element=rodina, ostatní jen jemné posuny).
- **Affected doc(s):** memory/runar-tree-engine-lab.md, tento záznam
- **Reality note:** `build_crown_composer.py` (§1). Engine (growBranch/emergence/paint/kořeny/kmen) netknutý. Zbývá PRODUKCE (tree_state DB + zapojení na reálná čtení z readeru) + volitelně per-runa sub-větve (hlubší bough model). NENÍ v produkci, jen lab.
- **Reversibility:** easy (lab; aettStr=0 vypne; snapshot crown-step5)

---

## 2026-07-10 — Word corrections PAUZA (raw IS output, chyby chytat výš) + IS QC toolkit

- **Typ:** decision (behavior) + tooling
- **Scope:** reading (IS quality)
- **Co se změnilo:** `runar_corrections` se v readeru **přestaly APLIKOVAT** — `CORRECTIONS_ENABLED=false` (config), gate v `loadCorrections` → prázdné pole → `getCorrPrompt` nic neinjektuje + `applyISCorrections` no-op. Korekce zůstávají v DB + shrine tabu pro správu. Nový IS QC toolkit: **check-is** = source-linter (typos v kódu, glob všech v2 souborů, pre-commit brána §9) · **is-grammar-qa** = GreynirCorrect (Yfirlestur API) nad celými čteními (output kvalita, flag-only) · **is-corr-qa** = BÍN (`islenska`, offline) validuje korekce (reálný tvar? single-word = kontextově slepé) pro non-native. Shrine reader-preview (V2 LAB) smazán (−971 ř., drift plocha). Stale-reading fix (reset na single při vstupu na reading tab).
- **Proč:** Manuální substring korekce jsou **kontextově slepé** — jednoslovné X→Y může být správné v jednom pádě/čase/osobě a špatné jinde (is-corr-qa označil `biðlar→biður` jako dvojznačné kvk/so). Maskování outputu jimi skrývá, jestli model chybu pořád dělá. Pauza → syrový IS projde → když se dřív-opravené slovo vrátí = **reálný signál** opakující se mezery → oprava v **promptu** (řeší VŠECHNY kontexty), ne záplata. Princip prevence > blocklist (§18: jeden zdroj, měřit).
- **Affected doc(s):** CLAUDE.md §2 (korekce = 4. vrstva, teď gated), MEMORY.md, tento záznam.
- **Reality note:** Reverzibilní: flag `CORRECTIONS_ENABLED=true`. Licence OK (GreynirCorrect MIT / BÍN CC BY-SA). BÍN doménově chytré (rozloží `lífs-rún`), GreynirCorrect na fragmentech nespolehlivý (`lífsrúna→Lífbrúna`) → BÍN pro validitu slov, GreynirCorrect pro output. Owner-akce: zkontrolovat 2 flagnuté single-word korekce; Sigrún potvrdit borderline. Zbývá (b): prořezat model-output patterny z check-is.
- **Reversibility:** easy (flag; git revert)

---

## 2026-07-10 — Korekce → PROMPT (in-context), ne substring (supersede téhož dne PAUZY)

- **Typ:** decision (behavior)
- **Scope:** reading (IS quality)
- **Co se změnilo:** Pauza (výše) zjemněna: korekce jdou do **promptu** čtení, ne substring. `CORRECTIONS_ENABLED` → dva flagy: `CORRECTIONS_IN_PROMPT=true` (loadCorrections načte → `getCorrPrompt` injektuje do promptu) + `CORRECTIONS_POSTPROCESS=false` (`applyISCorrections` = no-op, slepý substring VYPNUTÝ). `getCorrPrompt` **IS-ifikován** (§2): blok „Orðaleiðréttingar (fylgdu nákvæmlega, í réttri beygingu eftir samhengi): - ekki X heldur Y" — signál skloňuj podle kontextu.
- **Proč:** Dnešek dokázal, že model **prompt instrukce poslouchá** (kauzativum `láta+nafnháttur` 3× naživo, rod dle ÁVARP). Prompt korekce = model aplikuje **v kontextu** (správný pád/rod) — to substring neuměl (biðlar→biður dvojznačné). Velikost: cena zanedbatelná (hlas dominuje ~98 %); riziko = ředění pozornosti → držet blok krátký: **destilovat vzory do gramatických pravidel** (character.js), jen jednorázovky jako slovní korekce, dlouhý ocas → is-grammar-qa + native.
- **Affected doc(s):** CLAUDE.md §2, MEMORY.md, tento záznam. `golden_contracts.js` (smoke ⑥) ověřuje: mapping + getCorrPrompt injektuje replacement + applyISCorrections no-op (§19).
- **Reality note:** Owner-akce: kurátorovat DB korekce přes shrine (frázové jednorázovky ven, gramatické vzory → pravidla). Model-output patterny už archivované v check-is.
- **Reversibility:** easy (flagy; git revert)

---

## 2026-07-12 — Tree of Life do produkce (free-solo, admin-only beta)

- **Typ:** implementation (tree → produkce)
- **Scope:** tree + reading
- **Co se změnilo:** Crown-composer strom napojen do produkčního readeru (Tree tab), free-solo. Nové: `v2/runar-tree-prod.js` (produkční modul kompozice, generovaný `build_tree_production.py` z labu, §1) + enginy `v2/tree-lab-{trunk,branch}-composer/runar-{trunk,branch}.js` (reader je načítá). `runar-tree.js` (patch `add_living_tree.py`): **`renderLivingTree()`** — **ADMIN-only gate** (`isAdmin(currentUser.email)`), načte VŠECHNA čtení uživatele z DB `readings` → `readingsToTreeLog()` (runa→element z glyfu, spread z rune_name, area) → `RunarTreeProd.render`. Trunk = life runa (od DOB); založení = holý kmen; čtení rostou korunu. `reader.html`: 3 engine skripty + `<canvas id=tree-living-canvas>` v Tree tabu (Life Rune stavy netknuté). Commit `bceec07` (+ sw.js bump).
- **Proč:** Beta na ostrém bez rizika = admin gate (běžní uživatelé strom nevidí, launch ~měsíc). „Všechno předešlé čtení" = strom čte z `readings` (journal) → celá historie hned (Coworkovo „derive z readings").
- **Affected doc(s):** memory/runar-tree-engine-lab.md, tento záznam
- **Reality note:** Non-admin → skryté (ověřeno `display:none`). Živý DB dotaz `sb.from('readings').select('*').eq(user_id)` ověřen jen vzorem (sedí s `saveReading`) — naostro potvrdí admin prvním otevřením Tree tabu. **Cowork `recordTreeReading` (localStorage treeLog) = REDUNDANTNÍ** (strom čte z DB), ale jeho **2 DB opravy** (intention sloupec + reálná area u spreadů) doplní signál výška/strana novým i starým čtením. Stará spready dnes: area='spread'/žádná intention → neutrál (degraduje jemně). Engine (RunarTrunk/RunarBranch/kompozice) NETKNUTÝ. §1: JS přes Python. Snapshoty prod-step3..4. node --check validní. **Anti-drift debt (§18):** lab+prod sdílí kompozici KOPIÍ → TODO shared `runar-tree-core.js`. Enginy načteny z `tree-lab-*` cest (minor debt). Zbývá: live-update po čtení (dnes při otevření tabu), DB trvalost fáze 2 (Cowork opravy), per-runa sub-větve.
- **Reversibility:** easy (admin gate = 1 podmínka; smazat canvas + 3 skripty; engine nedotčen)

---

## 2026-07-12 — Tree beta: 2 bug fixy (readings-load + tree-name save)

- **Typ:** fix (2 bugy z admin bety)
- **Scope:** tree
- **Co se změnilo:**
  1. **BUG 1 (čtení z journalu se nenačetla → strom jen holé založení):** `renderLivingTree` řadil dotaz `readings` podle `created_at`, ale ta tabulka má časový sloupec `drawn_at` (journal to dokazuje — čte tentýž dotaz, jen řadí `drawn_at`, a funguje). Řazení podle neexistujícího sloupce → PostgREST error → `res.data=null` → `if (res && res.data)` propadne → log `[]` → founding. Fix: `.order('drawn_at', { ascending: true })`. Glyf-extrakce byla celou dobu OK (single: glyf v `rune_glyph`; spready: glyfy v `short_text`). Commit `3067af9`.
  2. **BUG 2 (jméno stromu zůstávalo v poli po uložení):** `saveTreeName` zapsal do DB a bliknul „✦ SAVED", ale nikdy nesáhl na input → zůstal vyplněný v edit režimu; uložené jméno se nikde nezobrazovalo (write-only). Fix (KUKY volba „nechat dole, jen fix"): po uložení swap input → read-only „YOUR TREE / <jméno> · edit". Jediný zdroj pravdy = `currentUser.tree_name`. Nové `_renderTreeNameState()`/`editTreeName()`; `fetchUserProfile` ukládá `currentUser.tree_name` + renderuje stav; reader.html rozdělen na edit-view + display-view; reader.css styly; 3 nové překlady `tree_named_label`/`tree_name_edit`/`tree_name_err` (EN+IS). Commit `460b0f3`.
- **Proč:** Beta na ostrém: strom má naskočit z celé historie čtení (bug 1 blokoval jádro featury); jméno stromu má po uložení dát vizuální potvrzení + klid, ne matoucí trvale editovatelné pole (bug 2).
- **Affected doc(s):** memory/snapshots/2026-07-12-tree-production-admin-beta.md (bugy → fixed), tento záznam
- **Reality note:** Root cause bug 1 = diagnostikován paralelním vyšetřením (Workflow, 3 čtenáři), NE hádáním — journal vs tree dotaz se lišily JEN ORDER sloupcem; fix = shoda s prokazatelně funkčním journalem (`drawn_at`). Bug 2 ověřen v preview: 3 přechody stavů (saved→display, edit→prefilled input, fresh→edit) + computed styly (jméno zlaté Cinzel #FFBF00, „edit" muted podtržené). Lokální browser cache servírovala stará sub-resources (translations.js/reader.css) — soubory na serveru ověřeny čerstvé (no-store fetch), deploy řeší SW bump (v170). **§2/§19 IS QA:** 3 nové IS stringy (`TRÉÐ ÞITT`, `breyta`, `Ekki tókst að vista`) = základní gramatika, ale do NATIVE EYE fronty (Sigrún) pro jistotu. §1: JS přes Python (`fix_tree_readings_order.py`, `fix_tree_name_state.py`). Coworkova WIP (updateUIText spread labely v app.js, character/reading) NEcommitnuta — chirurgicky oddělena (filtrovaný patch, jen můj hunk).
- **Reversibility:** easy (revert 2 commity; DB `tree_name` beze změny; engine nedotčen)


## 2026-07-13 — Uložení čtení do journalu SERVER-SIDE (atomicky s odečtem kreditu)

- **Typ:** decision (behavior) + fix (data integrity)
- **Scope:** reading
- **Co se změnilo:** Journal (`readings`) se ukládá v **claude-proxy** (server-side), ne v klientovi. Klient posílá `journal` META (runa, area, seeking, question, life_rune, kind single/spread, rune_display) přes `callProxy(..., journal)`; proxy po odečtu kreditu vloží řádek — `composeReading` složí text z modelového JSON (věrné zrcadlo `_parseSegments`). Klientské `saveReading`/`saveSpreadReading` **SMAZÁNY** (§18 — proxy = jediný vlastník insertu). `recordTreeReading` (localStorage) + `loadJournal` zůstávají v readeru. Odečet **bezpodmínečný** (fail-open by šel zneužít podvrženým journalem); insert best-effort ale **kontrolovaný** (`{ error }` — supabase-js DB chyby NEvyhazuje) → charged-but-not-journaled je aspoň zalogovaný. `credits_used` teď server-authoritative (`deductPlan.kind===paid`), ne klientský. `life_rune` opraveno (`u.lifeRune`; dřív `u.dob` = vždy null, pre-existing bug).
- **Proč:** Odečet byl server-side (po generování), uložení client-side (po přijetí) → NE atomické. App-switch během ~40s generování zabil klienta → kredit stržen (server), čtení neuloženo (klient mrtvý) = **charged-but-lost**. Teď proxy udělá obojí → hotové čtení je vždy v journalu (dohledatelné i po app-switch). Řeší user report „ztráta čtení při přepnutí appky".
- **Affected doc(s):** CLAUDE.md (Reading systém — save flow), MEMORY.md, tento záznam.
- **Reality note:** Proxy NASAZEN (backward-compatible: starý živý klient dál client-saveuje dokud se nepushne nový; deploy proxy PŘED push klienta). Adversariální review (Workflow, 8 agentů, 4 osy) → 4 nálezy: insert-error-check + credits_used + life_rune OPRAVENY; self-XSS (neescapovaný journal render) = **pre-existing, samostatný task** `task_14f9f864` (+ ověřit shrine admin-view eskalaci). §19: `composeReading`(TS) == `_parseSegments`(JS) ověřeno 9 fixturami → smoke ⑦ (`scripts/verify_compose_mirror.js`); zrcadlený pár = drift-riziko, drženo komentáři + kontraktem. Ukládá se SLOŽENÝ text (ne raw JSON) → journal/tree read-path + live reader display NEDOTČENÉ. §1: JS přes Python.
- **Reversibility:** medium (git revert klienta + redeploy staré proxy naráz; DB readings beze změny).


## 2026-07-13 — Journal render escapován (stored/self-XSS hardening, řeší finding #2)

- **Typ:** fix (security hardening)
- **Scope:** reading (journal render)
- **Co se změnilo:** Nové sdílené helpery `escapeHtml` + `jsAttr` (runar-utils.js, čtou reader i shrine). `renderJournal` (runar-journal.js) teď escapuje VŠECHNA dynamická pole před vložením do innerHTML: question, area, short_text, deep_text, rune_name, life_rune, glyph, excerpt. Audio onclick (`playJournalAudio('rune','lang',i)`) = JS-string-v-HTML-atributu → `jsAttr` (escape \ + ' pro string, HTML-encode " < > pro atribut). Gathering se renderuje toutéž cestou (spread karta) → pokryto. Shrine user-čtení NErenderuje (jen admin-authored corrections) → žádná admin-XSS plocha; až vznikne readings viewer, MUSÍ použít escapeHtml.
- **Proč:** User free text (hlavně `question`) šel do innerHTML neescapovaný → `<img onerror=...>` by se spustil. Self-XSS (RLS own-rows, user_id z tokenu) → LOW, ale reálné + escapování opraví i legitimní `<` ve čtení. Pre-existing (ne regrese ze server-side-journal), řeší finding #2 z review 2026-07-13.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** Ověřeno node unit testem (payloady zneškodněny) + reálným browser DOM testem (preview: imgCreated=0, xssFired=false, payload = inertní text). §1: JS přes Python. task_14f9f864 = HOTOVO inline.
- **Reversibility:** easy (git revert; helpery zůstanou neškodné).


## 2026-07-13 — Shrine Readings viewer (admin quality review, konec screenshotů)

- **Typ:** implementation (admin tooling / eval infra)
- **Scope:** reading (kvalita)
- **Co se změnilo:** Nová shrine záložka **„📜 READINGS"** — admin vidí VŠECHNA čtení uživatelů bez screenshotů. Edge fce `list-readings` (admin-gated service-role, zrcadlo `list-reports`; `readings` má own-rows RLS → nutná fce, anon read nestačí) vrací readings + `user_name`/`user_tier` (join user_profiles, který nemá email). Modul `runar-readings-admin.js` (zrcadlo reports-admin) renderuje karty: runa+glyf, lang, datum, tester+tier, area/seeking/question, plný text (single=short_text, spread=deep_text), filtr lang all/is/en, vše přes `escapeHtml`. Sběrná páteř = dnešní **server-side save** (čtení spolehlivě v DB i z mobilu).
- **Proč:** Kuky sbírá kvalitativní data čtení (hlavně od TESTERŮ = zlato) na chytání chyb neviditelných běžnému useru (IS gramatika, posunutý význam). Screenshoty do chatu neškálují; s víc testery víc dat. Data už v `readings` jsou → jen je zpřístupnit k analýze.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** Edge fce NASAZENA + shrine tab ověřen v preview (tab/pane/filtry/modul integrují bez chyb, showTab OK; živá data za admin gate → owner otestuje loginem). VIEW-ONLY zatím. Další fáze: flag/annotate akce (review tabulka DB) + obohatit `readings` řádek (prompt_version, pořadí run, char_count, address_form — Cowork eval #1) + is-grammar-qa fronta „NATIVE EYE" nad IS výstupy. Rozhodnutí čekají na ownera: `is_tester` flag, ukládat i `someone` mód. §1: shrine inline JS přes Python.
- **Reversibility:** easy (smazat tab + modul + fce; readings/RLS beze změny).

---

## 2026-07-13 — Sjednocení runových glyfů (font → jeden SVG zdroj, rámování dle role)

- **Typ:** design + implementation (glyph rendering)
- **Scope:** reader (UI rendering)
- **Co se změnilo:** Zrušen dvojsystém glyfů (font `r.g` vs kreslené `RUNE_SVGS`). Nově JEDEN zdroj = RUNE_SVGS přes sdílený helper `runeSvg(rune,{frame,cls})` (runar-utils.js, §3/§18): `frame:true` = kámen (runa+rám), `frame:false` = holá runa (rám = první `#1e2535` path, strhne se při renderu; #D6A85C, ~1.1em vůči kontejneru). **Fáze 1** (`bdab466`): helper + refaktor 2 stávajících SVG mřížek (rune board, kolekce) na helper + smazán mrtvý `<path d="">`. **Fáze 2** (`83a350f`): přepnuta VŠECHNA font místa na frameless SVG — strip (single+spread, `.rlbl-glyph` span/data-* zachovány → tap popup jede), životní-runa badge, spread draw sloty, tree glyfy (teaser/cta/exists/loading), rune-info, coll-detail, journal single karty (runa dohledána dle `rune_name`; spready drží `✦`; escaped fallback = XSS zachováno). Blank = orámované prázdno (kámen=prázdný kámen · holá=zlatý obrys), NIKDY font `○`. Mřížky/kolekce zůstávají kámen. ᚱ brand (HTML chrome, loading „THE STONES SPEAK") NEDOTČEN. Pravidlo → CLAUDE.md §5.
- **Proč:** Font glyfy (Cormorant) nekonzistentní napříč zařízeními (systémový runový font / prázdné čtverečky) + `○` Blank „trčel". SVG kresby už existují, dvoubarevný kámen + frameless zadarmo, výkon není problém. Font zvážen a zamítnut: běžný font neuveze dvoubarevný kámen + výrobní pipeline (KUKY rozhodl 2026-07-13).
- **Affected doc(s):** CLAUDE.md §5 (nové pravidlo), tento záznam
- **Reality note:** Ověřeno v reálném readeru: 25/25 obou rámování, Blank obrys, badge/strip/slot/rune-info renderují SVG, tap popup data zachována, žádné chyby. Screenshoty v preview sekají (env) → ověřeno strukturálně (DOM/getBBox) + kontextové velikosti změřeny. Velikost = `.rune-svg-fl{height:1.1em}` relativní ke kontejneru → runa sedne do své pozice (kalibrace: holá runa vyplňuje 0.65–0.91 viewBoxu). §1: JS přes Python (add_rune_svg_helper / switch_glyphs_to_svg / add_glyph_remaining). Coworkova souběžná WIP (tester/analytics consent v app.js/css/reader.html) NEcommitnuta — chirurgicky oddělena (filter_hunks.py). SW v178. **Follow-up:** shrine + yggdrasil.html mají stejný split (odloženo).
- **Reversibility:** medium (revert 2 commity; helper zůstane neškodný; DB beze změny)
- **Addendum 2026-07-14 (`24eed69`):** Frameless runy nechávaly drobné „čárky" — každá runa má 1 hlavní zlatý tah (index 0) + několik malých kamenických ozdůbek (taky #D6A85C → fill-strip je nechal, bez kamene „trčely"). Fix: frameless nechá JEN hlavní tah přes keep-mapu `RUNE_BARE_KEEP` (default `[0]`; Jera `[0,1]` = dva háčky), odvozeno z per-path bbox v prohlížeči (hlavní tah = 0.14–0.32 viewBoxu, ozdůbky ≤0.013). Kámen/framed netknutý (mřížky plné). Ověřeno: 25/25 frameless = 1 path (Jera 2, Blank obrys). SW v181.
- **Addendum 2026-07-14 „celé pravidlo" (`e3bf1ba`, SW v187):** Po zhlédnutí Blank jako kámen KUKY rozhodl finální framing: **KÁMEN = runy, které TAHÁŠ/DRŽÍŠ** (fyzický kámen) · **HOLÁ = životní runa (esence, ne tažený kámen) + textové popisky**. Přepnuto na kámen (frame:true): kolekce detail (`cd-stone`), reading strip single+spread (`rlbl-stone`), spread sloty (`slot-stone`), journal single karta (`jcard-stone`). Zůstalo holé: životní-runa badge, tree life-rune glyfy (teaser/cta/exists/loading), rune-info řádek. Nové size třídy (strip clamp 22–34px → runa uvnitř ~stejná jako dřív + rám; 9-run strip bez h-přetoku, na mobilu se zabalí). **Bug fix:** tap popup kopíroval `textContent` z `.rlbl-glyph` spanu (teď SVG, žádný text) → prázdný glyf; opraveno na `g.innerHTML`. Inventura (Workflow, 3 sběry) zmapovala VŠECHNA rune-render místa. **Zbývá:** journal SPREAD historie = uložený font-string run (`short_text`), zatím font; shrine + yggdrasil = vlastní inline SVG (nepoužívají helper) → follow-up.


## 2026-07-13 — Privacy kód zapojen: opt-out toggle + tester consent + viewer opt-out/tester

- **Typ:** implementation (privacy/GDPR + admin tooling)
- **Scope:** reading (privacy)
- **Co se změnilo:** DB sloupce (`is_tester`, `analytics_opt_out`, `tester_consent_at`) zapojeny do readeru. `fetchUserProfile` je čte guarded (nikdy neblokuje load). **Side panel PRIVACY sekce** = opt-out toggle (`checked` = „use my readings", default opted-in — legitimate interest, **žádný popup pro běžné usery**). **Tester consent modal** = jednou pro `is_tester` účet bez `tester_consent_at` (freely-given → dismissible, re-show do souhlasu; „I agree" zapíše timestamp). translations +16 klíčů (EN + **IS draft → Sigrún**). **Readings viewer**: `list-readings` **vylučuje opt-out usery** (GDPR) + `is_tester` badge + „⚑ Testers" filtr (edge fce nasazena).
- **Proč:** Realizuje RUNAR_PRIVACY.md v kódu. Sběr dat od testerů podchycen jejich souhlasem; běžný user má tichý opt-out bez friction (odpověď na „bude to lidi odrazovat").
- **Affected doc(s):** RUNAR_PRIVACY.md (Code checklist → done), MEMORY.md, tento záznam.
- **Reality note:** Ověřeno preview (elementy present, consent modal renderuje čitelně, žádné console chyby) + node --check + smoke 7/7. **Live save/consent/badge/opt-out-exkluze = owner login + tester data.** Opt-out/testers filtry běží PO limitu (admin tool, opt-out vzácný). IS texty draft → Sigrún (NATIVE-EYE). Commity 6b79b1b (Part A) + 996e315 (Part B). §1 JS přes Python.
- **Reversibility:** medium (revert commity; DB sloupce zůstanou neškodné).


## 2026-07-14 — Čtení zachytí VŠECHNO: Ask Rúnar Q&A + intention + inputy ve vieweru

- **Typ:** implementation (data completeness / eval infra)
- **Scope:** reading
- **Co se změnilo:** `readings` řádek teď nese celý obraz čtení. **Proxy:** insert ukládá `intention` + vrací `reading_id`; journal `kind:"ask"` → **UPDATE** připojí Ask Rúnar `{q,a}` do `follow_up` (jsonb pole), ne nový insert. **Klient:** `callProxy` vrací `reading_id`; single/spread posílají `intention` + drží `_lastReadingId`; `askRunar` posílá `{kind:"ask", reading_id, question}`. **list-readings** vrací `intention` + `follow_up`. **Viewer:** blok inputů (Area/Seeking/Intention/Question/Life rune) + **Ask Rúnar** blok (otázka nad odpovědí, jak v readeru). **DB:** `readings.intention text` + `follow_up jsonb` (owner spustil).
- **Proč:** Kuky sbírá kvalitativní data testerů — „u čtení musí být úplně všechno" vč. Ask Rúnar follow-upu + zvolených inputů (AoL atd.). Konec screenshotů; kompletní záznam k analýze.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** Nasazeno (proxy + list-readings) + push (SW v182). **Pořadí kritické:** proxy PŘED push klienta (starý proxy by `kind:"ask"` mis-insertoval jako čtení). Live end-to-end = owner test (1 čtení → objeví se ve vieweru s inputy; Ask → follow_up naskočí). **GAP VYŘEŠEN (2026-07-14, commit 094f287, SW v183):** `aol` sloupec zachycuje reálnou AoL jednotně u single + spread (nezávisle na 'spread' markeru); viewer ukazuje AoL u VŠECH čtení. Princip „neselektujeme — vše pro všechny runy i čtení". §1 JS přes Python. Commit 481d313.
- **Reversibility:** medium (revert commit + redeploy staré fce; sloupce neškodné).


## 2026-07-14 — Eval v0.4 → přeskupení priorit + 2 compact fixy (②)

- **Typ:** decision (plán) + fix
- **Scope:** reading (kvalita)
- **Co se změnilo:** Eval dávka v0.4 (Cowork, 16 výstupů, konstantní prompt) přeskupila priority. **Pořadí:** ① `prompt_version` + ADDRESS logging (**blokátor měření** — bez něj „každá dávka jen sbírka dojmů") → ② levné fixy → ③ **měřené** prompt páky (describe-don't-explain + „already/þegar" pryč + image pool; R1 a gate-fails ZVLÁŠŤ) → ④ owner (**přetížení čtení**: 7 pánů, runa 7. a prohrává; **G2b no-fate** gate). **② HOTOVO tímto commitem:** intro copy (cold-reading smlouva → „Tell me where to look. The rune speaks for itself." EN+IS) + follow-up **word cap** (~40 slov, max_tokens 400→120). **Železné pravidlo: prompt páky NEsahat před `prompt_version`.**
- **Proč:** Držet Rúnara KOMPAKTNÍHO (owner: „minule se rozletěl na všechny strany a nedělal skoro nic dobře"). Eval: každý gate-fail sedí ve vysvětlující větě; R1 = vada zásoby (→pool, ledger i na kostry/jmenný slot); follow-up přetéká přes délku čtení.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** ① `prompt_version` čeká na sloupec (`alter table public.readings add column if not exists prompt_version text;`). Blank glyf ○→kámen potřebuje `RUNAR_glyph_unify_CODE.md` spec (nemám → flag ownerovi). IS intro **authored + ověřeno check-is** (ne „draft pro Sigrún" — viz working-style korekce 2026-07-14). Commit 3d19cc2, SW v184.
- **Reversibility:** easy (revert commit).


## 2026-07-14 — „Popiš, nedovysvětluj" pravidlo + prompt v0.5 (dvojice s intro copy)

- **Typ:** decision (behavior) — reading quality
- **Scope:** reading
- **Co se změnilo:** Do všech 5 reading builderů (single + 4 spready) injektováno `_describeRule(lang)` vedle `_seasonalImagery`: „řekni CO runa dělá ve světě, nikdy CO to znamená — žádný mechanismus (vymyšlená fyzika), žádný verdikt o tazateli, žádná osudová tvrzení; nech obraz stát". `RUNAR_PROMPT_VERSION` 'v0.4' → 'v0.5'.
- **Proč:** Eval v0.4 Priorita 1 (**9/9**): každý gate-fail sedí ve VYSVĚTLUJÍCÍ větě, ne v obraze. **Rozhodnutí #1 (copy-doc):** MUSÍ jet SPOLU s intro copy — intro = slib uživateli („the rune speaks for itself"), pravidlo = ten samý slib modelu; intro SAMO = elegantnější ozvěnová lež. Intro nasazeno v ② (samo, chyba), teď dorazil partner → dvojice konzistentní od v0.5.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** Reading prompt = **client-built** (character.js) → jen push, žádný proxy deploy. Měření: zítřejší dávka = v0.5, porovnat vs v0.4 přes `prompt_version` tag (R1 + gate-fails). Zbývá z copy-doc: #2 Spirituality→The Unseen (dohledat AREA seznam), #4+5 SPECIFIC QUESTION→THE SITUATION+placeholder (`q_lbl` nalezen), #3 SEEKING prompt rule (+ F1-CLARITY kolize — přejmenovat INTERNÍ mód). Blank glyf = TREE (drawn→kámen, commity e3bf1ba/091addc). Commit b038f73, SW v189.
- **Reversibility:** easy (revert; verze zpět na v0.4).


## 2026-07-14 — 'someone' čtení = testovací data (jen testeři)

- **Typ:** decision (behavior) + privacy
- **Scope:** reading
- **Co se změnilo:** „FOR SOMEONE" čtení se dřív **neukládalo vůbec**. Teď: **tester + 'someone' → uloží se** s `reading_mode='someone'` (nový sloupec `readings.reading_mode`). **Běžný user + 'someone' → NEukládá se** (beze změny). **Journal usera 'someone' NIKDY nezobrazí** (`.or('reading_mode.is.null,reading_mode.eq.mine')`). Shrine viewer = **SOMEONE** badge. Copy EN+IS: „This reading will not be **saved**" → „will not be added to your **journal**" (pravda pro obě větve; IS `Þessi spá fer ekki í dagbókina þína` ověřené 0 flagů).
- **Proč:** Owner potřebuje testovat čtení **BEZ životní runy** — 'someone' je jediný mód, kde `lifeRune = null` (vlastní účet má vždy Gebo; eval to flagoval jako slepou skvrnu „8/8 Gebo"). **Tester-gate:** 'someone' čtení nese jméno **třetí osoby** uvnitř textu čtení a ta osoba nic neodsouhlasila → u testera = testovací data krytá jeho souhlasem, u běžného usera by to byla data třetí osoby bez právního základu.
- **Affected doc(s):** RUNAR_PRIVACY.md (pravidlo analýzy #6), MEMORY.md, tento záznam.
- **Reality note:** Sloupec `readings.reading_mode` (owner spustil). Proxy + list-readings nasazeny, klient pushnut. **Owner test:** označ se `is_tester=true` → udělej 'someone' čtení → shrine 📜 READINGS má **SOMEONE** badge; tvůj journal ho **nemá**. Držáno minimální (owner: „nechci to překombinovat") — na testování bez životní runy nic dalšího nestavěno. Commit 0b101b1, SW v193.
- **Reversibility:** easy (revert + redeploy; sloupec neškodný).


## 2026-07-14 — Copy-doc CODE lane dokončen: #4+5 (THE SITUATION) + #5 (SEEKING stance), prompt v0.6

- **Typ:** decision (behavior) + copy
- **Scope:** reading
- **Co se změnilo:** **#4+5:** `q_lbl` SPECIFIC QUESTION → THE SITUATION / SÉRSTÖK SPURNING → STAÐAN; `q_ph` → popis situace („I am deciding whether to take on more work"), ne otázka na skrytou příčinu. **#5:** `_registerContext` prepend **stance** („SEEKING = postoj, ne objednávka; nedodat pojmenovanou věc ani neopakovat název pole; jen lita tón") + **Confirmation** řádek přepsán (z „affirm what is already true" = cold-reading potvrzování → „hvorki staðfestu né hrektu; lýstu jarðveginum undir ákvörðuninni og blindu hliðinni" = nepotvrzovat/nevyvracet, popsat půdu + slepou stranu). `RUNAR_PROMPT_VERSION` v0.5 → **v0.6**. **F1-CLARITY** = eval-rubrika (v kódu žádné „F1"), user-facing „Clarity" seek option NETKNUTÝ.
- **Proč:** copy-doc rozhodnutí (unanswerable hidden-cause Q → F1=1; SEEKING jako cold-reading objednávka). Držet Rúnara upřímného + kompaktního.
- **Affected doc(s):** MEMORY.md, tento záznam.
- **Reality note:** Reading prompt = client-built → push (žádný proxy deploy). **VŠECHNO dnešní IS ověřené NÁMI** (is-grammar-qa + BÍN), nic pro Sigrún: `staðan` (staða def.), `aðgangnum→aðganginum` opraveno; `lestrunum` (lemma lestur) + `hrektu` (boðháttur hrekja) = GreynirCorrect false-positives potvrzené správné přes BÍN. **Celý copy-doc CODE lane hotový:** 1 logging ✅ · 2 intro+describe ✅ · 3 The Unseen ✅ · 4+5 The Situation ✅ · 5 SEEKING ✅ · 6 glyf = TREE. Zítřejší dávka = **v0.6 vs v0.4** (prompt_version tag → R1 + gate-fails). Commity c3dafb1 + 9ce6956, SW v192. **Debt:** AREAS/SEEKS vocab žije v runar-runes.js (kvůli norns-ose) — půl-oprávněné, možný split labely→config.
- **Reversibility:** easy (revert; verze zpět).


## 2026-07-14 — Reading contract dorazil do všech 4 spreadů (prompt v0.7) + §19 wiring check

- **Typ:** fix (tichá díra) + decision (behavior)
- **Scope:** reading
- **Co se změnilo:** Contract (**životní runa = linsa · area = doména · seeking = registr · priority = tie-breaker**) byl zapojený **JEN v single** (character.js:831-833). Spready dostávaly **holé labely** („Seeking: Clarity") bez direktivy → **SEEKING stance rule + Confirmation reframe (v0.6) na ně NIKDY nedošly.** Půlka copy-doc #5 byla neviditelná. Teď: `_lensContext` bere runu NEBO pole (spread čte „rúnurnar sem dregnar voru"; linsa se **stáhne, když je životní runa mezi taženými** — nemůže být linsa i předmět); **`_priorityContext` = nový SDÍLENÝ helper** (tie-breaker byl duplikovaný uvnitř RP_SINGLE, §18 → jeden zdroj pro single i spready; při té příležitosti Z002 velké písmeno po dvojtečce). Všechny 4 spread buildery injektují lens/domain/register/priority vedle `_describeRule`. `RUNAR_PROMPT_VERSION` v0.6 → **v0.7**.
- **Proč:** Nález z auditu restů (Workflow, 5 zdrojů). Bez tohohle je dnešní práce na SEEKING pravidle jen pro single — a spready jsou přesně tam, kde „Seeking: Clarity" jako holý label svádí model k „objednávce".
- **Affected doc(s):** RUNAR_BACKLOG.md (audit — položka odškrtnuta), MEMORY.md, tento záznam.
- **Reality note:** **§19 lekce naživo:** první kontrola přes starý `golden_dump.js` hlásila FALSE MISS — jeho fixture posílá `seeking:'clarity'` (malé → `SEEKS.indexOf` = -1) a životní runu, která JE v taženém poolu. Fixture musí cvičit **pravou hranici reálnými hodnotami** (§19.1). Nový `scripts/verify_contract_wiring.js` staví REÁLNÉ prompty ve vm sandboxu a asertuje všechny 4 direktivy v single + 4 spreadech × EN/IS + že se linsa správně stáhne → **smoke ⑧** (8/8). IS ověřené námi přes BÍN: `rúnurnar`/`rúnunum` = lemma rúna/rún; GreynirCorrect návrhy `rúðurnar` (okenní tabulky) a `rútunum` (autobusy) = false-positives, stejná třída jako lestur/lest a hrekja/hrakinn. Reading prompt = client-built → jen push. Commit 39bf41d, SW v195.
- **Reversibility:** easy (revert; verze zpět na v0.6).

---

## 2026-07-16 — Monthly cast cap 50/75 vynucen v proxy; Ask Rúnar se nepočítá

- **Typ:** implementation
- **Co se změnilo:** claude-proxy počítá a vynucuje měsíční limit placených tierů (standard 50 / premium 75 castů). Nové sloupce `user_profiles.month_units` + `month_key` ('YYYY-MM'); jiný měsíc = 0 použitých → **limit se resetuje sám, bez cronu a bez měsíční úlohy**. Odečet sedí u existujícího atomického odečtu kreditů. Překročení → 402 `monthly_limit` → `err_monthly_limit` (EN+IS). Smoke ⑨ (`scripts/verify_monthly_limits.js`) tvrdí `TIERS.*.monthly_readings == MONTHLY_LIMITS`.
- **Proč:** Předplatné se prodávalo jako 50/75 castů měsíčně, ale proxy je nikdy nepočítala — předplatitel mohl čerpat neomezeně. Kapacita = přímý náklad (hlas ElevenLabs + model).
- **Klíčové rozhodnutí — Ask Rúnar NENÍ cast:** follow-up visí na čtení, které se už započítalo, je omezený na 1 na čtení (`_askUsed`) a předplatitele dnes nestojí nic. Počítat ho by **tiše půlilo zaplacené předplatné**. Ask se proto hlásí `mode:'ask'` (týž kanál, jakým `runar-gathering.js` posílá `ceremonial`) — **ne** odvozením z journal payloadu: ten je `null`, když se čtení neukládá ('someone' u netestera), takže by se ask jedněm počítal a druhým ne (§18: „je to ask" ≠ „uložilo se to").
- **Fail-open:** chyba čtení počítadla → čtení projde + server-side log. Zablokovat platícího předplatitele kvůli výpadku infry je horší než jedno nezapočítané čtení. (Odečet kreditů zůstává bezpodmínečný — tam by fail-open byl exploit.)
- **Reality note:** Kredity RS = per typ čtení (SPREAD_COSTS); měsíční limit počítá TYTÉŽ jednotky (Yggdrasil = 5 z limitu). Proxy je Deno a nemůže importovat klientský config → kopie limitu je nevyhnutelná; poctivost drží smoke ⑨ (ověřeno záměrným rozejitím obou stran — check zčervenal). `mode` z `callProxy` se dosud vůbec neposílal (byl vždy `''`); teď se posílá.
- **Affected doc(s):** CLAUDE.md (DB sloupce), RUNAR_BACKLOG.md, MEMORY.md, sql/2026-07-16_monthly_cap.sql
- **Reverzibilita:** snadná (odstranit blok eligibility v proxy; sloupce mohou zůstat).

---

## 2026-07-16 — SEASON_POOLS: rebalance voda→pevnina (prompt v0.8)

- **Typ:** implementation (návrh + IS ověření: Cowork · zápis, ověření a commit: Code — viz protokol níže)
- **Co se změnilo:** Sezónní obrazy v `SEASON_POOLS` (runar-character.js) převáženy od vodních k pevninským. Řezy: `hs_seafog`, `hs_coldsea`, `hs_terns`, `es_coastfog`, `es_seasnap`. Úprava: `dw_stars` (kyrrum firðinum → svörtu hrauninu). Přidáno: `hs_ravenmoor`, `hs_basalt`, `es_mosslava`, `es_mountain`. `RUNAR_PROMPT_VERSION` 'v0.7' → 'v0.8'.
- **Proč:** Analýza podílu vodních obrazů per sezóna: highsummer 44 %, earlysummer 35 % — proti autumn 0 %. Rúnarův hlas sklouzával k moři/fjordu/mlze bez ohledu na runu; Island není jen pobřeží. Cíl = rozšířit rejstřík (láva, čedič, mech, hory, havran), ne přidat objem.
- **Reality note:** Pool teče do promptu přes `_seasonalImagery` → změna MĚNÍ výstup čtení → bump prompt_version je podmínka toho, aby šel efekt změřit (§18 #4: kvalitu čtení měřit evalem, ne hádat). Měří se až na další dávce čtení.
- **Přepočet poměrů (Code, nezávisle, z git objektů):** Coworkova čísla PLATÍ, ale **jen pod jeho definicí vody** = moře/fjord/pobřeží/řeka, BEZ srážek. Pod ní sedí autumn 0 %, deepwinter 18 %, darkening 20 %. Pod širší definicí (rain/fog/drizzle/sleet = taky voda) vychází PŘED: highsummer 50 %, earlysummer 41 %, autumn **13 %** (`au_coldrain`, `au_coldfog`) — a PO rebalanci má highsummer pořád **35 %**. Směr je v obou čteních identický, takže rebalance stojí; ale **„autumn = 0 %, vzor" platí jen pro mořský drift**. Je-li drift „mokrá šeď", zbývá v highsummer rezerva → rozhodnout až podle evalu v0.8, ne dalším řezem naslepo.
- **IS ověření:** všech 5 nových/změněných IS řetězců přes is-grammar-qa (GreynirCorrect) = 0 nálezů kromě Z002 (velké písmeno) — u útržků vkládaných doprostřed promptu falešný poplach. Pády ověřeny ručně (ríða+dat, yfir+ak = pohyb vs yfir+dat = poloha, í/gegn+dat). `svörtu hrauninu` = silné adj + určité podst., tj. TÝŽ vzor jako nahrazované `kyrrum firðinum` → nezavádí nový vzor; případná revize vzoru = otázka na celý pool, ne na tento řádek.
- **Incident (souvisí):** při zápisu Cowork zapsal soubor useknutý — přišel o `buildYggdrasilPromptNine`, `buildYggdrasilPrompt` a konec RP_YGGDRASIL (SyntaxError = mrtvý celý reader, ne jen Yggdrasil). Příčina = známá vada v `memory/working-style.md` (2026-07-09): bash mount v Coworku podstrčí při ČTENÍ kratší verzi, write-back pak uloží useknutý soubor. Třetí výskyt (dříve MEMORY.md, runar-app.js). Code opravil nedestruktivně: obsah rebalance ponechán, ztracený ocas obnoven doslovně z HEAD (ověřeno: node --check + smoke 9/9 + diff proti HEAD výhradně uvnitř SEASON_POOLS). **Pozor na past v diagnóze:** Cowork usoudil, že soubor našel už rozbitý — ale to pozoroval skrz týž rozbitý mount, a `M` v git statusu kontroloval až po vlastním zápisu. Krátký read (1179) zdravého souboru (1225) je přesně to, co ta vada dělá.
- **Protokol Cowork ↔ Code (platí od teď):** Cowork **nezapisuje do repa vůbec** (ani docs). Čte **jen** přes `git show HEAD:<path>` — git objekty jsou checksumované, takže poškozené čtení spadne nahlas místo tichého uříznutí; to platí i pro ANALÝZU, ne jen pro patche (poměry v SEASON_POOLS se počítaly z mount readu — kdyby řez padl do poolů, vyjdou čísla, co nikdy neexistovala, a nic nevaruje). Patch předává **v chatu** jako přesné kotvy (starý → nový řetězec, doslovně) + čím to ověřil. NE do `scripts/_patch.py` — to je scratch cesta Code, přepisuje se každým úkolem. Code patch aplikuje, ověří (smoke + node --check + IS nástroje), commitne a pushne. **Signál zpět** = push + řádek v `memory/MEMORY.md` (SW verze + hash) — sdílený soubor přes junction, žádný jiný kanál. Cowork se pak srovná `git pull` a čte zase přes `git show HEAD:`.
- **Affected doc(s):** MEMORY.md, RUNAR_DECISIONS.md
- **Reverzibilita:** snadná (pool je data; vrátit 5 řezů + odebrat 4 přírůstky).

---

## 2026-07-16 — Perth: „divination/mystery" → „chance, luck, fate in the making"

- **Typ:** intent + implementation (návrh: Cowork · schválil: KUKY 2026-07-16 · zápis + ověření: Code)
- **Co se změnilo:** `runar-runes.js`, runa Perth — 3 řádky. `k:` 'hidden things, mystery, fate, divination, the unseen' → 'chance, hidden things, fate in the making, luck, the unseen'. `k_is:` 'duldir hlutir, leyndardómar, örlög, spádómar' → 'tilviljun, duldir hlutir, örlög í mótun, happ, hið hulda'. `formula_is:` 'Perþ er rún leyndarmálsins, örlaga og þess sem felst undir yfirborðinu.' → 'Perþ er rún tilviljunar, leyndarmálsins og örlaga sem enn eru að mótast.'
- **Proč:** „divination"/„spádómar" je v aplikaci na věštění z run **kruhové** — runa, jejíž význam JE věštění, svádí model mluvit o té praktice místo o světě. To je přesně to, proti čemu stojí `_describeRule` („describe, do not explain", v0.5, eval Priority 1). Nové znění drží Perth u losu/náhody/osudu, který se teprve tká — což je i historicky obhajitelnější čtení (kostka/los) než „věštění".
- **Proč (doplnil Cowork — pozorovaný drift, ne jen teorie):** model četl Perth jako „skrytá jistota čeká na odhalení" → drift k **předurčení**. Posun `örlög` → „örlög í mótun" + formula „…og örlaga sem enn eru að mótast" drží osud **v pohybu**, ne pevný — tj. Rúnarovu filozofii „runy neurčují cestu". To je vlastní důvod té změny; kruhovost „divination" (níže) je až druhý.
- **Reality note:** Klíčová slova tečou do promptů přes `rk(r)` ve všech builderech → MĚNÍ výstup čtení. **`RUNAR_PROMPT_VERSION` zůstává 'v0.8'** (nebumpuje se na v0.9) schválně: rebalance SEASON_POOLS i tahle změna dosedly ve stejné hodině, PŘED jakoukoli eval dávkou, takže tvoří **jednu kohortu** — bump by rozdělil eval buckety bez užitku a v0.8 by zůstala verze bez čtení. Pravidlo „bump při každé změně promptu" tímhle není porušené, je naplněné jeho účel (verze = to, co ta čtení vyrobilo).
- **IS ověření:** is-grammar-qa čisté (jediný nález S004 „Perþ → Perú" = GreynirCorrect nezná jméno runy, falešný poplach téže třídy jako lestrunum/rúnurnar). Genitivy `tilviljunar` / `leyndarmálsins` / `örlaga` ověřeny; `sem enn eru að mótast` se váže na `örlaga` (plurál) → `eru` ✓.
- **Nedořešeno (drobnost):** RUNAR_DESIGN.md ř. 486 píše „Perthro" — porušuje pravidlo správných jmen run (Perth). Nesaháno: soubor má rozdělaný Cowork.
- **Affected doc(s):** žádný — význam Perth nikde v docs popsaný není (zmínky jsou jen element/Shadow, sigil tahová třída, pattern listy).
- **Reverzibilita:** triviální (3 řádky dat).

---

## 2026-07-14 — Clarity register: zaostři, ale odpověď nedoručuj (prompt v0.9)

- **Typ:** decision + implementation (reading prompt)
- **Scope:** reading
- **Co se změnilo:** `_registerContext` index 1 (Clarity/Skýrleiki) v `runar-character.js` — **jediná z 5 register-variant, co tlačila na rozuzlení** („make the unclear clear" / „gerðu hið óljósa ljóst") → runa se ohýbala na „odpověď už v tobě je". Nové znění drží focus (legitimní skýrleiki), ale zakazuje doručit odpověď:
  - EN: „bring one thing into focus, **not one answer**; sharpen what matters and **leave the deciding to them**."
  - IS: „dragðu eitt skýrt fram, **ekki eitt svar**; skerptu það sem máli skiptir, en **ákvörðunin er leitandans**."
  Guard prefix („Þetta er tilhneiging, ekki pöntun…") beze změny — mění se jen `mapIs[1]`/`mapEn[1]`. `RUNAR_PROMPT_VERSION` v0.8 → **v0.9**.
- **Proč:** Bylo to v rozporu s Rúnarovou filozofií („runy neurčují cestu") — Clarity jako jediná osa tlačila na doručení odpovědi. Nové znění zrcadlí sourozenecké registry (Reflection: „opnaðu spegil, ekki svar"; Confirmation: „hvorki staðfestu né hrektu"). Clarity = nejsledovanější osa driftu.
- **Affected doc(s):** tento záznam
- **Reality note:** Návrh + BÍN ověření = **Cowork** (`islenska`: `dragðu`/`skerptu` imp. · `svar` hk · `eitt` HK · `máli` þgf · `skiptir` 3.os · `ákvörðunin` nf+gr · `leitandans` ef+gr — všechny tvary čisté; idiomy „það sem máli skiptir" + „ákvörðunin er leitandans" přirozené). Aplikace + ověření = **Code**: seed-and-assert (oba staré řetězce přesně 1×), `node --check` OK, `check-is.py` čisté, **smoke 10/10**. §1: JS přes Python (`fix_clarity_register.py`). Verze bumpnuta → nová čtení nesou `prompt_version: v0.9` (readings viewer je odliší od v0.8 = podklad pro A/B). ⚠️ **NEZMĚŘENO evalem** (§18.4 „změny kvality čtení = MĚŘIT, ne hádat"). **Rozhodnutí KUKY 2026-07-14: eval AŽ Z OSTRÝCH DAT** — nechat běžet, nasbírat reálná v0.9 čtení od uživatelů/testerů a teprve pak pustit A/B v0.9 vs v0.8 na ose Clarity („doručuje odpověď vs zaostřuje"). **NE syntetický eval teď** (levnější + reálnější signál, cena = pomalejší zpětná vazba). Podklad = `readings.prompt_version` + Shrine Readings viewer.
- **Reversibility:** easy (2 řetězce zpět + verze zpět; DB beze změny)

---

## 2026-07-14 — „already" pryč z úhlů čtení (B5; jedna kohorta s Clarity, v0.9)

- **Typ:** decision + implementation (reading prompt)
- **Scope:** reading
- **Co se změnilo:** `READING_ANGLES` #2/#6 (EN) + `READING_ANGLES_IS` #2/#6 (IS) v `runar-utils.js` — 2 z 8 úhlů sely „already"/„þegar" = **cold-reading motor „už to v tobě je"**. Úhel se losuje per čtení → **~25 % single čtení** dostalo „already"-úhel. Nové znění drží záměr úhlu (gift / pohyb), ale bez „already":
  - EN #2: „what this rune **offers, and what it asks in return**." · EN #6: „Lead with what is **stirring** — name the movement this rune makes visible."
  - IS #2: „hvað þessi rúna **gefur og hvað hún biður um í staðinn**." · IS #6: „Byrjaðu á því sem **hrærist** — nefndu hreyfinguna sem þessi rúna gerir sýnilega."
- **Proč:** Stejné téma jako Clarity (2026-07-14): Rúnar nemá doručovat „odpověď už v tobě je". Úhly to sely losem u čtvrtiny čtení.
- **Affected doc(s):** tento záznam
- **Reality note:** Návrh + BÍN ověření = **Cowork** (`gefur`/`biður` 3.os · `í staðinn` idiom · `hrærist` hrærast MM · `hreyfinguna` þf+gr · `sýnilega` kvk þf = shoda s hreyfinguna — čisté). Aplikace + ověření = **Code**: seed-and-assert (4× přesně 1×), `node --check`, `check-is.py` čisté, **smoke 10/10**. §1: JS přes Python (`fix_already_angles.py`).
  **Rozsah (schválně úzký):** `READING_ASPECTS` ř. 176 má podobné „already giving", ale **ověřeno §19, že je pool MRTVÝ** — `_randomAspect()` se nikde nevolá (jen definice); naopak `_randomAngle()` je živý (`runar-character.js:851`) → do čtení se dostanou jen opravené úhly. Zmizí, až se retiruje mrtvý kód. „already" v Confirmation-registru („has already decided") + spread-beats ponecháno = jiný kontext (stav leitanda / osudová osa), ne cold-read. Celoplošný zákaz „already/þegar" v banned listu = agresivnější, na eval, ne teď.
  **⚠️ Verze NEBUMPLA schválně** (odchylka od Coworkova zadání, vědomá): v0.9 (Clarity) dosedla pár minut předtím s **nula ostrými čteními**, a tohle je totéž téma → **jedna kohorta v0.9 = „cold-read cleanup"**, eval pak měří v0.9 vs v0.8 jako celek. Bump na v0.10 by vyrobil prázdnou kohortu a rozštěpil jeden úklid. Stejný vzor jako precedens u Perth („verze se NEbumpla schválně: obojí dosedlo před eval dávkou = jedna kohorta").
- **Reversibility:** easy (4 řetězce zpět; DB beze změny)

---

## 2026-07-14 — Jméno leitanda: pevný slot → pool (B9; + sjednocení §18 duplikace)

- **Typ:** decision + implementation (reading prompt + §18 dedup)
- **Scope:** reading
- **Co se změnilo:** Klauze „Address {name} once, woven naturally — never as the opening word." byla **identická copy-paste 5× EN + 5× IS** v closing/bigInstruction všech packů (RP_SINGLE/KRIZ/NORNS/HORSESHOE/YGGDRASIL) = **pevný slot** (jméno padalo vždy stejně) **a zároveň §18 duplikace**. Nově **jeden pool + helper** `_namePlacement(name, lang)` v `runar-utils.js` (vedle `_randomAngle`), 4 varianty umístění losované per čtení: **early / middle / late / vůbec ne**. Character.js: 10 call sites (`' + _namePlacement(name, 'en'|'is') + '`) — lang je daný packem, proto literál.
- **Proč:** Anti-slot. Pevné umístění jména = strojový podpis. Varianta **„vůbec ne" (~25 %)** je hlavní rozbíječ slotu — leitanda má model i tak v `PERSON:` kontextu. Bonus: 10× duplikovaná klauze → jeden zdroj (§18).
- **Affected doc(s):** tento záznam
- **Reality note:** Návrh + BÍN ověření IS poolu = **Cowork** (`snemma` ao · `miðjunni` þgf+gr · `viðurkenningu` þf · `fremur` ao · `kynningu` þf · `seint` ao · `lokin` hk ft+gr · `hljóðláta` kvk þf = shoda s viðurkenningu · `skaltu` 2.os · `nota`/`standa` nh — čisté). Aplikace + ověření = **Code**: seed-and-assert (EN přesně 5×, IS přesně 5×), `node --check` obou souborů, `check-is.py` čisté, **smoke 10/10**, 10 call sites. **Funkční ověření (§19):** node probe × 400 → reálně padají **4 EN + 4 IS varianty**, **0 nedosazených `{name}`**. Ověřeno i, že `opening word`/`fyrsta orð` v character.js **už nejsou vůbec** (klauze plně přesunuta do poolu). **Falešný poplach vyloučen:** zbylé 4 výskyty „woven naturally/fléttað náttúrlega" jsou o jménu **RUNY** (`Mention <rune> by name once`), ne leitanda → správně netknuté. Load-order OK: character.js se parsuje dřív, ale helper se volá až za běhu (týž vzor jako `_randomAngle`). §1: JS přes Python (`add_name_placement.py`).
  **⚠️ Verze NEBUMPLA** (vědomě, i proti Coworkově domněnce v0.10): v0.9 má **stále ~nula ostrých čtení** a **B10 je ještě ve frontě** → per-téma kohorty jsou při nulovém provozu fantomy (vyrobily by řadu prázdných štítků). **v0.9 = celá úklidová vlna** (cold-read + anti-slot + B10), bump až vlna dosedne a začne provoz. Atribuce jednotlivých fixů by stejně chtěla ostré A/B s trafficem, ne štítek na prázdné kohortě.
- **Reversibility:** easy (revert 2 soubory; pool je aditivní, helper by zůstal neškodný)

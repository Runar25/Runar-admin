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

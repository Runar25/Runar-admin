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
- **Addendum 2026-07-14 (KUKY feedback, PŘES COWORK RELAY) — jméno vynechat ≥50 %:** pool měl omit jen 1 ze 4 slotů → jméno padalo v **75 %** čtení. Feedback „jméno v každém čtení otravuje" = **KUKY** (potvrdil 2026-07-14; ke Code přišlo přes Cowork patch, ne přímo — proto původní „owner feedback" bylo formálně nepodložené, dokud KUKY nepotvrdil). `_namePlacement` nyní vynechá jméno **~55 %** (práh `Math.random() < 0.55`, laditelný klidně výš), zbytek rovnoměrně early/middle/late. Ověřeno probe × 20 000: **EN omit 54.9 %, IS 54.7 %**. ⚠️ Vazba je **pozicová** (`pool[pool.length-1]`) → invariant v komentáři: varianta „vůbec" musí zůstat POSLEDNÍ v obou poolech.
  **🔴 Bug fix (audit HIGH, commit níže):** na **nameless cestě** (Visitor / for-someone / bez uloženého jména) plní `reading.js:238` §12 fallback `you`/`þú` do `name` → pool generoval „do not use the name **þú**", což je v ROZPORU s povinnou druhou osobou v systémovém promptu. 45a091a z toho udělal většinovou (~55 %) větev na anonymním prvním-cast funnelu. Fix: `_namePlacement` na `!name || 'you' || 'þú'` vrací `''` (žádná jmenná instrukce). Reálná jména si drží ~55 % omit. Ověřeno probe.
  **⚠️ Zbývá (IS, → Cowork):** placed varianty vyžadují u reálných IS jmen skloňování z nesklonného tokenu — `Ávarpaðu {name}` chce **akuzativ** (Sigrúnu), `nafn {name}` chce **genitiv** (Sigrúnar). BÍN to nechytí (kontroluje tvary, ne vazby — třída té `örlaga` chyby). Je to ale PROMPT instrukce, ne output → model si jméno v reálné větě skloní sám; nižší priorita, ale na IS pass.
- **Addendum 2026-07-14 — Ask UI copy:** `ask_placeholders[0]` („Ask Rúnar about this reading…" / „Spyrðu Rúnar um þennan lestur…") jen **duplikoval label `ask_lbl`** nad inputem → vyhozen (EN+IS), zbyly 3 reálné otázky. Label `ask_lbl` **netknutý** (EN 233 / IS 488, beze změny — ověřeno proti HEAD). Pozn.: otázka „zrušit/zjednodušit label?" byla **Coworkův nápad, NE požadavek ownera** — KUKY 2026-07-14: „žádný label nerušit". Žádné čekající rozhodnutí, téma uzavřené. Jméno v Ask UI není (ověřeno: `ask_lbl`/placeholdery ho neobsahují, `buildAskPrompt` ho nebere) → do Ask se dostane jen skrz text čtení, který B9 refine ztenčil.

---

## 2026-07-14 — Konec čtení dle valence runy, ne vždy otázka (B10 stage 1: single)

- **Typ:** decision + implementation (reading prompt)
- **Scope:** reading
- **Co se změnilo:** Každé single čtení mělo natvrdo „End with a single open question" (charakter format) **a** q/noq větve to opakovaly → **pevný formální slot**: čtení vždy končilo měkkou otázkou, i pod těžkou runou, kde je útěcha špatně. Nově **`_endingShape(drawn, lang)`** (`runar-utils.js`, vedle `_namePlacement`) losuje tvar konce **dle valence runy** (`HEAVY_RUNES.names`):
  - **těžké** (Hagalaz/Nauthiz/Isa/Thurisaz/Perth/Tiwaz) → „line that stays standing" **nebo** tvrdá otázka na heiðarleika — **bez měkké útěchy** (2 varianty)
  - **ostatní** → otevřená otázka / krátká otázka / **spočinutí bez otázky** (3 varianty ≈ 2:1 otázka:spočinutí)
  Odebráno „vždy otázka" z charakter formátu (EN 2× vč. mrtvého DEF_CHAR_V2, IS 1×) + ze single q/noq větví (EN 2, IS 2). Injektáž do `buildReadingPromptSingle` hned za q/noq větev.
- **Proč:** Anti-slot (§D1/F2). Povinná otázka na konci = strojový podpis; navíc pod těžkou runou měkký konec **popírá samotnou runu**. Poměr je laditelný poolem, finál rozhodne eval.
- **Affected doc(s):** tento záznam
- **Reality note:** Návrh + BÍN ověření IS = **Cowork** (`snýr` 3.os · `leitandanum` þgf+gr · `stuttri`/`harðri`/`hljóðlátri` kvk þgf · `línu` · `hvílir` 3.os · `stendur` · `huggun` kvk · `heiðarleika` kk · `rúnina` þf+gr — čisté; homografy `þunga`/`létti` schválně ven, `standa`/`huggun` dovnitř). Aplikace + ověření = **Code**: seed-and-assert (EN format přesně 2×, ostatní 1×), `node --check`, `check-is.py` čisté, **smoke 10/10**. **Funkční probe (§19):** node × 400 na runu → **těžké dávají 2 varianty (obě bez útěchy), ostatní 3 vč. spočinutí; leak-check „dostala těžká runa měkký konec" = 0**. Ověřeno i, že v single cestě nezbyl žádný natvrdo daný konec. §1: JS přes Python (`add_ending_shape.py`).
  **Rozsah = STAGE 1 (jen single).** Spready + life-rune builder (ř. ~671/1085/1098/1179) **zatím drží „end with question"** = vědomá dočasná nekonzistence; stage 2 (spready) ji zavře a tím uzavře i vlnu.
  **Verze NEBUMPLA** — pokračuje **vlna v0.9** (cold-read + anti-slot).
- **STAGE 2 HOTOVO (`57e8324`, 2026-07-17):** spready dodělány. `_endingShape` je array-aware (těžký, když JAKÁKOLIV runa spreadu je těžká; single back-compat drží), ENDING_HEAVY[0] přeformulováno „the rune"→„it" / „rúnina"→„það" (sdílený pool). Injektáž do 4 spread builderů, odebráno pevné „end with question" z Kříž beats + Norns/Horseshoe/Yggdrasil. Life-rune builder (ř. 637/671) schválně ponechán. Ověřeno: seed-and-assert (inject 4×, removals/reword 1×), smoke 10/10, probe 600× (heavy spread → 0 měkkých konců EN+IS, light → open pool). **Vlna v0.9 UZAVŘENA** (Clarity · already · jméno-slot+omit · Ask placeholder · B10 single+spread). Model KUKY: jeden den analýzy = jedna verze = v0.9; bump až se objeví reálná provozní čtení (zatím DB jen v0.6 — dnešní 07-17 čtení sežral **Supabase výpadek**, ne bug). Deploy = jen Pages (frontend), Supabase incidentu se netýká.
- **Reversibility:** easy (revert soubory; pooly aditivní)

---

## 2026-07-17 — Security hardening: credit/API-key holes closed + write-surface guard

- **Typ:** implementation (owner-triggered: „hlídej divná přidělení kreditů")
- **Co se změnilo (5 děr + guard):**
  1. **`user_profiles` sloupcové granty** (`sql/2026-07-16_user_profiles_column_grants.sql`). RLS policy `auth.uid()=id` je korektní ŘÁDKOVÝ filtr, ale `authenticated` měl tabulkový UPDATE → RLS neumí filtrovat SLOUPCE → každý přihlášený si PATCHnul `credits_balance`/`tier`/`month_units`/`free_balance` z konzole (ověřeno naživo: `update({month_units:42})` → 200, Array(1)). `cmd=ALL` navíc = DELETE → smaž řádek → `upsertProfile()` ho založí z defaultů → `free_balance=1` znovu. Fix: `revoke insert,update,delete`; `grant insert(id)`; `grant update(12 ne-peněžních sloupců)`. Peníze píše jen service_role (edge fce, obchází granty).
  2. **`mode:'ceremonial'` bypass smazán** (claude-proxy). Prázdná větev = čtení zdarma bez odečtu komukoli, kdo pošle ten client-string. Gathering-čtení je mrtvý kód (`generateWhispersReading` bez volajícího, `whispers-*` UI v reader.html neexistuje → `updateWhispersUI` běží naprázdno). Ceremonial teď propadá do free_balance (RS) / počítá se do capu (placení). Až Gathering přijde se stromem, platí 3 kredity placenou cestou.
  3. **`mode:'ask'` cap-verifikace** (claude-proxy; moje vlastní chyba téhož rána). Ask obcházel měsíční limit na důvěru client-stringu. Teď cap-exempt jen když je to opravdový follow-up: `kind:'ask'` na `readings` řádku, který existuje, patří userovi a má prázdný `follow_up`. Váže 1 free follow-up na 1 započítané čtení; padělek se počítá jako cast. Fail toward counting.
  4. **`elevenlabs-static` admin auth**. 121 řádků co pálí EL klíč a `upsert:true` přepisuje sdílené Collection audio — za komentářem „Admin only" a NULOVOU kontrolou, deploylé `--no-verify-jwt`. Fix: admin JWT gate (`ADMIN_EMAILS`), shrine posílá session token, CORS + `Authorization`, text clamp 3000.
  5. **Clampy**: claude-proxy `max_tokens`≤2500 (největší legit = life_rune_premium 2000), elevenlabs text≤3000 zn (nejdelší Yggdrasil ~1661). Nemění kdo-co-smí, jen strop útraty na API klíč.
- **Guard:** `scripts/verify_write_surface.js` = **smoke ⑩** (klient vs granty: sloupec bez grantu = tichá 403 v produkci · klient píše peníze · privilegovaný sloupec v grantech — 3 způsoby červené, ověřeno záměrným rozbitím). `sql/audit_write_surface.sql` = DB strana (`has_column_privilege`, všechny tabulky, owner pouští).
- **Ověřeno bezpečné (ne díra):** mincovna `gift_codes` — RLS zapnuté + policy `auth.email()=admin` → non-admin vidí 0 řádků a nemůže INSERT. `has_table_privilege=true` je jen tabulkový grant; při zapnutém RLS je bránou policy. Rozdíl proti `user_profiles`: tam policy `auth.uid()=id` = tvůj vlastní řádek (každý match), tady `auth.email()=admin` = nikdo kromě adminů.
- **Proč to nikdo neviděl:** každá vrstva zvlášť vypadá správně (policy korektní, granty Supabase default, klient píše legitimní sloupce). Díra je ve SPÁŘE mezi vrstvami — RLS ŘÁDKY vs granty SLOUPCE — a žádný linter/security-advisor spáru nevidí. Stejný tvar jako našel guard: ptát se „co uživatel FAKT může zapsat", ne „je kód správně".
- **Zbývá (před launchem, ne teď):** redeem-replay — `delete-account` nulluje `gift_codes.used_by` → prodaná karta uvolněna → re-register + re-redeem donekonečna. Potřebuje PRODANOU kartu; žádná neexistuje (žádný checkout). Fix = burn-guard na `used_at` místo `used_by` + přehodit pořadí v delete-account.
- **Zásada (owner):** kredity uděluj JEN vyražením kódu, NIKDY ručním sáhnutím na `credits_balance`. Ledger/účetnictví se NESTAVÍ — není checkout ani platící zákazník; předčasné.
- **Affected doc(s):** CLAUDE.md (DB sloupce už měly month_*), MEMORY.md, sql/ (3 soubory), smoke.py (⑩)
- **Reverzibilita:** granty snadno (re-grant); proxy fixy snadno; guard je jen kontrola.

---

## 2026-07-17 — Durable journal queue: čtení přežije výpadek DB

- **Typ:** decision + implementation (resilience)
- **Scope:** reading (klient + proxy)
- **Co se změnilo:** Po dnešním Supabase výpadku (07-17), který sežral celé čtení (insert i follow_up = DB zápisy, spadly s DB), zavedena **klientská fronta + idempotentní retry** (KUKY schválil Fázi 1+2). **Klient:** `_uuid()` per čtení/ask; po `callProxy` když server nepotvrdí zápis (chybí `reading_id`/`ask_saved`) → čtení (meta + model text) do localStorage fronty (`pendingReadings`/`pendingAsks`, cap 50). `_flushPending` (utils.js) dosype **při startu appky + po každém čtení**: readings first (aby ask měl parent), pak asks. UUID = **kanonický reading id napříč** (`_lastReadingId = res.reading_id || _journal.id`) → ask linkuje správně, ať čtení uložilo živě nebo je ve frontě. **Proxy** (`claude-proxy`): `persistJournal` helper sdílený živou cestou i novým `mode:'resave'` (bez Claude/kreditu/capu/rate-limitu); insert **idempotentní na klientské `id`** (dup = 23505 = už uloženo, retry nezdvojí); follow_up **deduped přes `ask_entry_id`**; vrací `saved`/`ask_saved`. `credits_used` server-authoritative (**resave = false → outage čtení zdarma**; deduction je taky DB zápis, spadl s outage, takže nebylo naúčtováno).
- **Proč:** čtení = eval zlato; výpadek DB je nesmí tiše ztratit. Pokrývá přesně dnešní scénář (Claude jelo, DB zápis spadl).
- **Affected doc(s):** tento záznam
- **Reality note:** Ověřeno: node --check klient, smoke 10/10, funkční probe (fronta drží při DB-dole, vyprázdní při DB-nahoře, pořadí reads<asks, idempotence dle id, UUID v4). **Proxy TS NEOVĚŘEN lokálně** (žádný deno v prostředí) → **Cowork review + `supabase functions deploy claude-proxy`** (deploy sám kompiluje/bundluje → TS chyba **spadne deploy**, ne rozbije live proxy). **Pořadí deploy: proxy PŘED klientem** — ale klient **degraduje bezpečně**: resave na starý proxy = 400 (prázdný prompt) → `saved` undefined → položka zůstane ve frontě (retry po deployi); normální čtení na starém proxy jede (staré proxy ignoruje klientské `id`, vrátí vlastní reading_id, klient ho použije). Commity `8ef1546` [proxy] + `2319b10` [reading]. **Meze:** user smaže storage / nevrátí se před zotavením = to jedno čtení pryč (localStorage per-zařízení); pravá nulová ztráta = durable store nezávislý na DB = na betu overkill. §1: klient JS via Python; proxy TS via Edit (double-quoted, apostrof-riziko nulové).
- **Reversibility:** medium (revert 4 soubory + re-deploy starý proxy; fronta aditivní, helper neškodný)

---

## 2026-07-17 — AKČNÍ PROTOKOL CODE ↔ Cowork  (po sporu o claude-proxy)
Platí pro OBĚ session. Vzniklo z reálné události: Cowork zasáhl do repa bez stopy → CODE viděl
stav až potom a vyvodil závěr o minulosti → owner musel arbitrovat. Stav bez historie nejde přečíst.

1. NESAHAT na sdílené repo bez stopy. Zásah = commit ([cowork]/[code]) + push ihned.
   Nejde commitnout (lock/přístup) → NESAHAT, jen ohlásit. Neviditelná změna je horší než žádná.
2. AKČNÍ LOG: jedna řádka na KAŽDÝ zásah do repa, sem do RUNAR_DECISIONS.md:
   YYYY-MM-DD HH:MM · KDO · CO · PROČ · OVĚŘENÍ
3. Tvrzení o stavu nese ČAS + KANÁL. „675 řádků" bez „22:20, přes můj strom" = dojem, ne tvrzení.
4. Jeden kanál na třídu faktu (§18): stav repa = git (git show HEAD:, hash-object), NE něčí mount.
   Cowork worktree NETVRDÍ — ptá se CODE.
5. Handoff obsahuje sekci ZMĚNĚNO: (co jsem změnil), ne jen co jsem našel. Povinná i prázdná.
6. Než druhého opravíš, přečti AKČNÍ LOG. Timeline před závěrem.

### AKČNÍ LOG — první záznamy
2026-07-17 22:16 · COWORK · přepsal supabase/functions/claude-proxy/index.ts obsahem z HEAD
  · PROČ: přes mount viděl worktree jako 528 ř./useknutý; git status M + diff 529/675; esbuild i tsc
    hlásily syntax error (unexpected EOF); `git restore` odmítl kvůli zaseklému .git/index.lock
  · OVĚŘENÍ: git hash-object worktree == HEAD blob (5481208…)
  · ⚠️ SPORNÉ/NEROZHODNUTO: CODE na svém autoritativním stromě hlásí 675 ř./kompletní i PŘED tím
    → možný Cowork mount artefakt. Obsah je tak jako tak == HEAD, deploy bezpečný.
    Poučení = pravidla 1+2: kdyby byl záznam, spor nevznikne.
2026-07-17 22:16 · SYSTEM · .git/index.lock zaseklý; Cowork nemá práva smazat („Operation not permitted")
  → OWNER smaže ve Windows. Dokud tam je, nejdou git add/commit/restore.
2026-07-17 22:37 · CODE · ověřil stav na autoritativním (nativním) stromě, ne přes mount
  · PROČ: pravidla 3+4 — tvrzení o stavu se ověřuje přes git, ne cizí mount
  · OVĚŘENÍ: `ls .git/index.lock` → neexistuje (žádný lock); claude-proxy má obě mé edity
    (cappedMaxTokens + legitAsk, grep=5); `git hash-object` worktree == HEAD blob; HEAD=b920598, pushnutý.
  · ZÁVĚR sporného bodu výše: „528 ř./useknutý" byl Cowork MOUNT ARTEFAKT — autoritativní strom
    byl kompletní po celou dobu (pravidlo 4: autorita = git na nativním stromě, ne mount view).
2026-07-17 22:40 · CODE · zapsal tento AKČNÍ PROTOKOL + log do RUNAR_DECISIONS.md a commitnul
  · PROČ: Cowork ho předal v chatu, protože sám nemohl commitnout (viděl lock); Code = jediný zapisovatel
  · OVĚŘENÍ: git commit + push (hash v handoffu zpět).
2026-07-17 22:44 · CODE · review durable-journal proxy práce (Cowork, commity 8ef1546..b920598) + deploy HEAD proxy
  · PROČ: klientská půlka (mode:'resave') už živá přes Pages, ale nasazená proxy (ddd4c46) handler neměla
    → rozštěp; proxy = doména CODE, review před live je na mně
  · OVĚŘENÍ: celý money-path diff ddd4c46..HEAD přečten — mé fixy (cappedMaxTokens/legitAsk/ceremonial)
    netknuté; credits_used zůstává server-authoritative; resave = bez Claude/odečtu/capu, idempotent
    (client-id 23505 dedup), rate-limited, credits_used=false (žádný money exploit). Deploy OK, prod == HEAD.

---

## 2026-07-17 — No-cold-read gate + follow-up gaty (prompt v1.0)

- **Typ:** implementation (zadání: Cowork eval hand-off; ověření + zápis: Code)
- **Co se změnilo:** nový sdílený `_noColdRead(lang)` v runar-character.js, zapojený do **všech 5 čtecích builderů** (single + 4 spready) **i do `buildAskPrompt`**. Follow-up navíc dostal `_describeRule` (nikdy ho neměl) a **anti-mirror** pravidlo. `RP_ASK.rules` přestalo modelu říkat, ať prohloubí co runy „already said / sögðu þegar". `RUNAR_PROMPT_VERSION` v0.9 → **v1.0**.
- **Proč:** eval v0.9 = „already"/„þegar" ve 4 z 5 čtení + follow-up sklouzával do cold-read a fate-in-world, kdykoli ho dotaz navedl, zatímco tělo drželo. Vada NENÍ to slovo, ale **tah**: říct leitandovi, co je v něm „už" pravda, je nevyvratitelná domněnka v hávu vědění; „svět to připravoval" je týž tah otočený ven (G2b).
- **§18:** gate je JEDEN helper, ne stejná věta nakopírovaná do RP_ASK per jazyk. Anti-mirror je ask-specifický (jen follow-up má uživatelské tvrzení, kterému lze přitakat) → žije v RP_ASK packu, což je zavedený vzor pro jazykové varianty.
- **IS ověření (§19.2):** prostřední věta gate byla nejdřív bezslovesný výčet za dvojtečkou. Rod/číslo ručně ověřeny správně, ale GreynirCorrect ji **nerozparsoval (E001)** → nástroj za ni nemohl ručit. Přepsáno na plné věty: **0 nálezů**, a pojmenovává přesně tu vadu („hefur ekki verið að undirbúa neitt"). Zbylé flagy = známé falešné poplachy (Z002 u instrukčního fragmentu; `rúnin→rúmin`, tvar, který už používá `_describeRule`).
- **Guard:** smoke ⑧ rozšířen — staví **reálný ask prompt** a tvrdí, že gaty dotečou do single + 4 spreadů + follow-upu v obou jazycích, a že RP_ASK už neobsahuje „already said". Ověřeno odpojením gatů od asku → červená.
- **NEUDĚLÁNO záměrně (task 1a):** angl „gift — what this rune is **already** giving" je v `READING_ASPECTS` = **mrtvý kód** (`_randomAspect()` nemá v celém repu jediného volajícího; grep js+html). Živý pool `READING_ANGLES` (konzumovaný `_randomAngle`, ř. 851) „already" **neobsahuje vůbec**. Přeformulovat ho by v produkci nezměnilo nic → skutečné živé zdroje jsou RP_ASK a přirozený jazyk modelu, proto bylo 1c (gate i do hlavního těla) povýšeno z „volitelné" na nutné. Mrtvé pooly (`READING_ASPECTS`, `IMAGERY_SOURCES`, `READING_REGISTERS`) → do úklidové fronty.
- **NEUDĚLÁNO (task 3 — mylná premisa):** Cowork tvrdil, že hlavička čtecí karty tahá pro IS latinské `n` („PERTH"). **Neplatí:** `rn(r)` vrací `lang==='is' ? r.is_n : r.n` (runar-utils.js:324) a hlavička renderuje `rn(drawn)` (runar-reading.js:188) → už teď ukazuje „PERÞ (DULDIR HLUTIR)", což potvrzuje i owner screenshot. Rozhodnutí „IS = islandský název všude" je tedy **už splněné**. Jediná možná změna = uříznout závorkový gloss, což je designové rozhodnutí (dotklo by se i badge životní runy) a použil by se **existující** `rnSplit().name`, ne nový split. Čeká na KUKYho.
- **Měření:** efekt NEZMĚŘEN — čeká na v1.0 kohortu. Cíl = „already" rate dolů proti baseline (EN 46 %) i proti v0.9. Export stejným SELECTem (`order by drawn_at desc limit 500`), rozdělit dle `prompt_version`.
- **Affected doc(s):** MEMORY.md
- **Reverzibilita:** snadná (odebrat helper + 6 zapojení, vrátit verzi).
2026-07-17 23:05 · KUKY → CODE · rozhodnuto: hlavička čtení zůstává „PERÞ (DULDIR HLUTIR)" —
  závorková glosa ZŮSTÁVÁ (dává významový klíč). Task 3 z Coworkova hand-offu tím UZAVŘEN
  bez jakékoli změny kódu · OVĚŘENÍ: `rn()` už IS název vrací (utils.js:324), hlavička ho
  renderuje (reading.js:188) — stav odpovídá rozhodnutí, není co měnit.
2026-07-18 · CODE-tune · zrcadlo `Claude/Projects/RÚNAR the rune keeper/` vyřazeno — 13 duplicitních
  docs + `sync-to-cowork.py` PŘESUNUTY do `_archived-2026-07-18/` (přesun, ne smazání = vratné)
  · PROČ: kanonický doc žije jen v repu (§17); dvě kopie = zdroj driftu, který stál 2026-07-17 půl dne
  · OVĚŘENÍ: každý soubor porovnán s repem PŘED přesunem — CLAUDE/SEGMENTATION_SPEC/tree-of-life 0 řádků
    navíc · runar-project/tree-forces/tree-placement identické · patterns 1 ř. (zalomení) · PRICING 4 ř.
    (přeformátovaná tabulka) · DESIGN obsah v repu (:476) + zrcadlo má stará jména run = zastaralé
    · MEMORY zastaralý snapshot 2026-07-04 (jeho „navíc" jsou dnes nepravdivá fakta) · CONTEXT/working-style
    unikátní sekce portnuty v 798b8b5 · TREE_LAB v repu jako docs/archive/tree/.
  · ⭐ KOŘEN NALEZEN: duplikáty nevznikaly nedbalostí — vyráběl je `sync-to-cowork.py` (repo→zrcadlo,
    CLAUDE/DESIGN/PRICING/MEMORY + snapshots). Pozůstatek z doby PŘED junctionem, odporuje §17. NENÍ v repu
    ani v git hooku (nespouští se sám), ale kdo ho spustí, kopie se vrátí → vyřazen spolu s nimi.
  · ZŮSTALO v zrcadle (NENÍ v repu, Coworkovy výstupy k předání): AUDIT-docs · CLAUDE_CODE_FILE_RULES
    · RUNAR_EVAL_CHAT_mobil · RUNAR_FEATURES · RUNAR_IS_GRAMMAR_CHECK_CODE · RUNAR_SEGMENTACE_FaseB
    · RUNE_IMAGE_POOLS_draft · tento handoff.

## 2026-07-19 - Export stavu stromu (admin) + upresneni nalezu o nedeterminismu

**Zadani KUKY:** "export stavu. at prestanes hadat." Kontext: hlasil preskakovani mezi polohou
144 a 148 svych 168 cteni. Jeho strom nemam, takze jsem si musel vyrabet synteticky log - a
v jednu chvili jsem dokonce usuzoval ze screenshotu, coz bylo spatne ([[measure-dont-eyeball]]).
Tenhle export ten duvod odstranuje: owner klikne, vlozi JSON, Code si strom postavi PRESNE.

**Format.** Klice `dob` / `rune` / `log` / `viewN` **schvalne stejne jako lab** (`_tree_state.json`),
takze export pujde nacpat i do labu. Log je pole poli + samopopisne `cols`, at se to da precist
i bez kodu. Ladici hodnoty (`crownT`/`trunkT`/`rootsT`) se NEexportuji, i kdyz je lab uklada:
produkce je ma zapecene v buildu, takze by to byl sum.
**`dob` je povinne** - `dobSeed = hashStr(d-m-y)` (tree-prod:195) ridi veskerou nahodu ve strome.
**Velikost:** ~2,1 kB na 40 cteni -> ownerovych 168 vyjde kolem 9 kB, tedy vlozitelne do chatu.
**Neobsahuje text cteni** - jen glyf, element, oblast, intenci a typ spreadu. Napsano i v UI.

**Vada, kterou odhalila az zpatecni zkouska:** export **ztracel priznak `blank`** (9 v originale,
0 v rekonstrukci). Blank ma v `runar-runes.js` glyf U+25CB, ale v branch datech je `odinn` s jinym
glyfem - mapovani jde pres priznak, ne pres glyf. Bez nej by Odinn v rekonstrukci vypadl z poradi
run. V prvnim testu to nahodou nevadilo, protoze Odinn nevedl zadny element; jakmile povede,
rozejde se. **Opraveno** - rune tuple je nove `[glyph, el, 1]` pro Blank. Overeno na logu, kde
Blank stin VEDE.

**Overeno zpatecni zkouskou** (u exportu jediny test, ktery neco znamena): postaven strom,
exportovan, log **rekonstruovan JEN z exportu**, znovu vykreslen -> **shodny otisk** (`407f419c`).
Otestovana i zalozni cesta, kdyz schranka odmitne (textarea + hlaska).

---

### UPRESNENI (dolu) drivejsiho nalezu o nedeterminismu

2026-07-19 jsem zapsal, ze "renderer NENI deterministicky - tyz log da od 3. prekresleni jiny
obraz". **Zmereno presneji: osm po sobe jdoucich kreseb tehoz logu je IDENTICKYCH** a log se
nemutuje. Rozdil se objevuje jen **kolem prepnuti stavu** (jiny log a zpet, cerstve nactena
stranka) a pak se ustali. To je mnohem uzsi jev nez "renderer je nedeterministicky".

Vylouceno merenim: `Math.random` (vse pres seedovany `mulberry32`), cas (zadny `Date`/`performance`
v rendereru ani v trunk/branch), mutace vstupniho logu, kolize globalniho `RUNES` (trunk i branch
jsou v IIFE), zmena `devicePixelRatio`.

**Nediagnostikovano.** Prakticky dopad: mereni obrazu se musi zahrat, jinak lze - coz platilo
i pro me dnes. Zustava jako samostatna polozka.

**Affected doc(s):** RUNAR_TREE.md


## 2026-07-19 — Zvýraznění vybrané větve + DIAGNÓZA „přeskakování"

**Zadání KUKY:** „vybraná větev by se měla označit stejně, jako jsme to měli v labu."
Portováno z `crown-composer.html:675-678` (zlatá linka přes body větve, kreslí se po vykreslení).
Kreslí se na KLIENTOVI, ne v rendereru — transformace po `render()` zůstává nastavená (dpr),
takže se trefí do stejných souřadnic a builder se nemusí měnit.

**Navíc oproti labu: výběr přežije posun posuvníku** a panel se překresluje. Owner tak vybere
větev, posune se a VIDÍ, jestli mu ta samá větev změnila runu. Z inspekce se tím stal nástroj
na přesně tu otázku, kterou dnes řešil.

### ⭐ DIAGNÓZA: „144 skok, 148 Berkano se vrací zpět" NENÍ nedeterminismus

Reprodukováno v prohlížeči na syntetickém logu (10× Berkano, pak 14× Perth), jedna a TÁŽ větev:
```
poloha 24 → Perthro      poloha 18 → Berkano
poloha 14 → Berkano      poloha  6 → Berkano
```
Je to **krok 3, který dělá přesně to, co owner schválil** (přetvarovat při změně pořadí).
Když jsou dvě runy v elementu skoro nastejno, pořadí se **překlápí sem a tam** a vypadá to
jako závada. Ownerova data (skok na 144, návrat na 148) mají přesně tvar oscilace kolem remízy.

⚠️ **Historická poznámka, která to předpověděla:** `RUNAR_TREE_TODO.md` log — *„[OPRAVENO] Větve
přeskakovaly … nejčastější runa tématu se měnila → runa tématu = první viděná."* Tehdejší oprava
byla zmrazení na první viděnou. Krok 3 to zmrazení zrušil; oscilace se vrátila.

**Návrh k rozhodnutí ownera: hystereze.** Nepřeklápět při těsném vedení — nová runa převezme tvar,
teprve když vede o práh (např. 2 čtení). Genuinní dlouhodobý posun projde, blikání kolem remízy ne.
Alternativy: nechat jak je (poctivé, ale nervózní), nebo zmrazit na první viděnou (stabilní, ale
strom přestane mluvit o dnešku). NEROZHODNUTO — čeká na ownera.

**Ověřeno:** zvýraznění kreslí (364 zlatých pixelů s výběrem vs 0 bez), výběr drží přes posun,
panel se aktualizuje. Pojistka proti nulovému rozměru plátna se během testu sama uplatnila
a zabránila nesmyslné trefě — přesně proč vznikla.

**Affected doc(s):** RUNAR_TREE.md

## 2026-07-19 — Inspekce větve klepnutím (admin) + dvě opravy kroku 3

**Proč.** KUKY vidí ve stromě „přeskakování větví" a nabídl, že bude hlásit čísla run. To by
z ownera dělalo měřicí přístroj. Místo toho portována **inspekce z labu** (`crown-composer.html`
— `_pick` + `showInspect`): klepnutí na větev řekne runu · element · ætt · svět · počet čtení
· kolikátá větev svého elementu · pořadí run. Owner pak místo dojmu předá diagnózu.
Souřadnice hlásí jako **polohu na posuvníku**, ne číslo runy — dva stavy jde postavit vedle sebe.

**Admin-only vychází zadarmo** — celý blok `#tree-living` je už gatovaný na `isAdmin()`.

**Rozdíl proti labu (vědomý):** body pro trefování se sbírají PŘED spojením s kmenem. Lab pická
na spojených bodech, takže klik do kmene vybere libovolnou větev — ten úsek sdílejí všechny.

---

### Dvě vady kroku 3, které odhalilo až ověřování inspekce

**(1) Tvar ukazoval runu, kterou uživatel nikdy nevytáhl.** Když má element víc větví než různých
run (9× Kenaz v ohni → dvě ohnivé větve, ale jen jedna runa v pořadí), druhá větev spadla do
starého cyklování poolem a dostala tvar **Thurisaz — runy, která v logu vůbec není.** To je přesně
ta bezvýznamná pestrost, kterou měl krok 3 odstranit; napsal jsem ji tam znovu jako fallback.
**Opraveno:** pořadí se zastaví na posledním skutečném záznamu. Máš-li v ohni jen Kenaz, obě
ohnivé větve jsou Kenaz — opakování se čte jako posílení (§5), ne jako cizí runa. Do poolu se
propadne jen tehdy, když pořadí neexistuje vůbec.
⚠️ Vědomý kompromis: dvě stejné siluety vedle sebe. Lepší než ukazovat runu, kterou uživatel nezná.

**(2) Nulová šířka plátna = tiché nic.** Ve skrytém panelu vrací `getBoundingClientRect()` nuly,
přepočet dělí nulou → `Infinity` → trefování mlčky nefunguje. V produkci k tomu nedojde (při
klepnutí je panel vidět), ale tichý no-op je přesně to, co se pak hledá hodinu. Přidána pojistka.
Nalezeno na vlastním testu — a je to učebnicová ukázka [[guard-test-the-lifecycle]]: netestoval
jsem stav „prvek existuje, ale má nulové rozměry".

**OVĚŘENO V PROHLÍŽEČI** (simulované klepnutí na známý bod větve):
- tři větve správně identifikovány: `Kenaz · 1. · fire · freya · asgard · 9 čtení`,
  `Thurisaz · 2. · fire`, `Uruz · 1. · earth · midgard · 7 čtení`
- klik mimo strom vrací nápovědu
- po opravě (1): jen Kenaz v ohni → `Kenaz · Kenaz · Uruz`; Kenaz 9× + Thurisaz 4× →
  `Kenaz · Thurisaz · Uruz`. **Každá silueta odpovídá runě, která je v logu.**

**Affected doc(s):** RUNAR_TREE.md

## 2026-07-19 — Strom, krok 3: RUNA → TVAR větve (§4) + nález nedeterminismu

**Nález, ne návrh.** Tvarová data jsou v repu hotová: každá z 25 run má `curve`, `sub`, `taper`,
`tipc`, `rhy` (`runar-branch.js`) + elementové archetypy. Renderer je ignoroval a bral tvar podle
POŘADÍ větve: `var brune = bpool[k % bpool.length]` (`tree-prod:202`). Pole `be.rune` (nastavené
na `pool[0]`) se nepoužívalo vůbec. **Důsledek: každý uživatel měl stejné siluety větví.**
Potřetí týž vzorec jako u os (špatný slovník) a Blank (filtr) — hotová věc napojená na špatný vstup.

**Struktura, která to komplikuje:** větev NENÍ jedno čtení, ale elementové téma; `stableAssign`
navíc dává jednomu elementu VÍC větví (každých ~5 čtení další). Varianta „1 čtení = 1 větev"
už jednou rozbila engine (`RUNAR_TREE_TODO.md` bod 5, zahozeno, snapshot `ritual-stable-v2`).

**Řešení: n-tá větev elementu = n-tá NEJČASTĚJŠÍ runa toho elementu.** Největší ohnivá větev nese
tvar runy, kterou v ohni taháš nejvíc; druhá tu druhou. Pestrost zůstává (bez toho by všechny
větve elementu vypadaly stejně), ale začne něco znamenat. Mechanismus je 1:1 podle toho, co kód
UŽ dělá pro ætt (`aettCnt` → `domAett`). **Engine netknutý** — `growBranch` dostává klíč runy
jako dosud, jen smysluplný.

**Rozhodnutí ownera (2026-07-19):**
- *Přetvarovat, když se pořadí změní?* **ANO** — „to je dobrá pointa a řešilo by to ten pohyb,
  přirozeně." Strom mluví o tom, kdo jsi teď; s posuvníkem je změna čitelná jako příběh.
- *Remíza?* **Vyhrává dřívější** — „ta, která ten pohyb zahájila."

**Blank/Óðinn:** mapuje se přes příznak `blank:true` z kroku 2, NE přes glyf — v `runar-runes.js`
má `○`, v branch datech je `odinn` s `◇`. Přes glyf by Óðinn tvar nikdy nedostal.

**OVĚŘENO V PROHLÍŽEČI** (otisk obrazu, ne tvrzení):
- převaha Kenaz `bcbb5a30` vs převaha Fehu `71e7fe7c` → **tvar jde za runou**
- remíza 5:5 s Kenaz první = `bcbb5a30` (shodné s převahou Kenaz); s Fehu první = `71e7fe7c`
  → **tie-break podle dřívější doložen**, ne jen naprogramován

---

### ⚠️ NÁLEZ MIMO ZADÁNÍ: renderer není deterministický (PŘEDCHÁZÍ mé změně)

Týž log vykreslený opakovaně dává **dva různé obrazy**: kresby 1–2 shodné, od 3. jiné a pak už
stabilní. Ověřeno, že to NENÍ moje změna — **stejná signatura na produkci**, která krok 3 nemá
(`f57b81c4`, `f57b81c4`, pak 3× `242d2a74`). Lokálně totéž (`bce01e16` ×2, pak `b1f1dfc0`).

Proč to vadí: strom se překreslí při přepnutí tabu, jazyka nebo po čtení — uživatel tedy uvidí,
jak se mu strom **sám od sebe změnil**, bez jakéhokoli nového čtení. A pro nás je to horší:
znemožňuje to porovnávat obrazy, což je jediný způsob, jak jsme dnes vůbec dokázali, že signály
fungují. Měření se musí „zahřát", jinak lže.

Nediagnostikováno (podezření: líně plněná cache v `RunarTrunk`/`RunarBranch`, ne `Math.random` —
ten je seedovaný přes `mulberry32(dobSeed…)`). **Doporučuju jako další krok**, dřív než další signál.

**Affected doc(s):** RUNAR_TREE.md

## 2026-07-19 — Přehrávání růstu stromu + „bonus za pauzu" zrušen

**Zadání KUKY:** *„potřeboval bych nad strom posuvník, kterým bych se vracel zpět až na počátek
zrození a viděl, jak se strom vyvíjel."* Původní nápad byl krok po 10 čteních; změněno po dohodě
na **krok po jednom** — kdo má 12 čtení, dostal by u desítky dvě polohy.

**Není to ozdoba, je to chybějící měřicí přístroj.** Owner k tomu ve stejné zprávě napsal:
*„koukl jsem na produkci, ale nedá se určit, jestli se něco změnilo."* Přesně tahle slepota nechala
obě nosné osy mlčet dva měsíce — výsledek nešlo s ničím porovnat. Zelený test dokazuje data, ne obraz.

**Engine netknutý.** Posílá se jen KRATŠÍ log (`log.slice(0, n)`). `realAge` se v rendereru počítá
z délky logu, takže strom u čtení č. 3 vypadá tak, jak vypadal tehdy (mladší), ne jako dnešní strom
s méně větvemi. Na nule vyjede zakládací stav (`founding = log.length === 0`) = tři kořeny.
Portováno z labu (`crown-composer.html`, `state._viewN` + `#stepN`) — hotové chování, ne nový nápad.
Posuvník používá **existující třídu `.cap-seek`** (týž vizuál co audio seek), ne druhou kopii (§18).

**OVĚŘENO V PROHLÍŽEČI** (a to je na tom to podstatné — dosud se ověřovala jen data):
- řezání i popisky ve všech čtyřech stavech, oba jazyky (`3. spá af 5` · `allt tréð · 5 spár` · `upphaf trésins`)
- hmota kresby monotónně ubývá: 14 čtení = 7593 px · 10 = 6729 · 5 = 5878 · 0 = 3319 (zakládací stav)
- ⭐ **osy fakt hýbou stromem:** otisk obrazu s dekódovanými slugy `a349a89e` vs s popisky
  (stav před krokem 1) `e5460990` — a opakování prvního dalo znovu `a349a89e`, takže to není šum.
  Tím je krok 1 doložen na OBRAZE, ne jen na datech.

**Zrušeno: „bonus za pauzu".** Owner: *„neznám, přijde mi to jako stará poznámka, která ani neměla
být vytažena na povrch."* Měl pravdu — pochází z téže sekce „Filozofie rituální kadence", kterou
zrušil, a je to **druhá půlka zrušené penalizace** („větev příliš brzy = slabší / po pauze = bonus").
Já smazal penalizaci a bonus nechal žít, protože `RUNAR_TREE_TODO.md` bod 9 zní „bonus za pauzu,
ŽÁDNÁ penalizace" — přečetl jsem to jako „bonus platí". Byl to zápis téhož zrušeného konceptu.
**Poučení:** při čištění zastaralého konceptu se musí zrušit i jeho druhá půlka jinde; jinak zbyde
fragment, který příští session přečte jako živý design. Přesně to jsem udělal v úklidu proti fragmentům.

**Affected doc(s):** RUNAR_TREE.md · RUNAR_TREE_TODO.md

## 2026-07-19 — Strom, krok 2: Blank/Óðinn přestal mazat zaplacené čtení

**Vada.** Blank má glyf `○` (U+25CB), tedy MIMO runový rozsah `0x16A0–0x16FF`, na který se ptal
filtr v `readingsToTreeLog`. Nenašel nic → prázdný seznam run → `if (!runes.length) return;`
zahodil **celý řádek**. Uživatel zaplatil, čtení má v journalu, ale ve stromě po něm nezbylo nic —
ani větev, ani duch, a nepočítalo se ani do věku stromu. U spreadu se Blank tiše vynechala
z výčtu run, takže Norny se třemi runami dorazily jako dvě.

**Renderer měl duchovní větev připravenou celou dobu:** `runar-branch.js:50` — `{ k:'odinn',
aett:'none', el:'shadow', blank:true }`. Nikdy se k ní nedostal, protože data k němu nedošla.

**Oprava.** Filtr se nově ptá, jestli je znak **známý glyf**, ne jestli padne do rozsahu. Blank
dojede jako `el:'shadow'` (§3 — studené a skryté runy) s příznakem `blank:true`.
Element se přepisuje **na straně stromu**, ne v `runar-runes.js`: tam má Blank
`elements:['Water','Shadow']` a pořadí čte i výklad čtení, takže do sdílených dat nesahám.

**Zbytkové riziko, vědomě přijaté:** kdyby model napsal `○` do prózy čtení, přibude fantomová
duchovní větev. Menší zlo než mazat zaplacené čtení — a §5 zakazuje `○` jako zobrazení Blank runy,
takže do Rúnarova slovníku nepatří. Zapsáno v komentáři u kódu, ať to není překvapení.

**Ověřeno:** guard ⑬ rozšířen o čtvrtý řádek fixture (čtení, kde padla jen Blank). Puštěn PŘED
opravou → červená s hláškou „3 řádky místo 4 — spolkla se Blank runa?". Po opravě zelená.
Ruční kontrola výstupu: Blank single přežije, Norny s Blank uprostřed si udrží všechny tři runy.

⚠️ **Co tím NEVZNIKLO:** vizuál ducha (průsvitná větev bez listů, §4). To je práce v enginu —
„jak se kreslí", ne „kam vyjde" — a čeká na vlastní krok. Dnes Blank vyroste jako běžná
shadow větev; příznak `blank:true` je hook, na kterém to půjde postavit.

**Affected doc(s):** RUNAR_TREE.md

## 2026-07-19 — Strom, krok 1: obě nosné osy umístění poprvé fungují

**Kořen (ověřeno na obou stranách).** Lab si vyrobil VLASTNÍ slovník —
`build_crown_composer.py:317-318`: `AREAS=['healing','family',…]`, `INTENTS=['present','decision','past']`
— a jeho tlačítka posílala tyhle slugy. Produkce ale posílá to, co uživatel naklikal:
**lokalizovaný popisek** (`readerUser.area = label`, runar-app.js:1058 → `'Ást & Sambönd'`).
`AREA_LAT[popisek]` → `undefined`, guard v kompozici nikdy nespustil, `areaLat` i `intAxis`
zůstaly **0**. Osy A i B z §3 tedy od nasazení do produkce (2026-07-10) **nepřispívaly nic**.

**Proč to nikdo nechytil:** signální řetězec byl odladěn a odsouhlasen v labu — tedy **na ploše,
kde ta vada nemůže vzniknout**, protože si tam vokabulář testoval sám se sebou. Učebnicové §19.3.

**Oprava (krok 1).** `readingsToTreeLog` dekóduje popisek → index → slug přes `AREAS`/`INTENTIONS`
(index-paralelní pole, čte se z nich, NEZAPISUJE — hranice lane). Vzor je `character.js:488`, kde
totéž funguje správně už dlouho. Osa času přešla z `{past,present,decision}` na **jazyk Noren**
`{urd,verdandi,skuld}` = `INTENTIONS.norns` — tím zmizel TŘETÍ paralelní slovník pro tutéž osu.
Slugy oblastí (`TREE_AREA_SLUG`) drží strom u sebe: je to tvarové mapování, ne sdílená sémantika.
**Engine netknutý** — mění se „kam větev vyjde", ne „jak se kreslí" (Pravidlo 3).

**Guard ⑬ přepsán na správnou otázku.** Dřív tvrdil jen „hodnota dojela z DB do logu". Teď tvrdí
i **„rozumí jí přijímající strana"** — klíče `AREA_LAT`/`INT_AXIS` čte ZE SKUTEČNÉHO rendereru,
ne z kopie. Přesně ta otázka, kterou nikdo nepoložil. Plus anti-drift: `TREE_AREA_SLUG` musí mít
tolik položek co `AREAS`.

**Tři vady, které jsem našel ve VLASTNÍM guardu** (zapsáno schválně — [[guard-test-the-lifecycle]]):
1. regex držel jen náhodou (`'\s'` v JS stringu je pouhé `s`; sedlo to, protože `s*` smí být nulakrát),
2. anti-drift assert byl **tichá zelená** — `const AREAS` se v `vm` kontextu neobjeví jako property
   sandboxu, takže se porovnávalo `null === null`,
3. potřetí za den mi escapování zpětných lomítek zmizelo cestou přes nástroj → `keysOf` je teď
   **bez regexu**, prostým hledáním závorek. Rozbitý regex tiše nenajde NIC, což je u kontroly
   nejhorší možný výsledek: tváří se, že mapa neexistuje, místo aby porovnal obsah.

**Ověřeno rozbitím** (obě nové cesty): ubrání slugu → nahlášen rozchod s `AREAS`; odebrání
`career` z rendereru → „renderer neumí přečíst". Po vrácení zeleně. Smoke 20/20.

⚠️ **Co NENÍ ověřeno:** vizuální výsledek. Guard dokazuje, že signál dojde a je srozumitelný;
že se strom viditelně naklonil, musí potvrdit oko v produkci (admin beta). Netvrdím to.

**Zbývá ze signálů §4:** runa→tvar (renderer si tvar bere z elementového poolu, `tree-prod:200`)
· váha z počtu polí · bonus za pauzu · Blank/Óðinn (glyf `○` mimo runový rozsah → `runar-tree.js`
zahodí CELÉ zaplacené čtení). Seeking jako třetí hlas do vážené volby §3A taky čeká.

**Affected doc(s):** RUNAR_TREE.md

## 2026-07-19 — Dokumentační linie dokončena: smoke ⑯ odkazy + ⑰ hodnoty z configu

Poslední dva guardy z konsolidačního plánu. Tím je série ⑭–⑰ kompletní a dokumentace
má poprvé strojovou obranu na všech čtyřech vrstvách: **mrtvé pojmy** (⑭) · **nesplněný
slib opravy** (⑮) · **odkaz do prázdna** (⑯) · **hodnota opsaná z configu** (⑰).

**⑯ `verify_doc_links.js`** — markdown odkazy i cesty v backtickách musí mířit na existující
soubor. Klíčové rozhodnutí návrhu: kontroluje **existenci na disku, ne stav v gitu**. První
verze hlásila 36 nálezů, ale většina byla legitimní — `scripts/_patch.py` (scratch cesta),
`.claude/settings.json` (gitignored), untracked `.py` v kořeni (konvence ownera z 2026-07-17).
Kontrola má hlídat prázdno, ne index. Po opravě 24 → po roztřídění 0.

**⑰ `verify_doc_values.js`** — jména tierů v docích musí být v `TIERS`. Rozdíl proti ⑭ je
podstatný: ⑭ zná JMENOVITĚ seznam mrtvých pojmů a po každém přejmenování se musí ručně
doplnit; ⑰ čte **aktuální config** a odvozuje, co je platné. „Rune Keeper" propadne ne proto,
že je na seznamu, ale proto, že v configu není — takže chytí i přejmenování, které ještě
nikoho nenapadlo. Tolerantní k české deklinaci („Rune Seekera"), protože doky jsou česky.
Čísla (50/75) hlásí jen **žlutě** — plošný zákaz by v PRICING dělal šum a ten doc má jednu
tabulku povolenou.

**Obojí ověřeno rozbitím:** vložen mrtvý odkaz (obě formy) i vymyšlený tier „Rune Guardian" →
nahlášeno, exit 1; po vrácení zeleně.

**Opraveno při tom:** jména tierů byla v `RUNAR_BACKLOG.md` a `RUNAR_DESIGN.md` pořád vedená
jako TBD s odkazem na Coworkův `TIER-NAMING-brief.md`, který v repu není — přitom KUKY je
2026-07-18 rozhodl. Backlog položka uzavřena. Dále přiznáno u tří dalších specí, že v repu
nejsou (Coworkovy výstupy nedodané přes CODE, §17).

**Escape značky** (`doc-links:ok`, `doc-values:ok`, `check-docs:ok`) jsou schválně inline
HTML komentáře — neruší render a jsou grepovatelné. Použity tam, kde doc jmenuje mrtvý pojem
JAKO mrtvý nebo uvádí ilustrativní jméno souboru (konvence pojmenování patchů).

**Affected doc(s):** RUNAR_BACKLOG.md · RUNAR_DESIGN.md · README.md · smoke.py

## 2026-07-18 — Konsolidace dokumentace: 7 docs archivováno + dvě kontroly do smoke

**Zadání KUKY:** „chci to mít čistě… žádné duplikáty" + k `RUNAR_CONTEXT.md`: *„potřebuju ten
runar context?? jedna věc je, že se mi to předtím hodilo, ale čas jde dál — je to teď potřeba?
spousta věcí, co jsme udělali před 2 měsíci, může být teď zastaralá."*

**Archivováno do `docs/archive/`** (přesun, ne smazání = vratné): `RUNAR_CONTEXT.md` ·
`AUDIT_REPORT.md` · `TIER_LIMITS_archive.md` · `runar_patch_v1.0_design.md` ·
`runar_patch_v0.9_status.md` · `IS_REVIEW_NATIVE.md` · `RUNAR_BACKTESTING.md`.

**Proč zrovna `RUNAR_CONTEXT.md`:** byl to poslední velký „shrnutí všeho" doc, který §20 zakazuje
jako druh. Jeho účel („kontext pro chat bez přístupu k repu") přestal platit — Cowork čte repo přes
`git show HEAD:`, Code běží i na webu, a `MEMORY.md` je po dnešku krátký rozcestník, co se vejde do
jedné zprávy. **Cena, kterou účtoval:** nesl Yggdrasila jako bránu na datum **a k tomu zápis, že
návrh „bez gate, jen váha" byl 2026-06-16 zamítnut** — takže vypadal autoritativně a aktivně
potvrzoval verzi, kterou owner musel opravovat popáté. Jediný živý příchozí odkaz (PRICING:79)
navíc opisoval čísla, která patří do `SPREAD_COSTS`.

**Nové kontroly:**
- **smoke ⑭ `check-docs.py`** — linter živé dokumentace, sourozenec `check-is.py`. Hlídá retirované
  pojmy a neplatná pravidla. Klíč návrhu = `unless` seznam: doc SMÍ mluvit o mrtvém pojmu jako
  o mrtvém, jinak by kontrola trestala právě ty věty, které problém pojmenovávají. Escape
  `check-docs:ok`. **Ověřeno rozbitím.** Nehlídá `RUNAR_DECISIONS.md` (append-only log MUSÍ citovat
  i to, co dřív platilo), `snapshots/`, `docs/archive/`.
- **smoke ⑮ `verify_decisions_followthrough.js`** — kontrola na **mechanismus**: když záznam řekne
  `Affected doc(s): X`, ověří přes `git blame`, že se X od té chvíle aspoň jednou pohnul. Nesoudí
  obsah opravy (na to stroj nemá), jen že se doc vůbec hnul. **Zpětně nevymáhá** (hranice
  2026-07-18) — retroaktivní červená, kterou nikdo nemůže opravit, se do týdne vypne. Historii
  vypisuje informativně: 4 nesplněné sliby z 07-04 až 07-10. Ověřeno posunutím hranice do minulosti.
- ⚠️ **Známé omezení ⑮:** vidí jen commitnuté řádky, takže porušení chytí až při dalším běhu smoke,
  ne v tomtéž commitu. Víc než jeden commit napřed před slibem se ale ujít nedá.

**Nález mimo zadání:** `memory/tree-of-life.md` měl na konci **52 NUL bajtů** (už od `HEAD~8`, ne
moje práce). Kvůli nim ho **grep považoval za binární a přeskakoval** — takže byl pro všechny
grep-based audity neviditelný, včetně dnešního hledání Yggdrasilu. Našel ho až `check-docs.py`,
který čte přes Python. NULy odstraněny, obsah nedotčen; proskenován celý repo — jediný takový soubor.

**Efekt měřeno:** po auditu (97 nálezů) A čtyřech fázích ručního úklidu našel linter **dalších 25
míst**, z toho **5× Yggdrasil jako bránu**. To je doklad, že ruční úklid tuhle třídu chyby nedozoruje.

**Affected doc(s):** RUNAR_PRICING.md · memory/tree-of-life.md · smoke.py
(CLAUDE.md tu byl původně taky — vyškrtnut, protože se měnit nepotřeboval: jeho zmínka
o RUNAR_CONTEXT je historická poznámka o driftu a platí dál. Chytila to kontrola ⑮
pár minut po svém vzniku, na vlastním autorovi.)

## 2026-07-10 — Model čtení: Opus 4.8 + overload fallback chain (ZPĚTNĚ DOPLNĚNO 2026-07-18)

⚠️ **Doplněno zpětně.** Tohle rozhodnutí padlo 2026-07-10, ale záznam tady **nikdy nevznikl** — fakt
žil výhradně v `memory/MEMORY.md`. Audit duplicity (2026-07-18) ho našel jako jediný výskyt, takže
při čištění MEMORY.md by se ztratil. Je to učebnicový příklad, proč §16 output B není formalita:
co není tady, nemá se čeho chytit, a MEMORY.md je index, ne archiv.

- **Produkční model = Opus 4.8** (`claude-opus-4-8`).
- **Fallback chain při přetížení** (claude-proxy): **Opus 4.8 → Opus 4.7 → Sonnet 5.**
  Sonnet je poslední záchrana při 429/5xx po retry, NE primární cesta. `callClaudeWithRetry`
  (3× backoff) + fallback loop; **4xx nepropadá** (permanentní chyba se nemá opakovat na jiném modelu).
- **Proč Opus:** slepý eval 2026-07-10 (single + Norns, 3 porotci — gramatik / básník / rodilé ucho),
  **Opus 6:0**. Gramatika ≈ remíza; Opus vyhrál **poetický hlas** = jádro produktu. Sonnet porušil
  personu (otevřel jménem, použil zakázané „Ferðalag") a **slepil 3 runy Norn do jednoho bloku**,
  což by rozbilo spread. Náklad dominuje ElevenLabs hlas, ne model → −40 % u Sonnetu je irelevantní.
- **Zdroj pravdy pro model = `claude-proxy/index.ts` MODELS.** Doky ho neopisují, jen odkazují.
- ⚠️ **Nesrovnalost, NEROZHODNUTO:** MEMORY.md tvrdila, že dřívější remíza byla proti **Sonnet 4.5**,
  zatímco popis evalu mluví o **Sonnet 5**. Z repa se to rozhodnout nedá. Závěr (jedeme Opus) je tím
  nedotčen, ale kdyby se eval opakoval, tenhle údaj se musí ověřit, ne převzít.
- **Deploy:** `supabase functions deploy claude-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt`

## 2026-07-18 — KUKY: šest rozhodnutí + pravidlo „jedna informace, jedno místo"

Vzniklo z auditu duplicity dokumentace (97 potvrzených nálezů, ~12 faktů opsaných na 4–7 místech).
**Tenhle záznam je AUTORITA** — když se doc rozejde s tímhle, opravuje se doc. Důvod, proč to píšu
takhle důrazně: Yggdrasil (níž, ①) musel KUKY opravovat **pětkrát**, protože jeho rozhodnutí nikdy
neskončilo v DECISIONS. Doky se neměly čemu podřídit, takže vyhrála většina — a většina byla špatně.

**① Yggdrasil = KDYKOLIV, KDOKOLIV přihlášený.** Žádná brána na datum, jednou provždy.
Zimní slunovrat = **větší SÍLA ve stromě**, ne podmínka přístupu. Půjde o **rituální čtení**, kterých
bude ve stromě víc — je to zamýšlená kategorie, ne výjimka pro Yggdrasil.
Zdroj pravdy = kód (`runar-reading.js`, žádný gate) + `RUNAR_PRICING.md`. Mrtvé pole
`SPREAD_CONFIG.yggdrasil.seasonal` („Dec 14-28 only") z configu PRYČ — dokud tam je, drift se vrací.

**② Jména tierů = Rune Seeker · Rune Walker · Rune Wanderer** (přesně jak je to v produkci).
„Rune Keeper" = RETIRED. Zdroj pravdy = `runar-config.js` TIERS, doky jen odkazují.
⭐ **A obecné pravidlo z toho:** *„produkce je nejblíž tomu, jak to má být."* Když se doky rozejdou,
**vyhrává produkce**, pak nejnovější datovaný záznam tady. KUKY se nemá co ptát na věc, která už je
rozhodnutá a datovaná — to je práce Code: dohledat a vzít.

**③ Zakládací rituál (Norns) = PLACENÝ.** Ne „zdarma". Mechanika: stojí kredity jako každé jiné
čtení; předplatitelé ho platí ze svých jednotek. **Rune Seeker** může dostat kredity na založení
**darem** — ale to je *marketingový nástroj* (kampaň, nalákání), NE vlastnost produktu.
→ V `RUNAR_PRICING.md` přeformulovat: mechanicky placené, marketingově darovatelné.

**④ Fronta „NATIVE EYE / Sigrún" = ZRUŠENA.** Žádné odkládání IS na Sigrún.
Navazuje na [[is-done-together-not-for-sigrun]]: islandštinu děláme rovnou pořádně a ověřenou.
POZOR na rozsah: ruší se **fronta jako mechanismus**, NE princip §19.2 („žádné tiché zelené" —
co nástroj neposoudí, musí být vidět jako žluté, ne zahozené). §19.2 se přepíše tak, aby
viditelnost zůstala a Sigrún z něj zmizela jako adresát.

**⑤ Penalizace za brzké/časté čtení NEEXISTUJE a existovat nebude.** KUKY doslova: „totální nesmysl."
Pryč z `RUNAR_TREE_BUILD.md:71`, `RUNAR_DESIGN.md:218,:444`. Bonus za pauzu tím NENÍ dotčen.
Tím padá i sekce „Filozofie rituální kadence" (`RUNAR_DESIGN.md:203-219`) — KUKY: „naprostá blbost,
tohle jsem taky dávno odstranil", ale přežila to a 2026-07-18 byla znovu citována jako platný princip.

**⑥ Odklad launch blockerů (`RUNAR_BACKLOG.md`, trigger 6. 9. 2026) = NEPOTVRZENO.**
KUKY: „nevím co je!" → **nezapisovat jako pravdu ani nemazat.** Zůstává označené jako sporné,
dokud se nedohledá původ. Do té doby platí, že blockery jsou blockery.

---

### ⭐ PRAVIDLO: jedna informace = jedno místo. Nikdy dvě.
KUKY 2026-07-18, doslova: *„nechci aby tyhle informace, žádné informace žily na více než 1 místě!
už když to jsou dvě místa tak nám to vytváří problémy… žádné duplikáty!"*

Není to preference, je to **doložené**: audit našel 97 rozporů/duplikátů nad ~12 fakty. Dvě kopie
nejsou riziko rozporu — jsou **odložený rozpor**. Jedna se dřív nebo později změní a druhá zůstane.

Zapsáno jako **§20 v CLAUDE.md**, aby platilo i při DOPLŇOVÁNÍ informací, ne jen při úklidu.
Nejdůležitější část §20: **„shrnutí všeho" doc je zakázaný** — nevlastní žádné téma, jen kopíruje cizí.
Přesně tím byl `memory/runar-project.md` (sám vygeneroval ~15 nálezů) a částečně `RUNAR_CONTEXT.md`.

**Affected doc(s):** CLAUDE.md (§20 nové, §6, §19.2, tier+spread tabulky, DB) · memory/MEMORY.md
· memory/runar-project.md (redukce na rozcestník) · RUNAR_PRICING.md · RUNAR_DESIGN.md
· RUNAR_TREE_BUILD.md · RUNAR_BACKLOG.md · runar-config.js (mrtvé `seasonal` pole)

## 2026-07-18 — Strom: signály z DB nedojely (osa B opravena, zbytek POJMENOVÁN)

- **Typ:** fix + nález (CODE-tree; zadání KUKY „pokračuj na stromě" → Explore napřed)
- **Co se změnilo:** `readingsToTreeLog` (runar-tree.js:37) čte u spreadů `row.aol` jako fallback,
  když je v `area` marker `'spread'`. Nový guard **smoke ⑬** `scripts/verify_tree_signals.js`.
- **Proč:** klient u spreadu ukládá `area:'spread'` (marker) a skutečnou oblast života do `aol`
  (runar-reading.js:763); proxy zapisuje OBA sloupce (claude-proxy:373-374); strom marker poznal,
  vrátil `null` a `aol` **nikdy nepřečetl**. Data v DB ležela, strom je zahodil — bez chyby, bez pádu.
  Bralo to zrovna nejvýznamnější čtení: Norny (zakládací rituál) a Yggdrasil.
- **OVĚŘENÍ:** guard puštěn PŘED opravou → červená na jediném assertu (ostatní signály prošly
  = přesná lokalizace vady), po opravě zelená. `node --check` OK, smoke 13/13.
- ⚠️ **MŮJ VLASTNÍ FALSE GREEN (zapsáno schválně):** první verze fixture nasadila `aol:'career'` —
  slug, který jsem si vymyslel. Prošla zeleně, aniž co ověřila. Přesně past, před kterou varuje
  hlavička `verify_contract_wiring.js`. Opraveno: hodnoty se **tahají z `AREAS`/`INTENTIONS`**,
  takže nemohou odrejvovat od reality. **Poučení: fixture, kde si autor vymyslí tvar hodnoty,
  netestuje hranici — testuje autorovu představu.**
- ⭐ **VĚTŠÍ NÁLEZ (ověřeno oběma stranami, ČEKÁ NA OWNERA):** oprava je nutná, ale **nestačí**.
  Renderer má vlastní slovník hodnot, který klient nikdy nepřijal:
  `runar-tree-prod.js:41 AREA_LAT` je klíčované slugy (`love/career/…`) a `:40 INT_AXIS`
  (`past/present/decision`), ale klient ukládá **lokalizovaný popisek** (`readerUser.area = label`,
  runar-app.js:1058 → `'Career & Creativity'` / `'Ást & Sambönd'`). Lookup dá `undefined`
  → `areaLat`/`intAxis` zůstanou 0 → **obě nosné osy §3 nepřispívají nic.**
  Dekódovací tabulky **UŽ EXISTUJÍ** a jsou index-paralelní (`AREAS.norns`, `SEEKS.norns`,
  `INTENTIONS.norns` v runar-runes.js — komentář u nich říká doslova „branch placement on tree");
  `character.js:488` je správně dekóduje přes `indexOf`. Strom je jediný, kdo to nedělá.
  Další: **Blank/Óðinn** má glyf `'○'` (mimo 0x16A0–0x16FF) → runar-tree.js:35 zahodí **celé čtení**
  (zaplacené, v journalu, ve stromě nic) · `seeking`/`drawn_at`/počet vyplněných polí se do logu
  nedostanou vůbec · runa dojede do logu, ale renderer si tvar větve bere z elementového poolu
  (`tree-prod:200`), takže „runa = tvar" (§4) není implementované.
  **Skóre §4: z devíti dokumentovaných signálů větve je plně zapojený JEDEN (element = barva).**
- **§18:** až se to bude opravovat, dekódování musí být JEDNA cesta (sdílené `AREAS/SEEKS/INTENTIONS`
  + `indexOf` jako v character.js), NE druhá kopie slugů v tree-prod. `runar-runes.js` = sdílená
  sémantická vrstva → zásah jen ADITIVNĚ a předem flagnout (CLAUDE.md, Hranice).
- **Affected doc(s):** CLAUDE.md (sekce Tree of Life — tvrdila „engine = LAB, NEKOMITOVÁNO,
  nenapojeno na DB/reader", což je od 2026-07-10 nepravda), MEMORY.md
- **Reverzibilita:** snadná (jeden výraz zpět na `: null`).
- ⚠️ **Kde to reálně leží:** commit **`d3bb6ff`**, ne pod `[tree]`. Souběžná `[docsync]` session
  commitla, zatímco jsem měl soubory nastagované — `git commit` bere CELÝ index, takže jí do commitu
  spadl můj guard, smoke ⑬, oprava v runar-tree.js i tenhle zápis, pod hlavičkou o portu
  CLAUDE_CODE_FILE_RULES. Obsah ověřen nedotčený (obě sady změn v CLAUDE.md koexistují, nic se
  neztratilo); commit už byl na originu → historie se nepřepisuje, jen se sem píše ukazatel.
- ⭐ **Proces (stojí za zvážení):** „commit prefix = LANE, `git log` JE akční log" tiše předpokládá,
  že index patří jedné session. Nepatří — **index je sdílený**. Kdokoli commitne, sebere i cizí
  rozpracované staged soubory a schová je pod svůj prefix. Nestačí kázeň v psaní zpráv; buď stagovat
  a commitovat v jednom kroku (`git commit -- <cesty>`), nebo počítat s tím, že akční log lže.

---

## 2026-07-19 — Cena spreadu má jednoho vlastníka; kontrola ⑳ [tune]

- **Rozhodnutí:** vlastník ceny je `SPREAD_COSTS` v `v2/runar-config.js`. Nová kontrola
  `verify_spread_prices.js` (smoke ⑳) porovnává s ním dvě věci: kopii `SPREAD_CONFIG.credits`
  a každou tabulkovou zmínku ceny v docích.
- **Proč:** cena byla na TŘECH místech a nic je neporovnávalo. `SPREAD_CONFIG.credits` má
  v komentáři doslova „mirrors SPREAD_COSTS" (runar-config.js:316) — §18 porušené přímo v kódu.
  Přecenění znamenalo změnit tři místa a na zapomenuté jedno se přijde tím, že se uživateli
  strhne jiná částka, než jakou viděl. Přesně takhle vznikl „founding ritual free".
- **⚠️ PRÓZA SE VĚDOMĚ NEKONTROLUJE.** První verze prózu uměla a na ostrém repu dala **5 nálezů,
  z nichž 5 falešných**: „50 single/month = 50 credits" (množství, ne cena) a „Life Rune (3 kredity)
  + Norns (2 kredity) = 5 kreditů" (všechna tři čísla správně, jen spárovaná se špatným spreadem).
  V próze nejde odlišit cenu od množství ani od součtu bez hádání. Kontrola, která pálí na správný
  obsah, se naučí ignorovat — nebo se umlčí značkou, což je totéž. U tabulky ta nejednoznačnost
  není: hlavička „Credits" je autorovo prohlášení, co ten sloupec znamená.
  **Důsledek, který se nezakrývá: cenu v běžné větě (RUNAR_PRICING.md:126) nikdo nehlídá.**
  Kontrola to říká i ve svém zeleném výstupu, aby zelená neznamenala víc, než pokrývá.
- **OVĚŘENÍ (§19, celý životní cyklus):** kopie v kódu se rozejde → CHYTL · tabulka v docu se
  rozejde → CHYTL · vlastník přejmenován (`SPREAD_COSTS` → `SPREAD_PRICES`) → CHYTL, ne tichá
  zelená · po obnovení ZELENÁ, soubory bajtově nedotčené. Smoke 20/20.
- **Affected doc(s):** žádný — kontrola nic netvrdí, jen vymáhá to, co už `SPREAD_COSTS` říká.
- **Reverzibilita:** snadná (smazat soubor + blok v smoke.py).

### Čeká na ownera — přecenění (rozhodnuto v principu, neimplementováno)
- **Návrh KUKY:** Life Rune **0 kreditů** (marketing) a zakládací Norny **textové** (bez hlasu),
  čímž je založení stromu zdarma **nákladově**, ne dotací.
- **Podklad:** hlas je **95 % ceny** čtení (single: $0.036 z $0.038 · Norns: $0.077 z $0.081).
  Textové čtení stojí ~$0.005. Vzniká jedno vysvětlitelné pravidlo: **platíš za hlas, text je zdarma.**
- **Proč tahle varianta a ne „účtuj 2, daruj 2":** dárek staví zpět placenou cestu s výjimkou —
  tu samou konstrukci, kterou jsme 2026-07-16 odstraňovali — a jde proti pravidlu „není kód,
  není kredit" (dárek je zdroj kreditů, který není kód). Textové založení žádnou výjimku nevyrábí,
  protože nikdy cenu nemělo. Není co prolomit.
- **⚠️ PODMÍNKA IMPLEMENTACE:** zakládací Norny musí být **vlastní `mode` v proxy**, ne `norns`
  s příznakem. Jednou za život účtu, gate na `tree_founded IS NULL` **ověřený v DB**, hlas vypnutý
  **serverem**, ne tím, že si klient řekne o `voice:false`. Kdyby si klient mohl vyžádat `founding`
  podruhé nebo s hlasem, je to díra za $0.077 na požádání.
- **Známé důsledky:** (a) zamyká to pravidlo „placené = hlasové" — placené textové čtení už
  nepřidáš, aniž rozbiješ příběh; (b) **nula jsou jednosměrné dveře** — zdražit z 0 nejde,
  marketingový přínos je hypotéza, ne měření. (c) farmení účtů ekonomicky nezajímavé (~$0.01/účet).
- **Až se to udělá:** přepsat v `RUNAR_PRICING.md:53` větu „3 credits reflects perceived value" —
  zdůvodňuje cenu, která přestane existovat. Sedm tabulkových zmínek hlídá ⑳; prózu na ř. 126 ne.

---

## 2026-07-19 — Duplicitní korekce v promptu životní runy + duplikát ceny smazán [tune]

### A) Korekční blok šel do promptu životní runy DVAKRÁT (regres z 2026-07-18)
- **Co:** `runar-tree.js:322` předával `corrections` do `buildLifeRunePrompt()` a hned na dalších
  dvou řádcích si připojil `getCorrPrompt()` ještě jednou. Snapshoty z 2026-07-10 ukazují původní
  správný stav: dispečer `corrections` **nebral**, takže kopie u volajícího byla na místě.
  Když jsem 2026-07-18 přesouval gaty (`_describeRule`, `_noColdRead`) do dispečera, přidal jsem
  tam i `getCorrPrompt` a **kopii u volajícího nesmazal**. Moje chyba, ne cizí.
- **Dopad:** korekční instrukce v každém promptu životní runy dvakrát → zbytečné tokeny a hlavně
  převážená instrukce (opakovaný příkaz model váží silněji než jednorázový).
- **⚠️ PROČ TO ⑧ NECHYTLA:** ptala se `includes()` — tedy jestli gate **dorazí**. Dorazit dvakrát
  je pořád dorazit. Ověřoval jsem přítomnost, ne počet. Přesně to, před čím §19 varuje.

### B) ⑧ rozšířena o dvě věci
1. **Multiplicita:** každý gate se v promptu smí vyskytnout právě jednou (spready i životní runa).
2. **Statická kontrola volajícího:** kdo předá `corrections` do `build*Prompt()`, nesmí sám volat
   `getCorrPrompt()`. Dynamická část tohle **nikdy neuvidí** — volá buildery přímo, ne přes
   volajícího. Navíc fixture posílá `corrections: []`, takže `getCorrPrompt` vrátí prázdno
   a duplicita je dynamicky neviditelná. Proto staticky.
- ⚠️ **MŮJ DRUHÝ FALSE GREEN TÉHOŽ DNE (zapsáno schválně):** první verze toho statického bloku
  skončila **za `process.exit()`** — mrtvý kód, nikdy neproběhl, kontrola svítila zeleně.
  Postavil jsem kontrolu proti tiché zelené a udělal v ní tichou zelenou. Odhalilo to až
  ověření rozbitím; bez něj by to bylo v repu jako „hotová kontrola".
  **Poučení (opakovaně stejné): zelená bez předchozí červené nic netvrdí.**
- **OVĚŘENÍ (§19, celý cyklus):** 5 stavů — původní regres u volajícího · gate dvakrát u životní
  runy · gate zmizí u životní runy · gate dvakrát u spreadu · gate zmizí u spreadu → **5× CHYTL**,
  po obnovení zelená, soubory bajtově nedotčené.

### C) SPREAD_CONFIG.credits smazáno (ne hlídáno)
- **Změřeno:** `SPREAD_CONFIG.credits` **nikdo nečetl**. Všichni konzumenti berou `SPREAD_COSTS`
  (runar-reading.js:827-848, runar-tree.js:112/289/329, gen_batch.js:245). Ze `SPREAD_CONFIG`
  se čtou jen `.tokens` a `.positions`.
- **Proč to bylo horší než živá kopie:** mrtvá data, která vypadají autoritativně. Kdo by přecenil
  v `SPREAD_CONFIG` (ten název zní jako ten hlavní), **nezmění nic** a nedozví se to.
- **Důsledek pro ⑳ (z včerejška):** změněno z „kopie musí souhlasit" na **„kopie nesmí existovat"**.
  Hlídat duplikát je druhá nejlepší věc; první je nemít ho. KUKY 2026-07-19: „pokud je něco
  ve SPREAD_COSTS špatně, mělo by se to opravit."
- **SW:** v215 → v216 (mění se klientské JS; bez bumpu si uživatel drží starý soubor z cache).
- **Affected doc(s):** žádný.
- **Reverzibilita:** snadná.

---

## 2026-07-19 — Audit backlogu proti kódu + úklid rootu [tune]

### A) Backlog: 52 otevřených položek ověřeno proti kódu
- **Metoda:** fanout (9 dávek) + **skeptik na každé tvrzení „HOTOVO"**. Asymetrie záměrná:
  falešné „hotovo" práci **smaže** a nikdo se k ní nevrátí, falešné „otevřeno" je jen šum.
  Skeptik ze 4 tvrzení HOTOVO **srazil 2 zpět** — bez něj by se dvě věci ztratily.
- **Výsledek:** 2 hotové a neodškrtnuté · 8 částečných · 13 owner · 26 skutečně otevřených.
- ⭐ **Hlavní nález není nezaškrtnuté políčko, ale ZASTARALÝ TEXT.** Osm položek popisovalo
  problém, který se mezitím posunul (ř. 75 jmenovala `runar-eval.yaml`, o kterém bylo 10 dní
  PŘED jejím sepsáním rozhodnuto, že se stavět nebude). Zastaralé zadání pošle člověka řešit
  neexistující věc — to mate víc než chybějící odškrtnutí. Přepsáno 11 položek.

### B) `SPREAD_CONFIG.yggdrasil.seasonal` smazán — přímý důsledek auditu
- Rozhodnutí „Yggdrasil kdykoliv, žádná brána na datum" padlo 2026-07-18 a **tenhle záznam si
  sám vyžádal** smazání pole z configu („dokud tam je, drift se vrací"). Nikdo to neudělal.
- Pole **nikdo nečetl** (`git grep '\.seasonal\b'` = prázdné) — ale kdo četl config, přečetl si
  tam zrušené pravidlo a implementoval ho znovu. **Proto to owner opravoval pětkrát.**
- Stejná třída jako `SPREAD_CONFIG.credits`: mrtvá data, která vypadají autoritativně.

### C) `scripts/utils/` NEBYLO v gitu
- Celý eval harness (`gen_batch.js`, 24 kB) i `measure_reading_costs.js` existovaly **jen lokálně**,
  přestože je `RUNAR_DECISIONS.md` cituje jako součást repa. Jedno `git clean` a jsou pryč.
- **Odhalila to smoke ⑯**, ne člověk: přepsal jsem backlog tak, aby na ty soubory odkazoval,
  a kontrola odkazů zčervenala. Správná reakce byla soubory **zacommitovat**, ne značku umlčet.
- `measure_reading_costs.js` je navíc přesně nástroj, kterým jde ověřit tvrzení „hlas = 95 % ceny
  čtení", na kterém stojí celá úvaha o přecenění — a které je zatím jen odhad z tabulky.

### D) Úklid rootu: 223 souborů
- V rootu leželo **250 netrackovaných souborů**, převážně jednorázové patch skripty z doby před §1
  („patch VŽDY do `scripts/_patch.py`"). Pravidlo platí, ale nikdo neuklidil, co bylo předtím.
- Přesunuto (NE smazáno) do `scripts/archive/root-patches-2026-07-19/` + MANIFEST.
  **16 souborů zůstalo v rootu**, protože se na ně odkazuje z trackovaných souborů — a seznam
  se počítá ZNOVU z repa, ne z natvrdo psaného výčtu (ten by zastaral stejně jako všechno ostatní).
- Root: 250 → 27. `scripts/_patch_tune.py` doplněn do `.gitignore` (dvě lane, dvě cesty).
- **Affected doc(s):** RUNAR_BACKLOG.md (přepsáno v témže commitu).

---

## 2026-07-19 — Fáze 1: životní runa je neměnná (brána PŘED zlevněním) [tune]

- **Rozhodnutí:** jednou vygenerovaná životní runa se nedá přepsat. Vynucuje DB trigger
  `trg_life_rune_immutable` (`sql/2026-07-19_life_rune_immutable.sql`), ne klient.
- **PROČ TEĎ a ne až s přeceněním:** dnes je jediná brzda proti přepsání **cena 3 kredity**.
  `generateLifeRuneReading()` existující runu netestovala a sloupce `life_rune_*` jsou pro
  roli `authenticated` zapisovatelné. Zlevnit na 0 dřív, než tahle brána existuje, znamená
  mezi dvěma commity otevřít neomezený generátor s destruktivním přepisem.
  **Pořadí je závazné: brána, pak cena.**
- **Zamyká se i DOB.** Runa se z data narození POČÍTÁ (`calcLifeRune`), ale uložený text se
  nepřepočítá. Kdyby šlo DOB po založení změnit, strom by ukazoval jednu runu a text vykládal
  jinou — tiše. Buď zamknout obojí, nebo ani jedno.
- ⚠️ **Admin reset přestane fungovat jako tlačítko.** `resetLifeRune()` běží jako `authenticated`,
  takže po migraci selže (a klient chybu uvidí — ⑱ hlídá, že se výsledek čte). Záměr: reset je
  destruktivní a patří přes service_role. SQL příkaz je na konci migrace — a **maže i `tree_name`**,
  což staré tlačítko nedělalo, takže po resetu zůstávalo jméno viset nad neexistujícím stromem.
- **Klientský guard** (`if (_lifeRuneText) return;`) přidán, ale je to jen zdvořilost — obejde ho
  každý, kdo umí otevřít konzoli. Je tam proto, aby se nestrhl kredit za zápis, který server odmítne.
- **Affected doc(s):** žádný — RUNAR_BACKLOG.md dostane položku, až bude migrace puštěná.
- **Reverzibilita:** snadná (`drop trigger trg_life_rune_immutable on public.user_profiles;`).
- **NEPUŠTĚNO** — čeká na ownera v SQL editoru.

---

## 2026-07-19 — SQL puštěno · admin reset životní runy odstraněn [tune]

- **PUŠTĚNO OWNEREM:** `sql/2026-07-19_life_rune_immutable.sql`. Trigger `trg_life_rune_immutable`
  je v produkci; `life_rune_*` i `dob_*` jsou po prvním zápisu neměnné pro roli `authenticated`.
  (Tohle git nevidí, proto to má vlastní řádek — §20.4.)
- **Rozhodnutí (KUKY):** tlačítko admin resetu odstranit **úplně**, ne opravit.
  Po migraci by stejně selhalo — běží jako `authenticated`, tedy přesně pod tou rolí, kterou
  trigger blokuje. Destruktivní operace nemá viset v DOM; reset se dělá SQL příkazem z konce
  té migrace (ten navíc maže i `tree_name`, což staré tlačítko nedělalo).
- **§13 full-path — šest míst, ověřeno grepem že nezbyl odkaz:** tlačítko a celý admin bar
  (`runar-reader.html`) · volání `updateAdminBar()` · funkce `updateAdminBar()` + `resetLifeRune()`
  (34 řádků, `runar-tree.js`) · klíč `admin_reset_lr` v OBOU jazycích (`runar-translations.js`)
  · `.tree-admin-bar` / `.tree-admin-btn` (`runar-reader.css`).
  Admin bar měl jediné tlačítko, takže padl celý — prázdný bar by se adminovi zobrazoval
  jako pruh bez obsahu. Komentář „will grow with more tools" sliboval nástroje, které nikdy
  nevznikly; **spekulativní kontejner je taky mrtvý kód.**
- **ODBLOKOVÁNO:** zlevnění Life Rune na 0 kreditů. Brzda proti přepsání už není cena, ale DB.
- **Affected doc(s):** RUNAR_BACKLOG.md (odškrtnuto v témže commitu).
- **Reverzibilita:** kód snadná (git revert); trigger `drop trigger trg_life_rune_immutable on public.user_profiles;`.

---

## 2026-07-19 — Životní runa ZDARMA (0 kreditů) [tune]

- **Rozhodnutí (KUKY):** Life Rune = 0 kreditů. Marketing — přiláká víc lidí. Nákladově obhajitelné:
  textové čtení bez hlasu, ~$0.006, zatímco hlas je ~95 % ceny čtení.
- ⚠️ **NESTAČILO změnit config, a to je na tom to podstatné.** Proxy má `Math.max(1, spread_cost)`
  a ta podlaha tam **je schválně** — brání klientovi poslat si `spread_cost: 0` a číst zadarmo.
  Cenu proto u životní runy určuje **server podle `mode === "life_rune"`**, ne číslo od klienta.
  `SPREAD_COSTS.life_rune.credits = 0` je jen zdroj pravdy pro UI a doky; vynucuje to proxy.
- **Druhá půlka je stejně důležitá:** bez serverového ověření, že runa ještě neexistuje, by šlo
  `mode:'life_rune'` spamovat — zápis by trigger `trg_life_rune_immutable` odmítl, ale Claude by
  se zavolal (a zaplatil) pokaždé. Precheck **fail-open** (stejná posture jako měsíční strop):
  výpadek čtení nesmí zablokovat založení stromu, cena omylu je jedno volání za ~$0.006.
- **Vyňato z měsíčního stropu** (`countsAsCast = !legitAsk && !isLifeRune`) i z odečtu kreditů
  (`userTier === "rune_seeker" && !isLifeRune`).
- ⚠️ **POŘADÍ NASAZENÍ: PROXY PŘED KLIENTEM** (pravidlo z 2026-07-17). Klient tu **nedegraduje
  bezpečně**: posílá `use_credit: false`, takže na STARÉM proxy spadne Rune Seeker do větve
  free-balance → buď mu to sebere jeho čtení zdarma, nebo dostane 402 a životní runu **vůbec
  nevygeneruje**. Nový proxy je naopak zpětně kompatibilní (starý klient `mode:'life_rune'`
  neposílá, takže se pro něj nic nemění) → nasadit ho jde kdykoli.
- **UI:** popisek ceny při 0 → `t('life_rune_free')` („Free" / „Frítt"), ne „0 spár".
- **Affected doc(s):** RUNAR_PRICING.md — věta „3 credits reflects perceived value" **retirována**
  (zdůvodňovala cenu, která přestala existovat) a próza na ř. 126, která opisovala ceny z configu,
  přepsána na odkaz + pravidlo „platí se za hlas". Obojí v tomtéž commitu.
- **Reverzibilita:** snadná (config zpět na 3 + revert proxy větve).

---

## 2026-07-19 — Rune Seeker svou životní runu neviděl (pořadí, ne oprávnění) [tune]

- **Vada, nahlásil owner na vlastním účtu:** životní runa se vygenerovala, zobrazila —
  a při dalším překreslení Tree tabu zmizela a vrátil se teaser s tlačítkem „REVEAL".
- **Příčina bylo POŘADÍ, ne oprávnění.** V `updateTreeTab()` se větev podle tieru
  (`if (!isStdPlus) { … return; }`) vracela **dřív**, než se kód vůbec zeptal
  `if (_lifeRuneText)`. Text byl přitom v DB i v paměti. Nic nespadlo, nic se nezalogovalo —
  obsah prostě zmizel.
- **Oprava:** test hotového čtení vytažen NAD větvení podle tieru. Tier rozhoduje o tom,
  jak se čtení **nabízí**, ne jestli hotové čtení uživatel uvidí.
- **Třída chyby: vlastnictví se testuje až za bránou oprávnění.** Nový guard ㉑
  (`verify_owned_before_tier.js`) hlídá pořadí těch dvou testů v `updateTreeTab()`.
  Kontrola je **záměrně úzká** — obecné „vlastnictví před oprávněním" staticky poznat
  neumím a předstírat, že ano, by bylo horší než nekontrolovat nic.
- ⚠️ **Vlastní ověření rozbitím napoprvé NEPLATILO** (zapsáno schválně): první test blok
  `_lifeRuneText` smazal, kontrola zčervenala — ale hláškou „chybí `_lifeRuneText`", tedy
  na JINOU vadu. Teprve druhý test blok **přesunul** za tierovou větev, což je přesný tvar
  regrese, a chytl ho správnou hláškou. **Červená sama o sobě nic nedokazuje; musí zčervenat
  na tu vadu, kterou hlídá.**
- **Historie nálezu:** tuhle vadu jsem našel a doložil už při ranním auditu a předal ji
  CODE-tree. Bylo to zbytečné — `CLAUDE.md` říká „Life-rune logika = MAIN", takže to byla
  celou dobu moje lane.
- **Affected doc(s):** žádný.
- **Reverzibilita:** snadná.

---

## 2026-07-19 — Evidence pohybů kreditu, fáze 1 (záznam) [tune]

- **Proč:** owner se dnes nemohl dozvědět, jestli se mu strhl kredit. `credits_balance` je stav,
  ne historie, a jiná stopa neexistuje. Táž díra brání odpovědět na zadání „není kód, není kredit".
- **Podklad:** fanout přes 5 nezávislých čoček našel **65 pohybů kreditu**; tři lovci, jejichž
  jediný úkol bylo najít, co sweep minul, přidali **dalších 27**. Nestavěl jsem to od boku —
  děravá evidence je horší než žádná, protože se pak podle ní rozhodne, že zůstatek sedí.
- ⭐ **Klíčové rozhodnutí: evidenci zajišťuje TRIGGER NA TABULCE, ne kázeň volajícího.**
  Kdyby zapisovaly edge funkce, evidence by chyběla přesně tam, kde nejvíc chybí — u ručního
  UPDATE v SQL editoru, který git nikdy neuvidí. Pohyb bez důvodu není mezera, ale **signál**
  (`reason='unattributed'`, `actor <> 'service_role'`).
- **Nasazuje se jako čistý přírůstek:** žádná existující cesta se nemění, nic se nepřepisuje.
  Od spuštění se zaznamenává všechno, i když kód pořád volá staré RPC.

### Co to NEPOKRÝVÁ (vyjmenováno schválně, ať se to nemusí hádat)
1. **„Nevydali jsme víc, než jsme prodali?" — neodpoví.** Prodejní strana v systému neexistuje
   (není checkout ani záznam o tržbě). Ledger umí „přiděleno vs. spotřebováno". Celá odpověď
   přijde až se Shopify webhookem (`RUNAR_BACKLOG.md`).
2. **Minulost je nezískatelná.** Otevírací řádek `reason='migration'` je čára („odsud měříme"),
   ne pravda o minulosti.
3. **Ownera s právy vlastníka tabulky neubrání** (`disable trigger`). Jde to jen odhalit —
   proto je kontrola driftu součástí migrace, ne příslušenství.
4. **Neověřuje správnost částky.** `spread_cost` je pořád číslo od klienta. Evidence není kontrola.

### Vady nalezené při mapování (NEOPRAVENO, samostatné položky)
- **Odečet kreditů běží ve SMYČCE** `for (i < plan.cost) rpc('use_credit')` (claude-proxy:280).
  Jednotlivý krok je atomický, celek ne → pád uprostřed strhne ČÁST ceny spreadu.
- **`free_balance` je CAS bez retry a bez kontroly počtu dotčených řádků** (:301) → při prohrané
  race se tiše neodečte nic. Komentář to označuje za záměr.
- **Měsíční strop se kontroluje před voláním Claude** → dvě souběžná čtení na hranici projdou obě.
- **Těla `use_credit` a `add_credits` NEJSOU v repu** — žijí jen v produkční DB. Jejich atomicita
  je odvozená z komentářů, ne doložená definicí.
- **Affected doc(s):** RUNAR_BACKLOG.md (položka evidence → odkaz na fázi 2).
- **NEPUŠTĚNO** — čeká na ownera. Rozhodnutí pro něj: GDPR retence uzavíracích řádků po smazání účtu.

---

## 2026-07-19 — Zakládací Norny zdarma + GDPR odpověď k ledgeru [tune]

### A) Zakládací Norny = mód `founding`
- **Rozhodnutí (KUKY):** založení stromu je zdarma. Textové čtení bez hlasu (~$0.004), takže
  je to zdarma **nákladově**, ne dotací — a hlavně to nevyrábí výjimku v placené cestě.
- **Stejná posture jako životní runa:** cenu určuje SERVER podle `mode`, ne číslo od klienta.
  Podlaha `Math.max(1, spread_cost)` proto zůstává — klient si zdarma říct nesmí.
- **Dvě podmínky navíc, které životní runa nemá:**
  1. **Založení je KROK 2** — proxy vyžaduje už existující `life_rune_text`. Bez toho by
     `mode:'founding'` byly Norny zdarma pro kohokoli, kdo si o ně řekne.
  2. **Jednou za život účtu** — marker `tree_founded_at`, zapsaný **CAS** (`is null`) až
     PO úspěšném čtení. Kdyby se značilo předem, selhání modelu by uživateli sebralo založení.
- **Marker NENÍ v klientském grantu** (hlídá ⑩) — jinak si ho uživatel z konzole vynuluje.
- **Hlas se u založení nenabízí.** Skryté tlačítko není ochrana, jen důsledná nabídka:
  `elevenlabs-proxy` o typu čtení neví (destrukturuje jen `{text, lang}`). Bezplatnost stojí
  na tom, že se TTS nekoná — ne na tom, že by ho někdo zakazoval.
- **Vizuál se nevymýšlel:** zakládací CTA je kopie tvaru `tree-reveal-cta`
  (`tree-reveal-intro` + `vcn-btn btn-gold`), žádné nové CSS.
- **Založení stromu tím vychází na 0 kreditů** (životní runa 0 + zakládací Norny 0).

### B) GDPR: ledger po smazání účtu — ODPOVĚĎ, ne otázka na ownera
- **Řádky zůstávají, hashovat se nemají.** Doloženo v kódu: `delete-account` nuluje
  `gift_codes.used_by` a pak volá `auth.admin.deleteUser()`, což kaskádou maže `user_profiles`
  i `readings`. Po smazání **neexistuje žádná tabulka, která by UUID přeložila na e-mail nebo
  jméno** — klíč je zničen, řádek je fakticky anonymní účetní záznam (recitál 26).
- **Hashování by ochranu nepřidalo** (mapování už neexistuje) a zabilo by dohledání historie
  u ŽIVÉHO účtu, tedy přesně to, kvůli čemu evidence vznikla.
- ⚠️ **Platí jen dokud mapování nedrží jiná tabulka.** Až přibude Shopify / objednávky
  (objednávka nese e-mail i `user_id`), závěr se musí přezkoumat.
- ⚠️ **Technický rozbor, ne posudek** — patří na seznam pro právní/DPO review (už v backlogu).
- **Affected doc(s):** RUNAR_PRIVACY.md (řádek o retenci ledgeru doplněn v témže commitu).

### Nasazení — ZÁLEŽÍ NA POŘADÍ
1. SQL `sql/2026-07-19_tree_founding.sql` (owner)
2. `supabase functions deploy claude-proxy` — MUSÍ být před klientem
3. push klienta

---

## 2026-07-19 — Norny viditelné až po životní runě [tune]

- **Rozhodnutí (KUKY):** „Norns se objeví až potom, co uživatel udělá life rune, jinak jsou
  neviditelné." Dává to smysl rituálně i technicky: Norny JSOU zakládání stromu a to je krok 2 —
  proxy je bez `life_rune_text` stejně odmítne. Skrytí je důsledná nabídka, ne ochrana; branou
  zůstává server.
- ⚠️ **PAST V MŘÍŽCE, kvůli které to není jednořádková změna.** `.spread-mode-row` je
  `grid-template-columns: repeat(6,1fr)` a spany se rozdávají přes `:nth-child(4)/(5)`.
  `display:none` prvek z rozložení vyřadí, **ale `nth-child` ho dál počítá** — spany by zůstaly
  u původních pořadí a spodní řada by se rozjela. Proto modifikátor `.no-norns`, který dá všem
  čtyřem zbylým `span 3` (dvě řady po dvou) místo spoléhání na pořadí.
- **OVĚŘENO V PROHLÍŽEČI, ne úvahou:** změřeno `getBoundingClientRect()` ve třech stavech.
  Bez `.no-norns` vyjde spodní řada nesouměrná (horseshoe 43 px vs yggdrasil 32 px);
  s ním jsou všechna čtyři stejná. Absolutní čísla jsou bezcenná (karta má nulovou šířku
  za auth stavy), poměry sedí — a rozdíl souměrné/nesouměrné je přesně to, co se ověřovalo.
- **§13 full-path:** brána se přepočítá na třech místech, protože `_lifeRuneText` dorazí v každém
  jinak — při vstupu do reading tabu (`_resetReadingTab`), po načtení profilu z DB
  (`fetchUserProfile`) a hned po vygenerování životní runy (bez reloadu).
  Navíc: kdo stojí v Nornách a runu ztratí (odhlášení), spadne zpět na single — jinak by zůstal
  v módu, který nevidí.
- **Affected doc(s):** žádný.

### Zapsány dvě výhrady k GDPR závěru (KUKY: „ok, zapsat")
Text už je v `RUNAR_PRIVACY.md`; do backlogu patří proto, že mají **spouštěč**:
1. **Shopify** — objednávka nese e-mail I `user_id`, čímž OBNOVÍ mapování UUID → osoba.
   Celý závěr „řádky v ledgeru smí přežít smazání účtu" stojí na tom, že po smazání žádné
   mapování nezbyde. Připsáno k položce Shopify webhook jako spouštěč přezkumu.
2. **Právní/DPO review** — `credit_ledger` přidán na seznam k posouzení, s poznámkou, že můj
   závěr je technický rozbor, ne posudek.

---

## 2026-07-19 — Tři opravy z ostrého průchodu zakládáním [tune]

Owner prošel celý rituál naživo. Tři nálezy, jeden z nich moje chyba.

### 1) BUG (moje): zakládací CTA prosakovalo do cizích stavů
`updateTreeTab()` skrývá stavy seznamem `states = [...]` a `'tree-founding-cta'` jsem do něj
**nepřidal**. Jednou zobrazené CTA se už nikdy neskrylo — owner ho viděl viset pod formulářem
na datum narození, tedy ve stavu, kde životní runa ještě neexistuje.
**Poučení:** nový stavový prvek musí do seznamu stavů v tomtéž kroku, jinak je to §13 full-path
porušené hned při vzniku. Nový prvek se ukázal, protože jsem napsal `display='block'`;
skrývání obstarává někdo jiný — a na toho jsem se nepodíval.

### 2) Během zakládání jsou ostatní spready nedostupné
Zakládání je rituál s jedním krokem, ne nabídka. A prakticky: kdyby uživatel odešel do jiného
spreadu, příznak `_foundingPending` by mu zdarma zaplatil něco jiného, než si vybral.

### 3) Po dokončení se nedělo nic viditelného
Owner: „výklad hotovo, jak to teď poznám ve stromě? Nejsem tam přesměrován ani odkázán a mně
přijde, že se nic nestalo." Přidán potvrzovací blok s cestou do stromu — **odkaz, ne
přesměrování**, aby uživatele nevytrhlo z čtení, které si právě čte.

- **OVĚŘENO V PROHLÍŽEČI, ne úvahou** — šest stavů: bez runy (Norny skryté) · s runou
  (vše dostupné) · při zakládání (jen Norny, zbytek zamčený) · po založení (odemčeno) ·
  CTA se po překreslení skryje · potvrzení mizí s výstupy.
- ⚠️ **Past při ověřování (zapsáno schválně):** první běh hlásil `_syncNornsGate is not defined`,
  ačkoli funkce v souboru byla. Prohlížeč držel `runar-reading.js` z **předchozího** náhledu na
  témž portu. Skoro jsem začal hledat chybu v kódu, který byl v pořádku.
  **Než se diagnostikuje „funkce neexistuje", ověř, co má prohlížeč doopravdy načtené.**
- **Affected doc(s):** žádný.

---

## 2026-07-19 — Zakládání dostalo příběh; formulář zmizel; přesměrování do stromu [tune]

Druhý ostrý průchod ownera. Tři nálezy.

### 1) Formulář „BEFORE WE BEGIN" u rituálu nedával smysl
Owner: *„objeví se tohle okno, ale to je zablokované. Vůbec nevím, proč tu je!"*
Oblast života / co hledáš / pro koho jsou volby, které zakládací Norny **nemají** — rituál je
daný, ne konfigurovatelný. Formulář se během zakládání skryje a místo něj se ukáže **příběh
Rúnarovým hlasem** (owner: „dát tomu příběh"). Není to návod („teď klikni sem"), je to vyprávění
o tom, co se právě děje: životní runa byla tvoje od začátku, teď přicházejí kořeny — tři runy
pro tři, které sedí u studny pod stromem.

### 2) Přesměrování do stromu (owner o to žádal podruhé)
Odkaz „GO TO YOUR TREE" mu unikl, takže po dokončení následuje **skok do Tree tabu**
s prodlevou `DELAY_FOUNDING_TO_TREE = 4000 ms` — okamžitý skok by uživatele vytrhl z výkladu
dřív, než ho vůbec uvidí. Konstanta je u ostatních v `runar-app.js`, ne magické číslo v logice (§10).
- ⚠️ **Co owner na stromě uvidí, není moje lane.** Přivedu ho tam; jestli je na stromu vidět,
  že vznikl, závisí na rendereru (CODE-tree). Slibovat to nemůžu.

### 3) Odečet 2 kreditů — na tohle poprvé odpoví EVIDENCE
Owner si nebyl jistý, jestli šlo o zakládání nebo o běžné placené Norny (2 kredity).
`credit_ledger` (nasazený dnes) tuhle otázku poprvé zodpoví daty místo dedukce: `reason` u toho
řádku ukáže, jestli pohyb přišel z kódu, nebo je `unattributed`. **Kód se kvůli tomu neměnil** —
dokud se nepotvrdí, že šlo o zakládání, není co opravovat.

- **OVĚŘENO V PROHLÍŽEČI:** běžný stav (formulář ano / příběh ne) · zakládání (formulář ne /
  příběh ano, oba jazyky) · po dokončení (zpět na formulář).
- **Affected doc(s):** žádný.

---

## 2026-07-19 — Evidence hned první den dokázala vadu odečtu; a dvě chyby v ní samé [tune]

### Co ledger ukázal na ostrých datech
```
21:50:08.658  credit  -1  →5  unattributed  postgres
21:50:08.519  credit  -1  →6  unattributed  postgres
```
**Dva samostatné řádky po −1, 139 ms od sebe** — to není odečet za 2 kredity, to je
**smyčka `for (i < plan.cost) rpc('use_credit')`** (claude-proxy:280), zapsaná ráno jako vada č. 1.
Evidence ji doložila **prvním použitím**, a to bez toho, aby ji kdokoli hledal. Zároveň potvrdila,
že šlo o běžné placené Norny, ne o zakládání (to by neodečetlo nic) — takže se neopravovalo nic,
co nebylo rozbité.

### Dvě chyby v mém vlastním návrhu evidence (obě odhalila realita, ne úvaha)
1. **`actor` je `postgres` u všeho, ne `service_role`.** `use_credit` je SECURITY DEFINER, takže
   `current_user` uvnitř je vlastník funkce. Signál „actor ≠ service_role = lidská ruka",
   který jsem do migrace napsal, **neplatí**.
2. **`reason` je `unattributed` u všeho**, protože žádná RPC zatím nevolá `ledger_ctx()`.
   Takže ani druhá půlka detekce driftu zatím nefunguje.

**Důsledek, který se nezakrývá:** evidence je dnes úplná v tom, ŽE pohyb zaznamená, ale neumí říct
PROČ. Ověřovací dotaz (B) v migraci je proto opatřen varováním místo toho, aby budil dojem hlídače.
Spraví to až fáze 2 (RPC nastaví důvod).
**Poučení:** kontrolní signál se musí ověřit na ostrých datech, ne odvodit. Obě ta tvrzení
vypadala v migraci samozřejmě a obě byla mimo.

### UX zakládání — dvě změny od ownera
- **Automatický skok do stromu ZRUŠEN.** Vytrhával by uživatele z výkladu, který si čte. Místo
  toho se tlačítko do stromu po `DELAY_FOUNDING_TO_TREE` **rozsvítí** (`founding-call`, glow ven —
  ztlumení by se u zlatého CTA četlo jako „nedostupné") a čeká.
- **Zakládací Norny zůstávají ve stromě natrvalo**, stejně jako životní runa (KUKY: „měl by se
  přesunout ke stromu tak, aby tam zůstal navždy"). Text se načítá z `readings` podle
  `user_profiles.founding_reading_id`, který při zakládání zapsal **server** — klient si ho
  nevybírá, jinak by si do stromu mohl nechat zobrazit cizí čtení.
  Blok je kopie tvaru `tree-reading-exists`, žádné nové CSS kromě animace.
- **OVĚŘENO V PROHLÍŽEČI:** animace tlačítka + zhasnutí při skrytí · blok bez textu skrytý,
  s textem viditelný · markdown hlavička oříznutá · rozbalování · islandský nadpis.
- **Affected doc(s):** žádný.

---

## 2026-07-19 — Vyústění rituálu patří do stromu, ne do čtečky [tune]

- **Rozhodnutí (KUKY, třetí ostrý průchod):** *„když na to koukám, tak by se to tam nevešlo…
  asi bude lepší to dát do stromu života přes root your tree, než to cpát někam jinam."*
- **Blok `founding-done` ve čtečce SMAZÁN celý.** Čtečka už nese výklad, „HEAR RÚNAR SPEAK",
  „DRAW ANOTHER RUNE" a „START OVER" — třetí potvrzovací blok se tam nevejde, ani vizuálně
  ani významově. Po založení se rovnou přepne do Tree tabu, kde na uživatele čeká text
  zakládacích Norn, který tam **zůstává napořad**. To je to potvrzení; druhé není potřeba.
- **Uklizeno CELÉ, ne jen skryto** (§10, žádný mrtvý kód): HTML blok · JS větev · CSS animace
  `founding-call` · **4 překladové klíče** (`founding_done_text`/`_btn` × 2 jazyky).
  `git grep` po `founding-done|founding_done|calling` ve `v2/` vrací prázdno.
  Poznámka: dvě hodiny stará animace šla pryč beze zbytku — funkce, která přežila jen jako
  „už to tam je", je horší než ta, co nikdy nevznikla.
- **Affected doc(s):** žádný.

### Nové pravidlo od ownera — ověření si vyžádat
KUKY: *„tam kde ti tahle kontrola pomůže a sám ji nemůžeš dostat, tak ji po mě žádej.
Aspoň to máme potvrzené."* Uloženo jako `memory/ask-owner-for-checks-you-cannot-run.md`.
Kam Code nevidí: produkční DB · appka v přihlášeném stavu (lokální náhled uvízne na auth
branách) · logy edge funkcí (CLI verze tu nemá `functions logs`). Dnes jsem dvakrát odvodil
správně a měl štěstí, jednou odvodil špatně (kořeny stromu). **Dedukce z kódu je hypotéza,
i když zní jistě.**

---

## 2026-07-19 — Zakládání se NIKDY nespustilo: četlo vlastnost, která neexistuje [tune]

- **Vada:** `_isFounding` četlo `o.mode`, ale `_generateNornsReading()` posílá objekt
  `{ runes, min, buildPrompt, tokens, credits, outputId, outId, lblId, kind:'NORNS' }` —
  **žádný `mode` tam není**. Výraz byl proto **vždy false**. Zakládání stromu se nespustilo
  ani jednou: owner klikal na „ROOT YOUR TREE", dostal běžné placené Norny a zaplatil je.
- **Jak se to našlo:** ne z kódu, ale z DB. `tree_founded_at = NULL` a `founding_reading_id = NULL`
  při `life_rune_text` vyplněném. Owner ten dotaz pustil na moji žádost — přesně to nové pravidlo
  [[ask-owner-for-checks-you-cannot-run]] v praxi. Z kódu jsem si toho nevšiml ani při psaní,
  ani při dvou kolech oprav.
- ⚠️ **Jak chyba vznikla (stojí za pojmenování):** `mode: 'norns'` v tom souboru EXISTUJE — jen
  v úplně jiném objektu (`_SPREAD_SLOT_CFG`) o pár set řádků výš. Sáhl jsem po tvaru, který jsem
  v souboru viděl, místo po tom, který se na tomhle místě předává. **JS nepomůže: čtení
  neexistující vlastnosti je `undefined`, ne chyba** — takže se to tvářilo, že funguje, a jen
  tiše nikdy nenastalo.
- **Guard ㉒** (`verify_founding_flag.js`): porovná vlastnost, kterou rozpoznání čte, s objektem,
  který volající posílá — včetně hodnoty. Záměrně úzký; obecné „čteš vlastnost, kterou nikdo
  nenastavuje" chce typový systém, ne grep.
- **OVĚŘENO ROZBITÍM, tři stavy:** původní chyba (`o.kind`→`o.mode`) · špatná hodnota
  (`'NORNS'`→`'norns'`) · volající přestane `kind` posílat. **3× CHYTL**, po obnovení zelená.
- **Affected doc(s):** žádný.

---

## 2026-07-19 — Táž chybná domněnka na dvou místech; opravil jsem jen jedno [tune]

- **Co se stalo:** trigger `guard_life_rune_immutable` propouštěl jen
  `current_user = 'service_role'`. V Supabase SQL editoru je ale role `postgres`,
  takže trigger **zablokoval i ownera** — reset účtu nešel spustit vůbec (42501).
- ⚠️ **Tuhle domněnku mi data vyvrátila UŽ PŘED TÍM.** Ledger téhož dne ukázal
  `actor = postgres` u všech pohybů; zapsal jsem si, že to rozbíjí detekci driftu,
  a **opravil jen ověřovací dotaz v ledgeru**. Že tatáž věta („serverové = service_role")
  stojí i v podmínce triggeru, mě nenapadlo — díval jsem se na místo, které zrovna svítilo.
  **Poučení: když se ukáže, že domněnka neplatí, musí se dohledat VŠUDE.** Trvalo to
  30 sekund (`grep -rn "current_user" sql/`) a našlo přesně jeden další výskyt.
- **Oprava:** branka míří na klienta a jen na něj — `current_user not in ('authenticated','anon')`.
  To je i správnější tvar: účel triggeru je zastavit prohlížeč, ne vyjmenovávat serverové role
  (kterých může přibýt).
- **Bezpečnostní dopad = žádný.** Klient byl blokovaný správně po celou dobu, edge funkce
  (service_role) procházely správně. Rozbitá byla jen administrátorská cesta.
- **Affected doc(s):** žádný.

---

## 2026-07-19 — Tester reset stromu (edge funkce, gate na is_tester) [tune]

- **Účel:** owner testuje zakládání jako běžný uživatel (`zkukula@gmail.com`, ne admin — admin
  se auto-povyšuje na premium a reálnou rune_seeker cestu neprojde). Potřebuje strom mezi testy
  resetovat bez SQL editoru, aby našel další chyby.
- **Reset je server-side edge funkce `reset-tree`**, ne klientský zápis: sloupce `life_rune_*`,
  `tree_founded_at` atd. nejsou v klientském grantu a immutability trigger by klienta stejně
  zablokoval. Edge funkce běží jako service_role → trigger ji propustí.
- ⭐ **Gate = `is_tester`, NE admin e-mail.** Reset je schopnost testera. Kdyby se gatovalo na
  admina, musel by se admin e-mail seznam (dnes jen v `isAdmin()`) zduplikovat do edge funkce =
  §20. Jedna podmínka, jeden zdroj pravdy. `zkukula@gmail.com` dostane přístup nastavením
  `is_tester = true`, i když admin není.
- **Rozšiřuje existující koncept, nezakládá nový:** `is_tester` už žije (privacy sloupce
  2026-07-13, journal storage, consent flow, admin readings view). Klient ho čte do `isTester`.
- **Tester bar viditelný jen když `isTester`** — ověřeno v prohlížeči (běžný účet nevidí,
  tester vidí, oba jazyky). Bezpečnost je na serveru: běžný účet, který funkci zavolá z konzole,
  dostane 403.
- **Tester tier jako produkt = backlog** (KUKY „blízká budoucnost"): text-only zdarma, hlas po
  redeem. ⚠️ „text-only" půjde vynutit jen v UI — EL_PROXY tier nezná, takže je to stejná mez
  jako u zakládání. Zapsáno s tímhle omezením, ať se to nepřehlédne.
- **Affected doc(s):** RUNAR_BACKLOG.md (tester tier položka).
- **NASAZENO:** edge funkce `reset-tree` deployed. Owner nastaví `is_tester = true` pro svůj účet.

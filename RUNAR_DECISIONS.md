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

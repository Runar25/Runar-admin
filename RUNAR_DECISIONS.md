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

## 2026-07-21 - §1 upraveno: patch skript = vlastni slot session, ne sdileny

**Rozhodnuti KUKY** (po handoffu CODE-tune o anti-kolizi): §1 prestal sedet, kdyz bezi 3 Code
session, dve v `[tune]`. Puvodni pravidlo "patch VZDY scripts/_patch.py" byl SDILENY slot ->
session si scratch prepisovaly pod rukama (2026-07-19 se to stalo 3x za den).

**Nove:** patch skript = VLASTNI gitignored slot session. `scripts/_patch.py`=CODE-tree ·
`scripts/_patch_tune.py`=CODE-tune · `_patch_<session>.py` dalsi. Reconcile dvou protichudnych
pameti: stabilni cesta per session splnuje OBOJI - jeden allowlist radek na slot (zadny
permission-prompt treadmill) I zadna kolize (kazda session vlastni soubor). Gitignored ->
`git add -A` ho nesebere.

**§20 hlidany pri tom:** stejne pravidlo zilo ve DVOU pametich, ktere si odporovaly -
`one-patch-script-path` ("vzdy sdilene _patch.py") vs `parallel-code-sessions-collision`
("nikdy sdilene, do scratchpadu"). Srovnano: one-patch je ted vlastnik pravidla (vlastni slot +
allowlist duvod), parallel vlastni sirsi kolizni protokol. parallel byla zrovna rozdelana jinou
session (`M`) -> NESAHAL jsem na ni, presne dle protokolu, ktery tenhle zaznam kodifikuje.

**Affected doc(s):** CLAUDE.md · memory/MEMORY.md


## 2026-07-21 - Blank duch-vetev ZRUSENA (KUKY): Blank je bezna stinova runa

**Rozhodnuti KUKY (design):** *"me vubec nevadi, ze se neztlumi. tohle tam ani nechci. ani at
neni pruhledna. jestli je to v dokumentech tak opravit.. je to zbytecnost. budeme mit 4 elementy
a stin, vsechny budou vypadat stejne. ja jsem s tim v miru."*

Blank/Odinn tedy zustava jak je od kroku 2: **bezna stinova runa** (el:'shadow'), ktera se ucastni
poradi run jako kazda jina. ZADNA vyhrazena duch-vetev, ZADNA pruhlednost, zadne listy.
Engine se NESAHAL vubec.

**Kontext, ktery to spustil (a moje chyba v navrhu):** navrhl jsem "duch-vetev" jako viditelny
prinos, aniz jsem to zmeril. Kdyz jsem to zmeril na KUKYho exportu (18 Blank cteni): Odinn je
ve stinu TRETI runa (hagalaz > isa > odinn) a stin vyrusta jen ze 2 run -> Blank se na vetev vubec
nedostane. Na jeho strome by duch-vetev BYLA NEVIDITELNA, at bych ji postavil jakkoli. Tataz past
jako cely tyden: tvrdit "viditelne" bez mereni ([[measure-dont-eyeball]]).
Pri opravnem cteni jsem navic zjistil, ze §4 vede Blank jako VLASTNI signal (vyhrazena vetev),
ne jen "pruhledna odinnovska stinova vetev" -- takze verny design by byl jeste vic prace.
KUKY to cele zrusil: zbytecnost.

**Srovnano v docich** (duch-vetev byla zivá v 5 tree docich): RUNAR_TREE.md §4 + poznamka,
RUNAR_TREE_BUILD.md, RUNAR_TREE_SPECIALS.md, RUNAR_TREE_TODO.md, memory/runar-patterns.md.
Historicke zminky v RUNAR_DECISIONS.md (append-only) zustavaji -- byly pravdive ke svemu datu.

**Zbyva ze signalu §4:** vaha z poctu poli a seeking do Norns osy -- oba na realnych datech
SLABE (pole vetsinou prazdna). Prace na tree signalech se tim v podstate vycerpala.

**Affected doc(s):** RUNAR_TREE.md · RUNAR_TREE_BUILD.md · RUNAR_TREE_SPECIALS.md · RUNAR_TREE_TODO.md · runar-patterns.md


## 2026-07-21 - Hystereze poradi run (prah 2): konec blikani tvaru vetve kolem remizy

**Zadani:** KUKY poslal dva exporty (n=175, viewN 144) s tim, ze kolem polohy 144 se DVE vetve
preklapi ob jedno cteni. Zvolil prah 2.

**Diagnoza na jeho datech** (ne na vymyslenych): pri posunu 144 -> 145 se hnou presne dve vetve --
voda (Berkano/Perth se mijely o 1 runu) a stin (Isa/Odinn taky o 1). Nejde o zavadu ani
nedeterminismus: krok 3 poctive zrcadli remizu, kde jedno cteni prehodi poradi run, a tvar vetve
se prehodi s nim.

**Reseni: hystereze.** Poradi run per element se drzi STICKY (inkrementalne, jak se log scita).
Nova runa prevezme misto nad predchudcem, jen kdyz vede o >= RUNE_HYST (=2). Blikani kolem remizy
zmizi; skutecny trvaly posun (runa zacne vest o 2+) projde. Prah 1 = puvodni chovani.
Mechanika je v `build_tree_production.py` v miste, kde uz krok 3 pocita poradi run -- z jednorazoveho
sortu podle poctu se stalo sticky bublani. Engine netknuty.

**Overeno DVAKRAT, na KUKYho datech:**
- deterministicky replay logiky na jeho log: prah 1 = 10 prekloneni tvaru hlavni vetve za cely log,
  prah 2 = 7. Ty tri, co zmizely, jsou remizy; sedm zbylych jsou skutecne trvale posuny.
- end-to-end na vykreslenem strome (jeho export protlacen realnym RunarTreeProd): pred hysterezi
  water Berkano->Perthro a shadow Odinn->Isa pri 144->145; PO hysterezi voda i stin drzi tvar
  pres 144/145/146. Presne ty dve vetve, co owner hlasil.

**Metodicka poznamka:** prvni pokus o end-to-end test lhal -- prohlizec mel v pameti STAROU verzi
runar-tree-prod.js z doby pred regeneraci (soubor na disku uz hysterezi mel, nactena funkce ne).
Chyceno kontrolou `render.toString().indexOf('RUNE_HYST')`, opraveno eval cerstveho zdroje. Bez teto
kontroly bych byl ohlasil "nefunguje to" na kodu, ktery fungoval. [[measure-dont-eyeball]] plati
i na to, CO se meri: overit, ze merim aktualni kod, ne cache.

**Affected doc(s):** RUNAR_TREE.md


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

---

## 2026-07-19 — Anti-kolize guard: scratch se necommituje (pre-commit) [tune]

- **Kontext:** CODE-reader předal souběhový problém (dvě/tři Code session, jeden worktree).
  Worktree owner zamítl. Zbylá volba = konvence, jenže „kázeň" je přesně to, co dnes selhalo
  (`commit-by-pathspec` jsem měl v paměti a stejně 3× sebral cizí soubory). Řešení = převést
  vynutitelnou část na KONTROLU, protože ta se vynutí sama napříč lanes.
- **Ověřeno (handoff = žádost, ne fakt):** `commit-msg` hook fakt neexistuje (jen `pre-commit`,
  `pre-push`). ALE dvě zjištění mění návrh CODE-readera k lepšímu:
  1. **Adresáře, co dnešní `git add -A` sebral (`tree-snapshots/`, `tree-lab-*/`, `sigil-lab/`,
     `_backup/`), jsou UNTRACKED scratch — 0 trackovaných souborů.** Guard tedy nepotřebuje znát
     lane vůbec: pravidlo je „scratch se necommituje", což je maximálně lane-agnostické a chytí
     i dvě session v téže `[tune]` lane.
  2. **Nepotřebuje `commit-msg` ani re-install.** Rozšířil jsem existující `pre-commit.py`, který
     je nainstalovaný a volá repo soubor → účinné hned, nikdo nic nepřeinstalovává.
- **Break-test:** stagnutý scratch → BLOK (exit 1, s `git reset` nápovědou) · normální doc → OK.
- ⚠️ **Co guard NEŘEŠÍ (schválně pojmenováno):** kolizi na SDÍLENÉM TRACKOVANÉM souboru
  (`RUNAR_DECISIONS.md`, `runar-app.js`) — git nepozná, čí řádky jsou čí. To kryje jen `git pull`
  před prací + pathspec commit. A funguje jen tomu, kdo má hook nainstalovaný (jako SW bump/IS lint).
- **CODE-reader potvrdil** svoji rate-limit část (gen_batch, jeho scratchpad, mimo repo — nesahá
  na mě) a ostrý postřeh: CODE-tune i CODE-reader jsou OBA `[tune]`, takže „jeden patch soubor na
  lane" pořád sdílí dvě session. Můj guard je na to odpověď (lane-agnostický).
- **Affected doc(s):** žádný.
- **Nabídnuto ownerovi (NEuděláno unilaterálně):** přidat ty scratch dirs i do `.gitignore`
  (prevence u zdroje) — je to CODE-tree doména, tak čekám na kývnutí.

### Oprava téhož dne: guard měl false-positive (opraveno před nasazením do praxe)
- První verze guardu (453a1ec) blokovala **celý prefix** `v2/tree-lab-`. Jenže dva lab dirs
  mají TRACKOVANÝ zdroj (`tree-lab-branch-composer/runar-branch.js`, `tree-lab-trunk/runar-trunk.js`),
  který CODE-tree legitimně edituje — guard by je **falešně zablokoval**. Break-test jsem udělal
  jen proti `tree-snapshots` (0 tracked) a přehlédl to.
- **Odhaleno tím, že owner řekl „přidej gitignore"** — při kontrole tracked/untracked pro gitignore
  vylezlo, že tree-lab NENÍ celé scratch. Bez toho kroku by guard tikal jako mina až do prvního
  commitu CODE-tree do lab zdroje.
- **Oprava:** guard hlídá STAV, ne adresář — blokuje jen `A` (nově přidaný untracked), pustí `M`
  (modifikace trackovaného). Ověřeno predikátem na 8 stavech + ostře (scratch add → blok,
  doc modify → OK). **Poučení (opět): break-test proti JEDNOMU případu netestuje hranici.**
- **`.gitignore`:** přidány jen `v2/tree-snapshots/` a `_backup/` (jednoznačně nikdy-trackované).
  Lab dirs se NEgitignorují — mají trackovaný zdroj; ty kryje hook.

---

## 2026-07-21 — SEASON_POOLS: highsummer rozšířen (+12) [tune]

- **Co:** `SEASON_POOLS.highsummer` v `runar-character.js` — +8 bright, +4 cold. Nová `id` se
  sama zapojí do shuffle-bagu (`_seasonBagPick` bere id z listu za běhu), žádná jiná změna kódu.
- **Zdroj:** Cowork handoff. Obrazy schváleny KUKY, IS tvary ověřeny BÍN **A Sigrún (naturalness)**
  — highsummer je jediný koš se Sigrúniným kývnutím, proto ship. Zbylých **23 entries**
  (autumn/darkening/deepwinter/spring/earlysummer) **NEVLOŽENO** — čekají na Sigrúninu IS-naturalness (§19).
- ⚠️ **Coworkovy POČTY v handoffu byly ŠPATNĚ** (ověřeno programově, ne okem): tvrdil bright 11 /
  cold 7, realita byla **12 / 5**. Pool se od jeho snapshotu posunul (jiná session ho editovala),
  stejně jako jeho ř. 536 byl reálně 546. Handoff = žádost, ne fakt — ověřeno proti HEAD.
  **Výsledek: highsummer bright 20, cold 9** (NE handoff-předpokládané 19/11).
- **OVĚŘENÍ (§19, výsledek ne tvar):** node --check OK · programový přepočet po vložení = 20/9
  (assert) · žádné duplicitní id v highsummer (assert) · žádná kolize nových 12 id s existujícími ·
  check-is OK · smoke 22/22.
- **Affected doc(s):** žádný (čísla poolů nikde neopisujeme — §20; jsou v configu-builderu).

---

## 2026-07-21 — Ask Rúnar follow-up se usekával uprostřed věty (IS token-density) [tune]

- **Vada (Cowork report, 2× doloženo v1.0, obojí ISLANDSKY):** follow-up odpověď se utnula
  uprostřed věty, bez tečky („…krefst trausts á öðrum. Spurningin um" [utnuto]).
- **Root cause:** `askRunar()` volalo `callProxy(..., 120, ...)` — strop 120 tokenů. 120 tok ≈ 40
  slov ANGLICKY, ale ISLANDŠTINA je ~1,5–2× hustší na tokeny (delší slova, þ/ð/æ/ö), takže ~40
  slov IS = ~200+ tokenů → usekne se kolem 120. Proto obě pozorované trunkace islandské, ne náhoda.
- **Fix A (strop):** `askCap = (lang === 'is') ? 240 : 150`. Délku pořád drží PROMPT
  (`buildAskPrompt`: „no more than ~40 words"); cap je jen strop s rezervou. EN se prakticky nemění.
- **Fix B (pojistka):** `_trimToSentence()` — když odpověď nekončí terminální interpunkcí, ořízne
  ji k poslední celé větě. Uživatel nikdy neuvidí useknutý fragment, i kdyby strop přece jen padl.
- ⚠️ **Cowork uvedl ř. 536, reálně ř. 546** (řádek driftoval — Cowork diagnostikuje kód, na který
  nevidí). Substance claimu ale seděla. Ověřeno proti HEAD.
- **OVĚŘENÍ (§19, na ploše kde bug žije = zobrazený text):** `_trimToSentence` unit-testována
  přímo z runar-reading.js na 8 případech vč. OBOU reálných bugů z reportu → ořízne je na celou
  větu; správně ukončené texty nechá beze změny. Fix A ověřen že dorazí do volání. node --check,
  check-is, smoke 22/22.
- ⚠️ **LIVE potvrzení nezbytné, ale nemůžu ho spustit** ([[ask-owner-for-checks-you-cannot-run]]):
  že Fix A dává IS follow-upu DOST místa (finish_reason != length), poznám jen z živého volání
  proxy. Fix B ale činí user-visible výsledek bezpečným BEZ OHLEDU na to — takže live check je
  potvrzení, ne bloker. Owner může ověřit: polož delší IS follow-up (např. „endursagt á mannamáli"
  na spreadu) → má končit tečkou a ne uprostřed.
- **Affected doc(s):** žádný.

---

## 2026-07-21 — SEASON_POOLS: zbylých 23 entries (Sigrún schválila) [tune]

- **Co:** dokončení Cowork handoffu — +23 obrazů do 7 košů: autumn.bright +3, autumn.cold +4,
  darkening.bright +4, darkening.cold +3, deepwinter.cold +3, spring.cold +3, earlysummer.cold +3.
- **Odblokováno:** Sigrún kývla na IS-naturalness (poslední chybějící §19 článek; obrazy KUKY
  a IS tvary BÍN byly hotové z minula).
- **OVĚŘENÍ (§19, výsledek):** node --check · id v SEASON_POOLS 110 → 133 (delta přesně 23,
  assert) · žádný duplikát id v celém SEASON_POOLS (assert) · žádná kolize 23 nových id
  s existujícími (grep před vložením) · check-is OK · smoke 22/22.
- **Kotveno na poslední entry každého koše** (přečteno), ne na počty — počty v handoffu opět
  seděly jen zčásti (earlysummer.cold reálně 5, handoff tvrdil 7). Insertion je proto anchor-based,
  drift-proof.
- ⚠️ **KOŘEN driftu Coworkových počtů IDENTIFIKOVÁN:** Cowork čte ze zrcadla
  `C:\Users\zkuku\Claude\Projects\RÚNAR the rune keeper\`, ne z živého repa. CLAUDE.md §17 to
  zrcadlo výslovně jmenuje jako zdroj driftu. Zrcadlo se nesynchronizuje s commity, takže jeho
  snapshot poolu byl starší než HEAD. **Náprava = handoff nemá uvádět POČTY** (derivovaná hodnota,
  bydlí v souboru, drifuje) — jen entries + anchor; počty spočítá CODE z živého souboru.
- **Affected doc(s):** žádný (počty poolů se nikde neopisují — §20).

---

## 2026-07-21 — FU strop doladěn: 240/150 → 140 flat (KUKY) [tune]

- **Mění** hodnotu z předchozího záznamu (Cowork navrhl 240 IS / 150 EN — příliš velkoryse).
- **Owner:** *„máme to omezené kvůli ceně… dlouhé čtení taky nedává úplně smysl."* Follow-up má
  být krátký. Strop **rovných 140**, ne jazykový.
- **Proč flat stačí:** EN se stropu nedotkne (prompt drží ~40 slov = ~60 tok). Jediný, kdo o 140
  zavadí, je IS (~1,5-2× hustší, ~40 slov ≈ 120 tok) — 140 dá mírnou rezervu, a **Fix B
  (`_trimToSentence`) jistí, že IS follow-up u horní hranice délky přijde jen o poslední větu,
  nikdy o půl věty.** Při záměrně krátké odpovědi žádoucí.
- **Ověřeno:** node --check · Fix B regres-test 8/8 (nezměněn) · smoke 22/22.
- **Affected doc(s):** žádný.

---

## 2026-07-21 — Vrstvy pravdy + druh pravdy + docs/inbox + freshness alarm (Cowork handoff, owner promoval) [docsync]

Pětidílný Cowork handoff, vše do EXISTUJÍCÍCH domovů (§20, žádný druhý zdroj pravdy):
1. **Rozcestník v MEMORY.md dostal sloupec „Druh"** — 🔒 externě ukotveno / 📜 vytvořený kánon /
   🔄 interně rozhodnuto / 🏛 architektonické. Říká, KDE u čeho smí proběhnout náraz.
2. **MEMORY.md „Vrstvy pravdy"**: kanonická / supersedovaná (živá historie) / neklasifikováno
   (docs/inbox) / mrtvá.
3. **Nová memory `dont-invent-fact-critical`**: 🔒 fakt / 📜 lore chybějící v kánonu → zastav
   a flagni, nikdy nedomýšlej. Sebejisté vymýšlení roste s chytrostí modelu.
4. **working-style: adversariální náraz na SHODU** (jen fact-critical) — shoda dvou session
   čtoucích týž doc je ozvěna, ne důkaz; boří se proti VNĚJŠÍMU měřítku.
5. **docs/inbox/** — neklasifikovaná intake vrstva, mimo doc-kontroly, index sem neukazuje.

### ⚠️ Odchylky od handoffu (ověřuj sousední fakty, ne jen tvrzení)
- Cowork řekl vyloučit `check-docs / verify_doc_* / verify_canonical_files`. **verify_canonical_files
  NEPOTŘEBUJE** (glob jen `RUNAR_*.md`/`CLAUDE.md`). **Zato verify_escape_marks a verify_spread_prices
  ANO** (skenují všechny *.md) — ty Cowork nejmenoval. Full-path → 5 kontrol, ne 3.
- Break-test obojísměrný: tripwire v inbox/ → žádná z 5 nechytí; týž obsah v docs/ → dvě chytnou.

### Freshness alarm ㉓ (Cowork požádal, check = doména CODE)
- **Riziko:** inbox mimo kontroly = tichý junk drawer, když se přestane vysávat. Cadence
  (Cowork tridi na zacatku doc-session) je práce; check je pojistka — „co musí hlídat člověk → kontrola".
- **verify_inbox_freshness.js**: práh počtu (>6) NEBO stáří (>10 dní). Dva vědomé návrhy:
  (a) **ŽLUTÝ, ne červený** — vždy exit 0, jen tiskne ⚠; plný inbox nesmí blokovat nesouvisející
  push (vzor ⑰). (b) **stáří z GITU** (commit, který soubor přidal), ne z filesystem mtime — ten
  se při checkoutu resetuje. Untracked kryje práh počtu.
- Break-test: zdravý → OK zelená · 7 souborů → ⚠ ale smoke PROŠEL 23/23 · výpočet stáří parsuje.
- **Affected doc(s):** žádný.

---

## 2026-07-30 — Model stromu ROZSOUZEN (směr, ne dogma) · Gathering = vrstva nad journalem · tree doky 9→2 [tree]

- **Typ:** intent (owner rozhodnutí) + docsync (konsolidace). Rozsuzuje dlouhý spor „co je větev".
- **Co se rozhodlo (KUKY):**
  1. **MODEL — rozsouzené dilema** (ne trvalý zámek; strom NENÍ hotový, jen jsme vyřešili „co je
     větev"). *Element = kostra* — seskupuje větve, jde kořeny→kmen→koruna, dává barvu.
     *Runa = tvář korunní větve* — větve rostou z elementů (plošně) a runa jim dává tvar. **Runa
     přišla první** (děláme runová čtení), element/ætt k ní přišly později. KUKY: „je trochu jedno
     jak to bude udělané, pokud to bude hezké a bude to obraz člověka." **Teď mimo hru (vrátí se
     jen novým datovaným rozhodnutím + varováním, ne potají):** boughs velká přestavba (regrese,
     2026-07-04) · duch-větev pro Blank (2026-07-21) · **živé síly mezi runami** (magnety hýbající větvemi).
  2. **The Gathering = vrstva NAD JOURNALEM, ne v enginu stromu.** Každé čtení jde do journalu;
     journal JE databáze stromu (každé čtení, runa, area, intention, spread). Přesah přes víc
     čtení — opakování, kombinace, „síly" mezi runami/ætt/elementy — je informace **v datech**,
     ne v geometrii. **Strom je jen vizuální forma týchž dat.** `detectPatterns()` čte journal;
     Rúnar může vztahy pojmenovat, ale větve se kvůli nim nehýbou.
  3. **Konsolidace 9 tree doků → 2 živé** (RUNAR_TREE.md + RUNAR_TREE_RENDER.md) + BACKLOG + archiv.
- **Proč:** §20 (jedna informace = jedno místo). Devět tree doků si protiřečilo a odkazovalo na
  moved/mrtvé soubory. Model se „leštil v rohu" bez zámku → každá session ho četla jinak.
- **Opravené lži proti kódu** (ověřeno v `build_tree_production.py`, ne odhadem):
  - §3A: „vážené hlasování intention›area›seeking›world → výška" **NEPRAVDA**. Výšku (`frac`)
    řídí JEN intention (`INT_AXIS`, průměr přes čtení elementu, váha `intZone` 0.12). **Area řídí
    STRANU** (`AREA_LAT`, `areaSide` 0.35), do výšky nevstupuje. Seeking + world-fallback nepostaveny.
  - §5: žebřík „2× blíž · 3× cluster · 4× srůst" **v kódu NENÍ**. Opakování → víc větví elementu
    (`stableAssign`, ~1 na 5 čtení) + posun, která runa drží tvar (sticky pořadí, hystereze 2).
  - §0: „Element = jen barva. Větev = runa" → sladěno se zámkem modelu.
- **Pojistka před archivem (KUKY „ano s pojistkou"):** živý obsah NEJDŘÍV přenesen (BUILD §8
  produkční princip „spočti jednou, ulož do `tree_readings.branch_data`, nepřepočítávej" → TREE §8;
  prahy Gatheringu z patterns.md, katalog motivů ze SPECIALS.md, váha polí / živé kořeny / síly
  z TODO+forces → RUNAR_BACKLOG), teprve pak `git mv` (historie zachována).
- **Archivováno do `docs/archive/tree/`:** RUNAR_TREE_BUILD · runar-tree-placement · RUNAR_TREE_TODO
  · RUNAR_TREE_SPECIALS · runar-tree-forces · tree-of-life (memory) · runar-patterns (memory).
- **Reality note:** tabulky `tree_readings`/`tree_state` stále NEEXISTUJÍ — produkční princip je
  budoucí pravidlo. Dnešní strom se skládá při každém otevření tabu z `readings` regexem, proto
  se přeskládá (známá vada); „spočti jednou, ulož" je její lék, až vznikne DB.
- **Affected doc(s):** RUNAR_TREE.md (§0/§1/§3/§5/§7/§8/§9 + footer) · RUNAR_TREE_RENDER.md (footer)
  · RUNAR_BACKLOG.md (nová tree sekce + patterns položka) · CLAUDE.md (Kde hledat co) · MEMORY.md
  (index -2 řádky) · memory/working-style.md (tree pointery) · 7× docs/archive/tree/ (přesun).
  ⚠️ Zbývá pro Cowork: RUNAR_DESIGN.md „Viz také" hlavička ř.9–10 pořád ukazuje na přesunuté
  `tree-of-life.md`/`runar-patterns.md` (plain text, neboří smoke; design doc = Cowork lane).
- **Reversibility:** medium (model = owner rozhodnutí; archiv vratný přes `git mv` zpět).

---

## 2026-07-30 — Tvar stromu = zdroj speciálních výkladů (Gathering čte rozložení) [tree]

- **Typ:** intent (owner směr; navazuje na model výše).
- **Co:** Umístění větví (§3–§5: element = trs, intention = výška, area = strana) strom jen **postaví**.
  Smysl je **až ve čtení výsledného TVARU** — a to jsou „speciální výklady" = **The Gathering**.
  Čtené signály tvaru: **strana** (víc vpravo/vlevo → zaměření ven/dovnitř) · **výška** (vysoká koruna ×
  hluboké kořeny → budoucnost × minulost) · **šířka** (pestrost × soustředění) · **náklon + holá místa**
  (nerovnováha, „rosteš od kmene" — mechanika RUNAR_TREE.md §1). Data pro to **už leží v journalu**.
- **Proč:** KUKY 2026-07-30: umístění nám pomáhá rozhodnout KAM větev dát; smysl je ale AŽ v tom, co
  se z hotového tvaru přečte („víc čtení vpravo/vlevo něco znamená; vysoká koruna, široký strom…").
  „Výborně. To je ono."
- **Reality note:** NEPOSTAVENO — strom tvar dnes kreslí, ale číst ho neumí (`detectPatterns` chybí,
  DB tree_state/tree_readings neexistuje). Je to **směr, ne hotová věc**; mění se novým datovaným záznamem.
  „Umístění tvar vyrobí, Gathering ho přečte" — vrstva nad journalem, ne engine kreslení.
- **Affected doc(s):** RUNAR_TREE.md (§7 — nový blok „CO se ve tvaru čte") · RUNAR_BACKLOG.md (nový úkol).
- **Reversibility:** easy (směr, zatím bez kódu).

---

## 2026-07-30 — Kořeny = minulost/základ, zrcadlo koruny (směr; stavba lab-first) [tree]

- **Typ:** intent (owner směr; navazuje na „tvar stromu = výklad" výše).
- **Co:** Dnes se kořeny jen **kreslí** (ozdoba: rostou s věkem, barva z Life Rune) — **význam nemají**.
  Směr: **kořeny = odkud jdeš** (minulost / základ), **zrcadlo koruny ve VELIKOSTI/mohutnosti**
  (Yggdrasil — ne aby dole vypadalo stejně jako nahoře). Tvarovat je má (dle kánonu §2 = **obojí**):
  **(a) 3 zakládací Norny → 3 hlavní kořeny** (urð/verðandi/skuld, dnes jen lore, ne kód) a
  **(b) prohloubení návratem** — runa z kořene se vrátí ve čtení → kořen zesílí; minulostní/nitro
  čtení živí hloubku. Krmí čtení tvaru (§7: hluboké kořeny = drží tě minulost).
- **Proč:** KUKY 2026-07-30 — směr už dřív probraný, patří do docí; kořeny v labu ještě pořádně
  nevyzkoušené. Zrcadlení je o proporci, ne o zrcadlovém obraze.
- **Postup (potvrzeno):** **lab-first → port do produkce.** Iterace v trunk/crown-composer labu,
  pak CODE-tree portne do `build_tree_production.py` + přegeneruje `runar-tree-prod.js` + snapshot
  + smoke ⑬. Drift labu↔prod je dnes ~nulový (prod načítá tracklé lab composery přímo;
  `runar-tree-prod.js` je 1:1 generát z `build_tree_production.py`), jediné riziko = §18 kopie
  crown-composeru ve dvou místech.
- **Reality note:** NEPOSTAVENO, směr — ne rozhodnutí o hotové věci; mění se novým záznamem.
- **Affected doc(s):** RUNAR_TREE.md (§2 kořeny) · RUNAR_BACKLOG.md (kořeny úkol + parkovaný #6 zakládací vizuál).
- **Reversibility:** easy (směr, zatím bez kódu).

---

## 2026-08-02 — Strom = jádro Rúnara (vize) + metadata „proč" ZÚŽENO po kritice [tree]

- **Typ:** intent (owner vize + směr; zúženo vlastní kritikou PŘED zápisem — KUKY: „chci kritický pohled").
- **Vize (KUKY):** Strom života = **hlavní znak Rúnara**; přidaná hodnota = **čtení v čase**
  (databáze osobnosti). Hypotéza: i samostatná appka (vkládáš čtení z tarotu/run → journal → strom).
  ⚠️ **Caveat:** hodnota přijde až s retencí + dost čteními (do ~27 čtení jen 3 větve) → strom musí
  **ohromit BRZO**, jinak je „hlavní hodnota" pro nového uživatele neviditelná. Standalone = jen
  hypotéza, teď neřídí stavbu.
- **Metadata „proč" — ZÚŽENO (kritika).** Síly, co tvar dělají, se UŽ počítají (vstupy §3–§5).
  Původní nápad „uložit proč u každé části + krmit tím Rúnara" má tři díry: (1) u PEVNÉ kostry
  (kmen / tvar runy z Life Rune) je „proč" **tautologie** (převyprávěný vstup) a v čase se nemění =
  nízká hodnota; (2) riziko **falešné hloubky** (pseudo-vhled = věštba, proti „zrcadlo ne věštba");
  (3) **sekvenční riziko** — stavět datovou vrstvu + výklad na admin-beta stromu krmeném regexem,
  bez DB = střecha před základy.
- **Co DĚLÁME:** „proč" **ukázat v labu** (inspekce) — levné, pro NÁS k ladění. **Nestavět**
  produkční metadata vrstvu ani výklad z nich, dokud (a) nebude `tree_state` DB a (b) neověříme na
  reálných stromech, že výklad řekne něco pravdivého a neotřelého. Číst se má hlavně **měnící se**
  signál (rozložení v čase), ne pevný skelet.
- **Pořadí:** kořeny (vizuál) → tree DB → teprve pak metadata měnících se signálů + test výkladu.
- **Reality note:** NEPOSTAVENO, směr. Metadata odvozená (ne nový vstup).
- **Affected doc(s):** RUNAR_TREE.md (§7 „proč zatím jen lab") · RUNAR_BACKLOG.md (úkoly).
- **Reversibility:** easy (směr, zatím bez kódu).

---

## 2026-07-30 — IS Native Checklist: fronta pro Sigrún → učící smyčka

- **Typ:** intent + doc-fix
- **Co se změnilo:** `IS_NATIVE_CHECKLIST.md` přerámován z „fronty pro Sigrún" (odkládání nedodělané IS) na **učící smyčku**: my píšeme IS hotovou a ověřenou → native (Sigrún + islandští testeři) ji opraví při živém testování → z každé opravy uděláme jedno pravidlo. Přidán **bod 6 „Kolokace a idiom"** se třemi Sigrúninými opravami (réttir sig aftur → réttir aftur úr sér · stígur af hvernum → rís upp frá hvernum · þokan taki → þokan yfirtaki). Smazáno falešné tvrzení „is-grammar-qa.py píše E001 do needs-native-eye listu" (kód říká REWRITE). §19.2 dostal řádek rozlišující zrušenou frontu od učící smyčky.
- **Proč:** Meta-poznatek (Cowork): všechny tři opravy jsou tool-green (platná slova + platná gramatika) → přesně třída, kterou BÍN/GreynirCorrect minou. Ukazuje konkrétní slabý bod modelu: sloveso + předložka/částice, ne shody. Dokument na disku byl z 10.7. = předcházel zrušení fronty (18.7.), proto zněl jako rozpor s §19.2 a jednu session skutečně zmátl. Rozlišení „odkládat nedodělané ≠ sbírat opravy do pravidel" žije teď na JEDNOM místě (§19.2), §20.
- **Affected doc(s):** IS_NATIVE_CHECKLIST.md (přepis), CLAUDE.md §19.2 (rozlišovací řádek).
- **Reality note:** Tři opravy = Sigrúniny (native-authoritative). „Proč" u nich = Coworkova interpretace, v dokumentu označena „ověřit se Sigrún před zatvrdnutím v pravidlo" — nekanonizováno. Operativní pravidla (kolokační průchod) patří časem do IS gramatického bloku v `v2/runar-character.js` (§20 = jeden domov gramatiky); checklist drží jen scan-guide + příklady.
- **Reversibility:** easy (doc přepis; §19.2 řádek vratný).

---

## 2026-07-30 — Yggdrasil bytosti do RUNAR_DESIGN: Dvergar · zvířata stromu · Óðinovi vlci

- **Typ:** intent (kánon obsahu) + implementation (Cowork handoff, commit CODE)
- **Co se změnilo:** Do `RUNAR_DESIGN.md` přidány tři bloky: **A) Dvergar** (roster + katalog: čtyři směroví, Mótsognir, Durinn, Dvalin, Brokkr/Eitri, synové Ivaldiho, Fjalar/Galar, Alvíss, Andvari + agndofští Móberg/Lyngri + „další známí" + Dvergatal roll-call) do „Klíčové bytosti světa"; **B) zvířata Yggdrasilu** (Veðrfölnir, čtyři jeleni, hadi pod kořenem) k Ratatoskrovi; **C) Geri a Freki** za Huginn/Muninn.
- **Proč:** Rozšíření mytologického základu Agndofy. Provenience taguje text: [kánon] = z pramenů (Grímnismál 33, World History Encyclopedia, vikingr.org, The Warrior Lodge, Wikipedia), [Agndofa] = naše umístění/výtvor. **Klíčové rozhodnutí: „čtyři jeleni = čtyři větry" je AGNDOFA (ne elementy)** — proto v textu tag [Agndofa].
- **Affected doc(s):** RUNAR_DESIGN.md.
- **Reality note:** §20 hlídáno — Örn/Níðhöggr/Ratatoskr/Huginn/Muninn se NEduplikují, jen se na ně odkazuje („viz Eagle vzorce" / „viz Níðhöggr vzorce"). Ověřeno auditem 2026-07-30 (žádná skutečná duplikace v kánonu). Roll-call z Dvergatalu = jen jména, obsah se nevymýšlí (dokud bytost nedostane roli).
- **Reversibility:** easy (čistě aditivní doc obsah).

---

## 2026-08-02 — Fáze 1 security: require-auth na obou proxy (NASAZENO)

- **Typ:** security fix + deploy (git deploy NEVIDÍ — proto sem)
- **Co se změnilo:** `claude-proxy` (v50→**v51**) i `elevenlabs-proxy` (v27→**v28**) dostaly `if(!userId) return json({error:"unauthorized"},401)` — visitor nemá živé čtení ani hlas (jen statická Rune Collection). Rate-limit klíčovaný **jen na `userId`** (odstraněna spoofovatelná XFF cesta). Zdroj = commit `fd78a91`; nasazeno `supabase functions deploy claude-proxy|elevenlabs-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt`.
- **Proč:** audit 2026-08-02 (workflow, ověřeno proti zdroji): anonym z jakéhokoli originu dostal free Opus 4.8 s libovolným promptem (claude-proxy) **a** neomezený hlas (elevenlabs-proxy, který nekontroloval NIC — hlas = 95 % ceny). Rozhodnutí ownera: „nechci to mít děravé, zavřeme to; visitor = jen statická Collection."
- **Affected doc(s):** RUNAR_BACKLOG.md (C10 auth-část odškrtnuta; Fáze 2 díry zapsány).
- **Reality note:** **OVĚŘENO NAŽIVO** — anonymní POST na obě proxy → `{"error":"unauthorized"}` HTTP 401 (zpráva z našeho kódu, ne gateway). DB write-surface (`sql/audit_write_surface.sql` B) = 0 řádků, granty na prod live. Zbývající díry (Fáze 2: voice→zaplacené čtení #2b, spread_cost #4, life_rune flag #3, tree-update #6/#7) → BACKLOG.
- **Reversibility:** easy (`supabase functions deploy` předchozí verze z git historie).

---

## 2026-08-03 — Fáze 2 #2b: hlas jen na zaplacené čtení + readings zamčené na SELECT (NASAZENO)

- **Typ:** security fix + deploy + SQL (owner spustil) — git nevidí ani deploy, ani SQL
- **Co se změnilo:** (1) **`readings` zamčené klientovi na SELECT-only** — RLS policy `„Users manage own readings"` (cmd=ALL, `auth.uid()=user_id`) nahrazena `„Users read own readings"` (SELECT). Klient si přes veřejný anon klíč mohl PŘÍMO (mimo appku) podvrhnout/přepsat/smazat vlastní řádky readings. Zápis teď JEN server (claude-proxy, service_role). (2) **Voice gate #2b:** `readings.voiced_at timestamptz` + RPC `mark_voiced(id,user)` (SECURITY DEFINER, CAS jako `use_credit`; revoke z public/anon/authenticated, service_role smí). Klient posílá `reading_id` (`_lastReadingId`); elevenlabs-proxy (**v29**) atomicky zabere hlas přes `mark_voiced` PŘED EL, při selhání EL claim uvolní (`voiced_at=null`). Commit `a1d9d10`.
- **Proč:** audit #2b: elevenlabs-proxy po Fázi 1 vyžadoval login, ale NEMĚŘIL nic → přihlášený rune_seeker s 0 kredity měl neomezený hlas (95 % ceny). Model: hlas dědí metering čtení (čtení už odečteno v claude-proxy); kdo nemá zaplacené čtení, nemá `reading_id`, nemá hlas. Produktové rozhodnutí (KUKY 2026-08-03): **hlas jednou za čtení** (ne debit voice-unitu).
- **Affected doc(s):** RUNAR_BACKLOG.md (#2b odškrtnuto, navazující flagy zapsány).
- **Reality note:** OVĚŘENO: `readings` má teď jen SELECT policy · `voiced_at`+`mark_voiced` existují · service_role smí `mark_voiced`, authenticated ne · `mark_voiced` na neexistující řádek = null (ne error) · anonym → 401. **Owner musí naživo (admin):** čtení → hlas jednou; retry → blok. Otevřené (backlog): „someone" čtení se neukládá → nemá hlas; premium „question gate" jen klientsky.
- **Reversibility:** medium (SQL: obnovit ALL policy + drop voiced_at/mark_voiced; proxy: redeploy předchozí).

---

## 2026-08-03 — #2b voice gate VRÁCENO (rozbil tree/life-rune hlas)

- **Typ:** oprava předchozího záznamu (append-only) + deploy + SQL (owner)
- **Co se změnilo:** #2b (výše) VRÁCENO. Voice gate vyžadovala `reading_id` (= `_lastReadingId`), ale ten se nastavuje JEN v hlavním reader toku (`runar-reading.js:113/781`) — **tree/life-rune čtení (`runar-tree.js`) ani „someone" ho nenastaví** → jejich hlas dostal 403 „resting" (owner to nahlásil na reálném life-rune čtení). Proxy vrácena na Fázi 1 (require-auth, bez gate; redeploy), klient zpět na `body:{text,lang}` (commit `c58c8a1`). **`readings`→SELECT-only ZŮSTALO** (samostatný fix, nic nerozbíjí — ověřeno: čtení/hlas/Ask jedou). Owner spustil úklid: `drop function mark_voiced` + `drop column voiced_at`.
- **Proč selhalo:** postavena brána na jedné voice cestě bez zmapování VŠECH (reader · tree/life-rune · someone) a **nasazeno do živého toku bez reálného E2E testu** (jen logika + DB kontroly). Poučení: money-critical změna živého toku = napřed zmapovat všechny cesty + proklikat reálný user-flow, teprve pak deploy.
- **Affected doc(s):** RUNAR_BACKLOG.md (#2b znovu otevřeno s podmínkou).
- **Reality note:** OVĚŘENO NAŽIVO — hlas i Ask Rúnar zas fungují (owner potvrdil). Anonym stále 401 (Fáze 1 drží). DB: `readings` jen SELECT policy, `voiced_at`/`mark_voiced` smazané.
- **Reversibility:** n/a (návrat do funkčního stavu).

---

## 2026-08-03 — Fáze 2 #4: cena spreadu = server-authoritative (klient posílá slug)

- **Typ:** security fix + implementation (transitional deploy) — kód hotový, deploy + test dělá owner
- **Co se změnilo:** claude-proxy si cenu čtení počítá SÁM z nové kopie `SPREAD_COSTS` (mirror configu) přes `costFor()`, podle **slugu spreadu**, který klient nově posílá (8. param `callProxy(..., spread)`; `runar-app.js` → do body, `runar-reading.js` odvozuje slug z `o.kind`, single/ask = `single`, `runar-tree.js` life_rune). Číslo `spread_cost` už NENÍ směrodatné (dá se podvrhnout). Neznámý slug → 400 `invalid_spread`. Free větev je single-only → podvržený free spread (např. Yggdrasil zdarma) → 402 `spread_needs_credits`. Mirror hlídá smoke ⑳ (verify_spread_prices.js sekce C). **Transitional:** starý klient bez slugu spadne na `spread_cost` (+warn) → nic se nerozbije, dokud SW nepropadne; pak zpřísnit (odebrat fallback).
- **Proč:** audit Fáze 2 #4: `spread_cost` bylo klientem řízené číslo → přihlášený rune_seeker mohl podvrhnout `spread_cost:1` pro Yggdrasil (cena 5), nebo `use_credit:false` na spread a dostat drahé čtení za free-jednotku. Cenu smí určit jen server — mirroring configu na serveru je týž vzor jako `MONTHLY_LIMITS` (Deno neumí importovat runar-config).
- **Affected doc(s):** RUNAR_BACKLOG.md (#4 odškrtnout po deployi).
- **Reality note:** OVĚŘENO lokálně — smoke 24/24 (⑳ mirror 6 spreadů == config, life_rune vyloučen = rituál), `node --check` všech souborů, per-path audit: **žádná poctivá cesta se nemění** (honest slug → stejná cena jako dnes; stale klient → fallback = dnešní chování; jen podvrhy dostanou 400/402). life_rune/founding = rituál → cenové bloky se přeskočí, `costFor` se nevolá. **Pending (owner):** deploy proxy + E2E na test-účtu (Yggdrasil odečte 5 & funguje, single 1) + volitelně token → curl podvrh (402). Pak zpřísnit na strict.
- **Reversibility:** easy (proxy redeploy předchozí; klient posílá slug navíc, který starý proxy ignoruje).

---

## 2026-08-03 — #4 VRÁCENO (spoof se jen přesunul z čísla na slug; navíc regrese + odhalen pre-existující CRITICAL)

- **Typ:** oprava předchozího záznamu (append-only) + revert + redeploy
- **Co se změnilo:** #4 (výše) VRÁCENO na pre-#4 (`git checkout 6217f2d --` proxy + app.js + reading.js + tree.js + verify_spread_prices.js; proxy redeploy). Adversariální re-audit (14 agentů, Workflow) našel, že #4 **neřeší podstatu**: server oceňuje podle slugu, ale obsah čtení (`system`+`prompt`) posílá KLIENT a server ho nikdy nekontroluje → klient pošle Yggdrasil prompt se `spread:'single'` a platí 1 místo 5. Spoof se jen přesunul z čísla `spread_cost` na slug. Navíc #4 PŘIDAL regresi: nový rune_seeker s nevyčerpaným `free_balance` + kredity dostal na spread **402 spread_needs_credits** místo zaplacení (klientský `shouldUseCredit()` je slepý na typ spreadu → posílá `use_credit:false` i na spread).
- **Odhalený pre-existující CRITICAL (NENÍ z #4, ale zůstal otevřený):** cena z klienta přes `Math.max(1, x)`, kde `x` může být nečíselné (`spread_cost:"constructor"` už před #4; po #4 navíc `spread:"constructor"` → `SPREAD_COSTS[key]` dědí z Object.prototype) → **NaN**. NaN poráží VŠECHNY kontroly (`0 < NaN`=false → přeskočí zůstatek; odečítací smyčka `for i<NaN` = 0 odečteno) → **neomezená čtení zdarma** pro přihlášeného rune_seekera z nulového zůstatku. Reálná expozice teď ~nula (žádní veřejní users, jen test-účet), ale je to landmine → BACKLOG.
- **Proč selhalo:** stejný kořen jako #2b — našel jsem „díru" (klient posílá cenu) a opravil TVAR (číslo→slug), aniž bych vyřešil PODSTATU (server nezná pravý spread, protože klient renderuje celý prompt). **Poučení:** metering nejde postavit na klientem deklarovaných metadatech, dokud prompt staví klient. Skutečný fix = server staví prompt ze strukturovaných vstupů (runy + typ spreadu), nebo se cena/limit přeruší na něčem, co server vlastní. To je **architektonické rozhodnutí → owner (§21)**, ne další rychlá záplata.
- **Affected doc(s):** RUNAR_BACKLOG.md (#4 znovu otevřeno + pre-existující CRITICAL NaN + „prompt není svázán s cenou").
- **Reality note:** OVĚŘENO NAŽIVO — anonym → 401 (pre-#4 auth drží), regrese 402 pryč. Pre-#4 = stejný underpay přes `spread_cost` jako předtím (nezhoršeno, nevyřešeno). `readings` SELECT-only (samostatný fix) drží. Audit report: `tasks/wqxu3uuar.output` (9 confirmed, 0 uncertain).
- **Reversibility:** n/a (návrat do funkčního known-good).

---

## 2026-08-03 — Reading-UI regrese z Tree/Norns founding: 3 opravy + Norns dual-role

- **Typ:** bugfix (regrese) + vyjasnění Norns dual-role
- **Co se změnilo:** Tři regrese, co přinesla práce na founding ritualu (Norns) + chybějící full-path wiring (§13):
  1. **Redeem nepřekreslil pilulky** — `redeemCode()` (runar-auth.js) volal jen `updateAuthUI()`; area/seeking pilulky (tier-lock přes `_isRSnoCredits`) se refreshovaly jen v `updateUIText`/`fetchUserProfile`. Po dobití kreditu zůstaly zamčené. Fix: redeem po `updateAuthUI()` volá `buildPills()` + `_updateAreaSeekLabels()`.
  2. **Norns skrytý jako normální spread** — `_syncNornsGate()` (runar-reading.js) skrýval `mode-btn-norns`, dokud uživatel neměl životní runu (`_lifeRuneText`). To zaměnilo **normální placený Norns spread (2 kredity)** s **founding ritualem**. Fix: `var has = !!currentUser` → Norns viditelný pro každého přihlášeného. Founding se rozlišuje `_foundingPending` (ne viditelností tlačítka), takže free founding drží.
  3. **Setup formulář se vracel přes rozdělané čtení** — `_syncFoundingLock()` při `lock=false` bezpodmínečně ukázal `reader-setup`; běží i z async `fetchUserProfile` ~1-2s po startu čtení → překryl rozdělané čtení. Fix: v else-větvi ukázat setup jen když neběží čtení (`reader-rune-card`/`reader-output` skryté).
- **Norns dual-role (vyjasnění):** Norns je SOUČASNĚ (a) normální placený 3-rune spread (2 kredity, `SPREAD_COSTS.norns`) pro každého přihlášeného, a (b) zakládací ritual stromu (zdarma). Rozlišuje je `_foundingPending` + server přes `mode='founding'`. NENÍ to „jen founding".
- **Affected doc(s):** — (čísla/labely beze změny; jen chování UI).
- **Reality note:** smoke 24/24, node --check OK. **Owner ověří naživo** (přihlášený klient, Code nevidí): po redeem se pilulky odemknou · Norns je v selektoru (5 tlačítek) · setup nepřeskočí přes čtení · founding Norns (z tree tabu) je pořád zdarma. Bug 5 (Ask v Yggdrasilu) NEřešen — čeká na vyjasnění (admin vs rune_seeker; Ask je premium/admin-only).
- **Reversibility:** easy (3 malé UI patche).

---

## 2026-08-04 — Living-tree vizuál viditelný i pro TESTERY (is_tester), ne jen adminy

- **Typ:** beta access change (CODE-tune sáhl do CODE-tree domény — flag)
- **Co se změnilo:** `renderLivingTree` gate (runar-tree.js:246) rozšířen z `isAdmin` na `isAdmin || is_tester`. Owner (rune_seeker) potřebuje vidět strom při testování **jako rune_seeker, bez admin práv**. Tester (`is_tester=true`) teď strom vidí; normální rune_seeker pořád ne (beta drží). Voice/Ask/nic jiného se nemění — `is_tester` ovlivňuje JEN viditelnost stromu.
- **Proč:** test rune_seeker cesty vyžaduje vidět strom bez toho stát se adminem (admin = premium + všechna práva → nečistý test).
- **⚠️ CODE-tree:** `renderLivingTree` je váš vizuál. Tohle je JEN access gate (1 řádek), ne rendering. Beta stromu (root composer) řešíte vy — tester teď uvidí i rozdělaný stav.
- **⚠️ Caveat:** `is_tester` je client-writable (grant set) → gate je teoreticky self-grantable. Přijatelné pro vizuál (žádné peníze); kdyby na `is_tester` viselo něco placeného, přehodnotit.
- **Affected doc(s):** —
- **Reality note:** Owner nastaví `is_tester=true` na svém účtu (SQL). Voice je per reading-MODE (RUNAR_MODES.voice), NE per-tier/tester — is_tester hlas nedává. node --check OK.
- **Reversibility:** easy (vrátit gate na isAdmin).

---

## 2026-08-05 — Strom: kořeny přestavěny (branch engine, bezešvě do kmene) + zákon 25=25 [tree]

- **Typ:** tree engine (lab crown-composer; port do produkce zatím NE)
- **Zákon (KUKY):** **1 pramen = 1 runa = větev nahoru + kořen dolů (kořen = zrcadlo větve). Max 25 = 25 run.** Kořen kreslí TÝŽ branch-composer engine (`buildBranch`, per-runa `RUNE_TUNE`) co větev.
- **Co se udělalo (po krůčcích, každý ověřen):**
  - **Krok 1:** `trunkT.strandMax = maxMains` před `buildTrunk` → prameny = větve = max 25. Dřív trunk-engine `strandMax=28` dělal „random" prameny navíc (reinforce) → vypnuto. **Kmen mohutní tloušťkou (girth), ne přibýváním pramenů.**
  - **Krok 2:** kořen každého pramene = táž runa jako jeho větev (párově sedí).
  - **Krok 3:** kořen `buildBranch` vpleten do JEDNOHO tahu s kmenem (spine reversed + kmen = souvislá limba, bezešvě jako větev). Báze se hledá od VRCHU (backward scan) → vlastní kořen trunk-enginu se vždy vyloučí. Minor floatery (nedodělané prameny) se nekreslí.
- **Bug (dny hledaný):** kořen `buildBranch` s `dev:0` zplošťoval per-runa tvar na svislý prut (všechny kořeny stejné). Oprava: `dev` NEposílat.
- **⚠️ NIKDY neshlukovat větve.** Od začátku cíl = větve **rozprostřené** (emergence spread). Pokus o shlukování rodin/elementů „vedle sebe" (#1) rozbil korunu → **REVERTOVÁNO**. Neopakovat.
- **Affected doc(s):** RUNAR_TREE.md
- **Reality note:** ověřeno v labu (crown-composer.html; tvrdý reload — HTML se necachebustuje, jinak owner vidí starou verzi). Produkce (`build_tree_production.py`) zatím netknuta. Zbývá backlog: #3 curl per-runa · #4 twigs = kreslené runy elementu · #5 „proč" v inspekci · #6 port do produkce.
- **Reversibility:** lab, snadné.

---

## 2026-08-05 — Enforcement „piš průběžně": tree-guard hook pro VŠECHNY session [meta]

- **Typ:** proces / infrastruktura (Claude Code hooks, ne app kód)
- **Problém (KUKY):** „všechny session nakonec serou na vytvořená pravidla." Soft pravidlo „zapisuj průběžně" každá session dřív nebo později ignoruje → znalost se ztrácí při compactu.
- **Rozhodnutí:** udělat z pravidla KONTROLU (princip: co musí hlídat člověk, spadne na ownera → dej to do checku). Dva hooky v `C:\Users\zkuku\.claude\settings.json` volají `C:\Users\zkuku\.claude\tree-guard.sh`:
  - **SessionStart:** vloží do kontextu KAŽDÉ session nepřekročitelná pravidla (zákon stromu + „piš průběžně") a orazítkuje čas startu session.
  - **Stop:** když session sáhla TUTO session do TREE ENGINE (`build_*composer.py`, `build_tree_production.py`, `runar-branch/trunk/tree-prod.js` — hlas ani config se NEhlídají, mají domov jinde dle §20) a NEzapsala rozhodnutí do `RUNAR_DECISIONS.md` NEBO `RUNAR_TREE.md` → **jednou zablokuje stop**. Blok-once (sentinel) = žádná nekonečná smyčka.
  - **Rozsah zúžen 2026-08-07:** původně hlídal celé `v2/runar-*.js` → nutil CODE-tune duplikovat změnu hlasu i do DECISIONS (domov hlasu = EVAL_LOG) = porušení §20. Teď hlídá jen tree engine a přijme oba tree domovy.
- **Proč „změněno tuto session", ne git dirty:** pracovní strom je TRVALE špinavý necommitnutými lab soubory → `git status` je jako signál k ničemu. Signál = mtime souboru novější než session-start marker.
- **Stav:** skript napsán + logika ověřena (5/5 scénářů v sandboxu s řízenými mtime). Zapnutí = RUČNÍ (owner), protože zápis do `~/.claude/settings.json` je gated auto-mode klasifikátorem (správně — trvalá změna nastavení = rozhodnutí ownera).
- **Affected doc(s):** — (jen user-global infra mimo git)
- **Reality note:** vlastní fire hooku nejde ověřit v této session (fire mimo turn); logika ověřena sandboxem. Hook je user-global → platí pro všechny Rúnar session (Code i tune).
- **Reversibility:** snadné (smazat hooks blok ze settings.json + tree-guard.sh).

---

## 2026-08-04 — Tree-of-Life copy oblouk sladěn (pryč „first breath"; rodina kořen/vzpomenout)

- **Typ:** copy (harmonizace oblouku, KUKY vybral)
- **Co se změnilo:** `tree_rs_teaser` (translations.js) přepsán — **pryč „first breath"** (jen metafora, ne timestamp) i „Rúnar has seen it / it waits" (věštba). EN: „This rune is the root you grew from, carried since birth. Rúnar does not foretell it — he helps you remember it." IS napsán **vlastním obrazem** (rótin undir öllu sem þú ert · les enga framtíð úr henni · muna), ověřeno `is-vazba` + `is-grammar-qa` (0 flagů). `founding_story_text` zkrácen (smazána 1. věta o životní runě — uživatel ji právě dočetl, redundance).
- **Proč:** celý Tree-of-Life copy má jednu rodinu obrazů (**kořen/strom · vzpomenout, ne věštit**); teaser byl jediný, co se lámal. **Pravidlo pro budoucí copy:** nikdy „first breath" doslova · nikdy Muninn/interní bytosti · Rúnarův spořivý hlas, jeden obraz. Analýza celého oblouku: `tasks/wi34g1nmq.output`. → [[copy-always-in-runar-voice]]
- **Affected doc(s):** — (copy shipnuta zvlášť; konkrétní soubor viz tělo záznamu)
- **Reversibility:** easy.

---

## 2026-08-08 — Vlastní životní runa v single čtení se čte NORMÁLNĚ (pryč „významný okamžik")

- **Typ:** chování čtení (prompt), owner rozhodl variantu C
- **Co se změnilo:** `buildReadingPromptSingle` — při `drawn == life` (a) se **neposílá druhá kopie téže runy** jako `LIFE RUNE:` kontext (runa už je v `DRAWN RUNE:`), (b) **smazána hotová věta** „The drawn rune IS the life rune — X. This is rare… \"The trunk speaks of itself.\"" / IS „…\"Stofninn talar um sig sjálfan.\"" včetně mrtvé copy `lifeRuneNote` v obou `RP_SINGLE` packech (§22), (c) `_priorityContext` už nespouští **sama** životní runa, když byla tažena (jinak prompt odkazoval na čočku, svět i hledání, které tam nejsou).
- **Proč:** eval (self-reference probe, 25 run, v1.2 EN): **self-reference 24/25** — model tu citovanou větu opisoval doslova. **Je to stejná třída defektu jako „already/þegar"** (tag v1.2): pojmenovaná/ocitovaná fráze v promptu = vzor ke kopírování. Varianta C navíc sedí na už existující kánon (`_lensContext`, komentář ř. 555): *životní runa nemůže být zároveň čočka i předmět téhož čtení, proto ustupuje, když byla sama tažena* — `lifeRuneNote` šla proti tomu (dělala z runy předmět mluvící o sobě). Zamítnuto D (ponechat významnost přerámovaně) = riskovalo návrat „runy o sobě samé". Owner: „C".
- **Ověřeno (§18.3 + §19.1):** do `scripts/golden/golden_dump.js` přidán **trvalý fixture `single_selflife_*`** (drawn==life dosud nebyl pokryt). Golden diff: změněny **jen 2 selflife klíče, ostatních 14 builderů byte-identických** (nulová kolaterál). Seed-and-assert: runa už není 2×, citovaná věta pryč, `DRAWN` blok + gates + ending zůstaly; probe bez area/seeking → fantomová čočka pryč.
- **Zbytek (do dalšího commitu):** když area/seeking JSOU, `_priorityContext` pořád říká „let the life-rune lens recede", ačkoli čočka neexistuje — týká se i všech 4 spreadů (life ∈ tažené runy). Řeší commit se spready (D4).
- **Affected doc(s):** RUNAR_EVAL_LOG.md (naměřená čísla + tag v1.3)
- **Reversibility:** easy (revert commitu; `lifeRuneNote` je v gitu).

---

## 2026-08-08 — Životní runa se v čtení jmenuje JEDNOU a prompt nemluví o čočce, která tam není

- **Typ:** chování čtení (prompt) — 4 spready + single
- **Co se změnilo:** (a) **D4:** všechny 4 spready psaly `LífsRúna: X` do kontextu i tehdy, když ta runa byla mezi taženými — a tam ji position-blok jmenoval znovu. Teď se kontextový řádek pošle jen tehdy, když životní runa **skutečně dělá čočku** (nebyla tažena). (b) **Fantomová čočka:** `_priorityContext` říkal „nech životní-runovou čočku ustoupit" i v promptech, kde žádná čočka není. Klauzule je teď podmíněná (`lensOn`). (c) Pravidlo „byla životní runa tažena?" má **jedno místo** — `_lifeWasDrawn`, sdílí ho `_lensContext` i buildery (§18.1), aby si nikdy neodporovaly.
- **Proč:** táž třída defektu jako self-reference (v1.3): prompt upozorňuje model zpět na životní runu, i když má ustoupit. **Změřeno na golden fixtures: fantom byl ve 3 ze 4 případů** — včetně `single_noq`, tedy uživatele, který **životní runu vůbec nemá** (nezadal datum narození), a přesto se modelu říkalo, ať nechá „čočku" ustoupit. Handoff (CODE-reader) hlásil jen Kříž a jen D4; audit ukázal, že D4 je ve **všech 4** spreadech a fantom sahá i mimo ně.
- **Ověřeno (§18.3 + §19.1):** golden diff = změněno 12 klíčů (4 spready ×2 jazyky + `single_noq` + `single_selflife`); **kontrolní případ `single_*`, kde čočka legitimně existuje, zůstal byte-identický**. Seed-and-assert 14/14: fantom pryč ve všech třech bezčočkových případech, runa dál v position-bloku, tie-breaker nezmizel, u reálné čočky klauzule ZŮSTALA.
- **Nezměněno vědomě:** IS věta tie-breakeru se nepřepisovala — `E001` (nerozparsovatelná) má **i původní shipnutá verze**, takže tohle není regrese; přepis = vlastní tag + golden → `RUNAR_BACKLOG.md`.
- **Affected doc(s):** RUNAR_BACKLOG.md (E001 + rozdíl Kříže), RUNAR_EVAL_LOG.md (jede v tagu v1.3)
- **Reversibility:** easy (revert commitu).

---

## 2026-08-08 — Life-rune prompt: pryč dva stylové vzory, které porušovaly vlastní gate

- **Typ:** chování čtení (prompt) — životní runa, IS
- **Co se změnilo:** z `buildLifeRunePromptIS` smazán blok „Stíllíkan — læra af tóni, ekki nota beint" se dvěma vzorovými větami. `buildLifeRunePromptEN` žádný takový blok nemá → smazáním se navíc **srovnala asymetrie** mezi jazyky.
- **Proč (měřeno na reálném promptu, ne odhadem):** týž prompt obsahuje `_noColdRead` (dispečer ho přidává, `:757`) — a hned nad ním dva vzory, které ten zákaz **předvádějí porušený**: „…orkan sem er **þegar** á leið" (energie, která *už* je na cestě) a „**Rúnirnar sjá hvað þú ert að ganga í gegnum**" (runy vidí, čím procházíš = přímé tvrzení o vnitřku tazatele). Navíc byly uvozené jako „uč se z tónu" — **demonstrace je silnější instrukce než zákaz**. Táž třída defektu jako „already/þegar" (v1.2) a „the trunk speaks of itself" (v1.3): vzor v promptu se kopíruje. Ironií komentář o pár řádků výš (`:748`) sám říká, že životní runa je *„čtení nejvíc vystavené cold readingu"*.
- **Ověřeno (§18.3 + §19.1):** do golden harness přidány **4 nové klíče** (`liferune_*` + `liferune_prem_*`, IS+EN) — životní runa **nebyla vůbec pokrytá**, proto v ní defekt přežil. Golden diff: změněny **jen 2 IS klíče**, ostatních 18 builderů byte-identických. Obsah čtení (HLUTI 1+2), gate i zbytek pravidel zachovány.
- **Pozor na slepé počítání tokenů:** v promptu zbylo jedno „þegar" — ale je to **spojka „když"** („hvað var að gerast í landinu **þegar** Anna kom til sögunnar"), ne cold-readové „už". Jiný význam téhož slova → není to únik. → [[sanity-check-measurements]]
- **OPRAVA (týž den, měřeno):** původně tu stálo, že IS životní runa teď nemá žádný tónový vzor a Cowork by musel napsat náhradu. **Není to pravda — má čtyři.** Výklad životní runy posílá i **system prompt** (`runar-tree.js:613` → `buildSysPrompt`), a v něm je `VOICE_PROFILES.focused.is` se čtyřmi ověřenými vzorovými větami („Hvernig setning á að landa — fjórar ólíkar gerðir", v1.2a). Změřeno na sestaveném payloadu (IS 7 370 znaků): 4 vzory ✓ · no-cold-read ✓ · describe-rule ✓ · IS gramatický blok ✓ · smazané vadné vzory pryč ✓; proxy `baseSystem` pouze podává dál (dynamicContext vypnutý). **Smazané vzory tedy byly navíc i vadné — žádná náhradní copy se neobjednává.**
- **Dopad na čtení (změřeno, ne odhad):** v celé DB existují **2 výklady životní runy** (1 IS, 1 EN) — režim nemá provoz. Ten jediný IS vznikl ještě **se** vzory a **nežádnou jejich formulaci nezkopíroval** („Þú stendur" / „stendur á mörkum" / „Rúnirnar sjá" / „orkan sem er" = 0×); jeho 4× „þegar" jsou **všechna spojka „když"**, ne cold-readové „už". Odstranění tedy sundalo **riziko**, ne fungujucí věc. Limit poctivě: n=1 na jazyk → skutečná kontrola je další IS výklad. → [[measure-dont-eyeball]]
- **Affected doc(s):** RUNAR_EVAL_LOG.md
- **Reversibility:** easy (revert commitu).

---

## 2026-08-08 — Export reálných čtení k evalu jde MIMO repo (repo je veřejné)

- **Typ:** privacy / nástroj (Cowork si vyžádal feed testerských čtení; owner rozhodl umístění)
- **Co se změnilo:** nový `scripts/utils/export_readings.js` — jedna dávka = JSONL + `.meta.json` (system prompt, sha, verze 1×). Default cíl **`~/runar-eval/tester-<datum>.jsonl`**, tedy **mimo git**. Skript **odmítne zapsat kamkoli do repa** (i do podadresáře). Pseudonymní user-key (`md5(user_id)` zkrácené, stabilní napříč dávkami), `analytics_opt_out = true` se **neexportuje**, `question` se neexportuje (nikdo si ho nevyžádal — minimalizace).
- **Proč:** Cowork navrhl `docs/inbox/` s odkazem na „už ověřený mechanismus". **Ten precedens ale neplatí:** `probe-self-life.jsonl` byla **syntetická** data z `gen_batch` (vymyšlená „Anna"), zatímco `readings` je **osobní údaj** (RUNAR_PRIVACY.md). A **repo `Runar25/Runar-admin` je VEŘEJNÉ** (ověřeno přes GitHub API: `private:false`) → commit by znamenal zveřejnit cizí čtení i s `area`/`seeking` na internetu, proti privacy §4 (opt-out), §5 (nikdy osobní čtení mimo EU) a celé pseudonymizační bázi. Owner zvolil variantu „mimo repo"; Cowork si soubor vytáhne přes device_bash, smyčka zůstává stejná.
- **Odpovědi na Coworkovy otázky (změřeno na schématu, netvrzeno):** `angle_idx`/`angle` se u reálných čtení **nepersistují** — v `readings` takové sloupce nejsou → angle-korelace jde jen přes `gen_batch`. Stabilní user-key **ano** (`readings.user_id`), `is_tester` **ano** (`user_profiles`, join), `is_admin` v DB **není** (plyne z `ADMIN_EMAILS` v configu proti `auth.users.email`), samostatný sloupec `spread` **není** (odvozuje se z `rune_name`, jako to dělá strom).
- **Ověřeno (§19):** ostrý běh na produkční DB — 271 čtení / 3 uživatelé; ve výstupu **žádný UUID ani e-mail**; `runes[]`, spready i follow-up sedí. Pojistka proti zápisu do repa otestována (relativní cesta i podadresář → odmítnuto, exit 1). Chyba chycená sanity kontrolou: `const RUNES` ve vm kontextu **není** na sandbox objektu → `runes[]` vycházelo prázdné u 271/271; čte se teď zevnitř kontextu a skript při prázdné mapě glyfů rovnou umře. → [[sanity-check-measurements]]
- **Affected doc(s):** — (nástroj + tento záznam; pravidla ochrany osobních údajů se nemění, jen se dodržují)
- **Reversibility:** easy (skript smazat; nic se nepublikovalo).

---

## 2026-08-08 — Obraznost klíčovaná runou (v1.4): sezónu řeší VÝBĚR, ne další zákaz

- **Typ:** chování čtení (obraznost) — owner rozhodl osu i pravidlo pro spready
- **Co se změnilo:** vedle `SEASON_POOLS` (sezónní, 133 obrazů) přibyl `RUNE_IMAGES_IS` — **67 Coworkových obrazů klíčovaných RUNOU** (50 přírodních + 17 lidských/domácích, ty plní „víc domén" z v1.2b). Padne-li runa, která má vlastní obraz **vhodný do aktuální části roku**, použije se on; jinak jede sezónní pool jako dosud. Věta kolem obrazu je **doslova ta nasazená** — mění se jen obraz (§18.1, jedna formulace).
- **Proč tak, a ne jinak (KUKY 2026-08-08):** owner: *„spíš aby převládala sezóna … zákazy nejsou to, kterým směrem bychom měli jít."* Proto sezónnost **nehlídá nové pravidlo v promptu, ale výběr**: obraz smí soutěžit jen tehdy, když sedí do aktuální části roku, takže srpnový obraz se v lednu **vůbec nenabídne** a není o čem modelu psát zákaz. Coworkovy tagy `[bright]/[cold]/[any]` jsou proto čteny jako **sezónní vhodnost** (světlá půlka / tmavá půlka / celý rok), NE jako dnešní osa `bright/cold`, která znamená valenci runy — kdyby se to smíchalo, teplá runa v lednu by vytáhla letní obraz.
- **Spready:** obraz určuje **náhodně vylosovaná runa z tažených** (owner), ne první pozice — jinak by obraz systémově seděl jen k jednomu slotu výkladu.
- **Ověřeno (§18.3 + §19.1):** golden — změněno **8 IS builderů**, všech **12 ostatních (celé EN + obě life-rune) byte-identických**. Sezónní pravidlo protlačeno napříč buckety: Fehu v zimě nenabídne srpnové bobule · Hagalaz v létě nemá kandidáta → fallback · Sowilo v lednu → fallback · Hagalaz v zimě a Sowilo v létě kandidáty mají. IS všech 67 obrazů přes `is-grammar-qa`: 4 flagy = doložené false-pos (`móann`, `urðina`, `skíman`, `garnið`).
- **Jedna oprava obsahu (§19.2):** Ehwaz „Hestarnir tveir fylgja hvor öðrum upp á fjall." byl **E001** (nerozparsovatelný) → „**Hestarnir tveir fylgjast að upp fjallið.**" — parsuje čistě a `fylgjast að` je doložená kolokace, jejíž korpusový příklad (*„þau hafa fylgst að í gegnum mest allt lífið"*) nese přesně ten Ehwaz význam.
- **Vědomé omezení:** obrazy jsou **jen islandsky** — Cowork EN verze nedodal a CODE si obraznost nevymýšlí (§2 / [[copy-always-in-runar-voice]]). EN čtení proto zůstávají na sezónním poolu; efekt v1.4 se ukáže **jen v IS dávkách**. Pokrytí ~2–3 obrazy na runu (Coworkův vlastní cíl je 5–8) → u často opakované runy se bude opakovat; druhá dávka je vítaná.
- **Affected doc(s):** RUNAR_EVAL_LOG.md
- **Reversibility:** easy (revert commitu; sezónní pool zůstal nedotčený).
---

## 2026-08-09 — Úklid promptu: dvě duplicity a jeden rozpor ven (T1 + T3 z kritiky)

- **Typ:** chování čtení (prompt) — úklid, ne nová funkce
- **Proč teď:** KUKY 2026-08-09: *„nerad bych rozbíjel něco co funguje, ale chci se zaměřit na ty chyby které jsou viditelné, duplicity a čistotu… každou změnu musí být možné zvrátit."* Kritika z 2026-08-06 tyhle body označila jako **první v pořadí** (nejbezpečnější signál) a tři dny ležely.
- **Tři samostatné commity, aby šel každý vrátit zvlášť** (`git revert <hash>`):
  1. **T1a — „studená runa v létě" bylo na dvou místech.** Docházelo modelu v jednom čtení dvakrát: ve `VOICE_PROFILES.focused` (system prompt = slabá páka) a v `_seasonalImagery` (reading prompt = silná). Zůstala ta silná. Změřeno na sestaveném promptu: **2 → 1 výskyt**, EN i IS.
  2. **T1b — otázka tazatele stála v promptu doslova dvakrát.** Kontextová hlavička `QUESTION: "…"` a hned pod ní `qBranch` („Open with X answering: …"). `qBranch` ji nese sám → hlavička byla vždy nadbytečná; s ní odešlo i mrtvé pole `Q` z obou `RP_SINGLE` packů. **Jen single** — spready `qBranch` nemají (ověřeno).
  3. **T3 — úhel č. 8 „životní runa mluví první" vyřazen.** Byl vadný ve **dvou** režimech: když čočka je, přímo si odporují (*„mluv jí první"* × `_lensContext`: *„never name or explain it"*); když uživatel životní runu nemá, odkazoval na runu, která v promptu vůbec nestojí (fantom — táž třída jako fantomová čočka, opravená 2026-08-08). Pool 8 → 7 úhlů, oba jazyky. Důvod je zapsaný přímo u poolu, ať ho nikdo nevrátí bez kontextu.
- **Ověřeno (§18.3):** golden u každého kroku zvlášť. T1b: 6 single klíčů, **spready byte-identické**, otázka u spreadů zůstává. T3: 8 single klíčů (úhel jede jen u single), **spready + system prompt + life-rune identické**. Smoke 24/24 u všech tří.
- **Vedlejší nález — harness měl slepou skvrnu:** golden dumpoval jen reading buildery, takže změna voice profilu (system prompt) prošla jako „0 změn", přestože mění **každý** prompt. Doplněno `system_is`/`system_en` (22 klíčů). Bez toho by T1a nešlo poctivě ověřit.
- **Bez bumpu tagu:** jde o odstranění duplicity a rozporu, ne o novou páku; jede ve v1.4. Kdyby se ukázala regrese, `git revert` vrátí kterýkoli krok samostatně.
- **Affected doc(s):** RUNAR_EVAL_LOG.md
- **Reversibility:** easy — tři nezávislé commity, každý revertovatelný sám.

---

## 2026-08-09 — T4: vzhled Rúnara přestěhován do DESIGN, „posbírej kontext" ven z promptu

- **Typ:** systémový prompt — úklid pozůstatků z doby vzniku appky (KUKY: *„tyhle všechny věci jsou pozůstatky vzniku téhle appky, proto děláme úklid"*)
- **T4a — vzhled Rúnara PŘESUNUT, ne smazán.** Z `DEF_CHAR.identity` (EN i IS) odešel odstavec o zapletených vlasech, rouchu a obsidiánovém přívěsku. Byl to **popis postavy, kterou nikdo nikdy neuvidí** — výstup je text a hlas, model Rúnara nekreslí; jelo to do promptu každého čtení nadarmo. Vzhled je ale 📜 **kánon**, takže dostal domov v `RUNAR_DESIGN.md` → „Kdo je Rúnar / Jak vypadá", i s poznámkou proč se přestěhoval. Zůstává první odstavec identity — **kdo Rúnar je**.
- **T4b — PURPOSE „napřed posbírá kontext" VEN.** Věta *„Before giving a reading, he naturally gathers context: the person's name, date of birth, area of life…"* popisovala **konverzačního** Rúnara, který se doptává. Kontext ale sebral formulář a je **vložený v promptu** (`PERSON`, `LIFE RUNE`, `AREA`, `SEEKING`) — instrukce tedy zadávala hotovou věc a **sváděla model ptát se tazatele**, což jednorázové čtení dělat nesmí. Pozůstatek dřívějšího návrhu, kdy měl být Rúnar chat. Zůstává první věta — **k čemu tu je**.
- **Ověřeno (§18.3):** golden — změněny **jen `system_is`/`system_en`**, všechny reading buildery byte-identické. **EN 756 → 670 slov (−86), IS 883 → 806 (−77).** Kdo Rúnar je, k čemu tu je i celý blok zákazů (`never`) zůstaly. Bez bumpu tagu (úklid, ne páka); poctivě: system prompt je slabá páka → **čekej nulovou změnu kvality**, cena je přehlednost.
- **Pozn. k ověřitelnosti:** tohle by bez dnešního doplnění `system_*` do golden harnessu prošlo jako „0 změn" — harness dumpoval jen reading buildery.
- **Affected doc(s):** RUNAR_DESIGN.md (vzhled dostal domov), RUNAR_EVAL_LOG.md
- **Reversibility:** easy — `git revert` vrátí prompt i doc naráz.

---

## 2026-08-09 — `applyISCorrections` ODSTRANĚN: vypnutá funkce, kterou kód pořád volal na 5 místech

- **Typ:** úklid mrtvého kódu (bez změny chování)
- **Scope:** tune
- **Co se změnilo:** smazána funkce `applyISCorrections` (`v2/runar-character.js`), flag `CORRECTIONS_POSTPROCESS` (`v2/runar-config.js`) a **5 živých volání** — `v2/runar-gathering.js`, `v2/runar-reading.js` (3×, jedno z nich byla odpověď Ask Rúnar), `v2/runar-tree.js`. Volání nahrazeno přímým přiřazením.
- **Proč:** funkce byla vypnutá od 2026-07-10 (vracela vstup beze změny), ale volala se dál. Kód se tím dal číst za pravdu: `text = applyISCorrections(text, lang, corrections)` říká „tady se aplikují korekce" — a neaplikovaly se. Owner si toho všiml na Ask odpovědi a řekl „oprav to". Pravidlo „žádná 4. vrstva" tím nezaniká, jen se přestěhovalo tam, kam patří: **CLAUDE.md §2 je jeho jediný domov** (§20 — dosud žilo jako pravidlo + mrtvá funkce + flag + test, čtyři místa o jedné věci).
- **Ověřeno:** golden dump 22 klíčů **PŘED/PO = prázdný diff** (mrtvý kód → prompt se nezměnil, proto se NEbumpuje `RUNAR_PROMPT_VERSION`) · `node --check` na 6 souborech · smoke **24/24**. Kontrakt ⑥ (`golden_contracts.js`) dál testuje **živou** cestu (DB řádek → `normalizeCorrections` → `getCorrPrompt` → replacement přežil do promptu, žádné „undefined"); zmizela jen assertion, že vypnutý post-processor je no-op.
- **Vedlejší nález (opraveno tady):** `check-docs.py` lintoval i `_cowork_snap/` — gitignored snapshot repa, který se přepíše při dalším snapu, takže „oprava" v něm nemá kde přežít. Přidán do `SKIP_DIRS`. Ověřeno protipříkladem (podstrčený mrtvý pojem linter dál chytí — nezhasl tím, že mu ubyla plocha).
- **Affected doc(s):** `CLAUDE.md` (§2 + seznam souborů + §19.1), `RUNAR_DESIGN.md`, `RUNAR_SEGMENTATION_SPEC.md`, `memory/working-style.md`
- **Reversibility:** easy — jeden `git revert`; chování se nemění, takže revert je bez rizika.

---

## 2026-08-09 — Ask Rúnar = POUZE Premium, a server to teď hlídá (dosud jen klient)

- **Typ:** rozhodnutí (ruší návrh z 08-06) + bezpečnostní oprava
- **Scope:** tune
- **Rozhodnutí ownera:** *„rune seeker by vůbec neměl mít přístup k ASK Rúnar. To má jen Premium."* Ruší návrh z 2026-08-06 (Ask jako **teaser** pro rune_seeker + standard: vidět, ale nemít). Teaser se nestaví — položka v `RUNAR_BACKLOG.md` uzavřena jako ZRUŠENO.
- **Co se našlo při ověřování:** `TIERS.*.ask` bylo nastavené správně (jen `premium: true`), ale **gate byl pouze na klientovi** (`canAsk`, `v2/runar-reading.js`). `supabase/functions/claude-proxy/index.ts` se na tier u `mode:'ask'` **neptal vůbec**. Dopad: (a) **standard** dostal follow-up **zdarma** — `legitAsk` ho dělá cap-exempt a odečtová větev pro `rune_seeker` na něj nesedí, takže neproběhla žádná kontrola ani odpočet; (b) **rune_seeker** ho dostal za kredit nebo za své jedno čtení zdarma — tier, který se k featuře nesmí dostat vůbec. Skrytý input není brána.
- **Co se změnilo:** do claude-proxy přidán entitlement gate `mode === "ask" && userTier !== "premium"` → **403**, umístěný **před** monthly cap i před odečtovou větev, tedy před jakýkoli náklad na Claude. Hláška je neutrální („The runes are quiet…"), stejná posture jako ostatní brány — neprozrazuje tier. Admin projde, protože `isAdmin` výš nastaví `userTier='premium'`.
- **Ověřeno / NEOVĚŘENO:** gate je čtený v kódu a umístěný před náklad; **běh proti nasazené funkci ověřený NENÍ** — edge funkci Code nedeployuje. → **Owner musí nasadit claude-proxy**, jinak platí dál jen klientský gate.
- **Zbývá (mimo tuto opravu):** `mode:'resave'` s `kind:'ask'` dovolí zapsat text do `follow_up` **vlastního** čtení bez volání Claude. Není to přístup k featuře (nic se negeneruje) ani cizí data, proto se neřeší tady — ale je to jediná další cesta, jak se v žurnálu objeví „ask".
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy — gate je jeden `if`; revert vrátí předchozí (děravý) stav.

---

## 2026-08-09 — Ask Rúnar: teaser pro ty, kdo na něj nedosáhnou (vidět ano, použít ne)

- **Typ:** feature + oprava mého špatného čtení předchozího rozhodnutí
- **Scope:** tune
- **Rozhodnutí ownera:** *„ASK RÚNAR má být teaser pro ty, co ho nemůžou použít!"* Spolu s 08-06 (*„měl by vidět tuhle featuru, ale neměl by mít přístup"*) a s dnešním *„rune seeker by vůbec neměl mít přístup"* to dává **jedno konzistentní zadání: vidět ano, použít ne.** Zápis z dnešního rána, který uzavřel teaser jako ZRUŠENÝ, byl **moje chyba** — owner rušil *přístup*, ne *viditelnost*. Opraveno v `RUNAR_BACKLOG.md`.
- **Co se změnilo:** přihlášený bez `TIERS[tier].ask` vidí blok Ask celý — štítek, pole i tlačítko — ale inertní (`disabled`), plus jedna řádka `ask_teaser`, která jmenuje tier **z configu** (§8/§15). Nový `_refreshAskTeaser()` v `v2/runar-reading.js`; `updateUIText()` (`v2/runar-app.js`) ho volá, protože řádka nese tier **i jazyk** a musí přežít přepnutí jazyka (§13/§14 — stavová logika zůstala v reading.js).
- **Co se vědomě NEudělalo:** (a) **žádné CTA tlačítko** — v readeru dnes neexistuje cíl, kam by upgrade přihlášeného vedl (`upgrade-gate-btn` nemá handler), takže by vedlo nikam; dodržen domácí tvar „zamčená featura = věta, ne tlačítko" (`gathering_upgrade`). (b) **visitor teaser nedostane** — jeho další krok je registrace, ne Premium; dvě různá CTA na jedné obrazovce si překážejí.
- **Vizuál se nevymýšlel:** ztlumení dělá už existující `.ask-btn:disabled` (opacity 0.35, not-allowed); přibyl jen protějšek `.ask-input:disabled` a `.ask-teaser` v registru `.ask-lbl`. → [[match-existing-visual-first]]
- **IS copy vymyšlena, ne přeložena (§2), a ověřena nástrojem:** GreynirCorrect 0 flagů. Původní znění stálo na vazbě `eiga ósagt`, kterou **nešlo doložit** → zahozena ve prospěch doložené `eiga eftir <þf>` (*„eiga eftir tvo kafla"*, Íslensk nútímamálsorðabók). Doložené místo chytrého.
- **Ověřeno v prohlížeči, ne odvozeno** (5 stavů: visitor / rune_seeker EN+IS / standard / premium): blok skrytý jen visitorovi, teaser jen neoprávněným, premium beze změny. Obcházka klienta (`disabled` zrušen, `_askUsed` vynulován) → **0 volání proxy** u rune_seekera i standardu, **1 u premia** (kontrolní případ — bez něj by test nedokazoval nic). Dva falešné poplachy cestou: `opacity 0.35` u premia byl artefakt (bez kompozice snímků nedoběhne `transition`), a první běh testu neprokázal nic, protože `askRunar` padal dřív na prázdném textu čtení. → [[sanity-check-measurements]]
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy — `git revert`; server-side brána je nezávislá a zůstává i po revertu UI.

---

## 2026-08-09 — Úhly čtení [0] a [1] míří na PROJEV, ne na vlastnost runy (+ golden přestal být slepý)

- **Typ:** změna promptu (Cowork obsah) + oprava měřicího harnessu
- **Scope:** tune
- **Co se změnilo:** `READING_ANGLES` / `_IS` [0] a [1] (`v2/runar-utils.js`). Původní znění se ptalo na **vlastnost runy** („what it offers / demands") → model odpovídal definicí. Nové míří na **projev v životě leitanda**, stejně jako úhly, které definice nevyrábějí (land / body / timing). Obsah = Cowork handoff proti `9b54cf8` (ověřeno jako předek HEAD; na `runar-utils.js` od té doby nikdo nesáhl).
- **Dvě odchylky od doslovného znění handoffu, obě ověřené nástrojem:**
  - **EN[0]** — vypuštěno „already". Úhel by přímo zadával cold-read pohyb, proti kterému stojí `_noColdRead`, a nasazoval modelu přesně to slovo, které měříme (baseline EN 32 %). „already … right now" je navíc redundantní.
  - **IS[0]** — `liggur á` → `hvílir á`. `is-vazba.py` ukázal, že `liggja á` je obsazené idiomem naléhavosti: `<mér> liggur á` = „spěchám", `<henni> liggur **lífið á**` = „jde jí o život" — a Coworkova věta zněla *„hvar hann liggur … á lífi leitandans"*, tedy přesně do toho idiomu. `hvíla á` je doložené pro abstraktní tíhu spočívající na něčem (*„það hvílir bölvun á þessum stað"*). **BÍN + GreynirCorrect tohle chytit nemohou** — dávají tvar a gramatiku, ne vazbu; proto je `is-vazba.py` vrstva nad nimi (§2). → [[is-vazba-check]]
  - IS[1] beze změny; `biðja` + eignarfall potvrzeno, takže Coworkovo `hvers það biður` sedí.
- **Golden harness byl na tuhle změnu SLEPÝ** a je to opraveno: `Math.random` je v `scripts/golden/golden_dump.js` připnutá na 0.5, takže se vždy vybral úhel [3] — změna [0]/[1] by prošla jako „0 změn" (§19.2 tiché zelené). Přibyl klíč `angles_<lang>`, který dumpuje **celý pool**. Ověřeno přímým čtením poolu uvnitř vm kontextu (7 úhlů v obou jazycích, 0 duplicit, 0 zbytků „already"/„þegar"/„liggur á").
- **NEZMĚŘENO:** dopad na výstup (baseline: EN otevřeno definicí 28 %, IS 0 %) — vyžaduje probe dávku, tedy platný eval token. Metoda i baseline → `RUNAR_EVAL_LOG.md`.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy — čtyři řetězce v jednom poli; `git revert`.
---

## 2026-08-09 — [tree] Graduant může být pramen (verze B, přepínač) — ruší 2026-08-07

- **Typ:** intent + implementation (lab)
- **Co se změnilo:** 7. 8. jsme rozhodli, že *„zrcadlový podkořen se NETVOŘÍ — graduace je událost nad zemí"*. KUKY 9. 8.: 2./3. dominantní větev má být **robustnější, ideálně vlastní pramen až do kořene**. Postaveno jako **verze B za přepínačem `gradStrand` (výchozí 0 = dnešní stav)**, aby šlo obojí porovnat okem.
- **Proč:** graduant je runa jako každá jiná — dát jí pramen + kořen model **zpřesní** směrem k zákonu „1 pramen = 1 runa", ne rozvolní. KUKY: *„potřebuju to vidět"* → přepínač, ne výměna.
- **Zvolena varianta B (zůstává na rodiči), ne A (odejde z kmene):** A by z graduanta udělala 10./11. hlavní větev a zabila hierarchii „dominanta a její pobočka" (F2). B ji drží.
- **Affected doc(s):** RUNAR_TREE.md §5
- **Reality note:** `build_crown_composer.py` — `graduatesFor()` (jeden zdroj pravdy pro výběr graduantů) + `buildRootFor()` (jeden zdroj pravdy pro kořen, sdílí ho hlavní větev i graduant) + předpočet pramenů před `buildTrunk`. `runar-trunk.js` — tři **nepovinné** knoflíky `laneOrder` / `bornOrder` / `strandMin`; bez nich bit po bitu shodný výstup (5 733 bodů, 8 sad parametrů, rozdíl 0,000000 px). Ověřeno také: kořen po refaktoru do funkce bod po bodu stejný; spojka končí **přesně** v místě odlepení (0,0000 px); žádná runa nemá dva prameny; 19 ≤ 25. V prohlížeči na živém logu (2 290 čtení): prameny 9 → 19, kořeny 109 → 123, 0 chyb ve všech polohách posuvníků.
- **Dva nálezy modelu, které to odhalilo:** (1) táž runa graduuje na obou větvích téhož elementu → bez ošetření 27 pramenů u 25 run; (2) věk pramene se odvozuje z pořadí, takže pramen přidaný na konec má záporný věk a **vůbec nevznikne**.
- **Zálohováno:** `v2/tree-snapshots/crown-F10-pre-gradstrand-2026-08-09/` (builder je untracked — git by ho nevrátil).
- **Reversibility:** easy (přepínač na 0 = přesně dnešní stav; snapshot pro úplný návrat)

---

## 2026-08-10 — Čtení si nově pamatuje, co si vylosovalo (`readings.prompt_draws`)

- **Typ:** nové perzistované pole + SQL migrace (owner pouští)
- **Scope:** tune
- **Rozhodnutí ownera:** *„teď už budeme měřit jen na základě reálných čtení testerů."* Správný směr, ale narážel na tvrdé omezení: `readings` **nepersistovala ani jeden z pěti losů promptu**, takže u reálného čtení nešlo říct, kterým úhlem přišlo ani který obraz dostalo. Měřit z produkce by tím pádem odpovídalo na „jak čtení vypadají", ne na „která páka za to může". A zpětně to dodělat nejde — proto teď, ne až se ukáže, že to chybí.
- **Co se změnilo:** nový detektor `_promptDraws(prompt, lang)` v `v2/runar-utils.js` čte losy **zpětně z hotového promptu** (úhel · obraz · tvar konce · umístění jména). Klient je přikládá k journalu (`v2/runar-reading.js`, single i spread), proxy je ukládá do `readings.prompt_draws jsonb`, exportér je vydává jako `draws` a `measure_readings --balance` z nich staví rozložení.
- **Proč zpětné čtení a ne zápis z builderů:** builderů se to nedotkne, takže **výstup modelu je bit po bitu stejný** — golden dump PŘED/PO = prázdný diff. Jakákoli varianta se sáhnutím do builderů by musela projít §18.3 a nesla by riziko změny čtení kvůli měření.
- **Jeden detektor, ne dva (§20):** `gen_batch.js` měl vlastní `detectAngle`; nahrazen sdíleným `_promptDraws`. Dva detektory by se rozešly a probe dávka by měřila něco jiného než produkce.
- **Ověřeno proti nezávislé pravdě, ne odhadem:** detektor souhlasí s úhlem, který si `gen_batch` zapsal sám, na **50/50** promptech (EN i IS); obraz a konec nalezeny ve všech 50. Umístění jména: 60 promptů se skutečným jménem → všechny 4 varianty detekovány, „jméno vynecháno" ve 32/60 = 53 % (návrh říká ~55 %). Na `null`, `''`, čísle a objektu detektor **nevyhodí výjimku** — visí na cestě generování čtení, takže tam pád nesmí být. Čtecí cesta ověřena na obou tvarech dávky (produkční s `draws` bez promptu · probe s promptem) včetně řádků bez `draws`, které se hlásí jako nezapočítané, ne jako nula.
- **⚠️ POŘADÍ NASAZENÍ (jinak se čtení přestanou ukládat):** 1. owner pustí `sql/2026-08-10_readings_prompt_draws.sql` · 2. teprve pak `supabase functions deploy claude-proxy`. Klient smí `draws` posílat i dřív — proxy neznámé pole v journalu ignoruje. Do doby deploye se losy neukládají.
- **Rámec měření (KUKY tentýž den):** *„nejde nám o to zbavit se například `already` úplně. To byla chyba a nedorozumění. Chceme mít čtení vyvážená. Nejdeme hardcore zákaz na 0."* Losy jsou páky na **rozložení**, ne zákazy; `--balance` je proto vypisuje jako rozdělení a sám hlásí, když na možnost připadá méně než 5 pozorování.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy pro kód (`git revert`; prompt se nemění). Sloupec je aditivní a nullable — když se nechá, nikomu nevadí; zahozením se ztratí jen záznam losů.

---

## 2026-08-10 — Eval export: vždy vše, jeden přepisovaný soubor

- **Typ:** implementation (tooling konvence)
- **Scope:** tune
- **Co se změnilo:** `export_readings.js` default = VŽDY všechna čtení (kromě `analytics_opt_out`) do JEDNOHO fixního souboru `~/runar-eval/readings.jsonl` (+ `.meta.json`), který se při každém běhu PŘEPÍŠE. Zrušen datovaný `tester-<datum>.jsonl` i nepoužitý `stamp()`.
- **Proč:** KUKY 2026-08-10 — Cowork ať čte JEDNU stabilní cestu s aktuálním plným datasetem, ne aby honil datované soubory. Historie se neztrácí: každý řádek nese `ts` + `prompt_version`, kohorty se filtrují uvnitř souboru.
- **Affected doc(s):** `scripts/utils/export_readings.js`, tento záznam.
- **Reality note:** Mimo repo (PII, RUNAR_PRIVACY.md); Cowork čte přes device_bash. Spouštět z rootu repa (`node scripts/utils/export_readings.js`) — supabase CLI hledá `supabase/.temp` v cwd. Staré `~/runar-eval/tester-*.jsonl` jsou redundantní (obsah je v `readings.jsonl`), lze smazat.
- **Reversibility:** easy (vrátit datovaný default).

---

## 2026-08-10 — EN obrazy klíčované runou (v1.6): rune-keyed výběr běžel jen v islandštině

- **Typ:** oprava vady + obsah od Coworku (81 EN obrazů)
- **Scope:** tune
- **Co se našlo:** živé EN čtení Raidho — runy cesty — dostalo obraz *„sun on the green turf roof of an old farmhouse"*. Owner: *„mluví o cestě a skočí na střechu."* Nešlo o smůlu při losování: rune-keyed blok v `_seasonalImagery` byl uzavřený v `if (lang === 'is')`, takže **celá anglická větev** padala na `SEASON_POOLS`, které znají jen sezónu, ne runu. Od zavedení obrazů klíčovaných runou (v1.4) tedy EN nikdy ani jeden nedostalo.
- **Co se změnilo:** řádek pole se rozšířil na `[runa, tag, IS, EN]` a pole se přejmenovalo `RUNE_IMAGES_IS` → **`RUNE_IMAGES`**. Rune-keyed výběr platí pro oba jazyky; mění se jen **zdrojový sloupec**, výběr kandidátů (`_runeImageCandidates`), sezónní filtr i sáček proti opakování zůstávají beze změny. `RUNAR_PROMPT_VERSION` → **v1.6**.
- **Proč jeden zdroj a ne `RUNE_IMAGES_EN` vedle (§18):** dvě paralelní pole by se musela ručně držet ve stejném pořadí. Přesně z toho tvaru vznikl měsíc oprav u IS/EN builderů. Jeden řádek nese obě řeči, takže se nemají jak rozejít.
- **Ověřeno:**
  - **Opsání tabulky proti živému poolu: 81/81 trojic `runa|tag|IS` bajt po bajtu.** Coworkův handoff nesl IS sloupec vedle EN právě proto — je to kontrolní součet mého přepisu, ne dekorace. Kdyby seděla jen délka, o věrnosti EN sloupce by to neříkalo nic.
  - **Golden (§18.3): 8 změněných klíčů, všechny EN, IS 0.** Změna je jediná řádka — ta s obrazem. Přesně zamýšlený rozsah.
  - **Pokrytí 150/150** (25 run × 6 sezón): každá runa má kandidáta v každé sezóně, takže se na starý slepý `SEASON_POOLS` nespadne vůbec. Vada je zavřená celá, ne z části.
  - EN sanity dle handoffu: každý obraz končí tečkou, žádné islandské písmeno (= nic nepřeloženého), 0 duplicit, apostrofy přežily (§1).
- **NEZMĚŘENO:** jak to čtou lidé. Rune-fit EN scén je editorský soud Coworku, převzatý z už odsouhlasených IS scén — ukáže se až na živých čteních.
- **Affected doc(s):** mapa promptu (artifact, překreslena na v1.6 týmž tahem)
- **Reversibility:** easy — `git revert`; pole i logika jsou jedna změna.

---

## 2026-08-10 — Rúnaþula: mechanika pryč, ne jen vypnutá. A revize dvou spících pák

- **Typ:** úklid mrtvé větve + dopsání chybějícího záznamu
- **Scope:** tune
- **Zadání ownera:** *„udělej úklid. Zapiš proč vypnuté. Co mají vůbec za úkol dělat?"*

**Co ta větev dělala.** Do islandského promptu vkládala hotovou větu z `formula_is`
(`runar-runes.js`) — např. *„Raidho er rún leiðarinnar, hreyfingar og innri takts."* Měla to
být opora islandského tónu: doložená rúnaþula, kterou si Rúnar jednou vplete do čtení.
Anglický pack měl obal té věty taky, ale **data jsou jen islandská**, takže EN větev nemohla
vystřelit nikdy — byl to mrtvý obal od začátku.

- **Proč byla vypnutá (2026-08-09, měřeno):** byla to hotová **DEFINICE runy tři řádky nad
  zákazem definic** (`_describeRule`: „řekni co runa DĚLÁ, nikdy co ZNAMENÁ"), a model ji
  **opisoval doslova — 2/2 v ostrých IS čteních**. Tatáž třída jako „trunk speaks of itself"
  (15/25): citovaná věta se přenáší, ať v ní stojí cokoli.
- **Proč se teď maže, a nenechává vypnutá:** byla ponechána jako cesta zpět („`useFormula`
  na true"). Přesně tenhle tvar tento týden dojel `CORRECTIONS_POSTPROCESS` — měsíc vypnutý
  flag, jehož funkce se pořád volala na pěti místech, takže kód tvrdil něco, co nedělal.
  **Cesta zpět je `git revert`, ne vypnutá větev čekající v kódu.**
- **Co zůstává:** `formula_is` u všech 25 run zůstává jako lore. Není to jen archiv — čte ho
  `runar-yggdrasil.html`.
- **Chybějící záznam doplněn:** rozhodnutí z 08-09 mělo jen commit message, žádný datovaný
  zápis (§16). Proto je odůvodnění celé tady.
- **Ověřeno:** golden PŘED/PO = **prázdný diff** (větev nikdy nevystřelila, takže odstranění
  nemůže hnout výstupem) · 0 zbytků `useFormula`/`S.formula` v kódu · data 25/25 nedotčena.

**Revize druhé páky — a oprava mého tvrzení.** Navrhl jsem k úklidu i
`ENABLE_DYNAMIC_CONTEXT` (vrstvy A/B/C: paměť stromu, stav sezení, škála hlasu). **Byl to
špatný návrh.** Ten flag zetlelý není: má u sebe komentář, který říká co dělá, proč je vypnutý
(audit našel ~8 protichůdných tónových direktiv na placené čtení) i co ho vrátí, a
`RUNAR_BACKLOG.md` nese tytéž podmínky. Nechává se beze změny — a znovu se to sem **neopisuje**
(§20), domov je ten komentář a backlog.

**Rozdíl, který z toho plyne a stojí za pravidlo:** vypnutá páka je v pořádku, dokud u sebe
nese *co dělá · proč je vypnutá · co ji vrátí*. Chybí-li třetí bod, není to čekající páka, ale
odložené rozhodnutí — a to patří dodělat, ne skladovat. Rúnaþula třetí bod neměla.

- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy — `git revert`; výstup se nemění, takže revert je bez rizika.

---

## 2026-08-10 — `--without`: postavit čtení bez jednotlivých částí promptu (žebřík k holému promptu)

- **Typ:** nástroj (probe, mimo produkci)
- **Scope:** tune
- **Zadání ownera:** *„začínali jsme úplně s holým promptem a začali přidávat. Chtěl bych vidět, jestli některé věci nejsou zbytečné … postupně vypínat, až se dostat na raw prompt, a pak začít systematicky přidávat."*
- **Co vzniklo:** `gen_batch.js --without a,b,c` (a `--without all` · `--without list`) — 14 přepínačů pro části promptu: obraz · zákaz definic · cold-read · čočka · oblast · registr · záměr · konec · tie-breaker · ÁVARP · jméno · hlasový profil · úhel · délka. K tomu `scripts/utils/compare_readings.js A.jsonl B.jsonl`, které dvě dávky spáruje podle runy a vypíše čtení za sebou.
- **Proč mimo produkci:** přepínač jen přebije helper **v sandboxu** `gen_batch` (týž postup jako `--angle`). Produkční buildery se nemění — `git status v2/` po celé práci prázdný. Kdyby to byly flagy v `runar-character.js`, přibylo by 14 větví, které se musí udržovat a které podle historie tohohle repa zůstanou vypnuté a zetlí (dnes ráno kvůli tomu odešla rúnaþula).
- **Tvrdý důkaz místo důvěry:** u prvního čtení se postaví i **referenční** prompt s původními funkcemi a porovná se. Nezkrátilo-li vypnutí prompt, dávka se **nespustí**. Bez toho by přejmenovaný helper znamenal tiché „vypnuto" a celá dávka by pod hlavičkou „bez X" měřila plný prompt.
- **Kontrola sama musela být opravena dvakrát, a obojí je poučení:** (a) referenční prompt se stavěl **po** tom vypnutém, takže se mezi nimi znovu vylosoval úhel i obraz — rozdíl délky nebyl slot, ale šum; `--without domain` bez `--area` tak ukázal −1 znak a **prošel**, ačkoli ten slot v promptu vůbec nebyl. Obě stavby proto dostaly připnutou náhodu **i sáček obrazů**. (b) `voice` sedí v **systémovém** promptu, ne ve čtecím — porovnávalo se špatné plátno, takže by prošel vždycky. → [[sanity-check-measurements]]
- **Chování, které je záměr:** slot, který v daném čtení není (`domain` bez `--area`, `lens` bez `--life-rune`), kontrolu **neprojde** a řekne, který vstup chybí. „Vypnul jsem něco, co tam nebylo" je tiše falešný experiment.
- **Ověřeno na všech 14 přepínačích** (lifecycle, ne jen dobrý případ): každý zvlášť prokazatelně zkrátil svou plochu · `--without all` 3161 → 852 znaků čtecího promptu (zbývá kontext run, otevírací větev, závěr a JSON kontrakt) · systémový 5061 → 3390 · pět přepínačů závislých na vstupu správně zastaví, když vstup chybí. → [[guard-test-the-lifecycle]]
- **Metodická poznámka (proč přidávat, ne odebírat):** páky se překrývají — definice runy dnes potlačuje `_describeRule`, vypnutá rúnaþula i přepsané úhly. Vypínání po jedné z plného promptu proto každou ukáže jako „nic to nezměnilo" a svede k závěru, že jsou zbytečné všechny. Přidávání na holý základ tuhle past nemá.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy — dva soubory v `scripts/utils/`, produkce se nedotkly.

---

## 2026-08-12 — Životní runa = čočka JEN do závěru (v1.7). Polohou, ne dalším zákazem

- **Typ:** změna promptu (rozhodnutí owner + měřený důkaz Cowork; mechanika CODE)
- **Scope:** tune
- **Rozhodnutí ownera:** životní runa se smí projevit **jen v závěru** čtení (poslední věta / otázka). Nesmí barvit tělo. Dál se **nejmenuje**.
- **Důkaz (Cowork, v1.6 EN dávka):** ze 4 čtení `mine` s `life=Gebo` nesla **3 v těle** jazyk dávání/braní bez ohledu na taženou runu. Kontrola: 3 čtení `someone` / bez životní runy → **0×**. Není to náhoda textu — sedí to na životní runu.
- **Ověřeno, že důkaz platí i proti dnešku:** handoff byl psán proti `3bc3715`, HEAD je dál. Golden `3bc3715` vs HEAD = **bajt po bajtu shodný** (mezitím padl jen mrtvý kód rúnaþuly), takže se mezitím nic nezměnilo.

**Proč to prosakovalo (mechanika, ne náhoda).** Životní runa vstupovala **nahoře** v kontextovém bloku — u single dokonce i s klíčovými slovy, realmem a živly — a k tomu měla direktivu *„let it shape HOW you read X"*. Model to četl jako **profil uživatele** a barvil jím celé čtení. Tělo pak přestalo být o tažené runě, tedy o tom, co si člověk vytáhl.

**Mechanika opravy (volba CODE):** životní runa vstupuje do promptu už **jen na jednom místě** — `_lensContext` — a to **těsně před závěrečnou instrukcí**. Horní řádka zmizela ze **všech pěti** builderů. **Poloha JE ta páka:** co stojí nahoře, čte model jako rámec celého čtení. Zároveň zmizela **klíčová slova** životní runy (single je posílal, spready jen jméno) — právě ten seznam byl palivo. Vedlejší zisk: pět builderů má teď tentýž tvar (§18) místo dvou.

- **Nepřidal se žádný nový zákaz.** Stejná linie jako u sezónnosti („řeší to VÝBĚR, ne další zákaz") — prompt je přeplněný a další „nedělej" by ho jen protáhl.
- **`_priorityContext` záměrně beze změny:** jeho klauzule o ustupující čočce zůstává platná a měnit dvě věci naráz by rozmazalo měření (Cowork chce před/po na jedné páce). Kandidát na příště, kdyby se závěr začal přeplňovat.
- **IS znění vymyšleno, ne přeloženo (§2), a ověřeno nástrojem:** `móta` + þolfall · `sleppa` + þágufall · `fjalla um` + þolfall — vše doložené v Íslensk nútímamálsorðabók. GreynirCorrect 0 flagů (jediný `Z002` „po dvojtečce velké písmeno" vyřešen velkým `Láttu`, ne výjimkou).

**Golden odhalil slepý bod, který tu byl celou dobu.** První běh ohlásil jen **4 změněné klíče, všechny single** — přestože změna sáhla na pět builderů. Důvod: **žádný spread fixture čočku necvičil**, protože fixture má životní runu `Fehu`, která je zároveň v tažené sadě → `_lifeWasDrawn` → čočka vypnutá. Doplněn uživatel `u3` (životní runa mimo sadu) a čtyři fixtures `*_lens_*`. Po doplnění: **12 změněných klíčů z 32**, všechny nesou čočku, ostatní nedotčené. Bez toho by se spready ověřily jen okem (§19.2).

- **Smoke ⑧ correctly selhal** — hlídá, že kontrakt čočky dorazí do všech builderů, a znal staré znění. Naučen novému (kotví na `CLOSING LENS` / `LOKALINSA`); případ „životní runa byla sama tažena → čočka ustupuje" dál prochází.
- **NEZMĚŘENO:** jestli to prosakování opravdu ustalo. To měří Cowork na nové dávce (baseline v1.6: 3/4 bleed). ⚠️ Jejich vlastní výhrada platí: dosavadní důkaz stojí skoro jen na `Gebo`. Probe s vynucenými **různými** životními runami umí `gen_batch --life-rune <runa>`; tažená ≠ životní je nutná podmínka, jinak čočka ustoupí a neměří se nic.
- **Affected doc(s):** mapa promptu (artifact, překreslena na v1.7 týmž tahem)
- **Reversibility:** easy — `git revert`; jedna funkce a pět jednořádkových přesunů.

---

## 2026-08-12 — Dvergar: Rúnar o nich ví, ale mluví JEN na Ask Rúnar

- **Typ:** nová schopnost (úzká) + hranice vlastnictví
- **Scope:** tune
- **Rozhodnutí ownera:** *„Jen na Ask Rúnar — když se člověk zeptá, ví; jinak mlčí."* Odpověď **pár slov**. Každá postava má svůj text, kdo je zač a kde bydlí.
- **V jaké to bylo fázi:** lore **hotové od 2026-07-30** v `RUNAR_DESIGN.md` (katalog, 12 postav, kánon + umístění v Agndofě). Do promptu z toho nevedla **ani řádka** — v `v2/*.js` nebyl `dvergar` ani jednou. Chybělo tedy zapojení, ne obsah.
- **Co vzniklo:** `DVERGAR` v `v2/runar-character.js` (jedna věta na postavu, IS + EN) a `_dvergarContext(question, lang)`, volaný **výhradně** z `buildAskPrompt`. Bez shody v otázce vrací prázdno.
- **Proč NE do čtecího promptu:** katalog je víc textu než celý dnešní reading prompt, a ten se poslední dva dny naopak zkracoval. Design to sám říká: *„Znát ≠ odříkávat."* Blok navíc stojí **za** `S.rules` — ta zakazuje odpovídat na nesouvisející otázky, a tohle je vymezená výjimka, která ji musí přebít, ne naopak.
- **§20 hranice:** `RUNAR_DESIGN.md` vlastní **lore** (kánon, zdroje, umístění); kód vlastní **tu jednu větu, kterou Rúnar smí říct**. Do DESIGN doplněn ukazatel, aby další postava šla nejdřív tam a teprve pak do kódu.
- **Ověřeno:** golden **prázdný diff** (do čtení to nevede) · ask prompt bez dotazu na dvergar **bajt po bajtu stejný**, s dotazem +251 znaků · blok sedí na indexu 3, hned za pravidly · 10 stavů: běžná otázka → nic · obecné „dvergar/dwarves" → rod · konkrétní jméno → ta postava · **obojí v jedné otázce → konkrétní vyhrává** · IS i EN · prázdná a `null` otázka → nic.
- **IS ověřena nástrojem, ne odhadem:** první znění (fragmenty se středníkem) dalo **9/12 nerozparsovatelných (E001)**. Přepsáno na celé věty → 3/12. Protipříklad s běžnými jmény (Jón, Pétur, Ólafur) dal **0/3**, čímž je doloženo, že zbylé E001 působí **neznámá vlastní jména**, ne gramatika — táž třída jako runová jména, která nástroj už potlačuje. → [[sanity-check-measurements]]
- **`RUNAR_PROMPT_VERSION` se NEbumpuje:** čtecí prompt se nezměnil (golden to dokládá). Změna se týká jen follow-upu.
- **Zbývá:** druhá půlka katalogu („další známí dvergové" — Regin, Fáfnir, Otr, Litr, Völundr…) zatím výtah v kódu nemá; ti jsou v DESIGN jako výzkumná příloha. Doplnit, až budou potřeba.
- **Affected doc(s):** `RUNAR_DESIGN.md`
- **Reversibility:** easy — jedna tabulka, jedna funkce, jeden řádek v ask builderu.

---

## 2026-08-13 — Věta, která vkládá obraz, mu přestala říkat „přírodní" (v1.8)

- **Typ:** oprava promptu (nález z reálného čtení)
- **Scope:** tune
- **Jak se to našlo:** Sigrún dostala Mannaz a napsala *„I don't understand this."* Text zněl *„the old letter you **carved** as a child … reaching for a wider line"* — smíšená metafora, rukopis se píše, neryje. **Poprvé se nemuselo hádat:** `prompt_draws` u toho čtení říká `angle: 4`, `image: "You know your own handwriting though the years have changed it"`. Cowork úhel odvodil správně; databáze to potvrdila.
- **Co model udělal a proč:** dostal dvě instrukce, které nešly splnit obě — úhel 4 *„Lead with the land"* a jediný povolený obraz, kterým byl **rukopis**. Převedl tedy rukopis na něco, co se dá vyrýt. Neblouznil, poslechl.
- **⚠️ Příčina je ale širší než ten úhel.** **17 z 81 obrazů (21 %) nejsou krajiny** — chléb z pece, káva stydnoucí na stole, klíče od starého domu, první krok dítěte. A vkládací věta **všechny** prohlásila za přírodní: *„if a **nature image** appears in the reading, let it come from this Icelandic **season** — You know your own handwriting…"*. 52 slov, sedm zmínek o sezóně, a uprostřed rukopis. **Nesouvislé samo o sobě, u pětiny všech čtení, bez ohledu na úhel.** Kolize s úhlem 4 je ~3 % čtení; tahle vada 21 %.
- **A kód to už tři dny říkal sám:** komentář o pár řádek výš tvrdil *„Sezónnost hlídá VÝBĚR výš, ne další věta v promptu"* — a ta věta přednášela dál. Výběr je klíčovaný runou i sezónou, pokrytí 150/150; poučky o sněhu v létě hlídaly něco, co je vyřešené jinde.
- **Co se změnilo:** `IMAGE — if a picture arises in this reading, use this one: …` / `MYND — ef mynd birtist í lestrinum, notaðu þessa: …`. **Žádný nový zákaz** — „jeden obraz" říká `DEF_CHAR` pravidlo 4 a opakovat to tady by byl přesně ten §20 duplikát, který tohle způsobil.
- **§13 full-path:** na starou větu kotvily **dva** další nástroje — `_promptDraws` (záznam losů) a `injectedImage` v `measure_readings.js`. Obojí překotveno; měření navíc umí i **starý tvar**, aby dávky z doby před 08-13 zůstaly čitelné.
- **Ověřeno:** golden 24 z 32 klíčů, mění se **jediná řádka** · prompt **−29 slov** na čtení · detektor obrazu **8/8** po přeznačení (EN i IS, čtyři runy) · IS 0 flagů a 0 E001 (varianta s dvojtečkou v návěstí dávala E001, s em-dash prochází) · žádný z 81 obrazů neobsahuje `": "`, takže poslední dvojtečka je jednoznačná kotva.
- **NEZMĚŘENO / riziko:** zmizela věta „nikdy z jiné sezóny". Obraz, který si model vymyslí **navíc**, teď není sezónně hlídaný — mělo by to krýt pravidlo „jeden obraz", ale ověří to až dávka.
- **Zbývá (pořadí podle ownera):** 2. změřit · 3. teprve pak úhel 4. Kdyby se šlo obráceně, opraví se 3 % a nechá běžet 21 %.
- **Affected doc(s):** mapa promptu (artifact, překreslena na v1.8 týmž tahem)
- **Reversibility:** easy — jedna věta a dvě kotvy.

---

## 2026-08-13 — Popis světa se v promptu neopakuje (v1.9). První oprava nalezená nástrojem

- **Typ:** oprava promptu (nález `lint_prompts.js`)
- **Scope:** tune
- **Co se našlo:** popis světa (`rworld`) stál v promptu **dvakrát** — v hlavičce `DRAWN RUNE: … · World: the living moment, what is active now` a znovu v otevírací větvi `Open with X — let its quality (…) arrive through image`. Zdvojovalo se **jen u čtení bez otázky**: `qBranch` svět nenese, `noqBranch` ano.
- **Co se změnilo:** zůstává **hlavička** — tam ta data patří. Větev je instrukce a funguje i bez zopakovaného popisu. Parametr `world` se packu dál předává (nemění se signatura), ale s komentářem PROČ ho větev nevypisuje — jinak to za měsíc někdo „uklidí" a zdvojení se vrátí.
- **Ověřeno:** golden **2 změněné klíče, oba `single_noq_*`** — přesně čtení bez otázky, jak předpovězeno. Linter: duplicitní instrukce **3 → 1**, řádky s angličtinou v islandském promptu **50 → 25**.
- **Vedlejší zisk:** až Cowork dodá islandské popisy světů (`rworld` má dnes jen anglické, viz nález níž), překládat se bude **jedno místo místo dvou**.
- **Zbývá z těch tří nálezů:** (a) `rworld()` bez islandské větve — 25 řádek angličtiny v IS promptu, blokuje obsah od Coworku; (b) islandský pokyn o rodu dvakrát (`DEF_CHAR_IS.grammar` 5 + `ÁVARP`) — čeká na znění.
- **Poznámka k metodě:** tohle je **první oprava, kterou našel nástroj místo člověka**. Předchozí (věta o obrazu) se našla tak, že testerka narazila na 3 % kombinací a napsala „nerozumím". `lint_prompts.js` staví všech 2100 a stojí to nula.
- **Affected doc(s):** mapa promptu (artifact)
- **Reversibility:** easy — jeden řetězec ve dvou packech.

---

## 2026-08-13 — Islandský prompt je celý islandský (v2.0). Obě pravidla lintu na nule

- **Typ:** obsah od Coworku zadrátován + úklid duplicit
- **Scope:** tune
- **Co se změnilo:** (1) `rworld()` dostal **islandskou větev** — pět popisů světa; do dneška měl jen anglické, takže každý islandský prompt nesl anglickou frázi. (2) `DEF_CHAR_IS.grammar` **pravidlo 5 zkráceno** na ukazatel `Kynið er tilgreint í ÁVARP; fylgdu því.` — detail shody zůstává v `ÁVARP`, kde je konkrétní rod. (3) **Úhel [5]** přepsán: `name the movement this rune makes visible` → `how it wakes in their life, long before it has a name` (a IS obdoba). Ptal se NA RUNU, tedy táž vada, kterou Cowork odstranil z [0] a [1].
- **⚠️ Jedna změna proti Coworkovu znění, a je to přesně to, na co si vyžádali nástroj:** Jotunheim měl `streitist gegn formi`. **`streitast gegn` se doložit nepodařilo** — Íslensk nútímamálsorðabók zná `streitast við að` a `streitast á móti`, korpus dává *„hann streitist á móti"* a *„þau streittust á móti storminum"*. `gegn` tam není. Nasazeno `streitist á móti forminu` (doložená vazba, určitý tvar jako v korpusu). `liggja + undir` (Hel) a `fylgja` + þágufall (pravidlo 5) **potvrzeny**.
- **E001 u descriptorů se NEopravuje a je to správně:** Cowork argumentuje, že jde o **fráze**, ne mluvené věty — táž třída jako `k_is` klíčová slova, kde je fragment žádoucí tvar. Plná věta `X er Y` by navíc vrátila přesně ten opis, kvůli kterému 9. 8. odešla rúnaþula (model ji kopíroval 2/2). Argument přijat; flagy jsou Z002 + fragmentové E001, žádná reálná chyba.
- **Ověřeno — a poprvé jsou obě pravidla lintu na nule:**
  - `lint_prompts.js --lang`: **50 → 25 → 0** řádek s angličtinou v islandském promptu.
  - `lint_prompts.js --dup`: **3 → 1 → 0** duplicitních instrukcí.
  - golden 7 z 32 klíčů (IS čtení + pool úhlů + `system_is`), IS hlavička teď nese `Heimur: líðandi stund`.
- **Drženo záměrně:** úhel [4] (`Lead with the land`) má znění připravené, ale owner chce **nejdřív změřit v1.8**. Kdyby se šlo obráceně, opraví se 3 % a nechá běžet zbytek.
- **Affected doc(s):** mapa promptu (artifact)
- **Reversibility:** easy — tři řetězcové změny, `git revert`.

---

## 2026-08-14 — Doslovné opisování obrazu: příčina nalezena, částečně opraveno (v2.1)

- **Typ:** regrese + oprava + poučení
- **Scope:** tune
- **Jak se to našlo:** ablation Stage 0+1 (8 ramen × 10, IS). Nehledali jsme tohle — hledali jsme efekt jednotlivých pák. Vyskočilo to, protože jsem místo vlastního čítače sáhl po **zavedené metrice** (`measure_readings.js`).

**Regrese, kterou jsem způsobil.** Zkrácení vkládací věty (v1.8) skončilo u `notaðu þessa` = „POUŽIJ tenhle". Doslovné opsání celého obrazu: **12 % → 56 %**, nejdelší úsek 34 % → 73 % fráze, Fisher **p = 0,002**.

**Rozhodující test — příčina je islandsky specifická.** Táž krátká věta ve dvou jazycích:

| jazyk | dlouhá věta | krátká věta |
|---|---|---|
| EN | 0 % | **9 %** (v šumu) |
| IS | 12 % | **44 %** |

Angličtina se nehnula, islandština 3,5×. Nejde tedy o samotnou stavbu věty. Nejpravděpodobnější mechanismus: **islandský prompt jsme zkrátili mnohem víc než anglický** (rúnaþula, čočka, svět, pravidlo 5 — z ~484 na ~306 slov), takže jediná hotová islandská věta v něm má nesrovnatelně větší váhu; a model se v islandštině opře o předložený text ochotněji.

**Oprava (v2.1):** obraz dostal zpět **kontext za sebou** a rámec „odkud to je" místo „tady to máš" — `MYND — héðan kemur myndin í þessum lestri: ⟨X⟩. Láttu hana verða að þinni eigin sýn í textanum.` Bez zákazu: pojmenovat zakázanou věc ji přivolává (viz `_noColdRead`).

- **Výsledek, poctivě:** **44 % → 32 %**, nejdelší úsek 73 % → 52 %. Ale `p = 0,56` — samotné to zlepšení není odlišitelné od šumu, a proti baseline 12 % je 32 % pořád výš (p = 0,17). **Směr sedí, hotové to není.**
- **⚠️ Málem jsem ohlásil 0 %.** První měření po opravě dalo 0 % doslovného opsání a 92 % přepsáno. Byla to **vada mého extraktoru**: věta má nově ocas za obrazem, takže se do „fráze" počítal i on — délka vyšla **19 slov místo 10** a „celá fráze doslova" se stala nesplnitelnou. Chytil to sanity check na příliš čisté číslo, ne náhoda. Extraktor teď kotví na **oba** konce, v `_promptDraws` i v `measure_readings.js`. → [[sanity-check-measurements]]
- **Zbývá:** dostat 32 % zpět k baseline. Hypotéza k testu: vrátit islandskému promptu část hmoty, o kterou přišel — ne konkrétní zrušenou větu, ale jeho celkovou délku. Netestováno.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy.

---

## 2026-08-14 — Hmota islandského promptu NENÍ příčina doslovného opisování (vyvráceno měřením)

- **Typ:** measurement (uzavírá otevřenou hypotézu z předchozího záznamu téhož dne)
- **Scope:** reading / IS
- **Rozhodnutí:** hypotézu „vrátit IS promptu hmotu, o kterou přišel" **zavrhnout**. Nepřisypávat slova.
- **Test byl obrácený, a proto levný:** je-li viník délka, další **zkrácení musí opisování zvednout**.
  Zkrátil jsem čtecí prompt o 509 znaků (−17 %, `--without describe,coldread`, připnutá náhoda i sáček).
  Doslovné opsání celé fráze **32 % → 24 %** (25 IS run, táž metoda `scripts/utils/measure_readings.js`).
  **Fisher exact p = 0,75** — nehnulo se. Šlo to navíc opačným směrem, než hypotéza čekala.
- **Druhý, silnější důkaz proti:** EN a IS mají dnes skoro stejně dlouhý čtecí prompt (321 vs **307** slov)
  a **islandský systémový je delší** (781 vs 681) — přesto EN opisuje 9 % a IS 32 % (p = 0,07).
  Víc hmoty, víc opisování. Délka to nevysvětluje.
- **Co z toho plyne:** příčina je **jazyk, ne množství textu**. Model má islandštinu slabší; dostane-li
  hotovou, správně postavenou islandskou větu, sáhne po ní místo aby psal vlastní. Anglicky si troufne.
- **Další test (neproveden):** nedávat do IS **hotovou větu**, ale obraz jako pár rozpojených slov,
  ze kterých se věta složit musí. Mění to zdroj, ne délku.
- **Poctivá hranice nálezu:** `n = 25`. Vyloučeno, že 17% řez s tím měřitelně hne. NEtvrdí se,
  že délka je bez vlivu úplně.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** n/a (měření, žádná změna kódu).

---

## 2026-08-14 — Invarianty vytaženy z vyměnitelného bloku hlasu (příprava nálad, krok 1/2)

- **Typ:** architecture (prompt) + implementation
- **Scope:** reading / system prompt (EN + IS)
- **Rozhodnutí:** cokoli, co má o Rúnarovi platit **vždy**, nesmí bydlet v profilu hlasu.
  Profil je od nynějška **čistý tón** a nic víc.
- **Proč teď:** owner schválil víc nálad (`CLAUDE.md` §26 — návrat k opuštěnému jen očištěný).
  Nálada = **výměna celého bloku** `HOW YOU SPEAK`. Cokoli v tom bloku tedy s výměnou zmizí.
- ⭐ **Nález, který změnil plán (a bez kterého by vznikla tichá regrese v hlavním jazyce):**
  `DEF_CHAR_EN.grammar` a `DEF_CHAR_IS.grammar` **nejsou tentýž blok**. EN je „LANGUAGE & STYLE"
  a jeho bod 4 nesl „jeden obraz"; IS je „ÍSLENSK MÁLFRÆÐI", čistá mluvnice, a o obrazu
  **nemluví vůbec**. V islandštině tedy pravidlo „ein mynd" žilo **výhradně v profilu**.
  Cowork navrhl ten odstavec z profilu smazat (v EN správně, je to duplikát) — v IS by to
  pravidlo odstranilo z promptu úplně. Změřeno před zásahem: EN 2×, IS 1×.
- **Co se přestěhovalo do základu:** obraz (jeden, nesený, smyslový, vázaný na „kde ten člověk
  stojí teď", nikdy nereálné počasí) → nový blok `THE IMAGE` / `MYNDIN` v `grammar` obou jazyků ·
  tempo („nikdy uspěchaný, nikdy přehnaně dramatický") → `personality` · zákaz **rady** a
  **anti-ozvěna** → `never`.
- **`personality` musela ustoupit, jinak nálady nemohou fungovat:** držela konkrétní rejstřík
  („poetic, quietly playful, ancient fireside guide"). Tím a) duplikovala `lyrical`
  a b) přímo **odporovala** připravované `direct` („žádná ozdoba"). Rejstříkové kusy se
  **nemažou, stěhují** — patří do `lyrical`, kde jsou pravda. V základu zůstal klid, trpělivost,
  soucit bez sentimentu a „nepředvádí mystiku, prostě v ní bydlí".
- **Opraveno mimochodem (§22, tytéž věty):** `hugsaður` („myšlený") **není heslo** v Íslensk
  nútímamálsorðabók → `íhugull` · `egósdrifinn` (kalk) → `sjálfhverfur` ·
  „tilfinningalegur til yfirgangs" → `væminn`.
- **Ověřeno:** golden 32 klíčů → změněny **jen** `system_is` a `system_en` (čtecí buildery
  byte-identické) · „jeden obraz" po zásahu **1× v obou jazycích** · `lint_prompts --lang`
  i `--dup` přes 2100 kombinací čisté · IS věty přes `is-grammar-qa` (9 vět, 0 flagů,
  **žádné E001**) a `is-vazba` (`eiga rétt á sér` doložená kolokace, `skynrænn`/`væminn`/
  `íhugull` hesla). Délka systémového promptu EN 681 → 653, IS 781 → 770 slov.
- **NEuděláno vědomě:** `DEF_CHAR_IS.never` má 7 zákazů, EN 8 — islandštině chybí řádek
  o `embrace`/`empower`. `valdefla` **není heslo** v Íslensk nútímamálsorðabók a `faðma` je
  doslovné obejmutí, ne wellness klišé → které islandské klišé Rúnar neříká, je **obsahové
  rozhodnutí, ne překlad** (§23). Zapsáno do `RUNAR_BACKLOG.md`, nevymýšlím.
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy — `git revert` jednoho commitu, čtecí buildery se nedotkly.

---

## 2026-08-14 — Kánon „zrcadlo, ne orákulum" dostal PROČ (projekce/Barnum) + kotvení vzorců

- **Typ:** intent (owner směr, Cowork obsah) — 📜 vytvořený kánon
- **Scope:** design / tree / prompt
- **Rozhodnutí:** doplněn epistemický základ za „reflektuje, nepředpovídá". Přesnost čtení vzniká
  **projekcí posluchače** (Barnum/Forer, subjektivní validace, konfirmační zkreslení). To není
  slabina, ale základ poctivého pozicování; **zrcadlo vs orákulum** je jediná nesmlouvavá čára —
  a je nesmlouvavá *právě proto*, že je efekt reálný.
- **Gathering:** vzorce kotví na **VSTUPU** uživatele (area/intention v okně), ne na náhodných
  runách. Runy jsou šum; vstupy nejsou. OKNO, ne řetěz.
- **Co z toho CODE odvodil navíc (dopad na prompt, ne jen na doky):**
  1. Každá páka nese buď **materiál tazatele** (kotví projekci), nebo **materiál kostky**
     (rozbíjí zvyk). Obojí legitimní; zakázané je podat materiál kostky **jako vědění o tazateli**.
  2. Tím se mění status doslovného opisování vloženého obrazu: **není to stylistická vada, je to
     překlopení zrcadla v orákulum** — tazatel promítá do věty ze sáčku, kde nic není jeho.
     Podporuje to už zapsaný další test (rozbít hotovost vkládané věty, ne její délku).
  3. Úhly, které míří na život tazatele (`READING_ANGLES` [0], [1], [5], přepsané 2026-08-13),
     jsou pod kánonem správný směr **pro všechny** úhly; úhel mířící na abstraktní význam runy
     vyrábí Barnum bez kotvy.
  4. Nálady jsou materiál kostky **o doručení**, ne o obsahu → kánonu neodporují.
  5. ⚠️ **„Působí to čtení přesně?" není použitelná metrika** — Barnum zaručí vysoké skóre bez
     ohledu na kvalitu. Čtení se nesmí A/B-testovat na pocitu přesnosti.
- **Prompt se NEMĚNÍ (§21, doporučení proti Coworkovu volitelnému zostření):** direktiva tam už je
  **třikrát** — `never`: „never predicts fate or claims absolute truths" + „never makes fear-based
  predictions", `philosophy`: „The runes do not decide your path… they help you remember it."
  Čtvrtá věta o témže je přesně to ředění, které jsme dnes měřili a odstraňovali („jeden obraz"
  se říkal 4×). Kdyby se ukázalo, že model přesto předpovídá, opravuje se to **měřením a jednou
  větou navíc**, ne preventivně.
- **Affected doc(s):** `RUNAR_DESIGN.md`, `RUNAR_TREE.md`
- **Reversibility:** easy (jen doky, prompt nedotčen).

---

## 2026-08-14 — Nálady: specifikaci mění důkazy, ne dojem (rešerše + audit)

- **Typ:** measurement (rešerše) → mění zadání nálad z 2026-08-14 (Coworkův handoff)
- **Scope:** reading / voice
- **Výchozí otázka ownera:** *„o co se snažíme je aby to čtení uživatel pochopil… víc lidí
  bude chtít jednoduchost než metafory… ale chce to zjistit přesně."*
- **Rozhodnutí:**
  1. **Cíl = porozumění, ne pocit přesnosti.** Forer 4,3/5 — na pocit přesnosti se neptáme nikdy.
  2. **Páka NENÍ „snížit úroveň textu"** (RCT n = 2 235, p = 0,06, nula). Páka je **stavba věty**
     (vnořené vsuvky) a **známost obrazu**, ne délka slov.
  3. **Nikdy neoptimalizovat na Flesch/SMOG** — formule korelují jen s *vnímanou* obtížností.
  4. **Rozdělení nálad:** prostřední **default ~60 %** · prostá a přímá **~20 %, a povinný
     default pro anglickou verzi a krátká čtení** (nerodilý čtenář: 50,6 % / 4,2 %) ·
     poetická **~20 %, jako volba, ne default**.
  5. **Šest pravidel napříč všemi náladami:** žádné vnořené vsuvky · obrazy **známé**, ne
     originální · v EN „X je **jako** Y" místo „X **je** Y" · **jedna** nosná metafora **brzy**
     ve čtení (jen za těchhle podmínek r = 0,42 místo 0,07) · nálada se **nesmí** vázat na věk ·
     žádná optimalizace na readability formule.
  6. **Měření porozumění = distraktorový recall**, kde distraktory pocházejí z **jiného tahu run
     téže délky a téhož registru**. Klíč: distraktory musí být stejně barnumovsky přijatelné,
     takže projekce mezi nimi nedokáže vybrat — rozhodne jedině to, co si člověk pamatuje.
     Doplňkově volné vybavení skórované na propozice. **Do měření nesmí:** hvězdičky, „líbilo
     se ti to", dokončení čtení, čas na stránce.
- **Co to znamená pro naše čísla:** změřili jsme, že IS čtení má 13,6 slova na větu — tedy
  **věty už krátké jsou** a `direct` nemá být hlavně „kratší věty". Má být **méně úkolů na
  jedno čtení** (tři věty dnes nesou runu, úhel, obraz, čočku a zakončení).
- ⚠️ **Nález, který je proti kánonu nepříjemný:** ovladač Barnumu je **zdánlivá personalizace**
  (Snyder 1974: identický horoskop 3,24 → 4,38 jen podle deklarovaného odvození z data
  narození). Rúnarova životní runa, jméno a area/intention jsou personalizace **skutečná**
  (uživatel je sám zadal), ne předstíraná — čára tedy drží, ale je tenčí, než vypadala:
  **kotvit v tom, co člověk opravdu dal, ano; naznačovat, že z toho něco vyplývá, ne.**
- **Proces — sebekritika:** jeden ze sběračů postavil tři nálezy na fóru `forum.thetarot.guru`
  a označil je za „ověřeno přímým načtením". Audit je **vyřadil celé**: fórum patří webu, který
  výklady prodává, jeho nejaktivnějším účtem je vlastní promo bot (321 příspěvků, reklama
  1,1 s po založení vlákna), všechny citované účty vznikly týž den, a jeden uváděný poměr
  („5 kritiků proti 1 obhájci") byl při načtení vlákna **věcně nepravdivý** (21 příspěvků,
  0 obhájců). Ponaučení → `memory/loading-a-page-proves-existence-not-authenticity.md`.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`, `RUNAR_BACKLOG.md`
- **Reversibility:** n/a (rešerše + zadání; kód nedotčen).

---

## 2026-08-15 — Rúnarova identita a účel přeladěny z ezoterického rejstříku na věcný (EN i IS)

- **Typ:** intent (owner potvrdil 2026-08-15) · obsah Cowork · ověření a zapojení CODE
- **Scope:** prompt / design — 📜 vytvořený kánon
- **Co se změnilo:** `DEF_CHAR` identity + purpose v **obou** jazycích a jeden obraz navíc
  v `personality`. Esence je jedna, slova se skládají nativně (§2), takže EN není překlad IS.
  IS identity byla přeladěna už v `1c67c0a`; tenhle záznam dorovnává zbytek, aby si prompt
  neodporoval sám se sebou (identity věcná × purpose `dulspekiheim` = rozpor uvnitř jednoho promptu).
- **Proč:** islandská rešerše 2026-08-15 — slovník Árnastofnun zná u `rún` jen dva významy
  (rúnastafur, galdrastafur) a jedinou vazbu `rista rúnir`; runoložka Þórgunnur Snædal:
  runy byly `frá upphafi fyrst og fremst notaðar sem venjulegt letur`. Rejstřík `dulspekingur`
  nepoužívá ani mainstream, ani Ásatrúarfélagið, ani muzeum; islandské „esoterické" weby jsou
  **překlady z angličtiny** (dulheimar.is hostuje PDF © Theosophical University Press 1985).
  **Hranice nálezu:** říká, jak Islanďané mluví — netvrdí, že Rúnar musí. To rozhodl owner.
- ⭐ **Kotva rejstříku zůstává v obou jazycích a je to DEFINICE, ne ozdoba:**
  `He does not perform mysticism. He simply inhabits it.` / `Hann sýnir ekki dulspeki.
  Hann býr einfaldlega í henni.` Rúnar v tajemství **bydlí**, ale nepředvádí ho.
- **Měřeno (Risamálheild 2000–2021), ne odhadnuto:**
  - `rúnalestur` → `ráða í rúnir`: hotový řetězec je vzácnější (27 vs 9), **ale** vazba
    `ráða í` má **7 407** výskytů (`ráða drauma` 343, `ráða gátuna` 106). Frekvence hotového
    řetězce je u slovesné vazby špatné měřidlo (§27) — CODE tím vyvrátil vlastní výhradu.
  - `arinn` škrtnut: `arins` **47** výskytů a slovník nezná jediné ustálené spojení, proti
    `þolinmæði` **28 065**. Navíc to porušovalo vlastní pravidlo `THE IMAGE` v páteři
    (jeden obraz, nikdy dva vedle sebe) a podmínku, za které metafora vůbec funguje
    (r = 0,42 jen když je jedna, nerozvedená, se známým cílem, brzy v textu).
  - Ověřeno: GreynirCorrect 0 flagů, žádné E001; `kynnast` váže þágufall → `heimi` sedí.
- **§20:** princip „zrcadlo, ne orákulum" má **jeden domov** — `RUNAR_DESIGN.md`. Sekce
  z 2026-08-14 byla **sloučena**, ne zdvojena: *proč* (projekce → zrcadlo) a *jak zní*
  (*inhabits, not performs*) jsou dvě strany téhož principu v jedné sekci.
- **Affected doc(s):** `RUNAR_DESIGN.md`
- **Reversibility:** easy (`git revert` tohoto commitu; IS identity zvlášť v `1c67c0a`).

---

## 2026-08-15 — Norns: z „osy osudu“ na „osu stávání“ (řeší rozpor s vlastním zákazem)

- **Typ:** intent (owner potvrdil 2026-08-15) · obsah Cowork · ověření a zapojení CODE
- **Scope:** reading / norns — 📜 vytvořený kánon
- **Problém, který to řeší** (nalezeno §20 sweepem 2026-08-15): `RP_NORNS` mluvil o
  *„what must come, the debt of fate“* a *„skuldin við örlögin“*, zatímco `DEF_CHAR.never`
  říká *„never predicts fate“*. Rozpor byl ve **12 z 12** norns promptů.
- **Rozhodnutí:** Norny = tři časy **tvého vlákna** (co tě utvořilo → kde stojíš → kam se
  kloníš), ne dekret osudu. Přeladěna **jen Skuld** a rámec osy. `Urðr` a `Verðandi` beze
  změny — „minulost je pevná“ a „přítomnost je živá“ jsou poctivé věty, nic nepředpovídají.
- **Nové znění Skuld:** `hvert þráðurinn stefnir núna, ekki spá` / `where the thread is
  heading now, not foretold`. Beat dostal navíc explicitní *„Þú getur breytt stefnunni“* /
  *„you can walk differently“* — trajektorie, kterou lze změnit.
- **Ověřeno:** GreynirCorrect 0 flagů, žádné E001; `stefnir` 67 477, `þráðurinn` 8 878,
  `spámaður` 2 283 (Risamálheild 2000–2021). Golden: změnily se **jen** 4 klíče
  (`norns_is`, `norns_lens_is`, `norns_en`, `norns_lens_en`), staré znění nikde nezbylo.
- **Reality note:** `_intentionContext` skuld větev byla reframnutá už dřív („gæti orðið,
  ekki sem spádóm“); tohle dohání `RP_NORNS` na tentýž směr (§20 — dvě kopie téhož faktu
  se rozešly a opravila se jen jedna).
- ⚠️ **Zůstává nedořešené a hlásím to (§22):** Yggdrasil nese tutéž starou formulaci —
  v `v2/runar-character.js` tiers `SKULD (króna — það sem verður að vera)` a
  `SKULD (Crown — what must come)`. Nebylo to v handoffu a je to obsah, takže jsem nesáhl.
  Po téhle změně se Norns a Yggdrasil o Skuld **rozcházejí**.
- **Affected doc(s):** `RUNAR_DESIGN.md`
- **Reversibility:** easy (`git revert` tohoto commitu).

---

## 2026-08-15 — Sběr dat před vizualizací; Slack a shrine až podle provozu

- **Typ:** intent (owner potvrdil 2026-08-15: *„souhlasím s tím, co navrhuješ"*)
- **Scope:** provoz / měření
- **Rozhodnutí — pořadí, ne seznam:**
  1. **Úplnost dat má přednost před vizualizací.** Graf se dá postavit kterýkoli den
     zpětně; chybějící data se nedoplní nikdy. Proto `usage` (tokeny, cache, skutečný
     model) a `prompt_draws` u každého čtení, hned.
  2. **Slack až s testery** — a jen na *sledování*, ne na prohlížení. Jeho síla je, že
     přijde sám. Při 2,8 čtení/den by hlásil šum.
  3. **Záložka ve shrine až tehdy, když se začneme ptát „proč"** — u tří uživatelů není
     jasné, co chceme vidět, a postavené by se to za měsíc přestavělo. Grafy ve
     `stats.js --html` jsou proto inline SVG: dají se vzít do shrine 1:1.
- **Rozlišení, na kterém to stojí:** *sledovat* (roste to, kdy je špička) a *analyzovat*
  (proč je tohle čtení špatné, která páka za to může) jsou dvě různé úlohy. Grafy
  odpovídají jen na první; na „proč" odpovídají dotazy a `prompt_draws`.
- **Postaveno:** `scripts/utils/stats.js` (terminál · `--json` · `--html`) ·
  `sql/2026-08-15_readings_usage.sql` · zápis `usage` v `claude-proxy`.
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy.

---

## 2026-08-15 — Kontrola na ZDROJI nestačí: model otočil zápor v tvrzení

- **Typ:** measurement (nález z reálného čtení)
- **Scope:** reading / měření
- **Co se stalo:** hlídač `test_no_planted_bans.js` schválně **nehlásí zápory** — obraz
  „…you **do not** know what waits beyond it" tvrdí *nevědomost*, ne vědomost, a pravidlo
  `_noColdRead` zakazuje říkat, co člověk v sobě **zná**. To rozlišení je správné.
- **Jenže model ten zápor OTOČIL.** Čtení Blank (2026-08-15 22:14, EN) dostalo přesně ten
  obraz a napsalo: *„**You know** this stillness, the waiting before the shape appears."*
  Z popření vědomosti vzniklo tvrzení o vědomosti.
- **Co z toho plyne:** kontrola vkládaných obrazů je **nutná, ale nestačí**. Studené čtení
  umí vzniknout ve výstupu bez ohledu na vstup — a tam se dnes nikdo nedívá.
  Je to přesně `CLAUDE.md` §19.3: *kontrola běží na té ploše, kde bug žije.*
  Zdrojová kontrola hlídá pool; vada žije v textu čtení.
- **Zbývá:** přidat detekci studeného čtení do `scripts/utils/measure_readings.js`, tedy
  na **výstup**. Detektor už existuje a je odladěný (`test_no_planted_bans.js`: „you“ +
  až 3 slova + sloveso vnitřního stavu, se zápornou výjimkou) — stačí ho pustit na
  `reading_text` místo na pool. Zapsáno v `RUNAR_BACKLOG.md`.
- **Vedlejší, potvrzené:** proxy se zápisem `usage` **nebyla v době toho čtení nasazená**
  (`usage` je `null`), takže cena a cache u něj chybí. `prompt_draws` funguje.
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** n/a (nález).

---

## 2026-08-15 — „already": vada je NÁROK, ne slovo; jeden zesilovač odstraněn

- **Typ:** measurement (owner si vyžádal příčinu) · 226 reálných anglických čtení
- **Scope:** reading / hlas
- **Rozhodnutí:**
  1. **Slovo „already" se nezakazuje.** Ze 80 výskytů je 12 vada a 68 běžná angličtina.
     Owner 2026-08-15: *„already by nemělo být zakázané, jen by se nemělo nadužívat."*
  2. **Odstraněn jediný doložený zesilovač:** text volby `seeking=Confirmation` nesl slovo
     doslova (`has already decided` / `hefur **þegar** ákveðið sig`) a zvedal výskyt na
     **54 % proti 26 %**, Fisher **p = 0,0078**. Kontrola `Clarity` p = 0,11 → nic.
  3. **Zbylé výskyty zůstávají** — `_intentionContext`, Urður, kořeny Yggdrasilu mluví
     o minulosti, kde je to správná angličtina.
- ⭐ **Hlubší příčina se odstranit nedá, protože je to postava.** `philosophy`
  („they help you **remember** it") a `_noColdRead` („let the seeker **recognise**
  themselves") stojí v každém promptu a obě předpokládají předchozí znalost.
  Základ ~26 % z toho plyne a zmizel by jen s Rúnarem.
- **Co z toho plyne pro měření:** hlídat se má **nárok na vnitřní stav**, ne token —
  a na **výstupu**, ne ve zdroji (§19.3). Detektor `isColdRead` existuje a je odladěný.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy.

---

## 2026-08-15 — `docs/findings/` se nekontroluje na správnost (je to doslovný záznam)

- **Typ:** architektonické (jedna vrstva pravdy navíc) · vyvoláno tím, že push byl zablokovaný
- **Co se stalo:** `findings_to_backlog.js` vyrábí `docs/findings/<datum>-<runId>.md` — doslovný
  záznam toho, co nález našel. Nález o mrtvém pojmu ten pojem **musí pojmenovat**, jinak se nedá
  napsat. Kontroly ⑭ (`check-docs.py`), ⑯ (`verify_doc_links.js`) a ⑰ (`verify_doc_values.js`)
  ho ale četly jako živý doc a padaly na „Rune Keeper", „applyISCorrections", zkrácených cestách.
  **Generátor tak vyráběl soubory, které samy blokovaly push** — 13 commitů viselo lokálně.
- **Rozhodnutí:** `docs/findings/` se přidává mezi vyloučené složky ve všech třech kontrolách,
  vedle `docs/archive/` a `docs/inbox/`. Táž zásada: **záznam cituje, neopravuje.**
- ⭐ **Není to umlčení.** Ověřeno nasazenou sondou: mrtvý pojem v živém docu (`RUNAR_DESIGN.md`)
  se pořád chytá, tentýž pojem v `docs/findings/` se ignoruje. Kontrola nezeslábla, jen ví,
  na co se dívá (§19.3 — kontrola běží tam, kde bug žije).
- **Co se NEuvolnilo:** čtyři zkrácené cesty v `RUNAR_BACKLOG.md` (`character.js` místo
  `v2/runar-character.js`) se **opravily**, protože tam měla kontrola pravdu. Tři záměrné zmínky
  mrtvých pojmů dostaly značku s důvodem a datem (`verify_escape_marks.js` holé značky odmítá).
- **Affected doc(s):** `RUNAR_BACKLOG.md`
- **Reversibility:** easy.

---

## 2026-08-16 — Co se dnes změnilo v CHOVÁNÍ (a dva deploye, které git nevidí)

- **Typ:** architektonické + reading · **Scope:** prompt, proxy, reader UI
- ⚠️ **Proč jeden souhrnný záznam a ne sedm:** §16 output B se dnes neplnil vůbec — sedm commitů
  změnilo chování a tenhle doc nedostal ani řádek. Smoke na to **upozorňovalo** (nebloková
  připomínka `smoke.py:453`) a já ji přešel pokaždé. Dopisuje se zpětně; příště hned.

**① Prompt — co Rúnar dostává**
- `_domainContext`: z jedné věty se substitucí na **osm vlastních vět**, jednu na oblast.
  Důvod: jedna věta oblast do čtení neprosadila. Tvar kopíruje `_registerContext` (§18).
  Ponechána **záchytná síť** pro oblast mimo `AREAS` — bez ní by neznámá oblast tiše přišla
  o instrukci. Hlídá `scripts/utils/test_lever_maps.js` (mapa je indexovaná pořadím).
- **Sedm úhlů přepsáno**: úhel už nenese doménu, nese **vstup do obrazu**. Staré úhly
  pojmenovávaly oblast a model si z nich bral slovník celého čtení. Čísla → `RUNAR_EVAL_LOG.md`.
- Rúnarova věta („they help you remember it") **z promptu pryč do `RUNAR_DESIGN.md`**;
  prompt nese chování (`YOUR STANCE`). `_noColdRead` v1.3 — pryč s „recognise".
- `hs_ravenmoor` IS opraveno (kalk z EN, 0 výskytů v korpuse) + zapsáno do `check-is.py` (§9).

**② Proxy — DVA DEPLOYE, tohle git nevidí**
- **`usage` se vrací klientovi.** Bez toho dávka nevěděla, co stála, a nešlo říct, jestli sedá
  cache. Nasazeno.
- **Strop délky promptu 8 000 znaků** na `prompt` i `system`, **odmítne (400), neořízne** —
  oříznutí by useklo instrukci o JSON kontraktu a uživatel by zaplatil kredit za nesmysl.
  Kontrola je **před** odečtem. Nasazeno a ověřeno proti živé proxy.

**③ Reader UI**
- Statické **upozornění** („not professional advice" / „ekki faglega ráðgjöf") — mluví appka,
  ne Rúnar. Do dneška v aplikaci nebylo žádné.
- Otázka: **`maxlength=160`** (do teď žádný limit) + **navedení** nad polem
  („kde stojíš, ne co přijde").

**④ Nové kontroly ve smoke:** ㉕ pre-launch položky · ㉖ nahlášená fráze pořád ve zdroji.
Obě **nebloková** — a dnešek ukázal, že to má cenu: nebloková připomínka §16 se ignorovala
celý den. **Viditelnost sama nestačí; je to slabší nástroj, než jsem tvrdil.**

- **Affected doc(s):** `RUNAR_EVAL_LOG.md` (čísla), `RUNAR_BACKLOG.md` (otevřené), `RUNAR_DESIGN.md` (kánon)
- **Reversibility:** prompt easy (git) · deploye easy (redeploy) · UI easy.

---

## 2026-08-16 — Výzkum „Rúnar jako AI postava": kánon potvrzen, páka přesunuta

- **Typ:** measurement + kánon · **Scope:** hlas, poctivost · **Zdroj:** Cowork (výzkum), CODE (ověření)
- **Co se změnilo:** Kánon zrcadla se **nemění, potvrzuje se** a dostává mechanismus (Hymanovo
  „čtení tvoří klient"; statické vs dynamické čtení) → `RUNAR_DESIGN.md`. **Jedno rozšíření:**
  zákaz se posouvá z *„netvrdím"* na *„ani nenaznačuju, že vím víc"* (portentózní tón).
- ⭐ **Přesun páky:** nejvyšší páka na poctivost **není víc zákazů**, ale aby vstup tazatele
  reálně tvaroval výstup. Měření téhož dne ukazuje, že kotva prakticky nedrží → čtení je spíš
  statické, a statické = Barnum.
- ⚠️ **CAVEAT, který se nesmí ztratit:** Forerova data (4,26/5 za **generický** popis) říkají,
  že lidem se generická rezonance **líbí**. Co-Star svou ostrost po odporu **změkčil**.
  **Poctivé austerní zrcadlo může být horší PRODUKT, i když je to lepší princip.** U testerů
  se proto musí měřit i **spokojenost a návratnost**, ne jen poctivost. Nerozhodovat od stolu.
- **Affected doc(s):** `RUNAR_DESIGN.md` (evidence base), `RUNAR_EVAL_LOG.md` (kde se to láme),
  `RUNAR_BACKLOG.md` (sondy P1–P5 + copy fix)
- **Reversibility:** n/a (výzkum a zápis), copy fix easy.

---

## 2026-08-16 — Registr `direct` přidán; produkční profil modeloval to, co prompt zakazuje

- **Typ:** hlas + kontrola · **Scope:** `VOICE_PROFILES`, hlídače · **Zdroj:** KUKY („dodělej direct")
- **Co se změnilo:**
  1. **`focused` (produkční) měl ve svém čtvrtém vzoru studené čtení** v obou jazycích
     (`"You know this shore…"` / `"Þú þekkir þessa fjöru…"`). `_noColdRead` to o pár řádků
     dál zakazuje. Opraveno; tvar vzoru (druhá osoba, holá staahaefing) zachován, věta nově
     tvrdí čtenářovo **místo v obraze**, ne jeho nitro.
  2. **Nový registr `direct`** (EN+IS). ⚠️ **Přímost je v jazyce, ne v postoji** — zákaz podat
     závěr, říct krok a tvrdit nitro drží dál `philosophy` / `_spine` / `_noColdRead`.
  3. `gen_batch --voice <klíč>` — bez toho se registry nedaly porovnat. Neznámý klíč **spadne**:
     `_getVoiceProfile` na něj vrací `''` a celá sekce HOW YOU SPEAK by z promptu zmizela
     (ověřeno: prompt o 938 znaků kratší) — překlep by byl k nerozeznání od „ten registr nic nedělá".
  4. `test_no_planted_bans.js` skenuje **VOICE_PROFILES** a má **islandskou větev**.
- ⭐ **Poučení, které platí šířeji: vzor v promptu přebije zákaz v promptu.** Zákaz je abstraktní,
  vzor konkrétní a model napodobuje. Zakázané chování proto nesmí být v příkladech — a musí to
  hlídat stroj, protože pozornost to nechytila (profil to modeloval, aniž si toho kdokoli všiml).
- ⚠️ **Netvrdí se, že `direct` je lepší.** `ACTIVE_VOICE_PROFILE` zůstává `focused`. Který registr
  sedne, má ukázat srovnání s testery.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md` (měření + opravená čísla), `RUNAR_BACKLOG.md`
  (parkovaný úkol registrů uzavřen)
- **Reversibility:** easy (git; profil se přepíná jedním klíčem).

---

## 2026-08-16 — Tři měřidla lhala stejnou chybou; islandská čísla z dneška přeměřena

- **Typ:** oprava nástrojů · **Scope:** `measure_readings.js`, `test_no_planted_bans.js`, `is-vazba.py`
- **Co se změnilo:** JS `` je definovaná na `[A-Za-z0-9_]`, takže mezi mezerou a `þ` **hranice
  slova není**. Na třech místech to dělalo tichou chybu: mrtvá větev v detektoru, falešný zápor
  (`ekki` sedne uvnitř `þekki`) a EN-only hlídač, který islandský sloupec nekontroloval vůbec.
  Čtvrtá, opačná chyba: `finnur` = i **najít**, nadhodnocovalo.
  **Platná islandská čísla: produkce 18 %, čerstvá dávka 2 %** (dřívější hodnoty z dneška neplatí).
- ⭐ **`is-vazba.py --freq` vracelo 0 místo skutečné četnosti** — ngram API bere nejvýš 10 termů
  a zbytek tiše zahodí. To není chybějící doklad, ale **falešný důkaz proti**: `svignar undan`
  hlásilo 0, ve skutečnosti 94 — a je v produkčním promptu. Nástroj teď dávkuje, páruje jménem
  (odpověď chodí v jiném pořadí!) a nezodpovězenou frázi hlásí, nikdy netiskne 0.
- ⭐ **Pravidlo, které z toho plyne:** sonda musí cvičit **každou větev pozitivně**. Selftest
  procházel, protože žádná z šesti sond neprošla rozbitou větví kladně — testoval jen ty větve,
  kterým jsem věřil. Souvisí: [[guard-test-the-lifecycle]], [[sanity-check-measurements]].
- ⚠️ **Hranice `is-grammar-qa`:** na instrukčním textu dělá E001 rozkazovací způsob a bezslovesný
  výčet (nedotčený `lyrical` má 3×). Nástroj je stavěný na generovaná čtení; na promptu se jeho
  E001 nedá číst jako vada (§19.3).
- **Affected doc(s):** `RUNAR_EVAL_LOG.md`
- **Reversibility:** easy (git).

---

## 2026-08-16 — Archiv generovaných čtení: repo teď stačí, před spuštěním se to musí vyřešit

- **Typ:** data / timing · **Scope:** eval data · **Zdroj:** KUKY přímo v chatu
- **Rozhodnutí (KUKY):** *„teď je repo v pohodě, jelikož není produkce. Až bude appka
  v produkci, tak se to musí vyřešit."* Generovaná čtení (syntetická, jméno „Anna",
  `source: generated`) tedy zatím **nepotřebují jiný domov**; otázka umístění se otevře
  **před spuštěním**, ne dřív.
- ⚠️ **Nemění rozhodnutí 2026-08-08.** To se týká **živých** čtení a je to **privacy, ne
  časování**: `readings` jsou osobní údaj, repo je veřejné, a proto zůstávají v
  `~/runar-eval/` **bez ohledu na to, jestli je produkce**. `export_readings.js` odmítá
  zapsat kamkoli do repa a to se nemění.
- **Stav dnes:** `archive_batches.js` drží **629 generovaných** čtení ve 22 dávkách a
  odděleně **301 živých**. Původ je značený trojmo (pole `source` · prefix `gen-`/`prod-`
  · manifest). Archiv je **gitignorovaný** (`eval_out/archive`) — žije na jednom disku.
- ⚠️ **OPRAVA VLASTNÍ VÝHRADY (v tomtéž záznamu, ať ji nikdo nepřebere):** napsal jsem, že
  archiv nese celý sestavený prompt a je proto svázaný s položkou „prompt je veřejný".
  **Není to pravda a bylo to zapsané dřív než já:** `archive_batches.js` `prompt`
  **zahazuje** — je rekonstruovatelný z gitu podle `prompt_sha` a `draws` (§20, backlog
  „Kam trvale s generovanými dávkami"). Ta dvě rozhodnutí spolu tedy **nesouvisejí**;
  archiv obsahuje jen výstupy a jejich losy.
- **Affected doc(s):** `RUNAR_BACKLOG.md` (položka před spuštěním)
- **Reversibility:** easy (dokud se nic necommitne, není co vracet).

---

## 2026-08-17 — Prompt: `journey` byl zakázaný dvakrát a pokaždé jinak · kotva rejstříku do páteře

- **Typ:** chování čtení (prompt) · **Scope:** `DEF_CHAR`, `_spine` · **Zdroj:** audit promptu blok po bloku
- **Jak to vzniklo:** owner chtěl projít systémový prompt **od první instrukce**, ne lovit
  jednotlivosti uvnitř. Systémový prompt = **13 bloků, 669 slov**. Tyhle dva nálezy jsou z bloků
  [8]/[11] a [4].

**1. `journey` — rozpor uvnitř jednoho promptu, ne duplikát.**
```
[8]  never    does not use the word "journey" AS A METAPHOR FOR PERSONAL GROWTH   (kvalifikovaný)
[11] grammar  NO clichés… Banned: "journey", "embrace", …                          (plošný)
```
Model dostával obojí naráz. Owner na to narazil už dřív (*„ale journey není zakázané slovo!"*) —
měl pravdu podle [8] a neměl podle [11]. `test_no_planted_bans.js` má vyřešenou výjimku
(Raidho `is_n: Ferðalag`), která se opírá **výhradně** o kvalifikované znění a o plošném zákazu neví.
⭐ **A jazyky si už neodpovídaly:** IS gramatika `ferðalag` v seznamu **nikdy neměla**. Odstraněním
z EN se srovnaly — IS je primární, EN se rovná jemu (§2). `embrace` ponechán: oba bloky ho zakazují
plošně, takže si neodporují.

**2. Kotva rejstříku `He does not perform mysticism. He simply inhabits it.` / `Hann sýnir ekki
dulspeki. Hann býr einfaldlega í henni.` přesunuta z `DEF_CHAR.personality` do `_spine`.**
`RUNAR_DESIGN.md` ji označuje za **definici, ne ozdobu** — je to jediné místo v celém promptu, které
definuje hlas **kladně**; zbylých 668 slov jsou zákazy. Seděla ale v poli, které jeden řádek
v tabulce `runar_character` přepíše celé. **Změřeno** podstrčením vlastní postavy jen s `personality`:
```
před:  kotva ZMIZELA  ·  páteř přežila  ·  never přežily
po:    kotva PŘEŽILA (1×, obě řeči)
```
Byla to **jediná věc označená za invariant, na kterou se dalo dosáhnout zvenčí**. Kritérium není
naše nové — rozhodnutí 2026-08-14 zřídilo `_spine` právě jako slot pro to, „co má platit vždy".
Umístěna PŘED obraz: rejstřík řídí, jak se čte všechno pod ním.
⚠️ **Owner o umístění ještě nerozhodl** — text se nezměnil, vrácení je `git revert 254fa8a`.

- **Affected doc(s):** `RUNAR_EVAL_LOG.md` (měření bloku [7])
- **Reversibility:** easy (obojí jeden revert; `DEF_CHAR_V2_EN` má vlastní kopii kotvy, nedotčená —
  backlog ho eviduje k odstranění jako celý mrtvý řetěz).

---

## 2026-08-17 — Pravidla a doky: dva rozcestníky, dvě délková pravidla, a pořadí, které chybělo

- **Typ:** architecture (doky) · **Scope:** `CLAUDE.md`, `memory/working-style.md`, `check-docs.py`
- **Zdroj:** KUKY — *„drift a duplikáty jsou nejhorší"* + *„je potřeba zjistit vazby, ne slepě číst"*

**Co se našlo a opravilo v `CLAUDE.md`:**
1. **`mood`** — pole odstraněné 2026-06-14. Záznam **existoval a byl úplný**, včetně
   `Affected doc(s): CLAUDE.md`. Selhala až ta oprava a slovo tam stálo **devět týdnů**.
   Není to díra v pravidlech: `CLAUDE.md:204` ten mechanismus popisuje doslova. `check-docs.py`
   dostal pravidlo, aby se to nemohlo vrátit — `_moodContext` v seznamu **už byl**, přežily
   přesně ty dva tvary, které v něm nebyly.
2. **Obraznost** — doc popisoval jen sezónní pool. Ověření vazby ukázalo víc než původní nález:
   `SEASON_POOLS` **není jen záloha**, `_seasonalImagery` na něm stojí — `if (!pool) return ''`
   znamená, že v sezóně bez poolu nedostane čtení obraz **ani když runa svého kandidáta má**.
3. **Čtyři produkční soubory** nebyly v seznamu ani v load orderu; load order navíc chyběl oba
   tree-lab composery a `runar-tree-prod.js`. Ověřeno proti skutečnému pořadí `<script>`.
4. **`CLAUDE.md` porušoval vlastní §20** — opisoval hex hodnoty z CSS a project ref z configu.

**Dva duplikáty nalezené při hledání, co má bydlet jinde:**
- ⭐ **DVA ROZCESTNÍKY.** `memory/MEMORY.md:35` se jmenuje „kde co bydlí **(jediné místo)**"
  a `CLAUDE.md` měl vlastní „Kde hledat co". Už se rozešly: MEMORY.md mezitím dostal sloupec
  „druh pravdy" (🔒 📜 🔄 🏛), který v CLAUDE.md nikdy nebyl. Sloučeno na odkaz.
- **Pravidlo o délce doku bylo dvakrát** a s různými čísly: `CLAUDE.md` „~200, 250 OK",
  `working-style.md` „cíl pod 200". Vlastníkem je `CLAUDE.md`.

⭐ **`CLAUDE.md` VYŇAT z limitu 200 řádků (KUKY 2026-08-17, po změření):** samotná pravidla
§1–§28 jsou **248 řádků** a jsou důvod, proč ten soubor existuje — pod 200 se nedostane, aniž by
přišel o to, co vlastní. Platí pro něj jen přísnější test, který stál vedle: *způsobí jeho chybění
chybu? Pokud ne → smazat.*

⭐ **Pořadí, ve kterém se sahá na cizí věc** → `memory/working-style.md`. **Ne nové pravidlo** —
§21/§24/§26/§27 už existují; chybělo, v jakém sledu je pustit. Vzniklo z toho, jak se řešil `mood`,
a owner to označil za způsob, jakým to má vypadat vždy. Krok 2 má mechanický tvar (**grepni cílový
soubor na pojem, který do něj neseš**), protože „zeptej se, kde už to bydlí" je verze na pozornost
a týž den selhala.

⭐ **Compact: snapshot drží Claude průběžně, owner nedělá nic.** Ověřeno v dokumentaci, že
**automatický compact nejde instruovat** — žádné nastavení summarizeru instrukci nepředá,
`autoCompactEnabled` je na defaultu. Ruční `/compact Zachovej: …` účinek má, ale owner na něj
nemusí mít čas. Proto: snapshot se aktualizuje průběžně a `SessionStart` hook ho po compactu vypíše
sám; `/zabal` je jen ruční vyžádání.

- **Affected doc(s):** `CLAUDE.md`, `memory/working-style.md`
  (⚠️ původně tu stál i `memory/MEMORY.md` — chybně. Jeho rozcestník se NEMĚNIL, jen se stal
  jediným; opravu potřeboval CLAUDE.md, ne on. Chytil to smoke ⑮ a zablokoval push.)
- **Reversibility:** easy (git).

## 2026-08-17 — `/compact` řádka k zkopírování zrušena: neměla konzumenta

**KUKY:** *„tohle mi dáváš k čemu?"* (o `/compact Zachovej: …` řádce, kterou vypsal `/zabal`).

**Vada nebyla v tom, že jsem porušil pravidlo — pravidlo si tu výjimku samo drželo.**
`working-style.md` říkalo „NEVYPISOVAT ownerovi `/compact` řádku" a hned dodávalo „vypisuje se
jen na `/zabal`". Jenže **důvod toho zákazu platí na `/zabal` stejně**: owner by ji musel držet
v hlavě do okamžiku, který nikdo netrefí (automatický compact přijde bez ohlášení a instruovat
ho nejde). Výjimka nestála na ničem.

**Druhý důvod, §20:** všechno, co ta řádka nesla (na čem děláme · co jsme zjistili · další krok ·
co znovu nenavrhovat), je **už v commitnutém snapshotu**, a `SessionStart` hook ho po compactu
vypíše sám. Byla to druhá kopie téhož faktu doručovaná kanálem, který nefunguje.

**Změněno:** `.claude/commands/zabal.md` — krok 4 (vypiš řádku) → „řekni, že je zabaleno, stačí
holé `/compact`"; přepsán i důvod existence příkazu a `description` ve frontmatteru.
`memory/working-style.md` sekce „Compact" — výjimka pryč, zákaz platí bez výjimky.

**Co se tím NEruší:** `/zabal` sám. Jeho jediná práce — dostat rozdělanou práci do snapshotu
dřív, než compact přijde — zůstává a je to ta polovina drátu, která funguje.

Affected doc(s): memory/working-style.md · .claude/commands/zabal.md (obojí v témže commitu)

## 2026-08-17 — Po compactu nechyběl text, ale správný text: slot na rozdělanou práci byl jeden pro tři session

**KUKY:** *„problém byl v tom, že jsi po posledním compactu byl retardovaný… celý den jsem trávil
tím, že jsem tě to zase učil. To mě nebaví. Už to máme všechno dávno zapsané!"*

**Měl pravdu i v tom „dávno zapsané" — a právě proto nešlo o chybějící text.** Do kontextu se po
compactu vlévalo 8,5 kB pravidel a všechno, co jsem ten den porušil, v nich stálo. Přidat další
text je tedy varianta s DOLOŽENÝM neúspěchem. Změnu chování ten den způsobily dvě věci a obě
odmítly pustit dál: Stop-hook (zablokoval konec tahu) a smoke (spadl). Připomínka ani jednou.

### Nález 1 — jeden slot pro tři session (tichá ztráta, ne nepozornost)
`runar-context.py` bral „nejnovější snapshot" jako `sorted(...)[-1]`, tedy **abecedně**. Jakmile
mají dvě session snapshot z téhož dne, rozhoduje první písmeno ZA datem:
`2026-08-17-audit-promptu-bloky.md` (CODE-tune) vs `2026-08-17-first-static-readings…` (druhá).
`f` > `a`, takže tune session by po compactu dostávala CIZÍ kontext a svoji práci už NIKDY —
ať ji zapisuje jakkoli často. Slot nešlo „vyhrát" pilností.
**Opraveno:** vypisují se VŠECHNY dnešní snapshoty (max 3), každý se svým souborem, plus věta,
že mezi nimi má session najít svůj. Není-li dnešní žádný, řekne se, že jde o historii.
Rozbito v pěti stavech (3 dnešní · 1 dnešní · žádný dnešní · prázdná složka · strop 3).

### Nález 2 — datum si beru z vlitého kontextu, ne z `date`
Ten kontext nese VČEREJŠÍ snapshot; jeho hlavičku jsem vzal za dnešek → 19 záznamů s datem
o den zpět. Rozhodčí pravidlo „vyhrává novější datovaný záznam" se tím tiše obrací.
**Opraveno dvakrát:** hook říká `DNES JE …` jako první větu (příčina) a smoke ㉗
(`verify_fresh_dates.js`) BLOKUJE nový záznam s cizím datem i záznam vložený mimo append-only
pořadí (následek). Rozbito v 8 stavech — stav D odhalil, že bez `-uall` git zamlčí soubory
v neverzované složce.

### Nález 3 — na duplikáty nebyla kontrola žádná
Přitom je to podle ownera nejhorší třída vad a §20 ji zakazuje od 2026-07-18. Nová ㉘
(`verify_new_duplicates.js`) blokuje NOVÉ opakování tvrzení; starší vypisuje jako ℹ (§19.2),
aby se nezametla, ale smoke neshazuje — jinak by se první den vypnula.
⚠️ **Jednotka je TUČNÝ ÚSEK a je změřená, ne odhadnutá.** První verze porovnávala řádky a na
skutečné vadě NESEDLA (doky jsou ručně zalamované, tytéž dvě tvrzení stály na řádkách lišících
se po pomlčce). Změřeno na stavu, kde vada prokazatelně byla (`dd0a245`): tučný úsek ji chytí,
věta ne (0 nálezů), 8-gram ano, ale mezi 93 dalšími.
⚠️ A regex `\*\*([^*]{20,})\*\*` páruje hvězdičky napřeskáčku — před dlouhým úsekem stačí
krátký a spáruje se závěr prvního se začátkem druhého. Kontrola na tom mlčela, měření lhalo
(„1905 úseků, 2 opakování"); správným párováním je opakování **5**. Odhalily to až stavy D+E
rozbíjecího testu.

**Co se tím NEtvrdí:** že jsem po compactu použitelný. Kontroly hlídají tři konkrétní třídy vad,
ne „dodržuj pravidla". Read-gate (nutit se přečíst doky) jsem NEstavěl schválně — obsah těch
doků se po compactu vlévá tak jako tak, takže by to byl proces pro uspokojení (§ function-not-ceremony).

⚠️ **Hooky žijí mimo git** (`~/.claude/*.py`, `*.sh`) — celý mechanismus načtení tedy není
verzovaný. Zapsáno do `RUNAR_BACKLOG.md`.

Affected doc(s): RUNAR_BACKLOG.md (5 změřených duplikátů k existující položce B) — v témže commitu.

## 2026-08-17 — Oprava slotu byla jen na půl dne (doplněk k záznamu výš)

Ta oprava brala **dnešní** snapshoty a když žádný nebyl, spadla zpátky na `f[-1]` = abecedně
poslední soubor. Tím se kolize tří session vracela, jen o den později — každé ráno, než někdo
něco zapíše. Zjistil jsem to až na ownerovu otázku „tohle je vyřešené?", ne sám.

**Teď:** vybere se NEJNOVĚJŠÍ DEN, který ve složce je, a vypíšou se všechny snapshoty z něj.
Není-li ten den dnešek, řekne se to u každého i v hlavičce („v poslední pracovní den", ne „DNES").
Ověřeno v šesti stavech, včetně toho dřív neověřeného: dvě session, ani jedna z dneška.

## 2026-08-17 — Životní runa byla jediná islandská cesta bez ÁVARP; model si rod čtenáře volil sám

Audit bloku **ÍSLENSK MÁLFRÆÐI** (system prompt) po vazbách, ne po znění. Bod 5 říká
*„Kynið er tilgreint í ÁVARP; fylgdu því"* — tak kde je to ÁVARP a dostane ho každá cesta?

**Nedostala.** Změřeno na SLOŽENÉM promptu (produkční plocha, ne tvar kódu), všech sedm IS cest:
single · norns · kříž · horseshoe · yggdrasil · ask → ÁVARP ano; **životní runa → NE**.
Přitom `runar-tree.js:613` tentýž system prompt pro životní runu posílá, takže bod 5 tam ukazoval
do prázdna — a bod 1 téhož bloku zároveň přikazuje 2. osobu (`þú`), u které islandština rozlišuje
rod u každého přídavného jména. Model tedy rod zvolit MUSEL a neměl podle čeho.

**Opraveno:** `_addressContext(lang)` do `buildLifeRunePrompt`. Výchozí je `hk` (hán) —
projektem zvolený neutrální tvar. Ověřeno: tři různé varianty ÁVARP (kk/kvk/hk) skutečně
projdou, EN životní runa **1803 → 1803 znaků, beze změny** (`_addressContext('en')` vrací `''`
a `filter(Boolean)` to zahodí).

⚠️ **Co se NEtvrdí:** že se to v produkci projevovalo. V `eval_out/archive` není ANI JEDNO
čtení životní runy (923 single, 23 norns, 3 spread), takže reálný výstup jsem nezměřil — nález
stojí na složeném promptu. Kdo bude mít přístup k produkčním čtením životní runy, ať se podívá
na rod přídavných jmen u oslovení před 2026-08-17.

⚠️ **A past v měření:** první tři pokusy hlásily „ÁVARP chybí VŠUDE" — měl jsem špatné signatury
(`buildAskPrompt` má `lang` až pátý argument, `buildReadingPromptSingle` bere JEDNU runu, ne pole)
a `const RUNES` z `runar-runes.js` v vm kontextu nevystoupí na globální objekt. Falešný nález
třikrát po sobě, dokud jsem si nevypsal signatury ze zdroje. Golden test EN pak hlásil změnu
i u `single` — ta cesta je ale **záměrně náhodná** (losuje klíčová slova), což jsem si ověřil
dvěma běhy z téhož zdroje. Nález na náhodné ploše se nesmí připsat vlastní změně.

## 2026-08-17 — Shrine skládal pro islandštinu ANGLICKÝ prompt, včetně „Respond only in English"

Audit bloku **THE VOICE / RÖDDIN**. Kotva se dnes přestěhovala do `_spine()` právě proto, aby na
ni nedosáhla vlastní postava. Otázka, která z toho plyne: **kdo tou vlastní postavou vlastně je?**

`runar-shrine.html` → `loadChar()` → když v `runar_character` není aktivní řádek:
`activeChar = { ...DEF_CHAR }`. A `DEF_CHAR` je **alias na `DEF_CHAR_EN`**
(`runar-character.js:102`). Rozprostřený objekt má VŠECHNY klíče, a `buildSysPrompt` nechá
u vlastní postavy vyhrát každý její klíč nad jazykovým výchozím — to je její účel. Islandský
prompt se tím přepsal celý na anglický.

**Změřeno na složeném promptu, `lang='is'`:**
```
reader  (activeChar = null)           4855 znaků · ÍSLENSK MÁLFRÆÐI ano · „Respond only in English" ne
shrine  (activeChar = {...DEF_CHAR})  3780 znaků · ÍSLENSK MÁLFRÆÐI NE  · „Respond only in English" ANO
```
Přežila jen `_spine()` (RÖDDIN), protože bere `lang` přímo — přesně to, kvůli čemu páteř vznikla.

**Produkce tím netrpěla** (`runar-app.js:1394` dělá `activeChar = data || null`, nikdy
`{...DEF_CHAR}`). Vada byla v shrine — což je LAB, kde se nové věci ve čtení testují PŘED
nasazením. Každý islandský test v labu tedy běžel na špatném promptu.
**Opraveno:** shrine srovnán s produkcí, `activeChar = null`. Po opravě 4855 znaků, blok
gramatiky zpátky.

### Dvě věci, které tím NEJSOU vyřešené
1. **Aktivní řádek v `runar_character` může totéž udělat produkci.** Uloží-li tam někdo postavu
   s anglickými poli, islandský prompt se přepíše stejně. Stav té tabulky ze svého stroje
   NEZJISTÍM — patří ownerovi.
2. **Má vlastní postava vůbec smět přepsat `grammar`?** Argument, že ne: gramatický blok není
   rys povahy, je to 🔒 externě ukotvená islandština, a §2 říká, že IS musí být vždy perfektní.
   Byl by to týž krok jako `_spine()` — jenže o rozsahu, který mění produkční chování,
   nerozhoduje CODE sám. **Čeká na ownera**, zapsáno i v `RUNAR_BACKLOG.md`.

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-17 — OPRAVA vlastního závěru: nebyl to mrtvý lab, byla to produkční data

Záznam o hodinu výš tvrdí, že vada v shrine zasáhla „LAB, kde se čtení testují před nasazením".
**To je špatně a je to horší, než jsem napsal.** KUKY na to ukázal: *„ten už je mrtvý. Buď zapiš,
nebo odstranit… nevím, zjisti to!"*

**Zjištěno:**
1. **V2 lab je opravdu mrtvý — smazaný 2026-07-10** (`c6eb89c`, −971 řádků). Doky ho ale
   popisovaly dodnes: `working-style.md` posílal čtenáře testovat do `#reader-setup`,
   `#reader-rune-card`, `#reader-output` — tři ID, která v souboru **nejsou ani jednou**.
   Pět týdnů stará mapa do smazaného kódu. Opraveno.
2. **Shrine mrtvý NENÍ.** Šest tabů: `codes` · `correct` · `progress` · `readings` · `reports`
   · `teach`. Odstranit ho tedy nelze; odstranit se musela ta věta v docích.
3. **A `teach` píše do produkce.** `invokeRunar()` staví prompt přes `buildSysPrompt(activeChar,
   lang)` a výsledek jde do `runar_static_audio`, odkud ho servíruje produkční reader i journal
   (`runar-app.js:861`, `:1167`, `runar-journal.js:230`).

**Takže dopad opravené vady:** islandská statická čtení run vygenerovaná v shrine dostala
ANGLICKOU postavu, větu „Respond only in English" a **žádný** blok islandské gramatiky.
Okno: `buildSysPrompt(activeChar, lang)` je v shrine od **2026-05-31** (`815e817`), fallback
`{...DEF_CHAR}` od **2026-05-15** — tedy až do dnešní opravy. Podmínka: neexistoval aktivní
řádek v `runar_character` (jinak vyhrál ten, se svými poli).

**Pro ownera:** stojí za to projít IS řádky v `runar_static_audio` s `ready=true` z toho okna.
Druhá session dnes audituje právě `runar_static_audio` („první statická čtení run, květen 2026 —
starý hlas") — patří jí to k tomu.

**Poučení do postupu:** označil jsem plochu za „lab" podle DOKU, ne podle kódu. Doc byl pět
týdnů zastaralý. Kdybych se zeptal „kdo tu funkci volá a kam ten výstup teče", vyšlo by to hned —
je to týž krok „zjisti vazby", který na promptu dělám a na okolí jsem ho vynechal.

Affected doc(s): memory/working-style.md (sekce přepsána) — v témže commitu.

## 2026-08-17 — Blok THE IMAGE / MYNDIN: islandština má o pravidlo míň a nikdo o tom nevěděl

Audit bloku po vazbách. Blok bydlí v `_spine()`, takže na něj nedosáhne ani uložená postava,
ani nálada — to je v pořádku a je to jeho účel.

**Duplikát to není.** `node scripts/utils/lint_prompts.js` staví 2100 promptů a hlásí
„žádná instrukce se neopakuje ve dvou slotech". Konkrétní obraz vkládá `_seasonalImagery`
do UŽIVATELSKÉHO promptu, páteř říká jen JAK s ním zacházet. Dvě různé práce, žádná kopie.

**Nález 1 — parita.** Anglická verze má 7 vět, islandská 9, a sedí 1:1 až na jednu:
`Never a simile stacked on a metaphor.` **v islandštině není.** V `RUNAR_DECISIONS.md`,
`RUNAR_DESIGN.md` ani `RUNAR_BACKLOG.md` o tom NENÍ ZÁZNAM — takže to není rozhodnutí, ale výpadek.

**Nález 2 — to pravidlo hlídá jev, který skoro neexistuje.** Zákaz zní „přirovnání NAVRŠENÉ
na metaforu". Dvě přirovnání v téže větě má **1 z 800** anglických čtení v archivu.

**Nález 3 — zato islandská čtení jedou na `eins og` masivně:**
```
jazyk   čtení   s přirovnáním     přirovnání/1000 slov   pravidlo v promptu
EN        800    48  (6,0 %)             0,91                  ANO
IS        130    43  (33,1 %)            4,90                  NE
```
Přežilo půlku proti půlce (EN 0,62 · 1,06 · IS 4,08 · 5,29 — rozdíl mezi jazyky je větší
než uvnitř nich).
⚠️ **Ale čisté to není a nesmí se tak prodávat:** `eins og` je běžný islandský idiom i mimo
přirovnání, takže část toho rozdílu je jazyk, ne pravidlo. A hlavně — měřil jsem PŘIROVNÁNÍ,
kdežto pravidlo zakazuje přirovnání navršené na metaforu. **Nástroj neměří to pravidlo.**

**Nález 4 — druhá polovina bloku se neměří vůbec.** „Obraz nikdy nenese počasí, které teď není
skutečné" ani „jeden obraz na čtení" nemá žádnou kontrolu na výstupu; `measure_readings.js` jen
vypisuje, který sezónní obraz byl vložen (`:415`).

**Rozhodnutí: větu do islandštiny NEDOPLŇUJI naslepo.** Doklad pro její užitečnost chybí (1/800)
a překlopit ji do IS je práce s hlasem, ne parita čísel — to patří ownerovi a Coworkovi.
Data pro to rozhodnutí teď existují a jsou výš. Zapsáno do `RUNAR_BACKLOG.md`.

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-17 — Přirovnání v IS: není to berlička ani naše obrazy; a blok TWO THINGS stojí na mechanismu, který má JEN single

**Owner:** *„Nevím jaké přirovnání! Co to udělá? Potřebuje to? Je to opodstatněné, nebo je to
třeba tím, že si model na IS nevěří?"*

### Odkud to je (tři vysvětlení, dvě vyloučena měřením)
1. **Naše obrazy to nenesou.** `RUNE_IMAGES` + `SEASON_POOLS`: 214 obrazů v každém jazyce,
   **0 přirovnání** v EN i IS. Model si je přidává sám.
2. **Berlička to není.** Kdyby model sahal po přirovnání tam, kde má míň co říct, byla by hustší
   v kratších čteních. Na 1000 slov: IS kratší půlka **5,13** · delší **4,82** (EN 0,75 · 0,98).
   Plocho — hypotéza „nevěří si" v téhle podobě padá.
3. **Zbývá ustálený návyk modelu v islandštině.**

### Co to udělá — a kde jsem se spletl
Přirovnání se v obou jazycích věší na něco jiného:
```
jazyk   přirovnává RUNU   přirovnává to, co je řečeno o čtenáři
EN         45 %                    24 %
IS         10 %                    57 %
```
⚠️ **Nejdřív jsem to napsal jako cold reading. To je špatně** a zjistil jsem to až projektovým
měřidlem: `measure_readings.js --rules` hlásí na IS dávce **nárok na vnitřní stav 1/50 (2 %)**.
Rúnar mluví ve 2. osobě povinně (gramatika, bod 1), takže věta o čtenáři je očekávaná, ne vada.
Zůstává rozdíl v tom, **k čemu je obraz připnutý** — v angličtině jedná runa, v islandštině se
obrazem dokresluje situace čtenáře. **Jestli to Rúnara ředí, je rozhodnutí o hlase**, ne o čísle.

### Doporučení
Zákaz `simile stacked on a metaphor` do islandštiny **nedoplňovat** — hlídá jev s výskytem
1/800 v EN a s tímhle rozdílem nemá společného nic.

## Blok TWO THINGS THAT NEVER CHANGE — druhá věta popisuje mechanismus, který má jen jedna cesta ze sedmi

Blok říká: *„každé čtení přichází z jiného úhlu"*. Ten úhel je skutečná věc v promptu
(`angleIntro`, `READING_ANGLES`) — ale **vkládá se jen do `single`**:
```
RP_SINGLE ANO  ·  RP_LIFE · RP_ASK · RP_KRIZ · RP_NORNS · RP_HORSESHOE · RP_YGGDRASIL  NE
```
Ověřeno i na složeném promptu, všech sedm cest: úhel má jen `single`.
V `RUNAR_DECISIONS.md` je o úhlech spousta práce (2026-08-13 přepis sedmi úhlů, měření
stejnosti 2026-08-16) — **všechno o single**, a nikde záznam, že u spreadů být nemá.

Neopravuji sám: přidat úhel na pět rozložení mění chování pěti produkčních cest a je to
rozhodnutí o produktu (spready mají svou strukturu z pozic, možná úhel nepotřebují).
Data pro rozhodnutí chybí — archiv má 923 single, ale jen 23 norns a 3 spread.
Zapsáno do `RUNAR_BACKLOG.md`.

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.
---

## 2026-08-17 — sonnet-5 zrušen jako poslední fallback modelu čtení

- **Typ:** implementation (odebrání, ne náhrada)
- **Co se změnilo:** Řetězec modelů v `claude-proxy` byl `["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-5"]` → teď `["claude-opus-4-8", "claude-opus-4-7"]`. Chain zůstává čistě Opus: primár 4-8, na overload-class (429/5xx, ne timeout ani 4xx) fallback 4-7. Owner NEchtěl náhradu, jen odebrat poslední záchranu.
- **Proč:** sonnet-5 měl nepředvídatelný thinking náklad. IS májový prompt kolísal mezi dvěma běhy **216 ↔ 495** out tokenů — táž runa; dnešní složitý `direct` prompt spálil **~560** out thinkingem. Důvod dropu = **nepředvídatelnost, ne úspora** (rozdíl v ceně jsou haléře na čtení). Změřeno per model — viz RUNAR_PRICING.md „Volba modelu čtení — měření per model (2026-08-17)", tam bydlí čísla i kandidáti (sem se neopisují, §20).
- **Affected doc(s):** proxy `MODELS` (`supabase/functions/claude-proxy/index.ts`, důvod nesen komentářem na místě zásahu — §28) · `docs/runar-prompt-map.html` (mapa chainu, 3 místa: hero-node, „The model chain" note, dead-code `<li>` odstraněn) · `sql/2026-08-15_readings_usage.sql` (komentář s výčtem MODELS) · `scripts/utils/gen_batch.js` (komentář o chainu). RUNAR_PRICING.md rozhodnutí už popisuje (owner, dřív téhož dne) — nekopíruje se.
- **Reality note:** Deploy `supabase functions deploy claude-proxy` dělá **owner** — do té doby je změna jen v kódu a produkce jede pořád starý 3-model chain (změna je pro git viditelná, pro produkci ne). Historický nález `docs/findings/2026-08-15-wf_62679055-021.md` cituje starý stav kódu (tehdejší `index.ts:654`) a ZŮSTÁVÁ nezměněn — je to dobově datovaný snímek, ne živá mapa.
- **Reverzibilita:** easy (přidat model zpět do `MODELS` + redeploy). Ale návrat jen **očištěný** dle §26: sonnet-5 se smí vrátit, teprve až bude thinking náklad předvídatelný nebo omezený (thinking off / capped), ne jako kopie dnešního stavu.


## 2026-08-17 — Pět otevřených věcí protestováno; dvě uzavřeny, dvě zúženy, jedna se změřit nedá

**KUKY:** *„rozeber je, otestuj. Jak se používají."*

### 1. Islandská přirovnání — UZAVŘENO, owner schválil
Zákaz `simile stacked on a metaphor` se do islandštiny **nedoplňuje**. Hlídá jev s výskytem
1/800 v EN a s naměřeným rozdílem nemá nic společného (data → záznam výš, 2026-08-17).

### 2. Kotva v páteři — UZAVŘENO daty, zbývá jen tvůj vkus
Otestováno **12 kombinací**: 3 registry (`focused` · `direct` · `lyrical`) × výchozí i cizí
postava v DB × obě řeči. Kotva, obraz i „dvě věci" **přežily VŠECHNY**, včetně nejhorší
(anglický řádek v DB + registr `direct`, kde prompt spadne na 3369 znaků).
Páteř tedy dělá přesně to, kvůli čemu vznikla. Kde má věta stát, je rozhodnutí o hlase —
technicky je jedno místo prokazatelně bezpečné a druhé prokazatelně ne.

### 3. Řádek v `runar_character` — ZÚŽENO na jeden tvar
Protlačeno osmi tvary řádku, které tam reálně můžou stát, obě řeči:
```
tvar řádku                             lang=is        co se stane
žádný / prázdný {}                     4855 zn.       nic, platí jazykový výchozí
jen `personality`                      4712 zn.       přepíše se JEN personality — bezpečné
DB řádek s id/active/created_at        4696 zn.       cizí sloupce nevadí
`grammar` = prázdný řetězec            4855 zn.       NEMAŽE — merge prázdné hodnoty přeskakuje
celý ANGLICKÝ znak                     3780 zn.       ⚠️ IS gramatika PRYČ + „Respond only in English"
`grammar` přepsán anglicky             3781 zn.       ⚠️ totéž
```
**Nebezpečný je jen řádek, který v `grammar` nese skutečný text.** Částečné řádky jsou bezpečné,
protože merge přeskakuje `null`/`undefined`/prázdný řetězec (`runar-character.js:1105`).
⚠️ **A je to symetrické:** islandský řádek stejně tak rozbije ANGLICKÝ prompt (EN + IS znak =
4945 znaků s islandskou gramatikou). Uložená postava je jazykově slepá.
**Pro ownera zbývá jediná otázka:** je v té tabulce aktivní řádek a má vyplněný `grammar`?

### 4. Zámek gramatiky — návrh se zúžil na jedno pole
Data výš říkají, co zamykat: **ne celou postavu, jen `grammar`.** Legitimní použití (vlastní
povaha, vlastní identita) se tím nedotkne a „vymazat gramatiku prázdnou hodnotou" už dnes nejde.
Pořád je to změna produkčního chování → čeká na ownera.

### 5. Úhel u spreadů — ZMĚŘIT SE TO NEDÁ, a je to výsledek
Hypotéza: spready nemají úhel, takže by měly víc splývat. Změřeno průměrnou párovou shodou
na trigramech: norns **0,0025** vs single **0,0009** (2,79×) — jenže **půlka proti půlce uvnitř
single dá 0,0002 vs 0,0029, tedy 14× rozptyl**. Rozdíl mezi rameny je menší než šum uvnitř
jednoho. **Měřidlo ty dva stavy nerozliší** a číslo 2,79× by bylo prodané, ne naměřené.
Důvod je v datech, ne v metrice: archiv má 923 single, ale jen **23 norns a 0 islandských**.
Rozhodnout to jde až po vygenerování norns dávky (≥50, obě řeči).

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-17 — Ptal jsem se místo abych se zeptal databáze. Tři z pěti položek zavřeny do deseti minut

**KUKY:** *„Takže jsi mi položil otázky, co s něčím udělat, místo abys to otestoval a zjistil,
jak to funguje — a tím pádem věděl, co s tím udělat. Je to tak?"* **Ano, u tří z pěti.**

Napsal jsem *„stav té tabulky ze svého stroje NEZJISTÍM — patří ownerovi"* a **nikdy jsem to
nezkusil.** `supabase db query --linked` je přitom v `CLAUDE.md` (sekce DB) a CLI je nalinkované
(`supabase/.temp/project-ref`). Jeden příkaz.

### Co databáze odpověděla
```
runar_character:  0 řádků, 0 aktivních
sloupce:          id · created_at · label · identity · personality · purpose · voice
                  · never · philosophy · format · imagery · active
```
**Sloupec `grammar` v té tabulce NEEXISTUJE.** A žádný kód do ní nezapisuje — všech pět míst
v repu dělá jen `select` (`runar-app.js:1393`, `runar-shrine.html:1043`, `runar-yggdrasil.html:637`).

### Co se tím zavírá
1. **„Zkontroluj `runar_character`" — HOTOVO, není co kontrolovat.** Tabulka je prázdná
   a nemá zapisovatele; naplnit ji jde jen ručně SQL.
2. **„Zámek gramatiky" — ZBYTEČNÝ.** DB řádek gramatiku nést nemůže, protože ten sloupec nemá.
   Jediná cesta, kudy se to stalo, byl shrine (`{...DEF_CHAR}` v JS), a ta je zalepená.
3. **„Kotva" — ZŮSTÁVÁ V PÁTEŘI.** Otestováno 12 kombinací (3 registry × výchozí i cizí postava
   × obě řeči); přežila všechny. Ptát se, kde má stát, nemá smysl: jiné místo prokazatelně
   bezpečné není.

### A nejtvrdší kus
`scripts/utils/test_spine.js` **v komentáři už od 2026-08-14 stojí**: *„Realistický řádek
z `runar_character`: má svá pole, ale `grammar` nikdy neměl."* Odpověď ležela v našem repu.
Navíc ten test **nebyl ve smoke** — běžel, jen když si na něj někdo vzpomněl, a přesně proto
nechytil dnešní vadu v shrine. **Zapojen jako kontrola ㉙.**

### Kde ta otázka byla oprávněná
- **Islandská přirovnání** — změřeno a doporučeno, owner schválil. Ne otázka místo práce.
- **Úhel u spreadů** — data na rozhodnutí nestačí (23 norns, 0 islandských) a chybí jen
  vygenerovaná dávka. Tu spustit umím; potřebuju k tomu token.

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-18 — Úhel u spreadů se nedoplňuje: obavu, na které to stálo, měření nepotvrdilo

Poslední otevřená položka z auditu promptu. 17. 8. se rozhodnout nedala (23 norns v archivu,
0 islandských). Owner dal přístup na Claude API, takže data vznikla: **300 čtení, 6 ramen,
týž den, týž model, týž generátor.**

**Obava zněla:** `angleIntro` má jen `RP_SINGLE`, takže spready nemají čím lámat opakování.
**Obrácená páka (§25):** vypnout úhel u single — jediná proměnná. Kdyby úhel proti stejnosti
pracoval, MUSÍ to bez něj být horší. **Není.** V islandštině stejnost dokonce klesla; všechny
rozdíly jsou menší než rozptyl mezi půlkami téhož ramene.

**Rozhodnutí: úhel se do spreadů NEPŘIDÁVÁ** — argument „bez úhlu splývají" neobstál.
Kdyby se přidával někdy později, musí to být z jiného důvodu (řemeslná volba vstupu do obrazu),
ne z tohohle.

⚠️ **Nepřebíjí to nález z 2026-08-16 („úhel vyrábí stejnost", p = 0,004).** Ten měřil dvojice
se STEJNÝM úhlem; moje metrika sdružuje všechny dvojice a na tu otázku nevidí. Platí obojí:
*mezi čteními s týmž úhlem* stejnost roste, a *odebrání úhlu* měřitelně nezhoršilo nic.

**Přibyly dva nástroje** (obojí v `scripts/utils/`): `gen_direct.js` — generuje dávku přímo
přes Claude API, když je proxy token po expiraci; `measure_sameness.js` — párová stejnost,
která si vždy vypíše vlastní šumovou podlahu, protože přesně na ní 17. 8. tohle měření padlo.

Čísla, ramena a obě chyby v nástroji → `RUNAR_EVAL_LOG.md` 2026-08-18. Tady se neopisují (§20).

Affected doc(s): RUNAR_BACKLOG.md (položka uzavřena) · RUNAR_EVAL_LOG.md — v témže commitu.

## 2026-08-18 — Z auditu promptu vznikla kontrola: dojde každá páka na každou cestu? (smoke ㉚)

**Závěr auditu byl, že prompt neměl problém ve ZNĚNÍ, ale v ZAPOJENÍ.** Všechny čtyři nalezené
vady byly téhož druhu — `ÁVARP` mělo 6 ze 7 islandských cest, úhel má 1 ze 7, shrine přebil
celý jazyk, `journey` byl zakázaný dvakrát jinak. Každou z nich našel člověk čtením.
KUKY: *„ok udelej!"*

**`scripts/verify_prompt_levers.js`** postaví prompt každé ze 7 cest v obou řečech a u každé
per-čtení páky změří, jestli vůbec přispěla. Funkční páka se obalí špionem (přispěla = vrátila
neprázdné), řádková se hledá markerem z packu TÉ cesty — stejně jako `gen_batch --without`.
**Seznam pák se neopisuje** — čte se z `WITHOUT` v `gen_batch.js`, který je jeho jediným
domovem (§18); kdyby tam páka přibyla, kontrola ji uvidí sama.

**Neříká „všude musí být všechno".** Drží MAPU výjimek, každou s důvodem a datem (§28),
a hlásí ZMĚNU proti ní: páka přestala docházet tam, kam docházela, nebo se objevila tam,
kde být nemá. Přesně tak zmizelo ÁVARP a nikdo si toho nevšiml.

**Dvě věci hlásilo měřidlo nejdřív špatně** a jsou proto napsané v hlavičce kontroly:
`voice` má `sys: true` (bydlí v systémovém promptu, ne v uživatelském) → hlásil se „NE"
u všech sedmi cest; a marker řádkové páky se bral vždy z `RP_SINGLE`, takže u ostatních
packů minul. Obojí opraveno dřív, než se z toho stal „nález".

**Rozbito (§ guard-test-the-lifecycle):**
- ÁVARP odebráno ze `buildLifeRunePrompt` → `is · liferune · address nedochází` ✓
- výjimka prohlášena na páku, která prokazatelně dochází → `NAOPAK dochází` ✓ (obě řeči)
- po vrácení obojí zeleně ✓
⚠️ **Třetí pokus (přidat `angleIntro` do `RP_NORNS`) NEBYL platný test** a nehlásím ho jako
úspěch: přidat klíč do packu ještě neznamená, že ho builder použije, takže se nic „neobjevilo".
Opačný směr je proto ověřený jen na logice mapy, ne na skutečném zapojení.

**Co kontrola rovnou našla:** `_lensContext` (životní runa jako čočka) dochází na `single`
a `norns`, ale **ne na kříž, horseshoe ani yggdrasil**. Jestli je to záměr, nikde napsané není
→ zapsáno do `RUNAR_BACKLOG.md`, v mapě vedeno jako výjimka s poznámkou „NEROZHODNUTO".

Affected doc(s): RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-18 — Cowork fact-check „Token & Model Discipline": ověřeno, a dvě věci z docs, které měníme sami

Handoff od Coworku (doc-lane), **psáno proti `66f829b` = můj HEAD** — handoff je aktuální.
Draft sám říká, že se NEMÁ implementovat (čeká na ratifikaci ownerem), takže se nefiluje.
Ověřeno bylo jen to, co je ověřitelné, a to podle toho, kdo na co vidí (CLAUDE.md „kdo co VIDÍ").

**Tvrzení o NAŠEM kódu — ověřil CODE, obě sedí:**
`CLAUDE.md:373` je dnes text o stromu; pravidlo „Cowork NIKDY nediagnostikuje kód" je
na `:406`. Citace v draftu je tedy zastaralá. Doplněk k jejich doporučení: **žádný živý doc
v repu čísla řádků necituje** — jediné výskyty jsou v `docs/findings/`, což je doslovný záznam.

**Tvrzení o oficiálních docs — ověřeno primárním zdrojem, taky sedí.** *„Size: target under
200 lines per CLAUDE.md file"* je doslovný citát, je to **cíl**, a *„CLAUDE.md files are loaded
in full regardless of length"*; tvrdý limit 200 řádků / 25 KB má **jen `MEMORY.md`**.
Cowork tohle ve své předchozí verzi měl obráceně a sám to opravil — ověřoval jsem právě proto.

### Dvě věci z týchž docs, které Cowork nezmínil a nás se týkají přímo
1. **HTML komentáře v `CLAUDE.md` se do kontextu VŮBEC nedostanou** — *„Block-level HTML
   comments … are stripped before the content is injected."* Našich 5 escape značek
   (`check-docs:ok` uvnitř HTML komentáře) tedy nestojí ani token. Argument „značky nafukují prompt" padá.
2. **Kořenový `CLAUDE.md` přežívá compact sám** — *„after `/compact`, Claude re-reads it from
   disk and re-injects it."* To mění pohled na celý dnešní post-compact drát: hook nemusí nést
   nic, co už je v `CLAUDE.md`, a pokud to nese, je to duplicita přes dva kanály (§20).
   **Neověřeno, jestli se skutečně překrývají** — zapsáno do `RUNAR_BACKLOG.md`, netvrdím to.

### Opraveno hned (v repu, mimo draft)
Výjimka pro `CLAUDE.md` se opírala o **přesný počet řádků 248**. Změřeno dnes: **245** — ujelo
to za jediný den. Číslo nahrazeno tvrzením „§1–§28 přesahují 200 řádků", které zůstane pravdivé,
a k němu důvod, aby ho tam někdo nevrátil. **Je to zároveň doklad pro Coworkovo doporučení
přestat citovat čísla:** neplatí to jen pro čísla řádků v citacích, ale pro každé číslo,
které se mění s každou úpravou.

### Změřeno pro rozhodnutí, které teprve přijde
`CLAUDE.md` = **452 řádků**, z toho pravidla §1–§28 = **245** (mají datovanou výjimku) a
**207 všechno ostatní**. Největší nepravidlové bloky: „N paralelních session" 54 · „Soubory
a jejich zodpovědnost" 43 · „Reading systém — stav" 31.
Oficiální `/doctor` logika říká odříznout **odvoditelné** (layouty, závislosti, architektura)
a nechat pitfalls/rationale/konvence. Podle toho je jediný velký odvoditelný blok **výpis
souborů (43 ř.)** — lanes a stav odvodit nejdou. **Nic z toho neměním**; je to podklad, aby
se owner nerozhodoval podle dojmu.

Affected doc(s): CLAUDE.md (číslo → tvrzení) · RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-18 — Statická čtení run vadou NEPROŠLA: žádný řádek nevznikl uvnitř okna

Poslední věc, kterou owner nechal na mně: islandská statická čtení v `runar_static_audio`
měla vzniknout mezi 2026-05-31 a 2026-08-17 s anglickou postavou a větou „Respond only in
English" (shrine si nastavoval `{...DEF_CHAR}`). Kód opraven 17. 8., ale data měla zůstat.

**Změřeno v produkční DB (`supabase db query --linked`) — a vyšlo to jinak, než se čekalo.**

```
lang   řádků   created_at        updated_at     max version
en       28    15.–16. 5.        16. 5.              2
is       25    16.–21. 5.        21. 5.              2
```

**Celá tabulka je z 15.–21. KVĚTNA. Okno vady se otevřelo až 31. 5.** — `buildSysPrompt(activeChar,
lang)` je v shrine od `815e817` (2026-05-31). Mezi tím a dneškem tam **nikdo nic nevygeneroval**,
takže vadným promptem neprošel ani jeden řádek. `updated_at` to potvrzuje podruhé: poslední
zápis 21. 5., nic se nepřepisovalo. `max(version) = 2` potvrzuje potřetí — žádná pozdější
regenerace.

**A čtvrtý, nezávislý důkaz — obsah, ne datum:** všech 25 islandských řádků obsahuje islandské
znaky (`þðæö`) a **ani jeden** neobsahuje `" the "` nebo `" you "`; u anglických je to přesně
obráceně. Kdyby některé čtení vzniklo pod anglickou postavou s „Respond only in English",
tohle by to ukázalo.

**Závěr: není co opravovat.** Vada v kódu byla skutečná a je zalepená; data se jí vyhnula
tím, že se statická čtení od května negenerovala. Zapisuje se to proto, aby to příště nikdo
nehledal znovu — a jako doklad, že „vadný kód" a „vadná data" nejsou totéž.

⚠️ **Co to naopak znamená pro budoucnost:** jakmile někdo v shrine statické čtení znovu
vygeneruje, dostane už opravený prompt. Kdyby se v tabulce objevil islandský řádek s datem
mezi 31. 5. a 17. 8., ten by podezřelý byl — žádný takový ale není.

## 2026-08-18 — Hook neduplikuje nic. Horší zjištění: `CLAUDE.md` se nám vůbec nenačítalo při startu

Otázka z backlogu: nese SessionStart hook něco, co `CLAUDE.md` po compactu vloží samo?
Docs slibují *„after `/compact`, Claude re-reads it from disk and re-injects it."*

**Změřeno** (6-gramy obsahových slov, `scratchpad/prekryv.py`, se složenou diakritikou):
```
hook ↔ CLAUDE.md          0,3 %        šumová podlaha 0,0–0,2 %
hook ↔ MEMORY.md          0,1 %        šum
hook ↔ working-style.md   3,1 %        10× nad šumem
```
Doslovný překryv s `CLAUDE.md` je **na úrovni šumu** — ty tři shody jsou jedna citovaná věta
z §21. Jediný skutečný překryv je s `working-style.md`, a ten je **topic soubor, který se při
startu nenačítá** (docs: *„Topic files … are not loaded at startup"*). Hook tedy neduplikuje
nic, co už v kontextu je — je jediný kanál, kterým se to tam dostane.

⚠️ **První měření vyšlo 0 % úplně všude, i u šumové podlahy.** To je čisté číslo, tedy podle
vlastního pravidla red flag — a bylo. Hook píšu **bez diakritiky** („PRUBEZNE"), doky s ní,
takže metrika neměřila duplikaci, ale pravopis. Po složení diakritiky čísla výš.

### Podstatnější nález, který z toho vypadl
**Náš `CLAUDE.md` je v PODadresáři cwd.** Session běží z `C:\Users\zkuku`, pravidla leží
v `Downloads\Runar-admin\CLAUDE.md`. Docs: *„Claude also discovers CLAUDE.md files in
subdirectories … Instead of loading them at launch, they are included when Claude reads files
in those subdirectories"* a *„Nested CLAUDE.md files in subdirectories … are not re-injected
automatically."* Ověřeno, že nad cwd žádný `CLAUDE.md` není (ani `~/.claude/CLAUDE.md`).

**Takže §1–§28 se do session dostala až ve chvíli, kdy jsem sáhl na soubor v repu** — ne na
začátku a ne po compactu. To, co jsem celý den považoval za pojistku navíc (hook), bylo
ve skutečnosti jediné, co pravidla doručovalo včas.

**Řešeno dokumentovaným mechanismem:** `C:\Users\zkuku\CLAUDE.md` = **jedna řádka importu**
`@Downloads/Runar-admin/CLAUDE.md`. Docs: *„Imported files are expanded and loaded into context
at launch."* Repo soubor se tím chová jako project-root — načte se hned a po compactu znovu.
Žádná kopie nevzniká (§17/§20), jen ukazatel; zrušení = smazat ten jeden soubor.

⚠️ **Neověřeno v běhu:** efekt se projeví až při startu příští session a potvrdit ho umí jen
owner (`/context` → sekce Memory files). Netvrdím, že to funguje — tvrdím, že to odpovídá
dokumentovanému mechanismu a že cesta v importu existuje.
⚠️ **Vedlejší účinek:** platí pro KAŽDOU session spuštěnou z `C:\Users\zkuku`, i kdyby
nešlo o Rúnara.

Affected doc(s): RUNAR_BACKLOG.md (položka uzavřena) — v témže commitu.

## 2026-08-18 — `CLAUDE.md`: pravidla zůstávají, výpis souborů taky, stav jde pryč

KUKY: *„co ten CLAUDE.md? Necháme jak je nebo upravit? Kritika! Zpomaluje nás větší soubor?"*

**Změřeno oficiálním `count_tokens`, ne odhadem:** `CLAUDE.md` = **17 704 tokenů**
(33 973 znaků, 456 řádků); §1–§28 = 10 130 (57 %), zbytek 7 579 (43 %).
**1,92 znaku na token** — čeština stojí zhruba dvakrát tolik co angličtina.

**Nezpomaluje.** 17,7 k v milionovém okně je 1,8 % a cachuje se. Docs argumentují
**dodržováním**, ne rychlostí — jenže adherenci u sebe měřit neumíme, takže „zkrátit a bude
to lepší" by byla víra, ne měření (§24). **Proto se pravidla neřežou.**

### Co se NEudělalo, ačkoli jsem to sám navrhl
**Výpis souborů (43 ř.) zůstává.** Navrhl jsem ho zúžit podle `/doctor` logiky („architektura
je odvoditelná") — pak jsem ho ověřil: **všech 24 zmíněných souborů existuje a ze 18 produkčních
`v2/*.js` nechybí ani jeden.** Řezat správnou a úplnou mapu kvůli heuristice je přesně ten řez
na víru, který jsem o odstavec výš odmítl. Vlastní návrh tedy padá na vlastním měření.

### Co se udělalo
Sekce „Spread systém" nesla řádku *„Stav … Single · Norns · Kříž · Horseshoe · Yggdrasil
= ✅ produkce. The Gathering = ❌ redesign"*. Dvě vady najednou:
1. **STAV**, který §20.4 zakazuje v docích držet;
2. **duplikát uvnitř téhož souboru** — o `runar-gathering.js` a jeho čekání na `tree_state`
   stojí totéž o 326 řádek výš ve výpisu souborů.
Pět spreadů je v `SPREAD_COSTS`/`SPREAD_CONFIG`, takže se dá odkázat místo opisovat.
Nahrazeno odkazem + komentářem, proč tam ten text nestojí.

⚠️ **A teď to nepříjemné číslo: úprava kontext ZVĚTŠILA.** Změřeno na tom, co se opravdu načítá
(HTML komentáře se před vložením strippují, takže syrový soubor měří něco jiného):
```
syrový soubor    17 704 → 17 885   (+181)
BEZ komentářů    17 527 → 17 565   (+38)   ← tohle jde do kontextu
```
Odkaz je delší než ta stavová řádka, kterou nahradil. **Úspora nikdy nebyla důvod** — důvodem
byl duplikát a §20.4. Ale kdybych to prodal jako „vyčištění kvůli tokenům", byla by to lež
o 38 tokenů opačným směrem. Zároveň to zabíjí celý rámec „řezat kvůli velikosti": komentáře
v tom souboru zabírají 320 tokenů a **stojí nula**, protože se do kontextu nedostanou.

### Co NEbylo moje
Sekce „Tree of Life — stav" má tutéž vadu ve čtyřech řádcích, a `RUNAR_TREE.md:222` ten fakt
už vlastní. **CODE-tune ji ale nepřepisuje** („každá session edituje JEN svou sekci") →
předáno tree lane přes `RUNAR_BACKLOG.md`. Řádka o krmení stromu regexem přes text čtení je
naopak **pitfall pro moji lane** a zůstává.

Affected doc(s): CLAUDE.md · RUNAR_BACKLOG.md — v témže commitu.

---

## 2026-08-18 — Runová obraznost: pole+rozprostírač místo poolu · forma L1 · TVAR věty · Isa relaxace

- **Typ:** intent (explorace → směr; implementace = CODE-tune, zatím NE)
- **Co se změnilo (SMĚR, ne kód):**
  1. Nahradit fixní `RUNE_IMAGES` pool **dvouúrovňovým polem** (domény → fragmenty) + **rozprostíračem** nad doménami. Řeší „moc stejná" i „past poolu" (runa MUSÍ použít vylosovaný obraz).
  2. Cíl hlasu = **forma L1** (obraz + jeden esenční řádek + umístění).
  3. Nová páka **TVAR věty** — stejný význam, jiná forma pokaždé.
  4. **Isa/led relaxace:** led je přirozenost Isa (i hraničních run), smí celý rok; sezónně se nehlídá „led v srpnu" jako obraz, jen tvrzení „teď ti venku mrzne". Ruší dřívější úzkoprsé sezónní zamykání ledu.
- **Proč:** změřeno — volné pole se slévá na jediný obraz (Isa 6/6 čaj, Berkana IS 6/6 těsto); rozprostírač to opravil při zachování kvality; forma L1 = „direct", co owner hledal. Čísla → `RUNAR_EVAL_LOG.md` 2026-08-18.
- **Affected doc(s):** RUNAR_DESIGN.md („Jak Rúnar skládá čtení") — v témže commitu.
- **Reality note:** spec + páky v RUNAR_DESIGN.md; surové korpusy v `~/runar-eval/` (field-vs-pool, test2-spreader, form-lever, L1-*). Cowork dodá pole pro 25 run + sezónní tagy domén; CODE-tune implementuje.
- **Reversibility:** soft (páky v promptu; v produkci se ještě nic nezměnilo).

## 2026-08-18 — Zadání se prověřuje taky: čtyři nálezy na dokumentu, který jsem zařadil bez mrknutí

KUKY: *„klidně to zkritizuj, stejně to máš dělat! Jakékoliv zadání, které dostaneš, máš prověřit."*
Zařadil jsem `memory/cowork-handoff-quality-bar.md` a k tomu dal dvě měkké poznámky. Bylo tam
čtyři věci a **ta nejtvrdší byla na řádce, kterou jsem sám napsal.**

**1. Řádka do indexu porušovala pravidlo, které ten dokument sám cituje.** Znělo
*„potvrzený na dvou po sobě oceněných handoffech 2026-08-18"* — jenže frontmatter téhož
souboru říká: *„provenience/pochvala k tomuhle patří do snapshotu k 2026-08-18, ne sem."*
Napsal jsem provenienci do indexu doslova pod větou, která ji zakazuje. **Opraveno** —
řádka teď nese, co ten doc JE, ne kým byl pochválen.

**2. Frontmatter neměl tvar, který má zbylých ~30 souborů v `memory/`.** Ostatní mají
`name` / `description` / `metadata`; tenhle měl vlastní pole (`téma`, `destination`, `příklady`)
**a jednu řádku bez klíče**, kterou by YAML nepřipojil. Chybějící `description` není kosmetika —
podle něj se rozhoduje relevance při vybavování, takže soubor byl v té složce cizí.
**Přepsáno na domácí tvar; tělo dokumentu se nezměnilo ani o slovo** (ověřeno) a původní pole
jsou zachovaná v HTML komentáři, který se do kontextu nedostává, takže nestojí ani token.

**3. Oba „příklady", na které se doc odvolává, v repu NEEXISTUJÍ.** `2026-08-18-HANDOFF_
rune-imagery-environment…` ani `…HANDOFF2_rune-imagery-two-level-field…` — ověřeno `find`.
Kontrola ⑯ to nechytila, protože to nejsou markdownové odkazy, jen holá jména souborů;
to je mezera v naší kontrole, ne v tom dokumentu. Fakt je teď u nich napsaný.

### Co jsem NEopravil, protože je to obsah Coworku (jejich lane)
**4. Bod 12 je duplikát.** *„Shrnutí + změněno: nic"* říká `CLAUDE.md:435` doslova:
*„Handoff má sekci `ZMĚNĚNO:` (co jsem změnil), i prázdnou."* Jedna informace, dvě místa (§20).
**5. Doc nedodržuje vlastní bod 2.** Ten říká, že tvrzení o vzorci potřebuje **≥20–25** vzorků
a že i cizí čísla s malým `n` se mají říct nahlas. Sám je přitom postavený na **dvou**
handoffech. Není to vada obsahu — je to přesně ta věta, kterou by si podle sebe měl napsat.
Obojí → `RUNAR_BACKLOG.md` jako otázka na Cowork, ne jako moje oprava.

⚠️ **Poučení pro mě:** dostal jsem hotové zadání i s textem řádky a udělal jsem ho doslova.
Frontmatter i ta proveniencí porušená řádka byly vidět na první přečtení souboru — jen jsem
se nedíval, protože „zadání je jasné". Jasné zadání není ověřené zadání.

Affected doc(s): memory/MEMORY.md · memory/cowork-handoff-quality-bar.md · RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-18 — Tři CODE session, ne dvě. A dvě z nich commitovaly pod týmž prefixem

KUKY: *„CODE-reader pracuje na nové direct reading… myslím, že v CLAUDE.md bylo napsáno,
že jsou 2 CODE session. Není to pravda, jsou 3."* Měl pravdu — a špatné číslo bylo to menší
z toho, co za tím leželo.

**Ověřeno v `git log`:** commity `1eaced0` („spec jak Rúnar skládá čtení") a `eaa96c0`
(„4. osa pestrosti") **nejsou od CODE-tune a nesou `[tune]`**. `CLAUDE.md` přitom o dva
odstavce výš tvrdí: *„Git je všechny podepisuje Runar Admin, takže jediné, co v historii
rozliší autora, je commit prefix."* **Ta věta přestala platit a nikdo si toho nevšiml** —
`git log` tím přestal být akčním logem, na kterém stojí celá koordinace tří session.

**Opraveno v `CLAUDE.md`:**
- `2× Code` → `3× Code`
- nový lane **CODE-reader → prefix `[read]`**: čte, testuje, mapuje, **produkční kód nesahá**
  (KUKY 2026-08-17: *„codování dělá CODE-tune, ty jsi code-reader"*); nálezy do
  `RUNAR_EVAL_LOG.md` / `RUNAR_DESIGN.md`, změny v kódu **předává** CODE-tune.

**Proč `[read]`, a ne `[reader]` — je to změřené, ne vkus.** `[reading]` je v historii
**46× jako téma** (`git log | grep -oE "^\[[a-z]+\]" | sort | uniq -c`). `[reader]` by se
od něj v běžném výpisu nedalo odlišit pohledem, což je přesně ta vlastnost, kvůli které
prefix existuje. Zároveň se `[reading]` **přestává používat jako téma** — historie si ho
nechává, nové commity ne. Jedno slovo, jeden význam.

⚠️ **Co tím NENÍ vyřešeno:** ta dvojznačnost je v historii i nadále — u commitů pod `[tune]`
z 17.–18. 8. nejde zpětně poznat, která session je psala, leda podle dotčených souborů
(CODE-reader sahá jen na `RUNAR_DESIGN.md` a `RUNAR_EVAL_LOG.md`). Nepřepisuju historii.

⚠️ **Otázka, kterou nerozhoduju:** CODE-reader píše do `RUNAR_DESIGN.md`, což podle lanes
patří **Coworku** („design, docs, eval-OBSAH"). Buď je to výjimka, kterou owner zavedl
vědomě, nebo druhá kolize lanes. Zapsáno do `RUNAR_BACKLOG.md`.

Affected doc(s): CLAUDE.md · RUNAR_BACKLOG.md — v témže commitu.

## 2026-08-18 — „Jak tohle hlídat?" — kořen nebyl prefix, ale společný podpis (smoke ㉛)

KUKY po zjištění, že dvě session commitují pod `[tune]`: *„to mi připomíná, proč jsme měli
takové problémy s tím, že si nic nepamatuješ… teď rozumíš. Jak tohle hlídat?"*

**Ta věta v `CLAUDE.md` nebyla mechanismus, byl to slib.** Stálo tam *„jediné, co v historii
rozliší autora, je commit prefix"* — a přestalo to platit ve chvíli, kdy přibyla třetí CODE
session. Nikoho to neupozornilo, protože prefix si session píše sama a nic ho neověřuje.
**Táž třída vady jako paměť po compactu:** pravidlo, které drží jen tím, že si na něj někdo
vzpomene, není pojistka — je to odložená chyba.

**Kořen je o patro níž:** `git log -15 --format=%an` → **15/15 „Runar Admin"**. Git sám autory
nerozlišuje, takže prefix nesl celou tíhu a při kolizi informace prostě zmizela.

**Oprava — každá session commituje pod svým jménem:**
```
git -c user.name='CODE-tune' commit -F <msg> -- <cesty>
```
Per-commit, **ne `git config`** — strom je sdílený a session by si config přepisovaly.
E-mail zůstává, takže atribuce na GitHubu se nemění.

**Hlídá to smoke ㉛ (`verify_commit_identity.js`) a je SAMOAKTIVAČNÍ:**
- fáze 1 (dnes): vypíše rozdělení autorů, **neblokuje** — blokovat cizí session za pravidlo,
  o kterém neví, by bylo nefér;
- fáze 2: jakmile se v historii objeví **všechny tři** identity, mechanismus žije a generické
  jméno u novějšího commitu je regrese → **blokuje**.
Nikdo si nemusí pamatovat, že se to má přepnout — což je přesně to, co se u téhle třídy vad
vždycky zapomene.

⚠️ **Dvě kopie té vyvrácené věty.** Stála v `CLAUDE.md` dvakrát (úvod sekce + „Komunikace"),
takže §20 platil i tady: opravit jednu by nestačilo. Obě přepsány.

**Doplněna struktura (KUKY 2026-08-18):** 3× CODE (tune · read · tree), ke každé **Cowork
symbiont**, se kterým se radí (Cowork-tune · Cowork-read · Cowork-tree). Cowork je read-only,
proto volnější; do repa píše výhradně přes svého CODE.

⚠️ **Co to NEřeší:** commity ze 17.–18. 8. pod `[tune]` zůstávají nerozlišitelné — historii
nepřepisuju. A dokud CODE-read a CODE-tree identitu nepřijmou, kontrola jen hlásí.

Affected doc(s): CLAUDE.md — v témže commitu.

## 2026-08-18 — CODE-tree identitu přijal (2/3); přechod na blokující otestován DŘÍV, než nastane

Handoffy doručeny, CODE-tree se podepsal: `git log --format=%an` má **2 lane ze 3**
(CODE-tune 1, CODE-tree 2). Chybí CODE-read.

**Proto se to testovalo teď.** Kontrola ㉛ se při 3/3 **sama** přepne na blokující — a ten
stav ještě nikdy neběžel. Kdyby byl vadný, zablokuje při dalším commitu **tři session naráz**
a nikdo nebude vědět proč. Rozbito v šesti stavech na syntetické historii:
```
0/3 nikdo                       → fáze 1, neblokuje    ✓
1/3 jedna lane + generické      → fáze 1, neblokuje    ✓
2/3 dnešní stav                 → fáze 1, neblokuje    ✓
3/3 bez generického             → prochází             ✓
3/3 + generické POZDĚJI         → BLOKUJE              ✓
3/3 + generické UPROSTŘED       → BLOKUJE              ✓
```
Šesté rameno je to podstatné: kontrola nesmí koukat jen na poslední commit, jinak by jí
generický podpis uprostřed dávky proklouzl.

⚠️ **Test sám měl vadu, kterou by nikdo nečekal:** `shutil.rmtree` na Windows neprojde přes
read-only soubory v `.git`, takže druhý stav spadl na „složka už existuje". Kdybych ho pustil
jen jednou, vypadalo by to jako chyba kontroly. Uklízeč teď shazuje read-only příznak.

Zůstává: **CODE-read**. Do jeho podpisu je ㉛ jen informativní.

## 2026-08-19 — ㉛ zablokovala všechny tři session. Moje chyba byla v TESTU, ne v nápadu

CODE-read hlásí hned po aktivaci: jeho první podepsaný commit (`1548c16`) přepnul ㉛ na
blokující a ta pak odmítla push **komukoli** — v okně 80 commitů leží **předkonvenční
generické commity**, které už jsou na originu a nikdo je neopraví bez přepsání historie.
Ověřeno reprodukcí na mém stromě: `exit=1`, mezi viníky i **můj vlastní** `0a14026`.

**Hlášení sedělo do detailu** — včetně seznamu šesti commitů i návrhu opravy. Beru ho celé.

### Co jsem udělal špatně, a není to ten nápad
Rozbil jsem to den předtím v **šesti stavech** a napsal, že přechod je otestovaný. Jenže
všech šest běželo na **syntetické historii, kde předkonvenční commity nebyly**. Stav
„aktivace nad EXISTUJÍCÍ historií" — jediný, který reálně nastane — mezi nimi nebyl.
**Test potvrdil, co jsem čekal, ne co se stane.** To je přesně ta vada, kterou §27 popisuje
u metrik, jen posunutá o patro výš: nástroj (test) prošel jen tím případem, kvůli kterému vznikl.

### Oprava
Soudí se jen commity, které vznikly **po zavedení konvence**. Předěl se **nepíše natvrdo** —
je to nejstarší commit nesoucí identitu lane (dnes `0d2abbc`); hash by zastaral při každém
rebase, tohle se spočítá samo. Vše před předělem je předkonvenční z definice.

Rozbito v **osmi** stavech, dva nové jsou právě ty chybějící:
```
G) předkonvenční generické PŘED předělem      → PROCHÁZÍ   (to, co blokovalo)
H) předkonvenční + generický i PO předělu     → BLOKUJE    (kontrola pořád funguje)
```
Bez H by z opravy byla tapeta: nestačí přestat blokovat, musí to dál chytat to, kvůli čemu
kontrola vznikla.

⚠️ **Poučení, které je širší než tenhle případ:** nová kontrola se musí rozbít **nad
skutečnou historií**, ne jen nad tou, kterou si k testu vyrobím. Syntetická data ukážou,
že logika dělá, co jsem napsal — ne že to sedne na svět, do kterého ji pouštím.

Zásluha za nález i za návrh opravy: **CODE-read**. Nepoužil `--no-verify`, počkal.

## 2026-08-20 — Neverzovaný soubor v `memory/` teď hlásí tomu, komu vznikl (Stop-hook, 3. kontrola)

KUKY: *„dá se s tím něco dělat?"* — po druhém případu v týdnu, kdy smoke ⑪ našla v `memory/`
soubor, který je v indexu, ale ne v gitu (19. 8. snapshot druhé session, 20. 8.
`work-efficiently-ask-if-simpler.md`).

**Kontrola ⑪ funguje. Chytá ale špatného člověka.** Spadne tomu, kdo zrovna pushuje něco jiného —
ten soubor nepsal, často ani neví, co v něm je, a autor je mezitím u jiné práce nebo po compactu.
⚠️ **Disciplínou se to nespraví:** auto-paměť ty soubory zapisuje SAMA (junction do repa), takže
session o tom často vůbec neví. Není co si pamatovat — je to posun v čase, ne v pozornosti.

**Oprava: Stop-hook, třetí kontrola téhož tvaru jako ty dvě předchozí.** Na konci tahu se ptá,
jestli v `memory/` neleží neverzovaný soubor, který vznikl **v téhle session**. Rozlišit „čí to je"
nejde (junction, společná složka), takže se použil týž vzorec jako u snapshotu — soubor **novější
než značka startu session**. Bystander se tím netrefí.

Rozbito v pěti stavech:
```
A) nic neverzovaného                      → prošel
B) neverzovaný, ale STARŠÍ než session     → prošel   ← cizí soubor NESMÍ blokovat
C) neverzovaný a NOVĚJŠÍ (můj)             → BLOK
D) týž stav podruhé                        → prošel   (blokne jednou za session)
E) po úklidu                               → prošel
```
Stav B je ten, kvůli kterému to má smysl: bez něj by nová kontrola dělala přesně to, co ⑪ —
jen dřív a stejně cizímu člověku.

**Co se tím NEruší:** smoke ⑪ zůstává. Hook chytá autora včas, ⑪ je poslední síto před pushem
(a chytne i to, co vzniklo mimo session — třeba ručně).

Affected doc(s): memory/working-style.md (sekce „Compact") — v témže commitu.

## 2026-08-20 — Obraz má dvě síta · návrhová vrstva dostala vlastní mapu

**Rozhodnuto (KUKY):**
1. **Ratifikována dvě síta na obraz** do `RUNAR_DESIGN.md` (sekce „Obraz — dvě síta").
   **A** = vada je v UMÍSTĚNÍ, ne v symbolu: obraz nesmí postavit tazatele dovnitř ochrany jako
   fakt, ani se obrátit v ponaučení. **B** = autentické ≠ současné: subsistenční severské obrazy
   vyjdou středověké nebo gore.
2. **Návrhová vrstva se odděluje od produkční mapy promptu** — dostala vlastní mapu
   (`docs/runar-engine-map.html`). Produkční mapa popisuje, jak Rúnar mluví DNES; engine mapa
   to, co ještě neběží. Každý blok engine mapy nese značku `NEPOSTAVENO`; při nasazení páky se
   ten blok maže, popisovat ji pak bude produkční mapa. Obě URL vlastní
   `memory/prompt-map-artifact.md`, druhý memory soubor nevzniká (§20).

**Proč síto A takhle a ne jako seznam rizikových symbolů:** dřívější znění (snapshot 2026-08-19)
tvrdilo, že symbol, jehož povaha míří na kánonovou čáru, potřebuje vlastní zákaz. Přegeneralizováno
ze dvou případů — a ani jeden ho neunese: **hvalreki** padá už na sítu B (mrtvá velryba = gore),
**landvættir** jde přeformulovat. Doklad, že přeformulování stačí: Algizova faseta „shelter that
doesn't ask to be thanked" držela i na nejtěžším obrazu. Černá listina by zbytečně zabíjela
použitelné symboly. Měření → `RUNAR_EVAL_LOG.md` 2026-08-19.

**Proč vlastní mapa a ne sekce v produkční** (KUKY: *„nechci aby se zamotali s těma co jsou jen
v návrhu"*): produkční mapa je jediný artefakt, jehož jediná odpověď zní „takhle to běží". Doc,
který odpovídá na dvě otázky, nevlastní čistě ani jednu.

**Vedlejší opravy v témž tahu:** `RUNAR_DESIGN.md` — 4 páky dostaly na řádek značku `NEPOSTAVENO`
a podmiňovací způsob (grep na „rozprostír" vracel 7 z 8 řádků, které se četly jako hotová věc) ·
opraven překlep „Runa má PODLE" → „POLE", jediná věta definující první páku · vyhozeno sporné číslo
„6–10 faset" (spec 6–10 vs měření 6–8 vs banka ≈ 6,4 — nedá se tvrdit, rozhodne owner).
`memory/prompt-map-artifact.md` — opravena nepravda „HTML zdroj mapy není v repu" (je,
`docs/runar-prompt-map.html`, git-tracked) a zaznamenán rozchod razítek v2.0 (repo) vs v2.1 (kód
i publikovaná mapa).

⚠️ **Rámec:** tohle NENÍ příprava produkce. Engine pestrosti je zkouška — generují se čtení a owner
posuzuje. Do produkce půjde, až owner řekne (KUKY 2026-08-20).

Affected doc(s): RUNAR_DESIGN.md · memory/prompt-map-artifact.md · memory/MEMORY.md — v témže commitu.

---

## 2026-08-21 — Runa se pojmenuje, oblast dava obraz, delka se losuje (migrace 1–5/5)

- **Typ:** hlas + prompt · **Scope:** `VOICE_PROFILES.focused`, `RP_SINGLE`, `_domainContext`,
  `ENDING_*`, `READING_ANGLES`, novy pool `LENGTH_BUDGETS` · **Zdroj:** KUKY („je to co jsem hledal")
- **Co se zmenilo (kazda zmena ma svuj duvod u sebe v kodu):**
  1. `focused` dostal pravidlo **„pojmenuj runu a uvaz k ni obraz"**. Duvod: obraz je pro toho,
     kdo runu nezna, necitelny — 119 z 240 produkcnich EN cteni runu jmenem zminilo a nikde
     nereklo, co je zac. Kvetnova staticka cteni to umela (14 z 28 EN).
  2. Z `noqBranch` pryc veta **„obrazem, ne vysvetlenim"** — zadavala opak toho, co zada
     pravidlo z bodu 1. EN model ji prebijel, IS poslouchal.
  3. Dve zakonceni a jeden anglicky uhel prepsany pod **caru podmetu** (podmetem vety smi byt
     runa, svet nebo obraz, nikdy vedomi ctenare).
  4. **Oblast zivota urcuje ZDROJ OBRAZU, ne cil tvrzeni.** Prepis znen srazil studene cteni jen
     islandsky; teprve zmena toho, CO se po modelu chce, srazila obe reci.
  5. **Delka je losovana paka** (3 nebo 4 vety), jen u single.
- **Namereno na produkci po migraci** (n=16 na jazyk, dva behy soudce):
  studene cteni EN **9–10/16 → 3–4/16**, IS **11/16 → 1–4/16** · „rekne smysl runy" EN **0/8 → 9/16** ·
  oblast jde ze cteni poznat stejne dobre jako pred zasahem (EN 7/16, IS 11/16; nahoda 2/16) ·
  delka kolisa 3 vety ×6 / 4 vety ×10 v obou recich.
- ⚠️ **Co se NEZLEPSILO:** islandske „rekne smysl runy" zustava na **2/16**. Pravidlo tam dochazi
  (overeno ⑧), ale model ho plni radove min nez anglicky. Neni to zpusobene migraci — bylo to tak
  uz u kandidata. Otevrene.
- ⚠️ **Co se netvrdi:** islandsky uhel [3] vysel v pruchodu jako vykyv, ale v anglictine je naopak
  nejcistsi a mechanismus k tomu neumim rict — pri n=8 se nesahalo.
- **Cestou opraveny dve vady v nastrojich:** ⑧ mela zneni pravidla `describe` opsane natvrdo
  (§20) a cervenala na zmenu, ktera byla v poradku; ve `VYJIMKY` v ㉚ byly dva klice `length`,
  pozdejsi prebijel drivejsi. Generator `gen_direct.js` prisel o ramena kandidatu — ty texty
  se PRESUNULY do produkce, takze v nem uz byly druhou kopii.
- **Affected doc(s):** `RUNAR_EVAL_LOG.md` (zaznam mereni + baseline k pristimu srovnani)
  — v temze commitu.
- **Reversibility:** easy (git; kazda z peti zmen ma vlastni commit).

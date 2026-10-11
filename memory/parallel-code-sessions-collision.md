---
name: parallel-code-sessions-collision
description: Jak se nepřepisovat s druhou Code session ve sdíleném stromě — pathspec commit, sdílený soubor přes commit_vlastni.py, status před sáhnutím
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 19d97179-39e7-4098-bebb-c437e7df8e6e
  modified: 2026-10-10T18:07:03.671Z
---

Repo běží s VÍCE Code session naráz ve **sdíleném pracovním stromě a sdíleném git indexu** (ne jen víc
lanes — víc session i uvnitř jedné lane). Dělení podle commit-prefixu (`[tune]`/`[tree]`) je hrubší než
realita: dvě session mohou být OBĚ `[tune]`. Kolize se dějí PŘED commitem — ve sdíleném stromě a v běžícím
procesu — kam git nevidí. Guard od CODE-tune (pre-commit) chytá jen NOVÝ scratch/lab add; přepis TÉHOŽ
souboru dvěma session neřeší nic než worktree.

**Proč (2026-07-18/19, tři případy jednoho druhu):**
- `git add` + **holý `git commit`** sebral CELÝ index → spolkl cizí `[tree]` change-set (runar-tree.js,
  smoke wiring, DECISIONS) do `[docsync]` commitu. Nic se neztratilo, ale historie lže o autorovi
  a prefix (tehdy jediný signál autora; od 2026-08-18 nese commit jméno session, smoke ㉛) se stal lží.
- **Pathspec NESTAČÍ na TÝŽ soubor** (`9c41906`): pathspec vybírá *soubory*, ne *hunky* — `runar-tree.js`
  commitne celý pracovní stav včetně cizích necommitnutých řádků. Napsal jsem 5 řádků, commit zapsal 58;
  `git blame` teď připisuje cizí `Affected doc(s)` slib mému commitu.
- **`git add -A <dir>` = stejně nebezpečné jako holý commit**: `git add -A v2` nastagoval 112 souborů
  (cizí untracked `tree-snapshots/`, `tree-lab-*/`, `sigil-lab/`). Commit zůstal čistý díky pathspec,
  ale index zůstal naložený → další commit kterékoli lane by je sebral.

**How to apply:**
- ⭐ **Commit je ve sdíleném repu hned venku — cizí push ho vynese dřív, než proběhne můj pre-push.** Kontroly, kterých se moje změna týká,
  pusť PŘED commitem: u docs a memory `node scripts/verify_doc_links.js`, u stromu ㉳. **Proč:** 2026-10-11 `1c418ae` (CODE-tree) měl v memory
  odkaz do prázdna; můj push zastavil pre-push, ale commit už na server vynesl push jiné session a smoke tam padal všem, dokud
  `571674d` neopravil. Že push „prošel“, ověřuj `git status -sb` (ahead 0) a výpisem pre-pushe, ne jen tím, že je commit na origin.
- ⭐ **Sdílený trackovaný soubor (DECISIONS, BACKLOG, DESIGN, memory) zapisuj a commituj přes `scripts/utils/commit_vlastni.py`** (od
  2026-10-11; od téhož dne to VYNUCUJE pre-commit — DECISIONS 2026-10-11 (23), třetí případ dfac200): `cv.cti()` + `cv.zapis(soubor, text, '<lane>')` místo vlastního zápisu, pak `python -X utf8 scripts/utils/commit_vlastni.py
  commit <lane> <zprava.txt>` a push. Commitne jen tvoje kusy z dočasného indexu (trojcestně proti HEAD), cizí necommitnuté zůstanou ve
  stromě; při překryvu s cizí změnou necommitne nic a řekne to (počkej, až ta session commitne). Nový soubor od jiného nástroje: `pridej`.
  **Proč:** 2026-10-11 `b4c3f4a` (CODE-tree) vzal záznam CODE-tune 2026-10-11 (5) a dvě jejich odškrtnutí v BACKLOGu, přestože pravidlo
  „kontrola a commit v jednom příkazu“ níž už stálo — porušeno podruhé (poprvé `c81b4da`) → CLAUDE.md §30: dělá to stroj. Test:
  `commit_vlastni.py --test` (16 stavů: cizí změna před i po mé, překryv, nový soubor, zastaralé čtení, cizí commit vzal i moje řádky).
- **Commit úzce přes pathspec** → CLAUDE.md „Commit ÚZCE“. Když nevíš, co je staged: `git diff --cached --name-only`.
- **Sdílený tracked soubor (DECISIONS, runar-app.js, CLAUDE.md, translations.js): `git diff --stat -- <f>`
  PŘED commitem.** Je-li počet větší než tvoje změna, přebytek je cizí — commitni ho vědomě a řekni to,
  nebo počkej, až to druhá session zaveze. NEopravuj, cos sebral — je to jejich lane, jejich slib.
  `RUNAR_DECISIONS.md` tuhle kolizi GARANTUJE: připisuje do něj každá lane. Vždy `git pull` → append → pathspec.
  **Kontrola a commit v JEDNOM příkazu** — 2026-10-10 (`c81b4da`): `git diff --stat` ukázal moje 4 řádky v BACKLOGu, o dvě
  volání později commit sebral 7 (CODE-read mezitím dopsal 3). Hlídat těsně před commitem, např.
  `test "$(git diff --numstat -- RUNAR_BACKLOG.md | cut -f1)" = "4" && git -c user.name=… commit …`.
- **Patch nástroj = vlastní slot session** → CLAUDE.md §1 / [[one-patch-script-path]].
- **`git status -- <path>` PŘED každým sáhnutím do tracked souboru** — a znovu před Write; stav se mění
  během session (gen_batch.js se z untracked stal tracked, protože ho druhá session mezitím commitla).
- **Necommitnuté změny ve sdíleném tracked souboru = živé riziko sebrání** — commitni je úzce brzy.
- **Necommitnutý rozhodovací záznam v `RUNAR_DECISIONS.md` BLOKUJE PUSHE VŠECH session** (2026-08-07). Smoke ⑮ (`verify_decisions_followthrough.js`) blamuje i necommitnuté entry → jejich `Affected doc(s)` nesedí v žádném commitu → pre-push padá KAŽDÉMU, ne jen tobě. Proto: (a) rozhodovací záznam commitni+pushni **HNED** (pathspec, týž turn), nenech ho viset; (b) **tree rozhodnutí piš radši do `RUNAR_TREE.md` (vlastní doc), ne do sdíleného DECISIONS** — vlastní doc jinou session neblokuje; (c) `git reset` commitu, co sáhl do DECISIONS, nechá entry **OSIŘET** v pracovním stromě = znovu blokuje — buď ho hned dotáhni čistě, nebo zkoordinuj; (d) na řádku `Affected doc(s)` u „—" NEuváděj název souboru (`.js/.md/.py/.json` → ⑮ ho vyzobne a spadne i na správném „žádný doc" záznamu). Detaily patří do těla záznamu.
- **Rozdělení commitu (`git reset` + přepis souboru) může cizí necommitnutou práci ZTRATIT, ne jen přepsat** (2026-08-09). Sebral jsem do `[tree]` commitu dva cizí `[sigil]` záznamy v DECISIONS. Rozdělil jsem to správně (commitnout jen svoje, cizí vrátit do stromu), ale po commitu byl soubor **čistý** — cizí blok zmizel ze stromu i z historie. Zachránila to jen kopie ve scratchpadu. **Než rozdělíš cokoli sdíleného: `cp <soubor> <scratchpad>` PRVNÍ**, a po commitu `git diff -- <soubor>` ověř, že cizí část je zpátky jako změna. „Vrátil jsem to" bez ověření = tvrzení, ne fakt.
- **Přepis TÉHOŽ souboru dvěma session odstraní JEN fyzické oddělení (`git worktree`)** — guard ani
  konvence to z principu neřeší. Owner worktree zatím odložil; do té doby je to pojmenovaná mez, ne díra.
- Historii nepřepisuj kvůli minulému případu — zapiš a jeď dál.
- Handoff/tvrzení druhé session o kódu je žádost, ne fakt — ověř proti HEAD ([[verify-agent-claims-about-code]]).

**PATHSPEC NECHRÁNÍ SDÍLENÝ SOUBOR (2026-08-24).** Pravidlo „commituj úzce přes
`git commit -F msg -- <cesty>`" chrání před sebráním **cizího souboru** — nechrání před
sebráním **cizí změny v TOMTÉŽ souboru**. Pathspec omezuje soubory, ne hunky: kdo commitne
`RUNAR_BACKLOG.md` první, vezme s sebou i rozepsané úpravy druhé session ve stejném souboru.

Doloženo: můj zápis zátěžové matice do `RUNAR_BACKLOG.md` skončil v commitu `2f5353a`
(CODE-tune, message o „TEST 38 stav cesty"). Obsah se neztratil — ztratil se **důvod** (§28):
`git log` u té změny tvrdí něco úplně jiného, než co v ní je. A `git log` je podle CLAUDE.md
akční log, takže lže na tom místě, kde se mu má věřit.

**Jak to nedělat:** okno vzniklo tím, že jsem soubor napsal, pustil `smoke.py` (dlouhé)
a commitnul až po něm. **Commituj HNED po editaci sdíleného docu; smoke až potom** — pre-push
ho stejně spustí znovu. U `RUNAR_BACKLOG.md` / `RUNAR_DESIGN.md` to platí dvojnásob, do nich
dnes píšou obě CODE session naráz.

**ZASTARALÉ PŘEČTENÍ SDÍLENÉHO SOUBORU (2026-09-08).** Ve stromě, kde commitují tři session,
**přečtený soubor zastarává během jedné konverzace**. Dvakrát v jednom dni jsem citoval ownerovi
něco, co už neplatilo: `RP_ASK.rules` „40 slov / vždy kratší než čtení" (mezitím **90 slov**
a ta klauzule **odstraněná**) a `RUNAR_PROMPT_VERSION` „v4.14-mynd" (mezitím **v4.15-ask90**).
Obojí změnila CODE-tune mezi mým přečtením a mou větou. Owner: *„tady je stále chyba."*

**Nejde o pravidlo, jde o návyk: než z produkčního souboru CITUJEŠ, přečti ho znovu.**
Ne „mám ho v kontextu" — kontext je snímek k času přečtení, ne stav repa. Platí zvlášť pro
`runar-character.js`, `runar-config.js` a proxy, do kterých sahá `[tune]` několikrát denně.
Levná pojistka před tvrzením o čísle nebo znění: `git pull` + čerstvý `grep` na tu jednu řádku.

**Rozdělaná úprava KONTROLY ve sdíleném stromě shodí push všem** (2026-10-10, CODE-read): pre-push smoke běží nad pracovním
stromem, ne nad commitem. Mezistav ㉸ (falešně hlásil komentáře) shodil CODE-tune push b2f50b7 — a obráceně jejich necommitnutý
`setRuneText` shodil můj. **Úpravu skriptu ve `scripts/` nebo `smoke.py` dolaď v kopii ve scratchpadu** (`node <kopie> --test` +
běh nad repem) a do stromu ji zapiš až hotovou, rovnou s commitem. Když tě shodí cizí rozdělaná práce: nepouštěj `--no-verify`,
napiš té session s výpisem a počkej.

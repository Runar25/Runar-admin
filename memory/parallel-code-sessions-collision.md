---
name: parallel-code-sessions-collision
description: Jak se nepřepisovat s druhou Code session ve sdíleném stromě — pathspec commit, patch do scratchpadu, status před sáhnutím
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 19d97179-39e7-4098-bebb-c437e7df8e6e
---

Repo běží s VÍCE Code session naráz ve **sdíleném pracovním stromě a sdíleném git indexu** (ne jen víc
lanes — víc session i uvnitř jedné lane). Dělení podle commit-prefixu (`[tune]`/`[tree]`) je hrubší než
realita: dvě session mohou být OBĚ `[tune]`. Kolize se dějí PŘED commitem — ve sdíleném stromě a v běžícím
procesu — kam git nevidí. Guard od CODE-tune (pre-commit) chytá jen NOVÝ scratch/lab add; přepis TÉHOŽ
souboru dvěma session neřeší nic než worktree.

**Proč (2026-07-18/19, tři případy jednoho druhu):**
- `git add` + **holý `git commit`** sebral CELÝ index → spolkl cizí `[tree]` change-set (runar-tree.js,
  smoke wiring, DECISIONS) do `[docsync]` commitu. Nic se neztratilo, ale historie lže o autorovi
  a prefix (jediný autor-signál, git podepisuje všechny „Runar Admin") se stal lží.
- **Pathspec NESTAČÍ na TÝŽ soubor** (`9c41906`): pathspec vybírá *soubory*, ne *hunky* — `runar-tree.js`
  commitne celý pracovní stav včetně cizích necommitnutých řádků. Napsal jsem 5 řádků, commit zapsal 58;
  `git blame` teď připisuje cizí `Affected doc(s)` slib mému commitu.
- **`git add -A <dir>` = stejně nebezpečné jako holý commit**: `git add -A v2` nastagoval 112 souborů
  (cizí untracked `tree-snapshots/`, `tree-lab-*/`, `sigil-lab/`). Commit zůstal čistý díky pathspec,
  ale index zůstal naložený → další commit kterékoli lane by je sebral.

**How to apply:**
- **Commit VŽDY úzce přes pathspec** (`git commit -F - -- <cesty>`), NIKDY holý `git commit` / `git add -A`
  / `commit -a` — berou celý index včetně cizí lane. Když nevíš, co je staged: `git diff --cached
  --name-only` a porovnej s tím, cos psal.
- **Sdílený tracked soubor (DECISIONS, runar-app.js, CLAUDE.md, translations.js): `git diff --stat -- <f>`
  PŘED commitem.** Je-li počet větší než tvoje změna, přebytek je cizí — commitni ho vědomě a řekni to,
  nebo počkej, až to druhá session zaveze. NEopravuj, cos sebral — je to jejich lane, jejich slib.
  `RUNAR_DECISIONS.md` tuhle kolizi GARANTUJE: připisuje do něj každá lane. Vždy `git pull` → append → pathspec.
- **Patch nástroj (`scripts/_patch*.py`) pro MŮJ scratch NEPATŘÍ do sdílené repo cesty** — do session
  scratchpadu (mimo repo, git ho nikdy nevidí). `scripts/_patch.py`=CODE-tree, `scripts/_patch_tune.py`=CODE-tune, ale
  i to kolabuje se dvěma session v jedné lane. Viz [[one-patch-script-path]].
- **`git status -- <path>` PŘED každým sáhnutím do tracked souboru** — a znovu před Write; stav se mění
  během session (gen_batch.js se z untracked stal tracked, protože ho druhá session mezitím commitla).
- **Necommitnuté změny ve sdíleném tracked souboru = živé riziko sebrání** — commitni je úzce brzy.
- **Přepis TÉHOŽ souboru dvěma session odstraní JEN fyzické oddělení (`git worktree`)** — guard ani
  konvence to z principu neřeší. Owner worktree zatím odložil; do té doby je to pojmenovaná mez, ne díra.
- Historii nepřepisuj kvůli minulému případu — zapiš a jeď dál.
- Handoff/tvrzení druhé session o kódu je žádost, ne fakt — ověř proti HEAD ([[verify-agent-claims-about-code]]).

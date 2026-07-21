---
name: parallel-code-sessions-collision
description: Jak se nepřepisovat s druhou Code session ve sdíleném pracovním stromě
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 19d97179-39e7-4098-bebb-c437e7df8e6e
---

Repo běží s VÍCE Code session naráz ve **sdíleném pracovním stromě** (ne jen víc lanes — víc
session i uvnitř jedné lane). Dělení podle commit-prefixu (`[tune]`/`[tree]`) je hrubší než realita:
dvě session mohou být OBĚ `[tune]` (eval-implementace i tier/translations spadají pod `[tune]`).
Kolize se dějí PŘED commitem — ve sdíleném stromě a v běžícím procesu — kam git nevidí.

**Proč:** 2026-07-19 jsem během jedné session třikrát málem sebral cizí rozdělanou práci:
`scripts/_patch.py` přepsaný `[tree]` lane pod rukama; `scripts/_patch_tune.py` už obsazený druhou
`[tune]` session (tester suffix); a dvě necommitnuté `[tune]` změny visící ve sdíleném stromě, které
by cizí `[tune]` commit sebral. Guard na prefix (CODE-tune postavil) chytá cross-lane (`[tune]` commit
sebral `[tree]` soubor), NE intra-lane (dvě `[tune]` session, týž soubor).

**How to apply:**
- **Commit VŽDY úzce přes pathspec** (`git commit -- <path>`), nikdy `git add -A` / `commit -a` —
  ty berou celý index včetně cizí lane. Viz [[commit-by-pathspec]].
- **Patch nástroj (`scripts/_patch*.py`) pro MŮJ scratch soubor NEPATŘÍ do sdílené repo cesty** —
  napiš ho do session scratchpadu. `scripts/_patch.py`=CODE-tree, `scripts/_patch_tune.py`=CODE-tune, ale i to
  kolabuje, když jsou v jedné lane dvě session.
- **`git status -- <path>` PŘED každým sáhnutím do tracked souboru** — ověř, že do něj druhá session
  zrovna nesahá. A znovu před Write — stav se mění během session (gen_batch.js se z untracked stal
  tracked, protože ho druhá session mezitím commitla).
- **Necommitnuté změny ve sdíleném tracked souboru = živé riziko sebrání** — commitni je úzce brzy,
  nenech je viset.
- **Jediné, co odstraní přepis TÉHOŽ souboru dvěma session, je fyzické oddělení (`git worktree`)** —
  guard ani konvence to z principu neřeší. Zatím owner worktree odložil.
- Handoff/tvrzení druhé session o kódu je žádost, ne fakt — ověř proti HEAD ([[verify-agent-claims-about-code]]).

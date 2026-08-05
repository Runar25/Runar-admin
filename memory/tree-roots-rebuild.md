---
name: tree-roots-rebuild
description: CODE-tree úkol (léto 2026) — přestavba kořenů stromu v crown-composer labu; zákon + co NEDĚLAT
metadata: 
  node_type: memory
  type: project
  originSessionId: 174bab46-0d9e-4850-99aa-cc0917e4046f
  modified: 2026-08-05T22:13:15.559Z
---

**MŮJ ÚKOL (CODE-tree, lane [tree]).** Vizuální engine Stromu života. Konkrétně teď: v labu
`build_crown_composer.py` (→ crown-composer.html) přestavět KOŘENY tak, aby platil zákon:

> **1 pramen = 1 runa = větev nahoru + kořen dolů (kořen = zrcadlo větve). Max 25 = 25 run.**

Kořen kreslí **branch-composer engine** (`buildBranch`, per-runa `RUNE_TUNE`), **vpletený do JEDNOHO tahu
s kmenem** (bezešvé napojení jako větev). Postup **po krůčcích, každý ověřit**, teprve pak port do
`build_tree_production.py` (produkce).

**Co KUKY NECHCE (opakovaně jsem porušil = velký vztek):**
- **NIKDY neshlukovat větve.** Od začátku mají být **rozprostřené** (emergence spread). Shlukování
  rodin/elementů „vedle sebe" = ŠPATNĚ. (2026-08-05 jsem to zavedl, rozbil korunu, musel revert.)
- **Neřezat/nezakrývat** symptom místo opravy příčiny.
- **Nerozbít, co funguje.** „Vezmi co funguje + přidej nové. Nic víc, nic míň."
- Netvrdit „hotovo/vím" od oka — [[measure-dont-eyeball]].

**Zjištěné mechaniky (držet):**
- Kořen `buildBranch` **BEZ `dev`** — `dev:0` zplošťuje per-runa tvar na svislý prut (všechny stejné).
  To byl dny hledaný bug.
- **Krok 1:** `trunkT.strandMax = maxMains` před `buildTrunk` → prameny = větve = max 25, žádné random
  „reinforce" prameny navíc. (Zapsáno v RUNAR_TREE.md §5.)
- **Krok 3:** bázi hledat od VRCHU (backward scan) → trunk-engine vlastní kořen se vždy vyloučí;
  composer kořen-spine reversed + kmen = jeden tah. + vypnuté minor floatery.
- **Retence už funguje** (větve/kořeny přibývají s čtením do 25, born-visible) — nestavět znovu.
- ⚠️ **Cache:** crown-composer.html se NEcachebustuje → po každém rebuildu **tvrdý reload
  (Ctrl+Shift+R)**, jinak owner vidí STAROU verzi. Zdroj mnoha „je to pořád stejné".
- Debug: tlačítko „DEBUG zdroj" obarví kusy podle zdroje (klik → zdroj + strand#).

Souvisí: [[measure-dont-eyeball]] · [[runar-tree-living-movement]] · [[decisions-are-directions-not-locks]] · [[dont-invent-fact-critical]]

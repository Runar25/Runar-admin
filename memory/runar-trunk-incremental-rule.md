---
name: runar-trunk-incremental-rule
description: "KUKY chce přírůstkové změny na schválené verzi kmene, ne přepisy; snapshot před každou větší změnou"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 174bab46-0d9e-4850-99aa-cc0917e4046f
---

U Rúnar tree composerů (zvlášť Trunk Composer): když KUKY schválí podobu
("to vypadá moc dobře"), další požadavky jako "přidej twist" znamenají
**přírůstkovou změnu NA TÉ verzi** — NE přepis celého layoutu. 2026-06-12 jsem
na "přidej twist" přepsal celý kmen na radiální layout → KUKY rozzlobený
("ty jsi úplně předělal ten kmen?? vrať to zpět!!!").

**Why:** Iterujeme k jedné konkrétní podobě, kterou hledáme po mnoha prototypech.
Přepis zahodí to, co už sedělo. KUKY: "z té předešlé verze máš vycházet."

**How to apply:** (1) Před každou větší změnou composeru udělej SNAPSHOT
(kopie do v2/tree-snapshots/<name>/ včetně build_*.py) — neměl jsem ho a
zachránila to jen historie konverzace. (2) Nové featury (twist apod.) přidávej
jako opt-in slider default 0/nízko, aby base zůstala identická se schválenou
verzí. (3) Když si nejsem jistý rozsahem, zeptej se "přidat na tuto verzi, nebo
přestavět?" než sáhnu na hotový layout. Schválená verze kmene (lane-based one-body
+ per-element věk) je zálohovaná v v2/tree-snapshots/trunk-good/. Viz [[runar-tree-engine-lab]].

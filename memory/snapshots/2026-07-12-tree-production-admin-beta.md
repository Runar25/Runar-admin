# Snapshot 2026-07-12 — Tree of Life NASAZEN do produkce (admin-only beta) + 2 otevřené bugy

## Kde jsme
**Crown-composer „strom života" je NASAZEN v produkčním readeru** (Tree tab), free-solo, **admin-only beta**.
Deploy: commity `bceec07` [tree] + `696af77` [docsync], pushnuto na `main` → `runar25.github.io`.
Admin ho vidí naživo (potvrzeno KUKYm: zobrazí se založení „You carry life rune Gebo" + kmen). Non-admin skryté.

Kompletní arc (v RUNAR_DECISIONS.md + [runar-tree-engine-lab.md](runar-tree-engine-lab.md)):
crown-composer = KUKYho schválený „pěkný strom" (NE liana). Reading-driven (kroky 1–5): element→barva+rodina ·
spread · intention→výška · area→strana · aett→charakter · **stabilní umístění** (append-only, 0 skoků) · pozorovatelnost.
Pak **produkce**: modul `v2/runar-tree-prod.js` (gen. `build_tree_production.py`, §1) + enginy `runar-trunk.js`/`runar-branch.js`
(z `tree-lab-*` cest) + `renderLivingTree()` v `runar-tree.js` (patch `add_living_tree.py`).

## Klíčové soubory / funkce
- `v2/runar-tree-prod.js` — `RunarTreeProd.render(canvas, {log, rune, dob})`. Gen. `build_tree_production.py`. Modul OK (ověřeno standalone: renderuje, založení, aett, glyf-cesta).
- `v2/runar-tree.js` — `renderLivingTree(rune)` (async, **admin gate** `isAdmin`, čte DB) + `readingsToTreeLog(rows)` (mapování). Patch `add_living_tree.py`. Volá se v `updateTreeTab()` po `hasDob`.
- `v2/runar-reader.html` — 3 engine skripty (trunk/branch/prod) + `<canvas id="tree-living-canvas">` v `#apane-tree`.
- `v2/runar-app.js` — Coworkův `recordTreeReading` (localStorage `treeLog`) = **REDUNDANTNÍ** (strom čte z DB `readings`, ne localStorage). Jeho 2 DB opravy (intention sloupec + reálná spread-area) = ještě NEhotové → doplní signál.
- Snapshoty: `v2/tree-snapshots/prod-step3..4`, `crown-step1..5`.

## ✅ BUGY OPRAVENY (2026-07-12, commity 3067af9 + 460b0f3, SW v170)
**BUG 1 — čtení se nenačetla → FIXED (`3067af9`).** Root cause NEbyla glyf-extrakce (ta OK: single glyf v `rune_glyph`, spready v `short_text`). `renderLivingTree` řadil `readings` podle `created_at`, ale sloupec je `drawn_at` (journal to dokazuje) → PostgREST error → `res.data=null` → prázdný log → holé založení. Fix = `.order('drawn_at', {ascending:true})`. Diagnóza paralelním Workflow vyšetřením (journal vs tree dotaz se lišily jen ORDER sloupcem).

**BUG 2 — jméno stromu zůstávalo v poli → FIXED (`460b0f3`).** `saveTreeName` zapsal do DB + bliknul toast, ale nikdy nepřekreslil input. Fix (KUKY volba „nechat dole, jen fix"): po uložení swap input → read-only „YOUR TREE / <jméno> · edit". Jediný zdroj = `currentUser.tree_name`. Nové `_renderTreeNameState()`/`editTreeName()`, `fetchUserProfile` ukládá+renderuje, reader.html edit/display view, 3 překlady (EN+IS). Ověřeno v preview (stavy + styly). Detail obou → RUNAR_DECISIONS.md 2026-07-12 (2 bug fixy).

⚠️ **Deploy stav:** oba commity jsou LOKÁLNÍ (push na `main` čeká na KUKYho „pushni" — auto-mode blokl push bez explicitního svolení). Po pushi: SW v170 busteruje cache (lokálně preview servíroval stará translations.js/reader.css z cache; soubory na serveru ověřeny čerstvé).

## Zbývá (po bugách)
- Live-update stromu hned po čtení (dnes při otevření tabu).
- Cowork 2 DB opravy (intention + reálná spread-area) → plný signál výška/strana.
- Na launch: **vypnout admin gate** (1 podmínka v `renderLivingTree`).
- Volitelně per-runa sub-větve; anti-drift debt (§18): lab+prod sdílí kompozici kopií → shared `runar-tree-core.js`.

## Prostředí / gotchas
- Tree lab render: preview_screenshot sekne na velkém stromu → canvas `toDataURL` → POST `localhost:7799` (`_savepng.js`) → čti `_tree_shot.jpg`. State helper `_savestate.js` na 7798 (serve.bat).
- Preview servery (reader2 na 7791) padají idle → restart. Node `--check` = spolehlivá brána na JS.

---
name: tree-roots-rebuild
description: Strom — větve nikdy neshlukovat (rozprostřené od začátku), symptom neschovávat; kořen s dev:0 byl svislý prut; po rebuildu labu tvrdý reload
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 174bab46-0d9e-4850-99aa-cc0917e4046f
---

Co z léta 2026 (přestavba kořenů v labu) platí dál a nebydlí jinde. Stavbu stromu (ramena, vedlejší větve, prameny, kořeny a kolik čeho)
vlastní `RUNAR_TREE.md` §3 a kód (`slotAssign` v `build_crown_composer.py`) — sem se neopisuje.

- **NIKDY neshlukovat větve.** Od začátku rozprostřené; shlukování rodin nebo elementů „vedle sebe“ je špatně. **Proč:** 2026-08-05 jsem to
  zavedl, rozbilo to korunu a musel jsem vracet; owner kvůli tomu opakovaně zuřil.
- **Neřezat ani nezakrývat symptom** místo opravy příčiny.
- **Kořen z `buildBranch` s `dev:0` vyšel v létě 2026 jako svislý prut** (per-runa tvar se zploštil, všechny kořeny stejné; dny hledaný bug).
  Kořen vrcholu má dnes směr rovně dolů — vypadal-li by jako prut, hledej nejdřív tady.
- **Po rebuildu labu tvrdý reload (Ctrl+Shift+R)** — `crown-composer.html` se necachebustuje a owner jinak vidí starou verzi („pořád je to
  stejné“). Debug: tlačítko „DEBUG zdroj“ obarví kusy podle zdroje.

Jak měnit: [[runar-trunk-incremental-rule]] · měřit, ne od oka: [[measure-dont-eyeball]].

**Proč zkráceno (2026-10-11, nález CODE-read):** stál tu „zákon 1 pramen = 1 runa, max 25 = 25 run“ a „můj úkol teď“. Zákon od 2026-09-28
neplatí (stavbu vlastní `RUNAR_TREE.md` §3), úkol je dávno hotový a mechaniky kroků 1–3 drží `RUNAR_TREE.md`.

---
name: shrine-admin-not-lab
description: "runar-shrine.html je admin, ne lab — změny čtení se tam netestují a `teach` píše rovnou do produkce (runar_static_audio)"
metadata:
  type: reference
---

*Přesunuto z `working-style.md` 2026-11-25 (audit nositelů pravidel): ukáže se při dotyku shrine (mapa „UI readeru a shrine“).*

⚠️ **„V2 lab“ v shrine NEEXISTUJE od 2026-07-10** (commit `c6eb89c`) — změny čtení se v shrine netestují; `#reader-setup`,
`#reader-rune-card` ani `#reader-output` tam nejsou. Které taby shrine má, říká `showTab(` v `runar-shrine.html`.

⭐ **`teach` NENÍ testovací plocha — píše do produkce.** `invokeRunar()` vygeneruje statické čtení runy a uloží ho do `runar_static_audio`;
appka ho pak servíruje uživatelům v Kolekci (`loadCollection()` v `runar-app.js`). Změna promptu se v shrine neozkouší, ale rovnou projeví —
a jen pro runy, které tam někdo znovu vygeneruje.

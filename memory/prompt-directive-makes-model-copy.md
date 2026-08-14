---
name: prompt-directive-makes-model-copy
description: "Instrukce, která říká „použij tenhle text\", donutí model text OPSAT doslova — vkládaný materiál rámuj jako ZDROJ, ne jako text k použití"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-14T20:06:50.165Z
---

Když prompt vkládá hotový text (obraz, formuli, příklad), **rozhoduje sloveso kolem něj**,
ne ten text. Rámuj ho jako **zdroj** („nech obraz přijít odsud"), nikdy jako **příkaz
k použití** („použij tenhle"). Rozdíl je měřitelný a velký.

**Doloženo (2026-08-14, IS, 25 run, táž metoda):** zkrátil jsem vkládací větu obrazu z
52 slov na `MYND — ef mynd birtist í lestrinum, **notaðu þessa**: <obraz>.` Doslovné
opsání celého obrazu vyskočilo **12 % → 56 %** (nejdelší doslovný úsek 34 % → 73 % fráze),
**Fisher exact p = 0,002**. `notaðu þessa` = „použij tenhle". Model poslechl.
Staré znění obraz rámovalo jako zdroj („nech ji přijít z téhle islandské sezóny — X").

Je to táž rodina jako rúnaþula (2026-08-09): **hotová citovaná věta se přenáší doslova**,
ať v ní stojí cokoli (měřeno 2/2). Tady navíc: i pouhá výzva „použij" stačí.

**Jak to použít:**
1. Vkládáš do promptu hotový text? Napiš sloveso zdroje (`koma héðan`, `eiga rót hér`,
   `let it come from this`), ne příkaz (`notaðu`, `use this`, `say`).
2. Po KAŽDÉ změně takové věty změř doslovnost zavedenou metodou
   (`scripts/utils/measure_readings.js`, řádek „papouškování obrazu"). Golden ani lint to
   nechytí — ověřují tvar promptu, ne chování modelu ([[measure-dont-eyeball]]).
3. Zkrácení promptu je zisk, ale **není zadarmo**: kratší věta má míň místa na rámování
   a snadno sklouzne k rozkazu. Vada se dá vyměnit za jinou.

**Co to NENÍ: délka promptu (vyvráceno 2026-08-14).** Nabízelo se, že islandský prompt
opisuje, protože zhubl. Test byl obrácený a levný: je-li viník délka, **další zkrácení musí
opisování zvednout**. Zkrátil jsem IS čtecí prompt o 509 znaků (−17 %) → 32 % **→ 24 %**,
Fisher **p = 0,75**, navíc opačným směrem. A EN má skoro stejně dlouhý čtecí prompt
(321 vs 307 slov) i **kratší** systémový (681 vs 781), přesto opisuje 9 % proti 32 %.

Metoda, kterou to padlo, má vlastní záznam → [[falsify-by-reversing-the-lever]].

**Pracovní vysvětlení místo délky:** slabší jazyk modelu → podanou hotovou větu použije místo
vlastní. Směr opravy je proto **rozbít hotovost** vkládaného textu (fragmenty místo věty).

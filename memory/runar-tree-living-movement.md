---
name: runar-tree-living-movement
description: Rúnar strom — živý pohyb větví (ne skok) + model založení (Norns=kořeny)
metadata: 
  node_type: memory
  type: project
  originSessionId: 174bab46-0d9e-4850-99aa-cc0917e4046f
---

Potvrzeno s KUKYm 2026-06-15 v Founding Ritual labu (`v2/tree-lab-ritual/`, build_ritual.py). Doplňuje [[runar-tree-engine-lab]] a kanonický RUNAR_TREE_BUILD.md.

**KLÍČOVÉ (2026-06-16): ritual = crown-composer engine, NE vlastní.** KUKY opakovaně (4×) trval: `tree-lab-ritual/ritual.html` MUSÍ být `tree-lab-crown-composer` engine 1:1 (emergence skeleton / strand→větev spojitá limba / growBranch / kořeny / růst s věkem / paintLimb), jen **driver = reálná čtení** místo TREE AGE slideru + simulovaného routingu. Driver: `realAge = log.length × crownT.growthPerCast` (kmen roste od semenáčku); `routingFromLog` = element mix z reálného logu místo `routing(seed,nR)`. NEDĚLAT vlastní per-reading/relaxační engine — to byly slepé uličky, co ho rozčílily.  <!-- doc-links:ok -->

**Model založení:** life rune (z DOB) = KMEN. První **Norns = baby strom** = 3 zakládací prameny crown-composeru → 3 malé korunní výhonky (oheň/země/voda dle 3 Norn) + kořeny. NE holé kořeny/klacek (to byl můj omyl). "Roots = extension of branches" = prameny jdou kořen→kmen→výhonek. **Každé další čtení** zvyšuje věk → strom roste (víc pramenů→větví, vyšší, element mix z logu). **Yggdrasil = roční rituál, NE založení.**

**Živý pohyb (KUKYho mechanismus, zatím ODLOŽEN — base = crown-composer):** strom = spojitá funkce historie; nová runa DEFORMUJE, nikdy nepřelosuje. ❌ skok. ✅ posun/ohyb/zavlnění, tuhost podle věku (mladá pružná → migruje do volného místa, stará dřevnatí). Hlavní síla = rozestup. Crown-composer sám roste s věkem (spojitě); explicitní relaxační/flex vrstvu přidat až KUKY schválí crown-composer base. **Wishlist:** animace "přehraj růst" (deterministický log → interpolace mezi stavy).

**SMĚR DALŠÍ FÁZE (schváleno 2026-06-17) → RUNAR_TREE_BOUGHS.md:** přechod z element-témat na **per-runa = HIERARCHIE RAMEN.** Kmen → ≤5 elementových ramen → runy se odštěpují v místě své Norns zóny (vedoucí runa = nejvíc čtení vede dál, slabší se oddělí dřív = organický růst do šířky) → twigy. Řeší hlukování (9 prutů z vrcholu) + regresi do středu (zóna = poloha NA rameni) + dává roli vazbám/silám (kdo s kým cestuje, kdy se oddělí). Engine-safe: `growBranch` UŽ je rekurzivní → děti dostanou VÝZNAM (konkrétní runa), kreslení netknuté. Větev = runa (≤25), síla = počet čtení. Stavět na KOPII po doladění (KUKY ladí v chatu na cestách). Klíčový test: rozdělí se rameno na 2 organicky? Otevřené: seskupení (element vs vazby), zóna (dominantní vs recency), směr ramene (area vs čas urð↔skuld). Souvisí: runar_strom_koncept.md (základ §1), runar-tree-forces.md (síly).

**Pravidlo práce (tvrdé):** Crown-composer ENGINE (growBranch / spojitá limba pramen→větev / fraktál / paint) se NESMÍ rozbít. Změna smí měnit JEN „kam" větev vyjde (emergence frac, úhel), NE „jak" se kreslí. Změna sahající k enginu = minimální + OTESTOVAT (engine drží? = continuous limby + fraktál, ne chaotický chumáč tenkých větví) PŘED „hotovo" + snapshot. Když by změna engine rozbila → STOP, najít bezpečnou cestu. **Per-čtení větve (1 čtení = 1 limba na povrchu kmene) engine ROZBILY → zahozeno.** Norns osa udělána bezpečně jako posun výšky (zoneBias blend, 0=engine). Snapshoty: `v2/tree-snapshots/ritual-stable-v2` (engine+bod1), `ritual-stable-v3` (engine+Norns zoneBias). Stránka má `build <unixts>` vlevo dole (cache diagnostika) + no-cache. Viz [[runar-trunk-incremental-rule]].

---
name: glyph-text-vs-our-svg
description: "Text o tvaru runy ověř proti NAŠÍ kresbě (runeSvg), ne proti standardnímu tvaru Elder Futhark — vykresli ji v prohlížeči do ASCII mřížky"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-30T02:45:46.603Z
---

Popis vzhledu runy (Kolekce, návod, copy) musí sedět na to, co člověk vidí v aplikaci — kresbu `RUNE_SVGS`
přes `runeSvg()`, ne na učebnicový tvar nebo Unicode znak.

**Why:** 2026-09-30 jsem psal 25 popisů tvaru (bod 5 ownera) podle standardních tvarů. Kontrola proti naší kresbě
našla dva rozdíly: **Ingwaz** je u nás kosočtverec, jehož strany přesahují horní a dolní roh a kříží se tam (ᛝ na
výšku), ne holý ◇; **Uruz** má šikmý jen krátký horní úsek, pak rovnou nohu. Text „a small closed diamond“ by stál
vedle kresby, která tak nevypadá. Viz [[measure-dont-eyeball]].

**How to apply:** screenshot panelu prohlížeče tu bývá černý a Python SVG renderer nemá. Funguje JS v otevřené
stránce: `runeSvg(r, {frame:false})` → `Image` z `Blob` (image/svg+xml, `currentColor` → `#000`) → canvas 120×120 →
mřížka 24×24 podle alfa kanálu → řádky `#`/`+`/`.` jako text výsledku. Stačí na tahy, šikmé úseky i přesahy.

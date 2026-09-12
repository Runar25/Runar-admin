---
name: rekni-kterou-variantu-testujes
description: "Než pustíš test, napiš jednou větou, kterou variantu testuje a kterou ne — a ta varianta musí stát v docu"
metadata:
  node_type: memory
  type: feedback
---

**KUKY 2026-09-12: „všechno jsme měli prodiskutované a teď jsme měli už jen testovat."** A pak:
*„kolik variant máš zapsaných?"* · *„tohle není V3."* · *„stojíme stále na začátku."*

**Co se stalo:** v jednom dni jsem dvakrát otestoval jinou variantu Vegvísiru, než o které byla
řeč — nejdřív obrácenou (rameno vlastní obraz místo životní runy), pak s chybnou definicí středu
(celé čtení životní runy místo chůze ve variantách). Příčina nebyla v testu, ale **v tom, že
rozhodovací prostor žil jen v chatu**: nálezy jsem zapisoval pečlivě, varianty a jejich definice ne.
O hodiny později jsem je nemohl dohledat, tak jsem je postavil znovu — jinak. A chybnou definici
jsem si pak do tabulky zapsal sám a podle ní testoval.

**Jak to aplikovat:**
1. **Před každým testem jedna věta nahlas:** „testuju variantu X (definice: …), netestuju Y."
   Kdyby tahle věta padla, owner by omyl chytil v první zprávě.
2. **Ta varianta musí stát v docu** (`RUNAR_BACKLOG.md`, tabulka variant Vegvísiru) — a definici
   čti odtamtud, ne z paměti konverzace.
3. **Varianty ≠ nálezy.** Když owner rozhodne mezi možnostmi, zapiš volbu i to, mezi čím se volilo.
4. **Nepředkládej předpověď jako fakt.** („kdyby to padlo na rameno, střed by se rozdrolil" — neměřeno.)
5. **Test pro Vegvísir se staví z JEHO rámce, ne z produkce.** Vegvísir není spread ani produkční Ask —
   produkční pravidla pro něj neplatí. KUKY 2026-09-12 (potřetí týž den): *„Vegvísir má určitou strukturu,
   ty jsi ji úplně ignoroval… vymyslel jsem pičovinu, kterou nikdo nechtěl."* Owner chtěl otázky z produkce
   jako VZOR formulace pro Isu a Perth; já jsem pustil produkční Ask prompt bez chůze životní runy a přidal
   otázku na práci. Věta „testuju produkční Ask" padla — ale nezkontroloval jsem ji proti RÁMCI v BACKLOGu.
Souvisí: [[ownerovo-slovo-neni-spec]] · [[measure-dont-eyeball]] · [[find-a-gap-close-it-now]].

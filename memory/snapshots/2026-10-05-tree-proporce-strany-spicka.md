---
name: 2026-10-05-tree-proporce-strany-spicka
description: CODE-tree 2026-10-03→05 — koště a jeho oprava (obrázek 4), kmen roste s rozpětím ramen, ramena na stejné straně, čtení KUKYho stromu z dat (strany 9:4, Raidho nahoře) a co čeká
metadata:
  type: project
---

**Historický záznam k 2026-10-05, ne popis dneška.** Pravda o kódu = `build_crown_composer.py` + `git log`, rozhodnutí =
`RUNAR_DECISIONS.md` 2026-10-03 (15), (16) a 2026-10-05 (4), otevřené = `RUNAR_BACKLOG.md` (sekce strom).

## Co se stalo
- 2026-10-03: oprava překryvů (vějíř, tvar ramen, 30 px mezi všemi rameny, podlaha k 10 %) udělala z jeho stromu **koště**.
  KUKY vybral obrázek 4: ranní tvar ramen, vějíř pryč, 30 px jen na stejné straně (levo-pravo 15), kmen povyroste místo sjíždění
  podlahy; povýšená se od matky stočí rychle. Poučení → memory [[break-your-own-work-before-reporting]] bod 7.
- 2026-10-05: KUKY „strom musí růst do výšky s tím, jak roste do šířky“ → kmen ≥ `hwRatio` (0,75) × rozpětí ramen; „oprav i ty dvě
  ramena na stejné straně“ → s blízkým sousedem nad sebou se rameno odkloní dřív (nejvýš o 30 %) a spodní nesmí být strmější.
- Pak: „v čem máš pokračovat? všechno zatím zapiš … je to už celkem dobrý“ + „přečti mi strom z dat“. **Kód se dál neměnil.**

## Čtení jeho uloženého stromu (280 čtení, `scripts/utils/tree_read.js`)
- 14 ramen na kmeni (vůdčí Dagaz + 13), 11 povýšených, 100 větviček; strom 855 px vysoký, koruna 831 px (výška/šířka 1,03),
  v labu zmenšený na 63 %.
- **Strany:** vlevo 9 ramen + 6 povýšených (243 čtení), vpravo 4 + 5 (115); jeho oblasti stranu nepřevažují (nitro 98 · svět 95).
  Příčina = vada: kostra vyvažuje i povýšené, které od 10-03 rostou na straně matky → BACKLOG. Raidho překlopené doleva podle čtení
  (nitro 15 · svět 2) — to je záměr.
- **Špička:** Dagaz (zakládací skuld) rovně vzhůru, tíha nahoru (budoucnost), bez povýšených. Pod ním Raidho 89 % (L), Algiz 81 %
  (L, budoucnost), Berkana 76 % (P, budoucnost), Isa 72 % (L) → horní část převážně vlevo; vpravo nahoře povýšené Raidha
  (Ansuz, Wunjo, 11–21° od svislice). **Raidho tam nepatří:** všech 24 čtení o minulosti; narodilo se v 7. čtení do jediné volné
  mezery nahoře a pořadí se nemění → BACKLOG. Totéž Uruz (minulost 64 %), Eihwaz (budoucnost 47 %).
- Souběhy na jeho stromě: jen povýšená podél matky (Hagalaz/Odinn 41 px, Fehu/Tiwaz 23 px) → BACKLOG.

## Nástroje (repo)
`scripts/utils/tree_read.js` (strom z dat) · `scripts/utils/tree_render.js` (stromy vedle sebe do PNG, 4. pole = počet čtení)
· `scripts/utils/tree_overlap.js` (souběh vs. protnutí) · smoke ㉳ (strany, podlaha, klik, inspekce). Scratch varianty a měřiče
(ovtypes, sweep4, kuky_prefix, zoom_*) byly ve scratchpadu session 174bab46 — nepřežijí; generátor modelových logů je v nich
i v `verify_tree_mista.js`.

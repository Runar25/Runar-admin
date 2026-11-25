---
name: protokol-externi-dokumenty
description: "Protokol pro externí dokumenty (patche, design docy): jak je přijímat a kam zapsat"
metadata:
  type: feedback
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Protokol pro externí dokumenty (PATCHES, DESIGN DOCS, atd.)
Když uživatel přinese soubor zvenku (@soubor nebo obsah vložen do chatu):

1. PŘEČÍST celý dokument — žádné zkratky
2. AUDIT: Co z toho už je v kódu? Co je jen design? Co je nové rozhodnutí?
3. ZAPSAT do správných souborů:
   - Rozhodnutí → RUNAR_DECISIONS.md · příkazné pravidlo → CLAUDE.md (§16, §28)
   - Tree (model, zóny, signály, Gathering) → RUNAR_TREE.md · vzhled → RUNAR_TREE_RENDER.md · úkoly → RUNAR_BACKLOG.md
   - Stack, soubory, DB, tier → CLAUDE.md („Soubory") + `runar-config.js` (sklad „shrnutí všeho“ zrušen 2026-07-18, §20)
   - Workflow, coding rules → working-style.md
4. Implementovat co jde BEZ stromu/DB — datové definice do kódu
5. Co čeká → RUNAR_BACKLOG.md (stav nepatří do CLAUDE.md ani paměti, §20.4)
6. Říct co bylo zapsáno kam a co čeká na implementaci

NIKDY nepředpokládat že obsah dokumentu je zachycen jen proto, že jsme o něm mluvili.
Kontext v chatu zmizí při /compact — důležité musí být v souborech.

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
   - Rozhodnutí + pravidla → CLAUDE.md (repo)
   - Tree (model, zóny, signály, Gathering) → RUNAR_TREE.md · vzhled → RUNAR_TREE_RENDER.md · úkoly → RUNAR_BACKLOG.md
   - Stack, soubory, DB, tier → CLAUDE.md („Soubory") + `runar-config.js` (runar-project.md je prázdný, §20)
   - Workflow, coding rules → working-style.md
4. Implementovat co jde BEZ stromu/DB — datové definice do kódu
5. Označit co čeká — v CLAUDE.md nebo memory souboru
6. Říct co bylo zapsáno kam a co čeká na implementaci

NIKDY nepředpokládat že obsah dokumentu je zachycen jen proto, že jsme o něm mluvili.
Kontext v chatu zmizí při /compact — důležité musí být v souborech.

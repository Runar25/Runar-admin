---
name: pathspec-nesmi-byt-prazdny
description: Commit s pathspec v proměnné, která se nenastavila (přiřazení v && řetězci, který spadl), commitne CELÝ index — i cizí staged soubory
metadata:
  type: feedback
---

**Vzor vady:** `kontrola && P="…" && git add -- $P; git commit -F msg -- $P`. Když `kontrola` selže, `P` se
nenastaví, `;` pustí commit dál a `git commit -F msg --` s prázdným pathspec vezme **celý index**.

**Why:** 2026-09-24 smoke ㉩ zastavil řetězec (duplicitní číslo v DECISIONS), commit `26db44c` pak nesl zprávu
o nálezech, ale obsahoval jen soubor, který zrovna ležel v indexu. Ve sdíleném stromě tří CODE session by
stejně dobře sebral cizí staged změnu (viz [[parallel-code-sessions-collision]] — tak vznikl downgrade sw.js).

**How to apply:** pathspec přiřaď **na samostatném řádku před** jakoukoli kontrolou, nebo celý blok ukonči
`|| exit 1` po každé kontrole; commit nikdy za `;` po řetězci, který může spadnout. Před pushem přečti, co
commit opravdu obsahuje (`git show --stat HEAD`) — [[read-the-check-before-push]].

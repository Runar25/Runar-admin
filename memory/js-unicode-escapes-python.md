---
name: js-unicode-escapes-python
description: "JS soubory s \\uXXXX escapy rozbíjejí pattern matching v Python patch skriptech — jak na to"
metadata:
  type: feedback
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## JS unicode escapes v souborech = problém pro Python pattern matching
Soubory mohou mít mix: literální UTF-8 (`RÚNAKORT`) i JS escape sekvence (`RÚNAKORT`).
Python čte `Ú` jako 6 ASCII znaků (ne jako Ú). Bezpečný přístup při opravě neznámé řádky:
```python
# NIKDY nehádej — najdi a nahraď celou řádku
pos = c.find('unique-id-or-unique-string')
line_start = c.rfind('\n', 0, pos) + 1
line_end   = c.find('\n', pos)
old_line = c[line_start:line_end]   # přečti repr() pro ověření
c = c[:line_start] + new_line + c[line_end:]
```

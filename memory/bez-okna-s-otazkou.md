---
name: bez-okna-s-otazkou
description: Owner nechce na konci zprávy okno s otázkou a tlačítky (wrap_up ask/actions) — otázky patří číslovaně do zprávy
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1eb06694-9b7a-4085-9109-b701a8016683
  modified: 2026-11-27T17:31:21.315Z
---

Na konci tahu volat wrap_up jen s recapem, **bez `ask` a `actions`**; otázky, na které chci odpověď, napsat číslovaně do závěrečné zprávy.

**Why:** owner 2026-11-27 (Rúnar V4): *„proč mi na konci posíláš dotazník, jestli ano, nebo něco jiného. Přijde mi to zbytečné. Napíšeš otázky,
na které chceš odpověď; to okno mě jen rozptyluje.“*

**How to apply:** platí pro všechny zprávy ownerovi. Každá otázka v textu zvlášť, s „?“ (Stop hook to hlídá). Ptát se jen na to, na co
odpověď opravdu potřebuju — owner už jednou nevěděl, na co se ptám („nevím, na co se ptáš“), takže otázku napsat tak, aby stála sama.

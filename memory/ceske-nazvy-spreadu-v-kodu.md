---
name: ceske-nazvy-spreadu-v-kodu
description: Ve v2/ (i v komentářích) piš názvy spreadů anglicky — „Podkova“ zastaví check-is a commit (3× za dva dny)
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-30T21:45:26.727Z
---

check-is.py skenuje zdrojové soubory ve `v2/` včetně komentářů a „Podkova“ má v BAD_PATTERNS (český zbytek místo IS „Skeifa“).
Pre-commit hook pak commit zablokuje.

**Why:** 2026-09-29/30 se mi to stalo třikrát — verze promptu `…podkova…`, komentář u IMG_POSTAVA a komentář u `_THOUGHT_SOURCE`.
Pokaždé commit znovu, zbytečné kolečko.

**How to apply:** v kódu a komentářích ve `v2/` používej anglické názvy spreadů (Cross, Norns, Horseshoe, Yggdrasil) nebo
technické klíče (KRIZ, NORNS, HORSESHOE). České názvy jen v docs (`RUNAR_*.md`, `docs/`), commit message a v chatu.
Než commitneš JS, pusť `python -X utf8 check-is.py`.

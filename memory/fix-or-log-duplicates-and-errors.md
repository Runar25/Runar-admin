---
name: fix-or-log-duplicates-and-errors
description: Narazím na duplikát/chybu → hned opravit, nebo zapsat do BACKLOGu; nikdy tiše přejít
metadata:
  type: feedback
---

KUKY 2026-08-02: „pokud narazíš na duplikát, chybu tak budeme opravovat nebo zapsat, ať se na to nezapomene."

**Why:** Duplikáty (§20) a nechané chyby se množí a vrací se jako den oprav (audit: 97 rozporů). Co se tiše přejde, spadne pod stůl a příště to čte někdo jako pravdu.

**How to apply:** Když při práci narazím na **duplikát** (totéž info na 2 místech → [[decisions-are-directions-not-locks]], CLAUDE.md §20) nebo **chybu/bug** (i mimo zadání): buď to **hned opravím**, pokud je to malé a v rozsahu úkolu, **nebo to zapíšu** do `RUNAR_BACKLOG.md` (příp. spawn_task chip) s dost kontextem, aby to šlo vyřešit bez téhle konverzace. Nikdy jen zmínit a nechat být. Souvisí s [[function-not-ceremony]].

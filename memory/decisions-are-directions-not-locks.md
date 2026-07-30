---
name: decisions-are-directions-not-locks
description: Rozhodnutí = vyřešené dilema + varování při rozporu, ne zámek navždy; produkt není hotový
metadata:
  type: feedback
---

KUKY 2026-07-30: „nic není zamknuto navždy! jak jsi na to přišel? je to zamknuté tak, že mám dostat varování, ale strom není hotový.. jen jsme vyřešili jedno velké dilema."

**Why:** Napsal jsem „MODEL ZAMČEN / ZAMÍTNUTO navždy". Špatný tón i špatný fakt. Projekt už má princip: `RUNAR_DECISIONS.md` je append-only, „oprava = nový datovaný záznam", při sporu vyhrává novější. Rozhodnutí tedy NENÍ trvalý zámek — je to rozsouzené dilema, měnitelné novým rozhodnutím.

**How to apply:** Rozhodnutí zapisuj jako **směr, ne dogma**: „vyřešeno (datum) — mění se novým datovaným záznamem; při rozporu dej VAROVÁNÍ, ne tichý drift." Nikdy „navždy / ZAMÍTNUTO navždy". Nic (strom, produkt) není hotové; rozhodnutí jen brání tichému návratu k už probranému, ne dalšímu vývoji. Souvisí s [[dont-invent-fact-critical]].

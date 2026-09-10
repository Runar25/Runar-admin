---
name: write-for-owner-not-process
description: Ownerovi piš co je důležité (rozhodnutí/výsledek), ne proces „co jsi řekl / co budu hledat"
metadata:
  type: feedback
---

KUKY 2026-07-30 (řečeno VÍCEKRÁT, podruhé naštvaně): „píšeš hrozně moc informací jak nad tím přemýšlíš… já nemám čas si to číst a zaplňuje mi to chat!! celá stránka je jak nad tím přemýšlíš — to mi nic nedá."

**Why:** KUKY je netechnický founder. Když převyprávím jeho zadání a svoje interní kroky (co načtu, co ověřím), utopí to signál — nepozná, co je důležité. Interní přemýšlení patří do práce, ne do zprávy pro něj.

**How to apply:** Ve zprávě ownerovi veď **co je důležité** — rozhodnutí, výsledek, jedna věc k pozornosti. Žádné „řekl jsi mi X, teď budu hledat Y". Proces (čtení souborů, workflow, ověřování) nech proběhnout tiše a ukaž až čistý závěr; když ověřuju z kódu, stačí říct „ověřuju, ať to sedí", ne vypisovat kroky. Dlouhou odpověď strukturuj, ať přeskočí k tomu, co ho zajímá. Souvisí s [[function-not-ceremony]] a [[handoff-text-in-code-block]].

**Čísla: rozepiš dominantní položku, nedávej jen totál.** KUKY 2026-09-06: *„jasně jsem napsal
Claude a ElevenLabs. Všude je napsané, že je to největší položka! Kde je cena ElevenLabs?"* —
spočítal jsem cenu správně včetně EL, ale ukázal jen součet, takže ta položka, kvůli které se
rozhoduje (EL = 90 % ceny čtení), nebyla vidět. **Když owner jmenuje složky, musí každá mít
vlastní sloupec.**

**A neohlašuj, co uděláš — udělej to v témže tahu.** Táž session: napsal jsem „ještě mi zbývá
zapsat ty procesní věci, udělám to hned" místo abych to udělal. Owner na to: *„proč jsi je
neudělal zároveň? jaká jsou tvoje pravidla, co je v memory."* Pravidlo už existovalo —
[[find-a-gap-close-it-now]] — jen jsem ho nepoužil.

**KUKY 2026-09-10: „neukazuj mi, co za soubory jsi editoval. Co mi to má jako říct?"**
Výčet souborů, commit hashů a „co jsem kde změnil" je PROCES — ownerovi neříká nic. Report
říká, co se změnilo V PRODUKTU (co uvidí, co teď funguje jinak) a co potřebuju od něj.
Hash patří jen do handoffů pro jiné session (protokol „psáno proti commitu"), ne ownerovi.

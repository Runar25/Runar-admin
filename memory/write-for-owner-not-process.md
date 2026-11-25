---
name: write-for-owner-not-process
description: Ownerovi piš co je důležité (rozhodnutí/výsledek), ne proces „co jsi řekl / co budu hledat"
metadata:
  type: feedback
---

KUKY 2026-07-30 (řečeno VÍCEKRÁT, podruhé naštvaně): „píšeš hrozně moc informací jak nad tím přemýšlíš… já nemám čas si to číst a zaplňuje mi to chat!! celá stránka je jak nad tím přemýšlíš — to mi nic nedá."

**Why:** KUKY je netechnický founder. Když převyprávím jeho zadání a svoje interní kroky (co načtu, co ověřím), utopí to signál — nepozná, co je důležité. Interní přemýšlení patří do práce, ne do zprávy pro něj.

**How to apply:** Ve zprávě ownerovi veď **co je důležité** — rozhodnutí, výsledek, jedna věc k pozornosti. Žádné „řekl jsi mi X, teď budu hledat Y". Proces (čtení souborů, workflow, ověřování) nech proběhnout tiše a ukaž až čistý závěr; když ověřuju z kódu, stačí říct „ověřuju, ať to sedí", ne vypisovat kroky. Dlouhou odpověď strukturuj, ať přeskočí k tomu, co ho zajímá. Souvisí s [[cheapest-deciding-measurement-first]] a [[handoff-text-in-code-block]].

**Čísla: rozepiš dominantní položku, nedávej jen totál.** KUKY 2026-09-06: *„jasně jsem napsal
Claude a ElevenLabs. Všude je napsané, že je to největší položka! Kde je cena ElevenLabs?"* —
spočítal jsem cenu správně včetně EL, ale ukázal jen součet, takže ta položka, kvůli které se
rozhoduje (EL = 90 % ceny čtení), nebyla vidět. **Když owner jmenuje složky, musí každá mít
vlastní sloupec.**

**A neohlašuj, co uděláš — udělej to v témže tahu.** Táž session: napsal jsem „ještě mi zbývá
zapsat ty procesní věci, udělám to hned" místo abych to udělal. Owner na to: *„proč jsi je
neudělal zároveň? jaká jsou tvoje pravidla, co je v memory."* Pravidlo už existovalo —
CLAUDE.md §20 a §30 — jen jsem ho nepoužil.

**KUKY 2026-09-10: „neukazuj mi, co za soubory jsi editoval. Co mi to má jako říct?"**
Výčet souborů, commit hashů a „co jsem kde změnil" je PROCES — ownerovi neříká nic. Report
říká, co se změnilo V PRODUKTU (co uvidí, co teď funguje jinak) a co potřebuju od něj.
Hash patří jen do handoffů pro jiné session (protokol „psáno proti commitu"), ne ownerovi.

**KUKY 2026-10-24: „nevím, proč mi vypisuješ to, co dělá CODE-read.“** Zpráva od jiné session (potvrzení, ověření, „hotovo“) není
zpráva pro ownera. Ownerovi jen to, co z ní plyne pro NĚJ (rozhodnutí, výsledek v produktu); jinak ji vezmi na vědomí a pracuj dál.

**KUKY 2026-09-23: „co je sekce 6. nechápu" · „nevím o který úhel jde".** Napsal jsem mu
*„nasadit celý návrh z auditu (sekce 6)?"* a *„úhel [0] přepsat?"* — štítky, které zná jen dokument
a kód. **Nikdy se ownera neptej na něco, co jmenuješ interní značkou** (číslo sekce, index úhlu,
verze promptu, jméno funkce). Řekni jednou větou, **co to je a co se změní**: ne „úhel [0]", ale
*„pokyn, kterým čtení někdy začíná — ‚začni celým obrazem najednou' — a první věta pak bobtná"*.
Otázka, které nerozumí, je ztracené kolo pro nás oba.

**Sloučeno 2026-11-25 z full-path-and-numbered-lists.**
**Úplná cesta, nebo rovnou text.** Odkaz na soubor ownerovi = celá cesta od `C:` (repo leží v `C:/Users/zkuku/Downloads/Runar-admin`,
pracovní adresář session je `C:/Users/zkuku`) — repo-relativní odkaz se vykreslí jako klikací, ale neotevře se (2026-07-19). SQL vlož celé
([[paste-sql-explicitly]]).
**VŠECHNY body hlášení a VŠECHNY otázky mají číslo** (1, 2, 3… průběžně přes celé hlášení; odrážky jen uvnitř bodu; tučný nadpis není číslo).
KUKY 2026-10-07: *„všechny tvoje podněty jsou psány jako holý text bez označení… pořád dokola!“* — odpovídá po číslech. Hlídá Stop-hook
`hooks/claude/runar-zprava-check.py` (pravidla 1 a 6, CLAUDE.md §30).
**Otázku POLOŽ, nezmiňuj** (KUKY 2026-10-14): co na něj čeká, napiš celé znovu jako „N. <otázka>?“, i když padlo dřív. **Ale neopakuj
nevyřízené otázky v každé průběžné zprávě** (KUKY 2026-11-01: *„pořád mi dáváš stejné a stejné otázky… nevím, kde jsem“*) — znovu jen ve
zprávě, která mu skutečně odpovídá (konec práce na jeho zadání); stavová zpráva (push, smoke, agent) otázky nepřipojuje.

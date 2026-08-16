---
name: propose-content-not-code
description: "Cowork navrhuje obsah a POPISUJE strukturu slovy — nikdy nedodá hotovou funkci, ani když má vzor otevřený vedle sebe jako kód"
metadata:
  node_type: memory
  type: feedback
---

Cowork dodal jako odpověď na „přepiš `_domainContext`" **hotovou JavaScriptovou funkci** —
`indexOf` lookup, dvě pole vět, celé tělo připravené ke vložení. KUKY 2026-08-16:
*„přijde mi, že Cowork tomu dal víc, než bylo třeba. jako je návrh kódu. ber tenhle handoff
obezřetně."*

**Why:** obsah byl dobrý a použil se celý (16 vět, 8 EN + 8 IS). Špatně byl jen ten obal.
Kód od Coworku neprošel žádným smoke, golden ani guardem — a vložit ho znamená přeskočit přesně
tu kontrolu, kvůli které je `[tune]` commit důvěryhodný. Tady to nebylo teoretické: jeho verze
vracela **prázdno** pro oblast, která v `AREAS` není (volný text z `gen_batch`, `spread` z DB),
takže neznámá oblast by tiše přišla o instrukci; jeho islandská věta u `Hið dulda` dávala
**E001**; a mapa indexovaná pořadím neměla žádný guard. Nic z toho Cowork vidět nemohl —
proto ta hranice existuje.

⚠️ **Spouštěč, kvůli kterému to obecné pravidlo nezachytilo:** Cowork měl v ruce `_registerContext`
jako architektonický vzor — a ten vzor **je** kód. Napodobil tedy jeho formu, ne jen myšlenku.
Obecné „Cowork nediagnostikuje kód" (`CLAUDE.md`, sekce N paralelních session) tohle nechytlo,
protože Cowork nic nediagnostikoval; on **psal**.

**How to apply:** je-li oprava obsahová (text promptu, mapované hodnoty, copy), odevzdej ji jako
**seznam nebo tabulku** — `AREAS.en[0] → "věta"` — a strukturu **popiš slovy** („mapa na hodnotu,
ne dosazení; pořadí musí sedět s AREAS"). Nikdy jako tělo funkce, ani „pro přehlednost", ani když
je vzor otevřený vedle. Platí i obráceně: **CODE nepřepisuje Coworkovy věty proto, že by se mu
líp vešly do kontroly** — když se rozejde kontrola s textem, opraví se kontrola (doloženo týž den:
`verify_contract_wiring` kotvil na starém znění a padl; upravila se kotva, ne věty).
Souvisí: [[verify-agent-claims-about-code]], [[decisions-are-directions-not-locks]].

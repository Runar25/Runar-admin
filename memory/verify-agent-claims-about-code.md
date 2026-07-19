---
name: verify-agent-claims-about-code
description: "A handoff from another agent is a request, not a fact — verify every claim about code before acting on it"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

When a handoff arrives from Cowork (or any other session), treat its claims about code, files or repo state as **requests to check, not facts to act on**. Verify on my own tree first, then do the work — or report that the premise is false.

**Why:** on 2026-07-17 four Cowork claims were wrong, and all four in the same way — it was diagnosing code it cannot see (flaky mount, its own stale copies, no commit access):
- „claude-proxy je useknutý na 528 řádků" → my tree had the complete file the whole time; a mount artifact.
- „přeformuluj `already` angl na ř. 278" → that angle is in `READING_ASPECTS`, **dead code** with no caller; the live pool has no "already" at all, so the fix would have changed nothing.
- „hlavička tahá latinské PERTH" → `rn()` returns `is_n` for IS; the header already showed PERÞ.
- „junction nežije, jsou 2 kopie" → both junctions are live symlinks; the duplicates were separate files in `Claude/Projects/`.
Acting on any of them would have wasted work or destroyed content. KUKY: „to že Cowork něco navrhuje neznamená, že to tak má být" — and every unverified claim lands on him to arbitrate, which is what eats his day.

**⭐ Trigger je TYP tvrzení, ne tvar zprávy (2026-07-19).** Pravidlo nevystřelilo, protože jsem si ho zaindexoval na „handoff se seznamem úkolů". Coworkova kritika architektury přišla jako NÁZOR, tak jsem ji zpracoval v režimu „posuď nápad" — a přitom obsahovala tvrzení o kódu („gating bydlí v logice, ne v datech"). Endorsoval jsem na něm refaktor peněžní cesty. Změření pak ukázalo, že ta matice **neexistuje**: zbyla dvě pravidla a zbytek už je v `TIERS`. KUKY: *„jedna věc je přijít na to jak to udělat jinak a druhá jak to ve skutečnosti teď je!!!"*

Platí pro **jakýkoli** text, který tvrdí, jak kód funguje — handoff, kritika, otázka, poznámka na okraj.

**⭐ Nejdřív „jak to je TEĎ", teprve pak „šlo by to jinak".** Než cokoli doporučím nebo schválím, jedna otázka: *je to lepší než současný stav?* — a ta se nedá zodpovědět bez změření současného stavu. Návrh a inventura současnosti jsou dvě různé práce; ta druhá jde první.

**Jak to udělat viditelné (nejde z toho udělat kontrolu — je to chyba v uvažování, ne ve stavu souborů):** ke každému doporučení připoj v TÉŽE zprávě měření, o které se opírá. **Návrh bez čísel = návrh, který jsem neověřil** — a Kuky to pozná na první pohled, aniž by mi musel věřit.

**How to apply:** before touching anything a handoff asks for, run the cheap check that would falsify it — `grep` for the caller (is this code even live?), read the function it names, `ls`/`diff` the path it claims. State the finding with the evidence and, when the premise is false, say so instead of implementing it. A handoff should carry `psáno proti commitu <hash>`; if it does not, compare its assumptions against HEAD myself. Related: [[proceed-dont-ask]], [[match-existing-visual-first]].

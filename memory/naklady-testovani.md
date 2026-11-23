---
name: naklady-testovani
description: "Náklady testování: testy dělat tady (předplacené), API jen s důvodem (KUKY 2026-08-23)"
metadata:
  type: feedback
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Náklady testování (KUKY 2026-08-23: „používáš moc API… testy dělej tady, to už mám zaplacené")
- **Souzení/eval = V SESSION** (Claude Code, předplacené): mantinelové soudce (svět/soulad/chlad),
  lineup/řazení, korelace — dělá session sama, nebo **čerstvý subagent** tam, kde je potřeba
  SLEPOST (subagent nemá kontext session → nezná odpověď; session, která text sama psala, ho
  slepě soudit nemůže).
- **API klíč JEN na generování produkčních čtení** (testuje se produkční model, to nejde jinak; výjimky → [[cteni-generuj-tady-ne-pres-api]])
  — a s malým n; před dávkou zvaž, jestli otázku nezodpoví menší řez.
- ⚠️ Změna soudce = čísla nejsou přímo srovnatelná se staršími baselines (opus-4-8, 3 hlasy) —
  při prvním použití session-soudce to poznamenat u měření (rejstřík/DECISIONS).

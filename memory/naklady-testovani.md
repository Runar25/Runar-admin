---
name: naklady-testovani
description: "Náklady testování: testovací čtení píšeš sám, slepé souzení subagentem; API jen pro produkční model a srovnání modelů, malý vzorek (KUKY 2026-08-23, 2026-09-10)"
metadata:
  type: feedback
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝); 2026-11-25 sloučeno s cteni-generuj-tady-ne-pres-api (audit nositelů).*

## Náklady testování (KUKY 2026-08-23: „používáš moc API… testy dělej tady, to už mám zaplacené")
- **Souzení/eval = V SESSION** (Claude Code, předplacené): mantinelové soudce (svět/soulad/chlad),
  lineup/řazení, korelace — dělá session sama, nebo **čerstvý subagent** tam, kde je potřeba
  SLEPOST (subagent nemá kontext session → nezná odpověď; session, která text sama psala, ho
  slepě soudit nemůže).
- **API klíč JEN na generování produkčních čtení** (testuje se produkční model, to nejde jinak; výjimky níž)
  — a s malým n; před dávkou zvaž, jestli otázku nezodpoví menší řez. Pokus přes API pustí jen hlídač s počtem a záměrem (CLAUDE.md §30).
- ⚠️ Změna soudce = čísla nejsou přímo srovnatelná se staršími baselines (opus-4-8, 3 hlasy) —
  při prvním použití session-soudce to poznamenat u měření (rejstřík/DECISIONS).

## Testovací čtení piš sám, ne přes API (KUKY 2026-09-10: „přestaň používat API pro čtení. Udělej to tady! Pro příště!!")
- Prompt se staví **produkční cestou** (`buildReadingPrompt` a spol. přes `vm`, seedovaný `Math.random`; CLAUDE.md §19), korpus a metriky
  počítá skript — jen krok „prompt → text“ dělám já v konverzaci. Návrh testu proto menší a cílenější: míň cel, predikce předem.
- **Slepé souzení dělá SUBAGENT**, který dostane jen maskovaný text a seznam run — session zná zadání i odpověď (CLAUDE.md §25 B).
- ⚠️ **Pisatel-subagent zná datum, produkční model ne** (2026-09-14/16: *autumn, browning heather, September night*). Do zadání pisatele
  vždy: „You do not know today's date or the season."
- ⭐ **Výjimka 1 (KUKY 2026-09-19 „ano“): hon na produkční vadu jede na PRODUKČNÍM modelu přes API** (model = `SOL_MODEL` v claude-proxy,
  klíče [[runar-api-key-file]], generátor `docs/eval/2026-09-19-produkcni-model/skripty/api_gen.js`) — subagent produkční vady nereprodukoval
  (Raidho volba 0/3 vs produkce 4/4; Ask tvrzení 0/3 vs 3/3).
- ⭐ **Výjimka 2 (KUKY 2026-09-22): srovnání modelů a testy, jak se ten který model zachová na změnu promptu, jedou přes API** — chování a cenu
  cizího modelu subagent nenapodobí. Vždy napřed malý pilot, velikost várky schvaluje owner ([[cheapest-deciding-measurement-first]]);
  skripty `docs/eval/2026-09-22-modely/skripty/`.

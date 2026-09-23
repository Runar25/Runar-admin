# Brána obrazů se statickými popisy run — 2026-09-23

**Podnět:** KUKY 2026-09-23: slepí soudci mají *„vědět, jak se runa přesně popisuje"* → „1. ano".
**Vlastní:** jen tento záznam měření. Obrazy samy žijí v `RUNE_IMAGES` (`v2/runar-character.js`),
popisy v `RUNAR_POPISY_RUN.md`, rozhodnutí v `RUNAR_DECISIONS.md` 2026-09-23 (11).

## Jak brána funguje
Soudce dostane obraz a **tři ownerovy statické popisy run** bez jmen („Tato runa"): popis správné runy
a dvou run, se kterými si obraz v původní bráně nejčastěji pletli. Neví, který je správný, a vybere, ke
kterému popisu obraz patří. 3 soudci (subagenti bez přístupu k repu), každý jiné pořadí a jiné kódy
popisů. **Prošel = správná runa aspoň u 2 ze 3.** Proč takhle, ne „sedí popis k runě?": soudce, který
zná runu, řekne skoro vždycky „sedí" — tentýž efekt, kvůli kterému čtení působí přesně (RUNAR_DESIGN).
Skripty a surová data: scratchpad session (`popis_brana_build.py`, `popis_brana2_build.py`, `popis_brana*_v*.json`).

## Kolo 1 — 19 obrazů, které neprošly původní branou
**Prošlo 9 z 19**, shoda soudců vysoká (16× jednomyslně).

| obraz | runa | s popisy | kam ho soudci dali |
|---|---|---|---|
| moře dává a bere | Gebo | **3/3** | — |
| pobřeží vrací jedno, drží druhé | Gebo | **3/3** | — |
| mráz na okně od dechu spícího | Ansuz | **3/3** | — |
| konvice mění tón | Ansuz | **2/3** | Dagaz 1 |
| přijdeš z mrazu, někdo zatopil | Wunjo | **3/3** | — |
| jehně se tiskne v jarním mrazu | Nauthiz | **3/3** | — |
| rostlina na parapetu k jediné hodině světla | Nauthiz | **3/3** | — |
| těsto zvedá utěrku | Jera | **3/3** | — |
| pod ledem je slyšet potok | Isa | **3/3** | — |
| ovce jdou večer do ohrady | Fehu | 0/3 | Othila 3 |
| borůvky v srpnu | Fehu | 0/3 | Jera 3 |
| láva si pamatuje oheň | Uruz | 0/3 | Othila 3 |
| dojdeš na vrchol, dech se vrací | Ansuz | 0/3 | Uruz 3 |
| kořen se dere kameny k vodě | Nauthiz | 0/3 | Uruz 3 |
| chléb, dost pro všechny | Jera | 0/3 | Fehu 3 |
| řeka valí oblázek | Perth | 1/3 | Raidho, Laguz |
| laguna se na chvíli projasní | Perth | 0/3 | Laguz 3 |
| odraz v laguně | Mannaz | 0/3 | Laguz 3 |
| vlasec do tmavé vody | Blank | 0/3 | Perth 3 |

## Kolo 2 — nové obrazy z popisů + 6 kontrol
**Nové: 10 z 11 prošlo 3/3.** Neprošel *„You say it straight out, and the whole room goes quiet"*
(Tiwaz 1/3, Ansuz 2/3) → nezařazen.
**Kontroly** (obrazy, které prošly původní branou 3/3): **5 z 6 prošlo 3/3**; *„žhavé uhlíky pod popelem"*
(Kenaz) spadl na Ingwaz 2/3. Brána s popisy je tedy **přísnější** než původní a neschvaluje automaticky —
ale jeden dobrý obraz z šesti může shodit. Proto je to síto, ne verdikt (KUKY: uživatel runu zná).

## Mez
- n = 3 soudci; zaměnitelné runy určené z původní brány (u 8 obrazů druhá doplněna ručně předem).
- Soudci četli jen EN znění obrazu. IS je ověřené jazykově (korpus, is-grammar-qa), ne branou.
- Brána měří, jestli obraz **nese runu podle popisu**. Neměří, jak dobré čtení z obrazu vznikne
  (moře u Gebo a laguna u Perth dala čtení, která owner pochválil, a laguna tu přesto neprošla).

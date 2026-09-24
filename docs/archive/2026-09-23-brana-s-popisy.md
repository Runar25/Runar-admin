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

## Kolo 3 — 10 obrazů navržených v auditu (`2026-09-23-audit-obrazu.md` sekce 5) + tytéž kontroly
**9 z 10 prošlo 3/3.** Neprošel *„Two carry the same trough, each at their own end"* (Gebo 0/3, Ehwaz 3/3).
**Kontroly zopakovaly kolo 2 přesně** (jiné pořadí i kódy popisů): 5 × 3/3, uhlíky u Kenaz 1/3 (Ingwaz 2) —
brána dává opakovatelný výsledek, ne náhodu.

## Co z toho plyne pro návrh z auditu (k rozhodnutí ownera)
- **Přidat 9** (vše kromě koryta).
- **Nevyřazovat, prošly s popisy:** Gebo moře i pobřeží · Ansuz konvice · Wunjo kamna.
- **Nepřestěhovávat, prošly u své runy:** Ansuz jinovatka z dechu · Jera těsto.
- **Vyřadit (neprošly ani jednou branou):** Fehu ovce do ohrady · Uruz láva · Perth kamínek v řece ·
  Ansuz „dech se vrací pomaleji" · Nauthiz kořen přes kamení.
- **Přestěhovat (obě brány jednomyslně jinde):** Fehu borůvky → Jera · Mannaz odraz v laguně → Laguz.
- **Ownerovo slovo:** Blank vlasec do tmavé vody (obě brány Perth; čtení owner chválil) · Perth laguna
  (obě brány Laguz; čtení owner chválil — test na celých čteních).

## Kolo 4 — náhrada chleba u Jery (owner: „chleba, hlavně jeho pěstování či setí, se mi nelíbí")
6 kandidátů bez chleba a bez setí, každý **3/3 Jera**; kontroly (Othila truhla, Uruz břemeno) 2 × 3/3:
sušená ryba na sušáku · jeřabiny zčervenají a přiletí drozdi · svetr pletený celou zimu · uzené jehněčí
z udírny · jehňata z května sejdou v září z hor · šícha nejsladší po prvním mrazu.
Nasazeny tři (svetr místo chleba, ryba, jehněčí), aby Jera měla varianty v každém ročním období.
Zbylé tři jsou prošlé zálohy, kdyby bylo potřeba.

## Kolo 5 — tenké runy (2026-09-24)
Od října by Uruz, Berkana, Ehwaz a Ingwaz měly jen 2 obrazy (Dagaz a Blank od března do září).
18 kandidátů z ownerových popisů (3 na runu), IS ověřené korpusem a is-grammar-qa.
**16 z 18 prošlo** (15× 3/3, skyr u Ingwaz 2/3); kontroly 2/2 znovu 3/3.
Neprošly: pupeny na holé bříze (Berkana → Ingwaz 3/3) · palčáky, ze kterých dítě vyrostlo (Berkana → Jera 3/3).
Nezařazeno, i když prošlo: žitné těsto u horkého pramene (Ingwaz 3/3) — zase chléb, který owner u Jery nechtěl.
Po zařazení žádná runa nemá v žádném období méně než 3 dosažitelné obrazy.

# Session 2026-06-03 — Pricing, Design reorganizace, Tier audit

## Co bylo uděláno

### 1. Bug fixy
- **Life rune header** — "You carry life rune Gebo ᚷ" (sloučen header, odstraněn duplikát + strip markdown)
- **Tree name input** — `font-variant-numeric: lining-nums` (čísla na stejné výšce jako písmena)
- **Shrine V2 lab** — `const deep` → `let deep` (Assignment to constant variable)
- **SW**: v24 → v25 → v26

### 2. Dokumentace — kompletní reorganizace

**3 autoritativní soubory v repozitáři:**
```
CLAUDE.md        — technická pravidla, kód, workflow
RUNAR_DESIGN.md  — design, mytologie, strom, spready, charakter, IS pravidla
RUNAR_PRICING.md — NOVÝ: business model, ceny, tiery, distribuce
```

**Obsah RUNAR_DESIGN.md (přepsán, rozšířen):**
- Kdo je Rúnar + hlas a styl
- Příběh uživatele — Rune Seeker = Ódinova cesta
- Ratatoskr jako trickster (jediný kdo zná celý strom)
- Huginn/Muninn jako havrani (ne vrány) — produkt mapping
- Mytologický základ + islandský kalendář (měsíce, svátky, huldufólk, lunár)
- Filozofie rituální kadence
- Všechny spready s pozicemi:
  - Trojice ✅ implementováno
  - Norns — 3 runy (Urd/Verðandi/Skuld), jiný charakter než Trojice
  - Kříž — pozice definovány
  - **Horseshoe** — pozice nově definovány (7 run, 7 pozic)
  - **Yggdrasil** — pozice nově definovány (9 světů: Ásgarðr, Álfheimr, Vanaheimr...)
  - The Gathering — vymyšlený rituál, zachovat implementaci z journalu
- Tři sekce stromu (Ætty)
- Levá/pravá strana stromu
- Pojmenování větví uživatelem
- Záměry (intentions) — seed → building → closure
- Nemocný strom — 5 typů
- Specifická otázka — reframing
- Voice Scale (0–20)
- Proaktivní kontakt (Huginn)

**RUNAR_PRICING.md (nový):**
- Náklady IS vs EN (IS = 2.7× dražší)
- Standard 50 run/měsíc (78% marže), Premium 75 run/měsíc (76% marže)
- Kreditní karty (nové ISK ceny: Starter 1.490 ISK, ..., Master 9.990 ISK)
- ElevenLabs scaling (Creator → Pro od 6 uživatelů)
- Go-to-market: Island → turisté → globálně
- Fyzické produkty (Sigrun, za pár měsíců)
- Bundle: runové kameny + Rune Card

### 3. Business rozhodnutí

| Rozhodnutí | Hodnota |
|-----------|---------|
| Standard limit | 50 run/měsíc |
| Premium limit | 75 run/měsíc |
| Yggdrasil přístup | jen Premium |
| RS onboarding | **1 free reading** (bylo 3) |
| Weekly drip | **zrušen** |
| Norns počet run | 3 (jeden na Nornu) |
| The Gathering | vymyšlený, zachovat implementaci |
| Fyzická cesta | Visitor 1 + Rune Card 1 + RS 1 = 3 celkem zdarma |

### 4. Nové pravidlo (CLAUDE.md §8) — config-driven texty

Tier hodnoty MUSÍ být v `TIER_LIMITS` v runar-config.js.
User-facing texty MUSÍ číst z configu — ne natvrdo.

```js
// runar-config.js — přidány text labels
rune_seeker: {
  onboarding: 1,
  onboarding_label_en: 'one free reading',
  onboarding_label_is: 'einn frjáls lestur',
  journal_entries: 5,
  journal_label_en: 'last 5 readings',
  journal_label_is: 'síðustu 5 lestrar',
}
```

Opraveno 16 hardcoded míst: runar-app.js (14) + runar-reader.html (2).

### 5. Zdroje zpracované do RUNAR_DESIGN.md
- `runar_system_design.md` (1369 řádků) — kompletní přečten
- `runar_tree_story.md` (312 řádků) — přečten
- `RUNAR_DESIGN1.md`, `RUNAR_PRICING1.md` — sloučeny a archivovány
- `TIER_LIMITS.md` — zpracován (v repozitáři, zachován)

### 6. Rezervy a otevřené otázky
- **9-run Norns (3+3+3)** — vymyšlený, silnější, možný budoucí rituál (RITUAL-B)
- **Zakládací rituál 9 run** — alternativa k 3 sessions, možný budoucí produkt
- Standard+/Premium+ — budoucí tiery (unlimited), implementovat až limitů se dosáhne
- Weekly drip zrušen v configu/textech, ale `claude-proxy` Edge Function ještě neupravena

## Soubory změněny (kód)

| Soubor | Změna |
|--------|-------|
| runar-tree.js | Life rune header fix |
| runar-reader.css | lining-nums pro tree name |
| runar-shrine.html | const→let fix |
| runar-config.js | onboarding 3→1, drip→null, text labels |
| runar-app.js | 14 hardcoded textů → config/správné hodnoty |
| runar-reader.html | 2 hardcoded HTML texty |
| sw.js | v26 |

## Stav dokumentace

| Soubor | Stav |
|--------|------|
| CLAUDE.md (repo) | ✅ aktuální, pravidlo §8 přidáno |
| RUNAR_DESIGN.md (repo) | ✅ kompletní přepis s novým obsahem |
| RUNAR_PRICING.md (repo) | ✅ nový soubor |
| Desktop .md soubory | 🗑️ archivovat — obsah přenesen do repo |

## SW verze: v26
## Poslední commit: a158064

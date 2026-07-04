# Session 2026-06-05 — Audit v0.9, data definice, design patch v1.0

## SW verze: v31
## Poslední commit: 6f5af46

---

## Co bylo uděláno

### 1. Tree PoC v2 — vizuální přepis
- Kompletní přepis runar-tree-poc.html
- Organické bezier větve (C command), 3 úrovně větvení
- Tvarovaný filled trunk (ne stroked line)
- Teardrop listy v defs + use (8-15 na cluster)
- Symetrické rozložení: Fire=L dolní, Earth=P dolní, Air=L horní, Water=P horní (nová větev)
- Bloom animace: 9 segmentů větve se probouzí postupně

### 2. Audit souborů vs. patch v0.9 — nalezené konflikty
| # | Konflikt | Řešení |
|---|---------|--------|
| K1 | Gathering manual vs automatic | Zdokumentováno — nový model |
| K2 | Premium monthly_readings null vs 75 | Opraveno na 75 |
| K3 | SPREAD_CONFIG chybí horseshoe + yggdrasil | Doplněno |
| A1 | pattern_window chybí v RUNAR_CONFIG | Přidáno jako PATTERN_WINDOW |
| A4 | AREAS/SEEKS bez norns axis | Přidáno |
| A5 | isLifeRune bez logiky | Detekce přidána do prompt builderů |
| A6 | TREE_UPDATE bez dokumentace | Zdokumentováno |
| Bonus | MOODS+INTENTIONS shrine-only | Centralizováno do runar-runes.js |

### 3. Nové datové struktury v kódu

**runar-config.js:**
```javascript
PATTERN_WINDOW = { high:7, mid:14, low:30 }  // dny

HEAVY_RUNES = {
  names: ['Hagalaz','Nauthiz','Isa','Thurisaz','Perth','Tiwaz'],
  descriptions: { Hagalaz:'...', ... },
  thresholds: { 2:'tension', 3:'nidhoggr', 4:'winter_dark' }
}

TRANSFORMATION_PAIRS = {
  cycle:        [3 páry],
  breakthrough: [3 páry],
  shadow_light: [3 páry],
}
// Precedence: pair > heavy combination
```

**runar-runes.js:**
```javascript
// RUNES[i].aett — přidáno na všech 24 runách
// Freyjina: Fehu,Uruz,Thurisaz,Ansuz,Raidho,Kenaz,Gebo,Wunjo
// Heimdallova: Hagalaz,Nauthiz,Isa,Jera,Eihwaz,Perth,Algiz,Sowilo
// Tyrova: Tiwaz,Berkana,Ehwaz,Mannaz,Laguz,Ingwaz,Dagaz,Othila

AETTY = { freya:{...}, heimdall:{...}, tyr:{...} }
MOODS = { en, is, norns, element }  // HOW ARE YOU FEELING — centralizováno
INTENTIONS = { en, is, norns }      // THIS READING IS FOR — centralizováno
AREAS.norns = [...]  // 8 oblastí → urd/verdandi/skuld
SEEKS.norns = [...]  // 5 záměrů → osa
```

**runar-character.js:**
```javascript
// buildReadingPromptIS/EN: isLifeRune detekce
var isLifeRune = !!(life && drawn.n === life.n);
// mood + intention přidány do prompt kontextu (oba jazyky)
```

### 4. Správná jména run v RUNES[]
| Patch název | Kód |
|-------------|-----|
| Perthro | Perth |
| Berkano | Berkana |
| Othala | Othila |
| Blank | Blank (žádná Ætta) |

### 5. Gathering — nový model (zdokumentováno)
- Automatická detekce (ne manuální výběr)
- count=2 → listy září, count=3+ → CTA
- Eagle (koruna) + Níðhöggr (kořeny) = oba v jednom výkladu
- Cena: 3 kredity flat
- Všechny tiery
- Zůstává otevřené

### 6. Dokumenty vytvořeny
- `runar_patch_v0.9_status.md` — implementační status
- `runar_patch_v1.0_design.md` — design agenda pro Claude Chat

---

## Commits session

| Hash | Co |
|------|----|
| 329de01 | config audit fixes (K1-K3, A1, A4, premium) |
| 79d72ac | MOODS+INTENTIONS centralizace |
| c9283f1 | isLifeRune + A5 + A6 |
| 60e2bd3 | HEAVY_RUNES + TRANSFORMATION_PAIRS + AETTY |
| 8ac1592 | Perth name fix |
| 6f5af46 | design patch v1.0 |

---

## Soubory změněny

| Soubor | Změna |
|--------|-------|
| runar-config.js | PATTERN_WINDOW, HEAVY_RUNES, TRANSFORMATION_PAIRS, horseshoe+yggdrasil SPREAD_CONFIG, gathering credits=3, premium monthly_readings=75 |
| runar-runes.js | aett na 24 runách, AETTY, MOODS, INTENTIONS, AREAS.norns, SEEKS.norns |
| runar-character.js | isLifeRune detekce, mood+intention v promptech |
| runar-shrine.html | MOODS/INTENTIONS inline odstraněny → MOODS[lang] |
| runar-help.html | Rúnirnar typo |
| CLAUDE.md | SW v26→v31, Gathering nový model, spread tabulka, TREE_UPDATE |
| runar-tree-poc.html | Kompletní přepis — organické SVG větve |
| runar_patch_v0.9_status.md | NOVÝ — implementační status |
| runar_patch_v1.0_design.md | NOVÝ — design agenda pro Claude Chat |

---

## Příští kroky

### Hned po /compact
- Shrine audit (uživatel chce projít)

### Design (přes Claude Chat s runar_patch_v1.0_design.md)
1. norns_axis výpočet — pravidlo přednosti
2. detectPatterns() algoritmus
3. tree_state DB schéma finální
4. branch objekt finální
5. Gathering system prompt IS+EN
6. Norns prompt IS+EN
7. Horseshoe prompt IS+EN
8. Blank/Óðin prompt + vizuál

### Pending kritické (z dřívějška)
🔴 Resend SMTP — magic link emaily
🔴 Shopify webhook — tier upgrade
🔴 DPA Supabase — čeká na email
🟡 Standard tier nákupní flow
🟡 Kříž implementace
🟡 Privacy Policy na agndofa.is
🟢 Monthly limit 50/75 v claude-proxy
🟢 Weekly drip odstranit z claude-proxy
🟢 SSE streaming

# Snapshot: 2026-06-06 — Spreads, Tree RS, UI fixes
# Commity: e14e407 → fcdf92c (SW v32→v36)

---

## Tier rozhodnutí (FINÁLNÍ)

| Tier | DB hodnota | UI jméno |
|------|-----------|---------|
| Visitor | free_trial | Visitor |
| Rune Seeker | rune_seeker | Rune Seeker |
| Standard | standard | **Rune Walker** |
| Premium | premium | **Rune Keeper** |

DB hodnoty se NEMĚNÍ. Jen UI labely. Implementovat v dalším commitu:
- TIERS.standard.label → 'Rune Walker'
- TIERS.premium.label → 'Rune Keeper'
- TIERS.standard.label_is → 'Rune Walker' (záměrně anglicky)
- TIERS.premium.label_is → 'Rune Keeper'

## Tier přístup ke spreadům (FINÁLNÍ)

Visitor = pouze Single (1×)
RS = vše za kredity (1 kredit = 1 runa)
Rune Walker (Standard) = vše z limitu 50/měsíc
Rune Keeper (Premium) = vše z limitu 75/měsíc
Yggdrasil: Dec 14–28 pro všechny tiery

---

## Implementované spready (stav 2026-06-06)

| Spread | Kredity | Prompt | Generate fn | UI |
|--------|---------|--------|-------------|-----|
| Single | 1 | ✅ | ✅ | ✅ |
| Trojice / 3 READINGS | 3 | ✅ | ✅ reader | ✅ |
| Norns | 3 | ✅ | ✅ reader | ✅ |
| Cross / Kříž | 5 | ✅ | ✅ reader | ✅ |
| Horseshoe | 7 | ❌ chybí | ❌ | ❌ |
| Yggdrasil | 9 | ❌ chybí | ❌ | ❌ |
| Gathering | 3 flat | ❌ redesign | ❌ | ❌ |

## Reader UI (stav 2026-06-06)

Mode buttons: SINGLE RUNE | 3 READINGS | NORNS | CROSS
Slot tracker:
  - Trojice/Norns: 3 slots v řadě
  - Cross: 5 slots v kříži (① = center, ② above, ③ below, ④ behind, ⑤ ahead)
btn-speak stavy:
  - Spread mode, prázdné: "DRAW YOUR RUNES" (disabled)
  - Runa vybrána, ne plné: "ADD RUNE" (enabled)
  - Vše plné: "HEAR RÚNAR SPEAK" (enabled)

IS: speak_btn_draw='DRAGÐU RÚNIRNAR', speak_btn_add='BÆTA VIÐ RÚNU'

---

## Tree of Life RS teaser (stav 2026-06-06)

Zobrazuje se RS userovi se zadaným DOB:
- Life Rune jméno + glyf
- Poetický text (ne "Your story opens with Standard")
- CTA #1: REVEAL YOUR LIFE RUNE — 3 kredity (gold button, disabled pokud < 3)
  - Zobrazuje aktuální balance
- OR separator
- CTA #2: UPGRADE → STANDARD (outline, coming soon → toast)

Funkce:
- _rsLifeRuneReading(): check credits >= 3, pak generateLifeRuneReading()
- generateLifeRuneReading(): use_credit=true pro RS
  TODO: proxy deducts 1 credit, ne 3 — potřeba credit_cost param v claude-proxy

SPREAD_COSTS.life_rune.credits = 3 (bylo 10)

---

## Budoucí rozšíření readeru (poznáno 2026-06-06)

A) "Neuložit do stromu" toggle — přihlášený user bez tree branch
B) "Čtení pro někoho jiného" — jiné jméno/DOB, nezapíše do stromu usera
Závisí na: tree_state DB, branch systému

---

## Nové funkce (runar-character.js)

buildKrizPromptIS/EN(u, runes, corrections)
  - Cross pozice: center=verdandi, above/ahead=skuld, below/behind=urd
  - Unified flowing text (6-8 vět), IS přímo

buildNornsPromptIS/EN(u, runes, corrections)
  - runes[0]=Urður(urd), [1]=Verðandi(verdandi), [2]=Skuld(skuld)
  - Norns axis HARDCODED z pozice (ne z area/seeking)
  - 3 hlasy Norn skrze Rúnara, unified text (7-9 vět)

buildKrizPrompt/buildNornsPrompt — dispatchers

## Nové funkce (runar-reading.js)

_generateSpread3Reading() — Trojice v readeru (bylo jen v shrine)
_generateNornsReading() — Norns spread
_generateSpread5Reading() — Cross spread
_updateSpread5Slots() — cross slot tracker
_hideSpread5Output() — hide/show output
Spread mode: _setSpreadMode handles 'kriz' | 'norns' | 'trojice'
generateVoice(): handles s3-out (trojice/norns) + s5-out (kriz)

## Nové funkce (runar-tree.js)

_rsLifeRuneReading() — RS credit check + generateLifeRuneReading
generateLifeRuneReading() — use_credit=true pro RS

## Nové funkce (runar-auth.js)

openUpgradeModal() — stub, coming soon toast

---

## CSS (runar-reader.css)

.spread5-slots → .s5-cross grid layout (flex-direction:column)
.s5-row, .s5-center — cross positioning
.tree-cta-block, .tree-or-sep, .tree-upgrade-block — RS teaser
.btn-gold — gold filled button (RS CTA)
.btn-outline — outline faded button (upgrade)

---

## TODOs zachycené v kódu

1. claude-proxy: přidat credit_cost param pro multi-credit deduction
   (Life Rune = 3 credits, Cross = 5, Horseshoe = 7)
2. openUpgradeModal() — nahradit reálným checkout flow
3. Tier UI labels — implementovat Rune Walker / Rune Keeper v config
4. Horseshoe prompt (buildHorseshoePromptIS/EN) — chybí
5. Yggdrasil prompt — chybí

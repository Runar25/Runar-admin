# Snapshot 2026-06-07 — Journal cleanup, UI changes, credit_cost fix

## SW verze: v72
## Poslední commit: ba4189c

---

## Změny (druhá část dne)

### 1. BEFORE WE BEGIN — personalizovaný heading (SW v69, commit 3c7e456)

**runar-reading.js** — `_updateReadingForm()`:
- MY READING + known user (userName + _lifeRuneNum): `t('reader_card1_lbl') + ', ' + userName.toUpperCase()`
- MY READING neznámý / FOR SOMEONE: `t('reader_card1_lbl')` = "✦ BEFORE WE BEGIN"
- FOR SOMEONE heading: bylo "✦ READING FOR SOMEONE" → nyní "✦ BEFORE WE BEGIN"

**runar-app.js** — `updateUIText()`:
- Odstraněno `setText('reader-card1-lbl', ...)` a `setText('reader-note', ...)`
- Tyto prvky řídí výhradně `_updateReadingForm()` — nikdy `updateUIText()`
- Přidán guard comment zabraňující budoucímu přidání dynamického obsahu sem

**runar-translations.js**:
- `reader_note` (EN + IS): nový text — "The more you share, the more precisely I can speak. But the rune will find what needs finding either way." / IS ekvivalent
- `reading_ready_note`: sjednocen s `reader_note` (stejný text pro oba stavy)
- `setup_for_name_lbl`: "THEIR NAME" → "NAME" (EN) / "NAFN ÞEIRRA" → "NAFN" (IS)
- `setup_for_name_ph`: "Their name or nickname" → "Name or nickname"

**runar-app.js** — SIGNED_IN event:
- Odstraněn `showToast('✦ WELCOME · RÚNAR AWAITS')` — vyskakující okno při přihlášení pryč

---

### 2. Gathering odstraněno z journalu (SW v70, commit fe0b0f3 + SW v72, commit ba4189c)

**Dvě fáze:**

**Fáze 1 — journal karty a filter (runar-journal.js + runar-translations.js):**
- `isGathering` detekce odstraněna
- Celá Gathering karta (area='gathering' záznamy) — tichý skip (žádná karta)
- `filterJournal()`: gathering větev odstraněna; `area=gathering` → `return false`
- `populateJournalFilters()`: `hasGathering` + "✦ The Gathering" option odstraněny
- `ritual_gathering_jcard` translation key odstraněn (EN + IS)
- Stará DB data (area='gathering') zůstanou v DB ale nebudou renderována

**Fáze 2 — whispers sekce v HTML (runar-reader.html + runar-journal.js):**
- `<div class="whispers-section">` blok celý odstraněn z runar-reader.html (50+ řádků)
- `updateWhispersUI()` volání odstraněno z konce `renderJournal()` v runar-journal.js
- `runar-gathering.js` **nedotčen** — dostane novou roli (tree pattern detection)
- CSS třídy `whispers-*` zůstávají (neovlivňují UI bez elementů)

**Proč:** The Gathering dostalo novou roli v tree of life (pattern detection). V journalu sloužilo staré funkci která se ruší.

---

### 3. credit_cost fix — callProxy multi-credit deduction (SW v71, commit ea9d225)

**Backend (claude-proxy/index.ts) — BYL JIŽ IMPLEMENTOVÁN:**
```typescript
spread_cost = 1,  // default — čte se z body requestu
// for (let i = 0; i < cost; i++) { use_credit RPC }
```
Backend vždy uměl deductovat N kreditů — frontend jen neposlal parametr.

**Frontend fix — runar-app.js:**
```javascript
// Před:
async function callProxy(sys, prompt, maxTokens, use_credit = false)
body: JSON.stringify({ system: sys, prompt, max_tokens: maxTokens, use_credit })

// Po:
async function callProxy(sys, prompt, maxTokens, use_credit = false, credit_cost = 1)
body: JSON.stringify({ system: sys, prompt, max_tokens: maxTokens, use_credit, spread_cost: credit_cost })
```

**Všechna volání aktualizována:**
| Soubor | Spread | credit_cost |
|--------|--------|-------------|
| runar-reading.js | Single | `SPREAD_COSTS.single.credits` = 1 |
| runar-reading.js | Norns | `SPREAD_COSTS.norns.credits` = 3 |
| runar-reading.js | Kříž | `SPREAD_COSTS.cross.credits` = 5 |
| runar-reading.js | Horseshoe | `SPREAD_COSTS.horseshoe.credits` = 7 |
| runar-reading.js | Yggdrasil | `SPREAD_COSTS.yggdrasil.credits` = 9 |
| runar-tree.js | Life Rune | `SPREAD_COSTS.life_rune.credits` = 3 |

TODO komentář v runar-config.js + runar-tree.js odstraněn.

---

### 4. Workflow fix — session start protokol

**MEMORY.md** — Session Start Protocol aktualizován:
- Přidán `working-style.md` jako krok 2 (před snapshoty)
- Přidáno `⚠️ NIKDY nezačít implementovat bez schválení plánu`

**Důvod:** `working-style.md` obsahuje Explore→Plan→Implement pravidlo ale nebyl v protokolu → po každé kompresi pravidlo nebylo načteno.

---

## Stav na konci dne

SW: v72 | Commit: ba4189c
EN/IS klíče: 174/174

### Co zbývá (prioritní)
- 🔴 Resend SMTP, Shopify webhook, DPA Supabase
- 🟡 Norns axis → zapojit `_moodContext`/`_intentionContext` do buildReadingPromptEN/IS
- 🟡 runar-help.html — hardcoded strings v help content sekci
- 🟢 The Gathering nová role (tree pattern detection) — čeká na tree_state DB

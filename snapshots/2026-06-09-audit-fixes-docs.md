# Snapshot 2026-06-09 — Audit fixes + docs

## SW verze: v75
## Poslední commit: 941d3d9

---

## Změny (druhá část dne)

### 1. Yggdrasil seasonal gate fix (SW v74, commit 0a22c68)

**runar-reading.js** — řádky 407–414:
- Tvrdá blokace mimo Dec 14–28 odstraněna (`_setSpreadMode('single'); return;`)
- Nahrazena informativním toastem: "Yggdrasil er opinn — en krafturinn er mestur 14.–28. desember."
- Čtení projde celý rok — tree-update nemá branch_weight logiku (Tree V3 není hotové)
- Skript: `scripts/archive/fix-yggdrasil-gate.py`

### 2. Dead code cleanup (SW v75, commit 6ee16fa)

**runar-config.js:**
- `RUNAR_MODES.spread_3` blok smazán (Trojice odstraněna, žádné reference)
- `'gathering'` vyjmuto z `TIER_LIMITS.rune_seeker.free_spreads`

**runar-app.js:**
- `setText('whispers-title', '✦ ' + t('ritual_gathering'))` smazán (element neexistuje)
- Wire whispers-audio (wcap) blok smazán (~řádky 1192–1218)

**runar-reading.js:**
- `wcapToggle()`, `wcapMute()`, `wcapSeek()`, `_wcapFmt()` smazány — WHISPERS CAP PLAYER sekce
- Skript: `scripts/archive/fix-dead-code-cleanup.py`

### 3. Prompt caching — claude-proxy/index.ts (commit 24ac814)

Změna z předchozí části dne commitnuta do gitu (bylo jen deployováno).
- `system: string` → `system: array` s `cache_control: {type: "ephemeral"}` na base system promptu
- Vrstvy A/B/C v `dynamicContext` — nekešovány

### 4. CLAUDE.md trim (commit 941d3d9)

217 → 189 řádků (pod limit 200):
- §11: 8 řádků → 1 řádek + odkaz na working-style.md
- §12: 7 řádků → 1 řádek + odkaz na working-style.md
- §13: 20 řádků → 4 řádky (princip zachován)

### 5. Native app strategie — RUNAR_PRICING.md (commit 941d3d9)

- Island má ~65–70 % iOS → App Store discovery = primární driver (ne push notifikace)
- Push remindery (pondělní drip, Yggdrasil okno) → email, ne push
- Přepis sekce "Kdy přejít": "jít dřív než později", bez user count threshold
- Capacitor = technická cesta (HTML/CSS/JS → nativní shell beze změn kódu)

### 6. File saving rules — working-style.md

Přidána sekce "Kde ukládat soubory":
- `scripts/` pro patch skripty, `scripts/archive/` po použití, `scripts/utils/` pro utility
- Naming conventions (fix-/add-/refactor-/RUNAR_)

---

## Stav na konci dne

SW: v75 | Commit: 941d3d9
Všechny změny pushnuto na GitHub.

### Co zbývá (prioritní)
- 🔴 Resend SMTP, Shopify webhook, DPA Supabase
- 🟡 Norns axis → zapojit `_moodContext`/`_intentionContext` do buildReadingPromptEN/IS
- 🟡 runar-help.html — hardcoded strings
- 🟢 Capacitor / App Store — dřív než později (Island 70% iOS)
- 🟢 Tree of Life vizuální strom — předáno Cowork

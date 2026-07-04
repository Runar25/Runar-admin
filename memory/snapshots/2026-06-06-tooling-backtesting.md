# Snapshot: 2026-06-06 — Tooling + Backtesting Session
# Commity: 54a096b → 2762474 (SW v41→v43)

---

## Co bylo uděláno

### 1. SyntaxError oprava (runar-auth.js:408)
`lang === 'is'` bez `?` — fragment z vocab refaktoru. Odstraněn.
SW v40 → v41. Commit: 54a096b

### 2. Tooling — check-translations.py
Porovnává EN vs IS klíče v runar-translations.js.
Exit 0 = OK, exit 1 = chybí IS překlady.
Aktuální stav: 164/164 klíčů ✅
Commit: bc88573

### 3. Tooling — smoke.py (5 kontrol)
```
python -X utf8 smoke.py
```
① JS syntax (node --check × 10 souborů)
② Hardcoded strings §10 (regex na LOGIC_FILES)
③ IS texty (check-is.py)
④ Překlady (check-translations.py)
⑤ SW verze (komentář == cache)
Commit: 5e13db0

### 4. §10 opravy — 8 nových translation klíčů
Smoke test odhalil 5 reálných porušení. Opraveno:
- sign_in_btn (auth.js:92)
- name_modal_title/sub/skip/btn/ph (app.js:381-385)
- shrine_audio_lbl (app.js:813)
- invalid_date (tree.js:166)
Klíče: 156 → 164. SW v41 → v42. Commit: 5e13db0

### 5. git pre-commit hook (SW auto-bump)
hooks/pre-commit.py — auto-bumps sw.js při JS/CSS commit.
hooks/install-hooks.py — instalátor.
Logika:
  JS/CSS staged + sw.js NOT staged → auto-bump + stage sw.js
  sw.js already staged → skip (manuální bump)
  Žádné JS/CSS → skip
Po fresh clone: `python -X utf8 hooks/install-hooks.py`
Commit: 4143f95

### 6. IS tree_rs_teaser oprava (TODO #6 ✅)
'Þæ rúna hefur verð þín' → 'Þessi rúna hefur verið þín frá fyrsta andardráttinum.'
Hook ukázal: [hook] SW: auto-bumped v42 → v43
SW v42 → v43. Commit: 41c13b0

### 7. CLAUDE.md audit — 288 → 165 řádků
Odstraněno: The Gathering design, Prioritní nedodělky, Tree budoucí rozšíření,
  Word Corrections tabulka, stale poznámky.
Přidáno: odkaz na smoke.py, hook, VOCAB v souborech.
Commit: 2762474

### 8. RUNAR_BACKTESTING.md — přidán do repozitáře
Původně jen na Desktopu. Aktualizován (smoke.py odkaz, Rune Walker/Keeper).

---

## Aktuální stav nástrojů

| Nástroj | Kde | Použití |
|---------|-----|---------|
| smoke.py | repo root | `python -X utf8 smoke.py` |
| check-translations.py | repo root | `python -X utf8 check-translations.py` |
| check-is.py | repo root | `python -X utf8 check-is.py` |
| hooks/pre-commit.py | repo | auto SW bump, instaluj přes install-hooks.py |
| RUNAR_BACKTESTING.md | repo | regression checklist |

---

## Workflow po této session

```
1. Edituj soubory (Python skripty pro JS)
2. python -X utf8 smoke.py          ← před commitem
3. git add <soubory>
4. git commit -m "..."              ← hook auto-bumpe SW
5. git push
```

---

## SW verze a commity

| Commit | Popis | SW |
|--------|-------|-----|
| 54a096b | fix auth SyntaxError | v41 |
| bc88573 | add check-translations.py | v41 |
| 5e13db0 | smoke.py + §10 opravy | v42 |
| 4143f95 | git hook + fix skripty | v42 |
| 41c13b0 | IS teaser fix + hook test | v43 |
| 2762474 | CLAUDE.md 288→165 řádků | v43 |

---

## TODOs — stav po této session

### ✅ Dokončeno v této session
- IS tree_rs_teaser (TODO #6)
- Smoke test infrastruktura
- SW auto-bump hook
- CLAUDE.md pod 200 řádků
- 8 §10 violations opraveno

### 🔴 Kritické (blokuje prodej)
1. Resend SMTP — magic link emaily z agndofa.is
2. Shopify webhook — automatický upgrade po nákupu
3. DPA Supabase — čeká na e-mail

### 🟡 Důležité
4. Rune Walker tier — způsob nákupu + reálný checkout
5. Privacy Policy odkaz na agndofa.is
6. claude-proxy: credit_cost param (Life Rune=3, Cross=5, Horseshoe=7)
7. Horseshoe prompt (buildHorseshoePromptIS/EN) — chybí
8. Yggdrasil prompt — chybí
9. runar-help.html inline JS — zbývající §10 strings

### 🟢 Střední priorita
- SSE streaming
- Monthly limit 50/75 enforcement v claude-proxy
- Weekly drip odstranit z claude-proxy
- Shrine audit
- runar-gathering.js: stará logika → NAHRADIT (čeká na tree_state DB)

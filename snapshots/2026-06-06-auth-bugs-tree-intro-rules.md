# Snapshot: 2026-06-06 — Auth bugs, Tree intro, §11/§12 rules
# Commity: 2762474 → a42d78c (SW v43→v46)

---

## Co bylo uděláno

### 1. FALSE/false banner bug — 10 oprav (runar-auth.js)
Vzor `cntEl.textContent = isIs\n  tp(...)` přiřazoval boolean místo textu.
10 výskytů fixováno: `fix-auth-banner-false.py` (regex).
SW v43 → v44.

### 2. Tree of Life — nový úvodní text (tree_intro)
- Nový translation klíč `tree_intro` (EN: "The Life Rune" / IS: "Lífsrúnin")
- Víceodstavcový HTML text — poetický úvod k DOB otázce
- `runar-tree.js:46`: `txt.innerHTML = t('tree_intro')` (bylo hardcoded IS/EN HTML)
- CSS: `.tree-intro-title` přidána do runar-reader.css
  `font-style:normal !important; font-size:0.78em; letter-spacing:0.18em; color:var(--gold); opacity:0.85; margin-bottom:1.8em !important`
- Klíče: 164 → 165. SW v44 → v45.

### 3. §12 — Name fallback rule (nové pravidlo)
`displayName()` v runar-app.js opravena:
```javascript
function displayName() {
  if (userName) return userName;
  if (currentUser) return lang === 'is' ? 'þú' : 'you';
  return lang === 'is' ? 'Gestur' : 'Visitor';
}
```
Bylo: `email.split('@')[0]` — NIKDY. Visitor = anonymous, bez emailu → 'Visitor'/'Gestur'.
Totéž opraveno v runar-tree.js:230.
Dokumentováno jako §12 v CLAUDE.md.

### 4. §11 — IS text v Python = literální znaky (nové pravidlo)
`\\uXXXXN` → JS `úN` (velká písmena zůstanou po hex sekvenci).
`name_modal_sub` IS byl corrupt: `RúNirnar`, `öðruvíNsi`, `þEKKja` atd.
Opraven na literální: `'Rúnirnar tala öðruvísi til þeirra sem þær þekkja að nafni.<br>Hvernig á ég að kalla þig?'`
Dokumentováno jako §11 v CLAUDE.md. Python skripty: VŽDY `python -X utf8`, NIKDY `\\uXXXX`.

### 5. IS tree_rs_teaser + další IS opravy
`runar-translations.js`: IS `tree_rs_teaser` opravena (Þæ→Þessi, verð→verið).

### 6. Gold separator removal (PENDING → další commit)
Uživatel chce odstranit zlatou krátkou čáru pod "Good to see you, Kuky." všude.
Hledáme v runar-reader.css (`.hero-greeting`, `.hero-divider` nebo pseudo-element).

---

## Nová pravidla v CLAUDE.md

### §11 — IS text v Python = literální znaky (NOVÉ)
```python
# ❌ NIKDY
'R\\u00faNirnar tala'  # → RúNirnar (corrupt!)
# ✅ VŽDY
'Rúnirnar tala'        # literální, -X utf8
```

### §12 — Name fallback = "you"/"þú" (NOVÉ)
- Přihlášený bez jména → `lang === 'is' ? 'þú' : 'you'`
- Visitor (anonymous) → `'Visitor'`/`'Gestur'`
- NIKDY `email.split('@')[0]`

---

## Překlady (runar-translations.js)
- 156 → 165 klíčů celkem (EN + IS)
- Nové klíče: sign_in_btn, name_modal_title/sub/skip/btn/ph, shrine_audio_lbl, invalid_date, tree_intro

---

## SW verze a commity (tato session)
| Commit | Popis | SW |
|--------|-------|-----|
| 2762474 | CLAUDE.md audit (předchozí session) | v43 |
| (auth banner fix) | FALSE/false banner fix | v44 |
| (tree intro) | tree_intro key + CSS | v45 |
| a42d78c | §11/§12 opravy | v46 |

---

## TODOs — stav po této session

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
- Monthly limit 50/75 v claude-proxy
- Weekly drip odstranit z claude-proxy
- Shrine audit
- runar-gathering.js: stará logika → NAHRADIT (čeká na tree_state DB)
- Gold separator pod hero greetingem — ODSTRANIT (pending)

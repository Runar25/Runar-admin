# Snapshot: 2026-06-06 — Vocabulary Architecture + Tier Renames
# Commity: fd10a1e → 220e4ef (SW v37→v40)

---

## Tier přejmenování (UI labely)

| DB hodnota | UI jméno |
|-----------|---------|
| standard | **Rune Walker** |
| premium | **Rune Keeper** |
| rune_seeker | Rune Seeker |
| free_trial | Visitor |

DB hodnoty BEZE ZMĚNY. Pouze UI labely.
Implementováno v: `TIERS.standard.label = 'Rune Walker'`, `TIERS.premium.label = 'Rune Keeper'`

Kde bylo potřeba opravit (bylo hardcoded):
- runar-app.js: tierLabels, tierNames mapy → nyní `TIERS[k].label/.label_is` dynamicky (Object.keys)
- runar-app.js: PANEL_TIERS tabulka → stále hardcoded (nutno, viz §8)
- runar-config.js: panel_props, onboarding_label, journal_label
- runar-auth.js: toasty, komentáře
- runar-journal.js: journal teaser text
- runar-reader.html, runar-help.html: viditelné labely
- runar-gathering.js: "Standard" → TIERS.standard.label přes tp()

---

## Vocabulary architektura (§10)

### VOCAB (runar-config.js)
```javascript
const VOCAB = {
  unit: { en: 'rune stone', en_pl: 'rune stones', is: 'rúnasteinn', is_pl: 'rúnasteinar' },
  cast: { en: 'cast',       en_pl: 'casts',        is: 'spá',        is_pl: 'spár'        },
  card: { en: 'Rune Card',  en_pl: 'Rune Cards',   is: 'Rúnakort',   is_pl: 'Rúnakort'   },
};
```

### Helpery (runar-utils.js)
```javascript
vn('unit', 9, 'en')  → '9 rune stones'   // plural z VOCAB
vn('cast', 1, 'is')  → '1 spá'
vl('card', 'is')     → 'Rúnakort'        // label bez čísla
tp('key', {vars})    → nahradí {placeholder} v t('key')
```

### Pravidlo §10 (CLAUDE.md)
NULA hardcoded strings v logice. Každý user-visible string přes:
- `t('key')` — statický z UI_TEXT
- `tp('key', {vars})` — šablona s proměnnými
- `vn('key', n, lang)` — plural vocabulary
- `vl('key', lang)` — vocabulary label

**Přidání jazyka = jen nový blok v UI_TEXT + VOCAB. Žádné jiné soubory.**

### Přejmenování (credit→rune stone, reading→cast, gift card→Rune Card)
- credit / credits → rune stone / rune stones (IS: rúnasteinn / rúnasteinar)
- reading / readings → cast / casts (IS: spá / spár)
- Reading Gift Card / READING GIFT CARD → Rune Card / RUNE CARD (IS: Rúnakort)
- tab label: ✦ READING → ✦ CAST (IS: ✦ SPÁ)
- journal title: YOUR READINGS → YOUR CASTS (IS: SPÁR ÞÍNAR)

### Stringy přesunuty z auth.js do UI_TEXT (tp() klíče)
rs_banner_counter, rs_banner_desc, rs_credits_counter, rs_credits_desc,
rs_exhausted_one, rs_exhausted_many, visitor_counter, visitor_desc,
visitor_exhausted, redeem_ok_msg, redeem_toast_msg, dam_text, reset_body,
gathering_upgrade, gathering_need_more

---

## Hardcoded hodnoty audit + opravy

### H1+H2: tierLabels/tierNames → TIERS config dynamicky
```javascript
// Bylo:
{ standard:'RUNE WALKER', premium:'RUNE KEEPER' }
// Je:
Object.keys(TIERS).forEach(k => { tierLabels[k] = TIERS[k][_lk].toUpperCase(); });
```

### H3: journalLimit() → TIER_LIMITS.rune_seeker.journal_entries
```javascript
// Bylo: return 5;
// Je: return TIER_LIMITS.rune_seeker.journal_entries;
```

### BUG: "all five"/"alla fimm" → FREE_REGISTERED_LIMIT conditional
(Bylo ze starého designu kdy RS měl 5 free/měsíc. Nyní = 1.)

### M1: Tree tab — credits a free reading zobrazeny separátně
- `your balance:` → `your credits:` (is: `kredit:` → `rúnasteinar:`)
- Nový element `tree-rs-free-line` zobrazuje free reading stav

---

## Opravené IS chyby

- `LESTRAR ÞEINIR` (wrong) → `SPÁR ÞÍNAR` (correct)
- `Þæ rúna hefur verð þín` — POZOR: stále obsahuje chyby (Þæ, verð místo varið)
  TODO: opravit IS tree_rs_teaser
- Exhaused state IS text měl garbage chars z špatných escape sekvencí → opraveno

---

## Aktuální stav souborů

| Soubor | Co se změnilo |
|--------|--------------|
| runar-config.js | VOCAB, TIERS labels, TIER_LIMITS labels+panel_props |
| runar-utils.js | vn(), vl(), tp() helpery |
| runar-translations.js | 20+ nových klíčů, přejmenování vocab |
| runar-auth.js | 13 hardcoded bloků → t()/tp()/vn() |
| runar-app.js | tierLabels/tierNames z TIERS, tab label, gift card strings |
| runar-journal.js | journalLimit() z TIER_LIMITS |
| runar-tree.js | free line → vn(), tooltip → vn() |
| runar-gathering.js | 2 hardcoded strings → tp() |
| runar-reader.html | static text → Rune Card, tree-rs-free-line element |
| runar-reader.css | .tree-cta-free style |
| runar-help.html | RUNE WALKER/KEEPER labely |
| sw.js | v36 → v40 |

---

## TODOs z této session

1. IS tree_rs_teaser opravit: `'Þæ rúna hefur verð þín frá fyrsta andardráttinum...'`
   → `'Þessi rúna hefur verið þín frá fyrsta andardráttinum...'`
2. claude-proxy: credit_cost param pro multi-credit deduction (Life Rune=3, Cross=5)
3. Horseshoe prompt (buildHorseshoePromptIS/EN) — chybí
4. Yggdrasil prompt — chybí
5. Resend SMTP, Shopify webhook, DPA (kritické)
6. `gathering.js`: stará logika (manuální výběr) → NAHRADIT (čeká na tree_state DB)
7. `hero-eyebrow` říká "THE RUNE KEEPER" — může kolidovat s tier názvem Rune Keeper (low priority)
8. Zbývající hardcoded strings v runar-help.html inline JS (help content sekce)

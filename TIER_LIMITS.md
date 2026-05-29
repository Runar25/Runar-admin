# RÚNAR — Tier Limits
# Editovatelná tabulka. Změň hodnoty → pošli Claudovi → propaguje se do kódu.
# Sloupec POZNÁMKA je pro tvoje doplnění — piš tam co chceš změnit nebo proč.
# Poslední aktualizace: 2026-05-29

---

## SYSTÉM LIMITŮ — principy (rozhodnuté ✅)

**Balance systém** (ne count-per-period):
- Každý uživatel má `free_balance` — kolik čtení má aktuálně k dispozici
- Každé čtení odečte z free_balance nebo z credits_balance
- Weekly drip přidá +1 POUZE pokud free_balance = 0 — nedoplňuje se nad 1
- Kredity (Reading Gift Card) jsou separátní balance — vždy dostupné

**Personalizace (Area of Life / Seeking):**
- FREE BALANCE: ❌ locked — "zabavné čtení" bez kontextu
- KREDITY: ✅ plně odemčeno
- STANDARD/PREMIUM: ✅ plně odemčeno

**✅ ROZHODNUTO 2026-05-29:**
Free balance → POUZE single rune (1 balance = 1 čtení single runy)
Spreads (Trojice, Kříž, atd.) → VŽDY kredity
Důvod: weekly free = "týdenní dotek s runami". Spreads jsou prémiový zážitek.

---

## TIER: VISITOR (free_trial — nepřihlášený)

| Parameter | Hodnota ✅ | Poznámka |
|-----------|-----------|---------|
| Onboarding free balance | **1** | 1 čtení, pak gate — ZMĚNA z 3 |
| Weekly drip | ❌ | Musí se registrovat |
| Credits | ❌ | |
| Voice | ❌ | |
| DOB pole | locked — teaser | |
| Area of Life | locked — teaser | |
| What are you seeking | locked — teaser | |
| Runes collection | 1 (jen Fehu) | |
| Journal | ❌ | |
| The Gathering | ❌ | |
| Specific Question | ❌ | |

---

## TIER: RUNE SEEKER (rune_seeker — registrovaný, zdarma)

| Parameter | Hodnota ✅ | Poznámka |
|-----------|-----------|---------|
| Onboarding free balance | **3** | Při registraci — hned k dispozici |
| Weekly drip (každé pondělí) | **+1** POUZE pokud free_balance = 0 | Non-cumulative — balance nikdy > 1 po onboardingu |
| Max balance po utracení onboardingu | **1** | |
| Credits (Reading Gift Card) | ✅ bypass + plná personalizace | |
| Area of Life — free balance | ❌ locked (první 3 viditelné) | Jen "fun reading" bez kontextu |
| Area of Life — s kredity | ✅ vše odemčeno | |
| Seeking — free balance | ❌ locked (1. viditelná) | |
| Seeking — s kredity | ✅ vše odemčeno | |
| Voice — free čtení | ✅ | |
| Voice — kreditní čtení | ✅ | |
| Runes collection | 25 | |
| Journal entries (max) | last **5** | |
| The Gathering | **1× zdarma** (z balance), pak Standard+ | |
| Specific Question | ❌ teaser | |

---

## TIER: STANDARD

| Parameter | Hodnota | Poznámka |
|-----------|---------|---------|
| Free balance | unlimited | |
| Area of Life | ✅ vše | |
| Seeking | ✅ vše | |
| Voice | ✅ všechna čtení | |
| Runes collection | 25 | |
| Journal entries | unlimited + filtry | |
| The Gathering | ✅ 1×/týden | |
| Specific Question | ✅ | |
| Max tokens / čtení | TBD | Zatím neimplementováno |
| Cena | TBD | |

---

## TIER: PREMIUM

| Parameter | Hodnota | Poznámka |
|-----------|---------|---------|
| Free balance | unlimited | |
| Vše jako Standard | ✅ | |
| Ceremonial mode | coming soon | |
| Max tokens / čtení | TBD | |
| Co navíc oproti Standard | TBD | Upřesnit |
| Cena | TBD | |

---

## SPREAD COSTS ✅ (rozhodnuto 2026-05-29)

Pravidlo: cost = počet run. Free balance = POUZE single rune. Vše ostatní = kredity.

| Spread | Free balance cost | Credits cost | Dostupné pro RS free? | Poznámka |
|--------|-------------------|--------------|----------------------|---------|
| 1 runa (single) | **1** | **1** | ✅ | Týdenní dotek s runami |
| Trojice (3 runy) | ❌ jen kredity | **3** | ❌ | |
| Kříž (5 run) | ❌ jen kredity | **5** | ❌ | |
| The Gathering (3–7 run) | ❌ jen kredity | **= počet run** | 1× výjimka zdarma | |
| Podkova (7 run) | ❌ jen kredity | **7** | ❌ | |
| Norny (9 run) | ❌ jen kredity | **9** | ❌ | |
| Yggdrasil (9 světů) | ❌ jen kredity | **9** | ❌ | 1× ročně, jen Standard+ |
| **Life Rune Reading** | ❌ jen kredity | **10** | ❌ | Hluboké čtení životní runy — implementace later |

---

## DB SCHEMA — změny v Supabase (SQL migrace)

```sql
-- Přidat do user_profiles:
ALTER TABLE user_profiles
  ADD COLUMN free_balance  int  NOT NULL DEFAULT 1,
  ADD COLUMN drip_week     text;   -- ISO week (např. "2026-W22")

-- Nastavit správné počáteční hodnoty:
UPDATE user_profiles SET free_balance = 3 WHERE tier = 'rune_seeker';
UPDATE user_profiles SET free_balance = 1 WHERE tier IN ('free_trial', 'standard', 'premium');

-- Pozn: existující RS mohou mít jiný balance než 3 (již použili nějaká čtení).
-- Migrace je zjednodušená — nastaví je na čistý start.
```

Logika v claude-proxy (po migraci):
```
1. Při každém requestu zkontroluj free_balance uživatele
2. Pokud pondělí nového týdne AND free_balance = 0:
   → free_balance += 1, drip_week = current_ISO_week (atomicky)
3. Při čtení s kredity:
   → credits_balance -= spread_cost, Area/Seeking odemčeno
4. Při čtení bez kreditů (free_balance):
   → free_balance -= 1 (jen single rune), Area/Seeking locked
```

---

## TEXTY — aktualizovat po rozhodnutí

| ID | Aktuální | Nový návrh | Stav |
|----|---------|-----------|------|
| visitor_gate | "five readings each month…" | "Begin your path. One reading, then join Rúnar's circle — it costs nothing." | ⚠️ Upřesnit |
| rs_onboarding_banner | "5 readings each month…" | "Three readings to begin. After that, one each week — yours when you need it." | ⚠️ Upřesnit |
| rs_empty_banner | "The stones rest until the new month…" | "The stones rest. Your next reading arrives Monday — if you need it." | ⚠️ Upřesnit |
| rs_tier_prop | "5 Readings / month." | "3 readings to start · 1 each week after" | ⚠️ Upřesnit |
| visitor_gate_html | "five readings…" | Stejné jako visitor_gate | ⚠️ |

---

## IMPLEMENTAČNÍ PLÁN — co se změní v kódu

| Soubor | Změna | Priorita |
|--------|-------|----------|
| `supabase` SQL | `free_balance` + `drip_week` do `user_profiles` | 1. první |
| `runar-config.js` | `TIER_LIMITS` + `SPREAD_COSTS` objekty | 2. |
| `claude-proxy` | Balance logika místo weekly drip count | 3. |
| `runar-app.js` | `FREE_TRIAL_LIMIT` → 1, texty z `TIER_LIMITS` | 4. |
| `runar-reader.html` | Texty z konfigurace | 5. |
| `runar-help.html` | Texty z konfigurace | 6. |

---

## JAK POUŽÍT

1. Vyplň sloupec **Poznámka** nebo změň hodnotu
2. Pošli soubor nebo zkopíruj změny do chatu
3. Claude aktualizuje vše najednou — SQL, backend, frontend, texty


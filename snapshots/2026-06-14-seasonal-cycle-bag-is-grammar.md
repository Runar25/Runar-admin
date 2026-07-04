# Snapshot 2026-06-14 — Celý sezónní cyklus + shuffle-bag + IS gramatika

## SW: v99 · Commit: f55ace1
## (navazuje na 2026-06-12-seasonal-imagery-reading-tuning.md)

---

## 1. Problém (KUKY hlásil)
Single výklady pořád opakovaly „midnight light / midnight sun". Diagnóza skriptem
`compare_seasonal.js` (10 run, identický kontext): **midnight sun v 10/10**, často jako
úvodní věta. Příčina: stará `_seasonalImagery` měla úzkou paletu + instrukci „SEASONAL
IMAGE (binding): your one nature image MUST come from this season — ..." → model chytl
nejsilnější obraz (půlnoční slunce) a lepil ho do každého čtení.

## 2. Řešení — celý roční cyklus + sáček (f55ace1)
`_seasonalImagery(lang, drawn)` přepsán:
- **`SEASON_POOLS`** = 6 sezón (deepwinter, spring, earlysummer, highsummer, autumn,
  darkening), každá má **`bright`** (světlé/teplé) i **`cold`** (studené/drsné) pole.
  Každý obraz = `{ id, en, is }`. id je stabilní → sáček přežije pozdější úpravy poolu.
- **localStorage shuffle-bag** `_seasonBagPick(bucket, kind, ids)`: rozdá každý obraz
  jednou než se opakuje, pak reset (zamíchá a jede znovu). Klíč `seasonbag_<bucket>_<kind>`.
  Per zařízení. Guard `typeof localStorage !== 'undefined'` → mimo prohlížeč fallback random.
- **Cold-steering**: `_COLD_RUNES = [Isa, Hagalaz, Nauthiz, Thurisaz]` → losují z `cold`
  setu → Isa zůstává STUDENÁ ale v sezóně (norðanvindur / jökulvindur / þoka, NE sníh-mimo-sezónu).
- **„binding/MUST" → „if one arises"**: přírodní obraz je VOLITELNÝ, ne povinný do každé věty.
- Single buildery (IS+EN) předávají `drawn`; **multi-rune kreslí z `bright`** (bez 2. argumentu).

## 3. Ověření (compare_seasonal.js — má localStorage shim, testuje skutečný sáček)
- A) 10 různých run → reálná čtení: **midnight sun 1/10** (jen Perth), každé má vlastní obraz.
- B) injektované obrazy: **9/10 unikátních**; 1 opakování = korektní reset (bright pool 7 obrazů
  vs 8 „teplých" run → po 7 zamíchá → 8. tah může padnout znovu). PŘESNĚ KUKYho spec.
- C) Isa ×8: všech 8 STUDENÝCH a v sezóně (5 unikátních z 5-prvkového cold poolu), ŽÁDNÝ sníh.

## 4. ⭐ ARCHITEKTURA: deník/Strom vs sezónní sáček (KUKY otázka)
Sáček PATŘÍ do localStorage, NE do deníku/Stromu:
- **Deník / Strom života** = SMYSLUPLNÝ záznam (runy, kdy, oblast, vzorec) → DB, per-účet → `tree_state`.
- **Sezónní sáček** = KOSMETIKA (která variace mlhy padla) → localStorage, per-zařízení, vyhoditelné.
- Smysl sezóny (KDY člověk čte, zima/léto) už v deníku JE — v `created_at`. Budoucí Strom si
  sezónu odvodí z data; nepotřebuje vědět, který obraz jsme ukázali. Sáček = vědomě izolovaný.

## 5. ⭐ IS GRAMATIKA — lekce (KUKY ověřil 3 opravy)
Moje chyby v IS poolech byly VŠECHNY špatný ROD podstatného, ne skloňování přídavného:
- `frost` = hvorugkyn → „hart frost" (sterk), „fyrsta harða frostið" (veik, po -ið + řadovce). NE „harður" (kk).
- `súld` = kvenkyn → „grá súld". NE „grátt" (hk).
- Past: `frostbiti` = kk → „harður frostbiti" ✅ (stejný kořen, jiný rod než `frost`).
- Určitý člen (-ið/-inn/-in) spouští VEIK skloňování.
**Pravidlo:** urči rod (kk/kvk/hk) PRVNÍ, pak vyber tvar přídavného. Neodhadovat z koncovky/angličtiny.
Slovník rodu přírodních slov + detail → working-style.md (§ Islandská gramatika).
Trvalá paměť: `is-grammar-adjective-gender.md`. KUKY: Rúnar je hodně o islandštině → čím lepší, tím líp.

---

## Stav na konci
SW v99 · runar-character.js pushnuté · patch skripty v scripts/archive/ ·
compare_seasonal.js v scripts/utils/ · paměť+docs zrcadleno.

### Zbývá (netýká se dneška)
- 🔴 Launch: Resend SMTP, Shopify webhook, Standard checkout
- 🟢 Tree of Life paměť (tree_state) — REDESIGN (viz 2026-06-12-seasonal #7)
- 🟢 Možnost: přidat víc obrazů do poolů (sáček delší cyklus); regression patterny do check-is

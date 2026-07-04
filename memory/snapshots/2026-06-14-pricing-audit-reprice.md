# Snapshot 2026-06-14 (část 2) — Pricing audit + reprice kreditů 1/2/3/4/5

## SW: v102 · Commits: cd496f3 (zkrácení Norns/Kríž) + abefbda (reprice + docs)

---

## 0. Spouštěč
Změnili jsme délky čtení → KUKY: „ovlivní nám to i pricing... at nas chain je nenaruseny... udelej to poradne."
Celý cenový řetězec stál na čísle „Single = 430 EL znaků" z 9. 6. (PŘED zkrácením). Stálo.

## 1. Měření (script scripts/utils/measure_reading_costs.js — REUSABLE)
Reálné délky (current prompts, EN, 3-4 vzorky/typ, prod proxy):
| Typ | znaky | vs doc |
|---|---|---|
| Single | 358 | bylo 430 (−17 %) |
| Norns | 773 (po zkrácení) | bylo doc 700 |
| Kríž | 1028 (po zkrácení) | bylo doc 900 |
| Horseshoe | 1367 | bylo doc 1200 |
| Yggdrasil | 1661 | bylo doc 1500 |
| Life Rune | 1173/1452 (TEXT, bez hlasu — ověřeno v tree.js) | EL=0 |
ZJIŠTĚNÍ: doc multi-rune PODCEŇOVAL; single nadhodnocoval. Měřit, ne hádat.

## 2. Zkrácení Norns + Kríž (KUKY: cca 700 / 1000) — commit cd496f3
runar-character.js: Norns 8-9→5-6 setningar (EN+IS), Kríž 9-10→6-7 (EN+IS).
Ověřeno: Norns avg 773, Kríž avg 1028. Horseshoe/Yggdrasil/Single beze změny.

## 3. ⭐ Kreditní škála 1/2/3/4/5 — ODVOZENÁ Z NÁKLADŮ (commit abefbda)
Náklad/čtení IS (EL $0.10/1k + Claude Sonnet s cachingem):
single $0.038 · Norns $0.081 · Kríž $0.108 · Horseshoe $0.143 · Yggdrasil $0.174 · Life Rune $0.006.
Poměr k single: 1 / 2.1 / 2.8 / 3.8 / 4.6 → zaokrouhleno NAHORU → **1/2/3/4/5**.
DŮSLEDEK: protože kredity kopírují nákladový poměr, **marže/kredit je jednotná ~98 %** napříč typy. Elegantní.
- Single 1 · Norns 2 · Kríž 3 · Horseshoe 4 · Yggdrasil 5
- **Life Rune 3** (KUKY) — text-only, triviální náklad, ale vysoká vnímaná hodnota (osobní podpis + brána Stromu). Marže 99.9 %.
- **Founding ritual = Norns = 2** (bylo 3) — je to Norns, účtuj jako Norns; levnější vstup do Stromu.
KÓD: SPREAD_COSTS (zdroj odečtu, callProxy) + SPREAD_CONFIG.credits (zrcadlo) — oba updated. single/life_rune/gathering beze změny.

## 4. Předplatné sjednoceno na jednotky čtení (KUKY ano)
Standard/Premium limit (50/75) počítá teď STEJNÉ jednotky jako RS kredity (Yggdrasil=5 z limitu, ne 9).
Worst-case náklad SE NEMĚNÍ: single = 1 jednotka = 358 zn = strop (50 single = 17 900 zn/měs ať tak či tak).
Spread-uživatel dostane víc hodnoty bez vyššího stropu. Jeden mentální model app-wide.
POZN.: enforcement limitu v claude-proxy = stále TODO; až se postaví, odečítá credit value.

## 5. Přepočítané marže (worst-case all-single) — VYVÁŽENÉ
| | Náklad IS | Náklad EN | Marže IS | Marže EN |
|---|---|---|---|---|
| Standard (50, 3.490 ISK ≈ $28) | $1.89 (bylo $2.60) | $1.00 | 93 % | 96 % |
| Premium (75, 4.900 ISK ≈ $40) | $2.84 (bylo $3.89) | $1.49 | 93 % | 96 % |
Per-jednotka: Standard ~70 ISK, Premium ~65 ISK (volume sleva) → ~3× levnější než kredit (200 ISK) → trychtýř drží.
ZÁVĚR (KUKY otázka): ceny Standard/Premium ZŮSTÁVAJÍ vyvážené, žádná změna nepotřeba.
ElevenLabs prahy +~20 % kapacity (Creator ~56 už, bylo 47). Akvizice $0.038 IS / $0.020 EN.

## 6. Opraveno v RUNAR_PRICING.md (chain)
Base 430→358, cost table (měřená čísla + sloupec Kredity), credit scale, margins, EL prahy, acquisition,
RS „3 free/month"→Model B (1 free při reg.), founding 5→2, předplatné=jednotky, datumy. CLAUDE.md: délky + kredit tabulka.

---

## Stav
SW v102 · vše pushnuté · patch skripty v scripts/archive/ · measure_reading_costs.js v scripts/utils/ · docs+paměť zrcadleno.

### Zbývá
- 🔴 Launch: Resend SMTP, Shopify webhook, Standard checkout
- 🟡 Monthly limit enforcement (50/75 jednotek) v claude-proxy — TODO (až se postaví, odečítá credit value)
- 🟢 Tree of Life paměť (tree_state) — REDESIGN
- 🟢 Možnost: modelovat realistický mix čtení místo worst-case all-single (náklad ještě nižší)

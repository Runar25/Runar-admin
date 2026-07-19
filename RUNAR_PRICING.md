# Rúnar — Pricing & Business Model
# Language: English (working document)
# Status: In progress — numbers subject to change
# Last updated: June 16 2026 (reading costs; credit scale 1/2/3/4/5; operating costs + Iceland taxes + break-even)
# ElevenLabs prices verified: June 9 2026 (elevenlabs.io/pricing/api)
# Reading costs measured: June 14 2026 (scripts/utils/measure_reading_costs.js)

---

## Core Philosophy

Rúnar is not an app. It is a personal guide with voice, memory, and a living tree.
Pricing must reflect that — not compete with generic tarot apps ($10/month).

The funnel has one direction:
```
Physical product (rune set, chocolate...)
        ↓
Free credit inside (1 reading, voice included)
        ↓
User experiences Rúnar — wants more
        ↓
Credits are expensive per reading
        ↓
Standard subscription = obvious choice
```

Credits are not a product. They are acquisition cost.
Standard subscription is the product.

---

## Cost per Reading (production cost)

**Measured 2026-06-14** (script `scripts/utils/measure_reading_costs.js`, 3–4 real samples/type via prod proxy).
Supersedes the old "430 char" base — readings were re-tuned 2026-06-12/14 (single shortened, Norns→~770, Kríž→~1030).
Claude model: Sonnet 4-5 ($3/$15 per 1M in/out). Stored in claude-proxy/index.ts — not in frontend.
Prompt caching: ✅ deployed (2026-06-09). System prompt (~960 tok EN / ~1.045 IS) cached, ephemeral 5min TTL.
ElevenLabs: Multilingual v2/v3 (IS) $0.10/1k chars / Flash (EN) $0.05/1k chars. EL chars = reading text length.

| Reading | EL chars | ~out tok | Claude | EL IS | EL EN | Total IS | Total EN | Credits (RS) |
|---------|----------|----------|--------|-------|-------|----------|----------|--------------|
| Single | 358 | 90 | $0.002 | $0.036 | $0.018 | **$0.038** | **$0.020** | **1** |
| Norns (3) | 773 | 145 | $0.004 | $0.077 | $0.039 | **$0.081** | **$0.043** | **2** |
| Kríž (5) | 1.028 | 185 | $0.005 | $0.103 | $0.051 | **$0.108** | **$0.056** | **3** |
| Horseshoe (7) | 1.367 | 342 | $0.006 | $0.137 | $0.068 | **$0.143** | **$0.074** | **4** |
| Yggdrasil (9) | 1.661 | 415 | $0.008 | $0.166 | $0.083 | **$0.174** | **$0.091** | **5** |
| Life Rune | 0 (text, no voice) | 293–363 | $0.006 | — | — | **$0.006** | **$0.006** | **0** |
| Founding ritual (= Norns) | 773 | 145 | $0.004 | $0.077 | $0.039 | **$0.081** | **$0.043** | **2** |

**Credit scale derived from cost ratio vs single:** Norns 2.1× → 2 · Kríž 2.8× → 3 · Horseshoe 3.8× → 4 · Yggdrasil 4.6× → 5.
Credits round up from raw cost ratio → margin per credit is uniform (~98 %) across all reading types.

**Life Rune is FREE — 0 credits (KUKY 2026-07-19).** It is text-only, so the voice never happens, and voice is
~95 % of what a reading costs us; the true cost is ~$0.006. This is deliberate acquisition spend, not a pricing
accident: the Life Rune is the gateway into the Tree of Life, and the Tree is what brings people back.
The earlier rationale („3 credits reflects perceived value“) is **retired** — it priced against cost while every
other row in the table priced with it, and an exception nobody remembers choosing eventually reads as a bug.

⚠️ Enforced by the PROXY (`mode === "life_rune"`), not by the number in `SPREAD_COSTS`. The client may not
declare its own reading free — that is why `Math.max(1, spread_cost)` stays.

**Free credit acquisition cost (1 single w/ voice): ~$0.038 per user (IS) / ~$0.020 (EN).**
This is the cost to bring a new user into Rúnar. Extremely low.

Note: IS = Icelandic voice (Multilingual v2/v3). EN = international/tourist voice (Flash).
Voice model follows app language — user switches language in app settings → readings use that language's model. ✅ implemented.
Worst-case cost per reading-unit is the **single** (358 chars/unit); all spreads cost fewer chars per unit (Yggdrasil 332/unit).

---

## Tier Structure

### Visitor (free_trial)
- 1 reading total, voice included
- Single rune only (Fehu)
- No tree, no journal
- Purpose: show what Rúnar is

### Rune Seeker (rune_seeker)
- **Model B: 1 free reading at registration (with voice), no monthly reset.** Single source = DB `free_balance` (default 1).
- Additional readings via credits
- **Credit cost = per reading type**, not rune count. Values live in `SPREAD_COSTS`
  (`v2/runar-config.js`) — the table further down is the single copy in this doc (§20).
- Access: all spreads via credits (Single, Norns, Kříž, Horseshoe, Yggdrasil)
- Credits are deliberately expensive — engaged user self-selects into subscription
- Tree founding = Life Rune + founding Norns. Costs = SPREAD_COSTS (config), not repeated here.
  Terminology: „founding" alone = the Norns reading; „tree founding" = Life Rune + Norns together.
- Journal: last 5 entries
- Purpose: entry point, credit buyer, gift card recipient

### Standard (~$28/month)
- 50 reading-units/month limit
- All spreads including Yggdrasil (peak window: 1 week before/after solstice = full tree weight)
- Full Tree of Life. **Founding ritual is NOT free** — it costs its reading-units like any other
  reading (KUKY 2026-07-18). Rune Seekers may be *gifted* founding credits as a marketing move
  (campaign, onboarding push), but that is promotion, not a product entitlement.
- Full journal
- Voice included
- Life Rune: full reading (1200 tokens)
- Purpose: main product, target for all funnels

### Premium (~$36/month)
- 75 reading-units/month limit
- Everything in Standard
- Life Rune: deeper reading (2000 tokens) + name etymology + mythological figure
- Future: cacao ceremonial, other features TBD
- Purpose: depth, for committed users

**Counting (unified with RS credits):** a reading costs its credit value from the monthly limit.
One model app-wide; values = `SPREAD_COSTS`, not repeated here (§20).
Worst case is unchanged: single = 1 unit = 358 chars is the cost ceiling (50 single = max 17.900 chars/mo).
Spread-heavy users get more value (Yggdrasil 5 units, was 9 runes) at no extra worst-case cost.
*(Monthly-limit enforcement is **live** in claude-proxy since 2026-07-16 — it deducts the credit
value and returns 402 `monthly_limit` when exceeded. Guarded by smoke ⑨.)*

---

## Spreads per Tier

| Spread | Rune count | Credits | Visitor | Rune Seeker | Standard | Premium |
|--------|-----------|---------|---------|-------------|---------|---------|
<!-- "Rune count" = kolik run se táhne (info), NE cena. Cena = sloupec Credits. -->

| Single | 1 | 1 | 1× total | 1 free at reg. + credits | ∞* | ∞* |
| Norns | 3 | 2 | ❌ | credits | ∞* | ∞* |
| Kříž | 5 | 3 | ❌ | credits | ∞* | ∞* |
| Horseshoe | 7 | 4 | ❌ | credits | ∞* | ∞* |
| Yggdrasil | 9 | 5 | ❌ | credits | ✅ anytime* | ✅ anytime* |

*Within monthly reading-unit limit (Standard: 50 units, Premium: 75 units) — a spread costs its credit value.
*Yggdrasil: available anytime, but full branch_weight only within 1 week before/after solstice. Outside window → reading happens, reduced tree impact.

**Credit cost = per reading type.** Konkrétní čísla vlastní `SPREAD_COSTS` v `v2/runar-config.js` — zde se
neopisují (§20). Pravidlo, které je pod nimi: **platí se za hlas.** Textové čtení je zdarma, protože
~95 % ceny čtení je TTS.
Decoupled from rune count (old model was 1 rune = 1 credit).

---

## Credit Packages (Rune Seeker purchases)

Credits are priced to make Standard subscription clearly more attractive.
Engaged user (50 single/month = 50 credits) at Master price = 9.990 ISK vs Standard 3.490 ISK → saves ~6.500 ISK/mo.

| Package | Credits | ISK | ISK/credit |
|---------|---------|-----|------------|
| Starter | 5 | 1.490 ISK | 298 ISK |
| Seeker | 10 | 2.490 ISK | 249 ISK |
| Wanderer | 20 | 4.490 ISK | 225 ISK |
| Elder | 30 | 6.490 ISK | 216 ISK |
| Master | 50 | 9.990 ISK | 200 ISK |

Credit value unchanged (200–298 ISK/credit). Under the new scale a credit buys a single reading; spreads cost 2–5 credits.
A subscriber pays ~65–70 ISK/reading-unit (see below) — ~3× cheaper than the cheapest credit. This is the upgrade argument — real math.

---

## Subscription Pricing

| | Standard | Premium |
|--|---------|---------|
| ISK/month | 3.490 ISK | 4.900 ISK |
| EUR/month | ~€24 | ~€34 |
| USD/month | ~$28 | ~$40 |
| ISK/year | 34.800 ISK | 49.000 ISK |
| Annual/month equiv. | 2.900 ISK | 4.083 ISK |
| Annual discount | ~17% | ~17% |
| Rune limit | 50/month | 75/month |

Annual logic: ~17% discount ("pay 10 months, get 12" logic).
Standard annual saves ~7.080 ISK/year vs monthly. Premium annual saves ~11.800 ISK/year.

Exchange rates (June 2026): €1 = 143.6 ISK / $1 = 123.5 ISK. ISK prices are fixed.

### Standard value vs credits
Engaged user (50 single/month = 50 credits):
- At Master credit price: 9.990 ISK/month
- Standard subscription: 3.490 ISK/month
- **User saves ~6.500 ISK/month on Standard**

Per-unit subscription price: Standard 3.490 / 50 = **~70 ISK/reading-unit** · Premium 4.900 / 75 = **~65 ISK/unit**.
Premium is slightly cheaper per reading (volume discount) + deeper features → balanced. Both ~3× cheaper than the cheapest credit (200 ISK).

---

## Cost & Margin Analysis

### API cost per user per month — worst case (50/75 units all-single = cost ceiling)

A single is the most expensive reading-unit (358 chars/unit); any spread usage lowers this. Numbers below are the ceiling.

| Cost item | Standard (50) IS | Standard EN | Premium (75) IS | Premium EN |
|-----------|------------------|-------------|-----------------|------------|
| ElevenLabs (text length) | 50×358×$0.10/1k = $1.79 | $0.90 | 75×358×$0.10/1k = $2.69 | $1.34 |
| Claude API | 50×~$0.002 = $0.10 | $0.10 | 75×~$0.002 = $0.15 | $0.15 |
| **Total/month** | **$1.89** | **$1.00** | **$2.84** | **$1.49** |

### Plan margins (at worst-case cost)

| Plan | ISK/month | USD/month | Cost IS | Margin IS | Cost EN | Margin EN |
|------|-----------|-----------|---------|-----------|---------|-----------|
| Standard monthly | 3.490 ISK | $28.27 | $1.89 | **93%** | $1.00 | **96%** |
| Standard annual (equiv.) | 2.900 ISK | $23.48 | $1.89 | **92%** | $1.00 | **96%** |
| Premium monthly | 4.900 ISK | $39.68 | $2.84 | **93%** | $1.49 | **96%** |
| Premium annual (equiv.) | 4.083 ISK | $33.06 | $2.84 | **91%** | $1.49 | **96%** |

Standard and Premium margins are equal and healthy (~93% IS / ~96% EN). Prices remain balanced — no change needed.

⚠️ Fixed infra is **~$202/month**, not ~$30 — the full breakdown (Claude, Shopify, Supabase,
ElevenLabs, Apple, Hetzner, domain) is in „Operating costs, taxes & break-even" below, and
**break-even is ~8 users, not 2**. This paragraph counted only Hetzner + Supabase and contradicted
its own document; corrected 2026-07-18. Do not restate the number here — that section owns it.

### Revenue & profit projections (realistic mix: 70% Standard / 30% Premium, 60% annual / 40% monthly, 50% IS / 50% EN)

Worst-case API cost (all-single) ≈ $1.66/user blended. Real usage (spreads) is lower → these are conservative.

| Users | Revenue/month | API costs | Infra | Net profit | Margin |
|-------|---------------|-----------|-------|-----------|--------|
| 10 | ~$240 | ~$17 | $30 | ~$193 | 80% |
| 50 | ~$1.200 | ~$83 | $30 | ~$1.087 | 91% |
| 100 | ~$2.400 | ~$166 | $30 | ~$2.204 | 92% |
| 200 | ~$4.800 | ~$332 | $30 | ~$4.438 | 92% |
| 500 | ~$12.000 | ~$830 | $30 | ~$11.140 | 93% |

---

## ElevenLabs Plan — When to Upgrade

Model: Multilingual v2/v3, $0.10/1k chars. Overage rate = plan rate.
Assumption: worst-case 50 single/user/month × 358 chars = **17.900 chars/user/month** (was 21.500 at old 430-char single).

| Plan | $/month | Multilingual chars included | Readings | ~Engaged users | Upgrade at |
|------|---------|----------------------------|----------|----------------|------------|
| Creator | $22 | 220.000 | 614 | ~12 | ~56 users |
| Pro | $99 | 990.000 | 2.765 | ~55 | ~167 users |
| Scale | $299 | 2.990.000 | 8.352 | ~167 | ~553 users |
| Business | $990 | 9.900.000 | 27.654 | ~553 | 553+ → Enterprise |
| Enterprise | Custom | Custom | — | 553+ | Contact ElevenLabs |

**Upgrade logic:** Stay on current plan until monthly overages + plan cost exceed next plan price.
- Creator → Pro: at ~56 users
- Pro → Scale: at ~167 users
- Scale → Business: at ~553 users
- Business → Enterprise: at 553+ users (at this revenue ~$120k+/year, strong negotiating position)

**Start on Creator.** Creator is cost-effective up to ~56 users (was ~47 — shorter single extended capacity ~20%).
Do NOT jump to Pro at launch — overages are fine and cheaper until ~56 paid users.
Real usage (spreads cost fewer chars/unit) pushes all these crossovers higher — these are conservative worst-case (all-single).

Flash (EN) plan: same upgrade logic, but costs are 2× lower so crossover points roughly double.
At mixed IS/EN user base, actual crossover points are higher than the IS-only estimates above.

---

## Operating costs, taxes & break-even (Agndofa ehf., Iceland)

> Planning model (interactive calculator, 2026-06-15). **Estimates — verify with an accountant (endurskoðandi).**
> Rates change yearly and depend on company form. Sources at the end of this section.
> All listed costs are tax-deductible business expenses (reduce taxable profit).

### Fixed monthly costs (USD)

| Item | $/month | Note |
|------|---------|------|
| Claude (dev / Max) | 100.00 | development cost — drops once the app is built |
| Shopify (Basic plan) | 39.00 | online store / gift cards / credits |
| Supabase Pro | 25.00 | DB + edge functions |
| ElevenLabs (Creator base) | 22.00 | voice; steps up to Pro $99 (~50 users), Scale $299 (~170) |
| Apple Developer ($99/yr) | 8.25 | amortized |
| Hetzner server | 6.00 | |
| Domain agndofa.is | 1.50 | amortized |
| Google Play ($25 one-time) | 0.70 | amortized over ~36 mo |
| Resend (email) | 0.00 | free tier at launch volume |
| **Total fixed** | **~$202.45** | |

One-time: Google Play $25. Annual: Apple Developer $99.

### Variable per paying user / month

| Item | $/user | Note |
|------|--------|------|
| Claude API + ElevenLabs voice | ~0.85 | realistic blend IS/EN |
| Payment processing (Shopify ~2.9% + ~$0.30/txn) | ~0.96 | on gross revenue |
| **Total variable** | **~$1.81** | |

Revenue per paying user ≈ 3.518 ISK/mo (~$28.5), blended 70% Standard / 30% Premium, 60% annual / 40% monthly.

### Icelandic taxes & mandatory contributions

- **VAT (VSK) 24 %** — consumer prices are VAT-inclusive → net revenue = price ÷ 1.24. Below ~2,000,000 ISK/yr turnover (~47 users) the business is VAT-exempt (kink in the curve). VAT on foreign (EN) customers follows place-of-supply (EU OSS / often 0 % outside EU) — model applies 24 % to all = conservative.
- **Employer payroll on-costs (~19.5–21.5 % on top of gross salary):** tryggingagjald 6.35 % · lífeyrissjóður (mótframlag) 11.5 % · sjúkrasjóður 1 % · orlofssjóður 0.25 % · starfsmennta-/endurhæfingarsjóður ~0.35 % (+ optional séreign match 2 %).
- **Personal (from your salary):** tekjuskattur + útsvar (progressive ~31.5 % / 37.95 % / 46.28 % after persónuafsláttur) · lífeyrissjóður (employee) 4 % · stéttarfélagsgjald ~0.7–1 %.
- **Corporate income tax (ehf.) 20 %** on retained profit; dividend 22 %. Salary vs dividend split + deductions = the accountant's optimization (reiknað endurgjald sets a minimum salary).

### Break-even & "living wage" (net take-home / month)

Model: revenue − VAT − payment fees − operating costs = company money; − employer on-costs (~20 %) = gross salary; − personal tax/levies (~33 %) = net in pocket.

| Net take-home / month | Paying users needed |
|-----------------------|---------------------|
| Break-even (covers all costs) | **~8** |
| 200.000 ISK | ~147 |
| 350.000 ISK | ~250 |
| **500.000 ISK** (solid Icelandic living) | **~353** |
| 700.000 ISK | ~490 |

- Mandatory contributions (both layers) roughly **double** the user count vs a naive gross model.
- **Claude $100 is a temporary dev cost** → drops post-launch → break-even falls to ~5 and the curve lifts.
- Margins on revenue stay high (~93–96 %); the wedge to *personal net* is what raises the counts.

### Sources (verified 2026-06-15)
- Employer social security (tryggingagjald 6.35 %) — Rivermate / PwC Tax Summaries
- Employer pension 11.5 % (mótframlag) — Pension Fund of Commerce (live.is)
- Union funds: sjúkrasjóður 1 %, orlofssjóður 0.25 % — ASÍ
- Corporate income tax 20 % — PwC Tax Summaries
- Key rates 2025 — Skatturinn

---

## Bundle Strategy — Physical Products + Rúnar

### Philosophy
Physical rune set → free credit inside → Rúnar user.
Acquisition cost: $0.038 per IS user / $0.020 per EN user. Marketing cost: effectively zero.

### Physical products (in development — Sigrun)
- Rune set: 25 Elder Futhark stones, pouch, design by Sigrun
- Format: premium gift product
- Inside: 1 free credit card with QR code → direct entry to Rúnar

### Distribution channels (under consideration)
- Souvenir shops across Iceland
- Tourist markets (Akureyri cruise ships — seasonal)
- Online (Sigrun's existing channels)
- Agndofa markets (twice/year)

---

## Rune Card — Physical to Digital Bridge

### Format
Gift card format with QR code on the front.
Contains: 1 free reading credit, activated on registration.

### User flow
```
Rune Card (physical, inside rune set pouch)
        ↓
QR code → Rúnar landing page (visitor state)
        ↓
"You have 1 free reading — register to claim it"
        ↓
Email registration → becomes Rune Seeker + 1 credit applied
        ↓
Rúnar introduces himself — guides into the world of runes
        ↓
Founding ritual available → tree begins to grow
        ↓
Wants more → Standard subscription
```

### What exists already
- Unique code system: ✅ built
- Email registration + visitor flow: ✅ built (may need adjustment)
- Credit system: ✅ built

### What needs adjustment
- Landing page: needs context for physical product user
  ("You arrived with runes in hand" — not generic onboarding)
- Rúnar's first reading: optional special intro acknowledging
  the user came via physical runes

---

## Physical Products & Bundle

### Agndofa Ceremonial Cacao (100g)
- Prodejní cena: 2.500 ISK
- Výrobní náklady: ~700 ISK
- Marže: ~72%
- Produkt: 100% pure Ecuadorian cacao, single origin
- Stránka: agndofa.is/products/agndofa-ceremonial-cacao

### Runové kameny (v přípravě — Sigrun design)
- 25 Elder Futhark kamenů v sáčku
- Design: Sigrun
- Výrobní náklady: neznáme — zatím ve fázi návrhu
- Prodejní cena: TBD po kalkulaci výroby

### Rune Card
- Gift card formát + QR kód
- Obsahuje: 1 free credit → vstup do Rúnara
- Výrobní náklady: minimální tisk + ~17 ISK digital
- Součást každého fyzického produktu

---

## Bundle — Ceremonial Kit

### Základní bundle (runové kameny + Rune Card)
- 25 runových kamenů (Sigrun design)
- Rune Card: 1 free reading
- Cena: TBD (závisí na výrobních nákladech kamenů)

### Ceremonial bundle (runové kameny + cacao + Rune Card)
- 25 runových kamenů
- 100g Agndofa ceremonial cacao (~700 ISK náklady)
- Rune Card: 1 free reading + 1 kredit navíc
- Kartička s QR na Stundin rituál (agndofa.is/pages/stundin)
- Cena: TBD — cílová marže 70–75%
- Orientační cena: náklady × 3–4 po kalkulaci kamenů

### Bundle pricing logika
- Bundle levnější než součet položek zvlášť
- Ale příběh + packaging + Rúnar přidává hodnotu
- Dárkové balíčky v IS wellness segmentu: 8.000–15.000 ISK

---

## Ekosystém

```
Fyzický produkt (kameny / cacao bundle)
        ↓
Rune Card → Rúnar appka (1 free reading)
        ↓
Stundin rituál na Agndofa (agndofa.is/pages/stundin)
— Rúnarův hlas ve videu již existuje ✅
— Návod na přípravu cacao již existuje ✅
        ↓
Strom života začíná růst → retention
        ↓
Kredity jsou drahé → Standard subscription je volba
        ↓
Premium = ceremonial mód (Rúnar ví že piješ kakao)
```

---

## PWA vs Native App

### Rozhodnutí: subscriptions zůstávají na webu
Platby neprocházejí App Store ani Google Play IAP.
Island je EEA → Apple musí umožnit external purchase link (Digital Markets Act, březen 2024).
Model: appka slouží ke čtení, subscription se platí na runar25.github.io. Žádný App Store cut.

### Skutečné náklady nativní appky
| Položka | Cena | Frekvence |
|---------|------|-----------|
| Apple Developer Program | $99/rok | Roční |
| Google Play Developer | $25 | Jednorázově |
| App Store cut (IAP) | 0 % | Subscriptions na webu |
| Capacitor development | 2–4 týdny práce | Jednorázově |
| App update maintenance | ~1–2× ročně | iOS/Android OS updates |

### Kdy přejít z PWA na nativní
Island má ~65–70 % iOS. Remindery (pondělní drip, Yggdrasil okno) jdou emailem — push notifikace nejsou driver.

**Jediný skutečný důvod: App Store discovery.**
Islanďané hledají appky v App Store. Rúnar tam teď není. To je akviziční problém, ne retenční.
→ Jít do App Store dřív než později. Nečekat na user count threshold.

### Technická cesta: Capacitor
Rúnar je HTML + CSS + vanilla JS — Capacitor to zabalí do nativní shell bez přepisování kódu.
Web verze (PWA) zůstane jako primary — fyzický product funnel (QR → browser) funguje dál.
Nativní appka = App Store presence + lepší onboarding na iOS.

### Fyzický product funnel a PWA
QR kód na Rune Card vede přímo do browseru → okamžitý vstup do Rúnaru bez App Store.
Nativní appka tento funnel nenaruší — web verze zůstává paralelně.

---

## Open Questions (do not implement until resolved)

| Question | Context |
|----------|---------|

---

*Last updated: June 14 2026 — reading costs re-measured, credit scale 1/2/3/4/5, RS Model B, subscription counts reading-units*
*ElevenLabs pricing source: elevenlabs.io/pricing/api — verified June 9 2026*

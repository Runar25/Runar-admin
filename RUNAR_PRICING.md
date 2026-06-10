# Rúnar — Pricing & Business Model
# Language: English (working document)
# Status: In progress — numbers subject to change
# Last updated: June 2026
# ElevenLabs prices verified: June 9 2026 (elevenlabs.io/pricing/api)

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

Base: Single rune = 430 ElevenLabs characters (real measurement).
Claude model: Sonnet 4-5 ($3/$15 per 1M in/out). Stored in claude-proxy/index.ts — not in frontend.
Prompt caching: ✅ deployed (2026-06-09, commit 7bb6a55). System prompt cached with ephemeral TTL 5min.
ElevenLabs: Multilingual v2/v3 (IS) $0.10/1k chars / Flash (EN) $0.05/1k chars.

System prompt: ~960 tokens EN / ~1.045 tokens IS. Tvoří 75–80 % každého input volání.
Caching úspora: ~$0.0026/volání po prvním (960 tokenů za $0.30/1M místo $3.00/1M).

| Reading | Input EN | Input IS | Output | EL chars | Claude | EL IS | EL EN | Total IS | Total EN |
|---------|----------|----------|--------|----------|--------|-------|-------|----------|----------|
| Single | ~1.210 | ~1.355 | ~275 | 430 | $0.008 | $0.043 | $0.022 | **$0.051** | **$0.030** |
| Life Rune | ~1.230 | ~1.365 | ~345 | 0 | $0.009 | — | — | **$0.009** | **$0.009** |
| Norns (3) | ~1.240 | ~1.375 | ~365 | 700 | $0.009 | $0.070 | $0.035 | **$0.079** | **$0.044** |
| Kříž (5) | ~1.265 | ~1.405 | ~320 | 900 | $0.009 | $0.090 | $0.045 | **$0.099** | **$0.054** |
| Horseshoe (7) | ~1.280 | ~1.420 | ~480 | 1200 | $0.011 | $0.120 | $0.060 | **$0.131** | **$0.071** |
| Yggdrasil (9) | ~1.355 | ~1.500 | ~660 | 1500 | $0.014 | $0.150 | $0.075 | **$0.164** | **$0.089** |
| Founding S1 | ~1.240 | ~1.375 | ~365 | 1000 | $0.009 | $0.100 | $0.050 | **$0.109** | **$0.059** |

**Free credit acquisition cost: ~$0.049 per user (IS) / ~$0.028 (EN)**
This is the cost to bring a new user into Rúnar. Extremely low.

Note: IS = Icelandic voice (Multilingual v2/v3). EN = international/tourist voice (Flash).
Voice model follows app language — user switches language in app settings → readings use that language's model. ✅ implemented.

---

## Tier Structure

### Visitor (free_trial)
- 1 reading total, voice included
- Single rune only (Fehu)
- No tree, no journal
- Purpose: show what Rúnar is

### Rune Seeker (rune_seeker)
- 3 free readings/month (1 with voice, 2 text only)
- Additional readings via credits
- Credit = 1 rune drawn
- Access: all spreads via credits (Single, Norns, Kříž, Horseshoe, Yggdrasil)
- Credits are deliberately expensive — engaged user self-selects into subscription
- Tree: founding ritual (5 credits), teaser only
- Journal: last 5 entries
- Purpose: entry point, credit buyer, gift card recipient

### Standard (~$28/month)
- 50 runes/month limit
- All spreads including Yggdrasil (peak window: 1 week before/after solstice = full tree weight)
- Full Tree of Life + founding ritual free
- Full journal
- Voice included
- Life Rune: full reading (1200 tokens)
- Purpose: main product, target for all funnels

### Premium (~$36/month)
- 75 runes/month limit
- Everything in Standard
- Life Rune: deeper reading (2000 tokens) + name etymology + mythological figure
- Future: cacao ceremonial, other features TBD
- Purpose: depth, for committed users

Rune counting: 1 rune drawn = 1 rune from monthly limit.
Kříž (5 runes) = 5 from limit. Yggdrasil (9 runes) = 9 from limit.

---

## Spreads per Tier

| Spread | Runes | Visitor | Rune Seeker | Standard | Premium |
|--------|-------|---------|-------------|---------|---------|
| Single | 1 | 1× total | 3/month + credits | ∞* | ∞* |
| Norns | 3 | ❌ | credits | ∞* | ∞* |
| Kříž | 5 | ❌ | credits | ∞* | ∞* |
| Horseshoe | 7 | ❌ | credits | ∞* | ∞* |
| Yggdrasil | 9 | ❌ | credits | ✅ anytime* | ✅ anytime* |

*Within monthly rune limit (Standard: 50 runes, Premium: 75 runes).
*Yggdrasil: available anytime, but full branch_weight only within 1 week before/after solstice. Outside window → reading happens, reduced tree impact.

Credit cost = number of runes drawn (1 rune = 1 credit).

---

## Credit Packages (Rune Seeker purchases)

Credits are priced to make Standard subscription clearly more attractive.
Engaged user (50 runes/month) at Master price = 9.990 ISK vs Standard 3.490 ISK.

| Package | Runes | ISK | ISK/rune |
|---------|-------|-----|----------|
| Starter | 5 | 1.490 ISK | 298 ISK |
| Seeker | 10 | 2.490 ISK | 249 ISK |
| Wanderer | 20 | 4.490 ISK | 225 ISK |
| Elder | 30 | 6.490 ISK | 216 ISK |
| Master | 50 | 9.990 ISK | 200 ISK |

This is the argument for upgrading to subscription — not marketing, real math.

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
Engaged user (50 runes/month):
- At Master credit price: 9.990 ISK/month
- Standard subscription: 3.490 ISK/month
- **User saves ~6.500 ISK/month on Standard**

---

## Cost & Margin Analysis

### API cost per user per month (50 rune Standard, IS voice)

| Cost item | Calculation | Monthly |
|-----------|-------------|---------|
| ElevenLabs IS (Multilingual v2/v3) | 50 × 430 chars × $0.10/1k | $2.15 |
| ElevenLabs EN (Flash) | 50 × 430 chars × $0.05/1k | $1.08 |
| Claude API | 50 readings × ~$0.009 avg | $0.45 |
| **Total IS user** | | **$2.60/month** |
| **Total EN user** | | **$1.53/month** |

### Standard plan margins

| Plan | ISK/month | USD/month | API cost (IS) | Margin (IS) | API cost (EN) | Margin (EN) |
|------|-----------|-----------|---------------|-------------|---------------|-------------|
| Standard monthly | 3.490 ISK | $28.27 | $2.60 | **91%** | $1.53 | **95%** |
| Standard annual (equiv.) | 2.900 ISK | $23.48 | $2.60 | **89%** | $1.53 | **93%** |

### Premium plan margins (75 runes/month)

| Plan | ISK/month | USD/month | API cost (IS) | Margin (IS) | API cost (EN) | Margin (EN) |
|------|-----------|-----------|---------------|-------------|---------------|-------------|
| Premium monthly | 4.900 ISK | $39.68 | $3.89 | **90%** | $2.29 | **94%** |
| Premium annual (equiv.) | 4.083 ISK | $33.06 | $3.89 | **88%** | $2.29 | **93%** |

Fixed infra: ~$30/month (Hetzner + Supabase Pro).
Break-even: 2 Standard monthly users.

### Revenue & profit projections (realistic mix: 70% Standard / 30% Premium, 60% annual / 40% monthly, 50% IS / 50% EN)

| Users | Revenue/month | API costs | Infra | Net profit | Margin |
|-------|---------------|-----------|-------|-----------|--------|
| 10 | ~$240 | ~$21 | $30 | ~$189 | 79% |
| 50 | ~$1.200 | ~$103 | $30 | ~$1.067 | 89% |
| 100 | ~$2.400 | ~$205 | $30 | ~$2.165 | 90% |
| 200 | ~$4.800 | ~$410 | $30 | ~$4.360 | 91% |
| 500 | ~$12.000 | ~$1.025 | $30 | ~$10.945 | 91% |

---

## ElevenLabs Plan — When to Upgrade

Model: Multilingual v2/v3, $0.10/1k chars. Overage rate = plan rate.
Assumption: 50 readings/user/month × 430 chars = 21.500 chars/user/month.

| Plan | $/month | Multilingual chars included | Readings | ~Engaged users | Upgrade at |
|------|---------|----------------------------|----------|----------------|------------|
| Creator | $22 | 220.000 | 511 | ~10 | ~47 users |
| Pro | $99 | 990.000 | 2.302 | ~46 | ~139 users |
| Scale | $299 | 2.990.000 | 6.953 | ~139 | ~460 users |
| Business | $990 | 9.900.000 | 23.023 | ~460 | 460+ → Enterprise |
| Enterprise | Custom | Custom | — | 460+ | Contact ElevenLabs |

**Upgrade logic:** Stay on current plan until monthly overages + plan cost exceed next plan price.
- Creator → Pro: at ~47 users
- Pro → Scale: at ~139 users
- Scale → Business: at ~460 users
- Business → Enterprise: at 460+ users (at this revenue ~$120k+/year, strong negotiating position)

**Start on Creator.** Unlike previously assumed, Creator is cost-effective up to ~47 users.
Do NOT jump to Pro at launch — overages are fine and cheaper until ~47 paid users.

Flash (EN) plan: same upgrade logic, but costs are 2× lower so crossover points roughly double.
At mixed IS/EN user base, actual crossover points are higher than the IS-only estimates above.

---

## Bundle Strategy — Physical Products + Rúnar

### Philosophy
Physical rune set → free credit inside → Rúnar user.
Acquisition cost: $0.049 per IS user / $0.028 per EN user. Marketing cost: effectively zero.

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

*Last updated: June 9 2026*
*ElevenLabs pricing source: elevenlabs.io/pricing/api — verified June 9 2026*

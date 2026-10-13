# Rúnar — Pricing & Business Model
# Language: English (working document)
# Status: In progress — numbers subject to change
# Last updated: 2026-10-11 — náklady přepočteny na GPT-6 sol z produkčních dat (`node scripts/utils/pricing_tabulka.js`);
#   hlas se stropem na měsíc, EN hlas za skutečnou sazbu, projekce s fixními náklady ~$202. Owner: „přepočítej pricing na sol“.
# ElevenLabs sazby: `EL_PRECERPANI` ve `scripts/utils/stats.js` (zdroj a datum ověření stojí u nich)
# Reading costs: `node scripts/utils/pricing_tabulka.js` (do 2026-10-11 ruční měření z 2026-06-14)

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

**Přepočteno 2026-10-11 na GPT-6 sol** (owner: *„přepočítej pricing na sol“*) — `node scripts/utils/pricing_tabulka.js`, z `readings.usage`
za 30 dní, bez volání API; tabulku níž vypíše tentýž příkaz, přepočet = spustit znovu. Model čtení vlastní `SOL_MODEL` (claude-proxy, Claude je
záloha), ceník `MODEL_PRICES` + výpočet `readingCostUsd` (v2/), model hlasu `EL_MODEL_EN/IS` (elevenlabs-proxy), sazbu hlasu `EL_PRECERPANI`
(`scripts/utils/stats.js`) — tady se neopisují (§20). Cenu KAŽDÉHO čtení appka počítá sama (admin ji vidí v deníku), souhrny `stats.js`.

| Čtení | Znaky hlasu EN / IS | Model EN / IS | Hlas EN / IS | **Celkem s hlasem EN / IS** | n se solem EN / IS |
|---|---|---|---|---|---|
| Single | 373 / 423 | $0.0036 / $0.0078 | $0.037 / $0.042 | **$0.041 / $0.050** | 59 / 5 ⚠️ |
| Norns (3) | 484 / 486 | $0.0046 / $0.0083 | $0.048 / $0.049 | **$0.053 / $0.057** | 7 / 1 ⚠️ |
| Kříž (5) | 607* / 662* | $0.0042* / $0.0090* | $0.061* / $0.066* | **$0.065* / $0.075*** | 0 / 0 |
| Horseshoe (7) | 1 073* / 1 172* | $0.0055* / $0.0110* | $0.107* / $0.117* | **$0.113* / $0.128*** | 0 / 0 |
| Yggdrasil (9) | 1 353* / 1 478* | $0.0063* / $0.0123* | $0.135* / $0.148* | **$0.142* / $0.160*** | 0 / 0 |
| Ask (otázka ke čtení, bez hlasu) | – | $0.0036 / $0.0064 | – | $0.0036 / $0.0064 | 93 / 2 ⚠️ |
| Životní runa (text, bez hlasu) | – | $0.0063* / $0.0097* | – | $0.0063* / $0.0097* | z 2 / 1 uložených textů |
| Founding ritual (= Norns) | jako Norns | | | | |

- **\* = odhad** — sol tenhle typ v datech zatím nemá. Znaky = cílový počet vět, který předepisuje prompt, × změřené znaky na větu (EN 93,
  IS 102); výstup = znaky ÷ změřené znaky na token; vstup = Single + přírůstek na runu z Noren. **Hranice odhadu** (nástroj puštěný na typy,
  které změřené jsou): znaky −0 až +6 % (Norns IS n = 1: +15 %), model −5 až −16 % → na celkové ceně s hlasem do ±5 %. ⚠️ = málo čtení,
  medián je hrubý. Přeměřit, až poběží rozklady se solem a islandská čtení ve větším počtu.
- **Hlas je 81–94 % ceny čtení s hlasem** (nejméně IS Single, nejvíc EN Yggdrasil; do 2026-10-11 84–95 % při sazbě $0.10). Model sol stojí na Single EN $0.0036 (Opus stál $0.012 — EN čtení 2026-09-23, n = 70).
- **IS model je ~2× dražší než EN:** islandský prompt má ~3 100 vstupních tokenů proti ~1 220 (islandština se tokenizuje hůř + IS gramatický blok).
- **EN hlas stojí stejně jako IS** — obojí sazba multilingual/v3. Do 2026-10-11 tu EN stál za sazbu Flash (poloviční), kterou appka nepoužívá.
- **Hlas ke každému čtení, jednou** (DECISIONS 2026-10-11 (61)): předplatitel u všech čtení, Rune Seeker u volného čtení a čtení z karty
  (`TIER_FEATURES`); uložený hlas se přehrává zdarma. Do 2026-10-11 tu stál strop `VOICE_MONTHLY_LIMIT` (5) — pokyn pro testery (49).
- **Délka:** Single má dnes medián 373 EN / 423 IS znaků (v srpnu 272); délku vlastní buildery (`LENGTH_BUDGETS`, věty v `RP_*`).
- **Cache:** sol běží s explicitní cache bez zarážek (zápis vypnut 2026-10-04, komentář u `callSol`) — v datech 0 tokenů z cache.
  Poznámky o cache Claude-éry (Opus, minima tokenů, bod zvratu 5min/1h cache) → `git log -p RUNAR_PRICING.md` a `stats.js`.

*(Do 2026-10-11 tu stály poznámky k červnové tabulce — Single 272 znaků, sloupec Claude přepočtený ×5/3 z Sonnetu, nezměřené spready
a nález, že dražší Opus čtení nezdražil. Platily pro tabulku, která už neplatí; historie → `git log -p RUNAR_PRICING.md`.)*

**Kreditová stupnice (`SPREAD_COSTS`) dnes NEodpovídá poměru nákladů.** Náklad na jeden kredit (čtení z karty s hlasem): Single
$0.034 EN / $0.042 IS, Norns $0.022 / $0.024, Kříž $0.020* / $0.021*, Horseshoe $0.021* / $0.026*, Yggdrasil $0.023* / $0.026*
(sazba hlasu $0.08; do 2026-10-11 tu stálo Single $0.041 / $0.050 … při $0.10). Rozklady
jsou tedy na kredit levnější než Single; při nejlevnějším kreditu (`CARD_PACKS`, ~200 ISK ≈ $1.62) je marže ~97 % u Single a ~98 % u rozkladů.
*(Do 2026-10-11 tu stálo, že stupnice vznikla zaokrouhlením poměru nákladů a marže na kredit je jednotná ~98 % — platilo pro červnové délky
čtení a hlas na každém čtení. Jestli stupnici měnit, je ownerova volba; náklady ji nenutí — marže je vysoká všude.)*

**Life Rune is FREE — 0 credits (KUKY 2026-07-19).** It is text-only, so the voice never happens, and voice is
84–95 % of what a reading costs us; the true cost is ~$0.006 EN / ~$0.010 IS (odhad, `scripts/utils/pricing_tabulka.js`). This is deliberate acquisition spend, not a pricing
accident: the Life Rune is the gateway into the Tree of Life, and the Tree is what brings people back.
The earlier rationale („3 credits reflects perceived value“) is **retired** — it priced against cost while every
other row in the table priced with it, and an exception nobody remembers choosing eventually reads as a bug.

⚠️ Enforced by the PROXY (`mode === "life_rune"`), not by the number in `SPREAD_COSTS`. The client may not
declare its own reading free — that is why `Math.max(1, spread_cost)` stays.

**Náklad na získání uživatele = volné čtení při registraci (1 Single s hlasem): ~$0.041 EN / ~$0.050 IS.** Jediné místo tohoto čísla
(sekce Bundle níž na něj odkazuje).

Hlas: model vlastní `EL_MODEL_EN/IS` v elevenlabs-proxy; EN i IS mají tutéž sazbu. Hlas jde podle jazyka appky. ✅ implemented.
Nejdražší na jednotku je **Single** (373 EN / 423 IS znaků hlasu na jednotku); rozklady mají na jednotku méně (Yggdrasil ~271* / ~296*).

### Volba modelu čtení — měření per model (2026-08-17)

Owner 2026-08-17: **sonnet-5 zrušit jako fallback** (nepředvídatelný thinking, viz níž). Kandidáti
dál: opus-4-8 (produkce), opus-4-7, opus-5, sonnet-4-5. Výčet modelů vlastní `MODELS`
v `claude-proxy/index.ts` — tady se NEOPISUJE (§20). ✅ Sonnet 5 z řetězu odstraněn a nasazen týž den (proxy v59,
snapshot `memory/snapshots/2026-08-17-sonnet5-drop-deployed.md`; do 2026-10-09 tu stálo „⏳ … `index.ts:674`“). Od 2026-10-09
čte všechny GPT-6 sol a Claude je záloha (DECISIONS 2026-10-09 (13)) — tabulka níž je historické měření Claude modelů.

Změřeno simulátorem (single „Fehu", **májový/úsporný prompt**, n=2, dnešní ceník: opus $5/$25 ·
sonnet-5 $2/$10 zaváděcí do 31.8. · sonnet-4-5 $3/$15). **Čísla jsou NECACHOVANÁ** (čerstvý request).
V produkci se systémový prompt cachuje (0,1× vstup) → reálný náklad modelu **táhne VÝSTUP** (necachuje
se), proto je klíčový sloupec „out tok".

| model | EN out | IS out | EN necach. | IS necach. |
|---|---|---|---|---|
| sonnet-4-5 | ~70 | ~138 | $0,0040 | $0,0067 |
| sonnet-5 | ~146 | ~355 ⚠️kolísá | $0,0043 | $0,0074 |
| opus-4-7 | ~106 | ~163 | $0,0097 | $0,0136 |
| opus-4-8 | ~120 | ~225 | $0,0100 | $0,0152 |
| opus-5 | ~199 | ~300 | $0,0120 | $0,0170 |

**Nálezy:**
- **Náklad ≠ jen model, ale i SLOŽITOST promptu.** sonnet-5 na dnešním složitém `direct` promptu
  spálil out ≈ **560** (thinking); na úsporném májovém jen ~146 — táž runa. Thinking spouští prompt.
- **sonnet-5 kolísá nepředvídatelně** — IS májový dal mezi dvěma běhy out **216 vs 495**. → důvod DROPu.
- **opus-5 má thinking defaultně zapnutý** → nejvyšší výstup z opusů (a mírně kolísá).
- **sonnet-4-5 = nejlevnější a nejstabilnější** v obou jazycích.
- **IS dražší než EN** (vstup ~1900 vs ~1400 tok, výstup ~2×).
- ⚠️ **V CELKOVÉ ceně čtení model ~nerozhoduje** — ElevenLabs = ~90 % (tabulka výš). Rozdíly mezi
  modely jsou haléře/čtení; důvod dropu sonnet-5 je **nepředvídatelnost, ne úspora**.

Referenční — **dnešní `direct` prompt** (EN, ne májový): sonnet-4-5 in 1361 / out 91 (~$0,0054 necach.) ·
opus-4-8 in 1889 / out 96 · sonnet-5 in 1889 / out **560** (thinking blow-up, ~$0,0094 zaváděcí).

---

## Tier Structure

### Visitor (free_trial)
- Živé čtení ani hlas nemá — proxy nepřihlášeného odmítne; po tahu runy appka ukáže výzvu k registraci. Má statickou kolekci run
  a výpočet životní runy. Vlastník pravidla = CLAUDE.md „Gating“ (do 2026-10-11 tu stálo „1 reading total, voice included, Single (Fehu)“
  — neplatí od 2026-08-02).
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
- Journal: posledních N čtení (`TIERS.rune_seeker.journal`)
- Hlas: k volnému čtení a ke čtením z karty (`TIER_FEATURES`, DECISIONS 2026-10-10 (42))
- Purpose: entry point, credit buyer, gift card recipient

### Standard (~$28/month)
- 50 reading-units/month limit
- All spreads including Yggdrasil (peak window: 1 week before/after solstice = full tree weight)
- Full Tree of Life. **Founding ritual is NOT free** — it costs its reading-units like any other
  reading (KUKY 2026-07-18). Rune Seekers may be *gifted* founding credits as a marketing move
  (campaign, onboarding push), but that is promotion, not a product entitlement.
- Full journal
- Hlas: každé čtení, jednou (DECISIONS 2026-10-11 (61)); do 2026-10-11 tu stálo „nejvýš `VOICE_MONTHLY_LIMIT` čtení za měsíc“
  (pětka byl pokyn pro testery, (49)), předtím „Voice included“
- Životní runa: stejné čtení jako u všech, zdarma
- Purpose: main product, target for all funnels

### Premium (~$36/month)
- 75 reading-units/month limit
- Everything in Standard
- Životní runa a rozbor jména: stejné jako u všech, zdarma a jednou. „Hlubší premium čtení (2000 tokenů)“ kód nikdy nedělal — tentýž
  prompt, jen vyšší strop, který se nedotkl; zrušeno 2026-10-11 (DECISIONS 2026-10-11 (22)).
- Future: cacao ceremonial, other features TBD
- Purpose: depth, for committed users

**Counting (unified with RS credits):** a reading costs its credit value from the monthly limit.
One model app-wide; values = `SPREAD_COSTS`, not repeated here (§20).
Hlas má každé čtení jednou (DECISIONS 2026-10-11 (61)), takže znaky hlasu rostou s jednotkami; horní mez = všechny jednotky jako
Single („Náklad na předplatitele za měsíc“ níž). Přehrání uloženého hlasu nic nestojí. (2026-10-11 krátce strop `VOICE_MONTHLY_LIMIT` — zrušen.)
Spread-heavy users get more value (Yggdrasil 5 units, was 9 runes) at no extra worst-case cost.
*(Monthly-limit enforcement is **live** in claude-proxy since 2026-07-16 — it deducts the credit
value and returns 402 `monthly_limit` when exceeded. Guarded by smoke ⑨.)*

---

## Spreads per Tier

<!-- "Rune count" = kolik run se táhne (info), NE cena. Cena = sloupec Credits. 2026-10-11: komentář stál mezi záhlavím a řádky, takže tabulka byla rozbitá (řádky se nevykreslily) a kontrola cen spreadů ji neviděla. -->

| Spread | Rune count | Credits | Visitor | Rune Seeker | Standard | Premium |
|--------|-----------|---------|---------|-------------|---------|---------|
| Single | 1 | 1 | ❌ | 1 free at reg. + credits | ∞* | ∞* |
| Norns | 3 | 2 | ❌ | credits | ∞* | ∞* |
| Kříž | 5 | 3 | ❌ | credits | ∞* | ∞* |
| Horseshoe | 7 | 4 | ❌ | credits | ∞* | ∞* |
| Yggdrasil | 9 | 5 | ❌ | credits | ✅ anytime* | ✅ anytime* |

*Within monthly reading-unit limit (Standard: 50 units, Premium: 75 units) — a spread costs its credit value.
*Yggdrasil: available anytime, but full branch_weight only within 1 week before/after solstice. Outside window → reading happens, reduced tree impact.

**Credit cost = per reading type.** Konkrétní čísla vlastní `SPREAD_COSTS` v `v2/runar-config.js` — zde se
neopisují (§20). Pravidlo, které je pod nimi: **platí se za hlas.** Textové čtení je zdarma, protože
84–95 % ceny čtení s hlasem je TTS (tabulka v „Cost per Reading“).
Decoupled from rune count (old model was 1 rune = 1 credit).

---

## Credit Packages (Rune Seeker purchases)

Credits are priced to make Standard subscription clearly more attractive.

**Balíčky (jména, počty kreditů, ISK) vlastní `CARD_PACKS` v `v2/runar-config.js`** — nápověda z nich skládá tabulku. Tady se
neopisují (§20). Cena za kredit klesá s velikostí balíčku; nejlevnější kredit je v největším balíčku.
*2026-10-10: jména a ceny rozhodl KUKY (DECISIONS 2026-10-10 (22)); do té doby tu stála tabulka (a v `runar-help.html` druhá,
starší — Elder 50 = 11.900 kr, ceny v €). Od b2f50b7 (CODE-tune) je jediným místem config.*

A credit buys a single reading; spread prices in credits = `SPREAD_COSTS`.
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
- At the price of the largest credit pack (`CARD_PACKS`, 50 credits): 9.990 ISK/month
- Standard subscription: 3.490 ISK/month
- **User saves ~6.500 ISK/month on Standard**

Per-unit subscription price: Standard 3.490 / 50 = **~70 ISK/reading-unit** · Premium 4.900 / 75 = **~65 ISK/unit**.
Premium is slightly cheaper per reading (volume discount) + deeper features → balanced. Both ~3× cheaper than the cheapest credit (200 ISK).

---

## Cost & Margin Analysis

### Náklad na předplatitele za měsíc (model + hlas)

`node scripts/utils/pricing_tabulka.js`. Jednotky a Asky na čtení vlastní `TIERS` — neopisují se. Hlas má každé čtení, jednou (DECISIONS
2026-10-11 (61)). **Nejhorší měsíc** = všechny jednotky jako Single (nejdražší typ na jednotku) s hlasem a všemi Asky — přesná horní mez.
**Vzor** = ownerův příklad 2026-10-11: 3 Single a 1 Norns týdně, 1 Kříž a 1 Horseshoe měsíčně (~28 jednotek).

| Tarif | **Nejhorší měsíc EN / IS** | z toho hlas EN / IS | Vzor EN / IS |
|---|---|---|---|
| standard | **$1.86 / $2.40** | $1.50 / $1.69 | $0.83 / $1.03 |
| premium | **$3.05 / $4.09** | $2.25 / $2.54 | $0.90 / $1.15 |

Do 2026-10-11 tu stála horní mez se stropem 5 hlasů (standard $1.03 / $1.45, premium $1.48 / $2.29), ještě dřív „50 × 358 znaků hlasu
+ Claude ~$0.002 na čtení“ (standard IS $1.89, premium IS $2.84).

### Plan margins (horní mez nákladů, kurz $1 = 123.5 ISK)

| Plan | ISK/month | USD/month | Cost IS | Margin IS | Cost EN | Margin EN |
|------|-----------|-----------|---------|-----------|---------|-----------|
| Standard monthly | 3.490 ISK | $28.26 | $2.40 | **92%** | $1.86 | **93%** |
| Standard annual (equiv.) | 2.900 ISK | $23.48 | $2.40 | **90%** | $1.86 | **92%** |
| Premium monthly | 4.900 ISK | $39.68 | $4.09 | **90%** | $3.05 | **92%** |
| Premium annual (equiv.) | 4.083 ISK | $33.06 | $4.09 | **88%** | $3.05 | **91%** |

Margins stay healthy even with voice on every reading in the worst month (~88–92 % IS / ~91–93 % EN of the gross price). After 24 % VAT
and Shopify fees the worst month keeps 81–85 % and a Rune Seeker credit 91–93 % (CODE-tune 2026-10-11, owner: *„jestli je cenová hladina
dobře nastavená“*). Prices remain balanced — no change needed. (Until 2026-10-11: ~93–96 % with the 5-voice cap.)

⚠️ Fixní náklady i break-even stojí jen v „Operating costs, taxes & break-even“ níž (§20). Do 2026-07-18 tu stálo ~$30 (jen Hetzner
+ Supabase) a break-even 2 uživatelé; do 2026-10-11 tu stálo ~$202 — teď je tu jen odkaz, číslo by tu zase zastaralo.

### Revenue & profit projections (mix: 70 % Standard / 30 % Premium, 60 % ročně / 40 % měsíčně, 50 % IS / 50 % EN)

**Hrubě** (owner 2026-10-11: *„teď na hrubo a později to uděláme pořádně“*). Příjem = **3 518 ISK ≈ $28.49 na uživatele** včetně DPH
(vzorec v „Operating costs“ níž). DPH 24 % až nad ~47 uživatelů (obrat 2 000 000 ISK/rok), poplatky za platby $0.96, model + hlas horní
mez $2.56 na uživatele (hlas ke každému čtení; do 2026-10-11 $1.43 se stropem 5), fixní náklady po spuštění („Operating costs“). Zisk = zisk firmy před mzdou a daní z příjmu. Hlas je v nákladech
na uživatele a plán ElevenLabs ve fixních jako základ — dvojí započtení do výše plánu pro hrubý odhad nevadí.

| Users | Příjem | DPH | Platby | Model + hlas | Fixní | Zisk firmy | % příjmu |
|-------|--------|-----|--------|-----------|-------|-----------|--------|
| 10 | ~$285 | – | ~$10 | ~$26 | ~$230 | ~$19 | 7% |
| 50 | ~$1.424 | ~$276 | ~$48 | ~$128 | ~$230 | ~$742 | 52% |
| 100 | ~$2.849 | ~$551 | ~$96 | ~$256 | ~$230 | ~$1.716 | 60% |
| 200 | ~$5.697 | ~$1.103 | ~$192 | ~$512 | ~$230 | ~$3.660 | 64% |
| 500 | ~$14.243 | ~$2.757 | ~$480 | ~$1.281 | ~$230 | ~$9.495 | 67% |

Do 2026-10-11 tu tabulka počítala ~$24 příjmu na uživatele — výpočet k tomu v dokumentu nebyl (owner: *„nevím, odkud je to číslo“*;
po odečtení DPH vychází ~$23, takže to mohl být příjem po DPH — ověřit nejde), bez DPH a poplatků a s fixními $30, pak $202 →
uváděné marže 77–92 % byly nadsazené.

---

## ElevenLabs Plan — When to Upgrade

Sazba hlasu `EL_PRECERPANI` (`stats.js`), EN i IS stejná. Zahrnuté znaky = cena tarifu ÷ sazba (ceník API v účtu ElevenLabs: v2 i v3
$0.08 / 1000 zn.; počítadlo účtu je v kreditech, 1 kredit = $0.0002 = 2,5 znaku — `RUNAR_DECISIONS.md` 2026-10-11 (43)). Do 2026-10-11 tu
stálo $0.10 (Creator 220 000), chyběl Starter a „Overage rate = plan rate“: **Starter přečerpání nemá** — po vyčerpání kreditů EL hlas
odmítne (`can_extend_character_limit` false); u vyšších tarifů přečerpání ověřit před spuštěním (BACKLOG „Náklady — zmapovat“).
Hlas má každé čtení, jednou (DECISIONS 2026-10-11 (61)). Kredity na předplatitele a kapacitu tarifů počítá `pricing_tabulka.js`:
**nejhorší měsíc Premium IS 12 690 kreditů** (75 Single s hlasem = 31 725 znaků), **ownerův vzor ~3 740**. Do 2026-10-11 tu stála
kapacita se stropem 5 hlasů (horní mez ~7 390 znaků, běžně ~2 115) — strop byl pokyn pro testery (49).

| Plan | $/month | Multilingual chars included | ~Users (nejhorší, Premium IS) | ~Users (vzor) | Upgrade at (nejhorší) |
|------|---------|----------------------------|----------------|----------------|------------|
| Starter | $6 | 75.000 | ~2 | ~8 | — (bez přečerpání: nad ~2 hlas stojí) |
| Creator | $22 | 275.000 | ~8 | ~29 | ~39 users |
| Pro | $99 | 1.237.500 | ~39 | ~132 | ~117 users |
| Scale | $299 | 3.737.500 | ~117 | ~399 | ~390 users |
| Business | $990 | 12.375.000 | ~390 | ~1.322 | 390+ → Enterprise |
| Enterprise | Custom | Custom | — | — | Contact ElevenLabs |

**Upgrade logic:** Stay on current plan until monthly overages + plan cost exceed next plan price (= cena dalšího plánu ÷ náklad hlasu
na uživatele v horní mezi).
**Start on Creator.** S hlasem ke každému čtení stačí Creator na ~8 předplatitelů v nejhorším měsíci a ~29 při vzoru; pak Pro (~39 / ~132).
O tarifu ElevenLabs tak hlas rozhoduje dřív než o penězích — marže drží (Plan margins výš). Když kredity dojdou, brzda (DECISIONS (48))
hlas zastaví všem; sledovat ve shrine (VOICE, TESTERS). Do 2026-10-11 tu stálo „Creator do ~167 platících“ — se stropem 5 hlasů. Testování běží na Starteru (owner 2026-10-11: *„nebudeme platit nic navíc“*) — brzda kreditů DECISIONS (48).

---

## Operating costs, taxes & break-even (Agndofa ehf., Iceland)

> Planning model (interactive calculator, 2026-06-15). **Estimates — verify with an accountant (endurskoðandi).**
> **Kalkulačka s posuvníky (2026-10-12, CODE-read):** shrine, záložka „📈 PAYBACK“ (adresa bydlí v `v2/runar-shrine.html`, od 2026-10-13) — soukromý artifact ownera; počítá týmž modelem z čísel této
> sekce (ceny předplatného, fixní náklady, plány ElevenLabs, odvody). Změní-li se tu čísla, kalkulačka se musí přepublikovat (zdroj:
> stránka artifactu, z níž se dá přečíst a přepublikovat; původní červnová kalkulačka se nenašla).
> Rates change yearly and depend on company form. Sources at the end of this section.
> All listed costs are tax-deductible business expenses (reduce taxable profit).

### Fixed monthly costs (USD) — hrubě

Owner 2026-10-11: *„předplatné pro Claude, co teď používám, 100 $ měsíčně, GPT 8 $, ElevenLabs, Supabase až půjdeme ven 25 $ a další,
co si nepamatuju… teď na hrubo a později to uděláme pořádně“*. Pořádný rozbor (faktury, co která položka přesně kryje) →
`RUNAR_BACKLOG.md` („Náklady — zmapovat pořádně“).

**Přeměřeno 2026-10-12 (CODE-read, owner „koukni na ty náklady“).** ✔ = ověřeno (měření / DNS / snímek účtu), ⓕ = jen z faktury
(owner). Faktury do schránky `runar@therunekeeper.com` nechodí (existuje od 2026-10-10), takže ⓕ položky musí dodat owner.
Změřená útrata modelů a hlasu = `node scripts/utils/stats.js` (z `readings.usage` × ceník, posledních 30 dní).

| Item | Dnes | Po spuštění | Note |
|------|------|-------------|------|
| Claude (Max, vývoj) | 100 | 100 ⓕ | vývoj; zůstane-li po spuštění, rozhodne owner |
| ChatGPT Go | 8 ✔ | 8 | předplatné chatu (owner 2026-10-12 „ano“) — NE API; API je řádek níž |
| OpenAI API (čtení sol, korektor IS) | ~1 ✔ | proměnné | 30 dní: čtení + Ask přes sol ~$0.75 (`stats.js`), korektor IS $0.12 (`is_gpt_naklady.js`); po spuštění v „Variable“ níž |
| Anthropic API (Opus pro admina, záloha, pokusy) | ~2–20 | ≤ 20 | 30 dní v appce ~$2.15 (Opus čtení + Ask, skoro vše admin); pokusy přes API mimo appku nezměřené; strop $20 (owner 2026-10-10) |
| ElevenLabs | 6 ✔ | 22 | Starter (snímek předplatného 2026-10-12: 2 % kreditů využito, reset 2026-11-10); po spuštění Creator („ElevenLabs Plan“ výš) |
| Supabase | 0 ✔ | 25 | Free; Pro „až půjdeme ven“ (owner) |
| Google Workspace (schránka runar@, Drive se zálohami) | 0 ✔ | 0 | ✔ je to Workspace (DNS: MX Google); platí ho Agndofa v rámci agndofa.is (owner 2026-10-12: „je to už v ceně agndofa.is“) — Rúnarovi nic navíc |
| Brevo (e-mail s kódem) | 0 ✔ | 0 | free tarif (300 e-mailů denně); do 2026-10-12 tu stál Resend — zamítnut 2026-09-12 |
| GitHub (repo, Pages) · Slack | 0 ✔ | 0 | veřejné repo + Pages zdarma; Slack zdarma (owner 2026-10-12) |
| Shopify (Basic) | 0 ✔ | 0 | platí ho obchod agndofa.is (owner 2026-10-12: „shopify taky obchod agndofa.is“) — Rúnarovi jen poplatky z plateb („Variable“ níž) |
| Apple Developer ($99/rok) | 0 | 8.25 | až nativní appka |
| Google Play ($25 jednou) | 0 | 0.70 | až nativní appka, rozpočteno na ~36 měsíců |
| Hetzner | 0 ✔ | 0 / ? | dnes nepředplacený („až předplatíme Supabase, nebo Hetzner“, DECISIONS 2026-10-10); alternativa k Supabase Pro |
| Domény | 1.50 | 1.50 | agndofa.is; therunekeeper.com je v ceně agndofa.is (owner 2026-10-12) |
| **Celkem (hrubě)** | **~$119** | **~$186** | Claude Max $100 zůstává i po spuštění (owner 2026-10-12: „bude asi pokračovat“); do 2026-10-12 ~$180 / ~$230 |

One-time: Google Play $25. Annual: Apple Developer $99.

### Variable per paying user / month

| Item | $/user | Note |
|------|--------|------|
| Model čtení (GPT-6 sol) + hlas ElevenLabs | ~0.96 | vzor (owner 2026-10-11), blend 70/30 tarifů a IS/EN 50/50, hlas ke každému čtení (`scripts/utils/pricing_tabulka.js`); horní mez ~2.56 |
| Payment processing (Shopify ~2.9% + ~$0.30/txn) | ~0.96 | on gross revenue |
| **Total variable** | **~$1.92** | do 2026-10-11 ~$1.88 (běžný měsíc se stropem hlasu 5), předtím ~$1.81 (Claude + hlas ~0.85) |

Revenue per paying user ≈ **3 518 ISK/měsíc (~$28.49)** včetně DPH — vzorec (spočítáno 2026-10-11, owner *„spočítej to“*):
Standard 0,6 × 2 900 + 0,4 × 3 490 = 3 136 ISK · Premium 0,6 × 4 083 + 0,4 × 4 900 = 4 410 ISK · mix 0,7 × 3 136 + 0,3 × 4 410 = 3 518 ISK
(ceny „Subscription Pricing“ výš, kurz $1 = 123,5 ISK). Po DPH 2 837 ISK (~$22.97).

### Icelandic taxes & mandatory contributions

- **VAT (VSK) 24 %** — consumer prices are VAT-inclusive → net revenue = price ÷ 1.24. Below ~2,000,000 ISK/yr turnover (~47 users) the business is VAT-exempt (kink in the curve). VAT on foreign (EN) customers follows place-of-supply (EU OSS / often 0 % outside EU) — model applies 24 % to all = conservative.
- **Employer payroll on-costs (~19.5–21.5 % on top of gross salary):** tryggingagjald 6.35 % · lífeyrissjóður (mótframlag) 11.5 % · sjúkrasjóður 1 % · orlofssjóður 0.25 % · starfsmennta-/endurhæfingarsjóður ~0.35 % (+ optional séreign match 2 %).
- **Personal (from your salary):** tekjuskattur + útsvar (progressive ~31.5 % / 37.95 % / 46.28 % after persónuafsláttur) · lífeyrissjóður (employee) 4 % · stéttarfélagsgjald ~0.7–1 %.
- **Corporate income tax (ehf.) 20 %** on retained profit; dividend 22 %. Salary vs dividend split + deductions = the accountant's optimization (reiknað endurgjald sets a minimum salary).

### Break-even & "living wage" (net take-home / month)

Model: revenue − VAT − payment fees − operating costs = company money; − employer on-costs (~20 %) = gross salary; − personal tax/levies (~33 %) = net in pocket.

| Net take-home / month | Paying users needed |
|-----------------------|---------------------|
| Break-even (covers all costs) | **~7** (fixní ~$186 = 22 971 ISK ÷ (3 518 − 237 ISK na uživatele) = 7,0; 2026-10-11 ~9, předtím ~8) |
| 200.000 ISK | ~147 |
| 350.000 ISK | ~250 |
| **500.000 ISK** (solid Icelandic living) | **~354** |
| 700.000 ISK | ~491 |

- Mandatory contributions (both layers) roughly **double** the user count vs a naive gross model.
- **Claude $100 zůstává** (owner 2026-10-12) — do 2026-10-12 tu stálo „temporary dev cost → drops post-launch“. Bez něj by break-even byl ~3.
- 2026-10-12 přepočteno (CODE-read): fixní po spuštění $186 (Shopify nese obchod agndofa.is, Workspace a doména v ceně agndofa.is, Hetzner dnes 0) → break-even 7,0 a řádky 147 / 250 / 354 / 491 (výpočet níž beze změny).
- Margins on revenue stay high (~88–93 % with voice on every reading); the wedge to *personal net* is what raises the counts.
- 2026-10-11: přepočteno týmž modelem — ověřeno, že s červnovými vstupy (fixní $202.45, variabilní $1.81) dá přesně 147 / 250 / 353 /
  490 a break-even 7,6. Nové vstupy: fixní ~$230 po spuštění, variabilní $1.88 → +1 až +3 uživatelé na řádek; s hlasem ke každému čtení (2026-10-11)
  variabilní $1.92 — řádky beze změny. Výpočet: potřebné peníze
  firmy = čistá mzda ÷ 0,67 × 1,20 (~33 % osobní daně a odvody, ~20 % odvody zaměstnavatele); příspěvek uživatele po DPH 2 837 − 237 ISK.

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
Acquisition cost: volné čtení při registraci — číslo stojí jen v „Cost per Reading“ výš (§20). Marketing cost: effectively zero.

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

### Platby v appkách z obchodů — ⚠️ předpoklad z 2026-06-09 pro Island neplatí (CODE-web 2026-10-13, DECISIONS 2026-10-13 (3))
Do 2026-10-13 tu stálo „Island je EEA → Apple musí umožnit external purchase link (DMA), žádný App Store cut“. Ověřeno u Applu:
platební volby EU platí pro islandský obchod **jen pro hudební streamovací appky**; jinde odkaz ani tlačítko na nákup mimo IAP
nesmí (výjimka jen obchod USA). DMA navíc v EHP zatím převzaté není. Pravidla 3.1.1: odemknout funkci kódem/QR vlastním
mechanismem nesmí; 3.1.3(b): co si člověk koupil na webu, smí v appce používat, jen když se to dá koupit i přes IAP.
→ Rúnakort a předplatné v iOS appce = IAP (provize 15 % v Small Business Programu do 1 M USD), nebo appka bez nákupu.
Google Play (od 2026-06-30, EHP): poplatek za službu 10 % (i předplatné) + 5 % za Play Billing; při odkazu na web jen 10 % —
zda program platí i pro Island, Google nevypisuje (neověřeno). Rozhoduje owner.
Zdroje: developer.apple.com/app-store/review/guidelines (3.1.1, 3.1.3, 4.2) · developer.apple.com/support/communication-and-promotion-of-offers-on-the-app-store-in-the-eu · developer.apple.com/app-store/small-business-program ·
android-developers.googleblog.com/2026/06/play-expanded-billing.html

### Skutečné náklady nativní appky
| Položka | Cena | Frekvence |
|---------|------|-----------|
| Apple Developer Program | $99/rok | Roční |
| Google Play Developer | $25 | Jednorázově |
| Provize obchodu | Apple IAP 15 % (Small Business) · Google 10–15 % | viz sekce výš |
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

*Last updated: 2026-10-11 — náklady přepočteny na GPT-6 sol (`scripts/utils/pricing_tabulka.js`), hlas se stropem, EN hlas za skutečnou sazbu*
*ElevenLabs sazby: `EL_PRECERPANI` ve `scripts/utils/stats.js` (zdroj a datum ověření stojí u nich)*

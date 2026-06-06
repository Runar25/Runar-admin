# RUNAR_PRICING.md
# Business model, ceny, distribuce — jediný zdroj pravdy pro business rozhodnutí.
# Přečíst vždy když pracujeme na tier systému, cenách nebo distribuci.
# Poslední aktualizace: 2026-06-03

---

## Core filozofie

Rúnar není appka. Je to osobní průvodce s hlasem, pamětí a živým stromem.
Cenová strategie musí reflektovat tuto hodnotu — ne soutěžit s generickými tarot appkami.

Funnel má jeden směr:
```
Fyzický produkt (runové kameny, kakao...)
        ↓
Rune Card uvnitř (1 free reading, hlas zahrnut)
        ↓
Uživatel zažije Rúnara — chce víc
        ↓
Kredity jsou drahé na jedno čtení
        ↓
Standard subscription = zřejmá volba
```

Kredity nejsou produkt. Jsou akvizičním nástrojem.
Standard subscription je produkt.

---

## Náklady na jedno čtení

Základ: Single rune = 430 ElevenLabs znaků (reálné měření).
Claude model: Sonnet 4.x napříč všemi tiery.
ElevenLabs: eleven_v3 (IS) / Flash (EN).

**IS je průměrně 2.7× dražší než EN** (eleven_v3 vs Flash).

| Spread | Tokeny | EL znaky | Claude | EL IS | EL EN | Total IS | Total EN |
|--------|--------|----------|--------|-------|-------|----------|----------|
| Single (1) | 430 | 430 | $0.006 | $0.129 | $0.043 | **$0.135** | **$0.049** |
| Trojice/Norns (3) | 700 | 700 | $0.011 | $0.210 | $0.070 | **$0.221** | **$0.081** |
| Kříž (5) | 900 | 900 | $0.014 | $0.270 | $0.090 | **$0.284** | **$0.104** |
| Horseshoe (7) | 1200 | 1200 | $0.018 | $0.360 | $0.120 | **$0.378** | **$0.138** |
| Yggdrasil (9) | 1500 | 1500 | $0.023 | $0.450 | $0.150 | **$0.473** | **$0.173** |
| Life Rune Std | 1200 | 0 | $0.018 | — | — | **$0.018** | **$0.018** |
| Life Rune Prem | 2000 | 0 | $0.030 | — | — | **$0.030** | **$0.030** |

Průměrná cena/runu při realistickém mixu spreadů:
- IS: **$0.085/runu**
- EN: **$0.031/runu**

Akvizice přes fyzický produkt: ~$0.135 na uživatele (IS). Marketing cost: nulový.

---

## Tier struktura

### Visitor (free_trial)
- 1 čtení celkem, hlas zahrnut
- Pouze Single rune (Fehu)
- Bez stromu, bez journalu
- Účel: ukázat co Rúnar je

### Rune Seeker (rune_seeker)
- **1 čtení zdarma při registraci** (hlas zahrnut)
- Žádný weekly drip — po onboardingu jen kredity
- Další čtení přes kredity (Reading Gift Card)
- 1 kredit = 1 runa tažená
- Přístup přes kredity: všechny spready (Single, Trojice, Norns, Gathering, Kříž, Horseshoe, Yggdrasil)
- Yggdrasil: sezónní omezení Dec 14–28 platí i pro RS
- Strom: zakládací rituál za 5 kreditů, teaser pouze
- Journal: posledních 5 čtení

**Fyzická cesta (Rune Card):** +1 kredit navíc → celkem 3 čtení zdarma před první platbou.
Online cesta: Visitor 1 + RS 1 = 2 zdarma. Fyzická: Visitor 1 + Rune Card 1 + RS 1 = 3 zdarma.

### Rune Walker — Standard (~2.490 ISK/měsíc)
*DB hodnota: standard | Nové UI jméno: Rune Walker (rozhodnutí 2026-06-06)*
- **Limit: 50 run/měsíc**
- Všechny spready včetně Yggdrasil (Dec 14–28)
- Full Tree of Life + zakládací rituál zdarma
- Full journal
- Hlas zahrnut
- Life Rune: plný výklad (1200 tokenů)
- Účel: hlavní produkt, cíl všech funnelů

### Rune Keeper — Premium (~3.490 ISK/měsíc)
*DB hodnota: premium | Nové UI jméno: Rune Keeper (rozhodnutí 2026-06-06)*
- **Limit: 75 run/měsíc**
- Vše jako Rune Walker
- Life Rune: hlubší výklad (2000 tokenů) + etymologie jména + mytologická postava
- Budoucí: kakao ceremonial, další features
- Účel: hloubka, pro oddané uživatele

### Standard+ / Premium+ (budoucí tiery)
- Unlimited run/měsíc
- Cena TBD
- Implementovat až 50/75 limitů ukazují potřebu

---

## Spreads per tier

| Spread | Runy | Visitor | Rune Seeker | Standard | Premium |
|--------|------|---------|-------------|---------|---------|
| Single | 1 | 1× celkem | 1 free + kredity | ✅ (z limitu) | ✅ (z limitu) |
| Trojice | 3 | ❌ | kredity (3) | ✅ | ✅ |
| Norns | 3 | ❌ | kredity (3) | ✅ | ✅ |
| The Gathering | — | ❌ | kredity (3) | ✅ | ✅ |
| Kříž | 5 | ❌ | kredity (5) | ✅ | ✅ |
| Horseshoe | 7 | ❌ | kredity (7) | ✅ | ✅ |
| Yggdrasil | 9 | ❌ | kredity (9) | ✅ | ✅ |

Počítání limitu: 1 runa tažená = 1 z měsíčního limitu.
Kříž (5 run) = 5 z limitu. Yggdrasil (9 run) = 9 z limitu.
Kredity (Rune Seeker): credit cost = počet run v spreadu.
Sezónní omezení: Yggdrasil pouze Dec 14–28 (platí pro všechny tiery).
Visitor = jediný tier bez přístupu ke spreadům (kromě Single 1×).

---

## Marže při různém poměru IS/EN uživatelů

Standard $28.3/měsíc · 50 run limit / Premium $36.4/měsíc · 75 run limit

| Tier | IS uživatelé | Náklady celkem | Marže |
|------|-------------|----------------|-------|
| Standard 50 | 100% IS | $6.25 | **78%** |
| Standard 50 | 70% IS / 30% EN | $5.44 | **81%** |
| Premium 75 | 100% IS | $8.88 | **76%** |
| Premium 75 | 70% IS / 30% EN | $7.66 | **79%** |

Nejhorší scénář (100% IS): Standard 78%, Premium 76%. Marže zdravá.
Turisté a mezinárodní EN uživatelé marži jen zlepšují.

---

## Kreditní karty (Reading Gift Cards)

Kredity jsou záměrně drahé vs. předplatné — jsou akvizičním nástrojem, ne hlavním produktem.
Engaged user (50 run/měsíc) na kreditech = ~10× dražší než Standard.

| Karta | Kredity/runy | ISK | ISK/runu |
|-------|-------------|-----|----------|
| Starter | 5 | 1.490 ISK | 298 ISK |
| Seeker | 10 | 2.490 ISK | 249 ISK |
| Wanderer | 20 | 4.490 ISK | 225 ISK |
| Elder | 30 | 6.490 ISK | 216 ISK |
| Master | 50 | 9.990 ISK | 200 ISK |

Engaged user (50 run/měsíc) na Master kartě: 9.990 ISK vs Standard 2.490 ISK.
Toto je argument pro upgrade — ne marketing, reálná matematika.

---

## Předplatné

| | Standard | Premium |
|--|---------|---------|
| ISK/měsíc | 2.490 ISK | 3.490 ISK |
| EUR/měsíc | ~€17 | ~€24 |
| Limit run/měsíc | 50 | 75 |

Kurz (červen 2026): €1 = 143.6 ISK / $1 = 123.5 ISK. ISK ceny fixní.

---

## ElevenLabs plán — kdy upgradovat

| Uživatelé | EL plán | EL $/měsíc | Poznámka |
|-----------|---------|-----------|---------|
| 1–5 | Creator $22 | $22 | Start zde |
| 6–119 | Pro $82.50 | $82–370 | Přejít ihned od 6 uživatelů |
| 120–500 | Scale $330 | $330–1.500 | Přejít při ~120 uživatelích |
| 500+ | Scale + overages | $1.500+ | Enterprise jednání |

Creator → Pro: přejít ihned (Pro je levnější od ~6 uživatelů).
Pro → Scale: při ~120 uživatelích.
Enterprise: kontaktovat ElevenLabs při ~500 uživatelích / $17.000 měsíčním revenue.

---

## Go-to-market strategie

### Island jako základ autenticity — ne jen jako trh

Rúnar není "nordic-themed app made somewhere." Vznikl na Islandu, mluví o Islandu,
zná islandské měsíce, islandské světlo, islandský rytmus. To je hodnota kterou nelze napodobit.

Anglicky mluvící uživatel to chce cítit — ne přeloženou verzi.
Island je origin story — authentická, ne vyrobená.

### Akvizice přes fyzický produkt

```
Turista přijede na Island
        ↓
Koupí runové kameny v suvenýrovém obchodě
(kameny designované Sigrun — islandská umělkyně, v přípravě)
        ↓
Uvnitř: Rune Card s QR kódem → 1 free reading
        ↓
Rúnar ví že přišli přes fyzické kameny — jiný úvod
        ↓
Odjedou domů — strom roste dál
        ↓
Huginn přinese připomínku — vrátí se
        ↓
Kredity jsou drahé → Standard subscription
```

Akvizice stojí ~$0.135 na uživatele. Marketing náklady: nulové.
Island má ~2M turistů ročně.

### Distribuce (ve fázi plánování)

| Kanál | Poznámka |
|-------|---------|
| Suvenýrové obchody — Reykjavík | Největší průtok turistů |
| Akureyri — cruise ship zastávky | Sezónní, koncentrovaný |
| Letiště Keflavík | Každý turista projde |
| Online přes Sigrun | Existující zákazníci |
| Agndofa markets | 2× ročně, přímý kontakt |
| Hotely, wellness studia, retreaty | Potenciál — budoucí |

### Jak udržet islandský charakter pro anglicky mluvící

- Islandské měsíce v life rune zůstávají IS i pro EN výklad (Mörsugur, Þorri...)
- Islandská příroda imagery v každém čtení — fjordy, lávová pole, půlnoční slunce
- Jméno Rúnar zůstává (ne "Runar" bez diakritiky)
- Fyzický kontakt (kameny) drží reálné spojení s místem

Anglicky mluvící nekupuje přeloženou verzi — kupuje přístup k něčemu co přišlo odjinud.

---

## Fyzické produkty

### Runové kameny (v přípravě — Sigrun)
- 25 Elder Futhark kamenů v sáčku
- Design: Sigrun (partnerka, islandská umělkyně)
- Výrobní náklady: zatím neznámé, ve fázi návrhu
- Prodejní cena: TBD po kalkulaci výroby
- Timeline: cca za pár měsíců

### Rune Card
- Gift card formát + QR kód
- Obsah: 1 free reading credit → vstup do Rúnara
- Součást každého fyzického produktu
- Obsah karty (ISK, počet kreditů): TBD před tiskem

### Bundle: Runové kameny + Rune Card
- Základní bundle — vše ostatní TBD
- Cílová marže: 70–75%
- Finální cena až po kalkulaci výroby kamenů

### Agndofa Ceremonial Cacao
- Prodejní cena: 2.500 ISK
- Výrobní náklady: ~700 ISK
- Marže: ~72%
- Stránka: agndofa.is/products/agndofa-ceremonial-cacao

---

## Otevřené otázky (neimplementovat dokud nevyřešeno)

| Otázka | Kontext |
|--------|---------|
| Finální ISK ceny Standard/Premium | Čísla výše jsou pracovní návrh |
| Obsah Rune Card — kolik kreditů, jaký text | Před tiskem |
| Zakládací rituál s hlasem nebo text only? | S1 je delší — hlas přidá $0.30 náklady |
| Kdy přejít na ElevenLabs Pro? | Ihned od ~6 platících uživatelů |
| Standard+ / Premium+ | Implementovat až limits ukáží potřebu |
| Tracking karet — která série z které lokace | Logistika distribuce |
| Horseshoe/Norns hlas na Standard — ano nebo ne? | Ovlivní ElevenLabs plán |

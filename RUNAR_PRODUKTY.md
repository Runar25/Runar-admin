# RUNAR_PRODUKTY.md — fyzické produkty: sada run, Rúnakort jako karta, balíčky, ekosystém
# Vlastní: fyzické produkty a jejich most do appky. Ceny čtení, tiery, náklady a marže → RUNAR_PRICING.md; hodnoty → v2/runar-config.js.
# Changelog: 2026-11-19 přesunuto doslova z RUNAR_PRICING.md (délka docu, smoke ㉝; odklad: „business + fyzické produkty v jednom“), CODE-tune.

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


# Snapshot 2026-06-07 — Trojice removal, Voice profiles, Spread journal

## SW verze: v68
## Poslední commit: 65bf650

---

## Změny tohoto dne (2026-06-07)

### 1. Voice profiles systém
- `ACTIVE_VOICE_PROFILE = 'focused'` + `VOICE_PROFILES` přidány do runar-config.js
- Dva profily: **focused** (produkce — 1 přesný smyslový obraz) + **lyrical** (původní hlas, revert)
- IS profily psány nativně (nikdy překlad)
- `_getVoiceProfile(key, lang)` helper v runar-character.js
- `buildSysPrompt(c, lang, profileKey)` — nová signatura
- `buildSysPromptV2(lifeRune, lang, profileKey)` — HOW YOU SPEAK sekce injektována
- DEF_CHAR_EN/IS: odstraněna pole voice/variability/imagery (nyní v profilu)
- DEF_CHAR_V2_EN: odstraněny HOW YOU SPEAK/VARIABILITY/IMAGERY sekce
- Shrine: dropdown VOICE switcher (`localStorage: shrine_voice_profile`)
- Revert: změnit `ACTIVE_VOICE_PROFILE = 'lyrical'` v runar-config.js

### 2. Pill toggle fix
- `buildPillGroup()` v runar-app.js: druhý klik odznačí pill + vymaže readerUser.[area|seeking|mood|intention]
- Platí pro všechny 4 skupiny (area, seek, mood, intention)

### 3. Multi-rune spready → journal (jako The Gathering)
- `saveSpreadReading(spreadName, runesArr, text)` přidána do runar-app.js
- `area: 'spread'` = speciální marker (stejný vzor jako `area: 'gathering'`)
- `short_text` = všechny runy display (ᚠ FEHU · ᚢ URUZ · …)
- `deep_text` = celý text čtení
- Norns/Kříž/Horseshoe/Yggdrasil všechny používají saveSpreadReading
- Journal: `isSpread` karta (✦ glyph, spread name, rune display, excerpt)
- Filter: `✦ Spreads` option v area dropdownu; spreads vyloučeny z rune dropdownu

### 4. Trojice ODSTRANĚNA
Trojice nikdy neměla existovat jako samostatný spread — od začátku to měla být Norns.

Smazáno z:
- runar-config.js: free_spreads (4 tiery), SPREAD_COSTS.trojice, SPREAD_CONFIG.trojice
- runar-character.js: buildTrojicePromptIS/EN/wrapper (110 řádků)
- runar-reading.js: trojice větev readRune(), _generateSpread3Reading(), generateVoice(), drawAnother()
- runar-reader.html: mode-btn-trojice button ("3 READINGS")
- runar-shrine.html: Trojice inline prompt → buildNornsPrompt()
- runar-app.js: _sm === 'trojice' check

### 5. Bug fix: Norns output label
- `s3-trojice-lbl` → `s3-norns-lbl` (reader.html + shrine.html + reading.js)
- Norns sdílel label element s Trojice — po smazání Trojice by se rozbil

### 6. Norns = jediný zakládací rituál stromu
- Tři Norny = tři kořeny Yggdrasilu (Urðr/Verðandi/Skuld)
- Jedno čtení zasadí všechny tři kořeny najednou — mytologicky přesné
- Cena: RS = 3 rune stones | Standard = 3 z měsíčního limitu | Premium = 3 z měsíčního limitu
- Hodnoty vždy z TIER_LIMITS — nikdy hardcoded "zdarma"

### 7. Yggdrasil gate opraven
- Byl: Premium only + admin bypass
- Je: všichni přihlášení (RS za kredity, Standard/Premium z limitu) + sezónní Dec 14–28 + admin bypass
- Visitor zůstává blokován

---

## Architektura spreadů (aktuální)

| Spread | Runy | Tier | Cena |
|--------|------|------|------|
| Single | 1 | všichni | Visitor 1×, RS 1 free+kredity, Standard/Premium z limitu |
| Norns | 3 | RS+ | RS 3 kredity, Standard/Premium 3 z limitu |
| Kříž | 5 | Standard+ | 5 z limitu |
| Horseshoe | 7 | Standard+ | 7 z limitu |
| Yggdrasil | 9 | RS+ (Dec 14–28) | RS 9 kreditů, Standard/Premium 9 z limitu |
| The Gathering | — | RS+ | RS 3 kredity, Standard/Premium z limitu |

---

## Zakládací rituál

Norns (3 runy) = jediná session:
- Urðr → první kořen: kdo jsi v jádru
- Verðandi → druhý kořen: kterým směrem se skláníš
- Skuld → třetí kořen: co pohání tvůj růst

Po dokončení kořeny uzamčeny navždy.

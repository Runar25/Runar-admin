# Session 2026-05-31 (část 3) — Trojice v produkci + shrine opravy + design update

## Co bylo uděláno

### 1. Shrine opravy (ReferenceError)
- `isAdmin()` přesunuta z runar-auth.js → runar-utils.js (shrine nenačítá auth.js)
- `t()` přidána do runar-utils.js (odstraněna při shrine syncu, nikdy přidána do sdíleného souboru)
- Obě funkce nyní v runar-utils.js — načítají reader i shrine

### 2. Trojice (3 runy) implementována v produkčním readeru
**Soubory změněny:**
- `runar-config.js` — přidán `SPREAD_CONFIG` (single, trojice, cross s pozicemi EN+IS)
- `runar-character.js` — přidány `buildTrojicePromptIS()`, `buildTrojicePromptEN()`, `buildTrojicePrompt()` dispatcher
- `runar-reading.js` — `_setSpreadMode()`, `_updateSpread3Slots()`, rozšířen `readRune()`, přidán `_generateSpread3Reading()`
- `runar-reader.html` — mode switcher `[SINGLE RUNE][3 READINGS]`, slot tracker `① ② ③`, `spread3-output` sekce, `id="single-layer1/2"` přidány
- `runar-reader.css` — `.mode-btn`, `.spread3-slots`, `.s3-slot` styly
- `sw.js` — bumped na v24

**UX (po opravě):**
- Žádná automatika — uživatel musí kliknout HEAR RÚNAR SPEAK po vybrání 3 run
- Plný slot klikatelný → hover = přeškrtnutí → klik = odstraní runu
- Nová runa jde do prvního prázdného slotu
- Tlačítko aktivní až po 3 plných slotech

**Kredity:**
- Standard/Premium: zdarma
- Rune Seeker: 3 kredity (callProxy deducts 1 + 2× use_credit RPC)

### 3. Nový workflow dohodnut
```
1. Záměr → 2. Návrh Claude → 3. Upřesnění → 4. Implementace → 5. Snapshot
```
Příběh se vyvíjí — dokumentace musí být živá.

### 4. Dokumentace přepracována
- `CLAUDE.md` přepsán na čistou strukturu (~180 řádků, byl 1046)
- `RUNAR_DESIGN.md` vytvořen — design doc oddělený od provozních pravidel
- `working-style.md` aktualizován — nový 5-krokový workflow
- `RUNAR_DESIGN.md` aktualizován novým obsahem (RUNAR_DESIGN_new.md)

### 5. RUNAR_DESIGN_new.md — nový obsah (⚠️ KONFLIKTY ČEKAJÍ NA ŘEŠENÍ)
Tři otevřené konflikty pro příští session:

| # | Konflikt | Status |
|---|---------|--------|
| 1 | Norns: 9 run → 3 runy (Urd/Verdandi/Skuld) | ❓ čeká |
| 2 | Yggdrasil: nový 9-run spread, jen Premium, 1×/rok | ❓ čeká |
| 3 | The Gathering: výběr z journalu → táhnutí nových run | ❓ čeká |

Nový obsah který není v konfliktu (přijat):
- Filozofie rituální kadence (frekvence → síla větví)
- Ceník: Standard €12/měs, Premium €19/měs
- Tier × spread matice (Kříž = jen Standard+, Horseshoe = Standard+, Yggdrasil = Premium)
- Norns = 3 runy, jiný charakter než Trojice (čeká na potvrzení)

## Stav souborů

| Soubor | Změna |
|--------|-------|
| runar-utils.js | isAdmin() + t() přidány |
| runar-config.js | SPREAD_CONFIG přidán |
| runar-character.js | buildTrojicePromptIS/EN/dispatch přidány |
| runar-reading.js | Trojice UX kompletní |
| runar-reader.html | mode switcher + slots + spread3-output |
| runar-reader.css | spread styly |
| sw.js | v24 |
| CLAUDE.md | přepsán na čistou strukturu |
| RUNAR_DESIGN.md | nový design doc s konflikty |

## SW verze: v24

## Commits dnešní části 3
- fix: move isAdmin() to runar-utils.js — shrine ReferenceError
- docs: add RUNAR_DESIGN.md — design decisions not yet in code
- fix: add t() to runar-utils.js — shrine updateUIText ReferenceError
- feat: Trojice (3-rune spread) in production reader
- fix: Trojice UX — manual confirm + editable slots
- docs: restructure CLAUDE.md — concise quick-reference format

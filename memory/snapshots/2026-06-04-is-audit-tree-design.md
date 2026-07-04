# Session 2026-06-04 — IS audit, random rune, tree design

## SW verze: v31
## Poslední commit: 2aa134c

---

## Co bylo uděláno

### 1. Random rune draw (slot machine)
- Tlačítko `ᚲ LET THE RUNES DECIDE` / IS: `ᚲ LÁTTU RÚNIRNAR VELJA`
- Mezi rune-grid a HEAR RÚNAR SPEAK
- Animace: 15 rychlých framů (60ms) → 8 zpomalujících → 300/450/600ms → stop
- `.rb.flashing` = zlatý glow (jiný od `.rb.on` modrého)
- Dostupné pro všechny tiery
- Funkce `drawRandomRune()` v runar-app.js

### 2. Rule §8 full audit — tier hodnoty config-driven
**Přidáno do TIER_LIMITS (runar-config.js):**
- `panel_props: { en, is }` pro všechny 4 tiery
- `monthly_limit: 50` pro Standard, `75` pro Premium

**PANEL_TIERS v runar-app.js** nyní čte z `TIER_LIMITS.panel_props` — žádné hardcoded texty.

**Opraveno v 5 souborech (16 míst):**
- runar-auth.js: "three free readings" → "your free reading"
- runar-reading.js: "Monthly free readings exhausted" → "Monthly reading limit reached"
- runar-help.html: "5 readings per month" → správný RS popis
- runar-app.js: Standard/Premium panel props, trial-end note IS/EN
- runar-config.js: TIERS.rune_seeker.monthly_readings: 5→null

### 3. IS korekce — gramatika

**Přímé opravy:**
| Původní | Správně | Soubor |
|---------|---------|--------|
| LÍFSTÍÐARRÚNAN ÞÍN | LÍFSRÚNIN ÞÍN | translations.js |
| rúnarnar (všude) | rúnirnar | character.js, help.html, yggdrasil.html |
| ÞAGNINNI | ÞÖGNINNI | shrine.html (2×) |
| DRAGA AÐRA RÚNU | DRAGA AÐRA RÚN | translations.js |
| KENNA AÐRA RÚNU | KENNA AÐRA RÚN | translations.js |
| Veldu rúnu | Veldu rún | translations.js |
| Þú ber lífsrúnu | Þú ber lífsrún | tree.js |
| þessarar rúnu | þessarar rúnar | utils.js |
| eina rúnu | eina rún | yggdrasil.html |
| fornars norræns | fornar norræns | character.js |
| náttúrulegann hátt | náttúrulegan hátt | character.js |
| kyrrlægar skógar | kyrrlegar skógar | character.js |
| prédikur ekki | prédíkar ekki | character.js |
| sérhær setning | sérhver setning | character.js |
| sem þarð til | sem þarf til | app.js |
| lestrana þin | lestrana þín | app.js |

### 4. IS Quality tooling

**`check-is.py`** — nový skript, spustit před každým IS commitem:
```
python check-is.py
```
Obsahuje 15+ BAD_PATTERNS. Přidat nové korekce sem + do shrine DB.

**`audit-is-yfirlestur.py`** — posílá IS text na yfirlestur.is API:
```
python audit-is-yfirlestur.py
```
Výstup: `is-audit-report.txt`
POZOR: vyžaduje User-Agent header (již opraveno ve skriptu).

**`IS_REVIEW_NATIVE.md`** — 8 nejistých výrazů pro rodilého mluvčího:
1. "eins og fornur sögumaður" — nominativ nebo dativ?
2. "drægnu rúnina" — správný tvar participia?
3. "vefa örlög" (norny tkají osud) — záměrné, nechat?
4. "rúnalestur" — API navrhuje rúnaletur (jiný význam, nechat rúnalestur)
5. "almæli" — neologismus nebo chyba?
6. "lífsvið" vs "lífssviðs"
7. "fjarðum" (fjordech) — API navrhuje ferðum (cestách), nechat fjarðum
8. "eru genginn" — správná shoda?

**Rule §9 přidána do CLAUDE.md:** python check-is.py před každým IS commitem.

### 5. Tree of Life — design dokumenty přečteny

Přečteny dva nové design dokumenty (runar_patch_v0.5.md + engagement doc).
**Nejsou implementovány — pouze design.**

**Patch v0.5 — klíčové koncepty:**
- Branch objekt: 7 nových polí (phase, bloom_start, bloom_duration, bloom_progress, parent_id, leaf_density, leaf_count)
- 4 fáze růstu: silhouette → growing → full → leafing
- Bloom time: single 12h, norns 24h, kříž 48h, horseshoe 72h
- Závislý růst: parent_id hierarchie (skuld čeká na urð+verðandi)
- Skuld: max opacity 0.85 navždy — budoucnost je vždy průhledná
- RUNAR_CONFIG objekt pro všechny nastavitelné parametry
- Shimmer: max 1–3 listy najednou, vzácné = cennější

**Engagement doc — klíčové koncepty:**
- Retention loop: strom se mění → důvod se vracet
- Vrstva 1 (ambient): větvě se houpají, světlo problikává
- Vrstva 2 (triggered): bloom po čtení, element barvy
- Vrstva 3 (čas): reálné světlo, roční období (vzdálená budoucnost)
- Vrstva 4 (mytologie): Ratatoskr, Níðhöggr, Orel, Dísir (premium)
- Dvouvrstvý Canvas: static (kmen/větve) + dynamic (listy/particles)

**Analytické závěry:**
- Vizuálně: SVG pro kmen/větve + CSS pro bloom + dynamické SVG listy (ne L-systém pro MVP)
- PoC scope: ambient dýchání + triggered bloom jedné větve
- Napětí v dokumentech: "není gamifikace" vs streak/milestone mechanics → rozhodnutí odloženo

**Zatím NEIMPLEMENTOVÁNO:**
- tree_state DB tabulka
- tree_readings DB tabulka
- Branch objekt
- Vizuální vrstva

---

## Soubory změněny (kód)

| Soubor | Změna |
|--------|-------|
| runar-app.js | drawRandomRune(), PANEL_TIERS z configu, trial-end texty |
| runar-config.js | TIER_LIMITS: panel_props, monthly_limit |
| runar-auth.js | "three free" → "your free reading" |
| runar-reading.js | monthly limit message |
| runar-help.html | RS/Standard/Premium popis |
| runar-character.js | 5 IS gramatických oprav |
| runar-translations.js | LÍFSRÚNIN, rúnirnar, DRAGA AÐRA RÚN |
| runar-shrine.html | ÞÖGNINNI (2×) |
| runar-yggdrasil.html | rúnirnar, eina rún |
| runar-tree.js | Þú ber lífsrún |
| runar-utils.js | þessarar rúnar |
| runar-reader.html | btn-random |
| runar-reader.css | .rb.flashing, .btn-random |
| sw.js | v31 |

## Nové soubory v repo

| Soubor | Účel |
|--------|------|
| check-is.py | IS quality checker — spustit před IS commitem |
| audit-is-yfirlestur.py | Posílá IS text na yfirlestur.is API |
| IS_REVIEW_NATIVE.md | 8 nejistých výrazů pro rodilého mluvčího |
| TIER_LIMITS_archive.md | Archiv starého TIER_LIMITS.md |

## Příští kroky

### Hned po /compact
- Tree of Life PoC: `runar-tree-poc.html`
  - Ambient dýchání větví (sin wave)
  - Triggered bloom jedné větve (klik = "hodil jsem runu")
  - Debug timer pro testování bloom

### Pending (z minulých sessions)
🔴 Resend SMTP — magic link emaily z agndofa.is
🔴 Shopify webhook — tier upgrade po nákupu
🔴 DPA Supabase — čeká na email
🟡 Standard tier nákupní flow ("COMING SOON")
🟡 Kříž implementace (5-run spread)
🟡 Privacy Policy odkaz na agndofa.is
🟢 Monthly limit 50/75 — počítání z readings tabulky v claude-proxy
🟢 Weekly drip odstranit z claude-proxy Edge Function
🟢 SSE streaming
🟢 Delší výklady pro Standard (1000–1200 tokenů)

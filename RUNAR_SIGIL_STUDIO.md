# RUNAR_SIGIL_STUDIO.md — Bind-rune (bandrún) maker
# Standalone geometry tool. Status: v0 MVP built + verified (2026-07-06). NOT in production.
# Intent source: RUNAR_EKOSYSTEM.md §3–4 (Desktop doc). Design settled via 4-lens + adversarial workflow.

## Co to je
Standalone nástroj MIMO Rúnar: operátor (Sigrún) vybere 3–4 Elder Futhark runy → nástroj je slije
do jednoho **bound glyfu** (nebo sekvence) → export **vektor SVG** pro **laser-cut** přívěsek.
**Nula AI, nula DB, nula závislosti na Rúnar appce.** Čistě klientská geometrie. Estetiku dělá
člověk (vybere z variant), geometrii stroj. Lab pattern = jako tree-of-life (Python builder →
self-contained HTML + snapshoty + local serve, promote až po schválení).

## Settled architektura (shoda 4 nezávislých přístupů: autenticita/algoritmus/operátor/laser)
1. **Runa = pár rovných úseček** `[x1,y1,x2,y2]` na normalizovaném rámci, kde **osa x=0 JE sdílený stav (spine)**.
2. **Bind = kolaps stemů na jednu páteř** + planarizace (řez v průsečících) + weld (kvantizace na mřížku) →
   jeden souvislý graf. Dvě stejné úsečky splynou v jednu — to sloučení *je* ten bind.
3. **SVG, ne Canvas** (na rozdíl od tree = raster kůra). Laser chce vektor, SVG je přímo ten formát.
4. **Varianty → skóre → Sigrún vybere → doladí.** Estetika = člověk.
5. Rám: spine `x=0`, `y` 0 (dole) → 100 (nahoře), větve `|x|≤~40`, souřadnice kvantované (robustní weld).

## 6 pastí, na které naivní přístup (a ChatGPT) najede — a jak je řešíme (zabudováno od začátku)
| Past | Fix |
|---|---|
| **Fantomová runa** — protáhnout spine skrz Gebo (X) přidá svislici → mění VÝZNAM amuletu | per-runa **attach policy** (viz níže) + meaning-integrity check: zahoď variantu přidávající tah mimo vybrané runy |
| **Špatná taxonomie** — Kenaz nemá stem; Uruz je vlastně stem; Ehwaz/Mannaz = DVĚ svislice (mezera je jejich znak) | **tři třídy** (níže); double-stave runy mají jednu svislici NA páteři, druhou vedle — žádná injektovaná středová čára |
| **Chybí planarizace** — Gebo protíná páteř uvnitř úsečky, ne v koncovém bodě → nepřivaří se | povinný krok: **rozsekat úsečky v průsečících**, vložit uzel, pak weld + union-find |
| **Zrcadlení ničí identitu** — flip Ansuzu = už to není Ansuz; skóre „symetrie" to preferuje | `direction_locked` flag; zamčené runy jen posun výšky, ne flip. Skóre = „každá runa čitelná", ne symetrie |
| **Totem** — dva kosočtverce nad sebou = sekvence maskovaná za bind | cap na centered runy na páteři; přebytek → sekvenční režim / varování |
| **Cut-out je nejtěžší kód** — offset větveného grafu → sebeprůniky, jehlové slivery, odpadlé kusy | **MVP = jen centerline/engrave**; cut-out = pozdější fáze s **vendorovanou union knihovnou** (Clipper) + validátory (souvislost, min. šířka, min. úhel) NE ručně |

## Tři třídy run + attach policy
- **stem** — má svislý stav (Isa, Fehu, Þurs, Ansuz, Raidho, Nauthiz, Eihwaz, Perth, Algiz, Tiwaz, Berkana, Laguz, **Uruz**).
  Ukládá jen BRANCH tahy; stem = sdílená páteř.
- **centered** — vlastní centerline, po které páteř prochází:
  - `threaded` — páteř prochází runou (Ingwaz/kosočtverec, Eihwaz). Ingwaz+Ísa = Courage.
  - `seat` — runa se přivaří k páteři nejbližší hranou, páteř ji NEprobodne (Gebo X, Sowilo, Jera) → žádná falešná svislice.
- **double-stave** — DVĚ svislice (Ehwaz, Mannaz): jedna authored NA x=0, druhá vedle. Žádná injektovaná středová čára.
- **direction_locked** (Ansuz, Fehu, Þurs, Raidho, Wunjo, Laguz, Kenaz, Perth, Berkana, Tiwaz) — collision se řeší posunem výšky, ne flipem.

*Pozn.: Kenaz = holý úhel „<" bez stemu (NE stem-runa, jak tvrdila brief); ověřit každou runu proti chartu solo-renderem než se cokoli bindí.*

## Pipeline (buildBind)
pick → urči rozsah páteře → emit 1 spine (když je stem/threaded) → přidej tahy (stem=větve, threaded=jak jsou, seat=posun k hraně) →
**planarize** (řez v průsečících+koncích) → **weld** (kvantizace+dedup, ZACHOVÁ junction uzly) → **components** (union-find, warn >1) → SVG.
⚠️ Lekce z MVP: kolineární slévání úseček (weldAndMerge) MUSÍ být až v exportu, NE před connectivity checkem — jinak zahodí T-junction uzly a spojený glyf se jeví jako rozpadlý.

## Soubory
- `build_sigil_lab.py` (root) — Python generátor (§1: JS přes Python). Emituje →
- `v2/sigil-lab/sigil-engine.js` — ATLAS (8 run MVP) + pure geometrie (node-testovatelné, `module.exports`).
- `v2/sigil-lab/sigil-lab.html` — UI (picker, live SVG, download). Standalone, `<script src>` sibling, jede i přes file://.
- Spuštění: `python -X utf8 build_sigil_lab.py`, pak otevřít HTML (nebo local serve).

## MVP stav (2026-07-06) — HOTOVO + OVĚŘENO
- 8 run: Isa, Fehu, Þurs, Ansuz, Tiwaz, Algiz (stem) + Ingwaz (threaded), Gebo (seat).
- Pick ≤4 → live gold SVG → download centerline SVG (mm, „ne cut-out" varování).
- **Verifikace:** node headless 7/7 case = 1 souvislý kus; Courage (Ingwaz+Ísa) vizuálně = kosočtverec na stavu;
  Fehu+Þurs+Ísa vizuálně čistý bind; Gebo+Ísa = X přivařené 2 body na páteři, ŽÁDNÁ svislice skrz X (souřadnice ověřeny).

## Roadmap (další fáze)
1. **Celý atlas 24 run** (3 třídy, solo-render QA proti chartu, správné spellingy Perth/Berkana/Othila/Kenaz).
2. **Varianty + galerie** (side-flip jen u nezamčených / height-stagger / stemless placement → skóre → Sigrún vybere → doladí).
3. **Sekvenční režim** (runy za sebou, sdílí export).
4. **Cut-out/laser zpevnění** (stroke→outline + boolean union přes vendorovanou lib + validátory + kroužek/bail).
5. **Recepty** (obr. „Protection/Safe Journey…" = statické „safe classic" bindy, bez AI).
6. **Snapshoty + IS/EN polish + gold theme parity** s tree labem.

## Otevřené / rozhodnuto
- Umístění = `v2/sigil-lab/` (rozhodnuto, standalone). · Výstup v0 = centerline first (rozhodnuto). · UI = IS-first bilingual (default).
- **Fáze 2 (Rúnar napojení)** = doporuč runy ze záměru / rozbor jména / Life Rune binding — AŽ po v0 (RUNAR_EKOSYSTEM.md §4).

---
name: HANDOFF68 — Rune karty: soupis všeho, co Cowork vytvořil, kde to duplikuje appku, a co musí CODE ověřit zpětně
from: Cowork (read-only; do repa nepíšu)
to: CODE-read (zpětná kontrola) + CODE-tune (po rozhodnutí ownera)
date: 2026-10-18
status: 🟡 K OVĚŘENÍ — owner: „code musí ověřit všechno zpětně, jestli je to správně; appku máme v kódu, font a ostatní věci už máme někde vytvořené, takže duplikuješ“
ověřeno živě: HEAD `420edbd` (2026-10-18). Čteno read-only: `v2/runar-runes.js`, `v2/runar-svgs.js`, `v2/runar-utils.js` (`runeSvg`, ř. 29–), `v2/runar-reader.css` ř. 8–11, `v2/fonts/` (obsah i `fonts.css`), `RUNAR_POPISY_RUN.md` (hlavička + názvy sekcí), `RUNAR_DECISIONS.md` ř. 6643–6668.
souvisí: HANDOFF67 (co karty jsou a pravidla), HANDOFF66 v3 (appka: Visitor/Journal/menu).
---

## Proč tenhle soubor

Pro karty jsem postavil vlastní generátor mimo repo. Owner upozornil, že appka už má písma, runy, barvy i data hotové, a že jsem tedy část věcí **udělal znovu vedle appky**.
Je to pravda — níže je přesný soupis, co je z repa, co jsem vyrobil já a co z toho je kopie logiky, která už v kódu bydlí. **Nic z toho není ověřené CODE;** moje „vypadá správně“ je jen
pohled na renderované stránky (cca 10 z 28 karet × 2 velikosti), ne kontrola proti kódu.

## A. Co jsem vzal z repa (kopie ke dni 2026-10-18, v cloudovém pracovišti; do repa se NIC nezapsalo)

| Zdroj v repu | Co jsem s tím udělal |
|---|---|
| `v2/runar-runes.js` (`RUNES`: `n`, `g`, `svg`, `k`, `world`, `elements`, `aett`) | načteno do generátoru; jména, klíčová slova (`k`), řádek svět · živel · áttr jdou z toho |
| `v2/runar-svgs.js` (`RUNE_SVGS`: `paths`, `vb`) | kameny vkládám jako inline SVG |
| `v2/fonts/*.woff2` (Cinzel, Cormorant Garamond latin + latin-ext, i italic) | načítám lokálně |
| `v2/icons/apple-touch-icon.png` | použito v první verzi obálky, **později nahrazeno** screenshotem; v aktuálním generátoru se nepoužívá |
| `v2/runar-portrait.png` | staženo, **nepoužito** (je to výřez na bílém pozadí, nevypadá jako Rúnar v appce) |
| `v2/runar-reader.css` ř. 8–11 | barvy: `#0a0c12` (--bg), `#FFBF00` (--gold), `#F2F5F7` (--white), `#8ba5c0` (--muted), `#2E4A70` (--border) — **ověřeno teď proti CSS, sedí**. Jsou opsané jako hexy, ne napojené na tokeny |

## B. Co jsem vyrobil já (nové, mimo repo) a je to duplicita nebo riziko

1. **`fonts.css` v mé složce NENÍ soubor z repa.** Repo má vlastní `v2/fonts/fonts.css` (3562 B, hlavička „2026-10-10 … DECISIONS (32)“, bloky z Google Fonts API s `font-display: swap`, `unicode-range` dlouhé, váhy jen 400 a 700). Já jsem ho **nečetl před psaním** a napsal jsem si vlastní, kratší `@font-face` s jinými `unicode-range` a se zkreslenými rozsahy vah (`400 900`, `300 700`) nad stejnými woff2 soubory. Kartám to stačí (vykresluje se), ale je to **druhá definice téhož**. CODE: buď karty napojit na repo `fonts.css`, nebo rozhodnout, že generátor žije v repu a čte ten originální.
2. **Přebarvení kamene do „tiskové“ verze** (`build2.js`, funkce `svg()`): textová náhrada v `RUNE_SVGS.paths` — `fill="#1e2535"` → bílá, `#D6A85C` → `#15171c`, `opacity="0.9"` → `1`. Duplikuje logiku `runeSvg()` v `v2/runar-utils.js` (která umí `frame` a řeže řetězec `paths`). Stejně jako u `runeSvg` je to **závislé na přesném zápisu barev v `RUNE_SVGS`** — když se změní, přebarvení tiše přestane fungovat. Neověřeno, že všech 25 kamenů + Blank má barvy napsané stejně (vizuálně jsem kontroloval jen část).
3. **Štítky „Freya's Aett / Heimdall's Aett / Tyr's Aett“** si skládám sám z `aett: 'freya' | 'heimdall' | 'tyr'`. V kódu je jen ten klíč; **zobrazovaný název v appce jsem nenašel** (grep v `v2/*.js`, `RUNAR_DESIGN.md`, `CLAUDE.md` nic nedal). Je to můj překlad klíče do angličtiny, ne převzatý text. Stejně „Midgard / Asgard / Hel“ a „Fire · Earth · Air · Water · Shadow“ — jména z dat jsou přesná, forma zápisu (velká písmena, tečky) je moje. CODE: ověřit, zda appka někde ukazuje áttr/svět a pod jakým názvem.
4. **25 EN textů významu (`texts.json`)** — Fehu je ownerův doslovně (bez „(ᚠ)“), **zbylých 24 jsem napsal já** z gpt-docx + `k` z repa. Tvrzení v textech jsem **nesrovnával** s `RUNAR_POPISY_RUN.md`, ani s `RUNAR_DESIGN.md`.
5. **Důležité, co jsem při psaní nevěděl:** repo už má **ownerův „statický popis run“** — `RUNAR_POPISY_RUN.md` (929 ř., sekce Fehu … Dagaz + „Prázdná runa — Unknown“, texty ownerovy „zapsané doslovně — CODE je needituje“, česky jako pracovní zdroj) a rozlišuje to od „statického čtení“ (krátký text s hlasem v Kolekci, `runar_static_audio`). Mé karty jsou třetí věc — **krátký EN text bez hlasu** — ale musí s nimi nebýt ve sporu. Hlavička `RUNAR_POPISY_RUN.md` přitom říká, že popis má končit otázkou a ne radou a nemá říkat, co se stane; mé texty to **nesplňují** (např. „It asks you to pause at the threshold…“, „Reward here follows steady work…“ — to jsou tvrzení/rady). Rozhodnout musí owner.
6. **Cover fotka** (`cover_photo.jpg`) je oříznutý ownerův screenshot hlavní stránky, ne originál z `runar-images/Runar_portrait.png`. Kvalita ≈ 420 dpi na 65 mm; na 70 × 120 je zvětšená. Nezapsaný zdroj obrázku v repu — appka ho bere z Supabase.
7. **Generátor** (`build2.js`, `pdf2.py`) není v repu, dá se spustit jen s Node + Playwright a se zkopírovanými vstupy. Pokud karty mají vznikat opakovaně (IS, spadávka, tiskárna), patří generátor do repa **nad stejnými zdroji** (`runar-runes.js`, `runar-svgs.js`, `fonts/`), ne nad kopiemi.
8. **Duplicitní kopie v cloudu** (`/mnt/user-data/uploads/Runar-admin/v2/...`) jsou jen dočasná cache cloudového pracoviště; nejsou na PC a nic z nich do repa nejde.

## C. Co CODE-read ověří zpětně (návrh pořadí; výsledek = tabulka „položka / OK / nesedí / poznámka“)

1. **Jména run** na všech 28 kartách = `RUNES[].n` (pořadí Fehu … Dagaz, Blank). Žádné Perthro/Berkano/Othala.
2. **Klíčová slova** pod jménem = `k` beze změny (jen velké první písmeno).
3. **Řádek svět · živel · áttr** = `world`/`elements`/`aett`; zda štítky jsou přijatelné (viz B3).
4. **Barvy a písma** proti `runar-reader.css` a `v2/fonts/fonts.css` (viz B1); ověřit, že použité váhy opravdu existují (Cinzel jen 400/700; já používám 500).
5. **Kameny**: každý z 26 `RUNE_SVGS` se vykreslil celý, bez ořezu `viewBox`; tisková verze nezanechala žádnou zlatou/tmavou barvu (grep `#D6A85C`/`#1e2535` ve výstupu).
6. **Texty (24 mých) vs. `RUNAR_POPISY_RUN.md` a `RUNAR_DESIGN.md`**: spory, tvrzení mimo kánon (Eihwaz „world-tree“, Blank „Odin“ — jsou z `k`, ostatní z mé hlavy), shoda s pravidlem „obraz → co dělá/nedělá → otázka“. Nic neopravovat; vypsat. Texty jsou doména ownera/Coworku.
7. **Velikosti a tisk:** 65 × 100 a 70 × 120 mm; ořezové značky; archy 4 × 2 (A4 na šířku) a 2 × 2 (A4 na výšku). Ověřit PDF rozměry (`pdfinfo`) a to, že na papíru nejsou karty oříznuté. Spadávka 3 mm **není** — až podle tiskárny.
8. **Obálka a úvodní karta**: citát „The runes do not predict your fate. They remind you of the path you already walk.“ a věta „Rúnar carries the light and points to where you might look. The seeing is yours.“ — ověřit, že jsou doslova podle appky (`runar-translations.js` / `runar-character.js`), ne podle mé paměti ze screenshotu.
9. **Zadní strana** zatím neexistuje (čeká na ownerův soubor s vazebnou runou AGNDOFA).

## D. Pravidla, která z toho plynou pro další práci (Cowork se jimi řídí)

- Než Cowork postaví cokoli, co se podobá appce (písmo, runa, barva, text runy), **nejdřív zjistí, co už repo má** (grep + čtení vlastníka tématu), a až pak staví — dnes jsem to neudělal (B1, B5).
- Co existuje v repu, se **odkazuje, ne kopíruje**. Co musím mít kopií kvůli renderu (PDF), označím jako kopii s datem a hashem HEAD.
- Rune texty, které by mohly spadnout do appky (HANDOFF66 oddíl E), neprojdou bez ownera a bez ověření IS.

## ZMĚNĚNO:

(prázdné — jen podklady a soupis; žádný kód, žádný zápis do repa)

---
name: HANDOFF67 — Rúnar's Book of Stones: stažitelné karty run (EN hotový návrh, IS a zadní strana čekají)
from: Cowork (read-only; kód nepíšu)
to: všechny CODE session (informace, nic neimplementovat bez ownera) + owner
date: 2026-10-18
status: 🟡 NÁVRH v3 — EN karty hotové k posouzení; zadní strana čeká na ownerův soubor; IS verze nezačata; název nevybrán
ověřeno živě: HEAD `420edbd` (2026-10-18); `v2/runar-runes.js`, `v2/runar-svgs.js`, `v2/fonts/*` čteno read-only
umístění souborů: `Claude outputs/rune-cards/` (tato složka; v gitu NEsledováno — „?? Claude outputs/“)
---

## Co to je (ownerovo zadání, 2026-10-18)

Statická, krátká verze významu každé runy — **nikoli hlas Rúnara**. K dispozici ke stažení pro uživatele jako návnada na appku
(„jak se Rúnar na runy dívá“, popis run pro vlastní potřebu) a zároveň podklad, který si my sami necháme vytisknout profesionálně.
Vzhled = vzhled appky. Formát = karty velikosti oracle karet.

Dřívější gpt-docx (`25_rune_short_descriptions_1.docx`) vznikl bez znalosti appky (špatná jména Perthro/Berkano/Othala, špatný vzhled).
Zůstal jen jako hrubý základ; texty jsem přepsal. **Fehu je ownerův vlastní text beze změny** (jen vypuštěno „(ᚠ)“).

## Co je hotové (soubory v `rune-cards/`)

| Soubor | Obsah |
|---|---|
| `cards_65x100_dark_card.pdf` / `_print_card.pdf` | jedna karta na stranu, 65 × 100 mm, tmavá (zlatá na #0a0c12) / tisková (černá na bílé) |
| `cards_65x100_dark_sheet.pdf` / `_print_sheet.pdf` | A4 na šířku, 4 × 2 = 8 karet, ořezové značky |
| `cards_70x120_dark_card.pdf` / `_print_card.pdf` | jedna karta na stranu, 70 × 120 mm |
| `cards_70x120_dark_sheet.pdf` / `_print_sheet.pdf` | A4 na výšku, 2 × 2 = 4 karty, ořezové značky |
| `texts.json` | 25 EN textů (klíč = jméno runy z `runar-runes.js`) |
| `build2.js`, `pdf2.py` | generátor (Node + Playwright/Chromium); vstupy: `runar-runes.js`, `runar-svgs.js`, `fonts/`, `cover_photo.jpg` |
| `cover_photo.jpg` | oříznutý ownerův screenshot hlavní stránky (Rúnar + citát) — viz „Otevřené“ |

28 karet v sadě: obálka · úvodní karta („Before you read“) · 25 run v pořadí appky (Fehu … Dagaz, Blank) · závěrečná poznámka.

## Pravidla, která z ownerových reakcí platí (nerozbíjet)

- **Jména run = jména z appky** (`RUNES[].n`): Perth, Berkana, Othila, Thurisaz, Wunjo, Blank … ne Perthro/Berkano/Othala.
- **Klíčová slova pod jménem = `k` z `runar-runes.js`** (první písmeno velké). Text významu je s nimi v souladu (např. Eihwaz „often linked with the world-tree“, Blank „Some link it to Odin“).
- **Bez čísel stránek** (owner: „odstranit čísla stránky“). **Bez glyfu ᚠ pod jménem a v textu** — „stačí velký kámen runy“.
- **Řádek `svět · živel · áttr`** (např. „Midgard · Air · Freya's Aett“) ZŮSTÁVÁ (jednou jsem ho omylem vyřadil, owner to opravil). Zdroj: `world`, `elements`, `aett` v `runar-runes.js`.
- **Patička:** malé zlaté „The Rune Keeper“ a pod ním větší zlaté „RÚNAR“ (jako úvodní stránka appky, jen zlatě).
- **Obálka:** Rúnar z hlavní stránky appky, ne ikona. **Úvodní karta:** věta „Rúnar carries the light and points to where you might look. The seeing is yours.“ + citát „The runes do not predict your fate. They remind you of the path you already walk.“ (ownerovo: místo původní věty „Here the stones speak…“).
- Kameny: `RUNE_SVGS` beze změny; v tiskové verzi jen přebarvení (výplň kamene bílá, zlatá → #15171c).
- Písma: lokální Cinzel + Cormorant Garamond z `v2/fonts/` (žádné Google Fonts — DECISIONS 2026-10-10 (32)).

## Velikosti — doporučení (z mé obecné znalosti, NEověřeno zdrojem)

Oracle karty bývají kolem 70 × 120 mm nebo 63 × 100 mm; tarot kolem 70 × 120; poker 63 × 88. Owner: „víc verzí, všechny ke stažení, hlavně abychom si mohli nechat vytisknout profesionální verzi“. Proto 65 × 100 a 70 × 120. Tiskárna bude chtít **spadávku (3 mm)** — v PDF ZATÍM NENÍ, přidá se až pro konkrétní tiskárnu. Tmavá verze na domácí tiskárně = hodně toneru a nerovnoměrné pozadí; uživatelům je rozumná hlavně tisková.

## Otevřené (rozhodnutí / čeká)

1. **Zadní strana: vazebná runa AGNDOFA.** V repu NENÍ (hledáno: sigil, bind, logo, agndofa; jediné nalezené je `sigil-lab/` na PC mimo připojené složky a DECISIONS říká „Sigil NENÍ součást Rúnara“). Owner soubor dodá. Rozhodnout s jménem „Agndofa“, nebo bez; ukážu obojí.
2. **Název**: pracovní „Rúnar's Book of Stones“ (nevybrán; alternativy „The Rune Keeper's Stones“, „Rúnar's Rune Guide“, IS „Rúnabók Rúnars“ — neověřené).
3. **Citát je na obálce (je ve fotce) i na úvodní kartě** — owner ještě neřekl, odkud ho vyhodit.
4. **Kvalita fotky na obálce:** oříznutý screenshot (1079 × 1189 px; na 65 mm ≈ 420 dpi). Původní obrázek appky je v Supabase `runar-images/Runar_portrait.png` (`v2/runar-reader.html`); `v2/runar-portrait.png` v repu je výřez na bílém pozadí a vypadá jinak. Stáhnutí originálu je downloadování — čeká na ownerovo ano.
5. **Tisková obálka:** fotka v šedi jako tmavý obdélník na bílé — tvrdé; případně jiné řešení.
6. **IS verze** karet (EN první). IS text, který napíšu, je první neověřený návrh; CODE ověří `is-vazba.py` / `is-grammar-qa.py` (z Cowork shellu nedostupné — egress 403) a rune jména z `is_n` (např. „Þurs (Hlið)“).
7. **24 EN textů owner dosud neposoudil** (kromě Fehu) — tón se může měnit. Texty NEJSOU součástí appky; nic z nich zatím nejde do `runar-translations.js`.
8. Zda tyto texty později použít i uvnitř appky jako statický význam pro Visitora — viz HANDOFF66 v3 (odstavec o Visitorovi); tam rozhodnout, ne tady.

## Co od CODE (nic z toho není hotové ani naléhavé)

- Vědět, že složka `Claude outputs/rune-cards/` existuje, a **nemazat ji**; zapsat do `RUNAR_DECISIONS.md` záznam podle odstavce níže.
- Až owner rozhodne o zadní straně a názvu: rozhodnout, kam v repu soubory patří a zda do `v2/assets/README.md` (tabulka designových podkladů).
- Případně ověřit IS znění.

## Návrh záznamu do RUNAR_DECISIONS.md (CODE-tune zapíše; já do repa nepíšu)

> **2026-10-18 (KUKY, Cowork) — Stažitelný průvodce run („Rúnar's Book of Stones“, pracovní název).** Statická krátká verze významu každé z 25 run
> (ne hlas Rúnara) jako karty ke stažení pro uživatele a tiskový podklad pro nás. Vzhled appky (tmavá + zlatá, `RUNE_SVGS`, Cinzel/Cormorant),
> jména run z `runar-runes.js`, klíčová slova z `k`, řádek svět · živel · áttr zůstává, bez čísel stránek a bez glyfů. Dvě velikosti: 65 × 100 a
> 70 × 120 mm; každá tmavá a tisková (černá na bílé). Zadní strana: vazebná runa AGNDOFA (dodá owner). Soubory: `Claude outputs/rune-cards/`.
> Otevřeno: název, zadní strana, IS, spadávka pro tiskárnu, zdroj originální fotky Rúnara. **Affected doc(s):** `v2/assets/README.md` (až soubory přejdou do repa).

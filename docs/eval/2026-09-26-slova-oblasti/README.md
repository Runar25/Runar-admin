# Slova oblasti, mapa vět, esenční rámec [1], Ask u Kenaz — 2026-09-26 (CODE-read)

Handoff CODE-tune (psáno proti `f679170`). Nálezy a čísla vlastní `RUNAR_EVAL_LOG.md` 2026-09-26 (1); tady jen soubory.

| soubor | co |
|---|---|
| `stav.js` | produkční prompt single (sys + user) přes `vm`, vynutí obraz / úhel / podobu oblasti / esenci |
| `pilot_stitek.js` (+ `.jsonl`) | ramena A (produkce, podoba [2]) a B (bez „Career & “ v řádku oblasti), Opus 5 |
| `pilot_esence1.js` (+ `.jsonl`) | rameno C: totéž s esenčním rámcem [1] |
| `pilot_bezoblasti.js` (+ `.jsonl`) | rameno D: bez oblasti |
| `pilot_cinnost.js` (+ `.jsonl`) | rameno E: produkce + věta „činnost v obraze si drží vlastní slova“ |
| `souhrn.js` | „work“ po ramenech, pozice ve větách, cena |
| `pilot_ask.js` | Ask u Kenaz: F produkce × G s aspektem čtení (vstupy a odpovědi jen lokálně) |
| `pilot_esence_nova.js` (+ `.jsonl`) | esenční rámec [1]: produkce × nové znění (runa jmenovaná významem v obraze) |
| `slepe_esence.txt`, `slepe_klic.json`, `slepy_soudce_esence.txt` | slepé souzení esenčních vět (vstup, klíč, verdikty) |
| `pilot_esence_2.js`, `pilot_esence_4.js` (+ `.jsonl`) | znění N2, N3, N4 proti sponě „is that“ + Blank jako „the blank rune“ |
| `slepe_esence2.txt`, `slepe_klic2.json`, `slepy_soudce_esence2.txt` | slepé souzení N3 × N4 |
| `pilot_is.js`, `pilot_is2.js` (+ `.jsonl`) | islandština: esence produkce × N3, úhel [0] produkce × dvě přepsaná znění (pilot_is BEZ korekcí — viz EVAL_LOG (5)) |
| `mereni.js`, `vety3.js`, `mapa.js` | měření na ownerových čteních z DB (export jen lokálně) |

**Ownerova data do repa nejdou:** export čtení, text Kenaz čtení s jeho otázkou a odpovědi Asku leží v
`C:\Users\zkuku\runar-eval\oblast\`.

⚠️ **Harness musí načíst `runar-translations.js`** (pořadí config → runes → translations → character → utils).
Bez něj `_runeQuestion` vrátí prázdno a prompt tiše přijde o otázku runy v posledním pokynu (od v4.53, 2026-09-24).
Starší skripty v `docs/eval/2026-09-22-modely/skripty/` translations nenačítají. Před 2026-09-24 to nevadilo,
pro nové měření je nepoužívej bez opravy.

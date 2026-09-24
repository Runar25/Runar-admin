# Otázka runy jako skrytý podklad poslední věty — pilot 2026-09-24

Rozhodnutí a důvod → `RUNAR_DECISIONS.md` 2026-09-24 (16). Tady jen data, aby šel pokus zopakovat.

- **Model:** `claude-opus-5`, `thinking: disabled`, systém jako pole s `cache_control` (tvar claude-proxy).
- **Prompt:** produkční `buildReadingPrompt` přes `vm`, seedovaný `Math.random` — obě ramena mají týž obraz, úhel
  i tvar konce; liší se jen věta za pokynem konce. Otázka = `UI_TEXT[lang].coll_rune[runa][3]` za dvojtečkou.
- **Případy:** Algiz · Isa · Thurisaz · Uruz · Gebo · Laguz (oblast a rejstřík v `CASE` ve skriptu).

| soubor | co |
|---|---|
| `otazka_runy_pilot.js` / `.json` | EN, bez otázky (arm 0) a s první verzí rámce (arm 1) |
| `otazka_runy_pilot_is.js` / `.json` | IS, totéž |
| `otazka_runy_pilot_is2.js` / `.json` | IS, jen rameno s finálním rámcem („…en segðu hana með þínum eigin orðum") |
| `otazka_runy_pilot_en2.js` / `.json` | EN, jen rameno s finálním rámcem („…but say it in your own words") |
| `slepi_soudce.txt` · `slepi_soudce_is.txt` | přesně to, co viděl slepý soudce (subagent, bez kontextu) |

**Klíč pořadí** (kde stojí verze s otázkou): EN — Algiz 1 · Isa 2 · Thurisaz 2 · Uruz 1 · Gebo 2 · Laguz 1;
IS — Algiz 2 · Isa 1 · Thurisaz 2 · Uruz 2 · Gebo 1 · Laguz 1.

**Výsledek soudce („který konec nese otázku runy víc"):** verze s otázkou 6/6 EN, 6/6 IS.
**Doslovný opis z otázky (nejdelší společný úsek ≥ 4 slov):** EN první rámec 0/6, finální 0/6 · IS první rámec 3/6
(Isa 9, Laguz 7, Gebo 4), finální 1/6 (Laguz 7: „áður en þú átt orð yfir það").

**Hranice:** n = 6 na jazyk, jeden los na runu, soudce zná otázku (měří tedy přesně „nese konec otázku", ne „je čtení
lepší"), žádné čtení s vlastní otázkou tazatele ani s životní runou. Tvrzení o člověku soudce našel v obou ramenech
zhruba stejně (EN s otázkou 3, bez 2) — pochází z oblasti, ne z otázky.

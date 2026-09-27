# Vegvísir — test scény ramene (2026-09-27, CODE-read)

Výsledek a hranice vlastní `RUNAR_EVAL_LOG.md` 2026-09-27 (1). Tady jen soubory.

| soubor | co |
|---|---|
| `scena.js` | prompt ramene (testovací konstrukce, Vegvísir v kódu není) + volání Opus 5 jako claude-proxy; `node scena.js --ukaz` vypíše prompt |
| `scena.jsonl` | 16 textů (Q1–Q4 × Isa · Jera · Perth · Raidho) |
| `slepe.txt`, `slepe_klic.json`, `slepy_soudce.txt` | slepé souzení (vstup, klíč, verdikty) |
| `cesta.js` (+ `.jsonl`), `slepe_cesta.txt`, `slepe_cesta_klic.json`, `slepy_soudce_cesta.txt` | cesta vlastními slovy: se středem (C) × bez středu (B) → EVAL_LOG 2026-09-27 (2) |
| `cesta_is.js`, `cesta_is2.js` (+ `.jsonl`), `slepe_is*.txt`, `slepe_is*_klic.json`, `slepy_soudce_is.txt` | cesta bez středu, IS kolo 1 a 2 + EN bez slova „arm“ → EVAL_LOG 2026-09-27 (3) |

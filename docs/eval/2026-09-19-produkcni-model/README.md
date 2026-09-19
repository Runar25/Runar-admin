# Testy na PRODUKČNÍM modelu (claude-opus-4-8 přes API) — CODE-read 2026-09-19

Owner 2026-09-19 schválil API s produkčním modelem pro testy podezřelých (testovací pisatel Claude Opus 5 produkční vady
nereprodukoval). Nález a čísla vlastní `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_EVAL_LOG.md` (záznam 2026-09-19 (4)).

- `api_raidho.json` — Raidho `de1e3b16`: RA (produkční prompt) ×3, RB (bez „or offering a plain choice") ×3; prompty
  `RA.txt`/`RB.txt` v `C:\Users\zkuku\Downloads\Runar-admin\docs\eval\2026-09-19-podezreli\`.
- `api_ask.json` — Ask nad Isa `df160bfb`: ASK0 (dnešní pravidla) ×3, ASKN (+ věta o možnostech) ×3; `api_askn2.json` +
  `ASKN2.txt` — věta o možnostech BEZ „and leave the choice with them" ×3.
- `kontrola_srozumitelnosti.json` — slepý soudce nad 12 produkčními čteními ownera (6 pochválených, 6 s „nerozumím").
- `raidho-jadra/` — Raidho: 3 krátká jádra × místa pastevecké skupiny, produkce v4.28, ostatní losy jako v produkci
  (`manifest.json`), plné prompty + `api.json`.
- `skripty/api_gen.js` — generátor: volá jako claude-proxy (model, max_tokens 700 / Ask 320, system s cache, bez teploty);
  klíč z `~/.claude/runar-api-key.txt` (mimo repo). `sada2.js` čte export z DB, který v repu NENÍ.

# Úkol E — tvar definiční věty „<Runa> names <význam>“ (CODE-read, 2026-10-06)

Handoff CODE-tune proti `8d25148`. Výsledky vlastní `RUNAR_EVAL_LOG.md` 2026-10-06 (1).

| soubor | co |
|---|---|
| `test_sol.js` (+ `test_sol.jsonl`, `test_sol_kolo2.jsonl`) | sol přes API, produkční cesta (builder + věta pro sol + ✦ + připomínka délky), 10 ramen × 4 runy × 2 |
| `rozbor_sol.js` (+ `*_rozbor.json`) | sloveso po jménu runy, holé slovo aspektu, opis fráze, délka, cena; půlka × půlka |
| `mereni_db.js` | podíl vzorce v ownerových EN single čteních z DB — podle tvaru aspektu, modelu, rámce, runy, verze promptu; útok půlka × půlka |

Ownerova čtení jen lokálně: `C:\Users\zkuku\runar-eval\oblast\moje2.json` (export DB, 193 EN single čtení s `prompt_draws.kws`).

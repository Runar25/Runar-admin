# Raidho po KROKU 1 úklidu promptu (v4.26-uklid) — CODE-read 2026-09-18

Nález a čísla vlastní `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_EVAL_LOG.md` (záznam 2026-09-18 „Po úklidu KROK 1").
Tady jsou jen podklady.

- `CTENI-v426.txt` — plný prompt (systém + zpráva ke čtení) po úklidu, losy ownerova produkčního čtení Raidho
  (`readings e2e82087…`: úhel 6, konec open2, obraz mohyly, aspekt *the road*, jméno uprostřed), bez čočky životní runy.
- `CTENI-v425.txt` — tentýž prompt ve verzi před úklidem; **bajt po bajtu shodný** s `prompty-t15/T1-L.txt`
  v `C:\Users\zkuku\Downloads\Runar-admin\docs\eval\2026-09-15-kratke-obrazy-esence\` (tam jsou i dnešní texty T1-L a T16).
- `ASK-rozlouceni-*.txt`, `ASK-proMe-*.txt` — Ask nad ownerovým PRODUKČNÍM textem čtení (ne nad novým), aby se měnil
  jen Ask prompt; otázky *„Thank you, Rúnar."* a *„What does it mean for me?"*; v4.25 i v4.26.
- `texty.json` — 3 čtení po úklidu (U1–U3) + 4 odpovědi Ask. Pisatelé = slepí subagenti (Claude Opus 5), každý četl
  jen jeden soubor, v zadání *„You do not know today's date or the season."*
- `skripty/uklid_build.js` — stavba promptů produkčními buildery (`vm`); verze v4.25 = soubory
  z `git show 0fdd246:v2/<soubor>` ve složce `v425/` vedle skriptu. `skripty/mer.js` — počty (čte `texty.json`
  ze své složky; při spuštění z archivu upravit cestu).

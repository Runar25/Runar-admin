# Rozpory v promptu čtení — vstup a surové nálezy (2026-09-18)

`docs/eval/2026-09-18-konflikty-promptu/vstup.md` = přesně to, co dostává model u produkčního Single EN (dvě varianty user message, všechny losované pooly)
a u Asku, postaveno produkčními buildery skriptem `docs/eval/2026-09-18-konflikty-promptu/konflikty_vstup.js`. `docs/eval/2026-09-18-konflikty-promptu/nalezy-a-overeni.json` = 75 tvrzení tří
hledačů + verdikt skeptického ověřovatele ke každému. Vyhodnocení → `RUNAR_EVAL_LOG.md` 2026-09-18.

**Mapa pokynů (2026-09-18):** `docs/eval/2026-09-18-konflikty-promptu/vety-promptu.md` = 156 očíslovaných vět promptu (skript `docs/eval/2026-09-18-konflikty-promptu/vety_promptu.js`); dva nezávislí
kodéři přiřadili každou větu k části čtení, kterou řídí; `docs/eval/2026-09-18-konflikty-promptu/mapa-pokynu.txt` = sloučení (`docs/eval/2026-09-18-konflikty-promptu/mapa_merge.js`) — shoda aspoň
v jedné části 156/156, v druhu věty 153/156.

# 2026-08-18 — kde jsme skončili (session CODE-tree)
# Rozdělaná práce k tomuto dni. NENÍ to popis stavu — ten vlastní produkce, `git log`
# a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Kůra kmene v crown-composeru.** Čtyři pokusy, tři vrácené nebo omezené; podrobně
i s čísly v `RUNAR_TREE.md` §8. Skončilo to novým **WebGL režimem** (třetí tlačítko
v REŽIM) — a KUKYho verdiktem: *„vypadá to zajímavě, i když spíš jako palma."*

⭐ **Tím se těžiště přesunulo od povrchu ke tvaru.** Kůra už není hlavní problém;
hlavní je silueta. Palma má změřenou příčinu v kostře, ne v kresbě.

## Další krok (v tomhle pořadí)

1. **Silueta před povrchem.** Dokud strom vypadá jako palma, je jedno, jakou má kůru.
2. **Kůra pak nejlevněji:** normal mapa v už existujícím WebGL režimu — per-fragment
   stínování i UV tam jsou, je to změna shaderu, ne nová vrstva.
3. Voronoi/šupiny jako **jeden pokus**, ne jako plán.

## Co viselo, když jsme končili

- **Handoff pro Cowork-tree odeslán** (silueta, slepé uličky, otázky významu).
  Cowork vrátil rešerši technik; dal jsem k ní kritiku — jeho hlavní diagnóza
  („selhalo to na rozlišení") **neplatí**, vada byla v ose UV a ve švech po segmentech.
  Čeká se na art-direction studii jasanu, kterou si `RUNAR_TREE_RENDER.md` §35 sám žádá.
- **Oprava hooku není hotová.** `SessionStart` si při každém compactu přepíše marker
  (`: > $MARK`), takže Stop hook zapomene, co session změnila — doloženo měřením
  (marker 16:46 → 19:46) a tím, že za 592 markerů **nikdy nikoho nezastavil**.
  Druhá vada: fallback testuje jen `[ -n "$CTX" ]`, takže helper vracející neplatný
  JSON projde dál. Obojí je návrh, ne změna — zápis do hook skriptu čeká na ownera.
- **Crown composer není v gitu** (`v2/tree-lab-crown-composer/`), takže na webu není
  a jiná session ho nevidí. Rozhodnout, jestli se má publikovat.

## Návyk, který se v téhle session vyplatil

Každý „nález" nejdřív **změřit produkční cestou**, teprve pak tvrdit. Několikrát to
otočilo závěr o 180°: sonda mimo kmen, klipování o okraj plátna, dlaždice s obrácenou
polaritou, „přeskupují se větve" (data byla stabilní, skákal jen nově přidaný pramen).
Metriku je přitom potřeba obhájit dřív než výsledek — víc mých prvních metrik měřilo
něco jiného, než jsem myslel.

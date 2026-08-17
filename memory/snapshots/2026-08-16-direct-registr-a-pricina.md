# 2026-08-16 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Audit systémového promptu BLOK PO BLOKU** — owner: „od první instrukce, ne lovit
jednotlivosti uvnitř". 13 bloků, 663 slov EN. Výpis: `buildSysPrompt(null,'en')`.

Hotovo: **[1]–[5]** identita (záznam 15. 8., nesahat) · **[7]** změřen (23 % promptu,
hypotéza o opisování PADLA) · **[8]** `journey` byl zakázaný dvakrát a pokaždé jinak →
opraveno · **[9]** vyhozeno tvrzení principu, zůstalo chování · **[10]** rozhodnuto
a zapsáno u kódu, že věta o tvaru zůstává (nenosná, ale levná pojistka) a druhá osoba
NENÍ duplikát (`base.grammar` je podmíněný).

**Zbývá: [11] LANGUAGE & STYLE (95 slov) · [12] THE VOICE + THE IMAGE (104) ·
[13] TWO THINGS THAT NEVER CHANGE (57).**

## Čeká na ownera

- **Kotva v páteři** — commit `254fa8a`, vrácení `git revert 254fa8a`.
- **Cowork handoff „Variantové balíčky"** — owner ho probírá s Coworkem. Moje kritika:
  princip správný, ale staví A/B nad kusy bez jednoho zdroje — „nejmenuj runy" je
  **osm ručně psaných vět** (`runar-character.js` 1331·1348·1429·1442·1497·1510·1574·1591).
  Nejdřív z osmi kopií jedna cesta přes `_profileRule`, pak teprve varianta.
- **Výběr registru pro JEDNO čtení dnes NEJDE** — `activeVoice` je globální pro dávku
  (`runar-character.js:604`). Spec přitom chce `direct` u ~20 % a povinně u EN a krátkých.

## Dvě pasti, na které jsem dnes opakovaně šlápl

1. **Vzor psaný podle domněnky, ne podle dat.** Třikrát falešný nález — islandský
   detektor, obrazy s výkladem, tvar výstupu. **Vypsat data, pak psát vzor.**
2. **Patch přes bash heredoc požírá escapování.** Jednou zapsal do regexu v `check-docs.py`
   doslovný backspace (0x08) místo `\b`; hlídač nesedl nikdy a ve výpisu vypadal správně.
   **Patche psát do souboru (`scripts/_patch_tune.py`)**, hlídač vždy rozbít podstrčením vady.

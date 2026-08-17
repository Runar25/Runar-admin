# 2026-08-16 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Audit systémového promptu BLOK PO BLOKU** — owner: „od první instrukce, ne lovit
jednotlivosti uvnitř". 13 bloků, 669 slov. Výpis: `buildSysPrompt(null,'en')`.

Hotovo: [1]–[5] identita (datovaný záznam 15. 8., nesahat) · [8] `journey` opraven ·
[4] kotva přesunuta do páteře · [7] změřen (23 % promptu, hypotéza o opisování PADLA).
**Další na řadě je [9] YOUR STANCE** — je v něm věta „What it means is theirs to decide",
kterou jsem tam vložil 16. 8. ráno a owner ji označil za chybu: je to pravidlo PRO NÁS
při stavbě, ne pokyn modelu. **Ještě tam je.**
Pak [10] RESPONSE FORMAT, [11] LANGUAGE & STYLE, [12] THE IMAGE, [13] TWO THINGS.

## Čeká na ownera

- **Kotva v páteři** — commit `254fa8a`, vrácení `git revert 254fa8a`. Text se nezměnil,
  jen místo. Owner řekl, že rozhodne, až uvidí výsledek; výsledek viděl.
- **Cowork handoff „Variantové balíčky"** — owner ho jde probrat s Coworkem. Moje kritika:
  princip (balíček místo kostky) je správný, ale staví A/B nad kusy, které nemají jeden
  zdroj — „nejmenuj runy" je **osm ručně psaných vět** (4 spready × 2 řeči, `runar-character.js`
  1331·1348·1429·1442·1497·1510·1574·1591). Nejdřív z osmi kopií udělat jednu cestu přes
  `_profileRule`, teprve pak nad ní variantu. A `VOICE_PROFILES.direct.rules` UŽ JE ten
  mechanismus, co navrhuje — chybí mu jen dosah.
- **Výběr registru pro JEDNO čtení dnes NEJDE** — `activeVoice` je globální pro dávku
  (`runar-character.js:604`), produkce volá `buildSysPrompt(activeChar, lang)` bez klíče.
  Spec přitom chce `direct` u ~20 % čtení a povinně u EN a krátkých.

## Past, na kterou jsem dnes třikrát šlápl

**Patch přes bash heredoc požírá escapování.** Jednou zapsal do regexu v `check-docs.py`
DOSLOVNÝ backspace (0x08) místo `\b` — hlídač pak nesedl nikdy a ve výpisu vypadal správně,
protože terminál backspace skryje. **Patche psát do souboru (`scripts/_patch_tune.py`)**,
a hotový hlídač vždy rozbít podstrčením vady.

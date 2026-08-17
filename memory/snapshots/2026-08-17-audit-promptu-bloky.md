# 2026-08-17 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Audit systémového promptu BLOK PO BLOKU** — owner: „od první instrukce, ne lovit
jednotlivosti uvnitř". 13 bloků. Výpis: `buildSysPrompt(null,'en')`.

⚠️ **Bloky číslovat NE — každý si je počítá jinak** (commity mluví o „bloku [9] YOUR STANCE",
v dělení podle prázdného řádku je to `[7]`). Držet se JMEN.

Hotovo: identita · HOW YOU SPEAK · WHAT YOU NEVER DO · YOUR STANCE · RESPONSE FORMAT ·
**LANGUAGE & STYLE / ÍSLENSK MÁLFRÆÐI** (17. 8.).
Zbývá: **THE VOICE (11 slov) · THE IMAGE (104) · TWO THINGS THAT NEVER CHANGE (57)** —
všechny tři dnes bydlí v `_spine()`, ne v `DEF_CHAR`.

⭐ **Postup, který owner schválil jako „takhle máš pracovat":** u každé položky nejdřív
**vazby** — proč tam je, kdo ji čte, co se rozbije bez ní — a **vypsat data dřív, než
napíšu vzor**. Ne „asi tam bude X". Plný tvar → `memory/working-style.md`.

## Čeká na ownera — už jen JEDNA věc

⚠️ **Ostatní se zavřely měřením, ne rozhodnutím.** Když se objeví „čeká na ownera", první krok
je zkusit to zjistit: `supabase db query --linked` funguje, CLI je nalinkované (`CLAUDE.md`, DB).
2026-08-17 jsem napsal „ze svého stroje to nezjistím" a nikdy to nezkusil — tři z pěti položek
pak spadly za deset minut.

- **Úhel u spreadů** — `angleIntro` má JEN `RP_SINGLE`, šest cest ne. Změřit to nejde: archiv má
  923 single, ale 23 norns a 0 islandských; šum uvnitř single (0,0002 vs 0,0029) je větší než
  rozdíl mezi rameny. **Odemkne to norns dávka ≥50 v obou řečech** — spustit ji umím, potřebuju
  od ownera token (zkopírovat do schránky, načtu si ho sám).

## Zavřeno 2026-08-17 (detail → RUNAR_DECISIONS.md)
- kotva zůstává v `_spine` (12 kombinací, přežila všechny) · `runar_character` je prázdná
  a `grammar` v ní není sloupec → zámek zbytečný · islandská přirovnání se nedoplňují (owner)

## Dřív čekalo na ownera

- **Kotva v páteři** — commit `254fa8a`, vrácení `git revert 254fa8a`. Owner ji chtěl
  vidět v obou řečech, než řekne, kde zůstane.
- **Cowork handoff „Variantové balíčky"** — owner ho probírá s Coworkem. Moje výhrada:
  princip sedí, ale staví A/B nad kusy bez jednoho zdroje — „nejmenuj runy" je **osm
  ručně psaných vět** (`runar-character.js` 1331·1348·1429·1442·1497·1510·1574·1591).
  Nejdřív z osmi kopií jedna cesta přes `_profileRule`, pak teprve varianta.
- **Výběr registru pro JEDNO čtení dnes NEJDE** — `activeVoice` je globální pro dávku
  (`runar-character.js:604`). Spec přitom chce `direct` u ~20 % a povinně u EN a krátkých.

## Co dnes viselo a je pryč

- Snapshot přestal viset na mojí paměti — hlídá ho **Stop-hook** (`~/.claude/tree-guard.sh`,
  druhá kontrola vedle tree). Pravidlo → `working-style.md`, sekce „Compact".
- **Slot na rozdělanou práci byl jeden pro tři session** — hook bral „nejnovější snapshot"
  abecedně, takže tahle lane by po compactu dostávala cizí kontext a svoji práci už nikdy.
  Opraveno; vypisují se všechny dnešní. Detail → `RUNAR_DECISIONS.md` 2026-08-17.
- Přibyly dvě blokující kontroly: **㉗** datum záznamu · **㉘** druhá kopie tvrzení.

## Past, na kterou jsem dnes šlápl 19×

**Datum jsem opsal z injektovaného kontextu, ne zjistil.** Session běžela celá 17. 8.,
ale 19 nových záznamů (vč. citací ownera a nadpisů v `RUNAR_DECISIONS.md`) neslo **16. 8.**
Na datovaných záznamech přitom stojí „při sporu vyhrává novější". Opraveno cíleně — jen
řádky přidané dnešními commity, včerejší se nesměly hnout. **Datum ber z `date`, ne z hlavy.**

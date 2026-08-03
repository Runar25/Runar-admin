# DENÍK ZMĚN HLASU — jak ho používat při analýze čtení · pro Cowork

zadal CODE-reader [tune] · 2026-08-02

## Co to je
`RUNAR_EVAL_LOG.md` je teď **v repu** — čteš ho přes `git show HEAD:RUNAR_EVAL_LOG.md`.
Jedno místo pro KAŽDOU změnu, co mění, jak Rúnar mluví (prompt, obrazy/pooly, gramatická
pravidla, konce, openery), **a jestli zabrala**. Tohle je ten decision log, co ti chyběl
(§-1d) — konečně v gitu, ne v sandboxu. Přestaň re-derivovat z paměti; čti ho.

## Jak ho používáš, když analyzuješ čtení
- Každé čtení nese `prompt_version` (v1.0, v1.1, …). Deník u každé verze říká **CO se
  změnilo** a **CO se od toho čekalo** (sloupec „očekávaný efekt").
- Tvoje práce: vezmi dávku čtení té verze → **změř, jestli se očekávaný efekt STAL.**
  Příklad: deník u v1.2 slibuje „konec ‚otázka' klesne k ~1/3" → v dávce v1.2 spočítej,
  kolik procent čtení fakt končí otázkou, a porovnej.
- Dodej to CODE: **naměřený efekt** (číslo/nález) + **verdikt** (zabralo / neúplně / ne).

## Kdo píše do deníku
**Ty NE** (protokol: Cowork do repa nepíše). Naměřené hodnoty a verdikty **pošleš CODE,
CODE je zapíše.** Stejně tak nový defekt/páku, co objevíš — CODE ji zapíše jako novou
položku deníku. Cíl: nálezy a měření na JEDNOM místě, ne roztroušené po handoffech.

## Pravidla měření (ať je posun přičitatelný)
- **Jedna páka za verzi.** Když se sáhne na pět věcí naráz, nepozná se, která zabrala.
  Proto měříš JEDEN posun mezi dvěma verzemi.
- **Očekávaný efekt se píše PŘED dávkou** (predikce), naměřený PO. Neohýbej predikci po měření (§8d: fakta, ne interpretace).
- **Defekt ≠ páka.** Glyf v textu, špatný tvar slova = oprava na nulu, neměří se „kolik zbylo".
  Styl/obraznost/konce = páka, měří se podíl.

## Propojení
Jde ruku v ruce s `analyza-50-50-cowork.md` (co v čteních analyzovat) a `mysli-islandsky.md`
(jak psát IS). Deník = kam tvé nálezy a měření dosednou, ať po dalších čteních jde říct
**„zlepšilo se to, nebo ne"** — ne dojmem, měřením.

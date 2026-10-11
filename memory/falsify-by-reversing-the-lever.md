---
name: falsify-by-reversing-the-lever
description: "Než přidáš obsah pro potvrzení hypotézy, hni pákou na OPAČNOU stranu — obrácená předpověď musí platit, jinak hypotéza padla"
metadata:
  type: feedback
---

Když máš hypotézu tvaru **„X je málo, přidej X"**, netestuj ji přidáváním. Přidat obsah stojí
hodiny psaní a ověřování. **Uber X ještě víc** a zkontroluj, jestli se to podle hypotézy zhorší.
Když se nestane nic — nebo to jde opačným směrem — hypotéza padla za cenu jedné dávky.

**Doloženo 2026-08-14** (IS prompt „opisuje, protože zhubl“ — zkrácení místo dolévání) → čísla v CLAUDE.md §25 a
`RUNAR_DECISIONS.md` 2026-08-14. (Do 2026-10-11 stála i tady, potřetí, a s prohozeným srovnáním systémových promptů.)

**Proč to funguje:** hypotéza „přidej" má vždycky slabou verzi („přidal jsem málo") a dá se
donekonečna dolévat. Obrácená předpověď žádnou takovou únikovou cestu nemá — buď platí, nebo ne.

**Jak to použít:**
1. Napiš si předpověď obou směrů dřív, než něco změříš. Když nedokážeš říct, co by hypotézu
   vyvrátilo, není to hypotéza, je to dojem.
2. Jeď levnější směr — skoro vždycky je to **ubrat**, ne přidat.
3. Vyvrácení zapiš stejně pečlivě jako potvrzení (`RUNAR_DECISIONS.md` + `RUNAR_EVAL_LOG.md`),
   jinak to za tři týdny zkusí někdo podruhé.
4. Vždy uveď **hranici**: co bylo vyloučeno (velikost řezu, `n`) a co se netvrdí. „17% řez s tím
   měřitelně nehne" není totéž co „délka je bez vlivu".

Souvisí: [[measure-dont-eyeball]] · [[sanity-check-measurements]] · [[prompt-directive-makes-model-copy]].
Pravidlo pro všechny session: `CLAUDE.md` §25.

---
name: falsify-by-reversing-the-lever
description: "Než přidáš obsah pro potvrzení hypotézy, hni pákou na OPAČNOU stranu — obrácená předpověď musí platit, jinak hypotéza padla"
metadata:
  type: feedback
---

Když máš hypotézu tvaru **„X je málo, přidej X"**, netestuj ji přidáváním. Přidat obsah stojí
hodiny psaní a ověřování. **Uber X ještě víc** a zkontroluj, jestli se to podle hypotézy zhorší.
Když se nestane nic — nebo to jde opačným směrem — hypotéza padla za cenu jedné dávky.

**Doloženo (2026-08-14, Rúnar, IS).** Hypotéza: islandský prompt opisuje vložený obraz doslova,
protože zhubl → *vrátit mu hmotu*. Napsat islandský obsah = hodiny. Místo toho jsem prompt zkrátil
o dalších 509 znaků (−17 %): doslovné opsání **32 % → 24 %**, Fisher **p = 0,75**, tedy nic —
a navíc opačným směrem, než hypotéza čekala. Přitáhl to druhý test: EN má skoro stejně dlouhý
čtecí prompt (321 vs 307 slov) a **kratší** systémový (781 vs 681), přesto opisuje 9 % proti 32 %.

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

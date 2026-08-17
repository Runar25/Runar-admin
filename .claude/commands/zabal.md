---
description: Zabalit session — dostat rozdělanou práci do snapshotu dřív, než přijde compact
---

Owner napsal `/zabal`. Znamená to: **session je dlouhá, zabal ji, ať compact nic nezahodí.**

Udělej přesně tohle a nic navíc:

1. **Přepiš nejnovější soubor v `memory/snapshots/`** (nebo založ dnešní, pokud dnešní není).
   Nese **jen rozdělanou práci**: uprostřed čeho jsme byli · další krok · co viselo nedořešené.
   ⚠️ Co má vlastníka jinde, tam NEPATŘÍ — rozhodnutí do `RUNAR_DECISIONS.md`, otevřené úkoly
   do `RUNAR_BACKLOG.md`, měření do `RUNAR_EVAL_LOG.md`. Snapshot, který je opisuje, je
   „shrnutí všeho" a `CLAUDE.md` §20 ho zakazuje. Drž ho pod 40 řádky — víc hook nevypíše.

2. **Aktualizuj `memory/MEMORY.md`**, pokud snapshot přibyl (jeden řádek v indexu).

3. **Commitni a pushni** (`[docsync]`, pathspec na ty soubory).

4. **Řekni jednou větou, že je zabaleno** a že může napsat **holé `/compact`**.

Pak skonči. Žádné shrnutí session, žádné návrhy, co dál.

⚠️ **ŽÁDNÁ `/compact Zachovej: …` řádka k zkopírování.** Do 2026-08-17 tu byla jako krok 4
a KUKY na ni řekl: *„tohle mi dáváš k čemu?"* Měl pravdu — **nemá konzumenta.** Všechno, co
nesla, už leží v commitnutém snapshotu a hook to po compactu vypíše sám; owner by ji navíc
musel držet v hlavě do okamžiku, který nikdo netrefí. Druhá kopie téhož přes kanál, který
nefunguje = §20. Vlastníkem tohohle zákazu je `memory/working-style.md`, sekce „Compact".

**Proč to existuje:** `autoCompactEnabled` je na defaultu a automatický compact přijde bez
ohlášení — instruovat ho nejde (ověřeno v dokumentaci). Jediné, co funguje bez ohledu na to,
kdo compact spustil, je **snapshot v gitu + hook**. `/zabal` proto dělá jedinou věc: dostane
rozdělanou práci do snapshotu dřív, než compact přijde. `SessionStart` hook
(`~/.claude/runar-context.py`) ho po compactu vypíše sám, takže i když se automatický spustí <!-- doc-links:ok 2026-08-16 hook je uzivatelsky soubor mimo repo, do gitu nepatri -->
první, rozdělaná práce se neztratí. 
---
description: Zabalit session — přepsat snapshot rozdělané práce a vypsat /compact řádku
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

4. **Vypiš `/compact` řádku** ke zkopírování, v tomhle tvaru:
   `/compact Zachovej: <na čem děláme> · <co jsme zjistili> · <další krok> · <co mi NESMÍŠ navrhnout znovu>`

Pak skonči. Žádné shrnutí session, žádné návrhy, co dál.

**Proč to existuje:** `autoCompactEnabled` je na defaultu a automatický compact přijde bez
ohlášení — instruovat ho nejde (ověřeno v dokumentaci). Účinek má jen ruční `/compact` spuštěný
dřív, a ten potřebuje řádku po ruce. Snapshot je druhá polovina drátu: `SessionStart` hook
(`~/.claude/runar-context.py`) ho po compactu vypíše sám, takže i když se automatický spustí <!-- doc-links:ok 2026-08-16 hook je uzivatelsky soubor mimo repo, do gitu nepatri -->
první, rozdělaná práce se neztratí. 
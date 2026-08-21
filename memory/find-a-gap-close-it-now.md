---
name: find-a-gap-close-it-now
description: Najdeš díru (chybějící kontrolu, nedodržené pravidlo, vlastní amnézii) → zavři ji v TÉMŽE tahu, bez ptaní; souhlas na vylepšení vlastních kontrol a paměti nepotřebuješ
metadata:
  type: feedback
---

Když při práci narazíš na **mezeru** — pravidlo, které nikdo nehlídá · vlastní tvrzení, které
odporuje dřívějšímu měření · kontrolu, co hlídá jen půlku plochy — **oprav to hned, v tomtéž
tahu.** Neptej se na svolení. Na vylepšení vlastních kontrol, paměti a nástrojů máš stálý mandát.

**Why:** KUKY 2026-08-21, poté co jsem pět migrací pustil do produkce bez bumpu
`RUNAR_PROMPT_VERSION` a jen to omluvně ohlásil: *„jak to že jsi to nedodržel, kde je kontrola
co tohle hlídá! co uděláš když najdeš mezeru? potřebuješ můj souhlas na to abys vylepšil svoji
kontrolu, paměť či cokoliv co ti pomůže zůstat v obraze? máš za úkol se zlepšovat každým krokem…
co se řeší hned je malé, když se na to vyseřeš, tak to naroste do obřích rozměrů."*

**How to apply:**
- **Netvoř nové pravidlo, dokud neověříš, že už neexistuje.** Většinou existuje a jen ho nic
  nevynucuje — pak je oprava *kontrola*, ne další věta do docu.
- **Pravidlo, které musí hlídat člověk, dřív nebo později spadne.** Udělej z něj kontrolu ve
  smoke — a otestuj ji proti VŠEM stavům, ne jen dobrému a špatnému → [[guard-test-the-lifecycle]].
- **Inventura se nedělá na požádání, vynucuje se.** Když kontrola hlídá jen část plochy, je to
  tiché zelené a je to horší než žádná kontrola.
- **Amnézie je taky díra.** Když zjistíš, že tvrdíš něco, co jsi sám dřív změřil jinak, oprava
  není omluva — je to místo, kde se ten nález dá najít příště. Vzor: rejstřík pák
  v `RUNAR_EVAL_LOG.md` (2026-08-21) a pravidlo *než o páce něco tvrdím, přečtu si její řádek*.

Souvisí: [[break-your-own-work-before-reporting]] · [[fix-or-log-duplicates-and-errors]] ·
[[a-guard-that-refuses-is-a-detector]] · [[measure-dont-eyeball]].

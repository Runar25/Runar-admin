---
name: work-efficiently-ask-if-simpler
description: Pracuj efektivně — než něco spustíš, zeptej se sám sebe, jestli to nejde udělat líp/levněji; nenasazuj těžký nástroj na lehký úkol
metadata:
  node_type: memory
  type: feedback
---

**KUKY 2026-08-20:** *„to jsi trochu přehnal ne? spálit milion tokenů jen na to abys vytvořil
jednoduchou mapu? jsi blázen? další pravidlo pro tebe! pracuj efektivně! vždy se ptej sám sebe
jestli to nejde udělat lépe!"*

Než spustíš nástroj (workflow, dávku agentů, generování, velký eval), **polož si otázku: nejde to
udělat jednodušeji?** Poměr úsilí k úkolu musí sedět. Deset agentů na úkol „nakresli mapu z toho,
co už mám přečtené" je špatná odpověď, i když ta analýza sama je kvalitní.

**Why:** cena není jen tokeny. Dlouhý běh **protlačí session compactem** — a po compactu zmizí
všechno, co existovalo jen v chatu. Přesně proto owner tu mapu chtěl: aby znalost přežila.
Nafouknutý postup tedy **zabíjí právě ten úkol, kvůli kterému běží**. Doloženo 2026-08-20:
workflow o 10 agentech (~1,5 M tokenů) místo jedné mapy → compact → ztráta kontextu.

**How to apply:**
1. **Nejdřív udělej to malé.** Máš-li podklady přečtené, napiš výsledek. Nespouštěj rešerši na to,
   co už víš.
2. **Těžký nástroj až když lehký prokazatelně nestačí** — a řekni proč.
3. **Hotový úkol dodej DŘÍV, než přijde ownerova kontrola.** Owner: *„moje kontrola přijde vždy
   později, než když ty dodělaš úkol a aktualizuješ co je potřeba."* Dodělat a zapsat je součást
   úkolu, ne krok navíc.
4. Souvisí: [[function-not-ceremony]] (nestavět proces pro uspokojení) ·
   [[write-for-owner-not-process]] · [[proceed-dont-ask]].

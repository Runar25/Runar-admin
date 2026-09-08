---
name: prompt-nepojmenuj-co-hned-zakazes
description: Prompt, který něco pojmenuje a hned to zakáže vyslovit, hlídá slovo, které tam sám napsal — odeber nálepku, hlídač pak nemá co hlídat
metadata:
  node_type: memory
  type: feedback
---

**Vzor vady:** prompt **pojmenuje** hodnotu („The seeker asks for **clarity** — ") a o pár slov
dřív nebo později **zakáže ji vyslovit** („do not name it back… let it colour the tone only").
Ten hlídač hlídá slovo, které tam napsal **týž prompt**. Platí se za obojí a jedno ruší druhé.

**Test, který to rozhodne — je to jméno k něčemu potřeba?**
- **Není** → smaž **nálepku**, ne přidávej hlídače. Hlídač pak nemá co hlídat a jde taky pryč.
- **Je** (model bez něj neví, o čem je řeč) → nálepka zůstává, ale **hlídač se musí změřit** —
  nepředpokládej, že něco dělá.

**Doloženo (2026-09-08, `seeking` / `_registerContext`, EN+IS, korpus `~/runar-eval/seeking.jsonl`,
4 runy × 5 registrů × 2 verze, týž seed):** blok **45 → 12 slov**; echo nálepky **0/20 v OBOU**
verzích, takže **hlídač nedržel nic**; tvar výstupu beze změny (64,0 → 63,5 slova, 341 → 335 znaků
= nula navíc na ElevenLabs); stopa obsahu instrukce ve čtení naopak o něco **silnější**
(+0,18 proti +0,11 slova na čtení). Rozhodnutí → `RUNAR_DECISIONS.md` 2026-09-08.

**Kde to v Rúnarovi ještě je (ověřeno čtením 2026-09-08):**
- **`_lensContext`** — vypíše jméno životní runy a pak *„Never name the life rune."* **Týž tvar,
  ale jméno je tam potřeba** → případ „změř hlídače", ne „smaž nálepku".
- **`_domainContext`** vypadá stejně, ale **není to vada**: AREA se projevit SMÍ, to je její práce.
  Nepleť „pojmenuje a zakáže" s „pojmenuje, protože to má být vidět".

**Dvě pasti, obě naběhly na živém případu:**
1. **Táž hodnota může být pojmenovaná víc než jednou a každý builder jinak.** Spready nesly
   `seeking` **dvakrát** (hlavička `Seeking: X` + nálepka uvnitř), single jednou. Odebrat jen
   jedno místo = spready zůstanou s nálepkou a **bez** hlídače, tedy hůř než předtím.
   Vždycky si postav prompt **všemi cestami** (§13) a spočítej výskyty, ne jen ten, který vidíš.
2. **Odebraná nálepka může osiřet určitý člen.** Věty typu „describe the ground beneath **the
   decision**" měly antecedent v té nálepce. Po odebrání se opírají o otázku uživatele — a když
   žádná není, model si to může domyslet (= studené čtení). Po každém takovém řezu **projdi věty
   na `the …`, které nemá v promptu antecedent.**

Je to táž rodina jako [[oprava-promptu-odebira-vadu]] (opravuj odebráním) a
[[prompt-directive-makes-model-copy]] (rozhoduje sloveso kolem vloženého textu), ale vlastní
diagnóza: **není to o tom, co přidáváš — je to o tom, že prompt sám sobě dodal materiál k opsání.**
Kontrolu, která tenhle druh zásahu nepustí bez přečtení, dělá smoke ㉜ (registr pravidel promptu) —
zapsat nové znění jde až po přezkoumání vedle zákazů, a přesně tak se past 2 našla.

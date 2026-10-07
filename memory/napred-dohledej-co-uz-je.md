---
name: napred-dohledej-co-uz-je
description: Než začneš měřit/analyzovat/zakládat položku — prohledej RUNAR_PRICING/DECISIONS/BACKLOG a git log ostatních lane za poslední dny; paralelní session to často už udělaly
metadata:
  type: feedback
---

KUKY 2026-09-24: *„hodně kroků opakuješ, přitom už byly jednou udělané. Špatně si ověřuješ, co už máme hotové. Jak to?"*

**Co se stalo (za jeden den):** spočítal jsem „přesnou cenu čtení" — `RUNAR_PRICING.md` ji měl od včera (CODE-tune, 70 čtení);
založil jsem backlog položky o solu a o cache — obě už existovaly (sol od 2026-09-23, cache v PRICING); napsal jsem nástroj
`cena_cteni.js`, když `stats.js` byl přesně to místo; handoff na úhel [4] už byl nasazený; owner se ptal „nezapomněli jsme na  <!-- doc-links:ok 2026-09-24 cena_cteni.js byl smazán, zmínka je záměrně historická (doplnil CODE-tune, blokovalo smoke ⑯) -->
něco?" a CODE-tune to hodinu předtím sepsal (`7719e62`). Příčina: pracoval jsem z paměti téhle konverzace, ne z repa — a
repo mezitím měnily dvě další session.

**How to apply:** Před měřením, novou položkou, novým nástrojem nebo odpovědí „co zbývá": (1) `git log --since=<2 dny> --oneline`
všech lane; (2) grep tématu v `RUNAR_PRICING.md`, `RUNAR_DECISIONS.md`, `RUNAR_BACKLOG.md`, `scripts/`; (3) teprve pak dělej —
a jen to, co tam chybí. CLAUDE.md to říká („Před prací si přečti git log druhé lane"); tohle je připomínka, že to platí i
uprostřed dlouhé session, ne jen na začátku. Souvisí [[parallel-code-sessions-collision]], [[fix-or-log-duplicates-and-errors]].

⛔ **Než navrhneš pokus přes API: napřed data, která už máme** (KUKY 2026-10-07: *„já ti teď řekl zkus tohle, což bylo prakticky
zadarmo, ale ty za nějakou dobu stejně budeš hledat pokus někde jinde na API, i když ho máš přímo pod nosem“*). Navrhl jsem 18 volání
na otázku „opisuje sol otázku runy?“ — 264 uložených čtení (produkce + laby) ji zodpovědělo zadarmo a přesněji (visí na tvaru konce).
Podruhé stejná výtka (poprvé 2026-08-16, archiv dávek). **How to apply:** `node scripts/utils/najdi_cteni.js` s filtry té otázky
(model, runa, `--text`, `--draws`) — produkce, záloha pokusů, `~/runar-eval`, `eval_out/`, `docs/eval/` najednou. Pokus přes API až
když data odpověď nemají, a do zprávy napiš, co v datech bylo. Výstupy pokusů se zálohují samy (Stop-hook → `scripts/utils/zaloha_cteni.js`).

⛔ **Než ownerovi něco nahlásíš nebo navrhneš: `node scripts/utils/uz_vime.js <pojmy>`** (2026-10-07). První průchod auditu nahlásil jako
nové vady věci opravené 25. 9.–6. 10., větu, kterou owner označil za ne-vadu, a znovu navrhl „podobu oblasti jen jednou“ zamítnutou 3. 10.
KUKY: *„jak to, že nevíš, co jsme už dělali?“* Od teď hlídá stroj (CLAUDE.md §30): API bez `RUNAR_API_ANO` neprojde, zpráva s návrhem
bez `scripts/utils/uz_vime.js` v tahu taky ne.

⛔ **Doklad ownerovi jen z čtení pod dnešním promptem** (2026-10-07). Čtení z pokusu 22. 9. jsem uvedl jako doklad, jak sol končí bez
otázky runy. KUKY: *„příklad z 22. 9. je tak starý, že to nezmíním.“* Prompt se mezitím změnil mnohokrát. **How to apply:** jako doklad
ber čtení z posledních dní / posledních verzí promptu (`najdi_cteni.js` ukazuje verzi a datum). Starší jen výjimečně a s výslovnou
poznámkou proč — a když aktuální data nestačí, řekni to ownerovi a domluvte se.

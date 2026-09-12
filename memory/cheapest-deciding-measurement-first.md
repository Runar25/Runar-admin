---
name: cheapest-deciding-measurement-first
description: "Nez pustis drahe mereni (agenti, davky, workflow), udelej to NEJLEVNEJSI, ktere rozhodne, jestli ma smysl merit dal — a rekni dopredu, co ktery vysledek zpusobi."
metadata:
  node_type: memory
  type: feedback
---

Než spustíš drahé měření (agenti, dávky, workflow), udělej **to nejlevnější měření, které
rozhodne, jestli má smysl měřit dál**. A než ho spustíš, řekni jednou větou: *co udělám, když
vyjde tak, a co, když vyjde onak.* Nedá-li se ta věta napsat, ten pokus nic nerozhoduje.

**Why:** KUKY 2026-09-12: *„není lepší udělat základní měření tak, abys věděl, jestli to má cenu
testovat dál pomocí agentů, než mi totálně spálit tokeny? … nemá tohle být naprosto logické?
napřed otestuju a zjistím, jestli je to správný směr."*

Doloženo na vlastní chybě z téhož dne. Zadání znělo „které další aspekty dělají problémy proti
produkčním čtením". Pustil jsem workflow: 8 agentů na klasifikaci všech 64 aspektů, 35 agentů na
produkční čtení, další na adversariální ověřování — a **teprve z těch dat** vyšlo, že vada je
v produkci 3× z 35 a **dvě ze tří jsou jedna jediná runa**. Přitom to rozhodující číslo bylo
**zadarmo**: jeden dotaz do DB (`prompt_draws.kws`) a lokální sečtení. Po něm by bylo vidět, že
klasifikovat všech 64 aspektů nemá co objevit. Owner to musel zastavit uprostřed.

**How to apply:**
1. **Nejdřív to, co už leží.** Produkční data, git, existující export, jeden grep. Nula agentů.
2. **Napiš predikci a její cenu:** „když vyjde X, dělám A; když Y, končím." Nemáš-li druhou
   větev, neplatíš za měření, ale za rituál ([[function-not-ceremony]]).
3. **Teprve pak škáluj** — a jen na tu část, kterou levné měření neuzavřelo.
4. **Padne-li hypotéza cestou, ZASTAV zbytek dávky.** Doběhnout ji „ať jsou kompletní čísla" je
   placení za obhajobu metriky, kterou právě vyvrátila produkce ([[attack-the-metric-not-just-the-result]]).

5. **Pilot 3–5 agentů → ukázat → teprve se souhlasem ownera škálovat.**

⛔ **Velký počet agentů = napřed se ZEPTAT ownera** (KUKY 2026-09-12, podruhé týž den): *„příště se
zeptáš, pokud budeš chtít použít nesmyslný počet agentů! Napřed máš zkusit pár, abys vůbec zjistil,
že hypotéza sedí. Až pak se dá přidat víc."* Doloženo: 48 pisatelů + soudci (~2M tokenů) na test,
jehož výsledek byl vidět na prvních pár textech — a který navíc nikdo nechtěl
([[rekni-kterou-variantu-testujes]], bod 5). ⚠️ Platí i při zapnutém ultracode.

Souvisí: [[work-efficiently-ask-if-simpler]] (ptej se, jestli to nejde jednodušeji — tohle je jeho
tvrdší verze: *napřed levné, které rozhodne*), [[falsify-by-reversing-the-lever]],
[[measure-dont-eyeball]], [[sanity-check-measurements]].

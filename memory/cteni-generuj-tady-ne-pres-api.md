---
name: cteni-generuj-tady-ne-pres-api
description: Čtení pro testy piš SÁM v konverzaci, ne přes Anthropic API z node skriptu; slepé souzení dělej subagentem, ne API
metadata:
  node_type: memory
  type: feedback
---

**KUKY 2026-09-10: „přestaň používat API pro čtení. Udělej to tady! Pro příště!!"**

Testovací čtení se **negenerují voláním Anthropic API** z node harnessu. Prompt se postaví
produkční cestou (to zůstává — `buildReadingPrompt` a spol. přes `vm`, seedovaný `Math.random`),
ale **text čtení napíšeš sám v konverzaci**. Žádný `fetch` na `api.anthropic.com`, žádné
`runar-api-key.txt` kvůli čtením.

**Co z harnessu ZŮSTÁVÁ a proč:** postavit prompt produkční cestou je pořád nutné (§19 — kontrola
běží na té ploše, kde bug žije). Skript tedy dál skládá prompty, ukládá korpus a počítá metriky;
jen ten krok mezi „prompt" a „text" dělám já, ne API.

⚠️ **Jedna věc se tím rozbije a musí se řešit jinak: SLEPÉ SOUZENÍ.** Identitní soudce má vidět
JEN maskovaný text a rejstřík run. V téhle konverzaci ale vidím i zadání, aspekt a správnou
odpověď — soudil bych sám sebe s odpovědí na stole. **Slepé souzení proto dělej SUBAGENTEM**
(Agent tool), který dostane výhradně maskovaný text + seznam run a nic z kontextu. Bez toho
číslo neplatí (§27 — nástroj se obhájí dřív než výsledek).

**Praktický důsledek:** velké mřížky (150 čtení × 3 hlasy) přestávají být zadarmo — píšu je já.
Návrh testu proto musí být **menší a cílenější**: míň cel, jasná predikce předem, a raději
jedna ostrá otázka než mřížka „co kdyby". To je spíš zlepšení než ztráta — API svádělo k
generování dávek, které se pak stejně vyhodnocovaly jen zběžně.

Souvisí: [[measure-dont-eyeball]] · [[attack-the-metric-not-just-the-result]] ·
[[work-efficiently-ask-if-simpler]] · [[runar-api-key-file]] (klíč zůstává pro jiné použití,
ne pro generování čtení).

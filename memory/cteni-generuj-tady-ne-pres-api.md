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

⚠️ **Pisatel-subagent zná DATUM, produkční model ne** (nalezeno 2026-09-14/16): pisatelé sami psali *autumn, browning
heather, yellow birch leaf, September night* — prompt nic z toho nenese. Owner se na tyhle výrazy opakovaně ptal. **Do zadání
pisatele vždy: „You do not know today's date or the season."** Jinak test měří artefakt, ne Rúnara.

⭐ **VÝJIMKA (KUKY 2026-09-19: „ano"): testy PODEZŘELÝCH vstupů jedou na PRODUKČNÍM modelu přes API** (`claude-opus-4-8`,
klíč `~/.claude/runar-api-key.txt`, generátor `docs/eval/2026-09-19-produkcni-model/skripty/api_gen.js` volá jako claude-proxy).
Důvod: subagent Claude Opus 5 produkční vady nereprodukoval (Raidho volba 0/3 vs produkce 4/4; Ask tvrzení 0/3 vs 3/3) —
test podezřelého s ním nic nerozhodne. Obecné pokusy o tvar/obsah dál můžou jet na subagentech; hon na produkční vadu ne.

⭐ **VÝJIMKA 2 (KUKY 2026-09-22: *„máš přístup na GPT API… udělej jedno stejné čtení pro všechny, měříme tokeny, kolik
nás to stojí"*): SROVNÁNÍ MODELŮ jede přes API** — chování a cenu cizího modelu (gpt-6-sol, Opus 5, Opus 4.8) subagent
nenapodobí. Platí i pro testy promptu, které mají ukázat, jak se ten který model zachová (várky 2026-09-23 k větě za
obrazem). Vždy **napřed malý pilot**, owner schvaluje velikost várky; skripty v `docs/eval/2026-09-22-modely/skripty/`.

Souvisí: [[measure-dont-eyeball]] · [[attack-the-metric-not-just-the-result]] ·
[[work-efficiently-ask-if-simpler]] · [[runar-api-key-file]] (klíč zůstává pro jiné použití,
ne pro generování čtení).

---
name: sanity-check-measurements
description: Extrémně čistý výsledek měření (0/N, 100 %) je RED FLAG — ověř samotné měření protipříkladem, ne fragile bash-inline, než ho ohlásíš jako nález
metadata:
  type: feedback
---

Nástroj/skript může měřit **tiše špatně** a vrátit sebejistě znějící nesmysl.
2026-08-08: nahlásil jsem ownerovi „naming 0/25, pravidlo drží" — reálně **24/25**.
Příčina: rozbité escapování regexu v `node -e` uvnitř bash (`\b` se přes bash+node
zmršilo → nematchlo NIC → falešná nula). Ještě jsem na tom číslu stavěl závěr a při
doplňující otázce ownera ho zopakoval. Cowork to chytil protipříkladem („Fehu answering Fehu").

**Proč:** „změř, nehádej" ([[measure-dont-eyeball]]) NESTAČÍ — když je měření buggy,
dojem vystřídá **falešná jistota z čísla**, což je horší, protože číslu se věří. Extrémní /
moc čistý výsledek je nejčastěji chyba měření, ne realita.

**Jak to aplikovat — vždy, když ohlašuješ naměřený nález:**
1. **Extrém = podezření.** 0/N nebo N/N napřed OVĚŘ, teprve pak ohlaš.
2. **Protipříklad.** Najdi jeden konkrétní vzorek, který by výsledku odporoval (když prompt
   jméno runy SÁM dodává, „0 pojmenování" je nesmysl — mělo mě to praštit).
3. **Žádná fragile logika v shellu.** Regex/měření piš do `.js`/`.py` souboru, ne do
   `node -e "…"` přes bash — escapování se tiše rozbije. Souvisí [[read-the-check-before-push]], [[bash-no-cd-prefix]].
4. **Když tě někdo opraví číslem, PŘEMĚŘ načisto** dřív, než se hádáš nebo trváš na svém.

**Druhý způsob, jak měření mlčí: metrika už JE na podlaze.** 2026-08-14 jsem navrhl
screening ablation v islandštině — jenže „otevřeno definicí" i „þegar" tam byly v baseline
**0 %**. Ty dvě metriky nemohly ukázat nic, ať páka dělá cokoli. Screenuj tam, kde má metrika
PROSTOR (tytéž metriky měly v EN 28 % a 32 %). Nulový výsledek z podlahy není nález.

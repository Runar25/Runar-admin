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

**Proč:** „změř, nehádej" (CLAUDE.md §24) NESTAČÍ — když je měření buggy,
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

**Sloučeno 2026-11-25 z test-the-lever-that-binds a jeden-vzorek-neni-vada.**
**Třetí způsob, jak měření mlčí: páka se nedotkla vazby.** 2026-09-06 (TEST ASK2): zvedl jsem `max_tokens` 140 → 300, ale v promptu
zůstalo „no more than about 40 words“ — model poslechl prompt, cela proběhla naprázdno. Než pustíš test páky, vytiskni sestavený prompt
a najdi v něm vazbu, která výsledek opravdu drží (grep na číslo, „words“, „short“); měň JI. Strop tokenů je pojistka proti useknutí,
ne délková páka. (Táž věc pro kontroly: CLAUDE.md §19.3.)
**Jeden vzorek není vada** (owner 2026-11-14: *„proč na základě jednoho čtení řešíš ‚may‘?“*). Slovo nebo obrat z jednoho vygenerovaného
textu nevydávej za vadu a nenavrhuj kvůli němu větu do promptu; v komentáři ke vzorkům piš o směru a obsahu. Opakuje-li se napříč vzorky,
změř ho, než ho nazveš vadou.

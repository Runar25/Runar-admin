---
name: attack-the-metric-not-just-the-result
description: "Než uvěříš číslu, zaútoč na nástroj: půlka proti půlce · co ještě odlišuje referenční dvojici · nulová transformace na slepou skvrnu"
metadata:
  type: feedback
---

Změřit nestačí ([[measure-dont-eyeball]]). **Nástroj se musí obhájit dřív než výsledek.**
Tři útoky, každý doložený tím, co chytil 2026-08-14 při stavbě metriky „stejnosti" čtení:

**1. Půlka proti půlce (nejsilnější, zabíjí nejvíc).** Rozděl JEDNU dávku na dvě poloviny
a spočítej metriku zvlášť. Liší-li se půlky víc než dvě dávky, které srovnáváš, je celý
rozdíl šum. Ze tří navržených metrik tady padly **dvě**: šum mezi půlkami 3,9–4,8 bodu
proti signálu 1,7 bodu. Bez tohohle testu bych obě přijal — obě totiž „zlatým standardem"
prošly.

**2. Co JEŠTĚ odlišuje referenční dvojici.** Zlatý standard sám může ukazovat obráceně.
Srovnával jsem dávku se zapnutými pákami proti dávce s vypnutými a čekal, že vypnuté budou
stejnější. **Šest ze sedmi** samozřejmých signálů ukázalo opačně — protože v zapnuté dávce
nemeřily stejnost, ale **papouškování** vloženého obrazu (pool nasypal 3 obrazy na 10 čtení).
Po odečtení obrazu rozdíl zmizel. Referenční dvojice se nelišila jen tím, co jsem měřil.

**3. Nulová transformace na slepou skvrnu.** Chceš vědět, co metrika NEVIDÍ? Pusť na data
změnu, která hýbe **jen tou jednou dimenzí**. Zamíchal jsem slova uvnitř každého čtení —
rytmus a stavba pryč, slovník beze změny. Číslo se pohnulo **přesně o 0,0000**. Tím je
slepota dokázaná, ne odhadnutá, a dá se napsat do dokumentace jako fakt.

**Co z toho plyne obecně:** metrika, která projde jen tím testem, kvůli kterému vznikla,
není ověřená — je vybraná. Útoky pouštěj **než** výsledek použiješ k rozhodnutí.

**Vedlejší, ale drahé:** bootstrap s opakováním u párových metrik **lže** — duplikované
čtení si metrika přečte jako shodu 1,0. Pro jednu dávku vyšel bodový odhad 11,7 % a CI
13,5–31,4 %, tedy odhad **mimo vlastní interval**. Používej jackknife.

Souvisí: [[sanity-check-measurements]] · [[falsify-by-reversing-the-lever]] · [[guard-test-the-lifecycle]].
Pravidlo pro všechny session: `CLAUDE.md` §27.

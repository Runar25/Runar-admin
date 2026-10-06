# Sloveso definiční věty podle anglických textů o runách (sol) — 2026-10-06, CODE-tune

**Zadání (KUKY 2026-10-06, k v4.99):** *„fehu exposes wealth? … co na to říká angličtina? … je to správná kombinace slov pro
pojmenování runy? … něco si myslet nebo vymyslet je hodně slabý! Pokud to nevíš, tak si to zjisti!“*
v4.99 dala solu do esenčního rámce *„in a verb of your own“* a sol pak psal *„Fehu marks…“*, *„… exposes …“*, *„Hagalaz
interrupts…“*. Ohlásil jsem to jako zlepšení (nejčastější sloveso 6/24 místo *names* 16/24) **bez ověření, jestli tak angličtina
o runách vůbec mluví.** Tohle je to ověření.

## 1. Korpus: co stojí v anglických textech o runách hned za jménem runy
49 textů staženo 2026-10-06 (`korpus_run.js`): Wikipedie (24 článků o runách, *Rune poem*, *Elder Futhark*; Jera a Perthro  <!-- check-docs:ok 2026-10-06 „Perthro“ je název článku na Wikipedii, ze kterého se stahovalo, ne jméno runy v kódu -->
prázdné) + 23 webů s výklady run (další 2 odmítly přístup, 403). Stažený text je cizí obsah — do repa nepatří, ukládá se mimo
něj. Počítá `slovesa_run.js`: 1 150 výskytů „jméno runy (nebo *this/the rune*) + další slovo“.

| za jménem runy | výskytů | textů | |
|---|---|---|---|
| *is the …* (z toho *is the rune of …* 5) | 39 | 21 | |
| *is a …* (*a symbol of*, *a sign of* …) | 21 | 12 | |
| *represents* | 21 | 12 | |
| *embodies* | 12 | 9 | |
| *means* (+ *can / may mean* 3) | 11 | 5 | z losu vyřazeno, viz 2 |
| *symbolizes* | 8 | 5 | |
| *signifies* | 6 | 4 | |
| *stands for* (+ po *can / may* 2) | 2 | 2 | |
| *carries* | 5 | 3 | |
| *is about* · *is associated / linked / connected* | 5 · 6 | | |
| *indicates* · *suggests* | 7 · 9 | 6 · 5 | věštecké (*„… indicates impending wealth“*) — Rúnar nepředpovídá |
| *teaches* · *reminds* · *warns* · *encourages* · *asks* | 9 · 8 · 6 · 5 · 4 | | rada / pokyn — Rúnar neradí |
| **slovesa solu po v4.99:** *holds* | 3 | 3 | jen *„holds potential / energy“* |
| *marks* · *exposes* · *interrupts* · *counts* · *gathers* · *rests* · *speaks of* | **0** | 0 | |
| *names* jako sloveso | **0** | | 6× je to *„rune names“* (jména run) |

Google Books Ngram (anglické knihy 1950–2019) je na runy moc řídký: nad prahem korpusu jsou jen *„this / the rune is“*,
*„this / the rune represents“* a *„this rune means“*; *„the rune names / marks“* tam jsou jen jako podstatná jména (jména run,
runové značky). Ostatní slovesa 0.

**Závěr:** slovesa, která sol psal od v4.99, angličtina pro význam runy nepoužívá. Doložené jsou *is the rune of / is a …*,
*represents*, *embodies*, *means*, *symbolizes*, *signifies*, *stands for*.
**Hranice:** korpus je převážně moderní výkladová literatura (weby) a Wikipedie — tedy jak se o runách v angličtině dnes píše,
ne literární rejstřík obecně. Dva zdroje převažují (Fehu a Hagalaz mají víc stránek).

## 2. Test na solu: rámec začíná „<Runa> <sloveso>“ se slovesem z korpusu (API, 56 čtení, $0,20)
Harness = `../2026-10-06-sloveso-sol/test_sloveso.js` (produkční cesta, `READ_ENGINE = 'sol'`), mění se jen esenční rámec:
místo *„brings the rune in once and, in a verb of your own,“* stojí *„begins "Hagalaz represents" and …“*. 4 runy (Hagalaz,
Fehu, Wunjo, Uruz) × 7 sloves × 2 rámce (`test_korpus.js`, `rozbor_korpus.js`).

| | výsledek |
|---|---|
| vylosované sloveso hned za jménem runy | **56/56** (oba rámce 28/28, každé sloveso 8/8) |
| *means* ve smyslu „znamená, že“ | 2/8 (*„Hagalaz means disruption can stop…“*, *„Wunjo means belonging can be…“*) → vyřazeno |
| délka | 61,3 slova (rámec v4.99: 59,4) |
| holé slovo významu v textu | 55/56 — definiční věta ho jmenuje (v4.99: 10/12 a 4/12) |

Ukázky definičních vět: *„Fehu represents wealth that grows when it is tended and shared.“* · *„Wunjo is the rune of
belonging without having to explain yourself.“* · *„Uruz stands for strength already present, even before anyone sees it at
work.“* · *„Hagalaz signifies disruption that stops what usually runs without notice.“*

## 3. Nasazeno (v5.01)
`ESSENCE_VERBS_SOL` (6 sloves: *represents, embodies, symbolizes, signifies, stands for, is the rune of*) + rámce pro sol jako
šablony `{R} {V}` (`v2/runar-utils.js`); `_promptDraws` zapisuje `verb`. Opus a islandština beze změny.
**Netvrdí se:** že je definiční věta tímhle hotová. Sloveso je teď správné, zbytek věty (co za ním následuje) se nehodnotil
soudci, jen čtením. Islandská slovesa (*merkir, táknar, stendur fyrir …*) se ověří zvlášť korpusem Risamálheild.

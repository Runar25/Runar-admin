# V3 lab, krok 25 — řádek hranice bez slova „picture“ (8 čtení Gebo, Opus 5.5) + srovnání skladby vět v3 × v2

2026-10-27, CODE-read. Owner: „15. ok“. Jediná změna proti kroku 24: hranice „where it stops holding — what is left out of it, or what it
costs — said of what happens in it“ (dřív „where the picture stops holding … said of the picture“). Losy tytéž jako kroky 23–24.

| # | krok 24 | krok 25 |
|---|---|---|
| 1 | You lend your neighbour your only ladder on the Saturday you meant to clean your own gutters. What you hand over leaves a gap in your own week, and the gap ties the two houses together. But a ladder comes back, and some lending never does. Which things do you keep lending without checking what you still need? | Your neighbour asks for the ladder on the Saturday you meant to clear your gutters, and you carry it over. Gebo lives in that walk, a pull between keeping and handing over. It holds until the ladder stays away a week and the giving starts keeping count. When you hand something over, what do you usually wait for? |
| 2 | Pour water into one of two jars joined by a pipe at the bottom, and it runs across until both stand level. Gebo works like that pipe: what one side gives flows across until neither stands higher. But water cannot choose, and silt travels the pipe too. Which way is the water running between you and another? | Pour water into one of two linked jars, and the other rises to meet it. Gebo works that way: what passes between two keeps moving until both stand level. If the pipe between them clogs, one stays full and the other dry. Which jar is yours, and what keeps the pipe between you open? |
| 3 | Gebo is the gift that ties giver and taker, so neither walks away unchanged. You run beside a child's bike, holding the seat until your lungs burn, then let go. The picture leaves out that the child may ride off and never look back. What did you gain in the running that holding on would never have given? | Gebo is the bond that forms when something passes from one person to another. You kneel in the hallway showing a child how to tie a lace, again and again, while your coffee goes cold. Once she ties it alone, she runs off, and nothing comes back to you. What might someone still learn from your hands? |
| 4 | Gebo is the tie that forms when a gift is answered, binding two people to each other. A cold stone laid against a warm one draws heat until both rest equally warm. But the stones only even out and go still; the warm one never chose to give. When both stones are warm, whose warmth is it? | Gebo is a gift that becomes a bond between giver and taker. One candle tips its flame to a cold wick, and now two burn, the first no smaller. But the wick must lean in close to catch, and both still burn down. Whose flame are you carrying, and does it ask anything back? |
| 5 | You stand at the station past the hour, letting trains leave without you. The evening you spend on someone not yet here becomes a thing you hand over unasked. But the wait can harden into a debt you keep and read aloud later. How long can you carry that hour before it weighs more than the meeting? | You stand at the station, the train long gone, still waiting for the friend who said ten minutes. The waiting becomes your time handed over, a gift with no wrapping. It holds until the cold reaches your feet and you start counting what you are owed. How long can you stand there before it stops being given? |
| 6 | Two people carry a long ladder, and when one slows, the other must slow too. Gebo is that shared weight: it joins those who each hold one end. But the ladder moves only at the slower pace, and neither can set it down alone. When you carry something with someone, whose step do you usually follow? | Two people carry a long table down a narrow stair, each end lifting as much as the other. Gebo is that shared weight: a bond that holds because both hands give into it at once. When one end goes slack, the other takes the whole load, and the table tips. Which end do you usually find yourself holding? |
| 7 | Gebo is a bond made by giving, each side held by what passed between them. You take one end of a friend's sofa down three flights of stairs, your back aching and your Saturday gone. The picture ends at the van; it leaves out the owing that follows you both home. Who holds the other end for you? | Gebo is a gift that binds: what passes between two hands leaves a thread. A neighbour sees you hauling a sofa upstairs, takes the other end, and walks backwards on a sore knee. When only one side ever lifts, the thread becomes a weight one carries alone. Who took the other end for you, and what still ties you? |
| 8 | Gebo is the pull between giving and owing back. A cut branch is bound into a split tree, and over summers the bark closes until no seam shows. But the graft cannot come apart without a wound, and the old tree feeds what was never its own. What might grow where you let yourself be cut open? | Gebo is the pull between giving freely and being bound by what you take. A cut branch is bound into a split trunk, and by summer the two barks close into one tree. Once joined, neither can pull away without tearing the other. What could grow where you let another take hold? |

## Výsledek (n = 8)
- Slovo „picture“ ve čtení: 2/8 → **0/8**. Hranice začíná „But…“: 5/8 → **1/8**; začátky teď různé („If the pipe…“, „Once she ties…“,
  „When one end goes slack…“), jen „It holds until…“ 2× — ozvěna slov „stops holding“ ze zadání.
- Délka 52–59 slov (7/8 v 50–58).
- Trvá: situační obraz přidává čas jako cenu („on the Saturday you meant to clear your gutters“, „while your coffee goes cold“).

## Proč „Saturday“ (owner: model tam cpe sobotu; ve v2 se to už řešilo)
Situační řádek obrazu říká „…that costs the one who does it something“ — model cenu zviditelní časem (sobota, vystydlá káva, deset minut).
Ve v2 se totéž dělo jinak: model k obrazu přimalovával okolí, které v obrazu nebylo; opravil to úhel „Open with one quick glance at the
whole image, then let everything fall away but one“ (`READING_ANGLES[0]`, 2026-09-23: 1. věta 25,0 → 20,9 slova, kratší 9/12 párů) —
a hlavně ve v2 obraz nevymýšlí model, ale bere ho z ownerem prošlé banky `RUNE_IMAGES`. Návrh pro v3: cenu z řádku obrazu vyndat (patří
do hranice) a vzít z v2 úhel „let everything fall away but one“.

## Skladba vět v3 × v2
| | v2 (produkce) | v3 (kroky 23–25) |
|---|---|---|
| odkud je obraz | z banky `RUNE_IMAGES` (ownerem prošlé, s místem z losu) | vymyslí model z losu typu (fyzický/situační) a druhu |
| jak obraz začne | 7 úhlů `READING_ANGLES` (nejmenší detail, pohyb, okraj, co je mimo dohled…) | bez úhlu |
| esence | vždy 2. věta; rámec + sloveso z korpusu („{R} {V}“) | pořadí losem; s obrazem napřed vyjde z obrazu (bez šablony), s jádrem napřed „Gebo is…“ |
| 3. věta | nepředepsaná (v praxi pokračování obrazu; SMĚNA/STOPA jen jako kvalita) | předepsaná hranice: co obraz vynechá nebo stojí |
| konec | most: 5 tvarů (věta „may be“ · dvě možnosti · otázka · napětí · návrat k otázce), kam dosedne určí AREA, tvar SEEKING | jen otázka (zrcadlení), směr losem |
| vstupy od člověka | AREA, SEEKING, INTENTION, jméno, otázka | zatím žádné (AREA později) |
| ochrana čtenáře | NO COLD READING + tvrzení jen v mostu jako „may be“ | zatím jen definice v3 |
| délka | 50–58 slov | 50–58 slov |
Shrnutí: v3 mění hlavně **zdroj obrazu** (model místo banky) a **roli 3. a 4. věty** (hranice + otázka místo volné věty + mostu).
Esence a délka jsou blízko v2; vstupy od člověka, úhly a ochrany v2 zatím ve v3 chybí — kandidáti na převzetí.

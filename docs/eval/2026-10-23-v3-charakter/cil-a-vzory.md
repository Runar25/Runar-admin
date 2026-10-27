# V3 lab — k čemu míříme: cíl čtení a vzorové věty (měřítko pro lab, ne text do promptu)

2026-10-26, CODE-read. Owner: „jeho čtení má v uživateli vyvolat … pocit, že to k němu pasuje, že se v něm najde … to je náš cíl, proto to
děláme … potřebujeme najít i vzorové věty, ať víme, k čemu míříme.“
Tenhle soubor vlastní jen **sbírku vzorových vět s ownerovým verdiktem** pro lab v3. Cíl sám vlastní `RUNAR_DESIGN.md` „Co má čtení v člověku
vyvolat“ a „Rúnarův rejstřík — zrcadlo, ne orákulum“; znaky silného čtení memory `co-dela-cteni-silnym`; rešerši
`docs/findings/2026-08-15-wf_a188371f-db1.md` a DECISIONS 2026-08-14. Tady se neopisují.
⚠️ **Vzorové věty se do promptu NEDÁVAJÍ** — model hotovou větu opíše (memory `prompt-directive-makes-model-copy`; v3 krok 5: věta významu
opsána 7/8; DECISIONS 2026-08-23 „žádné vzorové věty do promptu“). Slouží jako měřítko pro nás a pro slepého soudce.

## Vzorové věty — ownerem uznané (✔) a odmítnuté (✘)

| # | věta | verdikt ownera | co na ní funguje / nefunguje | pozice ve 4 větách |
|---|---|---|---|---|
| 1 | A boy slides his last biscuit across the kitchen table to his sister, and no one asked. | ✔ 2026-10-24 „moc pěkný obraz, dotkne se hodně lidí; dítě dá něco dalšímu dítěti a nic za to nechce“ | známá situace z běžného života, dar svobodný, cena vidět („last“) | 1 obraz |
| 2 | The baker holds out a loaf she won't take coins for, and the boy's hands stay down. | ✘ 2026-10-24 „nic neříkající“ | role místo vztahu, nikdo se v tom nepozná | 1 obraz |
| 3 | Every spring she brings the neighbouring farmer her spare seedlings, every autumn he sharpens her scythe unasked. | ~ 2026-10-24 „může být zajímavé, ale naostřit kosu se moc lidí nedotkne“ | výměna je dobře, prostředí cizí většině lidí | 1 obraz |
| 4 | A child sets a stone beside her father's plate at supper, and walks off before he can thank her. | ✘ 2026-10-24 „ten kámen je nesmysl“ | dar bez srozumitelného smyslu | 1 obraz |
| 5 | Tiwaz is the choosing to finish one thing well and leave the rest unmade. | ✔ 2026-08-26 „přesně to, co bych rád viděl, čistě, člověk si z toho hned něco vezme“ | definiční věta runy + SMĚNA (druhá půlka ukáže cenu) | 2 význam |
| 6 | One ridge takes the wind's full weight, and the far side stays quiet in its lee. | ✔ 2026-09-20 slepý test 5/5 | SMĚNA: jedna strana platí, druhá z toho žije | 1–3 |
| 7 | … and the second cup waits for someone who may not come. | ✔ 2026-09-20 | STOPA: v obraze je vidět, co nepřišlo | 3 druhá strana |
| 8 | One stone holds in the sliding snow, and the path it marks is already gone under white. | ✔ 2026-09-20 (proti „the drift has been building … all afternoon“) | rozhoduje, že něco v obraze NENÍ | 3 druhá strana |
| 9 | Do you kneel at the quiet rim, or walk on toward the roar? | ✔ 2026-08 „člověk nad ní musí přemýšlet, to je dobré“ | otázka se dvěma skutečnými možnostmi, žádná označená za správnou | 4 konec |
| 10 | Can you leave room for what has not shown itself? | ✔ 2026-10-22 „úplně v pohodě“ | ano/ne otázka k zamyšlení, bez tvrzení o člověku | 4 konec |
| 11 | What strength is already in you? | ✔ 2026-10-16 „není na tom nic špatného“ | povzbuzení otázkou, ne tvrzení | 4 konec |
| 12 | You put down the knife and sit with your father, the soup left to simmer. | ✘ 2026-10-24 „zbytečně zavádějící“ | detail (nůž) táhne pozornost mimo dar | 1 obraz |

## Návrh celých vzorových čtení v3 (CODE-read 2026-10-27, NEschváleno — čeká na ownera)
Owner: „obrazy … by měly být víc metaforické; esence může být první i druhá; konce cca jako v2; zkus obraz jako metaforu runy podle vzoru Gemini“.
Obraz = známý fyzický děj jako metafora runy (Gemini) · esence = rámec v2 se slovesem z korpusu („is the rune of“, „stands for“) · věta 3 =
stín jako vnitřní cena principu (SMĚNA), o obrazu, ne o čtenáři · konec = tvar z v2 (`ENDING_OPEN`) nebo detail.
1. On a seesaw, one end rises only when the other comes down. Gebo is the rune of the gift that binds two people, each giving and each
   receiving. Neither can step off without dropping the other. This may be a bond that lifts you, or one that keeps you seated where you are.
2. Gebo stands for the gift that ties two people, given freely and taken freely. Two playing cards lean into each other and stand where
   neither could stand alone. Take one away, and the other falls with it. Is the weight between you shared, or does one side carry it?
3. Two people carry a sofa up the stairs, and at each turn the weight passes from one to the other. Gebo is the rune of exchange, of what
   moves between two and holds them together. The one in front sees the way; the one behind takes the weight. On the last step, someone
   has to let go first.

## Z materiálu GPT (2026-10-23) — NEschváleno ownerem, jen ilustrace rozdílu
- zrcadlo: „Voda se mezi nimi nezastavila. Předmět přešel z jedné ruky do druhé, ale proud pokračoval dál.“ × orákulum: „Tato runa ti říká,
  že musíš ve svých vztazích obnovit rovnováhu.“ × psychologický vykladač: „Možná dáváš příliš mnoho a bojíš se požádat o něco na oplátku.“
- obraz s možností rozpoznání: „Někdy se dar stává těžším právě ve chvíli, kdy ho přijmeme.“ × připsaný stav: „Bojíš se přijímat pomoc, protože
  máš pocit, že pak někomu něco dlužíš.“

## Co z toho plyne pro lab (shrnutí CODE-read, ne kánon)
1. „Najde se v tom“ nese hlavně věta 1: **známá situace z běžného života, kterou zažilo hodně lidí** (1 ✔ × 3, 4 ✘). Shoduje se s rešerší:
   konvenční obraz rozumí ~90 % lidí, nový 40 % nebo 10 %.
2. Rozpoznání ≠ pocit přesnosti. Pocit přesnosti dá i generický text (Forer 4,3/5) — proto se na něj nikdy neptáme; měřitelné je, jestli
   obraz nese runu, jestli je situace známá, jestli věta netvrdí nic o čtenáři.
3. Věta 3 (druhá strana) míří ven z obrazu — SMĚNA nebo STOPA (6, 7, 8). Věta 4 = otázka se skutečnou volbou nebo k zamyšlení (9, 10, 11).

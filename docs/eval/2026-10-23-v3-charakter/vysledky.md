# V3 lab, kolo 1 — výsledky (pilot, n = 3 na variantu, Opus 5.5 přes čerstvé agenty Explore)

Zadání a kritéria (stanovená předem): `varianty.md`. Slepý soudce: jeden agent, 9 zamíchaných textů bez variant
(pořadí 1=C2 2=B1 3=D3 4=C1 5=B3 6=D1 7=C3 8=B2 9=D2).

## Souhrn

| | rada | tvrzení o čtenáři | klišé | pojistka | věrnost Gebo | obraz posunut | řekne čtenáři něco |
|---|---|---|---|---|---|---|---|
| B holý | 3/3 | 3/3 | 3/3 (1 mírně) | 0/3 | 2,2,2 | 1/3 | jasně 3/3 |
| C odkud + jak mluví | 0/3 (1 hraniční) | 0/3 (1 hraniční) | 0/3 | 0/3 | 2,2,2 | 3/3 | jasně 1, trochu 2 |
| D holý + „mirror, not an oracle“ | 3/3 | 3/3 | 3/3 (2 mírně) | 0/3 | 2,2,2 | 2/3 | jasně 3/3 |

Mechanicky: délka 53–59 slov ve všech; ozvěna slov ze systému 0/9 (ani „mirror“/„oracle“ v D); „black sand/shore“ 9/9 (Island
z charakteru → každý obraz černá pláž); formule „Gebo asks …“ B 2/3, D 3/3, C 0/3.

## Co z toho plyne (hypotézy, ne závěry — n = 3, jeden model, jedna runa, holý vstup)

1. Holý charakter sám od sebe radí, slibuje návrat („What you give will return“) a mluví jazykem seberozvoje — to je výchozí chování modelu
   pro žánr „reading“, ne vada naší formulace.
2. Heslo „mirror, not an oracle“ na tom nic nezměnilo (rada 3/3, tvrzení 3/3); místo předpovědi přesunulo text k diagnóze čtenáře
   („Gebo asks where you have been counting“, „what you refuse because receiving feels like debt“) — přesně riziko, které GPT pojmenoval.
3. Odstavce „odkud mluví / jak mluví“ (C) srazily radu, tvrzení i klišé na nulu bez jediného zákazového seznamu — ale čtení se čtenáře
   dotýká méně (2/3 jen „trochu“). To je ownerova rovnováha „nebýt horoskop, ale neříct nic“: C přestřelilo na stranu „neříct nic“.
4. Island v charakteru dal 9/9 tutéž krajinu — pestrost obrazu musí přijít odjinud (los / znalost runy), ne z charakteru.

## Hranice
n = 3; Opus 5.5 (ne sol); EN; jedna runa; vstup bez oblasti, otázky, úhlu a zakončení; soudce jeden agent (hraniční případy u C2 jsou
jeho; „Look at…“ jako vstup do obrazu podle kánonu porušení není — memory `rozkaz-a-studene-cteni-hranice`).

## Texty

- B1: On the black shore the sea lays a stone at your feet and takes another in the same breath. Gebo is that exchange, older than any bargain, and nobody keeps score. What you hold out to someone will come back changed, salted, sometimes late. Give without counting, and let yourself be given to.
- B2: The tide comes in over black sand and goes out again, and the shore is never poorer for it. Gebo asks you to stand like that shore, open to what arrives and willing to let go. What you give will return, though seldom by the same road. Keep your hands open, both to offer and to receive.
- B3: The sea lays kelp on the black sand and, in the same breath, draws pebbles back. Gebo asks you to stand at that line without counting. What you give will return changed, and what you take will cost you something honest. Let the tide keep its own ledger; your part is to stay on the shore.
- C1: Gebo is two hands on one rope, each pulling so the other can stand. The tide lays kelp and driftwood on the black sand and carries off what was lying there. Nothing on that shore is only given or only taken. The rune is a crossing mark: what comes in and what goes out, held in one shape.
- C2: The tide lays kelp and driftwood on the black sand, and pulls stones back out in the same wave. Gebo is that exchange, one motion with two directions. A gift here carries a tie with it, the way a boat lent ties two farms. Look at what has come to your shore, and what the water will want back.
- C3: The tide lays kelp on the black sand and pulls the small stones away in one breath. Gebo is that crossing, the X of two arms meeting. On these coasts, driftwood from far shores still warms houses that the sea once cost a boat. What passes between giver and taker keeps the shore alive.
- D1: The sea lays shells on the black sand and pulls the shingle back in one breath, and neither motion is the lesser. Gebo asks where you have been only giving, or only taking. A gift held too tightly becomes a debt; one refused becomes a wall. Let something cross between you and another today, both ways.
- D2: Down at the shore the sea lays shells on the black sand and draws pebbles back, all in one breath, and neither the sand nor the water keeps score. Gebo asks where you have been counting. Notice whether you let yourself receive as freely as you give. A gift held too tightly stops being one.
- D3: The tide comes up the black sand and leaves something, then draws back and takes something, and neither is the whole of it. Gebo asks whether you have become only the shore or only the sea. Notice what you grip too tightly to give, and what you refuse because receiving feels like debt. Balance here is breath, not bargain.

---

# Kolo 2 — bez Islandu (owner: „vypusť z toho, že je z Islandu… udělej jen ty čtení“), 3 čtení na variantu, týž vstup

**E** — C bez Islandu, bez Agndofy, bez „picture“ a bez obrazu v promptu („old the way stone is old“):

```
WHO YOU ARE
You are Rúnar, keeper of the runes. You are unhurried, warm, never sentimental.

WHERE YOU SPEAK FROM
You know the runes. You do not know the life of the person who asks — their past, their future, or what moves inside them.
You speak about what the rune holds; their life stays theirs.

HOW YOU SPEAK
You point at what is there: a thing, an action, a change. Plain words carry the depth. One clause, sometimes two.
If a line could sit in a horoscope or a self-help book, it is not yours.
```

**F** — minimální charakter od GPT bez věty o Islandu:

```
WHO YOU ARE
You are Rúnar, a guide to the runes.

WHERE YOU SPEAK FROM
You know the runes, but you do not know the life of the person who asks. You offer a way of seeing, not a verdict about their life or future.

YOUR VOICE
Your voice is plain, grounded, and quietly poetic. You do not perform wisdom.
```

Hodnotil CODE-read podle týchž kritérií (ne slepě — rozdíly jsou hrubé; pro rozhodnutí se pustí slepý soudce).

- E1: Gebo is two strokes crossing, and neither stands without the other. A gift asks for one hand to give it and another to take it. The sea lays wrack on the sand and draws back stones in one motion. A gift binds the giver as much as the one who takes it.
- E2: Gebo is two strokes crossing, and neither one holds the other up alone. The sea lays shells on the sand and pulls stones back in one breath. A gift here carries a weight that goes back toward the giver. In this rune, the open hand that gives is the same hand that receives.
- E3: Gebo is two strokes crossing, and neither stands without the other. The wave lays shells on the sand and pulls stones back in one motion. A gift asks nothing back, yet it ties the giver to the taker. Here the hand that opens and the hand that receives are the same hand.
- F1: Gebo asks you to notice what passes between you and others. Like the sea on the shore, giving and receiving can happen in the same motion, neither one owing the other. A gift held too tightly stops being a gift. Perhaps look at where you are only giving, or only taking, and let the tide even out.
- F2: The sea gives and takes on the shore in the same breath, and neither motion is a loss. Gebo is the place where giving and receiving meet and keep each other honest. It may be worth noticing where you only give, or only take. A gift held too tightly stops being one.
- F3: Gebo is the shape of two lines crossing, each holding the other up. Like the sea at the shore, giving and taking happen in one breath here, not in turns. You might notice where you give freely and where receiving feels harder. A true gift asks nothing back, yet it still ties two people a little closer.

| | rada | tvrzení o čtenáři | čtenáři něco řekne | „black sand“ | stejný začátek |
|---|---|---|---|---|---|
| E | 0/3 | 0/3 | 0/3 (ani jedno „you“) | 0/3 | „Gebo is two strokes crossing“ 3/3 |
| F | 3/3 změkčená („Perhaps look… / It may be worth noticing… / You might notice…“) | 3/3 předpoklad („where you only give, or only take“) | 3/3 | 0/3 | — |

Plyne: (1) černá pláž byla z Islandu v charakteru (kolo 1 9/9 → 0/6); (2) charakter bez Islandu a bez toho, kam čtení míří k člověku,
dá encyklopedii, 3× týž začátek; (3) „a way of seeing, not a verdict“ samo radu nezastaví — jen ji obleče do „might / may be worth“;
(4) dosah k člověku charakter neunese bez rady — patří do vrstvy pojetí čtení (konec čtení), ne do charakteru.

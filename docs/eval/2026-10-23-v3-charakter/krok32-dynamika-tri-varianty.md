# Krok 32 — čtení od lidské dynamiky: 14 uzlů Gebo × 3 varianty

Datum 2026-10-28 · CODE-read · Opus (čerstvý agent na každé čtení), bez API · 42 čtení + 8 čtení z kroku 25 jako výchozí stav.
Uzly: `krok31-uzly-gebo.md`. Owner test schválil („ok“) 2026-10-28.

## 1. Co se testovalo

1. Čtení se nestaví od významu runy, ale od jedné lidské situace (uzel), kterou má v člověku rozehrát.
2. Tři varianty, vše ostatní stejné (systém v3 z kroku 23; struktura obraz / jádro / hrana / zrcadlo; pořadí obrazu a jádra se střídá):
   1. **V1** — jen situace (jedna věta).
   2. **V2** — situace + kam může čtenáře dovést („nepojmenuj to, ať tam čtení dojde samo“).
   3. **V3** — dvě situace naráz (uzel + uzel z druhé poloviny seznamu).
3. Hranice „dar není jídlo“ z kroku 19 v promptu **nebyla** — záměrně, ať je vidět, co uzly dělají samy.

## 2. Výsledky

1. **Slepý soudce pozná situaci ve všech čteních.** Dva nezávislí soudci (Opus) dostali 14 situací a 50 zamíchaných textů bez označení.
   1. V1: 14/14 hlavní situace správně (oba soudci) · V2: 14/14 (oba) · V3: hlavní uzel 13/14, obě situace naráz 10/14 (A) a 9/14 (B).
   2. Výchozí stav (krok 25, čtení od významu runy): 7 z 8 čtení **nepřiřadil k žádné situaci** (oba soudci shodně).
   3. Soudci se shodli na hlavní situaci u 49 z 50 textů.
   4. Jediný úplný omyl: V3_12 (střídání „teď ty, pak já“ + „radši sám“) — druhá situace (uzel 6, gauč do schodů sám) první úplně přebila.
2. **Otevřená otázka:** soudci označili za uzavřenou nebo obviňující 1–2 ze 14 v každé variantě a 1 z 8 ve výchozím stavu — rozdíl není. Uzavřené: V1_04 („What would it have cost you…“), V2_11 a V2_13 (jen jeden soudce u V2_11), V3_07.
3. **Tvrzení o čtenáři:** 0–1 z 42 (jeden soudce u V2_08 — „some days that not-knowing pulls at your sleeve“, druhý ne).
4. **Délka:** V1 52–58 slov · V2 53–59 (2× mimo pásmo) · V3 53–58.
5. **Co se vrátilo bez hranice:** jídlo nebo pití ve 25 ze 42 čtení (V1 8 · V2 7 · V3 10; výchozí stav 1 z 8). Soused ve 20 ze 42, gauč 7×
   (uzel 6 ve všech třech variantách).
6. **Jádro pořád jako šablona:** „Gebo is…“ / „Gebo here is…“ ve 32 ze 42 čtení (V1 7 · V2 13 · V3 12). V1 ho má nejméně: místo jména runy
   často řekne jádro obecně („A gift ties two people…“); proč, neověřeno.

## 3. Co z toho plyne

1. Stavět čtení od lidské situace **funguje na tom, co se dá změřit**: čtení nese konkrétní situaci tak zřetelně, že ji pozná slepý soudce.
   Čtení od významu runy (krok 25) žádnou rozpoznatelnou situaci nenese.
2. **V1 stačí.** V2 (přidaný posun) soudci nerozeznají od V1 a přidává šablonu „Gebo is“ (13/14) a 2 čtení mimo délku. Zda posun mění,
   co čtení v člověku vyvolá, tenhle soudce neměří — to rozhodne tvoje porovnání.
3. **V3 čtení přetěžuje:** obě situace dorazí v 9–10 ze 14, jinak jedna zapadne.
4. Hranici „dar není jídlo“ (krok 19) je potřeba vrátit, nebo místo ní losovat druh situace — bez ní se vrací polévka a koláč.

## 4. Hranice nálezu

1. Soudce měří, že **situace je čitelná**, ne že čtení dobře zní, nebo že se v něm čtenář najde. To je otázka pro tebe (oddíl 6).
2. Oba soudci jsou stejný model jako generátor (Opus) — rozpoznat parafrázi vlastního zadání je pro něj snadné. Výchozí stav je proti tomu
   kontrola: tam situaci nenašel, ačkoli čtení byla o darech také.
3. n = 14 na variantu, jedno čtení na uzel; rozdíly 14/14 vs 13/14 nic neříkají. Silný je jen rozdíl proti výchozímu stavu (42/42 vs 1/8).
4. Jen angličtina, jen Gebo.

## 5. Všechna čtení

### Uzel 1 — Someone gives a small thing that shows they paid attention, and the other feels seen.

*V3 přidává uzel 8: Someone gives and lets go, and does not need to know what becomes of it.*

1.1 **V1** (52 slov) A friend remembers you once liked sour green apples and leaves two at your door in a napkin. Gebo here is a gift that proves someone was listening. It holds while the giving stays light; once it is counted, the napkin becomes a bill. What did you say once that someone kept?

1.2 **V2** (56 slov) At the bus stop she hands him a pack of the cough drops he mentioned once, weeks ago, and his hand stays open a moment longer. Gebo is the giving that says I was listening. But a gift can bind, and he may now feel he owes her one. Who last remembered something small you said?

1.3 **V3** (58 slov) One morning a coworker sets a cup of tea on your desk, made the way you take it, and walks off without waiting. Gebo is a gift that says I noticed you, handed over with open hands. Open hands also mean she never learns whether the tea was drunk. Who has set something down for you without staying?

### Uzel 2 — A gift is turned down, and the giver hears it as being turned down.

*V3 přidává uzel 9: A favour is done, and later it is brought up out loud.*

2.1 **V1** (58 slov) Gebo is a gift that needs two open hands; when one stays closed, the giver feels shut out. Your aunt holds out a jar of plum jam, you say you're off sugar, and she puts it back on the shelf. You meant only the sugar, but the jar held more than jam. What went back on the shelf?

2.2 **V2** (56 slov) When a gift is turned away, the giver can hear their own name in the no. Your aunt pushes a tin of cookies across the table, you say you've given up sugar, and she quietly puts the lid back on. Your reason was true, and it still did not reach her. What was in the tin?

2.3 **V3** (56 slov) Gebo is the gift that never travels alone; it carries the giver along, and sometimes a bill. Your brother waves away the jam you made, and you hear yourself say, I carried your sofa up four floors. A favour counted out loud becomes a debt, and nobody thanks a debt. What was really in the jar?

### Uzel 3 — Two friends have helped each other for years and have never once counted.

*V3 přidává uzel 10: Someone gives a little of their time, and it costs them less than it gives back.*

3.1 **V1** (57 slov) Across the fence, one returns the borrowed ladder and the other hands over a jar of jam. Gebo is the gift that binds two people because neither one keeps the tally. But the day one of them starts counting, the jam tastes like a debt. Which of the two would notice first if the jar stopped coming?

3.2 **V2** (58 slov) Each autumn she passes jam over the fence, and each spring the jar comes back full of plums; nobody keeps a list. Gebo is a gift that keeps moving, so neither hand stays empty long. When one stops passing, the jar sits on a shelf and starts to feel like a debt. What is sitting on your shelf?

3.3 **V3** (58 slov) Your neighbour returns your ladder with a bag of plums on the top rung, and neither of you knows whose turn it was. Gebo is giving that runs both ways until no one keeps the ledger. But if one stops knocking, there is no tally to show what went missing. Whose ladder is in your shed right now?

### Uzel 4 — Someone pays back a kindness at once, and the friend feels a little further away.

*V3 přidává uzel 11: Someone keeps giving so that they will be needed.*

4.1 **V1** (57 slov) A gift returned too quickly becomes a paid bill, and the bond closes with it. Your neighbour shovels your walk at dawn; by noon you leave wine on her step. The account is clean, but nobody owes anybody now, and nobody needs to knock. What would it have cost you to carry her kindness a while longer?

4.2 **V2** (57 slov) Gebo is a gift that keeps two people tied, as long as nobody rushes to even it out. A neighbour carries your shopping upstairs, and that evening you knock with a bottle of wine. Nothing is owed now, and nothing calls either of you back to that door. What might have grown if the bottle had waited?

4.3 **V3** (56 slov) Gebo is the gift that leaves a small debt open between two people. She returns the borrowed dish the next morning, washed, with a cake inside, and her neighbour thanks her at the door. Paying at once closes the door, and the one who keeps bringing soup is buying her place. Who was the cake for?

### Uzel 5 — Someone accepts help gladly, and the helper is warmed by being let in.

*V3 přidává uzel 12: One gives more now, the other will give more later, and both know the tide turns.*

5.1 **V1** (56 slov) Your neighbour offers to carry the sofa upstairs, you say yes, and he grins, grabbing the heavy end. Help only lands when someone lets it in, and being let in is a gift too. But now you owe him a favour, and he decides when to ask. Which end of the sofa do you reach for?

5.2 **V2** (56 slov) A neighbor brings soup to a woman with a new baby; she waves him in, eats a full bowl, and he sits down smiling. Gebo here is a gift that only finishes when someone takes it whole. It stops holding when the taking turns into a debt she keeps counting. Who was fed at that table?

5.3 **V3** (54 slov) Your neighbour carries one end of your sofa up three flights, and you let him into the unpacked mess for coffee. Gebo is a gift taken openly, and a debt both carry lightly, knowing next spring it may be his sofa. If one keeps a tally, the coffee goes cold. Whose stairs come next?

### Uzel 6 — Someone would rather carry it alone than owe anyone.

*V3 přidává uzel 13: One has carried most of it for a long time, and is tired.*

6.1 **V1** (58 slov) A gift ties two people together, and taking one means letting yourself be tied. He hauls the couch up three flights alone, sweating, and waves off the neighbour who offered to take the other end. The couch gets there, but the neighbour goes back inside with nothing to give. What would taking that other end have cost him?

6.2 **V2** (56 slov) Here Gebo is a gift kept at arm's length, because taking it would mean owing. A neighbour offers to take the other end of the sofa, and you drag it up three flights alone. It gets there, but your back pays, and the neighbour doesn't offer again. What was the neighbour holding out besides a hand?

6.3 **V3** (56 slov) Gebo is a gift that has to move both ways, or it stops being one. A neighbour offers to take the other end of the sofa, and you drag it up three flights alone. The sofa gets up, but your back pays, and the neighbour goes inside with nothing given. Who is the other end for?

### Uzel 7 — A gift arrives that was never asked for, and taking it might say yes to something unspoken.

*V3 přidává uzel 14: One offers care, and the other receives it as being watched over.*

7.1 **V1** (57 slov) A neighbour you barely know leaves a bag of tomatoes on your step, no note. Gebo is a gift that opens a line between two people before either agrees to it. Once you carry the bag inside, the line is open, and the urge to give back starts on its own. What would leaving it there say?

7.2 **V2** (53 slov) A neighbor you barely know leaves a warm pie on your step the week you move in. Gebo is a gift that opens a door, and doors swing both ways. Eat the pie and the plate must go back, and someone will be waiting when you knock. What else came on that plate?

7.3 **V3** (54 slov) Your mother-in-law brings a new winter coat, your size, saying she noticed the old one was thin. Gebo is the trade that begins when a hand reaches out, agreed or not. Worn, the coat can feel less like warmth and more like being watched. Whose eyes do you feel when you put it on?

### Uzel 8 — Someone gives and lets go, and does not need to know what becomes of it.

*V3 přidává uzel 2: A gift is turned down, and the giver hears it as being turned down.*

8.1 **V1** (57 slov) Gebo here is a gift that leaves the hand with no thread tied to it. You leave a bag of old coats on the shelter step, walk to the bus, and don't look back. No one will thank you, and you will never know who wore them. What is it you keep, once the bag is gone?

8.2 **V2** (57 slov) Gebo here is a gift that leaves your hands and stops being yours to follow. You hand your old winter coat across the charity shop counter and walk out without looking back. You never learn who wears it, and some days that not-knowing pulls at your sleeve. What do your arms feel like on the walk home?

8.3 **V3** (57 slov) Gebo here is an open hand that does not follow what it lets go. You hold out your old coat to a neighbour at the door; she says she has one, and you carry it home. Letting go stays easy only while the gift is taken; returned, the coat feels like you. What did you carry home?

### Uzel 9 — A favour is done, and later it is brought up out loud.

*V3 přidává uzel 3: Two friends have helped each other for years and have never once counted.*

9.1 **V1** (55 slov) At a family dinner, your brother mentions, loud enough for everyone, the time he drove four hours to help you move. A gift ties two people together, and the tie runs both ways. Once it is said aloud, the gift starts to sound like a bill. Who at that table is he really talking to?

9.2 **V2** (58 slov) At a crowded birthday table, your brother tells everyone how he covered your rent that winter, and the room turns to look at you. Gebo is the gift that moves between two people and binds them. But once it is told aloud, it stops being given and starts being owed. What is still being paid at that table?

9.3 **V3** (54 slov) At a birthday dinner, your sister tells the table she paid your rent that winter, while two old friends beside her refill each other's glasses without a word. Gebo is a gift that binds, as long as nobody keeps count. Said out loud, the gift becomes a bill. Who at that table are you?

### Uzel 10 — Someone gives a little of their time, and it costs them less than it gives back.

*V3 přidává uzel 4: Someone pays back a kindness at once, and the friend feels a little further away.*

10.1 **V1** (58 slov) Here Gebo is a small gift of time that comes back larger than it left. A neighbour stops on the stairs to help carry a pram, and walks on lighter than before. It holds while the help stays small; ask for every evening and the lightness turns to debt. What did the neighbour carry away from those stairs?

10.2 **V2** (59 slov) Gebo here is a little time given away that returns heavier than it left. You stay twenty minutes after your shift to show the new colleague where the paper jams in the copier, and you walk home lighter. But those twenty minutes were taken from someone waiting at home. What did you carry home that you had not brought?

10.3 **V3** (58 slov) A gift binds two people only while some of it stays unpaid. She spends her Saturday morning helping a neighbour carry boxes upstairs, and walks home lighter than she came. When he presses a bottle into her hands at the door, the debt is cleared, and with it the reason to knock. Who is the bottle really for?

### Uzel 11 — Someone keeps giving so that they will be needed.

*V3 přidává uzel 5: Someone accepts help gladly, and the helper is warmed by being let in.*

11.1 **V1** (55 slov) She brings her brother soup, fixes his dripping tap, and leaves before he can offer her a chair. Here Gebo is a gift held out like a rope, so he keeps holding on. The rope holds only while he struggles, and nobody brings her soup. What would her evenings be if the tap stopped dripping?

11.2 **V2** (59 slov) She brings her neighbor soup every Sunday, and the week his daughter starts cooking for him, she brings two pots. Here Gebo is a gift with a hook in it. The giving never stops long enough for him to give back, so nothing really passes between them. Climbing his stairs with the second pot, whose hunger is she feeding?

11.3 **V3** (57 slov) A neighbour mows your lawn before you ask; the day you hand him a beer and say thanks, he stays till dark. Gebo is a gift that binds the giver as much as the one who takes it. A man who only gives keeps the others owing, and is never helped himself. Whose lawn are you mowing?

### Uzel 12 — One gives more now, the other will give more later, and both know the tide turns.

*V3 přidává uzel 6: Someone would rather carry it alone than owe anyone.*

12.1 **V1** (56 slov) A gift ties two people, and its weight slides from one side to the other. All winter your neighbour clears snow from your steps, and in July you carry her shopping up three flights without being asked. Once either of you starts counting the bags, the shovel becomes a bill. Whose turn is it to carry?

12.2 **V2** (55 slov) Gebo here is a give and take that evens out over seasons, not days. All winter one neighbour clears both driveways while the other nurses a bad back, and in July the second waters two gardens unasked. If one moves away in March, the snow was simply given. Which season are you in right now?

12.3 **V3** (53 slov) A gift ties two people, since the one who takes now will give later. One man carries his own sofa up three flights while his neighbor stands at the door, hands open. He owes nothing at the top, but nothing passes between them either. What would the neighbor have asked for in return?

### Uzel 13 — One has carried most of it for a long time, and is tired.

*V3 přidává uzel 7: A gift arrives that was never asked for, and taking it might say yes to something unspoken.*

13.1 **V1** (56 slov) After the dinner she cooked, she stands alone at the sink while laughter drifts in from the other room. A gift only stays a gift while something comes back across the table. When one side keeps giving, the giving turns into duty, and the hands grow heavy. Who would notice if the plate stayed unwashed tonight?

13.2 **V2** (54 slov) Every Sunday she drives an hour to her brother's, brings soup, fixes his gutter, drives home in the dark. Gebo is a gift that travels both ways. When it runs only one way, the giving turns into duty, and only the driver feels the miles. When did he last make the drive to her?

13.3 **V3** (57 slov) After years of carrying the groceries up alone, she finds a warm pot of soup on her doorstep, no note. Gebo is the gift that lands in tired hands and ties two people together. Once she eats, the pot must go back, and it never goes back empty. What does she put in it before she knocks?

### Uzel 14 — One offers care, and the other receives it as being watched over.

*V3 přidává uzel 8: Someone gives and lets go, and does not need to know what becomes of it.*

14.1 **V1** (55 slov) Care offered can land as a gaze nobody asked for. A mother texts her grown son at midnight to ask if he got home, and he reads it in his own dark kitchen. The text carries her worry to him, but it leaves out whether he wanted to be counted. What would he write back?

14.2 **V2** (57 slov) Here Gebo is a gift that arrives as something else. A mother texts her grown son each evening asking if he got home safe, and he reads it on the bus, jaw tight. The texts keep coming, his answers get shorter, and neither of them says why. What is in those messages that neither of them wrote?

14.3 **V3** (57 slov) Gebo is care held out and then let go of, into hands that may feel it as being watched over. A mother packs food for her grown son's train, then walks home before it leaves. He may eat gladly or feel her eyes in every sandwich, and she will never hear which. What does she carry home?

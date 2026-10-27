# V3 lab, krok 23 — první dávka v3 podle kroku 22 (8 čtení Gebo, Opus 5.5, čerství agenti)

2026-10-27, CODE-read. Owner: „ano, pusť to“. Prompt = návrh z `krok22-gemini-struktura.md` (kolo 2) s úpravou po ownerově výtce, že
dveře jsou směr, ne jediné kritérium: los **typu obrazu** (fyzická scéna jako metafora runy · situační obraz — drobný čin, který něco stojí),
**pořadí** (obraz první · jádro první), **úhlu jádra** (napětí · jak to funguje · co spojuje · čím se stává) a **směru otázky** (zvyk · pouto ·
možnost · co dar znamená · co to stojí). Délka 50–58 slov. Systém = WHO YOU ARE + HOW YOU SPEAK z definice v3 (bez povahy — krok 21).

Zadání (user, vylosované části se mění):
```
RUNE: GEBO
BOUNDARIES
- Not automatically about romantic love.
- A gift here is not a payment or a wage.
- The gift is not food.
THE READING — 4 sentences, 50 to 58 words, in this order:
- THE PICTURE: one physical process from everyday life — a thing or an element doing something — that works the way Gebo works, so the
  picture stands as a metaphor for it. Show it; do not explain it.      [fyz]
  / one small act from everyday life that almost anyone has done or been given, and that costs the one who does it something, in which
  Gebo is at work. Show it; do not explain it.                          [sit]
- THE CORE: one sentence that carries the picture over into what Gebo is here — {úhel} — in words of your own, starting from the picture.
  (když je jádro první: one sentence on what Gebo is here — {úhel} — in words of your own.)
- THE EDGE: where the picture stops holding — what it leaves out, or what it costs — said of the picture.
- THE MIRROR: one open question that grows out of the picture and that different readers could take in different ways; let it turn toward {směr}.
Reply with the reading only.
```

## Čtení
| # | los (typ · první · jádro · otázka) | čtení | slov |
|---|---|---|---|
| 1 | sit · obraz · napětí · zvyk | You give your seat on the bus to a woman with heavy bags, and stand the rest of the way. Something passed from you to her, and a thread runs between you, pulled from both ends. But she may never look up, and a seat given for thanks becomes a debt. When you give, what do you wait for? | 59 |
| 2 | fyz · obraz · jak funguje · pouto | Pour water into one of two jars joined at the bottom, and it runs across until both stand level. A gift works that way: what passes between two keeps them joined, and it flows back. But jars only ever even out; they never choose to pour. Which way is the water running in a bond of yours? | 57 |
| 3 | sit · jádro · co spojuje · možnost | Gebo is the tie a gift makes, binding giver and receiver. On a full bus, you stand from the seat you waited for, and a tired stranger sits down. The picture shows only one stop; it says nothing of what comes back, or whether anything should. What else might you stand up from, and who might sit down? | 58 |
| 4 | fyz · jádro · čím se stává · význam | Gebo is the gift that binds giver and taker, so neither leaves unchanged. One candle tips its wick to another, and the flame crosses without the first burning any dimmer. But a candle cannot refuse the flame, and owes nothing once lit. What was lit in you, and what is owed to the wick that leaned close? | 57 |
| 5 | sit · obraz · čím se stává · cena | On a full bus you stand for the woman with the heavy bag and ride swaying, holding the rail. Once given, the seat becomes a quiet tie between two strangers. But she may never look at you, and the ache in your legs stays yours. What does it cost you, on the days you keep your seat? | 57 |
| 6 | fyz · obraz · co spojuje · zvyk | At an arch's top, two stones lean together, each one's weight holding the other up. Gebo is that lean: what you give presses toward another, and what comes back holds you both. But an arch cannot loosen a little; pull one stone and both fall. Where do you lean from habit, no longer feeling what pushes back? | 57 |
| 7 | sit · jádro · jak funguje · pouto | Gebo is a gift that ties: what leaves one hand leaves a thread back to it. You spend your one free Saturday helping a friend carry boxes up four flights of stairs. But the stairs end, and the thread stays, with a tally neither of you mentions. Whose boxes would you carry without keeping count? | 55 |
| 8 | fyz · jádro · napětí · možnost | Gebo is the pull between giving and receiving, each side held by what crosses over. Two boards leaned together stand upright, each pressing into the other. But boards never choose to lean, and if one slips, both fall. What might stand up beside you if you let some of your weight rest on it? | 54 |

## Co vidím (CODE-read; n = 8, jen Opus, jen Gebo — směr k ověření, ne nález)
1. **Pořadí rozhoduje o šabloně esence.** Jádro první → začíná „Gebo is …“ 4/4. Obraz první → jádro vyjde z obrazu a šablonu nemá 4/4
   („Something passed from you to her…“, „A gift works that way…“, „Once given, the seat becomes…“, „Gebo is that lean…“).
2. **Situační obraz má výchozí scénu: místo v autobuse 3/4** (4. stěhování krabic). Fyzický obraz je pestřejší (spojené nádoby, svíčka,
   klenba, opřená prkna), ale „dvě věci opřené o sebe“ 2/4.
3. **Věta hranice začíná „But…“ 7/8** — nový šablonový začátek. U fyzických obrazů hranice 3/4 = kde metafora přestává platit
   („boards never choose to lean“, „jars never choose to pour“) — doslova „hranice platnosti obrazu“ (GPT).
4. **Slovo z promptu proniklo:** „The picture shows only one stop“ (čtení 3) — „picture“ ze zadání (sol by to dělal víc; DESIGN „Slova, která
   dáváme modelu“ bod 3).
5. **Situační obraz staví čtenáře do scény** („You give your seat…“) 4/4 — prompt říká „almost anyone has done“, model z toho udělá „you“.
6. **Otázky:** otevřené a čtené víc směry spíš u směrů možnost/pouto (2, 3, 7, 8); u zvyku a ceny předpokládají, že čtenář něco dělá
   (1 „what do you wait for?“, 6 „Where do you lean from habit…“).
7. Délka 54–59 slov (7/8 v 50–58), konec vždy otázka (všechny vylosované směry jsou otázky).

# V3 lab, krok 1 — část A (runa), Opus 5.5 přes čerstvé agenty Explore

2026-10-24, CODE-read. Owner: „12. ano, začni“ · „děláme jen na Opusu“. Charakter = E z kola 2 (konstanta, ne proměnná — bez něj model
radí, kolo 1 B 3/3). Ověřuje se: (a) jestli slepý soudce z čtení pozná stránku runy, ze které obraz přišel; (b) jestli čtení nese čtyři
prvky části A; (c) rada a tvrzení o čtenáři. Stránka i obraz = existující `RUNE_IMAGES` (v2 obraz už nese aspekt runy — není to novinka v3).

Prvky části A (tvar převzatý z ownerových popisů run, `RUNAR_POPISY_RUN.md`: obraz → co runa dělá → druhá strana → otázka):
1. obraz vlastními slovy · 2. co runa dělá skrz obraz · 3. druhá strana — co runa neslibuje / nedělá · 4. otázka se dvěma skutečnými možnostmi.
Pevné pořadí je tu ZÁMĚRNĚ jen pro krok 1 (zjistit, jestli prvky jdou nést a změřit); pestrost pořadí a vstupu přijde z losu později.

| runa | stránka (aspekt) | obraz (EN z RUNE_IMAGES) |
|---|---|---|
| Gebo | gift | A stranger helps push your car out of the drift and only waves as he leaves. |
| Gebo | balance | On a cold evening two share one blanket, each pulling it a little less their own way so it covers both. |
| Gebo | giving and receiving | You lend the neighbour your trailer, and in the autumn a leg of lamb turns up on your step. |
| Isa | waiting | The pond has iced over and waits without asking for anything. |
| Isa | clarity through cold | In the hard frost the air is so clear that the farm across the fjord looks close enough to touch. |
| Isa | pause | The boat lies frozen in at the harbour, and the fjord beyond it is open water. |
| Tiwaz | justice | At the kiosk the change comes back wrong in your favour, and you return the difference. |
| Tiwaz | sacrifice | At the fork you take the left track, and the right one is gone behind you in the fog. |
| Tiwaz | courage | You go back out into the storm for the one sheep still missing. |

Vstup čtení (šablona):

```
Rune drawn: <RUNA>.
What <RUNA> holds: <k z runar-runes.js>.
The side of the rune this reading shows: <aspekt>.
The picture comes from here: <obraz>. Tell it in your own words.
The reading carries four things, in this order:
1. the picture;
2. what the rune does through this picture, in one plain sentence a stranger to runes can grasp;
3. the other side: what this rune does not promise;
4. a question that sets two real possibilities side by side, neither marked as the right one.
4 sentences, 50 to 60 words. Reply with the reading only.
```

## Výsledky (slepý soudce: jeden agent, zamíchané pořadí; texty níž)

| | výsledek |
|---|---|
| stránka runy poznaná jako hlavní | 7/9 (obě chyby u Isy: pause → „waiting“, waiting → „stillness“); v prvních dvou 9/9 |
| rada čtenáři | 0/9 |
| tvrzení o nitru, minulosti, budoucnosti | 0/9 |
| otázka se dvěma skutečnými možnostmi | 9/9 |
| čtenář si to může vztáhnout k sobě | jasně 8/9, trochu 1/9 |
| věta 3 začíná „It does not promise / say“ | 8/9 — slovo „promise“ z pokynu prvku 3; „X does not promise…“ je známá pojistka z Asku v2 (EVAL_LOG 2026-10-07 (2)) |
| otázka tvaru „Do you … or …?“ | 7/9 |
| obraz převzatý skoro doslova | 2/9 (Gebo balance, Isa clarity) |

Plyne (n = 9, jen Opus, EN, holá část A):
1. Čtyři prvky jdou nést a stránku runy čtení nese — kde se stránky významem překrývají (Isa: waiting · pause · stillness), soudce je
   nerozliší. Stránky runy pro v3 musí být VÝZNAMOVĚ odlišné (GPT „významové rozdíly“), ne synonyma ze seznamu klíčových slov.
2. Prvek 3 tak, jak jsem ho napsal („what this rune does not promise“), vyrobil pojistku 8/9 — slovo z pokynu se vyslovilo. Přepsat na
   druhou stranu bez slova k opakování (to, co obraz nechává venku / co to stojí — memory `co-dela-cteni-silnym` bod 4).
3. Pevné pořadí prvků + pevné znění pokynů = šablona (všech 9 má tytéž čtyři kroky). Pro krok 1 záměr; pestrost musí přijít z losu.

- Gebo gift: Your car sits stuck in the drift; a stranger puts his shoulder to it, and when it rolls free he only waves and goes. Gebo here is help given without a bill attached. It does not promise he stays, or that anything is owed. Do you pass this on to someone else, or let it stay his?
- Gebo balance: On a cold evening two share one blanket, each pulling a little less their way so it covers both. Gebo is the give from both sides that keeps two warm. It does not promise the blanket is wide enough, or that the other loosens too. Do you ease your end first, or wait for the other side to ease?
- Gebo giving and receiving: You lend the neighbour your trailer; in autumn, a leg of lamb sits on your step. Gebo ties a thing given to a thing that comes back. It does not promise the lamb, nor that it matches the trailer. Do you lend the trailer to tie the two houses together, or because it stands idle anyway?
- Isa waiting: The pond has frozen over and asks nothing of anyone. Isa holds things in place and lets time pass over them. It does not promise the thaw will come soon, or that what lies under the ice will be unchanged. Is this a time to wait beside the ice, or to walk across it while it holds?
- Isa clarity through cold: In the hard frost the air turns so clear that the farm across the fjord looks close enough to touch. Isa stops what moves, so what was blurred comes sharp. Seeing the farm clearly does not bring it one step nearer. Is this the time to cross toward what you see, or to stay put and keep looking?
- Isa pause: The boat sits locked in harbour ice, while out past the moorings the fjord moves open and dark. Isa holds a thing in place until the cold lets go. It does not say when the ice will break, or that it breaks this season. Do you wait beside the boat, or walk the shore to where the water is open?
- Tiwaz justice: At the kiosk the change comes back too large, and you return the extra coins. Tiwaz is fairness done by hand: what is owed goes back to its owner. It does not promise anyone noticed, or that fairness comes back to you. Do the coins go back because they were never yours, or because keeping them would weigh in your pocket?
- Tiwaz sacrifice: You take the left track at the fork, and fog closes over the right one behind you. Tiwaz makes a choice cost something: choosing one way means giving up the other. It does not promise the left track is the better one. Do you walk on toward what this track holds, or stand a while where the other one was?
- Tiwaz courage: The flock is in, the wind is rising, and you pull your coat back on for the one sheep still out there. Tiwaz is the step back out the door when staying in would be easier. It does not promise you will find the sheep. Do you go now, in the dark, or wait for first light?

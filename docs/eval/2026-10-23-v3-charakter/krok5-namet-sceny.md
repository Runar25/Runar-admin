# V3 lab, krok 5 — námět scény + jedna věta významu (ownerův návrh), Gebo, Opus 5.5 čerství agenti

2026-10-24, CODE-read. Owner: „dáme modelu jen námět na scénu a tu pak model vytvoří, ale musí to být scéna, která popisuje význam runy…
každé slovo musí zapadat do příběhu, každý předmět by měl obrazu pomoci vidět lépe či poznat, co ve výkladu runy znamená… a pak říct
jen 1 větu, která znamená význam runy.“ · „když ti dám materiál, i od GPT, máš zkontrolovat, jestli je to pravda.“
Žádný obraz z banky v2. Charakter E (konstanta).

## Ověření materiálu (prameny, ne dojem)

| tvrzení | zdroj | verdikt |
|---|---|---|
| Gebo z pragermánského *gebô „dar“ | Wikipedia „Gyfu“ | ✅ (Gemini psal „prasemitské“ — ❌) |
| Mladší futhark runu g nemá, /g/ píše runa kaun ᚴ | tabulka Younger Futhark tamtéž | ✅ tabulkou (článek to výslovně neříká) |
| Hávamál 145: „ey sér til gildis gjöf“ — dar vždy hledá protidar | heimskringla.no, Hávamál | ✅ |
| Hávamál 42: „gjalda gjöf við gjöf“ — dar oplácet darem | tamtéž | ✅ |
| Hávamál 41: „viðrgefendr ok endrgefendr erusk lengst vinir“ — kdo dávají zpět a znovu, zůstanou přáteli nejdéle | tamtéž | ✅ |
| Hávamál 52: s půlkou bochníku a nakloněným pohárem jsem získal druha — dar nemusí být velký | tamtéž | ✅ |
| Anglosaská runová báseň (gyfu): štědrost je čest a pomoc tomu, kdo nic jiného nemá | Wikipedia „Gyfu“ | ✅ |
| GPT: „Reciprocity does not necessarily imply equal value“ | Hávamál 52 to podpírá (malý dar stačí) | ✅ jako výklad, opřený o 52 |
| GPT: „A gift may create expectations, but this is not inevitable“ | Hávamál 145 říká opak („ey“ = vždy) | ❌ moderní výklad proti prameni |
| GPT: možnosti výkladu (nabídka nepřijatá, význam daru se mění po přijetí…) | v pramenech není | ⚠️ výklad GPT, ne doložený význam |
| Owner (popis Gebo): „Gebo není obchod… není v ní účetnictví“, „vynucený dar není dar“ | 📜 kánon ownera | platí; vedle Háv 42 („oplácet“) to není rozpor — vzájemnost ano, počítání ne |

## Význam Gebo pro tenhle krok (jen ověřené)
A gift, and the bond a gift makes: a gift looks for a gift in return, and those who give and give back stay friends longest.

## Náměty scén (každý svázaný s ověřeným významem; náměty, ne hotové věty)
- N1 (Háv 52): little to offer — half a loaf and a cup shared with someone at the door, and a companion is made.
- N2 (Háv 41/42): a borrowed thing goes back to the neighbour with something added; next time the neighbour does the same.
- N3 (anglosaská báseň): someone with nothing is given a place and a share — help that leaves them their dignity.
- N4 (owner: dar opouští ruku): a gift that the giver will miss once it is gone.

## Vstup (šablona); věta „Every word…“ je vypínač (S = se, B = bez)
```
Rune drawn: Gebo.
What Gebo means: a gift, and the bond a gift makes — a gift looks for a gift in return, and those who give and give back stay friends longest.
Scene seed: <N>. Build the scene yourself from this seed; it must show what Gebo means.
[S] Every word and every object in the scene must help the reader see it or understand what Gebo means; nothing is there for decoration.
After the scene, one sentence that says plainly what Gebo means.
4 sentences, 50 to 60 words. Reply with the reading only.
```
Měří se (předem): je jasné, co Gebo ve scéně znamená (0–2) · ozdoby (předměty a detaily, které nepomáhají vidět ani pochopit — počet,
citace) · věta významu jednou a srozumitelně · srozumitelnost celku (0–2) · rada / tvrzení o čtenáři · opis námětu.

## Výsledky (slepý editor, 8 zamíchaných textů; pořadí 1=N2B 2=N4S 3=N1S 4=N3B 5=N2S 6=N4B 7=N3S 8=N1B)

| | se „Every word…“ (S) | bez (B) |
|---|---|---|
| je jasné, co Gebo ve scéně znamená (0–2) | 2, 2, 2, 1 | 2, 1, 2, 1 |
| ozdoby (počet) | 0, 0, 0, 2 | 0, 1, 1, 1 |
| srozumitelné napoprvé (0–2) | 2, 2, 1, 1 | 2, 1, 2, 1 |

Napříč všemi osmi:
- rada / tvrzení o čtenáři 0/8; čtenář ani jednou osloven (scény ve 3. osobě) 8/8;
- věta významu opisuje naši větu „What Gebo means“ 7/8 („…stay friends longest“), jen 1/8 vlastními slovy;
- každá scéna přidá opožděný protidar („In spring / By spring…“) 8/8 — náš význam „a gift looks for a gift in return“ určil děj
  všech scén bez ohledu na námět; opakuje se plot 3×, sekera 3×, chléb 4×, žebřík s jídlem na příčce 2×;
- námět N3 („help that leaves them their dignity“) model 2/2 udělal mzdou („a third of the wool he cuts“, „bread he has earned“) —
  proti Gebo.

Plyne (n = 4 na rameno, jen Gebo, jen Opus):
1. Námět scény + model scénu postaví: krátké, srozumitelné, Gebo jasné v 5/8, ozdoby skoro žádné — směr funguje.
2. Věta „Every word and every object…“ na tomhle n nic nezměnila (ozdoby 2 proti 3, jasnost stejná). Netvrdí se, že nefunguje —
   ozdob bylo i bez ní málo, protože námět scénu zúžil.
3. Co dáme jako hotovou větu významu, model opíše do věty významu (7/8) a postaví podle ní děj (8/8). Význam musí přijít jako materiál
   k námětu (každý námět svou stránku), ne jako jedna věta pro všechny.
4. Námět musí být vyzkoušený — N3 v podání modelu sklouzl k mzdě.

## Texty
- N1 S: A stranger knocks at dusk; she has half a loaf and one cup. She tears the bread in two and hands him the cup first. Next winter he returns with a sack of oats, and she fills the cup for both. Gebo is a gift that asks a gift back, and those who keep giving back stay friends longest.
- N1 B: Someone knocks at the door at dusk, and the house holds half a loaf. The bread is broken in two, and one cup passes between them. In spring the guest returns with barley and mends the fence. Gebo is a gift that looks for a gift back, and those who give back stay friends longest.
- N2 S: A ladder goes back over the fence with a jar of honey hung from its top rung. In autumn the neighbour returns the borrowed axe, its edge freshly sharpened. Between the two houses, the path through the grass stays worn. Gebo is a gift that looks for a gift in return, and giving back keeps two people friends longest.
- N2 B: A woman carries her neighbour's ladder back, a loaf tied to the top rung. In autumn the neighbour borrows her axe and returns it sharpened, with apples. Neither keeps count, but the path between their doors stays worn. Gebo is a gift, and the bond it makes when a gift is answered with a gift.
- N3 S: A stranger with empty hands comes to the farm at shearing time. The farmer gives him a bench by the fire, a pair of shears, and a third of the wool he cuts. By spring the stranger has mended the farmer's fence unasked. Gebo is a gift that asks a gift back, and those who give both ways stay friends longest.
- N3 B: A man comes in from the sleet empty-handed, and the farmer sets a bowl for him at her table. In the morning she hands him the axe, so the bread he eats is bread he has earned. By spring he mends her fence unasked. Gebo is a gift that looks for a gift back; giving back keeps friends longest.
- N4 S: The smith lays his best hammer, the one worn smooth to his grip, in his neighbour's hands. His own hand closes on nothing when he turns to the anvil. In spring the neighbour comes back with a sack of seed-barley and stays to help him plough. A gift asks for a gift, and those who give back stay friends longest.
- N4 B: A fisherman gives his neighbour the knife his father ground thin. All winter his hand reaches for it on the bench and finds only wood. In spring the neighbour comes up the path with a smoked side of salmon wrapped in birch bark. A gift asks for a gift back, and the two who keep trading them stay friends longest.

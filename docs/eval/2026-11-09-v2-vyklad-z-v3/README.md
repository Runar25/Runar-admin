# Lab: výklad run z V3 do v2 (CODE-read, od 2026-11-09)

Owner 2026-11-09: *„implementovat do v2 to, co jsme se snažili dostat do V3. Což bylo shadow rune, co jsme měli dál, co nemá v2, ale mělo mít V3,
výslovně co se týče výkladu run.“* Rozhodnutí → `RUNAR_DECISIONS.md` 2026-11-09 (1). V3 je k ledu → [../2026-10-23-v3-charakter/v3-k-ledu.md](../2026-10-23-v3-charakter/v3-k-ledu.md).
**Tenhle soubor vlastní jen jednu věc:** co z výkladu run ve V3 ve v2 chybí, v jakém pořadí se to zkouší a výsledky zkoušek. Pokyny vlastní
`../2026-10-23-v3-charakter/zadani-v3.md` (čísla bodů A–G odkazují tam), kód v2 vlastní `v2/`. Postup: lab měří tady na produkční cestě
(sol, buildery v2), do produkce to po jednom převádí CODE-tune (lanes v CLAUDE.md).

## 1. Co ve výkladu run V3 měla a v2 nemá
| # | věc | pokyn (zadani-v3) | ve v2 dnes | co je potřeba |
|---|---|---|---|---|
| 1 | **druhá strana významu**: stín u světlé runy, světlo u těžké, bez nálepky | A4, F45, G55; krok 40 verdikt („pravidlo sedí“) | nic. Těžké runy (`HEAVY_RUNES`) jen konec „without comfort“. Mrtvý pool `READING_ASPECTS` v `v2/runar-utils.js` má položku „shadow — the cost beneath the gift“, nikdy nezapojenou (komentář: nevracet bez rozhodnutí) | řádek vstupu v `RP_SINGLE` (+ data na runu); světlo pro těžké runy data nemá |
| 2 | **moderní významy** jako zdroj | B9–B11 | „focus on: <aspekt>“ ze sloupce obrazu (`RUNE_IMAGES`), jinak 3 klíče z `RUNES[].k` | mapa aspekt → moderní význam a stín na 25 run; tabulka GPT je neověřená (F32) |
| 3 | **otázka na konci z významu, v každém čtení** (zrcadlení) | A3, F36, owner 10-28 | los konce 5 tvarů (`ENDING_OPEN`/`HEAVY`), otázka jen 1 z 5; most „may be X“ nese v Asku pojistku | změna konce = velká změna v2 → napřed test, rozhodne owner |
| 4 | **oblast vybere úhel významu**, ne vlastní větu | G52, krok 36 | věta oblasti „land on {podoba}“ + výběr obrazu podle oblasti | data úhlů se značkami oblastí (na bod 2) |
| 5 | **suchý humor občas** (ne Healing, ne těžká runa, ne na účet čtenáře) | F45, krok 38 verdikt | nic | jedna losovaná věta |
| 6 | **fáze runy** (nástup, vrchol, přechod, odpor) | F34, G51 (rozhodne test) | nic | test, znění nové |
| — | už ve v2: význam řečený jasně pro cizince (A2), jeden pohled na čtení losem (F43) | | `ESSENCE_FRAMES_SOL` + los slovesa; aspekt losem | nic |

## 2. Pořadí zkoušek (jedna změna na test, ownerova metoda 2026-11-05)
Základ = produkční prompt v2 single EN na solu (`scripts/utils/gen_batch.js`, produkční buildery), pevné losy, 10 čtení na rameno, víc run
(F44: závěr nikdy z jedné runy). Měří se: zda se věc ve čtení objeví, nálepka, délka, pojistka (`scripts/utils/pojistka.js`), tvrzení o čtenáři,
opis vstupu; texty čte owner. API jen s ownerovým ano (§30).
1. Druhá strana (bod 1) — nejmenší zásah, jen vstup; v GPT testu 1 přišla sama uvnitř scény 10/10.
2. Humor (bod 5).
3. Otázka na konci (bod 3).
4. Moderní význam (bod 2) — až s daty.
5. Oblast → úhel (bod 4) — na datech z 4.
6. Fáze (bod 6).
Islandština každého kusu až po EN, nástroji z CLAUDE.md §2.

## 3. Výsledky
Prompt = produkční `buildReadingPrompt` + `_promptKonec` (single EN, bez oblasti, hledání, jména a otázky, účet bez ✦) + `buildSysPrompt`; jeden řádek navíc.
Sol jako `callSol` (gpt-6-sol, reasoning none, explicit cache). Stejné semínko losů v porovnávaných čteních. Skripty a JSON s celým promptem ve scratchpadu session.

### 3.1 Druhá strana — Fehu, 3 + 3 (owner 2026-11-09 „6. ok“), 6 volání
Řádek za esencí: „WHERE THIS MEANING GOES WRONG: loss, hoarding, greed, resources handled badly.“
1. Druhá strana se objevila 3/3, bez nálepky, pokaždé jinými slovy. Produkce bez řádku ji nemá ani jednou.
2. Kam padla: do věty 3 nebo do konce; ze čtení ubyla věta o krok dál ve scéně (v produkci „each needs pasture through winter“, „still needs pasture“).
3. Délka a počet vět beze změny: 4 věty, 59–69 slov produkce × 61–62 s řádkem (obě nad 58).

- **1077 produkce:** At the mountain’s edge, your flock comes down to the grass below, larger than it was in spring, with a young lamb keeping close to its mother. Fehu stands for wealth that grows and needs tending. Each new animal adds to the flock, and each needs pasture through winter. Could wealth in your life carry both increase and care?
- **1077 s druhou stranou:** Where the mountain track meets the pasture, the sheep come down with more lambs than they took up in spring, one still finding its footing. Fehu stands for wealth that grows through care. A larger flock can sustain you, but it can also be lost when keeping it becomes the only concern. Where might that balance appear in what you have now?

- **1154 produkce:** You stand where the sheep have come down from the mountain, their damp wool brushing the gate as you count more heads than you saw in spring. Fehu stands for wealth that grows through tending. You can see the flock is larger, but it still needs pasture. What you hold now may be a welcome reserve, or a living resource waiting to be used.
- **1154 s druhou stranou:** You stand at the gate as the sheep come down from the mountain, and their wet wool brushes your hand. You count more heads than you sent up in spring. Fehu stands for wealth that stays useful when it is cared for and allowed to move. What you hold may be a steady resource, or something kept so tightly it cannot serve.

- **1231 produkce:** A small tuft of wool catches on the gate as the sheep come down from the mountain, more of them than went up in spring. Fehu is the rune of wealth that grows while it is cared for. You can count the flock, but its wool still catches on the gate. What is in your hands may be both something to keep and something that needs room to move.
- **1231 s druhou stranou:** A small hoofprint holds water beside the gate, where the sheep return from the mountain with more lambs than you counted in spring. Fehu is the rune of wealth that grows when it is tended and shared. Your fuller flock can still thin through careless keeping. What you hold now may be both shelter and a burden if it never moves.

### 3.2 Fáze — Raidho, 4 čtení, týž los, jen řádek fáze (owner „7. ok“), 4 volání
Řádek za hlavičkou tažené runy: „THE MOMENT OF THE RUNE IN THIS READING: <fáze> — <co znamená>“ (znění CODE-read z textu, který owner poslal 2026-10-26).
1. Obraz z banky je ve všech čtyřech týž (chůze přes zasněženou pláň, přestaneš počítat kroky); fáze mění, co se v něm řekne, ne obraz.
2. Odpor a vrchol přinesly vlastní pohled (vrchol: tak silný rytmus, že si nevšimneš změny terénu; odpor: když se rytmu bráníš, každý krok
   zase počítáš). Nástup a přechod jsou blízko výchozímu čtení.
3. Slovo z řádku se vyslovilo: „At its height“, „At this turning“ (2/4) — totéž jako štítky v DESIGN „Slova“ bod 3.

- **nastup:** At the edge of the snowy heath, your steps begin to fall into a rhythm, and you stop counting them. A little snow still clings to the edge of your boot. Raidho stands for finding a natural pace rather than forcing one. Could this be the beginning of a steadier rhythm in something you do each day?

- **vrchol:** Where counting gives way to walking, you cross the snowy heath with your boots settling into the same worn prints. Raidho stands for a natural rhythm that carries movement without constant effort. At its height, that rhythm can grow so strong that a change in the ground passes unnoticed. Where might a familiar pace carry you well, yet leave little room to notice a change?

- **prechod:** On the snowy heath, your counted steps give way to an even pace, while a thin crust of snow breaks beneath your boots. Raidho stands for finding a natural rhythm as you move. At this turning, the counting falls away, but the path remains underfoot. Where in your life might a steady pace be taking the place of careful measure?

- **odpor:** At the edge of the snowy heath, your counting gives way to the sound of your boots settling into an even pace. Raidho stands for moving at a pace you can keep. When you push against that rhythm, each step becomes something to measure again. Where might you be counting what could simply carry you forward?

### 3.3 Konec u Reflection: otázka z významu runy, která se dotkne života — Raidho, 3 čtení (owner 2026-11-10 „9. reflection, zkus to“)
Produkční konec `ENDING_OPEN[2]` nahrazen: „End on one open question that grows from the meaning of {R} and touches what this may be {L} — one that different
readers could take in different ways, never something you know about them.“ Seeking Reflection, jinak produkce.
1. Otázka vychází z významu (rytmus, tempo) 3/3, žádné tvrzení o čtenáři.
2. Začátek otázky je šablona: „Where in your life…“ 3/3.

- **reflection-1:** At the edge of the snowy heath, your careful steps become an even walk, with snow gathering in the seams of your boots. You stop counting as the distance passes underfoot at its own pace. Raidho stands for finding a natural rhythm rather than measuring every step. Where in your life does the pace feel less forced?

- **reflection-2:** You cross the snowy heath, and the faint creak under your boots fades from notice as you stop counting steps. Raidho stands for finding a natural rhythm rather than forcing a pace. Your feet still meet the same ground, but each step no longer needs measuring. Where in your life does the pace feel easier when you stop counting?

- **reflection-3:** A thin crust of snow breaks beneath your boot, then the next step falls without counting. Across the heath, you keep walking, and the small crunch of each step settles into a pace you can hold. Raidho is the rune of finding a rhythm that fits the ground beneath you. Where in your life does your pace feel like your own?

### 3.4 Konec u Confirmation: tři tvary místo dvou možností — Raidho, týž los (owner „confirmation všechny 3 varianty chci vidět“)
(a) runa podpoří · (b) podmínka · (c) kde se to ukáže ve dnech. Znění ve vstupu úloh ve scratchpadu session; produkční konec `ENDING_OPEN[1]` nahrazen.
1. Všechny tři skončily u téže věci („…where you want to go“) — týž los, liší se jen tvar.
2. (a) zní krkolomně („It supports your sense of whether…“); (b) čistě; (c) opsal slova pokynu „In ordinary days“.

- **confirmation-a:** At the edge of the snowy heath, you leave the last dark stones behind and follow a faint track across the white. After a while, you stop counting steps, and your boots fall into an even rhythm. Raidho stands for finding a pace you can keep. It supports your sense of whether this road still leads where you want to go.

- **confirmation-b:** At the edge of the snowy heath, your boot leaves firm ground for a narrow track. You walk until the soft crunch beneath your feet becomes steady, and you stop counting the steps. Raidho stands for finding a natural rhythm as you move. That rhythm holds only if the track still leads where you want to go.

- **confirmation-c:** At the edge of the snowy heath, your measured steps become a steady walk, and you stop counting them. Snow gathers in the seam of your boot as you cross the open ground. Raidho stands for a natural rhythm that leaves room to notice where you are going. In ordinary days, you may notice whether a familiar routine still takes you where you want to go.

### 3.5 Druhá strana — Raidho, 3 čtení (owner: Fehu obraz na zkoušení není dobrý, „dej mi jen 3 čtení s druhou stranou“)
1. Druhá strana 3/3 bez nálepky (zdržení, tempo, které nerozhoduje o směru, jdeš, protože jsi začal).
2. U čtení 2 a 3 padla do konce, který dnes losuje „may be X, or Y“.

- **stin-raidho-1:** Where the snowy heath meets your next step, a shallow print catches blue shadow, and the long walk settles into a pace you no longer count. Raidho stands for finding a natural rhythm as you move. A delay can break that rhythm without meaning you have lost direction. Where in your life might a slower pace still carry you forward?

- **stin-raidho-2:** You cross the snowy heath, and your boots begin to fall into an even pace as the wind brushes loose snow from your tracks. Raidho stands for movement that finds its natural rhythm. You no longer need to count each step, but a steady pace does not settle where the road leads. You may be moving toward something you want, or simply keeping pace with a choice you once made.

- **stin-raidho-3:** A thin crust of snow breaks beneath your heel, and the next step follows without a count. Across the heath, your pace settles into the distance before you. Raidho is the rune of finding a natural rhythm as you move. Your steady pace may carry you toward something you want, or keep you walking because you began.

### 3.6 Fáze — Isa (těžká runa), 4 čtení, týž los (owner „fáze vypadá dobře, zkus 4 čtení pro Isa“)
1. Každá fáze dala jiný okamžik v témže obrazu (sníh padá bez větru): začínající ticho · ticho, které zakryje, co je důležité · pauza,
   která se mění v konec · tlačení proti klidu. Slovo pokynu vysloveno 1/4 („At its turning“).

- **faze-isa-nastup:** You can see where the dark ground turns white as snow falls straight down without wind, gathering along the edge of a stone. Isa stands for stillness beginning to take hold. The stone remains visible, though its edges grow less distinct beneath the quiet fall. Where in your life might a pause be starting before you have noticed it?

- **faze-isa-vrchol:** At the edge of your doorstep, the last dark strip of stone turns white as windless snow falls straight down. You hear nothing as it covers the threshold, and the line between outside and inside grows harder to see. Isa stands for stillness held so firmly that it begins to hide what matters. Where might stillness be covering a line you need to see?

- **faze-isa-prechod:** Where the dark path meets the white, snow falls straight down, and the last visible footprints disappear without a sound. Isa stands for stillness, the pause before anything takes a new shape. At its turning, even the marks that seemed fixed grow harder to see beneath the snow. Could a pause in your life be changing into an ending?

- **faze-isa-odpor:** At the edge of the path, windless snow turns dark ground white, settling over your footprints without a sound. Isa stands for stillness that cannot be hurried. When you push against it, you may keep crossing the same ground, trying to leave a mark that the snowfall quietly covers. Where might you be pressing for movement when nothing is moving?

## 4. Pokyny ownera k obrazům (2026-11-10), zatím neudělané
1. Obraz Fehu (ovce se vracejí z hor) není na zkoušení dobrý: člověk těžko pochopí, co mu čtení říká; Fehu je runa, na kterou si lidé stěžují
   nejčastěji („bohatství v pohybu“). Ovce z hor je dobrá, špatné je, jak je obraz vytvořený. Fehu předělat v obrazech podle nových významů.
2. Raidho (chůze, stopy ve sněhu) je obraz, který člověk zažívá často, hravý a zajímavý.
3. Udělat rozbor obrazů v bance: vyřadit ty, které čtení zhoršují. Podklad: ownerova hlášení, kde psal, která čtení se mu líbí a která ne
   (poslední hlášení = čtení, která se mu líbila). Hlášení se čtou přes `node scripts/nacti_cteni.js` (CLAUDE.md §29).

## 5. Rozbor produkce: kolik místa bere scéna a kolik význam (2026-11-10, bez API)
Owner 2026-11-10: *„ve čtení je milion informací, které se tam model snaží napasovat, a rozbíjí to scénu. Scéna má být jednoduchá … obraz je většinou
dlouhý a model se ho snaží využít a popsat celý. Je to vůbec dobré? Chybí mi v tom jednoduchost.“* Zkoušky z oddílu 3 se tím zastavují; napřed ubrat.
Data: 42 single čtení EN ze solu z produkce od 2026-10-09 s uloženým losem (`prompt_draws`), 34 různých obrazů, 17 run. Skript ve scratchpadu session.
1. **Obraz ve vstupu má průměrně 14 slov (7–26); scéna ve čtení před první zmínkou runy 26 slov.** Model obraz zhruba zdvojnásobí.
2. **Model převypráví skoro celý obraz:** 71 % obsahových slov obrazu se vrátí ve čtení (kontrola s cizím obrazem 4 %), u krátkých i dlouhých obrazů stejně.
3. **Ve 20 ze 42 čtení zabere scéna dvě věty** a runa přijde až ve třetí; pak má scéna 33 slov ze 62. Když je runa ve větě 2, má scéna 19 slov.
   Úhel „out of sight“ [4] to dělá v 8 z 10.
4. **Delší obraz = delší scéna** (korelace 0,45); čtení s obrazem od 18 slov má skoro dvě věty scény, do 12 slov necelou jednu (n 5 a 20).
5. **Význam runy má jednu větu, průměrně 14 slov** — nejkratší část čtení. Konec 16 slov, k člověku („you“ 40/42, „may/might“ 32/42, otázka 8/42).
6. **Délka přetéká:** průměr 62 slov, 32 ze 42 nad 58. Vždy 4 věty.
7. Do čtyř vět jde průměrně 13,6 kusu promptu. Věta 1 nese obraz + úhel + „one detail the sentence does not name“; poslední nese konec + oblast +
   hledání + jméno + otázku runy.
Hranice: jen EN, jen sol, 42 čtení; „scéna“ = věty před jménem runy; shoda slov je hrubé měřítko (ověřeno kontrolou s cizím obrazem). Neříká, která čtení
jsou dobrá — to řeknou ownerova hlášení.

## 6. Zkouška ubráním: scéna na jednu větu (2026-11-10, owner „10. ano, zkus to“), 6 volání
Za řádek obrazu přidáno „The scene gets one sentence, no more.“; jinak produkce, tytéž losy. Raidho, Isa, Gebo, po jednom páru.
1. Scéna zůstala v jedné větě 3/3 a runa přišla ve větě 2 (v produkci 2/3; u Raidha až ve třetí).
2. Scéna se zkrátila jen málo: 23 · 16 · 19 slov proti 28 · 18 · 22. Jedna věta je pořád dlouhá. Celková délka beze změny (57–62 slov).
3. **Změnila se věta 3:** v produkci se vrací do obrazu („As the rail disappears…“, „Here, neither movement cancels the other“), s řádkem mluví
   o významu („You can walk steadily without knowing whether the direction still suits you“, „how quickly a gift becomes a debt when return is expected“).
   U Raidha a Geba je to druhá strana významu, i když ji vstup nedodal.
Hranice: 3 páry, jedno semínko, EN. Co zní líp, rozhodne owner.

- **raidho produkce:** You cross the snowy heath, and the wind smooths the edges of your footprints behind you. Your steps settle into a pace you no longer need to count. Raidho stands for the rhythm that carries you along a chosen road. Your pace may fit where you want to go, or it may belong to a road you no longer choose.
- **raidho scéna na jednu větu:** You cross the snowy heath, and your boots fall into an even pace as a crust of ice gives way beneath each heel. Raidho stands for finding a natural rhythm in movement. You can walk steadily without knowing whether the direction still suits you. Your pace may belong to a road you still want, or one you keep walking because you began.

- **isa produkce:** You stand beneath a windless snowfall, watching flakes settle straight down onto a fence rail without a sound. Isa stands for stillness, when movement has stopped but nothing is settled. As the rail disappears beneath the snow, you can still make out its shape. What is not moving in your life may be stuck, or it may be clearer when left undisturbed.
- **isa scéna na jednu větu:** You stand where windless snow falls straight onto the path, covering your footprints without a sound. Isa stands for stillness that leaves things as they are. When nothing moves, you can see the shape of what remains, though the snow makes its edges harder to judge. In your life, something may be at rest, or something may be stuck.

- **gebo produkce:** You stand at the shore where a wave leaves a dark line of sand, then draws grains back as it falls away. Gebo stands for the give and take that does not always settle at once. Here, neither movement cancels the other. Perhaps you are giving without a promise of return, or receiving something you cannot yet repay.
- **gebo scéna na jednu větu:** You stand where the sea leaves a dark strip of sand, then draws back with a few small stones. Gebo stands for the give and take between people, without keeping score. You can notice how quickly a gift becomes a debt when return is expected. Perhaps you can give without a promise, or receive without immediate repayment.

## 7. Návrh: význam vede, obraz ho ukáže (CODE-read 2026-11-10, čeká na ownera)
Owner 2026-11-10: *„obraz slouží k popisu významu runy v životní situaci. Popis runy, její význam je pak to, co tvoří zbytek čtení“* · *„převzít V3, ale
využít toho, že v2 funguje, a aplikovat ho na něj … potřebuju vytvořit návrh, jak by to mohlo vypadat.“* Dřívější výroky téhož: 2026-10-23, 10-24, 10-27,
10-28 (krok 28), 11-04, 11-10 (přepis konverzace).

### 7.1 Princip
Dnes ve v2 vede obraz: vylosuje se z banky, model ho převypráví a rozvede (26 slov z 62, oddíl 5) a runa ho jednou větou vyloží; třetí věta se vrací do obrazu.
Návrh obrací pořadí vzniku, kostra v2 zůstává:
1. **Kód vylosuje jeden úhel významu runy** (z moderních významů), i s jeho druhou stranou.
2. **K úhlu patří obraz:** jedna krátká životní situace, ve které se ten úhel děje. Obraz je v bance přivázaný k úhlu, ne k runě obecně.
3. **Čtení:** scéna v jedné větě → runa a její význam → runa dál (druhá strana, jak to chodí) → konec podle hledání.

### 7.2 Co se v promptu v2 mění (tři věci) a co zůstává
| | dnes | návrh | opora |
|---|---|---|---|
| A. význam | „focus on: <slovo>“ podle obrazu | význam pro tohle čtení + kde se kazí (u těžké runy světlá strana), z dat | druhá strana 3/3 bez nálepky (3.1, 3.5) |
| B. scéna | celý obraz + úhel otevření + „přidej detail“ | krátký obraz k úhlu, „scéna dostane jednu větu“; **los otevření zůstává** (úhly v2 + poloha člověka s „Imagine“, zadání G48, A7); „one detail“ ven | scéna v jedné větě 3/3 a věta 3 přešla k významu (oddíl 6); úhel [4] dělá dvě věty scény 8/10 (oddíl 5) |
| C. věta po runě | často návrat do obrazu | mluví o runě: druhá strana významu | oddíl 6 bod 3 |
Zůstává: los (úhel významu místo slova obrazu, sloveso věty o runě, jméno), konec podle hledání, oblast vybírá obraz, délka, formát, ✦, charakter, korekce.
Neověřeno: jestli „one detail“ nechybí proti opisování obrazu (EVAL_LOG 2026-09-23 (9)); který úhel otevření scénu natahuje (úhel [4] 8/10, oddíl 5).
⚠️ 2026-11-11: první verze návrhu úhel otevření vyřadila — proti ownerovu rozhodnutí G48 („otevření se losuje jako ve v2, Imagine je jedna z možností“). Opraveno.

### 7.3 Data, která to potřebuje
Na runu 3–4 úhly významu; ke každému druhá strana a 2–3 krátké situace (do ~12 slov). Začít třemi runami (Fehu, Raidho, Isa), obsah schvaluje owner;
obrazy z dnešní banky, které k úhlu sedí, zůstanou, ostatní se přepíšou (oddíl 4).

### 7.4 Jak by čtení vypadalo — ukázky napsal CODE-read, ne model (jen tvar; rozhodne zkouška na solu)
⚠️ **Dvakrát opraveno.** 2026-11-10: obraz ovcí u Fehu, který owner odmítl, a staré významy. 2026-11-11 první oprava: významy už z tabulky, ale všechny tři
obrazy byly příroda (owner: obraz = význam runy **v životní situaci**; zadání C15 asi půl na půl), chyběla poloha člověka (A7), všechny konce byly otázka,
ač konec řídí hledání, a nebylo vidět, kudy vstupuje hledání. Owner: *„co ještě jsi neudělal, jak jsem chtěl? Máš to udělat pořádně!“*
Význam a druhá strana = slova z `../2026-10-23-v3-charakter/moderni-vyznamy-25-zdroj.md`.
| runa | význam (úhel) | druhá strana | obraz | poloha (los) | hledání → konec |
|---|---|---|---|---|---|
| Fehu | Bohatství a zdroje → hojnost, oběh | hromadění | životní situace, nová: zahrada dá víc rajčat, než dům sní | B: „Imagine“, někdo jiný | Clarity → jedna věta |
| Raidho | Cesta a pohyb → směr | bezcílný pohyb | Island: stopy ve sněhu v jedné linii (banka v2) | A: „Imagine“, čtenář uvnitř | Reflection → otázka |
| Isa | Zastavení → čekání, klid | zablokování | životní situace, nová: vlak zastaví mezi stanicemi | C: bez „Imagine“ | Confirmation → podmínka (tvar b z 3.4, nevybráno) |
- **Fehu:** Imagine someone whose garden gives more tomatoes than the house can eat, so bags of them go round to the neighbours. Fehu stands for abundance,
  for having more than you need. Kept in the kitchen, the same tomatoes would only rot. Plenty may be most yours at the moment it leaves your hands.
- **Raidho:** Imagine you stop at the top of the pass and look back: your tracks in the snow make one line down the valley. Raidho represents direction,
  movement that is going somewhere. Without direction you can walk all day and only add tracks. If you looked back today, what line would your steps make?
- **Isa:** A train stops between two stations, and after a while people put their phones away and look out of the window. Isa stands for the standstill,
  a wait that pushing does not shorten. The same stop turns into being stuck when the doors open and nobody gets up. This pause holds as rest only if you
  would move once the way opens.

### 7.5 Co návrh a ukázky ještě nesplňují (kontrola proti `zadani-v3.md` a ownerovým zprávám 11-09 až 11-11)
1. **Oblast a záměr** v ukázkách nejsou (owner 11-10: „všechno je odvozené od toho, co za vstupy jdou do čtení, plus area, seeking, intention“). Návrh: oblast vybere
   obraz k úhlu (G52), záměr dá čas scény (krok 36) — neukázáno, nezkoušeno.
2. **Nové obrazy (rajčata, vlak) nikdo neviděl ani neověřil:** neprošly slepou kontrolou, jestli nesou runu (krok 45), ani ownerem. Fehu má ownerův pokyn
   i na druhý úhel — hodnota jako práce, pozornost, ruční výroba (F46) — ten tu není.
3. **Tabulka moderních významů je od GPT a není ověřená** (F32).
4. **Ukázky nejsou poměřené s ownerovými vzorovými větami** (`../2026-10-23-v3-charakter/cil-a-vzory.md`, F33).
5. **Ownerova hlášení** o čteních, která se mu líbí a nelíbí, nejsou přečtená; **rozbor banky obrazů** neudělán (oddíl 4).
6. **Isa** je ve v2 těžká runa (konec bez útěchy, u druhé strany světlo); tady vedená jako ostatní — rozhodnutí ownera chybí.
7. **Otevřené z dřívějška:** tvar konce pro Confirmation (3.4) a Reflection (3.3), fáze (3.2, 3.6) — owner ještě nevybral; humor až na konec.
8. Islandština ničeho z toho; všechno jen EN.
9. Ukázky psal CODE-read; jak to napíše sol, se neví.

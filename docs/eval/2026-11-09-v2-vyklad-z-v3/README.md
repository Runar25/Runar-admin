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

# Jak Rúnar skládá čtení a co s tím dělá model — podklad pro GPT a Gemini (2026-11-27)

**Vlastní jen:** vysvětlení pro konzultaci s GPT a Gemini — co se do čtení losuje, co zadá člověk, jak se tím mění zadání pro model
a podle čeho si model přidává vlastní slova. Stav kódu: commit, ve kterém tenhle soubor vznikl (prompt `RUNAR_PROMPT_VERSION` v2/runar-config.js).
Čísla v oddílu 4 a 5 jsou z [docs/kostra/VSTUPY.md](../../kostra/VSTUPY.md) (generováno 2026-11-24). Napsal CODE-read, bez API.

---

Ahoj. Píše Claude, který v projektu Rúnar měří, jak čtení vznikají. Níž je, jak přesně vzniká zadání pro model, co se v něm mění losem
a co vstupy člověka, a co model dělá s tím, co dostane. Je to popis, ne návrh. Kde něco nevíme, stojí to tam.

## 1. Co je čtení

Rúnar je průvodce runami. Člověk vytáhne runu a dostane **čtení: 4 krátké věty, asi 50–58 slov, jeden plynoucí odstavec**, předčítané hlasem.
Rúnar je **zrcadlo, ne věštec**: nic nepředpovídá, nic o člověku netvrdí, neradí. Věty mají role:

| věta | role | z čeho hlavně vzniká |
|---|---|---|
| 1 | **obraz** — jedna scéna, ve které je runa vidět | vylosovaný obraz + vylosovaný úhel otevření |
| 2 | **význam** — co runa je, srozumitelně | vylosované slovo významu + vylosovaný rámec věty („Kenaz stands for …“) |
| 3 | **dopad** — přenést to tam, kde člověk stojí | oblast a čas, které člověk zvolil |
| 4 | **otevření** — otázka nebo možnost, nechaná na člověku | tvar konce (los nebo podle toho, co člověk hledá) + otázka runy z Kolekce |

Model čtení: `gpt-6-sol` (v textu „sol“). Zadání se skládá **na serveru** ze stejných funkcí jako v appce; los dělá server.

## 2. Co do zadání vstupuje

**A. Co dá člověk** (nepovinné — bez nich se čtení udělá taky):
- **oblast** (8 možností: Love & Relationships, Purpose & Path, Career & Creativity, Healing & Wellbeing, The Unseen, Family & Home,
  Inner Growth, Crossroads & Decisions)
- **co hledá** (General Guidance, Clarity, Confirmation, Insight into Challenge, Reflection)
- **pro kdy** (Right now, Decision ahead, Understanding the past)
- **jméno** a **životní runa** (z data narození, jen jako tiché pozadí)

**B. Co se losuje** (pokaždé znovu, nezávisle na člověku):
- **obraz** — z banky obrazů **té runy**; banka je rozdělená podle ročního období a **oblast vyřadí obrazy, které k ní nepatří**.
  Losuje se „ze sáčku“ (tentýž obraz se člověku hned nevrátí) a dva obrazy stejného motivu nejdou po sobě.
- **slovo významu** — jde s řádkem obrazu (např. obraz kovárny → „fire“, žhavé uhlíky → „inner light“). Stojí v hlavičce „focus on: …“.
- **úhel otevření** — jeden ze 6 způsobů, jak vstoupit do obrazu (seznam v oddílu 3).
- **rámec věty významu** — „stands for“ / „signifies“ / „represents“ … a k němu sloveso z doložených textů o runách.
- **podoba oblasti** — oblast má několik podob (např. u Family & Home „family ties“); losuje se jedna.
- **tvar konce** — dvě možnosti / jedna možnost / otázka …; když člověk zvolil „co hledá“, tvar se řídí tím.
- **kde padne jméno** (u člověka se jménem).

**C. Co dává runa sama:** jméno runy, její **otázka z Kolekce** (pro konec) a klíčová slova runy.

## 3. Jak se zadání mění — skutečný příklad (Kenaz, vypsáno produkčními funkcemi, nic se nevolalo)

**3a. Bez vstupů člověka** (los: úhel 1, obraz kovárny, slovo „fire“, konec „dvě možnosti“). Celé zadání čtení:

```
DRAWN RUNE: Kenaz — focus on: fire
READING ANGLE (follow this entry point — let it shape the opening and tone): Open on the smallest detail in the image, the part someone would walk past.
THE IMAGE
Rúnar uses one image per reading and carries it through; he does not list images. A second picture earns its place only when it takes the first one further — the same scene, one step on. Two unrelated pictures side by side say nothing. Never a simile stacked on a metaphor. The image must connect to where this person is standing right now — atmosphere on its own is decoration, not a reading. Keep to what the image shows. Add a new object, person or event only when the reading needs it; anything else just lengthens the reading and takes room from what matters.
IMAGE — the picture in this reading comes from here: The forge glows in the dark shed and the iron takes its shape. Let it become your own seeing in the text, down to one detail the sentence does not name.
THE ESSENCE LINE: after the picture, one short line that begins "Kenaz stands for" and says which side of the rune this picture holds — its sense in plain words a stranger to runes can grasp. The seeker knows only the words of the reading, not the picture behind them: keep the line on the rune's own sense, not on what happens in the scene. No invented mechanism, no fate. Never tell the seeker what it means for them.
NO COLD READING: never tell the seeker what is true, stirring, or known inside them — that is an unfalsifiable guess wearing the clothes of knowledge. Describe the image; their inner life is not yours to narrate. The world is not arranging itself around them either: no omen, no preparation, no destiny at work.
One flowing reading — 4 short sentences, 50 to 58 words total. It will be read aloud, so keep every sentence lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.
Mention Kenaz by name once, woven naturally. One clear insight is enough — do not pack everything in.
End on one line that holds out two things this may be in the seeker's life, each a state that may be so, left for them to weigh. Let it grow out of the rune's question ("what do you see more clearly than before — and what will you do with it, now that you cannot look past it?"), but say it in your own words.
Output format — return ONLY this JSON array, nothing before or after: [{"rune": "(the rune name)", "text": "(the reading exactly as instructed above, one flowing paragraph)"}]
Length, once more: the reading itself is 4 short sentences, 50 to 58 words.
```
(Nad tím je ještě systémové zadání s postavou a hlasem Rúnara — to se losem ani vstupy nemění.)

**3b. Táž runa, člověk zvolí Family & Home + Clarity + Decision ahead.** Změněné řádky (+ přibylo, − zmizelo):

```
- DRAWN RUNE: Kenaz — focus on: fire
+ DRAWN RUNE: Kenaz — focus on: inner light
+ READING PURPOSE: Decision ahead — about what lies ahead; speak of what may come, not as prophecy
- IMAGE — … The forge glows in the dark shed and the iron takes its shape. …
+ IMAGE — … The embers stay alive under the ash until morning. …
+ The reading is for Family & Home — let the image you were given land on family ties and belonging. Do not tell them what they carry from their people.
+ Bring one thing into focus, not one answer; sharpen what matters and leave the deciding to them.
- End on one line that holds out two things this may be in the seeker's life …
+ End on one line that names what this may be in the seeker's family ties — a state that may be so, offered for them to weigh; it names how things may stand, never what to do about it. …
  (a rámec významu se změnil ze „stands for“ na „signifies“)
```
Co se stalo: **oblast vyměnila obraz** (kovárna k rodině nepatří, uhlíky pod popelem ano) a s ním i slovo významu; přibyl řádek oblasti,
řádek „co hledá“ (Clarity) a řádek času; konec se z „dvou možností“ změnil na jednu možnost v rodinných vazbách.

**3c. Stejné vstupy, jiný los.** Obraz zůstal (uhlíky), ale úhel se změnil z „nejmenšího detailu“ na „postav člověka dovnitř obrazu“
a rámec významu z „signifies“ na „represents“. Totéž zadání člověka tak dává pokaždé jinou první větu.

**Shrnutí:** vstupy člověka mění **výběr obrazu, větu 3 a konec**; los mění **obraz v rámci toho výběru, vstup do obrazu (úhel), rámec
věty 2 a tvar konce**. Žádný vstup se do čtení nedostává jako vysvětlení — model dostane jen tyto řádky.

## 4. Co model s jednotlivými vstupy udělá (53 skutečných čtení, EN, sol)

| vstup | čtení s ním | slovo převzal | věta 1 | věta 2 | věta 3 | věta 4 | doslova ≥ 3 slova |
|---|---|---|---|---|---|---|---|
| obraz | 53 | 100 % | 100 % | 43 % | 36 % | 25 % | 66 % |
| slovo významu | 53 | 74 % | 8 % | 36 % | 30 % | 8 % | 0 % |
| úhel | 53 | 74 % | 49 % | 25 % | 19 % | 19 % | 15 % |
| podoba oblasti | 23 | 96 % | 17 % | 13 % | 35 % | 78 % | 17 % |
| tvar konce | 53 | 94 % | 38 % | 25 % | 43 % | 77 % | 19 % |
| otázka runy | 41 | 93 % | 17 % | 37 % | 32 % | 78 % | 22 % |
| klíčová slova runy | 53 | 81 % | 23 % | 43 % | 43 % | 21 % | 0 % |

Čtení: obraz je v první větě vždy a ve dvou třetinách čtení z něj model vezme aspoň tři slova za sebou. Oblast, tvar konce a otázka runy
skončí hlavně v poslední větě. **Hranice:** jen angličtina, jen model sol, n = 53; shoda slov neříká, že slovo přišlo právě odtud
(stejné slovo může mít model i odjinud). Příčinu dokáže jen pokus, kde vstup odebereme.

## 5. Odkud model bere slova, která v zadání nejsou

V první větě (obraz) přidá model průměrně **5–7 vlastních slov** — slov, která nestojí v žádném vstupu. Podle čeho:

1. **Zadání to po něm chce.** Řádek obrazu končí *„down to one detail the sentence does not name“* — jeden vlastní detail je pravidlo.
   Další řádek ho brzdí: *„Add a new object, person or event only when the reading needs it.“*
2. **Úhel ukazuje na část obrazu, kterou věta obrazu nemusí mít.** Model ji dotvoří a u každého úhlu se mu vracejí jiná slova:

| úhel (pokyn) | čtení | vlastních slov ve větě 1 | slova, která se opakují |
|---|---|---|---|
| [0] jeden pohled na celek, pak zůstane jedna věc | 6 | 7,0 | see, only, moment, while, faint |
| [1] nejmenší detail, kolem kterého by člověk prošel | 6 | 7,5 | beneath, beside, thin, rests |
| [2] pohyb, který už probíhá | 15 | 6,5 | against, runs, ground, branches, wind, torn |
| [3] jediná věc, která stojí pevně, zatímco ostatní povolí | 7 | 5,4 | hand, fence, post, loose |
| [4] co je mimo dohled — pod, za, ještě nepřišlo | 10 | 7,2 | beneath (6×), cannot see, beyond, frost |
| [5] hrana, kde se jedno mění v druhé | 5 | 6,8 | reaches, still |
| [6] postav člověka dovnitř obrazu | 4 | 6,5 | — |

   Nejzřetelnější případ: úhel [3] u obrazu, ve kterém žádná pevná věc není, donutil model věc vyrobit (pant, dům, okno, sloupek plotu).
   Proto je od 2026-11-19 **mimo los**. Totéž hrozí u úhlu [1] a [4], když obraz nemá malý detail nebo nic skrytého.
3. **Krátký obraz se rozvine do scény.** Obraz z banky má kolem 12 slov; model k němu doplní místo a okolí (kitchen, stove, wall, ground,
   table). Nejvíc přidává u obrazů, které jsou spíš myšlenka než scéna (cibule, která se chystá pod zemí → 12 vlastních slov).
4. **Runa a její slova táhnou slovník vět 2 a 3** (klíčová slova runy 81 %, slovo významu 74 %).
5. **Model má vlastní oblíbená slova**, která se vracejí napříč runami i úhly: *beneath, still, thin, while, cannot see*. Ta nepřišla
   z žádného vstupu — jsou to jeho zvyky.
6. **Slova z pokynů se vyslovují.** Co stojí v zadání, sol často řekne doslova: „focus on: …“ se objevilo ve čtení jako hotová fráze,
   „Runes drawn“ jako „the rune drawn here“, sloveso z rámce věty 2 se převezme vždy. Proto píšeme do zadání jen slova, která by
   nevadila ani doslova ve čtení.

**Co nevíme:** u vlastních slov umíme říct, že **ve vstupu nejsou**, ne **proč** je model zvolil. Opakující se slovo u téhož úhlu je
stopa, ne důkaz. Pro islandštinu tohle měření nemáme (islandské tvary slov by bez rozboru zkreslily počty).

## 6. Proč to řešíme

Nový detail v obraze je chtěný, když scénu zostří; je vada, když vznikne jen proto, že úhel chtěl něco, co obraz nemá (pant u úhlu [3]),
nebo když model doplní dobu, která do dnešní scény nepatří (oheň a krb). Chceme umět **předem odhadnout, co model k danému obrazu
a úhlu přidá**, a podle toho buď obraz upravit, nebo úhel k obrazu nelosovat.

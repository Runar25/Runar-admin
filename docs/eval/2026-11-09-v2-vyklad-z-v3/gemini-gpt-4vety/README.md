# Rozbor: čtyřvětý výklad Gemini a GPT proti v2 (CODE-read, 2026-11-18)

Owner 2026-11-18: „dvě konverzace a snaha o vytvoření lepšího čtení. to, co máme v2. gemini dostal úkol jako první a pak docházelo k výměně
informací mezi gemini a gpt. originál je od gemini. gpt se to pokusil posunout dál. chci komplet analýzu a porovnání s v2. myslím si, že to,
jak gemini vytvořil první čtení a dál se to upřesnilo ve 4 větách, je hodně zajímavé.“
Zdroje (čteny celé 2026-11-18): Gemini <https://share.gemini.google/JEPDXK6hfxRL> · GPT <https://chatgpt.com/share/6afe0d86-2ccc-83eb-91e0-340ce61ddc89>.
Původní čtení Berkana je ownerovo produkční čtení z 2026-11-18 (v5.23, sol, single) — text je v konverzaci, ne tady (čtení do repa nepatří).
Obraz z banky, ze kterého vzniklo: *The birch sapling grows in the shelter of the older trees.* (`RUNE_IMAGES`, `v2/runar-character.js`).

## 1. Co proběhlo
1. Gemini: výklad Gebo a Ansuz podle ownerova zadání (metafora podstaty, napětí, cesty bez rady, otázky k sebereflexi) — dlouhé, nadpisy.
2. Owner dal Gemini produkční čtení Berkana z v2: „co mu chybí k dokonalosti?“ Gemini: chybí napětí (stín × úkryt), věta „Berkana is the rune
   of growth…“ je slovníková, „Perhaps…“ nechá člověka jen přihlížet, chybí zrcadlo. Nejdřív dlouhá přepracovaná verze, po ownerově „moc dlouhé“
   **čtyři věty** (58 slov): obraz s třením · přenos do života · dvě cesty „You can A, or B“ · ostrá otázka.
3. Gemini popsal, jak to postavil, a dal systémový prompt: 4 věty po 12–16 slovech, „yet / while / without“ v obraze, zákaz definovat runu,
   zákaz „perhaps“, jeden vzorový výklad (Berkana) na konec promptu, teplota 0,65–0,75. Podle něj tři ukázky: Isa, Raidho, Hagalaz.
4. GPT nad tím: skladbu přijal a oddělil věty od **funkcí** (obraz · význam · osobní rovina · otázka). Napětí ani dvě volby nejsou povinné;
   otázka „…or hiding from judgment?“ podsouvá problém. Tři ukázky Gemini rozebral: Isa a Hagalaz si vymýšlí život tazatele („In your current
   relationship, external calm has stopped the arguments“, „structures you spent months … building“), Hagalaz nutí pozitivní konec, Raidho
   klišé („journey“, „moving forward“). Přidal pravidla: význam nesmí být zaměnitelný mezi runami; nevymýšlet život; nevnucovat dobrý ani zlý konec.
5. Po ownerově popisu vstupů (oblast, co hledá, pro kdy; nápad „jak se cítím“; los významu bez opakování; volná otázka) GPT navrhl čtyři
   pohyby **IMAGE → MEANING → LANDING → OPENING**, osm pocitů (Lost, Uncertain, Stuck, Sad, Hopeful, Restless, Overwhelmed, At peace), konec
   podle toho, co člověk hledá, a pořadí vstupů: runa a vylosovaný význam > vlastní otázka > oblast a pocit > čas > co hledá (jen konec).
6. Gemini k tomu tři rizika: věta 2 sklouzne k učebnici · model vstupy vyjmenuje („Right now, while feeling lost in your career…“) ·
   Confirmation začne pochlebovat. A finální prompt „You are Rúnar…“ se dvěma ukázkami Berkana (Inner Growth + Lost · Clarity + otázka).

## 2. Co z návrhu už v2 dělá (ověřeno v kódu 2026-11-18)
| prvek návrhu | v2 | kde |
|---|---|---|
| obraz nese význam runy, model přidá detail | ano — obraz z banky, klíčovaný runou; v Berkaně model sám přidal „where their branches break the wind“ | `RUNE_IMAGES`, řádek IMAGE |
| obraz s napětím uvnitř | jen u části banky; lab napětí kola 1–4 přesně tohle dělá (svíčka, baterie…) | `docs/eval/…/napeti/` |
| věta o významu runy | ano — esenční řádek s losovaným slovesem doloženým v textech o runách | DECISIONS 2026-10-06 (10), 2026-09-30 (5) |
| dopad do oblasti | ano — obraz „dosedne“ na podobu oblasti (los ze tří) | `_domainContext`, `AREA_FACES` |
| konec podle toho, co člověk hledá | ano, pět řádků: Clarity „bring one thing into focus“ · Insight „name the friction“ · Reflection „open a mirror“ · General „let the rune lead“ · Confirmation „neither confirm nor refute“ | `_registerContext` |
| tvar konce: otázka / dvě možnosti | ano, losem | `_endingShape` |
| časová rovina | ano — teď / co přichází (ne jako proroctví) / co už je za tím | `_intentionContext` |
| nevymýšlet život tazatele | ano, měřené pravidlo | NO COLD READING, `RUNAR_DESIGN.md` |
| los významu | částečně — losuje se obraz a obraz nese slovo významu (Berkana: *growth*) | `RUNE_IMAGES` sloupec významu |
| délka | builder | `runar-character.js` |
**Nové proti v2:** jak se cítím (BACKLOG 10) · volná otázka pro všechny (v2 jen testovací) · vyslovené pořadí vstupů · konec jako **funkce**
podle hledání, ne jen řádek tónu · los významu „bez opakování do vyčerpání“ (paměť per uživatel v2 — neověřeno, jestli běží).

## 3. Co je na čtyřech větách dobré (můj soud, s doklady kde jsou)
1. **Každá věta má jinou práci** — v2 má tytéž kusy, ale v promptu rozeseté po blocích; čtyři pohyby je dávají do jednoho pořadí. Shoduje se
   s ownerovou stavbou z 2026-11-14 a 2026-11-17 (popis · napětí · cesta · otázka).
2. **Napětí v Berkaně je skutečné:** koruny chrání před větrem a berou světlo. Bříza je světlomilná a ve stínu strádá (obecně známé,
   zdrojem tady neověřováno). v2 čtení napětí nemá — konstatuje úkryt.
3. **GPT trefil dvě vady Gemini, které v2 už hlídá:** vymýšlení života tazatele a podsunutý problém v otázce („hiding from judgment“).
4. **„Význam nesmí být zaměnitelný mezi runami“** — to měříme slepými soudci run (lab napětí).
5. **Hagalaz bez nuceného dobrého konce** — sedí s kánonem, že runa nemusí přinést řešení ani naději.

## 4. Kde to na solu a v našem kánonu narazí
1. **Vzorový výklad v promptu (one-shot):** sol bez přemýšlení bere vstup doslova; co dostane, objeví se ve výstupu (`RUNAR_DESIGN.md`
   „Slova, která dáváme modelu“; memory „použij tenhle text = opíše“). Gemini sám píše, že model se řídí ukázkou víc než pravidlem — u nás to
   znamená bříza a „shade / light“ v každém čtení. Do promptu ne, nebo jen jako ověřená vzorová věta (DESIGN bod 10).
2. **„yet / while / without“ povinně v první větě:** sol si včera bez pokynu vytvořil šablonu 4 ze 6 (`../v3-bez-obrazu/README.md`); slovo
   vepsané do pokynu bude opakovat (předpoklad, neměřeno). Napětí patří do obrazu z banky (lab napětí), ne do spojky.
3. **Zákaz definovat runu** jde proti ownerovu směru: 2026-10-30 *„chybí vysvětlení toho, co může být samotná runa“*, 2026-11-17 *„první věta
   je popis, co je runa“*, a proti esenčnímu řádku v2. GPT chce význam bez slovníku — to je jemnější a slučitelné.
4. **Confirmation „validate the reality of what they already sense“** a příklad *„Tenhle neklid není chyba – je to znamení…“* = tvrzení o nitru
   + znamení. Kánon: „neither confirm nor refute“, NO COLD READING.
5. **„You can A, or B“ jako pevná třetí věta:** v Gebo a Isa je to rozcestník, který owner chce (BACKLOG 13); jako stálá věta je to druhá
   šablona. GPT to říká taky („dvě volby nejsou povinné“).
6. **Osm pocitů:** Sad a Overwhelmed jsou blízko krize — pravidlo bezpečnosti v charakteru; riziko přitakávání (BACKLOG 10).
7. **Teplota 0,65–0,75:** v2 teplotu nenastavuje (`claude-proxy`); jestli ji gpt-6-sol bez přemýšlení přijímá a co dělá, neověřeno.
8. **Počty slov po větách (12–16):** Gemini sám říká, že modely slova nepočítají; v2 má délku v builderu a měřenou.

## 5. Berkana čtyřikrát (EN, slova počítána ručně)
| verze | obraz | význam | do života | konec | tvrdí něco o čtenáři? |
|---|---|---|---|---|---|
| v2 produkce (61 + ✦) | úkryt, bez napětí | „Berkana is the rune of growth…“ | práce, dovednost roste opakováním | „Perhaps your craft…“ | ne |
| Gemini 4 věty (58) | „sheltered from the wind, yet starved of full sun“ | bez definice | tvorba, kořeny před ukázáním | dvě cesty + „…or hiding from judgment?“ | ano, v otázce |
| Gemini A: Inner Growth + Lost (56) | týž obraz jako v2 | „real growth often happens below the canopy…“ | „feeling without a clear direction…“ | „What quiet shift … have you stopped noticing?“ | opakuje pocit, který člověk zadal |
| Gemini B: Clarity + otázka (60) | týž obraz | úkryt × stín | odpověď na dilema dvěma cestami | „…protecting unready craft, or hiding from judgment?“ | ano, v otázce |

## 5b. Zkouška na solu: čtyři pohyby bez definice runy (2026-11-18, 3 volání)
Owner: *„5. zákaz definice … chtěl bych zkusit čtení bez té definice … chci vidět čtení od SOL a rozhodnu se“* · *„7. … úplně mi stačí
3 čtení“* · *„9. určitě, jak řekl gemini“*. Skladatel `sloz_4pohyby.js`, úlohy `ulohy.json`, texty `ulohy_vysledky.json`; produkční zadání
v2 vypíše `vypis_v2.js`.
1. **Co se změnilo proti v2:** systém beze změny; ze zadání v2 zůstaly losy a vstupy (slovo významu, záměr, úhel otevření, podoba oblasti,
   NO COLD READING). Pryč blok THE IMAGE, esenční řádek, jméno runy, délkový řádek a konec; místo nich čtyři pohyby (obraz · význam · dopad ·
   otevření) a konec jako funkce podle hledání. Zdroj významu = jednovětý mechanismus runy z labu napětí (`../napeti/kolo4/kandidati.json`),
   označený „not words to repeat“. Bez vzorového výkladu, bez povinného „yet“. Obrazy: Berkana z banky (táž věta jako ownerovo čtení
   2026-11-18), Raidho a Hagalaz z kola 4.
2. **Vstupy:** Berkana · Career & Creativity · General Guidance · Right now — Raidho · Purpose & Path · Clarity · Decision ahead —
   Hagalaz · Inner Growth · Insight into Challenge · Understanding the past.
3. **Měřeno:** 4 věty 3/3 · 60, 61, 60 slov · runa nejmenovaná ani definovaná 3/3 · doslovný úsek z mechanismu runy nejvýš 2 slova.
4. **Čteno:** obraz má vlastní detail 3/3 (bříza prorůstá stínem · motor drží stejný tón · stonky ohnuté k mokrému kameni). Berkana sama
   našla napětí, které Gemini chtěl (úkryt × „may also keep it out of sight“) — v bankovní větě není. Význam (věta 2) je blízká parafráze
   mechanismu (Raidho „You find a rhythm by going“ ← „a rhythm is found only by moving“). Raidho otázka převzala slovo významu z losu
   doslova („natural rhythm“). Žádné tvrzení o životě čtenáře, žádná rada.
5. **Hranice:** n = 3, jen EN, jedno čtení na runu, bez srovnávací trojice v2 na týchž losech (owner chtěl 3 čtení).

## 5c. Z čeho čtení Berkana (5b) vzniklo — věta po větě (owner 2026-11-18: „popiš mi, jak a z čeho to čtení vzniklo“)
Model dostal dvě zprávy: **systém** (354 slov, produkce beze změny: kdo je Rúnar, jak mluví — věta o jedné klauzuli, nikdy rada ani
závěr, druhá osoba, zakázané fráze) a **zadání** (361 slov, `sloz_4pohyby.js`). Bez přemýšlení, 85 slov výstupu.
| věta čtení | co ji dalo (řádek zadání → co z něj je ve větě) |
|---|---|
| *You stand beneath older birches, where a sapling reaches through their shade.* | úhel otevření z losu „setting the seeker inside the image“ → *You stand* · obraz z banky „birch sapling … shelter of the older trees“ → bříza, starší stromy · pohyb 1 „one detail the sentence does not name“ → *reaches through their shade* (úkryt přeložil na stín = napětí, které chtěl Gemini) |
| *You can see how new growth sometimes depends on room and shelter, not on being hurried.* | slovo významu z losu *growth* → *new growth* · mechanismus runy „given room rather than forced“ → *room … not on being hurried* (parafráze) · pohyb 2 „what the picture reveals about human experience“ |
| *In what you make for others, care may give a small beginning time to take hold, though it may also keep it out of sight.* | podoba oblasti z losu (Career & Creativity) „what is made for others“ → *what you make for others* doslova · mechanismus „new small life and the care“ → *care, small beginning* · pohyb 3 „a possibility, a tension, or two sides“ → *may … though it may also* · NO COLD READING → vše v „may“ |
| *What seems ready for more light now?* | konec podle hledání (General Guidance) „open, as a question, what may deserve attention now“ · záměr Right now → *now* · *light* navazuje na stín z věty 1 |
Ze systému je vidět: druhá osoba, krátké věty, žádná rada, žádný závěr. Ze zadání se nepoužilo nic navíc — každý kus věty má zdroj v řádku.
**V2 pro srovnání** (týž obraz, ownerovo čtení 2026-11-18): esenční řádek zadal *„… begins ‚Berkana stands for' and gives the meaning the
picture already holds“* → odtud *„Berkana is the rune of growth…“*; konec „dvě možnosti, které to může být“ → *„Perhaps…“*. Napětí v zadání
v2 není, proto ho čtení nemá.

## 5d. Zdroj významu: jen slovo × dvě strany runy (owner „2. zkus obě varianty“, 6 volání)
Skladatel `sloz_zdroj.js`, úlohy `ulohy_zdroj.json`, texty `ulohy_zdroj_vysledky.json`. Stejné losy a vstupy jako 5b; mění se jen řádek zdroje.
Dvě strany = věty z ownerova popisu v `RUNAR_POPISY_RUN.md` (citace u každé úlohy v `_zdroj_stran`).
| | jen slovo | dvě strany |
|---|---|---|
| 4 věty, runa nejmenovaná | 3/3 | 3/3 |
| slova | 66, 60, 64 | 62, 59, 64 |
| slovo významu z losu doslova ve čtení | **3/3** (*growth*, *A natural rhythm*, *Disruption*) | 0/3 |
| nejdelší doslovný úsek ze zdroje | 1–2 slova (= to slovo) | 2, 2, 4 (*a force no one*) |
| kterou stranu model vzal | — | Berkana 1 (malé není slabé) · Raidho 2 (směr) · Hagalaz 1 (síla, kterou nikdo neřídí) |
Čteno: se slovem je věta 2 obecnější a slovo v ní stojí jako štítek (*„Disruption can take in a minute what care has built“*). Se stranami
jsou věty 2 vlastnější a strany se liší od mechanismu z 5b (Berkana mluví o malém začátku, ne o péči). Hagalaz „strany“ ale věta 2 opsala
skoro celou stranu (*„a force no one could have steered“*). n = 3 na variantu, jen EN.

## 6. Hranice
1. Ukázky Gemini a GPT psal model **s přemýšlením**, ne sol bez něj; jak by je napsal sol, neví nikdo — rozhodne zkouška.
2. Nic tu nebylo puštěno. Soudy v oddílech 3–4 jsou moje čtení textů a doklady z dřívějších měření, kde jsou uvedeny.

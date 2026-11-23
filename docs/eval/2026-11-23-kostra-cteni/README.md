# Kostra čtení (single) — návrh k potvrzení (CODE-read, 2026-11-23)

Owner 2026-11-23: *„těch verzí, jak má vypadat čtení, bylo určitě víc, a proto potřebujeme udělat základní kostru, na kterou můžeme nabalovat …
pokud se někde objeví konflikt, musí se vyřešit … od začátku promptu až po samotný konec. nic nevynechej.“*
**Stav:** návrh. Po ownerově potvrzení se přesune do `RUNAR_DESIGN.md` (ten vlastní stavbu čtení) a zastaralé pasáže tam odejdou (oddíl 7).
**Zdroje:** celý `RUNAR_DESIGN.md` + paměť + `docs/postup-obraz.md` · `RUNAR_DECISIONS.md` od 2026-06 do 2026-11-23 + `RUNAR_BACKLOG.md` ·
laby `docs/eval/2026-10-23-v3-charakter/`, `docs/eval/2026-11-09-v2-vyklad-z-v3/` · ownerovy zprávy 2026-08-17 → 11-23 ·
produkční kód `v2/runar-character.js` (single builder, registr kusů `_kus`) · Gemini „Anatomie správného psychologického výkladu“ (11-23).

## 1. Tři patra
| patro | co v něm je | jak se mění |
|---|---|---|
| **A. Jádro** | kánon: zrcadlo ne orákulum, bez tvrzení o člověku, bez rady, hlas | nemění se (jen novým datovaným rozhodnutím ownera) |
| **B. Kostra** | 4 věty, každá se svou prací · ✦ · Ask | mění se rozhodnutím, ne pokusem |
| **C. Nabalování** | vstupy člověka a losy, které plní věty | přidává se jako nová položka losu a měří se |

## 2. A — jádro (platí pro každou verzi čtení)
1. **Zrcadlo, ne orákulum** — žádná předpověď ani jistota; ani náznak skryté znalosti (`RUNAR_DESIGN.md` „Rúnarův rejstřík“).
2. **Bez tvrzení o člověku** — definice 2026-10-16 (5): vada = oznamovací věta o jeho pocitech, vědění, situaci („to o mně není pravda“) ·
   v pořádku = otázka, přání, nabídka, obecná pravda · konstatování = co sám zadal, nebo fyzický důsledek v obraze. Prostředí, které má každý
   (domov, práce), není tvrzení; stav v něm podaný jako fakt je (2026-09-24, „ta Isa je špatně“). „you“ samo není vada.
3. **Bez rady** — postoj ano, krok do života ne. „Look closer…“ rada není (owner 2026-09-23).
4. **Jeden obraz, jedna scéna**, představitelná dnes, bez archaismu a bez časové lhůty (2026-08-23, 11-02, 11-03, 11-19 (4)).
5. **Těžká runa nikdy útěchu** (`HEAVY_RUNES`, 2026-09-20).
6. **Hlas:** věcný, klidný, krátké věty; žádné klišé, žádná „journey“ jako růst, žádné vykřičníky (systémový prompt).
7. **Islandština** se píše islandsky od začátku a ověřuje nástroji (CLAUDE.md §2).

## 3. B — kostra: čtyři věty + ✦ + Ask
Owner 2026-11-18: *„4 věty je prostě tak akorát na to, abychom do toho dostali to, co by mělo každé runové čtení dělat silným … pak máme ASK,
který ho dokáže rozšířit … věta 1 je čistě obraz.“* Délka: 4 věty, strop slov drží (dnes 50–58 v pokynu, sol píše průměrně 62).

| věta | práce | z čeho vzniká (vstupy) | pravidla | dnes v produkci | otevřené |
|---|---|---|---|---|---|
| **1 OBRAZ** | jedna scéna, ve které je napětí runy vidět; čtenář se v ní může poznat | obraz z banky (klíčovaný runou, filtrovaný oblastí) · úhel otevření (los ze 6) | vlastní detail, který věta nejmenuje · nic navíc bez funkce · neopakovat obraz celý · bez vysvětlení | `ANGLE` + `IMAGE` (blok THE IMAGE) | obrazy kola 4 do banky? |
| **2 VÝZNAM** | co obraz ukazuje o runě — tak, aby to neplatilo o jiné runě | slovo významu z řádku banky · (lab: věta o runě / dvě strany z ownerova popisu) | ne slovník, ne obraz znovu · neříct, co to znamená pro člověka | `ESSENCE`: „<Runa> <sloveso>“, sloveso los (represents… is the rune of) | **R1** definice ano/ne · **R5** zdroj |
| **3 DOPAD** | přenést význam tam, kde člověk stojí (oblast, čas): možnost, napětí nebo druhá strana | podoba oblasti (los) · záměr = čas · (lab: druhá strana, cesta) | bez tvrzení o jeho životě · oblast nevyslovit jako štítek · druhá strana bez nálepky „stín“ (G55) | nic předepsaného; oblast je v řádku `AREA` (kam dosedne obraz) | **R3** cesta / rozcestník |
| **4 OTEVŘENÍ** | nechat to u člověka | hledání → tvar (`SEEK_SHAPE`), jinak los z 5 tvarů · těžká runa → těžké znění · otázka runy z Kolekce jako zdroj (ne u tvaru otázky) | žádná rada; otázka nesmí podsouvat problém; střídat tvary (owner 11-17 „alternovat, přesně jak děláme teď“) | `ENDING` | **R2** Confirmation |
| **✦** | jedna myšlenka na cestu, mimo 4 věty | odstavec runy z Kolekce | ≤ 12 slov · smí oslovit otázkou | `THOUGHT-✦` (podle účtu) | — |
| **Ask** | rozšíří věty 2–4 | otázka člověka · tipy podle tvaru konce | věta 1 je obraz, Ask se ptá dál | tipy nasazeny 2026-11-23 (2) | — |

## 4. C — nabalování: vstupy a losy, a kam míří
**Materiál člověka** (kotví): oblast → věta 3 + výběr obrazu · hledání → tvar věty 4 + řádek tónu · záměr → čas sloves · jméno → umístění (los:
střed / závěr / vůbec) · oslovení (IS rod) · *otázka — dnes jen admin* · *pocit — BACKLOG 10, nezkoušeno*.
**Materiál kostky** (rozbíjí stejnost): runa · obraz + slovo významu · úhel · sloveso esence · podoba oblasti · tvar konce · ✦.
**Pořadí přednosti při sporu** (sedí s kánonem „runa je základ, oblast je otázka“ a s GPT 11-18): runa a její význam > vlastní otázka >
oblast (a pocit) > čas > hledání (jen konec). Těžkost runy má přednost před tvarem z hledání.
**V produkci už NENÍ** (nevracet bez nového rozhodnutí): sezóna v promptu (09-20), životní runa ve čtení (09-25, jen Ask), element (10-10),
svět runy v hlavičce (09-25), priorita (08-22), úhel [3] „stays fixed“ (11-19), pole + rozprostírač (08-22).

## 5. Zadání od začátku do konce (produkce v2 dnes, pořadí z kódu)
**Systém:** kdo je Rúnar · vzhled · povaha · účel · jak mluví · co nikdy · postoj („Never hand the seeker a conclusion“) · jazyk a styl ·
hlas („He does not perform mysticism…“) · co se nemění („never tells the seeker what to do“).
**Zadání (17 kusů, každý nese v kódu, na kterou větu míří):** PERSON (jméno) · RUNE-MEANING (runa + slovo významu) → 2 · INTENTION → celé ·
ANGLE → 1 · IMAGE (THE IMAGE + obraz) → 1 · ESSENCE → 2 · NO-COLD-READING → celé · LENGTH · AREA → kam dosedne · SEEKING → tón ·
NO-QUESTION / QUESTION · ENDING → poslední · NAME-PLACEMENT · LANGUAGE · CORRECTIONS · ADDRESS · FORMAT · (THOUGHT-✦, LENGTH-REMINDER).
**Lab „čtyři pohyby“ (11-18)** dává totéž do jednoho pořadí: runa + slovo · čas · úhel · zdroj významu · obraz · 1 OBRAZ · 2 VÝZNAM · 3 DOPAD ·
4 OTEVŘENÍ · bez definice · NO COLD READING · délka · formát (`docs/eval/2026-11-09-v2-vyklad-z-v3/gemini-gpt-4vety/testovaci-balicek.md`).

## 6. Rozpory
### 6.1 Vyřešené podle novějšího ownerova slova (§20)
1. **Počet vět:** „3 nebo 4, není podmínkou“ (09-20) · „klidně 6–8“ (11-05) → **4 věty** (11-18).
2. **Co je věta 1:** obraz (08-18) · význam/definice (11-03, 11-04) · bez obrazu (11-17, odložený lab) → **věta 1 je obraz** (11-18).
3. **Obrazy v2:** „nepoužíváme“ (11-04) → **v2 je první místo** (11-14, 11-16), kolo 4 se přidává.
4. **Délka obrazu:** krátký „game changer“ (09-12) × dlouhý Raidho „dokonalé“ (09-15) → **kratší, jednoduchost** (11-10, 11-14, 11-15; kolem 12 slov).
5. **v3:** „zelená louka“ (10-23) → **vylepšená v2, základ je v2** (11-14).
6. **Stín / druhá strana:** mimo 4 věty (10-30) · 3. věta (11-03) → **uvnitř, bez nálepky** (11-05 G55).
7. **Oblast:** vlastní věta (09-20) · vlastní část po čtení (10-24) → **bez vlastní věty, dopad ve větě 3** (11-05 G52; v produkci řádek AREA).
8. **Konec:** otázka v každém čtení (10-28) → **střídat tvary** (11-17).

### 6.2 Otevřené — rozhoduje owner
- **R1 Definice runy ve větě 2:** owner 09-15 „Fehu is wealth nezakazovat“, 10-30 „chybí vysvětlení, čím runa sama je“, 11-17 „první věta je
  popis“ × 11-18 „chtěl bych zkusit čtení bez té definice … rozhodnu se“. Zkouška 5b/5d proběhla (3 + 6 čtení), verdikt chybí.
- **R2 Confirmation = dvě možnosti?** 09-20 „Dvě možnosti – výborné“ × 11-09 „zní mi zvláštně, když chci potvrzení mít 2 možnosti“. Produkce dnes dvě možnosti.
- **R3 Cesta / rozcestník:** kde (věta 3 vždy, nebo jen u Crossroads), a z jakých dat (BACKLOG 12, 13).
- **R4 Pocit („How I feel“):** zda vstup přidat a kam míří (BACKLOG 10).
- **R5 Zdroj významu pro větu 2:** slovo z banky (dnes) · celá věta o runě (opisuje se parafrází) · dvě strany z ownerova popisu (vlastnější, Hagalaz opsal).
- **R6 „you“ v obraze:** owner 11-11 „stavět člověka přímo do obrazu“ a úhel [6] × Gemini 11-23 „ty až v otázce, předtím 3. osoba“.

## 7. Zastaralé v `RUNAR_DESIGN.md` (opravit při přesunu kostry)
1. „Tři beaty: obraz · esenční řádek · umístění“ (ř. ~295) — umístění „you stand“ na konci je od 09-20 pryč, konec je most.
2. Životní runa jako čočka a „dvě možnosti = pravidlo pro čočku“ (ř. ~72, 469, 620) — od 09-25 ve čtení není.
3. Sezóna v tabulce faktorů a v materiálu (ř. ~72–74, 618) — od 09-20 v promptu není.
4. „Seeking se nevyslovuje, jen tón“ (ř. 616) — od 09-20 volí tvar konce.
5. Přeformulování otázky uživatele, Voice Scale 0–20, úplněk (ř. ~691–734) — bez data, v kódu neověřeno; zjistit, nebo označit jako nápad.
6. Odkaz „Co má uživatel cítit na konci“ (ř. 99) vede nikam.

## 8. Gemini 2026-11-23 (5 bloků) proti kostře
| Gemini | u nás | vzít? |
|---|---|---|
| 1 Dynamika (fyzický princip, 3. osoba) | věta 1 obraz + věta 2 význam | ano jako princip; 3. osobu ne plošně (R6) |
| 2 Konstruktivní pól | věta 2 / druhá strana | ano — „kvalita fungování, ne výsledek“ sedí s kánonem |
| 3 Stínový pól (přepálení × podchlazení) | druhá strana ve větě 3 | ano, bez nálepky; „depersonalizace“ = naše „bez tvrzení o člověku“ |
| 4 Slepé místo („vypadá jako X, bývá Y“) | tvar konce Reflection, „druhá půlka ukáže, co v obraze není“ | jen o runě/obrazu; jeho Fehu příklad („strach z prázdnoty“) je tvrzení o nitru = proti jádru |
| 5 Kalibrační otázka | věta 4 | ano; jeho pravidla (ne ano/ne, ne návodná) sedí s „otázka nesmí podsouvat“; tvrzení o Zeigarnikově efektu neověřeno |
| poměr 70/15/15, trychtýř runa → člověk | 4 věty, věta 4 krátká | sedí |
Pět bloků do čtyř vět se nevejde → bloky 3 a 4 jako položky losu věty 3, ne pevné věty.

## 8b. GPT a Gemini k návrhu (2026-11-23, vloženo ownerem) — vyhodnocení CODE-read
Owner: *„nemůžeme teď slepě koukat na kánon … je potřeba se trochu otevřít a analyticky to zhodnotit. všechno překontroluj a pokud můžeš, rozšiř.“*
| návrh | ověření / co už víme | verdikt |
|---|---|---|
| zůstat u 4 pohybů, 5 bloků ne (GPT, Gemini souhlasí) | shoda s ownerem 11-18 | **přijmout** |
| věta 3 = jedno z: konstruktivní pól · tření · přehlížená stránka | sol při volné volbě sklouzne k výchozí (krok 2: volný konec → návrat k obrazu 8/9 → „druh konce se musí losovat“) | **přijmout, režim losovat** (Gemini), ne nechat na modelu |
| „vnitřní napětí: mechanismus runy se obrátí proti sobě“ | ownerovy popisy run mají druhou stranu skoro všude (Fehu „Ale Fehu má i druhou stranu“); owner 10-30 „ne každá mince má dvě strany“ | **přijmout jako data per runa**, ne jako povinnost u každé runy |
| „přehlížená proměnná“ | už máme ownerem potvrzené pravidlo „druhá půlka ukáže, co v obraze NENÍ — směna, nebo stopa“ (2026-09-20, `memory/co-dela-cteni-silnym.md` bod 4; n = 6 dvojic) | **přijmout** — je to totéž; v produkčním zadání dnes chybí |
| pravidlo nenahraditelnosti v promptu | model při psaní jedné runy nesrovnává s 24 dalšími (Gemini) | **ne do promptu** — do dat (paradox per runa) + mimo prompt měří slepí soudci run (máme) |
| pravidlo nového přínosu (věta 3 ≠ přeformulovaná 2) | měřitelné strojem: překryv slov věty 2 a 3 | **přijmout jako kontrolu**, ne jako větu v promptu |
| vstup „What feels closest to you right now?“ (GPT) | = BACKLOG 10 „How I feel“ (owner 10-26, 11-11). Emoce zvolí stranu runy pro větu 3, význam nemění. Co člověk zadal sám, smí Rúnar pojmenovat (definice 10-16, „konstatování“) | **slibné**; rizika: Loss/Pressure u krize (pravidlo 112) · přitakávání · osobní údaj v DB (`RUNAR_PRIVACY.md`) · volný text = dnes jen admin |
| Zeigarnikův efekt (Gemini) | metaanalýza 2025 (Ghibellini & Meier): paměťová výhoda nedokončených úkolů obecně neplatí; tendence se k nim vracet ano | **nepoužívat jako důvod** |
| Barnum (GPT) | známý jev; „působí přesně“ není měřítko — už v kánonu (`RUNAR_DESIGN.md`) | shoda |
| defuze (ACT) | koncept existuje, účinek metafory není zaručený (GPT sám) | jen jako možný účinek, ne cíl |
| 4. kritérium „bez diagnostiky uživatele“ (Gemini) | = naše jádro, bod 2; kontrola tvaru umí část strojově | **přijmout do hodnocení** |
Pozn.: GPT píše, že náš systém „vybírá jeden ze dvou pólů runy“ — platí jen v labu (varianta „dvě strany“), produkce má slovo z banky + esenci.

## 8c. Data pro větu 3 a kalibrace soudců (2026-11-23, owner „8. ano · 9. ano“)
**Data:** `data-5-run.json` — Fehu, Raidho, Gebo, Hagalaz, Berkana: dvě strany · bod zlomu · přehlížená stránka, každá s citací z ownerova
popisu. Gemini: „druhá strana“ nesmí být jinými slovy „bod zlomu“ → u Berkany přepsána 2. strana (růst nejde vynutit), zlom = příliš péče;
u Hagalaz zlom **vynechán** (runa je sama zlom; owner „ne každá mince má dvě strany“).
**Kalibrace soudců** (owner: „rád bych věděl, že kontrolují a hlídají to, co mají … ne zbytečným voláním API“): `soudci/` — sada se známou
odpovědí, soudci = agenti bez API, naslepo.
1. **Soudce tvrzení o člověku:** 20 vět, o kterých už rozhodl owner nebo kánon (10 vad, 10 v pořádku; včetně těch, na kterých dřív soudci
   přestřelili). Soudce 1: 20/20. Soudce 2: 19/20 — přestřelil „Your knuckles have learned this before your mind has“ (owner 09-23: není vada).
   → **vada se počítá, jen když se shodnou oba**; kde se rozejdou, čte CODE-read a ukáže ownerovi.
2. **Soudce runy:** 9 skutečných čtení bez jména runy + 3 chiméry (věta o významu z jiné runy). Oba soudci: runa 9/9, chiméry 3/3 i s původem
   podstrčené věty, falešné poplachy 0/9.
3. **Stroj „nový přínos“** (podíl slov věty 3, která už jsou ve větě 2): pravá čtení 0,00–0,13 · podstrčené přeformulování 0,75 → práh existuje.
4. **Hranice kalibrace:** chiméry jsou hrubé (celá jiná runa) — jemnou záměnu sousedních run (Fehu × Gebo) to neprověřuje · věty v sadě A
   jsou krátké a vytržené · „zajímavost“ a „nový pohled“ soudce neměří, to soudí owner naslepo.

## 8d. Plán: z kostry „organismus“ (návrh CODE-read 2026-11-23, čeká na ownera)
Owner: *„každá část má svou jasnou funkci, kdy budeme vědět, že když tohle změníme, tak se stane tamhle to … nechci se točit v kruhu,
chci solidní plán.“* Základ zůstává v2 (to, co funguje); v3 = řada změn v2 přes kostru, ne nový prompt. Zkoušky na solu až v kroku 5.
1. **Mapa příčin (bez API).** Ke každému kusu zadání (`_kus`): funkce · věta, na kterou míří · známé vady, které způsobil (z DECISIONS,
   hlášení a labů, s doklady: např. pant ← úhel [3] u obrazu bez pevné věci; cesty v krajině ← oblast popsaná jako místo; „already“ ← slovo
   v úhlu) · jak se vada pozná. Výsledek: tabulka „změním X → hýbe se Y“. Generovaná z kódu, aby se nerozešla s promptem.
2. **Audit kombinací losů (bez API).** Každý obraz banky × každý úhel × podoby oblasti × tvary konce: má obraz to, co úhel a oblast
   předpokládají (pevnou věc, pohyb, skrytou část, hranu, místo pro člověka)? Je scéna dnes snadno představitelná (chlév ✘ → horská chata ✔)?
   Soudci napřed kalibrovaní na známých případech (chlév, pant, kráva na trhu ✘ · svíčka, baterie ✔). Výsledek: seznam kombinací, které
   potřebují zásah, a seznam obrazů k výměně.
3. **Pravidla slov pro data (bez API).** Než se cokoli napíše modelu: změřit na uložených čteních, co sol z jakého druhu vstupu opisuje
   (slovo, věta, štítek, otázka) — data máme v DB a labech. Spojit s `RUNAR_DESIGN.md` „Slova, která dáváme modelu“ a Gemini dokumentem
   o volbě slov. Výsledek: jak psát položku dat, aby z ní model tvořil, ne opakoval.
4. **Kontrola čtení věta po větě (bez API, na produkčních čteních z DB).** Každá věta dělá svou práci? Obraz nepřidal předmět bez funkce —
   a když ano, dohledat příčinu z losů čtení (`prompt_draws`)? Výsledek: stav v2 dnes + kde přesně se kazí.
5. **Teprve pak změny po jedné**, každá s předpovědí z mapy (krok 1) a měřená na stálé sadě (5 run, pevné vstupy, kalibrovaní soudci + owner naslepo).

## 9. Jde to jinak a lépe?
1. **Kostru generovat z kódu:** každý kus zadání už v kódu nese, na kterou větu míří (`_kus(jméno, vstup, věta, text)`). Tabulka v oddílu 5 se dá
   skládat skriptem (jako testovací balíček) → doc a prompt se nerozejdou.
2. **Nabalovat jako položky losu, ne jako nové věty v zadání:** nápad (druhá strana, cesta, slepé místo, pocit) = nová položka v losu dané
   věty. Zadání se nepřepisuje, pokus se dá zapnout a vypnout jedním číslem.
3. **Jedna stálá zkouška kostry:** 5 run × pevné kombinace vstupů z testovacího balíčku; každá změna se pustí na ní a porovná se se stejnými losy.

# Kostra čtení — přehled (GENEROVANÉ z kostra.json a pokusy.json, needitovat; `node scripts/verify_kostra.js --zapis`)

Verze kostry: **K1 = produkce v2 dnes** · prompt v produkci: viz `RUNAR_PROMPT_VERSION` (v2/runar-config.js). Značky: J = jádro · K = část čtení · V = vstup · M = měřítko · Z = závislost · R = otevřená otázka · P = pokus.

## Jádro (nemění se bez datovaného rozhodnutí)

- **J1** Zrcadlo, ne orákulum: žádná předpověď ani náznak skryté znalosti — *RUNAR_DESIGN.md „Rúnarův rejstřík“*
- **J2** Bez tvrzení o člověku: oznamovací věta o jeho pocitech, vědění nebo situaci je vada; otázka, nabídka, obecná pravda a to, co sám zadal, ne — *DECISIONS 2026-10-16 (5); 2026-09-24 (15)*
- **J3** Bez rady: postoj ano, krok do života ne; vstup do obrazu („Look closer…“) není rada — *RUNAR_DESIGN.md; owner 2026-09-23*
- **J4** Jeden obraz, jedna scéna, dnes snadno představitelná, bez archaismu a bez časové lhůty — *DECISIONS 2026-08-23, 2026-11-19 (4); docs/postup-obraz.md*
- **J5** Těžká runa nikdy útěchu — *HEAVY_RUNES (v2/runar-config.js); DECISIONS 2026-09-20 (8)*
- **J6** Hlas: věcný, klidný, krátké věty, bez klišé a bez vykřičníků — *buildSysPrompt (v2/runar-character.js)*
- **J7** Islandština se píše islandsky od začátku a ověřuje nástroji — *CLAUDE.md §2*

## Části čtení

### K1 Obraz (věta 1)

**Práce:** jedna scéna, ve které je napětí runy vidět; čtenář se v ní pozná jedním pohledem  
**Co má v člověku vyvolat:** člověk se ve scéně pozná („to znám“) (owner: owner 2026-10-24 (sušenka posunutá sestře) · RUNAR_DESIGN.md „Co dělá čtení silným“)  
**Z čeho vzniká:** V4 úhel otevření, V5 obraz · kusy zadání: ANGLE, IMAGE

- **K1.1** jeden vlastní detail, který věta obrazu nejmenuje — *DECISIONS 2026-09-24 (20), 2026-10-09 (13), od 2026-10-09*
- **K1.2** nic navíc bez funkce: nový předmět, osoba nebo děj jen když ho čtení potřebuje — *DECISIONS 2026-11-19 (1), od 2026-11-19*
- **K1.3** obraz krátký (kolem 12 slov), jeden děj, přítomnost — *docs/postup-obraz.md, od 2026-11-14*
- **K1.4** osoba si místo v obraze musí zasloužit — *DECISIONS 2026-11-14 (6), od 2026-11-14*
- **K1.5** napětí nese děj, ne přídavné jméno ani pojmenovaná emoce — *docs/postup-obraz.md 2.7; pokus P01, od 2026-11-16*

Měření:
- **M1** scéna je dnes snadno představitelná a nemá předmět navíc — soudce obrazu · nekalibrováno — kalibrovat na: dveře chléva ✘, dveře horské chaty ✔, pant ✘, kráva na trhu ✘, svíčka ✔
- **M2** obraz z banky se nevrací celý — stroj: nejdelší doslovný úsek, podíl slov obrazu · používá se v labech

Známé vady a jejich příčina:
- pant, dveře chléva ← úhel [3] „stays fixed“ u obrazu bez pevné věci → model si věc vyrobí (DECISIONS 2026-11-19 (1)) · vyřešeno: úhel [3] mimo los
- převyprávění celého obrazu (71 % slov obrazu) ← dlouhý obraz z banky (docs/eval/2026-11-09-v2-vyklad-z-v3/README.md oddíl 5) · otevřené
- oheň a krb místo dnešní scény ← z obrazu chybí slovo, které drží dobu; model doplní z runy (pokus P02) · poučení

Pokusy na této části: P01 (přijato) · P02 (poučení) · P03 (odloženo) · P05 (čeká na ownera) · P12 (čeká na ownera) · P13 (odloženo) · P14 (čeká na ownera) · P18 (v produkci)

### K2 Význam (věta 2)

**Práce:** co obraz ukazuje o runě — tak, aby to neplatilo o jiné runě  
**Co má v člověku vyvolat:** člověk pochopí, co runa je, bez slovníku (owner: owner 2026-10-30 („chybí vysvětlení, čím runa sama je“))  
**Z čeho vzniká:** V6 slovo významu, V9 sloveso esence · kusy zadání: RUNE-MEANING, ESSENCE

- **K2.1** ne slovníková definice, ne obraz znovu — *RUNAR_DESIGN.md (tři beaty); pokus P05, od 2026-08-22*
- **K2.2** neříct, co to znamená pro člověka — *ESSENCE v2/runar-character.js, od 2026-09-18*
- **K2.3** sloveso esence jen z doložených v textech o runách (los) — *DECISIONS 2026-10-06 (10), od 2026-10-06*

Měření:
- **M3** z čtení bez jména runy jde poznat runa — dva slepí soudci runy · kalibrováno 2026-11-23: 9/9, podvržená věta 3/3 (docs/eval/2026-11-23-kostra-cteni/soudci)
- **M4** věta neopakuje zdroj ani slovo losu jako štítek — stroj: doslovný úsek ze zdroje · používá se v labech

Známé vady a jejich příčina:
- šablona „<Runa> is …“ na stejném místě ← pevný rámec esence (docs/eval/2026-10-23-v3-charakter/krok46) · vyřešeno: los sloves
- slovo významu jako štítek („Disruption can…“) ← zdroj = jen slovo (pokus P06) · poučení

Pokusy na této části: P04 (odloženo) · P05 (čeká na ownera) · P06 (čeká na ownera) · P11 (přijato) · P14 (čeká na ownera) · P15 (čeká na ownera)

### K3 Dopad (věta 3)

**Práce:** přenést význam tam, kde člověk stojí (oblast, čas): možnost, napětí nebo druhá strana  
**Co má v člověku vyvolat:** člověk si význam vztáhne na sebe, aniž by mu ho někdo přisoudil (hypotéza: hypotéza (neověřeno; owner 2026-11-17 „máš to ověřené?“))  
**Z čeho vzniká:** V1 oblast, V3 pro kdy · kusy zadání: AREA, INTENTION

- **K3.1** bez tvrzení o jeho životě; možnost s „may“ — *jádro J2, od 2026-10-16*
- **K3.2** oblast nevyslovit jako štítek; je to vztah nebo otázka, ne místo — *DECISIONS 2026-09-23 (12), od 2026-09-23*
- **K3.3** druhá strana runy uvnitř čtení, bez nálepky „stín“ — *docs/eval/2026-10-23-v3-charakter/zadani-v3.md G55, od 2026-11-05*

Měření:
- **M5** žádné tvrzení o člověku — dva soudci tvrzení, vada jen při shodě · kalibrováno 2026-11-23: 20/20 a 19/20
- **M6** věta 3 přidá něco nového (nepřeformuluje větu 2) — stroj: podíl slov věty 3 obsažených ve větě 2 · kalibrováno 2026-11-23: pravá 0,00–0,13 · přeformulování 0,75

Známé vady a jejich příčina:
- cesty v krajině, které v obrazu nejsou ← oblast rozcestí popsaná jako místo (DECISIONS 2026-09-23 (12)) · vyřešeno
- slovo „work“ ve čtení ← slovo v podobě oblasti (DECISIONS 2026-09-26 (2)) · vyřešeno

Pokusy na této části: P04 (odloženo) · P05 (čeká na ownera) · P08 (nápad) · P09 (připraveno) · P10 (nápad) · P11 (přijato) · P16 (čeká na ownera)

### K4 Otevření (věta 4)

**Práce:** nechat to u člověka; tvar podle toho, co hledá  
**Co má v člověku vyvolat:** otázka nebo možnost, nad kterou člověk zůstane (owner: owner 2026-11-11 („If you looked back today…“ míří přímo na člověka))  
**Z čeho vzniká:** V2 co hledá, V7 tvar konce, V10 otázka runy · kusy zadání: SEEKING, ENDING

- **K4.1** tvar podle hledání, jinak los z tvarů; střídat — *DECISIONS 2026-09-20 (8), 2026-09-26 (1), od 2026-09-26*
- **K4.2** těžká runa → těžké znění — *jádro J5, od 2026-09-20*
- **K4.3** otázka runy z Kolekce jako zdroj, ne u konce ve tvaru otázky — *DECISIONS 2026-10-07 (4), od 2026-10-07*
- **K4.4** otázka nepodsouvá problém ani motiv — *pokus P05 (GPT 2026-11-18), od 2026-11-18*

Měření:
- **M7** otázka nic nepodsouvá — soudci tvrzení (bod d) · kalibrováno 2026-11-23
- **M8** neopisuje otázku runy — stroj: doslovný úsek z otázky runy · měřeno 2026-10-07

Známé vady a jejich příčina:
- otázka runy opsaná skoro doslova ← otázka runy pod pokynem „konči otázkou“ (DECISIONS 2026-10-07 (4)) · vyřešeno
- „Where in your life …“ na začátku každé otázky ← model si šablonu vytvoří sám (pokus P04) · otevřené

Pokusy na této části: P04 (odloženo) · P05 (čeká na ownera) · P11 (přijato) · P17 (čeká na ownera)

### K5 Myšlenka ✦ (věta mimo 4 věty)

**Práce:** jedna myšlenka na cestu  
**Co má v člověku vyvolat:** věta, kterou si člověk odnese (owner: DECISIONS 2026-09-30 (8))  
**Z čeho vzniká:** — · kusy zadání: THOUGHT-✦

- **K5.1** jedna věta, nejvýš 12 slov, z odstavce runy v Kolekci; smí oslovit otázkou — *DECISIONS 2026-09-30 (8), 2026-10-05 (2), od 2026-10-05*

### K6 Ask (věta po čtení)

**Práce:** rozšíří věty 2–4 na otázku člověka  
**Z čeho vzniká:** —

- **K6.1** tipy podle tvaru konce: dvě strany / proč ta otázka — *DECISIONS 2026-11-23 (2); pokus P07, od 2026-11-23*

Pokusy na této části: P07 (v produkci)

## Vstupy

| id | vstup | odkud v kódu | kdo ho dává | míří do |
|---|---|---|---|---|
| V1 | oblast | AREAS + AREA_FACES (los podoby) | člověk | K3, výběr obrazu |
| V2 | co hledá | SEEKS → _registerContext, SEEK_SHAPE | člověk | K4 |
| V3 | pro kdy | INTENTIONS → _intentionContext | člověk | K3, celé čtení (čas sloves) |
| V4 | úhel otevření | READING_ANGLES (los, [3] mimo los) | los | K1 |
| V5 | obraz | RUNE_IMAGES (klíčovaný runou, filtr podle oblasti) | los | K1 |
| V6 | slovo významu | sloupec řádku RUNE_IMAGES | los (s obrazem) | K2 |
| V7 | tvar konce | ENDING_OPEN / ENDING_HEAVY | los nebo hledání | K4, K6 |
| V8 | jméno | NAME_PLACEMENTS (los) | člověk + los | celé čtení |
| V9 | sloveso esence | ESSENCE_VERBS_SOL (los) | los | K2 |
| V10 | otázka runy | UI_TEXT.coll_rune (odstavec 4) | runa | K4 |
| V11 | vlastní otázka | r-question (jen admin) | člověk | celé čtení |
| V12 | pocit | není (nápad, pokus P10) | člověk | K3 |

## Co s čím souvisí (když měním X, musím zkontrolovat Y)

- **Z1** měním obraz v bance (V5) → úhly V4: má obraz to, co úhel předpokládá? · výběr podle oblasti (smoke ㉲) · islandské znění řádku · brána identity runy · motivy (smoke ㉟)
- **Z2** měním tvary konce nebo SEEK_SHAPE (V7, V2) → tipy Asku podle prompt_draws.ending (K6) · scripts/verify_ask_hints.js
- **Z3** měním esenci nebo slovesa (K2, V9) → tip Asku ask_h_rune · golden (scripts/golden)
- **Z4** měním délku čtení → RUNAR_PRICING.md (cena) · hlas (ElevenLabs znaky)
- **Z5** měním cokoli v promptu → RUNAR_PROMPT_VERSION · prompt_skladani.mjs (pre-commit) · golden-verify (CLAUDE.md §18) · obě řeči IS i EN
- **Z6** měním podoby oblasti (V1) → _domainContext i konec berou týž los · scripts/utils/test_lever_maps.js (pořadí AREAS)
- **Z7** měním tvar skládaného textu čtení → strom života čte glyfy z textu (smoke ⑬)

## Otevřené otázky pro ownera

- **R1** věta 2: definice runy ano, nebo ne (P05)
- **R2** Confirmation: končit dvěma možnostmi? (P17)
- **R3** cesta a rozcestník: věta 3 vždy, nebo jen u Crossroads (P08)
- **R4** vstup pocitu ano/ne a kam (P10)
- **R5** zdroj významu pro větu 2 (P06)
- **R6** člověk v obraze („you“), nebo až v otázce (P05)

## Pokusy podle stavu

### nápad

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P08 | Rozcestník u oblasti Crossroads | K3 | — | 2026-11-17 (zadání) | BACKLOG 13 |
| P10 | Vstup pocitu („What feels closest to you right now?“) | K3 | — | 2026-10-26, 2026-11-11, 2026-11-23 | BACKLOG 10; zrcadlení × kontrast |

### připraveno

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P09 | Úhly pohledu ve větě 3 (dvě strany, bod zlomu, přehlížená stránka …) | K3 | data pro 5 run; úhly podle Gemini jako druhy, obsah z ownerových popisů | 2026-11-23 „ano, přesně tak“ | až po krocích 1–3 plánu |

### čeká na ownera

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P05 | Čtyři pohyby bez definice runy (Gemini/GPT) | K1 K2 K3 K4 | 4 věty 3/3, runa nejmenovaná 3/3, věta 2 je parafráze zdroje | — | rozhodnutí R1, R6 |
| P06 | Zdroj významu: jen slovo × dvě strany runy | K2 | slovo jako štítek 3/3; dvě strany vlastnější, Hagalaz opsal stranu | — | rozhodnutí R5 |
| P12 | Jera a Ingwaz bez chleba | K1 | náhrady od CODE-tune: marmeláda (Jera), semenná tobolka (Ingwaz) | — | BACKLOG 15 |
| P14 | Obraz na jednom místě a sjednocená zdvojení v promptu | K1 K2 | pořadí vět drženo 9/9; owner „produkce zní lépe“, pak „nečetl jsem to“ | 2026-11-14 | — |
| P15 | Fáze runy | K2 | fáze mění řečené, ne obraz; slovo pokynu vysloveno 2/4 | 2026-11-10 „fáze vypadá dobře“ | — |
| P16 | Druhá strana runy ve čtení | K3 | bez nálepky 3/3 Fehu, 3/3 Raidho | 2026-11-09 „druhá strana se mi líbí“ | spojit s P09 |
| P17 | Konce u Reflection a Confirmation | K4 | Confirmation: (a) neobratné, (b) čisté, (c) opsalo pokyn | 2026-11-09 „zní mi zvláštně, když potvrzení má dvě možnosti“ | rozhodnutí R2 |

### přijato

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P01 | Obrazy s napětím (kola 1–4) | K1 | 79/84 sedí na runu; ownerem pochválené svíčka, baterie, zpráva ráno | 2026-11-17 „jinak dobře“ | islandština, doložit přírodní fakta, přesun do banky přes CODE-tune; Jera/Ingwaz viz P12 |
| P11 | Kalibrace soudců na sadě se známou odpovědí | K2 K3 K4 | tvrzení 20/20 a 19/20; runa 9/9; podvrhy 3/3 | — | kalibrovat soudce obrazu (M1) |

### v produkci

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P07 | Ask: tipy k větám 3 a 4 | K6 | nasazeno CODE-tune (d54ddb2); odpovědi na tipy neměřené | 2026-11-18 „dej to tam“ | — |
| P18 | Obraz: nic navíc bez funkce, úhel [3] mimo los | K1 | nasazeno CODE-tune | 2026-11-19 | — |

### odloženo

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P03 | Obraz jako dávkovaná slova | K1 | scénu složí 6/6, volné místo nevyplní 0/3 | 2026-11-18 „tohle teď odložíme“ | — |
| P04 | v3 bez obrazu: Gebo popis · napětí · cesta · otázka | K2 K3 K4 | bez rady 6/6, rozcestník 3/3; model si vytvořil šablony „It holds the difference between“ 4/6 a „Where in your life“ 3/3 | 2026-11-18 „ulož a odkládáme“ | — |
| P13 | Islandský obraz jako rozpojená slova | K1 | nejdelší opis 3,3 → 2,0 slova; neprokázáno | — | — |

### poučení

| id | pokus | části | výsledek | owner | dál |
|---|---|---|---|---|---|
| P02 | Kenaz s telefonem a bez něj | K1 | bez telefonu model doplní oheň a krb 3/3 — slovo drží scénu v dnešku | 2026-11-17 „zajímavé“ | — |


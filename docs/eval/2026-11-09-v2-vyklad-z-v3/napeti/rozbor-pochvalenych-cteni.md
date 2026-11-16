# Co dělá obraz dobrým — z ownerových hlášení nad skutečnými čteními (CODE-read, 2026-11-16)

Zadání (owner 2026-11-16): „obrazy už máme ve v2, takže stačí se podívat na nějaká stará čtení, co se u nich děje. k některým jsem dával
report, že se mi líbí nebo nelíbí … podle znění těch čtení a toho, že znáš obraz, přijď na to, proč je to dobré. poučení můžeme najít
i na internetu, v literatuře, v knihách.“ A k rozboru kola 3: „všední věc člověka více vtáhne, ale nemůže to být jen to. neříkal jsem
také islandské obrazy? tedy přírodní?“

## 1. Data a hranice
1. Hlášení z appky (`bug_reports`, jen čtení z DB) spárovaná se čtením podle textu a s obrazem z `readings.prompt_draws.image`:
   **133 hlášení s obrazem**, 2026-09-21 až 2026-11-10, všechna EN, všechna ownerova. Texty čtení tu nejsou (nesou jméno, do repa nepatří);
   znovu je dá skript jen pro čtení, který leží mimo repo — postup: `bug_reports.flagged_text` × `readings.short_text`.
2. Je to úsudek nad ownerovými slovy, ne měření. Většina hlášení se týká Asku, oblasti nebo modelu, ne obrazu; k obrazu a čtení jako celku
   se jasně vyjadřuje zhruba 30. Hagalaz je přesycený (zkoušky modelů 3.–6. 10.) — tam hlášení soudí model, ne obraz.
3. Část výtek není o obraze, ale o srážce **obraz × oblast** (Isa fjord + práce, Isa potok pod ledem + domov): „možná se celý obraz
   nehodí pro tuhle Area“. To obraz sám nevyřeší.

## 2. Pochválená čtení a co v nich obraz udělal
| Obraz | Owner | Co s ním čtení udělalo |
|---|---|---|
| Fehu — The milk spills over the brim of the pail | „zatím asi nejlepší čtení. čistý obraz. jednoduchý na představu a přitom výstižný … člověk to v něm vidí“ | přidalo tenký bílý pramínek po dřevě; význam vzalo z okraje (co máš, přesahuje to, co to drží) |
| Uruz — You lift the end no one else could get under, and it comes up | „moc povedené … člověk si může jednoduše představit, že kámen leží v zemi a … je větší, než co viděl na povrchu. přímo ukázkové“ | samo doplnilo kámen a jeho část pod trávou |
| Perth — The lagoon water clears for a moment and something below stirs, then closes over again | „vzorové čtení. všechno na sebe pěkně navazuje“ | tvar, který se vynoří a zmizí, přeneslo na práci |
| Ehwaz — When one horse tires on the climb the other slows unasked… | „velmi povedené. čistý obraz krásně popsaný“ | drželo se obrazu, konec nechalo otevřený (spolu, nebo každý jinudy) |
| Wunjo — You sit down with them and no one asks why you came | „ukázkové, celé ho zapsat“ (Keep) | samo doplnilo prázdnou židli |
| Nauthiz — The plant on the sill turns itself flat to the glass, toward the one hour of light it gets | „pěkné čtení. líbí se mi, že uživatel je you are the plant“ | postavilo čtenáře na místo rostliny |
| Sowilo — In the sunshine you can see where you stand on the slope | „zajímavé čtení“ + GPT: runa „není vysvětlovaná, je viděná“ | samo postavilo dvě cesty, které jsou ve světle vidět |
| Hagalaz — After the storm, only the tree with deep roots is still standing | „líbí se mi tahle věta“ | — |
| Algiz — Out on the heath a twig snaps, and the whole party goes quiet to listen | „zajímavé čtení. zaslouží si hlubokou analýzu“ | nechalo otevřené, jestli tam nebezpečí vůbec je |
| Kenaz — The forge glows in the dark shed and the iron takes its shape | „wow. hezké čtení. hezký obraz“ | — |
| Mannaz — Two people look at the same mountain, and each sees their own | „zajímavé … je v něm docela hloubka“ | — |

## 3. Čtení, která se nelíbila, a proč
| Obraz | Owner | Co se stalo |
|---|---|---|
| Tiwaz — You stand by your word though it costs you your sleep | „moc nedává smysl … metaforu vůbec nechápu“ | obraz je sám abstrakce (slovo, spánek); model z ní udělal další metaforu |
| Raidho — From the pass you look back, and your tracks in the snow make one line down the valley | **„dobrý obraz, ale model ho úplně přepíše. není žádný prostor pro model si něco vymyslet“** | čtení obraz opsalo skoro slovo od slova |
| Kenaz — A single lamp over the bench | „zapříčinila, že ji GPT opsal“ | totéž |
| Wunjo — The sun finally reaches into the valley and everything goes still | „hezký obraz, ale proč by Wunjo mělo být stillness?“ | poslední slovo obrazu („still“) určilo výklad runy |
| Kenaz — … the shavings curl away from the blade | „ten blade tam nezapadá!“ | rekvizita cizí runě se dostala do čtení |
| Hagalaz — Hail rakes the hayfield in June… | „líbil by se mi jiný obraz než hay … nechápu, co se čtení snaží říct“ | — |
| Berkana — You water the cutting and then leave it alone | „úplně špatný obraz!!!“ | obraz je návod, co čtenář dělá; čtení ho převyprávělo |
| Othila — The turf wall the forefathers built now sinks slowly back into the earth | „nelíbí se mi ta turf wall, co postavil můj předek“ | čtení přisoudilo čtenáři předky |
| Isa — The calm lies over the fjord and nothing stirs… | „matoucí“ | stav bez děje; s oblastí práce se nespojil |
| Fehu — The cow is sold in the autumn… | „obraz je zvláštní“ | viz `docs/postup-obraz.md` 2.4 |
| Fehu — The bread comes hot from the oven, enough for everyone at the table | „chleba je spíš to share než plenty“ | obraz nesl sousední význam (dělení = Gebo) |

## 4. Co z toho plyne
1. **Jeden fyzický okamžik, který je vidět jedním pohledem.** Ownerova slova u nejlepšího čtení: „jednoduchý na představu a přitom
   výstižný“. Platí pro přírodu i pro všední věc — z jedenácti pochválených je osm z krajiny nebo se zvířetem (vědro mléka, laguna,
   koně, svah ve slunci, strom po bouři, vřesoviště, výheň, hora) a tři z lidské situace. **Příroda a Island do sady patří**; vadou
   nikdy nebyla příroda, ale činnost, kterou čtenář nezná, a obraz bez napětí.
2. **Napětí je uvnitř okamžiku.** Plné vědro × přes okraj · voda se vyjasní × zase zavře · přisedneš × nikdo se neptá · jedna hodina
   světla × rostlina se k ní celá tiskne · prasknutí větvičky × všichni ztichnou.
3. **Obraz nechává místo — modelu i čtenáři.** V pochválených čteních model něco **přidal** (kámen, židli, pramínek, dvě cesty).
   Kde obraz řekl všechno (stopy ve sněhu tvoří jednu čáru údolím), model ho opsal a owner to pojmenoval sám. Stejné měřítko vyšlo
   z rozboru svíčky a zprávy (`kolo3/ohlasy.md`): věta končí před závěrem.
4. **Každé slovo obrazu model vezme doslova, poslední nejvíc.** „goes still“ udělalo z Wunjo ticho, „blade“ se dostalo do Kenazu,
   „forefathers“ dalo čtenáři předky. V obraze nesmí být slovo, které nechci ve čtení.
5. **Obraz není abstrakce ani návod.** „Stojíš za slovem, i když tě to stojí spánek“ a „Zaliješ řízek a necháš ho být“ nejsou
   okamžik k vidění; jeden skončil hádankou, druhý převyprávěním.
6. **Čtenář smí být tou věcí** („you are the plant“) — owner to chválí; je to umístění, o kterém rozhoduje los úhlu, ne obraz.

## 5. Totéž v literatuře (dohledáno na webu 2026-11-16; druhotné zdroje, znění citátů neověřeno proti původním knihám)
1. **Haiku — řez (kireji):** dva obrazy vedle sebe bez vysvětlení vztahu; mezeru mezi nimi vyplní čtenář. To je bod 3.
   <https://en.wikipedia.org/wiki/Kireji>
2. **T. S. Eliot — objective correlative** (esej „Hamlet and His Problems“, 1919): emoce se nevyslovuje, postaví se věci a situace,
   které ji vyvolají. To je „emoce tam je, ale není pojmenovaná“. <https://rpo.library.utoronto.ca/glossary/objective-correlative>
3. **Hemingway — teorie ledovce** (*Death in the Afternoon*, 1932): co autor zná, může vynechat a čtenář to ucítí; vynechá-li to,
   protože to nezná, vznikne díra. Pro nás: vynechat závěr smím jen u obrazu, jehož runu mám jasnou jednou větou.
   <https://en.wikipedia.org/wiki/Iceberg_theory>

## 6. Co to mění na kole 3
1. Sada je příliš městská a domácí; chybí přírodní a islandské obrazy po vzoru Isy a tabulky v oddílu 2.
2. Věty s dovětkem, který řekne závěr za čtenáře i za model („and neither keeps count“, „and no one at the table minds“), porušují bod 3.
3. U každé věty zkontrolovat poslední slovo a rekvizity podle bodu 4.

# Kolo 4 — obrazy podle poučení z čtení a ze zdrojů (CODE-read, 2026-11-16)

Lab, ne kánon. Nic není v bance, nic není islandsky, nic neprošlo čtením. Čistý seznam: `obrazy-kolo4.md`.

## 1. Zadání (owner 2026-11-16)
1. K Eliotovi a Hemingwayovi: „zajímavé. zjisti víc.“ · „k tomu se snažíme propracovat. zjisti víc.“
2. Přírodní a islandské obrazy ke každé runě: „ano“.
3. K dovětkům, které řeknou závěr: „souhlasím. to by mělo vycházet z runy nebo nějakého našeho losu. musí to samozřejmě sedět runám.
   poloze člověka, kde se nachází, nebo napětí. chce to vzít hlouběji.“
4. Čtvrté kolo: „až to celé projdeš, tak ano. dej si na tom záležet, ať je to pořádně. ověř si to přes zdroje. pak se zeptej sám sebe,
   jestli to nepůjde udělat ještě lépe!“
5. Vložený text GPT (vzorec „běžná situace + drobný rozpor + důsledek, který si člověk domyslí“; obraz dodává scénu a napětí, prompt směr
   pozornosti, ne význam).

## 2. Zdroje — co je ověřeno a jak
1. **T. S. Eliot, „Hamlet and His Problems“ (1919) — ověřeno v původním textu** (<https://en.wikisource.org/wiki/The_Sacred_Wood/Hamlet_and_His_Problems>):
   emoci jde v umění vyjádřit jen přes „a set of objects, a situation, a chain of events which shall be the formula of that particular
   emotion“ — vnější fakta, která „must terminate in sensory experience“; když jsou dána, emoce se vybaví sama. A proč podle něj Hamlet
   selhává: emoce je „in excess of the facts as they appear“. **Pro nás:** obraz končí v něčem, co jde smysly zachytit, a nenese víc
   citu, než kolik unesou jeho fakta. Tiwaz „stojíš za slovem, i když tě to stojí spánek“ je cit bez faktů.
2. **Ezra Pound, „A Few Don'ts by an Imagiste“ (1913) — ověřeno v původním textu** (<https://www.poetryfoundation.org/articles/69409/a-retrospect-and-a-few-donts>):
   „Direct treatment of the ‘thing’“ · „Go in fear of abstractions“ · výraz „dim lands of peace“ kazí obraz, protože míchá abstrakci
   s konkrétním — „the natural object is always the adequate symbol“. **Pro nás:** přírodní věc stačí sama; nepřidávat k ní slovo významu.
3. **Hemingway, teorie ledovce** (*Death in the Afternoon*, 1932, kap. 16; kniha je chráněná, znění z <https://en.wikipedia.org/wiki/Iceberg_theory>,
   proti knize neověřeno): co pisatel dobře zná, může vynechat a čtenář to ucítí; kdo vynechá, co nezná, nechá v textu díru. V *A Moveable
   Feast* popisuje, že u povídky „Out of Season“ vynechal skutečný konec a vynechaná část povídku zesílila. **Pro nás:** závěr se vynechá,
   jen když je mechanismus runy jasný jednou větou (`docs/postup-obraz.md` 1.2); jinak z obrazu zbude hádanka.
4. **Wolfgang Iser, mezery v textu (Leerstellen)** — jen druhotné zdroje (<https://sites.ualberta.ca/~dmiall/MakingReaders/Iser_Trout.htm>):
   nevyřčená místa jsou to, co čtenáře přiměje se zapojit; vyplní je z vlastního života. To je „čtenář má hned vlastní případ“.
5. **Haiku, řez (kireji)** — druhotné (<https://en.wikipedia.org/wiki/Kireji>): dvě části vedle sebe, vztah dopoví čtenář.
6. **Čechov, dopis bratrovi 10. 5. 1886** — známá věta „neříkej, že svítí měsíc; ukaž odlesk na střepu“ je pozdější zhuštění; v dopise
   jde o střep láhve na mlýnské hrázi (<https://quoteinvestigator.com/2013/07/30/moon-glint/>). Přesné znění překladu neověřeno.
7. **Dvě studie, které uvedl GPT — existují** (<https://arxiv.org/abs/2609.18345>, <https://arxiv.org/abs/2601.05201>), ale jsou o modelech,
   které dostanou **skutečný obrázek**. Náš „obraz“ je věta v textu pro textový model. Na nás se dají vztáhnout jen jako podobnost
   (druhá: model se přikloní k textu pokynu proti tomu, co vidí). Přímý doklad pro nás zůstává vlastní měření: co sol dostane, to
   se objeví ve výstupu (`RUNAR_DESIGN.md` „Slova, která dáváme modelu“ bod 1; „Model čtení: gpt-6-sol × Opus 5“).

## 3. Odkud se ve čtení bere „poloha člověka“ (k bodu 1.3)
V produkci ji neurčuje obraz, ale los: sedm úhlů otevření (`READING_ANGLES`, `v2/runar-utils.js`) — nejmenší detail · pohyb, který už běží ·
to jediné, co stojí, když ostatní povoluje · část mimo dohled · hrana, kde se jedno mění v druhé · hledač uvnitř obrazu · celek a jedna věc.
V pochválených čteních je vidět, že přidaný detail přišel právě z úhlu: Uruz dostal „část mimo dohled“ → kámen pod trávou; Wunjo „to, co
stojí“ → prázdná židle; Nauthiz „hledač uvnitř“ → „you are the plant“; Gebo (moře a břeh) „hrana“. **Závěr tedy do obrazu nepatří — polohu
dodá los, význam runa.** Obraz má dát scénu s napětím a nic z toho předem neobsadit.

## 4. Zkouška, která neobstála: „unese obraz všech šest úhlů?“
Slepý soudce (bez run) hodnotil, jestli obraz dává každému z šesti úhlů něco, o co se opřít. Než jsem tím měřil, dal jsem mu bez označení
osm ownerem pochválených a osm odmítnutých obrazů z banky (`obhajoba_*.json`): **pochválené průměr 4,25 úhlu, odmítnuté 4,50.** Nástroj je
od sebe nerozliší → jako měřítko kvality se nepoužívá (§25 B). Co z něj zůstává užitečné: sloupec „řekne závěr sama“ a kontrola pravdivosti
přírodních faktů (chytil kroupy, které shodí prádlo ze šňůry).

## 5. Jak kolo vzniklo
Podle `../rozbor-pochvalenych-cteni.md` oddíl 4 a zdrojů výš: jeden okamžik viditelný jedním pohledem · napětí uvnitř · věta končí před
závěrem · žádné slovo, které nechci ve čtení (poslední nejvíc) · ne abstrakce, ne návod · u každé runy všední i přírodní obraz.
Pochválené věty zůstaly beze změny. Tři průchody („nejde to ještě lépe?“): po prvním 6 výměn, po druhém 2.

## 6. Výsledek
1. Strojová kontrola tvaru: 0 červených. Medián 14 slov, nejdelší 17.
2. Dva slepí soudci runy (výběr z 25): průchod 1 → 71 projde / 4 hraniční / 2 ne · průchod 2 → 72 / 3 / 2 · průchod 3 → **74 / 1 / 2**.
3. Neprošly: Nauthiz *The birch on the lava field grows no taller than the rock that shelters it* (oba Algiz — rozhodlo poslední slovo
   „shelters“, přesně jev z rozboru čtení) · Perth *Something has crossed the snow in the night, and the tracks end at the stream* (oba Laguz).
   Hraniční: Dagaz otočená mapa.
4. Soudce bez run označil jako „řekne závěr sama“ tři věty; dvě z nich jsou ownerem pochválené (pěšina v trávě, dlouhá jízda) — zůstávají,
   ownerův verdikt má přednost.
5. Za „neznámé ze života“ označil pět přírodních obrazů (kajka, bříza na lávě, bubliny pod ledem, vlna zvedá loď, potok ve starém korytě).
   Je to cena přírodních obrazů; o tom, které jsou čtenáři dost blízké, rozhoduje owner.

## 6b. Čtvrtý průchod (2026-11-17) — 84 vět
Owner: „algiz nedává smysl. jak může jedna geese jíst, když má zvednutou hlavu? jinak dobře. dával jsem ti nějaké další, co mě napadly,
a pokud se hodí k nějaké runě, tak by se mi líbilo je použít.“ Rozbor GPT ke kolu 4: `zdroj-gpt-2026-11-17-analyza-kolo4.md`.
1. Husy: věta teď popisuje jeden okamžik (hejno se pase, jedna husa stojí s krkem vzhůru). Zdroje (hledáno 2026-11-17) dokládají zvedání
   hlavy při pastvě a střídání, **ne** stálou hlídku jedné husy — proto bez „always“.
2. Výměna dvou vět, které neprošly: bříza roste podél jediné pukliny s hlínou (bez „shelters“) · Perth tuleň místo stop u potoka.
3. Ownerovy nápady dohledané v přepisu session (2026-10-28, 10-30, 11-14, 11-15): voda přes okraj · ztuhlé koleno před schody · nádech před
   odpovědí · nevyžádaný dar · most a oba břehy (jako lávka z prkna, aby to platilo doslova — výhrada GPT k mostu) · dech · slova učitele.
4. Dva slepí soudci na 84 větách (`*_v4.json`): **79 projde / 3 hraniční / 2 ne**. Neprošly dvě nové věty a obě se přesunuly k runě, kterou
   zvolili oba soudci: dech Gebo → Fehu · slova učitele Gebo → Perth. Hraniční: nevyžádaný dar (Gebo / Perth) · tuleň (Laguz / Perth) ·
   bubliny pod ledem (Isa / Laguz).
5. Po posouzení ještě úpravy znění podle GPT, které soudci už neviděli: víčko „turns in your hand“ · „the doors along the street“ ·
   „the stones on the moor have shadows“ · labutě „stays the same“. Pěšina („is on no plan“) je ownerem pochválená — beze změny, dokud
   owner nerozhodne.
6. GPT se mýlí u posledního místa v autobuse (píše, že šlo k Algiz; u obou soudců prošlo jako Nauthiz).

## 7. Hranice
1. Kruh: soudci vybírají z mých jednovětých popisů run; číslo říká „sedí na mou větu“, ne „je dobrý“.
2. Bez islandštiny a bez zkoušky čtením. Jestli obraz nechá modelu místo, ukáže až čtení (na jiné runě než Isa, s ownerovým ano).
3. Přírodní fakta kontroloval jen soudce (model), ne zdroj: kajka si vytrhává prachové peří do hnízda · husy se pasou s jednou hlavou
   vzhůru · lodě na kotvě se otočí s přílivem · drozd roznáší semena jeřábu — před zařazením do banky doložit.

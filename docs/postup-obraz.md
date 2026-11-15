# Postup: jak vzniká obraz do banky (jedno místo, kde stojí pořadí kroků)

Vlastní: **pořadí kroků a zkoušek** při psaní nebo přepisu obrazu pro `RUNE_IMAGES`. Pravidla sama vlastní `RUNAR_DESIGN.md`
(„Obraz — dvě síta“, „Typ obrazu“, „Délka a tvar obrazu“, „Obraz od modelu“) — tady se neopisují, jen se na ně ve správný okamžik ukáže.
*Changelog: 2026-11-14 založeno (CODE-read). Owner: „proč je teda tvoříme špatně? jak je máme tvořit lépe?“, „jde to udělat ještě
lépe?“, k jednomu souboru s postupem a strojovou kontrolou „15. ok“. Důvod: pravidla ležela na pěti místech a při psaní obrazu je
nikdo neměl před sebou; rozbor příčin → `docs/eval/2026-11-09-v2-vyklad-z-v3/audit-deje/pruchod-code-read.md` oddíl 4 a 7.*

## 1. Než obraz napíšu
1. **Co už owner o obrazech té runy řekl** — `node scripts/utils/uz_vime.js <runa> obraz` a
   `docs/eval/2026-10-23-v3-charakter/krok43-obrazy-dnesni-doba.md` oddíl 1 (co chválil, co odmítl a proč). Pochválený obraz se
   nepřepisuje, odmítnutý se nevrací.
2. **Mechanismus runy jednou větou se slovesem:** co se v té stránce runy stane a mezi kým. Zdrojem je ownerův popis runy
   (`RUNAR_POPISY_RUN.md`); obraz ale není přepis jedné jeho věty do krajiny.
3. **Podoba podle významu runy** (owner 2026-11-14: „záleží podle významu runy. ne vždy to snad musí být věc?“): koná člověk, zvíře,
   věc nebo živel — ten, na kom je mechanismus z bodu 2 vidět. `RUNAR_DESIGN.md` „Typ obrazu“ říká, která podoba sedí které stránce.
   Dvě podoby, které owner chválí: situace, kterou zažil skoro každý · fyzický zákon, který JE tím významem („most stojí, jen když ho
   nesou oba břehy“ — owner: „moc dobrý, pokud se hodí na runu“).

## 2. Když obraz píšu
1. Jedna scéna, jeden děj, přítomnost; kolem 12 slov (`RUNAR_DESIGN.md` „Délka a tvar obrazu“).
2. **Ten, kdo v obraze koná, dělá to, co runa znamená.** U Isy je tím dějem zastavení; u run o dvou stranách (Gebo, Ehwaz) konají obě.
3. Druhá půlka věty smí ukázat, co v záběru není („…a nikdo ho nežádal“).
4. Dnešní doba a věrohodnost: nic, co si dnešní člověk neumí představit (owner o krávě prodané na podzim: „skoro žádný člověk si
   takovou věc nedokáže představit … a hlavně to vůbec není zajímavý obraz“).
   **Podstata (owner 2026-11-15): vadí ČINNOST, ne věc.** „Kráva je přece v pořádku. Ale proč ji dáváš do obrazu, že ji někdo
   prodává na trhu?“ — ptej se, jestli čtenář tu situaci zná ze svého běžného života, ne jestli je slovo moderní. Runu obraz nést
   může a čtenáři přitom nic neříká; to je vada, i když projde slepou kontrolou runy.
   **Opakovaně odmítnutý vzor: „půjčím sousedovi a po čase se něco vrátí“** (owner 2026-11-15: „tyhle obrazy kritizuju pořád, ale
   jelikož sedí na runu, tak se stále objevují“). Místo něj situace, která se v běžném životě opravdu děje — jeho příklad: na
   společnou večeři přinesu talíř něčeho a odcházím s něčím jiným; překvapení smí zůstat.
5. **Osoba si místo v obraze musí zasloužit** (`RUNAR_DECISIONS.md` 2026-11-14 (6)); žádné tvrzení o čtenářově minulosti ani rodině.
6. Dvě síta (`RUNAR_DESIGN.md` „Obraz — dvě síta“).

## 3. Zkoušky, než obraz uvidí owner
1. **Stroj:** `python -X utf8 docs/eval/2026-09-26-obrazy/kontrola_tvaru.py <soubor>` — červená se přepíše; žluté body stroj neposoudí
   a zodpoví je ten, kdo obraz psal, písemně.
2. **Škrtací zkouška:** vyškrtnout přívlastky a okolnosti. Co zbude (kdo + sloveso), musí být mechanismus z 1.2.
   Vzor vady: „The windless snowfall … covers everything“ → „sníh zakrývá všechno“ není nehybnost.
3. **Zkouška opakem:** dá-li se runové slovo vyměnit za opačné a děj se nezmění, runu nese to slovo, ne děj.
4. **Slepá kontrola ve dvou krocích** (soudci tady, bez volání API): (a) soudce vidí jen obraz, žádné runy, a napíše, kdo koná a co se
   stane; ta věta se porovná s 1.2. (b) Jiný soudce vybírá runu z 25 jednovětých mechanismů — ne z popisů, ze kterých obraz vznikl
   (nástroj `docs/eval/2026-09-26-obrazy/brana_build.py` + `brana_vyhodnot.py`). Projde jen obojí.
5. **Islandsky:** psáno islandsky od začátku a ověřeno nástroji (`CLAUDE.md` §2).
6. **Zkouška čtením:** jedno čtení produkčním modelem s tím obrazem (volání API jen s ownerovým ano, §30) — owner 2026-11-04:
   „pokud to nebude dobré, tak nejsou dobré ani obrazy“.
7. **Stránka runy** (jde do zadání jako „focus on“) se zapíše až podle toho, co obraz dělá.

## 4. Kdo rozhoduje
Že je runa v obraze poznat, neznamená, že je obraz dobrý — o tom rozhoduje owner. Co z oddílu 3 doloženo není, se ownerovi ukáže
jako nedoložené, ne jako hotové.

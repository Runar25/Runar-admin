# Návrhy z popisů run — obrazy, vstupy do promptu, návod (2026-09-22)

**Stav: KE SCHVÁLENÍ OWNEREM.** KUKY: *„udělej návrhy a mrknu na to, než to budeme dělat."*
Nic z tohoto dokumentu není nasazené — nasazené je jen to, co popisuje `RUNAR_DECISIONS.md`
2026-09-22 (7). Dočasný dokument (CLAUDE.md: dočasné → `docs/archive/`); po rozhodnutí se
přijaté převede do kódu a záznamu v DECISIONS, tenhle soubor zůstane jako stopa, proč.

**Jak je to ověřené** (platí pro všechno níž, u položek se to neopakuje):
- **Islandština** psaná nativně, každá vazba přes korpus (`is-vazba.py --freq`; čtyřslovné
  sekvence nástroj nevrací nikdy, proto se ověřují po trojicích) a každá věta přes
  `is-grammar-qa.py`. Věty, kterým nástroj nerozuměl (E001), jsem **přepsal**, ne obešel (§19.2).
- **Identitní brána** (RUNAR_DESIGN „Typ obrazu": *každý obraz projde identitní branou*):
  tři slepí soudci, každý dostal jen anglický text obrazu a seznam 25 run s klíčovými slovy,
  každý v jiném pořadí. **Prošel = zamýšlená runa na prvním místě u aspoň 2 ze 3.** Dvě kola;
  kontrolní obrazy z kola 1 daly v kole 2 týž výsledek (brána je stabilní, ne náhoda).
  ⚠️ Brána běžela na **EN** textu. IS identitu neměří nikdo.
- **„Čí je to pozemek"** — předmět ani sloveso obrazu nesmí být jádrem jiné runy.

---

## A. PRIORITA — 5 obrazů, které jsem nasadil a které branou NEPROŠLY

Nasadil jsem je 2026-09-21/22 (v4.40–v4.42) bez brány, kterou kánon vyžaduje. Nejsou
škodlivé (studené čtení v nich není), ale **čtení pak nese význam jiné runy**. Náhrady prošly.

| runa · aspekt | teď (neprošlo) | soudci četli | náhrada IS | náhrada EN | brána |
|---|---|---|---|---|---|
| Ansuz · guðleg leiðsögn | birds make for home ahead of weather… | **Laguz** 3/3 | Gamla konan segir eina setningu og allt borðið þagnar. | The old woman says a single sentence, and the whole table falls quiet. | Ansuz 3/3 |
| Algiz · vernd | the light is kept burning in the window… | **Othila** 3/3 | Hreindýrið lyftir höfðinu og er á varðbergi. | The reindeer lifts its head, on guard. | Algiz 3/3 ×2 kola |
| Mannaz · hugur | a key lies in the drawer… | **Perth** 3/3 | Tvö horfa á sama fjallið og sjá hvort sitt. | Two people look at the same mountain, and each sees their own. | Mannaz 3/3 |
| Mannaz · hugur | the tune stays in the head… | **Laguz** 3/3 (paměť je v klíčích Laguz) | Hugurinn ber mann hálfa leið. | The mind carries you half the way. | Mannaz 3/3 |
| Gebo · félagsskapur | the door stands open and no one needs to knock | **Othila / Wunjo** | Önnur höndin réttir fram og hin tekur á móti. | One hand holds something out, and the other receives it. | Gebo 3/3 |

Poznámky:
- **Algiz — okno** je i ten obraz, ke kterému jsi dnes psal *„flame could be light or lamp,
  cold může být špatné počasí"*. Zkusil jsem ho opravit (přidat „v nečase"), ale **i opravený
  čtou soudci jako Othila 3/3** — světlo pro toho, kdo se vrací domů, je domov, ne ochrana.
  Proto náhrada, ne úprava. Lampu jsem schválně nedal: lampa je pozemek Kenaz ([22]).
- **Mannaz „mysl"** je nejtěžší stránka ze všech: klíčová slova Laguz obsahují *paměť*, Perth
  *skryté*, Ansuz *moudrost*. Obraz „mysli" snadno sklouzne k sousedovi. *„Hugurinn ber mann
  hálfa leið"* je skutečné islandské přísloví (korpus 53×) — slovní typ obrazu, který u
  Mannaz-mysl prošel už pilotem 2026-09-10. Druhá volba soudců: Raidho („half the way" = cesta).
- Starý *„myšlenka chodí celou noc tytéž tři kroky klece"* odešel kvůli studenému čtení
  (DECISIONS 2026-09-22 (4)); zpátky po něm nesahám. Jestli kdysi prošel branou, nevím.

---

## B. Tvoje připomínky z dnešních čtení → návrhy z popisů

### B1. Wunjo — *„proč by Wunjo mělo být stillness? … radost, že paprsky konečně na trávu"*
**Co se stalo:** obraz [27] *„Sólin nær loksins inn í dalinn og allt verður kyrrt"* — čtení:
*„everything goes still — this is Wunjo"*. **Proč:** obraz stojí na **slunci** (jádro Sowilo;
Sowilo má skoro stejný řádek [96]) a na **nehybnosti** (jádro Isy). Tohle jsem ráno zapsal do
backlogu jako „pozemek" — tvoje čtení to potvrdilo nezávisle.
**Popis říká:** *„chvíle, kdy něco zapadne na své místo… můžeš na chvíli povolit ruce…
radost uprostřed cesty… smích u stolu… přijde po napětí."*
**Návrh — nahradit [27] (vyber jeden):**
- **W-a (doporučuji — je to tvůj obraz tráva + „konečně", jen bez slunce jako podmětu):**
  *Börnin hlaupa berfætt út á túnið um leið og grasið er orðið þurrt.* /
  *The children run barefoot onto the field the moment the grass is dry.* — **Wunjo 3/3**
- **W-b:** *Hlátur berst út um opinn gluggann og enginn flýtir sér inn.* /
  *Laughter carries out of the open window and no one hurries back in.* — **Wunjo 3/3**

### B2. Kenaz — *„mluví o teplu a pak fire. To do sebe nepasuje, pokud je to pod kamenem"*
**Co se stalo:** obraz [108] horký pramen z černé skály, aspekt *oheň* → čtení *„hidden heat…
the small fire that keeps the ground from freezing"*. **Proč:** pramen je teplo **bez světla a
bez plamene**; nazvat ho ohněm je nesoulad, který jsi slyšel. Navíc „skryté teplo" už nese [21]
(žhavé uhlíky pod popelem).
**Popis říká:** *„Kenaz je světlo, které něco odhalí. Neosvítí celý svět. Jen malý prostor
před tebou."* A **kyndill / torch je doslova první klíčové slovo Kenaz**.
**Návrh — nahradit [108]:** *Kyndillinn lýsir aðeins nokkur skref fram á veginn.* /
*The torch lights only a few steps of the way ahead.* — **Kenaz 3/3**

### B3. Algiz — *„flame could be light or lamp · cold může být špatné počasí"*
Viz **A** — okno neprošlo ani opravené; náhrada sobem na stráži (*„Algiz se zvedá vzhůru jako
paroží… jako když člověk najednou zvedne hlavu"* — z tvého popisu).
Druhá polovina tvé připomínky — **„the cold" jako abstraktní podstatné jméno** — je zvyk
modelu, ne obraz: v obrazu okna žádná zima nebyla. Viz **C3**.

### B4. Isa — *„voda se nehýbe… musíš být lepší pro Area… fjord, který musí rozmrznout — pokud
by zmrzl, má to být v první větě, ne na konci"*
**Co se stalo:** obraz [99] *„Lognið liggur á firðinum og ekkert bærist, ekki einu sinni fuglinn á steininum"* — **klid, ne
led**. Model si led dovodil sám z runy a vytáhl ho až v poslední větě („until it thaws").
Proto to je matoucí: obraz led nemá, konec ano.
**Popis říká:** *„Voda ztuhne… Pod ledem může voda stále existovat. Jen její pohyb není vidět."*
**Návrh — nahradit [99]:** *Undir ísnum heyrist enn í læknum.* /
*Under the ice the stream can still be heard.* — **Isa 3/3** (druhá volba všech: Laguz)
Led stojí na prvním místě věty, takže ho čtení nemá kam odložit na konec. Pro „Career &
Creativity" je navíc lepší: práce pod ledem **běží dál**, jen není vidět.
Druhá část tvé připomínky (*„the work stops moving"* už ve **druhé** větě) = oblast v těle
čtení, ne v posledním řádku → známá vada, viz **C5**.

### B5. Othila — *„nelíbí se mi ta turf wall, co postavil můj předek. Chce to lepší obraz."*
**Co se stalo:** obraz [83] *„zeď, kterou postavili předkové"* — model z toho udělal
*„**your** forefathers"*, tedy tvrzení o **tvé** rodině. Sousední [84] *„klíče od starého domu
ti leží v dlani, i když tam už nebydlíš"* tvrdí, že jsi kdysi bydlel ve starém domě —
**studené čtení** (sweep ho našel ráno, neověřený).
**Popis říká:** *„dvě tváře: tady jsou tvoje kořeny / co z nich chceš nést dál… některé věci
můžeš položit zpátky na zem a nechat je skončit u tebe."*
**Návrh — nahradit oba:**
- [83] → *Úr gömlu kistunni tekur þú eitt með þér og lætur hitt liggja.* /
  *From the old chest you take one thing with you and leave the rest lying.* — **Othila 3/3**
  (druhá tvář: co si z dědictví vezmeš)
- [84] → *Skaftið á gömlu ausunni er slitið þar sem aðrar hendur héldu um það.* /
  *The handle of the old ladle is worn smooth where other hands held it.* — **Othila 3/3**
  (první tvář: co prošlo rukama před tebou — bez tvrzení, čí ty ruce byly)

### B6. Fehu — *„chleba je spíš share než plenty"*
**Co se stalo:** obraz [2] chléb z pece, dost pro všechny u stolu, aspekt *hmotný blahobyt*.
**Brána tvoji intuici potvrdila i nepotvrdila:** chléb **není Fehu** — ale ani Gebo, kam jsem
ho chtěl přesunout. Soudci ho čtou jako **Jera** (odměna úrody) 3/3.
**Popis říká:** *„Fehu je něco, co proudí… to, co živíš, roste… to, co necháš stát, ztratí sílu."*
**Návrh:** chléb z Fehu **vyřadit**; místo něj *Féð er komið af fjalli og hjörðin er stærri en
í vor.* / *The sheep are down from the mountain, and the flock is bigger than it was in spring.*
— **Fehu 2/3** (sousedem je Jera: podzimní návrat stáda má v sobě i sklizeň). *Fé* je doslova
jméno runy — živé bohatství, které se hýbe a roste.
Chléb: buď zahodit, nebo přesunout k **Jera** (tam ho brána čte 3/3). Rozhodni ty.

### B7. Sowilo — *„Hidden under Grey? Co je to grey"*
„Grey" v obrazu není — viz **C3**. Z popisu ale plyne jiná věc: všech pět obrazů Sowilo je
**slunce, které se objeví** (půlnoční slunce, prorazí mraky, první paprsek na vrcholu…).
Ani jeden nenese to, co tvůj popis říká jako první: *„Neříká ti, kam máš jít. Prostě osvítí
cestu, takže najednou vidíš, kde stojíš… teď to můžeš vidět."*
**Návrh — přidat:** *Í sólskininu sést hvar þú stendur í hlíðinni.* /
*In the sunshine you can see where you stand on the slope.* — **Sowilo 3/3**
(verze „když slunce vyjde" dávala 2/3 — soudci četli svítání = Dagaz; „ve slunci" to odstranilo)

### B8. Berkana × Family & Home — *„zkontrolovat, jak dobře do sebe zapadají"*
**Verdikt: obraz sedí, vadné byly dvě věty kolem něj.** Rebarbora u jižní zdi domu je
Berkana (růst po zimě) a u domu stojí. Co drhlo: (a) vymyšlené „the whole yard still grey"
(viz C3), (b) most *„a home… testing the cold before it commits"* — personifikovaný dům.
Berkana má pro rodinu i silnější obrazy ([105] ovce rodí v zimě v chlévě, [106] kajka vede
káčata k vodě). **Neměnit obraz.**

### B9. Perth × „The Unseen" — *„v Area máme také unseen, stejně jako je Perth"*
Přesně: **„the unseen" je doslova klíčové slovo Perth**, takže oblast a runa říkají totéž
a čtení skrytost zdvojí. Čtení jsi přitom pochválil. **Moje doporučení: nechat** — runa, která
potká vlastní téma, je legitimní zrcadlo. Pokud to vadí, je to otázka **pojmenování oblasti**
(obsahové rozhodnutí), ne promptu.

### B10. Ingwaz — *„závěr takový nic neříkající… to, co je závěr viz níže, by znělo lépe"*
Konec *„What you carry unseen may be closer to ready than to gone"* je obecný tvar zakončení
bez substance runy. Tvůj popis končí otázkou, kterou má jen Ingwaz. → **C1** (strukturální).

### B11. Co funguje — nechat
- **Nauthiz „You are the plant on the sill"** — ten tvar dělá **úhel [6]** *„Open by setting
  the seeker inside the image, at the spot where it is happening."* Neměnit.
- **Ehwaz** („velmi povedené"), **Dagaz**, **Hagalaz** — nic.

---

## C. Vstupy do promptu (strukturální návrhy — každý potřebuje tvoje ano a měření)

### C1. „Otázka runy" jako zdroj pro závěr ⭐ největší páka z popisů
Každý z 25 popisů končí **otázkou, kterou klade jen ta runa** (Ingwaz: *co ve mně už dozrálo
natolik, že to nemusím dál držet uvnitř?*). Dnešní závěry berou tvar ze společné zásoby
(tři tvary × most k oblasti) — **substanci runy nemají odkud vzít**. Přesně to je Ingwaz.
Paměť `co-dela-cteni-silnym` (tvoje potvrzení): *silná je otázka se dvěma skutečnými možnostmi.*
**Návrh:** ke každé runě jedno až dvě **témata otázky** (IS nativně, ne překlad popisu), vložená
jako **zdroj**, ne jako věta k použití.
**Rizika, která je třeba změřit dřív, než to nasadíme:**
1. **Opis** — změřeno 2026-08-15: „použij tenhle text" zvedlo doslovný opis z 12 % na 56 %.
2. **Stejnost** — pevná otázka na runu = všechna čtení Fehu končí stejně. Proto 2 témata a los.
**Měření:** 4 runy × 2 varianty (bez / s tématem) × 6 čtení, produkční model; počítat opis
(n-gramy proti tématu), specifičnost závěru (slepý soudce: „ptá se na něco, na co by se zeptala
jen tahle runa?") a opakování mezi čteními téže runy. Levné, rozhodující.

### C2. „Čím runa není" — NE do promptu, ale jako soudce
Skoro každý popis má větu druhé strany: *Fehu není slib, že něco získáš · Hagalaz není trest ·
Sowilo není jen „všechno bude dobré" · Ehwaz není slepá důvěra · Laguz neříká slepě věř emocím.*
To je **hranice zrcadlo/orákulum runu po runě**. Do promptu ji **nedávat**: prompt, který věc
pojmenuje a zakáže, ji model opakuje jako formuli (paměť `prompt-nepojmenuj-co-hned-zakazes`).
**Návrh:** použít ji jako **kontrolu** — soudce u každého čtení ověří, že nepřekročilo hranici
své runy (Hagalaz jako trest, Fehu jako slib zisku…). Patří k Prófsteinnu (`scripts/profsteinn.js`).

### C3. „Grey" / „the cold" — beze změny promptu, sledovat
„Grey" **v promptu není** (ověřeno: systémový prompt + 160 protlačených user promptů = 0).
Je to model: ze tří dnešních výskytů je jeden v pořádku (lišejník na mohyle *je* šedý), dva jsou
**barva místo věci** („hidden under grey", „the whole yard still grey") — oba u obrazů, které
naznačují nepojmenované „předtím" (slunce prorazí; rebarbora ze studené půdy). Tatáž rodina je
„the cold" u Algiz. V předchozích verzích od 10. 9.: 1 výskyt ve 37 čteních; dnes (v4.42) 3 z 22, z toho 2 vadné.
**Návrh:** zatím nic — zákaz v promptu by slovo zasadil. Pokud se to v dalších čteních vrátí,
měření: 6 čtení Sowilo [62] + 6 Berkana [107] na produkčním modelu a počítat „grey".

### C4. Ask teď vidí „destiny" a „fate in the making"
Od v4.40 dostává Ask klíčová slova run. U **Prázdné runy** mezi nimi je *destiny*, u **Perth**
*fate in the making*. Ask má zákaz osudu (`_noColdRead`), takže je to hlídané. Klíčová slova
jsou 🔒 kánon (sdílí je i strom), měnit je nenavrhuji. **Návrh: sledovat Ask odpovědi u
těch dvou run**; kdyby osud prosakoval, řeší se to v Asku, ne v datech run.

### C5. Oblast v těle čtení (Isa: „the work stops moving" ve 2. větě)
Známá vada, už v `RUNAR_BACKLOG.md` (výjimka ze zákazu oblasti má platit jen pro poslední větu;
ověření 2026-09-20 našlo 9 z 11 přestupků v těle, ne v mostu). Nic nového — jen další doklad.

---

## D. Návod pro uživatele (EN + IS) — pod statickou runou

**Stavba** = tvoje hierarchie z RUNAR_DESIGN (*„uživatel položí otázku → runa otevře úhel
pohledu → Rúnar dá runě hlas → význam najde člověk sám"*), potvrzená 2026-09-05 jako kontrola.
Předposlední řádek je tvoje schválená věta ze zásoby citací (*„Rúnar drží světlo, ukazuje, kam
se může člověk podívat, ale nevidí za něj"*) — EN i IS psané znovu, ne doslovně.
Záměrně **jen jedna** věta typu „není X, ale Y" (zásoba citací varuje, že dvě takové zní jako šablona).
Neříká „vždycky otázka" — závěr čtení je buď možnost, nebo otázka (ověřeno na dnešních čteních).
Neslibuje nahrávku („heyrir þú") — ne každá runa v Kolekci ji má.

**EN — How a reading works**
> You bring the question — where you stand, and what you are carrying.
> The rune opens a way of looking at it: an angle you might not have taken on your own.
> Rúnar gives the rune a voice. It speaks through an image of a place or a moment, something happening out in nature or at a kitchen table. A rune holds more than one word can.
> The meaning is yours to find. Read the image slowly and notice what stays with you — one detail, one movement. That is where the reading touches your life.
> The last line is not advice, but a possibility or a question for you to weigh.
> Rúnar carries the light and points to where you might look. The seeing is yours.
> Here in the collection, each rune stands on its own. In a reading, it speaks to you.

**IS — Hvernig lestur verður til**
> Þú kemur með spurninguna. Hún snýst um stöðu þína og það sem þú berð með þér.
> Rúnin opnar nýtt sjónarhorn á hana, leið til að horfa sem þú hefðir kannski ekki valið.
> Rúnar gefur rúninni rödd. Hún talar í gegnum mynd af stað eða andartaki, af einhverju sem gerist úti í náttúrunni eða við eldhúsborðið. Rún rúmar meira en eitt orð.
> Merkinguna finnur þú. Lestu myndina hægt og sjáðu hvað situr eftir í þér, eitt smáatriði eða ein hreyfing. Þar snertir lesturinn líf þitt.
> Síðasta línan er ekki ráð, heldur möguleiki eða spurning sem þú vegur og metur.
> Rúnar ber ljósið og bendir hvert þú getur horft. En það ert þú sem sérð.
> Hér í safninu stendur hver rún ein og sér. Í lestri talar hún til þín.

IS není překlad EN — obě stojí samy (např. *„vegur og metur"*, *„Rún rúmar meira en eitt orð"*,
*„En það ert þú sem sérð"* nemají v EN doslovný protějšek a naopak).

**Umístění (návrh):** v detailu runy v Kolekci **pod Rúnarovým učením** (`#cd-audio-player`),
**sbalené** — jeden řádek *„Hvernig lestur verður til +"* / *„How a reading works +"*, rozbalí se
klepnutím. Tvar převzatý z Asku (`.ask-lbl` s `+`/`−`), ať to vypadá jako zbytek appky.
Sbalené proto, že by sedm řádků pod každou otevřenou runou zakrylo to, kvůli čemu tam člověk
přišel. **Jen v nastaveném jazyce** — tedy spolu s backlogem „Statické runy jen v jednom jazyce"
(`RUNAR_BACKLOG.md` 2026-09-22), ať se detail runy nepřestavuje dvakrát.
Alternativa: jeden blok na konci celé Kolekce (viditelný i bez otevřené runy).

---

## E. Brána — surová čísla

Kolo 1 (25 obrazů, 3 soudci): **nasazené 9/14 prošlo · navržené 9/11 prošlo.**
Neprošly: 5 nasazených v tabulce A + navržené „okno v nečase" (Othila 3/3) a „chléb jako Gebo" (Jera 3/3).
Kolo 2 (5 náhrad + 4 kontrolní obrazy z kola 1): **náhrady 5/5 · kontroly 4/4 stejně jako v kole 1.**
Klíč (které runě obraz patří) viděl jen CODE-tune, soudci ne.

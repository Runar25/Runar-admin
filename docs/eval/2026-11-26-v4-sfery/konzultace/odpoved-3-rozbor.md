# Rozbor odpovědi Gemini 3 (na kostru V4, oddíl 9) — 2026-11-27

**Vlastní jen:** rozbor odpovědi. Doslovný text: [zdroj-gemini-odpoved-3.md](zdroj-gemini-odpoved-3.md). Platný stav zůstává v
[kostra-v4.md](../kostra-v4.md). **Neměřeno:** porovnání proti ownerovým popisům run (`RUNAR_POPISY_RUN.md`), proti kostře a proti
rozhodnutím, čtením. Slepý test záměny (4M1) zatím neběžel — překryvy v oddílu 2 jsou kandidáti na něj, ne nález.

Gemini popisy run neměl (sám to píše), opřel se o kostru a „standardní vymezení futharku“. Proto jsem test sféry (1) „stojí na ownerově
popisu“ udělal za něj tady.

## 1. Sféry × ownerovy popisy run (9.1)
✓ = stojí na popisu · ~ = částečně · ✗ = v popisu není (potřebuje ownerovo slovo, kostra 4.2 test 1)

| runa | sféra | proti popisu | poznámka |
|---|---|---|---|
| Kenaz | Clear Sight | ✓ *„světlo, které něco odhalí … i něco, co bychom raději neviděli“* | |
| | Shaping | ~ popis: *„možnost něco vytvořit, opravit nebo změnit“* | popis tvoří z poznání, ne žárem v materiálu; v režimu Land se špatně ukazuje (viz 9.2) |
| | Kindling | ✓ *„oheň potřebuje potravu … bez péče zase zhasne“* | nejsilněji z popisu |
| Isa | Stillness | ✓ ticho, zastavení — **ale proti popisu v jednom bodě** | Gemini: *„hloubka pod ní zůstává nehybná“*. Owner: *„pod ledem může voda stále existovat, jen její pohyb není vidět“*. Opak — opravit. |
| | Sharp Air | ~ popis: *„zůstane před tebou jedna věc. Jedna linie“* | soustředění ano, vyčištěný vzduch je obraz Gemini |
| | Thin Ice | ✗ | zdánlivá pevnost v popisu Isy není |
| | *(chybí)* | — | popis má silnou stránku *„ještě nenastal jeho čas … co zůstává, když přestaneš tlačit“* (vydržet, nechat být); Gemini ji nemá |
| Wunjo | Clean Joint | ✓ *„něco na okamžik zapadne na své místo“* | |
| | Slack String | ~ *„můžeš na chvíli povolit ruce … přijde po napětí“* — **ale Gemini píše „po dokončené práci“** | popis: *„radost nemusí být odměnou za to, že je všechno hotové. Může existovat uprostřed cesty“*. Opak — opravit. |
| | Shared Hearth | ✓ *„radost, která se může sdílet. Smích u stolu“* | ohniště je obraz Kenaz (kostra 4.2) → owner má stůl, ne oheň |
| Nauthiz | Hard Friction | ~ *„tlak, který tě přiměje všimnout si“* | oheň nouze (nauðeld) v popisu není; Gemini tentokrát poctivě píše „bez opory v runových básních“ |
| | Narrow Ration | ✓ *„tlak, který odděluje potřebu od touhy“* | nejsilněji z popisu |
| | Bare Exposure | ✗ | z norské runové básně („nahý mrzne“); historie je jen zdroj (paměť `vyznamy-run-historie-jen-zdroj`) |
| | *(chybí)* | — | druhá strana z popisu: *„když člověk příliš dlouho tlačí proti tomu, co není možné, tlak se začne obracet dovnitř“* |
| Ansuz | Listening Ear | ✓ *„je také o tom naslouchat“* | |
| | Spoken Weight | ~ *„co zaslechneš a co v tobě zůstane déle, než by mělo“* | „nelze vzít zpět“ je Gemini |
| | Open Breath | ~ *„runa hlasu, dechu“* | |
| | Carried Sound | ~ | s Open Breath jeden mechanismus (vzduch nese tón) → test (3) odlišnost uvnitř runy spíš neprojde; sloučit |
| | *(chybí)* | — | popis: slovo, které *„pojmenuje tak přesně, že už to nejde nevidět“*, a druhá strana *„slovo může vytvořit obraz, který skutečnost zakryje“* |

**Shrnutí:** z 16 sfér 7 stojí na popisu, 6 částečně, 2 v popisu nejsou (Thin Ice, Bare Exposure). Dvě jdou **proti** popisu (Isa Stillness,
Wunjo Slack String). U Isy, Nauthiz a Ansuz chybí stránka, kterou owner v popisu má (u Nauthiz a Ansuz právě druhá strana runy).

## 2. Překryvy mezi runami — kandidáti na slepý test 4M1 (neměřeno)
1. **Wunjo Slack String × Eihwaz a Tiwaz:** tětiva a luk. Tis (Eihwaz) je dřevo na luky; Tiwaz má v popisu *„šíp, osa a napětí“*. Gemini
   to porovnal jen s Isou.
2. **Wunjo Shared Hearth × Kenaz:** ohniště je jeden ze tří obrazů Kenaz.
3. **Kenaz Kindling × Nauthiz Hard Friction:** obojí je zrod ohně z malého začátku; rozdíl „už hoří“ × „vykřesáno odporem“ je v textu, ne
   v obraze.
4. **Kenaz Clear Sight × Isa Sharp Air:** obojí končí tím, že vystoupí obrysy.
5. **Nauthiz Bare Exposure × Isa:** mráz na holém těle.
6. **Isa × Nauthiz už v ownerových popisech:** Isa *„některé věci se nedají urychlit“* · Nauthiz *„něco nejde urychlit“*. Sféra musí vzít tu
   stránku, kterou druhá runa nemá.

## 3. Zdroje u tvrzení (9.1)
- Nauthiz „islandská a norská runová báseň, sloka 10“ (Gemini): v obou severských básních (16 run) je nauð podle mé znalosti 8. sloka; 10. je ve
  staroanglické. Citát „nahý mrzne“ odpovídá norské. Text básní v repu není → **neověřeno nástrojem**, jen upozornění.
- Ansuz „ansuz / óss = ústa“: ansuz je bůh (áss); „ústa“ je latinské *os*, jak se čte staroanglická sloka 4. Gemini slévá dvě slova.
- Kenaz „zdroj: kostra-v4.md 4.2“ — to je náš vlastní text, ne zdroj.
- Ostatní sféry poctivě „vlastní návrh / bez zdroje“. Na výsledek to nemá vliv: měřítko je ownerův popis a jeho slovo, ne historie.

## 4. Runa dne Kenaz, Land (9.2)
| sféra | věta | slov | kontrola |
|---|---|---|---|
| Clear Sight | A single spark inside a dark basalt cave reveals the jagged shape of the wall. | 15 | čistý obraz, význam chybí |
| Shaping | Rising geothermal steam softens frozen moss until the underlying black stone shows its rough edge. | 15 | čistý obraz; nic se netvaruje, jen odkrývá → ukazuje Clear Sight nebo Perth, ne Shaping (4M3) |
| Kindling | Dry driftwood caught by a small flame turns cold coastal wind into steady, usable heat. | 15 | čistý obraz; „oheň promění vítr v teplo“ fyzikálně nesedí |

- ✅ splněno: 12–16 slov (spočítáno), třetí osoba, tři různé kulisy, bez „does not … it simply“.
- ✖ **Rozhodnutí (7) potřetí nesplněno.** Gemini píše „obraz i význam v ní“, ale žádná věta neřekne, co obraz znamená. Je to přesně případ,
  kvůli kterému (7) vzniklo: Sowilo *„obraz je v pohodě, ale … hůř chápe, co má znázorňovat“*.
- **Jak vypadá věta podle (7)** — ukázka labu ve tvaru ownerových vzorů, z jeho popisu Kenaz (🔶, neověřeno soudcem ani ownerem; jen
  aby Gemini viděl cíl):
  - Clear Sight: *„A small light carried into the dark gives shape to what was there all along.“* (15) — popis: *„něco, co tam bylo celou
    dobu, ale ve tmě to nemělo tvar“*
  - Kindling: *„A new flame stays alive only as long as someone keeps feeding it.“* (13) — popis: *„oheň potřebuje potravu“*
  - Shaping v režimu Land: nepodařilo se mi napsat — tvarování je práce ruky, tedy režim Craft (výhrada j z [runa-dne.md](../runa-dne.md)).
    Možná je Shaping sféra jen pro Craft; rozhodnutí patří ownerovi.

## 5. Pravidla variant (9.3)
**Sedí:** střídat délku (2–4 věty, jako kostra 4.3) · střídat měřítko (detail × celek) · Land i Craft v jedné sféře · zákaz konstrukcí
„X does not Y“, „X is not Y, it is Z“ a definic (4M7).

**Nesedí:**
1. **Pravidlo 1 je nová šablona.** Pevně přiřazený začátek podle čísla varianty (1 = materiál, 2 = děj, 3 = místo, 4 = „Only when…“) dá
   stejnou sadu čtyř začátků u každé sféry. U 25 run × 3–4 sféry je to stokrát „Only when…“ — tik přes knihovnu, ne uvnitř sféry.
2. **Varianta 2 „obraz → mechanika → tření“ je pevné pořadí**, které kostra 4.3 odmítla (*„pevné pořadí čtyř vět ne“*).
3. **Návrh labu:** pravidla jako rozložení hlídané strojem, ne přiřazení podle čísla — v jedné sféře žádné dvě varianty se stejnými prvními
   dvěma slovy; v celé knihovně žádný začátek ani stavba nad stanovený podíl (práh určí měření 4M5 nad první várkou).

## 6. Kolekce run (9.4)
**Sedí s ownerem:** sféra ukáže název, popis až po otevření ve čtení — *„nenabídneme všechno naráz, tak má důvod se vrátit“* (zasady-pusobeni
1.2); počet „2 / 3“ a značka otevřeno (kostra 4.6).

**K rozhodnutí ownera (DECISIONS 2026-11-26 (10): „koukneme na to, jak to bude vypadat“ — tohle je ta ukázka):**
1. **ESSENCE od Gemini nahrazuje ownerův text.** Kolekce dnes ukazuje čtyři odstavce ownerova textu runy (`coll_rune`; KUKY 2026-09-23:
   text *„přesně“*). Návrh labu: ownerův text nechat, sféry přidat pod něj.
2. **„Locked — appears when drawn“** neodpovídá toku 4.1: sféru si člověk ve čtení **vybere** (nebo „Let the rune choose“), netahá ji.
3. **„[ DRAW A READING ]“** ze stránky Kenaz — nejasné, jestli vytáhne náhodnou runu, nebo Kenaz. Kenaz na přání by nebyl tah.
4. Podtitul „The Torch“ je nový štítek, v datech run není.

## 7. Díry v kostře (9.5)
1. **Emoce × varianty — díra je, ale jinde, než ji Gemini vidí.**
   - Gemini předpokládá, že člověk volí režim Land/Craft. Kostra to neříká; „čočky“ jako volba člověka jsou nápad Gemini z PDF
     (zasady-pusobeni 3.8). → nová otázka 4R9.
   - **Gemini přehlédl větší díru:** počítadlo × emoce. Kostra 4.3: člověk dostane variantu, *„kterou ještě nečetl“*; 4.4: emoce vybírá
     variantu podle řady. Má-li sféra jednu variantu na řadu, kdo dvakrát zvolí Heavy u téže sféry, dostane buď totéž, nebo jinou řadu.
     → návrh labu do 4.4: emoce je **přednost, ne filtr**; když varianty řady došly, přijde nečtená varianta jiné řady.
   - Kolik variant: tři řady + jedna bez zabarvení (Skip) = 4 → sedí s horní půlkou 4R5 (3–5).
2. **4R6 (sféry jediným zdrojem runy dne):** rozumný argument, rozhoduje owner. Ownerův vzor Ansuz *„A few words, spoken or heard, may stay with
   you longer than you expect“* stojí na jeho popisu (*„co v tobě zůstane déle, než by mělo“*) — z popisu, ne nutně ze sféry.
3. **Norny bez Asku:** nic nového, už je to 4R7; Norny jsou odložené.
4. **4M4:** souhlas. Když obraz nepíše model, měří 4M4 značení knihovny, ne model. → v kostře opraveno (tabulka 7).

## 8. Co z toho jde do kostry
- 4.4: emoce = přednost, ne filtr (🔶) · 7: 4M4 měří značení knihovny · 8: nová otázka 4R9 (kdo volí režim) · 9: kolo 3 proběhlo, další krok.
- Sféry zůstávají neschválené. Pro další kolo: opravit dvě sféry proti popisu, doplnit chybějící stránky z popisu, sloučit Open Breath
  a Carried Sound, vyměnit ohniště u Wunjo a luk u Slack String; pak slepý test záměny (4M1) proti všem 25 runám.

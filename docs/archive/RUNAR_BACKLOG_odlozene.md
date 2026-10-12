# RUNAR_BACKLOG_odlozene.md — ⏸ odložené z RUNAR_BACKLOG.md: výzkum a nápady k promptu, obrazům, Asku, Vegvísir, staré sweepy
# Přesunuto doslova 2026-10-12 (owner: „prompt už je prakticky hotovo. takže pozor na to, co tam leží“). NEJSOU to úkoly a nic tu
# není potvrzeno jako hotové: vrací se, až se vada objeví v nových čteních a owner na ni upozorní (CLAUDE.md §30). uz_vime.js hlásí ⏸.
# Co platí dnes, vlastní kód, git log a RUNAR_DECISIONS.md.

## Přesunuto 2026-10-12

### ⟵ Reading quality (audit 2026-07-04)


- [ ] ℹ️ **PRIORITA ZÁMĚNNOSTI RUN: backlog, ne honička (KUKY 2026-09-10).** Uživatel jméno runy vždy vidí; klíčové je runu ve čtení **kvalitně vysvětlit** (= položka „metafora vedle metafory"). Identitní test **zůstává BRÁNOU na nové obrazy** (zabil 14/16 kandidátů), přestává být cílem. Platí pro položky záměnnosti níž (5 run 1/2 · Algiz · gravitační jámy). Detail → `RUNAR_DECISIONS.md` 2026-09-10.
- [ ] **ALGIZ: mechanismus NALEZEN čtením textů (Cowork 2026-09-10) — text jde za obrazem, ne za aspektem, a každý zvolený předmět seděl na cizím pozemku** (kámen = Isa/Othila · práh = Thurisaz · ovce+jehně = Berkana · čekání na počasí = Isa). Recept, jak psát Algiz, existuje a je testovatelný bránou → `docs/eval/2026-09-10-algiz-kandidati-texty.md`, sekce VERDIKT. **Není do koše — čeká na priority run od ownera.** Původní stav (2026-09-09): šest kandidátů ve dvou kolech neprošlo.
  ⚠️ **OPRAVA vlastního závěru z téhož dne:** napsal jsem, že za to může sdílený klíč `protection` s Thurisazem. **Neplatí** — Coworkův jednoslovný slovník ten překryv rozvázal (`ward` × `aegis`) a Algiz se přesoudil **3/18 → 2/18**, tedy beze změny. Sdílený klíč byl souběh, ne příčina; udělal jsem z korelace mechanismus, aniž jsem ho otestoval. → `RUNAR_EVAL_LOG.md` 2026-09-09 (8).
  **Stav po 2026-09-10:** příčina popsaná (recept výš) — „napřed zjistit z textů" je HOTOVO, udělal Cowork. Další krok = kandidáti podle receptu přes bránu, až přijdou priority.
- [ ] **Jednoslovný slovník (Cowork 2026-09-09) — mechanicky bezvadný, identitu nekupuje.** 25 run · 119 klíčů · nula kolizí · pět sdílených klíčů rozvázáno. Ale změřeno na týchž čteních (mění se jen legenda soudce): **78 % → 78 %**, kolizní runy **55 % → 55 %**. → **Nenasazovat s očekáváním, že spraví identitu.** ⭐ Jeho skutečná hodnota může být **výš v procesu — jako cíl pro autora** při psaní nových obrazů (přesné slovo místo mlhavé fráze); to je ale **NEZMĚŘENO** a nemá se to tvrdit. Chybí k němu: **IS ekvivalenty** (CODE, jedno kolo s BÍN) ✅ **VERDIKT PŘIJAT (owner 2026-09-10, převzetím doporučení GPT): autorská pomůcka, přesně v zapsaném statusu.** Sedm „kolizních míst" = **watch-set pro tvorbu textu**, ne technické kolize (problém vzniká, až když text Dagazu ZNÍ jako Kenaz — vlastnost obrazu, ne slovníku). Průchod proti DECISIONS/DESIGN udělal Cowork: **čisté**; slovo-po-slovu průchod odložen dle priorit. → `RUNAR_DECISIONS.md` 2026-09-10.
- [ ] ⭐ **Kritérium pro nové obrazy, vypadlo z devíti zabitých kandidátů** (2026-09-09): **situační obraz drží identitu líp než fyzická scéna.** Každý propadák narazil na sloveso nebo předmět souseda — zemětřesení → Hagalaz · „řekneš to u stolu" → Ansuz (voice) · lodě v přístavu → Isa (waiting) · neoraný kámen → Othila (heritage) · ovce s jehnětem → Berkana. Co prošlo 3/3, byl v obou případech **čin s cenou, bez rekvizity patřící jiné runě**. → **„Obraz" nemusí být fyzická scéna** (owner/GPT 2026-09-09: *„nemůže být obraz i slovní vyjádření?"* — odpověď je ANO a je změřená). Zapsat do zadání palety.
- [ ] ⭐ **VÝKLAD JE METAFORA VEDLE METAFORY — runa se v obraze nevysvětlí** (owner 2026-09-09 o větě *„Eihwaz is the tree that sheds the branch it cannot feed and keeps standing"*: *„tohle je prostě metafora vedle metafory. Obraz má tvořit hezký obraz runy, ale pak to musí být smysluplně vysvětleno — co je ta runa v obraze a její význam."*). **Je to VADA, ne vkus:** obraz udělá scénu a esenční řádek k ní přilepí druhou scénu, takže nikde nepadne, co runa je. Změřeno: stopu prostého významu runy nese **17 %** čtení (statická květnová 93 %). ⚠️ **Instrukcí to nejde** — vyzkoušeno a mrtvé je PĚT ploch (zákaz v esenčním řádku · aspektové slovo · celý klíčový seznam · čtyři ukázkové věty v systémovém promptu · `YOUR STANCE: draw the picture and stop there`) → `RUNAR_EVAL_LOG.md` 2026-09-09 (2) a (3). ⚠️ **Není to totéž co krytí 43 % níž:** krytí říká, KTERÝ význam je vůbec dosažitelný — tohle říká, že se ani ten dosažitelný nevysloví.
- [ ] ⭐ **MOŽNOST: KRÁTKÉ OBRAZY (2–4 slova) v `RUNE_IMAGES` místo celých vět** (KUKY 2026-09-14 po testech,
  NErozhodnuto — *„teď jen testujeme, jak co změnit, abychom dosáhli cíle"*). Owner: *„kratší obrazy jsou lepší než
  dlouhé, které Rúnara tlačí do toho, aby v jedné krátké větě napsal všechno z obrazu"*. Doloženo produkcí: dlouhý
  obraz čtení opakuje skoro doslova (Ansuz telefon, Algiz lampa) — viz položka „Obraz se neukazuje, on se OPISUJE" výš.
  **Podmínky z testů:** (a) obraz musí být **stvořený pro tu runu**, aby v něm Rúnar našel, co potřebuje —
  *„the road snowed shut"* sedí Raidhu, ne Ise; *„Raidho potřebuje např. jezdce na koni"* · (b) **aspekt se do čtení
  vtlačí** (`focus on: the road` → „taking its own road"); owner: *„aby Rúnar nehledal pořád, jak dostat ROAD do
  čtení"* — aspekt smí být jen klíč z `RUNES[].k` (smoke ㉤), Raidho `k` = *the road, movement, natural rhythm,
  right action*; *travel/journey* tam není, přitom IS jméno už je `Raidho (Ferðalag)` · (c) IS krátké obrazy
  netestovány. Testy → `RUNAR_EVAL_LOG.md` 2026-09-12 („Krátký obraz", „flying bird over") a 2026-09-13
  („Nové krátké obrazy Isy").
- [ ] ⭐ **PO RESETU — testy čekající na tokeny ownera** (KUKY 2026-09-18: *„zapiš si ten test na 24 agentů, nebudu mít
  tokeny, spustíme po resetu"*). Kontext → `RUNAR_EVAL_LOG.md` 2026-09-18 „Jádro obrazu + místo" a „Rytmus vět".
  1. ✅ HOTOVO 2026-09-19 (`RUNAR_EVAL_LOG.md` „Identita runa × místo": 10/12, oba pády na břehu; jméno osoby v testu
     maskovat). **Identita runa × místo na RIZIKOVÝCH runách (24 agentů, owner SCHVÁLIL):** Isa · Laguz · Tiwaz · Algiz × místa
     *on the shore* · *across a black lava field* · *in fog*. Jádro = produkční obraz runy bez místa (u obrazu, který
     místem SÁM je, vzít jiný řádek téže runy). Prompt v4.26, losy pevné jako u Raidha (úhel 6, konec open2,
     `LENGTH_BUDGETS[1]`, jméno Thor uprostřed, bez čočky). 12 slepých pisatelů (*„You do not know today's date or the
     season."*) + 12 slepých soudců **bez esenční věty**, volba ze všech 25 run (legenda `RUNES[].k`). Stavba a workflow →
     `docs/eval/2026-09-18-jadro-a-misto/skripty/`. Srovnání: tytéž runy s dnešním obrazem (identita 2026-09-09 (6)).
  2. ✅ HOTOVO 2026-09-18 (`RUNAR_EVAL_LOG.md` „KROK 2 a rytmus": páka ve zprávě 3/3, hlasové pravidlo nic; čeká na ownerův
     verdikt nad texty). **Rytmus — jedna změna na Raidhu (3 čtení):** dokonalé čtení má větu o 6 slovech, 12 testovacích žádnou pod 10.
     Páka do zprávy ke čtení (ne do systému): věty různé délky, jedna velmi krátká. Obrácená páka (§25): všechny věty
     stejně dlouhé → musí to zhoršit. Druhá páka zvlášť: hlasové pravidlo *„sometimes two joined by a comma"* (13/13
     úvodních vět má právě jednu čárku).
  3. ✅ HOTOVO 2026-09-18 — NE, „You stand" dělá úhel 6 (6/11 proti 0/47); po KROKU 2 hlídat mimo úhel 6 v produkci.
     **„where this person is standing right now" (`_spine`) → „You stand"?** Nejdřív levně: produkční čtení ownera, podíl
     začátků *You stand* podle úhlu (`prompt_draws.angle`); je-li vysoký i mimo úhel 6, pilot bez té věty (3 čtení).
- [ ] ⭐ **ŠEDÁ A VÍTR = pokyn „The image must be sensory" bez brzdy** → ROZHODNUTO 2026-09-19 (ownerovo pravidlo + měření):
  věta je duplikát hlasu *„if it cannot be felt…"* → ODEBRAT (handoff CODE-tune); s ní zmizela i mlha → *„the grey"*. Původně: (změřeno 2026-09-19, `RUNAR_EVAL_LOG.md` „Odkud
  grey"): po KROKU 2 grey/wind 8/9; bez té věty 0/3, s vrácenou větou o počasí 0/3. Owner rozhodne mezi S (věta pryč) a W
  (brzda zpět — bod 7 CODE-tune), texty obou ramen jsou holé. Zvlášť: **mlha → „the grey" jako podstatné jméno** (model
  nechce opakovat „fog") — týká se obrazů a míst s mlhou; test „jmenuj věc pokaždé jejím jménem" zatím neběžel.
- [ ] **Tvar „VĚTA" drží „may be" hůř než dvě možnosti a otázka** — 2 ze 16 posledních vět vypadly z tvaru
  možnosti, obě u tvaru věta (`ENDING_OPEN[0]`, `ENDING_HEAVY[1]`), doklady v EVAL_LOG 2026-09-20 (11).
  Patří do tvrdých kontrol produkčního kandidáta; při větším vzorku ověřit, jestli to není náhoda.
- [ ] **KANDIDÁT: opravný průchod IS s KORPUSOVOU BRÁNOU** (EVAL_LOG 2026-09-23 (4) a (5); vyžaduje úpravu §2).
  Holý korektor NEBEZPEČNÝ: na 30 ownerových čteních 10 oprav, ale 3 škody (1 obrací význam) + 1 nejisté.
  Všechny škody by zastavil korpus (starý tvar doložený, nový ne). **Další test:** korektor navrhne → n-gram
  Árnastofnun schválí (použít jen, když nový tvar doložený a starý ne) → změřit na týchž 30 čteních, jestli
  zůstanou opravy a zmizí škody. Korektor musí dostat **rod oslovení** (kk/kvk/hk). Místo v produkci: text pro
  deník a hlas, ne živý stream (latence ~8 s).
  → **Test 2026-09-26 (EVAL_LOG 2026-09-26 (2)):** brána zastavila 3/3 škody v každém okně, ale propustila jen 3 z 10 oprav
  (pravopis a tvar: *bótnum*, *loftins*, *flýja honum*); opravy vazeb, vložení a delší přeformulování korpus (≤ 3 slova) neposoudí.
  **Doporučení:** automaticky jen změny, které brána propustí (okno 2 slova); ostatní změny korektoru jako NÁVRH k ověření
  (is-vazba + owner), nikdy rovnou do textu. Další krok, až bude korektor v plánu: větší vzorek škod (dnes jen 3).
- [ ] **Rada do života v produkčních čteních Opus 4.8** — 3 z 28 EN (*„Notice which direction your body already faces before
  your mind weighs the reasons"* 2×, *„Watch what you carry toward another"*). Porušuje *„Rúnar never tells the seeker what to do"*
  (jen v systémovém promptu, který model poslouchá hůř — CLAUDE.md „KLÍČ"). ⚠️ **Vstup do obrazu** (*„See the faint crease…"*,
  *„Look closer, and you see…"*) vadou NENÍ — owner 2026-09-23: *„to je stejné, jako by řekl podívej."* Test na radu →
  EVAL_LOG 2026-09-06 (*„dá se věta smazáním slov převést na rozkaz?"*). Změřit na víc čteních, pak rozhodnout.
- [ ] **Esenční řádek nechává runu jednat jako fyzickou sílu ve scéně** (EVAL_LOG 2026-09-23 (8) bod 2) — *„Jera lifts that
  cloth a little higher each hour"* (PROD), *„the tighter Nauthiz draws the coil against itself"*. Runa jako podmět slovesa:
  Opus 12/28, sol 28/28. Tentýž řádek říká *„No invented mechanism"*. Owner: *„to uživateli asi moc neřekne."* Rozlišit
  runa-vlastnost (*„Nauthiz is the tightness that holds"*) × runa-síla; změřit a navrhnout úpravu esenčního řádku (CODE-tune).
- [ ] ⭐ **Úhel [4] „out of sight" × zvukový obraz** — owner 2026-09-23: *„nemůže být použito pro zvukové obrazy."* Zkoušena
  vestavěná výjimka podle precedentu úhlu [2] (EVAL_LOG 2026-09-23 (8) bod 4): Opus 4.8 zvuk v prvních dvou větách 0/4 → 3/3.
  EN `… If the image lives in sound, open with what is heard but not seen.` · IS (ověřeno korpusem) `… Ef myndin berst að
  eyrum, byrjaðu þá á því sem heyrist en sést ekki.` ✅ **Owner rozhodl výjimku** (DECISIONS 2026-09-23 (17)) → handoff
  CODE-tune předán; zbývá nasadit.
- [ ] **Model opakuje slova zadání „friction"** — *„Name the friction honestly"* → *„The friction is plain"* (Opus 5 EN 2×),
  *„Núningurinn er…"* (Opus 4.8 IS). Týž vzor jako „look closer" (EVAL_LOG 2026-09-23 (7)): pokyn nese slovo, které se dá
  zopakovat. Změřit četnost v produkci, pak přeformulovat bez pojmenování (paměť `prompt-nepojmenuj-co-hned-zakazes`).
- [ ] **HLAS (ElevenLabs) — možnosti a skutečná spotřeba** (owner 2026-09-24: *„budu se na to muset podívat… nevím, jestli se u nich
  taky něco nezměnilo"*). **Stav k 2026-09-24** (ověřeno na elevenlabs.io/pricing/api a /docs/overview/models; stránky datum neuvádějí,
  co je nové od června, **nevím**):
  - **Tarify beze změny** proti `RUNAR_PRICING.md`: Starter $6 (60 000 znaků), Creator $22 (220 000), Pro $99 (990 000), Scale $299
    (2 990 000), Business $990 (9 900 000). Přečerpání $0,10 / 1 000 znaků (Multilingual, v3) a $0,05 (Flash/Turbo).
  - **Modely:** islandsky umí JEN rodina v3 — `eleven_v3` (dnes pro IS) a `eleven_v3_conversational` (nízká latence ~280 ms).
    `eleven_multilingual_v2` (dnes pro EN) islandštinu neumí; `eleven_flash_v2_5` o 50 % levnější, islandštinu neumí;
    `eleven_flash_v2` jen angličtina; **Turbo = zastaralé**.
  - ✅ **Rozhodnuto 2026-09-26 (owner): anglický hlas ZŮSTÁVÁ `eleven_multilingual_v2`** — *„tak jak to je, má důvod a tím důvodem
    je hlas"*. Flash ani v3 pro EN se nezkouší. (Islandština: `v3_conversational` nezkoušeno, nikdo nechtěl.)
  - ⚠️ **Ceník počítá anglický hlas jako Flash, kód používá `eleven_multilingual_v2`** (`v2/runar-config.js`, `elevenlabs-proxy`,
    `elevenlabs-static`) → EN hlas je v ceníku podhodnocený 2×. Model je zapsaný na 3 místech — při změně sáhnout na všechna.
    ✅ ~~**Po rozhodnutí 2026-09-26 zbývá opravit ceník**~~ (`RUNAR_PRICING.md`: EN = Multilingual $0,10/1k, ne Flash $0,05) — *hotovo 2026-10-11
    při přepočtu na sol (`scripts/utils/pricing_tabulka.js` bere model hlasu z elevenlabs-proxy a sazbu z `EL_PRECERPANI`).*
  - **Skutečná spotřeba a kdy na vyšší tarif** → handoff CODE-tune 2026-09-24 (položka níž).
- [ ] **KANDIDÁT: věta za obrazem, která přiměje model obraz PŘEVIDĚT** (CODE-read 2026-09-23, EVAL_LOG 2026-09-23 (6)
  a (7)). Znění *„look closer, at what someone there would notice first"* **zamítnuto pro produkci**: u Opus 4.8 prosakuje
  jako rozkaz posluchači (6 → 14 z 28 čtení, 4× doslova *„Look closer"*), celkově lepší čtení nezjištěno. Myšlenka ale
  funguje u obou modelů (začátek obraz převidí, soudci 21 : 4 a 20 : 5). **Další test:** znění BEZ slovesa, které jde
  zopakovat posluchači jako rozkaz (žádné *look / notice / see*); kontrolní prompty NEvybírat jen podle úniku (regrese k
  průměru) a pustit i PROD; soudci musí vidět systémové pravidlo *„never tells the seeker what to do"*; měřit i ozvěnu
  *„you see/hear"* u solu a stejnost napříč čteními (`measure_sameness.js`). IS až po EN.
  **2026-09-23 (8): zkoušeno znění `…, down to one detail the sentence does not name.`** — u Opusu převidí bez ozvěny
  (Nauthiz úsek 6/7 → 3/2/2), runa jako vlastnost, ne síla; riziko studeného čtení těla (Nauthiz 2 ze 3). Owner: nová věta
  zní líp než produkce. **Várka hotová (EVAL_LOG 2026-09-23 (9)):** převyprávění klesá u obou modelů, celkově lepší čtení
  nezjištěno (Opus 18 : 10 dělají rady v PROD, bez nich 10 : 8). **Před produkcí:** IS protějšek změřit stejnými metrikami
  (znění ověřené korpusem je v EVAL_LOG) + vyřešit zdvojení s úhlem [1] (*„no one thought to watch"* 4/4).
  **2026-09-24 (1):** IS test — Opus 4.8 v IS obraz skoro neopisuje ani v produkci, věta nepomohla → **IS neměnit**, jen EN.
  Úhel [1] bez *„the part someone would walk past"* + věta: značka 0/4, opis nízký (4 čtení) — zkrácení úhlu by se ale
  projevilo i bez věty, nezměřeno. Owner 2026-09-24 schválil (EN věta + zkrátit úhel [1]). ⚠️ **Na Opus 5 (jde do produkce)
  bez účinku** a +7 % délky single (EVAL_LOG 2026-09-24 (3)) → **owner: nenasazovat (DECISIONS 2026-09-24 (13))**; kandidát pro sol.
- [ ] **KANDIDÁT: most IS „ástand … sagt með orðum myndarinnar"** (CODE-read 2026-09-22, NEROZHODNUTO — owner).
  Ve tvaru „dvě možnosti" přidat k *„hvort um sig ástand sem gæti átt við"* frázi *„sagt með orðum myndarinnar"*
  (tvar ověřeného Norns landingu A). gpt-6-sol: konce z pojmů (*vani / kostur*) na věcné 5/5; Opus 5: *gæti* beze
  změny proti produkci. ⚠️ Varianta, která „ástand" ODEBRALA, Opus rozbila (konec celý v obraze) — nezkoušet.
  Ověřeno jen na tvaru „dvě možnosti" a lehkých runách; věta, otázka a těžké znění netestované.
  Relevantní hlavně, kdyby se přešlo na levnější model. Doklad: `RUNAR_EVAL_LOG.md` 2026-09-22 (2).
- [ ] ⭐ **SPREADY × SINGLE: ROZCHÁZEJÍ SE PÁKY — vyřešit** (KUKY 2026-09-20: *„zapsat. to by se mělo vyřešit."*).
  `_domainContext` i `_registerContext` krmí single **i všechny spready**, ale spready mají navíc rozhodčí větu
  `_priorityContext` (*„honour the seeking and the area"*), kterou single NEMÁ (ověřeno: 4 volání, všechna ve
  spreadech). Jakmile se rejstřík vyndá ze single, ukazuje ta rozhodčí věta ve spreadech na páku, která v single
  už není — a spready si dál žijí po svém. **Není to jen varování u jednoho úkolu; je to trvalý rozpor** a patří
  k §18/§13: buď se páky srovnají, nebo se rozdíl pojmenuje a zdůvodní na jednom místě, aby ho příští session
  nepovažovala za chybu. Rozhodnout spolu s vlastní stavbou závěru per spread (položka „ZÁVĚR SPREADŮ").

- [ ] ⭐ **PRODUKČNÍ KANDIDÁT „nový Single" — plán ověření, než nahradí produkci** (KUKY 2026-09-20: *„pokud bude taková,
  jakou jsi ji tady vytvořil, tak bude nahrazovat produkci"*).
  ⚠️ **PŘERÁMOVÁNO 2026-09-20 podle toho, co se skutečně stalo.** Plán počítal s jedním kandidátem, který se A/B
  porovná a teprve pak nahradí produkci. Místo toho šly změny do produkce **po kusech** (v4.33 most · v4.34 místo
  a druhý těžký tvar · v4.35 čtyři věty, jméno, los esenčního rámu · v4.36 cíl a tvar mostu · v4.37 výjimka),
  každá se svým měřením. Kandidát tedy **už JE produkce** a tenhle úkol se mění na **regresní ověření celého bloku
  proti stavu před ním** = `75c1ba8` (v4.32-bez-sezony). Nic z toho zatím nikdo neporovnal jako CELEK.
  **Ověření, v tomhle pořadí:**
  1. `golden-verify` + smoke (staví CODE-tune) — změna výstupu jen tam, kde má být.
  2. **A/B na TÝCHŽ losech**: produkce × kandidát, stejné `prompt_draws` (od 2026-09-20 včetně `len`), **různé runy,
     ne jen Raidho** — 3 runy lehké + 3 rizikové (Isa · Laguz · Tiwaz · Algiz z identitního testu), EN i IS.
  3. **Tvrdé kontroly** na obou ramenech: identita (slepý soudce, volba z 25, jméno runy i osoby maskované) ·
     rada / tvrzení o nitru (počet) · délka proti rozpočtu · IS gramatika a korpus · únik vstupů (sezóna, metadata).
  4. **Ownerův slepý soud**: dvojice A/B se skrytým autorem, rozhoduje on; teprve pak nasazení.
  **Přijímací kritéria:** ownerova preference ve slepých dvojicích · identita ne horší než produkce · rada a tvrzení 0 ·
  délka v rozpočtu · žádný nový únik vstupu. Pilot 3+3 runy × 2 jazyky × 2 čtení = 24 čtení; víc až po pilotu.
  ⚠️ Nepouštět dřív, než jsou hotová pravidla (most, jméno, sezóna) — jinak se měří proti pohyblivému cíli.
- [ ] **FRONTA po Norns závěru** (owner se ptal, co dřív): **1) `RUNE_PLACEMENTS`** — kam padne jméno runy (dnes věta 2
  v 89 %); levné, mechanismus ověřený u jména člověka, uvolní přetlak druhé věty · **2) LIST RUNY** (Raidho + Isa jako
  vzorek; potřebuje ownerův obsah) · **3) tvar esence** (los rámů; taky obsah ownera) · 4) volba modelu až nakonec.
- [ ] ⭐ **ZÁVĚR SPREADŮ — vlastní návrh, NE kopie mostu ze single** (KUKY 2026-09-20: *„spready se skládají z více run,
  mají jinou filozofii… nemůžeš brát, že co pasuje na single, automaticky pasuje na spready. Norns, cross, horseshoe,
  yggdrasil mají svoji vlastní stavbu. Jsem otevřený tomu mít tam závěr, jen aby to nebylo v konfliktu. A je to hromada
  run — nevím, jak z toho chceš vytáhnout závěr."*). Stav: spready končí `landingem` v obraze a tvrzení o člověku padají
  UPROSTŘED (beat „friction" — doklad `RUNAR_EVAL_LOG.md` 2026-09-20 (7): Norns tvrdí uprostřed, mlží na konci; ownerova
  výtka „care alone cannot settle what remains unspoken"). Návrh CODE-read K DOPRACOVÁNÍ S OWNEREM, per spread zvlášť:
  závěr nevzniká z jedné runy, ale z toho, co spread UŽ řekl — u Norns z beatu Skuld (kam to spěje → „may be" o člověku),
  u horseshoe z pozice „ahead", u kříže z „ahead" osy skuld; yggdrasil je rituál, tam možná závěr nepatří vůbec.
  Nejdřív Norns: navrhnout znění, 3 čtení, owner čte. NIC nenasazovat, dokud owner neodsouhlasí tvar pro daný spread.
- [ ] ⭐ **LIST RUNY — materiál, podle kterého jde poznat, co k runě patří** (KUKY 2026-09-20: *„jak ti mám připravit
  materiál, podle kterého bys dokázal rozpoznat, co je vhodné pro runu? Jaké další vstupy by do ní mohly jít?"*).
  Návrh CODE-read, 6 polí na runu; vyplňuje owner/Cowork, CODE-read podle nich staví testy:
  1. **VZTAH (2–4)** — co runa KONÁ, slovesně a bez místa (*„něco drží, zatímco zbytek jde dál"*). Doloženo 2026-09-20:
     runa do sdílené scény dodává vztah, ne rekvizitu; bez dodané scény se runy sjedou do svých živlů.
  2. **PROTI SOUSEDOVI** — jedna věta, čím se liší od runy, se kterou se plete (Isa × Laguz, Algiz × Thurisaz;
     dvojice z identitního testu 2026-09-09 (6)).
  3. **KAM NEPATŘÍ** — místa a rekvizity, které ji táhnou jinam (Isa × tekoucí voda v popředí → Laguz, doloženo 2026-09-19).
  4. **REGISTR + TYP** — D/E/P a fyzický/situační/slovní (`RUNAR_DESIGN.md` „Image pool"); určuje, z jakého seznamu se losuje místo.
  5. **MOST K ČLOVĚKU** — co si z toho člověk MŮŽE poznat, jako možnost (*„může to být to, co u tebe drží, zatímco ostatní jde dál"*).
  6. **KALIBRAČNÍ VĚTA** — 1–2 věty ownerovým uchem „takhle to má znít". ⚠️ **Nejde do promptu** — vzor v promptu se
     opisuje (32/33, 2026-09-15); slouží jako cíl při vyhodnocení.
  Rozsah: 25 run. Napřed 2 runy jako vzorek (Raidho hotový z 2026-09-19, Isa), pak se rozhodne o zbytku.
- [ ] ⭐ **HON NA HYBRIDY — kontrola → podezřelý → malý test, runa po runě** (KUKY 2026-09-19: *„máme spoustu inputů, u kterých
  si nejsme jistí, co dělají; najdeš podezřelého → menší test → upravit, zrušit, předělat? … neřešíme jednu runu, ale všechny,
  postupně"*). Postup: (1) **kontrola**: slepý soudce *„řekni vlastními slovy, co ti říká poslední věta / celé čtení"* —
  NAPŘED ověřit na produkčních čteních ownera (ta, na která se ptal *„nerozumím"*, proti těm, která chválil); rozliší-li je,
  pustit přes produkci všech run; (2) u označených čtení rekonstrukce z `prompt_draws` + původ frází (`scripts/puvod.js`)
  → podezřelý vstup; (3) malý test jedné změny. ⛔ **BLOKUJE krok 3:** testovací pisatel (Claude Opus 5) produkční vady
  nereprodukuje (Raidho volba 0/3, Ask tvrzení o nitru 0/3 — `RUNAR_EVAL_LOG.md` 2026-09-19 (3)). ✅ Owner 2026-09-19
  schválil produkční model přes API → podezřelý #1 **potvrzen**: `ENDING_OPEN[0]` *„…or offering a plain choice"* dělá volbu
  blízké × vzdálené 4/4, bez ní 0/3 (záznam (4)) — ✅ owner 2026-09-19: VYPUSTIT (handoff CODE-tune). Podezřelý #2
  **potvrzen**: `ENDING_OPEN[1]` *„name where the seeker stands in the image"* → poslední věta „You stand…" 6/6, bez něj 0/6
  (záznam (5)) — čeká na rozhodnutí ownera. Podezřelý #3: řádek sezóny v4.29 → obilí v obraze bez pole 6/6
  (záznam (5)); owner „zuž a otestuj" → zúžení pokynu NEPOMOHLO (5/6), vadí jméno měsíce; holé sdělení se opisuje (5/6);
  **funguje sezóna jako PODMÍNKA** (obilí 0/6, opis 0/6) — znění EN+IS v záznamu (6), předáno CODE-tune.
  Podezřelý #4 (nový, 2026-09-20): **most k člověku** (*„what you feel as calm… is carried for you"*) je v 5/8 čtení,
  přestože ho `NO COLD READING` zakazuje — vztahový obraz k němu zve. Rozhodnutí ownera: zakázat důsledně, nebo udělat
  z mostu VSTUP s daným tvarem (možnost, ne diagnóza — tvar prošel v Asku 2026-09-19 (4)). Dnešek = zakázáno a přesto v polovině čtení.
  Podezřelý #2 `ENDING_OPEN[1]` — ✅ owner 2026-09-19 VYPUSTIT (znění EN+IS ověřeno, záznam (6)). ⛔ Kontrola (1) ve tvaru
  „srozumitelnost" NEPROŠLA ověřením (2/6 × 2/6) — kandidát dál: soudce SOULADU („dává otázka smysl pro tuto runu a obraz?"),
  napřed zase ověřit na téže sadě.
- [ ] ⭐ **MOŽNOST: JÁDRO OBRAZU + MÍSTO Z LOSU** (⭐ KUKY 2026-09-19: *„určité runy potřebují jiné prostředí — skupiny;
  prostředí krátkými větami pro skupiny, pro které sedí"*. **Korekce CODE-read:** skupinovat podle JÁDRA, ne podle runy —
  táž runa má obrazy různých druhů (Tiwaz: vrácené drobné = situační/D · polárka = E). Skupiny už v datech jsou: 7. sloupec
  `RUNE_IMAGES` registr D/E/P + osa „typ obrazu" (`RUNAR_DESIGN.md` „Image pool"). Místo se losuje jen z listu registru
  jádra (D: pult, trh, kuchyň… · E: břeh, láva, mlha… · P: tún, ovčín, vřesoviště…). „Hodně obrazů" netřeba: ~4 jádra ×
  ~6 míst ≈ 24 scén na runu místo dnešních ~4. Práce: jádra zkrátit tak, aby nesla to, co dělá runu runou (Tiwaz 0/3,
  když zmizelo *„in your favour"*), 3 listy míst islandsky od začátku, identitní brána jen na rizikové dvojice.
  Původně KUKY 2026-09-18: *„heath je jen jedna z mnoha možností… chci
  Rúnarovi dát základ obrazu s tím, že zbytek je možné měnit"*; NErozhodnuto). Obraz se rozdělí na **jádro** (co nese
  runu — věc/děj, bez místa; u mohyl stačilo škrtnout *„across the whole heath"*) a **místo** (krajina/světlo/počasí),
  které se **losuje** ze seznamu — NE volné: volné místo dalo oblíbence 3/3 (black lava field), potřetí po 2026-08-18
  a 2026-09-09. Pilot na Raidhu → `RUNAR_EVAL_LOG.md` 2026-09-18 „Jádro obrazu + místo". **Než se to staví:**
  (a) **identita runa × místo** — ✅ pilot 2026-09-19: 10/12, pády Isa×břeh→Laguz a Algiz×břeh→Othila — slepý test na RIZIKOVÝCH runách (Isa, Laguz, Tiwaz, Algiz; 2026-09-09 (6): voda táhne
  k Laguz, nehybnost k Ise, počasí k Hagalaz), soudce bez esenční věty; co padne, jde do seznamu „kam tahle runa nesmí" ·
  (b) některé obrazy místo SAMY JSOU (horký pramen v černé skále) — ty zůstanou celé · (c) místa psát islandsky od
  začátku (§2) a se sezónou jako `RUNE_IMG_SEASONS` · (d) místo mění podstatná jména, ne pohyb čtení (začátek i esence
  6/6 stejné, závěr 5/6) — druhá osa „odkud a kdy se díváš" je samostatný test. ⚠️ **§26:** částečný návrat zamítnutého „POLE +
  rozprostírač" (`RUNAR_DECISIONS.md` 2026-08-22 — rozsypal milované obrazy). Tady jádro milovaného obrazu zůstává celé,
  vyjímá se jen místo; při nasazení nový datovaný záznam s odkazem na 2026-08-22. Obsah (jádra, místa) = owner/Cowork,
  kód = CODE-tune, testy = CODE-read.
- [ ] ⭐ **KONCE ČTENÍ NIC NEŘÍKAJÍ — pool konců přepracovat** (KUKY 2026-09-16 nad *„You stand in the doorway, and the
  September night stays cool at your back"*: *„nic neznamená, mělo by to něco znamenat pro uživatele; každá část čtení nás stojí
  peníze a tohle je plýtvání slovy — endingy asi nejsou dobře formulované, postavené, navržené, vysvětlené"*). Konce losuje
  `_endingShape` z `ENDING_OPEN` / `ENDING_HEAVY` (`v2/runar-utils.js`); do čtení jde jen pokyn tvaru („quiet line that rests",
  „plain choice"…), nic o tom, co má konec člověku dát. Testy → `RUNAR_EVAL_LOG.md` 2026-09-15/16.
  ⚠️ **Nejde jen o pool konců** (ověřeno v promptu 2026-09-18): proti „konec má něco znamenat pro uživatele" dnes stojí
  ČTYŘI pokyny — `YOUR STANCE` *„Draw the picture and stop there — never hand the seeker a conclusion"* · `TWO THINGS THAT
  NEVER CHANGE` *„never tells the seeker what to do"* (obojí systémový prompt) · esenční pravidlo *„Never tell the seeker what
  it means for them"* · `NO COLD READING` *„never tell the seeker what is true… inside them"*. Nový konec s ně narazí; rozhodnout,
  co z nich platí pro poslední větu.
  ⭐ **Směr ownera 2026-09-19:** *„závěr má být to zakončení, které v člověku vyvolá otázku — a Rúnar ji v ASK rozebere."*
  Doklad: Isa `df160bfb` (tvrdá otázka v obraze, čočka VYPNUTÁ → Ask dal dvě konkrétní možnosti). **Než se to zostří:** Ask má
  jen premium (jednou na čtení) — pro ostatní tiery musí konec obstát sám · otázka ze zvědavosti ≠ z nepochopení (Raidho
  `de1e3b16`: *„i dont understand"* — konec „plain choice" postavil proti sobě dvě věci, které Raidho spojuje). → `RUNAR_EVAL_LOG.md` 2026-09-19
  „Odkud grey" §4–5.
- [ ] **MOŽNOST: STŘEDOVÁ VĚTA — jedna věta na začátku systémového promptu, kdo Rúnar je a co dělá** (KUKY 2026-09-18:
  *„zapiš středovou jako potenciální možnost"*; NErozhodnuto). Kandidát Cowork-tune: *„Rúnar není ten, kdo ví, kde stojíš —
  je ten, kdo přesně ukáže jednu scénu a význam nechá tobě."* ⚠️ Než se zostří: (a) jde **proti ownerovu cíli**, aby konec
  čtení a Ask pro člověka něco znamenaly — nejdřív rozhodnout položku „KONCE ČTENÍ NIC NEŘÍKAJÍ" (smí konec/Ask říct, co to
  MŮŽE znamenat pro člověka, jako možnost bez diagnózy?); (b) systémový prompt má na čtení slabý měřitelný vliv (výměna čtyř
  vzorů hlasu: 0 rozdílů, `RUNAR_EVAL_LOG.md` 2026-09-15) — abstraktní věta tam nejspíš nezmění nic, test ostrý × vágní ji
  musí ověřit. Owner: *„nedokážu si to představit, je to hodně abstraktní pojem."*
- [ ] **Rozhodnout o losu na esenčním řádku** (změřeno 2026-09-08/09, nenasazeno). Dnešní esenční řádek má **jeden tvar ve 100 %** čtení. Owner četl tři rámy od Coworku a 2026-09-09 je ohodnotil: *„je to jiná větná skladba a to, jak je popsán význam runy, se mění. Je to pozitivní."* Los ze tří rámů, v nichž není dnešní spona, dá rozložení tvarů 33/42/25 a **délku beze změny** (nula navíc na ElevenLabs). Chybí: znění rámů Rúnarovým hlasem + IS + rozhodnutí nasadit. ⚠️ Jeden rám sám = výměna jedné šablony za druhou (ověřeno: rám [A] srazil sponu na 0 %, ale nastoupilo „\<Runa\> sloveso" ve 12/12).
- [ ] **Obraz se neukazuje, on se OPISUJE** (změřeno 2026-09-09). Čtení převezme **50 % slov obrazu**, **místo ve 100 %** a hlavní věc v 92 % (Eihwaz: „farmhouse" 3/3, „rowan" 3/3). Owner: *„obraz má jen ukazovat, ale nemá být stále opakován ve stejném znění."* Návrh k prověření: **předloha + losovaná rodina předmětů** — dá 0 % opakování místa i věci a 3× pestřejší obrazy. ⛔ **ZASTAVENO 2026-09-09 identitním testem na všech 25 runách:** identifikace runy padá z **78 % na 52 %** (náhoda 4 %). Řeší opisování, ale platí za to identitou — a to je horší vada. Pilot na 4 runách ukazoval opak (100 %), byl ale vybraný, ne ověřený (§27). **Nenasazovat, dokud identita nedrží.** → `RUNAR_EVAL_LOG.md` 2026-09-09 (6).
- [ ] **Losovaná rodina předmětů se musí losovat PER RUNA, ne per čtení** (nález 2026-09-09 z konstrukční chyby vlastního testu). Když se losuje per čtení, dostanou všechny runy ve spreadu touž rodinu — přesně ta kolize, které se owner bál. Pojistka **už v kódu je** (motiv-guard, smoke ㉟); stačí ji rozšířit z motivů na rodiny — ⚠️ ale nefunguje, dokud obrazy nemají motivy (položka výš).
- [ ] **Změřit hlídače u životní runy** (`_lensContext`, nález 2026-09-08). Prompt vypíše jméno životní runy a hned zakáže ji jmenovat (*„Never name the life rune"*) — týž vzor jako odstraněný hlídač u `seeking`, ale tady je **jméno potřeba**, takže se nálepka smazat nedá. Zbývá druhá půlka pravidla → `memory/prompt-nepojmenuj-co-hned-zakazes.md`: **ověřit, jestli ten hlídač vůbec něco drží** (u seeking nedržel nic — 0/20 v obou verzích).
- [ ] **Skladba věty jako páka — změřeno, nenasazeno** (2026-09-08, owner: *„ne do produkce, zatím jen tady"*). Horní mez „ne víc než patnáct slov" posadí první větu na 13,0 slova (dnes 17,5); *„jedna myšlenka na větu, žádné vsuvky"* čárky nesrazí (1,00 v obou verzích), ale **zlomí tuhost** (v1 dala přesně 3 čárky ve všech čtyřech čteních, v2 už 3-3-4-3). Délka čtení se nemění → **nula navíc na ElevenLabs**.

- [~] **ČTENÍ JSOU NEÚPLNÁ: obrazy odemykaly jen 43 % významu run — DÁVKA 1 NASAZENA 2026-09-10** (22 obrazů prošlo branou z 36; krytí **43 % → 56 %**, run s jedinou dosažitelnou stránkou **5 → 1**). Hotovo: Ansuz (všech 5 stránek) · Nauthiz · Jera · Mannaz. **Zbývá Eihwaz** — všech 6 kandidátů propadlo, jeho jádro („starý strom, smrt a znovuzrození") je Othilino pole; potřebuje obrazy, kde je ROZDÍL proti dědictví. Původní zadání: (owner 2026-09-09: *„potřebuju dostat ostatní meaning run do obrazu… pokud je Eihwaz yew tree/resilience/endurance/death and rebirth, tak nemůže zůstat jen resilience! Platí pro všechny runy."*). Změřeno napříč všemi **25** runami (⚠️ oprava 2026-09-09: dřív tu stálo 24 — runu **Blank** jsem tiše vyřadil, přitom má vlastní klíče i 3 obrazy):
  | | |
  |---|---|
  | průměrné krytí významu runy obrazy | **43 %** |
  | runy s **jedinou** dosažitelnou stránkou | **5** — Ansuz · Jera · Mannaz (20 %) · Nauthiz · Eihwaz (25 %) |
  | nejlepší | Fehu a Raidho (75 %) |
  ⚠️ **NENÍ to chyba ani nedodělávka — má to zapsaný důvod, a ten platí dál** (§26, hlavička `RUNE_IMAGES` v `v2/runar-character.js`): 5./6. sloupec vznikl 2026-08-22 jako **oprava** — model si bral náhodný klíč, který k obrazu nepatřil („stádo z klíčů vedle chleba z obrazu, našel owner okem"). Vazba klíče na obraz tu vadu odstranila. **Kdo tenhle sloupec zruší, vrátí tu starou vadu.**
  ⭐ **Nezapsala se ale CENA té opravy** — že se tím význam runy zúžil na to, co nesou její obrazy. Proto je oprava **obsahová, ne kódová: dopsat obrazy tak, aby pokryly zbylé stránky každé runy.** Prioritně těch pět run s jedinou.
  ⚠️ Ověřeno, že to NEJDE obejít instrukcí (2026-09-09, čtyři řezy): výměna stránky za jiný klíč **17 %**, celý klíčový seznam místo jedné stránky **0 %**, odebrání zákazu + požadavek **17 %** (výchozí 17 %). → `RUNAR_EVAL_LOG.md` 2026-09-09 (2).
  ⭐ **Rozsah práce je spočítaný: chybí 68 obrazů** (dnes 85 → úplné pokrytí 153). Seznam se
  NEOPISUJE (§20) — je dopočitatelný z dat: pro každou runu ty klíče z `RUNES[].k`, které
  nenese žádný její řádek v 5./6. sloupci `RUNE_IMAGES`. Nejhorší: Ansuz, Jera, Sowilo, Mannaz
  (chybí po čtyřech stránkách), pak Wunjo, Nauthiz, Isa, Eihwaz, Perth, Berkana (po třech).
  ⚠️ **Není to jen doplnit počet** — každý nový obraz musí projít slepým testem (22. 8. ukázal,
  že 7 z 80 obrazů ukazuje na JINOU runu) a dvěma síty z `RUNAR_DESIGN.md`.
- [ ] **`RUNE_IMAGES`: IS a EN aspekt v témž řádku ukazují na JINOU stránku runy** (KUKY 2026-09-13: *„zapiš, ať se
  nikde neztratí"*). Aspekt jde do promptu jako `focus on:` → islandské a anglické čtení téhož obrazu dostanou jiný fokus.
  **Doloženo:** Isa *„The clock on the wall has stopped…"* — IS `kyrrstaða` (klid) × EN `waiting`. **Precedens:** tatáž vada
  u Jery opravena (`RUNAR_DECISIONS.md` 2026-09-12 (5): IS `rétt tímasetning` × EN `patience`).
  **Kandidáti, NEposouzeno:** mechanická kontrola (pozice aspektu v `k_is` proti `k`) označila **22 ze 108** řádků:
  Fehu ovce · Fehu chléb · Ansuz havran · Ansuz telefon · Raidho vátý sníh · Raidho cesta u řeky · Kenaz kovárna · Kenaz hver ·
  Hagalaz poryv · Hagalaz rozvodněná řeka · Nauthiz pletení · Ehwaz dva koně · Ehwaz úzká stezka · Laguz ledovcová řeka ·
  Laguz voda po svahu · Ingwaz semeno · Othila zřícenina · Dagaz probuzení · Blank vlasec · Isa hodiny · Thurisaz živý plot ·
  Thurisaz trnitý keř. ⚠️ `k` a `k_is` **nejsou paralelní seznamy** (Fehu `k`: wealth, cattle, material prosperity… ×
  `k_is`: efnisleg velsæld, auður, búfé…), takže pozice lže oběma směry — každý řádek posoudit VÝZNAMEM.
  Smoke ㉤ hlídá aspekt↔klíč v každé řeči zvlášť, IS↔EN nehlídá. Hodiny Isy zmizí s ownerovými krátkými obrazy
  (2026-09-13), třída zůstává.
- [ ] **Sedm run má jediný registr D|E|P** (7. sloupec, nalezeno 2026-09-09): Mannaz · Eihwaz · Ehwaz · Laguz · Ingwaz · Uruz · Hagalaz. Registr měl sloužit výběrové kongruenci při skládání spreadů (hlavička `RUNE_IMAGES`); u těch sedmi runy nemá z čeho vybírat, takže ta páka je pro ně mrtvá.

- [ ] **CO HLÍDAT AŽ SE BUDE TESTOVAT NAŽIVO** (zapsáno 2026-09-08 na pokyn ownera: *„zapsat, až budeme testovat tak se to ukáže, ať o tom víme"*). Dvě věci, které nemají žádnou automatickou kontrolu a ukážou se jedině na živých čteních:
  1. **Registry `Confirmation` a `Insight into Challenge`** — jejich věty mluví o „**the** decision" a „**the** friction". Ten určitý člen měl antecedent v nálepce, která z promptu odešla 2026-09-08 (v4.16-seek); teď se opírá o otázku uživatele. Ve vzorku se to neprojevilo (**0/4 v obou verzích**), ale n = 4 není důkaz. **Signál vady:** čtení tvrdí o tazateli rozhodnutí nebo potíž, které nikdo nezadal. Detail → `RUNAR_DECISIONS.md` 2026-09-08.
  2. **Zda registr (`seeking`) vůbec někdo pozná.** Změřená stopa je slabá (široké echo 20 % proti podlaze 8–11 %). **Když ji v živých čteních nikdo nerozezná, je to argument pro možnost C níž** — a tenhle řádek existuje proto, aby se to při testování nezapomnělo změřit.
- [ ] **MOŽNOST C — registr čtený z follow-up otázky místo z nabídky** (Cowork 2026-09-08, owner: *„necháme zatím jako možnost, pokud to ve čteních nebude vidět; ale bylo by dobré to alespoň otestovat, ať víme"*).
  **Návrh:** `seeking` se nevybírá dopředu z pěti nálepek — Ask si registr přečte z toho, JAK je follow-up otázka položená („je tohle správně?" už samo zní jako Confirmation).
  ⭐ **Nejsilnější argument (owner 2026-09-08, vedlejší produkt inventury):** plocha Ask má **nejčistší výstup v celém systému — 4 % nároků na vnitřní stav** (komentář u `r-question` ve `v2/runar-reader.html`). Signál by tedy padal přesně tam, kde se model nejmíň uchyluje k tvrzení o tazateli.
  **Co proti (CODE-tune, ověřeno v kódu):** Ask je **premium-only** (`mode === "ask" && userTier !== "premium"` v claude-proxy) → registr by se stal prémiovou funkcí · `buildAskPrompt(reading, question, runes, lang, corrections, life)` k `seeking` nedosáhne, je to plumbing, ne přeformulování — ⚠️ **ale od 2026-09-10 je pro to precedens**: týmž způsobem tam doputovala životní runa (parametr na konci, staří volající beze změny), takže „nejde to" už neplatí, jen to nikdo neudělal · **není to buď-anebo** (Ask může číst registr z otázky a ve čtení může zůstat dvanáctislovný registr).
  **Trigger:** ⚠️ **Aktualizováno 2026-09-10** — Ask už rozbalovací nápovědu nad polem MÁ (`_askHints()`, staví se ze čtení; pole `ask_placeholders` zaniklo). Tím ale ta otázka nezmizela, jen se přiostřila: nápověda uživatele **navádí**, takže registr, který by se z follow-up otázek četl, si zčásti vyrábíme sami. Kdo bude C stavět, musí napřed rozhodnout, jestli má uživatele navádět (a tím registr *vyrábět*), nebo ne (a číst, co přijde samo). **Bez korpusu skutečných follow-up otázek se to změřit nedá** — to je první krok, a je to práce pro Cowork.

- [ ] **Tři páky pestrosti, které v kódu jsou a do čtení nedojdou** (nález 2026-09-08, inventura + vlastní ověření; měření → `RUNAR_EVAL_LOG.md` 2026-09-08). Vrátit se k tomu, až se bude ladit hlas před spuštěním — **každá z nich je pestrost zadarmo, bez psaní nových obrazů**:
  1. **`SEASON_POOLS` = 133 obrazů, ve čtení 0×.** Ověřeno protlačením: 0 ze 144 dvojic runa × bucket je bez runového kandidáta. Rozhodnout **odstranit, nebo zapojit** — dnes se jen udržují dvojjazyčně a nikam nevedou. Padá s tím i los klíčových slov (`pickedKws`), který visí na téže podmínce. ⚠️ `CLAUDE.md` tvrdila opak; opravena 2026-09-08.
  2. **Sampling NENÍ páka — nejde nastavit.** ⚠️ Ráno 2026-09-08 tu stálo „rozhodnout, jestli to chceme řídit"; to bylo špatně a opravil to pokus o měření: `temperature`, `top_p` i `top_k` vrací na `opus-4-8` **HTTP 400 „deprecated for this model"**, projde jedině `temperature: 1` (= default). Zůstává z toho jen důsledek: bez seedu **nejde golden-verify na text**, jen na prompt — a rozdíl dvou čtení z téhož promptu je dál největší jediný zdroj pestrosti, jen se nedá řídit. Vrátit se k tomu, až se bude měnit model (nový model může parametry zase přijímat).
  3. **Spready nelosují nic** — `_randomAngle`, `_lengthBudget` i `_endingShape` mají každý jediné volání, a to v single builderu. **Devítirunový Yggdrasil má míň proměnných než jednorunové single.** U kříže a Yggdrasilu je důvod v komentáři (v4.13), u noren a podkovy je týž stav **bez zdůvodnění** (§28).
  4. **Sowilo má jediného kandidáta v `deepwinter` i `darkening`** → od září do února dostává pořád týž obraz (*„the year’s first ray of sun touches the mountain peak"*). **Proč:** Sowilo = slunce, takže 3 ze 4 jeho obrazů jsou zatříděné `bright` (jaro–podzim) a zimu pokrývá jediný `cold`. Není to chyba kódu, je to důsledek toho, že se sluneční obrazy přirozeně psaly letní. **Jediná runa z 25, které se to děje** (0 dvojic bez kandidáta, 2 dvojice s jediným — obě Sowilo). Nejlevnější jednotlivá oprava ze seznamu: dopsat Sowilu 1–2 zimní obrazy. ⚠️ Obsah = doména ownera/Coworku, ne CODE — islandská zimní scéna se slunečním motivem se **navrhne a ověří**, nevymýšlí (§23).
- [ ] **Rozpory doc ↔ kód nahlášené inventurou 2026-09-08 — NEOVĚŘENO mnou, ověřit před opravou.** Ať se to neztratí (§22), ale ať to nikdo nebere jako fakt (§23): `runar-character.js:1303` komentář proti kódu `:1307` (EN vazba klíčů) — ⚠️ na tomhle stojí řádek „EN se neváže" v rejstříku pák · zastaralé počty obrazů v komentářích (`:450` „67", `:630` „81" proti 83) · `runar-config.js:415` slibuje shrine dropdown přes `shrine_voice_profile`, který prý nikde jinde neexistuje · `runar-reader.html:258` „Only your name is required" proti `startReading()` · strop Ask 320 natvrdo v `runar-reading.js:571` mimo config (§8) · `buildSysPromptV2` + `DEF_CHAR_V2_EN` jako druhá rozešlá kopie postavy (volají jen `scripts/utils/compare_*.js`) · `VARIABILITY POOLS` v `runar-utils.js` bez volajícího · `supabase/functions/tree-update` bez volajícího a bez komentáře „proč odešel".

- [ ] **Vrstvy A/B/C re-enable** — vypnuto (`ENABLE_DYNAMIC_CONTEXT=false` v `supabase/functions/claude-proxy/index.ts`). Vrátit AŽ: (a) každá vrstva pohání reálné UI (tree memory, session mood, voice-scale slider), (b) projde IS evalem. Do té doby placené čtení jede jen na base promptu. Funkce buildTreeContext/deriveSessionState/buildSessionContext/buildVoiceContext ponechány.
- [~] **deeper_meaning re-add** — **ZRUŠENO (owner 2026-07-10):** B2 se dělat nebude, nahrazeno „Ask Rúnar" (viz Premium sekce). deeper_meaning zůstává zahozený. Parser `_parseSegments` je tolerantní (přečte `deeper_meaning` kdyby byl, ale buildery ho negenerují).
- [~] **IS eval harness — zbývá jen grader koherence.** Položka tvrdila „z větší části STOJÍ" (audit 2026-07-19); od té doby přibylo: `--angle N` (vynutí jeden úhel, jinak dostane ~n/7 čtení a změnu jednoho úhlu nelze rozlišit), `--without a,b,c` (postavit čtení bez části promptu), `draws` na každém řádku (úhel · obraz · klíčová slova · konec · jméno), `measure_readings.js --balance` (rozložení pák) a `compare_readings.js` (dvě dávky vedle sebe). **Automatické PŘED/PO tedy existuje.** Zbývá jediné: **grader na KOHERENCI** — dnes se měří gramatika (`is-grammar-qa.py`) a tvar, ne jestli čtení drží pohromadě. `runar-eval.yaml` se stavět NEBUDE (DECISIONS 2026-07-04).
- [~] **Reading-quality Faze 4** — model VYRESEN A NASAZEN (Opus 4.8, jednotny pro oba jazyky; fallback chain v claude-proxy). Otevrena zustava jen druha, PODMINENA varianta: 2-pass „IS korektor" pruchod, jen kdyby eval ukazal zbytkove chyby. = ceka na eval, ne na praci.


### ⟵ AUDIT PRAVIDEL / DOCÍ — 2026-08-02 (Workflow: 5 úhlů → ověřeno proti repu)
- [ ] **`landvættir→Algiz` a `hvalreki→Nauthiz` — až se budou implementovat, platí pro ně zvláštní podmínka (2026-08-19).** V kódu zatím nejsou. Podmínku i důvod vlastní `RUNAR_EVAL_LOG.md` 2026-08-19 — **tady se neopisuje**. Jen připomínka, že to existuje.
- [ ] **㉜ registr pravidel sbírá pevné řádky jen ze single cesty** (nalezeno 2026-08-23 při
  v4.13): spread-only instrukce (RP_YGGDRASIL.landing, beats spreadů) nemají otisk — nová
  protichůdná dvojice ve spreadech by prošla bez červené. Zvážit rozšíření sběru
  v `verify_prompt_rules_registry.js` na jednu postavenou cestu od každého spreadu.
- [ ] **TESTY „recept: obrazy se potkávají" (KUKY 2026-08-23) — k otestování; generace CODE, slepé hodnocení Cowork.**
  **T1 · Vegvísir 1→2→3:** hypotéza — tři obrazy, co se potkávají v čase, dají EMERGENTNÍ scénu; tři nezávislá single ne. Rameno A: pro tutéž trojici run se čtení 2 vztáhne k obrazu 1 (bez rekapitulace, bez jména), 3 změní vztah 1–2. Rameno B: tři nezávislá single týchž run. Slepé skórování: pozná soudce A od B? · vzniká v A vztah, co v B není? · rekapituluje 2 jménem (špatně) vs obrazem (dobře)? A≈B → není to Vegvísir. n≥20 trojic/rameno.
  **T2 · Norns současnost vs recept:** A = dnešní builder (1 obraz + řetěz taktů) · B = každá runa SVŮJ obraz z RUNE_IMAGES, prompt žádá emergentní SCÉNU z potkání (ne takty, ne seznam). Slepě: jedna situace vs tři věci za sebou? · co si člověk zapamatuje? · ⚠️ hlavní riziko B: rozpad v SEZNAM obrazů („one image, don't list" existuje z důvodu) + claim-rate. n≥20/rameno. Nejlevnější (nejkratší spread s pozicemi).
  **T3 · Aspekt-kongruentní výběr:** výběr obrazů přes aspekt (5./6. sloupec — NAPLNĚN, ověřeno proti HEAD) tak, aby aspekty spolu mohly být; vs náhodný výběr. Slepě párově: „patří ty dva obrazy do jedné scény?" ⚠️ měřit ZVLÁŠŤ koherentní potkání (nahoru) vs bland souhlas/zmizelý střet (nechceme). Potřebuje napřed malý design krok „které aspekty spolu jdou" → pustit až PO T1–T2.
- [ ] **Zátěžová matice promptu — od kolika současných vlivů se rozpadne JEDEN obraz** (metoda GPT via Cowork 2026-08-24; k otestování, negenerovat bez rozhodnutí ownera).
  Stejná sada run+sezón, vrstvy se přidávají PO JEDNÉ: `runa + obraz → +oblast → +co-hledá → +záměr → +otázka → +čočka`. U každého kroku se hodnotí čtyři věci, ne jen soulad: **(a)** drží jeden svět/MYND · **(b)** objevil se checklistový odstavec · **(c)** roste studené čtení · **(d)** nechala přidaná vrstva přirozenou, nebo mechanickou stopu.
  Cílová otázka NENÍ „je prompt dlouhý", ale **„od kolika současných vlivů se jeden obraz začne rozpadat"**.
  ⚠️ **Podmínka převzatá od Coworku:** otevřít, až měření ukáže checklistový efekt. **Zdrojový záznam (#50) v repu NENÍ** — CODE-read ho 2026-08-24 hledal a nenašel, takže podmínka je tu vedena jako hlášená, neověřená u zdroje. Kdo to bude pouštět, ať si ji potvrdí u ownera.
  ⚠️ **Kritika CODE-read (2026-08-24), ať se to nestaví dvakrát:** (a) a (c) UŽ MĚŘÍ existující soudci v `scripts/profsteinn.js` (`svět` · `chlad`) — nestavět nové, použít je. Nové jsou jen **(b)** checklistový odstavec a **(d)** mechanická stopa; jen pro ně se píše znění soudce. **(d) je subjektivní** — podle §19.2 nesmí projít tiše zeleně: buď oko ownera, nebo slepý soudce s vypsaným zněním, nikdy auto-verdikt. Náklad: 6 kroků × n na krok, takže n stanovit PŘED dávkou.
- [ ] **Horseshoe: echo 1↔7 (začátek↔konec) — HYPOTÉZA k testu** (GPT vzorek + nezávisle Cowork #34, zúženo handoffem #35 na krajní body): druhá úroveň vztahu nad `_spreadThread` — co se změnilo mezi první a poslední pozicí. Testovat A/B na horseshoe (svět/chlad + oko ownera), NE rovnou nasadit.
- [ ] **Vymyšlený druhý člověk ve čtení („someone waits for the sound of your step")** (nález
  v4.1, analýza Cowork 2026-08-22, owner předal): oblast Vztahy/Domov/Léčení svádí model
  k vytvoření KONKRÉTNÍ OSOBY jednající v reálném čase — spadá do druhé půlky `_noColdRead`
  („the world is not arranging itself around them: no omen, no preparation") a NEkryje ji
  věta domény „Do not tell them what is true between them and anyone" (ta chrání vztah, ne
  vymyšlení celé osoby). Osa rizika: netrefa o TŘETÍ osobě může UBLÍŽIT (sám, po rozchodu),
  ne jen minout. Frekvence i jistota teď nízké (+2/16 v obou řečích, šum) → SLEDOVAT přes
  testování (profsteinn), verdikt až z většího n. ⚠️ Při případné opravě NEZTRATIT rejstřík:
  je to vinětka/scéna, ne diagnóza — moc ostrý zákaz zabije i to, co se na tom líbí
  (Cowork). Oprava = A/B přepis (znění oblasti či coldread půlky 2), ne přisypaná klauzule.

### ⟵ AUDIT RESTŮ — 2026-07-14 (Workflow: 5 zdrojů → ověřeno proti repu + git logu)
- [ ] **IS ban-list (D-16)** — G1 v IS je neměřitelné (EN ban-list existuje, IS ne). Adaptovat EN + islandský kýč do IS grammar bloku.
- [~] **R1 ledger -> i KOSTRY** — konkretni dolozena vada je OPRAVENA (jmenny slot `[klauze], Kuky, [obraz]` -> pooled placement, commit 7dd1b9f + ending shape 1cf115c/57e8324). Zustava vlastni ask: rozsirit no-repeat LEDGER i na KOSTRY vet — dnes je kostra nahodna, bez pameti mezi ctenimi.
- [~] **Pretizeni cteni — 7 panu** — varianta „udelat runu primarni" JE implementovana (explicitni priorita + ustup life-rune linse). Varianta „ubrat pany" ne: v builderu porad stoji _lensContext/_domainContext/_registerContext/_endingShape vedle sebe. Zbyva PRODUKTOVE rozhodnuti, jestli ta priorita staci.
- [ ] Ask Rúnar v2 — journal 7denní okno + asked-flag (persistence HOTOVÁ).
- [ ] **Obraz × oblast ve čtení — NEVYŘEŠENO** (ownerovy reporty 2026-10-01/02; owner 2026-10-03: *„problém tím vyřešený není“*). Čtení obraz
  převypráví a oblast připojí zvláštní větou, často slovy podoby oblasti (*„Among your people“*). Zkoušeno a horší nebo stejné než A:
  B, B2, C (karta), D1, D2 (DECISIONS 2026-10-03 (4)). Nasazen jen výběr obrazu podle oblasti (řeší střet, ne stavbu). Další páka podle
  kódu: méně povinných kroků ve 4 větách (Ask má jednu otázku a prostor a píše líp — EVAL_LOG 2026-10-03 (1)). Napřed s ownerem.
  👁 **Owner 2026-10-03: „zatím s tím nic dělat nebudeme… čtení bude přibývat a řekne nám víc, kde ten problém je nebo není.“** → SLEDOVAT.
  Na ownerovu otázku *„model takhle nedostane, nebo jo?“*: dostane — testy stavěly prompt TOUŽ funkcí (`buildReadingPrompt`) a ownerovo
  skutečné čtení Kenaz 2026-10-02 (draws `area_face: 1`) končí *„Among your people, someone's absence…“*, totéž co v testu.
  Jak přeměřit z živých čtení: u single s oblastí vzít `prompt_draws->>'area_face'`, podobu z `AREA_FACES` a spočítat, kolik čtení nese
  její slova doslova (přistání [0] i most [1]) — a kolik vět čtení mluví o oblasti. Až bude dost čtení (owner řekne).
  ⭐ **Owner 2026-10-03 23:46 (report u Hagalaz × Family & Home): *„area face: the people one belongs to. Model to hodně používá
  a nezní to dobře. Přeformulujeme to."*** Podoba Family & Home [1] (`AREA_FACES` v `v2/runar-utils.js`) dala v živých čteních
  *„Among your people"* (sol) a *„In the people you belong to… making a racket while it stands"* (Opus; owner: *„to je špatný"*).
  ⚠️ **Oprava 2026-10-04:** *„what passes between your people"* → *„What people do you mean?"* (čtení 202c4140, Opus) sem NEpatří —
  mělo podobu [2] *generace* a „your people" si Opus vytvořil sám (draws `area_face: 2`); do 2026-10-04 to tu stálo pod [1].
  Podoba [0] už nese *belonging* (*„family ties and belonging"*), [1] je tedy skoro duplikát. **Návrh CODE-tune 2026-10-04, čeká na ownerovu volbu:** (A) podobu [1] odebrat —
  odebere zdroj *„Among your people"* a nic nového nepřidá; (B) nahradit domovem, který Family & Home mezi podobami nemá
  (*„home and the people who share it"*). IS až po volbě, nativně a ověřeně (§2).
  **Owner 2026-10-04: *„spíš odebrat. Uvidíme po přidání low effort."*** → odebrat AŽ po nasazení solu na `low` a pár čteních
  (jedna změna naráz, ať jde poznat, co co udělalo).
  ➕ **2026-10-05, doklad k podobě [2] *generace*:** trajekt × Family & Home (čtení 948649a5, `area_face: 2`) →
  *„The crossing was planned by one generation and is waited on by another."* — owner: *„špatně chápe"*. Viz položka „Trajekt".
  ➕ **2026-10-06, třetí doklad [2]:** nový obraz bouře se svíčkami × Family & Home (čtení f680ee96, sol, `area_face: 2`) →
  *„The table where older and younger hands meet stands in the dark."* a k tomu vymyšlená *„empty chair"*.
- [ ] 👁 **Tvrzení o stavu domova („In your home the talk has gone flat“) prompt pořád umí** (DECISIONS 2026-09-24 (19); owner: „ta Isa je špatně“).
  **2026-09-30 změřeno (EVAL_LOG 2026-09-30 (8)):** příčina nebyl obraz (příroda); na v4.82 tvrzení 0/3 (Isa × Family & Home, i týž obraz).
  Zbývá jen HLÍDAT živá čtení — od 23. 9. nebylo žádné s Family & Home. Obraz neměnit.
  Doklad z dnešního pilotu na produkčním modelu: Isa, Family & Home — *„Something in your home has gone quiet this way, held rather than ended.“*
  Rozbor GPT to teď hlásí (rubrika A), prompt tomu nebrání: NO COLD READING hlídá jen nitro („what is true, stirring, or known inside them“),
  ne stav vztahů a domova. Oprava = změna obsahu promptu → napřed změřit, jak často to dnes vzniká (Family & Home, Love), pak odebrat příčinu,
  ne přidat zákaz (memory `oprava-promptu-odebira-vadu`). (CODE-tune)
- [ ] **Konce čtení: víc tvarů — napětí (v4.61) a návrat k otázce (v4.65) NASAZENO, obraz ne — HLÍDAT v živých čteních** (CODE-tune, 2026-09-26)
  Owner: *„chci více různých konců, ne stejné… přidat víc možností, ne vyměnit“*. Rozhodnutí → DECISIONS 2026-09-26 (1) a (8). Hlídat:
  EN „may be A, and B“ se zopakovaným jménem (napětí, pilot 3/6) · IS vymyšlená slova v napětí (pilot 1/6) · návrat: předpoklad o nitru
  („the stillness you wait for“, pilot 1/6) a vzorec „what looks like X is Y“. **Obraz** (typ 6) nenasazen — nestabilní, vrací vadu v4.32.
  Data: `docs/eval/2026-09-26-konce/`.
- [ ] **Slova oblasti a „co jde do které věty“ — CODE-read hotovo (EVAL_LOG 2026-09-26 (1)–(3)); CODE-tune nasadil kroky 3 · 1 · 2**
  **2026-09-26 nasazeno:** Career podoby bez „work“ (v4.62, DECISIONS (2) — model „work“ říká dál, 6/6) · Ask nese aspekt čtení
  (DECISIONS (4)) · esenční rámec [1] = význam v obraze (v4.63, DECISIONS (5)). **Zbývá:** ownerův cíl „činnost z obrazu jeho slovy“
  (malování ≠ work) — owner: *teď neřešit, udělá víc čtení a vrátí se* (zapsal CODE-read); spona „<runa> is that…“ hlídat.
  Původní zadání:
  Owner: *„pokud je v obraze malování a člověk se zeptá na Career & Creativity, kreativita si o to přímo říká, ale Rúnar použije slovo
  práce, work… jak to udělat, aby dokázal najít ta správná slova“* — lidská činnost v obrazu má zůstat činností obrazu (tah štětcem,
  čára tužkou), ne „work“. Úkol: najít, odkud „work“ a podobná slova přicházejí (oblast, podoby oblastí, esenční rámce, úhly, klíčová
  slova, obraz) a sestavit mapu vstupů po větách (věta 1 · 2 · 3 · konec). Sem patří i Hagalaz „opens the field where the boards once
  stood“ (esenční rámec [1] „runa ve scéně něco dělá“). CODE-tune implementuje podle nálezu. Pozn.: podoby oblastí (v4.56) „work“ v EN
  nesrazily (6/6 → 5/6) — model jím popisuje i dění runy; to je výchozí bod, ne vyřešená věc.
  → **Nález CODE-read 2026-09-26** (`RUNAR_EVAL_LOG.md` 2026-09-26 (1)): „work“ nechodí z žádného bloku promptu (5 ramen, 4–6/6,
  i bez oblasti 6/6); mapa vět; esenční rámec [1] dělá z runy aktéra (výčet sloves 19/41); Ask bez aspektu čtení (oheň 3/3 → 0/3).
  Handoff CODE-tune předán.
  **Owner 2026-09-26:** „work“ — cíl je, aby činnost z obrazu zůstala v obraze a pojmenovala se jeho slovy (malování ≠ work);
  **teď neřešit**, owner udělá víc čtení a vrátí se. **Ask (aktivní aspekt runy): řešit** → handoff CODE-tune.
- [ ] **NA ZÍTRA — další body (owner 2026-09-25 večer)** (CODE-tune)
  1. **Mnohem víc konců čtení s otázkou, s ohledem na runu** — owner: *„líbí se mi otázky na konci a chtěl bych, abychom jich udělali
     mnohem víc… pro některou runu se může hodit něco jiného než pro jinou.“* Dnes `ENDING_OPEN/HEAVY` mají po 1 otázkovém tvaru.
     Návrh zítra: pool otázkových konců + vazba na runu (např. z otázek run v Kolekci) → změřit opakování před/po.
  2. **Druhý soubor obrazů od GPT** → `docs/inbox/2026-09-25-gpt-komplexni-obrazovy-prostor.txt` (jádro · napětí · obrazové rodiny ·
     dvojice run „X × Y“ · systém proti opakování s obrazovou vzdáleností). Zpracovat spolu s prvním souborem.
  3. **Hagalaz: „Hagalaz opens the field where the boards once stood“** — owner: *„nevím, jestli se mi líbí, že Rúnar používá runu jako
     nástroj pro něco, co nejde úplně poznat z obrazu.“* Podívat se na esenční rámec [1] („the rune … is the one doing something“).
- [ ] **PODKOVA (7 run) — Opus z ní nesloží celistvé čtení; dlouhodobá práce** (KUKY 2026-09-29 20:19/20:25: *„jak je horseshoe dlouhé, tak má
  opus problém z toho vytvořit celistvé čtení… ani v Asku si s tím nedokázal moc poradit… budu muset udělat víc čtení a najít řešení,
  teď ho nevidím“*; *„7 run je hodně a v obraze se ztrácí to, co můžou představovat. Potřebuji lepší vysvětlení na konci, jinak nám uživatel
  uteče.“*). Doklad: čtení 2026-09-29 20:10 (Dagaz·Tiwaz·Ansuz·Wunjo·Mannaz·Ingwaz·Isa, 619 výstupních tokenů, 13 s) — jeden obraz
  (ovce v bouři) nese všech 7 pozic, runy v něm nejsou poznat; druhý Ask (*„could you describe the reading better way?“*) je nejblíž tomu, co
  owner chce — obyčejné vysvětlení run po pozicích. Směr k ověření: u dlouhých spreadů závěr, který runy pojmenuje významem (jako Ask).
  Owner udělá víc čtení; řešení se hledá na nich, ne odhadem.
- [ ] **Obraz se zvířetem v Kříži / Podkově / Yggdrasilu** — pokyn `IMG_POSTAVA` tam NENÍ (netestováno; kontrola ㊱ hlídá, aby se
  tam nedostal bez testu). Až owner uvidí čtení, kde se čtenář plete se zvířetem nebo visí zájmeno: 1 testovací čtení s `jmenuj`
  (bez pohledu — spready mají vlastní závěr), číst jako uživatel, pak rozhodnout.
- [ ] 👁 **SLEDOVAT: „unshown“ z tváře oblasti The Unseen** (KUKY 2026-09-29: *„zapíšeme a budeme sledovat, jestli a kde se objeví znova“*;
  k Mannaz 2026-09-28: *„jestli se to hodí do čtení — mně moc ne“*). Zdroj = `AREA_FACES` The Unseen [0] *„what is present but not shown“*
  (`v2/runar-utils.js`) — model z „not shown“ udělá *„What sits unshown…“*. Stav 2026-09-29 (prompty od v4.47): **1 ze 2** čtení s touto
  tváří, v ostatních oblastech 0. Přeměřit: `supabase db query --linked "select area, prompt_draws->>'area_face' face, count(*) n,
  count(*) filter (where short_text ~* '\m(un)?shown\M' or deep_text ~* '\m(un)?shown\M') s from readings where prompt_version >=
  'v4.47' and area is not null and area not in ('spread','gathering','') group by 1,2 order by 1,2"` (širší obraz slov oblastí:
  `node scripts/utils/oblasti_slova.js`). Když se vrací: podoby tváře jako DATA (losovat jedno znění), ne výčet v jednom pokynu —
  výčet model opisuje (sloveso v esenci 19/41).

### ⟵ RESTY 2026-08-14 — nálady + měření hlasu (session CODE-tune)

### 1. Nálady, krok 2/2 — ZBÝVÁ (krok 1/2 hotový, commit `e3a3c40`)
Hotovo: invarianty vytaženy z vyměnitelného bloku do základu (`THE IMAGE`/`MYNDIN`, tempo,
zákaz rady, anti-ozvěna), `focused` očištěn. Zbývá:
- `lyrical` — očistit podle Coworkova draftu; **rejstřík z `personality` sem přestěhovat**
  („poetic, quietly playful, ancient fireside guide" — vytaženo ze základu, aby neodporovalo `direct`).
- `direct` — nová nálada; EN draft od Coworku, **třetí ukázková věta je vadná** (viz handoff).
- IS znění pro `lyrical` i `direct` — píše CODE (`is-vazba` + GreynirCorrect, **E001 = přepsat**).
- Zapojení: produkce dnes volá `buildSysPrompt(activeChar, lang)` **bez třetího argumentu**,
  takže `profileKey` je vždy `undefined` → `ACTIVE_VOICE_PROFILE`. Tudy vede rozdávání nálad
  (sáčkem jako sezóny, ne `Math.random`), plus zápis do `prompt_draws`.
- `--voice <klíč>` do `scripts/utils/gen_batch.js`, ať jde nálada testovat bez zásahu do produkce.
- **Naostro až po měření** (rozhodnutí ownera).

### 2. `--sameness` do `scripts/utils/measure_readings.js` — ZBÝVÁ
Hotová specifikace včetně akceptačního testu je v transkriptu workflow
`…/subagents/workflows/wf_8c468fb1-c85/journal.jsonl` (poslední záznam).
Metrika **OZVĚNA slovníku**, ověřená: `full` 6,2 % vs `dice` 11,7 %, permutační test p = 0,003;
negativní kontrola p = 0,80. Tvrdé podmínky: `lang` na každém řádku (chybí-li → **spadnout**,
bez `lang` skočí EN dávka z 9,6 % na 24,0 %), jedna dávka = jeden jazyk, n ≥ 20, stejné runy,
jen jackknife (bootstrap u párové metriky lže). Slouží jako **hlídač regrese**, ne měřítko úspěchu.

### 3. ⚠️ OWNER: chceme vůbec změřit, jestli nálady zaberou?
Metrika slovníku **nevidí rytmus ani stavbu vět** — dokázáno nulovou transformací (zamíchání
slov uvnitř čtení změní číslo o **0,0000**). A na slovníku je produkce už dnes skoro tak pestrá,
jak z dat jde (nejrůznější poskládaná směs 7,9 %, produkce 6,2 %). Statičnost, kterou owner
popisuje, je tedy nejspíš **v tempu a stavbě**, ne ve slovech. Obě metriky, které tuhle dimenzi
měří, zabil útok „půlka proti půlce" — potřebovaly by **~100 čtení na dávku** (strukturní),
resp. ~720 (frázová). Volba ownera: pustit nálady a věřit oku × zaplatit jednu velkou dávku.


⚠️ **A horší než slepota: měřidlo ukazuje špatným směrem** (postřeh GPT via Cowork 2026-08-24;
ověřeno CODE-read proti Rejstříku pák, `RUNAR_EVAL_LOG.md:62`). Blok `voice` zabírá **57 %
plochy promptu** a jediný změřený účinek jeho vypnutí je, že se jedno ze tří měřítek
**ZLEPŠILO** (pojmenování EN 4→7/8). Kdokoli tedy bude optimalizovat na soudce z
`scripts/profsteinn.js` (`svět` · `soulad` · `chlad`), má **stálou pobídku ten blok zmenšit
nebo smazat** — a žádný ze tří soudců by tu ztrátu nenahlásil. Není to návrh hlas měnit;
je to důvod, proč se „nezhoršilo ani jedno měřítko" u TOHOHLE bloku nesmí číst jako „je zbytný".
K rozhodnutí ownera patří k bodu 3 výš (táž otázka, tytéž peníze), ne zvlášť.

### 4. Doslovné opisování obrazu: 32 % proti baseline 12 % — ZBÝVÁ
Hypotéza „vrátit IS promptu hmotu" **vyvrácena** (`RUNAR_DECISIONS.md` 2026-08-14, p = 0,75).
Příčina je jazyk, ne délka. Další test, neproveden: **nedávat do IS hotovou větu**, ale obraz
jako pár rozpojených slov, ze kterých se věta složit musí. Mění zdroj, ne délku.

### 5. Dva bug reporty `HTTP 503` — čekají na rozhodnutí ownera
Zůstaly otevřené z triage reportů Rúnara; bez odpovědi ownera se nedá rozhodnout, jestli je to
výpadek modelu (a tedy nic k opravě) nebo chybějící retry.

### ⭐ Nálady — specifikaci PŘEPSALY důkazy (2026-08-14, nahrazuje dřívější zadání)
Platí místo původního „3–4 nálady odlišené tempem". Detail a zdroje → `RUNAR_EVAL_LOG.md`
2026-08-14, rozhodnutí → `RUNAR_DECISIONS.md` téhož dne.
- **Rozdělení:** prostřední default ~60 % · prostá ~20 % (**povinný default pro EN a krátká
  čtení**) · poetická ~20 % jako volba.
- **Šest pravidel napříč náladami:** bez vnořených vsuvek · obrazy známé, ne originální ·
  v EN „X je jako Y" · jedna nosná metafora brzy ve čtení · nevázat na věk · nikdy Flesch/SMOG.
- **`direct` NENÍ „kratší věty"** — změřeno, že IS čtení má 13,6 slova na větu, tam už místo
  není. Je to **méně úkolů na jedno čtení**.
- **Kontrola k dodělání:** projít `SEASON_POOLS` a označit, které obrazy jsou konvenční
  a které novelní (novelní stojí 40 % / 10 % srozumitelnosti proti ~90 % u konvenčních).
- **Test porozumění (návrh k realizaci):** distraktorový recall — 3 otázky, správná odpověď
  z jeho čtení, dva distraktory z **jiného tahu run téže délky a registru**.


### ⟵ §20 SWEEP 2026-08-15 — 34 nálezů, stav

Pět nezávislých úhlů + adversariální audit každého nálezu. Každý nález má `soubor:řádek`
a byl doložen spuštěným příkazem. **Zdroj:** workflow `wf_62679055-021`.
Detail nálezu, který tu chybí, se dá dohledat v `RUNAR_DECISIONS.md` téhož dne.

### ✅ Hotovo (ať to nikdo nedělá podruhé)
- `applyISCorrections` volaná v shrine **za** zaplaceným callProxy → `ab08a2b`  <!-- check-docs:ok 2026-08-15 nález JE o zbytku po odstraněném post-processoru -->
- Visitor gate 1 → 5 run · `v2/runar-help.html` „Unlimited readings" + `Rúnaleitandi` → `b6fdf9e`
- Yggdrasil Skuld dorovnána na Norns · IS reader ukazoval anglická jména run → `3236272`
- Norns „osa osudu" → „osa stávání" (rozpor s vlastním zákazem) → `907a435`
- Úhel vs. větev: dva nároky na první větu → `d3ff24a`
- `journey`/`ferðalag` v datech runy Raidho + hlídač → `a129d2f`, `829c8b1`
- Můj vlastní špatný komentář „buildSysPromptV2 nikdo nevolá" (volají ho 3 skripty) → `ab08a2b`

### 🔴 Zbývá — mění výstup modelu
1. **Anglické názvy živlů jdou do 25/25 islandských promptů.** V promptu stojí
   `Frumefni: Air`. Zdroj `runar-runes.js` `elements`. Potřebuje IS překlad živlů
   (obsah → Cowork), zapojení CODE.
2. **Šest byte-identických kopií JSON kontraktu** — `runar-character.js:1286/1447/1528` (EN)
   a `1269/1434/1511` (IS), md5 shodné. `:1137/1150` a `:1364/1377` jsou **záměrně jiné**,
   ty nechat. Nejlevnější oprava s největším dosahem: **nulová změna promptu**, nepotřebuje
   eval ani golden. Platí jen dokud jsou shodné.
3. **Pravidlo „obraz bere sezónu, která je teď skutečná" ve DVOU souborech** a obě kopie jdou
   do každého system promptu: `runar-character.js:998/:994` (`_spine`) × `runar-config.js:408/:417`
   (`VOICE_PROFILES.focused`). Grep uvnitř `v2/runar-character.js` tu druhou kopii **nenajde**.
   Latentní: `VOICE_PROFILES.lyrical` zdvojuje anti-ozvěnu i pravidlo o úhlu a vrací
   „frozen ground", které `_spine` zakazuje → přepnutí profilu = okamžitý rozpor.
4. **Táž instrukce 2× v každém spread promptu** — „ne proroctví" (`_intentionContext` × beats),
   „ne vysvětlování" (`_describeRule` × `RP_SINGLE.noqBranch`, týká se 2100 z 3192 promptů).
5. **`area` a `seeking` 2× v každém spread promptu**, a u `seeking` s rozporem: prompt vypíše
   „Seeking: Clarity" a o dva řádky níž zakáže „do not name it back".

### 🟠 Zbývá — kopie už rozešlá, čte se jako pravda
6. **Yggdrasil „jednou ročně / Dec 14–28 / Premium"** — šestá a sedmá kopie:  <!-- check-docs:ok 2026-08-15 nález JE o tom, že tahle mrtvá podmínka v kódu pořád je -->
   `runar-character.js:1491` (komentář) + `RUNAR_DESIGN.md:407,:466` + `v2/runar-help.html` („Seasonal
   readings at solstices and equinoxes"). Proti `CLAUDE.md`, `RUNAR_DECISIONS.md` a
   `runar-config.js:353-357`, kde stojí „kdo sem vrátí datumovou bránu, dělá to popáté".
7. **`RUNAR_PRICING.md:37` tvrdí model Sonnet 4-5**, proxy jede Opus 4.8
   (`claude-proxy/index.ts:654`). Sloupec „Claude" v tabulce `:43-49` je pak počítaný na ceně
   jiného modelu → **break-even je špatně**. [O] přeměřit nebo označit datem + modelem.
   ✅ 2026-10-11: přeměřeno na GPT-6 sol z dat produkce (`scripts/utils/pricing_tabulka.js`); break-even zůstává ~8.
8. **Pozice spreadů opsané v `RUNAR_DESIGN.md`** se rozešly s produkcí: `:394,:404`
   **Múspellsheim** — v kódu 0 výskytů (produkce má `Svartalfheim`) · `:371` hodnota ze zálohy
   z 6. 6. · `:386` „IS pozice: navrhnout" — jsou v produkci.
9. **Yggdrasil IS `Miðgarðr = daglegar raunir`** proti třem ostatním kopiím („Daglegur
   veruleiki"). `is-vazba`: `raunir` = strasti, ne realita. Rozešel se i `Ásgarðr`.
10. **Kříž, pozice 3 — IS si odporuje sám v sobě**: hlavička „urd" (co bylo utkáno) ×
    instrukce „hvað liggur í undirmeðvitund" (co je teď pod povrchem). Kánon
    (`RUNAR_DESIGN.md:365`) říká „skryté / kořen / podvědomí" → odchýlený je IS štítek.
11. **`SPREAD_CONFIG.positions` + `norns_axis`** — 48 řetězců pod hlavičkou „single source of
    truth", které **nikdo nečte** (živé pozice jsou `RP_*` packy). **NEMAZAT** —
    `RUNAR_BACKLOG.md` to pole teprve plánuje začít číst. Teď: sundat nálepku pravdy + guard,
    který pack a config porovnává.
12. **`RUNAR_DESIGN.md` popisuje nepostavenou tree mechaniku jako živou** (`:543-624`
    vážené hlasování intention›area›seeking) — v `runar-tree-prod.js` je area = strana,
    výška = jen intention, `seeking` má 0 výskytů. Rozešla se i strana.
13. **`detectPatterns()` neexistuje**, `runar-config.js:184` ho jmenuje jako čtenáře.
    `PATTERN_WINDOW` a `TRANSFORMATION_PAIRS` mají 0 čtenářů. Strukturu NEMAZAT, přepsat komentář.
14. **`loadLifeRuneFromDB` (`runar-tree.js:656`) mrtvá**, komentář jmenuje neexistujícího
    volajícího, tělo je rozešlý duplikát živého kódu (`.single()` vs `.maybeSingle()`).
15. **GDPR: `RUNAR_PRIVACY.md:34-37` (EN)** se rozešel s tím, co uživatel odklikne. IS pár sedí
    znak po znaku → zastaralý je doc. **[O]** EN slibuje `the EU`, IS `innan EES` — uživatel
    souhlasí podle jazyka s jiným územím. 🔒
16. **`RUNAR_PRIVACY.md:91` posílá IS text do fronty, kterou owner zrušil** („→ Sigrún").
17. ~~**Retirovaný název „Rune Keeper" v 8 místech**~~ **HOTOVO 2026-08-20** (8 komentářů → „Rune Wanderer"; obě výjimky ověřeny, že zůstaly). Původně: produkčního kódu (config má  <!-- doc-values:ok 2026-08-15 nález JE o tom mrtvém jméně; pojmenovat ho musí -->  <!-- check-docs:ok 2026-08-15 tentýž nález, druhá kontrola -->
    `premium.label = 'Rune Wanderer'`). Legitimní výjimka: `reader.html:6` `<title>` a `:144`
    `alt=` — Rúnar sám Keeper je.
18. **Drobné rozešlé texty v readeru** — `reader.html:463` „once … one free reading" ×
    `TIER_LIMITS` · `:281` „SPECIFIC QUESTION" × `translations.js:83` „THE SITUATION" ·
    `shrine.html:397` `✎` × `translations.js:130` `✒`.
19. **`shrine.html:315` sdílený klíč `voice_btn` na sémanticky jiném tlačítku** (reader =
    PŘEHRÁT, shrine = GENEROVAT). Správný je natvrdo psaný HTML text, chybný je klíč.
20. **Doky s čísly, která se rozešla** — `README.md` (8 polí × 7, špatná signatura
    `buildSysPrompt`, `voice_dynamic` neexistuje) · „25 Elder Futhark" = 24 + Blank ·
    `RUNAR_DESIGN.md:470` „50/75 run/měsíc" — jednotka je reading-unit · `runar-config.js:292`
    komentář „cost = number of runes" je nepravdivý (Yggdrasil 9 run = 5 kreditů).
21. **`CLAUDE.md:333` + `RUNAR_TREE_MAP.md:3` „crown-composer 1:1"** — produkce je ~25 dní
    a osm symbolů pozadu.
22. **`journal_teaser`: pět kopií, dva zapisovači do téhož elementu**, název tieru natvrdo
    v HTML (`reader.html:708`).
23. **Motto „The runes do not predict your fate" na 6 místech**, `#hero-quote` obchází
    `v2/runar-translations.js`. Zatím shodné.

### Co ten sweep NENAJDE
Rozpory, které nejsou textové — dvě instrukce, které si neodporují slovy, ale výsledkem.
A cokoli v datech mimo repo. To zachytí jen měření na výstupu modelu.


### ⟵ Nálezy z workflow — k triáži
### Směr: jeden obraz, víc významů (KUKY 2026-10-05) — krok A nasazen (v4.95), B a C čekají (CODE-tune)
Owner: *„nature force ho hodí i pro řeku. Jde mi spíš o to, že by bylo fajn, kdyby nějaký obraz mohl být popsán různými meanings.
Neříkám, že to teď asi pasuje na všechny obrazy pod runou."* Dnes nese každý obraz v `RUNE_IMAGES` JEDEN význam (sloupec aspektu)
a ten jde do promptu jako „focus on: …" → esenční věta ho pojmenuje; u Hagalazu nese „disruption" 4 obrazy z 8 (stejně Algiz,
Gebo, Wunjo, Ehwaz, Berkana). Návrh: u obrazů, kde to opravdu sedí, 2–3 významy a los mezi nimi (malá změna dat + výběru,
ne promptu). Rizika: význam se jmenuje nahlas, musí sedět na scénu (aspekty se dřív ověřovaly bránou proti k_is); IS aspekt
k EN; `_promptDraws.kws` musí dál zapisovat, který padl (databáze čtení ho ukazuje). Začít jednou runou (Hagalaz), ukázat ownerovi.
**Krok A hotov** (DECISIONS 2026-10-05 (6)): aspekt smí být „a|b", jeden los pro oba jazyky, sáček per obraz; řeka a poryv
`nature force|disruption`. Owner chce **postupně, po jednom** — další krok volí on:
- **B** — brána „které z pěti významů obraz unese" pro všech 8 obrazů Hagalazu (3 soudci × obraz × jazyk, smí vybrat víc; 48 krátkých
  volání). Obraz dostane všechny významy, na kterých se shodnou.
- **C** — ostatní runy: u 25 ze 183 obrazů vybrali islandští a angličtí soudci jiný význam; po odečtení těch, kde jde jen o jiné
  pořadí klíčů (Fehu, část Dagazu) zbývá 14 obrazů se skutečně jiným významem a 3 skoro synonyma (Ansuz dopis voice/messages, Thurisaz trn thorn/protection/caution, Laguz
  flow/intuition, Othila home/heritage, Ehwaz trust/partnership…) — hotoví kandidáti na dva významy bez nového souzení.
- Tvar definiční věty (*„Hagalaz names X"*) víc významů nezmění — to je prompt → lab CODE-read.
**Kolo k4 (2026-10-05, DECISIONS 2026-10-05 (9)–(11)):** B hotovo pro Hagalaz (+1 význam na obraz), C hotovo u 6 obrazů,
D 7 nových obrazů. **9 rozporů ROZHODNUTO 2026-10-06** (DECISIONS 2026-10-06 (1): Othila opravena, zbytek beze změny) — byly to: Isa hodiny *waiting* ·
Laguz ledovcová řeka *the unconscious* · Nauthiz pletení *growth through challenge* · Ingwaz semínko *innri þróun* · Dagaz
probuzení *turning point* · Raidho cesta *movement* · Ansuz havran a dopis *rödd* · Othila zřícenina *heritage*/*hefðir*; a u
Hagalazu *transformation* (strom 0/4, střecha 1+1). Návrhy náhrad v DECISIONS (10). Formát k4 (víc významů) se od srpnového
(jeden nejlepší) liší, takže 0/4 není důkaz — rozhodnutí je obsahové.
**Data (§22):** `k` a `k_is` nejdou ve stejném pořadí u Fehu (wealth↔auður) a Dagazu (breakthrough↔bylting, light↔ljós,
transformation↔umbreyting); Othila heritage↔hefðir neodpovídá smyslem (heritage≈arfur). Nic to dnes nerozbije (seznamy se
čtou zvlášť po jazycích), ale párování víc významů je tam ruční — smoke ㉤ ho ukazuje žlutě. Srovnat pořadí = obsahový krok.

### Ask mluví o OBRAZU místo o runách: „The picture does not say…" (owner 2026-10-04 14:38) — MALÁ oprava, čeká (CODE-tune)
Owner u Asku k Nornám (Perth · Algiz · Eihwaz, nápověda „Inner Growth — can you make this image clearer?"): *„The picture does not say
what you will find, or that the fog stays away."* → *„Není to obraz, ale jsou to runy. Obraz je jen prostředek, jak to uživateli ukázat.
Pravděpodobně to přihází z otázky ‚can you make this image clearer?‘. Udělám ještě pár a uvidíme."* Kandidáti (neměřeno): nápověda
„make this image clearer" (2026-10-03 (12)) a konec první věty RP_ASK *„speak from what the picture holds"* (2026-10-03 (13)).
Až owner řekne: pilot s *„…from what the runes drawn hold"* místo obrazu, měřit „the picture/image does (not)…" a úhel.
**2026-10-06 změřeno (sol, `docs/eval/2026-10-06-ask-otazky/README.md`, EVAL_LOG 2026-10-06 (4)):** pojistka *„the rune / reading /
image does not say…"* je ve 40 ze 124 ownerových Asků a dělá ji i Opus. **Pět domněnek vyvráceno** (věta o možnostech, o zrcadlení,
NO COLD READING, všechny tři naráz, „never predicts / does not guarantee" v charakteru — 13/18 beze změny). Pohnul s ní jen
**poslední řádek čtení** vyndaný ze vstupu (13/18 → 7/18, p = 0,09 — naznačeno): odpověď přebírá tvar dvou možností z mostu.
Pokyn „neopakuj, jak čtení skončilo" nepomohl (15/18). **Oprava v promptu není** — čtení z Asku vyndat nejde. Další krok je velký
zásah → lab CODE-read, nebo nechat; rozhodne owner. Podmět *„the picture"* je jen jedna z podob téže pojistky.
**→ CODE-read (owner 2026-10-06: *„zkusíme, jestli to nenajde CODE-read… musí se identifikovat ta věta samotná"*).** Ownerova hypotéza:
*„the rune does not say…"* odpovídá na něco, co stojí PŘESNĚ v instrukci Asku — *„say what the runes … hold"*. Pravidlo o prostých slovech
(*„Say what the runes of this reading hold, in the terms of their own question"*) žádná z mých variant neodebrala → první test pro CODE-read.
Monitor ozvěn tenhle řádek od 2026-10-06 ukazuje sám („odkud" u ozvěny pokynu).
**2026-10-06 večer — PŘEMĚŘENO se vstupem jako v produkci** (EVAL_LOG 2026-10-06 (8), CODE-read (6)–(7)): produkce 26/30; na polovinu ji sníží
každá z pák — most čtení, charakter (*never predicts / does not guarantee / never hand a conclusion*), tři pravidla Asku s runou jako
„nositelem“, NO COLD READING; hlavička aspektu sama ne. **Návrh k rozhodnutí ownera:** přeformulovat tři pravidla Asku (testovací znění CODE-read
*„stay with this reading“* / *„Explain this reading in the terms of their own question“* / bez *„from the runes“*: 26 → 14/30) — znění před
nasazením ověřit zdrojem (memory `en-formulace-overit-zdrojem`).

### Slova tipů Asku — pokus B 2026-10-06 — tipy vyřešeny (DECISIONS 2026-10-06 (12), (13)), zbývá IS (CODE-tune)
Měřeno na solu, EN, 3 čtení × 3 (`docs/eval/2026-10-06-ask-otazky/README.md`). Každé znění tipu má svůj stálý začátek odpovědi;
jiná slova formuli přesunou, neodstraní (směr → `RUNAR_DESIGN.md` „Slova, která dáváme modelu", body 4–5).
- **`ask_h_rune`** a **`ask_h_image`** — náhrady nebyly lepší (jen přesunuly formuli), zůstávají.
- **IS strana změn 2026-10-06 neměřena:** IS rámce esence (v4.99 a v5.01 jen EN) a v IS Asku pořád *„Rúnir sem dregnar voru"* /
  *„dregnu rúnirnar"* (v5.00 jen EN). Změřit, jestli sol dělá totéž v islandštině, než se na IS sáhne. Islandská slovesa definiční
  věty (*merkir, táknar, stendur fyrir…*) ověřit korpusem Risamálheild stejně jako anglická (DECISIONS 2026-10-06 (10)).

### Ask: oblast znamená v Asku jen název — odpovědi „obecně“ (hlášení c748c744 a 71d03c9b, 2026-10-06), ČEKÁ NA OWNERA (CODE-tune)
Owner (15:21, Raidho · Healing & Wellbeing): *„otázka v Asku healing and wellbeing se promítne… je to takové obecně. Měli bychom říct, co to
vlastně otázka healing and well being znamená. Možná můžeme otázku i změnit.“* (15:29, Perth · Career): *„taky vidím, jak je v tomhle čtení
umístit otázku v area do závěrečné věty“* (*„could a skill shaped by years of practice be showing itself…“*). Stav: čtení dostane JEDNU podobu
oblasti (`AREA_FACES`, `prompt_draws.area_face`, např. *„the pace that can be kept“*), Ask jen název oblasti a tip *„{area} — can you make this
image clearer?“* → odpověď o oblasti obecně. Návrh: (1) Ask dostane tutéž podobu oblasti, jakou mělo čtení; (2) tip se ptá na tu podobu.
Ověřit nejmenším vzorkem, rozhodne owner.
**2026-10-07 — lab hotový, produkce beze změny** (owner: *„teď to dělat nebudeme… budeme dělat čtení a zjišťovat“*). Pět pohledů otázky
(EVAL_LOG 2026-10-07 (2)): owner po textech *„těžkost a všední den znějí nejlíp“* — *„{area} — where does this get hard for me?“* a
*„{area} — where might I notice this in my days?“* (pojistka 1/6 proti 4/6 u dnešního tipu). Otevřené: jestli a kdy tip v appce změnit
(IS znění vymyslet a ověřit; délka tipu na mobilu — BACKLOG „Tři tipy přetékají…“; *„You might notice…“* jako stálý začátek).

### Ask: životní runa Isa se do některých čtení nehodí — nabídnout ji modelu jinak (hlášení dc8e301a, 2026-10-06), ČEKÁ (CODE-tune)
Owner: *„Isa nemusí být jen stillness, ale taky jen pauza… model si k tomu asi sám cestu nenajde… musíme mu to trochu servírovat.“* Měřeno
dřív: klíče Isy „jako pozadí“ nic nepřidaly (README ask-zivotni-runa, tab. 1 — kolo s rozbitým vstupem). Otevřené.

### Sol opisuje otázku runy z Kolekce do konce čtení („do not strike back“, 2026-10-06), ČEKÁ NA OWNERA (CODE-tune)
Monitor ozvěn: otázka runy opsaná ≥ 3 slova 3/6 (Thurisaz *„you do not strike back“*, Berkana *„to grow at its own pace“*), vždy poslední věta.
`_runeQuestion` ji dává jako zdroj s *„say it in your own words“* — sol ji přesto opíše (pokyn neodklidí vstup, RUNAR_DESIGN „Slova…“ bod 6).
Owner: *„opakuje něco, na co by měl vymyslet fráze?“* Návrh: ověřit nejmenším vzorkem, jestli konec bez otázky runy (jen pro sol) nese runu
dál; jinak dát směr otázky místo jejích slov (obsah ownera).
**2026-10-07 — odpověď z dat, bez API** (owner: *„napřed to zjistit na datech, co máme“*): opis visí na **tvaru konce**. Sol s koncem-otázkou
otázku runy znovu položí (≥ 4 slova 4/14), s koncem-výrokem ji převede do vlastních vět (1/38; Fisher p = 0,015). Sol **bez** otázky runy
(lab 2026-09-22, 28 konců-otázek) runu dál nese — ptá se jejím významem (*„Could protection there mean noticing without closing the gate?“*
u Algizu), jen v ustálených tvarech *„Could…“*. ⇒ data stačí, test přes API netřeba. **Rozhodne owner:** u konce-otázky otázku runy
nedávat (u ostatních konců zůstane). Čísla → EVAL_LOG 2026-10-07 (1).

### Audit promptu 2026-10-07 — zapsané nálezy. NEOTVÍRAT znovu, dokud se vada neobjeví v nových čteních a owner na ni neupozorní (CODE-tune)
KUKY 2026-10-07: *„určitě teď už nic neměň… je teď zapiš, až se objeví znova a já na ně upozorním, tak se s tím něco udělá.“* Stav každé
položky dohledán (`node scripts/utils/uz_vime.js`); měření → EVAL_LOG 2026-10-07 (1) i s opravou.
3. 🔄 **Rozhodnuto ownerem:** podoba oblasti ve čtení zůstává, jak je (DECISIONS 2026-10-03 (4): *„D1 a D2 taky nic“*) · zdroj myšlenky ✦
   = odstavec Kolekce (2026-10-03) — stejné téma ✦ u téže runy je jeho důsledek a řadu takových ✦ si owner uložil jako keep.
4. ℹ **Vysvětleno, ne vada:** *electricity* v ✦ u Hagalazu = z obrazu *„The power goes out in the storm…“*.
5. [ ] **Jen zapsané, owner je nehlásil:** Opus začíná větu o runě *„<runa> is…“* 19/25 · Ask na *„How does this reading affect me?“*
   začíná stejně (*„[runa] speaks of…“*) 3/6 · ozvěna zákazu verdiktu ve čtení 4/79 (Hagalaz *„not a verdict / not a punishment“*).
6. [ ] **Ask pojistka — owner na ni upozornil 2026-10-08** (hlášení 744028f4): *„It leaves room for you to recognize it, or not… nevím, jestli
   je úplně třeba říkat ‚or not‘.“* Po v5.03 změnila hlavně tvar: *„leave(s) room for…“* v produkci 9/82 → 8/17 (p = 0,001), podíl pojistky
   beze změny (72 % → 71 %, n = 17). Měřák labu ten tvar neviděl, účinek v5.03 byl nadsazený (28 → 20 ze 30, ne 26 → 14) → EVAL_LOG
   2026-10-09 (1). Jednou větou se to nespraví — nese ji víc zákazů verdiktu naráz.
   **Owner 2026-10-09 k příkladům:** *„‚…recognize it, or not.‘ odstraníme ‚or not‘. Stačí říct, že to člověk v sobě musí najít. Když to
   nenajde, tak to nenajde, ale to mu my říkat nemusíme. Ostatní jsou cajk.“* → vadí jen ocas obojím směrem, ostatní pojistky ne.
   Ocas je vzácný: produkce 1 ze 148 Asků od 2026-09-25, lab 2026-10-06 0 ze 300 — pokus by neměl co měřit. **Hlídá ho monitor ozvěn**
   (řádek „Ask: …, or not“ od 2026-10-09). Až se začne vracet, teprve pak lab CODE-read (předávka připravena v konverzaci 2026-10-09).
   Monitor počítá jen ocas věty `/,\s*or not[.?!]/` — holé „or not“ chytalo i obsah (Kenaz 2026-09-23 *„close to the flame, or not at
   all“*; 18 shod z 1204 Asků, ocas z nich 1). Předávku převzal CODE-read 2026-10-09; podmínka ten den nesplněná (jediný případ = Laguz 744028f4).

### Podoby oblastí psané jako vedlejší věta se opisují doslova — návrh přepisu: owner NEDĚLAT, SLEDOVAT (CODE-tune, 2026-10-09)
⏸ **KUKY 2026-10-09:** *„14. nej to zapis. budeme dal testovat a pokud to nejak vyskoci tak na to zareagujeme.“* → přepis se nedělá;
vrátit se k tomu, až se doslovný opis podoby objeví v nových čteních a owner na něj upozorní (§30: ownerovi to znovu nepředkládat).
Owner k v5.05: *„u pozor… proto jsme trénovali, jak věty napsat správně, aby je model lépe používal. Najdi to a navrhni změny.“*
Data (EVAL_LOG 2026-10-09 (3), produkce EN, malý vzorek): opis ≥ 4 slova u Purpose [2] *„what gives someone the will to continue“* 2/4
(*„What gives you the will to continue may be…“*), Healing [1] *„what gives strength back“* 2/5, Healing [2] *„the pace that can be kept“*
1/2; podoby jako holé jméno (*„slow change“*, *„making and shaping“*) 0. Zásady „Slova, která dáváme modelu“ bod 1 a 3.
**Návrh:** vedlejší věty přepsat na krátké jméno (kandidáti napřed přes Ngram, pak sol 2–3 podoby × 6 čtení, texty ownerovi). Vrácené
podoby z 2026-10-09 (9) jsou už psané tak, že doslovný opis zní přirozeně. Rozhodne owner, jestli a kdy.

### Prompt × návody výrobců (Anthropic Opus 5, OpenAI GPT-6) — nálezy 2026-10-04, ČEKÁ NA OWNERA, co s nimi (CODE-tune)
⭐ **KUKY 2026-10-05: velké body (4, 5, 6, 8) a přestavba promptu → LAB CODE-read, ne produkce** (DECISIONS 2026-10-05 (3)).
Do produkce jen malé ověřené opravy přes CODE-tune, po jedné. Body 1–3 a myšlenka ≤ 12 slov už jsou v produkci (v4.92–v4.94).
Owner: *„najít nesrovnalosti, pak vyřešíme, co budeme dělat“*. Čísla → EVAL_LOG 2026-10-04 (4); citace výrobců ověřené na jejich stránkách.
⏸ **LAB CODE-read (handoff CODE-tune proti `598522d`): připraveno, NEZAČATO** — 2026-10-05 načteno vše, co už bylo k bodům 4/5/6/8
a přemýšlení změřeno, a sepsán závěr pro přestavbu → `memory/snapshots/2026-10-05-lab-co-uz-vime.md`. Owner 2026-10-06 lab odložil
(„potřebuju, abys udělal něco jiného"). Navázat od bodu 8.
2. **Délka u Opusu 5** — Anthropic: Opus 5 píše delší, effort délku neřídí, *„prompt for it explicitly"* + *„a short reminder near the
   end of the prompt"*. U nás číslo uprostřed, na konci jen *„Stay within the word count"* bez čísla a úplně poslední je sekce ✦.
   Příznak: Opus 5 čtení ~70 slov proti rozpočtu 50–58 (sol 58–60). ◐ **2026-10-04 (v4.92):** připomínka s číslem jako poslední
   řádek single → Opus 72,5 → 64,3 slov (EVAL_LOG 2026-10-04 (5)); pořád nad rozpočtem. Spready a IS zatím bez připomínky.
4. **Zákazy místo pokynů** — Anthropic: *„Tell Claude what to do instead of what not to do"*. Zákaz má 53–57 % vět každého promptu.
   Souvisí s ownerovým *„čtení dostává hodně omezení a mantinelů"* a s tím, že Ask (méně zákazů) píše líp (EVAL_LOG 2026-10-03 (1)).
5. **Data uvnitř pokynů** — oba výrobci: oddělit vstupy od pokynů (XML / Markdown). U nás obraz, podoba oblasti a otázka runy stojí
   uvnitř vět s pokynem (*„IMAGE — … comes from here: <obraz>. Let it become…"*, *„land on <podoba>"*). Příznak: sol bere vstupy skoro
   doslova (*„Among your people"*, *„what links you to those before and after"*). Memory `prompt-directive-makes-model-copy`: rámování
   jako zdroj opisování snížilo (měřeno na Claudovi) — na solu neměřeno.
6. **Příliš předepsaný postup pro model, který přemýšlí** — OpenAI (GPT-6 průvodce 2. 10.): *„overly specific guidance can now hinder
   results"*. Sol teď přemýšlí (`low`) a dostává ~7 pevných kroků do 4 vět. Souvisí s nevyřešeným „Obraz × oblast" výš.
7. **Kontrola vlastní práce v systémovém promptu** — *„LANGUAGE & STYLE — check every sentence before returning"*. Anthropic přímo
   k Opusu 5: ověřovací pokyny *„can cause over-verification… remove these instructions rather than rewriting them"*. Příznak neměřen.
8. **Napětí „spoj s člověkem" × „netvrď nic o něm"** — *„The image must connect to where this person is standing right now"* proti
   NO COLD READING a *„Do not tell them what they carry from their people"*. Přesně v té zóně leží ownerovy výtky (tvrzení o domově,
   *„someone whose absence is plain"*). OpenAI: nejasné nebo rozporné pokyny model brzdí.
**Zkontrolováno a v pořádku:** důvod u délky (čte se nahlas) · role v systémovém promptu · stálé napřed, proměnné potom · pomlčky,
zakázaná slova a uniklé značky ve výstupech 0 · cache Claude zhruba nula. **Nízká priorita:** otázka uživatele v uvozovkách místo
značek (Anthropic `<pasted_content>` je pro VLOŽENÝ text) · `system` × `developer` role u solu v Chat Completions (neověřeno) ·
`verbosity` u solu (délka teď sedí).

### sol: prompt se zapisuje do cache, ale nikdy se z ní nečte — ✅ NASAZENO 2026-10-04 (proxy v74, DECISIONS 2026-10-04 (4))
Od 1. 10. 23 čtení přes gpt-6-sol: `cache_write_tokens` 30 855 ze 30 924 vstupních tokenů, `cached_tokens` 0. Ceník gpt-6-sol
(2026-10-04): zápis $2,50 = 1,25× vstupu → platili jsme čtvrtinu vstupu navíc za nic. `MODEL_PRICES` to počítá **správně**
(`openaiCacheWrite` 1,25 od 2026-09-25) — do 2026-10-04 tu stálo, že zápis v ceníku chybí; omyl CODE-tune. Oprava:
`prompt_cache_options: {mode: "explicit"}` v `callSol` (ověřeno voláním: zápis 1220 → 0), DECISIONS 2026-10-04 (3).

### claude-proxy: zastaralý komentář u řetězu modelů — ✅ NASAZENO 2026-10-04 (proxy v74)
`supabase/functions/claude-proxy/index.ts` u `MODELS` začíná *„Primary Opus 4.8; … fall back to Opus 4.7“*, o pár řádků níž stojí platné
*„2026-09-24: primární claude-opus-5, fallback claude-opus-4-8“*. Kód je správně, první odstavec lže. Opravit při příštím deployi proxy
(změna jen komentáře; v repu ji neprovádím samostatně, ať se repo a nasazená proxy nerozcházejí bez deploye).

### Studené čtení hlídat na VÝSTUPU, ne jen ve zdroji (2026-08-15)
Doloženo reálným čtením: vložený obraz zněl „you **do not** know what waits beyond it"
(zápor, hlídač ho správně pouští) a model napsal „**You know** this stillness". Otočil ho.
Zdrojová kontrola (`test_no_planted_bans.js`) proto **nestačí** — §19.3, vada žije ve výstupu.
**Co udělat:** vzít odladěný detektor z `test_no_planted_bans.js` (`isColdRead`) a pustit ho
v `scripts/utils/measure_readings.js` na `reading_text`. Vyjde z toho procento čtení, která
tazateli tvrdí, co v sobě zná — měřitelné napříč verzemi promptu jako papouškování obrazu.
Pozor při měření: `_noColdRead` zakazuje tvrdit, co ČTENÁŘ zná; věta o runě nebo o krajině
tím není dotčená, takže detektor musí zůstat vázaný na „you".

### `spread_data` se nikdy nevyplní — u 63 spreadů nevíme, co padlo (2026-08-15)
`readings.spread_data` je u **všech** spreadů `null` (ověřeno dotazem; spready se poznají podle
`area='spread'`, ne podle toho sloupce). U 63 anglických spreadů tedy nevíme, které runy padly
na které pozice — a zpětně to nedoplníme. Owner 2026-08-15: *„i teď nepoužitelná data můžou mít
cenu zlata za pár měsíců."* Tohle je přesně ten případ.
**Co udělat:** zapsat pozice+runy do `spread_data` v `claude-proxy` (stejným způsobem jako
`prompt_draws`); pozor na pořadí — sloupec existuje, takže migrace netřeba.
**Proč to blokuje měření:** `find_seeds.js` musí spready ze skenu vyřadit; bez `spread_data`
nejde říct, která pozice ve spreadu který zárodek nese.

### Klíčová slova run se opisují do čtení — otázka na ownera (2026-08-15)
`find_seeds.js` naměřil: `stillness` u Isa **70 % vs 5 %** (p = 6,6e-7), `road` u Raidho 80 % vs 3 %,
`root` u Eihwaz 67 % vs 9 %. Slova pocházejí z `RUNES[].k` (`Isa.k = 'ice, stillness, waiting,
pause, clarity through cold'`), které prompt runě dodává. Vysvětluje to část „stejnosti" čtení
téže runy — každé sáhne po stejném slově.
**Rozhodnutí je ownerovo (obsah):** mají klíčová slova runu **navádět**, nebo jí dodávat slovník?
⚠️ **Ale nejdřív se musí prokázat příčina** — korelace u runy ji neurčí (runa způsobuje náš seznam
i model najednou). Test je **hotový a nepotřebuje nové generování**: `find_seeds.js --kws` porovná
uvnitř jedné runy čtení, kde klíčové slovo **padlo** (prompt losuje 3 z 5–6, `prompt_draws.kws`),
proti těm, kde nepadlo. **Blokuje jen objem:** k 2026-08-16 má log losu 11 čtení, práh je 30.
Owner 2026-08-16 navrhl přidat klíčovým slovům **ekvivalenty**; má to smysl teprve tehdy, když
test ukáže, že se z toho košíku tahá.

### Cache se možná platí a nečte — sledovat, až bude víc dat (2026-08-16)
Obě produkční čtení s `usage` mají `cache_creation_input_tokens = 1373` a
`cache_read_input_tokens = 0`. Zápis do cache stojí **1,25× základní sazbu**, čtení jen 0,1× —
takže když se zapisuje a nikdy nečte, platí se přirážka za nic. U těchto dvou to **nic nedokazuje**
(čtení jsou nejspíš daleko od sebe a 5minutová TTL mezitím vypršela). ⚠️ Ale kdyby `cache_read`
zůstal nulový i u čtení, která jdou rychle po sobě, je to zbytečně **zhruba polovina ceny čtení**.
**Co udělat:** až bude `usage` u ~20 čtení, spočítat podíl `cache_read > 0` — dotaz na jeden řádek.

### Úhly 3 a 5 přikazují to, co `_noColdRead` zakazuje — rozhodnutí ownera (2026-08-16)
Doslovně: zákaz zní *„never tell the seeker what is true, **stirring**, or known inside them"*,
úhel 5 zní *„Lead with what is **stirring**"* a úhel 3 *„Lead with the body — … physical sensation"*.
Úhel 5 používá to samé slovo. Změřeno na 230 generovaných čteních: úhly 3+5 nesou nárok na vnitřní
stav **pětkrát častěji** než ostatních pět úhlů — čísla a test → `RUNAR_EVAL_LOG.md` 2026-08-16
(§20: měření bydlí tam, sem patří jen otevřená otázka). Model nechybuje — poslouchá.
**Není to jen přeformulování.** „Veď tělem" je dobré řemeslo: nejkonkrétnější věta ve čtení bývá
tělesná. Zákaz existuje proti neověřitelným tvrzením o nitru. **Buď se zúží zákaz** (např. tělesný
vjem povolit jako obraz, ne jako tvrzení o tazateli), **nebo se přepíší dva úhly** — obojí je obsah,
tedy owner + Cowork. Aparát na ověření změny stojí (`measure_readings.js --rules`, dělení po úhlech).

### Islandský detektor studeného čtení neexistuje (2026-08-16)
`measure_readings.js --rules` u IS vypisuje **NELZE**, ne nulu — regex je anglický. U 74 islandských
produkčních čtení tedy o téhle vadě nevíme **nic**, a IS je přitom primární jazyk (§2).
**Co udělat:** islandský ekvivalent `COLD_VERB`/`COLD_PHRASE` (vita, finna, muna, skynja + „þú"),
ověřit vazby korpusem a nasadit tři sondy jako u EN. Pozor: „þú veist" může být i řečnická otázka.

### IS se týden neměří a dnešek stojí celý na angličtině (2026-08-16)
Poslední islandské produkční čtení: **9. 8.** Všech ~380 dnešních generovaných čtení bylo **anglicky**
— zárodky, úhly, oblasti, A/B test `_domainContext`. §2 přitom říká, že IS je primární a EN vedlejší.
**Co udělat:** než se přijme jakákoli dnešní změna promptu jako hotová, prohnat ji islandskou dávkou.
`gen_batch --lang is` funguje; chybí jen to udělat.

### ⭐ Z reportu nevede ŽÁDNÁ cesta do promptu — 53 otevřených hlášení (2026-08-16)
Owner ukázal, že `bug_reports` existuje a testeři ho používají. ⚠️ **OPRAVA (2026-08-16, moje chyba):** napsal jsem „53 záznamů a ani jeden není vyřešený".
**Nebyla to pravda.** Filtroval jsem `status is distinct from 'resolved'` — jenže `resolved`
v téhle tabulce **neexistuje**; platné stavy jsou `new` / `triaged` / `fixed`
(`list-reports/index.ts:45`), takže filtr byl pravdivý pro všechny a započítal i **18 opravených**.
Skutečnost: **new 21 · triaged 14 · fixed 18.** Owner je zavíral a já mu tvrdil opak.
⭐ **Poučení zabudované do kontroly: nehádat sentinel.** `verify_open_reports.js` teď stav
**tahá** a neznámou hodnotu vypíše nahlas, místo aby ji tiše zařadil. Hádaná hodnota vypadá
jako funkční filtr, dokud se na ni nepodíváš. Uvnitř leží **rodilá zpětná vazba na
islandštinu**, kterou nikdo nepřetavil v pravidlo:
- *„Hrafn sem ríður vindinum. **Þetta er léleg íslenska, við segjum þetta ekki svona á íslensku.**"*
  (2026-08-02) — ověřeno korpusem: **0 výskytů**, kalk z EN „riding the wind". **Fráze zůstala
  v promptu dva týdny** (`hs_ravenmoor`) a celou dobu se vkládala do islandských čtení.
  Opraveno 2026-08-16 na `svífur hátt yfir fjöllin` (20 výskytů) + přidáno do `check-is.py` (§9).
- *„Í miðju þínu situr **kyrran**"* — označeno **dvakrát** jako divné. Ve zdroji ta podoba není;
  model si podstatné jméno vyrobil sám z přídavného `kyrra`. Patří do `runar_corrections`, ne do zdroje.
- *„Það vantar orð"* → návrh `fyrsta sólarglætan` · *„fetið fyrir fetið"* → návrh `Fet fyrir fet`.
- EN: *„This reading was difficult for the person to understand as she could not picture it."*

**Jádro problému není ten jeden obraz.** Je to, že **report se uloží a tím to končí**: není v
`check-is.py` BAD_PATTERNS, není v `runar_corrections`, nikdo ho nezavře. Rodilý mluvčí nám dal
přesně to, co si žádnou metrikou nekoupíme — a leží to bez užitku.

**Co udělat (rozhodnutí ownera, je to proces, ne kód):** kdo a kdy reporty prochází, a kam se
z nich zapisuje. Minimum: typy `rephrase`/`replace` = 11 kusů, projít je a každý skončit buď
v `check-is.py` (zdrojová vada), v `runar_corrections` (vada výstupu), nebo se `status` zavře
s důvodem. Bez toho bude testerů deset a hlášení sto padesát.

### „This reading is for" nemá na čtení žádný vliv (2026-08-16)
Owner řadí `area` · `intention` · **„this reading is for"** mezi páky, které mají mít velkou váhu.
Změřeno diffem promptu (10 běhů, průnik, čtyři možná jména pole): **`_readingMode` do promptu
nevstupuje vůbec.** Řídí jen ukládání do journalu (`runar-reading.js:105,161,221`);
`runar-character.js` o něm neví.
**Rozhodnutí ownera:** má čtení „pro někoho jiného" znít jinak? Když ano, je to nová věta do
promptu (§13 full-path: single + 4 spready × 2 jazyky). Když ne, je to jen ukládací přepínač
a nemá se o něm mluvit jako o páce.

### Detektor studeného čtení míjí vazby bez epistemického slovesa (2026-08-16)
Nalezeno na reálném čtení (16. 8., Eihwaz, v2.1): *„**What holds you**, Kuky, is what Eihwaz keeps
below the ground…"* — tvrzení o nitru tazatele, které detektor nechytí, protože hledá
`know|feel|sense|remember`. Táž rodina: „what keeps you", „what carries you", „what waits in you".
**Důsledek: naměřených 18–24 % je SPODNÍ odhad.** Rozšířit `COLD_VERB` o vazbu
`what <sloveso> you` a doplnit sondy; pozor na kolizi s otázkami (ty se nepočítají) a na `carry`,
které už jednou muselo ven jako fyzické.

### Sondy z výzkumu „Rúnar jako AI postava" (Cowork 2026-08-16)
Čísla → `RUNAR_EVAL_LOG.md` 2026-08-16, sem patří jen co otestovat.
- **P1 Dynamika vstupu.** Hýbe se čtení, když se změní `area`/`seeking`/otázka? `area` a
  `intention` změřené; **`seeking` a otázka ne.** Aparát stojí (`--specificity --by seeking`).
- **P2 Portentózní tón.** Zákaz chytá vyslovený nárok, ne **náznak** skryté znalosti. Sken
  výstupů na „to, co čeká uvnitř / co jsi ještě nepojmenoval". Souvisí s tím, že detektor míjí
  vazby bez epistemického slovesa („what holds you") — **táž mezera, dvě jména.**
- **P3 Prostor vs nárok.** Mají čtení bez nároku víc Ask follow-upů? Data na to **už jsou**
  (69 dvojic), nepotřebuje generování.
- **P4 Archetypální postoj** jako poctivý střed mezi holým obrazem a zakázanou radou. OPATRNĚ —
  hraničí s radou, kterou kánon zakazuje.
- **P5 Pozitivní QC checklist** z `base.philosophy` — dnes měříme jen zákazy. Souvisí s nálezem
  u Skuld: kladná půlka pokynu se nevynucuje sama.

### Rúnar zahazuje časový rámec otázky (2026-08-16)
Typická otázka zní *„jak se bude vyvíjet moje práce v následujících 3 měsících?"* — mířená do
budoucnosti. Rúnar **nepředpoví** (0/8, brána drží) a **nevysvětluje runu** (0/8), ale **7 z 8
čtení horizont vůbec nezmíní**. Uživatel se ptal na období a dostal přítomnost.
⭐ Model to přitom umí: *„Raidho walks these three months at a pace that is not yours to hurry."*
Horizont jako **úsek, který se jde**, ne jako budoucnost, která se doručí — odpověď na otázku
i kánon zároveň. Čísla → `RUNAR_EVAL_LOG.md` 2026-08-16.
**Rozhodnutí ownera (obsah):** má se to vynutit? Kánon zakazuje předpovídat, ne mluvit o rozpětí.
Kdyby ano, je to jedna věta do `qBranch` — a měří se stejným testem (podíl čtení, která rámec vezmou).
⚠️ Souvisí se Skuld: tam se taky ztrácí **kladná** půlka pokynu („můžeš jít jinak", 10/20).
Zákazy se vynucují samy, protože jsou měřitelné. Kladné pokyny ne. To je vzor, ne dvě náhody.


### ⟵ 2026-08-16 — otevřené po zavedení registru `direct`

- **Změřit registry párováním podle vloženého obrazu.** První řez (12 čtení) je zmatený:
  4 ze 6 dvojic dostaly jiný obraz z `RUNE_IMAGES` a rozdíl mezi registry se od té loterie
  nedá oddělit. Potřeba ~30 čtení na rameno a porovnat jen dvojice se **stejným** obrazem
  (obraz jde vytáhnout ze uloženého `prompt`). Detail → `RUNAR_EVAL_LOG.md` 2026-08-16.
- **Detektor studeného čtení neumí přisouzení DŮVODU/ZÁMĚRU.** Doloženo:
  `„Under the pause is the reason you sat down."` (direct/en, Isa) projde. Hlídá se
  „you know / you feel", ne „the reason you…". Rozšířit vzor, ale nejdřív změřit přesnost
  — u `finnur` a `carry` se ukázalo, že široký vzor vyrábí falešné nálezy.
- **Rozhodnout o `lyrical`.** Třetí registr, nepoužívaný, 3× E001 (rozkazovací způsob —
  není to vada, viz limit `is-grammar-qa`). Jde do porovnání s testery, nebo ven?

---


### ⟵ Vegvísir (Cowork návrh 2026-08-15 · konsolidace 2026-08-22 · ⏸ ODLOŽENO 2026-10-05)

⏸ **ODLOŽENO 2026-10-05 (owner: „zatím odkládáme, vrátíme se k tomu").** Upřesněno 2026-10-10 (owner): *„na Vegvísiru se pořád pracuje, ale teď je doopravdy odložený na pár dní.“* — pauza, ne konec. Kde jsme skončili a co visí (neposouzená EN čtení
z testu hranic, živel runy ve scéně, IS definice runy, prompt v3) → `memory/snapshots/2026-10-05-vegvisir-odlozen.md`;
rozhodnutí DECISIONS 2026-09-27 (3) (4) (6); měření EVAL_LOG 2026-09-27 (1)–(4).

### ⭐ VARIANTY STAVBY — přepsáno 2026-09-12 (KUKY: „to je to stejné!" — měl pravdu)

⚠️ **Původní tabulka V1–V7 (téhož dne) byla špatně:** předstírala sedm rovnocenných variant,
ale byly to **odpovědi na TŘI RŮZNÉ OTÁZKY** smíchané do jednoho seznamu. Proto nešlo říct,
kolik jich je — „V3" nebyla alternativa k „V4", šly postavit obě naráz. Správný tvar:

**OTÁZKA 1 — čí obraz je základ?**
- (1a) **životní runy** — statický střed, do něj vstupuje tažená runa
- (1b) runy ramene — životní runa vstupuje jako vztah *(změřeno 2026-09-12: F1–F5, R1–R4 — testováno OMYLEM místo (1a))*

**OTÁZKA 2 — odkud se základový obraz bere?**
- (2a) z banky `RUNE_IMAGES` (dnešní produkce)
- (2b) žádný dodaný — jen ukotvení na osu *(změřeno 2026-09-12)*
- (2c) uživatel si poskládá svět z osmi scén *(nápad KUKY 2026-09-12)*

**OTÁZKA 3 — kudy vstupuje tažená runa?**
- (3a) přímo do textu čtení
- (3b) **OTÁZKOU, stylem Ask nad hotovým obrazem** — KUKY: *„tam je Rúnar nejčistší
  a odpovídá na otázku"*; doloženo produkčními Ask výměnami
- (3c) **otázku i SCÉNU píše UŽIVATEL sám** — vlastní cestu pro rameno (KUKY 2026-09-12, viz položka
  „MOŽNOST: cestu pro rameno píše uživatel" níž). Slučuje (2c) a (3b): obraz dodá člověk, runa
  vstupuje jeho otázkou.

⭐ **OWNEROVA SESTAVA — V3 = statický střed × dynamická ramena** (definice opravena 2026-09-12, KUKY):
- **Statický střed = životní runa jako JEDNA CHŮZE ve VÍCE VARIANTÁCH** (zatím 6), losovaných
  tak, aby každá kombinace střed × rameno nezněla stejně. Varianty Gebo → níž, „ŽIVOTNÍ RUNA GEBO".
- ⛔ **Střed NENÍ čtení životní runy** (`user_profiles.life_rune_text`). To je výklad pro
  UŽIVATELE — ten si ho čte, Rúnar z něj nečerpá. KUKY 2026-09-12: *„proč bych Rúnarovi dával
  1600 znaků? Vegvísir je wayfinder."* ⚠️ Tuhle chybnou definici jsem sem 2026-09-12 sám zapsal a pak
  podle ní testoval — výsledek je v `RUNAR_EVAL_LOG.md` vedený jako **NE-V3**.
- **Rameno = tažená runa, vstupuje OTÁZKOU stylem Ask** — KUKY: *„tam je Rúnar nejčistší
  a odpovídá na otázku."*
- ⚠️ **Proč varianty, doloženo omylem:** když střed byl JEDEN pevný text, všechna čtyři ramena
  skončila v témže obraze („crossing" 4/4). KUKY: *„křížení je v každém čtení, takže je to nuda."*

**ŽIVOTNÍ RUNA GEBO — varianty chůze (dosud JEN v chatu, zapsáno 2026-09-12).**
Pravidlo (KUKY 2026-09-12): **„šest formulací, jedna chůze"** — varianty se liší slovy, ne tím, co
říkají; jinak přestane být střed středem. Chůze jednou větou: *stejná váha oběma směry —
netlačí a nenechá se nést.*
- **Kolo 1** (odmítnuto — KUKY: „všechno je fyzické"): meets the way halfway… · takes the road
  at a pace… · goes so that the ground gives back… · walks with both hands free… · never gets
  further than the road comes out to meet him · goes as one half of something…
- **Kolo 2 = platné** (bez terénu, prošlo kontrolou „jedna chůze"):
  1. moves by exchange, and counts nothing as arrived until it has gone both ways ⚠️ *KUKY: „připomíná mi to přesně to, co se mi nelíbí, když takhle Rúnar mluví"*
  2. never forces and never coasts — whatever carries him, he carries back
  3. goes at a pace neither side sets alone
  4. whatever he leans on has to lean back the same amount
  5. what goes out from him and what comes back are the same weight
  6. meets it halfway, and halfway is where he stops
- ⚠️ **Otevřené riziko, změřené 2026-09-12:** hotová věta o runě se opíše (F1: 10 slov v řadě). Varianty
  jsou věty → **první test na nich musí mechanicky měřit opisování**.

**Co na volbě NEZÁVISÍ** (změřeno 2026-09-12, netestovat dokola): formát ukotvení = jedna vazba
(věta o runě se opíše 10 slov · seznam vysype 4/5 klíčů · holý pokyn nedodá nic) · délka
čtení ramene ≈ 90 slov (KUKY) · sklon zavírat útěchou (4/4 při 90 slovech, při 55 míň) ·
vazba dorazí jen k runě s pohybem (Jera ✅ Gebo ✅ · Perth ❌ Isa ❌).



- [ ] **MOŽNOST: cestu pro rameno píše UŽIVATEL — do Asku, vlastními slovy** (KUKY 2026-09-12).
  **Proč, z dat:** (a) cokoli napíšeme, co má Gebo reprezentovat, Rúnar v každém čtení převezme
  a přepisuje — doloženo V3: Isa vrátila klíčové slovo varianty „pace" 2× („Your pace was never
  yours to set alone" · „call the pace shared"). ⚠️ Moje měřidlo to minulo — hlídalo jen doslovný
  běh ≥5 slov, ne vrácené klíčové slovo; druhé měřidlo (klíče v textu) na V3 nepuštěno. (b) vlastní
  slova člověka ukotví čtení **+8,8 b.**, nabídnutá **+2,7 b.** (2026-08-16, komentář u `_askHints`).
  ⇒ Když scénu napíše uživatel, Rúnar převezme zase nabídnutá slova — **ale jeho vlastní**. Vada se
  otočí v přednost.
  **Tvar (ownerův příklad):** uživatel vytáhne Isu a do Asku napíše *„Stojím na vrcholku hory. Jak je
  ISA ve spojení s GEBO?"* · další rameno Perth: *„Dívám se do dálky na letícího ptáka. Jak je PERTH
  ve spojení s GEBO?"* → Rúnar dá výklad tažené runy v té scéně, ve vztahu k životní runě.
  **Ukázková čtení (CODE 2026-09-12, ~85 slov, NEsouzeno):**
  - *Isa · vrcholek hory:* „At the top there is nowhere further up, and the climbing stops being
    something you do. Isa is that halt. The wind has dropped; the snow on the summit fell long ago and
    has not shifted since. Everything the ascent took out of your legs is up here with you, held in the
    cold, and Gebo stands half-finished: the giving has gone one way, and the other half lies under the
    snow, frozen exactly where it was given."
  - *Perth · pták v dálce:* „The bird is too far off to name. You can follow the line it draws across
    the sky, but not where that line began or where it will come down, and what it carries is a dark
    point too small to make out. Perth is the part of the flight kept from you. Gebo is the flight
    itself: something is being taken from one place to another, and you are watching the middle of the
    handing-over, with both ends out of sight."
  ✅ **Hodnocení ownera 2026-09-12:** *„ISA i PERTH jsou hezké a funkční — a myslím, že se tím ukazuje
  směr pro naše obrazy k runám obecně. Zatím nic neměníme, ale je dobré to zaznamenat."*
  ⭐ **Směr pro obrazy obecně (ZAZNAMENÁNO, nic se nemění):** obraz dodá člověk, runa říká, co se
  v něm děje, a životní runa je vztah UVNITŘ té scény — ne věta o člověku.
  ⚠️ **Gebo se ale u Isy nespojilo** — „Gebo stands half-finished: the giving has gone one way…
  where it was given". KUKY: *„to je právě to, co je Gebo — je to giving, a tak to Rúnar bude říkat,
  dokud nedostane jiné slovo, skrze které by mohl mluvit."* U Perth to fungovalo, protože Gebo prošlo
  jako **předávání** (handing-over), ne jako slovo „giving".
  ⇒ **Otevřená otázka ownera: jak se má životní runa projevovat** → testovat různé formulace vztahu
  (test 2026-09-12 níž v eval logu).
  ✅ **Změřeno 2026-09-12 — 7 formulací × Isa, Perth:** čistá u obou je jen **„What passes between me and
  this place?"** (bez jmen run). Pojmenovat „mou životní runu" → tvrzení o člověku 2/2 · „vztah mezi X
  a Gebo" → slovník 8 · „obohať" → druhá postava 2/2 · „moje chůze" → tvrzení i zavření 2/2.
  ⭐ **Životní runa může žít V OTÁZCE, ne v odpovědi** (tvaruje otázku, tažená runa tvaruje odpověď).
  ⚠️ Kolize s produkcí: `_askLifeContext` „Do not bring it up on your own". → `RUNAR_EVAL_LOG.md` 2026-09-12.
  ⚠️ **KUKY 2026-09-12:** *„nechat otázku na uživateli je záludné, jelikož potřebuje vědět, jak se zeptat.
  Uvidíme, kam nás to posune."*
  ⚠️ **Otevřené:** co když uživatel napíše scénu, která s runou nesedí (Isa × „běžím")? · nese se
  něco z ramene 1 do ramene 2, když scény píše člověk nezávisle? · kolik lidí vůbec scénu napíše,
  když prázdné pole nic nenabízí (proto existují tipy)?

- [ ] **MOŽNOST: obraz životní runy jako střed Vegvísiru — a možná obráceně** (KUKY 2026-09-11: „zapiš to jako možnost, zkusíme a uvidíme"; *„hledáme teorie, je to na hovno bez praxe"*). NErozhodnuto, obě varianty otevřené:
  - **(a) Střed = obraz životní runy.** Zakládající obraz, do kterého vstupuje runa ramene.
  - **(b) OTOČENĚ: střed = runa ramene**, do které vstupuje životní runa. Owner 2026-09-11: *„je možné, že to nakonec otočíme."* Rozhodne zkouška, ne úvaha.

  ⭐ **Mechanický argument, proč vůbec fixní obraz** (ověřeno v kódu 2026-09-11): dnes dostane životní runa **nový obraz pokaždé, když se o ní mluví**. Doloženo na ownerově vlastní dvojici — v čtení životní runy je Gebo *„two arms reaching from opposite ends and meeting in the middle"*, v Ask odpovědi *„the loaf shared once it has risen"*. Obojí dobré, ale **není to týž obraz**. Přes osm ramen by tedy bylo osm různých Geb. Teprve jeden pevný obraz dělá střed, který drží celou cestu.

  ⚠️ **Není to mezera v kódu — je to změna záměru** (upřesnil KUKY 2026-09-11: *„prompt ho nedostává proto, že je to čtení life rune; není potřeba mít v promptu čtení life rune. To se změnilo tím, že chci použít obraz."*). Stav dnes: `user_profiles.life_rune_text` (**1466 znaků**, jeden na uživatele, neměnný — DB trigger `trg_life_rune_immutable`, proxy vrací 409 na druhý pokus) se načítá do klienta (`v2/runar-app.js:88` → `_lifeRuneText`) a **zobrazuje**; do žádného promptu nejde. `_askLifeContext` předává jen **jméno** runy plus *„Do not bring it up on your own."* To je pro běžné čtení správně; Vegvísir chce něco jiného.

  ⚠️ **Objem ředí — do promptu patří JEDNA věta, ne celý text.** Doloženo 2026-09-09 (nález KLÍČE): když model dostal plný seznam klíčových slov runy navíc, meaning-trace ve čtení spadlo ze **17 % na 0 %**. Zakládající obraz má tedy jít jako **jedna vytažená materiálová věta** — týž recept, co vyšel 4/4 (řetěz v2) a 6/6 (TEST 31).

  **K otestování (nic z toho není rozhodnuté):** která z variant (a)/(b) dá scénu a ne šev · jestli jedna věta stačí, nebo je potřeba víc · co dělá osm ramen se stále týmž středem (riziko jednotvárnosti — u životní runy jako pouhé závěrečné čočky bylo dávání/výměna v ~7 ze 13 čtení, měřeno 2026-09-11).

- [ ] **PŘIPRAVENO K PUŠTĚNÍ: čtení + Ask „jaký efekt má moje životní runa na tuhle runu"** (KUKY 2026-09-12, odloženo na příští session — „ty čtení uděláme, až se resetuje"). Nic se nemusí skládat znovu, setup je celý tady.

  ⚠️ **NEJDŘÍV ROZHODNOUT — na tom visí VŠECHNY Asky.** Odpověď na „jaký efekt má životní runa" je úplně jiná podle toho, čím životní runa je. Psát Asky předtím = psát je dvakrát.
  **Ownerova otázka 2026-09-12:** *„ta asi nebude cesta. Mělo by to spíš být něco jako charakter člověka, jeho definice v runě?"*
  **Návrh CODE-read (NEratifikováno):** není to poloha na cestě ✅ (owner má pravdu), ale „definice člověka" je přesně tvar, který zakazuje `RUNAR_DESIGN.md:720` („nikdy verdikt ani souhrn ‚tohle jsi'"). ⭐ Obojí drží: **životní runa není CO jsi, ale JAK JDEŠ** — charakter jako **chůze**, způsob pohybu, který zůstává stejný, ať je terén jakýkoli (Gebo nejde do kopce jinak než dáváním a braním; Isa přečkává; Raidho drží tempo). ⭐ Tím se vysvětluje, proč se do sedmi os nevešla: **osy popisují cestu, životní runa popisuje toho, kdo jde.** Není na mapě — je to ten, kdo ji čte. Pro Ask z toho plyne otázka: ne „co Gebo znamená", ale **„jak se tenhle úsek chodí mou chůzí"**.

  **SADA — 7 run, po jedné na každou osu. BEZ OBRAZU, jen ukotvení** (KUKY 2026-09-12: *„ale já to nechci s obrazem, já to chci bez obrazu s ukotvením"*). ⚠️ Do promptu tedy NEJDE nic z `RUNE_IMAGES` — jediný vstup je runa + její osa. Důvod: v dnešní zkoušce byly bezobrazové verze *„o cestě"* a nesly se z ramene na rameno, kdežto nábytkový obraz (káva, klíče) se musí postavit v každém čtení znovu → `RUNAR_DESIGN.md`, „Co je OBRAZ — a dva jeho druhy".
  ⚠️ **Gebo v sadě NENÍ schválně** — je to ownerova životní runa a `_lifeWasDrawn` by čočku shodil.

  | osa | runa | ukotvení = JEDINÝ vstup do promptu |
  |---|---|---|
  | ① poloha | **Raidho** | jdu, a v jakém tempu |
  | ② terén | **Hagalaz** | počasí, které cestu přepíše |
  | ③ viditelnost | **Perth** | něco je zakryté a ještě se neukázalo |
  | ④ co nesu | **Fehu** | zásoby, které se cestou spotřebovávají |
  | ⑤ kdo jde se mnou | **Ehwaz** | ten, kdo mě nese, a důvěra v něj |
  | ⑥ co roste pod cestou | **Berkana** | něco začalo a roste, ať jdu kamkoli |
  | ⑦ cesta ještě není | **Blank** | nikdo tudy ještě nešel |

  **POSTUP:** ke každé runě (a) čtení ramene z ukotvení, (b) Ask s otázkou **„how does my life rune Gebo affect this rune?"** — znění doslova to nasazené (`ask_hint_life`), ať jde srovnat s produkcí. Čtení píše CODE v konverzaci (memory `cteni-generuj-tady-ne-pres-api`), slepé souzení subagentem.
  **CO MĚŘIT:** umísťuje rameno člověka na cestě? · **zůstane text na cestě, nebo si přitáhne nábytek** (bez dodaného obrazu mu nic nebrání vymyslet si hrnek — Gebo-C 2026-09-12 si vyrobilo stopy v zemi, což je cestovní; nábytek by byl regres) · zavírá, nebo dává **tvar bez obsahu** (třetí stav → `RUNAR_EVAL_LOG.md` 2026-09-12) · a v Asku to hlavní: **chodí životní runa jako CHŮZE, nebo se z ní stane druhý význam vedle prvního?**

- [ ] **GPT rešerše Vegvísiru (2026-09-11) — co z ní bere §23 a co ne.** Zapsáno na pokyn ownera.

  🔒 **Doložitelné:** Vegvísir je islandský **galdrastafur**, ne runa a ne kompas. `vegur` (cesta) + `vísir` (ten, kdo ukazuje). Nejstarší známý doklad = rukopis **Huld, ÍB 383 4to**, sestavil **Geir Vigfússon, Akureyri 1860**. Text říká, že kdo znak nese, **neztratí se v bouři ani špatném počasí, ani když cestu nezná**. NENÍ doložen z vikingského období, na runových kamenech, v Eddách ani v ságách — „Viking compass" je moderní omyl. (Sedí na naši kotvu `RUNAR_DESIGN.md:735`, „roste z Huldova zápisu".)

  ⭐ **Jádro, které z toho plyne — a je silnější, než jak to máme zapsané:** historický význam NENÍ „ukáže ti správný směr", ale **„neztratíš se, i když směr neznáš"**. Vegvísir je tedy symbol **orientace ve chvíli, kdy orientace selhává** — ne znalosti cíle.

  📜 **NENÍ doložené, je to naše konstrukce poučená populárním užíváním** (GPT sám přiznává, že reprezentativní průzkum neexistuje; zdroje = blogy tetovacích studií a turistické weby): čtyři „moderní významy" (najít cestu · neztratit sebe · překonat těžké období · skutečná fyzická cesta). Smí se z toho čerpat, NESMÍ se to psát jako doložený fakt. ⚠️ Detail o Björk (tetování 1982) se do docí NEDÁVÁ — nulová designová váha, zdroj hobby web, a takové faktoidy se pak opakují jako pravda.

  ⭐ **Jediná OPRAVDU nová věc a stojí za to: pozitivní KRITÉRIUM.** *„Každé rameno musí lokalizovat člověka na cestě."* Dosud máme jen zákazy (nezavírej výklad, nepojmenuj krok) — a zákaz se dá splnit prázdnotou. Tohle je test, který se dá pustit na vygenerovaný text: **říká to, kde na cestě člověk stojí?**

  ⚠️ **Tři jeho hlavní závěry už ratifikované MÁME** — a to je hodnota sama o sobě (nezávislé potvrzení zvenčí): „nesděluje kam jít, pomáhá rozpoznat kde stojíš" = `RUNAR_DESIGN.md:697` · „osm ramen ≠ osm etap" = `:783` · tři vrstvy historie/symbolika/naše konstrukce = §23.

  ❌ **Jeho jedinou RADU nepřebírat: „nejdřív pevný Vegvísir semantic core, teprve pak runy."** (a) Ten core už existuje — `RUNAR_DESIGN.md:677–790`; nový doc s definicemi cesty/polohy/směru/návratu je **druhá kopie** (§20) a rozejde se. (b) Dnešní postup šel opačně: největší posun přinesl **produkční nález ownera** (aspekt → `focus:`), ne definice. KUKY: *„hledáme teorie, je to na hovno bez praxe."*

- [ ] **OTEVŘENÉ: čím runa přispívá k cestě, když nemá polohu** (CODE-read našel díru 2026-09-11, owner ji přerámoval — k otestování).
  Kritérium „rameno lokalizuje člověka na cestě" naráží na to, že **rameno pojmenuje runa, která padne** — a spousta run polohu nemá. Isa ano (stojím), Raidho ano (jdu), Eihwaz ano (drží mě). **Gebo, Berkana, Wunjo ne.**
  ⚠️ Riziko, kdyby se do polohy tlačily: **tichý posun významu** — změřeno 2026-09-11 na Sowilo, které se skrytou vrstvou přestalo být Sowilo a začalo být Perth.
  ⭐ **Ownerovo přerámování (2026-09-11):** *„budou mít jinou symboliku — růst, spojení. Když si je takhle ukotvíme, mohlo by nám to pomoct."* Tedy: ne každá runa nese POLOHU; nese jinou **osu cesty**. A sedí to na Huld — ten mluví o **bouři a špatném počasí**, tedy o terénu a viditelnosti, ne o poloze.
  **NÁVRH MAPY (CODE-read 2026-09-12, owner viděl, NEratifikováno).** Osy nevymyšlené — vyjdou z Huldu (*„neztratí se v BOUŘI ani ŠPATNÉM POČASÍ, ani když CESTU NEZNÁ"* = počasí, terén, poloha) plus co poutník nese a s kým jde:
  - **① POLOHA** (kde stojím, jak se hýbu): Raidho · Isa · Dagaz · Jera · Othila
  - **② TERÉN** (co je pod nohama, co stojí v cestě): Hagalaz · Thurisaz · Nauthiz · Laguz · Eihwaz · Uruz
  - **③ VIDITELNOST** (jak daleko dohlédnu): Sowilo · Kenaz · Perth · Ansuz
  - **④ CO NESU**: Fehu · Algiz · Tiwaz
  - **⑤ KDO JDE SE MNOU** (ownerovo „spojení"): Gebo · Ehwaz · Mannaz · Wunjo
  - **⑥ CO ROSTE POD CESTOU** (ownerovo „růst"): Berkana · Ingwaz
  - **⑦ CESTA JEŠTĚ NENÍ**: Blank — sám, a je to správně: kanonicky to není runa (prázdný kámen, Ódin, prázdnota). ⚠️ Owner opravil moje původní zařazení do ③: **dva ze tří Blankových obrazů nejsou o viditelnosti** (*„New snow lies over the track and no one has stepped in it yet"* · *„The line runs down into dark water and nothing has touched it yet"*) — nejde o to, že cestu nevidím, ale že žádná není.
  ⚠️ **Nejistá místa, přiznaná:** **Wunjo** v ⑤ drží přes „belonging", ale „joy/harmony" je spíš *jak se jde* než kde/s kým · **Ehwaz** sedí na ⑤ i na ① · **Jera** je spíš čas než místo · **Tiwaz** je z celé pětadvacítky nejdál od cesty.
  ✅ **Otestováno 2026-09-12 na třech runách bez polohy: ukotvení na osu funguje** (A 3/3 umístilo, B 0/3) — a odhalilo, že umístění tlačí k verdiktu. Detail → `RUNAR_EVAL_LOG.md` 2026-09-12.

  **K vyrobení:** mapa všech 25 run → která osa cesty. **K otestování:** jde z runy bez polohy udělat rameno, které přesto lokalizuje?

- [ ] **NABÍDKA OTÁZKY PODLE ASPEKTU OBRAZU — a co k tomu dnes máme** (KUKY 2026-09-11: „jsme schopni nabídnout potenciální otázku přímo z generovaného čtení?"). Platí **primárně pro běžný Ask** — `_askHints()` je Ask; Vegvísir to zdědí, nestaví se to zvlášť.

  ✅ **Materiál existuje: sloupec ASPEKT v `RUNE_IMAGES` (index 5)** — 108/108 naplněno, **64 různých hodnot, per OBRAZ, ne per runa.** Táž runa dá jiný aspekt podle toho, který obraz padl: Perth *„A letter lies unopened…"* → `hidden things`, Perth *„The river rolls the pebble…"* → `fate in the making`; Isa hodiny → `waiting`, Isa sněžení → `stillness`. To je ta „skrytá metafora" — čím to čtení doopravdy je, a ve čtení to nikdy nezazní.
  ❌ **`MOTIV` (index 6) to NENÍ** — je to trojhodnotový registr `D`/`E`/`P`, ne význam.

  ⚠️ **Past, a je zapsaná v kódu tím, kdo `_askHints()` stavěl:** *„klik na hotovou větu ukotví čtení **+2,7 b.**, vlastními slovy **+8,8 b.** (2026-08-16) … tip, do kterého je už dosazené jméno runy z tohohle čtení, je z poloviny otázka toho člověka a ten rozdíl stírá."* Otázka **vygenerovaná ze čtení** je přesně tenhle případ.
  ⭐ **Rozdíl, který past obchází: VYBRAT tip podle aspektu ≠ NAPLNIT tip ze čtení.** `hidden things` → nabídne se „What is here that has not opened yet?" — z textu ani slovo, jen správný směr. Je to **už zavedený vzor**: `_askHints()` takhle vybírá jeden ze čtyř tipů podle `seeking` (`_seekIdx`). Aspekt už je navíc spočítaný a leží v `_imgAspektEN` (`runar-character.js:673`) — ⚠️ ale je to **modulová proměnná přepisovaná dalším čtením**; jestli je v okamžiku Asku spolehlivá, ať posoudí CODE-tune.

  ⭐ **Druhá cesta, kterou lidé už dělají sami: ťuknout na větu čtení.** V produkčním korpusu **7 ze 43** otázek byla citace vlastního čtení + „What do you mean?" (*„The road was never yours alone to walk. What do you mean?"*). Volba věty je pak **jejich** — ukotvení zůstává. Mechanika na ťukání v textu existuje (`.rseg` segmenty per runa, `runar-rune-popup.js`).


- [ ] **PODEZŘENÍ (neověřené): islandské JMÉNO runy může v promptu odporovat aspektu.**
  V islandském promptu stojí jméno runy i aspekt v TÉŽE řádce: `DREGNA RÚNA: Perþ (Duldir hlutir)
  — áhersla: hið hulda sem kemur í ljós`. Jméno nese starou statickou věc („Duldir hlutir"),
  aspekt nový děj. Anglicky ten spor není — `Perth` je holé jméno bez glosy.
  **Proč to tu leží místo opravy:** změřeno 2026-09-11, že samotné SLOVO aspektu čtením skoro
  nehne (dopisové rameno 1 ze 6), takže u glosy ve jméně to bude tím spíš nulové — a jméno runy
  je vidět po celé appce. Opravovat neměřenou věc s viditelným dopadem = horší než to nechat.
  **Kdy to vytáhnout:** kdyby se u NĚKTERÉ runy potvrdilo, že islandské čtení drží starou stránku
  runy proti novému aspektu. Pak se měří tohle: `is_n` glosa vs aspekt, stejným A/B jako Perth.
  Týká se všech run — každá má v `is_n` závorku (`Isa (Kyrrstaða)`, `Tiwaz (Hermannsandinn)`…).


- [ ] **~~SPOR K ROZSOUZENÍ~~ (vyřešeno výš 2026-09-12): Cowork tvrdí, že `RUNES[].k` má změny, které ratifikované rozhodnutí ZAKAZUJE.**
  Cowork-tune v odpovědi 2026-09-12 píše „⚠ RECONCILIACE s dřívějšími ratifikovanými opravami k
  (owner 2026-09-10)" a vyjmenovává: Laguz +memory/dreams · Thurisaz +disruptive force ·
  Uruz −transformation · Mannaz −memory · Eihwaz +world-tree/protection · Othila +foundation/belonging.
  **Ověřeno v repu 2026-09-12: takový záznam neexistuje.** Datované rozhodnutí z toho dne říká
  pravý opak — `RUNAR_DECISIONS.md` 2026-09-10 („Jednoslovný slovník 119 PŘIJAT jako autorská
  pomůcka"): *„Nenasazuje se do kódu — `RUNES[].k` zůstává nedotčené; slovník je podklad pro psaní
  obrazů."*
  ⇒ **Neprovedeno** (§20: při sporu vyhrává nejnovější datovaný záznam). Buď to owner rozhodl
  v chatu a nikdo to nezapsal, nebo si to Cowork plete se slovníkem 119. Rozsoudí owner; do té
  doby se `k` nesahá. ⚠️ Kdyby se ty změny přijaly, musí s nimi přijít i protějšky do `k_is` —
  hlídá to smoke ㉤ (stejný počet položek, strop 0).

- [ ] **OBSAH (owner/Cowork): Perthův DOPISOVÝ obraz zůstal statický — a stížnost byla právě z něj.**
  Oprava aspektu na děj (2026-09-11) otočila lagunový obraz, **dopisový ne** — a produkční čtení, které owner označil za špatné (*„Perth, the thing whose meaning waits sealed until you break the fold"*), pochází z dopisu. Po opravě zní pořád *„Perth is the keeping of what has not yet been read."*
  ⭐ **Měření řeklo, kde je páka: v OBRAZE, ne ve slově aspektu** — u dopisu se měnil jen aspekt a čtení se nehnulo (1 ze 6), u laguny se měnil obraz a otočilo se (5 ze 6). Čísla, uspořádání a hranice nálezu → `RUNAR_EVAL_LOG.md` 2026-09-11.
  ⇒ Přepisovat u dopisu aspekt nemá smysl; chce to **jiný obraz, kde se něco DĚJE** (nebo dopis v ději — otevírání, doručení, vítr ve dveřích). Znění je obsah, CODE ho nepíše.

- [ ] **IS: 7 aspektů obrazu je SYNONYMUM, ne táž položka v `k_is`** (našlo měření 2026-09-11 při Perth opravě — rozhoduje owner/Cowork, které slovo je Rúnarovo).
  Aspekt i klíč runy končí v TÉŽE řádce promptu (`áhersla: <aspekt> · Heimur: …`), takže model dostane dvě slova pro touž stránku runy. **V angličtině to sedí 108 ze 108** — tak se pool stavěl. Islandsky se rozešlo sedm řádků:
  Uruz `frumkraftur` × `hráur kraftur` · Ansuz `andardráttur` (2×) × `rödd` · Nauthiz `þörf` (2×) × `nauðsyn` · Jera `umbun` × `uppskera` · Mannaz `hugur` × `sjálfið, mannleg vitund`.
  ⚠️ **Není to chyba tvaru** (ty dvě, co jimi byly, jsou opravené: `innri ljós` → `innra ljós` v obraze i v klíči) — jsou to synonyma, a vybrat z nich je obsahové rozhodnutí. Do té doby to drží smoke ㉤ se stropem 7: osmý rozchod = červená.




- [ ] **SMĚR: statický střed × dynamická ramena** (GPT přes ownera 2026-09-11 — ZAZNAMENÁNO jako směr, NErozhodnuto; Vegvísir se bude měnit až do produkce, a odkloníme-li se, tenhle záznam zůstává).
  **STATIC:** životní runa + její počáteční obraz + základní kontext. Není to první odpověď Vegvísiru — je to **počáteční orientace mapy**.
  **DYNAMIC:** každé rameno = nová runa + její obraz + **vztah k životní runě** (a případně k tomu, co na mapě už je).
  Rúnar tedy **nevykládá runu ramene izolovaně** — obraz už existuje; jeho úkol je ukázat, co se stane, když se nový obraz položí vedle počátečního. *„Vegvísir neukazuje význam jednotlivých ramen. Ukazuje vztahy, které mezi nimi vznikají."*
  Prompt dostane jen `LIFE RUNE` · `LIFE RUNE IMAGE` · `ARM RUNE` · `ARM IMAGE` a pokyn **„najdi vztah mezi těmito dvěma obrazy, nevykládej je jednotlivě"** — vzor vztahu se NEpředepisuje (jeden vzor v promptu = model ho opíše).
  **Ask ve Vegvísiru je pak jiný než běžný Ask:** ne „co znamená Jera", ale „co se děje mezi mojí Gebo a Jera".
  **Přerámování 9 nocí:** ne „jedna runa za 9 nocí", ale **„9 nocí je doba, po kterou první obraz zůstává s člověkem, než k němu přibude další"** — čas přestává být UX omezení a stává se součástí mechanismu vzniku vztahu.
  ⚠️ **Nemaximalizovat:** rameno NEMUSÍ komentovat všechny předchozí runy — hledá se relevantní vztah, ne počet použitých prvků (táž lekce jako u palety a jako protiváha u neseného materiálu: malá a povinná, ne objemná).
  ✅ **Ověřeno v kódu (CODE-read 2026-09-11):** ownerova kotva platí — `_askBuild` (`v2/runar-reading.js:579`) posílá do `buildAskPrompt` **celý vygenerovaný text čtení**, ne jména run. Ask tedy opravdu pracuje s hotovou stavbou a vztahy uvnitř ní. Prompt navíc říká „Answer ONLY within this reading", takže Ask nový obraz tvořit nemusí — má ho. ⚠️ *Věta „Answer ONLY within this reading" z Asku odebrána 2026-09-23 (DECISIONS (13)) — celý text čtení Ask dostává dál.*
  ⚠️ **Sráží se to s ratifikovaným `RUNAR_DESIGN.md:720`** (*„Životní runa NENÍ startovní kotva, přerozhodnuto 2026-08-23 — nanejvýš nit nebo callback, nikdy verdikt ani souhrn ‚tohle jsi'"*). Rozdíl je ale jemný a stojí za rozlišení: **obraz životní runy** jako orientace mapy tomu neodporuje; **text čtení životní runy** ano — ten je svým tvarem souhrn („This is the ground you were set upon", „To you it comes as easily as breathing"). Kdo tenhle směr povede dál, musí říct, které z těch dvou bere. Rozhodnutí = owner (§21: směr, ne zámek).

- [ ] **Rameno = JEDNO čtení. V devíti nocích ramene DVA Asky** (KUKY 2026-09-08).
  Kadence jednoho ramene: **den 0 čtení · první Ask NE DŘÍV než po 3 dnech · druhý NE DŘÍV než po 6 · nové rameno po 9.** (Upřesnil KUKY @D@: jsou to **podlahy, ne termíny** — stejně jako devět nocí. Dřívější zápis „den 3 / den 6" četl jako rozvrh, což je přesně to, čemu se design vyhýbá.)
  Ramena tedy zůstávají na ratifikovaných **9 nocích**; „každý 3. den" je okno pro Ask, ne kadence
  ramen. Celkem: 8 ramen × 9 nocí = min. **72 nocí** · 8 × 2 = **16 Asků na jednu pouť**.
  Porozumění se neodehrává uvnitř textu ramene, ale **mezi rameny**.

  ⚠️ **Rámování — KUKY 2026-09-08: „Vegvísir není spread, není to typické čtení; můžeme si pro
  něj udělat, co chceme."** Existující mechanika Ask (níž) proto NENÍ omezení Vegvísiru. Je to
  soupis toho, **co se dá znovu použít a co ne**, protože Vegvísir má ratifikovaně **vlastní
  režim** (RUNAR_DESIGN.md, „Tvrdé rámce"). Nic z toho neblokuje — jen to není hotové.
  - ✅ **Použitelné rovnou:** prompt `buildAskPrompt` + `RP_ASK` (90 slov od v4.15-ask90) ·
    ukládání otázky i odpovědi do `follow_up` na řádek toho ramene · proxy cesta `mode:'ask'`.
  - 🔧 **Musí se dostavět** (dnešní čtecí tok to neumí, protože to nikdy nepotřeboval):
    dosah na **starší** čtení — `_lastReadingId` (`v2/runar-reading.js:484`) žije jen v té
    page-session, kde čtení vzniklo, a `v2/runar-journal.js` neobsahuje slovo „ask" ani jednou,
    takže z deníku do Ask dnes vstup nevede. Vegvísirové Asky jsou ale **odložené** (den 3, den 6),
    takže tenhle dosah je pro ně první věc k postavení. Plus **druhý Ask** na totéž rameno
    (klient `_askUsed` `:539`/`:581` pustí jeden).
  ⚠️ **Jediné SKUTEČNÉ omezení, které přebírá i vlastní režim** (§26 — vada, kterou nová cesta
  nesmí zavléct): `legitAsk` (`supabase/functions/claude-proxy/index.ts:531`) dává výjimku
  z měsíčního stropu jen na první Ask, a komentář u něj říká proč — jinak by `mode:'ask'`
  na obyčejném čtení **obcházel strop navždy**. Vegvísir tedy nechce zvednout číslo na 2
  globálně, ale **ohraničenou výjimku vázanou na rameno Vegvísiru, stropovanou na dvě.**
  Tohle platí bez ohledu na to, jak si vlastní režim postavíme — je to peněžní díra, ne konvence.

  · **Ratifikováno ownerem 2026-09-08:** `follow_up` se do žádného promptu nevrací, takže tahle
    vrstva pomůže pochopit JEDNO rameno, ale to pochopení se do dalšího ramene nepřenese —
    naráží to na týž limit jako nesený materiál (viz níž).

- [ ] ⛔ **TVRDÝ LIMIT: nesený materiál mezi rameny nemá v produkci ŽÁDNOU cestu** (CODE-read 2026-09-08, ověřeno v kódu; KUKY: „tohle může být důležité").
  Jádro Vegvísiru — obraz z ramene N vstupuje do vztahu s tím, co člověk už prošel — vyžaduje, aby se předchozí čtení dostalo do promptu toho následujícího. **Nic v kódu to nedělá.**
  - `follow_up` to dokazuje nejsilněji: i **Ask**, který visí PŘÍMO na svém čtení, se do žádného promptu nevrací — čte se jen kvůli meteringu (`claude-proxy` `legitAsk`, :531) a do shrine prohlížeče.
  - Ask je navíc **jedna výměna na čtení** (`RP_ASK` „ONE follow-up question" + cap na jeden ask zdarma), takže víc-tahová mašinerie v appce **neexistuje vůbec**. Vegvísir by byl první.
  - Jediný existující injekční scaffold je `buildSessionContext` / `buildTreeContext` / `buildVoiceContext` za `ENABLE_DYNAMIC_CONTEXT` (`supabase/functions/claude-proxy/index.ts:47`) — **a je vypnutý.**

  **Proč je vypnutý — §26 krok 2, konkrétní vada** (důvod stojí u kódu, `:41–46`): audit kvality čtení 2026-07-04 zjistil, že ty vrstvy naskládají na placené čtení **~8 protichůdných tónových direktiv** (např. „come as fire" z kalendářní rotace proti zimnímu sezónnímu obrazu; voice-scale „pure metaphor" proti základnímu „one image, direct") a **rozbíjejí tím islandskou soudržnost** — tedy primární jazyk (§2). Podmínka návratu je v kódu napsaná: *„až každou vrstvu řídí skutečné UI a ověří ji IS eval."*

  **Co to znamená:** Vegvísir potřebuje přesně tu cestu, která byla zavřená. Návrat tedy musí být **očištěný** (§26 krok 3), ne oživená kopie. Vada, která se musí prokazatelně nevyskytovat, se jmenuje **hromadění direktiv**.

  ⭐ **Recept, který vyšel 4/4, tu vadu nemá** — a to je hlavní důvod, proč tenhle limit zapisovat teď, ne až se na něj narazí. Nesené = **jedna malá konkrétní POVINNÁ věc bez únikové klauzule** (materiál, textura, teplota, pohyb — ne tón, ne pokyn); v promptu je to **fakt, ne direktiva**, takže na sebe nemůže naskládat protiklad. Měření → `RUNAR_EVAL_LOG.md` (řetěz v2; v1 s nepovinnou historií dal 0/6). Tím je podmínka §26 splněná dřív, než se o návratu vůbec rozhodne.
  - **Cache tomu nebrání:** per-user obsah patří **za** cachovaný base blok (`systemParts[1]`, `claude-proxy:669`); cache se ruší jen vlepením DO `baseSystem` nebo před něj. Účinek je měřitelný — proxy loguje `cache_read_input_tokens` (:771).
  - ⚠️ **Zbylá vada receptu, neuzavřená:** 1/4 nesených přišlo jako **přirovnání** (zakázané), a nesený materiál **slábne** k třetímu ramenu — což koliduje s ratifikovaným „osmé rameno se ohlíží na první". Cowork-read k tomu navrhl **dva kanály** (kotálivá ozvěna N↔N−1 slábnout SMÍ; rámový návrat 1→8 potřebuje semínko držené stranou a vpuštěné až v rameni 8) — neotestováno.

  ⚠️ **Teď se nedělá** (KUKY: „zapíšeme až budeme dělat vegvísir"). Tohle je zápis LIMITU, aby se na něj nenarazilo pozdě — ne úkol k realizaci.

- [ ] **Vegvísir jako ČTENÍ.** KUKY 2026-08-22: *„chci udělat vegvísir jako čtení… normálně to
  čtení není, ale chci to tak udělat."* Hledá se způsob, jak to bude fungovat; podklady dodá owner.
  Osmiramenná seriálová verze (jedno rameno týdně, ~2 měsíce) je **zatím jen návrh**, ne rozhodnutí.

**Ověřeno CODE-read 2026-08-22 — fakta, ať je nikdo neověřuje potřetí:**
- ⚠️ **„Malá verze" (kořen/stín/cesta, 3 pozice) nikdy nebyla v configu** — základ, na kterém
  osmiramenná verze staví, je stejně nepostavený jako ona.

**Otevřené pro ownera:** cena/gating oblouku (jedna platba, nebo osm?) · pořadí odhalování ramen ·
zobrazuje se uživateli směrový label? · **a nadřazeně: Vegvísir jako symbol vůbec** — novověký
galdrastafur (Huld 1860), zároveň nejkomercializovanější islandský symbol; rozhodnutí o značce,
ne technické.

⚠️ **Kánonové riziko, které si návrh nepojmenoval:** symbol, jehož celý účel je *„ukázat cestu,
neztratit se"*, stojí proti pravidlu *„Rúnar nikdy neřekne krok, jen tvar"*. To je přesně třída,
kde jsme naměřili úniky **i s aktivními mantinely** (landvættir 2/4 → „jsi chráněn",
`RUNAR_EVAL_LOG.md` 2026-08-19). Doklad rovnou z návrhu: Cowork sám při psaní mockupu ujel
**dvakrát** (přes „already" a přes „risk" framing) — a ty mockupy nejsou model output, jsou psané
rukou, takže o skutečném znění zatím nevíme nic.


---


### ⟵ Testy „recept: obrazy se potkávají" — K OTESTOVÁNÍ (Cowork 2026-08-23, ověřil CODE-read)

Generování = CODE · hodnocení = Cowork · **zaslepení = CODE** (promíchat pořadí, sundat štítky ramen;
bez toho není slepé skórování slepé).

- [ ] **TEST POHYBLIVÉ POUTI** (2026-08-25, KUKY handoff): 4 ramena pohyblivá (domov→dvůr→
  stezka→soutěska) vs 4 ramena statická (dnešní mechanika); nucená volba: drží nit? je vidět
  pohyb? proměňuje se materiál? nerozpadlo se to na 4 singly? ⚠️ CODE-tune výhrady k vyřešení:
  (a) **pevné pořadí krajin = poziční sémantika zadními vrátky** (když je rameno 4 vždy
  soutěska, je to „R4 = zkouška", což handoff sám zakazuje) → krajina se musí losovat/vést
  runami, ne být pevná dramaturgie; (b) **odkud se bere další místo** — dnešních 24 míst je
  klíčováno životní runou (= domovy); pokud by místo bylo „místo tažené runy", splyne místo
  s runou a zmizí návštěvnická tenze (TEST 37 logika) → krajinný zásobník = NOVÁ data (Cowork);
  (c) edge: životní runa v sáčku?
- [ ] **„Jsi jinde než na začátku?" — otevřená otázka pro DELŠÍ běhy** (GPT 2026-08-25,
  ⚠️ VĚDOMĚ MIMO rubriku, aby se vývoj nevynucoval): po posledním rameni se slepě zeptat
  *„máš pocit, že jsi jinde než na začátku, a proč?"* — odpověď smí být fyzicky · vnitřně ·
  vztahově · významově · vůbec ne. Pozorování, ne kritérium; zajímavé je ROZDĚLENÍ odpovědí
  napříč poutěmi, ne jednotlivý verdikt.
- [ ] **CARRY = paměť, nebo povinnost? (test, NE adopce)** — GPT 2026-08-25 navrhuje „Rúnar si
  pamatuje a dovolí tomu vstoupit, POKUD to přirozeně patří". ⚠️ **Proti tomu stojí tvrdé
  měření:** volitelný carry („smíš to nechat být") vzal model 6/6 a vztah nevznikl NIKDY
  (v1 řetěz 0/6). Nepřijímat bez testu. Co je nové oproti tehdejšku: dnes je tu místo, moment
  a pohyblivá krajina, které mohou nit nést strukturálně — proto je to legitimní HYPOTÉZA,
  ne opakování chyby. Test: volitelná formulace vs. v2 (povinná), absolutní rubrika
  (`docs/vegvisir-rubrika-pouti.md`), osy paměť + přirozenost + jedna cesta.
- [ ] **POZITIVNÍ UČENÍ — TEST P1 (design po proklepnutí Coworkem, 2026-08-26)** — hypotéza:
  kurátorovaný few-shot korpus zvedne kvalitu, ANIŽ zvedne kopírování. Handoff ověřen proti
  repu (CODE-tune): DEF_CHAR ř. 31 „Draw the picture and stop" ✓ · ořez promptu hotový
  (DECISIONS 154→178) ✓ · 2.os. few-shot v promptu ✓ · self-reference 24/25 (DECISIONS 2219) ✓.
  **Design:** buňky A = současný prompt · B = +korpus s příkladem TÉŽE runy · C = +korpus bez ní
  (počet příkladů konstantní). Osy: KVALITA (absolutně: obraz z věcí · definiční věta · otázka
  s volbou · přirozenost) · REPRODUKCE (4-gram překryv s korpusem + konvergence uvnitř buňky
  + slepý soudce „vyrostlo to z příkladu?").
  ⭐ **Buňka A = nulová kontrola metriky kopírování zdarma** (A příklady neviděla — vysoký
  „překryv" u A znamená, že metrika měří téma, ne kopírování; §27).
  **Rámování příkladů = skrytá páka, drží se FIXNÍ** (rámovat jako zdroj, ne direktivu —
  [[prompt-directive-makes-model-copy]]: samo rámování hýbe 12 %→56 %).
  **Seed:** začíná se 2–3 owner-potvrzenými příklady (kurátorské kritérium splněno); produkční
  single/spread rozšíření kurátoruje OWNER („tohle je přesně Rúnar"), ne soudci — CODE jen
  vytáhne kandidáty. Korpus bydlí v `memory/co-dela-cteni-silnym.md`, výsledek → DECISIONS (§20).
  **STAV 2026-08-26:** 18 čtení vygenerováno, metrika kopírování hotová a ověřená (0 překryvů,
  nulová kontrola drží). Slepé soudy KVALITY a strukturní reprodukce STOPNUTY ownerem (tokeny) —
  soubory a mapa v ~/runar-eval/p1-*.json, skript workflows/scripts/p1-soudy-wf_822d72b8-1f8.js.
  Bez nich se o výsledku nesmí tvrdit nic.
  **Rozhodnutí:** kvalita↑ v B i C ∧ copy≈A ∧ bez konvergence → teprve pak architektura.
  Kvalita↑ jen v B (same-rune) = model si bere věty, ne způsob → NEÚSPĚCH.
- [ ] **Citace pro UI — kde bydlí:** `RUNAR_DESIGN.md`, sekce „Citace a motta pro UI".
  Použít až při úpravě vzhledu a prostředí (KUKY 2026-09-06). ⚠️ Střídat, nedávat pod sebe —
  většina má tutéž figuru (popření + „ve skutečnosti dělá tohle").
- [ ] ⏸ **ODLOŽENO 2026-09-27 (owner: „měla velké mezery, ASK vypadá lépe“, DECISIONS 2026-09-27 (3))** — **ÚKOL 3 pro Cowork: MOMENTY pro 22 krajin** (2026-08-26, owner: „je v přírodě tolik
  živého" — pouti mají nerostné vstupy, protože momenty existují jen pro 24 domovů). Formát
  a kritéria jako u domovů; **živé tam, kde místo život má** (ovce/koně na móa a v dalu,
  havran nad hraunem, koliha a jespák na mýri, kajka a lundi na bjargu, silungur v hylu,
  velryba jen ve fjordu). ⚠️ Tvor zůstává, nemizí jako pointa; místo musí zůstat vidět.
- [ ] ⏸ **ODLOŽENO 2026-09-27 (DECISIONS 2026-09-27 (3))** — **KRAJINNÝ GRAF — data pro Cowork** (2026-08-25): ~20–25 uzlů (dílna·dvůr·práh·cesta·
  brod·les·rozcestí·údolí·hřeben·fjord·pobřeží·přístav…), každý s 2–4 sousedy + materiálem
  (efni) a stavovou paletou, jako u domovů. NENÍ to osm pozic. Otevřené: (a) směruje runa
  větev? — jen materiálovou sousedností, nikdy tematickou shodou (TEST 37); (b) musí graf
  umět dojít zpět domů (doslovný návrat), nebo stačí materiálový návrat semínkem (jediná
  změřená varianta)?; (c) kolik uzlů unese 8 ramen bez opakování.
- [ ] **NÁVRH PROMPTU RAMENE (draft, ne produkce)** — z architektury v1 vč. losovaného
  vstupního materiálu (owner 2026-08-25: ramena se nesmí otevírat stejně). Zbytková rizika
  hlídat: dominantní stav vs protichůdná runa (Uruz-Raidho) · stavová paleta > 6.
- [ ] **Páka „tření smí zůstat" pro spread thread** (2026-08-24): `_spreadThread` je laděný
  na navazování („takes up what the one before left off") — T2 změřil cenu (~14/20 spolknutých
  run; owner cenu přijal, jeden obraz drží). Jednořádková páka „runy smí stát i proti sobě;
  nech obrazu tření" = levný test — ⚠️ pouštět AŽ PO oblouk-watchi na v4.14 dávce (dvě páky
  naráz nejde rozplést, §27). → RUNAR_DESIGN „Vztahy mezi taženými runami".
- [ ] **T3 → SELEKTOR DOMOVA (šev): mechanismus POTVRZEN, stavba čeká na ownera** (2026-08-23:
  TEST 33 — volba obrazu posledního ramene dle semínka zavřela šev v S2 na 3/3; naivní selektor
  ale 2/3 selhal: žádný kandidát v poolu / povrchní afinita „světlo pro lagunu"). Stavět =
  (a) afinita přes MĚŘENÉ aspekty RUNE_IMAGES [4]/[5] (+ registr D/E/P), (b) fallback, když
  domov neexistuje (bez něj trade-off z TEST 32). → RUNAR_EVAL_LOG.md 2026-08-23.
  ✅ **Předpoklad ověřen (CODE-read):** aspektový sloupec je **naplněný úplně** — 82 řádků
  `RUNE_IMAGES`, **0 chybí IS, 0 chybí EN**, 49 různých EN aspektů (cattle · wealth · threshold ·
  natural rhythm · inner light…). Chybí jen pravidlo „které aspekty spolu jdou" = malý designový krok
  napřed. *(Pro pořádek: 7. sloupec MOTIV naplněný NENÍ — 76 z 82 prázdných; pro tenhle test se nepoužívá.)*
  A = náhodný obraz na runu (dnešní výběr) · B = aspekt-aware výběr.
  Skórovat slepě a párově: „patří tyhle dva obrazy do jedné scény?"
  ⚠️ **KRITICKY: B nesmí zabít kontrast.** Měřit ZVLÁŠŤ „koherentní potkání" (chceme nahoru) a
  „bland souhlas / zmizelý střet" (nechceme). Jinak si koupíme koherenci za cenu toho, co dělá
  čtení zajímavým.


- [ ] **POTENCIÁLNÍ motivický překryv: Yggdrasil Svartálfaheimr × Vegvísir Kenaz→Brokkr a Eitri**
  (Cowork 2026-08-23, ověřil a doplnil CODE-read). **Nezměřeno — a měřit to teď NELZE**, protože to
  není vada jednoho promptu, ale **průnik dvou typů čtení**: čtenář by musel potáhnout Yggdrasil
  s pozicí Svartálfaheimr *i* Vegvísir s Kenazem na rameni, kde platí dverg-vrstva. Jedna dávka to
  nezachytí; Yggdrasil je navíc řídký. Proto **záznam, ne test**.
  - Yggdrasil, RUNA 6 — Svartálfaheimr: *„the hands that shaped what the others carry"*
    ⚠️ Ten konkrétní text **v repu není** (žije v Coworkově handoffu #44); v kódu je
    `Svartalfheim — Hidden craft` / `Svartálfaheimr — Dulin list`.
  - Vegvísir, dverg pod runou: `RUNAR_DESIGN.md:368` — Kenaz → Brokkr a Eitri, *„výheň v hloubce —
    co dostane tvar jedině úderem"* ✅ ověřeno, existuje.
  - **Není to duplicita ani náhoda:** obě místa čerpají po právu z téhož zdroje (trpasličí kovářská
    tradice, katalog v `RUNAR_DESIGN.md`), každé ve svém patře.
  - ⭐ **Nález CODE-tune z TÉHOŽ dne ten předpoklad POSILUJE** (`RUNAR_DECISIONS.md` 2026-08-23,
    dodatek k v4.12): slepý soudce **neodliší Svartálfaheimr od Niðavellir** — čte „ruce, které tvoří"
    jako kovárnu bez ohledu na doostření. Když se dva trpasličí SVĚTY nesoucí týž motiv slepě
    neoddělí, je pravděpodobnost, že se v reálném čtení slije svět s **materiálem runy z jiného
    spreadu**, spíš vyšší než nižší. Cowork o tomhle měření nevěděl.
  - **Co udělat, AŽ se to projeví** (aby to nebyla jen poznámka): měnit **stranu Yggdrasilu**, ne
    Vegvísiru. Dvojice Kenaz → Brokkr a Eitri je **ověřená generováním** (drží 3/3, *„Some things take
    their shape only by being struck against"* — bez jména, bez druhého obrazu); obraz Svartálfaheimru
    je novější a jeho slepá nerozlišitelnost je už teď známá a vědomě nehoněná.


- [ ] **Yggdrasil: 5fázová scénická struktura** — GPT návrh 2026-08-23 via Cowork #46, zapsal CODE-read.
  **Opening Image** (jedna hlavní scéna z celého rozložení) → **Deepening** (další obrazy se do ní
  přirozeně přidávají) → **Tension / skrytý pohyb** (něco se v obraze začne měnit nebo odhalovat) →
  **Transformation** (obraz se pohne směrem, který udělaly runy) → **Closing Image** = *proměněná
  verze úvodního obrazu*, NE „výsledek = X".
  Nezávislé na V5; jiná logika než Vegvísirova trojice pohybů (naváže/změní/otevře — ta je designová
  kontrola, ne instrukce do promptu).
  - ⚠️ **Coworkovo „nejdřív V5, pak tohle" je už splněné** (ověřil CODE-read): **V5 je NASAZENÁ**
    (`v4.12-mynd`, commit `863a0ec`) a **změřená** (slepě EN 8/9 · IS 7/9, s jednou pojmenovanou
    inherentní záměnou). Tohle tedy může být **hned další samostatný měřený krok** — ne fronta za V5.
    Pravidlo, které z toho platí dál: **netestovat dvě proměnné najednou.**
  - ⭐ **Bezpečnější tady než u Vegvísiru, a je pro to důvod:** Yggdrasil je **jedno volání s devíti
    runami**, takže všechny obrazy jsou v promptu naráz. „Poslední obraz = proměněný první" tu tedy
    NEnaráží na rozpad neseného materiálu, který jsme naměřili u seriálového řetězu (u Vegvísiru
    materiál z prvního ramene ve třetím už nebyl → `RUNAR_EVAL_LOG.md` 2026-08-23). **Rozpad je
    problém seriálový, ne jednovoláním** — proto tenhle nápad sedí na Yggdrasil líp než na Vegvísir.
  - ⚠️ **Hlavní riziko, které handoff nepojmenoval: DVĚ STRUKTURY NARÁZ.** Devět pozic už nese
    významy světů; pětifázový oblouk je **druhá** struktura přes tutéž plochu. Dnes jsme třikrát
    naměřili, že při třech zdrojích naráz (obraz + dverg + čočka) model **jeden zdroj zahodí, nebo
    ho přišije jako přirovnání**. Tohle je táž třída přetížení. → měřit zvlášť, jestli fáze nesežerou
    významy pozic.
  - **Podklad:** živý vzorek (Gebo, #46) prý tenhle oblouk už částečně dělá sám (hřeben → pole →
    bříza → podzemí → pramen → tma → zpět ke světlu). **n = 1, pozorování, ne důkaz** — a ten text
    v repu není.

---


### ⟵ Ask nápověda: štítek oblasti vs. přirozená slova (2026-09-11, nízká priorita)
Tip na oblast dnes dosazuje **štítek z pilulky** — *„Career & Creativity — where does the image
land?"*. Jeden z ověřovatelů navrhl dosadit místo štítku **přirozené místo**, které už existuje
v `_domainContext` (*„on making and work"*, *„where two people meet"*, *„on going and direction"*),
protože štítek je slovník aplikace, ne slova toho člověka — a měřený rozdíl mezi vlastními slovy
(+8,8 b.) a výběrem z nabídky (+2,7 b., 2026-08-16) mluví pro přirozená slova.

**Proč se to zatím NEUDĚLALO** (ať se to nezkouší poslepu znovu):
1. Štítek je **přesně to, co člověk naklikal** — vidět ho zpátky je ten signál „Rúnar ví, co jsem
   zvolil", kvůli kterému tip vznikl. Přirozený opis ten signál oslabuje.
2. Znamenalo by to **8 nových frází na jazyk** (a v IS ve správném pádu), nebo vytáhnout ty fráze
   z `_domainContext` — kde jsou zapuštěné v celých větách, takže by vznikla **druhá kopie** (§20).
3. Nevíme, co je lepší. **Je to měřitelné:** dvě znění téhož tipu, sledovat, jestli lidi kliknutou
   větu dál přepisují vlastními slovy (to je ten žádoucí stav), nebo ji odešlou tak, jak je.

Rozhodnutí a celý kontext → `RUNAR_DECISIONS.md` 2026-09-11.

---


### ⟵ Nálezy adversariálního průchodu Ask (2026-09-11) — co zůstalo otevřené

Fanout po nasazení našel osm věcí; čtyři jsem opravil hned (commit `9cb5aa3`), tyhle čtyři
mají vlastní cenu a nepatří do téhož commitu.

### 1. ✅ (2026-09-26: opraveno a ve smoke ㉬) `scripts/utils/test_lever_maps.js` je TIŠE ČERVENÝ a není ve smoke
Spuštěno 2026-09-11: **exit 1, 9 problémů**, a `grep test_lever_maps smoke.py` = **0**. Nikdo to
tedy nevidí. Jeho premisa (*„každá věta svou hodnotu JMENUJE"*) padla commitem z 2026-09-08.
**Hlídal ale reálnou expozici:** přeskládání `SEEKS` pošle každému čtení cizí registr a **nic
nespadne**. Rozhodnout: opravit premisu a zařadit do smoke, nebo test retirovat s datovaným
důvodem. Tiše červený test je horší než žádný — vypadá jako pokrytí.

### 2. Oblast je u spreadů v promptu pojmenovaná DVAKRÁT
Hlavička `S.area + ': ' + u.area` (`runar-character.js` ×4 spready) **a** věta `_domainContext`.
Táž dvojitost se u `seeking` odstranila 2026-09-08 a **oblast při tom úklidu zůstala**. Mění to
výstup čtení → **samostatný commit + golden-verify** (§18.3), ne přílepek.

### 3. Tip na minulost se ptá na minulost, ale plot na životopis v Ask promptu chybí
`ask_h_when_past` (*„What in this has to do with the past?"*) pobízí k minulosti, zatímco plot
*„minulost patří OBRAZU, ne životopisu"* (`runar-character.js`, builder čtení) v Ask promptu
**není ani jednou**. `_noColdRead` hlídá vnitřní život a osud, **ne vymyšlené vnější události**.
⚠️ **NEPŘIDÁVAT poslepu** — přidané pravidlo se v textu projeví jako formule
([[oprava-promptu-odebira-vadu]]). **Napřed změřit:** dávka s tím tipem, počítat vymyšlené fakty
o životě tazatele. Když se přidávat bude, použít **doslovné znění z builderu**, ne nové.

### 4. Tři tipy přetékají jednořádkový práh na 375 px
Změřeno: `ask_h_life_all` IS **55** / EN **51** · `ask_hint_life` IS **50** · `ask_h_image_area`
EN **51** (jen u `Crossroads & Decisions`; IS max 42). Práh ~45 IS / ~50 EN je **odhad z jednoho
měření**, ne ověřený fakt — než se podle něj začne krátit, ověřit v prohlížeči na skutečném
zařízení. Do té doby to není vada, jen podezření.

### 5. `INTENTIONS.is[0]` = „Í þessari stund" (idiomaticky „Á þessari stundu")
Popisek **je v DB** a journal podle něj filtruje řetězcovou rovností → oprava potřebuje migraci,
ne přepsání konstanty. Backlog, ne rychlá oprava.

---


### ⟵ HANDOFF57, body 3 a 4 — ověřeno proti kódu 2026-09-11, čeká rozhodnutí

Body 1 a 2 jsou **hotové** (životní runa · area · intention · původní otázka · seeking).
Tyhle dva ne — a každý je jiná třída věci.

### Bod 3 — `RUNES[].k` do Ask: NENÍ to totéž co body 1–2, a proto nespadl pod ownerův princip
Ownerovo pravidlo zní *„všechno, co člověk může **vyplnit** jako dotaz"*. `RUNES[].k` **nikdo
nevyplňuje** — je to náš kánon. Spadá proto do jiné škatulky a princip ho automaticky neschvaluje.

**Ale mezera je reálná a je to táž třída jako `ask_h_asked`:** nápověda nabízí *„What does {rune}
mean in this reading?"*, a Rúnar na to odpovídá **z vlastní znalosti Elder Futhark, ne z naší
definice**. Text čtení význam nese jen nepřímo (obrazem). Přitom `co-dela-cteni-silnym` (ownerem
POTVRZENO) říká, že definiční věta runy je to, co dělá čtení silným. Takže tip existuje a jeho
podklad je slabší, než vypadá.

⚠️ **Nepřidávat naslepo — je proti tomu MĚŘENÍ.** Test „KLÍČE" (`RUNAR_EVAL_LOG.md` 2026-09-09):
plný seznam klíčových slov v promptu **ČTENÍ** srazil stopu významu ze 17 % na **0 %**. Ask je jiná
úloha (vysvětluje, negeneruje), takže přenos 1:1 by byl odhad, ne fakt — ale ignorovat to nejde.

**Návrh testu, než se to postaví:** tři podmínky — (A) dnešek · (B) `RUNES[].k` celé ·
(C) jen `formula_is` / jedna definiční věta. Otázka: *„What does {rune} mean in this reading?"*
Měřit: shoduje se odpověď s naším kánonem, a nerozpadl se přitom hlas do výčtu klíčových slov?
Hypotéza: **C vyhraje nad B** — celý seznam sveze model k výčtu, jedna věta ne.
📌 **Doklad z aplikace pro (A) dnešek:** Rúnar v Asku přináší význam runy z vlastní znalosti (Eihwaz → „the yew");
přečteno 101 ownerových Asků → `RUNAR_EVAL_LOG.md` 2026-09-12 „Odkud Rúnar v Asku bere význam runy".
Princip → `RUNAR_DESIGN.md` „Obraz nese podstatu runy".

### ~~Bod 4 — pozice ve spreadu~~ ✅ HOTOVO 2026-09-11 (`RUNAR_DECISIONS.md` 2026-09-11 (4))
`askRunar()` předává runy jako **plochý seznam jmen** (`_lastSegs.map(s => s.rune).join(', ')`).
`_lastSegs` je `[{rune, text}]` — **pozici neobsahuje**. Rúnar tedy u Kříže neví, která runa byla
v Středu a která Za zády, i když **ty pozice člověk na obrazovce VIDÍ a jsou pojmenované**
(`RP_KRIZ.positions` a spol.). Zeptá-li se *„co znamená ta runa za mnou?"*, Rúnar to neví.

→ **Tohle spadá pod ownerův princip přímo** („v Ask se může člověk zeptat na cokoli"): není to
vyplněné pole, ale je to něco, co uživatel vidí a na co se přirozeně zeptá.

**Sketch:** `_askCast()` přibere `spread` (typ) a `pozice` (pole `{pozice, runa}` z `_lastDrawn`
+ `positions` toho packu) · nový blok v `_askCastContext` je vyjmenuje · §13: platí pro **všech pět**
typů čtení, takže test musí projít single (žádné pozice) i všechny čtyři spready.
⚠️ Názvy pozic **neopisovat** — číst je z `RP_*` packů, jinak vznikne druhá kopie (§20).

---

# ☑ TO-DO OWNERA — spuštění pro testery (2026-09-11)

Odbavuj průběžně, pořadí je podle toho, co blokuje. Odškrtávej přepsáním `[ ]` na `[x]`.
Co dělá CODE, tady NENÍ — tohle je jen to, na co já nedosáhnu.


### ⟵ ~~Registr nevidí cestu ŽIVOTNÍ RUNY~~ ✅ ZAPOJENO 2026-09-11 — ale zbyly ČTYŘI SPREADY

Registr kryl **tři cesty ze sedmi** a nikdo o tom nevěděl: díra se neohlásila, protože se
neohlašovalo nic. Zapojena životní runa i rozbor jména (226 pravidel) a hlavně přibyla
**kontrola úplnosti**: každý `build*Prompt` musí být buď skenovaný, nebo mít datovanou výjimku
s důvodem. Přibude builder a nikdo ho nezapojí → červená, která ho jmenuje.

⚠️ **Zbývá dluh, vědomě:** `buildKrizPrompt` · `buildNornsPrompt` · `buildHorseshoePrompt` ·
`buildYggdrasilPrompt` registr **nekryje**. Změna jejich instrukcí projde bez povšimnutí.
Nezapojeno hned proto, že je to ~100 nových řádek a odklepnout je hromadně by z registru udělalo
razítko — má vynucovat pozornost, ne razítkovat. Dělat po jednom spreadu.


### ⟵ Dva nálezy, které vypadly z projití promptu ŽIVOTNÍ RUNY (2026-09-11)

Obojí našla ta registrace tím, že mě donutila ty řádky přečíst — což je přesně k čemu registr je.

1. **Prompt životní runy posílá PLNÝ seznam klíčů** (`CORE ENERGY: messages, wisdom, divine
   guidance, voice, breath`). Test „KLÍČE" (`RUNAR_EVAL_LOG.md` 2026-09-09) přitom naměřil, že
   plný seznam klíčů v promptu **čtení** srazil stopu významu ze 17 % na **0 %**. Životní runa je
   jiná úloha, takže přenos není automatický — ale je to tatáž páka na tomtéž místě a **nikdo ji
   tam nikdy neměřil**. Návrh: A/B se seznamem a bez něj, měřit stopu významu runy.
2. **Napětí s `_noColdRead`.** Prompt říká *„not a reading of today, but of what Anna has carried
   since birth"*, a na tomtéž promptu visí zákaz *„never tell the seeker what is true… inside
   them"*. Životní runa ze své podstaty něco tvrdí, takže to nemusí být vada — ale je to rozpor
   dvou instrukcí v jednom promptu a **rozhodnout ho má člověk**, ne model při každém čtení.


### ⟵ 2026-09-22 — Zbytky auditu banky obrazů (CODE-tune)

**⚠️ Nejdřív: `supabase functions deploy claude-proxy`** — strop Ask promptu (DECISIONS 2026-09-22 (3))
je v repu, ale neúčinný do deploye. Do té doby Ask u Yggdrasilu/Horseshoe s delším čtením vrací 400.

### 1) Pozemkové nálezy — čekají na OWNERA (obsahové rozhodnutí, ne mechanická oprava)
Obě ověřeny adversariálně (nevyvráceno), obě „vysoká", ale mění, JAK runa mluví → nejsou v rozsahu
zadání „studená čtení / dvě ohniska", které owner schválil 2026-09-21.
- **[27] Wunjo/sátt** „Sólin nær loksins inn í dalinn og allt verður kyrrt." — podmět je `sólin`,
  což je jádro Sowilo (`runar-runes.js` k_is `sól`); navíc téměř identický vlastní řádek Sowilo
  [96] „Sólin nær loks niður í dalinn…". Druhá klauze `allt verður kyrrt` leží na `kyrrstaða` (Isa).
  Návrh náhrady (IS ověřeno korpusem + grammar-qa): „Hlátur berst út um opinn gluggann og enginn
  flýtir sér inn." / *Laughter carries out through the open window and no one hurries back in.*
- **[64] Tiwaz/sannleikur** „Pólstjarnan stendur kyrr meðan allt annað snýst." — nosné sloveso
  `stendur kyrr` = `kyrrstaða` (Isa). Komentář nad [63] i `RUNAR_EVAL_LOG.md` 2026-09-09 (7) už
  doložily, že nehybnost u Tiwaz vede k záměně za Isu (soudce 5×). Návrh: obraz, kde Tiwaz KONÁ
  (situační typ, viz RUNAR_DESIGN „Typ obrazu") — k dopracování až owner řekne, že se to má řešit.

### 2) 20 nálezů BEZ VERDIKTU — ověření uťal limit, ne kvalita
Sweep našel 39 nálezů, 19 prošlo refuterem (4 přežily, všechny vyřešeny), **20 zůstalo neověřených**
a tiše vypadlo z výsledku workflow. Nejsou to potvrzené vady — jsou to **neposouzené kandidáty**:
- chlad (4 bez verdiktu): [36] Nauthiz „Þú notar peningana…", [84] Othila „Lyklarnir… í lófa þínum",
  [11] Ansuz „Í miðri útskýringu…", [37] Nauthiz „Svefninn tekur þig í miðri setningu".
  Pozn.: všechny mají „þú" ve scéně, což je povolené — proto nízká priorita, ale posoudit.
- pozemek (12 bez verdiktu): [5], [24], [25], [29], [30], [33], [34], [55], [75], [79], [89], [92].
- ohniska (1): [38] Nauthiz „Það skrapar í botninn á mjölkassanum…".
- kód (3, nízká/střední): připomínky k `runar-helper.js` a `_askBuild` — zatím nic doloženého.
Reprodukce: `Workflow({scriptPath: '…/overeni-banky-a-zapojeni-wf_82db76b7-381.js', resumeFromRunId: 'wf_82db76b7-381'})`
— hotoví agenti se vrátí z cache, doběhnou jen ti, co spadli.


### ⟵ 2026-09-23 — Tři otevřené body z auditu obrazů (KUKY: „tyhle 3 body si zapamatuj")
Podklad: `docs/archive/2026-09-23-audit-obrazu.md`. Owner je potřebuje vysvětlit bez interních štítků.
1. **Celý návrh z auditu** — přestěhovat 6 obrazů k runě, kam je slepí soudci jednomyslně čtou
   (hlavně voda → Laguz), vyřadit 7, které branou neprošly, přidat 10 nových ze statického popisu run.
   Owner zatím nerozhodl (nerozuměl odkazu „sekce 6").
2. **Chléb u Jera** — KUKY: *„klidně může zůstat, pokud Rúnar bude schopný o něm v runě mluvit lépe.
   Zatím je to slabé!"* → chléb zůstává, ale obraz musí nést Jeru (úroda, odměna za čas), ne „dost pro
   všechny" (to soudci čtou jako Fehu). Úkol: přepsat znění, změřit branou, ukázat čtení.


# RUNAR_EVAL_LOG — deník pákových změn hlasu (prompt · pooly · pravidla)

**Jedno místo pro KAŽDOU změnu, která mění, jak Rúnar mluví.** Prompt, obraznost (pooly),
gramatická pravidla, voice profil, konce, openery. Cíl: po dalších čteních jde **změřit,
jestli změna zabrala** — ne hádat. Žádný drift: co se sáhlo do hlasu, stojí TADY, ne
roztroušené po git logu a cizích sandboxech. (KUKY 2026-08-02.)

## Kontrolní mapa hlasu — co lze měnit, co ne, nad čím uvažovat (§20: jen ukazatele)
**🗺 Vizuální mapa (snapshot):** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69 — celý oblouk vrstev (system prompt · reading stack · korekce → opus-4-8 → JSON), „kde ladit nuanci" a „co je mrtvé". Pravda = kód (character.js/config/proxy); po změnách přepublikovat na stejné URL. Detail → RUNAR_DECISIONS.md 2026-10-11, mapa promptu zrušena.
✅ **Ověřeno 2026-08-07:** `runar_character` má **0 aktivních řádků** → file `DEF_CHAR` je živý hlas. Mrtvý loader (`app.js:1380`) zbývá smazat → `RUNAR_BACKLOG.md`.

⭐ **Rozhodující fakt:** model POSLECHNE **user** prompt, **system** prompt z velké části IGNORUJE.
→ Reálné páky jsou v USER promptu. Úpravy system promptu (identita, zákazy, voice profil) mají
SLABÝ účinek — proto „přepiš voice profil" většinou nehne jehlou; sáhni na user-prompt pooly.

**🔄 PÁKY (tady se hlas reálně mění — každou změnu loguj níž):**
- Obraznost: `RUNE_IMAGES` / `_seasonalImagery` (character.js) — ⚠️ `SEASON_POOLS` je **mrtvá větev**, do čtení nedojde (2026-09-08)
- Úhel otevření: `READING_ANGLES` / `_randomAngle` (utils, jen single)
- Tvar konce (dle valence): `ENDING_*` / `_endingShape` (utils, **jen single** — spready mají pevnou `S.landing`)
- Esenční řádek (co runa DĚLÁ skrz obraz): `VOICE_PROFILES.*.rules.essence` (runar-config.js:456) — ⚠️ **jeden tvar v 60/60**, viz rejstřík
- Sampling modelu: **není páka** — `temperature`/`top_p`/`top_k` na `opus-4-8` vrací HTTP 400 „deprecated for this model" (jediné, co projde, je `temperature: 1`, tedy default). Ověřeno voláním 2026-09-08
- Jméno (umístění/vynechání): `_namePlacement` (utils)
- Reading contract (čočka/doména/registr): `_lensContext`/`_domainContext`/`_registerContext`/`_priorityContext` (character.js)
- Norns čas: `_intentionContext` (character.js)
- Gates (nevysvětluj / no cold-read): `_describeRule`/`_noColdRead` (character.js, vždy on)
- Délka/počet vět: `RP_* length` (character.js) — ⚠️ = náklad na hlas (RUNAR_PRICING.md)
- Slovní/vazbové korekce: `runar_corrections` → `getCorrPrompt` (character.js)
- Voice profil `focused`: `VOICE_PROFILES` (config) — ⚠️ system prompt → SLABÁ páka
- Model: proxy `MODELS` (dnes opus-4-8; měnit = eval + cena)

**⛔ NEMĚNIT tuningem (kánon / fakt / architektura):**
- Kdo Rúnar je · osobnost · filozofie · zákazy (`never`) = 📜 kánon → RUNAR_DESIGN.md (mění rozhodnutí o kontinuitě)
- IS gramatika = 🔒 (musí být správně, ne stylová volba) — enforcement přes korekce + kontroly IS podle CLAUDE.md §2 (do 2026-10-10 tu stálo is-grammar-qa — API zaniklo, DECISIONS 2026-10-10 (39))
- Data run + význam pozic spreadů = 🔒/📜 (runar-runes.js / RUNAR_DESIGN.md)
- Struktura pipeline + JSON kontrakt = 🏛 architektura (CLAUDE.md „Reading systém — stav")

**❓ NAD ČÍM UVAŽOVAT:** tabulka „nadcházející" níž (12 položek) · zda voice profil vůbec držet
v system promptu (model ho ignoruje) · dead/lab zapojit-nebo-zabít (`buildSysPromptV2`, `VARIABILITY POOLS`).

> Jak se čtení skládá (pořadí toku pipeline) → CLAUDE.md „Reading systém — stav". Proč každé změny → RUNAR_DECISIONS.md.

## Rejstřík pák — co je o které páce změřeno (čti PŘED tím, než o ní něco tvrdíš)

**Proč existuje:** 2026-08-21 jsem dvakrát tvrdil věc, kterou dřívější měření v tomhle logu
vyvracelo — log je chronologický a přes 1500 řádků, takže „co víme o úhlu" v něm nebylo
nikde pohromadě. Rejstřík je nit. Datum = kde v logu hledat detail.

| páka | co je změřeno |
|---|---|
| **angle** | 18.8. vypnutí = **změna beze změny** (pestrost, n≈300, mez citlivosti 3,2 b.) · plochy bez úhlu čistší (Ask 4 % · spread 10 % · single 18 %) ⚠️ **18 %, ne 23 %** — 23 % byl mezivýsledek téhož dne, zneplatněný opravou detektoru (archiv evalu 16. 8.: „dřívější hodnoty z dneška neplatí", 15 → 23 → **18**); dohledáno 2026-09-08, protože komentář v `runar-reader.html` na tom zamrzl · 21.8. tvrzení „úhel je kotva k obrazu" **NEDOLOŽENO** (n=8, jeden běh) |
| **describe** | 20.8. zavedeno do `focused`: pojmenování 0/8→6/8 EN (p=0,0035), 0/20→8/20 IS (p=0,0016) · 21.8. ablace: bez něj EN 4/8→**0/8** — jediné, co pojmenování drží |
| **thread** | 23.8. zavedeno (v4.9): vztahová vazba sousedních pozic spreadu — náhrada za esenční řádek, který ve spreadech říkal „pojmenuj" proti záměrnému „nejmenuj" (KUKY: zatím nejmenuj; jména nese UI pozic). Baseline před: svět norns 1,63/1,75 · kříž 1,25/1,50 — měření po v4.9 následuje |
| **coldread** | 20.8. ablace: bez něj studené čtení EN 0→3/8, IS beze změny · 21.8. žebřík: **v minimu nekupuje nic** (0/8 před i po), vydělává až když jsou přidané bloky, které ke tvrzení svádějí |
| **length** | 21.8. ablace: vypnutí → pojmenování EN 4→**8/8**, IS 0→**6/8**, ale délka 2× (58→97, 40→92 slov) · 21.8. losovaná 3/4 věty zavedena · IS volnější rozpočet: pojmenování 7/8, ale soulad padá na 4/8 (houpačka, n=8) |
| **domain** | 21.8. jako **zdroj obrazu** ANO (studené čtení EN 10→2,3/16, IS 11→2,7/16) · vlastní obrázky v ní **NE** — otvírají druhý svět (1,25→1,00 světa po odebrání, soulad EN 5→7/8) |
| **lens** | 21.8. žebřík: krok  byl **nejhorší stupeň** v EN (chlad 0→3, pojmenování 8→4, soulad 7→5) — měřeno ve dvojici, samostatně ne · ㉚ hlásí nezapojenost u velkých spreadů od 18.8., neuzavřeno |
| **priority** | 21.8. měřeno jen ve dvojici s  (viz řádek výš); samostatný účinek **neznámý** · ablace: bez něj délka 58→48 slov, jinak ±1 |
| **intention** | 21.8. ablace: bez něj pojmenování EN 4→7/8 — malý blok (78 zn.), který stojí v cestě |
| **register** | 21.8. bez měřitelného účinku (ablace ±1; v žebříku IS pojmenování 5→2 při přidání) · 60 % textu byla sdílená preambule napříč pěti variantami — **odebrána 8.9.** (v4.16-seek) · 8.9. **poprvé změřeno, jestli registr vůbec něco dělá:** ANO, ale slabě — široké echo vlastního registru 20 % proti podlaze 8–11 %, kdežto globální podobnost ho nevidí (0,239 proti šumové podlaze 0,250). „Registr nic nedělá" tedy NEPLATÍ; jeho stopa je pod rozlišením té metriky · 8.9. zkrácení 45 → 12 slov: echo nálepky 0/20 v obou verzích, tvar beze změny, stopa obsahu o něco silnější |
| **ending** | 21.8. `heavy[1]` „asks for honesty" = **8/8 studených čtení**, nejhorší jednotlivá páka z dvaceti — přepsáno · `open[0]`/`open[1]` přepsány pod čáru podmětu |
| **image** | 21.8. ablace: bez něj IS soulad 7→5/8 · 25/25 run má vlastní obraz ve všech 6 sezónách (2026-08-20) · 22.8. **test naslepo** (obraz → pětice sad významů, náhoda 20 %): 71/80 trefeno; **7 obrazů jednomyslně ukazuje na JINOU runu** (Wunjo úkryt→ochrana, Hagalaz poryv→Perth, Algiz 2× →Nauthiz/Raidho, Sowilo zimní slunce→Isa, Berkana svíce→Eihwaz, Mannaz stopy→Raidho) + Kenaz „hands remember" nevyjadřuje nic + Thurisaz brána nevyhodnocena (soudce 2× bez odpovědi). Data `docs/eval/2026-08-22-obrazy-blind/`. ⚠️ Měkký test (21.8., „unese aspekt?") a slepý test se rozcházejí na Kenaz hot-spring — měkký NE, slepý ANO; dvě otázky, ne jedna pravda |
| **keywords** | 21.8. model sáhne po nejznámějším klíči (Jera → „harvest") i když obraz nese jiný · 22.8. **VYŘEŠENO PRO IS** (v3.2): klíč = stránka vylosovaného obrazu (mapa 79/80), soulad 24/32→30/32 (p=0,041), dva nezávislé vzorky · **EN se neváže** — efekt žádný, náhoda drží pestrost · klauzule do promptu zamítnuta už 21.8. (srazila pojmenování) |
| **name** | 21.8. bez měřitelného účinku (ablace ±1) |
| **voice** (systémový prompt) | 21.8. ablace: vypnutí **nezhoršilo ani jedno** ze tří měřítek, pojmenování EN 4→7/8 — ⚠️ ale **hlas se neměří**, a ten tenhle blok vlastní. 57 % plochy promptu |
| **essence** | 8.9. **nejméně pestré místo čtení**: tvar „\<Runa\> is …"/„This is \<Runa\>, …" v **60/60** (a 28/28 v produkční ablaci; napříč 399 čteními 64 %) proti **0/53** u statických květnových · odebrání vzoru z promptu srazí jen 100→92 % — **zdroj je zadání**, ne příklad: ablace řádky „Mention \<Runa\> by name once" dá 33 %, ale v 8/12 jméno runy nepadne vůbec |
| **address** | jen IS, neměřeno |

⚠️ **ŘÁDEK SE ČTE CELÝ — a poslední klauzule přebíjí první (KUKY 2026-09-12).** Řádky jsou
chronologické a append-only, takže **nejstarší tvrzení stojí vlevo a to platné vpravo**. Kdo se
zastaví na začátku, odnese si přesně opak. Doloženo: 2026-09-12 jsem si z řádku `register` vzal starou
půlku **dvakrát** („ablace ±1, nic to nedělá" · „60 % je sdílená preambule") a ohlásil je jako
živý stav — přitom týž řádek o pár slov dál říká „odebrána 8.9." a „‚Registr nic nedělá' tedy
NEPLATÍ". Owner: *„je to špatně zapsané, že se to nedá najít, nebo co?"* Zapsané to bylo správně;
**vadný je tvar, ne záznam.** Kdo řádek doplňuje, ať **současný stav píše na ZAČÁTEK** a historii
za něj — u `register` už to tak je.

⚠️ **Prázdná buňka není „neškodné".** Znamená to, že o té páce nevíme nic — ne že nic nedělá.

---

## Jak má vypadat VSTUP do promptu (čti, než napíšeš nové ukotvení)

**Proč tahle stránka existuje:** odpověď na „jak podat modelu význam, aby ho použil, ale neopsal"
už **byla naměřená — v pěti řádcích Rejstříku výš, každý na kus.** Nikdo je nesložil, a tak se
otázka pokládala znovu (KUKY 2026-09-12: *„zaráží mě, že to dávno nevíme, tohle je pro mě základ"*).
Tady je to složené. Žádné nové měření, jen jedna stránka místo pěti řádků.

| tvar vstupu | co se s ním stane | odkud |
|---|---|---|
| **hotová věta O RUNĚ** („X je runa, která…") | **opíše se doslova** — þula ve výstupu 2/2; po odebrání 0/25 | v1.4 |
| **vložený obraz jako věta** | opíše se **12 % → 28 %** (IS) — a čím líp obraz k runě sedí, tím víc | doslovné opisování, 14.8. |
| **CELÝ klíčový seznam runy** | stopa prostého významu **17 % → 0 %** ↓ | `KLICE`, sonda „proč metafora" |
| **JEDEN konkrétnější klíč** téže runy | **17 %** — beze změny, drží | `ASPEKT`, táž sonda |
| **pokyn hlasu** („name the friction honestly") | echo nálepky **0/20**, ale stopa obsahu ve čtení **silnější** | register, 8.9. |
| **sloveso dělá z runy aktéra** („what the rune **DOES** through this image") | runa si vezme děj, který v obrazu koná někdo jiný — *„Berkana is that crossing"* (kajka převádí káčata), *„Hagalaz is the water taking…"*: EN **4/6**; znění *„which side of the rune this picture shows"* **2/6**, cizinec pochopí 2/6 → 5/6 | esence [0], 28.9. (DECISIONS 2026-09-28 (6)) |
| **slovo z pokynu v dovětku** („They know which rune **fell**") | slovo se objeví v odpovědi — *„the rune that fell"* 4/10 (Opus i GPT) | Ask životní runa, 28.9. |
| ⚠️ **„není to X": kontrast „the runes that were drawn" v pokynu** | podezřelý z upozornění *„…does not change the rune that was drawn"* — **větu odebrat nepomohlo** (GPT 4/5, Opus 5/5 i bez ní). Upozornění rodí OTÁZKA na runu, která nepadla, ne náš pokyn | Ask životní runa, 28.9. |

⚠️ **Měřítko se dvakrát mýlilo (§27):** regex na „does not change" minul *„Isa was not drawn here"* a *„Uruz alone"* — model upozornění
přeformuluje. Počítat **smysl věty** (tvrdí, že životní runa není tažená / nic nemění?), ne jeden tvar.

⭐ **Pravidlo, které z toho plyne:**
1. **Nikdy hotovou větu o runě.** Je to definice a definice se opisují. Platí i pro krásně
   napsanou větu — čím líp sedí, tím spíš se objeví v textu.
2. **Nikdy seznam.** Tři klíče už míří k `KLICE`. **Jedna věc, ne nabídka.**
3. **Substance musí BÝT PŘÍTOMNÁ, a jako JEDNA VAZBA** (`Gebo — exchange ↔ response`).
   ⚠️ **Samotný pokyn hlasu nestačí — změřeno 2026-09-12** (5 formátů × Eihwaz, slepý soudce):
   u formátu „jen pokyn" (*„let the exchange show in what you describe — never name it"*)
   soudce vazbu vůbec nenašel: *„every act attributed to the lower party is negative — the
   matching is asserted rather than enacted."* ⭐ **A tím se opravuje čtení řádku `register`:**
   echo nálepky **0/20 nebyla ctnost, byl to příznak** — neopsalo se to, protože tam nebylo
   co opsat. Pokyn řídí ZPŮSOB, ale žádný obsah nedodá.
4. ⚠️ **Jazyk to mění.** Opisování je jev hlavně islandský: táž krátká věta dala v EN 0 % → 9 %
   (v šumu), v IS **12 % → 44 %**. Co v EN projde, v IS nemusí.

**Změřeno 2026-09-12** — 5 formátů ukotvení životní runy (Gebo) proti jednomu rameni (Eihwaz,
strukturálně nejužší runa: 2 obrazy, 1 aspekt). Mechanicky = doslovná shoda + kolik klíčů
dorazilo; kvalitativně = slepý soudce bez znalosti hypotézy:

| formát ukotvení | opsaná fráze | klíče v textu | vazba dorazila | pojmenovaná |
|---|---|---|---|---|
| hotová věta o runě | **10 slov** ❌ | 3/6 | ano | ne |
| seznam tří klíčů | 2 | **4/5** ❌ | ano | **ANO** ❌ |
| **jedna vazba** | 0 | 0/3 | **ano** ✅ | ne |
| jen pokyn hlasu | 1 | 0/3 | **NE** ❌ | ne |
| vazba + pokyn | 1 | 0/5 | **ano** ✅ | ne |

⇒ **Jedna vazba stačí; pokyn navíc nepřidal nic měřitelného** → ber jednodušší.
Runa ramene zůstala sama sebou ve všech pěti (Eihwaz drží 5/5), takže formát ji nepřebarvuje.

⚠️ **Hranice:** n=1 na formát, jedno rameno, jedna životní runa, texty psal CODE se znalostí
predikce. Co tu domněnku drží: (a) výsledek u „hotové věty" sedí na **nezávislý produkční
precedens** (þula 2/2), (b) výsledek u „jen pokynu" šel PROTI očekávání pisatele. Netvrdí se
nic o jiných runách ani o islandštině.

## Co sem NEpatří (§20 — neopisovat)
Samotný obsah bydlí v kódu; deník na něj jen odkazuje:
- prompty + gramatika + korekce → `v2/runar-character.js`
- obrazové pooly (SEASON_POOLS) + voice profil (`focused`) → `v2/runar-character.js` (pooly) · `v2/runar-config.js` (VOICE_PROFILES)
- konce/openery/úhly → `v2/runar-utils.js` (ENDING_*, READING_ANGLES)
- kohorta na měření → `readings.prompt_version` (tag dnes **v1.4**, config; ⚠️ glyf-fix se nasadil ještě pod v1.0 — tag se tehdy nebumpnul, takže jeho efekt NENÍ v eval oddělený od v1.0; „verze" ve spodních tabulkách = plánovací nálepky, ne vždy skutečný tag)

## Jak zapisovat
Jeden řádek = jedna páka. **Jedna páka na verzi** — když se sáhne na pět věcí naráz,
nepozná se, která zabrala (proto se bumpuje `RUNAR_PROMPT_VERSION`, ať nová čtení nesou tag).
- **Očekávaný efekt** napiš PŘED dávkou (predikce, ne alibi po měření).
- **Naměřený efekt** doplň po čteních (owner reálná + `gen_batch` syntetická přes probe set).
- **Verdikt**: kept / tuned / reverted.
- **Defekt (bug) ≠ páka.** Tvrdá chyba (glyf v textu, špatný tvar slova) se opravuje na nulu,
  neměří se „kolik zbylo" — jen se zapíše, že je opravená. Páka (styl, obraznost, konce) se měří.

---

## 2026-08-21 — MYND definována ownerem · dvě vlastní tvrzení stažena · meze soudců přeměřeny

**MYND (potvrzeno ownerem, jeho slovy):** *„jeden svět, ve kterém runa a obraz splývají."*
Sedí doslova na blok [11] charakteristiky („one image per reading… two unrelated pictures side
by side say nothing"). Pojmenování runy k MYND **patří** — owner výslovně žádal „zachovat obraz,
ale i vysvětlit runu" — ale splývá s obrazem, nestojí vedle něj.

**Stažená tvrzení (ověřeno na výzvu ownera):**
1. *„Čtyři chválená čtení se liší od zbytku dávky"* — p = 0,18 na obou měřítkách (n=4 vs 12).
   Rozdíl je směr, ne nález. Navíc provenience: „je to co jsem hledal" padlo na dávku z 20. 8.
   (ramena most3/most4 z artifactu), první čtyři z domobraz dávky 21. 8. owner takto výslovně
   nechválil — dva okamžiky chvály jsem slil do jednoho.
2. *„Owner nechtěl definici runy (smysl jen 1/4)"* — DVAKRÁT špatně: owner definici výslovně
   žádal, a soudce „řekne smysl" je na MYND-textech nespolehlivý (viz níž).

**Meze soudců — přeměřeno, horší než dřív tvrzené ±1:**
- Soudce **smysl** na větách, kde pojmenování splývá s obrazem („Berkana is early growth, the
  new thing pushing up"), kolísá 0/3–3/3 na TÉMŽE textu. Trestá přesně tu fúzi, kterou MYND
  chce — čím lepší splynutí, tím spíš řekne „jen obraz". **Pro MYND nepoužitelný.**
- Soudce **soulad** dává na témže souboru 15/16 (znění s příklady+SKIP) vs 9–11/16 (bez nich).
  Drift mezi zněními ±4, uvnitř znění ±2. Používat jen znění S PŘÍKLADY a n≥16.
- **Měřicí pár MYND: počet světů (nejstabilnější) + soulad s příklady.** Smysl pro MYND-styl
  vyřadit, dokud nemá znění, které fúzi nepovažuje za „jen obraz".

---

## 2026-08-21 — migrace do produkce: naměřeno PO zásahu (baseline k příštímu srovnání)

Produkce po pěti změnách (n=16 na jazyk, dva běhy soudce): studené čtení **EN 9–10/16 → 3–4/16**,
**IS 11/16 → 1–4/16** · „řekne smysl runy" **EN 0/8 → 9/16** · oblast jde ze čtení poznat stejně
dobře jako předtím (EN 7/16, IS 11/16; náhoda 2/16) · délka kolísá 3 věty ×6 / 4 věty ×10.

⚠️ **Islandské „řekne smysl runy" zůstává 2/16.** Pravidlo tam dochází (ověřeno ⑧), ale model ho
plní řádově méně než anglický. Nevzniklo migrací — bylo to tak už u kandidáta. Otevřené.

⚠️ **Číslo, které málem prošlo jako regrese:** první měření dalo EN 3/16 a vypadalo to na propad.
Byl to můj soudce — v přegenerované verzi mu vypadlo „Rune drawn: X" z user promptu. Se správným
zněním 9/16. Texty samy naming nesly, jen se ho soudce neptal na tom, co má.

Rozhodnutí a co přesně se změnilo → `RUNAR_DECISIONS.md` 2026-08-21.

---

## 2026-08-21 — přisouzení studeného čtení jednotlivým pákám (data: `docs/eval/2026-08-21-attribution/`)

**Metoda:** každé páce vlastní dávka se zamčeným zbytkem zadání (20 pák × 2 jazyky × n=8),
soudce nad hotovým čtením. Textový průchod po dvojicích pravidel byl zkoušen jako první a
**neprošel kalibrací** — minul jeden ze dvou rozporů doložených měřením, ověřovatel v přísném
znění nepotvrdil nic a v mírném hlásil i nevinné dvojice. Prompt je na tuhle otázku špatná
plocha: každá řádka zní sama o sobě rozumně.

**Co z toho plyne:** studené čtení **není rovnoměrné** — kdyby šlo jen o povahu modelu, seděly
by všechny páky kolem průměru. Nesedí: v angličtině `zakonceni_heavy` „one hard question that
asks for honesty" 8/8 a oblast Inner Growth 8/8 proti Career & Creativity 2/8. **Pořadí pák se
ale mezi jazyky nepřenáší** — úhel „the one thing that stays fixed" je v EN nejčistší (3/8)
a v IS nejhorší (5/8). Opravit jednu řeč tedy neopraví druhou.

**Meze:** n=8 na páku (rozdíl 1–2 je šum, čte se odchylka od průměru poolu) · soudce kolísá
o ±1 z 16 · mezijazyčné srovnání není čisté (EN čtení jsou o 6 slov delší). Celý výčet mezí
i způsob vzniku → `README.md` v tom adresáři.

---

## Baseline — naměřený stav výstupu (s čím příště srovnávat)

**Čísla se dají srovnat jen tehdy, když se měří TOUTÉŽ metodou.** Do 2026-08-09 se počítala
ad-hoc skripty, které nikde nezůstaly. Metoda proto bydlí v repu, ne tady:

```
node scripts/utils/measure_readings.js <dávka.jsonl>   # tvar · délka · papouškování · definice
node scripts/utils/lint_readings.js    <dávka.jsonl>     # zákazy na VÝSTUPU (tahá si je z promptu)
# IS gramatika: kontroly podle CLAUDE.md §2 (E001 = nerozparsováno ≠ OK) (do 2026-10-10 tu stálo is-grammar-qa — API zaniklo, DECISIONS 2026-10-10 (39))
```

⚠️ **Srovnávej jen srovnatelné.** Probe dávka = jeden druh čtení + jedna verze. Export z produkce
míchá spready se single a šest verzí → `scripts/utils/measure_readings.js` na to sám upozorní. Délku a tvar konce
mezi nimi neporovnávej.

### IS — islandská probe dávka (2026-08-09, tag v1.4, n=25, `docs/inbox/probe-is-v14.jsonl`)

| co | naměřeno | pozn. |
|---|---|---|
| papouškování obrazu — celá fráze doslova | **12 %** | EN pro srovnání 0 %; poměrně 34 % vs 31 % fráze → skoro totéž |
| přepsáno vlastními slovy | **76 %** | EN 84 % |
| různých vložených obrazů | **25/25** | žádné opakování (po +14 obrazech; Raidho měl dřív jedinou volbu) |
| délka | **medián 40 slov** (32–53) | zadáno 38–45 → poprvé v rozsahu |
| konec otázkou | **40 %** | cíl ~33 % |
| otevřeno definicí runy | **0/25** | ⚠️ regex chytá „X er rún…"; jiná IS definice by unikla |
| rúnaþula ve výstupu | **0/25** | před vypnutím 2/2 |
| zákazy na výstupu | **0 nálezů** | `lint_readings.js` |
| IS gramatika: nerozparsovatelných (E001) | **12 %** | před gramatickým blokem 71 % |
| IS gramatika: čtení s flagem | **36 %** | před blokem 88 % |
| skutečné chyby | **2 / 25** | `hlénu`→`hléinu` · překlep `uppréttt`; zbylých 7 flagů false-pos |

### EN — probe dávky (`docs/inbox/probe-self-life*.jsonl`)

| co | v1.2 (n=25) | v1.3 (n=25) |
|---|---|---|
| „trunk speaks of itself" v próze | **60 %** | **0 %** ← opravený defekt |
| papouškování obrazu — celá fráze | 0 % | 0 % |
| přepsáno vlastními slovy | 68 % | 84 % |
| **otevřeno definicí runy** | 0 % | **28 %** ⚠️ `_describeRule` to zakazuje — neřešeno |
| „already" | 20 % | 32 % |
| konec otázkou | 20 % | 48 % |
| délka | medián 48 (41–57) | medián 46 (42–54) |

### Produkce — reálná čtení (2026-08-08, n=271, export mimo repo)

Smíšená dávka (5 druhů čtení, 6 verzí, oba jazyky) → **jen jako hrubý obraz**, ne k porovnání s probe:
zákazy **1 nález** („journey") ve 271 · EN „already" **47 %** (podle verze: v0.x 52–67 % → v1.0 26 %)
· definicí otevřeno 4 % · 23 sezónních obrazů posloužilo **víc runám** (jeden až 11) — to řeší v1.4, ale jen v IS.

> **Otevřené, co z baseline plyne:** EN otevírá definicí ve 28 % (IS neměřitelné stávajícím regexem)
> · konec otázkou drží nad cílem (40–48 % vs ~33 %) · délka v EN pořád přetéká (medián 46).

### Úhly [0]+[1] přepsané — 2026-08-09 (v1.5): **změna JE nasazená, dopad NENÍ prokázaný**

Úhly [0] „shadow" a [1] „gift" se ptaly na **vlastnost runy** → model odpovídal definicí.
Přepsány na **projev v životě leitanda** (Cowork obsah; CODE ověřil EN a opravil IS vazbu).
Dvě probe dávky, obě stejným zadáním jako jejich baseline (`--all-runes --n 1 --life-rune self --name you|þú`):

| | EN baseline v1.3 | EN nová | IS baseline v1.4 | IS nová |
|---|---|---|---|---|
| n | 25 | 23 | 25 | 25 |
| otevřeno definicí runy | 7/25 = 28 % | 4/23 = **17 %** | 0/25 | **0/25** |
| papouškování obrazu (celá fráze) | 0 % | 0 % | 3/25 = 12 % | 7/25 = **28 %** |
| konec otázkou | 48 % | 43 % | 40 % | 40 % |
| délka (medián) | 46 | 47 | 40 | 41 |
| zákazy na výstupu | — | 0 | — | 0 |

⚠️ **Žádný z těch rozdílů není odlišitelný od šumu.** Fisher exact, oboustranně:

| co | čísla | p |
|---|---|---|
| EN definice celkem | 7/25 → 4/23 | **0,50** |
| EN definice jen na přepsaných úhlech [0]+[1] | 5/11 → 1/5 | **0,59** |
| IS papouškování obrazu | 3/25 → 7/25 | **0,29** |

Takže: „28 % → 17 %" **není zlepšení, je to nevím** — a stejně tak IS papouškování **není regrese**.
Důvod je strukturální, ne smůla: úhel se losuje ze sedmi, takže n=25 dá **~3 čtení na úhel**.
Změnu jednoho úhlu tím změřit nelze. Coworkův handoff to předpověděl („potvrdí až vynucený úhel").

**Řešeno v nástroji:** `gen_batch.js --angle 0..6` úhel vynutí (`--angle list` vypíše pool pro daný
jazyk); tvrdě selže, když se vynucený úhel do promptu nedostane, aby dávka tiše neměřila jiný.
Skutečné měření = **n≥25 na jeden úhel**, staré znění proti novému.

**Co z dat plyne bez ohledu na n** (rozdělení podle `angle_idx`, který si `gen_batch` zapisuje):
definice se nerozdělují rovnoměrně, drží se na úhlech, které se ptají **na runu**. V baseline to byly
[0] 2/3 a [1] 3/8; v nové dávce **[5] „what is stirring — name the movement this rune makes visible"
2/2** (a v IS týž úhel 2/2 na papouškování obrazu). n=2 nic nedokazuje, ale **formulace má přesně tu
vadu, kterou Cowork právě odstranil z [0] a [1]** — mluví o runě, ne o životě. Kandidát na stejné
ošetření → `RUNAR_BACKLOG.md`.

**Tag verzí je u těchhle dvou dávek posunutý:** `docs/inbox/probe-en-angles-v15.jsonl` a
`probe-is-angles-v15.jsonl` nesou `prompt_version: v1.4`, ale obsahují už přepsané úhly.
`RUNAR_PROMPT_VERSION` se bumpnul na **v1.5 až po jejich vygenerování** (moje chyba — úhly jsou
změna promptu). Názvy souborů říkají pravdu, tag ne.

### Od 2026-08-09 se měří na REÁLNÝCH čteních testerů — a proto si čtení pamatuje svůj los

KUKY: *„teď už budeme měřit jen na základě reálných čtení testerů."* K tomu bylo potřeba
zavřít jednu díru: `readings` nepersistovala **ani jeden z pěti losů promptu**, takže
z produkčního čtení nešlo zjistit, kterým úhlem přišlo ani který obraz dostalo. Od téhle
verze nese každé čtení `prompt_draws` — úhel · obraz · tvar konce · umístění jména.
(Migrace `sql/2026-08-10_readings_prompt_draws.sql`; starší čtení mají `null` a tak to zůstane.)

**Rámec, který ruší předchozí způsob čtení čísel.** KUKY tentýž den: *„nejde nám o to zbavit
se například `already` úplně. To byla chyba a nedorozumění. Chceme mít čtení vyvážená.
Nejdeme hardcore zákaz na 0."* Losy jsou páky na **rozložení**, ne zákazy. Metriky se proto
nehlásí jako počty prohřešků — hlásí se jako rozdělení. Extrém je vada na **obou** koncích;
0 % je stejně podezřelé jako 90 %. Jediné, co je opravdu vada, je **otevření definicí runy**
(zakazuje ho `_describeRule`).

Postup na jednu dávku:

```
node scripts/utils/export_readings.js --testers-only --since <datum>   # ven z repa
node scripts/utils/measure_readings.js --balance <dávka.jsonl>         # rozložení pák
node scripts/utils/lint_readings.js <dávka.jsonl>                      # zákazy na výstupu
# IS gramatika: kontroly podle CLAUDE.md §2 (do 2026-10-10 tu stálo is-grammar-qa — API zaniklo, DECISIONS 2026-10-10 (39))
```

⚠️ **Co dávka neunese, to `--balance` řekne nahlas** místo mlčky vytištěné nuly: čtení bez
`draws` se hlásí jako nezapočítaná, a když na jednu možnost připadá **méně než 5 pozorování**,
nástroj sám napíše, že o (ne)rovnováze nevypovídá. Úhel dostane ~1/7 dávky — takže na otázku
„udělala změna JEDNOHO úhlu něco?" produkční dávka neodpoví ani s losy; na to je
`gen_batch.js --angle N` (n≥25 na úhel). Produkční data odpovídají na *jak čtení čtou*,
vynucená probe na *co udělala konkrétní páka*.

### Žebřík k holému promptu — jak zjistit, jestli je část promptu k něčemu

Owner 2026-08-10: *„začínali jsme úplně s holým promptem a začali přidávat … chtěl bych vidět,
jestli některé věci nejsou zbytečné."* Nástroj na to je `--without`:

```
node scripts/utils/gen_batch.js --without list                       # co jde vypnout
node scripts/utils/gen_batch.js --lang is --all-runes --n 1 --out A.jsonl
node scripts/utils/gen_batch.js --lang is --all-runes --n 1 --without image --out B.jsonl
node scripts/utils/compare_readings.js A.jsonl B.jsonl               # čtení vedle sebe
```

⚠️ **Přidávej, neodebírej.** Páky se překrývají: definice runy dnes drží zpátky `_describeRule`,
vypnutá rúnaþula i přepsané úhly [0]/[1] **současně**. Vypneš-li je po jedné z plného promptu,
každá vyjde jako „nic to nezměnilo" — a po vypnutí všech se definice vrátí. Cesta, která tuhle
past nemá: `--without all` → holý základ → přidávat po jedné a poslouchat, co která přinese.

⚠️ **Tady se nepočítají procenta.** Jeden čtenář a hrstka čtení: nejsilnější tvar je **totéž
zadání dvakrát** — stejná runa, jednou s pákou a jednou bez — a přečíst je za sebou. Na to je
`scripts/utils/compare_readings.js`. Statistika má smysl až u desítek čtení na rameno.

Nástroj nesahá na produkci (přepíná se helper v sandboxu) a **nespustí dávku**, když vypnutí
prompt prokazatelně nezkrátilo — tichá „vypnuto" dávka by měřila plný prompt pod cizí hlavičkou.

### Doslovné opisování obrazu — IS (2026-08-14)

| stav | doslova celá fráze | nejdelší úsek |
|---|---|---|
| v1.4 dlouhá věta | 12 % | 34 % |
| v2.0 krátká věta (`notaðu þessa`) | 56 % | 73 % |
| v2.0 + rámec zdroje | 44 % | 59 % |
| **v2.1 + kontext za obrazem** | **32 %** | **52 %** |

⚠️ **Jazykový řez je klíč:** táž krátká věta dala v EN **0 % → 9 %** (v šumu), v IS **12 % → 44 %**.
Zkracování promptu nezasáhlo oba jazyky stejně — islandský prompt přišel o víc (~484 → ~306 slov),
takže jediná hotová věta v něm váží víc. **Metriku doslovnosti měř v IS**, tam má prostor; v EN je u dna.

⚠️ **Extraktor obrazu kotví na OBA konce** (`': '` … začátek ocasu). Když kotvil jen na dvojtečku,
počítal do fráze i pokyn za obrazem — délka 19 slov místo 10 a výsledek falešná **0 %**.

## Páky — retrospektiva (co už se s hlasem dělalo; detail = `git log` [reading]/[tune])

| verze | co se změnilo | proč | naměřeno | verdikt |
|---|---|---|---|---|
| v0.4 | honest intro copy + strop délky follow-upu | eval dávka v0.4 | — (Cowork sandbox) | kept |
| v0.5 | pravidlo „Describe, don't explain" | čtení vysvětlovalo místo ukazovat | — | kept |
| v0.6 | SEEKING stance + Confirmation reframe | postoj podle „co hledáš" | — | kept |
| v0.7 | reading contract dojel do všech 4 spreadů | pokrytí | — | kept |
| v0.8 | SEASON_POOLS rebalanc voda→pevnina | moc vodních obrazů | — | kept |
| v0.9 | Clarity register: zaostři, nedoručuj odpověď | čtení dávalo hotové odpovědi | NEZMĚŘENO (nula ostrých v0.9) | kept |
| v1.0 | No-cold-read gate + follow-up gates | „already/þegar" ve 4/5 · follow-up klouzal do cold-read | NEZMĚŘENO (traffic) | kept |
| — | SEASON_POOLS 110→133 (highsummer +12, +23) | malá zásoba → monotónnost | — | kept |
| — | follow-up strop 120→140 | IS se sekala uprostřed věty | — | kept |
| — | slepý post-procesor korekcí VYPNUT (`CORRECTIONS_POSTPROCESS=false`) | neuměl pád → korekce jdou do promptu (in-context) | — | kept |
| — (D6, **není páka**) | focused profil: „jeden obraz" řečeno **1× bohatě** místo 3× (2 restatementy smazány, EN+IS) — copy rozhodl Cowork. Smazáním zmizela i IS shodová chyba „Ein nákvæm hlutur" (hlutur = kk). **Bez bumpu tagu** (jede ve v1.3). | kritika 2026-08-06: „jeden obraz" 4× → ředí a staví zeď zákazů | **NULOVÁ změna obraznosti** — je to system prompt, model ho z velké části ignoruje; úklid clutteru + oprava IS shody, ne páka | check-is OK · E001 na dotčených řádcích **existovalo i před změnou (2/2 → 2/2, bez regrese)** | kept |
| **v1.1** (tag) | ENDING_OPEN pool 2/3→1/3 otázek (utils, IS+EN) **+** voice focused „na konci VŽDY otázka" → podmíněné (config). Řeší i kritiku-T3 (voice „otázka VŽDY" × `_endingShape` „bez otázky" rozpor). Těžiště v poolu (silná páka), profil jen přestal tlačit. | eval 2026-08-02: 34/50 (68 %) konec „Hvað?" — moc otázkových konců | konec „otázka" klesne k ~1/3 | — (příští dávka owner + `gen_batch`) | čeká na měření |
| **v1.2** (tag) | `_noColdRead` reframe (kritika-T2): gate VEDE pozitivně (leitandinn kannast við sig í myndinni) a už NEjmenuje „already/þegar" — jmenoval je 3× → sám si to slovo sázel do user-promptu. Oba zákazy (inner-claim + fate-in-world) drží; zahozeno koncové „Lýstu…" (byl to duplikát `_describeRule`). IS ověřeno is-grammar-qa (0 flagů) + is-vazba (kannast við sig · láta+þf). **+ voice focused: 2 stejno-tvaré příklady → 4 různé tvary** (v1.2a, Coworkův obsah, IS ověřeno; SLABÁ páka, jede v témž tagu — nasazeno v témž okně jako T2, nelze oddělit). | eval v0.9/v1.0: „already/þegar" ve 4/5 čtení — model kopíroval slovo z gate | výskyt „already/þegar" v próze klesne | — (příští dávka) | čeká na měření |
| **v1.3** (tag) | **DEFEKT: vlastní životní runa v single** — při `drawn == life` pryč duplicitní `LIFE RUNE:` kontext + hotová citovaná věta „…\"The trunk speaks of itself.\"" (+ mrtvá copy `lifeRuneNote`); `_priorityContext` už nespouští sama tažená životní runa. Proč + varianta C → RUNAR_DECISIONS.md 2026-08-08. | self-reference probe (25 run, v1.2, EN): **self-ref 24/25** · naming-token 24/25 · gloss 0/25 · úhel NENÍ příčina — model opisoval citovanou větu (táž třída jako „already", v1.2) | self-ref v próze klesne na ~0 (defekt = na nulu) | **prompt: golden diff = jen 2 selflife klíče, 14 builderů byte-identických · seed-and-assert: věta i duplicita pryč** · čtení: rerun `gen_batch --all-runes --life-rune self` → Cowork delta | opraveno (zdroj vzoru pryč) |
| **v1.3** (tag) | **DEFEKT: life-rune prompt předváděl cold reading** — z IS builderu smazán blok „Stíllíkan" se dvěma vzory, které porušovaly `_noColdRead` stojící ve **stejném** promptu („orkan sem er **þegar** á leið" · „Rúnirnar **sjá hvað þú ert að ganga í gegnum**"), uvozené jako „uč se z tónu". EN blok neměl → srovnána i asymetrie. Proč → RUNAR_DECISIONS.md 2026-08-08. | probe reálného promptu: gate a jeho protipříklad **v jednom promptu**; životní runa = čtení nejvíc vystavené cold readingu | vzor pryč → model nemá co kopírovat | **golden (nově pokryto 4 klíči, dřív ŽÁDNÉ): změněny jen 2 IS klíče, 18 builderů byte-identických** | opraveno |
| **v1.3** (tag) | **DEFEKT: fantomová životní runa** — 4 spready jmenovaly životní runu v kontextu i když už byla mezi taženými (position-blok ji jmenoval znovu); `_priorityContext` mluvil o „čočce", která v promptu není. Jede v témž tagu (obojí defekt, opravuje se na nulu). Proč → RUNAR_DECISIONS.md 2026-08-08. | golden fixtures: fantomová čočka ve **3 ze 4** případů — i u uživatele BEZ životní runy | fantom = 0; runa jmenovaná 1× | **golden: 12 klíčů změněno, kontrolní `single_*` s reálnou čočkou byte-identický · seed-and-assert 14/14** | opraveno |

| **v1.4** (tag) | **obraznost klíčovaná runou** — 67 Coworkových obrazů (50 přírodních + 17 lidských) vedle sezónního poolu; runový obraz vyhraje, když sedí do aktuální části roku, jinak fallback. Sezónu hlídá **výběr, ne nový zákaz** (KUKY). U spreadů losuje runa z tažených. **Jen IS** — EN verze obrazů nejsou. Proč → RUNAR_DECISIONS.md 2026-08-08. | eval: 100 % obrazů příroda · týž obraz zdobil nesouvisející runy (pool byl klíčovaný sezónou, ne runou) | obraz sedí významu runy · víc domén (domov/práce/tělo/lidé) · žádný obraz mimo sezónu | **IS dávka 25 čtení (2026-08-09): obraz se neopakoval 25/25** (Raidho měl dřív jedinou volbu) · délka **medián 40 slov** (zadáno 38–45) — poprvé v rozsahu · konec otázkou 40 % · zákazy: **0 nálezů** (linter) · gramatika: E001 **12 %** (před gramatickým blokem 71 %), 2 skutečné chyby ve 25 čteních | kept 

| **v1.4** (tag) | **IS rúnaþula se už neinjektuje** (`useFormula:false`) — byla to hotová DEFINICE runy tři řádky nad zákazem definic a **opisovala se doslova**. Proč → RUNAR_DECISIONS.md 2026-08-09. | ostrá IS čtení: þula ve výstupu **2/2** | tvar „X er rún…" zmizí | **IS dávka 25: v promptu 0/25, ve výstupu 0/25** — úplně pryč | opraveno |

## Páky — nadcházející (stav 2026-08-08; hotové jsou v retrospektivě výš, §20 je neopisuje)

| # | co změnit | proč (změřeno) | čeká na |
|---|---|---|---|
| 1 | **obrazy pro runy, kde je díra** — Raidho má JEDINÝ obraz celý rok (= vždy tatáž věta, přesně „bergmál"), Isa/Ingwaz/Thurisaz/Berkana jediný aspoň v jednom období, **Sowilo** (2 období) a **Hagalaz** (4) nemají žádný → fallback | audit 2026-08-08, protlačeno všemi 6 obdobími | **Cowork** — obraznost CODE nevymýšlí |
| 2 | **počítadlo obrazů → „jeden pohyb, ne seznam"** — `DEF_CHAR.grammar` říká „EXACTLY ONE… count the images… delete the rest", ale záměr ve voice profilu zní „crowded says nothing". Počítadlo zakazuje i **dobrý** případ (dva obrazy, kde druhý rozvíjí první — KUKY to na reálném čtení schválil) | audit + rozbor čtení Raidho/Gebo | rozhodnutí ownera → vlastní tag + eval |
| 3 | **IS rúnaþula = hotová DEFINICE tři řádky nad zákazem definic** (`RP_SINGLE.is.useFormula:true`, EN má false). Navíc citovaná fixní věta = třída, u které změřeno 15/25 doslovného opisu | audit 2026-08-08 | owner/Cowork (lore) |
| ~~4~~ | ~~T3 zbytek: úhel č. 8 × pravidlo čočky~~ | | ✅ **HOTOVO 2026-08-09** — úhel vyřazen (pool 8→7); detail RUNAR_DECISIONS.md
| 5 | **dva pokyny si nárokují první větu** — úhel („otevři obrazem") × `qBranch`/`noqBranch` („Open with X"). V IS doslovná srážka: obojí `Byrjaðu á…` | audit 2026-08-08 | EN jde hned; IS přeformulování = Cowork |
| ~~6~~ | ~~T1 dedup~~ | | ✅ **HOTOVO 2026-08-09** — obě duplicity pryč (studená runa v létě · otázka 2×); detail RUNAR_DECISIONS.md
| 7 | **vzorová věta učí zakázané** — jeden ze 4 příkladů ve voice profilu je označen „tvær kyrrar myndir / two still images", zatímco pravidlo žádá přesně jeden obraz | audit 2026-08-08 | Cowork (je to jeho copy) |
| 8 | **délka přetéká** — medián single čtení **47–78 slov** proti zadaným 38–45, ve všech verzích | 271 reálných čtení | — (souvisí s #2: obraz zabírá rozpočet) |
| ~~9~~ | ~~output linter~~ | | ✅ **HOTOVO 2026-08-09** — : zákazy si tahá Z PROMPTU (§20, nemají jak se rozejít), čte hotová čtení. První měření: **1 nález („journey") ve 271 reálných čteních**, probe v1.3 čistý.
| ~~10~~ | ~~T4 škrty~~ | | ✅ **HOTOVO 2026-08-09** — vzhled přesunut do RUNAR_DESIGN.md, „posbírej kontext" ven (system prompt −86 EN / −77 IS slov)
| 11 | **v1.1 zbytek: kalky** — `eitt strá í einu → í senn` · `standa í berhögg → í berhöggi við` = checklist-pravidlo, NE slepá korekce. `fær→fer` vědomě NEvloženo (fær je jinde platné) | Cowork eval | zapsat do `IS_NATIVE_CHECKLIST.md` |
| 12 | **EN nemá runové obrazy** — v1.4 je IS-only, takže EN dávky efekt neukážou | v1.4 | Cowork (EN verze obrazů) |

> **Pravidlo pořadí:** jedna páka = jeden tag = jedno měření. Nejdřív to, co nemá riziko (#4, #6),
> pak to, co čeká na obsah (#1, #7, #12), a #2/#3 až s rozhodnutím ownera — mění hlas.


## Starší měření (2026-08-06 → 2026-08-17) → archiv

Odsunuto 2026-08-21 do `docs/archive/RUNAR_EVAL_LOG-2026-08-06_08-17.md` — bylo to
1 144 řádků detailu, který se už nečetl, zatímco živý doc měl osminásobek povolené délky.
**Trvalé závěry z nich drží „Rejstřík pák" výš**; archiv má postup, n a meze citlivosti.

---

## Měření 2026-08-18 → 2026-09-30 → archiv

Odsunuto 2026-11-19 do `docs/archive/RUNAR_EVAL_LOG-2026-08-18_09-30.md` (odklad délky vypršel a zastavil push všem lanům).
Odkazy „RUNAR_EVAL_LOG 2026-08-18 … 2026-09-30“ v kódu a docích míří tam; **trvalé závěry drží „Rejstřík pák“ výš.**
`uz_vime.js` archiv prohledává.

---

## Měření od 2026-10-01

## 2026-10-01 (1) — Kontrola dvojic run proti skutečným čtením: 7 obrazů (čtení z DB + brána s popisy)

Owner 2026-09-30: *„musíš to zkontrolovat s reálným čtením… zkontroluj čtení i ze staršího promptu, jak se v něm runa popisuje"*.
Zdroj: tabulka `readings` (495 čtení, 17. 5. – 30. 9.), hledáno v `prompt_draws.image` i v textu (čtení před v1.5 draws nemají).
Výpis s plnými texty zůstal MIMO repo (repo je veřejné, čtení nesou jména testerů).

**Čtení, kde obraz padl:**
- **Gebo, káva pro dva** (dnešní znění 2×, starší „Dyrnar standa opnar og kaffi…" 2×): ve **4/4** druhý člověk u stolu není —
  *„the seat across from you still empty for now"* (22. 9.), *„The second chair is empty"* (25. 9.), *„…bíður eftir orði sem er ósagt enn"* (26. 8.).
  Isa se svou kávou (3 čtení) píše totéž čekání. Runu Gebo čtení pojmenuje správně, scéna ukazuje opak.
- **Prázdná runa, mlha** (5 čtení): ve **4/5** za mlhou něco JE — *„the home beyond it stands"* (11. 8.), *„the far shore"* (6. 9., 25. 9.) = slovník Perth
  (ve čteních Perth: *„what the water has kept out of sight"*, *„not yet surfaced"*).
- **Ingwaz, tráva nad sadbou** (1 čtení, 21. 9.): protimluv *„The grass greens over the seed-bed while the ground above shows nothing at all."*
- **Mannaz, přísloví** *Hugurinn ber mann hálfa leið* (1 čtení, 25. 9.): obraz pominut, vlastní scéna (*„A loose thread catches at the shoulder…"*).
- **Jera, těsto:** dnešní znění 0×; starší *„The dough needs its time"* 3×: sklizeň 1× · čekání 1× (*„the waiting that no pressing of thumbs can shorten"*)
  · skrytá práce 1× (*„that quiet working underneath"* ≈ Ingwaz se skyrem *„turning one thing into another without a sound"*).
- **Sowilo, paprsek po zimní tmě** a **Raidho, závěj:** 0 čtení. Dagaz se ve čteních popisuje právě návratem světla (*„Dagaz turns the dark toward
  the light"*); Raidho u obrazu, který se hýbe SÁM (ovčí stezka), sklouzl do slov Laguz (*„the going that finds its own way without a hand to steer it"*).

**Brána s popisy** (3 slepí soudci, sonnet; 14 ownerových popisů run bez jmen; 7 starých + 7 nových obrazů, EN):
staré — mlha Perth 3/3 · paprsek Dagaz 3/3 · závěj Laguz 3/3 · tráva Berkana 2 + Isa 1 · přísloví Ehwaz 2 + Raidho 1 · káva Wunjo 2 + Gebo 1
· těsto **Jera 2** + Berkana 1. Nové — 6× 3/3, Jera (marmeláda) 2/3. Druhá volba u nové Prázdné runy: Perth 3× (hranice zůstává tenká).

**Útok na nástroj (§27):** 14 obrazů na 14 popisů a dva obrazy téže runy → soudci předpokládali párování 1:1 a dva to napsali
(nová Jera → Isa *„přirozeněji Jera, ale Jera už má obraz"*; stará tráva → Isa *„B a N už mají jiné obrazy"*). Ty dva hlasy jsou artefakt
zadání; ostatní odůvodnění citují popisy. **Cena:** 577 tis. tokenů (3 soudci po 11–14 min) — memory `cheapest-deciding-measurement-first`.
**Hranice:** čtení jsou z různých verzí promptu (v1.6–v4.59), n = 0–5 na obraz; Sowilo a Raidho stojí jen na bráně. Těsto u Jery je nejslabší
případ (brána ho nechala u Jery). Nová čtení s novými obrazy zatím žádná — owner: *„ať na čtení narazím, tak ho zkritizuju sám nebo testeři"*.

## 2026-10-02 (1) — Obraz × oblast: oblast od první věty (B), jádro obrazu + oblast (B2) · gpt-6.1-sol

Ownerovy reporty 2026-10-01/02 ke čtením přes GPT: obraz a oblast se *„bijí"* — model napíše obraz (často doslova) a pak zvlášť
větu s oblastí, slovy z promptu (*„In what you give and receive…"*, *„Among your people…"*, *„…gives you strength back"*).
Příčina v promptu: `_domainContext` — *„let the image you were given land on {podoba}"*, tedy dva kroky z konstrukce.
Ownerův nápad (Raidho): obraz jen jako prostředí, zbytek ze vstupu uživatele. Harness + texty: `docs/eval/2026-10-02-oblast-od-prvni-vety/`.

**Jak:** produkční prompt v4.84 (builder + řádek myšlenky ✦) se STEJNÝMI losy jako tři ownerova nejslabší čtení (Fehu × Love,
Kenaz × Family, Ansuz × Healing); model `gpt-6.1-sol` ve všech větvích. A = produkce · B = jen řádek oblasti: *„from the first
sentence, set the scene in {podoba}: the place and the people come from there; from the picture… take only what happens in it"*
· B2 = B + obraz zkrácený na jádro bez místa (jádra napsal CODE-tune jen pro test, např. Kenaz *„One small light shows only what
is close at hand"*).

**Výsledek (1 čtení na větev a runu):**
- **B = beze změny.** Model si nechá celou scénu obrazu (prodej krávy, lampa nad lavicí, zvon přes fjord); nanejvýš přidá místo
  (*„In your family's home, you see a single lamp above the bench…"*). U Fehu prodej krávy sám splní „what is given and received".
- **B2 = scéna v oblasti od první věty**, ale obecná a s předpoklady o životě tazatele: Kenaz *„You see your family around the
  kitchen table…"*, Fehu *„You stand beside two partners as a cow passes between them…"* (kráva se vrátila z aspektu *cattle*),
  Ansuz *„…in the garden where you rest"*. Islandský svět obrazů zmizel.
- **Slova podoby oblasti doslova ve všech větvích** (*„Among your people"* A i B i B2) — tahle vada na variantě nezávisí.
- **Kenaz má vadu parity:** EN *„A single lamp over the bench."* × IS *„…yfir hefilbekknum"* (truhlářský ponk). GPT čte lavici →
  *„the empty place beside you"* (ownerovo čtení na 6-sol) / *„the worn place beside your own"* (6.1) → nepřítomnost člověka v domě.

**gpt-6.1-sol:** `reasoning_effort` *none* i *minimal* odmítne (400 unsupported_value) — nejnižší je *low*. Při *low* přemýšlí
190–330 tokenů na čtení (platí se jako výstup). Cena (ceník 2026-10-02, Standard): ownerových 6 čtení na 6-sol průměrně
**0,0042 USD** · 3 čtení A na 6.1 **0,0063 USD** (bez zápisu do cache; s ním o ~0,0006 víc). Text kvalitou srovnatelný
(6.1 Fehu: *„On the empty stall's latch, you can still see a pale tuft of hair."*).
**Hranice:** n = 1 na větev; soudí owner čtením, ne metrika. B2 jádra nejsou v bance.

## 2026-10-03 (1) — Test oblasti A / B / B2 na Opus 5 a sol 6 · co dostane čtení a co Ask (z kódu)

Owner: *„pokud jsi ten test udělal pro sol 6.1, tak znova, ale pro opus 5 a sol 6"* + *„v ASK byl schopný model krásně a přesně
vystihnout… čtení dostává hodně omezení a mantinelů… pravdu znáš spíš ty podle kódu"*. Týž harness a losy jako EVAL_LOG
2026-10-02 (1), prompt s `READ_ENGINE` daného modelu; Kenaz už s „burns over the workbench" (v4.85). `docs/eval/2026-10-02-oblast-od-prvni-vety/`
(`test_b_modely.js`, `test_b_opus5.json`, `test_b_sol6.json`).

**Výsledek (1 čtení na větev a runu):**
- **B (jen řádek oblasti):** Opus oblast do scény vtáhne a obraz si nechá — Kenaz *„The house is dark and quiet, the others asleep upstairs,
  and in the back room a single lamp burns over the workbench."* sol 6 jen přidá *„At home, among your family"* (jako 6.1).
- **B2 (jádro bez místa):** na všech třech modelech obecná scéna; u Fehu se kráva vrátí z aspektu *cattle* (sol 6 *„At the fence, a cow
  passes from one hand to another"*, Opus *„At the fence line a cow is handed over"*). ⇒ B2 nepokračuje.
- **Slova podoby oblasti doslova:** *„Among your people"* u sol 6 ve všech větvích, u Opusu v B.
- **Myšlenka ✦ na Opusu** nese metaforu 1. odstavce (*„Fehu pours slowly, then suddenly the cup is full…"*) — týž jev jako reporty 2026-10-01.

**Čtení × Ask z kódu** (produkční buildery v4.85, Kenaz × Family & Home, sol): uživatelský prompt čtení **631 slov, 39 vět, 25 s omezením**
(never / not / only…) a do **4 krátkých vět, 50–58 slov, čtených nahlas** musí vejít ~7 pevných kroků: úhel otevření · obraz · esenční
řádek · přistání na oblasti · jméno runy jednou a jméno člověka až ke konci · konec znovu na podobě oblasti · myšlenka ✦. Ask dostane
**hotové čtení + JEDNU otázku**, ~90 slov, *„may take the room an explanation needs"*, zbytek pravidel jsou jen podmíněné větve.
Podoba oblasti stojí v promptu čtení **dvakrát** (přistání i konec) → odtud doslovné *„Among your people"*.
**Hranice:** n = 1 na větev; počty vět jsou hrubé (regex na zákazy), ukazují řád, ne přesnou míru.

## 2026-10-03 (2) — Karta (Tarot) a oblast jen jednou: A / C / D1 / D2, sol 6, obrazy už podle oblasti (v4.87)

Owner: *„ano pusť 3 čtení s kartou a jeď among your people"*. Harness + texty `docs/eval/2026-10-03-karta-a-oblast/`. Tři případy jako dřív
(Fehu × Love, Kenaz × Family, Ansuz × Healing), jeden prompt A, varianty z něj: **C** karta — řádek IMAGE → *„THE CARD — above this reading
the seeker sees this picture… Do not retell or describe the picture; they already see it. Read it for them."*, řádek úhlu pryč ·
**D1** podoba oblasti jen v přistání, konec s obecným *„in the seeker's life"* · **D2** podoba jen v konci, přistání bez podoby.
⚠️ D1 obrací ownerovo 2026-09-20 *„most ať dosedne do AREA"* (RUNAR_DESIGN „Stavba Single").

**Výběr podle oblasti funguje:** Fehu × Love dostal stádo z hor (ne prodej), Kenaz × Family uhlíky pod popelem (ne dílnu).
**Karta (C):** čtení se změní ve výklad — 3/3 začínají jménem runy (*„Fehu names wealth…"*, *„Kenaz speaks of…"*, *„Ansuz speaks to…"*);
Kenaz obraz vůbec nezmíní. Bez karty viditelné v appce by člověk obraz neměl vůbec → C dává smysl JEN s kartou v UI.
**Slova podoby doslova** (ručně, 1 čtení na buňku): A 3/3 (*„Between those before you and those after"*, *„how you give care and receive it"*,
*„In another person's eyes"*) · D1 1/3 · D2 1/3 (*„the care you give and receive"*). Obě varianty ubraly; rozlišit je n = 3 neumí.
**Hranice:** n = 1 na buňku, posuzováno čtením; sol 6, ne Opus.

## 2026-10-03 (3) — Ask opakuje úhel čtení: A / V / W / W2 (sol 6) · úhel [0] v databázi

Owner: *„12 Ask opakuje úhel, oprav to"* (report 2026-10-01 09:59 u Uruz, čtení s úhlem [0]: *„Model vyloženě opakuje angle, což by
neměl"*; Ask tehdy: *„It does not show you … the whole path"*, *„your fingers find an edge first"*). Harness a odpovědi
`docs/eval/2026-10-03-ask-clearer-image/test_ask_uhel.js` (+ `docs/eval/2026-10-03-ask-clearer-image/test_ask_uhel_W.json` a `…_W2.json`). Dvě ownerova čtení s úhlem [0]
(Uruz × Purpose & Path, Kenaz × Family & Home), dvě otázky (nápověda *„… can you make this image clearer?"* a *„What is this reading
telling me?"*), 4 odpovědi na otázku a variantu; produkční `buildAskPrompt`, sol 6, strop 320.

**Varianty:** A = dnešní prompt · V = bez *„Describe the image;"* (hypotéza: Ask obraz popíše znovu, i s úhlem) · W = *„They have just
read this reading. Do not repeat it back to them, neither its picture in the same words nor the way it opened. Give them what it did
not say."* · W2 = *„They have just read this reading. Do not retell how it opened, where it looked first and what it narrowed to; speak
from what the picture holds."*

**Výsledek** (posouzeno čtením celé odpovědi; úhel = stavba *celek → jen část*, např. *„too large to see or move all at once. Your
fingers find one edge"*):

| | clearer: úhel | clearer: obraz čtení | telling: úhel |
|---|---|---|---|
| A | 2/4 | 4/4 | 3/4 |
| V | 4/4 | 4/4 | 3/4 |
| W | 0/4 | 0/4 | 1/4 |
| W2 | 0/4 | 4/4 | 2/4 |

V je horší → *„Describe the image"* příčina není. W úhel zabije, ale s ním i obraz (proti bodu 13, 2026-10-03 (12)). Oba zbylé
úhly u W2 jsou Uruz a nesou *„the whole way forward"*, které je i v esenci čtení — vysvětlit čtení je u té otázky v pořádku.

**Databáze** (EN čtení s `prompt_draws.angle`, regex na celé slovo, stav 2026-10-03):
- *whole* v textu čtení: úhel [0] **13/31 (42 %)**, úhly 1–6 **12/142 (8 %)**; *whole* nebo *only*: 20/31 (65 %) proti 39/142 (27 %).
- *whole* v odpovědi Ask: ke čtení s úhlem [0] **6/33 (18 %)**, k ostatním **12/149 (8 %)**.
⇒ Ask úhel přebírá ze čtení a zdroj je úhel [0] (`READING_ANGLES[0]`, *„one quick glance at the whole image, then let everything fall
away but one"*).

**Hranice:** n = 4 na buňku, dvě čtení, obě s úhlem [0]; sol 6, ne Opus; IS věta ověřená gramatikou a korpusem, modelem neběžela.
Slovo *whole* je hrubý zástup úhlu (chytí i esenci *„the whole way forward"*); netvrdí se, že W2 úhel odstraní úplně.

## 2026-10-03 (4) — Obraz Kenaz „stůl pod lampou, prázdná židle": brána ho dala k Othile, do banky nešel · únik jména v bráně

Owner: *„tenhle obraz bych chtěl jako nový, obraz pro Kenaz"*. Scénu si vymyslel model v jeho Asku (Kenaz × Family & Home, 2026-10-02:
*„You sit at a table with a lamp on, and one chair is empty. Kenaz lights that chair, but it does not tell you why it is empty."*).
Navržený řádek: *„The lamp over the kitchen table lights every chair, and one of them is empty."* (světlo jako podmět — předpoklad byl,
že židle sama sklouzne k Ise). Harness, čtení a soubory soudců `docs/eval/2026-10-03-kenaz-stul/`.

**Brána s popisy** (3 slepí soudci, sonnet; popisy Kenaz · Isa · Othila z `RUNAR_POPISY_RUN.md` bez jmen; v zadání věta, že víc obrazů
smí patřit k jednomu popisu): navržený řádek **Kenaz 1/3, Othila 2/3** · modelova původní scéna **Kenaz 1/3, Othila 2/3** · Isa 0.
Každý soudce dal oběma zněním **týž** hlas → změna podmětu na světlo nepohnula nikým (nulová páka); předpoklad „židle → Isa" padl.
Táhne domov: kuchyňský stůl a židle pro rodinu = popis Othily *„místo, kam se vracíš. Dům…"*. **Do banky nešlo** — řádek vrácen
z pracovního stromu před commitem. **Cena:** 0,29 M tokenů (90 · 92 · 113 tis.), i u úlohy se dvěma obrazy a třemi popisy.

**Pilot čtení** (produkční `buildReadingPrompt` s navrženým řádkem, sol 6, dva seedy u Family & Home + jeden bez oblasti): Kenaz
nesl světlo, které ukáže, co tam je, ve 3/3 (*„Kenaz gives light enough to see what is there and what is missing"*); **1/3** končilo
tvrzením, že v rodině někdo chybí (*„In your family, belonging may have room for someone whose absence is plain."*). Čtení runu zná
z promptu, takže o identitě obrazu nevypovídá — to dělá brána.

**Únik jména v bráně (opraveno):** builder `docs/eval/2026-09-26-obrazy/brana_build.py` nahrazoval jen základní tvar jména a popis
Othily obsahuje *„A otázka Othily může být"* — soudce viděl, který kód je Othila. Ve všech 25 popisech je to jediný pád, který prosákl.
Starší kolo 3 mělo Othilu na výběr u W2 (Wunjo, prošel 2/3), N1 (Nauthiz, 3/3) a X2 (Prázdná runa, **0/3 → Othila 3/3**, do banky
nešel). Únik mohl táhnout jen k Othile, takže **žádný obraz kvůli němu neprošel neprávem**; X2 (dům, který nikdy nestál) mohl padnout
i kvůli němu. Builder teď nahrazuje i pády a build zastaví, když v popisech zůstane jméno kterékoli runy z úlohy (ověřeno mutací:
bez nahrazování pádů skončí na *„prosakuje: Othily"*). Dnešní brána běžela už opravená.

**Hranice:** n = 3 soudci, dva soupeři (ne všech 25 run); pilot n = 3, sol 6, jen EN.

## 2026-10-04 (1) — Živá čtení 3.–4. 10.: Hagalaz sol 6 × Opus 5 · „without the image" opisuje čtení už před v4.89 · formule v Ascích

Zdroj: ownerova čtení 2026-10-03 13:03 → 2026-10-04 12:04 — **18 čtení** (sol 6 12×, Opus 5 6×), **19 Asků**, **22 reportů** (9× ✦ Keep, 13× poznámka).
Texty v DB (`readings`, `bug_reports`), mimo repo.

**Hagalaz, sol 6 × Opus 5** (owner: *„všech hagalaz čtení… sol 6 proti opus 5"*). V DB 28 Hagalaz EN single; na témže promptu v4.89 je
**8× sol, 4× Opus 5**:

| | slov čtení (bez ✦) | slov / větu | slov ✦ myšlenky |
|---|---|---|---|
| sol 6 (8) | 60 (56–66) | 15,1 | 11,6 |
| Opus 5 (4) | 70 (64–76) | 17,5 | 23,3 |

Opus píše myšlenku ✦ jako výrok + otázku (*„Some things stand through the hail not because they are strong, but because they were set
deep — which of the things around you would you be curious to test?"*), sol jen otázku. Starší Opus 4.8 (v4.42, v4.44, n = 2) měl 64 a 67
slov — kratší nebyl. Ownerovy verdikty: sol 5× *dobré / moc hezké / povedené*; Opus *„úplně nezvládl… špatně chápe"* (svatba a trajekt:
*„The crossing was planned by one generation and is waited on by another"*), *„In the people you belong to… making a racket while it
stands"* = *„špatný"*, *„every stone of it white and loud"* → owner v Asku *„Is it stone or hail?"*; ale věta *„In work, the fashionable
parts go first, and the habits you built slowly are the last to move"* (Opus) = *„líbí se mi"*.
Podoby oblasti: sol je bere skoro doslova (Purpose [2] *„what gives you the will to continue"*; Family [2] *„those before you and those
who come after"* + *„what links you"*, rozložené do dvou vět), Opus z nich dělá děj (generace u trajektu).

**Ask „Explain … without the image"** — podíl obsahových slov odpovědi, která stojí i ve čtení (bez stop-slov), napříč verzemi:
sol single **43 % (v4.80) · 39 % (v4.84) · 42 / 31 / 29 % (v4.89)**; Opus 5 **5–21 %** ve všech verzích (v4.89: 17 %); doslovné trojice
0–3 u obou. ⇒ Ownerův dojem *„po poslední změně bere odpověď až moc ze čtení"* **v4.89 nezpůsobila** — sol to dělal stejně i předtím;
je to model. Opus místo toho vykládá runu (*„Hagalaz is the rune of force arriving from outside you…"* — owner: *„super"*).

**Formule na konci Asku** (*„the rune/reading does not say / tell / confirm which…"*, *„leaves open"*): **14 z 19** (sol 10/12, Opus 5 4/7).
Regex: `(does not|doesn't|cannot|will not) (yet )?(say|tell|confirm|settle|decide|show|promise)|gives no confirmation|leaves (that|this|the)
(question )?open|leaves open`. Kandidáti v promptu Asku (neměřeno): *„neither confirm it nor take it up"* a *„one or two concrete
possibilities… each spoken as something that may be so"*. Druhý Ask první nevidí (krok 1, DECISIONS 2026-09-24 (6)) → owner u Ehwaz:
*„druhý spíš jen opakuje. Poslední věta úplně."*

**Hranice:** všechno jsou ownerova čtení, Hagalaz n = 8 proti 4; „without the image" u sol single n = 5 (2 před v4.89, 3 po). Podíl slov
ze čtení je hrubý: delší odpověď (Opus ~85 slov, sol ~50) má víc nových slov a podíl jí klesá — srovnání **uvnitř sol** (před / po) tím
zatížené není, délky jsou podobné.

## 2026-10-04 (2) — Krok 2 Asku: druhý Ask s předchozí výměnou opakuje první odpověď o polovinu méně (pilot před nasazením)

Owner: *„3. ano"* (krok 2: druhý Ask dostane poslední výměnu). Harness, ownerovy dvojice a odpovědi `docs/eval/2026-10-04-ask-krok2/`.
Šest ownerových čtení s dvěma Asky (DB 3.–4. 10.), druhá otázka **bez** výměny (A = produkce v4.90) a **s** výměnou (H = v4.91);
engine jako owner četl (sol 6 4×, Opus 5 2×), 2 odpovědi na variantu, produkční `buildAskPrompt` a tvar volání proxy.

| | doslovné trojice z 1. odpovědi | koncová formule (regex) | obsahová slova z 1. odp. | slov |
|---|---|---|---|---|
| sol 6 A → H (n = 8) | 2,9 → **1,3** | 6/8 → **2/8** | 0,29 → 0,27 | 53 → 53 |
| Opus 5 A → H (n = 4) | 4,3 → **2,0** | 1/4 → **0/4** | 0,25 → 0,24 | 84 → 82 |

Doslovné opakování první odpovědi klesá na polovinu u obou modelů. Riziko, že sol z vložené odpovědi začne opisovat, se
neukázalo (trojic ubylo). Obsahová slova se nehnou — obě odpovědi mluví o téže runě.
**Útok na nástroj (§27):** regex formule nevidí přeformulované varianty — v H stojí *„The rune does not sort you into one"*,
*„Fehu alone does not mark"*, *„The rune leaves room for both"*. Čtením: tah „runa neříká, která z možností" zůstává asi v **6/12**
odpovědí H proti asi **8/12** v A. ⇒ Krok 2 řeší opakování PRVNÍ ODPOVĚDI, ne formuli; ta má zdroj v pravidlech Asku (BACKLOG).
Ownerův případ Ehwaz se při opakování bez výměny (A) tentokrát nezopakoval (0/2) — produkční opakování bylo zčásti náhoda.

**Hranice:** n = 2 na variantu a dvojici; jen EN; IS blok ověřen gramatikou a korpusem, modelem neběžel; netestována otázka přímo
na slovo z první odpovědi (*„what did you mean by…"*) — to je hlavní nová schopnost, bez výměny ji model neumí z principu.

## 2026-10-04 (3) — Přemýšlení `low`: sol 6 × sol 6.1 × Opus 5 · koncovka Asku není z pravidel promptu · cache solu

Owner: *„určitě bych zkusil opus 5 low"* · *„vidím že čtení potřebuju s low"* (sol) · *„4. podívej se na to"* (koncovka Asku).
Harnessy a výstupy `docs/eval/2026-10-04-low-effort/` a `docs/eval/2026-10-04-ask-formule/`.

**Čtení** (3 single — Hagalaz × Family · Fehu × Love · Wunjo × Inner Growth — produkční prompt + ✦, 2× každé, strop 700):

| | slov | ✦ slov | čas | $/čtení | přemýšlení | useknuté |
|---|---|---|---|---|---|---|
| sol 6 `low` | 58 | 13 | 6,3 s | 0,0057 | 230–380 tok. | 0/6 |
| sol 6.1 `low` | 57 | 10 | 8,7 s | 0,0046 | 165–275 tok. | 0/6 |
| Opus 5 dnes (vypnuté) | 71 | 17 | 4,0 s | 0,0105 | — | 0/6 |
| Opus 5 `low` (adaptive) | 63 | 15 | 6,0 s | 0,0148 | výstup 171–700 tok. | **1/6** |

⚠️ **Opus 5 `low` na produkčním stropu 700 jednou useknul čtení uprostřed věty** (Wunjo: *„…ready to explain. It"*, bez ✦,
`stop_reason: max_tokens`) a dvakrát se ke stropu blížil (424, 332). Přemýšlení je u něj nestálé — produkce by potřebovala rezervu.
Kratší než dnes (63 × 71 slov) — Anthropic píše, že effort délku nespolehlivě řídí; tady to šlo opačně než „vypnuto", n = 6.

**Koncovka Asku** (*„the rune does not say which…"*, širší regex v harnessu; 7 ownerových prvních otázek, 2× každá):
- **Není z pravidel promptu** (sol 6 `none`, obrácená páka §25): produkce **8/14** · bez *„Do not mirror"* 8/14 · bez *„possibilities…
  may be so"* 11/14 · bez NO COLD READING 10/14 · bez hledání 10/12 · bez poslední věty čtení 9/14 · bez kánonové *„never predicts fate
  or claims absolute truths"* 11/14 · **bez všeho naráz 8/14**. ⇒ Žádné pravidlo ani jejich součet ji nedělá; je to návyk modelů u výkladu
  čtení se dvěma možnostmi (Opus ji píše taky).
- **Podle enginu** (produkční prompt): sol 6 `low` 8/14 · sol 6.1 `low` **5/14** · Opus 5 dnes 7/14 · Opus 5 `low` **5/14**. Rozdíl
  5 × 8 ze 14 je na hraně šumu (sd ~1,9) — sklon, ne důkaz. Useknuté ani prázdné Asky na stropu 320: 0 u všech.

**Cache solu:** implicitní cache zapisuje skoro celý vstup (23 čtení od 1. 10.: 30 855 z 30 924 tokenů) a nic se z ní nečte; zápis stojí
1,25× vstupu (ceník gpt-6-sol 2026-10-04: vstup $2,00, zápis $2,50, z cache $0,20). `prompt_cache_options: {mode: "explicit"}` zápis
vypne — ověřeno voláním: `cache_write_tokens` 1220 → 0. `MODEL_PRICES` zápis počítá správně (`openaiCacheWrite` 1,25 od 2026-09-25).

**Hranice:** n = 6 čtení / 14 Asků na engine, jen EN, jeden den; čas a cena kolísají (Opus `low` 0,0100–0,0232 $).

## 2026-10-04 (4) — Prompt proti návodům Anthropicu a OpenAI: co se dalo změřit hned

Owner: *„hlubší kontrolu promptu podle toho, co jsi našel o modelech… najít nesrovnalosti, pak vyřešíme, co budeme dělat"*.
Návody čtené 2026-10-04 přímo u výrobců: Anthropic *Prompting best practices*, *Prompting Claude Opus 5*, *…Opus 5.5*, stránka modelu
Opus 5 · OpenAI *Using GPT-6*, *Prompt engineering*, *A model guide for the GPT-6 family* (2. 10.), stránky modelů gpt-6-sol a 6.1, API
reference Chat Completions. Nálezy a návrhy → `RUNAR_BACKLOG.md` „Prompt × návody výrobců". Tady jen čísla:

- **Řádek ✦ proti JSONu** (pilot `docs/eval/2026-10-04-low-effort/test_low.json`): sol vždy uvnitř JSONu 12/12 · Opus 5 dnes 3× uvnitř,
  3× za JSONem · Opus 5 `low` 1× uvnitř, 4× za, 1× chybí. Prompt říká *„return ONLY this JSON array, nothing before or after"* a hned
  pod tím *„after everything else, on a new line beginning with ✦"*. Parser (`_splitThought`) zvládne obojí.
- **Věty se zákazem** (never / not / no / avoid…): systémový prompt 21/37 (57 %) · single 22/39 (56 %) · Ask 18/34 (53 %) · Norny
  21/40 (53 %). Důraz VELKÝMI (NO, ONLY, NEVER…): 2–5 slov na prompt.
- **Výstupy** (EN single od 20. 9.): Opus 5 n = 26 — pomlčka 0,15 na čtení (4/26), slova ze zakázaného seznamu 0, XML značky 0;
  sol n = 38 — pomlčky 0, zakázaná slova 0. ⇒ Varování Anthropicu (vypnuté přemýšlení pouští značky) a nezávislých testů (Opus
  píše pomlčky) se v našich krátkých čteních neprojevují.
- **Cache Claude** (Opus 5 od 25. 9., n = 27): zápis 19 600, čtení 4 005 tokenů → zhruba nula (~0,02 centu na čtení), na rozdíl od solu.

**Hranice:** jen EN prompty (IS mají stejnou stavbu, zvlášť nezkoumány); počty vět jsou hrubé (dělení na věty regexem).

## 2026-10-04 (5) — ✦ dovnitř JSONu a připomínka délky na konci: Opus ✦ 6/6 uvnitř, čtení o ~8 slov kratší (v4.92)

Owner: *„1 a 2, jeď"* (audit promptu × návody výrobců, BACKLOG „Prompt × návody výrobců"). Harness a výstupy
`docs/eval/2026-10-04-mysl-json-delka/`. A = v4.91, B = v4.92 (produkční cesta: builder + ✦ + připomínka v pořadí runar-reading.js).
Tři čtení jako 2026-10-04 (3) (týž seed), 2× každé.

| | slov čtení | v rozpočtu 50–58 | ✦ uvnitř JSONu |
|---|---|---|---|
| Opus 5 A → B | 72,5 (66–77) → **64,3 (58–67)** | 0/6 → 1/6 | 2/6 → **6/6** |
| sol 6.1 `low` A → B | 53,0 → 53,3 | 6/6 → 6/6 | 6/6 → 6/6 |

Po runách u Opusu: Hagalaz 75/76 → 66/67 · Fehu 77/74 → 65/65 · Wunjo 66/67 → 65/58 — posun drží u všech tří. Sol se nezkrátil pod
rozpočet (OpenAI varuje, že pokyny ke stručnosti umí zkrátit moc — tady ne). Opus je pořád nad rozpočtem; myšlenka ✦ u něj zůstává
dlouhá (výrok + otázka, 14–25 slov).
**Hranice:** n = 6 na buňku, jen EN, jen single; IS a spready neměřeny.

## 2026-10-05 (1) — Pravidla v promptu single jen jednou (v4.93): nic se nerozbilo, délky beze změny

Owner: *„bod 3 jeď"* (audit promptu × návody výrobců). Harness a výstupy `docs/eval/2026-10-05-bez-duplicit/`. A = v4.92, B = v4.93,
obě TÝMŽ builderem a seedem (A jen vrátí starý závěr). Tři čtení × 2, Opus 5 a sol 6.1 `low`, EN i IS (48 čtení).

| | slov A → B | runa jmenovaná právě 1× | bez zalomení | ✦ uvnitř JSONu |
|---|---|---|---|---|
| Opus EN | 66,2 → 64,0 | 6/6 → 6/6 | 6/6 → 6/6 | 6/6 → 6/6 |
| Opus IS | 50,8 → 54,2 | 6/6 → 6/6 | 6/6 → 6/6 | 6/6 → 6/6 |
| sol EN | 53,5 → 53,7 | 6/6 → 6/6 | 6/6 → 6/6 | 6/6 → 6/6 |
| sol IS | 54,8 → 54,0 | 6/6 → 6/6 | 6/6 → 6/6 | 6/6 → 6/6 |

Škrt nic nerozbil; rozdíly délek jsou v šumu (rozpětí u Opusu EN 53–77). Přínos štíhlejšího promptu (OpenAI uvádí +10–15 % ve svých
evalech) tady neměřitelný — n = 6 a žádná metrika kvality.
**Myšlenka ✦ (B, výchozí stav pro další krok):** Opus EN 12–20 slov, 2/6 dvě věty · Opus IS 11–15, 1/6 · sol EN 8–12 a IS 8–14, vždy jedna věta.
**Hranice:** jen single; spready mají vlastní kopie téhož závěru (BACKLOG).

## 2026-10-05 (2) — Myšlenka ✦: „jedna věta, nejvýš 12 slov" — Opus 18 → 11 slov, vždy jedna věta (v4.94)

Owner: *„zkrať myšlenku u Opusu"*. Harness a výstupy `docs/eval/2026-10-05-myslenka-kratsi/`. A = v4.93 (*„one more short line"*),
B = *„one more line set apart — a single sentence of at most 12 words"* (IS *„Línan er ein setning, í mesta lagi 12 orð."*).

| | ✦ slov A → B | jedna věta A → B | čtení slov A → B |
|---|---|---|---|
| Opus EN | 18,3 (13–25) → **11,0 (10–12)** | 3/6 → 6/6 | 67,7 → 64,7 |
| Opus IS | 15,8 (13–20) → **11,0 (9–13)** | 5/6 → 6/6 | 52,8 → 53,2 |
| sol EN | 11,3 → 9,3 | 6/6 → 6/6 | 53,5 → 52,5 |
| sol IS | 11,8 → 10,2 | 6/6 → 6/6 | 55,7 → 54,7 |

Opus ztratil tvar „výrok + otázka" (*„Hail is not a verdict, and not everything standing is meant to fall — what has held…"*) a píše
jednu otázku (*„Where might you already be held, with no need to earn it?"*, IS *„Hvað í þínu húsi á sér dýpri rætur en þú hélst?"*).
IS myšlenky B: is-grammar-qa bez nálezu kromě slabého W001 u *„mættirðu"* (tvar je správně). Sol se zkrátil o 1–2 slova.
**Hranice:** n = 6 na buňku, tři runy, jen single; kvalita posouzena čtením, ne soudcem.

## 2026-10-05 (3) — Kolo k4: brána nových obrazů 9/10 a „které významy obraz unese“; soudci s výběrem víc významů volí KONKRÉTNÍ

**Data:** `docs/eval/2026-09-26-obrazy/` — `kandidati_k4.json`, `k4_*` (brána, 3 soudci) a `vyz_*` (významy, 2 soudci, pravidlo
předem 4/4 v hlavičce `vyznamy_build.js`). Soudci = subagenti, ne API (KUKY 2026-10-05). Co se podle toho změnilo: DECISIONS
2026-10-05 (8)–(11). Spotřeba: 5 subagentů ≈ 593 tis. tokenů (3 × brána ≈ 107 tis., 2 × významy ≈ 135 tis.).

**Nález o nástroji (§27):** formát „označ VŠECHNY významy, které obraz nese“ dává 0/4 právě abstraktním významům, které dřívější
soudci (formát „vyber jeden nejlepší“) volili — pletení, ledovcová řeka a hodiny 3/3, probuzení 2/3, strom a cesta v mapě
2026-08-22 nejsou: *transformation* (strom), *growth through challenge* (pletení), *the unconscious* (ledovcová řeka), *turning
point* (probuzení), *waiting* (zastavené hodiny), *movement* (cesta). Místo nich bere konkrétní, na povrchu scény viditelné:
*clearing / nature force, need, water / flow, dawn / light, stillness / pause, the road*. Dosavadní význam prošel 4/4 u 16 z 24
obrazů. **Proto 0/4 z tohoto formátu NENÍ důkaz, že význam na obraz nesedí** — jen že leží pod povrchem. Druhá stopa téhož:
*nature force* 4/4 u všech 9 obrazů Hagalazu — identita runy prošla všude.
**Důsledek pro použití:** 4/4 z tohoto formátu je dobrý doklad PRO význam, 0/4 slabý doklad PROTI. Přidané významy kroku B
(*hail*, *nature force*) jsou z té konkrétní strany — sledovat v ownerově testování, jestli čtení s nimi nezní plošeji.
**Hranice:** n = 2 soudci (stejný model) × 32 obrazů × 2 jazyky; brána jen EN text (IS parita psaním + is-grammar-qa).

## 2026-10-06 (1) — Úkol E: „<Runa> names <význam>“ dělá SOL, ne Opus — a objevuje se až od v4.84 (DB, 193 čtení)

**Zadání (handoff CODE-tune proti 8d25148, KUKY „pořád disruption“):** hypotéza „holé slovo aspektu v hlavičce (`focus on: disruption`)
zve definiční vzorec“. Napřed nejlevnější měření: ownerova EN single čtení s `prompt_draws.kws` (n = 193, 2026-08-10 → 2026-10-05),
skript `docs/eval/2026-10-06-definicni-veta/mereni_db.js` (data jen lokálně). Vzorec přísně = *<Runa> (names|is|speaks of|means|marks|
stands for) [the|a] <aspekt>*; „names“ = *<Runa> names* kdekoli.
| | n | přísný vzorec | „names“ |
|---|---|---|---|
| **gpt-6-sol** | 33 | **10 (30 %)** | **14 (42 %)** |
| Opus 4.8 | 121 | 1 | 0 |
| Opus 5 | 26 | 0 | 0 |
| sol · Hagalaz | 11 | 8 | **10** |
| sol · ostatní runy | 22 | 2 | 4 |
| Opus 5 · Hagalaz | 9 | 0 | 0 |
| Opus 4.8 + 5 · aspekt jedno slovo | 89 | 1 | 0 |
⭐ **1. Vzorec je zvyk solu.** Opus (4.8 i 5) ho nedělá ani s holým jednoslovným aspektem (0/89 „names“) a Opus 5 ani u Hagalazu (0/9).
Uživatelé čtou na Opus 5 → ownerovo „pořád disruption“ vzniká v jeho čteních přes admin přepínač sol.
⭐ **2. U solu zlom v čase:** verze ≤ v4.80 „names“ **0/13**, od v4.84 **14/22** (v4.89: 10/11). Kandidáti mezi v4.80 a v4.84:
**v4.81 (2026-09-30)** esenční rámec [0] *„say what the rune means in its own terms, not what happens in the scene“* (výslovně definice);
rámec [1] má od v4.63 *„names the rune once“* (slovo *names*). Z DB nerozlišitelné — čtení po zlomu jsou z velké části Hagalaz (owner ho
testuje opakovaně), takže se plete verze × runa × aspekt (*disruption* 6/13, *clearing* 2/4).
**3. Tvar aspektu:** u solu 1 slovo 10/23 × fráze 0/10 přísně — ale 1slovné sol čtení jsou z půlky Hagalaz; sol mimo Hagalaz 1 slovo 2/12 ×
fráze 0/10 (n malé). Hypotéza „holé slovo zve vzorec“ **pro Opus padla** (0/89), pro sol **nerozhodnuta**.
**Útok §27:** půlka × půlka (sudá × lichá čtení v čase) přísně 5 × 6 — metrika stabilní; rozdíly mezi modely jsou řádově větší.
**Hranice:** jen ownerova EN čtení, sol n = 33; regex nevidí parafráze (*„Hagalaz is what…“* bez aspektu).
**Důsledek pro lab:** zadání chtělo čtení psát „tady“ (subagent / CODE-read), ne přes API. Claude vzorec nedělá (Opus 0/89, subagent
produkční vady nereprodukuje — EVAL_LOG 2026-09-19 (3)) → takový test by měřil model, který vadu nemá, a nic by nerozhodl. Rozhodne owner:
test na solu přes API (centy), nebo bez něj.

## 2026-10-06 (2) — Úkol E na solu (API): vzorec „<Runa> <sloveso> <význam>“ dělá ZADÁNÍ esence, sloveso určuje znění rámce, slovo dodá aspekt

**Owner:** *„ano, pusť test na solu přes API“* (navazuje na 2026-10-06 (1)). gpt-6-sol jako proxy (reasoning none, 700, explicit cache),
produkční cesta: builder (READ_ENGINE = sol → věta za obrazem pro sol) + ✦ + připomínka délky. 4 runy s jednoslovným aspektem, pevný
obraz a los na runu: Hagalaz *disruption* (výpadek proudu) · Fehu *wealth* (ovce z hor) · Wunjo *belonging* (sedneš si k nim) · Uruz
*strength* (zvedneš konec). EN, 2 čtení na buňku, 80 čtení, $0,29, 2,7 s/čtení. Skripty `docs/eval/2026-10-06-definicni-veta/`.
| rameno (jedna páka) | sloveso po jménu runy | holé slovo aspektu v textu | opis fráze ≥ 4 slova |
|---|---|---|---|
| A0 produkce, rámec [0] | speaks of 4 · names 3 | 8/8 | — |
| A1 produkce, rámec [1] | **names 8** | 6/8 | — |
| B0 rámec [0] ve znění PŘED v4.81 | **shows 8** (names 0) | 8/8 | — |
| C1 rámec [1] bez slova „names“ | names 7 · speaks of 1 | 7/8 | — |
| D0/D1 aspekt jako fráze ze scény | names 11 · speaks of 3 · holds 2 | 6/16 | **9/16** (*„Hagalaz names the force no one steers“*) |
| E0/E1 OBRÁCENĚ: aspekt zdůrazněný | names 9 · speaks of 4 · gives 2 · shows 1 | 16/16 | — |
| F0/F1 OBRÁCENĚ: aspekt z hlavičky PRYČ | names 10 · speaks of 3 · holds 2 | 6/16 | — |
⭐ **1. Definiční věta „<Runa> <sloveso> <význam>“ je v 78 z 80 čtení v KAŽDÉM rameni** (zbylá 2 = *„In Hagalaz, disruption…“*, definice v jiném tvaru) — i bez aspektu (F: *„Hagalaz names a break in
what usually holds“*, *„Fehu names wealth that has grown…“*). Dělá ji **zadání esenčního řádku** (řekni, co runa znamená), ne slovo aspektu —
totéž, co EVAL_LOG 2026-09-08 („šablonu dělá ZADÁNÍ, ne příklad“). Hypotéza „holé slovo aspektu zve VZOREC“ **padla** (F i E beze změny).
⭐ **2. Sloveso určuje znění rámce, ne slovo „names“ v něm:** [1] → *names* 8/8, a bez slova „names“ v rámci 7/8 (potvrzuje nález CODE-tune 1);
starý [0] → *shows* 8/8; dnešní [0] → *speaks of / names*. **DB potvrzuje:** sol před v4.84 *holds 4, is 2, lets, marks, carries, draws, opens,
leaves* (slovesa tehdejšího rámce [1] „moves, holds, opens, carries“), od v4.84 *names 14, speaks of 3, shows 2*. Zlom v DB (2026-10-06 (1)) =
změna slovesa, ne vznik vzorce.
⭐ **3. Slovo v předmětu dodá aspekt:** holé slovo v textu 14/16 (A), zdůrazněné 16/16 (E), bez aspektu 6/16 (F: Hagalaz *disruption* 1/4,
Fehu *wealth* 1/4, Wunjo 0/4, Uruz *strength* 4/4 — jádro runy sol zná sám). **Fráze místo slova jen vymění slovo za opsanou frázi** (9/16).
Ownerovo „pořád disruption“ = aspekt *disruption* v hlavičce → sol ho doslova dosadí do definiční věty.
**Útok §27:** půlka × půlka (k = 0 × 1) *names* 19/32 × 19/32. **Hranice:** jen sol, EN, 4 runy × 1 obraz, 2 čtení na buňku; Opus vzorec
nedělá (DB 0/147), takže nic z toho neplatí pro produkci uživatelů.
**Co z toho plyne (návrh, rozhodne owner):** (a) tvar věty nehýbe aspekt ani slovo „names“ — hýbe jím znění esenčního rámce (sloveso),
vzorec sám zůstane, dokud zadání chce „řekni, co runa znamená“; (b) „disruption“ přestane padat jen bez aspektu v hlavičce — ale aspekt drží
identitu run u solu (EVAL_LOG 2026-09-23 (3)) a jde i do Asku → neodebírat naslepo; (c) pestrost slova už řeší sáček významů (kroky A–D).

## 2026-10-06 (3) — Sol: Ask k životní runě (5 otázek × 4 bloky) a přesná cena čtení s automatickým Askem na oblast

**Data a tabulky:** `docs/eval/2026-10-06-ask-zivotni-runa/README.md` (jediné místo čísel). Co z toho plyne: DECISIONS 2026-10-06
(4). Cena (sol, n = 5 na jazyk, bez cache, hlas jen z textu čtení): EN čtení + hlas $0,0200, s automatickým Askem na oblast
$0,0231; IS $0,0415 → $0,0472. Ask platí hlavně vstup (systémový prompt + čtení), krátká odpověď šetří jen ~$0,0003.

## 2026-10-06 (4) — Ask: odkud je pojistka „the rune does not say…“ a co dělají slova tipů (sol, API, 288 volání)

**Data a tabulky:** `docs/eval/2026-10-06-ask-otazky/README.md` (jediné místo čísel); rozbor ownerových Asků
`docs/eval/2026-10-06-ask-otazky/ask_audit_od_2026-09-25.md`. Co z toho plyne pro psaní promptu: `RUNAR_DESIGN.md`, sekce „Slova, která dáváme modelu".
- **Pojistka** („does not say / leaves … open / not a promise“, 40 ze 124 ownerových Asků, oba modely): **pět domněnek
  vyvrácených obrácenou pákou** — věta o možnostech, o zrcadlení, NO COLD READING, všechny tři naráz, „never predicts /
  does not guarantee“ v charakteru (13/18 → 14, 12, 12, 16, 13). Pohnul s ní jen **poslední řádek čtení** (most dvou
  možností) vyndaný ze vstupu: 13/18 → 7/18, všechna tři čtení stejným směrem, p = 0,09 → naznačeno, neprokázáno.
  Pokyn „neopakuj, jak čtení skončilo“ nepomohl (15/18). Oprava zatím není — čtení z Asku vyndat nejde.
- **Slova tipů:** každé znění má na solu svůj stálý začátek odpovědi; jiná slova formuli přesunou, neodstraní.
  „Why is this showing up now?“ začne odmítnutím 9/9 (ptá se po příčině, kterou pravidla zakazují); „…the hard part?“
  vrátí „the hard part“ 9/9. Pravidlo „Begin with the answer itself…“ ozvěnu nezměnilo. Nejlíp vyšlo „Where does this get hard?“.
- **Nástroj:** trojice slov z otázky nevidí přeskupenou ani jednoslovnou ozvěnu ani zápor otázky → monitor ozvěn počítá
  od teď i stejný začátek odpovědí na týž tip.
- **Hranice:** EN, sol, tři ownerova čtení, n = 9–18 na buňku. IS a Opus netestovány.

## 2026-10-06 (5) — Ask pojistka „the rune does not say…": NENÍ to sloveso *say* v pravidlech Asku (§25: „není to X")

**Zadání:** handoff CODE-tune proti 5c28c3a — owner: *„musí se identifikovat ta věta samotná… něco jak ‚say what the rune‘ jako ve čtení…
odpověď modelu vypadá, že je odpověď na něco, co je přesně v instrukci."* V Ask promptu runy „říkají" **přesně ve dvou větách**
(`runar-character.js` ~2030 *„— say what the runes of this reading actually hold"*, ~2033 *„Say what the runes of this reading hold, in the
terms of their own question."*; jinde jen *„If the seeker says…"* a NO COLD READING *„never tell"*). Harness CODE-tune (pokus A), táž tři
ownerova čtení (Raidho · Algiz · Sowilo), tipy *„{area} — can you make this image clearer?"* a *„Explain {rune} without the image."*,
gpt-6-sol jako callSol, n = 18 na rameno, $0,17. Skript `docs/eval/2026-10-06-ask-pojistka/ask_say.js`, rozbor jejich `rozbor_slova.js`.
| rameno (jedna páka) | pojistka celkem | z toho doslova „does not say" |
|---|---|---|
| P0 produkce | 9/18 | 3 |
| **V** obě věty jiným slovesem (*„answer from what the runes … hold"*), pravidlo zůstává | 10/18 | 3 |
| R obráceně — ještě víc *say* (*„say plainly what the runes of this reading say"*) | 12/18 | 5 |
**Závěr:** vyměnit sloveso nepohnulo ničím (V 10 × P0 9; doslovné „does not say" 3 × 3) → **hypotéza „pojistka odpovídá na *say* v pokynu"
padla**. R o něco výš (12, „does not say" 5), ale v šumu — viz útok na nástroj.
**Útok §27 (táž produkce dvakrát):** CODE-tune ráno P0 **13/18**, dnes P0 **9/18** na stejném promptu a čteních → rozdíl ±4 z 18 je šum;
n = 18 rozliší jen velké změny (jako P6 13 → 7).
**Na co pojistka odpovídá — z textů:** na **poslední větu čtení, která nabízí možnost**: *„The cairns mark a road you can see, but they do not
say whether it still fits you"* ← konec Raidha *„You may be outgrowing a path…"*; *„The rune does not say which reading is right"* /
*„…which is happening here"* ← most ve tvaru dvou možností. Sedí s jedinou pákou, která se pohnula (CODE-tune P6: čtení bez posledního
řádku 13 → 7/18). Výklad (neměřený jako příčina): čtení končí MOŽNOSTÍ („may be X, or Y"), Ask má vyjasnit a kánon mu zakazuje verdikt
(Do not mirror · NO COLD READING · „may be") → nejkratší poctivá odpověď je „runa neříká, které". Není to slovo v pokynu, je to **tvar
mostu × zákaz verdiktu**.
**Hranice:** EN, sol, tři čtení, dva tipy; Opus netestován. **Neodebráno** zůstává: *„speak from what the picture holds"* a slova tipů.
⚠️ **VSTUP BYL ŠPATNĚ — opraveno v záznamu 2026-10-06 (6).** Čísla v tabulce výš jsou z čtení S řádkem ✦ (produkce ho před Askem odřízne).

## 2026-10-06 (6) — OPRAVA vstupu Asku v labu: čtení z DB nese řádek ✦, produkce ho Asku neposílá → přeměřeno

**Jak se našlo:** owner po záznamu (5): *„pokud jsi jen splnil úkol… bez toho, abys to ověřil…"* → kontrola vstupu proti produkci
(RUNAR_DESIGN „Slova“, „Jak se to ověřuje“). `ownerových readings.short_text` končí řádkem myšlenky (*„✦ When you look back, where have your steps
led?"*), ale `askRunar` posílá `readerTexts[lang].short`, z něhož `_splitThought` (`runar-reading.js` ~451) ✦ odřízne. **Harness pokusu A
CODE-tune (`docs/eval/2026-10-06-ask-otazky/ask_slova.js`) i můj `ask_say.js` (kolo 1) dávaly Asku čtení S ✦** — poslední řádek vstupu byla
otázka ✦, ne most. Ostatní argumenty sedí s produkcí: korekce — všech 28 řádků je IS, EN blok je v produkci prázdný (test [] = produkce);
runa jako jméno přes `rnPrompt`; aspekt `prompt_draws.kws`.
**Přeměřeno se vstupem jako v produkci** (`ask_say.js`, výstup `ask_say_kolo2.json`, $0,17, n = 18):
| rameno | pojistka celkem | doslova „does not say" |
|---|---|---|
| P0 produkce | 11/18 | 6 |
| V obě „say what the runes … hold" jiným slovesem | 12/18 | 7 |
| R obráceně, víc *say* | 16/18 | 7 |
**Závěr (5) platí:** výměna slovesa nesnížila nic (V ≈ P0) → **není to sloveso *say***. R o něco výš (16 × 11; Fisher p ≈ 0,12), doslovné
„does not say" stejné (7 × 6) — nerozhodnuto. Se správným vstupem je pojistky o něco víc (P0 11 × 9 v kole 1).
**Dopad na pokus A a B (CODE-tune, EVAL_LOG 2026-10-06 (4)):** běžely na témže vstupu s ✦ — P0–P7 i slova tipů platí jen pro čtení
s ✦ na konci; P6 („čtení bez posledního řádku" = bez mostu, ✦ zůstal) je třeba přeměřit se vstupem bez ✦. → handoff CODE-tune.

## 2026-10-06 (7) — „THE RUNE does not say…" odpovídá na rámec v Asku, kde runa NESE obsah („carries the sense", „what the runes hold") — 8/30 → 1/30

**Owner (oprava zadání po (5)/(6)):** *„nevím, co je se slovesem say! Já se neptal na sloveso say… ptal jsem se na ‚the rune does not say‘…
hledáme něco, kde se říká, aby popsal runu… je to něco, co ta runa dělá, říká, ukazuje… tohle je EN gramatika. Pokud to nevíš, najdi si to."*
CODE-read testy (5)/(6) měřily jen sloveso *say* v pokynu — špatně pochopená hypotéza.
**Gramatika (ověřeno):** Wiktionary *say*, význam 4 *„To indicate in a written form"* — *„The sign says it's 50 kilometres to Paris"*, *„What time
does it say on the clock?"* (Cambridge a Merriam-Webster vrátily 403). *„X does not say"* = X jako nápis / ukazatel, který podává informaci;
odpověď „neříká" přijde, když se ptáme na víc, než ukazatel uvádí.
**Kde Ask dělá z runy takový zdroj (vstup jako v produkci):** hlavička `RP_ASK.aspect` *„In this reading Raidho carries the sense of the road. Its
other senses are …"* · pravidla *„say what the runes of this reading actually hold"*, *„Say what the runes of this reading hold, in the terms of
their own question"*, *„answer plainly in its terms, from the runes of this reading"* · ve čtení esenční věta (*„Raidho concerns the direction…"*).
**Test** (`docs/eval/2026-10-06-ask-pojistka/ask_zdroj.js`, `rozbor_podmet.js`; sol jako callSol, vstup bez ✦, 3 ownerova čtení × 2 tipy × 5 = n 30,
$0,28): **X** = runa nikde jako nositel obsahu (hlavička *„Here: the road; also movement, …"*, pravidla *„stay with this reading"*, *„Explain this
reading in the terms of their own question"*, bez *„from the runes"*) · **Y** = obráceně, runa výslovně *„says"* (*„Raidho says: the road…"*, *„say what
the runes of this reading say"*).
| rameno | podmět RUNA + does not say/show/tell/settle | jiný podmět (čtení, obraz, mohyly, it) | pojistka celkem |
|---|---|---|---|
| P0 produkce | **8/30** (půlky 3/5) | 12/30 | 22/30 |
| **X** runa nic nenese | **1/30** (Fisher p = 0,026) | 11/30 | 18/30 |
| Y runa „says" | 5/30 | 13/30 | 20/30 |
Kolo (6) přepočítané týmž nástrojem: P0 3/18 · V (bez *say*) 2/18 · **R (*„say what the runes say"*) 7/18**. Příklady P0: *„The rune does not settle which
is happening here"* · *„Kuky, Sowilo does not show you a fixed destination"* (3× doslova). X: jediný *„Raidho does not say which course is right"*.
⭐ **Závěr:** ownerova hypotéza platí pro **runu jako podmět**: když prompt runu nerámuje jako nositele obsahu, *„the rune / <Runa> does not say / show"*
skoro zmizí (8 → 1, p = 0,026); zesílený rámec ji drží (Y 5, R 7). **Pojistka sama nezmizí** — přejde na jiný podmět (*„The reading does not say which
is happening between you"*, *„The cairns … do not tell you whether it still fits"*, 11–13/30 ve všech ramenech): ten díl odpovídá na **most čtení**
(možnost „may be X, or Y") × zákaz verdiktu a na tip *„{area} — can you make this image clearer?"* (pojistka hlavně u něj).
**Hranice:** EN, sol, 3 čtení, 2 tipy; X mění hlavičku i tři pravidla naráz — která z nich nese většinu, nerozlišeno; znění X je testovací
(do produkce jen ověřené anglické znění — RUNAR_DESIGN „Slova“ bod 9). Opus netestován.

## 2026-10-06 (8) — Ask pojistka PŘEMĚŘENA se vstupem jako v produkci (bez ✦): nese ji most čtení × zákazy verdiktu; oprava (4)

**Proč:** předávka CODE-read (EVAL_LOG 2026-10-06 (6)) — `docs/eval/2026-10-06-ask-otazky/ask_slova.js` posílal Asku čtení z DB i s řádkem ✦,
produkce ho Asku neposílá (`readerTexts.short`, `_splitThought`). Harness opraven (✦ se odřízne, pojistka hlídá), sol jako callSol, táž tři
ownerova čtení, tipy „{area} — can you make this image clearer?“ a „Explain {rune} without the image.“, **n = 30 na rameno** (3 × 2 × 5).
| rameno | pojistka celkem | podmět runa | podmět čtení/obraz | Fisher × P0 |
|---|---|---|---|---|
| P0 produkce | 26/30 | 9/30 | 13/30 | — |
| P1 bez věty o možnostech | 24/30 | 7/30 | 14/30 | 0,73 |
| P2 bez věty o zrcadlení | 23/30 | 6/30 | 12/30 | 0,51 |
| P3 bez NO COLD READING | 18/30 | 9/30 | 6/30 | **0,039** |
| P4 P1 + P2 + P3 | 17/30 | 4/30 | 8/30 | **0,020** |
| P5 charakter bez „never predicts… / does not guarantee… / Never hand… a conclusion“ | 14/30 | 4/30 | 11/30 | **0,002** |
| P6 čtení bez poslední věty (most) | 14/30 | 6/30 | 7/30 | **0,002** |
| P7 „…or how it ended“ | 22/30 | 6/30 | 10/30 | 0,33 |
| HLAVA hlavička aspektu bez „carries the sense“ (znění CODE-read) | 25/30 | 8/30 | 13/30 | 1,00 |
| PRAVIDLA tři pravidla bez „what the runes … hold / from the runes“ (znění CODE-read) | 14/30 | 4/30 | 8/30 | **0,002** |
Půlka proti půlce (§27) drží u všech významných ramen (P5 7/15 · 7/15, P6 7/15 · 7/15, PRAVIDLA 7/15 · 7/15; P0 12/15 · 14/15).
**Závěr:** pojistku nese **most čtení × pokyny, které zakazují verdikt** (charakter, NO COLD READING, pravidla Asku s runou jako nositelem) —
každá páka zvlášť ji sníží zhruba na polovinu, hlavička aspektu sama nic. ⚠️ **Oprava (4):** „pět domněnek vyvráceno“ a „P6 naznačeno, p = 0,09“
platilo jen pro vstup s ✦. Pokus B (slova tipů) se se správným vstupem **nepřeměřil** — owner běh zastavil (velikost vzorku bez jeho souhlasu,
memory `cheapest-deciding-measurement-first`); jeho čísla v README platí jen pro vstup s ✦. Kolo „drawn“ (zivotni.js, taky s ✦) nepřeměřeno.
**Hranice:** EN, sol, tři čtení, dva tipy. Výsledky mimo repo (nesou jméno), rozbor `rozbor_slova.js`.

## 2026-10-07 (1) — Audit promptu, krok 1–3 (první průchod): typy vad v čteních od nasazení solu (25. 9. – 6. 10.)

Owner: *„pusť se do auditu promptu… podotýkám, že náš model vytváří čtení."* Metoda a vstupní data → `docs/eval/2026-10-07-audit-promptu/README.md`.
Vzorek: 79 single čtení (sol 52, Opus 27; EN 77, IS 2) · 13 spreadů · 131 Asků · 106 ownerových hlášení (74 obsah, 16 „keep", 15 vzhled,
1 pád). Hlášení seskupená, všechna single čtení přečtená, počty strojem (`monitor_ozveny.js --od 2026-09-25`) tam, kde vadu spočítat jde.

| typ vady | počet | odkud v promptu |
|---|---|---|
| 1. konec čtení znovu položí otázku runy z Kolekce | opis ≥ 3 slov 20/79 (sol 13/52 · Opus 7/27), 18× v poslední větě; u solu s otázkovým koncem ≥ 4 slova 4/14 proti 1/38 s výrokem (Fisher jednostranně p = 0,015); parafráze nepočítány | `_runeQuestion`: jedna pevná věta na runu v uvozovkách pod pokynem konce |
| 2. myšlenka ✦ u téže runy na stejné téma | Hagalaz 20/23 (*what remains / still standing / roots*), Raidho 5/5 (*when you look back … your steps*) | `THOUGHT_ODSTAVEC`: jeden pevný odstavec Kolekce na runu |
| 3. podoba oblasti vložená doslova | ≥ 3 slova 12/69 (sol 11/44), 10× v poslední větě; 4 ownerova hlášení (*the people one belongs to* „nezní to dobře") | podoba stojí v promptu 2× — přistání i cíl konce (EVAL 2026-10-03 (1), (2)) |
| 4. obraz převzatý doslova | ≥ 4 slova 23/79 (sol 18/52), 17× v 1. větě | obraz jako zdroj čtení; owner: *„obraz se použije jednou"* |
| 5. význam z hlavičky doslova | 26/79 (sol 23/52), věta 2–3 | hlavička *focus on: <aspekt>* + rámec esenční věty |
| 6. slovo, které v zadání není | *grey* 3× (Dagaz 2, Hagalaz 1), *roots*, *electricity*, *home-field*; 5 ownerových hlášení | neurčeno — dohledat (úhel „open with what is out of sight", obraz) |
| 7. tvrzení o člověku nebo jeho nitru | ručně ~7/79; 1 ownerovo hlášení | — (most „may be" a NO COLD READING drží většinu) |
| 8. definiční věta mimo podstatu runy | Blank *the stone that bears no mark*, Berkana *that crossing*, Raidho *worth noticing*; 3 hlášení | rámec esence × aspekt |
| 9. ozvěna zákazu verdiktu ve čtení | 4/79, vše Hagalaz (*not a verdict*, *not a punishment*) | zákazy verdiktu (kánon) |
| Ask: pojistka | *does not say* 27 · *leaves … open* 20 · *not a promise / verdict* 11 ze 131 (vše před v5.03) | most čtení × zákazy verdiktu (EVAL 2026-10-06 (8)) |
| Ask: oblast obecně · druhý Ask opakuje | 2 + 2 ownerova hlášení | Ask zná jen název oblasti |

**Společný kořen 1–5:** text, který dáváme pevně na runu nebo na oblast (otázka runy, odstavec Kolekce, podoba oblasti, obraz, aspekt),
se vrací doslova nebo jako totéž téma. Nejvíc je to vidět při opakovaném tahu téže runy. Souvisí s bodem 5 „Data uvnitř pokynů"
(BACKLOG „Prompt × návody výrobců").
**Hranice:** 87 z 92 čtení je ownerových, Hagalaz 25×; islandsky 4 čtení — IS tímhle průchodem neauditována. Typy 6–8 jsou ruční první
průchod jednoho čtenáře; Asky zatím jen strojem a z hlášení, ne přečtené.
⚠️ **OPRAVA téhož dne (owner: *„hlásíš spoustu starých věcí… jak to, že nevíš, co jsme už dělali?“*):** průchod bral všech 106 hlášení od 25. 9.
včetně vyřízených a nálezy neporovnal se záznamy. Typ 6 (*grey*, *roots*, *home-field*) a typ 8 (Blank, Berkana) byly **opravené už
2026-09-25 až 10-06**; typ 7 stál na větě, kterou owner 2026-09-25 označil za **NE-vadu**; typ 3 a zdroj ✦ (typ 2) owner **rozhodl**
2026-10-03; *electricity* je z obrazu Hagalazu. Platné zůstávají počty typů 1, 4, 5, 9 a Asku. Stav po položkách → BACKLOG „Audit promptu
2026-10-07 — zapsané nálezy“. Od teď se nález před hlášením dohledává (`scripts/utils/uz_vime.js`) a Stop-hook zprávu s návrhem bez toho nepustí.

## 2026-10-07 (2) — Otázka na oblast v Asku z pěti pohledů: „kde si toho všimnu“ a „kde je to těžké“ bez pojistky, „co to znamená“ s ní

Owner: *„zkus to. Jen anglicky a zkus víc variant otázky… z úplně rozdílných pohledů.“* Lab, produkce beze změny. Harness, otázky a vstup
→ `docs/eval/2026-10-07-ask-oblast/README.md`. Sol, v5.04, podoba oblasti připsaná v promptu u všech ramen, 3 ownerova čtení × 2 = n 6 na otázku.
**Data napřed:** v produkci 31 Asků na oblast (bez podoby v promptu, skoro všechny s dnešním tipem), pojistka v 19/31.

| otázka | pojistka | ozvěna otázky | podoba v odpovědi | slova ze čtení | ø slov | začátek |
|---|---|---|---|---|---|---|
| B0 dnešní tip (*make this image clearer*) | 4/6 | 0/6 | 4/6 | 0,27 | 63 | různý |
| P1 runa → oblast (*how does {rune} affect it*) | 4/6 | 3/6 | 4/6 | 0,28 | 54 | *„In this reading, [runa] does not…“* |
| P2 výklad (*what does this reading mean for it*) | 5/6 | 0/6 | 4/6 | 0,26 | 58 | *„For healing and…“* |
| P3 podoba (*how does this image relate to {face}*) | 3/6 | 3/6 | 6/6 | 0,33 | 59 | různý, od obrazu |
| P4 všední den (*where might I notice this in my days*) | **1/6** | 0/6 | 4/6 | 0,25 | 55 | ⚠ *„You might notice…“* 6/6 |
| P5 těžkost (*where does this get hard for me*) | **1/6** | 0/6 | 4/6 | 0,30 | 59 | *„The hard part…“* 2× |

**Co z toho je vidět:** otázka po VÝZNAMU nebo VLIVU (P1, P2) tlačí odpověď k verdiktu, který pravidla zakazují — sol začne nebo skončí
pojistkou (*„Raidho does not promise healing or set a timetable“*). Otázka po POZOROVATELNÉ chvíli (P4) nebo TĚŽKOSTI (P5) je zodpověditelná
v mezích pravidel — odpovědi jsou konkrétní (*„a day when you have less energy than you expected, yet still have room for what matters“*),
pojistka 1/6. P4 ale začíná pokaždé stejně (bod 4 zásad „Slova, která dáváme modelu“). P3 drží obraz i podobu, pojistka napůl.
**Hranice:** n = 6 na otázku, tři čtení, sol, EN; B0 tu nese podobu v promptu (produkce ne). Kvalitu posuzuje owner — texty ukázané v hlášení.
**Owner po přečtení textů (2026-10-07):** *„těžkost a všední den znějí nejlíp.“* Zásada → `RUNAR_DESIGN.md` „Slova, která dáváme modelu“ bod 5.

## 2026-10-09 (1) — Pojistka v Asku po v5.03 změnila hlavně TVAR: „leaves room for…“; měřák labu ten tvar neviděl (oprava 2026-10-06 (8))

**Proč:** owner 2026-10-08 (hlášení 744028f4) u Asku na Laguz: *„It leaves room for you to recognize it, or not. Z čeho se tvoří na
konci obě možnosti… nevím, jestli je úplně třeba říkat ‚or not‘.“* Monitor ten den: „leaves … open“ 3/7 Asků, *„v promptu není“*.
**Útok na měřák (§27):** regex labu (`docs/eval/2026-10-06-ask-otazky/rozbor_slova.js` `RE_DNS`) bere *does not say / tell / settle / show /
decide*, *leaves … open* a *not a promise / verdict*, ale **ne** *leave(s) room for…*, *keeps … open*, *both possibilities*, *does not point /
prove / promise*. Přepočet týchž dat užším-ale-úplnějším detektorem (všechny shody přečteny; vyřazeno *makes room for the other's pace* —
obsah, ne pojistka):
| data | n | regex labu | detektor s „leaves room for“ | z toho *leave(s) room for* |
|---|---|---|---|---|
| lab 2026-10-06 (8) P0 produkce | 30 | 26 | 28 | 3 |
| lab PRAVIDLA = znění v5.03 | 30 | 14 | 20 (P0 × PRAVIDLA p = 0,021) | 8 (p = 0,18) |
| lab P5 charakter bez zákazů předpovědi | 30 | 14 | 19 | 2 |
| lab P6 čtení bez poslední věty | 30 | 14 | 22 | 4 |
| produkce sol, čtení < v5.03 (25. 9. – 7. 10.) | 82 | 54 | 59 (72 %) | 9 (11 %) |
| produkce sol, čtení ≥ v5.03 (7. – 8. 10.) | 17 | 6 | 12 (71 %, p = 1,0) | 8 (47 %, p = 0,001) |
**Závěr:** v5.03 v labu pojistku snížilo **míň, než stálo** (28 → 20 místo 26 → 14) a část poklesu byl přesun do *„leaves room for…“*.
V produkci je podíl pojistky stejný a *„leaves room for…, or not“* je teď její hlavní tvar — ownerovo *„or not“* je přesně ona.
Žádná z pák 2026-10-06 (8) ji neodstraní (všechny 19–22 ze 30); nejsilnější je charakter bez *„never predicts / does not guarantee /
never hand a conclusion“* (P5).
**Hranice:** produkce po v5.03 = 17 ownerových Asků na 10 čteních, jiná skladba otázek než před (otázky na význam, „…with the past“) →
srovnání podílu je předběžné; tvar *leaves room for* drží i v labu se stejnými otázkami (3 → 8, n. s.). Rozhodnutí v5.03 se tím nemění —
podmět „the rune“ (ownerova původní výtka) ubyl (8 → 1, p = 0,026, `docs/eval/2026-10-06-ask-pojistka/`). Detektor pro příští lab:
`scripts/utils/pojistka.js` (tenhle přepočet; na datech labu dává P0 28/30 a PRAVIDLA 20/30 jako tabulka výš), ne `RE_DNS`. Data mimo repo (`~/runar-eval/zaloha/2026-10-06_12b7cce8_v2_A.json`, export Asků z DB). <!-- doc-links:ok 2026-10-09 osobní data mimo repo (nesou jméno), DECISIONS 2026-08-08 -->

## 2026-10-09 (2) — Rozbor čtení: Haiku 5.5 × gpt-6-luna na stejném vstupu (5 čtení) — Haiku s přemýšlením 1 platný nález, luna 0 ze 7

**Proč:** owner (hlášení b4365ead): *„Zjisti všechno o Haiku 5.5… Jak by se dal Haiku porovnat s Luna 6?“*, *„13. ano porovnej“*.
**Vstup:** uložené luniny rozbory (`gpt_reviews`) vstup nemají — zadání čtení se neukládá — proto 5 nových čtení produkční cestou
(`buildReadingPrompt` + `_thoughtLine` + `_lengthReminder`, sol, EN: Laguz · Mannaz · Ehwaz · Ingwaz · Thurisaz) a všichni soudci dostali
payload jako `_gptReviewPayload` (rubrika B–F česky, bez ✦ — jako tehdy v appce). 20 volání: 5 sol + 5 luna + 10 Haiku.
Skutečné vady v těch čteních (přečteno): opis podoby oblasti *„what gives … the will to continue“* (Mannaz, Ingwaz), opis otázky runy
*„…you do not strike back“* (Thurisaz).
| soudce | cena za 5 | čas / rozbor | platné nálezy | neplatné / sporné | poznámka |
|---|---|---|---|---|---|
| gpt-6-luna (reasoning none) | $0,0008 | ~2 s | 0 | 7 | „doslovný opis“, který doslovný není; „chybí ✦“ (rozbor ✦ nedostal); sebevyvracející nález |
| Haiku 5.5, výchozí (přemýšlí sám) | $0,0040 | 5–8 s | 1 (opis otázky runy) | 0 | 1 000–1 580 výstupních tokenů na 1–2 věty; 1× slovo rusky („руну“) v češtině |
| Haiku 5.5, `thinking: disabled` | $0,0019 | 3–5 s | 0 | 9 | vypisuje i prázdné kategorie (rubrika zakazuje), opis otázky runy přehlédl; 1× „руна“ |
Opis podoby oblasti nenašel nikdo. Vstupní tokeny Haiku ~1,45× luny na tentýž text (jiný tokenizér) — proto i „bez přemýšlení“ dráž.
**Závěr:** pro rozbor je kandidát jen Haiku 5.5 s přemýšlením (přesnější než luna, ~0,08 c za rozbor); bez přemýšlení je horší než luna.
Riziko: azbuka v českém výstupu (2 z 10 rozborů). **Vedlejší nález opraven:** rozbor nedostával řádek ✦, i když ho zadání chce → od dneška
ho dostává (`_gptReviewPayload`). Pro `tree-update` plyne: Haiku 5.5 s `max_tokens` 200 jen s `thinking: disabled` (jinak prázdný text).
**Hranice:** n = 5, EN, jeden běh; kvalitu posuzoval CODE-tune čtením (owner čte texty — stránka vedle sebe mimo repo). Ceny
z ceníku Anthropicu / OpenAI k 2026-10-09. Data mimo repo: `~/runar-eval/haiku-luna-2026-10-09.json`. <!-- doc-links:ok 2026-10-09 data mimo repo (texty čtení), skript ve scratchpadu session -->

## 2026-10-09 (3) — Podoby oblastí: vrácené Purpose [3] a Career [4] bez „long“ (sol, 20 čtení) + které podoby se opisují doslova

**Proč:** owner k v5.05 (podoby s délkou pryč): *„purpose vrátit a career taky, ale upravené… u pozor. Proto jsme trénovali, jak věty
napsat správně, aby je model lépe používal. Najdi to a navrhni změny.“* · *„13. ano“* (ověřit na solu).
**Napřed data (produkce EN od 2026-09-25, 80 čtení s podobou, 1–6 na podobu):** doslovný opis podoby ≥ 4 slova nejčastěji u podob
psaných jako vedlejší věta — Purpose [2] *„what gives someone the will to continue“* 2/4 (*„What gives you the will to continue may
be…“*), Healing [1] *„what gives strength back“* 2/5, Healing [2] *„the pace that can be kept“* 1/2; podoby jako holé jméno (*„slow
change“*, *„making and shaping“*, *„going and direction“*) 0. Vzorek malý — kandidát, ne nález.
**Pokus** (produkční cesta, sol, EN, podoba vynucená v sandboxu, Kuky/Isa, General Guidance; tvrzení o čase = years/long/decades/
lifetime/always/since v těle čtení):
| podoba | n | tvrzení o čase | opis ≥ 4 slova | poznámka |
|---|---|---|---|---|
| Purpose „an aim in view“ (idiom, Ngram 0,02 / mil.) | 6 | 0 | 3 | obrat skoro v každém čtení, místy neohrabaně (*„For an aim in view, the jar…“*) |
| Purpose „an aim being pursued“ → **nasazeno** | 6 | 0 | 1 | přirozeně (*„Perhaps an aim you are pursuing has room…“*) |
| Career „skill and the practice behind it“ → **nasazeno** | 4 | 0 | 0 | *„how your skill grows through practice“* |
| Career „a skill put to use“ | 4 | 0 | 0 | zateklo do věty o runě (*„Fehu signifies the value of what can be put to use“*) |
**Závěr:** délku nesl „long“ — bez něj 0 z 20. „years of practice“ je v angličtině běžná kolokace (Ngram 0,2 / mil.) → sledovat
v monitoru u Career [4]. **Hranice:** EN, sol, n = 4–6 na znění, jedna dávka; IS jen ověřena korpusem (is-grammar-qa týž den
nedostupné). Data mimo repo: `~/runar-eval/podoby-bez-delky-2026-10-09.json`, `…-p3b-…json`. <!-- doc-links:ok 2026-10-09 data mimo repo (texty čtení), skript ve scratchpadu session -->

## 2026-10-15 (1) — Čtení bez korekcí (pokus ownera): sol bez bloku nedělá chybné tvary ze seznamu; obecný vliv bloku neprokázán (n = 8 + 8)

- **Zadání (owner 2026-10-15):** *„GPT dělá lepší čtení, než dělal Opus, je pravděpodobné, že nepotřebuje tolik korekcí… máme teď nová
  čtení od Ingy, udělej identická čtení bez korekce, jak si povede“* · *„12. ano. a ještě to porovnat s jejíma čteníma.“*
- **Záměr:** dělá sol bez bloku korekcí chyby, které korekce opravují? Ano → blok zůstává; ne → zúžit na korekce, které zabírají.
- **Vstup:** Ingina 4 IS čtení (13.–15. 10.: Ingwaz, Kenaz, Ehwaz, Sowilo) se stejnými vstupy (runa, oblast, hledání, záměr, životní
  runa, úhel, ženský rod; Sowilo bylo „pro někoho“ → jméno „þú“), každé 2× s blokem (29 korekcí) a 2× bez; gpt-6-sol, 16 volání.
  `gen_batch.js --korekce db` (přepínač přidán týž den — do té doby žádná dávka korekce do promptu nedávala). Bez věty ✦ (testeři ji mají).
- **Cena bloku:** vstup 2 960–2 980 tokenů s blokem proti 2 080–2 120 bez → blok ≈ 900 tokenů, ~43 % vstupu IS čtení.
- **Výsledek:** chybný tvar ze seznamu korekcí — s blokem 0/8, bez 0/8. Greynir posouzený ručně: s blokem 0 skutečných chyb (falešné:
  „skáninni“, „fái“), bez bloku 2 — „aukin skýrleiki“ (shoda rodu, má být „aukinn“) a „skófarins“ (má být „skófarsins“), ani jedna
  ze seznamu. Ingina originální čtení (s blokem): 1 chyba ze seznamu, „bertum“ — čtení z 13. 10., korekce vznikla až 14. 10.
- **Produkce od 9. 10. (sol):** 11 IS čtení, chybný tvar ze seznamu 1× (týž „bertum“). **28 z 29 korekcí je z doby Opusu**
  (13. 5.–26. 9.), za solu přibyla jediná.
- **Hranice:** n = 8 na rameno; 0 : 2 obecných chyb je v šumu. Nízká základní míra: kontexty pro většinu korekcí v 16 čteních
  nenastanou, takže „0 ze seznamu“ neříká, že by sol ty chyby nikdy neudělal — říká jen, že se tu neukázaly. Ověřeno, že detektor
  zásah umí najít („bertum“ v originálu našel).
- **Co z toho (návrh, rozhoduje owner):** blok nemazat naslepo; zúžit ho na korekce, které sol skutečně dělá (kandidát: 28 opusových
  pryč, „bertum“ zůstává; nové chyby z živých čtení přidává owner jako dosud); obecný vliv bloku (0 : 2) ověřit větším vzorkem jen
  na ownerovo ano. Data: `~/runar-eval/korekce-pokus/` (mimo repo).
- **Výhrada (2026-10-16, kontrola promptu):** `gen_batch.js` skládal single bez otázky runy a bez připomínky délky (chyběly translations),
  takže pokus neběžel na přesně produkčním promptu. Obě ramena stejně → závěr o korekcích tím nedotčen; nástroj opraven týž den.

## 2026-10-16 (1) — Pravidlo v systémovém promptu × v user promptu (sol, EN): obojí 5/5, bez pravidla 0/5 — sol systém neignoruje

- **Zadání (owner 2026-10-16):** *„9. ano a udělat test. jen EN jako první“* — ověřit větu CLAUDE.md „user prompt model poslechne, system
  prompt ignoruje“ (vznikla 2026-06-12 na jednom testu s Claudem; výrobci učí opak).
- **Záměr:** systém ≈ user ≫ kontrola → věta na solu neplatí; user ≫ systém ≈ kontrola → platí.
- **Pokus:** single Kenaz EN, úhel 2, gpt-6-sol, 3 ramena × 5: věta *„Somewhere in the reading, mention the colour blue once.“* na konci
  systémového promptu (`gen_batch --sys-extra`) · na konci user promptu (`--prompt-extra`) · nikde (kontrola). 15 volání. Umístění ověřeno
  v uložených promptech (systém 5/5 jen v systému, user 5/5 jen v promptu).
- **Výsledek:** „blue“ ve čtení — systém **5/5**, user **5/5**, kontrola **0/5**. Kontrola ukazuje, že model modrou sám nepřidává
  (detektor má smysl). Modrá šla pokaždé do obrazu (plamen, okraj šálku, světlo), přirozeně.
- **Hranice:** jedno jednoduché aditivní pravidlo bez konfliktu, EN, n = 5, jedna runa. **Neměřeno:** pravidlo v systému proti
  protichůdnému pokynu v user promptu (tam může rozhodnout poloha a konkrétnost — výklad původního nálezu z června), IS.
- **Co z toho:** CLAUDE.md „Reading systém“ přepsán; V3 může stálá pravidla nechat v systému (BACKLOG „Nápady pro V3“, bod 9).
  Data: `~/runar-eval/system-vs-user/` (mimo repo).

## 2026-10-21 (1) — Vegvísir: runa × MÍSTO drží runu (8/9); otázka balíčku k místu čtení přetáhne k tématu balíčku (7/9)

- **Proč:** směr DECISIONS 2026-10-21 (5) — rameno = vytažená runa × místo bez vlastního významu; riziko, že téma balíčku (The Thresholds ·
  Under the Mountain · The Ties) přetáhne čtení jako 2026-09-27 (1), (2). Owner: *„pusť test teď“*, *„tady na 5.5 v EN“*.
- **Jak:** prompt ramene = lab 2026-09-27 v3 (EN, bez středu), místo věty uživatele karta místa; systém produkční `buildSysPrompt` EN.
  3 runy mimo témata balíčků (Isa, Fehu, Sowilo) × 3 místa (jedno z balíčku) × A bez otázky / B s otázkou balíčku (obrácená páka, §25).
  Čtení psali dva subagenti Opus 5.5, každý jen jednu variantu a bez znalosti testu; slepý soudce (subagent) viděl runu, klíčová slova a místo,
  ne variantu ani otázku. Data `docs/eval/2026-10-21-vegvisir-misto/`.
- **Výsledek:** A — runa vede scénu 8/9 (průměr 1,89 z 2), únik k tématu balíčku 0/9, kvalita 4,0/5 · B — runa vede 6/9 (1,67), únik
  k tématu balíčku 7/9, kvalita 3,3. Studené čtení 0/18, otevřený konec 8/9 v obou. Místo samo runu nepřebije; teprve otázka balíčku vnese
  téma (The Ties → „co přechází mezi lidmi“: u Sowila se objevil druhý člověk na druhém konci lana, A ho nemá).
- **Hranice:** n = 9 na variantu, jeden soudce, jen EN, jen Opus 5.5 (ne sol), runy vybrané MIMO témata balíčků — runa shodná s tématem
  místa netestována (2026-08-25 tam vyšlo 0/4). Kritérium „jiné téma“ soudce znal i se jmény témat, ale variantu ne; rozdíl A × B je proto
  platný, absolutní čísla méně. Netvrdí se nic o IS ani o tom, jak místo zadá uživatel (volba × los).
- **Co z toho plyne pro směr:** karta místa BEZ otázky (owner bod 8, potvrzeno). Otázka patří do Asku, ne na kartu.

## 2026-10-21 (2) — Vegvísir: runa, která tématem místa sedí (Gebo × lano), má pořád co dělat (4/5); v cizím místě si Gebo přimyslí člověka (5/5)

- **Proč:** owner *„ano, otestuj i Gebo × lano“* — 2026-08-25 (TEST 37) vyšlo „shoda místa a runy = 0/4 pro runu“; kolo (1) testovalo jen runy
  mimo témata balíčků.
- **Jak:** stejný prompt jako (1), varianta A (místo bez otázky). Gebo × lano mezi břehy (The Ties, téma runy) a kontrola Gebo × kovárna
  v jeskyni (Under the Mountain), 5 + 5 promptů zamíchaných, jeden generátor (Opus 5.5) a jeden soudce bez znalosti testu.
  Data `docs/eval/2026-10-21-vegvisir-misto/` (shoda.js, cteni_shoda.txt, slepy_soudce_shoda.json).
- **Výsledek:** lano — runa vede 1,8/2, přidává něco, co místo samo nemá, 4/5 (jednou jen popis lana), cizí člověk 1/5, kvalita 4,0 · kovárna —
  runa vede 2,0, přidává 5/5, ale **cizí člověk 5/5** (oheň zahrabaný „pro toho, kdo přijde ráno“), kvalita 3,8. Studené čtení 0/10.
  Gebo v místě svého tématu ukáže rovnováhu na věci samé (dva konce lana nesou jeden druhý); v cizím místě dar vyjádří přes nepřítomného
  dárce nebo příjemce.
- **Hranice:** n = 5 + 5, jeden generátor viděl opakované prompty (mohl variovat schválně, ač zadání říkalo ne), jeden soudce, EN, Opus 5.5.
  TEST 37 (2026-08-25) měřil jiný mechanismus (místo vybrané podle runy v grafu krajin, se vstupem uživatele) — tohle ho nevyvrací, jen
  ukazuje, že u samotné karty místa se to neopakuje. Jestli je „cizí člověk“ vada, nebo poctivý obraz daru, je obsahová otázka (owner).

## 2026-10-21 (3) — Vegvísir: celá cesta (8 ramen runa × místo) = osm pohlednic, ne cesta; owner: „moc se to nezměnilo“ — znovu odloženo

- **Proč:** owner k (1)–(2): *„neprijde mi to az tak rozdilene od toho co delaji normalni cteni“* → *„poskládej celou cestu“*.
- **Jak:** 8 run losem ze sáčku (všech 25) × 8 míst, jak by je vybral člověk (testovací texty CODE-read, ne kánon), prompt ramene (1) A, mezi rameny
  nic nepřenášeno (2026-09-27 (3)), bez vstupu člověka. Jeden generátor Opus 5.5, EN. Data `docs/eval/2026-10-21-vegvisir-cesta/`.
- **Výsledek (čteno CODE-read a ownerem, bez soudce):** ramena o sobě nevědí — celek nepřidá nic nad osm obrazů. Všech 8 začíná vzorcem
  „<Runa> stands / finds / comes / rests…“ (runa vstupuje jako postava); stopy cizích lidí („where hands have gripped“, „many feet“) 4/8.
  Runa silně u Isa, Sowilo, Blank, Fehu; slabě u Kenaz × lano, Ingwaz × loď, Ehwaz × lávka — náhodná dvojice si nemusí mít co říct.
- **Owner 2026-10-21:** *„já jsem čekal, že to budou spíš pohlednice. moc se to nezměnilo od toho, co jsme měli předtím. zapiš a zase to odložíme.“*
- **Kde navázat:** co z ramen udělá cestu, otevřené — vlastní věta člověka ke každému místu (2026-09-27 (3) „vlastní slova později“), nebo
  nesená věc mezi rameny („materiálová fráze“, RUNAR_DESIGN Vegvísir, od 2026-09-27 jen varianta). Netestováno ani jedno.

## 2026-10-22 (1) — Ask: řádek aspektu (klíčové slovo) váhu má — „luck“ ho 5/5 přetáhne; u čtení Perth ale „skryté“ drží hlavně text čtení

- **Proč:** owner nad čtením Perth 0d445541 (hlášení 9690cf12): *„kam se prokreslilo klíčové slovo? … pokud tohle má váhu na odpověď“*;
  test *„6. ano“*. Kódem dohledáno: Ask 1 bral slova z textu čtení („out of sight“, „comes into view“), Ask 2 nit z Ask 1.
- **Pokus (obrácená páka, §25):** týž Ask 1 („Will i get the job a applied for?“) nad týmž čtením, prompt z produkčního balíčku
  (`prompt_skladani.mjs`), gpt-6-sol jako `claude-proxy`, 5× na verzi: (a) produkce — aspekt „the hidden coming to light“; (b) bez aspektu
  (jen seznam klíčů runy, „chance“ první); (c) aspekt „luck“. Data: `docs/eval/2026-10-22-ask-aspekt.json` (všech 15 odpovědí).
- **Výsledek:** luck / chance / fate v odpovědi — (a) 0/5 · (b) 0/5 · (c) **5/5**. „Perth cannot tell you …“ 15/15 ve všech verzích.
  Půlka „coming to light / into view“ (a) 3/5 · (b) 2/5 — při n = 5 šum.
- **Závěr:** aspekt v Asku váhu má — přesunutý na „luck“ změní význam odpovědi pokaždé. U tohoto čtení ho ale (a) proti (b) neodliší:
  od štěstí odpověď drží už text čtení (skryté, „out of sight“). Forma „Perth cannot tell you“ nese pravidlo „no new divination“,
  ne klíčové slovo.
- **Hranice:** jedno čtení, jedna otázka, EN, sol, n = 5 na verzi; Ask 2 netestován; neplatí pro čtení, jehož text význam nenese.

## 2026-10-22 (2) — Ask bez věty „Do NOT give a new divination“: 3/3 dál nevěští (drží to charakter a text čtení) — pravidlo zatím netestované jinde

- **Proč:** owner: *„když odstraníme nevěštit, máme vůbec otestováno, že to potřebuje? udělej 3 čtení bez nevěštit.“* Dohledáno: test
  neexistoval. Zákaz stojí dvakrát — v `RP_ASK.rules` („Do NOT give a new divination“) a v charakteru (`DEF_CHAR_EN.never`: „Rúnar never
  predicts fate“).
- **Pokus:** jako 2026-10-22 (1) verze (a) (produkce, Perth, „Will i get the job a applied for?“), jen v pravidlech Asku místo „Do NOT give
  a new divination and do not draw new runes.“ stojí „Do not draw new runes.“; charakter beze změny. gpt-6-sol, 3 odpovědi.
  Data: `docs/eval/2026-10-22-ask-bez-nevestit.json`.
- **Výsledek:** 3/3 bez předpovědi („Perth does not say / cannot tell you / does not show whether you get the job“), stejná stavba jako
  s pravidlem (5/5 v 2026-10-22 (1)).
- **Závěr / hranice:** u této otázky a tohoto čtení věta v Asku nic nepřidává — drží to charakter a text čtení. Netestováno: tlačivější
  otázky („just tell me yes or no“), jiné runy, IS, odebrání i věty v charakteru; n = 3.

## 2026-10-26 (1) — Opakované fráze v posledních 100 čteních: 3 ze 4 přijdou z promptu té doby (los), jedna je modelu; rámec „this may be“ stojí v každém pokynu konce

- **Proč:** krok 6 plánu „z čeho se skládá čtení“ (owner 2026-10-22 „10. ano 11. ano“) — odkud se berou opakované fráze, bez nových volání.
  Owner 2026-10-26: *„11 je málo. tak to vem na posledních 100 čtení.“* (11 = EN čtení pod posledním EN promptem v5.17–v5.20.)
- **Jak:** `node scripts/fraze_z_historie.js --posledni 100 --min 5`. Každé čtení dostane prompt SVÉ verze (`scripts/utils/prompt_doby.js`:
  commit podle `prompt_version`, builder té doby + losy z `prompt_draws`); u všech 100 se prompt složit povedlo. Fráze = 4+ slov ve ≥ 5
  čteních. Pokus: výskyt, kde fráze v promptu stála, proti čtením, kde nestála — zvlášť sol a Claude.
- **Data:** 100 EN čtení jedné runy 2026-09-25 → 2026-10-23 (sol 77, Claude 23), bez odhlášených z analýzy. Výstup s frázemi mimo repo
  (složka runar-eval v domovské složce; skript ho vytvoří znovu stejným příkazem).
- **Výsledek:**
  1. „is the rune of“ (10 čtení) — **z promptu**: sol 5/5, kde ji esenční řádek předepsal („begins "<Runa> is the rune of"“, los slovesa),
     4/72 bez ní. Obrácená páka sedí: bez fráze v promptu skoro zmizí.
  2. „at the edge of (the)“ (7 čtení) — **z promptu**: pokyn úhlu „Open at the edge of the image…“ (los úhlu); sol 3/12 s ním, 3/65 bez něj.
  3. „you see the whole“ (5 čtení, 5 run) — **model sám**: v promptu žádného z těch čtení nestála.
  4. „this may be a“ (8 čtení) — samá pomocná slova, filtr ji nebere; „this may be“ ale stojí ve VŠECH pokynech konce (`ENDING_HEAVY` /
     `ENDING_OPEN`, „names what this may be {L}“) → v promptu všech 100 čtení, srovnání bez ní nejde.
- **Útok na nástroj (§25 B):** výpis n-gramů bez filtrů — čtveřic ve ≥ 5 čteních je jen 5 (medián čtení 61 slov); první verze filtru
  (2 plnovýznamová slova) vyhodila právě rámce „is the rune of“ a „at the edge of the“ → filtr na 1 slovo. Známá kladná fráze („is the rune
  of“ z losu slovesa) vyšla jako „z promptu“ — nástroj ji pozná.
- **Hranice:** n malé (3–12 čtení s frází v promptu); verze nesou víc změn naráz a model se v čase střídal (proto zvlášť sol/Claude);
  fráze kratší než 4 slova a myšlenka ✦ se neměřily; jen EN (IS jedné runy pod posledním promptem 2 čtení).

## 2026-10-26 (2) — Kontrola kroku 6 (2026-10-26 (1)): nástroj měří správně, ale otázka byla položená na špatných datech a špatnou optikou

- **Proč:** owner: *„projdi to kontrolou nejen výstupy, ale i jestli celá metodika byla správná, jestli je to vůbec k něčemu.“*
- **Nástroj (obstál):** délka složeného promptu proti vstupním tokenům, které model účtoval, u všech 100 čtení: sol 4,1–4,4 znaku na token
  ve všech verzích, Claude 4,7–5,3 (jiný tokenizér) — žádné čtení mimo vzorec svého modelu. Délka nedokazuje obsah, ale hrubou chybu
  skládání (chybějící blok, jiná verze) by ukázala. „is the rune of“ 5/5 vs 4/72 drží (Fisherův test p ≈ 6·10⁻⁶).
- **Vady metodiky:**
  1. **Data jsou ownerovy testy, ne čtení lidí:** 94 ze 100 čtení je z jednoho účtu, 2 účty celkem; Hagalaz 28/100 (owner testuje jednu
     runu záměrně); 19 obrazů taženo víckrát (54 čtení). Opakování frází tu odráží plán testů, ne chování appky u lidí.
  2. **Doslovné čtveřice slov jsou špatná optika:** čtení mají medián 61 slov, doslovně se opakuje málo. Co se opakuje doopravdy, je
     KOSTRA: začátky čtení („at the“ 8×, „you stand“ 7×, „beneath the“ 6×), začátky vět („what you“ 12×, „Hagalaz names“ 11×) a obraz
     opsaný doslova (≥ 4 slova obrazu ve 30/100 čtení — to už měří monitor ozvěn). Kratší fráze („what remains“ 11×, „you cannot see“ 7×)
     filtr 4+ slov nevidí.
  3. **Nález = známé páky:** 2 ze 3 „z promptu“ jsou losy, které tam dáváme záměrně (sloveso esenčního řádku, úhel); nové je jen „you see
     the whole“ (n = 5). „at the edge of“ 3/12 vs 3/65 je na hraně (p ≈ 0,045) a fráze byly vybrané podle četnosti — výběr sílu přeceňuje.
  4. **Silná stránka, která zůstává:** u losovaných pák je „v promptu / mimo“ rozdělené náhodou uvnitř téže verze — to je skutečný
     randomizovaný pokus, ne jen shoda v čase. U pevného textu promptu (mění se jen s verzí) takový pokus z historie nejde.
- **Závěr:** `prompt_doby.js` (prompt čtení své doby) je k užitku — přesně přiřadí slovo ke kusu promptu, ověřeno. Hledání doslovných frází
  na ownerových testech k rozhodování o promptu nestačí. Užitečné bude až na čteních lidí a měřené po kusech promptu a kostře věty.

## 2026-10-27 (1) — Výklad: věta „každá runa vstoupí do scény detailem“ přenese význam Ansuz z abstraktního slova do zvuku scény (4/5 → 0/5 abstraktně)

- **Proč:** Norny a3692c86 (Hagalaz · Ansuz · Sowilo, Career & Creativity): *„a voice is taking shape among the fallen branches“*. Owner:
  *„voice tam klidně být může, ale měl by být spojený s tím, že je slyšet praskání větví … najdi řešení, nejlepší řešení!“*, test „13. ano“.
  Data předem: Ansuz = „voice“ v 8/11 výkladů a 5/11 čtení jedné runy (volbu významu tedy nebereme); „voices“ z pokynu Norny neprosakuje
  (v 59 Nornách bez Ansuz „voice“ 2×).
- **Pokus:** `docs/eval/2026-10-27-vyklad-detail/` (test.js, prompt_A/B, vystup, slepe + klíč, slepý soudce). Tentýž vstup jako a3692c86
  (runy, oblast, záměr, obraz z losu), produkční `buildNornsPrompt`, gpt-6-sol jako proxy, 5 + 5. B = A + za řádek obrazu: *„Each rune
  enters this same scene through something the scene itself can do — a sound, a light, a movement, a mark. Its meaning is read from that
  detail; never lay the meaning on the scene as an abstract word.“* Předpověď předem: v B ponese Ansuz a Sowilo význam detailem častěji.
- **Výsledek (slepý soudce, subagent, viděl jen texty):** Ansuz abstraktně A 4/5 → B 0/5 (B 5/5 „mixed“: zvuk větví ve větru + slovo
  „voice“ navrch — přesně ownerovo „spojený s praskáním větví“); Sowilo detailem A 3/5 → B 5/5; „patří do scény“ průměr A 2,8 → B 4,2
  (B nejhůř 4, A nejlíp 3). Ansuz abstraktně 4/5 vs 0/5: Fisher jednostranně p ≈ 0,024.
- **Hranice:** jeden vstup (Norny, jedna trojice run, jeden obraz), n = 5 na variantu, jeden soudce; EN; jen Norny — Kříž, Horseshoe
  a Yggdrasil mají týž blok obrazu, netestováno; řádek ✦ vynechán. Volba „voice“ zůstává (B ji drží, jen ji ukotví ve zvuku).

## 2026-10-28 (1) — Hlas ve čtení: v4, nastavení rituálu a intonační značky od modelu výkladu — měřitelně se mění jen výška a tempo, ne intonace

- **Otázka (owner 2026-10-28):** *„dají se pro čtení měnit intonace hlasu? Dokázal by to model pro výklad udělat? … najdi možnosti a ověř je“*.
- **Pokus:** `docs/eval/2026-10-28-hlas-cteni/gen.js`, 2 skutečná single čtení (EN Hagalaz 349 zn., IS Isa 333 zn.), 4 varianty: R0 dnešek
  (EN v2 / IS v3, `el_voice.ts`), R1 v4 s dnešním nastavením, R2 v4 jako rituál pro čtení (značka klidného hlasu, stabilita 0,5, rychlost 0,9,
  „…“ mezi větami), R3 = R2 + 2–4 značky ze seznamu, které vložil model výkladu (sol). 8 nahrávek ≈ 1 100 kreditů, sol 2× ~350 tokenů.
- **Výsledek (Web Audio: ticho, výška autokorelací po 40 ms):**
  | | délka s | nejdelší pauza s | průměrná výška Hz | rozsah výšky 5–95 % (půltóny) |
  |---|---|---|---|---|
  | EN R0 / R1 / R2 / R3 | 27,0 / 24,3 / 23,6 / 24,1 | 1,28 / 1,10 / 0,86 / 1,08 | 103 / 110 / 117 / 112 | 13,1 / 16,4 / 17,2 / 15,2 |
  | IS R0 / R1 / R2 / R3 | 29,1 / 27,7 / 25,3 / 25,8 | 1,22 / 0,98 / 0,92 / 1,02 | 101 / 128 / 132 / 128 | 13,3 / 17,1 / 16,5 / 14,6 |
- **Útok na měřák (§25 B):** půlka proti půlce téže nahrávky: výška se liší o 0–9 Hz, rozsah až o 4,4 půltónu (IS R0 17,6 / 13,2).
  Rozdíly rozsahu mezi variantami (2–4 pt) jsou tedy **v šumu** — „víc intonace“ se tvrdit nedá. Nad šumem je jen **výška**: v4 mluví
  ve čtení výš (EN +14 Hz, IS +27–31 Hz ≈ 4 půltóny) a rychleji (dnešek je nejpomalejší). U rituálu (s pauzou `[long pause]`) IS C/F
  112/115 Hz — tam výš ne.
- **Model výkladu značky umí:** sol vložil 3 značky v EN i IS a **ani jedno slovo nezměnil** (pojistka: text bez značek = originál, 2/2).
  Měřitelný účinek oproti R2 ale žádný (výška, pauzy i rozsah v šumu). Nové volání stojí zlomek centu.
- **Co se netvrdí:** n = 1 čtení na jazyk, jen single; jak to zní, rozhodne poslech (`~/runar-eval/hlas-cteni/poslech.html` — doc-links:ok 2026-10-28 mimo repo, nese texty čtení). Že je
  intonace „stejná“, netvrdím — měřák rozdíl pod 4 půltóny nerozliší.
- **Pauza funguje jen značkou:** rituál ukázal, že v4 dlouhou pauzu udělá na `[long pause]` (1,50 s), ne na „… …“ (0,90) — DECISIONS 2026-10-28 (3).

## 2026-11-03 (1) — Ask převypráví čtení: zhruba 4 z 5 vět opakují čtení, u „What is this reading telling me?“ stejně jako u ostatních otázek

- **Proč:** hlášení 9ae64c17 (owner 2026-11-03: *„ASK je od toho aby vysvětlil, ne jen opakoval co bylo ve čtení“*) u Raidho efbf762b;
  owner *„6. ano“* k měření.
- **Data:** produkční DB, 300 čtení s Askem, 374 výměn; na „What is this reading telling me?“ / „Hvað segir þessi lestur mér?“ 9 výměn
  (2026-09-30 – 11-03, v4.80 – v5.22). Kontrola: 9 náhodných výměn na jiné otázky (pevné semínko).
- **Nástroj 1 — slovní (slepý):** opsané slovní trojice 3 % (cíl) × 2 % (ostatní 365), nová obsahová slova 72 % × 73 %, půlky ostatních
  2 % × 2 %. Ownerův případ efbf762b vychází 2 % / 71 % — **slepota dokázaná**: model opakuje parafrází („a road revealed one stretch at
  a time“ → „a road you can see only a little at a time“), trojice ji nevidí. Nulová transformace v pořádku (čtení proti sobě 100 % / 0 %).
- **Nástroj 2 — slepý soudce (subagent, nevěděl, které páry jsou cíl):** každou větu odpovědi označil „opakuje čtení i parafrází“ /
  „říká něco nového“. **Cíl: 37 z 46 vět opakuje (80 %), skóre „hlavně opakování“ 8/9. Kontrola: 26 z 33 (79 %), 8/9.** Dva páry dostal
  napoprvé s vadným čtením (můj export, viz DECISIONS 2026-11-02 (13) oprava měření) — po opravě oba „hlavně opakování“.
- **Nález:** vada není u té jedné otázky — převyprávění čtení je obecné chování Asku (i „Explain Nauthiz without the image“, „What does
  Fehu mean in this reading?“, „What is the dark water?“). V `RP_ASK.rules` pravidlo „vysvětli, co čtení neřeklo“ není; první věta
  říká *„speak from what the picture holds“* a pravidlo o zrcadlení *„stay with this reading“* — obojí táhne zpátky do čtení (neověřeno,
  že je to páka).
- **Hranice:** n 9 + 9, jeden soudce, bez druhého soudce a bez opakování; nerozlišuje, kdy je návrat k obrazu žádoucí (owner 2026-10-03
  chtěl u „clearer image“ zůstat u obrazu). Netvrdí se, která věta promptu to dělá.
- Podklady: skripty, vzorek a klíč soudce jen ve scratchpadu session (mimo repo, nezachovají se).

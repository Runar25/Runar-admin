# RUNAR_EVAL_LOG — deník pákových změn hlasu (prompt · pooly · pravidla)

**Jedno místo pro KAŽDOU změnu, která mění, jak Rúnar mluví.** Prompt, obraznost (pooly),
gramatická pravidla, voice profil, konce, openery. Cíl: po dalších čteních jde **změřit,
jestli změna zabrala** — ne hádat. Žádný drift: co se sáhlo do hlasu, stojí TADY, ne
roztroušené po git logu a cizích sandboxech. (KUKY 2026-08-02.)

## Kontrolní mapa hlasu — co lze měnit, co ne, nad čím uvažovat (§20: jen ukazatele)
**🗺 Vizuální mapa (snapshot):** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69 — celý oblouk vrstev (system prompt · reading stack · korekce → opus-4-8 → JSON), „kde ladit nuanci" a „co je mrtvé". Pravda = kód (character.js/config/proxy); po změnách přepublikovat na stejné URL. Detail → memory `prompt-map-artifact`.
✅ **Ověřeno 2026-08-07:** `runar_character` má **0 aktivních řádků** → file `DEF_CHAR` je živý hlas. Mrtvý loader (`app.js:1380`) zbývá smazat → `RUNAR_BACKLOG.md`.

⭐ **Rozhodující fakt:** model POSLECHNE **user** prompt, **system** prompt z velké části IGNORUJE.
→ Reálné páky jsou v USER promptu. Úpravy system promptu (identita, zákazy, voice profil) mají
SLABÝ účinek — proto „přepiš voice profil" většinou nehne jehlou; sáhni na user-prompt pooly.

**🔄 PÁKY (tady se hlas reálně mění — každou změnu loguj níž):**
- Obraznost: `SEASON_POOLS` / `_seasonalImagery` (utils/character.js)
- Úhel otevření: `READING_ANGLES` / `_randomAngle` (utils, jen single)
- Tvar konce (dle valence): `ENDING_*` / `_endingShape` (utils)
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
- IS gramatika = 🔒 (musí být správně, ne stylová volba) — enforcement přes korekce + is-grammar-qa
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
| **angle** | 18.8. vypnutí = **změna beze změny** (pestrost, n≈300, mez citlivosti 3,2 b.) · plochy bez úhlu čistší (Ask 4 % · spread 10 % · single 18 %) · 21.8. tvrzení „úhel je kotva k obrazu" **NEDOLOŽENO** (n=8, jeden běh) |
| **describe** | 20.8. zavedeno do `focused`: pojmenování 0/8→6/8 EN (p=0,0035), 0/20→8/20 IS (p=0,0016) · 21.8. ablace: bez něj EN 4/8→**0/8** — jediné, co pojmenování drží |
| **thread** | 23.8. zavedeno (v4.9): vztahová vazba sousedních pozic spreadu — náhrada za esenční řádek, který ve spreadech říkal „pojmenuj" proti záměrnému „nejmenuj" (KUKY: zatím nejmenuj; jména nese UI pozic). Baseline před: svět norns 1,63/1,75 · kříž 1,25/1,50 — měření po v4.9 následuje |
| **coldread** | 20.8. ablace: bez něj studené čtení EN 0→3/8, IS beze změny · 21.8. žebřík: **v minimu nekupuje nic** (0/8 před i po), vydělává až když jsou přidané bloky, které ke tvrzení svádějí |
| **length** | 21.8. ablace: vypnutí → pojmenování EN 4→**8/8**, IS 0→**6/8**, ale délka 2× (58→97, 40→92 slov) · 21.8. losovaná 3/4 věty zavedena · IS volnější rozpočet: pojmenování 7/8, ale soulad padá na 4/8 (houpačka, n=8) |
| **domain** | 21.8. jako **zdroj obrazu** ANO (studené čtení EN 10→2,3/16, IS 11→2,7/16) · vlastní obrázky v ní **NE** — otvírají druhý svět (1,25→1,00 světa po odebrání, soulad EN 5→7/8) |
| **lens** | 21.8. žebřík: krok  byl **nejhorší stupeň** v EN (chlad 0→3, pojmenování 8→4, soulad 7→5) — měřeno ve dvojici, samostatně ne · ㉚ hlásí nezapojenost u velkých spreadů od 18.8., neuzavřeno |
| **priority** | 21.8. měřeno jen ve dvojici s  (viz řádek výš); samostatný účinek **neznámý** · ablace: bez něj délka 58→48 slov, jinak ±1 |
| **intention** | 21.8. ablace: bez něj pojmenování EN 4→7/8 — malý blok (78 zn.), který stojí v cestě |
| **register** | 21.8. bez měřitelného účinku (ablace ±1; v žebříku IS pojmenování 5→2 při přidání) · 60 % textu je sdílená preambule napříč pěti variantami |
| **ending** | 21.8. `heavy[1]` „asks for honesty" = **8/8 studených čtení**, nejhorší jednotlivá páka z dvaceti — přepsáno · `open[0]`/`open[1]` přepsány pod čáru podmětu |
| **image** | 21.8. ablace: bez něj IS soulad 7→5/8 · 25/25 run má vlastní obraz ve všech 6 sezónách (2026-08-20) · 22.8. **test naslepo** (obraz → pětice sad významů, náhoda 20 %): 71/80 trefeno; **7 obrazů jednomyslně ukazuje na JINOU runu** (Wunjo úkryt→ochrana, Hagalaz poryv→Perth, Algiz 2× →Nauthiz/Raidho, Sowilo zimní slunce→Isa, Berkana svíce→Eihwaz, Mannaz stopy→Raidho) + Kenaz „hands remember" nevyjadřuje nic + Thurisaz brána nevyhodnocena (soudce 2× bez odpovědi). Data `docs/eval/2026-08-22-obrazy-blind/`. ⚠️ Měkký test (21.8., „unese aspekt?") a slepý test se rozcházejí na Kenaz hot-spring — měkký NE, slepý ANO; dvě otázky, ne jedna pravda |
| **keywords** | 21.8. model sáhne po nejznámějším klíči (Jera → „harvest") i když obraz nese jiný · 22.8. **VYŘEŠENO PRO IS** (v3.2): klíč = stránka vylosovaného obrazu (mapa 79/80), soulad 24/32→30/32 (p=0,041), dva nezávislé vzorky · **EN se neváže** — efekt žádný, náhoda drží pestrost · klauzule do promptu zamítnuta už 21.8. (srazila pojmenování) |
| **name** | 21.8. bez měřitelného účinku (ablace ±1) |
| **voice** (systémový prompt) | 21.8. ablace: vypnutí **nezhoršilo ani jedno** ze tří měřítek, pojmenování EN 4→7/8 — ⚠️ ale **hlas se neměří**, a ten tenhle blok vlastní. 57 % plochy promptu |
| **address** | jen IS, neměřeno |

⚠️ **Prázdná buňka není „neškodné".** Znamená to, že o té páce nevíme nic — ne že nic nedělá.

---

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
python -X utf8 is-grammar-qa.py <čtení.txt>              # IS gramatika (E001 = nerozparsováno ≠ OK)
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
python -X utf8 is-grammar-qa.py <dávka.readings.txt>                   # IS gramatika
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

## Měření od 2026-08-18

### 2026-08-18 — Úhel u spreadů: obrácená páka NEUKÁZALA nic. 300 čtení, 6 ramen

**Otázka (owner, 2026-08-17):** `angleIntro` má JEN `RP_SINGLE`, šest cest ho nedostane.
Splývají tedy spready víc? 17. 8. to změřit nešlo — archiv měl 23 norns a 0 islandských,
a šum uvnitř single (0,0002 vs 0,0029) byl větší než rozdíl mezi rameny.

**Čím se to dělalo.** Admin JWT do proxy vypršel, owner dal místo něj API klíč →
`scripts/utils/gen_direct.js` (nový): staví prompty TÝMIŽ buildery jako produkce, posílá
je přímo na `api.anthropic.com`, model `claude-opus-4-8` (= první v produkčním `MODELS`),
system jako pole s cache — stejný tvar jako `claude-proxy`. **Všech 300 čtení vzniklo týž den,
týmž generátorem, na týž model** — bez toho by se ramena lišila ještě modelem a dnem (§27, útok 2).

**Ramena (50 čtení každé):** norns IS · norns EN · single IS · single EN · single IS bez úhlu
· single EN bez úhlu. Vypnutí úhlu je TÁŽ páka jako v `gen_batch.js --without angle`
(marker = prvních 30 znaků `RP_SINGLE[lang].angleIntro`, zahodí se řádka, která jím začíná) —
druhý způsob by se rozešel (§18).

**Metrika:** průměrná párová Jaccardova shoda na trigramech obsahových slov,
`scripts/utils/measure_sameness.js`. Délkově srovnáno na prvních 31 slovech (nejkratší medián),
protože delší text má víc trigramů.

**① Spready vs single** (délkově srovnáno)
```
norns IS   0,0005      single IS   0,0003
norns EN   0,0007      single EN   0,0008
```
**② Obrácená páka — single S úhlem vs BEZ úhlu** (jediná proměnná)
```
IS   s úhlem 0,0010   ·   bez úhlu 0,0008      šum uvnitř ramene: 0,0015 | 0,0002
EN   s úhlem 0,0008   ·   bez úhlu 0,0011      šum uvnitř ramene: 0,0013 | 0,0007
```
**Závěr: žádný měřitelný rozdíl.** Odebrání úhlu stejnost NEZVÝŠILO — v islandštině dokonce
klesla. Všechny rozdíly jsou menší než rozptyl mezi půlkami TÉHOŽ ramene (až 7×).

⚠️ **Co se tím NETVRDÍ, a je to důležité.** Kánon má z 2026-08-16 opačně mířící nález —
**„úhel vyrábí stejnost" (13,8 % vs 10,5 %, p = 0,004)** — a ten měřil **dvojice se STEJNÝM
úhlem**. Moje metrika sdružuje všechny dvojice bez ohledu na úhel, takže **na tuhle otázku
nevidí** a nepřebíjí ji. Můj výsledek zní jen: *„že by spready bez úhlu splývaly víc, se
neprokázalo."* Ne „úhel nedělá nic".

**Nástroj se obhájil (§27):** útok 1 (půlka proti půlce) je v tabulce výš a je to důvod závěru
„nic". Útok 3 (zamíchání slov uvnitř čtení) shodil metriku o 82–100 %, takže na pořadí slov
prokazatelně závisí — na rozdíl od metriky, která 2026-08-14 padla na 0,0000.

**Dvě chyby v nástroji, obě nalezené vlastními pilotními běhy:**
1. `Object.keys(AREAS)` vrátilo `['en','is','norns']` — AREAS je mapa PODLE JAZYKA. Do promptu
   šlo `area: "norns"` místo „Ást & Sambönd". Pilot ze čtyř čtení to ukázal hned.
2. `--dry-run` psal do TÉHOŽ souboru jako ostrá dávka a přepsal 50 hotových čtení dvěma
   prázdnými. Suchý běh má teď vlastní jméno (`-dryrun`).

## 2026-08-18 — Pole vs pool, rozprostírač, forma L1 (opus-4-8, EN+IS)

Oblouk od „moc stejná" k „takhle to má znít". Surové korpusy: `~/runar-eval/` (field-vs-pool-{en,is},
field-is-native, test2-spreader-{en,is}, form-lever-en, L1-breadth-{en,is}, L1-combo-{en,is}).
Metrika = **max-shluk** (kolik z N čtení spadlo na jeden obraz; nižší = pestřejší). n=6–8/rameno =
SMĚR, ne finální tvrzení (pod prahem 20). Směr/rozhodnutí → `RUNAR_DECISIONS.md` 2026-08-18.

**① Pool vs volné pole (5 run × EN+IS).** Volné pole se SLÉVÁ na nejzřejmější obraz: Isa EN 6/6 čaj,
Berkana IS 6/6 těsto, Fehu IS 4/6 mléko. Kurátorský pool + úhly drží rovnoměrně (max-shluk 2–3).
→ svoboda ≠ pestrost; rozprostírač je to, co stejnosti brání, ne volnost.

**② IS-nativní pole (Isa+Berkana).** Slévání DRŽÍ i s polem daným rovnou islandsky (Isa ~6/6, Berkana
6/6) → není to artefakt jazyka menu, je to vnitřní gravitace modelu. Falzifikace ownerovy hypotézy (§25).

**③ Rozprostírač (vynucená rotace domén).** Slévání ZMIZELO v obou jazycích; každá vynucená doména dala
dobré on-characteristic čtení (i „spekulativní" domény od Coworku). Dvě vady: vynucená mimosezónní doména
(„led") prorazí sezónní hlídání (owner ji ale relaxoval → DESIGN); abstraktní doména umí prosáknout cizí
obraz (Blank „ticho" → Berkanino těsto, vzácné, konkrétní domény ne).

**④ Forma (L0/L1/L2).** Kolik esenčního řádku = laditelná páka. L0 báseň (runa nechycena) · **L1 obraz+
řádek+umístění = cíl** · L2 vysvětluje vlastní metaforu + roste délka. L1 drží napříč 8 runami (pozitivní
i temné) a v IS.

**⑤ TVAR věty se opakuje kvůli JEDNOMU příkladu v promptu.** Esenční řádek pořád „X is the Y" — protože
L1 instrukce dala jeden vzor (→ „direktiva = doslovný opis", 2026-08-15). Oprava = „střídej tvar" = nová
třetí páka (TVAR věty).

**⑥ TVAR věty — oprava POTVRZENA (A/B, Fehu+Isa, EN+IS).** Instrukce „střídej tvar" (místo jednoho
vzoru) srazila šablonu „<Runa> is/er…" z **5–6/6 na 0/6** ve všech čtyřech buňkách, a přitom drží týž
význam („Hand to hand, that is Fehu" · „That waiting is Isa"). ⚠️ vary arm si občas oblíbí NOVÝ tvar
(cleft), co jsem dal jako vzor → není nekonečné, ale monotonie zlomená. Korpus: `form-variation-{en,is}.txt`.

**⑦ NÁZVOSLOVÍ VÝZNAMU = ČTVRTÁ osa (banka faset, Cowork handoff #3).** Tvar mění syntax, ne slovník
(Fehu ve vary arm pořád „wealth/moving"). Vynucená rotace 6–8 faset/runu **rozšíří SLOVNÍK**: objevily se
increase/lambs, provision, reciprocita, preservation, surface/váha — mimo věčné „wealth/waiting". Kánon
drží (žádná rada/verdikt/posun významu). Hranice: fasety BLÍZKO jádra echují jádro; širší přijde z faset
do jiné části významu. Korpus: `naming-bank-en.txt`. IS: tvoří se nativně (§2), ne překládá z EN faset.

**⑧ Cross-run kolize PROŠLA generováním; kolize OBRAZU je ODDĚLENÁ, pojmenovaná osa (25-run banka).**
Tři Coworkovy rizikové páry (Isa/Ingwaz „stillness", Uruz/Thurisaz „raw force", Algiz/Thurisaz „guard")
se čtou jako RŮZNÉ runy — rozlišení faset drží i ve výstupu (Isa=pauza vs Ingwaz=latence pod povrchem ·
Uruz=vitalita dovnitř vs Thurisaz=úder ven · Algiz=útočiště vs Thurisaz=zraňující trn). ⚠️ ALE self-gen
OBRAZ koliduje napříč runami NEZÁVISLE na fasetě: „kynoucí těsto" padlo u Ingwaz I Uruz (a bylo Berkanino)
→ Uruz#1 slabé. Banka řeší SLOVA významu; obraz na runu drží POLE (kurátorské domény per runa) → pole
potřebuje cross-run rozlišení OBRAZŮ stejně jako banka faset. Test běžel BEZ pole (self-gen), proto to
vylezlo. Korpus: `crossrun-collision-en.txt`.

## 2026-08-19 — Kánon-check nových symbolů: landvættir/Algiz a hvalreki/Nauthiz protékají i s mantinely

Owner: „zkontroluj nové návrhy, jestli neruší pravidla o tom, jaký je Rúnar." Měřeno s AKTIVNÍMI
mantinely v promptu (no cold reading / no advice / no prediction), 4 čtení na vazbu, opus-4-8.
Korpus: `~/runar-eval/canon-check-en.txt`. Jiná osa než symbol-audit (ten ověřuje reálný profil
podmětu; tohle ověřuje, jak podmět generuje vůči kánonu „Kdo je Rúnar").

Většina nových symbolů (ledovec→Isa, need-fire→Nauthiz, labuť→Jera, kría→Algiz, podměty dávek 1–2)
kánon drží. DVĚ vazby protékají navzdory mantinelům:
- **landvættir→Algiz: 2/4 sklouzlo do studeného čtení** — „you stand within the ring it holds" /
  „the water reaches only so far" = strážce chrání tazatele = tvrzení o jeho stavu (`_noColdRead`:
  svět se kolem tazatele neuspořádává). Nejvyšší kánon-riziko z nových návrhů.
- **hvalreki→Nauthiz: věštba udržena, rada protekla 2/4** — velryba už na břehu (žádné „přijde"),
  ale „warned not to wait on the same gift twice" = pokyn tazateli. Bezpečné: výstraha jako
  přísloví stojící VEDLE (obraz), ne příkaz.

⭐ Poučení: u symbolu, jehož SAMA POVAHA míří na kánonovou čáru (Algiz=ochrana→„jsi chráněn" ·
hvalreki=přísloví→„jsi varován"), obecné zákazy NESTAČÍ — protekly ~2/4. Potřebují framing-guardrail
nesený s fragmentem + cílený kánon-eval při implementaci. Bezpečný vzor pro Algiz = lokalizovat stráž
V tazateli (kría „something in you"), ne ve světě.

---

### 2026-08-20 — Univerzálnost úhlu ZMĚŘENA: 25/25 run má obraz ve všech 6 sezónách

**Ownerova pochybnost** (2026-08-20): *„to je ten problém úhlů, který je upřímně asi těžko
řešitelný, pokud jde na všechny runy."* Cowork handoff na to odpovídá **argumentem**: úhly byly
2026-08-16 přestavěny z „domény" na „vstup do OBRAZU" a každá runa obraz má, takže referent je
univerzální. Argument sedí logicky — ale nikdo ho neměřil.

**Změřeno teď** (`_runeImageCandidates` + `SEASON_POOLS`, produkční funkce, ne čtení kódu):
```
sezóna         sezónní pool      run s VLASTNÍM obrazem
autumn          22 obrazů              25/25
darkening       22                     25/25
deepwinter      20                     25/25
earlysummer     20                     25/25
highsummer      29                     25/25
spring          20                     25/25
```
**Každá runa má vlastní obraz v každé sezóně**, a každá sezóna má navíc pool jako zálohu.
Úhel mluvící o „the image" tedy má vždycky na co ukázat — pochybnost o univerzálnosti
**nesedí** a je to teď měřené, ne odvozené.

⚠️ **Proč se měřil i pool, když každá runa má vlastní obraz:** `_seasonalImagery` má
`if (!pool) return ''` — v sezóně BEZ poolu nedostane čtení obraz ANI když runa svého kandidáta
má. Sezóna bez poolu by tedy úhel poslala do prázdna bez ohledu na runy. Žádná taková není.

**Co se tím NEtvrdí:** že jsou nové úhly lepší. To by neslo ani měření z 2026-08-16 —
tam je závěr *„u starých byla vada prokazatelná, u nových prokazatelná není"* (p = 0,38
vs p = 0,029; přímé srovnání p = 0,31). Tohle měření říká jen, že **referent existuje všude**,
což je nutná podmínka, ne důkaz kvality.

**Zůstává neměřeno:** stejnost NOVÝCH úhlů (dvojice se stejným úhlem). Vlastní `RUNAR_EVAL_LOG.md`
2026-08-16 to má jako otevřené a jmenuje i nástroj; potřebuje ~75 párů na rameno.

## 2026-08-20 — IS větev banky ověřena nástroji · „ne-zasloužené" fasety unikají do soudu

Coworkova islandská větev banky názvosloví (Freyr's ætt, 51 aktivních faset). Cowork hlásil,
že mu `is-vazba`/`is-grammar-qa` spadly na 403 — **u CODE-read běží**, ověřeno živě, ne převzato.
Korpus = Risamálheild (součet 2000–2021), rekce = Íslensk nútímamálsorðabók.

**① Rekce: 10/10 potvrzeno.** `stjórna` þgf · `krefjast` ef · `fylgja` þgf · `kenna` (þgf +) þf ·
`þurfa` þf/ef · `sýna` (þgf +) þf · `beisla` þf · `neita` þgf · `særa` þf · `verja` þf. Coworkův
ruční rozbor na téhle vrstvě drží celý.

**② Kolokace: 9/10 doloženo, 1 NEDOLOŽENA.** `til taks` 9142 · `fara varlega` 16351 ·
`á hreyfingu` 6201 · `í báðar áttir` 5750 · `annars staðar frá` 3749 · `verður til við` 1309 ·
`biður ekki um` 695 · `eftir erfiðleika` 221 · `án áreynslu` 115.
⚠️ **`verður að merkingu` = 0.** Nula ověřena protipříklady, aby nešlo o vadné měření
(`verður að veruleika` 2339 · `verður að engu` 313 · samotné `að merkingu` 321) — vazba
`verða að` + þgf. je v pořádku, nedoložená je právě tahle dvojice slov. Doložené náhrady:
`verður að máli` 65 · `öðlast merkingu` 50 · `verður að orði` 40 · `fær merkingu` 21.
Owner zvolil **`öðlast merkingu`** (významově nejblíž EN „shaped into meaning").

**③ Gramatika, všech 51 faset: 5 signálů, všech 5 uzavřeno jako falešný poplach** — s dokladem,
ne odložením (§19.2). `hjarðarinnar` → nástroj navrhoval `jarðarinnar`, ale hjörð je doložená 224× ·
`Rausn` → navrhoval `Raun`, rausn je v BÍN a 1024× v korpusu · `Taktur, ekki flýtir` → „čárka
zbytečná", jde o kontrastní fragment · **E001 ×2** (`Þyrnirinn sem særir` · `sem ver`) → parser
neumí holý fragment s tranzitivním slovesem bez předmětu; korpus obojí doloží (`sem særir` 474 ·
`sem ver` 1776). Táž mez nástroje, jaká je u instrukčního textu zapsaná 2026-08-16.

**④ ⭐ KÁNON-EVAL 4 zděděných hraničních faset v IS — a nález, který je nad rámec téhle dávky.**
Produkční cesta (`buildReadingPrompt`, `lang='is'`, tedy islandské `_describeRule` + `_noColdRead`
aktivní), obraz pinnut z `RUNE_IMAGES` (aby únik šel za fasetou, ne za obrazem), n = 3 na fasetu,
opus-4-8. Korpus: `~/runar-eval/is-canon-freyr.{jsonl,txt}`.

| faseta | verdikt |
|---|---|
| Gebo `gagnkvæm skuld sem tengir` | ✅ 3/3 — „skuld" se ani jednou nezvrhla v „dlužíš" |
| Thurisaz `brúnin sem kennir varkárni` | ✅ 3/3 — „kennir" nikdy nesklouzlo k radě |
| Ansuz `viska sem er gefin, ekki unnin` | ⚠️ 2/3 rada + soud |
| Wunjo `nægjusemi sem er komin, ekki áunnin` | ⚠️ 3/3 tvrzení o nitru |

Ansuz neunikl tam, kde se čekalo (žádné „svět ti dává moudrost"), ale do **výtky**:
*„Hvað heyrir þú þegar þú hættir **loksins** að tala?"* — „konečně" nese soud *mluvíš moc*.
Wunjo míří dovnitř ve všech třech: *„**Hvað í þér** er **nú þegar** mett…"* — a to `nú þegar`
je přesně ten `already`/`þegar` vzorec, kvůli kterému vznikla v1.2 `_noColdRead`.

⭐ **Vzorec: „X, ekki unnin / ekki áunnin".** Obě unikající fasety mají TÝŽ tvar — vymezují se
proti **zásluze tazatele**, a tím ho vtáhnou do věty: model začne mluvit o tom, co si (ne)zasloužil
a co má přestat dělat. Gebo a Thurisaz ten tvar nemají a obě drží. Je to zrcadlový protějšek
vzorce „výsledek, co přijde/se vrátí" (Cowork, 2026-08-19): tam slib budoucí odměny, tady **soud
o minulé zásluze**. Směr opravy: popsat, čím ta věc JE, ne čím není vůči snaze tazatele — zápor
nese už samotné sloveso.

**Hranice nálezu:** n = 3 na fasetu, jeden jazyk, obraz pinnut. Signál, ne vzorec s tvrdým číslem;
u Wunjo ale 3/3 a u obou konzistentní tvar. Neověřovalo se, jestli jsou IS fasety významově 1:1
s EN — to je obsahový soud, ne měření.

⚠️ **Confound, který platí na všechny tyhle IS kánon-evaly:** prompt se staví JEDNOU a volá se
n×, takže **úhel i tvar konce jsou uvnitř dávky totožné**. „3/3" tedy znamená „3/3 při jednom
tvaru konce", ne „napříč pestrostí promptu". U rady je to podstatné — rada se skoro vždy vejde
do otázky na konci.

## 2026-08-20 — Hagal IS ověřen · opravy „ne-zasloužených" faset DRŽÍ · vlastní přeformulování SELHALO

Coworkova IS větev Hagal's aettu (49 faset) + dvě utažené fasety z Freyr's. Táž metoda jako výš.
Korpus: `~/runar-eval/is-canon-hagal.{jsonl,txt}` a `is-canon-fixes.{jsonl,txt}`.

**① Gramatika 51 řádků (49 Hagal + 2 opravy): 0 flagů.** Čistší než Freyr (tam 3). Čtyři E001 —
táž mez nástroje jako minule (tranzitivní sloveso bez předmětu, bezslovesný fragment); korpus
všechny doloží: `sem skilar` 9877 · `sem varðveitir` 269 · `sem afhjúpar` 218 · `hið ósýnilega` 187.

**② ⭐ Opravy vzorce „X, ekki unnin/áunnin" DRŽÍ 3/3 — vzorec byl tedy skutečně příčinou.**
Ansuz `viska sem berst að utan` (dřív „viska sem er gefin, ekki unnin"): výtka *„þegar þú hættir
**loksins** að tala"* se nevrátila ani jednou. Wunjo `nægjusemi sem birtist af sjálfu sér` (dřív
„…ekki áunnin"): *„Hvað í þér"* ani *„nú þegar"* se nevrátily ani jednou. To je zpětné potvrzení
nálezu z předchozího záznamu — ne nový, ale první, kde oprava prošla vlastní zkouškou.

**③ Kánon-eval 5 hraničních IS faset: 4 čisté, 1 selhala — ta MOJE.**

| faseta | verdikt |
|---|---|
| Nauthiz `núningurinn sem kennir` | ✅ 3/3 — „kennir" nikdy neučilo tazatele; skončilo obecnou pravdou o světě |
| Isa `stöðvunin sem afhjúpar` | ✅ 3/3 — odhaluje se SCÉNA, ne nitro tazatele (Coworkovo proaktivní flagnutí bylo prozíravé, ale drží) |
| Algiz `skjól sem biður ekki um þakkir` | ✅ 3/3 — *„spyr þig einskis"*, *„án þess að telja sporin þín heim"*. Nikdy „jsi chráněn"; stráž zůstala lampou |
| Sowilo `hlýja sem nær jafnvel til þess sem er hulið` | ✅ 3/3 — „skryté" zůstalo fyzické (kameny ve stínu, spáry), nikdy „tvoje skryté" |
| Nauthiz `skortur þar sem velja verður` (CODE-read) | ⚠️ **3/3 rada** |

⚠️ **Vlastní přeformulování selhalo — a to je ten nález.** Původní `skortur sem neyðir til að velja`
mělo jazykovou vadu: `neyða` váže þolfall a v korpusu skoro vždy nese předmět (`neyðir mann til` 71 ·
`neyðir okkur til` 99 · `neyða til` 88), ale holé `neyðir til` jen **9**. Doplnit „þig" nešlo — mířilo
by to na tazatele. Přeformuloval jsem na neosobní modál `skortur þar sem velja verður` (obě půlky
doložené: `þar sem velja` 91 · `velja verður` 32, gramatika 0 flagů, žádné E001).
**Nepomohlo.** Model si předmět doplnil sám (*„þráður sem **neyðir þig** til að velja"*) a všechna
tři čtení skončila radou: *„**Hvað ætlar þú að hætta að prjóna**…"* · *„**Hverju ertu tilbúið að
sleppa**…"* ×2.

⭐ **Poučení: vada nebyla v jazyce, ale v pojmu.** Odebrat předmět z fasety neodebere předmět
ze čtení. „Nedostatek nutí volit" táhne k „tak se něčeho vzdej" bez ohledu na to, jak je věta
postavená. Dvě po sobě jdoucí přeformulování (EN „reveals priorities" → „forces the choosing",
IS „neyðir til að velja" → „þar sem velja verður") unikla **týmž směrem** — třetí přepis to
nejspíš nespraví. Kandidát na vyřazení, ne na další znění; rozhoduje owner.


## 2026-08-23 — Vegvísir: dverg pod runou jako DRUHÁ VĚTA funguje · pod zátěží sáhne po přirovnání

Produkční prompt (`buildReadingPrompt`, EN), obraz **pinnut** z `RUNE_IMAGES` → rozdíl jde za dvergem,
ne za obrazem. Kontrola = týž prompt bez dverga. Dvergovo zadání = materiál, nikdy jméno.
**n = 2 na buňku — signál, ne vzorec.** Korpusy: `~/runar-eval/vegvisir-sever.jsonl` · `vegvisir-rameno.jsonl`.

**① SEVER (životní runa = tažená → `_lensContext` vypadne sám). FUNGUJE.**
0/6 vyslovilo jméno dverga · 5/6 nepřidalo druhý obraz · a dverg přidal runě **druhé patro**:
Isa sama = *zastaveno*; Isa + Dvalin = *„Beneath it the dark keeps moving where no one sees… never
truly gone."* Nejlepší řádek dávky (Ansuz + Alvíss): *„This one has held a great many names in its
throat, more than the daylight lets it keep."* — celý Alvíss, nesený havranem z obrazu, bez jména.
Jediná vada: Kenaz [2] přinesl **nový předmět** („poker") — tam je hranice.

**② RAMENO MIMO SEVER (dverg + závěrečná čočka naráz). Nespadlo, ale dře.**
3/6 obojí drží čistě (Kenaz×2, Ansuz [1] — tam si dokonce pomohly: Alvíss + Berkana se potkaly
na „pojmenovat"). **1/6 dverg úplně zmizel** · **1/6 porušilo kánon**: přišel jako **přirovnání
nalepené na obraz** — *„patient as the stone dozing under the bank"*, tedy simile na metafoře
(zakázáno) **a** druhý obrázek vedle rybníka.

⭐ **Nález:** selhání není v tom, že by se dverg a čočka na konci pobily. Je v tom, že **při třech
zdrojích** (obraz + dverg + čočka) model jeden zdroj buď zahodí, nebo ho **přišije jako srovnání**.
Oprava je adresná a testovatelná: dvergovi se musí zakázat přijít jako přirovnání — má být vlastností
toho, co v obraze už je. → pravidlo zapsáno v `RUNAR_DESIGN.md`, „Dverg pod runou".

⚠️ **Hranice:** obě ramena vyšla nad produkční limit (3 věty / 38–45 slov) — to dělá pinnutí obrazu,
je to stejné v kontrole i u dverga, tedy ne vada dverga. Netestovala se varianta „dverg jen jako
vodítko pro autora obrazů" — ta se generováním ověřit nedá, pozná se až na hotové bance.


## 2026-08-23 — Osa skryté ↔ odhalené: světelný pól se NESTAVÍ · a predikce padla JINAK, než se čekala

Obrácená páka (§25) na tvrzení „Sowilo/Dagaz nemají POD, takže druhou vrstvu nepotřebují".
Produkční prompt (EN), obraz pinnut, **pozitivní kontrola Isa** (dverga MÁ) prochází týmiž rameny —
bez ní by nešlo odlišit „špatná runa pro tuhle vrstvu" od „špatná instrukce" (§27).
Tři ramena: **A** bez vrstvy · **B** skrytá (dvergovská) · **C** světelná (ljósálfar).
n = 2 na buňku. Korpus: `~/runar-eval/osa-test.{jsonl,txt}`.

**① Kontrola Isa drží.** Rameno B přidalo druhé patro přesně jako dřív: *„under it the water still
moves where no eye can follow"* · *„Under that stillness the water keeps its slow dark motion,
unhurried, never truly stopped."* Instrukce tedy funguje — co selže jinde, není její vina.

**② ⭐ SVĚTELNÝ PÓL (rameno C) NEPŘIDAL NIC. Nikde.** U Sowilo i Dagaz jen **zopakoval, co runa už
řekla**: čtení říká „světlo ukazuje věc jasně" a pak *„Nothing on these stones holds a shadow now"* ·
*„keeps nothing back and casts no shadow behind it"*. U Isy se stalo něco zajímavějšího: **světelná
vrstva se ohnula ve skrytou** — *„the water beneath shows plainer than any summer light"*. Runa si
vynutila svoje „pod".
→ **Rozhodnuto tímhle měřením: světelný protějšek dverga se NESTAVÍ.** Symetrie byla estetický tah,
ne potřeba. (Ruší otázku Cowork-read 2026-08-23, „co je na světelném pólu materiál".)

**③ ⚠️ PREDIKCE PADLA — ale odhalila horší vadu, než se čekala.** Čekalo se, že skrytá vrstva na
světelné runě vyjde **vynuceně**. Nevyšla. Čte se dobře, místy pěkně — jenže:
- **Sowilo B:** *„Deeper in the rock, the dark seams **the light has not yet reached** hold their own
  colour."* Hezká věta, ale čtení je najednou o tom, kam světlo NEDOSÁHLO. To není Sowilo, to je
  Perth/Isa. **Runa se tiše posunula.**
- **Dagaz B:** *„When did **the change in you** finish, before you thought to look?"* — skrytý materiál
  se převedl na **nitro tazatele**, tedy přesně ten doložený únik.

⭐ **Nález: nebezpečí není ošklivost, je to TICHÝ POSUN VÝZNAMU.** To je horší než vynucená věta —
vynucenou větu čtenář pozná, posunutou runu ne. Kontrola kvality textu tuhle vadu nechytí; chytí ji
jen srovnání s tím, co ta runa je.

**Co z toho platí pro `RUNAR_DESIGN.md` („Dverg pod runou"):** pravidlo „runy bez dverga se
nedoplňují" zůstává, ale **důvod se mění**. Ne „znělo by to nuceně" → ale **„čtení by přestalo být
o té runě"**. Zapsáno tam.

⚠️ **Hranice:** n = 2 na buňku, jeden jazyk, obraz pinnut. Rameno A u Sowilo/Dagaz bylo čisté a úplné
(podpora pro „nepotřebují to"), ale Sowilo A [2] skončilo mírným ujištěním *„the way ahead is easy to
see now"* — nesouvisí s testem, stojí za sledování jinde.


## 2026-08-23 — Vegvísir 1→2→3: řetěz se od tří single NEODLIŠIL. „Nepovinná historie" = ignorovaná historie

Test podle GPT/ownera („neřeš osm ramen, udělej 1→2→3 a zastav se"). Produkční prompt (EN), obrazy
pinnuté, runy zvolené ZÁMĚRNĚ vzdálené (Fehu → Isa → Ehwaz), aby vztah musel být skutečná práce.
**A** = řetěz (rameno 2 dostalo TEXT ramene 1; rameno 3 texty 1+2, s pravidlem „historie je materiál,
ne zápis; nesmíš rekapitulovat ani jmenovat předchozí runy; smíš ji nechat být") · **B** = tři
nezávislá single, tytéž runy a obrazy. 2 běhy. Korpus: `~/runar-eval/retez-test.{jsonl,txt}`.

**⭐ VÝSLEDEK: vztah nevznikl ANI JEDNOU (0 ze 6 ramen).** Řetězová čtení jsou od kontrolních
prakticky k nerozeznání — Ehwaz v řetězu končí *„Do you hold the reins tight, or let the horse choose
its footing?"*, kontrolní *„Do you hold the reins, or let the feet that already know the ford go
first?"*. Nejsilnější náznak ozvěny za celý test je slovo „holding" u Isy, což je náhoda, ne vztah.

**Příčina — a byla předpovězena.** Instrukce zněla „smíš navázat, odporovat, otočit… **nebo to nechat
být, když nic nepřijde přirozeně**". Nejlevnější cesta je nechat to být, a model ji vzal 6/6.
Potvrzuje to varování zapsané do `RUNAR_DESIGN.md` téhož dne: **„nepovinné" samo nestačí, potřebuje
protiváhu.** Tady se to ukázalo v nejostřejší formě — nepovinná historie se nepoužije vůbec, ne jen
selektivně.

**Co to znamená pro Vegvísir:** dokud vztah mezi rameny nevzniká, **je to osmkrát Single s čekáním**.
Jádro definice („jedno čtení, které vzniká vztahem k prošlému") zatím NENÍ splněno žádným mechanismem,
který máme. Stavět osm ramen nad tímhle by znamenalo postavit dva měsíce čekání na něco, co nefunguje.

⚠️ **Vada vlastního nástroje (§27), hlásím ji, ne zakrývám:** detektor odkazů flagoval *všech* šest
řetězových čtení — jenže regex obsahoval i jména testovaných run (`fehu|isa|ehwaz`) a čtení svoji
VLASTNÍ runu jmenovat MUSÍ (žádá to prompt). Šlo tedy o falešné poplachy; posuzoval jsem ručně.
Detektor je pro tenhle účel nepoužitelný, dokud nebude vylučovat aktuální runu.

**Další krok (návrh, neproveden):** nedávat celý text předchozího ramene, ale **jednu konkrétní věc
z něj** — tak, jak funguje dverg: ne odkaz, ale materiál nesený týmž obrazem. Menší vstup se hůř
ignoruje než celý odstavec. Alternativa: přiřadit rameni JEDEN z pohybů (naváže/změní/otevře) místo
nabídky všech — ⚠️ ale to je instrukce do promptu, kterou GPT i naše měření TVARU věty varují dávat
jako jediný vzor.

⚠️ **Hranice:** 2 běhy × 3 ramena, jeden jazyk, obrazy pinnuté, jedna sada run. Signál je ale
konzistentní (0/6) a levný na zopakování.


## 2026-08-23 — Vegvísir řetěz v2: nést JEDNU VĚC místo textu — mechanismus ZABRAL (4/4 proti 0/6)

Oprava po nálezu z téhož dne (celý text + „smíš to nechat být" = 0/6). Změny tři: **(a)** nese se
jedna krátká fráze, ne odstavec · **(b)** extrahuje ji MODEL (samostatné volání, ne já ručně) ·
**(c)** ŽÁDNÁ úniková klauzule. Zbytek stejný: produkční prompt, tytéž runy a obrazy (Fehu → Isa →
Ehwaz), 2 běhy + kontrola bez nesení. Korpus: `~/runar-eval/nesene-test.{jsonl,txt}`.

**⭐ Nesená věc se objevila ve VŠECH navazujících ramenech (4/4).** Proti 0/6 u verze s celým textem.
Rozdíl nedělá objem informace — dělá ho **tvar**: odstavec je látka k ignorování, jedna konkrétní
fráze je látka k použití. Táž mechanika jako u dverga (materiál nesený týmž obrazem, ne odkaz).

**⭐ Nejlepší tvar, jaký z toho vyšel — nesené se objevilo jako NEPŘÍTOMNOST:**
nese *„Steam rising from hot bread"* → Isa: *„still water held under **a skin that no longer steams**
into the morning air."* Žádné přirovnání, žádný chleba, žádný odkaz — předchozí materiál je přítomen
jako **to, co už tam není**. To je skutečný vztah mezi čteními, a přitom to není ani rekapitulace,
ani citace. **Nesené funguje nejlíp, když je POPŘENÉ nebo PROMĚNĚNÉ, ne zopakované.**

**⚠️ Selhání se přesunulo, nezmizelo: 1 ze 4 přišlo jako PŘIROVNÁNÍ.**
*„the pond… giving off **no more warmth than the crust of a cold loaf**"* — komparace, kterou zakazuje
jak instrukce, tak kánon („never a simile stacked on a metaphor"), a navíc vtáhne chleba do scény
u rybníka jako druhý obraz. **Je to táž vada jako u dverga** („patient as the stone dozing under the
bank"). Riziko už tedy není ignorování, ale **komparace** — a na tu existuje adresný zákaz.

**⚠️ Nesené se ROZPADÁ s odstupem.** Ve třetím rameni už materiál z prvního nebyl v obou bězích;
zbylo jen to z druhého (a i to slabě: *„runs cold over **black** gravel"*). Přes osm ramen by první
rameno zmizelo dávno před koncem — což **koliduje s návrhem, že osmé rameno je místo, odkud se
člověk ohlédne na první**. Nevyřešeno; je to teď hlavní otevřená otázka mechaniky.

**Vedlejší:** extrakce modelem je použitelná — vracela věcné materiálové fráze („Warm bread steam
rising", „Ice over moving water"), tedy automatizace téhle vrstvy je reálná, ne ruční.

⚠️ **Hranice:** 2 běhy × 3 ramena + 1 kontrolní sada, jeden jazyk, obrazy pinnuté, jedna sada run.
Signál je silný (4/4 proti 0/6), ale malý.


## 2026-08-23 — Registrová riziková mapa obrazů (PROXY predikce, ne měření; Cowork handoff)
Validováno na T2-038 (evalu receptu); frekvence per-kombo TBD. Register D/E/P = sloupec 7
RUNE_IMAGES (kritéria RUNAR_DESIGN, hlídá ㊱):
- **domácí-zaseknuté** (zdroj kolizí): KENAZ byl 3/3 D — po přidání hveru (23.8., slepě EN+IS
  prošel) má E alternativu · WUNJO 3/4 D — navržená E alternativa (fjord po větru) PADLA
  slepě v obou řečích (čte se jako Isa-kyrrð), čeká na nový návrh Cowork.
- **živelně-zaseknuté:** Uruz, Hagalaz, Sowilo, Laguz.
- **bezpečné výběrem** (obě vrstvy): Gebo, Isa, Perth, Dagaz, Ansuz. (T2-038 = chyba VÝBĚRU, ne obsahu.)
- ⚠️ n=1 na konkrétní dvojici run v evalu → per-pár mapa se NEměří, jen typ (D×E).
Zamýšlené použití registru = výběr-kongruence (SMĚR — nestaví se do rozhodnutí o Vegvísiru).

## 2026-08-23 — OBLOUK: designová kontrola závěru (protokol + baseline)
KUKY (po arc-analýze reálných čtení): oblouk „závěr vrací PROMĚNĚNÝ otevírací obraz" se
**MĚŘÍ, do promptu se neinstruuje** — 5fázová scénická struktura z handoffu CODE-read se
NESTAVÍ (rozhodnutí + zdůvodnění → RUNAR_DECISIONS.md 2026-08-23).
**Protokol:** `python -X utf8 scripts/oblouk.py [--days N]` vyřízne z prod čtení (deep_text
⇒ spready/Yggdrasil; žádné API) dvojice otevření/závěr; verdikt dává session/owner pohledem:
**PLNÝ OBLOUK** (návrat + proměna) · **NÁVRAT BEZ PROMĚNY** · **BEZ NÁVRATU**. Kadence:
po každé změně promptu sahající na závěry/obrazy + při větší dávce reálných čtení.
**Baseline 2026-08-23 (v4.12-mynd, n=5 dlouhých čtení ownera, EN): 3/5 oblouk spontánně.**
- Yggdrasil 18:10 (trn na rozcestí) — **učebnicový plný**: „standing where the two ways part,
  and the grass on both sides bears the same marks" (tráva proměněná kroupami).
- Yggdrasil 18:08 (lampa/ponk) — plný, proměna mírná („the piece takes the mark you gave it").
- Yggdrasil 18:18 (probuzení) — plný v jedné scéně (světlo putuje), závěr otázkou obrazu
  (v4.11 tvar) — návrat ano, DOSEDNUTÍ k otázce chybí (→ otázka závěrové věty, DECISIONS).
- Yggdrasil 15:53 (světlo nad hřebenem) — **NÁVRAT BEZ PROMĚNY** (restatement) + nese
  „already"-rodinu: „light in you that has already come up… you simply had not yet turned to look".
- Norns 10:38 (práh/trn → semeno → světlo v údolí) — **BEZ NÁVRATU** (progrese k novému
  obrazu + závěr otázkou).
**Watch (v4.13→v4.14, 2026-08-23):** dosednutí nasazeno na VŠECHNY spready (v4.14; single
drží otázkový los) — na příští dávce owner čtení změřit obloukem: (a) závěr dosedá
(viditelnost, ne otázka), (b) nezačal kázat („this means" rodina), (c) stejnost závěrů
u téhož uživatele (táž life-rune čočka každé čtení + jedna pevná instrukce místo losu),
(d) horseshoe: závěr neopisuje pozici 7.

### Oblouk po v4.14 — první dávka (2026-08-23 večer, n=3 owner, EN)
Mechanika doráží: všechna tři čtení v4.14-mynd, `prompt_draws` už nenese `ending` (před
v4.14 losl Norns `heavy1`). Verdikty (session soudce dle protokolu výš):
- **Norns 21:14** (Sowilo·Dagaz·Wunjo) — **PLNÝ OBLOUK**: otevírá stínem/chladem v údolí,
  zavírá „The valley the shadow left is the same valley the light now fills, and the sun
  reaches you the same on either path down." Dosednutí ANO (tvrzení, ne otázka), konec se
  dotkl začátku.
- **Kříž 21:16** (Thurisaz·Wunjo·Eihwaz·Berkana·Othila) — **PLNÝ**: „What comes clear now,
  Kuky, is that the threshold and the open field are one and the same step…" — práh ze
  středu se potkal s polem; doslova formule viditelnosti, síly pohromadě.
- **Horseshoe 21:18** (Dagaz…Mannaz) — **PLNÝ**: „The hay comes in under the standing sun,
  and every pair of hands that raked it stands together in the same unfading light." Závěr
  sebral CELÝ oblouk (seno musí dovnitř + slunce + spolu), NEopsal pozici 7.
**3/3 dosednutí · 0 kázání („this means" rodina) · 0 cizích konceptů (žádné „owe").**
⚠️ **WATCH — tvar „…are the same":** všechny tři závěry stojí na konstrukci sjednocení
(same valley · one and the same step · same unfading light). n=3 nerozhodne náhodu od
rodící se formule; confound: dávka losovala příbuzné světlé obrazy a sdílené runy
(Sowilo/Dagaz 2×, Wunjo 2×). Rozhodne další dávka — kdyby držela, dát landing formuli
pestrost tvaru realizace (ne jen „dvě věci jsou jedno").

## 2026-08-23 — Recept T1/T2: de-blind tally (Cowork slepě 37/40; úniková klauzule byla vrah, ne objem)
Plná čísla + protokol → `docs/eval/2026-08-23-recept/tally.md` (klíč commitnut po skórování).
**T1 (19/20):** celý text + POVINNÉ „MEETS" vláká ~15/20 → **v1 nulu (0/6) způsobila úniková
klauzule, ne objem textu.** Tvar (jedna fráze, v2) zůstává relevantní pro těžký směr: povinný
celý text nevlákal právě na disparátních trojicích (3/20) a nese obraz-výčet 3/20, zatímco
v2 fráze držela i na Isa↔Ehwaz. **T2 (18/20, A-claims 14/14):** kolaps receptu do výčtu 0/20
(riziko vyvráceno); současný Norns builder ~14/20 spolkne 1–2 runy do dominantního obrazu
(1× simile — builder, ne recept); recept dá každé runě obraz a udrží scénu. → rozhodnutí
ownera: per-runa obrazy vs. jeden úsporný obraz. Slepý protokol funguje: všechny chyby
soudce padly do zóny, kterou sám předem označil za nerozhodnutelnou.

## 2026-08-23 — TEST 31 · Rámový návrat (dva kanály): mechanismus POTVRZEN 6/6, šev vlepení 2/3
Návrh Cowork ① (kotálivá fráze N↔N-1 + trvalé semínko ramene 1 vynořené jen při ohlédnutí).
3 řetězy × 4 ramena (S1 kontinuita Fehu→Isa→Ehwaz→Dagaz · S2 disparátní Nauthiz→Wunjo→Kenaz→
Othila · S3 střední Perth→Tiwaz→Ingwaz→Algiz), ramena 1–3 sdílená, 4. rameno A=+semínko /
B=bez. 9 slepých soudců (subagenti, 3 optiky). Korpus `~/runar-eval/ramovy-navrat.{jsonl,txt}`.
- **Detekce 3/3 A:** semínko se vrací PROMĚNĚNÉ (brána→„only the worn threshold remains,
  crossed" · kořen→„gone deep and quiet, no green shoot left" · laguna→„gone clear and
  quiet"), vady 0/6 kandidátů (žádné jméno dřívější runy, simile, rekapitulace). Funguje
  I NA DISPARÁTNÍ sadě, kde kotálivý řetěz v T1 nevlákal.
- **Účinek 3/3 A:** pocit „jedna cesta — ohlížíš se a vidíš začátek jinak" jen se semínkem;
  B konzistentně „mohlo by patřit jiné pouti".
- **⚠️ Šev 2/3 — návrat je VLEPENÝ:** S1 „mechanická spona", S3 „cizí rekvizita přes and";
  organicky seděl jen S2 — semínko (kořen) mělo ve finální scéně (statek/země) přirozené
  místo. Dvergova lekce potřetí: materiál musí nést TÁŽ scéna. Směr opravy: (a) instrukce
  „návrat přijde skrz materiál vlastní scény", (b) volba obrazu posledního ramene se
  zřetelem na semínko — **nový konzument pro zaparkovaný T3** (aspekt-kongruence).
- 2× hraniční „obrazové shrnutí" (S1, S3): formální zákaz uzavření držel (0 verdiktů,
  0 moralek u všech 6 kandidátů), ale gesto bilance se objevuje — hlídat.
Hranice: n=3 řetězy × 1 běh, EN; nesená instrukce = rekonstrukce v2 spec (TEST 30 prompt
v korpusu uložen nebyl, ne byte-shoda); extrakce frází kolísavá („carried now").

## 2026-08-23 — TEST 32+33 · Šev: instrukce ho NEřeší (trade-off), DOMOV VE SCÉNĚ ano (S2 3/3); úzké hrdlo = selektor
**TEST 32 (D = „návrat skrz materiál vlastní scény" pouhou instrukcí):** čistý trade-off —
detekce C 3/3 · účinek C 3/3 · organičnost D 3/3. Rozpuštěný návrat soudci přestávají číst
jako návrat („sotva čitelné", „jiný předmět"); explicitní zůstává vlepený. Znění instrukce
bolest posouvá, neodstraňuje. Vedlejší nález: organičnost je RELATIVNÍ — S2-C v TEST 31
(vs nic) „přirozený", v TEST 32 (vs D) „vložený odkaz". Korpus: `~/runar-eval/sev-blind.json`. <!-- doc-links:ok 2026-08-23 korpus bydli mimo repo v ~/runar-eval (konvence CODE-read), checker home neresi -->
**TEST 33 (E = volba obrazu posledního ramene dle semínka — model vybírá z kandidátů runy —
+ explicitní návrat):**
- **S2 (drnová zeď pro kořen): E vítězí 3/3, všechny optiky, „čistý":** „Where the wall
  lowers, a root long buried by earlier keepers pushes up green into the open air" —
  čitelné, proměněné, patří scéně („scéna by bez něj byla neúplná"). **Šev se zavřel.**
- S1: pool domov nenabídl (model vybral týž obraz) → fakticky resample, trade-off trvá.
- S3: model vybral ŠPATNĚ (světlo v okně pro lagunu — žádný materiálový most) → E prohrál
  3/3, návrat sklouzl do negace („holding what it always held"); ironie: náhodná C scéna
  (pes drží pole v pohledu) most měla — osa vidění ↔ dno konečně vidět.
**Závěr:** šev zavírá DOMOV VE SCÉNĚ, ne znění instrukce. Úzké hrdlo = SELEKTOR obrazu:
(a) fallback, když domov v poolu není, (b) hlubší kritérium než povrchní afinita — kandidát
= MĚŘENÉ aspekty RUNE_IMAGES [4]/[5] (+ registr D/E/P). To je přesně zaparkovaný T3.
Hranice: n=1 na buňku a sadu; S2-vítězství může nést i štěstí poolu (drnová zeď existovala).
Korpus: `~/runar-eval/ramovy-navrat.jsonl` (arm4A/D/E + obrazE) · `~/runar-eval/sev2-blind.json`. <!-- doc-links:ok 2026-08-23 korpus bydli mimo repo v ~/runar-eval (konvence CODE-read), checker home neresi -->

## 2026-08-24 — TEST 34 · Spojka „střed-jako-místo": SPOJUJE (6/6 vs 1/6), cena = monotónnost 3/6, jeden obraz drží 12/12
Handoff Cowork (spojitost mezi runami) + osy CODE-tune. 6 nejdisparátnějších párů z T1
(tam párové vlákání selhalo) × 2 buňky: **M** = obrazová věta nahrazena MÍSTEM středu
(obraz životní runy: Othila drnová zeď · Laguz dmutí) + direktiva „kresli místo odpovídající
runě" · **S** = produkční single beze změny (obrácená páka §25). 12 slepých soudců (1/pár),
korpus `~/runar-eval/spojka-test.jsonl` + `~/runar-eval/spojka-verdikty.json`. <!-- doc-links:ok 2026-08-24 korpus mimo repo (~/runar-eval), checker home neresi -->
- **NIT: M 6/6 silná · S 1/6 silná, 5/6 slabá.** Obrácená páka drží — bez místa nit padá
  na „most si musí věštec postavit sám". Spojka spojuje i páry, kde párová podobnost
  strukturálně selhává (Nauthiz↔Wunjo, Ansuz↔Eihwaz…). ⚠️ Poctivě: 1 S-pár trefil silnou
  nit náhodou (kořen hledá cestu → „už jsi uvnitř" — narativní komplementarita existuje
  i bez spojky, jen nespolehlivě.)
- **ODLIŠNOST: M 3/6 splývají · S 6/6 zřetelné.** Cena spojky je přesně predikovaná
  monotónnost — s identifikovanou MECHANICKOU příčinou: místo-věta je v promptu VERBATIM
  pro obě čtení → model ji recykluje (5-M: „feel the ground move before your eyes catch
  it" téměř doslova; 2-M „dvě čtení jedné scény"). Táž třída jako
  [[prompt-directive-makes-model-copy]] — potřetí.
- **JEDEN OBRAZ: 12/12 ano** — obava z rozpadu na kulisu+obrázek (MYND kolize) se v této
  dávce NEPOTVRDILA; 1× krátké simile (4-M „dav za rohem", slouží scéně).
**Další páka (neprovedeno, čeká na ownera):** místo zadávat jako IDENTITU s losovaným
STAVEM (hodina/počasí/sezóna/úhel), ne jako opakovanou větu — a přeměřit odlišnost.
Hranice: n=6 párů, 1 soudce/pár, EN, 2 místa, páry (ne 8ramenná série); u 3 soudců
neběžel safety classifier (výstupy ručně prohlédnuty, normální verdikty).

## 2026-08-24 — TEST 35 · Stav místa: splývání 3/6 → 1/6 (kalibrace ±1), nit drží 6/6; nové kritérium = BOHATOST místa
N = místo jako IDENTITA + losovaný STAV (hodina/počasí/sezóna; žádná sdílená verbatim věta),
týchž 6 párů jako TEST 34; slepě 8 soudců (6 N + **2 kalibrační** staré splývavé M-páry).
- **Nit 6/6 silná · jeden obraz 12/12 · odlišnost 5/6 zřetelné** (TEST 34 M: 3/6 splývalo).
- **Kalibrace:** KAL-B (staré 5-M) splývá dál ✓ · KAL-A (staré 2-M) soudce překlopil na
  „zřetelné (těsně)" → soudcovský šum ±1 na hraničních párech; zlepšení 3/6→1/6 číst s touto
  výhradou. Kvalitativní posun je ale jasný: verdikty už nehlásí recyklovanou větu („klíčová
  věta téměř doslova" zmizelo), jen sdílenou kulisu.
- ⭐ **Zbytkové splývání je vlastnost CHUDÉHO místa, ne mechaniky:** Laguz „břeh-dmutí" má
  jediné smyslové zařízení (vlna pod chodidly — vrátila se ve 2 párech, 1× splynutí);
  Othila drnová zeď **4/4 zřetelné** (kameny · drny · kořeny · závětří · spára · oheň u zdi
  — každý stav sáhl po jiném materiálu). **Nové designové kritérium pro budoucí data míst:
  místo musí nést VÍCE uchopitelných materiálů** (obsah míst = Cowork).
- Soudcova věta u KAL-A platí obecně: „třetí čtení v téže kulise už by splývalo" — 8 ramen
  bude chtít stavovou paletu širší než dnešních 6 stavů (hodiny·počasí·sezóny·úhel·vzdálenost).
Hranice: n=6+2, 1 soudce/pár, EN, 2 místa. Korpus `~/runar-eval/stav-test.jsonl` +
`~/runar-eval/stav-blind.json`. <!-- doc-links:ok 2026-08-24 korpus mimo repo (~/runar-eval), checker home neresi -->

## 2026-08-24 — TEST 36 · rev. 3 kontroly: sham-return PŘEŽIL (3/3), emergence otázka PADLA (3/3 mix), hijack-gate NEPROŠLA (6/8 místo vede)
Tři kontroly z Cowork rev. 3 (owner „pojď na to"). Korpusy `~/runar-eval/emergence-sham-verdikty.json` <!-- doc-links:ok 2026-08-24 korpus mimo repo (~/runar-eval), checker home neresi -->
+ `~/runar-eval/hijack-verdikty.json`. <!-- doc-links:ok 2026-08-24 korpus mimo repo (~/runar-eval), checker home neresi -->
**(a) SHAM-RETURN — pravý návrat vyhrál 3/3 na OBOU osách** (materiál i pocit). Model vyrobil
ohlédnutí bez znalosti začátku („poetická retrospektiva") a soudci ho s P v ruce odhalili
pokaždé — účinek-optika NENÍ Barnum-děravá, závěry TEST 31/33 stojí posíleny.
**(b) EMERGENCE — nástroj padl vlastní kontrolou (§27): 6/6 real silná, ale i 3/3 SMÍCHANÝCH
párů (T1+T2 z různých pochodů a míst) silná** s přesvědčivým zdůvodněním. Otázka „vzniká něco
třetího?" je v této podobě neměřitelná — soudce třetí věc zkonstruuje z čehokoli atmosféricky
příbuzného (a obě místa jsou zemitá → mix nebyl dost cizí). Hranice: NEtvrdíme, že emergence
neexistuje — tvrdíme, že tenhle nástroj ji neodliší od konstrukce soudce. Silnější kontrola
by chtěla mix z opravdu cizích světů + protizkoušku „napiš tu větu z T2" jako samostatný krok.
**(c) ⭐ HIJACK-GATE krok 1 — NEPROŠLA: 6/8 čtení vede MÍSTO (téma dědictví/předků), runa je
„nálepka".** Soudce doslova: „kdyby se jméno Wunjo vyměnilo za Othalu, čtení by sedělo ještě
líp." Odolaly jen Nauthiz (tráva láme drny — vlastní téma našlo materiál) a Eihwaz („what
holds YOU"). ⚠️ Skript (slovníková rodina, Ø 1,12 tokenu) hijack NEVIDĚL — únik není
slovníkový, je TEMATICKÝ; kontrola musí běžet na ploše, kde bug žije (§19.3), tj. soudcem.
**Příčina:** místo bylo postavené z OBRAZOVÉ VĚTY životní runy („turf wall the forefathers
built") — nese její VÝZNAMOVÝ DĚJ, ne jen materiál, a ten se lije do každého ramene.
Vedlejší dopad: část „nitě" z TEST 34/35 je zřejmě kontinuita TÉMATU místa, ne jen světa —
po odvýznamování přeměřit. **Další páka: ODVÝZNAMOVANÉ místo** — identita jen z materiálu
(„stará drnová zeď", bez předků), význam smí zůstat v zemi, ne v rámovací větě. Měřeno jen
na Othile (Laguz „groundswell felt underfoot" je podezřelý stejně — je to Laguz-děj).
**Stav brány (owner reorder):** hijack = ANO (špatně) → střed v dnešní podobě NEPROŠEL;
pozitivní půlka (osobní soudržnost, human judgment) zatím neměřena. Architektura se nestaví,
iteruje se reprezentace místa.

## 2026-08-24 — Data míst v1: uloženo + jazykový screen + hijack-riziková mapa
Uloženo `docs/vegvisir-mista-v1.md` (24 míst od Cowork; formát identita+efni+stavy+≠; ≠ řádek
je dobrá zbraň proti slévání). **Jazyk (is-vazba/slovník):** ⚠️ **„fuglstjórn" (identita
Ansuz) vypadá jako chyba** — fugl+stjórn = „ptačí řízení"; zřejmě míněno fuglsrödd/fuglakvak
→ vrátit Coworkovi. Tvary: „vætl úr bergi" → lemma **vætla** (f.) · spegilslétt = tvar od
spegilsléttur (ok). Slovník nezná řadu složenin (varðhóll · leiðarvarða · sáðbeð · þíðubrún ·
ullarreyfi · bergvatnslind · grasþak · matarilmur) — složeniny jsou produktivní a většina
působí přirozeně; Cowork ať potvrdí méně obvyklé (leiðarvarða vs. vörður/leiðarsteinn).
V pořádku: geil, taða, orf, sáta, hrísla, smuga, tröð, nýgræðingur, rekaviður, einstigi, túnfótur.
**Kolize s VLASTNÍMI kritérii formátu (před stavbou přeformulovat):** Sowilo = „augnablikið"
(OKAMŽIK, ne místo) · Ehwaz = „tveir fara samstiga" (vztah v pohybu, ne místo — vlastní ≠ to
přiznává) · Hagalaz = událost krupobití (proces, co přejde) · Dagaz hraniční (denní okamžik).
**Hijack-riziková mapa (session judgment, NE měření):** nejčistší materiálová identita = Uruz ·
Laguz · Kenaz-dílna; významové TABLEAU (naaranžovaný příběh runy jako scéna) = Gebo (plný
šálek + prázdná židle) · Wunjo (plná jizba) · Thurisaz (nepřekročitelná hrana s volbou).
→ NEŽÁDAT přepisy plošně (§24): rozhodne měření — **hijack-test Uruz (čistá) vs Gebo
(tableau) s návštěvními runami** = další krok, navazuje na TEST 36 páku „odvýznamované místo".

## 2026-08-24 — TEST 37 · Hijack Uruz-materiál vs Gebo-tableau: PÁKA POTVRZENA (runa 3/4 vs 0/4)
Titíž 4 návštěvníci (Isa·Ansuz·Raidho·Berkana), mechanika TEST 35 (identita+stav), místa
z dat v1. 8 slepých soudců. Korpus `~/runar-eval/hijack2-test.jsonl` + `~/runar-eval/hijack2-verdikty.json`. <!-- doc-links:ok 2026-08-24 korpus mimo repo (~/runar-eval), checker home neresi -->
- **Uruz (materiálová identita): runa vede 3/4** (Isa·Ansuz·Berkana čistě — místo je jeviště),
  1/4 místo (Raidho — viz níž).
- **Gebo (významové tableau): runa vede 0/4** — místo 3/4 + 1 vyvážené. Soudci: Berkana
  „ZTOTOŽNĚNA s místem… žádný obraz zrodu"; Raidho „nálepka vysvětlující, PROČ židle čeká".
  Naaranžovaný příběh runy (šálek + prázdná židle) pohltí každého návštěvníka.
**Gradient hijacku změřen: tableau 0/4 runa · příběhová identita (TEST 36 Othila) 2/8 ·
materiál 3/4.** → Negativní půlka brány je PRŮCHODNÁ materiálovou identitou; přepis tableau
míst (Gebo·Wunjo·Thurisaz + příběhové klauzule jinde) je teď MĚŘENĚ oprávněný, ne dojem.
**Zbytkové riziko (Uruz-Raidho):** dominantní STAV místa umí přebít runu s protichůdným
tématem — Raidho (cesta) dostala los „zmrzlá suť" a ztuhla („road through stones that no
longer move"). Stavová paleta místa musí nabízet i stavy s pohybem/změnou (Uruz je má:
vítr, zvířata, tání — los je nevytáhl); volba stavu se zřetelem na návštěvníka = budoucí
malá páka (ozvěna T3), zatím neřešit.
Pozitivní půlka brány (osobní soudržnost) = human judgment, čeká na ownera.
Hranice: n=4/místo, 1 soudce/čtení, EN, 2 místa; safety classifier u soudců neběžel
(výstupy prohlédnuty, normální verdikty).

---

## 2026-08-24 — Dosednutí (v4.13/v4.14): vada je v POSLEDNÍ větě, ne ve čtení

**Vzorek:** produkční DB, všechna spread čtení od 2026-08-23 (n=14: 6× v4.14, 2× v4.13, 6× v4.12).
Rozbor do hloubky = nejnovější Norns (2026-08-24 22:44 EN, v4.14-mynd, Othila·Isa·Eihwaz,
životní runa Gebo, bez otázky/seeking/intention, vložený obraz „cup of coffee goes cold").

**① Imperativní šablona „pokračuj, jak jsi — a dojdeš" = 3 ze 4 NORNS EN.**
Tři čtení, tentýž tvar s vyměněnými podstatnými jmény:
• `**Keep sitting as you sit now**, and the next warm cup is the one you pour for someone…`
• `**Keep walking as you are**, and the track you take carries you down to where the grass is warm…`
• `**Follow the row as it stands** and you reach the edge with your own eyes clear on…`
Vzorec = [rozkaz pokračovat, jak jsi] + `and` + [co ti to přinese]. Tři porušení kánonu naráz:
**pojmenovaný krok** (že velí nic neměnit, ho nevyjímá) · **slib** (orákulum, ne zrcadlo) ·
**zavřený výklad** (dodá význam místo místa, kam se dívat).

⚠️ **Oprava vlastního měření z téhož dne.** Nejdřív jsem zapsal „imperativ 1× ze 6, není to
systém". Bylo to špatně: **skenoval jsem jen POSLEDNÍ větu**, a ve dvou ze tří případů sedí
rozkaz v **předposlední**. Kontrola běžela na užší ploše, než na jaké jev žije (§19.3).
Přeměřeno na posledních DVOU větách všech v4.14 čtení.

**Kde se to koncentruje:** 3/4 NORNS EN · 0/2 ostatní spready EN (Horseshoe, Kříž) · 0/1 IS.
**Hranice: n=6 celkem, z toho 4 Norns EN.** Netvrdí se, že je to výhradně Norns ani že EN/IS
rozdíl je reálný — na to jsou čísla příliš malá. Tvrdí se jen, že šablona existuje a opakuje se.

**② Zlom je přesně na třetí runě — čtení drží, dokud POPISUJE, a láme se, jakmile začne těšit.**
(Rozděleno `scripts/vety.js`, 5 vět — ne od oka; důvod výše v hlavičce toho skriptu.)
• [1] Othila = **materiál** (stůl prostřený rukama před ním, židle drží tvar) ✅
• [2]+[3] Isa = **materiál**, vyrenderovaná celá a nikdo ji nepřeruší (`the steam long gone,
  a thin skin forming on the surface` · `the waiting has a weight to it that the clock does
  not measure`) ✅ — **KUKY 2026-08-24 ukázal, že tohle JE Isa**; můj původní bod „Isa se nesmí
  prochladit“ byl špatně a je tím vyřízený.
• [4] Eihwaz = **přestaň být materiál a stane se tvrzením o člověku** ❌ — tři vady v jedné větě:
  `**yet**` (čtení se otáčí proti vlastnímu obrazu hned, jak Isa dodělá) · `a house that has
  **weathered this quiet before**` (přiřkne mu minulost — a to při **seeking=null, intention=null,
  žádná otázka**, čili z ničeho) · `**will fill again**` (slib o budoucnosti = orákulum, ne zrcadlo).
• [5] dosednutí = imperativ + dodaný význam ❌ (výše ①)

**Není to tedy „vada jen v dosednutí“.** Láme se už třetí runa, a dosednutí v tom jen pokračuje.
Rozdíl proti [1]–[3] je **jméno toho, co se popisuje**: dokud věta popisuje MÍSTNOST, drží
kánon; jakmile začne popisovat JEHO (co už přečkal, co ho čeká, co má dělat), padá.

⚠️ **Vlastní chyba, aby se neopakovala:** tvrdil jsem „věty 1–4 jsou v pořádku, vada je v páté“
— a týž den předtím o téže větě [4] něco jiného. Obě tvrzení byla o rozdělení vět a obě jsem
učinil **zpaměti, bez výpisu**. KUKY: *„tohle už se nemá stát“*. Kontrola = `scripts/vety.js`.

**③ Životní runa jako závěrečná čočka = jednotvárný konec (systémové).**
Ve **~7 ze 13** čtení s life=Gebo nese POSLEDNÍ věta explicitní dávání/výměnu: „pour for
someone" · „the giving of it" · „given freely" · „what would you owe" · „a gift you are not
ready to give back" · „whose morning was it made for" · „it is given". Čočka funguje podle
návrhu — jenže poslední věta je ta, co zůstane, a uživateli zní pořád stejně.
**Hranice:** posouzení 13 vět mým okem (věty jsou v handoffu vypsané, ať je owner vidí), ne
nástrojem; jeden uživatel, jedna životní runa. Netvrdí se nic o jiných životních runách.

**④ Hypotéza (NEOVĚŘENO): dosednutí se modelu čte jako „uklidni".**
v4.12 končila otázkami (`whose morning was it made for?`) — otázka nekonejší, drží otevřeno.
v4.13 dosednutí ten otázkový los **nahradilo**. Zabít obrácenou pákou (§25): ne přidávat
chlad, ale **ubrat dosednutí ještě víc** a nechat čtení skončit uprostřed obrazu. Nepohne-li
se konejšení, hypotéza padla a příčina je jinde.

## 2026-08-24 — Nit-recheck na materiálovém místě + screen dat v2
**Nit po odvýznamování DRŽÍ: 2/2 silná na Uruz-materiálu** — a zdůvodnění jsou MATERIÁLOVÁ
(„under the moss on these fallen stones" — ticho→řeč, povrch→pod mech), ne tematická jako
u hijacknuté Othily. Kontroly: 1/2 slabá ✓, 1/2 silná (havran-naslouchání→kořeny-držení —
tematická komplementarita existuje i bez místa; týž jev jako 1/6 v TEST 34). Hranice: n=2+2.
**Screen dat v2** (`docs/vegvisir-mista-v1.md`, přepisy tableau ✓): zbytkové flagy pro Cowork:
(a) Wunjo ≠ „ne prázdné" odporuje novému stavu „fullt af fólki↔tómt" · (b) Ehwaz ≠ „ne pevné
místo" zastaralé (identita už JE místo-áfangi) · (c) Gebo stav „bið↔koma" je story-stav
(čekání = Gebo děj) · (d) Sowilo „jörð sem bíður þess að birtan falli" = zbytková procesní
klauzule · (e) Othila story-klauzule zůstala (gradient 2/8 — rozhodnout, zda změkčit) ·
(f) potvrdit složeniny þröskuldssteinn · timburþil (slovník nezná; timburþil historicky přesné).
**Stav brány:** negativní půlka ✓ (materiál, TEST 37) · nit ✓ (2/2 materiálově kotvená) ·
zbývá pozitivní půlka = OKO OWNERA na pár čteních z materiálních míst. Pak milník 1→2→3
kompletní → návrh promptu skutečného ramene.

## 2026-08-25 — TEST 38 · Stav cesty (GPT model): jako NÁHRADA NEPOTVRZEN; dnešní mechanika vyšla nejsilněji; nástroj nucené volby FUNGUJE
2 řetězy (Isa→Ansuz→Raidho na Uruz suti · Perth→Tiwaz→Wunjo v Kenaz dílně), sdílené rameno 1,
tři buňky: **S\*** zděděný stav místa (extrakce z předchozího čtení) · **A** dnešní mechanika
(nesená fráze + losovaný stav) · **B** jen sdílené místo. 8 slepých soudců, NUCENÁ VOLBA
(která trojice mění význam KONKRÉTNÍ věci tak, že to v druhé vzniknout nemohlo) + cizí
kontroly. Korpusy `~/runar-eval/stav-cesty.jsonl` + `~/runar-eval/stav-cesty-verdikty.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
- **Kontroly 2/2:** B > ALIEN v obou řetězech — nástroj nucené volby s kotvou na vracející se
  věc PŘEŽIL cizí kontrolu (na rozdíl od otevřené emergence otázky z TEST 36). Máme funkční
  emergence-nástroj: „vrací se konkrétní věc a mění FUNKCI?"
- **A > B 2/2** (oba řetězy): nesená fráze dělá skutečnou proměnu věci ([]balvan němý→mluví
  stínem · tma: pozvání→sklad odloženého→vetřelec), sdílené místo samo ji dává jen náhodou.
- **S\* vs B 1:1 · S\* vs A 1:1** — stav cesty se od dnešní mechaniky NEODDĚLIL a proti holému
  místu vyhrál jen půlku. A predikovaná patologie se ukázala PŘÍMO: extrakce stavu na Uruz
  ZAMKLA mlhu (zděděný stav = mlha ve všech třech ramenech → soudce: „Y mlhu nikdy neruší"
  = statické); v Kenaz naopak držené dřevo/zrno proměnu neslo. Zděděný stav umí obojí —
  proměnu i zámek — a tím je jako mechanismus nespolehlivý.
**Závěr:** GPT princip („pozdější mění, co dřívější VĚC znamená") platí a MĚŘÍ SE — ale
implementuje ho už dnešní nesená fráze (povinná proměna jedné věci); dědění celého stavu
místa nepřidává změřený zisk a přidává riziko zámku scény. **Architektura zůstává: místo
(identita+losovaný stav) + nesená fráze + semínko návratu.** Hranice: n=2 řetězy, 1 soudce
na párování; 1 soudce (uruz S*vB) počítal výměnu kulis jako proměnu — doktrinální šum
nástroje, menšinový (1/8).

## 2026-08-25 — TEST 39 · Pohyblivá pouť vs statický domov: POHYB VYHRÁL 4/4 — a nit NEZTRATIL, ZESÍLIL
Owner (2026-08-25): „komu se bude líbit, že pro jedno čtení o 8 ramenech bude mít v každém
rameni stejný obraz jinak popsaný?" → test. 4 ramena (Fehu→Ansuz→Isa→Berkana), sdílené
rameno 1 (domov = Kenaz dílna), dvě buňky: **P** = krajina se posouvá (dílna → dvůr → stezka
u mohyly → soutěska) · **S** = všechna 4 ramena v dílně (dnešní mechanika). Obě buňky mají
nesenou frázi, vstupní věc i stav. 6 slepých soudců, nucená volba, obě polohy flipu + cizí
kontroly. Korpusy `~/runar-eval/pout-test.jsonl` + `~/runar-eval/pout-verdikty.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
- **Cesta: P 2/2** (v obou flipech). Soudce: „Y má soudržnost místa, X má trajektorii."
- **⭐ Nit: P 2/2 — pohyb nit NEROZBIL, ZESÍLIL ji.** To je proti očekávání (sdílené místo
  bylo domovem nitě). Mechanismus je čitelný z verdiktů: když se místo mění, model MUSÍ
  nesený materiál zapracovat do nové půdy, takže ho pojmenuje a promění („the wet you tracked
  in from the door is here again, older now, born from the rock itself" — vlhko z prahu →
  prach na botách → pramen ze skály, tři stavy, tři ramena). Ve statické dílně se materiál
  proměňovat nemusí, protože pořád leží na témž ponku — soudci to popsali jako „sdílené
  rekvizity / dohořívání téže scény", nikoli návrat věci v proměněné roli.
- **Kontroly 2/2:** P > ALIEN i S > ALIEN; ALIEN navíc označen jako rozpadlý. Rozpad na
  nesouvisejících scén: u P i S **žádný** — pohyb soudržnost nerozbil.
**Závěr:** ownerova námitka „prostředí ≠ cesta" POTVRZENA měřením a navíc bez ceny — pohyb
nestojí nit, platí ji. Architektura: **domov (životní runa) + POSOUVAJÍCÍ SE krajina +
vstupní věc + losovaný stav + nesená fráze + runa + semínko návratu.**
Hranice: 1 řetěz, 1 soudce/párování, EN, **pevné pořadí krajin** (zafixované schválně —
testoval se pohyb, ne pořadí; riziko poziční sémantiky přes krajinu zůstává NEZMĚŘENÉ).

## 2026-08-25 — TEST 40 · Tři cesty z jednoho domova: POUŤ VZNIKÁ (2/3 pouť, 1/3 mezi, sham=série)
Experiment owner+GPT: krajina se vybírá z PŘIPRAVENÉHO zásobníku (provizorní, 9 uzlů vč.
pobřeží — schválně) MATERIÁLEM nesené věci (výběrová výzva runu NEZNÁ → nezávislost
konstrukcí); runy nezávislé, bez opakování, bez domovské runy; rameno = znění TEST 39 beze
změny (jedna páka, §27). 3 cesty × 4 ramena z Kenaz dílny. 4 slepí soudci (pouť/série/mezi,
změny po ramenech) + sham kontrola. Korpusy `~/runar-eval/cesty-test.jsonl` +
`~/runar-eval/cesty-verdikty.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
- **cesta-A (dílna→brod→soutěska→potok): POUŤ.** Soudce: „pořadí nelze zaměnit… hrana musí
  být ohoblovaná dřív, než ji voda omílá" — hoblovaná hrana z dílny fyzicky nesená k brodu,
  přechod dokončen nevratně („the flat stones you crossed lie under the current now").
- **cesta-B (dílna→soutěska→brod→rozcestí): POUŤ** — a mění se i ČLOVĚK (pozorovatel → volí
  pod tlakem → přijat a volí z bezpečí). ⭐ Nejslabší kloub 1→2 = PŘESNĚ místo, kde extrakce
  selhala (vrátila jen „The" → přenos fakticky prázdný) — soudce slepě našel chybějící carry,
  aniž věděl, že chybí. Nosnost nesené fráze potvrzena z opačné strany.
- **cesta-C (dílna→hájek→potok→brod): MEZI.** Dvě vady: (a) rameno 2 nesenou věc („rough
  wood") NEzpracovalo — povinný carry model jednou ignoroval (1/9 přenosů); (b) rameno 3
  (Isa) = „nothing here is going anywhere" — zastavení bez změny, soudce trestá („pouť by
  potřebovala změnu v každém kroku"). → OTÁZKA PRO DESIGN: smí být rameno ZASTAVENÍM
  (Isa-pauza jako legitimní krok pouti), nebo je bez-změny vada? Rozhodne owner.
- **sham = SÉRIE** ✓ („dala by se číst v pořadí 4-2-1-3 beze ztráty — definiční test série").
  Soudcův řadicí test („šlo by číst v jiném pořadí beze ztráty?") = přenositelné kritérium.
- **Divergence: 3 různé trasy, žádná neskončila u moře** (n=3) — ale brod 3/3 = vodní uzly
  jsou měkký magnet výběru materiálem; hlídat na větším n (stejnost tras napříč uživateli).
Hranice: n=3 cesty, 1 soudce/cestu, EN, zásobník provizorní (CODE); extrakce frází potřebuje
guard proti jednoslovným/členovým výstupům („The") — opravit v harness před dalším během.

## 2026-08-25 — TEST 41 · SETKÁNÍ vs materiál: zapamatovatelnost 2/2 setkání · hijack 3/4 · pouť smíšená
Nápad ownera („zastaví se a sleduje ptáky, velrybu, zastihne ho krupobití"): vstupní slot smí
nést UDÁLOST/tvora/počasí, ne jen statický materiál místa. Trasy i runy **pinnuté na TEST 40**
(cesta-A, cesta-B) — jediná proměnná je obsah slotu. Setkání = provizorní data (skutečná =
Cowork), jen islandsky doložitelné (můra, ovce, havran, polární liška, koliha).
8 slepých soudců. Korpus `~/runar-eval/setkani-test.jsonl` + `~/runar-eval/setkani-verdikty.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
- **⭐ ZAPAMATOVATELNOST: setkání 2/2** (obě trasy, párově proti témuž materiálovému běhu) —
  přesně to, oč ownerovi šlo („osmkrát stejný obraz jinak popsaný" mizí).
- **HIJACK 3/4 runa vede** — setkání NENÍ automaticky tableau (na rozdíl od Gebo scény 0/4).
  Ale **1/4 padlo: polární liška** — soudce: „runa dostane jedinou abstraktní větu… nálepka
  položená vedle obrazu; čtení JE o lišce, co se napila a zmizela." **Vzorec:** setkání, které
  má vlastní silnou symboliku A JEŠTĚ ODEJDE (mizející tvor), přebere runu; setkání jako
  ZDROJ JEVU (havran = ozvěna, koliha = neviděný zvuk, ovce = kulisa přeskládaného brodu)
  runu nese. Kandidát na kritérium dat: **setkání smí být to, ČÍM se runa ukáže, ne příběh sám.**
- **POUŤ: B pouť · A „mezi"** — a příčina u A je jasně pojmenovaná: rameno 1 (můra u lampy)
  nemá do zbytku žádný šev, „cesta začíná až druhým ramenem". Kandidát: první rameno musí
  vyjít Z DOMOVA tak, aby z něj šlo co nést (můra je uzavřený obraz sama pro sebe).
- **Párově pouť 1:1** (materiál u trasy A, setkání u trasy B) — na kauzalitu pořadí jsou
  zatím vyrovnané; setkání vyhrálo tam, kde nese zapamatovatelnost.
**Směr (ne rozhodnutí):** vstupní slot rozšířit na setkání, s daty stavěnými podle kritéria
„zdroj jevu, ne vlastní příběh"; první rameno hlídat na návaznost.
Hranice: 2 trasy, 1 soudce/otázku, EN, provizorní setkání; carry-guard nasazen (padal by
prázdný extrakt, jako v TEST 40 cesta-B).
**Dodatek TEST 41 — dvě vady nalezené OWNEREM při čtení (harness, ne data):**
(a) **setkání vytlačí místo:** „The soft tap of the moth against the warm glass" — lampa
nepojmenována, dílna zmizela; když je ve vstupním slotu událost, model otevře událostí a
místo neustaví. Blok THE PLACE to nevynucuje → doplnit požadavek, že místo musí být vidět.
(b) **carry se TELEPORTOVAL:** „The stones that were held under high water lie dry here now"
v soutěsce — kameny z brodu nemohou být na jiném místě. Instrukce dovoluje „worked into this
new ground", ale nezakazuje fyzický přesun předmětu → carry se smí vracet jen jako STOPA,
PAMĚŤ nebo PROMĚNA v novém materiálu. ⚠️ Pozor: tahle vada mohla část „nitě" v TESTech 39–41
nafouknout (doslovný přenos se čte jako silná návaznost) — po opravě přeměřit.

## 2026-08-25 — TEST 42 · Skóre poolu momentů: NÁSTROJ MUSEL BÝT ROZDĚLEN NA DVA; Coworkovy predikce potvrzeny 4/5
Cowork dodal pool momentů (ÚKOL 1) a k němu VLASTNÍ seznam 5 predikovaných propadů (§27 útok
na vlastní data). Vzorek 10 (5 predikovaných + 5 kontrolních), každý s NÁVŠTĚVNÍ runou.
Korpusy `~/runar-eval/momenty-test.jsonl` · `~/runar-eval/momenty-verdikty.json` · `~/runar-eval/momenty-izolace.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
**⚠️ NÁSTROJ NEJDŘÍV NEOBSTÁL — a to je hlavní metodický nález.** Soudce nad HOTOVÝM ČTENÍM
označil za „runový hijack" i 3/5 kontrol, mj. „branka vrže ve večerním větru" s odůvodněním,
že brána-práh už znamená Perth — jenže ten rám postavilo ČTENÍ, ne moment. Míchaly se dvě
různé otázky. Rozděleno na dva nástroje:
- **A (moment SÁM, bez čtení): „je ten okamžik předurčený?"** → měří POOL.
- **B (hotové čtení): „dělá jméno runy ještě nějakou práci?"** → měří ČTENÍ, ne data. Také
  užitečné, ale na pool se použít nesmí.
**Nástrojem A: Coworkovy predikce POTVRZENY 4/5 předurčené** (Berkana pupen · Ingwaz zeleň ·
Eihwaz ohyb koruny · Tiwaz kámen ve větru; Dagaz „první světlo" = částečně). **Kontroly
1/5 předurčené** — takže rozlišuje. ⭐ **NOVÝ NÁLEZ, který Cowork nepredikoval: Hagalaz
„hagl safnast í skjóli við vegginn"** — soudce: „ochrana zadržuje a hromadí právě to, před
čím měla ochránit" = hotový aforismus, ne okamžik. Base rate nepredikovaných ≈ 20 %.
⚠️ **Hranice nástroje A: ŽÁDNÝ moment nedostal „otevřený" (0/10)** — horní pásmo škály je
prázdné, takže nástroj rozliší předurčený vs. částečně, ale ne dobrý vs. výborný; nevíme,
jestli je to vlastnost poolu, nebo přísnost škály. Cíl pro data = „částečně", ne „otevřený".
**Vedlejší, měřeno nástrojem B:** nosnost pro carry **10/10** · viditelnost místa **8/10**
(propadly „pokoj u okna" a „zelený břeh" — obě místa s tenkou identitou; potvrzuje kritérium
bohatosti z TEST 35) — oprava bloku („místo musí zůstat vidět") tedy funguje, ale nezachrání
chudé místo. Hranice: 1 soudce na otázku, EN překlad IS momentů.

## 2026-08-25 — TEST 43 · Oprava carry: teleport PRYČ, ale NIT ZESLÁBLA (oprava byla příliš tvrdá)
Owner našel dvě vady (TEST 41 dodatek); opraveny oba bloky (místo musí zůstat vidět · carry
nesmí přenést TÝŽ předmět jinam) a přegenerována cesta, kterou owner četl. Slepě 3 soudci.
- **Teleport PRYČ ✓** — soudce označil za fyzicky nemožnou jen starou verzi („kameny, které
  byly pod vysokou vodou, tu leží suché" v soutěsce); nová čistá. Místo vidět ✓ (lampa
  konečně pojmenovaná).
- **⚠️ ALE NIT ZESLÁBLA: soudce vybral STAROU verzi** — nová „sdílí kulisu, ale nese ji beze
  změny funkce, což je kulisa, ne nit". **Tím se potvrzuje varování z dodatku TEST 41: část
  „nitě" v TESTech 39–41 stála na fyzicky nemožném přenosu.** Čísla nitě z těch testů jsou
  proto nadhodnocená — korekce do záznamu, ne přepis závěrů (pohyb > statika platí dál, ale
  s menším odstupem, než čísla říkala).
- **Diagnóza je přesná a ukazuje třetí verzi:** stará verze byla silná tím, že věc MĚNILA
  FUNKCI napříč rameny (opora pod vodou → stěna vracející hlas → sevření, které se otevře);
  vadné na ní bylo jen tvrzení, že jsou to TYTÉŽ kameny. Můj zákaz vzal obojí. → v3: zakázat
  týž PŘEDMĚT, ale VYŽÁDAT si odpověď — „toto místo má něco svého, co nesenou věc potká;
  pojmenuj obojí". Zpětný odkaz zůstane, fyzická nemožnost ne.
- **Liška hijackuje DÁL** (moje domněnka „oprava ji možná spravila" byla mylná — proto se
  netvrdila bez měření). Soudcův přenositelný test: *„vyjmi větu s runou — když čtení nic
  neztratí, vede moment."* Potvrzuje kritérium poolu: mizející tvor si rameno vezme.
Korpusy `~/runar-eval/setkani-fix-test.jsonl`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->

## 2026-08-25 — TESTy 44–45 · Carry blok: ČTYŘI VERZE, ŽÁDNÁ ČISTÁ — a kontrola ukázala, že vada NENÍ ve znění
Iterace po ownerově nálezu (carry teleport). Osy: fyzická možnost · síla nitě · přirozenost.
| verze | teleport | nit | přirozenost |
|---|---|---|---|
| v1 původní | ✗ nemožný přenos | ✓ silná | **✗ mechanická** |
| v2 „zákaz předmětu" | ✓ | ✗ slabá | — |
| v3 „+ vyžádané setkání" | ✗ (nesl dno brodu) | ✓ **nejsilnější** (jedna nit přes 4 ramena) | ✗ mechanická |
| v4 „+ zákaz ohlašování" | ✓ | ✗ slabší | ✗ mechanická |
**⭐ KONTROLA NÁSTROJE (§27) — a je to hlavní nález:** metrika přirozenosti dostala (a) původní
verzi v1 a (b) čtveřici BEZ jakéhokoli carry (slepenec z cizích čtení).
- **v1 = mechanická** → moje opravy mechaničnost NEZPŮSOBILY, byla tam od začátku.
- **bez carry = PŘIROZENÉ** → metrika umí říct „přirozené", není rozbitá. A soudce v té
  čtveřici našel NEINSTRUOVANOU tonální nit (ruka/držení: „hands feel the end" → „quiet
  hold" → „keeping time" → „tongs in your grip") — *„motiv, který čtenář pozná sám, když
  nikdo nic nepodstrčí"*.
**ZMĚŘENÝ TRADE-OFF, ne vada ke spravení:** **instruovaný carry → pouť, ale mechanická ·
žádný carry → přirozené, ale NENÍ to pouť** (táž čtveřice je opakovaně souzena jako „série,
šla by číst v pořadí 4-2-1-3"). Nehledá se lepší formulace, hledá se MÍRA.
**Mechanismus mechaničnosti pojmenován (soudci 2×, nezávisle):** ne carry sám, ale
**opakování TÉŽE syntaktické konstrukce ve stejném slotu** („the X you carried" 3× · „vec
z minula + vztažná věta + here now" 2×). U v1 doslova: *„Kdyby se ta věta v R4 nezopakovala
v téže konstrukci, prošlo by to jako přirozené."* → **v5 (neprovedeno): carry vyžádat, ale
zakázat tvar — vrací se pokaždé v JINÉ gramatické roli** (jednou jako podklad, jednou jako
překážka, jednou jako zvuk; návrh vzešel od soudce).
**Metodická hranice:** párový soudce plausibility NESKÓRUJE, ŘADÍ — v3 byla „čistá" proti v1
a „nemožná" proti v4 (týž text). Absolutní verdikt chce skórování po jedné čtveřici.
Korpusy: `~/runar-eval/setkani-{fix,v3,v4}-test.jsonl`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->

## 2026-08-25 — TEST 46 · ABSOLUTNÍ SKÓROVÁNÍ (owner: „udělej co je potřeba") — a PŘEPISUJE ZÁVĚRY TESTŮ 43–45
Owner našel metodickou vadu: párový soudce NESKÓRUJE, ŘADÍ (tatáž v3 „čistá" proti v1,
„nemožná" proti v4). Postaveno absolutní skórování: 10 soudců, **každý vidí JEDNU čtveřici**,
s pevnými měřítky, bez srovnání. Korpus `~/runar-eval/absolutni-skore.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
| verze | nit (absolutně) | fyzicky nemožné |
|---|---|---|
| v1 původní | silná | **ANO** (kameny brodu v rokli) |
| v2 zákaz předmětu | **silná** | ne |
| v3 vyžádané setkání | silná | ne |
| v4 zákaz ohlášení | silná | ne |
| kontrola BEZ carry | **slabá** | ne |
**⚠️ KOREKCE ZÁZNAMU (§22):** párové soudy tvrdily, že u v2 a v4 „nit zeslábla" — **absolutně
mají obě nit SILNOU.** Párový soudce vybere vítěze a poraženého pak zracionalizuje jako
„sdílené kulisy"; týž text absolutně čte jako silnou nit. Věty o zeslábnutí nitě v zápisech
TESTů 43–45 tedy NEPLATÍ jako fakt o textu, jen jako výsledek srovnání.
**Co platí po korekci:** (a) carry dělá skutečnou práci — jediná čtveřice se slabou nití je
ta BEZ carry; (b) fyzickou vadu měla jen v1, všechny tři opravy ji odstranily; (c) **v2 je
nejjednodušší verze, která je čistá i silná** — a nikdy nebyla měřena na přirozenost;
(d) zbývající otevřená osa je přirozenost, kde všechny MĚŘENÉ instruované verze (v1, v3, v4)
vyšly „mechanické" a jediné „přirozené" bylo čtení BEZ carry.
**⭐ PRAVIDLO DO METODIKY (platí na všechna budoucí měření):** *párové soudce používat na
otázku „která z těch dvou", absolutní na „jaké to je" — a výsledky si nikdy neplést.*
Párové srovnání nesmí být zdrojem tvrzení o vlastnosti textu.

## 2026-08-25 — TEST 47 · Carry blok VYŘEŠEN: vítěz je v2 — čistá na všech třech osách
Dopočítáno chybějící políčko (v2 nikdy nebyla souzena na přirozenost). 2 soudci, absolutně,
jedna čtveřice, různé úrovně effortu — **oba „PŘIROZENÉ"**.
| verze | nit | fyzicky nemožné | přirozenost |
|---|---|---|---|
| v1 původní | silná | **ANO** | mechanické |
| **⭐ v2 „zákaz přeneseného předmětu"** | **silná** | **ne** | **přirozené 2/2** |
| v3 „+ vyžádané setkání" | silná | ne | mechanické |
| v4 „+ zákaz ohlášení" | silná | ne | mechanické |
| kontrola bez carry | slabá | ne | přirozené |
**⭐ Poučení, které stálo čtyři kola:** vítězná oprava byla ta, která jen ODEBRALA vadu.
Obě moje „vylepšení" (v3 vyžádat setkání, v4 zakázat ohlašování) přidala POŽADAVEK — a každý
přidaný požadavek se v textu projevil jako formule ve stejném syntaktickém slotu. **Oprava
promptu = odebrat vadu, ne přidat pravidlo.**
**Znění v2 (kanonické):** nesená věc musí být v rameni přítomná — proměněná, obroušená,
zapracovaná do nové půdy, nebo jako to, co už tu není — ale **NIKDY jako týž předmět
přenesený sem; tahle půda má věci vlastní. Když sem nemohla doputovat, nedoputovala.**
Bez doslovného opakování, bez přirovnání, bez jména runy.
**Watch (oba soudci nezávisle):** (a) definiční věta runy sedí ve všech ramenech ve stejném
slotu („X is that…") — formule UVNITŘ ramene, zatím únosná, ale při osmi ramenech může začít
být slyšet; (b) „No more close walls here" = jediné místo, kde text dělá účetnictví, drží
jen proto, že je řečené obrazem; (c) spoj 1→2 je fakticky prázdný — nit začíná až druhým
ramenem (týž nález jako u „první stopy", TEST 41).
Korpus `~/runar-eval/absolutni-skore.json` + `~/runar-eval/setkani-fix-test.jsonl`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->

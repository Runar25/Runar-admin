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

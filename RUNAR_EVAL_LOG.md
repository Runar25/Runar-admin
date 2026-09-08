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

## 2026-08-25 — TEST 48 · Revidovaný pool momentů: 0/12 předurčených, a horní pásmo se otevřelo
Cowork přepracoval pool podle měření (TEST 42) a poslal ho k přeskórování. Screenováno
12 NOVÝCH/změněných momentů nástrojem A (moment sám, bez čtení) + **pozitivní kontrola**
(Berkana „brum springur út", o níž víme, že je předurčená — kdyby ji screen neoznačil, ujel
nástroj, ne pool). Korpus `~/runar-eval/momenty-v2-screen.json`. <!-- doc-links:ok 2026-08-25 korpus mimo repo (~/runar-eval), checker home neresi -->
- **Nové momenty: 0 předurčených** (10 částečně · **2 otevřené**). Předchozí base rate byl
  ~20 % předurčených — po revizi nula ve vzorku.
- **Pozitivní kontrola vyšla „předurčený" ✓** — nástroj nedriftoval.
- ⭐ **Horní pásmo škály se otevřelo:** dosud nedostal „otevřený" žádný moment (0/10), teď
  **2/12** — Hagalaz „hagl hvítnar á svörtum sandi og bráðnar í dökka bletti" a Isa „snjór
  hefur fokið í skafla á ísnum". Soudce u Hagalazu: *„unese nejmíň tři odlišná čtení…
  zároveň to není vágní: má místo, materiál, barvu i čas."* → **limit zapsaný u nástroje
  („rozliší předurčený od částečně, ne dobrý od výborného") NEPLATÍ** — byl vlastností
  tehdejších dat. Opraveno v `docs/vegvisir-rubrika-pouti.md`.
- **Vzorec dobrého momentu (z obou „otevřených"):** proměna látky bez děje s vyústěním —
  bílé mizí do tmavé skvrny · vítr už odešel a zbyl jen jeho otisk. Žádný směr, žádné
  hodnocení, a přesto ostrý obraz.
**Zpět Coworkovi (2 věci):** (a) **Berkana „brum springur út" v poolu ZŮSTALA** — potvrzeně
předurčená, přepsat nebo vědomě nechat s důvodem; (b) sekce PREDIKOVANÉ PROPADY na konci
handoffu je **zastaralá** — jmenuje momenty, které v revidovaném poolu už nejsou (Dagaz
první světlo, Ingwaz zeleň, Eihwaz ohyb koruny, Tiwaz vítr).
**Jazyk (CODE, role vazby/idiomu):** rykkorn · ljósrák · gluggapóstur · skafl · klasi · þúfa
· löður · grugg · rás · skora — slovník zná všechna. „hefilspænir" heslo nemá (průhledná
složenina hefill+spænir, v poolu byla už dřív).

## 2026-08-26 — Data pouti KOMPLETNÍ: momenty (24 míst) + krajiny (22) uloženy do repa
Cowork dodal obě sady; **uloženo CODE-tune** (Cowork do repa nepíše):
`docs/vegvisir-momenty-24-mist.md` · `docs/vegvisir-krajiny-22.md`.
Berkana „brum springur út" PŘEPSÁNA na „regndropar hanga á neðstu greinunum eftir skúr"
(Cowork přijal nález izolace a sám opravil i to, že jeho původní „nechat" stálo na
supersedovaném soudci přes hotové čtení — správná aplikace §27).
**Jazykový screen krajin (role CODE):** slovník zná troðningur · mosaþemba · rjóður · sylla ·
fuglager · landfesti · apalhraun · helluhraun · dropasteinn · snjóskafl · melalda · leirhver ·
brennisteinn · jökulurð · kvísl · sandbleyta. **Heslo nemají** (všechno průhledné produktivní
složeniny, doporučeno ponechat): mýrarsund · vegslóð · lækjarsytra · klettanibba · netahrúga ·
vindrák · fífuhnoðri · bráðvatn. ⚠️ K potvrzení Coworkem, jestli některá nezní knižně.
**Stav mechaniky:** všech sedm prvků ramene má data i změřený blok — domov · krajina (22) ·
moment (24 míst) · carry v2 · vstupní věc · stav · semínko návratu. Jediný neměřený prvek
zůstává ČAS (9 nocí, hypotéza do živých testerů).
**Připraveno k dlouhému běhu** (6–8 ramen, rubrika `docs/vegvisir-rubrika-pouti.md`) —
čeká na rozhodnutí ownera o rozsahu (+ zda rovnou worst-case sekvence run).

## 2026-08-26 — TEST 49 · PRVNÍ PLNÁ POUŤ (8 ramen) — a ⚠️ NÁSTROJ NA TÉHLE DÉLCE NEOBSTÁL
Kompletní mechanika, žádná dramaturgie: domov Uruz (suť) · 8 run bez opakování · krajina
vybíraná materiálem z 22-zásobníku bez opakování · carry v2 · **rameno 8 ZÁMĚRNĚ bez bloku
návratu** (owner+GPT: R8 se nezamyká). Trasa: suť → lávová pláň → jeskyně → bažina →
hverasvæði → čelo ledovce → náplavy → štěrková pláň. Korpus `~/runar-eval/pout8.jsonl`
+ `~/runar-eval/pout8-rubrika.json`. <!-- doc-links:ok 2026-08-26 korpus mimo repo (~/runar-eval), checker home neresi -->
| osa | verdikt |
|---|---|
| 1 Jedna cesta | pouť ⚠️ (kontrola selhala — viz níž) |
| 2 Místo přítomné | **8/8** |
| 3 Runa vede | **5/8** (hijacky: 6 Nauthiz runový · 7 Dagaz runový · 5 Wunjo obrazový) |
| 4 Nit | silná ⚠️ (kontrola selhala) |
| 5 Fyzická možnost | **NEMOŽNÉ** — rameno 4: „the rain that ran off the roof behind you" |
| 6 Přirozenost | **mechanické** |
| 7 Zastavení | rameno 2 (Isa) = **legitimní zastavení** · rameno 4 = **výpadek** |
| 8 Stojí za to číst dál | ano — „ale těsně, a ne kvůli hloubce: nulové sázky" |
**⚠️ KONTROLY SELHALY (povinné dle rubriky):** slepenec z 8 nesouvisejících čtení dostal
na ose 1 **„mezi"** (měl „série") a na ose 4 **„silná"** (měl „slabá").
→ **Osy 1 a 4 na osmi ramenech NEPLATÍ** — verdikt „pouť / silná nit" pro skutečnou pouť se
nesmí citovat. Pravděpodobná příčina: čím víc textu, tím snáz soudce najde pojivo; nástroj
kalibrovaný na 4 ramena při 8 ztrácí rozlišovací schopnost. **Oprava před dalším během:**
kontrolu dělat vždy na TÉŽE délce a osy 1/4 přeformulovat tak, aby nešly splnit atmosférou
(u osy 1 vyžádat jmenovitě dvojice ramen, které NELZE prohodit, a počítat je).
**Co platí (osy bez selhané kontroly):**
- ⭐ **Carry v2 se na osmi ramenech STAL FORMULÍ.** Soudce: „táž konstrukce ve VŠECH SEDMI
  přechodech — slot ‚položka z minula, přetavená/popřená'", nejnápadněji rameno 6
  („No sulphur stains this ground" — zmínka jen proto, aby se odškrtla). **Vítězství v2
  ze čtyř ramen NEŠKÁLUJE na osm.**
- **Rameno 4 = dvojitá vada:** fyzicky nemožný déšť z jeskyně „za zády" (devět nocí chůze
  daleko) + doslovně zopakovaná závěrečná formule z ramene 2 („going nowhere"). Soudce to
  klasifikoval jako **výpadek**, ne zastavení — a odlišil od ramene 2, kde je zastavení
  legitimní (Isa: „krok se nehýbe, ale nese to"). Osa 7 tedy funguje.
- **3/8 hijacků** — Nauthiz a Dagaz runové (ledovcové drcení JE „tlak, co dal hranu"; Dagaz
  = úsvit a scéna je doslova první světlo), Wunjo obrazový (vroucí sirné jámy přetlačí runu).
  ⚠️ Dagaz-hijack vznikl přes VSTUPNÍ VĚC z krajiny, ne z poolu momentů — riziko není jen
  v datech momentů, ale i ve dvojici runa × krajina.
- **Osa 8: „ano, ale těsně — nulové sázky."** Spodní hranice kvality je zatím splněná
  strukturou, ne obsahem; nejcennější poznámka pro produkt.
**Dodatek TEST 49 — nálezy ownera (2026-08-26):**
(a) ⭐ **Rameno 4 má vadu OBRAZU, ne jen vzdálenosti.** Soudce viděl fyzickou nemožnost
(déšť z jeskyně devět nocí daleko); owner viděl přesněji: *„déšť naráží do střechy —
nevidím tu jeskyni"*. Sloveso „ran off the roof" postaví čtenáři před oči DŮM; jeskyně má
strop, ze kterého kape dovnitř, ne střechu, ze které stéká. Ze skalní STĚNY by týž přenos
fungoval. → **Nová třída vady: nesená věc dostane sloveso/objekt z jiného světa, než je
místo.** Fyzická kontrola (osa 5) ji chytí jen náhodou.
(b) ⭐ **Kvalitu nese OTÁZKA, ne popis** (owner o rameni 5): *„Do you kneel at the quiet rim,
or walk on toward the roar? — celkem reálná a člověk nad ní musí přemýšlet."* Vzorec:
konkrétní situace · dvě skutečné možnosti · žádná označená jako správná · reálný důsledek ·
smí být i metaforická. Táž kvalita jako dřívější „Which piece do you set down in the dark
to keep the one under your hands whole?" (Tiwaz). → **přidána osa 9 do rubriky**; do promptu
se NEPÍŠE (dramaturgie zadními vrátky).
(c) Owner koriguje mou pochvalu: *„pouť je OK, ale rozhodně není krásná… text musí být
lepší."* Konstrukce pouti obstála, ÚROVEŇ TEXTU ne — nezaměňovat.
(d) **Osy 1 a 4 zostřeny vyžádanými citacemi** — selhání kontroly nebylo délkou (slepenec
BYL osmiramenný), ale tím, že šly splnit atmosférou. Nové znění žádá jmenovité dvojice
ramen, které nelze prohodit, + citaci ke každému stavu nesené věci.

## 2026-08-26 — TEST 50 · DRUHÁ POUŤ (8 ramen, jiný domov i runy): slabina je SYSTEMATICKÁ, ne náhoda
Táž architektura, žádná nová pravidla (návrh GPT: zjistit, jestli byla pouť 1 slabá náhodou).
Domov Laguz (fjara u ústí) · runy Thurisaz→Berkana→Raidho→Othila→Eihwaz→Gebo→Hagalaz→Tiwaz ·
trasa: fjara → lávová pláň → jeskyně → rokle → stráň → údolí → drnová stavení → oblázkový val.
Souzeno **zostřenou rubrikou** (osy 1 a 4 s vyžádanými citacemi, nová osa 9).
Korpusy `~/runar-eval/pout8b.jsonl` + `~/runar-eval/pout8b-rubrika.json`. <!-- doc-links:ok 2026-08-26 korpus mimo repo (~/runar-eval), checker home neresi -->
| osa | pouť 1 | pouť 2 |
|---|---|---|
| 1 jedna cesta | „pouť" (kontrola SELHALA) | **2 citovatelné dvojice** · sham **0** |
| 2 místo přítomné | 8/8 | 8/8 |
| 3 runa vede | 5/8 | **6/8** (hijacky: 3 a 4 obrazové, 7 runový) |
| 4 nit | silná (kontrola selhala) | silná — ⚠️ **kontrola SELHALA ZNOVU** |
| 5 fyzicky nemožné | ANO | **ne** |
| 6 přirozenost | mechanické | **mechanické** |
| 7 zastavení | rameno 4 = výpadek | rameno 4 = výpadek |
| 8 stojí za to číst dál | ano (těsně) | **NE** |
| 9 zastavující otázka | (neměřeno) | **3** (R4, R5, R7) |
**⭐ OSA 1 OPRAVENA, OSA 4 NE.** Vyžádané citace jednosměrných vazeb fungují: slepenec dostal
**0** dvojic, skutečná pouť 2. Osa 4 ale i s citacemi dala slepenci „silná" — nesouvisející
čtení sdílejí obecný slovník (mech · kámen · držení) a soudce z nich poskládá „řetěz" náhodou.
**Oprava do rubriky:** u osy 4 vyžadovat, aby pozdější citace obsahovala ZPĚTNÝ ODKAZ (určitý
člen/deixe: „the moss now gone", „the water that ran thin behind you") — sdílený slovník bez
odkazu se nepočítá. Totéž, co osu 1 spravilo.
**⭐ HLAVNÍ NÁLEZ — mechaničnost je systematická, ne náhodná.** Obě pouti „mechanické" se
STEJNOU diagnózou: (a) definiční věta runy 8× v identické konstrukci („X is …") — nikdy jiná
cesta k runě; (b) carry jako inventura („položka se zavede, odškrtne, doznají se, že už tam
není"). Soudce pouti 2: „To není paměť pouti, to je předávání předmětů."
**⚠️ Výpadek v rameni 4 v OBOU poutích** (n=2, může být náhoda — ale sledovat, jestli je
pozice 4 slabé místo: dost daleko, aby se prvotní materiál vyčerpal, a dost brzo, aby ještě
nebyl návrat).
**Osa 8 = tvrdý produktový nález:** pouť 1 „ano, těsně", pouť 2 **„ne"**. Spodní hranice
kvality NENÍ spolehlivě splněná. Soudce pouti 2 pojmenoval i to, co drží: konkrétní krajina ·
dva citovatelné stehy mezi rameny · závěr Tiwaz („grain holding true after the water took
everything softer away" = jediný obraz, který zní jako výsledek cesty).
**Osa 9 funguje** — našla 3 otázky a nejčistší je přesně ownerem popsaná forma: „Does the
water bend around the stone, or does it wait for the stone to give?" (konkrétní situace ·
dvě skutečné možnosti · žádná označená jako správná). Osa 9 je použitelná jako měřítko
kvality, aniž se cokoli píše do promptu.

## 2026-08-26 — TEST 51 · Owner: „3× mech, 2× kámen, nic živého" — příčina NALEZENA a částečně opravena
Owner po přečtení pouti 2: *„líbilo by se mi, kdyby si vybíral i něco jiného než 3× mech, 2× kámen.
Pořád se drží krajiny nehmotných předmětů, a přitom je v přírodě tolik živého."*
**Tři příčiny, jedna moje:**
1. ⚠️ **MOJE CHYBA:** do generátoru jsem z Coworkových **6 efni** propsal jen **3** a vybíral je
   pevným indexem `k % 3` — proto měly pouti 1 i 2 na týchž krajinách TÝŽ vstup („the cracks in
   the lava" a „daylight at the mouth" v obou). Opraveno: plná sada + losovaný výběr.
2. **Datová díra:** živé věci bydlí v poolu MOMENTŮ, a ten existuje jen pro 24 **domovů**.
   Krajiny (22) mají jen efni — a ta jsou skoro celá nerostná. Ramena 2–8 tedy nemají odkud
   vzít nic živého. (Díra pojmenovaná už u TESTu 49, neuzavřená.)
3. **Carry táhne tutéž látku dál** (mech → mech → mech). Zčásti žádoucí (je to nit), ale nesmí
   být jediným zdrojem.
**Změřený efekt opravy (pouť 3, domov Fehu-túnfótur, runy Kenaz→Ehwaz→Isa→Fehu→Perth→Algiz→
Jera→Ansuz):** vstupy se přestaly opakovat mezi poutěmi ✓, ale **živé se objevilo jen 1×**
(„birds keeping off the hot ground") + ovce v domovském momentu. Důvod je počitatelný:
do testu jsem přidal **jeden živý prvek na krajinu z šesti**, takže při losování vyjde živé
zhruba **1× za pouť** — přesně to se stalo. **Mechanika je opravená, poměr v datech ne.**
→ **ÚKOL 3 pro Cowork:** momenty pro 22 KRAJIN (jako pro domovy) — a v nich živé tam, kde
místo život má (ovce, koně, havran, koliha, jespák, kajka, lundi na bjargu, silungur/bleikja
v tůni, velryba jen ve fjordu). Kritéria stejná: moment je to, ČÍM se runa ukáže, ne příběh;
tvor spíš zůstává, než aby odešel jako pointa; místo musí zůstat vidět.
Korpus `~/runar-eval/pout8c.jsonl`; texty všech tří poutí → `docs/vegvisir-pouti-texty.md`
(uloženy 2026-08-26 na ownerův dotaz „kde je text pouti?" — dosud bylo v repu jen měření).

## 2026-08-26 — TEST P1 · Pozitivní učení (few-shot korpus) — BĚH ROZDĚLANÝ, soudy stopnuty ownerem
Handoff Cowork-read PROKLEPNUT proti repu (jejich tvrzení ověřena): `DEF_CHAR` ř. 31
„Draw the picture and stop there — never hand the seeker a conclusion" ✓ · ořez promptu hotový
(DECISIONS 154→178) ✓ · 2.os. few-shot v promptu už je ✓ · self-reference 24/25 (DECISIONS 2219) ✓.
**Design:** A = produkční prompt · B = +korpus s příkladem TÉŽE runy · C = +korpus BEZ ní
(počet příkladů konstantní = 2). Runy Tiwaz + Eihwaz × 3 seedy = **18 čtení**, produkční single
cesta (EN, noq). Rámování drženo FIXNÍ jako zdroj, ne direktiva. Korpus = 3 owner-potvrzené
příklady (Tiwaz definiční věta · Wunjo otázka · Eihwaz otázka).
⚠️ **Nic z toho se NEDOTKLO produkčního promptu** — korpus žil jen v testovacím generátoru.
**HOTOVO a ověřeno — metrika doslovného kopírování:**
- Napříč všemi 18 čteními **0 čtyřgramových překryvů** s korpusem. Jediný společný trojgram je
  „Tiwaz is the" — a **má ho i buňka A, která korpus nikdy neviděla** → nulová kontrola říká
  produkční konstrukce, ne převzetí.
- Metrika zaútočena protipříkladem (§27): doslovná kopie věty dá **6** čtyřgramů, parafráze **1**,
  reálná čtení **0**. Není to slepá nula.
- Seed-and-assert: ověřeno, že blok korpusu skutečně dorazil do system promptu buňky B/C a v A není.
- Konvergence uvnitř buňky (párový 4-gram mezi 3 seedy): Tiwaz A 2,3 · B 0,0 · C 5,0 ·
  Eihwaz A 1,0 · B 0,3 · C 0,7. **n=3 na buňku — nic z toho zatím neznamená nic.**
**ROZDĚLANÉ (stop ownera, tokeny):** dvě slepé dávky soudců — kvalita 19 (18 čtení + známé dobré
jako pozitivní kontrola) a reprodukce 13 (12 čtení B/C + **nastražená syntetická kopie**, kterou
soudce MUSÍ chytit, jinak je slepý). Zamíchané soubory a mapa: `~/runar-eval/p1-blind-kvalita.json` <!-- doc-links:ok 2026-08-26 korpus mimo repo (~/runar-eval), checker home neresi -->
· `p1-blind-repro.json` · `p1-mapa.json` · korpus čtení `p1-corpus.jsonl`. <!-- doc-links:ok 2026-08-26 korpusy mimo repo (~/runar-eval) a session-scoped workflow skript, checker je nevidi -->
Workflow skript k obnovení: `workflows/scripts/p1-soudy-wf_822d72b8-1f8.js`. <!-- doc-links:ok 2026-08-26 skript zije v session adresari, ne v repu -->
**Nezměřeno tedy zůstává to podstatné:** jestli korpus zvedl KVALITU. Bez toho se o P1 nesmí
tvrdit nic — ani úspěch, ani neúspěch.

## 2026-08-27 — TEST P1 DOKONČEN · Pozitivní učení: **kvalita se nezvedla, a metrika imitace je NEPLATNÁ**
Doběhly obě slepé dávky + dodatečná nulová kontrola. **Obě pozitivní kontroly držely:**
známé dobré čtení (driftwood Tiwaz) dostalo plný počet ✓ · nastražená syntetická kopie byla
chycena jako „doslovné" i s citací ✓ → soudci nejsou slepí a data se smějí číst.
**KVALITA (n=6 na buňku, absolutně, zamíchané):**
| buňka | obraz z věcí | definiční věta | otázka s volbou | přirozenost |
|---|---|---|---|---|
| A (bez korpusu) | 6/6 | 6/6 | **1/6** | 6/6 |
| B (příklad TÉŽE runy) | 6/6 | 5/6 | **1/6** | 6/6 |
| C (jen cizí příklady) | 6/6 | 6/6 | **1/6** | 6/6 |
→ **Žádný efekt.** Buňky jsou k nerozeznání. Nejzajímavější je otázka s volbou: korpus ji
ukazoval jako vzor DVAKRÁT ze tří příkladů a zůstala **1/6 i tam**. Ukázka chování se
nepřenesla; přitom pozitivní kontrola tu osu splnila, takže soudci ji umí najít, když tam je.
**DOSLOVNÉ KOPÍROVÁNÍ:** 0 čtyřgramových překryvů ve všech 18 čteních (metrika ověřená
protipříkladem, nulová kontrola = buňka A). Prior self-reference 24/25 se **nepotvrdil** —
pravděpodobně proto, že rámování bylo zdroj, ne direktiva. Ale viz níž: netvrdí se víc, než
bylo změřeno.
**⭐ METRIKA STRUKTURNÍ IMITACE NEOBSTÁLA (§27) — hlavní nález testu.**
Slepý soudce označil B 4/6 a C 3/6 jako „strukturní". Vypadalo to jako past, kterou jsme čekali.
**Nulová kontrola to zabila:** táž otázka, tytéž příklady, ale čtení z buňky **A, která korpus
NIKDY neviděla** → **3× strukturní, 1× DOSLOVNÉ, 2× čisté.** Čtení, které příklady nemohlo
vidět, dostalo verdikt „doslovné" (`Eihwaz-A-1`, soudce citoval „finds its line" → „holds its
own line"). **Soudce tedy měří sdílený hlas a společné téma, ne přebírání** — číslo 7/12 z B/C
neznamená nic a nesmí se citovat.
→ **Do rubriky:** osa imitace VŽDY s nulovou kontrolou (buňka, která příklady neviděla).
Bez ní je „strukturní imitace" nerozlišitelná od toho, že dvě čtení téže runy mluví o tomtéž.
**VERDIKT P1:** hypotéza **nepotvrzena na kvalitě** (plochý výsledek na všech čtyřech osách,
n=6/buňku) a **neměřitelná na imitaci** dosavadním nástrojem. Produkčního promptu se nic
nedotklo. Korpusy: `~/runar-eval/p1-corpus.jsonl` · `p1-soudy.json` · `p1-null-repro.json`. <!-- doc-links:ok 2026-08-27 korpusy mimo repo (~/runar-eval), checker home neresi -->
**Co by teprve mělo smysl zkusit** (ne teď): korpus ze **skutečných produkčních** single/spread
čtení kurátovaných ownerem (dosavadní seed byl 3 příklady z Vegvísiru), větší n, a osa imitace
přepsaná tak, aby prošla nulovou kontrolou.
**Dodatek k P1 — vada NÁVRHU testu (CODE-tune, sebekritika 2026-08-27):** tři ze čtyř os kvality
byly v **A stropu** (obraz 6/6, definiční věta 6/6, přirozenost 6/6) ještě než korpus vstoupil.
Na těch osách se **nemohlo ukázat zlepšení, ani kdyby nastalo** — nebyl kam. Reálně tedy P1
měřil JEDINOU osu s prostorem: otázku s volbou. **„A=B=C na čtyřech osách" je tedy slabší
tvrzení, než vypadá**: je to „žádný efekt na jedné ose při n=6", ne „žádný efekt na kvalitě".
Příští běh musí mít osy s hlavou (stupnice, ne ano/ne) nebo těžší vzorek.
⭐ **Nejcennější číslo z P1 je ale baseline, ne srovnání:** **otázka s volbou vychází 1/6 i bez
korpusu** — tedy současná produkce dává formu, kterou owner označil za nositele kvality
(„konkrétní situace · dvě skutečné možnosti · žádná označená jako správná"), zhruba v šestině
single čtení. To je měřitelný cíl sám o sobě, nezávislý na hypotéze pozitivního učení.
**K návrhu P2 (GPT: každý příklad + pozorování, PROČ ho owner vybral) — kritika před stavbou:**
riziko je, že „proč je to dobré" je zase jen **instrukční próza**, a přesně tu odstranil ořez
(DECISIONS 154→178); přidaný požadavek se navíc měřeně projevuje jako formule
([[oprava-promptu-odebira-vadu]]). Testovatelné je to jen tehdy, když pozorování zůstane
**popisem toho příkladu**, ne pravidlem („je konkrétní, obě možnosti jsou reálné" ANO ·
„piš takové otázky" NE) — a když se rozdíl měří proti buňce s příkladem BEZ pozorování.

## 2026-08-27 — TEST P2 (počítáno, ne hádáno) · Odkud se bere otázka se dvěma možnostmi
⚠️ **Napřed faktická oprava:** „Does the water bend around the stone…" **NENÍ výstup buňky A** —
je to rameno 5 druhé pouti a zároveň jeden ze tří příkladů, které jsem vložil do korpusu P1.
Jediná otázka, která v A prošla, je `Tiwaz-A-2` („Which of your own lines holds straight when
no one is watching it?") a soudce u ní sám poznamenal, že je to **otevřený dotaz, ne dvojí
volba**. Pitvat „jednu dobrou proti pěti špatným" by tedy stálo na n=1, a navíc na hraničním kusu.
**Místo toho spočítáno na VŠEM, co máme** (42 čtení: 18 single P1 + 24 ramen tří poutí):
- **12/42 čtení má vůbec otázku (29 %)** · single **3/18** · pouti **9/24**.
- **Tvar dvou možností („…, or …?") má 4/12 — a VŠECHNY ČTYŘI jsou z poutí, ani jedna ze single.**
**Mechanismus (hypotéza s dokladem, ne teorie):** dvojí volba vzniká tam, kde **scéna sama
obsahuje dvě věci v napětí** — a v poutích ji tam dodává blok místa se vstupní věcí:
| kde | co ve scéně stálo proti sobě | otázka |
|---|---|---|
| pouť1-5 Wunjo | jedna jáma drží klid, ostatní vřou | Do you kneel at the quiet rim, or walk on toward the roar? |
| pouť2-5 Eihwaz | voda × kámen | Does the water bend around the stone, or does it wait for the stone to give? |
| pouť3-1 Kenaz | stádo se tlačí dovnitř × jedna ovce se zdržela | Do you turn in with the flock, or stay in the last grey a while? |
| pouť3-6 Algiz | ostřice mezi tůní a otevřeným vzduchem | Does the sedge lean toward the pool it grows from, or toward the open air? |
Single čtení dostávají JEDEN sezónní obraz — jeden kámen, jeden jeřáb — **a nemají na čem
rozdvojit**, takže sahají po otevřeném „What…?". To vysvětluje 1/6 v P1 líp než cokoli o few-shotu.
⭐ **Důsledek pro směr:** otázka se nemá vynucovat direktivou („pokládej otázky se dvěma
možnostmi") — má se dodat **scéna, která volbu obsahuje**. To je oprava STRUKTURY, ne přidané
pravidlo ([[oprava-promptu-odebira-vadu]]).
**Falzifikace (§25, neprovedeno):** obrácená páka — vzít rameno pouti, které dvojici mělo,
a **ubrat** druhý prvek scény; dvojí volba musí zmizet. A naopak: dát single čtení scénu se
dvěma prvky bez jakékoli zmínky o otázce; když se fork neobjeví, hypotéza padá.
**Hranice nálezu:** počítá se TVAR („…, or …?"), ne kvalita otázky — ta se pořád měří slepě
(osa 9). Nesledovalo se, jestli dvojice ve scéně vznikla z krajiny, z momentu, nebo z runy.

## 2026-09-06 — TEST P3 · Falzifikace „dvě věci v napětí" — ⭐ HYPOTÉZA PADLA (a ukázala lepší)
Obrácená páka (§25) na hypotézu z TESTu P2. Tytéž čtyři scény, které fork vyrobily v poutích,
pustil jsem je jako **single čtení** (bez pouti, bez carry, bez semínka) ve dvou verzích:
**JEDEN** materiál vs **DVA** materiály v téže scéně. Prompt nezmínil otázku, volbu ani „or" —
ověřeno grepem, jinak by se testovala direktiva, ne scéna. 4 scény × 2 řezy × 3 seedy = 24 čtení.
Korpus `~/runar-eval/fork-test.jsonl`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
| řez | otázka | **fork (dvě možnosti)** |
|---|---|---|
| JEDEN materiál | 2/12 | **2/12** |
| DVA materiály | 2/12 | **1/12** |
**Jednostranný Fisher p = 0,89 — a rozdíl jde OPAČNÝM směrem.** Hypotéza „fork vzniká, když
scéna obsahuje dvě věci v napětí" je **vyvrácena**: dva materiály fork nevyrobily (1/12), jeden
materiál ho vyrobil dvakrát. Přidávání druhého materiálu do scény tedy NENÍ páka na otázku.
⭐ **Co ta data ukazují místo toho** (hypotéza, NEOVĚŘENO): fork vzniká z **jedné věci, která
může jít dvěma způsoby**, ne ze dvou věcí vedle sebe. Oba forky z řezu JEDEN:
- „Does the steam hold together in the wind, Anna, **or does it scatter and rise**?" (jedna pára, dvě chování)
- „Does the blade lean into the water, **or hold its own line above it**?" (jedno stéblo, dva směry)
**Přečteno zpětně sedí i na původní čtyři z poutí** — a moje čtení TESTu P2 bylo chybné:
viděl jsem „dva prvky", protože se oba objevily ve VĚTĚ, ale generativní zdroj je vždycky
**jeden podmět se dvěma možnými pohyby** (voda se ohne / počká · ovce jde dovnitř / zůstane
venku · ostřice se nakloní k tůni / ke vzduchu · jáma vře / drží klid). Zápis P2 tím NEPLATÍ
v části „dvě věci v napětí"; počty otázek v něm platí dál.
**Hranice nálezu:** vyloučeno je „dva materiály ve scéně" jako příčina (n=24, p=0,89). NEtvrdí
se, že scéna na otázku nemá vliv — jen že tahle páka to není. Neměřeno: jestli fork zvedne
materiál, který sám o sobě může jít dvěma směry (pára, stéblo, voda), zatímco statický ne
(kámen, zeď) — to je test P4, a je zase jen o VÝBĚRU materiálu, ne o instrukci.
**Vedlejší pozorování:** vložení bloku místa do single čtení otázky nezvedlo (4/24 = 17 %,
tedy pod celkovým průměrem 29 %). Blok místa sám o sobě není páka na otázku.

## 2026-09-06 — TEST P4 · Pohyblivý vs statický materiál: směr sedí, ale NENÍ průkazný
Následník P3. Táž čtyři místa i runy, single čtení, prompt opět bez zmínky o otázce či volbě.
POHYB = materiál, který sám může jít dvěma směry (pára · pramínek vody · poslední světlo
odcházející z pole · suchopýr ve větru) vs STATIK = materiál, který jen je (sirná krusta ·
holý kámen v trávě · kamenná zeď ohrady · trsy nad vodou). 4 × 2 × 3 = 24 čtení.
Korpus `~/runar-eval/fork-p4.jsonl`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
| řez | otázka | **fork** |
|---|---|---|
| STATIK | 5/12 | **2/12** |
| POHYB | 5/12 | **5/12** |
**Jednostranný Fisher p = 0,19.** Směr sedí na hypotézu z P3 (pohyblivý materiál dává fork
častěji), ale při n=12 na buňku to **není průkazné** — netvrdí se víc než „nevyvráceno".
⚠️ Nesmí se z toho dělat páka, dokud to neprojde na větším n.
**Pozorování (post-hoc, tedy slabé):** i oba forky ze STATIKu mají za podmět něco pohyblivého,
ne ten statický materiál — „Do you feel where the ground carries you, or where it thins?" a
„Does the warmth stay in that one stone, or spread to the next?" (teplo dodal stav soumraku,
ne kámen). Sedí to na hypotézu, ale je to čtení po výsledku.
**Otázka jako taková se nezměnila vůbec** (5/12 v obou řezech) — pohyblivost hýbe nanejvýš tím,
JAKÁ otázka vznikne, ne jestli vůbec vznikne.

## 2026-09-06 — ÚKOL 3 (momenty 22 krajin) uložen · SCREEN ZAHOZEN, spadla pozitivní kontrola
Cowork dodal momenty pro 22 krajin → `docs/vegvisir-momenty-22-krajin.md` (Cowork do repa
nepíše). Cowork predikoval 0 předurčených.
Screen vzorku (12 momentů, z toho 8 vybráno jako rizikové) vyšel 2 otevřené / 10 částečně /
0 předurčených — **ALE POZITIVNÍ KONTROLA SPADLA:** Berkana „brum springur út", kterou dva
předchozí screeny shodně označily za předurčenou, dostala tentokrát „částečně".
→ **Nástroj byl tenhle běh mírnější, dávka se tedy NEINTERPRETUJE** (vlastní pravidlo rubriky:
když spadne kontrola, zahazuje se dávka, ne kontrola). Coworkova predikce zůstává neověřená.
**K opakování:** víc soudců na položku (medián ze 3) nebo vyšší effort — jednorázový soudce na
nízkém effortu kolísá přes hranici částečně/předurčený. Korpus `~/runar-eval/ukol3-screen.json`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
**Jazyk (CODE):** slovník zná halarófa · vindhviða · fífa · þúfa · dragsúgur · skorpa; heslo
nemají lækjarsytra · hitatitringur · völur · flóðfar (produktivní nebo méně běžná, k potvrzení).

## 2026-09-06 — ÚKOL 3 screen podruhé (medián ze 3) · ⭐ KOTVA NENÍ STABILNÍ — a přesto nález
Zopakováno s mediánem ze tří soudců a o větu přísnějším zadáním („když tě napadne jedno čtení
okamžitě a ostatní si musíš vymýšlet, je to předurčený").
**Pozitivní kontrola spadla ZNOVU, a jednohlasně:** Berkana „brum springur út" → **3× „částečně"**.
Není to tedy kolísání jednoho soudce; **nástroj se posunul jako celek** (dvě dřívější měření
říkala „předurčený", teď 3/3 „částečně"). Příčina neznámá a nezjistitelná zpětně.
→ **Poučení: JEDNA kotva nestačí.** Kontrola, která sama může přeskočit, nerozliší posun
nástroje od posunu dat. Napříště **množina 2–3 známých kotev** (jedna zaručeně předurčená,
jedna zaručeně otevřená) — když se pohnou obě stejným směrem, je to nástroj; když jedna, je to ona.
**⭐ ALE nález z toho PLYNE, a to asymetricky:** nástroj je teď prokazatelně **mírnější** —
a přesto dva momenty označil za **předurčené**. Co projde i mírným sítem, je zatížené doopravdy:
- **19 Melur „fótspor hverfa jafnóðum í vindinum"** (2/3 předurčený) — soudce: *„hotové poselství
  o pomíjivosti; alternativy nejsou jiná čtení, jen emocionální zabarvení téže věty."*
- **20 Hverasvæði „jörðin er heit undir þunnri skorpu"** (2/3 předurčený) — vestavěný spád
  k „nedůvěřuj pevnosti, pod povrchem je žár".
→ **Coworkova predikce „0 předurčených" je vyvrácena** v tom směru, kde měření platí.
Opačný směr (že zbylých 10 předurčených NENÍ) tvrdit nelze — na to je nástroj moc měkký.
**Nejlepší kusy vzorku** (medián „otevřený", model pro další psaní): **22 Jökulrönd „brestur
heyrist djúpt í jöklinum"** — *„zvuk oznamuje, že se něco děje, a neříká co"* — a **21 Mýri
„fótur sekkur og vatn vellur upp í sporið"**.
Korpus `~/runar-eval/ukol3-screen-median.json`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->

## 2026-09-06 — ⚠️ ASK: když uživatel VÝSLOVNĚ žádá bez obrazu, dostane obraz (produkční data, 4/4)
Načteno 10 produkčních čtení za 10 dní (`readings` + `follow_up`), všechna `v4.14-mynd`.
Čtení samotná drží — obraz z věcí, runa vyložená skrz scénu, žádná rada. **Vada je v Ask.**
**Spočítáno, ne odhadnuto:** ve **4 z 10** Ask výměn uživatel EXPLICITNĚ signalizoval nepochopení
nebo žádal prostý jazyk — a **ve všech čtyřech dostal zpátky obraz**:
| runa | co uživatel napsal | čím odpověď KONČÍ |
|---|---|---|
| Thurisaz (IS) | *„Getur þú sagt mér þetta á mannamáli. **Ekki í myndum**"* | „Hliðið stendur enn, og þyrnirinn bíður." |
| Othila | „Can you be more clear" | „The grass keeps growing over the old wall." |
| Mannaz | „What the fuck do you mean?" | „…just the seeing, and whatever stays unspoken between you and it." |
| Ehwaz | „Is it ehwaz the horse and the trust?" | „That is what stands at the river's edge with you." |
⭐ **Thurisaz je kategoricky jiný případ než zbylé tři: uživatel obraz výslovně VYLOUČIL
(„ekki í myndum") a dostal ho jako poslední větu.** To už není otázka stylu ani míry
obraznosti — je to **nesplnění výslovného pokynu uživatele**. Tím je spor „obraz v Ask povinný
/ volitelný" (handoff DODATEK 2/3) v tomhle úzkém výseku **rozhodnutý daty**, ne preferencí.
**Druhý, dosud nepojmenovaný režim selhání — Ask ZAMĚNÍ obraz místo aby ho vysvětlil.**
Isa: čtení stojí na zastavených hodinách („The clock on the wall has stopped…"), uživatel se ptá
„What does it say about my relationship?" a Ask otevře **úplně nový obraz** — „Two hands rest on
the same table, one open, one still closed." Nevysvětlí hodiny, vymění je. To je jiná vada než
„zůstal v obraze" a chce jinou opravu (držet TEN obraz, ne vyrobit další).
**Detekovatelný spouštěč (návrh, neratifikováno):** „přímost otázky" jako obecná kategorie
měřitelná není (Coworkova výhrada platí) — ale **výslovná žádost o jasnost JE** detekovatelná
(„ekki í myndum", „be more clear", „what do you mean", „na rovinu"). Řešit napřed ten výsek,
zbytek nechat otevřený; obecné pravidlo pro celý Ask z tohohle vzorku nevyvozovat.
**Hranice nálezu:** n=10 čtení / 4 relevantní výměny, jeden owner-tester, převážně EN.
Netvrdí se nic o tom, jestli má obraz v Ask být povinný tam, kde uživatel jasnost NEŽÁDÁ.

## 2026-09-06 — TEST ASK1 · Úzká oprava Ask ZMĚŘENA na 10 produkčních párech a NASAZENA
Fixture = 10 skutečných produkčních párů (čtení + otázka z `follow_up`), tři varianty promptu:
**A** = současný · **B** = ODEBRÁNA vynucená závěrečná věta („End with one quiet line that returns
them to the reading") · **C** = B + jediná podmínka pro výslovnou žádost o prostý jazyk.
Souzeno slepě, 30 odpovědí, tři osy. Korpusy `~/runar-eval/ask-test.jsonl` · `ask-soud.json`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
⭐ **A reprodukovalo produkční vadu přesně** (4/4 končí obrazem, 0/4 překládá) — harness je platný.
| varianta | ŽÁDOST O JASNOST (n=4) | BĚŽNÉ OTÁZKY (n=6, kontrola) |
|---|---|---|
| A současný | končí obrazem **4/4** · překlad **0/4** · rada 1/4 | obrazem 5/6 · překlad 1/6 · rada 1/6 |
| B odebrání | obrazem 1/4 · překlad 2/4 · **rada 2/4** | obrazem 5/6 · překlad 0/6 · rada 1/6 |
| **C = nasazeno** | obrazem **1/4** · překlad **3/4** · rada **1/4** | obrazem 3/6 · překlad 2/6 · rada 1/6 |
**Nasazeno C** (`scripts/_patch_tune.py`, EN i IS). Thurisaz — týž pár, kde uživatel napsal
„Ekki í myndum": A končí „Þyrnigerðið stendur enn kyrrt", C končí „Það sem þú vilt fá kostar
þig eitthvað fyrst, og þyrnarnir eru það verð" — vysvětlení, ne obraz.
⚠️ **PŘIZNANÝ KOLATERÁL — oprava NENÍ tak úzká, jak zněla:** u běžných otázek klesl obrazový
závěr **5/6 → 3/6**. Podmínka měla spouštět jen na žádost o jasnost, ale mění chování i jinde.
Kdyby to vadilo, je to jeden revert.
⭐ **Vedlejší nález (proti očekávání):** samotné odebrání závěrečné věty (B) **zvedlo RADU**
1/4 → 2/4. Vynucený obrazový závěr tedy fungoval i jako **brzda proti radě** — když zmizel bez
náhrady, model sklouzl k „nenes to sám". Teprve podmínka v C radu vrátila zpět na 1/4.
Odebrání vady bez náhrady tedy může odkrýt jinou vadu, kterou ta první držela.
**Dodatek k TESTu ASK1 — KDE PŘESNĚ je hrana rady** (owner 2026-09-06: „jak je ta rada kritická?
na jaké hraně se pohybuje?"). Rozebráno všech 7 odpovědí, které soudce označil za radu:
- **Skutečná rada — vždycky se dá zkrátit na rozkaz.** „Fehu is plenty that only **stays sweet
  when it is shared out**" → *rozděl to* · „once the **tending is shared out again**" → *rozdělte
  péči* · „**look, and see** who is standing there now" → přímý imperativ · „Some of what happened
  is **yours still to say aloud**" → *řekni to*.
- ⭐ **Pracovní test (jednoduchý, použitelný):** *dá se ta věta smazáním slov převést na rozkaz?*
  Ano → je to rada. Nejnebezpečnější je **trpný rod, který imperativ schová**: „stays sweet when
  it is shared out" nemá podmět, a přesto říká „sdílej". Právě tahle forma projde nejsnáz.
- **Naopak radou NENÍ:** „The wall between you and someone is losing its edges" — pojmenování
  stavu, imperativ z toho nevyrobíš.
⚠️ **Vada mé vlastní soudcovské osy:** soudce označil za radu i `Mannaz-C` — *„whether this is
a moment to hold still, or a moment to say aloud the thing you have been keeping quiet"*. To je
ale **otázka se dvěma skutečnými možnostmi, žádná označená jako správná** — přesně forma, kterou
owner označil za nositele kvality. **Osa zaměňuje „jmenuje čin" za „doporučuje čin".** Čísla rady
v TESTu ASK1 jsou tedy mírně NADHODNOCENÁ; příště osu rozdělit na *doporučuje jeden čin* (rada)
vs *nabízí volbu mezi dvěma* (není rada).
**Sedí to na ownerovo zadání:** „Rúnar balancuje na hraně, ale má to říct tak, aby člověka
upozornil, že má hledat odpověď sám v sobě" = mechanismus z DODATKU 4 handoffu — **popiš stav
nebo nerovnováhu, a otázku obrať dovnitř** („kde to cítíš", ne „co s tím udělej").

## 2026-09-06 — ⚠️ Oprava Ask v ŽIVÉM provozu: překlad se objevil, ale obrazový ZÁVĚR se vrátil 4/4
První produkční data po nasazení (sw v360, 4 čtení, **všechna se žádostí o jasnost** —
„give me more simple answer!", „what does the picture suppose to say?", „i dont understand what
you mean!", „holding costs more than moving would? explain."). Týž slepý soud jako na baseline.
Korpus `~/runar-eval/ask-nove.json`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
| | končí obrazem | překlad (ano) | rada |
|---|---|---|---|
| baseline A (před opravou, n=4) | **4/4** | **0/4** | 1/4 |
| harness C (test, n=4) | 1/4 | 3/4 | 1/4 |
| **živý provoz po opravě (n=4)** | **4/4** | **1/4** | 1/4 |
⭐ **Poloviční úspěch, a to je nález, ne neúspěch.** Překlad se objevil — `n1-Blank` dostal
„ano" (*„The blank rune holds nothing back on purpose — it simply has no answer to give yet"*),
další dvě „částečně" s citovatelným výkladem (*„The reading says only this: what you truly carry
from that place is not the iron in your hand"*). **Obrazový závěr se ale vrátil na 4/4** — tedy
tam, kde byl před opravou.
**Rozdíl proti harnessu (1/4 vs 4/4) NENÍ vysvětlený a je to hlavní otevřená věc.** Kandidáti,
seřazeno podle mé důvěry: (a) **produkce staví prompt jinak než můj harness** — v harnessu jsem
`buildAskPrompt` volal přímo, produkce může přidávat vrstvy (proxy, voice profil), které závěr
znovu vynucují; (b) živý vzorek je jen n=4 a všechny 4 jsou žádosti o jasnost, kdežto harness
měl i kontrolní skupinu; (c) prompt sice odešel, ale klientská cache měla starý soubor
u části požadavků. **(a) je ověřitelné a musí se ověřit první** — porovnat prompt, který
skutečně odešel z prohlížeče, s tím, co staví harness. Do té doby se NETVRDÍ, že oprava
v produkci funguje.
**Nález o radě:** `n2-NORNS` (uhlíky) — *„Reach too soon and the ash stings first"* prošlo
imperativním testem (→ „nesahej tam brzo"), soudce nezávisle potvrdil totéž. Test na imperativ
zavedený dnes tedy v ostrém provozu **chytá**, což je jeho první nezávislé potvrzení.
**Dodatek — prompt-cesta OVĚŘENA, moje hypotéza o vadném měření PADLA, a příčina je jinde
(2026-09-06):** seed-and-assert na produkční cestě (`buildSysPrompt(activeChar=null)` +
`buildAskPrompt`, přesně jak volá `runar-reading.js:554-555`):
- ✅ moje podmínka JE v odeslaném promptu · ✅ stará vynucená věta JE pryč · model tentýž
  (proxy `MODELS = ["claude-opus-4-8", …]` = to, co jsem měřil v harnessu).
→ **Produkce posílá týž prompt i model jako harness. Rozdíl 1/4 vs 4/4 tedy NENÍ vadné měření.**
⭐ **Skutečná příčina je v SYSTEM promptu, který má harness i produkce stejný — a přebíjí
mou úzkou podmínku:**
1. `DEF_CHAR.philosophy`: **„Draw the picture and stop there — never hand the seeker
   a conclusion."** To je přímý příkaz SKONČIT obrazem.
2. Blok `THE IMAGE`: „Rúnar uses one image per reading and **carries it through**."
3. ⚠️ Nejsilnější: v system promptu stojí **tři ukázkové věty a všechny tři končí obrazem**
   („an image that ends on a question" · „an image that returns, no question" · „two still
   images, no call"). To je přesně mechanismus, který máme změřený:
   **pojmenovaný příklad v promptu se opisuje** (12 % → 56 %, [[prompt-directive-makes-model-copy]]).
**Důsledek pro opravu:** úzká podmínka v `RP_ASK` bojuje proti trojici ukázek + dvěma
invariantům v system promptu a prohrává. Zbývající rozdíl 1/4 vs 4/4 je nejspíš zbytkový
šum n=4 na obou stranách (harness měl navíc `max_tokens` 400 vs produkční cap 140).
**Co z toho plyne (neprovedeno, čeká na rozhodnutí ownera):** Ask potřebuje **vlastní
výjimku na úrovni SYSTEM promptu**, ne jen v `RP_ASK` — buď (a) pro `mode:'ask'` neposílat
`philosophy` „Draw the picture and stop there", nebo (b) doplnit do ukázek JEDNU, která končí
prostou větou. ⚠️ (b) je riskantnější: přidává další příklad ke kopírování.
**Ownerův vlastní nález na týchž textech je ostřejší než soudcův** (2026-09-06): „a seed is not
… jsou stále metafory. Co se skrývá pod seed?" a u Isy: „stále popisuje stejný obraz, ale nedává
jednodušší formu." → **Vada není jen „končí obrazem", ale „vysvětluje obraz TÝMŽ obrazem".**
Pro člověka, který obraz nepochopil, je menší metafora k ničemu. Tohle osa „končí obrazem"
nezachytí — je potřeba osa „vysvětlil to bez té metafory, nebo jen zmenšil?".

## 2026-09-06 — TEST ASK2 · Žádná varianta nepomohla — a vada je jinde, než jsme mířili
Tři cely na týchž 10 produkčních párech: **P** = replika produkce (moje podmínka, strop 140 =
skutečný `askCap`) · **G** = znění dle GPT („nenahrazuj obraz jiným obrazem" + pojmenuj dvě
možnosti) · **GL** = G + odebraná `DEF_CHAR.philosophy` („Draw the picture and stop there")
+ strop 300. Nová osa (owner): **„vysvětlil, nebo jen zmenšil metaforu?"**
Korpusy `~/runar-eval/ask2-test.jsonl` · `ask2-soud.json`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
| cela | končí obrazem | překlad | **jiná/menší METAFORA** | rada |
|---|---|---|---|---|
| P | 7/10 | 3/10 | **7/10** | 0/10 |
| G | 6/10 | 3/10 | **7/10** | 0/10 |
| GL | 6/10 | 2/10 | **8/10** | 1/10 |
⭐ **Nevyhrála žádná. Rozdíly jsou v šumu.** Ani přeformulování, ani odebrání `philosophy`,
ani vyšší strop s vadou nehnuly. **Ownerova osa ukazuje, že vada je plošná: 7–8/10 ve VŠECH
celách** — odpověď vysvětluje obraz dalším nebo menším obrazem bez ohledu na to, co stojí
v `RP_ASK`. **Páka tedy v pravidlech Ask NENÍ.**
⚠️ **MOJE CHYBA v návrhu GL:** zvedl jsem `max_tokens` na 300, ale v promptu zůstalo
**„Keep it SHORT — no more than about 40 words"**. Délková páka se tedy VŮBEC nepustila;
GL netestovala délku, jen odebrání `philosophy`. Ownerův argument (Ask je jen text, nikdy
hlas, smí být delší) zůstává **neotestovaný**.
⚠️ **A osa „končí obrazem" je při n=4 nepoužitelná:** táž konfigurace (moje podmínka, strop 140)
dala v harnessu **1/4** a v živém provozu **4/4**. Dokud se to nezvětší nebo nezopakuje, žádné
tvrzení o téhle ose neplatí — a to zpětně oslabuje i čísla z TESTu ASK1.
**Co zbývá jako kandidát na páku** (seřazeno podle mé důvěry):
1. **Systémový prompt, ne Ask pravidla** — `THE IMAGE` („one image per reading and carries it
   through") + **tři ukázkové věty, které všechny končí obrazem**. Máme změřené, že pojmenovaný
   příklad se opisuje ([[prompt-directive-makes-model-copy]]); tady jsou tři a všechny učí totéž.
2. **Skutečné uvolnění délky** — vyměnit „about 40 words" za vyšší číslo. Nezkoušeno.
3. **⭐ Ownerův návrh: pustit do Ask promptu kontext čtení** (Area of Life · intention · „this
   reading is for"). Dnes tam **neputuje vůbec** — `buildAskPrompt(reading, question, runes,
   lang, corrections)` kontext nemá. Bez něj nemá Rúnar do ČEHO překládat: „semínko proti železu"
   dostane smysl, teprve když ví, že čtení je *pro pochopení minulosti* nebo *pro rozhodnutí*.
   KUKY 2026-09-06: *„to je taky uživatelova otázka, na kterou by chtěl znát odpověď, a pokud ji
   nenajde v obraze, měl by ji dostat v ASK."*

## 2026-09-06 — TEST ASK3 · Ask jako samostatný režim: chování se změnilo, vada ne — a fixture došel dech
Po ownerovi + GPT přerámováno: vada NENÍ „končí obrazem", ale **„obraz zůstane zabalený"**.
Dvě cely na týchž 10 párech, `DEF_CHAR.philosophy` PONECHÁNA (GL ji odebrala a byla nejhorší):
**U1** = pravidlo „rozbal obraz do možných významů" + **skutečně uvolněná délka** (v promptu
40 → 120 slov; v ASK2 jsem zvedl jen `max_tokens` a délková páka se nepustila) ·
**U2** = U1 + kontext čtení (area of life · intention · seeking · původní situace).
Průměr odpovědi 110 slov (dosud ~40). Korpusy `~/runar-eval/ask3-*.json`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
| cela | ROZBALIL | jiná metafora | barnum | rada | ukotveno v otázce |
|---|---|---|---|---|---|
| U1 | 4/10 (+4 částečně) | **7/10** | 2/10 | 1/10 | **10/10** |
| U2 (+kontext) | 4/10 | 6/10 | 2/10 | 2/10 | **7/10** |
| *dřívější cely* | — | P 7 · G 7 · GL 8 | — | — | — |
⭐ **Chování se změnilo, vada ne.** Rúnar poprvé otevřeně rozebírá obraz na díly („Fair enough.
**Let me set the picture down plainly.** … Three parts, three things they might hold"), a na
4/10 to soudce uznal jako plné rozbalení. **Ale „jiná/menší metafora" zůstala 7/10 — stejně
jako u P, G i GL.** Ani přerámování, ani délka s tím nehnuly.
⚠️ **Ownerova hypotéza o kontextu se NEPOTVRDILA — vyšla obráceně:** U2 mělo ukotvení v otázce
**horší** (10/10 → 7/10). Kontext svedl odpověď ke KATEGORII místo ke skutečné otázce.
⚠️⚠️ **ALE fixture má vestavěnou nulovou kontrolu, a ta říká, ať tomu nevěříme:** pár
`Thurisaz-3d0e` nemá aol, intention, seeking ani situaci — pro něj je **kontextový blok prázdný,
takže U1 a U2 měly IDENTICKÝ prompt.** Přesto dopadly opačně na TŘECH z pěti os (barnum ne/ano,
rada ne/ano, ukotveno ano/ne). **Rozdíl U1 vs U2 je tedy v šumu generování**, a s ním i celý
závěr o kontextu. Netvrdí se ani že kontext pomáhá, ani že škodí.
**Co z toho platí (a je to hlavní):** **žádný ze čtyř pokusů — moje podmínka, znění GPT,
odebrání filozofie, rozbalovací režim s uvolněnou délkou — nesnížil „vysvětluje obraz obrazem"
pod 6/10.** Konstantní 6–8/10 napříč pěti různými konfiguracemi je silný signál, že páka
NENÍ v textu Ask pravidel. Zbývá system prompt (`THE IMAGE` + **tři ukázky, které všechny končí
obrazem**) — jediné neotestované místo, a zároveň to, o kterém máme změřeno, že se ukázky opisují.
**Metodická hranice fixture:** 10 párů a binární osy nerozliší rozdíl menší než ~3. Další kolo
buď na větším vzorku, nebo s jinou pákou — opakovat drobné úpravy znění je při tomhle n zbytečné.

## 2026-09-06 — Délka single FINANČNĚ + Ask žebřík 60/90/120 (KUKY)
### A) Kolik stojí „vždy 4 věty / ~50 slov" u single
⚠️ **Napřed nález, který mění zadání: délka single dnes NENÍ pevná.** Prompt losuje mezi dvěma
zněními v `runar-utils.js:379-380` — „3 short sentences, 38 to 45 words" a **„4 short sentences,
50 to 58 words"**. Rozložení na 60 losech: **35 : 25**, tedy **42 % čtení už dnes tu delší
variantu dostane.** „Přejít na 4 věty" tedy neznamená prodloužit, ale **přestat losovat**.
**Změřeno (n=6 na variantu, tytéž runy, týž seed, jen vyměněná délková věta):**
| varianta | medián znaků |
|---|---|
| krátká (3 věty) | **253** |
| dlouhá (4 věty) | **314** |
| dnešní mix (58/42) | **278** — sedí na produkční medián 272 v `RUNAR_PRICING.md` |
**Cena za jedno čtení** (sazby z `RUNAR_PRICING.md`: EL $0,10/1k IS · $0,05/1k EN · Opus 4.8):
| | znaků | Claude | celkem IS | celkem EN |
|---|---|---|---|---|
| dnes (mix) | 278 | $0,0030 | **$0,0308** | **$0,0169** |
| vždy 4 věty | 314 | $0,0036 | **$0,0350** | **$0,0193** |
→ **+$0,0041 (IS) / +$0,0023 (EN) na čtení, tj. +13–14 %.** Na měsíčním stropu předplatného
(nejhorší případ, vše single): **50 jednotek +$0,21 IS / +$0,12 EN · 75 jednotek +$0,31 / +$0,17.**
**Zdražení nese z 90 % ElevenLabs, ne Claude** — Claude roste o $0,0006.
### B) Ask v 60 / 90 / 120 slovech (režim „rozbal obraz")
Ask **nemá hlas** (KUKY), takže jeho délka stojí **jen Claude output** — 120 slov ≈ 160 tok
≈ **$0,004** za odpověď. Proti ceně čtení je to zanedbatelné; délka Ask není finanční otázka.
Změřeno na třech párech: 60 → 54–71 slov · 90 → 78–99 · 120 → 105–122 (model cíl drží).
**Co se s délkou mění (pozorování na textech, neměřeno soudci):** při 60 zbude na rozbalení
jedna věta na díl a odpověď končí rychle; při 90 se objeví **úvodní věta typu „Let me lay it
open three ways"** a tři díly dostanou vlastní odstavec; při 120 přibude i **rám runy** („Mannaz
is what you meet there") a závěr, který volbu výslovně vrací člověku („That's the barrel's
business, and yours"). ⚠️ U Isa-120 se ale objevilo **opakování** („not the ended one" · „stopped,
not broken" · „quiet, not empty" — tentýž protiklad třikrát), stejný typ nadbytku jako u single
na 120. Zdá se, že strop užitečné délky je kolem 90–100 slov, ale to je zatím DOJEM, ne měření.
**Oprava zápisu výš (KUKY 2026-09-06: „kde je cena ElevenLabs?"):** cena byla spočítaná
včetně EL, ale ukázaná jen jako součet. Rozepsáno — **EL je 90 % ceny čtení v IS, 81 % v EN**:
| varianta | znaků | Claude | **ElevenLabs IS** | **ElevenLabs EN** | celkem IS | celkem EN |
|---|---|---|---|---|---|---|
| dnes (mix 58/42) | 278 | $0,0030 | **$0,0278** | **$0,0139** | $0,0308 | $0,0169 |
| vždy 4 věty | 314 | $0,0036 | **$0,0314** | **$0,0157** | $0,0350 | $0,0193 |
| vždy 5 vět ~75 slov *(dopočteno, NEZMĚŘENO)* | 421 | $0,0042 | $0,0421 | $0,0210 | $0,0463 | $0,0252 |
Měsíční strop, **jen ElevenLabs**: 50 jednotek IS $1,39 → $1,57 · 75 jednotek IS $2,09 → $2,35.
⭐ **DŮVOD LOSU MEZI 3 A 4 VĚTAMI — dohledán, nespekulován** (`runar-utils.js:372-376`,
commit `3905d4e`, měřeno 2026-08-20): *„Není to jen o počtu slov: při jiném rozpočtu musí model
stavět větu jinak, takže táž runa zní podruhé jinak — **pestrost skoro zadarmo**."* Změřeno:
tří-větný rozpočet dal 3 věty ve 4 ze 4, čtyř-větný 4 věty v 7 z 8, **žádný překryv**. A dva
pevné rozpočty místo rozsahu proto, že **čas nahlas** má být 20–25 s vs 28–33 s.
→ **„Vždy 4 věty" tedy neznamená jen +13 % ceny — znamená ZRUŠIT páku na pestrost.** Ownerova
paměť („mělo to cosi dočinění s rozmanitostí") byla přesná. Kdo to chce prodloužit, ať **posune
OBA rozpočty** (např. 4 a 5 vět) místo aby los zrušil; jinak se ztrácí to, kvůli čemu vznikl.

## 2026-09-06 — TEST DÍLY · Délka Ask: ⭐ 90 slov je optimum, a moje hypotéza „díly = délka" PADLA
8 run × 3 délky (60/90/120), režim „rozbal obraz". **Kalibrační kotvy:** soudci nezávisle počítali
díly ve čtení — Isa vyšla **2** (ne 1, jak jsem tvrdil dřív!), Mannaz 4, Othila 5, Laguz 2.
Korpusy `~/runar-eval/dily-A.jsonl` · `dily-soud.json`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
| délka | dekódováno dílů (průměr) | opakování | nový obraz |
|---|---|---|---|
| 60 | 3,00 | 5/8 | 0/8 |
| **90** | **3,12** | **4/8** | 2/8 |
| 120 | 2,88 | **8/8** | 0/8 |
⭐ **Počet dekódovaných dílů je na délce NEZÁVISLÝ — 3,0 / 3,1 / 2,9. Delší odpověď nedekóduje
víc, jen víc opakuje.** Při 120 slovech se opakuje **8 z 8** odpovědí. **90 slov je optimum**
na obou osách zároveň (nejvíc dekódováno, nejmíň opakování) — shoduje se s ownerovým vlastním
verdiktem („ASK Rúnar z osobního pohledu vede 90 slov").
⚠️ **MOJE HYPOTÉZA VYVRÁCENA.** Tvrdil jsem, že „užitečná délka je daná počtem dílů obrazu".
Není: **Othila má 5 dílů a dekóduje 3. Laguz má 2 a dekóduje 2. Strop je ~3 díly bez ohledu
na to, kolik jich obraz nabízí.** Model nedekóduje víc, i když má z čeho.
⭐ **Co PLATÍ místo toho (a je to užitečnější): chudý obraz se opakuje na KAŽDÉ délce.**
| | chudý obraz (2 díly: Isa, Laguz) | bohatý (3+ dílů, n=6) |
|---|---|---|
| opakování @60 | **2/2** | 3/6 |
| opakování @90 | **2/2** | **2/6** |
| opakování @120 | **2/2** | 6/6 |
→ **Dva díly nestačí ani na 60 slov.** Páka tedy není délka Ask, ale **bohatost obrazu
ve ČTENÍ** — a to je věc single promptu, ne Ask pravidel.
**Odpověď na ownerovu otázku „proč má Isa jen jeden díl":** nemá. Počet dílů je vlastnost
**vylosovaného obrazu, ne runy** — Isa dostala minule zastavené hodiny (1 díl), teď blánu
na vychladlé kávě (2). Laguz dostal svah + vodu (2). ⚠️ Zda některé runy tíhnou k chudším
obrazům systematicky, **NEZMĚŘENO** — chtělo by to víc obrazů na runu.
**Kontext (area of life · intention · situace) — 4 skutečné situace ownera, táž runa (Perth),
týž seed, jediný rozdíl je zadání:** obraz se pokaždé přizpůsobil — *„chtěl bych novou práci"*
→ pečeť praskla, ale nikdo ji neotevřel · *„mám si hledat?"* → **„the fold still holds shut…
which is heavier, the reading or the not-reading?"** · *„zjistí to manželka?"* → **„water that
seeps under a closed door long before the door is opened"** · *„bojím se, že neuspěju"* →
**„everything you fear sits folded inside, still only paper and ink."** Rozdíl mezi přáním
a žádostí o rozhodnutí Rúnar rozlišil: první nabídne obraz, druhý postaví **volbu**.
⚠️ U otázky na nevěru **Rúnar nepředpověděl** („co se ještě neukázalo") a hranici udržel.

## 2026-09-06 — ⭐ CO SE ZE VSTUPŮ PROBOJUJE DO ČTENÍ + test „otázka jako hlavní"
Lexikální audit 20 čtení (táž otázka „I would like to find a new job", 10 run × se štítky /
bez). **Nula volání API** — vše počítáno lokálně z už vygenerovaných textů a znovu sestavených
promptů. Korpus `~/runar-eval/propis.jsonl`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
| vstup | probojuje se |
|---|---|
| jméno runy | **20/20** |
| **obraz přiřazený runě** (`RUNE_IMAGES`) | **18/20** |
| téma otázky | ~13/20 |
| jméno hledajícího | 8/20 |
⭐ **To, čemu owner říkal „sezóna", je ve skutečnosti OBRAZ PŘIŘAZENÝ RUNĚ — a je to nejsilnější
vstup ze všech.** Eihwaz dostane vždy jeřáb u statku, Perth vždy řeku s oblázkem. **Obraz je
vybraný DŘÍV, než se čte otázka** — proto otázka prohrává; nesoupeří s runou, soupeří s hotovým
obrazem. To vysvětluje i ownerův produkční Eihwaz (téma práce se do obrazu nedostalo vůbec).
**Štítky (area + intention) jako slabší páka:** bez nich **5/10** čtení nemá o práci ani zmínku,
s nimi **2/10**. Rozdíl, který jsem předtím přisoudil runám, byl rozdíl ve štítcích.
**Délka věty: 15,7 (bez štítků) / 16,2 (se štítky) slova.** Na instrukci „short sentences,
no filler" je to hodně — čtyři věty po šestnácti slovech nesou runu, obraz, sezónu, jméno
i otázku najednou. Ownerova „přeplácanost" je tím číselně doložená.
### TEST: obraz runy ODEBRÁN, scéna vyrůstá z otázky (4 runy × 2, 8 volání)
**A (dnešek)** otevře runinou krajinou a otázku přilepí větou: *„A new field of work is a slope
like any other"* · *„when the work you do changes hands and rooms"*.
**B (obraz odebrán)** postaví scénu z uživatelova světa a runa je to, co ta scéna DĚLÁ:
- Eihwaz: *„Where the old desk ends the door begins, and you stand at that seam… **the yew rooted
  deep while its crown leans into open air, the same tree holding two places at once**."*
- Laguz: *„The desk you sit at holds **a single key worn smooth on one edge, from a door you no
  longer use**… Beneath the wish for new work, the current has already turned."*
⚠️ **PŘIZNANÁ CENA B — vyměnili jsme jednu monotónnost za druhou.** Ve **4 ze 4** čteních B je
**stůl (nebo ponk) a dveře**. Místo „stejný obraz na runu" vzniklo „stejný obraz na téma otázky".
Navíc mizí **islandská krajina**, na které stojí Rúnarova identita — desk, lamp, door nejsou
Agndofa. Rozdíl je v tom, že runa se neměné, kdežto otázka ano; B tedy monotónnost přesouvá
tam, kde se aspoň mění s uživatelem. **Rozhodnutí patří ownerovi, neratifikováno.**

## 2026-09-06 — TEST STŘED · čtyři cely na týchž runách a týchž seedech (A/B/C/D)
**A** dnešek (obraz runy = scéna) · **B** obraz pryč, scéna z otázky · **C** STŘEDNÍ: obraz runy
jako MATERIÁL, scénu staví otázka · **D** otázka hlavní, runa vstupuje jen jako svůj VÝZNAM.
4 runy × 4 cely, týž seed. Korpus `~/runar-eval/stred.jsonl` + `otazka-prvni.jsonl`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
| cela | slov/větu | průměr slov | kancelářské slovo | islandská krajina |
|---|---|---|---|---|
| A | 15,9 | 55 | 1/4 | plná |
| B | 16,1 | 56 | **4/4** | slabá |
| **C** | **17,0** | **59** | **1/4** | **plná** |
| D | 17,1 | 59 | 2/4 | slabší |
⭐ **OPONENTURA PROTI MNĚ SAMOTNÉMU — „zeštíhlení odebráním vstupu" NEFUNGUJE.** Navrhl jsem to
před hodinou; měření to vyvrací: po odebrání obrazu délka věty **STOUPLA** (15,9 → 17,0/17,1)
a počet slov taky (55 → 59). **Rozpočet slov je v promptu pevný, takže odebraný vstup se
nevypustí — model tu díru vyplní něčím jiným a sáhne si až k hornímu okraji rozpočtu.**
→ Chceme-li tenčí čtení, musí se hýbat ROZPOČTEM (`LENGTH_BUDGETS`), ne vstupy. Odebírání
vstupů mění, ČÍM je čtení naplněné, ne KOLIK toho nese.
⭐ **C (materiál) drží obojí — krajinu i otázku.** Laguz-C: *„a single thread of water at the edge
of the field… Laguz is how that trickle knows the low ground before the eye does, and **finds the
door no one built**. The work you are after runs downhill already."* Islandská látka zůstala,
scéna je o práci. **Ale C je zároveň NEJDELŠÍ a nejhustší (59 slov, 17,0/větu)** — nese materiál
I otázku, takže je nejvíc přeplácané. Owner chce tenčí; C je tlustší. To se musí vyřešit
rozpočtem, ne cellou.
⭐ **OPONENTURA K „runa vstoupí jen jako význam, bez obrazu" (D): u části run to NEJDE.**
Laguz-D si vodu přinesl stejně (*„the faint tug at the surface… the quiet pull under the still
water"*) — protože Laguz **znamená vodu**. Totéž hrozí u Isa, Kenaz, Hagalaz, Berkana. Naproti
tomu Tiwaz-D neměl ani jedno krajinné slovo. → **D rozděluje futhark na runy, které svůj obraz
odložit umí, a na ty, jejichž význam JE fyzická věc.** Jednotné pravidlo pro všech 25 run tedy
tímhle směrem nevznikne; buď to bude per-runa, nebo se D nedá použít.
⭐ **OPONENTURA K ALTERNACI POŘADÍ** (owner: „co je první může být poslední"): páka na pestrost
to nejspíš je (má precedent v `LENGTH_BUDGETS`, měřeno). ⚠️ Ale máme i měřený protipříklad —
když se v Ask odebrala vynucená závěrečná věta, **stoupla RADA** 1/4 → 2/4. Struktura něco
DRŽELA. Alternace se proto nesmí testovat otázkou „je to pestřejší?", ale **„co to staré pořadí
drželo, a drží to i po přehození?"** — jinak se ztráta objeví jinde a nikdo ji nespojí s touhle
změnou.

## 2026-09-06 — ⭐ TEST 5 VĚT · Místo navíc pustí otázku dovnitř — 5/10 → 0/10 ignorovaných
Ownerova hypotéza: *„zkusit mu dát 5 vět a třeba 70 slov… jako kdyby měla Area 1 větu a 10 slov
navíc."* Baseline = cela Q z TESTu PROPIS (tytéž runy, **týž seed**, táž otázka, **bez štítků**),
takže se generovala jen nová cela. Korpus `~/runar-eval/petvet.jsonl`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
| rozpočet | čtení BEZ zmínky o práci | průměr zmínek | slov/větu | průměr slov |
|---|---|---|---|---|
| dnešek (3–4 věty, 38–58 slov) | **5/10** | 0,6 | 15,7 | 56 |
| **5 vět, 65–75 slov** | **0/10** | **1,4** | **15,9** | 79 |
⭐ **Jedna věta navíc pustila otázku dovnitř v KAŽDÉM čtení.** A hustota se přitom nezhoršila —
15,7 → 15,9 slova na větu. **To je opak toho, co dělalo odebírání vstupů** (tam věty ztloustly
na 17,0 a otázka se nezlepšila): **místo navíc otázku vpustí, odebrání vstupu ne.**
⭐ **Překonalo to i štítky:** area+intention zvedly otázku z 5/10 na 8/10, pět vět na **10/10**
— a to bez štítků. Rozpočet je tedy silnější páka než kontext.
**Obraz runy přitom nezmizel** — jeřáb, tavná voda, lampa v okně jsou dál tam, jen se vedle nich
vešla práce: Tiwaz Q *„A new door means naming what you will not set down"* (2 slova o práci)
→ W *„A new post may call, and much in it will look right, yet the question underneath is what
you will hold to once the work is yours."*
⚠️ **Model cíl PŘESTŘELIL: 79 slov místo 65–75** (rozsah 66–90). Skutečně dodaná délka je ~79.
⚠️ **CENA (EL = 90 %):** 412 znaků proti dnešním 278 → **EL IS $0,0278 → $0,0412**, celkem IS
$0,0314 → **$0,0448 na čtení (+43 %)**. Na 50 jednotkách +$0,67 IS / +$0,33 EN měsíčně.
**To je skutečná cena za to, že se otázka dostane do každého čtení** — rozhodnutí ownera,
neratifikováno. Levnější varianta: 5 vět jen tam, kde uživatel otázku NAPSAL (dnes ji ignoruje
polovina právě těch čtení), a nechat 3–4 věty tam, kde žádná otázka není.

## 2026-09-06 — Statická čtení z kolekce: KOLIK MĚLA SLOV a jak blízko jsme se vrátili
Načteno z `runar_static_audio` (53 řádků, 28 EN + 25 IS s textem) — čtení z května, ke kterým
jsme se chtěli vrátit.
| | čtení | slov (medián) | vět | znaků (medián) |
|---|---|---|---|---|
| **statická (květen)** | 28 EN / 25 IS | **51 EN · 59 IS** (39–70 / 37–85) | **3** | **277 EN · 320 IS** |
| dnešní produkce (mix rozpočtů) | — | ~47 | 3–4 | **272** |
| 5 vět (dnes testováno) | — | 79 | 5 | **412** |
⭐ **V DÉLCE jsme se vrátili přesně: 277 vs 272 znaků.** Rozdíl je ve TVARU — statická mají
**3 věty po ~17 slovech**, dnešek 3–4 věty po ~16. Kratší věty, víc jich.
⚠️ **A pět vět by nás odvedlo daleko ZA ně** — 412 znaků je o **49 % víc** než ta statická.
Kdo je bere jako cíl, ten pět vět plošně nechce; ta „levnější varianta" (5 vět jen tam, kde
uživatel napsal otázku) drží průměr blízko 277.
⚠️ **Nepříjemný nález o vzorech samotných:** statická čtení by dnešním testem na radu
NEPROŠLA. *„**You are being asked to endure**, not because the path is cruel"* (Eihwaz) ·
*„**You are being asked to trust** what moves beneath the surface"* (Laguz) — obojí se
smazáním slov převede na imperativ. Také otevírají *„You have drawn Eihwaz…"*, což dnešní
prompt nedělá. **Vracet se k nim jako k celku by znamenalo vrátit i radu** — brát se z nich
má hutnost a klid, ne stavba vět.

## 2026-09-06 — „This reading is for" (intention): projeví se jen ČASEM, ne obrazem
Owner: *„je to minulost, současnost a budoucnost, to znamená jen mluvit v jiném čase."*
Ověřeno: táž runa, **týž seed**, táž otázka, **bez area** (owner: buď area, NEBO intention).
Korpus `~/runar-eval/intention.jsonl`. <!-- doc-links:ok 2026-09-06 korpus mimo repo (~/runar-eval), checker home neresi -->
**Ownerova domněnka je přesná — obraz se nemění vůbec, mění se jen čas, ke kterému mluví:**
| intention | Eihwaz (jeřáb ve větru) | Perth (oblázek v řece) |
|---|---|---|
| Right now | *„The wind names one direction **now**, then another."* | *„It travels through shadow **now**… Where it stops is **not yet** the bed."* |
| Decision ahead | *„Which pull do you feel more, the branches turning or the roots holding fast?"* | *„a thing **not yet set down**. Where it stops is **still** under the water."* |
| Understanding the past | *„**What already tested you** left the wood harder where it strained. **Which storms taught** the trunk…"* | *„**What has already carried you here was moving long before** you named the wish."* |
→ **Intention je nejlevnější a nejčistší z faktorů:** nemění obraz, nesoupeří o slova, jen
posune sloveso. Délka beze změny (55–65 slov ve všech šesti). Ownerovo *„buď area, nebo
intention, nikdy oboje"* tím dostává oporu — intention si na rozdíl od area nebere prostor
z obrazu, takže o slova soupeří jen area.

## 2026-09-06 — TEST ABLACE (GPT tabulka INPUT→TRACE→OUTPUT) · ⚠️ TAKHLE SE TO ZMĚŘIT NEDÁ
Owner: *„ta jeho tabulka měření vstupů, dávalo by to smysl?"* — **jako otázka ano, jako měření
ne**, a tady je důkaz. Metodická oprava GPT návrhu: „síla ve výstupu" se nedá měřit tím, že se
něco ve výsledku objeví (to nerozliší, jestli to způsobil vstup, nebo by to model napsal stejně)
— jedině **ablací**: totéž čtení BEZ toho vstupu, týž seed, a co se změnilo.
Provedeno: 4 runy × (baseline + 6 ablací) = 28 čtení + **8 čtení nulové kontroly**.
Korpus `~/runar-eval/ablace.jsonl` · `ablace-null.jsonl`. <!-- doc-links:ok 2026-09-06 korpusy mimo repo (~/runar-eval), checker home neresi -->
| ablace | slov v promptu | shoda s BASE (4-gram) | verdikt |
|---|---|---|---|
| −image | 12 | 0,003 | v šumu |
| −keywords | 7 | 0,014 | v šumu |
| −seeking | 50 | 0,024 | v šumu |
| −world | 12 | 0,032 | v šumu |
| −area | 31 | 0,039 | v šumu |
| −angle | 32 | 0,049 | v šumu |
| **⭐ ŠUMOVÁ PODLAHA — TÝŽ prompt 2×** | — | **0,041** | — |
⭐ **Všechny ablace leží NA nebo POD šumovou podlahou.** Týž prompt pustený dvakrát dá texty,
které si jsou podobné stejně málo (0,041) jako text s odebraným vstupem (0,003–0,049). **Model
píše pokaždé od začátku, takže podobnostní metrika nerozliší „vstup odebrán" od „stejný prompt
podruhé".** GPT tabulku tímhle způsobem vyplnit nelze — vyrobila by čísla, která nic neznamenají.
**Co měřit JDE — stopa, ne podobnost.** Jestli se OBSAH vstupu objeví ve výsledku:
| cela | téma otázky (práce) ve výsledku |
|---|---|
| BASE | **4/4** |
| −area | **1/4** ← největší propad |
| −keywords | 2/4 |
| −world · −angle · −seeking · −image | 3/4 |
→ **Nejsilnější stopa na téma otázky má AREA**, ne obraz. Bez ní se práce vytratila ze tří ze
čtyř čtení. ⚠️ **n=4, tedy signál k prověření, ne nález** — ale je to jediná osa, kterou tenhle
návrh vyplnit umí, a sedí na dřívější měření (bez štítků 5/10 ignorovaných, se štítky 2/10).
**Zapsat pro příště:** kdo bude chtít GPT tabulku doplnit, musí (a) měřit stopu obsahu, ne
podobnost textů, (b) mít n aspoň 10 na buňku, (c) VŽDY přiložit šumovou podlahu — bez ní
by dnešní běh vypadal jako šest silných nálezů, a přitom nemá ani jeden.

## 2026-09-06 — Proč SEEKING nechává tak malou stopu (owner: „nechápu, jak to")
Vytištěn skutečný text `_registerContext` pro všech pět voleb. **Odpověď je v něm samotném:**
> *„**This is a leaning, not an order — do not name it back or hand it over as a thing; let it
> colour the tone only.** The seeker asks for clarity — bring one thing into focus…"*
⭐ **Prvních 27 slov z padesáti model instruuje, aby seeking NEBYL vidět.** A ta věta je
u všech pěti voleb **doslova stejná** — mění se jen druhá půlka. Takže seeking:
- stojí **50 slov promptu** (nejvíc ze všech faktorů — víc než area 31 i angle 32),
- z toho **54 % je meta-pokyn „nedávej to najevo"**, který se opakuje pětkrát v pěti variantách,
- a **jeho vlastní obsah je „obarvi tón"** — tedy něco, co v textu ze své podstaty nemá zanechat
  stopu. Malá stopa NENÍ vada měření; je to přesně to, co si ta instrukce vyžádala.
→ **Není to nefunkční faktor, je to DRAHÝ faktor.** Padesát slov za obarvení tónu, zatímco
area za 31 slov drží téma otázky v textu (bez ní 1/4 místo 4/4). Ownerovo *„buď seeking, NEBO
area"* tím dostává oporu: **při stejné ceně dělá area víc.**
⚠️ Neměřeno: jestli ten tón opravdu obarví (osy „register" se nikdy neměřily). Netvrdí se,
že seeking nedělá nic — tvrdí se, že za 50 slov nedělá nic VIDITELNÉHO.

## 2026-09-06 — „Hutnost a klid" statických čtení — z čeho jsou udělané
Owner: *„hutnost a klid — rozeber, jak to myslíš."* Změřeno na 28 statických (EN) proti
24 dnešním, vše z už existujících textů, nula volání.
| | statická (květen) | dnešní |
|---|---|---|
| slov | 51 | 58 |
| **vět** | **3,0** | **4,0** |
| slov na větu | **17,0** | 15,9 |
| **čárek na větu** | **0,67** | **1,00** |
| **první věta** | **14 slov** | **19 slov** |
| končí otázkou | 21 % | 33 % |
| „you are / you have" | **79 %** | 25 % |
| jméno hledajícího | **0 %** | 42 % |
⭐ **„Hutnost" = delší věty s MÉNĚ vsuvkami.** Statická mají o slovo delší věty, ale o třetinu
míň čárek — tedy věty jsou **dlouhé, ale jednoduché**, ne dlouhé a rozvětvené. Dnešní čtení
mají kratší věty nacpané vedlejšími větami; odtud ten pocit „složitě popsané".
⭐ **„Klid" = krátký nádech na začátku a méně otázek.** Statická otevírají **14slovnou** větou
a jen pětina končí otázkou. Dnešek otevírá **19 slovy** a třetina končí otázkou — čtenář je
hned zavalený a hned tázaný.
⚠️ **Ale to, čím se toho dosahovalo, brát nesmíme:** *„you are being asked to…"* je v 79 %
statických a je to přesně ta rada, kterou dnešní pravidla zakazují (dnes 25 %). A jméno v nich
není vůbec, kdežto dnes 42 % — to je záměrná personalizace, ne vada.
→ **Co z nich vzít, aniž se vrátí rada — dvě páky, obě měřitelné a obě LEVNÉ:**
1. **Kratší první věta** (cíl ~14 slov místo 19) — je to nádech, ne expozice.
2. **Míň vsuvek** (cíl ~0,7 čárky na větu místo 1,0) — jedna myšlenka na větu, dlouhá věta smí
   být, ale nesmí být rozvětvená.
Obojí nemění délku čtení, tedy **nestojí ani halíř na ElevenLabs** — narozdíl od pátých vět.

## 2026-09-08 — TEST HUTNOST v1 → v2 · páka „krátký nádech" spravena, páka „míň vsuvek" NE
Dvě páky vytažené ze statických čtení, zkoušené **jen v harnessu, do produkce nesaženo**
(owner: „zatím jen tady"). Baseline = cela BASE z TESTu ABLACE, tytéž runy, **týž seed**.
Korpusy `~/runar-eval/hutnost.jsonl` · `hutnost2.jsonl`. <!-- doc-links:ok 2026-09-08 korpusy mimo repo (~/runar-eval), checker home neresi -->
| | první věta | čárek/větu | slov | cena |
|---|---|---|---|---|
| dnešek | 17,5 | 1,17 | 46 | — |
| **v1** „asi 14 slov" + „nejvýš 1 čárka" | **10,5** ↓přestřelil | 1,00 | 48 | beze změny |
| **v2** „ne víc než 15" + „one thought, no asides" | **13,0** ✓ | 1,00 | 46 | beze změny |
| statická (cíl) | 14 | 0,67 | 51 | — |
⭐ **Páka 1 opravena ownerovou úpravou.** „Asi čtrnáct" model četl jako cíl a mířil doprostřed
(10,5); **horní mez „ne víc než patnáct" ho posadila na 13,0.** Poučení šířeji: **cílové číslo
v promptu se čte jako střed rozsahu, mez se čte jako mez.**
⚠️ **Páka 2 nedojela ani po přeformulování — 1,00 v obou verzích.** Ownerova diagnóza formule
ale byla správná a projevila se v ROZPTYLU: v1 dala **přesně 3 čárky ve všech čtyřech** čteních
(počitatelné pravidlo se plní počítáním), v2 dala 3-3-4-3. Tuhost zmizela, číslo ne.
→ **Hypotéza k prověření (neověřeno):** 0,67 čárky na větu možná NENÍ dosažitelné instrukcí —
je to vlastnost STARÉHO hlasu statických čtení, a ten měl zároveň radu v 79 %. Honit ten cíl
může znamenat honit vlastnost, kterou nechceme. **Než se páka 2 zkusí potřetí, měl by někdo
ukázat, že věta s 1,0 čárky je horší než s 0,67** — dosud to nikdo neměřil, jen se to odvodilo
z profilu statických.
**Ukázka (Eihwaz, týž seed):** dnešek *„The rowan by the farmhouse leans in the wind but holds
its footing, root deep in the old ground."* (19 slov) → v2 *„The rowan leans in the wind but its
crown never goes all the way down."* (15 slov), a závěr *„What you are looking for, Kuky, is
already standing in the ground beneath your feet."*

## 2026-09-08 — HUTNOST v2 třikrát na týž seed · obraz se opakuje, VÝKLAD ne
Owner: *„udelej ty cteni znova. chci videt jestli bude jiny vyklad!"* Týž prompt, tytéž čtyři
runy, **týž seed** (700000 + i·907), tři běhy (A/B/C). Korpusy `hutnost2.jsonl` + `hutnost2bc.jsonl`.
<!-- doc-links:ok 2026-09-08 korpusy mimo repo (~/runar-eval), checker home neresi -->
⭐ **Nález: čtení se dělí na dvě vrstvy s úplně jinou stálostí.**
| | shoda mezi běhy (Jaccard, obsahová slova) |
|---|---|
| **první věta** = obraz, který runa přinesla | **0,272** |
| **poslední věta** = výklad, co to znamená pro tazatele | **0,111** |
Materiál je stálý (jeřáb ve větru · oblázek v řece · ovce k ohradě · rozcestník na hřebeni —
to drží `RUNE_IMAGES`), ale **verdikt je pokaždé jiný**. Perth: „kam dopadne, je skryté" ×
„není tvoje starost to hlídat, jen jít dál" × „už se to pod hladinou tvé otázky hýbe".
Tiwaz: „práce není místo, ale sever, co si neseš" × **„za jakou práci stojí za to stát rovně?"**
(běh B jediný obrátil výklad v otázku).
⚠️ **Hranice nálezu:** n = 4 runy × 3 běhy; **Fehu ukázalo obráceně** (0,127 obraz vs 0,149
výklad) — poměr 2,5× je průměr, ne zákon. Metrika sama je slabá (§27: podobnostní čísla v tomhle
rozsahu jsou u šumové podlahy) — **nese to hlavně čtení textů, ne to číslo.**
→ **Co z toho plyne pro páky:** skladba věty se ladí bezpečně, protože **se nedotýká toho, co se
stejně mění samo.** Sevřít stavbu vět neznamená sevřít výklad — pestrost sedí jinde, než kde
se ladí rytmus.

## 2026-09-08 — MAPA PESTROSTI · esenční řádek má JEDEN tvar (60/60) · test „role vět"
Owner: *„co všechno nám dodává pestrost? Hledáme jednoduché věci, místo přidávání obrazů…
chceme spíš UČIT, ne zákazy a příkazy… i když to znamená dávat los na to, kolik vět a čárek."*
Korpus `~/runar-eval/role.jsonl` (7 cel × 4 runy × 3 běhy = 84 čtení, týž seed, délkový rozpočet
PŘIBITÝ na čtyřvětový, aby čtyři role měly kam se vejít). <!-- doc-links:ok 2026-09-08 korpus mimo repo -->

### ⭐ Nález 1 — esenční řádek je nejméně pestré místo celého čtení
Tvar „**\<Runa\> is …**" / „**This is \<Runa\>, …**": dnešní produkce **28/28**, napříč všemi
korpusy **255/399 = 64 %**, v tomhle testu **60/60**. Květnová statická čtení (starý hlas):
**0/53** — 87 % z nich nepoužilo ani jeden z těch tvarů, zbytek měl vlastní šablonu („X speaks of").
⚠️ **Není to tím vzorem v promptu.** Odebrání jediného příkladu („Fehu is that warmth…") a jeho
náhrada čtyřmi různými tvary srazila šablonu 100 % → **92 %**, tedy nic. V systémovém promptu
žádná věta jmenující runu není (ověřeno výpisem).
→ **ABLACE našla zdroj:** vyříznutí řádky `Mention <Runa> by name once, woven naturally.` srazí
šablonu na **33 %** — ale v **8 z 12** čtení pak jméno runy nepadne vůbec. Je to tedy **diagnóza,
ne oprava**: „pojmenuj runu jednou" + „řekni, co dělá" = zadání definice, a definice v angličtině
vychází jako spona. **Kdo to bude opravovat, musí změnit ZADÁNÍ, ne přidat zákaz.**

### Nález 2 — pevná role na větu měřitelně zdražuje a měřitelně nic nezlepší
| cela | co dělá | šablona | znaků | vs CTRL | shoda posl. věty |
|---|---|---|---|---|---|
| CTRL | dnešní prompt | 100 % | 321 | — | 0,089 |
| TVAR | odebrán vzor esenčního řádku | 92 % | 335 | +4,4 % | 0,088 |
| RAM | „jméno dorazí uvnitř děje" | 100 % | 342 | +6,5 % | — |
| BEZJ | ablace „pojmenuj runu jednou" | **33 %** | 322 | +0,4 % | — |
| **ROLE** | **čtyři číslované role** | 100 % | **354** | **+10,4 %** | 0,141 |
| UCIT | táž anatomie, učená, bez čísel | 92 % | 331 | +3,2 % | 0,242 |
| LOS | los mezi třemi anatomiemi | 100 % | 330 | +2,9 % | 0,103 |

**Cena:** ROLE = **+$3,34 na 1000 islandských čtení** (EL, `RUNAR_PRICING.md`) za nulový doložený zisk.
⚠️ **Sloupec „shoda poslední věty" cely NEROZLIŠÍ** (§27, útok 1): rozdíl mezi runami je větší než
mezi celami — Fehu samo dá 0,199 (CTRL) až **0,756** (UCIT), zbylé tři runy v téže cele 0,000–0,145.
Celé UCIT drží jediná runa. **Netvrdí se tedy, že role pestrost zabíjejí; tvrdí se, že to tímhle
nástrojem na n = 4 runách změřit nejde.** Co změřit jde, je délka a cena — a ta mluví proti.

### Nález 3 — tři páky, které v kódu jsou a do čtení nedojdou (ověřeno protlačením, ne čtením)
1. **`SEASON_POOLS` = 133 obrazů, ve čtení 0×.** Spočítáno přes produkční filtr: **0 ze 144**
   dvojic runa × sezónní bucket je bez runového kandidáta, takže větev `runePhrase || pool` sáhne
   po poolu nikdy. Padá s tím i **los klíčových slov** (`pickedKws`), který jede na téže podmínce.
   ⚠️ `CLAUDE.md` tvrdila opak („stojí na něm celá funkce") — **opraveno v témž commitu**.
2. **Sampling modelu se neřídí.** `temperature` / `top_p` / `top_k` se nenastavuje nikde
   (proxy ani klient). Je to největší jednotlivý zdroj rozdílu dvou čtení z téhož promptu — a jede
   na defaultu, který neznáme. Bez seedu proto **nejde golden-verify na text**, jen na prompt.
3. **Spready nelosují nic.** `_randomAngle` · `_lengthBudget` · `_endingShape` mají každý **jediné
   volání**, a to v single builderu. **Devítirunový Yggdrasil má míň proměnných než jednorunové single.**

### Co z toho plyne pro ladění před spuštěním
Nejlevnější pestrost neleží v přidávání obrazů, ale ve **třech dírách výš** — a ta nejlacinější
je Sowilo: má **jediného** kandidáta v `deepwinter` i `darkening`, takže od září do února dostává
pořád týž obraz.

## 2026-09-08 (2) — sampling NEJDE nastavit · los na esenčním řádku FUNGUJE · spready ověřeny
Korpus `~/runar-eval/pest2.jsonl` (8 cel × 4 runy × 3 běhy, týž seed, týž přibitý čtyřvětový
rozpočet jako `role.jsonl`, takže cela CTRL odtud slouží jako společná podlaha).
<!-- doc-links:ok 2026-09-08 korpus mimo repo -->

### ⭐ Sampling — otázka je zodpovězená a odpověď je „nedá se"
`temperature` / `top_p` / `top_k` vrací na `claude-opus-4-8` **HTTP 400 „deprecated for this
model"**. Projde jedině `temperature: 1` — tedy default, tedy žádná změna. **Není to tedy díra
v našem kódu, kterou by šlo zavřít; ta páka na produkčním modelu neexistuje.** Ráno téhož dne
jsem to zapsal jako „rozhodnout, jestli to chceme řídit" — opraveno tady i v `RUNAR_BACKLOG.md`.
→ **Vedlejší zisk: šumová podlaha metriky.** Cela `TEMP10` (`temperature: 1`) je požadavek
**identický** s `CTRL` — a shoda poslední věty vyšla **0,126 proti 0,089**. Dvě totožné
konfigurace se tedy liší o **0,037**: rozdíl pod ~0,04 v téhle metrice **není nález**.
Tím padá i moje ranní opatrnost u cely UCIT (0,242) — ta je nad podlahou, ale drží ji jediná runa.

### ⭐ Esenční řádek — šablonu zlomí ZMĚNA ZADÁNÍ, a pestrost až LOS bez dnešního tvaru
| cela | „\<Runa\> is …" | „\<Runa\> sloveso …" | jiný tvar | slov |
|---|---|---|---|---|
| CTRL (dnešek) | **100 %** | 0 % | 0 % | 60,8 |
| E-UKAZ — „runa je podmětem DĚJE, ne definice" | **0 %** | **100 %** | 0 % | 60,5 |
| E-LOS — los ze 4 rámů, jeden z nich dnešní | 42 % | 42 % | 17 % | 59,8 |
| **E-LOS3 — los ze 3 rámů, žádný dnešní** | **33 %** | **42 %** | **25 %** | **60,8** |
| E-KONEC — jméno runy až v závěrečné větě | 58 % | — | — | 60,9 |
| E-NIC — esenční řádek odebrán úplně | 58 % | — | — | 59,5 |
⚠️ **E-UKAZ není oprava, je to výměna.** Spona zmizela na nulu, ale nastoupil jiný jediný tvar
(*holds · holds · keeps · counts · gathers · counts*). Kdo se zastaví u téhle cely, vymění
jednu šablonu za druhou — proto se to počítá do dvou sloupců, ne do jednoho.
⭐ **Pestrost dá až LOS, a jen když v něm dnešní tvar NENÍ.** Jeden špatný prvek los stáhne
(E-LOS: 42 % spony). Tři rámy bez spony dají rozložení 33/42/25 a **délku beze změny** (60,8 =
přesně CTRL) → **nula navíc na ElevenLabs**.
⚠️ **E-KONEC selhal poučně:** přesun jména do závěrečné věty udělal ze závěru definiční slot —
shoda poslední věty **0,242**, nejvýš ze všech cel. Definice se nepřesouvá, jen si najde nový domov.
**E-NIC:** i po úplném odebrání esenčního řádku model runu definuje v 58 % → **ten řádek není
příčina**; příčina je požadavek „pojmenuj runu a řekni, co dělá".

### Spready — ověřeno postavením skutečného promptu pro všech pět cest
| složka | SINGLE | NORNS | KŘÍŽ | HORSESHOE | YGGDRASIL |
|---|---|---|---|---|---|
| úhel otevření · esenční řádek · losovaná délka | **ano** | — | — | — | — |
| obraz · AREA · seeking · no-cold-read | ano | ano | ano | ano | ano |
| počet vět | **los 3/4** | pevně 6 | pevně 7 | pevně 12 | pevně 15 |
⭐ **Spready už tu „roli věty" mají** — pevnou `landing` na poslední větu (a `thread` mezi
pozicemi od v4.9). Co nemají, je jakýkoli **los**. Takže otázka „má se předepisovat role věty"
se dá číst z produkce: **předepsané konce běží ve spreadech, losované v single** — a porovnat
je jde bez jediného nového volání.

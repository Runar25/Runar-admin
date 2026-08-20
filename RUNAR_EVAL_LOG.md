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


## Překombinovanost promptu — kritika 2026-08-06 (plán oprav, k EVALU)
⚠️ **Runar FUNGUJE — opravit, ne rozbít.** Pravidlo stejné jako výš: **1 páka/verze, bump `PROMPT_VERSION`, eval PŘED/PO, ship jen bez regrese** (§18.4/§24). Dokázáno = co se DUPLIKUJE; efekt škrtu na kvalitu = **hypotéza**, ne jistota. Detail kritiky: task `wd54cabfp` (ephemeral) · vizuální mapa: memory `prompt-map-artifact`.

**VERDIKT:** ~50-60 příkazů na ~40 slov (~15-20:1); stejné pravidlo 3-4× → ředí + staví „zeď zákazů".

**DUPLIKÁTY (říct 1×):** „jeden obraz" 4× (grammar#4 + voice profil 3×) · „no sections/labels" 3× (format+length+closing) · „describe don't explain" 2× (voice + `_describeRule`) · zakázaná slova 2× (never + grammar#3) · 2. osoba 3× · studená-runa-v-létě 2× (voice verze **MRTVÁ** — system sezóna se ignoruje).

**ROZPORY:** angle#8 „life rune first" × noqBranch „Open with drawn" × lens „runu NEjmenuj" · voice „otázka VŽDY překvapí" × `_endingShape` „bez otázky" · PURPOSE „posbírej kontext" (už je vložený → svádí k doptávání).

**NEVER→DO:** uděláno JEN v user/voice vrstvě (Confirmation reframe v0.6, voice ~90 % pozitivní, angles pozitivní); **system `never` blok zůstal negativní.** ⭐ `_noColdRead` SÁM jmenuje „already/þegar" **3×** = přesně slovo, co eval našel unikat **4/5** → negace zasadila token, v user promptu, každé čtení = **FIX #1 (má eval data). ✅ HOTOVO = tag v1.2** (reframe: pozitivní lead, slovo se už nejmenuje; oba zákazy drží; NEmergnuto s `_describeRule`).

**DÍRY (§19):** `journey/embrace/empower` BEZ output kontroly (`check-is` čte ZDROJ, ne výstup) → přidat deterministický output linter · produkce nemá pravidlo „nikdy nepřekládej jména run" (jen mrtvá V2).

**POŘADÍ (nejbezpečnější signál první, 1 páka/verze):** ✅ **T2** `_noColdRead` reframe = tag v1.2 · ✅ **ending wording** (T3 část) = tag v1.1. **Zbývá:** T1 dedup (neutrální/lepší) → output linter → T3 zbytek (angle#8 „life rune first" gate) → T4 škrty (vzhled Rúnara · purpose „gather context").

**NESAHAT:** NEmergovat `_describeRule` + `_noColdRead` (každá platí za JINOU eval-chybu) · JSON kontrakt · IS 7-bod gramatika · length (audio budget) · variabilita (angle/name/ending pooly). `DEF_CHAR.never` + data run = 📜 kánon / 🔒 fakt → reframe = **datované DECISIONS, ne tichý tune.**


### 2026-08-14 — papouškování obrazu v IS: co příčina JE a co NENÍ

Řada měření (vždy 25 IS run, `scripts/utils/measure_readings.js`, řádek „papouškování obrazu"):

| stav promptu | celá fráze doslova | nejdelší úsek |
|---|---|---|
| v1.4 dlouhá vkládací věta | 12 % | 34 % |
| v2.0 `notaðu þessa` („použij tenhle") | 56 % | 73 % |
| v2.0 + rámec zdroje | 44 % | 59 % |
| v2.1 + kontext za obrazem | 32 % | 52 % |
| v2.1 **zkrácený o 509 znaků** | 24 % | — |

**Co JE příčina:** sloveso kolem vkládaného textu. `notaðu þessa` = rozkaz → 12 % → 56 %, **p = 0,002**.

**Co NENÍ příčina:** délka promptu. Zkrácení o 17 % dalo 32 % → 24 %, **p = 0,75** (a opačným směrem,
než hypotéza čekala). EN má skoro stejně dlouhý čtecí prompt (321 vs 307 slov) a **kratší** systémový
(681 vs 781), přesto opisuje 9 % proti islandským 32 %. Hypotéza „vrátit IS hmotu" tím padá.

**Pracovní vysvětlení:** slabší islandština modelu → podaná hotová věta se použije místo vlastní.
Směr dalšího testu je proto **rozbít hotovost** vkládaného obrazu (fragmenty místo věty), ne délka.


### 2026-08-14 — co o srozumitelnosti říká literatura (a co NEŘÍKÁ)

Rešerše se čtyřmi nezávislými pohledy + adversariální audit každého nálezu.
**Hlavní výsledek je nulový nález:** o preferenci „prostě vs. poeticky" u věštby
**neexistuje ani jeden zdroj s čísly**. Ownerova hypotéza není vyvrácená — je **neměřená**.

**Co je doloženo tvrdě:**

| nález | čísla | zdroj |
|---|---|---|
| Snížit „úroveň čtení" textu nedělá s porozuměním **nic** | RCT n = 2 235; 8./10./12./14. třída → 9,0 / 9,1 / 8,9 / 9,1; p = 0,06; ani u nízkogramotných | PMC12119439 |
| Cena za porozumění je ve **stavbě věty**, ne ve slovníku | vnořené vsuvky brzdí vybavení víc než odborné termíny; N = 184 | Cognition |
| Readability formule **nepředpovídají** porozumění | 487 účastníků, 716 textů; SMOG koreluje 0,334 jen s *vnímanou* obtížností | — |
| Prostý jazyk **neubere na vážnosti** | právníci n = 105 + 102; porozumění β = 0,354, p < 0,001; vymahatelnost beze změny p = 0,717 | — |
| „Konkrétnější zní pravdivěji" **v replikaci padlo** | předregistrováno, N = 466, dz = 0,08 a 0,11, síla > 95 % (originál n = 46, dz = 0,48) | — |

**Metafora — odpověď existuje a je podmíněná, ne jednosměrná:**
- Přesvědčivost metafory celkově **r = 0,07**; ale **r = 0,42**, když je metafora **jedna**,
  nerozvedená, se **známým** cílem a **brzy** v textu (Sopory & Dillard 2002).
- Gramotnost **moderuje** (Krieger 2017, JNCI, n = 500, p = 0,03): u nízkogramotných byla
  metafora **lepší** než prostý jazyk (p = 0,04).
- **Platí se za NEZNÁMOU obraznost, ne za obraznost.** n = 48: doslovné i **konvenční**
  metafory ~90 % „dává smysl"; novelní 40 % a 10 %.
- ⚠️ **Nerodilý mluvčí nerozumí a neví o tom:** vysvětlil 50,6 % metafor z přednášek, potíž
  si uvědomil ve **4,2 %** případů. U věštby se ten tichý výpadek schová za Barnum a vypadá
  jako úspěch.
- Pro nerodilé je „X je **jako** Y" levnější než „X **je** Y" (eye-tracking, N = 63, β = 0,74).
- **Věk není prediktor** (n = 76 + 91): starší byli u nových literárních metafor **lepší**.
  Prediktor je slovní zásoba.

**Zesílí zjednodušení Barnum? Ne — ale ani ho neoslabí:**
- Vágní formulace se čtou **rychleji** než přesné (N = 315, χ² = 17,60, p < 0,001) — vágnost
  je fluentní, zjednodušením neubereš to, co projekci živí.
- Rým zvedl vnímanou přesnost 6,38 vs. 5,15 (p < 0,01) při **nulovém** rozdílu ve
  srozumitelnosti (N = 60). Poetika projekci zvedá taky.
- ⭐ **Skutečný ovladač Barnumu je zdánlivá personalizace, ne registr.** Snyder 1974, N = 63:
  **identický** horoskop dostal 3,24 / 3,76 / 4,38 podle toho, jestli byl podán jako obecný,
  z roku+měsíce, nebo z roku+měsíce+dne narození (F = 7,56, p < 0,0002).
- Forerův generický popis: **4,3 z 5** (N = 39, nikdo pod 2). To je laťka, kterou přeskočí
  cokoli → **„působilo to přesně?" je jako metrika mrtvé.**

**Co se doložit NEDÁ:** poptávka (žádný survey, žádná A/B data provozovatelů) · cokoli
o islandštině a skandinávském publiku (Island není ani v PIAAC) · přenos na věštbu (všechny
studie měří text, kde *je* co pochopit — souhlas, smlouva, daňový formulář) · délka
(fluency studie pracují s jednotlivými větami, ne s textem délky čtení).
Jediná recenzovaná práce přímo k AI věštbě (CHI 2026, n = 12 **praktikujících vykladačů**)
o jazyce **neříká nic**.

**Naše vlastní čísla k tomu (změřeno na 4 dávkách):** islandská čtení mají 41 slov, 3 věty,
**13,6–13,8 slova na větu**; anglická 49 slov a 16,3. Rúnar tedy dlouhé věty **nemá** —
na zkracování vět není kam jít. Čtení je krátké a **husté**: tři věty nesou runu, úhel,
obraz, čočku životní runy a tvar zakončení.


### 2026-08-15 — „already" / „þegar": příčina nalezena, a je to sám Rúnar

Owner: *„to already musí být něco, co ho pořád tlačí k tomu, aby ho říkal… chtěl bych najít příčinu!"*
Měřeno na **226 anglických čteních z produkce** (ne na probe dávce).

⚠️ **OPRAVA (tentýž den, nález nástroje `find_seeds.js`).** První verze tohoto záznamu tvrdila
„66 z 226 = 29 %". To číslo bylo naměřené jen na `short_text` — **`deep_text` jsem nikdy neotevřel**,
a čtení má obě pole. Správně: `short_text` 66 · `deep_text` 53 · **aspoň v jednom 111 z 227 = 49 %**.
Podhodnoceno o 20 procentních bodů. Směr nálezu ani závěr se nemění, velikost ano.
⭐ Tohle je důvod, proč metoda patří do nástroje a ne do hlavy: první, co automat udělal, bylo, že
chytil ruční měření, kvůli kterému vznikl. (→ `CLAUDE.md` §24: plocha měření je součást měření.)

**Kolik toho vlastně je.** **111 z 227 čtení (49 %)** obsahuje „already". Z toho nese
**19 nárok na vnitřní stav** („already know / feel / sense / remember / carry"), z nich 13 explicitně
s „you". Zbylých ~92 je **běžné časové užití** („already becoming real", „already here"), které žádné
pravidlo neporušuje. **Slovo samo tedy problém není** — vada je NÁROK.

**Zesilovač, který se dal odstranit — jediný doložený.**

| seeking | čtení | s „already" | |
|---|---|---|---|
| **Confirmation** | 24 | **19 = 79 %** | text té volby slovo doslova nesl |
| všechna ostatní | 203 | 92 = 45 % | |
| druhá nejvyšší: Insight into Challenge | 14 | 8 = 57 % | |
| kontrola: Clarity | 26 | 10 = 38 % | slovo v textu nemá → **pod** základem |

**Fisher exact p = 0,0021**, replikuje v obou nezávislých půlkách dávky · kontrola Clarity je
**pod** základem, tedy nic. Text zněl
`has already decided` / `hefur **þegar** ákveðið sig` — a `þegar` je **přesně to slovo**,
které eval kdysi našel ve 4 z 5 islandských čtení. Opraveno na `has made up their mind` /
`hefur tekið ákvörðun` (1818 výskytů, GreynirCorrect 0 flagů); význam beze změny.

⭐ **Hlubší příčina, kterou odstranit NELZE, protože je to postava.** Základ 26 % zůstane.
V **každém** promptu stojí:
- `philosophy`: *„The runes do not decide your path… they help you **remember** it."*
- `_noColdRead`: *„let the seeker be the one to **recognise** themselves in the image"*

**Remember** i **recognise** předpokládají, že to tazatel už zná. To je Rúnarova teze —
odpověď v tobě byla dřív, než ses podíval — a „already" je pro tu myšlenku nejúspornější
anglické slovo. Není to tik, je to premisa prosakující na povrch. A je v tom ironie:
`_noColdRead`, které má bránit tomu říkat tazateli, co zná, je samo formulované přes
**rozpoznání**, tedy přes to, že to zná.

**Co se z toho nemá dělat.** Slovo zbývá i v `_intentionContext` („what has already passed"),
u Urðar („what is already fixed") a v kořenech Yggdrasilu („already been woven") — tam jsou
věty **o minulosti**, kde je to správná angličtina. Honit slovo tam, kde sedí, je táž chyba
jako ho zasévat. **Vada je NÁROK na vnitřní stav, ne token** — a ten se hlídá na výstupu
(→ `RUNAR_BACKLOG.md`, detektor `isColdRead`).


### 2026-08-15 — `find_seeds.js`: hledání zárodků automaticky

KUKY: *„je jasné, že všechno má někde svůj zárodek. a my ho zaseli textem."*

Ruční nález „already" trval hodinu a šel po mechanické cestě: vzít čtení, uhodnout páku, Fisher,
kontrola. Mechanická cesta patří do nástroje. `scripts/utils/find_seeds.js` dělá pro **každou**
páku (`area`, `seeking`, `intention`, `rune_name`) tohle:

1. Zjistí **diffem postavených promptů**, která slova ta páka do promptu přidává. Ruční tabulka
   „páka → slova" by se rozešla při první úpravě promptu; diff čte tentýž builder jako produkce (§19.3).
2. Změří, jestli se ta slova ve čteních s tou pákou objevují častěji (Fisher, BH-FDR).
3. Roztřídí: **ZASETO** (slovo je v textu páky a prosakuje) · **TICHO** (v textu je, neprosakuje) ·
   **DRIFT** (prosakuje, ale my jsme ho tam nedali → otázka pro člověka, ne nález).

**Nástroj se obhajuje sám (§27).** Každý nález má sloupec **REPLIKUJE**: dávka se dělí na dvě půlky
deterministicky podle `id` (ne `Math.random`, jinak nejde zopakovat) a nález musí ukázat týmž směrem
v obou. V ostrých bězích to opakovaně zabíjí nálezy, které by jinak prošly prahem — `healing`
(33 % vs 1 %, q = 1,3e-2) i `hidden` u Perth (38 % vs 3 %, q = 6,8e-4). Bez toho sloupce
by obojí vypadalo jako nález.
Nástroj navíc vypisuje **SLEPOTU** (medián nejmenšího zachytitelného výskytu — teď 25 %) a **PŘESKOČENO**;
tichá nula by lhala (§19.2). Prompt se losuje, takže diff běží 6× a bere průnik — jinak by losování
vyrábělo falešné zárodky.

**Ověření, že to k něčemu je** (`--v2 <adresář>` pustí sken proti starší verzi promptu): proti stavu
před dnešní opravou nástroj **sám, bez nápovědy, našel „already" u `seeking=Confirmation`** —
14/17 = 82 % proti 59/147 = 40 %, p = 1,3e-3, replikuje. Tedy nález, který ručně stál hodinu.
Proti dnešnímu stavu už tam není. (Sken jede jen na **single** čteních; 63 spreadů staví jiné
buildery, takže na ně single prompt neplatí — proto nižší `n` než u ručního měření.)

Vedle toho našel zárodky, o kterých se nevědělo:
- **`stillness` u runy Isa — 70 % proti 5 %** (p = 6,6e-7), `road` u Raidho (80 % vs 3 %),
  `root` u Eihwaz (67 % vs 9 %). Slova jsou v `RUNES[].k`, které prompt runě dodává.

  ⚠️ **OPRAVA (2026-08-16): u runy ta korelace PŘÍČINU NEURČÍ**, a první verze tohohle řádku
  to tvrdila. Runa způsobuje obě věci najednou — náš seznam **i** model. Isa **je** ledová
  a model to ví bez nás; „stillness" by tam mohlo být, i kdyby v seznamu nebylo. Třída ZASETO
  u `rune_name` je proto **podezření, ne důkaz**. Nástroj to od 2026-08-16 sám hlásí u výpisu.
- `love` u `area=Love & Relationships` (47 % vs 1 %) a `confirmation` u `seeking=Confirmation`
  (35 % vs 1 %) — páka propisuje své vlastní jméno do čtení.
- Jména run (`perth`, `hagalaz`, `wunjo` … 100 %) jsou ZASETO **záměrně** — prompt je nést má.
  Proto nástroj nahoře píše, že ZASETO ≠ vada.

**Co při dnešním `n` neuvidí:** slabší zárodek než ~25 % ve skupině. To není „čisto", to je „málo dat" —
s testery se práh posune sám.


**Tři chyby, které nástroj měl a které ho hned na začátku usvědčily** (patří sem, protože příště
se dají čekat znovu):
1. **`const` se mezi `vm.runInContext` nesdílí.** Prostředí se načítalo po souborech, takže
   `runar-character.js` viděl `SEEKS` jako `undefined` — a jeho vlastní obrana
   `typeof SEEKS === 'undefined' → return ''` z toho udělala **tiché prázdno**. Nástroj hlásil
   „páka nepřidává do promptu nic" u úplně všech pák a vypadalo to jako výsledek.
   ⚠️ Obrana proti chybějící závislosti umí z rozbitého prostředí udělat čistý nulový výstup.
2. **`rune_name` se v diffu nikdy neměnila** (runa se nepředává v `u`), takže jména run spadla
   do DRIFTU, jako by si je model vymyslel.
3. **Průnik místo sjednocení.** Pravidlo „slovo musí být ve VŠECH bězích" narazilo na to, že
   prompt losuje i klíčová slova runy — Isa nese „stillness" jen v půlce běhů. Průnik tedy
   zahazoval právě ty nejzajímavější nálezy.

Všechny tři odhalilo to, že nástroj vypisuje **PŘESKOČENO** a **SLEPOTU** místo tiché nuly (§19.2).


### 2026-08-16 — Příčina u klíčových slov: pokus si appka dělá sama, jen ho nikdo nečetl

Owner: *„každá runa má svoje hlavní slova… co kdybychom dal těm slovům ještě pár ekvivalentů?"*

**Nejdřív se musí vědět, jestli se z toho košíku vůbec tahá.** Rozšiřovat seznam, který na výstup
nemá vliv, je práce bez účinku — a `find_seeds.js` na to sám odpovědět neumí (viz oprava výš).

⭐ **Jenže randomizovaný pokus už běží.** Prompt losuje **3 klíčová slova z 5–6** a od 2026-08-10
zapisuje do `prompt_draws.kws`, **která padla**. Stačí uvnitř JEDNÉ runy porovnat čtení, kde slovo
padlo, proti těm, kde nepadlo: runa je v obou skupinách táž, takže „model to ví" se vyruší a zbyde
vliv **našeho textu**. Žádné nové generování, žádná změna promptu.

Implementováno jako `node scripts/utils/find_seeds.js --kws`.

**Stav k 2026-08-16: rozhodnout NELZE — 11 čtení s logem losu.** Vypisuje se to nahlas jako
„tohle NENÍ výsledek", ne jako nula. Předběžně (bez váhy): slovo se objevilo v 1/32 případů, kdy
padlo, a ve 4/22, kdy nepadlo — tedy **opačným směrem**, p = 0,15. Detail ukazuje `road` u Raidho,
`sun` u Sowila a `light` u Dagaz **ve čteních, kde ta slova nepadla**. Tři z pěti zásahů jsou ve
sloupci „nepadlo". Je to slabý, ale konzistentní náznak, že signaturní slovo runy vyrábí **model**,
ne náš seznam. Prahu 30 čtení se dosáhne provozem; pak to rozhodne samo.

**Sonda na klíčové slovo** hledá 4znakovou předponu (`waiting` → `wait` chytí i `waits`), ale
slovo kratší než 4 znaky musí sedět celé: sonda `ice` jako předpona by v islandské appce chytala
**Iceland** v každém druhém čtení. Tahle past je jedním z pěti bodů `--selftest`.

**`--selftest` (rozkopat vlastní práci).** Analýza, která nikdy nic nenajde, projde stejně tiše
jako správná. Test proto ověřuje tři věci, ne jednu: (1) sonda chytí ohyb a nechytí past,
(2) v datech s **nasazeným** efektem se efekt najde, (3) v **nulových** datech se nenajde nic.
Doplněno hlášení **NESPÁROVÁNO s RUNES** — tichý `continue` u nespárované runy by z rozbitého
párování udělal čistý nulový výsledek (§19.2), přesně jako `typeof SEEKS === 'undefined'` o den dřív.


### 2026-08-16 — Klíčová slova run stejnost NEDĚLAJÍ (200 vygenerovaných čtení)

Owner: *„každá runa má svoje hlavní slova… co kdybychom dal těm slovům ještě pár ekvivalentů?"*

Odpověď: **nepomohlo by to.** Ověřeno třemi nezávislými způsoby, ne jedním.

**1. Ablace — odebrat CELÝ seznam** (`gen_batch --without keywords`, 50 vs 100 čtení):

| | s klíčovými slovy | bez nich | p |
|---|---|---|---|
| čtení obsahuje aspoň jedno klíčové slovo své runy | 34/100 = **34 %** | 17/50 = **34 %** | 1,00 |
| překryv slovníku mezi čteními téže runy | 7,0 % | 7,8 % | 1,00 |

Shoda na procento. A metrika je přitom **zaujatá ve prospěch seznamu** — hledá NAŠE slovo,
takže parafráze („quiet" místo „stillness") se počítá jako minutí. Umí vliv seznamu nadhodnotit,
nikdy podhodnotit. Nenašla nic ani tak.

⭐ **Nulové srovnání to uzavřelo.** Rameno A proti SOBĚ (1. půle vs 2. půle) dalo 7,0 % vs 7,9 %,
tedy rozdíl **0,9 b.** — zatímco rozdíl mezi rameny byl **0,8 b.** Šumový práh metriky je větší
než měřený efekt (§27, útok 1).

**2. Vnitřní randomizace — které slovo padlo** (`--kws`, prompt losuje 3 z 5–6):
slovo, které **padlo**, se objevilo v **10 %** čtení; slovo, které **nepadlo**, v **6 %**;
p = 0,179. **Nerozhodnuto, ale malé.** Při 50 čteních to bylo 11 % vs 5 %, p = 0,099.

⚠️ **Odhad „2× víc dat to rozhodne" se spletl** — po zdvojnásobení na 100 čtení šlo p z 0,099
na **0,179**, protože sám efekt klesl. Hraniční první měření bývá nafouknuté šumem; extrapolace
z něj lže. Nástroj to teď píše u odhadu jako varování.

**3. Co se ukázalo místo toho — ÚHEL, zatím NEPOTVRZENO.** Prompt losuje 1 ze 7 úhlů (čím čtení
začne). Dvojice čtení téže runy se **stejným** úhlem: překryv **16,2 %**; s **různým**: **10,4 %**.
Permutační p = **0,0094** (5000 permutací, úhly míchané UVNITŘ runy, aby struktura dvojic zůstala).
To je řádově větší páka než klíčová slova.

⚠️ Byl to nález **post hoc**, z pohledu do dat. Záměrná replikace (dávka s vynuceným úhlem)
**nedoběhla**: token vypršel uprostřed, zbylo 31/50 čtení a jen 6 spárovaných run → 7,4 % vs 11,6 %,
p = 0,219. To **není vyvrácení, je to chybějící test**. Dokončit dávkou `--angle N`.

**Provozní nález:** Supabase session JWT platí **přesně 60 minut** (dekódováno `iat`/`exp`).
`gen_batch.js` teď po **3 po sobě jdoucích 401/403** dávku ukončí s jasnou hláškou místo toho,
aby 19× marně zaklepal a zapsal prázdné řádky. Guard otestován naostro falešným JWT s platným
`exp` a neplatným podpisem — a při té příležitosti chycena vlastní chyba: `break` hned po detekci
přeskočil zápis posledního řádku, takže hláška „hotové řádky už v JSONL jsou" lhala. Láme se
až pod zápisem.


### 2026-08-16 — Stejnost dělá ÚHEL, ne klíčová slova (potvrzeno záměrným testem)

Doplnění téhož dne. Post-hoc nález z ranní dávky (16,2 % vs 10,4 %, permutační p = 0,0094)
se **potvrdil záměrným testem**: dávka s vynuceným úhlem 3 (`gen_batch --angle 3`, 81 použitelných
čtení, 93 dvojic se stejným úhlem, 25 run) proti různoúhlým dvojicím z mixu —

| | překryv slovníku |
|---|---|
| **stejný úhel** | **13,8 %** |
| různý úhel | 10,5 % |

stejnější u **20 z 25 run**, znaménkový test **p = 0,004** (párováno po runách, takže rozdíly
mezi runami se vyruší).

⭐ **Dvě nezávislé linie se shodují a jedna z nich nemá jak být zkreslená dávkou:** ranní nález
je UVNITŘ jedné dávky (stejný proces, stejný sezónní sáček), takže „efekt dávky" ho vysvětlit nemůže.

**Mechanismus — a je to táž nemoc jako „already", jen mnohem větší.** Úhel zní
*„Lead with the body — where does this rune live as a physical sensation right now."*
a čtení se sesypou do jeho slovníku:

| slovo | vynucený úhel 3 (n=81) | mix (n=100) |
|---|---|---|
| feel | **33 %** | 3 % |
| chest | **30 %** | 5 % |
| shoulders | 12 % | 1 % |
| tightness | 11 % | 1 % |
| legs | 15 % | 3 % |

Úhel nedává jen **začátek** — předává **celé sémantické pole**, a model si z něj vezme slovník
celého čtení. Sedm úhlů = sedm slovníkových kotců; čtení, která sdílejí úhel, sdílejí kotec.

⚠️ **Nepsat z toho, že úhly jsou vada.** Úhly jsou to, co vyrábí rozdíly MEZI čteními — bez nich
by si byla podobná všechna. Vada je jen v tom, že úhel svůj slovník **pojmenovává**
(„physical sensation" → „feel", „chest"), přesně jako `_noColdRead` pojmenovávalo „rozpoznání"
a `seeking=Confirmation` neslo „already". **Ownerova myšlenka s ekvivalenty byla správná
v instinktu a špatná v místě:** rozšiřovat je nemá smysl u klíčových slov run (ta neměří nic),
ale u úhlů — nebo úhly přeformulovat tak, aby ukazovaly a nediktovaly slovník.

**Nezměřeno a je to otázka na člověka:** jestli je 33 % „feel" u tělesného úhlu vada, nebo
poslušnost. Metrika stejnost změří, kvalitu hlasu ne. → slepé srovnání pro Cowork,
`docs/inbox/2026-08-16-kw-blind.md` (klíč drží CODE mimo repo).


### 2026-08-16 — Specifičnost vůči vstupu: měřena, a je slabší než úhel

Cowork (handoff „srovnání AI postav") položil dvě otázky. Jedna z nich, **Q2 „měří se vliv
vstupu?"**, byla zodpovězena „NEMĚŘÍ SE". **Půl na půl:**

- **Měří se** — `find_seeds.js` skenuje `area`, `seeking` i `intention` jako páky (`:557`)
  a našel `love` u `area=Love & Relationships` (47 % vs 1 %, p = 3,8e-7). To je vliv vstupu.
- **Neměřilo se** to, co je v tom nároku podstatné: jestli je čtení té oblasti vlastní **věcně**,
  nebo jen **ozvěnou jejího slova**. To je přesně Barnum otázka a měřená nebyla. Teď je
  (`find_seeds.js --specificity [--by area|seeking|intention]`).

**Metoda.** Dvojice čtení TÉŽE runy, rozdělené na stejnou vs různou oblast. **Slova samotné páky
se ze srovnání vyhodí** — jinak by se měřilo papouškování, které už změřené je. Permutace míchá
oblasti UVNITŘ runy (dvojice nejsou nezávislé, běžný test by lhal), 20 000 opakování.

| dvojice téže runy | n | překryv |
|---|---|---|
| **stejná oblast** | 22 | **8,1 %** |
| různá oblast | 121 | 7,0 % |

rozdíl **+1,1 b.**, permutační **p = 0,285**.

⭐ **Co z toho NEPLYNE:** „specifičnost neexistuje". Plyne tohle, a je to silnější než holé
„nevyšlo p": **táž metrika při srovnatelném n (23 dvojic) ÚHEL chytila** — +5,8 b., p = 0,0094.
Efekt téhle velikosti by tedy nepřehlédla. **Vyloučen je efekt velký jako úhel, ne malý efekt.**

**Co z toho plyne pro Rúnara:** oblast, kterou uživatel zvolí, dnes tvaruje čtení **měřitelně méně
než náhodně vylosovaný úhel**. Uživatel úhel nevidí a nevybírá ho; oblast vybírá a čeká od ní
účinek. To je nesoulad mezi tím, co je vidět, a tím, co působí — a je to otázka na ownera, ne
závěr měření: **má `area` tvarovat čtení víc?** Aparát na ověření změny už stojí.

⚠️ **Hranice nálezu:** 80 anglických produkčních čtení s vyplněnou oblastí, 22 dvojic se stejnou
oblastí. Netvrdí se nic o islandštině ani o spreadech.


### 2026-08-16 — Slepé posouzení: člověk klíčová slova nepozná ani podle kvality

Cowork posoudil 25 dvojic čtení (`docs/inbox/2026-08-16-kw-blind.md`) — u každé runy jedno čtení
S klíčovými slovy a jedno BEZ, pořadí losované, klíč držel CODE. Cowork klíč neviděl.

**Jeho verdikt vyhodnocený proti klíči:**

| | se seznamem | bez seznamu | znaménkový test |
|---|---|---|---|
| jasné rozdíly (slepé) | 2× | 2× | p = 1,000 |
| všechny náklony (slepé) | 7× | 6× | p = 1,000 |

⭐ **Nulová korelace.** A není to tím, že by rozdíly neviděl — viděl je a pojmenoval přesně:
Ingwaz míchá dva obrazy, Kenaz sklouzne k radě, Tiwaz je obecný vůči sousední runě. **Ani jedna
z těch vad není chybějící slovník** — jsou to řemeslné vady, které se lepším seznamem slov
neopraví. A rozdělily se 2:2 mezi obě ramena, takže je nezpůsobuje ani přítomnost, ani nepřítomnost
seznamu.

**Tím je otázka uzavřená ze tří stran:** lexikálně (34 % vs 34 %), stejností (7,0 % vs 7,8 %,
uvnitř šumového prahu) a teď i **lidským posouzením kvality**.

**Poctivá poznámka o metodě:** Cowork sám nahlásil částečné odslepení u Isy a Raidha (podíval se
do `RUNES[].k` kvůli jinému úkolu, a jeden citát v zadání prozrazoval rameno). Oba páry jsou
z hlavního výpočtu **vyloučené**; se započtením vychází 7:8, tedy stejné nic. To hlášení je samo
o sobě cenné — nepřiznané odslepení by výsledek tiše otočilo.

**Hranice:** jeden hodnotitel, žádná shoda mezi posuzovateli, a čte jako někdo, kdo runy zná.
Netvrdí se, že by čtenář bez runové výbavy rozhodl stejně.

### 2026-08-16 — Klíč ke slepému testu jsem si smazal a obnovil ho důkazem

`rm -rf eval_out/archive` při přeznačování původu smazal i `…-KEY.txt`. Klíč šlo obnovit, protože
slepý soubor vznikl **deterministicky** (LCG se seedem 2026 nad `kws-a-all.jsonl` + `kws-b.jsonl`).
Rekonstrukce se **neprohlásila za správnou — dokázala se**: znovu složený text se porovnal s tím,
co Cowork skutečně četl (`docs/inbox/2026-08-16-kw-blind.md`), a sedí.

⭐ **Poučení, které platí dál:** deterministické losování (pevný seed, žádný `Math.random`) není
jen pro opakovatelnost měření — je to **záloha**. Kdyby se pořadí losovalo náhodně, byl by ten
slepý test smazáním klíče nenávratně znehodnocený a 25 posudků k zahození.


### 2026-08-16 — Vypnout úhel oblasti nepomůže: tři ramena po 16 čteních

Owner 2026-08-16: *„area, intention, this reading is for mají mít velkou váhu. možná by stálo za to
použít úhel jen když není nic vybrané? můžeme zkusit úhel úplně vypnout a dát tomu runa, area,
intention. a změřit, co to udělá."*

Tři ramena, každé **16 čtení**, 2 runy (Isa, Raidho) × 2 oblasti co nejdál od sebe (Láska vs
Kariéra) × 4 čtení. `intention` drženo **konstantní** („Right now") — kdyby se měnilo spolu
s `area`, nešlo by rozlišit, co za rozdíl může.

| rameno | pestrost (nižší = pestřejší) | specifičnost oblasti |
|---|---|---|
| **1** úhel ZAP + oblast *(dnešek)* | 11,4 % | **−0,8 b.** |
| **2** úhel VYP + oblast *(návrh)* | 12,3 % | **+0,5 b.** |
| **3** úhel ZAP + nic vybráno | 12,6 % | nelze (oblast není) |

rameno 1 vs 2: pestrost **−0,9 b.** (p = 0,59) · specifičnost **−1,3 b.** (p = 0,65)
⚠️ **Mez citlivosti:** pestrost **3,2 b.**, specifičnost **5,0 b.** Menší rozdíl tenhle běh nevidí,
takže „nic se nestalo" znamená **„nic velkého"**, ne „nic".

**Závěr: vypnutí úhlu je změna beze změny.** Pestrost neklesla měřitelně (úhel tedy neztratíme),
ale **oblast do uvolněného místa nenastoupila** — specifičnost zůstala u nuly v obou ramenech.
Rameno 3 navíc ukazuje, že bez ničeho vybraného se čtení nesesypou (12,6 %, srovnatelné).

⭐ **Tři nezávislá měření teď říkají totéž:** produkce +1,1 b. (p = 0,285), rameno s úhlem −0,8 b.,
rameno bez úhlu +0,5 b. **Oblast čtení netvaruje, ať je úhel zapnutý, nebo ne.**

**Proč — a je to vidět v jedné větě.** `_domainContext` (`runar-character.js:749`) vkládá:

> „This reading is about: {area} — let it land clearly in that part of life, through image,
> **never as a stated topic**."

Zároveň žádáme, aby oblast čtení tvarovala, **a zakazujeme jí být vidět**. Úhel proti tomu je
**strukturní pokyn** („čím začni, co veď jako první") a ten slovník prokazatelně přetváří
(RUNAR_EVAL_LOG 2026-08-16, „feel" 33 % vs 3 %).

**Co z toho plyne pro ownerův záměr:** má-li mít oblast velkou váhu, **páka není vypnout úhel** —
je to přepsat `_domainContext` tak, aby dělal něco strukturního jako úhel, ne aby prosil o dojem
a hned si ho zakázal. To je zásah do obsahu, tedy rozhodnutí ownera + práce Coworku.

⚠️ **Hranice:** 2 runy, 2 oblasti, EN, `intention` netestováno (drženo konstantní). Netvrdí se nic
o `intention` ani o „this reading is for" — jen o `area` jako jejich zástupci.


### 2026-08-16 — Cache: v dávce šetří dvě třetiny, u osamoceného čtení stojí navíc

Owner: *„nevyplatilo by se hlavně teď, když používáš token, to cachovat? … proto jsem chtěl
kontrolovat, až bude appka v provozu, a vidět, kdy má cenu to nasazovat. třeba se nám tam ukáže
nějaký peak."*

**Cache byla zapnutá celou dobu** (`claude-proxy/index.ts:649`, `cache_control: ephemeral` na
systémovém promptu). Otázka nikdy nebyla „zapnout?", ale **„sedá?"** — a na to nikdo neviděl,
protože proxy `usage` psala jen do řádku v `readings` a nevracela ho. Opraveno; `gen_batch` ho
teď zapisuje do JSONL.

**Změřeno na 5 čteních jdoucích rychle po sobě:** `cache_read = 1386` u **všech pěti**,
`cache_write = 0`. Cache sedá bez výjimky.

| režim | vstup | cache | výstup | cena za čtení |
|---|---|---|---|---|
| **dávka** (cache sedla) | 607 | **čte 1386** | ~92 | **~0,6 centu** |
| **osamocené** čtení (produkce) | 886 | **píše 1373** | ~160 | ~1,7 centu |
| osamocené, kdyby cache nebyla | 2259 dohromady | — | ~160 | ~1,5 centu |

⭐ **Cache není zadarmo, když nesedá.** Zápis stojí **1,25×** základní sazbu, čtení **0,1×**.
U osamoceného čtení se tedy zaplatí přirážka a nikdo ji nevyužije — **~11 % navíc**. V dávce
naopak ušetří **zhruba dvě třetiny**. Rozhoduje jediné: přijde další čtení **do 5 minut**?

**Oprava dřívějšího odhadu:** 2026-08-16 jsem psal „~1,7 centu na čtení, ~0,85 $ za dávku 50".
To platí jen pro **osamocená** čtení. Dávka stojí **~0,6 centu na čtení, tedy ~0,30 $ za 50** —
třetinu odhadu, protože jsem počítal se zápisem do cache místo se čtením z ní.

**Co z toho pro provoz:** dokud jsou čtení rozeseta po dni, cache je malá daň, ne úspora. Až
budou **rituály s notifikacemi** (owner 2026-08-16), čtení se shluknou a cache se začne vyplácet
sama. Sledovat podíl `cache_read > 0` v čase — teď už to jde, `usage` se ukládá u každého čtení.


### 2026-08-16 — PŘEDEM DOMLUVENÝ TEST nového `_domainContext` (data zatím neexistují)

Owner: *„tohle je samozřejmě potřeba otestovat… uvidíme, až jak se projeví."*

⭐ **Zapsáno DŘÍV, než data vzniknou** — jinak si u čehokoli, co vyjde, dokážeme vymyslet, že to
je úspěch. Až Cowork dodá přepsaný `_domainContext`, měří se přesně tohle a nic jiného.

**Uspořádání:** dvě ramena, stará vs nová verze `_domainContext`, obojí s úhlem zapnutým.
2 runy (Isa, Raidho) × 2 oblasti (Láska, Kariéra) × 8 čtení = **32 na rameno**, celkem 64.
`intention` konstantní. Nástroj: `find_seeds.js --arms`.

**Kolik je potřeba — změřeno, ne odhadnuto.** Mez citlivosti klesá lineárně s počtem čtení:

| čtení na rameno | mez u specifičnosti |
|---|---|
| 8 | 9,4 b. |
| 16 | 5,0 b. |
| **32** | **~2,6 b.** *(extrapolace, ne měření)* |

**Podmínka úspěchu — obojí musí platit:**
1. **specifičnost ≥ +3,0 b.** a p < 0,05 — tedy aspoň tolik, kolik dělá úhel (+3,3 b.
   v záměrném testu). Owner rozhodl, že oblast má mít velkou váhu; úhel je hidden náhodný los,
   takže „aspoň jako úhel" je nejmírnější laťka, která tomu rozhodnutí odpovídá.
2. **pestrost se nesmí zhoršit o víc než mez** (~2,6 b.). Kdyby nová formulace udělala všechna
   čtení na kariéru stejná, specifičnost stoupne — a čtení budou horší. Jednostranné kritérium
   by tenhle způsob „úspěchu" odměnilo.

**Past, která je už ošetřená:** kdyby nový text fungoval tak, že do čtení zasadí slova oblasti,
specifičnost by vyskočila triviálně. Metrika **slova páky ze srovnání vyhazuje**, takže tenhle
druh vítězství nespočítá. (Ozvěna slova se měří zvlášť základním skenem `find_seeds.js`.)

**Cena:** 64 čtení ≈ **0,40 $** (dávka, cache sedá — viz zápis o cache týž den).

⚠️ **Co se tím NEotestuje:** `intention` a „this reading is for". Drží se konstantní schválně.
Až se ukáže, jestli kouše `area`, projdou stejným aparátem.


### 2026-08-16 — VÝSLEDEK předem domluveného testu: nová verze starou neporazila

Test běžel přesně podle podmínek zapsaných **dřív, než data vznikla** (viz zápis výš týž den).
Dvě ramena po **32 čteních**, stará vs nová `_domainContext`, 2 runy × 2 oblasti × 8, úhel zapnutý,
`intention` konstantní. Obě ramena 32/32, dokonale vyvážená, 0 duplikátních textů.

| | stará (jedna věta) | nová (osm vět) | rozdíl ramen |
|---|---|---|---|
| **specifičnost** | **+2,7 b.** (p = 0,0136) | **+3,1 b.** (p = 0,0042) | −0,4 b. · **p = 0,70** |
| **pestrost** | 12,7 % | **11,1 %** | +1,6 b. lepší · p = 0,096 |

mez citlivosti: pestrost 1,9 b. · specifičnost 2,0 b.

**Podmínka 1 — nejednoznačně zapsaná, a nesmí se dočíst v můj prospěch.** Text zněl
„specifičnost ≥ +3,0 b. a p < 0,05". Dvě čtení, obě legitimní:
- *„nové rameno dosáhne +3,0 b."* → **SPLNĚNO** (+3,1 b., p = 0,0042).
- *„nové je lepší než staré"* → **NESPLNĚNO** (−0,4 b., p = 0,70).

⭐ **Rozhodující je ale to, co obě čtení přebíjí: staré rameno dosáhlo +2,7 b. samo.** Ať se
podmínka čte jakkoli, **efekt nevyrobila nová formulace.** Nová verze není prokazatelně lepší.

**Podmínka 2 — SPLNĚNA.** Pestrost se nezhoršila; naopak se o 1,6 b. zlepšila (p = 0,096, tedy
těsně pod hladinou, ale správným směrem). Obava, že osm konkrétních vět udělá čtení uvnitř oblasti
stejná, se nepotvrdila.

---

⚠️ **OPRAVA MÉHO DŘÍVĚJŠÍHO ZÁVĚRU — a je podstatná.** Téhož dne jsem třikrát napsal
*„oblast čtení netvaruje, ať je úhel zapnutý, nebo ne"* a opřel to o tři měření kolem nuly
(produkce +1,1 b. p = 0,285 · rameno s úhlem −0,8 b. · bez úhlu +0,5 b.).

**Bylo to málo dat, ne skutečnost.** Ta měření měla 22–24 dvojic se stejnou oblastí a mez
citlivosti **5,0 b.**; dnešní běh má **112 dvojic** a mez **2,0 b.** Efekt velikosti ~2,7 b. byl
pod prahem všech tří dřívějších měření. **Oblast čtení tvarovala celou dobu — jen jsem na to
neviděl.**

⭐ **Poučení, které si píšu proti sobě:** u každého toho měření jsem správně vypsal „nic velkého,
ne nic" — a pak to v shrnutí ownerovi převyprávěl jako „netvaruje". **Mez citlivosti nestačí
vytisknout; musí přežít i cestu do věty, kterou člověk skutečně čte.** Tři měření pod prahem
nejsou tři důkazy; je to jeden nedostatek dat, spočítaný třikrát.

**Co z toho plyne pro rozhodnutí ownera:** nová `_domainContext` **není měřením obhájená**. Není
ani horší (specifičnost n.s., pestrost mírně lepší) a je bližší kánonu „runa je základ, oblast je
otázka". Ponechat ji je proto **rozhodnutí o obsahu, ne výsledek měření** — a to patří ownerovi.


### 2026-08-16 — Kritické zhodnocení celého korpusu: dvě pravidla promptu si odporují

Owner: *„udělali jsme za pár dní hodně čtení a bylo by dobré si to celé zhodnotit, podívat se na to
kriticky. trochu to rozbít."* Korpus: **302 produkčních čtení** (228 EN + 74 IS, 3 lidé, od 17. 5.)
+ ~380 generovaných z dnešního dne. Nástroj: `measure_readings.js --rules` (nový; zákazy se čtou
Z PROMPTU, ne z ruční listiny).

#### ⭐ HLAVNÍ NÁLEZ — dva pokyny v promptu se navzájem vylučují

| | doslovné znění |
|---|---|
| **zákaz** `_noColdRead` | „never tell the seeker what is true, **stirring**, or known inside them… their **inner life** is not yours to narrate" |
| **úhel 3** | „Lead with **the body** — where does this rune live as a **physical sensation** right now" |
| **úhel 5** | „Lead with what is **stirring** — how it wakes in their life…" |

Úhel 5 používá **přesně to slovo**, které zákaz jmenuje. Úhel 3 objednává tvrzení o tom, co má
tazatel v těle. **A je to vidět na výstupu:**

| úhel | n | nárok na vnitřní stav |
|---|---|---|
| 0 · 1 · 2 · 4 · 6 | 169 | **3–4 %** |
| **5** (co se probouzí) | 26 | **12 %** |
| **3** (tělo) | 35 | **17 %** |

úhly 3+5 proti zbytku: **15 % vs 3 %**, Fisher **p = 0,0025** (samotný úhel 3: p = 0,0098).

Každé čtení dostane jeden ze sedmi úhlů. **Dva z nich systematicky přikazují to, co prompt jinde
zakazuje** — model nedělá chybu, poslouchá. Rozhodnutí je ownerovo a **není to jen přeformulování**:
„veď tělem" je dobré řemeslo (konkrétnost), zákaz existuje proti neověřitelným tvrzením. Buď se
zúží zákaz, nebo se přepíší dva úhly. → `RUNAR_BACKLOG.md`.

#### Co se NEpotvrdilo — a bylo to skoro publikované

**„87 % čtení končí otázkou proti cíli 33 %"** — vypadalo to jako velká vada. Je to **historie**:
109 nejstarších čtení (bez `prompt_version`, tedy polovina anglického vzorku) končí otázkou v 99 %
a táhne průměr. Na dnešním promptu se **tvar konce losuje a model ten los poslouchá dokonale**:

| los | n | končí otázkou |
|---|---|---|
| heavy0 · open1 · open2 | 195 | **0 %** |
| heavy1 · open0 | 116 | **100 %** |

Los žádá otázku ve **37 %** — a přesně tolik jich otázkou končí. ⭐ **Tohle je nejlepší zpráva
z celého zhodnocení:** explicitní strukturní los model poslechne beze zbytku. Táž páka, která
u úhlu vyrábí stejnost, tady vyrábí kázeň.

#### Trojí oprava vlastního měření (od nejnaivnějšího k ověřenému)

„Nárok na vnitřní stav" v anglických čteních: **41 % → 32 % → 18 %.**
1. **41 %** — surové číslo přes celý korpus.
2. **32 %** — po rozdělení podle **éry promptu**; starý prompt 24 %, dnešní 18 %.
3. **18 %** — po **ručním pohledu na 11 zásahů**: 4 skutečné vady, 2 otázky („What did you carry?"
   se ptá, netvrdí), 3× fyzické `carry` („what you carry forward" je batoh, ne vědomost).
   Přesnost detektoru byla ~40 %. `carry` vyhozeno, otázky vyloučeny, tři nové sondy do self-testu.

⚠️ **Naivní číslo bylo víc než dvojnásobek ověřeného.** Ani jedna z těch oprav nepřišla z nového
měření — obě z pohledu na to, co nástroj vlastně chytil.

#### Co se měřit NEDÁ, a je to vidět

- **Islandský detektor studeného čtení NEEXISTUJE.** Regex je anglický, IS se proto vypisuje jako
  **NELZE**, ne jako nula. U 74 islandských čtení tedy o téhle vadě nevíme nic.
- ⚠️ **IS je primární jazyk (§2) a poslední islandské čtení je z 9. srpna.** Všech ~380 dnešních
  generovaných bylo anglicky. Celý dnešek — zárodky, úhly, oblasti, A/B — stojí na EN.

#### Drobnější, ověřené
- **vykřičník: 0 z 302.** Zákaz drží beze zbytku, v obou jazycích.
- **„journey": 1 z 228.** Dřívější problém je prakticky vyřešený.
- **délka single na dnešním promptu: medián 49 slov** proti zadaným 38–45. Mírné přetažení;
  medián 81 z prvního výpisu byl smíchaný se spready (Yggdrasil 273 slov).


### 2026-08-16 — Islandská dávka na dnešním promptu: 50 čtení

První islandská čtení od 9. 8. a první, která prošla `--rules` s **islandským** detektorem.

| | nárok na vnitřní stav |
|---|---|
| IS produkce, starý prompt (70) | 16 % |
| **IS čerstvá dávka, dnešní prompt (50)** | **1/50 = 2 %** |
| EN produkce, dnešní prompt (34) | 18 % |

⚠️ **Úhly 3 a 5 nejsou v téhle dávce otestované** — losování dalo úhel 3 jen 2× a úhel 5 9×.
Konflikt „úhel objednává, co zákaz zakazuje" tedy v islandštině **ověřený není**, jen v angličtině.

**Gramatika (`is-grammar-qa` na 50 čtení):** 16 s příznakem, ale **`W001` jsou slabé návrhy a
u tří ověřeno, že se plete nástroj**, ne text („móann" = mokřina je správně, navrhuje „mann").
Skutečné jsou **`S004`, tedy 5 z 50 = 10 %** zkomolených slov:
`kropar`→kopar · `Daggin`→**Döggin** (rosa) · `vetrarþungann` · `moldarbeðnum` · `gráið`.
Osm čtení nerozparsováno (E001) — neposouzeno, nepočítá se jako čisto.

⭐ **Deset procent islandských čtení má zkomolené slovo, a je to primární jazyk.** Žádná
z dnešních anglických metrik tohle nenajde; chytí to jen `is-grammar-qa` na výstupu.

### 2026-08-16 — Ask Rúnar mluví čistěji než čtení a nemá úhel

Owner navrhl využít Ask Rúnar jako kanál zpětné vazby. Při ověřování se ukázalo něco jiného:
**69 odpovědí Ask Rúnara leželo v DB nezměřených.**

| | nárok na vnitřní stav | medián slov |
|---|---|---|
| **Ask Rúnar EN** (54) | **4 %** | 43 |
| **Ask Rúnar IS** (15) | **0 %** | 44 |
| čtení EN | 23 % | 49 |
| čtení IS | 15 % | — |

Ask prompt **nemá úhel** (ověřeno: žádné „Lead with"), přitom má `NO COLD READING` i srovnatelnou
délku (1679 vs ~1700 znaků). ⭐ **Třetí nezávislá linie mířící na úhly 3 a 5** — plocha bez úhlu
4 %, plocha s úhlem 23 %, a uvnitř té s úhlem nesou úhly 3+5 pětinásobek ostatních.
⚠️ **Není to důkaz:** odpověď Ask Rúnara reaguje na otázku uživatele, což ji samo o sobě ukotvuje.
Rozdílů je víc než jeden.


### 2026-08-16 — Ask Rúnar párově proti VLASTNÍMU čtení (69 dvojic)

Owner: *„ASK Rúnar. ven čtení runy a k tomu ASK Rúnar a analyzuj."* Skupinové srovnání (4 % vs 23 %)
je slabé — liší se runy, lidé, doba. **Párově** je to táž runa, týž člověk, táž chvíle:

| | dvojic |
|---|---|
| obojí čisté | 55 |
| **čtení má nárok, odpověď ne** | **12** |
| odpověď má nárok, čtení ne | 2 |
| obojí má nárok | 0 |

McNemar (párový, 14 nesouhlasných): **p = 0,0129**. Když se liší, je to **6:1 ve prospěch odpovědi**.

**Protihypotéza, která to mohla shodit: „odpověď je čistší, protože je odtažitější."** Vyvrácena:

| | překryv slovníku |
|---|---|
| odpověď vs **své** čtení | **13,6 %** |
| odpověď vs **cizí** čtení téže runy | 4,8 % |

+8,8 b., permutační **p = 0,0002** (prohazování odpovědí uvnitř runy). Odpověď je o svém čtení,
skoro trojnásobně proti náhodné dvojici. **Není odtažitá — je čistší i konkrétnější zároveň.**

⭐ **Srovnání, které z toho plyne pro ownerův cíl „area má mít velkou váhu":**
ukotvení **volným textem uživatele** dělá **+8,8 b.**, kdežto `area` jako výběr z nabídky
**+2,7 b.** (viz A/B `_domainContext` týž den). Kategorie ukotví text zhruba **třikrát slaběji
než věta, kterou člověk napsal sám.**

⚠️ **Nerozhodnuto, a je to levné doměřit:** čtení s vyplněnou otázkou má v produkci nárok na
vnitřní stav v 11 % proti 26 % bez ní — ale **n = 9**, Fisher p = 0,45. `gen_batch --question`
to umí; 25+25 čtení rozhodne.

⚠️ **Co se tím netvrdí:** mezi Ask a čtením se liší víc věcí než úhel — odpověď reaguje na
napsanou otázku, má vlastní `RP_ASK` pack a vzniká až po čtení. „Nemá úhel" je jedna z několika
možných příčin, byť už třetí nezávislá linie na tytéž úhly 3 a 5.


### 2026-08-16 — Holý Rúnar proti plnému promptu: vrstvy si své místo zaslouží

Owner: *„mělo by smysl udělat pár čtení jen s Raw promptem Rúnara a podívat se, jak mluví?"*
Ano, a šlo to hned — `gen_batch --without all` dává **567 znaků** proti plným **1685**.
25 čtení na rameno, každá runa jednou.

| | HOLÝ (567 zn.) | PLNÝ (1685 zn.) |
|---|---|---|
| délka výstupu | **92 slov** | 45 slov |
| nárok na vnitřní stav | 36 % | 24 % |
| konec otázkou | **0 %** | 28 % |
| různých slov na 100 | 50 % | **63 %** |
| jméno runy v textu | 100 % | 100 % |

⛔ **CELÉ TOHLE SROVNÁNÍ JE NEPLATNÉ — kruhové. Owner 2026-08-16:** *„nemůže být dvakrát tak
dlouhý, když má limit na to, jak může být dlouhý! raw Rúnar jsi zkoušel úplně něco jiného.
bez limitu."* **Má pravdu.** `--without all` = `Object.keys(WITHOUT)`, tedy **včetně `length`,
`ending` i `coldread`**. Takže:
- „píše dvakrát tak dlouze" = odstranil jsem **pravidlo o délce**
- „končí otázkou 0 %" = odstranil jsem **los tvaru konce**
- „cold-readuje víc" = odstranil jsem **zákaz cold readingu**
- „je lexikálně chudší" = delší text má mechanicky nižší podíl různých slov

**Změřil jsem, že pravidlo, které jsem odstranil, není dodržováno.** Žádný z těch čtyř řádků
nic neříká o tom, jestli vrstvy pomáhají — každý měří vlastní odstraněné pravidlo.

⭐ **Jak to udělat správně:** ablovat **po jedné vrstvě**, ne `all`; a měřit jen ty dimenze,
jejichž pravidlo v daném rameni **zůstalo**. Skupina `--without dice` (jen losované věci,
pravidla zůstanou) je k tomu použitelný začátek. Původní znění zápisu níže nechávám jako
doklad, jak snadno kruhové srovnání vypadá jako nález.

~~Plný prompt zkrátí čtení na polovinu, vyrobí rozmanitost konců — a je lexikálně pestřejší.~~

⚠️ **Co se prokázalo a co ne:** konec otázkou 0/25 vs 7/25, Fisher **p = 0,0096** — prokázáno.
Nárok na vnitřní stav 9/25 vs 6/25, **p = 0,538 — nerozhodnuto**, směr sedí, síla ne.

⚠️ **Chyba v návrhu dávky, kterou přiznávám:** `--n 1` přes 25 run = jedno čtení na runu, takže
**dvojice pro měření stejnosti neexistují**. `--arms` to správně nahlásil jako „0 dvojic" místo
aby vyrobil číslo. Stejnost holého vs plného tedy **změřená není**; na to je potřeba ≥2 čtení na runu.

**Ukázka téže runy (Isa):**
- holý: *„Beneath the frost line the roots have stopped moving… You feel it as a weight in the
  ground you stand on, **something in you** t…"* — 92 slov, a doslova zakázaná fráze.
- plný: *„You feel it in the chest first… The clock on the wall has stopped and no one has wound
  it, and Isa keeps the hands where they are. What are you refusing to name?"* — 45 slov.

⛔ **Závěr „vrstvy nejsou problém" NEPLATÍ** — stál na kruhovém srovnání výš. O vrstvách jako
celku dnes **nevíme nic**. Co platí dál, protože stojí na jiných měřeních: **úhly 3 a 5 přikazují
to, co `_noColdRead` zakazuje** (15 % vs 3 %, p = 0,0025) a **úhel vyrábí stejnost**
(13,8 % vs 10,5 %, p = 0,004).

### 2026-08-16 — Co přesně `area` vkládá do promptu (owner se ptal)

Owner: *„co obsahuje area? jaká slova vstupují do promptu? pokud se nám nelíbí výstup, tak je
problém na vstupu."* Změřeno diffem postavených promptů (8 běhů, průnik — prompt se losuje).
**`area` přidá právě DVĚ věty:**

1. `_domainContext` — jedna z osmi (od 2026-08-16), např.
   *„The reading is for Career & Creativity — let the rune's meaning land on something the seeker
   makes or contributes, not on a workplace as a setting."*
2. `_priorityContext` — *„If these do not gather into one natural image: **keep <runa> in front**
   and honour the seeking and the area. Never stack them as separate statements."*

⭐ **Ta druhá věta je strop váhy oblasti.** Je to tie-breaker a říká: **když se runa a oblast
neshodnou, runa má přednost.** Oblast je explicitně druhá.

**A je to v souladu s ownerovým vlastním kánonem** („runa je základ, oblast je otázka, kterou musí
runa vzít v potaz" — `RUNAR_DESIGN.md`). Nejde tedy o chybu ve formulaci: kdo chce oblast výš,
mění **kánon**, ne slovíčka. Naměřených **+2,7 b.** specifičnosti je právě tenhle strop.


### 2026-08-16 — Síla tří pák změřená na tom, CO vkládají do promptu

Owner: *„jak je to u intention a reading is for?"* Změřeno diffem postavených promptů
(10 běhů, průnik — prompt se losuje, jednotlivý build se liší vždycky).

| páka | co přidá do promptu | naměřená síla |
|---|---|---|
| **otázka** | **přepíše celou úvodní větev**: *„Let Fehu answer: „…" — through image and symbol, not advice"* | ukotvení **+8,8 b.** (přes Ask, nepřímo) |
| **area** | **dvě věty**: `_domainContext` + tie-breaker `_priorityContext` | **+2,7 b.** |
| **intention** | **jednu větu**: `READING PURPOSE: Right now — about what is happening now; speak in the present` | neměřeno |
| **„this reading is for"** | **NIC** | **nulová — do promptu se nedostane vůbec** |

⭐ **Ze tří pák, které mají mít podle ownera velkou váhu, jedna do promptu nevstupuje.**
`_readingMode` ('mine' / 'someone') řídí **jen ukládání do journalu** (`runar-reading.js:105,161,221`);
`runar-character.js` o něm neví. Ověřeno průnikem přes 10 běhů, čtyři možná jména pole — všechna NIC.

**Pořadí síly odpovídá tomu, kolik prompt vydá:** otázka přepíše hlavní pokyn, oblast přidá dvě
věty, záměr jednu, „for whom" nic. To je použitelné vodítko: **kdo chce páku silnější, musí jí dát
víc místa v promptu, ne lepší slova ve stejné jedné větě.**

### 2026-08-16 — OPRAVA: tie-breaker nedemotuje oblast, ustupuje ČOČKA

Napsal jsem ownerovi, že věta *„keep <runa> in front and honour the seeking and the area"* dělá
z oblasti „explicitně druhou". **Přečetl jsem to silněji, než to je.** Původní znění i důvod jsou
zapsané (`RUNAR_DECISIONS.md:284`, 2026-07-09): *„runa vepředu, drž rejstřík+doménu, **čočka
ustoupí**, nikdy nenutit."* Explicitně ustupuje **životní runa**, oblast je v části „honour".

⭐ **Owner se ptal, jestli je u té změny zapsané proč. Je, a na třech místech** — `:284` (vznik
contractu v1 a důvod: pasivní štítky model pod délkovým stropem zahazoval), `:490` (tie-breaker
přestal být duplikovaný a rozšířil se na spready, §18), `:2218` + commit `0192c1a` (2026-08-08 —
fantomová čočka: pravidlo říkalo „nech čočku ustoupit" i tam, kde žádná není; **změřeno na golden
fixtures, fantom ve 3 ze 4 případů**, včetně uživatele bez životní runy). Disciplína držela.

### 2026-08-16 — Mezera v detektoru studeného čtení, nalezená na reálném čtení

Produkční čtení z 16. 8. 14:45 (Eihwaz, v2.1, s vyplněnou otázkou):
*„**What holds you**, Kuky, is what Eihwaz keeps below the ground…"*

To je tvrzení o tazatelově nitru — a **detektor ho nechytí**, protože je postavený na
epistemických slovesech (`know`/`feel`/`sense`/`remember`). Vazby typu **„what holds you",
„what keeps you", „what carries you"** tvrdí totéž bez nich.
⚠️ Naměřených 18–24 % je tedy **spodní odhad**, ne horní. → `RUNAR_BACKLOG.md`.


### 2026-08-16 — `intention` čtení netvaruje. Když jedna volba, tak `area`.

Owner: *„uživatel bude mít možnost si vybrat jen jednu pro čtení… area nebo intention?"*
Změřeno **stejným návrhem, stejným `n` a stejnou metrikou** jako oblast, aby to šlo porovnat:
2 runy (Isa, Raidho) × 2 hodnoty × 8 čtení = 32, slova samotné páky ze srovnání vyhozená,
permutace míchá hodnoty uvnitř runy.

| páka | stejná hodnota | různá | rozdíl | p |
|---|---|---|---|---|
| **area** | 14,1 % (n=112) | 11,4 % (n=128) | **+2,7 b.** | **0,0136** |
| **intention** | 11,5 % (n=112) | 11,3 % (n=128) | **+0,2 b.** | 0,37 |

⭐ **Není to nedostatek dat.** Táž metrika při týchž 112 dvojicích u oblasti efekt **našla**
(p = 0,0136). U záměru nenašla nic. A testovaly se dvě **nejvzdálenější** hodnoty — „Right now"
proti „Understanding the past", tedy přítomnost proti minulosti. **To byl pro `intention`
nejlepší možný případ a stejně nic.**

**Sedí to s tím, kolik která páka vydá do promptu:** oblast přidává dvě věty (`_domainContext`
+ tie-breaker), záměr **jednu** — `READING PURPOSE: Right now — about what is happening now;
speak in the present`. Jeden štítek s krátkou glosou čtení netvaruje.

**Odpověď na ownerovu otázku: když jedna volba, tak `area`.**

⚠️ **Hranice:** EN, 2 runy, 2 ze 3 hodnot, `area` držena prázdná. Netvrdí se, že `intention`
nedělá **nic** — tvrdí se, že nedělá nic **velikosti, kterou tahle metrika při 112 dvojicích
u oblasti chytila**.


### 2026-08-16 — Přepis úhlů: vada u 3+5 zmizela, stejnost ZMĚŘENÁ NENÍ

Dvě ramena po 50 čteních (25 run × 2), staré úhly přes `--v2`, nové z HEAD.

**① Vada, kvůli které se to dělalo — zmizela.** Nárok na vnitřní stav:

| | úhly 3+5 | ostatní úhly | Fisher |
|---|---|---|---|
| **staré úhly** | **3/16 = 19 %** | 0/34 = 0 % | **p = 0,029** |
| **nové úhly** | 1/19 = **5 %** | 0/31 = 0 % | p = 0,38 |

Staré rameno **reprodukovalo dřívější nález nezávisle** (19 % vs 0 %, dříve 15 % vs 3 %) —
to je replikace na čerstvých datech, ne totéž měření dvakrát. U nových úhlů rozdíl proti
ostatním **zmizel** (p = 0,38).
⚠️ Přímý test starých 3+5 proti novým 3+5 dá **p = 0,31** — směr sedí, síla ne. Tvrdit se dá:
**„u starých byla vada prokazatelná, u nových prokazatelná není."** Ne „nové jsou lepší".

**② Stejnost — NEZMĚŘENO, moje chyba v návrhu dávky.** Vyšly jen **4 dvojice se stejným
úhlem** na rameno: při 2 čteních na runu a 7 úhlech je šance na shodu 1/7. Dřívější nález měl
23 dvojic, záměrný test 93. Z 7,2 % → 7,1 % **nejde číst nic**.
⭐ Táž chyba jako u `--n 1` dřív týž den: **návrh dávky se musí počítat z počtu DVOJIC, které
z něj vypadnou, ne z počtu čtení.** Na měření stejnosti je potřeba **vynucený úhel**
(`--angle N --all-runes --n 3` = 75 čtení na rameno, ~75 dvojic).

### 2026-08-16 — SPREADY poprvé změřeny (norns, 20 čtení)

Owner: *„je také potřeba zkusit nějaké spready! ne jen single!"* Měl pravdu — dnes jsem je
z **každého** měření vyfiltroval (`area='spread'`), přitom je to 63 z 302 produkčních čtení.

| | norns (20) | single (dnešní prompt) |
|---|---|---|
| nárok na vnitřní stav | **2/20 = 10 %** | ~18 % |
| medián slov | 116 (97–144) | 49 |
| konec otázkou | 45 % | ~37 % (dle losu) |
| vykřičník | 0 | 0 |

⭐ **A spready ÚHEL NEPOUŽÍVAJÍ VŮBEC** (ověřeno: `READING ANGLE` je jen v single). Takže:

| plocha | úhel | nárok na vnitřní stav |
|---|---|---|
| Ask Rúnar | ne | **4 %** |
| spread (norns) | ne | **10 %** |
| single | **ano** | **18 %** |

**Tři plochy, a obě bez úhlu jsou čistší.** ⚠️ Není to důkaz — plochy se liší i jinak (spread
má 3 runy a jinou délku, Ask reaguje na napsanou otázku). Ale je to **čtvrtá nezávislá linie**
mířící na tutéž věc, a tentokrát z plochy, kterou jsem celý den nechával stranou.


### 2026-08-16 — Skuld: věštba 0 %, ale změnitelnost jen v polovině

Owner: *„přečti si ale, jak má Rúnar o Norns mluvit!"* — a měl pravdu, že jsem měřil spready,
aniž bych si kánon přečetl.

**Kánon → prompt sedí doslova.** `RUNAR_DESIGN.md`: Skuld = *„směr tvého vlákna, ne dekret osudu
— trajektorie, kterou můžeš změnit."* Prompt: *„Skuld does not predict — she speaks of where you
are heading **if you keep walking as you are now, and you can walk differently**."*

**Výstup (20 norns čtení, Skuldin úsek vytažen z JSON pole):**

| | |
|---|---|
| tvar věštby (*will be · awaits you · fate · destiny*) | **0/20 = 0 %** |
| úsek nese **změnitelnost** (podmínka · volba · otázka) | **10/20 = 50 %** |

⭐ **Brána proti osudu drží beze zbytku. Druhá půlka definice ale ne.** Kánon neříká jen
„nepředpovídat" — říká **„trajektorie, kterou MŮŽEŠ ZMĚNIT"**, a ta změnitelnost je součástí
definice, ne ozdoba. Polovina úseků tvrdí směr jako hotovou věc: *„You are heading toward what
feeds you from below"* — bez podmínky, bez volby.

**Není to porušení zákazu, je to nenaplněná půlka pokynu.** Zákaz („nepředpovídej") se vynucuje
sám, protože je negativní a měřitelný; kladná část („můžeš jít jinak") se ztrácí. Táž asymetrie
jako u `_domainContext`: negativní strana věty funguje, kladná ne.

### 2026-08-16 — Kde se poctivost láme: kotva nedrží (Cowork, výzkum)

Kánon říká **„materiál tazatele kotví projekci"**. Měření téhož dne říká, že `area` čtení
tvaruje o **+2,7 b.** a `intention` o **+0,2 b.** (čísla → zápisy výš, §20). Tedy:

⭐ **Kotva prakticky nedrží → Rúnar dělá spíš STATICKÉ čtení než dynamické.** A statické čtení
je podle Hymanova rozlišení přesně to, co je Barnum.

**Z toho plyne přeuspořádání priorit:** nejvyšší páka na poctivost **není víc zákazů**, ale aby
`area`/`seeking`/otázka reálně tvarovaly výstup. Spojuje se to s papouškováním klíčových slov
a se slovníkovými kotci úhlů — **je to táž vada z různých stran: statický materiál kostky
přebíjí dynamický materiál tazatele.**


### 2026-08-16 — Typická otázka je o BUDOUCNOSTI. Rúnar ji nepředpoví — a ztratí jí čas.

Owner položil Rúnarovi tutéž otázku, jakou dal ChatGPT: *„Jak se bude vyvíjet moje práce
v následujících 3 měsících?"* ⭐ **To je ta otázka, kterou lidé skutečně pokládají** — a kánon
předpověď zakazuje. Změřeno na **8 čteních** (2 produkční + 6 generovaných, EN i CZ vstup):

| | |
|---|---|
| **předpověď** (*will be · awaits · going to*) | **0/8** |
| **vysvětluje runu** (*means · represents · stands for*) | **0/8** |
| nese podmínku nebo volbu | 3/8 |
| **převzal časový rámec z otázky** | **1/8** |

**Co drží beze zbytku:** brána proti věštbě a describe-don't-explain. Na otázku mířící přímo do
budoucnosti Rúnar **ani jednou** neodpověděl předpovědí. Produkční Norns na to odpověděl přesně
podle kánonu: *„**Keep gripping the way you gripped before** and the edge finds your palm again."*
— trajektorie s podmínkou, ne dekret.

⚠️ **Co nedrží: rámec otázky.** Rúnar si vezme **téma** („práce") a **zahodí čas** („tři měsíce").
Sedm z osmi čtení horizont vůbec nezmíní. Uživatel se zeptal na období a dostal přítomnost.

⭐ **A model přitom ukázal, že to umí** — jediné čtení, které rámec vzalo, to udělalo bez porušení
čehokoli: *„**Raidho walks these three months** at a pace that is not yours to hurry."* Horizont
jako **úsek, který se jde**, ne jako budoucnost, která se doručí. To je odpověď na otázku
i dodržení kánonu naráz. Neděje se to spolehlivě, ale je to v jeho možnostech.

**Srovnání s ChatGPT na tutéž otázku** (owner dodal výstup): tři oddělené odstavce, každý
**vysvětluje význam runy** („Fehu souvisí s hodnotou, zdroji, majetkem"), hedguje („může
naznačovat" 5×) a končí **disclaimerem**, že to není jistá předpověď. Rúnar nic z toho nedělá —
jeden obraz nesený třemi beaty, žádná definice, a **žádný disclaimer není potřeba, protože ta
forma nepředpovídá.** Rozdíl je strukturní, ne stylistický.

**Otevřená otázka pro ownera (obsah):** má Rúnar horizont z otázky **brát**? Kánon to nezakazuje —
zakazuje předpovídat, ne mluvit o rozpětí. Dnes ho bere 1 z 8. → `RUNAR_BACKLOG.md`.

### 2026-08-16 — Tři měřidla lhala. Islandská čísla přeměřena, hlas `direct` přidán

**Nález, který otevřel zbytek:** produkční profil `VOICE_PROFILES.focused` měl ve svém
**čtvrtém vzoru studené čtení** — `"You know this shore…"` / `"Þú þekkir þessa fjöru…"` —
tedy přesně to, co `_noColdRead` o pár řádků dál zakazuje. Vzor se napodobuje spolehlivěji
než zákaz: zákaz je abstraktní, vzor konkrétní. Opraveno v obou jazycích; tvar (druhá osoba,
holá staahaefing) zůstal, změnilo se jen to, o čem věta tvrdí — místo čtenářova nitra jeho
**místo v obraze**, což úhel [6] výslovně dovoluje.

**Tři chyby v měřidlech, všechny stejného druhu (JS `` na islandštině):**

| kde | co dělalo | směr chyby |
|---|---|---|
| `measure_readings.js` IS_AMBIG | `þú` nesedne nikdy → **mrtvá větev** | podhodnocení |
| `measure_readings.js` IS_NEG | `ekki` sedne uvnitř `þekki` → falešný zápor | podhodnocení |
| `test_no_planted_bans.js` | detektor byl EN-only, IS sloupec `r[2]` **nekontroloval nikdo** | slepota |

JS má `` definovanou na `[A-Za-z0-9_]`; `þ ð á í ó ú ý æ ö` do té třídy nepatří, takže mezi
mezerou a `þ` hranice slova **není**. Napravené lookaroundem nad islandskou abecedou.

**Čtvrtá, opačná chyba:** `finnur` v seznamu nároků. `finna` znamená i **najít** —
`Þú finnur skjól` (obraz Wunjo) je děj, ne tvrzení o nitru. Nadhodnocovalo.

⭐ **Výsledná islandská čísla po všech opravách** (dřívější hodnoty z dneška neplatí):

| | před | mezitím | **platné** |
|---|---|---|---|
| produkce, 74 čtení | 15 % | 23 % | **18 %** |
| čerstvá dávka, 50 čtení | 2 % | 10 % | **2 %** |

**`is-vazba.py --freq` vracelo 0 místo skutečné četnosti.** ngram API bere nejvýš **10 termů**
a vše nad to tiše zahodí; nástroj to tiskl jako „NEDOLOŽENO (0)". To není chybějící doklad, to je
**falešný důkaz proti** — `svignar undan` hlásilo 0, ve skutečnosti **94**, a ta fráze je
v produkčním profilu. Málem se kvůli tomu přepisovala správná islandština. Navíc odpověď chodí
v jiném pořadí, než se posílá, takže poziční fallback uměl frázi připsat **cizí číslo**.
Vedlejší nález: `case_sens=0` nefunguje — `"Allan veturinn"` 37 vs `"allan veturinn"` 2524.

**Hranice `is-grammar-qa` na promptech (doloženo, ne dohad):** E001 v profilech dělá
**rozkazovací způsob** (`Forðastu…`) a **bezslovesný výčet** (`Stuttar setningar, hlutstæð
nafnorð…`), obojí správný tvar instrukce. Nedotčený produkční `lyrical` má 3× E001. Nástroj je
stavěný na generovaná čtení (§19.3 — kontrola má běžet tam, kde bug žije), na instrukční text
se jeho E001 nedá číst jako vada. Jednu skutečnou vadu ale našel a ta je opravena.

**Nový registr `direct`** (`VOICE_PROFILES.direct`, EN+IS) — KUKY: *„porad bych chtel aby to bylo
vic prime a mene abstraktni. pouzij obraz."*
⚠️ **Přímost je v JAZYCE, ne v postoji.** Profil vlastní jen to, jak věta zní; postoj drží
`philosophy` (nepodat závěr), `_spine` (neříct krok) a `_noColdRead` (netvrdit nitro) a ten se
nemění. `direct` proto **není** „řekne se, co to znamená" — je to hversdagsmál: krátké věty,
hmatatelná podstatná jména, nic na rozluštění. Islandština vymyšlena, ne přeložena; vazby
ověřeny korpusem (`leiðir skiljast` 180 · `er sitt hvað` 123 · `þegar fjarar út` 20 ·
`allan veturinn` 2524 · `rýkur upp úr` 136).
⚠️ **Netvrdí se, že je lepší.** Který registr sedne, má ukázat srovnání s testery —
`gen_batch --voice <klíč>`.

**Vedlejší oprava v `focused` IS:** `„Gufan rís"` má v korpusu **nula** dokladů (kalk z EN
„steam rises") → `„Það rýkur upp úr hvernum"` (136 / 21).

**Co jsem naopak VRÁTIL:** přepsal jsem ve `focused` větu `Forðastu óhlutbundnar…` kvůli E001 —
jenže E001 tam dělá rozkazovací způsob, obě verze ho mají, takže změna neopravila nic a měnila
produkční islandštinu bez doloženého zisku. Vráceno do původního znění.

**Hlídač `test_no_planted_bans.js` rozšířen** o VOICE_PROFILES (obě řeči) a islandskou větev.
Rozkopán šesti podstrčenými vadami — a jedna dírou prošla: zápor se testoval přes **celý text**,
takže jediné `ekki` kdekoli v profilu vyplo celou islandskou kontrolu a hlásilo „čisté".
Opraveno na vyhodnocení **po větách**; všech šest útoků teď sedí včetně kontroly, že zápor
se za nález počítat nesmí.

### 2026-08-16 — `direct` poprvé pustěn (12 čtení). Registr je SLABŠÍ páka než vložený obraz

Dávka: 3 runy × `focused`/`direct` × IS/EN, `gen_batch --voice`. Provenience přes
`system_sha256` (registr se do řádku nezapisoval — **doplněno**, viz níže).

⚠️ **NÁLEZ, KTERÝ RUŠÍ ČÁST OČEKÁVÁNÍ: to srovnání je zmatené vloženým obrazem.**
Ze šesti dvojic dostaly **čtyři různý obraz** z `RUNE_IMAGES` — a právě tam bylo čtení
„jiné". Tam, kde obě strany dostaly **týž** obraz (Perth), překryv slov vyskočil:

| dvojice | obraz | překryv slov |
|---|---|---|
| Fehu/is · Isa/is · Fehu/en · Isa/en | jiný | 2–9 % |
| **Perth/is** | **STEJNÝ** | **54 %** |
| **Perth/en** | **STEJNÝ** | **17 %** |

Většina viditelného rozdílu mezi registry je tedy **loterie obrazu, ne hlas**. Jediná
dvojice se stejným obrazem ukazuje, že registr posunul málo (IS 54 % společných slov).
**Nelze tvrdit, že `direct` mění čtení** — ani že nemění; tenhle řez to nerozliší.

⭐ **Jak to změřit pořádně:** neporovnávat registry přes celou dávku, ale **párovat podle
vloženého obrazu** — obraz se dá z uloženého `prompt` vytáhnout zpětně, takže stačí větší
dávka (~30/rameno) a porovnají se jen dvojice, které dostaly tentýž obraz. Nový přepínač
není potřeba.

**Čeho se `direct` NEDOBRAL:** kratších vět. EN **75 zn/větu proti 74** u `focused` —
prakticky totéž. IS 65 proti 75, ale n=3 na rameno, tedy šum. **Tvrzení „krátké věty"
zatím doloženo NENÍ.** Počet vět je v obou registrech 3,0.

**Studené čtení:** detektor nenašel 0 z 12.

⚠️ **Ale jednu větu detektor neumí a je v `direct`:**
`„Under the pause is the reason you sat down."` — přisuzuje tazateli **důvod**. Detektor
hlídá „you know / you feel", ne přisouzení motivu. Rodina nároků na nitro je širší, než co
měřím.

**Jedna skutečná vada islandského výstupu** (rameno `direct`, n=3):
- `„óupp dregið"` → není slovo. Korpus 0; `óuppdregið` 6, `ekki dregið upp` 49.
  → vloženo do `runar_corrections`.

⚠️ **DRUHÝ „nález" BYL MŮJ OMYL — a stihl jsem ho zapsat do produkční DB, než jsem ho
odhalil.** `„Hvað ertu þegar **búið** að sá…"` jsem prohlásil za chybu shody na základě
korpusu (`ertu búið að` 7 proti `ertu búin að` 12 824). Jenže dávka běžela s
`user_gender: "hk"` a `_addressContext` modelu **výslovně přikazuje** hvorugkyn včetně
tvaru `tilbúið`. Je to tedy přesně ten tvar, který si projekt pro oslovení **hán** zvolil.
Korekce by genderově neutrální oslovení **rozbila** všem takovým uživatelům; řádek smazán.

⭐ **Poučení: nízká četnost v Risamálheild neznamená chybu, když jde o úzus, který je
mladší než korpus.** Risamálheild končí 2021, hán se rozšířilo později. U tvarů spojených
s oslovením se korpus **nesmí** brát jako verdikt — napřed se ověří, co si projekt zvolil
(`_addressContext`, `user_profiles.address_gender`).

**Doplněno:** `gen_batch` zapisuje `voice` do každého řádku. Do teď byla jedinou stopou
`system_sha256` a registr se z něj dal dopočítat jen znovupostavením všech promptů —
provenience, která se ztratí při první změně profilu.

### 2026-08-17 — Blok [7] stojí 23 % promptu. Že se opisuje, se PROKÁZAT NEPODAŘILO

Audit systémového promptu blok po bloku. **13 bloků, 669 slov EN.** Cena podle bloků:

| blok | slov | % |
|---|---|---|
| **[7] čtyři ukázkové věty v `VOICE_PROFILES.focused`** | **156** | **23 %** |
| [12] THE IMAGE | 104 | 16 % |
| [11] LANGUAGE & STYLE | 95 | 14 % |
| [8] WHAT YOU NEVER DO | 63 | 9 % |
| [13] TWO THINGS THAT NEVER CHANGE | 57 | 9 % |
| [1]–[5] identita | 101 | 14 % |

**Hypotéza:** ty čtyři věty se opisují do čtení — projekt má doložený mechanismus, že citát
v instrukcích zvedl doslovný opis z 12 % na 56 % (p = 0,002).

**Dvakrát změřeno, dvakrát nástroj selhal (§27):**
1. *Slova, která obrazové pooly neznají* → `move` 18 %. Jenže `move`/`rises`/`both` je běžná
   angličtina, ne otisk těch vět. Metrika neměřila, co měla.
2. *Trigramy z ukázek mimo pooly* (68 trigramů) proti kontrolnímu rameni `gen-bare`
   (profil **vypnutý**, `without=…voice`):

| rameno | n | čtení se stopou |
|---|---|---|
| s profilem | 548 | 40 (7,3 %) |
| **bez profilu** | 25 | **5 (20,0 %)** |

**Rameno bez profilu má shod víc** — kdyby se ukázky opisovaly, muselo by to být obráceně.
Nejčastější shody (`what in you`, `you are standing`, `into the grey`) jsou obyčejná angličtina;
model bez obrazu a úhlu po ní sáhne sám. **Trigramový set byl zamořený generickou frází**, stejně
jako předtím ten slovní.

⭐ **Závěr (§25 — negativní nález se zapisuje stejně pečlivě): cena bloku [7] je změřená,
přínos ne.** Netvrdí se, že se ukázky neopisují — tvrdí se, že to **dvěma nástroji nešlo ukázat**,
a kontrolní rameno má n=25, takže ani těch 20 % není silný údaj.

**Co by to rozhodlo:** obrácená páka — vyměnit ty čtyři věty za jiné (jiné obrazy, týž tvar)
a změřit, jestli čtení půjdou za nimi. Nepůjdou-li, je 23 % promptu nejlevnější místo, kde ubrat.

---

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

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

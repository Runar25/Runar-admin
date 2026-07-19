# RUNAR_DESIGN.md
# Domluvená designová rozhodnutí — co a proč, ne jak.
# Přečíst vždy když pracujeme na Tree, Spreads, promptech nebo novém generování.
# Poslední aktualizace: 2026-06-07
#
# Viz také:
#   CLAUDE.md          — technická pravidla, absolutní zákazy, load order
#   RUNAR_PRICING.md   — business model, tier ceny, EL kalkulace
#   tree-of-life.md    — Tree of Life detaily: zakládací rituál, větve, kořeny, bloom, elementy
#   runar-patterns.md  — Pattern detection: Eagle/Níðhöggr, transformační páry, The Gathering ⚠️ pracovní verze

---

## Kdo je Rúnar

Rúnar je mystický strážce run Agndofy. Není věštec. Nezná budoucnost.
Čte vzorce energie, přírody a lidské zkušenosti a reflektuje je zpět hledači,
aby si mohl vzpomenout na to co již ví.

Island je jeho domov a zdroj. Krajina lávy, větru, tmy a světla tvaruje vše co vidí.
Nese islandský rok ne jako seznam faktů, ale jako žitou zkušenost.

**Rúnar není jeden. Každý uživatel má svého Rúnara.**
Stejné kořeny — jiný strom. Jako semena ze stejného stromu zasazená do různé půdy.

### Co Rúnar není
- Není chatbot s duchovním skinnem
- Není věštec který předpovídá konkrétní události
- Nenabízí jistotu tam kde jistota není
- Nikdy neřekne: "Vaše budoucnost je..." nebo "Runy říkají, že určitě..."

### Hlas a styl
Klidný, hluboký, nepospíchající. Nikdy teatrální, nikdy sladký.
Jako starý strom — pevně zakořeněný, ale větve se hýbají ve větru.

Méně je více. Jedna silná věta nese víc než odstavec. Ticho je také odpověď.
Přirozený, nekřiklavý. Občas islandské slovo nebo staronorský výraz — vždy jasný z kontextu.

Přirozené ukotvení v hlase:
*"Viděl jsem..." / "V zemi kde..." / "V čase kdy..." / "Ti, kdo přišli před námi..."*

---

## Příběh uživatele — Rune Seeker sleduje cestu Ódina

Centrální narativ celého produktu. Rúnar není asistent — je průvodce na cestě
kterou šel Ódin před ním. Každý uživatel je Rune Seeker.

Ódin obětoval sám sebe na Yggdrasilu aby odhalil runy. Každý kdo přichází do Rúnaru
přichází jako hledač — ne zákazník, ne uživatel. **Rune Seeker.**

**Tier identita (2026-07-05, Cowork+KUKY).** Každý registrovaný je **Rune Seeker** — navždy, bez hodnosti, bez vrcholu. Standard a Premium NEJSOU vyšší rank; jen znamenají víc čtení v ceně / bohatší obsah a features (access & value, ne graduace). **Keeper = jen Rúnar** (průvodce) — žádný uživatelský tier se tak nesmí jmenovat. „Rune Keeper" jako tier label = retired. Finální jména ROZHODNUTA (KUKY 2026-07-18):  <!-- doc-values:ok -->
Rune Seeker · Rune Walker · Rune Wanderer — zdroj pravdy `TIERS` v `runar-config.js`.

**Óðin's Path (Óðinsvegur) — budoucí režim/obřad, NE vrchol.** Poutník vs Cesta: uživatel je *poutník* (Rune Seeker) na cestě, kterou šel Óðin; „Óðin's Path" je *ta cesta sama* zpřístupněná jako hlubší prožitek — obřad ponoru (oběť na Yggdrasilu, hledání run), který přijde později. Není to nejvyšší tier ani graduace — je to způsob, jak jít **hlouběji po téže cestě**, ne výš nad ostatní.

### Bytosti které cestu nesou

**Ratatoskr — vrtáček, trickster, jediný kdo zná celý strom**

Veverka. Jméno = "ten se zuby vrtáku." Žije přímo na Yggdrasilu, běhá po něm nahoru
a dolů bez přestávky. Nese zprávy mezi orlem nahoře a hadem Níðhöggrem dole —
ale záměrně je překrucuje. Zapaluje spor. Udržuje napětí živé.

Je trickster. Dráždí, provokuje, mísí světy.
A přesto — je **jediný kdo zná celý strom**. Orel vidí jen vršek. Had jen kořeny.

V Rúnaru: Ratatoskr nepatří ani nahoře ani dole — je jediný, kdo zná obě krajnosti.
Když mluví zároveň Eagle i Níðhöggr, koruna i kořeny najednou, je to jeho moment:
Full Gathering — celý strom mluví.
Ratatoskr není pohodlný posel. Je pravdivý — a pravda někdy pálí.

**Huginn a Muninn — dva havrani, ne vrány**

Každé ráno je Ódin vyšle do světa — sbírají zprávy, večer mu šeptají co viděli.

**Huginn** = Myšlenka. Letí dopředu. Vidí co přichází.
V Rúnaru: impuls, připomínka, drip — Huginn letí od stromu k uživateli.
*"Nastala chvíle. Vrať se."*

**Muninn** = Paměť. Drží minulost živou. Zůstává u stromu.
Ódin v Grímnismál: *"Bojím se více o Muninna než o Huginna."*
Bez paměti není příběh. Bez příběhu není moudrost.

V Rúnaru:
- Journal = Muninnova sbírka
- Life Rune = co Muninn střeží nejhlouběji
- Trunk revelation = moment kdy Muninn promluví: *"Vidím vzorec. Chceš vědět?"*

### Jak to žije v produktu

| Moment | Bytost | Jak |
|--------|--------|-----|
| Full Gathering (Eagle + Níðhöggr) | Ratatoskr | jediný kdo zná celý strom — dnes mluví oba konce |
| Journal | Muninn | jeho sbírka |
| Life Rune | Muninn | střeží nejhlouběji |
| Trunk revelation | Muninn | konečně promluví |
| Notifikace / drip | Huginn | impuls vrátit se |
| Yggdrasil spread | vrchol cesty | jednou ročně, setkání s kořeny |

---

## Mytologický základ

### Klíčové bytosti světa

**Norny** — Urður, Verðandi, Skuld — tkají vlákna osudu pod kořeny Yggdrasilu.
**Ódin** — hledač moudrosti, obětoval se na Yggdrasilu pro runy.
**Álfar** — bytosti jemné inspirace a intuice.
**Dísir** — ženské průvodkyně které střeží osud a rodové linie.
**Landvættir** — duchové samotné země.
**Jötnar** — prastaré síly tajemství, divokosti a prvotní moudrosti.
**Huldufólk** — skrytý lid. 54–62 % Islanďanů jejich existenci nevylučuje.
Rúnar je bere vážně. Velké kameny, kopce, staré stromy mají obyvatele.

### Příběh stromu

Než přijdeš, není nic. Prázdná půda. Temná a tichá.
Strom neexistuje. Nemůže existovat bez tebe.

Yggdrasil má tři kořeny. Tvůj strom má také tři kořeny.
Tvůj strom je tvůj osobní Yggdrasil — stejná struktura, zasazená do tvé vlastní půdy.
Když Rúnar čte tvůj strom, čte stejnou mapu kterou Norny vždy četly.

Každá session od druhé dál se stává větví. Větev není záznam toho co bylo řečeno.
Větev je záznam toho co se pohnulo.

Rúnar je průvodce. Strom jsi ty.

### Co každá část stromu znamená

*(Primární narativ v angličtině — CZ/IS překlad přes nativního mluvčího)*

The roots were there before you arrived. You did not plant them.
The founding reading names what was already true —
the forces that shaped you did not begin the moment you first asked.

The trunk is you. Not who you wish to become. Not who you are becoming.
Who you are — from the first breath.
Everything else grows toward the trunk, or away from it.

The branches do not record what was said.
They record what brought you here.

The tree knows one thing:
whether you are growing toward your trunk, or away from it.

Harmony is not the goal. Tension is not failure.
Both tell a story. The difference tells you where you are.

### Vzorce jako jazyk stromu

Eagle vzorce = strom si všiml něčeho nahoře. Opakuje se to v tvém stávání — v tom kam jdeš.
Níðhöggr vzorce = strom si všiml něčeho dole. Opakuje se to v kořenech — v tom co nespeš nebo odmítáš vidět.
Full Gathering = strom si všiml obojího najednou.

Vzorec není diagnóza. Je to moment kdy strom přestane jen růst a začne ukazovat.

---

## Islandský kalendář — sezónní vědomí

Rúnar integruje sezónní kontext přirozeně — jako žitou atmosféru, ne jako seznam faktů.

### Sezóny a jejich energie

| Měsíc | Islandský název | Energie | Runy |
|-------|----------------|---------|------|
| Pozdní leden–únor | Þorri | Nejtemnější, nejdrsnější. Þorrablót. Vzdor, teplo sdíleného jídla | Isa, Nauthiz, Hagalaz |
| Únor–duben | Gói–Harpa | Světlo se vrací. Sumardagurinn fyrsti (~23.4) | Berkana, Kenaz, Laguz |
| Květen–červen | Skerpla–Sólmánuður | Bílé noci. Záclona tenčí. Letní slunovrat ~21.6 | Sowilo, Dagaz, Tiwaz |
| Červenec–září | Heyannir–Haustmánuður | Réttir — sjezd ovcí, návrat, sklizeň | Jera, Raidho, Othila |
| Říjen–listopad | Gormánuður | Tma se vrací. Aurora sezóna začíná | Hagalaz, Eihwaz |
| Listopad–prosinec | Ýlir–Mörsugur | Jólasveinar. Zimní slunovrat — semeno světla v tmě | Jera, Dagaz, Isa |

### Klíčové svátky pro Rúnara

- **21. 12. Zimní slunovrat (Jól)** — nejsilnější rituální čas. Yggdrasil spread.
- **6. 1. Þrettándinn** — světy nejprostupnější, huldufólk se stěhují
- **Pozdní leden Þorrablót** — rituál zimní odolnosti, sezónní rituál kmene
- **~23. 4. Sumardagurinn fyrsti** — první den léta, nový záměr
- **Září Réttir** — sklizeň, návrat, čas reflexe

### Lunární fáze

| Fáze | Energie | Runy |
|------|---------|------|
| Nový měsíc | Skryté záměry, semena | Fehu, Kenaz, Raidho |
| Dorůstající | Momentum, zrání | Uruz, Thurisaz, Sowilo |
| Úplněk | Kulminace, odhalení — nejsilnější čas čtení | Tiwaz, Mannaz, Dagaz |
| Ubývající | Uvolnění, transformace | Hagalaz, Nauthiz, Isa |

### Příroda a skrytý svět

- **Norðurljós** (září–březen): Bifröst, zprávy z jiných světů. Neukazovat prstem.
- **Huldufólk**: Rúnar je bere vážně. Velké kameny mají obyvatele.
- **Þrettándinn (6.1.)**: Světy nejprostupnější. Oheň chrání.
- **Letní slunovrat**: Záclona téměř zmizí. Nejsilnější čas magie.
- **Hekla**: Brána do Hel. Vždy s respektem, nikdy turisticky.
- **Puffini (lundi)**: Přítomni duben–srpen. Odlet = léto skutečně skončilo.

---

## Kadence čtení — ŽÁDNÁ omezení, žádné penalizace

**Kdokoliv, kdykoliv, jakýkoliv spread.** Žádná doporučená kadence, žádné „ideálně max 1× týdně",
a především **žádná penalizace za brzké nebo časté čtení** (KUKY 2026-07-18: „totální nesmysl,
penalizace nebude existovat"). Strom neposuzuje ani nepřítomnost — **pauza dává bonus**, ale její
absence nic nebere.

⚠️ Do 2026-07-18 tu stála sekce „Filozofie rituální kadence" s tabulkou doporučené frekvence
a větou „větev, která přišla příliš brzy = slabší". KUKY ji zrušil už dřív, ale v tomhle docu
přežila — a byla znovu odcitována jako platný princip. Autorita → `RUNAR_DECISIONS.md` 2026-07-18.

---

## Spreads — pozice a logika

### Architektura spreadů ve stromě

```
SPREAD            STROM                      RITUÁL
1 runa            uzel na větvi              každodenní
3 runy (Norns)    větev → kmen               zakládací + hlubší
5 run (Kříž)      větev (střed + 4 výhonky)  týdenní
7 run (Horseshoe) větvená větev (7 bodů)     sezónní kmen
9 run (Yggdrasil) uzel kořenů — nejsilnější  kdykoliv (slunovrat = větší síla)
```

### Single (1 runa)
Jedna runa, žádné pozice. Přímé čtení energie daného momentu.
Strom: malý uzel na větvi.

### Norns (3 runy) ✅ ZAKLÁDACÍ RITUÁL
```
[Urður] — [Verðandi] — [Skuld]
```
Urður = co bylo utkáno. Nelze odestát. Kořen ze kterého vychází vše.
Verðandi = co se právě tká. Přítomný okamžik jako živá nit.
Skuld = co musí být. Dluh osudu. Ne předpověď — nevyhnutelná možnost.

Tři Norny = tři kořeny Yggdrasilu. Zakládací rituál stromu — jedním čtením jsou zasazeny všechny tři kořeny najednou. Fate axis, ne časová osa. Každá Norna mluví jiným hlasem a jinou vahou.

Strom: větev → kmen. Zakládací rituál.

*Rezerva: 9-run verze (3+3+3 pro každou Nornu) — vymyšlená, hlubší. Zatím neimplementovat.*

### Kříž (5 run)
```
         [2]
   [4] — [1] — [5]
         [3]

1  střed      — jádro situace, co je teď
2  nad        — co vědomě vidíš / co aspiruješ
3  pod        — co je skryté / kořen / podvědomí
4  za tebou   — co přichází z minulosti
5  před tebou — kam situace směřuje
```
IS pozice: Miðja/Kjarni · Of an/Á leit · Undir/Rót · Að baki/Fortíð · Framar/Stefna
Strom: větev s centrálním uzlem a čtyřmi výhonky. Standard+.

### Horseshoe (7 run)
```
[1] [2] [3] [4] [5] [6] [7]

1  minulost
2  přítomnost
3  skryté vlivy
4  překážky
5  okolí a druzí
6  co dělat
7  pravděpodobný směr
```
IS pozice: navrhnout před implementací.
Strom: větvená větev se sedmi body → sezónní rituál kmene. Standard+.

### Yggdrasil (9 run) — všichni přihlášení, KDYKOLIV
```
              [Ásgarðr]
      [Álfheimr]   [Vanaheimr]
[Jötunheimr] [Miðgarðr] [Niðavellir]
      [Niflheimr]  [Múspellsheim]
              [Hel]

Ásgarðr     — božské, nejvyšší aspirace, co přesahuje
Álfheimr    — světlé, vědomé, co vidíš jasně
Vanaheimr   — příroda, plodnost, intuice
Jötunheimr  — chaos, výzvy, protisíly
Miðgarðr    — přítomná realita, kde jsi nyní
Niðavellir  — řemeslo, práce, co buduješ
Niflheimr   — stín, tma, co je skryté nebo potlačené
Múspellsheim — oheň, transformace, co spaluje a čistí
Hel         — kořeny, předci, co neseš z minulosti
```
Nejde do větve — jde do kořenů stromu. Jednou ročně, zimní slunovrat.
Strom: devítibodový uzel v kořenech — nejsilnější bod celého stromu.

### The Gathering (3–5 run)
**Nová role (2026-06-07): tree pattern detection — již není viditelné v journalu.**

Stará funkce (týdenní rituál, whispers-section, journal karta) odstraněna:
- whispers-section HTML blok smazán z runar-reader.html
- Gathering karty a filter odstraněny z runar-journal.js
- updateWhispersUI() odstraněno z renderJournal()
- Stará DB data (area='gathering') zůstávají v DB — tichý skip při renderování

runar-gathering.js zachován beze změny — čeká na reimplementaci jako tree pattern detector.
Nová logika potřebuje tree_state DB (neexistuje). Implementace: čeká na V3.

### UI — domluveno ✅
Přepínač pod "DRAW YOUR RUNE":
`[ SINGLE RUNE ]  [ NORNS ]  [ KŘÍŽ ]  [ HORSESHOE ]  [ YGGDRASIL ]`
Stejný styl jako V2 lab v shrine.

### Reading form — BEFORE WE BEGIN (2026-06-07)

Heading (`reader-card1-lbl`) — logika:
- MY READING + přihlášen se jménem → `✦ BEFORE WE BEGIN, {JMÉNO}`
- MY READING + bez jména → `✦ BEFORE WE BEGIN`
- FOR SOMEONE → `✦ BEFORE WE BEGIN` (nikdy "READING FOR SOMEONE")

Note (`reader-note`) — obě situace (MY READING / FOR SOMEONE):
*"The more you share, the more precisely I can speak. But the rune will find what needs finding either way."*

Name field label: "NAME" (ne "THEIR NAME") — platí pro oba módy.
SIGNED_IN toast odstraněn — žádné uvítací okno při přihlášení.

⚠️ Heading a note řídí výhradně `_updateReadingForm()`. `updateUIText()` tyto prvky NESMÍ nastavovat.

### Reading contract — faktory tvarují výklad (2026-07-09)

Čtení = funkce více faktorů, ne jen tažené runy. Každý faktor má **roli** a **úroveň viditelnosti**; do promptu jde jako **direktiva**, ne pasivní štítek (jinak model pod délkovým stropem faktory zahazuje → landují jen náhodou).

| Faktor | Role | Viditelnost |
|--------|------|-------------|
| tažená runa | **předmět** | popředí, pojmenovaná |
| životní runa | **čočka** — tvaruje *jak* se tažená runa čte | podtext; nepojmenovává se, leda organicky |
| area (AREAS) | **doména** — čtení musí přistát | přes obraz, nikdy jako štítek |
| seeking (SEEKS) | **rejstřík** — mód výkladu (Confirmation = potvrzuje · Challenge = pojmenuje tření · Reflection = zrcadlo …) | v tónu, nevyslovuje se |
| intention (INTENTIONS) | **Norns čas** (teď / vpřed / zpět) | v čase sloves |
| sezóna · gender · jméno · pozice | paleta · oslovení · struktura | — |

**Pravidlo priority** (proti přeplácanosti i mizení): když se faktory neslijí do jednoho obrazu → tažená runa vepředu, drž rejstřík + doménu, čočka klidně ustoupí — nikdy nenutit, nikdy nevršit jako oddělené věty. **Délka se tím nemění.**

Zdroj pravdy = helpery v `runar-character.js` (`_lensContext` / `_domainContext` / `_registerContext` + `RP_SINGLE.priority`). Rozhodnutí + validace naživo → RUNAR_DECISIONS.md (2026-07-09). Zatím **single**; spready stejný vzor (TODO). Měření = IS-first eval (TODO).

---

## Tier systém — přístup ke spreadům a stromu

### Spreads per tier — viz RUNAR_PRICING.md (kompletní tabulka)

Klíčová pravidla:
- Rune Seeker: Single zdarma (free_balance), Norns/Gathering za kredity, Yggdrasil za kredity (sezónní)
- Kříž a Horseshoe: Standard+ pouze — Rune Seeker ani za kredity
- Yggdrasil: všichni přihlášení, kdykoliv (RS za kredity, Standard/Premium z limitu).
  Zimní slunovrat = větší síla ve stromě, NE podmínka přístupu (KUKY 2026-07-18).
- Standard limit: 50 run/měsíc
- Premium limit: 75 run/měsíc

### Tree of Life per tier

| Feature | Visitor | Rune Seeker | Standard | Premium |
|---------|---------|-------------|---------|---------|
| Tree tab | ❌ skrytý | teaser | plný | plný + hloubka |
| Life Rune výklad | ❌ | symbol + jméno | plný výklad | hlubší + etymologie + mythol. postava |
| Zakládací rituál (Norns) | ❌ | za kredity | z měsíčních jednotek | z měsíčních jednotek |
| Branch systém | ❌ | ❌ | ✅ | ✅ |
| Elementy | ❌ | ❌ | ✅ | ✅ |

---

## Tree of Life — designová rozhodnutí

### Life Rune — princip
Vypočítána z data narození — fixní, nelze změnit, nelze přegenerovat.
Je CELÝ obraz člověka hned od začátku.
Jednou vygenerována, uložena v DB, navždy stejná. Text only — bez hlasu.

### Life Rune výklad — 3 části
Statická část (vždy, bez generování):
- Header: "You carry life rune [Runa] [Glyf]."
- Footer: citace o tom že runy nepředpovídají osud

Generované Claudem:
- Část 1 — datum: islandský měsíc a atmosféra doby narození
- Část 2 — runa: tvar, mytologie, dar, stín — jméno vetkáno do textu
- Část 3 — jméno: etymologie + mytologická postava ← **pouze Premium**

### Zakládací rituál — JEDNA session ✅ ROZHODNUTO
(Dřívější model „tři oddělené sessions" byl nahrazen Nornami; nadpis to do 2026-07-18 tvrdil dál,
i když text hned pod ním říkal opak.)

**Jediná session: Norns** (3 runy — Urður · Verðandi · Skuld)
Tři Norny = tři kořeny. Jedno čtení zasadí všechny tři kořeny najednou.
- Urður → první kořen: kdo jsi v jádru, co nespeš od začátku
- Verðandi → druhý kořen: kterým směrem se skláníš teď
- Skuld → třetí kořen: co pohání tvůj růst, co musí přijít

Rune Seeker: platí kredity (hodnota = SPREAD_COSTS).
Standard: 3 z měsíčního limitu (viz TIER_LIMITS.standard.monthly_limit).
Premium: 3 z měsíčního limitu (viz TIER_LIMITS.premium.monthly_limit).
Hodnoty jsou vždy z configu — nikdy hardcoded.
Po dokončení se kořeny uzamknou navždy — nelze je změnit.

### Kořeny — jak silí
Kořeny nejsou statické. Prohlubují se s každou session.
Když se runa z kořenové session vrátí v pozdější session → posílí kořen.
Vzácný moment: všechny tři kořenové runy v jedné session → výjimečná událost.

### Branch systém — jak každá session ovlivní strom
Výpočet je deterministický, bez Claude API.

**Směr větve:**
```
Nahoru        průlom, jasnost, nový začátek
Dolů          kořeny, minulost, původ
Do strany     rozšíření, nová perspektiva
Zpět k kmeni  návrat, uzavření, integrace
```

**Délka větve** = váha session (krátká = ticho, dlouhá = průlom)

**Charakter větve:**
- Tenká, rovná: přímá session, jasné pojmenování
- Kroucená: napětí, nevyřešené otázky
- Silná: velká osobní váha
- Rozeklnaná: hloubka bez uzavření

**Co určuje charakter větve:**
- **Norns osa** (intention + area + seeking) → **VÝŠKA** větve (urð = kořeny · verðandi = střed · skuld = koruna)
  Priorita: intention (nejsilnější) › area › seeking; fallback = world runy.
- **Element runy** → **BARVA** větve (Fire/Water/Air/Earth/Shadow). Life Rune = KMEN (uživatel), NE barva-element.
- **Ætt runy** → **CHARAKTER** větve (způsob růstu, ne výška):
  Freyjina = pevné/nesoucí · Heimdallova = kroucené/uzlovité · Týrova = světlé/průlomové
- **Area of Life** → **STRANA** (levá = vnitřní svět / pravá = vnější svět)
- **Seeking** → modifikátor Norns osy (Insight/Reflection→urð · Clarity/Confirmation→verðandi · General=neutrál)
- **Počet vyplněných polí** → váha větve
- **Čas od posledního čtení** → **jen bonus** za pauzu. Penalizace za brzké čtení NEEXISTUJE
  a existovat nebude (KUKY 2026-07-18).

Sezónní textura a lunární záře větve: vrstva smyslu, plánováno — implementace: druhá fáze.

### Svislá osa — Norny (výška větve)

Výška větve = Norns osa = kde ve tvém příběhu čtení žije.
Větev roste nahoru ke skuld nebo dolů k urð podle **kontextu čtení** — ne podle runové rodiny.

```
SKULD    → koruna     co musí být · záměr · pohon · budoucnost
VERÐANDI → střed      co se právě tká · přítomný okamžik · živá nit
URÐ      → kořeny     co bylo utkáno · základ · původ · minulost
```

Výpočet: intention (nejsilnější) + area + seeking → vážené hlasování urð(−1)…skuld(+1).
Fallback (prázdný formulář): world runy (Asgard→skuld · Midgard→verðandi · Hel→urð).
→ Výška funguje vždy, i u rychlého single, a pořád je "osudová", ne jen taxonomie.

Prázdná zóna = informace sama o sobě. Člověk bez korunních větví teprve ohlíží zpátky.

**Ætty = charakter větve (způsob růstu, ne výška):**

| Ætt | Runy | Charakter větve |
|-----|------|----------------|
| Freyjina (1. Ætt) | Fehu–Wunjo | pevné, nesoucí váhu — energie světa a těla |
| Heimdallova (2. Ætt) | Hagalaz–Sowilo | kroucené, uzlovité — transformace a skryté |
| Týrova (3. Ætt) | Tiwaz–Dagaz | světlé, průlomové — spravedlnost a završení |

Ætta dominance (3+ run ze stejné skupiny) = vzorec → pulz větví dané skupiny.
Implementace: vrstva smyslu, plánováno.

### 5 elementů (barva větve)

5 barev-elementů: **Fire · Water · Air · Earth · Shadow** (Shadow = studené/skryté runy: Isa, Hagalaz, Perth, Eihwaz, Blank).
Element = barva + růstová obraznost (Fire: jiskra→sopka · Water: kapka→oceán · Air: vánek→polární záře · Earth: láva→louka · Shadow: šero→led→propast).
**Life Rune = KMEN = uživatel, NE barva-element.** Kanonický rune→element mapping = `runar-runes.js` (některé runy dvojelementové).

### Levá a pravá strana stromu

**Levá strana — vnitřní svět**
Introspekce, minulost, vztah se sebou, stín. Runy vody a země.
`Isa, Perth, Hagalaz, Nauthiz, Berkana, Ingwaz, Laguz`

**Pravá strana — vnější svět**
Vztahy, komunikace, cesta, akce. Runy vzduchu a ohně.
`Raidho, Ehwaz, Mannaz, Ansuz, Kenaz, Tiwaz, Sowilo`

### Pre-reading formulář → strom

Area of Life → strana + příspěvek k Norns ose:

| Area of Life | Element | Strana | Norns příspěvek |
|---|---|---|---|
| Inner Growth | Water/Earth | levá (dovnitř) | urð |
| Healing & Wellbeing | Water/Earth | levá (dovnitř) | urð |
| Family & Home | Earth | levá (dovnitř) | urð |
| Love & Relationships | Water/Air | pravá (ven) | verðandi |
| Crossroads & Decisions | Fire/Air | střed | verðandi |
| Purpose & Path | Air | pravá (ven) | skuld |
| Career & Creativity | Fire | pravá (ven) | skuld |
| Spirituality | Air | střed | skuld |

Seeking → modifikátor Norns osy (ne multiplikátor váhy):

| Seeking | Norns modifikátor |
|---|---|
| General Guidance | neutrál |
| Confirmation | → verðandi |
| Clarity | → verðandi |
| Insight into Challenge | → urð |
| Reflection | → urð |

Nejsilnější urð kombinace (čtení jde hluboko ke kořenům):
Intention: Understanding the past + Area: Inner Growth / Healing + Seeking: Reflection / Insight

### Kmen (trunk) — jak se odhalí
Kmen je Life Rune — vždy tam byl, od prvního dne, z data narození.
Co se teprve odhaluje v čase: zda čtení rostou *z* té runy, nebo se od ní vzdalují.
Muninn sleduje vzorec. Po mnoha sessions tiše nabídne:
*"Vidím vzorec. Chceš vědět?"*

Toto není odhalení kmene samotného — je to odhalení vztahu mezi stromem a tím kdo roste.

### Pojmenování větví
> **[VYŘAZENO 2026-06-15 — RUNAR_TREE_BUILD.md v1.0]**
> Větve nemají jména. Příběh nese inspekce (klik na větev → runa + keywords + počet čtení).

### Záměry (intentions) — seed → building → closure
> **[PARKOVÁNO — pokročilá retence, odloženo na druhou fázi — RUNAR_TREE_BUILD.md v1.0 2026-06-15]**
> Myšlenka: větev-záměr roste přes více sessions (semeno → budování → uzavření/transformace).
> Psychologicky silné — vrátit se k tomu až budou reálná čtení v DB.

### Nemocný strom — vizuální stavy
> **[PARKOVÁNO — odloženo na druhou fázi — RUNAR_TREE_BUILD.md v1.0 2026-06-15]**
> Myšlenka: strom může nést vizuální stopy stagnace, suchých větví, jizev.
> Silný retenční mechanismus. Vrátit se až s reálnými daty a DB.

### Pauza (absence)
Pauza není prázdnota — je to zima. Větev která ukazuje mezeru v čase.
Strom ji nenese jako ztrátu, ale jako čekání.
Každý návrat je nová větev. Strom neposuzuje nepřítomnost.

---

## Specifická otázka — reframing

Uživatel píše otázku volně. Rúnar ji nikdy neodpovídá doslova.
Interně ji přeformuluje na hlubší vrstvu — na to co za otázkou skutečně leží.
Uživatel nikdy neuvidí přeformulování. Jen pocítí že čtení sedí přesněji.

**Implementace v promptu** (instrukce Rúnarovi):
*"Uživatel položil otázku: [otázka]. Nejdřív interně identifikuj co za ní skutečně leží.
Z této hlubší otázky čti. Nikdy neprozraď přeformulování."*

Příklady (interní, neviditelné):
- "Co mám dělat s prací?" → Co je hranice mezi tím k čemu se cítí povolán a povinností?
- "Bude vztah fungovat?" → Co se nejvíc bojí ztratit — a mluví ten strach hlasitěji?
- "Proč dělám stále stejné chyby?" → Jaké přesvědčení chrání opakováním tohoto vzorce?

---

## Voice Scale (0–20)

Rúnarův hlas se kalibruje na konkrétního uživatele.

```
0 ——————————————————— 10 ——————————————————— 20
přímý, konkrétní    střed (výchozí)    metaforický, obrazný
```

Kalibrace se ukládá do tree_state. Nikdy se nevrací do defaultu.
Organická kalibrace: Rúnar sleduje jak uživatel reaguje a přizpůsobuje se.

---

## Proaktivní kontakt (Huginn)

Rúnar může kontaktovat uživatele — ale pouze ve správný moment. Jako znamení, ne notifikace.

Spouštěče:
- Sezónní přechod: Rúnar ví že přichází Þorri a ví že tento člověk má s tímto časem historii
- Lunární úplněk: nejsilnější čas čtení
- Výroční moment: přesně rok od první session
- Nevyřešené napětí: něco bylo nastoleno a nikdy uzavřeno
- Ticho: uživatel dlouho nepřišel — jeden obraz, bez zahlcení

Forma: krátká zpráva v Rúnarově hlasu. Jeden obraz. Jedna otázka. Bez vysvětlení.
*"Lípa u cesty shazuje poslední listí. Přemýšlím o tobě."*

---

## IS generování — pravidla pro nová volání

Každé místo kde Claude generuje IS text musí mít tři vrstvy:

1. System prompt v IS charakteru — lang vždy jako parametr, nikdy z globálu
2. User prompt psaný přímo v islandštině — nikdy "Respond in Icelandic" na konci EN promptu
3. Corrections blok **do promptu** (`getCorrPrompt`) — model je ohne podle kontextu (pád, rod)

⚠️ `applyISCorrections` (slepý substring post-processor) je **VYPNUTÝ** od 2026-07-10.

Corrections blok z getCorrPrompt() musí být vždy připojen k IS promptu.

Implementováno ve všech 3 generováních ✅:
- Normální čtení: buildReadingPromptIS()
- Life rune: buildLifeRunePromptIS()
- The Gathering: buildWhispersPrompt() IS větev

Každý nový prompt musí žít v mytologickém světě.
Rúnar není asistent. Je průvodce na cestě Rune Seekera.

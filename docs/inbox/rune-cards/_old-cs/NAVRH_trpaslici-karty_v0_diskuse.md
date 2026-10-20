# Návrh: karty s trpaslíky (25 run) — v0 k DISKUSI, nic se nekreslí

autor: Cowork · 2026-10-18 · HEAD při čtení `9aacc01` · NIC z toho není rozhodnuté; owner schvaluje

## 1. Co už repo o trpaslících má (čteno, ne z paměti)

- **Rúnar** — `RUNAR_DESIGN.md` ř. 25–28: „laskavý severský dwarf-like zjev kolem padesátky“, zapletené vlasy a vousy, modré roucho s kožešinou, obsidiánový přívěsek s ᚱ. Obrazy: `v2/assets/runar-fullbody.png` (character sheet: zepředu/z boku/zezadu, hůl, gesta, hlavy, pruh materiálů), `runar-ceremonial.png`, `runar-travel.png`, `runar-expressions.png`, `runar-portrait.png`; popis v `v2/assets/README.md`.
- **Dvergar — katalog** (`RUNAR_DESIGN.md` ř. ~425–469): kánonní a agndofští dvergové s jednou větou a umístěním (Norðri/Suðri/Austri/Vestri, Mótsognir, Durinn, Dvalin, Brokkr a Eitri, synové Ivaldiho, Fjalar a Galar, Alvíss, Andvari, Móberg, Lyngri, Brísingar, Dáinn, Regin, Þjóðreyrir …).
- **Pravidla katalogu:** (a) „Přidáváš postavu? Nejdřív sem [do RUNAR_DESIGN.md], teprve pak výtah do kódu.“ (b) Dvergatal: „Obsah nevymýšlet; až některý dostane roli, rozepíše se.“ (c) Rúnar o dvergech mluví jen na Ask a odpoví pár slovy; katalog je lore, do promptu se nevkládá. (d) 🔒 Dvergar původně nebyli nutně malí; Rúnar je „prastarý řemeslník kamene, ne komická postavička“ → **dverga-smíði**.
- Ownerova věta „máme jich a jeho bratrů už víc“: v repu jsem **jiné trpaslíky než Rúnara jako obrázky nenašel** (ve `v2/assets`, `web/`, `_backup`). Jsou jinde? → pošli.

## 2. Nápad (ownerův)

Každá z 25 run dostane **trpaslíka** — postavu na kartě, jako je to u oracle karet s postavami. Rúnar zůstává Rune Keeper (hlavní, sběratel kamenů); ostatních 24 + Blank jsou jeho bratři/bratranci, každý „sedí“ své runě. Zadní strana: vazebná runa AGNDOFA (dodána, uložena v `rune-cards/`).

## 3. Návrh anatomie karty (obecná znalost o oracle kartách, NEověřená rešerše — web nic použitelného nedal)

- **Ilustrace postavy** zabírá většinu karty (cca 60–70 %), pozadí = krajina/prostředí jeho runy (paleta Agndofy z `sacred-palette.png`: ember gold, rune cloth blue, obsidian, aurora green…).
- **Kámen runy** (`RUNE_SVGS`, stejný jako dnes) jako pevný prvek na stejném místě každé karty — pozná se podle něj řada.
- **Pruh se jménem:** jméno runy (`n`), jméno trpaslíka, `k` klíčová slova; **jedna** věta, ne odstavec (text na malé kartě nečte nikdo, kdo ho nehledá).
- Jednotný rám = rám dnešních karet (`#2E4A70` linka), stejná patička „The Rune Keeper · RÚNAR“.
- Rodinné znaky bratří: spletené vousy, kožešina/rouch v modré, runa na čele (Rúnar ji má) a přívěsek — **u bratra jeho vlastní runa**. Odlišuje je řemeslo, nářadí a barva prostředí.

## 4. Návrh přiřazení run → trpaslík (v0)

Značky: **[kánon]** = už v katalogu `RUNAR_DESIGN.md` · **[Agndofa]** = naše postava z katalogu · **[vymyslet]** = v katalogu není. Poznámky vycházejí z jeho vět.

| # | Runa | Trpaslík | Zdroj | Proč / pozor |
|---|---|---|---|---|
| 1 | Fehu | Andvari | kánon | střeží zlato pod vodopádem — brát **střežení**, ne kletbu |
| 2 | Uruz | Mótsognir | kánon | první a největší, z Ymiho krve — prasíla |
| 3 | Thurisaz | strážce prahu | vymyslet | brána, trn, opatrnost; v katalogu nikdo |
| 4 | Ansuz | Alvíss | kánon | „vševědoucí“, znal jména všech věcí (hlas, zpráva) |
| 5 | Raidho | Austri | kánon | východ, mlžné fjordy — cesta |
| 6 | Kenaz | Eitri (Sindri) | kánon | výheň, žár — pochodeň |
| 7 | Gebo | Alfrigg z Brísingar | kánon | ⚠ DESIGN: brát **předmět** (náhrdelník, pouto), **ne cenu** („noc s každým“) |
| 8 | Wunjo | trpaslík u krbu | vymyslet | radost, sounáležitost (paleta Hearthwood) |
| 9 | Hagalaz | trpaslík kroupové bouře | vymyslet | krupobití, očista |
| 10 | Nauthiz | ? | vymyslet | nutnost, omezení (Völundr je „hraniční“ — spíš ne) |
| 11 | Isa | Dvalin | kánon | „dřímající“, spjatý s runami — ticho, čekání |
| 12 | Jera | trpaslík sklizně | vymyslet | cyklus, čas (obrazy `RUNE_IMAGES`: ovce, borůvky, chléb) |
| 13 | Eihwaz | Dáinn | kánon | jméno sdílí jelen Yggdrasilu; „mrtvý“ → smrt a znovuzrození |
| 14 | Perth | ? | vymyslet | skryté, co vychází na světlo |
| 15 | Algiz | Norðri | kánon | drží nebe na severu — ochrana |
| 16 | Sowilo | Suðri | kánon | jih, černé písky — slunce |
| 17 | Tiwaz | synové Ivaldiho | kánon | Gungni, Ódinovo kopí — spravedlnost, oběť |
| 18 | Berkana | Móberg | Agndofa | mladý dverg tufu — nový začátek |
| 19 | Ehwaz | Brokkr | kánon | bratři-kováři, partnerství (Eitri v #6) |
| 20 | Mannaz | ? (Regin?) | vymyslet | člověk, já; Regin je pěstoun, ale příběh je zrada |
| 21 | Laguz | Vestri | kánon | západní útesy, moře — voda |
| 22 | Ingwaz | Lyngri | Agndofa | nejmenší, kořeny lyngu — semeno, potenciál |
| 23 | Othila | Durinn | kánon | prastarý bazalt v řadách — dědictví, základ |
| 24 | Dagaz | Þjóðreyrir | kánon | jediný dverg spjatý se DNEM, u prahu úsvitu |
| 25 | Blank | Rúnar | — | prázdný kámen v ruce Rune Keepera (Blank ≈ neznámé, Odin) |

Z 25 je **7 slotů k vymyšlení** (3, 8, 9, 10, 12, 14, 20); u vymyšlených se musí postavit **nejdřív záznam v katalogu `RUNAR_DESIGN.md`** (podle pravidla), pak teprve obraz.

## 5. Co v návrhu nesedí / nejsilnější argument PROTI

1. **Rúnar „není jeden — každý uživatel má svého Rúnara“** (`RUNAR_DESIGN.md` ř. 22) vs. 25 pojmenovaných bratří: nekoliduje, pokud jsou karty vizuál a ne postavy, které promlouvají ve čtení. Jakmile by „trpaslík Andvari“ začal v kartě něco radit, jsme u věštění (zrcadlo vs. orákulum, nesmlouvavá čára).
2. **Přetěžuje to lore.** Katalog má hotových ~25 jmen; 7 nových je 7 nových věcí k hlídání (IS jména, shoda s Ask).
3. **Kámen (Book of Stones) a trpaslík (oracle deck) jsou dva produkty**, ne jeden. Tisková černobílá verze se u malovaných postav nedá udělat přebarvením — je to jiná práce (linka), nebo se vzdá.
4. Já **neumím kreslit obrazy**. Dnešní Rúnar vznikl v generátoru obrázků (v `README` jsou C2PA metadata OpenAI). Moje část = zadání (briefy, prompty, rodinné znaky, sladění s `sacred-palette`), šablona karty s prázdným místem na obraz a texty. Obrazy dodá generátor/ilustrátor; konzistentní postavy ze **dvou** referencí (character sheet Rúnara + paleta) jsou nejtěžší část.

## 6. Navržený postup (až owner řekne)

1. Owner potvrdí/přetřídí tabulku v §4 a řekne, zda jsou karty trpaslíků **druhý produkt vedle Book of Stones**.
2. Pošle ostatní trpaslíky, které už má (viz §1).
3. Cowork dopíše do katalogu `RUNAR_DESIGN.md` (přes CODE) 7 nových postav a rodinné znaky.
4. Cowork udělá šablonu karty (rám + kámen + jméno + věta + zadní strana s vazebnou runou) s prázdným polem na obraz.
5. Generování obrazů mimo Cowork podle briefů, pak vložení do šablony.

## 7. Jedna otázka k rozhodnutí

Stojí karty s trpaslíky **vedle** textových karet (Book of Stones), nebo je **nahrazují**?

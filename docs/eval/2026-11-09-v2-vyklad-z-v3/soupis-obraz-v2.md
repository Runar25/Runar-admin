# Soupis: co v2 ví o skládání obrazu a kde prompt v2 říká jednu věc víckrát

2026-11-14, CODE-read. Owner: *„ve v2 jsme už udělali velký kus práce ohledně skládání obrazů, to má být první místo, kam se koukáš … v2 má hodně
restrikcí, dokonce na více místech pro stejnou věc“* · „11. ano, udělej ten soupis“.
**Tenhle soubor vlastní jen soupis** (kde co leží a kolikrát to prompt říká). Pravidla a měření neopisuje, odkazuje (§20).
Podklad: celý produkční prompt Single EN složený buildery v2 (Fehu, bez oblasti a hledání; 721 slov, z toho systém 354) a `node scripts/anatomie_promptu.js`.

## 1. Co o obrazu víme z v2 (změřené nebo ownerem rozhodnuté)
| # | co platí | stav | kde to bydlí |
|---|---|---|---|
| 1 | Jedna scéna, jeden, kdo koná; obraz patří runě toho, kdo v něm koná | změřeno | `RUNAR_DESIGN.md` „Délka a tvar obrazu“ 1 |
| 2 | Žádná druhá událost; žádné časové slovo, které runu nenese | změřeno + owner | tamtéž 2, 3 |
| 3 | Délka kolem 12 slov; ownerem chválené mají 11–16 | změřeno | tamtéž 5 |
| 4 | Délka obrazu neřídí délku první věty (r = 0,02); důvod krátit je opisování | změřeno | tamtéž 5, DECISIONS 2026-09-23 (10) |
| 5 | Z dlouhého obrazu model převzal 5 ze 7 slov | změřeno | EVAL_LOG 2026-09-14 |
| 6 | Opisování na solu (EN): slova typu „vlastními slovy“ ani obraz jako úlomky nepomohly; pomohlo „podívej se blíž, čeho by si tam někdo všiml“ | změřeno, 5× jeden prompt | EVAL_LOG 2026-09-23 (6) |
| 7 | Věta „one detail“ snižuje převyprávění obrazu; lepší čtení celkově nezjištěno | změřeno | EVAL_LOG 2026-09-23 (9) |
| 8 | Každý obraz projde kontrolou, jestli patří ke své runě; po zkrácení znovu (12/15 drželo) | změřeno | `RUNAR_DESIGN.md` „Typ obrazu“, „Délka a tvar“ 4 |
| 9 | Typ obrazu se páruje s povahou významu: živel → fyzický, čin/ctnost → situační; nehybná věc sklouzává k Ise | změřeno | `RUNAR_DESIGN.md` „Typ obrazu“ |
| 10 | Předmět ani sloveso nesmí být jádrem sousední runy („čí je to pozemek“) | pravidlo | tamtéž |
| 11 | Dvě síta: člověka nestavět dovnitř ochrany jako fakt; severské obrazy nesmí vyjít středověké | owner + změřeno | `RUNAR_DESIGN.md` „Obraz — dvě síta“ |
| 12 | Scéna doma táhne k Othile; „zní dobře“ kontrolu runy nenahrazuje | změřeno | `RUNAR_DESIGN.md` „Obraz od modelu“ |
| 13 | Úhel otevření [4] dělá dvě věty scény 8/10; produkce: obraz 14 slov → scéna 26 slov, 71 % slov obrazu převzato | změřeno, 42 čtení | `README.md` oddíl 5 |
| 14 | Řádek „scéna dostane jednu větu“: scéna v jedné větě 3/3, třetí věta přešla k významu | změřeno, 3 páry | `README.md` oddíl 6 |
Neověřeno / chybí: nástroj kontroly runy v obraze jsem v `scripts/` nedohledal (pravidlo popsané je, skript ne). Islandské opisování (32 % proti 12 %)
má odložený nezkoušený test — obraz jako rozpojená slova (`docs/archive/RUNAR_BACKLOG_odlozene.md` bod 4); pro EN na solu tatáž páka nepomohla (řádek 6).

## 2. Kde prompt v2 mluví o obrazu (5 kusů, 146 z asi 365 slov uživatelské části)
| kus | co říká | kam model tlačí |
|---|---|---|
| ANGLE (31 slov) | úhel otevření „ať utvoří začátek i tón“ | rozvíjet scénu |
| THE IMAGE (blok) | jeden obraz „nese celým čtením“; druhý obraz jen „táž scéna o krok dál“; obraz se musí dotknout místa, kde člověk stojí | vracet se do obrazu ve větě 3 |
| IMAGE (řádek) | hotová věta obrazu + „ať se stane tvým viděním, až po detail, který věta neříká“ | přidávat do scény |
| ESSENCE | „po obrazu … význam, který obraz už drží“ | význam jako dovětek obrazu |
| NO COLD READING | „Describe the image“ | popisovat obraz |
Pět kusů říká „zůstaň u obrazu a rozveď ho“; žádný neříká, že zbytek čtení patří runě. To sedí s měřením (řádky 13, 14) i s ownerovou výhradou,
že model obraz opisuje a čtení je o obrazu víc než o runě.

## 3. Jedna věc na víc místech (týž prompt)
| věc | kolikrát | kde |
|---|---|---|
| Neříkej nic o člověku / žádný závěr, rada, osud | 6 kusů vždy, 8 s oblastí a hledáním | SYS „never predicts fate…“ · SYS „Never hand the seeker a conclusion“ · SYS „never tells the seeker what to do“ · ESSENCE „no fate. Never tell the seeker what it means for them“ · NO COLD READING · ENDING „never as something you know about them“ · AREA · SEEKING |
| Prostá slova, žádná mystika | 4 | SYS HOW YOU SPEAK · SYS LANGUAGE 3 · SYS THE VOICE · ESSENCE „plain words“ |
| Délka a krátké věty | 3 | SYS HOW YOU SPEAK · LENGTH · připomínka délky na konci |
| Jedna věc stačí | 2 | THE IMAGE „one image“ · „One clear insight is enough“ |
| Zůstaň u obrazu | 5 | oddíl 2 |
Co z toho je zdvojené záměrně a změřeně (připomínka délky, NO COLD READING) vlastní komentáře v `v2/runar-character.js` a DECISIONS; tenhle soupis
neříká, co smí pryč — jen kde to je. Ubírání se zkouší po jednom (§25 A).

## 4. Nález mimo zadání
Obraz Fehu „The wool is traded in, and coffee and sugar come back for it“, který owner 2026-11-04 odmítl („jak moc se někomu stane…“), je v bance v2
dál a tenhle tah ho vylosoval. Banka je CODE-tune; owner 2026-11-10: obrazy Fehu se mají předělat.

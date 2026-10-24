---
name: HANDOFF66 — Účty (Visitor, Rune Seeker, Standard, Premium, admin) musí v menu a v UI vypadat a fungovat stejně; hloubková kontrola
from: Cowork (read-only; kód nepíšu, jen podklady)
to: CODE-read (hloubková kontrola) + CODE-tune (oprava dvou nálezů)
date: 2026-10-18
status: 🟡 ZADÁNÍ od ownera + tři ověřené nálezy z jeho screenshotů (verze 3, 2026-10-18: doplněna ownerova diskuse o Visitorovi, Journalu a menu — nový oddíl „Ownerova diskuse“). Kontrola celé appky NENÍ udělaná — to je úkol pro CODE-read. Nic z oddílu „Ownerova diskuse“ zatím není rozhodnuto k implementaci: owner řekl „ještě to doplníme“.
ověřeno živě: HEAD `afc6735` (2026-10-16; při zápisu v3 je HEAD `420edbd` — řádková čísla níže znovu ověřit); čteno: `v2/runar-reader.html` ř. 906–963, `v2/runar-app.js` ř. 726–745, 797–830, 1650–1672, `v2/runar-translations.js` ř. 244–253 a 784–793, `RUNAR_DECISIONS.md` 2026-10-15 (4).
přílohy: 4 screenshoty od ownera (Android, Visitor: menu bez a s rozbalenou nabídkou, výběr aplikace po „WRITE TO runar@…“, karta čtení Visitora).
---

## Pravidlo ownera (opakované, „už jsem to říkal víckrát“)

Vizuální a ovládací úpravy platí **pro všechny účty stejně**. Dosud se pracovalo hlavně v účtech Rune Seeker a Premium, ostatní (Visitor,
Standard, admin) zůstávají pozadu. Rozdíl smí být jen tam, kde ho vyžaduje funkce (např. přihlášený má deník, Visitor ne) — ne ve vzhledu
a ne v tom, *jak* se věc ovládá. Poslední kontrola podle ownera proběhla, ale „nebyla udělaná pořádně“ (neznám její výstup, netvrdím víc).

## Nález 1 (OPRAVENO 2026-10-18 po ownerově reakci) — Visitor: ne „+“ u jména, ale rozbalená nabídka UPGRADE YOUR JOURNEY

První verze tohoto bodu žádala „+“ u jména Visitora. **Owner to odmítl:** *„Změna visitor vlastně nemá skoro nic. Spíš mu musíme rozbalit nabídku upgrade your journey.“*
Visitorův vlastní výpis jsou tři věty; sbalovat ho nemá smysl. Důležité je, aby viděl, co dostane — tedy **UPGRADE YOUR JOURNEY rozbalené
ve výchozím stavu pro Visitora** (screenshot 1 ukazuje rozbalený stav: Rune Seeker, Rune Walker, Rune Wanderer).

Kde to je: `runar-reader.html` ř. 915–920 (`sp-higher-toggle`, `sp-path-body` s `display:none`), plnění `runar-app.js` ř. ~1774–1790
(`_renderYourPath`), přepínač `toggleHigherPath`. Dnes je sbalené pro všechny stejně. Zadání pro CODE-tune: u Visitora se otevře samo
(klepnutím jde stále zavřít); co dělá u přihlášených účtů, je tvoje rozhodnutí — pravidlo „stejné pro všechny“ říká, že ovládání
(klepnutí na „+/−“) zůstává stejné, liší se jen výchozí stav. Změnu z 2026-10-15 (`_applyTierDesc`: Visitor bez „+“, pozvánka rozbalená
natvrdo) tím nesahat — owner ji tímto nežádá měnit.

## Nález 3 — První věta Visitorova výpisu není pravdivá (ověřeno v kódu)

Text: „The Runes Collection and your life rune are free.“ (`runar-config.js` ř. 355, IS ř. 356: „Safn rúna og lífsrúnin þín eru ókeypis.“).
Co Visitor skutečně dostane:
- **Sbírka:** jen **5 run z 25** — `VISITOR_RUNES = ['Fehu','Isa','Tiwaz','Sowilo','Ansuz']` (`runar-app.js:1199`, zamčené ostatní ř. 1214). Věta tvrdí celou Sbírku.
- **Životní runa:** zjistí, **která** runa je jeho (zadá den a měsíc), ale **přečíst, co nese, jen po přihlášení** — `tree_visitor_read`: „Sign in to read what this rune carries.“
  Věta „life rune is free“ to zamlčí.
- **Čtení: žádné.** Od 2026-08-02 návštěvník čtení nedostane (proxy vrací 401; `runar-config.js` ř. 190, 352). Může si **vytáhnout runu a vidět, která
  přišla** (`visitor_join_note`), samotné čtení je pro Rune Seekery.
Odpověď na ownerovu otázku „má Visitor vůbec nějaké čtení zdarma?“: **ne**. Jediné zdarma: 5 run ve Sbírce, zjištění vlastní životní runy a tah
runy bez čtení; registrace je zdarma a dá jedno čtení.

Návrh nové první věty (obsah, ne kód; IS je můj první návrh, **neověřená islandština**, CODE ověří korpusem a `is-grammar-qa`):
- EN: „Five runes of the Collection are free, and you can find out which life rune is yours.“
- IS: „Fimm rúnir úr Safninu eru ókeypis og þú getur fundið hvaða lífsrún er þín.“
Druhá a třetí věta („Readings are for Rune Seekers.“ / „Joining costs nothing.“) platí. Pozor na shodu s `vcn_text` („Five runes await you“) a s textem
na kartě čtení („You walk here as a Visitor…“, screenshot 2) — ať nikde není jiná verze toho, co je zdarma.

## Nález 2 — „WRITE TO runar@therunekeeper.com“ otevře výběr pošty, ostatní mají formulář (ověřeno v kódu)

Co owner vidí na screenshotu 2: po klepnutí Android nabídne „Open with“ Gmail / Outlook / Proton Mail. Přihlášený účet dostane okno s textovým polem.

Příčina: dvě různé položky podle stavu — `runar-app.js:738–742`: přihlášený `sp-line-btn` → `openLine()` (okno → edge funkce `send-line`),
Visitor `sp-line-mail` = `<a href="mailto:runar@therunekeeper.com">` (`runar-reader.html:960`). Text: `line_menu` „✉ SEND RÚNAR A LINE“ vs
`line_menu_visitor` „✉ WRITE TO runar@therunekeeper.com“ (`runar-translations.js:248–249`, IS 788–789).

Proč to tak CODE udělal (DECISIONS 2026-10-15 (4)): *„Návštěvník má v menu jen odkaz na e-mail“*; v kódu (`runar-reader.html` komentář ř. 957): jeho
adresu neznáme a veřejný formulář by lákal spam. `send-line` bere adresu **ze přihlášení** (ne z klienta) a má limit 3 zprávy za hodinu — proto
nejde jen „pustit stejné okno“.

Zadání ownera: stejný formulář pro všechny. **Střet, který CODE-tune musí vyřešit a nahlásit ownerovi, ne tiše obejít:** pro Visitora chybí
(a) adresa pro odpověď — musí ji zadat v okně (pole e-mailu), jinak odpověď nemá kam jít; (b) ochrana proti zneužití bez přihlášení
(limit na IP/adresu, past na boty, ověření adresy) — to je nový veřejný vstup, tedy věc §20/§30 a soukromí (Visitor posílá osobní údaj, zásady
a doba mazání musí pokrýt i jeho). Moje role je jen nahlásit, že tu rozhodnutí „mailto kvůli spamu“ stojí proti pravidlu „stejné pro všechny“;
jak to ochránit, je tvé. Pokud by veřejná varianta byla příliš riziková, je to rozhodnutí pro ownera s čísly, ne s kompromisem „Visitor jinak“.

## Ownerova diskuse 2026-10-18 (v3) — k zapsání a k dalšímu doplnění; ZATÍM NEIMPLEMENTOVAT

Owner: „Jde spíš o to všechno sjednotit do celku. Ještě to doplníme.“ Níže jsou jeho rozhodnutí a nápady tak, jak zazněly; rozhodnutí o implementaci udělá owner s CODE.

**A. Zámek Sbírky u Visitora ZŮSTÁVÁ (5 run z 25).** Důvod (ownerův, opravuje můj dřívější omyl): zámek tu není kvůli ceně, ale kvůli limitu/zneužití — aby si nepřihlášení
nemohli donekonečna přehrávat všech 25 run. Audio Sbírky je předem nahrané a statické (`collAudioMap`), přehrání nestojí nic. Rozdíl proti krátké statické verzi významu:
u každé runy je Rúnarův hlas, který Visitor jinak nedostane. Moje dřívější věta „zámek = ochrana nákladů“ je stažená.

**B. První úvodní okno na kartě čtení zůstává.** Owner: „To první úvodní okno jinak necháme. Ve skutečnosti je dobré, učí člověka používat appku.“ Visitora chceme
uvést do toho, co je Rúnar app, a ukázat mu, kde co je — proto je dobré odkazovat na Runes Collection atd.

**C. Změna textu „free to join“ → „one free reading when you join“.** Platí pro `vcn_text` (Sbírka, `runar-translations.js` ~ř. 366) a `journal_gate_txt` (~ř. 518). Využít `{onboarding}`
z `runar-config.js` (free_trial ř. ~184–196), ne natvrdo číslo.

**D. Uvítání Visitora v menu.** Věta „You walk here as a Visitor. Draw a rune and see which one comes to you.“ patří podle ownera spíš na **welcome visitor — jako přivítání** (menu Visitora),
ne na kartu čtení. Otevřená otázka (owner neodpověděl): nahrazuje věta dnešní první větu výpisu („The Runes Collection and your life rune are free.“ — nepravdivá, viz Nález 3), nebo menu začíná jen
přivítáním a výpis následuje? Až owner řekne.

**E. Statické vysvětlení pro Visitora — „Rúnar's welcome“.** Owner navrhuje univerzální uvítací zdravici od Rúnara, statickou: když Visitor vylosuje nebo vybere runu, uvidí
Rúnarův popisek významu té runy (statický, ten už máme v appce). Nebo text typu „až se staneš Rune Seekerem, Rúnar ti tu udělá výklad runy“. Použít část z „How a Reading Works“, která vysvětluje, co se
ve čtení objeví — tj. **jak Rúnar runu vidí a jak ji čte**. Pro Visitora tedy: vysvětlení, jak a co funguje a kde to najít (což už děláme, když ho odkazujeme do Runes Collection).
**Související nový podklad:** krátké statické významy 25 run (ne v Rúnarově hlase) vznikají pro stažitelný průvodce — `Claude outputs/rune-cards/texts.json`, popis v HANDOFF67.
Zda je použít i v appce, je OTEVŘENÉ rozhodnutí (texty zatím ownerem neschválené kromě Fehu; IS neexistuje).

**F. Journal: vysvětlení.** Dnes je v Journalu jen malé okno („Obr. 4“). Má tam být napsáno, **co se tam ukládá a proč, a jak se z toho vracet v budoucnu**.

**G. Menu „Your path“ — stejný mechanismus jako „How a reading works“.** Vysvětlující blok téhož typu, který se rozbaluje v menu (Your path), pro Journal a ostatní oblasti.

**H. Sjednotit do celku.** Texty Visitora v menu, na kartě čtení, v Journalu a ve Sbírce musí říkat jedno a totéž o tom, co je zdarma a co je za registrací (Nález 3 + C). Pravidlo „účty vypadají stejně“ platí i zde.

Owner o tom mluví jako o rozdělané věci: „Ještě to doplníme.“

## Úkol pro CODE-read — hloubková kontrola „účty se nesmí lišit“

Metoda (navrhuji, rozhodni): matice **stav × plocha**, vyplněná z kódu, ne z paměti.
- **Stavy:** Visitor (`free_trial`) · Rune Seeker · Standard · Premium (i tester = premium + `is_tester`) · admin. Existují 4 skutečné účty (2 admini,
  2 Rune Seeker) + tester přes `allowed_emails`; Standard v DB nikdo nemá, proto ho musí kontrola ověřit **čtením kódu**, ne klikáním.
- **Plochy (minimum):** boční menu (jméno účtu, výpis funkcí, UPGRADE YOUR JOURNEY, kontakt, install, privacy, sign-out) · horní lišta a
  dropdown · formulář čtení a spready (zamčené/odemčené) · Ask (teaser vs otevřený) · hlas · Kolekce · záložka Životní runa · všechna modální okna
  (jméno, souhlas, Where to start, smazání účtu, line) · toasty a hlášky zamčení · vlajka ⚑ a „?“ · přihlašovací okno.
- **Co hledat:** každá větev, která mění *vzhled nebo ovládání* podle stavu: `currentUser`, `userTier`, `isTester`, `isAdmin`, `normTier`, `tier ===`.
  Start (nekompletní!): `runar-app.js:624, 741–742, 770, 773, 1665` mají `style.display = currentUser/isAdmin…`; `isTester` je v `runar-app.js` (6×),
  `runar-reading.js` (2×), `runar-reporter.js` (1×), `runar-tree.js` (3×). Seznam jsem nesestavila úplně; je to jen odrazový můstek.
- **Výstup:** tabulka „rozdíl / kde v kódu / vyžaduje ho funkce? (ano/ne + proč) / sjednotit?“. Nálezy 1–3 výše tam patří jako první řádky.
  Vše „ne“ → úkol pro CODE-tune. Co je skutečně funkční rozdíl, ať je výslovně vypsané, aby owner viděl hranici.
- Stejné Visitor pravidlo platí i pro **IS i EN** (texty tlačítek a stavů se nesmí lišit mezi jazyky tam, kde se neliší funkce).

## ZMĚNĚNO:

(prázdné — jen podklady; žádný kód, žádný zápis do repa)

---
name: DVERG BRIEF — Dverg Tarot: co to je, co je rozhodnuté, jak se to dělá, co je otevřené
from: Cowork (Rúnar projekt, session 2026-10-18 až 2026-10-21) — ucelený záznam, aby se nic neztratilo
to: nový Cowork pro Dverg Tarot + owner + CODE session s prefixem [dverg]
date: 2026-10-21
status: 🟡 PRACOVNÍ — shrnuje rozhovor s ownerem; nic zde není schváleno kromě oddílu 2 (ownerova rozhodnutí)
ověřeno živě: repo HEAD `3c2ed59` (2026-10-21); `dverg-tarot/` obsahuje README.md, postavy/, puvodni-cs/ (soubory porovnány hashem s mými originály, binárky 13/13 shodné)
jazyk: tento brief česky (pracovní dokument); obsah pro karty (charakteristiky, scény, prompty) vždy ANGLICKY (owner: „Musí to být v angličtině!“)
---

## 0. ZADÁNÍ — začni tady (owner schválil plán fáze 1 dne 2026-10-21, neptej se znovu „co chceš“)

Owner nechce zadání vypisovat podruhé. **Úkol je fáze 1 z oddílu 7, v tomto pořadí, bez ptaní na povolení mezi kroky:**

1. Tabulka 25 × 5 kritérií (4.5) nad `DWARVES_25_characterizations_v0_EN.md`, s citací u každého hodnocení a se značením [pramen] / [odvození] / [naše] (4.4). Anglicky. Pošli jako soubor.
2. Rozdělení každé z 25 postav na Character Sheet a Rune Scene (4.1). Anglicky.
3. Scény **Uruz–Mótsognir, Gebo–Alfrigg, Thurisaz, Dagaz** ve stylu hotové studie Isy (`ISA_scene_study_v0_EN.md`): každá 2–3 úhly, doporučení, nejsilnější argument proti, prompt.
4. Minimální rodinné znaky (4.3) jako návrh.

Po každém kroku pošli soubor (`SendUserFile` + `Claude outputs/dverg/`), krátce řekni, co je hotové a co je ownerovo rozhodnutí. Ptej se **jen** u rozhodnutí z oddílu 8 (jména, název, formát, vrstva B). Na repo nesaháš (read-only). Vrstvu B (oddíl 5) nestavíš.

## 1. Co to je (jedním odstavcem)

**Dverg Tarot** (pracovní název): 25 karet run ve stylu tarotu/oracle. Na každé kartě je **dverg, který dělá to, co runa znamená**, v islandské přírodě. Obraz je tak bohatý, jak je bohatá runa na významy — **každý význam runy = jeden viditelný prvek scény**. Kdo chce, vytáhne kartu a čte si sám; kdo chce, nechá runu přečíst Rúnarem v appce (jediný dotyk s Rúnarem je výběr runy). Je to **samostatný produkt Agndofy, ne součást Rúnara**.

## 2. Co je rozhodnuto (ownerova slova; zdroje v repu)

1. **Samostatný produkt**, vlastní složka `dverg-tarot/`, vlastní session, commit prefix `[dverg]` (DECISIONS 2026-10-21 (1) a (2); `CLAUDE.md` ř. ~590). Nic odsud nejde do Rúnara a Rúnarovi CODE session sem nesahají.
2. **Pořadí práce: runa → její význam → dverg, který k ní sedí → popis postavy → prompt obrázku.** Nikdy ne „oblíbený dverg → dodatečně vymyšlený význam“.
3. **25 run = 25 dvergů**, včetně Sowilo, Dagaz a Blank (v Rúnarovi je dverg „materiál pod runou“, nejmenuje se a světelné runy ho nemají — **tady to neplatí**).
4. **Obraz**: dverg je hlavní postava a jedná; příroda je **islandská**; bohatost obrazu = bohatost významů runy; dělá se jako oracle/tarot karty. Textová charakteristika „jako u Rúnara“, ze které **jiný software** vytvoří obrázek.
5. **Angličtina** pro všechny podklady karet.
6. **Více úhlů pohledu na scénu** (zkoušet víc návrhů, ne jeden).
7. **Rúnar je výtvarný a charakterový standard rodiny dvergů** — ostatní musí patřit do stejného světa, každý musí být rozpoznatelný jako vlastní bytost (viz oddíl 4).
8. **Vrstva B** (viz oddíl 5) — owner ji řešit v tomto produktu teď nechce; pro ni má v Rúnarově digitálním čtení připravené místo. Pouze zaznamenáno.
9. **Rúnar karty ke stažení (textové)** zůstávají u Rúnara v `docs/inbox/rune-cards/` — jiný produkt. Sdílí se jen vazebná runa AGNDOFA pro zadní stranu.

## 3. Stav věcí k 2026-10-21 (co kde leží)

| Co | Kde | Pozn. |
|---|---|---|
| README produktu, hranice, otevřené body | `dverg-tarot/README.md` | psal CODE-read, 2026-10-21 |
| 25 charakteristik v0 (EN) | `dverg-tarot/postavy/DWARVES_25_characterizations_v0_EN.md` | § A rozpory s repem, § B rodinný základ, § C 25 postav, § D rizika, § E co chci od ownera |
| Studie scény Isa + Dvalin (EN) + náčrty | `dverg-tarot/postavy/ISA_scene_study_v0_EN.md`, `isa_panels_EN.png` | doporučení A + průhledný led z B |
| Česká první verze | `dverg-tarot/puvodni-cs/` | jen archiv |
| Karty run ke stažení (PDF, generátor, texty) | `docs/inbox/rune-cards/` | HANDOFF67/68; patří Rúnarovi |
| HANDOFF66 (Visitor/Journal/menu) | jen `Claude outputs/` a claude.ai projekt | **není v repu**; je o Rúnarovi, ne o dvergech |

Obrázky dvergů **zatím neexistují**. Existují charakteristiky, jedna studie scény a jeden prompt (Isa). Nic nebylo vygenerováno ani otestováno na člověku.

## 4. Jak se každá karta dělá (metoda v1 — návrh, ne dogma)

### 4.1 Dva dokumenty na dverga (nový nápad z druhého podkladu, přijato jako pracovní)

- **A. Character Sheet — kdo dverg je (stálé):** jméno + původ (pramen / odvození / naše), vzhled (věk, postava, tvář, vlasy, vousy), oděv a materiály, vlastní runa a její umístění, osobnost, řemeslo, místo v Agndofě, **čím se liší od Rúnara a od ostatních**, **co se při generování nesmí změnit**.
- **B. Rune Scene — co se děje na kartě (proměnné):** situace, co dverg právě dělá, předměty a detaily nesoucí význam (**1 význam = 1 prvek**), popředí/střed/pozadí, vztah postavy a okolí, napětí nebo otázka, která v obraze zůstává, **co obraz nesmí tvrdit ani předpovídat**, prompt.
- Proč dva: jednoho dverga lze ukázat ve více scénách (jiný úhel, jiná runa-situace, později vrstva B) bez nové postavy.

Dosavadní soubor `DWARVES_25_…v0_EN.md` je smíšený (A i B dohromady). Pro fázi 1 se rozdělí.

### 4.2 Recept scény (z rozboru tarotu/oracle; zdroje: elvitarot.com, Wikipedia RWS + obecná znalost — **dva weby, ne odborná studie**)

1. Seznam významů runy (z `k` v `v2/runar-runes.js` + ownerovy popisy `RUNAR_POPISY_RUN.md` + `RUNAR_DESIGN.md`).
2. Jeden viditelný prvek na význam, v islandské přírodě; pokud existuje, vzít obraz, který Rúnar zná (`RUNE_IMAGES`) — **přenos je nové rozhodnutí, ne tichý import**.
3. Dverg v poloze, která dělá **sloveso runy** (Isa: nehýbe se).
4. Tři vrstvy: popředí (gesto + předmět), střed (příběh), pozadí (nálada, počasí, světlo).
5. Max 5–6 symbolů; víc = postava zmizí.
6. Barva podle významu + paleta Agndofy; jedna barva dominuje.
7. Spodní pětina klidná; v obrazu žádný text.

Islandské znaky, které generátor musí dostat výslovně (jinak nakreslí Aljašku): černá lávová skála ze sněhu, mechem porostlá pole lávy, fjord se strmými holými horami, nízké břízky místo jehličnatého lesa, drnový dům, nízké zimní slunce, ledové kry s černými pruhy popela. **Ne:** jehličnany, soby, sáně, iglú, ledního medvěda.

### 4.3 Rúnar jako standard — co se přebírá a co ne

Z `v2/assets/runar-fullbody.png`, `sacred-palette.png` a `RUNAR_DESIGN.md` „Jak vypadá“ (čte se jen jako předloha, nemění se):

| Prvek | Společný základ | Co je u každého jiné |
|---|---|---|
| Vzhled | stylizovaný realistický severský dverg, výrazná tvář, propracované vlasy a vousy | tvar obličeje, proporce, věk, účes, stavba |
| Oděv | ručně působící materiály, vlna, kožešina, kůže, severské vzory | střih, barvy, pracovní vybavení, ozdoby |
| Runa | vlastní runový symbol a identita | runa postavy a její umístění |
| Atmosféra | starobylý svět Agndofy, mystika, důstojnost, teplo | prostředí, světlo, počasí, emoce |

**Rúnarova otevřená dlaň, hůl a role průvodce jsou jeho osobnost, ne povinná výbava ostatních.** Ostatní mohou být kováři, strážci prahů, stavitelé značek, pečovatelé o skryté věci.
⚠ **Napětí k vyřešení:** README dnes jako „rodinné znaky, které se nesmí rozjet“ uvádí spletené vousy, roucho, runu na čele a přívěsek s vlastní runou. To může vést k 25 podobným postavám. Fáze 1 má ověřit, kolik společných znaků stačí (minimum), aby karty držely pohromadě.

### 4.4 Tři vrstvy původu u každého dverga (zavést)

Každé tvrzení v Character Sheetu se označí: **[pramen]** (Dvergatal, próza Eddy — co opravdu říkají), **[odvození]** (co z pramene rozumně plyne), **[naše]** (vymyšleno pro Agndofu). Třetí vrstva smí být bohatá, ale nevydává se za severskou tradici.

### 4.5 Pět kritérií pro posouzení každého ze 25 přiřazení

| Kritérium | Kontrolní otázka |
|---|---|
| Mytologická opora | Existuje doložená postava a co o ní opravdu víme? |
| Shoda s runou | Plyne přiřazení z významu runy, nebo jsme význam přizpůsobili postavě? |
| Čitelnost scény | Vyjádří obraz význam bez dlouhého textu? |
| Originalita | Má postava vlastní identitu, nebo je to další fantasy trpaslík? |
| Použitelnost ve výkladu | Dává obraz k přemýšlení, aniž by vnucoval odpověď? |

Výsledek = tabulka 25 × 5 s **citací** u každého hodnocení (žádná citace = nepočítá se).

## 5. Vrstvy systému (A / B / C) — jen záznam, nic se nestaví

- **A — Rune Deck:** 25 karet, uzavřený systém významů, funguje sám bez rozšíření. **To je jediný skutečný produkt teď.**
- **B — kontextové karty (World Decks / Expansion Scene):** menší sady, které nemění význam runy, ale přidávají otázku „v jakém prostředí/podmínkách/situaci se tento obraz objevuje“ (příklady podkladu: Thresholds, Under the Mountain, The Ties — **jen směry, ne doporučení**). Velikost sady podle role, ne po 25.
  **Rozhodnutí ownera 2026-10-21:** zde se neřeší. Pro vrstvu B má owner připravené místo v **digitálním čtení v Rúnarovi**. Poznámka: to by byl **první dotyk Dverg Tarotu → Rúnar mimo výběr runy** a README to dnes zakazuje („nic odsud nejde do Rúnara“). Pokud se to bude dělat, je potřeba samostatné ownerovo rozhodnutí do DECISIONS (kdo píše, kam to patří, jak se to odlišuje). Dokud není, vrstva B nevzniká.
- **C — metoda čtení:** jedna runa / runa + kontext / rozklad. Nic nenavrhováno.
- Pracovní pravidlo pro B (návrh, neověřeno): základní karta = *jaký obraz runa přináší*; doplňková = *v jakém prostředí se právě objevuje*. Nejdřív ověřit na reálných výkladech, že druhá vrstva přináší nové, a ne opakování.

## 6. Dverg: známý, nebo nový?

Dnes: 13 z kánonu (Mótsognir, Alvíss, Dvalin, Eitri, Alfrigg, Dáinn, Norðri, Suðri, Móberg, Lyngri, Durinn, Þjóðreyrir, Gandálfr — poslední 2–3 s rizikem Tolkien/Gandalf), 12 vymyslených (Straumr, Þyrnir, Varði, Yndi, Hagl, Nauðr, Ársæll, Dulinn, Örvar, Jór, Speki, Lögr). CODE-read navrhl místo vymyšlených **doložená jména z Dvergatalu podle významu** (Wikipedia „List of dwarfs in Norse mythology“ — sekundární): Draupnir, Hepti, Farli, Uni, Frosti, Ónn, Bildr, Fundinn, Hugstari, Vegdrasill, Vitr, Andvari; Blank: Gandálfr nebo Svíurr.
Pracovní shoda: **kombinovaný model** (známé jméno, jen pokud jeho příběh význam runy opravdu podporuje; jinak nová postava). **Rozhodnutí: ownerovo**, nebylo učiněno. Islandské tvary jmen neověřeny. Varování: Alvíss (Ansuz) je doložený, ale jeho příběh končí kamenem při východu slunce = rozsudek; scéna musí ukázat hlas a naslouchání, ne ten konec.

Aett a elementy: v Rúnarovi jsou data (`aett`, `elements`, `world`). **Tady nejsou povinné** (samostatný produkt). Pojmenování ættů po bozích je moderní, ne historické — ověřit, než se použije. „Blank“ je moderní prvek, ne 25. historická runa — říct to otevřeně.

## 7. Plán fáze 1 (návrh; owner řekl „tvůj návrh ano“ 2026-10-21)

1. **Tabulka 25 × 5 kritérií** s rozdělením pramen / odvození / naše (angl.).
2. **Rozdělit** stávající charakteristiky na Character Sheet a Rune Scene.
3. **Tři až čtyři další scény různého typu** vedle hotové Isy: z ownerova návrhu **Uruz–Mótsognir** a **Gebo–Alfrigg**, z mého **Thurisaz** (hlučná/hraniční) a **Dagaz** (okraj světelných run). Gebo = okamžik mezi tím, kdo nabízí, a tím, kdo přijímá, **ne cena**; Isa = zastavení, pod kterým je život.
4. Pro každou scénu **2–3 úhly** a „nejsilnější argument proti“.
5. Rozhodnout minimální rodinné znaky (4.3).
6. **Teprve potom** generování obrázků a test bez textu (ukázat scénu někomu, kdo runu nezná; hledat obraz, který vede k opačnému nebo matoucímu čtení — nehledat přesnou definici).
Výstup fáze 1 = 25 specifikací + 4–5 otestovaných scén, **ne** 25 hotových ilustrací.

## 8. Otevřená rozhodnutí ownera

1. Projít 25 řádků „proč sedí runě“ (README bod 1).
2. Jména: ponechat mé vymyšlené / Dvergatal / mix; Gandálfr, Durinn, Dáinn (Tolkien).
3. Název produktu a formát karty (65 × 100 / 70 × 120 mm; zadní strana = vazebná runa AGNDOFA, soubory dodal).
4. Další postavy (Freya …): ukázat, pak rozhodnout, kam patří.
5. Zda a kdy vrstva B do Rúnarova digitálního čtení (+ zápis do DECISIONS, viz 5).
6. Zda jména dvergů a malba mají být vidět na líci.

## 9. Pravidla pro Coworka na tomhle produktu

- **Cowork je na repu READ-ONLY.** Do repa píše vlastní CODE session s prefixem `[dverg]`; Cowork navrhuje přes soubory (SendUserFile + složka `Claude outputs/`).
- **Nejdřív zjistit, co repo už má** (`dverg-tarot/`, `v2/assets/`, `RUNAR_DESIGN.md`, `RUNAR_POPISY_RUN.md`), a až pak stavět. Dvakrát se mi stalo, že jsem duplikoval (písma, texty, barvy); owner to tvrdě odmítl.
- **Ověřit živě každé tvrzení o repu** (`device_bash`, `git rev-parse --short HEAD` na začátku), nespoléhat na paměť ani na hash z handoffu.
- Z Rúnara se **nic nepřebírá do obsahu** (prompty, texty čtení, `RUNE_IMAGES`, katalog dvergů v `RUNAR_DESIGN.md`) — jen vzhled jako předloha a data run (`RUNES`) jako čtená reference.
- **Vzorce, ne exempláře**; vždy „nejsilnější argument proti“; jedna jasná otázka na rozhodnutí; bez šumu.
- **Islandština** se nepíše bez ověření; jména ve staroseverském/islandském tvaru jsou neověřená, říct to.
- Podklady z internetu (Edda, Gould „Dwarf-Names“, Nationalmuseet) čerpat z primárních nebo odborných zdrojů; odkazy z konverzačních podkladů s `utm_source=chatgpt` a jejich obrázky nejsou zdroj (nebylo ověřeno).

## 10. Co zůstává neověřené z tohoto briefu

- Zdroje o Dvergatalu, Gouldově studii, o ættech a o moderním runovém věštění pocházejí z podkladu od jiného modelu a mé obecné znalosti; **žádný nebyl dnes otevřen a ověřen**.
- Recept scény stojí na dvou webech a znalosti; není to odborná studie.
- IS formy jmen dvergů neověřeny (`is-vazba.py` / `is-grammar-qa.py` nespuštěno).
- Nikdy neproběhl test obrazu na člověku; všechna „bude to fungovat“ jsou hypotézy.

## ZMĚNĚNO:

(prázdné — jen záznam; žádný kód, žádný zápis do repa)

---

## Příloha: návrh instrukcí pro nový projekt/Cowork „Dverg Tarot“

> Pracuješ na Dverg Tarotu (25 dvergů pro 25 run, tarot/oracle karty), samostatném produktu Agndofy. Není to Rúnar. Na začátku si přečti `dverg-tarot/README.md` a poslední `Claude outputs/…DVERG_BRIEF…`. Cowork je na repu READ-ONLY; píše vlastní CODE session s prefixem `[dverg]`. Používej výhradně složku Downloads\Runar-admin, ale sahej jen do `dverg-tarot/`, `v2/assets/` a `RUNAR_DESIGN.md` jako předlohy. Obsah karet vždy anglicky. Pořadí: runa → význam → dverg → scéna. Nejdřív zjisti, co repo už má. Nejsilnější argument proti uveď vždy.

# Kostra Rúnar V4 — pracovní stav 2026-11-26

**Vlastní jen:** jednu základní kostru V4 — co platí pro **runu dne**, **single čtení** a **spready**, co je jen návrh a co je otevřené.
Stále se mění. Podklady a historie: [README.md](README.md). Tenhle soubor jde i ke konzultaci s Gemini, proto je napsaný tak, aby se dal
číst bez repa. Rozhodnutí a jejich důvody: `RUNAR_DECISIONS.md` 2026-11-26 (4), (6), (7), (9), (10).

**Značky:** ✅ rozhodl owner · 🔶 návrh (lab V4 nebo Gemini), čeká na ownera · ❓ otevřené. Čísla 4J, 4K, 4V, 4M, 4R jsou jen pro odkazy.

---

## 1. Co je V4
Rúnar je AI průvodce runami islandské značky Agndofa (islandština primární, angličtina vedlejší). Dnes (v2) píše model každé čtení celé znovu
z losů a vstupů. **V4 mění, kdo text píše:** obraz runy je předem napsaný a ověřený; člověk si vybírá, kterou stránkou (sférou) se na runu
podívá; osobní rovina přichází až v Asku. Rúnar jako postava zůstává.

## 2. Co owner rozhodl (✅)
1. V4 je nový pohled na výklad, ne další verze promptu v2. **Rúnar zůstává**; uvidí se, jestli se bude muset proměnit.
2. **Obrazy jsou úplně nové**, začínáme jedním obrazem pro každou runu. **Rozmanitost je nutná** — čtení téže runy nesmí být stejná.
3. **Sfér má runa tolik, kolik dovolí** — někde víc, někde míň.
4. **Režimy obrazu:** Land (islandská příroda, přednost) a Craft (práce rukou, tradiční materiál). Current (město, technologie) zatím ne.
5. **Na vstupu emoce** (mřížka nebo seznam, je jedno).
6. **Nejdřív single.** Norny (spread) až bude single.
7. **Runa dne:** jedna kratší věta, **obraz i význam v ní**, **třetí osoba** (start), z knihovny bez volání modelu, člověku se neopakuje.
   Obsah runy dne dělá lab V4.
8. **Kenaz bez sféry vředu nebo horečky** (*kaun*). O sféře rozhoduje owner, historický zdroj je jen nápad.
9. **Sféry v Kolekci run** (hlubší vrstva) — napřed ukázka, pak rozhodnutí.
10. Ask: Standard 1, Premium 2 na čtení (config). Ovládne to každý, „i dítě“; u runy je vidět, kterou sféru už člověk otevřel.

## 3. Jádro (platí pro všechno ve V4)
| id | zásada |
|---|---|
| 4J1 | zrcadlo, ne orákulum: nic nepředpovídá |
| 4J2 | žádné tvrzení o člověku (co cítí, ví, prožívá) |
| 4J3 | žádná rada ani rozkaz (*should, must, need to, try to*) |
| 4J4 | každý text nese hmotný obraz runy — i odpověď v Asku |
| 4J5 | těžká runa nikdy útěchu (Hagalaz, Nauthiz, Isa, Thurisaz, Perth, Tiwaz) |
| 4J6 | Rúnarův hlas: věcný, klidný, bez klišé |
| 4J7 | islandština se píše islandsky od začátku a ověřuje nástroji (GreynirCorrect, korpus vazeb); nikdy překlad z angličtiny |
| 4J8 | runa se nevysvětluje slovníkem; člověk se v obrazu pozná sám |
| 4J9 | žádný terapeutický slovník (trauma, healing, inner child, mindset, blocks, toxic) |
| 4J10 | nikdy všechno naráz: co člověk neotevřel, zůstává vidět jako možnost |

## 4. Single čtení

### 4.1 Tok
emoce (volitelná) → tah runy → volba sféry (nebo „Let the rune choose“) → obraz sféry → Ask → uložit (paměť sfér, deník)

### 4.2 Sféry runy (4K0)
- Sféra = stránka runy, kterou jde runu číst (Kenaz: odhalení, tvarování…). **Počet podle runy** ✅. Blank sféry nemá.
- **Test sféry** 🔶: (1) stojí na ownerově popisu runy, nebo ji owner schválí; (2) **záměna** — obraz bez jména runy nesmí slepý soudce
  přiřadit jiné runě; (3) **odlišnost** — dvě sféry téže runy nesdílí jeden mechanismus.
- **Název v UI** 🔶: jedno až dvě konkrétní slova (děj nebo stav), žádné abstraktní pojmy; jen název + značka „otevřeno“.
- **Stav:** žádná runa nemá schválené sféry. Kenaz pracovně: Insight & Clarity · Craft & Shaping · Drive & Friction (Fever & Exposure ✅ pryč).
  Kenaz je **směrované světlo ve tmě** (pochodeň, jiskra, ohniště), které odhalí tvar — tím se liší od Sowilo (slunce, denní jas).

### 4.3 Obraz sféry (4K1)
- **Přísady, ne osnova** 🔶: scéna · mechanika runy · třecí bod (kde síla tlačí nebo co stojí) · dozvuk. Text má **2–4 věty**, délka podle scény;
  pevné pořadí čtyř vět ne (dělalo by šablonu).
- **Odkud** 🔶: jen z předem napsané a ověřené knihovny; model do obrazu nezasahuje. Důvod: islandština — dvě ze čtyř islandských vět od Gemini
  neprošly kontrolou.
- **Varianty** 🔶: 3–5 na sféru, v režimech Land a Craft; liší se osou (děj · detail · vztah dvou věcí), délkou a stavbou věty.
  Počítadlo jako u runy dne: člověk dostane variantu, kterou ještě nečetl.
- **Jazyky** 🔶: jedna předloha scény (co je v obraze · jaká síla působí · kde je třecí bod) → islandský text a anglický text zvlášť.
- **Osoba** ❓: třetí osoba (bez oslovení, islandsky jedna varianta místo tří rodů), nebo místy „you“ jako ve v2 (4R1).

### 4.4 Emoce (4V1)
| řada | volba | hmota v obraze |
|---|---|---|
| tíží | Heavy · Hollow · Foggy | váha · prázdný prostor · mlha |
| napíná | Tense · Restless · Burning | tlak · pohyb bez směru · žár |
| otvírá | Shifting · Hopeful · Light | půda v pohybu · první světlo · výdech |

- Mimo devítku **Skip**. **Conflict** je situace s druhým → čip v Asku. 🔶 (devítku navrhl lab, Gemini doporučuje beze změny; owner neschválil)
- **Emoce vybírá variantu** obrazu podle řady, nepíše text 🔶. Smí vybrat i **kontrast** (přehlíženou stránku), nejen shodu 🔶.
- **Emoci ve čtení nejmenovat** 🔶 (lab i Gemini; owner nerozhodl).
- **Těžká runa + světlá emoce = jasnost pohledu, ne úleva** 🔶.
- **Hollow:** obraz prázdna jako nádoby nebo ticha, nikdy propast nebo pád 🔶. Krize (112) jen z toho, co člověk napíše v Asku; emoce se v čase
  neukládají ani nevyhodnocují 🔶.

### 4.5 Ask (4K5, 4K6)
- **Jediné místo, kde píše model** 🔶; smí oslovit „you“; bez rad; s hmotným obrazem runy.
- Nabídka: 2 připravené otázky ke sféře (princip · stín) · čipy (v práci · s druhým člověkem · uvnitř · životní runa) · volná otázka s nápovědou
  podle runy.
- Odpověď ukáže, **kde hledat**, ne co dělat.

### 4.6 Návrat a paměť
- Otevřená sféra má značku, zůstává klikatelná. Po otevření všech sfér: nová varianta obrazu + v Asku spojení se životní runou 🔶.
- Uložit do deníku s jednou vlastní větou 🔶.

### 4.7 Blank
Bez sfér; ~3 obrazy (nepopsaný kámen, ticho před prvním úderem, sníh bez stopy); emoce vybere variantu; Ask jen 3 čipy 🔶.

### 4.8 Životní runa
V záhlaví čtení, v obrazu ne; aktivní až v Asku 🔶. Věta pro nováčka: islandská verze od Gemini neprošla kontrolou, napíše se znovu.

## 5. Runa dne
| | pravidlo | stav |
|---|---|---|
| forma | jedna věta, kratší (vzory ownera mají 12–16 slov), **obraz i význam** | ✅ |
| osoba | **třetí osoba**; bez „you“ a „today“ | ✅ start |
| obsah | bez rady, rozkazu a předpovědi; nezaměnitelná s jinou runou | ✅ (jádro) |
| stavba | význam nedovysvětlovat („…because…“); střídat stavbu vět; nikdy „X does not Y; it simply Z“ | 🔶 |
| zdroj významu | sféry runy z V4 | 🔶 owner nepotvrdil jako jediný zdroj |
| varianty | sféra × režim (Land, Craft), knihovna, počítadlo | ✅ |
| islandština | psaná islandsky, ověřená; ve třetí osobě jedna varianta místo tří rodů | ✅ (§2) |

**Ownerovy vzory (2026-11-21):** *„Something unexpected may reveal what was never as firmly in place as it seemed.“* · *„A few words, spoken or
heard, may stay with you longer than you expect.“* (Ansuz). Druhý má „you“ — podle bodu 2.7 se píše ve třetí osobě.

**Stav Kenaz:** žádná věta schválená. Návrhy Gemini jsou čistý obraz o 19–20 slovech (proti 2.7), tři ze čtyř jsou láva, jedna je střet lávy
a ledu (spíš Hagalaz). Podrobně: [runa-dne.md](runa-dne.md).

## 6. Spready
- **Norny:** odloženo, až bude single ✅. Zapsaný nápad (Gemini) 🔶: pozice Norny (Urður = co tě utvořilo · Verðandi = co se právě tká ·
  Skuld = kam se kloníš) vybere sféru každé runy sama; emoce jeden filtr pro všechny tři nebo vynechat; jeden Ask na celý rozklad.
  ❓ Co spojí tři runy pro toho, kdo Ask nepoužije?
- **Ostatní výklady:** ve V4 zatím nic; v produkci zůstávají výklady v2.

## 7. Měření
| id | co | jak |
|---|---|---|
| 4M1 | z textu bez jména runy jde poznat runa | slepí soudci (kalibrovaní ve v2) |
| 4M2 | žádné tvrzení o člověku, žádná rada | dva soudci, vada jen při shodě (kalibrovaní ve v2) |
| 4M3 | z textu jde poznat sféra; sféry téže runy se neslévají | slepý soudce: text + seznam sfér runy (nový) |
| 4M4 | emoce je v obrazu cítit, ale nepojmenovaná | stroj + soudce (nový) |
| 4M5 | varianty téže sféry se neopakují | stroj: nejdelší společný úsek |
| 4M6 | islandština | GreynirCorrect + korpus vazeb |
| 4M7 | žádný tik („does not … it simply“, „is not X, it is Y“) | stroj nad knihovnou |

## 8. Otevřené otázky (❓) a návrhy čekající na ownera
1. **4R1** Single: obraz jen ve třetí osobě (jako runa dne), nebo místy „you“?
2. **4R2** Oblast a hledání z v2 (AREA OF LIFE, WHAT ARE YOU SEEKING): pryč úplně, nebo jako čipy v Asku?
3. **4R3** Obraz single čtení jen z ověřené knihovny a model jen v Asku?
4. **4R4** Devět emocí z tabulky 4.4 — schválit, nebo změnit? Emoci ve čtení nejmenovat?
5. **4R5** Kolik variant na sféru na začátek (návrh 3–5)?
6. **4R6** Sféry runy dne = jediný zdroj jejích významů?
7. **4R7** Norny bez Asku: spojovací text od modelu, nebo jen tři obrazy?
8. **4R8** Sféry všech 25 run — kdo navrhne první sadu a podle čeho (ownerovy popisy run)?

## 9. Názory labu V4 (Claude) a co je potřeba pro úpravu — ke konzultaci s Gemini

**Názory:**
1. **Sféry jsou teď hlavní práce.** Bez schválených sfér nejde napsat obraz, emoci ani runu dne. První krok je sada sfér pro pár run různé povahy
   a hned test záměny proti ostatním runám.
2. **Knihovna místo modelu v obrazu** je správně kvůli islandštině: GreynirCorrect odmítl větu o životní runě a i opravenou větu Nauthiz.
3. **Třetí osoba** u runy dne šetří islandštinu (jedna varianta místo tří rodů). U single čtení ale ve v2 nesla most k člověku; čekáme na ownera.
4. **Světlo je u Kenaz kánon** („světlo, které něco odhalí“), vadí jen světlo všude. Odlišit od Sowilo směrovaným světlem ve tmě.
5. **Kulisa se nesmí opakovat:** tři ze čtyř vět Kenaz v lávě se slejí a zabijí rozmanitost i test 4M3.
6. **Historie a runové básně jsou jen zdroj nápadů**, ne podmínka. Rozhoduje ownerův popis runy a jeho slovo.
7. **Fakta o přírodě a islandštinu od modelu nebrat bez kontroly** (obsidián, magma tavící stěny, fumaroly — zatím jen tvrzení).

**Co je potřeba od Gemini (pro úpravu kostry):**
1. **Sféry pro pět run různé povahy:** Kenaz (bez vředu), Isa, Wunjo, Nauthiz, Ansuz. U každé sféry: krátký název (1–2 slova), jedna věta
   mechaniky, **čím se liší od nejbližší jiné runy**. Opřít o ownerovy popisy run (owner je přiloží).
2. **Runa dne Kenaz, Land:** jedna věta na sféru, obraz i význam v jedné větě, třetí osoba, 12–16 slov, každá v jiné kulise (ne dvakrát láva).
   Jen anglicky; islandštinu napíšeme a ověříme my.
3. **Pravidla psaní variant** tak, aby 3–5 variant téže sféry nebylo šablonou — konkrétně, ne obecně.
4. **Ukázka sfér v Kolekci run** (jak by vypadala stránka jedné runy).
5. Kde v této kostře vidíš **rozpor nebo díru**.

**Formát odpovědi:** česky, číslovaně podle oddílu 9 (např. „9.2: …“); u tvrzení o přírodě nebo runách napiš, odkud to víš, nebo „bez zdroje“.

## 10. Vztah ke kostře v2
Kostra v2 (`docs/kostra/`) je napojená na produkční kód; V4 v kódu není, proto **zůstávají oddělené**. V4 si z v2 bere jen odkazem: jádro,
kalibrované soudce (4M1, 4M2) a slova se známým účinkem. Až V4 půjde do produkce, stane se z ní nová verze kostry.

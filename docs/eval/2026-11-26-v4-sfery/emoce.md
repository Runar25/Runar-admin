# Emoce na vstupu V4 — Gemini × naše P10 a návrh (2026-11-26)

**Vlastní jen:** porovnání dvou sad emocí a návrh sady pro V4. Pokus P10 a jeho výsledky vlastní `docs/kostra/pokusy.json`; zdroj Gemini
[zdroj-gemini-architektura.txt](zdroj-gemini-architektura.txt). Owner 2026-11-26: *„celkem je jedno, jestli to bude mřížka, ale budou to emoce“* ·
*„jaké emoce by mohl člověk zanést do čtení … porovnej s našima. Co je jinak a jak to nejlépe udělat?“*

## 1. Co máme
| | naše (P10, od GPT, vloženo 2026-11-23) | Gemini (rozhovor 2026-11) |
|---|---|---|
| otázka | *What feels closest to you right now?* | volba vnitřního stavu z 9, nebo přeskočit |
| volby | Uncertainty · Pressure · Conflict · Loss · Frustration · Hope · Relief · Something is changing · I don't know | jmenuje jen 4 z 9: **Restless** (neklidný, zbrklý) · **Foggy** (zamlžený) · **Heavy** (těžký, unavený) · **Burning** (vyhoření, zlost) |
| co emoce dělá | vybere stránku runy pro větu 3, význam nemění | zabarví větu 1 (atmosféra) a 3 (třecí bod); věty 2 a 4 drží; emoci nepojmenuje |
| zrcadlení × kontrast | obojí zkoušeno (n=4): kontrast u Hagalazu obrátil pohled, zrcadlení jen opakovalo tlak | kontrast jen u „Let the rune choose“ (Heavy + Kenaz → Fever & Exposure) |
| pojmenovat emoci ve čtení | ve 4/4 pojmenována (P10); kostra J2 to dovoluje („co sám zadal“) | zakázáno: stav se ukáže hmotou (váha kladiva, hustý kouř) |

Zbylých 5 voleb Gemini v PDF ani v našich přepisech není (hledáno `najdi_v_konverzacich.js`, PDF). Pokud je máš v rozhovoru s Gemini, doplním.

## 2. Co je jinak
1. **Druh slova:** naše jsou podstatná jména a míchají tři věci — pocit (Hope, Relief, Frustration), situaci (Conflict, Loss, Something is changing)
   a stav vědění (Uncertainty, I don't know). Gemini má přídavná jména tělesného stavu („jak mi je“), ne „co se děje“.
2. **Převod do obrazu:** Gemini má každou volbu přímo v hmotě (váha, mlha, neklid pohybu, žár). To je přesně to, co V4 s emocí dělá (atmosféra
   obrazu). U našich se musí překládat: Conflict nebo Loss nemají jednu fyzikální vlastnost a sváděly by k ději („dva lidé se hádají“).
3. **Valence:** Gemini jmenuje jen těžké stavy. Naše mají i Hope a Relief — člověk nechodí jen v potížích. Bez světlých stavů by V4 četla jen nouzi.
4. **Situace patří jinam:** V4 přesouvá situaci do Asku (čipy Work / With another person / Inside myself). Conflict je situace s druhým → tam.
5. **Pojmenování:** P10 emoci jmenuje, Gemini ne. Nepojmenovat sedí s kostrou K1.5 („napětí nese děj, ne pojmenovaná emoce“).

## 3. Návrh pro V4 (k výběru, neměřeno)
Princip: **emoce = počasí obrazu, ne téma čtení.** Každá volba má jednu fyzikální vlastnost, kterou obraz unese bez pojmenování. Tři řady po třech
(mřížka, nebo seznam — obojí jde):

| řada | volba (EN) | odkud | hmota v obraze (věta 1 a 3) |
|---|---|---|---|
| tíží | **Heavy** | Gemini | váha, pomalost, tah dolů |
| | **Hollow** | naše Loss, změkčené | prázdný prostor, ozvěna, chybějící kus |
| | **Foggy** | Gemini (≈ naše Uncertainty) | mlha, rozmazaný obrys, tlumený zvuk |
| napíná | **Tense** | naše Pressure | tlak, napnutá struna, sevření |
| | **Restless** | Gemini (≈ naše Frustration) | pohyb bez směru, chvění, netrpělivost |
| | **Burning** | Gemini | žár, jiskry, přepálení |
| otvírá | **Shifting** | naše Something is changing | půda v pohybu, tání, odliv |
| | **Hopeful** | naše Hope | první světlo, klíček, rozjasnění |
| | **Light** | naše Relief | povolený tah, výdech, lehkost |

Mimo devítku: **„Skip“** (naše I don't know) — obraz bez zabarvení. **Conflict** do Asku (čip „With another person“).

**Jak s volbou zacházet (návrh):**
1. Vybraná sféra + emoce → emoce zabarví větu 1 a 3 (zrcadlení atmosféry, ne tématu). Emoce se ve čtení nejmenuje.
2. „Let the rune choose“ → emoce vybere sféru v kontrastu (P10: kontrast obrací pohled, zrcadlení opakuje).
3. Těžká runa + světlá emoce nesmí dát útěchu (J5 platí dál); světlá emoce nesmí udělat ze stínové sféry radost.
4. Islandština: slova voleb se vymýšlí islandsky od začátku a ověří nástroji (§2) — ještě nenapsána.

## 4. Co rozhodnout
1. Pojmenovat emoci ve čtení, nebo ne? (P10 ano, Gemini ne; návrh ne.)
2. Devět voleb z tabulky, nebo jinak? (Hollow je nejblíž krizi — pravidlo 112 v charakteru.)
3. Měřit: pokus „kotva × emoce“ (README krok 4), n víc než P10 (tam n=1 na buňku nestačilo).

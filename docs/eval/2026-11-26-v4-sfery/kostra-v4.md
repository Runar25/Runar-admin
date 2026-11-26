# Kostra čtení V4 — návrh (2026-11-26) a srovnání s kostrou v2

**Vlastní jen:** stavbu jednoho single čtení V4 (jádro, části, vstupy, měření, otevřené otázky) a doporučení, jak ji držet vedle kostry v2.
Kostru v2 vlastní `docs/kostra/` (kostra.json → KOSTRA.md); odtud se na ni jen odkazuje id. Značky V4 mají předponu **4** (4J1, 4K2…), aby se
nepletly s kostrou v2. Owner 2026-11-26: *„vytvoř zatím novou kostru a porovnej s naší předešlou … spojovat, nebo nechat odděleně … kostra čistá
bez šumu“* · *„je to úplně jiný pohled na výklad … koukat z nového pohledu“* · *„Rúnar zůstává“*.

## 1. Tok čtení
emoce (volitelná) → tah runy → volba sféry (nebo „Let the rune choose“) → obraz sféry → Ask (dveře, čipy, volná otázka) → uložit (paměť sfér, deník)

## 2. Jádro
| id | zásada | odkud |
|---|---|---|
| 4J1 | zrcadlo, ne orákulum | = J1 v2 |
| 4J2 | bez tvrzení o člověku | = J2 v2 |
| 4J3 | bez rady a rozkazu (ani *should, must, need to, try to*) | = J3 v2, rozšířeno (Gemini) |
| 4J4 | každý text nese hmotný obraz runy — i odpověď v Asku | Gemini; v2 J4 jen pro čtení |
| 4J5 | těžká runa nikdy útěchu | = J5 v2 |
| 4J6 | Rúnar zůstává — hlas věcný, klidný, bez klišé | = J6 v2; owner 2026-11-26 |
| 4J7 | islandština islandsky od začátku, ověřená nástroji | = J7 v2 |
| 4J8 | runa se nevysvětluje slovníkem; obraz nechá člověka, ať se pozná sám | Gemini (projekce) |
| 4J9 | žádný terapeutický slovník | Gemini |
| 4J10 | nikdy všechno naráz: co člověk neotevřel, zůstává vidět jako možnost | owner (s. 10) |

## 3. Části
| id | část | práce | z čeho | stav |
|---|---|---|---|---|
| 4K0 | **sféry runy** | čočky, kterými jde runa číst; tolik, kolik runa dovolí | význam runy (světlá strana: aspekty v2, stínová: nové) | owner: *„sfér bude tolik, kolik runa dovolí“*; sady nenapsané |
| 4K1 | **obraz sféry** | hmotný obraz, ve kterém je síla runy vidět; člověk se v něm pozná | nový obraz (ne banka v2) | owner: *„obrazy budou úplně nové … začneme s jedním pro každou runu“* |
| 4K2 | **mechanika** | zákon runy v té sféře — platí stejně, ať se člověk cítí jakkoli | runa × sféra | Gemini věta 2 |
| 4K3 | **třecí bod** | kde síla runy tlačí nebo co stojí; sem dosedne emoce | sféra × emoce | Gemini věta 3 |
| 4K4 | **dozvuk** | nechá ticho; ne otázka | sféra | Gemini věta 4 |
| 4K5 | **dveře Asku** | 2 otázky ke sféře (princip · stín) + čipy (práce · druhý člověk · uvnitř · životní runa) + volná otázka s nápovědou podle runy | sféra, runa | Ask 1 / 2 na tier (config) |
| 4K6 | **odraz** | odpověď v Asku: fyzika runy přeložená do materiálu člověka; ukáže, kde hledat (ven × dovnitř) | otázka člověka × runa | Gemini |

Počet a pořadí 4K1–4K4 je návrh Gemini (4 věty); owner chce pestřejší → pevná stavba vět je otevřená (4R3).

## 4. Vstupy
| id | vstup | kdo | míří do |
|---|---|---|---|
| 4V1 | emoce (devět, [emoce.md](emoce.md)) | člověk | 4K1 atmosféra, 4K3; u „Let the rune choose“ výběr sféry |
| 4V2 | runa | tah | vše |
| 4V3 | sféra | člověk nebo kontrast k emoci | 4K1–4K5 |
| 4V4 | minulé sféry té runy | data člověka | nabídka sfér (paměť) |
| 4V5 | otázka / čip v Asku | člověk | 4K6 |
| 4V6 | životní runa | data člověka | jen 4K5–4K6 |
| 4V7 | režim obrazu: Land (islandská příroda) · Craft (práce rukou: výheň, dřevo, vlna, nůž, loď, provaz) | člověk nebo výchozí Land | 4K1 |
| 4V8 | jméno, jazyk, rod oslovení | člověk | jako v2 |

Ve V4 **nejsou** vstupy v2 V1 oblast, V2 co hledá, V3 pro kdy, V4 úhel otevření, V5 banka obrazů, V9 sloveso esence (předpoklad Gemini;
oblast a hledání → 4R2).

## 5. Měření
| id | co | jak | odkud |
|---|---|---|---|
| 4M1 | z textu bez jména runy jde poznat runa (nezaměnitelnost) | soudci runy | = M3 v2, kalibrováno |
| 4M2 | žádné tvrzení o člověku, žádná rada | soudci tvrzení | = M5 v2, kalibrováno |
| 4M3 | z textu jde poznat sféra (sféry téže runy se neslévají) | slepý soudce: text + seznam sfér runy | nové, nekalibrováno |
| 4M4 | emoce je v obraze cítit, ale nepojmenovaná | stroj (slovo emoce) + soudce | nové |
| 4M5 | dva texty téže runy a sféry se neopakují | stroj: nejdelší společný úsek | jako M2 v2 |
| 4M6 | islandština | Greynir, korpus vazeb | §2 |

## 6. Otevřené (rozhoduje owner)
- **4R1** osoba: obraz ve třetí osobě, nebo s člověkem („you“)? (v2 K1.6 × Gemini)
- **4R2** oblast a hledání: pryč, nebo do Asku jako čipy?
- **4R3** stavba textu: pevné 4 části, nebo pestřejší (owner)?
- **4R4** pojmenovat emoci? ([emoce.md](emoce.md))
- **4R5** pestrost: kolik obrazů na runu × sféru, aby se čtení neopakovalo?
- **4R6** Norny ve V4 (owner: *„ze spreadu jsme se bavili o Nornách“*)
- ~~**4R7** čočky Land / Craft / Current — test, nebo jen Land?~~ → owner 2026-11-26: Land a Craft, Current zatím ne ([runa-dne.md](runa-dne.md))
- **4R8** runy ven × dovnitř — ověřit proti ownerovým popisům run

## 7. Srovnání s kostrou v2 a doporučení: **nechat odděleně**
| | kostra v2 (`docs/kostra/`) | kostra V4 |
|---|---|---|
| kdo píše text | model pokaždé celé čtení z losů a vstupů | pevný obraz runy × sféry, model zasahuje (emoce, Ask) |
| jednotka | věta čtení (K1–K6) | runa × sféra |
| vstupy | 12, polovina od člověka (oblast, hledání, kdy) | emoce, sféra, otázka v Asku |
| obraz | banka 190 krátkých obrazů + úhel z losu | nové obrazy, delší, na sféru |
| napojení na kód | `verify_kostra.js`: každý kus produkčního promptu musí mít místo | v kódu nic není |
| pokusy | P01–P21 na slotech v2 | žádné |

**Proč odděleně:**
1. Kostra v2 je napojená na produkční kód — kontrola chce, aby každý kus promptu v2 měl místo. V4 v kódu není; vložená do `kostra.json` by
   kontrolu buď rozbila, nebo by se její části musely tvářit jako sloty v2.
2. Většina částí a vstupů v2 ve V4 není (oblast, hledání, úhel, banka, sloveso esence) a naopak (sféra, emoce jako atmosféra, dveře Asku).
   Spojení by v obou nechalo šum.
3. Pokusy P01–P21 měří sloty v2; ve V4 by se četly jako platné, i když se netýkají.

**Jak brát z v2 jen to, co se hodí (bez kopií):** V4 odkazuje id — převzato **J1 J2 J3 J5 J6 J7**, kalibrovaní soudci **M3 M5**, slova se
známým účinkem **S10–S15** (obecná pro model, ne pro sloty v2; hlídač API je ukáže sám). Nový nález z V4 se zapíše sem; do kostry v2 jen tehdy,
když platí i pro v2. **Až V4 půjde do produkce,** stane se z ní nová verze v `kostra.json` (pole `verze`) a v2 se přesune do oddílu C.

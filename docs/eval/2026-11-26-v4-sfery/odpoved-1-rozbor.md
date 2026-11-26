# Rozbor odpovědi Gemini 1 (2026-11-26)

**Vlastní jen:** posouzení [zdroj-gemini-odpoved-1.md](zdroj-gemini-odpoved-1.md) bod po bodu — co sedí s rozhodnutími ownera a kánonem, co ne,
a co z toho navrhuju do [kostra-v4.md](kostra-v4.md). Kostru zatím **neměním**; změny čekají na ownera. Bez API; islandštinu nešlo ověřit
(GreynirCorrect na tomto počítači není nainstalovaný).

## 1. Moje oprava vlastního podkladu
1. **Zdroj není měřítko.** V podkladu (pro-gemini-1 3.7, otázka 6) jsem psal „bez zdroje nepoužijeme“. To jde proti ownerovi: historie je
   zdroj nápadů, ne mez; nové významy schvaluje owner (paměť `vyznamy-run-historie-jen-zdroj`, owner 2026-11-02, 2026-11-03). Správně:
   sféru schvaluje **owner**; zdroj je jen nápad. Totéž platí proti Gemini 4.10.1 (níž).
2. **Světlo u Kenaz je kánon.** Ownerův popis začíná *„Kenaz je světlo, které něco odhalí“* (RUNAR_POPISY_RUN.md). Owner neodmítl světlo,
   ale světlo **všude** (u variant runy dne). Gemini 3.5 chce Kenaz od světla odvést — to by šlo proti popisu runy.

## 2. Co sedí a navrhuju převzít
| bod | co | proč sedí |
|---|---|---|
| 3.3, 5.10.2 | pevné 4 věty pryč; 4K1–4K4 jen **přísady**, text 2–4 věty, délka podle scény | owner: pestřejší |
| 3.11, 5.10.1, 5.3 | **obraz čtení jen z ověřené knihovny, model píše jen v Asku** | §2 (islandština ověřená dřív, než ji kdo uvidí); vzor runa dne (DECISIONS 2026-11-17 (1)) |
| 5.10.3 | emoce **vybírá variantu** podle řady (tíží / napíná / otvírá), nepíše text | jinak 756 textů; P10 ukázal malý účinek i u modelu |
| 3.10 | kontrast i u zvolené sféry, ne jen u „Let the rune choose“ | P10: kontrast obrátil pohled, zrcadlení opakovalo |
| 4.3 | těžká runa + světlá emoce = **jasnost pohledu, ne úleva** | J5 |
| 4.5, 5.5 | emoci ve čtení **nepojmenovat** | K1.5 v2 („napětí nese děj, ne pojmenovaná emoce“) |
| 4.1 | varianty sféry se liší osou: děj · detail · vztah dvou prvků | rozmanitost (owner) |
| 5.9 | **jedna předloha scény → islandština i angličtina zvlášť**, ne překlad | §2; ve v2 už to tak děláme (EVAL_LOG 2026-09-18 bod 7) |
| 3.4 | kontrola knihovny na „does not X; it simply Y“ / „is not X, it is Y“ | kontrola nad hotovými texty, ne zákaz v promptu (zákaz slovo vyvolá — slovo S12) |
| 3.8, 3.9, 5.4 | sféry podle runy; naše devítka + Skip beze změny | owner |
| 4.7 | Blank: bez sfér, ~3 obrazy, emoce volí, 3 čipy Asku | — |
| 3.6 | obsidián patří spíš Hagalaz, gejzír Perth nebo Uruz | potvrzuje naši kontrolu |

**Vedlejší zisk třetí osoby, který Gemini neuvedl:** islandský text bez oslovení nemá rod. Runa dne dnes drží každou islandskou variantu
**třikrát** (tři rody oslovení, DECISIONS 2026-11-17 (1)); obraz ve třetí osobě jednou.

## 3. Co nesedí nebo je potřeba ověřit
1. **3.1, 5.1, 5.2 — most = volba sféry.** Je to argument, ne měření. Ve v2 owner 2026-11-24 rozhodl, že „you“ zůstává tam, kde ho dá úhel
   (K1.6). Pro V4 rozhoduje owner (4R1, 4R2).
2. **3.5 — Old English Rune Poem.** Báseň u *cen* mluví o pochodni: každý ji zná podle ohně, je jasná a světlá a nejčastěji hoří tam, kde <!-- doc-values:ok 2026-11-26: „Rune Poem“ = runová báseň, ne tier -->
   uvnitř odpočívají urození. „Řemeslná dovednost“ a „znalost“ v ní nejsou, je to moderní výklad (neověřeno proti vydání). A jak je výš:
   odvést Kenaz od světla jde proti ownerovu popisu.
3. **3.5 × 4.9 — rozpor u Gemini.** V 3.5 chce Kenaz bez světla, ve 4.9 navrhne názvy sfér *Light & Sight* a *Heat & Work*.
4. **3.7, 5.6 — *kaun*.** Věcně: norská a islandská runová báseň mají *kaun* (vřed); vydání Dickins 1915 existuje. Citace norské básně
   má ale chybu ve druhém půlverši (podle mého čtení *„bǫl gørver nán fǫlvan“*, ne *„gøyr gørvir“*) — neověřeno proti vydání. Podle bodu 1.1
   o tom ale nerozhoduje zdroj: **jestli Kenaz dostane sféru vředu nebo horečky, rozhodne owner.**
5. **4.10.1 — „bez historického kořene neprojde“.** Jde proti ownerovi (bod 1.1) a vyřadilo by moderní významy, které owner chce. Návrh:
   (1) sféra stojí na ownerově popisu runy, nebo ji owner schválí; (2) test záměny; (3) test odlišnosti uvnitř runy.
6. **5.4 — „zbylých 5 emocí“: Sharp, Tense, Hollow, Grounded, Torn.** Tense a Hollow jsou slova z **našeho** podkladu a Grounded je klidný
   stav, takže to nesedí s jeho 3.9 („můj výčet byl jen těžký“). Nejspíš je dovymyslel (neověřeno). Na výsledek to vliv nemá, Gemini
   doporučuje naši devítku. Ověřit jde jen v původním rozhovoru s Gemini.
7. **5.7 — Nauthiz.**
   - Oheň nouze (*nauðeld*) **v runových básních není** (norská: nouze nechá málo volby, nahý mrzne; islandská: trápení, těžký úděl,
     namáhavá práce — neověřeno proti vydání). Je to lidová tradice. Jako nápad je dobrý, ale zdroj má přiřazený špatně.
   - Sféra **Endurance** (kámen v proudu) se kryje s Eihwazem (aspekty *resilience, endurance* v bance v2) a s Isou.
   - Sedí s ownerovým popisem: Nauthiz = *„pocit, že něco chybí … potřeba, omezení, nedostatek a nutnost“* → Scarcity & Constraint ano.
   - Gemini v islandské ukázce sám našel dvě chyby v rodě („tveir þurrir … nuddaðir“ → „tvær þurrar … nuddaðar“). Opravenou větu jsem
     nástrojem neověřil. Islandštinu od modelu bez kontroly nelze brát.
8. **4.2, 5.8 — Norny.** Tři obrazy z knihovny a jeden Ask na celý rozklad. Co spojí tři runy pro toho, kdo Ask nepoužije (Standard má 1)?
   Ve v2 je spojuje model. Buď V4 Norny potřebují model i mimo Ask (pak islandština od modelu), nebo jsou bez spojení.
9. **4.4 — „opakovaná volba Hollow“ jako signál krize** znamená ukládat a vyhodnocovat stavy člověka v čase → RUNAR_PRIVACY (emoce jako
   osobní údaj už je v riziku P10). Textové pravidlo pro Hollow (prázdno jako nádoba, ne propast) sedí.
10. **4.8 — věta o životní runě.** *Lífsrún* sedí s appkou. *„festan sem dregna rúnin hreyfist gagnvart“* neověřeno (nástroj chybí). EN věta
    „baseline weight you carry“ je v UI, tam „you“ smí.
11. **5.3 — počet textů.** 24 × 3,5 × 4 ≈ 336 je **jeden jazyk**. S islandštinou ~670 textů a každý islandský projde kontrolou nástroji.

## 4. Návrh změn kostry V4 (čeká na ownera)
1. 4K1–4K4 = přísady; text 2–4 věty; délka podle scény.
2. Obraz čtení jen z ověřené knihovny; model jen v Asku (4K5, 4K6).
3. 4V1 emoce = výběr varianty podle řady, kontrast smí i u zvolené sféry; nepojmenovat; těžká runa + světlá emoce = jasnost.
4. Varianty sféry: 3–5, osy děj / detail / vztah, Land i Craft; počítadlo jako u runy dne.
5. Předloha scény → IS a EN zvlášť.
6. Test sféry: popis ownera nebo jeho schválení · záměna · odlišnost uvnitř runy.
7. Blank podle 4.7.
8. Kontrola knihovny na „does not … it simply“.
9. Norny: otevřené (bod 3.8).

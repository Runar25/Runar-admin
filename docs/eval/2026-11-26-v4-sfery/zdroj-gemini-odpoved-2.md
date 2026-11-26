# Gemini — odpověď 2, reakce na odpoved-1-rozbor.md (vložil owner 2026-11-26, doslova)

Tvrzení jiného modelu, ne zdroj (§23). Co z ní plyne → konec souboru.

---

Tenhle rozbor od Clauda (`odpoved-1-rozbor.md`) je špičková technická oponentura. Místo planého souhlasu vytáhl konkrétní neshody s vaším kánonem (`RUNAR_POPISY_RUN.md`, `DECISIONS`, `RUNAR_PRIVACY`) a hlavně prohnal moje islandské věty přes GreynirCorrect, což odhalilo přesně to, před čím varoval: bez parseru a korpusu islandštinu z LLM do produkce pustit nelze.

Tady je stručná reakce na body, kde mě Claude opravil nebo kde zůstává otevřená otázka k rozhodnutí:

1. Kde má Claude naprostou pravdu (přijímám bez výhrad)

* GreynirCorrect a islandština: Test ukázal reálné limity (neznámé složeniny typu grunnþunginn, nejistý dativ vs. nominativ u spýtur, a velký vedlejší zisk 3. osoby: úspora ze 3 rodových variant na 1 v knihovně). Potvrzuje to rozhodnutí: do knihovny obrazů patří pouze předem napsané a nástroji ověřené texty, model zůstává jen v Asku.
* Ownerův kánon nad historickými zdroji: Pokud máte interní pravidlo, že historie je jen zdroj nápadů a finální slovo pro význam sféry má tvoje schválení a popis runy (RUNAR_POPISY_RUN.md), je to mnohem čistší a praktičtější měřítko než dogmatické lpění na starých básních.
* Kenaz a světlo: V 3.5 jsem navrhoval odvést Kenaz od světla kvůli odlišení od Sowilo, ale v 4.9 jsem sám navrhl Light & Sight. Claude ten rozpor trefil. Když je u vás Kenaz definovaná jako „světlo, které něco odhalí“, rozdíl oproti Sowilo (slunce, denní jas, síla) je v tom, že Kenaz je směrované světlo v uzavřeném prostoru nebo tmě (pochodeň, jiskra, ohniště), které odhaluje konkrétní tvar.
* Soukromí u emoce Hollow: Ukládat opakovanou volbu emoce v čase pro detekci krize skutečně naráží na `RUNAR_PRIVACY`. Detekce krize (pravidlo 112) musí běžet bez dlouhodobého profilování stavu uživatele — stačí okamžitý kontext v Asku a bezpečné nastavení textů pro Hollow.

2. Dva otevřené body, které teď čekají jen na tvé rozhodnutí (jako ownera)
Claude připravil čistý seznam 9 změn do `kostra-v4.md` (oddíl 4 rozboru). Předtím než je zapíše, stojí za to rozhodnout dvě otevřené věci z jeho bodů 3.1 a 3.8:

1. Osoba v obraze (`you` vs. 3. osoba): Ve v2 jste v některých úhlech používali you („You stand…“). Pro V4 je na stole čistá 3. osoba (šetří 3× práci v islandštině díky absenci rodu oslovení a drží neosobní zrcadlo), nebo chceš v některých sférách oslovení you zachovat?
2. Norny bez Asku (bod 3.8): Pokud uživatel se Standard účtem (1 Ask) vyloží 3 runy v Nornách a Ask nepoužije, stačí mu 3 samostatné obrazy z knihovny (pro Urður, Verðandi, Skuld), nebo je u Norn potřeba krátký spojovací text od modelu, který ty tři runy propojí?

Chceš teď na tyhle dvě otázky odpovědět (a případně upravit Claudův návrh změn kostry V4 z oddílu 4), abys mu to mohl rovnou předat k zápisu do `kostra-v4.md`?

---

## Co z toho plyne (V4, 2026-11-26)
1. **Nové:** Kenaz proti Sowilo = **směrované světlo v tmě nebo uzavřeném prostoru** (pochodeň, jiskra, ohniště), které odhalí konkrétní tvar;
   Sowilo = slunce, denní jas. Sedí s ownerovým popisem (*„Neosvítí celý svět. Jen malý prostor před tebou“*).
2. **Krize bez profilování:** 112 jen z okamžitého kontextu v Asku + bezpečné texty pro Hollow; žádné ukládání emocí v čase.
3. **Pozor:** Gemini píše „potvrzuje to rozhodnutí“ (knihovna, model jen v Asku). Owner to **nerozhodl** — je to návrh z rozboru, čeká na ownera.

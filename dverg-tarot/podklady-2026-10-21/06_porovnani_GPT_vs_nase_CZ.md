# Porovnání: text od GPT × to, co už máme · 2026-10-21

Porovnáno: `05_GPT_world_decks_a_metody_v0.md` × zadání (oddíl 5 „Vrstvy A/B/C") × `dverg-tarot/README.md` × složka `docs/inbox/rune-cards/` (karty ke stažení).

## Závěr v pěti větách
1. GPT neříká nic zásadně jiného než zadání. Vrstvy A/B/C a tři World Decky jsou v zadání už zapsané jako „jen směry, ne doporučení". GPT je jen rozepsal.
2. Jediná skutečně nová věc: **každá karta má mít tři vrstvy: obraz, krátký text a otázku pro čtenáře**, aby šla číst bez aplikace. Tohle nám chybí.
3. Druhá nová věc: tištěná příručka, která učí způsoby rozkládání.
4. Dvě věci jdou proti dnešním pravidlům a potřebují tvoje rozhodnutí (viz níže): Rúnar jako vypravěč kombinace a zadní strana karty.
5. Pořadí práce se nemění: **nejdřív jedna hotová karta vrstvy A, potom zbytek.** GPT sám začíná Fehu.

## Co sedí (shoda)
| GPT | Co máme |
|---|---|
| A. Rune Deck, 25 run, každá s dvergem a scénou | README + zadání: 25 karet, dverg v situaci, která vystihuje runu |
| B. World Decks: Thresholds, Under the Mountain, The Ties | Zadání § 5: stejné tři názvy, jako směry |
| C. Metody: One Rune, Rune + World, Three Images | Zadání § 5: „jedna runa / runa + kontext / rozklad", nic nenavrženo |
| Příroda Islandu je společné prostředí, ne balíček | Už děláme: každá scéna v 02b a 03 má islandské prvky |
| Karty musí dávat smysl i bez Rúnara | README: kdo chce, čte si sám; Rúnar je volitelný |
| Hlavní princip: runa = obraz, World = kontext | Zadání § 5, pracovní pravidlo pro B |

## Co je nové (u nás chybí)
1. **Text a otázka na kartě.** Naše scény řeší jen obraz. V obrázku nemá být žádný text (pravidlo ze zadání), takže text přijde do rozvržení karty zvlášť, ne z generátoru. Karty ke stažení už mají klíčová slova a řádek svět · živel · áttr, chybí otázka.
2. **Tištěná příručka** s vysvětlením metod.
3. **Pravidlo pro dvojice:** Rúnar nemá slepit dvě slovníkové definice, ale pracovat s obrazy a tím, co vedle sebe ukazují. Metoda 3 bez příčiny, následku a předpovědi.
4. **Konkrétní první prototyp:** Fehu + po jedné kartě z každého World Decku + jednostránkový návod + ukázka výkladu od Rúnara.

## Co se bije (rozhodneš ty)
1. **Rúnar vypráví kombinaci run + World karta.** To je podle zadání § 5 první dotyk Dverg Tarotu s Rúnarem mimo výběr runy a README to dnes zakazuje. Bez tvého zápisu do DECISIONS to nevznikne. Totéž platí pro bod 6 GPT prototypu.
2. **Zadní strana.** GPT píše o geometrickém rubu celé sady. README říká, že zadní strana je vazebná runa AGNDOFA. Pravděpodobně jde o totéž, ale ověřené to není. Obrázek, který GPT viděl, jsem neviděl.
3. **Geometrický tmavo-zlatý design × ilustrovaný dverg.** GPT navrhuje nechat obě vrstvy. Karty ke stažení jsou zlatá runa na tmavém podkladu. Otázka je, jestli se to stane rámem kolem scény s dvergem, nebo zůstane jako samostatný produkt. Rozhodnutí o vzhledu je tvoje.
4. **Pořadí.** Zadání říká, že B se nejdřív ověří na reálných výkladech, zda přináší nové a ne opakování. GPT to navrhuje ověřit prototypem. To je v pořádku, ale B zatím nic nestavíme.
5. **Nejasnost:** mají World karty obsahovat dverga, nebo jen prostředí a situaci? Z GPT textu to nepoznám.

## Co z toho plyne pro práci s runami
- Karta runy = obraz (dverg ve scéně) + krátký text + otázka. Obraz máme rozpracovaný, text a otázku ne.
- Pro jednu hotovou kartu zbývá: schválit prompt, vygenerovat obraz, napsat text a otázku, složit rozvržení.
- Navrhuju **začít jednou kartou, ne systémem**: Fehu (jak GPT). Všechny ostatní otázky se pak ukážou na reálném výsledku.

## Poznámka k mým dvěma otázkám
Obě jsem měl položit až po prvních obrázcích, ne předem. Beru je zpět. Pravidlo „dvergové nestojí na plném slunci" je v `RUNAR_DESIGN.md` jako popis Rúnarovy rodiny a v zadání u příběhu Alvísse. Nikdo ho nepotvrdil jako pravidlo sady, takže ho pouze hlídám při čtení výsledků. Špatné runy v obrázcích řešíme, až je uvidíme.

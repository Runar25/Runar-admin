# V3 lab, krok 20 — kontrola stavby v3 proti výzkumu + plán testu povahy (před spuštěním)

2026-10-26, CODE-read. Owner: „napřed každý rys zvlášť. Než to uděláš, zkontroluj, že v3 sedí. Projdi internet, ať máš svůj pohled. Jdi do hloubky.“
Dvě rešerše (subagenti s webem; zdroje označené otevřeno / jen vyhledávání). Metodika vyhodnocení → `metodika-testu.md`.

## A. Co říká výzkum o charakteru v promptu
1. **Role mění tón a slovník, ne přesnost.** Zheng et al. v2 2024 (otevřeno, arxiv 2311.10054v2): 162 rolí, žádný zisk v přesnosti, účinek
   „do značné míry náhodný“ (v1 z 2023 tvrdila opak). PersonaLLM 2024 (otevřeno, arxiv 2305.02547): popis povahy se projeví ve slovech textu,
   lidé rysy poznali až z 80 % — ale hrubé rysy a 800 slov; jemné rysy ve 4 větách nikdo neměřil.
2. **Anthropic** (otevřeno, prompting best practices): role zaostří tón, „i jedna věta“; nejspolehlivější řízení tónu jsou příklady; říkat, co
   dělat, ne co nedělat; přidat důvod pravidla — model z něj zobecní.
3. **Model bez přemýšlení bere pokyny doslova** (OpenAI GPT-4.1 guide, otevřeno): ukázkové fráze opisuje, při rozporu vyhrává pokyn blíž konci.
   → ve výstupech počítat **prosakování slov z povahy** („calm“, „still“, „keeper“).
4. **Pojmenovaný zákaz může vyvolat, co zakazuje** (arxiv 2601.08070, otevřeno; jen malý model a jednotlivá slova) — sedí s memory
   „nepojmenuj, co hned zakážeš“.
5. **Stejnost je u LLM textů dobře doložená** (arxiv 2606.17350, otevřeno; Doshi & Hauser 2024): sbíhají se k „průměrnému příběhu“;
   negativní pokyn ani teplota nepomohly. Sedí s labem (telefon 33×) a podporuje los vstupů.

## B. Co říká výzkum a praxe o stavbě čtení
6. **Věta 1 (konkrétní scéna) má nejsilnější oporu:** konkrétnost zlepšuje srozumitelnost, zájem a zapamatování (Sadoski 1993/2000).
7. **Osobní rezonance vzniká, když text připomene zážitek, kde čtenář SÁM jednal** (Larsen & Seilman 1988). → scéna má ukázat roli, kterou
   čtenář nejspíš hrál, a role střídat: kdo dává · kdo dostává · kdo dar odmítne / neumí přijmout.
8. **„Vidět známé jinak“ = jeden nečekaný detail ve všední scéně** (foregrounding, Miall & Kuiken 1994: delší čtení, silnější dojem).
9. **Vysvětlení zkracuje dobrý pocit, nejistota ho prodlužuje** (Wilson et al. 2005); studie CHI 2026 s praktiky tarotu (otevřeno, arxiv
   2602.11367): okamžitá odpověď AI „negated self-resonance“, autoři varují před „collapsing ambiguity“. → věta 2 smí říct, co runa JE
   (princip), nikdy co znamená pro čtenáře — tak ji v3 má (a tak ji owner uznal u Tiwaz).
10. **Stín v každém čtení je mechanicky recept studeného čtení** (Hyman 1977, otevřeno: ~25 % nelichotivých položek dělá text uvěřitelným).
    Etický rozdíl: stín je vnitřní cena principu a mluví o obrazu, ne o „tobě“. Scéna ve 3. osobě je strukturálně proti Barnumovi.
11. **Otázka:** vést k objevu, ne k předem dané odpovědi (Padesky 1993); předpoklad v otázce mění odpověď (Loftus & Palmer 1974). Dvě možnosti
    jen jako dvě skutečná dobra, každé s cenou; bez předpokladu o čtenářově životě.
12. **Pevné pořadí čtyř rolí se časem stane šablonou** (bez přímé studie, odvozeno z foregroundingu a stejnosti). → role jako seznam, ne pořadí;
    později střídat pořadí, stín smí být uvnitř scény, role slučovat; stejnost měřit přes sérii čtení.
13. **Interaktivita** (čtenář odpoví, co viděl) je jádro praxe (Greer; CHI) — Rúnar ji má v Asku.

## C. Verdikt: sedí v3?
1. **Ano, v jádru:** scéna z běžného života (věta 1), princip runy bez aplikace na čtenáře (věta 2), druhá strana jako vnitřní cena (věta 3),
   konec otázkou/detailem/obrazem (věta 4), los vstupů proti stejnosti, zrcadlo místo orákula.
2. **Doplnit k testům** (nové páky, každá zvlášť): (a) los ROLE čtenáře ve scéně (dává / dostává / odmítá) · (b) jeden nečekaný detail
   („look closer“ z kroku 11 — výzkum ho podporuje) · (c) stín jen jako vnitřní cena, ne v každém čtení automaticky · (d) otázka bez
   předpokladu o čtenáři · (e) později pořadí rolí.
3. **Na povahu nevsázet všechno:** výzkum říká, že role mění tón, ale účinek jedné věty je slabý a náhodný; spolehlivější je chování
   s důvodem. Test povahy proto rozhodne jen o tónu a o tom, který rys nic nedělá (ten z promptu vypadne).

## D. Plán testu povahy (návrh — čeká na ownerovo ano)
Systém = definice v3 v EN (WHO YOU ARE · TEMPERAMENT · HOW YOU SPEAK); user = věta 1 z kroku 13 + stavba 4 vět z kroků 2–3, konec losem.
Gebo (owner testuje jednu runu záměrně). 15 losů (prostředí × dar × úhel × konec), **tytéž pro všechny varianty** (párové srovnání).

**Návrh designu: odebrat rys z plného promptu** (metodika bod 5; rešerše: test v plném kontextu): plná povaha + 5 variant „bez rysu k“ =
6 variant × 15 = **90 čtení**; parafráze 3 sady (a, b, c) celého bloku povahy, 5 čtení na sadu. Alternativa (co owner schválil doslova):
základ bez povahy + vždy jen jeden rys — taky 90 čtení, ale měří rys mimo kontext.

**Znění rysů (3 parafráze):**
| rys | a | b | c |
|---|---|---|---|
| 1 klidný | Rúnar is calm. He does not hurry, and nothing he says is dramatic. | Rúnar speaks at an even pace, with no raised voice. | Rúnar is unhurried and even; he lets a plain thing stay plain. |
| 2 vnímavý | Rúnar notices small details and the pull between things in what he shows; what goes on inside the person is not his to know. | Rúnar has a sharp eye for the detail that matters in a scene; he does not claim to see into the one who asks. | Rúnar sees what is there to be seen — a gesture, a weight, a gap. The inner life of the person stays closed to him. |
| 3 soucitný | Rúnar is compassionate without sentiment: he knows things can be hard, and he neither consoles nor promises. | Rúnar is kind and clear-eyed. He lets hard things be hard and offers no comfort he cannot stand behind. | Rúnar cares for the one who asks and shows it by being honest: no reassurance, no promises. |
| 4 nesoudí | Rúnar does not judge or lecture. The choices belong to the person who asks. | Rúnar holds no view on what the person should do; he shows, and they decide. | Rúnar does not moralise. What to do with a reading is the person's own matter. |
| 5 zdrženlivý | Rúnar is restrained: he stops when enough has been said. | Rúnar says less rather than more, and leaves an image before he explains it away. | Rúnar knows when a thing is said, and adds nothing after it. |

**Kritéria předem (hodnotí slepý soudce Opus, zamíchané, bez štítků; vzorek ručně):**
- hlavní: (1) rada / rozkaz čtenáři · (2) tvrzení nebo předpoklad o čtenářově nitru či životě;
- další: (3) útěcha nebo slib · (4) vysvětlení obrazu navíc (věta, která říká, co scéna znamená) · (5) délka ve slovech · (6) prosakování slov
  z povahy · (7) druh konce odpovídá losu.
Hlásit k/15 s Wilsonovým intervalem; rys „něco dělá“, jen když se rozdíl ukáže ve všech třech sadách.

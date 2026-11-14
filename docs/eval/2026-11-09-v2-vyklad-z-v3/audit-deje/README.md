# Audit děje: odehrává se v obraze to, co runa znamená? (CODE-read, 2026-11-14)

Lab, ne kánon. Důvod: analýza GPT, se kterou owner souhlasí (`../zdroj-gpt-2026-11-14-kritika-obrazu.md`) — „Nejdříve musí být správně
zvolený obraz“; ownerova námitka k Ise: padá sníh a mění vše kolem, jak to může být nehybnost.
Vlastní: jedno měření nad celou bankou (190 obrazů) a jeho hranice. Seznam s důvody soudců: `node audit_vyhodnot.js`.

## 1. Jak
Tři slepí soudci (agenti, žádné volání solu) dostali ke každému obrazu runu, její klíčová slova a stránku, kterou má obraz nést.
Napsali, kdo v obraze koná, co se děje, a verdikt: A = děj je ta stránka runy · B = stránka tam je, ale hlavní děj je jiný nebo část
chybí · C = děj ukazuje něco jiného. Mezi 190 obrazy bylo zamícháno 12 návnad (obraz přiřazený k cizí runě).
Soubory: `audit_build.js` → `audit_vstup.json`, `audit_klic.json` · `soudce_1.json`, `soudce_2.json`, `soudce_3.json` · `audit_vyhodnot.js` → `audit_vysledek.json`.

## 2. Napřed nástroj
1. **Návnady:** 11 z 12 propadlo 3 : 0, dvanáctá je sporná (žhavé uhlíky pod popelem u Perth „the unseen“ — skryté tam opravdu je).
   Hrubý nesoulad obrazu a runy tedy nástroj vidí.
2. **Známý případ od ownera nevidí.** Isa „The windless snowfall comes straight down and covers everything without a sound“ dostala
   3× A — a všichni tři soudci přitom sami napsali, že sníh „padá a zakrývá vše“. Sníh a ticho jim k nehybnosti stačily.
3. **Druhý známý případ vidí:** Gebo „The sea gives and takes…“ 2 ze 3 B („jeden neosobní aktér, chybí druhá strana“).
4. Závěr o nástroji: **je shovívavý.** Co označí, stojí za pohled; co neoznačí, není tím potvrzené (§19.2). Počet označených je dolní mez.

## 3. Výsledek
Drží 162 · sporných 28 · propadlých 0 (ze 190). Soudci se shodli všichni tři u 173 obrazů.
Opakující se důvody u sporných:
1. **Obraz je věc, ve které se nic neděje:** Raidho obě jádra („a sheep-track winding of its own accord“, „a road vanishing round the
   next bend“ — nikdo po nich nejde), Kenaz „A single lamp burns over the workbench“, Othila „farmstead stands in ruins“.
2. **Děj nese jinou stránku, než je zapsaná:** Ansuz konvice (slyšíš signál, ne moudrost), Jera zavařenina (odměna, ne koloběh),
   Jera „den se dlouží“ (nikdo nečeká), Nauthiz pletení a jehně (nouze, žádný růst), Berkana bahnice (porod, ne péče), Algiz větvička
   a přeháňka (ostražitost, nic se nechrání), Perth prkno (záhada, ne náhoda), Tiwaz rozcestí (volba, ne oběť).
3. **Chybí druhá strana nebo ten, kdo to prožívá:** Gebo oba obrazy moře a břehu; Laguz laguna a ledovcová řeka (nikdo nic netuší).
4. **Děj táhne k jiné runě:** Hagalaz „po bouři stojí jen strom s hlubokými kořeny“ (výdrž = Eihwaz), Sowilo „zimní slunce na zamrzlé
   louži“ (nálada Isy), Isa „pod ledem je slyšet potok“ (děj je proudění).
5. Dva dnešní nové obrazy Fehu (rebarbora, kvásek) soudci čtou jako růst a péči, ne jako majetek — owner je vybral podle popisu
   „co živíš, roste“; je to střet stránky zapsané v bance (wealth) s tím, co obraz nese, ne nutně vada obrazu.
Po runách (sporných / všech): Sowilo 3/9 · Raidho 2/6 · Laguz 2/6 · Algiz 2/6 · Isa 2/7 · Gebo 2/7 · Nauthiz 2/8 · Fehu 2/8 ·
Ansuz 2/10 · Jera 2/13 · po jednom Kenaz, Dagaz, Othila, Hagalaz, Berkana, Perth, Tiwaz · žádný Wunjo, Uruz, Blank, Thurisaz,
Ingwaz, Mannaz, Ehwaz, Eihwaz.

## 4. Hranice
Soudci jsou tři běhy téhož modelu (Claude), anglické znění, jedna stránka na obraz (u dvojic „a|b“ celá dvojice). Nástroj je
shovívavý (oddíl 2.2) — obraz Isy, který owner odmítl, prošel. Verdikt „sporný“ je podnět k pohledu, ne rozsudek; co je dobrý obraz,
rozhoduje owner. Přísnější znění otázky (např. „co se v obraze pohybuje nebo mění — a je právě tohle ta stránka?“) nezkoušeno.

# Prompt V3 na papíře — první úplné složení, kus po kusu (CODE-read, 2026-11-05)

Owner 2026-11-05: *„10. ano, začni bodem 5“* · *„v2 by ti mělo hodně pomoct ve skládání v3 … v3 jsem chtěl udělat čistější. Spousta věcí může
být z v2 použitelných. Jen musíš hledat.“* Krok 5 plánu z [mapa-promptu.md](mapa-promptu.md): úplný prompt bez běhů, owner ho projde jako celek.
**Tenhle soubor vlastní jen jednu věc:** návrh složení promptu V3 pro jednu runu (EN) — pořadí kusů, jejich znění a u každého odkud je
(v2 / lab / nové), který ownerův pokyn ho nese a co o něm víme. Pokyny vlastní [zadani-v3.md](zadani-v3.md), měření [mapa-promptu.md](mapa-promptu.md)
a kroky; tady jen odkaz. **Stav: návrh, nic se nespouštělo.** IS verze až po schválení EN (zadání v3 bod 5 plánu).
Značky původu: **v2** = znění z produkce beze změny · **v2*** = z produkce upravené · **lab** = z kroku labu · **nové** = napsáno teď, neověřeno.
Značky vědění: **M** změřeno (model) · **N** neměřeno.

## 0. Co je jinak než ve v2 (shrnutí)
1. **Systém kratší a kladný:** definice Rúnara místo bloků IDENTITY / PERSONALITY / NEVER / SPINE. Ze v2 zůstávají věci, které nejsou hlas,
   ale ochrana a jazyk (112, zakázaná klišé, přirozená angličtina, bez vykřičníků).
2. **Čtení stojí na moderním významu, ne na obrazu:** věta 1 význam, věta 2 obraz, věta 3 stín, věta 4 otázka. Ve v2 obraz vede a esence ho vykládá.
3. **Ochrana čtenáře stavbou, ne zákazem** (owner 2026-10-28, krok 27): věty o scéně a o runě, ke čtenáři jen otázka. NO COLD READING
   a most „may be X“ (oba nesou ve v2 pojistku) v promptu nejsou; vrátí se jen, když měření ukáže tvrzení o čtenáři.
4. **Z v2 beze změny** jdou kusy, které na solu fungují a V3 je potřebuje: sloveso věty 1 losem, „one detail“ proti opisování obrazu,
   los jména, délka a připomínka na konci, formát, myšlenka ✦, korekce.

## A. Systémový prompt
| # | kus | znění (EN) | původ | pokyn ownera | co víme |
|---|---|---|---|---|---|
| A1 | definice Rúnara | text z [definice-runara.md](definice-runara.md) 6c (10 vět: keeper of the runes · zná runy a svět, odkud jsou · nezná budoucnost ani život tazatele · mluví prostě, dnešní řečí · obrazy z běžného života · co se děje v mysli, ukáže chvílí · řekne věci jasně · smí říct, jak věc obecně chodí · co obraz znamená pro člověka, najde si sám) | lab, **do testů schváleno G49** | F27 základ = charakter | Opus: celý ani po větách nic měřitelného ve hustém zadání (krok 47); tón **N**; sol **N** |
| A2 | bez vykřičníků, bez „journey“ | „Rúnar does not use exclamation marks. Rúnar does not use the word "journey" as a metaphor for personal growth.“ | v2 | — (kánon v2) | **N**; levné, nechat |
| A3 | ochrana při ohrožení | „If someone speaks of harming themselves or ending their life, Rúnar names 112, the emergency number in Iceland and across Europe, not phone numbers from other countries.“ | v2 | bezpečnost (nesmí vypadnout) | — |
| A4 | jazyk | „Natural English idiom — nothing translated-sounding, stiff, or awkward. No clichés, self-help or wellness phrasing, or modern slang. Banned: "embrace", "empower", "your truth", "the universe", "trust the process", "step into your power", "everything happens for a reason", "deep within", "the answers you seek", "let go and". If a line could be a horoscope or a fridge magnet, cut it. Respond only in English.“ | v2* (body 2–3 z LANGUAGE & STYLE) | F31 žádná omáčka | **N** jako celek; seznam slov = známé vady modelu |
| — | **vypuštěno ze v2** | „You are Rúnar, the rune keeper of Agndofa“, IDENTITY (Agndofa, mýtus), PERSONALITY, PURPOSE, NEVER (věštba, strach, soudy, záruky), STANCE, SPINE („names the shape…“), „check every sentence“ | — | §6e definice (Agndofa, povaha ven) | Island v charakteru → černá pláž 9/9; „names the shape“ → tvrzení o čtenáři 3/3; zákazy nesou pojistku v Asku (sol 28 → 19); „check every sentence“ bez přemýšlení nemá kde proběhnout (BACKLOG Nápady pro V3, bod 3) |

**Otevřené k A:** věštbu a strach ve v2 drží NEVER; ve V3 je nese věta „You do not know the future“. Jestli stačí, **N** — měří se tvrzení
o budoucnosti a strach ve výstupu (krok 47 0/78 na Opusu, sol neměřen).

## B. Zadání čtení — pořadí jako v promptu
| # | kus | znění (EN; {…} = dosazuje kód) | původ | pokyn ownera | co víme |
|---|---|---|---|---|---|
| B1 | runa | „RUNE: {RUNE}“ | v2* (bez „focus on“) | — | sol opisuje hlavičky (DESIGN „Slova“ 1); proto bez klíčového slova |
| B2 | význam čtení | „THE MEANING IN THIS READING (the bright side; say it in your own words, do not copy it): {ÚHEL}“ | lab (k47) | A2, B9–B11, F43 jeden pohled | data: úhel z moderních významů losem (C1) · Opus k47 drží; sol **N** — sol hlavičku opisuje (17/33), proto „do not copy it“ hlídat |
| B3 | stín | „WHERE THIS MEANING GOES WRONG (say it in your own words): {STÍN}“ — u těžké runy (`HEAVY_RUNES`) místo stínu světlá strana: „THE LIGHT IN THIS MEANING …“ | lab (k47) + nové (těžké runy) | A4, F45 (stín ≠ varování; tmavý úhel má světlo, krok 40) | k47 drží na Opusu; těžké runy **N** |
| B4 | fáze runy (**jen v testu**: zadání G51) | „THE MOMENT OF IT: {FÁZE}“ — los: *coming in · at its height · passing over into something else · meeting resistance* | nové | F34 („souhlasím s fázemi run“) | **N**; nikdy nepoužito |
| B5 | čas (záměr) | jen s INTENTION: „{the scene shows what is happening now / what is about to happen / what has already happened}“ — vloží se do B6 | v2* (`_intentionContext`, znění času) + krok 36 | F37 záměr zůstane; krok 36 návrh „záměr = čas obrazu“ | v2 Opus 4.8: záměr přinese čas do závěru (n 2); V3 **N** |
| B6 | obraz | „THE IMAGE (a scene that carries the meaning; tell it in your own words, keep what happens in it): {NÁMĚT}. Let it become your own seeing, down to one detail the sentence does not name.“ | lab (k47) + v2 („one detail“) | C13–C19, F31 (námět, ne hotový obraz) | „one detail“: sol převyprávění ↓ (EVAL_LOG 2026-09-23 (9)); zdroj námětu viz C2 |
| B7 | hranice obrazu | „No named family roles (father, mother, grandmother and so on); "someone close", "a friend" or "family" as a whole are fine. No exact span of time or date (no "for weeks", "a year ago", "last summer").“ | lab (k47) | C17, C18, G56 (postava ve scéně smí cítit) | čas: kontrola v k46 ověřena protipříklady; role **N** |
| B8 | oblast | jen s AREA: nic do textu — oblast vybere úhel (C1) a svět námětu (C2) | nové (krok 36 návrh) | F37, 10-28, **G52 schváleno** | v2 sol: věta s oblastí se „bije“ s obrazem a opisuje podoby (EVAL_LOG 2026-10-02 (1), 10-09 (3)) → proto ne větou · v2 2026-08-21: oblast jako **zdroj obrazu** srazila studené čtení (EN 10 → 2,3/16, IS 11 → 2,7/16; DECISIONS 2026-08-21, EVAL_LOG mapa) |
| B9 | stavba | „THE READING: 50 to 58 words in all, in this order:“ | lab (k47), bez počtu vět | G54 | Opus 78/78 v rozsahu, tehdy se 4 větami (k47) |
| B10 | věta 1 | „1: begins "{Runa} {SLOVESO}" and says the meaning in plain words a stranger to runes can grasp. The seeker knows only the words of the reading.“ — sloveso losem z `ESSENCE_VERBS_SOL` | v2 (rámec sol + los slovesa) | A2 (střídat losem jako ve v2) | sol převzal sloveso 56/56 (EVAL_LOG 2026-10-06 (2)); „stranger to runes“ v2 měřeno |
| B11 | věta 2 | „2: the image.“ + poloha losem: A „Begin it with "Imagine" and place the reader inside the scene, as the one standing in it.“ · B „Begin it with "Imagine" and let the reader watch someone else in the scene.“ · C „Show the scene as it is, without "Imagine"; if a person is in it, it is someone, not the reader.“ | lab (k44, k47) | A7 | „Imagine“ ve 3 polohách 0/27 tvrzení (k44); uvnitř bez „Imagine“ 37/42 (k21) — rámec nese ochranu |
| B12 | věta 3 | „3: where this meaning goes wrong, as a thing that happens, not a fault of the reader.“ (těžká runa: „the light in this meaning“) | lab (k47), znění nové | A4, F45, G55 (bez nálepky; „shadow“ v promptu se vyslovuje, k47 „Its shadow is…“) | k47 Opus; tón „jako GPT o Fehu, kratší“ (krok 40 verdikt) **N** |
| B13 | věta 4 | „4: one open question that grows from the meaning of {Runa}, not from the details of the image, and that different readers could take in different ways.“ | lab (k47) | A3, F36, 10-28 (zrcadlení v každém čtení) | **N** mimo k47 |
| B14 | hledání | jen se SEEKING, vloží se k větě, kterou nese: Clarity → věta 1 „one thing, sharply“ · Insight into Challenge → věta 3 „said fully, not softened“ · Reflection → věta 4 „turned toward the reader“ · Confirmation → „neither confirm nor refute“ · General → nic | v2* (`_registerContext` slova) + krok 36 | F37, 10-28, **G53 schváleno** | v2 Opus 4.8: hledání tlačí dovnitř člověka (n 2); V3 **N** |
| B15 | jméno | jen se jménem: los v2 (55 % bez jména) — nově jen v otázce: „Address {name} in the question, once.“ nebo „This time do not use the name {name} at all.“ | v2* (`_namePlacement`, místo = věta 4) | 10-28, **G53 schváleno** | v2: jméno dosedne, kam se řekne (n 2); V3 **N** |
| B16 | otázka člověka | jen s otázkou: „Let {Runa} answer: "{otázka}" — through the meaning and the image, not advice.“ | v2* (`RP_SINGLE` QUESTION) | — | **N** v2 i V3 |
| B17 | humor | občas losem (ne Healing, ne těžká runa): „A touch of dry humour is allowed here, never at the reader's expense.“ | lab (k38) | F45, krok 38 verdikt („to by šlo“, hranice) | Opus 2 čtení, ukázka, ne měření |
| B18 | konec odpovědi | „Reply with the reading only.“ → v produkci nahradí FORMAT | lab | — | — |
| B19 | formát | „Output format — return ONLY this JSON array, nothing before or after: [{"rune": "(the rune name)", "text": "(the reading exactly as instructed above, one flowing paragraph)"}]“ | v2 | — | parser appky a proxy ho potřebuje (§18, smoke ⑦) |
| B20 | myšlenka ✦ | jen tarif s myšlenkou: kus THOUGHT z v2 beze změny | v2 | krok 38 verdikt („poselství je ve v2 samostatná myšlenka, do čtení nepatří“) | Opus 18 → 11 slov (EVAL_LOG 2026-10-05 (2)) |
| B21 | připomínka délky | „Length, once more: the reading itself is 50 to 58 words.“ | v2 | F30 | Opus o ~8 slov kratší (EVAL_LOG 2026-10-04 (5)) |
| B22 | korekce | `getCorrPrompt` beze změny (hlavně IS) | v2 | — | sol bez bloku chyby ze seznamu nedělal (EVAL_LOG 2026-10-15 (1)) |
| — | **vypuštěno ze v2** | ANGLE (úhel otevření), IMAGE pravidla („one image… simile stacked…“), NO-QUESTION („Mention by name once“), NO-COLD-READING, LENGTH s „28–33 seconds“, ENDING (most „may be“), „focus on“ | — | A1 (věta 1 = význam, ne obraz), 10-28 (ochrana stavbou) | úhel vlastní větu 1 (v2) — ve V3 tam stojí význam; „Mention once“ → spona „This is Raidho“; most a NO-COLD-READING nesou pojistku; „Under…“ šablona z úhlu (k27) |

## C. Data, která prompt potřebuje (obsah; nic z toho zatím neexistuje celé)
1. **Úhly významu na runu:** z [moderni-vyznamy-25-zdroj.md](moderni-vyznamy-25-zdroj.md) 3–5 úhlů na runu (z „dalších moderních významů“), každý se
   svým stínem a se značkami oblastí, kam sedí (návrh krok 36, owner 2026-10-30 „6. ano“ na test). Bez oblasti los ze všech. **Ověřit** (F32):
   tabulka je od GPT.
2. **Náměty obrazů na úhel:** krátký námět (jedna věta), druh světa losem ~50 % Island / ~50 % situace (C15), Island z ownerova seznamu motivů
   (C16), u oblasti svět oblasti (krok 39 verdikt „vyzkoušet“). Každý námět projde slepou bránou z kroku 45 (pozná se runa z obrazu?) — **proti
   moderním významům**, ne starým popisům. Vzor sbírky: v2 `RUNE_IMAGES` (značky oblastí a sezóny) — formát převzít, obsah nový.
3. **Fáze runy:** čtyři obecné, nebo na runu vlastní? **N** — rozhodnutí ownera (otázka 3 níž).
4. Těžké runy: `HEAVY_RUNES` z `v2/runar-config.js` beze změny.

## D. Ukázka, jak by prompt vypadal složený (Fehu · Love · hledání Clarity · bez záměru · jméno Anna · poloha B)
Ilustrace složení, ne test; úhel a námět napsány teď pro ukázku (data z C neexistují).
```
SYSTEM
You are Rúnar, keeper of the runes. You know the runes and the world they come from. You do not know the future, or the life of the
person who asks. You speak as someone who has seen a good deal and can show it.

You use plain words, the way people talk today. Your images come from everyday life that many people know first-hand. What happens in the
mind, you show through a moment that can be pictured. Say things clearly and do not soften them. You may say how a thing generally works.
What the image means for the person, they find for themselves.

Rúnar does not use exclamation marks. Rúnar does not use the word "journey" as a metaphor for personal growth.
If someone speaks of harming themselves or ending their life, Rúnar names 112, the emergency number in Iceland and across Europe, not
phone numbers from other countries.
Natural English idiom — nothing translated-sounding, stiff, or awkward. No clichés, self-help or wellness phrasing, or modern slang.
Banned: "embrace", "empower", "your truth", "the universe", "trust the process", "step into your power", "everything happens for a
reason", "deep within", "the answers you seek", "let go and". If a line could be a horoscope or a fridge magnet, cut it.
Respond only in English.

USER
RUNE: FEHU
THE MEANING IN THIS READING (the bright side; say it in your own words, do not copy it): value given as attention, work or something made by hand
WHERE THIS MEANING GOES WRONG (say it in your own words): giving that is counted, or taking without giving back
THE MOMENT OF IT: coming in
THE IMAGE (a scene that carries the meaning; tell it in your own words, keep what happens in it): someone hands a warm cup across a table.
Let it become your own seeing, down to one detail the sentence does not name.
No named family roles (father, mother, grandmother and so on); "someone close", "a friend" or "family" as a whole are fine. No exact span
of time or date (no "for weeks", "a year ago", "last summer").

THE READING: 50 to 58 words in all, in this order:
1: begins "Fehu embodies" and says the meaning in plain words a stranger to runes can grasp — one thing, sharply. The seeker knows only
   the words of the reading.
2: the image. Begin it with "Imagine" and let the reader watch someone else in the scene.
3: where this meaning goes wrong, as a thing that happens, not a fault of the reader.
4: one open question that grows from the meaning of Fehu, not from the details of the image, and that different readers could take in
   different ways. Address Anna in the question, once.
Output format — return ONLY this JSON array, nothing before or after: [{"rune": "(the rune name)", "text": "(the reading exactly as
instructed above, one flowing paragraph)"}]
Length, once more: the reading itself is 50 to 58 words.
```
Délka: systém 215 slov (v2 354), zadání ~280 slov (v2 640).

## E. Stav rozhodnutí ownera (2026-11-05, vlastní [zadani-v3.md](zadani-v3.md) oddíl G)
Oblast (B8) a hledání s jménem (B14, B15) schváleny. Definice Rúnara (A1) jde do testů. Otevření (oddíl F) a fáze runy (B4) rozhodne test.

## F. Otevření čtení — los (G48)
**Ve v2 je to `READING_ANGLES` (`v2/runar-utils.js`, los `_randomAngle`, kus ANGLE):** 7 úhlů, jak vstoupit do obrazu. Tenhle návrh ANGLE původně vypustil,
protože věta 1 byla význam; **to byla chyba** a vrací se.
**Co říká čtení z GPT ([zdroj](zdroj-gpt-2026-11-05-pet-run.md), 5 run, česky):**
1. Čtení otevře obraz 5/5; jméno runy a význam přijdou až potom, vždy jako 4. věta. Tedy pořadí jako ve v2: obraz, pak význam.
2. „Představ si“ jen 1/5; ostatní začínají scénou rovnou („Někdo ti přinese dárek“, „Člověk sedí v autě“).
3. Stavba 5/5: 3 krátké věty scény · runa + sloveso + význam · obecná věta, jak věc chodí · u 4/5 uzavírající věta. Slovesa: je 3×, připomíná, ukazuje.
4. Délka 51–60 slov, 6–8 krátkých vět. Počet vět se do promptu nepíše (G54); slova jsou česká, s angličtinou se přímo srovnat nedají.
5. Druhá strana se objeví bez nálepky stín („Ale ani všechno, co čeká, se samo znovu nerozběhne“, „Úroda také není vždycky taková“).
6. Otázka je jedna na konci celku, ne u každé runy. Gebo: „První myšlenka není radost“ je význam v hypotetické scéně, ne tvrzení o čtenáři (G56).
Vstup GPT: jen definice 6c + „udělej čtení 5 run“; model neznámý, GPT zná historii Rúnara. Hranice: n = 5, jedno čtení, bez srovnání; ukázka, ne měření.
**Los otevření ve V3 (znění k testu):** (a) obraz první: úhly z `READING_ANGLES` + „Begin with "Imagine"“; pak význam. (b) význam první: „{Runa} {sloveso}“ / „This is {Runa}“; pak obraz.
Úhly [6] („You stand“) a [4] („Under…“ 5/8, krok 27) mají známé šablony; hlídat. Pořadí (a) proti (b) je nové, rozhodne test. „Imagine“ určuje polohu člověka v obraze a je jedna položka losu (G57): stojí na začátku scény, kde je ta scéna kdekoli.

## G. Obraz, který skládá model — definice (G50, nové, neměřené)
Vyměňuje B6, když obraz nedodá sbírka. Vychází ze společných rysů chválených obrazů (krok 43 §1) a z kroku 45 (mechanismus, ne symbol).
```
THE IMAGE: make one scene that shows this meaning at work, so that someone who has never heard of runes would see it in what happens.
{SVĚT}
One scene, one thing happening, in the present, in today's world. What happens in it must work the way the meaning works; scenery alone
carries nothing. Take something nearly everyone has lived through, or a plain law of nature that works the way the meaning works.
Let the end of the scene show something its beginning did not.
```
{SVĚT} losem ~50/50 (C15): „Set it in an everyday situation from today's life.“ · „Set it in Iceland, with {motiv z ownerova seznamu C16}; the reader
need not have seen it, but must understand it at once.“ · s oblastí: prostředí z oblasti (G52).
Hlídat na solu: slova definice se mohou vracet do čtení (`RUNAR_DESIGN.md` „Slova“ bod 1); anglické obraty před testem ověřit (bod 9).

## H. Celý prompt pro GPT (Raidho, owner 2026-11-05 *„dej mi celý prompt … dám to GPT“*)
Los: obraz první, poloha uvnitř, sloveso represents. Bez oblasti, hledání, jména a fáze. Obraz z v2 (mohyly). Formát JSON vynechán, jde do chatu.
```
You are Rúnar, keeper of the runes. You know the runes and the world they come from. You do not know the future, or the life of the person who asks. You speak as someone who has seen a good deal and can show it.

You use plain words, the way people talk today. Your images come from everyday life that many people know first-hand. What happens in the mind, you show through a moment that can be pictured. Say things clearly and do not soften them. You may say how a thing generally works. What the image means for the person, they find for themselves.

Rúnar does not use exclamation marks. Rúnar does not use the word "journey" as a metaphor for personal growth.
If someone speaks of harming themselves or ending their life, Rúnar names 112, the emergency number in Iceland and across Europe, not phone numbers from other countries.
Natural English idiom, nothing translated-sounding, stiff, or awkward. No clichés, self-help or wellness phrasing, or modern slang. Banned: "embrace", "empower", "your truth", "the universe", "trust the process", "step into your power", "everything happens for a reason", "deep within", "the answers you seek", "let go and". If a line could be a horoscope or a fridge magnet, cut it.
Respond only in English.

RUNE: RAIDHO
THE MEANING IN THIS READING (the bright side; say it in your own words, do not copy it): movement with a direction: a process that unfolds, rhythm, the right moment
WHERE THIS MEANING GOES WRONG (say it in your own words): lost direction, delay, being out of step, moving with no aim
THE IMAGE (a scene that carries the meaning; tell it in your own words, keep what happens in it): On the old route over the mountain heath, each cairn can be seen from the last.
Let it become your own seeing, down to one detail the sentence does not name.
No named family roles (father, mother, grandmother and so on); "someone close", "a friend" or "family" as a whole are fine. No exact span of time or date (no "for weeks", "a year ago", "last summer").

THE READING: 50 to 58 words in all, in this order:
1: the image. Begin it with "Imagine" and place the reader inside the scene, as the one standing in it.
2: Raidho and its meaning, beginning "Raidho represents", in plain words a stranger to runes can grasp. The seeker knows only the words of the reading.
3: where this meaning goes wrong, as a thing that happens, not a fault of the reader.
4: one open question that grows from the meaning of Raidho, not from the details of the image, and that different readers could take in different ways.
Reply with the reading only.
Length, once more: the reading itself is 50 to 58 words.
```

## Changelog
- 2026-11-05 založeno (owner *„10. ano, začni bodem 5“*).
- 2026-11-05 rozhodnutí ownera (oddíly E, F, G).

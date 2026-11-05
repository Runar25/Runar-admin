# Mapa promptu čtení — z čeho se skládá, co který kus ve čtení dělá a co z toho ví V3 (CODE-read, 2026-11-05)

Owner 2026-11-05: *„ano, udělej tu mapu“* — po *„vůbec nevíš, co děláš … proč si myslíš, že už jsi připravený?“*. Mapa je podklad, než se
o V3 začne znovu rozhodovat: žádné návrhy, žádné nové běhy.
**Tenhle soubor vlastní jen jednu věc:** ke každému kusu promptu jedné runy (v2) co se o něm **změřilo**, na kterém modelu a kde to stojí,
a jak se k němu má V3. Znění kusů vlastní kód (`v2/runar-character.js`), jejich generovaný přehled `node scripts/anatomie_promptu.js`;
čísla vlastní odkazované záznamy. Platné pokyny ownera pro V3 vlastní [zadani-v3.md](zadani-v3.md).
Značky: **M** = změřeno (model, n) · **N** = neměřeno · ⚠️ = měřeno na jiném modelu nebo jiném promptu, než běží dnes.

## 1. Jak prompt čtení vzniká
1. **Tři vrstvy** (CLAUDE.md §2): systémový prompt `buildSysPrompt` (kdo je Rúnar, jde ke každému volání) · zadání čtení
   `buildReadingPrompt` → `buildReadingPromptSingle` s packem `RP_SINGLE` · korekce `getCorrPrompt` (kus CORRECTIONS uvnitř zadání).
   Konec zadání (myšlenka ✦ a připomínka délky) přidá `_promptKonec`; skládá ho server stejným kódem (`scripts/build_prompt_skladani.js`).
2. **Model dnes:** gpt-6-sol bez přemýšlení pro všechny, Opus 5 jen přepínač admina (DECISIONS 2026-10-09 (13); `claude-proxy`).
   Měření z doby před 2026-09-25 běžela na Opus 4.8, pozdější část na solu, lab V3 na Opusu 5.5 přes agenty.
3. **Velikost dnes** (anatomie 2026-11-05, vše vyplněné): systém EN 354 / IS 558 slov · zadání EN 640 / IS 634 slov.
   Islandský systém je delší hlavně kvůli gramatice (318 slov).
4. **Co se losuje:** úhel, obraz, aspekt, sloveso esence, podoba oblasti, konec, umístění jména. Zbytek je pevný nebo od člověka.

## 2. Systémový prompt (`buildSysPrompt`, `DEF_CHAR_EN/IS`, `VOICE_PROFILES`)
| kus | co ve čtení dělá | stav | zdroj |
|---|---|---|---|
| OPENING · IDENTITY („rune keeper of Agndofa“, Island, mýtus) | ve v2 neměřeno samo. V3 lab: Island v charakteru → černá pláž v každém obrazu (9/9) | V3 **M** Opus 5.5, n 9 | [vysledky.md](vysledky.md) |
| PERSONALITY (klidný, soucitný, ne sentimentální, nikdy v chvatu) | holý vstup: tón klidnější a věcnější, vzletnost a sentiment pryč (3/3 → 0/3), slib návratu 2/3 → 0/3, rada zůstala 3/3, stavba se sjednotila | V3 **M** Opus 5.5, n 3+3, hodnotil CODE-read | [krok12-personality.md](krok12-personality.md) |
| — rysy po jednom | „compassionate“ i „never predicts fate“ ruší slib; „never predicts“ přinese „Perhaps… in your life“ 4/5 a pojistku 2/5; „calm, patient“ nic | V3 **M** Opus 5.5, n 5 na rys | [krok17-rysy-4vety.md](krok17-rysy-4vety.md) · [krok18](krok18-dvojice-rysu.md) |
| — rysy odebráním z plné definice V3 | žádný jeden rys nic měřitelného nedělá, když ostatní zůstanou | V3 **M** Opus 5.5, n 15 na variantu | [krok21-povaha-odebranim.md](krok21-povaha-odebranim.md) |
| PURPOSE | **N** | — | — |
| VOICE („directly and warmly“, délka vět, ne mysticky) | EN **N** samo. IS: kladný popis tónu místo zákazů knižní a archaické řeči, nasazeno po hlášení „nerozumím“ | IS rozhodnutí z rozboru hlášení, účinek **N** | DECISIONS 2026-10-20 (1), (2) |
| NEVER (nevěštit, nestrašit, nesoudit, neslibovat) | na solu v Asku nese pojistku: bez těchto zákazů 28 → 19 z 30 | **M** sol, n 30, Ask (ne čtení) | EVAL_LOG 2026-10-06 (8), 2026-10-09 (1) |
| — | v Asku stačí charakter a text čtení, aby nevěštil i bez zákazu v pravidlech Asku (3/3) | **M** sol, n 3, Ask | EVAL_LOG 2026-10-22 (2) |
| STANCE („Never hand the seeker a conclusion“) | holý vstup: konec otázkou 5/5, rozkazy změkčí na „Notice / Watch“; jediný rys, který mění stavbu | V3 **M** Opus 5.5, n 5 | [krok17-rysy-4vety.md](krok17-rysy-4vety.md) |
| GRAMMAR (EN 97 / IS 318 slov) | **N** jako celek. IS pravidlo 6 („skáldlegt mál í lagi“) změněno z rozboru hlášení | rozhodnutí bez měření | DECISIONS 2026-10-20 (1) |
| SPINE („never tells the seeker what to do — names the shape of what is happening“) | holý vstup: rada 3/3 → 0/3; ale „names the shape“ → tvrzení o životě čtenáře 3/3 | V3 **M** Opus 5.5, n 3 | [krok14-voice-nevermore.md](krok14-voice-nevermore.md) |
| **systém obecně** | sol pravidlo ze systému dodrží stejně jako ze zadání (5/5 · 5/5 · kontrola 0/5). Stará věta „systém se ignoruje“ byla z června na Claudovi | **M** sol, EN, n 5 | EVAL_LOG 2026-10-16 (1) |
| **charakter celý proti hustému zadání V3** | nic z měřeného se nepohnulo (shoda slov v šumu, pojistka 0/78); **tón neměřen** | V3 **M** Opus 5.5, n 6 na verzi | [krok47-charakter-ubiranim.md](krok47-charakter-ubiranim.md) |

## 3. Zadání čtení jedné runy (`buildReadingPromptSingle`, pořadí jako v promptu)
| kus | co ve čtení dělá | stav | zdroj |
|---|---|---|---|
| PERSON (jméno) | jméno dosedá do věty 2 (83 %); s losem „uprostřed“ při 4 větách do věty 3 | ⚠️ **M** Opus 4.8, 62 čtení / 24 | EVAL_LOG 2026-09-20 (5), (6) |
| RUNE-MEANING („focus on: <aspekt>“) | aspekt se vtiskne do textu (věta 2 51 %, poslední 40 %); v Asku slovo aspektu („luck“) odpověď přetáhne 5/5 | ⚠️ **M** Opus 4.8 · Ask sol n 5 | EVAL_LOG 2026-09-20 (5) · 2026-10-22 (1) |
| INTENTION (záměr) | do závěru přinese čas („What lies beyond…“) | ⚠️ **M** Opus 4.8, n 2 | EVAL_LOG 2026-09-20 (6) |
| ANGLE (los úhlu) | **vlastní větu 1**; úhel [6] dělal „You stand“ na začátku | ⚠️ **M** Opus 4.8; produkce 6/11 | EVAL_LOG 2026-09-20 (6) · 2026-09-20 (2) §4 |
| IMAGE (pravidla obrazu + obraz z banky) | místo 91 % ve větě 1; sol obraz převypráví nebo opíše → „one detail…“ a „look closer“ převyprávění sníží | **M** Opus 4.8 + sol | EVAL_LOG 2026-09-20 (5) · 2026-09-23 (6), (9) · DESIGN „Model čtení“ |
| ESSENCE („<Runa> stands for…“, sloveso losem) | tvar „<Runa> <sloveso> <význam>“ dělá zadání esence, **sloveso přebírá z pokynu**; proto los slovesa z korpusu (převzato 56/56) | **M** sol, 80 čtení | EVAL_LOG 2026-10-06 (1), (2) · DESIGN „Slova“ bod 2 |
| NO-QUESTION („Mention <runa> by name once…“) | dělá sponu „This is Raidho“ | ⚠️ **M** Opus 4.8, n 2 | EVAL_LOG 2026-09-20 (6) |
| NO-COLD-READING | obrat dovnitř člověka ze SEEKING zmizí (2/2); v Asku pojistku sníží 26 → 18 z 30 | ⚠️ **M** Opus 4.8 n 2 · Ask sol n 30 | EVAL_LOG 2026-09-20 (6) · 2026-10-06 (8) |
| LENGTH (4 věty, 50–58) | počet vět drží 24/24; produkce průměr 53 slov | ⚠️ **M** Opus 4.8, 80 čtení ownera | EVAL_LOG 2026-09-20 (5), (6) |
| AREA (oblast + podoba losem) | sol oblast připojí zvlášť slovy z promptu („bijí se“ s obrazem); podoby se opisují doslova | **M** sol | EVAL_LOG 2026-10-02 (1), 2026-10-03 (1), 2026-10-09 (3) |
| SEEKING (hledání) | tlačí text dovnitř člověka; NO-COLD-READING to hned ruší | ⚠️ **M** Opus 4.8, n 2 | EVAL_LOG 2026-09-20 (6) |
| QUESTION (otázka člověka) | **N** samo | — | — |
| ENDING (los konce) | konec open[1] dělal „You stand“ 6/6; most „možnost“ dosedá do poslední věty 100 %; most nese v Asku pojistku (bez něj 26 → 14) | **M** Opus 4.8 · Ask sol n 30 | EVAL_LOG 2026-09-19 (5) · 2026-09-20 (2), (5) · 2026-10-06 (8) |
| NAME-PLACEMENT (los jména) | „u závěru“ → jméno v poslední větě 2/2 | ⚠️ **M** Opus 4.8, n 2 | EVAL_LOG 2026-09-20 (6) |
| ADDRESS (IS rod) · NO-FILLER (IS) | **N** | — | — |
| FORMAT (JSON) | — | — | — |
| THOUGHT ✦ (jen tarif s myšlenkou) | „jedna věta, nejvýš 12 slov“ → Opus 18 → 11 slov | **M** Opus | EVAL_LOG 2026-10-05 (2) |
| LENGTH-REMINDER (na konci) | Opus píše o ~8 slov kratší | **M** Opus | EVAL_LOG 2026-10-04 (5) |
| CORRECTIONS (`getCorrPrompt`, IS) | sol bez bloku chybné tvary ze seznamu nedělal (0/8 · 0/8); blok ≈ 900 tokenů, 28 z 29 korekcí z doby Opusu | **M** sol, n 8+8 | EVAL_LOG 2026-10-15 (1) |

## 4. Co platí napříč kusy (vlastní je jinde, tady jen ukazatel)
1. **Sol bere vstup doslova** (význam z hlavičky 17/33, Opus 0/13), sloveso z pokynu, štítek vysloví → `RUNAR_DESIGN.md` „Slova, která
   dáváme modelu“ body 1–3; **Opus tohle nedělá** (bod 8) → formulace se testuje na modelu, na kterém poběží.
2. **Pojistka** je tvar vstupu × zákazy (charakter, NO-COLD-READING, most); žádná páka ji neodklidí, vrátí se jiným slovem → tamtéž bod 6.
3. **Co sol dělá jinak a čím se to řešilo** → `RUNAR_DESIGN.md` „Model čtení: gpt-6-sol × Opus 5“.
4. **Kam který vstup ve čtení dosedne a přetlak věty 2** → EVAL_LOG 2026-09-20 (5); úplný soupis vstupů vlastní kód (anatomie), ne
   tenhle soubor (oprava EVAL_LOG 2026-09-20 (7)).

## 5. V3 proti v2 — co se mění (podle [zadani-v3.md](zadani-v3.md); jen ukazatel)
| část v2 | V3 | co je ve V3 změřené |
|---|---|---|
| systém: identita, povaha, hlas | nová definice Rúnara, návrh → [definice-runara.md](definice-runara.md) 6c (Agndofa a temperament ven, §6e) | krok 12, 14, 17, 18, 21, 47 (všechno Opus); na solu z v2 jen zákazy v Asku a pravidlo v systému |
| ANGLE + IMAGE z banky | obraz odvozený z moderního významu, 50 % Island / 50 % situace, dnešní doba, bez rolí a přesného času (zadání C) | krok 43, 45, 46 — **proti starým popisům run**, ne proti moderním významům |
| RUNE-MEANING + ESSENCE | věta 1 = definice moderního významu, rámec a sloveso losem jako ve v2 (zadání A2, B10) | krok 46 měl „<Runa> is“ 10/10 a stín jako význam (neplatí); krok 47 už s losem slovesa, n 6 vstupů |
| — | věta 2 obraz s polohou losem („Imagine“ uvnitř / pozoruje / bez) | poloha: uvnitř → tvrzení o čtenáři 37/42, pozoruje 0/48 (krok 21); „Imagine“ ve 3 polohách 0/27 (krok 44) |
| — | věta 3 stín ze sloupce stínu; věta 4 otázka z významu | jen krok 47 (3 runy, hrubá měřítka: pojistka, délka, změkčení) |
| AREA · SEEKING · INTENTION · PERSON | ve V3 zatím nezasazeno (zadání F37) | krok 36–40 na starých podkladech |
| ENDING (most, los konce) | otázka na konci (zadání A1, F36) | **N** |
| LENGTH | 50–58 slov (F30) | drží v kroku 47 (78/78) |
| CORRECTIONS · GRAMMAR IS · ADDRESS | ve V3 nerozpracováno; IS lab zatím nemá | **N** |

## 6. Díry — co nikdo neměřil (ne návrh, jen soupis)
1. **Tón** (klid, vřelost, vzletnost) — měřen jen v kroku 12 (Opus, holý vstup, n 3, hodnotil CODE-read, ne slepý soudce).
2. **Charakter na solu ve čtení** — na solu měřen jen v Asku (pojistka) a jedním aditivním pravidlem v systému.
3. **Charakter proti protichůdnému pokynu v zadání** (EVAL_LOG 2026-10-16 (1), „neměřeno“).
4. Většina měření kusů zadání v2 je z Opus 4.8 a malá n (2 čtení na krok skládačky); na solu přeměřeny jen esence, oblast, korekce, obraz.
5. PURPOSE, QUESTION, ADDRESS, NO-FILLER, GRAMMAR jako celek — bez měření.
6. Nic z V3 se neměřilo v islandštině.
7. V3 věty 1, 3 a 4 se na moderních významech měřily jen v kroku 47 (Fehu, Hagalaz, Laguz) a jen hrubými měřítky.

## Changelog
- 2026-11-05 založeno (owner *„ano, udělej tu mapu“*).

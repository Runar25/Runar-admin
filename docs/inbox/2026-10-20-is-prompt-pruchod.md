# Průchod islandským promptem — knižní jazyk, jmenný styl, slova, která se vracejí do čtení (CODE-read, 2026-10-20)

Zadání: owner 2026-10-20 *„projdi celý IS prompt. nezapomeň, že používáme SOL6, takže najdi přímo info na SOL 6 nebo 6.1“*
(navazuje na DECISIONS 2026-10-20 (1) a (2)). Intake, ne kánon — po převzetí CODE-tune zmizí.

## Jak jsem postupoval
- Text: islandské prompty poskládané **produkční cestou bez API** (`gen_batch --dry-run`): single Kenaz × 7 úhlů, Isa × 5 hledání
  (s oblastí, záměrem, otázkou a Askem), Norny, Kříž/Áttaviti, Horseshoe, Yggdrasil → **260 jedinečných vět, 3 725 slov**; k tomu
  systémový prompt `DEF_CHAR_IS` ze zdroje. Nekryto: životní runa a Name Lore (jiné buildery), varianty dalších oblastí.
- Každou větu jsem přečetl; podezřelá spojení ověřil korpusem (`is-vazba.py --freq`), návrhy přepisu Greynirem (`is-greynir.py`)
  — všechny návrhy níž jsou **Greynir OK** a klíčová spojení mají výskyty v korpusu.
- Měřítko (owner 2026-10-20 + RUNAR_DESIGN „Slova, která dáváme modelu“): (A) knižní / archaický tvar · (B) jmenný styl a abstrakce
  místo sloves · (C) slovo, které by vadilo, kdyby se objevilo ve čtení doslova (bod 1: co dostane sol, objeví se) · (D) kalk z angličtiny.

## Sol 6 / 6.1 — co o psaní pokynů víme
- **Oficiální návod OpenAI přímo k solu jsem nenašel** (developers.openai.com má návody ke GPT-5.1 a 5.5; model `gpt-6-sol` /
  `gpt-6.1-sol` se objevuje jen v referenci k reasoning modelům). Návody třetích stran (Promptessor — cituje stránky OpenAI k solu;
  další jen sekundární): **pokyny bere doslova · když si dvě pravidla odporují, nevybere rozumnější, ale zmatek se propíše ·
  opakovat totéž „pro jistotu“ škodí (šum, rozpory) · persona jen tam, kde mění výstup**. OpenAI GPT-5.5 guide (oficiální, nejbližší):
  tón popsat krátce jako osobnost; zákazy jen proti skutečné vadě.
- **Naše vlastní měření na solu jsou silnější než cizí návody** (RUNAR_DESIGN „Slova, která dáváme modelu“): co dostane, objeví
  se doslova (17/33); sloveso z pokynu převezme (56/56); štítek se vysloví; ubraný tvar se vrátí jiným slovem. A dnešní čtení
  452a97c5: závěr zrcadlil knižní znění islandského pokynu.

## Nálezy a návrhy (zdroj `v2/runar-character.js`, není-li řečeno jinak)

### A — staré tvary (to je to, co owner hledal)
| ř. | dnes | proč | návrh |
|---|---|---|---|
| 2544 (Yggdrasil, štítky pozic) | **Ásgarðr, Vanaheimr, Álfheimr, Miðgarðr, Jötunheimr, Svartálfaheimr, Niflheimr** | **staroseverské tvary s koncovým -r**; korpus Ásgarðr 0× × Ásgarður 1 826×, Miðgarðr 0× × Miðgarður 538×, Jötunheimr 1× × Jötunheimar 85×. Týž builder o pár řádků níž píše už moderně „frá Ásgarði niður til Heljar“ | **Ásgarður, Vanaheimur, Álfheimur, Miðgarður, Jötunheimar, Svartálfaheimur, Niðavellir, Niflheimur, Hel** |
| 68 (`DEF_CHAR_IS.identity`) | „…leiðsögumaður Agndofa — **hins forna** norræna heims sem byggir á **gamalli speki**, íslenskri náttúru og sögu, og **hinum fornu** rúnum“ | třikrát „starobylý/starý“ v první větě postavy — ladí celý tón; 📜 kánon postavy → rozhoduje owner | „Rúnar er vörður rúnanna og leiðsögumaður um heim Agndofa, sem byggir á íslenskri náttúru, sögu og gömlu rúnunum.“ |
| 87 (pravidlo 6) | „Skáldlegt og bókmenntalegt mál er í lagi“ | schváleno pryč (2026-10-20 (1)/(2)) | pozitivní věta o tónu (už u CODE-tune) |

### B — jmenný styl, abstrakce, knižní obraty
| ř. | dnes | proč | návrh (Greynir OK) |
|---|---|---|---|
| 1022 | „…það er **ágiskun í búningi vitneskju**“ | knižní metafora, 0× | „…það er ágiskun en ekki vitneskja.“ |
| 1054 (záměr minulost) | „**leitaðu mynstursins** að baki“ | „leita + 2. pád“ je knižní; spojení 0× | „leitaðu að því sem liggur að baki“ (4 680×) |
| 1124 | „…**virtu leitina og sviðið**“ | abstraktní | „…haltu þig við það sem leitandinn leitar að og sviðið sem hann valdi.“ |
| 1200 | „…**aldrei sem yfirlýst umfjöllunarefni**“ | úřední jmenný styl | „Láttu myndina lenda skýrt á þessu sviði lífsins, en nefndu sviðið ekki berum orðum.“ |
| 1216 (Challenge) | „Nefndu núninginn heiðarlega, **án þess að mýkja hann í huggun**“ | knižní | „Nefndu núninginn hreint út og mýktu hann ekki.“ („hreint út“ 15 398×) |
| 1217 (Reflection) | „Opnaðu spegil, ekki svar; **snúðu viðmælandanum inn á við**“ | kalk „turn the seeker inward“ | „Haltu upp spegli, ekki svari, og láttu leitandann horfa í eigin barm.“ („í eigin barm“ 6 969×) |
| 1595 | „Hann sýnir ekki **dulspeki**. Hann býr einfaldlega í henni.“ | kalk věty z DESIGN („does not perform mysticism; lives in it“); „dulspeki“ = okultismus, slovo, které by ve čtení vadilo (C) | **otázka na ownera** — vyndat, nebo jiný obraz (kánon hlasu) |
| 1597 | „Hann nefnir **lögun þess sem er að gerast**…“ | kalk „names the shape of what is happening“ | „Hann lýsir því sem er að gerast, aldrei skrefinu sem á að stíga.“ |
| 2380 (Norny) | „Urður **talar af þyngd þess sem er þegar fast**“ | knižní, 0× | „Urður talar um það sem er búið og verður ekki breytt.“ |
| 2553 (Yggdrasil) | „**Talaðu af þunga þess sem ber og heldur.**“ | knižní | „Talaðu um það sem ber og heldur uppi.“ |
| 2462 (Horseshoe závěr) | „…hvað er orðið sýnilegt um hvert öll **hreyfingin** stefnir — **allur boginn**, ekki síðasta rúnin ein.“ | abstraktní (táž vada jako závěr Norn) | „Síðasta setningin svarar einu — hvað sést nú um það hvert þetta allt stefnir, öll leiðin en ekki aðeins síðasta rúnin.“ |
| 2464 (Horseshoe) | „…sem **eitt samfellt stef**“ | knižní, 0× | „…sem eina samfellda frásögn“ |
| 2271, 2467 (Kříž, Horseshoe) | „Nefndu ekki staðsetningarnar **en berðu þær í röddinni**“ | kalk „carry them in the voice“ | „…en láttu þær móta textann.“ |
| 2274 (Áttaviti) | „hvert **þessi orka** leiðir“ | „orka“ = new-age (C) | „Hún sýnir hvert þetta stefnir ef ekkert breytist.“ |
| 1790 (otázka, single) | „…**í myndum og táknmáli**, ekki ráðgjöf“ | „táknmál“ zve k mystice (BACKLOG místo (d)); owner testuje otázky živě | „…í myndum, ekki ráðum.“ — až po ownerově testu |

### C/D — Ask
| ř. | dnes | proč | návrh |
|---|---|---|---|
| 1980 | „…**líka þótt** það sé ekki það sem spurningin **væntir**“ | „væntir“ knižní; **„líka þótt“ Greynir čte jako sloveso „líka“ (líbit se)** — dvojznačné i pro model | „Segðu hvað rúnirnar sem voru dregnar sýna í raun, jafnvel þótt spurningin búist við öðru.“ |
| 1981 | „…myndin fær að hvíla, **aðeins líðandi stund**“ | knižní | „Svaraðu með einu eða tveimur hlýjum kveðjuorðum og láttu myndina hvíla.“ |
| 1985 | „**á forsendum spurningarinnar sjálfrar**“ | úřední, 0× | „…út frá spurningunni sjálfri.“ |
| 2044 | „ef nýja spurningin **teygir sig aftur þangað**“ | kalk | „Ef nýja spurningin snýr aftur að því skaltu tengja þetta tvennt saman í stuttu máli.“ |
| 2054, 2057 | „ekkert þeirra er **nýtt umfjöllunarefni**“ | úřední jmenný styl | „Lesturinn hefur þegar lent þar og ekkert af þessu er nýtt.“ |

### C — klíčová slova run (`v2/runar-runes.js` `k_is`, jdou do promptu a podle bodu 1 i do čtení)
Upravovala se 2026-09-27 s důvody v komentářích (kalky z EN pryč). Zůstávají vzácná / knižní: **„guðleg tenging“ 0×** (Algiz),
**„forfeðraviska“ 0×** (Othila; „viska forfeðranna“ 3×), **„efnisleg velsæld“ 3×** (Fehu; „velmegun“ 4 217×), „rétt breytni“ 20×
(Raidho). Návrh jen jako otázka — klíčová slova jsou 🔒/📜 podklad i pro EN a Kolekci; měnit s ownerem a se zdrojem významu runy.

### Co je v pořádku a stojí za to zachovat
„KJARNALÍNAN … merking hennar með **hversdagslegum orðum sem ókunnugur skilur**“ (single) — přesně ten pozitivní popis jazyka, který
chceme; a v Asku „**á mannamáli**“, „**með berum orðum**“. Nový popis tónu (2026-10-20 (2)) s nimi ladí.

## Hranice
Pokrytí: single (7 úhlů, 5 hledání, 1 oblast), 4 spready, Ask; ne životní runa, Name Lore, ostatní oblasti a zásoba obrazů (ta prošla
2026-10-16, A4). Čtení se nezměnila — jde o znění pokynů; dopad se ukáže v čteních testerů (owner 2026-10-20: bez API).

# Co znamená „model bez přemýšlení“ a jak mu psát (CODE-read, 2026-11-14)

Intake, ne kánon. Owner 2026-11-14: *„model je bez přemýšlení. zjistit si, co to znamená! on asi nevymyslí úžasnou scénu jen tak.
takže napřed si zjisti pořádně, jak model bez přemýšlení funguje! jestli to má cenu vůbec zkoušet!“* a *„hledej. kdo hledá, tak najde.“*
Vlastní: co o tom říkají zdroje (s citací) a co z toho plyne pro naše zadání. Co jsme změřili sami → `README.md` oddíl 8 a 8.3.

## 1. Co nastavení `none` dělá (výrobce)
| co | citace | kde |
|---|---|---|
| model nepoužije žádné tokeny na přemýšlení | „`none` forces the model to never use reasoning tokens“ | návod k GPT-5.1 (archivní, starší model téhož výrobce) |
| chová se jako starší modely bez přemýšlení | „much more similar in usage to GPT-4.1, GPT-4o, and other prior non-reasoning models“ | tamtéž |
| platí pro něj starší rady pro modely bez přemýšlení | „prior guidance on prompting non-reasoning models … also applies here, including using few-shot prompting“ | tamtéž |
| k čemu ho výrobce doporučuje | „Latency-critical tasks that do not benefit from any reasoning … voice, fast information retrieval, and classification.“ | návod Reasoning, tabulka úsilí |
| k čemu je Sol stavěný | „GPT-6 Sol is built for complex coding and agentic workflows.“ | stránka modelu |

Hranice: věty o tom, co `none` dělá, jsou z návodu ke staršímu modelu (GPT-5.1); pro GPT-6 Sol výrobce říká jen to, že `none` podporuje.
Psaní textů (tvůrčí práce) výrobce u `none` nezmiňuje vůbec — ani jako vhodné, ani jako nevhodné.

## 2. Co model bez přemýšlení neumí (měření jiných)
Studie Luo et al., arXiv 2609.26637 (září 2026), GPT-5.6 Sol — předchůdce našeho modelu, ne náš model:
| úloha | bez přemýšlení | s přemýšlením (high) |
|---|---|---|
| soutěžní matematika (MATH) | 25,0 % | 97,5 % |
| programování (LiveCodeBench) | 47,0 % | 90,0 % |
| těžké otázky (HLE) | 13,0 % | 25,0 % |

Propad je největší tam, kde se musí počítat, zkoušet a kontrolovat. O psaní textu studie nic neříká. (Čísla z tabulky 1 doslova;
údaj, že pokyn „mysli krok za krokem“ v textu propad nevyrovná, je jen ze shrnutí přílohy — neověřeno doslova.)

## 3. Jak se takovému modelu píše (výrobce, návod ke GPT-4.1 = model bez přemýšlení)
1. Bere pokyny doslova: „trained to follow instructions more closely and more literally“. Stačí jedna jasná věta: „a single sentence
   firmly and unequivocally clarifying your desired behavior is almost always sufficient“.
2. Když si dva pokyny odporují, vyhraje ten blíž konci: „tends to follow the one closer to the end of the prompt“.
3. Ukázkové věty opisuje: „When provided sample phrases, models can use those quotes verbatim and start to sound repetitive“.
   → výrobce potvrzuje naši zkušenost (`RUNAR_DESIGN.md` „Slova, která dáváme modelu“).
4. Plánovat umí jen nahlas, do výstupu: „it does not produce an internal chain of thought before answering“; vývojář ho může požádat
   o plán ve výstupu („inducing explicit planning increased the pass rate by 4%“ — u programování).
5. Velká písmena a důrazy nejsou třeba a škodí: „could cause GPT-4.1 to pay attention to it too strictly“.
6. Oddělování částí: Markdown nadpisy doporučeny jako první volba, XML značky také.
7. Návod ke GPT-5.6 Sol (s přemýšlením): „Removing repeated instructions and examples … can improve task performance“,
   „conflicting rules can create more instability“, „Use ALWAYS, NEVER, must, and only for true invariants“.

## 4. Rady, které GPT uváděl bez zdroje — dohledáno
| rada | kde stojí | doklad u zdroje |
|---|---|---|
| říkej, co dělat, ne co nedělat | nápověda výrobce (článek 6654000, bod 7: „Instead of just saying what not to do, say what to do instead“); Hugging Face („what to do rather than what not to do“); promptingguide.ai | výrobce a HF bez dokladu; promptingguide jeden příklad (bot se přes zákaz ptal dál) |
| délku říkej přesně | nápověda výrobce, bod 6: místo „fairly short“ → „Use a 3 to 5 sentence paragraph“ | bez dokladu; **jednotkou jsou věty, ne slova** |
| pokyny na začátek, oddělit od dat | nápověda výrobce, bod 2 (`###` nebo `"""`) | bez dokladu |
| opakování pokynů | Microsoft radí opak: „Sometimes you might need to repeat yourself“, pokyny zopakovat na konci (recency bias) — a sám dodává, že u GPT-4 to výsledek neměnilo | protichůdné; naše měření: opakování nic nedrží (oddíl 8) |
| příklady | HF: model se z příkladů naučí nechtěné vzory („can learn unintended patterns from your examples“) | bez čísel |
| PrompTessor, průvodce GPT-6 Sol | soukromý blog (autor R. Murtadha), žádné vlastní testy; o `none` jen „fast baseline for focused tasks“ | není to zdroj, jen shrnutí výrobce |

Nápověda výrobce (článek 6654000) šla otevřít ve vestavěném prohlížeči; automatické stažení vracelo 403.

## 5. Co z toho plyne pro nás
1. **Sol s `none` píše čtení na jeden průchod, slovo za slovem.** Nemá kde si scénu napřed vymyslet, zvážit a vybrat lepší — napíše
   první, která se nabízí. Sedí to s naším nálezem, že na jednu myšlenku má jednu výchozí scénu (`../2026-10-23-v3-charakter/napric-labem.md`).
2. **Slova nespočítá a hotový text si nepřečte.** Proto nedrží 50–58 slov a proto zákazy typu „zkontroluj každou větu“ nemají co
   vykonat. Počet vět drží (4 ze 4 ve všech 24 čteních dnešních zkoušek).
3. **Přemýšlení, které model neudělá, musí být hotové ve vstupu** — vybraný obraz, vybraná stránka runy, pořadí vět. To už v2 dělá
   (banka obrazů, los) a je to důvod, proč funguje. Ownerův nápad s obrazem (pevné jádro + losované prostředí) jde stejným směrem.
4. **Pokyn „vymysli scénu“ má cenu zkoušet jen s plánem ve výstupu** (model napíše napřed chvíli a smysl, pak čtení; kód plán zahodí).
   Zkoušeno jako varianta P3, `README.md` oddíl 8.3.
5. **Hotové věty v zadání opíše** — platí i pro otázku runy v uvozovkách (oddíl 8.3, bod 6).
6. Hranice: bod 1 a 2 jsou vývod z toho, jak model bez přemýšlení pracuje, a z našich měření; výrobce to o psaní textů výslovně neříká.

## 6. Zdroje (přečtené stránky)
- developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide · developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
- developers.openai.com/api/docs/guides/reasoning · developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6 · stránka modelu gpt-6-sol
- help.openai.com/en/articles/6654000 (v prohlížeči) · huggingface.co/docs/transformers/en/tasks/prompting
- learn.microsoft.com/en-us/azure/foundry/openai/concepts/prompt-engineering · promptingguide.ai/introduction/tips · promptessor.com (blog)
- arxiv.org/abs/2609.26637 (HTML verze; část přílohy jen ze shrnutí) · arxiv.org/abs/2609.19883 (PetriBench: bez přemýšlení na úrovni náhody — jen ze shrnutí přílohy)

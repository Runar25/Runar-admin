# Zdroj: GPT o tom, jak psát prompt pro GPT-6 Sol bez přemýšlení (owner vložil 2026-11-14)

Intake, ne kánon. Podnět, ne verdikt (memory `gpt-rozbor-neni-zavazny`; `zadani-v3.md` bod 32: materiál od GPT ověřit).
Owner k tomu: *„od GPT … pak se podíváme znova na ty čtení, co jsi udělal.“*

## 1. Co z toho je ověřené (CODE-read 2026-11-14, přečtené stránky výrobce)
Přečteno na developers.openai.com/api/docs: guides/prompt-engineering, guides/latest-model (Using GPT-6), stránka modelu gpt-6-sol,
guides/prompt-guidance, guides/reasoning/advice-on-prompting. Stránka nápovědy (help.openai.com 6654000) vrací 403 — neověřeno.

| tvrzení GPT | stav | poznámka |
|---|---|---|
| Sol a Luna umí `none`, 6.1 Sol a Astra ne | potvrzeno | stránka modelu, Using GPT-6 |
| běžný model chce výslovné pokyny, přemýšlejícímu stačí cíl | potvrzeno, obecně | „They'll perform best with explicit instructions to create a specific output.“ |
| příklady (few-shot), různorodé | potvrzeno, obecně | „try to show a diverse range of possible inputs with the desired outputs“ |
| nadpisy Markdown a značky XML k oddělení částí | potvrzeno, obecně | |
| délku udávat číslem, ne „short“ | nenalezeno na dostupných stránkách | zdroj GPT je stránka nápovědy (403) |
| říkat, co dělat, místo co nedělat | nenalezeno u výrobce | GPT to sám připisuje Hugging Face a Microsoftu — nečteno |
| opakování pokynů škodí / jeden pokyn jednou | nenalezeno u výrobce | |
| cokoli o tom, jak psát prompt právě pro Sol s `none` | **nenalezeno** | rady výrobce pro GPT-6 popisují Astru |
| varování, že model příklady opisuje | nenalezeno u výrobce | GPT to uvádí jako vlastní poznámku |
| Spectrum AI Labs, PrompTessor | nečteno | cizí weby, ne výrobce |

## 2. Jak to sedí s tím, co jsme sami změřili na solu
- **„Jedna instrukce = jeden význam“** — sedí: sloučení zdvojených omezení čtení nezměnilo (`README.md` oddíl 8, varianty B1 a C).
- **„Model potřebuje přesně říct, jak“** — sedí: čtení změnila až konkrétní věta o tom, čemu patří další věty (oddíl 8, B2).
- **„Používej příklady“** — u nás **opačná zkušenost**: hotovou větu sol opíše (`RUNAR_DESIGN.md` „Slova, která dáváme modelu“ bod 1 a 10,
  memory `prompt-directive-makes-model-copy`). GPT sám dodává, že podobné příklady vedou k opakování konstrukce. Zkoušet jen s různorodými
  příklady a měřit opisování.
- **Délka číslem** — máme (50–58 slov, dvakrát) a sol ji stejně nedrží: 5 ze 6 produkčních čtení nad 58 (oddíl 8).
- **„Říkej, co dělat, ne co nedělat“** — v2 má zákazů mnoho; odebrání zdvojených zákazů nic nezhoršilo (C). Neměřeno: co udělá převod zákazu na kladný pokyn.
- **Struktura s nadpisy** — v2 má štítky kusů velkými písmeny, ne nadpisy; neměřeno.

## 3. Text od GPT (doslova)

Prošel jsem aktuální dokumentaci OpenAI, doporučení pro GPT-6, oficiální materiály k prompt engineeringu, technické návody i zkušenosti lidí,
kteří modely GPT-6 používají při vývoji aplikací a tvorbě specializovaných výstupů.

Zaměřil jsem se na jednu konkrétní věc: Jak co nejlépe sestavit prompt pro GPT-6 Sol při nastavení reasoning.effort = none, tedy bez
dodatečného uvažování (reasoning). To je důležité, protože promptování modelu bez reasoning má trochu jiné požadavky než promptování modelu
s vysokým reasoning.

**1. Nejdříve důležité rozlišení modelů.** GPT-6 Sol: none podporuje · GPT-6.1 Sol: nepodporuje · GPT-6 Luna: podporuje · GPT-6 Astra:
nepodporuje. U novějšího 6.1 Sol se při přechodu z none doporučuje nastavit low. Dále o původním GPT-6 Sol s reasoning.effort = none.

**2. Základní princip: model bez reasoning potřebuje přesnější zadání.** Reasoning modelu zadáš cíl a necháš ho najít cestu. Běžnému GPT
modelu musíš přesněji popsat, jak má úkol provést a jak má vypadat výsledek. Nespoléhej na to, že model sám odvodí všechny kroky; do promptu
vlož důležité informace a pravidla. Slabší zadání: „Napiš kvalitní výklad runy Gebo.“ Lepší zadání: „Napiš výklad runy Gebo. Zaměř se na
přijímání darů a na situaci, kdy člověk cítí potřebu okamžitě něco vrátit. Vytvoř jednu konkrétní scénu z každodenního života. Ukaž v ní
psychologické napětí mezi přijetím daru a pocitem závazku. Výklad napiš v rozsahu 80–100 slov.“

**3. Doporučená struktura promptu** (syntéza, ne povinná šablona): 1 ROLE / IDENTITY · 2 TASK / OBJECTIVE · 3 CONTEXT · 4 CORE PRINCIPLES ·
5 RULES / CONSTRAINTS · 6 METHOD / APPROACH · 7 OUTPUT FORMAT · 8 EXAMPLES. Nemusí být vždy všech osm.
- Role: kdo model je, co zná, vztah k tématu, hlavní účel. Příklad: „You are Rúnar, keeper of the runes. You know the runes and the world
  they come from. You speak as someone who has seen a good deal and can show what a rune means through ordinary human experiences.“
  Nedělat: „You are the world's greatest rune expert, the most profound spiritual guide…“ — role má určovat způsob práce, ne výjimečnost.
- Úkol: jednoznačný. „Write one reading of the rune Raidho. The reading must show movement with a direction through one concrete everyday situation.“
- Kontext: co model nemůže bezpečně odvodit. „THE MEANING: Movement with a direction, rhythm, a process that unfolds, the right moment.
  WHERE THIS MEANING GOES WRONG: Lost direction, delay, being out of step, moving without an aim.“
- Pravidla: konkrétní a slučitelná. „Use plain, everyday English. Use one concrete scene. Do not predict the future. Do not explain the rune
  academically. Do not use self-help language.“ Zákazy jen tam, kde brání konkrétnímu problému.

**4. Co funguje nejlépe.**
- A. Jedna instrukce = jeden význam. Pět formulací téhož („Be clear. Use simple language. Avoid complicated language. Write in plain words.
  Do not use difficult expressions.“) → „Use plain, everyday language.“
- B. Říkej, co má dělat, ne jen co nemá. „Do not write abstract explanations.“ → „Show the meaning through one concrete everyday scene.“
  „Do not sound like a motivational speaker.“ → „Speak plainly, as someone describing something they have personally observed.“
  (GPT uvádí jako zdroj Hugging Face a Microsoft.)
- C. Příklady místo dlouhého vysvětlování (few-shot): dvojice zadání → ukázka výstupu; několik různorodých. Počet: 0 jednoduchý úkol ·
  1 jednoduchý styl · 2–3 specifický styl · 4–5 složitější vzorce · 6+ jen když přinášejí nové. Pozor: deset téměř stejných ukázek naučí
  opakovat konstrukci, ne princip — zvlášť u kreativní tvorby.
- D. Délku přesně: „Write 50–58 words.“ / „Write exactly 3 paragraphs. Each paragraph must contain 2–3 sentences.“
- E. Odděluj instrukce od dat: nadpisy „# INSTRUCTIONS“, „# RUNE DATA“, „# OUTPUT“; Markdown, trojité uvozovky, XML značky.
- F. Rozlišuj důležitost: „# PRIMARY PRINCIPLES“, „# STYLE“, „# RESTRICTIONS“.
- G. Nevynucuj chain of thought („Think step by step…“). Místo toho postup: „Identify the central meaning of the rune. Choose one everyday
  situation that expresses it. Write the reading through that situation.“

**5. Čemu se vyhnout:** příliš mnoho zákazů → definovat žádoucí chování · opakování instrukcí → každé pravidlo jednou · abstraktní požadavky →
konkrétní popis · příliš mnoho úkolů → oddělit · příliš mnoho příkladů → různorodé · nejasná délka → počet slov · protichůdná pravidla →
priority · přehnaná role → funkční identita · nejasný výstup → přesný formát. Microsoft Foundry: hledat i instrukce nadbytečné, protichůdné, irelevantní.

**6. Jak dlouhý prompt:** rozhoduje, zda každá informace přispívá. Krátký pro jednoduchý úkol, střední pro specifický styl, dlouhý pro
specializovaný systém. Jeden publikovaný test GPT-6 uvádí zlepšení po zjednodušení (konkrétní workflow, ne obecný důkaz).

**7. Jak testovat:** první verze → 10 různých vstupů → výstupy se stejným nastavením → označit nedostatky → upravit JEDNU skupinu instrukcí →
stejných 10 testů → porovnat. Neměnit pět částí naráz. Kritéria: Compliance, Consistency, Specificity, Style, Originality, Relevance.

**8. Šablona:** `# IDENTITY` (You are [ROLE]. Your purpose is [PURPOSE].) · `# TASK` · `# CONTEXT` · `# CORE PRINCIPLES` · `# METHOD` (1–3 kroky) ·
`# STYLE` · `# RESTRICTIONS` · `# OUTPUT` (Format, Length, Language; „Return only the requested output.“). Ne každá sekce je nutná.

**9. Kreativní úkoly:** definovat tvůrčí mechanismus. „Show the meaning of Raidho through one ordinary moment in which someone is moving
towards a destination. Let the meaning emerge from what happens in the scene. Do not explain the symbolism separately.“ Tři techniky:
(1) jak má výsledek vzniknout; (2) kvalita konkrétními vlastnostmi („Use concrete details. Let the image carry the meaning. Use natural speech.
Leave room for the reader to recognize their own experience.“); (3) ukázky, které předvádějí princip, ne hotovou podobu jednoho tématu.

**10. Zdroje podle GPT:** OpenAI Prompt Engineering Guide · OpenAI Using GPT-6 · Microsoft Prompt Engineering Techniques · Hugging Face
Prompting · Spectrum AI Labs „7 Prompting Patterns for GPT-6“ · PrompTessor „GPT-6 Sol Prompting Guide“.

**11. Sedm pravidel podle GPT:** clear task · relevant context · explicit instructions · priorities · examples · output control · testing.
Závěr GPT: u modelu bez reasoning má prompt fungovat jako dobře definovaný pracovní postup. Návrh GPT na další krok: tři verze jednoho
promptu (A minimal, B structured, C example-driven) na stejných deseti runových zadáních, stejná kritéria.

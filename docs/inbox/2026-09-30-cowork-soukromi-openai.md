psáno proti commitu 07df6c2 (tvůj handoff; HEAD jsem sám neověřoval)
// [HOTOVO] Cowork-tune → CODE-tune · Soukromí před přechodem uživatelů na GPT-6 sol. 2026-09-30.
// Značky: [P] = primární zdroj, přečetl jsem ho · [S] = sekundární zdroj, sám jsem neověřil · [M] = změřil jsem sám · NEVÍM.
// Všechny zdroje přečtené 2026-09-30. Není to právní posudek (RUNAR_PRIVACY.md: právní kontrola před publikací).
// ZMĚNĚNO: nic. IS texty = NEOVĚŘENÝ návrh (is-vazba z mého prostředí nedosáhne na API, 403) → ověř nástroji.

═══════════════════════════════════════════════════════════════════════
ZÁVĚR NAPŘED
═══════════════════════════════════════════════════════════════════════
1. **OpenAI a Anthropic se dají v souhlasu popsat stejným měřítkem.** Oba: bez tréninku na datech z API,
   standardně nejvýš 30 dní uchovávání kvůli kontrole zneužití, ZDR jen přes obchod, přenos do USA přes SCC.
   Ani jeden nemá certifikaci DPF. Hlavní rozdíl: u OpenAI se musí aktivně podepsat DPA (viz 2).
2. **Úkol pro ownera před přepnutím: podepsat DPA OpenAI.** Pro zákazníka z EHP ho uzavírá **OpenAI Ireland Ltd.**
   Text říká, že platí i kliknutím nebo samotným používáním, ale na stránce je i odkaz „Execute Data Processing
   Agreement" (Ironclad). Podepsat, ať máme doklad. U Anthropicu je DPA automaticky součástí Commercial Terms.
3. **Island nic navíc nepotřebuje.** Adekvátnost DPF platí v EHP od 6. 7. 2024 (JCD 169/2024). Protože ale ani
   OpenAI, ani Anthropic certifikaci nemají, jede se v obou případech přes SCC, stejně jako v EU. Persónuvernd
   žádný zvláštní islandský požadavek nevyhlásil — aspoň jsem žádný nenašel (NEVÍM jistě).
4. **Souhlas testerů vynulovat, stejně jako 2026-09-11 (8).** Ale AŽ VE CHVÍLI PŘEPNUTÍ, v témže nasazení.
   Dřív ne: text by jmenoval zpracovatele, který se ještě nepoužívá, a to je taky nepravda.
5. ⚠ **MIMO ZADÁNÍ, ale spěchá: veřejné zásady „Your readings" už DNES neříkají, že čtení jde do USA.** Stojí tam jen
   „Your data is hosted within the EU (our processor, Supabase)" (RUNAR_PRIVACY.md ř. 51 / IS ř. 60). Anthropic ani
   ElevenLabs tam nejsou. Je to přesně ta vada, kterou 2026-09-11 (8) opravilo v souhlasu, jen v zásadách
   zůstala. Běžní uživatelé souhlas nedávají, takže **zásady jsou pro ně jediné místo, kde se to dozvědí.**
   Opravit hned, nečekat na OpenAI (§22).

═══════════════════════════════════════════════════════════════════════
1) OpenAI API — fakta
═══════════════════════════════════════════════════════════════════════
- **Trénink:** „As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models
  (unless you explicitly opt in…)." Výchozí stav = netrénuje, nic se vypínat nemusí; tabulka endpointů má u
  /v1/chat/completions i /v1/responses „Data used for training: No". [P] developers.openai.com/api/docs/guides/your-data
- **Uchovávání:** záznamy pro kontrolu zneužití „retained for up to 30 days, unless longer retention is required by
  law, or is reasonably necessary to protect our services or any third party from harm". [P] tamtéž
  Pozor u /v1/responses: ve výchozím nastavení (i se `store=true`) se data aplikace drží aspoň 30 dní → CODE: posílej
  `store=false`, nebo použij chat/completions. [P] tamtéž
- **Kdo čte nahlášený obsah:** pro obsah, který modely označí za porušení, může OpenAI poslat vzorky
  subzpracovatelům na moderaci — **TaskUs (Filipíny), Accenture (USA/Kanada/Filipíny)**. [P] openai.com/policies/sub-processor-list (aktualizováno 9. 7. 2026)
- **ZDR / Modified Abuse Monitoring:** „subject to prior approval by OpenAI", přes obchod (contact-sales).
  Nahlášený CSAM v obrázcích se drží i se ZDR (nás se netýká, neposíláme obrázky). [P] your-data
- **EU data residency:** EXISTUJE. Endpoint `eu.api.openai.com`, zpracování i uložení v „Europe (EEA + Switzerland)".
  GPT-6 Sol / 6.1 Sol / 6 Luna: EU residency se Standard, Flex a Batch; **Fast mode v EU nejde**. Cena: **+10 %** pro
  modely vydané od 5. 3. 2026. Podmínky: obchod ověří nárok + **schválení MAM nebo ZDR + podepsaný dodatek „Modified
  Retention"**. Systémová data (účet, metadata, fakturace) do regionu nespadají. [P] your-data, sekce Data residency
  → Jestli na to náš malý účet dosáhne: **NEVÍM** (rozhoduje obchod). A hlavně: **hlas pořád jde k ElevenLabs do USA**,
  takže ani EU residency z textu souhlasu „USA" neodstraní. Zlepší jen tu část, co jde k modelu.
- **Subzpracovatelé (API):** Cloudflare, Microsoft, CoreWeave, Oracle, Google Cloud, AWS, Cerebras, Snowflake*,
  TaskUs, Intercom, Salesforce, Pylon, Accenture, Confluent*, Cinder*, Okta (*kromě ZDR). Z OpenAI entit: OpCo
  a OpenAI LLC (USA), OpenAI Ireland Ltd.; mezi sebou používají SCC. [P] sub-processor-list 9. 7. 2026

═══════════════════════════════════════════════════════════════════════
2) Smluvní základ
═══════════════════════════════════════════════════════════════════════
- **DPA OpenAI** (platné od 1. 1. 2026): smluvní strana je OpenAI OpCo, LLC, **„unless Customer is based within
  a European Economic Area country or Switzerland, in which case it is entered into with OpenAI Ireland Ltd."**
  Uzavírá se „By clicking 'I agree,' accepting the Order Form, or using the Services" a na stránce je i
  „Execute Data Processing Agreement" (Ironclad). OpenAI zpracovává jako zpracovatel (processor), jen podle pokynů,
  pomáhá s DPIA, hlásí únik „without undue delay", změnu subzpracovatele oznámí a dá 30 dní na námitku.
  §4.1: přenos z EHP do USA = **SCC** (nebo rozhodnutí o adekvátnosti). Schedule 1: „No sensitive data is intended
  to be transferred unless the user includes it unexpectedly in unstructured data" → přesně náš případ volné otázky. [P] openai.com/policies/data-processing-addendum
- **DPF:** OpenAI ani Anthropic v aktivním seznamu dataprivacyframework.gov NEJSOU. [M] 2026-09-30: hledání „OpenAI"
  → „Query returned no results", „Anthropic" → totéž. **Kontrola nástroje:** „Microsoft" → nalezeno „Microsoft
  Corporation", takže hledání funguje. Neaktivní seznam jsem neprošel. Sekundární zdroj uvádí prázdné i neaktivní
  seznamy k 8. 9. 2026. [S] companyscope.io
- **Island:** EU-US DPF (rozhodnutí 2023/1795) je v EHP začleněné rozhodnutím EEA JCD **169/2024**, platí od
  **6. 7. 2024**. [P] efta.int/eea-lex/32023d1795. Pro nás to nic nemění, protože ani jeden dodavatel certifikaci nemá
  → SCC (+ posouzení dopadu přenosu), stejně jako v EU. Zvláštní požadavek Persónuvernd: **NEVÍM, nenašel jsem.**

═══════════════════════════════════════════════════════════════════════
3) Srovnání s Anthropicem (aby souhlas měřil oba stejně)
═══════════════════════════════════════════════════════════════════════
| | OpenAI API | Anthropic API |
|---|---|---|
| Trénink na datech | ne, výchozí stav [P] | ne „without your express permission" [P] |
| Standardní uchovávání | do 30 dní kvůli kontrole zneužití, déle ze zákona / při ochraně [P] | smaže „within 30 days", výjimky: zákon, Usage Policy [P] |
| Nahlášený obsah | vzorky subzpracovatelům na moderaci (i mimo USA) [P] | vstupy/výstupy až 2 roky, skóre až 7 let [P] |
| ZDR | přes obchod, se schválením [P] | přes obchod [P]; Fable/Mythos vyžadují 30 dní |
| DPA | nutno přijmout / podepsat; pro EHP OpenAI Ireland [P] | automaticky součástí Commercial Terms [P] |
| Přenos do USA | SCC [P] | SCC Module 2/3, irské právo [P] |
| DPF | ne [M] | ne [M] |
| EU zpracování | eu.api, +10 %, se schválením [P] | `inference_geo` existuje [P]; EU volbu a cenu jsem neověřil (NEVÍM) |
Zdroje Anthropic: platform.claude.com/docs/en/manage-claude/api-and-data-retention · privacy.claude.com článek 7996866
(1. 7. 2026) · anthropic.com/legal/data-processing-addendum (účinné 24. 2. 2025).
→ Poctivá společná věta do souhlasu: „netrénuje na tom a drží to nejvýš 30 dní kvůli kontrole zneužití". Platí
  pro oba — u obou s výhradou nahlášeného obsahu a zákona. Tahle výhrada patří do zásad, ne do krátkého souhlasu.

═══════════════════════════════════════════════════════════════════════
4) Tři otázky na CODE (kód nevidím, nediagnostikuju)
═══════════════════════════════════════════════════════════════════════
Q1. **Zůstane po přepnutí v řetězci záložní Anthropic?** Pokud ano, text musí jmenovat OBA (varianta níž).
Q2. **Potřebuje prompt životní runy ROK narození?** Od 2026-09-27 (5) se runa počítá jen z měsíce a dne. Řádek
    „BORN: den měsíc rok" by pak posílal do USA víc osobních údajů, než je potřeba (GDPR čl. 5 odst. 1 písm. c —
    minimalizace). Jestli ho hlas čtení nepotřebuje, rok vypustit — pro Anthropic i OpenAI.
Q3. **Jde to k OpenAI přes /v1/responses?** Pokud ano, posílá se `store=false`? (Výchozích 30 dní uchovávání
    stavu aplikace, viz výš.)

═══════════════════════════════════════════════════════════════════════
5) NÁVRH TEXTŮ (EN hotová · IS = NEOVĚŘENÝ návrh → is-vazba / yfirlestur / is-grammar-qa)
═══════════════════════════════════════════════════════════════════════
(a) tcm_body — varianta „jen OpenAI" (když Q1 = ne)

```
EN:
To help us make the readings better, we store the readings you draw and review their text and the details you enter, to improve the quality of Rúnar. For a reading to exist at all, the details you enter are sent to OpenAI, which writes it, and its text to ElevenLabs for the voice — both in the United States. OpenAI does not use them to train its models and keeps them for no more than 30 days, to check for misuse. What we keep is stored in the EU, we never sell it, and you can ask us to delete it at any time. You can stop testing whenever you like.

IS:
Til að hjálpa okkur að bæta lestrana geymum við lestrana sem þú dregur og förum yfir texta þeirra og upplýsingarnar sem þú slærð inn. Til að lestur verði til eru upplýsingarnar sem þú slærð inn sendar til OpenAI, sem semur hann, og texti hans til ElevenLabs sem ljær honum rödd — hvort tveggja í Bandaríkjunum. OpenAI notar þær ekki til að þjálfa líkön sín og geymir þær ekki lengur en í 30 daga, til að fylgjast með misnotkun. Það sem við geymum er geymt innan EES, við seljum það aldrei, og þú getur beðið um að því verði eytt hvenær sem er. Þú getur hætt að prófa hvenær sem þér hentar.
```
Varianta „OpenAI + záložní Anthropic" (když Q1 = ano) — změní se jen jedna věta:
```
EN: …are sent to OpenAI, which writes it (or to Anthropic, if OpenAI is unavailable), and its text to ElevenLabs for the voice — all in the United States. Neither OpenAI nor Anthropic uses them to train its models, and each keeps them for no more than 30 days, to check for misuse.
IS: …eru sendar til OpenAI, sem semur hann (eða til Anthropic ef OpenAI svarar ekki), og texti hans til ElevenLabs sem ljær honum rödd — allt í Bandaríkjunum. Hvorki OpenAI né Anthropic notar þær til að þjálfa líkön sín, og hvort um sig geymir þær ekki lengur en í 30 daga, til að fylgjast með misnotkun.
```
IS — co ověřit nástroji: „ljá e-u rödd" (vazba) · „fylgjast með misnotkun" · „þjálfa líkön" · „hvort um sig" (rod
u dvou firem) · „svarar ekki" jako „is unavailable". Zbytek věty je převzatý z ověřeného současného tcm_body.
Proč „ekki lengur en" (= nejvýš), ne „eytt innan 30 daga" (= smaže do 30 dní): OpenAI slibuje „up to 30 days"
s výhradami, ne jisté smazání. Formulace nesmí slíbit víc, než slibuje zdroj.

(b) Zásady „Your readings" — do stávajícího odstavce vložit jednu větu za „…from the details you provide."
a upravit větu o EU (nutné UŽ TEĎ s Anthropicem, bod 5 závěru; při přepnutí jen vyměnit jméno):
```
EN (vložit):
To write it, the details you provide are sent to OpenAI, and its text to ElevenLabs to give it a voice — both in the United States. OpenAI processes them only on our behalf, under a data processing agreement based on the EU standard contractual clauses; it does not use them to train its models and keeps them for no more than 30 days, to check for misuse, unless the law requires longer or the content is flagged as misuse.
EN (nahradit „Your data is hosted within the EU (our processor, Supabase).") :
What we store is hosted within the EU (our processor, Supabase).

IS (vložit):
Til að semja hann eru upplýsingarnar sem þú gefur sendar til OpenAI, og texti hans til ElevenLabs sem ljær honum rödd — hvort tveggja í Bandaríkjunum. OpenAI vinnur þær aðeins fyrir okkar hönd, samkvæmt vinnslusamningi sem byggir á stöðluðum samningsákvæðum ESB; fyrirtækið notar þær ekki til að þjálfa líkön sín og geymir þær ekki lengur en í 30 daga, til að fylgjast með misnotkun, nema lög krefjist lengri tíma eða efnið sé merkt sem misnotkun.
IS (nahradit „Gögnin þín eru hýst innan EES (vinnsluaðili okkar, Supabase).") :
Það sem við geymum er hýst innan EES (vinnsluaðili okkar, Supabase).
```
⚠ Do (b) jsem ElevenLabs smluvně NEpopsal: jejich DPA, retenci ani trénink jsem nezkoumal (NEVÍM). Než se zásady
publikují, doplnit stejnou větou jako OpenAI, ale jen podle jejich ověřených podmínek.
⚠ IS termín pro SCC: „stöðluð samningsákvæði" × Persónuvernd možná používá jiný ustálený termín → ověřit proti
persónuvernd.is, ne odhadem.

(c) Vynulovat souhlas testerů? **ANO**, podle precedensu 2026-09-11 (8): nový zpracovatel znamená, že souhlas byl
dán na textu, který už nepopisuje skutečnost. **Načasování:** v témže nasazení, které přepne MODELS pro uživatele
— ne dřív, ne později. Zapsat datovaný záznam (§16) s odkazem na (8).

═══════════════════════════════════════════════════════════════════════
6) Přiznané mezery
═══════════════════════════════════════════════════════════════════════
- ElevenLabs (retence, trénink, DPA, DPF) — nezkoumal jsem, nebylo v zadání. Jejich jméno ale v textu je.
- Neaktivní seznam DPF — neprošel jsem ho sám.
- Zvláštní požadavky Persónuvernd na přenos do USA — žádné jsem nenašel. To neznamená, že neexistují.
- Nárok našeho účtu na EU residency / ZDR — rozhoduje obchod OpenAI.
- Volná otázka může nést údaje čl. 9 (zdraví…). U běžných uživatelů je to otázka právního základu — patří na
  seznam pro DPO. Neposuzuju to. Možná levná pomoc: nápověda u pole otázky („nepiš nic, co bys nechtěl
  posílat…"). Obsah by dodal Cowork, kdyby owner chtěl.
- Pozn. mimochodem: OpenAI už uvádí **GPT-6.1 Sol** (odkaz v patičce jejich webu). EU residency pokrývá obě verze.

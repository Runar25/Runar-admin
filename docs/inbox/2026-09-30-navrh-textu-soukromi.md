# NÁVRH — texty soukromí (EN + IS) · CODE-tune 2026-09-30 · čeká na právní kontrolu a ownerovo „publikovat“

Owner 2026-09-30 k bodu 2 („⚠️ zásady ani appka neříkají, že čtení jde do USA — připravit opravené texty?“): **„ano“**.
Fakta o zpracovatelích z rešerše Cowork (`docs/inbox/2026-09-30-cowork-soukromi-openai.md`, zdroje [P] tam). Co jde k modelu:
`RUNAR_PRIVACY.md` (odrážka „Co jde k modelu“; od v4.82 bez roku narození). IS psáno islandsky a ověřeno (is-grammar-qa + korpus,
čísla níž). **Nic z toho zatím není nasazené** — právní text, publikuje se až po kontrole.

## A) Stránka soukromí v appce — `v2/runar-privacy.html`, sekce „WHO ELSE SEES IT“ / „HVERJIR SJÁ ÞAÐ“

Proč: dnes u Supabase stojí **„Your data never leaves the European Economic Area“** — text čtení přitom jde k Anthropicu a hlas
k ElevenLabs, obojí do USA. Anthropic ani ElevenLabs tam nemají zemi. Věta o Anthropicu uvádí jen „your question and the rune drawn“
— jde i jméno, volby a u životní runy den a měsíc narození. IS navíc má gramatickou chybu **„Engin gögn eru deilt“** (deila chce 3. pád
→ „Engum gögnum er deilt“, korpus „upplýsingum er deilt“ 19).

**EN (nahradit odstavce Supabase / Anthropic / ElevenLabs; úvod a „No data is sold…“ beze změny):**
```
Supabase (database & authentication) — servers in EU West (Ireland). What we store stays in the European Economic Area.
Anthropic (AI readings, United States) — to write your reading we send the details you enter (your name if you give one, your choices and your question) and the runes drawn; for your life rune, also your day and month of birth. Anthropic does not use them to train its models and deletes them within 30 days, unless the law requires longer or they are flagged for misuse. The transfer rests on the EU standard contractual clauses.
ElevenLabs (voice, United States) — the text of your reading is sent only when you play the voice.
```
**IS:**
```
Supabase (gagnagrunnur og auðkenning) — þjónar í Vestur-Evrópu (Írland). Það sem við geymum helst innan Evrópska efnahagssvæðisins.
Anthropic (gervigreind, Bandaríkin) — til að semja lesturinn sendum við upplýsingarnar sem þú slærð inn (nafn þitt ef þú gefur það upp, val þitt og spurningu) og rúnirnar sem dregnar eru, og fyrir lífsrúnina einnig fæðingardag og mánuð. Anthropic notar þær ekki til að þjálfa gervigreind sína og eyðir þeim innan 30 daga, nema lög krefjist lengri tíma eða þær séu merktar sem misnotkun. Flutningurinn byggir á stöðluðum samningsskilmálum ESB.
ElevenLabs (rödd, Bandaríkin) — texti lesturs þíns er aðeins sendur þegar þú spilar röddina.
Engin gögn eru seld. Engum gögnum er deilt með auglýsendum eða gagnasölum. Aldrei.
```
Ověřeno: is-grammar-qa bez vad (šum: „Evrópska“ = oficiální název EES, „lífsrúnina“ = náš termín, „Aldrei.“ = fragment, už na stránce);
korpus „þjálfa gervigreind“ 6 · „stöðluðum samningsskilmálum“ 31 · „fæðingardag og“ 325 · „þegar þú spilar“ 573.

## B) Zásady na agndofa.is — „Your readings“ (znění vlastní `RUNAR_PRIVACY.md`)

**EN — vložit za „…is generated from the details you provide.“:**
```
To write it, the details you provide are sent to Anthropic, and its text to ElevenLabs to give it a voice — both in the United States. Anthropic processes them only on our behalf, under the EU standard contractual clauses; it does not use them to train its models and deletes them within 30 days, unless the law requires longer or the content is flagged for misuse.
```
**EN — nahradit** „Your data is hosted within the EU (our processor, Supabase).“ → „What we store is hosted within the EU (our processor, Supabase).“

**IS — vložit za „…saminn út frá upplýsingunum sem þú gefur.“:**
```
Til að semja hann eru upplýsingarnar sem þú gefur sendar til Anthropic og texti hans til ElevenLabs sem ljær honum rödd. Bæði fyrirtækin eru í Bandaríkjunum. Anthropic vinnur upplýsingarnar aðeins fyrir okkar hönd og samkvæmt stöðluðum samningsskilmálum ESB. Fyrirtækið notar þær ekki til að þjálfa gervigreind sína og eyðir þeim innan 30 daga, nema lög krefjist lengri tíma eða efnið sé merkt sem misnotkun.
```
**IS — nahradit** „Gögnin þín eru hýst innan EES (vinnsluaðili okkar, Supabase).“ → „Það sem við geymum er hýst innan EES (vinnsluaðili okkar, Supabase).“
Ověřeno: is-grammar-qa bez vad; korpus „ljær honum rödd“ 7 · „vinnur þær“ 51.

## C) Souhlas testerů `tcm_body` — AŽ při přepnutí na GPT (owner „3. ano“: vynulovat souhlas v témže nasazení)

Varianta Coworku „OpenAI + záložní Anthropic“ (záložní Anthropic v kódu ZŮSTÁVÁ — Q1). **EN** beze změny od Coworku:
```
…are sent to OpenAI, which writes it (or to Anthropic, if OpenAI is unavailable), and its text to ElevenLabs for the voice — all in the United States. Neither OpenAI nor Anthropic uses them to train its models, and each keeps them for no more than 30 days, to check for misuse.
```
**IS — přepsáno** (Coworkova první věta = E001; „þjálfa líkön“ korpus 0 → „þjálfa gervigreind“ 6):
```
Til að lestur verði til eru upplýsingarnar sem þú slærð inn sendar til OpenAI, sem semur hann. Ef OpenAI svarar ekki fara þær til Anthropic. Texti lestursins fer til ElevenLabs sem ljær honum rödd. Öll þessi fyrirtæki eru í Bandaríkjunum. Hvorki OpenAI né Anthropic notar þær til að þjálfa gervigreind sína, og hvort um sig geymir þær ekki lengur en í 30 daga til að fylgjast með misnotkun.
```

## K právní kontrole (co neumím potvrdit)
1. Islandský termín pro SCC: „staðlaðir samningsskilmálar“ (korpus 36) × „stöðluð samningsákvæði“ (21) — který používá Persónuvernd.
2. Anthropic „deletes within 30 days“ — Cowork [P] platform.claude.com (API data retention); výjimky zákon + zneužití uvedeny.
3. ElevenLabs — podmínky (trénink, uchovávání, DPA) NEZKOUMÁNY → text o nich tvrdí jen, co se posílá a kam.
4. Před přepnutím na GPT: podepsat DPA OpenAI (pro EHP OpenAI Ireland Ltd.) — owner „1. ano“.

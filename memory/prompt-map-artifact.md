---
name: prompt-map-artifact
description: Vizuální reference mapa Rúnarova reading-promptu (jak a z čeho mluví) — artifact URL + pravidlo překreslování
metadata: 
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-16T20:47:06.305Z
---

Vizuální mapa **„jak a z čeho Rúnar mluví"** — 3 vrstvy (systémový prompt/charakter · reading stack · korekce → `claude-opus-4-8` → JSON → jeden odstavec), + tabulka „kde ladit nuanci" + seznam „co je mrtvé/nehoň to".

**URL:** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69
(privátní, jen owner; galerie `claude.ai/code/artifacts`.)

⛔ **ARCHIVOVÁNO 2026-08-22 — „Engine pestrosti" (návrhová mapa 4 pák) SKONČIL.** Vznikl
2026-08-20, aby se návrh nepletl s produkcí; o dva dny později produkce tytéž problémy vyřešila
jinak (řada v4.0–v4.5-mynd) a owner tu exploraci ukončil: *„s pole končíme, nikdo na tom nedělá."*
Zdroj přesunut do `docs/archive/runar-engine-map.html`; artifact
https://claude.ai/code/artifact/5c527b2d-15f0-4f00-a6c7-a593c4b6118a zůstává jako **historický
snímek k 20. 8.**, NEpřekresluje se a nečte se jako stav. Proč která páka padla → `RUNAR_DECISIONS.md`
2026-08-22. **Živá je jen jedna mapa — ta produkční nahoře.**

⚠️ **Je to SNAPSHOT.** Pravda = KÓD: `v2/runar-character.js` (buildSysPrompt · RP_* · buildReadingPrompt · helpery) · `runar-config.js` (VOICE_PROFILES.focused · RUNAR_MODES) · `supabase/functions/claude-proxy/index.ts` (MODELS). NEdělat z toho repo doc (§20 — duplikoval by kód a zastarával).

⭐ **SEKCE „co prompt stojí" SE NEEDITUJE RUČNĚ — generuje se z kódu:**
`node scripts/utils/lint_prompts.js --map <cesta-k-html>` přepíše obsah mezi značkami
`<!-- AUTO-ROZPIS:start -->` a `:end` (postaví 2100 kombinací a spočítá slova na slot).
Bez cesty k souboru jen vypíše „soubor mapy nenalezen". Vzniklo proto, že právě tahle část
driftovala nejvíc — čtyři ruční překreslení za dva dny a jednou 14 ze 14 chybných čísel řádků.
**Spusť to jako první**; razítko `v2.x` se tím aktualizuje samo.

⭐ **PRAVIDLO (KUKY 2026-08-08): měníš-li prompt / hlas → překresli mapu ve STEJNÉM tahu.** Jinak se
rozejde a příští session z ní čte nepravdu. Mapa má nahoře **razítko** (datum + `RUNAR_PROMPT_VERSION`)
a krátký changelog „co se změnilo" — obojí aktualizovat. Překreslení: HTML zdroj mapy **JE v repu**
(`docs/runar-prompt-map.html`, git-tracked); uprav ho a publikuj **na tutéž URL** (`Artifact`
s `url:`). ⚠️ Do 2026-08-20 tu stálo „není v repu, leží ve scratchpadu session" — prokazatelně
nepravda (`git ls-files` ho vrací, 45 427 B) a návod tím vyráběl scratchpad-sirotky. Ověřeno CODE-read.
⚠️ **Repo kopie a publikovaný artifact se rozešly:** repo HTML nese razítko `v2.0`, `runar-config.js`
i publikovaná mapa `v2.1`. Než se do mapy zapíše cokoli dalšího, patří to srovnat — jinak se píše
do kopie, která už není ta publikovaná. Z jiné session než
té, co ji vydala, se URL MUSÍ předat explicitně, jinak vznikne nová. Před publikací WebFetch aktuální
verzi (guard hlídá, že nepřepíšeš cizí změnu) + zkontroluj párování tagů.

✅ **Uzavřeno 2026-08-07:** `select id, active from public.runar_character where active=true` → **0 řádků**,
takže **file `DEF_CHAR` je živý hlas** a mapa je v tomhle přesná. Loader v `runar-app.js:1380` je ale pořád
zadrátovaný (editor charakteru = shrine Rúnar lab je mrtvý) → neškodí, dokud tabulka nemá aktivní řádek,
ale zaslouží smazat. Kdyby se tam někdy řádek objevil, přebil by file DEF_CHAR potichu.

---
name: prompt-map-artifact
description: Vizuální reference mapa Rúnarova reading-promptu (jak a z čeho mluví) — artifact URL + pravidlo překreslování
metadata: 
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-08T16:06:24.297Z
---

Vizuální mapa **„jak a z čeho Rúnar mluví"** — 3 vrstvy (systémový prompt/charakter · reading stack · korekce → `claude-opus-4-8` → JSON → jeden odstavec), + tabulka „kde ladit nuanci" + seznam „co je mrtvé/nehoň to".

**URL:** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69
(privátní, jen owner; galerie `claude.ai/code/artifacts`.)

⚠️ **Je to SNAPSHOT.** Pravda = KÓD: `v2/runar-character.js` (buildSysPrompt · RP_* · buildReadingPrompt · helpery) · `runar-config.js` (VOICE_PROFILES.focused · RUNAR_MODES) · `supabase/functions/claude-proxy/index.ts` (MODELS). NEdělat z toho repo doc (§20 — duplikoval by kód a zastarával).

⭐ **PRAVIDLO (KUKY 2026-08-08): měníš-li prompt / hlas → překresli mapu ve STEJNÉM tahu.** Jinak se
rozejde a příští session z ní čte nepravdu. Mapa má nahoře **razítko** (datum + `RUNAR_PROMPT_VERSION`)
a krátký changelog „co se změnilo" — obojí aktualizovat. Překreslení: HTML zdroj mapy **není v repu** —
leží ve scratchpadu session (soubor `runar-prompt-map`); uprav ho a publikuj **na tutéž URL** (`Artifact`
s `url:`). Nemáš-li ho po ruce, stáhni si aktuální HTML z URL a edituj to. Z jiné session než
té, co ji vydala, se URL MUSÍ předat explicitně, jinak vznikne nová. Před publikací WebFetch aktuální
verzi (guard hlídá, že nepřepíšeš cizí změnu) + zkontroluj párování tagů.

✅ **Uzavřeno 2026-08-07:** `select id, active from public.runar_character where active=true` → **0 řádků**,
takže **file `DEF_CHAR` je živý hlas** a mapa je v tomhle přesná. Loader v `runar-app.js:1380` je ale pořád
zadrátovaný (editor charakteru = shrine Rúnar lab je mrtvý) → neškodí, dokud tabulka nemá aktivní řádek,
ale zaslouží smazat. Kdyby se tam někdy řádek objevil, přebil by file DEF_CHAR potichu.

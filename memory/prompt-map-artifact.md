---
name: prompt-map-artifact
description: Vizuální reference mapa Rúnarova reading-promptu (jak a z čeho mluví) — artifact URL
metadata: 
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-06T21:53:33.453Z
---

Vizuální mapa **„jak a z čeho Rúnar mluví"** — 3 vrstvy (systémový prompt/charakter · reading stack · korekce → `claude-opus-4-8` → JSON → jeden odstavec), + tabulka „kde ladit nuanci" + seznam „co je mrtvé/nehoň to".

**URL:** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69
(privátní, jen owner; galerie `claude.ai/code/artifacts`.)

⚠️ **Je to SNAPSHOT** (2026-08). Pravda = KÓD: `v2/runar-character.js` (buildSysPrompt · RP_* · buildReadingPrompt · helpery) · `runar-config.js` (VOICE_PROFILES.focused · RUNAR_MODES) · `supabase/functions/claude-proxy/index.ts` (MODELS). Když se prompt změní, **přepublikovat na stejné URL** (mapping workflow → re-render). NEdělat z toho repo doc (§20 — duplikoval by kód a zastarával).

**Otevřený nález k ověření (owner spustí SQL, Code na prod DB nevidí):** reader načítá charakter z `runar_character` (`active=true`, `runar-app.js:1380`) do `buildSysPrompt` — i když je **editor charakteru (shrine Rúnar lab) mrtvý.** Starý `active=true` řádek by potichu přebil file `DEF_CHAR`. Check: `select id, active from public.runar_character where active=true;` → prázdné = file DEF_CHAR jede (mapa přesná); řádek = ten je živý hlas + smazat mrtvý loader.

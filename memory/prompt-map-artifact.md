---
name: prompt-map-artifact
description: Mapa Rúnarova promptu je od 2026-10-11 ZRUŠENÁ a archivovaná — nepřekresluje se, nečte se jako stav; pravda o promptu = kód
metadata:
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

⛔ **ZRUŠENO A ARCHIVOVÁNO 2026-10-11** (owner: *„zrušit a archivovat“*). Mapa „jak a z čeho Rúnar mluví“ byla z větší části ruční
kopie toho, co dělá kód, a nikdo ji neudržoval: v době zrušení stála na v4.36 (publikovaná) a v4.15 (repo), produkce na v5.08 a GPT-6 sol.
Pravidlo „měníš prompt → překresli mapu ve stejném tahu“ (KUKY 2026-08-08) tím **neplatí**.

- **Archiv:** `docs/archive/runar-prompt-map.html` (publikovaná verze v4.36 s pruhem „ARCHIVOVÁNO“); artifact
  https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69 nese týž pruh. Nečíst jako stav, nepřekreslovat.
- **Pravda o promptu = kód:** `v2/runar-character.js`, `v2/runar-utils.js`; model `SOL_MODEL` v `supabase/functions/claude-proxy/index.ts`.
- **Rozpis ceny promptu po slotech** zůstal jako výstup nástroje: `node scripts/utils/lint_prompts.js --map` (bez cesty vypíše text).
- Starší „Engine pestrosti“ mapa (archiv 2026-08-22) → `docs/archive/runar-engine-map.html`.
- Proč → `RUNAR_DECISIONS.md` 2026-10-11 („Mapa promptu zrušena a archivována“).

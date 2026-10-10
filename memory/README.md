# memory/ — sdílená paměť projektu Rúnar

Tahle složka je **jediná** auto-paměť všech session (CODE i Cowork). Platformní pamětové složky obou aplikací jsou
**junction** na ni — fyzicky jeden soubor, git ho verzuje. Pravidlo a mechanika vlastní `CLAUDE.md` §17; tady se neopisují (§20).

- **Index a rozcestník** (kde co bydlí, Session Start Protocol) → [MEMORY.md](MEMORY.md)
- **Jak spolu pracujeme** → [working-style.md](working-style.md)
- **Snapshoty** (`snapshots/`) = historický záznam ke svému datu, ne popis dneška.

## Paměť vypadá prázdná nebo zastaralá
Nejspíš appka svou složku znovu vytvořila a rozbila junction. Oprava (idempotentní, skutečnou složku před nahrazením zazálohuje):

```powershell
powershell -ExecutionPolicy Bypass -File .\memory\relink-memory.ps1
```

<!-- 2026-10-10 (CODE-read, kontrola architektury — zastaralá místa): do té doby tu stálo „obě AI session" s prohozenými rolemi
     (Code = Tree, Cowork = Main), `runar-project.md` jako sklad stacku/tierů/DB (vyprázdněn 2026-07-18) a `MEMORY.md` jako místo
     pro rozhodnutí (ta vlastní RUNAR_DECISIONS.md). Mechanika junctionu byla převyprávěná z CLAUDE.md §17 → nahrazena odkazem. -->

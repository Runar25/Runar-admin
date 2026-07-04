# memory/ — jediný zdroj sdílené paměti (§17)

Tato složka je **kanonická paměť** projektu Rúnar. Obě AI session ji čtou i zapisují:

- **Claude Code** (Tree/engine session) — auto-načítá z `…\.claude\projects\C--Users-zkuku\memory\`
- **Cowork / Claude app** (Main/reading session) — auto-načítá z `…\AppData\Roaming\Claude\memory\`

Obě tyto platformní cesty jsou **junction** (adresářový odkaz) na tuhle jednu složku
v repu. Takže **oba agenti fyzicky čtou/zapisují stejné soubory**, git to verzuje →
žádný sync skript, žádný drift. Kdo se co dozví, ví i ten druhý.

## Obsah
- `MEMORY.md` — hlavní index (Session Start Protocol, rozhodnutí, index souborů + snapshotů + Tree paměť)
- `working-style.md` — workflow pravidla (Explore→Plan→Implement, IS gramatika, atd.)
- `runar-project.md` — stack, soubory, tiery, DB, edge funkce
- `snapshots/` — datované snapshoty session
- `runar-tree-*.md`, `is-grammar-adjective-gender.md`, `runar-trunk-incremental-rule.md` — frontmatter paměti Tree session

`CLAUDE.md`, `RUNAR_DESIGN.md`, `RUNAR_PRICING.md`, `RUNAR_DECISIONS.md` **zůstávají v rootu repa**
(čtou se on-demand, ne jako auto-paměť) — sem nepatří.

## Kdyby paměť někdy vypadala prázdná / zastaralá
Nejspíš appka svou memory složku znovu vytvořila a rozbila junction. Oprava (jednou):

```powershell
powershell -ExecutionPolicy Bypass -File .\memory\relink-memory.ps1
```

Skript je idempotentní a skutečnou složku před nahrazením zazálohuje (`…memory.bak-<čas>`).

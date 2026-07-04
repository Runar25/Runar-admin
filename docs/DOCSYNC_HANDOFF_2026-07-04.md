# Doc-sync handoff pro Code — 2026-07-04
# Od: Cowork (owner-schválená změna). Pro: Code (Claude Code session).

## TL;DR
Owner (KUKY) schválil **§17: jediný zdroj pravdy = git repo**. Cowork migrovala doc soubory do repa jako **untracked**. Commit se ale nepovedl — tvůj git držel `index.lock` (byl jsi aktivní), a Cowork NEforcovala. **Potřebuju, abys dokončil: (1) commit doc souborů, (2) vepsat §17 do CLAUDE.md, (3) retire sync-to-cowork.py.**

Detail rozhodnutí + celé znění §17 → **RUNAR_DECISIONS.md, záznam „2026-07-04 — Single source of truth = git repo"**.

---

## Proč (root cause)
Doc byly rozházené ve 3 úložištích a nikdo neviděl všechno:

| doc | AppData\memory | Cowork zrcadlo | repo (= ty) |
|-----|:---:|:---:|:---:|
| MEMORY.md | ✅ | ✅ | ❌ ← tys neviděl |
| working-style.md | ✅ | ✅ | ❌ ← tys neviděl |
| runar-project.md | ❌ | ✅ | ❌ ← nikde v gitu |
| RUNAR_DECISIONS.md | ❌ | ❌ | ✅ ← Cowork přes zrcadlo neviděla |
| snapshots/ | 27 | 7 | 0 |

AppData i Cowork zrcadlo jsou **Cowork-only** → ty do nich nikdy nevidíš → nemůžou být „zero-gap s Code". Jediná společná plocha = **git repo**. Proto: repo = jediný zdroj, zbytek deprecated.

---

## Co je teď v repu (untracked, čeká na tvůj commit)
- `MEMORY.md` (199 ř.) — NOVÝ v repu (dřív jen AppData/zrcadlo). Kompletní, s indexem snapshotů.
- `working-style.md` (341 ř.) — NOVÝ v repu.
- `runar-project.md` (117 ř.) — NOVÝ v repu.
- `snapshots/` (27 souborů, top-level) — NOVÉ (repo mělo 0).
- `RUNAR_DECISIONS.md` — přidán §17 záznam (soubor je zatím untracked = jeho první commit).
- `docs/DOCSYNC_HANDOFF_2026-07-04.md` — tento soubor.

⚠️ **Nic z tvého WIP Cowork nestageovala ani necommitla.** Tvých ~26 `M` souborů (CLAUDE.md, v2/*.js, supabase funkce…) je netknutých. `v2/tree-snapshots/` (Tree session) taky nech být — není součástí tohohle.

---

## Co potřebuju od tebe — 1, 2, 3

### 1) Commit doc souborů (jen tyhle, nemíchat s tvým WIP)
```
git add MEMORY.md working-style.md runar-project.md RUNAR_DECISIONS.md snapshots/ docs/DOCSYNC_HANDOFF_2026-07-04.md
git commit -m "[docsync] Memory docs -> repo as single source (§17)"
git push
```
(Pozor: `snapshots/` = top-level, NE `v2/tree-snapshots/`.)

### 2) Vepsat §17 do CLAUDE.md
Nahradit sekci **„## Cowork sync"** zněním §17 z RUNAR_DECISIONS.md (2026-07-04). Cowork to neudělala schválně — CLAUDE.md byl dirty a mohl jsi mít otevřený buffer → riziko, že ti to přepíšu.

Znění §17 (zkráceně; plné v DECISIONS):
1. Jediný zdroj pravdy pro všechny sdílené doc (MEMORY.md, working-style.md, runar-project.md, RUNAR_*.md, tree-of-life.md, runar-patterns.md, snapshots/) = git repo. Cowork i Code editují přímo tam.
2. AppData\memory a Cowork složka NEJSOU zdroj — max. auto-generovaná read-only kopie, ručně NIKDY needitovat.
3. Každá změna doc = malý commit + push ihned, prefix `[docsync]`.
4. sync-to-cowork.py = retired.

### 3) Retire sync-to-cowork.py
Zrcadlo se ruší → skript je obsolete. Smaž nebo přepiš na repo→AppData read-only (viz otevřená otázka).

---

## Otevřená otázka (owner rozhodne)
Vyžaduje platform memory (Cowork/Claude) MEMORY.md přímo v `AppData\Roaming\Claude\memory\`? 
- Pokud ANO → necháme tam **auto-generovanou read-only kopii z repa** (jeden skript repo→AppData na konci session).
- Pokud NE → AppData\memory se úplně zruší.
Teď jsou repo i AppData identické, takže to nehoří.

---

## Pozn. k prostředí (proč commit dělal Cowork potíže)
Cowork bash mount servíroval po Edit/Write zápisech **zastaralý view** (MEMORY.md ukazoval 185 ř. místo 199, DECISIONS 116 místo 135). Proto Cowork psala výhradně host-direct (Read/Write/Edit) a `git add` přes bash odmítla (nasadil by zkrácené soubory). **Ty v nativním repu tenhle problém nemáš** — čteš skutečné soubory, takže commit v pohodě proveď ty. Když si nejsi jistý, ověř: `git show :MEMORY.md | wc -l` má dát 199 před commitem.

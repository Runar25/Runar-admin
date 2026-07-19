# Claude Memory Index
# Zkukula (Kuky) — Agndofa / Rúnar project

⚠️ **Tenhle soubor je INDEX, ne sklad faktů.** Vlastní jen dvě věci: **Session Start Protocol**
a **rozcestník** (kde co bydlí). Žádná čísla, žádné SW verze, žádné commit hashe, žádné stavy
„hotovo/TODO", žádné tier tabulky. Všechno tohle má vlastníka jinde — viz tabulka níž.

**Proč tak přísně:** do 2026-07-18 tady ta fakta byla, zastarala a **odporovala si navzájem**
(ř. 33 tvrdila „enforcement limitu = TODO", ř. 46 popisovala, jak ten enforcement funguje — obojí  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
četla každá session a hodila si mincí). Audit našel 97 rozporů nad ~12 fakty. Detail a pravidlo §20
→ `RUNAR_DECISIONS.md` 2026-07-18.

**Přidáváš sem fakt? Nepřidávej.** Patří k vlastníkovi. Sem nanejvýš jednořádkový odkaz.

---

## Session Start Protocol
Na začátku každé session PŘEČÍST V TOMTO POŘADÍ:
1. Tento soubor (MEMORY.md)
2. [working-style.md](working-style.md) — jak spolu pracujeme (Explore→Plan→Implement)
3. `CLAUDE.md` (repo root) — architektura + pravidla §1–§20
4. `RUNAR_DECISIONS.md` (repo root) — **datovaný log rozhodnutí; při sporu vyhrává novější záznam**
5. Doc podle úkolu (viz rozcestník) + cílový zdrojový soubor

Po přečtení potvrdit: „Mám kontext — jsem připraven."

⚠️ **NIKDY nezačít implementovat bez toho, aby uživatel schválil plán.**

⭐ **Když se dva zdroje rozejdou: vyhrává PRODUKCE**, pak nejnovější datovaný záznam
v `RUNAR_DECISIONS.md`. (KUKY 2026-07-18: „produkce je nejblíž tomu, jak to má být.")
Na už rozhodnutou a datovanou věc se neptej — dohledej ji.

---

## Rozcestník — kde co bydlí (jediné místo)

| Co hledáš | Vlastník |
|---|---|
| Tiery, jejich jména, limity · ceny spreadů · VOCAB · SPREAD_CONFIG | `v2/runar-config.js` — **doky to NEOPISUJÍ** |
| Runy, ætty, AREAS/SEEKS/INTENTIONS (+ `.norns` osy) | `v2/runar-runes.js` |
| Prompty, buildery, délky čtení, IS gramatický blok | `v2/runar-character.js` |
| Model čtení + fallback chain | `supabase/functions/claude-proxy/index.ts` MODELS |
| Architektura, pravidla §1–§20, DB sloupce, lanes a commit prefixy | `CLAUDE.md` |
| Proč je něco tak, jak to je (datovaná rozhodnutí) | `RUNAR_DECISIONS.md` |
| Business model, kredity, break-even, fyzické produkty | `RUNAR_PRICING.md` |
| Design, mytologie, význam částí | `RUNAR_DESIGN.md` |
| Strom života — duše, zóny, signály, Gathering | `RUNAR_TREE.md` |
| Otevřené úkoly, blockery, priority | `RUNAR_BACKLOG.md` |
| GDPR, privacy, tester consent | `RUNAR_PRIVACY.md` |
| Aktuální SW verze / commit / co je nasazené | `v2/sw.js` a `git log` — **nikdy ne v docu** |

---

## Index paměti
- [working-style.md](working-style.md) — workflow, Python skripty, IS primární jazyk, verifikace
- [is-done-together-not-for-sigrun.md](is-done-together-not-for-sigrun.md) — IS děláme rovnou pořádně a ověřeně; žádné „draft pro Sigrún"
- [handoff-text-in-code-block.md](handoff-text-in-code-block.md) — text k předání jiné session VŽDY do code blocku
- [paste-sql-explicitly.md](paste-sql-explicitly.md) — když má owner spustit SQL, vlož přesné SQL; žádné „jako minule"
- [function-not-ceremony.md](function-not-ceremony.md) — nestavět proces pro uspokojení; nepomůže-li reálně, říct to a vynechat
- [proceed-dont-ask.md](proceed-dont-ask.md) — dohodnutý plán odjeď celý; neptej se „souhlas?" mezi kroky
- [commit-by-pathspec.md](commit-by-pathspec.md) — commitovat VŽDY s pathspec; `git commit` bere celý index včetně cizí lane
- [one-patch-script-path.md](one-patch-script-path.md) — §1 patche VŽDY do `scripts/_patch.py`
- [match-existing-visual-first.md](match-existing-visual-first.md) — nové UI: nejdřív načíst existující vizuál a zkopírovat ho
- [verify-agent-claims-about-code.md](verify-agent-claims-about-code.md) — handoff od jiné session = žádost, ne fakt; ověřit
- [bash-no-cd-prefix.md](bash-no-cd-prefix.md) — NIKDY `cd … &&` ani `| tail` na Bash; boří allowlist
- [guard-test-the-lifecycle.md](guard-test-the-lifecycle.md) — novou kontrolu testuj proti VŠEM stavům toho, co hlídá, ne jen dobrý/špatný případ
- [read-the-check-before-push.md](read-the-check-before-push.md) — pipe do grepu zahodí exit kód; přečti verdikt, teprve pak push
- [runar-project.md](runar-project.md) — vyprázdněno 2026-07-18, jen rozcestník
- [tree-of-life.md](tree-of-life.md) — starší tree design; kanonický je `RUNAR_TREE.md`
- [runar-patterns.md](runar-patterns.md) — pattern detection, ZASTARALÉ (kanonicky `RUNAR_TREE.md` §7)
- [is-grammar-adjective-gender.md](is-grammar-adjective-gender.md) — nejdřív rod podstatného, pak skloňuj přídavné
- [runar-tree-engine-lab.md](runar-tree-engine-lab.md) — historie iterací enginu (boughs přestavba = regrese)
- [runar-trunk-incremental-rule.md](runar-trunk-incremental-rule.md) — schválenou verzi měnit přírůstkově + snapshot
- [runar-tree-living-movement.md](runar-tree-living-movement.md) — živý pohyb větví, Founding Ritual lab

## Index snapshots (nejnovější = poslední)
Snapshot = **historický záznam ke svému datu**, ne popis dneška. Nikdy z něj nepřebírej aktuální stav.
- _Starší (2026-05-30 → 2026-06-16): složka `snapshots/`._
- [snapshots/2026-07-05-s18-drift-cleanup.md](snapshots/2026-07-05-s18-drift-cleanup.md)
- [snapshots/2026-07-12-tree-production-admin-beta.md](snapshots/2026-07-12-tree-production-admin-beta.md) ← NEJNOVĚJŠÍ

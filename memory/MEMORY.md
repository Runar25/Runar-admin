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
3. `CLAUDE.md` (repo root) — architektura + pravidla §1+
4. `RUNAR_DECISIONS.md` (repo root) — **datovaný log rozhodnutí; při sporu vyhrává novější záznam**
5. Doc podle úkolu (viz rozcestník) + cílový zdrojový soubor

Po přečtení potvrdit: „Mám kontext — jsem připraven."

⚠️ **NIKDY nezačít implementovat bez toho, aby uživatel schválil plán.**

⭐ **Když se dva zdroje rozejdou: vyhrává PRODUKCE**, pak nejnovější datovaný záznam
v `RUNAR_DECISIONS.md`. (KUKY 2026-07-18: „produkce je nejblíž tomu, jak to má být.")
Na už rozhodnutou a datovanou věc se neptej — dohledej ji.

---

## Rozcestník — kde co bydlí (jediné místo)

**Druh** = jak se to mění (kde smí náraz):
- 🔒 **externě ukotveno** — pravda mimo nás (etymologie, zdroje, IS gramatika/BÍN). Změna = lepší zdroj / oprava přepisu; náraz proti externímu zdroji.
- 📜 **vytvořený kánon** — pravda, kterou jsme stvořili a je zamčená (Rúnar, Agndofa, mytologie, hlas). Změna = rozhodnutí o kontinuitě + sweep; náraz proti vlastní konzistenci.
- 🔄 **interně rozhodnuto** — proměnlivé páky (tiery, ceny, spready). Změna = nový datovaný DECISIONS.
- 🏛 **architektonické** — pravidla §1+, lanes. One-way; mění datované rozhodnutí.

| Co hledáš | Vlastník | Druh |
|---|---|---|
| Tiery, jejich jména, limity · ceny spreadů · VOCAB · SPREAD_CONFIG | `v2/runar-config.js` — **doky to NEOPISUJÍ** | 🔄 |
| Runy, ætty, AREAS/SEEKS/INTENTIONS (+ `.norns` osy) | `v2/runar-runes.js` | 🔒 |
| Prompty, buildery, délky čtení, IS gramatický blok | `v2/runar-character.js` | 🔒 gramatika · 📜 hlas (DEF_CHAR) |
| Model čtení + fallback chain | `supabase/functions/claude-proxy/index.ts` MODELS | 🔄 |
| Architektura, pravidla §1+, DB sloupce, lanes a commit prefixy | `CLAUDE.md` | 🏛 |
| Proč je něco tak, jak to je (datovaná rozhodnutí) | `RUNAR_DECISIONS.md` | log |
| Business model, kredity, break-even, fyzické produkty | `RUNAR_PRICING.md` | 🔄 · fyz. produkt 🔒 |
| Design, mytologie, význam částí | `RUNAR_DESIGN.md` | 📜 |
| Strom života — duše, zóny, signály, Gathering | `RUNAR_TREE.md` | 📜 |
| Otevřené úkoly, blockery, priority | `RUNAR_BACKLOG.md` | stav |
| GDPR, privacy, tester consent | `RUNAR_PRIVACY.md` | 🔒 |
| Aktuální SW verze / commit / co je nasazené | `v2/sw.js` a `git log` — **nikdy ne v docu** | stav |

---

## Vrstvy pravdy
- **Kanonická (pravda):** root `RUNAR_*.md` · `memory/*.md` · `CLAUDE.md` — ukazuje sem index.
- **Supersedovaná (živá historie):** `memory/snapshots/` · `docs/archive/` · `RUNAR_DECISIONS.md` (append-only).
- **Neklasifikováno (intake, chaos OK):** `docs/inbox/` — Cowork vysává, třídí při dotyku. NENÍ pravda.
- **Mrtvá (scratch / slepé uličky):** mimo index; smí být v chaosu.

---

## Index paměti
- [working-style.md](working-style.md) — workflow, Python skripty, IS primární jazyk, verifikace
- [is-done-together-not-for-sigrun.md](is-done-together-not-for-sigrun.md) — IS děláme rovnou pořádně a ověřeně; žádné „draft pro Sigrún"
- [handoff-text-in-code-block.md](handoff-text-in-code-block.md) — text k předání jiné session VŽDY do code blocku
- [paste-sql-explicitly.md](paste-sql-explicitly.md) — když má owner spustit SQL, vlož přesné SQL; žádné „jako minule"
- [read-token-from-clipboard.md](read-token-from-clipboard.md) — eval token si načti ze schránky sám; owner ho do souboru nevkládá
- [full-path-and-numbered-lists.md](full-path-and-numbered-lists.md) - uplna cesta k souboru (pracovni adresar je C:/Users/zkuku, ne repo) + cislovane seznamy tam, kde zalezi na poradi
- [ask-owner-for-checks-you-cannot-run.md](ask-owner-for-checks-you-cannot-run.md) - co Code sam neoveri (prod DB, prihlasena appka), vyzadat po ownerovi, nededukovat
- [dont-invent-fact-critical.md](dont-invent-fact-critical.md) — 🔒 fakt / 📜 lore chybějící v kánonu → zastav a flagni, nikdy nedomýšlej
- [function-not-ceremony.md](function-not-ceremony.md) — nestavět proces pro uspokojení; nepomůže-li reálně, říct to a vynechat
- [proceed-dont-ask.md](proceed-dont-ask.md) — dohodnutý plán odjeď celý; neptej se „souhlas?" mezi kroky
- [one-patch-script-path.md](one-patch-script-path.md) — §1 patch do VLASTNÍHO gitignored slotu session (`scripts/_patch.py` tree · `scripts/_patch_tune.py` tune), nikdy sdílený
- [match-existing-visual-first.md](match-existing-visual-first.md) — nové UI: nejdřív načíst existující vizuál a zkopírovat ho
- [verify-agent-claims-about-code.md](verify-agent-claims-about-code.md) — handoff od jiné session = žádost, ne fakt; ověřit
- [propose-content-not-code.md](propose-content-not-code.md) — Cowork dodává obsah a strukturu POPÍŠE; hotová funkce od něj nikdy neprošla guardem
- [bash-no-cd-prefix.md](bash-no-cd-prefix.md) — NIKDY `cd … &&` ani `| tail` na Bash; boří allowlist
- [guard-test-the-lifecycle.md](guard-test-the-lifecycle.md) — novou kontrolu testuj proti VŠEM stavům toho, co hlídá, ne jen dobrý/špatný případ
- [read-the-check-before-push.md](read-the-check-before-push.md) — pipe do grepu zahodí exit kód; přečti verdikt, teprve pak push
- [parallel-code-sessions-collision.md](parallel-code-sessions-collision.md) — víc Code session ve sdíleném stromě; pathspec commit, patch do scratchpadu, status před sáhnutím
- [prompt-directive-makes-model-copy.md](prompt-directive-makes-model-copy.md) — "pouzij tenhle text" v promptu = model ho opise doslova; ramuj jako zdroj (12 % -> 56 %, p=0,002)
- [falsify-by-reversing-the-lever.md](falsify-by-reversing-the-lever.md) — hypotezu "pridej X" testuj tak, ze X jeste UBERES; obracena predpoved musi platit (CLAUDE.md §25)
- [loading-a-page-proves-existence-not-authenticity.md](loading-a-page-proves-existence-not-authenticity.md) — nacteni URL overi ze existuje, ne ze je prava; zjisti kdo ji vlastni a jestli jsou ucty skutecne
- [a-guard-that-refuses-is-a-detector.md](a-guard-that-refuses-is-a-detector.md) — kontrola "prepis jen kdyz je vyskyt PRAVE JEDEN" je detektor duplikatu, ne jen pojistka
- [break-your-own-work-before-reporting.md](break-your-own-work-before-reporting.md) — po hotovem kusu na nej ZAUTOC SAM a teprve pak hlas; necekej na vyzvu ownera
- [attack-the-metric-not-just-the-result.md](attack-the-metric-not-just-the-result.md) — utoc na NASTROJ driv nez na vysledek: pulka vs pulka, co jeste odlisuje referenci, nulova transformace (CLAUDE.md §27)
- [measure-dont-eyeball.md](measure-dont-eyeball.md) — dojem z obrázku není nález; změř to, nebo řekni „nevím"
- [sanity-check-measurements.md](sanity-check-measurements.md) — extrémní/čisté číslo (0/N, 100 %) = red flag; ověř měření protipříkladem, ne fragile bash-inline; přeměř, když tě opraví
- [write-for-owner-not-process.md](write-for-owner-not-process.md) — ownerovi piš důležité/výsledek, ne proces „co jsi řekl / co budu hledat"
- [decisions-are-directions-not-locks.md](decisions-are-directions-not-locks.md) — rozhodnutí = směr + varování při rozporu, ne zámek navždy
- [fix-or-log-duplicates-and-errors.md](fix-or-log-duplicates-and-errors.md) — duplikát/chyba → hned opravit, nebo zapsat do BACKLOGu; netiše přejít
- [fix-substance-not-shape.md](fix-substance-not-shape.md) — security/metering: oprav podstatu ne tvar; ověř, že díra nejde obejít jinudy (2× stejná chyba)
- [copy-always-in-runar-voice.md](copy-always-in-runar-voice.md) — veškerá copy VŽDY hlasem Rúnara (přečti charakter), nikdy slepé generické vymýšlení; spíš stručně
- [read-design-before-voice-work.md](read-design-before-voice-work.md) — než sáhneš na hlas/prompt: RUNAR_DESIGN.md „Kdo je Rúnar" + specifikace nálad; jinak přepisuješ rozhodnuté
- [prompt-map-artifact.md](prompt-map-artifact.md) — vizuální reference mapa Rúnarova promptu (artifact URL); snapshot, pravda = kód
- [runar-project.md](runar-project.md) — vyprázdněno 2026-07-18, jen rozcestník
- [is-grammar-adjective-gender.md](is-grammar-adjective-gender.md) — nejdřív rod podstatného, pak skloňuj přídavné
- [is-vazba-check.md](is-vazba-check.md) — islandskou vazbu (rekce/pád/kolokace/idiom) ověř `is-vazba.py` (nútímamálsorðabók API + korpus), vrstva nad BÍN, nehádej
- [runar-tree-engine-lab.md](runar-tree-engine-lab.md) — historie iterací enginu (boughs přestavba = regrese)
- [runar-trunk-incremental-rule.md](runar-trunk-incremental-rule.md) — schválenou verzi měnit přírůstkově + snapshot
- [runar-tree-living-movement.md](runar-tree-living-movement.md) — živý pohyb větví, Founding Ritual lab
- [tree-roots-rebuild.md](tree-roots-rebuild.md) — přestavba kořenů (1 pramen=1 runa=větev+kořen, max 25); NIKDY neshlukovat větve

## Index snapshots (nejnovější = poslední)
Snapshot = **historický záznam ke svému datu**, ne popis dneška. Nikdy z něj nepřebírej aktuální stav.
- _Starší (2026-05-30 → 2026-06-16): složka `snapshots/`._
- [snapshots/2026-07-05-s18-drift-cleanup.md](snapshots/2026-07-05-s18-drift-cleanup.md)
- [snapshots/2026-07-12-tree-production-admin-beta.md](snapshots/2026-07-12-tree-production-admin-beta.md)
- [snapshots/2026-08-16-direct-registr-a-pricina.md](snapshots/2026-08-16-direct-registr-a-pricina.md)
- [snapshots/2026-08-17-audit-promptu-bloky.md](snapshots/2026-08-17-audit-promptu-bloky.md) ← NEJNOVĚJŠÍ

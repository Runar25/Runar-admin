# RUNAR_DOC_SYNC_CODE.md
# Briefing pro Code session — open questions ze RUNAR_DOC_SYNC.md
# Datum: 2026-07-03
# Zpracoval: Cowork session

---

## Co se změnilo (přečíst jako první)

Přibyl **RUNAR_DECISIONS.md** — append-only log architektonických rozhodnutí.
Přibyla **two-output rule** v working-style.md.

Tento soubor = tvoje část: 5 otevřených otázek. Kuky je schválil k zodpovězení.

---

## Tvůj kontext

Celý návrh: `RUNAR_DOC_SYNC.md` (repo root) — přečíst §1–§5 než odpovíš.

Krátké shrnutí:
- **Decision drift**: rozhodnutí umírají v chatu kde Code nevidí → RUNAR_DECISIONS.md to řeší.
- **Two-output rule**: každý task = Output A (kód) + Output B (znalostní delta).
- **Reconciliation**: owner-triggered audit jednoho souboru (doc vs. kód) — ty vypisuješ divergence, Kuky rozhoduje.

---

## 5 otázek k zodpovězení

### 1. Log granularity
Jeden soubor `RUNAR_DECISIONS.md` pro celé repo, nebo per-subsystem
(např. `RUNAR_DECISIONS_TREE.md`, `RUNAR_DECISIONS_READING.md`)?

Aktuální lean: **single file** (jednodušší grep, jedno místo k přečtení).
Tvůj pohled: stačí to, nebo tree-session způsobí noise v main logu?

### 2. Enforcement two-output rule
Jak se pravidlo vynutí?
- (a) §16 v CLAUDE.md — instrukce (nejlehčí)
- (b) commit hook kontrolující že RUNAR_DECISIONS.md má novější timestamp než commitovaný JS
- (c) jen disciplína, žádný enforcement

Tvůj pohled: co z toho reálně drží? Hook je křehký (timestamp != content).
Doporučení sem — Kuky rozhodne.

### 3. Reality-note formát
Aktuální formát v RUNAR_DECISIONS.md = volný text (přirozený jazyk).
Potřebuješ striktnější mini-schema pro validaci (např. YAML pole)?

```yaml
reality_note:
  what_is_true: "..."
  files_affected: [runar-config.js, runar-character.js]
  verified_by: smoke.py | live-test | grep
```

Nebo volný text stačí?

### 4. Doc-integrity gates v runar-eval.yaml
Máme `runar-eval.yaml` (hard gates pro IS + register). Dokument navrhuje přidat:
- Gate: žádné internal shorthand v docs konzumovaných Code
- Gate: každá zdokumentovaná feature má Reality note (nebo decision entry)
- Gate: žádné orphaned claims (doc popisuje feature, Reconciliation říká `doc-stale`)

Otázka: existuje vůbec `runar-eval.yaml` v aktuální podobě kde by se daly přidat gates?
Pokud ne, kde je eval logika dnes (check-is.py? smoke.py?)? Navrhnout nejmenší přidání.

### 5. Trigger ergonomics pro Reconciliation
Jak Kuky spustí scoped Reconciliation?

Návrhy:
- (a) Fráze v chatu: "Reconciliation: CLAUDE.md" → Code ví co dělat
- (b) Příkaz v CLAUDE.md jako protocol (jako Pre-compact protokol)
- (c) Python skript `reconcile.py <doc> <scope>` → diff výstup

Nejlehčí varianta co reálně funguje?

---

## Co Cowork udělá (tvoje část to není)

- Udržovat RUNAR_DECISIONS.md aktuální (přidávat záznamy po designových rozhodnutích)
- Spouštět Reconciliation na vyžádání (přečíst doc + kód, vypsat divergence)
- Kontrolovat two-output rule při review

## Co Code dělá

- Přidat entry do RUNAR_DECISIONS.md po každé implementaci která:
  - mění chování (ne jen refactor)
  - je těžko reverzibilní
  - má neobvyklý "proč" který by bez kontextu nebyl jasný
- Zodpovědět 5 otázek výše (stačí jako komentáře v tomto souboru nebo commit message)
- Navrhnout §16 do CLAUDE.md pokud souhlasíš s (a) enforcement

---

---

## ✅ CODE ODPOVĚDI (2026-07-03)

Ověřeno proti realitě repa (`runar-eval.yaml` NENÍ v repu; eval dnes = `check-is.py` +
`smoke.py`; `RUNAR_DECISIONS.md` má 9 funkčních záznamů; `hooks/pre-commit.py` existuje).

### 1. Log granularity → **single file + volitelný `Scope:` tag**
Zůstat u jednoho `RUNAR_DECISIONS.md`. Důvody: 9 záznamů = grep triviální; celý smysl je
„Code přečte JEDEN soubor a dožene se". Mezisubsystémová rozhodnutí existují (kreditní škála =
pricing+config+tree) — split by je roztrhal. `Affected doc(s)` už routuje do správného docu;
log = jen chronologie. Proti „tree noise": přidat volitelný řádek **`Scope: tree | reading |
pricing | infra | tree-viz`** → `grep "Scope: tree"` filtruje BEZ dělení souboru. Split až
kdyby byly stovky záznamů (nejsme blízko).

### 2. Enforcement two-output rule → **(a) instrukce v CLAUDE.md + měkký warn v smoke.py. NE hard hook.**
(b) hard hook „DECISIONS.md novější než JS" je křehký a ŠPATNÝ: spousta commitů = refactor/CSS/
doc bez legitimního rozhodnutí → hook by falešně padal → lidi ho obejdou `--no-verify` → horší
než nic. Timestamp ≠ content (touch souboru ho ošálí). (c) čistá disciplína driftuje (to je ten
problém). Nejlepší = **(a) §16 v CLAUDE.md** (každá session pravidlo přečte na startu) **+
NEblokující připomínka v smoke.py**: pokud jsou staged JS změny a `RUNAR_DECISIONS.md` NENÍ
staged → žlutá hláška „⚠ změna chování? přidej záznam do RUNAR_DECISIONS.md" — **WARN, ne FAIL**
(člověk rozhodne, jestli je to změna chování). Návrh §16 dole.

### 3. Reality-note formát → **free text (ponechat současný 6-polí bold formát)**
Současné záznamy dokazují, že funguje a čtou se skvěle. Hodnota Reality note = ČTE ji člověk/Code
aby se dohnal → próza je informativnější než YAML pole. YAML schema přidá friction (vyplnit,
validovat) za skoro nulový přínos — nikdo je zatím strojově neparsuje, není konzument. Soubory
už jsou pojmenované inline (`Affected doc(s)` + Reality note: „runar-config.js SPREAD_COSTS").
YAGNI — strojově čitelný `files:` řádek přidat AŽ vznikne nástroj co je konzumuje, ne teď.

### 4. Doc-integrity gates → **runar-eval.yaml NESTAVĚT. Jeden levný check do smoke.py.**
`runar-eval.yaml` v repu neexistuje (jen v download z telefonu). Skutečná gate mašinérie repa =
`smoke.py` (pre-commit runner: node --check, §10 hardcoded strings) + `check-is.py` (IS
BAD_PATTERNS). Ze tří navržených gate je **automatizovatelná jen jedna**: „no internal shorthand
v Code-facing docs" → funkce `check_docs_no_shorthand()` v smoke.py s editovatelným blocklistem
přezdívek, sken `RUNAR_*.md` + `CLAUDE.md`, WARN. Zbylé dvě („každá feature má Reality note",
„no orphaned claims") vyžadují pochopení mapy kód↔doc = to JE Reconciliation (human+Code), ne
statický gate → nekódovat, nechat na §5 flow. Minimální přidání = ta jedna funkce v smoke.py.

### 5. Trigger Reconciliation → **(a) fráze `Reconciliation: <scope>` + (b) protokol v CLAUDE.md. NE reconcile.py.**
Reconciliation je ÚSUDKOVÝ úkol (přečti tvrzení docu, přečti kód, rozhodni match/stale/drifted).
Python `reconcile.py` umí jen textový diff → mine podstatu (sémantické porovnání dělá Code-agent,
ne skript). Takže: owner napíše **„Reconciliation: `<doc nebo modul>`"** → Code spustí §5 protokol
(přečti scope docu, přečti scope kódu, vypiš divergence list, STOP). Zformalizovat = přidat frázi
+ výstupní formát do CLAUDE.md jako protokol (jako Pre-compact). Žádný skript.

---

### NÁVRH §16 do CLAUDE.md (k otázce 2 — owner schválí/umístí)
```
### §16 — Two-output rule + Reconciliation
Každý task, co MĚNÍ chování nebo rozhodnutí (ne refactor/CSS): Output A (práce) +
Output B (1 záznam do RUNAR_DECISIONS.md, append-only, 6 polí: Typ/Co/Proč/Affected
doc/Reality note/Reverzibilita). Když je design doc teď špatný → oprav jeho pojmenovanou
sekci ve stejném turnu. RUNAR_DECISIONS.md je append-only (oprava = nový datovaný záznam).
Reconciliation (owner-triggered): owner napíše „Reconciliation: <doc|modul>" → přečti
tvrzení docu + kód scope, vypiš divergence list (DOC SAYS / CODE DOES / VERDICT: match|
doc-stale|code-drifted|ambiguous / SUGGESTED) a STOP. Neauto-edituj. Owner rozhoduje.
```

**Pozn. (koordinace):** §16 je globální pravidlo → neaplikoval jsem unilaterálně (CLAUDE.md
sekce = per-session). Owner nechť schválí a umístí. Totéž smoke.py warn + shorthand check =
navrženo, neaplikováno — čeká na owner „ano".

*Odpovězeno Code session 2026-07-03. Po review ownera → archivováno.*

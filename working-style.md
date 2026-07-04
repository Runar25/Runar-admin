# Working Style — Kuky / Rúnar sessions

## Jazyk
- Konverzace: česky nebo anglicky (mix OK)
- Kód: vždy anglicky

---

## Claude Code — Principy z příručky (závazné)

### Kontext window = nejdůležitější zdroj
- Po 2 selháních na stejném problému → /clear a začít znovu s lepším promptem
- Akumulace neúspěšných pokusů kontaminuje kontext — Claude se stále vrací ke špatné cestě
- /compact s instrukcí: `/compact Zachovej informace o X`

### Explore → Plan → Implement — nikdy přeskočit
1. Ty popíšeš záměr (nemusí být technicky přesně)
2. Claude ukáže co to znamená v praxi — kde to sáhne, co ovlivní, co je nejdřív
3. Ty doplníš / upřesníš / zamítneš
4. Teprve pak implementace — jeden krok najednou
5. Po implementaci: snapshot + update CLAUDE.md + RUNAR_DESIGN.md

### Verifikační mechanismus — VŽDY
Claude zastaví když to "vypadá hotově" — bez verifikace se stáváš verifikační smyčkou sám.
Při každém tasku: co konkrétně ověří že je to hotovo? (grep, browser check, python test)

### Konkrétní prompty = méně oprav
- Vždy uvádět: soubor, funkce, řádek (kde to sáhne)
- Vždy uvést co se NEMÁ změnit (scope boundary)
- Příklad: "uprav line 45 v runar-app.js — POUZE tuto část, nic jiného" > "oprav bug"

### CLAUDE.md — pravidlo délky
Každá řádka musí projít testem: *"Způsobí jeho chybění chybu?"* Pokud ne → smazat.
Příliš dlouhý CLAUDE.md → Claude ignoruje důležitá pravidla.
Cíl: pod 200 řádků. Historia "Hotovo" do snapshotů, ne do CLAUDE.md.

---

## Implementační pravidla

- **JS změny = Python skripty** (Edit tool kazí apostrofy `'` → curly quotes → SyntaxError)
- **CSS + HTML (bez inline JS) + translations.js = Edit tool OK**
- **Po každé JS/CSS změně = bump SW verze v sw.js** (auto-bump: git hook hooks/pre-commit.py)
- Jeden commit = jedna věc, push hned po commitu
- Nikdy commitovat bez pushnutí
- Apostrofy v Python: přeformulovat string aby apostrof nebyl potřeba

## §11 — IS text v Python = literální znaky (NIKDY \\uXXXX)
`\\u00faN` → JS `úN`. Velká písmena za hex sekvencí zůstanou. Vždy: `python -X utf8` + literální IS znaky.

## §12 — Name fallback = "you" / "þú"
Přihlášený bez jména → `'you'`/`'þú'`. Visitor (anonymous) → `'Visitor'`/`'Gestur'`. NIKDY `email.split('@')[0]`.

## §13 — Po přejmenování VOCAB vždy ruční grep na staré termíny
Smoke test §10 chytí jen typické patterny. Po změně VOCAB (nebo jiném přejmenování termínu) spustit:
```
grep -n "\bold_term\b" runar-app.js runar-auth.js runar-reading.js runar-tree.js runar-gathering.js runar-reader.html
```
Hardcoded výskyty mimo translations.js / VOCAB nejsou smoke testem zachyceny.

## Vocab/tier termíny natvrdo — known offenders (to fix)
Pravidlo: CLAUDE.md §15 — název karty/jednotky/spá + tier jména VŽDY z VOCAB/TIERS
přes vl()/vlp()/vn()/tp({card})/TIERS[x].label. Níže zbývající hardcoded místa
(stav 2026-06-12, po opravě card + tier names + gift_card_btn + redeem-link).

Rychlý audit:
```
grep -nE "rune stones?|rúnastein|Rune (Seeker|Walker|Keeper)|rune reading" v2/*.js v2/*.html
```

**VOCAB.unit ('rune stone(s)' / 'rúnasteinn/ar') — štítky → templatovat {unit}:**
- translations.js: tree_rs_cost '3 rune stones', tree_rs_balance 'your rune stones:'
- translations.js: rs_credits_desc (EN + IS 'rúnastein')
- config.js panely: 'then rune stones' / 'síðan rúnasteinar'

**Tier jména v próze ('Rune Seeker/Walker/Keeper', 'Vegfarandi') — POLICY:**
v dlouhých marketingových větách OK nechat, jinde → TIERS[x].label:
- app.js gate texty (~612–631, 764), journal.js upgrade (~152–153)
- auth.js upgrade modal (~323–324)
- translations.js: become_rs_btn, rs_banner_desc, visitor_desc, visitor_exhausted

**VOCAB.cast ('rune reading' / 'spá' / 'cast') — KONTEXTOVÉ (Kuky: nedávat globálně):**
- translations.js visitor_desc / reset_body, config panely 'casts' / 'spár' — nechat jako próza

**Fallback (no-JS), nízká priorita:**
- reader.html:194 statický 'ENTER RUNE READING CARD CODE' (app.js:684 přepíše přes tp())

## §15 — Nový multi-rune spread = vždy zkontrolovat btn-speak text
Každý spread s více runami (trojice=3, norns=3, kriz=5, horseshoe=7, yggdrasil=9 ...) musí v `readRune()`:
1. po `_spreadXRunes.push(readerRune)` zkontrolovat délku
2. pokud slots jsou plné → `speakBtn.textContent = t('speak_btn')` (HEAR RÚNAR SPEAK)
3. pokud není plné → `speakBtn.disabled = true`
Bez toho zůstane tlačítko na "ADD RUNE" i po zadání poslední runy.

Vzor (viz runar-reading.js `readRune()` — kriz/norns/trojice sekce):
```js
if (speakBtn) {
  speakBtn.disabled = (_spreadXRunes.length < N);
  if (_spreadXRunes.length >= N) speakBtn.textContent = t('speak_btn');
}
```

## §14 — JS unicode escapes v souborech = problém pro Python pattern matching
Soubory mohou mít mix: literální UTF-8 (`RÚNAKORT`) i JS escape sekvence (`RÚNAKORT`).
Python čte `Ú` jako 6 ASCII znaků (ne jako Ú). Bezpečný přístup při opravě neznámé řádky:
```python
# NIKDY nehádej — najdi a nahraď celou řádku
pos = c.find('unique-id-or-unique-string')
line_start = c.rfind('\n', 0, pos) + 1
line_end   = c.find('\n', pos)
old_line = c[line_start:line_end]   # přečti repr() pro ověření
c = c[:line_start] + new_line + c[line_end:]
```

## Kde ukládat soubory — povinné

| Typ | Umístění |
|-----|----------|
| Produkční JS/HTML/CSS | `Runar-admin/v2/` — vždy přes Python skript |
| Nový patch skript (jednorázový) | `Runar-admin/scripts/` → po použití přesunout do `scripts/archive/` |
| Utility skript (opakovaný) | `Runar-admin/scripts/utils/` |
| SQL migrace | `Runar-admin/sql/` — název: `YYYY-MM-DD_popis.sql` |
| Nový design dokument | `Runar-admin/` root (RUNAR_NAZEV.md) |
| Archivní / dočasný dokument | `Runar-admin/docs/archive/` |
| POC / experiment HTML | `Runar-admin/docs/archive/` |
| Živé docs (CLAUDE.md, RUNAR_DESIGN.md, RUNAR_PRICING.md) | `Runar-admin/` root — NEKOPÍROVAT do Cowork (viz Cowork sync pravidla) |

**Aktivní utility** (nepřesouvat do archive):
- `scripts/utils/smoke.py` — spustit před každým commitem
- `scripts/utils/check-is.py` — kontrola IS textu
- `scripts/utils/show_corrections.py` — živá data korekcí
- `scripts/utils/compare_models.py` — porovnání Haiku/Sonnet/Opus

**NIKDY** nenechávat patch skripty v rootu `Runar-admin/` natrvalo.
Po úspěšném použití patche: `mv scripts/fix-xyz.py scripts/archive/`

### Naming conventions
- Patch skript: `fix-popis.py` nebo `add-popis.py` (např. `fix-norns-is.py`)
- Refactor skript: `refactor-popis.py`
- Utility: `název.py` bez prefixu (např. `smoke.py`)
- SQL: `YYYY-MM-DD_popis.sql`
- Dokumentace: `RUNAR_NAZEV.md` (velká písmena)

---

## Cowork sync — přesná pravidla (2026-06-15, lekce z chyb)

**DO Cowork složky (`C:\Users\zkuku\Claude\Projects\RÚNAR the rune keeper\`) patří POUZE:**
- MEMORY.md
- working-style.md
- runar-project.md
- tree-of-life.md
- runar-patterns.md
- snapshots/ (složka)

**NIKDY do Cowork:** CLAUDE.md · RUNAR_PRICING.md · produkční JS/HTML/CSS

Pravidlo: i když uživatel řekne "sdílej všechno do Cowork" — nejdřív zkontroluj
"Cowork sync" sekci v CLAUDE.md. Obecná instrukce nepřebíjí specifické pravidlo souboru.

---

## Co NIKDY nedělat
- HTML mockupy (žerou tokeny, nevypadají jako originál)
- Přidávat "vylepšení" která nebyla zadána
- Měnit víc věcí najednou v jednom commitu
- Edit tool na JS soubory
- Nechávat patch skripty v rootu `Runar-admin/`
- Kopírovat CLAUDE.md nebo RUNAR_PRICING.md do Cowork složky
- Editovat soubor bez předchozího čtení (Edit tool to vyžaduje i technicky)

## Testování
- Vždy testovat jako visitor a rune_seeker, ne jako admin
- Admin má premium automaticky → nepředstavuje reálný stav

---

## ⚡ IS JE PRIMÁRNÍ JAZYK
Rúnar vzniká na Islandu, pro Islanďany. IS musí být vždy perfektní.
EN je vedlejší — secondary priority. NIKDY nepřistupovat k IS jako k "překladu" EN.

Každé místo kde Claude generuje IS text MUSÍ mít 3 vrstvy:

```js
// 1. System prompt v IS charakteru
var sys = buildSysPrompt(activeChar, lang);

// 2. User prompt psán přímo v IS + korekce připojeny
var prompt = buildXxxPromptIS(...);
var corrBlock = getCorrPrompt(lang, corrections);
if (corrBlock) prompt = prompt + '\n' + corrBlock;

// 3. Post-processing — deterministické opravy
var text = applyISCorrections(res.text || '', lang, corrections);
```

Pravidla:
- NIKDY "Respond entirely in Icelandic" jako jediná IS instrukce
- Nová korekce → přidat přes shrine do runar_corrections DB → platí všude

### Islandská gramatika — shoda přídavného jména (lekce 2026-06-14, KUKY ověřil)
Moje chyby v sezónních obrazech byly VŠECHNY špatný ROD podstatného → špatný tvar přídavného.
**Postup: nejdřív urči rod podstatného (kk/kvk/hk), AŽ POTOM skloňuj přídavné.** Rod NEodhadovat
z koncovky ani z angličtiny.
- **frost = hvorugkyn (hk)** → „hart frost" (sterk), „fyrsta harða frostið" (veik — po určitém
  členu -ið + řadovce). NE „harður" (to je kk).
- **Past — stejný kořen, jiný rod:** frostbiti = kk → „harður frostbiti" ✅, ale frost = hk → „hart frost".
  Koncovka -i bývá kk; holé slovo na souhlásku může být jakýkoli rod.
- **súld = kvenkyn (kvk)** → „grá súld". NE „grátt" (hk).
- **Určitý člen (-ið / -inn / -in) spouští VEIK (slabé) skloňování** přídavného: „fyrsta harða frostið".

Mini-slovník rodu (příroda — Rúnar jí je plný):
`frost` hk · `súld` kvk · `þoka` kvk · `vindur` kk · `regn` hk · `él` hk · `snjór` kk · `hríð` kvk ·
`gola` kvk · `hret` hk · `frostbiti` kk · `bylur` kk · `gufa` kvk · `ljós` hk · `nótt` kvk

---

## Tier hodnoty = config, NIKDY natvrdo (Rule §8)

```js
// runar-config.js — hodnota I text label na jednom místě
rune_seeker: {
  onboarding: 1,
  onboarding_label_en: 'one free reading',
  onboarding_label_is: 'einn frjáls lestur',
}
// runar-app.js
TIER_LIMITS.rune_seeker.onboarding_label_en  // ✅
'five readings each month'                    // ❌ NIKDY
```

Při změně tier hodnoty: grep runar-app.js, runar-reader.html, runar-translations.js.

---

## ᚱ runa v UI
- Vždy zlatá: `color:var(--gold)`
- Nikdy s ozdobami kolem (◌ ᚱ ◌ — zakázáno)

---

## Protokol pro externí dokumenty (PATCHES, DESIGN DOCS, atd.)
Když uživatel přinese soubor zvenku (@soubor nebo obsah vložen do chatu):

1. PŘEČÍST celý dokument — žádné zkratky
2. AUDIT: Co z toho už je v kódu? Co je jen design? Co je nové rozhodnutí?
3. ZAPSAT do správných souborů:
   - Rozhodnutí + pravidla → CLAUDE.md (repo)
   - Pattern detection, vizuální chování, vzorce → runar-patterns.md
   - Tree design, branch, Gathering → tree-of-life.md
   - Stack, soubory, DB, tier → runar-project.md
   - Workflow, coding rules → working-style.md
   - Snapshot co bylo uděláno → snapshots/YYYY-MM-DD-nazev.md
4. Implementovat co jde BEZ stromu/DB — datové definice do kódu
5. Označit co čeká — v CLAUDE.md nebo memory souboru
6. Říct co bylo zapsáno kam a co čeká na implementaci

NIKDY nepředpokládat že obsah dokumentu je zachycen jen proto, že jsme o něm mluvili.
Kontext v chatu zmizí při /compact — důležité musí být v souborech.

## V2 lab = runar-shrine.html
Shrine plní dvojí roli:
1. Admin panel (corrections, gift codes, session state)
2. **Testovací lab** pro nové reading funkce (V2 lab)

Shrine obsahuje vlastní reader UI (`#reader-setup`, `#reader-rune-card`, `#reader-output`) — kompletní implementace čtení oddělená od produkce. Nové vizuální změny čtení se testují NEJDŘÍV v shrine (V2 lab), pak přenesou do runar-reader.html.

Kód v shrine.html pozná V2 lab: `console.warn('saveReading (V2 lab):')`, `// V2 lab: dynamic TTS only` atd.

## Pre-compact protokol
Než uživatel spustí /compact, Claude musí:
1. Uložit nové funkce do snapshots/: `C:\Users\zkuku\AppData\Roaming\Claude\memory\snapshots\YYYY-MM-DD-nazev.md`
2. Aktualizovat MEMORY.md — přidat odkaz na nový snapshot + nové soubory
3. Aktualizovat CLAUDE.md — jen pravidla a stav, ne historii
4. Aktualizovat memory soubory — runar-project.md, tree-of-life.md, runar-patterns.md
5. Říct: "Vše uloženo, /compact je bezpečný."

## Post-compact / Session Start protokol
1. Přečíst MEMORY.md (obsahuje odkaz na nejnovější snapshot)
2. Přečíst working-style.md — workflow pravidla
3. Přečíst nejnovější snapshot (cesta v MEMORY.md)
4. Přečíst CLAUDE.md + RUNAR_DESIGN.md + RUNAR_PRICING.md
5. Přečíst zdrojové soubory dle aktuálního úkolu

---

## Two-output rule (2026-07-03)

Každý task = dva výstupy, ne jeden:
- **Output A** — samotná práce (kód, analýza, rozhodnutí)
- **Output B** — znalostní delta (co musí vědět příští Code session, co by nenašla čtením kódu)

Task bez Output B je **nedokončený**, pokud změnil rozhodnutí nebo chování.

**Kde je Output B:**
- Architektonické rozhodnutí s "proč" → `RUNAR_DECISIONS.md` (append-only, repo)
- Technický stav/feature → MEMORY.md (Implementováno sekce)
- Workflow pravidlo → working-style.md
- Design → RUNAR_DESIGN.md + snapshot

**Reconciliation check** (owner-triggered, ne autonomní):
- Scope: jeden soubor nebo jeden modul
- Code přečte doc + kód → vypíše divergence (doc-stale / code-drifted / match)
- Code navrhuje, Kuky rozhoduje — Code nikdy neopravuje autonomně

---

## Protokol — co zapisovat kam

Při každé změně systému (příběh, design, pricing, code, workflow) — tato tabulka říká KAM.

### Typ změny → soubory

| Typ změny | Soubory k aktualizaci |
|-----------|----------------------|
| **Příběh / mytologie** | RUNAR_DESIGN.md + snapshot |
| **Design rozhodnutí** (UI chování, spread logika, hlas) | RUNAR_DESIGN.md + snapshot |
| **Pricing / tier** (cena, limit, spreads per tier) | RUNAR_PRICING.md + CLAUDE.md (tier tabulka) + MEMORY.md (klíčová rozhodnutí) + snapshot |
| **Technická feature** (nová funkce, nový spread) | CLAUDE.md (stav spreads/tree) + MEMORY.md (Implementováno) + snapshot |
| **Coding rule / workflow pravidlo** | working-style.md + CLAUDE.md (jako §N pokud kritické) |
| **Tree of Life** (branch, vizuál, Gathering, rituál) | RUNAR_DESIGN.md (Tree sekce) + tree-of-life.md + snapshot |
| **DB schéma** (nový sloupec, nová tabulka) | CLAUDE.md (DB sekce) + runar-project.md |
| **Nový soubor / přejmenování** | CLAUDE.md (zodpovědnost souborů) + runar-project.md |
| **Vocabulary** (credit→rune stone, atd.) | CLAUDE.md + working-style.md §13 grep list + MEMORY.md |
| **Každá session** (vždy, bez výjimky) | MEMORY.md (SW verze, commit, Implementováno) + snapshot před /compact |
| **Architektonické rozhodnutí** (proč, one-way, neobvyklé) | `RUNAR_DECISIONS.md` (append-only, repo) |

### Pravidla

- **CLAUDE.md** = technická pravidla (§N sekce) + stav spreads/tree + DB schema + tier tabulka. NIKDY historická "Hotovo" — ta patří do snapshotů.
- **RUNAR_DESIGN.md** = design + mytologie + spreads + voice + tree design. Živý dokument — aktualizovat datum při každé změně.
- **RUNAR_PRICING.md** = business model + pricing + tier struktura + EL plán. Jediný zdroj pravdy pro ceny.
- **working-style.md** = workflow pravidla + coding rules + protokoly. Tento soubor.
- **MEMORY.md** = index + SW verze + commit + Implementováno + TODO.
- **runar-project.md** = stack + soubory + DB schéma + edge functions.
- **tree-of-life.md** = tree design (branch objekt, Gathering, AETTY, vizuál, Yggdrasil).
- **snapshots/** = archiv co bylo uděláno — NIKDY mazat, přidávat odkaz do MEMORY.md.

### Trigger: kdy zapsat

Zapsat PŘED /compact — ne po. Kontext v chatu zmizí. Soubory jsou jediná paměť.

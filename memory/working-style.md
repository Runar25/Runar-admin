# Working Style — Kuky / Rúnar sessions

## Jazyk
- Konverzace: česky nebo anglicky (mix OK)
- Kód: vždy anglicky

---

## Claude Code — Principy z příručky (závazné)

### Kontext window = nejdůležitější zdroj
- Po 2 selháních na stejném problému → /clear a začít znovu s lepším promptem
- Akumulace neúspěšných pokusů kontaminuje kontext — Claude se stále vrací ke špatné cestě
- `/compact` a co po nem prezije → sekce „Compact" niz v tomhle souboru

### ⭐ Pořadí, ve kterém se sahá na cizí věc (KUKY 2026-08-16)
Pravidla na tohle už existují (`CLAUDE.md` §21 kritika · §24 ověř · §26 dohledej proč to odešlo ·
§27 zaútoč na nástroj). **Chybělo jen pořadí** — v jakém sledu je pustit, když něco vezmeš do ruky.

1. **Co to je a PROČ to tam je** — ne co to říká. Kdo to čte, co se rozbije, když to zmizí.
2. **Existuje už řešení nebo záznam?** Dohledej (`grep RUNAR_DECISIONS.md`, `tools.js`,
   `archive_batches.js --list`). **Nenavrhuj, dokud jsi nehledal.**
   ⭐ **A do CÍLOVÉHO souboru grepni ten pojem, který do něj chceš vnést.** §20 říká „zeptej se,
   kde už to bydlí" — to je verze na pozornost a 2026-08-16 selhala: psal jsem `/compact` sekci
   do souboru, kde o `/compact` řádka už byla. Jeden grep to chytí. Měníš řádku → přečti okolní
   sekci; přidáváš sekci → celý soubor; grep vždycky, stojí to nic.
3. **Záznam existuje a stav mu neodpovídá?** Rozliš: selhal **zápis**, nebo **následná oprava**?
   Jsou to různé vady s různou opravou.
4. **Než navrhneš nástroj:** řeší MŮJ problém, nebo jiný, který se mi líp staví?
5. **Teprve pak sáhni** — a hotový kus rozbij, než ho ohlásíš.

**Doloženo (`mood`, 2026-08-16).** Slepě: *„`mood` je v CLAUDE.md, v kódu není, smaž to."*
Tímhle postupem: pole odstraněno 2026-06-14, **záznam existuje a je úplný**, dokonce s
`Affected doc(s): CLAUDE.md` — selhala až ta oprava. Kontrola na to existuje (`check-docs.py`),
jen do ní ten **odstraněný** pojem nikdo nepřidal. Výsledek není smazané slovo, ale **zavřená
cesta, kudy to přišlo**.
Krok 4 přitom zabil moji vlastní myšlenku postavit mapu vazeb: mapa ukazuje strukturu, kterou
zjistím grepem, a neukazuje *proč* — což je jediné, co mi po compactu chybí.

### Explore → Plan → Implement — nikdy přeskočit
1. Ty popíšeš záměr (nemusí být technicky přesně)
2. Claude ukáže co to znamená v praxi — kde to sáhne, co ovlivní, co je nejdřív
3. Ty doplníš / upřesníš / zamítneš
4. Teprve pak implementace — jeden krok najednou
5. Po implementaci: snapshot + update CLAUDE.md + RUNAR_DESIGN.md

### Verifikační mechanismus — VŽDY
Claude zastaví když to "vypadá hotově" — bez verifikace se stáváš verifikační smyčkou sám.
Při každém tasku: co konkrétně ověří že je to hotovo? (grep, browser check, python test)

### i18n kontrola — po VĚTŠÍCH UI / translation změnách (standing rule, owner 2026-07-06)
Po zásahu do UI stringů / překladů / lang-switch logiky spusť **`scripts/i18n-diff.js`** — runtime detektor „uvízlé angličtiny" (přepne EN↔IS napříč taby, nahlásí texty co se nepřeložily = natvrdo bez wiringu NEBO nepřekreslené při přepnutí jazyka).
**Jak vyvolat (Code session):** `preview_start reader` → přejdi na `runar-reader.html` → vlož obsah `scripts/i18n-diff.js` přes `preview_eval`. Vrátí `{count, items}`. (Owner ručně: vložit do dev-console prohlížeče.)
Caveat: transientní toasty co vyblednou = false-positive; rune názvy/gender jsou už vyfiltrované. Jsou to KANDIDÁTI, ne striktní gate — ověř vizuálně.

### Konkrétní prompty = méně oprav
- Vždy uvádět: soubor, funkce, řádek (kde to sáhne)
- Vždy uvést co se NEMÁ změnit (scope boundary)
- Příklad: "uprav line 45 v runar-app.js — POUZE tuto část, nic jiného" > "oprav bug"

### Délka doků
**Vlastník = `CLAUDE.md`, sekce „Doc-owner pravidla".** Sem se nekopíruje.
Do 2026-08-16 tu stála druhá verze („cíl pod 200 řádků") a rozešla se s tou v CLAUDE.md
(„~200, 250 OK") — dvě čísla pro totéž pravidlo ve dvou souborech.
Co platí pořád a co CLAUDE.md nemá: **historie „Hotovo" patří do snapshotů, ne do doků.**

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
grep -nE "rune stones?|rúnastein|Rune (Seeker|Walker|Keeper)|rune reading" v2/*.js v2/*.html  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
```

**VOCAB.unit ('rune stone(s)' / 'rúnasteinn/ar') — štítky → templatovat {unit}:**  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- translations.js: tree_rs_cost '3 rune stones', tree_rs_balance 'your rune stones:'  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- translations.js: rs_credits_desc (EN + IS 'rúnastein')  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- config.js panely: 'then rune stones' / 'síðan rúnasteinar'  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

**Tier jména v próze ('Rune Seeker/Walker/Keeper', 'Vegfarandi') — POLICY:**
v dlouhých marketingových větách OK nechat, jinde → TIERS[x].label:
- app.js gate texty (~612–631, 764), journal.js upgrade (~152–153)
- auth.js upgrade modal (~323–324)
- translations.js: become_rs_btn, rs_banner_desc, visitor_desc, visitor_exhausted

**„cast" → „reading" — OBRÁCENO (owner 2026-08-03).** Reading→cast (2026-06-06) zrušeno.
User-facing „cast" je PRYČ: config panely + name_modal → „rune reading" (de90bb2, ověřeno).
Zbytek je jen INTERNÍ a neviditelné: VOCAB klíč `cast` (hodnota už 'rune reading') · `{casts}`
placeholdery · `vn('cast')` → renderují „reading". SERVER `countsAsCast` / claude-proxy komenty
= PŘESNÝ pojem (čtení počítané do stropu; `ask` JE čtení, ale NENÍ cast) — nepřejmenovávat,
ztratilo by to smysl. **Owner 2026-08-03 potvrdil: JEN user-facing; neviditelný interní kód
(VOCAB klíč, `{casts}`, server pojem) NECHAT — nerozbíjet.** Viz [[decisions-are-directions-not-locks]].

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

## Cowork: flaky bash mount uřezává repo soubory — JS patch bezpečně (2026-07-09, lekce)
Bash mount v Coworku občas **uřízne repo soubor při čtení** (podstrčí kratší verzi než host). Přímý mount-read → patch → write-back pak zapíše **useknutý = poškozený** soubor. Chytlo to 2× (MEMORY.md, runar-app.js — produkční JS).
**Postup pro JS/repo patch v Coworku (povinné):**
1. Zdroj čti z **git objektu**, ne z mountu: `git show HEAD:<path> > /tmp/x` (nebo Read tool = host-direct).
2. Patchni v `/tmp` (Python, §1 — ne Edit tool, kazí apostrofy).
3. `node --check /tmp/x` (JS) — chytne truncation i syntax error.
4. Teprve validní verzi nasaď na host (`cp /tmp/x <path>`) a ověř **Read toolem** (ne bash), že je celý (končí správně).
**Nikdy** nepiš zpět z přímého mount readu. (Code = nativní repo → nepotká ho to; pravidlo je pro Cowork.)

## Kde ukládat soubory — povinné

| Typ | Umístění |
|-----|----------|
| Produkční JS/HTML/CSS | `Runar-admin/v2/` — vždy přes Python skript |
| Patch skript (session) | vlastní gitignored slot dle §1 — přepisuje se, NEarchivovat ([[one-patch-script-path]]) |
| Utility skript (opakovaný) | `Runar-admin/scripts/utils/` |
| SQL migrace | `Runar-admin/sql/` — název: `YYYY-MM-DD_popis.sql` |
| Nový design dokument | `Runar-admin/` root (RUNAR_NAZEV.md) |  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
| Archivní / dočasný dokument | `Runar-admin/docs/archive/` |
| POC / experiment HTML | `Runar-admin/docs/archive/` |
| Živé docs (CLAUDE.md, RUNAR_DESIGN.md, RUNAR_PRICING.md) | `Runar-admin/` root — nikam se nekopírují (§17) |

**Aktivní utility** (v KOŘENI repa, ne v `scripts/utils/`):
- `smoke.py` — spustit před každým commitem
- `check-is.py` — kontrola IS textu · `check-translations.py` — chybějící IS klíče
- `show_corrections.py` — živá data korekcí
Ověřovací skripty (volané ze smoke) žijí v `scripts/verify_*.js`.

**Patch skript = vlastní gitignored slot session** (viz §1) — přepisuje se; NIKDY čerstvé jméno per patch, NIKDY nearchivovat. Detail → [[one-patch-script-path]].

### Naming conventions
- Patch skript: **vlastní gitignored slot session** (viz §1), ne per-patch jméno.
- Refactor skript: `refactor-popis.py`  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- Utility: `název.py` bez prefixu (např. `smoke.py`)
- SQL: `YYYY-MM-DD_popis.sql`
- Dokumentace: `RUNAR_NAZEV.md` (velká písmena)  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

---

## Cowork sync — ZRUŠENO (§17, 2026-07-04)

**Nic se nikam nekopíruje.** `memory/` žije v repu a obě platformní složky na ni míří junctionem,
takže Cowork i Code čtou a píší TYTÉŽ soubory. Zrcadlo v `Claude\Projects\` bylo 2026-07-18
vyřazeno — ověřilo se, že se od repa rozešlo OBĚMA směry a nešlo slít automaticky.

Cowork do repa nezapisuje vůbec a čte výhradně přes `git show HEAD:<path>`; do repa jde jeho
výstup VÝHRADNĚ přes CODE. Detail → CLAUDE.md §17 + sekce „N paralelních session".

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

// ⚠️ ŽÁDNÁ další vrstva: post-processor na výstup NEEXISTUJE (odstraněn 2026-08-09).
// Korekce se aplikují v promptu (výše), kde je model umí ohnout podle kontextu.
// Pravidlo a proč → CLAUDE.md §2.
```

Pravidla:
- NIKDY "Respond entirely in Icelandic" jako jediná IS instrukce
- Nová korekce → přidat přes shrine do runar_corrections DB → platí všude

### Korekce = frázová (nese kontext) > jednoslovná (slepá) — lekce 2026-07-07
Korekce X→Y se aplikuje VŠUDE naslepo. V silně flektivní IS: Y správné v jednom pádu/osobě/čase může být
špatné jinde. **Fráze nese svůj kontext = bezpečná. Jednoslovná = kontextově slepá = riziko.**
- Nová korekce → nejdřív zkus FRÁZI. Jednoslovnou jen když je Y jednoznačné ve všech kontextech.
- Validace: `is-corr-qa.py` — BÍN ověří, že Y je reálný tvar/kompozitum + flagne jednoslovné (offline, GDPR).
- **Mrtvá korekce** (model už chybu nedělá / kryje ji grammar guard) → SMAZAT, neschovávat.

**IS QC toolkit — tři plochy, tři nástroje (nezaměňovat; jména ověřena 2026-07-17):**
- `check-is.py` — ZDROJ (kód): source-linter, pre-commit brána. Model-output chyby sem NEPATŘÍ.
- `is-grammar-qa.py` — OUTPUT (čtení): GreynirCorrect nad CELÝMI větami, flag-only. **E001 = nerozparsováno
  → NATIVE EYE**, nesmí projít tiše zeleně (§19.2).
- `is-corr-qa.py` — KOREKCE: BÍN validuje Y (offline).
- BÍN (`islenska`) — pevná slova (jména run, tier vocab); rozloží kompozita (lífs-rún) tam, kde GreynirCorrect selže.

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
   - Tree (model, zóny, signály, Gathering) → RUNAR_TREE.md · vzhled → RUNAR_TREE_RENDER.md · úkoly → RUNAR_BACKLOG.md
   - Stack, soubory, DB, tier → CLAUDE.md („Soubory") + `runar-config.js` (runar-project.md je prázdný, §20)
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
**Průběžně, ne až „před compactem" — ten přijde bez ohlášení.** Claude musí:
1. Uložit **rozdělanou práci** do `memory/snapshots/YYYY-MM-DD-nazev.md` — a **jen to, co nemá
   vlastníka jinde**: čím jsme se zrovna zabývali a co je další krok. Rozhodnutí patří do
   `RUNAR_DECISIONS.md`, otevřené úkoly do `RUNAR_BACKLOG.md`, měření do `RUNAR_EVAL_LOG.md`.
   Snapshot, který je opisuje, je „shrnutí všeho" (CLAUDE.md §20) a nemá vzniknout.
2. Aktualizovat MEMORY.md — přidat odkaz na nový snapshot
3. Aktualizovat dotčené doky dle rozcestníku (tree → RUNAR_TREE.md; ne archivované suroviny)
4. Teprve pak říct, že je hotovo

## Compact — snapshot drží Claude, owner nedělá nic

⭐ **Pravidlo (KUKY 2026-08-16):** *„jelikož děláš compact sám, tak já to nemusím vůbec stihnout.
Proto je mi příjemnější, abys to dělal ty, když je správný čas."*

**Claude drží `memory/snapshots/` čerstvý průběžně** — kdykoli přibude něco, co by nemělo přežít
jen v hlavě (nález, rozhodnutí, změna směru), přepíše dnešní snapshot. Ne na vyžádání, ne před
compactem, **průběžně**. Hook ho po compactu vypíše sám.

⚠️ **NEVYPISOVAT ownerovi `/compact` řádku k zkopírování.** Musel by ji zachytit, uložit a
vzpomenout si — a automatický compact přijde bez ohlášení, takže na to nemusí být čas. Řádka
se vypisuje **jen na `/zabal`**, když si o ni owner řekne.

⚠️ **Automatický compact instruovat NELZE** — ověřeno v dokumentaci: `autoCompactEnabled` je
na defaultu (= zapnuto), žádné nastavení summarizeru instrukce nepředá. Ruční `/compact
Zachovej: …` účinek má, ale jen když se stihne dřív. **Proto na něm nestavět.**

⚠️ **Jediné, co funguje bez ohledu na to, kdo compact spustil**, je `SessionStart` hook (`~/.claude/runar-context.py`) — spouští se i se <!-- doc-links:ok 2026-08-16 hook je uzivatelsky soubor mimo repo, do gitu nepatri -->
`source: "compact"` a vypisuje poslední rozhodnutí, mapu „sáhneš na tohle → přečti tenhle doc",
archiv čtení a pravidla, co se nejčastěji zapomínají.

⚠️ **Snapshot NENÍ handoff a nikdy z něj neber aktuální stav** (MEMORY.md). Nese, co bylo
rozdělané **k tomu dni**. Aktuální stav vlastní produkce, `git log` a doky dle rozcestníku.

## Post-compact / Session Start protokol
**Vlastník = `MEMORY.md`** (sekce Session Start Protocol). Sem se nekopíruje — dvě kopie pořadí
čtení se rozešly a každá session pak četla něco jiného.

---

## Pojmy + hlas (2026-07-04, owner)
- **Jméno bez vazby se maže.** Každý pojem v docích/designu = 1 věta významu + vazba na systém. „Orel", „skuld", „Gathering" nejsou nálepky — musí být jasné, co to JE a na co se to váže. Prázdný pojem → dohledat význam, nebo smazat.
- **Rúnar reflektuje, nikdy nepředpovídá.** Zrcadlo pozornosti, ne věštba. V hlase: přítomný čas o vzorcích a směřování („pořád se vracíš k…", „táhne tě k…"), NIKDY „stane se ti…". Pozn.: **skuld = záměr / k čemu se táhneš**, ne budoucí události.

## Two-output rule (2026-07-03)

Každý task = dva výstupy, ne jeden:
- **Output A** — samotná práce (kód, analýza, rozhodnutí)
- **Output B** — znalostní delta (co musí vědět příští Code session, co by nenašla čtením kódu)

Task bez Output B je **nedokončený**, pokud změnil rozhodnutí nebo chování.

**Kde je Output B:**
- Rozhodnutí s „proč" → `RUNAR_DECISIONS.md` (append-only) — **a oprav doc jmenovaný
  v `Affected doc(s)` VE STEJNÉM COMMITU.** Nesplněný `Affected doc(s)` je přesně ten mechanismus,
  který 2026-07-18 vygeneroval 97 rozporů v dokumentaci.
- Workflow pravidlo → tenhle soubor · Design → `RUNAR_DESIGN.md`
- **Technický stav NIKAM** — vlastní ho kód a `git log` (§20). Do docu nepatří.

**Reconciliation check** (owner-triggered, ne autonomní):
- Scope: jeden soubor nebo jeden modul
- Code přečte doc + kód → vypíše divergence (doc-stale / code-drifted / match)
- Code navrhuje, Kuky rozhoduje — Code nikdy neopravuje autonomně

---

## Protokol — co zapisovat kam

Při každé změně systému (příběh, design, pricing, code, workflow) — tato tabulka říká KAM.

### Typ změny → KDO to vlastní (§20: jedna informace, jedno místo)

⚠️ Tahle tabulka do 2026-07-18 přikazovala psát tytéž fakty do 3–4 souborů naráz
(„CLAUDE.md + MEMORY.md + runar-project.md + snapshot"). **Tím ten nepořádek vznikal.**
Nová verze říká JEDNOHO vlastníka. Ostatní místa nanejvýš odkazují.

| Typ změny | Jediný vlastník |
|-----------|-----------------|
| Cena, kredit, limit, kapacita, tier jméno, VOCAB | `v2/runar-config.js` — **žádný doc to neopisuje** |
| Délka čtení, struktura promptu | buildery v `v2/runar-character.js` |
| Model + fallback chain | `claude-proxy/index.ts` MODELS |
| Business model, marže, break-even, fyzické produkty | `RUNAR_PRICING.md` |
| Příběh, mytologie, význam částí | `RUNAR_DESIGN.md` |
| Strom — duše, zóny, signály, Gathering | `RUNAR_TREE.md` |
| Architektura, pravidla §N, DB sloupce, lanes | `CLAUDE.md` |
| Workflow, jak spolu pracujeme | tenhle soubor |
| Rozhodnutí + PROČ (datované) | `RUNAR_DECISIONS.md` (append-only) |
| Otevřené úkoly, blockery, priority | `RUNAR_BACKLOG.md` |
| **Stav** — co je hotové, SW verze, commit, co je nasazené | **kód + `git log`. Do docu NEPATŘÍ.** |

### Pravidla

- **Než někam napíšeš fakt, zeptej se: kde už bydlí?** Bydlí-li v kódu → odkaž, neopisuj.
  Bydlí-li v jiném docu → odkaz, ne převyprávění (převyprávění je taky kopie, jen ho grep nenajde).
- **`MEMORY.md` = JEN index a rozcestník.** Žádná fakta, žádný stav, žádná SW verze ani commit hash.
  (Do 2026-07-18 to byl sklad faktů a odporoval si sám se sebou — ř. 33 „enforcement = TODO"  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
  vs ř. 46 popis toho, jak enforcement funguje. Obojí četla každá session.)
- **`snapshots/` = historie ke svému datu.** Nikdy z nich nepřebírej aktuální stav; nikdy nemazat.
- **`memory/runar-project.md` je prázdný záměrně** — byl to duplikát CLAUDE.md a sám vyrobil ~15 rozporů.
- **Při sporu vyhrává PRODUKCE**, pak nejnovější datovaný záznam v `RUNAR_DECISIONS.md`.
  (KUKY 2026-07-18: „produkce je nejblíž tomu, jak to má být.")

### Trigger: kdy zapsat

Zapsat PRŮBĚŽNĚ. Compact přijde sám a bez ohlášení, takže „před ním" je okamžik,
který nikdo netrefí. Kontext v chatu zmizí; soubory jsou jediná paměť.

---

## Proveniencia tvrzení: relay ≠ rozhodnutí ownera (2026-07-17, lekce)

Když zapisuju cokoli do **kódu, §16 záznamu nebo commit message**, musí být poznat, **odkud tvrzení je**:

| Zápis | Znamená |
|---|---|
| „KUKY rozhodl / řekl" | owner mi to řekl **přímo v chatu** |
| „Cowork tvrdí / navrhuje" | přišlo **relayem** — dokud to owner nepotvrdí |
| „ověřeno na `<ploše>`" | ověřil jsem sám (pracovní strom / HEAD / probe) |

**Nevím → zeptám se ownera.** (KUKY 2026-07-17: „ano stačí se mě zeptat.")

**Proč:** Coworkův patch měl v komentáři `// Owner: jméno v každém čtení otravuje`. Zapsal jsem to jako
**přímý citát KUKYho** — do kódu, do §16 i do commit message. Náhodou to pravda byla (owner potvrdil), ale
vědět jsem to nemohl. Commit message už nepřepíšu → **vymyšlená provenience zatvrdne v projektové pravdě**
a nikdo ji později nerozliší od ověřeného faktu.

Totéž platí pro tvrzení o KÓDU (CLAUDE.md „kdo co VIDÍ") — **ověř na svém stromě, teprve pak zapiš/jednej.**
Téhož dne Cowork hlásil „claude-proxy useknutý na 528 řádků" (jeho mount); můj strom měl kompletních 675 a
esbuild čistý. Bez ověření bych „opravoval" funkční kód.

**A než začnu dělat, co Cowork navrhuje: ověř, jestli to není hotové.** Cowork vidí jen HEAD → necommitnutá
práce pro něj neexistuje. 2026-07-17 navrhoval konsolidaci tree doků, která byla hotová od 2026-07-04, jen
necommitnutá. Odtud smoke ⑫ (kanonický doc musí být v gitu).

## Adversariální náraz na shodu — jen fact-critical (Cowork↔Code)
Když Cowork a Code doručí **SHODNÝ** výstup na 🔒 nebo 📜 položce (druh viz rozcestník v MEMORY.md),
shoda **NENÍ potvrzení** — dvě session čtoucí týž doc jsou ozvěna, ne dva nezávislé důkazy. Proběhne
JEDEN pas, jehož úkol je tu shodu **zbořit proti VNĚJŠÍMU měřítku**, ne proti sdílenému docu:
- 🔒 → proti externímu zdroji (je ta etymologie / IS tvar fakt správně?)
- 📜 → proti vnitřní konzistenci kánonu (neodporuje to už zapsanému lore?)
- 🔄 → žádný náraz (pravdou je ownerův záměr, ne vnější měřítko)

Triáž: co agenti vyřeší sami, vyřeší; k ownerovi jde **jen otázka záměru**, ne rešerše. „Nenašel jsem
nic, co by to zbořilo" je taky informace — zapíše se, nezamlčí. Chybějící fakt/lore → [[dont-invent-fact-critical]].

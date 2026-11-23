# Working Style — Kuky / Rúnar sessions

## Jazyk
Kdo s kým mluví jakým jazykem → CLAUDE.md §31. Identifikátory v kódu anglicky, komentáře česky (§31).

---

## Claude Code — Principy z příručky (závazné)

### Kontext window = nejdůležitější zdroj
- Po 2 selháních na stejném problému → /clear a začít znovu s lepším promptem
- Akumulace neúspěšných pokusů kontaminuje kontext — Claude se stále vrací ke špatné cestě
- `/compact` a co po nem prezije → sekce „Compact" niz v tomhle souboru

### ⭐ Pořadí, ve kterém se sahá na cizí věc (KUKY 2026-08-17)
Pravidla na tohle už existují (`CLAUDE.md` §21 kritika · §24 ověř · §26 dohledej proč to odešlo ·
§27 zaútoč na nástroj). **Chybělo jen pořadí** — v jakém sledu je pustit, když něco vezmeš do ruky.

1. **Co to je a PROČ to tam je** — ne co to říká. Kdo to čte, co se rozbije, když to zmizí.
   ⭐ **Pokyn v promptu: napřed `git log -S"<věta>" -- v2/` a záznam DECISIONS ke commitu, TEPRVE pak návrh změny** — a stejný krok
   napiš do zadání každé kontroly promptu, kterou pouštíš (agent jinak hlásí „rozpor“ bez důvodu). 2026-10-16: kontrola označila
   „Ask … may take the room an explanation needs“ za vadu a já ji předal k opravě; owner: *„než to opravíš, tak zjistit, proč to tam tak
   je! ASK má větší délku z nějakého důvodu!!!“* Důvod stál v DECISIONS 2026-09-06 (40 → 90 slov, změřeno); vadný byl jen IS přepis z 09-27.
   ⭐ **Než napíšeš JAKÝKOLI vzor (regex, filtr, detektor), VYPIŠ SI DATA, na která má sednout.**
   Ne „asi tam bude *one flowing*" — vytisknout ty řádky a psát vzor podle nich. 2026-08-17 jsem
   takhle **třikrát** ohlásil falešný nález: islandský detektor (`\b` neplatí na `þ`), obrazy
   s výkladem (vzor ušitý k jedinému testu), tvar výstupu (vzor minul `Lesturinn fer í einum
   flæði`, protože jsem si znění domyslel). Pokaždé to vypadalo správně a bylo to prázdné.
   §24 („měř, nehádej") to zakazuje už dávno — chyběl postup, ne pravidlo.
2. **Existuje už řešení nebo záznam?** Dohledej (`grep RUNAR_DECISIONS.md`, `tools.js`,
   `archive_batches.js --list`). **Nenavrhuj, dokud jsi nehledal.**
   ⭐ **A do CÍLOVÉHO souboru grepni ten pojem, který do něj chceš vnést.** §20 říká „zeptej se,
   kde už to bydlí" — to je verze na pozornost a 2026-08-17 selhala: psal jsem `/compact` sekci
   do souboru, kde o `/compact` řádka už byla. Jeden grep to chytí. Měníš řádku → přečti okolní
   sekci; přidáváš sekci → celý soubor; grep vždycky, stojí to nic.
3. **Záznam existuje a stav mu neodpovídá?** Rozliš: selhal **zápis**, nebo **následná oprava**?
   Jsou to různé vady s různou opravou.
4. **Než navrhneš nástroj:** řeší MŮJ problém, nebo jiný, který se mi líp staví?
5. **Teprve pak sáhni** — a hotový kus rozbij, než ho ohlásíš.

**Doloženo (`mood`, 2026-08-17).** Slepě: *„`mood` je v CLAUDE.md, v kódu není, smaž to."*
Tímhle postupem: pole odstraněno 2026-06-14, **záznam existuje a je úplný**, dokonce s
`Affected doc(s): CLAUDE.md` — selhala až ta oprava. Kontrola na to existuje (`check-docs.py`),
jen do ní ten **odstraněný** pojem nikdo nepřidal. Výsledek není smazané slovo, ale **zavřená
cesta, kudy to přišlo**.
Krok 4 přitom zabil moji vlastní myšlenku postavit mapu vazeb: mapa ukazuje strukturu, kterou
zjistím grepem, a neukazuje *proč* — což je jediné, co mi po compactu chybí.

### Explore → Plan → Implement — nikdy přeskočit (u nových věcí)
**Plán schvaluje owner u nových funkcí a změn chování** (co uživatel uvidí, co se počítá, prompt, data). **Bez ptaní** se opravují
rozpory doc × kód, duplikáty a chyby (CLAUDE.md §16, §20), vlastní kontroly a paměť ([[find-a-gap-close-it-now]]) — a dohodnutý
plán se odjede celý bez ptaní mezi kroky ([[proceed-dont-ask]]). DECISIONS 2026-10-11 (15).
**Nasazení (edge funkce, databáze) — KUKY 2026-10-14** (*„proč se mě ptáš na to, jestli můžeš nasadit? je to důležité se mě ptát?“*
→ *„ano zapiš“*): oprava už schváleného chování se zeleným smoke se **nasadí bez ptaní a ohlásí** (verze, bez přihlášení 401 /
preflight 204, `scripts/utils/nasazene_vs_repo.py`). Ownera se ptát jen u: nového chování nebo nové funkce · čehokoli, co mění peníze
(kredity ElevenLabs, model, ceny), soukromí nebo platby · SQL, které mění databázi (mimo zápisy, které owner session svěřil — korekce
IS, DECISIONS 2026-09-23 (6), (7)) · nasazení, které se předem ověřit nedá. DECISIONS 2026-10-14 (7).
1. Ty popíšeš záměr (nemusí být technicky přesně)
2. Claude ukáže co to znamená v praxi — kde to sáhne, co ovlivní, co je nejdřív
3. Ty doplníš / upřesníš / zamítneš
4. Teprve pak implementace — jeden krok najednou
5. Po implementaci: zápis k vlastníkovi (CLAUDE.md §16, §20)

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
**Vlastník = `CLAUDE.md` „Kde hledat co“** (pravidlo) · podrobnosti `docs/projekt-mapa.md` „Doc-owner pravidla“. Sem se nekopíruje.
Co platí pořád a co CLAUDE.md nemá: **historie „Hotovo" nepatří do doků** — vlastní ji `git log` a DECISIONS.

---

## Implementační pravidla
Vlastní je CLAUDE.md: §1 (JS přes Python skript), §4 (SW verze), §7 (commit a push). Co tam není:
- Apostrofy v Python: přeformulovat string, aby apostrof nebyl potřeba.

## Detail k CLAUDE.md §11 — IS text v Pythonu = literální znaky (NIKDY \\uXXXX)
`\\u00faN` → JS `úN`. Velká písmena za hex sekvencí zůstanou. Vždy: `python -X utf8` + literální IS znaky.

## Detail k CLAUDE.md §12 — jméno, když chybí
Přihlášený bez jména → `'you'`/`'þú'`. Visitor (anonymous) → `'Visitor'`/`'Gestur'`. NIKDY `email.split('@')[0]`.

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

### Naming conventions
- Refactor skript: `refactor-popis.py`  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- Utility: `název.py` bez prefixu (např. `smoke.py`)
- Dokumentace: `RUNAR_NAZEV.md` (velká písmena)  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

---

## Ownerovi se neposílají příkazy ke spuštění (KUKY 2026-08-18)

*„Proč mi posíláš příkazový řádek? Nechápu, co to je!"* — o `node scripts/utils/gen_direct.js
--without lens`.

**Owner není obsluha nástrojů.** Skripty pouští CODE; owner rozhoduje a čte výsledky. Řádka
k zkopírování po něm chce, aby si ji přečetl, pochopil, uložil a v pravou chvíli si na ni
vzpomněl — to je práce navíc za nic.

Místo příkazu napiš **co ten pokus zjistí a co z něj vyjde**; když to má smysl, prostě to pusť.
Příkaz do odpovědi patří jen tehdy, když ho owner **výslovně chce** (např. SQL, které smí
spustit jen on — pak přesné a celé, → [[paste-sql-explicitly]]).

**Táž chyba, dvakrát za den:** `/compact Zachovej: …` (zrušeno ráno, sekce „Compact" níž)
a večer tenhle příkaz na generování dávky. První byla výjimka v pravidle, druhá byl reflex.

**Potřetí 2026-10-13 (CODE-read):** na „co jsi kde udělal, ať můžu zkontrolovat“ jsem poslal `node scripts/verify_nosice.js --vypis`
a `git log … | grep …`. Owner je spustil z `C:\Users\zkuku` v PowerShellu (bez `grep`) — obojí spadlo: *„proč mi posíláš ty funkce,
co já s tím?“* Na „ať můžu zkontrolovat“ patří odkazy `soubor:řádek` a výsledek, který jsem pustil sám.
🔒 **Od 2026-10-13 hlídá stroj:** Stop-hook `hooks/claude/runar-zprava-check.py` pravidlo 5 — zpráva s blokem `node`/`git`/`python`/`npm`/
`supabase` neprojde, pokud neříká, proč to owner musí spustit sám; bloky ```sql se nepočítají.

---

## Co NIKDY nedělat
- HTML mockupy (žerou tokeny, nevypadají jako originál)
- Přidávat "vylepšení" která nebyla zadána
- Nechávat patch skripty v rootu `Runar-admin/`
(Commit po jedné věci → §7 · Edit na JS → §1 · kopie do Cowork → §17.)

## ⚡ IS JE PRIMÁRNÍ JAZYK
Pravidlo, tři vrstvy generování a kontrola IS → CLAUDE.md §2. Co tam není:
- NIKDY „Respond entirely in Icelandic“ jako jediná IS instrukce.

### Korekce = frázová (nese kontext) > jednoslovná (slepá) — lekce 2026-07-07
Korekce X→Y se aplikuje VŠUDE naslepo. V silně flektivní IS: Y správné v jednom pádu/osobě/čase může být
špatné jinde. **Fráze nese svůj kontext = bezpečná. Jednoslovná = kontextově slepá = riziko.**
- Nová korekce → nejdřív zkus FRÁZI. Jednoslovnou jen když je Y jednoznačné ve všech kontextech.
- Validace: `is-corr-qa.py` — BÍN ověří, že Y je reálný tvar/kompozitum + flagne jednoslovné (offline, GDPR).
- **Mrtvá korekce** (model už chybu nedělá / kryje ji grammar guard) → SMAZAT, neschovávat.

**IS QC toolkit — nástroje a jejich pořadí vlastní `CLAUDE.md` §2 („Kontrola IS“); tady se neopisují (§20).**
Co tam není a patří sem: plochy se nezaměňují — kontrola zdrojového kódu nevidí výstup modelu a naopak (která je která, říká §2).
**E001 = nerozparsováno → přepsat, dokud tomu nástroj nerozumí** (fronta „NATIVE EYE“ zrušena 2026-07-18, §19.2).

### Islandská gramatika — rod podstatného před přídavným
→ [[is-grammar-adjective-gender]] (postup, ověřené případy, slovník rodu).

---

## Tier hodnoty (k CLAUDE.md §8)
Při změně tier hodnoty: grep runar-app.js, runar-reader.html, runar-translations.js. (ᚱ v UI → CLAUDE.md §5.)

---

## runar-shrine.html = admin, NE lab
⚠️ **„V2 lab" NEEXISTUJE od 2026-07-10** (commit `c6eb89c`) — změny čtení se v shrine netestují; `#reader-setup`, `#reader-rune-card` ani `#reader-output` tam nejsou.

Které taby shrine má, říká `showTab(` v `runar-shrine.html`.

⭐ **`teach` NENÍ testovací plocha — píše do produkce.** `invokeRunar()` vygeneruje statické čtení
runy a uloží ho do `runar_static_audio`; produkční reader i journal je pak servírují uživatelům
(`runar-app.js:861`, `:1167`, `runar-journal.js:230`). Změna promptu se tedy v shrine neozkouší,
ale **rovnou projeví** — a jen pro ty runy, které tam někdo znovu vygeneruje.

## Konverzace se neztrácí — snapshot je dobrovolný (od 2026-10-11)
**Povinnost snapshotu ZRUŠENA** (KUKY 2026-10-11 „11. zrušit povinnost“, DECISIONS 2026-10-11 (21)). Proč: hlídač blokoval „jednou za session“
a session běží dny přes compacty → poslední snapshot byl 2026-10-07, pravidlo vypadalo platně a nic nevynucoval; snapshot je navíc
převyprávění, které zastará a opakuje BACKLOG a DECISIONS (CLAUDE.md §20). Místo něj platí:
- **Přepisy konverzací se nemažou** (`cleanupPeriodDays` 36500 v `~/.claude/settings.json`; do 2026-10-11 se mazaly po 30 dnech — <!-- doc-links:ok 2026-10-11 uživatelské nastavení Claude Code, mimo repo -->
  z CODE session zbylo 12 přepisů, nejstarší 2026-08-15).
- **Noční šifrovaná kopie** všech přepisů (CODE i Cowork) a hooků z `~/.claude` → `scripts/utils/zaloha_konverzaci.js`, pouští ji noční
  záloha DB; jen lokálně `~/runar-eval/zaloha-konverzaci`, nic se nemaže.
- **Hledání:** `node scripts/utils/najdi_v_konverzacich.js "<text>"` (`--kdo owner`, `--od`, `--zalohy`). Nevíš, co owner řekl nebo co se
  rozhodlo, a v DECISIONS/BACKLOG to není? Napřed hledej tady, pak se ptej.
- Rozhodnutí dál do `RUNAR_DECISIONS.md`, úkoly do `RUNAR_BACKLOG.md`, měření do `RUNAR_EVAL_LOG.md` — PRŮBĚŽNĚ, compact přijde bez ohlášení.
- Snapshot smí vzniknout (rozdělaná práce, která nemá vlastníka jinde), ale nic ho nevyžaduje.

⭐ **Stop-hook dál hlídá neverzovaný soubor v `memory/`** (od 2026-08-20) — ten, který vznikl v TÉHLE session; blokne jednou za session.

⚠️ **NEVYPISOVAT ownerovi `/compact Zachovej: …` řádku k zkopírování — ANI na `/zabal`.**
Na `/zabal` platí stejně: owner by ji musel držet v hlavě do okamžiku, který nikdo netrefí.
KUKY 2026-08-17 na ni řekl: *„tohle mi dáváš k čemu?"* — **nemá konzumenta.** Co by nesla, už
leží v přepisu konverzace (nemaže se, dá se prohledat) a v DECISIONS/BACKLOG; řádka je jen druhá kopie
téhož přes kanál, který nefunguje (§20). Owner píše **holé `/compact`**, nic víc.

⚠️ **Automatický compact instruovat NELZE** — ověřeno v dokumentaci: `autoCompactEnabled` je
na defaultu (= zapnuto), žádné nastavení summarizeru instrukce nepředá. Ruční `/compact
Zachovej: …` účinek má, ale jen když se stihne dřív. **Proto na něm nestavět.**

⚠️ **Jediné, co funguje bez ohledu na to, kdo compact spustil**, je `SessionStart` hook (`~/.claude/runar-context.py`) — spouští se i se <!-- doc-links:ok 2026-08-17 hook je uzivatelsky soubor mimo repo, do gitu nepatri -->
`source: "compact"` a vypisuje poslední rozhodnutí, mapu „sáhneš na tohle → přečti tenhle doc",
archiv čtení a pravidla, co se nejčastěji zapomínají.

⚠️ **Snapshot (je-li) NENÍ handoff a nikdy z něj neber aktuální stav** (MEMORY.md). Nese, co bylo
rozdělané **k tomu dni**. Aktuální stav vlastní produkce, `git log` a doky dle rozcestníku.

## Post-compact / Session Start protokol
**Vlastník = `MEMORY.md`** (sekce Session Start Protocol). Sem se nekopíruje — dvě kopie pořadí
čtení se rozešly a každá session pak četla něco jiného.

---

## Pojmy + hlas (2026-07-04, owner)
- **Jméno bez vazby se maže.** Každý pojem v docích/designu = 1 věta významu + vazba na systém. „Orel", „skuld", „Gathering" nejsou nálepky — musí být jasné, co to JE a na co se to váže. Prázdný pojem → dohledat význam, nebo smazat.
- **Rúnar reflektuje, nikdy nepředpovídá.** Zrcadlo pozornosti, ne věštba. V hlase: přítomný čas o vzorcích a směřování („pořád se vracíš k…", „táhne tě k…"), NIKDY „stane se ti…". Co znamená skuld (záměr, ne budoucí události) → `RUNAR_TREE.md`, „Zásada“.

## Two-output rule a Reconciliation
Vlastník = CLAUDE.md §16.

---

## Protokol — co zapisovat kam

Při každé změně systému (příběh, design, pricing, code, workflow) — tato tabulka říká KAM.

Kdo co vlastní → **rozcestník v `MEMORY.md`** (jediná mapa). Jak psát, aby informace žila na jednom místě, a kdo vyhrává při
sporu → CLAUDE.md §20.

### Trigger: kdy zapsat

Zapsat PRŮBĚŽNĚ. Compact přijde sám a bez ohlášení, takže „před ním" je okamžik,
který nikdo netrefí. Kontext v chatu zmizí; soubory jsou jediná paměť.

---

## Přesunuto do samostatných pamětí (2026-11-19, délka docu)
[[vocab-natvrdo-a-migrace]] · [[js-unicode-escapes-python]] · [[cowork-bash-mount]] · [[protokol-externi-dokumenty]] · [[proveniencia-relay-neni-rozhodnuti]] · [[adversarialni-naraz-fact-critical]] · [[naklady-testovani]]

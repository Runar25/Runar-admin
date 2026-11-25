# Working Style — Kuky / Rúnar sessions

## Claude Code — Principy z příručky (závazné)

### Kontext window = nejdůležitější zdroj
- Po 2 selháních na stejném problému → /clear a začít znovu s lepším promptem
- Akumulace neúspěšných pokusů kontaminuje kontext — Claude se stále vrací ke špatné cestě
- `/compact` a co po nem prezije → sekce „Konverzace se neztrácí" niz v tomhle souboru

### ⭐ Pořadí, ve kterém se sahá na cizí věc (KUKY 2026-08-17)
Pravidla na tohle už existují (`CLAUDE.md` §21 kritika · §24 ověř · §21 dohledej proč to odešlo ·
§25 B zaútoč na nástroj). **Chybělo jen pořadí** — v jakém sledu je pustit, když něco vezmeš do ruky.

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
rozpory doc × kód, duplikáty a chyby (CLAUDE.md §16, §20), vlastní kontroly a paměť (CLAUDE.md §20, §30) — a dohodnutý
plán se odjede celý bez ptaní mezi kroky: kód → ověření → commit → push → docs → hlášení; co se cestou ukáže špatně, rozhodni a řekni, co
a proč jsi změnil (KUKY 2026-07-14). DECISIONS 2026-10-11 (15). **Zastav se a zeptej jen u:** produktového či designového rozhodnutí, které
smí udělat jen owner · akce destruktivní nebo navenek mimo dohodnutý rozsah · zadání tak nejasného, že špatný odhad spálí práci · věci,
kterou má jen on (podpis, DNS, nastavení účtu). Technickou nebo procesní volbu rozhodni sám a jen ohlas (owner 2026-10-11: *„to je vyloženě
technická otázka, kterou bys měl vyřešit“*). *(Sloučeno 2026-11-25 z pamětí proceed-dont-ask a nasazeni-delam-sam.)*
**Nasazení (edge funkce, databáze) — KUKY 2026-10-14** (*„proč se mě ptáš na to, jestli můžeš nasadit? je to důležité se mě ptát?“*
→ *„ano zapiš“*): oprava už schváleného chování se zeleným smoke se **nasadí bez ptaní a ohlásí** (verze, bez přihlášení 401 /
preflight 204, `scripts/utils/nasazene_vs_repo.py`). Ownera se ptát jen u: nového chování nebo nové funkce · čehokoli, co mění peníze
(kredity ElevenLabs, model, ceny), soukromí nebo platby · SQL, které mění databázi (mimo zápisy, které owner session svěřil — korekce
IS, DECISIONS 2026-09-23 (6), (7)) · nasazení, které se předem ověřit nedá. DECISIONS 2026-10-14 (7).
Nasazuj jen z pushnutého stavu (nikdy z necommitnuté práce) a hned ověř `python -X utf8 scripts/utils/nasazene_vs_repo.py <funkce>`.
Zastaví-li nasazení hlídač nástroje (auto mode), **není to otázka na ownera** — napiš jednou větou, že ho zastavil nástroj a co přinese
(owner 2026-11-23: *„vždy to nasazuješ sám. proč se mě na to ptáš?“*).
1. Ty popíšeš záměr (nemusí být technicky přesně)
2. Claude ukáže co to znamená v praxi — kde to sáhne, co ovlivní, co je nejdřív
3. Ty doplníš / upřesníš / zamítneš
4. Teprve pak implementace — jeden krok najednou
5. Po implementaci: zápis k vlastníkovi (CLAUDE.md §16, §20)

### Konkrétní prompty = méně oprav
- Vždy uvádět: soubor, funkce, řádek (kde to sáhne)
- Vždy uvést co se NEMÁ změnit (scope boundary)
- Příklad: "uprav line 45 v runar-app.js — POUZE tuto část, nic jiného" > "oprav bug"

---

## Kde ukládat soubory — povinné

| Typ | Umístění |
|-----|----------|
| Produkční JS/HTML/CSS | `Runar-admin/v2/` — vždy přes Python skript |
| Patch skript (session) | vlastní gitignored slot dle §1 — přepisuje se, NEarchivovat |
| Utility skript (opakovaný) | `Runar-admin/scripts/utils/` |
| SQL migrace | `Runar-admin/sql/` — název: `YYYY-MM-DD_popis.sql` |
| Nový design dokument | `Runar-admin/` root (RUNAR_NAZEV.md) |  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
| Archivní / dočasný dokument | `Runar-admin/docs/archive/` |
| POC / experiment HTML | `Runar-admin/docs/archive/` |
| Živé docs (CLAUDE.md, RUNAR_DESIGN.md, RUNAR_PRICING.md) | `Runar-admin/` root — nikam se nekopírují (§17) |
| Obrázky, podklady, exporty (i jejich složky) | anglický název, kebab-case (např. runar-icon-blue-rune.jpg) — owner 2026-11-02 *„ukládej je anglicky. všechno.“*; obsah docs zůstává česky (§31), jména skriptů a docs se nemění (owner 2026-11-03 *„nene“*) |

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

## Co NIKDY nedělat
- HTML mockupy (žerou tokeny, nevypadají jako originál)
- Přidávat "vylepšení" která nebyla zadána
- Nechávat patch skripty v rootu `Runar-admin/`
(Commit po jedné věci → §7 · Edit na JS → §1 · kopie do Cowork → §17.)

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

⚠️ **Co funguje bez ohledu na to, kdo compact spustil:** `SessionStart` hook (`hooks/claude/runar-context.py`) se spouští i se
`source: "compact"` a od 2026-11-25 vypisuje krátkou kartu session; pravidla k souboru ukazuje od 2026-10-11 hook při dotyku
(`scripts/utils/pravidla_pri_dotyku.py`, mapa `scripts/utils/pravidla_mapa.json`) — SessionStart mapu „sáhneš na tohle“ už nevypisuje.

⚠️ **Snapshot (je-li) NENÍ handoff a nikdy z něj neber aktuální stav** (MEMORY.md). Nese, co bylo
rozdělané **k tomu dni**. Aktuální stav vlastní produkce, `git log` a doky dle rozcestníku.

## Post-compact / Session Start protokol
**Vlastník = `MEMORY.md`** (sekce Session Start Protocol). Sem se nekopíruje — dvě kopie pořadí
čtení se rozešly a každá session pak četla něco jiného.

---

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
[[vocab-natvrdo-a-migrace]] · [[cowork-bash-mount]] · [[protokol-externi-dokumenty]] · [[naklady-testovani]]
2026-11-25 (audit nositelů, owner „19. ano“): sekce Jazyk, Verifikační mechanismus, Délka doků, Implementační pravidla, Ownerovi se neposílají
příkazy zrušeny (vlastní je CLAUDE.md a hooky, doklady `docs/pravidla-duvody.md`); i18n kontrola → hlavička `scripts/i18n-diff.js`; IS
korekce → hlavička `is-corr-qa.py`; shrine → [[shrine-admin-not-lab]]; Tier hodnoty → [[vocab-natvrdo-a-migrace]]; Pojmy + hlas →
hlavička `RUNAR_DESIGN.md` a „Rúnarův rejstřík“; pořadí rodu v IS → [[is-grammar-adjective-gender]] (mapa při dotyku).

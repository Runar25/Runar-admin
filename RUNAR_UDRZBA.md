# RUNAR_UDRZBA.md — údržba celého systému jednou za měsíc
# Vlastní: POSTUP údržby — kdy, kdo, oblasti a otázky, nástroje, pořadí, výstup. Nevlastní: nálezy (→ `RUNAR_BACKLOG.md`
# „Údržba RRRR-MM“), rozhodnutí (→ `RUNAR_DECISIONS.md`), pravidla (→ `CLAUDE.md`), zprávu z jednotlivé údržby (→ složka `docs/udrzba/` (soubor na měsíc)).
# Changelog: 2026-11-23 vznik (CODE-tune; owner: „vypracuj metodiku, jak to budeme dělat, abychom udržovali systém čistý. třeba 1 za
# měsíc. minule jsme dělali snad 4 kola dlouhých kontrol, teď jsi to odbyl“).

## Proč
Kontrola architektury (kola 1–3, 2026-10-09 → 11, `docs/archive/RUNAR_BACKLOG_kontrola-architektury.md`) našla desítky vad a z každé
opakované udělala stroj. Kolo 4 se rozběhlo 2026-10-14 a nedokončilo; pak šest týdnů nic. První „údržba“ 2026-11-23 prošla jen signály
z provozu: CLAUDE.md, paměť, docy, kontroly ani DB neprošla a změnila obsah čtení bez dohledání ownerových rozhodnutí (chléb u Jery,
BACKLOG bod 15). Tenhle postup je proto pevný seznam — co se neprojde, se zapíše jmenovitě, nic se nevynechá potichu.

## Kdy a kdo
- **Jednou za měsíc**, nejpozději 32 dní od poslední. Připomíná to hlídání provozu (úloha `udrzba` v `BEHY`, `_shared/ops_souhrn.ts`):
  po lhůtě ranní souhrn PROBLEM a e-mail. Spouští owner slovem „údržba“, nebo session sama na připomínku.
- **Vede CODE-tune.** **Čtení nemění** (prompt, obrazy, texty a stavba čtení, Ask): nálezy z nich jdou CODE-read do BACKLOGu
  (owner 2026-11-23 *„čtení neměň … s code read děláme na čteních“*) a **ani ho neprochází** — pořád se mění a dělá se na něm s CODE-read
  (owner 2026-11-23 *„kontrola asi není potřeba“*). Strom → CODE-tree, web → CODE-web: jen čte a předá.
- Agenti: nejvýš 3–5 naráz, každý jedna oblast, dostane její otázky níž a vrací nálezy se `soubor:řádek`; nic neopravuje.
  Nález agenta je žádost o ověření, ne fakt (memory `verify-agent-claims-about-code`).

## Zásady
1. **Napřed co se změnilo od minula** (`git log` od posledního záznamu údržby) — tam je vada nejpravděpodobnější.
2. **Měřit, ne odhadovat** (§24): každá odpověď s číslem, výstupem nástroje nebo `soubor:řádek`.
3. **Před změnou čehokoli `uz_vime` na podstatná slova té věci** — owner o ní mohl rozhodnout dřív.
4. **Ke každé vadě PROČ** a co ji příště ohlásí dřív než uživatel; podruhé = stroj (§30). Oprava příčiny, ne příznaku.
5. Co chce ownera (rozhodnutí, peníze, SQL v produkci), jde do seznamu a práce běží dál (§16).
6. **Neprošlé jmenovitě** do BACKLOGu („Údržba RRRR-MM — neprošlo: …“).

## Oblasti a otázky
**A. Provoz** — `ops_events` 30 dní: upozornění, `client_error`, zálohy, zkouška obnovy, mazání, deploy_drift, Greynir. Naplánované úlohy
Windows (běží, výsledek, dohánění zmeškaného), cron v DB, nasazené funkce = repo, Usage Supabase (prohlížeč), klíče a domény, hlášení
(nová; rozdělaná bez položky v BACKLOGu). U každé chyby: proč, a kdy by se o ní dozvěděl stroj.
**B. Pravidla (`CLAUDE.md`)** — každý §: platí ještě? Drží ho stroj (`node scripts/verify_nosice.js --vypis`)? Stojí jinde podruhé
(paměť, working-style, docy)? Odkazy živé? Strop velikosti a zákaz historie (`verify_doc_length.js`).
**C. Paměť (`memory/`)** — každý soubor: pořád pravda (jména souborů, funkcí a příkazů existují)? Nepřebilo ho novější rozhodnutí
v DECISIONS? Není to duplikát jiného souboru nebo §? `MEMORY.md` = soubory (`verify_memory_index.js`); délka working-style.
Skilly (`~/.claude/skills`) a mapa pravidel hooků (`scripts/utils/pravidla_mapa.json`): odkazují na živé věci?
**D. Kanonické docy (`RUNAR_*.md`)** — tvrzení × kód (Reconciliation §16): opsaná čísla, stav v docu, zastaralé „dnes / zatím / čeká“,
délka a odklady (`verify_doc_length.js`), odkazy, opakování (`verify_new_duplicates.js` ℹ). BACKLOG: hotové bez ✅, `backlog_uklid.py`.
**E. Kontroly a stroje** — celý smoke; **všechny** útoky `python -X utf8 scripts/protipriklady.py --vse` (ne jen změněné); kontroly
bez útoku; hooky (`verify_hooky_claude.py`); rychlé kontroly při commitu; kontrola, která hlídá věc, co už neexistuje (vždy zelená).
**F. Kód appky (`v2/`)** — nedefinovaná jména (㊚), mrtvé funkce, soubory a styly (postup kola 2 / 14), tatáž logika dvakrát, `UI_TEXT`
(nepoužité klíče, EN bez IS, natvrdo), §5 invarianty; každá chyba JS u uživatele dohledaná k commitu, který ji způsobil.
**G. Server** — edge funkce (proměnné, kopie hodnot z configu, `verify_jwt`, importy), po změně `_shared/` všechny funkce, které soubor
načítají; DB jen čtením (RLS a granty, schéma repo × DB, tabulky a funkce bez použití, cron).
**H. Sliby uživateli** — zásady soukromí × kód (co ukládáme, smazání účtu, EHP, opt-out), nápověda × co appka dělá.
**I. Peníze** — plýtvání voláními (přehled v `nacti_cteni.js`), kvóty a stropy služeb (Supabase, ElevenLabs, OpenAI, Anthropic).

## Postup
0. `python -X utf8 scripts/utils/udrzba.py` — automatická část (provoz, nasazení, rychlé kontroly, paměť, docy) a kostra zprávy
   složka `docs/udrzba/` (soubor na měsíc) s oblastmi A–I k odškrtnutí. Celý smoke a `protipriklady.py --vse` pustit hned na pozadí (dlouhé).
1. A sám; B, C, D, F a G + H + I agenti souběžně (pět); E z běhů na pozadí.
2. Nálezy ověřit, opravit po jedné věci (commit, push, nasadit dotčené funkce, `nasazene_vs_repo.py`).
3. Uzavřít: DECISIONS „Údržba RRRR-MM“ (co našla, příčiny, nové stroje) · zpráva doplněná · neprošlé do BACKLOGu ·
   `python -X utf8 scripts/utils/udrzba.py --hotovo "<shrnutí>"` (záznam do `ops_events`, připomínka se vynuluje) · ownerovi číslovaný
   souhrn: co bylo špatně a proč, co je opravené, co hlídá nově stroj, co čeká na něj.

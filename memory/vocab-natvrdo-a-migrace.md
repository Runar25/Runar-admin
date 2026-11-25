---
name: vocab-natvrdo-a-migrace
description: "Jak najít natvrdo zapsané vocab/tier termíny a po přejmenování ručně grepnout staré (k CLAUDE.md §13, §10)"
metadata:
  type: reference
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Po přejmenování VOCAB vždy ruční grep na staré termíny (k CLAUDE.md §13 „Migrace“)
Smoke test §10 chytí jen typické patterny. Po změně VOCAB (nebo jiném přejmenování termínu) spustit:
```
grep -n "\bold_term\b" runar-app.js runar-auth.js runar-reading.js runar-tree.js runar-reader.html
```
Hardcoded výskyty mimo translations.js / VOCAB nejsou smoke testem zachyceny — kromě větví `lang === 'is' ? '…' : '…'`:
ty od 2026-10-09 hlídá ráčna smoke ㉸ (`scripts/verify_lang_ternary.js`, počet na soubor nesmí stoupnout; stav tam v BASELINE).

## Vocab/tier termíny natvrdo — jak je najít (k CLAUDE.md §10)
Seznam „zbývajících míst“ se tu nevede: stav vlastní kód (§20.4). Aktuální stav dá audit:
```
grep -nE "rune stones?|rúnastein|Rune (Seeker|Walker|Keeper)|rune reading" v2/*.js v2/*.html  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
```

**Tier jména v próze — POLICY:** v dlouhých marketingových větách OK nechat, jinde → `TIERS[x].label` (CLAUDE.md §10).

**„cast" → „reading" — OBRÁCENO (owner 2026-08-03).** Reading→cast (2026-06-06) zrušeno.
User-facing „cast" je PRYČ: config panely + name_modal → „rune reading" (de90bb2, ověřeno).
Zbytek je jen INTERNÍ a neviditelné: VOCAB klíč `cast` (hodnota už 'rune reading') · `{casts}`
placeholdery · `vn('cast')` → renderují „reading". SERVER `countsAsCast` / claude-proxy komenty
= PŘESNÝ pojem (čtení počítané do stropu; `ask` JE čtení, ale NENÍ cast) — nepřejmenovávat,
ztratilo by to smysl. **Owner 2026-08-03 potvrdil: JEN user-facing; neviditelný interní kód
(VOCAB klíč, `{casts}`, server pojem) NECHAT — nerozbíjet.** Viz CLAUDE.md §21.

## Tier hodnoty (sloučeno 2026-11-25 z working-style „Tier hodnoty“)
Při změně tier hodnoty grepni `runar-app.js`, `runar-reader.html`, `runar-translations.js` (hodnoty jen z configu, CLAUDE.md §10).

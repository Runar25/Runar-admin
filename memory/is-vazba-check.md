---
name: is-vazba-check
description: Islandskou vazbu (rekce/pád/kolokace/idiom) ověř nástrojem is-vazba.py (nútímamálsorðabók API + Risamálheild), nehádej — je to vrstva NAD BÍN
metadata:
  type: reference
---

**BÍN dává jen TVARY.** Rekci (jaký pád řídí sloveso), frázové/předložkové vazby a idiomy
BÍN NEUMÍ — a přesně tam vznikají chyby (kalk z EN, vymyšlená vazba). Tuhle vrstvu **nehádej
a neřeš „pohledem"** (KUKY 2026-08-04). Ověř ji — z receptu je hotový nástroj.

## Nástroj (primární cesta)
```
python -X utf8 is-vazba.py <slovo>                          # rekce + vazby + příklady
python -X utf8 is-vazba.py <slovo> --freq "<fráze>" ...     # + korpusová četnost
```
`is-vazba.py` (repo root) obalí dva autoritativní zdroje Árnastofnunar do jednoho příkazu.
Ověřeno 2026-08-04: `hræða` → fallstjórn **þolfall** (akuz., „děsit"); `hreyfa` má mezi významy
fallstjórn **þágufall** s vazbou `hreyfa við <þessu>` (dativ, „dotknout se/nadhodit"); korpus
`hreyfa við`=3636, `hræða við`=0 → vazba „hræða við" neexistuje.

## Zdroje (co nástroj volá; ruční fallback)
1. **Íslensk nútímamálsorðabók** JSON API — `islenskordabok.arnastofnun.is/django/api/flettur_v4/`
   (krok1 `?search=<slovo>&simple=false` → `flid`; krok2 `/<flid>/` → `items[]`). Klíčové `teg`:
   `FALLSTJ`=rekce (pád), `SOSTÆÐA`=vazba s `<slotem>` v pádu, `SOHAUS`=frázové sloveso. Strukturované, úplné, autoritativní.
2. **Risamálheild / IGC korpus** (2,4 mld slov) — n-gram `n.arnastofnun.is/ngram/query` (četnost;
   0 = vazba neexistuje) + Korp `malheildir.arnastofnun.is:1234` (pád v úzu přes CQP tag `fall` o/þ/e/n).
3. ISLEX (SPA, chce prohlížeč) · malid.is Blöndal glosy idiomů = sekundární. Wiktionary = jen rychlý sanity.

## Dvě pasti
- Islandská písmena v URL **VŽDY UTF-8** (`ð`=%C3%B0 …). Doslovný znak na Windows shellu → Latin-1 → korpus vrátí **tiše prázdno** (ne chybu). Nástroj to řeší (urllib.quote).
- `malid.is`/`islenskordabok` web / ISLEX jsou **JS SPA → WebFetch vrátí prázdnou skořápku.** Jít na JSON API (což nástroj dělá).

## Kde ani tohle nerozhodne (řekni „nevím", §23)
Významový/úzový **rozdíl blízkých synonym** (např. `í senn` „po jednom/zároveň" vs `allt í einu`
„najednou") — slovník dá glosu, korpus četnost, ale sémantický kontrast rozhodne až **věta v kontextu
nebo rodilý mluvčí**. Kolokace podle konkrétního objektu (`fara yfir skarð`) nejsou indexované —
korpus potvrdí jen vzácnost, ne přijatelnost. Nedomýšlet → [[dont-invent-fact-critical]], [[measure-dont-eyeball]].

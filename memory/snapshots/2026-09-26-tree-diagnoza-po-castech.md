---
name: 2026-09-26-tree-diagnoza-po-castech
description: CODE-tree 2026-09-26 — diagnóza stromu po částech (část 1 hotová a opravená); ownerovo tempo a další krok
metadata:
  type: project
---

# 2026-09-26 — diagnóza stromu po částech (session CODE-tree)
**Historický záznam k tomuto dni, ne popis dneška.** Nálezy a opravy vlastní `RUNAR_BACKLOG.md`
(Tree sekce) a `RUNAR_TREE.md` §2; stav `git log`. Tady je jen to, co jinde nebydlí.

## Co owner chce a jak
KUKY na strom měsíc nesáhl a chce ověřit, že **roste tak, jak je zapsané**: semínko ze životní
runy → Norny → single → spready → element → oblast → záměr/seeking → růst → kořeny.
⚠️ **Tempo je jeho podmínka:** *„nechci, abys dělal všechno zaráz, jinak se v tom ztratím.
Po částech!!!"* Jedna část = změřit → výsledek → jeho rozhodnutí → oprava. Další část až na jeho pokyn.

## Kde jsme
- **Část 1 (semínko) HOTOVÁ i s opravami:** Sowilo znak + jména run podle aplikace; čtení navazují
  na semínko. Fehu jako životní runa (vzorec `calcLifeRune`) předáno CODE-tune handoffem.
- **Další = část 2: Norny.** Už teď víme (změřeno při části 1): Norny v aplikaci dělají korunu,
  ne „3 kořeny" z plánu (§2 — v kódu nepostavené). To je jádro části 2.
- ⚠️ **Aplikace skládá strom podle stavu z 21. 7.** — všechno z labu od srpna (F0–F10, exitFloor)
  v ní není. Diagnóza měří APLIKACI. Rozdíl lab × aplikace se ukáže u každé části znovu.

## Nástroj
`scripts/utils/tree_diag.js <část>` — protlačí produkční render a měří nakreslené tvary.
Metrika „šířka u země" je x-rozsah svazku (hýbe ji i prohnutí kmene), ne tloušťka; tloušťku
měř přímo na enginu (část `1b`).

## Doplněno 2026-09-27 — část 2 (Norny) změřena, čeká na ownera
- Nálezy v backlogu („NORNY: POLOVINA ZAKLÁDACÍCH STROMŮ…"). Hook opraven (owner „ano").
- ⭐ **Ownerův NOVÝ MODEL (směr, ještě nezapsaný do DECISIONS — napřed jeho potvrzení):**
  runa = vlastní pramen (kořen + kmen + větev), až 25; kmen = 3D kruh pramenů; element určuje,
  kam runa smí; prameny téhož elementu vedou spolu a **rozdělí se** (místo graduace — ta je
  „hledání cesty kolem"). Mění rozhodnutí 2026-08-07 (9 pramenů + odbočky). Můj návrh k němu:
  z kmene vychází **rameno elementu**, runy se od něj odlupují jako vlastní větve (max 5 ramen
  u kmene, přesto každá runa svou větev); kořeny zrcadlově.
- **Čeká na ownera:** (1) mají pozice Noren význam (urð níž/kořen · skuld výš), (2) pěstovat
  nový strom v LABU (doporučeno; lab ale nemá semínko a tahá runy náhodně), (3) dočasně
  v aplikaci jen zakázat zdvojení větve?
- Owner si založí nový strom a poroste **současně se mnou** — každý segment opravit od začátku.

## Co visí
- ~~Oprava hooku `tree-guard.sh`~~ — hotovo 2026-09-27.
- Blank má ve stromě jiný znak (◇ proti ○); čtení s Blank to řeší zvlášť (`blank → odinn`) — ověřit v části 3.

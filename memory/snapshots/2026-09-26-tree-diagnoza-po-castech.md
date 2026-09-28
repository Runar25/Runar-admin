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
- **Owner rozhodl (2026-09-27):** pozice Noren ano · pěstujeme v LABU · v aplikaci zakázat
  zdvojení. **HOTOVO téhož dne:** aplikace bez falešné kopie; lab má semínko, zakládací Norny
  = 3 vlastní prameny (skuld nahoře · verðandi · urð nejníž) a „runa jen jednou".
- **Další = část 3 (single).** V labu po Nornách zatím běží STARÝ model (větve podle elementu
  po 5 taženích, odbočky za opakování). Otevřená otázka na ownera: opakovaná runa = silnější
  / delší táž větev, nebo další větev té runy? (Moje doporučení: táž větev silnější — „1 runa
  = 1 pramen".) Lab nástroj: `tree_diag.js lab2` / `lab2b` (protlačí skutečnou stránku labu).
- Owner si založí nový strom a poroste **současně se mnou** — každý segment opravit od začátku.

## Doplněno 2026-09-28 — nový model postaven v labu
- Owner potvrdil pravidla 1–7 + a) + b); postaveno a změřeno na jeho stromě (pravidla bydlí v
  `RUNAR_TREE.md` §5, tady se neopisují). Kontroly: `tree_diag.js model` (jeho uložený strom) a
  `model2` (náhodné stromy + přehrání po jednom čtení).
- **Další krok:** owner si strom v labu prohlédne (Ctrl+F5). Otevřené: **mapa run / priority**
  (kam se která runa naklání, výška, strana) — pravidlo 7; a **port do aplikace** až po jeho ok.
- **Večer 2026-09-28: RŮSTOVÝ STROM** (owner změnil b): každé tažení = větev, max 5 na větvi,
  roste postupně, poloha při zrodu, odhalování). Pravidla v `RUNAR_TREE.md` §5. Owner chce **vidět**
  a říct „takhle ano / takhle ne" — posuvníky `zrod`, `dorust`, `twigMax` jsou jeho. Kontroly:
  `tree_diag.js grow` + `jump2` (⚠️ `labRun` do dneška tiše měřil výchozí posuvníky — opraveno).
- Bash v téhle session občas padá na „classifier no verdict" — neopakovat do 10×, dělat mezitím
  čtení/dokumenty a dokončit, až owner napíše „pokračuj".

## Co visí
- ~~Oprava hooku `tree-guard.sh`~~ — hotovo 2026-09-27.
- Blank má ve stromě jiný znak (◇ proti ○); čtení s Blank to řeší zvlášť (`blank → odinn`) — ověřit v části 3.

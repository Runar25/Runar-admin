# RUNAR_TREE_SPECIALS.md — Speciální větve / motivy stromu
# Vznik: 2026-07-04 · Cowork · JEDINÝ přístupný domov pro „speciální obrazy" ve stromu
# STATUS: KANDIDÁTI k diskusi. NIC z tohohle se nestaví bez probrání s KUKYm.
# Konsoliduje roztroušené zmínky (runar-patterns.md = zastaralé/surovina, engine-lab ř.208, TODO bod 12/14),
# ať se nápady neztratí (byly špatně přístupné).

---

## Co je „speciální motiv"
Decentní, málo viditelný, VZÁCNÝ vizuál, který se objeví jen když se **sejdou určité předpoklady**.
Engine ho kreslí jako každou větev → je **odstranitelný** (nelíbí se → smaž motiv, nic se nerozbije).
NENÍ součást základní struktury (25 run = větve) — je to knihovna motivů VEDLE ní.

## Recept (šablona, ať můžeš vymýšlet další)
```
SPOUŠTĚČ (předpoklady se sejdou, vzácné) → MOTIV (jemný authored tvar) → UMÍSTĚNÍ → [volitelně] Rúnarova věta
```
Tři knoflíky: **co ho spustí · jak vypadá · jak je vzácný.**

## Zásady (KUKY 2026-07-04)
- **Decentní + málo viditelné.** Spíš textura / náznak než ozdoba. Kdo si všimne, dostal odměnu.
- **Vzácné = cenné.** Předpoklady se musí SEJÍT (ne jeden signál).
- **Zasloužené.** Vzniká z reálného vzorce čtení, ne z náhody.
- **Odstranitelné + engine-safe.** Kreslí ho `growBranch` jako větev/twig; žádná nová kreslicí logika.
- **Na mytologii.** Jasan, Yggdrasil, Norny, islandská příroda.

---

## A) Podle Area of Life (nápady, k diskusi)
| motiv | co (jemné) | předpoklady se sejdou |
|---|---|---|
| **Srdce** (Love) | dvě blízké „love" větve se nakloní; v křížení negativní prostor srdce | 2+ Love čtení vedle sebe |
| **Hnízdo** (Family) | drobné spletené hnízdo ve vidlici větve | 3+ Family + existující vidlice |
| **Urðina studna** (Healing) | slabé vodní oko / pramínek u kořene (Urðarbrunnr = studna osudu) | Healing v urð/kořenové zóně, opakovaně |
| **Práh / brána** (Crossroads) | dvě větve se klenou do dveří | Crossroads + průlomový pár (Thurisaz+Dagaz…) v okně |
| **Tichý pupen** (Inner/Spirit) | zavřený, slabě světélkující pupen ve vrcholu — neotevře se | Inner/Spirit ve skuld zóně, málo čtení |
| **Letokruh / zářez** (Purpose/Career) | jemný vryp nebo prsten na kmeni = milník | Purpose + záměr seed→uzavření |

## B) Podle elementu (nápady, k diskusi)
| motiv | co (jemné) | předpoklady se sejdou |
|---|---|---|
| **Řeřavý hrot** (oheň) | špička ohnivé větve slabě řeří jako uhlík (jen za šera / v zimě) | dominance ohně |
| **Kapka rosy** (voda) | jedna kapka / krůpěj visí na hrotu klesající větve | shluk vody |
| **Vichrem česané rameno** (vzduch) | celé rameno jemně sčesané jedním směrem, jak by prošel poryv | dominance vzduchu |
| **Lišejník / mech** (země) | textura lišejníku na staré kůře (stálost, věk) | dominance země + věk |
| **Jinovatka** (stín: Isa/Hagalaz/Nauthiz) | stříbřitý povlak jíní na větvi, který nezmizí (v sezóně) | shluk studených run |

## C) Vztahy / čas (nápady, k diskusi)
| motiv | co | předpoklady se sejdou |
|---|---|---|
| **Srůst** | 4× stejná runa → dvě větve srostou v jednu mohutnější | 4×+ táž runa (potvrzovací série) |
| **Můstek** | tenký výhon spojí dvě spojenecké větve | spojenecký pár vedle sebe (oheň+vzduch / voda+země) |
| **Trn** | drobný trn / zlom tam, kde se protiklady skoro dotknou | protiklady vedle sebe (oheň×voda, vzduch×země) |
| **Návrat** | nový výhon vyraší ze staré jizvy po runě | runa chyběla 6+ měsíců a vrátila se |

---

## Existující (roztroušené → sem konsolidováno; status u každého)
- **love = srdce · flame = proplet kolem osy** — engine-lab ř.208 (starý liana lab; koncept přenést)
- ~~Blank / Óðin = průsvitná duch-větev~~ — ZRUŠENO 2026-07-21 (KUKY: zbytečnost). Blank = běžná runa Shadow.
- **Life Rune = nejsilnější větev přímo z kmene** — runar-patterns.md · k diskusi
- **Ætty pulz · shimmer listy** — runar-patterns.md · zastaralé, k diskusi
- **Gathering: Eagle (koruna) / Níðhöggr (kořeny) / Ratatoskr (celý strom)** — runar-patterns.md · koncept významu, ne vizuál · k diskusi
- **Potvrzovací série 2× cluster / 3× zlatý junction / 4× srůst** — runar-patterns.md

---

## Pravidlo
`runar-patterns.md` je v mnoha věcech ZASTARALÉ — bereme z něj jen jako surovinu; **každý přenos se probere s KUKYm.**
Tento soubor = jediný přístupný katalog speciálních motivů, ať se nápady neztratí. Přidávat sem nové, ne roztrušovat jinde.

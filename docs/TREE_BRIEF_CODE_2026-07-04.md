# TREE BRIEF pro Code — 2026-07-04
# Od: Cowork (po designové session s KUKYm). Pro: Code.
# STATUS: krok 1 = jasné zadání · boughs = korekce směru · specials = ke zvážení (NAPŘED probrat s KUKYm)

## TL;DR
1. **Postav krok 1** — element z reálných čtení do crown-composeru. Engine-safe, přesný recept níž.
2. **NEstav boughs přestavbu** — zregresovala (viz korekce). Zóna = jen jemný posun výšky, ne destruktivní blend.
3. **Specials** (`RUNAR_TREE_SPECIALS.md`) = kandidáti k úvaze. Napřed probrat s KUKYm, pak zkoušet po jednom, izolovaně.

**Tvrdé pravidlo (platí všude):** crown-composer engine (`growBranch` / spojitá limba / fraktál / paint / kořeny) se **NESMÍ rozbít**. Měň JEN „kam/co" vyroste, ne „jak" se kreslí. Práce na KOPII, snapshot před „hotovo", malé kroky s vizuální kontrolou.

---

## 1) KROK 1 — element z reálných čtení (engine-safe, POSTAVIT)
Recept (zdroj: `memory/runar-tree-living-movement.md`):
- `realAge = log.length × growthPerCast` — věk stromu z počtu **reálných** čtení (ne z TREE AGE slideru).
- `routingFromLog` = element mix z **reálného logu** → **nahradí `routing(seed, nR)`** (dnešní simulaci).
- **Engine netknutý:** growBranch / limba / fraktál / paint / kořeny beze změny. Mění se JEN vstupní data (rozdělení elementů + věk).
- **Test:** člověk s ohnivými čteními → viditelně mohutnější ohnivé větve, sedí s logem. Reload → stejné (deterministické z logu).
- Na kopii, snapshot před/po.

(Krok 2 = zóna: **jemný posun výšky** à la liana `branch_point` — minulost níž / budoucnost výš. NE boughs blend. Až po kroku 1 + schválení KUKYm.)

## 2) BOUGHS — korekce směru (NEpřestavovat)
`RUNAR_TREE_BOUGHS.md` (schváleno 17.6.) zní jako „přestav strom na hierarchii ramen". **Novější poznámka z 2026-07-04** (`memory/runar-tree-engine-lab.md`, horní ⭐⭐ OPRAVA) říká z reálné zkušenosti opak:

> Boughs = **regrese** z crown-composeru (slepá ulička): zone-blend scvrkl vertikální rozptyl na ~¼ → „všechny větve z jednoho místa". SMĚR: pokračovat na crown-composeru, po malých krocích; zóna = **jemný posun výšky, NE destruktivní blend**.

Takže: **báze = crown-composer, jen jemné přírůstky.** Cíl „runa = větev, síla = počet čtení" je OK jako směr; cesta k němu = jemné kroky, ne velká přestavba / blend.

## 3) SPECIALS — ke zvážení (NAPŘED probrat s KUKYm)
`RUNAR_TREE_SPECIALS.md` = katalog speciálních motivů (srdce, jinovatka, Urðina studna, návrat, trn…).
- **Kandidáti, NE spec.** Nic nestavět bez probrání s KUKYm.
- Princip každého motivu: **decentní · vzácné (předpoklady se sejdou) · odstranitelné + engine-safe** (kreslí je growBranch jako větev/twig; když se nelíbí, motiv se smaže a nic se nerozbije).
- Doporučený postup: **snadné localizované motivy první** (jinovatka / lišejník / kapka rosy / řeřavý hrot / trn = textura nebo značka na JEDNÉ větvi), vztahové (srdce / brána / můstek = potřebují dvě větve) až potom.
- Testovat **jeden motiv izolovaně v Branch Composeru**, teprve pak do stromu.
- `runar-patterns.md` je v mnoha věcech **ZASTARALÉ** → jen surovina, každý přenos probrat.

---

## Kde co je
- Engine: `build_crown_composer.py` (+ `build_trunk_composer.py`, `build_branch_composer.py`); lab `v2/tree-lab-ritual/` (crown-composer 1:1).
- Recept kroku 1: `memory/runar-tree-living-movement.md`.
- Boughs korekce: `memory/runar-tree-engine-lab.md` (⭐⭐ 2026-07-04 nahoře).
- Specials katalog: `RUNAR_TREE_SPECIALS.md`.
- Stav / fronta: `RUNAR_TREE_TODO.md`.

## Co NEdělat (poučení z minula)
- Žádný nový / relaxační / per-čtení engine (rozbilo to → zahozeno, rozčílilo KUKYho).
- Nesahat do kreslení; měnit jen data + umístění.
- Nespouštět velké přestavby; malé kroky, po každém vizuální kontrola + snapshot.
- Nic ze specials ani z patterns.md nestavět bez probrání s KUKYm.

# RUNAR_TREE_BOUGHS.md — Strom jako hierarchie ramen (per-runa model)
# Verze 0.1 · 2026-06-17 · schválen směr (KUKY)
#
# Co je tohle: KANONICKÁ STRUKTURA, jak se strom staví v per-runa modelu.
# Řeší hlukování větví (obr „9 prutů z vrcholu") tím, že strom je HIERARCHIE:
# kmen → pár ramen → runy se odštěpují postupně → twigy.
# Navazuje: runar_strom_koncept.md (pevný základ §1) · runar-tree-forces.md (síly) ·
#           RUNAR_TREE_BUILD.md (Norns osa) · RUNAR_TREE_TODO.md (fronta + pravidla).
# Engine: crown-composer (tree-lab-ritual). Pracovat na KOPII, přírůstkově, engine nerozbít.

---

## 1. PEVNÝ ZÁKLAD (zamčeno — z runar_strom_koncept §1)
- **Kmen = Life Rune** (semeno/založení).
- **Kořeny = 3 zakládací Norny** (urð / verðandi / skuld).
- **Větev = JEDNA konkrétní runa.** Opakování runy ji **posílí** (tlustší/delší/mohutnější), netvoří novou. → ohraničené (~25), soudržné.
- **Barva = element. Tvar = runa.**
- **Listy = jen značka, že se v té části něco stalo.** Žádná runa/čtení do listu nejde.
- Runa jde do větve/kmene/kořene podle **významu + mood (Norns zóna) + area (strana).**

---

## 2. STRUKTURNÍ MODEL (NOVÝ — tohle je ta změna)
Strom NENÍ N větví z vrcholu kmene. Je to **hierarchie**:

```
KMEN (life rune)
  └─ RAMENO (skupina spřízněných run; vede ji nejsilnější runa)
       ├─ runa se odštěpí v místě své Norns zóny  (urð nízko … skuld vysoko)
       ├─ runa se odštěpí výš …
       └─ vedoucí runa pokračuje jako hlavní linie ramene
            └─ twigy (dekorace, fraktál)
  └─ RAMENO …
KOŘENY (3 Norny, + zrcadlo větví dolů)
```

- **Rameno = skupina run** (start: podle elementu → ≤5 ramen; barva už = element).
- **Vedoucí runa ramene** = ta s nejvíc čteními → jde nejdál/nejvýš; vede „kmen ramene".
- **Slabší runy** se z ramene **odštěpí dřív** (níž). → „dvě jdou od kmene jako jedna a oddělí se později" = **organický růst do šířky.**
- **Výška odštěpení = Norns zóna runy** (urð dole na rameni, skuld nahoře). → zóna = POLOHA na rameni.
- **Síla větve = počet čtení té runy** (reinforcement).

---

## 3. PROČ TO ŘEŠÍ TŘI PROBLÉMY NAJEDNOU
1. **Hlukování** (obr 2 = 9 větví z jednoho bodu): runy rozprostřené po ramenech v různých výškách → prostor, žádný překryv.
2. **Regrese do středu** (per-runa agregace zóny → vše do středu): zóna = kde podél ramene se runa odštěpí, ne náklon ke středu. (Pravidlo dominantní/recency zóna pořád potřeba, ale méně kritické.)
3. **Vazby/síly dostanou jasnou roli:** určují **kdo s kým cestuje** (skupina ramene) a **kdy se oddělí** → „určíme vazby a směr, tím učíme tvar". Pořád závisí na osobě (kdo má jaké runy a kolik).

---

## 4. ENGINE FIT (proč to engine přežije)
- **Engine UŽ je rekurzivní:** `growBranch` roste limbu → děti (pod-větve) → twigy. Dnes jsou děti **dekorativní fraktál (stejná runa)**.
- **Změna = děti dostanou VÝZNAM:** dítě = konkrétní runa skupiny, odštěpená v místě své zóny (ne generická).
- **Kreslení limby + kůra + spojité napojení = NETKNUTÉ** (engine-safe). Mění se jen **kompozice** (co kde vyrazí).
- Odštěpení = start podél tečny ramene = **stejný bezešvý mechanismus jako dnešní pod-větve** (ty vypadají dobře, žádný nalepený klacek).
- **Počet hlavních ramen zůstane malý** (≤5 element) → engine šťastný; 25 run se schová jako jejich děti, rozprostřené.

---

## 5. OTEVŘENÉ OTÁZKY (ladit — KUKY na cestách v chatu)
- **Seskupení do ramene:** element (≤5, základ) — nebo bohatší vazby (transformační páry, oheň-led) určí, kdo s kým? Návrh: **element základ, vazby doladění.**
- **Pravidlo zóny runy** (proti regresi): dominantní zóna (modus) vs recency-váha. Návrh: recency (runa „kde je teď").
- **Směr ramene (vlevo/vpravo/nahoru):** element polarita / area / čas (urð↔skuld). Otevřené (pozor: §1 říká area=strana, koncept 3.3 otevírá čas — vyjasnit).
- **Kdy se runa odštěpí:** jen podle zóny, nebo i podle vazby (spřízněné drží spolu déle)?
- **Strop:** ~25 ok; velmi pestrý člověk → strop + přebytek posílí. Portrét = mix + velikost, ne počet.
- **Vazba × reinforcement:** mohutná runa táhne/drží silněji (tuhne)? Síly = sekundární modulátor, ne hlavní struktura (tu drží umístění + posílení).

---

## 6. METODA (pravidla, ať se to nerozpadne)
- **Kopie funkčního enginu** (ritual lab), original = bezpečná reference. Přehazovat část po části.
- **Engine se NESMÍ rozbít** — měnit „kam/co" vyroste, ne „jak" se kreslí. Otestovat že engine drží PŘED „hotovo" + snapshot. (Per-čtení větve nás rozbily → tahle hierarchie je bezpečná cesta.)
- **Reinforcement od začátku** (zámek proti chaosu).
- Vizuál se po přehození bude lišit → pak ladění rozestupu + odštěpení na **pár vs hodně čteních.**

## 7. PRVNÍ PROTOTYP (krok po kroku)
1. Na kopii: seskupit runy do **elementových ramen** (≤5).
2. Vedoucí runa (nejvíc čtení) = hlavní linie ramene; ostatní runy = děti **odštěpené v místě své Norns zóny**.
3. Síla = počet čtení.
4. Vizuální test (KUKYho klíčový): **rozdělí se rameno na 2 organicky?** (silná pokračuje, slabá se oddělí) Ano → OK.
5. Teprve pak vazby (kdo s kým, kdy se oddělí) + směr ramene.

## 8. ZÁVISLOSTI
- **MAIN: segmentace** `{rune, position, text, deeper_meaning}` = palivo pro „co větev nese" + později Gathering. Bez ní strom nemluví per runa.
- Kanonická data run (element/aett/world/keywords) čte TREE jen aditivně.

---
*Stav: směr schválen (KUKY 2026-06-17). Mechaniky = otevřené, ladí se. Stavět až po doladění + na kopii.*

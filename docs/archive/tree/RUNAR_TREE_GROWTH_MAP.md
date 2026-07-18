# RÚNAR — Tree Growth Map (analýza v3.2)
# 2026-06-12 · jak přesně vznikají vazby, tvar a barva · podklad pro redesign

Tento dokument popisuje SOUČASNÝ stav (v3.2) bez příkras: kde co roste, proč to
má takový tvar, odkud barva. Cílem je najít lepší "mapu růstu" — jasná pravidla
kde má co na stromě být.

---

## 1. Datový model — tři typy uzlů

Každé čtení (`reading`) se mapuje na uzly (`node`). Tři druhy:

| kind | vzniká z | je to |
|------|----------|-------|
| `strand` | Norns founding (3×) + každé VELKÉ čtení (horseshoe/yggdrasil) | spojitá cesta kořen→kmen→HLAVNÍ VĚTEV |
| `branch` | každé čtení (single i velké) | větev v koruně z růstového bodu |
| `rootlet` | ~polovina čtení (rootEcho 0.5) | kořínek na kořenovém systému |

Klíč: velké čtení vytvoří `strand` (nový pramen = nová hlavní větev + tlustší kmen)
**i** `branch`. Single jen `branch` (+ možná `rootlet`).

`strand` počty: start 3 (Norns). +1 za každý horseshoe/yggdrasil.
Pořadí pramene `_order` → lane (pozice ve svazku) + exit (výška odpojení).

---

## 2. KDE větev roste — pickHost (vazby koruny)

Pro každý `branch` se hledá hostitel. Skóre kandidáta (strand nebo branch):

```
score  =  rnd()*0.6                         náhoda 0–0.6
        + 1.2   pokud stejná Area of Life   ← NEJSILNĚJŠÍ tah
        + 0.6   pokud stejný element
        + (1 − |hostElev − elev01|)*1.1*0.6 ← shoda osy, max +0.66
        − 0.45 * počet dětí hostitele       (_kids)   anti-přetížení
        − 0.18 * velikost podstromu         (_desc)   rozptyl
```

Filtry (tvrdé):
- hostitel musel vzniknout DŘÍV (`createdAt <=`) → stabilita, nikdy do budoucnosti
- branch hostitel: `level < maxDepth(4)`
- kapacita: strand max 5 dětí (`mainKids`), branch max 3 (`maxKids`)

**Pořadí síly vazeb: Area (1.2) > osa (0.66) > element (0.6) > náhoda (0.6) > tresty.**

### Kde na hostiteli (bod úchytu)
```
strand:  at = (tExit+0.06) .. 0.95     (nad místem, kde pramen opustí kmen)
branch:  at = 0.35 .. 0.95             (35–95 % délky rodiče)
```
`at` se losuje JEDNOU ze seedu čtení → topologicky stabilní (po +1 roce se 0/158
větví nepohnulo, ověřeno).

---

## 3. PROČ má strom tenhle tvar — diagnóza symptomů

Každý vizuální problém má konkrétní příčinu v kódu:

### A) "Bambule na klacku" (hustá koule na špičce, holý střed)
Tři mechanismy se sčítají:
1. **Host selection koncentruje.** Area(1.2)+element(0.6)+osa(0.66) táhnou čtení
   STEJNÉ povahy na STEJNÉHO hostitele. Pár oblastí dominuje → pár hostitelů
   dostane skoro vše.
2. **Úchyt biasovaný k špičkám.** at = 0.35–0.95, těžiště vysoko na rameni.
3. **Rekurze stohuje.** Dítě se napojí na 0.35–0.95 rodiče, jeho dítě zas →
   podstrom se kupí v koncové oblasti. maxKids=3, ale 3×3×3 v jednom místě = koule.

### B) Kudrlinky a smyčky (vrbovitý chaos místo ash)
1. **Krátké větve + relativně velké zakřivení.** L1≈0.105h, dál ×0.76/level.
   Na krátkém úseku arc(flowCurve 0.55)+wobble dělá ostrý ohyb.
2. **Sub-větve se vrací zpět.** fSide = −side → odbočka se stáčí proti rodiči →
   kříží přes něj = očko.
3. **tipLift 0.22** zvedá konce nahoru → další zakroucení.
4. **Překryv.** Mnoho krátkých větví v malé koncové oblasti = "ocelová vlna".

### C) Barevné chuchvalce (tangly svítí, kmen je šedý)
`ct` (color-time podél cesty) roste 0.16(kořen)→0.55(kmen)→0.85(hlavní špička)
→1.0(špička větvičky). Element tint = `ELEMENT_TINT(0.26) * ct^1.3` → element se
projeví TEMĚŘ JEN u špiček (ct→1). A špičky jsou přesně tam, kde je ten zmatek →
barva sedí na nepořádku. Hloubka pak ztmaví zadní (shade 0.55–1.0).

### D) Nerovnoměrné rozložení
Zpočátku jen ~6 pramenů jako hostitelé. Area-clustering → pár oblastí = pár
hostitelů = pár hustých uzlů + díry. Není mechanismus "vyplň korunu rovnoměrně".

### E) Kmen jako kabely
`strandGap 0.0095` drží linky viditelně oddělené, `cohesion 0.85` je slije jen
dole, `weaveAmp 0.003` je skoro nula → svislé pruhy, ne jedno tělo.

### F) Přesýpací hodiny u země
Kořeny se vějířují z úzkého uzlu (trunkX), prameny kmene se dole sbíhají k trunkX
→ nejužší místo přesně tam, kde má být strom nejsilnější.

---

## 4. TVAR jedné větve

```
úhel:      dev = (angleMin 0.35 .. angleMax 1.05)*rnd() * (1 − 0.25*elev01)
           strana: 72 % ven (po hostiteli), 28 % dovnitř
délka:     L = baseLen 0.105 * levelRatio^(level−1) 0.76 * (1±0.15) * (velké?1.4)
zakřivení: arc = mix(vlastní rune curve, host gesture, sympathy*0.6)
taper:     dle runy (RUNE_SHAPE: isa 1.25 tenká špička, uruz 0.70 silná)
sub-větve: 0–1, dle runy (algiz/ehwaz 2, isa 0), škálováno runeSignature
tipLift:   0.22 (špička se zvedá k vertikále)
```

Délka KLESÁ s úrovní (dobře), ale všechny jsou krátké a kupí se → koule.

---

## 5. BARVA — kompletně

```
Báze kůry (jasan):   dark #23211b → mid #54514a → base #878478 → bright #c2bfb2
Báze listů:          dark #142008 → mid #2c451c → base #3c5c26 → bright #5c7f3c
Elementy (tint):     fire/water/air/earth — plné palety, ale jen jako nádech

barkRgb(ct, element) = paletteRgb(TREE_BASE, ct)
                       mix→ paletteRgb(element, ct)  váhou 0.26 * ct^1.3
                       pak shade dle depth (0.55 vzadu .. 1.0 vepředu)
```

`ct` = pozice na barevné ose cesty (NE pozice na plátně). Kořen tmavý, špička
stříbrná, element nejvíc na špičce. Bloom: `colorFront` postupuje 0→1 podél cesty
(silhouette → barva nateče → full → listy).

---

## 6. ČASOVÁNÍ (bloom) — kdy se objeví

```
fáze:     silhouette(0.15) → growing(barva teče) → full → leafing(listy přibývají)
délky:    single 12h · trojice 24h · norns 48h · cross 48h · horseshoe 72h · ygg 7d
gating:   dítě čeká, až rodič dokvete (effectiveStart rekurzivně)
```

Časování NEovlivňuje TVAR ani UMÍSTĚNÍ — jen viditelnost v čase.

---

## 7. Co MAPA NEŘEŠÍ (jádro problému)

Současný systém odpovídá na "kde" pomocí **přitažlivosti k hostiteli**
(area>osa>element) + **rekurze**. To přirozeně KUPÍ. Chybí:

1. **Region koruny** — žádné "tahle oblast čtení patří do tohoto sektoru koruny".
   Sektory jsme měli v hybridu, ve v3.2 vypadly.
2. **Větvení po DÉLCE** — úchyt je 0.35–0.95 náhodně, ne "L1 nízko, L2 výš".
3. **Cíl hustoty** — nic neříká "koruna má být rovnoměrná, ne hrudkovitá".
4. **Rozhodnost tvaru** — arc+wobble+sub-back dělá kudrlinky; chybí "ash = krátký
   rovný výhon, max 1 inflexe, žádné smyčky".

---

## 8. Mapa, ke které chceme dojít (návrh os)

Oddělit tři nezávislé otázky, každou řídit jiným vstupem:

| Otázka | Má řídit | Dnes řídí |
|--------|----------|-----------|
| KTERÝ SEKTOR koruny | Area of Life (vztahy=vlevo, kariéra=vpravo…) | nepřímo přes host attract |
| JAK VYSOKO / pitch | osa urð/verðandi/skuld (intention) | elev01 (ano, ale slabě) |
| KDE NA RAMENI (po délce) | úroveň větvení (L1 nízko, L2 výš…) | náhoda 0.35–0.95 |
| TVAR výhonu | runa (curve/taper/sub) | runa (ano) + moc wobble |
| HUSTOTA / rytmus | rozpočet na region, ne na hostitele | jen maxKids |
| BARVA | element (víc po celé délce, ne jen špička) | jen špička (ct^1.3) |

**Klíčová myšlenka:** přejít od "větev si najde nejpodobnějšího hostitele a přilepí
se k jeho špičce" → k "větev patří do SEKTORU (dle area) a VÝŠKY (dle osy), a tam
se zařadí po délce ramene podle své úrovně, rovnoměrně, krátkým rozhodným výhonem".

To je rozdíl mezi přitažlivostí (kupí) a rozmístěním (rovnoměrné).

---

*Analýza pro redesign growth mapy. Generátory: build_tree_v3.py (model+render+lab).*
*Laby: v2/tree-lab-index.html (V3.2 / Hybrid / Liana v0.7).*

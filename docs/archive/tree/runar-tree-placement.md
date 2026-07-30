# RUNAR — Tree Placement Guide
# Základ pro CODE: jak se runa zapíše do Stromu Života
# Vzniklo: 2026-06-16 · Cowork (TREE session)
# Zdroj pravdy: tato session + runar-runes.js + runar-config.js
# Navazuje na: tree-of-life.md · RUNAR_DESIGN.md

---

## Filozofie

**Runa je základ každého čtení.** Bez runy není čtení. Vše ostatní (area, seeking,
intention, spread) je doplnění — dává runě kontext, ale runa přišla první.

**World property runy = přirozené místo na stromě.** Runy byly nalezeny v Yggdrasilu
(Odin visel 9 dní). Každá runa patří do svého světa — a ten svět říká kde na stromě žije.
Kontext čtení může runu přesunout. Ale základ je v mytologii.

**Strom = zrcadlo uživatele.** Člověk co čte o minulosti a vnitřním světě má jiný strom
než člověk co čte o budoucnosti a záměru. Strom to ukáže bez jediného slova.

**Strom musí vypadat jako strom.** Kořeny dole, kmen uprostřed, větve nahoru, větvičky
na koncích. Všechna placement pravidla slouží vizuálu — ne naopak.

---

## Placement systém — kde na stromě

### 1. Vertikální zóna (výška)

Priority (sestupně):

```
1. Intention      → nejsilnější override
2. Area.norns     → sekundární
3. Seeking.norns  → modulátor
4. Rune.world     → fallback (bez jakéhokoli kontextu)
```

Výsledek = vážená hodnota na škále urd(−1) … skuld(+1):

```
axis = w_intention · intention_val + w_area · area_val + w_seeking · seeking_val
```

Doporučené váhy (ladit): intention=0.5 · area=0.3 · seeking=0.2
Prázdné pole = 0 (nezapočítá se, redistribuuj váhy).

Mapování na canvas výšku:
- skuld (+0.33 až +1.0)  → horní třetina stromu (koruna)
- verðandi (−0.33 až +0.33) → střed stromu
- urd (−1.0 až −0.33)   → dolní třetina (kořenová zóna)

**Skuld větve: max opacity 0.85 permanentně** — budoucnost je vždy průhledná.

### 2. Horizontální strana (levá / pravá)

Primární driver = Area of Life:

```
VLEVO (innangard — dovnitř):
  Healing & Wellbeing · Family & Home · Inner Growth

STŘED (liminální — na hranici):
  Love & Relationships · Crossroads & Decisions

VPRAVO (útangard — ven do světa):
  Purpose & Path · Career & Creativity · Spirituality
```

Fallback bez area (z World runy):
- Hel runa  → mírně vlevo (skryté síly patří dovnitř)
- Asgard runa → mírně vpravo (vyšší řád míří ven)
- Midgard runa → střed (lidský svět je na hranici)

### 3. Micro-elevace uvnitř zóny (z elementu)

Element elev modifier = jemná korekce uvnitř zóny:

```
fire:   +0.15  → v rámci své zóny o kousek výš
air:    +0.10
water:  −0.05
earth:  −0.15
shadow: −0.25  → v rámci své zóny o kousek níž
```

Výsledek: dvě fire čtení ve verðandi nejsou přesně na stejné výšce. Přirozená variace
bez náhody.

### 4. Departure angle — šířka stromu

Šířka stromu NEPOCHÁZÍ z délky větví — pochází z úhlu odchodu větve od kmene.

```
earth:  65–80° od vertikály → skoro horizontální, masivní šířka
water:  55–70° → oblý oblouk ven pak nahoru
shadow: 55–65° → jde ven ale klesá, tip se sotva zvedne
air:    40–55° → střední, lehká expanze
fire:   20–35° → strmý, úzký, přímý
```

Sub-větve mají vlastní úhel (blíž horizontále než hlavní větev) → přidávají šířku
na druhé úrovni.

---

## Vizuální charakter — jak větev vypadá

### Element → základní vizuální parametry

```
fire:   curveMul 0.7  · taperMul 1.15 · widthMul 0.95 · elev +0.15
water:  curveMul 1.4  · taperMul 0.90 · widthMul 1.00 · elev −0.05
air:    curveMul 1.1  · taperMul 1.20 · widthMul 0.80 · elev +0.10
earth:  curveMul 0.8  · taperMul 0.70 · widthMul 1.25 · elev −0.15
shadow: curveMul 1.0  · taperMul 1.05 · widthMul 1.00 · elev −0.25
```

### Ætt → charakter růstu

```
Freya's Aett  → organický a plynný (materiální svět, lidská zkušenost)
Heimdall's Aett → těžký a hluboký, gnarled (osud, skryté, transformace)
Tyr's Aett    → řízený a záměrný (justice, vyšší principy, dokončení)
```

### Vigor → vzdálenost od kmene a tloušťka

```
vigor = 1 (první výskyt) → blízko kmene, tenká větev
vigor = 2 (druhý výskyt) → větev se přibližuje sousedce
vigor = 3+              → cluster, roste spolu
vigor = 4+              → srůst, sdílený kořen na kmeni
```

### Life Rune shoda

Když vytažená runa == Life Runa uživatele:
- Větev roste přímo z kmene (bez offsetu)
- Silnější vizuální propojení s kmenem
- Tento moment je v čtení označen (isLifeRune flag)

---

## Váha čtení — jak silný otisk

```
Spread rune count:
  single    (1 runa)  → základ 1.0
  norns     (3 runy)  → základ 1.5 celkem → 0.5 per runa
  cross     (5 run)   → základ 2.5 → 0.5 per runa
  horseshoe (7 run)   → základ 3.5 → 0.5 per runa
  yggdrasil (9 run)   → základ 5.0 → 0.55 per runa + roční váha

Každá runa v spreadu jde na vlastní místo s vahou spread_weight/rune_count.
```

Seeking jako zesilovač intenzity:
- Insight into Challenge / Reflection → záměrnější, silnější otisk
- General Guidance → lehčí

Time bonus (pauza od posledního čtení = silnější příští otisk).

Vyplněná pole formuláře → mohutnější větev.

---

## Spreads: jak každý vytvoří strom

**Single (1 runa)**
Jeden otisk na stromě. Zóna z kontextu nebo z World runy. Strana z Area nebo z World.
Nejčastější čtení → postupně vytváří charakter stromu.

**Norns (3 runy)**
Pozice DEFINUJE zónu — runa 1 vždy urd, runa 2 verðandi, runa 3 skuld.
Strana sdílená (jedna area pro celé čtení).
Zakládací Norns = 3 kořeny ve třech zónách. Každý Norns po zakládání kořeny
prodlouží a prohloubí.

**Kříž (5 run)**
Každá pozice má zónu:
  Centre/Core → verðandi · Above → skuld · Below → urd
  Behind/Past → urd · Ahead/Direction → skuld
Jedno čtení zasáhne všechny tři zóny.

**Horseshoe (7 run)**
  Past → urd · Present → verðandi · Hidden/Near future → skuld
  Challenges → verðandi · Outside forces → skuld
  Inner state → urd · Outcome → skuld
Plné pokrytí stromu v jednom čtení.

**Yggdrasil (9 run)**
Zóny definovány v configu (norns_axis per pozici):
  skuld: pozice 1–3 (Asgard, Vanaheim, Alfheim)
  verðandi: pozice 4–5 (Midgard, Jotunheim)
  urd: pozice 6–9 (Svartalfheim, Nidavellir, Niflheim, Hel)
9 otisky přes celý strom = vertikální prsten.
Kdykoliv (slunovrat = větší síla, ne brána). Největší otisk ze všech spreadů.

---

## World distribuce 25 run

**Asgard → skuld (koruna) · fallback: mírně vpravo**
Ansuz (Air) · Algiz (Air) · Sowilo (Fire) · Tiwaz (Fire)
Mannaz (Air) · Ingwaz (Water) · Othila (Earth) · Dagaz (Fire)

**Midgard → verðandi (střed) · fallback: střed**
Fehu (Fire+Earth) · Uruz (Earth) · Raidho (Air) · Kenaz (Fire)
Gebo (Water) · Wunjo (Air) · Jera (Earth) · Berkana (Water) · Ehwaz (Air)

**Hel → urd (kořeny) · fallback: mírně vlevo**
Thurisaz (Fire) · Hagalaz (Shadow) · Nauthiz (Earth) · Isa (Shadow)
Eihwaz (Earth+Shadow) · Perth (Water+Shadow) · Laguz (Water) · Blank (Water+Shadow)

Distribuce: Asgard=8 · Midgard=9 · Hel=8 → přirozená symetrie.

---

## Ætt–World korelace (klíčový nález)

```
Freya's Aett   → Midgard-dominantní (6 z 8) → střed stromu přirozeně
Heimdall's Aett → Hel-dominantní (5 z 8)    → kořeny přirozeně
Tyr's Aett     → Asgard-dominantní (5 z 8)  → koruna přirozeně
```

Ætt tak dává větvi charakter růstu (jak vypadá) a World dává přirozené místo (kde je).
Oboje spolu přirozeně sedí — Heimdall's runa je těžká (Ætt charakter) a patří do kořenů
(World) — konzistentní portrét.

---

## Reinforcement pravidla

- Stejná runa ve stejné zóně → zesiluje existující větev (vigor++)
- Stejná runa v jiné zóně → nová větev (Berkana v urd ≠ Berkana v skuld)
- Různá runa stejného elementu → různé větve (Berkana ≠ Othila i když obě Earth)

Max hlavních větví: 9 (nastavitelné). Overflow → zesiluje nejbližší existující větev.

---

## Vizuální portrait — co strom říká

Člověk co čte převážně o minulosti + vnitřním světě:
→ těžké kořeny, větve vlevo a nízko, strom jako starý dub s hloubkou.

Člověk co čte o budoucnosti + záměru:
→ plná koruna vpravo nahoře, kořeny střídmé, strom táhne ke světlu.

Člověk co střídá vše rovnoměrně:
→ vyvážený strom, roste do všech stran.

Strom je zrcadlo. Žádný popis není potřeba — tvar mluví sám.

---

## Co tento dokument NEOBSAHUJE (patří jinam)

- Vizuální engine (canvas, growBranch, prameny) → RUNAR_TREE_LAB.md (ARCHIV: docs/archive/tree/)
- Gathering / Eagle / Níðhöggr detekce → runar-patterns.md
- Bloom animace, listy, sezóna → tree-of-life.md (⏳ LATER)
- Konkrétní JS implementace → CODE session

# RÚNAR — Tree Force Model
# Jak síly mezi runami tvarují větve Stromu Života
# Vzniklo: 2026-06-16 · Cowork (TREE session)
# Navazuje na: runar-tree-placement.md (kde větev roste)
# Tento doc: JAK větev roste — deformace tendence polem sil

---

## Filozofie

Větev neroste ve svém "genetickém" směru. Roste za světlem, od stísnění,
ohýbá se pod větrem a sněhem. Finální tvar = tendence runy + prostředí stromu.

Tendence = to co runa chce (element dává základ).
Pole sil = to co ostatní runy na ni dělají.
Výsledek = organická, nikdy mrtvá čára. Isa pořád "chce" nahoru — síla ji deformuje,
nenahrazuje. Identita runy přežívá v tendenci. Krása ve deformaci.

**Jeden mechanismus = dvě věci najednou:**
Síly jsou zároveň interpretační hloubka (Berkana + Ingwaz = tah ke společnému růstu)
i vizuální pravda (větve se nakloní k sobě). Interpretace a vizuál jsou jedno.

---

## Zásadní podmínka: deterministické, ne náhodné

Variabilita MUSÍ vznikat ze stavu stromu — ne z hodu kostkou.

```
seed = hash(rune_name + reading_index + tree_state_snapshot)
```

- Stejný stav + stejné čtení → stejný tvar vždy (reprodukovatelný, "tohle je MŮJ strom")
- Jiný stav stromu (jiné runy přišly předtím) → jiné pole sil → jiný tvar
- Reload nezmění tvar — strom pamatuje

Organické ≠ náhodné. Mikro-textura kůry / drobné variace = seeded per čtení, stabilní.
Hlavní tvar větve = deterministický z pole sil.

---

## Baseline tendence (bez sil)

Každý element má výchozí tendenci — kam větev přirozeně míří bez sil:

```
fire:   strmě nahoru, rovně, ostrý tip     (departure 20–35° od vertikály)
air:    diagonálně nahoru, roztažená       (departure 40–55°)
water:  oblouk ven pak nahoru, oblá        (departure 55–70°)
earth:  skoro horizontálně, nízká          (departure 65–80°)
shadow: ven a dolů, tip se sotva zvedne    (departure 55–65°, elev dolů)
```

Tato tendence VŽDY přežívá. Síla ji deformuje, nikdy nenahradí.
Isa (shadow) vždy "chce" jít nahoru a zůstat chladná. Síla ji může ohnout dolů nebo
do strany — ale neudělá z ní fire větev.

---

## Typy sil

### 1. Přitažlivost — stejný element

Dvě větve stejného elementu se přirozeně nakloní k sobě.
Čím blíže na stromě (podobná zóna + strana), tím silnější tah.

```
Magnituda: 0.3 (střední)
Efekt: větev se ohne o X stupňů směrem k nejbližší větvi stejného elementu
Vizuál: dvě větve "rodiny" — viditelně ze stejné skupiny, bez labelu
```

### 2. Napětí — protilehlé elementy

Protilehlé elementy se odpuzují nebo jedna druhou zkroutí.

```
Fire vs Water (flood_fire):
  Magnituda: 0.5 (silná)
  Efekt: větve se odkloní od sebe; Water větev dostane extra oblouk dolů

Air vs Earth (roots_in_wind):
  Magnituda: 0.4
  Efekt: Earth větev zhoustne (drží se), Air větev jde více do šířky (uniká)
```

### 3. Harmonie — spojenci

```
Fire + Air (ember_breath):
  Magnituda: 0.25 (slabá-střední)
  Efekt: Fire větev jde o kousek výš, Air větev se natočí za ní

Water + Earth (stone_growth):
  Magnituda: 0.25
  Efekt: Water větev se ohne dolů k Earth větvi, obě zhoustnou u sdíleného místa
```

### 4. Gravitace — World resonance

Větve ze stejného Worldu mají mírnou afinitu — nejde o dramatický tah,
spíš o to že "dýchají ve stejném prostoru."

```
Asgard + Asgard: mírný tah nahoru a od středu (rozevírají korunu)
Hel + Hel: mírný tah dolů a dovnitř (hutní kořenovou zónu)
Midgard + Midgard: neutrál (centrizují, drží střed)
Asgard + Hel: napětí napříč stromem (jeden táhne nahoru, druhý dolů) → Magnituda 0.4
```

### 5. Life Rune — gravitační střed

Jakákoli větev ze stejného elementu jako Life Runa cítí tah ke kmeni.
Life Runa = základ stromu → větve "příbuzného" elementu se vrací blíž k centru.

```
Magnituda: 0.4
Efekt: větev se ohne směrem ke kmeni (ne ke konkrétní větvi, ale k ose stromu)
```

### 6. Vigor — posílení tendence

Runa co se opakuje má silnější tendenci — pole ji méně deformuje.
Starší větev (vigor 3+) je "zakořeněná" — odolává silám víc než nová větvička.

```
vigor 1: tendence váha 1.0, síly plně působí
vigor 2: tendence váha 1.3, síly mírně oslabeny
vigor 3: tendence váha 1.7, síly výrazně oslabeny
vigor 4+: tendence váha 2.0+, větev je tuhá — drží svůj tvar
```

### 7. Transformační páry — specifické síly

Když jsou ve stromě obě runy z transformačního páru, mají pojmenovanou sílu:

```
CYKLUS (Jera+Hagalaz, Dagaz+Nauthiz, Berkana+Isa):
  Větve se točí kolem společného bodu (orbita) — naklonění ke středu párového uzlu.
  Magnituda: 0.35

PRŮLOM (Thurisaz+Dagaz, Hagalaz+Sowilo, Nauthiz+Fehu):
  Jedna větev tlačí druhou — "průlomová" runa (Dagaz, Sowilo, Fehu) jde výš/ven,
  "tenzní" runa (Thurisaz, Hagalaz, Nauthiz) se ohne pod tlakem.
  Magnituda: 0.45

STÍN A SVĚTLO (Sowilo+Isa, Mannaz+Hagalaz, Tiwaz+Nauthiz):
  Větve se natočí čelem k sobě — jako dvě síly v rovnováze.
  Magnituda: 0.4
```

---

## Magnituda — řídicí knoflík

Velikost sil = parametrická páka na charakter celého stromu:

```
0.0–0.2  jemné organické zvlnění, sotva viditelné
0.3–0.4  zřetelná tendence, strom "dýchá"
0.5–0.6  dramatický tah, vztahy jsou čitelné
0.7+     silné zkroucení — používat jen pro specifické napětí (Asgard vs Hel)
```

Doporučení pro první verzi: všechny síly na dolní hranici (0.2–0.35).
Vizuál ladit po oku (§6 Desatera: vizuální test před rozhodnutím).

---

## Výpočet (pseudokód)

Pro každou novou větev B při přidání do stromu:

```
tendence_vektor = baseline_element(B.element)  // základní směr dle elementu

pro každou existující větev A ve stromě:
  sila = vypocti_silu(A, B)  // viz typy sil výše
  vzdalenost = vzdalenost_na_stromě(A, B)  // zóna + strana
  útlum = 1 / (1 + vzdalenost)  // daleké větve působí méně
  tendence_vektor += sila.vektor * sila.magnituda * útlum

// vigor: starší větve odolávají
tendence_vektor = lerp(tendence_vektor, baseline, vigor_weight(B.vigor))

// seed: stabilizuj per čtení (ne per render)
seed = hash(B.rune + B.reading_index + tree_state_hash)
mikro_variace = seeded_noise(seed) * 0.05  // max 5° odchylka textury

finalni_vektor = tendence_vektor + mikro_variace
```

---

## Vizuální efekty sil na stromě

Přitažlivost (stejný element): větve se nakloní k sobě, tips míří ke společnému bodu.
Napětí (protilehlé elementy): větve se odvracejí, jedna může dostat extra ohyb (zkroucení).
Harmonie (spojenci): větve rostou "v tandem" — paralelní oblouky, podobná výška.
Life Rune tah: větev míří ke kmeni místo do prostoru.
Transformační pár: specifický tvar vztahu (orbita, průlom, rovnováha čelem k sobě).
Vigor: starší větev drží tvar — je kotvou, ostatní se ohnou kolem ní.

---

## První implementační krok

Implementovat POUZE přitažlivost stejného elementu (typ 1).
Tato jediná síla už dodá "organické, pokaždé jiné" — protože závisí na stavu stromu.

Postup:
1. Pro novou větev: najdi nejbližší větev stejného elementu
2. Vypočítej vektor přitažlivosti (směr k ní, magnituda 0.3)
3. Přidej k baseline tendenci elementu
4. Seed z (rune + reading_index + tree_hash) → stabilní

Ověř vizuálně (§6): Dvě Water větve — nakloní se k sobě? Ano → OK. Reload → stejný tvar? Ano → OK.
Pak teprve přidat napětí, harmonii, Life Rune tah.

---

## Co tento dokument NEOBSAHUJE

- Konkrétní JS implementace → CODE session
- Placement (kde větev je) → runar-tree-placement.md
- Gathering / Eagle / Níðhöggr → runar-patterns.md
- Pojmenované rune-rune páry (za transformačními páry) → zatím chybí, budoucnost

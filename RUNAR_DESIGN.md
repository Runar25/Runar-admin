# RUNAR_DESIGN.md
# Domluvená designová rozhodnutí — neimplementováno
# Přečíst vždy když pracujeme na Tree, Spreads nebo novém generování.
# Toto je druhý soubor který Claude Code dostane spolu s CLAUDE.md.
# Claude Code zná celý Rúnar kód — tento soubor mu říká CO a PROČ, ne JAK.

---

## ⚠️ OTEVŘENÉ KONFLIKTY — vyřešit před implementací

Tyto body jsou v konfliktu se starým RUNAR_DESIGN nebo s kódem. Nezačínat implementaci dokud nejsou vyřešeny.

| # | Konflikt | Starý stav | Nový návrh | Status |
|---|---------|-----------|-----------|--------|
| 1 | **Norns — počet run** | 9 run, credits: 9 | 3 runy (Urd/Verdandi/Skuld), credits: 3 | ❓ čeká |
| 2 | **Yggdrasil** | placeholder v SPREAD_COSTS | nový 9-run spread, jen Premium, 1×/rok | ❓ čeká |
| 3 | **The Gathering** | vybírá z existujících čtení v journalu | táhne nové runy (3–5) s týdenním záměrem | ❓ čeká |

---

## Filozofie rituální kadence — základ celého systému

Každé čtení potřebuje čas na vstřebání. Strom nepotřebuje spěch.

Příliš časté čtení větších spreadů způsobí deformaci větví a kmene — strom
jednoduše nestihne zpracovat co dostal. Uživatel může táhnout kdykoliv,
ale strom z přehnaného spěchu nevyroste správně. Větev bude tenčí, kratší,
méně výživná. Uživatel to uvidí sám a pochopí.

Tím systém přirozeně vzdělává v tom jak s runami zacházet — bez zákazů,
bez technických omezení. Argument není omezení, je to filozofie systému.

Ideální kadence podle spreadu:
- Single, Trojice, Norns, The Gathering: kdykoliv — každodenní čtení, běžné větve
- Kříž (5 run): ideálně ne více než jednou týdně
- Horseshoe (7): ideálně ne více než jednou za dva týdny
- Yggdrasil (9): jednou ročně — slunovrat

Pokud uživatel tuto kadenci nedodrží — čtení proběhne, ale strom to zaznamená.
Větev která přišla příliš brzy po předchozí bude slabší.
Větev po dlouhé pauze dostane bonus — strom čekal a přijme více.

---

## Ceník

### Náklady na jedno čtení
Kurz: €1 ≈ 148 ISK. Náklady zahrnují Claude API + ElevenLabs.

| Spread | Náklady |
|--------|---------|
| Single | ~€0.18 |
| Trojice | ~€0.23 |
| Kříž | ~€0.28 |
| Horseshoe | ~€0.33 |
| Norns | ~€0.38 |
| Průměr (mix) | ~€0.21 |

### Odhad čtení za měsíc (s Tree of Life)
Tree zvyšuje přirozenou frekvenci — uživatel chce vidět strom růst.
Rituální kadence přirozeně drží heavy usera na rozumné frekvenci.

| Typ uživatele | Čtení/měsíc | Náklady |
|---------------|-------------|---------|
| Casual | 6–10 | ~€1.50 |
| Engaged | 12–18 | ~€3.00 |
| Heavy | 20–30 | ~€5.50 |

### Kreditní karty

Fyzická karta s kódem → zákazník zadá v appce → dostane kredity.
Kredity nevyprší, fungují across devices.
1 kredit = 1 single čtení. Větší spready stojí více kreditů.

| Karta | Kredity | EUR | ISK | Marže před VSK |
|-------|---------|-----|-----|----------------|
| Starter | 5 | €10 | 1.490 ISK | ~89% |
| Seeker | 10 | €18 | 2.690 ISK | ~88% |
| Wanderer | 20 | €34 | 5.050 ISK | ~88% |
| Elder | 50 | €80 | 11.900 ISK | ~87% |

Po islandském VSK (24%): reálná marže ~74–78%.

Karty jsou záměrně dražší než předplatné (€2/čtení vs ~€1/čtení u Standard).
Jsou pro příležitostné uživatele nebo jako dárek — ne pro pravidelné.

### Předplatné

| | Standard | Premium |
|--|---------|---------|
| Cena/měsíc EUR | €12 | €19 |
| Cena/měsíc ISK | ~1.780 ISK | ~2.810 ISK |
| Marže při engaged useru | ~75% | ~84% |
| Marže při heavy useru | ~54% | ~71% |

---

## Tier systém — co kdo může

### Spreads per tier

| Spread / Rituál | Runy | Visitor | Rune Seeker | Standard | Premium |
|-----------------|------|---------|-------------|---------|---------|
| Single | 1 | 1× celkem | 3/měsíc zdarma + kredity | ∞ | ∞ |
| Trojice | 3 | ❌ | kredity | ∞ | ∞ |
| Norns | 3 | ❌ | kredity | ∞ | ∞ |
| The Gathering | 3–5 | ❌ | kredity | ∞ | ∞ |
| Kříž | 5 | ❌ | ❌ | ∞ | ∞ |
| Horseshoe | 7 | ❌ | ❌ | ∞ | ∞ |
| Yggdrasil | 9 | ❌ | ❌ | ❌ | ✅ jednou ročně |

Parametry které lze měnit:
- Visitor: počet čtení zdarma (teď: 1)
- Rune Seeker: počet čtení/měsíc zdarma (teď: 3)
- Kredity za spread = počet run (Single=1, Trojice=3, Norns=3, Gathering=3–5, Kříž=5, Horseshoe=7)
- Yggdrasil: jen Premium, doporučeno max 1× ročně (slunovrat)

### Tree of Life per tier

| Feature | Visitor | Rune Seeker | Standard | Premium |
|---------|---------|-------------|---------|---------|
| Tree tab | ❌ skrytý | teaser | plný | plný + hloubka |
| Life Rune výklad | ❌ | symbol + jméno | plný výklad | hlubší výklad + etymologie + mytologická postava |
| Zakládací rituál | ❌ | 5 kreditů | zdarma | zdarma |
| Branch systém | ❌ | ❌ | ✅ | ✅ |
| Elementy | ❌ | ❌ | ✅ | ✅ |

### Rozdíl Standard vs Premium
Rozhodnuto:
- Life Rune výklad: Standard plný výklad / Premium hlubší výklad + etymologie jména + mytologická postava
- Horseshoe a Norns: Standard ✅
- Yggdrasil: jen Premium ✅

K rozhodnutí až bude čas:
- Kakao ceremonial → Premium
- Další Premium-only features

---

## Spreads — pozice a logika

### Single (1 runa)
Jedna runa, žádné pozice. Přímé čtení energie daného momentu.

### The Gathering (3–5 run) ⚠️ KONFLIKT — viz tabulka nahoře
Týdenní rituál — uživatel táhne 3–5 run v průběhu týdne nebo najednou.
Rúnar přečte výsledek jako jeden celek, jeden příběh týdne.
Není to reflexe nad minulými čteními — je to tažení run s týdenním záměrem.
Přispívá do stromu jako každé jiné čtení.
Rune Seeker: za kredity (počet kreditů = počet tažených run).
Zatím implementováno jako samostatný rituál — může být vyřazen pokud nezapadne do tree ekosystému.

### Trojice (3 runy) ✅ IMPLEMENTOVÁNO v produkci (2026-05-31)
```
[1] — [2] — [3]

1  minulost / základ
2  přítomnost / jádro
3  směr / výhled
```

### Kříž (5 run)
```
         [2]
   [4] — [1] — [5]
         [3]

1  střed      — jádro situace, co je teď
2  nad        — co vědomě vidíš / co aspiruješ
3  pod        — co je skryté / kořen / podvědomí
4  za tebou   — co přichází z minulosti
5  před tebou — kam situace směřuje
```

### Norns (3 runy) ⚠️ KONFLIKT — viz tabulka nahoře
Tři přadleny osudu — Urd (minulost), Verdandi (přítomnost), Skuld (budoucnost).
Jiný charakter než Trojice — jde o osud a to co je nevyhnutelné, ne o časovou osu.
Pozice: každá runa = jedna Norna. Navrhnout přesné pozice před implementací.

### Horseshoe (7 run)
Hlubší rituální čtení. Pozice zatím nedefinovány. Navrhnout až před implementací.

### Yggdrasil (9 run) ⚠️ KONFLIKT — viz tabulka nahoře
Největší rituál — 9 světů Yggdrasilu. Jen Premium.
Doporučeno max 1× ročně, ideálně u zimního slunovratu.
Jde do kořenů stromu, ne do větví.
Pozice: každá runa = jeden ze 9 světů. Navrhnout před implementací.

### UI — domluveno ✅
Přepínač pod "DRAW YOUR RUNE" — stejný styl jako teď v shrine V2 labu.
[ SINGLE RUNE ]  [ 3 READINGS ]  [ KŘÍŽ ]  ...

### Tier — domluveno ✅
Rune Seeker: Trojice za kredity (3 kredity). Standard+: zdarma.
Single rune zůstává jediné co jde z free_balance.

### Jak spreads ovlivňují strom
Každý spread přidá větev. Větší spread = silnější větev, více elementů.
Kadence ovlivňuje sílu větve — viz filozofie rituální kadence nahoře.
Výpočet je deterministický, bez Claude.

---

## Tree of Life — designová rozhodnutí

### Life Rune — princip
Vypočítána z data narození — fixní, nelze změnit, nelze přegenerovat.
Je CELÝ obraz člověka hned od začátku — ne semeno které teprve poroste.
Jednou vygenerována, uložena v DB, navždy stejná.
Výklad je text only — bez hlasu.

### Life Rune výklad — struktura
Má tři části. První dvě jsou pro Standard, třetí pouze pro Premium.

Statická část (vždy, bez generování):
- Header: "[Jméno], you carry [Runa] [Glyf]."
- Footer: citace o tom že runy nepředpovídají osud

Generované Claudem:
- Část 1 — datum: islandský měsíc a atmosféra doby narození
- Část 2 — runa: tvar, mytologie, dar, stín — jméno uživatele vetkáno do textu
- Část 3 — jméno: etymologie jména + mytologická postava ← pouze Premium

### Zakládací rituál — 3 sessions
Tři oddělené sessions, uživatel si volí timing mezi nimi.

- Session 1: Trojice (3 runy) → odhalí KDO JSI V JÁDRU → první kořen
- Session 2: 1 runa → odhalí KTERÝM SMĚREM SE SKLÁNÍŠ → druhý kořen
- Session 3: 1 runa → odhalí CO POHÁNÍ TVŮJ RŮST → třetí kořen

Rune Seeker: 5 kreditů celkem za celý rituál.
Standard a Premium: zdarma.
Po dokončení se kořeny uzamknou navždy — nelze je změnit.

### Branch systém — jak každá session ovlivní strom
Výpočet je deterministický, bez Claude API.

Co určuje charakter větve:
- Element runy → barva větve
- Ætt runy → výška větve na stromě
- Area of Life z formuláře → směr (levá strana = inward, pravá = outward)
- Seeking z formuláře → hloubkový multiplikátor
- Počet vyplněných polí formuláře → celková váha větve
- Čas od posledního čtení stejného spreadu → bonus nebo penalizace váhy

### 5 elementů stromu
Fire, Water, Air, Earth — dynamické, rostou kumulativně z čtení.
Life Rune — pátý element, fixní z data narození, představuje uživatele samotného.

### Jak elementy vizuálně rostou

Fire: jiskra → malý plamen → krb → oheň → sopka
Water: kapka → pramínek → potok → řeka → oceán
Air: vánek → vánek → vítr → silný vítr → polární záře
Earth: holá láva → první mech → tráva → divoké květiny → louka

### Pre-reading formulář — jak ovlivňuje strom

Čím více polí uživatel vyplní, tím více čtení krmí strom:
- 0 polí: základní příspěvek do elementů
- 1–2 pole: silnější příspěvek
- 3+ polí: maximální příspěvek

Nejhlubší kombinace — čtení jde do kořenů, ne do větví:
- Area of Life: Inner Growth nebo Healing & Wellbeing
- Seeking: Reflection nebo Insight into Challenge
- Reading for: Understanding the past

Area of Life → primární element a směr větve:

| Area of Life | Element | Strana stromu | Směr |
|---|---|---|---|
| Love & Relationships | Water/Air | pravá | outward |
| Purpose & Path | Air | střed | upward |
| Career & Creativity | Fire | střed | steeply upward |
| Healing & Wellbeing | Water/Earth | levá | inward |
| Spirituality | Air | střed | highest |
| Family & Home | Earth | levá | lower |
| Inner Growth | Water/Earth | levá | inward/root |
| Crossroads & Decisions | Fire | střed | upward |

Seeking → hloubkový multiplikátor:

| Seeking | Multiplikátor | Charakter |
|---|---|---|
| General Guidance | ×1.0 | broad, exploratory |
| Confirmation | ×1.2 | Air |
| Clarity | ×1.3 | Fire |
| Insight into Challenge | ×1.5 | Water |
| Reflection | ×1.5 | Earth |

Feeling → jaký element se aktivuje:

| Feeling | Efekt |
|---|---|
| Grounded | Earth+ — stabilní, připraven jít do hloubky |
| Unsettled | Air nebo Water — pohyb nebo hloubka |
| Hopeful | Fire — forward energy |
| Lost | Water + tma — směrem ke kořenům |

Reading for → časová osa větve:

| Reading for | Efekt |
|---|---|
| Right now | přítomnost, větve |
| Decision ahead | Air + Fire, větve vzhůru |
| Understanding past | Earth + kořeny |

### Kmen (trunk) — jak se odhalí
Rúnar ho nepojmenuje brzy — trvá to mnoho sessions.
Pokud uživatel opakovaně volí stejný Area of Life, stává se to tématem kmene.
Akumuluje se postupně jako váha — ne jako jednorázové rozhodnutí.
Kolik sessions = "opakovaně": zatím nestanoveno, otevřená otázka.
Po odhalení Rúnar tiše reflektuje co vidí — ne jako analýzu, ale jako svědectví.

### Pauza (absence) — jak ji strom zobrazí
Pauza není prázdnota — je to zima. Větev která ukazuje mezeru v čase.
Strom ji nenese jako ztrátu, ale jako čekání.

### Specifická otázka — reframing
Uživatel píše volně. Rúnar interně přeformuluje na hlubší vrstvu.
Uživatel to nikdy nevidí — jen cítí že čtení sedí přesněji než čekal.

Příklady přeformulování:
- "Co mám dělat s prací?" → Co je hranice mezi tím k čemu se cítí povolán a tím co nese jako povinnost?
- "Bude vztah fungovat?" → Co se nejvíc bojí ztratit — a mluví ten strach hlasitěji než co skutečně chce?
- "Proč dělám stále stejné chyby?" → Jaké přesvědčení o sobě samém chrání opakováním tohoto vzorce?

---

## IS generování — pravidla pro nová volání

Každé místo kde Claude generuje IS text musí mít tři vrstvy:

1. System prompt v IS charakteru — lang vždy jako parametr, nikdy z globálu
2. User prompt psaný přímo v islandštině — nikdy "Respond in Icelandic" na konci EN promptu
3. Post-processing — deterministické opravy výstupu přes applyISCorrections()

A corrections blok z getCorrPrompt() musí být vždy připojen k IS promptu.

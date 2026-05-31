# RUNAR_DESIGN.md
# Domluvená designová rozhodnutí — neimplementováno
# Přečíst vždy když pracujeme na Tree, Spreads nebo novém generování.
# Toto je druhý soubor který Claude Code dostane spolu s CLAUDE.md.
#
# Logika:
#   CLAUDE.md       — jak pracovat, kde co je v kódu, pravidla
#   RUNAR_DESIGN.md — co je domluveno designově ale ještě není v kódu
#
# Až se věc implementuje → přesune se do CLAUDE.md sekce "Hotovo" a odtud zmizí.

---

## Spreads — pozice a logika

### Kříž (5 run)
```
         [2]
   [4] — [1] — [5]
         [3]

1  střed      — jádro situace, co je teď
2  nad        — co vědomě vidíš / co aspituješ
3  pod        — co je skryté / kořen / podvědomí
4  za tebou   — co přichází z minulosti
5  před tebou — kam situace směřuje
```

### Trojice (3 runy)
```
[1] — [2] — [3]

1  minulost / základ
2  přítomnost / jádro
3  směr / výhled
```

### Spread architektura — SPREAD_CONFIG
Jeden config jako single source of truth. Přidání nového spreadu = nový řádek + nový prompt.
Vše ostatní (platba, UI, IS/EN, opravy, uložení) automaticky.
```js
const SPREAD_CONFIG = {
  single:    { rune_count: 1, positions: null,               credits: 1, tokens: 700  },
  trojice:   { rune_count: 3, positions: {en:[...], is:[...]}, credits: 3, tokens: 900  },
  cross:     { rune_count: 5, positions: {en:[...], is:[...]}, credits: 5, tokens: 1100 },
  horseshoe: { rune_count: 7, positions: {en:[...], is:[...]}, credits: 7, tokens: 1300 },
  norns:     { rune_count: 9, positions: {en:[...], is:[...]}, credits: 9, tokens: 1500 },
};
```
Jedna funkce `generateSpread(type)` pro všechny spreads.

### Otevřené otázky k spreads (zodpovědět před implementací)
- UI: výběr spreadu pod "DRAW YOUR RUNE" nebo vlastní sekce?
- Tier: Trojice patří Rune Seeker (za kredity) nebo jen Standard+?

---

## Tree of Life — designová rozhodnutí

### Life Rune — princip
- Vypočítána z DOB přes `calcLifeRune()` — fixní, nelze změnit, nelze přegenerovat
- Je CELÝ obraz člověka hned od začátku — ne semeno které poroste
- Jednou vygenerována, uložena v DB, nikdy přegenerována
- Výklad: text only, BEZ ElevenLabs

### Life Rune výklad — šablona
```
STATICKÉ (JS, bez generování):
  "[Name], you carry [Rune] [Glyph]."     ← header
  "The runes do not predict your fate..."  ← footer citace

GENEROVANÉ Claudem:
  HLUTI 1 — DAGSETNINGIN (islandský měsíc + atmosféra)
  HLUTI 2 — RUNAN (tvar, mytologie, dar, stín — jméno vetkáno)
  HLUTI 3 — NAFNIÐ (etymologie + mytologická postava) ← Premium only
```

### Zakládací rituál — 3 sessions
Tři oddělené sessions, volný timing mezi nimi:
```
Session 1: Trojice (3 runy) → KDO JSI V JÁDRU        → první kořen
Session 2: 1 runa            → KTERÝM SMĚREM SE SKLÁNÍŠ → druhý kořen
Session 3: 1 runa            → CO POHÁNÍ TVŮJ RŮST     → třetí kořen
```
- RS: 5 kreditů celkem za celý rituál
- Standard / Premium: zdarma
- Kořeny se po dokončení uzamknou — IMMUTABLE, nelze změnit

### Branch systém — jak každá session ovlivní strom
Deterministický výpočet, bez Claude:
```
Runa element    → barva větve
Ætt             → výška větve
Area of Life    → směr (L = inner/inward, R = outer/outward)
Seeking         → hloubkový multiplikátor (×1.0–×1.5)
Počet vyplněných polí formuláře → váha (0→×1.0, 1-2→×1.5, 3+→×2.0)
```

### 5 elementů stromu
- Fire / Water / Air / Earth — dynamické, rostou z čtení postupně
- Life Rune — 5. element = uživatel sám, fixní z DOB

### Elementy — jak rostou (vizuální stupně)
```
Fire:   spark → small flame → hearth → bonfire → volcano
Water:  drop → trickle → stream → river → ocean
Air:    breath → breeze → wind → strong wind → aurora
Earth:  bare lava → first moss → grass → wildflowers → full meadow
```

### Pre-reading formulář — napojení na strom

Context depth → elemental weight:
```
0 polí      → ×1.0   čtení proběhne, elementy dostanou standardní příspěvek
1–2 pole    → ×1.5   čtení má směr, elementy dostanou silnější příspěvek
3+ polí     → ×2.0   čtení jde do středu, elementy dostanou maximální příspěvek
```

Nejhlubší kombinace (feeds roots, not branches):
```
Area:    Inner Growth nebo Healing & Wellbeing
Seeking: Reflection nebo Insight into Challenge
For:     Understanding the past
→ maximum elemental weight + reading jde do kořenů, ne do větví
```

Seeking → přesné multiplikátory:
```
General Guidance       → ×1.0   broad, exploratory
Confirmation           → ×1.2   Air — person already knows, seeks echo
Clarity                → ×1.3   Fire — seeking light in confusion
Insight into Challenge → ×1.5   Water — going under the surface
Reflection             → ×1.5   Earth — slow, inward
```

Feeling → element aktivace:
```
Grounded   → Earth+     stabilní, připraven jít do hloubky
Unsettled  → Air/Water  pohyb nebo hloubka — jedno nebo druhé
Hopeful    → Fire       forward energy, něco se otevírá
Lost       → Water+tma  směrem ke kořenům, k tomu co je pod zemí
```

Reading for → time axis:
```
Right now           → přítomnost · větve
Decision ahead      → Air + Fire · pohyb, směr, odvaha · větve vzhůru
Understanding past  → Earth + kořeny · prohlubuje co už tam je
```

### Area of Life → elementy + strom
```
Love & Relationships   → Water/Air   · right side · outward
Purpose & Path         → Air         · center     · upward
Career & Creativity    → Fire        · center     · steep upward
Healing & Wellbeing    → Water/Earth · left side  · inward
Spirituality           → Air         · center     · highest
Family & Home          → Earth       · left side  · lower
Inner Growth           → Water/Earth · left side  · inward/root
Crossroads & Decisions → Fire        · center     · upward
```

### Kmen (trunk) — jak se odhalí
- Rúnar ho nepojmenuje brzy — trvá to mnoho sessions
- Mechanismus: pokud uživatel opakovaně volí stejný Area of Life → trunk theme signal
- Akumuluje se jako váha v tree_state, ne jako poznámka
- Práh: zatím nestanoven (otevřená otázka — kolik sessions = "opakovaně"?)
- Po odhalení: trunk_revealed = true, trunk_description uložen
- Rúnar neoznamuje co elementy ukazují — čte je jako kontext, jako atmosféru
  Po mnoha sessions může tiše reflektovat co vidí — ne jako analýzu, ale jako svědectví

### Specifická otázka — reframing
Uživatel píše volně. Rúnar interně přeformuluje na hlubší vrstvu. Uživatel to nikdy nevidí.

```
"What should I do about work?"
→ Co je hranice mezi tím k čemu se cítí povolán a tím co nese jako povinnost?

"Will this relationship work out?"
→ Co se nejvíc bojí ztratit — a mluví ten strach hlasitěji než co skutečně chce?

"Why do I keep making the same mistakes?"
→ Jaké přesvědčení o sobě samém chrání opakováním tohoto vzorce?
```

Přeformulování nikdy nezobrazovat. Vede čtení zevnitř.

### Pauza (absence) — jak ji strom zobrazí
- Pauza = "zimní uzel" — větev která ukazuje mezeru, ne prázdnotu
- Strom ji nenese jako ztrátu, ale jako čekání

---

## IS generování — mustr pro nová volání

Každé nové místo kde Claude generuje IS text musí mít 3 vrstvy:
```js
// 1. System prompt — lang jako parametr
var sys = buildSysPrompt(activeChar, lang);

// 2. User prompt — psán přímo v IS, ne "Respond in Icelandic"
var prompt = buildXxxPromptIS(...);
var corrBlock = getCorrPrompt(lang, corrections);
if (corrBlock) prompt = prompt + '\n' + corrBlock;

// 3. Post-processing
var text = applyISCorrections(res.text || '', lang, corrections);
```

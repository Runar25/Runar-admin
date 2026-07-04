# Snapshot: 2026-06-07 — V3 lab design: Tree Context v Rúnarově hlasu
# Stav: DESIGN ONLY — neimplementováno
# Implementace: shrine V3 lab (budoucnost, závisí na tree_state DB)

---

## Koncept: Rúnar který uživatele zná

Rúnar nikdy neřekne "Vidím že jsi táhl Hagalaz třikrát."
Ale obraz který si vybere, tón, otázka na závěr — tichounce se posunou.
Uživatel cítí že ho Rúnar zná. Nikdy neví proč.

---

## Architektura

### TREE CONTEXT blok (do system promptu, ne user promptu)
Před každým čtením sestavit z DB a injektovat do `buildSysPromptV2()`:

```javascript
const sys = getContextLine(lang) + '\n\n' + DEF_CHAR_V2_EN + lifeCtx + treeCtx;
```

Příklad `treeCtx`:
```
TREE CONTEXT — never name this directly. Let it silently shape which images
you reach for, which aspect of the rune you emphasize, and how you hold the space.

DOMINANT ELEMENT: Water — this person's tree grows mostly in water energy.
  Let water imagery surface more naturally than others.

TRUNK THEME: Healing & Wellbeing — they have returned to this area 4 times
  in 30 days. It is becoming the spine of their tree. Do not name it.
  But lean slightly deeper when this theme is present.

RUNE PATTERN: Hagalaz has appeared 3 times in 14 days — confirmation series,
  high intensity. The rune is standing in the doorway. Do not announce this.
  Let the reading carry more weight, more stillness.

ABSENCE: 47 days since last reading. This is a return after silence.
  Hold the space like a fire that kept burning. Warmer than usual.

LIFE RUNE: Berkana (ᛒ) — appeared once in a spread (not as drawn rune).
  The tree spoke of itself. Carry this awareness quietly.
```

---

## Tři úrovně vědomí

| Úroveň | Co Rúnar ví | Jak se projeví |
|---|---|---|
| **Tichá** | dominant element, trunk theme, voice scale | volba obrazů, tón, která vrstva runy vede |
| **Středně silná** | confirmation series (2-3×), transformation pair, Area repetice | větší váha, pomalejší tempo, hlubší otázka |
| **Výjimečná** | 4× stejná runa, Life Rune v spreadu, návrat po 90+ dnech, 3 kořenové runy | Rúnar promluví jinak — ne o runě, ale o vzorci |

---

## Výjimečné události (z runar-patterns.md)

```
Potvrzovací série:
  2× = "klepe na dveře" — lehčí váha
  3× = "stojí ve dveřích" — výrazná váha, pomalejší tempo
  4×+ = "je doma" — čtení o runě samotné, ne jen situaci

Transformační pár (Jera+Hagalaz, Sowilo+Isa, atd.):
  Tón se mění celkově — mluví o pohybu, ne o stavu

Těžká kombinace 3+:
  Rúnar mluví těžším, pomalejším tónem (Níðhöggr register)

Life Rune v spreadu:
  Vždy nejhlubší čtení — strom mluví o sobě samém

Stagnace 90 dní:
  Níðhöggr tón — "co odmítáš vidět?"

Návrat po pauze (47+ dní):
  Oheň který čekal — teplejší, bez soudu

3 kořenové runy v jednom čtení:
  Výjimečná událost — nejvyšší intenzita, Rúnar ví
```

---

## Implementační plán (V3 lab)

### Krok 1 — `_buildTreeContext(userId, drawnRune, lifeRune)`
Async funkce volaná v `_generateReading()` před `callProxy`.
Dotáhne historii z `readings` tabulky (dostupná TEĎ).

```javascript
const { data: history } = await sb
  .from('readings')
  .select('rune_name, area, created_at')
  .eq('user_id', currentUser.id)
  .order('created_at', { ascending: false })
  .limit(30);
```

Detekuje z dat:
- Kolikrát se táhnutá runa opakovala (confirmation series)
- Dominant area z posledních 30 čtení (trunk theme)
- Dny od posledního čtení (pauza/návrat)
- Počet výskytů life rune v historii

### Krok 2 — Inject do system promptu
```javascript
const treeCtx = await _buildTreeContext(currentUser.id, drawn, life);
const sys = getContextLine(lang) + '\n\n' + DEF_CHAR_V2_EN + lifeCtx + treeCtx;
```

### Krok 3 — Rozšířit po spuštění tree_state DB
Přidat:
- `dominant_element` (z elementů všech run v historii)
- `trunk_themes` (dlouhodobá agregace, ne jen 30 čtení)
- `pattern_cache` (předpočítané vzorce)
- `voice_scale` organická kalibrace (sleduje reakce, ne jen kliknutí)

---

## Co čeká na tree_state DB
- `dominant_element`, `trunk_themes`, `pattern_cache`, `pending_gatherings`
- Organická kalibrace voice_scale (mimo UI kliknutí)
- Branch systém — každé čtení jako větev s branch_data jsonb
- detectPatterns() — hlavní pattern detection funkce

## Co je dostupné TEĎ (bez tree_state)
- `readings` tabulka — história run, area, created_at
- `tree_state.voice_scale` — existuje, používá se pro UI
- `user_profiles.life_rune_number` — life rune

---

## Label: V3 lab (shrine)
Implementovat AFTER tree_state DB tabulky existují.
Testovat v shrine V3 labu, pak přenést do produkce.

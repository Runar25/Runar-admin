# Snapshot 2026-05-30 — Tree Tab features

## SQL migrace (spustit manuálně v Supabase)
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS dob_day   int,
  ADD COLUMN IF NOT EXISTS dob_month int,
  ADD COLUMN IF NOT EXISTS dob_year  int,
  ADD COLUMN IF NOT EXISTS tree_name text;
```

## Nové funkce v runar-app.js

### setTreeDOB()
Čte Day/Month/Year z tree-dob-d/m/y inputů.
Validuje, uloží do readerUser.d/m/y + do DB.
Volá updateTreeTab().

### saveTreeName()
Čte tree-name-inp, uloží tree_name do user_profiles.
Zobrazí "✦ SAVED" / "✦ VISTAÐ" na 2500ms.
Má plný try/catch.

### fetchUserProfile — rozšíření
Select nyní obsahuje: dob_day, dob_month, dob_year, tree_name
Po načtení: readerUser.d/m/y nastaveny z DB → Tree tab funguje bez Reading formu.

## Tree tab HTML struktura
```
apane-tree
├── tree-life-rune-section
│   ├── tree-no-dob          ← intro text (Yggdrasil) + .dob-row inputs
│   ├── tree-rs-teaser       ← RS: symbol + jméno + "Your story opens with Standard."
│   ├── tree-reveal-cta      ← Std+: REVEAL YOUR LIFE RUNE button
│   ├── tree-loading         ← loading state
│   └── tree-reading-exists  ← výklad (collapsible)
├── tree-name-section        ← "NAME YOUR TREE" input (po výkladu)
└── tree-growth-section      ← citát "The tree does not grow between visits..."
```

## Tree intro text (EN)
"In the beginning there was Yggdrasil —
the great ash whose roots reach the deepest worlds
and whose branches hold the sky together.

Your tree has the same roots.
The same structure, planted in your own soil.

The ground is here. The stillness is ready.
But your tree cannot exist without you —
and it begins where you began.

Your life rune is the oldest thing about you.
It was set the moment you drew your first breath —
a single seed, carried in silence,
your own Yggdrasil waiting to rise.

When were you born?"

## IS mustr (3 vrstvy) — pravidlo
```js
var sys = buildSysPrompt(activeChar, lang);
var prompt = buildXxxPromptIS(...);
var corrBlock = getCorrPrompt(lang, corrections);
if (corrBlock) prompt = prompt + '\n' + corrBlock;
var res = await callProxy(sys, prompt, maxTokens, useCredit);
var text = applyISCorrections(res.text || '', lang, corrections);
```

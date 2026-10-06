---
name: test-vstup-jako-v-produkci
description: Než uvěříš testu formulace přes API, vytiskni jeden hotový prompt a porovnej ho s produkcí — rozbitý argument dal falešný závěr
metadata:
  type: feedback
---

Test formulace (prompt, tip Asku) staví prompt produkční funkcí — ale **argumenty dodává test**, a ty můžou být jiné než
v produkci. Než pustíš dávku, **vytiskni jeden hotový prompt** (`DRY=1`) a projdi ho proti tomu, co posílá produkce
(`prompt_draws`, golden). Hledej `[object Object]`, `undefined`, prázdné řádky po jménu.

**Why:** 2026-10-06 test Asku k životní runě posílal do `buildAskPrompt` **objekt runy místo jména** → v promptu stálo
*„Runes drawn: [object Object]"*. Z toho vyšel závěr *„ozvěna drawn 6/12 → 0/12 po odebrání věty"*, nasadil jsem ho
(v4.98) a ohlásil ownerovi. Se vstupem jako v produkci ta věta skoro nic nedělala (15/18 → 14/18); příčina byla jinde
(slovo „drawn" na pěti místech promptu). Oprava → `RUNAR_DECISIONS.md` 2026-10-06 (8).

**How to apply:**
1. Testovací skript má **pojistku v kódu**: `if (/\[object Object\]|undefined/.test(prompt)) throw` — vzor
   `docs/eval/2026-10-06-ask-otazky/ask_slova.js`.
2. Argument předávej ve tvaru, v jakém ho posílá produkce (u Asku jméno runy přes `rnPrompt(dr)`, ne objekt).
3. Najdeš-li chybu vstupu až po nasazení, **oprav i ohlášený závěr** (datovaný záznam + README), ne jen test.
Souvisí: [[measure-dont-eyeball]], [[break-your-own-work-before-reporting]].

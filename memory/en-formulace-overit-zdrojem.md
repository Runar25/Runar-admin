---
name: en-formulace-overit-zdrojem
description: Anglickou formulaci (sloveso u runy, vazbu) nikdy neohlas jako dobrou bez ověření, jak se skutečně píše — korpus textů o runách, stejně jako u IS
metadata:
  type: feedback
---

Angličtina se ověřuje **stejně přísně jako islandština**: zdrojem, ne pocitem. Než ohlásíš anglickou větu nebo sloveso jako
dobré, zjisti, jak se to v angličtině o runách skutečně píše. **Rozptyl slov není správnost.**

**Why:** 2026-10-06 jsem po v4.99 ohlásil jako zlepšení, že sol místo *„Hagalaz names…“* píše *holds, marks, exposes,
interrupts* (nejčastější sloveso 6/24 místo 16/24). Owner: *„fehu exposes wealth? … je to správná kombinace slov pro
pojmenování runy? … něco si myslet nebo vymyslet je hodně slabý! Pokud to nevíš, tak si to zjisti!“* V korpusu 49 anglických
textů o runách měla ta slovesa **0 výskytů**; doložené jsou *is the rune of, represents, embodies, means, symbolizes,
signifies, stands for*. Oprava → `RUNAR_DECISIONS.md` 2026-10-06 (10).

**How to apply:**
1. Slovo u runy / ustálené spojení → korpus textů o runách: `docs/eval/2026-10-06-sloveso-korpus/korpus_run.js` (stáhne
   Wikipedii a weby s výklady, text mimo repo) + `docs/eval/2026-10-06-sloveso-korpus/slovesa_run.js` (co stojí za jménem runy). Obecná angličtina → Google Books
   Ngram (JSON endpoint, `books.google.com/ngrams/json`).
2. Ohlas jen to, co je doložené, s číslem a zdrojem. Nedoložené = „nevím“, ne „vypadá dobře“.
3. Owner už o tom tématu vedl rozbor s GPT (slovesa *means / represents / symbolizes / embodies / evokes…*) — je to podnět,
   ne důkaz; ověř ho stejně ([[gpt-rozbor-neni-zavazny]]).
Souvisí: [[is-vazba-check]], [[measure-dont-eyeball]], [[dont-invent-fact-critical]].

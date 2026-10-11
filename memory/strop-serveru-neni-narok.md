---
name: strop-serveru-neni-narok
description: Limit v proxy (VOICE_MONTHLY_LIMIT, MONTHLY_LIMITS…) je horní mez, ne nárok uživatele — co tier dostane, ověř průchodem appkou (co se mu nabídne), ne čtením stropu
metadata:
  type: feedback
---

Číslo stropu na serveru (např. `VOICE_MONTHLY_LIMIT = 5` v `elevenlabs-proxy`) **neříká, co uživatel dostane**. Říká jen, kde server zastaví.
Co tier opravdu má, rozhoduje to, co mu appka nabídne (kolik má čtení, kdy se tlačítko zapne) — a pravidla ownera v DECISIONS.

**Why:** 2026-10-10 jsem z `VOICE_MONTHLY_LIMIT` udělal „každý účet má až 5 hlasů měsíčně, plošně všem“ a předal to CODE-tune — ten to
věrně dal do výpisu tierů v appce, takže Rune Seeker měl slíbených 5 hlasů měsíčně. Ve skutečnosti: jedno volné čtení = jeden hlas, jednou,
další jen s kreditem. KUKY: *„takhle chyba už tu byla několikrát, takže někde je stále stará informace!“* — DECISIONS 2026-10-10 (42).

**How to apply:**
- Než napíšu „tier X dostane N …“, projdu tok: kolik čtení X má (`free_balance`, `monthly_readings`, kredity) → co z toho appka nabídne →
  teprve pak strop. Nejmenší z toho je nárok.
- `uz_vime.js` na pojem (hlas, Ask, čtení) PŘED tvrzením o nároku — pravidla ownera tam bývají.
- Předávka jiné session s tvrzením o nároku = napřed tohle ověřit; co předám, oni převezmou doslova.
- **Totéž u slibů v zásadách:** interní `RUNAR_PRIVACY.md` (plán, právní základy) ≠ veřejná stránka `v2/runar-privacy.html`. Tvrzení
  „zásady uvádějí X“ ověř na VEŘEJNÉ stránce (EN i IS). 2026-10-10 jsem napsal „zásady uvádějí analýzu kvality“ — stálo to jen
  v interním plánu; CODE-tune to chytil a doplnil na stránku (DECISIONS 2026-10-10 (45)).
- Souvisí: [[napred-dohledej-co-uz-je]], [[verify-agent-claims-about-code]], [[admin-ucty-nejsou-nalez]].

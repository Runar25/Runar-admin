# Podoby oblastí — návrh a pilot 2026-09-24

KUKY bod 5 („připrav"): slova z oblasti se opakují (Career „work" 8/8, Love „between" 8/8 — `scripts/utils/oblasti_slova.js`).
Návrh: každá oblast 3–5 **podob**, v produkci by se losovala jedna na čtení. Podoba [0] = dnešní znění.
**NENASAZENO — čeká na ownera.** Úkol a stav vlastní `RUNAR_BACKLOG.md` („Slova oblastí se opakují").

| soubor | co |
|---|---|
| `podoby_oblasti.js` | všechny podoby, EN + IS (`land` = kam obraz dosedne · `bridge` = cíl poslední věty) |
| `podoby_pilot.js` / `.json` | pilot Career & Creativity: 6 run × (dnes / podoba) × EN + IS, Opus 5, týž los v obou ramenech |

**IS ověřeno:** is-grammar-qa na plných větách promptu (E001 přepsáno: „gefa og þiggja" → „gefið og þegið",
„veitir eða þiggur" → „veitir og þeirri sem hann þiggur"); korpus: *vaxa upp úr* 1040, *í kyrrþey* 7090, *gefið og þegið* 38,
*halda hraðanum* 210, *lengi stefnt að* 249 (místo nedoloženého *halda í markmið* 0), *með augum annarra* 55.

**Výsledek pilotu (n = 6 na rameno a jazyk, 1 los na runu, čteno mnou, ne slepě):**
- IS slovo oblasti (*vinn-/verk-/smíð-*) ve čtení: dnes 5/6 → podoby 2/6.
- EN *work/making*: 6/6 → 5/6. **„work" v EN nezmizí** — model jím popisuje i dění runy („Perth is the work that goes on out
  of sight"), ne jen oblast. Hypotéza „opakuje se, protože slovo stojí v promptu dvakrát" tím pro EN **padla**: podoby b–d
  „work" v promptu nemají, a čtení ho mají stejně.
- Co se změnilo: **kam dosedne konec**. Dnes „in your work" v konci 4 z 6; s podobami 2 z 6 a konce míří jinam
  (na ty, kdo na tvé práci závisí · na nápad · na dovednost a léta cviku · na to, co se rodí).
- Druhý svět vedle obrazu (vada z 2026-08-21) jsem v žádném z 12 čtení s podobou neviděl.

**Vedlejší nález:** Opus 5 otevřel islandské čtení doslova zněním úhlu *„Líttu snöggt yfir alla myndina, láttu svo allt hverfa
nema laukinn…"* — totéž udělal Opus 4.8 (EVAL_LOG 2026-09-24). → `RUNAR_BACKLOG.md`.

# 2026-08-26 — Vegvísir: tři plné pouti + rozdělaný TEST P1 (CODE-tune)

Jen ROZDĚLANÁ PRÁCE. Měření → `RUNAR_EVAL_LOG.md` · úkoly → `RUNAR_BACKLOG.md` · rozhodnutí → `RUNAR_DECISIONS.md`.

## Uprostřed čeho jsme byli
**TEST P1 — pozitivní učení** (few-shot korpus dobrých příkladů místo dalších pravidel).
18 čtení vygenerováno (Tiwaz + Eihwaz × buňky A/B/C × 3 seedy), metrika kopírování hotová
a ověřená protipříkladem. **Slepé soudy KVALITY stopnuty ownerem** (došly tokeny).
⚠️ Produkčního promptu se to NEDOTKLO — korpus žil jen v testovacím generátoru.

## Další krok (owner: „dodělávka musí počkat, teď nedělej")
1. Pustit obě slepé dávky — skript `workflows/scripts/p1-soudy-wf_822d72b8-1f8.js` (session-scoped).
2. **Nejdřív ověřit pozitivní kontroly:** `POSKON-repro` je nastražená syntetická kopie — když ji
   soudce neoznačí, je slepý a data se zahazují. `POSKON-kvalita` je známé dobré čtení.
3. Rozklíčovat přes `~/runar-eval/p1-mapa.json`, tabulka A/B/C do EVAL_LOGu.
4. Kritérium (z backlogu): kvalita↑ v B i C ∧ copy≈A ∧ bez konvergence. Kvalita↑ jen v B = model
   si bere věty, ne způsob → NEÚSPĚCH.
5. Konvergence uvnitř buňky má n=3 — na verdikt potřebuje víc seedů.
6. Seed korpusu je zatím jen 3 příklady z Vegvísiru; produkční single/spread kandidáty
   **kurátoruje OWNER**, ne soudci (Coworkovo zpřísnění).

## Co viselo nedořešené (Vegvísir, mimo P1)
- **ÚKOL 3 pro Cowork:** momenty pro 22 krajin — bez nich mají ramena 2–8 nerostné vstupy
  (owner: „je v přírodě tolik živého"). Zapsáno v BACKLOGu.
- **Osa 4 rubriky** (nit) zostřena o povinný zpětný odkaz, ale **znovu neověřena na slepenci** —
  dokud neprojde, verdikty o niti na 8 ramenech neplatí.
- **„X is …" 8× ve stejné konstrukci** = systematická vada obou poutí; neopraveno záměrně
  (zákaz by vyrobil jinou formuli — [[oprava-promptu-odebira-vadu]]).
- **Výpadek v rameni 4** u obou poutí (n=2, může být náhoda).
- CODE-read nález k dosednutí [ecfe005] pořád nezpracovaný.

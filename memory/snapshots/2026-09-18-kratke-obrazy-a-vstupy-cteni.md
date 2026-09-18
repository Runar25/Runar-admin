---
name: 2026-09-18-kratke-obrazy-a-vstupy-cteni
description: CODE-read 2026-09-12 až 18 — co je rozdělané kolem krátkých obrazů, esenčního řádku, konců a mapy vstupů čtení; další kroky
metadata:
  type: project
---

**Historický záznam k 2026-09-18, ne popis dneška.** Nálezy a čísla vlastní `RUNAR_EVAL_LOG.md` (2026-09-12 až 16),
otevřené úkoly `RUNAR_BACKLOG.md`. Tady je jen to, co jinde nebydlí: čím jsme se zabývali a co je další krok.

**Směr ownera:** vzít produkční čtení, které se mu líbí (Raidho s mohylami, `readings e2e82087…`), a **rozbíjet ho jednou
viditelnou změnou** (3 běhy, bez čočky životní runy), aby šlo říct, co přesně tvaruje čtení — „tenhle úhel a tenhle
aspekt se k té runě nehodí". Cíl: všechny vstupy do sebe zapadají.

**Nástroje, které vznikly:** `scripts/vzory.js` (všechny citované vzory v promptech) · `scripts/puvod.js` (u každého slova,
kde v promptu stojí) · plné prompty a texty testů v `docs/eval/2026-09-12-vegvisir-texty/` a `docs/eval/2026-09-15-kratke-obrazy-esence/`.

**Pravidla testu, na kterých owner trvá:** vždy ukázat text i instrukce, které do čtení vstoupily · pisatel „nezná datum" ·
žádné velké dávky bez souhlasu (pilot 3–5) · žádné moje soudy bez kontextu — owner čte sám.

**Čeká na ownera:**
1. Na kterém modelu testovat — pisatelé jsou Claude Opus 5, produkce `claude-opus-4-8` (pravidlo 2026-09-10 „nepoužívej API pro čtení" s tím jde proti sobě). Souvisí s HANDOFF61 (moje stanovisko dáno v chatu 2026-09-16, nic z něj nespuštěno).
2. Konce čtení (backlog „KONCE ČTENÍ NIC NEŘÍKAJÍ") — proti smyslu pro uživatele stojí 4 pokyny promptu.
3. Návrh čtyř vět hlasu (EN v EVAL_LOG 2026-09-15) — test neukázal měřitelný vliv; IS až po výběru.
4. Esenční řádek — owner: aspekt nezakazovat, jen ne pořád; popsat významem, ne slovo za slovo.

**U CODE-tune:** handoff „roční období do promptu" (owner poslal 2026-09-15).

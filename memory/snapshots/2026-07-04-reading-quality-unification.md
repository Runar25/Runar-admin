# Snapshot 2026-07-04 — Reading-quality overhaul + prompt unification (den)

## SW: v120 · HEAD: 8aee052 (single unified + golden backup)

Obří den. Chronologicky:

## 1. Bug pack (z 14denního testování reporterem)
- **Lang switch v Collection** (d149a6c) — `setLang` early-return gated na `activeAppTab==='reading'`.
- **Grid zarovnání** (c0722b7) — `rnSplit()`, jméno/překlad 2 spany, CSS min-height místo aspect-ratio. Ověřeno preview (desktop 133px, mobil 96px).
- **503 + ztráta kreditu** (6a47930 + 591e4db) — claude-proxy: odečet AŽ po úspěchu + timeout/retry; frontend klidné hlášky místo „HTTP 503".

## 2. Reading-quality (audit → Fáze 1)
- Audit (4-agent workflow): ~27 instrukcí na 1 IS čtení, ~35 na placené; root causes = constraint overload + žádná IS gramatika + EN v IS promptu + prompt učí špatnou IS + 3-5 zdrojů obrazu.
- **Vypnuto/osekáno:** deeper_meaning (52133fa), Vrstvy A/B/C v proxy (f855064, `ENABLE_DYNAMIC_CONTEXT=false`).
- **Per-jazyk `grammar` field** (ed234de) na DEF_CHAR_IS/EN + buildSysPrompt wire; IS blok (2.os./shoda/kalky/pád/read-over/IS-lock), EN lehčí. Opravy rozbitých IS stringů (8d4f322).
- **Gender field** (0a0da6b + c6d4e75) — Hann/Hún/Hán (kk/kvk/hk=hvorugkyn default, moderní IS nebinární). Side panel jen IS, `_addressContext` do všech IS builderů, rule#5. DB sloupec `address_gender` (owner spustil SQL). Deploy-safe (mimo hlavní select).
- **EN-polish** (9fdfd5f) — anti-klišé + one-image v DEF_CHAR_EN.grammar. Změřeno: 13%→13% (grader moc přísný na subjektivní styl; nechat, pomohl délce).

## 3. Model — rozhodnuto DATY (viz RUNAR_DECISIONS)
- **Opus 4.8 pro produkci** (16bf06f), nasazeno + health-check OK.
- Head-to-head Opus vs Sonnet 5 (IS + EN): **remíza na kvalitě**, ale Opus drží délku líp → šetří ElevenLabs (dominantní náklad). **Jednotný Opus pro oba jazyky.** Sonnet 5 zamítnut.
- Model náklad ~1-2 % per-čtení (hlas dominuje) → cena není faktor, kvalita ano.

## 4. Eval = Workflow (NE runar-eval.yaml)
- Generuj N čtení × runy/časy → adversariální IS grader → clean-rate + chyby. Skvělé na OBJEKTIVNÍ (IS gramatika), slabé na SUBJEKTIVNÍ (EN styl).

## 5. Prompt unification (ROZPRACOVÁNO)
- **Cíl:** ~10 duplikovaných builderů (IS/EN páry) → generické + per-jazyk `RP_*` packy. Přidat jazyk = přeložit 1 pack.
- **Golden harness** = `scripts/golden/golden_dump.js` + `golden_baseline.json` (14 case: single/no-Q/corr × spready × IS/EN). Deterministický (Math.random=0.5 + in-memory localStorage). **Postup:** node golden_dump.js → unify builder → node golden_dump.js golden_after.json → diff. Musí být identické (nebo sémanticky-ekvivalentní review).
- ✅ **HOTOVO — VŠECH 5** (SW v124, HEAD 0ab0dbc): single/Norns/Kříž/Horseshoe/Yggdrasil → generické buildery + `RP_*` packy. Golden-verified: **IS byte-identický všude**; EN single/Norns byte-identické, Kříž/Horseshoe/Yggdrasil jen kosmetická normalizace runesBlock (jméno+kws na řádek s „ — "). Strom nedotčen (roste z rune-dat). **Přidání jazyka = přeložit packy.** Golden nástroje v `scripts/golden/`.

## Pravidla připomínka
§1 (JS přes Python skript), golden diff PŘED commitem spreadu, smoke.py, commit `[reading]`, push hned.

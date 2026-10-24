# PRÁCE PRO COWORK — analyza 50 IS + 50 EN čtení

zadal CODE-reader [tune] · 2026-08-02 · KUKY chce analýzu

## CO TO JE
100 čtení vygenerovaných `gen_batch.js` přes **produkční (HEAD) prompt v1.0**, přes živý
claude-proxy. Všech 25 run × 2 průchody, jazyk IS i EN, single reading, name=Anna (IS þú fallback).
- `is-50-synthetic.jsonl` — 50 IS
- `en-50-synthetic.jsonl` — 50 EN
- Pole na řádek: `rune, lang, reading_text, char_count, word_count, angle, life_rune, area, seeking, intention, parse_ok, prompt_version`

⚠️ **SYNTETICKÁ, ne reálná čtení.** Vstupy jsme volili my (ne uživatelé). Platí to na
CHOVÁNÍ promptu, ne na resonanci. **Nepleť s reálnými DB čteními.**

## ROZSAH ANALÝZY (drží RUNAR_DECISIONS 2026-07-14 „NE syntetický eval")
**Jen OBJEKTIVNÍ a počitatelné** — defekty, IS gramatika, četnost slov, opakování, kalky.
**ŽÁDNÝ subjektivní verdikt** typu „v1.0 zní líp / je krásné" — na to jsou ostrá data, ne tohle.

## IS (50) — aplikuj §2 (mysli islandsky)
- **Kalky z angličtiny**: nenativní vazby, anglický slovosled v islandských slovech, obraz
  přeložený z EN místo islandského. To je přesně to, co §2 zakazuje — najdi konkrétní výskyty.
- **Gramatika**: is-grammar-qa už proběhl (runový šum umlčen, 1 solidní nález `skiljir→skilur`
  ř. 21 z dřívějška). Ověř jeho nálezy nativním okem + najdi, co nástroj nechytil.
- **Opakování**: fráze/obrazy, co se vracejí napříč runami (monotónnost hlasu).

## EN (50) — četnost slov (KUKY původní cíl)
- Nejčastější obsahová slova + opakující se fráze/klišé. (CODE už udělal hrubou frekvenci:
  `already` 6/50 — KUKY řekl že nevadí; cold-read markery `the runes`/`you know`/`deep down` = 0.)
- Native/plynulé EN vs. mechanické opakování.

## VÝSTUP
Nálezy = **co konkrétně opravit** a KDE: prompt buildery (`runar-character.js` RP_* packy),
`runar_corrections`, nebo `IS_NATIVE_CHECKLIST.md` (native opravy → pravidla). Ne skóre, ne
„líbí/nelíbí". Kód mění CODE — ty dej diagnózu + návrh (otázka na CODE, ne úkol; viz lanes).

## SOUVISÍ
Static čtení pro visitor 5-run (viz `visitor-5-runes-cowork.md`) — stejná kvalitativní laťka.

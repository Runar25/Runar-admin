# Snapshot 2026-09-25 — CODE-read: modely (Opus 5, sol), věta za obrazem, náklady, korekce

Historický záznam ke dni — **stav vlastní `git log` a docs**, ne tenhle soubor. Session CODE-read 2026-09-22 → 2026-09-25.

## Co se udělalo (kde to bydlí)
- **Opus 5 nasazen** (CODE-tune `19d2a4c`, DECISIONS 2026-09-24 (10)+(11)). Podklady EVAL_LOG 2026-09-24 (1)–(3): slepí
  soudci 20 : 8, IS 8 : 0; ⚠️ bez `thinking: disabled` nevrátí text. Cena: týž ceník i tokenizér jako 4.8.
- **Věta za obrazem „one detail"**: várky EVAL_LOG 2026-09-23 (6)–(9), 2026-09-24 (1)–(3). S Opus 5 bez účinku →
  nenasazeno (DECISIONS 2026-09-24 (13)); jen pro sol (kroky 2+3, CODE-tune `823845e`, přepínač „Read with GPT-6 sol (test)").
- **GPT-6 sol** plán kroků 1–5 v backlogu (položka GPT-6 sol). Krok 1 = IS jméno runy bez glosy JEN v promptu
  (EVAL_LOG 2026-09-24 (4), handoff CODE-tune). Kroky 2+3 nasazené. **Čeká krok 4.**
- **Náklady:** `scripts/utils/stats.js` — přesná cena z `readings.usage` × ceník (Anthropic + OpenAI vč. zápisu do cache
  1,25×), skupiny admin/tester/uživatel, cache (podíl čtení do 5 min / 1 h, bod zvratu 21,7 % / 52,6 %).
- **Korekce IS v DB:** 9 + `barninu lagt`, `verið stað þar`; test řádek smazán ownerem; rozsah/rozdělení/zkrácení
  (DECISIONS 2026-09-23 (16), 2026-09-24 (9), (14)). Úhel [4] × zvuk: výjimka nasazena (CODE-tune `84e34aa`).
- **Smoke ㉩** (`scripts/verify_decisions_numbers.js`): duplicitní číslo v DECISIONS zablokuje commit.

## Čeká na ownera
1. **Sol krok 4:** owner pár dní čte přes přepínač sol → CODE-read vezme jeho sol čtení (`usage.model = gpt-6-sol`),
   přes `prompt_draws` postaví tytéž prompty pro Opus 5, slepí soudci + IS gramatika nástroji + cena ze `stats.js`.
2. **IS úhel [0] jako rozkaz čtenáři** (*„Líttu fyrst snöggt…"* opisuje Opus 5 i 4.8) — položka CODE-tune v backlogu;
   CODE-read nabídl: IS znění jako pokyn pisateli + ověřit nástroji + změřit opis. Owner zatím neodpověděl.
3. **Hlas:** anglický model (multilingual_v2 × flash_v2_5 × v3) — owner poslechne; backlog „HLAS (ElevenLabs)".
4. Dva jednorázové řádky korekcí (Fehu otázka, „land sem þornar") — smazat? (owner).

## Naplánováno
- **Sobota 2026-09-26 03:00** — scheduled task `runar-korektor-korpusova-brana`: korpusová brána na 20 uložených změnách
  korektoru. Data LOKÁLNĚ `C:\Users\zkuku\runar-eval\korektor\` (ownerova čtení — nikdy do repa). Zapíše EVAL_LOG 2026-09-26.

## Další krok CODE-read (bez pokynu)
- `stats.js` rozšířit o hlas z nové tabulky `voice_usage` (CODE-tune `73e92a0`, `32064a3`) a smazat větu „hlas zatím
  nejde rozdělit".

## Lekce z té session (paměť)
- `napred-dohledej-co-uz-je` — před měřením/položkou/nástrojem git log všech lane + grep docs (opakoval jsem hotové).
- `pathspec-nesmi-byt-prazdny` — commit za padlým && řetězcem vzal celý index.
- `rozkaz-a-studene-cteni-hranice` — „Look…" a fyzický důsledek dřiny nejsou porušení kánonu (owner).
- `cheapest-deciding-measurement-first` (aktualizováno 2026-09-24) — ⛔ agenti max 3–5 bez ownerova ano a odhadu tokenů;
  tahle session pouštěla workflowy po 46 agentech (ultracode) a spálila ownerův limit.

## Kde jsou data
`docs/eval/2026-09-22-modely/` — `opis/` (várky věty, IS test, oprava/korektor bez textů ownera), `opus5-vs-opus48/`,
`opus5-single-norns/`, `identita*/`, `skripty/` (build/run/analýza/soudy/workflowy). Scratchpad session je dočasný.

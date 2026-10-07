# Snapshot 2026-10-07 — CODE-tune: audit promptu (krok 1–3), záloha čtení, otázka runy z dat

Historický záznam ke dni, ne stav. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-07 (1)–(2) · měření → `RUNAR_EVAL_LOG.md` 2026-10-07 (1) ·
metoda auditu → `docs/eval/2026-10-07-audit-promptu/README.md` · otevřené → `RUNAR_BACKLOG.md`.

## Uprostřed čeho jsme
- **Audit promptu** (owner: „pusť se do auditu… náš model vytváří čtení“): krok 1–3 hotový — data od nasazení solu, ownerova hlášení
  seskupená, všechna single čtení přečtená, první mapa vad s počty. **Další krok:** přečíst Asky (131) a spready (13) stejně;
  dohledat příčinu typů 6–8 (*grey*, *roots*, *electricity* — úhel „out of sight“? obraz?); inventura pravidel jen tam, kam vedou vady.
- Data auditu mimo repo: `~/runar-eval/audit-2026-10-07/` (cteni.json, hlaseni.json). Zopakovat: `najdi_cteni.js --od 2026-09-25`.
- **Čeká na ownera** (otázky v hlášení 2026-10-07): potvrdit nebo opravit typy vad · otázka runy u otázkového konce (návrh: u konce [2]
  ji nedávat, nebo dát směr místo slov) · oblast v Asku spojit s tím, že podoba oblasti stojí ve čtení 2× · kam zálohu mimo počítač.
- **Oblast v Asku** (owner „zkus to“) NEZAČATO — audit ukázal podobu oblasti ve čtení 2× a doslova (typ 3); navrženo řešit spolu.

## Past dne
- Push zablokoval smoke ⑮: jméno docu v závorce řádku `Affected doc(s)` = slib, že se doc změní. Když se nemění, jméno tam nepiš.
- Sdílený strom: commit CODE-read 0997ead vzal i můj necommitnutý řádek v `memory/MEMORY.md` (tady neškodné).
- Kontrola, která běží jen v pracovním stromě, nevidí vady vázané na commit (⑮ porovnává commity) — smoke před commitem ≠ pre-push.

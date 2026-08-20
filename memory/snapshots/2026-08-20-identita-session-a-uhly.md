---
name: 2026-08-20-identita-session-a-uhly
description: "Kde skončila CODE-tune 20. 8. — identita session v commitu je ostrá (3/3), úhly ověřené měřením, dva handoffy zpracované."
metadata:
  node_type: memory
  type: snapshot
---

# 2026-08-20 — kde jsme skončili (session CODE-tune)

**Historický záznam ke dni.** Jen rozdělaná práce. Co má vlastníka jinde, tu schválně NENÍ:
rozhodnutí → `RUNAR_DECISIONS.md` · úkoly → `RUNAR_BACKLOG.md` · měření → `RUNAR_EVAL_LOG.md`.

## Co je od dneška OSTRÉ a příští session to zaskočí

⭐ **㉛ identita session PŘESKOČILA do blokujícího režimu.** Všechny tři lane se podepsaly
(CODE-tune · CODE-read · CODE-tree), takže od teď **generický podpis „Runar Admin" ZASTAVÍ push**.
Commituj jako:
```
git -c user.name='CODE-<lane>' commit -F <msg> -- <cesty>
```
Per-commit, ne `git config` — strom je sdílený.

⭐ **Stop-hook má třetí kontrolu:** neverzovaný soubor v `memory/`, který vznikl v TÉHLE session,
zablokuje konec tahu. Auto-paměť je zapisuje sama, takže o tom session často neví.

## Čím se pracuje (nové, ať to příští session nehledá)

- `scripts/verify_prompt_levers.js` (㉚) — dojde každá per-čtení páka na každou cestu
- `scripts/verify_commit_identity.js` (㉛) — viz výš
- `scripts/utils/gen_direct.js` — dávka přímo přes Claude API, když je proxy token po expiraci
- `scripts/utils/measure_sameness.js` — párová stejnost; vždy vypíše vlastní šumovou podlahu

## Co viselo a je pryč

Audit promptu · Rune Keeper (8 komentářů) · Thurisaz „bright" obraz · úhly 3+5.
Proč a čím → `RUNAR_DECISIONS.md` a `RUNAR_EVAL_LOG.md` 18.–20. 8.

## Zůstává otevřené

- **Stejnost NOVÝCH úhlů nikdy neměřená** (nález CODE-read). Nástroj je pojmenovaný v
  `RUNAR_EVAL_LOG.md` 2026-08-16; potřebuje ~75 párů na rameno, ne 4.
- Dvě položky v `RUNAR_BACKLOG.md` sekci B, obě čekají na ownera.

## Past, na kterou jsem dnes narazil

**`.git/index.lock` po jiné session** zablokoval commit na 20 minut. Pravidlo `CLAUDE.md`
(„nejde commitnout → NESAHAT, jen ohlásit") jsem dodržel — lock smazal až owner svým potvrzením,
že nikdo nepracuje. Stálo to dva neúspěšné pokusy, ale mazat cizí lock naslepo je horší.

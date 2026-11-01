# Návrhy ikony appky 2026-10-29 – 11-01 (archiv)

Hlášení e98e5e68 „nové logo appky — zlaté Rúnarovo R“. **Owner 2026-11-01: „žádnou. necháváme jak je. návrhy si ulož do budoucna.“**
Ikona appky zůstává dnešní (Rúnar s kamenem, `v2/icons/`). Tady leží náhledy, jak návrhy vypadaly, a čím se dají vyrobit znovu.
Rozhodnutí: `RUNAR_DECISIONS.md` 2026-11-01 (10).

| Soubor | Co je na něm | Verdikt ownera |
|---|---|---|
| `1-A-B-C-R-z-kresby-run-a-kamen.jpg` | A — R z kresby run + zlatý rámeček v tvaru ikony na telefonu · B — R v kameni + rámeček · C — R v kameni (první náhled) | k C: „bez kamene. ale můžeme udělat zlatý rámeček po okraji ikony“ |
| `2-D-D2-lucerna.jpg` | D / D2 — R v lucerně podle lucerny z moodboardu (`v2/assets/app-moodboard.png`), s rámečkem / bez | ownerův nápad; první holá lucerna „hodně špatná“, tahle → „ani jedno se mi nelíbí“ |
| `3-E-E2-L-R-ze-znacky.jpg` | E — R ze značky appky + rámeček · E2 — bez rámečku · L — R ze značky v lucerně | R podle ownerova snímku („tohle R bych chtěl“); ikona → „žádnou, necháváme jak je“ |

**Vyrobit znovu** generátorem `scripts/ikona_appky.py` — náhled vždy kamkoli mimo appku, do `v2/icons` jen po ownerově ano
(kroky nasazení stojí v hlavičce generátoru):

    python -X utf8 scripts/ikona_appky.py --cil <složka>                          E
    python -X utf8 scripts/ikona_appky.py --cil <složka> --bez-ramecku            E2
    python -X utf8 scripts/ikona_appky.py --cil <složka> --lucerna --bez-ramecku  L
    python -X utf8 scripts/ikona_appky.py --cil <složka> --lucerna --r-runa       D   (+ --bez-ramecku = D2)
    python -X utf8 scripts/ikona_appky.py --cil <složka> --r-runa                 A
    python -X utf8 scripts/ikona_appky.py --cil <složka> --kamen                  B   (+ --bez-ramecku = C)

**Co platí dál:** R ze značky (owner „tohle R bych chtěl“) bude appka kreslit touž kresbou místo písma systému (owner „předělat na kresbu“,
předáno CODE-tune — `RUNAR_BACKLOG.md`, položka „Nové logo appky“).

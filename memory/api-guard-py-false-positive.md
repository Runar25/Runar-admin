---
name: api-guard-py-false-positive
description: Hlídač API (runar-api-guard.py) zablokuje i příkaz bez API, když v něm stojí „x.py is-gpt-check.py“ — konec „.py“ bere jako interpret py
metadata:
  type: feedback
---

Hlídač `~/.claude/runar-api-guard.py` hledá v příkazu `(node|python3?|py) … <soubor>.js|py` a obsah nalezeného skriptu kontroluje na
API. „py“ nemá hranici slova, takže **„is-greynir.py is-gpt-check.py“** (dvě jména za sebou, třeba v pathspecu commitu, ve smyčce `for f in`
nebo v `printf`) čte jako „py is-gpt-check.py“ → otevře is-gpt-check.py, najde v něm API → zablokuje commit i kontrolu syntaxe.
Stalo se 3× za 2026-10-10/11 (commit, smyčka s py_compile, printf seznamu cest).

**Why:** blokace není chyba v mé práci, ale každá stojí kolo a svádí k obcházení. Hlídač je ownerův bezpečnostní hook — neměnit ho
bez jeho slova; regex by šel opravit lookbehindem `(?<![\w.-])`, ale to je jeho rozhodnutí.

**How to apply:** seznam cest k commitu zapiš nástrojem Write do souboru a dej `--pathspec-from-file`; kontrolu syntaxe Python nástrojů
dej do pomocného skriptu (seznam uvnitř). Do Bash příkazu nepiš dvě jména `.py` za sebou. Souvisí: [[bash-no-cd-prefix]],
[[heredoc-mangles-backslash-escapes]].

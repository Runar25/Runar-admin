---
name: cowork-bash-mount
description: "Cowork: flaky bash mount uřezává repo soubory (JS patch bezpečně); Cowork sync zrušen"
metadata:
  type: reference
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Cowork: flaky bash mount uřezává repo soubory — JS patch bezpečně (2026-07-09, lekce)
Bash mount v Coworku občas **uřízne repo soubor při čtení** (podstrčí kratší verzi než host). Přímý mount-read → patch → write-back pak zapíše **useknutý = poškozený** soubor. Chytlo to 2× (MEMORY.md, runar-app.js — produkční JS).
**Postup pro JS/repo patch v Coworku (povinné):**
1. Zdroj čti z **git objektu**, ne z mountu: `git show HEAD:<path> > /tmp/x` (nebo Read tool = host-direct).
2. Patchni v `/tmp` (Python, §1 — ne Edit tool, kazí apostrofy).
3. `node --check /tmp/x` (JS) — chytne truncation i syntax error.
4. Teprve validní verzi nasaď na host (`cp /tmp/x <path>`) a ověř **Read toolem** (ne bash), že je celý (končí správně).
**Nikdy** nepiš zpět z přímého mount readu. (Code = nativní repo → nepotká ho to; pravidlo je pro Cowork.)

## Cowork sync — ZRUŠENO
Nic se nikam nekopíruje; jak paměť a Cowork fungují, vlastní CLAUDE.md §17 a sekce „N paralelních session“.

---

---
name: cowork-bash-mount
description: "Cowork: flaky bash mount uřezává repo soubory (JS patch bezpečně); Cowork sync zrušen"
metadata:
  type: reference
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Cowork: flaky bash mount uřezává repo soubory — JS patch bezpečně (2026-07-09, lekce)
Bash mount v Coworku občas **uřízne repo soubor při čtení** (podstrčí kratší verzi než host). Přímý mount-read → patch → write-back pak zapíše **useknutý = poškozený** soubor. Chytlo to 2× (MEMORY.md, runar-app.js — produkční JS).
**Platí dnes jen pro čtení** (2026-11-23): Cowork do repa nepíše (CLAUDE.md §17 a „N paralelních session“), takže postup patche zanikl.
Zdroj čti z git objektu (`git show HEAD:<path>`) nebo Read toolem, ne z mountu — jinak posuzuješ useknutý soubor.

## Cowork sync — ZRUŠENO
Nic se nikam nekopíruje; jak paměť a Cowork fungují, vlastní CLAUDE.md §17 a sekce „N paralelních session“.

---

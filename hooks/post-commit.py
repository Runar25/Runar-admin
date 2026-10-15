# -*- coding: utf-8 -*-
# post-commit: uklidi po sobe MINU, kterou vyrabi pre-commit hook.
#
# PROC: pre-commit bumpne `v2/sw.js` a nastaguje ho (`git add`). Kdyz se pak commituje
# s pathspec (`git commit -- <cesty>` bez sw.js — a tak se v tomhle repu commituje vzdy,
# protoze strom sdili tri session), zustane v INDEXU jina verze nez v HEAD. Presne z tohohle
# stavu vznikl 2026-08-02 produkcni downgrade v249->v248: holy commit jine session ten stary
# blob sebral a klientum se servirovala stara cache.
#
# Uklid je bezpecny: `git restore --staged` meni JEN index, obsah souboru v pracovnim strome
# se nedotkne. Hlida to ㉞ (verify_shared_tree.js) — tenhle hook je oprava priciny, kontrola
# je pojistka pro pripad, ze hook nekdo nema nainstalovany.
import os
import subprocess

REPO = subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                      capture_output=True, text=True).stdout.strip()
if not REPO:
    raise SystemExit(0)

SW = 'v2/sw.js'
# 2026-10-15 (CODE-read, kolo 4 — souběh): i v2/runar-verze.js. Pre-commit ho od 2026-10-11 generuje a git-adduje stejně jako sw.js,
# takže po každém pathspec commitu s JS zůstal v indexu pozadu (nalezeno: index v686, HEAD i strom v688 — `MM` v git status, který
# vypadá jako cizí staged práce). Pokusem v čistém repu ověřeno: soubor, který hook přidá při pathspec commitu, hlavní index nedostane.
GENEROVANE = [SW, 'v2/runar-verze.js']


def verze(text):
    import re
    m = re.search(r'v(\d+)', text or '')
    return int(m.group(1)) if m else None


def git(args):
    r = subprocess.run(['git'] + args, cwd=REPO, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


for soubor in GENEROVANE:
    head = verze(git(['show', 'HEAD:' + soubor]))
    index = verze(git(['show', ':' + soubor]))
    if head and index and head != index:
        subprocess.run(['git', 'restore', '--staged', soubor], cwd=REPO,
                       capture_output=True, text=True)
        print('[hook] %s: index mel v%s proti HEAD v%s — index srovnan '
              '(obsah souboru nedotcen)' % (soubor, index, head))

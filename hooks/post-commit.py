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


def verze(text):
    import re
    m = re.search(r'v(\d+)', text or '')
    return int(m.group(1)) if m else None


def git(args):
    r = subprocess.run(['git'] + args, cwd=REPO, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


head = verze(git(['show', 'HEAD:' + SW]))
index = verze(git(['show', ':' + SW]))
if head and index and head != index:
    subprocess.run(['git', 'restore', '--staged', SW], cwd=REPO,
                   capture_output=True, text=True)
    print('[hook] SW: index mel v%s proti HEAD v%s — index srovnan '
          '(obsah souboru nedotcen)' % (index, head))

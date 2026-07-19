#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# hooks/install-hooks.py — nainstaluje git hooks pro tento repozitář
# Použití: python hooks/install-hooks.py
# Spustit po každém git clone nebo pokud hook přestane fungovat.

import os, sys, stat, shutil

REPO      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS_DIR = os.path.join(REPO, '.git', 'hooks')
# pre-commit = rychlé (IS lint + SW bump) · pre-push = smoke brána (~14 s)
HOOKS = ['pre-commit', 'pre-push']

if not os.path.isdir(HOOKS_DIR):
    print('ERROR: .git/hooks/ nenalezeno — jsi v kořeni repozitáře?')
    sys.exit(1)

for name in HOOKS:
    SRC  = os.path.join(REPO, 'hooks', name + '.py')
    DEST = os.path.join(HOOKS_DIR, name)   # git vyžaduje přesné jméno, bez přípony
    if not os.path.isfile(SRC):
        print(f'[install] PŘESKOČENO (chybí): hooks/{name}.py')
        continue

    if sys.platform == 'win32':
        # Git for Windows (bash) zavolá python přes PATH
        wrapper = (
            '#!/bin/sh\n'
            f'python -X utf8 "$(git rev-parse --show-toplevel)/hooks/{name}.py"\n'
        )
        with open(DEST, 'w', encoding='utf-8', newline='\n') as f:
            f.write(wrapper)
        print(f'[install] Vytvořen: {DEST}  (→ hooks/{name}.py)')
    else:
        if os.path.exists(DEST):
            os.remove(DEST)
        os.symlink(SRC, DEST)
        os.chmod(SRC, os.stat(SRC).st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
        print(f'[install] Symlink: {DEST} → {SRC}')

print('[install] Hooky nainstalovány ✅')
print('[install] pre-commit: IS lint + SW bump · pre-push: smoke musí projít')
print('[install] Obejít vědomě: git push --no-verify')

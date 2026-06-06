#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# hooks/install-hooks.py — nainstaluje git hooks pro tento repozitář
# Použití: python hooks/install-hooks.py
# Spustit po každém git clone nebo pokud hook přestane fungovat.

import os, sys, stat, shutil

REPO      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS_DIR = os.path.join(REPO, '.git', 'hooks')
SRC       = os.path.join(REPO, 'hooks', 'pre-commit.py')

if not os.path.isdir(HOOKS_DIR):
    print('ERROR: .git/hooks/ nenalezeno — jsi v kořeni repozitáře?')
    sys.exit(1)

# Cíl: .git/hooks/pre-commit (bez .py — git vyžaduje přesné jméno)
DEST = os.path.join(HOOKS_DIR, 'pre-commit')

# Na Windows: vytvoříme wrapper .bat + shell wrapper
# Na Unix: symlink nebo přímý skript s shebang

if sys.platform == 'win32':
    # Windows: vytvoř .git/hooks/pre-commit bez přípony jako shell skript
    # Git for Windows (bash) zavolá python přes PATH
    wrapper = (
        '#!/bin/sh\n'
        f'python -X utf8 "$(git rev-parse --show-toplevel)/hooks/pre-commit.py"\n'
    )
    with open(DEST, 'w', encoding='utf-8', newline='\n') as f:
        f.write(wrapper)
    print(f'[install] Vytvořen: {DEST}')
    print('[install] (shell wrapper → hooks/pre-commit.py)')
else:
    # Unix: symlink
    if os.path.exists(DEST):
        os.remove(DEST)
    os.symlink(SRC, DEST)
    os.chmod(SRC, os.stat(SRC).st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
    print(f'[install] Symlink: {DEST} → {SRC}')

print('[install] Hook nainstalován ✅')
print('[install] Test: zkus git commit se soubory JS/CSS — SW se auto-bumpe.')

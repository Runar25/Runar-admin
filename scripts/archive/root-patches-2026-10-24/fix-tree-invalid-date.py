#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-tree-invalid-date.py — oprava tree.js:166 (literal Unicode)

import os

PATH = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-tree.js'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

OLD = (
    "btn.textContent = lang === 'is' ? 'ÓGILT DAGSETNING' : 'INVALID DATE'; "
    "setTimeout(function(){ btn.textContent = lang === 'is' ? 'OPINBERA LÍFSRÚNUNA →' : 'REVEAL MY LIFE RUNE →'; }, DELAY_ERROR_RESET);"
)
NEW = (
    "btn.textContent = t('invalid_date'); "
    "setTimeout(function(){ btn.textContent = t('tree_reveal_btn') + ' →'; }, DELAY_ERROR_RESET);"
)

if OLD in content:
    content = content.replace(OLD, NEW, 1)
    print('  [OK] tree:166 — invalid_date → t()')
else:
    print('  [SKIP] pattern not found — dump surrounding:')
    for i, l in enumerate(content.split('\n')[163:168], start=164):
        print(f'  {i}: {repr(l[:120])}')

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('done')

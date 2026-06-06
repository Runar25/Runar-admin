#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-auth-syntax.py
# Fixes SyntaxError in runar-auth.js:408
# Removes dangling "lang === 'is'" without ? from setSt call

import os

PATH = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-auth.js'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

OLD = (
    "    setSt('st-redeem',\n"
    "      lang === 'is'\n"
    "        tp('redeem_ok_msg', { units: vn('unit', data.credits_added, lang), rune: runeMsg, bal: data.new_balance }),\n"
    "      'ok'\n"
    "    );"
)

NEW = (
    "    setSt('st-redeem',\n"
    "      tp('redeem_ok_msg', { units: vn('unit', data.credits_added, lang), rune: runeMsg, bal: data.new_balance }),\n"
    "      'ok'\n"
    "    );"
)

if OLD in content:
    content = content.replace(OLD, NEW)
    print('  [OK] Fixed setSt redeem syntax')
else:
    print('  [SKIP] Pattern not found — check manually')
    # Show context around line 407
    lines = content.split('\n')
    for i, l in enumerate(lines[402:415], start=403):
        print(f'  {i}: {l}')

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print('done')

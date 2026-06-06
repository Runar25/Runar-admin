#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-auth-banner-false.py
# Opravuje "FALSE"/"false" v bannerech — 10 výskytů vzoru:
#   cntEl.textContent = isIs
#     tp/t('key', ...);
# → přiřadí boolean isIs místo výsledku tp()/t()
# Fix: odstranit dangling 'isIs\n  ' prefix

import os, re

PATH = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-auth.js'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Nahraď všechny výskyty vzoru:
#   = isIs\n        tp(   nebo t(
# za:
#   = tp(           nebo t(
# Regex: zachytí celý pattern přes dvě řádky

pattern = re.compile(
    r'((?:textContent|innerHTML)\s*=\s*)isIs\s*\n(\s+)(tp|t)\(',
    re.MULTILINE
)

def replacer(m):
    return m.group(1) + m.group(3) + '('

new_content, count = pattern.subn(replacer, content)

if count > 0:
    print(f'  [OK] Opraveno {count} výskytů "= isIs\\n  tp/t(" → "= tp/t("')
else:
    print('  [SKIP] Vzor nenalezen — dump auth.js kolem banneru:')
    for i, l in enumerate(content.split('\n')[125:225], start=126):
        if 'isIs' in l or 'tp(' in l or 't(' in l:
            print(f'  {i}: {repr(l[:100])}')

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('done')

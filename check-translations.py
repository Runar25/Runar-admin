#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# check-translations.py
# Porovná EN vs IS klíče v runar-translations.js
# Použití: python -X utf8 check-translations.py
# Vrátí exit 0 = OK, exit 1 = chybí překlady

import re, sys, os

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'
PATH = os.path.join(BASE, 'runar-translations.js')

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Extrahuje klíče z bloku objektu (4-mezerový odsek)
def extract_keys(block):
    # Najdi řádky tvaru:     key_name:  'hodnota',
    # Ignoruj komentáře (//)
    keys = set()
    for line in block.split('\n'):
        stripped = line.lstrip()
        if stripped.startswith('//'):
            continue
        m = re.match(r'^\s{4}(\w+)\s*:', line)
        if m:
            keys.add(m.group(1))
    return keys

# Najdi en: { ... } blok (končí "  }," před is:)
en_m = re.search(r'\n  en:\s*\{(.*?)\n  \}', content, re.DOTALL)
is_m = re.search(r'\n  is:\s*\{(.*?)\n  \}', content, re.DOTALL)

if not en_m:
    print('ERROR: blok "en: {" nenalezen')
    sys.exit(2)
if not is_m:
    print('ERROR: blok "is: {" nenalezen')
    sys.exit(2)

en_keys = extract_keys(en_m.group(1))
is_keys = extract_keys(is_m.group(1))

missing_in_is = sorted(en_keys - is_keys)
extra_in_is   = sorted(is_keys - en_keys)

ok = True

print(f'\ncheck-translations.py — {os.path.basename(PATH)}')
print(f'  EN klíče: {len(en_keys)}')
print(f'  IS klíče: {len(is_keys)}')

if missing_in_is:
    print(f'\n❌ CHYBÍ v IS ({len(missing_in_is)} klíčů):')
    for k in missing_in_is:
        print(f'   {k}')
    ok = False

if extra_in_is:
    print(f'\n⚠️  NAVÍC v IS, není v EN ({len(extra_in_is)} klíčů):')
    for k in extra_in_is:
        print(f'   {k}')
    # Extra klíče jsou varování, ne chyba (ne exit 1)

if ok:
    print(f'\n✅ OK — všech {len(en_keys)} EN klíčů má IS překlad')
else:
    sys.exit(1)

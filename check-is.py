# check-is.py — IS text quality checker
# Spustit před každým commitem který obsahuje islandský text.
# Hlásí known-bad IS slova/fráze ve všech projektových souborech.
#
# Použití: python check-is.py
# Přidat nový pattern: do BAD_PATTERNS níže.

import os, re

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'

FILES = [
    'runar-translations.js',
    'runar-app.js',
    'runar-character.js',
    'runar-reader.html',
    'runar-shrine.html',
    'runar-help.html',
    'runar-yggdrasil.html',
    'runar-auth.js',
    'runar-reading.js',
    'runar-tree.js',
    'runar-gathering.js',
]

# (bad_pattern, correct_form, note)
BAD_PATTERNS = [
    # Confirmed corrections from runar_corrections DB + manual review
    ('rúnarnar',         'rúnirnar',          'wrong plural'),
    ('LÍFSTÍÐARRÚNAN',   'LÍFSRÚNIN',         'wrong compound'),
    ('lífstíðarrúnan',   'lífsrúnin',         'wrong compound'),
    ('aðra rúnu',        'aðra rún',          'accusative: rún not rúnu'),
    ('Veldu rúnu.',      'Veldu rún.',         'accusative: rún not rúnu'),
    ('lífsrúnu ',        'lífsrún ',          'accusative: rún not rúnu'),
    ('eina rúnu',        'eina rún',          'accusative: rún not rúnu'),
    ('þessarar rúnu',    'þessarar rúnar',    'genitive: rúnar not rúnu'),
    ('ÞAGNINNI',         'ÞÖGNINNI',          'wrong vowel mutation'),
    ('þagninni',         'þögninni',          'wrong vowel mutation'),
    ('Arctic ljósið',    'Norðurljósin',       'wrong phrase'),
    ('þrönga gljúfur',   'þröngt gljúfur',    'gender agreement'),
    ('hljómar um það',   'Talar um það',      'wrong verb'),
    ('líkaminn þreytur', 'líkaminn þreyttur', 'double consonant'),
    ('biðlar',           'biður',             'wrong verb form'),
    ('Velkomin.',        'Gaman að sjá þig',  'standalone welcome greeting (not in titles)'),
    ('fimm frjáls',      '(check context)',   'old "five free" reference'),
    ('fimm lestrar á',   '(check context)',   'old "five readings per month" reference'),
    ('þrjár ókeypis',    '(check context)',   'old "three free" reference'),
    ('Ótakmarkaðir lestrar', '(check context)', 'old "unlimited readings" reference'),
    ('mánaðar- / árslegt', '(check context)', 'old subscription text'),
]

issues = []

for fname in FILES:
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        for bad, correct, note in BAD_PATTERNS:
            if bad.lower() in line.lower():
                issues.append((fname, i, bad, correct, note, line.strip()))

if not issues:
    print('OK: No IS issues found.')
else:
    print(f'FOUND {len(issues)} IS issue(s):\n')
    for fname, lineno, bad, correct, note, line in issues:
        print(f'  {fname}:{lineno}')
        print(f'    BAD:     "{bad}"  ({note})')
        print(f'    CORRECT: "{correct}"')
        print(f'    LINE:    {line[:100]}')
        print()

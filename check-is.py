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
    'runar-config.js',
    'runar-runes.js',
    'runar-journal.js',
]

# (bad_pattern, correct_form, note)
BAD_PATTERNS = [
    # Confirmed corrections from runar_corrections DB + manual review
    ('rúnarnar',         'rúnirnar',          'wrong plural'),
    ('Þagninni',         'þögninni',          'wrong word (report 2026-07-09)'),
    ('tóm blað',         'tómt blað',         'gender: blað hk -> tómt (report 2026-07-09)'),
    ('Auða rúnan',       'Auða rúnin',        'rún definite = rúnin (fixed at source, guard)'),
    ('LÍFSTÍÐARRÚNAN',   'LÍFSRÚNIN',         'wrong compound'),
    ('lífstíðarrúnan',   'lífsrúnin',         'wrong compound'),
    ('fornars',          'fornar',             'wrong genitive ending'),
    ('náttúrulegann',   'náttúrulegan',       'wrong accusative ending'),
    ('kyrrlægar',       'kyrrlegar',          'wrong adjective form'),
    ('prédikur',        'prédíkar',           'wrong verb conjugation'),
    ('sérhær',          'sérhver',            'wrong pronoun'),
    ('þarð til',        'þarf til',           'typo: þarð → þarf'),
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
    # Sezónní obraznost — rod/shoda (2026-06-14, KUKY ověřil). Rod podstatného PRVNÍ.
    ('harður frost ',     'hart frost',         'gender: frost je hk → hart frost (mezera chrání harður frostbiti=kk)'),
    ('harður næturfrost', 'hart næturfrost',    'gender: næturfrost je hk → hart næturfrost'),
    ('grátt súld',        'grá súld',           'gender: súld je kvk → grá súld'),
    ('fyrsti harði frostið', 'fyrsta harða frostið', 'gender+veik: frost hk, ákv. greinir -ið → veik beyging'),
    # IS audit 2026-07-05 — regression guards (KUKY confirmed). rún: sg rún / pl rúnir.
    ('NAFNIÐ ÞÍT',        'NAFNIÐ ÞITT',        'typo: þít → þitt'),
    ('Voníull',           'Vongóður',           'not a word'),
    ('Podkova',           'Skeifa',             'Czech leftover for horseshoe'),
    ('skapaningur',       'sköpunarkraftur',    'not a word'),
    ('þekkningu',         'þekkingu',           'double-n typo'),
    ('berur þig',         'heldur þér uppi',    'wrong verb form berur'),
    ('lítsrúnar',         'lífsrúnar',          'typo'),
    ('Baettu vid',        'Bættu við',          'lost accents'),
    ('Thu gengur her',    'Þú gengur hér',      'ASCII-stripped Icelandic'),
    ('engin gildistími',  'enginn gildistími',  'gender: gildistími kk'),
    ('Útskyrðu',          'Útskýrðu',           'missing accent'),
    ('íslenskuari',       'íslensku ári',       'merged words'),
    ('á íslenskum',       'á íslensku',         'language name case'),
    ('Dagleg reind',      'Daglegur veruleiki', 'not a word: reind'),
    ('Andlægi',           'Andleg málefni',     'wrong word for spirituality'),
    ('væntiðst',          'bjóst við',          'malformed verb'),
    ('tveggja heimsins',  'tveggja heima',      'gen pl after tveggja'),
    ('ÓGILT DAGSETNING',  'ÓGILD DAGSETNING',   'gender: dagsetning kvk'),
    ('Dulinn list',       'Dulin list',         'gender: list kvk'),
    ('Djúpur uppspretta', 'Djúp uppspretta',    'gender: uppspretta kvk'),
    ('samfelld flæði',    'samfellt flæði',     'gender: flæði hk'),
    ('öllum spárum',      'öllum spám',         'wrong dat pl of spá'),
    ('raunar raunirnar',  'raunirnar sjálfar',  'awkward phrasing'),
    ('lífs rúnuna',       'lífsrúnuna',         'should be one compound word'),
    ('Líftré',            'Lífstré',            'wrong compound'),
    ('útbreíðslur',       'lagnir',             'misspelling/calque for spreads'),
    ('nýtt upphaf, hlúð', 'umhyggja, fæðing',   'hlúð is not a noun'),
    ('nýs upphaf og',     'nýs upphafs og',     'genitive of upphaf'),
    ('sjö rúnar',         'sjö rúnir',          'rún pl = rúnir'),
    ('fimm rúnar',        'fimm rúnir',         'rún pl = rúnir'),
    ('þrjár rúnar',       'þrjár rúnir',        'rún pl = rúnir'),
    ('níu rúnar',         'níu rúnir',          'rún pl = rúnir'),
    ('dregnar rúnar',     'dregnar rúnir',      'rún pl = rúnir'),
    ('Of an /',           'Ofan /',             'split word Ofan'),
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

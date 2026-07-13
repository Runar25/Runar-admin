# check-is.py — SOURCE-string IS linter (regression guard).
# Scans project SOURCE files for known-bad Icelandic LITERALS (typos, wrong tier copy,
# ASCII-stripped text, Czech leftovers) a human could reintroduce while editing source.
# It does NOT see model OUTPUT — reading quality is checked by is-grammar-qa.py
# (GreynirCorrect) + Sigrún (native); runtime fixes live in runar_corrections.
#
# Usage: python -X utf8 check-is.py   |   new SOURCE-typo pattern -> BAD_PATTERNS below.

import os, re, glob, sys

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'

# Auto-discover every IS-bearing source file (no hand-maintained list to drift).
_SKIP = {'runar-svgs.js'}  # pure SVG data, no IS prose
FILES = sorted(p for p in glob.glob(os.path.join(BASE, '*.js')) + glob.glob(os.path.join(BASE, '*.html'))
               if os.path.basename(p) not in _SKIP)

# (bad_pattern, correct_form, note)
BAD_PATTERNS = [
    # SOURCE-authorable typos/phrases = this checker's real job. Model-output errors
    # (prose the model invents) belong to is-grammar-qa + runar_corrections, NOT here;
    # the model-output entries below are kept only as living documentation for now.
    # Confirmed corrections from runar_corrections DB + manual review
    ('rúnarnar',         'rúnirnar',          'wrong plural'),
    ('Auða rúnan',       'Auða rúnin',        'rún definite = rúnin (fixed at source, guard)'),
    ('lífsrúnan',        'lífsrúnin',         'rún definite = rúnin, not -an (Sigrún 2026-07-13)'),
    ('LÍFSTÍÐARRÚNAN',   'LÍFSRÚNIN',         'wrong compound'),
    ('þarð til',        'þarf til',           'typo: þarð → þarf'),
    ('aðra rúnu',        'aðra rún',          'accusative: rún not rúnu'),
    ('Veldu rúnu.',      'Veldu rún.',         'accusative: rún not rúnu'),
    ('lífsrúnu ',        'lífsrún ',          'accusative: rún not rúnu'),
    ('eina rúnu',        'eina rún',          'accusative: rún not rúnu'),
    ('ÞAGNINNI',         'ÞÖGNINNI',          'wrong vowel mutation'),
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
    ('þekkningu',         'þekkingu',           'double-n typo'),
    ('lítsrúnar',         'lífsrúnar',          'typo'),
    ('Baettu vid',        'Bættu við',          'lost accents'),
    ('Thu gengur her',    'Þú gengur hér',      'ASCII-stripped Icelandic'),
    ('engin gildistími',  'enginn gildistími',  'gender: gildistími kk'),
    ('Útskyrðu',          'Útskýrðu',           'missing accent'),
    ('íslenskuari',       'íslensku ári',       'merged words'),
    ('á íslenskum',       'á íslensku',         'language name case'),
    ('Dagleg reind',      'Daglegur veruleiki', 'not a word: reind'),
    ('Andlægi',           'Andleg málefni',     'wrong word for spirituality'),
    ('ÓGILT DAGSETNING',  'ÓGILD DAGSETNING',   'gender: dagsetning kvk'),
    ('Líftré',            'Lífstré',            'wrong compound'),
    ('útbreíðslur',       'lagnir',             'misspelling/calque for spreads'),
    ('sjö rúnar',         'sjö rúnir',          'rún pl = rúnir'),
    ('fimm rúnar',        'fimm rúnir',         'rún pl = rúnir'),
    ('þrjár rúnar',       'þrjár rúnir',        'rún pl = rúnir'),
    ('níu rúnar',         'níu rúnir',          'rún pl = rúnir'),
    ('dregnar rúnar',     'dregnar rúnir',      'rún pl = rúnir'),
    ('Of an /',           'Ofan /',             'split word Ofan'),
]

# --- MODEL-OUTPUT ARCHIVE (NOT scanned) ---------------------------------
# Reading-prose grammar errors / invented words the MODEL generates — they never appear
# in a source file, so scanning source for them is dead weight. Kept as documentation;
# the live owner of this surface is is-grammar-qa.py (GreynirCorrect) + Sigrún. Not scanned.
_MODEL_OUTPUT_ARCHIVE = [
    ('Þagninni',         'þögninni',          'wrong word (report 2026-07-09)'),
    ('tóm blað',         'tómt blað',         'gender: blað hk -> tómt (report 2026-07-09)'),
    ('lífstíðarrúnan',   'lífsrúnin',         'wrong compound'),
    ('fornars',          'fornar',             'wrong genitive ending'),
    ('náttúrulegann',   'náttúrulegan',       'wrong accusative ending'),
    ('kyrrlægar',       'kyrrlegar',          'wrong adjective form'),
    ('prédikur',        'prédíkar',           'wrong verb conjugation'),
    ('sérhær',          'sérhver',            'wrong pronoun'),
    ('þessarar rúnu',    'þessarar rúnar',    'genitive: rúnar not rúnu'),
    ('þagninni',         'þögninni',          'wrong vowel mutation'),
    ('Arctic ljósið',    'Norðurljósin',       'wrong phrase'),
    ('þrönga gljúfur',   'þröngt gljúfur',    'gender agreement'),
    ('hljómar um það',   'Talar um það',      'wrong verb'),
    ('líkaminn þreytur', 'líkaminn þreyttur', 'double consonant'),
    ('biðlar',           'biður',             'wrong verb form'),
    ('skapaningur',       'sköpunarkraftur',    'not a word'),
    ('berur þig',         'heldur þér uppi',    'wrong verb form berur'),
    ('væntiðst',          'bjóst við',          'malformed verb'),
    ('tveggja heimsins',  'tveggja heima',      'gen pl after tveggja'),
    ('Dulinn list',       'Dulin list',         'gender: list kvk'),
    ('Djúpur uppspretta', 'Djúp uppspretta',    'gender: uppspretta kvk'),
    ('samfelld flæði',    'samfellt flæði',     'gender: flæði hk'),
    ('öllum spárum',      'öllum spám',         'wrong dat pl of spá'),
    ('raunar raunirnar',  'raunirnar sjálfar',  'awkward phrasing'),
    ('lífs rúnuna',       'lífsrúnuna',         'should be one compound word'),
    ('nýtt upphaf, hlúð', 'umhyggja, fæðing',   'hlúð is not a noun'),
    ('nýs upphaf og',     'nýs upphafs og',     'genitive of upphaf'),
]

issues = []

for fpath in FILES:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        for bad, correct, note in BAD_PATTERNS:
            if bad.lower() in line.lower():
                issues.append((fname, i, bad, correct, note, line.strip()))

if not issues:
    print('OK: no known-bad IS literals in source. (Model output: is-grammar-qa + Sigrún.)')
    sys.exit(0)
else:
    print(f'FOUND {len(issues)} IS issue(s):\n')
    for fname, lineno, bad, correct, note, line in issues:
        print(f'  {fname}:{lineno}')
        print(f'    BAD:     "{bad}"  ({note})')
        print(f'    CORRECT: "{correct}"')
        print(f'    LINE:    {line[:100]}')
        print()
    sys.exit(1)

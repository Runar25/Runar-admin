#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# check-docs.py — linter ŽIVÉ dokumentace. Sourozenec check-is.py, stejný model:
# jeden seznam známých mrtvých tvrzení, nová retirovaná věc = jeden řádek navíc.
#
# PROČ: 2026-07-18 našel audit 97 rozporů nad ~12 fakty, každý na 4-7 místech.
# Owner opravoval tutéž věc (Yggdrasil) POPÁTÉ — opraví se tři výskyty, čtvrtý
# přežije a příští session si ho přečte jako pravdu. Pravidlo, které musí hlídat
# člověk, dřív nebo později spadne na ownera → tady je z něj kontrola.
#
# CO TO NEUMÍ: posoudit význam prózy. Pozná řetězec, ne rozpor. „founding ritual
# free" proti kódu, který odečítá kredity, je gramaticky v pořádku a projde.
# Na sémantiku je jediná obrana zápis rozhodnutí do RUNAR_DECISIONS.md.
#
#   python -X utf8 check-docs.py

import io, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# Živé doky = ty, kterými se někdo řídí. Historii a archiv NEHLÍDÁME:
#  · RUNAR_DECISIONS.md = append-only log, MUSÍ citovat i to, co dřív platilo
#  · snapshots/ = záznam ke svému datu, tehdy to byla pravda
#  · docs/archive/ = odloženo schválně
SKIP_DIRS  = ('docs/archive', 'memory/snapshots', 'node_modules', '.git')
SKIP_FILES = ('RUNAR_DECISIONS.md', 'check-docs.py')

# (regex, proč je to špatně, slova která výskyt OMLUVÍ na témž řádku)
# `unless` je tu schválně: doc SMÍ o mrtvém pojmu mluvit jako o mrtvém
# („applyISCorrections je VYPNUTÝ"). Bez toho by kontrola trestala právě ty věty,
# které problém pojmenovávají — a autoři by se naučili je nepsat.
RULES = [
    (r'Rune Keeper',
     'retirovaný název tieru (2026-07-07). Dnes: Rune Seeker / Rune Walker / Rune Wanderer',
     ('retir', 'RETIR', 'zrušen', 'už NENÍ', 'NENÍ Keeper', 'uvolněn',
      'Rúnar the', 'Keeper = jen Rúnar', 'průvodce')),   # Rúnar SÁM Keeper je — tier ne
    (r'\brune stones?\b|\brúnastein',
     'retirovaný slovník: jednotka je „rune reading", ne „rune stone"',
     ('retir', 'RETIR', 'zrušen', 'dříve', 'poetic', 'Rúnarův hlas')),
    (r'Perthro|Othala|Berkano\b',
     'špatné jméno runy — v kódu je Perth / Othila / Berkana',
     ('ne Perthro', 'ne Othala', 'ne Berkano', '≠')),
    (r'Dec 14|14\.–28\.|14-28|14–28',
     'Yggdrasil NEMÁ bránu na datum (KUKY 2026-07-18, popáté). Slunovrat = síla, ne přístup',
     ('síla', 'sílu', 'weight', 'váha', 'váhu', 'NEMÁ', 'žádná brána', 'not a gate',
      'ne brána', 'odstraněn', 'zrušen', 'KDYKOLIV')),
    (r'1/3/5/7/9',
     'starý kreditní model (1 runa = 1 kredit). Dnes per typ čtení = SPREAD_COSTS',
     ('NEPLATÍ', 'starý', 'Dřívější', 'nepoužívá')),
    (r'applyISCorrections',
     'post-processor je VYPNUTÝ od 2026-07-10 — nesmí být popsaný jako živá vrstva',
     ('VYPNUT', 'vypnut', 'disabled', 'ŽÁDNÁ', 'není')),
    (r'_moodContext',
     'v kódu neexistuje (grep = 0). Živý je _intentionContext',
     ('neexistuje', 'smazán', 'mrtv')),
    (r'scripts/utils/(smoke|check-is|show_corrections)',
     'špatná cesta — tyhle nástroje jsou v KOŘENI repa',
     ('ne v', 'NENÍ')),
    (r'RUNAR_TREE_LAB\.md|RUNAR_DOC_SYNC\.md',
     'soubor je v docs/archive/ — jako živý doc neexistuje',
     ('archiv', 'ARCHIV', 'neexistuje', 'HISTORIE')),
    (r'\bStripe\b',
     'Stripe se nikde nepoužívá (platby = Shopify)',
     ('not Stripe', 'ne Stripe', 'is not used', 'nepoužívá')),
    (r'enforcement.{0,24}TODO|TODO.{0,24}enforcement',
     'měsíční cap běží a je vynucovaný od 2026-07-16',
     ('už NENÍ', 'běží')),
]
RULES = [(re.compile(p), why, un) for p, why, un in RULES]

def live_docs():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = os.path.relpath(dirpath, ROOT).replace('\\', '/')
        if any(rel == d or rel.startswith(d + '/') for d in SKIP_DIRS):
            dirnames[:] = []
            continue
        dirnames[:] = [d for d in dirnames if d not in ('.git', 'node_modules')]
        for fn in filenames:
            if fn.endswith('.md') and fn not in SKIP_FILES:
                yield os.path.join(dirpath, fn)

hard = []
for path in sorted(live_docs()):
    rel = os.path.relpath(path, ROOT).replace('\\', '/')
    try:
        lines = io.open(path, encoding='utf-8').read().split('\n')
    except Exception as e:
        hard.append('%s — nelze přečíst: %s' % (rel, e))
        continue
    for i, line in enumerate(lines, 1):
        if 'check-docs:ok' in line:
            continue
        for rx, why, unless in RULES:
            m = rx.search(line)
            if not m:
                continue
            if any(u in line for u in unless):
                continue
            hit = '%s:%d  „%s"\n        %s' % (rel, i, m.group(0), why)
            hard.append(hit)

print('check-docs.py — živá dokumentace')
if hard:
    print('\n  ❌ NALEZENO %d mrtvých tvrzení v živých docích:\n' % len(hard))
    for h in hard:
        print('  · %s' % h)
    print('\n  Oprav je, nebo — je-li výskyt schválně (cituješ mrtvý pojem jako mrtvý) —')
    print('  přidej na řádek značku  check-docs:ok')
    sys.exit(1)

print('  ✅ OK: žádné známé mrtvé tvrzení v živých docích.')
sys.exit(0)

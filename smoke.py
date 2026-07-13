#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# smoke.py — Rúnar Smoke Test
# Spustit před každým commitem. Trvá ~5 vteřin.
# Použití: python -X utf8 smoke.py
# Exit 0 = vše OK, Exit 1 = něco selhalo

import subprocess, sys, os, re

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'
ROOT = r'C:\Users\zkuku\Downloads\Runar-admin'

JS_FILES = [
    'runar-config.js',
    'runar-translations.js',
    'runar-character.js',
    'runar-utils.js',
    'runar-journal.js',
    'runar-tree.js',
    'runar-gathering.js',
    'runar-auth.js',
    'runar-reading.js',
    'runar-app.js',
]

# Soubory kde §10 platí — žádné hardcoded user-visible strings
LOGIC_FILES = [
    'runar-auth.js',
    'runar-reading.js',
    'runar-app.js',
    'runar-tree.js',
    'runar-gathering.js',
    'runar-journal.js',
]

fail_count = 0
ok_count   = 0

def check(label, passed, detail=''):
    global ok_count, fail_count
    marker = '✅' if passed else '❌'
    print(f'  {marker} {label}')
    if detail:
        for line in detail.strip().split('\n'):
            if line.strip():
                print(f'       {line}')
    if passed:
        ok_count += 1
    else:
        fail_count += 1

print()
print('══════════════════════════════════════════')
print('  RÚNAR SMOKE TEST')
print('══════════════════════════════════════════')

# ── 1. JS syntax ────────────────────────────────────────────
print('\n① JS SYNTAX (node --check)')
syntax_errors = []
for fname in JS_FILES:
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        syntax_errors.append(f'{fname}: soubor nenalezen')
        continue
    r = subprocess.run(['node', '--check', fpath],
                       capture_output=True, text=True)
    if r.returncode != 0:
        msg = (r.stderr or r.stdout).strip()
        # Zkrať na první řádek chyby
        first_line = msg.split('\n')[0] if msg else 'neznámá chyba'
        syntax_errors.append(f'{fname}: {first_line}')

check(
    'Syntax všech JS souborů OK' if not syntax_errors
    else f'Syntax error v {len(syntax_errors)} souboru',
    not syntax_errors,
    '\n'.join(syntax_errors)
)

# ── 2. Hardcoded strings (§10) ─────────────────────────────
print('\n② HARDCODED STRINGS (§10)')
# Hledej: 'VELKÁ SLOVA S MEZERAMI' nebo "..." v logic files
# IGNORUJ: řádky s t(, tp(, vn(, vl() | komentáře | prázdné
CAPS_PATTERN = re.compile(r"""(?<![:\w])['"]([A-Z][A-Z ]{3,}[A-Z])['"]""")
IGNORE_VALS  = {
    'STANDARD', 'PREMIUM', 'FREE TRIAL', 'RUNE SEEKER',
    'RUNE WALKER', 'RUNE KEEPER', 'THE GATHERING',
    'TROJICE', 'NORNS', 'KRIZ', 'HORSESHOE', 'YGGDRASIL',
    'RUNE CARD', 'GET A RUNE CARD',
    'VISITOR', 'GESTUR', 'VEGFARANDI',
    'EN', 'IS', 'OK', 'HTML', 'CSS', 'DB', 'URL', 'JS',
}
violations = []
for fname in LOGIC_FILES:
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Přeskoč komentáře
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        # Přeskoč řádky které volají t()/tp()/vn()/vl()
        if any(x in line for x in ["t('", 'tp(', 'vn(', 'vl(']):
            continue
        m = CAPS_PATTERN.search(line)
        if m:
            val = m.group(1)
            if val in IGNORE_VALS:
                continue
            violations.append(f'{fname}:{i}  "{val}"')

check(
    'Žádné hardcoded strings nalezeny' if not violations
    else f'{len(violations)} potenciálních §10 porušení',
    not violations,
    '\n'.join(violations[:15]) + ('\n     ... (zkráceno)' if len(violations) > 15 else '')
)

# ── 3. IS texty ─────────────────────────────────────────────
print('\n③ IS TEXTY (check-is.py)')
r = subprocess.run(
    [sys.executable, '-X', 'utf8', os.path.join(ROOT, 'check-is.py')],
    capture_output=True, text=True, encoding='utf-8'
)
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
# Zobraz první řádek (OK: ... nebo FOUND N ...)
summary = output.split('\n')[0] if output else ''
check(
    summary if passed else (summary or 'IS problémy nalezeny'),
    passed,
    '' if passed else '\n'.join(output.split('\n')[1:])
)

# ── 4. Překlady ─────────────────────────────────────────────
print('\n④ PŘEKLADY (check-translations.py)')
r = subprocess.run(
    [sys.executable, '-X', 'utf8', os.path.join(ROOT, 'check-translations.py')],
    capture_output=True, text=True, encoding='utf-8'
)
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
lines  = [l for l in output.split('\n') if l.strip()]
# Zobraz info řádky (počty)
for l in lines:
    if l.startswith('  ') or l.startswith('check-'):
        print(f'       {l.strip()}')
# Najdi poslední řádek (OK nebo chyba)
summary = lines[-1].strip() if lines else ''
check(summary if summary else ('Překlady OK' if passed else 'Chybí IS překlady'), passed)

# ── 5. SW verze ─────────────────────────────────────────────
print('\n⑤ SW VERZE')
sw_path = os.path.join(BASE, 'sw.js')
try:
    with open(sw_path, 'r', encoding='utf-8') as f:
        sw_content = f.read()
    comment_m = re.search(r'Service Worker.*?v(\d+)', sw_content)
    cache_m   = re.search(r"CACHE\s*=\s*'runar-v(\d+)'", sw_content)
    v_comment = comment_m.group(1) if comment_m else '?'
    v_cache   = cache_m.group(1)   if cache_m   else '?'
    consistent = (v_comment == v_cache)
    check(
        f'SW v{v_cache} (komentář + cache shodné)' if consistent
        else f'SW nekonzistentní: komentář=v{v_comment}, cache=v{v_cache}',
        consistent
    )
except FileNotFoundError:
    check('sw.js nenalezen', False)

# ── 6. Corrections contract (seed-and-assert, real path) ───
print('\n⑥ CORRECTIONS CONTRACT (golden_contracts.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'golden_contracts.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
check(output.split('\n')[0] if output else 'contract ran', passed,
      '' if passed else output)

# ── 7. Compose mirror (proxy composeReading == client _parseSegments) ───
print('\n⑦ COMPOSE MIRROR (verify_compose_mirror.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_compose_mirror.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
last = output.split('\n')[-1] if output else 'mirror ran'
check(last if passed else 'compose mirror MISMATCH — update proxy composeReading', passed,
      '' if passed else output)

# ── Výsledek ─────────────────────────────────────────────────
print()
print('══════════════════════════════════════════')
if fail_count == 0:
    print(f'  ✅  SMOKE TEST PROŠEL  —  {ok_count}/7 kontrol OK')
else:
    print(f'  ❌  SMOKE TEST SELHAL  —  {fail_count} problém(ů), {ok_count} OK')
print('══════════════════════════════════════════')
print()

# ── §16 DOC SYNC reminder (NEblokující — jen připomínka, neovlivňuje exit) ──
try:
    _staged = subprocess.run(['git', 'diff', '--cached', '--name-only'],
                             cwd=ROOT, capture_output=True, text=True)
    _files = [l.strip() for l in _staged.stdout.splitlines() if l.strip()]
    _js_changed  = any(f.endswith('.js') for f in _files)
    _dec_staged  = any('RUNAR_DECISIONS.md' in f for f in _files)
    if _js_changed and not _dec_staged:
        print('  ℹ  §16: staged JS beze změny RUNAR_DECISIONS.md')
        print('       Pokud se změnilo CHOVÁNÍ/rozhodnutí → přidej záznam. Refactor/CSS ignoruj.')
        print()
except Exception:
    pass  # git nedostupný / žádné staged soubory → připomínku tiše přeskoč

sys.exit(0 if fail_count == 0 else 1)

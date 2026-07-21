#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# hooks/pre-commit.py — Rúnar git pre-commit hook
#
# Auto-bumps sw.js version when JS/CSS files in v2/ are staged.
# INSTALL: python hooks/install-hooks.py
#
# Logic:
#   JS/CSS staged in v2/ AND sw.js not staged → auto-bump + stage sw.js
#   sw.js already staged (manually bumped)    → skip (developer handled it)
#   No JS/CSS staged                          → skip

import subprocess, re, os, sys

# Repo root = parent of this script's parent (hooks/)
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW_PATH = os.path.join(REPO, 'v2', 'sw.js')

def get_staged_files():
    r = subprocess.run(['git', 'diff', '--staged', '--name-only'],
                       capture_output=True, text=True, cwd=REPO)
    return [f.strip() for f in r.stdout.strip().split('\n') if f.strip()]

def get_staged_status():
    # (status, path) páry; status 'A' = nově přidaný, 'M' = změněný, atd.
    r = subprocess.run(['git', 'diff', '--staged', '--name-status'],
                       capture_output=True, text=True, cwd=REPO)
    out = []
    for line in r.stdout.strip().split('\n'):
        parts = line.split('\t')
        if len(parts) >= 2:
            out.append((parts[0].strip(), parts[-1].strip()))
    return out

staged = get_staged_files()

# ── ANTI-KOLIZE: nově PŘIDANÝ scratch/lab soubor nesmí do commitu ──────────
# Lab/snapshot/backup adresáře jsou pracovní plocha jedné session. 2026-07-19
# `git add -A v2` do jedné lane nastagoval 112 UNTRACKED souborů z nich.
# ⚠️ Klíč: hlídá se STAV, ne adresář. Blokuje se jen ADD ('A' = dosud untracked),
# NE modifikace ('M'). Dva lab dirs mají trackovaný zdroj (tree-lab-branch/runar-branch.js,
# tree-lab-trunk/runar-trunk.js), který CODE-tree legitimně edituje — ten projde,
# protože jeho změna je 'M'. Sebraný untracked scratch je vždy 'A'.
# První verze (2026-07-19) blokovala celý prefix `v2/tree-lab-` a byla by FALSE-POSITIVE
# na těch dvou trackovaných zdrojích. Odhaleno až kontrolou tracked/untracked.
# Guard je LANE-AGNOSTICKÝ (nezná prefix commitu) → chytí i dvě session v téže lane.
# NEřeší kolizi na SDÍLENÉM TRACKOVANÉM souboru (DECISIONS, runar-app.js) — tam git
# nepozná, čí řádky jsou čí; to kryje jen `git pull` + pathspec commit.
_SCRATCH = ('v2/tree-snapshots/', 'v2/sigil-lab/', 'v2/tree-lab-', '_backup/', '__pycache__/')
def _scratch_add(status, path):
    return status.startswith('A') and path.startswith(_SCRATCH)

bad = [p for (st, p) in get_staged_status() if _scratch_add(st, p)]
if bad:
    print('[hook] KOLIZE: nově přidané scratch/lab soubory — ty se NEcommitují')
    print('       (untracked pracovní plocha jedné session; nejspíš je sebral `git add -A`):')
    for f in bad[:12]:
        print('         ' + f)
    if len(bad) > 12:
        print('         … a dalších ' + str(len(bad) - 12))
    print('[hook] Odstaguj je:  git reset -- ' + ' '.join(sorted(set(
        p.split('/')[0] + ('/' + p.split('/')[1] if p.startswith('v2/') else '') for p in bad))))
    print('[hook] Vědomě přesto (skutečně nový lab zdroj): git commit --no-verify')
    sys.exit(1)

# ── IS source-linter gate (§9): block if a staged v2 source file has a bad IS literal ──
is_src = [f for f in staged if f.startswith('v2/') and f.endswith(('.js', '.html'))]
if is_src:
    _r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(REPO, 'check-is.py')], cwd=REPO)
    if _r.returncode != 0:
        print('[hook] check-is: bad IS literal in staged source -> commit blocked (fix or update BAD_PATTERNS).')
        sys.exit(1)

# Je změněno JS/CSS v v2/?
js_css = [f for f in staged
          if (f.startswith('v2/') or f == 'v2/sw.js')
          and f.endswith(('.js', '.css'))
          and 'sw.js' not in f]

if not js_css:
    sys.exit(0)  # Žádné JS/CSS změny → OK

# Je sw.js už staged?
sw_staged = any('sw.js' in f for f in staged)
if sw_staged:
    print('[hook] SW: sw.js already staged — skipping auto-bump')
    sys.exit(0)

# Přečti aktuální verzi
if not os.path.exists(SW_PATH):
    print('[hook] SW: sw.js not found — skipping bump')
    sys.exit(0)

with open(SW_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

m_comment = re.search(r'(Service Worker[^\n]*?v)(\d+)', content)
m_cache   = re.search(r"(CACHE\s*=\s*'runar-v)(\d+)(')", content)

if not m_comment or not m_cache:
    print('[hook] SW: version pattern not found in sw.js — skipping bump')
    sys.exit(0)

v     = int(m_comment.group(2))
new_v = v + 1

# Zastav pokud verze nesouhlasí (ruční změna mimo vzor)
if int(m_cache.group(2)) != v:
    print(f'[hook] SW: comment=v{v} cache=v{m_cache.group(2)} — mismatch, skipping')
    sys.exit(0)

# Bump
content = re.sub(
    r'(Service Worker[^\n]*?v)\d+',
    lambda m: m.group(1) + str(new_v),
    content, count=1
)
content = re.sub(
    r"(CACHE\s*=\s*'runar-v)\d+(')",
    lambda m: m.group(1) + str(new_v) + m.group(2),
    content, count=1
)

with open(SW_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

# Stage sw.js
subprocess.run(['git', 'add', SW_PATH], cwd=REPO)

print(f'[hook] SW: auto-bumped v{v} → v{new_v}  ({len(js_css)} JS/CSS file(s) staged)')
sys.exit(0)

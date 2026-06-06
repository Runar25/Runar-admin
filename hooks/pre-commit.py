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

staged = get_staged_files()

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

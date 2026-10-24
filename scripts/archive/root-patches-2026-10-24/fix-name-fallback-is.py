#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-name-fallback-is.py
# 1. Opravuje IS name_modal_sub — corrupt escape sekvence → literální IS text
# 2. Opravuje displayName() v app.js — email.split('@')[0] → 'you'/'þú'

import os

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'

def read_f(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write_f(p, c):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

def apply(label, path, old, new):
    c = read_f(path)
    if old in c:
        write_f(path, c.replace(old, new, 1))
        print(f'  [OK] {label}')
        return True
    print(f'  [SKIP] {label} — pattern not found')
    return False

# ── 1. translations.js — IS name_modal_sub oprava ────────────────────────────
print('\n── 1. IS name_modal_sub ─────────────────────────────────────')

TRANS = os.path.join(BASE, 'runar-translations.js')

# Corrupt verze (z escape sekvencí — RúNirnar = RúNirnar atd.)
OLD_SUB = "    name_modal_sub:   'R\\u00faNirnar tala \\u00f6\\u00f0ruv\\u00edsi til \\u00feirra sem \\u00fE\\u00e6r \\u00feEKKja a\\u00f0 nafni.<br>Hvernig \\u00e1 \\u00e9g a\\u00f0 kalla \\u00feig?',"

# Správná verze — literální IS znaky (python -X utf8)
NEW_SUB = "    name_modal_sub:   'Rúnirnar tala öðruvísi til þeirra sem þær þekkja að nafni.<br>Hvernig á ég að kalla þig?',"

apply('IS name_modal_sub → literální text', TRANS, OLD_SUB, NEW_SUB)

# ── 2. app.js — displayName() — email → you/þú ───────────────────────────────
print('\n── 2. displayName() — email fallback ────────────────────────')

APP = os.path.join(BASE, 'runar-app.js')

OLD_DN = (
    "function displayName() {\n"
    "  if (userName) return userName;\n"
    "  if (currentUser) return currentUser.email.split('@')[0];\n"
    "  return lang === 'is' ? 'Gestur' : 'Visitor';\n"
    "}"
)
NEW_DN = (
    "function displayName() {\n"
    "  if (userName) return userName;\n"
    "  if (currentUser) return lang === 'is' ? 'þú' : 'you';\n"
    "  return lang === 'is' ? 'Gestur' : 'Visitor';\n"
    "}"
)

apply("displayName() — email → 'you'/'þú'", APP, OLD_DN, NEW_DN)

print('\ndone')

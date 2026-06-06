#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-smoke-violations.py
# Opravuje 5 §10 porušení nalezených smoke testem:
#   auth.js:92   — 'SIGN IN'
#   app.js:381   — 'BEFORE THE RUNES SPEAK'
#   app.js:382   — name modal sub text
#   app.js:383   — 'Continue without a name'
#   app.js:384   — 'LET THE CAST BEGIN'
#   app.js:385   — name placeholder
#   app.js:813   — '♪ RÚNAR\'S TEACHING'
#   tree.js:166  — 'INVALID DATE'
#
# Přidává klíče do translations.js + opravuje JS soubory.
# Spustit: python -X utf8 fix-smoke-violations.py

import os

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'
ROOT = r'C:\Users\zkuku\Downloads\Runar-admin'

def read_f(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write_f(p, c):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

ok_count   = 0
skip_count = 0

def apply(label, path, old, new):
    global ok_count, skip_count
    c = read_f(path)
    if old in c:
        write_f(path, c.replace(old, new, 1))
        print(f'  [OK] {label}')
        ok_count += 1
    else:
        print(f'  [SKIP] {label} — pattern not found')
        skip_count += 1

print('\n── 1. translations.js — nové klíče ──────────────────────────')

TRANS = os.path.join(BASE, 'runar-translations.js')

# ── EN block: vložit před language_lbl ────────────────────────
EN_ANCHOR = "    language_lbl:       'LANGUAGE',"
EN_NEW = (
    "    sign_in_btn:      'SIGN IN',\n"
    "    name_modal_title: 'BEFORE THE RUNES SPEAK',\n"
    "    name_modal_sub:   'The runes speak differently to those whose name they know.<br>How shall I call you?',\n"
    "    name_modal_skip:  'Continue without a name',\n"
    "    name_modal_btn:   'LET THE CAST BEGIN',\n"
    "    name_modal_ph:    'Your name or nickname',\n"
    "    shrine_audio_lbl: \"\\u266a R\\u00daNAR'S TEACHING\",\n"
    "    invalid_date:     'INVALID DATE',\n"
)
apply('EN nové klíče', TRANS, EN_ANCHOR, EN_NEW + EN_ANCHOR)

# ── IS block: vložit před language_lbl ────────────────────────
# V souboru je language_lbl uloženo jako 'TUNGUMÁL'
IS_ANCHOR = "    language_lbl:       'TUNGUM\\u00c1L',"
IS_NEW = (
    "    sign_in_btn:      'SKR\\u00c1 INN',\n"
    "    name_modal_title: '\\u00c1\\u00d0UR EN R\\u00daNIRNAR TALA',\n"
    "    name_modal_sub:   'R\\u00faNirnar tala \\u00f6\\u00f0ruv\\u00edsi til \\u00feirra sem \\u00fE\\u00e6r \\u00feEKKja a\\u00f0 nafni.<br>Hvernig \\u00e1 \\u00e9g a\\u00f0 kalla \\u00feig?',\n"
    "    name_modal_skip:  'Halda \\u00e1fram \\u00e1n nafns',\n"
    "    name_modal_btn:   'L\\u00c1TA SP\\u00c1NA HEFJAST',\n"
    "    name_modal_ph:    'Nafn \\u00feitt e\\u00f0a g\\u00e6lunafn',\n"
    "    shrine_audio_lbl: '\\u266a R\\u00daNAR KENNIR',\n"
    "    invalid_date:     '\\u00d3GILT DAGSETNING',\n"
)
apply('IS nové klíče', TRANS, IS_ANCHOR, IS_NEW + IS_ANCHOR)

print('\n── 2. runar-auth.js ──────────────────────────────────────────')

AUTH = os.path.join(BASE, 'runar-auth.js')
apply(
    "auth:92 — 'SIGN IN' → t('sign_in_btn')",
    AUTH,
    "btn.textContent     = lang === 'is' ? 'SKRÁ INN' : 'SIGN IN';",
    "btn.textContent     = t('sign_in_btn');"
)

print('\n── 3. runar-app.js ──────────────────────────────────────────')

APP = os.path.join(BASE, 'runar-app.js')

# Name modal block (5 řádků najednou)
OLD_MODAL = (
    "  if (card) card.textContent = is ? 'ÁÐUR EN RÚNIRNAR TALA' : 'BEFORE THE RUNES SPEAK';\n"
    "  if (sub)  sub.innerHTML   = is ? 'Rúnirnar tala öðruvísi til þeirra sem þær þekkja að nafni.<br>Hvernig á ég að kalla þig?' : 'The runes speak differently to those whose name they know.<br>How shall I call you?';\n"
    "  if (skip) skip.textContent = is ? 'Halda áfram án nafns' : 'Continue without a name';\n"
    "  if (btn)  btn.textContent  = is ? 'LÁTA SPÁNA HEFJAST' : 'LET THE CAST BEGIN';\n"
    "  if (inp)  inp.placeholder  = is ? 'Nafn þitt eða gælunafn' : 'Your name or nickname';"
)
NEW_MODAL = (
    "  if (card) card.textContent = t('name_modal_title');\n"
    "  if (sub)  sub.innerHTML   = t('name_modal_sub');\n"
    "  if (skip) skip.textContent = t('name_modal_skip');\n"
    "  if (btn)  btn.textContent  = t('name_modal_btn');\n"
    "  if (inp)  inp.placeholder  = t('name_modal_ph');"
)
apply('app:381-385 — name modal → t()', APP, OLD_MODAL, NEW_MODAL)

# Shrine audio label
apply(
    "app:813 — shrine audio lbl → t('shrine_audio_lbl')",
    APP,
    "if (lblEl) lblEl.textContent = l === 'is' ? '♪ RÚNAR KENNIR' : '♪ RÚNAR\\'S TEACHING';",
    "if (lblEl) lblEl.textContent = t('shrine_audio_lbl');"
)

print('\n── 4. runar-tree.js ──────────────────────────────────────────')

TREE = os.path.join(BASE, 'runar-tree.js')
apply(
    "tree:166 — 'INVALID DATE' → t('invalid_date')",
    TREE,
    "btn.textContent = lang === 'is' ? 'ÓGILT DAGSETNING' : 'INVALID DATE'; setTimeout(function(){ btn.textContent = lang === 'is' ? 'OPINBERA LÍFSRÚNUNA \\u2192' : 'REVEAL MY LIFE RUNE \\u2192'; }, DELAY_ERROR_RESET);",
    "btn.textContent = t('invalid_date'); setTimeout(function(){ btn.textContent = t('tree_reveal_btn') + ' \\u2192'; }, DELAY_ERROR_RESET);"
)

print('\n── 5. smoke.py — přidat VISITOR do IGNORE ────────────────────')

SMOKE = os.path.join(ROOT, 'smoke.py')
apply(
    "smoke.py IGNORE_VALS + VISITOR",
    SMOKE,
    "    'RUNE CARD', 'GET A RUNE CARD',\n"
    "    'EN', 'IS', 'OK', 'HTML', 'CSS', 'DB', 'URL', 'JS',",
    "    'RUNE CARD', 'GET A RUNE CARD',\n"
    "    'VISITOR', 'GESTUR', 'VEGFARANDI',\n"
    "    'EN', 'IS', 'OK', 'HTML', 'CSS', 'DB', 'URL', 'JS',"
)

print(f'\n══ Hotovo: {ok_count} OK, {skip_count} SKIP ══')

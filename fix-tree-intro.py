#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fix-tree-intro.py
# 1. Přidá tree_intro klíč do translations.js (EN + IS)
# 2. Aktualizuje tree.js:46 — hardcoded HTML → t('tree_intro')
# 3. Opravuje tree.js:230 — email.split('@')[0] → 'you'/'þú'

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
    print(f'  [SKIP] {label}')
    return False

TRANS = os.path.join(BASE, 'runar-translations.js')
TREE  = os.path.join(BASE, 'runar-tree.js')

# ── HTML pro EN intro ──────────────────────────────────────────────────────────
EN_P = [
    '<p class="tree-intro-title">THE LIFE RUNE</p>',
    '<p>It is said that no tree reaches toward the sky without first sending its roots into the darkness below.</p>',
    '<p>So it is with us.</p>',
    '<p>Throughout life we gather experiences, memories, and stories.<br>Some become visible.<br>Others wait beneath the surface, ready to be discovered.</p>',
    '<p>The runes are not here to tell you who you are.</p>',
    '<p>They are here to help you remember.</p>',
    '<p>Your Life Rune is the first step.</p>',
    '<p>It marks the beginning of an inward journey —<br>a path where your tree grows with every insight, every question, and every step you choose to take.</p>',
    '<p>To discover your Life Rune, begin where your story began.</p>',
]
EN_HTML = ''.join(EN_P)

# ── HTML pro IS intro ──────────────────────────────────────────────────────────
IS_P = [
    '<p class="tree-intro-title">LÍFSRÚNIN</p>',
    '<p>Sagt er að ekkert tré rísi til himins án þess að fyrst teygja rætur sínar niður í myrkrið.</p>',
    '<p>Þannig er það einnig með okkur.</p>',
    '<p>Á lífsleiðinni söfnum við reynslu, minningum og sögum.<br>Sumt vex sýnilegt.<br>Annað liggur dýpra og bíður þess að verða séð.</p>',
    '<p>Rúnirnar eru ekki hér til að segja þér hver þú ert.</p>',
    '<p>Þær eru hér til að hjálpa þér að muna.</p>',
    '<p>Lífsrúnin er fyrsta skrefið.</p>',
    '<p>Hún markar upphafið að ferðalagi inn á við — vegferð þar sem þitt eigið tré vex með hverri innsýn, hverri spurningu og hverju skrefi sem þú tekur.</p>',
    '<p>Með tímanum mun tréð bera merki vaxtar þíns, lærdóms og þeirra slóða sem þú velur að feta.</p>',
    '<p>Til að finna Lífsrúnina þína skaltu hefja leitina þar sem saga þín hófst.</p>',
    '<p>Hvenær fæddist þú?</p>',
]
IS_HTML = ''.join(IS_P)

# ── 1. EN klíč ────────────────────────────────────────────────────────────────
print('\n── 1. EN tree_intro ─────────────────────────────────────────')
EN_ANCHOR = "    sign_in_btn:      'SIGN IN',"
EN_NEW    = f"    tree_intro: '{EN_HTML}',\n"
apply('EN tree_intro → translations.js', TRANS, EN_ANCHOR, EN_NEW + EN_ANCHOR)

# ── 2. IS klíč ────────────────────────────────────────────────────────────────
print('\n── 2. IS tree_intro ─────────────────────────────────────────')
IS_ANCHOR = "    sign_in_btn:      'SKR\\u00c1 INN',"
IS_NEW    = f"    tree_intro: '{IS_HTML}',\n"
apply('IS tree_intro → translations.js', TRANS, IS_ANCHOR, IS_NEW + IS_ANCHOR)

# ── 3. tree.js:46 — nahraď hardcoded HTML za t('tree_intro') ──────────────────
print('\n── 3. tree.js:46 ────────────────────────────────────────────')
lines = read_f(TREE).split('\n')
new_lines = []
replaced = False
for line in lines:
    if not replaced and "txt.innerHTML = isIs" in line and "Yggdrasill" in line:
        new_lines.append("      if (txt) txt.innerHTML = t('tree_intro');")
        replaced = True
        print('  [OK] tree.js:46 → t("tree_intro")')
    else:
        new_lines.append(line)
if not replaced:
    print('  [SKIP] tree.js:46 — řádek nenalezen')
write_f(TREE, '\n'.join(new_lines))

# ── 4. tree.js:230 — name fallback ────────────────────────────────────────────
print('\n── 4. tree.js:230 — name fallback ───────────────────────────')
apply(
    "email.split('@')[0] → lang === 'is' ? 'þú' : 'you'",
    TREE,
    "var name = readerUser.name || (currentUser ? currentUser.email.split('@')[0] : 'seeker');",
    "var name = readerUser.name || (lang === 'is' ? 'þú' : 'you');"
)

print('\ndone')

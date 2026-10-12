#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# unify-reading-style.py
# 1. Shrine CSS: remove border-left from .layer1/.layer2
# 2. runar-character.js: unified prompts (no |||) for IS + EN
# 3. runar-reading.js: no split, single display block

import re

SHRINE    = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-shrine.html'
CHARACTER = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-character.js'
READING   = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-reading.js'

def read_f(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write_f(p, c):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

def apply(label, c, old, new):
    if old in c:
        print(f'  [OK] {label}')
        return c.replace(old, new, 1)
    print(f'  [MISS] {label}')
    return c

# ═══════════════════════════════════════════════════════════════
print('\n── 1. shrine.html: remove border-left ──────────────────')
c = read_f(SHRINE)

c = apply('layer1 border-left',
    c,
    '.layer1{background:#0a0e18;border-left:3px solid var(--gold);padding:18px 22px;margin-bottom:10px;}',
    '.layer1{background:#0a0e18;padding:18px 22px;margin-bottom:10px;}'
)
c = apply('layer2 border-left',
    c,
    '.layer2{background:#0d1018;border-left:3px solid var(--blue);padding:18px 22px;margin-bottom:18px;}',
    '.layer2{background:#0d1018;padding:18px 22px;margin-bottom:18px;}'
)
write_f(SHRINE, c)

# ═══════════════════════════════════════════════════════════════
print('\n── 2. runar-character.js: unified prompts ───────────────')
c = read_f(CHARACTER)

# ── 2a. buildReadingPromptIS: fix formulaLine ref + unify format ──────────
c = apply('IS formulaLine — remove HLUTA 1 ref',
    c,
    "    ? '\\nÍslenskur rúnaformúll (flettu inn náttúrlega einu sinni í HLUTA 1): \"' + drawn.formula_is + '\"'",
    "    ? '\\nÍslenskur rúnaformúll (flettu inn náttúrlega einu sinni): \"' + drawn.formula_is + '\"'"
)

c = apply('IS return block — unified format',
    c,
    "  return [\n"
    "    parts + formulaLine,\n"
    "    '',\n"
    "    'LESTURHORNIÐ (fylgdu þessum opnunarpunkti — láttu hann móta tón og upphaf): ' + angle,\n"
    "    '',\n"
    "    'Gefðu lesturinn í tveimur hlutum aðskildum með |||',\n"
    "    '',\n"
    "    'HLUTI 1 (2–3 setningar að hámarki, kjarni, bein og ljóðræn. Nefndu nafn rúnarinnar — ' + rn(drawn) + ' — einu sinni, fléttað náttúrlega inn. Láttu táknlægt lag rúnarinnar — ' + worldRef + ' — lita tóninn hljóðlægt):',\n"
    "    '',\n"
    "    'HLUTI 2 (3–4 setningar að hámarki. Dýpri ígrundun — tengdu dregnu rúnu við ' + lifeRef + areaRef + seekRef + '. Ef dregna rúna og lífsrúna deila frumefni (' + elemRef + '), láttu þann samklang koma fram stuttlega. Enda með einni stuttri, opinni spurningu. EKKI setja \"HLUTI 2\" sem fyrirsögn í úttakinu):',\n"
    "    '',\n"
    "    'Talaðu beint við ' + u.name + '. Vertu hnitmiðaður — sérhver setning verður að eiga rétt á sér.'\n"
    "      + getCorrPrompt('is', corrections),\n"
    "  ].join('\\n');",

    "  var hasQ = !!(u.question && u.question.trim());\n"
    "  var lifeNote2 = life ? ('MANNESKJAN ber ' + rn(life) + ' (' + life.g + ') sem lífsrúnu — flettu þessari tengingu inn ómeðvitað, án þess að tilkynna hana.') : '';\n"
    "  return [\n"
    "    parts + formulaLine,\n"
    "    '',\n"
    "    'LESTURHORNIÐ (fylgdu þessum opnunarpunkti — láttu hann móta tón og upphaf): ' + angle,\n"
    "    '',\n"
    "    'Gefðu einn samfelldan lestur — 5 til 7 setningar, engar fyrirsagnir, engar hlutaskiptingar.',\n"
    "    '',\n"
    "    hasQ\n"
    "      ? ('Svaraðu spurningunni: \"' + u.question + '\" í gegnum ' + rn(drawn) + ' (' + drawn.g + ') — í myndum og táknmáli, ekki ráðgjöf. Nefndu ' + rn(drawn) + ' einu sinni, fléttað náttúrlega inn. Talaðu um það sem liggur undir spurningunni. Enda með einni opinni spurningu sem nær dýpra.')\n"
    "      : ('Byrjaðu á ' + rn(drawn) + ' (' + drawn.g + ') — láttu táknlæga gæði þess (' + worldRef + ') koma fram í myndum, ekki útskýringu. Nefndu ' + rn(drawn) + ' einu sinni, fléttað náttúrlega inn. Sameina kjarna og dýpri ígrundun í eina hreyfingu — tengdu ' + lifeRef + areaRef + seekRef + '. Enda með einni stuttri, opinni spurningu.'),\n"
    "    lifeNote2,\n"
    "    '',\n"
    "    'Einn texti. Engar hlutaskiptingar. Engar fyrirsagnir. Talaðu beint við ' + u.name + '. Vertu hnitmiðaður — sérhver setning verður að eiga rétt á sér.'\n"
    "      + getCorrPrompt('is', corrections),\n"
    "  ].filter(Boolean).join('\\n');"
)

# ── 2b. buildReadingPromptEN: replace template literal return with unified ─
# The EN function returns a long template literal. Replace the whole return.
OLD_EN_RETURN = (
    "  return `${parts}${formulaLine}\\n\\nREADING ANGLE (follow this entry point — let it shape the opening and tone): ${_randomAngle('en')}\\n\\nGive the reading in two parts separated by |||\\n\\nPART 1 (2-3 sentences maximum, core message, direct and poetic. Mention the rune's name — ${rn(drawn)} — once, woven naturally into the reading. Let the rune's symbolic layer — ${rworld(drawn) || 'the living path'} — subtly colour the tone):\\n\\nPART 2 (3-4 sentences maximum. Deeper reflection — connect drawn rune with ${life ? 'life rune ' + rn(life) + (life.world ? ' (' + rworld(life) + ')' : '') + ', ' : ''}${u.area || 'their path'}${u.seeking ? ', seeking ' + u.seeking : ''}. If the drawn rune and life rune share an element (${relements(drawn)} / ${life ? relements(life) : '—'}), let that resonance surface briefly. End with one short, open question. Do NOT include a label like \"PART 2\" in the output):\\n\\nSpeak directly to ${u.name}. Be concise — every sentence must earn its place. ${langInstr}\\n${getCorrPrompt(lang, corrections)}`;"
)
NEW_EN_RETURN = (
    "  const hasQ = !!(u.question && u.question.trim());\n"
    "  const lifeNote = life ? ('The person carries ' + rn(life) + ' (' + life.g + ') as life rune — weave this in without announcing it.') : '';\n"
    "  const areaNote2 = u.area ? ('Area of focus: ' + u.area + '.') : '';\n"
    "  const seekNote2 = u.seeking ? (u.name + ' is seeking ' + u.seeking + '.') : '';\n"
    "  const formulaRef = (lang === 'is' && drawn.formula_is) ? ('Icelandic rune formula (weave naturally once): \"' + drawn.formula_is + '\"') : '';\n"
    "  return [\n"
    "    parts,\n"
    "    '',\n"
    "    'READING ANGLE (follow this entry point — let it shape the opening and tone): ' + _randomAngle('en'),\n"
    "    '',\n"
    "    'One flowing reading — 5 to 7 sentences, no sections, no labels, no line breaks between thoughts.',\n"
    "    '',\n"
    "    hasQ\n"
    "      ? ('Open with ' + rn(drawn) + ' (' + drawn.g + ') answering: \"' + u.question + '\" — through image and symbol, not advice. Mention ' + rn(drawn) + ' by name once, woven naturally. Speak to what lies beneath the question. End with one open question that reaches deeper.')\n"
    "      : ('Open with ' + rn(drawn) + ' (' + drawn.g + ') — let its quality (' + (rworld(drawn) || pickedKws) + ') arrive through image, not explanation. Mention ' + rn(drawn) + ' by name once, woven naturally. Bring core insight and deeper reflection into one movement. End with one short open question.'),\n"
    "    lifeNote,\n"
    "    areaNote2,\n"
    "    seekNote2,\n"
    "    formulaRef,\n"
    "    '',\n"
    "    'One paragraph. No breaks. No labels. Speak directly to ' + u.name + '. Be concise — every sentence must earn its place. ' + langInstr,\n"
    "    getCorrPrompt(lang, corrections),\n"
    "  ].filter(Boolean).join('\\n');"
)
c = apply('EN return — unified format', c, OLD_EN_RETURN, NEW_EN_RETURN)

write_f(CHARACTER, c)

# ═══════════════════════════════════════════════════════════════
print('\n── 3. runar-reading.js: unified display ─────────────────')
c = read_f(READING)

# 3a. At loading start: hide layer2 + clear layer1-lbl immediately
c = apply('loading start — hide layer2 + clear lbl',
    c,
    "  var _pL1 = document.getElementById('layer1-lbl');\n"
    "  var _pL2 = document.getElementById('layer2-lbl');\n"
    "  if (_pL1) _pL1.classList.add('pulsing');\n"
    "  if (_pL2) _pL2.classList.add('pulsing');",
    "  var _pL1 = document.getElementById('layer1-lbl');\n"
    "  var _pL2 = document.getElementById('layer2-lbl');\n"
    "  // Unified: hide layer2 + clear label before API call\n"
    "  var _preL2 = document.getElementById('single-layer2');\n"
    "  if (_preL2) _preL2.style.display = 'none';\n"
    "  if (_pL1) { _pL1.textContent = ''; _pL1.classList.add('pulsing'); }\n"
    "  if (_pL2) _pL2.classList.add('pulsing');"
)

# 3b. Remove ||| split, use full reading text
c = apply('remove ||| split — single reading block',
    c,
    "  const split = res.text.split('|||');\n"
    "  const short = applyISCorrections(split[0]?.trim() || res.text, lang, corrections);\n"
    "  const deep  = applyISCorrections(split[1]?.trim() || '', lang, corrections);\n"
    "  readerTexts[lang] = { short, deep };",
    "  // Unified reading — single block, no split\n"
    "  const reading = applyISCorrections(res.text.trim(), lang, corrections);\n"
    "  readerTexts[lang] = { short: reading, deep: '' };"
)

# 3c. Display: hide layer2, update label, stream to out-short only
c = apply('display — stream unified reading, hide layer2',
    c,
    "  await stream('out-short', short);\n"
    "  if (deep) await stream('out-deep', deep); else document.getElementById('out-deep').innerHTML = '';",
    "  // Show drawn rune as label, stream unified text\n"
    "  var _ul2 = document.getElementById('single-layer2');\n"
    "  var _ul1lbl = document.getElementById('layer1-lbl');\n"
    "  if (_ul2) _ul2.style.display = 'none';\n"
    "  if (_ul1lbl) { _ul1lbl.textContent = drawn.g + '  ' + rn(drawn); _ul1lbl.classList.remove('pulsing'); }\n"
    "  await stream('out-short', reading);\n"
    "  document.getElementById('out-deep').innerHTML = '';"
)

# 3d. Fix generateVoice: single rune now uses out-short (not out-deep)
c = apply('generateVoice — use out-short for single rune',
    c,
    "    voiceText = document.getElementById('out-deep').innerText.trim();",
    "    voiceText = document.getElementById('out-short').innerText.trim();"
)

# 3e. drawAnother: restore layer2 + reset layer1-lbl
c = apply('drawAnother — restore layer2 + reset lbl',
    c,
    "function drawAnother() {\n"
    "  if (_spreadMode === 'trojice') { _spread3Runes = []; _updateSpread3Slots(); }\n"
    "  if (_spreadMode === 'kriz') { _spread5Runes = []; _updateSpread5Slots(); }",
    "function drawAnother() {\n"
    "  // Restore layer2 + reset layer1 label for next reading\n"
    "  var _daL2 = document.getElementById('single-layer2');\n"
    "  var _daLbl = document.getElementById('layer1-lbl');\n"
    "  if (_daL2) _daL2.style.display = '';\n"
    "  if (_daLbl) _daLbl.textContent = t('layer1_lbl');\n"
    "  if (_spreadMode === 'trojice') { _spread3Runes = []; _updateSpread3Slots(); }\n"
    "  if (_spreadMode === 'kriz') { _spread5Runes = []; _updateSpread5Slots(); }"
)

write_f(READING, c)
print('\ndone — all 3 files updated')

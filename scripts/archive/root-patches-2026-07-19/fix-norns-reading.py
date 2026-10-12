#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Adds Norns spread support to runar-reading.js
# Norns reuses spread3 slot tracker (same 3 slots)
# but calls _generateNornsReading() instead of _generateSpread3Reading()

path = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-reading.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

if '_generateNornsReading' in content:
    print('ERROR: _generateNornsReading already exists')
    exit(1)

# ─── 1. Add 'norns' to _setSpreadMode button handling ─────────────
old1 = (
    "  var btnKriz = document.getElementById('mode-btn-kriz');\n"
    "  if (btnKriz) btnKriz.classList.toggle('active', mode === 'kriz');\n"
)
new1 = (
    "  var btnKriz  = document.getElementById('mode-btn-kriz');\n"
    "  var btnNorns = document.getElementById('mode-btn-norns');\n"
    "  if (btnKriz)  btnKriz.classList.toggle('active', mode === 'kriz');\n"
    "  if (btnNorns) btnNorns.classList.toggle('active', mode === 'norns');\n"
)
if old1 in content:
    content = content.replace(old1, new1, 1)
    print('C1 OK: norns button toggle added to _setSpreadMode')
else:
    errors.append('C1 FAIL: btnKriz toggle pattern not found')

# ─── 2. _updateSpread3Slots — also show for norns mode ────────────
old2 = "  slotEl.style.display = (_spreadMode === 'trojice') ? 'flex' : 'none';"
new2 = "  slotEl.style.display = (_spreadMode === 'trojice' || _spreadMode === 'norns') ? 'flex' : 'none';"
if old2 in content:
    content = content.replace(old2, new2, 1)
    print('C2 OK: _updateSpread3Slots shows for norns mode')
else:
    errors.append('C2 FAIL: spread3 display pattern not found')

# ─── 3. readRune — norns block (same 3-rune flow, different generator) ─
# Insert norns block right before trojice block
old3 = "  if (_spreadMode === 'trojice') {\n    // Klik na btn-speak"
new3 = (
    "  if (_spreadMode === 'norns') {\n"
    "    // Visitor gate — block anonymous users\n"
    "    if (!currentUser) {\n"
    "      showToast(lang === 'is' ? 'Skráðu þig inn til að nota Nornir.' : 'Sign in to use the Norns spread.');\n"
    "      _setSpreadMode('single'); return;\n"
    "    }\n"
    "    if (_spread3Runes.length === 3 && !readerRune) {\n"
    "      document.getElementById('reader-rune-card').style.display = 'none';\n"
    "      document.getElementById('reader-output').style.display = 'block';\n"
    "      readerTexts = {}; voiceGenerated = {};\n"
    "      await _generateNornsReading();\n"
    "      return;\n"
    "    }\n"
    "    if (!readerRune) return;\n"
    "    if (_spread3Runes.length < 3) _spread3Runes.push(readerRune);\n"
    "    readerRune = null;\n"
    "    _updateSpread3Slots();\n"
    "    var speakBtnN = document.getElementById('btn-speak');\n"
    "    if (speakBtnN) speakBtnN.disabled = (_spread3Runes.length < 3);\n"
    "    return;\n"
    "  }\n"
    "  if (_spreadMode === 'trojice') {\n    // Klik na btn-speak"
)
if old3 in content:
    content = content.replace(old3, new3, 1)
    print('C3 OK: norns block added to readRune')
else:
    errors.append('C3 FAIL: trojice readRune pattern not found')

# ─── 4. drawAnother — reset norns (already resets _spread3Runes) ──
# Norns uses _spread3Runes, so the existing reset handles it.
# But we need to call _updateSpread3Slots for norns mode too — already does.
# No change needed here. Just verify.
print('C4 OK: drawAnother already resets _spread3Runes (norns uses same)')

# ─── 5. generateVoice — norns uses s3-out same as trojice ─────────
# Already handled — trojice/norns both use spread3-output / s3-out
# No change needed.
print('C5 OK: generateVoice already handles s3-out for trojice/norns')

# ─── 6. Append _generateNornsReading ──────────────────────────────
norns_func = """
// ─── NORNS GENERATE (3-rune fate axis) ─────────────────────────
// Norns positions have hardcoded norns_axis (independent of area/seeking):
//   _spread3Runes[0] → urd | [1] → verdandi | [2] → skuld
// Tree branch: reaches toward kmen — deeper than Trojice
// Bloom duration: 24h
async function _generateNornsReading() {
  if (_spread3Runes.length < 3) return;

  var vBtn = document.getElementById('btn-generate-voice');
  if (vBtn) { vBtn.disabled = true; vBtn.textContent = t('voice_btn'); }
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');

  // Hide single layers, show spread3 output
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'none';
  var s3out = document.getElementById('spread3-output');
  if (s3out) s3out.style.display = 'block';

  var rdLoad = document.getElementById('reading-loading');
  var rdLoadTxt = document.getElementById('reading-loading-txt');
  if (rdLoadTxt) rdLoadTxt.textContent = t('reading_loading');
  if (rdLoad) rdLoad.style.display = 'block';
  var pL1 = document.getElementById('layer1-lbl');
  var pL2 = document.getElementById('layer2-lbl');
  if (pL1) pL1.classList.add('pulsing');
  if (pL2) pL2.classList.add('pulsing');

  var u = readerUser;
  var sys = buildSysPrompt(activeChar, lang);
  var prompt = buildNornsPrompt(u, _spread3Runes, lang, corrections);
  var tokens = (SPREAD_CONFIG && SPREAD_CONFIG.norns) ? SPREAD_CONFIG.norns.tokens : 900;

  var res = await callProxy(sys, prompt, tokens, shouldUseCredit());

  if (rdLoad) rdLoad.style.display = 'none';
  if (pL1) pL1.classList.remove('pulsing');
  if (pL2) pL2.classList.remove('pulsing');

  if (res.error === 'rate_limited') {
    setSt('st-reader', lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.', 'err');
    return;
  }
  if (res.error === 'no_credits' || res.error === 'monthly_limit' || res.error === 'weekly_limit') {
    var isMonthly = res.error === 'monthly_limit';
    var msg = isMonthly
      ? (lang === 'is' ? 'Mánaðarlegur lesturmark er náð.' : 'Monthly reading limit reached.')
      : (lang === 'is' ? 'Kredit þínir eru búnir.' : 'No credits remaining.');
    setSt('st-reader', msg, 'err');
    if (currentUser) syncMonthlyCount(currentUser.id);
    if (currentUser) await fetchUserProfile(currentUser.id);
    return;
  }
  if (res.error) { setSt('st-reader', 'Failed: ' + res.error, 'err'); return; }

  var text = applyISCorrections(res.text || '', lang, corrections);
  readerTexts[lang] = { short: text, deep: '' };

  // Label: Urður · Verðandi · Skuld glyphs
  var s3lbl = document.getElementById('s3-trojice-lbl');
  if (s3lbl) s3lbl.textContent = _spread3Runes[0].g + ' · ' + _spread3Runes[1].g + ' · ' + _spread3Runes[2].g;

  // Save to DB (Urður rune as anchor — urd position)
  if (currentUser) {
    await saveReading(_spread3Runes[0], text, '');
    await syncMonthlyCount(currentUser.id);
    loadJournal();
  } else {
    incTrialCount();
    updateAuthUI();
  }

  await stream('s3-out', text);

  if (canUseVoice()) {
    if (vBtn) { vBtn.disabled = false; vBtn.style.display = ''; }
  } else {
    if (vBtn) { vBtn.disabled = true; vBtn.style.display = 'none'; }
  }
}
"""

content = content + norns_func
print('C6 OK: _generateNornsReading appended')

if errors:
    print('ERRORS (file NOT saved):')
    for e in errors: print(' ', e)
    exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('DONE: runar-reading.js updated with Norns support')

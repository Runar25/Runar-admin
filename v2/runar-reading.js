// ═══════════════════════════════════════════════════════
// RÚNAR · READING
// Core reading flow: prompt builder, generate, stream, reader UI,
// main audio player (cap), voice generation.
// Depends on globals: lang, currentUser, userTier, readerUser,
//   readerRune, readerTexts, activeChar, corrections, sb,
//   RUNAR_MODES, READING_ANGLES, FREE_TRIAL_LIMIT, FREE_REGISTERED_LIMIT,
//   DELAY_TRIAL_END, DELAY_SCROLL, DELAY_ERROR_RESET
// Depends on functions: t(), callProxy(), buildSysPrompt(),
//   getCorrPrompt(), applyISCorrections(), stream(), checkStaticAudio(),
//   shouldUseCredit(), canUseVoice(), saveReading(), syncMonthlyCount(),
//   loadJournal(), updateAuthUI(), setSt(), showToast(), incTrialCount(),
//   getTrialCount(), getFreeMonthCount(), elVoiceId(), elModel(),
//   EL_PROXY, EL_VOICE_SETTINGS
// ═══════════════════════════════════════════════════════

// ─── READING CORE ────────────────────────────────────────

// ─── PURE PROMPT BUILDER ─────────────────────────────────────
// Receives everything as parameters — no globals read.
// Returns the full prompt string for _generateReading().
async function _generateReading() {
  if (!readerRune) return;
  const vBtn = document.getElementById('btn-generate-voice');
  vBtn.disabled = true; vBtn.textContent = t('voice_btn');
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = ''; setSt('st-voice', '');
  document.getElementById('out-short').innerHTML = '';
  document.getElementById('out-deep').innerHTML  = '';
  const _rdLoadEl = document.getElementById('reading-loading');
  const _rdLoadTxt = document.getElementById('reading-loading-txt');
  if (_rdLoadTxt) _rdLoadTxt.textContent = t('reading_loading');
  if (_rdLoadEl) _rdLoadEl.style.display = 'block';
  var _pL1 = document.getElementById('layer1-lbl');
  var _pL2 = document.getElementById('layer2-lbl');
  // Unified: hide layer2 + clear label before API call
  var _preL2 = document.getElementById('single-layer2');
  if (_preL2) _preL2.style.display = 'none';
  if (_pL1) { _pL1.textContent = ''; _pL1.classList.add('pulsing'); }
  if (_pL2) _pL2.classList.add('pulsing');

  const u = readerUser, drawn = readerRune;
  const sys = buildSysPrompt(activeChar, lang);
  const prompt = buildReadingPrompt(u, drawn, lang, corrections);

  const res = await callProxy(sys, prompt, RUNAR_MODES.quick_reading.max_tokens, shouldUseCredit(), SPREAD_COSTS.single.credits);
  if (res.error === 'rate_limited') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    setSt('st-reader', lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.', 'err');
    return;
  }
  if (res.error === 'no_credits' || res.error === 'monthly_limit' || res.error === 'weekly_limit') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    document.getElementById('out-short').innerHTML = '';
    document.getElementById('out-deep').innerHTML  = '';
    const isWeekly  = res.error === 'weekly_limit';
    const isMonthly = res.error === 'monthly_limit';
    const msg = isWeekly
      ? (lang === 'is' ? 'Steinar hvíla til mánudags. Notaðu lestur gjafakort til að halda áfram.' : 'The stones rest until Monday. Use a reading gift card to continue.')
      : isMonthly
        ? (lang === 'is' ? 'Mánaðarlegur lesturmark er náð. Notaðu lestur gjafakort eða uppfærðu áskrift.' : 'Monthly reading limit reached. Use a reading gift card or upgrade your plan.')
        : (lang === 'is' ? 'Kredit þínir eru búnir.' : 'No credits remaining. Redeem a gift card to continue.');
    setSt('st-reader', msg, 'err');
    // Sync localStorage with real count from DB to fix any drift
    if (currentUser) syncMonthlyCount(currentUser.id);
    await fetchUserProfile(currentUser.id); // refresh balance + show gate
    return;
  }
  if (res.error) { if (_rdLoadEl) _rdLoadEl.style.display = 'none'; if (_pL1) _pL1.classList.remove('pulsing'); if (_pL2) _pL2.classList.remove('pulsing'); setSt('st-reader', 'Failed: ' + res.error, 'err'); return; }

  // Unified reading — single block, no split
  const reading = applyISCorrections(res.text.trim(), lang, corrections);
  readerTexts[lang] = { short: reading, deep: '' };

  // Count reading — anonymous trial or logged-in free tier
  if (!currentUser) {
    incTrialCount();
    updateAuthUI();
  } else {
    // Save journal only for own reading; always sync count (price same for both modes)
    if (_readingMode === 'mine') {
      await saveReading(readerRune, reading, '');
      loadJournal();
    }
    await syncMonthlyCount(currentUser.id);
  }

  if (_rdLoadEl) _rdLoadEl.style.display = 'none';
  if (_pL1) _pL1.classList.remove('pulsing');
  if (_pL2) _pL2.classList.remove('pulsing');
  // Show drawn rune as label, stream unified text
  var _ul2 = document.getElementById('single-layer2');
  var _ul1lbl = document.getElementById('layer1-lbl');
  if (_ul2) _ul2.style.display = 'none';
  if (_ul1lbl) { _ul1lbl.textContent = drawn.g + '  ' + rn(drawn); _ul1lbl.classList.remove('pulsing'); }
  await stream('out-short', reading);
  document.getElementById('out-deep').innerHTML = '';

  // After streaming is done — if last free reading, show join prompt after 8s
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) {
    setTimeout(() => {
      const el = document.getElementById('trial-end');
      if (el && document.getElementById('reader-output')?.style.display !== 'none') {
        el.style.display = 'block';
      }
    }, DELAY_TRIAL_END);
  }

  // Hlas — povol jen pokud tier dovoluje (viz canUseVoice() + runar-config.js TIERS)
  if (canUseVoice()) {
    vBtn.disabled = false;
    vBtn.style.display = '';
  } else {
    vBtn.disabled = true;
    vBtn.style.display = 'none'; // skrýt úplně — žádný "disabled" button
  }
}

// ─── READER FLOW ─────────────────────────────────────────
function _showTrialEnd() {
  updateAuthUI();
  const el = document.getElementById('trial-end');
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), DELAY_SCROLL);
}

function startReading() {
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) { _showTrialEnd(); return; }
  // Only block rune_seeker who has used all free monthly slots AND has no credits left.
  // Rune Walker / Rune Keeper / Admin are never blocked here.
  if (currentUser && userTier === 'rune_seeker'
      && userFreeBalance <= 0
      && userCredits <= 0) {
    updateAuthUI();
    setSt('st-setup', lang === 'is'
      ? 'Þú hefur gengið alla lestrana þína í þessum mánuði. Notaðu gjafa-lesturarkort til að halda áfram.'
      : 'Your readings for this month are complete. Use a reading gift card to continue.');
    return;
  }
  var isMine = (_readingMode === 'mine');
  var knownUser = isMine && userName && _lifeRuneNum;
  // Use stored name if own reading and name is known
  var name = knownUser ? userName : document.getElementById('r-name').value.trim();
  if (!name) name = lang === 'is' ? 'þú' : 'you';
  // Life rune from DB (own reading) or null (reading for someone else)
  var lifeRune = (isMine && _lifeRuneNum) ? RUNES[_lifeRuneNum - 1] : null;
  readerUser = { name, d: null, m: null, y: null, lifeRune,
    area: readerUser.area || '', seeking: readerUser.seeking || '',
    mood: readerUser.mood || '', intention: readerUser.intention || '',
    question: document.getElementById('r-question').value.trim() };
  document.getElementById('reader-hero').classList.add('hidden');
  document.getElementById('reader-setup').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'block';
  document.getElementById('reader-output').style.display = 'none';
  buildGrid(); setSt('st-setup', ''); setSt('st-reader', '');
}



var _readingMode  = 'mine';   // 'mine' = personal reading, 'someone' = for another person
var _spreadMode   = 'single';
var _spread3Runes = [];
var _spread5Runes = [];
var _spread7Runes = [];   // Horseshoe (7 runes)
var _spread9Runes = [];   // Yggdrasil (9 worlds)
// ─── SPREAD MODE ─────────────────────────────────────────
function _setSpreadMode(mode) {
  _spreadMode   = mode;
  _spread3Runes = [];
  _spread5Runes = [];
  _spread7Runes = [];
  _spread9Runes = [];
  readerRune    = null;
  // Toggle mode buttons
  var btnSingle  = document.getElementById('mode-btn-single');
  if (btnSingle)  btnSingle.classList.toggle('active', mode === 'single');
  var btnKriz  = document.getElementById('mode-btn-kriz');
  var btnNorns = document.getElementById('mode-btn-norns');
  if (btnKriz)  btnKriz.classList.toggle('active', mode === 'kriz');
  if (btnNorns) btnNorns.classList.toggle('active', mode === 'norns');
  var btnHorseshoe = document.getElementById('mode-btn-horseshoe');
  var btnYggdrasil = document.getElementById('mode-btn-yggdrasil');
  if (btnHorseshoe) btnHorseshoe.classList.toggle('active', mode === 'horseshoe');
  if (btnYggdrasil) btnYggdrasil.classList.toggle('active', mode === 'yggdrasil');
  // Reset output
  _hideSpread3Output();
  _hideSpread5Output();
  _hideSpread7Output();
  _hideSpread9Output();
  document.getElementById('reader-rune-card').style.display = 'block';
  document.getElementById('reader-output').style.display    = 'none';
  _updateSpread3Slots();
  _updateSpread5Slots();
  _updateSpread7Slots();
  _updateSpread9Slots();
  // Spread mode: reset btn-speak to 'DRAW YOUR RUNES'
  if (mode !== 'single') {
    var _sb = document.getElementById('btn-speak');
    if (_sb) { _sb.textContent = t('speak_btn_draw'); _sb.disabled = true; }
  }
}

function _updateSpread3Slots() {
  var slotEl = document.getElementById('spread3-slots');
  if (!slotEl) return;
  slotEl.style.display = (_spreadMode === 'norns') ? 'flex' : 'none';
  var slots = ['slot1','slot2','slot3'];
  var empty = ['①','②','③'];
  slots.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (!el) return;
    var rune = _spread3Runes[i];
    el.textContent = rune ? rune.g : empty[i];
    el.classList.toggle('filled', !!rune);
    // Klikatelny jen kdyz je vyplneny — klik ho vyprazdni
    el.onclick = rune ? (function(idx) {
      return function() {
        _spread3Runes.splice(idx, 1);
        _updateSpread3Slots();
        var speakBtn = document.getElementById('btn-speak');
        if (speakBtn) speakBtn.disabled = true;
      };
    })(i) : null;
    el.style.cursor = rune ? 'pointer' : 'default';
    el.title = rune ? (rune.n + ' — click to remove') : '';
  });
}

function _hideSpread3Output() {
  var out = document.getElementById('spread3-output');
  if (out) out.style.display = 'none';
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = '';
}
function _updateSpread5Slots() {
  var slotEl = document.getElementById('spread5-slots');
  if (!slotEl) return;
  slotEl.style.display = (_spreadMode === 'kriz') ? 'flex' : 'none';
  var labels = ['①','②','③','④','⑤'];
  for (var i = 0; i < 5; i++) {
    var el = document.getElementById('s5slot' + (i + 1));
    if (!el) continue;
    var rune = _spread5Runes[i];
    el.textContent = rune ? rune.g : labels[i];
    el.classList.toggle('filled', !!rune);
    el.onclick = rune ? (function(idx) {
      return function() {
        _spread5Runes.splice(idx, 1);
        _updateSpread5Slots();
        var speakBtn = document.getElementById('btn-speak');
        if (speakBtn) speakBtn.disabled = true;
      };
    })(i) : null;
    el.style.cursor = rune ? 'pointer' : 'default';
    el.title = rune ? (rune.n + ' — click to remove') : '';
  }
}
function _hideSpread5Output() {
  var out = document.getElementById('spread5-output');
  if (out) out.style.display = 'none';
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = '';
}

// ─── HORSESHOE (7 rune) helpers ──────────────────────────────────────────
function _updateSpread7Slots() {
  var slotEl = document.getElementById('spread7-slots');
  if (!slotEl) return;
  slotEl.style.display = (_spreadMode === 'horseshoe') ? 'flex' : 'none';
  var empty = ['①','②','③','④','⑤','⑥','⑦'];
  for (var i = 0; i < 7; i++) {
    var el = document.getElementById('s7slot' + (i + 1));
    if (!el) continue;
    var rune = _spread7Runes[i];
    el.textContent = rune ? rune.g : empty[i];
    el.classList.toggle('filled', !!rune);
    if (rune) {
      el.title = rune.n + ' — click to remove';
      el.style.cursor = 'pointer';
      el.onclick = (function(idx) {
        return function() {
          _spread7Runes.splice(idx, 1);
          _updateSpread7Slots();
          var speakBtn = document.getElementById('btn-speak');
          if (speakBtn) speakBtn.disabled = true;
        };
      })(i);
    } else {
      el.title = '';
      el.style.cursor = 'default';
      el.onclick = null;
    }
  }
}
function _hideSpread7Output() {
  var out = document.getElementById('spread7-output');
  if (out) out.style.display = 'none';
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = '';
}

// ─── YGGDRASIL (9 rune) helpers ──────────────────────────────────────────
function _updateSpread9Slots() {
  var slotEl = document.getElementById('spread9-slots');
  if (!slotEl) return;
  slotEl.style.display = (_spreadMode === 'yggdrasil') ? 'flex' : 'none';
  var empty = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
  for (var i = 0; i < 9; i++) {
    var el = document.getElementById('s9slot' + (i + 1));
    if (!el) continue;
    var rune = _spread9Runes[i];
    el.textContent = rune ? rune.g : empty[i];
    el.classList.toggle('filled', !!rune);
    if (rune) {
      el.title = rune.n + ' — click to remove';
      el.style.cursor = 'pointer';
      el.onclick = (function(idx) {
        return function() {
          _spread9Runes.splice(idx, 1);
          _updateSpread9Slots();
          var speakBtn = document.getElementById('btn-speak');
          if (speakBtn) speakBtn.disabled = true;
        };
      })(i);
    } else {
      el.title = '';
      el.style.cursor = 'default';
      el.onclick = null;
    }
  }
}
function _hideSpread9Output() {
  var out = document.getElementById('spread9-output');
  if (out) out.style.display = 'none';
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = '';
}

async function readRune() {
  if (_spreadMode === 'kriz') {
    // Tier check — block Visitor (anonymous) only
    if (!currentUser) {
      showToast(lang === 'is' ? 'Skráðu þig inn til að nota Kross.' : 'Sign in to use the Cross spread.');
      _setSpreadMode('single'); return;
    }
    if (_spread5Runes.length === 5 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateSpread5Reading();
      return;
    }
    if (!readerRune) return;
    if (_spread5Runes.length < 5) _spread5Runes.push(readerRune);
    readerRune = null;
    _updateSpread5Slots();
    var speakBtn5 = document.getElementById('btn-speak');
    if (speakBtn5) {
      speakBtn5.disabled = (_spread5Runes.length < 5);
      if (_spread5Runes.length >= 5) speakBtn5.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'horseshoe') {
    // Tier check — block Visitor (anonymous) only; rune_seeker can use with rune readings
    if (!currentUser) {
      showToast(lang === 'is' ? 'Skráðu þig inn til að nota Podkova.' : 'Sign in to use the Horseshoe spread.');
      _setSpreadMode('single'); return;
    }
    if (_spread7Runes.length === 7 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateHorseshoeReading();
      return;
    }
    if (!readerRune) return;
    if (_spread7Runes.length < 7) _spread7Runes.push(readerRune);
    readerRune = null;
    _updateSpread7Slots();
    var speakBtn7 = document.getElementById('btn-speak');
    if (speakBtn7) {
      speakBtn7.disabled = (_spread7Runes.length < 7);
      if (_spread7Runes.length >= 7) speakBtn7.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'yggdrasil') {
    // Visitor gate — block anonymous only; all signed-in tiers can access (RS via credits)
    if (!currentUser) {
      showToast(lang === 'is' ? 'Skráðu þig inn til að nota Yggdrasil.' : 'Sign in to use Yggdrasil.');
      _setSpreadMode('single'); return;
    }
    // Seasonal info: full power Dec 14–28, reading available year-round
    var _ygNow = new Date();
    var _ygM = _ygNow.getMonth() + 1;
    var _ygD = _ygNow.getDate();
    if (!(_ygM === 12 && _ygD >= 14 && _ygD <= 28) && !isAdmin(currentUser.email)) {
      showToast(lang === 'is' ? 'Yggdrasil er opinn — en krafturinn er mestur 14.–28. desember.' : 'Yggdrasil is open — its full power returns December 14–28.');
    }
    if (_spread9Runes.length === 9 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateYggdrasilReading();
      return;
    }
    if (!readerRune) return;
    if (_spread9Runes.length < 9) _spread9Runes.push(readerRune);
    readerRune = null;
    _updateSpread9Slots();
    var speakBtn9 = document.getElementById('btn-speak');
    if (speakBtn9) {
      speakBtn9.disabled = (_spread9Runes.length < 9);
      if (_spread9Runes.length >= 9) speakBtn9.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'norns') {
    // Visitor gate — block anonymous users
    if (!currentUser) {
      showToast(lang === 'is' ? 'Skráðu þig inn til að nota Nornir.' : 'Sign in to use the Norns spread.');
      _setSpreadMode('single'); return;
    }
    if (_spread3Runes.length === 3 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateNornsReading();
      return;
    }
    if (!readerRune) return;
    if (_spread3Runes.length < 3) _spread3Runes.push(readerRune);
    readerRune = null;
    _updateSpread3Slots();
    var speakBtnN = document.getElementById('btn-speak');
    if (speakBtnN) {
      speakBtnN.disabled = (_spread3Runes.length < 3);
      if (_spread3Runes.length >= 3) speakBtnN.textContent = t('speak_btn');
    }
    return;
  }
  // Single rune mode (original)
  if (!readerRune) return;
  document.getElementById('reader-rune-card').style.display = 'none';
  document.getElementById('reader-output').style.display = 'block';
  const u = readerUser, drawn = readerRune, life = u.lifeRune;
  const badge = document.getElementById('reader-badge');
  if (life) {
    badge.style.display = 'flex';
    document.getElementById('badge-life-name').textContent = rn(life);
    document.getElementById('badge-life-g').textContent    = life.g;
    document.getElementById('badge-drawn-name').textContent = rn(drawn);
    document.getElementById('badge-drawn-g').textContent   = drawn.g;
  } else { badge.style.display = 'none'; }
  readerTexts = {}; voiceGenerated = {};
  await _generateReading();
}

function drawAnother() {
  // Restore layer2 + reset layer1 label for next reading
  var _daL2 = document.getElementById('single-layer2');
  var _daLbl = document.getElementById('layer1-lbl');
  if (_daL2) _daL2.style.display = '';
  if (_daLbl) _daLbl.textContent = t('layer1_lbl');
  if (_spreadMode === 'norns') { _spread3Runes = []; _updateSpread3Slots(); }
  if (_spreadMode === 'kriz') { _spread5Runes = []; _updateSpread5Slots(); }
  if (_spreadMode === 'horseshoe') { _spread7Runes = []; _updateSpread7Slots(); }
  if (_spreadMode === 'yggdrasil') { _spread9Runes = []; _updateSpread9Slots(); }
  readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) { _showTrialEnd(); return; }
  if (currentUser && userTier === 'rune_seeker' && userFreeBalance <= 0 && userCredits <= 0) { updateAuthUI(); return; }
  document.getElementById('reader-rune-card').style.display = 'block';
  document.querySelectorAll('#reader-grid .rb').forEach(b => b.classList.remove('on'));
  document.getElementById('reader-rune-info').textContent = '';
  document.getElementById('btn-speak').disabled = true;
}

function resetReader() {
  _spreadMode = 'single';
  _spread3Runes = []; _spread5Runes = []; _spread7Runes = []; _spread9Runes = [];
  _updateSpread3Slots(); _updateSpread5Slots(); _updateSpread7Slots(); _updateSpread9Slots();
  readerUser = {}; readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-hero').classList.remove('hidden');
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) {
    _showTrialEnd(); return;
  }
  if (currentUser && userTier === 'rune_seeker' && userFreeBalance <= 0 && userCredits <= 0) {
    updateAuthUI(); return;
  }
  document.getElementById('reader-setup').style.display = 'block';
  ['r-name','r-day','r-month','r-year','r-question'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  readerUser.mood = ''; readerUser.intention = '';
  buildPills();
}

// ─── CUSTOM AUDIO PLAYER (main reading voice) ────────────
function _capTrack(pct) {
  const seek = document.getElementById('cap-seek');
  if (seek) seek.style.setProperty('--pct', pct.toFixed(1) + '%');
}
function capToggle() {
  const a = document.getElementById('runar-audio');
  const btn = document.getElementById('cap-play');
  if (!a || !btn) return;
  if (a.paused) { a.play(); btn.textContent = '⏸'; }
  else          { a.pause(); btn.textContent = '▶'; }
}
function capSeek(v) {
  const a = document.getElementById('runar-audio');
  if (!a || !a.duration) return;
  a.currentTime = a.duration * (v / 100);
  _capTrack(+v);
}
const _SVG_VOL_ON  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06C16.89 6.15 19 8.83 19 12c0 3.17-2.11 5.84-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/></svg>`;
const _SVG_VOL_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
function capMute() {
  const a = document.getElementById('runar-audio');
  const btn = document.getElementById('cap-mute');
  if (!a || !btn) return;
  a.muted = !a.muted;
  btn.innerHTML = a.muted ? _SVG_VOL_OFF : _SVG_VOL_ON;
}
function _capReset() {
  const btn = document.getElementById('cap-play');
  const seek = document.getElementById('cap-seek');
  const cur  = document.getElementById('cap-current');
  if (btn)  btn.textContent  = '▶';
  if (seek) { seek.value = 0; _capTrack(0); }
  if (cur)  cur.textContent  = '0:00';
}

// ─── VOICE ───────────────────────────────────────────────
async function generateVoice() {
  var voiceText;
  if (_spreadMode === 'kriz') {
    var s5el = document.getElementById('s5-out');
    voiceText = s5el ? s5el.innerText.trim() : '';
  } else if (_spreadMode === 'norns') {
    var s3nEl = document.getElementById('s3-out');
    voiceText = s3nEl ? s3nEl.innerText.trim() : '';
  } else if (_spreadMode === 'horseshoe') {
    var s7el = document.getElementById('s7-out');
    voiceText = s7el ? s7el.innerText.trim() : '';
  } else if (_spreadMode === 'yggdrasil') {
    var s9el = document.getElementById('s9-out');
    voiceText = s9el ? s9el.innerText.trim() : '';
  } else {
    voiceText = document.getElementById('out-short').innerText.trim();
  }
  if (!voiceText) return;
  const deepText = voiceText;
  const btn = document.getElementById('btn-generate-voice');
  btn.disabled = true; btn.textContent = t('voice_btn_loading');
  setSt('st-voice', '');
  document.getElementById('audio-player').classList.remove('visible');
  try {
    const { data: { session: elSession } } = await sb.auth.getSession();
    const elHeaders = { 'Content-Type': 'application/json' };
    if (elSession?.access_token) elHeaders['Authorization'] = 'Bearer ' + elSession.access_token;
    const res = await fetch(EL_PROXY, {
      method: 'POST',
      headers: elHeaders,
      body: JSON.stringify({ text: deepText, lang })
    });
    if (!res.ok) {
      const data = await res.json();
      const msg = res.status === 429
        ? (lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.')
        : (data.error || `HTTP ${res.status}`);
      setSt('st-voice', msg, 'err');
      btn.textContent = t('voice_btn'); btn.disabled = false; return;
    }
    const data = await res.json();
    if (data.error) {
      setSt('st-voice', data.error, 'err');
      btn.textContent = t('voice_btn'); btn.disabled = false; return;
    }
    if (!data.audio_url) throw new Error('No audio_url');
    const blob = await fetch(data.audio_url).then(r => r.blob());
    const audio = document.getElementById('runar-audio');
    audio.src = URL.createObjectURL(blob);
    _capReset();
    document.getElementById('audio-player').classList.add('visible');
    voiceGenerated[lang] = true;
    btn.textContent = t('voice_btn_done');
    btn.disabled = true;
    setSt('st-voice', '');
  } catch (err) {
    setSt('st-voice', `Voice error: ${err.message}`, 'err');
    btn.textContent = t('voice_btn'); btn.disabled = false;
  }
}


// ─── KRÍŽ GENERATE (5-rune cross) ────────────────────────
async function _generateSpread5Reading() {
  if (_spread5Runes.length < 5) return;

  var vBtn = document.getElementById('btn-generate-voice');
  if (vBtn) { vBtn.disabled = true; vBtn.textContent = t('voice_btn'); }
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');

  // Hide single layers, show spread5 output
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'none';
  var s5out = document.getElementById('spread5-output');
  if (s5out) s5out.style.display = 'block';

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
  var prompt = buildKrizPrompt(u, _spread5Runes, lang, corrections);
  var tokens = (SPREAD_CONFIG && SPREAD_CONFIG.cross) ? SPREAD_CONFIG.cross.tokens : 1100;

  var res = await callProxy(sys, prompt, tokens, shouldUseCredit(), SPREAD_COSTS.cross.credits);

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

  // Update label with rune glyphs
  var s5lbl = document.getElementById('s5-kriz-lbl');
  if (s5lbl) s5lbl.textContent = _spread5Runes.map(function(r) { return r.g; }).join(' · ');

  // Save to DB — spread format (all runes)
  if (currentUser) {
    if (_readingMode === 'mine') {
      await saveSpreadReading('KRIZ', _spread5Runes, text);
      loadJournal();
    }
    await syncMonthlyCount(currentUser.id);
  } else {
    incTrialCount();
    updateAuthUI();
  }

  await stream('s5-out', text);

  // Voice
  if (canUseVoice()) {
    if (vBtn) { vBtn.disabled = false; vBtn.style.display = ''; }
  } else {
    if (vBtn) { vBtn.disabled = true; vBtn.style.display = 'none'; }
  }
}

// ─── HORSESHOE READING (7 runes) ─────────────────────────────────────────
async function _generateHorseshoeReading() {
  if (_spread7Runes.length < 7) return;

  var vBtn = document.getElementById('btn-generate-voice');
  if (vBtn) { vBtn.disabled = true; vBtn.textContent = t('voice_btn'); }
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');

  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'none';
  var s7out = document.getElementById('spread7-output');
  if (s7out) s7out.style.display = 'block';

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
  var prompt = buildHorseshoePrompt(u, _spread7Runes, lang, corrections);
  var tokens = (SPREAD_CONFIG && SPREAD_CONFIG.horseshoe) ? SPREAD_CONFIG.horseshoe.tokens : 1300;

  var res = await callProxy(sys, prompt, tokens, shouldUseCredit(), SPREAD_COSTS.horseshoe.credits);

  if (rdLoad) rdLoad.style.display = 'none';
  if (pL1) pL1.classList.remove('pulsing');
  if (pL2) pL2.classList.remove('pulsing');

  if (res.error === 'rate_limited') {
    setSt('st-reader', lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.', 'err');
    return;
  }
  if (res.error === 'no_credits' || res.error === 'monthly_limit' || res.error === 'weekly_limit') {
    var isMonthly7 = res.error === 'monthly_limit';
    var msg7 = isMonthly7
      ? (lang === 'is' ? 'Mánaðarlegur lesturmark er náð.' : 'Monthly reading limit reached.')
      : (lang === 'is' ? 'Kredit þínir eru búnir.' : 'No credits remaining.');
    setSt('st-reader', msg7, 'err');
    if (currentUser) syncMonthlyCount(currentUser.id);
    if (currentUser) await fetchUserProfile(currentUser.id);
    return;
  }
  if (res.error) { setSt('st-reader', 'Failed: ' + res.error, 'err'); return; }

  var text7 = applyISCorrections(res.text || '', lang, corrections);
  readerTexts[lang] = { short: text7, deep: '' };

  var s7lbl = document.getElementById('s7-horseshoe-lbl');
  if (s7lbl) s7lbl.textContent = _spread7Runes.map(function(r) { return r.g; }).join(' · ');

  if (currentUser) {
    if (_readingMode === 'mine') { await saveSpreadReading('HORSESHOE', _spread7Runes, text7); loadJournal(); }
    await syncMonthlyCount(currentUser.id);
  } else { incTrialCount(); updateAuthUI(); }

  await stream('s7-out', text7);

  if (canUseVoice()) {
    if (vBtn) { vBtn.disabled = false; vBtn.style.display = ''; }
  } else {
    if (vBtn) { vBtn.disabled = true; vBtn.style.display = 'none'; }
  }
}

// ─── YGGDRASIL READING (9 worlds) ────────────────────────────────────────
async function _generateYggdrasilReading() {
  if (_spread9Runes.length < 9) return;

  var vBtn = document.getElementById('btn-generate-voice');
  if (vBtn) { vBtn.disabled = true; vBtn.textContent = t('voice_btn'); }
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');

  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'none';
  var s9out = document.getElementById('spread9-output');
  if (s9out) s9out.style.display = 'block';

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
  var prompt = buildYggdrasilPrompt(u, _spread9Runes, lang, corrections);
  var tokens = (SPREAD_CONFIG && SPREAD_CONFIG.yggdrasil) ? SPREAD_CONFIG.yggdrasil.tokens : 1800;

  var res = await callProxy(sys, prompt, tokens, shouldUseCredit(), SPREAD_COSTS.yggdrasil.credits);

  if (rdLoad) rdLoad.style.display = 'none';
  if (pL1) pL1.classList.remove('pulsing');
  if (pL2) pL2.classList.remove('pulsing');

  if (res.error === 'rate_limited') {
    setSt('st-reader', lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.', 'err');
    return;
  }
  if (res.error === 'no_credits' || res.error === 'monthly_limit' || res.error === 'weekly_limit') {
    var isMonthly9 = res.error === 'monthly_limit';
    var msg9 = isMonthly9
      ? (lang === 'is' ? 'Mánaðarlegur lesturmark er náð.' : 'Monthly reading limit reached.')
      : (lang === 'is' ? 'Kredit þínir eru búnir.' : 'No credits remaining.');
    setSt('st-reader', msg9, 'err');
    if (currentUser) syncMonthlyCount(currentUser.id);
    if (currentUser) await fetchUserProfile(currentUser.id);
    return;
  }
  if (res.error) { setSt('st-reader', 'Failed: ' + res.error, 'err'); return; }

  var text9 = applyISCorrections(res.text || '', lang, corrections);
  readerTexts[lang] = { short: text9, deep: '' };

  var s9lbl = document.getElementById('s9-yggdrasil-lbl');
  if (s9lbl) s9lbl.textContent = _spread9Runes.map(function(r) { return r.g; }).join(' · ');

  if (currentUser) {
    if (_readingMode === 'mine') { await saveSpreadReading('YGGDRASIL', _spread9Runes, text9); loadJournal(); }
    await syncMonthlyCount(currentUser.id);
  } else { incTrialCount(); updateAuthUI(); }

  await stream('s9-out', text9);

  if (canUseVoice()) {
    if (vBtn) { vBtn.disabled = false; vBtn.style.display = ''; }
  } else {
    if (vBtn) { vBtn.disabled = true; vBtn.style.display = 'none'; }
  }
}

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

  var res = await callProxy(sys, prompt, tokens, shouldUseCredit(), SPREAD_COSTS.norns.credits);

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
  var s3lbl = document.getElementById('s3-norns-lbl');
  if (s3lbl) s3lbl.textContent = _spread3Runes[0].g + ' · ' + _spread3Runes[1].g + ' · ' + _spread3Runes[2].g;

  // Save to DB — spread format (all runes)
  if (currentUser) {
    if (_readingMode === 'mine') {
      await saveSpreadReading('NORNS', _spread3Runes, text);
      loadJournal();
    }
    await syncMonthlyCount(currentUser.id);
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

// ─── READING MODE ─────────────────────────────────────────────────────────────

// Switch between 'mine' (personal) and 'someone' (for another person, no save).
function switchReadingMode(mode) {
  _readingMode = mode;
  var nameInp = document.getElementById('r-name');
  if (nameInp) nameInp.value = '';
  setSt('st-setup', '');
  _updateReadingForm();
}

// Update Reading setup form based on mode + user state.
// Called on: showAppTab('reading'), lang change, login, name save.
function _updateReadingForm() {
  var isMine    = (_readingMode === 'mine');
  var isRS      = currentUser && (userTier === 'rune_seeker' || userTier === 'standard'
                  || userTier === 'premium' || isAdmin(currentUser.email));
  // Known = mine mode + name known + life rune revealed in ToL
  var knownUser = isMine && !!userName && !!_lifeRuneNum;

  // Mode toggle visibility — RS+ only
  var modeRow = document.getElementById('reading-mode-row');
  if (modeRow) modeRow.style.display = isRS ? 'flex' : 'none';

  // Mode button labels + active state
  var btnMine = document.getElementById('rmode-btn-mine');
  var btnSom  = document.getElementById('rmode-btn-someone');
  if (btnMine) { btnMine.classList.toggle('active', isMine); btnMine.textContent = t('reading_mode_mine'); }
  if (btnSom)  { btnSom.classList.toggle('active', !isMine); btnSom.textContent = t('reading_mode_someone'); }

  // Card title — always BEFORE WE BEGIN; append name when user is fully known (MY READING mode)
  var titleEl = document.getElementById('reader-card1-lbl');
  if (knownUser && userName && isMine) {
    if (titleEl) titleEl.textContent = t('reader_card1_lbl') + ', ' + userName.toUpperCase();
  } else {
    if (titleEl) titleEl.textContent = t('reader_card1_lbl');
  }

  // Note text — same message for both known and unknown (MY READING); different for FOR SOMEONE
  var noteEl = document.getElementById('reader-note');
  if (noteEl) {
    if (!isMine) noteEl.textContent = t('setup_someone_note');
    else         noteEl.textContent = t('reader_note');
  }

  // Name row — hidden when own reading and user is fully known
  var nameRow = document.getElementById('setup-name-row');
  if (nameRow) nameRow.style.display = knownUser ? 'none' : 'block';

  // Name label + placeholder
  var nameLbl = document.getElementById('name-lbl');
  var nameInp = document.getElementById('r-name');
  if (nameLbl) nameLbl.textContent = isMine ? t('name_lbl') : t('setup_for_name_lbl');
  if (nameInp) nameInp.placeholder = isMine ? t('name_ph') : t('setup_for_name_ph');
}

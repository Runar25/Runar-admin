// ═══════════════════════════════════════════════════════
// RÚNAR · THE GATHERING
// Ritual: user picks 3–7 runes from journal → combined reading
// Depends on globals: lang, currentUser, userTier, _journalCache,
//   corrections, activeChar, readerUser, sb
// Depends on functions: t(), callProxy(), buildSysPrompt(), getCorrPrompt(),
//   applyISCorrections(), stream(), setSt(), loadJournal(), updateAuthUI()
// ═══════════════════════════════════════════════════════

// ─── THE GATHERING ───────────────────────────────────────
// Ritual: user picks 3–7 runes from journal → 1200-token combined reading
// Once per week (ISO Monday-based). Future: cacao + meditation mode (see CLAUDE.md)

let _whispersMode    = 'idle'; // 'idle' | 'selecting' | 'loading' | 'output'
let _selectedEntries = [];     // 3–7 journal entries chosen by user
let _whispersText    = '';     // generated reading text (for voice)

const GATHERING_MIN     = 3;
const GATHERING_MAX     = 7;

function _gatheringWeekKey() {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  const mon = new Date(d); mon.setDate(d.getDate() - dow);
  const uid = currentUser?.id || 'anon';
  return `gathering_week_${mon.toISOString().slice(0,10)}_${uid}`;
}
function _gatheringUsedThisWeek() {
  return localStorage.getItem(_gatheringWeekKey()) === '1';
}
function _markGatheringUsed() {
  localStorage.setItem(_gatheringWeekKey(), '1');
}

function updateWhispersUI() {
  const isStandard   = userTier === 'standard' || userTier === 'premium';
  const isSeeker     = userTier === 'rune_seeker';
  const isIs         = lang === 'is';
  const hasEnough              = _journalCache.length >= GATHERING_MIN;
  const usedAlready            = _gatheringUsedThisWeek();
  const isGatheringEverUsed    = isSeeker && _journalCache.some(e => e.rune_name === 'THE GATHERING');

  // Description (always visible, bilingual)
  const descEl = document.getElementById('whispers-desc');
  if (descEl) descEl.innerHTML = isIs
    ? 'Ein vika. Rúnirnar þínar. Eitt ráð.<br><strong>Sérhver dagur er helgisiðr</strong> — The Gathering er þar sem þær mætast.'
    : 'One week. Your runes. One reading.<br><strong>Every day is a ritual</strong> — The Gathering is where they meet.';

  // Idle state contents
  const idleSub  = document.getElementById('whispers-idle-sub');
  const lockEl   = document.getElementById('whispers-lock');
  const needMore = document.getElementById('whispers-need-more');
  const reqBtn   = document.getElementById('whispers-request-btn');

  if (idleSub) idleSub.textContent = '';

  if (!isStandard && !isSeeker) {
    // Visitor — not available
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.35'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   { lockEl.style.display = 'block'; lockEl.textContent = '— COMING SOON —'; }
    if (needMore) needMore.style.display = 'none';
  } else if (isSeeker && !hasEnough) {
    // Rune Seeker — not enough readings yet
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.4'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   lockEl.style.display = 'none';
    if (needMore) {
      needMore.style.display = 'block';
      const needed = GATHERING_MIN - _journalCache.length;
      needMore.textContent = isIs
        ? `Þú þarft ${needed} fleiri lestur${needed !== 1 ? 'a' : ''} til að opna The Gathering.`
        : `${needed} more reading${needed !== 1 ? 's' : ''} needed to open The Gathering.`;
    }
  } else if (isGatheringEverUsed) {
    // Rune Seeker used their 1× free Gathering — Standard only from here
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.35'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   { lockEl.style.display = 'block'; lockEl.textContent = 'The Gathering opens with Standard.'; }
    if (needMore) needMore.style.display = 'none';
  } else if (usedAlready) {
    // Already used this week — button disabled, text visible
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.4'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   { lockEl.style.display = 'block'; lockEl.textContent = t('gathering_locked'); }
    if (needMore) needMore.style.display = 'none';
  } else if (!hasEnough) {
    // Standard+ but fewer than 3 readings
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.4'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   lockEl.style.display = 'none';
    if (needMore) {
      needMore.style.display = 'block';
      const needed = GATHERING_MIN - _journalCache.length;
      needMore.textContent = isIs
        ? `Þú þarft ${needed} fleiri lestur${needed !== 1 ? 'a' : ''} til að opna The Gathering.`
        : `${needed} more reading${needed !== 1 ? 's' : ''} needed to open The Gathering.`;
    }
  } else {
    // All tiers — available (Gathering is free, weekly limit enforced)
    if (reqBtn)   { reqBtn.disabled = false; reqBtn.style.opacity = ''; reqBtn.style.cursor = ''; }
    if (lockEl)   lockEl.style.display = 'none';
    if (needMore) needMore.style.display = 'none';
  }

  if (reqBtn) reqBtn.textContent = t('ritual_gathering_request');

  // Show correct state
  const states = { idle: 'whispers-idle', selecting: 'whispers-selecting', loading: 'whispers-loading', output: 'whispers-output' };
  Object.entries(states).forEach(([state, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = _whispersMode === state ? 'block' : 'none';
  });

  // CSS class for selection mode (shows ★ SELECT buttons on jcards)
  const content = document.getElementById('journal-content');
  if (content) content.classList.toggle('whispers-selecting', _whispersMode === 'selecting');

  // Loading text
  const loadTxt = document.getElementById('whispers-loading-txt');
  if (loadTxt) loadTxt.textContent = t('gathering_loading');

  // Weave button label + state
  const weaveBtn = document.getElementById('whispers-weave-btn');
  if (weaveBtn) {
    const n = _selectedEntries.length;
    weaveBtn.disabled    = n < GATHERING_MIN;
    weaveBtn.textContent = t('gathering_weave_btn');
  }

  // Cancel / New buttons
  const cancelBtn = document.getElementById('whispers-cancel-btn');
  if (cancelBtn) cancelBtn.textContent = t('cancel_btn');
  const newBtn = document.getElementById('whispers-new-btn');
  if (newBtn) newBtn.textContent = t('ritual_gathering_new');

  // Voice button
  const vBtn = document.getElementById('whispers-voice-btn');
  if (vBtn && !vBtn.disabled) vBtn.textContent = t('voice_btn');
}

function enterWhispersSelection() {
  _selectedEntries = [];
  _whispersMode    = 'selecting';
  updateWhispersUI();
  updateWhispersCounter();
  // Scroll down to entry list so user can pick
  setTimeout(() => {
    const list = document.getElementById('journal-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

function toggleRuneSelection(i) {
  const entry = _journalCache[i];
  if (!entry) return;
  const idx = _selectedEntries.findIndex(e => e.id === entry.id);
  const isSelected = idx >= 0;
  if (isSelected) {
    _selectedEntries.splice(idx, 1);
  } else {
    if (_selectedEntries.length >= GATHERING_MAX) return; // max reached
    _selectedEntries.push(entry);
  }
  const nowSelected = !isSelected;
  const isIs = lang === 'is';
  const jcard = document.getElementById(`jcard-${i}`);
  if (jcard) jcard.classList.toggle('whispers-selected', nowSelected);
  const btn = document.getElementById(`jselect-btn-${i}`);
  if (btn) {
    btn.textContent = nowSelected ? t('jcard_selected') : t('jcard_select');
    btn.classList.toggle('selected', nowSelected);
  }
  updateWhispersCounter();
}

function updateWhispersCounter() {
  const n    = _selectedEntries.length;
  const isIs = lang === 'is';
  const counterEl = document.getElementById('whispers-counter');
  if (counterEl) {
    let label;
    if (n < GATHERING_MIN) {
      const need = GATHERING_MIN - n;
      label = isIs ? `Valdar: ${n} — þarft ${need} til viðbótar` : `Selected: ${n} — ${need} more to begin`;
    } else if (n >= GATHERING_MAX) {
      label = isIs ? `Valdar: ${n} — hámark náð` : `Selected: ${n} — maximum reached`;
    } else {
      label = isIs ? `Valdar: ${n} — tilbúið til að vefa` : `Selected: ${n} — ready to weave`;
    }
    counterEl.textContent = label;
  }
  const weaveBtn = document.getElementById('whispers-weave-btn');
  if (weaveBtn) weaveBtn.disabled = n < GATHERING_MIN;
}

function cancelWhispers() {
  _selectedEntries = [];
  _whispersMode    = 'idle';
  _clearJcardSelections();
  updateWhispersUI();
}

function _clearJcardSelections() {
  document.querySelectorAll('.jcard.whispers-selected').forEach(c => c.classList.remove('whispers-selected'));
  const isIs = lang === 'is';
  document.querySelectorAll('.jcard-select-btn').forEach(b => {
    b.textContent = t('jcard_select');
    b.classList.remove('selected');
  });
}

function buildWhispersPrompt(entries, name) {
  const isIs     = lang === 'is';
  const n        = entries.length;
  const runeParts = entries.map(e => `${e.rune_glyph || ''} ${e.rune_name || ''}`.trim()).join(', ');
  const areas     = [...new Set(entries.map(e => e.area).filter(Boolean))];
  const seekings  = [...new Set(entries.map(e => e.seeking).filter(Boolean))];

  if (isIs) {
    return [
      name ? `${name} ber ${n} rúnur að þér: ${runeParts}.` : `${n} rúnur eru bornar að þér: ${runeParts}.`,
      areas.length    ? `Svið lífsins: ${areas.join(', ')}.`   : '',
      seekings.length ? `Leitað er: ${seekings.join(', ')}.`   : '',
      '',
      `Talaðu eins og Rúnar. Þessar ${n} raddir hafa safnast — hver ber hluta af stærri sannleika.`,
      'Vindu þær saman í eitt óbrotið ráð. Túlkaðu þær ekki sér.',
      'Finndu mynstrið sem þær mynda saman — þráðinn sem tengir þær, spennan á milli þeirra,',
      'það sem þær opinbera þegar þær eru séðar sem ein mynd.',
      'Talaðu djúpt. Taktu þér tíma. Leitandinn biður um fyllstu rödd þína.',
    ].filter(Boolean).join('\n');
  } else {
    return [
      name ? `${name} brings ${n} runes before you: ${runeParts}.` : `${n} runes are brought before you: ${runeParts}.`,
      areas.length    ? `Area of life: ${areas.join(', ')}.`   : '',
      seekings.length ? `Seeking: ${seekings.join(', ')}.`     : '',
      '',
      `Speak as Rúnar. These ${n} voices have gathered — each carries a piece of the greater truth.`,
      "Weave them into one unbroken counsel. Do not interpret them separately.",
      "Find the pattern they form together — the thread that connects them, the tension between them,",
      "what they reveal when seen as one picture.",
      "Speak deeply. Take your time. The seeker asks for your fullest voice.",
    ].filter(Boolean).join('\n');
  }
}

// Save a completed Gathering to the readings table so it appears in the journal
async function saveGathering(text, entries) {
  if (!currentUser || !text || !entries?.length) return;
  // short_text holds the rune display string; deep_text holds the full reading
  const runeDisplay = entries.map(e =>
    `${e.rune_glyph || ''} ${(e.rune_name || '').toUpperCase()}`.trim()
  ).join(' · ');
  try {
    await sb.from('readings').insert({
      user_id:      currentUser.id,
      rune_name:    'THE GATHERING',
      rune_glyph:   '✦',
      lang:         lang,
      short_text:   runeDisplay,   // "ᚹ WUNJO · ᛉ ALGIZ · …"
      deep_text:    text,          // full gathering reading
      area:         'gathering',   // special marker — drives journal filter
      seeking:      null,
      question:     null,
      life_rune:    null,
      credits_used: false,
    });
    // Reload journal so the new entry appears immediately
    loadJournal();
  } catch(e) { console.warn('saveGathering:', e.message); }
}

async function generateWhispersReading() {
  if (_selectedEntries.length < GATHERING_MIN) return;
  _whispersMode = 'loading';
  _whispersText = '';
  updateWhispersUI();

  try {
    const sysPrompt = buildSysPrompt(activeChar, lang);
    const name      = readerUser?.name || '';
    const userMsg   = buildWhispersPrompt(_selectedEntries, name);

    const session  = await sb.auth.getSession();
    const token    = session?.data?.session?.access_token;
    const authHdr  = token ? { Authorization: `Bearer ${token}` } : {};

    const resp = await fetch(PROXY, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr },
      body:    JSON.stringify({
        user_id:    currentUser?.id,
        lang,
        prompt:     userMsg,
        system:     sysPrompt,
        max_tokens: 1200,
        mode:       'ceremonial',
        use_credit: false,
      }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    const rawText = data.content?.[0]?.text || data.text || '';
    if (!rawText) throw new Error('Empty response');
    const text = applyISCorrections(rawText, lang, corrections);

    _whispersText = text;
    _whispersMode = 'output';
    _markGatheringUsed();


    // Save to journal so it appears in Your Readings
    await saveGathering(text, _selectedEntries);
    updateWhispersUI();
    _clearJcardSelections();

    // Runes row
    const runesRow = document.getElementById('whispers-runes-row');
    if (runesRow) {
      runesRow.innerHTML = _selectedEntries.map((e, i) =>
        (i > 0 ? '<span class="whispers-rune-sep">·</span>' : '') +
        `<span class="whispers-rune-chip">${e.rune_glyph || ''} ${(e.rune_name || '').toUpperCase()}</span>`
      ).join('');
    }

    // Stream word by word
    const outEl = document.getElementById('whispers-out-text');
    if (outEl) {
      outEl.textContent = '';
      const words = text.split(' ');
      let wi = 0;
      const tick = setInterval(() => {
        if (wi >= words.length) { clearInterval(tick); return; }
        outEl.textContent += (wi > 0 ? ' ' : '') + words[wi++];
      }, APP.stream_delay_ms);
    }

    // Scroll to output section
    setTimeout(() => {
      const wSection = document.getElementById('whispers-section');
      if (wSection) wSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

  } catch(e) {
    _whispersMode = 'idle';
    updateWhispersUI();
    const st = document.getElementById('st-whispers');
    if (st) { st.textContent = t('error_prefix') + e.message; st.className = 'status err'; }
  }
}

async function generateWhispersVoice() {
  const btn = document.getElementById('whispers-voice-btn');
  if (!btn || !_whispersText) return;
  const isIs = lang === 'is';
  btn.disabled    = true;
  btn.textContent = t('voice_btn_loading');

  try {
    const session = await sb.auth.getSession();
    const token   = session?.data?.session?.access_token;
    const resp    = await fetch(EL_PROXY, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body:    JSON.stringify({
        text:     _whispersText,
        voice_id: elVoiceId(lang),
        model_id: elModel(lang),
        voice_settings: EL_VOICE_SETTINGS,
        lang,
        user_id: currentUser?.id,
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    if (!data.audio_url) throw new Error('No audio_url');
    const blob = await fetch(data.audio_url).then(r => r.blob());
    const url  = URL.createObjectURL(blob);
    const audio = document.getElementById('whispers-audio');
    const wrap  = document.getElementById('whispers-audio-wrap');
    if (audio && wrap) {
      audio.src = url;
      wrap.style.display = 'block';
      const wcapBtn = document.getElementById('wcap-play');
      const wcapSeekEl = document.getElementById('wcap-seek');
      if (wcapBtn) wcapBtn.textContent = '▶';
      if (wcapSeekEl) wcapSeekEl.value = 0;
      audio.play().catch(() => {});
    }
    btn.textContent = t('voice_player_lbl');
    btn.style.opacity = '0.55';
    btn.disabled = true;
  } catch(e) {
    btn.disabled    = false;
    btn.textContent = t('voice_btn');
    btn.disabled = false;
    const st = document.getElementById('st-whispers');
    if (st) { st.textContent = t('error_prefix') + e.message; st.className = 'status err'; }
  }
}

function resetWhispers() {
  _selectedEntries = [];
  _whispersText    = '';
  _whispersMode    = 'idle';
  _clearJcardSelections();
  const outEl = document.getElementById('whispers-out-text');
  if (outEl) outEl.textContent = '';
  const runesRow = document.getElementById('whispers-runes-row');
  if (runesRow) runesRow.innerHTML = '';
  const wrap = document.getElementById('whispers-audio-wrap');
  if (wrap) {
    wrap.style.display = 'none';
    const a = document.getElementById('whispers-audio');
    if (a) a.src = '';
    const wcapBtn = document.getElementById('wcap-play');
    if (wcapBtn) wcapBtn.textContent = '▶';
    const wcapSeekEl = document.getElementById('wcap-seek');
    if (wcapSeekEl) wcapSeekEl.value = 0;
  }
  const vBtn = document.getElementById('whispers-voice-btn');
  if (vBtn) { vBtn.disabled = false; vBtn.style.opacity = ''; }
  const st = document.getElementById('st-whispers');
  if (st) { st.textContent = ''; st.className = 'status'; }
  updateWhispersUI();
}


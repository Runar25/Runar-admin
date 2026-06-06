// ═══════════════════════════════════════════════════════
// RÚNAR · JOURNAL
// DB load, render, filter, audio playback for reading journal
// Depends on globals: lang, currentUser, userTier, sb
// Depends on functions: t(), _makeCapPlayer(), _capWire(),
//   updateWhispersUI() [runar-gathering.js]
// ═══════════════════════════════════════════════════════

// ─── DB: JOURNAL ─────────────────────────────────────────
// Limit podle tieru: z TIER_LIMITS configu — Rule §8
function journalLimit() {
  if (userTier === 'standard' || userTier === 'premium') return null;
  return TIER_LIMITS.rune_seeker.journal_entries;  // zmenit v runar-config.js
}

async function loadJournal() {
  if (!currentUser) { hideJournal(); return; }
  try {
    let q = sb.from('readings')
      .select('id, rune_name, rune_glyph, lang, short_text, deep_text, area, seeking, question, life_rune, credits_used, drawn_at')
      .eq('user_id', currentUser.id)
      .order('drawn_at', { ascending: false });
    const lim = journalLimit();
    if (lim) q = q.limit(lim);
    const { data } = await q;
    _journalCache = data || [];
    renderJournal(_journalCache);
    if (userTier === 'standard' || userTier === 'premium') {
      populateJournalFilters(_journalCache);
    } else {
      updateJournalTeaser();
    }
  } catch(e) { hideJournal(); }
}

function hideJournal() {
  const gate    = document.getElementById('journal-gate');
  const content = document.getElementById('journal-content');
  if (gate)    gate.style.display    = 'block';
  if (content) content.style.display = 'none';
}

function renderJournal(entries) {
  const list = document.getElementById('journal-list');
  if (!list) return;

  const gate    = document.getElementById('journal-gate');
  const content = document.getElementById('journal-content');

  if (!currentUser) { hideJournal(); return; }
  if (gate)    gate.style.display    = 'none';
  if (content) content.style.display = 'block';

  const isStandard = userTier === 'standard' || userTier === 'premium';
  const isIs = lang === 'is';

  // Header counts
  const titleEl = document.getElementById('journal-pane-title');
  const countEl = document.getElementById('journal-pane-count');
  if (titleEl) titleEl.textContent = t('journal_title');
  if (countEl) countEl.textContent = entries.length === 0 ? '' : isStandard
    ? (isIs ? `${entries.length} lestrar` : `${entries.length} readings`)
    : (isIs ? `${entries.length} nýlegastir` : `last ${entries.length}`);

  // Filter bar
  const filterBar = document.getElementById('journal-filter-bar');
  if (filterBar) filterBar.style.display = isStandard ? 'flex' : 'none';

  // Empty state
  if (entries.length === 0) {
    list.innerHTML = `<div class="journal-empty">${t('journal_empty')}</div>`;
    return;
  }

  list.innerHTML = entries.map((e, i) => {
    const d       = new Date(e.drawn_at);
    const locale  = isIs ? 'is-IS' : 'en-GB';
    const dateStr = d.toLocaleDateString(locale, { day:'numeric', month:'short', year:'numeric' });
    const safeRune = (e.rune_name || '').replace(/'/g, "\\'");
    const safeLang = (e.lang || '').replace(/'/g, "\\'");
    const isGathering = e.area === 'gathering';

    if (isGathering) {
      // ── THE GATHERING card ──
      const excerpt = (e.deep_text || '').trim().slice(0, 160);
      return `<div class="jcard" id="jcard-${i}">
        <div class="jcard-header" onclick="toggleJournalEntry(${i})">
          <div class="jcard-left">
            <div class="jcard-glyph" style="opacity:0.7;">✦</div>
            <div class="jcard-info">
              <div class="jcard-name">✦ ${t('ritual_gathering')} · ${(e.lang || '').toUpperCase()}</div>
              <div class="jcard-date">${dateStr}</div>
              <div class="jcard-gathering-runes">${e.short_text || ''}</div>
              <div class="jcard-excerpt">${excerpt}${excerpt.length >= 160 ? '…' : ''}</div>
            </div>
          </div>
          <div class="jcard-arrow" id="jarr-${i}">▾</div>
        </div>
        <div class="jcard-body" id="jbody-${i}" style="display:none;">
          <div class="jcard-layer-lbl">✦ ${t('ritual_gathering_jcard')}</div>
          <div class="jcard-text" style="font-style:italic;line-height:1.9;">${e.deep_text || ''}</div>
        </div>
      </div>`;
    }

    // ── Regular reading card ──
    const excerpt = (e.short_text || '').trim().slice(0, 160);
    const areaStr = e.area ? ` · ${e.area}` : '';
    return `<div class="jcard" id="jcard-${i}">
      <div class="jcard-header" onclick="toggleJournalEntry(${i})">
        <div class="jcard-left">
          <div class="jcard-glyph">${e.rune_glyph || '◻'}</div>
          <div class="jcard-info">
            <div class="jcard-name">${(e.rune_name || '').toUpperCase()} · ${(e.lang || '').toUpperCase()}</div>
            <div class="jcard-date">${dateStr}${areaStr}</div>
            <div class="jcard-excerpt">${excerpt}${excerpt.length >= 160 ? '…' : ''}</div>
            <button class="jcard-select-btn" id="jselect-btn-${i}" onclick="event.stopPropagation();toggleRuneSelection(${i})">${t('jcard_select')}</button>
          </div>
        </div>
        <div class="jcard-arrow" id="jarr-${i}">▾</div>
      </div>
      <div class="jcard-body" id="jbody-${i}" style="display:none;">
        <div class="jcard-layer-lbl">${t('layer1_lbl')}</div>
        <div class="jcard-text">${e.short_text || ''}</div>
        ${e.deep_text ? `
        <div class="jcard-divider">· · ·</div>
        <div class="jcard-layer-lbl">${t('layer2_lbl')}</div>
        <div class="jcard-text">${e.deep_text}</div>` : ''}
        ${e.question ? `<div class="jcard-question">❝ ${e.question} ❞</div>` : ''}
        ${e.life_rune ? `<div class="jcard-life-rune">${t('life_rune_short')}: ${e.life_rune}</div>` : ''}
        <button class="jcard-audio-btn" id="jaudio-btn-${i}" onclick="playJournalAudio('${safeRune}','${safeLang}',${i})">${t('jcard_audio_btn')}</button>
        <div class="jcard-audio-player" id="jaudio-${i}"></div>
      </div>
    </div>`;
  }).join('');

  updateWhispersUI();
}

// Teaser pro rune_seeker — kolik čtení celkem mají v DB
async function updateJournalTeaser() {
  if (userTier === 'standard' || userTier === 'premium') return;
  const teaser = document.getElementById('journal-standard-teaser');
  const txt    = document.getElementById('journal-teaser-txt');
  if (!teaser || !txt || !currentUser) return;
  try {
    const { count } = await sb.from('readings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    if (count && count > 5) {
      const isIs = lang === 'is';
      txt.innerHTML = isIs
        ? `Sérhver lestur sem þú hefur tekið er geymdur — ${count} samtals. Farðu yfir í <strong style="color:var(--gold);font-style:normal;">Rune Walker</strong> til að opna fulla króniku þína.`
        : `Every reading you have ever taken is kept — ${count} in total. Move to <strong style="color:var(--gold);font-style:normal;">Rune Walker</strong> to open your full journal.`;
      teaser.style.display = 'block';
    }
  } catch { /* silent */ }
}

// Filter journal (Rune Walker+) — data loaded in memory
let _journalCache = [];
function filterJournal() {
  if (!_journalCache.length) return;
  const rune = document.getElementById('jf-rune')?.value || '';
  const area = document.getElementById('jf-area')?.value || '';
  const jlng = document.getElementById('jf-lang')?.value || '';
  const filtered = _journalCache.filter(e => {
    const isGathering = e.area === 'gathering';
    if (isGathering) {
      // Gathering entries: ignore rune filter (multiple runes), respect area + lang
      return (!area || area === 'gathering') && (!jlng || e.lang === jlng);
    }
    // Normal entries: hide if area filter is set to gathering
    if (area === 'gathering') return false;
    return (!rune || e.rune_name === rune) &&
           (!area || e.area === area) &&
           (!jlng || e.lang === jlng);
  });
  renderJournal(filtered);
}

// Populate filter selectors from journal data
function populateJournalFilters(entries) {
  const runeEl = document.getElementById('jf-rune');
  const areaEl = document.getElementById('jf-area');
  if (!runeEl || !areaEl) return;
  // Exclude Gathering entries from the rune dropdown (they have no single rune)
  const normal = entries.filter(e => e.area !== 'gathering');
  const runes  = [...new Set(normal.map(e => e.rune_name).filter(Boolean))].sort();
  const areas  = [...new Set(normal.map(e => e.area).filter(Boolean))].sort();
  const hasGathering = entries.some(e => e.area === 'gathering');
  runeEl.innerHTML = `<option value="">All runes</option>` + runes.map(r => `<option value="${r}">${r}</option>`).join('');
  areaEl.innerHTML = `<option value="">All areas</option>`
    + (hasGathering ? `<option value="gathering">✦ The Gathering</option>` : '')
    + areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

function toggleJournalEntry(i) {
  const body  = document.getElementById(`jbody-${i}`);
  const arrow = document.getElementById(`jarr-${i}`);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) arrow.classList.toggle('open', !open);
}

async function playJournalAudio(runeName, eLang, i) {
  const btn    = document.getElementById(`jaudio-btn-${i}`);
  const player = document.getElementById(`jaudio-${i}`);
  if (!btn || !player) return;
  btn.disabled = true;
  const isIs = lang === 'is';
  btn.textContent = t('audio_loading');
  try {
    const { data: rows } = await sb.from('runar_static_audio')
      .select('audio_url, version')
      .eq('rune_name', runeName)
      .eq('lang', eLang.toLowerCase())
      .eq('ready', true);
    if (!rows || rows.length === 0) {
      btn.textContent = t('audio_none');
      btn.disabled = false;
      return;
    }
    const pick = rows[Math.floor(Math.random() * rows.length)];
    var jprefix = 'j' + i;
    player.innerHTML = _makeCapPlayer(jprefix, pick.audio_url, true);
    _capWire(jprefix, true);
    btn.textContent  = t('audio_playing');
    btn.style.opacity = '0.45';
  } catch {
    btn.textContent = t('audio_error');
    btn.disabled = false;
  }
}


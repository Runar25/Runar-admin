// ═══════════════════════════════════════════════════════
// RÚNAR — Reader App Logic
// Extracted from runar-reader.html
// Depends on: runar-config.js, runar-runes.js,
//             runar-translations.js, runar-character.js, runar-svgs.js
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// RÚNAR · READER — user-facing
// ═══════════════════════════════════════════════════════

const sb = supabase.createClient(SB_URL, SB_KEY);

// ─── STATE ──────────────────────────────────────────────
let lang           = APP.default_lang;
let activeChar     = null;
let currentUser    = null;
let userTier       = 'free';    // 'free' | 'credits' | 'standard' | 'premium'
let userCredits    = 0;         // credits_balance from user_profiles
let readerUser     = {};
let greetingShown  = false;     // show topbar greeting only once per session
let userName       = '';        // display name from user_profiles.name
let readerRune     = null;
let readerTexts    = {};  // { en: {short,deep}, is: {short,deep} }
let voiceGenerated = {};  // { en: bool, is: bool }
let pendingLang    = null;
let corrections    = [];

const FREE_TRIAL_LIMIT      = 3;
const FREE_REGISTERED_LIMIT = 5;

function getTrialCount() { return parseInt(localStorage.getItem('runar_trial_count') || '0'); }
function incTrialCount() { localStorage.setItem('runar_trial_count', String(getTrialCount() + 1)); }

// Monthly reading counter for logged-in free users (keyed by userId + YYYY-MM)
function freeMonthKey(userId) {
  const d = new Date();
  return `runar_free_${userId}_${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}`;
}
function getFreeMonthCount(userId) { return parseInt(localStorage.getItem(freeMonthKey(userId)) || '0'); }
function incFreeMonthCount(userId) { localStorage.setItem(freeMonthKey(userId), String(getFreeMonthCount(userId) + 1)); }

// Datum příštího resetu (1. příštího měsíce)
function nextResetDate() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}
function nextResetLabel(isIs) {
  const r = nextResetDate();
  const months = isIs
    ? ['jan','feb','mar','apr','maí','jún','júl','ágú','sep','okt','nóv','des']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return isIs
    ? `Endurnýjast ${r.getDate()}. ${months[r.getMonth()]}`
    : `Resets ${months[r.getMonth()]} ${r.getDate()}`;
}

// Reset notifikace — zobrazí se jen jednou po prvním přihlášení v novém měsíci
function resetNotifKey(userId) {
  const d = new Date();
  return `runar_reset_notified_${userId}_${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}`;
}
function checkAndShowResetNotif(userId) {
  if (!userId) return;
  const key = resetNotifKey(userId);
  if (localStorage.getItem(key)) return; // už viděl tento měsíc
  // Najdi minulý měsíc — pokud existuje záznam o čtení, je to po resetu
  const d = new Date();
  const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const prevKey = `runar_free_${userId}_${prevMonth.getFullYear()}_${String(prevMonth.getMonth()+1).padStart(2,'0')}`;
  const hadReadings = parseInt(localStorage.getItem(prevKey) || '0') > 0;
  localStorage.setItem(key, '1'); // označit jako viděno
  if (!hadReadings) return; // první přihlášení (žádná minulá čtení) → netisknout
  showResetModal();
}
function showResetModal() {
  const el = document.getElementById('reset-notif-modal');
  if (!el) return;
  const isIs = lang === 'is';
  const setText2 = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  setText2('reset-notif-title', isIs ? 'LESTRAR ÞÍNIR ERU ENDURNÝJAÐIR' : 'YOUR READINGS HAVE RENEWED');
  setText2('reset-notif-body',  isIs
    ? 'Nýr mánuður — fimm frjáls lestur eru aftur að bíða þín. Steinarnir eru tilbúnir.'
    : 'A new month has turned. Five free readings are waiting for you again. The stones are ready.');
  setText2('reset-notif-btn', isIs ? 'HALDA ÁFRAM' : 'CONTINUE');
  el.classList.add('open');
}
function closeResetModal() {
  const el = document.getElementById('reset-notif-modal');
  if (el) el.classList.remove('open');
}

// ── Delete Account ──────────────────────────────────────
function openDeleteModal() {
  const isIs = lang === 'is';
  const el = document.getElementById('delete-account-modal');
  if (!el) return;
  document.getElementById('dam-title').textContent   = isIs ? 'EYÐA REIKNINGI?' : 'DELETE YOUR ACCOUNT?';
  document.getElementById('dam-body').textContent    = isIs
    ? 'Þetta eyðir reikningi þínum, öllum lestrum og dagbókina að eilífu. Hægt er ekki að afturkalla þessa aðgerð.'
    : 'This will permanently erase your account, all readings, and your journal. This cannot be undone.';
  document.getElementById('dam-confirm').textContent = isIs ? 'EYÐA' : 'DELETE';
  document.getElementById('dam-cancel').textContent  = isIs ? 'HÆTTA VIÐ' : 'CANCEL';
  document.getElementById('dam-error').style.display = 'none';
  el.classList.add('open');
}
function closeDeleteModal() {
  const el = document.getElementById('delete-account-modal');
  if (el) el.classList.remove('open');
}
async function confirmDeleteAccount() {
  const confirmBtn = document.getElementById('dam-confirm');
  const errEl      = document.getElementById('dam-error');
  const isIs       = lang === 'is';

  confirmBtn.disabled    = true;
  confirmBtn.textContent = isIs ? 'EYÐIR...' : 'DELETING...';
  errEl.style.display    = 'none';

  try {
    const session = await sb.auth.getSession();
    const token   = session.data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const res  = await fetch('https://pmitxjvkeovijreepror.supabase.co/functions/v1/delete-account', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Unknown error');

    // Success — sign out locally and reload
    await sb.auth.signOut();
    localStorage.clear();
    location.reload();

  } catch (e) {
    confirmBtn.disabled    = false;
    confirmBtn.textContent = isIs ? 'EYÐA' : 'DELETE';
    errEl.textContent      = e.message;
    errEl.style.display    = 'block';
  }
}

// ─── DB: USER PROFILE ────────────────────────────────────
async function fetchUserProfile(userId) {
  try {
    const { data } = await sb.from('user_profiles')
      .select('tier, credits_balance, name, lang')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      userTier    = data.tier            || 'rune_seeker';
      // Normalize legacy DB values → rune_seeker
      if (userTier === 'free' || userTier === 'credits') userTier = 'rune_seeker';
      // Admins always get full premium access for testing
      if (isAdmin(currentUser?.email)) userTier = 'premium';
      userCredits = data.credits_balance || 0;
      userName    = data.name            || '';
      // Restore language preference
      // Priority: localStorage (active user choice) > DB default
      // If localStorage has a lang that matches current lang → user chose it while logged out;
      // save it to DB instead of overriding with the DB default ('en').
      if (data.lang && data.lang !== lang) {
        const localLang = localStorage.getItem('runar_lang');
        if (localLang && localLang === lang) {
          // User chose a language while logged out — persist to their profile, keep it
          sb.from('user_profiles').update({ lang: localLang }).eq('id', userId).then(() => {});
        } else {
          // DB has a meaningful preference (set on another device) — apply it
          lang = data.lang;
          applyLangToggle(lang);
          updateSidePanelLang();
          updateUIText();
        }
      }
    }
  } catch(e) { console.warn('fetchUserProfile:', e.message); }
  updateAuthUI();
  showTopbarGreeting();
  showHeroGreeting();
  // Ask for name if not set yet (delay so UI settles first)
  if (!userName) setTimeout(showNamePrompt, 1200);
}

async function upsertProfile() {
  if (!currentUser) return;
  try {
    // Insert row if it doesn't exist yet — all columns have DB defaults.
    // ignoreDuplicates: true → ON CONFLICT DO NOTHING (no overwrite of existing data)
    await sb.from('user_profiles')
      .upsert({ id: currentUser.id }, { onConflict: 'id', ignoreDuplicates: true });
  } catch(e) { console.warn('upsertProfile:', e.message); }
}

// ─── DB: READINGS ────────────────────────────────────────
async function saveReading(rune, short, deep) {
  if (!currentUser) return;
  try {
    // Životní runa — pokud ji známe z data narození
    const lifeRune = readerUser.dob ? (calcLifeRune(readerUser.dob)?.n || null) : null;
    await sb.from('readings').insert({
      user_id:      currentUser.id,
      rune_name:    rune.n,
      rune_glyph:   rune.g,
      lang:         lang,
      short_text:   short,
      deep_text:    deep,
      area:         readerUser.area     || null,
      seeking:      readerUser.seeking  || null,
      question:     readerUser.question || null,
      life_rune:    lifeRune,
      credits_used: shouldUseCredit(),   // true = kreditní čtení, false = free monthly
    });
  } catch(e) { console.warn('saveReading:', e.message); }
}

// Sync monthly count from DB → localStorage (accurate, multi-device)
async function syncMonthlyCount(userId) {
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  try {
    const { count } = await sb.from('readings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('drawn_at', start.toISOString());
    if (count !== null) {
      localStorage.setItem(freeMonthKey(userId), String(count));
      updateAuthUI();
    }
  } catch(e) { console.warn('syncMonthlyCount:', e.message); }
}

// ─── DB: JOURNAL ─────────────────────────────────────────
// Limit podle tieru: rune_seeker = 5, standard/premium = bez limitu
function journalLimit() {
  if (userTier === 'standard' || userTier === 'premium') return null;
  return 5;
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
  if (titleEl) titleEl.textContent = isIs ? '✦ LESTRAR ÞÍNIR' : '✦ YOUR READINGS';
  if (countEl) countEl.textContent = entries.length === 0 ? '' : isStandard
    ? (isIs ? `${entries.length} lestrar` : `${entries.length} readings`)
    : (isIs ? `${entries.length} nýlegastir` : `last ${entries.length}`);

  // Filter bar
  const filterBar = document.getElementById('journal-filter-bar');
  if (filterBar) filterBar.style.display = isStandard ? 'flex' : 'none';

  // Empty state
  if (entries.length === 0) {
    list.innerHTML = `<div class="journal-empty">${isIs ? 'Engar skráðar lestrar enn.<br>Dragðu fyrstu rúnina þína.' : 'No readings recorded yet.<br>Draw your first rune.'}</div>`;
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
              <div class="jcard-name">✦ THE GATHERING · ${(e.lang || '').toUpperCase()}</div>
              <div class="jcard-date">${dateStr}</div>
              <div class="jcard-gathering-runes">${e.short_text || ''}</div>
              <div class="jcard-excerpt">${excerpt}${excerpt.length >= 160 ? '…' : ''}</div>
            </div>
          </div>
          <div class="jcard-arrow" id="jarr-${i}">▾</div>
        </div>
        <div class="jcard-body" id="jbody-${i}" style="display:none;">
          <div class="jcard-layer-lbl">✦ ${isIs ? 'SAFN RÚNANNA' : 'THE GATHERING'}</div>
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
            <button class="jcard-select-btn" id="jselect-btn-${i}" onclick="event.stopPropagation();toggleRuneSelection(${i})">${isIs ? '★ VELJA' : '★ SELECT'}</button>
          </div>
        </div>
        <div class="jcard-arrow" id="jarr-${i}">▾</div>
      </div>
      <div class="jcard-body" id="jbody-${i}" style="display:none;">
        <div class="jcard-layer-lbl">${isIs ? '✦ RÚNAR TALAR' : '✦ RÚNAR SPEAKS'}</div>
        <div class="jcard-text">${e.short_text || ''}</div>
        ${e.deep_text ? `
        <div class="jcard-divider">· · ·</div>
        <div class="jcard-layer-lbl">${isIs ? '~ DÝPRI HUGLEIÐING' : '~ DEEPER REFLECTION'}</div>
        <div class="jcard-text">${e.deep_text}</div>` : ''}
        ${e.question ? `<div class="jcard-question">❝ ${e.question} ❞</div>` : ''}
        ${e.life_rune ? `<div class="jcard-life-rune">${isIs ? 'Lífsrún' : 'Life rune'}: ${e.life_rune}</div>` : ''}
        <button class="jcard-audio-btn" id="jaudio-btn-${i}" onclick="playJournalAudio('${safeRune}','${safeLang}',${i})">${isIs ? '♪ HLUSTA Á RÚNAR' : "♪ RÚNAR'S VOICE"}</button>
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
        ? `Sérhver lestur sem þú hefur tekið er geymdur — ${count} samtals. Farðu yfir í <strong style="color:var(--gold);font-style:normal;">Standard</strong> til að opna fulla króniku þína.`
        : `Every reading you have ever taken is kept — ${count} in total. Move to <strong style="color:var(--gold);font-style:normal;">Standard</strong> to open your full journal.`;
      teaser.style.display = 'block';
    }
  } catch { /* silent */ }
}

// Filter journal (Standard only) — data loaded in memory
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
  btn.textContent = isIs ? '♪ HLEÐ…' : '♪ LOADING…';
  try {
    const { data: rows } = await sb.from('runar_static_audio')
      .select('audio_url, version')
      .eq('rune_name', runeName)
      .eq('lang', eLang.toLowerCase())
      .eq('ready', true);
    if (!rows || rows.length === 0) {
      btn.textContent = isIs ? '— Ekkert hljóð tiltækt' : '— No audio available';
      btn.disabled = false;
      return;
    }
    const pick = rows[Math.floor(Math.random() * rows.length)];
    var jprefix = 'j' + i;
    player.innerHTML = _makeCapPlayer(jprefix, pick.audio_url, true);
    _capWire(jprefix, true);
    btn.textContent  = isIs ? '♪ SPILANDI' : '♪ NOW PLAYING';
    btn.style.opacity = '0.45';
  } catch {
    btn.textContent = isIs ? '— Villa' : '— Error';
    btn.disabled = false;
  }
}

// ─── GENERIC SECONDARY CAP PLAYER ───────────────────────
// Used by collection modal and journal entries.
// prefix = unique string (e.g. 'coll', 'j0', 'j3')
function _makeCapPlayer(prefix, src, autoplay) {
  return '<audio id="' + prefix + '-a" src="' + src + '" preload="none"' + (autoplay ? ' autoplay' : '') + '></audio>'
       + '<div class="cap" style="margin-top:0;">'
       + '<button class="cap-btn" id="' + prefix + '-pb" onclick="_capPlay(\'' + prefix + '\')" title="Play / Pause">&#9654;</button>'
       + '<span class="cap-time" id="' + prefix + '-ct">0:00</span>'
       + '<input type="range" class="cap-seek" id="' + prefix + '-sk" value="0" min="0" max="100" step="0.1" oninput="_capSeekTo(\'' + prefix + '\',this.value)" title="Seek">'
       + '<span class="cap-time" id="' + prefix + '-dr">0:00</span>'
       + '</div>';
}
function _capFmt(s) { var m = Math.floor(s / 60); return m + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }
function _capPlay(p) {
  var a = document.getElementById(p + '-a');
  var b = document.getElementById(p + '-pb');
  if (!a) return;
  if (a.paused) { a.play(); if (b) b.innerHTML = '&#9646;&#9646;'; }
  else          { a.pause(); if (b) b.innerHTML = '&#9654;'; }
}
function _capSeekTo(p, v) {
  var a = document.getElementById(p + '-a');
  if (a && a.duration) a.currentTime = (v / 100) * a.duration;
}
function _capWire(p, doPlay) {
  var a  = document.getElementById(p + '-a');
  var sk = document.getElementById(p + '-sk');
  var ct = document.getElementById(p + '-ct');
  var dr = document.getElementById(p + '-dr');
  var pb = document.getElementById(p + '-pb');
  if (!a) return;
  a.addEventListener('timeupdate', function() {
    if (ct) ct.textContent = _capFmt(a.currentTime);
    if (sk && a.duration) sk.value = (a.currentTime / a.duration) * 100;
  });
  a.addEventListener('loadedmetadata', function() {
    if (dr) dr.textContent = _capFmt(a.duration);
  });
  a.addEventListener('ended', function() {
    if (pb) pb.innerHTML = '&#9654;';
    if (sk) sk.value = 0;
    if (ct) ct.textContent = '0:00';
  });
  if (doPlay) {
    a.addEventListener('canplay', function() { _capPlay(p); }, { once: true });
  }
}

// ─── THE GATHERING ───────────────────────────────────────
// Ritual: user picks 3–7 runes from journal → 1200-token combined reading
// Once per week (ISO Monday-based). Future: cacao + meditation mode (see CLAUDE.md)

let _whispersMode    = 'idle'; // 'idle' | 'selecting' | 'loading' | 'output'
let _selectedEntries = [];     // 3–7 journal entries chosen by user
let _whispersText    = '';     // generated reading text (for voice)

const GATHERING_MIN     = 3;
const GATHERING_MAX     = 7;
const GATHERING_CREDITS = 3; // credits cost for Rune Seeker

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
  const hasEnough    = _journalCache.length >= GATHERING_MIN;
  const usedAlready  = _gatheringUsedThisWeek();
  const seekerCanPay = isSeeker && userCredits >= GATHERING_CREDITS;

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
    if (idleSub) idleSub.textContent = isIs
      ? `The Gathering kostar ${GATHERING_CREDITS} lesturarkort.`
      : `The Gathering costs ${GATHERING_CREDITS} reading credits.`;
  } else if (isSeeker && !seekerCanPay) {
    // Rune Seeker — not enough credits
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.4'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   { lockEl.style.display = 'block'; lockEl.textContent = isIs ? 'Þú þarft 3 lesturarkort til að opna The Gathering.' : 'You need 3 reading credits to use The Gathering.'; }
    if (needMore) needMore.style.display = 'none';
    if (idleSub) idleSub.textContent = isIs
      ? `The Gathering kostar ${GATHERING_CREDITS} lesturarkort.`
      : `The Gathering costs ${GATHERING_CREDITS} reading credits.`;
  } else if (usedAlready) {
    // Already used this week — button disabled, text visible
    if (reqBtn)   { reqBtn.disabled = true; reqBtn.style.opacity = '0.4'; reqBtn.style.cursor = 'default'; }
    if (lockEl)   { lockEl.style.display = 'block'; lockEl.textContent = isIs ? 'The Gathering hefur þegar verið kallað þennan viku. Komdu aftur í næstu viku.' : 'The Gathering has already spoken this week. Return when the new week begins.'; }
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
    // Standard / Premium / Rune Seeker with credits — available
    if (reqBtn)   { reqBtn.disabled = false; reqBtn.style.opacity = ''; reqBtn.style.cursor = ''; }
    if (lockEl)   lockEl.style.display = 'none';
    if (needMore) needMore.style.display = 'none';
    // Show credit cost for Rune Seeker
    if (idleSub && isSeeker) idleSub.textContent = isIs
      ? `✦ Þessi lestur kostar ${GATHERING_CREDITS} lesturarkort.`
      : `✦ This reading costs ${GATHERING_CREDITS} reading credits.`;
  }

  if (reqBtn) reqBtn.textContent = isIs ? 'BIÐJA UM THE GATHERING' : 'REQUEST THE GATHERING';

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
  if (loadTxt) loadTxt.textContent = isIs ? 'RÚNAR DREGUR MYNSTURIÐ ÚR STEINUNUM.' : 'RÚNAR DRAWS THE PATTERN FROM THE STONES.';

  // Weave button label + state
  const weaveBtn = document.getElementById('whispers-weave-btn');
  if (weaveBtn) {
    const n = _selectedEntries.length;
    weaveBtn.disabled    = n < GATHERING_MIN;
    weaveBtn.textContent = isIs ? 'LÁTUM RÚNAR VEFA' : 'LET RÚNAR WEAVE';
  }

  // Cancel / New buttons
  const cancelBtn = document.getElementById('whispers-cancel-btn');
  if (cancelBtn) cancelBtn.textContent = isIs ? 'HÆTTA VIÐ' : 'CANCEL';
  const newBtn = document.getElementById('whispers-new-btn');
  if (newBtn) newBtn.textContent = isIs ? 'NÝ SAMKOMA' : 'NEW GATHERING';

  // Voice button
  const vBtn = document.getElementById('whispers-voice-btn');
  if (vBtn && !vBtn.disabled) vBtn.textContent = isIs ? 'ᚢ HEYRA RÚNAR TALA' : 'ᚢ HEAR RÚNAR SPEAK';
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
    btn.textContent = nowSelected ? (isIs ? '★ VALIN' : '★ SELECTED') : (isIs ? '★ VELJA' : '★ SELECT');
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
    b.textContent = isIs ? '★ VELJA' : '★ SELECT';
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
        // Rune Seeker pays with credits (bypasses monthly limit); Standard/Premium free
        use_credit: userTier === 'rune_seeker',
      }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    const text = data.content?.[0]?.text || data.text || '';
    if (!text) throw new Error('Empty response');

    _whispersText = text;
    _whispersMode = 'output';
    _markGatheringUsed();

    // Deduct remaining 2 credits for Rune Seeker (proxy already deducted 1 via use_credit:true)
    if (currentUser && userTier === 'rune_seeker') {
      for (let i = 0; i < GATHERING_CREDITS - 1; i++) {
        await sb.rpc('use_credit', { p_user_id: currentUser.id });
      }
      userCredits = Math.max(0, userCredits - GATHERING_CREDITS);
      updateAuthUI();
    }

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
    if (st) { st.textContent = (lang === 'is' ? 'Villa: ' : 'Error: ') + e.message; st.className = 'status err'; }
  }
}

async function generateWhispersVoice() {
  const btn = document.getElementById('whispers-voice-btn');
  if (!btn || !_whispersText) return;
  const isIs = lang === 'is';
  btn.disabled    = true;
  btn.textContent = isIs ? 'ᚢ RÚNAR TALAR…' : 'ᚢ RÚNAR IS SPEAKING…';

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
    btn.textContent = isIs ? '♪ RÚNAR TALAR' : '♪ RÚNAR SPEAKS';
    btn.style.opacity = '0.55';
    btn.disabled = true;
  } catch(e) {
    btn.disabled    = false;
    btn.textContent = isIs ? 'ᚢ HEYRA RÚNAR TALA' : 'ᚢ HEAR RÚNAR SPEAK';
    btn.disabled = false;
    const st = document.getElementById('st-whispers');
    if (st) { st.textContent = (isIs ? 'Villa: ' : 'Error: ') + e.message; st.className = 'status err'; }
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

// ─── AUTH ────────────────────────────────────────────────
function updateAuthUI() {
  const label       = document.getElementById('auth-user-label');
  const btn         = document.getElementById('auth-action-btn');
  const banner      = document.getElementById('trial-banner');
  const freeBanner  = document.getElementById('free-user-banner');
  const gate        = document.getElementById('auth-gate');
  const upgradeGate = document.getElementById('upgrade-gate');
  const content     = document.getElementById('reader-content');

  const creditsBanner = document.getElementById('credits-banner');

  // Journal tab visibility
  const journalTabBtn = document.getElementById('atab-journal');
  if (journalTabBtn) journalTabBtn.style.display = currentUser ? '' : 'none';
  // If logged out while on journal tab — switch to reading
  if (!currentUser && activeAppTab === 'journal') showAppTab('reading');

  if (currentUser) {
    // ── Logged in ──
    label.style.display = 'block';
    label.textContent   = displayName();
    btn.style.display   = 'none';   // SIGN OUT lives in dropdown now
    banner.style.display = 'none';
    gate.style.display   = 'none';

    // ── Standard / Premium — unlimited ──
    if (userTier === 'standard' || userTier === 'premium') {
      freeBanner.style.display    = 'none';
      creditsBanner.style.display = 'none';
      upgradeGate.style.display   = 'none';
      content.style.display       = 'block';
      updateQuestionGate();
      return;
    }

    // ── Rune Seeker — 5 free/month + paid credits ──
    creditsBanner.style.display = 'none';
    const used      = getFreeMonthCount(currentUser.id);
    const remaining = Math.max(0, FREE_REGISTERED_LIMIT - used);
    const isIs      = lang === 'is';

    if (remaining > 0) {
      // Má volné měsíční sloty
      freeBanner.style.display = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = isIs
          ? `${remaining} af ${FREE_REGISTERED_LIMIT} lestrum eftir í þessum mánuði`
          : `${remaining} of ${FREE_REGISTERED_LIMIT} readings remaining this month`;
        cntEl.className = 'tn-counter' + (remaining === 1 ? ' warn' : '');
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = isIs
        ? `Þú gengur sem <strong>Vegfarandi</strong> — ${FREE_REGISTERED_LIMIT} lestar á mánuði, allar tuttugu og fimm rúnirnar opnar, Rúnar hlustandi.<br><br>Þegar þeir eru genginn og steinarnir eiga enn eftir að segja, opnar gjafa-lesturarkort dyrnar. Eitt kort. Jafn margir dragir og þú berð. Engin gildistími, engin áskrift.`
        : `You walk as <strong>Rune Seeker</strong> — ${FREE_REGISTERED_LIMIT} readings each month, all twenty-five runes open, Rúnar listening.<br><br>When they are walked and the stones still have more to say, a reading gift card keeps the door open. One card. As many draws as you carry. No subscription, no expiry.`;
      const btnEl = document.getElementById('tn-curious-btn');
      if (btnEl) { btnEl.textContent = isIs ? '+ GJAFA-LESTURARKORT' : '+ GET A READING GIFT CARD'; btnEl.style.display = ''; }
      upgradeGate.style.display = 'none';
      content.style.display     = 'block';

    } else if (userCredits > 0) {
      // Měsíční vyčerpány, ale má kredity → čtení pokračuje pomocí kreditů
      freeBanner.style.display = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = isIs
          ? `${userCredits} kredit eftir`
          : `${userCredits} reading${userCredits !== 1 ? 's' : ''} remaining`;
        cntEl.className = 'tn-counter';
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = isIs
        ? `Mánaðarlegir lestrar þínir eru uppgengnar. Rúnar mun nota kredit þinn fyrir næsta lestur.`
        : `Your monthly readings are complete. Rúnar will draw from your credits for the next reading.`;
      const btnEl2 = document.getElementById('tn-curious-btn');
      if (btnEl2) btnEl2.style.display = 'none'; // má kredity — nepotřebuje gift card button
      upgradeGate.style.display = 'none';
      content.style.display     = 'block';

    } else {
      // Monthly readings AND credits exhausted — show 0 in banner, form stays visible
      upgradeGate.style.display = 'none';
      freeBanner.style.display  = 'block';
      content.style.display     = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = isIs
          ? `0 af ${FREE_REGISTERED_LIMIT} lestrum eftir í þessum mánuði`
          : `0 of ${FREE_REGISTERED_LIMIT} readings remaining this month`;
        cntEl.className = 'tn-counter warn';
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = isIs
        ? `Þú hefur gengið alla fimm lestrana þína í þessum mánuði. Steinarnir hvíla til næsta mánaðar — eða opnaðu dyrnar með <b>RÚNAR GJAFA-LESTURARKORT</b>. Eitt kort. Engin gildistími, engin áskrift.`
        : `You have walked all five readings this month. The stones rest until the new month — or keep the door open with a <b>READING GIFT CARD</b>. One card. No expiry, no subscription.`;
      const btnEl = document.getElementById('tn-curious-btn');
      if (btnEl) { btnEl.textContent = isIs ? '+ GJAFA-LESTURARKORT' : '+ GET A READING GIFT CARD'; btnEl.style.display = ''; }
    }
  } else {
    // ── Anonymous ──
    label.style.display      = 'none';
    freeBanner.style.display = 'none';
    upgradeGate.style.display = 'none';
    btn.style.display = '';
    btn.textContent   = lang === 'is' ? 'SKRÁ INN' : 'SIGN IN';
    btn.classList.add('signin');
    const remaining = Math.max(0, FREE_TRIAL_LIMIT - getTrialCount());
    if (remaining > 0) {
      // Build Visitor notice
      banner.style.display = 'block';
      const isIs = lang === 'is';
      const cntEl = document.getElementById('trial-count');
      if (cntEl) {
        cntEl.textContent = isIs
          ? `${remaining} af ${FREE_TRIAL_LIMIT} lestrum eftir`
          : `${remaining} of ${FREE_TRIAL_LIMIT} readings remaining`;
        cntEl.className = 'tn-counter' + (remaining === 1 ? ' warn' : '');
      }
      const txtEl = document.getElementById('trial-text');
      if (txtEl) txtEl.innerHTML = isIs
        ? `Þú gengur hér sem <strong>Gestur</strong>. Fehu — rúna upphafsins — opnar rödd sína fyrir þig frítt. Dragðu hana. Hlustaðu á það sem fornir steinar hvísla.<br><br>Þegar þú ert tilbúinn að ganga með allar tuttugu og fimm rúnirnar og heyra Rúnar tala í lestur þinn, vertu <strong>Vegfarandi</strong> — það kostar ekkert.`
        : `You walk here as a <strong>Visitor</strong>. Three readings open before you — draw a rune, ask your question, and hear what Rúnar sees in the stones.<br><br>When you are ready to walk with all twenty-five runes and hear Rúnar speak in your own reading, become a <strong>Rune Seeker</strong> — it costs nothing.`;
      const btnEl = document.getElementById('tn-visitor-btn');
      if (btnEl) btnEl.textContent = isIs ? 'GERAST VEGFARANDI →' : 'BECOME A RUNE SEEKER →';
      gate.style.display    = 'none';
      content.style.display = 'block';
    } else {
      // Trial exhausted — show 0 in banner, form stays visible so visitor can sign up
      gate.style.display   = 'none';
      banner.style.display = 'block';
      content.style.display = 'block';
      const isIs = lang === 'is';
      const cntEl = document.getElementById('trial-count');
      if (cntEl) {
        cntEl.textContent = isIs
          ? `0 af ${FREE_TRIAL_LIMIT} lestrum eftir`
          : `0 of ${FREE_TRIAL_LIMIT} readings remaining`;
        cntEl.className = 'tn-counter warn';
      }
      const txtEl = document.getElementById('trial-text');
      if (txtEl) txtEl.innerHTML = isIs
        ? `Þú hefur notað þrjár ókeypis heimsóknirnar þínar sem Gestur. Vertu <strong>Vegfarandi</strong> — það kostar ekkert og opnar allar tuttugu og fimm rúnirnar.`
        : `Your three free readings as a Visitor are complete. Become a <strong>Rune Seeker</strong> — it costs nothing, and all twenty-five runes open before you.`;
      const btnEl = document.getElementById('tn-visitor-btn');
      if (btnEl) btnEl.textContent = isIs ? 'GERAST VEGFARANDI →' : 'BECOME A RUNE SEEKER →';
    }
  }
  updateQuestionGate();
}

// ── SPECIFIC QUESTION GATE ────────────────────────────────
// Visible only for Standard / Premium. Visitor + Rune Seeker see a teaser.
function updateQuestionGate() {
  const qSection = document.getElementById('q-section');
  const qTeaser  = document.getElementById('q-teaser');
  const qInput   = document.getElementById('r-question');
  if (!qSection || !qTeaser) return;
  const canAsk = (userTier === 'standard' || userTier === 'premium');
  qSection.style.display = canAsk ? 'block' : 'none';
  qTeaser.style.display  = 'none'; // hidden until Premium decision is made
  if (!canAsk && qInput) qInput.value = '';
}

function handleAuthBtn() {
  if (currentUser) sb.auth.signOut();
  else openAuthModal();
}

// ── PWA INSTALL ──────────────────────────────────────────
let _installPrompt = null;

function _isIOS()        { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function _isStandalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  _updateInstallBtn();
});
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  _updateInstallBtn();
});

function _updateInstallBtn() {
  const btn = document.getElementById('sp-install-btn');
  if (!btn) return;
  if (_isStandalone()) { btn.style.display = 'none'; return; }
  // Android/Chrome/Brave: show when prompt is ready
  // iOS Safari: always show (can't detect if installed)
  btn.style.display = (_installPrompt || _isIOS()) ? '' : 'none';
}

async function installPWA() {
  if (_installPrompt) {
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    if (outcome === 'accepted') { _installPrompt = null; _updateInstallBtn(); }
  } else {
    // iOS or no prompt available — show instructions
    const isIs = lang === 'is';
    const title = document.getElementById('install-modal-title');
    const body  = document.getElementById('install-modal-body');
    const btn   = document.getElementById('install-modal-btn');
    if (title) title.textContent = isIs ? 'SETJA UP RÚNAR' : 'INSTALL RÚNAR';
    if (btn)   btn.textContent   = isIs ? 'SKILIÐ' : 'GOT IT';
    if (body) {
      if (_isIOS()) {
        body.innerHTML = isIs
          ? 'Í Safari: ýttu á <strong>Deila</strong> táknið (□↑) neðst á skjánum, veldu síðan <strong>Bæta við heimaskjá</strong> og ýttu á <strong>Bæta við</strong>.'
          : 'In Safari: tap the <strong>Share</strong> button (□↑) at the bottom of your screen, then select <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.';
      } else {
        body.innerHTML = isIs
          ? 'Í Chrome eða Brave: ýttu á <strong>⋮ valmynd</strong> efst til hægri og veldu <strong>Setja upp forrit</strong> eða <strong>Bæta við heimaskjá</strong>.'
          : 'In Chrome or Brave: tap the <strong>⋮ menu</strong> in the top right and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.';
      }
    }
    document.getElementById('install-modal').classList.add('open');
  }
}
function closeInstallModal() {
  document.getElementById('install-modal').classList.remove('open');
}

// Register service worker + auto-reload when a new SW takes over old stale content
if ('serviceWorker' in navigator) {
  // If the page is being served by an outdated SW, reload once the new one activates
  let _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_swRefreshing) return;
    _swRefreshing = true;
    console.log('New service worker activated — reloading for fresh content.');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Runar-admin/v2/sw.js', { scope: '/Runar-admin/v2/' })
      .then(() => _updateInstallBtn())
      .catch(e => console.warn('SW:', e));
  });
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('auth-modal-body').style.display = 'block';
  document.getElementById('auth-modal-success').style.display = 'none';
  setSt('st-auth', '');
  setTimeout(() => document.getElementById('auth-email')?.focus(), 100);
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.id === 'auth-modal')         closeAuthModal();
  if (e.target.id === 'lang-switch-modal')  cancelLangSwitch();
  if (e.target.id === 'delete-account-modal') closeDeleteModal();
});

function toggleRedeem() {
  const sec = document.getElementById('redeem-section');
  const visible = sec.style.display !== 'none';
  sec.style.display = visible ? 'none' : 'block';
  if (!visible) {
    setSt('st-redeem', '');
    setTimeout(() => document.getElementById('redeem-input')?.focus(), 80);
  }
}

async function redeemCode() {
  const input = document.getElementById('redeem-input');
  const code  = input?.value.trim().toUpperCase();
  if (!code) { setSt('st-redeem', 'Enter a code.', 'err'); return; }
  if (!currentUser) { openAuthModal(); return; }

  const btn = document.getElementById('redeem-btn');
  btn.disabled = true;
  setSt('st-redeem', lang === 'is' ? 'Athuga kóða…' : 'Verifying code…');

  try {
    const { data: { session } } = await sb.auth.getSession();
    const res  = await fetch(
      'https://pmitxjvkeovijreepror.supabase.co/functions/v1/redeem-code',
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code }),
      }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      const msgs = {
        'Code not found':        lang === 'is' ? 'Kóði fannst ekki.' : 'Code not found.',
        'Code already used':     lang === 'is' ? 'Þessi kóði hefur þegar verið notaður.' : 'This code has already been used.',
        'Code already redeemed': lang === 'is' ? 'Þessi kóði hefur þegar verið notaður.' : 'This code has already been used.',
        'Not authenticated':     lang === 'is' ? 'Skráðu þig inn fyrst.' : 'Please sign in first.',
        'Invalid session':       lang === 'is' ? 'Skráðu þig inn aftur.' : 'Please sign in again.',
        'rate_limited':          lang === 'is' ? 'Of margar tilraunir. Bíddu 15 mínútur.' : 'Too many attempts. Please wait 15 minutes.',
      };
      setSt('st-redeem', msgs[data.error] || data.error || 'Error.', 'err');
      btn.disabled = false;
      return;
    }

    // Success
    userCredits = data.new_balance;
    userTier    = 'rune_seeker'; // 'credits' je legacy alias — normalizujeme hned
    input.value = '';
    const runeMsg = data.rune_name ? ` · ${data.rune_name}` : '';
    setSt('st-redeem',
      lang === 'is'
        ? `✦ ${data.credits_added} kredit bætt við${runeMsg} — staða: ${data.new_balance}`
        : `✦ ${data.credits_added} credit${data.credits_added !== 1 ? 's' : ''} added${runeMsg} — balance: ${data.new_balance}`,
      'ok'
    );
    updateAuthUI();
    showToast(lang === 'is' ? `✦ ${data.credits_added} KREDIT BÆTT VIÐ` : `✦ ${data.credits_added} CREDITS ADDED`);
    setTimeout(() => {
      document.getElementById('redeem-section').style.display = 'none';
      setSt('st-redeem', '');
    }, 4000);

  } catch(e) {
    setSt('st-redeem', e.message, 'err');
  }
  btn.disabled = false;
}

async function signInWithGoogle() {
  const cleanUrl = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: cleanUrl }
  });
  if (error) setSt('st-auth', error.message, 'err');
}

async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  if (!email) { setSt('st-auth', 'Please enter your email.', 'err'); return; }
  setSt('st-auth', 'Sending…');
  const cleanUrl = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: cleanUrl } });
  if (error) {
    const msg = (error.status === 429 || /rate/i.test(error.message))
      ? 'Too many requests — please wait a moment, or use Google sign-in above.'
      : error.message;
    setSt('st-auth', msg, 'err'); return;
  }
  document.getElementById('auth-modal-body').style.display = 'none';
  document.getElementById('auth-modal-success').style.display = 'block';
}

// ─── LANGUAGE ────────────────────────────────────────────
function setLang(l) {
  if (l === lang) return;
  localStorage.setItem('runar_lang', l);
  // Save to profile async (best-effort)
  if (currentUser) sb.from('user_profiles').update({ lang: l }).eq('id', currentUser.id).then(() => {});
  const outputVisible = document.getElementById('reader-output')?.style.display !== 'none';
  if (outputVisible && readerRune) {
    if (readerTexts[l]) {
      lang = l; applyLangToggle(l); showCachedReading(l); updateUIText(); updateSidePanel(); buildPills();
    } else {
      pendingLang = l; openLangSwitchModal(l); applyLangToggle(lang);
    }
    return;
  }
  lang = l; applyLangToggle(l); updateUIText(); updateSidePanel(); buildPills();
  if (document.getElementById('reader-rune-card').style.display !== 'none') buildGrid();
  // Refresh collection if open
  if (activeAppTab === 'collection') {
    loadCollection();
    if (activeCollRune) loadCollAudio(l);
  }
}

function applyLangToggle(l) {
  const enBtn = document.getElementById('sp-btn-en');
  const isBtn = document.getElementById('sp-btn-is');
  if (enBtn) enBtn.classList.toggle('active', l === 'en');
  if (isBtn) isBtn.classList.toggle('active', l === 'is');
}

function openLangSwitchModal(tl) {
  const names = { en: 'English', is: 'Icelandic' };
  document.getElementById('lsm-title').textContent   = `SPEAK AGAIN IN ${(names[tl]||tl).toUpperCase()}?`;
  document.getElementById('lsm-body').textContent    =
    `Rúnar's voice in ${names[tl]||tl} carries its own truth — not a translation, but a fresh reading of the same rune. This draws from Rúnar again and uses one credit.`;
  document.getElementById('lsm-confirm').textContent = `YES — SPEAK IN ${(names[tl]||tl).toUpperCase()}`;
  document.getElementById('lsm-cancel').textContent  = `STAY IN ${(names[lang]||lang).toUpperCase()}`;
  document.getElementById('lang-switch-modal').classList.add('open');
}
function cancelLangSwitch() {
  pendingLang = null;
  document.getElementById('lang-switch-modal').classList.remove('open');
  applyLangToggle(lang);
}
async function confirmLangSwitch() {
  document.getElementById('lang-switch-modal').classList.remove('open');
  if (!pendingLang) return;
  lang = pendingLang; pendingLang = null;
  applyLangToggle(lang); updateUIText(); buildPills();
  await _generateReading();
}
function showCachedReading(l) {
  const cached = readerTexts[l];
  if (!cached) return;
  document.getElementById('out-short').textContent = cached.short;
  document.getElementById('out-deep').textContent  = cached.deep || '';
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');
  const vBtn = document.getElementById('btn-generate-voice');
  if (voiceGenerated[l]) {
    vBtn.textContent = '♪ RÚNAR HAS SPOKEN'; vBtn.disabled = true;
  } else {
    vBtn.textContent = t('voice_btn'); vBtn.disabled = false;
  }
}

// ─── UI TEXT ─────────────────────────────────────────────
function t(key) { return (UI_TEXT[lang]?.[key]) || UI_TEXT.en[key] || key; }
function rk(r)  { return lang === 'is' ? r.k_is : r.k; }
function rn(r)  { return lang === 'is' ? r.is_n : r.n; }
function rworld(r) {
  const m = {
    Hel:     'deep roots · what lies beneath',
    Midgard: 'the living path · the world of everyday action',
    Asgard:  'the heights · what seeks light and wide vision',
  };
  return r.world ? (m[r.world] || r.world) : '';
}
function relements(r) { return r.elements ? r.elements.join(', ') : ''; }
function setText(id, v)   { const el = document.getElementById(id); if (el && v !== undefined) el.textContent = v; }
function setPH(id, v)     { const el = document.getElementById(id); if (el && v) el.placeholder = v; }
function setSt(id, msg, type) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = msg || ''; el.className = 'status' + (type ? ' '+type : '');
}
function _updatePrivacyBannerText() {}
function dismissPrivacyBanner() {}
function _initPrivacyBanner() {}

function showToast(msg, dur = 3000) {
  const el = document.getElementById('toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

function displayName() {
  if (userName) return userName;
  if (currentUser) return currentUser.email.split('@')[0];
  return lang === 'is' ? 'Gestur' : 'Visitor';
}

function showTopbarGreeting() {
  if (greetingShown) return;
  greetingShown = true;
  const el = document.getElementById('topbar-greeting');
  if (!el) return;
  const is = lang === 'is';
  let msg = '';
  if (!currentUser) {
    msg = is ? 'Gaman að sjá þig, Gestur.' : 'Welcome, Visitor.';
  } else {
    const n = displayName();
    const returning = userTier === 'rune_seeker' || userTier === 'standard' || userTier === 'premium';
    msg = is ? (returning ? `Gaman að sjá þig aftur, ${n}.` : `Gaman að sjá þig, ${n}.`)
             : (returning ? `Welcome back, ${n}.`   : `Welcome, ${n}.`);
  }
  el.textContent = msg;
  setTimeout(() => el.classList.add('show'), 200);
  setTimeout(() => el.classList.remove('show'), 4700);
}

function showHeroGreeting() {
  const el = document.getElementById('hero-greeting');
  if (!el || !currentUser) return;
  const is = lang === 'is';
  const n = displayName();
  el.textContent = is ? `Gaman að sjá þig, ${n}.` : `Welcome, ${n}.`;
  setTimeout(() => el.classList.add('show'), 600);
}

// ── NAME PROMPT ──────────────────────────────────────────
function showNamePrompt() {
  const ov = document.getElementById('name-overlay');
  if (!ov) return;
  const is = lang === 'is';
  const card = ov.querySelector('.name-card-title');
  const sub  = ov.querySelector('.name-card-sub');
  const inp  = document.getElementById('name-prompt-input');
  const skip = document.getElementById('name-prompt-skip');
  const btn  = ov.querySelector('.name-card-btn');
  if (card) card.textContent = is ? 'ÁÐUR EN RÚNIRNAR TALA' : 'BEFORE THE RUNES SPEAK';
  if (sub)  sub.innerHTML   = is ? 'Rúnirnar tala öðruvísi til þeirra sem þær þekkja að nafni.<br>Hvernig á ég að kalla þig?' : 'The runes speak differently to those whose name they know.<br>How shall I call you?';
  if (skip) skip.textContent = is ? 'Halda áfram án nafns' : 'Continue without a name';
  if (btn)  btn.textContent  = is ? 'LÁTA LESTURINN HEFJAST' : 'LET THE READING BEGIN';
  if (inp)  inp.placeholder  = is ? 'Nafn þitt eða gælunafn' : 'Your name or nickname';
  ov.style.display = 'flex';
  setTimeout(() => inp && inp.focus(), 100);
}

async function saveName() {
  const inp = document.getElementById('name-prompt-input');
  const val = inp ? inp.value.trim() : '';
  if (!val) { inp && inp.focus(); return; }
  userName = val;
  // Save to user_profiles
  try {
    await sb.from('user_profiles').update({ name: val }).eq('id', currentUser.id);
  } catch(e) { console.warn('saveName:', e.message); }
  document.getElementById('name-overlay').style.display = 'none';
  // Update label + greetings
  const lbl = document.getElementById('auth-user-label');
  if (lbl) lbl.textContent = userName;
  updateDropdown();
  showHeroGreeting();
  greetingShown = false;
  showTopbarGreeting();
}

function skipName() {
  document.getElementById('name-overlay').style.display = 'none';
}

// ── SIDE PANEL ACCOUNT ───────────────────────────────────
function updateSidePanel() {
  const accEl = document.getElementById('sp-account');
  if (!accEl) return;
  _updateInstallBtn();
  const isIs = lang === 'is';
  const tierLabels = isIs
    ? { rune_seeker:'VEGFARANDI', free:'VEGFARANDI', credits:'VEGFARANDI', standard:'STANDARD', premium:'PREMIUM' }
    : { rune_seeker:'RUNE SEEKER', free:'RUNE SEEKER', credits:'RUNE SEEKER', standard:'STANDARD', premium:'PREMIUM' };
  const tierHeader = currentUser ? (tierLabels[userTier] || userTier.toUpperCase()) : (isIs ? 'GESTUR' : 'VISITOR');
  setText('sp-tier-header', isIs ? 'REIKNINGUR ÞÍNN' : 'YOUR ACCOUNT');
  // Side panel navigation links — switch with language
  setText('sp-guide-link',   isIs ? '? LEIÐBEININGAR & SPURNINGAR' : '? GUIDE & FAQ');
  setText('sp-install-btn', isIs ? '⬇ SETJA UP RÚNAR' : '⬇ INSTALL RÚNAR');
  setText('sp-privacy-link', isIs ? 'PERSÓNUVERNDARSTEFNA'         : 'PRIVACY POLICY');
  // Render current tier + higher path (PANEL_TIERS — single source of truth)
  _renderYourPath();

  // Show/hide session + danger + personal actions sections
  const sessionEl = document.getElementById('sp-session');
  const dangerEl  = document.getElementById('sp-danger');
  if (!currentUser) {
    accEl.style.display = 'none';
    if (sessionEl) sessionEl.style.display = 'none';
    if (dangerEl)  dangerEl.style.display  = 'none';
    return;
  }
  accEl.style.display = 'block';
  if (sessionEl) sessionEl.style.display = 'block';
  if (dangerEl)  dangerEl.style.display  = 'block';

  const is = isIs;

  // Admin link
  const adminLink = document.getElementById('sp-admin-link');
  if (adminLink) adminLink.style.display = isAdmin(currentUser.email) ? 'block' : 'none';

  // Journal link
  const journalLink = document.getElementById('sp-journal-link');
  if (journalLink) {
    setText('sp-journal-link', is ? '✦ LESTRAR MÍNIR' : '✦ MY JOURNAL');
  }

  // Gift card visibility (upgrade handled in YOUR PATH)
  const giftEl = document.getElementById('sp-gift');
  const hide   = userTier === 'standard' || userTier === 'premium';
  if (giftEl) giftEl.style.display = hide ? 'none' : 'block';
  setText('sp-gift', is ? '+ GJAFA-LESTURARKORT' : '+ READING GIFT CARD');
  setText('sp-delete-account', is ? '× EYÐA REIKNINGI' : '× DELETE ACCOUNT');

  // Topbar dropdown (logged-in only)
  updateDropdown();
}

// ── SIDE PANEL ───────────────────────────────────────────
function openSidePanel() {
  updateSidePanel();
  document.getElementById('side-panel').classList.add('open');
  document.getElementById('side-overlay').classList.add('open');
}

function openJournalFromPanel() {
  closeSidePanel();
  showAppTab('journal');
}
function closeSidePanel() {
  document.getElementById('side-panel').classList.remove('open');
  document.getElementById('side-overlay').classList.remove('open');
}
function updateSidePanelLang() {
  const isIs = lang === 'is';
  const spEn = document.getElementById('sp-btn-en');
  const spIs = document.getElementById('sp-btn-is');
  if (spEn) { spEn.classList.toggle('active', !isIs); }
  if (spIs) { spIs.classList.toggle('active',  isIs); }
  const lbl = document.getElementById('sp-lang-lbl');
  if (lbl) lbl.textContent = isIs ? 'TUNGUMÁL' : 'LANGUAGE';
}

// ─── ROTATING HERO PHRASES ───────────────────────────────
const HERO_PHRASES = {
  en: [
    "You have returned. Good. The stones have been keeping something for you.",
    "Close your eyes for a moment. Then draw. The right rune never misses its mark.",
    "I have been sitting with these stones a long time. They know you better than you think.",
    "Something brought you here today. It was not accident. Draw, and we will see what it was.",
    "The rune you draw is rarely the one you expected. That is the point.",
    "Before you draw — breathe. The stones read stillness as clearly as questions.",
    "I have watched seekers come through darkness, doubt, and full moons. The runes receive all of it. Draw freely.",
    "You do not need to know the question clearly. The rune will find what is asking.",
    "Some days the stone speaks loudly. Other days it whispers. Either way — it speaks.",
    "The runes have no bad days. They simply tell the truth. Are you ready for that today?",
    "Whatever you carry through the door — leave it on the table. The reading begins from here.",
    "Draw when you are ready. There is no wrong moment — only the one you chose.",
  ],
  is: [
    // 🇮🇸 TO BE REVIEWED BY NATIVE SPEAKER
    "Þú ert kominn aftur. Gott. Steinarnir höfðu eitthvað í geymslu fyrir þig.",
    "Lokaðu augunum. Dragðu síðan. Rétta rúnan finnur alltaf leiðina.",
    "Ég hef setið með þessa steina lengi. Þeir þekkja þig betur en þú veist.",
    "Eitthvað leiddi þig hingað í dag — ekki tilviljun. Dragðu, og við sjáum hvað það var.",
    "Rúnan sem þú dregur er sjaldan sú sem þú væntiðst. Þetta er einmitt málið.",
    "Andaðu áður en þú dregur. Steinarnir lesa kyrrð jafn vel og spurningar.",
    "Ég hef séð leitendur koma — í myrkri, í efi, undir fullri tungl. Rúnirnar taka á móti öllu. Dragðu.",
    "Þú þarft ekki skýra spurningu. Rúnan finnur það sem er að leita.",
    "Sum dög mælir steininn hátt. Önnur dög hvíslir hann. En hann mælir alltaf.",
    "Rúnirnar hafa engar slæmar stundir. Þær segja bara það sem er. Ertu tilbúinn?",
    "Hvað sem þú berð með þér — settu það niður. Lesturinn hefst hér.",
    "Dragðu þegar þú ert tilbúinn. Enginn stund er rangur — aðeins sá sem þú velur.",
  ],
};

// Pick once per session, stays the same if language switches
let _heroPhrase = null;
function getHeroPhrase() {
  const pool = HERO_PHRASES[lang] || HERO_PHRASES.en;
  if (_heroPhrase === null) {
    _heroPhrase = Math.floor(Math.random() * pool.length);
  }
  return pool[_heroPhrase] || pool[0];
}

function updateUIText() {
  document.documentElement.lang = lang;
  setText('ui-brand', 'AGNDOFA');
  setText('atab-reading',    lang === 'is' ? '✦ LESTUR' : '✦ READING');
  setText('atab-collection', lang === 'is' ? '◈ SAFN RÚNA' : '◈ RUNES COLLECTION');
  setText('hero-eyebrow',   lang === 'is' ? 'RÚNAVÖRÐURINN' : 'THE RUNE KEEPER');
  setText('hero-eyebrow-m', lang === 'is' ? 'RÚNAVÖRÐURINN' : 'THE RUNE KEEPER');
  setText('ui-title',   'Rúnar');
  setText('ui-title-m', 'Rúnar');
  updateSidePanelLang();
  setText('ui-sub', getHeroPhrase());
  const heroQuote = document.getElementById('hero-quote');
  if (heroQuote) heroQuote.innerHTML = lang === 'is'
    ? '"Rúnirnar spá ekki um örlög þín.<br>Þær minna þig á veginn<br>sem þú gengur þegar."'
    : '"The runes do not predict your fate.<br>They remind you of the path<br>you already walk."';
  setText('reader-card1-lbl', t('reader_card1_lbl') || '✦ BEFORE WE BEGIN');
  setText('reader-note', t('reader_note') || 'Only your name is required. Everything else helps Rúnar speak more personally.');
  const nlbl = document.getElementById('name-lbl');
  if (nlbl) nlbl.innerHTML = t('name_lbl') + ' ';
  setPH('r-name', t('name_ph'));
  const dlbl = document.getElementById('dob-lbl');
  if (dlbl) dlbl.innerHTML = t('dob_lbl') + ' <span class="opt">'+t('opt')+'</span>';
  setPH('r-day',   t('day_ph'));
  setPH('r-month', t('month_ph'));
  setPH('r-year',  t('year_ph'));
  const albl = document.getElementById('area-lbl');
  if (albl) albl.innerHTML = t('area_lbl') + ' <span class="opt">'+t('opt')+'</span>';
  const slbl = document.getElementById('seek-lbl');
  if (slbl) slbl.innerHTML = t('seek_lbl') + ' <span class="opt">'+t('opt')+'</span>';
  const qlbl = document.getElementById('q-lbl');
  if (qlbl) qlbl.innerHTML = t('q_lbl') + ' <span class="opt">'+t('opt')+'</span>';
  setPH('r-question', t('q_ph'));
  setText('begin-btn', t('begin_btn'));
  setText('draw-lbl', t('draw_lbl'));
  setText('draw-note', t('draw_note'));
  setText('btn-speak', t('speak_btn'));
  setText('life-rune-lbl', t('life_rune_lbl'));
  setText('drawn-lbl', t('drawn_lbl'));
  setText('layer1-lbl', t('layer1_lbl'));
  setText('layer2-lbl', t('layer2_lbl'));
  setText('draw-another-btn', t('draw_another'));
  setText('start-over-btn', t('start_over'));
  setText('audio-player-lbl', t('voice_player_lbl'));
  const vBtn = document.getElementById('btn-generate-voice');
  if (vBtn && !vBtn.disabled) vBtn.textContent = t('voice_btn');
  // Re-render auth UI + side panel vždy — zajistí správné texty i pro odhlášeného uživatele při změně jazyka
  setText('free-redeem-link', lang === 'is' ? '+ GJAFA-LESTURARKORT' : '+ READING GIFT CARD');
  setText('redeem-lbl', lang === 'is' ? 'ᚠ SLÁÐU INN GJAFA-LESTURARKORT KÓÐ' : 'ᚠ ENTER READING GIFT CARD CODE');
  const shopLink = document.getElementById('redeem-shop-link');
  if (shopLink) shopLink.textContent = lang === 'is' ? '→ Kaupa fleiri gjafa-lesturarkort á Agndofa.is' : '→ Buy more Reading Gift Cards at Agndofa.is';
  updateAuthUI();
  updateSidePanel();
  updateQuestionGate();
  // Trial banner — fallback texts (přepíše updateAuthUI pokud je logged out)
  const remaining = Math.max(0, FREE_TRIAL_LIMIT - getTrialCount());
  setText('trial-count', lang === 'is'
    ? `${remaining} ókeypis lestur${remaining !== 1 ? 'ar' : ''} eftir`
    : `${remaining} free reading${remaining !== 1 ? 's' : ''} remaining`);
  // Auth gate
  setText('gate-title', lang === 'is' ? 'ÓKEYPIS LESTRAR ÞÍNIR ERU FULLNÝTTIR' : 'YOUR FREE READINGS ARE COMPLETE');
  setText('gate-note', lang === 'is'
    ? 'Þú hefur farið með Rúnar þrisvar sinnum sem gestir.\nStofnaðu reikning til að halda áfram.'
    : 'You have walked with Rúnar three times as a Visitor.\nCreate a free account to continue.');
  setText('gate-btn', lang === 'is' ? 'GERAST RÚNA-LEITANDI' : 'BECOME A RUNE SEEKER');
  // Trial end prompt translations
  setText('trial-end-title', lang === 'is' ? 'FERÐ ÞÍN SEM GESTUR ER LOKIÐ' : 'YOUR JOURNEY AS VISITOR IS COMPLETE');
  const ten = document.getElementById('trial-end-note');
  if (ten) ten.innerHTML = lang === 'is'
    ? 'Þú hefur farið með Rúnar þrisvar sinnum. Steinarnir muna.<br><b style="color:var(--gold);">Gerast Rúna-leitandi</b> til að halda áfram — fimm lestrar á mánuði, án greiðslu.'
    : 'You have walked with Rúnar three times as a Visitor. The stones remember.<br><b style="color:var(--gold);">Become a Rune Seeker</b> to continue — five readings each month, no payment ever needed.';
  setText('trial-end-btn', lang === 'is' ? 'GERAST RÚNA-LEITANDI →' : 'BECOME A RUNE SEEKER →');
  // Journal tab label
  setText('atab-journal', lang === 'is' ? '◌ LESTRAR' : '◌ JOURNAL');
  // Journal gate
  const jgTxt = document.getElementById('journal-gate-txt');
  if (jgTxt) jgTxt.innerHTML = lang === 'is'
    ? 'Stofnaðu reikning til að geyma lestrana þína.<br>Sérhver rúna sem þú dregur. Hvert orð sem Rúnar talar.<br>Geymt.'
    : 'Create a free account to keep your readings.<br>Every rune you draw. Every word Rúnar speaks.<br>Kept.';
  setText('journal-gate-btn', lang === 'is' ? 'GERAST RÚNA-LEITANDI' : 'BECOME A RUNE SEEKER');
  // Re-render journal if it's open (picks up new lang labels)
  if (activeAppTab === 'journal' && _journalCache.length > 0) renderJournal(_journalCache);
  else if (activeAppTab === 'journal') updateWhispersUI();
  // Single-source text updates for elements not covered elsewhere
  setText('redeem-btn', lang === 'is' ? 'INNLEYSA' : 'REDEEM');
  setText('auth-modal-sub', lang === 'is' ? 'Ekkert lykilorð þarf — töfralykill kemur í pósthólfið þitt.' : 'No password needed — a magic link will arrive in your inbox.');
  const _consentEl = document.getElementById('auth-consent-txt');
  if (_consentEl) _consentEl.innerHTML = lang === 'is'
    ? 'Með því að halda áfram samþykkir þú <a href="runar-privacy.html" target="_blank" rel="noopener">persónuverndarstefnu okkar</a>. Við geymum aðeins það sem þarð til að muna lestrana þin. Engin rakning, engar auglýsingar.'
    : 'By continuing, you agree to our <a href="runar-privacy.html" target="_blank" rel="noopener">Privacy Policy</a>. We store only what is needed to remember your readings. No tracking, no ads.';
  buildPills();
}

// ─── APP TABS ────────────────────────────────────────────
let activeAppTab = 'reading';

function showAppTab(tab) {
  activeAppTab = tab;
  document.getElementById('apane-reading').style.display    = tab === 'reading'    ? 'block' : 'none';
  document.getElementById('apane-collection').style.display = tab === 'collection' ? 'block' : 'none';
  document.getElementById('apane-journal').style.display    = tab === 'journal'    ? 'block' : 'none';
  document.getElementById('atab-reading').classList.toggle('active',    tab === 'reading');
  document.getElementById('atab-collection').classList.toggle('active', tab === 'collection');
  document.getElementById('atab-journal').classList.toggle('active',    tab === 'journal');
  if (tab === 'collection') {
    document.getElementById('reader-hero').classList.add('hidden');
    loadCollection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'journal') {
    document.getElementById('reader-hero').classList.add('hidden');
    loadJournal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Restore hero only if no reading is in progress
    const inReading = document.getElementById('reader-output')?.style.display !== 'none'
                   || document.getElementById('reader-rune-card')?.style.display !== 'none';
    if (!inReading) document.getElementById('reader-hero').classList.remove('hidden');
  }
}

// ─── COLLECTION ──────────────────────────────────────────
let collAudioMap  = {};   // { runeName: { en: [rows], is: [rows] } }
let activeCollRune = null;

async function loadCollection() {
  const grid = document.getElementById('coll-grid');
  if (!grid) return;

  // Fetch audio availability — wrapped in try/catch so rune grid always renders
  let data = null;
  try {
    const result = await sb.from('runar_static_audio')
      .select('rune_name, lang, version, text, audio_url, ready')
      .eq('ready', true)
      .order('version');
    data = result.data;
  } catch(e) {
    console.warn('Collection: audio fetch failed, rendering without audio markers', e);
  }

  collAudioMap = {};
  RUNES.forEach(r => { collAudioMap[r.n] = { en: [], is: [] }; });
  (data || []).forEach(row => {
    if (collAudioMap[row.rune_name]?.[row.lang]) collAudioMap[row.rune_name][row.lang].push(row);
  });

  // ── Visitor gate: only Fehu is unlocked ──
  const isVisitor = !currentUser || userTier === 'free_trial';
  const notice = document.getElementById('visitor-coll-notice');
  if (notice) {
    notice.style.display = isVisitor ? 'block' : 'none';
    if (isVisitor) {
      const isIs = lang === 'is';
      document.getElementById('vcn-text').innerHTML = isIs
        ? `Þú gengur hér sem <strong>Gestur</strong>. Fehu — rúna upphafsins — opnar rödd sína fyrir þig frítt. Dragðu hana. Hlustaðu á það sem fornir steinar geyma.<br><br>Þegar þú ert tilbúinn að ganga með allar tuttugu og fimm rúnirnar og heyra Rúnar tala í lestur þinn, vertu <strong>Vegfarandi</strong> — það kostar ekkert.`
        : `You walk here as a <strong>Visitor</strong>. Fehu — the rune of beginnings — opens its voice to you freely. Draw it. Hear what the old stones whisper.<br><br>When you are ready to walk with all twenty-five runes and hear Rúnar speak in your own reading, become a <strong>Rune Seeker</strong> — it costs nothing.`;
      document.getElementById('vcn-btn').textContent = isIs ? 'GERAST VEGFARANDI →' : 'BECOME A RUNE SEEKER →';
    }
  }

  grid.innerHTML = '';
  RUNES.forEach(r => {
    const enRows = collAudioMap[r.n]?.en || [];
    const isRows = collAudioMap[r.n]?.is || [];
    const hasEn  = enRows.length > 0;
    const hasIs  = isRows.length > 0;
    const locked  = isVisitor && r.n !== 'Fehu';

    const cell = document.createElement('button');
    cell.className = 'coll-cell' + (hasEn && hasIs ? ' has-audio' : hasEn || hasIs ? ' partial-audio' : '') + (locked ? ' locked' : '');
    if (activeCollRune?.n === r.n) cell.classList.add('active');

    const sd = typeof RUNE_SVGS !== 'undefined' ? RUNE_SVGS[r.svg] : null;
    const svgHtml = sd
      ? `<svg class="coll-svg" viewBox="${sd.vb}" fill="none" xmlns="http://www.w3.org/2000/svg">${sd.paths}</svg>`
      : `<span style="font-size:2em;color:var(--gold);">${r.g}</span>`;

    cell.innerHTML = `
      ${svgHtml}
      <span class="coll-name">${rn(r)}</span>
      <span class="coll-dots">
        <span class="coll-dot${hasEn ? ' en' : ''}" title="EN"></span>
        <span class="coll-dot${hasIs ? ' is' : ''}" title="IS"></span>
      </span>`;

    cell.dataset.rune = r.n;
    if (!locked) cell.onclick = () => openCollDetail(r, cell);
    grid.appendChild(cell);
  });

  // Re-open detail if a rune was already selected
  if (activeCollRune) {
    const activeCell = grid.querySelector(`[data-rune="${activeCollRune.n}"]`);
    if (activeCell) openCollDetail(activeCollRune, activeCell, true);
  }
}

function openCollDetail(r, cell, skipScroll) {
  activeCollRune = r;
  document.querySelectorAll('.coll-cell').forEach(c => c.classList.remove('active'));
  cell.classList.add('active');

  // Fill static info
  document.getElementById('cd-glyph').textContent    = r.g;
  document.getElementById('cd-name-en').textContent  = r.n;
  document.getElementById('cd-name-is').textContent  = r.is_n || '';
  document.getElementById('cd-kw').textContent        = lang === 'is' && r.k_is ? r.k_is : r.k;
  const metaParts = [];
  if (r.world)    metaParts.push(rworld(r));
  if (r.elements) metaParts.push(r.elements.join(' · '));
  document.getElementById('cd-meta').textContent = metaParts.join('  ·  ');

  // Show detail
  const det = document.getElementById('coll-detail');
  det.style.display = 'block';

  // Load audio for current lang
  loadCollAudio(lang);

  if (!skipScroll) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeCollDetail() {
  document.getElementById('coll-detail').style.display = 'none';
  document.querySelectorAll('.coll-cell').forEach(c => c.classList.remove('active'));
  activeCollRune = null;
}

function loadCollAudio(l) {
  if (!activeCollRune) return;

  // Update lang tab UI
  document.getElementById('cdlang-en').classList.toggle('active', l === 'en');
  document.getElementById('cdlang-is').classList.toggle('active', l === 'is');

  const rows = collAudioMap[activeCollRune.n]?.[l] || [];
  const textEl   = document.getElementById('cd-audio-text');
  const playerEl = document.getElementById('cd-audio-player');
  const lblEl    = document.getElementById('cd-audio-lbl');

  if (lblEl) lblEl.textContent = l === 'is' ? '♪ RÚNAR KENNIR' : '♪ RÚNAR\'S TEACHING';

  if (rows.length === 0) {
    textEl.textContent  = '';
    playerEl.innerHTML  = `<div class="coll-no-audio">${l === 'is' ? 'Engin hljóðupptaka til.' : 'No recording available yet.'}</div>`;
    return;
  }

  // Pick random version
  const pick = rows[Math.floor(Math.random() * rows.length)];
  textEl.textContent = pick.text || '';
  if (!pick.audio_url) {
    playerEl.innerHTML = '<div class="coll-no-audio">Audio file missing.</div>';
  } else {
    playerEl.innerHTML = _makeCapPlayer('coll', pick.audio_url, false);
    _capWire('coll');
  }
}

// ─── RUNE GRID ───────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('reader-grid');
  grid.innerHTML = '';
  RUNES.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'rb';
    let inner = '';
    if (typeof RUNE_SVGS !== 'undefined' && RUNE_SVGS[r.svg]) {
      const sd = RUNE_SVGS[r.svg];
      inner = `<svg class="rb-svg" viewBox="${sd.vb}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="${r.svg === 'Blank' ? '' : ''}" />
        ${sd.paths}
      </svg>`;
    } else {
      inner = `<span class="rb-g" style="font-size:1.4em;color:var(--gold);">${r.g}</span>`;
    }
    btn.innerHTML = inner + `<span class="rb-n">${rn(r)}</span>`;
    btn.onclick = () => {
      grid.querySelectorAll('.rb').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      readerRune = r;
      document.getElementById('reader-rune-info').textContent = `${r.g} ${rn(r)} — ${rk(r)}`;
      document.getElementById('btn-speak').disabled = false;
    };
    grid.appendChild(btn);
  });
}

// ─── PILLS ───────────────────────────────────────────────
function buildPills() {
  buildPillGroup('area-pills', AREAS[lang], 'area');
  buildPillGroup('seek-pills', SEEKS[lang], 'seek');
}
function buildPillGroup(containerId, items, type) {
  const c = document.getElementById(containerId); if (!c) return;
  const current = type === 'area' ? readerUser.area : readerUser.seeking;
  c.innerHTML = '';
  items.forEach(label => {
    const p = document.createElement('div');
    p.className = 'pill' + (label === current ? ' on' : '');
    p.textContent = label;
    p.onclick = () => {
      c.querySelectorAll('.pill').forEach(x => x.classList.remove('on'));
      p.classList.add('on');
      if (type === 'area') readerUser.area = label; else readerUser.seeking = label;
    };
    c.appendChild(p);
  });
}

// ─── CORRECTIONS ─────────────────────────────────────────
async function loadCorrections() {
  try {
    const { data } = await sb.from('runar_corrections').select('*').order('created_at');
    corrections = data || [];
  } catch { corrections = []; }
  const local = localStorage.getItem('runar_corrections');
  if (local) {
    try { corrections = [...corrections, ...JSON.parse(local)]; } catch {}
  }
}
function getCorrPrompt() {
  if (!corrections.length) return '';
  const rel = corrections.filter(c => !c.lang || c.lang === 'both' || c.lang === lang);
  if (!rel.length) return '';
  const lines = rel.map(c => `- Never say "${c.from_word}" — say "${c.to_word}" instead${c.context ? ' ('+c.context+')' : ''}`).join('\n');
  return `\nWord corrections (follow strictly):\n${lines}`;
}

// ─── PROXY ───────────────────────────────────────────────
// use_credit: true = odečíst kredit na backendu (monthly slot vyčerpán)
async function callProxy(sys, prompt, maxTokens, use_credit = false) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const { data: { session } } = await sb.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const res  = await fetch(PROXY, {
      method: 'POST', headers,
      body: JSON.stringify({ system: sys, prompt, max_tokens: maxTokens, use_credit })
    });
    const data = await res.json();

    // 402 = no credits or monthly limit hit
    if (res.status === 402) return { error: data.error || 'no_credits', message: data.message || 'No credits remaining.' };
    // 429 = rate limited
    if (res.status === 429) return { error: 'rate_limited', message: data.message || 'Too many requests. Please wait a moment.' };
    if (!res.ok || data.error) return { error: data.error || `HTTP ${res.status}` };

    // Sync credits balance if backend returned updated value
    if (data.credits_remaining !== undefined) {
      userCredits = data.credits_remaining;
      updateAuthUI();
    }

    return { text: data.content?.[0]?.text || data.text || '' };
  } catch (e) { return { error: e.message }; }
}

// Vrátí true pokud je třeba použít kredit (monthly slot vyčerpán)
function shouldUseCredit() {
  if (userTier !== 'rune_seeker') return false;
  const used = getFreeMonthCount(currentUser?.id);
  return used >= FREE_REGISTERED_LIMIT;
}

// Vrátí true pokud může aktuální uživatel slyšet dynamický hlas Rúnara.
// Logika čte TIERS config — stačí flipnout flag v runar-config.js.
// Připraveno pro budoucí gating (např. Visitor jen 1 hlasité čtení ze 3).
function canUseVoice() {
  const tier = TIERS[userTier] || TIERS.free_trial;
  if (shouldUseCredit()) return !!tier.voice_credits;
  return !!tier.voice_monthly;
}

// ─── STREAM ──────────────────────────────────────────────
function stream(id, text) {
  return new Promise(resolve => {
    const el = document.getElementById(id); if (!el) { resolve(); return; }
    el.innerHTML = '';
    const words = text.split(' ');
    let i = 0;
    const tick = setInterval(() => {
      if (i >= words.length) { clearInterval(tick); resolve(); return; }
      const span = document.createElement('span'); span.textContent = (i > 0 ? ' ' : '') + words[i++];
      el.appendChild(span);
    }, APP.stream_delay_ms);
  });
}

// ─── STATIC AUDIO CHECK ──────────────────────────────────
async function checkStaticAudio(drawn, l) {
  const { data: rows } = await sb.from('runar_static_audio')
    .select('audio_url, version').eq('rune_name', drawn.n).eq('lang', l).eq('ready', true);
  if (rows && rows.length > 0) {
    const pick = rows[Math.floor(Math.random() * rows.length)];
    document.getElementById('runar-audio').src = pick.audio_url;
    _capReset();
    document.getElementById('audio-player').classList.add('visible');
    setSt('st-voice', `♪ ${rows.length > 1 ? `v${pick.version} · ` : ''}static`);
  }
}

// ─── READING CORE ────────────────────────────────────────
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
  if (_rdLoadTxt) _rdLoadTxt.textContent = lang === 'is' ? 'STEINARNIR TALA Í ÞAGNINNI…' : 'THE STONES SPEAK IN SILENCE…';
  if (_rdLoadEl) _rdLoadEl.style.display = 'block';
  var _pL1 = document.getElementById('layer1-lbl');
  var _pL2 = document.getElementById('layer2-lbl');
  if (_pL1) _pL1.classList.add('pulsing');
  if (_pL2) _pL2.classList.add('pulsing');

  const u = readerUser, drawn = readerRune, life = u.lifeRune;
  const sys = buildSysPrompt(activeChar);
  const langInstr = lang === 'is' ? 'Respond entirely in Icelandic (Íslenska).' : 'Respond in English.';
  const drawnKws = rk(drawn).split(',').map(s => s.trim()).filter(Boolean);
  const pickedKws = drawnKws.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, drawnKws.length)).join(', ');
  const formulaLine = (lang === 'is' && drawn.formula_is)
    ? `\nIcelandic rune formula (weave naturally once into PART 1): "${drawn.formula_is}"` : '';
  const lifeCtx = life
    ? `LIFE RUNE: ${rn(life)} (${life.g}) — ${rk(life)}` + (life.world ? ` · Realm: ${rworld(life)} · Elements: ${relements(life)}` : '')
    : '';
  const drawnCtx = `DRAWN RUNE: ${rn(drawn)} (${drawn.g}) — focus on: ${pickedKws}` +
    (drawn.world ? ` · World: ${rworld(drawn)} · Elements: ${relements(drawn)}` : '');
  const parts = [`PERSON: ${u.name}`, lifeCtx, drawnCtx,
    u.area    ? `AREA: ${u.area}` : '',
    u.seeking ? `SEEKING: ${u.seeking}` : '',
    u.question? `QUESTION: "${u.question}"` : ''].filter(Boolean).join('\n');
  const prompt = `${parts}${formulaLine}\n\nGive the reading in two parts separated by |||\n\nPART 1 (2-3 sentences maximum, core message, direct and poetic. Mention the rune's name — ${rn(drawn)} — once, woven naturally into the reading. Let the rune's symbolic layer — ${rworld(drawn) || 'the living path'} — subtly colour the tone):\n\nPART 2 (3-4 sentences maximum. Deeper reflection — connect drawn rune with ${life ? 'life rune ' + rn(life) + (life.world ? ' (' + rworld(life) + ')' : '') + ', ' : ''}${u.area || 'their path'}${u.seeking ? ', seeking ' + u.seeking : ''}. If the drawn rune and life rune share an element (${relements(drawn)} / ${life ? relements(life) : '—'}), let that resonance surface briefly. End with one short, open question. Do NOT include a label like "PART 2" in the output):\n\nSpeak directly to ${u.name}. Be concise — every sentence must earn its place. ${langInstr}\n${getCorrPrompt()}`;

  const res = await callProxy(sys, prompt, RUNAR_MODES.quick_reading.max_tokens, shouldUseCredit());
  if (res.error === 'rate_limited') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    setSt('st-reader', lang === 'is' ? 'Of margar beiðnir. Bíddu aðeins.' : 'Too many requests. Please wait a moment.', 'err');
    return;
  }
  if (res.error === 'no_credits' || res.error === 'monthly_limit') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    document.getElementById('out-short').innerHTML = '';
    document.getElementById('out-deep').innerHTML  = '';
    const isMonthly = res.error === 'monthly_limit';
    const msg = isMonthly
      ? (lang === 'is' ? 'Mánaðarleg lestrar þín eru búin.' : 'Monthly free readings exhausted. Use a credit or upgrade.')
      : (lang === 'is' ? 'Kredit þínir eru búnir.' : 'No credits remaining. Redeem a gift card to continue.');
    setSt('st-reader', msg, 'err');
    // Sync localStorage with real count from DB to fix any drift
    if (currentUser) syncMonthlyCount(currentUser.id);
    await fetchUserProfile(currentUser.id); // refresh balance + show gate
    return;
  }
  if (res.error) { if (_rdLoadEl) _rdLoadEl.style.display = 'none'; if (_pL1) _pL1.classList.remove('pulsing'); if (_pL2) _pL2.classList.remove('pulsing'); setSt('st-reader', 'Failed: ' + res.error, 'err'); return; }

  const split = res.text.split('|||');
  const short = split[0]?.trim() || res.text;
  const deep  = split[1]?.trim() || '';
  readerTexts[lang] = { short, deep };

  // Count reading — anonymous trial or logged-in free tier
  if (!currentUser) {
    incTrialCount();
    updateAuthUI();
  } else {
    // Save to DB first, then sync count (localStorage updates async after DB confirms)
    await saveReading(readerRune, short, deep);
    await syncMonthlyCount(currentUser.id); // refreshes localStorage + banner
    loadJournal(); // refresh journal in background (no await — don't block stream)
  }

  if (_rdLoadEl) _rdLoadEl.style.display = 'none';
  if (_pL1) _pL1.classList.remove('pulsing');
  if (_pL2) _pL2.classList.remove('pulsing');
  await stream('out-short', short);
  if (deep) await stream('out-deep', deep); else document.getElementById('out-deep').innerHTML = '';

  // After streaming is done — if last free reading, show join prompt after 8s
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) {
    setTimeout(() => {
      const el = document.getElementById('trial-end');
      if (el && document.getElementById('reader-output')?.style.display !== 'none') {
        el.style.display = 'block';
      }
    }, 8000);
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
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
}

function startReading() {
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) { _showTrialEnd(); return; }
  // Only block rune_seeker who has used all free monthly slots AND has no credits left.
  // Standard / Premium / Admin are never blocked here.
  if (currentUser && userTier === 'rune_seeker'
      && getFreeMonthCount(currentUser.id) >= FREE_REGISTERED_LIMIT
      && userCredits <= 0) {
    updateAuthUI();
    setSt('st-setup', lang === 'is'
      ? 'Þú hefur gengið alla lestrana þína í þessum mánuði. Notaðu gjafa-lesturarkort til að halda áfram.'
      : 'Your readings for this month are complete. Use a reading gift card to continue.');
    return;
  }
  const name = document.getElementById('r-name').value.trim();
  if (!name) { setSt('st-setup', t('st_name_req'), 'err'); return; }
  const d  = parseInt(document.getElementById('r-day').value);
  const m  = parseInt(document.getElementById('r-month').value);
  const y  = parseInt(document.getElementById('r-year').value);
  const lifeRune = (d && m && y && d <= 31 && m <= 12 && y >= 1900) ? calcLifeRune(d, m, y) : null;
  readerUser = { name, d, m, y, lifeRune,
    area: readerUser.area || '', seeking: readerUser.seeking || '',
    question: document.getElementById('r-question').value.trim() };
  document.getElementById('reader-hero').classList.add('hidden');
  document.getElementById('reader-setup').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'block';
  document.getElementById('reader-output').style.display = 'none';
  buildGrid(); setSt('st-setup', ''); setSt('st-reader', '');
}

async function readRune() {
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
  readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) { _showTrialEnd(); return; }
  if (currentUser && userTier === 'rune_seeker' && getFreeMonthCount(currentUser.id) >= FREE_REGISTERED_LIMIT && userCredits <= 0) { updateAuthUI(); return; }
  document.getElementById('reader-rune-card').style.display = 'block';
  document.querySelectorAll('#reader-grid .rb').forEach(b => b.classList.remove('on'));
  document.getElementById('reader-rune-info').textContent = '';
  document.getElementById('btn-speak').disabled = true;
}

function resetReader() {
  readerUser = {}; readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-hero').classList.remove('hidden');
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (!currentUser && getTrialCount() >= FREE_TRIAL_LIMIT) {
    _showTrialEnd(); return;
  }
  if (currentUser && userTier === 'rune_seeker' && getFreeMonthCount(currentUser.id) >= FREE_REGISTERED_LIMIT && userCredits <= 0) {
    updateAuthUI(); return;
  }
  document.getElementById('reader-setup').style.display = 'block';
  ['r-name','r-day','r-month','r-year','r-question'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  buildPills();
}

// ─── CUSTOM AUDIO PLAYER (main reading voice) ────────────
function _capFmt(s) {
  s = Math.floor(s || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
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
// ─── WHISPERS CAP PLAYER ─────────────────────────────────
function _wcapFmt(s) { const m = Math.floor(s/60); return m + ':' + String(Math.floor(s%60)).padStart(2,'0'); }
function wcapToggle() {
  const a = document.getElementById('whispers-audio');
  const btn = document.getElementById('wcap-play');
  if (!a || !btn) return;
  if (a.paused) { a.play(); btn.textContent = '⏸'; }
  else          { a.pause(); btn.textContent = '▶'; }
}
function wcapSeek(v) {
  const a = document.getElementById('whispers-audio');
  if (!a || !a.duration) return;
  a.currentTime = a.duration * (v / 100);
}
// ─── HIGHER PATH TOGGLE ─────────────────────────────────
function toggleHigherPath() {
  const body  = document.getElementById('sp-path-body');
  const arrow = document.getElementById('sp-path-arrow');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '+' : '−';
}

// ─── TOPBAR DROPDOWN ─────────────────────────────────────
function toggleDropdown() {
  const dd = document.getElementById('auth-dropdown');
  if (!dd || !currentUser) return;
  dd.classList.toggle('open');
}
function updateDropdown() {
  const dd      = document.getElementById('auth-dropdown');
  const tierEl  = document.getElementById('dd-tier');
  const emailEl = document.getElementById('dd-email');
  const balEl   = document.getElementById('dd-balance');
  if (!dd || !currentUser) return;
  const isIs = lang === 'is';
  const tierNames = isIs
    ? { rune_seeker:'VEGFARANDI', free_trial:'GESTUR', free:'VEGFARANDI', credits:'VEGFARANDI', standard:'STANDARD', premium:'PREMIUM' }
    : { rune_seeker:'RUNE SEEKER', free_trial:'VISITOR', free:'RUNE SEEKER', credits:'RUNE SEEKER', standard:'STANDARD', premium:'PREMIUM' };
  if (tierEl)  tierEl.textContent  = tierNames[userTier] || userTier.toUpperCase();
  if (emailEl) emailEl.textContent = currentUser.email;
  if (balEl) {
    if (userTier === 'rune_seeker' || userTier === 'free' || userTier === 'credits') {
      const used = getFreeMonthCount(currentUser.id);
      const rem  = Math.max(0, FREE_REGISTERED_LIMIT - used);
      const credPart = userCredits > 0
        ? (isIs ? ' · ' + userCredits + ' lestur' : ' · ' + userCredits + ' credit' + (userCredits !== 1 ? 's' : ''))
        : '';
      balEl.textContent = isIs
        ? rem + ' af 5 lestrum í mánuði' + credPart + ' · ' + nextResetLabel(true)
        : rem + ' of 5 readings this month' + credPart + ' · ' + nextResetLabel(false);
      balEl.style.display = '';
    } else {
      balEl.style.display = 'none';
    }
  }
}

// ─── YOUR PATH DYNAMIC RENDER ────────────────────────────
function _renderYourPath() {
  const body = document.getElementById('sp-path-body');
  if (!body) return;
  const isIs = lang === 'is';
  const tier = !currentUser ? 'free_trial' : (userTier || 'free_trial');
  const normTier = (tier === 'free' || tier === 'credits') ? 'rune_seeker' : tier;
  const lk = isIs ? 'is' : 'en';

  // ══ PANEL_TIERS — single source of truth for all side-panel tier data ══
  const PANEL_TIERS = [
    { id: 'free_trial',
      name: { en: 'VISITOR',     is: 'GESTUR' },
      props: {
        en: ['Your first three readings are a gift.', 'No account, no payment.', 'Step further when you are ready.'],
        is: ['Fyrstu þrír lestrar þínir eru gjafir.', 'Enginn reikningur, engin greiðsla.', 'Farðu lengra þegar þú ert tilbúinn.']
      }
    },
    { id: 'rune_seeker',
      name: { en: 'RUNE SEEKER', is: 'VEGFARANDI' },
      props: {
        en: ['5 Readings / month + reading credits.', 'Limited journal (last 5 readings).', 'Reading gift cards never expire.'],
        is: ['5 Lestrar / mánuð + lesturarkort.', 'Takmörkuð dagbók (síðustu 5 lestrar).', 'Lesturarkort renna aldrei út.']
      }
    },
    { id: 'standard',
      name: { en: 'STANDARD', is: 'STANDARD' },
      note: { en: '— coming soon', is: '— bráðlega' },
      props: {
        en: ['monthly / yearly subscription', 'Unlimited readings.', 'Full journal.', 'The Gathering once a week.'],
        is: ['mánaðar- / árslegt áskrift', 'Ótakmarkаðir lestrar.', 'Full dagbók.', 'The Gathering einu sinni á viku.']
      }
    },
    { id: 'premium',
      name: { en: 'PREMIUM', is: 'PREMIUM' },
      note: { en: '— coming soon', is: '— bráðlega' },
      props: {
        en: ['monthly / yearly subscription', 'Unlimited readings.', 'Full journal.', 'The Gathering once a week.', 'Ceremonial mode.'],
        is: ['mánaðar- / árslegt áskrift', 'Ótakmarkаðir lestrar.', 'Full dagbók.', 'The Gathering einu sinni á viku.', 'Ceremonial mode.']
      }
    }
  ];

  const currData = PANEL_TIERS.find(function(t) { return t.id === normTier; }) || PANEL_TIERS[0];
  const currIdx  = PANEL_TIERS.indexOf(currData);
  const higher   = PANEL_TIERS.slice(currIdx + 1);

  // Static current tier name
  const nameEl = document.getElementById('sp-curr-tier-name');
  if (nameEl) nameEl.textContent = currData.name[lk];

  // Current tier properties (multi-line, always visible)
  const descEl = document.getElementById('sp-tier-desc');
  if (descEl) descEl.innerHTML = currData.props[lk].join('<br>');

  // Show / hide HIGHER PATH toggle
  const hToggle = document.getElementById('sp-higher-toggle');
  if (hToggle) hToggle.style.display = higher.length > 0 ? '' : 'none';

  // Fill HIGHER PATH body
  let html = '';
  higher.forEach(function(t) {
    var note = t.note ? '<span class="sp-tier-note">' + t.note[lk] + '</span>' : '';
    html += '<div class="sp-tier-block">'
         +  '<div class="sp-tier-name">' + t.name[lk] + note + '</div>'
         +  '<div class="sp-tier-detail">' + t.props[lk].join('<br>') + '</div>'
         +  '</div>';
  });
  body.innerHTML = html;
}
// Wire audio element events once DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const a = document.getElementById('runar-audio');
  if (!a) return;
  a.addEventListener('timeupdate', () => {
    const pct = a.duration ? (a.currentTime / a.duration * 100) : 0;
    const seek = document.getElementById('cap-seek');
    const cur  = document.getElementById('cap-current');
    if (seek) { seek.value = pct; _capTrack(pct); }
    if (cur)  cur.textContent = _capFmt(a.currentTime);
  });
  a.addEventListener('loadedmetadata', () => {
    const dur = document.getElementById('cap-dur');
    if (dur) dur.textContent = _capFmt(a.duration);
  });
  a.addEventListener('ended', () => {
    const btn = document.getElementById('cap-play');
    if (btn) btn.textContent = '▶';
    _capTrack(100);
  });
  a.addEventListener('pause', () => {
    const btn = document.getElementById('cap-play');
    if (btn) btn.textContent = '▶';
  });
  a.addEventListener('play', () => {
    const btn = document.getElementById('cap-play');
    if (btn) btn.textContent = '⏸';
  });
  // ── Close topbar dropdown on outside click ──
  document.addEventListener('click', function(e) {
    const wrap = document.getElementById('auth-dropdown-wrap');
    const dd   = document.getElementById('auth-dropdown');
    if (wrap && dd && !wrap.contains(e.target)) dd.classList.remove('open');
  });
  // ── Wire whispers-audio (wcap) ──
  const wa = document.getElementById('whispers-audio');
  if (wa) {
    wa.addEventListener('timeupdate', () => {
      const pct = wa.duration ? (wa.currentTime / wa.duration * 100) : 0;
      const sk = document.getElementById('wcap-seek');
      const cr = document.getElementById('wcap-current');
      if (sk) sk.value = pct;
      if (cr) cr.textContent = _wcapFmt(wa.currentTime);
    });
    wa.addEventListener('loadedmetadata', () => {
      const dr = document.getElementById('wcap-dur');
      if (dr) dr.textContent = _wcapFmt(wa.duration);
    });
    wa.addEventListener('ended', () => {
      const btn = document.getElementById('wcap-play');
      if (btn) btn.textContent = '▶';
    });
    wa.addEventListener('pause', () => {
      const btn = document.getElementById('wcap-play');
      if (btn) btn.textContent = '▶';
    });
    wa.addEventListener('play', () => {
      const btn = document.getElementById('wcap-play');
      if (btn) btn.textContent = '⏸';
    });
  }
});

// ─── VOICE ───────────────────────────────────────────────
async function generateVoice() {
  const deepText = document.getElementById('out-deep').innerText.trim();
  if (!deepText) return;
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
    btn.textContent = '♪ RÚNAR HAS SPOKEN';
    btn.disabled = true;
    setSt('st-voice', '');
  } catch (err) {
    setSt('st-voice', `Voice error: ${err.message}`, 'err');
    btn.textContent = t('voice_btn'); btn.disabled = false;
  }
}

// ─── INIT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  // Set DOB year max to current year
  const yearInput = document.getElementById('r-year');
  if (yearInput) yearInput.max = new Date().getFullYear();

  // Hidden admin reset: ?reset_trial=1 clears visitor trial counter (dev/testing)
  if (new URLSearchParams(window.location.search).get('reset_trial') === '1') {
    localStorage.removeItem('runar_trial_count');
    history.replaceState({}, document.title, window.location.pathname);
    showToast('Trial count reset.');
  }

  // Restore language from localStorage (before auth, so UI is correct immediately)
  const savedLang = localStorage.getItem('runar_lang');
  if (savedLang && savedLang !== lang) {
    lang = savedLang;
    applyLangToggle(lang);
    updateSidePanelLang();
  }

  // Magic link callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) {
    const btn = document.getElementById('auth-action-btn');
    if (btn) { btn.textContent = 'SIGNING IN…'; btn.disabled = true; }
  }

  // Auth state — getSession() restores session from localStorage on refresh
  let session = null;
  try {
    const { data } = await sb.auth.getSession();
    session = data?.session || null;
  } catch(e) { console.warn('getSession failed:', e.message); }
  currentUser = session?.user || null;
  updateAuthUI(); // always sync UI with initial session state
  if (currentUser) {
    fetchUserProfile(currentUser.id); // tier + credits (also calls updateAuthUI)
    syncMonthlyCount(currentUser.id);
    loadJournal();
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    const prevUser = currentUser;
    currentUser = session?.user || null;

    updateAuthUI();
    if (currentUser) {
      closeAuthModal();
      if (window.location.search.includes('code=')) {
        history.replaceState({}, document.title, window.location.pathname);
      }
      // INITIAL_SESSION fires on refresh when session is restored from storage
      // TOKEN_REFRESHED fires when Supabase silently refreshes an expired token
      // Both need fetchUserProfile to restore tier/credits
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        fetchUserProfile(currentUser.id);
        syncMonthlyCount(currentUser.id);
        loadJournal();
      }
      if (event === 'SIGNED_IN') {
        showToast(lang === 'is' ? '✦ GAMAN AÐ SJÁ ÞIG · RÚNAR BÍÐUR' : '✦ WELCOME · RÚNAR AWAITS');
        upsertProfile();
        fetchUserProfile(currentUser.id); // tier + credits
        syncMonthlyCount(currentUser.id);
        loadJournal();
        checkAndShowResetNotif(currentUser.id);
      }
    }
    if (event === 'SIGNED_OUT') {
      hideJournal();
      showToast('YOU HAVE LEFT THE CIRCLE');
      // Reset local state and reload so the page starts fresh for the next visitor
      setTimeout(() => window.location.reload(), 1200);
    }
  });

  // Load character + corrections
  try {
    const { data } = await sb.from('runar_character').select('*').eq('active', true).limit(1).maybeSingle();
    activeChar = data || null;
  } catch { activeChar = null; }
  await loadCorrections();

  updateAuthUI();
  updateUIText();
  _initPrivacyBanner();
  // Greetings for anonymous visitors (logged-in users get them via fetchUserProfile)
  if (!currentUser) { showTopbarGreeting(); }
});

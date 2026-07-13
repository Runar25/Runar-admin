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
let userFreeBalance = 0;        // free_balance: 1 at registration, no replenish (model B)
let readerUser     = {};
let userGender     = 'hk';   // kk | kvk | hk (han, default) — how Runar addresses the seeker (IS)
let greetingShown  = false;     // show topbar greeting only once per session
let userName       = '';        // display name from user_profiles.name
let readerRune     = null;
let readerTexts    = {};  // { en: {short,deep}, is: {short,deep} }
let voiceGenerated = {};  // { en: bool, is: bool }
let pendingLang    = null;
let corrections    = [];

const FREE_TRIAL_LIMIT      = TIER_LIMITS.free_trial.onboarding;   // 1
const FREE_REGISTERED_LIMIT = TIER_LIMITS.rune_seeker.onboarding;  // 1

// Reading angles — randomly injected per reading to force variability
// Each angle pushes Claude to a different entry point and metaphor source
// IS reading angles — same 8 entry points, written directly in Icelandic.
// ─── TIMING CONSTANTS ───────────────────────────────────
const DELAY_NAME_PROMPT  = 1200; // ms after login before name prompt appears
const DELAY_RELOAD       = 1200; // ms after sign-out before page reloads
const DELAY_TRIAL_END    = 8000; // ms after last free reading before join prompt
const DELAY_GREETING     =  600; // ms before hero greeting fades in
const DELAY_TOAST_IN     =  200; // ms before toast slides in
const DURATION_TOAST     = 4700; // ms toast stays visible
const DELAY_FOCUS        =  100; // ms before input receives focus
const DELAY_SCROLL       =   80; // ms before scroll-into-view fires
const DELAY_ERROR_RESET  = 2000; // ms before error button text resets
const DURATION_SAVED     = 2500; // ms "saved" indicator stays visible


function getTrialCount() { return parseInt(localStorage.getItem('runar_trial_count') || '0'); }
function incTrialCount() { localStorage.setItem('runar_trial_count', String(getTrialCount() + 1)); }

async function fetchUserProfile(userId) {
  try {
    const { data } = await sb.from('user_profiles')
      .select('tier, credits_balance, free_balance, name, lang, life_rune_number, life_rune_text, life_rune_lang, dob_day, dob_month, dob_year, tree_name')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      userTier    = data.tier            || 'rune_seeker';
      // Normalize legacy DB values → rune_seeker
      userTier = normalizeTier(userTier);
      // Admins always get full premium access for testing
      if (isAdmin(currentUser?.email)) userTier = 'premium';
      userCredits = data.credits_balance || 0;
      userFreeBalance = data.free_balance != null ? data.free_balance : 0;
      // Load life rune reading if stored
      if (data.life_rune_text) {
        _lifeRuneText = data.life_rune_text;
        _lifeRuneLang = data.life_rune_lang;
        _lifeRuneNum  = data.life_rune_number;
      }
      // Load DOB from DB → Tree tab can find life rune without Reading form
      if (data.dob_day && data.dob_month && data.dob_year) {
        readerUser.d = data.dob_day;
        readerUser.m = data.dob_month;
        readerUser.y = data.dob_year;
      }
      // Load tree name (single source: currentUser.tree_name) -> render edit/display state
      if (currentUser) currentUser.tree_name = data.tree_name || '';
      if (typeof _renderTreeNameState === 'function') _renderTreeNameState();
      userName    = data.name            || '';
      userGender = localStorage.getItem('runar_gender') || 'hk';
      _updateGenderPills();
      // Cross-device gender — best-effort own query (address_gender column may not exist yet; never blocks profile load)
      sb.from('user_profiles').select('address_gender').eq('id', userId).maybeSingle()
        .then(function (r) { if (r && r.data && r.data.address_gender) { userGender = r.data.address_gender; localStorage.setItem('runar_gender', userGender); _updateGenderPills(); } })
        .catch(function () {});
      // Restore language preference
      // Priority: localStorage (active user choice) > DB default
      // If localStorage has a lang that matches current lang → user chose it while logged out;
      // save it to DB instead of overriding with the DB default ('en').
      if (data.lang && data.lang !== lang) {
        const localLang = localStorage.getItem('runar_lang');
        if (localLang && localLang === lang) {
          // User chose a language while logged out — persist to their profile, keep it
          sb.from('user_profiles').update({ lang: localLang }).eq('id', userId).then(() => {}).catch(e => console.warn('persist lang:', e.message));
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
  if (typeof _updateReadingForm === 'function') _updateReadingForm();
  // Ask for name if not set yet (delay so UI settles first)
  if (!userName) setTimeout(showNamePrompt, DELAY_NAME_PROMPT);
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
// FREE-SOLO tree: after saving a reading, append it to localStorage treeLog (data source for the Tree of Life).
// Format expected by engine: { spread, runes:[{rune:<glyph>, el:<lowercase element>}], area, intention }
function recordTreeReading(spreadKind, runeObjs, area, intention) {
  try {
    var toEl = function(r){ return ((r && r.elements && r.elements[0]) || 'Earth').toLowerCase(); };
    var log = JSON.parse(localStorage.getItem('treeLog') || '[]');
    log.push({
      spread:    (spreadKind || 'single').toLowerCase(),
      runes:     (runeObjs || []).filter(Boolean).map(function(r){ return { rune: r.g, el: toEl(r) }; }),
      area:      area || null,
      intention: intention || null
    });
    localStorage.setItem('treeLog', JSON.stringify(log));
  } catch(e) {}
}

// saveReading / saveSpreadReading REMOVED — the reading journal is now written
// SERVER-SIDE by claude-proxy (atomic with the credit deduction), so a charged reading
// is always journaled even if the app is killed before the response arrives. The client
// sends the reading meta via callProxy(..., journal); the proxy composes + inserts it.
// recordTreeReading (localStorage tree log) stays client-side, called from the reader flow.

// Sync monthly count from DB → localStorage (accurate, multi-device)
// Refresh userFreeBalance z DB (free_balance: 1 při registraci, žádné doplnění — model B).
// Název zachován kvůli stabilitě call-sites; už není měsíční.
async function syncFreeBalance(userId) {
  try {
    const { data } = await sb.from('user_profiles')
      .select('free_balance')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      userFreeBalance = data.free_balance != null ? data.free_balance : 0;
      updateAuthUI();
    }
  } catch(e) { console.warn('syncFreeBalance:', e.message); }
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

// ─── LANGUAGE ────────────────────────────────────────────
function setLang(l) {
  if (l === lang) return;
  localStorage.setItem('runar_lang', l);
  // Save to profile async (best-effort)
  if (currentUser) sb.from('user_profiles').update({ lang: l }).eq('id', currentUser.id).then(() => {}).catch(e => console.warn('persist lang switch:', e.message));
  const outputVisible = document.getElementById('reader-output')?.style.display !== 'none';
  // Only the reading tab treats a language switch as "re-speak the reading". On
  // collection/journal/tree the user is browsing -> fall through so the visible
  // content re-renders in the new language (bug: collection rune popis stayed stale).
  if (activeAppTab === 'reading' && outputVisible && readerRune) {
    if (readerTexts[l]) {
      lang = l; applyLangToggle(l); showCachedReading(l); updateUIText(); updateSidePanel(); buildPills();
    } else {
      pendingLang = l; openLangSwitchModal(l); applyLangToggle(lang);
    }
    return;
  }
  lang = l; applyLangToggle(l); updateUIText(); updateSidePanel(); buildPills();
  // Silently keep any existing reading's cached text on the current language so a
  // later return to the reading tab is consistent (no credit spent, no modal).
  if (readerRune && readerTexts[l]) showCachedReading(l);
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

// ─── ADDRESS GENDER (modern Icelandic: kk / kvk / hk=han) ────────────────
function setGender(g) {
  if (g !== 'kk' && g !== 'kvk' && g !== 'hk') g = 'hk';
  userGender = g;
  localStorage.setItem('runar_gender', g);
  if (currentUser) sb.from('user_profiles').update({ address_gender: g }).eq('id', currentUser.id).then(() => {}).catch(e => console.warn('persist gender:', e.message));
  _updateGenderPills();
}
function _updateGenderPills() {
  var sets = { kk: ['fg-kk'], kvk: ['fg-kvk'], hk: ['fg-hk'] };
  Object.keys(sets).forEach(function (k) {
    sets[k].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('active', userGender === k);
    });
  });
}
function _updateGenderVisibility() {
  var show = (lang === 'is');
  var row = document.getElementById('setup-gender-row');
  if (row) row.style.display = show ? 'block' : 'none';
  var flbl = document.getElementById('setup-gender-lbl');
  if (flbl) flbl.textContent = t('sp_gender_lbl');
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
    vBtn.textContent = t('voice_btn_done'); vBtn.disabled = true;
  } else {
    vBtn.textContent = t('voice_btn'); vBtn.disabled = false;
  }
}

// ─── UI TEXT ─────────────────────────────────────────────
function t(key) { return (UI_TEXT[lang]?.[key]) || UI_TEXT.en[key] || key; }
function _updatePrivacyBannerText() {}
function dismissPrivacyBanner() {}
function _initPrivacyBanner() {}

function displayName() {
  if (userName) return userName;
  if (currentUser) return lang === 'is' ? 'þú' : 'you';
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
    msg = is ? 'Gaman að sjá þig, Gestur.' : 'Good to see you, Visitor.';
  } else {
    const n = displayName();
    const returning = userTier === 'rune_seeker' || userTier === 'standard' || userTier === 'premium';
    msg = is ? (returning ? `Gaman að sjá þig aftur, ${n}.` : `Gaman að sjá þig, ${n}.`)
             : (returning ? `Good to see you again, ${n}.` : `Good to see you, ${n}.`);
  }
  el.textContent = msg;
  setTimeout(() => el.classList.add('show'), DELAY_TOAST_IN);
  setTimeout(() => el.classList.remove('show'), DURATION_TOAST);
}

function showHeroGreeting() {
  const el = document.getElementById('hero-greeting');
  if (!el || !currentUser) return;
  const is = lang === 'is';
  const n = displayName();
  el.textContent = is ? `Gaman að sjá þig, ${n}.` : `Good to see you, ${n}.`;
  setTimeout(() => el.classList.add('show'), DELAY_GREETING);
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
  if (card) card.textContent = t('name_modal_title');
  if (sub)  sub.innerHTML   = t('name_modal_sub');
  if (skip) skip.textContent = t('name_modal_skip');
  if (btn)  btn.textContent  = t('name_modal_btn');
  if (inp)  inp.placeholder  = t('name_modal_ph');
  ov.style.display = 'flex';
  setTimeout(() => inp && inp.focus(), DELAY_FOCUS);
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
  if (typeof _updateReadingForm === 'function') _updateReadingForm();
}

function skipName() {
  document.getElementById('name-overlay').style.display = 'none';
}

// ── SIDE PANEL ACCOUNT ───────────────────────────────────
// Tier display name (UPPER) from TIERS config — §8, nikdy nehardcodovat
function _tierName(id) {
  var ti = TIERS[id] || {};
  return { en: (ti.label || id).toUpperCase(),
           is: (ti.label_is || ti.label || id).toUpperCase() };
}
function updateSidePanel() {
  const accEl = document.getElementById('sp-account');
  if (!accEl) return;
  _updateInstallBtn();
  const isIs = lang === 'is';
  // Tier labels from TIERS config — Rule §8: never hardcode
  var _lkSP = isIs ? 'label_is' : 'label';
  var tierLabels = {};
  Object.keys(TIERS).forEach(function(k) {
    tierLabels[k] = (TIERS[k][_lkSP] || TIERS[k].label || k).toUpperCase();
  });
  const tierHeader = currentUser ? (tierLabels[userTier] || userTier.toUpperCase()) : (t('visitor_label'));
  setText('sp-tier-header', t('sp_account_title'));
  // Side panel navigation links — switch with language
  setText('sp-guide-link',   t('sp_guide_link'));
  setText('sp-higher-lbl',   t('sp_higher_path'));
  setText('sp-install-btn', t('sp_install_btn'));
  setText('sp-privacy-link', t('sp_privacy_link'));
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
  setText('sp-gift', '+ ' + vl('card', lang));
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
    "Þú snýrð aftur. Gott. Steinarnir geymdu eitthvað fyrir þig.",
    "Lokaðu augunum. Dragðu síðan. Rétta rúnan finnur alltaf leiðina.",
    "Ég hef setið með þessa steina lengi. Þeir þekkja þig betur en þú veist.",
    "Eitthvað leiddi þig hingað í dag — ekki tilviljun. Dragðu, og við sjáum hvað það var.",
    "Rúnan sem þú dregur er sjaldan sú sem þú bjóst við. Þetta er einmitt málið.",
    "Andaðu áður en þú dregur. Steinarnir lesa kyrrð jafn vel og spurningar.",
    "Ég hef séð leitendur koma — í myrkri, í efa, undir fullu tungli. Rúnirnar taka á móti öllu. Dragðu.",
    "Þú þarft ekki skýra spurningu. Rúnan finnur það sem er að leita.",
    "Suma daga talar steinninn hátt. Aðra daga hvíslar hann. En hann talar alltaf.",
    "Rúnirnar hafa engar slæmar stundir. Þær segja bara það sem er. Ertu tilbúinn?",
    "Hvað sem þú berð með þér — settu það niður. Lesturinn hefst hér.",
    "Dragðu þegar þú ert tilbúinn. Engin stund er röng — aðeins sú sem þú velur.",
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

// ─── UI TEXT HELPERS ─────────────────────────────────────
// Sub-functions of updateUIText() — each handles one concern.
// Called only from updateUIText().

// DOB field label with visitor/unveil hint
function _updateDobLabel() {
  const nlbl = document.getElementById('name-lbl');
  if (nlbl) nlbl.innerHTML = t('name_lbl') + ' ';
  setPH('r-name', t('name_ph'));
  setPH('tree-dob-d', t('day_ph'));
  setPH('tree-dob-m', t('month_ph'));
  setPH('tree-dob-y', t('year_ph'));
  const dlbl = document.getElementById('dob-lbl');
  const _dobVisitor = !currentUser;
  if (dlbl) {
    const _dobHint = _dobVisitor
      ? (lang === 'is' ? '· Gerast Leitandi til að birta lífstíðarrúnina þína' : '· Become a Rune Seeker to unveil your life rune')
      : (lang === 'is' ? '· til að uppgötva lífstíðarrúnina þína' : '· to reveal your life rune');
    dlbl.innerHTML = t('dob_lbl') + ' <span class="opt">'+t('opt')+'</span>' + ' <span class="visitor-lock-hint">' + _dobHint + '</span>';
  }
  setPH('r-day',   t('day_ph'));
  setPH('r-month', t('month_ph'));
  setPH('r-year',  t('year_ph'));
  ['r-day', 'r-month', 'r-year'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.disabled = _dobVisitor;
    el.style.opacity = _dobVisitor ? '0.35' : '';
    el.style.cursor  = _dobVisitor ? 'default' : '';
  });
}

// Area of Life + Seeking + Question labels with tier lock hints
function _updateAreaSeekLabels() {
  const albl = document.getElementById('area-lbl');
  const _isVisitor = !currentUser;
  const _isRSnoCredits = currentUser && userTier === 'rune_seeker' && userCredits <= 0;
  const _lockHint = _isVisitor
    ? ' <span class="visitor-lock-hint">' + (lang === 'is' ? '· Gerast Leitandi til að opna' : '· Become a Rune Seeker to unveil') + '</span>'
    : _isRSnoCredits
      ? ' <span class="visitor-lock-hint">' + (lang === 'is' ? '· Reading Gift Card opnar allt' : '· Reading Gift Card unveils all') + '</span>'
      : '';
  const _optSpan = _isVisitor ? '' : ' <span class="opt">'+t('opt')+'</span>';
  if (albl) albl.innerHTML = t('area_lbl') + _optSpan + _lockHint;
  const slbl = document.getElementById('seek-lbl');
  if (slbl) slbl.innerHTML = t('seek_lbl') + _optSpan + _lockHint;
  const ilbl = document.getElementById('intention-lbl');
  if (ilbl) ilbl.innerHTML = t('intention_lbl') + ' <span class="opt">' + t('opt') + '</span>';
  const qlbl = document.getElementById('q-lbl');
  if (qlbl) qlbl.innerHTML = t('q_lbl') + ' <span class="opt">'+t('opt')+'</span>';
  setPH('r-question', t('q_ph'));
}

// Trial banner, auth gate, trial-end modal texts
function _updateTrialTexts() {
  // Trial banner — fallback texts (přepíše updateAuthUI pokud je logged out)
  const remaining = Math.max(0, FREE_TRIAL_LIMIT - getTrialCount());
  setText('trial-count', lang === 'is'
    ? `${remaining} ókeypis lestur${remaining !== 1 ? 'ar' : ''} eftir`
    : `${remaining} free reading${remaining !== 1 ? 's' : ''} remaining`);
  // Auth gate
  setText('gate-title', lang === 'is' ? 'ÓKEYPIS SPÁ ÞÍN ER FULLNÝTT' : 'YOUR FREE RUNE READING IS COMPLETE');
  setText('gate-note', lang === 'is'
    ? 'Þú hefur farið með Rúnar einu sinni sem gestur.\nStofnaðu reikning til að halda áfram.'
    : 'You have walked with Rúnar once as a Visitor.\nCreate a free account to continue.');
  setText('gate-btn', lang === 'is' ? 'GERAST LEITANDI' : 'BECOME A RUNE SEEKER');
  // Trial end prompt translations
  setText('trial-end-title', lang === 'is' ? 'FERÐ ÞÍN SEM GESTUR ER LOKIÐ' : 'YOUR JOURNEY AS VISITOR IS COMPLETE');
  const ten = document.getElementById('trial-end-note');
  if (ten) ten.innerHTML = lang === 'is'
    ? 'Þú hefur farið með Rúnar sem Gestur. Steinarnir muna.<br><b class="rs-link">Gerast Leitandi</b> til að halda áfram — ' + TIER_LIMITS.rune_seeker.onboarding_label_is + ' þegar þú skráir þig. Engin greiðsla.'
    : 'You have walked with Rúnar as a Visitor. The stones remember.<br><b class="rs-link">Become a Rune Seeker</b> to continue — ' + TIER_LIMITS.rune_seeker.onboarding_label_en + ' when you join. No payment ever needed.';
  setText('trial-end-btn', lang === 'is' ? 'GERAST LEITANDI →' : 'BECOME A RUNE SEEKER →');
}

// Journal gate, auth modal consent, journal re-render, buildPills
function _updateGateTexts() {
  // Journal tab label
  setText('atab-journal', lang === 'is' ? '◌ LESTRAR' : '◌ JOURNAL');
  // Journal gate — Visitor teaser
  const jgTxt = document.getElementById('journal-gate-txt');
  if (jgTxt) jgTxt.innerHTML = lang === 'is'
    ? 'Þú gengur hér sem Gestur.<br>Dagbókin þín hefst um leið og þú mætir.<br>Gerðu þig að <b class="rs-link">Leitanda</b> til að opna dagbókina.'
    : 'You walk here as a Visitor.<br>Your journal begins the moment you arrive.<br>Become a <b class="rs-link">Rune Seeker</b> to open the journal.';
  setText('journal-gate-btn', lang === 'is' ? 'GERAST LEITANDI →' : 'BECOME A RUNE SEEKER →');
  // Re-render journal if it's open (picks up new lang labels)
  if (activeAppTab === 'journal' && _journalCache.length > 0) renderJournal(_journalCache);
  else if (activeAppTab === 'journal') updateWhispersUI();
  // Single-source text updates for elements not covered elsewhere
  setText('redeem-btn', lang === 'is' ? 'INNLEYSA' : 'REDEEM');
  setText('auth-modal-sub', lang === 'is' ? 'Ekkert lykilorð þarf — töfralykill kemur í pósthólfið þitt.' : 'No password needed — a magic link will arrive in your inbox.');
  const _consentEl = document.getElementById('auth-consent-txt');
  if (_consentEl) _consentEl.innerHTML = lang === 'is'
    ? 'Með því að halda áfram samþykkir þú <a href="runar-privacy.html" target="_blank" rel="noopener">persónuverndarstefnu okkar</a>. Við geymum aðeins það sem þarf til að muna lestrana þín. Engin rakning, engar auglýsingar.'
    : 'By continuing, you agree to our <a href="runar-privacy.html" target="_blank" rel="noopener">Privacy Policy</a>. We store only what is needed to remember your readings. No tracking, no ads.';
  // Auth-modal static strings (co-located with sub/consent; §6 keeps RÚNAR + Google)
  setText('auth-modal-title', lang === 'is' ? 'GAKKTU INN Í HEIM RÚNARS' : "ENTER RÚNAR'S WORLD");
  setText('auth-google-lbl',  lang === 'is' ? 'HALDA ÁFRAM MEÐ GOOGLE' : 'CONTINUE WITH GOOGLE');
  setText('auth-email-lbl',   lang === 'is' ? 'NETFANGIÐ ÞITT' : 'YOUR EMAIL');
  setText('auth-magic-btn',   lang === 'is' ? 'SENDA TÖFRALYKIL' : 'SEND MAGIC LINK');
  setText('auth-success-txt', lang === 'is' ? 'TÖFRALYKILL SENDUR' : 'MAGIC LINK SENT');
  var _asn = document.getElementById('auth-success-note');
  if (_asn) _asn.innerHTML = lang === 'is'
    ? 'Athugaðu póstinn þinn og smelltu á tengilinn til að ganga inn.<br>Þessi síða opnast sjálfkrafa.'
    : 'Check your email and click the link to enter.<br>This page will open automatically.';
  buildPills();
}

// updateUIText() — STATIC translations only (t('key') with no user-state dependency).
// Dynamic elements belong in dedicated functions:
//   _updateReadingForm() — reader heading, note, name row (depends on userName, _readingMode, knownUser)
//   _updateDobLabel()    — DOB field (depends on userTier, currentUser)
// NEVER add user-state-dependent text here — it will overwrite dynamic content on lang switch.
function updateUIText() {
  document.documentElement.lang = lang;
  setText('ui-brand', 'AGNDOFA');
  setText('atab-reading',    lang === 'is' ? '✦ SPÁ' : '✦ RUNE READING');
  setText('atab-collection', lang === 'is' ? '◈ SAFN RÚNA' : '◈ RUNES COLLECTION');
  setText('atab-tree', lang === 'is' ? '◈ TRÉ LÍFSINS' : '◈ TREE OF LIFE');
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
  // reader-card1-lbl and reader-note are set by _updateReadingForm() — not here
  _updateDobLabel();
  _updateAreaSeekLabels();
  setText('begin-btn', t('begin_btn'));
  setText('draw-lbl', t('draw_lbl'));
  setText('draw-note', t('draw_note'));
  setText('btn-random', t('random_btn'));
  setText('mode-btn-single',    t('spread3_mode_single'));
  setText('mode-btn-norns',     t('spread_mode_norns'));
  setText('mode-btn-kriz',      t('spread_mode_kriz'));
  setText('mode-btn-horseshoe', t('spread_mode_horseshoe'));
  setText('mode-btn-yggdrasil', t('spread_mode_yggdrasil'));
  setText('s5-kriz-lbl', '✦ ' + t('spread_mode_kriz'));
  setText('s7-horseshoe-lbl', '✦ ' + t('spread_mode_horseshoe'));
  setText('s9-yggdrasil-lbl', '✦ ' + t('spread_mode_yggdrasil'));
  setPH('redeem-input', t('redeem_ph'));
  setText('btn-speak', t('speak_btn'));
  setText('badge-life-note', t('badge_life_note'));
  setText('layer1-lbl', t('layer1_lbl'));
  setText('layer2-lbl', t('layer2_lbl'));
  setText('draw-another-btn', t('draw_another'));
  setText('start-over-btn', t('start_over'));
  setText('audio-player-lbl', t('voice_player_lbl'));
  setText('ask-lbl', t('ask_lbl'));
  var _askInp = document.getElementById('ask-input'); if (_askInp && typeof _askPlaceholder === 'function') _askInp.placeholder = _askPlaceholder();
  var _askBtn = document.getElementById('ask-btn'); if (_askBtn && !_askBtn.disabled) _askBtn.textContent = t('ask_btn');
  const vBtn = document.getElementById('btn-generate-voice');
  if (vBtn && !vBtn.disabled) vBtn.textContent = t('voice_btn');
  // Re-render auth UI + side panel vždy — zajistí správné texty i pro odhlášeného uživatele při změně jazyka
  setText('free-redeem-link', '+ ' + vl('card', lang));
  setText('redeem-link', '+ ' + vl('card', lang));
  setText('redeem-lbl', tp('redeem_card_code', { card: vl('card', lang).toUpperCase() }));
  const shopLink = document.getElementById('redeem-shop-link');
  if (shopLink) shopLink.textContent = tp('shop_buy_more', { card: vlp('card', lang) });
  updateAuthUI();
  updateSidePanel();
  updateQuestionGate();
  _updateTrialTexts();
  _updateGateTexts();
  _updateGenderVisibility();
  // Dynamic reader/tree/panel strings must refresh on language switch too
  if (typeof _updateReadingForm === 'function') _updateReadingForm();
  var _hg = document.getElementById('hero-greeting');
  if (_hg && _hg.classList.contains('show') && typeof showHeroGreeting === 'function') showHeroGreeting();
  setText('tree-dob-btn', t('tree_reveal_btn') + ' →');
  setText('sp-signout-btn', t('sign_out'));
  var _tgq = document.getElementById('tree-growth-quote');
  if (_tgq) _tgq.innerHTML = t('tree_growth_quote');
  setText('name-prompt-skip', t('name_modal_skip'));
  setText('auth-or', t('auth_or'));
  var _stlbl = (lang === 'is' ? TIERS.standard.label_is : TIERS.standard.label);
  setText('q-teaser-txt', tp('q_teaser', { tier: _stlbl }));
  var _jtxt = document.getElementById('journal-teaser-txt');
  if (_jtxt) _jtxt.innerHTML = tp('journal_teaser', { tier: _stlbl });
  var _jr = document.querySelector('#jf-rune option[value=""]');
  if (_jr) _jr.textContent = t('jf_all_runes');
  var _ja = document.querySelector('#jf-area option[value=""]');
  if (_ja) _ja.textContent = t('jf_all_areas');
  var _ct = document.getElementById('credits-text');
  if (_ct) _ct.textContent = (lang === 'is' ? TIERS.rune_seeker.label_is : TIERS.rune_seeker.label);
  var _tbg = document.getElementById('topbar-greeting');
  if (_tbg && _tbg.classList.contains('show') && typeof updateTopbarGreeting === 'function') updateTopbarGreeting();
  var _tub = document.getElementById('tree-upgrade-btn');
  if (_tub) _tub.textContent = (lang === 'is' ? 'UPPFÆRA → ' : 'UPGRADE → ') + (lang === 'is' ? TIERS.standard.label_is : TIERS.standard.label).toUpperCase();
}

// ─── APP TABS ────────────────────────────────────────────
let activeAppTab = 'reading';

function showAppTab(tab) {
  activeAppTab = tab;
  document.getElementById('apane-reading').style.display    = tab === 'reading'    ? 'block' : 'none';
  document.getElementById('apane-collection').style.display = tab === 'collection' ? 'block' : 'none';
  document.getElementById('apane-journal').style.display    = tab === 'journal'    ? 'block' : 'none';
  document.getElementById('apane-tree').style.display       = tab === 'tree'       ? 'block' : 'none';
  document.getElementById('atab-reading').classList.toggle('active',    tab === 'reading');
  document.getElementById('atab-collection').classList.toggle('active', tab === 'collection');
  document.getElementById('atab-journal').classList.toggle('active',    tab === 'journal');
  document.getElementById('atab-tree').classList.toggle('active',       tab === 'tree');
  if (tab === 'collection') {
    document.getElementById('reader-hero').classList.add('hidden');
    loadCollection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'tree') {
    document.getElementById('reader-hero').classList.add('hidden');
    updateTreeTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'journal') {
    document.getElementById('reader-hero').classList.add('hidden');
    loadJournal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Owner request: reset stale spread output/label/mode to clean single on tab entry
    if (typeof _resetReadingTab === 'function') _resetReadingTab();
    // Restore hero only if no reading is in progress
    const inReading = document.getElementById('reader-output')?.style.display !== 'none'
                   || document.getElementById('reader-rune-card')?.style.display !== 'none';
    if (!inReading) document.getElementById('reader-hero').classList.remove('hidden');
    // Update reading form mode/state when switching to reading tab
    if (typeof _updateReadingForm === 'function') _updateReadingForm();
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
        ? `Þú gengur hér sem <strong>Gestur</strong>. Fehu — rúna upphafsins — opnar rödd sína fyrir þig frítt. Dragðu hana. Hlustaðu á það sem fornir steinar geyma.<br><br>Þegar þú ert tilbúinn að ganga með allar tuttugu og fimm rúnirnar og heyra Rúnar tala í lestur þinn, vertu <strong>Leitandi</strong> — það kostar ekkert.`
        : `You walk here as a <strong>Visitor</strong>. Fehu — the rune of beginnings — opens its voice to you freely. Draw it. Hear what the old stones whisper.<br><br>When you are ready to walk with all twenty-five runes and hear Rúnar speak in your own reading, become a <strong>Rune Seeker</strong> — it costs nothing.`;
      document.getElementById('vcn-btn').textContent = t('become_rs_btn');
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

    const _cp = rnSplit(r);
    cell.innerHTML = `
      ${svgHtml}
      <span class="coll-name">${_cp.name}</span>${_cp.tr ? `<span class="coll-tr">(${_cp.tr})</span>` : ''}
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

  if (lblEl) lblEl.textContent = t('shrine_audio_lbl');

  if (rows.length === 0) {
    textEl.textContent  = '';
    playerEl.innerHTML  = `<div class="coll-no-audio">${l === 'is' ? 'Engin hljóðupptaka til.' : 'No recording available yet.'}</div>`;
    return;
  }

  // Pick random version
  const pick = rows[Math.floor(Math.random() * rows.length)];
  textEl.textContent = pick.text || '';
  if (!pick.audio_url) {
    playerEl.innerHTML = `<div class="coll-no-audio">${l === 'is' ? 'Hljóðskrá vantar.' : 'Audio file missing.'}</div>`;
  } else {
    playerEl.innerHTML = _makeCapPlayer('coll', pick.audio_url, false);
    _capWire('coll');
  }
}


// ─── RANDOM RUNE DRAW ────────────────────────────────────
function drawRandomRune() {
  var buttons = Array.from(document.querySelectorAll('#reader-grid .rb')).filter(function(b){ return !b.disabled; });
  if (!buttons.length) return;
  var randomBtn = document.getElementById('btn-random');
  if (randomBtn) randomBtn.disabled = true;

  // Timing: fast start, then slow down to final stop
  var delays = [];
  for (var i = 0; i < 15; i++) delays.push(60);
  for (var i = 0; i < 8; i++) delays.push(80 + i * 25);
  delays.push(300); delays.push(450); delays.push(600);

  var step = 0;
  var lastBtn = null;

  function tick() {
    if (lastBtn) lastBtn.classList.remove('flashing');
    var idx = Math.floor(Math.random() * buttons.length);
    lastBtn = buttons[idx];
    lastBtn.classList.add('flashing');
    step++;
    if (step < delays.length) {
      setTimeout(tick, delays[step]);
    } else {
      setTimeout(function() {
        if (lastBtn) {
          lastBtn.classList.remove('flashing');
          lastBtn.click();
        }
        if (randomBtn) randomBtn.disabled = false;
      }, 250);
    }
  }
  tick();
}

// ─── RUNE GRID ───────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('reader-grid');
  grid.innerHTML = '';
  RUNES.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'rb';
    btn.dataset.rune = r.n;
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
    var _rp = rnSplit(r);
    btn.innerHTML = inner + `<span class="rb-n">${_rp.name}</span>` + (_rp.tr ? `<span class="rb-t">(${_rp.tr})</span>` : '');
    btn.onclick = () => {
      grid.querySelectorAll('.rb').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      readerRune = r;
      document.getElementById('reader-rune-info').textContent = `${r.g} ${rn(r)} — ${rk(r)}`;
      var _bsp = document.getElementById('btn-speak');
      if (_bsp) {
        _bsp.disabled = false;
        var _sm = (typeof _spreadMode !== 'undefined') ? _spreadMode : 'single';
        var _full3 = (_sm === 'norns') && (typeof _spread3Runes !== 'undefined') && _spreadCount(_spread3Runes) >= 3;
        var _full5 = (_sm === 'kriz') && (typeof _spread5Runes !== 'undefined') && _spreadCount(_spread5Runes) >= 5;
        if (_sm !== 'single' && !_full3 && !_full5) {
          _bsp.textContent = t('speak_btn_add');
        }
      }
    };
    grid.appendChild(btn);
  });
}

// ─── PILLS ───────────────────────────────────────────────
function buildPills() {
  const _isVisitor = !currentUser;
  const _isRSnoCredits = currentUser && userTier === 'rune_seeker' && userCredits <= 0;
  const _areaUnlocked = _isRSnoCredits ? 3 : undefined;
  const _seekUnlocked = _isRSnoCredits ? 1 : undefined;
  buildPillGroup('area-pills', AREAS[lang], 'area', _areaUnlocked);
  buildPillGroup('seek-pills', SEEKS[lang], 'seek', _seekUnlocked);
  buildPillGroup('intention-pills', INTENTIONS[lang] || INTENTIONS.en, 'intention');
  ['area-pills', 'seek-pills'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('pills-locked', _isVisitor);
  });
}
function buildPillGroup(containerId, items, type, unlockedCount) {
  const c = document.getElementById(containerId); if (!c) return;
  const current = type === 'area' ? readerUser.area
    : type === 'seek' ? readerUser.seeking
    : readerUser.intention;
  c.innerHTML = '';
  items.forEach((label, idx) => {
    const locked = unlockedCount !== undefined && idx >= unlockedCount;
    const p = document.createElement('div');
    p.className = 'pill' + (label === current && !locked ? ' on' : '') + (locked ? ' pill-locked' : '');
    p.textContent = label;
    if (!locked) {
      p.onclick = () => {
        const isOn = p.classList.contains('on');
        c.querySelectorAll('.pill:not(.pill-locked)').forEach(x => x.classList.remove('on'));
        if (!isOn) {
          p.classList.add('on');
          if (type === 'area') readerUser.area = label;
          else if (type === 'seek') readerUser.seeking = label;
          else readerUser.intention = label;
        } else {
          if (type === 'area') readerUser.area = '';
          else if (type === 'seek') readerUser.seeking = '';
          else readerUser.intention = '';
        }
      };
    }
    c.appendChild(p);
  });
}

// ─── CORRECTIONS ─────────────────────────────────────────
async function loadCorrections() {
  var raw = [];
  try {
    const { data } = await sb.from('runar_corrections').select('*').order('created_at');
    raw = data || [];
  } catch { raw = []; }
  const local = localStorage.getItem('runar_corrections');
  if (local) {
    try { raw = [...raw, ...JSON.parse(local)]; } catch {}
  }
  // Gated by CORRECTIONS_IN_PROMPT (config): loaded for in-context prompt guidance (getCorrPrompt).
  corrections = (typeof CORRECTIONS_IN_PROMPT !== 'undefined' && !CORRECTIONS_IN_PROMPT)
    ? [] : normalizeCorrections(raw);
}
// ─── PROXY ───────────────────────────────────────────────
// use_credit: true = odečíst kredit na backendu (monthly slot vyčerpán)
async function callProxy(sys, prompt, maxTokens, use_credit = false, credit_cost = 1, journal = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const { data: { session } } = await sb.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const res  = await fetch(PROXY, {
      method: 'POST', headers,
      body: JSON.stringify({ system: sys, prompt, max_tokens: maxTokens, use_credit, spread_cost: credit_cost, journal })
    });
    const data = await res.json();

    // 402 = no credits or monthly limit hit
    if (res.status === 402) return { error: data.error || 'no_credits', message: data.message || 'No credits remaining.' };
    // 429 = rate limited
    if (res.status === 429) return { error: 'rate_limited', message: data.message || 'Too many requests. Please wait a moment.' };
    if (!res.ok || data.error) return { error: data.error || 'server_error', status: res.status };

    // Sync credits balance if backend returned updated value
    if (data.credits_remaining !== undefined) {
      userCredits = data.credits_remaining;
      updateAuthUI();
    }

    return { text: data.content?.[0]?.text || data.text || '' };
  } catch (e) { console.error('callProxy:', e && e.message); return { error: 'network_error' }; }
}

// Vrátí true pokud je třeba použít kredit (monthly slot vyčerpán)
function shouldUseCredit() {
  if (userTier !== 'rune_seeker') return false;
  return userFreeBalance <= 0;
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
  // Tier names from TIERS config — Rule §8: never hardcode
  var _lkDD = isIs ? 'label_is' : 'label';
  var tierNames = {};
  Object.keys(TIERS).forEach(function(k) {
    tierNames[k] = (TIERS[k][_lkDD] || TIERS[k].label || k).toUpperCase();
  });
  if (tierEl)  tierEl.textContent  = tierNames[userTier] || userTier.toUpperCase();
  if (emailEl) emailEl.textContent = currentUser.email;
  if (balEl) {
    if (normalizeTier(userTier) === 'rune_seeker') {
      const rem  = Math.max(0, userFreeBalance);
      const credPart = userCredits > 0
        ? (isIs ? ' · ' + userCredits + ' lestur' : ' · ' + userCredits + ' credit' + (userCredits !== 1 ? 's' : ''))
        : '';
      balEl.textContent = isIs
        ? rem + ' frjáls lestur eftir' + credPart
        : rem + ' free reading' + (rem !== 1 ? 's' : '') + ' remaining' + credPart;
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
  const normTier = normalizeTier(tier);
  const lk = isIs ? 'is' : 'en';

  // ══ PANEL_TIERS — single source of truth for all side-panel tier data ══
  // PANEL_TIERS — reads from TIER_LIMITS.panel_props (Rule §8: never hardcode here)
  const PANEL_TIERS = [
    { id: 'free_trial',  name: _tierName('free_trial'),  props: TIER_LIMITS.free_trial.panel_props  },
    { id: 'rune_seeker', name: _tierName('rune_seeker'), props: TIER_LIMITS.rune_seeker.panel_props },
    { id: 'standard',    name: _tierName('standard'), note: { en: '— coming soon', is: '— bráðlega' }, props: TIER_LIMITS.standard.panel_props  },
    { id: 'premium',     name: _tierName('premium'),  note: { en: '— coming soon', is: '— bráðlega' }, props: TIER_LIMITS.premium.panel_props   },
  ];

  const currData = PANEL_TIERS.find(function(t) { return t.id === normTier; }) || PANEL_TIERS[0];
  const currIdx  = PANEL_TIERS.indexOf(currData);
  const higher   = PANEL_TIERS.slice(currIdx + 1);

  // Static current tier name
  const nameEl = document.getElementById('sp-curr-tier-name');
  if (nameEl) nameEl.textContent = currData.name[lk];

  // Current tier properties (multi-line, always visible)
  const descEl = document.getElementById('sp-tier-desc');
  if (descEl) descEl.innerHTML = currData.props[lk].map(function(s){return s.split('{card}').join(vl('card', lang));}).join('<br>');

  // Show / hide HIGHER PATH toggle
  const hToggle = document.getElementById('sp-higher-toggle');
  if (hToggle) hToggle.style.display = higher.length > 0 ? '' : 'none';

  // Fill HIGHER PATH body
  let html = '';
  higher.forEach(function(t) {
    var note = t.note ? '<span class="sp-tier-note">' + t.note[lk] + '</span>' : '';
    html += '<div class="sp-tier-block">'
         +  '<div class="sp-tier-name">' + t.name[lk] + note + '</div>'
         +  '<div class="sp-tier-detail">' + t.props[lk].map(function(s){return s.split('{card}').join(vl('card', lang));}).join('<br>') + '</div>'
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

});

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

  // Restore address gender from localStorage
  userGender = localStorage.getItem('runar_gender') || 'hk';
  _updateGenderPills();

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
    syncFreeBalance(currentUser.id);
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
        syncFreeBalance(currentUser.id);
        loadJournal();
      }
      if (event === 'SIGNED_IN') {
        upsertProfile();
        fetchUserProfile(currentUser.id); // tier + credits
        syncFreeBalance(currentUser.id);
        loadJournal();
      }
    }
    if (event === 'SIGNED_OUT') {
      hideJournal();
      showToast('YOU HAVE LEFT THE CIRCLE');
      // Reset local state and reload so the page starts fresh for the next visitor
      setTimeout(() => window.location.reload(), DELAY_RELOAD);
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

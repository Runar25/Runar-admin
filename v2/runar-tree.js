// ═══════════════════════════════════════════════════════
// RÚNAR · TREE OF LIFE
// Life rune reading, DOB handling, tree name, side panel controls
// Depends on globals: lang, currentUser, userTier, readerUser,
//   activeChar, corrections, sb, RUNAR_MODES, RUNES,
//   DELAY_ERROR_RESET, DURATION_SAVED
// Depends on functions: t(), callProxy(), buildSysPrompt(),
//   buildLifeRunePrompt(), getCorrPrompt(), applyISCorrections(),
//   fetchUserProfile(), showAppTab()
// ═══════════════════════════════════════════════════════

// ─── TREE OF LIFE ─────────────────────────────────────────────────────────────

// Cached life rune reading from DB
var _lifeRuneText  = null;  // text of generated reading
var _lifeRuneLang  = null;  // lang of stored reading
var _lifeRuneNum   = null;  // rune number 1-24

// Show Tree tab — renders correct state based on tier + data
// FREE-SOLO living tree (ADMIN-only beta) — crown-composer tree grown from ALL your readings.
// Source = the `readings` table (journal). Trunk = life rune; branches grow from readings.
function readingsToTreeLog(rows) {
  var byGlyph = {};
  RUNES.forEach(function(r){ byGlyph[r.g] = ((r.elements && r.elements[0]) || 'Earth').toLowerCase(); });
  var out = [];
  (rows || []).forEach(function(row) {
    var name = (row.rune_name || '').toUpperCase();
    var isSpread = /NORNS|KRIZ|CROSS|COMPASS|HORSESHOE|YGGDRASIL/.test(name);
    var src = (row.rune_glyph || '') + ' ' + (row.short_text || '');
    var runes = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      if (c >= 0x16A0 && c <= 0x16FF) { var g = src.charAt(i); if (byGlyph[g]) runes.push({ rune: g, el: byGlyph[g] }); }
    }
    if (!runes.length) return;
    if (!isSpread) runes = [runes[0]];
    var area = (row.area && row.area !== 'spread') ? row.area : null;
    out.push({ spread: isSpread ? name.toLowerCase() : 'single', runes: runes, area: area, intention: row.intention || null });
  });
  return out;
}

async function renderLivingTree(rune) {
  try {
    var wrap = document.getElementById('tree-living');
    var cv   = document.getElementById('tree-living-canvas');
    // BETA: living tree visible to ADMINS only for now
    if (!wrap || !cv || !window.RunarTreeProd || !rune || !currentUser || !isAdmin(currentUser.email)) {
      if (wrap) wrap.style.display = 'none'; return;
    }
    var log = [];
    try {
      var res = await sb.from('readings').select('*').eq('user_id', currentUser.id).order('drawn_at', { ascending: true });
      if (res && res.data) log = readingsToTreeLog(res.data);
    } catch(e) {}
    var bk = (window.RunarBranch && window.RunarBranch.RUNES.filter(function(x){ return x.g === rune.g; })[0]);
    var rkey = bk ? bk.k : 'berkano';
    var dob = { d: readerUser.d, m: readerUser.m, y: readerUser.y };
    wrap.style.display = 'block';
    window.RunarTreeProd.render(cv, { log: log, rune: rkey, dob: dob });
  } catch(e) {}
}

function updateTreeTab() {
  updateAdminBar();
  var isIs = lang === 'is';
  var hasDob = readerUser && readerUser.d && readerUser.m && readerUser.y;
  var isStdPlus = currentUser && (userTier === 'standard' || userTier === 'premium' || isAdmin(currentUser.email));
  var rune = hasDob ? calcLifeRune(readerUser.d, readerUser.m, readerUser.y) : null;

  // Hide all states
  var states = ['tree-no-dob','tree-rs-teaser','tree-reveal-cta','tree-loading','tree-reading-exists'];
  states.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });

  if (!currentUser) {
    // Not logged in — show no-dob gate
    var noDob = document.getElementById('tree-no-dob');
    if (noDob) {
      noDob.style.display = 'block';
      var txt = document.getElementById('tree-no-dob-text');
      if (txt) txt.textContent = t('tree_signin_note');
    }
    return;
  }

  if (!hasDob) {
    var noDob = document.getElementById('tree-no-dob');
    if (noDob) {
      noDob.style.display = 'block';
      var txt = document.getElementById('tree-no-dob-text');
      if (txt) txt.innerHTML = t('tree_intro');
    }
    return;
  }

  renderLivingTree(rune);
  var runeName = isIs ? rune.is_n : rune.n;

  if (!isStdPlus) {
    // RS teaser
    var teaserEl = document.getElementById('tree-rs-teaser');
    if (teaserEl) {
      teaserEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-teaser');
      var gl = document.getElementById('tree-rune-glyph-teaser');
      if (nm) nm.textContent = runeName;
      if (gl) gl.textContent = rune.g;
      var tt = document.getElementById('tree-teaser-text');
      if (tt) tt.textContent = t('tree_rs_teaser');
      var lb = document.getElementById('tree-rune-label'); if (lb) lb.textContent = t('life_rune_lbl');
      // Credits balance + button state
      var LIFE_RUNE_COST = (SPREAD_COSTS && SPREAD_COSTS.life_rune) ? SPREAD_COSTS.life_rune.credits : 3;
      var bal = typeof userCredits !== 'undefined' ? userCredits : 0;
      var costLbl = document.getElementById('tree-rs-cost-label');
      var balLbl  = document.getElementById('tree-rs-balance-label');
      var balVal  = document.getElementById('tree-rs-balance-val');
      if (costLbl) costLbl.textContent = vn('unit', LIFE_RUNE_COST, lang);
      if (balLbl)  balLbl.textContent  = t('tree_rs_balance');
      if (balVal)  balVal.textContent  = bal;
      // Free reading — oddelene od credits (credits_balance != onboarding free reading)
      var freeLineEl = document.getElementById('tree-rs-free-line');
      if (freeLineEl && currentUser) {
        var freeRem  = Math.max(0, userFreeBalance);
        if (freeRem > 0) {
          freeLineEl.textContent = lang === 'is'
            ? vn('cast', freeRem, 'is') + ' fyrir venjulegar dregnar rúnir'
            : vn('cast', freeRem, 'en') + ' available for regular draws';
          freeLineEl.style.display = '';
        } else {
          freeLineEl.style.display = 'none';
        }
      }
      var orSep   = document.getElementById('tree-or-sep');
      if (orSep) orSep.textContent = t('tree_rs_or');
      var upgNote = document.getElementById('tree-upgrade-note');
      if (upgNote) upgNote.textContent = t('tree_rs_upgrade_note');
      var revBtn = document.getElementById('tree-rs-reveal-btn');
      if (revBtn) {
        revBtn.disabled = bal < LIFE_RUNE_COST;
        revBtn.title = bal < LIFE_RUNE_COST
          ? (lang === 'is' ? 'Þú þarft ' + vn('unit', LIFE_RUNE_COST, 'is') : 'You need ' + vn('unit', LIFE_RUNE_COST, 'en'))
          : '';
      }
    }
    return;
  }

  // Rune Walker/Rune Keeper — has reading?
  if (_lifeRuneText) {
    _showTreeReading(rune, runeName, isIs);
    // Show tree name section
    var tns = document.getElementById('tree-name-section');
    if (tns) tns.style.display = 'block';
    var tnl = document.getElementById('tree-name-label');
    if (tnl) tnl.textContent = t('tree_name_label');
    var tnb = document.getElementById('tree-name-save-btn');
    if (tnb) tnb.textContent = t('save_btn');
  } else {
    // Show reveal CTA
    var ctaEl = document.getElementById('tree-reveal-cta');
    if (ctaEl) {
      ctaEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-cta');
      var gl = document.getElementById('tree-rune-glyph-cta');
      if (nm) nm.textContent = runeName;
      if (gl) gl.textContent = rune.g;
      var intro = document.getElementById('tree-reveal-intro');
      var lbc = document.getElementById('tree-rune-label-cta'); if (lbc) lbc.textContent = t('life_rune_lbl');
      if (intro) intro.textContent = t('tree_reveal_intro');
      var btn = document.getElementById('tree-reveal-btn');
      if (btn) btn.textContent = t('tree_reveal_btn');
    }
  }
}

function _showTreeReading(rune, runeName, isIs) {
  var existsEl = document.getElementById('tree-reading-exists');
  if (!existsEl) return;
  existsEl.style.display = 'block';
  var nm = document.getElementById('tree-rune-name-exists');
  var gl = document.getElementById('tree-rune-glyph-exists');
  var lbl = document.getElementById('tree-rune-label-exists');
  // Header: 'You carry life rune Gebo ᵏ' — label hidden, name carries full phrase
  if (lbl) lbl.style.display = 'none';
  if (nm) nm.textContent = (isIs ? 'Þú ber lífsrún ' : 'You carry life rune ') + runeName;
  if (gl) gl.textContent = ' ' + rune.g;
  var open = document.getElementById('tree-static-open');
  if (open) open.textContent = '';
  var txt = document.getElementById('tree-reading-text');
  // Strip any leading markdown header (# ...) from stored Claude output
  var cleanText = (_lifeRuneText || '').replace(/^#[^\n]*\n+/, '').trim();
  if (txt) txt.innerHTML = cleanText.replace(/\n/g, '<br>');
  setPH('tree-name-inp', t('tree_name_ph'));
}

function toggleTreeReading() {
  var body = document.getElementById('tree-reading-body');
  var arrow = document.getElementById('tree-toggle-arrow');
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) {
    arrow.textContent = open ? '+' : '−';
    arrow.classList.toggle('open', !open);
  }
}

function setTreeDOB() {
  var d = parseInt(document.getElementById('tree-dob-d').value);
  var m = parseInt(document.getElementById('tree-dob-m').value);
  var y = parseInt(document.getElementById('tree-dob-y').value);
  if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2099) {
    var btn = document.getElementById('tree-dob-btn');
    if (btn) { btn.textContent = t('invalid_date'); setTimeout(function(){ btn.textContent = t('tree_reveal_btn') + ' →'; }, DELAY_ERROR_RESET); }
    return;
  }
  readerUser.d = d; readerUser.m = m; readerUser.y = y;
  // Save DOB to DB
  if (currentUser) {
    sb.from('user_profiles').update({ dob_day: d, dob_month: m, dob_year: y }).eq('id', currentUser.id).then(function() {}).catch(function(e) { console.warn('persist DOB:', e.message); });
  }
  updateTreeTab();
}

async function saveTreeName() {
  var inp = document.getElementById('tree-name-inp');
  var saved = document.getElementById('tree-name-saved');
  if (!inp || !currentUser) return;
  var name = inp.value.trim();
  if (!name) return;
  try {
    await sb.from('user_profiles').update({ tree_name: name }).eq('id', currentUser.id);
    if (saved) {
      saved.textContent = lang === 'is' ? '✦ VISTAÐ' : '✦ SAVED';
      saved.style.display = 'block';
      setTimeout(function(){ saved.style.display = 'none'; }, DURATION_SAVED);
    }
  } catch(e) {
    console.warn('saveTreeName:', e.message);
    if (saved) { saved.textContent = lang === 'is' ? 'Villa' : 'Error saving'; saved.style.display = 'block'; }
  }
}


// RS Life Rune reading — credit check + call generateLifeRuneReading
function _rsLifeRuneReading() {
  var COST = (SPREAD_COSTS && SPREAD_COSTS.life_rune) ? SPREAD_COSTS.life_rune.credits : 3;
  var bal  = typeof userCredits !== 'undefined' ? userCredits : 0;
  if (bal < COST) {
    showToast(lang === 'is'
      ? 'Þú þarft ' + COST + ' kredit. Keyptu þér gjafakort.'
      : 'You need ' + COST + ' credits. Get a reading gift card.');
    return;
  }
  generateLifeRuneReading();
}

async function generateLifeRuneReading() {
  if (!currentUser) return;
  var hasDob = readerUser && readerUser.d && readerUser.m && readerUser.y;
  if (!hasDob) return;

  var rune = calcLifeRune(readerUser.d, readerUser.m, readerUser.y);
  var isIs = lang === 'is';
  var isPremium = userTier === 'premium' || (currentUser && isAdmin(currentUser.email));

  // Show loading
  ['tree-reveal-cta','tree-rs-teaser','tree-reading-exists'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.style.display='none';
  });
  var loadEl = document.getElementById('tree-loading');
  var loadGlyph = document.getElementById('tree-loading-glyph');
  var loadTxt = document.getElementById('tree-loading-text');
  if (loadEl) loadEl.style.display = 'block';
  if (loadGlyph) loadGlyph.textContent = rune.g;
  if (loadTxt) loadTxt.textContent = t('reading_loading');

  var name = readerUser.name || (lang === 'is' ? 'þú' : 'you');
  var mode = isPremium ? RUNAR_MODES.life_rune_premium : RUNAR_MODES.life_rune_standard;
  var prompt = buildLifeRunePrompt(name, rune, readerUser.d, readerUser.m, readerUser.y, lang, isPremium);
  var corrBlock = getCorrPrompt(lang, corrections);
  if (corrBlock) prompt = prompt + '\n' + corrBlock;
  var sys = buildSysPrompt(activeChar, lang);

  // RS uses credit (deducts from balance via proxy)
  var _useCredit = (typeof userTier !== 'undefined' && userTier === 'rune_seeker');
  var res = await callProxy(sys, prompt, mode.max_tokens, _useCredit, SPREAD_COSTS.life_rune.credits);
  if (loadEl) loadEl.style.display = 'none';

  if (res.error) {
    if (loadTxt) { loadTxt.textContent = t('reading_error'); loadEl.style.display='block'; }
    return;
  }

  var text = applyISCorrections(res.text || '', lang, corrections);
  _lifeRuneText = text;
  _lifeRuneLang = lang;
  _lifeRuneNum  = RUNES.findIndex(function(r){ return r.n === rune.n; }) + 1;

  // Save to DB
  if (currentUser) {
    await sb.from('user_profiles').update({
      life_rune_number: _lifeRuneNum,
      life_rune_text:   _lifeRuneText,
      life_rune_lang:   _lifeRuneLang
    }).eq('id', currentUser.id);
  }

  var runeName = isIs ? rune.is_n : rune.n;
  _showTreeReading(rune, runeName, isIs);
  // Auto-expand reading body immediately after generation
  var _trBody = document.getElementById('tree-reading-body');
  var _trArrow = document.getElementById('tree-toggle-arrow');
  if (_trBody) _trBody.style.display = 'block';
  if (_trArrow) { _trArrow.textContent = '−'; _trArrow.classList.add('open'); }
}

// Load life rune reading from DB (called after fetchUserProfile)
async function loadLifeRuneFromDB() {
  if (!currentUser) return;
  var res = await sb.from('user_profiles')
    .select('life_rune_number, life_rune_text, life_rune_lang')
    .eq('id', currentUser.id)
    .single();
  if (res.data && res.data.life_rune_text) {
    _lifeRuneText = res.data.life_rune_text;
    _lifeRuneLang = res.data.life_rune_lang;
    _lifeRuneNum  = res.data.life_rune_number;
  }
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
  if (lbl) lbl.textContent = t('language_lbl');
}


// ─── ADMIN BAR ────────────────────────────────────────────────────────────────

// Show/hide admin bar. Called from updateTreeTab() and on lang change.
// More buttons will be added here (resetDOB, forceRegenerate, etc.)
function updateAdminBar() {
  var bar = document.getElementById('tree-admin-bar');
  if (!bar) return;
  bar.style.display = (currentUser && isAdmin(currentUser.email)) ? 'flex' : 'none';
  var resetBtn = document.getElementById('tree-admin-reset-lr');
  if (resetBtn) resetBtn.textContent = t('admin_reset_lr');
}

// Reset life rune for the current admin user (for testing).
// Clears life_rune_number/text/lang in DB + local state, then re-renders tree tab.
async function resetLifeRune() {
  if (!currentUser || !isAdmin(currentUser.email)) return;
  var who = (readerUser && readerUser.name) ? readerUser.name : (lang === 'is' ? 'þú' : 'you');
  if (!confirm('Reset life rune + DOB for ' + who + '?')) return;
  // Clear life rune AND date of birth — returns to tree-no-dob state
  var res = await sb.from('user_profiles')
    .update({
      life_rune_number: null, life_rune_text: null, life_rune_lang: null,
      dob_day: null, dob_month: null, dob_year: null
    })
    .eq('id', currentUser.id);
  if (res.error) { showToast('Reset failed: ' + res.error.message); return; }
  // Clear local state
  _lifeRuneText = null;
  _lifeRuneLang = null;
  _lifeRuneNum  = null;
  if (readerUser) { readerUser.d = null; readerUser.m = null; readerUser.y = null; }
  showToast(lang === 'is' ? 'Lífsrún endurstillt' : 'Life rune reset');
  updateTreeTab();
}

// ═══════════════════════════════════════════════════════
// SNAPSHOT 2026-05-30 — Tree of Life funkce
// Zdrojový soubor: v2/runar-app.js (řádky ~1550–1713, ~1891–1921)
// Stav: produkce ✅
// ═══════════════════════════════════════════════════════

// ─── STATE PROMĚNNÉ (přidat k existujícímu state bloku) ──
// let _lifeRuneText = null;
// let _lifeRuneLang = null;
// let _lifeRuneNum  = null;

// ─── TREE TAB — hlavní render ────────────────────────────
// Volá se z showAppTab('tree') a po loadLifeRuneFromDB()
function updateTreeTab() {
  var isIs = lang === 'is';
  var hasDob = readerUser && readerUser.d && readerUser.m && readerUser.y;
  var isStdPlus = currentUser && (userTier === 'standard' || userTier === 'premium' || isAdmin(currentUser.email));
  var rune = hasDob ? calcLifeRune(readerUser.d, readerUser.m, readerUser.y) : null;

  // Hide all states
  var states = ['tree-no-dob','tree-rs-teaser','tree-reveal-cta','tree-loading','tree-reading-exists'];
  states.forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });

  if (!currentUser) {
    var noDob = document.getElementById('tree-no-dob');
    if (noDob) {
      noDob.style.display = 'block';
      var txt = document.getElementById('tree-no-dob-text');
      if (txt) txt.textContent = isIs ? 'Skráðu þig til að uppgötva lífsrúnuna þína.' : 'Sign in to discover your life rune.';
    }
    return;
  }

  if (!hasDob) {
    var noDob = document.getElementById('tree-no-dob');
    if (noDob) {
      noDob.style.display = 'block';
      var txt = document.getElementById('tree-no-dob-text');
      if (txt) txt.textContent = isIs ? 'Sláðu inn fæðingardag þinn til að uppgötva lífsrúnuna þína.' : 'Enter your date of birth to discover your life rune.';
    }
    return;
  }

  var runeName = isIs ? rune.is_n : rune.n;

  if (!isStdPlus) {
    // RS teaser — vidí symbol + jméno, ne výklad
    var teaserEl = document.getElementById('tree-rs-teaser');
    if (teaserEl) {
      teaserEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-teaser');
      var gl = document.getElementById('tree-rune-glyph-teaser');
      if (nm) nm.textContent = runeName;
      if (gl) gl.textContent = rune.g;
      var tt = document.getElementById('tree-teaser-text');
      if (tt) tt.textContent = isIs ? 'Saga þín opnast með Standard.' : 'Your story opens with Standard.';
    }
    return;
  }

  // Standard/Premium
  if (_lifeRuneText) {
    _showTreeReading(rune, runeName, isIs);
  } else {
    // Reveal CTA — ještě nebyl vygenerován výklad
    var ctaEl = document.getElementById('tree-reveal-cta');
    if (ctaEl) {
      ctaEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-cta');
      var gl = document.getElementById('tree-rune-glyph-cta');
      if (nm) nm.textContent = runeName;
      if (gl) gl.textContent = rune.g;
      var intro = document.getElementById('tree-reveal-intro');
      if (intro) intro.textContent = isIs
        ? 'Áður en rúnarnar tala um daginn — vill Rúnar opinbera rúnina sem þú hefur borið frá fæðingu?'
        : 'Before the runes speak of today — shall Rúnar reveal the rune you carry since birth?';
      var btn = document.getElementById('tree-reveal-btn');
      if (btn) btn.textContent = isIs ? 'OPINBERA LÍFSRÚNUNA' : 'REVEAL YOUR LIFE RUNE';
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
  if (nm) nm.textContent = runeName;
  if (gl) gl.textContent = rune.g;
  if (lbl) lbl.textContent = isIs ? 'LÍFSRÚNA ÞÍN' : 'YOUR LIFE RUNE';
  var open = document.getElementById('tree-static-open');
  if (open) open.textContent = (isIs ? 'Þú ber ' : 'You carry ') + runeName + ' ' + rune.g + '.';
  var txt = document.getElementById('tree-reading-text');
  if (txt) txt.innerHTML = (_lifeRuneText || '').replace(/\n/g, '<br>');
}

function toggleTreeReading() {
  var body = document.getElementById('tree-reading-body');
  var arrow = document.getElementById('tree-toggle-arrow');
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) {
    arrow.textContent = open ? '+' : '-';
    arrow.classList.toggle('open', !open);
  }
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
  if (loadTxt) loadTxt.textContent = isIs ? 'STEINARNIR TALA I THAGNINNI...' : 'THE STONES SPEAK IN SILENCE...';

  var name = readerUser.name || (currentUser ? currentUser.email.split('@')[0] : 'seeker');
  var mode = isPremium ? RUNAR_MODES.life_rune_premium : RUNAR_MODES.life_rune_standard;
  var prompt = buildLifeRunePrompt(name, rune, readerUser.d, readerUser.m, readerUser.y, lang, isPremium);
  var sys = buildSysPrompt(activeChar);

  var res = await callProxy(sys, prompt, mode.max_tokens, false);
  if (loadEl) loadEl.style.display = 'none';

  if (res.error) {
    if (loadTxt) { loadTxt.textContent = isIs ? 'Villa vid lestur.' : 'Error generating reading.'; loadEl.style.display='block'; }
    return;
  }

  var text = res.text || '';
  _lifeRuneText = text;
  _lifeRuneLang = lang;
  _lifeRuneNum  = RUNES.findIndex(function(r){ return r.n === rune.n; }) + 1;

  // Save to DB — user_profiles: life_rune_number, life_rune_text, life_rune_lang
  if (currentUser) {
    await sb.from('user_profiles').update({
      life_rune_number: _lifeRuneNum,
      life_rune_text:   _lifeRuneText,
      life_rune_lang:   _lifeRuneLang
    }).eq('id', currentUser.id);
  }

  var runeName = isIs ? rune.is_n : rune.n;
  _showTreeReading(rune, runeName, isIs);
}

// Volá se po fetchUserProfile (při login)
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

// ─── showAppTab() — rozšíření o 'tree' ───────────────────
// Přidáno k existující funkci v runar-app.js (~ř. 1893)
// tree handling:
//   document.getElementById('apane-tree').style.display = tab === 'tree' ? 'block' : 'none';
//   document.getElementById('atab-tree').classList.toggle('active', tab === 'tree');
//   } else if (tab === 'tree') {
//     document.getElementById('reader-hero').classList.add('hidden');
//     updateTreeTab();
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }

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
var userTreeFounded = false;   // z DB (tree_founded_at) — server-only sloupec
var _foundingPending = false;  // uzivatel klikl na zalozeni; ceka se na Norny
var _lifeRuneLang  = null;  // lang of stored reading
var _lifeRuneNum   = null;  // rune number 1-24

// Show Tree tab — renders correct state based on tier + data
// FREE-SOLO living tree (ADMIN-only beta) — crown-composer tree grown from ALL your readings.
// Source = the `readings` table (journal). Trunk = life rune; branches grow from readings.
// Popisek, který uživatel naklikal -> kanonický slug, kterým mluví strom.
// AREAS/INTENTIONS (runar-runes.js) jsou index-paralelní pole; tady se z nich
// jen ČTE. Tvarové mapování (co znamená která oblast pro růst) si strom drží
// sám — proto slugy bydlí tady, ne ve sdílené vrstvě.
// Pořadí MUSÍ sedět na AREAS.en/AREAS.is. Hlídá smoke ⑬ (porovnává délky).
var TREE_AREA_SLUG = ['love', 'purpose', 'career', 'healing', 'spirituality', 'family', 'inner', 'crossroads'];

function _labelIndex(label, pack) {
  if (!label || typeof pack === 'undefined') return -1;
  var i = (pack.en || []).indexOf(label);
  if (i < 0) i = (pack.is || []).indexOf(label);
  return i;
}
function _areaSlug(label) {
  var i = _labelIndex(label, typeof AREAS !== 'undefined' ? AREAS : null);
  return i >= 0 ? (TREE_AREA_SLUG[i] || null) : null;
}
// Osa času mluví jazykem Noren (urd/verdandi/skuld) — týmž, jakým je psaná
// RUNAR_TREE.md §3A. INTENTIONS.norns je index-paralelní tabulka v runar-runes.js.
function _intentionNorn(label) {
  var i = _labelIndex(label, typeof INTENTIONS !== 'undefined' ? INTENTIONS : null);
  if (i < 0 || typeof INTENTIONS === 'undefined') return null;
  return (INTENTIONS.norns || [])[i] || null;
}

function readingsToTreeLog(rows) {
  var byGlyph = {};
  RUNES.forEach(function(r){ byGlyph[r.g] = ((r.elements && r.elements[0]) || 'Earth').toLowerCase(); });
  // Blank/Óðinn: v runar-runes.js má elements ['Water','Shadow'], takže první je Water.
  // Strom ji ale řadí ke SHADOW (§3 RUNAR_TREE.md — studené a skryté runy) a renderer
  // pro ni má připravenou duchovní větev jako el:'shadow' (runar-branch.js, k:'odinn').
  // Přepisuje se TADY, ne ve sdílených datech — pořadí elementů čte i výklad čtení.
  var BLANK_G = null;
  RUNES.forEach(function(r){ if (r.n === 'Blank') { BLANK_G = r.g; byGlyph[r.g] = 'shadow'; } });
  var out = [];
  (rows || []).forEach(function(row) {
    var name = (row.rune_name || '').toUpperCase();
    var isSpread = /NORNS|KRIZ|CROSS|COMPASS|HORSESHOE|YGGDRASIL/.test(name);
    var src = (row.rune_glyph || '') + ' ' + (row.short_text || '');
    var runes = [];
    // Ptáme se, jestli je znak ZNÁMÝ GLYF, ne jestli padne do runového rozsahu.
    // Rozsahová podmínka tiše vynechávala Blank ('○' je U+25CB) a tím maže celé čtení.
    // Zbytkové riziko, které tím vědomě beru: kdyby model napsal '○' do prózy, přibude
    // fantomová duchovní větev. Menší zlo než mazat zaplacené čtení — a §5 stejně
    // zakazuje '○' jako zobrazení Blank runy, takže do Rúnarova slovníku nepatří.
    for (var i = 0; i < src.length; i++) {
      var g = src.charAt(i);
      if (!byGlyph[g]) continue;
      runes.push(g === BLANK_G ? { rune: g, el: 'shadow', blank: true }
                               : { rune: g, el: byGlyph[g] });
    }
    if (!runes.length) return;
    if (!isSpread) runes = [runes[0]];
    var area = (row.area && row.area !== 'spread') ? row.area : (row.aol || null);
    out.push({ spread: isSpread ? name.toLowerCase() : 'single', runes: runes,
               area: _areaSlug(area), intention: _intentionNorn(row.intention) });
  });
  return out;
}

// Přehrávání růstu. Celý log si držíme tady; posuvník mění jen KOLIK z něj se pošle.
var _treeLog  = [];      // všechna čtení, chronologicky
var _treeRkey = null;    // klíč životní runy pro renderer
var _treeDob  = null;
var _treeSeekWired = false;

// Vykreslí strom ve stavu „po n čteních". n === null nebo n === délka logu = celý strom.
// Renderer počítá věk z délky logu, takže kratší log = MLADŠÍ strom, ne jen chudší.
// Na nule se rozsvítí zakládací stav (founding), tedy tři kořeny bez koruny.
function _drawTreeAt(n) {
  var cv = document.getElementById('tree-living-canvas');
  if (!cv || !window.RunarTreeProd || !_treeRkey) return;
  var full = (n == null || n >= _treeLog.length);
  var view = full ? _treeLog : _treeLog.slice(0, n);
  _treeViewN = n;
  _treePick = window.RunarTreeProd.render(cv, { log: view, rune: _treeRkey, dob: _treeDob }) || null;
  _treeHighlight(cv);

  var lbl = document.getElementById('tree-seek-lbl');
  if (!lbl) return;
  if (full)            lbl.textContent = tp('tree_hist_all', { casts: vn('cast', _treeLog.length, lang) });
  else if (view.length === 0) lbl.textContent = t('tree_hist_seed');
  else                 lbl.textContent = tp('tree_hist_at', { k: view.length, n: _treeLog.length });
}

// ── INSPEKCE VĚTVE (admin diagnostika) ────────────────────────────────────
// Aby owner mohl místo „nějaká větev poskočila" říct „tahle: Kenaz / oheň / 4 čtení".
// Portováno z labu (crown-composer.html · _pick + showInspect).
var _treePick = null;
var _treeInspWired = false;
var _treeSelK = null;    // index vybrane vetve; drzi se pres posun posuvniku
var _treeViewN = null;   // aktualni poloha posuvniku (kvuli prekresleni po kliku)

function _inspHint() {
  var box = document.getElementById('tree-insp');
  if (box) box.innerHTML = '<span class="ti-dim">' + t('tree_insp_hint') + '</span>';
}

function _inspShow(m) {
  var box = document.getElementById('tree-insp');
  if (!box) return;
  // Hodnoty jsou NAŠE data (runar-branch.js), ne uživatelský vstup — proto se
  // nescreenují. Kdyby sem někdy šel text od uživatele, musí projít escapeHtml.
  var poradi = (m.ord != null) ? (' <span class="ti-dim">· ' + (m.ord + 1) + '.</span>') : '';
  var dalsi  = (m.rank && m.rank.length > 1)
      ? ('<br><span class="ti-dim">pořadí run: ' + m.rank.join(' › ') + '</span>') : '';
  box.innerHTML =
    '<span class="ti-glyph">' + m.g + '</span><b>' + (m.name || '') + '</b>' + poradi +
    '<br>' + m.el + ' <span class="ti-dim">·</span> ' + m.aett +
    ' <span class="ti-dim">·</span> ' + m.world +
    '<br>' + tp('tree_insp_count', { casts: vn('cast', m.count || 0, lang) }) +
    dalsi;
}

// Obtáhne vybranou větev zlatou linkou a zároveň obnoví panel — takže když
// posuneš posuvník, VIDÍŠ, jestli ta samá větev změnila runu. To je celý smysl:
// odlišit „strom se změnil, protože přibylo čtení" od „změnil se sám".
function _treeHighlight(cv) {
  if (_treeSelK == null || !_treePick || !_treePick.pick) return;
  var sel = null, p = _treePick.pick;
  for (var i = 0; i < p.length; i++) if (p[i].k === _treeSelK) sel = p[i];
  if (!sel) { _inspHint(); return; }   // vetev v tomhle stavu jeste neexistuje
  var ctx = cv.getContext('2d');
  ctx.save();
  ctx.strokeStyle = 'rgba(255,191,0,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (var j = 0; j < sel.pts.length; j++) {
    var q = sel.pts[j];
    if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.restore();
  _inspShow(sel.meta);
}

// Klik/tap -> nejbližší bod větve do 22 px. Souřadnice jsou v prostoru plátna
// (W×H z rendereru), ne v CSS pixelech — proto přepočet přes getBoundingClientRect.
function _inspHit(ev) {
  if (!_treePick || !_treePick.pick || !_treePick.pick.length) return;
  var cv = document.getElementById('tree-living-canvas');
  if (!cv) return;
  var r = cv.getBoundingClientRect();
  // Skryty panel -> rect 0x0 -> deleni nulou -> Infinity -> trefovani mlcky nefunguje.
  // Radsi nahlas nic nedelat nez tise pocitat s nekonecnem.
  if (!r.width || !r.height || !_treePick.W || !_treePick.H) return;
  var px = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
  var py = (ev.touches && ev.touches[0]) ? ev.touches[0].clientY : ev.clientY;
  var mx = (px - r.left) * (_treePick.W / r.width);
  var my = (py - r.top)  * (_treePick.H / r.height);
  var best = null, bd = 22;
  for (var i = 0; i < _treePick.pick.length; i++) {
    var p = _treePick.pick[i];
    for (var j = 0; j < p.pts.length; j++) {
      var dx = p.pts[j].x - mx, dy = p.pts[j].y - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = p; }
    }
  }
  if (best) { _treeSelK = best.k; _drawTreeAt(_treeViewN); }
  else { _treeSelK = null; _drawTreeAt(_treeViewN); _inspHint(); }
}

// Zlatá výplň dráhy — týž mechanismus jako audio seek (runar-reading.js:625).
function _treeSeekPaint(el) {
  var max = +el.max || 1;
  el.style.setProperty('--pct', ((+el.value / max) * 100).toFixed(1) + '%');
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
    _treeLog  = log;
    _treeRkey = bk ? bk.k : 'berkano';
    _treeDob  = { d: readerUser.d, m: readerUser.m, y: readerUser.y };
    wrap.style.display = 'block';

    var bar  = document.getElementById('tree-seek-bar');
    var seek = document.getElementById('tree-seek');
    if (bar && seek) {
      // Jedno čtení se přehrávat nedá — posuvník by měl jedinou polohu.
      bar.style.display = (log.length >= 2) ? 'flex' : 'none';
      seek.max   = log.length;
      seek.value = log.length;          // start vždy u dneška
      _treeSeekPaint(seek);
      if (!_treeSeekWired) {
        _treeSeekWired = true;
        seek.addEventListener('input', function () {
          _treeSeekPaint(seek);
          _drawTreeAt(+seek.value);
        });
      }
    }
    var insp = document.getElementById('tree-insp');
    if (insp) {
      insp.style.display = 'block';
      _inspHint();
      if (!_treeInspWired) {
        _treeInspWired = true;
        cv.style.cursor = 'pointer';
        cv.addEventListener('click', _inspHit);
      }
    }
    _drawTreeAt(null);
  } catch(e) {}
}

function updateTreeTab() {
  var isIs = lang === 'is';
  var hasDob = readerUser && readerUser.d && readerUser.m && readerUser.y;
  var isStdPlus = currentUser && (userTier === 'standard' || userTier === 'premium' || isAdmin(currentUser.email));
  var rune = hasDob ? calcLifeRune(readerUser.d, readerUser.m, readerUser.y) : null;

  // Hide all states
  // 'tree-founding-cta' tu 2026-07-19 CHYBELO -> jednou zobrazene uz se neskrylo
  // a prosakovalo i do stavu bez zivotni runy (pod formular na datum narozeni).
  var states = ['tree-no-dob','tree-rs-teaser','tree-reveal-cta','tree-loading','tree-reading-exists','tree-founding-cta'];
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

  // Hotove cteni se ukazuje VSEM tierum. Do 2026-07-19 tenhle test zil az ZA
  // `return` z RS vetve, takze Rune Seeker svou zivotni runu nikdy neuvidel:
  // vygenerovala se, jednou zobrazila, a pri prvnim prekresleni tabu se vratil
  // teaser s tlacitkem REVEAL. Tier rozhoduje o tom, jak se cteni NABIZI —
  // ne o tom, jestli uz hotove cteni smi uzivatel videt.
  if (_lifeRuneText) {
    _showTreeReading(rune, runeName, isIs);
    var tnsAll = document.getElementById('tree-name-section');
    if (tnsAll) tnsAll.style.display = 'block';
    _renderTreeNameState();
    // Krok 2 ritualu: zivotni runa je, strom jeste ne -> nabidnout zalozeni.
    var fcta = document.getElementById('tree-founding-cta');
    if (fcta) {
      fcta.style.display = userTreeFounded ? 'none' : 'block';
      var fi = document.getElementById('tree-founding-intro');
      var fb = document.getElementById('tree-founding-btn');
      if (fi) fi.textContent = t('tree_founding_intro');
      if (fb) fb.textContent = t('tree_founding_btn');
    }
    return;
  }

  if (!isStdPlus) {
    // RS teaser
    var teaserEl = document.getElementById('tree-rs-teaser');
    if (teaserEl) {
      teaserEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-teaser');
      var gl = document.getElementById('tree-rune-glyph-teaser');
      if (nm) nm.textContent = runeName;
      if (gl) gl.innerHTML = runeSvg(rune, { frame: false, cls: 'rune-svg-fl' });
      var tt = document.getElementById('tree-teaser-text');
      if (tt) tt.textContent = t('tree_rs_teaser');
      var lb = document.getElementById('tree-rune-label'); if (lb) lb.textContent = t('life_rune_lbl');
      // Credits balance + button state
      var LIFE_RUNE_COST = (SPREAD_COSTS && SPREAD_COSTS.life_rune) ? SPREAD_COSTS.life_rune.credits : 3;
      var bal = typeof userCredits !== 'undefined' ? userCredits : 0;
      var costLbl = document.getElementById('tree-rs-cost-label');
      var balLbl  = document.getElementById('tree-rs-balance-label');
      var balVal  = document.getElementById('tree-rs-balance-val');
      if (costLbl) costLbl.textContent = LIFE_RUNE_COST > 0
        ? vn('unit', LIFE_RUNE_COST, lang)
        : t('life_rune_free');
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

  // Sem se dojde jen bez hotoveho cteni (test vys) a jako std+ -> nabidka.
  {
    var ctaEl = document.getElementById('tree-reveal-cta');
    if (ctaEl) {
      ctaEl.style.display = 'block';
      var nm = document.getElementById('tree-rune-name-cta');
      var gl = document.getElementById('tree-rune-glyph-cta');
      if (nm) nm.textContent = runeName;
      if (gl) gl.innerHTML = runeSvg(rune, { frame: false, cls: 'rune-svg-fl' });
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
  if (gl) gl.innerHTML = ' ' + runeSvg(rune, { frame: false, cls: 'rune-svg-fl' });
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

async function setTreeDOB() {
  var d = parseInt(document.getElementById('tree-dob-d').value);
  var m = parseInt(document.getElementById('tree-dob-m').value);
  var y = parseInt(document.getElementById('tree-dob-y').value);
  if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2099) {
    var btn = document.getElementById('tree-dob-btn');
    if (btn) { btn.textContent = t('invalid_date'); setTimeout(function(){ btn.textContent = t('tree_reveal_btn') + ' →'; }, DELAY_ERROR_RESET); }
    return;
  }
  readerUser.d = d; readerUser.m = m; readerUser.y = y;
  // Save DOB to DB. supabase-js RESOLVES a failed write as { error } — it never throws — so
  // the old .then(noop).catch() could not see a failure at all. A lost DOB is invisible until
  // the next login, when the life rune (computed from memory) is simply gone.
  if (currentUser) {
    var _dobRes = await sb.from('user_profiles')
      .update({ dob_day: d, dob_month: m, dob_year: y }).eq('id', currentUser.id);
    if (_dobRes && _dobRes.error) {
      console.error('persist DOB failed:', _dobRes.error.message);
      showToast(t('err_save_failed'));
    }
  }
  updateTreeTab();
}

// Render tree-name section in the right state: a saved name -> read-only display,
// otherwise the edit input. Single source of truth = currentUser.tree_name.
function _renderTreeNameState() {
  var editV = document.getElementById('tree-name-edit');
  var dispV = document.getElementById('tree-name-display');
  var name = (currentUser && currentUser.tree_name) ? currentUser.tree_name : '';
  // Keep all labels localized regardless of state
  var tnl = document.getElementById('tree-name-label'); if (tnl) tnl.textContent = t('tree_name_label');
  var tnb = document.getElementById('tree-name-save-btn'); if (tnb) tnb.textContent = t('save_btn');
  var dlbl = document.getElementById('tree-named-lbl'); if (dlbl) dlbl.textContent = t('tree_named_label');
  var elink = document.getElementById('tree-name-edit-link'); if (elink) elink.textContent = t('tree_name_edit');
  setPH('tree-name-inp', t('tree_name_ph'));
  if (name) {
    var nmEl = document.getElementById('tree-named-nm'); if (nmEl) nmEl.textContent = name;
    if (editV) editV.style.display = 'none';
    if (dispV) dispV.style.display = 'block';
  } else {
    if (dispV) dispV.style.display = 'none';
    if (editV) editV.style.display = 'block';
  }
}

// 'edit' link: switch back to the input, pre-filled with the current name.
function editTreeName() {
  var editV = document.getElementById('tree-name-edit');
  var dispV = document.getElementById('tree-name-display');
  var inp = document.getElementById('tree-name-inp');
  if (inp) inp.value = (currentUser && currentUser.tree_name) ? currentUser.tree_name : '';
  if (dispV) dispV.style.display = 'none';
  if (editV) editV.style.display = 'block';
  if (inp) inp.focus();
}

async function saveTreeName() {
  var inp = document.getElementById('tree-name-inp');
  var saved = document.getElementById('tree-name-saved');
  if (!inp || !currentUser) return;
  var name = inp.value.trim();
  if (!name) return;
  try {
    const _treeRes = await sb.from('user_profiles').update({ tree_name: name }).eq('id', currentUser.id);
    if (_treeRes && _treeRes.error) {
      console.error('persist tree name failed:', _treeRes.error.message);
      showToast(t('err_save_failed'));
    }
    currentUser.tree_name = name;
    _renderTreeNameState();  // swap to read-only display = the confirmation
  } catch(e) {
    console.warn('saveTreeName:', e.message);
    if (saved) {
      saved.textContent = t('tree_name_err');
      saved.style.display = 'block';
      setTimeout(function(){ saved.style.display = 'none'; }, DURATION_SAVED);
    }
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
  // Zivotni runa je NEMENNA. Skutecna brana je DB trigger trg_life_rune_immutable
  // (sql/2026-07-19_life_rune_immutable.sql) — sloupce life_rune_* jsou pro klienta
  // zapisovatelne, takze tenhle radek obejde kazdy, kdo umi otevrit konzoli.
  // Je tu proto, aby se nestrhl kredit za zapis, ktery server stejne odmitne.
  if (_lifeRuneText) return;

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
  if (loadGlyph) loadGlyph.innerHTML = runeSvg(rune, { frame: false, cls: 'rune-svg-fl' });
  if (loadTxt) loadTxt.textContent = t('reading_loading');

  var name = readerUser.name || (lang === 'is' ? 'þú' : 'you');
  var mode = isPremium ? RUNAR_MODES.life_rune_premium : RUNAR_MODES.life_rune_standard;
  // Korekce pridava DISPECER buildLifeRunePrompt (character.js) — tady uz ne (§18).
  var prompt = buildLifeRunePrompt(name, rune, readerUser.d, readerUser.m, readerUser.y, lang, isPremium, corrections);
  var sys = buildSysPrompt(activeChar, lang);

  // Zivotni runa je zdarma pro vsechny. O cene rozhoduje PROXY podle mode='life_rune',
  // ne tahle dve cisla — klient si zdarma rict nesmi (viz claude-proxy, isLifeRune).
  var res = await callProxy(sys, prompt, mode.max_tokens, false, 0, null, 'life_rune');
  if (loadEl) loadEl.style.display = 'none';

  if (res.error) {
    if (loadTxt) { loadTxt.textContent = t('reading_error'); loadEl.style.display='block'; }
    return;
  }

  var text = applyISCorrections(res.text || '', lang, corrections);
  _lifeRuneText = text;
  // Zivotni runa prave vznikla -> Norny se maji objevit hned, bez reloadu.
  if (typeof _syncNornsGate === 'function') _syncNornsGate();
  _lifeRuneLang = lang;
  _lifeRuneNum  = RUNES.findIndex(function(r){ return r.n === rune.n; }) + 1;

  // Save to DB — the result MUST be checked (see setTreeDOB): discarding it leaves a life rune
  // that exists only in this session.
  if (currentUser) {
    var _lrRes = await sb.from('user_profiles').update({
      life_rune_number: _lifeRuneNum,
      life_rune_text:   _lifeRuneText,
      life_rune_lang:   _lifeRuneLang
    }).eq('id', currentUser.id);
    if (_lrRes && _lrRes.error) {
      console.error('persist life rune failed:', _lrRes.error.message);
      showToast(t('err_save_failed'));
    }
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



// Zalozeni stromu = jedny Norny, zdarma a bez hlasu. Tenhle prechod jen nastavi
// priznak a prepne do readeru; o tom, ze je cteni zdarma, rozhoduje PROXY podle
// mode='founding' (klient si zdarma rict nesmi). Server navic overi, ze zivotni
// runa uz existuje a ze strom jeste zalozeny neni.
async function startTreeFounding() {
  if (!currentUser || !_lifeRuneText || userTreeFounded) return;
  _foundingPending = true;
  if (typeof showAppTab === 'function') showAppTab('reading');
  if (typeof _setSpreadMode === 'function') _setSpreadMode('norns');
  if (typeof showToast === 'function') showToast(t('tree_founding_toast'));
}

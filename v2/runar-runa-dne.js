// runar-runa-dne.js — Runa dne (Rún dagsins). Jen reader, načítá se za runar-helper.js.
// KUKY 2026-11-14 (DECISIONS 2026-11-14 (6)): tlačítko pod nápisem RÚNAR; klik → okno se dvěma volbami „I draw the rune“ (mřížka 25 run
// jako v tahu) a „Let the runes decide“ (runa hned, bez mřížky); text se pak objeví místo tlačítka. Jen text, zdarma, jednou za islandský
// den (= UTC) na účet, při znovuotevření týž text; jen přihlášení; do deníku ani do stromu ne. KUKY 2026-11-15: „postav to, ať to můžu
// dát i testerům na zkoušku“ → komu je otevřená, říká RUNE_OF_DAY.open_to (runar-config.js); bránu drží server (claude-proxy, rune_day).
// Prompt: buildDayRunePrompt (runar-character.js) — páky a výjimky run tam. Text dne drží tabulka rune_day (sql/2026-11-15_rune_day.sql):
// appka ho jen čte (RLS: své řádky), zapisuje claude-proxy.

function _rodDnes() { return new Date().toISOString().slice(0, 10); }   // islandský den = UTC, týž klíč jako claude-proxy (denDnes)
function _rodSmi() {
  if (typeof currentUser === 'undefined' || !currentUser) return false;
  if (typeof RUNE_OF_DAY !== 'undefined' && RUNE_OF_DAY.open_to === 'all') return true;
  return (typeof isTester !== 'undefined' && isTester) || isAdmin(currentUser.email);
}
var _rodNacteno = '';
// Ukázat / skrýt prvek. NE jen atribut hidden: .rune-grid má v CSS display:grid a ten atribut přebije — mřížka pak v okně zůstala
// i po další volbě (hlášení 66f64c6b, KUKY 2026-11-16 „zůstane při další volbě zaseknuté… mělo by se to vracet k oknu se dvěma volbami“).
function _rodVid(id, ukaz) {
  var el = document.getElementById(id);
  if (!el) return;
  el.hidden = !ukaz;
  el.style.display = ukaz ? '' : 'none';
}
// Admin: „táhnout znovu“ týž den (KUKY 2026-11-15 „jako admin potřebuju reset tlačítko pro opakování vícekrát za den“). Klient jen
// pošle rod_znovu; adminovi ho uzná SERVER (claude-proxy: admin z JWT, uložený text dne přepíše) — tlačítko v DOM není brána.
var _rodZnovu = false;
function _rodAdmin() { return !!(typeof currentUser !== 'undefined' && currentUser && isAdmin(currentUser.email)); }   // uživatel + den, pro který už se dnešní text hledal (ať se DB neptá při každém překreslení)

// Ukáže/skryje tlačítko podle přihlášení a přístupu; jednou za den a uživatele zkusí najít dnešní text.
function _rodPaint() {
  var box = document.getElementById('rod');
  if (!box) return;
  if (!_rodSmi()) { _rodVid('rod', false); _rodVid('jtab', false); rodDenikPrepni('readings'); _rodNacteno = ''; return; }
  _rodVid('rod', true); _rodVid('jtab', true);
  var klic = currentUser.id + '|' + _rodDnes();
  if (_rodNacteno === klic) return;
  _rodNacteno = klic;
  _rodVid('rod-result', false);
  _rodVid('rod-btn', true);
  sb.from('rune_day').select('rune, text').eq('user_id', currentUser.id).eq('den', _rodDnes()).maybeSingle()
    .then(function (r) { if (r && r.data && r.data.text) _rodUkaz(r.data.rune, r.data.text); })
    .catch(function () {});   // bez tabulky (než owner pustí SQL) zůstane tlačítko; server pak runu dne odmítne
}

function _rodUkaz(runa, text) {
  var r = RUNES.find(function (x) { return x.n === runa; });
  if (!r || !text) return;
  var odst = String(text).split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  document.getElementById('rod-result').innerHTML =
    runeSvg(r, { frame: true, cls: 'tree-stone' }) + '<div class="flbl">' + escapeHtml(rn(r)) + '</div>'
    + odst.map(function (p) { return '<p class="tree-reading-text">' + escapeHtml(p) + '</p>'; }).join('')   // jako text životní runy
    + (_rodAdmin() ? '<button type="button" class="tree-tester-btn" onclick="rodZnovu()">' + escapeHtml(t('rod_reset')) + '</button>' : '');
  _rodVid('rod-btn', false);
  _rodVid('rod-result', true);
}

function rodOtevri() {
  if (!_rodSmi()) return;
  _rodVid('rod-choices', true);
  _rodVid('rod-grid', false);
  document.getElementById('rod-state').innerHTML = '';
  document.getElementById('rod-modal').classList.add('open');
}
function rodZnovu() {
  if (!_rodAdmin()) return;
  _rodZnovu = true;
  _rodVid('rod-result', false);
  _rodVid('rod-btn', true);
  rodOtevri();
}
function rodZavri() { document.getElementById('rod-modal').classList.remove('open'); }

// „I draw the rune“ — mřížka 25 run jako v tahu (kámen = runeSvg frame:true, §5)
function rodMrizka() {
  var g = document.getElementById('rod-grid');
  g.innerHTML = '';
  RUNES.forEach(function (r) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rb';
    var sp = rnSplit(r);
    b.innerHTML = runeSvg(r, { frame: true, cls: 'rb-svg' }) + '<span class="rb-n">' + escapeHtml(sp.name) + '</span>'
      + (sp.tr ? '<span class="rb-t">(' + escapeHtml(sp.tr) + ')</span>' : '');
    b.onclick = function () { _rodCti(r); };
    g.appendChild(b);
  });
  _rodVid('rod-choices', false);
  _rodVid('rod-grid', true);
}
// „Let the runes decide“ — runa hned, bez mřížky
function rodNahoda() { _rodCti(RUNES[Math.floor(Math.random() * RUNES.length)]); }

var _rodBezi = false;
async function _rodCti(r) {
  if (_rodBezi) return;
  _rodBezi = true;
  try {   // celé uvnitř try: výjimka kdekoli níž nesmí nechat _rodBezi zamčené (pak by runa dne do obnovení stránky nereagovala)
  _rodVid('rod-choices', false);
  _rodVid('rod-grid', false);
  var stav = document.getElementById('rod-state');
  stav.innerHTML = runeSvg(r, { frame: true, cls: 'tree-stone' }) + '<div class="flbl">' + escapeHtml(rn(r)) + '</div>'
    + _cekaniHtml();   // komponenta čekání jako u čtení (hlášení 64005ae3; runar-utils.js)
    var mode = RUNAR_MODES.rune_day;
    var prompt = buildDayRunePrompt(r, lang, corrections);
    var sys = buildSysPrompt(activeChar, lang);
    // Zdarma rozhoduje PROXY podle mode='rune_day' (claude-proxy, isRuneDay), ne tahle čísla.
    var res = await callProxy(sys, prompt, mode.max_tokens, false, 0, null, 'rune_day', null, _rodZnovu ? { rod_znovu: true } : null);
    if (res.error || !res.text) { stav.innerHTML = '<p class="note">' + escapeHtml(t('err_generic')) + '</p>'; return; }
    // Server mohl vrátit dnešní text z jiného zařízení — pak platí jeho runa, ne ta, kterou člověk právě zvolil.
    _rodZnovu = false;
    _rodUkaz(res.rune || r.n, res.text);
    rodZavri();
    var box = document.getElementById('rod');
    if (box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally { _rodBezi = false; }
}

// ─── Deník runy dne (2026-11-17) ─────────────────────────────────────────────
// Owner 2026-11-17: „umožníme zápis do deníku … jiný deník než runový, ale s tím, že vidí, jakou runu ten den vytáhl, a může si
// zapsat, co se mu líbilo“; k první verzi (rešerše, RUNAR_BACKLOG „Deník runy dne“) „souhlasím“: runa dne + jedno volné pole,
// volitelné ohlédnutí později, seznam bez počítadla, výběr podle runy. Zápis jen do rune_day.note / note_later
// (sql/2026-11-17_rune_day_poznamky.sql; klientskou stranu hlídá verify_write_surface). Neuložený text zůstává v poli — nikdy tiše neztratit.
var _rodJ = { rows: [], runa: '' };
function rodDenikPrepni(co) {
  var rod = co === 'rod';
  _rodVid('rod-journal', rod);
  _rodVid('jread', !rod);
  var a = document.getElementById('jtab-readings'), b = document.getElementById('jtab-rod');
  if (a) a.classList.toggle('active', !rod);
  if (b) b.classList.toggle('active', rod);
  if (rod) rodDenikNacti();
}
async function rodDenikNacti() {
  var box = document.getElementById('rod-journal');
  if (!box || !currentUser) return;
  const { data, error } = await sb.from('rune_day').select('den, rune, text, note, note_later')
    .eq('user_id', currentUser.id).order('den', { ascending: false }).limit(400);
  if (error) {
    console.error('rune day journal read failed:', error.message);
    box.innerHTML = '<p class="note">' + escapeHtml(t('err_generic')) + '</p>';
    return;
  }
  _rodJ.rows = data || [];
  _rodDenikKresli();
}
function rodDenikRuna(n) { _rodJ.runa = n || ''; _rodDenikKresli(); }
function _rodDenikKresli() {
  var box = document.getElementById('rod-journal');
  if (!box) return;
  var rows = _rodJ.rows;
  if (!rows.length) { box.innerHTML = '<p class="note">' + escapeHtml(t('rod_j_empty')) + '</p>'; return; }
  var runy = [];
  rows.forEach(function (r) { if (runy.indexOf(r.rune) === -1) runy.push(r.rune); });
  var najdi = function (n) { return RUNES.find(function (x) { return x.n === n; }); };
  var vyber = runy.length < 2 ? '' : '<div style="display:flex;margin-bottom:12px;"><select class="journal-filter-select" onchange="rodDenikRuna(this.value)">'
    + '<option value="">' + escapeHtml(t('jf_all_runes')) + '</option>'
    + runy.map(function (n) { var r = najdi(n); return '<option value="' + escapeHtml(n) + '"' + (n === _rodJ.runa ? ' selected' : '') + '>'
      + escapeHtml(r ? rn(r) : n) + '</option>'; }).join('') + '</select></div>';
  var dnes = _rodDnes();
  var karty = rows.filter(function (r) { return !_rodJ.runa || r.rune === _rodJ.runa; }).map(function (r) {
    var ru = najdi(r.rune), d = escapeHtml(String(r.den));
    var odst = String(r.text || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    return '<div class="jcard"><div class="jcard-header" role="button" aria-expanded="false" onclick="rodDenikOtevri(this, \'' + d + '\')">'
      + '<div class="jcard-left">' + (ru ? runeSvg(ru, { frame: true, cls: 'jcard-stone' }) : '')
      + '<div class="jcard-info"><div class="jcard-name">' + escapeHtml(ru ? rn(ru) : r.rune) + '</div>'
      + '<div class="jcard-date">' + escapeHtml(datumUI(r.den, lang)) + '</div>'
      + '<div class="jcard-excerpt">' + escapeHtml(r.note || odst[0] || '') + '</div></div></div><span class="xp-plus" aria-hidden="true">+</span></div>'
      + '<div class="jcard-body" id="rodj-' + d + '" hidden>'
      + odst.map(function (p) { return '<p class="jcard-text">' + escapeHtml(p) + '</p>'; }).join('')
      + '<div class="jcard-layer-lbl">' + escapeHtml(t('rod_j_note_lbl')) + '</div>'
      + '<textarea class="txt" rows="3" maxlength="2000" id="rodn-' + d + '" placeholder="' + escapeHtml(t('rod_j_note_ph')) + '">'
      + escapeHtml(r.note || '') + '</textarea>'
      + (String(r.den) < dnes ? '<div class="jcard-layer-lbl">' + escapeHtml(t('rod_j_later_lbl')) + '</div>'
        + '<textarea class="txt" rows="3" maxlength="2000" id="rodl-' + d + '">' + escapeHtml(r.note_later || '') + '</textarea>' : '')
      + '<button type="button" class="btn-half" onclick="rodDenikUloz(\'' + d + '\')">' + escapeHtml(t('save_btn')) + '</button>'
      + '</div></div>';
  }).join('');
  box.innerHTML = vyber + karty;
}
function rodDenikOtevri(hlava, den) {
  var b = document.getElementById('rodj-' + den);
  if (!b) return;
  var otevrit = b.hidden;
  b.hidden = !otevrit;
  if (hlava) hlava.setAttribute('aria-expanded', otevrit ? 'true' : 'false');
}
async function rodDenikUloz(den) {
  if (!currentUser) return;
  var n = document.getElementById('rodn-' + den), l = document.getElementById('rodl-' + den);
  var row = _rodJ.rows.find(function (r) { return String(r.den) === den; });
  var note = n ? n.value.trim().slice(0, 2000) : '', later = l ? l.value.trim().slice(0, 2000) : '';
  const { error } = await sb.from('rune_day').update({ note: note || null, note_later: l ? (later || null) : (row ? row.note_later : null) })
    .eq('user_id', currentUser.id).eq('den', den);
  if (error) {   // text zůstává v poli
    console.error('rune day note save failed:', error.message);
    showToast(t('err_generic'));
    return;
  }
  if (row) { row.note = note || null; if (l) row.note_later = later || null; }
  showToast(t('st_saved'));
}

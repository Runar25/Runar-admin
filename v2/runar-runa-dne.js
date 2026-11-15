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
// Admin: „táhnout znovu“ týž den (KUKY 2026-11-15 „jako admin potřebuju reset tlačítko pro opakování vícekrát za den“). Klient jen
// pošle rod_znovu; adminovi ho uzná SERVER (claude-proxy: admin z JWT, uložený text dne přepíše) — tlačítko v DOM není brána.
var _rodZnovu = false;
function _rodAdmin() { return !!(typeof currentUser !== 'undefined' && currentUser && isAdmin(currentUser.email)); }   // uživatel + den, pro který už se dnešní text hledal (ať se DB neptá při každém překreslení)

// Ukáže/skryje tlačítko podle přihlášení a přístupu; jednou za den a uživatele zkusí najít dnešní text.
function _rodPaint() {
  var box = document.getElementById('rod');
  if (!box) return;
  if (!_rodSmi()) { box.hidden = true; _rodNacteno = ''; return; }
  box.hidden = false;
  var klic = currentUser.id + '|' + _rodDnes();
  if (_rodNacteno === klic) return;
  _rodNacteno = klic;
  document.getElementById('rod-result').hidden = true;
  document.getElementById('rod-btn').hidden = false;
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
  document.getElementById('rod-btn').hidden = true;
  document.getElementById('rod-result').hidden = false;
}

function rodOtevri() {
  if (!_rodSmi()) return;
  document.getElementById('rod-choices').hidden = false;
  document.getElementById('rod-grid').hidden = true;
  document.getElementById('rod-state').innerHTML = '';
  document.getElementById('rod-modal').classList.add('open');
}
function rodZnovu() {
  if (!_rodAdmin()) return;
  _rodZnovu = true;
  document.getElementById('rod-result').hidden = true;
  document.getElementById('rod-btn').hidden = false;
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
  document.getElementById('rod-choices').hidden = true;
  g.hidden = false;
}
// „Let the runes decide“ — runa hned, bez mřížky
function rodNahoda() { _rodCti(RUNES[Math.floor(Math.random() * RUNES.length)]); }

var _rodBezi = false;
async function _rodCti(r) {
  if (_rodBezi) return;
  _rodBezi = true;
  document.getElementById('rod-choices').hidden = true;
  document.getElementById('rod-grid').hidden = true;
  var stav = document.getElementById('rod-state');
  stav.innerHTML = runeSvg(r, { frame: true, cls: 'tree-stone' }) + '<div class="flbl">' + escapeHtml(rn(r)) + '</div>'
    + '<p class="note">' + escapeHtml(t('reading_loading')) + '</p>';
  try {
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

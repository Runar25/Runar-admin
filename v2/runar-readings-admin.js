// Shrine admin — in-app readings viewer (public.readings via the list-readings edge
// function). readings is own-rows by RLS, so this reads through an admin-gated
// service-role function (mirror of runar-reports-admin.js). Loaded by runar-shrine.html;
// uses the shared `sb` client + shared escapeHtml (both defined before this runs).
// Purpose: review reading QUALITY across all users/testers without screenshots.
//
// ── DATABÁZE ČTENÍ (2026-10-05, KUKY „chci začít dělat databázi čtení… bude super, pokud můžu vybrat jednu runu, třeba
// Hagalaz, a určitý obraz, a tím uvidím všechna různá čtení toho obrazu pro tu runu. Pravděpodobně najdeme i další využití.“)
// Druhá kopie dat nevzniká (§20): čtení, prompt_draws (obraz, význam, úhel, podoba oblasti), usage.model a ownerovy reporty /
// ✦ Keep přicházejí z list-readings; tady se jen třídí a filtruje. Obraz se páruje s řádkem RUNE_IMAGES (runar-character.js)
// podle EN i IS znění — islandské a anglické čtení téhož obrazu tak padnou do jednoho řádku přehledu.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/list-readings';
  var _lang = 'all';
  var _testersOnly = false;
  var _wired = false;
  var _rune = '';                 // '' = posledních 100 čtení všech run; runa = až 500 čtení té runy
  var _f = { img: '', kws: '', model: '', area: '', seek: '', angle: '', ess: '', notes: false, keep: false, q: '' };
  var _rows = [];
  var SPREADY = ['NORNS', 'KRIZ', 'HORSESHOE', 'YGGDRASIL'];
  var REP_IKONA = { keep: '✦', other: '🚩', visual: '🎨', replace: '✏️', rephrase: '✏️', pattern: '🔁', crash: '💥' };

  // Shared escapeHtml is loaded (runar-utils.js); fall back to identity-safe if not.
  function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }
  function setErr(msg) {
    var st = document.getElementById('st-readings');
    if (st) { st.textContent = msg || ''; st.className = msg ? 'status err' : 'status'; }
  }

  // ── Obraz čtení → řádek banky (RUNE_IMAGES: [runa, sezóna, IS, EN, aspekt IS, aspekt EN, …]) ──
  function bezTecky(s) { return String(s || '').replace(/\.\s*$/, '').trim(); }
  var _bankaIdx = null;
  function banka() {
    if (_bankaIdx) return _bankaIdx;
    _bankaIdx = {};
    var rows = (typeof RUNE_IMAGES !== 'undefined') ? RUNE_IMAGES : [];
    rows.forEach(function (row, i) {
      [row[2], row[3]].forEach(function (t) { var k = bezTecky(t); if (k && !_bankaIdx[k]) _bankaIdx[k] = { i: i, row: row }; });
    });
    return _bankaIdx;
  }
  function obraz(r) {
    var d = r.prompt_draws || {};
    var t = bezTecky(d.image);
    if (!t) return { key: '', label: '(obraz nezaznamenán)', title: '' };
    var hit = banka()[t];
    if (hit) return { key: 'IMG#' + hit.i, label: hit.row[3] || t, title: hit.row[2] || '' };
    return { key: 'RAW#' + t, label: t, title: 'mimo dnešní banku obrazů' };
  }
  function model(r) { return (r.usage && r.usage.model) || '—'; }
  function vyznam(r) { return (r.prompt_draws && r.prompt_draws.kws) || ''; }
  // 2026-10-05 (KUKY: „chci víckrát vidět stejný obraz… jestli ho při stejné area a seeking řekne stejně, nebo udělá něco jinak“):
  // oblast a hledání se ukládají ŠTÍTKEM jazyka aplikace (data: anglické čtení s „Almenn leiðsögn“) → sjednotit na anglický
  // štítek přes AREAS/SEEKS (jeden zdroj, runar-runes.js), jinak by islandské čtení téhož výběru spadlo do jiné volby.
  function nadEN(sez, v) {
    if (!v || typeof sez === 'undefined' || !sez) return v || '';
    var i = (sez.en || []).indexOf(v);
    if (i === -1) i = (sez.is || []).indexOf(v);
    return i === -1 ? v : sez.en[i];
  }
  function oblast(r) { return nadEN(typeof AREAS !== 'undefined' ? AREAS : null, r.aol || (r.area === 'spread' ? '' : r.area)); }
  function hledani(r) { return nadEN(typeof SEEKS !== 'undefined' ? SEEKS : null, r.seeking); }
  // 2026-10-06 (KUKY „do shrine v reading chci ještě přidat angle, essence line, abych si mohl vybrat čtení na základě téhle selekce“
  // — owner prověřoval, jestli „nit“ v obraze dělá úhel „Open on the smallest detail“). Úhel = index do READING_ANGLES (islandský
  // pool má tytéž úhly ve stejném pořadí); esenční řádek = index rámce, u solu od v5.01 i vylosované sloveso (prompt_draws.verb).
  // Popisky bere z kódu (READING_ANGLES, ESSENCE_FRAMES, ESSENCE_VERBS_SOL) — znění se sem neopisuje (§20).
  function _je(v) { return v !== undefined && v !== null && v !== ''; }
  function uhel(r) { var d = r.prompt_draws || {}; return _je(d.angle) ? 'U' + d.angle : ''; }
  function uhelPopis(r) {
    var d = r.prompt_draws || {};
    return '[' + d.angle + '] ' + ((typeof READING_ANGLES !== 'undefined' && READING_ANGLES[d.angle]) || '');
  }
  function esence(r) { var d = r.prompt_draws || {}; return _je(d.essence) ? 'E' + d.essence + (_je(d.verb) ? '·' + d.verb : '') : ''; }
  function esencePopis(r) {
    var d = r.prompt_draws || {};
    if (d.essence === 'blank') return 'prázdná runa (vlastní rámec)';
    var fr = (typeof ESSENCE_FRAMES !== 'undefined' && ESSENCE_FRAMES[d.essence]) || '';
    var m = /one short line that ([^—.,]+)/.exec(fr);
    var sl = (_je(d.verb) && typeof ESSENCE_VERBS_SOL !== 'undefined') ? ESSENCE_VERBS_SOL[d.verb] : '';
    return '[' + d.essence + '] ' + (m ? m[1].trim() : '') + (sl ? ' · sol „' + sl + '“' : '');
  }
  var KLIC = { img: function (r) { return obraz(r).key; }, kws: vyznam, model: model, area: oblast, seek: hledani, angle: uhel, ess: esence };
  function reporty(r) { return Array.isArray(r.reports) ? r.reports : []; }
  function maPoznamku(r) { return reporty(r).some(function (x) { return x.type !== 'keep' && String(x.message || '').trim(); }); }
  function maKeep(r) { return reporty(r).some(function (x) { return x.type === 'keep'; }); }
  function hledatV(r) {
    var fu = Array.isArray(r.follow_up) ? r.follow_up : [];
    return [r.short_text, r.deep_text, r.question].concat(fu.map(function (x) { return (x.q || '') + ' ' + (x.a || ''); }))
      .concat(reporty(r).map(function (x) { return (x.message || '') + ' ' + (x.flagged || ''); })).join(' ').toLowerCase();
  }
  function prosel(r, bez) {
    if (bez !== 'img' && _f.img && obraz(r).key !== _f.img) return false;
    if (bez !== 'kws' && _f.kws && vyznam(r) !== _f.kws) return false;
    if (bez !== 'model' && _f.model && model(r) !== _f.model) return false;
    if (bez !== 'area' && _f.area && oblast(r) !== _f.area) return false;
    if (bez !== 'seek' && _f.seek && hledani(r) !== _f.seek) return false;
    if (bez !== 'angle' && _f.angle && uhel(r) !== _f.angle) return false;
    if (bez !== 'ess' && _f.ess && esence(r) !== _f.ess) return false;
    if (_f.notes && !maPoznamku(r)) return false;
    if (_f.keep && !maKeep(r)) return false;
    if (_f.q && hledatV(r).indexOf(_f.q.toLowerCase()) === -1) return false;
    return true;
  }

  window.filterReadings = function (lang) {
    _lang = lang;
    ['all', 'is', 'en'].forEach(function (l) {
      var el = document.getElementById('rd-f-' + l);
      if (el) el.classList.toggle('on', l === lang);
    });
    window.loadReadings();
  };

  window.toggleTestersOnly = function () {
    _testersOnly = !_testersOnly;
    var el = document.getElementById('rd-f-testers');
    if (el) el.classList.toggle('on', _testersOnly);
    window.loadReadings();
  };

  // Výběr runy načte až 500 jejích čtení (server filtruje podle rune_name); ostatní filtry běží tady nad načteným.
  window.setRdRune = function (v) {
    _rune = v || '';
    _f.img = ''; _f.kws = ''; _f.model = '';
    window.loadReadings();
  };
  window.setRdFilter = function (k, v) { _f[k] = v || ''; renderAll(); };
  window.toggleRdFilter = function (k) {
    _f[k] = !_f[k];
    var el = document.getElementById('rd-f-' + k);
    if (el) el.classList.toggle('on', _f[k]);
    renderAll();
  };
  var _souhrnKlice = [];
  window.pickRdImageIdx = function (i) { if (_souhrnKlice[i] !== undefined) window.pickRdImage(_souhrnKlice[i]); };
  window.pickRdImage = function (key) {
    _f.img = (_f.img === key) ? '' : key;
    renderAll();
    var list = document.getElementById('readings-list');
    if (list && list.scrollIntoView && _f.img) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.loadReadings = async function () {
    var list = document.getElementById('readings-list');
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading…</div>';
    setErr('');
    try {
      var tk = await token();
      if (!tk) throw new Error('Not signed in as admin');
      var res = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
        body: JSON.stringify({ action: 'list', lang: _lang, limit: _rune ? 500 : 100, testers_only: _testersOnly, rune: _rune || undefined }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      _rows = data.readings || [];
      renderAll();
    } catch (e) {
      list.innerHTML = '';
      setErr('Error: ' + e.message);
    }
  };

  // Volby výběrů: počty se počítají nad čtením, které projde OSTATNÍMI filtry (ať volba neukazuje nulu, kterou nejde vybrat).
  function naplnVyber(id, prazdny, klic, popis) {
    var el = document.getElementById(id);
    if (!el) return;
    var pocty = {}, popisy = {};
    _rows.forEach(function (r) {
      if (!prosel(r, klic)) return;
      var k = KLIC[klic](r);
      if (!k) return;
      pocty[k] = (pocty[k] || 0) + 1;
      if (!popisy[k]) popisy[k] = popis(r);
    });
    var klice = Object.keys(pocty).sort(function (a, b) { return pocty[b] - pocty[a]; });
    if (_f[klic] && klice.indexOf(_f[klic]) === -1) klice.unshift(_f[klic]);
    el.innerHTML = '<option value="">' + esc(prazdny) + '</option>' + klice.map(function (k) {
      var t = popisy[k] || k;
      return '<option value="' + esc(k) + '"' + (_f[klic] === k ? ' selected' : '') + '>' + esc((t.length > 70 ? t.slice(0, 70) + '…' : t) + ' (' + (pocty[k] || 0) + ')') + '</option>';
    }).join('');
  }
  function naplnRuny() {
    var el = document.getElementById('rd-rune');
    if (!el || el.options.length > 1) { if (el) el.value = _rune; return; }
    var runy = (typeof RUNES !== 'undefined') ? RUNES.map(function (r) { return r.n; }) : [];
    el.innerHTML = '<option value="">Všechny runy (posledních 100)</option>' +
      runy.concat(SPREADY).map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + '</option>'; }).join('');
    el.value = _rune;
  }

  // Přehled pro vybranou runu: obraz × kolikrát · významy · naposled · poznámky · ✦. Klik na řádek = jen čtení toho obrazu.
  function renderSouhrn() {
    var box = document.getElementById('rd-summary');
    if (!box) return;
    if (!_rune || !_rows.length) { box.innerHTML = ''; return; }
    var g = {};
    _rows.forEach(function (r) {
      if (!prosel(r, 'img')) return;
      var o = obraz(r);
      var x = g[o.key] = g[o.key] || { key: o.key, label: o.label, title: o.title, n: 0, kws: {}, last: '', notes: 0, keep: 0 };
      x.n++;
      var k = vyznam(r); if (k) x.kws[k] = (x.kws[k] || 0) + 1;
      if ((r.drawn_at || '') > x.last) x.last = r.drawn_at || '';
      if (maPoznamku(r)) x.notes++;
      if (maKeep(r)) x.keep++;
    });
    var radky = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
    _souhrnKlice = radky.map(function (x) { return x.key; });
    box.innerHTML = '<table class="rd-sum"><thead><tr><th>Obraz (' + esc(_rune) + ')</th><th>Význam</th><th>Čtení</th>' +
      '<th>Naposled</th><th>💬</th><th>✦</th></tr></thead><tbody>' + radky.map(function (x, i) {
        var kws = Object.keys(x.kws).map(function (k) { return k + (x.kws[k] > 1 ? ' ×' + x.kws[k] : ''); }).join(' · ');   // ' · ': starší čtení mají ve významu víc slov s čárkou
        return '<tr class="' + (_f.img === x.key ? 'on' : '') + '" onclick="pickRdImageIdx(' + i + ')" title="' + esc(x.title) + '">' +
          '<td>' + esc(x.label) + '</td><td>' + esc(kws) + '</td><td>' + x.n + '</td><td>' + esc((x.last || '').slice(0, 10)) + '</td>' +
          '<td>' + (x.notes || '') + '</td><td>' + (x.keep || '') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderAll() {
    naplnRuny();
    naplnVyber('rd-img', 'Všechny obrazy', 'img', function (r) { return obraz(r).label; });
    naplnVyber('rd-kws', 'Všechny významy', 'kws', vyznam);
    naplnVyber('rd-model', 'Všechny modely', 'model', model);
    naplnVyber('rd-area', 'Všechny oblasti', 'area', oblast);   // oblast a hledání při změně runy zůstávají — srovnání napříč runami
    naplnVyber('rd-seek', 'Všechna hledání', 'seek', hledani);
    naplnVyber('rd-angle', 'Všechny úhly', 'angle', uhelPopis);
    naplnVyber('rd-ess', 'Všechny esenční řádky', 'ess', esencePopis);
    renderSouhrn();
    render(_rows.filter(function (r) { return prosel(r); }));
  }

  function render(rows) {
    var list = document.getElementById('readings-list');
    if (!list) return;
    var countEl = document.getElementById('rd-count');
    if (countEl) countEl.textContent = _rows.length ? (rows.length + ' z ' + _rows.length) : '';
    if (!rows.length) { list.innerHTML = '<div class="empty">No readings.</div>'; return; }
    function inRow(lbl, val) {
      return val ? '<div class="rd-in"><span class="rd-in-l">' + lbl + '</span> ' + esc(val) + '</div>' : '';
    }
    list.innerHTML = rows.map(function (r) {
      var isSpread = r.area === 'spread';
      var when  = (r.drawn_at || '').replace('T', ' ').slice(0, 16);
      var glyph = esc(r.rune_glyph || '◻');
      var name  = esc(isSpread ? spreadLabel(r.rune_name, r.lang) : (r.rune_name || '').toUpperCase());
      var lng   = esc((r.lang || '').toUpperCase());
      var who   = esc(r.user_name || (r.user_id ? r.user_id.slice(0, 8) : '—'));
      var tier  = r.user_tier ? '<span class="rd-tier">' + esc(r.user_tier) + '</span>' : '';
      var tester = r.is_tester ? '<span class="rd-tester">TESTER</span>' : '';
      var mode = r.reading_mode === 'someone' ? '<span class="rd-mode">SOMEONE</span>' : '';
      // Single: reading text is in short_text. Spread: short_text = rune display, deep_text = reading.
      var bodyTxt  = isSpread ? (r.deep_text || '') : (r.short_text || '');
      var runeLine = isSpread ? esc(r.short_text || '') : '';

      // Every input the user picked, shown clearly (area is the 'spread' marker for spreads -> skip).
      var _addr = { kk: 'hann', kvk: 'hún', hk: 'hán' }[r.address] || r.address;
      var inputs = [
        inRow('Area', r.aol || (isSpread ? null : r.area)),
        inRow('Seeking', r.seeking),
        inRow('Intention', r.intention),
        inRow('Question', r.question),
        inRow('Life rune', r.life_rune),
        inRow('Address', (r.lang === 'is' && r.address) ? _addr : null)
      ].filter(Boolean).join('');
      var inputsHtml = inputs ? '<div class="rd-inputs">' + inputs + '</div>' : '';

      // 2026-10-05: z čeho čtení vzniklo (prompt_draws) — obraz, význam, úhel, podoba oblasti, model.
      var d = r.prompt_draws || {}, o = obraz(r);
      var skladba = [
        model(r) !== '—' ? '<span class="rd-tag">' + esc(model(r)) + '</span>' : '',
        vyznam(r) ? '<span class="rd-tag">význam: ' + esc(vyznam(r)) + '</span>' : '',
        uhel(r) ? '<span class="rd-tag" title="' + esc(uhelPopis(r)) + '">úhel ' + esc(uhelPopis(r).length > 64 ? uhelPopis(r).slice(0, 64) + '…' : uhelPopis(r)) + '</span>' : '',
        esence(r) ? '<span class="rd-tag" title="esenční řádek">esence ' + esc(esencePopis(r)) + '</span>' : '',
        d.area_face !== undefined ? '<span class="rd-tag">podoba ' + esc(d.area_face) + '</span>' : '',
        d.pin ? '<span class="rd-tag" title="obraz zvolil admin (2026-10-06) — nebyl to los">📌 obraz zvolen</span>' : '',
      ].filter(Boolean).join('');
      var skladbaHtml = (o.key || skladba) ? '<div class="rd-skladba">' +
        (o.key ? '<div class="rd-obraz" title="' + esc(o.title) + '">🖼 ' + esc(o.label) + '</div>' : '') + skladba + '</div>' : '';

      // Ask Rúnar follow-up exchange(s) captured with the reading.
      var fu = Array.isArray(r.follow_up) ? r.follow_up : [];
      var fuHtml = fu.length ? '<div class="rd-followup"><div class="rd-fu-lbl">✦ ASK RÚNAR</div>' +
        fu.map(function (x) {
          return '<div class="rd-fu"><div class="rd-fu-q">❝ ' + esc(x.q || '') + ' ❞</div>' +
                 '<div class="rd-fu-a">' + esc(x.a || '') + '</div></div>';
        }).join('') + '</div>' : '';

      // 2026-10-05: ownerovy reporty a ✦ Keep k tomuto čtení (bug_reports podle „reading <uuid>“).
      var reps = reporty(r);
      var repHtml = reps.length ? '<div class="rd-reps"><div class="rd-fu-lbl">💬 POZNÁMKY A ✦ KEEP</div>' + reps.map(function (x) {
        var ik = REP_IKONA[x.type] || '•';
        var zprava = String(x.message || '').trim();
        var vyber = String(x.flagged || '').trim();
        return '<div class="rd-rep"><span class="rd-rep-ik">' + ik + '</span> <span class="rd-rep-at">' + esc(String(x.at || '').replace('T', ' ').slice(0, 16)) + '</span> ' +
          (zprava ? '<span class="rd-rep-msg">' + esc(zprava) + '</span>' : '') +
          (vyber && (x.type === 'keep' || !zprava) ? '<div class="rd-rep-sel">„' + esc(vyber.length > 300 ? vyber.slice(0, 300) + '…' : vyber) + '“</div>' : '') +
          '</div>';
      }).join('') + '</div>' : '';

      return '<div class="rd-item">' +
        '<div class="rd-head">' +
          '<span class="rd-glyph">' + glyph + '</span>' +
          '<b>' + name + '</b>' +
          '<span class="rd-lang">' + lng + '</span>' +
          '<span class="rd-who">' + who + '</span>' + tier + tester + mode +
          '<span class="rd-when">' + esc(when) + '</span>' +
          (r.prompt_version ? '<span class="rd-ver">' + esc(r.prompt_version) + '</span>' : '') +
        '</div>' +
        (runeLine ? '<div class="rd-runes">' + runeLine + '</div>' : '') +
        inputsHtml +
        skladbaHtml +
        '<div class="rd-text">' + esc(bodyTxt) + '</div>' +
        fuHtml +
        repHtml +
        '<div class="rd-meta">' + (r.credits_used ? 'credit' : 'free') + '</div>' +
      '</div>';
    }).join('');
  }

  // View-only. Hodnocení čtení zatím nesou ownerovy reporty (✦ Keep, poznámky) z readeru — tady se jen zobrazí.
  window.initReadingsTab = function () { _wired = true; };
  // Pro test (scripts/verify_readings_db.js): vnitřek bez DOM a sítě.
  window.__rdTest = { obraz: obraz, prosel: prosel, setRows: function (x) { _rows = x; }, setRune: function (x) { _rune = x; }, f: _f, renderAll: renderAll };
})();

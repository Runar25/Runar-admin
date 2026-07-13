// Shrine admin — in-app readings viewer (public.readings via the list-readings edge
// function). readings is own-rows by RLS, so this reads through an admin-gated
// service-role function (mirror of runar-reports-admin.js). Loaded by runar-shrine.html;
// uses the shared `sb` client + shared escapeHtml (both defined before this runs).
// Purpose: review reading QUALITY across all users/testers without screenshots.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/list-readings';
  var _lang = 'all';
  var _limit = 100;
  var _testersOnly = false;
  var _wired = false;

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
        body: JSON.stringify({ action: 'list', lang: _lang, limit: _limit, testers_only: _testersOnly }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      render(data.readings || []);
    } catch (e) {
      list.innerHTML = '';
      setErr('Error: ' + e.message);
    }
  };

  function render(rows) {
    var list = document.getElementById('readings-list');
    if (!list) return;
    var countEl = document.getElementById('rd-count');
    if (countEl) countEl.textContent = rows.length ? (rows.length + ' shown') : '';
    if (!rows.length) { list.innerHTML = '<div class="empty">No readings.</div>'; return; }
    list.innerHTML = rows.map(function (r) {
      var isSpread = r.area === 'spread';
      var when  = (r.drawn_at || '').replace('T', ' ').slice(0, 16);
      var glyph = esc(r.rune_glyph || '◻');
      var name  = esc((r.rune_name || '').toUpperCase());
      var lng   = esc((r.lang || '').toUpperCase());
      var who   = esc(r.user_name || (r.user_id ? r.user_id.slice(0, 8) : '—'));
      var tier  = r.user_tier ? '<span class="rd-tier">' + esc(r.user_tier) + '</span>' : '';
      var tester = r.is_tester ? '<span class="rd-tester">TESTER</span>' : '';
      // Single: reading text is in short_text. Spread: short_text = rune display line,
      // deep_text = the reading. Show the full text either way (this is for analysis).
      var bodyTxt  = isSpread ? (r.deep_text || '') : (r.short_text || '');
      var runeLine = isSpread ? esc(r.short_text || '') : '';
      var meta = [
        r.area ? 'area: ' + esc(r.area) : '',
        r.seeking ? 'seeking: ' + esc(r.seeking) : '',
        r.life_rune ? 'life: ' + esc(r.life_rune) : '',
        r.credits_used ? 'credit' : 'free'
      ].filter(Boolean).join(' · ');
      var q = r.question ? '<div class="rd-q">❝ ' + esc(r.question) + ' ❞</div>' : '';
      return '<div class="rd-item">' +
        '<div class="rd-head">' +
          '<span class="rd-glyph">' + glyph + '</span>' +
          '<b>' + name + '</b>' +
          '<span class="rd-lang">' + lng + '</span>' +
          '<span class="rd-who">' + who + '</span>' + tier + tester +
          '<span class="rd-when">' + esc(when) + '</span>' +
        '</div>' +
        (runeLine ? '<div class="rd-runes">' + runeLine + '</div>' : '') +
        q +
        '<div class="rd-text">' + esc(bodyTxt) + '</div>' +
        (meta ? '<div class="rd-meta">' + meta + '</div>' : '') +
      '</div>';
    }).join('');
  }

  // View-only for now. Flag/annotate ("IS error" / "wrong meaning" / "gold") arrives with
  // the review table (DB). initReadingsTab keeps parity with the reports module wiring.
  window.initReadingsTab = function () { _wired = true; };
})();

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
    function inRow(lbl, val) {
      return val ? '<div class="rd-in"><span class="rd-in-l">' + lbl + '</span> ' + esc(val) + '</div>' : '';
    }
    list.innerHTML = rows.map(function (r) {
      var isSpread = r.area === 'spread';
      var when  = (r.drawn_at || '').replace('T', ' ').slice(0, 16);
      var glyph = esc(r.rune_glyph || '◻');
      var name  = esc((r.rune_name || '').toUpperCase());
      var lng   = esc((r.lang || '').toUpperCase());
      var who   = esc(r.user_name || (r.user_id ? r.user_id.slice(0, 8) : '—'));
      var tier  = r.user_tier ? '<span class="rd-tier">' + esc(r.user_tier) + '</span>' : '';
      var tester = r.is_tester ? '<span class="rd-tester">TESTER</span>' : '';
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
        inRow('Address', r.address ? _addr : null)
      ].filter(Boolean).join('');
      var inputsHtml = inputs ? '<div class="rd-inputs">' + inputs + '</div>' : '';

      // Ask Rúnar follow-up exchange(s) captured with the reading.
      var fu = Array.isArray(r.follow_up) ? r.follow_up : [];
      var fuHtml = fu.length ? '<div class="rd-followup"><div class="rd-fu-lbl">✦ ASK RÚNAR</div>' +
        fu.map(function (x) {
          return '<div class="rd-fu"><div class="rd-fu-q">❝ ' + esc(x.q || '') + ' ❞</div>' +
                 '<div class="rd-fu-a">' + esc(x.a || '') + '</div></div>';
        }).join('') + '</div>' : '';

      return '<div class="rd-item">' +
        '<div class="rd-head">' +
          '<span class="rd-glyph">' + glyph + '</span>' +
          '<b>' + name + '</b>' +
          '<span class="rd-lang">' + lng + '</span>' +
          '<span class="rd-who">' + who + '</span>' + tier + tester +
          '<span class="rd-when">' + esc(when) + '</span>' +
          (r.prompt_version ? '<span class="rd-ver">' + esc(r.prompt_version) + '</span>' : '') +
        '</div>' +
        (runeLine ? '<div class="rd-runes">' + runeLine + '</div>' : '') +
        inputsHtml +
        '<div class="rd-text">' + esc(bodyTxt) + '</div>' +
        fuHtml +
        '<div class="rd-meta">' + (r.credits_used ? 'credit' : 'free') + '</div>' +
      '</div>';
    }).join('');
  }

  // View-only for now. Flag/annotate ("IS error" / "wrong meaning" / "gold") arrives with
  // the review table (DB). initReadingsTab keeps parity with the reports module wiring.
  window.initReadingsTab = function () { _wired = true; };
})();

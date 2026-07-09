// Shrine admin — in-app reports viewer (public.bug_reports via the list-reports
// edge function). bug_reports is insert-only by RLS, so this reads through an
// admin-gated service-role function. Loaded by runar-shrine.html; uses the shared
// `sb` client (global const from the shrine inline script). Classic script.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/list-reports';
  var REP_EMOJI = { replace: '✏️', rephrase: '✏️', pattern: '🔁', visual: '🎨', crash: '💥', other: '🚩' };
  var _filter = 'new';
  var _wired = false;

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }

  function setErr(msg) {
    var st = document.getElementById('st-reports');
    if (st) { st.textContent = msg || ''; st.className = msg ? 'status err' : 'status'; }
  }

  window.filterReports = function (f) {
    _filter = f;
    var a = document.getElementById('rep-f-new'), b = document.getElementById('rep-f-all');
    if (a) a.classList.toggle('on', f === 'new');
    if (b) b.classList.toggle('on', f === 'all');
    window.loadReports();
  };

  window.loadReports = async function () {
    var list = document.getElementById('reports-list');
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading…</div>';
    setErr('');
    try {
      var tk = await token();
      if (!tk) throw new Error('Not signed in as admin');
      var res = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
        body: JSON.stringify({ action: 'list', status: _filter }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      render(data.reports || []);
    } catch (e) {
      list.innerHTML = '';
      setErr('Error: ' + e.message);
    }
  };

  function render(rows) {
    var list = document.getElementById('reports-list');
    if (!list) return;
    if (!rows.length) { list.innerHTML = '<div class="empty">No reports.</div>'; return; }
    list.innerHTML = rows.map(function (r) {
      var emoji = REP_EMOJI[r.type] || '🚩';
      var when = (r.reported_at || r.synced_at || '').replace('T', ' ').slice(0, 16);
      var flagged = r.flagged_text
        ? '<div class="rep-flagged">“' + esc(r.flagged_text) + '”' +
          (r.suggested_replacement ? ' → <b>' + esc(r.suggested_replacement) + '</b>' : '') + '</div>'
        : '';
      var meta = [r.tester, r.locale, r.app_version, r.screen_context, r.flagged_source, r.i18n_key]
        .filter(Boolean).map(esc).join(' · ');
      var st = r.status || 'new';
      return '<div class="rep-item rep-' + esc(st) + '">' +
        '<div class="rep-head">' + emoji + ' <b>' + esc(r.type || 'other') + '</b>' +
          '<span class="rep-when">' + esc(when) + '</span>' +
          '<span class="rep-badge">' + esc(st) + '</span></div>' +
        (r.message ? '<div class="rep-msg">' + esc(r.message) + '</div>' : '') +
        flagged +
        (meta ? '<div class="rep-meta">' + meta + '</div>' : '') +
        '<div class="rep-acts">' +
          '<button class="rep-act" data-id="' + esc(r.id) + '" data-s="triaged">triaged</button>' +
          '<button class="rep-act" data-id="' + esc(r.id) + '" data-s="fixed">fixed</button>' +
          '<button class="rep-act" data-id="' + esc(r.id) + '" data-s="new">reopen</button>' +
        '</div></div>';
    }).join('');
  }

  async function setStatus(id, status) {
    setErr('');
    try {
      var tk = await token();
      if (!tk) throw new Error('Not signed in as admin');
      var res = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
        body: JSON.stringify({ action: 'set_status', id: id, status: status }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      window.loadReports();
    } catch (e) {
      setErr('Error: ' + e.message);
    }
  }

  // One delegated click handler for the status buttons (avoids per-row inline onclick).
  window.initReportsTab = function () {
    if (_wired) return;
    var list = document.getElementById('reports-list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.rep-act');
      if (b && b.dataset.id) setStatus(b.dataset.id, b.dataset.s);
    });
    _wired = true;
  };
})();

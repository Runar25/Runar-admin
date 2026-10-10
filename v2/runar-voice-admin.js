// Shrine admin — záložka VOICE: živý stav předplatného ElevenLabs + spotřeba z naší evidence (KUKY 2026-09-25 „ano ukaž
// živý stav"). Data: edge funkce voice-usage (admin JWT; čte EL /v1/user/subscription a tabulku voice_usage přes service
// role, protože klient ji číst nesmí). Každé otevření uloží i snímek stavu (voice_quota_snapshots) — řada pro trend.
// Ceny se tu NEPOČÍTAJÍ: bydlí v RUNAR_PRICING.md / scripts/utils/stats.js (§20). Tady jen znaky.
// Loaded by runar-shrine.html; uses the shared `sb` client + escapeHtml.
// 2026-10-10 §31: popisky anglicky — shrine čtou oba admini a společná řeč se Sigrún je angličtina (do té doby česky);
// čísla en-GB a data ISO místo českého formátu.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/voice-usage';
  function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
  function num(n) { return (typeof n === 'number') ? n.toLocaleString('en-GB') : '—'; }
  function den(iso) { if (!iso) return '—'; var d = new Date(iso); return isNaN(d) ? '—' : d.toISOString().slice(0, 10); }
  var SKUPINY = { admin: 'Admin', tester: 'Testers', user: 'Users', unknown: 'No account' };

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }

  function radky(obj, popis) {
    var k = Object.keys(obj || {});
    if (!k.length) return '<div class="vc-empty">Nothing recorded yet.</div>';
    return '<table class="vc-tab"><tr><th></th><th>chars</th><th>plays</th></tr>' + k.sort(function (a, b) {
      return obj[b].chars - obj[a].chars; }).map(function (x) {
      return '<tr><td>' + esc(popis ? (popis[x] || x) : x) + '</td><td>' + num(obj[x].chars) + '</td><td>' + num(obj[x].n) + '</td></tr>';
    }).join('') + '</table>';
  }

  window.loadVoice = async function () {
    var box = document.getElementById('voice-box'), st = document.getElementById('st-voice');
    if (!box) return;
    box.innerHTML = '<div class="vc-empty">Loading…</div>';
    if (st) { st.textContent = ''; st.className = 'status'; }
    try {
      var tk = await token();
      if (!tk) throw new Error('Not signed in as admin');
      var res = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk }, body: '{}' });
      var d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || ('HTTP ' + res.status));
      var used = d.character_count, lim = d.character_limit;
      var pct = (typeof used === 'number' && lim) ? Math.min(100, Math.round(used / lim * 100)) : null;
      box.innerHTML =
        '<div class="vc-big">' + num(used) + ' <span>/ ' + num(lim) + ' chars</span></div>' +
        (pct !== null ? '<div class="vc-bar"><div style="width:' + pct + '%"></div></div><div class="vc-pct">' + pct + '% of the period</div>' : '') +
        '<div class="vc-meta">Plan <b>' + esc(d.tier || '—') + '</b> · status ' + esc(d.status || '—') +
        ' · resets <b>' + den(d.next_reset_at) + '</b></div>' +
        '<h4>Our records since ' + den(d.period_since) + '</h4>' +
        '<div class="vc-note">Only voice generated in the app since 2026-09-25. The difference from the number above is older voice and tests on the ElevenLabs website.</div>' +
        '<div class="vc-cols"><div><h5>By group</h5>' + radky(d.by_group, SKUPINY) + '</div>' +
        '<div><h5>By model</h5>' + radky(d.by_model) + '</div></div>' +
        '<h4>Snapshots</h4>' + ((d.snapshots || []).length ? '<table class="vc-tab"><tr><th>when</th><th>chars</th><th>limit</th><th></th></tr>' +
          d.snapshots.map(function (s) { return '<tr><td>' + den(s.taken_at) + '</td><td>' + num(s.character_count) + '</td><td>' + num(s.character_limit) +
            '</td><td>' + (s.source === 'weekly' ? 'weekly' : 'on open') + '</td></tr>'; }).join('') + '</table>' : '<div class="vc-empty">None.</div>');
    } catch (e) {
      box.innerHTML = '';
      if (st) { st.textContent = 'Error: ' + e.message; st.className = 'status err'; }
    }
  };
})();

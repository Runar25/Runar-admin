// Shrine admin — záložka VOICE: živý stav předplatného ElevenLabs + spotřeba z naší evidence (KUKY 2026-09-25 „ano ukaž
// živý stav"). Data: edge funkce voice-usage (admin JWT; čte EL /v1/user/subscription a tabulku voice_usage přes service
// role, protože klient ji číst nesmí). Každé otevření uloží i snímek stavu (voice_quota_snapshots) — řada pro trend.
// Ceny se tu NEPOČÍTAJÍ: bydlí v RUNAR_PRICING.md / scripts/utils/stats.js (§20). Tady jen znaky.
// Loaded by runar-shrine.html; uses the shared `sb` client + escapeHtml.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/voice-usage';
  function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
  function num(n) { return (typeof n === 'number') ? n.toLocaleString('cs-CZ') : '—'; }
  function den(iso) { if (!iso) return '—'; var d = new Date(iso); return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear(); }
  var SKUPINY = { admin: 'Admin', tester: 'Testeři', user: 'Uživatelé', unknown: 'Bez účtu' };

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }

  function radky(obj, popis) {
    var k = Object.keys(obj || {});
    if (!k.length) return '<div class="vc-empty">Zatím nic zapsáno.</div>';
    return '<table class="vc-tab"><tr><th></th><th>znaků</th><th>přehrání</th></tr>' + k.sort(function (a, b) {
      return obj[b].chars - obj[a].chars; }).map(function (x) {
      return '<tr><td>' + esc(popis ? (popis[x] || x) : x) + '</td><td>' + num(obj[x].chars) + '</td><td>' + num(obj[x].n) + '</td></tr>';
    }).join('') + '</table>';
  }

  window.loadVoice = async function () {
    var box = document.getElementById('voice-box'), st = document.getElementById('st-voice');
    if (!box) return;
    box.innerHTML = '<div class="vc-empty">Načítám…</div>';
    if (st) { st.textContent = ''; st.className = 'status'; }
    try {
      var tk = await token();
      if (!tk) throw new Error('Nejsi přihlášený jako admin');
      var res = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk }, body: '{}' });
      var d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || ('HTTP ' + res.status));
      var used = d.character_count, lim = d.character_limit;
      var pct = (typeof used === 'number' && lim) ? Math.min(100, Math.round(used / lim * 100)) : null;
      box.innerHTML =
        '<div class="vc-big">' + num(used) + ' <span>/ ' + num(lim) + ' znaků</span></div>' +
        (pct !== null ? '<div class="vc-bar"><div style="width:' + pct + '%"></div></div><div class="vc-pct">' + pct + ' % období</div>' : '') +
        '<div class="vc-meta">Tarif <b>' + esc(d.tier || '—') + '</b> · stav ' + esc(d.status || '—') +
        ' · obnoví se <b>' + den(d.next_reset_at) + '</b></div>' +
        '<h4>Naše evidence od ' + den(d.period_since) + '</h4>' +
        '<div class="vc-note">Jen hlas vygenerovaný v appce od 25. 9. 2026. Rozdíl proti číslu nahoře = starší hlas, zkoušky na webu ElevenLabs.</div>' +
        '<div class="vc-cols"><div><h5>Podle skupiny</h5>' + radky(d.by_group, SKUPINY) + '</div>' +
        '<div><h5>Podle modelu</h5>' + radky(d.by_model) + '</div></div>' +
        '<h4>Snímky stavu</h4>' + ((d.snapshots || []).length ? '<table class="vc-tab"><tr><th>kdy</th><th>znaků</th><th>limit</th><th></th></tr>' +
          d.snapshots.map(function (s) { return '<tr><td>' + den(s.taken_at) + '</td><td>' + num(s.character_count) + '</td><td>' + num(s.character_limit) +
            '</td><td>' + (s.source === 'weekly' ? 'týdenní' : 'otevření') + '</td></tr>'; }).join('') + '</table>' : '<div class="vc-empty">Žádné.</div>');
    } catch (e) {
      box.innerHTML = '';
      if (st) { st.textContent = 'Chyba: ' + e.message; st.className = 'status err'; }
    }
  };
})();

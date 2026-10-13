// Shrine admin — záložka VOICE: živý stav předplatného ElevenLabs + spotřeba z naší evidence (KUKY 2026-09-25 „ano ukaž
// živý stav"). Data: edge funkce voice-usage (admin JWT; čte EL /v1/user/subscription a tabulku voice_usage přes service
// role, protože klient ji číst nesmí). Každé otevření uloží i snímek stavu (voice_quota_snapshots) — řada pro trend.
// Ceny se tu NEPOČÍTAJÍ: bydlí v RUNAR_PRICING.md / scripts/utils/stats.js (§20). Tady kredity a znaky.
// 2026-10-11 (DECISIONS (48), owner „potřebuju to hlídat!“): počítadlo ElevenLabs je v KREDITECH, ne ve znacích — hlavní číslo je
// spotřeba proti hladině brzdy (limit − dobití), pod ním rozpad limitu na tarif / převod / dobití. Do té doby „chars“ a VOICE_SAFE_SHARE.
// Loaded by runar-shrine.html; uses the shared `sb` client + escapeHtml.
// 2026-10-10 §31: popisky anglicky — shrine čtou oba admini a společná řeč se Sigrún je angličtina (do té doby česky);
// čísla en-GB a data ISO místo českého formátu.
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/voice-usage';
  function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
  function num(n) { return (typeof n === 'number') ? n.toLocaleString('en-GB') : '—'; }
  function den(iso) { if (!iso) return '—'; var d = new Date(iso); return isNaN(d) ? '—' : d.toISOString().slice(0, 10); }
  function cas(iso) { if (!iso) return '—'; var d = new Date(iso); return isNaN(d) ? '—' : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; }
  // 2026-10-13 (owner „ano udělej a nasaď“): historie ElevenLabs přečtená naším klíčem — jestli v ní něco je a jestli mazání po
  // vygenerování zabírá (DECISIONS 2026-10-13 (6)). Webové rozhraní ElevenLabs hlasy z API ukazovat nemusí, proto tady.
  function historie(h) {
    if (!h) return '<div class="vc-empty">Not available.</div>';
    if (h.error) return '<div class="vc-empty">ElevenLabs history could not be read (' + esc(h.error) + ').</div>';
    return '<div class="vc-meta">Items in our ElevenLabs history: <b>' + num(h.count) + (h.more ? '+' : '') + '</b> · Rúnar\u2019s voice: <b>' +
      num(h.ours) + '</b> · newest ' + cas(h.newest) + ' · oldest ' + cas(h.oldest) + '</div>' +
      '<div class="vc-note">Since 2026-10-13 the app deletes each new voice from this history right after it is made. If the number for' +
      ' Rúnar\u2019s voice grows after a reading is read aloud, the deletion is not working.</div>';
  }
  var SKUPINY = { admin: 'Admin', team: 'Team (owner & Sigrún)', tester: 'Testers', user: 'Users', unknown: 'No account' };
  var ZDROJ = { weekly: 'weekly', admin: 'on open', daily: 'daily', brake: 'BRAKE STOPPED VOICE' };

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }

  function radky(obj, popis) {
    var k = Object.keys(obj || {});
    if (!k.length) return '<div class="vc-empty">Nothing recorded yet.</div>';
    return '<table class="vc-tab"><tr><th></th><th>credits</th><th>chars</th><th>plays</th></tr>' + k.sort(function (a, b) {
      return obj[b].chars - obj[a].chars; }).map(function (x) {
      return '<tr><td>' + esc(popis ? (popis[x] || x) : x) + '</td><td>' + num(obj[x].credits) + '</td><td>' + num(obj[x].chars) +
        '</td><td>' + num(obj[x].n) + '</td></tr>';
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
      var c = d.credits || {};
      var pct = (typeof c.used === 'number' && c.brake_at) ? Math.min(100, Math.round(c.used / c.brake_at * 100)) : null;
      box.innerHTML =
        '<div class="vc-big">' + num(c.used) + ' <span>/ ' + num(c.brake_at) + ' credits until the brake</span></div>' +
        (pct !== null ? '<div class="vc-bar"><div style="width:' + pct + '%"></div></div><div class="vc-pct">' + pct + '% · ' + num(c.left) +
          ' credits left before new voice stops (readings and Collection)</div>' : '') +
        '<div class="vc-meta">ElevenLabs counts credits, not characters. Limit ' + num(c.limit) + ' = plan ' + num(c.plan) +
          ' + rollover ' + num(c.rollover) + ' + top-up ' + num(c.topup) + '. The brake never touches the top-up; once the rollover is' +
          ' used up or expires, it falls to the plan alone.</div>' +
        '<div class="vc-meta">Plan <b>' + esc(d.tier || '—') + '</b> · status ' + esc(d.status || '—') +
        ' · resets <b>' + den(d.next_reset_at) + '</b></div>' +
        '<h4>Our records since ' + den(d.period_since) + '</h4>' +
        '<div class="vc-note">Only voice generated in the app since 2026-09-25. The difference from the number above is older voice and tests on the ElevenLabs website.</div>' +
        '<div class="vc-cols"><div><h5>By group</h5>' + radky(d.by_group, SKUPINY) + '</div>' +
        '<div><h5>By model</h5>' + radky(d.by_model) + '</div></div>' +
        '<h4>ElevenLabs history</h4>' + historie(d.history) +
        '<h4>Snapshots</h4>' + ((d.snapshots || []).length ? '<table class="vc-tab"><tr><th>when</th><th>credits used</th><th>limit</th><th></th></tr>' +
          d.snapshots.map(function (s) { return '<tr><td>' + den(s.taken_at) + '</td><td>' + num(s.character_count) + '</td><td>' + num(s.character_limit) +
            '</td><td>' + esc(ZDROJ[s.source] || s.source) + '</td></tr>'; }).join('') + '</table>' : '<div class="vc-empty">None.</div>');
    } catch (e) {
      box.innerHTML = '';
      if (st) { st.textContent = 'Error: ' + e.message; st.className = 'status err'; }
    }
  };
})();

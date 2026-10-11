// Shrine admin — záložka TESTERS (2026-10-11, owner: „každý účet bude pod svým emailem, ať vím o koho jde a kolik udělal čtení. a pod tím
// součet. teď zatím 7 testerů a 4 účty adminů. začneme už dneškem.“). Data: edge funkce voice-usage s {accounts:true} (admin JWT) —
// účty testerů ze seznamu allowed_emails (i nezaregistrované), účty týmu ownera a Sigrún, čtení podle typu, Asky, hlasy. Texty čtení
// ani Asků funkce neposílá. Cena modelu = readingCostUsd (runar-utils.js, týž výpočet jako cena u čtení v deníku — §20), hlas = kredity
// × cena kreditu ze serveru (EL_KREDIT_USD). Přímý odkaz runar-shrine.html#testers je v menu appky (jen admin) — owner chtěl rychlejší
// přístup než proklikávat shrine, na mobilu i na počítači.
// Popisky anglicky (§31 — shrine čtou oba admini, společná řeč se Sigrún je angličtina).
(function () {
  var FN = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/voice-usage';
  var START = '2026-10-11';   // owner: „začneme už dneškem“
  var TYPY = ['Single', 'Norns', 'Cross', 'Horseshoe', 'Yggdrasil'];
  var ZKR = { Single: 'S', Norns: 'N', Cross: 'C', Horseshoe: 'H', Yggdrasil: 'Y' };
  function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s); }
  function num(n) { return (typeof n === 'number') ? n.toLocaleString('en-GB') : '—'; }
  function usd(x) { return '$' + (x || 0).toFixed(2); }
  function cenaModelu(usages) {
    var c = 0;
    (usages || []).forEach(function (u) { var x = (typeof readingCostUsd === 'function') ? readingCostUsd(u) : null; if (x != null) c += x; });
    return c;
  }
  function typy(t) {
    var s = TYPY.filter(function (k) { return t && t[k]; }).map(function (k) { return ZKR[k] + ' ' + t[k]; }).join(' · ');
    return s || '—';
  }

  async function token() {
    var s = await sb.auth.getSession();
    return (s.data.session && s.data.session.access_token) || null;
  }

  function tabulka(nadpis, ucty, kredit) {
    var sum = { today: 0, total: 0, types: {}, asks: 0, voices: 0, cost: 0 };
    var radky = ucty.map(function (a) {
      var cost = cenaModelu(a.total.usage) + a.total.credits * kredit;
      sum.today += a.today.readings; sum.total += a.total.readings; sum.asks += a.total.asks; sum.voices += a.total.voices; sum.cost += cost;
      TYPY.forEach(function (k) { if (a.total.types[k]) sum.types[k] = (sum.types[k] || 0) + a.total.types[k]; });
      var kdo = esc(a.email) + (a.group === 'admin' ? ' <span class="ts-tag">admin</span>' : '');
      if (!a.registered) return '<tr class="ts-off"><td>' + kdo + '</td><td colspan="6">not signed up yet</td></tr>';
      return '<tr><td>' + kdo + '</td><td>' + num(a.today.readings) + '</td><td>' + num(a.total.readings) + '</td><td>' + typy(a.total.types) +
        '</td><td>' + num(a.total.asks) + '</td><td>' + num(a.total.voices) + '</td><td>' + usd(cost) + '</td></tr>';
    }).join('');
    return '<h4>' + esc(nadpis) + ' · ' + ucty.length + ' accounts</h4><div class="ts-wrap"><table class="ts-tab"><tr><th>account</th><th>today</th>' +
      '<th>since ' + START.slice(8) + ' Oct</th><th>types</th><th>asks</th><th>voices</th><th>cost</th></tr>' + radky +
      '<tr class="ts-sum"><td>TOTAL</td><td>' + num(sum.today) + '</td><td>' + num(sum.total) + '</td><td>' + typy(sum.types) + '</td><td>' +
      num(sum.asks) + '</td><td>' + num(sum.voices) + '</td><td>' + usd(sum.cost) + '</td></tr></table></div>';
  }

  window.loadTesters = async function () {
    var box = document.getElementById('testers-box'), st = document.getElementById('st-testers');
    if (!box) return;
    box.innerHTML = '<div class="ts-empty">Loading…</div>';
    if (st) { st.textContent = ''; st.className = 'status'; }
    try {
      var tk = await token();
      if (!tk) throw new Error('Not signed in as admin');
      var res = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
        body: JSON.stringify({ accounts: true, since: START }) });
      var d = await res.json();
      if (!res.ok) throw new Error(d.message || d.error || ('HTTP ' + res.status));
      var acc = d.accounts;
      if (!acc || !acc.list) throw new Error('No account data (voice-usage not updated yet?)');
      var testeri = acc.list.filter(function (a) { return a.group === 'tester'; });
      var tym = acc.list.filter(function (a) { return a.group !== 'tester'; });
      var c = d.credits || {};
      box.innerHTML =
        '<div class="ts-meta">Today = ' + esc(acc.today) + ' (UTC) · S Single · N Norns · C Cross · H Horseshoe · Y Yggdrasil · cost = model + voice credits</div>' +
        tabulka('Testers', testeri, acc.credit_usd || 0) +
        tabulka('Team (owner & Sigrún)', tym, acc.credit_usd || 0) +
        (typeof c.used === 'number' ? '<div class="ts-meta">ElevenLabs: ' + num(c.used) + ' / ' + num(c.brake_at) + ' credits until the brake · ' +
          num(c.left) + ' left · details in VOICE</div>' : '');
    } catch (e) {
      box.innerHTML = '';
      if (st) { st.textContent = 'Error: ' + e.message; st.className = 'status err'; }
    }
  };
})();

// Shrine admin — záložka PAYBACK: kalkulačka návratnosti (kolik platících předplatitelů pokryje náklady a kolik zbyde na mzdu).
// Proč (owner 2026-10-13): „payback nemá být odkaz na claude! … mě nevadí, pokud to bude webovka“ — do té doby záložka vedla na soukromý
// artifact v claude.ai (b116f4d), který owner nechtěl a nikdo jiný neotevřel.
// Čísla NEBYDLÍ tady (§20): stránka si při otevření načte ../RUNAR_PRICING.md a vezme z něj ceny předplatného („Subscription Pricing“),
// plány ElevenLabs („ElevenLabs Plan — When to Upgrade“) a fixní náklady po spuštění („Fixed monthly costs“). Změníš-li číslo v docu,
// kalkulačka ho ukáže při příštím otevření. Když tabulku nepřečte, řekne to nahoře — nikdy tiše nepočítá se starými čísly.
// Tvar tabulek hlídá smoke (scripts/verify_payback_pricing.js): parser tady + kontrolní součet proti řádku „Celkem“ v docu.
// Daně a odvody (~20 % zaměstnavatel, ~33 % osobní, DPH 24 % nad 2 000 000 ISK ročně) a poplatek za platbu (2,9 % + $0,30) jsou
// konstanty modelu ze sekcí „Icelandic taxes“ a „Variable per paying user“ — próza, ne tabulka; měníš-li je tam, změň je i tady.
// §31: popisky anglicky (shrine). Loaded by runar-shrine.html (záložka PAYBACK); parser jde načíst i z node (module.exports).
(function (root) {
  'use strict';

  // ── parser RUNAR_PRICING.md ──────────────────────────────────────────────────────────────────────────────────────────────────
  function cislo(s) {
    var t = String(s || '').replace(/\*|~|\$|≤|ISK|kr/g, '').trim();
    var m = t.match(/\d[\d.,]*/);
    if (!m) return null;
    var x = m[0];
    if (/^\d{1,3}(\.\d{3})+$/.test(x)) x = x.replace(/\./g, '');   // 3.490 · 1.237.500 = tisíce
    else x = x.replace(/,/g, '.');
    var v = parseFloat(x);
    return isFinite(v) ? v : null;
  }
  function tabulka(md, nadpis) {
    var i = md.indexOf(nadpis);
    if (i < 0) return null;
    var radky = md.slice(i).split(/\r?\n/), out = [], uvnitr = false;
    for (var k = 1; k < radky.length; k++) {
      var r = radky[k].trim();
      if (r.charAt(0) === '|') { uvnitr = true; if (!/^\|[\s|:-]+\|$/.test(r)) out.push(r.slice(1, -1).split('|').map(function (c) { return c.trim(); })); }
      else if (uvnitr) break;
      else if (/^#/.test(r)) break;
    }
    return out.length ? out : null;
  }
  function parsePricing(md) {
    var chyby = [];
    var sub = tabulka(md, '## Subscription Pricing');
    var ceny = {};
    (sub || []).forEach(function (r) {
      if (/^ISK\/month$/i.test(r[0])) { ceny.stdM = cislo(r[1]); ceny.premM = cislo(r[2]); }
      if (/^Annual\/month/i.test(r[0])) { ceny.stdR = cislo(r[1]); ceny.premR = cislo(r[2]); }
    });
    ['stdM', 'premM', 'stdR', 'premR'].forEach(function (k) { if (!(ceny[k] > 0)) chyby.push('subscription price ' + k + ' not found'); });
    var kurzM = md.match(/\$1\s*=\s*([\d.,]+)\s*ISK/);
    var kurz = kurzM ? cislo(kurzM[1]) : null;
    if (!(kurz > 0)) chyby.push('exchange rate ($1 = … ISK) not found');
    var el = [];
    (tabulka(md, '## ElevenLabs Plan') || []).forEach(function (r) {
      var usd = cislo(r[1]), zn = cislo(r[2]);
      if (r[0] !== 'Plan' && usd > 0 && zn > 0) el.push({ jm: r[0], usd: usd, zn: zn });
    });
    if (el.length < 3) chyby.push('ElevenLabs plans table not found');
    var fix = [], nativ = [], celkem = null, elPo = null;
    (tabulka(md, '### Fixed monthly costs') || []).forEach(function (r) {
      if (r[0] === 'Item') return;
      var jm = r[0].replace(/\*/g, '').trim(), po = r[2] || '';
      if (/^Celkem/i.test(jm)) { celkem = cislo(po); return; }
      if (/ElevenLabs/i.test(jm)) { elPo = cislo(po); return; }   // hlas počítá plán níž
      var v = cislo(po);
      if (v === null) return;                                       // „proměnné“ = model čtení (posuvník)
      if (/Apple|Google Play/i.test(jm)) nativ.push({ jm: jm, usd: v });
      else fix.push({ jm: jm, usd: v });
    });
    if (fix.length < 3) chyby.push('fixed costs table not found');
    if (!(celkem > 0)) chyby.push('fixed costs total row not found');
    return { ceny: ceny, kurz: kurz, el: el, fix: fix, nativ: nativ, celkem: celkem, elPo: elPo, chyby: chyby };
  }

  // ── model (ze sekce „Break-even & living wage“) ─────────────────────────────────────────────────────────────────────────────
  var DPH = 0.24, DPH_PRAH = 2000000, POPLATEK = 0.029, POPLATEK_TX = 0.30, ODVODY_FIRMA = 1.20, CISTA_Z_HRUBE = 0.67;
  function elPlan(el, znaku) {
    for (var i = 0; i < el.length; i++) if (el[i].zn >= znaku) return el[i];
    return { jm: 'Enterprise', usd: el[el.length - 1].usd, zn: Infinity, enterprise: true };
  }
  function mesic(p, v, n) {
    var c = p.ceny;
    var cenaUziv = (1 - v.prem) * (v.rocne * c.stdR + (1 - v.rocne) * c.stdM) + v.prem * (v.rocne * c.premR + (1 - v.rocne) * c.premM);
    var hrube = n * cenaUziv / v.kurz;
    var dphPlati = n * cenaUziv * 12 >= DPH_PRAH;
    var dph = dphPlati ? hrube - hrube / (1 + DPH) : 0;
    var platby = POPLATEK * hrube + POPLATEK_TX * n * ((1 - v.rocne) + v.rocne / 12);
    var model = n * v.model;
    var plan = elPlan(p.el, n * v.znaky);
    var fix = v.fix.reduce(function (a, b) { return a + b; }, 0);
    var zisk = hrube - dph - platby - model - plan.usd - fix;
    return { cenaUziv: cenaUziv, hrube: hrube, dph: dph, dphPlati: dphPlati, platby: platby, model: model, plan: plan, fix: fix, zisk: zisk };
  }
  function mzdaZ(zisk) { return zisk > 0 ? zisk / ODVODY_FIRMA * CISTA_Z_HRUBE : 0; }

  // Popisky položek: RUNAR_PRICING.md je česky (§31: docs česky), shrine anglicky. Tady jen JMÉNA, čísla dál z docu. Nová položka
  // v tabulce bez řádku tady se ukáže pod jménem z docu — viditelně, ne zahozená.
  var EN = [[/^Claude/i, 'Claude Max (development)'], [/^ChatGPT/i, 'ChatGPT Go'], [/^Anthropic/i, 'Anthropic API (admin, backup; cap)'],
            [/^Supabase/i, 'Supabase Pro'], [/^Google Workspace/i, 'Google Workspace'], [/^Brevo/i, 'Brevo (sign-in e-mail)'],
            [/^GitHub/i, 'GitHub · Cloudflare Pages'], [/^Shopify/i, 'Shopify'], [/^Dom/i, 'Domains'],
            [/^Apple/i, 'Apple Developer ($99/year)'], [/^Google Play/i, 'Google Play ($25 once)']];
  function enJmeno(jm) { for (var i = 0; i < EN.length; i++) if (EN[i][0].test(jm)) return EN[i][1]; return jm; }

  var api = { parsePricing: parsePricing, mesic: mesic, mzdaZ: mzdaZ, cislo: cislo, enJmeno: enJmeno };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // ── stránka ve shrine ───────────────────────────────────────────────────────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (x, d) { return x.toLocaleString('en-GB', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var usd = function (x) { return (x < 0 ? '−$' : '$') + fmt(Math.abs(x), 0); };
  var isk = function (x) { return (x < 0 ? '−' : '') + fmt(Math.abs(Math.round(x)), 0) + ' ISK'; };
  var esc = function (s) { return (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s); };
  var P = null;

  function ctl(id, label, min, max, step, val, hint) {
    return '<div class="pb-ctl"><label for="' + id + '">' + label + '</label><span class="pb-val" id="' + id + '-v"></span>' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">' +
      (hint ? '<span class="pb-hint">' + hint + '</span>' : '') + '</div>';
  }
  function cisloPole(id, label, val, step) {
    return '<div class="pb-ctl"><label for="' + id + '">' + esc(label) + '</label><input type="number" id="' + id + '" min="0" step="' + (step || 1) + '" value="' + val + '"></div>';
  }

  function vykresli() {
    var c = P.ceny;
    var fixHtml = P.fix.map(function (f, i) { return cisloPole('pb-fix-' + i, enJmeno(f.jm), f.usd, 0.05); }).join('');
    var nat = P.nativ.reduce(function (a, b) { return a + b.usd; }, 0);
    $('pb-root').innerHTML =
      '<div class="pb-grid"><div class="pb-stack">' +
      '<div class="card"><div class="card-lbl">SUBSCRIBERS</div>' +
      ctl('pb-n', 'Paying subscribers', 0, 1000, 1, 50) +
      ctl('pb-prem', 'Premium share', 0, 100, 5, 30, 'Standard ' + fmt(c.stdM) + ' ISK/month (annual ' + fmt(c.stdR) + ') · Premium ' + fmt(c.premM) + ' (annual ' + fmt(c.premR) + '), VAT included') +
      ctl('pb-rocne', 'Annual subscriptions share', 0, 100, 5, 60) +
      ctl('pb-znaky', 'Voice per subscriber per month (characters)', 2000, 32000, 250, 9350, 'typical (3 Single + 1 Norns a week, Cross + Horseshoe a month) ≈ 9,350 · worst month Premium IS ≈ 31,725') +
      ctl('pb-model', 'Reading model per subscriber ($/month)', 0, 2, 0.05, 0.25, 'GPT-6 sol: typical ~0.25 · worst month Premium ~1.55 (with Asks)') +
      '</div>' +
      '<div class="card"><div class="card-lbl">FIXED COSTS AFTER LAUNCH ($/MONTH)</div>' + fixHtml +
      '<div class="pb-ctl"><label for="pb-nativ">Native app (' + esc(P.nativ.map(function (x) { return enJmeno(x.jm); }).join(', ')) + ') — $' + fmt(nat, 2) + '/month</label><input type="checkbox" id="pb-nativ"></div>' +
      cisloPole('pb-kurz', 'ISK per $1', P.kurz, 0.5) +
      '<p class="pb-note">Values from RUNAR_PRICING.md, “Fixed monthly costs”, column after launch. Voice is the ElevenLabs plan picked below; the reading model is the slider above.</p></div>' +
      '<div class="card"><div class="card-lbl">SALARY</div>' +
      ctl('pb-cil', 'Target net salary (ISK/month)', 0, 1000000, 25000, 500000, 'employer contributions ~20 %, personal tax and contributions ~33 %') +
      '</div></div>' +
      '<div class="pb-stack"><div class="card" aria-live="polite"><div class="card-lbl">RESULT PER MONTH</div>' +
      '<div class="pb-big">' +
      '<div><div class="pb-k">Company profit</div><div class="pb-v" id="pb-zisk"></div><div class="pb-s" id="pb-zisk-isk"></div></div>' +
      '<div><div class="pb-k">Net salary from it</div><div class="pb-v" id="pb-mzda"></div><div class="pb-s">after contributions and tax</div></div>' +
      '<div><div class="pb-k">Break-even from</div><div class="pb-v" id="pb-be"></div><div class="pb-s">paying subscribers</div></div>' +
      '<div><div class="pb-k">Target salary from</div><div class="pb-v" id="pb-cilN"></div><div class="pb-s" id="pb-cil-s"></div></div>' +
      '</div><table class="pb-tab"><thead><tr><th>Item</th><th class="n">$</th><th class="n">ISK</th></tr></thead><tbody id="pb-rozpad"></tbody></table>' +
      '<p class="pb-note" id="pb-dph"></p></div>' +
      '<div class="card"><div class="card-lbl">VOICE: WHEN TO MOVE TO A HIGHER ELEVENLABS PLAN</div>' +
      '<p class="pb-note" style="margin-top:0">Needed now: <span class="pb-plan" id="pb-el-plan"></span> <span id="pb-el-vyuziti"></span></p>' +
      '<table class="pb-tab"><thead><tr><th>Plan</th><th class="n">$/month</th><th class="n">characters</th><th class="n">enough for</th></tr></thead><tbody id="pb-el-tab"></tbody></table>' +
      '<p class="pb-note">Starter has no overage — when credits run out, voice stops. Check overage on higher plans before launch.</p></div>' +
      '<p class="pb-note">Source: RUNAR_PRICING.md (read when this tab opens). Rough model — verify with an accountant (endurskoðandi). Payment fee 2.9 % + $0.30 per transaction (annual = one payment a year). VAT 24 % only above 2,000,000 ISK turnover a year.</p>' +
      '</div></div>';
    $('pb-root').querySelectorAll('input').forEach(function (el) { el.addEventListener('input', prepocet); el.addEventListener('change', prepocet); });
    prepocet();
  }

  function num(id) { var v = parseFloat($(id).value); return isFinite(v) ? v : 0; }
  function prepocet() {
    var fixy = P.fix.map(function (f, i) { return num('pb-fix-' + i); });
    if ($('pb-nativ').checked) P.nativ.forEach(function (x) { fixy.push(x.usd); });
    var v = { n: num('pb-n'), prem: num('pb-prem') / 100, rocne: num('pb-rocne') / 100, znaky: num('pb-znaky'), model: num('pb-model'),
              fix: fixy, kurz: num('pb-kurz') || P.kurz, cil: num('pb-cil') };
    $('pb-n-v').textContent = fmt(v.n);
    $('pb-prem-v').textContent = Math.round(v.prem * 100) + ' %';
    $('pb-rocne-v').textContent = Math.round(v.rocne * 100) + ' %';
    $('pb-znaky-v').textContent = fmt(v.znaky);
    $('pb-model-v').textContent = '$' + fmt(v.model, 2);
    $('pb-cil-v').textContent = isk(v.cil);
    var m = mesic(P, v, v.n);
    $('pb-zisk').textContent = usd(m.zisk);
    $('pb-zisk').className = 'pb-v ' + (m.zisk >= 0 ? 'pb-pos' : 'pb-neg');
    $('pb-zisk-isk').textContent = isk(m.zisk * v.kurz);
    $('pb-mzda').textContent = isk(mzdaZ(m.zisk) * v.kurz);
    var prvni = function (podm) { for (var n = 0; n <= 20000; n++) if (podm(mesic(P, v, n))) return n; return null; };
    var be = prvni(function (x) { return x.zisk >= 0; });
    $('pb-be').textContent = be === null ? '—' : fmt(be);
    var cilUsd = v.cil / v.kurz;
    var cn = prvni(function (x) { return mzdaZ(x.zisk) >= cilUsd; });
    $('pb-cilN').textContent = cn === null ? '—' : fmt(cn);
    $('pb-cil-s').textContent = 'for ' + isk(v.cil) + ' net';
    var rad = [['Revenue (VAT included)', m.hrube], ['VAT 24 %', -m.dph], ['Payment fees', -m.platby], ['Reading model', -m.model],
               ['ElevenLabs ' + m.plan.jm, -m.plan.usd], ['Fixed costs', -m.fix]];
    $('pb-rozpad').innerHTML = rad.map(function (r) {
      return '<tr><td>' + esc(r[0]) + '</td><td class="n">' + usd(r[1]) + '</td><td class="n">' + isk(r[1] * v.kurz) + '</td></tr>';
    }).join('') + '<tr class="pb-sum"><td>Company profit</td><td class="n ' + (m.zisk >= 0 ? 'pb-pos' : 'pb-neg') + '">' + usd(m.zisk) + '</td><td class="n">' + isk(m.zisk * v.kurz) + '</td></tr>';
    $('pb-dph').textContent = 'Revenue per subscriber ' + isk(m.cenaUziv) + ' incl. VAT. ' + (m.dphPlati ? 'Turnover above 2,000,000 ISK a year → 24 % VAT is paid.' : 'Turnover below 2,000,000 ISK a year → no VAT.');
    var potreba = v.n * v.znaky;
    $('pb-el-plan').textContent = m.plan.jm;
    $('pb-el-vyuziti').textContent = m.plan.enterprise ? '(above Business — talk to ElevenLabs)' : '· ' + Math.round(potreba / m.plan.zn * 100) + ' % used (' + fmt(potreba) + ' of ' + fmt(m.plan.zn) + ' characters)';
    $('pb-el-tab').innerHTML = P.el.map(function (p) {
      var doN = v.znaky > 0 ? Math.floor(p.zn / v.znaky) : 0;
      return '<tr' + (p.jm === m.plan.jm ? ' class="pb-akt"' : '') + '><td>' + esc(p.jm) + '</td><td class="n">$' + fmt(p.usd) + '</td><td class="n">' + fmt(p.zn) + '</td><td class="n">' + fmt(doN) + ' subscribers</td></tr>';
    }).join('');
  }

  root.loadPayback = async function () {
    var box = $('pb-root');
    if (!box) return;
    if (P) return;   // jednou za otevření stránky; nová čísla z docu = obnovit stránku
    box.innerHTML = '<p class="pb-note">Reading RUNAR_PRICING.md…</p>';
    try {
      var r = await fetch('../RUNAR_PRICING.md', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var p = parsePricing(await r.text());
      if (p.chyby.length) throw new Error(p.chyby.join('; '));
      P = p;
      vykresli();
    } catch (e) {
      box.innerHTML = '<p class="pb-err">Could not read the numbers from RUNAR_PRICING.md (' + esc(e.message || e) + '). The calculator does not guess — fix the table in the doc.</p>';
    }
  };
})(typeof window !== 'undefined' ? window : this);

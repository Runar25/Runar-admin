// 2026-10-04 — přemýšlení na `low` (KUKY: „určitě bych zkusil opus 5 low“ · „vidím že čtení potřebuju s low“ [sol]).
// Pilot PŘED změnou proxy. Tři single čtení (produkční buildReadingPrompt + myšlenka ✦, losy pevné, věta za obrazem podle enginu)
// a jeden Ask (Ehwaz, druhá otázka s předchozí výměnou = produkce v4.91). Varianty:
//   sol6-low   gpt-6-sol    reasoning_effort low   (dnes none)
//   sol61-low  gpt-6.1-sol  reasoning_effort low   (stejná cena jako 6 — ceník 2026-10-04: $2 / $10, zápis cache $2,50)
//   opus5-off  claude-opus-5 thinking disabled     (= produkce)
//   opus5-low  claude-opus-5 thinking adaptive + output_config.effort low (tvar ověřen API u 5.5, EVAL_LOG 2026-09-22 (1))
// Strop = produkční (čtení 700, Ask 320). Přemýšlení se do stropu počítá — vrátí-li model prázdno, zkusí se znovu s rezervou
// +1500 a zapíše se obojí (to je přesně ta past, kterou 5.5 ukázal: IS 0/3 na 700).
//   node test_low.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const CENA = { 'gpt-6-sol': { in: 2, hit: 0.2, w: 2.5, out: 10 }, 'gpt-6.1-sol': { in: 2, hit: 0.1, w: 2.5, out: 10 },
               'claude-opus-5': { in: 5, hit: 0.5, w: 6.25, out: 25 } };
const CTENI = [['Hagalaz', 'Family & Home', 'Confirmation', 3], ['Fehu', 'Love & Relationships', 'General Guidance', 5],
               ['Wunjo', 'Inner Growth', 'Insight into Challenge', 7]];
function prompt(runa, area, seek, seed, engine) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('READ_ENGINE=' + JSON.stringify(engine) + ';__s=' + (seed * 7919 + 17) + ';', S);
  const u = { name: 'Kuky', area, seeking: seek, question: '', intention: '', lifeRune: rr('Isa') };
  return S.buildReadingPrompt(u, rr(runa), 'en', []) + '\n' + S._thoughtLine('en', rr(runa));
}
const PARY = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '2026-10-04-ask-krok2', 'pary.json'), 'utf8'));
const EHW = PARY.find((p) => p.runa === 'Ehwaz');
async function sol(model, sys, p, max) {
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model, reasoning_effort: 'low', max_completion_tokens: max,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error(model + ' ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  const u = d.usage || {}, pd = u.prompt_tokens_details || {}, cd = u.completion_tokens_details || {}, c = CENA[model];
  const hit = pd.cached_tokens || 0, w = pd.cache_write_tokens || 0, plain = (u.prompt_tokens || 0) - hit - w;
  return { text: String(d.choices[0].message.content || '').trim(), stop: d.choices[0].finish_reason, ms: Date.now() - t0,
    premysleni: cd.reasoning_tokens || 0, vystup: u.completion_tokens || 0,
    usd: (plain * c.in + hit * c.hit + w * c.w + (u.completion_tokens || 0) * c.out) / 1e6 };
}
async function opus(low, sys, p, max) {
  const t0 = Date.now();
  const body = { model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: p }] };
  if (low) { body.thinking = { type: 'adaptive' }; body.output_config = { effort: 'low' }; } else body.thinking = { type: 'disabled' };
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  const u = d.usage || {}, c = CENA['claude-opus-5'];
  const text = (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('').trim();
  const thinkChars = (d.content || []).filter((x) => x.type === 'thinking').map((x) => x.thinking || '').join('').length;
  return { text, stop: d.stop_reason, ms: Date.now() - t0, vystup: u.output_tokens || 0, premysleni_znaku: thinkChars,
    usd: ((u.input_tokens || 0) * c.in + (u.cache_read_input_tokens || 0) * c.hit + (u.cache_creation_input_tokens || 0) * c.w
      + (u.output_tokens || 0) * c.out) / 1e6 };
}
const VARIANTY = [
  ['sol6-low', 'sol', (sys, p, m) => sol('gpt-6-sol', sys, p, m)],
  ['sol61-low', 'sol', (sys, p, m) => sol('gpt-6.1-sol', sys, p, m)],
  ['opus5-off', 'opus', (sys, p, m) => opus(false, sys, p, m)],
  ['opus5-low', 'opus', (sys, p, m) => opus(true, sys, p, m)],
];
const W = (s) => (String(s).match(/[A-Za-z’'-]+/g) || []).length;
async function zkus(fn, sys, p, max) {
  let r = await fn(sys, p, max);
  if (!r.text) { const r2 = await fn(sys, p, max + 1500); r2.prazdne_na = max; r = r2; }
  return r;
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [runa, area, seek, seed] of CTENI) for (const [v, eng, fn] of VARIANTY) for (let k = 0; k < 2; k++) {
    const r = await zkus(fn, sys, prompt(runa, area, seek, seed, eng), 700);
    const body = r.text.split('✦')[0], th = r.text.split('✦')[1] || '';
    out.push(Object.assign({ druh: 'cteni', runa, area, varianta: v, k, slov: W(body), slov_myslenka: W(th) }, r));
    console.log('\n[' + runa + ' · ' + v + k + '] ' + W(body) + ' sl. · ✦ ' + W(th) + ' · ' + r.ms + ' ms · $' + r.usd.toFixed(4)
      + (r.premysleni ? ' · přemýšlení ' + r.premysleni + ' tok.' : '') + (r.premysleni_znaku ? ' · přemýšlení ' + r.premysleni_znaku + ' zn.' : '')
      + (r.prazdne_na ? ' · ⚠ PRÁZDNÉ na ' + r.prazdne_na : '') + '\n' + r.text);
  }
  for (const [v, eng, fn] of VARIANTY) for (let k = 0; k < 2; k++) {
    vm.runInContext('READ_ENGINE=' + JSON.stringify(eng) + ';', S);
    const p = S.buildAskPrompt(EHW.text, EHW.q2, EHW.runa, 'en', [], rr('Isa'), { area: EHW.area, intention: '', seeking: EHW.seeking, question: '' },
      { mode: 'single', runy: [EHW.runa] }, EHW.aspekt, [{ q: EHW.q1, a: EHW.a1 }]);
    const r = await zkus(fn, sys, p, 320);
    out.push(Object.assign({ druh: 'ask', runa: 'Ehwaz', varianta: v, k, slov: W(r.text) }, r));
    console.log('\n[ASK Ehwaz · ' + v + k + '] ' + W(r.text) + ' sl. · ' + r.ms + ' ms · $' + r.usd.toFixed(4)
      + (r.premysleni ? ' · přemýšlení ' + r.premysleni + ' tok.' : '') + (r.prazdne_na ? ' · ⚠ PRÁZDNÉ na ' + r.prazdne_na : '') + '\n' + r.text);
  }
  fs.writeFileSync(path.join(__dirname, 'test_low.json'), JSON.stringify(out, null, 1));
  console.log('\n=== souhrn (průměr) ===');
  for (const druh of ['cteni', 'ask']) for (const [v] of VARIANTY) {
    const a = out.filter((x) => x.druh === druh && x.varianta === v); if (!a.length) continue;
    const m = (f) => (a.reduce((s, x) => s + (x[f] || 0), 0) / a.length);
    console.log((druh + ' ' + v).padEnd(16), 'n=' + a.length, 'slov', m('slov').toFixed(0), druh === 'cteni' ? '✦ ' + m('slov_myslenka').toFixed(0) : '',
      '· ms', m('ms').toFixed(0), '· $', m('usd').toFixed(4), '· přemýšlení tok.', m('premysleni').toFixed(0),
      '· prázdné na stropu', a.filter((x) => x.prazdne_na).length + '/' + a.length);
  }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

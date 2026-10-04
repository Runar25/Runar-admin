// 2026-10-04 — audit promptu × návody výrobců, body 1 a 2 (KUKY „1 a 2, jeď“). Pilot PŘED nasazením.
//   A = v4.91 (✦ „after everything else“, bez připomínky) · B = v4.92 (✦ „inside the JSON, at the end of the last text“ +
//   na úplném konci „Length, once more: … 50 to 58 words.“). B se staví produkční cestou (builder + _thoughtLine + _lengthReminder
//   v pořadí runar-reading.js), A z něj zpětnou náhradou dvou míst (assert, že proběhla).
// Tři čtení jako EVAL_LOG 2026-10-04 (3) (Hagalaz × Family · Fehu × Love · Wunjo × Inner Growth, týž seed), 2× každé.
// Engine: Opus 5 (produkce, přemýšlení vypnuté, strop 700) · gpt-6.1-sol `low` (admin od v75, strop 700 + 1000 jako proxy).
// Měří se: slova čtení (bez ✦), kde je ✦ (uvnitř JSONu / za JSONem / chybí), slova ✦.
//   node test_mysl_delka.js
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
const MARK_NOVY = vm.runInContext('THOUGHT_MARK.en', S);
const MARK_STARY = 'AFTER THE READING — after everything else, on a new line beginning with ✦';
const CTENI = [['Hagalaz', 'Family & Home', 'Confirmation', 3], ['Fehu', 'Love & Relationships', 'General Guidance', 5],
               ['Wunjo', 'Inner Growth', 'Insight into Challenge', 7]];
function prompty(runa, area, seek, seed, engine) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('READ_ENGINE=' + JSON.stringify(engine) + ';__s=' + (seed * 7919 + 17) + ';', S);
  const u = { name: 'Kuky', area, seeking: seek, question: '', intention: '', lifeRune: rr('Isa') };
  let p = S.buildReadingPrompt(u, rr(runa), 'en', []);
  const th = S._thoughtLine('en', rr(runa)); if (th) p += '\n' + th;
  const dR = S._lengthReminder('en'); if (dR) p += '\n' + dR;
  if (p.indexOf(MARK_NOVY) === -1 || !dR || !p.endsWith(dR)) throw new Error('B nemá nový ✦ nebo připomínku na konci');
  const A = p.slice(0, p.length - dR.length - 1).replace(MARK_NOVY, MARK_STARY);
  if (A.indexOf(MARK_STARY) === -1 || A.indexOf('Length, once more') !== -1) throw new Error('A se nepostavil');
  return { A, B: p };
}
async function sol(sys, p) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model: 'gpt-6.1-sol', reasoning_effort: 'low', max_completion_tokens: 1700, prompt_cache_options: { mode: 'explicit' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 160));
  return { text: String(d.choices[0].message.content || '').trim(), stop: d.choices[0].finish_reason };
}
async function opus(sys, p) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, thinking: { type: 'disabled' },
      system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return { text: (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('').trim(), stop: d.stop_reason };
}
const W = (s) => (String(s).match(/[A-Za-z’'-]+/g) || []).length;
function rozbor(t) {
  const iJ = t.lastIndexOf('}]'), iS = t.indexOf('✦');
  const kde = iS === -1 ? 'chybí' : (iJ !== -1 && iS > iJ ? 'za JSONem' : 'uvnitř JSONu');
  let body = t; try { const j = JSON.parse(t.slice(t.indexOf('['), iJ + 2)); body = j.map((x) => x.text).join(' '); } catch (e) {}
  return { kde, slov: W(body.split('✦')[0]), slov_mysl: iS === -1 ? 0 : W(t.slice(iS).replace(/"\s*}\s*]\s*$/, '')) };
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [eng, fn] of [['opus', opus], ['sol', sol]]) for (const [runa, area, seek, seed] of CTENI) {
    const P = prompty(runa, area, seek, seed, eng);
    for (const v of ['A', 'B']) for (let k = 0; k < 2; k++) {
      const r = await fn(sys, P[v]);
      const m = rozbor(r.text);
      out.push(Object.assign({ engine: eng, runa, varianta: v, k, stop: r.stop, text: r.text }, m));
      console.log('[' + eng + ' · ' + runa + ' · ' + v + k + '] ' + m.slov + ' sl. · ✦ ' + m.kde + ' (' + m.slov_mysl + ')');
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_mysl_delka.json'), JSON.stringify(out, null, 1));
  console.log('\n=== souhrn ===');
  for (const eng of ['opus', 'sol']) for (const v of ['A', 'B']) {
    const a = out.filter((x) => x.engine === eng && x.varianta === v), s = a.map((x) => x.slov);
    const kde = {}; for (const x of a) kde[x.kde] = (kde[x.kde] || 0) + 1;
    console.log(eng.padEnd(5), v, 'slov průměr', (s.reduce((p, q) => p + q, 0) / s.length).toFixed(1), '(' + Math.min(...s) + '–' + Math.max(...s) + ')',
      '· v rozpočtu 50–58:', s.filter((x) => x >= 50 && x <= 58).length + '/' + s.length, '· ✦', JSON.stringify(kde));
  }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

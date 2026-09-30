// 2026-09-30 — islandská kontrola esence [0] po nasazení B (owner „11. nasadit“). Produkční kód v4.81, rámec [0] vynucený
// (los by mohl dát [1]), obraz Hagalaz s řekou — tentýž případ, na kterém vznikla stížnost „was built too close?“. Opus 5, 1 čtení.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="is";READ_ENGINE="opus";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), E = vm.runInContext('ESSENCE_FRAMES_IS', S);
let p = null;
for (let s = 1; s < 8000 && !p; s++) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
  const q = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, R.find((r) => r.n === 'Hagalaz'), 'is', []);
  if (((S._promptDraws(q, 'is') || {}).image || '').indexOf('Áin bólgnar') === 0) p = q;
}
if (!p) throw new Error('obraz s řekou se nevylosoval');
if (p.indexOf(E[1]) !== -1) p = p.replace(E[1], E[0]);
if (p.indexOf(E[0]) === -1 || p.indexOf('Kunnuglega orðið') !== -1) throw new Error('v promptu není nový rámec [0]');
(async () => {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 1000, system: [{ type: 'text', text: S.buildSysPrompt(null, 'is'), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  let t = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {}
  console.log(t);
  fs.writeFileSync(path.join(__dirname, 'esence_is.json'), JSON.stringify({ ram: E[0], text: t }, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

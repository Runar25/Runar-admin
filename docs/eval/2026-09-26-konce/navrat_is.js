// Návrat k otázce v IS (2026-09-26, v4.65): 3 čtení s vlastní otázkou, pool vynucený na [4].
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="is";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), SK = vm.runInContext('SEEKS', S);
const O = vm.runInContext('ENDING_OPEN_IS', S), H = vm.runInContext('ENDING_HEAVY_IS', S);
for (let i = 0; i < 4; i++) { O[i] = O[4]; H[i] = H[4]; }
const CASE = [['Isa', 5, 4, 'Af hverju er orðið svona kalt á milli mín og bróður míns?'], ['Uruz', 2, 3, 'Hef ég það í mér að klára bókina sem ég byrjaði á?'], ['Laguz', 6, 0, 'Af hverju stoppa ég alltaf rétt áður en ég breytist?']];
(async () => {
  const sys = S.buildSysPrompt(null, 'is'), out = [];
  for (const [runa, ai, si, q] of CASE) {
    vm.runInContext('__s=' + (runa.length * 7919 + ai * 31 + si) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: A.is[ai], seeking: SK.is[si], question: q, intention: '' }, R.find(r => r.n === runa), 'is', []);
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
    const d = await res.json(); if (!res.ok) throw new Error(res.status);
    let t = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
    out.push({ runa, area: A.is[ai], seek: SK.is[si], reading: t }); console.log('== ' + runa + '\n' + t);
  }
  fs.writeFileSync(__dirname + '/navrat_is.json', JSON.stringify(out, null, 1));
})();

// 2026-09-30 — owner k Isa „In your home the talk has gone flat and careful“ (2026-09-23, v4.44): „v tomhle případě to chyba je.
// změnit obraz?“ Obraz byl příroda („Under the ice the stream can still be heard“) — tvrzení vzniklo při dosednutí do oblasti
// Family & Home. Od 2026-09-23 žádné živé čtení s touhle oblastí → dnešní stav (v4.82) změřit: 3 čtení Isa × Family & Home,
// produkční builder, Opus 5 (engine uživatelů): 2× EN (různé obrazy), 1× IS. Čte CODE jako uživatel: je věta o domově MÍSTO,
// kam obraz dosedne, nebo STAV domova podaný jako fakt?
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('READ_ENGINE="opus";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), K = vm.runInContext('SEEKS', S);
const isa = R.find((r) => r.n === 'Isa');
function postav(L, seed, jinyObraz) {
  vm.runInContext('lang="' + L + '"', S);
  for (let s = seed; s < seed + 4000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: A[L][5], seeking: K[L][1], question: '', intention: '' }, isa, L, []);
    const d = S._promptDraws(p, L) || {};
    if (!jinyObraz || (d.image || '') !== jinyObraz) return { p, d };
  }
  throw new Error('los');
}
async function opus(sys, p) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 1000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  let t = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {}
  return t;
}
(async () => {
  const out = [];
  const e1 = postav('en', 1), e2 = postav('en', 500, e1.d.image), i1 = postav('is', 1);
  for (const [jm, L, x] of [['EN #1', 'en', e1], ['EN #2', 'en', e2], ['IS #1', 'is', i1]]) {
    const t = await opus(S.buildSysPrompt(null, L), x.p);
    out.push({ jm, obraz: x.d.image, oblast_podoba: x.d.area_face, text: t });
    console.log('\n== Isa × Family & Home · ' + jm + ' · obraz: ' + x.d.image + ' (podoba oblasti ' + x.d.area_face + ')\n' + t);
  }
  fs.writeFileSync(path.join(__dirname, 'domov.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

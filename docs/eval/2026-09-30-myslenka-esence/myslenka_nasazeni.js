// 2026-09-30 — kontrola nasazení myšlenky ✦ (v4.83) PRODUKČNÍ cestou: prompt z builderu + řádek z _thoughtLine (tak, jak ho
// za prompt přidá runar-reading.js pro Standard/Premium), odpověď přes _parseSegments + _splitThought (co uvidí čtenář a co hlas).
// Opus 5 (engine uživatelů): EN single Uruz · IS single Isa · EN Norny (Nauthiz · Tiwaz · Perth, zdroj Skuld = Perth).
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('READ_ENGINE="opus";var __s=7;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), K = vm.runInContext('SEEKS', S), rr = (n) => R.find((r) => r.n === n);
async function opus(sys, p, max) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
}
(async () => {
  const out = [], M = vm.runInContext('RUNAR_MODES', S), SC = vm.runInContext('SPREAD_CONFIG', S);
  const beh = [
    ['EN single Uruz', 'en', () => S.buildReadingPrompt({ name: 'Kuky', area: A.en[1], seeking: K.en[2], question: '', intention: '' }, rr('Uruz'), 'en', []), rr('Uruz'), M.quick_reading.max_tokens],
    ['IS single Isa', 'is', () => S.buildReadingPrompt({ name: 'Kuky', area: A.is[6], seeking: K.is[4], question: '', intention: '' }, rr('Isa'), 'is', []), rr('Isa'), M.quick_reading.max_tokens],
    ['EN Norny (zdroj Perth)', 'en', () => S.buildNornsPrompt({ name: 'Kuky', area: A.en[1], seeking: K.en[2], question: '', intention: '' }, ['Nauthiz', 'Tiwaz', 'Perth'].map(rr), 'en', []), rr('Perth'), (SC.norns || {}).tokens || 900],
  ];
  for (const [jm, L, stav, zdroj, max] of beh) {
    vm.runInContext('lang="' + L + '"', S);
    const p = stav() + '\n' + S._thoughtLine(L, zdroj);
    const raw = await opus(S.buildSysPrompt(null, L), p, max);
    const seg = S._parseSegments(raw), sp = S._splitThought(seg.reading, seg.segs);
    out.push({ jm, cteni: sp.reading, myslenka: sp.thought, draws_thought: (S._promptDraws(p, L) || {}).thought });
    console.log('\n== ' + jm + '\n' + sp.reading + '\n✦ ' + (sp.thought || '(ŘÁDEK ✦ CHYBÍ)'));
  }
  fs.writeFileSync(path.join(__dirname, 'myslenka_nasazeni.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

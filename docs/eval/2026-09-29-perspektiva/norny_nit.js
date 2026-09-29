// 2026-09-29 — KUKY „pak otestuj Norny na 2 čteních“: kořenová oprava Norn (rozbor: „začne psem a pak tam dá mě“ — Skuld a rozvržení
// dob mluví o TVÉ cestě, „where you are heading if you keep walking“, a obraz psa model musí napasovat na čtenáře).
// Oprava: obě místa na NIT („where the thread is heading if it keeps its course“); závěrečná věta (landing) k tazateli zůstává.
// BEZ B2. Týž prompt jako ownerovo čtení 2026-09-28 15:07 (Norny Algiz · Ingwaz · Uruz, pes u stáda). 1× GPT (sol), 1× Opus 5.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const ZAMENY = [
  ['Skuld does not predict — she speaks of where you are heading if you keep walking as you are now, and you can walk differently.',
   'Skuld does not predict — she speaks of where the thread is heading if it keeps its course, and it can turn.'],
  ['Skuld (where you are heading)', 'Skuld (where the thread is heading)'],
];
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S);
const tri = ['Algiz', 'Ingwaz', 'Uruz'].map((n) => R.find((r) => r.n === n));
const u = { name: 'Kuky', area: 'Crossroads & Decisions', seeking: 'Clarity', question: '', intention: '' };
function postav(engine) {
  vm.runInContext('READ_ENGINE="' + engine + '"', S);
  for (let s = 1; s < 6000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 5) + ';', S);
    let q = S.buildNornsPrompt(u, tri, 'en', []);
    const d = S._promptDraws(q, 'en') || {};
    if ((d.image || '').indexOf('The sheepdog lies') === 0 && d.area_face === 0 && d.name === 2) {
      for (const [a, b] of ZAMENY) { if (q.indexOf(a) === -1) throw new Error('věta v promptu není: ' + a.slice(0, 40)); q = q.replace(a, b); }
      return q;
    }
  }
  throw new Error('obraz se nevylosoval');
}
const spoj = (t) => { try { return JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) { return t; } };
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = {};
  let p = postav('sol');
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 900,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
    out.gpt = spoj(String(d.choices[0].message.content || '')); out.gpt_usage = d.usage; break;
  }
  p = postav('opus');
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 900, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  out.opus = spoj((d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')); out.opus_usage = d.usage;
  out.prompt_opus = p;
  console.log('== GPT (sol), nit\n' + out.gpt + '\n\n== Opus 5, nit\n' + out.opus);
  fs.writeFileSync(path.join(__dirname, 'norny_nit.json'), JSON.stringify(out, null, 1));
})();

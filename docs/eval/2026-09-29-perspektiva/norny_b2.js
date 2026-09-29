// 2026-09-29 — KUKY „ano udělej ty Norny s B2“: ownerovo čtení 2026-09-28 15:07 (Norny Algiz · Ingwaz · Uruz, pes u stáda, GPT)
// „začne psem a pak tam dá mě“. Prompt = produkční buildNornsPrompt se stejnými losy jako tehdy (obraz psa, tvář oblasti 0, jméno
// nepoužít; oblast Crossroads & Decisions, hledání Clarity — oblast v DB u spreadu není, zvolena podle „your choice“ v textu),
// + řádek B2 hned za obrazem. 1× GPT (sol, jako tehdy), 1× Opus 5.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const B2 = 'The main figure of this picture is not the seeker, and the seeker has not seen the picture: name the figure plainly the first time it appears. Tell the picture from that figure\'s side, without "you", and let only the last line turn to the seeker.';
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
  vm.runInContext('READ_ENGINE="' + engine + '"', S);   // věta za obrazem se liší podle enginu (IMAGE_SEEING)
  for (let s = 1; s < 6000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 5) + ';', S);
    const q = S.buildNornsPrompt(u, tri, 'en', []);
    const d = S._promptDraws(q, 'en') || {};
    if ((d.image || '').indexOf('The sheepdog lies') === 0 && d.area_face === 0 && d.name === 2) {
      const r = q.split('\n'), i = r.findIndex((l) => l.indexOf('IMAGE —') === 0); r.splice(i + 1, 0, B2); return r.join('\n');
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
    out.gpt = spoj(String(d.choices[0].message.content || '')); break;
  }
  p = postav('opus');
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 900, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  out.opus = spoj((d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''));
  out.prompt_opus = p;
  console.log('== GPT (sol) + B2\n' + out.gpt + '\n\n== Opus 5 + B2\n' + out.opus);
  fs.writeFileSync(path.join(__dirname, 'norny_b2.json'), JSON.stringify(out, null, 1));
})();

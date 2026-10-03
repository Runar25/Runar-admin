// 2026-10-03 — myšlenka ✦ pro Podkovu a Yggdrasil (KUKY „10 myšlenku ✦ i pro Podkovu a Yggdrasil“), před nasazením 2 čtení
// produkční cestou: builder spreadu + řádek _thoughtLine ze zdrojové runy (Podkova runa 7 Výsledek, Yggdrasil runa 4 Midgard),
// limity tokenů jako appka (_spreadTokens 1300 / 1800). Výstup se rozdělí produkčními _parseSegments + _splitThought.
//   Podkova na gpt-6-sol (ownerův engine), Yggdrasil na claude-opus-5 (předplatitelé).
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=11;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const u = { name: 'Kuky', area: '', seeking: '', question: '', intention: '' };
async function sol(sys, p, max) {
  const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: max,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
    return { text: String(d.choices[0].message.content || ''), stop: d.choices[0].finish_reason, usage: d.usage };
  }
}
async function opus(sys, p, max) {
  const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return { text: (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''), stop: d.stop_reason, usage: d.usage };
}
(async () => {
  const out = [];
  const beh = [
    ['Podkova (sol 6)', 'sol', 'HORSESHOE', ['Fehu', 'Isa', 'Perth', 'Nauthiz', 'Ehwaz', 'Laguz', 'Dagaz'], 6, 1300, (r) => S.buildHorseshoePrompt(u, r, 'en', [])],
    ['Yggdrasil (Opus 5)', 'opus', 'YGGDRASIL', ['Ansuz', 'Wunjo', 'Sowilo', 'Gebo', 'Thurisaz', 'Kenaz', 'Jera', 'Laguz', 'Berkana'], 3, 1800, (r) => S.buildYggdrasilPrompt(u, r, 'en', [])],
  ];
  for (const [jm, engine, kind, jmena, zdroj, max, stav] of beh) {
    vm.runInContext('READ_ENGINE="' + engine + '";', S);
    const runy = jmena.map(rr);
    const p = stav(runy) + '\n' + S._thoughtLine('en', runy[zdroj]);
    const sys = S.buildSysPrompt(null, 'en');
    const r = engine === 'sol' ? await sol(sys, p, max) : await opus(sys, p, max);
    const seg = S._parseSegments(r.text), sp = S._splitThought(seg.reading, seg.segs);
    out.push({ jm, kind, runy: jmena, zdrojova: jmena[zdroj], stop: r.stop, usage: r.usage, prompt: p, raw: r.text, cteni: sp.reading, myslenka: sp.thought });
    console.log('\n######## ' + jm + ' · zdroj myšlenky: ' + jmena[zdroj] + ' · stop ' + r.stop + '\n' + sp.reading + '\n\n✦ ' + sp.thought);
  }
  fs.writeFileSync(path.join(__dirname, 'test_myslenka.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

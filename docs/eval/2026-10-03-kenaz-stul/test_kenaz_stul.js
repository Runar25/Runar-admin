// 2026-10-03 — nový obraz Kenaz (KUKY: „tenhle obraz bych chtěl jako nový, obraz pro Kenaz“): „The lamp over the kitchen table lights
// every chair, and one of them is empty.“ Pilot, co s ním udělá čtení: drží Kenaz světlo, které ukáže, co tam je, nebo z prázdné židle
// udělá tvrzení o něčí rodině? Produkční buildReadingPrompt (v4.90), losy pevné: první dva seedy, kde padne tenhle obraz u Family & Home,
// a první seed bez oblasti (owner: „někdo žádnou oblast nedodá… v tom případě by neměl mít obraz problém“). Model gpt-6-sol jako appka.
// ⚠️ Řádek do banky nešel (brána: Othila 2/3, EVAL_LOG 2026-10-03 (4)) — harness běží jen s ním v pracovním stromu.
//   node test_kenaz_stul.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="sol";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const OBRAZ = 'The lamp over the kitchen table lights every chair';
function prompt(area, seed) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('__s=' + (seed * 7919 + 17) + ';', S);
  const u = { name: 'Kuky', area, seeking: 'Clarity', question: '', intention: '' };
  const p = S.buildReadingPrompt(u, rr('Kenaz'), 'en', []) + '\n' + S._thoughtLine('en', rr('Kenaz'));
  return { p, d: S._promptDraws(p, 'en') || {} };
}
function najdi(area, kolik) {
  const out = [];
  for (let seed = 1; seed < 400 && out.length < kolik; seed++) {
    const x = prompt(area, seed);
    if (x.p.indexOf(OBRAZ) !== -1) out.push(Object.assign({ area, seed }, x));
  }
  if (out.length < kolik) throw new Error('obraz nepadl dost často: ' + area);
  return out;
}
async function volej(sys, p) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 1000,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
    return { text: String(d.choices[0].message.content || ''), usage: d.usage };
  }
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const b of najdi('Family & Home', 2).concat(najdi('', 1))) {
    const r = await volej(sys, b.p);
    out.push({ area: b.area, seed: b.seed, draws: b.d, usage: r.usage, prompt: b.p, text: r.text });
    console.log('\n######## Kenaz × ' + (b.area || '(bez oblasti)') + ' · seed ' + b.seed + ' · úhel ' + b.d.angle + ' · aspekt ' + JSON.stringify(b.d.kws || b.d.aspect || '') + '\n' + r.text);
  }
  fs.writeFileSync(path.join(__dirname, 'test_kenaz_stul.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

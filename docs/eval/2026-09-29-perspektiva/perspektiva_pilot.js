// 2026-09-29 — TEST 3 (KUKY „jeď test 3“): kdo je „ty“, když hlavní postavou obrazu je zvíře?
// Report 2026-09-28 15:17 (Norny, pes u stáda): „Podle Asku jsem pochopil, že ten sheepdog jsem já… v první větě to není tak
// pojmenováno. Nebo ať je to pojmenováno tak, že hlavní postava je ten sheepdog… nebo ukázat obraz jejím pohledem a v závěrečné
// otázce to přenést na uživatele?“ Ramena = ownerovy dvě možnosti proti produkci, jinak TÝŽ prompt (týž los, týž obraz):
//   P0 produkce · P1 „ty se díváš“ (první věta: čtenář postavu pozoruje) · P2 „pohledem postavy“ (obraz bez „ty“, jen poslední
//   věta se obrátí ke čtenáři). Řádek se vkládá hned za řádek IMAGE. Opus 5 jako proxy, EN (reporty byly EN).
//   node perspektiva_pilot.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const RAMENA = {
  P0: '',
  P1: 'The main figure of this picture is not the seeker. Let the first sentence make clear that the seeker is watching it, and keep them watching until the last line.',
  P2: 'The main figure of this picture is not the seeker. Tell the picture from that figure\'s side, without "you", and let only the last line turn to the seeker.',
};
const OBRAZY = [
  ['Algiz', 'The sheepdog lies where it can see the whole flock'],
  ['Berkana', 'The eider leads her ducklings down to the water on their first morning'],
  ['Uruz', 'The bull tears itself up out of the bog and keeps going'],
  ['Ehwaz', 'When one horse tires on the climb the other slows unasked, and they reach the ridge together'],
];
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const store = {}; S.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S);
async function volej(sys, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  let t = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
  return t;
}
function promptSObrazem(rune, cil, pokus) {   // los, dokud builder sám nevybere cílový obraz (páruje se s ním aspekt)
  for (let s = 1; s < 4000; s++) {
    for (const k of Object.keys(store)) delete store[k];
    vm.runInContext('__s=' + (s * 7919 + pokus * 104729) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, rune, 'en', []);
    const img = (S._promptDraws(p, 'en') || {}).image || '';
    if (img.indexOf(cil.slice(0, 30)) === 0) return p;
  }
  throw new Error('obraz se nevylosoval: ' + cil);
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [runa, cil] of OBRAZY) for (const pokus of [1, 2]) {
    const p = promptSObrazem(R.find((r) => r.n === runa), cil, pokus);
    const radky = p.split('\n'); const i = radky.findIndex((l) => l.indexOf('IMAGE —') === 0);
    if (i === -1) throw new Error('řádek IMAGE nenalezen');
    const zaznam = { runa, obraz: cil, pokus };
    for (const [arm, veta] of Object.entries(RAMENA)) {
      const r2 = radky.slice(); if (veta) r2.splice(i + 1, 0, veta);
      zaznam[arm] = await volej(sys, r2.join('\n'));
    }
    out.push(zaznam);
    console.log('\n== ' + runa + ' #' + pokus + ' · ' + cil);
    for (const arm of Object.keys(RAMENA)) console.log('[' + arm + '] ' + zaznam[arm].replace(/\n+/g, ' '));
  }
  fs.writeFileSync(path.join(__dirname, 'perspektiva.json'), JSON.stringify(out, null, 1));
})();

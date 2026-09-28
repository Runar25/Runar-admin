// 2026-09-28 — pokyn pro esenční řádek [0] (KUKY k Berkaně „Berkana is that crossing“: „opravit, nemůžeme používat zavádějící slova“).
// Staré [0] říká, co runa DĚLÁ („what the rune DOES through this image“) → runa si bere děj obrazu, který koná někdo jiný (kajka
// převádí káčata = „Berkana is that crossing“; Hagalaz „opens the field“). Nové [0] říká, kterou STRÁNKU runy obraz ukazuje.
// Dvě ramena, TÝŽ prompt (produkční single builder, týž seed/los obrazu), liší se jen text esenčního rámce. Opus 5 jako proxy.
//   node esence0_pilot.js en|is
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const L = process.argv[2] || 'en';
const NOVE = {
  en: 'THE ESSENCE LINE: after the picture, one short line that says which side of the rune this picture shows — its sense in plain words a stranger to runes can grasp. The familiar word may live inside the scene ("exchange between the sea and the shore"). Never a fixed formula. No invented mechanism, no fate. Never tell the seeker what it means for them.',
  is: 'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína sem segir hvaða hlið rúnarinnar þessi mynd sýnir — merking hennar með hversdagslegum orðum sem ókunnugur skilur. Kunnuglega orðið má lifa inni í myndinni. Aldrei föst formúla. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.',
};
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const store = {}; S.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="' + L + '";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S);
const RAMY = vm.runInContext(L === 'is' ? 'ESSENCE_FRAMES_IS' : 'ESSENCE_FRAMES', S);
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
(async () => {
  const sys = S.buildSysPrompt(null, L), out = [];
  for (const runa of (process.argv[3] || 'Berkana,Hagalaz,Raidho,Gebo,Ehwaz,Laguz').split(',')) {
    const rune = R.find((r) => r.n === runa);
    for (const k of Object.keys(store)) delete store[k];
    vm.runInContext('__s=' + (runa.length * 7919 + 11) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, rune, L, []);
    const byl = RAMY.find((r) => p.indexOf(r) !== -1);
    if (!byl) throw new Error('esenční rámec v promptu nenalezen: ' + runa);
    const obraz = (S._promptDraws(p, L) || {}).image || '';
    const r = { runa, obraz, stare: '', nove: '' };
    r.stare = await volej(sys, p.replace(byl, RAMY[0]));
    r.nove = await volej(sys, p.replace(byl, NOVE[L]));
    out.push(r);
    console.log('\n== ' + runa + ' · obraz: ' + obraz + '\n[staré] ' + r.stare.replace(/\n+/g, ' ') + '\n[nové]  ' + r.nove.replace(/\n+/g, ' '));
  }
  fs.writeFileSync(path.join(__dirname, 'esence0_' + L + '.json'), JSON.stringify(out, null, 1));
})();

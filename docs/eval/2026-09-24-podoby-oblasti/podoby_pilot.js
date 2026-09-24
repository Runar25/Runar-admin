// Pilot podob oblasti (KUKY 2026-09-24 bod 5 „připrav"): Career & Creativity, produkční model Opus 5 (VÝJIMKA 2 —
// test chování modelu na změnu promptu). 6 run × 2 ramena × EN+IS; týž seed v obou ramenech (obraz, úhel, tvar konce).
// Rameno 0 = dnešní znění (podoba [0]); rameno 1 = podoby [1]..[4] po řadě. Liší se JEN cíl v řádku oblasti a v mostu.
// Měří: v kolika čteních stojí slovo oblasti (EN work/making, IS vinn-/smíð-). Klíč se čte ze souboru, nevypisuje.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const PODOBY = require('./podoby_oblasti.js');
const CAREER = PODOBY.find(a => a.area === 'Career & Creativity').faces;
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S);
const RUNY = ['Uruz', 'Kenaz', 'Perth', 'Jera', 'Ingwaz', 'Fehu'];
const DNES = { en: ['land on making and work.', 'in what the seeker is making'],
               is: ['lenda á smíð og vinnu.', 'í því sem leitandinn er að smíða'] };
function postav(L, runa, face) {
  vm.runInContext('lang="' + L + '"; __s=' + (runa.length * 7919 + runa.charCodeAt(0)) + ';', S);
  let p = S.buildReadingPrompt({ name: 'Kuky', area: A[L][2], seeking: '', question: '', intention: '' }, R.find(r => r.n === runa), L, []);
  if (face) {
    const [land, bridge] = face[L];
    for (const [a, b] of [[DNES[L][0], (L === 'is' ? 'lenda á ' : 'land on ') + land + '.'], [DNES[L][1], bridge]]) {
      if (p.split(a).length !== 2) throw new Error('náhrada ne právě jednou: ' + L + ' ' + a);
      p = p.replace(a, b);
    }
  }
  return p;
}
async function volej(sys, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json();
  if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  return (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
}
(async () => {
  if (process.argv[2] === 'ukaz') { console.log(postav('is', 'Uruz', CAREER[1])); return; }
  const out = [];
  for (const L of ['en', 'is']) {
    const sys = S.buildSysPrompt(null, L);
    for (let i = 0; i < RUNY.length; i++) for (const arm of [0, 1]) {
      const face = arm ? CAREER[1 + (i % 4)] : null;
      const t = await volej(sys, postav(L, RUNY[i], face));
      const reading = (S._parseSegments ? S._parseSegments(t).reading : t) || t;
      out.push({ L, runa: RUNY[i], arm, face: face ? face.en[0] : 'dnes', reading });
      console.log(L, RUNY[i], arm ? 'PODOBA ' + face.en[0] : 'DNES', '|', reading);
    }
  }
  fs.writeFileSync(__dirname + '/podoby_pilot.json', JSON.stringify(out, null, 1));
  const re = { en: /\b(work|working|making|made|make)\b/i, is: /\b(vinn\w*|verk\w*|smí\w*)\b/i };
  for (const L of ['en', 'is']) for (const arm of [0, 1]) {
    const x = out.filter(o => o.L === L && o.arm === arm);
    console.log(L, arm ? 'podoby' : 'dnes ', '| slovo oblasti:', x.filter(o => re[L].test(o.reading)).length + '/' + x.length,
      '| work/vinn:', x.filter(o => (L === 'en' ? /\bwork/i : /\bvinn/i).test(o.reading)).length + '/' + x.length,
      '| slov průměr:', Math.round(x.reduce((s, o) => s + o.reading.split(/\s+/).length, 0) / x.length));
  }
})();

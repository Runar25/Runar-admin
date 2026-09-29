// 2026-09-29 — TEST 3, kolo 2 (owner „ano B, nasaď to“): než B půjde do produkce, dvě plochy, které kolo 1 nepokrylo:
//   (a) IS single — 4 obrazy × 1 los, P0 × B-IS · (b) EN spread Norny s obrazem psa u stáda (ownerův případ) — 3 losy, P0 × B.
// Týž prompt, liší se jen řádek za obrazem. Opus 5. Soudí slepý soudce stejnými otázkami jako kolo 1.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const B = {
  en: 'The main figure of this picture is not the seeker. Tell the picture from that figure\'s side, without "you", and let only the last line turn to the seeker.',
  is: 'Aðalpersóna myndarinnar er ekki leitandinn. Segðu myndina frá sjónarhorni hennar án þess að ávarpa leitandann. Láttu aðeins síðustu línuna beinast að honum.',
};
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const store = {}; S.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), IMGS = vm.runInContext('RUNE_IMAGES', S);
async function volej(sys, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 900, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  let t = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  try { const j = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)); t = j.map((x) => x.text).join(' '); } catch (e) {}
  return t;
}
const u = { name: 'Kuky', area: '', seeking: '', question: '', intention: '' };
function postav(stavitel, cilEN, pokus) {   // los, dokud builder sám nevybere cílový obraz
  for (let s = 1; s < 6000; s++) {
    for (const k of Object.keys(store)) delete store[k];
    vm.runInContext('__s=' + (s * 7919 + pokus * 104729) + ';', S);
    const p = stavitel();
    const row = IMGS.find((r) => r[3].indexOf(cilEN.slice(0, 30)) === 0);
    if (row && (p.indexOf(row[2].replace(/\.$/, '')) !== -1 || p.indexOf(row[3].replace(/\.$/, '')) !== -1)) return p;
  }
  throw new Error('obraz se nevylosoval: ' + cilEN);
}
function vloz(p, L, veta) {
  const radky = p.split('\n'); const i = radky.findIndex((l) => l.indexOf(L === 'is' ? 'MYND —' : 'IMAGE —') === 0);
  if (i === -1) throw new Error('řádek obrazu nenalezen'); radky.splice(i + 1, 0, veta); return radky.join('\n');
}
(async () => {
  const out = [];
  vm.runInContext('lang="is"', S);
  const sysIS = S.buildSysPrompt(null, 'is');
  for (const [runa, cil] of [['Algiz', 'The sheepdog lies where it can see the whole flock'], ['Berkana', 'The eider leads her ducklings'],
                             ['Uruz', 'The bull tears itself up out of the bog'], ['Ehwaz', 'When one horse tires on the climb']]) {
    const p = postav(() => S.buildReadingPrompt(u, R.find((r) => r.n === runa), 'is', []), cil, 1);
    const z = { plocha: 'is-single', runa, obraz: cil, P0: await volej(sysIS, p), B: await volej(sysIS, vloz(p, 'is', B.is)) };
    out.push(z); console.log('\n== IS ' + runa + '\n[P0] ' + z.P0.replace(/\n+/g, ' ') + '\n[B]  ' + z.B.replace(/\n+/g, ' '));
  }
  vm.runInContext('lang="en"', S);
  const sysEN = S.buildSysPrompt(null, 'en');
  const trojice = [R.find((r) => r.n === 'Algiz'), R.find((r) => r.n === 'Ingwaz'), R.find((r) => r.n === 'Uruz')];   // ownerovy Norny 2026-09-28
  for (const pokus of [1, 2, 3]) {
    const p = postav(() => S.buildNornsPrompt(u, trojice, 'en', []), 'The sheepdog lies where it can see the whole flock', pokus);
    const z = { plocha: 'en-norny', runa: 'Algiz·Ingwaz·Uruz', obraz: 'The sheepdog lies where it can see the whole flock', P0: await volej(sysEN, p), B: await volej(sysEN, vloz(p, 'en', B.en)) };
    out.push(z); console.log('\n== Norny #' + pokus + '\n[P0] ' + z.P0.replace(/\n+/g, ' ') + '\n[B]  ' + z.B.replace(/\n+/g, ' '));
  }
  fs.writeFileSync(path.join(__dirname, 'perspektiva_is_norny.json'), JSON.stringify(out, null, 1));
})();

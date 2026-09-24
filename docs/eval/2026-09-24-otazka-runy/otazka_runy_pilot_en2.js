// Bod 7 (KUKY 2026-09-24 „zkus to“): otázka runy jako skrytý podklad poslední věty. PILOT, produkční model
// (VÝJIMKA 2 v memory cteni-generuj-tady-ne-pres-api: test chování modelu na změnu promptu jede přes API).
// 6 run × 2 ramena, TÝŽ seed v obou ramenech → stejný obraz, úhel, tvar konce; liší se jen řádka s otázkou.
// Otázka = 4. odstavec textu runy v Kolekci (UI_TEXT.en.coll_rune[runa][3]) — ownerem schválený, jeden zdroj.
// Rámováno jako ZDROJ („grow out of“), ne příkaz k použití (memory prompt-directive-makes-model-copy).
// Klíč se čte ze souboru a nevypisuje.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), SK = vm.runInContext('SEEKS', S);
const UI = vm.runInContext('UI_TEXT', S);
// runa · oblast · rejstřík (indexy AREAS/SEEKS). Algiz = případ „cesta se váží“, kde konec vyzněl naprázdno.
const CASE = [['Algiz', 1, 0], ['Isa', 5, 4], ['Thurisaz', 5, 2], ['Uruz', 2, 3], ['Gebo', 0, 1], ['Laguz', 6, 0]];
const RAMEC = q => "Let it grow out of the rune's question (\"" + (q.indexOf(":") !== -1 ? q.slice(q.indexOf(":") + 1).trim() : q) + "\"), but say it in your own words.";
function postav(runa, ai, si, sOtazkou) {
  vm.runInContext('__s=' + (runa.length * 7919 + ai * 31 + si) + ';', S);
  const rune = R.find(r => r.n === runa);
  let p = S.buildReadingPrompt({ name: 'Kuky', area: A.en[ai], seeking: SK.en[si], question: '', intention: '' }, rune, 'en', []);
  if (sOtazkou) {
    const q = UI.en.coll_rune[runa][3];
    const m = p.match(/End on one [^\n]*/);
    if (!m) throw new Error('konec nenalezen: ' + runa);
    p = p.replace(m[0], m[0] + ' ' + RAMEC(q));
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
  return { text: (d.content || []).filter(c => c.type === 'text').map(c => c.text).join(''), usage: d.usage };
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en');
  if (process.argv[2] === 'ukaz') { console.log(postav('Algiz', 1, 0, true)); return; }
  const out = [];
  for (const [runa, ai, si] of CASE) for (const arm of [1]) {
    const p = postav(runa, ai, si, !!arm);
    const r = await volej(sys, p);
    const reading = (S._parseSegments ? S._parseSegments(r.text).reading : r.text) || r.text;
    out.push({ runa, arm, area: A.en[ai], seek: SK.en[si], otazka: UI.en.coll_rune[runa][3], reading, usage: r.usage });
    console.log(runa, arm ? 'S OTÁZKOU' : 'BEZ', '|', reading);
  }
  fs.writeFileSync(__dirname + '/otazka_runy_pilot_en2.json', JSON.stringify(out, null, 1));
})();

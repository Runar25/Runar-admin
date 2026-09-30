// 2026-09-30 — islandská kontrola před nasazením bodů 1 + 2 (owner „1 ano nasaď“, „2 ano“). EN testoval owner 2026-09-29
// (docs/eval/2026-09-29-testy); IS verze pokynů jsou nové, proto po jednom čtení, Opus (engine uživatelů), produkční cestou:
//   1) Norny se psem — NOVÝ kód (nit + B2 hned za obrazem), losy jako v EN testu
//   2) single Uruz, býk v ohradě — NOVÝ kód (jen „pojmenuj“)
//   3) Fehu životní runa BEZ „hreyfanleg orka“ — klíč přepsán jen tady (změna runar-runes.js až po přečtení)
// ⚠️ Záznam, ne opakovatelný test: od v4.79 (DECISIONS 2026-09-30 (1)) klíč v datech není, krok 3 by teď skončil chybou;
//    kroky 1–2 psané proti v4.80 (DECISIONS 2026-09-30 (2)) — nový kód skládá tentýž prompt, jen bez ručního vkládání.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="is";READ_ENGINE="opus";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), rr = (n) => R.find((r) => r.n === n);
const AR = vm.runInContext('AREAS', S).is, SK = vm.runInContext('SEEKS', S).is;
function losuj(stav, test) {
  for (let s = 1; s < 8000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = stav(); const d = S._promptDraws(p, 'is') || {};
    if (test(d, p)) return p;
  }
  throw new Error('losy se nevylosovaly');
}
async function opus(sys, p, max) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max || 1000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
}
const spoj = (t) => { try { return JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) { return t.trim(); } };
const u = (area, seeking) => ({ name: 'Kuky', area, seeking, question: '', intention: '' });
(async () => {
  const sys = S.buildSysPrompt(null, 'is'), out = [];
  const P = vm.runInContext('IMG_POSTAVA', S).is;
  const zapis = async (jm, p, max, kontrola) => {
    const t = spoj(await opus(sys, p, max)); out.push({ jm, kontrola, text: t }); console.log('\n== ' + jm + '\n(' + kontrola + ')\n' + t);
  };
  // 1) Norny se psem
  const pN = losuj(() => S.buildNornsPrompt(u(AR[7], SK[1]), ['Algiz', 'Ingwaz', 'Uruz'].map(rr), 'is', []),
    (d) => (d.image || '').indexOf('Fjárhundurinn liggur') === 0 && d.area_face === 0 && d.name === 2);
  if (pN.indexOf(P.jmenuj + ' ' + P.pohled) === -1 || pN.indexOf('hvert þú stefnir') !== -1) throw new Error('Norny: B2/nit v promptu nesedí');
  await zapis('Norny IS · nit + B2 · Opus', pN, 1000, 'B2 v promptu, „hvert þú stefnir“ není');
  // 2) single Uruz, býk v ohradě
  const pS = losuj(() => S.buildReadingPrompt(u(AR[4], SK[0]), rr('Uruz'), 'is', []),
    (d) => (d.image || '').indexOf('Nautið snýr sér við') === 0);
  if (pS.indexOf(P.jmenuj) === -1 || pS.indexOf(P.pohled) !== -1) throw new Error('single: jmenuj v promptu nesedí');
  await zapis('Single IS · Uruz (býk v ohradě) · pojmenuj · Opus', pS, 1000, 'jen „pojmenuj“ v promptu');
  // 3) Fehu životní runa bez „hreyfanleg orka“
  const fehu0 = rr('Fehu');
  const pF0 = S.buildLifeRunePrompt('Kuky', fehu0, 4, 7, 1985, 'is', false, []);
  if (pF0.indexOf('hreyfanleg orka') === -1) throw new Error('klíč v původním promptu není — přepis by nic neměřil');
  vm.runInContext('__s=3;', S);
  const pF = S.buildLifeRunePrompt('Kuky', Object.assign({}, fehu0, { k: 'wealth, cattle, material prosperity', k_is: 'efnisleg velsæld, auður, búfé' }), 4, 7, 1985, 'is', false, []);
  if (pF.indexOf('hreyfanleg orka') !== -1) throw new Error('klíč v promptu zůstal');
  await zapis('Fehu životní runa IS bez „hreyfanleg orka“ · Opus', pF, vm.runInContext('RUNAR_MODES.life_rune_standard.max_tokens', S), 'původní prompt klíč měl, testovaný ne');
  fs.writeFileSync(path.join(__dirname, 'postava_is.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });

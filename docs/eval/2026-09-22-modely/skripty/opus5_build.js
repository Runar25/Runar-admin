// CODE-read 2026-09-24 — Opus 5 × Opus 4.8 na single + Norns (owner: „změř jen pár run na single a norns. Chci přejít na
// Opus 5."). PRODUKČNÍ prompty beze změn (dnešní kód, dnešní korekce z DB), pevné semeno. 3 runy single (lehká · těžká ·
// lehká) + 2 sestavy Norns, EN i IS. Obraz a úhel losuje produkce (semeno) — oba modely dostanou IDENTICKÉ bajty.
//   node opus5_build.js → opus5/NN-*.json
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'opus5'); fs.mkdirSync(OUT, { recursive: true });
const KOR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'korekce-norm.json'), 'utf8'));
const SINGLE = [['Fehu', 'Career & Creativity', 'Clarity'], ['Hagalaz', 'Crossroads & Decisions', 'Insight into Challenge'], ['Mannaz', 'Love & Relationships', 'Reflection']];
const NORNS = [[['Gebo', 'Ingwaz', 'Othila'], 'The Unseen', 2], [['Fehu', 'Hagalaz', 'Berkana'], 'Love & Relationships', 1]];
let n = 0;
for (const lang of ['en', 'is']) {
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {}; S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __s=' + (lang === 'en' ? 20260924 : 20260925) + '; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
  const sys = vm.runInContext('buildSysPrompt(null, ' + JSON.stringify(lang) + ')', S);
  const AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S), INT = vm.runInContext('INTENTIONS', S);
  const R = x => 'RUNES.filter(function(r){return r.n===' + JSON.stringify(x) + ';})[0]';
  const tr = (arr, v) => arr[lang][arr.en.indexOf(v)];
  for (const [runa, area, seek] of SINGLE) {
    const u = { name: 'Kuky', area: tr(AREAS, area), seeking: tr(SEEKS, seek) };
    const user = vm.runInContext('buildReadingPromptSingle(' + JSON.stringify(u) + ',' + R(runa) + ',' + JSON.stringify(lang) + ',' + JSON.stringify(KOR) + ')', S);
    const id = String(++n).padStart(2, '0') + '-single-' + runa.toLowerCase() + '-' + lang;
    fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, lang, spread: 'single', runy: [runa], area: u.area, seeking: u.seeking, sys,
      max_tokens: vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S), ramena: { prod: user } }, null, 1));
    console.log(id);
  }
  for (const [runy, area, zi] of NORNS) {
    const u = { name: 'Kuky', area: tr(AREAS, area), intention: INT[lang][zi] };
    const user = vm.runInContext('buildNornsPrompt(' + JSON.stringify(u) + ',[' + runy.map(R).join(',') + '],' + JSON.stringify(lang) + ',' + JSON.stringify(KOR) + ')', S);
    const id = String(++n).padStart(2, '0') + '-norns-' + runy.map(r => r.toLowerCase()).join('-') + '-' + lang;
    fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, lang, spread: 'norns', runy, area: u.area, intention: u.intention, sys,
      max_tokens: vm.runInContext('SPREAD_CONFIG.norns.tokens', S), ramena: { prod: user } }, null, 1));
    console.log(id);
  }
}

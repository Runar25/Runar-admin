// CODE-read 2026-09-23 — VETSI identitni beh (owner: „pust vetsi beh i s jednim klicovym slovem").
// Po pilotu 2026-09-23 (2). 6 sad × 3 ramena, IS; modely gpt-6-sol a Opus 5 (1 cteni na prompt).
//   S = 4 klicova slova u runy (produkce) · J = JEDNO (prvni ze seznamu, jako single `focus on`) · B = zadne
// Ramena z JEDNOHO postaveneho promptu — lisi se jen radky „<Runa> — …". Glosa pryc ve vsech (jako ve varce).
// ⚠️ U nekterych run je prvni slovo doslova vec (hagl, ís, björk, ýviður, hestur, sól, vatn) — J tedy nechava
//    presne tu nalepku, kterou sol v pilotu opsal („birki"). Proto se meri identita I opisovani.
// ⚠️ 2026-09-23: islandska jmena run zacinaji i na Þ (Þurs = Thurisaz, Perþ = Perth). Prvni verze mela [A-Z]
//    a pojistka „prave 3×" to chytila na sade 5. Glosa je zapecena primo v datech: RUNES[].is_n = "Þurs (Hlið)".
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'ident2');
fs.mkdirSync(OUT, { recursive: true });
const JM = '[A-ZÞÆÖÁÐÉÍÓÚÝ][a-zþæöáðéíóúý]+';          // islandske jmeno runy na zacatku radku

const SADY = [
  { id: '1', runy: ['Gebo', 'Ingwaz', 'Othila'],     area: 'Hið dulda',            zamer: 2 },
  { id: '2', runy: ['Fehu', 'Hagalaz', 'Berkana'],   area: 'Ást & Sambönd',        zamer: 1 },
  { id: '3', runy: ['Raidho', 'Isa', 'Sowilo'],      area: 'Tilgangur & Leið',     zamer: 0 },
  { id: '4', runy: ['Uruz', 'Nauthiz', 'Wunjo'],     area: 'Heilun & Líðan',       zamer: 0 },
  { id: '5', runy: ['Thurisaz', 'Jera', 'Laguz'],    area: 'Starf & Sköpun',       zamer: 1 },
  { id: '6', runy: ['Ansuz', 'Eihwaz', 'Mannaz'],    area: 'Innri Vöxtur',         zamer: 2 },
];
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'is';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {};
S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext('var __s=20260924; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const sys = vm.runInContext('buildSysPrompt(null, "is")', S);
const IMG = vm.runInContext('RUNE_IMAGES', S);
const R = n => `RUNES.filter(function(x){return x.n===${JSON.stringify(n)};})[0]`;

function presne(p, re, za, cekam, co) {
  const n = (p.match(re) || []).length;
  if (n !== cekam) throw new Error(co + ': zasah ' + n + '×, cekal jsem ' + cekam);
  return p.replace(re, za);
}
for (const s of SADY) {
  const zamer = vm.runInContext(`INTENTIONS.is[${s.zamer}]`, S);
  const u = `{name:"Kuky",area:${JSON.stringify(s.area)},intention:${JSON.stringify(zamer)}}`;
  let base = vm.runInContext(`buildNornsPrompt(${u},[${s.runy.map(R).join(',')}],"is",null)`, S);
  base = presne(base, new RegExp('^(' + JM + ') \\([^)]*\\) — ', 'gm'), '$1 — ', 3, s.id + ' glosa');
  // puvodni seznam per runa (pro mereni opisovani); radky jdou v poradi run → klic latinskym jmenem
  const kw = {};
  base.split('\n').filter(l => new RegExp('^' + JM + ' — ').test(l)).forEach((l, i) => { kw[s.runy[i]] = l.replace(/^[^—]+— /, ''); });
  if (Object.keys(kw).length !== 3) throw new Error(s.id + ': seznamu ' + Object.keys(kw).length);
  const jedno = presne(base, new RegExp('^(' + JM + ') — ([^,]+),.*$', 'gm'), '$1 — $2', 3, s.id + ' jedno slovo');
  const zadne = presne(base, new RegExp('^(' + JM + ') — .+$', 'gm'), '$1', 3, s.id + ' bez seznamu');
  const radekObrazu = base.split('\n').find(l => /^MYND —/.test(l)) || '';
  const obraz = [...new Set(IMG.filter(r => r.some(c => typeof c === 'string' && c.length > 12 && radekObrazu.includes(c.split('.')[0].slice(0, 30)))).map(r => r[0]))].filter(n => s.runy.includes(n));
  if (obraz.length !== 1) throw new Error(s.id + ': runa obrazu nejednoznacna ' + JSON.stringify(obraz));
  for (const [arm, user] of [['S', base], ['J', jedno], ['B', zadne]])
    fs.writeFileSync(path.join(OUT, s.id + arm + '.json'), JSON.stringify({ id: s.id + arm, sada: s.id, arm, runy: s.runy, kw,
      obrazova_runa: obraz, lang: 'is', spread: 'norns', sys, user, max_tokens: vm.runInContext('SPREAD_CONFIG.norns.tokens', S) }, null, 1));
  console.log('sada ' + s.id + ' ' + s.runy.join('/').padEnd(24) + ' obraz → ' + obraz[0].padEnd(8) + ' J: ' + s.runy.map(r => kw[r].split(',')[0]).join(' / '));
}

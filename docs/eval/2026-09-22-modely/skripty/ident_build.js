// CODE-read 2026-09-23 — PILOT identitniho testu (owner: „pust ten test identity, zase napred na malem").
// Otazka: zeslabne identita run v Norns cteni gpt-6-sol, kdyz z promptu zmizi seznamy klicovych slov?
// 3 sady run × 2 ramena (S = se seznamy = produkce, B = bez seznamu), IS, sol, 1 cteni na prompt.
// Ramena z JEDNOHO postaveneho promptu (tytez losy, tentyz obraz) — lisi se jen radky „<Runa> — …".
// Glosa pryc v obou (jako ve varce), at se meri jen seznamy.
// ⚠️ Obraz se losuje z PRVNI runy → runa 1 je poznat z obrazu v obou ramenech. Riziko je u run 2 a 3,
//    proto se uspesnost pocita zvlast pro pozici 1 a pro pozice 2–3.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'ident');
fs.mkdirSync(OUT, { recursive: true });

const SADY = [
  { id: 'A', runy: ['Gebo', 'Ingwaz', 'Othila'], area: 'Hið dulda', zamer: 2 },
  { id: 'B', runy: ['Fehu', 'Hagalaz', 'Berkana'], area: 'Ást & Sambönd', zamer: 1 },
  { id: 'C', runy: ['Raidho', 'Isa', 'Sowilo'], area: 'Tilgangur & Leið', zamer: 0 },
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
vm.runInContext('var __s=20260923; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const sys = vm.runInContext('buildSysPrompt(null, "is")', S);
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
  base = presne(base, /^([A-Z][a-z]+) \([^)]*\) — /gm, '$1 — ', 3, s.id + ' glosa');          // jako ve varce
  const bez = presne(base, /^([A-Z][a-z]+) — .+$/gm, '$1', 3, s.id + ' seznamy');              // rameno B
  const obraz = (base.split('\n').find(l => /^MYND —/.test(l)) || '').slice(0, 110);
  for (const [arm, user] of [['S', base], ['B', bez]]) {
    fs.writeFileSync(path.join(OUT, s.id + arm + '.json'), JSON.stringify({ id: s.id + arm, sada: s.id, arm, runy: s.runy,
      lang: 'is', spread: 'norns', sys, user, max_tokens: vm.runInContext('SPREAD_CONFIG.norns.tokens', S) }, null, 1));
  }
  console.log(s.id + ' ' + s.runy.join('/') + ' · ' + s.area + ' · ' + zamer + '\n   ' + obraz);
}

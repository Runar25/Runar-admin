// CODE-read 2026-09-23 — tvrda mereni varky opis2 (bez soudcu). Kazde cteni: nejdelsi doslovny usek z vety obrazu,
// slova obrazu v 1. vete (v1), ozvena pokynu (notice / look closer / someone there), „eye", delka, jmeno.
// Rozpad: model × rameno; smysl (zrak × nezrakove); uhel; pulka proti pulce (prompty 01–07 × 08–14, §27 utok 1).
//   node opis_analyza.js
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js');
const DIR = path.join(__dirname, 'opis2');
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);

const R = L.map(x => {
  const p = P[x.id], t = x.text;
  const m = zmer(t, 'comes from here: ' + p.obraz + '. Let it become');
  const bezJmena = /do not use the name Kuky at all/.test(p.ramena.prod);
  return Object.assign({}, x, {
    uhel: p.uhel, smysl: p.smysl, zrak: p.smysl === 'zrak', pulka: +p.id.slice(0, 2) <= 7 ? 'A' : 'B', tezka: p.tezka,
    beh: m.beh, usek: m.usek, v1p: m.v1p,
    notice: (t.match(/\bnotic/gi) || []).length, closer: /look(s|ing)? closer/i.test(t), someone: /someone there/i.test(t),
    noticeFirst: /notic\w*[^.?!]{0,40}\bfirst\b|\bfirst\b[^.?!]{0,25}notic/i.test(t), eye: (t.match(/\beyes?\b/gi) || []).length,
    slov: t.split(/\s+/).length, vet: t.split(/(?<=[.?!])\s+/).length,
    jmenoChyba: bezJmena ? /\bKuky\b/.test(t) : !/\bKuky\b/.test(t),
  });
});
fs.writeFileSync(path.join(DIR, 'mereni.json'), JSON.stringify(R, null, 1));

const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;
const f2 = v => (isNaN(v) ? '  – ' : v.toFixed(2));
function radek(nm, xs) {
  return nm.padEnd(30) + ' n=' + String(xs.length).padStart(2) + ' · usek ' + f2(avg(xs.map(x => x.beh))) + ' · usek≥5 ' + xs.filter(x => x.beh >= 5).length
    + ' · v1 ' + f2(avg(xs.map(x => x.v1p))) + ' · notice ' + xs.filter(x => x.notice).length + ' (first ' + xs.filter(x => x.noticeFirst).length + ')'
    + ' · eye ' + xs.filter(x => x.eye).length + ' · slov ' + f2(avg(xs.map(x => x.slov))).slice(0, 5) + ' · jmeno✗ ' + xs.filter(x => x.jmenoChyba).length;
}
const sk = (fn) => { const g = {}; for (const x of R) (g[fn(x)] = g[fn(x)] || []).push(x); return g; };
console.log('=== model × rameno');
for (const [k, xs] of Object.entries(sk(x => x.model + ' ' + x.rameno)).sort()) console.log(radek(k, xs));
console.log('\n=== model × rameno × smysl');
for (const [k, xs] of Object.entries(sk(x => x.model.slice(0, 9) + ' ' + x.rameno + ' ' + (x.zrak ? 'zrak' : 'NEzrak'))).sort()) console.log(radek(k, xs));
console.log('\n=== pulka proti pulce (01–07 = A, 08–14 = B)');
for (const [k, xs] of Object.entries(sk(x => x.model.slice(0, 9) + ' ' + x.rameno + ' ' + x.pulka)).sort()) console.log(radek(k, xs));
console.log('\n=== uhel (usek prod→nova, v1 prod→nova) po modelech');
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) for (let u = 0; u < 7; u++) {
  const a = R.filter(x => x.model === m && x.uhel === u && x.rameno === 'prod'), b = R.filter(x => x.model === m && x.uhel === u && x.rameno === 'nova');
  console.log(m.slice(0, 9).padEnd(10) + ' u' + u + '  usek ' + a.map(x => x.beh).join('/') + ' → ' + b.map(x => x.beh).join('/') + '   v1 ' + f2(avg(a.map(x => x.v1p))) + ' → ' + f2(avg(b.map(x => x.v1p))) + '   notice ' + a.filter(x => x.notice).length + '→' + b.filter(x => x.notice).length);
}
// parove: stejny prompt × model × opakovani
console.log('\n=== parove (nova − prod), stejny prompt × model × opakovani');
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) {
  const d = [], dv = [];
  for (const x of R.filter(y => y.model === m && y.rameno === 'nova')) {
    const y = R.find(z => z.model === m && z.id === x.id && z.rep === x.rep && z.rameno === 'prod'); if (!y) continue;
    d.push(x.beh - y.beh); dv.push(x.v1p - y.v1p);
  }
  console.log(m.padEnd(16) + ' paru ' + d.length + ' · usek: kratsi ' + d.filter(v => v < 0).length + ' / stejny ' + d.filter(v => v === 0).length + ' / delsi ' + d.filter(v => v > 0).length
    + ' · v1: mene ' + dv.filter(v => v < 0).length + ' / stejne ' + dv.filter(v => v === 0).length + ' / vic ' + dv.filter(v => v > 0).length);
}
console.log('\n=== nejdelsi useky (≥5)');
for (const x of R.filter(x => x.beh >= 5).sort((a, b) => b.beh - a.beh)) console.log(x.model.slice(0, 9).padEnd(10) + x.rameno.padEnd(5) + x.id.padEnd(16) + x.beh + ' „' + x.usek + '"');
console.log('\n=== ozvena pokynu v rameni nova (notice…first / look closer / someone there)');
for (const x of R.filter(x => x.rameno === 'nova' && (x.noticeFirst || x.closer || x.someone))) console.log(x.model.slice(0, 9).padEnd(10) + x.id.padEnd(16) + x.text.split(/(?<=[.?!])\s+/).filter(s => /notic|closer|someone there/i.test(s)).join(' | '));

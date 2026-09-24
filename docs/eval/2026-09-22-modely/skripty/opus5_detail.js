// CODE-read 2026-09-24 — FINALNI varianta (veta „one detail" + uhel [1] zkraceny) na Opus 5 × Opus 5 produkce, 14 EN single.
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js');
const D = path.join(__dirname, 'opis2');
const P = {}; for (const f of fs.readdirSync(D).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(D, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text && x.model === 'claude-opus-5' && x.rep === 1);
const TAG = /no one (thought|thinks|would|ever)|would not think|nobody (thought|notices)|walk(s|ed)? past|unnoticed/i, ECHO = /one detail|the sentence|does not name/i;
const IMP = /(^|[.?!]\s+)(Look|See|Notice|Listen|Watch|Feel|Lean|Step)(?![a-z])/;
const rows = [];
for (const id of Object.keys(P).sort()) {
  const p = P[id], prod = L.find(x => x.id === id && x.rameno === 'prod'), fin = L.find(x => x.id === id && x.rameno === (p.uhel === 1 ? 'detail_u1' : 'detail'));
  if (!prod || !fin) { console.log(id, 'chybi'); continue; }
  const a = zmer(prod.text, 'comes from here: ' + p.obraz + '. Let it become'), b = zmer(fin.text, 'comes from here: ' + p.obraz + '. Let it become');
  rows.push({ id, a, b, pt: prod.text, ft: fin.text });
  console.log(id.padEnd(15) + ' usek ' + a.beh + '→' + b.beh + ' · v1 ' + a.v1 + '→' + b.v1 + ' · slov ' + prod.text.split(/\s+/).length + '→' + fin.text.split(/\s+/).length
    + (TAG.test(fin.text) ? ' · TAG' : '') + (ECHO.test(fin.text) ? ' · OZVENA' : '') + (IMP.test(fin.text) ? ' · rozkaz' : ''));
}
const avg = f => rows.reduce((s, r) => s + f(r), 0) / rows.length;
console.log('\nprumer usek ' + avg(r => r.a.beh).toFixed(2) + '→' + avg(r => r.b.beh).toFixed(2) + ' · v1 ' + avg(r => r.a.v1p).toFixed(2) + '→' + avg(r => r.b.v1p).toFixed(2)
  + ' · v1 mene/stejne/vic ' + rows.filter(r => r.b.v1p < r.a.v1p).length + '/' + rows.filter(r => r.b.v1p === r.a.v1p).length + '/' + rows.filter(r => r.b.v1p > r.a.v1p).length);
fs.writeFileSync(path.join(__dirname, 'opus5_detail.json'), JSON.stringify(rows, null, 1));

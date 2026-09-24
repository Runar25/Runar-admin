// CODE-read 2026-09-24 — (a) varianta uhlu [1] (detail_u1: veta „one detail" + uhel [1] bez „the part someone would walk
// past"), (b) islandsky test prod × detail. Pro IS je presna shoda slov slepa k ohybani (EVAL_LOG 2026-09-22) — tady se
// porovnavaji KMENY: prvnich 5 znaku slova (>=4 znaky), overeno na znamem paru „hjörðina"/„hjörðin".
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js');
const TAG = /no one (thought|thinks|would|ever)|would not think|nobody (thought|notices)|walk(s|ed)? past|overlook|unnoticed|goes unseen/i;
const kmen = w => w.toLowerCase().replace(/[^\p{L}]/gu, '').slice(0, 5);
const slova = s => s.split(/\s+/).map(kmen).filter(k => k.length >= 4);
if (kmen('hjörðina') !== kmen('hjörðin')) throw new Error('kmenovac rozbity');
function v1kmen(text, obraz) { const o = [...new Set(slova(obraz))], p = new Set(slova(text.split(/(?<=[.?!])\s+/)[0])); return { hit: o.filter(k => p.has(k)).length, n: o.length }; }
function behKmen(text, obraz) { const A = slova(obraz), B = slova(text); let best = 0;
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) { let k = 0; while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++; best = Math.max(best, k); } return best; }

console.log('=== (a) uhel [1]: Opus 4.8 · prod × detail × detail_u1');
const L2 = fs.readFileSync(path.join(__dirname, 'opis2', 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);
for (const id of ['03-jera-u1', '04-perth-u1']) {
  const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', id + '.json'), 'utf8'));
  for (const ar of ['prod', 'detail', 'detail_u1']) for (const x of L2.filter(v => v.id === id && v.model === 'claude-opus-4-8' && v.rameno === ar)) {
    const m = zmer(x.text, 'comes from here: ' + P.obraz + '. Let it become');
    console.log(id.padEnd(13) + ar.padEnd(10) + 'r' + x.rep + '  usek ' + m.beh + ' · v1 ' + m.v1 + ' · „neviditelny" tag ' + (TAG.test(x.text) ? 'ANO: ' + x.text.match(new RegExp('[^.?!]*(' + TAG.source + ')[^.?!]*', 'i'))[0].trim() : 'ne'));
  }
}
console.log('\n=== (b) IS: kmenove mereni opisu (usek kmenu · kmeny obrazu v 1. vete)');
const LI = fs.readFileSync(path.join(__dirname, 'opis_is', 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);
for (const id of ['01-algiz-u0', '02-ansuz-u0', '14-nauthiz-u6']) {
  const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis_is', id + '.json'), 'utf8'));
  console.log(id + ' · obraz: ' + P.obraz);
  for (const x of LI.filter(v => v.id === id).sort((a, b) => (a.model + a.rameno).localeCompare(b.model + b.rameno))) {
    const v = v1kmen(x.text, P.obraz);
    console.log('   ' + x.model.padEnd(16) + x.rameno.padEnd(7) + 'usek ' + behKmen(x.text, P.obraz) + ' · v1 ' + v.hit + '/' + v.n + ' · slov ' + x.text.split(/\s+/).length + ' · glosa ' + (/\([^)]+\)/.test(x.text) ? 'ANO' : 'ne'));
  }
}

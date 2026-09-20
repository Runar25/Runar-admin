// CODE-read 2026-09-20 — sesazeni testu „rejstrik ven z tela" proti klici.
// Tri soudci, KAZDY JINAK FORMULOVANY (po zkusenosti z testu (10), kde tri stejne zadani vratila
// tyz vystup a shoda nic neznamenala): S1 = stitky, jen telo · S2 = doslovne instrukce, jen telo
// · S3 = stitky, cele cteni (+ chlad a tvar posledni vety).
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'rejstrik');
const klic = JSON.parse(fs.readFileSync(path.join(DIR, 'klic.json'), 'utf8'));
const S1 = JSON.parse(fs.readFileSync(path.join(DIR, 's1.json'), 'utf8'));
const S2 = JSON.parse(fs.readFileSync(path.join(DIR, 's2.json'), 'utf8'));
const S3 = JSON.parse(fs.readFileSync(path.join(DIR, 's3.json'), 'utf8'));
const LBL = { clarity: 'Clarity', confirm: 'Confirmation', challenge: 'Insight into Challenge', reflect: 'Reflection' };
const CISLO = { 1: 'Clarity', 2: 'Confirmation', 3: 'Insight into Challenge', 4: 'Reflection' };
const m1 = new Map(S1.map(x => [x.id, x.seeking]));
const m2 = new Map(S2.map(x => [x.id, CISLO[x.instruction]]));
const m3 = new Map(S3.map(x => [x.id, x]));

const R = {};
for (const k of klic) {
  const spr = LBL[k.rejstrik];
  const r = R[k.rameno] = R[k.rameno] || { n: 0, s1: 0, s2: 0, s3: 0, chlad: 0, chladCt: 0, most: 0, slov: 0, chyby: [] };
  r.n++; r.slov += k.slov;
  if (m1.get(k.id) === spr) r.s1++;
  if (m2.get(k.id) === spr) r.s2++;
  const t = m3.get(k.id);
  if (t.seeking === spr) r.s3++;
  r.chlad += t.cold; r.chladCt += (t.cold > 0 ? 1 : 0);
  r.most += (t.last_possibility === 'yes' ? 1 : 0);
  if (m1.get(k.id) !== spr) r.chyby.push(k.rejstrik + '/' + k.runa + ' → S1 řekl ' + m1.get(k.id));
}
console.log('rameno | n |  S1 telo | S2 telo | (soucet telo) | S3 cele cteni | chlad vet | cteni s chladem | most=moznost | slov');
for (const id of ['A', 'B']) {
  const r = R[id];
  console.log([id, r.n, String(r.s1 + '/' + r.n).padStart(8), String(r.s2 + '/' + r.n).padStart(7),
    String((r.s1 + r.s2) + '/' + (2 * r.n)).padStart(13), String(r.s3 + '/' + r.n).padStart(13),
    String(r.chlad).padStart(9), String(r.chladCt + '/' + r.n).padStart(15),
    String(r.most + '/' + r.n).padStart(12), (r.slov / r.n).toFixed(1).padStart(4)].join(' | '));
}
console.log('\nsance = 1 ze 4 = 4/16 na rameno (n=8 → 2/8)');
console.log('\nkam to soudce S1 hazel, kdyz netrefil:');
for (const id of ['A', 'B']) { console.log('— ' + id + ' —'); for (const c of R[id].chyby) console.log('   ' + c); }
// shoda soudcu mezi sebou (jestli zase nevratili totez)
let shoda12 = 0;
for (const k of klic) if (m1.get(k.id) === m2.get(k.id)) shoda12++;
console.log('\nshoda S1 vs S2 (jinak formulovane zadani): ' + shoda12 + '/' + klic.length);

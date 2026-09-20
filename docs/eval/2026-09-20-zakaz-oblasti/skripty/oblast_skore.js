// CODE-read 2026-09-20 — sesazeni slepeho souzeni proti klici (test „zakaz oblasti x most").
// ⚠️ Tri soudci vratili ZNAK PO ZNAKU tyz vystup → nejsou to tri nezavisle hlasy, je to jeden
// model spusteny trikrat. Shoda 3/3 tady NENI doklad spolehlivosti (§27) a nepocita se jako n=3.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'oblast');
const klic = JSON.parse(fs.readFileSync(path.join(DIR, 'klic.json'), 'utf8'));
const soud = JSON.parse(fs.readFileSync(path.join(DIR, 'soudce.json'), 'utf8'));
const OBL = { laska: 'Love & Relationships', cesta: 'Purpose & Path', prace: 'Career & Creativity',
  skryte: 'The Unseen', rust: 'Inner Growth', rozcesti: 'Crossroads & Decisions' };
const m = new Map(soud.map(s => [s.id, s]));
const R = {};
for (const k of klic) {
  const s = m.get(k.id);
  if (!s) throw new Error('chybi soud pro ' + k.id);
  const r = R[k.rameno] = R[k.rameno] || { n: 0, chlad: 0, chladCteni: 0, most: 0, vObl: 0, oblOk: 0, slov: 0, ukazky: [] };
  r.n++; r.chlad += s.cold; r.chladCteni += (s.cold > 0 ? 1 : 0);
  r.most += (s.last_possibility === 'yes' ? 1 : 0);
  r.vObl += (s.last_in_area === 'yes' ? 1 : 0);
  r.oblOk += (s.area === OBL[k.oblast] ? 1 : 0);
  r.slov += k.slov;
  if (s.last_in_area === 'yes') r.ukazky.push(k.oblast + ': ' + s.last_quote);
}
console.log('rameno | n | chlad vet | cteni s chladem | most = moznost | posl. veta V OBLASTI | oblast poznana | slov');
for (const id of ['B0', 'K', 'V', 'P']) {
  const r = R[id];
  console.log([id.padEnd(6), r.n, String(r.chlad).padStart(9), String(r.chladCteni + '/' + r.n).padStart(16),
    String(r.most + '/' + r.n).padStart(15), String(r.vObl + '/' + r.n).padStart(21),
    String(r.oblOk + '/' + r.n).padStart(15), (r.slov / r.n).toFixed(1).padStart(5)].join(' | '));
}
console.log('\nPOSLEDNI VETY, ktere soudce uznal jako „v oblasti":');
for (const id of ['B0', 'K', 'V', 'P']) {
  console.log('\n— ' + id + ' —');
  for (const u of R[id].ukazky) console.log('   ' + u);
}

// Vyhodnotí kalibraci soudců proti klíči (A: vada × ok podle ownerových rozhodnutí; B: runa + chiméra) a strojovou kontrolu
// „věta 3 jen přeformuluje větu 2“ na podstrčené dvojici. Soudce smí soudit zkoušku, jen když tady projde.
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, J = (f) => JSON.parse(fs.readFileSync(path.join(H, f), 'utf8'));
const jeTu = (f) => fs.existsSync(path.join(H, f));
// A
const Ak = J('A_klic.json');
for (const s of ['A_soudce1.json', 'A_soudce2.json'].filter(jeTu)) {
  const m = {}; for (const r of J(s)) m[r.id] = r;
  let ok = 0, minul = [], prestrelil = [];
  for (const k of Ak) { const v = m[k.id]; if (!v) throw new Error(s + ': chybí id ' + k.id);
    const vada = /fault/i.test(v.verdict);
    if (vada === (k.spravne === 'vada')) ok++; else (k.spravne === 'vada' ? minul : prestrelil).push(k.veta + '  ← ' + v.why); }
  console.log('\n' + s + ': ' + ok + '/' + Ak.length + ' | minul vadu ' + minul.length + ' | přestřelil ' + prestrelil.length);
  for (const x of minul) console.log('   MINUL: ' + x); for (const x of prestrelil) console.log('   PŘESTŘELIL: ' + x);
}
// B
const Bk = J('B_klic.json');
for (const s of ['B_soudce1.json', 'B_soudce2.json'].filter(jeTu)) {
  const m = {}; for (const r of J(s)) m[r.id] = r;
  let runaOk = 0, pr = 0, chOk = 0, ch = 0, falesne = 0, s2ok = 0; const chyby = [];
  for (const k of Bk) { const v = m[k.id]; if (!v) throw new Error(s + ': chybí id ' + k.id);
    if (k.druh === 'prave') { pr++; if (v.rune === k.runa) runaOk++; else chyby.push('runa: čekal ' + k.runa + ', řekl ' + v.rune + ' — ' + v.why);
      if (v.s2_fits === 'no') { falesne++; chyby.push('falešný poplach u pravého čtení (' + k.runa + '): ' + v.why); } }
    else { ch++; if (v.s2_fits === 'no') chOk++; else chyby.push('nepoznal chiméru ' + k.runa + '+' + k.veta2z + ' — ' + v.why);
      if (v.s2_rune === k.veta2z) s2ok++; } }
  console.log('\n' + s + ': runa u pravých ' + runaOk + '/' + pr + ' | chiméry poznány ' + chOk + '/' + ch + ' (z toho původ věty 2 trefen ' + s2ok + ') | falešné poplachy ' + falesne + '/' + pr);
  for (const x of chyby) console.log('   ' + x);
}
// C: strojová kontrola „nový přínos“ — podíl obsahových slov věty 3, která už jsou ve větě 2
const STOP = new Set('a an the and or but of to in on at for with by from as is are was be been it its this that these those you your may can not no what where when how do does than then so if while though into out up down over under'.split(' '));
const slova = (t) => t.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/(ing|ed|es|s)$/, ''));
const prekryv = (v2, v3) => { const a = new Set(slova(v2)), b = slova(v3); return b.length ? b.filter((w) => a.has(w)).length / b.length : 0; };
module.exports = { prekryv };
if (require.main === module) {
  const v = (t) => t.split(/(?<=[.?!])\s+/);
  const prava = Bk.filter((k) => k.druh === 'prave').map((k) => { const x = v(k.text); return prekryv(x[1], x[2]); });
  const podstrcene = [   // věta 3 = věta 2 jinými slovy (psal CODE-read jako útok na kontrolu)
    ['You can see how new growth sometimes depends on room and shelter, not on being hurried.', 'New growth, you may find, depends on shelter and room and cannot be hurried.'],
    ['What comes from outside can break a plan before anyone has a chance to change it.', 'A plan may break from outside before there is any chance to change it.'],
    ['You find a rhythm by going, though ease alone cannot tell you where the road leads.', 'A rhythm is found by going, yet ease may not tell where the road leads.'],
  ].map((d) => prekryv(d[0], d[1]));
  const f = (a) => a.map((x) => x.toFixed(2)).join(' ');
  console.log('\nKontrola „nový přínos“ (překryv věty 3 s větou 2): pravá čtení ' + f(prava) + ' | podstrčené přeformulování ' + f(podstrcene));
  console.log('   nejvyšší u pravých ' + Math.max(...prava).toFixed(2) + ' · nejnižší u podstrčených ' + Math.min(...podstrcene).toFixed(2) + ' → práh mezi nimi ' + (Math.max(...prava) < Math.min(...podstrcene) ? 'EXISTUJE' : 'NEEXISTUJE (kontrola nerozliší)'));
}

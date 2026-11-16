// Lab 2026-11-14: vyhodnotí kandidáty „napětí“ — dva soudci runy (z 25 mechanismů) + jeden popisný soudce (kdo koná, co se stane).
// Projde = oba soudci dali správnou runu na 1. místo · hraniční = jeden z nich · neprojde = žádný (pravidlo z kroku 45).
// Výstup: výpis + napeti_vysledek.json (vše u obrazu pohromadě, i popis soudce, který runy neviděl).
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, J = (f) => JSON.parse(fs.readFileSync(path.join(H, f), 'utf8'));
const K = J('kandidati.json'), klic = J('klic.json');
const m = (f) => { const o = {}; for (const r of J(f)) o[r.id] = r; return o; };
const A = m('soudce_runa_A.json'), B = m('soudce_runa_B.json'), P = fs.existsSync(path.join(H, 'soudce_popis.json')) ? m('soudce_popis.json') : {};
const runy = new Set(K.map((r) => r.runa));
const out = [], poc = { projde: 0, 'hraniční': 0, neprojde: 0 };
for (const k of klic) {
  const a = A[k.id], b = B[k.id]; if (!a || !b) throw new Error('chybí verdikt u id ' + k.id);
  for (const x of [a, b]) if (!runy.has(x.first)) throw new Error('neznámá runa „' + x.first + '“ u id ' + k.id);
  const ok = (a.first === k.runa) + (b.first === k.runa);
  const stav = ok === 2 ? 'projde' : ok === 1 ? 'hraniční' : 'neprojde'; poc[stav]++;
  out.push({ runa: k.runa, obraz: k.obraz, stav, A: a.first, B: b.first, jistota: [a.sure, b.sure], proc: [a.why, b.why], popis: P[k.id] || null });
}
for (const r of K) {
  const mine = out.filter((o) => o.runa === r.runa);
  console.log('\n## ' + r.runa + ' — ' + mine.filter((o) => o.stav === 'projde').length + '/' + mine.length + ' projde');
  for (const o of mine) {
    console.log((o.stav === 'projde' ? '✅' : o.stav === 'hraniční' ? '◐' : '❌') + ' ' + o.obraz + '  [' + o.A + ' / ' + o.B + ']');
    if (o.stav !== 'projde') console.log('     soudci: ' + o.proc.join(' · '));
    if (o.popis) console.log('     popis bez run: ' + o.popis.actor + ' — ' + o.popis.happens + ' — „' + o.popis.point + '“' + (/^no/i.test(o.popis.plausible) ? ' — NEVĚROHODNÉ: ' + o.popis.plausible : ''));
  }
}
console.log('\nCELKEM: projde ' + poc.projde + ' · hraniční ' + poc['hraniční'] + ' · neprojde ' + poc.neprojde + ' (z ' + out.length + ')');
fs.writeFileSync(path.join(H, 'napeti_vysledek.json'), JSON.stringify(out, null, 1));

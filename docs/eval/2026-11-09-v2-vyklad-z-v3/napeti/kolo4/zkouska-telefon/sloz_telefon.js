// Lab 2026-11-17 (owner: „z jakého důvodu je důležité mít zde the phone místo jen light finds … udělej test na čtení s a bez telefonu“).
// Složí produkční prompt single pro Kenaz (buildery v2, stejně jako ../../zkouska-1114/sloz1114.js) a vylosovaný obraz z banky
// nahradí větou z úlohy. Obě ramena mají stejný seed → stejný úhel, konec i ostatní losy; liší se jen obraz. Nic nevolá.
// Úloha: { id, runa, seed, obraz }
'use strict';
const zaklad = require('../../../zkouska-1114/sloz1114.js');
const RADEK_RE = /IMAGE — the picture in this reading comes from here: (.+?) Let it become your own seeing in the text, down to one detail the sentence does not name\./;
function postav(u) {
  const x = zaklad.postav({ id: u.id, runa: u.runa, seed: u.seed });
  const m = x.p.match(RADEK_RE); if (!m) throw new Error(u.id + ': řádek IMAGE nenalezen');
  const n = x.p.split(m[1]).length - 1; if (n !== 1) throw new Error(u.id + ': obraz z banky je v promptu ' + n + '×');
  x.puvodni = m[1];
  x.p = x.p.replace(m[1], () => u.obraz);
  x.draws = Object.assign({}, x.draws, { image: u.obraz });
  return x;
}
module.exports = { postav };
if (require.main === module) {   // výpis: co se v promptu změnilo a jaké losy ramena sdílejí
  const U = require('./ulohy.json');
  for (const u of U) { const x = postav(u); console.log(u.id, '| seed', u.seed, '| z banky:', x.puvodni, '| úhel:', JSON.stringify(x.draws.angle || null).slice(0, 90)); }
  const a = postav(U[0]), b = postav(U[1]);
  console.log('ramena se stejným seedem se liší jen obrazem:', a.p.replace(U[0].obraz, '') === b.p.replace(U[1].obraz, '') && a.sys === b.sys);
}

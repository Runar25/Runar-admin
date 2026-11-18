// Lab 2026-11-18 (2): jak podat zdroj významu, aby ho model jen nepřeložil (owner k návrhu „jen slovo × dvě strany“: „2. zkus obě varianty“).
// Stejné zadání čtyř pohybů jako sloz_4pohyby.js; mění se JEN řádek se zdrojem významu:
//   slovo  … řádek „THE SIDE OF …“ pryč, zůstane jen slovo významu z losu („focus on: growth“)
//   strany … místo jedné věty dvě strany runy z ownerova popisu (RUNAR_POPISY_RUN.md), model si vybere jednu
// Úloha jako v ulohy.json + { zdroj: 'slovo'|'strany', strany: [a, b] }. Nic nevolá.
'use strict';
const { postav: zaklad } = require('./sloz_4pohyby.js');
const RADEK = /^THE SIDE OF [A-Z]+ THIS PICTURE CARRIES \(your source, not words to repeat\): .+\n/m;
function postav(u) {
  const x = zaklad(u);
  if (!RADEK.test(x.p)) throw new Error(u.id + ': řádek se zdrojem významu nenalezen');
  if (u.zdroj === 'slovo') {
    x.p = x.p.replace(RADEK, '');
    x.p = x.p.replace('the side of ' + u.runa + ' it carries,', 'the side of ' + u.runa + ' named by the focus word,');
  } else if (u.zdroj === 'strany') {
    if (!Array.isArray(u.strany) || u.strany.length !== 2) throw new Error(u.id + ': chybí dvě strany');
    x.p = x.p.replace(RADEK, () => 'TWO SIDES OF ' + u.runa.toUpperCase() + ' (choose the one this picture carries best, and let only that one shape the reading; your source, not words to repeat): 1) ' + u.strany[0] + ' · 2) ' + u.strany[1] + '\n');
    x.p = x.p.replace('the side of ' + u.runa + ' it carries,', 'the side of ' + u.runa + ' you chose,');
  } else throw new Error(u.id + ': neznámý zdroj ' + u.zdroj);
  if (u.zdroj === 'slovo' && /the side of \w+ it carries/.test(x.p)) throw new Error(u.id + ': věta 2 dál odkazuje na smazaný řádek');
  return x;
}
module.exports = { postav };
if (require.main === module) {
  for (const u of require('./ulohy_zdroj.json')) { const x = postav(u); console.log('==== ' + u.id + '\n' + x.p.split('\n').slice(0, 12).join('\n') + '\n'); }
}

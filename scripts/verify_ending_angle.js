// ㉨ ÚHEL [6] × KONEC open[1] SE NESMÍ POTKAT — a vyloučení nesmí přestřelit.
//
// PROČ: handoff CODE-read 2026-09-18 (owner schválil, bod C). Úhel [6] „Open by setting the
// seeker inside the image…" a konec open[1] „End on a plain, steady line — name where the
// seeker stands in the image…" dělají TÝŽ tah (místo člověka v obraze) — na začátku i na
// konci téhož čtení. Znění poolů se nemění, mění se jen LOS (_endingShape dostává tažený úhel).
//
// CO SE TU TVRDÍ (protlačeno 2000 losy na jazyk, ne tvarem kódu — §19):
//  · zakázaný pár vyjde 0×,
//  · s jiným úhlem i bez úhlu open[1] dál padá (vyloučení nepřestřelilo),
//  · heavy pool je nedotčený (vyloučení se týká jen open),
//  · _promptDraws konec pozná i po vyloučení (zápis losu pro měření na produkci).
//
//   node scripts/verify_ending_angle.js
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);

let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

const es = vm.runInContext('_endingShape', S);
const draws = vm.runInContext('_promptDraws', S);
const A = { en: vm.runInContext('READING_ANGLES', S), is: vm.runInContext('READING_ANGLES_IS', S) };
const O = { en: vm.runInContext('ENDING_OPEN', S), is: vm.runInContext('ENDING_OPEN_IS', S) };
const lehka = { n: 'Raidho' }, tezka = { n: 'Hagalaz' };

function kolikrat(lang, angle, target) {
  let c = 0;
  for (let i = 0; i < 2000; i++) if (es(lehka, lang, angle) === target) c++;
  return c;
}

for (const L of ['en', 'is']) {
  rekni(kolikrat(L, A[L][6], O[L][1]) === 0, L + '  úhel[6] nikdy nedostane open[1] (2000 losů)');
  rekni(kolikrat(L, A[L][0], O[L][1]) > 0, L + '  s jiným úhlem open[1] dál padá (vyloučení nepřestřelilo)');
  rekni(kolikrat(L, undefined, O[L][1]) > 0, L + '  bez úhlu (cesty mimo single) beze změny');
  // Heavy pool: vyloučení se ho nesmí dotknout — všech 500 losů musí zůstat v heavy zněních.
  const H = vm.runInContext(L === 'is' ? 'ENDING_HEAVY_IS' : 'ENDING_HEAVY', S);
  let h = 0;
  for (let i = 0; i < 500; i++) if (H.indexOf(es(tezka, L, A[L][6])) !== -1) h++;
  rekni(h === 500, L + '  těžká runa: heavy pool nedotčen (500/500)');
  // Zápis losu: _promptDraws musí konec poznat i z čtení, kde vyloučení běželo.
  const d = draws('X\n' + es(lehka, L, A[L][6]) + '\nY', L);
  rekni(!!d && typeof d.ending === 'string' && d.ending !== 'open1',
        L + '  _promptDraws konec pozná a open1 to není (' + (d && d.ending) + ')');
}

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol vyloučení neprošlo.'); process.exit(1); }
console.log('OK    úhel[6] a open[1] se nepotkají; ostatní losy beze změny (2×2000+500 losů/jazyk).');

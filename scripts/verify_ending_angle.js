// ㉨ KAZDY TVAR KONCE SE LOSUJE A POZNA SE ZPETNE
//
// PROC: od 2026-09-20 je konec MOST K CLOVEKU — tri tvary pro lehke runy (veta · dve
// moznosti · otazka) a jeden pro tezke. Kdyz nekdo pridava nebo meni zneni, musi drzet dvoji:
// (1) kazdy tvar se DA vylosovat (preklep v poolu nebo filtr navic by jeden tise vypnul),
// (2) `_promptDraws` ho pozna zpatky ze slozeneho promptu — na tom stoji mereni na produkci.
//
// Do teze verze tu stala kontrola VYLUKY uhel[6] x open[1] (2026-09-18): open[1] tehdy znelo
// „name where the seeker stands in the image" a delalo tyz tah jako uhel [6]. Zneni se
// zmenilo, duvod zanikl, vyluka je pryc — a s ni i ta cast kontroly. Zbytek se rozsiril.
//
// CO SE TU TVRDI (protlaceno losy pres produkcni funkce, ne tvarem kodu — §19):
//  · kazdy tvar open poolu padne aspon jednou z 2000 losu, v obou recich,
//  · tezka runa losuje VYHRADNE z heavy poolu (500/500),
//  · uhel los neomezuje — zadny tvar pri zadnem uhlu nevypadne (drive vyluka, dnes nic),
//  · `_promptDraws` u kazdeho tvaru vrati spravny index (open0/1/2, heavy0).
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
const H = { en: vm.runInContext('ENDING_HEAVY', S), is: vm.runInContext('ENDING_HEAVY_IS', S) };

for (const L of ['en', 'is']) {
  // (1) kazdy tvar mostu se da vylosovat — bez uhlu i s nim
  const vysledky = [];
  for (let i = 0; i < 2000; i++) vysledky.push(es(lehka, L, undefined));
  O[L].forEach((tvar, i) => rekni(vysledky.indexOf(tvar) !== -1,
    L + '  open[' + i + '] padne bez uhlu (2000 losu)'));

  // (2) uhel los NEOMEZUJE — pri kazdem ze sedmi uhlu musi kazdy tvar porad padat
  let zablokovane = 0;
  for (let a = 0; a < A[L].length; a++) {
    const s2 = [];
    for (let i = 0; i < 1200; i++) s2.push(es(lehka, L, A[L][a]));
    O[L].forEach((tvar, i) => { if (s2.indexOf(tvar) === -1) { zablokovane++; console.log('    uhel[' + a + '] nikdy nedal open[' + i + ']'); } });
  }
  rekni(zablokovane === 0, L + '  zadny uhel nezakazuje zadny tvar konce (7 uhlu x 1200 losu)');

  // (3) tezka runa: vyhradne heavy pool
  let h = 0;
  for (let i = 0; i < 500; i++) if (H[L].indexOf(es(tezka, L, A[L][6])) !== -1) h++;
  rekni(h === 500, L + '  tezka runa losuje jen z heavy poolu (500/500)');

  // (4) zpetne poznani: kazdy tvar musi dat spravny index v _promptDraws
  let spatne = 0;
  O[L].forEach((tvar, i) => {
    const d = draws('X' + String.fromCharCode(10) + tvar + String.fromCharCode(10) + 'Y', L);
    if (!d || d.ending !== 'open' + i) { spatne++; console.log('    open[' + i + '] -> ' + (d && d.ending)); }
  });
  H[L].forEach((tvar, i) => {
    const d = draws('X' + String.fromCharCode(10) + tvar + String.fromCharCode(10) + 'Y', L);
    if (!d || d.ending !== 'heavy' + i) { spatne++; console.log('    heavy[' + i + '] -> ' + (d && d.ending)); }
  });
  rekni(spatne === 0, L + '  _promptDraws pozna vsechny tvary (' + (O[L].length + H[L].length) + ' zneni)');
}

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol tvaru konce neproslo.'); process.exit(1); }
console.log('OK    kazdy tvar konce se losuje pri kazdem uhlu a _promptDraws ho pozna zpetne.');

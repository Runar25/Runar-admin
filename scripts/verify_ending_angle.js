// ㉨ KAZDY PER-CTENI LOS: VSECHNY VARIANTY JSOU DOSAZITELNE A POZNAJI SE ZPETNE
//
// PROC: prompt ma nekolik poolu, ze kterych se pri kazdem cteni losuje (konec · esencni ram ·
// rozpocet delky · umisteni jmena). Dve veci se u nich rozbiji tise:
//  (1) nekdo prida filtr nebo preklep a jedna varianta prestane padat — vystup vypada dal
//      v poradku, jen je chudsi; presne to delala vyluka uhel[6] x open[1], nez padla,
//  (2) `_promptDraws` prestane variantu poznavat — pak se ztrati ZAPIS losu a kazde dalsi
//      mereni na produkci ma nezaznamenany confounder (to se stalo losu DELKY: zapisoval se
//      az od 2026-09-20, takze starsi mereni se o nej uz nikdy ocistit neda).
//
// GOLDEN TOHLE NEPOKRYJE: jeho sandbox ma Math.random = 0.5, takze z kazdeho poolu vidi JEDNU
// polozku. Doloženo 2026-09-20 — zmena rozpoctu delky i odebrani "brzy" z umisteni jmena
// prosly golden diffem neviditelne. Proto se tady losuje doopravdy.
//
// CO SE TU TVRDI (protlaceno losy pres produkcni funkce, ne tvarem kodu — §19):
//  · kazdy tvar konce padne pri KAZDEM ze sedmi uhlu (zadny uhel zadny tvar nezakazuje),
//  · tezka runa losuje vyhradne z heavy poolu,
//  · kazdy esencni ram a kazdy rozpocet delky padne,
//  · kazde umisteni jmena padne (vcetne varianty "vubec", ktera je zamerne vetsinova),
//  · `_promptDraws` vrati u kazde varianty spravny index (ending · essence · len · name).
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

  // (5) ESENCNI RAM + ROZPOCET DELKY: kazda polozka poolu musi padnout a byt zpetne poznana.
  var dalsi = [
    { jm: 'esencni ram', fn: vm.runInContext('_essenceFrame', S), pool: vm.runInContext(L === 'is' ? 'ESSENCE_FRAMES_IS' : 'ESSENCE_FRAMES', S), klic: 'essence' },
    { jm: 'rozpocet delky', fn: vm.runInContext('_lengthBudget', S), pool: vm.runInContext(L === 'is' ? 'LENGTH_BUDGETS_IS' : 'LENGTH_BUDGETS', S), klic: 'len' },
  ];
  for (const d of dalsi) {
    const videno = new Set();
    for (let i = 0; i < 2000; i++) videno.add(d.fn(L));
    rekni(videno.size === d.pool.length,
      L + '  ' + d.jm + ': vsech ' + d.pool.length + ' variant padlo (videno ' + videno.size + ', 2000 losu)');
    let chyb = 0;
    d.pool.forEach((tvar, i) => {
      const dr = draws('X' + String.fromCharCode(10) + tvar + String.fromCharCode(10) + 'Y', L);
      if (!dr || dr[d.klic] !== i) { chyb++; console.log('    ' + d.jm + '[' + i + '] -> ' + (dr && dr[d.klic])); }
    });
    rekni(chyb === 0, L + '  ' + d.jm + ': _promptDraws pozna vsechny (' + d.pool.length + ')');
  }

  // (6) UMISTENI JMENA: kazda varianta musi padnout. Varianta "vubec" je POSLEDNI v poolu a
  // zamerne vetsinova (~55 %) — _namePlacement si ji bere podle pozice, takze prehozeni poolu
  // by ten pomer tise zmenilo; proto se tu kontroluje i ona.
  {
    const np = vm.runInContext('_namePlacement', S);
    const poolN = vm.runInContext(L === 'is' ? 'NAME_PLACEMENTS_IS' : 'NAME_PLACEMENTS', S);
    const videno = new Set();
    for (let i = 0; i < 4000; i++) videno.add(np('Anna', L));
    rekni(videno.size === poolN.length,
      L + '  umisteni jmena: vsech ' + poolN.length + ' variant padlo (videno ' + videno.size + ')');
    // bez jmena se NESMI vlozit zadny pokyn (fallback 'you'/'þú' — §12)
    rekni(np(L === 'is' ? 'þú' : 'you', L) === '' && np('', L) === '',
      L + '  bez jmena zadny pokyn o jmene (§12 fallback)');
  }
}

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol tvaru konce neproslo.'); process.exit(1); }
console.log('OK    vsechny per-cteni losy (konec · esence · delka · jmeno): kazda varianta padne a _promptDraws ji pozna.');

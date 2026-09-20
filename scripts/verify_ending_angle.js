// ㉨ MOST A PER-CTENI LOSY: co rozhoduje o konci, a da se to precist zpetne
//
// PROC: od v4.36 uz konec neni cisty los. TVAR urcuje rejstrik (SEEK_SHAPE), CIL oblast
// (BRIDGE_AREAS -> {L}), a tezkost jen to, ze se sahne do druheho poolu. Tri veci se tu
// rozbiji tise:
//  (1) nekdo prehodi AREAS nebo SEEKS v configu a INDEXOVANE mapy zustanou — cil i tvar
//      pak patri jine oblasti/rejstriku, a v textu to nikdo nepozna,
//  (2) jedna varianta prestane padat (preklep, filtr navic) — vystup je jen chudsi,
//  (3) `_promptDraws` prestane tvar poznavat, protoze {L} se nahrazuje az za behu — pak se
//      ztrati zapis losu a kazde dalsi mereni ma nezaznamenany confounder (presne to se
//      stalo losu DELKY: zapisoval se az od 2026-09-20).
//
// GOLDEN TOHLE NEPOKRYJE: jeho sandbox ma Math.random = 0.5, takze z kazdeho poolu vidi
// JEDNU polozku (doloženo 2026-09-20 — zmenu rozpoctu delky ani jmena neukazal).
//
// CO SE TU TVRDI (protlaceno pres produkcni funkce, ne tvarem kodu — §19):
//  · rejstrik dava DETERMINISTICKY tvar (Clarity veta · Confirmation dve moznosti · Reflection otazka),
//  · „Insight into Challenge" bere tezke zneni i u LEHKE runy; tezka runa vynuti tezke zneni,
//    ale tvar rejstriku NEMENI,
//  · bez rejstriku (i u „General Guidance") padnou vsechny tri tvary,
//  · kazda z osmi oblasti da svuj cil a bez oblasti zustane obecny,
//  · kazdy esencni ram, rozpocet delky i umisteni jmena padne,
//  · `_promptDraws` pozna tvar i s vlozenou frazi oblasti (ending · essence · len · name).
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
const lehka = { n: 'Raidho' }, tezka = { n: 'Isa' };
const H = { en: vm.runInContext('ENDING_HEAVY', S), is: vm.runInContext('ENDING_HEAVY_IS', S) };
const AR = vm.runInContext('AREAS', S);
const SK = vm.runInContext('SEEKS', S);
const tvrdy = (t) => /without comfort|no comfort|nothing softened|umbúðalaust|engin huggun/.test(t);
// tvar podle prvnich slov — stejny rozliseni jako pouziva clovek, ne index do pole
const tvar = (t, L) => {
  const q = L === 'is' ? 'einni spurningu' : 'one question';
  const dve = L === 'is' ? 'nefnir tvennt' : 'two things';
  return t.indexOf(q) !== -1 ? 'otazka' : (t.indexOf(dve) !== -1 ? 'dve' : 'veta');
};

for (const L of ['en', 'is']) {
  const oblast = AR[L][0];
  // (1) rejstrik = deterministicky tvar
  const ocekavane = L === 'is'
    ? [['Skýrleiki', 'veta'], ['Staðfesting', 'dve'], ['Hugleiðing', 'otazka']]
    : [['Clarity', 'veta'], ['Confirmation', 'dve'], ['Reflection', 'otazka']];
  for (const [rejstrik, chtene] of ocekavane) {
    const videno = new Set();
    for (let i = 0; i < 300; i++) videno.add(tvar(es(lehka, L, rejstrik, oblast), L));
    rekni(videno.size === 1 && videno.has(chtene),
      L + '  rejstrik „' + rejstrik + '" dava vzdy tvar ' + chtene + ' (300 losu, videno ' + [...videno].join('/') + ')');
  }

  // (2) tezkost: „Insight into Challenge" i u LEHKE runy · tezka runa vynuti, tvar nemeni
  const vhled = L === 'is' ? 'Innsýn í áskorun' : 'Insight into Challenge';
  rekni(tvrdy(es(lehka, L, vhled, oblast)), L + '  vhled do tezkosti: tezke zneni i u lehke runy');
  rekni(!tvrdy(es(lehka, L, ocekavane[0][0], oblast)), L + '  lehka runa + jiny rejstrik: zneni zustava normalni');
  const potvrzeni = ocekavane[1][0];
  const tt = es(tezka, L, potvrzeni, oblast);
  rekni(tvrdy(tt) && tvar(tt, L) === 'dve', L + '  tezka runa: tezke zneni, ale TVAR rejstriku nemeni');

  // (3) bez rejstriku i u „General Guidance" padnou vsechny tri tvary
  for (const rej of [undefined, SK[L][0]]) {
    const videno = new Set();
    for (let i = 0; i < 2000; i++) videno.add(tvar(es(lehka, L, rej, oblast), L));
    rekni(videno.size === 3, L + '  bez urceni (' + (rej || 'nezadano') + '): vsechny tri tvary padnou (videno ' + videno.size + ')');
  }

  // (4) kazda oblast da SVUJ cil; bez oblasti obecny
  const cile = new Set();
  for (const a of AR[L]) cile.add(es(lehka, L, ocekavane[0][0], a));
  rekni(cile.size === AR[L].length, L + '  ' + AR[L].length + ' oblasti = ' + cile.size + ' ruznych cilu mostu');
  const obecny = L === 'is' ? 'í lífi leitandans' : "in the seeker's life";
  rekni(es(lehka, L, ocekavane[0][0], '').indexOf(obecny) !== -1, L + '  bez oblasti zustava obecny cil');

  // (5) tezka runa sahne VZDY do tezkeho poolu (kazdy jeho tvar je tvrdy)
  rekni(H[L].every(t => tvrdy(t)), L + '  tezky pool: vsechna zneni jsou bez utechy (' + H[L].length + ')');

  // (6) _promptDraws pozna tvar i s vlozenou frazi oblasti
  let spatne = 0;
  for (const rej of [ocekavane[0][0], ocekavane[1][0], ocekavane[2][0], vhled]) {
    for (const a of [AR[L][0], AR[L][4], '']) {
      for (const r of [lehka, tezka]) {
        const t = es(r, L, rej, a);
        const d = draws('X' + String.fromCharCode(10) + t + String.fromCharCode(10) + 'Y', L);
        if (!d || typeof d.ending !== 'string') { spatne++; console.log('    nepoznan: ' + rej + ' / ' + (a || 'bez oblasti') + ' / ' + r.n); }
      }
    }
  }
  rekni(spatne === 0, L + '  _promptDraws pozna tvar i s vlozenou frazi (24 kombinaci)');

  // (7) ESENCNI RAM + ROZPOCET DELKY: kazda polozka poolu padne a je zpetne poznana
  var dalsi = [
    { jm: 'esencni ram', fn: vm.runInContext('_essenceFrame', S), pool: vm.runInContext(L === 'is' ? 'ESSENCE_FRAMES_IS' : 'ESSENCE_FRAMES', S), klic: 'essence' },
    { jm: 'rozpocet delky', fn: vm.runInContext('_lengthBudget', S), pool: vm.runInContext(L === 'is' ? 'LENGTH_BUDGETS_IS' : 'LENGTH_BUDGETS', S), klic: 'len' },
  ];
  for (const d of dalsi) {
    const videno = new Set();
    for (let i = 0; i < 2000; i++) videno.add(d.fn(L));
    rekni(videno.size === d.pool.length,
      L + '  ' + d.jm + ': vsech ' + d.pool.length + ' variant padlo (videno ' + videno.size + ')');
    let chyb = 0;
    d.pool.forEach((t2, i) => {
      const dr = draws('X' + String.fromCharCode(10) + t2 + String.fromCharCode(10) + 'Y', L);
      if (!dr || dr[d.klic] !== i) { chyb++; console.log('    ' + d.jm + '[' + i + '] -> ' + (dr && dr[d.klic])); }
    });
    rekni(chyb === 0, L + '  ' + d.jm + ': _promptDraws pozna vsechny (' + d.pool.length + ')');
  }

  // (8) UMISTENI JMENA: kazda varianta padne; varianta „vubec" je POSLEDNI a zamerne vetsinova
  {
    const np = vm.runInContext('_namePlacement', S);
    const poolN = vm.runInContext(L === 'is' ? 'NAME_PLACEMENTS_IS' : 'NAME_PLACEMENTS', S);
    const videno = new Set();
    for (let i = 0; i < 4000; i++) videno.add(np('Anna', L));
    rekni(videno.size === poolN.length, L + '  umisteni jmena: vsech ' + poolN.length + ' variant padlo');
    rekni(np(L === 'is' ? 'þú' : 'you', L) === '' && np('', L) === '', L + '  bez jmena zadny pokyn o jmene (§12 fallback)');
  }
}

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol mostu/losu neproslo.'); process.exit(1); }
console.log('OK    most: rejstrik dava tvar, oblast cil, tezkost jen pool — a vse se pozna zpetne.');

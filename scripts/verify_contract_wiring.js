// §19 seed-and-assert: the reading contract (life-rune lens · area domain · seeking register
// · priority tie-breaker) must reach the ACTUAL generated prompt for single AND all 4 spreads,
// in both languages. Guards the 2026-07-14 fix, where the contract was wired into single only
// and the v0.6 SEEKING stance rule silently never reached a spread.
//
// Uses REAL input values (an exact SEEKS option; a life rune that is NOT among the drawn runes)
// — the whole point: a fixture with fake data (seeking:'clarity' lowercase) reports a false MISS.
//   node scripts/verify_contract_wiring.js
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const files = ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'];

const M = {}; Object.getOwnPropertyNames(Math).forEach(k => { M[k] = Math[k]; }); M.random = () => 0.5;
const bag = {};
const sandbox = {
  Math: M, JSON, Date, console,
  setTimeout: () => 0, clearTimeout: () => {},
  localStorage: { getItem: k => (k in bag ? bag[k] : null), setItem: (k, v) => { bag[k] = String(v); }, removeItem: k => { delete bag[k]; } },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} }) },
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

let code = 'var lang="en"; var userGender="hk"; var corrections=[]; var currentUser=null; var userName="";\n';
for (const f of files) code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';

code += `
var _OUT = {};
function _R(n){ return RUNES.find(function(r){ return r.n===n; }); }
// REAL values: seeking must be an exact SEEKS entry, life rune must NOT be among the drawn.
var pool = ['Uruz','Thurisaz','Ansuz','Raidho','Kenaz','Gebo','Wunjo','Hagalaz','Isa'].map(_R);
var drawn = _R('Raidho');
['is','en'].forEach(function(L){
  lang = L;
  var u = {
    name: 'Anna',
    area: (AREAS[L] || AREAS.en)[1],
    seeking: (SEEKS[L] || SEEKS.en)[1],   // exact option — 'Clarity' / 'Skýrleiki'
    question: '',
    lifeRune: _R('Fehu')                  // deliberately not in pool
  };
  _OUT['single_'+L]    = buildReadingPrompt(u, drawn, L, []);
  _OUT['norns_'+L]     = buildNornsPrompt(u, pool.slice(0,3), L, []);
  _OUT['kriz_'+L]      = buildKrizPrompt(u, pool.slice(0,5), L, []);
  _OUT['horseshoe_'+L] = buildHorseshoePrompt(u, pool.slice(0,7), L, []);
  _OUT['yggdrasil_'+L] = buildYggdrasilPrompt(u, pool, L, []);
  // life rune AMONG the drawn runes -> the lens must step aside (it cannot be lens and subject)
  var uIn = { name:'Anna', area:u.area, seeking:u.seeking, question:'', lifeRune:_R('Uruz') };
  _OUT['norns_lifein_'+L] = buildNornsPrompt(uIn, pool.slice(0,3), L, []);
  // Ask Rúnar follow-up — until v1.0 it carried persona + scope only, so a leading question
  // pulled it into cold-read/fate while the body held. It must now carry the body's gates.
  _OUT['ask_'+L] = buildAskPrompt('A short reading about Raidho.', 'So the road is already opening for me?', 'Raidho', L, []);
  // Life rune — a PAID reading (3 credits) and the first one in the Tree. It carried none of
  // the gates until 2026-07-19, and it is the reading most exposed to cold reading: its whole
  // subject is what the seeker has carried since birth.
  _OUT['liferune_'+L] = buildLifeRunePrompt('Anna', _R('Gebo'), 12, 5, 1990, L, false, []);
});
`;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'contract.js' });
const O = sandbox._OUT;

const PARTS = {
  // Znění se změnilo 2026-08-12: čočka se smí projevit jen v ZÁVĚRU, ne v těle
  // (měřeno: 3 ze 4 čtení nesla životní runu v těle). Kontrola hlídá tentýž kontrakt,
  // jen na novém znění — proto kotví na LOKALINSA / CLOSING LENS.
  lens:     ['CLOSING LENS — the life rune', 'LOKALINSA — lífsrúnin'],
  // Dve platna zneni od 2026-08-16: `_domainContext` ma osm VLASTNICH vet na oblast
  // ("The reading is for X — ...") a obecnou ZACHYTNOU SIT pro oblast, ktera v AREAS
  // neni ("This reading is about: X — ..."). Obe nesou tyz kontrakt, proto obe kotvy.
  // `times()` niz hlida, ze v jednom promptu je prave JEDNA — ne obe naraz.
  domain:   ['This reading is about:', 'Þessi lestur snýst um:',
             'The reading is for', 'Þessi lestur er fyrir'],
  register: ['This is a leaning, not an order', 'Þetta er tilhneiging, ekki pöntun'],
  priority: ['do not gather into one natural image', 'rennur ekki saman í eina náttúrlega mynd'],
  coldread: ['NO COLD READING', 'ENGIN KÖLD LESNING'],
};
const has = (txt, k) => PARTS[k].some(p => txt.includes(p));
// Kolikrat gate v promptu je. Pritomnost NESTACI: 2026-07-19 sel korekcni blok do
// promptu zivotni runy dvakrat (dispecer + volajici) a tahle kontrola svitila zelene,
// protoze se ptala jen `includes`. Duplikovana instrukce navic prevazi ostatni.
const times = (txt, k) => PARTS[k].reduce(function (n, p) {
  return n + (p ? txt.split(p).length - 1 : 0);
}, 0);
const BUILDERS = ['single', 'norns', 'kriz', 'horseshoe', 'yggdrasil'];
// v4.0 (2026-08-22): single = KOSTRA — oblast/registr/priorita/cocka docasne vypnute
// (owner: "napred budeme ladit samotne cteni"). Kdyby se do single vratily jinou cestou,
// je to presne ta ticha regrese, kterou ma tahle kontrola chytit -> u single FORBIDDEN.
// Spready nesou plny kontrakt dal.
const REQUIRED  = b => b === 'single' ? ['coldread'] : Object.keys(PARTS);
const FORBIDDEN = b => b === 'single' ? ['lens', 'domain', 'register', 'priority'] : [];
let fail = 0;

for (const L of ['en', 'is']) {
  for (const b of BUILDERS) {
    const txt = O[b + '_' + L] || '';
    const missing = REQUIRED(b).filter(k => !has(txt, k));
    if (missing.length) { fail++; console.log('FAIL  ' + b + '_' + L + '  missing: ' + missing.join(', ')); }
    const navic = FORBIDDEN(b).filter(k => has(txt, k));
    if (navic.length) { fail++; console.log('FAIL  ' + b + '_' + L + '  kostra prolomena — ledova brana v promptu: ' + navic.join(', ')); }
    if (!missing.length && !navic.length) console.log('OK    ' + b + '_' + L + (b === 'single' ? '  kostra: coldread + ledove brany NEJSOU' : '  lens+domain+register+priority+coldread'));
    const dup = Object.keys(PARTS).filter(k => times(txt, k) > 1);
    if (dup.length) { fail++; console.log('FAIL  ' + b + '_' + L + '  gate dvakrat v promptu: ' + dup.join(', ')); }
  }
  // the lens must NOT appear when the life rune is itself one of the drawn runes
  const t = O['norns_lifein_' + L] || '';
  if (has(t, 'lens')) { fail++; console.log('FAIL  norns_lifein_' + L + '  lens present though the life rune was drawn'); }
  else console.log('OK    norns_lifein_' + L + '  lens correctly steps aside');
}

// Zneni pravidla `describe` VLASTNI `_describeRule` (a prepisuje ho aktivni hlasovy profil).
// Kontrola si ho proto bere odtud, misto aby drzela vlastni kopii — 2026-08-21 prave takova
// kopie zcervenala na zmenu, ktera byla v poradku. Bere se prvnich 40 znaku, at staci
// i pri jinem zalomeni.
const DESCRIBE_MARK = {
  en: String(sandbox._describeRule('en')).slice(0, 40),
  is: String(sandbox._describeRule('is')).slice(0, 40),
};
if (!DESCRIBE_MARK.en || !DESCRIBE_MARK.is) {
  console.log('FAIL  pravidlo `describe` je prazdne — marker by prosel na cokoli');
  process.exit(1);
}

// ── Life rune: a full reading, so it carries the body's gates ────────────────
for (const L of ['en', 'is']) {
  const txt = O['liferune_' + L] || '';
  const need = {
    describe: [DESCRIBE_MARK[L]],
    coldread: ['NO COLD READING', 'ENGIN KÖLD LESNING'],
  };
  const missing = Object.keys(need).filter(k => !need[k].some(x => txt.includes(x)));
  if (missing.length) { fail++; console.log('FAIL  liferune_' + L + '  missing: ' + missing.join(', ')); }
  else console.log('OK    liferune_' + L + '  describe+coldread');
  // pritomnost nestaci — gate dvakrat prevazi zbytek promptu
  const dupLR = Object.keys(need).filter(function (k) {
    return need[k].reduce(function (n, p) { return n + (txt.split(p).length - 1); }, 0) > 1;
  });
  if (dupLR.length) { fail++; console.log('FAIL  liferune_' + L + '  gate dvakrat v promptu: ' + dupLR.join(', ')); }
}

// ── Ask Rúnar: the follow-up gates (v1.0) ────────────────────────────────────
const ASK = {
  describe:  null,   // per-jazyk: dosazuje se z DESCRIBE_MARK nize
  coldread:  ['NO COLD READING', 'ENGIN KÖLD LESNING'],
  antimirror:['Do not mirror the seeker', 'Speglaðu ekki leitandann'],
};
for (const L of ['en', 'is']) {
  const txt = O['ask_' + L] || '';
  const askL = Object.assign({}, ASK, { describe: [DESCRIBE_MARK[L]] });
  const missing = Object.keys(askL).filter(k => !askL[k].some(x => txt.includes(x)));
  if (missing.length) { fail++; console.log('FAIL  ask_' + L + '  missing: ' + missing.join(', ')); }
  else console.log('OK    ask_' + L + '  describe+coldread+antimirror');
  // the instruction itself must not model the move it forbids
  const echo = L === 'is' ? 'rúnirnar sögðu þegar' : 'the runes already said';
  if (txt.includes(echo)) { fail++; console.log('FAIL  ask_' + L + '  still says "' + echo + '"'); }
}

// ── Volající nesmí přidávat korekce podruhé (§18) ────────────────────────────
// Tvar chyby z 2026-07-19: runar-tree.js predal `corrections` do buildLifeRunePrompt()
// A ZAROVEN si sam pripojil getCorrPrompt(). Dynamicka cast tohle nikdy neuvidi —
// vola buildery primo, ne pres volajici. Proto staticky.
const V2 = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const CALL = /\bbuild\w*Prompt\s*\([^;]*\bcorrections\b[^;]*\)/;
// Deklarace NENI volani. Dispecer `function buildLifeRunePrompt(..., corrections)` ma
// getCorrPrompt primo v tele — to je jeho ulohou (jedno misto, §18). Bez teto vyjimky
// hlasila kontrola chybu pokazde, kdyz se telo dispecera zkratilo pod okno 7 radku.
const DECL = /^\s*(?:async\s+)?function\s+build\w*Prompt\s*\(/;
for (const f of fs.readdirSync(V2).filter(n => n.endsWith('.js'))) {
  const L = fs.readFileSync(V2 + f, 'utf8').split('\n');
  L.forEach(function (line, i) {
    if (!CALL.test(line) || DECL.test(line)) return;
    const win = L.slice(i + 1, i + 8).join('\n');
    if (!/getCorrPrompt\s*\(/.test(win)) return;
    fail++;
    console.log('FAIL  ' + f + ':' + (i + 1) + '  builder uz korekce dostal, volajici je pridava znovu');
    console.log('      ' + line.trim().slice(0, 96));
  });
}

console.log(fail === 0 ? '\nALL OK — contract reaches single + all 4 spreads + the follow-up, both languages.'
                       : '\n' + fail + ' FAIL');
process.exit(fail ? 1 : 0);

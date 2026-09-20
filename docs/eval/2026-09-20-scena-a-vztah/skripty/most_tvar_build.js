// CODE-read 2026-09-20 — dva vstupy k ladění (owner: „most k člověku udělej jako řízený vstup ve tvaru možnosti"
// + „this is Raidho, that is Raidho — stejně může být the wind is Raidho").
// Produkce v4.31, bez čočky, délka [0] (3 věty, 38–45 slov), jméno uprostřed. Tři scény: Raidho (jádro+místo),
// Isa (produkční obraz kafe), Algiz (produkční obraz torfové zdi).
//   MOST:   A = konec ENDING_OPEN[2] (klidná věta)  ·  B = nový tvar konce: most k člověku jako MOŽNOST
//   ESENCE: A = dnešní esenční pravidlo            ·  B = + jméno runy nesmí stát na ZAČÁTKU té věty (bez paměti)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'most_tvar');
fs.mkdirSync(OUT, { recursive: true });
const MOST_KONEC = 'End on one line that offers what this may be for the seeker — a possibility they can weigh against their own life, not something you know about them, and not a step to take.';
const ESENCE_NAVIC = ' The rune\'s name may stand anywhere in that line except at its start.';
const SCENY = [
  ['Raidho', 'cairns, each in sight of the next', 3],
  ['Isa',    'The cup of coffee goes cold',       2],
  ['Algiz',  'The turf wall takes the wind',      5],
];
function box() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
function postav(runa, zacatekObrazu, uhel) {
  const S = box();
  S.__zac = zacatekObrazu;
  vm.runInContext(`
    var __row = null;
    for (var i = 0; i < RUNE_IMAGES.length; i++) if (RUNE_IMAGES[i][0] === ` + JSON.stringify(runa) + ` && RUNE_IMAGES[i][3].indexOf(__zac) === 0) { __row = RUNE_IMAGES[i]; break; }
    if (!__row) throw new Error('obraz nenalezen');
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[` + uhel + `]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[0]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES[6], lifeLensOn: false }, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  return { sys, user, konec: vm.runInContext('ENDING_OPEN[2]', S), esence: user.split('\n').find(l => l.startsWith('THE ESSENCE LINE')) };
}
function uloz(id, sys, user) { fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n'); }
function jedna(t, a, b, co) { if (t.split(a).length !== 2) throw new Error(co + ': výskyt není právě jeden'); return t.replace(a, b); }
for (const [runa, zac, uhel] of SCENY) {
  const { sys, user, konec, esence } = postav(runa, zac, uhel);
  uloz(runa + '-most-A', sys, user);
  uloz(runa + '-most-B', sys, jedna(user, konec, MOST_KONEC, 'most'));
  uloz(runa + '-esence-A', sys, user);
  uloz(runa + '-esence-B', sys, jedna(user, esence, esence + ESENCE_NAVIC, 'esence'));
  console.log(runa + ' · úhel ' + uhel + ' · obraz „' + (user.match(/^IMAGE[^\n]*/m) || [''])[0].slice(53, 130) + '"');
}
console.log('\nmost B konec: ' + MOST_KONEC + '\nesence B navíc:' + ESENCE_NAVIC);

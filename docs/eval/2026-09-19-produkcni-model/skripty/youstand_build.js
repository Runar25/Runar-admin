// CODE-read 2026-09-19 — podezřelý „You stand" na KONCI: ENDING_OPEN[1] „name where the seeker stands in the image".
// Owner: „ano otestuj". Produkce v4.29; úhel 0 (ne 6 — ten dělá „You stand" na začátku), délka [1], jméno [1], bez čočky.
// A = konec beze změny · B = „name where the seeker stands in the image" nahrazeno „from the image" (1 řádek).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'youstand');
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
function sandbox() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
function najdi(runa, zac) {
  const start = src.indexOf("['" + runa + "','");
  let i = start;
  while (i !== -1) {
    const konec = src.indexOf(']', i);
    const radek = src.slice(i, konec + 1);
    if (radek.indexOf("','" + zac) !== -1) {
      const cast = radek.slice(2, -2).split("','");
      return cast;
    }
    i = src.indexOf("['" + runa + "','", i + 1);
  }
  throw new Error('radek: ' + runa + ' ' + zac);
}
const A_TXT = 'End on a plain, steady line — name where the seeker stands in the image, not what is true inside them; not a question.';
const B_TXT = 'End on a plain, steady line from the image — not what is true inside them; not a question.';
for (const [runa, zac, id] of [['Raidho', 'The road winds along', 'raidho'], ['Jera', 'The hay dries', 'jera']]) {
  const c = najdi(runa, zac);
  const S = sandbox();
  S.__row = [runa, 'any', c[2], c[3], c[4], c[5], c[6]];
  vm.runInContext(`RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[0]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[1]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  if (vm.runInContext('ENDING_OPEN[1]', S) !== A_TXT) throw new Error('ENDING_OPEN[1] se zmenil');
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES[6], lifeLensOn: false }, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  const A = '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
  if (A.split(A_TXT).length !== 2) throw new Error('konec neni prave jednou');
  const B = A.replace(A_TXT, B_TXT);
  fs.writeFileSync(path.join(OUT, id + '-A.txt'), A); fs.writeFileSync(path.join(OUT, id + '-B.txt'), B);
  console.log(runa + ': obraz „' + c[3] + '" · aspekt ' + c[5]);
  console.log('   ' + user.split('\n').filter(l => /season|autumn|month|September|IMAGE —/i.test(l)).map(l => l.slice(0, 200)).join('\n   '));
}
console.log('verze ' + vm.runInContext('RUNAR_PROMPT_VERSION', sandbox()));

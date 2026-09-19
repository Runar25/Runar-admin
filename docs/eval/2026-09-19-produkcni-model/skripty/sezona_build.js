// CODE-read 2026-09-19 — ZÚŽENÍ řádku sezóny (owner: „ano zuž a otestuj").
// A = dnešní znění (v4.29): „SEASON — where Rúnar stands: <období>. Let it colour the land and the work in his images where it fits naturally."
// B = jen první věta: „SEASON — where Rúnar stands: <období>."
// Dva obrazy, kde období nemá co dělat: Raidho (cesta u řeky) a Isa (kafe na stole, domácí registr).
// Losy pevné: úhel 0, délka [1], jméno [1], bez čočky; konec Raidho ENDING_OPEN[2], Isa (HEAVY runa) ENDING_HEAVY[0].
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'sezona');
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
function najdi(runa, zac) {
  let i = src.indexOf("['" + runa + "','");
  while (i !== -1) {
    const radek = src.slice(i, src.indexOf(']', i) + 1);
    if (radek.indexOf("','" + zac) !== -1) return radek.slice(2, -2).split("','");
    i = src.indexOf("['" + runa + "','", i + 1);
  }
  throw new Error('radek: ' + runa + ' ' + zac);
}
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
const POKYN = ' Let it colour the land and the work in his images where it fits naturally.';
for (const [runa, zac, id, heavy] of [['Raidho', 'The road winds along', 'raidho', false], ['Isa', 'The cup of coffee', 'isa', true]]) {
  const c = najdi(runa, zac);
  const S = sandbox();
  S.__row = [runa, 'any', c[2], c[3], c[4], c[5], c[6]];
  S.__heavy = heavy;
  vm.runInContext(`RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[0]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return __heavy ? ENDING_HEAVY[0] : ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES[6], lifeLensOn: false }, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  const A = '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
  if (A.split(POKYN).length !== 2) throw new Error('pokyn sezony neni prave jednou');
  const B = A.replace(POKYN, '');
  fs.writeFileSync(path.join(OUT, id + '-A.txt'), A);
  fs.writeFileSync(path.join(OUT, id + '-B.txt'), B);
  console.log(runa + ' · obraz „' + c[3] + '"\n   A: ' + (A.match(/SEASON[^\n]*/) || [''])[0] + '\n   B: ' + (B.match(/SEASON[^\n]*/) || [''])[0]);
}
console.log('verze ' + vm.runInContext('RUNAR_PROMPT_VERSION', sandbox()));

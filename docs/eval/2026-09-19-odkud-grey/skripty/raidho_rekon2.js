// Rekonstrukce ownerova Raidho de1e3b16 (2026-09-19 02:14, v4.27-presuny): losy z prompt_draws
// (angle 3, obraz kafe, kws waiting, name 1, ending heavy1). Delka se neuklada — cteni ma 3 vety / 44 slov -> hledam budget se 3 vetami.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
console.log('verze kodu: ' + vm.runInContext('RUNAR_PROMPT_VERSION', S));
console.log('LENGTH_BUDGETS: ' + JSON.stringify(vm.runInContext('LENGTH_BUDGETS', S)).slice(0, 400));
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
const m = src.match(/\['Raidho','any','([^']*)','(The cairns stand[^']*)','([^']*)','([^']*)','([DEP])'\]/);
S.__row = ['Raidho', 'any', m[1], m[2], m[3], m[4], m[5]];
vm.runInContext(`
  RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
  _randomAngle = function () { return READING_ANGLES[1]; };
  _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
  _endingShape = function () { return ENDING_OPEN[0]; };
  _namePlacement = function (name) { return NAME_PLACEMENTS[3].split('{name}').join(name); };`, S);
const u = { name: "Kuky", lifeLensOn: false, lifeRune: vm.runInContext('RUNES.filter(function(r){return r.n==="Gebo";})[0]', S) };
S.__uu = u;
const user = vm.runInContext('buildReadingPromptSingle(__uu, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
S.__u = user;
console.log('losy z postaveneho promptu: ' + JSON.stringify(vm.runInContext('_promptDraws(__u, "en")', S)));
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
fs.writeFileSync(path.join(__dirname, 'isa', 'RAIDHO-de1e3b16.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
console.log('\n==== USER MESSAGE ====\n' + user);

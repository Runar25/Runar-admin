// Rekonstrukce ownerova Isa df160bfb (2026-09-19 11:04, v4.27-presuny): losy z prompt_draws
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
const m = src.match(/\['Isa','any','([^']*)','(The cup of coffee[^']*)','([^']*)','([^']*)','([DEP])'\]/);
S.__row = ['Isa', 'any', m[1], m[2], m[3], m[4], m[5]];
vm.runInContext(`
  RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
  _randomAngle = function () { return READING_ANGLES[3]; };
  _lengthBudget = function () { return LENGTH_BUDGETS[0]; };
  _endingShape = function () { return ENDING_HEAVY[1]; };
  _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
const u = { name: 'Kuky', lifeRune: vm.runInContext('RUNES.filter(function(r){return r.n==="Gebo";})[0]', S) };
S.__uu = u;
const user = vm.runInContext('buildReadingPromptSingle(__uu, RUNES.filter(function(r){return r.n==="Isa";})[0], "en", [])', S);
S.__u = user;
console.log('losy z postaveneho promptu: ' + JSON.stringify(vm.runInContext('_promptDraws(__u, "en")', S)));
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
fs.writeFileSync(path.join(__dirname, 'isa', 'ISA-df160bfb.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
console.log('\n==== USER MESSAGE ====\n' + user);

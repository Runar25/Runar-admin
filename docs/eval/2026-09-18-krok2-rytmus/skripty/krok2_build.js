// CODE-read 2026-09-18 — Raidho po KROKU 2 (v4.27-presuny), tytez losy jako e2e82087, bez cocky; + ramena rytmu.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'krok2');
function sandbox() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
  const m = src.match(/\['Raidho','any','(Vörðurnar[^']*)','(The cairns stand[^']*)','([^']*)','([^']*)','([DEP])'\]/);
  S.__row = ['Raidho', 'any', m[1], m[2], m[3], m[4], m[5]];
  vm.runInContext(`
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[6]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  return S;
}
const S = sandbox();
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
const user = vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
S.__u = user;
console.log('verze: ' + vm.runInContext('RUNAR_PROMPT_VERSION', S) + ' · losy: ' + JSON.stringify(vm.runInContext('_promptDraws(__u, "en")', S)));
const soubor = '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
fs.writeFileSync(path.join(OUT, 'K2.txt'), soubor);
const stary = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-18-po-uklidu-raidho/CTENI-v426.txt', 'utf8');
const [sa, ua] = stary.split('=== USER MESSAGE ===');
const [sb, ub] = soubor.split('=== USER MESSAGE ===');
for (const [co, a, b] of [['SYSTEM', sa, sb], ['USER', ua, ub]]) {
  const x = a.split('\n'), y = b.split('\n');
  const pryc = x.filter(l => l && y.indexOf(l) === -1), nove = y.filter(l => l && x.indexOf(l) === -1);
  console.log('\n──── ' + co + ': pryc ' + pryc.length + ', nove ' + nove.length);
  pryc.forEach(l => console.log('  - ' + l)); nove.forEach(l => console.log('  + ' + l));
}
console.log('\n==== USER v4.27 ====\n' + user);
console.log('\n==== VOICE focused.en ====\n' + vm.runInContext('VOICE_PROFILES.focused.en', S));

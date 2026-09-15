// Owner 2026-09-15: "podívej se, jak přesně je hotové poslední čtení Raidho" (readings e2e82087…, 2026-09-15 19:25,
// v4.25-klice, claude-opus-4-8). Rekonstrukce promptu z prompt_draws: image = cairns (radek z banky, aspekt the road),
// angle 6, ending open2, name 1 ("Thor" uprostred). Delka se v prompt_draws neuklada — cteni ma 4 vety / 55 slov,
// tedy LENGTH_BUDGETS[1] (ODVOZENO, ne zaznamenano). Overeni: _promptDraws(rekonstrukce) musi dat tytez losy jako DB.
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
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
if (!m) throw new Error('radek cairns nenalezen');
S.__row = ['Raidho', 'any', m[1], m[2], m[3], m[4], m[5]];
vm.runInContext(`
  RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
  _randomAngle = function () { return READING_ANGLES[6]; };
  _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
  _endingShape = function () { return ENDING_OPEN[2]; };
  _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };
`, S);
const user = vm.runInContext('buildReadingPromptSingle({ name: "Thor", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
S.__u = user;
const draws = vm.runInContext('_promptDraws(__u, "en")', S);
const db = { angle: 6, ending: 'open2', image: 'The cairns stand each within sight of the next across the whole heath, each seen from the one before', kws: 'the road', name: 1, v: 1 };
const shoda = ['angle', 'ending', 'image', 'kws', 'name'].map(k => k + ' ' + (JSON.stringify(draws[k]) === JSON.stringify(db[k]) ? '✓' : '✗ (' + JSON.stringify(draws[k]) + ')')).join(' · ');
console.log('shoda s DB prompt_draws: ' + shoda + '\n');
console.log(user);
fs.writeFileSync(__dirname + '/raidho-cairns-prompt.txt', user + '\n');

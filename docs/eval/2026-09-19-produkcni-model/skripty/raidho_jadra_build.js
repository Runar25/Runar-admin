// CODE-read 2026-09-19 — RAIDHO: krátká jádra × místa z pastevecké skupiny (registr P), produkce v4.28, bez čočky.
// Owner: „ano, začni s Raidhem". Ostatní losy (úhel, konec, délka, jméno) jako v produkci — seedovaný los na čtení,
// vypíše se u každého. Jádro nese tu část, co dělá runu runou (poučení Tiwaz 2026-09-19 (2)). Místa bez vody (tah k Laguz).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'raidho_jadra');
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
const CASE = [
  ['track-homefield', 'The sheep-track winds',  'a sheep-track winding of its own accord', 'the edge of the home-field', 20260919101],
  ['track-pass',      'The sheep-track winds',  'a sheep-track winding of its own accord', 'a mountain pass',            20260919102],
  ['cairns-pass',     'The cairns stand',       'cairns, each in sight of the next',       'a mountain pass',            20260919103],
  ['cairns-moor',     'The cairns stand',       'cairns, each in sight of the next',       'a moor below the fells',     20260919104],
  ['road-hillside',   'The road winds along',   'a road vanishing round the next bend',    'a hillside above the farm',  20260919105],
  ['road-valley',     'The road winds along',   'a road vanishing round the next bend',    'a valley floor between farms', 20260919106],
];
function sandbox(seed) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + seed + ' % 2147483648; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  return S;
}
const manifest = [];
for (const [id, zac, jadro, misto, seed] of CASE) {
  const esc = zac.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = src.match(new RegExp("\\['Raidho','(\\w+)','([^']*)','(" + esc + "[^']*)','([^']*)','([^']*)','([DEP])'"));
  if (!m) throw new Error('radek: ' + zac);
  const S = sandbox(seed);
  S.__row = ['Raidho', 'any', m[2], jadro + '. Where: ' + misto, m[4], m[5], m[6]];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0], lifeLensOn: false }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
  if (/CLOSING LENS|must be sensory/.test(user)) throw new Error('cocka nebo sensory v promptu');
  S.__u = user;
  const draws = vm.runInContext('_promptDraws(__u, "en")', S);
  const uhel = (user.match(/READING ANGLE[^:]*: ([^\n]*)/) || [])[1];
  const konec = user.split('\n').find(l => /^End /.test(l)) || '';
  const delka = (user.match(/One flowing reading — ([^.]*)\./) || [])[1];
  const jmeno = user.split('\n').find(l => /^One paragraph/.test(l)).replace(/^One paragraph\. No breaks\. No labels\. /, '').replace(/ Stay within.*$/, '');
  fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  manifest.push({ id, jadro, misto, aspekt: m[5], draws, uhel, konec, delka, jmeno });
  console.log(id.padEnd(16) + ' aspekt ' + m[5] + ' · ' + JSON.stringify(draws) + '\n   úhel: ' + uhel + '\n   konec: ' + konec + '\n   délka: ' + delka + ' · ' + jmeno);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log('\nverze: ' + vm.runInContext('RUNAR_PROMPT_VERSION', sandbox(1)));

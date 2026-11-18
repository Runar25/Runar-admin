// Vypíše produkční prompt v2 pro single (buildery v2) s oblastí, hledáním a záměrem — podklad pro zkoušku čtyř pohybů. Nic nevolá.
//   node vypis_v2.js <Runa> <seed> "<oblast EN>" "<hledání EN>" "<záměr EN>"
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
function postav(u) {
  const L = 'en';
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var __s = ' + u.seed + '; Math.random = function () { __s = (__s * 16807) % 2147483647; return (__s - 1) / 2147483646; };', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var currentUser = null, userTier = "", userGender = "hk", lang = "en";', S);
  const G = (x) => vm.runInContext(x, S);
  const r = G('RUNES').find((x) => x.n === u.runa);
  const vstup = { name: '', area: u.area || '', seeking: u.seeking || '', question: '', intention: u.intention || '' };
  const x = { sys: G('buildSysPrompt')(null, L), p: G('buildReadingPrompt')(vstup, r, L, []) + G('_promptKonec')('SINGLE', [r], L, false) };
  x.draws = (typeof S._promptDraws === 'function' && S._promptDraws(x.p, L)) || {};
  return x;
}
module.exports = { postav };
if (require.main === module) {
  const [runa, seed, area, seeking, intention] = process.argv.slice(2);
  const x = postav({ runa, seed: Number(seed), area, seeking, intention });
  console.log(JSON.stringify(x.draws)); console.log('==== USER PROMPT ====\n' + x.p);
}

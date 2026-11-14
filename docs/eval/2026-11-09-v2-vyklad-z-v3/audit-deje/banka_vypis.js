// Lab 2026-11-14: vypíše celou banku obrazů (RUNE_IMAGES z v2) do jednoho souboru pro čtení člověkem nebo jiným modelem.
// Owner: „dej mi všechny obrazy z banky. dám je na analýzu GPT.“ Soubor je GENEROVANÝ — pravda je v2/runar-character.js.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const IM = vm.runInContext('RUNE_IMAGES', S), RUNES = vm.runInContext('RUNES', S);
const SEZ = { any: 'all year', bright: 'spring to autumn', cold: 'winter' };
const poradi = RUNES.map((r) => r.n); if (poradi.indexOf('Blank') === -1) poradi.push('Blank');
let out = '# Rúnar image bank — all ' + IM.length + ' images (generated ' + process.argv[2] + ')\n\n' +
  'Each image is one sentence the model receives as the source picture for a reading. "Side" is the side of the rune the image is meant to carry.\n' +
  'Images marked (core) are given to the model with a place added by lot.\n';
let c = 0;
for (const n of poradi) {
  const R = RUNES.find((r) => r.n === n), rows = IM.filter((r) => r[0] === n); if (!rows.length) continue;
  out += '\n## ' + n + (R ? ' — keywords: ' + R.k : '') + '\n';
  for (const r of rows) { c++; out += c + '. [' + r[5] + '] ' + r[3] + (r[8] === 'jadro' ? ' (core)' : '') + '  — ' + SEZ[r[1]] + '\n'; }
}
if (c !== IM.length) throw new Error('vypsáno ' + c + ' z ' + IM.length);
fs.writeFileSync(path.join(__dirname, '..', 'banka-obrazu-vypis.md'), out);
console.log(out);

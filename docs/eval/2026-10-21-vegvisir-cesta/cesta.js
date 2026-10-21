// CODE-read 2026-10-21 — Vegvísir: jedna CELÁ cesta (owner: „5. ano, poskládej celou cestu“) — osm ramen, abys viděl, jestli celek působí
// jinak než osm běžných čtení. Pravidla z rozhodnutí: bez středu (2026-09-27 (6)), mezi rameny se nic nepřenáší (2026-09-27 (3)), místo bez
// otázky balíčku (2026-10-21 (5) + EVAL_LOG 2026-10-21 (1)). Runy los ze sáčku bez opakování (všech 25 vč. Blank; životní runa vynechaná
// není — test nemá osobu). Místa = jak by je vybral člověk, který jde (TESTOVACÍ texty CODE-read, ne kánon karet; balíček v závorce).
// Prompt ramene = misto.js varianta A. Čtení píše subagent Opus 5.5, EN.
//   node cesta.js        losuje runy (jednou, uloží losy.json) a zapíše vstup_cesta.txt
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { prompt } = require('../2026-10-21-vegvisir-misto/misto.js');
const MISTA = [
  ['Thresholds', 'A turf house, its door left open to the morning.'],
  ['Thresholds', 'A narrow footbridge over a glacial river, halfway across.'],
  ['Under the Mountain', 'A lava cave where meltwater drips into a dark pool.'],
  ['The Ties', 'A rope stretched between two banks of a river.'],
  ['Under the Mountain', 'A forge inside a cave, the fire banked under ash.'],
  ['Thresholds', 'A mountain pass in fog, a cairn at the top.'],
  ['The Ties', 'A boat pulled up on black sand, two oars laid inside it.'],
  ['Under the Mountain', 'A hot spring steaming in the snow at dusk.'],
];
const LOSY = path.join(__dirname, 'losy.json');
let runy;
if (fs.existsSync(LOSY)) runy = JSON.parse(fs.readFileSync(LOSY, 'utf8'));
else {
  const vm = require('vm'), S = { console }; S.window = S; vm.createContext(S);
  vm.runInContext(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/v2/runar-runes.js', 'utf8') + ';this.__R = RUNES.map(function(r){return r.n;});', S);
  const sacek = S.__R.slice(); runy = [];
  for (let i = 0; i < 8; i++) runy.push(sacek.splice(crypto.randomInt(sacek.length), 1)[0]);
  fs.writeFileSync(LOSY, JSON.stringify(runy));
}
const sys = fs.readFileSync(path.join(__dirname, '..', '2026-10-21-vegvisir-misto', 'vstup_A.txt'), 'utf8').split('=== PROMPT 1 ===')[0];
let out = sys;
MISTA.forEach(([b, m], i) => { out += '=== PROMPT ' + (i + 1) + ' ===\n' + prompt(runy[i], m) + '\n\n'; });
fs.writeFileSync(path.join(__dirname, 'vstup_cesta.txt'), out);
console.log(runy.map((r, i) => (i + 1) + '. ' + r + ' × ' + MISTA[i][1]).join('\n'));

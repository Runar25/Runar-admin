// Owner 2026-09-18: "pojďme napřed najít konflikty a vyřešit je." Vstup pro hledání rozporů v tom, co model dostává.
// Rozsah: produkční Single EN (dvě varianty user message: bez otázky/oblasti jako ownerovo Raidho · s otázkou, oblastí,
// hledáním, záměrem a čočkou) + VŠECHNY losované pooly (úhly, délky, konce, místo jména) + produkční Ask prompt.
// IS cesta do tohoto kola nepatří (EN je, co owner čte); IS má jiné znění (např. esenční pravidlo bez vzoru).
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
vm.runInContext('var __seed = 4242; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
const raidho = 'RUNES.filter(function(r){return r.n==="Raidho";})[0]', gebo = 'RUNES.filter(function(r){return r.n==="Gebo";})[0]';
const A = vm.runInContext('buildReadingPromptSingle({ name: "Thor", lifeRune: ' + gebo + ' }, ' + raidho + ', "en", [])', S);
const B = vm.runInContext('buildReadingPromptSingle({ name: "Thor", lifeRune: ' + gebo + ', question: "Should I take the new job?", area: AREAS.en[2], seeking: SEEKS.en[1], intention: INTENTIONS.en[0] }, ' + raidho + ', "en", [])', S);
const ask = vm.runInContext('buildAskPrompt("«THE READING TEXT»", "«THE SEEKER\'S QUESTION»", "Raidho", "en", [], ' + gebo + ', {}, { mode: "single", runy: ["Raidho"] })', S);
const pool = (jm) => vm.runInContext(jm, S).map((x, i) => '  [' + i + '] ' + x).join('\n');
const out = [
  '# CO DOSTÁVÁ MODEL — produkční Single čtení EN a Ask (postaveno produkčními buildery ' + new Date().toISOString().slice(0, 10) + ')',
  '', '## 1. SYSTEM PROMPT (stejný pro každé čtení i Ask)', '', sys,
  '', '## 2A. USER MESSAGE — Single bez otázky a bez oblasti (jako produkční čtení Raidho)', '', A,
  '', '## 2B. USER MESSAGE — Single s otázkou, oblastí, hledáním a záměrem', '', B,
  '', '## 3. POOLY — v každém čtení se z každého vylosuje JEDNA položka (v 2A/2B je vidět jen ta vylosovaná)', '',
  'ÚHEL (READING_ANGLES):', pool('READING_ANGLES'),
  'DÉLKA (LENGTH_BUDGETS):', pool('LENGTH_BUDGETS'),
  'KONEC u běžných run (ENDING_OPEN):', pool('ENDING_OPEN'),
  'KONEC u těžkých run (ENDING_HEAVY, runy: ' + vm.runInContext('HEAVY_RUNES.names.join(", ")', S) + '):', pool('ENDING_HEAVY'),
  'MÍSTO JMÉNA (NAME_PLACEMENTS; poslední = bez jména, losuje se v 55 %):', pool('NAME_PLACEMENTS'),
  '', '## 4. USER MESSAGE — Ask (doplňující otázka po čtení; «…» = místo pro text čtení a otázku)', '', ask, '',
];
fs.writeFileSync(path.join(__dirname, 'konflikty-vstup.md'), out.join('\n'));
console.log('ok · znaků ' + out.join('\n').length);

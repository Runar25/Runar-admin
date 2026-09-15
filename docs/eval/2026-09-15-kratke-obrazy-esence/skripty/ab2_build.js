// Owner 2026-09-14:
//  (1) "pouzij ASK na tuhle vetu: What passes between leaf and water when neither one moves?" — produkcni
//      buildAskPrompt nad ctenim B (Isa, windless fjord), single, zivotni runa Gebo, nic vyplneneho.
//  (2) "dalsi dve cteni, ale aby obraz nebyl fyzicky; muzes zvolit jinou runu" — Mannaz (aspekt mind),
//      A = produkcni radek (vypovedni obraz o mysli), B = kratky nefyzicky obraz. Stejny seed, lisit se smi jen IMAGE.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-ab2');
fs.mkdirSync(OUT, { recursive: true });
function sandbox(seed) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + seed + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  return S;
}
const zapis = (id, sys, user) => fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');

// (1) ASK
const cteniB = 'A yellow birch leaf rests on the windless fjord, Kuky, and no ring spreads from where it landed. Isa is water held so still that the dark stones below come into view. What passes between leaf and water when neither one moves?';
const otazka = 'What passes between leaf and water when neither one moves?';
const SA = sandbox(1);
const askSys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', SA);
SA.__cteni = cteniB; SA.__q = otazka;
const askUser = vm.runInContext('buildAskPrompt(__cteni, __q, "Isa", "en", [], RUNES.filter(function(r){return r.n==="Gebo";})[0], {}, { mode: "single", runy: ["Isa"] })', SA);
zapis('ASK', askSys, askUser);
console.log('==== ASK USER MESSAGE ====\n' + askUser + '\n');

// (2) Mannaz A/B
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
const m = src.match(/\['Mannaz','any','(Þú manst símanúmer[^']*)','(You remember the number of a house[^']*)','hugur','mind','D'\]/);
if (!m) throw new Error('produkcni radek Mannaz/mind nenalezen');
function mannaz(obrazEN, obrazIS) {
  const S = sandbox(20260915);
  S.__row = ['Mannaz', 'any', obrazIS, obrazEN, 'hugur', 'mind', 'D'];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  return {
    sys: vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S),
    user: vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, RUNES.filter(function(r){return r.n==="Mannaz";})[0], "en", [])', S),
  };
}
const A = mannaz(m[2], m[1]);
const B = mannaz('remembered number, forgotten reason', 'remembered number, forgotten reason');
if (A.sys !== B.sys || A.sys !== askSys) throw new Error('system prompt se lisi');
const la = A.user.split('\n'), lb = B.user.split('\n');
const rozdil = la.map((l, i) => l === lb[i] ? null : { A: l, B: lb[i] }).filter(Boolean);
console.log('MANNAZ radku ' + la.length + '/' + lb.length + ' · lisi se: ' + rozdil.length);
rozdil.forEach(r => console.log('  A: ' + r.A + '\n  B: ' + r.B));
zapis('MA', A.sys, A.user); zapis('MB', B.sys, B.user);
console.log('\n==== MANNAZ USER MESSAGE A ====\n' + A.user);

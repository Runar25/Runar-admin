// Owner 2026-09-14: "postav proti sobe jednu runu podle produkcniho promptu a tu stejnou podle zkusebniho."
// A = produkce: Isa, dlouhy obraz z banky "The calm lies over the fjord and nothing stirs, not even the bird on the rock." (stillness)
// B = zkusebni: tataz runa, tentyz aspekt, kratky obraz ownera "windless fjord".
// Stejny seed pro A i B -> uhel, delka, konec, misto jmena shodne; lisit se smi JEN radek IMAGE (overeno diffem).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-ab');
fs.mkdirSync(OUT, { recursive: true });
const SEED = 20260914;
function postav(obrazEN, obrazIS) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + SEED + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  S.__row = ['Isa', 'any', obrazIS, obrazEN, 'kyrrstaða', 'stillness', 'E'];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  return {
    sys: vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S),
    user: vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, RUNES.filter(function(r){return r.n==="Isa";})[0], "en", [])', S),
  };
}
// A bere presne produkcni radek z kodu (ne opis), at se nemuze rozejit
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
const m = src.match(/\['Isa','any','(Lognið liggur á firðinum[^']*)','(The calm lies over the fjord[^']*)','kyrrstaða','stillness','E'\]/);
if (!m) throw new Error('produkcni radek Isa/fjord nenalezen');
const A = postav(m[2], m[1]);
const B = postav('windless fjord', 'windless fjord');
if (A.sys !== B.sys) throw new Error('system prompt se lisi');
const la = A.user.split('\n'), lb = B.user.split('\n');
const rozdil = la.map((l, i) => l === lb[i] ? null : { i, A: l, B: lb[i] }).filter(Boolean);
console.log('radku A ' + la.length + ' · B ' + lb.length + ' · lisi se: ' + rozdil.length);
rozdil.forEach(r => console.log('  A: ' + r.A + '\n  B: ' + r.B));
fs.writeFileSync(path.join(OUT, 'A.txt'), '=== SYSTEM PROMPT ===\n' + A.sys + '\n\n=== USER MESSAGE ===\n' + A.user + '\n');
fs.writeFileSync(path.join(OUT, 'B.txt'), '=== SYSTEM PROMPT ===\n' + B.sys + '\n\n=== USER MESSAGE ===\n' + B.user + '\n');
console.log('\n==== USER MESSAGE A (cely) ====\n' + A.user);
console.log('\nsystem prompt: ' + A.sys.length + ' znaku, shodny pro A i B');

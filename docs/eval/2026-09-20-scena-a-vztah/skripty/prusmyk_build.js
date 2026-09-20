// CODE-read 2026-09-20 — JEDNA SCÉNA, ČTYŘI RUNY (ownerova otázka: „pokud mám obraz pro všechny runy stejný,
// například klikatící se průsmyk, co má dodat sama runa?"). Scéna = průsmyk; runa dodá jen svůj VZTAH (co v scéně dělá).
// Produkce v4.30, bez čočky; losy pevné a stejné pro všechny runy (úhel 5 = ne „You stand", konec open2, délka [1], jméno uprostřed).
// Řádek sezóny z testu ODSTRANĚN (dnešní znění sype obilí; ownerovo rozhodnutí o novém znění ještě není nasazené).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prusmyk');
fs.mkdirSync(OUT, { recursive: true });
const MISTO = 'a winding mountain pass';
// [runa, aspekt EN (z produkčního řádku runy), VZTAH = co runa ve scéně dělá]
const RUNY = [
  ['Raidho', 'the road',   'the way found one marker at a time'],
  ['Isa',    'stillness',  'one thing holding still while the rest moves on'],
  ['Algiz',  'shelter',    'one side taking the weather so the other stays calm'],
  ['Laguz',  'intuition',  'water finding its own way down'],
];
function box() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
for (const [runa, aspekt, vztah] of RUNY) {
  const S = box();
  S.__row = [runa, 'any', vztah, vztah, aspekt, aspekt, 'P', '', 'jadro'];   // 9. sloupec = jadro -> builder pripoji misto z IMG_PLACES
  S.__misto = MISTO;
  vm.runInContext(`RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    IMG_PLACES.P.splice(0, IMG_PLACES.P.length, [__misto, __misto]);
    _randomAngle = function () { return READING_ANGLES[5]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  let user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES[6], lifeLensOn: false }, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  const sez = user.split('\n').find(l => /^SEASON/.test(l));
  if (!sez) throw new Error('radek sezony nenalezen');
  user = user.split('\n').filter(l => l !== sez).join('\n');
  fs.writeFileSync(path.join(OUT, runa + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  console.log(runa.padEnd(7) + ' aspekt „' + aspekt + '" · vztah „' + vztah + '"');
  console.log('   ' + (user.match(/^IMAGE[^\n]*/m) || [''])[0].slice(0, 170));
}
console.log('\nspolečné: místo „' + MISTO + '" · úhel: ' + vm.runInContext('READING_ANGLES[5]', box()) + ' · konec: ' + vm.runInContext('ENDING_OPEN[2]', box()));

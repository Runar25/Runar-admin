// CODE-read 2026-09-18 — PILOT „jádro obrazu + místo" na ownerově Raidhu (v4.26-uklid, stejné losy jako U1–U3).
// Owner: „použitím heath jsme mu řekli, co má použít; heath je jen jedna z mnoha možností — břeh, black lava field,
// mlha… chci runarovi dát základ obrazu a zbytek otevřít." Jediná změna proti U1–U3 = řádek IMAGE:
//   F  = jádro bez místa + „místo není dané, najdi ho sám"   (predikce z 2026-09-09: volnost -> oblíbenec, místo se opakuje)
//   D* = jádro + místo z losu (ownerovy tři příklady)        (otázka: drží identita runy? břeh = voda = riziko Laguz)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'misto');
fs.mkdirSync(OUT, { recursive: true });
const JADRO = 'The cairns stand each within sight of the next, each seen from the one before';
const RAMENA = {
  F:  JADRO + '. Where they stand is not given — find the place yourself',
  D1: JADRO + '. Where: on the shore',
  D2: JADRO + '. Where: across a black lava field',
  D3: JADRO + '. Where: in fog',
};
function sandbox() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
const m = src.match(/\['Raidho','any','(Vörðurnar[^']*)','(The cairns stand[^']*)','([^']*)','([^']*)','([DEP])'\]/);
if (!m) throw new Error('radek cairns nenalezen');
const zaklad = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-18-po-uklidu-raidho/CTENI-v426.txt', 'utf8');
for (const [k, obraz] of Object.entries(RAMENA)) {
  const S = sandbox();
  S.__row = ['Raidho', 'any', m[1], obraz, m[3], m[4], m[5]];
  vm.runInContext(`
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[6]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
  const soubor = '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
  const a = zaklad.split('\n'), b = soubor.split('\n');
  const jine = b.filter((l, i) => l !== a[i]);
  if (a.length !== b.length || jine.length !== 1 || !/^IMAGE/.test(jine[0])) throw new Error(k + ': proti U1–U3 se lisi vic nez radek IMAGE');
  fs.writeFileSync(path.join(OUT, k + '.txt'), soubor);
  console.log(k + ': lisi se jen radek IMAGE ✓\n   ' + jine[0]);
}
// legenda pro slepeho soudce: vsech 25 run + jejich klice (RUNES.k), jmena bez glos
const S = sandbox();
const leg = vm.runInContext('RUNES.map(function(r){return r.n + " — " + r.k;}).join("\\n")', S);
fs.writeFileSync(path.join(OUT, 'legenda.txt'), leg + '\n');
console.log('\nlegenda: ' + leg.split('\n').length + ' run');

// CODE-read 2026-09-19 — IDENTITA runa × místo na RIZIKOVÝCH runách (owner schválil 24 agentů: RUNAR_BACKLOG „PO RESETU" 1).
// Jádro = produkční obraz runy bez místa (u obrazu, který místem sám je, jiný řádek téže runy). Místa = ownerova tři.
// Prompt = produkce v4.27; losy pevné jako u Raidha: úhel 6, LENGTH_BUDGETS[1], jméno Thor uprostřed, bez čočky.
// Konec: Isa a Tiwaz jsou HEAVY_RUNES -> produkce jim losuje z ENDING_HEAVY, vzat [0]; Laguz a Algiz ENDING_OPEN[2].
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'misto4');
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
// [runa, začátek EN obrazu v RUNE_IMAGES, jádro bez místa, co se škrtlo]
const RUNY = [
  ['Isa',   'The calm lies over the fjord', 'Nothing stirs in the calm, not even the bird on the rock', 'místo „over the fjord" (obraz místem sám je)'],
  ['Laguz', 'Water finds its own way',      'Water finds its own way down, and no one shows it the path', '„the slope"'],
  ['Tiwaz', 'You give back the change',     'You give back the change that was counted wrong in your favour', 'nic — situační obraz místo nemá'],
  ['Algiz', 'The turf wall takes the wind', 'The turf wall takes the wind so the doorway stays calm', 'nic — místo nejmenuje'],
];
const MISTA = { shore: 'on the shore', lava: 'across a black lava field', fog: 'in fog' };
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
function postav(runa, row, obrazEN) {
  const S = sandbox();
  S.__row = row.slice(); S.__row[3] = obrazEN;
  S.__heavy = ['Isa', 'Tiwaz'].indexOf(runa) !== -1;
  vm.runInContext(`
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[6]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return __heavy ? ENDING_HEAVY[0] : ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  if (/CLOSING LENS/.test(user)) throw new Error('cocka');
  return '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
}
const manifest = [];
for (const [runa, zac, jadro, skrt] of RUNY) {
  const esc = zac.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = src.match(new RegExp("\\['" + runa + "','(\\w+)','([^']*)','(" + esc + "[^']*)','([^']*)','([^']*)','([DEP])'"));
  if (!m) throw new Error('radek nenalezen: ' + runa);
  const row = [runa, m[1], m[2], m[3], m[4], m[5], m[6]];
  const prod = postav(runa, row, row[3]);
  for (const [k, misto] of Object.entries(MISTA)) {
    const t = postav(runa, row, jadro + '. Where: ' + misto);
    const a = prod.split('\n'), b = t.split('\n');
    const jine = b.filter((l, i) => l !== a[i]);
    if (a.length !== b.length || jine.length !== 1 || !/^IMAGE/.test(jine[0])) throw new Error(runa + ' ' + k + ': lisi se vic nez radek IMAGE');
    const id = runa + '-' + k;
    fs.writeFileSync(path.join(OUT, id + '.txt'), t);
    manifest.push({ id, runa, file: id + '.txt' });
  }
  const aspekt = (prod.match(/focus on: ([^·\n]*)/) || [])[1];
  const konec = prod.split('\n').find(l => /^End |quiet line|^Let the last|rest/.test(l)) || '';
  console.log(runa.padEnd(6) + ' sezona ' + row[1] + ' · aspekt ' + (aspekt || '').trim() + ' · skrtnuto: ' + skrt);
  console.log('       produkce: ' + row[3]);
  console.log('       jadro:    ' + jadro);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
const S = sandbox();
console.log('\nkonce: HEAVY[0] = ' + vm.runInContext('ENDING_HEAVY[0]', S) + '\n       OPEN[2]  = ' + vm.runInContext('ENDING_OPEN[2]', S));
console.log('\npromptu: ' + manifest.length + ' · kazdy se lisi od produkcniho promptu te runy jen radkem IMAGE ✓');

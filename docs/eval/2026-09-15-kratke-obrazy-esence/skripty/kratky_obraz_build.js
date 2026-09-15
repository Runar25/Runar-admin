// Experiment ownera 2026-09-12: Single cteni, kdyz obraz z banky ma jen 3-4 slova — co Runar doplni?
// Produkcni cesta: buildSysPrompt + buildReadingPromptSingle (EN). JEDINA zmena: RUNE_IMAGES
// zuzeny na jeden radek s kratkym obrazem; aspekt (5./6. sloupec) zustava produkcni pro tu runu.
// Stejny seed pro vsechny pripady -> uhel, delka, zakonceni i misto jmena se losuji stejne.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-kratke');
fs.mkdirSync(OUT, { recursive: true });

const PRIPADY = [
  { id: 'K1', runa: 'Algiz', obraz: 'standing on the top', aspIS: 'vernd', aspEN: 'protection' },
  { id: 'K2', runa: 'Algiz', obraz: 'flying bird over', aspIS: 'vernd', aspEN: 'protection' },
  { id: 'K3', runa: 'Jera', obraz: 'The dough needs its time', aspIS: 'þolinmæði', aspEN: 'patience' },
];

for (const p of PRIPADY) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = 20260912; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  S.__row = [p.runa, 'any', p.obraz, p.obraz, p.aspIS, p.aspEN, 'P'];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext(
    'buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, '
    + 'RUNES.filter(function(r){return r.n===' + JSON.stringify(p.runa) + ';})[0], "en", [])', S);
  if (user.indexOf(p.obraz) === -1) throw new Error(p.id + ': kratky obraz se do promptu nedostal');
  fs.writeFileSync(path.join(OUT, p.id + '.txt'),
    '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  console.log('──── ' + p.id + ' ' + p.runa + ' · „' + p.obraz + '" ────\n' + user + '\n');
}

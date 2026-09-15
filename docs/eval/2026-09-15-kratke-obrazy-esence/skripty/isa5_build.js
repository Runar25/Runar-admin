// Owner 2026-09-13: test novych kratkych obrazu Isy — 5 cteni Isa (jedno na obraz) + tytez
// 5 obrazu u jedne nahodne runy. Produkcni Single EN, zivotni runa Gebo. Jedina zmena: RUNE_IMAGES
// zuzen na jeden radek. Aspekty Isy schvalil owner; nahodna runa dostane produkcni aspekt nahodneho
// sveho radku (aspekt patri k rune). POUCENI z minula: stejny seed dal vsem tentyz uhel a konec
// ("You stand" 9/10) — ted KAZDE cteni vlastni seed, jako v produkci; uhel/konec/delka se vypisou.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-isa5');
fs.mkdirSync(OUT, { recursive: true });
const OBRAZY = [
  { obraz: 'the road snowed shut', isAsp: 'að bíða', enAsp: 'waiting' },
  { obraz: 'mountain lake frozen still', isAsp: 'kyrrstaða', enAsp: 'stillness' },
  { obraz: 'cocoa gone cold', isAsp: 'að bíða', enAsp: 'waiting' },
  { obraz: 'windless fjord', isAsp: 'kyrrstaða', enAsp: 'stillness' },
  { obraz: 'a stopped clock', isAsp: 'kyrrstaða', enAsp: 'stillness' },
];
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
// nahodna runa: vlastni proud, mimo Isa (je v prvni polovine), Algiz (uz testovan) a Gebo (zivotni runa)
let s = 1309202;
const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
const S0 = sandbox(1);
const RUNES = vm.runInContext('RUNES', S0), IMGS = vm.runInContext('RUNE_IMAGES', S0);
const kand = RUNES.map(r => r.n).filter(n => !['Isa', 'Algiz', 'Gebo'].includes(n));
const nahodna = kand[Math.floor(rnd() * kand.length)];
const radkyN = IMGS.filter(r => r[0] === nahodna);
const aspN = radkyN[Math.floor(rnd() * radkyN.length)];

const souhrn = [];
const pripady = [];
OBRAZY.forEach((o, i) => pripady.push({ id: 'I' + (i + 1), runa: 'Isa', obraz: o.obraz, isAsp: o.isAsp, enAsp: o.enAsp }));
OBRAZY.forEach((o, i) => pripady.push({ id: 'N' + (i + 1), runa: nahodna, obraz: o.obraz, isAsp: aspN[4], enAsp: aspN[5] }));
pripady.forEach((p, i) => {
  const S = sandbox(20260913 + i * 7919);
  S.__row = [p.runa, 'any', p.obraz, p.obraz, p.isAsp, p.enAsp, 'P'];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext(
    'buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, '
    + 'RUNES.filter(function(r){return r.n===' + JSON.stringify(p.runa) + ';})[0], "en", [])', S);
  if (user.indexOf(p.obraz) === -1) throw new Error(p.id + ': obraz se do promptu nedostal');
  fs.writeFileSync(path.join(OUT, p.id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  const radek = re => ((user.match(re) || [''])[0]);
  const uhel = radek(/^READING ANGLE[^\n]*/m).replace(/^READING ANGLE \([^)]*\): /, '');
  const radky = user.split('\n');
  const iName = radky.findIndex(l => /^Mention /.test(l));
  const konec = iName >= 0 ? radky[iName + 1] : '';
  souhrn.push({ id: p.id, runa: p.runa, obraz: p.obraz, aspekt: p.enAsp, uhel, delka: radek(/^One flowing reading[^\n]*/m).slice(0, 70), konec, jmeno: radek(/^One paragraph\.[^\n]*/m) });
});
fs.writeFileSync(path.join(OUT, 'souhrn.json'), JSON.stringify(souhrn, null, 1));
souhrn.forEach(x => console.log(x.id + ' ' + x.runa + ' · ' + x.obraz + ' · ' + x.aspekt + '\n   uhel: ' + x.uhel + '\n   delka: ' + x.delka + '\n   konec: ' + x.konec + '\n   ' + x.jmeno.slice(0, 110)));

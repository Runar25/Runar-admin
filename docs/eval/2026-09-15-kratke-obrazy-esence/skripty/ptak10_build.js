// Owner 2026-09-12: "flying bird over" pro 10 nahodnych run — jak si s tim poradi jine runy.
// Tataz cesta jako kratky_obraz_build.js: produkcni Single EN, jedina zmena = RUNE_IMAGES zuzen
// na jeden radek s obrazem "flying bird over". Aspekt = produkcni aspekt nahodneho radku te runy.
// Algiz vyrazen (uz testovan). Stejny seed pro vsechna cteni jako pilot (20260912).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-ptak10');
fs.mkdirSync(OUT, { recursive: true });
const OBRAZ = 'flying bird over';

function sandbox() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}

// vyber run a aspektu — vlastni seedovany proud, oddeleny od losu uvnitr builderu
let seed = 912026;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const S0 = sandbox();
const RUNES = vm.runInContext('RUNES', S0);
const IMGS = vm.runInContext('RUNE_IMAGES', S0);
const kandidati = RUNES.map(r => r.n).filter(n => n !== 'Algiz');
for (let i = kandidati.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kandidati[i], kandidati[j]] = [kandidati[j], kandidati[i]]; }
const vybrane = kandidati.slice(0, 10);

const souhrn = [];
vybrane.forEach((runa, i) => {
  const radky = IMGS.filter(r => r[0] === runa);
  const zdroj = radky[Math.floor(rnd() * radky.length)];
  const S = sandbox();
  vm.runInContext('var __seed = 20260912; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  S.__row = [runa, 'any', OBRAZ, OBRAZ, zdroj[4], zdroj[5], 'P'];
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext(
    'buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, '
    + 'RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  if (user.indexOf(OBRAZ) === -1) throw new Error(runa + ': obraz se do promptu nedostal');
  const id = 'P' + String(i + 1).padStart(2, '0');
  fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  const radek = (re) => ((user.match(re) || [''])[0]);
  souhrn.push({ id, runa, aspekt: zdroj[5], konec: radek(/^End on[^\n]*|^Close[^\n]*|^Let the last[^\n]*/m), delka: radek(/^One flowing reading[^\n]*/m) });
});
fs.writeFileSync(path.join(OUT, 'souhrn.json'), JSON.stringify(souhrn, null, 1));
souhrn.forEach(x => console.log(x.id + ' ' + x.runa.padEnd(9) + ' aspekt: ' + x.aspekt.padEnd(22) + ' | ' + x.delka.slice(0, 60) + ' | ' + x.konec.slice(0, 70)));

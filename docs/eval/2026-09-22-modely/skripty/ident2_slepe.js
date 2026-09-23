// CODE-read 2026-09-23 — slepe soubory pro vetsi identitni beh. LATINSKY CTVEREC: 6 soudcu, kazdy vidi kazdou SADU
// prave jednou a kazdou bunku (rameno × model) prave jednou. Duvod (§27, utok 2): kdyby soudce videl tutez sadu
// vickrat, naucil by se runy z ramene se seznamy (sol je tam opise) a poznal je pak i bez nich — zkreslilo by to
// presne to, co merime. Vyber z 24 run (sance ~4 %). Jmena run v textu maskovana (latinska i islandska).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const DIR = path.join(__dirname, 'ident2');
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S;
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const RUNY = vm.runInContext('RUNES', S).filter(r => r.n !== 'Blank');
const LAT = RUNY.map(r => r.n);
const ISJ = RUNY.map(r => String(r.is_n || '').split(' (')[0]).filter(n => n && !LAT.includes(n));
const MASKA = new RegExp('(^|[^A-Za-zÞþÆæÖöÁáÐðÉéÍíÓóÚúÝý])(' + LAT.concat(ISJ).join('|') + ')(?=$|[^A-Za-zÞþÆæÖöÁáÐðÉéÍíÓóÚúÝý])', 'g');

const Z = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const posl = {}; for (const z of Z) posl[z.model + '|' + z.id] = z;
const BUNKY = [['S', 'gpt-6-sol'], ['S', 'claude-opus-5'], ['J', 'gpt-6-sol'], ['J', 'claude-opus-5'], ['B', 'gpt-6-sol'], ['B', 'claude-opus-5']];
const POZ = ['URÐUR — það sem var ofið', 'VERÐANDI — það sem er að verða til', 'SKULD — hvert þráðurinn stefnir'];
let seed = 20260924;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const klic = {}; let maskovano = 0;
for (let k = 0; k < 6; k++) {
  const cteni = [];
  for (let s = 0; s < 6; s++) {
    const [arm, model] = BUNKY[(s + k) % 6];
    const id = (s + 1) + arm;
    const z = posl[model + '|' + id];
    if (!z) throw new Error('chybi ' + model + ' ' + id);
    const p = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
    const beaty = JSON.parse(z.raw.slice(z.raw.indexOf('['), z.raw.lastIndexOf(']') + 1)).map(b => b.text);
    if (beaty.length !== 3) throw new Error(id + ' ' + model + ': beatu ' + beaty.length);
    cteni.push({ id, arm, model, p, beaty });
  }
  for (let i = cteni.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cteni[i], cteni[j]] = [cteni[j], cteni[i]]; }
  const bloky = cteni.map((c, n) => {
    const kod = 'J' + (k + 1) + 'R' + (n + 1);
    return '### ' + kod + '\n\n' + c.beaty.map((t, i) => {
      const m = t.replace(MASKA, '$1[RÚNA]'); if (m !== t) maskovano++;
      klic[kod + '.' + (i + 1)] = { id: c.id, arm: c.arm, model: c.model, sada: c.p.sada, pravda: c.p.runy[i], obrazova: c.p.obrazova_runa.includes(c.p.runy[i]) };
      return kod + '.' + (i + 1) + ' (' + POZ[i] + ')\n' + m;
    }).join('\n\n');
  });
  fs.writeFileSync(path.join(DIR, 'slepe-soudce' + (k + 1) + '.txt'),
    'MOŽNOSTI pro každou část (vyber vždy jednu): ' + LAT.join(' · ') + '\n\n' + bloky.join('\n\n'));
}
fs.writeFileSync(path.join(DIR, 'klic.json'), JSON.stringify(klic, null, 1));
// kontrola ctverce: kazda bunka a kazda sada prave 6× celkem, kazdy soudce kazdou sadu 1×
const poc = {}; for (const v of Object.values(klic)) poc[v.arm + v.model] = (poc[v.arm + v.model] || 0) + 1;
console.log('polozek ' + Object.keys(klic).length + ' · na bunku ' + JSON.stringify(poc) + ' · maskovano beatu ' + maskovano);

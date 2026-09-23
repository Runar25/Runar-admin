// CODE-read 2026-09-23 — slepy soubor pro pilot identity run. Kazde cteni rozdelene na 3 beaty (z JSON pole modelu,
// pole „rune" zahozeno), latinska jmena run zamaskovana. U kazdeho beatu 5 moznosti: spravna runa + 4 nahodne
// (bez dvou ostatnich run tehoz cteni), pevny seed. Soudce nevi, ktere cteni je z ktereho ramene.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const DIR = path.join(__dirname, 'ident');
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {};
S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const JMENA = vm.runInContext('RUNES.map(function(r){return r.n;})', S).filter(n => n !== 'Blank');

let seed = 20260923;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const zamichej = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const Z = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const POZ = ['URÐUR — það sem var ofið', 'VERÐANDI — það sem er að verða til', 'SKULD — hvert þráðurinn stefnir'];
const PORADI = ['BS', 'AB', 'CS', 'BB', 'AS', 'CB'];          // pevne promichani ramen
const klic = {}, bloky = [];
PORADI.forEach((id, k) => {
  const z = Z.find(x => x.id === id);
  const p = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
  const beaty = JSON.parse(z.raw.slice(z.raw.indexOf('['), z.raw.lastIndexOf(']') + 1)).map(b => b.text);
  if (beaty.length !== 3) throw new Error(id + ': beatu ' + beaty.length);
  const kod = 'R' + (k + 1);
  const radky = ['### ' + kod];
  beaty.forEach((t, i) => {
    const maskovano = JMENA.reduce((s, n) => s.replace(new RegExp('\\b' + n + '\\b', 'g'), '[RÚNA]'), t);
    const pravda = p.runy[i];
    const moznosti = zamichej([pravda].concat(zamichej(JMENA.filter(n => !p.runy.includes(n))).slice(0, 4)));
    klic[kod + '.' + (i + 1)] = { id, arm: p.arm, sada: p.sada, pozice: i + 1, pravda, obrazova: p.obrazova_runa.includes(pravda), moznosti,
      maskovano: maskovano !== t };
    radky.push(kod + '.' + (i + 1) + ' (' + POZ[i] + ')\n' + maskovano + '\nMOŽNOSTI: ' + moznosti.join(' · '));
  });
  bloky.push(radky.join('\n\n'));
});
fs.writeFileSync(path.join(DIR, 'slepe.txt'), bloky.join('\n\n'));
fs.writeFileSync(path.join(DIR, 'klic.json'), JSON.stringify(klic, null, 1));
const mask = Object.values(klic).filter(x => x.maskovano).length;
console.log('ok — 6 cteni × 3 beaty = ' + Object.keys(klic).length + ' polozek; zamaskovano jmeno runy v ' + mask + ' beatech');
console.log('obrazove beaty: ' + Object.entries(klic).filter(([, v]) => v.obrazova).map(([k, v]) => k + '=' + v.pravda + '(' + v.arm + ')').join(', '));

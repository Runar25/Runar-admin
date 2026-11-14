// Lab 2026-11-14: podklad pro audit „odehrává se v obraze to, co runa znamená?“ (GPT analýza, se kterou owner souhlasí:
// „Nejdříve musí být správně zvolený obraz“; ownerova námitka: u Isy padá sníh a mění vše kolem — jak to může být nehybnost?).
// Brána identity (docs/eval/2026-09-26-obrazy) se ptá „která runa“; tohle se ptá „kdo v obraze koná a je to ta stránka runy“.
// Výstup: audit_vstup.json (řádky pro soudce, zamíchané, bez označení návnad) + audit_klic.json (které řádky jsou návnady).
// Návnady = obraz přiřazený k cizí runě a stránce: soudce je MUSÍ odmítnout, jinak je nástroj slepý (§25 B, nulová transformace).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const IM = vm.runInContext('RUNE_IMAGES', S), RUNES = vm.runInContext('RUNES', S);
const K = {}; for (const r of RUNES) K[r.n] = r.k;
K.Blank = K.Blank || 'the unknown, unwritten potential, the void';
const radky = IM.map((r, i) => ({ zdroj: i, runa: r[0], stranka: r[5], obraz: r[3] }));
// 12 návnad: pevný krok, žádná náhoda — obraz i bere stránku a runu z obrazu o 61 dál, pokud je to jiná runa
const navnady = [];
for (let i = 3; navnady.length < 12 && i < IM.length; i += 15) {
  const j = (i + 61) % IM.length;
  if (IM[i][0] !== IM[j][0]) navnady.push({ zdroj: i, runa: IM[j][0], stranka: IM[j][5], obraz: IM[i][3], navnada: true });
}
const vse = radky.concat(navnady);
// zamíchání pevným pořadím (násobení prvočíslem), ať návnady nestojí na konci
const n = vse.length, poradi = []; for (let x = 0; x < n; x++) poradi.push((x * 89 + 17) % n);
if (new Set(poradi).size !== n) throw new Error('pořadí není permutace');
const vstup = [], klic = [];
poradi.forEach((p, id) => { const v = vse[p];
  vstup.push({ id: id + 1, rune: v.runa, rune_keywords: K[v.runa] || '', side: v.stranka, image: v.obraz });
  klic.push({ id: id + 1, zdroj: v.zdroj, navnada: !!v.navnada, pravaRuna: IM[v.zdroj][0] }); });
fs.writeFileSync(path.join(__dirname, 'audit_vstup.json'), JSON.stringify(vstup, null, 1));
fs.writeFileSync(path.join(__dirname, 'audit_klic.json'), JSON.stringify(klic, null, 1));
console.log('řádků', vstup.length, '| návnad', navnady.length);

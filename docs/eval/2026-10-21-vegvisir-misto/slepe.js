// Slepé souzení: 18 čtení zamíchaných (pevné pořadí podle seedu), soudce vidí jen runu, její klíčová slova a místo — NE otázku balíčku
// ani variantu. Klíč do slepe_klic.json. CODE-read 2026-10-21.
'use strict';
const fs = require('fs'), path = require('path');
const { RUNY, MISTA, K } = require('./misto.js');
const cti = (v) => fs.readFileSync(path.join(__dirname, 'cteni_' + v + '.txt'), 'utf8').split(/=== \d+ ===/).map((x) => x.trim()).filter(Boolean);
const polozky = [];
for (const v of ['A', 'B']) {
  const t = cti(v); if (t.length !== 9) throw new Error(v + ': ' + t.length + ' čtení');
  let i = 0;
  for (const r of RUNY) for (const [b, m] of MISTA) polozky.push({ v, runa: r, balicek: b, misto: m, text: t[i++] });
}
let s = 20261021; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let i = polozky.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [polozky[i], polozky[j]] = [polozky[j], polozky[i]]; }
let out = '', klic = [];
polozky.forEach((p, i) => {
  out += '=== ' + (i + 1) + ' ===\nRUNE: ' + p.runa + ' — ' + K(p.runa) + '\nPLACE: ' + p.misto + '\nREADING: ' + p.text + '\n\n';
  klic.push({ c: i + 1, v: p.v, runa: p.runa, balicek: p.balicek });
});
fs.writeFileSync(path.join(__dirname, 'slepe.txt'), out);
fs.writeFileSync(path.join(__dirname, 'slepe_klic.json'), JSON.stringify(klic, null, 1));
console.log(polozky.length, 'položek');

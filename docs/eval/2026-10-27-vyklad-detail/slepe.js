// Slepý soubor pro soudce: texty z vystup.json zamíchané pevným semínkem, bez varianty (klíč zvlášť). Soudce vidí jen to, co uživatel.
'use strict';
const fs = require('fs'), path = require('path');
const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'vystup.json'), 'utf8'));
let s = 20261027; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
const idx = d.out.map((_, i) => i).sort(() => rnd() - 0.5);
const slepe = idx.map((i, k) => 'T' + (k + 1) + ': ' + d.out[i].text.replace(/\s+/g, ' ').trim()).join('\n\n');
const klic = idx.map((i, k) => ({ t: 'T' + (k + 1), v: d.out[i].v, i: d.out[i].i }));
fs.writeFileSync(path.join(__dirname, 'slepe.txt'), slepe);
fs.writeFileSync(path.join(__dirname, 'slepe_klic.json'), JSON.stringify(klic, null, 1));
console.log('slepe.txt: ' + klic.length + ' textů');

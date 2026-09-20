// CODE-read 2026-09-20 — zamichani a klic pro slepe souzeni testu „zakaz oblasti x most".
// Soudce nesmi videt rameno ani oblast. Poradi je pevne (hash id), ne nahodne — beh je opakovatelny.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'oblast');
const raw = JSON.parse(fs.readFileSync(path.join(DIR, 'vysledek.json'), 'utf8'));
const kod = s => { let h = 7; for (const c of s) h = (h * 131 + c.charCodeAt(0)) % 99991; return h; };
const radky = Object.entries(raw).map(([k, v]) => {
  const [rameno, oblast] = k.split('-');
  const slov = v.text.trim().split(/\s+/).length;
  return { id: 'T' + String(kod(k)).padStart(5, '0'), rameno, oblast, slov, text: v.text.trim() };
}).sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(path.join(DIR, 'klic.json'), JSON.stringify(radky.map(r =>
  ({ id: r.id, rameno: r.rameno, oblast: r.oblast, slov: r.slov })), null, 1));
fs.writeFileSync(path.join(DIR, 'slepe.txt'), radky.map(r => r.id + '\n' + r.text).join('\n\n'));

const podle = {};
for (const r of radky) (podle[r.rameno] = podle[r.rameno] || []).push(r.slov);
console.log('slov (prumer/min-max) podle ramene:');
for (const [k, v] of Object.entries(podle).sort())
  console.log('  ' + k.padEnd(3) + (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)
    + '  (' + Math.min(...v) + '–' + Math.max(...v) + ')  n=' + v.length);
console.log('\nslepy soubor: ' + path.join(DIR, 'slepe.txt') + ' (' + radky.length + ' cteni)');

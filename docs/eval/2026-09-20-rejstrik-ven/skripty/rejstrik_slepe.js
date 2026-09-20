// CODE-read 2026-09-20 — slepe podklady pro test „rejstrik ven z tela".
// DVE plochy, protoze tvar POSLEDNI vety rejstrik prozradi sam (otazka = Reflection atd.):
//   plne.txt   = cele cteni            → overi, ze rejstrik je vubec poznat (ceka se vysoko v OBOU ramenech)
//   telo.txt   = cteni BEZ posledni vety → tady a jen tady se muze projevit RADEK v tele (to je ten test)
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'rejstrik');
const raw = JSON.parse(fs.readFileSync(path.join(DIR, 'vysledek.json'), 'utf8'));
const kod = s => { let h = 13; for (const c of s) h = (h * 137 + c.charCodeAt(0)) % 99991; return h; };
// posledni veta = od posledniho ukonceni vety; ".", "?" i "!"
function bezPosledni(t) {
  const m = [...t.matchAll(/[.?!]["']?\s+/g)];
  if (!m.length) return t;
  const cut = m[m.length - 1].index + m[m.length - 1][0].length;
  return t.slice(0, cut).trim();
}
const radky = Object.entries(raw).map(([k, v]) => {
  const [rameno, rejstrik, runa] = k.split('-');
  const text = v.text.trim();
  return { id: 'R' + String(kod(k)).padStart(5, '0'), rameno, rejstrik, runa,
    slov: text.split(/\s+/).length, text, telo: bezPosledni(text) };
}).sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(path.join(DIR, 'klic.json'), JSON.stringify(radky.map(r =>
  ({ id: r.id, rameno: r.rameno, rejstrik: r.rejstrik, runa: r.runa, slov: r.slov })), null, 1));
fs.writeFileSync(path.join(DIR, 'plne.txt'), radky.map(r => r.id + '\n' + r.text).join('\n\n'));
fs.writeFileSync(path.join(DIR, 'telo.txt'), radky.map(r => r.id + '\n' + r.telo).join('\n\n'));

const podle = {};
for (const r of radky) (podle[r.rameno] = podle[r.rameno] || []).push(r.slov);
for (const [k, v] of Object.entries(podle).sort())
  console.log(k + ': ' + (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) + ' slov (n=' + v.length + ')');
console.log('\nkontrola orezu (prvni tri):');
for (const r of radky.slice(0, 3)) console.log('  ' + r.id + ' … ' + r.telo.slice(-60) + '  ||  UTATO: ' + r.text.slice(r.telo.length).trim().slice(0, 70));

// Lab 2026-11-15, kolo 2: věty z návrhu GPT zkrácené na jeden děj (RUNAR_DESIGN „Délka a tvar obrazu“).
// Vstup: ../kandidati.json (runy, mechanismy, počty obrazů), ../gpt_navrh.txt (77 vět GPT), zkracene.json (77 mých zkrácení, stejné pořadí).
// Výstup: kandidati.json (tvar jako v kole 1, aby šly použít napeti_build.js a napeti_vyhodnot.js), kandidati.txt se tvoří tam,
//         vedle-sebe.md (GPT × zkrácené, počty slov).
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, U = path.join(H, '..');
const K = JSON.parse(fs.readFileSync(path.join(U, 'kandidati.json'), 'utf8'));
const G = fs.readFileSync(path.join(U, 'gpt_navrh.txt'), 'utf8').split('\n').map((r) => r.trim()).filter((r) => r && !r.startsWith('#'));
const Z = JSON.parse(fs.readFileSync(path.join(H, 'zkracene.json'), 'utf8'));
if (G.length !== 77 || Z.length !== 77) throw new Error('počty: GPT ' + G.length + ', zkrácené ' + Z.length);
const sl = (s) => s.split(/\s+/).length, med = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length - 1) >> 1]; };
let i = 0, t = '# Kolo 2: věty z návrhu GPT zkrácené na jeden děj (CODE-read, 2026-11-15)\n\nVlevo věta GPT, vpravo zkrácená; v závorce počet slov. „=“ znamená beze změny.\n';
const out = [];
for (const r of K) {
  const obrazy = [];
  t += '\n## ' + r.runa + '\n';
  for (let k = 0; k < r.obrazy.length; k++, i++) {
    obrazy.push(Z[i]);
    t += (i + 1) + '. ' + G[i] + ' (' + sl(G[i]) + ')\n   → ' + (G[i] === Z[i] ? '=' : Z[i] + ' (' + sl(Z[i]) + ')') + '\n';
  }
  out.push({ runa: r.runa, mech: r.mech, napeti: r.napeti, obrazy });
}
fs.writeFileSync(path.join(H, 'kandidati.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(H, 'vedle-sebe.md'), t);
console.log('GPT medián', med(G.map(sl)), 'max', Math.max(...G.map(sl)), '| zkrácené medián', med(Z.map(sl)), 'max', Math.max(...Z.map(sl)), '| beze změny', G.filter((g, j) => g === Z[j]).length);

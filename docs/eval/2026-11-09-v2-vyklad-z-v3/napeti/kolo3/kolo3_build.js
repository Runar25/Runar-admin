// Lab 2026-11-16, kolo 3: věty přepsané do Rúnarova hlasu po hodnocení GPT (../kolo2/zdroj-gpt-2026-11-16-hodnoceni-kolo2.md)
// a po ownerově pokynu „všechny věty by měly být jak od Rúnara“ (nepojmenovávat přímo emoci, zachovat napětí).
// Vstup: ../kandidati.json (runy, mechanismy, počty), ../kolo2/zkracene.json, vety.json (77, stejné pořadí).
// Výstup: kandidati.json (tvar kola 1 pro napeti_build.js / napeti_vyhodnot.js), vedle-sebe.md (kolo 2 × kolo 3).
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, U = path.join(H, '..');
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const K = J(path.join(U, 'kandidati.json')), P = J(path.join(U, 'kolo2', 'zkracene.json')), Z = J(path.join(H, 'vety.json'));
if (P.length !== 77 || Z.length !== 77) throw new Error('počty: kolo2 ' + P.length + ', kolo3 ' + Z.length);
const sl = (s) => s.split(/\s+/).length, med = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length - 1) >> 1]; };
let i = 0, t = '# Kolo 3: věty v Rúnarově hlase (CODE-read, 2026-11-16)\n\nNahoře věta z kola 2, pod ní věta kola 3; v závorce počet slov. „=“ znamená beze změny.\n';
const out = [];
for (const r of K) {
  const obrazy = [];
  t += '\n## ' + r.runa + '\nNapětí: ' + r.napeti + '\n';
  for (let k = 0; k < r.obrazy.length; k++, i++) {
    obrazy.push(Z[i]);
    t += (i + 1) + '. ' + P[i] + ' (' + sl(P[i]) + ')\n   → ' + (P[i] === Z[i] ? '=' : Z[i] + ' (' + sl(Z[i]) + ')') + '\n';
  }
  out.push({ runa: r.runa, mech: r.mech, napeti: r.napeti, obrazy });
}
fs.writeFileSync(path.join(H, 'kandidati.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(H, 'vedle-sebe.md'), t);
console.log('kolo 2 medián', med(P.map(sl)), '| kolo 3 medián', med(Z.map(sl)), 'max', Math.max(...Z.map(sl)), '| beze změny', P.filter((g, j) => g === Z[j]).length);

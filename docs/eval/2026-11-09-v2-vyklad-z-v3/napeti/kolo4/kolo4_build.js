// Lab 2026-11-16, kolo 4: obrazy podle šesti poučení z ownerových hlášení (../rozbor-pochvalenych-cteni.md) — všední i přírodní
// u každé runy, bez dovětku se závěrem. Vstup: ../kandidati.json (runy, mechanismy, napětí), vety.json (podle run).
// Výstup: kandidati.json (tvar kola 1 → napeti_build.js, napeti_vyhodnot.js), obrazy-kolo4.md (čistý seznam),
//         soudce_uhly_vstup.json (úhlová zkouška: věta + šest úhlů otevření z v2/runar-utils.js READING_ANGLES [1]–[6]).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = __dirname, U = path.join(H, '..'), ROOT = path.join(H, '..', '..', '..', '..', '..');
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const K = J(path.join(U, 'kandidati.json')), V = J(path.join(H, 'vety.json'));
const out = []; let n = 0, t = '# Round 4: candidate images, everyday and from nature (lab, 2026-11-16)\n\nFor each rune: the mechanism in one sentence, the tension (in Czech), and the candidate images. Nothing here is in production.\n';
for (const r of K) {
  const o = V[r.runa]; if (!o || !o.length) throw new Error('chybí runa ' + r.runa);
  out.push({ runa: r.runa, mech: r.mech, napeti: r.napeti, obrazy: o });
  t += '\n## ' + r.runa + '\nMechanism: ' + r.mech + '\nNapětí: ' + r.napeti + '\n';
  for (const x of o) { n++; t += n + '. ' + x + '\n'; }
}
for (const k of Object.keys(V)) if (!K.find((r) => r.runa === k)) throw new Error('neznámá runa ' + k);
fs.writeFileSync(path.join(H, 'kandidati.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(H, 'obrazy-kolo4.md'), t);
// úhly otevření z produkce (jediný zdroj = v2/runar-utils.js)
const src = fs.readFileSync(path.join(ROOT, 'v2', 'runar-utils.js'), 'utf8');
const m = src.match(/const READING_ANGLES = \[[\s\S]*?\n\];/); if (!m) throw new Error('READING_ANGLES nenalezeno');
const S = {}; vm.createContext(S); vm.runInContext(m[0].replace('const READING_ANGLES', 'READING_ANGLES'), S);
const A = S.READING_ANGLES; if (A.length !== 7) throw new Error('úhlů ' + A.length);
const sl = (s) => s.split(/\s+/).length, d = [].concat(...out.map((r) => r.obrazy)).map(sl).sort((a, b) => a - b);
console.log('obrazů', n, '| medián slov', d[(d.length - 1) >> 1], '| nejdelší', d[d.length - 1], '| úhlů', A.length);
fs.writeFileSync(path.join(H, 'uhly.json'), JSON.stringify(A, null, 1));

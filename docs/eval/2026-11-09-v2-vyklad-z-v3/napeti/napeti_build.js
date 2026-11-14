// Lab 2026-11-14: z kandidati.json udělá podklady pro zkoušky podle docs/postup-obraz.md oddíl 3.
//  - kandidati.txt           … jeden obraz na řádek pro kontrola_tvaru.py (krok 3.1)
//  - soudce_popis_vstup.json … jen obrazy, zamíchané, bez run (krok 3.4a: kdo koná a co se stane)
//  - soudce_runa_A/B_vstup.json … obrazy + 25 jednovětých mechanismů, každý soudce jiné pořadí (krok 3.4b)
//  - klic.json               … která runa ke kterému id patří (soudci ho nevidí)
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, K = JSON.parse(fs.readFileSync(path.join(H, 'kandidati.json'), 'utf8'));
const vse = []; for (const r of K) for (const o of r.obrazy) vse.push({ runa: r.runa, obraz: o });
const perm = (n, a, b) => { const p = []; for (let i = 0; i < n; i++) p.push((i * a + b) % n); if (new Set(p).size !== n) throw new Error('není permutace ' + a); return p; };
const n = vse.length;
fs.writeFileSync(path.join(H, 'kandidati.txt'), '# kandidáti 2026-11-14, pořadí jako v kandidati.json\n' + vse.map((v) => v.obraz).join('\n') + '\n');
const ids = perm(n, 31, 5);   // id = pořadí, ve kterém obraz uvidí soudci
const klic = ids.map((p, i) => ({ id: i + 1, runa: vse[p].runa, obraz: vse[p].obraz }));
fs.writeFileSync(path.join(H, 'klic.json'), JSON.stringify(klic, null, 1));
fs.writeFileSync(path.join(H, 'soudce_popis_vstup.json'), JSON.stringify(klic.map((k) => ({ id: k.id, image: k.obraz })), null, 1));
for (const [jm, a, b, ra, rb] of [['A', 1, 0, 7, 3], ['B', 43, 11, 11, 6]]) {
  const po = perm(n, a, b).map((i) => ({ id: klic[i].id, image: klic[i].obraz }));
  const runy = perm(K.length, ra, rb).map((i) => ({ rune: K[i].runa, mechanism: K[i].mech }));
  fs.writeFileSync(path.join(H, 'soudce_runa_' + jm + '_vstup.json'), JSON.stringify({ runes: runy, images: po }, null, 1));
}
console.log('obrazů', n, '| run', K.length);

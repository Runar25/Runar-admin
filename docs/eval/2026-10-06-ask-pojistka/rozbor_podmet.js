// CODE-read 2026-10-06 — kdo „neříká“: podmět pojistky „X does not say/tell/show…“ po ramenech (owner: ptá se na „THE RUNE does not say“).
//   node rozbor_podmet.js ask_zdroj.json
'use strict';
const fs = require('fs'), path = require('path');
const V = JSON.parse(fs.readFileSync(path.join(__dirname, process.argv[2] || 'ask_zdroj.json'), 'utf8'));
const SL = '(?:does|do|did)\\s?n[o\'’]?t\\s+(?:say|tell|show|settle|decide|name|promise)\\b';
const reRuna = (x) => new RegExp('\\b(?:the runes?|' + x.runa + ')\\s+' + SL, 'i');
const reJine = new RegExp('\\b(?:the reading|the image|the picture|they|it)\\s+' + SL, 'i');
function fisher(a, b, c, d) {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const p = (a, b, c, d) => Math.exp(lf(a + b) + lf(c + d) + lf(a + c) + lf(b + d) - lf(a) - lf(b) - lf(c) - lf(d) - lf(a + b + c + d));
  const p0 = p(a, b, c, d); let s = 0;
  for (let x = 0; x <= Math.min(a + b, a + c); x++) { const y = a + b - x, z = a + c - x, w = d - (a - x); if (y < 0 || z < 0 || w < 0) continue; const q = p(x, y, z, w); if (q <= p0 + 1e-12) s += q; }
  return Math.min(1, s);
}
const r = {};
for (const v of [...new Set(V.map((x) => x.v))]) {
  const xs = V.filter((x) => x.v === v);
  const runa = xs.filter((x) => reRuna(x).test(x.text));
  r[v] = [runa.length, xs.length];
  const pul = [0, 1].map((k) => xs.filter((x, i) => i % 2 === k && reRuna(x).test(x.text)).length);
  console.log(v, '| podmět RUNA ' + runa.length + '/' + xs.length, '(půlky ' + pul.join(' / ') + ')',
    '| podmět čtení/obraz/oni/it ' + xs.filter((x) => reJine.test(x.text)).length + '/' + xs.length,
    '| po tipech (runa) area/expl ' + ['area', 'expl'].map((h) => xs.filter((x) => x.h === h && reRuna(x).test(x.text)).length).join('/'));
  runa.slice(0, 4).forEach((x) => console.log('    [' + x.runa + ' ' + x.h + '] ' + x.text.split(/(?<=[.?!])\s+/).filter((s) => reRuna(x).test(s)).join(' ')));
}
if (r.P0 && r.X) console.log('Fisher P0 × X (runa): p = ' + fisher(r.P0[0], r.P0[1] - r.P0[0], r.X[0], r.X[1] - r.X[0]).toFixed(3));
if (r.P0 && r.Y) console.log('Fisher P0 × Y (runa): p = ' + fisher(r.P0[0], r.P0[1] - r.P0[0], r.Y[0], r.Y[1] - r.Y[0]).toFixed(3));

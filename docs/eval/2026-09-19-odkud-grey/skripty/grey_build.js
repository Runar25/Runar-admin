// CODE-read 2026-09-19 — ODKUD "grey": jedna zmena na rameno proti K2 (v4.27, Raidho, losy e2e82087), kontrola = K2+R+C (grey 8/9).
//   S = z bloku THE IMAGE odebrana veta "The image must be sensory: something the reader can feel, not interpret."
//       (obracena paka: je-li to ona, sediva MUSI ubyt)
//   W = do bloku THE IMAGE vracena veta o pocasi, kterou KROK 2 odlozil (druha zmena KROKU 2)
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'krok2');
const K2 = fs.readFileSync(path.join(OUT, 'K2.txt'), 'utf8');
const SENS = ' The image must be sensory: something the reader can feel, not interpret.';
const KOTVA = 'atmosphere on its own is decoration, not a reading.';
const POCASI = ' The image never carries weather that is not real right now: no frozen ground, no snow in June.';
function jednou(t, a, b, co) { if (t.split(a).length !== 2) throw new Error(co + ': vyskyt neni prave jeden'); return t.replace(a, b); }
const arms = { S: jednou(K2, SENS, '', 'S'), W: jednou(K2, KOTVA, KOTVA + POCASI, 'W') };
for (const [k, t] of Object.entries(arms)) {
  const a = K2.split('\n'), b = t.split('\n');
  const jine = b.filter((l, i) => l !== a[i]);
  if (a.length !== b.length || jine.length !== 1) throw new Error(k + ': lisi se vic nez 1 radek');
  fs.writeFileSync(path.join(OUT, k + '.txt'), t);
  console.log(k + ' ✓ 1 radek (zprava ke cteni): ' + jine[0].slice(0, 120) + ' … ' + jine[0].slice(-110));
}

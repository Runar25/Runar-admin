// Owner 2026-09-16: "spusť ten test" — Raidho (losy produkčního čtení e2e82087, BEZ čočky, dlouhý obraz mohyl)
// 3× BEZ vzorové dvojice "Fehu is that warmth passed from hand to hand", not "Fehu is wealth" v esenčním pravidle.
// Srovnání = T1-L z 2026-09-15 (tentýž prompt se vzorem): pass/hand on ve 3/3.
// Predikce: je-li vzor příčinou, pass/hand on spadne ke 0/3. Druhý vzor ("exchange between the sea and the shore")
// zůstává — mění se jedna věc. Pisatel dostane navíc "nevíš datum ani roční období" (artefakt z 09-14/16) — to se
// týká jen sezónních slov, ne pass/hand.
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'prompty-t16');
fs.mkdirSync(OUT, { recursive: true });
const L = fs.readFileSync(path.join(__dirname, 'prompty-t15', 'T1-L.txt'), 'utf8');
const STARE = ' — "Fehu is that warmth passed from hand to hand", not "Fehu is wealth".';
if (L.split(STARE).length !== 2) throw new Error('vzor nenalezen právě jednou');
const B = L.replace(STARE, '.');
fs.writeFileSync(path.join(OUT, 'T16-bezvzoru.txt'), B);
const a = L.split('\n'), b = B.split('\n');
const r = a.map((x, i) => x === b[i] ? null : i).filter(x => x !== null);
console.log('lisi se radku: ' + r.length);
r.forEach(i => console.log('  PŘED: ' + a[i] + '\n  PO:   ' + b[i]));

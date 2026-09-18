// CODE-read 2026-09-18 — RYTMUS na Raidhu po KROKU 2 (v4.27). Owner: "volne nema rytmus". Zmereno: dokonale cteni
// 17-20-12-6 slov, 12 testovacich zadnou vetu pod 10. Jedna zmena na rameno proti K2 (kontrola = K2.txt beze zmeny):
//   R = do radku delky ve zprave ke cteni pridana veta o ruzne delce vet (tam model posloucha)
//   C = hlasove pravidlo v systemu bez "sometimes two joined by a comma" (13/13 uvodnich vet ma prave jednu carku)
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'krok2');
const K2 = fs.readFileSync(path.join(OUT, 'K2.txt'), 'utf8');
const DELKA = 'One flowing reading — 4 short sentences, 50 to 58 words total.';
const R_NOVE = DELKA + ' Let the sentences differ in length — one of them very short.';
const HLAS = 'Sentences run one clause, sometimes two joined by a comma — never a long unfolding line, never a clipped fragment.';
const C_NOVE = 'Sentences run one clause — never a long unfolding line, never a clipped fragment.';
function jednou(t, a, b, co) { if (t.split(a).length !== 2) throw new Error(co + ': vyskyt neni prave jeden'); return t.replace(a, b); }
const R = jednou(K2, DELKA, R_NOVE, 'R');
const C = jednou(K2, HLAS, C_NOVE, 'C');
for (const [k, t] of [['R', R], ['C', C]]) {
  const a = K2.split('\n'), b = t.split('\n');
  const jine = b.filter((l, i) => l !== a[i]);
  if (a.length !== b.length || jine.length !== 1) throw new Error(k + ': lisi se vic nez 1 radek');
  fs.writeFileSync(path.join(OUT, k + '.txt'), t);
  console.log(k + ' ✓ 1 radek: ' + jine[0].slice(0, 160));
}

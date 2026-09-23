// CODE-read 2026-09-23 — vyhodnoceni pilotu identity. Uspesnost podle ramene (S = se seznamy, B = bez) a zvlast
// pro runu, ktere patri OBRAZ (poznatelna z obrazu v obou ramenech), a pro dve OSTATNI runy (tam je riziko).
// Sance = 1 z 5 = 20 %.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'ident');
const K = JSON.parse(fs.readFileSync(path.join(DIR, 'klic.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(path.join(DIR, 'soudy.json'), 'utf8'));
const tab = {};
R.soudci.forEach((s, j) => {
  if (!s) { console.log('soudce ' + j + ' prazdny'); return; }
  for (const it of s.items) {
    const k = K[it.id]; if (!k) { console.log('neznama polozka ' + it.id); continue; }
    if (!k.moznosti.includes(it.choice)) console.log('  ⚠️ ' + it.id + ': volba „' + it.choice + '" neni v nabidce');
    const skup = k.arm + (k.obrazova ? '-obraz' : '-ostatni');
    const t = tab[skup] = tab[skup] || { ok: 0, n: 0, chyby: [] };
    t.n++; if (it.choice === k.pravda) t.ok++; else t.chyby.push(it.id + ' ' + k.pravda + '→' + it.choice + ' (' + it.confidence + ')');
  }
});
console.log('USPESNOST (oba soudci dohromady; sance 20 %)');
for (const sk of ['S-obraz', 'B-obraz', 'S-ostatni', 'B-ostatni']) {
  const t = tab[sk] || { ok: 0, n: 0, chyby: [] };
  console.log('  ' + sk.padEnd(10) + t.ok + '/' + t.n + '  (' + Math.round(100 * t.ok / (t.n || 1)) + ' %)' + (t.chyby.length ? '   minul: ' + t.chyby.join(' · ') : ''));
}
// shoda soudcu mezi sebou
const a = R.soudci[0] && Object.fromEntries(R.soudci[0].items.map(x => [x.id, x.choice]));
const b = R.soudci[1] && Object.fromEntries(R.soudci[1].items.map(x => [x.id, x.choice]));
if (a && b) console.log('\nshoda soudcu: ' + Object.keys(a).filter(k => a[k] === b[k]).length + '/' + Object.keys(a).length);

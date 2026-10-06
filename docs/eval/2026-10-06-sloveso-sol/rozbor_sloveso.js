// CODE-read 2026-10-06 — rozbor test_sol.jsonl: jakým slovesem sol uvádí runu v esenční větě, kolikrát padne holé slovo aspektu,
// kolikrát opíše frázi aspektu (rameno D), délka a cena. Útok §27: k=0 × k=1 (půlka proti půlce).
'use strict';
const fs = require('fs'), path = require('path');
const SOUBOR = process.argv[2] || 'test_sloveso.jsonl';   // 2026-10-06: i kolo 2 (F)
const L = fs.readFileSync(path.join(__dirname, SOUBOR), 'utf8').trim().split('\n').map(JSON.parse);
const vety = (s) => s.replace(/([.?!])\s+(?=[A-Z"“])/g, '$1\n').split('\n').map((x) => x.trim()).filter(Boolean);
function rozbor(x) {
  const v = vety(x.telo);
  const m = x.telo.match(new RegExp('\\b' + x.runa + '\\s+(\\w+)(?:\\s+(of|as))?', 'i'));
  const slov = (x.telo.match(/[A-Za-z’'-]+/g) || []).length;
  const fr = x.fraze.toLowerCase().split(' ');
  let opis = 0;   // nejdelší souvislý úsek fráze aspektu v textu (slova)
  const t = x.telo.toLowerCase();
  for (let i = 0; i < fr.length; i++) for (let j = fr.length; j > i; j--) { if (j - i > opis && t.includes(fr.slice(i, j).join(' '))) opis = j - i; }
  return { sloveso: m ? (m[1] + (m[2] ? ' ' + m[2] : '')).toLowerCase() : '—', slovo: new RegExp('\\b' + x.aspekt + '\\b', 'i').test(x.telo),
    opis, slov, vet: v.length, usd: (x.usage.prompt_tokens * 2 + x.usage.completion_tokens * 10) / 1e6 };
}
const R = L.map((x) => Object.assign({}, x, rozbor(x)));
const pct = (a, n) => a + '/' + n;
const ramena = [...new Set(R.map((x) => x.rameno))];
console.log('rameno | sloveso po jménu runy | holé slovo aspektu v textu | opis fráze ≥4 slova | slov (průměr)');
for (const r of ramena) {
  const xs = R.filter((x) => x.rameno === r); const sl = {};
  xs.forEach((x) => sl[x.sloveso] = (sl[x.sloveso] || 0) + 1);
  console.log(r.padEnd(3), '|', Object.entries(sl).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n).join(', ').padEnd(40), '|',
    pct(xs.filter((x) => x.slovo).length, xs.length).padEnd(5), '|', pct(xs.filter((x) => x.opis >= 4).length, xs.length).padEnd(5), '|',
    (xs.reduce((a, x) => a + x.slov, 0) / xs.length).toFixed(1));
}
console.log('\nPůlka proti půlce — „names" podle k:');
for (const k of [0, 1, 2]) { const xs = R.filter((x) => x.k === k); console.log(' k=' + k, pct(xs.filter((x) => x.sloveso === 'names').length, xs.length)); }
console.log('\nPo runách — „names" (A0 A1 B0 C1 D0 D1 E0 E1):');
for (const runa of [...new Set(R.map((x) => x.runa))]) console.log(' ' + runa.padEnd(8), ramena.map((r) => R.filter((x) => x.runa === runa && x.rameno === r && x.sloveso === 'names').length).join(' '));
console.log('\ncena celkem $' + R.reduce((a, x) => a + x.usd, 0).toFixed(3) + ' · čas průměr ' + (L.reduce((a, x) => a + x.ms, 0) / L.length / 1000).toFixed(1) + ' s');
fs.writeFileSync(path.join(__dirname, SOUBOR.replace('.jsonl', '_rozbor.json')), JSON.stringify(R.map(({ runa, rameno, k, sloveso, slovo, opis, slov }) => ({ runa, rameno, k, sloveso, slovo, opis, slov })), null, 1));

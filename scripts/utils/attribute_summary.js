// Souhrn prisouzeni: ktera paka nese kterou vlastnost. Krome tabulky vypocita i to, co
// z ni smi a nesmi plynout — pri n=8 na rameno je rozdil 1-2 case sum, takze se vypisuje
// prumer poolu a odchylka od nej, ne holy zebricek.
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const VEN = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(REPO, 'docs', 'eval', '2026-08-21-attribution');
const z = fs.readFileSync(VEN + '/readings.jsonl', 'utf8').trim().split(String.fromCharCode(10)).map(x => JSON.parse(x));

const klic = (r) => r.lang + '|' + r.pool + '[' + r.idx + ']';
const skupiny = new Map();
z.forEach(r => { const k = klic(r); if (!skupiny.has(k)) skupiny.set(k, []); skupiny.get(k).push(r); });

const souhrn = [];
for (const [k, v] of skupiny) {
  const [lang, paka] = k.split('|');
  souhrn.push({
    lang, paka, pool: v[0].pool, idx: v[0].idx, n: v.length,
    text: String(v[0].paka).slice(0, 130),
    chlad: v.filter(x => x.chlad).length,
    smysl: v.filter(x => x.smysl).length,
    slov: Math.round(v.reduce((s, x) => s + x.slov, 0) / v.length),
    vet: (v.reduce((s, x) => s + x.vet, 0) / v.length).toFixed(1),
  });
}
fs.writeFileSync(VEN + '/summary.json', JSON.stringify(souhrn, null, 1));

for (const L of ['en', 'is']) {
  const s = souhrn.filter(x => x.lang === L);
  if (!s.length) continue;
  console.log('\n══ ' + L.toUpperCase() + ' ══  (n=' + (s[0] ? s[0].n : 0) + ' na páku)');
  for (const pool of ['uhel', 'zakonceni_open', 'zakonceni_heavy', 'oblast']) {
    const p = s.filter(x => x.pool === pool);
    if (!p.length) continue;
    const prum = p.reduce((a, x) => a + x.chlad, 0) / p.length;
    console.log('\n  ' + pool + '   (průměr studeného čtení ' + prum.toFixed(1) + '/' + p[0].n + ')');
    p.sort((a, b) => b.chlad - a.chlad).forEach(x => {
      const odch = x.chlad - prum;
      const znak = odch >= 2 ? ' ⚠ nad průměrem' : (odch <= -2 ? ' ✓ pod průměrem' : '');
      console.log('    ' + String(x.chlad + '/' + x.n).padStart(5) + '  ' + x.text.slice(0, 92) + znak);
    });
  }
}
console.log('\n  ulozeno: ' + VEN + '/summary.json');

// CODE-read 2026-09-23 — vyhodnoceni vetsiho identitniho behu: IDENTITA (soudci, vyber z 24) a OPISOVANI
// (slova z puvodniho seznamu klicovych slov v zaveru Skuld a v celem textu), podle modelu × ramene.
// Opisovani se meri vsude proti PLNEMU puvodnimu seznamu (i v rameni B, kde v promptu nebyl) — at jsou cisla
// srovnatelna. Detektor nevidi sklonovane tvary (arfi × arfur) → dolni mez.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'ident2');
const MOD = { 'gpt-6-sol': 'sol', 'claude-opus-5': 'Opus5' };

// ── OPISOVANI
const Z = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const kop = {};
for (const z of Z) {
  const p = JSON.parse(fs.readFileSync(path.join(DIR, z.id + '.json'), 'utf8'));
  const kw = [...new Set(Object.values(p.kw).join(',').toLowerCase().split(/[^a-záðéíóúýþæö]+/).filter(w => w.length > 3))];
  // §27 (utok 2, 2026-09-23): slovo, ktere v promptu stoji i MIMO seznam (nazev oblasti „Tilgangur & Leið", obraz,
  // landing…), neni dukaz opisu ze seznamu — model ho mohl vzit odjinud. Vyrazuje se; cisla jsou pak cistsi.
  const jinde = p.user.split(String.fromCharCode(10)).filter(l => !/^\S+ — /.test(l)).join(' ').toLowerCase();
  const kwCiste = kw.filter(w => !jinde.includes(w));
  const v = z.text.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ])/), posl = v[v.length - 1].toLowerCase(), low = z.text.toLowerCase();
  const c = kop[MOD[z.model] + '-' + p.arm] = kop[MOD[z.model] + '-' + p.arm] || { n: 0, zaver: 0, zaverSlova: [], telo: 0 };
  c.n++;
  const vz = kwCiste.filter(w => posl.includes(w)); if (vz.length) { c.zaver++; c.zaverSlova.push(z.id + ':' + vz.join('+')); }
  c.telo += kwCiste.filter(w => low.includes(w)).length;
}
console.log('OPISOVANI — cteni, jejichz ZAVER obsahuje slovo ze seznamu · slov ze seznamu v celem textu (soucet)');
for (const m of ['sol', 'Opus5']) for (const a of ['S', 'J', 'B']) {
  const c = kop[m + '-' + a]; if (!c) continue;
  console.log('  ' + (m + ' ' + a).padEnd(9) + ' zaver ' + c.zaver + '/' + c.n + ' · telo ' + c.telo + (c.zaverSlova.length ? '   [' + c.zaverSlova.join(', ') + ']' : ''));
}

// ── IDENTITA
const SOUDY = path.join(DIR, 'soudy.json');
if (!fs.existsSync(SOUDY)) { console.log('\n(soudy.json zatim neni — identita az po soudcich)'); process.exit(0); }
const K = JSON.parse(fs.readFileSync(path.join(DIR, 'klic.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(SOUDY, 'utf8'));
const t = {};
let prazdni = 0, mimo = 0;
R.soudci.forEach((s, j) => {
  if (!s) { prazdni++; return; }
  for (const it of s.items) {
    const k = K[it.id]; if (!k) continue;
    if (!/^[A-Z][a-z]+$/.test(it.choice)) mimo++;
    const sk = MOD[k.model] + '-' + k.arm + (k.obrazova ? '-obraz' : '-ostatni');
    const x = t[sk] = t[sk] || { ok: 0, n: 0, minul: [] };
    x.n++; if (it.choice === k.pravda) x.ok++; else x.minul.push(k.pravda + '→' + it.choice);
  }
});
console.log('\nIDENTITA — vyber z 24 (sance ~4 %)' + (prazdni ? '  ⚠️ prazdnych soudcu: ' + prazdni : '') + (mimo ? '  ⚠️ volba mimo seznam: ' + mimo : ''));
for (const m of ['sol', 'Opus5']) {
  for (const a of ['S', 'J', 'B']) {
    const o = t[m + '-' + a + '-obraz'] || { ok: 0, n: 0, minul: [] }, x = t[m + '-' + a + '-ostatni'] || { ok: 0, n: 0, minul: [] };
    console.log('  ' + (m + ' ' + a).padEnd(9) + ' runa obrazu ' + o.ok + '/' + o.n + ' · OSTATNI ' + x.ok + '/' + x.n
      + ' (' + Math.round(100 * x.ok / (x.n || 1)) + ' %)' + (x.minul.length ? '   minul: ' + x.minul.join(', ') : ''));
  }
}

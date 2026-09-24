// CODE-read 2026-09-24 — odslepi souzeni Opus 5 × Opus 4.8 (workflow opus5-vs-opus48-slepi-soudci) klicem ../opis-klic4.json.
//   node opus5_soudy.js <vystup workflow {vysledky:[…]}>
'use strict';
const fs = require('fs'), path = require('path');
const klic = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'opis-klic4.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const arm = (pid, ab) => (ab === 'tie' || ab === 'same') ? 'tie' : klic[pid][ab];
const rows = [];
for (const v of W.vysledky.filter(Boolean)) {
  const by = a => Object.fromEntries((a || []).map(p => [p.pid, p]));
  const l1 = by(v.l1), l2 = by(v.l2), a3 = by(v.l3a), b3 = by(v.l3b), tb = by(v.tiebreak);
  const sk = {}; for (const s of v.skeptik || []) sk[s.pid + s.strana + s.kind] = s;
  for (const pid of Object.keys(l1)) {
    const k = klic[pid], r = { pid, id: k.id, lang: k.lang };
    for (const x of ['opus5', 'opus48']) {
      const s = k.A === x ? 'a' : 'b', S = s.toUpperCase(), d = l2[pid] || {};
      r[x + '_retells'] = l1[pid][s + '_retells'];
      let drift = d[s + '_verdict'] === 'drifts'; const sd = sk[pid + S + 'drift']; if (drift && sd) drift = !sd.refuted;
      let lost = d[s + '_sense_kept'] === 'no'; const ss = sk[pid + S + 'sense']; if (lost && ss) lost = !ss.refuted;
      r[x + '_drift'] = drift; r[x + '_lost'] = lost;
      for (const f of ['advice', 'inner', 'force', 'formula']) r[x + '_' + f] = [...new Set([...((a3[pid] || {})[f + '_' + s] || []), ...((b3[pid] || {})[f + '_' + s] || [])])];
    }
    const va = a3[pid] && a3[pid].better, vb = b3[pid] && b3[pid].better;
    r.l3a = va ? arm(pid, va) : null; r.l3b = vb ? arm(pid, vb) : null;
    if (va && vb && va === vb) r.l3 = arm(pid, va);
    else if (va === 'tie' && vb) r.l3 = arm(pid, vb) === 'tie' ? 'tie' : arm(pid, vb) + '?';
    else if (vb === 'tie' && va) r.l3 = arm(pid, va) + '?';
    else if (tb[pid]) r.l3 = arm(pid, tb[pid].better) + '!';
    else r.l3 = 'chybi';
    r.duvody = [(a3[pid] || {}).reason, (b3[pid] || {}).reason, (tb[pid] || {}).reason].filter(Boolean).map(s => s.replace(/\b(A|B)\b/g, m => '[' + m + '=' + klic[pid][m] + (pid && r.l3b && false ? '' : '') + ']'));
    rows.push(r);
  }
}
fs.writeFileSync(path.join(__dirname, 'soud4', 'odslepene.json'), JSON.stringify(rows, null, 1));
const c = (xs, f) => xs.filter(f).length, l3 = (xs, v) => c(xs, r => r.l3.replace(/[?!]/, '') === v);
for (const lang of ['en', 'is']) {
  const xs = rows.filter(r => r.lang === lang);
  console.log('\n=== ' + lang.toUpperCase() + ' · paru ' + xs.length);
  for (const x of ['opus5', 'opus48']) console.log('  ' + x.padEnd(7) + 'prevypravuje mostly/partly/no ' + c(xs, r => r[x + '_retells'] === 'mostly') + '/' + c(xs, r => r[x + '_retells'] === 'partly') + '/' + c(xs, r => r[x + '_retells'] === 'no')
    + ' | posun ' + c(xs, r => r[x + '_drift']) + ' · smysl ztracen ' + c(xs, r => r[x + '_lost']) + ' | rada ' + c(xs, r => r[x + '_advice'].length) + ' · nitro ' + c(xs, r => r[x + '_inner'].length)
    + ' · runa-sila ' + c(xs, r => r[x + '_force'].length) + ' · formule ' + c(xs, r => r[x + '_formula'].length));
  console.log('  CELKOVE: opus5 ' + l3(xs, 'opus5') + ' · opus4.8 ' + l3(xs, 'opus48') + ' · tie ' + l3(xs, 'tie') + '  (rozhodci ' + c(xs, r => r.l3.endsWith('!')) + ') · shoda L3a×L3b ' + c(xs, r => r.l3a === r.l3b) + '/' + xs.length);
  const bezRad = xs.filter(r => !(r.opus5_advice.length > 0 !== r.opus48_advice.length > 0));
  console.log('  bez paru, kde radu ma jen jedna strana: opus5 ' + l3(bezRad, 'opus5') + ' · opus4.8 ' + l3(bezRad, 'opus48') + ' (n ' + bezRad.length + ')');
}
console.log('\n=== duvody (L3a | L3b prohozene — pismena v L3b jsou v prohozenem ramci | rozhodci)');
for (const r of rows) console.log(r.lang + ' ' + r.id.padEnd(15) + r.l3.padEnd(8) + (r.duvody[0] || '').slice(0, 170));
for (const f of ['advice', 'inner']) { console.log('\n=== ' + f); for (const r of rows) for (const x of ['opus5', 'opus48']) if (r[x + '_' + f].length) console.log(r.lang + ' ' + x.padEnd(7) + r.id.padEnd(15) + r[x + '_' + f].join(' | ')); }

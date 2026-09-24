// CODE-read 2026-09-23 — odslepi druhe souzeni (detail × prod, workflow opis-detail-slepi-soudci) klicem ../opis-klic2.json.
// Celkovy verdikt paru: L3a a L3b (L3b videl A/B prohozene) — shoda → ten; jeden tie → druhy („?"); spor → rozhodci („!").
// Posun obrazu i ztraceny smysl prochazi skeptikem (jednostranna tvrzeni) — kritik prvniho kola vytkl, ze smysl ne.
//   node opis_soudy2.js <vystup workflow {vysledky:[…]}>
'use strict';
const fs = require('fs'), path = require('path');
const klic = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'opis-klic2.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', 'mereni3.json'), 'utf8'));
const P = {}; for (const f of fs.readdirSync(path.join(__dirname, 'opis2')).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', f), 'utf8')); P[j.id] = j; }
const arm = (pid, ab) => (ab === 'tie' || ab === 'same') ? 'tie' : klic[pid][ab];
const rows = [];
for (const v of W.vysledky.filter(Boolean)) {
  const by = a => Object.fromEntries((a || []).map(p => [p.pid, p]));
  const l1 = by(v.l1), l2 = by(v.l2), a3 = by(v.l3a), b3 = by(v.l3b), tb = by(v.tiebreak);
  const sk = {}; for (const s of v.skeptik || []) sk[s.pid + s.strana + s.kind] = s;
  for (const pid of Object.keys(l1)) {
    const k = klic[pid], r = { pid, id: k.id, model: k.model, rep: k.rep, smysl: P[k.id].smysl, uhel: P[k.id].uhel };
    for (const x of ['prod', 'detail']) {
      const s = k.A === x ? 'a' : 'b', S = s.toUpperCase(), d = l2[pid] || {};
      r[x + '_retells'] = l1[pid][s + '_retells'];
      let drift = d[s + '_verdict'] === 'drifts'; const sd = sk[pid + S + 'drift']; if (drift && sd) drift = !sd.refuted;
      let lost = d[s + '_sense_kept'] === 'no'; const ss = sk[pid + S + 'sense']; if (lost && ss) lost = !ss.refuted;
      r[x + '_drift'] = drift; r[x + '_driftText'] = drift ? d[s + '_drift'] : ''; r[x + '_lost'] = lost;
      for (const f of ['advice', 'inner', 'force', 'formula']) r[x + '_' + f] = [...new Set([...((a3[pid] || {})[f + '_' + s] || []), ...((b3[pid] || {})[f + '_' + s] || [])])];
    }
    r.closer = arm(pid, l1[pid].closer_to_source);   // ktere rameno drzi blize zdrojove vete (horsi)
    const va = a3[pid] && a3[pid].better, vb = b3[pid] && b3[pid].better;
    r.l3a = va ? arm(pid, va) : null; r.l3b = vb ? arm(pid, vb) : null;
    if (va && vb && va === vb) r.l3 = arm(pid, va);
    else if (va === 'tie' && vb) r.l3 = arm(pid, vb) === 'tie' ? 'tie' : arm(pid, vb) + '?';
    else if (vb === 'tie' && va) r.l3 = arm(pid, va) + '?';
    else if (tb[pid]) r.l3 = arm(pid, tb[pid].better) + '!';
    else r.l3 = 'chybi';
    r.duvody = [(a3[pid] || {}).reason, (b3[pid] || {}).reason, (tb[pid] || {}).reason].filter(Boolean);
    const mp = M.find(m => m.id === k.id && m.model === k.model && m.rep === k.rep && m.rameno === 'prod'), md = M.find(m => m.id === k.id && m.model === k.model && m.rep === k.rep && m.rameno === 'detail');
    r.prod_slov = mp.slov; r.detail_slov = md.slov; r.prod_text = mp.text; r.detail_text = md.text;
    rows.push(r);
  }
}
fs.writeFileSync(path.join(__dirname, 'opis2', 'soudy2-odslepene.json'), JSON.stringify(rows, null, 1));
const c = (xs, f) => xs.filter(f).length, l3 = (xs, v) => c(xs, r => r.l3.replace(/[?!]/, '') === v);
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) {
  const xs = rows.filter(r => r.model === m);
  console.log('\n=== ' + m + ' · paru ' + xs.length);
  for (const x of ['prod', 'detail']) console.log('  ' + x.padEnd(7) + 'zacatek prevypravuje mostly/partly/no ' + c(xs, r => r[x + '_retells'] === 'mostly') + '/' + c(xs, r => r[x + '_retells'] === 'partly') + '/' + c(xs, r => r[x + '_retells'] === 'no')
    + ' | posun ' + c(xs, r => r[x + '_drift']) + ' · smysl ztracen ' + c(xs, r => r[x + '_lost']) + ' | rada ' + c(xs, r => r[x + '_advice'].length) + ' · nitro ' + c(xs, r => r[x + '_inner'].length)
    + ' · runa-sila ' + c(xs, r => r[x + '_force'].length) + ' · formule ' + c(xs, r => r[x + '_formula'].length));
  console.log('  blize zdrojove vete: prod ' + c(xs, r => r.closer === 'prod') + ' · detail ' + c(xs, r => r.closer === 'detail') + ' · stejne ' + c(xs, r => r.closer === 'tie'));
  console.log('  CELKOVE L3: detail ' + l3(xs, 'detail') + ' · prod ' + l3(xs, 'prod') + ' · tie ' + l3(xs, 'tie') + '  (slabe ? ' + c(xs, r => r.l3.endsWith('?')) + ', rozhodci ! ' + c(xs, r => r.l3.endsWith('!')) + ') · shoda L3a×L3b ' + c(xs, r => r.l3a === r.l3b) + '/' + xs.length);
  for (const rep of [1, 2]) { const ys = xs.filter(r => r.rep === rep); console.log('    opakovani ' + rep + ': detail ' + l3(ys, 'detail') + ' · prod ' + l3(ys, 'prod')); }
  for (const h of ['A', 'B']) { const ys = xs.filter(r => (+r.id.slice(0, 2) <= 7) === (h === 'A')); console.log('    pulka ' + h + ': detail ' + l3(ys, 'detail') + ' · prod ' + l3(ys, 'prod')); }
  const kr = xs.filter(r => r.prod_slov !== r.detail_slov); console.log('    kratsi cteni vyhralo ' + c(kr, r => r.l3.startsWith(r.prod_slov < r.detail_slov ? 'prod' : 'detail')) + ' z ' + kr.length);
}
for (const f of ['advice', 'inner', 'force', 'formula']) {
  console.log('\n=== ' + f);
  for (const r of rows) for (const x of ['prod', 'detail']) if (r[x + '_' + f].length) console.log(r.model.slice(0, 9).padEnd(10) + x.padEnd(7) + r.id.padEnd(16) + 'r' + r.rep + '  ' + r[x + '_' + f].join(' | '));
}
console.log('\n=== posun a ztraceny smysl (po skeptikovi)');
for (const r of rows) for (const x of ['prod', 'detail']) if (r[x + '_drift'] || r[x + '_lost']) console.log(r.model.slice(0, 9).padEnd(10) + x.padEnd(7) + r.id.padEnd(16) + 'r' + r.rep + '  ' + (r[x + '_drift'] ? 'POSUN: ' + r[x + '_driftText'] : '') + (r[x + '_lost'] ? ' SMYSL ZTRACEN' : ''));

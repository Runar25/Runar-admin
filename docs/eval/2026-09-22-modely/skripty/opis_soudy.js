// CODE-read 2026-09-23 — odslepi verdikty soudcu (workflow opis-obrazu-slepi-soudci) klicem A/B a secte je.
//   node opis_soudy.js <soubor s vystupem workflow (JSON {vysledky:[…]})>
// Celkovy verdikt paru: L3a a L3b (L3b videl A/B prohozene) — shoda → ten; jeden „tie" → druhy (slaby); spor → rozhodci.
'use strict';
const fs = require('fs'), path = require('path');
const klic = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'opis-klic.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', 'mereni.json'), 'utf8'));
const P = {}; for (const f of fs.readdirSync(path.join(__dirname, 'opis2')).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', f), 'utf8')); P[j.id] = j; }
const arm = (pid, ab) => ab === 'tie' ? 'tie' : klic[pid][ab];          // 'A'|'B' → 'nova'|'prod'
const rows = [];
for (const v of W.vysledky.filter(Boolean)) {
  const by = a => Object.fromEntries((a || []).map(p => [p.pid, p]));
  const l1 = by(v.l1), l2 = by(v.l2), a3 = by(v.l3a), b3 = by(v.l3b), tb = by(v.tiebreak);
  const sk = {}; for (const s of v.skeptik || []) sk[s.pid + s.strana] = s;
  for (const pid of Object.keys(l1)) {
    const k = klic[pid]; const strana = x => (k.A === x ? 'a' : 'b');   // pismeno cteni daneho ramene
    const r = { pid, id: k.id, model: k.model, rep: k.rep, smysl: P[k.id].smysl, uhel: P[k.id].uhel };
    for (const x of ['prod', 'nova']) {
      const s = strana(x), S = s.toUpperCase();
      r[x + '_open'] = l1[pid][s + '_opening'];
      const d = l2[pid] || {};
      let drift = d[s + '_verdict'] === 'drifts';
      const skp = sk[pid + S];
      if (drift && skp) drift = !skp.refuted;                        // jednostranny drift overen skeptikem
      r[x + '_drift'] = drift; r[x + '_driftText'] = drift ? d[s + '_drift'] : '';
      r[x + '_senseLost'] = d[s + '_sense_kept'] === 'no';
      r[x + '_formule'] = [...((a3[pid] || {})['formula_' + s] || []), ...((b3[pid] || {})['formula_' + s] || [])];
    }
    r.l1 = arm(pid, l1[pid].better);
    const va = a3[pid] && a3[pid].better, vb = b3[pid] && b3[pid].better;
    r.l3a = va ? arm(pid, va) : null; r.l3b = vb ? arm(pid, vb) : null;
    if (va && vb && va === vb) r.l3 = arm(pid, va);
    else if (va === 'tie' && vb) r.l3 = arm(pid, vb) === 'tie' ? 'tie' : arm(pid, vb) + '?';
    else if (vb === 'tie' && va) r.l3 = arm(pid, va) + '?';
    else if (tb[pid]) r.l3 = arm(pid, tb[pid].better) + '!';
    else r.l3 = 'chybi';
    r.l3duvod = [(a3[pid] || {}).reason, (b3[pid] || {}).reason, (tb[pid] || {}).reason].filter(Boolean);
    const mp = M.find(m => m.id === k.id && m.model === k.model && m.rep === k.rep && m.rameno === 'prod'), mn = M.find(m => m.id === k.id && m.model === k.model && m.rep === k.rep && m.rameno === 'nova');
    r.prod_text = mp && mp.text; r.nova_text = mn && mn.text;
    rows.push(r);
  }
}
fs.writeFileSync(path.join(__dirname, 'opis2', 'soudy-odslepene.json'), JSON.stringify(rows, null, 1));
const cnt = (xs, f) => xs.filter(f).length;
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) {
  const xs = rows.filter(r => r.model === m);
  console.log('\n=== ' + m + ' · paru ' + xs.length);
  for (const x of ['prod', 'nova']) console.log('  ' + x.padEnd(5) + ' otevreni: restates ' + cnt(xs, r => r[x + '_open'] === 'restates') + ' · partly ' + cnt(xs, r => r[x + '_open'] === 'partly') + ' · re-sees ' + cnt(xs, r => r[x + '_open'] === 're-sees')
    + ' | drift (po skeptikovi) ' + cnt(xs, r => r[x + '_drift']) + ' · ztraceny smysl ' + cnt(xs, r => r[x + '_senseLost']) + ' | formule ' + cnt(xs, r => r[x + '_formule'].length));
  console.log('  L1 lepe si obraz privlastni: nova ' + cnt(xs, r => r.l1 === 'nova') + ' · prod ' + cnt(xs, r => r.l1 === 'prod') + ' · tie ' + cnt(xs, r => r.l1 === 'tie'));
  const t = v => cnt(xs, r => r.l3.replace(/[?!]/, '') === v);
  console.log('  L3 celkove: nova ' + t('nova') + ' · prod ' + t('prod') + ' · tie ' + t('tie') + '   (z toho slabe „?" ' + cnt(xs, r => r.l3.endsWith('?')) + ', rozhodci „!" ' + cnt(xs, r => r.l3.endsWith('!')) + ')');
  console.log('  shoda L3a × L3b: ' + cnt(xs, r => r.l3a === r.l3b) + '/' + xs.length);
  for (const h of ['A', 'B']) { const ys = xs.filter(r => (+r.id.slice(0, 2) <= 7) === (h === 'A')); console.log('  pulka ' + h + ': L3 nova ' + cnt(ys, r => r.l3.startsWith('nova')) + ' · prod ' + cnt(ys, r => r.l3.startsWith('prod')) + ' · tie ' + cnt(ys, r => r.l3.startsWith('tie')) + ' | L1 nova ' + cnt(ys, r => r.l1 === 'nova') + ' · prod ' + cnt(ys, r => r.l1 === 'prod')); }
  for (const g of ['zrak', 'NEzrak']) { const ys = xs.filter(r => (r.smysl === 'zrak') === (g === 'zrak')); console.log('  ' + g.padEnd(6) + ': L3 nova ' + cnt(ys, r => r.l3.startsWith('nova')) + ' · prod ' + cnt(ys, r => r.l3.startsWith('prod')) + ' · drift nova ' + cnt(ys, r => r.nova_drift) + ' / prod ' + cnt(ys, r => r.prod_drift) + ' · smysl ztracen nova ' + cnt(ys, r => r.nova_senseLost) + ' / prod ' + cnt(ys, r => r.prod_senseLost)); }
}
console.log('\n=== drift (po skeptikovi)');
for (const r of rows) for (const x of ['prod', 'nova']) if (r[x + '_drift']) console.log(r.model.slice(0, 9).padEnd(10) + x.padEnd(5) + r.id.padEnd(16) + r[x + '_driftText']);
console.log('\n=== formule podle soudcu');
for (const r of rows) for (const x of ['prod', 'nova']) if (r[x + '_formule'].length) console.log(r.model.slice(0, 9).padEnd(10) + x.padEnd(5) + r.id.padEnd(16) + [...new Set(r[x + '_formule'])].join(' | '));

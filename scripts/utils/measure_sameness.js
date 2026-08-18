// ═══════════════════════════════════
// RÚNAR · measure_sameness.js — SPLYVAJI cteni jedne davky mezi sebou?
//
// Proc existuje: blok TWO THINGS THAT NEVER CHANGE slibuje „kazde cteni prichazi z jineho
// uhlu", ale `angleIntro` ma JEN `RP_SINGLE` — spready ho nedostanou (overeno 2026-08-17 na
// slozenem promptu vsech sedmi cest). Otazka „vadi to?" potrebuje cislo, ktere se da srovnat.
//
// Metrika: prumerna PAROVA Jaccardova shoda na trigramech obsahovych slov.
//
// ⚠️ NASTROJ SE OBHAJUJE PRVNI (§27) — vypisuje se vzdy, nejen na vyzadani:
//   1. PULKA PROTI PULCE uvnitr kazde davky = sumova podlaha. Je-li rozdil mezi davkami
//      mensi nez tohle, cislo nic nerika. (2026-08-17 presne takhle padlo mereni na
//      archivnich norns: 2,79x mezi rameny, ale 14x rozptyl uvnitr jednoho.)
//   2. DELKA se srovnava: delsi text ma vic trigramu, takze se meri i na PRVNICH N SLOVECH
//      (N = nejkratsi median z porovnavanych davek). Bez toho by spread vypadal jinak uz
//      jen tim, ze je delsi.
//   3. ZAMICHANI SLOV uvnitr cteni: kdyz se cislo nehne, metrika NEVIDI poradi ani rytmus —
//      a to se ma vedet, ne tusit.
//
//   node scripts/utils/measure_sameness.js a.jsonl b.jsonl ...
'use strict';
const fs = require('fs');

const soubory = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!soubory.length) { console.error('  pouziti: node scripts/utils/measure_sameness.js <davka.jsonl> ...'); process.exit(1); }

const nacti = (f) => fs.readFileSync(f, 'utf8').trim().split('\n')
  .map((l) => { try { return JSON.parse(l); } catch (e) { return null; } })
  .filter((r) => r && r.reading_text && !r.error).map((r) => r.reading_text);

const slova = (t) => String(t).toLowerCase().replace(/[^a-zá-þà-ÿ\s]/gi, ' ').split(/\s+/).filter((w) => w.length > 2);
const trig = (w) => { const s = new Set(); for (let i = 0; i + 2 < w.length; i++) s.add(w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]); return s; };
function jac(a, b) { let spol = 0; for (const x of a) if (b.has(x)) spol++; const u = a.size + b.size - spol; return u ? spol / u : 0; }
function parove(texty, limit) {
  const t = texty.map((x) => trig(limit ? slova(x).slice(0, limit) : slova(x)));
  let s = 0, n = 0;
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) { s += jac(t[i], t[j]); n++; }
  return n ? s / n : 0;
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

const davky = soubory.map((f) => ({ f: f.replace(/^.*[\/]/, ''), t: nacti(f) }));
const LIMIT = Math.min(...davky.map((d) => median(d.t.map((x) => slova(x).length))));

console.log('  delkove srovnano na prvnich ' + LIMIT + ' obsahovych slovech (nejkratsi median z davek)\n');
console.log('  davka'.padEnd(42) + 'n'.padStart(4) + 'podobnost'.padStart(12) + 'srovnana'.padStart(11) + '   sumova podlaha (pulka|pulka)');
for (const d of davky) {
  const h = Math.floor(d.t.length / 2);
  const p1 = parove(d.t.slice(0, h), LIMIT), p2 = parove(d.t.slice(h), LIMIT);
  console.log('  ' + d.f.padEnd(40) + String(d.t.length).padStart(4)
    + parove(d.t).toFixed(4).padStart(12) + parove(d.t, LIMIT).toFixed(4).padStart(11)
    + '   ' + p1.toFixed(4) + ' | ' + p2.toFixed(4));
}

// utok 3: zamichat slova uvnitr kazdeho cteni — metrika na poradi nesmi tise zaviset
const zamichej = (t) => { const w = slova(t); for (let i = w.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [w[i], w[j]] = [w[j], w[i]]; } return w.join(' '); };
console.log('\n  utok 3 — zamichani slov uvnitr cteni (kdyz se cislo nehne, metrika nevidi poradi):');
for (const d of davky) {
  const pred = parove(d.t, LIMIT), po = parove(d.t.map(zamichej), LIMIT);
  console.log('    ' + d.f.padEnd(40) + pred.toFixed(4) + ' -> ' + po.toFixed(4)
    + '   zmena ' + (pred ? ((po - pred) / pred * 100).toFixed(1) + ' %' : '-'));
}

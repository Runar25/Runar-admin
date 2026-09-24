// CODE-read 2026-09-24 — tvrda mereni Opus 5 × Opus 4.8, produkcni rameno, 14 EN promptu (varka opis2).
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js'); const { najdi } = require('./runa_jedna.js');
const DIR = path.join(__dirname, 'opis2');
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text && x.rameno === 'prod');
const IMP = /(^|[.?!]\s+)(Look|See|Notice|Listen|Watch|Feel|Bend|Lean|Step)(?![a-z])/;
const ZVUK = /(?<![a-z])(hear|heard|hears|hearing|sound|sounds|listen\w*|ears?|voice|rings?|rang|toll\w*|note|chime\w*|bell)(?![a-z])/gi;
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
for (const [m, reps] of [['claude-opus-4-8', [1, 2]], ['claude-opus-5', [1]]]) {
  const xs = L.filter(x => x.model === m && reps.includes(x.rep));
  const r = xs.map(x => { const p = P[x.id], t = x.text, z = zmer(t, 'comes from here: ' + p.obraz + '. Let it become'), sl = t.split(/\s+/).length;
    const bez = /do not use the name Kuky at all/.test(p.ramena.prod);
    return { beh: z.beh, v1: z.v1p, sl, vet: t.split(/(?<=[.?!])\s+/).length, imp: IMP.test(t), runa: najdi(t, p.runa).length > 0,
      vRozpoctu: sl >= 50 && sl <= 58, jmeno: bez ? !/\bKuky\b/.test(t) : /\bKuky\b/.test(t), otazka: /\?\s*$/.test(t),
      zvuk: p.smysl === 'sluch' ? (t.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ').match(ZVUK) || []).length > 0 : null }; });
  const c = f => r.filter(f).length, s = r.filter(x => x.zvuk !== null);
  console.log(m.padEnd(16) + ' n ' + r.length + ' · slov ' + avg(r.map(x => x.sl)).toFixed(1) + ' (v rozpoctu 50–58: ' + c(x => x.vRozpoctu) + ') · vet ' + avg(r.map(x => x.vet)).toFixed(1)
    + ' · usek ' + avg(r.map(x => x.beh)).toFixed(2) + ' · usek>=5 ' + c(x => x.beh >= 5) + ' · v1 ' + avg(r.map(x => x.v1)).toFixed(2) + ' · rozkaz ' + c(x => x.imp) + ' · runa jedna ' + c(x => x.runa)
    + ' · jmeno dle zadani ' + c(x => x.jmeno) + ' · zvuk ' + c(x => x.zvuk) + '/' + s.length);
}

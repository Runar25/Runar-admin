// CODE-read 2026-09-24 — tvrda mereni Opus 5 × Opus 4.8 na single + Norns (slozka opus5).
'use strict';
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, 'opus5');
const P = {}; for (const f of fs.readdirSync(D).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(D, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);
const IMP = /(^|[.?!]\s+)(Look|See|Notice|Listen|Watch|Feel|Lean|Step|Líttu|Sjáðu|Taktu eftir|Hlustaðu)(?![a-zá-þ])/;
const rozpocet = p => { const m = p.ramena.prod.match(/(\d+) (?:to|til) (\d+) (?:words|orð)/); return m ? [+m[1], +m[2]] : null; };
for (const x of L) { const p = P[x.id], sl = x.text.split(/\s+/).length, b = rozpocet(p);
  const bez = /do not use the name Kuky at all|Notaðu ekki nafnið Kuky|ekki nafnið Kuky/.test(p.ramena.prod);
  x.sl = sl; x.b = b; x.vR = b ? (sl >= b[0] && sl <= b[1]) : null; x.glosa = /\b[A-ZÞÆÖÁÐÉÍÓÚÝ][a-zþæöáðéíóúý]+ \([^)]+\)/.test(x.text);
  x.jm = bez ? !/\bKuky\b/.test(x.text) : /\bKuky\b/.test(x.text); x.imp = IMP.test(x.text); x.spread = p.spread; x.lang = p.lang; }
for (const sp of ['single', 'norns']) for (const lang of ['en', 'is']) {
  console.log('\n' + sp + ' ' + lang + ' (rozpocet ' + JSON.stringify(rozpocet(Object.values(P).find(p => p.spread === sp && p.lang === lang))) + ')');
  for (const m of ['claude-opus-4-8', 'claude-opus-5']) { const xs = L.filter(x => x.spread === sp && x.lang === lang && x.model === m);
    const a = f => xs.reduce((s, x) => s + f(x), 0) / xs.length;
    console.log('  ' + m.padEnd(16) + 'n ' + xs.length + ' · slov ' + xs.map(x => x.sl).join('/') + ' · v rozpoctu ' + xs.filter(x => x.vR).length + ' · $/cteni ' + a(x => x.usd).toFixed(4)
      + ' · out tok ' + a(x => x.tok.out).toFixed(0) + ' · ' + (a(x => x.ms) / 1000).toFixed(1) + ' s · glosa ' + xs.filter(x => x.glosa).length + ' · jmeno ok ' + xs.filter(x => x.jm).length + ' · rozkaz ' + xs.filter(x => x.imp).length); }
}
const is = L.filter(x => x.lang === 'is').sort((a, b) => a.klic.localeCompare(b.klic));
fs.writeFileSync(path.join(D, 'is-texty.txt'), is.map(x => x.text.replace(/\n/g, ' ')).join('\n') + '\n');
fs.writeFileSync(path.join(D, 'is-klic.json'), JSON.stringify(is.map(x => x.klic)));

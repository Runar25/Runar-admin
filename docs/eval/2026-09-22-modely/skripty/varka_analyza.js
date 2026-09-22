// CODE-read 2026-09-22 — tvrda cisla varky (5 run + 2× Norns, Opus 5 × gpt-6-sol, EN+IS).
// Opis klicovych slov = slova z radku runy v promptu („focus on:"/„áhersla:" u single, „<Runa> — …" u Norns),
// ktera se objevi v textu doslova. Mereno proto, ze pilot Norns ukazal „jafnvægi"/„heimili" primo z radku runy.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DIR = path.join(__dirname, 'varka');
const Z = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const pats = JSON.parse(cp.execSync('python -X utf8 -c "import re,ast,io,json;s=io.open(r\'C:/Users/zkuku/Downloads/Runar-admin/check-is.py\',encoding=\'utf-8\').read();m=re.search(r\'BAD_PATTERNS\\s*=\\s*(\\[.*?\\n\\])\',s,re.S);p=ast.literal_eval(m.group(1));print(json.dumps([x[0] if isinstance(x,(list,tuple)) else x for x in p]))"').toString());
const vety = t => t.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ])/).filter(Boolean);

function klicova(p) {
  const kw = [];
  for (const l of p.user.split('\n')) {
    let m = l.match(/(?:focus on|áhersla): ([^·]+)/); if (m) kw.push(...m[1].split(/[,·]/));
    m = l.match(/^[A-Z][a-z]+ — (.+)$/); if (m && p.spread === 'norns') kw.push(...m[1].split(','));
  }
  // jen plnovyznamova slova delsi nez 4 znaky, at „og"/„the" nezkresli
  return [...new Set(kw.join(' ').toLowerCase().split(/[^a-záðéíóúýþæö]+/).filter(w => w.length > 4))];
}
const rozp = p => { const m = p.user.match(/(\d+) (?:to|til) (\d+) (?:words|orð)/); return m ? [+m[1], +m[2]] : null; };

const R = [];
for (const z of Z) {
  const p = JSON.parse(fs.readFileSync(path.join(DIR, z.id + '.json'), 'utf8'));
  const t = z.text, low = t.toLowerCase(), v = vety(t), posl = v[v.length - 1] || '';
  const kw = klicova(p).filter(w => low.includes(w));
  const [od, do_] = rozp(p) || [0, 9999];
  const slov = t.split(/\s+/).length;
  R.push({ model: z.model, id: z.id, lang: z.lang, spread: z.spread, slov, rozpocet: od + '–' + do_,
    vRozpoctu: slov >= od && slov <= do_, usd: z.usd, ms: z.ms, glosa: /\b[A-Z][a-z]+\s*\([^)]+\)/.test(t),
    kw, moznost: z.lang === 'en' ? /\bmay\b|\bmight\b|\bperhaps\b/i.test(posl) : /gæti|kannski/i.test(posl),
    kuky: /Kuky/.test(t), bad: z.lang === 'is' ? pats.filter(q => { try { return new RegExp(q, 'i').test(t); } catch (e) { return false; } }) : [],
    posl, text: t });
}
fs.writeFileSync(path.join(DIR, 'metriky.json'), JSON.stringify(R, null, 1));

const prum = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
console.log('SOUHRN (27 čtení: Opus 14, sol 13 + pilot 1)\n');
for (const m of ['claude-opus-5', 'gpt-6-sol']) for (const sp of ['single', 'norns']) for (const l of ['en', 'is']) {
  const a = R.filter(r => r.model === m && r.spread === sp && r.lang === l); if (!a.length) continue;
  console.log((m + ' ' + sp + ' ' + l).padEnd(28) + ' n=' + a.length
    + ' · $/čtení ' + prum(a.map(r => r.usd)).toFixed(4) + ' · ' + (prum(a.map(r => r.ms)) / 1000).toFixed(1) + ' s'
    + ' · slov ' + a.map(r => r.slov).join('/') + ' (rozpočet ' + a[0].rozpocet + ', v něm ' + a.filter(r => r.vRozpoctu).length + '/' + a.length + ')'
    + ' · možnost ' + a.filter(r => r.moznost).length + '/' + a.length
    + ' · glosa ' + a.filter(r => r.glosa).length
    + ' · opsaná klíč. slova ' + a.reduce((s, r) => s + r.kw.length, 0)
    + (l === 'is' ? ' · IS bad ' + a.reduce((s, r) => s + r.bad.length, 0) : ''));
}
console.log('\nOPSANÁ KLÍČOVÁ SLOVA (kde byla):');
for (const r of R.filter(r => r.kw.length)) console.log('  ' + r.model.padEnd(14) + r.id.padEnd(18) + r.kw.join(', '));
console.log('\nPOSLEDNÍ VĚTY BEZ TVARU MOŽNOSTI:');
for (const r of R.filter(r => !r.moznost)) console.log('  ' + r.model.padEnd(14) + r.id.padEnd(18) + r.posl);

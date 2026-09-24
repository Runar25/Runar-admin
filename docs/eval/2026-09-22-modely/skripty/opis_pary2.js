// CODE-read 2026-09-23 — SLEPE dvojice pro druhe souzeni: rameno „detail" proti „prod" (varka opis2). Proti opis_pary.js:
// soudce dostane i SYSTEMOVY prompt (kanon — kritik vytkl, ze soudci nevideli „never tells the seeker what to do"), zadani
// bez testovane vety (v obou ramenech je veta obrazu stejna, lisi se jen pokyn za ni). Klic A/B mimo slozku soudcu.
//   node opis_pary2.js → soud2/c1..c8(.json|-s.json) + soud2/system.txt ; klic → ../opis-klic2.json
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'opis2'), OUT = path.join(__dirname, 'soud2');
fs.mkdirSync(OUT, { recursive: true });
const PROD = '. Let it become your own seeing in the text.';
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);
const sys = Object.values(P)[0].sys;
if (Object.values(P).some(p => p.sys !== sys)) throw new Error('systemovy prompt se lisi mezi prompty');
fs.writeFileSync(path.join(OUT, 'system.txt'), sys);
const brief = p => p.ramena.prod.replace(PROD, '.').replace(/\nWord corrections[\s\S]*?(?=\nOutput format)/, '').replace(/\nOutput format[\s\S]*$/, '');
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
const pary = [], klic = {};
for (const x of L.filter(y => y.rameno === 'detail')) {
  const y = L.find(z => z.id === x.id && z.model === x.model && z.rep === x.rep && z.rameno === 'prod');
  const pid = 'D' + String(pary.length + 1).padStart(2, '0'), detA = hash(x.id + x.model + x.rep) % 2 === 0;
  klic[pid] = { id: x.id, model: x.model, rep: x.rep, A: detA ? 'detail' : 'prod', B: detA ? 'prod' : 'detail' };
  const sense = P[x.id].smysl === 'zrak' ? 'sight' : { sluch: 'sound', cich: 'smell', hmat: 'touch', teplo: 'warmth' }[P[x.id].smysl];
  pary.push({ pid, brief: brief(P[x.id]), image: P[x.id].obraz, image_sense: sense, A: detA ? x.text : y.text, B: detA ? y.text : x.text });
}
if (pary.some(p => /own seeing|one detail|look closer/i.test(p.brief))) throw new Error('zadani prozrazuje paku');
for (let k = 0; k * 7 < pary.length; k++) {
  const ch = pary.slice(k * 7, (k + 1) * 7);
  fs.writeFileSync(path.join(OUT, 'c' + (k + 1) + '.json'), JSON.stringify({ pairs: ch }, null, 1));
  fs.writeFileSync(path.join(OUT, 'c' + (k + 1) + '-s.json'), JSON.stringify({ pairs: ch.map(p => Object.assign({}, p, { A: p.B, B: p.A })) }, null, 1));
}
fs.writeFileSync(path.join(__dirname, '..', 'opis-klic2.json'), JSON.stringify(klic, null, 1));
console.log('paru ' + pary.length + ' · detail jako A ' + Object.values(klic).filter(k => k.A === 'detail').length + ' · chunku ' + Math.ceil(pary.length / 7));

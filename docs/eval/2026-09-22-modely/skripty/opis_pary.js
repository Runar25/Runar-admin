// CODE-read 2026-09-23 — pripravi SLEPE dvojice pro soudce (varka opis2). Kazda dvojice = tentyz prompt × model ×
// opakovani, rameno prod proti nova v poradi A/B podle hashe klice (ne nahodou → opakovatelne). Soudce dostane zadani
// BEZ testovane vety (veta obrazu je v obou ramenech stejna, lisi se jen pokyn za ni — ten se ze zadani vyjme),
// takze nevi, co se meni. Klic A/B zustava jen tady (opis2/pary-klic.json).
//   node opis_pary.js → opis2/pary.json (vstup workflow) + opis2/pary-klic.json
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'opis2');
const PROD = '. Let it become your own seeing in the text.';
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);
const briefs = {};
for (const [id, p] of Object.entries(P)) {
  let b = p.ramena.prod;
  if (b.split(PROD).length !== 2) throw new Error(id + ': veta ne prave 1×');
  b = b.replace(PROD, '.').replace(/\nWord corrections[\s\S]*?(?=\nOutput format)/, '').replace(/\nOutput format[\s\S]*$/, '');
  briefs[id] = b;
}
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const pary = [], klic = {};
for (const x of L.filter(y => y.rameno === 'nova')) {
  const y = L.find(z => z.id === x.id && z.model === x.model && z.rep === x.rep && z.rameno === 'prod');
  const pid = 'P' + String(pary.length + 1).padStart(2, '0');
  const novaJeA = hash(x.id + x.model + x.rep) % 2 === 0;
  klic[pid] = { id: x.id, model: x.model, rep: x.rep, A: novaJeA ? 'nova' : 'prod', B: novaJeA ? 'prod' : 'nova' };
  pary.push({ pid, brief_id: x.id, image: P[x.id].obraz, sense: P[x.id].smysl === 'zrak' ? 'sight' : { sluch: 'sound', cich: 'smell', hmat: 'touch', teplo: 'warmth' }[P[x.id].smysl],
    A: novaJeA ? x.text : y.text, B: novaJeA ? y.text : x.text });
}
fs.writeFileSync(path.join(DIR, 'pary.json'), JSON.stringify({ briefs, pary }, null, 1));
fs.writeFileSync(path.join(DIR, 'pary-klic.json'), JSON.stringify(klic, null, 1));
console.log('paru ' + pary.length + ' · nova jako A ' + Object.values(klic).filter(k => k.A === 'nova').length + ' · briefu ' + Object.keys(briefs).length
  + ' · velikost ' + JSON.stringify({ briefs, pary }).length + ' znaku');
if (Object.values(briefs).some(b => /own seeing|look closer/.test(b))) throw new Error('zadani prozrazuje paku');

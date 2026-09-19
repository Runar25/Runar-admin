// Sediva podle toho, co je v OBRAZU produkcniho cteni (prompt_draws.image), EN, owner od 2026-08-01.
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8'); t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows.filter(r => r.lang !== 'is');
const tridy = [
  ['mlha', /\b(fog|mist|haze)\b/i],
  ['voda (reka, fjord, more, jezero)', /\b(river|fjord|sea|lagoon|lake|water|tide|pond|stream)\b/i],
  ['svitani / svetlo', /\b(light|dawn|dusk|night|morning)\b/i],
];
const stat = {};
for (const r of rows) {
  let d = {}; try { d = JSON.parse(r.draws || '{}'); } catch (e) {}
  const img = String(d.image || '');
  if (!img) continue;
  const k = (tridy.find(([n, re]) => re.test(img)) || ['nic z toho'])[0];
  stat[k] = stat[k] || { n: 0, g: 0, noun: 0 };
  stat[k].n++;
  if (/\bgr[ae]y\b/i.test(r.txt || '')) stat[k].g++;
  if (/\b(the|of|into|through) gr[ae]y\b(?!\s+\w+(ing|ed)?\s)/i.test(r.txt || '') || /gr[ae]y (wall|shape)\b/i.test(r.txt || '')) stat[k].noun++;
}
for (const [k, x] of Object.entries(stat)) console.log(k.padEnd(34) + ' ctení s obrazem ' + String(x.n).padEnd(4) + ' grey ' + x.g + '/' + x.n);

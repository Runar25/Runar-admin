// CODE-tune 2026-10-06 — co stojí za jménem runy v anglických textech o runách. node slovesa_run.js [korpus.json] [slovo …]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const VSTUP = (process.argv[2] && process.argv[2].endsWith('.json')) ? process.argv.splice(2, 1)[0] : path.join(os.tmpdir(), 'korpus_run.json');
const docs = JSON.parse(fs.readFileSync(VSTUP, 'utf8')).filter((d) => d.text);
const JMENA = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Raido', 'Raidō', 'Kenaz', 'Kaunan', 'Kaun', 'Gebo', 'Gebō', 'Wunjo', 'Wunjō', 'Wynn',
  'Hagalaz', 'Hagall', 'Haglaz', 'Nauthiz', 'Naudiz', 'Nauðiz', 'Isa', 'Isaz', 'Jera', 'Jēra', 'Eihwaz', 'Perthro', 'Perth', 'Pertho', 'Algiz', 'Elhaz',
  'Sowilo', 'Sowilō', 'Sowelo', 'Tiwaz', 'Teiwaz', 'Berkano', 'Berkana', 'Berkanan', 'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Inguz', 'Dagaz', 'Othala',
  'Othila', 'Odal', 'This rune', 'The rune', 'this rune', 'the rune', 'It'];
const PRISL = '(?:also|often|primarily|traditionally|literally|essentially|ultimately|simply|generally|commonly|usually|frequently|strongly|deeply|most|primarily|thus|therefore|itself|truly|clearly|directly|further|again|perhaps|always|mainly|largely)';
const RE = new RegExp('(?:^|[^A-Za-zÀ-ž])(?:[Tt]he\\s+)?(' + JMENA.map((j) => j.replace(/ /g, '\\s+')).join('|') + ')(?:\\s+rune)?(?:\\s*\\([^)]{0,40}\\))?,?\\s+(?:' + PRISL + '\\s+)?([a-z]+)(?:\\s+([a-z]+))?(?:\\s+([a-z]+))?', 'g');
const pocty = {}, dokumenty = {}, priklady = {};
let vet = 0;
for (const d of docs) {
  const seen = new Set();
  for (const veta of d.text.split(/(?<=[.!?])\s+/)) {
    RE.lastIndex = 0; let m;
    while ((m = RE.exec(veta))) {
      if (m[1] === 'It' && !/\b(rune|Fehu|Hagalaz|Uruz|Raidho|Algiz|Sowilo|Isa)\b/.test(veta)) continue;
      let k = m[2];
      if (k === 'is' || k === 'was') k = k + ' ' + ([m[3], m[4]].filter(Boolean).join(' '));
      else if (['stands', 'speaks', 'refers', 'relates', 'points', 'calls', 'brings', 'deals', 'corresponds'].includes(k) && m[3]) k = k + ' ' + m[3];
      k = k.replace(/^(is|was) (the|a|an) .*/, '$1 $2 …').replace(/^(is|was) (associated|linked|connected|related|tied) .*/, '$1 $2 (with/to)');
      vet++;
      pocty[k] = (pocty[k] || 0) + 1;
      (dokumenty[k] = dokumenty[k] || new Set()).add(d.url);
      if (!priklady[k] || priklady[k].length < 2) (priklady[k] = priklady[k] || []).push(veta.trim().slice(0, 150));
      seen.add(k);
    }
  }
}
const top = Object.entries(pocty).sort((a, b) => b[1] - a[1]);
console.log('textů ' + docs.length + ', výskytů „jméno runy + další slovo“ ' + vet + '\n');
console.log('| po jménu runy | výskytů | textů |\n|---|---|---|');
for (const [k, n] of top.slice(0, 60)) console.log('| ' + k + ' | ' + n + ' | ' + dokumenty[k].size + ' |');
const NASE = process.argv.slice(2).length ? process.argv.slice(2) : ['holds', 'marks', 'exposes', 'interrupts', 'counts', 'brings', 'gathers', 'rests', 'names', 'speaks of', 'gives', 'keeps', 'makes', 'turns', 'concerns', 'means', 'represents', 'symbolizes', 'symbolises', 'signifies', 'stands for', 'embodies', 'denotes', 'refers to', 'evokes', 'reflects', 'expresses', 'carries'];
console.log('\n| sloveso | výskytů | textů | příklad |\n|---|---|---|---|');
for (const k of NASE) console.log('| ' + k + ' | ' + (pocty[k] || 0) + ' | ' + (dokumenty[k] ? dokumenty[k].size : 0) + ' | ' + ((priklady[k] || [])[0] || '') + ' |');

// Rozbor pokusu ask_oblast.js: pojistka, ozvěna otázky, převyprávění čtení, podoba oblasti v odpovědi, délka, začátek odpovědi.
'use strict';
const fs = require('fs');
const V = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const src = fs.readFileSync('C:/Users/zkuku/runar-eval/audit-2026-10-07/cteni.json', 'utf8');
const C = JSON.parse(src.slice(src.search(/[\[{]/)));
const CT = { Raidho: '8dce4954', Perth: '779b3d33', Algiz: 'cb4f2614' };
const textCteni = (runa) => String(C.find((c) => c.id.indexOf(CT[runa]) === 0).short_text).split(/\n?\s*✦/)[0];
const sl = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean);
const STOP = new Set('the a an of in on to this that is are be what does do my me i you your it its how why with for about and or not no as at by from into than then there their they them may might could would can will one which who where when here now just only also still so but more some any each both'.split(' '));
const POJ = /\b(does not|doesn't|do not|cannot|can't) (say|show|tell|settle|decide|promise|name|answer)\b|\bleaves? (it|that|this|the [a-z]+|room)? ?(open|unsaid|unanswered)\b|\bnot an? (promise|verdict|sign|answer|prediction)\b/i;
const PODOBA = { Raidho: /\bpace\b/i, Perth: /\b(skill|practi[cs]e)\b/i, Algiz: /\b(eyes|seen|see you|sees you)\b/i };
const sk = {};
for (const x of V) {
  const a = sl(x.text), ct = new Set(sl(textCteni(x.runa)).filter((w) => !STOP.has(w)));
  const obs = a.filter((w) => !STOP.has(w));
  const podil = obs.length ? obs.filter((w) => ct.has(w)).length / obs.length : 0;
  const q = sl(x.otazka.replace(/^[^—]+—/, '')); let ozv = '';
  for (let i = 0; i + 3 <= q.length && !ozv; i++) { const g = q.slice(i, i + 3); if (g.some((w) => !STOP.has(w)) && (' ' + a.join(' ') + ' ').indexOf(' ' + g.join(' ') + ' ') !== -1) ozv = g.join(' '); }
  const g = sk[x.v] = sk[x.v] || { n: 0, poj: 0, ozv: 0, podil: 0, podoba: 0, slov: 0, zac: {} };
  g.n++; if (POJ.test(x.text)) g.poj++; if (ozv) g.ozv++; g.podil += podil; if (PODOBA[x.runa].test(x.text)) g.podoba++; g.slov += a.length;
  const z = a.slice(0, 3).join(' ').replace(new RegExp('\\b' + x.runa.toLowerCase() + '\\b'), '[runa]'); g.zac[z] = (g.zac[z] || 0) + 1;
}
console.log('varianta       n  pojistka  ozvěna otázky  podoba v odpovědi  slova ze čtení  ø slov  nejčastější začátek');
for (const [k, g] of Object.entries(sk)) {
  const zac = Object.entries(g.zac).sort((a, b) => b[1] - a[1])[0];
  console.log(k.padEnd(13) + String(g.n).padStart(3) + String(g.poj + '/' + g.n).padStart(9) + String(g.ozv + '/' + g.n).padStart(14) + String(g.podoba + '/' + g.n).padStart(18)
    + (g.podil / g.n).toFixed(2).padStart(16) + (g.slov / g.n).toFixed(0).padStart(8) + '   „' + zac[0] + '…“ ' + zac[1] + '×');
}
if (process.argv[3]) {
  for (const x of V.filter((y) => y.runa === process.argv[3])) console.log('\n— ' + x.v + ' · ' + x.otazka + '\n  ' + x.text.replace(/\s+/g, ' '));
}

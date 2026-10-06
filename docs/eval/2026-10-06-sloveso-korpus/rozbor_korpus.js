// CODE-tune 2026-10-06 — rozbor test_korpus.jsonl: použil sol vylosované sloveso hned za jménem runy? node rozbor_korpus.js
'use strict';
const fs = require('fs'), path = require('path');
const L = fs.readFileSync(path.join(__dirname, 'test_korpus.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let ok = 0, means_klauze = 0, slovo = 0, slov = 0, cena = 0;
const poRamenech = {}, poSlovesech = {};
for (const x of L) {
  const re = new RegExp('\\b' + esc(x.runa) + '\\s+' + esc(x.sloveso).replace(/ /g, '\\s+') + '\\b', 'i');
  const hit = re.test(x.telo);
  if (hit) ok++;
  (poRamenech[x.rameno] = poRamenech[x.rameno] || [0, 0])[1]++; if (hit) poRamenech[x.rameno][0]++;
  (poSlovesech[x.sloveso] = poSlovesech[x.sloveso] || [0, 0])[1]++; if (hit) poSlovesech[x.sloveso][0]++;
  // „X means disruption can stop…“ = význam „means that“, ne pojmenování runy
  if (x.sloveso === 'means' && new RegExp('\\b' + x.runa + '\\s+means\\s+\\w+\\s+(can|is|are|may|will|has|does)\\b', 'i').test(x.telo)) means_klauze++;
  if (new RegExp('\\b' + esc(x.aspekt) + '\\b', 'i').test(x.telo)) slovo++;
  slov += (x.telo.match(/[A-Za-z’'-]+/g) || []).length;
  cena += x.usage.prompt_tokens * 2e-6 + x.usage.completion_tokens * 1e-5;
}
console.log('vylosované sloveso hned za jménem runy: ' + ok + '/' + L.length);
console.log('po rámcích: ' + Object.entries(poRamenech).map(([k, [a, n]]) => k + ' ' + a + '/' + n).join(' · '));
console.log('po slovesech: ' + Object.entries(poSlovesech).map(([k, [a, n]]) => k + ' ' + a + '/' + n).join(' · '));
console.log('„means“ ve smyslu „means that“ (věta za ním): ' + means_klauze + '/' + (poSlovesech.means || [0, 0])[1]);
console.log('holé slovo aspektu v textu: ' + slovo + '/' + L.length + ' · slov průměr ' + (slov / L.length).toFixed(1) + ' · cena $' + cena.toFixed(3));

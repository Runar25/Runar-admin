// Lab 2026-11-16: vyhodnotí úhlovou zkoušku (soudce_uhly.json) — kolik ze šesti úhlů otevření má v obraze o co se opřít,
// jestli věta řekne závěr sama, jestli je známá ze života a pravdivá. Soudce runy neviděl.
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, J = (f) => JSON.parse(fs.readFileSync(path.join(H, f), 'utf8'));
const P = J('soudce_uhly.json'), K = J('klic.json'); const o = {}; K.forEach((k) => { o[k.id] = k; });
const radky = P.map((p) => ({ runa: o[p.id].runa, obraz: o[p.id].obraz, uhlu: p.angles.filter((a) => a === 'y').length, angles: p.angles.join(''),
  rekne: /^yes/i.test(p.says_it_all), znamy: p.own_case, pravda: p.true, otevrene: p.left_open }));
const po = [0, 0, 0, 0, 0, 0]; P.forEach((p) => p.angles.forEach((a, i) => { if (a === 'y') po[i]++; }));
console.log('úhly 1–6, kolik obrazů z', P.length, 'je unese:', po.join(' · '));
const hist = {}; radky.forEach((r) => { hist[r.uhlu] = (hist[r.uhlu] || 0) + 1; }); console.log('počet unesených úhlů → obrazů:', JSON.stringify(hist));
console.log('\nMÁLO ÚHLŮ (≤3):'); radky.filter((r) => r.uhlu <= 3).forEach((r) => console.log(' ' + r.uhlu + ' [' + r.angles + '] ' + r.runa + ': ' + r.obraz));
console.log('\nŘEKNE ZÁVĚR SAMA:'); radky.filter((r) => r.rekne).forEach((r) => console.log(' ' + r.runa + ': ' + r.obraz));
console.log('\nNEZNÁMÉ ZE ŽIVOTA:'); radky.filter((r) => /^no/i.test(r.znamy)).forEach((r) => console.log(' ' + r.runa + ': ' + r.obraz + ' :: ' + r.znamy.slice(0, 110)));
console.log('\nNEPRAVDIVÉ:'); radky.filter((r) => /^no/i.test(r.pravda)).forEach((r) => console.log(' ' + r.runa + ': ' + r.obraz + ' :: ' + r.pravda.slice(0, 140)));
fs.writeFileSync(path.join(H, 'uhly_vysledek.json'), JSON.stringify(radky, null, 1));

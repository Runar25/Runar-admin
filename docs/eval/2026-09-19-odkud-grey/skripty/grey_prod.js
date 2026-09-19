// Kde se bere "grey": produkční čtení ownera (od 2026-08-01) po verzích promptu + co šedá popisuje.
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8');
t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows;
const GREY = /\b(gr[ae]y(?:er|est|ing|ness)?|grey-\w+|gr[aá](?:r|tt|u|um|ir|a|an|ri|ar)?)\b/i;
const EN = rows.filter(r => r.lang !== 'is');
const byV = {};
for (const r of EN) {
  const v = r.prompt_version || '(bez verze)';
  byV[v] = byV[v] || { n: 0, g: 0, first: r.drawn_at.slice(0, 10) };
  byV[v].n++;
  if (/\bgr[ae]y/i.test(r.txt || '')) byV[v].g++;
}
console.log('EN čtení ownera od 2026-08-01: ' + EN.length + ' (IS ' + (rows.length - EN.length) + ')');
for (const [v, x] of Object.entries(byV)) console.log('  ' + v.padEnd(16) + ' od ' + x.first + '  grey ' + x.g + '/' + x.n);
const g = EN.filter(r => /\bgr[ae]y/i.test(r.txt || ''));
console.log('\nCo šedá popisuje (všechna produkční EN čtení s grey):');
for (const r of g) {
  const m = r.txt.match(/[^.,;—]*\bgr[ae]y\b[^.,;—]*/gi) || [];
  let d = {}; try { d = JSON.parse(r.draws || '{}'); } catch (e) {}
  console.log('  ' + r.drawn_at.slice(0, 10) + ' ' + (r.rune_name || '').padEnd(8) + ' ' + (r.prompt_version || '').padEnd(14) + ' obraz: ' + String(d.image || '').slice(0, 60));
  m.forEach(s => console.log('        » ' + s.trim()));
}
// Ask odpovědi s grey
let askG = 0, askN = 0;
for (const r of EN) { let fu = []; try { fu = JSON.parse(r.fu || '[]') || []; } catch (e) {} for (const f of fu) { askN++; if (/\bgr[ae]y/i.test(f.a || '')) askG++; } }
console.log('\nAsk odpovědi s grey: ' + askG + '/' + askN);
// poslední Isa
const isa = rows.filter(r => r.rune_name === 'Isa').slice(-1)[0];
console.log('\nPOSLEDNÍ ISA: ' + isa.id + ' ' + isa.drawn_at + ' ' + isa.lang + ' ' + isa.prompt_version + '\n  draws ' + isa.draws + '\n  text: ' + isa.txt + '\n  follow_up: ' + isa.fu);
const raid = rows.filter(r => r.rune_name === 'Raidho').slice(-1)[0];
console.log('\nPOSLEDNÍ RAIDHO: ' + raid.id + ' ' + raid.drawn_at + ' ' + raid.prompt_version + '\n  draws ' + raid.draws + '\n  text: ' + raid.txt + '\n  follow_up: ' + raid.fu);
console.log('\nposledních 12 čtení: ');
rows.slice(-12).forEach(r => console.log('  ' + r.drawn_at.slice(0, 16) + ' ' + (r.rune_name || '').padEnd(9) + ' ' + (r.prompt_version || '').padEnd(14) + ' ' + (r.txt || '').slice(0, 70)));

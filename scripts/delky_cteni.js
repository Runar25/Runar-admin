// Průměrná délka čtení — počítá se z DB, nikam se nezapisuje (§20: číslo vlastní data, ne doc).
// Použití:  node scripts/delky_cteni.js <export.json>
// Export: supabase db query --linked "select lang, rune_name, prompt_version,
//   coalesce(nullif(deep_text,''), short_text) as txt from readings" > export.json
// Vypíše: počet slov (průměr/medián/min/max) po verzích promptu a celkem; Single EN, spready vynechá.
'use strict';
const fs = require('fs');
const soubor = process.argv[2];
if (!soubor) { console.error('chybí cesta k exportu z DB'); process.exit(1); }
let t = fs.readFileSync(soubor, 'utf8');
t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows.filter(r => r.lang !== 'is' && !/NORNS|KRIZ|HORSE|YGG/.test(r.rune_name || ''));
const slov = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const podle = {};
for (const r of rows) (podle[r.prompt_version || '?'] = podle[r.prompt_version || '?'] || []).push(slov(r.txt));
const shrn = a => { const s = a.slice().sort((x, y) => x - y); return 'n=' + s.length + ' · průměr ' + Math.round(s.reduce((x, y) => x + y, 0) / s.length) + ' · medián ' + s[Math.floor(s.length / 2)] + ' · min ' + s[0] + ' max ' + s[s.length - 1]; };
for (const k of Object.keys(podle).sort()) console.log(k.padEnd(20) + shrn(podle[k]));
console.log('CELKEM Single EN'.padEnd(20) + shrn(rows.map(r => slov(r.txt))));

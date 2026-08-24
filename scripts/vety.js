// vety.js — rozseká čtení na ČÍSLOVANÉ věty a vypíše je.
// DŮVOD (2026-08-24): tvrdil jsem "věta 4 je Eihwaz a je v pořádku", aniž bych se na ni
// podíval — a předtím "Isa se nesmí prochladit" o téže větě. Dvakrát v jedné analýze jsem
// mluvil o rozdělení vět zpaměti. Tvrzení "věta N dělá X" se od teď píše proti TOMUHLE
// výpisu, ne proti dojmu z odstavce. Rozšíření [[measure-dont-eyeball]] na prózu.
//   node scripts/vety.js <soubor.json|soubor.txt> [pole]     (default pole: deep_text)
'use strict';
const fs = require('fs');
const arg = process.argv[2], pole = process.argv[3] || 'deep_text';
if (!arg) { console.error('pouziti: node scripts/vety.js <soubor> [pole]'); process.exit(2); }
let txt = fs.readFileSync(arg, 'utf8');
if (arg.endsWith('.json')) {
  const o = JSON.parse(txt);
  txt = o[pole] || o.short_text || '';
  if (!txt) { console.error('pole "' + pole + '" je prazdne'); process.exit(2); }
}
// Dělič: tečka/otazník/vykřičník + mezera + velké písmeno (vč. islandských).
const vety = txt.trim().split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÝÞÆÖÐ])/).filter(s => s.trim());
console.log('celkem vet: ' + vety.length + '   znaku: ' + txt.trim().length + '\n');
vety.forEach((v, i) => {
  console.log('[' + (i + 1) + '] (' + v.length + ' zn)');
  console.log('    ' + v.trim() + '\n');
});

// ㊓ ANATOMIE PROMPTU — každý řádek každého promptu (9 druhů čtení × EN/IS × prázdný i vyplněný vstup) patří označenému kusu (_kus,
// runar-character.js) a text rozboru = text builderu; doplňky appky (myšlenka ✦, připomínka délky) skládá anatomie jako runar-reading.js.
// Proč (2026-10-22, owner: „vědět přesně, z čeho se skládá čtení … ne hádat“): řádek přidaný do builderu bez _kus by z anatomie, receptu
// čtení i skladače ve shrine tiše vypadl — rozbor by lhal o tom, co model dostal. Samotná logika je v anatomie_promptu.js (--test).
//   node scripts/verify_anatomie_promptu.js
'use strict';
if (process.argv.indexOf('--test') === -1) process.argv.push('--test');
require('./anatomie_promptu.js');

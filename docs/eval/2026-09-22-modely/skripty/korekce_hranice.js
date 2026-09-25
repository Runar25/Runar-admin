// CODE-read 2026-09-23 — seed-and-assert (§19.1): radky z DB → produkcni normalizeCorrections → getCorrPrompt.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const V2 = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const cut = (f, a, b) => { const s = fs.readFileSync(V2 + f, 'utf8'); const i = s.indexOf(a); return s.slice(i, s.indexOf(b, i)); };
// Pozor: vyrez konci radkovym komentarem — bez NL by ho „;return" spolkl (a vratil undefined).
const NL = String.fromCharCode(10);
const norm = new Function(cut('runar-utils.js', 'function normalizeCorrections', NL + 'function ') + NL + ';return normalizeCorrections;')();
const gcp = new Function(cut('runar-character.js', 'function getCorrPrompt', '// ─── SEGMENT PARSER') + ';return getCorrPrompt;')();
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'korekce-db.json'), 'utf8')).rows;
const C = norm(rows); fs.writeFileSync(path.join(__dirname, 'korekce-norm.json'), JSON.stringify(C, null, 1));
const IS = gcp('is', C), EN = gcp('en', C);
const ok = (c, m) => { console.log((c ? 'OK   ' : 'CHYBA') + ' ' + m); if (!c) process.exitCode = 1; };
ok(IS.includes('- ekki "rúnan" heldur "rúnin"'), 'IS: rúnan → rúnin');
ok(IS.includes('- ekki "tóm blað" heldur "tómt blað" (blað er hvorugkyn)'), 'IS: tóm blað → tómt blað (blað er hvorugkyn)');
ok(!IS.includes('réttir þér'), 'IS: dlouha veta Auða rúnan pryc');
ok(IS.includes('- ekki "loftins" heldur "loftsins"\n') && !IS.includes('er ekki til'), 'IS: loftins bez vysvetlivky, zadne „er ekki til"');
ok(IS.includes('(„flýja“ stýrir þolfalli)'), 'IS: flýja zkracene');
ok(IS.includes('fyrsta ljós vorunnar') && !EN.includes('fyrsta ljós'), 'fyrsta ljós: IS ano, EN ne');
ok(!/undefined|null/.test(IS + EN), 'zadne undefined/null');
console.log('IS radku ' + (IS.split('\n').length - 2) + ' · znaku ' + IS.length + ' | EN radku ' + (EN.split('\n').length - 2) + ' · ' + JSON.stringify(EN));

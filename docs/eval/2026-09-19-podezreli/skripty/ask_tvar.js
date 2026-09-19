// Produkční Asky ownera: tvrzení o nitru vs možnosti vs pojistka. Hrubé regexy — ukázky vypsány k ruční kontrole.
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8'); t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows;
const TVRZ = /\b(what you (?:\w+ )?(?:wait|want|need|fear|seek|hold|carry|long)\w*(?: for)? (?:is|are)\b|you are (?:waiting|holding|afraid|ready|carrying|still)\b|you have (?:set|kept|been holding|been waiting)\b|part of you\b|inside you\b)/i;
const MOZ = /\b(it could be|it may be|it might be|could be|may be|might be|perhaps)\b/i;
const POJ = /\b(only you can|yours to (?:say|name|decide|know)|I cannot (?:tell|see|say)|the rune(?:s)? (?:does|do) not (?:say|name|tell))\b/i;
let n = 0, tv = 0, mo = 0, po = 0; const uk = [];
for (const r of rows) { let fu = []; try { fu = JSON.parse(r.fu || '[]') || []; } catch (e) {} for (const f of fu) { const a = f.a || ''; if (!a) continue; n++;
  if (TVRZ.test(a)) { tv++; uk.push(r.rune_name + ': ' + (a.match(new RegExp('[^.]*' + TVRZ.source + '[^.]*\.', 'i')) || [''])[0].trim().slice(0, 130)); }
  if (MOZ.test(a)) mo++; if (POJ.test(a)) po++; } }
console.log('produkční Asky ownera: ' + n + ' · tvrzení o nitru ' + tv + ' · možnosti ' + mo + ' · pojistka ' + po);
uk.forEach(u => console.log('  » ' + u));

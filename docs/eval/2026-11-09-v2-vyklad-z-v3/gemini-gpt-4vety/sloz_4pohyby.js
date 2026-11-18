// Lab 2026-11-18: čtyři pohyby (IMAGE → MEANING → LANDING → OPENING) podle Gemini a GPT, bez definice runy (owner „5. … chtěl bych zkusit
// čtení bez té definice … chci vidět čtení od SOL“ · „7. … úplně mi stačí 3 čtení“ · „9. určitě, jak řekl gemini“).
// Systém = produkce. Z produkčního zadání v2 se berou losy a vstupy (runa + slovo významu, záměr/čas, úhel otevření, podoba oblasti,
// řádek hledání, NO COLD READING); bloky THE IMAGE, ESSENCE LINE, délka, konec a jméno runy se nahradí čtyřmi pohyby.
// Bez vzorového výkladu a bez povinného „yet“ (rozbor README.md oddíl 4). Obraz z úlohy (kolo 4 napětí / banka). Nic nevolá.
// Úloha: { id, runa, seed, area, seeking, intention, obraz, fokus, strana }
'use strict';
const { postav: v2 } = require('./vypis_v2.js');
const KONCE = {   // funkce konce podle hledání (GPT bod 4, Gemini rizika); Confirmation drží kánon „neither confirm nor refute“
  'General Guidance': 'open, as a question, what may deserve attention now',
  'Clarity': 'draw, as a question, a distinction between two things that are easily mistaken for each other',
  'Confirmation': 'neither confirm nor refute; name what the reading has made visible, without certainty',
  'Insight into Challenge': 'ask where the friction actually sits, without softening it',
  'Reflection': 'ask one question about what may have gone unnoticed',
};
function najdi(p, re, co) { const m = p.match(re); if (!m) throw new Error('v produkčním zadání chybí ' + co); return m; }
function postav(u) {
  const x = v2(u), p = x.p, R = u.runa;
  const ucel = najdi(p, /^READING PURPOSE: .+$/m, 'READING PURPOSE')[0];
  const uhel = najdi(p, /^READING ANGLE .+$/m, 'READING ANGLE')[0];
  const plocha = najdi(p, /let the image you were given land on (.+?)\. /, 'podoba oblasti')[1];
  const nocold = najdi(p, /^NO COLD READING: .+$/m, 'NO COLD READING')[0];
  const konec = KONCE[u.seeking]; if (!konec) throw new Error('neznámé hledání ' + u.seeking);
  x.p = 'DRAWN RUNE: ' + R + ' — focus on: ' + u.fokus + '\n' + ucel + '\n' + uhel + '\n' +
    'THE SIDE OF ' + R.toUpperCase() + ' THIS PICTURE CARRIES (your source, not words to repeat): ' + u.strana + '\n' +
    'THE PICTURE: ' + u.obraz + '\n\n' +
    'Write the reading as four sentences, each with its own work, each adding something the others do not:\n' +
    '1. IMAGE — the picture, seen your own way, down to one detail the sentence does not name. The tension it holds stays inside the scene; do not explain it.\n' +
    '2. MEANING — what the picture reveals about human experience: the side of ' + R + ' it carries, as something that would not be true of another rune. Not a definition, and not the picture said again.\n' +
    '3. LANDING — bring that meaning to ' + plocha + ': a possibility, a tension, or two sides of it, without saying what is true in their life and without advice. Do not list the choices they made.\n' +
    '4. OPENING — ' + konec + '. Let it grow out of the first three sentences and leave the answer with them.\n\n' +
    'Do not name or define the rune — no "' + R + ' is", "stands for", "represents", "the rune of"; the seeker already sees which rune was drawn.\n' +
    nocold + '\n' +
    'One paragraph, 50 to 65 words, read aloud. No advice: no "should", "must", "try", "need to".\n' +
    'Output format — return ONLY this JSON array, nothing before or after: [{"rune": "(the rune name)", "text": "(the reading, one paragraph)"}]';
  x.draws = Object.assign({}, x.draws, { image: u.obraz, kws: u.fokus });
  return x;
}
module.exports = { postav };
if (require.main === module) {
  for (const u of require('./ulohy.json')) { const x = postav(u); console.log('==== ' + u.id + '\n' + x.p + '\n'); }
}

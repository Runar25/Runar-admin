// Lab v3 bez obrazu (owner 2026-11-17: „v3 bude teď úplně bez obrazu … první věta je popis, co je runa, jak říká Gemini … napětí, cesta,
// otázka“ · u rozcestí „nabídnout rozcestník … to, že si má vybrat sám, mu říkat nemusíme“). BACKLOG 12 a 13.
// Systém = produkce beze změny (buildSysPrompt přes ../zkouska-1114/sloz1114.js). Zadání: popis runy, jedno napětí a cesta z gebo-data.json
// vylosované seedem; s oblastí Crossroads dvě cesty jako rozcestník. Žádný obraz, žádná stránka banky. Nic nevolá.
// Úloha: { id, runa, seed, oblast: '' | 'Crossroads & Decisions' }
'use strict';
const fs = require('fs'), path = require('path');
const zaklad = require('../zkouska-1114/sloz1114.js');
const G = JSON.parse(fs.readFileSync(path.join(__dirname, 'gebo-data.json'), 'utf8'));
function los(seed) { let s = seed % 2147483647; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const vyber = (r, a) => a[Math.floor(r() * a.length)];
function postav(u) {
  if (u.runa !== 'Gebo') throw new Error('data jsou jen pro Gebo');
  const x = zaklad.postav({ id: u.id, runa: u.runa, seed: u.seed });   // jen kvůli produkčnímu systému
  const r = los(u.seed); r(); r();   // první čísla LCG z malého seedu jsou si blízko
  const rozcesti = u.oblast === 'Crossroads & Decisions';
  const popis = vyber(r, G.popis), nap = vyber(r, G.napeti);
  const cesty = rozcesti ? nap.cesty.map((k) => G.cesty[k]) : [G.cesty[vyber(r, nap.cesty)]];
  const R = u.runa;
  let p = '# TASK\nWrite one rune reading, as Rúnar speaking to the seeker. It will be read aloud.\n' +
    'It contains no scene: no place, weather, object or animal. It speaks about the rune and about where the seeker stands.\n\n' +
    '# THE RUNE\nRune: ' + R + '\nWhat ' + R + ' is (your source; say it in your own words): ' + popis.t + '\n' +
    'The tension ' + R + ' holds in this reading: ' + nap.t + '.\n' +
    (rozcesti ? 'The two ways ' + R + ' opens here: ' + cesty.map((c, i) => (i + 1) + ') ' + c.t).join(' · ') + '.\n\n'
              : 'The way ' + R + ' opens here: ' + cesty[0].t + '.\n\n') +
    (rozcesti ? '# WHERE THE SEEKER STANDS\nThe seeker chose the area Crossroads & Decisions: they stand before a choice. You may say that plainly; it is theirs, not a guess.\n\n' : '') +
    '# HOW TO WRITE IT\nFour sentences, in this order:\n' +
    '1. Begin "' + R + ' is" and say what the rune is, in plain words a stranger to runes would grasp.\n' +
    '2. Say the tension as something ' + R + ' holds' + (rozcesti ? ' at a crossroads like this' : '') + ', not as something the seeker feels.\n' +
    (rozcesti ? '3. Set the two ways side by side, like a signpost: what each way is and what it asks. Prefer neither, and do not say the choice is theirs.\n'
              : '3. Say what the way is and what it asks. Do not tell the seeker to take it: no "you could", no "try", no "you should".\n') +
    '4. One question that brings ' + (rozcesti ? 'those ways' : 'that way') + ' into the seeker\'s own life.\n\n' +
    '# WHAT STAYS OPEN\nYou do not know this person. Never say what they feel, what is true inside them, or what will happen.\n\n' +
    '# OUTPUT\nFour short sentences, ' + (rozcesti ? '55 to 70' : '50 to 60') + ' words in all, one paragraph. Name ' + R + ' only in the first sentence.\n' +
    'Return only this JSON array: [{"rune": "(the rune name)", "text": "(the reading, one paragraph)"}]';
  x.p = p;
  x.draws = { image: null, popis: popis.t, napeti: nap.id, cesty: rozcesti ? nap.cesty : [Object.keys(G.cesty).find((k) => G.cesty[k] === cesty[0])] };
  return x;
}
module.exports = { postav };
if (require.main === module) {
  for (const u of JSON.parse(fs.readFileSync(path.join(__dirname, 'ulohy.json'), 'utf8'))) {
    const x = postav(u); console.log(u.id, '|', x.draws.napeti, x.draws.cesty.join('+'), '|', x.draws.popis.slice(0, 50));
    if (process.argv.includes('--cely')) console.log(x.p + '\n');
  }
}

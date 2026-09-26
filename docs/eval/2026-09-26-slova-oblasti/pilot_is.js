// CODE-read 2026-09-26 (owner: „ty islandské věci udělej tak, aby to bylo co nejlepší"): islandština na Opus 5 jako claude-proxy.
// Test E (esence): produkční IS rámec [1] (EP) × IS znění N3 (E3), 6 obrazů s vlastním aktérem.
// Test U (úhel [0]): produkční „Líttu fyrst snöggt…" (UP) × „Byrjaðu á því að renna augunum…" (UN), esence [0], tytéž obrazy.
'use strict';
const fs = require('fs'), path = require('path'), stav = require('./stav.js');
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const E3 = 'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína sem nefnir rúnina einu sinni og dregur fram þá merkingu sem þegar býr í þessari mynd, með hversdagslegum orðum sem ókunnugur skilur. Hún finnur sitt eigið form í stað skilgreiningar. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.';
const UN = 'Byrjaðu á því að renna augunum yfir alla myndina og staldra svo við eitt atriði.';
const OBRAZY = [
  ['Hagalaz', 'In the night the gale tore the old fence down', 'Crossroads & Decisions', 'Reflection', 1],
  ['Kenaz', 'The shavings curl away from the blade', 'Career & Creativity', 'Reflection', 3],
  ['Jera', 'The sweater you knitted all winter is finally finished', 'Inner Growth', 'Clarity', 0],
  ['Nauthiz', 'You keep knitting though the yarn is almost out', 'Healing & Wellbeing', 'Insight into Challenge', 2],
  ['Ansuz', 'Someone calls your name across the crowd', 'Love & Relationships', 'Confirmation', 5],
  ['Gebo', 'One hand holds something out, and the other receives it', 'Love & Relationships', 'General Guidance', 6],
];
const OUT = path.join(__dirname, 'pilot_is.jsonl');
async function volej(sys, user) {
  const body = { model: 'claude-opus-5', max_tokens: 700, thinking: { type: 'disabled' }, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j));
  const t = j.content.filter(c => c.type === 'text').map(c => c.text).join('');
  let text = t; try { text = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
  return { text, usage: j.usage };
}
(async () => {
  fs.writeFileSync(OUT, '');
  const ramena = [['EP', o => Object.assign(o, { essence: 1 }), 'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína sem nefnir rúnina einu sinni og segir hvað hún er'],
                  ['E3', o => Object.assign(o, { essenceText: E3 }), E3],
                  ['UP', o => Object.assign(o, { angle: 0, essence: 0 }), 'Líttu fyrst snöggt yfir alla myndina'],
                  ['UN', o => Object.assign(o, { angleText: UN, essence: 0 }), UN]];
  for (const [arm, f, musi] of ramena) for (const [runa, img, area, seek, angle] of OBRAZY) {
    const o = f({ lang: 'is', rune: runa, area, seeking: seek, image: img, angle, face: 0 });
    const p = stav(o);
    if (!p.user.includes(musi)) throw new Error(arm + ': pokyn neni v promptu');
    if (!/Endaðu á/.test(p.user)) throw new Error('konec chybi');
    const r = await volej(p.sys, p.user);
    fs.appendFileSync(OUT, JSON.stringify({ runa, img, arm, text: r.text, usage: r.usage }) + '\n');
    console.log(arm, runa.padEnd(8), '|', r.text);
  }
})();
